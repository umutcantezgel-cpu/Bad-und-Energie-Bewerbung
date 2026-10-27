import { existsSync } from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { getRedirectUrl, getRewrittenUrl, isRewrite, unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config, proxy } from '@/proxy';

const BASE = 'https://karriere.bad-energie.de';

function request(path: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`${BASE}${path}`, { headers });
}

function passes(response: Response): boolean {
  return response.status === 200 && response.headers.get('x-middleware-next') === '1';
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('VERCEL_URL', '');
  vi.stubEnv('VERCEL_BRANCH_URL', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('proxy: Prozent-Kodierung', () => {
  it('beantwortet kaputte Kodierung mit 400 statt 500', () => {
    const response = proxy(request('/jobs/%ZZ'));
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(proxy(request('/%E0%A4%A')).status).toBe(400);
  });

  it('lässt gültige Kodierung durch', () => {
    expect(passes(proxy(request('/jobs/%C3%A4')))).toBe(true);
    expect(passes(proxy(request('/jobs/kundendiensttechniker-shk')))).toBe(true);
  });
});

describe('proxy: User-Agent', () => {
  it.each([
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.37 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    'python-requests/2.32.3',
    'aiohttp/3.9',
    'Go-http-client/2.0',
    'node-fetch/1.0',
    'Scrapy/2.11 (+https://scrapy.org)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)',
    'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
    '',
  ])('lässt %j durch', (ua) => {
    expect(passes(proxy(request('/', { 'user-agent': ua })))).toBe(true);
  });

  it.each([
    'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
    'Mozilla/5.0 (compatible; SemrushBot-SA/0.97; +http://www.semrush.com/bot.html)',
    'Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)',
    'Mozilla/5.0 (compatible; DotBot/1.2; +https://opensiteexplorer.org/dotbot)',
    'Mozilla/5.0 (compatible; BLEXBot/1.0; +http://webmeup-crawler.com/)',
    'Mozilla/5.0 (compatible; DataForSeoBot/1.0; +https://dataforseo.com/dataforseo-bot)',
    'Mozilla/5.0 (Linux; Android 7.0;) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; PetalBot;+https://webmaster.petalsearch.com/site/petalbot)',
    'Mozilla/5.0 (compatible; MegaIndex.ru/2.0; +http://megaindex.com/crawler)',
  ])('blockt %j mit 403', async (ua) => {
    const response = proxy(request('/jobs', { 'user-agent': ua }));
    expect(response.status).toBe(403);
    expect(await response.text()).toBe('Zugriff verweigert.');
  });

  it('setzt keine Security-Header (die kommen aus next.config.ts)', () => {
    const response = proxy(request('/'));
    expect(response.headers.get('strict-transport-security')).toBeNull();
    expect(response.headers.get('x-subdomain-role')).toBeNull();
  });
});

describe('proxy: /api/maps/config', () => {
  it.each<Record<string, string>>([
    { 'sec-fetch-site': 'same-origin' },
    { referer: 'https://karriere.bad-energie.de/' },
    { referer: 'https://bad-energie.de/karriere' },
    { origin: 'https://www.bad-energie.de' },
  ])('erlaubt Aufrufe von der eigenen Seite: %o', (headers) => {
    expect(passes(proxy(request('/api/maps/config', headers)))).toBe(true);
  });

  it.each<Record<string, string>>([
    {},
    { 'sec-fetch-site': 'cross-site', referer: 'https://evil.example/' },
    { referer: 'https://evil-bad-energie.de.example/' },
    { origin: 'https://evil-bad-energie.de.example' },
    { referer: 'https://bad-energie.de.evil.example/' },
    { referer: 'https://evilbad-energie.de/' },
    { referer: 'https://evil.example/?ref=bad-energie.de' },
    { referer: 'not a url bad-energie.de' },
  ])('blockt fremde Aufrufe in Production: %o', (headers) => {
    expect(proxy(request('/api/maps/config', headers)).status).toBe(403);
  });

  it('erlaubt die Vercel-Deployment- und Branch-URL exakt', () => {
    vi.stubEnv('VERCEL_URL', 'karriere-abc123.vercel.app');
    vi.stubEnv('VERCEL_BRANCH_URL', 'karriere-git-main-team.vercel.app');
    expect(passes(proxy(request('/api/maps/config', { referer: 'https://karriere-abc123.vercel.app/' })))).toBe(true);
    expect(
      passes(proxy(request('/api/maps/config', { origin: 'https://karriere-git-main-team.vercel.app' })))
    ).toBe(true);
    expect(proxy(request('/api/maps/config', { referer: 'https://other-abc123.vercel.app/' })).status).toBe(403);
  });

  it('prüft außerhalb von Production nicht', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(passes(proxy(request('/api/maps/config')))).toBe(true);
  });
});

describe('proxy: matcher', () => {
  const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url });

  it.each([
    '/_next/static/chunks/app.js',
    '/_next/image?url=%2Fimages%2Flogo.webp&w=640&q=75',
    '/favicon.ico',
    '/icon-192.png',
    '/images/bad-energie-lahn-dill-logo.webp',
    '/feeds/indeed.xml',
    '/feeds/jobs.json',
    '/sitemap.xml',
    '/sitemap/kern.xml',
    '/sitemap/stellen.xml',
    '/sitemap/orte.xml',
    '/sitemap/themen.xml',
    '/robots.txt',
    '/llms.txt',
    '/llms-full.txt',
    '/298d966b7e4f4a43981cb8e30da6b5b5.txt',
  ])('läuft nicht für %s', (url) => {
    expect(matches(url)).toBe(false);
  });

  // Beispiele für statische Dateien nur mit Dateien, die es gibt (die erfundenen SVG-Logos sind gelöscht, P0-6).
  it.each(['/favicon.ico', '/icon-192.png', '/images/bad-energie-lahn-dill-logo.webp', '/298d966b7e4f4a43981cb8e30da6b5b5.txt'])(
    '%s liegt in public/',
    (url) => {
      expect(existsSync(path.join(process.cwd(), 'public', url))).toBe(true);
    }
  );

  it.each([
    '/',
    '/bewerbung',
    '/bewerbung?stelle=anlagenmechaniker-shk-wetzlar',
    '/bewerbung/variante/initiativ/ohne',
    '/jobs/anlagenmechaniker-shk',
    '/api/maps/config',
    '/api/bewerbung',
    '/api/e',
  ])('läuft für %s', (url) => {
    expect(matches(url)).toBe(true);
  });
});

