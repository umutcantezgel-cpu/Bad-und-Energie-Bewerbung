/**
 * Bürozeiten-Prüfung in Europe/Berlin (Sommer- und Winterzeit über Intl), unabhängig von der
 * Zeitzone des Geräts. Feiertage kennt sie nicht: Dann steht der Hinweis eben nicht da.
 */

export interface OpeningHoursSpec {
  /** Englische Wochentage wie in schema.org, z. B. 'Monday'. */
  days: readonly string[];
  /** 'HH:MM' */
  opens: string;
  /** 'HH:MM' */
  closes: string;
}

export const COMPANY_TIME_ZONE = 'Europe/Berlin';

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/** Wochentag (englisch) und Minuten seit Mitternacht in der gegebenen Zeitzone. */
export function zonedWeekdayAndMinutes(date: Date, timeZone = COMPANY_TIME_ZONE): { weekday: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return { weekday: get('weekday'), minutes: toMinutes(`${get('hour')}:${get('minute')}`) % (24 * 60) };
}

/** True, wenn das Büro zu diesem Zeitpunkt laut Öffnungszeiten besetzt ist. */
export function isWithinOpeningHours(
  date: Date,
  spec: readonly OpeningHoursSpec[],
  timeZone = COMPANY_TIME_ZONE,
): boolean {
  if (Number.isNaN(date.getTime())) return true;
  const { weekday, minutes } = zonedWeekdayAndMinutes(date, timeZone);
  return spec.some(
    (entry) => entry.days.includes(weekday) && minutes >= toMinutes(entry.opens) && minutes < toMinutes(entry.closes),
  );
}

/** „8. Oktober 2026, 14:32 Uhr“ in Berliner Zeit. */
export function formatBerlinDateTime(date: Date, timeZone = COMPANY_TIME_ZONE): string {
  const day = new Intl.DateTimeFormat('de-DE', { timeZone, day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  const time = new Intl.DateTimeFormat('de-DE', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  return `${day}, ${time} Uhr`;
}
