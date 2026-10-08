import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

import { getSecret } from '@/lib/env';

/**
 * Token für Ergänzungen nach dem Absenden (ROADMAP §6, Danke-Seite und Mappe):
 * `<issuedAt base36>.<HMAC-SHA256 base64url>` über Bewerbungsnummer und Ausstellungszeit,
 * Schlüssel APPLICATION_TOKEN_SECRET. 14 Tage gültig, zustandslos (keine Datenbank nötig).
 * Fehlt das Geheimnis in Production, wirft getSecret() einen EnvError (→ 503).
 */

export const FOLLOW_UP_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;
/** Toleranz für Uhrenabweichungen zwischen Server-Instanzen. */
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const TOKEN_PATTERN = /^([0-9a-z]{1,11})\.([A-Za-z0-9_-]{43})$/;
const DOMAIN = 'be-follow-up:v1';

export type FollowUpTokenCheck =
  | { ok: true; issuedAt: Date; expiresAt: Date }
  | { ok: false; reason: 'malformed' | 'invalid' | 'expired' };

function sign(secret: string, reference: string, issued: string): string {
  return createHmac('sha256', secret).update(`${DOMAIN}:${reference}:${issued}`).digest('base64url');
}

export function createFollowUpToken(
  reference: string,
  now: Date = new Date(),
  secret: string = getSecret('APPLICATION_TOKEN_SECRET'),
): string {
  const issued = Math.floor(now.getTime() / 1000).toString(36);
  return `${issued}.${sign(secret, reference, issued)}`;
}

/** Prüft Signatur (zeitkonstant) und Alter. Die Nummer muss bereits normalisiert sein. */
export function verifyFollowUpToken(
  reference: string,
  token: string,
  now: Date = new Date(),
  secret: string = getSecret('APPLICATION_TOKEN_SECRET'),
): FollowUpTokenCheck {
  const match = TOKEN_PATTERN.exec(token.trim());
  if (!match) return { ok: false, reason: 'malformed' };
  const [, issued, mac] = match;

  const expected = Buffer.from(sign(secret, reference, issued));
  const given = Buffer.from(mac);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return { ok: false, reason: 'invalid' };

  const issuedAtMs = parseInt(issued, 36) * 1000;
  if (!Number.isSafeInteger(issuedAtMs) || issuedAtMs > now.getTime() + MAX_CLOCK_SKEW_MS) {
    return { ok: false, reason: 'invalid' };
  }
  const expiresAtMs = issuedAtMs + FOLLOW_UP_TOKEN_TTL_MS;
  if (now.getTime() > expiresAtMs) return { ok: false, reason: 'expired' };

  return { ok: true, issuedAt: new Date(issuedAtMs), expiresAt: new Date(expiresAtMs) };
}

/** Wirft EnvError, wenn kein Geheimnis verfügbar ist; vor dem Versand prüfen (sonst gäbe es kein Token). */
export function assertFollowUpTokenSecret(): void {
  getSecret('APPLICATION_TOKEN_SECRET');
}
