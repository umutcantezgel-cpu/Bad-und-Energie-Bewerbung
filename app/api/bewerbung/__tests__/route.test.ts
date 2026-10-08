import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const dispatchApplicationEmails = vi.hoisted(() => vi.fn());
const dispatchApplicationFollowUpEmail = vi.hoisted(() => vi.fn());
vi.mock('@/lib/email', () => ({ dispatchApplicationEmails, dispatchApplicationFollowUpEmail }));

const { POST } = await import('@/app/api/bewerbung/route');
const { verifyFollowUpToken } = await import('@/lib/applications/token');
const { getSecret } = await import('@/lib/env');

const OK = { success: true, simulated: true, teamNotification: { success: true }, userConfirmation: { success: true } };

let ipCounter = 0;
let keyCounter = 0;

function uuid(): string {
  keyCounter += 1;
  return `00000000-0000-4000-8000-${String(keyCounter).padStart(12, '0')}`;
}

function valid(overrides: Record<string, unknown> = {}) {
  return {
    jobId: 'anlagenmechaniker-shk',
    answers: { qualification: 'geselle-2-5', start: 'sofort' },
    name: 'Max Muster',
    phone: '0151 23456789',
    contactChannel: 'whatsapp',
    attribution: { utmSource: 'indeed', utmMedium: 'jobboard', landingPath: '/jobs/anlagenmechaniker-shk-wetzlar' },
    privacyNoticeVersion: '2026-10',
    idempotencyKey: uuid(),
    startedAt: Date.now() - 30_000,
    website: '',
    ...overrides,
  };
}

