import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { COMPANY } from '@/lib/content/company';
import { getActiveJobs, getJobById, isJobLive } from '@/lib/jobs/registry';
import { HERO, HOME_TITLE } from '../content';
import { JobList } from '../JobList';
import { STELLEN_BEREICH, stellenEinleitung } from '../stellen-text';

/**
 * V6-G2: Einleitung von #stellen. Wörter des Titels der Startseite („SHK Jobs Wetzlar: Anlagenmechaniker &
 * Heizungsbauer“) stehen sichtbar auf der Seite, nur für Bereiche mit offener Stelle.
 */

const NOW = new Date('2026-10-09T12:00:00Z');
const live = getActiveJobs().filter((job) => isJobLive(job, NOW));
const am = getJobById('anlagenmechaniker-shk')!;

describe('stellenEinleitung (Herkunft)', () => {
  it('nennt Anlagenmechaniker und Heizungsbauer in Wetzlar und die übrigen Bereiche der Stellen, die live sind', () => {
    expect(stellenEinleitung(live)).toBe(
      'Jobs für Anlagenmechaniker und Heizungsbauer in Wetzlar, dazu im Kundendienst, in der Projektleitung und in der ' +
        'Ausbildung. Jede Stelle mit Gehaltsspanne und allen Eckdaten.',
    );
    expect(stellenEinleitung(live)).toContain(COMPANY.address.city);
  });

  it('„Heizungsbauer“ ist das Suchwort der Anlagenmechaniker-Stelle und steht im Titel der Startseite', () => {
    expect(STELLEN_BEREICH.anlagenmechaniker).toContain('Heizungsbauer');
    expect(am.seo.secondaryKeywords).toContain(`Heizungsbauer Jobs ${COMPANY.address.city}`);
    expect(HOME_TITLE).toContain('Heizungsbauer');
    // „SHK-Jobs in Wetzlar“ trägt schon die h1 (HERO.title), die Einleitung wiederholt es nicht.
    expect(HERO.title).toBe(`SHK-Jobs in ${COMPANY.address.city}.`);
  });

  it('nennt nur Bereiche mit offener Stelle; jede veröffentlichte Stelle trägt eine Gehaltsspanne', () => {
    const ohneAusbildung = live.filter((job) => job.category !== 'ausbildung');
    expect(stellenEinleitung(ohneAusbildung)).not.toContain('Ausbildung');
    expect(stellenEinleitung(ohneAusbildung)).toContain('und in der Projektleitung.');
    const ohneAm = live.filter((job) => job.category !== 'anlagenmechaniker');
    expect(stellenEinleitung(ohneAm)).toBe(
      'SHK-Jobs in Wetzlar im Kundendienst, in der Projektleitung und in der Ausbildung. Jede Stelle mit Gehaltsspanne und allen Eckdaten.',
    );
    expect(stellenEinleitung([am])).toBe(
      'Jobs für Anlagenmechaniker und Heizungsbauer in Wetzlar. Jede Stelle mit Gehaltsspanne und allen Eckdaten.',
    );
    expect(stellenEinleitung([])).toBe('SHK-Jobs in Wetzlar: Gerade ist keine Stelle ausgeschrieben.');
    for (const job of live) expect(job.salary, job.id).toBeDefined();
  });

  it('JobList zeigt die Einleitung unter „Offene Stellen“', () => {
    const html = renderToStaticMarkup(createElement(JobList, { now: NOW }));
    expect(html).toContain(`<p class="max-w-prose text-lead text-ink-muted">${stellenEinleitung(live)}</p>`);
  });
});
