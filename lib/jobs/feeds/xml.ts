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

const FEED_JOB_TYPE: Record<Job['employment']['kind'], string> = {
  vollzeit: 'fulltime',
  teilzeit: 'parttime',
  // Indeed nimmt mehrere Jobtypen durch Komma getrennt.
  'voll-oder-teilzeit': 'fulltime, parttime',
  ausbildung: 'apprenticeship',
  praktikum: 'internship',
};

/**
 * Indeed-/Aggregator-Jobtyp. Ein Gehaltsfeld gibt es in keinem Feed (E-030: Lohn auf Anfrage); die Beschreibung nennt
 * „Lohn: auf Anfrage“ wie die Seite.
 */
export function feedJobType(job: Job): string {
  return FEED_JOB_TYPE[job.employment.kind];
}

export const XML_DECLARATION = '<?xml version="1.0" encoding="utf-8"?>';
