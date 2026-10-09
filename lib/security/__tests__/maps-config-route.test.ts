import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/maps/config/route';

function get(headers: Record<string, string> = {}): Request {
  return new Request('https://karriere.bad-energie.de/api/maps/config', { headers });
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('VERCEL_URL', '');
  vi.stubEnv('VERCEL_BRANCH_URL', '');
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', '');
  vi.stubEnv('GOOGLE_MAPS_API_KEY', 'AIzaSyTestKey123');
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID', '');
  vi.stubEnv('GOOGLE_MAPS_MAP_ID', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('GET /api/maps/config', () => {
  it('liefert den Key für Aufrufe von der eigenen Seite', async () => {
    const response = await GET(get({ 'sec-fetch-site': 'same-origin' }));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toEqual({ apiKey: 'AIzaSyTestKey123', mapId: '', hasKey: true });
  });

  it.each<Record<string, string>>([
    {},
    { referer: 'https://evil-bad-energie.de.example/' },
    { referer: 'https://evil.example/bad-energie.de' },
  ])('blockt fremde Aufrufe in Production: %o', async (headers) => {
    const response = await GET(get(headers));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: 'FORBIDDEN' });
  });

  it('meldet Platzhalter-Keys als nicht gesetzt', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'MY_GOOGLE_MAPS_API_KEY');
    const response = await GET(get({ referer: 'https://karriere.bad-energie.de/' }));
    expect(await response.json()).toMatchObject({ apiKey: '', hasKey: false });
  });
});
