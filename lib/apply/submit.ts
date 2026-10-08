import {
  attributionSchema,
  PRIVACY_NOTICE_VERSION,
  type ApiErrorCode,
  type ApplicationAnswers,
  type ApplicationFollowUp,
  type ApplicationInput,
  type ApplicationJobId,
  type Attribution,
  type ContactChannel,
  type Mappe,
} from '@/lib/applications/schema';

/**
 * Ehrliches Absenden (ROADMAP §6, C8): Es zählt nur eine Antwort 200 mit `ok: true`.
 * Alles andere (Netzwerk, offline, Zeitüberschreitung, 4xx/5xx, kaputtes JSON) ist ein Fehler
 * mit Art und optionalen Feldfehlern, damit die Oberfläche passend reagieren kann.
 */

export const APPLICATION_ENDPOINT = '/api/bewerbung';
export const FOLLOW_UP_ENDPOINT = '/api/bewerbung/ergaenzung';
export const SUBMIT_TIMEOUT_MS = 25_000;

export const CONTACT_FIELDS = ['name', 'phone', 'email', 'contactChannel'] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export type SubmitFailureKind = 'offline' | 'network' | 'timeout' | 'validation' | 'rate_limited' | 'server';

export interface SubmitFailure {
  ok: false;
  kind: SubmitFailureKind;
  status?: number;
  code?: ApiErrorCode | string;
  /** Text vom Server (deutsch), falls vorhanden. */
  message?: string;
  /** Feldfehler, die zu den Kontaktfeldern gehören. */
  fieldErrors: Partial<Record<ContactField, string>>;
  /** Feldfehler ohne passendes Eingabefeld (z. B. `jobId`). */
  otherErrors: Partial<Record<string, string>>;
  retryAfterSec?: number;
}

export interface ApplicationSuccess {
  ok: true;
  reference: string;
  followUpToken: string;
  firstName: string;
}

export type ApplicationResult = ApplicationSuccess | SubmitFailure;
export type FollowUpResult = { ok: true } | SubmitFailure;

