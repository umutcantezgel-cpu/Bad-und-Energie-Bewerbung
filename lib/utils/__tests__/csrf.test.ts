import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCSRFAllowedOrigins, validateCSRF } from '@/lib/utils/csrf';

function post(headers: Record<string, string>): Request {
  return new Request('https://karriere.bad-energie.de/api/bewerbung', { method: 'POST', headers });
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('APP_URL', '');
  vi.stubEnv('VERCEL_URL', '');
  vi.stubEnv('VERCEL_BRANCH_URL', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('validateCSRF', () => {
  it('akzeptiert Sec-Fetch-Site: same-origin ohne Origin', () => {
    expect(validateCSRF(post({ 'sec-fetch-site': 'same-origin' }))).toBe(true);
  });

  it('akzeptiert die Produktions-Origin', () => {
    expect(validateCSRF(post({ origin: 'https://karriere.bad-energie.de' }))).toBe(true);
  });

  it('akzeptiert APP_URL und die Vercel-URLs', () => {
    vi.stubEnv('APP_URL', 'https://staging.example.org/');
    vi.stubEnv('VERCEL_URL', 'karriere-abc123.vercel.app');
    vi.stubEnv('VERCEL_BRANCH_URL', 'karriere-git-main-team.vercel.app');

    expect(validateCSRF(post({ origin: 'https://staging.example.org' }))).toBe(true);
    expect(validateCSRF(post({ origin: 'https://karriere-abc123.vercel.app' }))).toBe(true);
    expect(validateCSRF(post({ origin: 'https://karriere-git-main-team.vercel.app' }))).toBe(true);
    expect(getCSRFAllowedOrigins()).toEqual([
      'https://staging.example.org',
      'https://karriere.bad-energie.de',
      'https://karriere-abc123.vercel.app',
      'https://karriere-git-main-team.vercel.app',
    ]);
  });

  it('akzeptiert zusätzliche Origins aus opts.allowedOrigins', () => {
    const request = post({ origin: 'https://partner.example.org' });
    expect(validateCSRF(request)).toBe(false);
    expect(validateCSRF(request, { allowedOrigins: ['https://partner.example.org/'] })).toBe(true);
  });

  it.each([
    'https://evil.example',
    'https://karriere.bad-energie.de.evil.example',
    'https://evil-karriere.bad-energie.de',
    'http://karriere.bad-energie.de',
    'https://karriere.bad-energie.de:8443',
    'null',
  ])('lehnt fremde Origin %s ab', (origin) => {
    expect(validateCSRF(post({ origin }))).toBe(false);
  });

  it('lehnt cross-site ab, auch wenn ein erlaubter Referer mitkommt', () => {
    const request = post({
      'sec-fetch-site': 'cross-site',
      origin: 'https://evil.example',
      referer: 'https://karriere.bad-energie.de/bewerbung',
    });
    expect(validateCSRF(request)).toBe(false);
  });

  it('nutzt den Referer, wenn die Origin fehlt', () => {
    expect(validateCSRF(post({ referer: 'https://karriere.bad-energie.de/bewerbung?x=1' }))).toBe(true);
    expect(validateCSRF(post({ referer: 'https://evil.example/karriere.bad-energie.de' }))).toBe(false);
  });

  it('lehnt Requests ohne Origin und Referer ab', () => {
    expect(validateCSRF(post({}))).toBe(false);
    expect(validateCSRF(post({ 'sec-fetch-site': 'none' }))).toBe(false);
  });

  it('erlaubt localhost und 127.0.0.1 nur außerhalb von Production', () => {
    const localhost = post({ origin: 'http://localhost:3000' });
    const loopback = post({ origin: 'http://127.0.0.1:4173' });
    expect(validateCSRF(localhost)).toBe(false);
    expect(validateCSRF(loopback)).toBe(false);

    vi.stubEnv('NODE_ENV', 'development');
    expect(validateCSRF(localhost)).toBe(true);
    expect(validateCSRF(loopback)).toBe(true);
    expect(validateCSRF(post({ origin: 'http://localhost.evil.example:3000' }))).toBe(false);
    expect(validateCSRF(post({ origin: 'https://evil.example' }))).toBe(false);
  });
});
