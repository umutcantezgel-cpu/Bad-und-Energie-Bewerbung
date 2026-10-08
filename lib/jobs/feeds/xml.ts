import { formatNumber } from '../format';
import type { Job } from '../schema';

/** Entfernt Steuerzeichen, die in XML 1.0 verboten sind. */
function stripInvalidXmlChars(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '');
}

export function escapeXml(value: string): string {
  return stripInvalidXmlChars(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** CDATA-Abschnitt; ein enthaltenes „]]>“ wird auf zwei Abschnitte verteilt. */
export function cdata(value: string): string {
  return `<![CDATA[${stripInvalidXmlChars(value).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

export function element(name: string, value: string | number, mode: 'cdata' | 'text' = 'cdata'): string {
  const text = String(value);
  return `<${name}>${mode === 'cdata' ? cdata(text) : escapeXml(text)}</${name}>`;
}

/** RFC-822-Datum, wie Indeed es erwartet: 'Sun, 01 Mar 2026 00:00:00 GMT'. */
export function toRfc822(date: Date): string {
  return date.toUTCString();
}

export function datePart(value: string): string {
  return value.slice(0, 10);
}

const SALARY_PERIOD: Record<NonNullable<Job['salary']>['unit'], string> = {
  MONTH: 'pro Monat',
  HOUR: 'pro Stunde',
  YEAR: 'pro Jahr',
};

/** Gehalt als Klartext für Jobbörsen, ohne Sonderleerzeichen: '3.600 € - 4.600 € pro Monat'. */
export function salaryText(job: Job): string | null {
  if (!job.salary) return null;
  const { min, max, unit } = job.salary;
  const amount = min === max ? `${formatNumber(min)} €` : `${formatNumber(min)} € - ${formatNumber(max)} €`;
  return `${amount} ${SALARY_PERIOD[unit]}`;
}

/** Indeed-/Aggregator-Jobtyp. */
export function feedJobType(job: Job): string {
  if (job.employment.kind === 'ausbildung') return 'apprenticeship';
  return job.employment.kind === 'teilzeit' ? 'parttime' : 'fulltime';
}

export const XML_DECLARATION = '<?xml version="1.0" encoding="utf-8"?>';
