import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import JobsPage, { generateMetadata as jobsMetadata, revalidate as jobsRevalidate } from '@/app/jobs/page';
import { generateMetadata as jobMetadata, revalidate as jobRevalidate } from '@/app/jobs/[slug]/page';
import { revalidate as jobImageRevalidate } from '@/app/jobs/[slug]/opengraph-image';
import { JobHeader } from '@/components/jobs/JobHeader';
import { BREADCRUMB_HOME, BREADCRUMB_JOBS } from '@/lib/content';
import { jobPath } from '@/lib/jobs/format';
import { buildBreadcrumbJsonLd, buildJobsBreadcrumbJsonLd } from '@/lib/jobs/jsonld';
import { getActiveJobs, getJobById, isJobLive, type Job } from '@/lib/jobs/registry';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import { META_DESCRIPTION_MAX, jobsHubDescription } from '@/lib/seo/descriptions';
import { DEFAULT_OG_IMAGE, jobOgImage } from '@/lib/seo/og-image';

const liveJobs = () => getActiveJobs().filter((job) => isJobLive(job, new Date()));
const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;

/** Text of each crumb in the first Breadcrumbs nav of the markup. */
function visibleCrumbs(html: string): string[] {
  const nav = /<nav aria-label="Brotkrümelnavigation">(.*?)<\/nav>/.exec(html)?.[1] ?? '';
  return [...nav.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
}

function images(value: unknown): { url: string; alt: string }[] {
  return (value as { images?: { url: string; alt: string }[] } | undefined)?.images ?? [];
}

afterEach(() => {
  vi.useRealTimers();
});

describe('breadcrumbs: visible trail and BreadcrumbList use the same labels', () => {
  it('the first crumb is „Startseite“, as in the UI', () => {
    expect(BREADCRUMB_HOME).toEqual({ label: 'Startseite', href: '/' });
    expect(BREADCRUMB_JOBS).toEqual({ label: 'Stellen', href: '/jobs' });
  });

  it('/jobs', () => {
    const ld = buildJobsBreadcrumbJsonLd();
    expect(ld.itemListElement.map((item) => item.name)).toEqual(visibleCrumbs(renderToStaticMarkup(createElement(JobsPage))));
    expect(ld.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: getCleanCanonicalUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Stellen', item: getCleanCanonicalUrl('/jobs') },
    ]);
    expect(ld['@id']).toBe(`${getCleanCanonicalUrl('/jobs')}#breadcrumb`);
  });

  it.each(getActiveJobs().map((job) => [job.id, job] as const))('%s', (_id, job) => {
    const ld = buildBreadcrumbJsonLd(job);
    expect(ld.itemListElement.map((item) => item.name)).toEqual(
      visibleCrumbs(renderToStaticMarkup(createElement(JobHeader, { job }))),
    );
    expect(ld.itemListElement.map((item) => item.name)).toEqual(['Startseite', 'Stellen', job.shortTitle]);
  });
});

describe('/jobs metadata', () => {
  it('description comes from the live jobs and stays within 155 characters', () => {
    const meta = jobsMetadata();
    expect(meta.description).toBe(jobsHubDescription(liveJobs()));
    expect(meta.description!.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(meta.openGraph?.description).toBe(meta.description);
  });

  it('drops a job from the description once it expires (hourly revalidation)', () => {
    expect(jobsRevalidate).toBe(3600);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(new Date(azubi.validThrough!).getTime() + 24 * 60 * 60 * 1000));
    const description = jobsMetadata().description!;
    expect(description).not.toContain('Ausbildung');
    expect(description.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
  });

  it('shares the root image', () => {
    const meta = jobsMetadata();
    expect(images(meta.openGraph)).toEqual([DEFAULT_OG_IMAGE]);
    expect(images(meta.twitter)).toEqual([DEFAULT_OG_IMAGE]);
  });
});

describe('job pages: own share image with a per-job alt', () => {
  const metadataOf = (job: Job) => jobMetadata({ params: Promise.resolve({ slug: job.slug }) });

  it.each(liveJobs().map((job) => [job.id, job] as const))('%s', async (_id, job) => {
    const meta = await metadataOf(job);
    const [og] = images(meta.openGraph);
    expect(og).toEqual(jobOgImage(job, true));
    expect(og.url.startsWith(`${jobPath(job)}/opengraph-image?`)).toBe(true);
    expect(og.alt).toContain(job.shortTitle);
    expect(images(meta.twitter)).toEqual([og]);
    expect(meta.description!.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
  });

  it('alts differ between jobs', () => {
    const alts = liveJobs().map((job) => jobOgImage(job, true).alt);
    expect(new Set(alts).size).toBe(alts.length);
  });

  it('a closed job links the „besetzt“ card under a new URL, so share previews refresh', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(new Date(azubi.validThrough!).getTime() + 24 * 60 * 60 * 1000));
    const meta = await metadataOf(azubi);
    const [og] = images(meta.openGraph);
    expect(og).toEqual(jobOgImage(azubi, false));
    expect(og.url).not.toBe(jobOgImage(azubi, true).url);
    expect(og.alt).toContain('Stelle besetzt');
    expect(meta.robots).toMatchObject({ index: false });
    expect(meta.description!.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
  });

  it('the image re-renders as often as the page', () => {
    expect(jobImageRevalidate).toBe(jobRevalidate);
  });
});
