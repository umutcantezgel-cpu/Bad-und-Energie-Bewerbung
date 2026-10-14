import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';
import { buildGenericXml } from '../feeds/generic-xml';
import { buildIndeedXml } from '../feeds/indeed-xml';
import { buildJsonFeed } from '../feeds/json-feed';
import { withUtm } from '../feeds/tracking';
import { jobUrl } from '../format';
import { ALL_JOBS, getActiveJobs, getJobById } from '../registry';
import { defineJob, type Job, type JobInput } from '../schema';

const BUILD_DATE = new Date('2026-10-08T06:00:00Z');
const parser = new XMLParser({ ignoreAttributes: false, isArray: (name) => name === 'job' });
const activeRefs = getActiveJobs().map((j) => j.referenceCode);
const am = getJobById('anlagenmechaniker-shk')!;
const funnelOnly = defineJob({
  ...(getJobById('quereinsteiger-montagehelfer')! as unknown as JobInput),
  referenceCode: 'SHK-QE-2026-99',
  status: 'funnel_only',
  channels: { googleJobs: false, indeedFeed: false, genericFeed: false, ba: false },
});
/** E-030: kein Gehaltsfeld und kein Betrag in irgendeinem Feed. */
const OHNE_BETRAG = /<salary|€|\bEUR\b|\bEuro\b/;

function parse(xml: string) {
  expect(XMLValidator.validate(xml)).toBe(true);
  return parser.parse(xml);
}

describe('Indeed-XML', () => {
  const xml = buildIndeedXml(ALL_JOBS, {
    publisher: 'Bad und Energie GmbH Lahn Dill',
    publisherUrl: 'https://karriere.bad-energie.de',
    lastBuildDate: BUILD_DATE,
  });
  const doc = parse(xml);

  it('ist wohlgeformt und hat den Indeed-Kopf', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>')).toBe(true);
    expect(doc.source.publisher).toBe('Bad und Energie GmbH Lahn Dill');
    expect(doc.source.publisherurl).toBe('https://karriere.bad-energie.de');
    expect(doc.source.lastBuildDate).toBe('Thu, 08 Oct 2026 06:00:00 GMT');
  });

  it('enthält genau die veröffentlichten Stellen mit Indeed-Flag', () => {
    const jobs = doc.source.job as Record<string, unknown>[];
    expect(jobs.map((j) => j.referencenumber)).toEqual(activeRefs);
    expect(jobs.map((j) => j.referencenumber)).toContain('SHK-QE-2026-05');
    const ohne = buildIndeedXml([...ALL_JOBS, funnelOnly], { lastBuildDate: BUILD_DATE });
    expect(ohne).not.toContain('SHK-QE-2026-99');
  });

  it('ohne Gehaltsfeld und ohne Betrag (E-030: Lohn auf Anfrage), die Beschreibung sagt es', () => {
    expect(xml).not.toMatch(OHNE_BETRAG);
    const job = (doc.source.job as Record<string, string>[])[0];
    expect(job).not.toHaveProperty('salary');
    expect(job.description).toContain('Lohn: auf Anfrage');
  });

  it('jede Stelle hat alle Felder, URL mit UTM', () => {
    const job = (doc.source.job as Record<string, string>[])[0];
    for (const key of [
      'title',
      'date',
      'referencenumber',
      'url',
      'company',
      'city',
      'state',
      'country',
      'postalcode',
      'description',
      'jobtype',
      'expirationdate',
    ]) {
      expect(job[key], key).toBeTruthy();
    }
    expect(job.date).toBe('Sun, 01 Mar 2026 00:00:00 GMT');
    expect(job.jobtype).toBe('fulltime');
    expect(job.expirationdate).toBe('2027-01-12');
    const url = new URL(job.url);
    expect(`${url.origin}${url.pathname}`).toBe(jobUrl(am));
    expect(url.searchParams.get('utm_source')).toBe('indeed');
    expect(url.searchParams.get('utm_medium')).toBe('jobboard');
    expect(url.searchParams.get('utm_campaign')).toBe(am.id);
  });

  it('Ausbildung als apprenticeship, Praktikum als internship, Büro in Voll- oder Teilzeit', () => {
    const jobs = doc.source.job as Record<string, string>[];
    const jobtype = (ref: string) => jobs.find((j) => j.referencenumber === ref)?.jobtype;
    expect(jobtype('SHK-AZ-2026-04')).toBe('apprenticeship');
    expect(jobtype('SHK-AZ-2027-06')).toBe('apprenticeship');
    expect(jobtype('SHK-PR-2026-07')).toBe('internship');
    expect(jobtype('SHK-BU-2026-08')).toBe('fulltime, parttime');
  });

  it('respektiert Kanal-Flag und Ablaufdatum', () => {
    const off: Job = { ...am, channels: { ...am.channels, indeedFeed: false } };
    const expired: Job = { ...am, referenceCode: 'SHK-WP-2026-99', validThrough: '2026-10-01' };
    const out = parse(buildIndeedXml([off, expired], { lastBuildDate: BUILD_DATE }));
    expect(out.source.job).toBeUndefined();
  });

  it('übersteht „]]>“ und Steuerzeichen im Text', () => {
    const tricky: Job = { ...am, intro: 'Ende ]]> und weiter \u0007 <b>fett</b>' };
    const out = parse(buildIndeedXml([tricky], { lastBuildDate: BUILD_DATE }));
    expect(out.source.job[0].description).toContain('Ende ]]&gt; und weiter');
  });
});

