import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { applyLabelFor } from './nav';
import { StickyApplyBarClient } from './StickyApplyBarClient';

/**
 * Mobile apply bar (below lg). Server wrapper: resolves the job-page labels from the registry,
 * so the client part stays free of job data and zod.
 */
export function StickyApplyBar() {
  // Only open job pages embed the flow (#bewerben); a closed page falls back to „Jetzt bewerben“.
  const now = new Date();
  const jobLabels = Object.fromEntries(
    getActiveJobs()
      .filter((job) => isJobLive(job, now))
      .map((job) => [job.slug, applyLabelFor(job)]),
  );
  return <StickyApplyBarClient jobLabels={jobLabels} />;
}
