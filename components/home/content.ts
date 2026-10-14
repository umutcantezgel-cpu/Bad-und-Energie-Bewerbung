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
 * Meta description (110–155 characters, Seobility-Prüfpunkt in e2e/seo.spec.ts) from the jobs that are live right now
 * and the facts vacation30, flexibleHours, noFarAssembly, apply60s, radius35, noCvNeeded. Longer candidates drop
 * „keine Fernmontage“, then shorten the job list to the first three types „& mehr“, then drop it, so a new job type
 * can never push it past the limit.
 */
export function homeDescription(liveJobs: readonly Pick<Job, 'category'>[]): string {
  const city = COMPANY.address.city;
  const perks = `${FACTS.vacation30.short}, ${lowerFirst(FACTS.flexibleHours.short)}`;
  const noFar = lowerFirst(FACTS.noFarAssembly.short);
  const apply = `In ${FACTS.apply60s.value} Sek. bewerben`;
  const allLabels = jobCategoryLabels(liveJobs);
  const labels = joinLabels(allLabels);
  const radius = FACTS.radius35.value ? ` und ${FACTS.radius35.value.replace(' ', NBSP)} Umkreis` : '';
  const general = `SHK-Jobs in ${city}${radius}. ${perks}, ${noFar}. ${apply}, ${lowerFirst(FACTS.noCvNeeded.short)}.`;
  if (!labels) return fitDescription(general);
  const candidates: [string, ...string[]] = [
    `SHK-Jobs in ${city}: ${labels}. ${perks}, ${noFar}. ${apply}.`,
    `SHK-Jobs in ${city}: ${labels}. ${perks}. ${apply}.`,
  ];
  if (allLabels.length > 3) {
    const top = `${allLabels.slice(0, 3).join(', ')} & mehr`;
    candidates.push(`SHK-Jobs in ${city}: ${top}. ${perks}, ${noFar}. ${apply}.`);
  }
  candidates.push(general);
  return fitDescription(...candidates);
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
  /**
   * Roadmap §10: two-part H1, the second line muted. „Flexible Arbeitszeiten.“ is the fact flexibleHours
   * (owner, 2026-10-12, fakten-abgleich B28): no fixed end time, no „pünktlich Feierabend“.
   */
  title: `SHK-Jobs in ${COMPANY.address.city}.`,
  titleSecondLine: `Ehrliches Handwerk. ${FACTS.flexibleHours.long}`,
  /**
   * ≤ 30 words. Facts: aboveTariff, hilti. The region is left to the „35 km“ figure below and the
   * #einsatzgebiet section, so the region sentence appears at most twice.
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

/**
 * Label of the big „35 km“ in the hero and on the root share image (motif E-027): fact radius35 („Alle
 * Baustellen liegen im Umkreis von 35 km um Wetzlar“, fakten-abgleich B29) in the words of the drawing.
 */
export const HERO_RADIUS_LABEL = `Einsatzgebiet rund um ${COMPANY.address.city}`;

/**
 * 35 km Einsatzradius · 30 Tage Urlaub · 1926 Gegründet. The radius leads: it is the motif of the hero
 * (E-027, „35 km“ instead of the clock at 13:30). Working time has no figure (flexibleHours has no value).
 */
export const HERO_STATS: readonly HeroStat[] = (['radius35', 'vacation30', 'founded1926'] as const).map(
  (factId) => {
    const fact = FACTS[factId];
    if (!fact.value || !fact.label) throw new Error(`Fakt „${factId}“ hat keine Kennzahl`);
    return { factId, value: fact.value.replace(' ', NBSP), label: STAT_LABELS[factId] ?? fact.label };
  },
);

/**
 * Benefit tiles (max. 8). vacation30 and radius35 already sit in the hero stats, flexibleHours in the
 * H1, so each fact appears at most twice on the page.
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
