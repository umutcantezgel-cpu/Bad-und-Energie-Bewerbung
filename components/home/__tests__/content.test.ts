import { describe, expect, it } from 'vitest';
import { BENEFIT_FACT_IDS, CTA, HERO, HERO_STATS, HOME_DESCRIPTION, HOME_TITLE, buildFaqPageJsonLd } from '../content';
import { FACTS } from '@/lib/content/facts';
import { FAQ_ITEMS } from '@/lib/content/faq';

const words = (text: string) => text.trim().split(/\s+/).length;

describe('home copy', () => {
  it('title fits the SERP budget (roadmap §10)', () => {
    expect(HOME_TITLE).toBe('SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer');
    expect(HOME_TITLE.length).toBeLessThanOrEqual(60);
  });

  it('description stays within 155 characters and names facts verbatim', () => {
    expect(HOME_DESCRIPTION.length).toBeLessThanOrEqual(155);
    expect(HOME_DESCRIPTION).toContain(FACTS.vacation30.short);
    expect(HOME_DESCRIPTION).toContain('13:30');
    expect(HOME_DESCRIPTION).toContain('keine Fernmontage');
  });

  it('hero lead has at most 30 words', () => {
    expect(words(HERO.lead)).toBeLessThanOrEqual(30);
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

  it('closing band is built from facts', () => {
    expect(CTA.lead).toContain(FACTS.noCvNeeded.long);
    expect(CTA.lead).toContain(FACTS.quickResponse.long);
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
