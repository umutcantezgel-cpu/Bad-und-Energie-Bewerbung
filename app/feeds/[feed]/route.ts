import { buildGenericXml } from '@/lib/jobs/feeds/generic-xml';
import { buildIndeedXml } from '@/lib/jobs/feeds/indeed-xml';
import { buildJsonFeed } from '@/lib/jobs/feeds/json-feed';
import { ALL_JOBS } from '@/lib/jobs/registry';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Job board feeds from the registry (ROADMAP §7):
 * - /feeds/indeed.xml  Indeed XML (career-site indexing request in the Indeed employer dashboard)
 * - /feeds/jobs.xml    aggregators: Jooble, Talent.com, Adzuna, Careerjet, Kimeta
 * - /feeds/jobs.json   JobPosting array, readable cross-origin by bad-energie.de (widget „Wir stellen ein“)
 * The builders keep only live jobs with the matching channel flag (getChannelJobs).
 * Static, regenerated hourly so expired jobs drop out without a deploy.
 * proxy.ts excludes /feeds/ from its matcher, so no crawler is ever blocked here.
 */
export const dynamic = 'force-static';
export const revalidate = 3600;
export const dynamicParams = false;

const PUBLISHER = 'Bad und Energie GmbH Lahn Dill';
const publisherUrl = () => SITE_CONFIG.baseUrl.replace(/\/+$/, '');

const XML = 'application/xml; charset=utf-8';
const JSON_TYPE = 'application/json; charset=utf-8';

// Feeds are for machines; keep the raw XML/JSON out of search results.
const COMMON_HEADERS = { 'X-Robots-Tag': 'noindex' };

const FEEDS = {
  'indeed.xml': (now: Date) =>
    new Response(buildIndeedXml(ALL_JOBS, { publisher: PUBLISHER, publisherUrl: publisherUrl(), lastBuildDate: now }), {
      headers: { ...COMMON_HEADERS, 'Content-Type': XML },
    }),
  'jobs.xml': (now: Date) =>
    new Response(buildGenericXml(ALL_JOBS, { publisher: PUBLISHER, publisherUrl: publisherUrl(), lastBuildDate: now }), {
      headers: { ...COMMON_HEADERS, 'Content-Type': XML },
    }),
  'jobs.json': (now: Date) =>
    new Response(JSON.stringify(buildJsonFeed(ALL_JOBS, { now, utmSource: 'jobs-json' })), {
      headers: {
        ...COMMON_HEADERS,
        'Content-Type': JSON_TYPE,
        'Access-Control-Allow-Origin': SITE_CONFIG.consumerUrl,
      },
    }),
} satisfies Record<string, (now: Date) => Response>;

type FeedName = keyof typeof FEEDS;

function isFeedName(value: string): value is FeedName {
  return Object.prototype.hasOwnProperty.call(FEEDS, value);
}

export function generateStaticParams(): { feed: FeedName }[] {
  return (Object.keys(FEEDS) as FeedName[]).map((feed) => ({ feed }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ feed: string }> }): Promise<Response> {
  const { feed } = await params;
  if (!isFeedName(feed)) {
    return new Response('Feed nicht gefunden.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  return FEEDS[feed](new Date());
}
