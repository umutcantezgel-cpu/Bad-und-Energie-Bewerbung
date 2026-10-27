import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { istOrtIndexierbar } from '../lib/places/indexierung';
import { getPublishedPlaces, placePath } from '../lib/places/registry';
import { LIVE_JOB_SLUGS, LOCAL_PAGES, PUBLISHED_JOBS, ROUTES, THEMEN_PAGES, channelJobSlugs, waitForSettled } from './support/site';

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

const locsOf = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

/**
 * Die Sitemap seit E-029: /sitemap.xml ist ein Index, der auf die Gruppen-Sitemaps /sitemap/<id>.xml zeigt (Kern,
 * Stellen, Orte, Themen; eine leere Gruppe fehlt). Liefert jede Gruppe mit ihrem XML, nach Status und Inhaltstyp geprüft.
 */
async function sitemapGruppen(request: APIRequestContext): Promise<Map<string, string>> {
  const index = await request.get('/sitemap.xml');
  expect(index.status()).toBe(200);
  expect(index.headers()['content-type']).toContain('xml');
  const xml = await index.text();
  expect(xml).toContain('<sitemapindex');
  const pfade = locsOf(xml).map((loc) => new URL(loc).pathname);
  for (const pfad of pfade) expect(pfad).toMatch(/^\/sitemap\/(kern|stellen|orte|themen)\.xml$/);
  expect(pfade).toEqual(expect.arrayContaining(['/sitemap/kern.xml', '/sitemap/orte.xml', '/sitemap/themen.xml']));
  const gruppen = new Map<string, string>();
  for (const pfad of pfade) {
    const response = await request.get(pfad);
    expect(response.status(), pfad).toBe(200);
    expect(response.headers()['content-type'], pfad).toContain('xml');
    const body = await response.text();
    expect(body, pfad).toContain('<urlset');
    gruppen.set(pfad.replace(/^\/sitemap\/|\.xml$/g, ''), body);
  }
  return gruppen;
}

/** Alle <loc> aller Gruppen-Sitemaps, unverändert (absolute URLs). */
async function sitemapLocs(request: APIRequestContext): Promise<string[]> {
  return [...(await sitemapGruppen(request)).values()].flatMap(locsOf);
}

test('Sitemap listet alle Stellen-URLs', async ({ request }) => {
  const gruppen = await sitemapGruppen(request);
  const locs = (await sitemapLocs(request)).map((loc) => new URL(loc).pathname);
  const stellen = locsOf(gruppen.get('stellen') ?? '').map((loc) => new URL(loc).pathname);
  expect(LIVE_JOB_SLUGS.length).toBeGreaterThan(0);
  for (const slug of LIVE_JOB_SLUGS) expect(stellen).toContain(`/jobs/${slug}`);
  // Nur indexierbare Seiten: keine Danke- oder Mappe-Seite.
  expect(locs).not.toContain('/bewerbung/danke');
  expect(locs).not.toContain('/bewerbung/mappe');
});

test('Orts-Sitemap: Gebietsseite, jeder Kreis-Hub und jeder Ort, der das Gate besteht (E-028, E-029)', async ({ request }) => {
  const xml = (await sitemapGruppen(request)).get('orte') ?? '';
  const locs = locsOf(xml).map((loc) => new URL(loc).pathname);
  // Ortsseiten mit noindex,follow (Gate nicht bestanden oder Fahrplanjahr der Daten vorbei) stehen nicht darin
  const ohneIndex = new Set(getPublishedPlaces().filter((place) => !istOrtIndexierbar(place, new Date())).map(placePath));
  for (const page of LOCAL_PAGES) {
    if (ohneIndex.has(page.path)) expect(locs, page.path).not.toContain(page.path);
    else expect(locs, page.path).toContain(page.path);
  }
  for (const pfad of locs) expect(pfad).toMatch(/^\/einsatzgebiet(\/|$)/);
  // Weiterleitungen (Kreise ohne eigene Seite) stehen nicht darin
  expect(locs).not.toContain('/einsatzgebiet/hochtaunuskreis');
  expect(locs).not.toContain('/einsatzgebiet/landkreis-marburg-biedenkopf');
  // lastmod nie „heute“ als Platzhalter: jedes Datum JJJJ-MM-TT
  for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) expect(m[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test('Sitemap listet den Themen-Hub und jede Themenseite (E-028)', async ({ request }) => {
  const locs = locsOf((await sitemapGruppen(request)).get('themen') ?? '').map((loc) => new URL(loc).pathname);
  for (const page of THEMEN_PAGES) expect(locs, page.path).toContain(page.path);
});

/** Ohne Auto-Wait: Die 404-Seite hat keinen Canonical, getAttribute würde bis zum Test-Timeout warten. */
const canonicalOf = (page: Page) =>
  page.evaluate(() => document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null);

/**
 * V6-B: ein JSON-LD-Block je Seite, Wurzel mit @graph, jeder @id-Verweis im selben Graphen auflösbar; mit
 * Canonical genau ein WebPage-Knoten mit url = Canonical. Prüft die ausgelieferten Seiten im Browser, auch /bewerbung
 * mit Vorauswahl, die der Proxy auf eine vorgerenderte Variante umschreibt (der Build-Check scripts/qa/check-graph.mjs
 * sieht nur die Dateien).
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

    // Der Seitenknoten: WebPage, auf den Übersichten unter /einsatzgebiet die Unterart CollectionPage (E-028)
    const pages = graph.filter((node) => node['@type'] === 'WebPage' || node['@type'] === 'CollectionPage');
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

/**
 * Pfad einer absoluten URL. Canonical und Sitemap werden über den Pfad verglichen: Die Basis-URL des Builds und die
 * Adresse, unter der der Test läuft (in CI http://localhost:3400), können sich unterscheiden. In Produktion sind beide
 * gleich; der Vergleich der Herkunft gehört nicht zu diesem Test.
 */
const pathOf = (url: string | null) => (url && /^https?:\/\//.test(url) ? new URL(url).pathname : null);

test('Seobility: jede indexierbare Route steht mit ihrem Canonical in der Sitemap', async ({ page, request }) => {
  const locs = (await sitemapLocs(request)).map(pathOf);
  for (const route of ROUTES.filter((r) => r.status === 200)) {
    await page.goto(route.path);
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    if (/noindex/.test(robots ?? '')) continue;
    const canonical = await canonicalOf(page);
    expect(canonical, `${route.path}: Canonical`).toMatch(/^https?:\/\//);
    expect(locs, `${route.path}: Canonical ${canonical} in der Sitemap`).toContain(pathOf(canonical));
  }
});

test.describe('Seobility-Crawl der indexierbaren Seiten (V6-B)', () => {
  test('jede Seite der Sitemap erfüllt die Prüfpunkte', async ({ page, request }) => {
    test.setTimeout(120_000);
    const locs = await sitemapLocs(request);
    expect(locs.length).toBeGreaterThan(3);
    // Seit den lokalen Seiten (E-028) rund 70 Seiten: Zeit je Seite statt fester Grenze
    test.setTimeout(60_000 + locs.length * 6_000);
    const findings: string[] = [];
    for (const loc of locs) {
      const path = new URL(loc).pathname;
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      const canonical = await canonicalOf(page);
      if (pathOf(canonical) !== path) findings.push(`${path}: Canonical ${canonical} ≠ Sitemap ${loc}`);
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
