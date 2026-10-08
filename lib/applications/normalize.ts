import 'server-only';
import { createHash } from 'node:crypto';
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

import { INITIATIVE_QUESTION_SET, sanitizeAnswers } from '@/lib/apply/questions';
import { deriveChannel } from '@/lib/attribution/channel';
import { sanitizeAttribution } from '@/lib/attribution/sanitize';
import { getJobById } from '@/lib/jobs/registry';
import {
  HONEYPOT_FIELD,
  INITIATIVE_JOB_ID,
  type ApplicationFollowUp,
  type ApplicationInput,
  type ApplicationJobId,
  type Mappe,
} from './schema';
import type { ApplicationJobInfo, NormalizedApplication, NormalizedFollowUp, NormalizedPhone, SpamSignal } from './types';

/** Unterhalb dieser Ausfülldauer wird die Bewerbung als Spamverdacht markiert (nicht abgelehnt). */
export const MIN_FILL_DURATION_MS = 3000;

export const INITIATIVE_TITLE = 'Initiativbewerbung';

/** Steuerzeichen und Zeilenumbrüche raus, Leerraum zusammenfassen (Name, Telefon: einzeilig). */
function collapse(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Telefonnummer nach E.164 (Standardland DE) plus lesbare Form. Nicht erkannte oder laut
 * Metadaten ungültige Eingaben bleiben unverändert erhalten (ohne E.164): Lieber eine krumme
 * Nummer weitergeben als eine Bewerbung verlieren.
 */
export function normalizePhone(input: string, defaultCountry: CountryCode = 'DE'): NormalizedPhone {
  const raw = collapse(input);
  const parsed = raw ? parsePhoneNumberFromString(raw, defaultCountry) : undefined;
  if (!parsed || !parsed.isValid()) return { raw, display: raw, valid: false };

  const display = parsed.country === defaultCountry ? parsed.formatNational() : parsed.formatInternational();
  return {
    raw,
    e164: parsed.number,
    display,
    valid: true,
    ...(parsed.country ? { country: parsed.country } : {}),
  };
}

/** Erstes Wort des Namens, z. B. „Max“ aus „Max Mustermann“. */
export function firstNameOf(name: string): string {
  return collapse(name).split(' ')[0] ?? '';
}

/** Titel und Referenz kommen immer aus dem Registry, nie aus dem Payload. */
export function resolveJobInfo(jobId: ApplicationJobId): ApplicationJobInfo {
  const job = jobId === INITIATIVE_JOB_ID ? undefined : getJobById(jobId);
  if (!job) {
    return {
      id: INITIATIVE_JOB_ID,
      title: INITIATIVE_TITLE,
      shortTitle: INITIATIVE_TITLE,
      questionSet: INITIATIVE_QUESTION_SET,
    };
  }
  return {
    id: job.id,
    title: job.title,
    shortTitle: job.shortTitle,
    referenceCode: job.referenceCode,
    questionSet: job.apply.questionSet,
    status: job.status,
  };
}

/** Leere Einträge entfernen; ohne jeden Inhalt `undefined`. */
export function compactMappe(mappe: Mappe | null | undefined): Mappe | undefined {
  if (!mappe) return undefined;
  const coverLetter = mappe.coverLetter.trim();
  const skills = mappe.skills.map((skill) => skill.trim()).filter(Boolean);
  const workStyle = mappe.workStyle?.trim() || undefined;
  const careerStations = mappe.careerStations
    .map((station) => ({ ...station, tasks: station.tasks.map((task) => task.trim()).filter(Boolean) }))
    .filter((station) => station.period || station.role || station.company || station.location || station.tasks.length > 0);
  const educationStations = mappe.educationStations.filter(
    (station) => station.period || station.degree || station.institution || station.location,
  );

  if (!coverLetter && !workStyle && skills.length === 0 && careerStations.length === 0 && educationStations.length === 0) {
    return undefined;
  }
  return { coverLetter, skills, ...(workStyle ? { workStyle } : {}), careerStations, educationStations };
}

export interface NormalizeOptions {
  now?: Date;
  minFillDurationMs?: number;
}

export function normalizeApplication(input: ApplicationInput, options: NormalizeOptions = {}): NormalizedApplication {
  const now = options.now ?? new Date();
  const name = collapse(input.name);
  const email = input.email?.trim().toLowerCase() || undefined;
  const attribution = sanitizeAttribution(input.attribution);
  const mappe = compactMappe(input.mappe);

  const job = resolveJobInfo(input.jobId);

  // Dauer misst der Client mit seiner eigenen Uhr (erste Eingabe bis Absenden): keine Uhrenabweichung
  // zwischen Client und Server. Nur ein Hinweis, kein Ausschluss.
  const duration = input.fillDurationMs;
  const fillDurationMs = typeof duration === 'number' && Number.isFinite(duration) && duration >= 0 ? Math.round(duration) : undefined;
  const spamSignals: SpamSignal[] = [];
  if (input[HONEYPOT_FIELD]?.trim()) spamSignals.push('honeypot');
  if (fillDurationMs !== undefined && fillDurationMs < (options.minFillDurationMs ?? MIN_FILL_DURATION_MS)) spamSignals.push('fast');

  return {
    idempotencyKey: input.idempotencyKey,
    submittedAt: now,
    job,
    // Nur Antworten aus dem Fragenset der Stelle (z. B. keine Ausbildungsfrage bei Fachkräften).
    answers: sanitizeAnswers(job.questionSet, input.answers),
    name,
    firstName: firstNameOf(name),
    phone: normalizePhone(input.phone),
    ...(email ? { email } : {}),
    contactChannel: input.contactChannel,
    ...(mappe ? { mappe } : {}),
    attribution,
    channel: deriveChannel(attribution),
    privacyNoticeVersion: input.privacyNoticeVersion,
    suspectedSpam: spamSignals.length > 0,
    spamSignals,
    ...(fillDurationMs !== undefined ? { fillDurationMs } : {}),
  };
}

/** Ergänzung mit Inhalts-Hash als Idempotenzschlüssel; `null`, wenn nichts ergänzt wurde. */
export function normalizeFollowUp(
  input: ApplicationFollowUp,
  reference: string,
  now: Date = new Date(),
): NormalizedFollowUp | null {
  const startDate = input.startDate?.trim() || undefined;
  const postalCode = input.postalCode?.trim() || undefined;
  const message = input.message?.trim() || undefined;
  const mappe = compactMappe(input.mappe);
  if (!startDate && !postalCode && !message && !mappe) return null;

  const content = { reference, startDate, postalCode, message, mappe };
  const idempotencyKey = createHash('sha256').update(JSON.stringify(content)).digest('hex').slice(0, 32);

  return {
    reference,
    idempotencyKey,
    receivedAt: now,
    ...(startDate ? { startDate } : {}),
    ...(postalCode ? { postalCode } : {}),
    ...(message ? { message } : {}),
    ...(mappe ? { mappe } : {}),
  };
}
