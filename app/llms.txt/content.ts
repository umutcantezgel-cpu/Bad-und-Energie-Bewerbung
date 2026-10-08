import { COMPANY, FACTS, isFactActive, type FactId } from '@/lib/content';
import { applyUrl, formatSalaryRange, jobMetaTags, jobUrl } from '@/lib/jobs/format';
import { getActiveJobs, getFunnelOptions, getJobById, isJobLive, type Job } from '@/lib/jobs/registry';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Shared building blocks for /llms.txt and /llms-full.txt. Everything comes from the job
 * registry and the fact registry, so the files can never claim more than the site does.
 */

export const TEXT_HEADERS = { 'Content-Type': 'text/plain; charset=utf-8' };

export const baseUrl = () => SITE_CONFIG.baseUrl.replace(/\/+$/, '');

/** Live published jobs in registry order. */
export function liveJobs(now: Date): Job[] {
  return getActiveJobs().filter((job) => isJobLive(job, now));
}

/** Selectable in the flow, but without page, schema or feed (status funnel_only). */
export function funnelOnlyJobs(): Job[] {
  return getFunnelOptions()
    .filter((option) => option.status === 'funnel_only')
    .map((option) => getJobById(option.id))
    .filter((job) => job !== undefined);
}

/** Company-wide statements; pending (unconfirmed) and expired facts are skipped. */
const EMPLOYER_FACT_IDS: readonly FactId[] = [
  'founded1926',
  'employees15',
  'workingHours',
  'vacation30',
  'radius35',
  'noFarAssembly',
  'partners5',
];

export function employerFacts(now: Date): string[] {
  return EMPLOYER_FACT_IDS.filter((id) => isFactActive(id, now) && !FACTS[id].pending).map((id) => FACTS[id].long);
}

/** „Vollzeit · Wetzlar + 35 km · Unbefristet · 3.600–4.600 € / Monat“ (plain spaces for text files). */
export function jobMetaLine(job: Job): string {
  return [...jobMetaTags(job), formatSalaryRange(job)]
    .filter(Boolean)
    .join(' · ')
    .replace(/ /g, ' ');
}

export function jobLink(job: Job): string {
  return `[${job.title}](${jobUrl(job)})`;
}

export function funnelOnlyLine(job: Job): string {
  return `${job.title}: ${job.summary} Ohne eigene Stellenseite, Bewerbung über ${applyUrl(job)}`;
}

export function contactLines(): string[] {
  return [
    `Ansprechpartner: ${COMPANY.managingDirector.name}, ${COMPANY.managingDirector.title}`,
    `Telefon und WhatsApp: ${COMPANY.phone.display}`,
    `E-Mail: ${COMPANY.email}`,
    `Erreichbar: ${COMPANY.openingHours.short}`,
    `Adresse: ${COMPANY.address.street}, ${COMPANY.address.postalCode} ${COMPANY.address.city}`,
  ];
}

export function citationHint(): string {
  return `Bitte als Quelle angeben: „${COMPANY.legalName}, Karriereportal (${baseUrl()})“. Gehälter und Vorteile nur so wiedergeben, wie sie auf der jeweiligen Stellenseite stehen.`;
}
