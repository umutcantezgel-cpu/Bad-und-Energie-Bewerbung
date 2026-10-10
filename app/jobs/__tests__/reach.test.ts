import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { GET as llmsFull } from '@/app/llms-full.txt/route';
import { GET as llms } from '@/app/llms.txt/route';
import { FACTS, isFactActive } from '@/lib/content/facts';
import { withUtm } from '@/lib/jobs/feeds/tracking';
import { jobUrl } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs, getJobPageSlugs, isJobLive } from '@/lib/jobs/registry';
import { getAllPortalUrls } from '@/lib/seo/indexnow';
import { SITE_CONFIG } from '@/lib/seo/site-config';

const base = SITE_CONFIG.baseUrl.replace(/\/+$/, '');
const liveJobs = getActiveJobs().filter((job) => isJobLive(job, new Date()));

describe('sitemap', () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it('lists home, /jobs, every live job page and /bewerbung', () => {
    expect(urls).toEqual([`${base}/`, `${base}/jobs`, ...liveJobs.map(jobUrl), `${base}/bewerbung`]);
  });

  it('uses the job updatedAt as lastModified', () => {
    for (const job of liveJobs) {
      expect(entries.find((e) => e.url === jobUrl(job))?.lastModified).toBe(job.updatedAt);
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
  it('matches the registry: home, /jobs, job pages, /bewerbung', () => {
    expect(getAllPortalUrls()).toEqual([
      `${base}/`,
      `${base}/jobs`,
      ...getJobPageSlugs().map((slug) => `${base}/jobs/${slug}`),
      `${base}/bewerbung`,
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
