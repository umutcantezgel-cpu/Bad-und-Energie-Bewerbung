import { COMPANY } from '@/lib/content/company';
import { FACTS, type FactId } from '@/lib/content/facts';
import type { FaqItem } from '@/lib/content/faq';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Copy of the home page, assembled from the facts registry (ROADMAP §5, §10).
 * Pure module: unit-tested for length limits in __tests__/content.test.ts.
 */

const NBSP = '\u00A0';

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** Title tag (≤ 60 characters), used without the layout's template. */
export const HOME_TITLE = 'SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer';

/** Meta description (≤ 155 characters). Facts: vacation30, friday1330, noFarAssembly, apply60s. */
export const HOME_DESCRIPTION =
  `SHK-Jobs in ${COMPANY.address.city}: Anlagenmechaniker, Kundendienst & Ausbildung. ` +
  `${FACTS.vacation30.short}, freitags ab ${FACTS.friday1330.value} frei, ${lowerFirst(FACTS.noFarAssembly.short)}. ` +
  `In ${FACTS.apply60s.value} Sek. bewerben.`;

export const HOME_KEYWORDS = [
  'SHK Jobs Wetzlar',
  'Anlagenmechaniker SHK Wetzlar',
  'Heizungsbauer Jobs Wetzlar',
  'Kundendiensttechniker Wärmepumpe Wetzlar',
  'Ausbildung Anlagenmechaniker Wetzlar',
  'Handwerker Jobs Wetzlar',
];

export const HERO = {
  eyebrow: `Seit ${COMPANY.foundingYear} · ${COMPANY.address.city}`,
  /** Roadmap §10: two-part H1, the second line muted. */
  title: `SHK-Jobs in ${COMPANY.address.city}.`,
  titleSecondLine: 'Ehrliches Handwerk. Pünktlich Feierabend.',
  /** ≤ 30 words. Facts: aboveTariff, hilti, radius35. */
  lead:
    'Wir suchen Verstärkung für Wärmepumpen, Heizungen und moderne Bäder. Bezahlt über Tarif, mit persönlicher ' +
    'Hilti-Ausstattung und Baustellen nur in Wetzlar, Gießen und dem Lahn-Dill-Kreis.',
  /** Facts: apply60s, noCvNeeded. */
  microcopy: `Dauert ca. ${FACTS.apply60s.value}${NBSP}Sekunden. ${FACTS.noCvNeeded.short}.`,
} as const;

export interface HeroStat {
  factId: FactId;
  value: string;
  label: string;
}

const STAT_LABELS: Partial<Record<FactId, string>> = { radius35: 'Einsatzradius' };

/** 13:30 Freitags Feierabend · 30 Tage Urlaub · 35 km Einsatzradius · 1926 Gegründet. */
export const HERO_STATS: readonly HeroStat[] = (['friday1330', 'vacation30', 'radius35', 'founded1926'] as const).map(
  (factId) => {
    const fact = FACTS[factId];
    if (!fact.value || !fact.label) throw new Error(`Fakt „${factId}“ hat keine Kennzahl`);
    return { factId, value: fact.value.replace(' ', NBSP), label: STAT_LABELS[factId] ?? fact.label };
  },
);

/**
 * Benefit tiles (max. 8). vacation30 and friday1330 already sit in the hero stats, so each
 * fact appears at most twice on the page.
 */
export const BENEFIT_FACT_IDS = [
  'aboveTariff',
  'permanentContract',
  'noWeekendOnCall',
  'hilti',
  'vehicle',
  'ipadSmartphone',
  'paidCertifications',
  'familyTeam',
] as const satisfies readonly FactId[];

export const CTA = {
  title: `Bewirb dich in ${FACTS.apply60s.value}${NBSP}Sekunden.`,
  /** Facts: noCvNeeded, quickResponse. */
  lead: `${FACTS.noCvNeeded.long} ${FACTS.quickResponse.long}`,
} as const;

/** FAQPage for exactly the questions shown on the home page (the only FAQPage on the site). */
export function buildFaqPageJsonLd(items: readonly FaqItem[]) {
  const base = SITE_CONFIG.baseUrl.replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${base}/#faq`,
    inLanguage: 'de-DE',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
