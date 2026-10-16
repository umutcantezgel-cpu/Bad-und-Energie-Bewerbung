import {
  COMPANY,
  DISCRETION_PROMISE,
  FACTS,
  FAQ_ITEMS,
  PROCESS_INTRO,
  STELLEN_FAQ_ITEMS,
  REGION,
  ANDERE_ABLAEUFE_TITEL,
  FUER_FACHKRAEFTE,
  sammelAblauf,
  type ProcessStep,
} from '@/lib/content';
import { gebietText } from '@/components/jobs/liste/inhalt-text';
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

/**
 * Process on a page about all open jobs (lib/content/process.ts sammelAblauf): the steps for skilled trades, step 3
 * marked „Für Fachkräfte“, then per other kind of job among them what differs (Prüfung E-029, Runde 3).
 */
function processLines(jobs: readonly Job[]): string[] {
  const { schritte, varianten } = sammelAblauf(jobs);
  // „3. Start mit Werkzeug und Fahrzeug (für Fachkräfte): Du bekommst …“ statt zweier Doppelpunkte hintereinander
  const bezug = `${FUER_FACHKRAEFTE}: `;
  const zeile = (step: ProcessStep) =>
    step.text.startsWith(bezug)
      ? `${step.number}. ${step.title} (${FUER_FACHKRAEFTE.charAt(0).toLowerCase()}${FUER_FACHKRAEFTE.slice(1)}): ${step.text.slice(bezug.length)}`
      : `${step.number}. ${step.title}: ${step.text}`;
  return [
    ...schritte.map(zeile),
    '',
    ...(varianten.length > 0 ? [`${ANDERE_ABLAEUFE_TITEL}:`, ...varianten.map((variante) => `- ${variante.name}: ${variante.text}`), ''] : []),
  ];
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
    ...processLines([...jobs, ...extra]),
    DISCRETION_PROMISE,
    `Bewerben: ${base}/bewerbung`,
    '',
    '## 4. Häufige Fragen',
    '',
    ...FAQ_ITEMS.flatMap((item) => [`### ${item.question}`, item.answer, '']),
    // Fragen der Stellenseiten (Plan §C5): Bezahlung auf Anfrage, Berufsschule, Quereinstieg, Büro, Praktikum
    ...STELLEN_FAQ_ITEMS.flatMap((item) => [`### ${item.question}`, item.answer, '']),
    '## 5. Einsatzgebiet',
    // Wie auf /jobs und der Startseite (Prüfrunde 4 D4-1): mit Stelle am Firmensitz gilt der Satz nur für Baustellen
    // und Kundendienst, dann „Das Büro ist am Firmensitz.“
    `${REGION.headline} ${gebietText([...jobs, ...extra])}`,
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