describe('Generischer XML-Feed', () => {
  const xml = buildGenericXml(ALL_JOBS, { lastBuildDate: BUILD_DATE });
  const doc = parse(xml);

  it('ist wohlgeformt und enthält nur veröffentlichte Stellen mit Flag', () => {
    const jobs = doc.jobs.job as Record<string, unknown>[];
    expect(jobs.map((j) => j.referencenumber)).toEqual(activeRefs);
    expect(doc.jobs.lastbuilddate).toBe('2026-10-08T06:00:00.000Z');
  });

  it('Daten ohne Gehaltsfelder (E-030); Radius nur bei Stellen mit Baustellen', () => {
    expect(xml).not.toMatch(OHNE_BETRAG);
    const jobs = doc.jobs.job as Record<string, unknown>[];
    const job = jobs[0];
    expect(job['@_id']).toBe(am.id);
    for (const key of ['salary', 'salarymin', 'salarymax', 'salarycurrency', 'salaryperiod']) expect(job).not.toHaveProperty(key);
    expect(String(job.description)).toContain('Lohn: auf Anfrage');
    expect(job.radiuskm).toBe(35);
    expect(jobs.find((j) => j['@_id'] === 'buerofachkraft')).not.toHaveProperty('radiuskm');
    expect(job.date).toBe('2026-03-01');
    expect(new URL(String(job.url)).searchParams.get('utm_source')).toBe('jobs-xml');
  });

  it('utm_source ist konfigurierbar', () => {
    const custom = parse(buildGenericXml(ALL_JOBS, { lastBuildDate: BUILD_DATE, source: 'jooble' }));
    expect(new URL(String(custom.jobs.job[0].url)).searchParams.get('utm_source')).toBe('jooble');
  });
});

describe('JSON-Feed', () => {
  it('liefert JobPosting-Objekte der veröffentlichten Stellen mit kanonischer URL, ohne baseSalary', () => {
    const feed = buildJsonFeed(ALL_JOBS, { now: BUILD_DATE });
    expect(feed.map((j) => j.identifier.value)).toEqual(activeRefs);
    for (const item of feed) {
      expect(item['@type']).toBe('JobPosting');
      expect(item.url).not.toContain('utm_');
      expect(item).not.toHaveProperty('baseSalary');
    }
    expect(JSON.stringify(feed)).not.toMatch(/€|MonetaryAmount|"(?:min|max)Value"/);
    expect(JSON.parse(JSON.stringify(feed))).toEqual(feed);
  });

  it('optional mit UTM, @id bleibt kanonisch', () => {
    const [first] = buildJsonFeed(ALL_JOBS, { now: BUILD_DATE, utmSource: 'bad-energie-de' });
    expect(new URL(first.url).searchParams.get('utm_source')).toBe('bad-energie-de');
    expect(first['@id']).toBe(`${jobUrl(am)}#jobposting`);
  });
});

describe('withUtm', () => {
  it('setzt UTM und behält vorhandene Parameter', () => {
    const url = new URL(withUtm('https://example.org/jobs/x?ref=abc', { source: 'indeed', campaign: 'c1' }));
    expect(url.searchParams.get('ref')).toBe('abc');
    expect(url.searchParams.get('utm_source')).toBe('indeed');
    expect(url.searchParams.get('utm_medium')).toBe('jobboard');
    expect(url.searchParams.get('utm_campaign')).toBe('c1');
  });
});
