import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { LIVE_JOB_SLUGS, PUBLISHED_JOBS, ROUTES, channelJobSlugs, waitForSettled } from './support/site';

/**
 * Strukturierte Daten, Feeds und Sitemap (ROADMAP §9, §10, §14), dazu ein Offline-Crawl nach den
 * Prüfpunkten von Seobility (V6-B). Unabhängig von Viewport und Farbschema, darum nur im Projekt
 * desktop-light.
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

/** Alle <loc> der Sitemap, unverändert (absolute URLs). */
async function sitemapLocs(request: APIRequestContext): Promise<string[]> {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  return [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

/** Ohne Auto-Wait: Die 404-Seite hat keinen Canonical, getAttribute würde bis zum Test-Timeout warten. */
const canonicalOf = (page: Page) =>
  page.evaluate(() => document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null);

/**
 * V6-B: ein JSON-LD-Block je Seite, Wurzel mit @graph, jeder @id-Verweis im selben Graphen auflösbar; mit
 * Canonical genau ein WebPage-Knoten mit url = Canonical. Läuft auch für /bewerbung, das dynamisch rendert
 * und darum nicht im Build-Check (scripts/qa/check-graph.mjs) liegt.
 */
for (const route of ROUTES) {
  test(`ein @graph je Seite: ${route.path}`, async ({ page }) => {
    await page.goto(route.path);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks).toHaveLength(1);
    const root = JSON.parse(blocks[0]) as { '@context'?: string; '@graph'?: JsonLdNode[] };
    expect(root['@context']).toBe('https://schema.org');
    expect(Array.isArray(root['@graph'])).toBe(true);
    const graph = root['@graph']!;
    const ids = graph.map((node) => node['@id']);
    const refs = JSON.stringify(graph).match(/\{"@id":"[^"]+"\}/g) ?? [];
    for (const ref of refs) expect(ids, `Verweis ${ref}`).toContain(JSON.parse(ref)['@id']);

    const pages = graph.filter((node) => node['@type'] === 'WebPage');
    const canonical = await canonicalOf(page);
    if (canonical) {
      expect(pages).toHaveLength(1);
      expect(pages[0].url).toBe(canonical);
    } else {
      expect(pages).toHaveLength(0);
    }
  });
}

/** Seobility-Grenzen (V6-B). Die Wortzahl zählt den sichtbaren Text (innerText) wie ein Leser. */
const SEOBILITY = {
  title: { min: 30, max: 60 },
  description: { min: 110, max: 160 },
  minWords: 500,
} as const;

interface CrawlResult {
  title: string;
  description: string | null;
  robots: string | null;
  h1: number;
  words: number;
  imagesWithoutAlt: string[];
  /** Ankertext → alle Ziele (absolute href, Hash zählt mit). */
  anchors: Record<string, string[]>;
}

/** Liest die Seite nach dem Laden; vorher einmal ganz hinunter, damit Abschnitte in Reichweite hydrieren. */
async function crawl(page: Page): Promise<CrawlResult> {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');
  await waitForSettled(page);
  return page.evaluate(() => {
    const norm = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();
    const anchors: Record<string, string[]> = {};
    for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      // Text wie im HTML (auch Menü und versteckte Fassungen); ohne Text der zugängliche Name oder das Bild-alt.
      const text =
        norm(link.textContent) ||
        norm(link.getAttribute('aria-label')) ||
        norm([...link.querySelectorAll('img')].map((img) => img.alt).join(' '));
      const target = new URL(link.getAttribute('href') ?? '', document.baseURI).href;
      anchors[text] = [...new Set([...(anchors[text] ?? []), target])];
    }
    return {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
      h1: document.querySelectorAll('h1').length,
      words: (document.body.innerText.match(/[\p{L}\p{N}]+(?:[-’'.][\p{L}\p{N}]+)*/gu) ?? []).length,
      imagesWithoutAlt: [...document.querySelectorAll('img:not([alt])')].map((img) => img.outerHTML.slice(0, 120)),
      anchors,
    };
  });
}

test('Seobility: jede indexierbare Route steht mit ihrem Canonical in der Sitemap', async ({ page, request }) => {
  const locs = await sitemapLocs(request);
  for (const route of ROUTES.filter((r) => r.status === 200)) {
    await page.goto(route.path);
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    if (/noindex/.test(robots ?? '')) continue;
    const canonical = await canonicalOf(page);
    expect(canonical, `${route.path}: Canonical`).toMatch(/^https?:\/\//);
    expect(locs, `${route.path}: Canonical ${canonical} in der Sitemap`).toContain(canonical);
  }
});

test.describe('Seobility-Crawl der indexierbaren Seiten (V6-B)', () => {
  test('jede Seite der Sitemap erfüllt die Prüfpunkte', async ({ page, request }) => {
    test.setTimeout(120_000);
    const locs = await sitemapLocs(request);
    expect(locs.length).toBeGreaterThan(3);
    const findings: string[] = [];
    for (const loc of locs) {
      const path = new URL(loc).pathname;
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      const canonical = await canonicalOf(page);
      if (canonical !== loc) findings.push(`${path}: Canonical ${canonical} ≠ Sitemap ${loc}`);
      if (!/^https?:\/\//.test(canonical ?? '')) findings.push(`${path}: Canonical nicht absolut`);

      const result = await crawl(page);
      if (/noindex/.test(result.robots ?? '')) findings.push(`${path}: noindex, steht aber in der Sitemap`);
      const { title, description } = SEOBILITY;
      if (result.title.length < title.min || result.title.length > title.max) {
        findings.push(`${path}: Titel ${result.title.length} Zeichen „${result.title}“`);
      }
      const desc = result.description ?? '';
      if (desc.length < description.min || desc.length > description.max) {
        findings.push(`${path}: Meta-Beschreibung ${desc.length} Zeichen`);
      }
      if (result.h1 !== 1) findings.push(`${path}: ${result.h1} h1`);
      if (result.words < SEOBILITY.minWords) findings.push(`${path}: ${result.words} Wörter`);
      for (const img of result.imagesWithoutAlt) findings.push(`${path}: Bild ohne alt ${img}`);
      for (const [text, targets] of Object.entries(result.anchors)) {
        if (targets.length > 1) findings.push(`${path}: Ankertext „${text}“ → ${targets.join(' | ')}`);
      }
    }
    expect(findings).toEqual([]);
  });

  // Auch die nicht indexierten Seiten verlinken eindeutig und tragen alt-Texte (Seobility crawlt sie mit).
  test('Ankertexte und alt-Texte auf allen übrigen Routen', async ({ page }) => {
    test.setTimeout(120_000);
    const findings: string[] = [];
    for (const route of ROUTES) {
      await page.goto(route.path);
      const result = await crawl(page);
      for (const img of result.imagesWithoutAlt) findings.push(`${route.path}: Bild ohne alt ${img}`);
      for (const [text, targets] of Object.entries(result.anchors)) {
        if (targets.length > 1) findings.push(`${route.path}: Ankertext „${text}“ → ${targets.join(' | ')}`);
      }
    }
    expect(findings).toEqual([]);
  });
});
