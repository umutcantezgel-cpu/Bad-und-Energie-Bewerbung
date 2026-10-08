import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { guardErrorResponse, guardJsonPost } from '@/lib/security/guard';
import { MemoryRateLimiter } from '@/lib/security/rate-limit';

const URL = 'https://karriere.bad-energie.de/api/bewerbung';
const RULES = [{ limit: 2, windowMs: 60_000 }];

function post(
  body: string,
  headers: Record<string, string> = {},
): Request {
  return new Request(URL, {
    method: 'POST',
    headers: {
      origin: 'https://karriere.bad-energie.de',
      'content-type': 'application/json',
      'x-real-ip': '203.0.113.7',
      ...headers,
    },
    body,
  });
}

let limiter: MemoryRateLimiter;

beforeEach(() => {
  limiter = new MemoryRateLimiter();
  vi.stubEnv('VERCEL_ENV', '');
  vi.stubEnv('IP_HASH_SALT', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('guardJsonPost', () => {
  it('lässt gültige Anfragen von der eigenen Seite durch', async () => {
    const result = await guardJsonPost(post('{"a":1}'), { scope: 't', rateLimit: RULES, limiter });
    expect(result).toEqual({ ok: true, data: { a: 1 } });
  });

  it('lehnt fremde oder fehlende Herkunft mit 403 ab, bevor gezählt wird', async () => {
    const foreign = await guardJsonPost(post('{}', { origin: 'https://evil.example' }), { scope: 't', rateLimit: RULES, limiter });
    expect(foreign).toMatchObject({ ok: false, status: 403, code: 'FORBIDDEN' });
    expect(limiter.size).toBe(0);
  });

  it('begrenzt je IP-Hash und Scope (429 mit Wartezeit)', async () => {
    const options = { scope: 't', rateLimit: RULES, limiter };
    await guardJsonPost(post('{}'), options);
    await guardJsonPost(post('{}'), options);
    const blocked = await guardJsonPost(post('{}'), options);
    expect(blocked).toMatchObject({ ok: false, status: 429, code: 'RATE_LIMITED' });
    expect(blocked.ok === false && 'retryAfterSec' in blocked && blocked.retryAfterSec).toBeGreaterThan(0);

    expect(await guardJsonPost(post('{}', { 'x-real-ip': '198.51.100.1' }), options)).toMatchObject({ ok: true });
    expect(await guardJsonPost(post('{}'), { ...options, scope: 'anders' })).toMatchObject({ ok: true });
  });

  it('zählt IPv6-Adressen aus demselben /64 gemeinsam', async () => {
    const options = { scope: 't', rateLimit: RULES, limiter };
    await guardJsonPost(post('{}', { 'x-real-ip': '2001:db8:1:2::1' }), options);
    await guardJsonPost(post('{}', { 'x-real-ip': '2001:db8:1:2::2' }), options);
    expect(await guardJsonPost(post('{}', { 'x-real-ip': '2001:db8:1:2::3' }), options)).toMatchObject({ status: 429 });
  });

  it('prüft Content-Type und Body-Cap', async () => {
    const options = { scope: 't', rateLimit: [{ limit: 10, windowMs: 60_000 }], limiter, maxBytes: 16 };
    expect(await guardJsonPost(post('{}', { 'content-type': 'text/plain' }), options)).toMatchObject({ status: 415 });
    expect(await guardJsonPost(post(JSON.stringify({ text: 'x'.repeat(32) })), options)).toMatchObject({ status: 413 });
    expect(await guardJsonPost(post('{'), options)).toMatchObject({ status: 400 });
  });

  it('meldet 503, wenn in Production das IP_HASH_SALT fehlt', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const result = await guardJsonPost(post('{}'), { scope: 't', rateLimit: RULES, limiter });
    expect(result).toEqual({ ok: false, status: 503, code: 'NOT_CONFIGURED' });
  });
});

describe('guardErrorResponse', () => {
  it('liefert Text, Code, no-store und Retry-After', async () => {
    const res = guardErrorResponse({ ok: false, status: 429, code: 'RATE_LIMITED', retryAfterSec: 42 });
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('42');
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toMatchObject({ success: false, code: 'RATE_LIMITED', error: expect.stringContaining('06441 42956') });
  });
});
