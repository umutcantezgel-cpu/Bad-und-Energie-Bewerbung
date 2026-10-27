import { COMPANY } from '@/lib/content/company';
import { FACTS, JE_NACH_STELLE, offenBei, type FactId } from '@/lib/content/facts';
import type { FaqItem } from '@/lib/content/faq';
import { jobCategoryLabels } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/schema';
import { fitDescription, perks } from '@/lib/seo/descriptions';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Copy of the home page, assembled from the facts registry (ROADMAP §5, §10).
 * Pure module: unit-tested for length limits in __tests__/content.test.ts.
 */

const NBSP = '\u00A0';

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
const upperFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Die Stellen, über die die Startseite spricht: alle, die gerade offen sind (Sammelfläche, lib/content/facts.ts). */
type GezeigteStellen = readonly Pick<Job, 'category'>[];

/** Title tag (≤ 60 characters), used without the layout's template. */
export const HOME_TITLE = 'SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer';

/** „A, B & C“. */
function joinLabels(labels: readonly string[]): string {
  return labels.length > 1 ? `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}` : (labels[0] ?? '');
}

/**
 * Meta description (110–155 characters, Seobility-Prüfpunkt in e2e/seo.spec.ts) from the jobs that are live right now
 * and the facts vacation30, flexibleHours, noFarAssembly, apply60s, radius35, noCvNeeded. Holidays and working time
 * come from the same rule as /jobs (lib/seo/descriptions.ts perks): „je nach Stelle“ while one of the live jobs leaves
 * them open (office S5, internship S4; Prüfung E-029, Runde 3). Longer candidates drop „keine Fernmontage“, then
 * shorten the job list to the first three types „& mehr“, then drop it, so a new job type can never push it past the
 * limit.
 */
export function homeDescription(liveJobs: GezeigteStellen): string {
  const city = COMPANY.address.city;
  const { satz, mitFernmontage } = perks(liveJobs);
  const apply = `In ${FACTS.apply60s.value} Sek. bewerben`;
  const allLabels = jobCategoryLabels(liveJobs);
  const labels = joinLabels(allLabels);
  const radius = FACTS.radius35.value ? ` und ${FACTS.radius35.value.replace(' ', NBSP)} Umkreis` : '';
  const general = `SHK-Jobs in ${city}${radius}. ${mitFernmontage}. ${apply}, ${lowerFirst(FACTS.noCvNeeded.short)}.`;
  if (!labels) return fitDescription(general);
  const candidates: [string, ...string[]] = [
    `SHK-Jobs in ${city}: ${labels}. ${mitFernmontage}. ${apply}.`,
    `SHK-Jobs in ${city}: ${labels}. ${satz}. ${apply}.`,
  ];
  if (allLabels.length > 3) {
    const top = `${allLabels.slice(0, 3).join(', ')} & mehr`;
    candidates.push(`SHK-Jobs in ${city}: ${top}. ${mitFernmontage}. ${apply}.`, `SHK-Jobs in ${city}: ${top}. ${satz}. ${apply}.`);
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
  /** Roadmap §10: two-part H1, the second line muted (heroZweitzeile). */
  title: `SHK-Jobs in ${COMPANY.address.city}.`,
  /** Facts: apply60s, noCvNeeded. */
  microcopy: `Dauert ca. ${FACTS.apply60s.value}${NBSP}Sekunden. ${FACTS.noCvNeeded.short}.`,
} as const;

/**
 * Zweite Zeile der h1, „Ehrliches Handwerk. Flexible Arbeitszeiten.“ (Inhaber E-027, Fakt flexibleHours, B28: keine
 * festen Endzeiten, kein „pünktlich Feierabend“). Die Startseite zeigt alle offenen Stellen (Sammelfläche): Ist die
 * Arbeitszeit für eine davon offen (Büro S5, Schülerpraktikum S4), steht „Je nach Stelle flexible Arbeitszeiten.“;
 * ist sie für keine belegt, die Zusage, die für den Betrieb gilt (noFarAssembly; Prüfung E-029, Runde 3).
 */
export function heroZweitzeile(stellen: GezeigteStellen): string {
  const offen = offenBei('flexibleHours', stellen).length;
  if (offen === 0) return `Ehrliches Handwerk. ${FACTS.flexibleHours.long}`;
  if (offen === stellen.length) return `Ehrliches Handwerk. ${FACTS.noFarAssembly.short}.`;
  return `Ehrliches Handwerk. ${upperFirst(JE_NACH_STELLE)} ${lowerFirst(FACTS.flexibleHours.long)}`;
}

/**
 * Einleitung (≤ 30 Wörter). Fakt aboveTariff in der Kurzform der Paketzeilen („über Tarif“); das Werkzeug nennen die
 * Anzeigen selbst (Inhaber 2026-10-27: Hilti nicht allgemein). Die Region bleibt dem Maß „35 km“ und #einsatzgebiet,
 * so steht der Regionssatz höchstens zweimal. Ist der Tarif für eine gezeigte Stelle offen (Büro S5), „Je nach Stelle …“.
 */
export function heroLead(stellen: GezeigteStellen): string {
  const paket = 'bezahlt über Tarif.';
  const jeStelle = offenBei('aboveTariff', stellen).length > 0;
  return `Wir suchen Verstärkung für Wärmepumpen, Heizungen und moderne Bäder. ${jeStelle ? `${upperFirst(JE_NACH_STELLE)} ${paket}` : upperFirst(paket)}`;
}

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
 * HERO_STATS für die gezeigten Stellen: Ist ein Fakt für eine davon offen (30 Tage Urlaub fürs Büro, S5), trägt das
 * Maß den Stellenbezug am Namen, „Tage Urlaub je nach Stelle“, wie im Hub /arbeiten-bei-uns (Prüfung E-029, Runde 3).
 */
export function heroStats(stellen: GezeigteStellen): readonly HeroStat[] {
  return HERO_STATS.map((stat) => (offenBei(stat.factId, stellen).length > 0 ? { ...stat, label: `${stat.label} ${JE_NACH_STELLE}` } : stat));
}

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
