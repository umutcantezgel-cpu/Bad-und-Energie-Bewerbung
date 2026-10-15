import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import type { Job, JobCategory } from '@/lib/jobs/schema';
import { getThema, themaPath } from '@/lib/themen/registry';

/**
 * Einleitung von #stellen (V6-G2), gebaut aus den Stellen, die gerade live sind: Sie nennt nur Bereiche mit
 * offener Stelle. „Heizungsbauer“ ist das Suchwort der Anlagenmechaniker-Stelle (seo.secondaryKeywords
 * „Heizungsbauer Jobs Wetzlar“) und steht im Titel der Startseite (HOME_TITLE). Seit E-030 nennt keine Stelle einen
 * Betrag: Der zweite Satz sagt „Lohn auf Anfrage“ (Fakt payOnRequest). Geprüft in __tests__/stellen-text.test.ts.
 */

/** Bereich je Stellenart im Satz „Jobs … in Wetzlar“. */
export const STELLEN_BEREICH: Readonly<Record<JobCategory, string>> = Object.freeze({
  anlagenmechaniker: 'für Anlagenmechaniker und Heizungsbauer',
  kundendienst: 'im Kundendienst',
  projektleitung: 'in der Projektleitung',
  ausbildung: 'in der Ausbildung',
  helfer: 'im Quereinstieg',
  buero: 'im Büro',
  praktikum: 'im Schülerpraktikum',
});

/** „A, B und C“. */
function aufzaehlung(teile: readonly string[]): string {
  return teile.length > 1 ? `${teile.slice(0, -1).join(', ')} und ${teile[teile.length - 1]}` : (teile[0] ?? '');
}

/**
 * „Jobs für Anlagenmechaniker und Heizungsbauer in Wetzlar, dazu im Kundendienst, in der Projektleitung und in der
 * Ausbildung. Jede Stelle mit allen Eckdaten. Lohn auf Anfrage.“ Ohne offene Anlagenmechaniker-Stelle: „SHK-Jobs in
 * Wetzlar im Kundendienst …“. „Lohn auf Anfrage“ nur, wenn eine Stelle etwas zur Bezahlung sagt (nicht beim
 * Schülerpraktikum allein).
 */
export function stellenEinleitung(jobs: readonly Pick<Job, 'category' | 'pay'>[]): string {
  const city = COMPANY.address.city;
  const kategorien = [...new Set(jobs.map((job) => job.category))];
  const weitere = kategorien.filter((kategorie) => kategorie !== 'anlagenmechaniker').map((k) => STELLEN_BEREICH[k]);
  const lohn = jobs.some((job) => job.pay === 'auf-anfrage') ? ` ${FACTS.payOnRequest.short}.` : '';
  const eckdaten = `Jede Stelle mit allen Eckdaten.${lohn}`;
  if (kategorien.length === 0) return `SHK-Jobs in ${city}: Gerade ist keine Stelle ausgeschrieben.`;
  const satz = kategorien.includes('anlagenmechaniker')
    ? `Jobs ${STELLEN_BEREICH.anlagenmechaniker} in ${city}${weitere.length > 0 ? `, dazu ${aufzaehlung(weitere)}` : ''}.`
    : `SHK-Jobs in ${city} ${aufzaehlung(weitere)}.`;
  return `${satz} ${eckdaten}`;
}

/**
 * Weg zur Seite „Büro und Verwaltung“ unter den Stellen (E-031), nur solange eine Bürostelle live ist: eine Frage als
 * Beschriftung und der Name des Themas als Linktext (ein Ankertext, ein Ziel). Ohne Bürostelle null.
 */
export function bueroTeaser(jobs: readonly Pick<Job, 'category'>[]): { frage: string; href: string; label: string } | null {
  if (!jobs.some((job) => job.category === 'buero')) return null;
  const thema = getThema('buero-und-verwaltung');
  return { frage: 'Lieber im Büro?', href: themaPath(thema), label: thema.name };
}
