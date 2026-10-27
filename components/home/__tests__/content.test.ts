import { describe, expect, it } from 'vitest';
import {
  BENEFIT_FACT_IDS,
  CTA,
  HERO,
  HERO_RADIUS_LABEL,
  HERO_STATS,
  HOME_DESCRIPTION,
  HOME_TITLE,
  buildFaqPageJsonLd,
  heroLead,
  heroStats,
  heroZweitzeile,
  homeDescription,
} from '../content';
import { FACTS, offenBei } from '@/lib/content/facts';
import { FAQ_ITEMS } from '@/lib/content/faq';
import { jobCategoryLabels } from '@/lib/jobs/format';
import { getActiveJobs } from '@/lib/jobs/registry';
import { META_DESCRIPTION_MAX, META_DESCRIPTION_MIN } from '@/lib/seo/descriptions';

const words = (text: string) => text.trim().split(/\s+/).length;

describe('home copy', () => {
  it('title fits the SERP budget (roadmap §10)', () => {
    expect(HOME_TITLE).toBe('SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer');
    expect(HOME_TITLE.length).toBeLessThanOrEqual(60);
  });

  it('description stays within 110–155 characters, names the live job types and facts verbatim', () => {
    const description = homeDescription(getActiveJobs());
    expect(description.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(description.length).toBeGreaterThanOrEqual(META_DESCRIPTION_MIN);
    expect(description).toContain(FACTS.vacation30.short);
    expect(description).toContain('flexible Arbeitszeiten');
    expect(description).not.toMatch(/13:30|Feierabend|pünktlich|€|Gehalt/i);
    // Seit 2026-10-14 sind es sieben Stellenarten (fakten-abgleich S2–S5): Die volle Liste passt nicht mehr in 155
    // Zeichen; dann stehen die ersten drei Arten mit „& mehr“ darin. Mit den vier Arten von vorher steht sie wörtlich.
    expect(jobCategoryLabels(getActiveJobs())).toHaveLength(7);
    // Büro und Schülerpraktikum sind live: Urlaub und Arbeitszeit nur „je nach Stelle“, wie auf /jobs (Runde 3)
    expect(description).toBe(
      'SHK-Jobs in Wetzlar: Anlagenmechaniker, Kundendienst, Obermonteur & mehr. Je nach Stelle 30 Tage Urlaub und flexible Arbeitszeiten. In 60 Sek. bewerben.',
    );
    expect(description).not.toContain(`${FACTS.vacation30.short}, flexible Arbeitszeiten`);
    // Ohne Stelle einer offenen Kategorie ohne Zusatz (fünf Arten: die volle Liste passt ohne „keine Fernmontage“)
    expect(homeDescription(getActiveJobs().filter((job) => !['buero', 'praktikum'].includes(job.category)))).toBe(
      'SHK-Jobs in Wetzlar: Anlagenmechaniker, Kundendienst, Obermonteur, Ausbildung & Quereinstieg. 30 Tage Urlaub, flexible Arbeitszeiten. In 60 Sek. bewerben.',
    );
    const vier = (['anlagenmechaniker', 'kundendienst', 'projektleitung', 'ausbildung'] as const).map((category) => ({ category }));
    expect(homeDescription(vier)).toContain('Anlagenmechaniker, Kundendienst, Obermonteur & Ausbildung');
  });

  it('layout fallback description names no job, so it cannot outlive a validThrough', () => {
    expect(HOME_DESCRIPTION).toBe(homeDescription([]));
    expect(HOME_DESCRIPTION).not.toMatch(/Kundendienst|Obermonteur|Ausbildung/);
  });

  it('description keeps „keine Fernmontage“ while it fits and drops the list before overflowing', () => {
    const fewer = homeDescription([{ category: 'anlagenmechaniker' }, { category: 'ausbildung' }]);
    expect(fewer).toBe(
      'SHK-Jobs in Wetzlar: Anlagenmechaniker & Ausbildung. 30 Tage Urlaub, flexible Arbeitszeiten, keine Fernmontage. In 60 Sek. bewerben.',
    );
    expect(homeDescription([])).toBe(
      'SHK-Jobs in Wetzlar und 35\u00A0km Umkreis. 30 Tage Urlaub, flexible Arbeitszeiten, keine Fernmontage. In 60 Sek. bewerben, kein Lebenslauf nötig.',
    );
    const categories = ['anlagenmechaniker', 'kundendienst', 'projektleitung', 'ausbildung', 'helfer'] as const;
    const many = homeDescription(categories.map((category) => ({ category })));
    expect(many.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    // Jede Stufe hält auch die Untergrenze des Seobility-Prüfpunkts (e2e/seo.spec.ts).
    for (const text of [fewer, many, homeDescription([])]) expect(text.length).toBeGreaterThanOrEqual(META_DESCRIPTION_MIN);
  });

  it('hero lead has at most 30 words and leaves the region to the figures below', () => {
    for (const stellen of [getActiveJobs(), []]) {
      expect(words(heroLead(stellen))).toBeLessThanOrEqual(30);
      expect(heroLead(stellen)).not.toContain('Lahn-Dill-Kreis');
    }
  });

  it('hero H1 follows roadmap §10 with the owner\'s correction (flexible working hours, fakten-abgleich B28)', () => {
    const ohneOffene = getActiveJobs().filter((job) => !['buero', 'praktikum'].includes(job.category));
    expect(`${HERO.title} ${heroZweitzeile(ohneOffene)}`).toBe('SHK-Jobs in Wetzlar. Ehrliches Handwerk. Flexible Arbeitszeiten.');
    expect(heroZweitzeile(ohneOffene)).toContain(FACTS.flexibleHours.long);
    for (const stellen of [getActiveJobs(), ohneOffene, []]) expect(heroZweitzeile(stellen)).not.toMatch(/Feierabend|pünktlich/i);
    expect(HERO.eyebrow).toBe('Seit 1926 · Wetzlar');
    expect(HERO.microcopy.replace(/\u00A0/g, ' ')).toBe('Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.');
  });

  it('shows three key figures from the facts registry, the radius first (motif „35 km“, E-027), no clock time', () => {
    expect(HERO_STATS.map((s) => [s.value.replace(/\u00A0/g, ' '), s.label])).toEqual([
      ['35 km', 'Einsatzradius'],
      ['30', 'Tage Urlaub'],
      ['1926', 'Gegründet'],
    ]);
    expect(HERO_STATS.map((s) => s.factId)).toEqual(['radius35', 'vacation30', 'founded1926']);
    expect(HERO_RADIUS_LABEL).toBe('Einsatzgebiet rund um Wetzlar');
  });

  it('Sammelfläche (Runde 3): h1, Einleitung und Maße nennen keinen Fakt ohne Bezug, der für eine live Stelle offen ist', () => {
    const live = getActiveJobs();
    expect(offenBei('flexibleHours', live).length).toBeGreaterThan(0);
    expect(offenBei('vacation30', live).length).toBeGreaterThan(0);
    expect(offenBei('aboveTariff', live).length).toBeGreaterThan(0);
    // Arbeitszeit fürs Büro (S5) und das Schülerpraktikum (S4) offen
    expect(heroZweitzeile(live)).toBe('Ehrliches Handwerk. Je nach Stelle flexible Arbeitszeiten.');
    expect(heroZweitzeile(live)).not.toMatch(/\. Flexible Arbeitszeiten\./);
    // Tarif fürs Büro offen (S5)
    expect(heroLead(live)).toBe(
      'Wir suchen Verstärkung für Wärmepumpen, Heizungen und moderne Bäder. Je nach Stelle bezahlt über Tarif.',
    );
    // 30 Tage Urlaub fürs Büro offen (S5): „Tage Urlaub je nach Stelle“ wie im Hub
    expect(heroStats(live).map((s) => s.label)).toEqual(['Einsatzradius', 'Tage Urlaub je nach Stelle', 'Gegründet']);
    for (const stat of heroStats(live)) if (offenBei(stat.factId, live).length > 0) expect(stat.label, stat.factId).toMatch(/ je nach Stelle$/);
    // Ohne Stelle einer offenen Kategorie ohne Zusatz
    const ohneOffene = live.filter((job) => !['buero', 'praktikum'].includes(job.category));
    expect(heroLead(ohneOffene)).toBe('Wir suchen Verstärkung für Wärmepumpen, Heizungen und moderne Bäder. Bezahlt über Tarif.');
    expect(heroStats(ohneOffene)).toEqual(HERO_STATS);
    // Nur Stellen, für die die Arbeitszeit offen ist: die Zusage, die für den Betrieb gilt
    expect(heroZweitzeile(live.filter((job) => job.category === 'buero'))).toBe(`Ehrliches Handwerk. ${FACTS.noFarAssembly.short}.`);
  });

  it('uses at most 8 benefit tiles, none pending or time-limited, none repeating a hero figure', () => {
    expect(BENEFIT_FACT_IDS.length).toBeLessThanOrEqual(8);
    for (const id of BENEFIT_FACT_IDS) {
      expect(FACTS[id].pending).toBeUndefined();
      expect(FACTS[id].validUntil).toBeUndefined();
      expect(HERO_STATS.map((s) => s.factId)).not.toContain(id);
    }
  });

  it('closing band adds only the reply promise („60 Sekunden“ and „kein Lebenslauf“ stand above)', () => {
    expect(CTA.title).toBe('Bewirb dich bei uns.');
    expect(CTA.lead).toBe(FACTS.quickResponse.long);
    expect(`${CTA.title} ${CTA.lead}`).not.toMatch(/Lebenslauf|Sekunden/);
  });
});

describe('buildFaqPageJsonLd', () => {
  it('lists exactly the visible FAQ items', () => {
    const jsonLd = buildFaqPageJsonLd(FAQ_ITEMS);
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(jsonLd.mainEntity).toHaveLength(FAQ_ITEMS.length);
    jsonLd.mainEntity.forEach((entry, i) => {
      expect(entry.name).toBe(FAQ_ITEMS[i].question);
      expect(entry.acceptedAnswer.text).toBe(FAQ_ITEMS[i].answer);
    });
  });
});
