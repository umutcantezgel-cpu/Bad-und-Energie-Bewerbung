import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { GET as llmsFull } from '@/app/llms-full.txt/route';
import { GET as llms } from '@/app/llms.txt/route';
import { FACTS, isFactActive } from '@/lib/content/facts';
import { withUtm } from '@/lib/jobs/feeds/tracking';
import { jobPath, jobUrl } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs, getJobPageSlugs, isJobLive } from '@/lib/jobs/registry';
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
import { getIndexablePages } from '@/lib/seo/indexable-pages';
import { getAllPortalUrls } from '@/lib/seo/indexnow';
import { ARBEITEN_PATH, getThemen, themaPath } from '@/lib/themen/registry';
import { SITE_CONFIG } from '@/lib/seo/site-config';

const base = SITE_CONFIG.baseUrl.replace(/\/+$/, '');
const liveJobs = getActiveJobs().filter((job) => isJobLive(job, new Date()));

/** Erwartete lokale Seiten aus den Registries (E-028): Gebietsseite, Kreis-Hubs, alle veröffentlichten Orte. */
const localPaths = [EINSATZGEBIET_PATH, ...getHubKreise().map(kreisPath), ...getPublishedPlaces().map(placePath)];
/** Themenseiten (E-028): Hub und die fünf Themen aus lib/themen/registry.ts. */
const themenPaths = [ARBEITEN_PATH, ...getThemen().map(themaPath)];
const newest = (dates: readonly string[]) => [...dates].sort().at(-1);

describe('sitemap', () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  // V6-B: jede URL exakt wie der Canonical der Seite; Next rendert den der Startseite ohne Schrägstrich.
  it('lists home, /jobs, every live job page, /bewerbung, every local page and the topic pages, from the registries', () => {
    expect(urls).toEqual([
      base,
      `${base}/jobs`,
      ...liveJobs.map(jobUrl),
      `${base}/bewerbung`,
      ...localPaths.map((path) => `${base}${path}`),
      ...themenPaths.map((path) => `${base}${path}`),
    ]);
    expect(urls).toEqual([
      getCleanCanonicalUrl('/'),
      getCleanCanonicalUrl('/jobs'),
      ...liveJobs.map((job) => getCleanCanonicalUrl(jobPath(job))),
      getCleanCanonicalUrl('/bewerbung'),
      ...localPaths.map(getCleanCanonicalUrl),
      ...themenPaths.map(getCleanCanonicalUrl),
    ]);
    expect(new Set(urls).size).toBe(urls.length);
    // 7 Kernseiten und Stellen, Gebietsseite, Kreis-Hubs und Orte, dazu Themen-Hub und Themen (7 + 1 + 4 + 54 + 6 = 72)
    expect(urls).toHaveLength(3 + liveJobs.length + 1 + getHubKreise().length + getPublishedPlaces().length + 1 + getThemen().length);
  });

  it('is the list of lib/seo/indexable-pages.ts (one place for every page type)', () => {
    expect(urls).toEqual(getIndexablePages().map((page) => page.url));
  });

  // Die lokalen Seiten listen die live Stellen mit Gehalt (Review Phase 2, Punkt 27): das jüngere Datum zählt.
  it('dates local pages with the newer of their places\' updatedAt and the newest live job, never with today', () => {
    const date = (path: string) => entries.find((e) => e.url === `${base}${path}`)?.lastModified;
    const jobs = liveJobs.map((job) => job.updatedAt);
    for (const place of getPublishedPlaces()) expect(date(placePath(place))).toBe(newest([place.updatedAt, ...jobs]));
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

  it('points to the sitemap', () => {
    expect(config.sitemap).toBe(`${base}/sitemap.xml`);
  });

  // V6-B: Google ignoriert `Host:`, Seobility meldet es; die Hauptdomain steht im Canonical.
  it('sets no host directive', () => {
    expect(config.host).toBeUndefined();
  });
});

describe('llms.txt', () => {
  it('lists every live job with link and salary, Quereinstieg only as flow option', async () => {
    const res = llms();
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    const text = await res.text();
    for (const job of liveJobs) {
      expect(text).toContain(`[${job.title}](${jobUrl(job)})`);
    }
    expect(text).toContain('Quereinsteiger und Montagehelfer SHK (m/w/d)');
    expect(text).not.toContain(`/jobs/quereinsteiger`);
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
