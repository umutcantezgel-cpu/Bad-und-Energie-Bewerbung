/** Darstellung in der A4-Vorschau. Client-sicher. */

const LETTER_DATE = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

/** „8. Oktober 2026“ */
export function formatLetterDate(date: Date): string {
  return LETTER_DATE.format(date);
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
