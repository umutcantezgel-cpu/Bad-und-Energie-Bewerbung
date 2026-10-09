import { notFound } from 'next/navigation';
import { COMPANY } from '@/lib/content';
import { employmentLabel, formatSalaryRange } from '@/lib/jobs/format';
import { getJobBySlug, getJobPageSlugs, isJobLive } from '@/lib/jobs/registry';
import { OG_COLOR, OG_IMAGE_SIZE, OG_IMAGE_TYPE } from '@/lib/seo/og-image';
import { renderOgImage } from '@/lib/seo/og-render';

/**
 * Typographic share image of a job page (WhatsApp, Facebook, LinkedIn), in the frame of the root
 * image. The page links it with a per-job alt (jobOgImage in lib/seo/og-image); this alt is only
 * the fallback for links without one.
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

const MM_WD = '(m/w/d)';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job || (job.status !== 'published' && job.status !== 'archived')) notFound();

  const status = isJobLive(job, new Date()) ? (formatSalaryRange(job) ?? employmentLabel(job)) : 'Stelle besetzt';
  const location = `${job.location.city} · ${job.location.radiusKm} km`;
  const titleSize = job.shortTitle.length > 24 ? 84 : 100;

  return renderOgImage({
    main: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: titleSize, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.04 }}>
          {job.shortTitle}
        </div>
        <div style={{ fontSize: 40, color: OG_COLOR.muted }}>{MM_WD}</div>
      </div>
    ),
    footer: <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em' }}>{status}</div>,
    aside: location,
    texts: [job.shortTitle, MM_WD, status],
  });
}
