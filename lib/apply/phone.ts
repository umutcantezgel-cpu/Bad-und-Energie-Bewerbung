/**
 * Leichte Telefon-Prüfung für den Client (ohne libphonenumber-Metadaten im Bundle).
 * Der Server normalisiert später nach E.164; hier geht es nur um offensichtliche Tippfehler.
 */

const ALLOWED = /^[+()\d\s/.-]+$/;
export const PHONE_MIN_DIGITS = 6;
export const PHONE_MAX_DIGITS = 15;

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Erlaubte Zeichen und 6–15 Ziffern (E.164-Obergrenze), z. B. „0151 2345678“ oder „+49 151 2345678“. */
export function isPlausiblePhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || !ALLOWED.test(trimmed)) return false;
  const digits = phoneDigits(trimmed).length;
  return digits >= PHONE_MIN_DIGITS && digits <= PHONE_MAX_DIGITS;
}

/** Punkte als Trenner („0151.234567“) lehnt das Schema ab; sie werden zu Leerzeichen. */
export function normalizePhoneInput(value: string): string {
  return value.trim().replace(/\./g, ' ').replace(/\s{2,}/g, ' ');
}
