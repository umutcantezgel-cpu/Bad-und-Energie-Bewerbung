import type { ApplicationAnswers, Attribution, Mappe } from '@/lib/applications/schema';
import type { NormalizedFollowUp, ReferencedApplication, SpamSignal } from '@/lib/applications/types';

/**
 * Nutzlast der Intake-RPCs (supabase/migrations/*_intake_rpc.sql). Die Funktionen lehnen jeden
 * unbekannten Schlüssel mit `validation_failed` ab, deshalb hier eine ausdrückliche Abbildung
 * camelCase → snake_case statt die TS-Objekte durchzureichen. Inhalt von `answers` und `mappe`
 * bleibt in der TS-Form (das Cockpit liest ihn später mit denselben Schemas).
 */

/** Attribution: TS-Feld → Spalte in public.application_attribution. */
export const ATTRIBUTION_COLUMNS = {
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign',
  utmContent: 'utm_content',
  utmTerm: 'utm_term',
  ref: 'ref',
  referrerHost: 'referrer_host',
  landingPath: 'landing_path',
  funnel: 'funnel',
} as const satisfies Record<keyof Attribution, string>;

type AttributionColumn = (typeof ATTRIBUTION_COLUMNS)[keyof typeof ATTRIBUTION_COLUMNS];

// `type` statt `interface`: nur so sind die Nutzlasten dem Json-Typ von supabase-js zuweisbar.
export type SubmitApplicationPayload = {
  reference: string;
  idempotency_key: string;
  content_hash: string;
  submitted_at: string;
  job: { id: string; title: string; reference_code?: string; question_set: string };
  answers: ApplicationAnswers;
  mappe: Mappe | null;
  name: string;
  phone: { raw: string; e164?: string };
  email?: string;
  contact_channel: string;
  acquisition_channel: string;
  attribution: Partial<Record<AttributionColumn, string>>;
  privacy_notice_version: string;
  suspected_spam: boolean;
  spam_signals: SpamSignal[];
  fill_duration_ms?: number;
};

export type SubmitFollowUpPayload = {
  reference: string;
  idempotency_key: string;
  received_at: string;
  start_date?: string;
  postal_code?: string;
  message?: string;
  mappe?: Mappe;
};

export function toAttributionPayload(attribution: Attribution): Partial<Record<AttributionColumn, string>> {
  const payload: Partial<Record<AttributionColumn, string>> = {};
  for (const [field, column] of Object.entries(ATTRIBUTION_COLUMNS) as Array<[keyof Attribution, AttributionColumn]>) {
    const value = attribution[field];
    if (value) payload[column] = value;
  }
  return payload;
}

/** Bewerbung mit Nummer → rpc_submit_application. `contentHash` = applicationContentHash (32 hex). */
export function toSubmitApplicationPayload(app: ReferencedApplication, contentHash: string): SubmitApplicationPayload {
  return {
    reference: app.reference,
    idempotency_key: app.idempotencyKey,
    content_hash: contentHash,
    submitted_at: app.submittedAt.toISOString(),
    job: {
      id: app.job.id,
      title: app.job.title,
      ...(app.job.referenceCode ? { reference_code: app.job.referenceCode } : {}),
      question_set: app.job.questionSet,
    },
    answers: { ...app.answers },
    mappe: app.mappe ?? null,
    name: app.name,
    phone: { raw: app.phone.raw, ...(app.phone.e164 ? { e164: app.phone.e164 } : {}) },
    ...(app.email ? { email: app.email } : {}),
    contact_channel: app.contactChannel,
    acquisition_channel: app.channel,
    attribution: toAttributionPayload(app.attribution),
    privacy_notice_version: app.privacyNoticeVersion,
    suspected_spam: app.suspectedSpam,
    spam_signals: [...app.spamSignals],
    ...(app.fillDurationMs !== undefined ? { fill_duration_ms: app.fillDurationMs } : {}),
  };
}

/** Ergänzung → rpc_submit_follow_up. */
export function toFollowUpPayload(followUp: NormalizedFollowUp): SubmitFollowUpPayload {
  return {
    reference: followUp.reference,
    idempotency_key: followUp.idempotencyKey,
    received_at: followUp.receivedAt.toISOString(),
    ...(followUp.startDate ? { start_date: followUp.startDate } : {}),
    ...(followUp.postalCode ? { postal_code: followUp.postalCode } : {}),
    ...(followUp.message ? { message: followUp.message } : {}),
    ...(followUp.mappe ? { mappe: followUp.mappe } : {}),
  };
}
