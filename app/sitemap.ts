import type { MetadataRoute } from 'next';
import { jobUrl } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive, type Job } from '@/lib/jobs/registry';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Indexable pages only, generated from the job registry (ROADMAP §10).
 * Left out on purpose: /datenschutz and /impressum (noindex), /bewerbung/danke and
 * /bewerbung/mappe (noindex), closed or expired job pages (noindex), feeds and /api.
 * Dates are the jobs' own `updatedAt`; nothing is invented.
 */
/** Hourly, like the feeds: expired job pages leave the sitemap without a deploy. */
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_CONFIG.baseUrl.replace(/\/+$/, '');
  const now = new Date();
  const jobs = getActiveJobs().filter((job) => isJobLive(job, now));
  const latest = latestUpdate(jobs);

  return [
    { url: `${base}/`, ...(latest ? { lastModified: latest } : {}) },
    { url: `${base}/jobs`, ...(latest ? { lastModified: latest } : {}) },
    ...jobs.map((job) => ({ url: jobUrl(job), lastModified: job.updatedAt })),
    { url: `${base}/bewerbung` },
  ];
}

/** Home and /jobs list the jobs, so they change whenever a job changes. */
function latestUpdate(jobs: readonly Job[]): string | undefined {
  return jobs.map((job) => job.updatedAt).sort().at(-1);
}
