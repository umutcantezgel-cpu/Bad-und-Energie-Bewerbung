import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const dispatchApplicationRequest = vi.fn();
vi.mock('@/lib/email', () => ({ dispatchApplicationRequest }));

const { POST } = await import('@/app/api/bewerbung/route');

const VALID = {
  fullName: 'Max Muster',
  email: 'max@example.org',
  phone: '0170 1234567',
  position: 'Anlagenmechaniker SHK',
};

let ipCounter = 0;

function post(body: unknown, headers: Record<string, string> = {}) {
  ipCounter += 1;
  return POST(
    new Request('https://karriere.bad-energie.de/api/bewerbung', {
      method: 'POST',
      headers: {
        origin: 'https://karriere.bad-energie.de',
        'content-type': 'application/json',
        'x-real-ip': `198.51.100.${ipCounter}`,
        ...headers,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }) as NextRequest,
  );
}

beforeEach(() => {
  vi.stubEnv('VERCEL_ENV', '');
  dispatchApplicationRequest.mockReset();
  dispatchApplicationRequest.mockResolvedValue({
    success: true,
    simulated: true,
    teamNotification: { success: true },
    userConfirmation: { success: true },
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('POST /api/bewerbung', () => {
  it('versendet gültige Bewerbungen von der eigenen Seite', async () => {
    const res = await post(VALID);
    expect(res.status).toBe(200);
    expect(dispatchApplicationRequest).toHaveBeenCalledTimes(1);
  });

  it('lehnt fremde Herkunft mit 403 ab (CSRF)', async () => {
    const res = await post(VALID, { origin: 'https://evil.example' });
    expect(res.status).toBe(403);
    expect(dispatchApplicationRequest).not.toHaveBeenCalled();
  });

  it('lehnt falschen Content-Type und zu große Bodies ab', async () => {
    expect((await post(VALID, { 'content-type': 'text/plain' })).status).toBe(415);
    expect((await post({ ...VALID, notes: 'x'.repeat(70 * 1024) })).status).toBe(413);
    expect(dispatchApplicationRequest).not.toHaveBeenCalled();
  });

  it('begrenzt auf 5 Bewerbungen pro 10 Minuten je IP', async () => {
    const headers = { 'x-real-ip': '203.0.113.99' };
    for (let i = 0; i < 5; i++) expect((await post(VALID, headers)).status).toBe(200);
    const blocked = await post(VALID, headers);
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(dispatchApplicationRequest).toHaveBeenCalledTimes(5);
  });

  it('antwortet mit 503 statt Scheinerfolg, wenn in Production Geheimnisse fehlen', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('IP_HASH_SALT', '');
    const res = await post(VALID);
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ success: false, code: 'NOT_CONFIGURED' });
    expect(dispatchApplicationRequest).not.toHaveBeenCalled();
  });

  it('antwortet mit 503, wenn der Mailversand nicht konfiguriert ist', async () => {
    dispatchApplicationRequest.mockResolvedValue({
      success: false,
      simulated: false,
      teamNotification: { success: false, error: 'not_configured' },
      userConfirmation: { success: false, error: 'not_configured' },
    });
    expect((await post(VALID)).status).toBe(503);
  });
});
