import { COMPANY } from '@/lib/content/company';
import type { Job, JobCategory } from '@/lib/jobs/schema';

/**
 * Einleitung von #stellen (V6-G2), gebaut aus den Stellen, die gerade live sind: Sie nennt nur Bereiche mit
 * offener Stelle. „Heizungsbauer“ ist das Suchwort der Anlagenmechaniker-Stelle (seo.secondaryKeywords
 * „Heizungsbauer Jobs Wetzlar“) und steht im Titel der Startseite (HOME_TITLE); die Gehaltsspanne trägt jede
 * veröffentlichte Stelle (Schema: published ⇒ salary). Geprüft in __tests__/stellen-text.test.ts.
 */

/** Bereich je Stellenart im Satz „Jobs … in Wetzlar“. */
export const STELLEN_BEREICH: Readonly<Record<JobCategory, string>> = Object.freeze({
  anlagenmechaniker: 'für Anlagenmechaniker und Heizungsbauer',
  kundendienst: 'im Kundendienst',
  projektleitung: 'in der Projektleitung',
  ausbildung: 'in der Ausbildung',
  helfer: 'im Quereinstieg',
});

/** „A, B und C“. */
function aufzaehlung(teile: readonly string[]): string {
  return teile.length > 1 ? `${teile.slice(0, -1).join(', ')} und ${teile[teile.length - 1]}` : (teile[0] ?? '');
}

/**
 * „Jobs für Anlagenmechaniker und Heizungsbauer in Wetzlar, dazu im Kundendienst, in der Projektleitung und in der
 * Ausbildung. Jede Stelle mit Gehaltsspanne und allen Eckdaten.“ Ohne offene Anlagenmechaniker-Stelle:
 * „SHK-Jobs in Wetzlar im Kundendienst …“.
 */
export function stellenEinleitung(jobs: readonly Pick<Job, 'category'>[]): string {
  const city = COMPANY.address.city;
  const kategorien = [...new Set(jobs.map((job) => job.category))];
  const weitere = kategorien.filter((kategorie) => kategorie !== 'anlagenmechaniker').map((k) => STELLEN_BEREICH[k]);
  const eckdaten = 'Jede Stelle mit Gehaltsspanne und allen Eckdaten.';
  if (kategorien.length === 0) return `SHK-Jobs in ${city}: Gerade ist keine Stelle ausgeschrieben.`;
  const satz = kategorien.includes('anlagenmechaniker')
    ? `Jobs ${STELLEN_BEREICH.anlagenmechaniker} in ${city}${weitere.length > 0 ? `, dazu ${aufzaehlung(weitere)}` : ''}.`
    : `SHK-Jobs in ${city} ${aufzaehlung(weitere)}.`;
  return `${satz} ${eckdaten}`;
}
