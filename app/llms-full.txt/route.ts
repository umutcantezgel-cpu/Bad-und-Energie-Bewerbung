import {
  COMPANY,
  DISCRETION_PROMISE,
  FACTS,
  FAQ_ITEMS,
  PROCESS_INTRO,
  STELLEN_FAQ_ITEMS,
  REGION,
  getProcessSteps,
  processAudienceFor,
  type ProcessAudience,
} from '@/lib/content';
import { berufKategorie } from '@/lib/jobs/berufe';
import { jobUrl, toPlainDescription } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import {
  TEXT_HEADERS,
  alsoKnownAsLine,
  baseUrl,
  chamberLine,
  citationHint,
  contactLines,
  einsatzgebietBlocks,
  employerFacts,
  funnelOnlyJobs,
  funnelOnlyLine,
  jobMetaLine,
  liveJobs,
  themenBlocks,
} from '../llms.txt/content';

export const dynamic = 'force-static';
export const revalidate = 3600;

const START_LABEL: Record<Exclude<ProcessAudience, 'fachkraft'>, string> = {
  ausbildung: 'Start in der Ausbildung',
  quereinstieg: 'Start im Quereinstieg',
  buero: 'Start im Büro',
  praktikum: 'Start im Schülerpraktikum',
};

/**
 * Step 3 differs for apprentices, career changers, the office and the school internship (by category, not by question
 * set: the internship asks like the apprenticeship, but has its own process); listed only if such a job is open.
 */
function startVariants(jobs: readonly Job[]): string[] {
  const audiences = new Set(jobs.map((job) => processAudienceFor({ category: job.category, questionSet: job.apply.questionSet })));
  const lines = (['ausbildung', 'quereinstieg', 'buero', 'praktikum'] as const)
    .filter((audience) => audiences.has(audience))
    .map((audience) => `${START_LABEL[audience]}: ${getProcessSteps(audience)[2].text}`);
  return lines.length > 0 ? [...lines, ''] : [];
}

/** Full version of /llms.txt: every job text as on its page, plus process, FAQ, region and contact. */
export function GET(): Response {
  const now = new Date();
  const base = baseUrl();
  const jobs = liveJobs(now);
  const extra = funnelOnlyJobs();

  const jobBlocks = jobs.flatMap((job) => [
    `### ${job.title}`,
    '',
    `- Stellenseite: ${jobUrl(job)}`,
    `- Referenz: ${job.referenceCode}`,
    `- Eckdaten: ${jobMetaLine(job)}`,
    `- Beruf: ${berufKategorie(job.beruf)}`,
    ...(job.alsoKnownAs.length > 0 ? [`- ${alsoKnownAsLine(job)}`] : []),
    '',
    toPlainDescription(job).replace(/ /g, ' '),
    '',
  ]);

  const lines = [
    `# ${COMPANY.legalName}: Karriere (ausführlich)`,
    '',
    `> Karriereportal der ${COMPANY.legalName}, ${FACTS.founded1926.short} in ${COMPANY.address.city}. ${FACTS.apply60s.long} ${FACTS.noCvNeeded.long}`,
    '',
    '## 1. Arbeitgeber',
    `- Firma: ${COMPANY.legalName}`,
    `- Gegründet: ${COMPANY.foundingYear}`,
    `- Handelsregister: ${COMPANY.register.full}`,
    `- ${chamberLine()}`,
    ...contactLines().map((line) => `- ${line}`),
    `- Karriereportal: ${base}`,
    `- Website für Kunden: ${SITE_CONFIG.consumerUrl}`,
    '',
    ...employerFacts(now).map((fact) => `- ${fact}`),
    `- ${FACTS.heatPumpBrands.long}`,
    `- ${FACTS.countyPartner.long}`,
    '',
    '## 2. Offene Stellen',
    '',
    ...(jobs.length > 0 ? jobBlocks : ['Zurzeit ist keine Stelle ausgeschrieben. Initiativbewerbungen sind möglich.', '']),
    ...(extra.length > 0 ? ['### Weitere Einstiegsmöglichkeit', '', ...extra.map((job) => `- ${funnelOnlyLine(job)}`), ''] : []),
    '## 3. Bewerbung und Ablauf',
    `${PROCESS_INTRO.title}. ${PROCESS_INTRO.text}`,
    '',
    ...getProcessSteps('fachkraft').map((step) => `${step.number}. ${step.title}: ${step.text}`),
    '',
    ...startVariants([...jobs, ...extra]),
    DISCRETION_PROMISE,
    `Bewerben: ${base}/bewerbung`,
    '',
    '## 4. Häufige Fragen',
    '',
    ...FAQ_ITEMS.flatMap((item) => [`### ${item.question}`, item.answer, '']),
    // Fragen der Stellenseiten (Plan §C5): Bezahlung auf Anfrage, Berufsschule, Quereinstieg, Büro, Praktikum
    ...STELLEN_FAQ_ITEMS.flatMap((item) => [`### ${item.question}`, item.answer, '']),
    '## 5. Einsatzgebiet',
    `${REGION.headline} ${REGION.summary}`,
    '',
    ...einsatzgebietBlocks(),
    '## 6. Arbeiten bei uns',
    ...themenBlocks(now),
    '## 7. Daten und Feeds',
    `- Alle Stellen: ${base}/jobs`,
    `- JSON (schema.org JobPosting): ${base}/feeds/jobs.json`,
    `- Sitemap: ${base}/sitemap.xml`,
    `- Kurzfassung: ${base}/llms.txt`,
    '',
    '## 8. Zitationshinweis',
    citationHint(),
    '',
  ];

  return new Response(lines.join('\n'), { headers: TEXT_HEADERS });
}
