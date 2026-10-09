import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { attributionFromUrl } from '@/lib/attribution/capture';
import { attributionSchema, parseAttribution, sanitizeAttribution, sanitizeHost, sanitizePath, sanitizeToken } from '@/lib/attribution/schema';
import { captureAttribution, getAttribution, resetAttributionForTests } from '@/lib/attribution/store';

const PAGE = 'https://karriere.bad-energie.de';

describe('sanitize', () => {
  it('lowercases tokens and keeps only [a-z0-9._-]', () => {
    expect(sanitizeToken('Google_Jobs_Apply')).toBe('google_jobs_apply');
    expect(sanitizeToken('Herbst Kampagne 2026')).toBe('herbst-kampagne-2026');
    expect(sanitizeToken('Wärmepumpe & Bad!')).toBe('waermepumpe-bad');
    expect(sanitizeToken('<script>')).toBe('script');
    expect(sanitizeToken('   ')).toBeUndefined();
    expect(sanitizeToken('x'.repeat(150))).toHaveLength(100);
    expect(sanitizeToken(42)).toBeUndefined();
  });

  it('keeps only the host of a referrer and the path of a landing page', () => {
    expect(sanitizeHost('https://www.Google.de/search?q=job')).toBe('www.google.de');
    expect(sanitizeHost('de.indeed.com')).toBe('de.indeed.com');
    expect(sanitizeHost('not a host')).toBeUndefined();
    expect(sanitizePath('/jobs/x?utm_source=a#top')).toBe('/jobs/x');
    expect(sanitizePath('https://evil.example/x')).toBeUndefined();
    expect(sanitizePath('//evil.example')).toBeUndefined();
  });

  it('cleans a whole attribution and stays within the shared schema', () => {
    const result = sanitizeAttribution({
      utmSource: 'Indeed',
      utmMedium: 'Job Board',
      ref: 'KOCH-2026',
      referrerHost: 'https://de.indeed.com/viewjob?jk=1',
      landingPath: '/jobs/anlagenmechaniker-shk-wetzlar?x=1',
      unknown: 'dropped',
    });
    expect(result).toEqual({
      utmSource: 'indeed',
      utmMedium: 'job-board',
      ref: 'koch-2026',
      referrerHost: 'de.indeed.com',
      landingPath: '/jobs/anlagenmechaniker-shk-wetzlar',
    });
    expect(attributionSchema.safeParse(result).success).toBe(true);
  });

  it('parseAttribution falls back to an empty attribution', () => {
    expect(parseAttribution({ utmSource: 'x'.repeat(500) })).toEqual({});
    expect(parseAttribution({ foreign: 1 })).toEqual({});
    expect(parseAttribution('nope')).toEqual({});
    expect(parseAttribution({ utmSource: 'Indeed' })).toEqual({ utmSource: 'indeed' });
  });
});

describe('attributionFromUrl', () => {
  it('reads utm, ref, referrer host and landing path without query', () => {
    expect(
      attributionFromUrl({
        url: `${PAGE}/jobs/anlagenmechaniker-shk-wetzlar?utm_source=indeed&utm_medium=jobboard&utm_campaign=anlagenmechaniker-shk&ref=Koch&fbclid=abc#bewerben`,
        referrer: 'https://de.indeed.com/viewjob?jk=123&name=Max',
      }),
    ).toEqual({
      utmSource: 'indeed',
      utmMedium: 'jobboard',
      utmCampaign: 'anlagenmechaniker-shk',
      ref: 'koch',
      referrerHost: 'de.indeed.com',
      landingPath: '/jobs/anlagenmechaniker-shk-wetzlar',
    });
  });

  it('ignores same-site referrers', () => {
    expect(attributionFromUrl({ url: `${PAGE}/bewerbung`, referrer: `${PAGE}/jobs` })).toEqual({ landingPath: '/bewerbung' });
    expect(attributionFromUrl({ url: `${PAGE}/`, referrer: 'https://www.bad-energie.de/' })).toEqual({ landingPath: '/' });
  });

  it('treats other projects on shared hosting as foreign', () => {
    expect(
      attributionFromUrl({ url: 'https://preview-abc.vercel.app/', referrer: 'https://other.vercel.app/' }),
    ).toMatchObject({ referrerHost: 'other.vercel.app' });
  });

  it('returns nothing for unusable URLs', () => {
    expect(attributionFromUrl({ url: 'not a url', referrer: 'x' })).toEqual({});
    expect(attributionFromUrl({ url: `${PAGE}/`, referrer: 'android-app://com.google.android.gm/' })).toEqual({ landingPath: '/' });
  });
});

describe('store', () => {
  beforeEach(() => resetAttributionForTests());
  afterEach(() => {
    vi.unstubAllGlobals();
    resetAttributionForTests();
  });

  it('keeps the first touch of the page load', () => {
    captureAttribution({ url: `${PAGE}/?utm_source=indeed&utm_medium=jobboard`, referrer: '' });
    captureAttribution({ url: `${PAGE}/jobs?utm_source=facebook&utm_medium=cpc`, referrer: '' });
    expect(getAttribution()).toEqual({ utmSource: 'indeed', utmMedium: 'jobboard', landingPath: '/' });
  });

  it('returns a copy that callers cannot use to change the store', () => {
    captureAttribution({ url: `${PAGE}/?utm_source=indeed`, referrer: '' });
    const copy = getAttribution();
    copy.utmSource = 'changed';
    expect(getAttribution().utmSource).toBe('indeed');
  });

  it('is empty on the server', () => {
    expect(getAttribution()).toEqual({});
  });

  it('captures lazily in the browser and never touches cookies or storage', () => {
    const forbidden = () => {
      throw new Error('storage must not be used');
    };
    const document = { referrer: 'https://www.google.de/' };
    Object.defineProperty(document, 'cookie', { get: forbidden, set: forbidden });
    const window = { location: { href: `${PAGE}/jobs?utm_source=hwk` } };
    Object.defineProperty(window, 'localStorage', { get: forbidden });
    Object.defineProperty(window, 'sessionStorage', { get: forbidden });
    vi.stubGlobal('window', window);
    vi.stubGlobal('document', document);
    vi.stubGlobal('localStorage', undefined);
    vi.stubGlobal('sessionStorage', undefined);

    expect(getAttribution()).toEqual({ utmSource: 'hwk', referrerHost: 'www.google.de', landingPath: '/jobs' });
  });
});
