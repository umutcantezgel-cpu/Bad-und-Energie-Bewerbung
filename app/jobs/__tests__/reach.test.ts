import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import { GET as gruppenSitemap, generateStaticParams as sitemapDateien } from '@/app/sitemap/[datei]/route';
import { GET as sitemapIndex } from '@/app/sitemap.xml/route';
import { GET as llmsFull } from '@/app/llms-full.txt/route';
import { GET as llms } from '@/app/llms.txt/route';
import { FACTS, isFactActive } from '@/lib/content/facts';
import { withUtm } from '@/lib/jobs/feeds/tracking';
import { PAY_ON_REQUEST, jobPath, jobUrl } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs, getJobPageSlugs, isJobLive } from '@/lib/jobs/registry';
import { istOrtIndexierbar } from '@/lib/places/indexierung';
import {
  EINSATZGEBIET_PATH,
  getAllPlaces,
  getHubKreise,
  getKreisPlaces,
  getKreise,
  getPublishedPlaces,
  kreisPath,
  placePath,
} from '@/lib/places/registry';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import { SITEMAP_GRUPPEN, getIndexablePages, sitemapPages, sitemapUrl } from '@/lib/seo/indexable-pages';
import { getAllPortalUrls } from '@/lib/seo/indexnow';
import { ARBEITEN_PATH, getThemen, themaPath } from '@/lib/themen/registry';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import { claimsInTextBody } from '../../../scripts/qa/check-claims.mjs';

const base = SITE_CONFIG.baseUrl.replace(/\/+$/, '');
const liveJobs = getActiveJobs().filter((job) => isJobLive(job, new Date()));

/**
 * Erwartete lokale Seiten aus den Registries (E-028): Gebietsseite, Kreis-Hubs und jeder veröffentlichte Ort, der heute
 * das Gate besteht (E-029, lib/places/indexierung.ts). Sitemap und IndexNow rechnen mit „jetzt“ wie die live Stellen;
 * dass im Fahrplanjahr alle 54 Orte darin stehen, prüft lib/seo/__tests__/indexable-pages.test.ts mit festem Stichtag.
 */
const indexierbareOrte = getPublishedPlaces().filter((place) => istOrtIndexierbar(place, new Date()));
const localPaths = [EINSATZGEBIET_PATH, ...getHubKreise().map(kreisPath), ...indexierbareOrte.map(placePath)];
/** Themenseiten (E-028): Hub und die fünf Themen aus lib/themen/registry.ts. */
const themenPaths = [ARBEITEN_PATH, ...getThemen().map(themaPath)];
const newest = (dates: readonly string[]) => [...dates].sort().at(-1);

/** Eine Gruppen-Sitemap abrufen wie Next: Route-Handler mit dem Dateinamen als Segment (app/sitemap/[datei]/route.ts). */
const abrufen = (datei: string) => gruppenSitemap(new Request(`${base}/sitemap/${datei}`), { params: Promise.resolve({ datei }) });
const xmlText = (value: string) => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
/** Einträge einer <urlset> in der Form, die app/sitemap/[datei]/route.ts schreibt: <url>, <loc>, optional <lastmod>. */
const eintraege = (xml: string) =>
  [...xml.matchAll(/<url>\n<loc>([^<]+)<\/loc>\n(?:<lastmod>([^<]+)<\/lastmod>\n)?<\/url>\n/g)].map((m) => ({
    url: xmlText(m[1]),
    ...(m[2] ? { lastModified: xmlText(m[2]) } : {}),
  }));

/** Die vier Gruppen-Sitemaps (E-029), wie der Build sie vorrendert: je Datei aus generateStaticParams die Antwort. */
const gruppen = await Promise.all(
  sitemapDateien().map(async ({ datei }) => {
    const res = await abrufen(datei);
    const xml = await res.text();
    return { id: datei.replace(/\.xml$/, ''), status: res.status, contentType: res.headers.get('content-type'), xml, entries: eintraege(xml) };
  }),
);
const gruppe = (id: string) => gruppen.find((g) => g.id === id)!.entries.map((e) => e.url);

