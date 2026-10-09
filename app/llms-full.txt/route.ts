import {
  COMPANY,
  DISCRETION_PROMISE,
  FACTS,
  FAQ_ITEMS,
  PROCESS_INTRO,
  REGION,
  getProcessSteps,
  type ProcessAudience,
} from '@/lib/content';
import { jobUrl, toPlainDescription } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import {
  TEXT_HEADERS,
  baseUrl,
  citationHint,
  contactLines,
  employerFacts,
  funnelOnlyJobs,
  funnelOnlyLine,
  jobMetaLine,
  liveJobs,
} from '../llms.txt/content';

export const dynamic = 'force-static';
export const revalidate = 3600;

const START_LABEL: Record<Exclude<ProcessAudience, 'fachkraft'>, string> = {
  ausbildung: 'Start in der Ausbildung',
  quereinstieg: 'Start im Quereinstieg',
};

/** Step 3 differs for apprentices and career changers; listed only if such a job is open. */
function startVariants(jobs: readonly Job[]): string[] {
  const audiences = new Set(jobs.map((job) => job.apply.questionSet));
  const lines = (['ausbildung', 'quereinstieg'] as const)
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
    `- ${COMPANY.hwk}, ${COMPANY.innung}`,
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
    '## 5. Einsatzgebiet',
    `${REGION.headline} ${REGION.summary}`,
    '',
    ...REGION.areas.map((area) => `- ${area.name} (bis ${area.radiusKm} km): ${area.cities.join(', ')}`),
    '',
    '## 6. Daten und Feeds',
    `- Alle Stellen: ${base}/jobs`,
    `- JSON (schema.org JobPosting): ${base}/feeds/jobs.json`,
    `- Sitemap: ${base}/sitemap.xml`,
    `- Kurzfassung: ${base}/llms.txt`,
    '',
    '## 7. Zitationshinweis',
    citationHint(),
    '',
  ];

  return new Response(lines.join('\n'), { headers: TEXT_HEADERS });
}
