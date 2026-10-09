import { expect, test, type Page } from '@playwright/test';
import { LIVE_JOB_SLUGS, PUBLISHED_JOBS, channelJobSlugs } from './support/site';

/**
 * Strukturierte Daten, Feeds und Sitemap (ROADMAP §9, §10, §14). Unabhängig von Viewport und
 * Farbschema, darum nur im Projekt desktop-light.
 */

test.beforeEach(() => {
  test.skip(test.info().project.name !== 'desktop-light', 'SEO-Prüfungen laufen nur einmal (desktop-light).');
});

type JsonLdNode = Record<string, unknown>;

/** Alle JSON-LD-Knoten der Seite, auch aus Arrays und @graph. */
async function jsonLdNodes(page: Page): Promise<JsonLdNode[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const nodes: JsonLdNode[] = [];
  const collect = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }
    if (!value || typeof value !== 'object') return;
    const node = value as JsonLdNode;
    nodes.push(node);
    if (Array.isArray(node['@graph'])) node['@graph'].forEach(collect);
  };
  for (const block of blocks) collect(JSON.parse(block));
  return nodes;
}

const isJobPosting = (node: JsonLdNode) =>
  node['@type'] === 'JobPosting' || (Array.isArray(node['@type']) && node['@type'].includes('JobPosting'));

for (const job of PUBLISHED_JOBS) {
  test(`genau ein JobPosting mit url = canonical auf /jobs/${job.slug}`, async ({ page }) => {
    await page.goto(`/jobs/${job.slug}`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    expect(new URL(canonical!).pathname).toBe(`/jobs/${job.slug}`);

    const postings = (await jsonLdNodes(page)).filter(isJobPosting);
    expect(postings).toHaveLength(1);
    expect(postings[0].url).toBe(canonical);
  });
}

for (const path of ['/', '/jobs']) {
  test(`kein JobPosting auf ${path}`, async ({ page }) => {
    await page.goto(path);
    const nodes = await jsonLdNodes(page);
    expect(nodes.length, 'globale JSON-LD-Knoten vorhanden').toBeGreaterThan(0);
    expect(nodes.filter(isJobPosting)).toHaveLength(0);
  });
}

const FEEDS = [
  { path: '/feeds/indeed.xml', type: 'application/xml', channel: 'indeedFeed' },
  { path: '/feeds/jobs.xml', type: 'application/xml', channel: 'genericFeed' },
  { path: '/feeds/jobs.json', type: 'application/json', channel: 'genericFeed' },
] as const;

for (const feed of FEEDS) {
  test(`Feed ${feed.path} antwortet mit ${feed.type}`, async ({ request }) => {
    const response = await request.get(feed.path);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(feed.type);
    const body = await response.text();
    if (feed.type === 'application/json') {
      expect(() => JSON.parse(body)).not.toThrow();
    } else {
      expect(body.trimStart().startsWith('<?xml')).toBe(true);
    }
    const slugs = channelJobSlugs(feed.channel);
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) expect(body).toContain(`/jobs/${slug}`);
  });
}

test('Sitemap listet alle Stellen-URLs', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('xml');
  const locs = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  expect(LIVE_JOB_SLUGS.length).toBeGreaterThan(0);
  for (const slug of LIVE_JOB_SLUGS) expect(locs).toContain(`/jobs/${slug}`);
  // Nur indexierbare Seiten: keine Danke- oder Mappe-Seite.
  expect(locs).not.toContain('/bewerbung/danke');
  expect(locs).not.toContain('/bewerbung/mappe');
});