describe('sitemap', () => {
  const entries = gruppen.flatMap((g) => g.entries);
  const urls = entries.map((e) => e.url);

  it('is split by group (E-029): kern, stellen, orte and themen, each at /sitemap/<id>.xml', () => {
    expect(sitemapDateien()).toEqual([{ datei: 'kern.xml' }, { datei: 'stellen.xml' }, { datei: 'orte.xml' }, { datei: 'themen.xml' }]);
    expect(SITEMAP_GRUPPEN.map((g) => sitemapUrl(g.id))).toEqual(['kern', 'stellen', 'orte', 'themen'].map((id) => `${base}/sitemap/${id}.xml`));
    expect(gruppe('kern')).toEqual([base, `${base}/jobs`, `${base}/bewerbung`]);
    expect(gruppe('stellen')).toEqual(liveJobs.map(jobUrl));
    expect(gruppe('orte')).toEqual(localPaths.map((path) => `${base}${path}`));
    expect(gruppe('themen')).toEqual(themenPaths.map((path) => `${base}${path}`));
  });

  it('every group sitemap is a <urlset> as XML, one <url> per page and nothing else', () => {
    for (const g of gruppen) {
      expect(g.status, g.id).toBe(200);
      expect(g.contentType, g.id).toBe('application/xml; charset=utf-8');
      expect(g.xml, g.id).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">\n/);
      expect(g.xml.endsWith('</urlset>\n'), g.id).toBe(true);
      expect(g.xml.match(/<url>/g)?.length ?? 0, g.id).toBe(g.entries.length);
      expect(g.entries.length, g.id).toBeGreaterThan(0);
      expect(g.xml, g.id).not.toContain('<sitemapindex');
    }
  });

  it('an unknown file is a 404, not an empty sitemap', async () => {
    for (const datei of ['alles.xml', 'orte', 'orte.xml.xml', 'kern.txt']) expect((await abrufen(datei)).status, datei).toBe(404);
  });

  // V6-B: jede URL exakt wie der Canonical der Seite; Next rendert den der Startseite ohne Schrägstrich.
  it('lists home, /jobs, /bewerbung, every live job page, every local page and the topic pages, from the registries', () => {
    expect(urls).toEqual([
      getCleanCanonicalUrl('/'),
      getCleanCanonicalUrl('/jobs'),
      getCleanCanonicalUrl('/bewerbung'),
      ...liveJobs.map((job) => getCleanCanonicalUrl(jobPath(job))),
      ...localPaths.map(getCleanCanonicalUrl),
      ...themenPaths.map(getCleanCanonicalUrl),
    ]);
    expect(new Set(urls).size).toBe(urls.length);
    // Kernseiten und Stellen, Gebietsseite, Kreis-Hubs und die Orte, die das Gate bestehen, Themen-Hub und Themen
    expect(urls).toHaveLength(3 + liveJobs.length + 1 + getHubKreise().length + indexierbareOrte.length + 1 + getThemen().length);
  });

  it('is the list of lib/seo/indexable-pages.ts (one place for every page type), group by group', () => {
    expect([...urls].sort()).toEqual(getIndexablePages().map((page) => page.url).sort());
    for (const { id } of SITEMAP_GRUPPEN) expect(gruppe(id)).toEqual(sitemapPages(id).map((page) => page.url));
  });

  it('/sitemap.xml is the index of the group sitemaps, each with the newest date of its pages', async () => {
    const xml = await sitemapIndex().text();
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<sitemapindex xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(SITEMAP_GRUPPEN.filter((g) => sitemapPages(g.id).length > 0).map((g) => sitemapUrl(g.id)));
    for (const { id } of SITEMAP_GRUPPEN) {
      const dates = sitemapPages(id).flatMap((p) => (p.lastModified ? [p.lastModified] : []));
      if (dates.length > 0) expect(xml).toContain(`<loc>${sitemapUrl(id)}</loc><lastmod>${newest(dates)}</lastmod>`);
    }
    expect(xml).not.toContain('<url>');
  });

  it('place pages leave the sitemap when the gate says noindex (here: after the timetable year, I5); hubs stay', () => {
    const spaeter = sitemapPages('orte', new Date('2026-12-20T10:00:00Z')).map((p) => p.path);
    expect(spaeter).toEqual([EINSATZGEBIET_PATH, ...getHubKreise().map(kreisPath)]);
  });

  // Die lokalen Seiten listen die live Stellen mit Gehalt (Review Phase 2, Punkt 27): das jüngere Datum zählt.
  it('dates local pages with the newer of their places\' updatedAt and the newest live job, never with today', () => {
    const date = (path: string) => entries.find((e) => e.url === `${base}${path}`)?.lastModified;
    const jobs = liveJobs.map((job) => job.updatedAt);
    for (const place of indexierbareOrte) expect(date(placePath(place))).toBe(newest([place.updatedAt, ...jobs]));
    for (const kreis of getHubKreise()) {
      expect(date(kreisPath(kreis))).toBe(newest([...getKreisPlaces(kreis.id).map((place) => place.updatedAt), ...jobs]));
    }
    expect(date(EINSATZGEBIET_PATH)).toBe(newest([...getPublishedPlaces().map((place) => place.updatedAt), ...jobs]));
    for (const entry of entries) expect(String(entry.lastModified)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('leaves out redirects: Kreise without a hub, merged or archived places and legacy slugs', () => {
    for (const kreis of getKreise().filter((k) => !k.hasHub)) expect(urls).not.toContain(`${base}${EINSATZGEBIET_PATH}/${kreis.slug}`);
    for (const place of getAllPlaces().filter((p) => p.status !== 'published')) expect(urls).not.toContain(`${base}${placePath(place)}`);
    for (const slug of getAllPlaces().flatMap((p) => p.redirectFrom)) expect(urls).not.toContain(`${base}${EINSATZGEBIET_PATH}/${slug}`);
  });

  it('uses the job updatedAt as lastModified', () => {
    for (const job of liveJobs) {
      expect(entries.find((e) => e.url === jobUrl(job))?.lastModified).toBe(job.updatedAt);
    }
  });

  // Startseite, /jobs und /bewerbung (Wegweiser im Erklärteil) listen die live Stellen.
  it('dates home, /jobs and /bewerbung with the newest updatedAt of the live jobs', () => {
    const newest = liveJobs.map((job) => job.updatedAt).sort().at(-1);
    expect(newest).toBeDefined();
    for (const url of [base, `${base}/jobs`, `${base}/bewerbung`]) {
      expect(entries.find((e) => e.url === url)?.lastModified).toBe(newest);
    }
  });

  it('excludes noindex pages, funnel-only jobs and feeds', () => {
    for (const excluded of ['/datenschutz', '/impressum', '/bewerbung/danke', '/bewerbung/mappe', '/feeds/', '/api/']) {
      expect(urls.some((url) => url.includes(excluded))).toBe(false);
    }
    for (const job of ALL_JOBS.filter((j) => j.status !== 'published')) {
      expect(urls).not.toContain(jobUrl(job));
    }
  });
});

describe('robots', () => {
  const config = robots();
  const rules = Array.isArray(config.rules) ? config.rules : [config.rules];

  it('keeps the private paths out of every allowing group', () => {
    for (const rule of rules.filter((r) => r.allow)) {
      expect(rule.disallow).toEqual(['/api/', '/admin/']);
    }
  });

  // noindex only works if the crawler may fetch the page; a blocked but linked URL can still be indexed.
  it('does not block the noindex pages', () => {
    for (const rule of rules) {
      const disallow = [rule.disallow ?? []].flat();
      for (const noindexPath of ['/bewerbung/danke', '/bewerbung/mappe', '/datenschutz', '/impressum', '/jobs/']) {
        expect(disallow.some((prefix) => prefix !== '/' && noindexPath.startsWith(prefix))).toBe(false);
      }
    }
  });

  // E-029: der Index zuerst, dann jede Gruppen-Sitemap; die Inhaber-Checkliste reicht jede Zeile einzeln ein
  it('points to the sitemap index and to every group sitemap', () => {
    expect(config.sitemap).toEqual([
      `${base}/sitemap.xml`,
      `${base}/sitemap/kern.xml`,
      `${base}/sitemap/stellen.xml`,
      `${base}/sitemap/orte.xml`,
      `${base}/sitemap/themen.xml`,
    ]);
  });

  // V6-B: Google ignoriert `Host:`, Seobility meldet es; die Hauptdomain steht im Canonical.
  it('sets no host directive', () => {
    expect(config.host).toBeUndefined();
  });
});

describe('llms.txt', () => {
  it('lists every live job with link, „Lohn auf Anfrage“ (E-030) and its synonyms; the Quereinstieg with its own page', async () => {
    const res = llms();
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    const text = await res.text();
    for (const job of liveJobs) {
      const zeile = text.split('\n').find((line) => line.startsWith(`- [${job.title}](${jobUrl(job)})`));
      expect(zeile, job.id).toBeDefined();
      // Das Schülerpraktikum sagt nichts zu Geld (fakten-abgleich S4)
      if (job.pay === 'auf-anfrage') expect(zeile, job.id).toContain(PAY_ON_REQUEST);
      else expect(zeile, job.id).not.toMatch(/Lohn|Gehalt|Vergütung/);
      if (job.alsoKnownAs.length > 0) expect(zeile, job.id).toContain(`Auch gesucht als: ${job.alsoKnownAs.join(', ')}.`);
    }
    // Seit 2026-10-14 veröffentlicht (fakten-abgleich S3): mit eigener Seite, nicht mehr nur als Option im Flow
    expect(text).toContain(`/jobs/quereinsteiger-montagehelfer-shk-wetzlar`);
    expect(text).not.toContain('Ohne eigene Stellenseite');
    expect(liveJobs.map((job) => job.id)).toEqual(
      expect.arrayContaining(['ausbildung-anlagenmechaniker-shk-2027', 'quereinsteiger-montagehelfer', 'buerofachkraft', 'schuelerpraktikum-shk']),
    );
    expect(text).not.toMatch(/Gehaltsspanne/);
    expect(claimsInTextBody(text, 'txt')).toEqual([]);
    expect(claimsInTextBody(await llmsFull().text(), 'txt')).toEqual([]);
  });

  it('drops claims the fact registry does not back', async () => {
    for (const text of [await llms().text(), await llmsFull().text()]) {
      expect(text).not.toMatch(/Wäscheservice|bezahlt ins Wochenende|§ 26 BDSG|Diplomingenieur/);
      // „100 Jahre“ nur im Wortlaut des Fakts anniversary100 und nur bis zu seinem validUntil (E-SEO-014)
      const jubilaeum = isFactActive('anniversary100', new Date()) ? FACTS.anniversary100.short : null;
      expect(jubilaeum ? text.replaceAll(jubilaeum, '') : text).not.toContain('100 Jahre');
      expect(text).not.toContain('­');
    }
  });

  it('llms-full.txt contains each job description', async () => {
    const text = await llmsFull().text();
    for (const job of liveJobs) {
      expect(text).toContain(`### ${job.title}`);
      expect(text).toContain(job.intro);
      expect(text).toContain(job.referenceCode);
    }
  });
});

describe('IndexNow URL list', () => {
  it('matches the registries: home, /jobs, job pages, /bewerbung, local pages, topic pages', () => {
    expect(getAllPortalUrls()).toEqual([
      `${base}/`,
      `${base}/jobs`,
      ...getJobPageSlugs().map((slug) => `${base}/jobs/${slug}`),
      `${base}/bewerbung`,
      ...localPaths.map((path) => `${base}${path}`),
      ...themenPaths.map((path) => `${base}${path}`),
    ]);
  });
});

describe('docs/operations/stellenboersen.md', () => {
  const doc = readFileSync(path.resolve(__dirname, '../../../docs/operations/stellenboersen.md'), 'utf8');

  // The doc lists production URLs, independent of APP_URL in the test environment.
  const productionUrl = (slug: string) => `https://karriere.bad-energie.de/jobs/${slug}`;

  it('contains the tracked BA URL of every BA job and the HWK URL of every apprenticeship', () => {
    for (const job of liveJobs.filter((j) => j.channels.ba)) {
      const url = productionUrl(job.slug);
      expect(doc).toContain(withUtm(url, { source: 'arbeitsagentur', medium: 'jobboard', campaign: job.id }));
      if (job.employment.kind === 'ausbildung') {
        expect(doc).toContain(withUtm(url, { source: 'hwk', medium: 'jobboard', campaign: job.id }));
      }
    }
  });
});
