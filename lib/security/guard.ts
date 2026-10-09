import 'server-only';
import { NextResponse } from 'next/server';
import { EnvError } from '@/lib/env';
import { validateCSRF } from '@/lib/utils/csrf';
import { getClientIp, hashIp } from './ip';
import { checkRateLimits, rateLimiter, type RateLimiter, type RateLimitRule } from './rate-limit';
import { DEFAULT_MAX_BODY_BYTES, readJsonBody, type ReadJsonFailure } from './request';

export type GuardFailure =
  | { ok: false; status: 403; code: 'FORBIDDEN' }
  | { ok: false; status: 429; code: 'RATE_LIMITED'; retryAfterSec: number }
  | { ok: false; status: 503; code: 'NOT_CONFIGURED' }
  | ReadJsonFailure;

export type GuardResult = { ok: true; data: unknown } | GuardFailure;

export interface GuardOptions {
  /** Trennt die Zähler verschiedener Endpunkte, z. B. 'application'. */
  scope: string;
  rateLimit: readonly RateLimitRule[];
  maxBytes?: number;
  limiter?: RateLimiter;
}

/**
 * Gemeinsame Eingangskontrolle für Formular-POSTs (ROADMAP §9.3), in dieser Reihenfolge:
 * Herkunft (CSRF, 403) → Rate-Limit je IP-Hash (429) → Content-Type und Body-Cap (415/413/400).
 * Fehlt in Production das IP_HASH_SALT, ist das Ergebnis 503 statt eines ungeschützten Durchlaufs.
 */
export async function guardJsonPost(
  request: Request,
  { scope, rateLimit, maxBytes = DEFAULT_MAX_BODY_BYTES, limiter = rateLimiter }: GuardOptions
): Promise<GuardResult> {
  if (!validateCSRF(request)) return { ok: false, status: 403, code: 'FORBIDDEN' };

  let ipHash: string;
  try {
    ipHash = hashIp(getClientIp(request));
  } catch (err) {
    if (err instanceof EnvError) return { ok: false, status: 503, code: 'NOT_CONFIGURED' };
    throw err;
  }

  const limit = await checkRateLimits(`${scope}:${ipHash}`, rateLimit, limiter);
  if (!limit.allowed) return { ok: false, status: 429, code: 'RATE_LIMITED', retryAfterSec: limit.retryAfterSec };

  return readJsonBody(request, { maxBytes });
}

const FAILURE_MESSAGES: Record<GuardFailure['code'], string> = {
  FORBIDDEN: 'Die Anfrage kam nicht von unserer Seite. Bitte lade die Seite neu und versuch es noch einmal.',
  RATE_LIMITED: 'Zu viele Versuche in kurzer Zeit. Bitte warte ein paar Minuten oder ruf uns an: 06441 42956.',
  NOT_CONFIGURED:
    'Das Formular ist gerade nicht erreichbar. Bitte ruf uns an (06441 42956) oder schreib uns per WhatsApp.',
  PAYLOAD_TOO_LARGE: 'Deine Angaben sind zu lang. Bitte kürze deine Nachricht.',
  UNSUPPORTED_MEDIA_TYPE: 'Die Anfrage war ungültig. Bitte lade die Seite neu und versuch es noch einmal.',
  INVALID_JSON: 'Die Anfrage war ungültig. Bitte lade die Seite neu und versuch es noch einmal.',
};

/** Antwort im Format der Formular-APIs: `{ success: false, error: <Text>, code }`, nie gecacht. */
export function guardErrorResponse(failure: GuardFailure): NextResponse {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  if (failure.status === 429) headers.set('Retry-After', String(failure.retryAfterSec));
  return NextResponse.json(
    { success: false, error: FAILURE_MESSAGES[failure.code], code: failure.code },
    { status: failure.status, headers }
  );
}
