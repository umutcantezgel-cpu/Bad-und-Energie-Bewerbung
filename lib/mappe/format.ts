/** Darstellung in der A4-Vorschau. Client-sicher. */

const LETTER_DATE = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

/** „8. Oktober 2026“ */
export function formatLetterDate(date: Date): string {
  return LETTER_DATE.format(date);
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const UTC_DATE = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/**
 * Datum aus einem Datumsfeld („2026-12-01“) ausgeschrieben: „1. Dezember 2026“. Alles andere (auch ein ungültiges
 * Datum wie „2026-02-30“ oder ein von Hand getipptes „01.12.2026“) bleibt, wie es ist. Gerechnet in UTC, damit kein
 * Zeitzonenversatz den Tag verschiebt.
 */
export function formatIsoDate(value: string): string {
  const text = value.trim();
  const match = ISO_DATE.exec(text);
  if (!match) return text;
  const [jahr, monat, tag] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(jahr, monat - 1, tag));
  if (date.getUTCFullYear() !== jahr || date.getUTCMonth() !== monat - 1 || date.getUTCDate() !== tag) return text;
  return UTC_DATE.format(date);
}

/** Ort ohne Postleitzahl für die Datumszeile: „35578 Wetzlar“ → „Wetzlar“. */
export function placeFromLocation(location: string): string {
  return location
    .trim()
    .replace(/^(?:D-)?\d{4,5}\s+/i, '')
    .trim();
}

/** „Wetzlar, 8. Oktober 2026“; ohne Ort nur das Datum. */
export function dateLine(location: string, date: string): string {
  const place = placeFromLocation(location);
  if (!date) return place;
  return place ? `${place}, ${date}` : date;
}
