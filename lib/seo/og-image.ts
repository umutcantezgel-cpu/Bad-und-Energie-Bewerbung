import { COMPANY } from '@/lib/content/company';
import { formatSalaryRange, jobPath } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/schema';

/** Share image as used in `openGraph.images` / `twitter.images`. */
export interface OgImage {
  /** Root-relative (resolved against metadataBase) or absolute. */
  url: string;
  width: number;
  height: number;
  alt: string;
  type?: string;
}

export const OG_IMAGE_SIZE = Object.freeze({ width: 1200, height: 630 });
export const OG_IMAGE_TYPE = 'image/png';

/**
 * Light theme tokens as plain values (ink, ink-muted, line, surface in app/styles/theme.css):
 * ImageResponse cannot read CSS variables.
 */
export const OG_COLOR = Object.freeze({
  surface: '#FFFFFF',
  ink: '#0A1E3A',
  muted: '#5F6878',
  line: '#E3E6EB',
});

/** Top right of every share image, like the eyebrow of the home hero. */
export const OG_EYEBROW = `Seit ${COMPANY.foundingYear} · ${COMPANY.address.city}`;

/**
 * The root image app/opengraph-image.tsx. Pages without their own image link it explicitly
 * (see generatePageMetadata), so its alt is defined here and imported by the image file.
 */
export const DEFAULT_OG_IMAGE: Readonly<OgImage> = Object.freeze({
  url: '/opengraph-image',
  ...OG_IMAGE_SIZE,
  type: OG_IMAGE_TYPE,
  alt: `${COMPANY.name}: SHK-Jobs in ${COMPANY.address.city}`,
});

/**
 * Share image of a job page: its own app/jobs/[slug]/opengraph-image route with a per-job alt.
 * The page links it explicitly because a file-based image can only have one static alt. The
 * query changes with every edit and when the job closes, so WhatsApp, LinkedIn and Facebook
 * fetch the new card instead of their cached one.
 */
export function jobOgImage(
  job: Pick<Job, 'slug' | 'shortTitle' | 'updatedAt' | 'location' | 'salary'>,
  open: boolean,
): OgImage {
  const salary = open ? formatSalaryRange(job) : null;
  const subject = `${job.shortTitle} (m/w/d) bei ${COMPANY.shortName} in ${job.location.city}`;
  return {
    url: `${jobPath(job)}/opengraph-image?v=${job.updatedAt}${open ? '' : '-besetzt'}`,
    ...OG_IMAGE_SIZE,
    type: OG_IMAGE_TYPE,
    alt: open ? (salary ? `${subject}, ${salary}` : subject) : `${subject}: Stelle besetzt`,
  };
}
