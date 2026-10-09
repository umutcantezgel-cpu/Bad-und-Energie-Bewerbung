import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';
import * as route from '@/app/feeds/[feed]/route';
import { jobUrl } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';

const parser = new XMLParser({ ignoreAttributes: false, isArray: (name) => name === 'job' });
const liveRefs = getActiveJobs()
  .filter((job) => isJobLive(job, new Date()))
  .map((job) => job.referenceCode);

function get(feed: string) {
  return route.GET(new Request(`https://karriere.bad-energie.de/feeds/${feed}`), {
    params: Promise.resolve({ feed }),
  });
}

describe('/feeds/[feed]', () => {
  it('is static with hourly revalidation and only the three known feeds', () => {
    expect(route.dynamic).toBe('force-static');
    expect(route.revalidate).toBe(3600);
    expect(route.dynamicParams).toBe(false);
    expect(route.generateStaticParams()).toEqual([{ feed: 'indeed.xml' }, { feed: 'jobs.xml' }, { feed: 'jobs.json' }]);
  });

  it('indeed.xml: well-formed Indeed XML with publisher and all live jobs', async () => {
    const res = await get('indeed.xml');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/xml; charset=utf-8');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    const xml = await res.text();
    expect(XMLValidator.validate(xml)).toBe(true);
    const doc = parser.parse(xml);
    expect(doc.source.publisher).toBe('Bad und Energie GmbH Lahn Dill');
    expect(doc.source.publisherurl).toMatch(/^https:\/\/[^/]+$/);
    const jobs = doc.source.job as { referencenumber: string; url: string }[];
    expect(jobs.map((j) => j.referencenumber)).toEqual(liveRefs);
    for (const job of jobs) expect(job.url).toContain('utm_source=indeed');
    expect(xml).not.toContain('SHK-QE-2026-05');
  });

  it('jobs.xml: well-formed aggregator XML with structured salary', async () => {
    const res = await get('jobs.xml');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/xml; charset=utf-8');
    const xml = await res.text();
    expect(XMLValidator.validate(xml)).toBe(true);
    const doc = parser.parse(xml);
    expect(doc.jobs.publisher).toBe('Bad und Energie GmbH Lahn Dill');
    const jobs = doc.jobs.job as { referencenumber: string; salarymin: number; url: string }[];
    expect(jobs.map((j) => j.referencenumber)).toEqual(liveRefs);
    for (const job of jobs) {
      expect(job.salarymin).toBeGreaterThan(0);
      expect(job.url).toContain('utm_source=jobs-xml');
    }
  });

  it('jobs.json: JobPosting array with CORS for bad-energie.de', async () => {
    const res = await get('jobs.json');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
    expect(res.headers.get('access-control-allow-origin')).toBe('https://bad-energie.de');
    const data = (await res.json()) as { '@type': string; '@id': string; url: string; identifier: { value: string } }[];
    expect(data.map((d) => d.identifier.value)).toEqual(liveRefs);
    for (const node of data) {
      expect(node['@type']).toBe('JobPosting');
      expect(node.url).toContain('utm_source=jobs-json');
    }
    const first = getActiveJobs()[0];
    expect(data[0]['@id']).toBe(`${jobUrl(first)}#jobposting`);
  });

  it.each(['unknown.xml', 'indeed', 'jobs.csv', '__proto__'])('404 for unknown feed %s', async (feed) => {
    const res = await get(feed);
    expect(res.status).toBe(404);
  });
});
