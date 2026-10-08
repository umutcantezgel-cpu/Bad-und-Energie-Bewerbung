import { COMPANY } from '@/lib/content/company';
import { FACTS, type FactId } from '@/lib/content/facts';
import type { FaqItem } from '@/lib/content/faq';
import { jobCategoryLabels } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/schema';
import { fitDescription } from '@/lib/seo/descriptions';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Copy of the home page, assembled from the facts registry (ROADMAP §5, §10).
 * Pure module: unit-tested for length limits in __tests__/content.test.ts.
 */

const NBSP = '\u00A0';

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** Title tag (≤ 60 characters), used without the layout's template. */
export const HOME_TITLE = 'SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer';

/** „A, B & C“. */
function joinLabels(labels: readonly string[]): string {
  return labels.length > 1 ? `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}` : (labels[0] ?? '');
}

/**
 * Meta description (≤ 155 characters) from the jobs that are live right now and the facts
 * vacation30, friday1330, noFarAssembly, apply60s. Longer candidates drop „keine Fernmontage“,
 * then the job list, so a new job type can never push it past the limit.
 */
export function homeDescription(liveJobs: readonly Pick<Job, 'category'>[]): string {
  const city = COMPANY.address.city;
  const perks = `${FACTS.vacation30.short}, freitags ab ${FACTS.friday1330.value} frei`;
  const noFar = lowerFirst(FACTS.noFarAssembly.short);
  const apply = `In ${FACTS.apply60s.value} Sek. bewerben.`;
  const labels = joinLabels(jobCategoryLabels(liveJobs));
  const general = `SHK-Jobs in ${city}. ${perks}, ${noFar}. ${apply}`;
  if (!labels) return fitDescription(general);
  return fitDescription(
    `SHK-Jobs in ${city}: ${labels}. ${perks}, ${noFar}. ${apply}`,
    `SHK-Jobs in ${city}: ${labels}. ${perks}. ${apply}`,
    general,
  );
}

/**
 * Fallback for the root layout, without the job list: it is built once per server process and
 * must not name a job after its validThrough. The home page builds its own (app/page.tsx).
 */
export const HOME_DESCRIPTION = homeDescription([]);

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
  /**
   * ≤ 30 words. Facts: aboveTariff, hilti. The region is left to the „35 km“ figure below and the
   * #einsatzgebiet section, so „Wetzlar, Gießen und dem Lahn-Dill-Kreis“ appears at most twice.
   */
  lead:
    'Wir suchen Verstärkung für Wärmepumpen, Heizungen und moderne Bäder. Bezahlt über Tarif und mit persönlicher ' +
    'Hilti-Ausstattung.',
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

/**
 * Closing band. „60 Sekunden“ and „kein Lebenslauf“ already stand in the hero and the process
 * (each at most twice per page), so the band only adds the reply promise. Fact: quickResponse.
 */
export const CTA = {
  title: 'Bewirb dich bei uns.',
  lead: FACTS.quickResponse.long,
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
