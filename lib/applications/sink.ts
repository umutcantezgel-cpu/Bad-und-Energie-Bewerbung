import 'server-only';

import { dispatchApplicationEmails, dispatchApplicationFollowUpEmail } from '@/lib/email';
import { TtlLru, type TtlLruOptions } from './idempotency';
import { createReference as defaultCreateReference } from './reference';
import type { NormalizedApplication, NormalizedFollowUp } from './types';

/**
 * Ziel einer Bewerbung (ROADMAP §3.2). Phase 1: EmailSink (Postfach des Teams).
 * Phase 2: SupabaseSink mit demselben Vertrag (DB + Storage, Not-E-Mail bei DB-Ausfall).
 */

export type SinkFailureReason = 'not_configured' | 'failed';

export type SinkSubmitResult =
  | { ok: true; reference: string; /** Wiederholung desselben Idempotenzschlüssels, nichts neu versendet. */ duplicate?: boolean }
  | { ok: false; reason: SinkFailureReason };

export type SinkFollowUpResult = { ok: true; duplicate?: boolean } | { ok: false; reason: SinkFailureReason };

export interface ApplicationSink {
  submit(app: NormalizedApplication): Promise<SinkSubmitResult>;
  followUp(followUp: NormalizedFollowUp): Promise<SinkFollowUpResult>;
}

interface SubmissionRecord {
  reference: string;
  submittedAt: Date;
  delivered: boolean;
}

export interface EmailSinkOptions extends TtlLruOptions {
  createReference?: (now: Date) => string;
}

function failureReason(error: string | undefined): SinkFailureReason {
  return error === 'not_configured' ? 'not_configured' : 'failed';
}

/**
 * Versendet Bewerbungen per E-Mail. Idempotenz: Je Idempotenzschlüssel (UUID des Clients)
 * werden Bewerbungsnummer und Zeitpunkt 24 h gemerkt (begrenzter LRU-Speicher).
 * - Wiederholung nach Erfolg: dieselbe Nummer, keine zweite Mail.
 * - Wiederholung nach Fehler: dieselbe Nummer und derselbe Zeitpunkt, also inhaltsgleiche Mail;
 *   hatte Resend die erste doch angenommen, verwirft es die zweite über den Idempotency-Key.
 * - Gleichzeitige Doppelklicks teilen sich eine laufende Zustellung.
 * Grenze: Der Speicher gilt pro Server-Instanz (Phase 2: Datenbank).
 */
export class EmailSink implements ApplicationSink {
  private readonly submissions: TtlLru<SubmissionRecord>;
  private readonly followUps: TtlLru<true>;
  private readonly inflight = new Map<string, Promise<SinkSubmitResult>>();
  private readonly inflightFollowUps = new Map<string, Promise<SinkFollowUpResult>>();
  private readonly createReference: (now: Date) => string;

  constructor({ createReference = defaultCreateReference, ...cache }: EmailSinkOptions = {}) {
    this.submissions = new TtlLru<SubmissionRecord>(cache);
    this.followUps = new TtlLru<true>(cache);
    this.createReference = createReference;
  }

  async submit(app: NormalizedApplication): Promise<SinkSubmitResult> {
    const key = app.idempotencyKey;
    const record = this.submissions.get(key);
    if (record?.delivered) return { ok: true, reference: record.reference, duplicate: true };

    const running = this.inflight.get(key);
    if (running) return running;

    const delivery = this.deliver(app, record).finally(() => this.inflight.delete(key));
    this.inflight.set(key, delivery);
    return delivery;
  }

  private async deliver(app: NormalizedApplication, previous: SubmissionRecord | undefined): Promise<SinkSubmitResult> {
    const reference = previous?.reference ?? this.createReference(app.submittedAt);
    const submittedAt = previous?.submittedAt ?? app.submittedAt;
    this.submissions.set(app.idempotencyKey, { reference, submittedAt, delivered: false }, { keepExpiry: true });

    const result = await dispatchApplicationEmails(
      { ...app, submittedAt, reference },
      { idempotencyKey: `bewerbung:${app.idempotencyKey}` },
    );
    if (!result.success) return { ok: false, reason: failureReason(result.teamNotification.error) };

    this.submissions.set(app.idempotencyKey, { reference, submittedAt, delivered: true }, { keepExpiry: true });
    return { ok: true, reference };
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
