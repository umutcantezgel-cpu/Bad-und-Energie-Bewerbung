import 'server-only';
import { createHmac, randomInt } from 'node:crypto';

import { getSecret } from '@/lib/env';

/**
 * Bewerbungsnummer „BE-26-K7M4QX“ (ROADMAP §3.2): Präfix, Jahr (Europe/Berlin, zweistellig) und
 * ein Code aus einem eindeutig lesbaren Alphabet (ohne 0/O, 1/I/L). Phase 1 hat keine
 * Datenbank, die Eindeutigkeit prüfen könnte; sechs Zeichen (31^6 ≈ 887 Mio.) machen
 * Kollisionen praktisch ausgeschlossen. Phase 2 sichert sie zusätzlich per Unique-Index ab.
 *
 * Bewerbungen bekommen ihre Nummer aus dem Idempotency-Key des Clients (HMAC, siehe
 * referenceForKey): Eine Wiederholung, die auf einer anderen Server-Instanz landet, erhält
 * dieselbe Nummer, und die Mails sind für Resends Idempotenz inhaltsgleich.
 */

export const REFERENCE_PREFIX = 'BE';
export const REFERENCE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const REFERENCE_CODE_LENGTH = 6;
/** Akzeptiert 4–6 Zeichen, damit kürzere Nummern späterer Phasen gültig bleiben. */
export const REFERENCE_PATTERN = new RegExp(`^${REFERENCE_PREFIX}-\\d{2}-[${REFERENCE_ALPHABET}]{4,6}$`);

const YEAR_FORMAT = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', year: '2-digit' });

/** Zweistelliges Jahr in Europe/Berlin, z. B. „26“. */
export function referenceYear(now: Date): string {
  return YEAR_FORMAT.format(now).padStart(2, '0').slice(-2);
}

/** Zufällige Nummer mit kryptografischem Zufall (gleichverteilt über das Alphabet), z. B. für Tests. */
export function createReference(now: Date = new Date(), length: number = REFERENCE_CODE_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i++) code += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  return `${REFERENCE_PREFIX}-${referenceYear(now)}-${code}`;
}

const KEY_DOMAIN = 'be-reference:v1';

/**
 * Nummer zu einem Idempotency-Key: HMAC-SHA256(APPLICATION_TOKEN_SECRET, Key), gleichverteilt auf
 * das Alphabet abgebildet (Bytes ab 248 = 8 × 31 werden verworfen). Ohne das Geheimnis lässt
 * sich die Nummer nicht aus dem Key ableiten; der Key verlässt den Browser ohnehin nur zum Server.
 */
export function referenceForKey(
  idempotencyKey: string,
  now: Date = new Date(),
  secret: string = getSecret('APPLICATION_TOKEN_SECRET'),
  length: number = REFERENCE_CODE_LENGTH,
): string {
  const size = REFERENCE_ALPHABET.length;
  const limit = Math.floor(256 / size) * size;
  let code = '';
  for (let round = 0; code.length < length; round++) {
    const digest = createHmac('sha256', secret).update(`${KEY_DOMAIN}:${round}:${idempotencyKey}`).digest();
    for (const byte of digest) {
      if (byte >= limit) continue;
      code += REFERENCE_ALPHABET[byte % size];
      if (code.length === length) break;
    }
  }
  return `${REFERENCE_PREFIX}-${referenceYear(now)}-${code}`;
}

/** „ be-26-k7m4qx “ → „BE-26-K7M4QX“; null, wenn es keine gültige Nummer ist. */
export function normalizeReference(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const reference = value.trim().toUpperCase();
  return REFERENCE_PATTERN.test(reference) ? reference : null;
}

export function isReference(value: unknown): value is string {
  return typeof value === 'string' && REFERENCE_PATTERN.test(value);
}
