import { COMPANY, FACTS } from '@/lib/content';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import {
  TEXT_HEADERS,
  baseUrl,
  chamberLine,
  citationHint,
  companyClaim,
  contactLines,
  employerFacts,
  funnelOnlyJobs,
  funnelOnlyLine,
  jobLink,
  jobMetaLine,
  liveJobs,
} from './content';

// Static, regenerated hourly so a closed or expired job disappears without a deploy.
export const dynamic = 'force-static';
export const revalidate = 3600;

/** Short overview for AI answer engines (llmstxt.org): what the site is, which jobs, where to apply. */
export function GET(): Response {
  const now = new Date();
  const base = baseUrl();
  const jobs = liveJobs(now);
  const extra = funnelOnlyJobs();

  const lines = [
    `# ${COMPANY.legalName}: Karriere`,
    '',
    `> Karriereportal der ${COMPANY.legalName}, ${companyClaim(now)} in ${COMPANY.address.city} für Wärmepumpen, Heizung und Bad. Alle offenen Stellen mit Gehaltsspanne. ${FACTS.apply60s.long} ${FACTS.noCvNeeded.long}`,
    '',
    FACTS.radius35.long,
    '',
    '## Offene Stellen',
    ...(jobs.length > 0
      ? jobs.map((job) => `- ${jobLink(job)}: ${jobMetaLine(job)}. ${job.summary}`)
      : ['- Zurzeit ist keine Stelle ausgeschrieben. Initiativbewerbungen sind möglich.']),
    ...extra.map((job) => `- ${funnelOnlyLine(job)}`),
    '',
    '## Arbeitgeber',
    ...employerFacts(now).map((fact) => `- ${fact}`),
    `- ${chamberLine()}`,
    '',
    '## Bewerbung und Kontakt',
    `- [Bewerben in 60 Sekunden](${base}/bewerbung): ${FACTS.noCvNeeded.long}`,
    ...contactLines().map((line) => `- ${line}`),
    '',
    '## Daten',
    `- [Alle offenen Stellen](${base}/jobs)`,
    `- [Stellen als JSON (schema.org JobPosting)](${base}/feeds/jobs.json)`,
    `- [Sitemap](${base}/sitemap.xml)`,
    '',
    '## Optional',
    `- [Ausführliche Fassung mit allen Stellentexten](${base}/llms-full.txt)`,
    `- [Website für Kunden](${SITE_CONFIG.consumerUrl})`,
    `- [Impressum](${base}/impressum)`,
    `- [Datenschutz](${base}/datenschutz)`,
    '',
    citationHint(),
    '',
  ];

  return new Response(lines.join('\n'), { headers: TEXT_HEADERS });
}
