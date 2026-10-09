import { JOB_IDS } from '@/lib/jobs/ids';

/**
 * Konstanten und Grenzen des Bewerbungsvertrags ohne zod. Client-Code (Flow, Danke-Seite,
 * Mappe) importiert von hier bzw. nur Typen aus ./schema, damit zod nicht im Browser-Bundle
 * landet (geprüft mit scripts/qa/check-client-imports.mjs). ./schema baut seine Regeln aus
 * denselben Werten und exportiert sie weiter.
 */

export const INITIATIVE_JOB_ID = 'initiativ' as const;
export const APPLICATION_JOB_IDS = Object.freeze([...JOB_IDS, INITIATIVE_JOB_ID] as const);
export type ApplicationJobId = (typeof APPLICATION_JOB_IDS)[number];

export function isApplicationJobId(value: unknown): value is ApplicationJobId {
  return typeof value === 'string' && (APPLICATION_JOB_IDS as readonly string[]).includes(value);
}

export const CONTACT_CHANNELS = ['whatsapp', 'phone', 'email'] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export function isContactChannel(value: unknown): value is ContactChannel {
  return typeof value === 'string' && (CONTACT_CHANNELS as readonly string[]).includes(value);
}

export const API_ERROR_CODES = [
  'VALIDATION_FAILED',
  'CSRF_FAILED',
  'RATE_LIMITED',
  'PAYLOAD_TOO_LARGE',
  'UNSUPPORTED_MEDIA_TYPE',
  'INVALID_JSON',
  'INVALID_TOKEN',
  'SERVICE_UNAVAILABLE',
  'INTERNAL',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === 'string' && (API_ERROR_CODES as readonly string[]).includes(value);
}

/** Client-side storage keys (sessionStorage only; never localStorage for personal data). */
export const STORAGE_KEYS = {
  draft: 'be:apply-draft:v1',
  submitted: 'be:application:v1',
  mappe: 'be:mappe:v1',
  /** Pre-redesign localStorage key with personal data; deleted on load. */
  legacyDossier: 'bad_energie_dossier',
} as const;

/**
 * Fassungen des Datenschutzhinweises, die der Server annimmt; die letzte ist die aktuelle (Stand
 * auf /datenschutz). Bei einer neuen Fassung anhängen, die alte mindestens 24 h stehen lassen:
 * Offene Tabs mit dem alten Client-Bundle senden noch deren Version.
 */
export const PRIVACY_NOTICE_VERSIONS = ['2026-10'] as const;
export type PrivacyNoticeVersion = (typeof PRIVACY_NOTICE_VERSIONS)[number];
export const PRIVACY_NOTICE_VERSION: PrivacyNoticeVersion = PRIVACY_NOTICE_VERSIONS[PRIVACY_NOTICE_VERSIONS.length - 1];

/** Höchstlängen der Kontaktfelder (Schema, Eingabefelder und Client-Prüfung). */
export const CONTACT_LIMITS = Object.freeze({ name: 100, nameMin: 2, phone: 40, email: 254 });

/** Fehlermeldungen der Kontaktfelder; Server-Schema und Client-Prüfung zeigen denselben Text. */
export const CONTACT_MESSAGES = Object.freeze({
  name: 'Bitte gib deinen Namen an.',
  phone: 'Bitte gib eine gültige Telefonnummer an.',
  email: 'Bitte gib eine gültige E-Mail-Adresse an.',
  emailRequired: 'Bitte gib deine E-Mail-Adresse an.',
});

/** Standardtext für zu lange Angaben (wie germanIssueMessage in ./http). */
export function tooLongMessage(max: number): string {
  return `Bitte kürze diese Angabe auf höchstens ${max} Zeichen.`;
}

/** Dasselbe Muster wie `z.email()` (zod 4); das Schema übergibt es ausdrücklich. */
export const EMAIL_PATTERN =
  /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;

/**
 * Honeypot-Feld: Name, den kein Autofill-Profil kennt (kein „website“, „url“ o. Ä.).
 * Für Menschen unsichtbar; ist es gefüllt, geht die Bewerbung als Spamverdacht ans Team.
 */
export const HONEYPOT_FIELD = 'contactTimeHint' as const;

/** Grenzen der strukturierten Bewerbungsmappe (mappeSchema und die Prüfung im Browser). */
export const MAPPE_SCHEMA_LIMITS = Object.freeze({
  coverLetter: 6000,
  skills: 12,
  skill: 120,
  workStyle: 300,
  careerStations: 12,
  educationStations: 8,
  period: 60,
  role: 120,
  company: 120,
  location: 120,
  tasks: 8,
  task: 200,
  degree: 160,
  institution: 160,
});