function post(body: unknown, headers: Record<string, string> = {}) {
  ipCounter += 1;
  return POST(
    new Request('https://karriere.bad-energie.de/api/bewerbung', {
      method: 'POST',
      headers: {
        origin: 'https://karriere.bad-energie.de',
        'content-type': 'application/json',
        'x-real-ip': `198.51.100.${ipCounter % 250}`,
        ...headers,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );
}

function sentApplication() {
  expect(dispatchApplicationEmails).toHaveBeenCalled();
  return dispatchApplicationEmails.mock.calls.at(-1)![0];
}

beforeEach(() => {
  vi.stubEnv('VERCEL_ENV', '');
  dispatchApplicationEmails.mockReset();
  dispatchApplicationEmails.mockResolvedValue(OK);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('POST /api/bewerbung', () => {
  it('accepts a valid application with reference, follow-up token and first name', async () => {
    const res = await post(valid());
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');

    const body = await res.json();
    expect(body).toMatchObject({ ok: true, firstName: 'Max' });
    expect(body.reference).toMatch(/^BE-\d{2}-[23456789A-HJKMNP-Z]{6}$/);
    expect(verifyFollowUpToken(body.reference, body.followUpToken, new Date(), getSecret('APPLICATION_TOKEN_SECRET'))).toMatchObject({ ok: true });

    expect(dispatchApplicationEmails).toHaveBeenCalledTimes(1);
    const app = sentApplication();
    expect(app.reference).toBe(body.reference);
    expect(app.channel).toBe('indeed');
    expect(app.phone.e164).toBe('+4915123456789');
    expect(app.suspectedSpam).toBe(false);
  });

  it('derives the job title on the server and ignores client titles', async () => {
    await post(valid({ jobTitle: 'Chefarzt (m/w/d)', title: 'Chefarzt' }));
    const app = sentApplication();
    expect(app.job.title).toBe('Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d)');
    expect(app.job.referenceCode).toBe('SHK-WP-2026-01');
    expect(JSON.stringify(app)).not.toContain('Chefarzt');
  });

  it('maps the initiative application to "Initiativbewerbung"', async () => {
    await post(valid({ jobId: 'initiativ', answers: {} }));
    expect(sentApplication().job).toMatchObject({ id: 'initiativ', title: 'Initiativbewerbung' });
  });

  it('answers a retry with the same idempotency key with the same reference and sends once', async () => {
    const payload = valid();
    const first = await (await post(payload)).json();
    const second = await (await post(payload)).json();
    expect(second.ok).toBe(true);
    expect(second.reference).toBe(first.reference);
    expect(dispatchApplicationEmails).toHaveBeenCalledTimes(1);
  });

  it('fakes success for the honeypot and sends nothing', async () => {
    const res = await post(valid({ website: 'https://spam.example' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, firstName: 'Max' });
    expect(body.reference).toMatch(/^BE-\d{2}-/);
    expect(typeof body.followUpToken).toBe('string');
    expect(dispatchApplicationEmails).not.toHaveBeenCalled();
  });

  it('accepts but flags forms filled in under 3 seconds', async () => {
    const res = await post(valid({ startedAt: Date.now() - 800 }));
    expect(res.status).toBe(200);
    expect(sentApplication().suspectedSpam).toBe(true);
  });

  it('maps validation errors per field with German messages', async () => {
    const res = await post(valid({ name: 'M', phone: 'abc', contactChannel: 'email', email: '', jobId: 'chefarzt' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ ok: false, code: 'VALIDATION_FAILED', message: expect.any(String) });
    expect(body.fieldErrors.name).toEqual(['Bitte gib deinen Namen an.']);
    expect(body.fieldErrors.phone).toEqual(['Bitte gib eine gültige Telefonnummer an.']);
    expect(body.fieldErrors.jobId).toEqual(['Diese Angabe ist ungültig.']);
    expect(dispatchApplicationEmails).not.toHaveBeenCalled();
  });

  it('requires an email when the preferred channel is email', async () => {
    const body = await (await post(valid({ contactChannel: 'email', email: '' }))).json();
    expect(body.fieldErrors).toEqual({ email: ['Bitte gib deine E-Mail-Adresse an.'] });
  });

  it('reports nested errors with dotted paths', async () => {
    const body = await (await post(valid({ attribution: { utmSource: 'x'.repeat(101) } }))).json();
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(Object.keys(body.fieldErrors)).toEqual(['attribution.utmSource']);
  });

  it('rejects foreign origins with CSRF_FAILED', async () => {
    const res = await post(valid(), { origin: 'https://evil.example' });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ ok: false, code: 'CSRF_FAILED' });
    expect(dispatchApplicationEmails).not.toHaveBeenCalled();
  });

  it('rejects wrong content types, oversized bodies and invalid JSON', async () => {
    const wrongType = await post(valid(), { 'content-type': 'text/plain' });
    expect(wrongType.status).toBe(415);
    expect(await wrongType.json()).toMatchObject({ code: 'UNSUPPORTED_MEDIA_TYPE' });
    const tooLarge = await post(valid({ name: 'x'.repeat(70 * 1024) }));
    expect(tooLarge.status).toBe(413);
    expect(await tooLarge.json()).toMatchObject({ code: 'PAYLOAD_TOO_LARGE' });
    const invalid = await post('{nope');
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toMatchObject({ code: 'INVALID_JSON' });
    expect(dispatchApplicationEmails).not.toHaveBeenCalled();
  });

  it('limits to 5 applications per 10 minutes per IP with Retry-After', async () => {
    const headers = { 'x-real-ip': '203.0.113.99' };
    for (let i = 0; i < 5; i++) expect((await post(valid(), headers)).status).toBe(200);
    const blocked = await post(valid(), headers);
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    const body = await blocked.json();
    expect(body).toMatchObject({ ok: false, code: 'RATE_LIMITED' });
    expect(body.retryAfterSec).toBeGreaterThan(0);
    expect(dispatchApplicationEmails).toHaveBeenCalledTimes(5);
  });

  it('answers 503 when sending email is not configured', async () => {
    dispatchApplicationEmails.mockResolvedValue({
      success: false,
      simulated: false,
      teamNotification: { success: false, error: 'not_configured' },
      userConfirmation: { success: false, error: 'not_configured' },
    });
    const res = await post(valid());
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, code: 'SERVICE_UNAVAILABLE' });
  });

  it('answers 500 when the mail provider fails', async () => {
    dispatchApplicationEmails.mockResolvedValue({
      success: false,
      simulated: false,
      teamNotification: { success: false, error: 'send_failed' },
      userConfirmation: { success: false, error: 'no_recipient' },
    });
    const res = await post(valid());
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ ok: false, code: 'INTERNAL' });
  });

  it('answers 503 instead of a fake success when production secrets are missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('IP_HASH_SALT', '');
    const res = await post(valid());
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, code: 'SERVICE_UNAVAILABLE' });
    expect(dispatchApplicationEmails).not.toHaveBeenCalled();
  });

  it('answers 503 before sending when only the token secret is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('IP_HASH_SALT', 's'.repeat(40));
    vi.stubEnv('APPLICATION_TOKEN_SECRET', '');
    const res = await post(valid());
    expect(res.status).toBe(503);
    expect(dispatchApplicationEmails).not.toHaveBeenCalled();
  });

  it('answers 500 on unexpected errors and logs no personal data', async () => {
    dispatchApplicationEmails.mockRejectedValue(new TypeError('boom for max@example.org'));
    const res = await post(valid({ email: 'max@example.org' }));
    expect(res.status).toBe(500);
    const logged = [console.error, console.info, console.warn]
      .flatMap((spy) => (spy as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat())
      .join('\n');
    expect(logged).not.toContain('max@example.org');
    expect(logged).not.toContain('Max Muster');
    expect(logged).not.toContain('0151');
  });
});
