import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { COMPANY } from '@/lib/content';
import { formatSalaryRange } from '@/lib/jobs/format';
import { getJobBySlug, getJobPageSlugs, isJobLive } from '@/lib/jobs/registry';

// Typographic share image (WhatsApp, Facebook, LinkedIn). Rendered at build time with the
// font bundled in next/og, so nothing is fetched. Colors mirror the light theme tokens
// (ink #0A1E3A, ink-muted #5F6878, line #E3E6EB); Satori cannot read CSS variables.
export const alt = `Stellenangebot bei ${COMPANY.shortName} in ${COMPANY.address.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getJobPageSlugs().map((slug) => ({ slug }));
}

const INK = '#0A1E3A';
const INK_MUTED = '#5F6878';
const LINE = '#E3E6EB';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job || (job.status !== 'published' && job.status !== 'archived')) notFound();

  const open = isJobLive(job, new Date());
  const salary = open ? formatSalaryRange(job) : 'Stelle besetzt';
  const titleSize = job.shortTitle.length > 24 ? 84 : 104;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#FFFFFF',
          color: INK,
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, color: INK_MUTED }}>
          {`${COMPANY.shortName} · seit ${COMPANY.foundingYear}`}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', fontSize: titleSize, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            {job.shortTitle}
          </div>
          <div style={{ display: 'flex', fontSize: 36, color: INK_MUTED }}>(m/w/d)</div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: `2px solid ${LINE}`,
            paddingTop: 32,
          }}
        >
          <div style={{ display: 'flex', fontSize: 48 }}>{salary ?? ''}</div>
          <div style={{ display: 'flex', fontSize: 32, color: INK_MUTED }}>
            {`${job.location.city} · ${job.location.radiusKm} km`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
