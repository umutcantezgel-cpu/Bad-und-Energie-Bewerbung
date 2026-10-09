import 'server-only';

import { dispatchApplicationEmails, dispatchApplicationFollowUpEmail } from '@/lib/email';
import { applicationContentHash } from './fingerprint';
import { TtlLru, type TtlLruOptions } from './idempotency';
import { referenceForKey } from './reference';
import type { NormalizedApplication, NormalizedFollowUp } from './types';

/**
 * Ziel einer Bewerbung (ROADMAP §3.2). Phase 1: EmailSink (Postfach des Teams).
 * Phase 2: SupabaseSink mit demselben Vertrag (DB + Storage, Not-E-Mail bei DB-Ausfall).
 */

export type SinkFailureReason = 'not_configured' | 'failed';

export type SinkSubmitResult =
  | { ok: true; reference: string; /** Wiederholung mit gleichen Angaben, nichts neu versendet. */ duplicate?: boolean }
  | { ok: false; reason: SinkFailureReason };

export type SinkFollowUpResult = { ok: true; duplicate?: boolean } | { ok: false; reason: SinkFailureReason };

export interface ApplicationSink {
  submit(app: NormalizedApplication): Promise<SinkSubmitResult>;
  followUp(followUp: NormalizedFollowUp): Promise<SinkFollowUpResult>;
}

interface SubmissionRecord {
  reference: string;
  submittedAt: Date;
  /** Hash der Angaben (applicationContentHash) der zuletzt begonnenen Zustellung. */
  content: string;
  delivered: boolean;
}

export interface EmailSinkOptions extends TtlLruOptions {
  /** Nummer einer Bewerbung; Standard: aus dem Idempotency-Key abgeleitet (gleich auf jeder Instanz). */
  createReference?: (app: NormalizedApplication) => string;
}

const defaultCreateReference = (app: NormalizedApplication): string => referenceForKey(app.idempotencyKey, app.submittedAt);

function failureReason(error: string | undefined): SinkFailureReason {
  return error === 'not_configured' ? 'not_configured' : 'failed';
}

/**
 * Versendet Bewerbungen per E-Mail. Idempotenz je Idempotenzschlüssel (UUID des Clients, im
 * Entwurf gemerkt, also auch nach einem Reload derselbe):
 * - Die Bewerbungsnummer wird aus dem Schlüssel abgeleitet (HMAC), auf jeder Instanz dieselbe.
 * - Resend bekommt je Mail `bewerbung:<uuid>:<art>:<Hash der Angaben ohne Eingangszeit>`
 *   (lib/email/resend.ts): Eine Wiederholung mit gleichen Angaben wird auch auf einer anderen
 *   Instanz nicht erneut zugestellt; korrigierte Angaben gehen als eigene Mail mit derselben Nummer.
 * - Auf derselben Instanz merkt sich ein LRU-Speicher (24 h) Nummer, Zeitpunkt, Angaben-Hash und
 *   Zustellung: Wiederholung mit gleichen Angaben nach Erfolg sendet nichts, nach einem Fehler
 *   dieselbe Mail. Geänderte Angaben (z. B. Telefonnummer korrigiert, während die Antwort
 *   verloren ging) gehen wie auf einer anderen Instanz als eigene Mail mit derselben Nummer.
 * - Gleichzeitige Doppelklicks mit gleichen Angaben teilen sich eine laufende Zustellung.
 * Phase 2 speichert den Schlüssel zusätzlich in der Datenbank (Unique-Index).
 */
export class EmailSink implements ApplicationSink {
  private readonly submissions: TtlLru<SubmissionRecord>;
  private readonly followUps: TtlLru<true>;
  private readonly inflight = new Map<string, Promise<SinkSubmitResult>>();
  private readonly inflightFollowUps = new Map<string, Promise<SinkFollowUpResult>>();
  private readonly createReference: (app: NormalizedApplication) => string;

  constructor({ createReference = defaultCreateReference, ...cache }: EmailSinkOptions = {}) {
    this.submissions = new TtlLru<SubmissionRecord>(cache);
    this.followUps = new TtlLru<true>(cache);
    this.createReference = createReference;
  }

  async submit(app: NormalizedApplication): Promise<SinkSubmitResult> {
    const key = app.idempotencyKey;
    const content = applicationContentHash(app);
    const record = this.submissions.get(key);
    if (record?.delivered && record.content === content) {
      return { ok: true, reference: record.reference, duplicate: true };
    }

    const flight = `${key}:${content}`;
    const running = this.inflight.get(flight);
    if (running) return running;

    const delivery = this.deliver(app, content, record).finally(() => this.inflight.delete(flight));
    this.inflight.set(flight, delivery);
    return delivery;
  }

  private async deliver(
    app: NormalizedApplication,
    content: string,
    previous: SubmissionRecord | undefined,
  ): Promise<SinkSubmitResult> {
    // Nummer und Eingangszeit bleiben beim ersten Versuch, auch wenn sich die Angaben ändern.
    const reference = previous?.reference ?? this.createReference(app);
    const submittedAt = previous?.submittedAt ?? app.submittedAt;
    this.submissions.set(app.idempotencyKey, { reference, submittedAt, content, delivered: false }, { keepExpiry: true });

    const result = await dispatchApplicationEmails(
      { ...app, submittedAt, reference },
      { idempotencyKey: `bewerbung:${app.idempotencyKey}` },
    );
    if (!result.success) return { ok: false, reason: failureReason(result.teamNotification.error) };

    this.submissions.set(app.idempotencyKey, { reference, submittedAt, content, delivered: true }, { keepExpiry: true });
    // Resend kannte den Key schon: Die Team-Mail ging bereits über eine andere Instanz raus.
    return result.teamNotification.duplicate ? { ok: true, reference, duplicate: true } : { ok: true, reference };
  }

  async followUp(followUp: NormalizedFollowUp): Promise<SinkFollowUpResult> {
    const key = followUp.idempotencyKey;
    if (this.followUps.get(key)) return { ok: true, duplicate: true };

    const running = this.inflightFollowUps.get(key);
    if (running) return running;

    const delivery = (async (): Promise<SinkFollowUpResult> => {
      const result = await dispatchApplicationFollowUpEmail(followUp, { idempotencyKey: `ergaenzung:${key}` });
      if (!result.success) return { ok: false, reason: failureReason(result.error) };
      this.followUps.set(key, true);
      return { ok: true };
    })().finally(() => this.inflightFollowUps.delete(key));
    this.inflightFollowUps.set(key, delivery);
    return delivery;
  }
}

let sink: ApplicationSink | null = null;

/** Sink der laufenden Instanz (ein gemeinsamer Idempotenz-Speicher je Server-Instanz). */
export function getApplicationSink(): ApplicationSink {
  sink ??= new EmailSink();
  return sink;
}

/** Nur für Tests: eigenen Sink setzen oder (mit `null`) zurücksetzen. */
export function setApplicationSinkForTests(next: ApplicationSink | null): void {
  sink = next;
}
