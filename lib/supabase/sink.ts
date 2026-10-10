import 'server-only';

import { applicationContentHash } from '@/lib/applications/fingerprint';
import { TtlLru, type TtlLruOptions } from '@/lib/applications/idempotency';
import { createReference, referenceForKey } from '@/lib/applications/reference';
import type { ApplicationSink, SinkFailureReason, SinkFollowUpResult, SinkSubmitResult } from '@/lib/applications/sink';
import type { NormalizedApplication, NormalizedFollowUp } from '@/lib/applications/types';
import { dispatchApplicationEmails, dispatchApplicationFollowUpEmail } from '@/lib/email';
import { toFollowUpPayload, toSubmitApplicationPayload } from './payload';
import type { IntakeRpc, RpcErrorKind } from './rpc';
import type { CircuitBreaker } from './service';

/**
 * SupabaseSink (ROADMAP §8, Phase 2b): speichert jede Bewerbung über rpc_submit_application in der
 * Datenbank und schickt danach dieselben Mails wie der EmailSink (gleiche Resend-Keys). Die
 * Team-Mail bleibt das Erfolgskriterium, solange es kein Cockpit gibt: Ohne sie weiß das Team
 * nichts von der Bewerbung.
 *
 * - Die Datenbank vergibt bzw. bestätigt die Nummer: Eine Wiederholung mit demselben
 *   Idempotency-Key bekommt die gespeicherte Nummer zurück (auch auf einer anderen Instanz).
 * - Fällt die Datenbank aus (Netz, Zeitlimit, Key, fehlende Funktion, abgelehnte Daten), geht die
 *   vollständige Bewerbung als Not-E-Mail ans Team (fallback = EmailSink). Scheitert auch die,
 *   antwortet die API mit 503 statt mit einem Scheinerfolg.
 * - Ergänzungen zu Bewerbungen, die nicht in der Datenbank stehen (aus der E-Mail-Zeit oder per
 *   Not-E-Mail), gehen nur per Mail.
 * - Die Zeilen in private.outbox bleiben in Phase 2b auf „pending“: Next versendet selbst. Wer in
 *   2c einen Outbox-Worker einschaltet, muss diese Altzeilen vorher abschließen (ROADMAP §8).
 */

export interface SupabaseSinkOptions extends TtlLruOptions {
  rpc: IntakeRpc;
  breaker: CircuitBreaker;
  /** Not-E-Mail bei Datenbankausfall (EmailSink mit demselben Idempotenz-Verhalten). */
  fallback: ApplicationSink;
}

function mailFailure(error: string | undefined): SinkFailureReason {
  return error === 'not_configured' ? 'not_configured' : 'failed';
}

/** Nur echte Ausfälle zählen für den Circuit Breaker, nicht abgelehnte Daten. */
const isOutage = (kind: RpcErrorKind) => kind === 'unavailable' || kind === 'misconfigured';

export class SupabaseSink implements ApplicationSink {
  /** `${key}:${Inhalts-Hash}` → Nummer, nach zugestellter Team-Mail (wie der EmailSink, je Instanz 24 h). */
  private readonly delivered: TtlLru<string>;
  private readonly followUpsDelivered: TtlLru<true>;
  private readonly inflight = new Map<string, Promise<SinkSubmitResult>>();
  private readonly inflightFollowUps = new Map<string, Promise<SinkFollowUpResult>>();
  private readonly rpc: IntakeRpc;
  private readonly breaker: CircuitBreaker;
  private readonly fallback: ApplicationSink;

  constructor({ rpc, breaker, fallback, ...cache }: SupabaseSinkOptions) {
    this.delivered = new TtlLru<string>(cache);
    this.followUpsDelivered = new TtlLru<true>(cache);
    this.rpc = rpc;
    this.breaker = breaker;
    this.fallback = fallback;
  }

  submit(app: NormalizedApplication): Promise<SinkSubmitResult> {
    const content = applicationContentHash(app);
    const flight = `${app.idempotencyKey}:${content}`;
    const known = this.delivered.get(flight);
    if (known) return Promise.resolve({ ok: true, reference: known, duplicate: true });

    const running = this.inflight.get(flight);
    if (running) return running;

    const delivery = this.store(app, content, flight).finally(() => this.inflight.delete(flight));
    this.inflight.set(flight, delivery);
    return delivery;
  }

