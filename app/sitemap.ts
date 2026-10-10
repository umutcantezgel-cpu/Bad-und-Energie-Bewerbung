import type { MetadataRoute } from 'next';
import { jobUrl } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive, type Job } from '@/lib/jobs/registry';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';

/**
 * Indexable pages only, generated from the job registry (ROADMAP §10).
 * Left out on purpose: /datenschutz and /impressum (noindex), /bewerbung/danke and
 * /bewerbung/mappe (noindex), closed or expired job pages (noindex), feeds and /api.
 * Every URL is the page's canonical exactly as rendered (getCleanCanonicalUrl, jobUrl): the root
 * without a trailing slash (V6-B). Dates are the jobs' own `updatedAt`; nothing is invented.
 */
/** Hourly, like the feeds: expired job pages leave the sitemap without a deploy. */
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const jobs = getActiveJobs().filter((job) => isJobLive(job, now));
  const latest = latestUpdate(jobs);
  const listing = latest ? { lastModified: latest } : {};

  return [
    { url: getCleanCanonicalUrl('/'), ...listing },
    { url: getCleanCanonicalUrl('/jobs'), ...listing },
    ...jobs.map((job) => ({ url: jobUrl(job), lastModified: job.updatedAt })),
    { url: getCleanCanonicalUrl('/bewerbung'), ...listing },
  ];
}

/** Home, /jobs and /bewerbung (Wegweiser im Erklärteil) list the live jobs, so they change whenever a job changes. */
function latestUpdate(jobs: readonly Job[]): string | undefined {
  return jobs.map((job) => job.updatedAt).sort().at(-1);
}
