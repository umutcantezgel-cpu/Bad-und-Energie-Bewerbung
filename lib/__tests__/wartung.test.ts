import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { describeFailure } from '@/lib/apply/failure';
import { APPLICATION_ENDPOINT, FOLLOW_UP_ENDPOINT, interpretFailure } from '@/lib/apply/submit';
import { FACTS } from '@/lib/content/facts';
import {
  WARTUNGSMODUS,
  WARTUNG_BEWERBUNG_TEXT,
  WARTUNG_HTML,
  WARTUNG_RETRY_AFTER_SEC,
  wartungAktiv,
  wartungFuer,
} from '@/lib/wartung';
import { proxy } from '@/proxy';

const BASE = 'https://karriere.bad-energie.de';

function request(path: string, init: { method?: string; headers?: Record<string, string> } = {}): NextRequest {
  return new NextRequest(`${BASE}${path}`, init);
}

function passes(response: Response): boolean {
  return response.status === 200 && response.headers.get('x-middleware-next') === '1';
}

describe('wartungAktiv: Schalter', () => {
  it('lokal, in der CI und auf Previews aus', () => {
    expect(wartungAktiv({})).toBe(false);
    expect(wartungAktiv({ VERCEL_ENV: 'preview' })).toBe(false);
    expect(wartungAktiv({ VERCEL_ENV: 'development' })).toBe(false);
  });

  it('auf Vercel Production wie der Schalter im Code', () => {
    expect(wartungAktiv({ VERCEL_ENV: 'production' })).toBe(WARTUNGSMODUS);
  });

  it('WARTUNGSMODUS=an|aus geht vor; andere Werte zählen nicht', () => {
    expect(wartungAktiv({ WARTUNGSMODUS: 'an' })).toBe(true);
    expect(wartungAktiv({ WARTUNGSMODUS: ' AN ', VERCEL_ENV: 'preview' })).toBe(true);
    expect(wartungAktiv({ WARTUNGSMODUS: 'aus', VERCEL_ENV: 'production' })).toBe(false);
    expect(wartungAktiv({ WARTUNGSMODUS: 'vielleicht', VERCEL_ENV: 'production' })).toBe(WARTUNGSMODUS);
    expect(wartungAktiv({ WARTUNGSMODUS: 'vielleicht' })).toBe(false);
  });
});

describe('wartungFuer: Pfade', () => {
  it.each(['/', '/jobs', '/jobs/anlagenmechaniker-shk-wetzlar', '/bewerbung', '/bewerbung/danke', '/bewerbung/mappe', '/einsatzgebiet/herborn', '/arbeiten-bei-uns/gehalt', '/gibt-es-nicht'])(
    '%s zeigt die Wartungsseite',
    (pfad) => expect(wartungFuer(pfad)).toBe('seite')
  );

  it('neue Bewerbungen werden abgelehnt', () => {
    expect(wartungFuer(APPLICATION_ENDPOINT)).toBe('bewerbung');
  });

  it.each(['/impressum', '/datenschutz', FOLLOW_UP_ENDPOINT, '/api/status', '/api/csp-report'])('%s läuft weiter', (pfad) => {
    expect(wartungFuer(pfad)).toBeNull();
  });
});

describe('proxy im Wartungsmodus', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('WARTUNGSMODUS', 'an');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(['/', '/jobs', '/bewerbung?stelle=initiativ', '/einsatzgebiet'])('%s: Wartungsseite mit 503, Retry-After, ohne Cache', async (pfad) => {
    const response = proxy(request(pfad));
    expect(response.status).toBe(503);
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('retry-after')).toBe(String(WARTUNG_RETRY_AFTER_SEC));
    expect(await response.text()).toBe(WARTUNG_HTML);
  });

  it('Impressum und Datenschutz bleiben erreichbar', () => {
    expect(passes(proxy(request('/impressum')))).toBe(true);
    expect(passes(proxy(request('/datenschutz')))).toBe(true);
  });

  it('neue Bewerbung: 503 im Vertrag C8, der Flow zeigt den Wartungstext', async () => {
    const response = proxy(request(APPLICATION_ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' } }));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const body = await response.json();
    expect(body).toEqual({ ok: false, code: 'SERVICE_UNAVAILABLE', message: WARTUNG_BEWERBUNG_TEXT });
    expect(describeFailure(interpretFailure(response.status, body, response.headers)).detail).toBe(WARTUNG_BEWERBUNG_TEXT);
  });

  it('Ergänzungen und Status laufen weiter', () => {
    expect(passes(proxy(request(FOLLOW_UP_ENDPOINT, { method: 'POST' })))).toBe(true);
    expect(passes(proxy(request('/api/status')))).toBe(true);
  });

  it('gesperrte Scraper bekommen weiter 403', () => {
    const response = proxy(request('/', { headers: { 'user-agent': 'Mozilla/5.0 (compatible; SemrushBot/7~bl)' } }));
    expect(response.status).toBe(403);
  });
});

describe('proxy ohne Wartungsmodus', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('Preview und lokal: die Seite läuft normal', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    expect(passes(proxy(request('/jobs')))).toBe(true);
    vi.stubEnv('VERCEL_ENV', '');
    expect(passes(proxy(request('/')))).toBe(true);
  });

  it('WARTUNGSMODUS=aus schaltet ihn auf Production ab', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('WARTUNGSMODUS', 'aus');
    expect(passes(proxy(request('/')))).toBe(true);
  });
});

describe('Wartungsseite', () => {
  it('eigenständiges Dokument: deutsch, ohne Skripte, mit Logo und Pflichtangaben', () => {
    expect(WARTUNG_HTML.startsWith('<!doctype html>')).toBe(true);
    expect(WARTUNG_HTML).toContain('<html lang="de">');
    expect(WARTUNG_HTML).not.toMatch(/<script/i);
    expect(WARTUNG_HTML).toContain('<h1>Kurze Pause.</h1>');
    expect(WARTUNG_HTML).toContain('src="/images/bad-energie-lahn-dill-logo-transparent.webp" alt="Bad und Energie GmbH Lahn Dill"');
    expect(WARTUNG_HTML).toContain('<a href="/impressum">Impressum</a>');
    expect(WARTUNG_HTML).toContain('<a href="/datenschutz">Datenschutz</a>');
    expect(WARTUNG_HTML).toContain('href="https://bad-energie.de"');
  });

  it('Zusage nur aus der Fakten-Registry (K-012)', () => {
    expect(WARTUNG_HTML).toContain(FACTS.quickResponse.long);
  });
});