// Schritt 2b: /bewerbung ist statisch; Vorauswahl, Unterlagen-Hinweis und Altlinks entscheidet der Proxy (lib/apply/vorauswahl.ts).
describe('proxy: /bewerbung aus dem Cache', () => {
  it('schreibt ?stelle= intern auf die vorgerenderte Variante um; die Adresse im Browser (mit utm) bleibt', () => {
    const response = proxy(request('/bewerbung?stelle=anlagenmechaniker-shk-wetzlar&utm_source=indeed'));
    expect(isRewrite(response)).toBe(true);
    expect(getRewrittenUrl(response)).toBe(`${BASE}/bewerbung/variante/anlagenmechaniker-shk/ohne`);
  });

  it('schreibt den Unterlagen-Hinweis der Altlinks auf die Variante ohne Stelle um', () => {
    expect(getRewrittenUrl(proxy(request('/bewerbung?tab=vault')))).toBe(`${BASE}/bewerbung/variante/keine/unterlagen`);
    expect(getRewrittenUrl(proxy(request('/bewerbung?direct=true&stelle=initiativ')))).toBe(`${BASE}/bewerbung/variante/initiativ/unterlagen`);
  });

  it.each([
    ['?tab=dossier&utm_source=indeed', `${BASE}/bewerbung/mappe?utm_source=indeed`],
    ['?tab=%20DOSSIER%20', `${BASE}/bewerbung/mappe`],
  ])('leitet %s mit 308 auf die Mappe', (query, ziel) => {
    const response = proxy(request(`/bewerbung${query}`));
    expect(response.status).toBe(308);
    expect(getRedirectUrl(response)).toBe(ziel);
  });

  it('leitet einen direkten Aufruf der internen Adresse mit 308 auf /bewerbung zurück', () => {
    const response = proxy(request('/bewerbung/variante/anlagenmechaniker-shk/ohne?utm_source=x'));
    expect(response.status).toBe(308);
    expect(getRedirectUrl(response)).toBe(`${BASE}/bewerbung?utm_source=x&stelle=anlagenmechaniker-shk`);
  });

  it.each(['', '?utm_source=indeed&ref=koch', '?stelle=gibt-es-nicht', '?tab=quiz', '?direct=false'])(
    'lässt /bewerbung%s zur statischen Seite durch',
    (query) => {
      const response = proxy(request(`/bewerbung${query}`));
      expect(passes(response)).toBe(true);
      expect(isRewrite(response)).toBe(false);
    },
  );
});
