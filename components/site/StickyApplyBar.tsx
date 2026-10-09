import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { buildWhatsAppUrl, whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';
import { applyLabelFor } from './nav';
import { StickyApplyBarClient } from './StickyApplyBarClient';

/**
 * Mobile apply bar (below lg). Server wrapper: resolves the job-page labels from the registry
 * and the WhatsApp link from the contact data, so the client part only receives strings and
 * stays free of job data, zod and SITE_CONFIG.
 */
export function StickyApplyBar() {
  // Only open job pages embed the flow (#bewerben); a closed page falls back to „Jetzt bewerben“.
  const now = new Date();
  const jobLabels = Object.fromEntries(
    getActiveJobs()
      .filter((job) => isJobLive(job, now))
      .map((job) => [job.slug, applyLabelFor(job)]),
  );
  // The bar never shows in focus mode (/bewerbung…), so the general message always fits.
  const whatsappHref = buildWhatsAppUrl(whatsAppMessageFor('/'));
  return <StickyApplyBarClient jobLabels={jobLabels} whatsappHref={whatsappHref} />;
}
