import 'server-only';
import { randomInt } from 'node:crypto';

/**
 * Bewerbungsnummer „BE-26-K7M4QX“ (ROADMAP §3.2): Präfix, Jahr (Europe/Berlin, zweistellig) und
 * ein Zufallsteil aus einem eindeutig lesbaren Alphabet (ohne 0/O, 1/I/L). Phase 1 hat keine
 * Datenbank, die Eindeutigkeit prüfen könnte; sechs Zeichen (31^6 ≈ 887 Mio.) machen
 * Kollisionen praktisch ausgeschlossen. Phase 2 sichert sie zusätzlich per Unique-Index ab.
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

/** Neue Bewerbungsnummer mit kryptografischem Zufall (gleichverteilt über das Alphabet). */
export function createReference(now: Date = new Date(), length: number = REFERENCE_CODE_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i++) code += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
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
