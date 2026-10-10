import { notFound } from 'next/navigation';
import { COMPANY } from '@/lib/content';
import { getJobBySlug, getJobPageSlugs, isJobLive } from '@/lib/jobs/registry';
import { OG_IMAGE_SIZE, OG_IMAGE_TYPE, ogJobText } from '@/lib/seo/og-image';
import { renderJobImage } from '@/lib/seo/og-render';

/**
 * Share image of a job page (WhatsApp, Facebook, LinkedIn) in the frame of the root image: the short
 * title as h1 with the red button on paper, the salary range in the heating loop above the house on
 * the navy panel (variants 2 and 3). The page links it with a per-job alt (jobOgImage in
 * lib/seo/og-image); this alt is only the fallback for links without one.
 */
export const alt = `Stellenangebot bei ${COMPANY.shortName} in ${COMPANY.address.city}`;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_TYPE;
export const dynamicParams = false;

/** Hourly, like the job page: once a job closes, the card says so without a deploy. */
export const revalidate = 3600;

export function generateStaticParams(): { slug: string }[] {
  return getJobPageSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job || (job.status !== 'published' && job.status !== 'archived')) notFound();

  return renderJobImage(ogJobText(job, isJobLive(job, new Date())));
}