  private async store(app: NormalizedApplication, content: string, flight: string): Promise<SinkSubmitResult> {
    if (this.breaker.isOpen()) return this.emergency(app, 'circuit_open');

    let reference = referenceForKey(app.idempotencyKey, app.submittedAt);
    let result = await this.rpc.submitApplication(toSubmitApplicationPayload({ ...app, reference }, content));
    if (!result.ok && result.kind === 'reference_conflict') {
      // Praktisch ausgeschlossen (HMAC, 31^6); dann einmal mit einer Zufallsnummer.
      reference = createReference(app.submittedAt);
      result = await this.rpc.submitApplication(toSubmitApplicationPayload({ ...app, reference }, content));
    }

    if (!result.ok) {
      if (isOutage(result.kind)) this.breaker.recordFailure();
      return this.emergency(app, result.kind, result.code ?? String(result.status));
    }
    this.breaker.recordSuccess();

    const stored = result.data;
    const mail = await dispatchApplicationEmails(
      { ...app, reference: stored.reference },
      { idempotencyKey: `bewerbung:${app.idempotencyKey}` },
    );
    if (!mail.success) {
      // Gespeichert, aber das Team weiß noch nichts: Fehler melden, damit der Browser es erneut
      // versucht. Die Wiederholung bekommt dieselbe Nummer (duplicate) und schickt die Mail erneut.
      console.error(`[bewerbung] gespeichert ${stored.reference}, Team-Mail nicht zugestellt (${mail.teamNotification.error ?? 'unbekannt'})`);
      return { ok: false, reason: mailFailure(mail.teamNotification.error) };
    }

    this.delivered.set(flight, stored.reference);
    return stored.duplicate || mail.teamNotification.duplicate
      ? { ok: true, reference: stored.reference, duplicate: true }
      : { ok: true, reference: stored.reference };
  }

  private async emergency(app: NormalizedApplication, kind: string, code?: string): Promise<SinkSubmitResult> {
    console.error(`[bewerbung] Datenbank: ${kind}${code ? ` (${code})` : ''} – Not-E-Mail ans Team`);
    const result = await this.fallback.submit(app);
    if (result.ok) return result;
    console.error(`[bewerbung] Not-E-Mail fehlgeschlagen (${result.reason})`);
    return { ok: false, reason: result.reason === 'not_configured' ? 'not_configured' : 'unavailable' };
  }

  followUp(followUp: NormalizedFollowUp): Promise<SinkFollowUpResult> {
    const key = followUp.idempotencyKey;
    if (this.followUpsDelivered.get(key)) return Promise.resolve({ ok: true, duplicate: true });

    const running = this.inflightFollowUps.get(key);
    if (running) return running;

    const delivery = this.storeFollowUp(followUp).finally(() => this.inflightFollowUps.delete(key));
    this.inflightFollowUps.set(key, delivery);
    return delivery;
  }

  private async storeFollowUp(followUp: NormalizedFollowUp): Promise<SinkFollowUpResult> {
    if (this.breaker.isOpen()) return this.followUpByMail(followUp, 'circuit_open');

    const result = await this.rpc.submitFollowUp(toFollowUpPayload(followUp));
    if (!result.ok) {
      if (result.kind === 'follow_up_limit') return { ok: false, reason: 'limited' };
      if (isOutage(result.kind)) this.breaker.recordFailure();
      return this.followUpByMail(followUp, result.kind);
    }
    this.breaker.recordSuccess();

    const mail = await dispatchApplicationFollowUpEmail(followUp, { idempotencyKey: `ergaenzung:${followUp.idempotencyKey}` });
    if (!mail.success) return { ok: false, reason: mailFailure(mail.error) };

    this.followUpsDelivered.set(followUp.idempotencyKey, true);
    return result.data.duplicate || mail.duplicate ? { ok: true, duplicate: true } : { ok: true };
  }

  private async followUpByMail(followUp: NormalizedFollowUp, kind: string): Promise<SinkFollowUpResult> {
    // not_found ist erwartbar: Bewerbung aus der E-Mail-Zeit oder per Not-E-Mail eingegangen.
    if (kind === 'not_found') console.info('[bewerbung/ergaenzung] Bewerbung nicht in der Datenbank – nur per E-Mail');
    else console.error(`[bewerbung/ergaenzung] Datenbank: ${kind} – nur per E-Mail`);
    const result = await this.fallback.followUp(followUp);
    if (result.ok) return result;
    return { ok: false, reason: result.reason === 'not_configured' ? 'not_configured' : 'unavailable' };
  }
}
