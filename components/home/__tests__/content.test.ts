import { describe, expect, it } from 'vitest';
import { BENEFIT_FACT_IDS, CTA, HERO, HERO_STATS, HOME_DESCRIPTION, HOME_TITLE, buildFaqPageJsonLd, homeDescription } from '../content';
import { FACTS } from '@/lib/content/facts';
import { FAQ_ITEMS } from '@/lib/content/faq';
import { getActiveJobs } from '@/lib/jobs/registry';

const words = (text: string) => text.trim().split(/\s+/).length;

describe('home copy', () => {
  it('title fits the SERP budget (roadmap §10)', () => {
    expect(HOME_TITLE).toBe('SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer');
    expect(HOME_TITLE.length).toBeLessThanOrEqual(60);
  });

  it('description stays within 155 characters, names the live job types and facts verbatim', () => {
    const description = homeDescription(getActiveJobs());
    expect(description.length).toBeLessThanOrEqual(155);
    expect(description).toContain(FACTS.vacation30.short);
    expect(description).toContain('13:30');
    expect(description).toContain('Anlagenmechaniker, Kundendienst, Obermonteur & Ausbildung');
  });

  it('layout fallback description names no job, so it cannot outlive a validThrough', () => {
    expect(HOME_DESCRIPTION).toBe(homeDescription([]));
    expect(HOME_DESCRIPTION).not.toMatch(/Kundendienst|Obermonteur|Ausbildung/);
  });

  it('description keeps „keine Fernmontage“ while it fits and drops the list before overflowing', () => {
    const fewer = homeDescription([{ category: 'anlagenmechaniker' }, { category: 'ausbildung' }]);
    expect(fewer).toBe(
      'SHK-Jobs in Wetzlar: Anlagenmechaniker & Ausbildung. 30 Tage Urlaub, freitags ab 13:30 frei, keine Fernmontage. In 60 Sek. bewerben.',
    );
    expect(homeDescription([])).toBe('SHK-Jobs in Wetzlar. 30 Tage Urlaub, freitags ab 13:30 frei, keine Fernmontage. In 60 Sek. bewerben.');
    const categories = ['anlagenmechaniker', 'kundendienst', 'projektleitung', 'ausbildung', 'helfer'] as const;
    const many = homeDescription(categories.map((category) => ({ category })));
    expect(many.length).toBeLessThanOrEqual(155);
  });

  it('hero lead has at most 30 words and leaves the region to the figures below', () => {
    expect(words(HERO.lead)).toBeLessThanOrEqual(30);
    expect(HERO.lead).not.toContain('Lahn-Dill-Kreis');
  });

  it('hero H1 follows roadmap §10', () => {
    expect(`${HERO.title} ${HERO.titleSecondLine}`).toBe('SHK-Jobs in Wetzlar. Ehrliches Handwerk. Pünktlich Feierabend.');
    expect(HERO.eyebrow).toBe('Seit 1926 · Wetzlar');
    expect(HERO.microcopy.replace(/\u00A0/g, ' ')).toBe('Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.');
  });

  it('shows the four key figures from the facts registry', () => {
    expect(HERO_STATS.map((s) => [s.value.replace(/\u00A0/g, ' '), s.label])).toEqual([
      ['13:30', 'Freitags Feierabend'],
      ['30', 'Tage Urlaub'],
      ['35 km', 'Einsatzradius'],
      ['1926', 'Gegründet'],
    ]);
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