export interface SubmitOptions {
  fetch?: typeof fetch;
  /** Überschreibt navigator.onLine (Tests). */
  online?: boolean;
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Payload
// ---------------------------------------------------------------------------

/** UUID v4 für die Idempotenz. Fällt auf getRandomValues zurück (kein randomUUID ohne HTTPS). */
export function createIdempotencyKey(source: Pick<Crypto, 'getRandomValues'> & Partial<Pick<Crypto, 'randomUUID'>> = globalThis.crypto): string {
  if (typeof source?.randomUUID === 'function') return source.randomUUID();
  const bytes = new Uint8Array(16);
  source.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Vorname für die Danke-Seite, falls der Server keinen liefert. */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

const ATTRIBUTION_KEYS = Object.keys(attributionSchema.shape) as (keyof Attribution)[];

/**
 * Attribution aus dem Store, ergänzt um den Funnel des Einstiegs (Prop schlägt Store).
 * Nur bekannte, gültige Felder: Das Schema ist strict, ein fremdes Feld würde sonst die ganze
 * Bewerbung ablehnen lassen.
 */
export function mergeAttribution(base: Partial<Record<string, unknown>> | null | undefined, funnel?: string | null): Attribution {
  const result: Attribution = {};
  const source: Partial<Record<string, unknown>> = { ...(base ?? {}) };
  const value = funnel?.trim().slice(0, 60);
  if (value) source.funnel = value;
  for (const key of ATTRIBUTION_KEYS) {
    const raw = source[key];
    if (typeof raw !== 'string' || raw.trim() === '') continue;
    const parsed = attributionSchema.shape[key].safeParse(raw);
    if (parsed.success && parsed.data) result[key] = parsed.data;
  }
  return result;
}

export interface PayloadInput {
  jobId: ApplicationJobId;
  answers: ApplicationAnswers;
  name: string;
  phone: string;
  email?: string;
  contactChannel: ContactChannel;
  website?: string;
  mappe?: Mappe | null;
  attribution?: Attribution;
  idempotencyKey: string;
  startedAt?: number;
}

export function buildApplicationPayload(input: PayloadInput): ApplicationInput {
  const email = input.email?.trim() ?? '';
  const payload: ApplicationInput = {
    jobId: input.jobId,
    answers: { ...input.answers },
    name: input.name.trim(),
    phone: input.phone.trim(),
    contactChannel: input.contactChannel,
    attribution: input.attribution ?? {},
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    idempotencyKey: input.idempotencyKey,
  };
  if (email) payload.email = email;
  if (input.mappe) payload.mappe = input.mappe;
  if (typeof input.startedAt === 'number' && input.startedAt > 0) payload.startedAt = Math.floor(input.startedAt);
  if (input.website) payload.website = input.website;
  return payload;
}

// ---------------------------------------------------------------------------
// Antworten deuten (rein, getestet)
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function firstMessage(value: unknown): string | undefined {
  if (typeof value === 'string') return value || undefined;
  if (Array.isArray(value)) return value.find((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  return undefined;
}

/** Server-Feldfehler (`{ email: ['…'] }`) auf Kontaktfelder und den Rest aufteilen. */
export function mapFieldErrors(fieldErrors: unknown): Pick<SubmitFailure, 'fieldErrors' | 'otherErrors'> {
  const result: Pick<SubmitFailure, 'fieldErrors' | 'otherErrors'> = { fieldErrors: {}, otherErrors: {} };
  if (!isRecord(fieldErrors)) return result;
  for (const [key, value] of Object.entries(fieldErrors)) {
    const message = firstMessage(value);
    if (!message) continue;
    const field = key.split('.')[0];
    if ((CONTACT_FIELDS as readonly string[]).includes(field)) {
      result.fieldErrors[field as ContactField] ??= message;
    } else {
      result.otherErrors[field] ??= message;
    }
  }
  return result;
}

function parseRetryAfter(json: Record<string, unknown>, headers?: Pick<Headers, 'get'> | null): number | undefined {
  const fromBody = json.retryAfterSec;
  if (typeof fromBody === 'number' && Number.isFinite(fromBody) && fromBody > 0) return Math.ceil(fromBody);
  const header = headers?.get('Retry-After');
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds > 0) return Math.ceil(seconds);
  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(1, Math.ceil((date - Date.now()) / 1000));
}

/** Fehlerantwort (jede Antwort ohne 200 + ok:true) in eine SubmitFailure übersetzen. */
export function interpretFailure(status: number, body: unknown, headers?: Pick<Headers, 'get'> | null): SubmitFailure {
  const json = isRecord(body) ? body : {};
  const code = typeof json.code === 'string' ? json.code : undefined;
  const message = firstMessage(json.message) ?? firstMessage(json.error);
  const { fieldErrors, otherErrors } = mapFieldErrors(json.fieldErrors ?? json.details);

  let kind: SubmitFailureKind = 'server';
  if (status === 429 || code === 'RATE_LIMITED') kind = 'rate_limited';
  else if (code === 'VALIDATION_FAILED' || ((status === 400 || status === 422) && Object.keys(fieldErrors).length > 0)) {
    kind = 'validation';
  }

  return {
    ok: false,
    kind,
    status,
    code,
    message,
    fieldErrors,
    otherErrors,
    retryAfterSec: kind === 'rate_limited' ? parseRetryAfter(json, headers) : undefined,
  };
}

/** Erfolg nur bei Status 200 und vollständigem `{ ok: true, reference, followUpToken }`. */
export function interpretApplicationResponse(
  status: number,
  body: unknown,
  headers?: Pick<Headers, 'get'> | null,
): ApplicationResult {
  if (status === 200 && isRecord(body) && body.ok === true) {
    const { reference, followUpToken, firstName } = body;
    if (typeof reference === 'string' && reference.trim() && typeof followUpToken === 'string' && followUpToken.trim()) {
      return {
        ok: true,
        reference: reference.trim(),
        followUpToken,
        firstName: typeof firstName === 'string' ? firstName.trim() : '',
      };
    }
  }
  return interpretFailure(status === 200 ? 502 : status, body, headers);
}

export function interpretFollowUpResponse(status: number, body: unknown, headers?: Pick<Headers, 'get'> | null): FollowUpResult {
  if (status === 200 && isRecord(body) && body.ok === true) return { ok: true };
  return interpretFailure(status === 200 ? 502 : status, body, headers);
}

// ---------------------------------------------------------------------------
// Netzwerk
// ---------------------------------------------------------------------------

function networkFailure(kind: Extract<SubmitFailureKind, 'offline' | 'network' | 'timeout'>): SubmitFailure {
  return { ok: false, kind, fieldErrors: {}, otherErrors: {} };
}

function isOnline(override?: boolean): boolean {
  if (typeof override === 'boolean') return override;
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

type RawResponse = { status: number; body: unknown; headers: Pick<Headers, 'get'> } | SubmitFailure;

async function postJson(endpoint: string, payload: unknown, options: SubmitOptions): Promise<RawResponse> {
  if (!isOnline(options.online)) return networkFailure('offline');
  const doFetch = options.fetch ?? globalThis.fetch;
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller?.abort();
  }, options.timeoutMs ?? SUBMIT_TIMEOUT_MS);

  try {
    const response = await doFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
      cache: 'no-store',
      signal: controller?.signal,
    });
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    return { status: response.status, body, headers: response.headers };
  } catch {
    if (timedOut) return networkFailure('timeout');
    return networkFailure(isOnline(options.online) ? 'network' : 'offline');
  } finally {
    clearTimeout(timer);
  }
}

/** POST /api/bewerbung; wartet auf die Antwort und meldet nie Erfolg ohne 200 + ok:true. */
export async function submitApplication(payload: ApplicationInput, options: SubmitOptions = {}): Promise<ApplicationResult> {
  const raw = await postJson(APPLICATION_ENDPOINT, payload, options);
  if ('ok' in raw) return raw;
  return interpretApplicationResponse(raw.status, raw.body, raw.headers);
}

/** POST /api/bewerbung/ergaenzung mit Bewerbungsnummer und Token. */
export async function submitFollowUp(payload: ApplicationFollowUp, options: SubmitOptions = {}): Promise<FollowUpResult> {
  const raw = await postJson(FOLLOW_UP_ENDPOINT, payload, options);
  if ('ok' in raw) return raw;
  return interpretFollowUpResponse(raw.status, raw.body, raw.headers);
}

/** „2 Minuten“, „45 Sekunden“ für den Hinweis bei RATE_LIMITED. */
export function formatRetryAfter(seconds: number | undefined): string | null {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return null;
  if (seconds < 60) return `${Math.ceil(seconds)} ${Math.ceil(seconds) === 1 ? 'Sekunde' : 'Sekunden'}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
}
