import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const dispatchApplicationEmails = vi.hoisted(() => vi.fn());
const dispatchApplicationFollowUpEmail = vi.hoisted(() => vi.fn());
vi.mock('@/lib/email', () => ({ dispatchApplicationEmails, dispatchApplicationFollowUpEmail }));

const { POST } = await import('@/app/api/bewerbung/ergaenzung/route');
const { createFollowUpToken } = await import('@/lib/applications/token');
const { createReference } = await import('@/lib/applications/reference');

const DAY = 24 * 60 * 60 * 1000;
let ipCounter = 0;

function post(body: unknown, headers: Record<string, string> = {}) {
  ipCounter += 1;
  return POST(
    new Request('https://karriere.bad-energie.de/api/bewerbung/ergaenzung', {
      method: 'POST',
      headers: {
        origin: 'https://karriere.bad-energie.de',
        'content-type': 'application/json',
        'x-real-ip': `192.0.2.${ipCounter % 250}`,
        ...headers,
      },
      body: JSON.stringify(body),
    }),
  );
}

function payload(overrides: Record<string, unknown> = {}) {
  const reference = createReference();
  return {
    reference,
    token: createFollowUpToken(reference),
    startDate: '01.12.2026',
    postalCode: '35578',
    message: 'Ich kann auch samstags.',
    ...overrides,
  };
}

beforeEach(() => {
  dispatchApplicationFollowUpEmail.mockReset();
  dispatchApplicationFollowUpEmail.mockResolvedValue({ success: true, simulated: true });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('POST /api/bewerbung/ergaenzung', () => {
  it('sends a follow-up for a valid token', async () => {
    const body = payload({
      mappe: { coverLetter: 'Hallo', skills: ['Löten'], careerStations: [], educationStations: [] },
    });
    const res = await post(body);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ ok: true });

    expect(dispatchApplicationFollowUpEmail).toHaveBeenCalledTimes(1);
    const [followUp, options] = dispatchApplicationFollowUpEmail.mock.calls[0];
    expect(followUp).toMatchObject({
      reference: body.reference,
      startDate: '01.12.2026',
      postalCode: '35578',
      message: 'Ich kann auch samstags.',
      mappe: { coverLetter: 'Hallo', skills: ['Löten'] },
    });
    expect(options.idempotencyKey).toBe(`ergaenzung:${followUp.idempotencyKey}`);
  });

  it('accepts a lower-case reference', async () => {
    const body = payload();
    const res = await post({ ...body, reference: body.reference.toLowerCase() });
    expect(res.status).toBe(200);
  });

  it('sends an identical follow-up only once', async () => {
    const body = payload();
    expect((await post(body)).status).toBe(200);
    expect((await post(body)).status).toBe(200);
    expect(dispatchApplicationFollowUpEmail).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid token with INVALID_TOKEN', async () => {
    const res = await post(payload({ token: createFollowUpToken('BE-26-AAAAAA') }));
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ ok: false, code: 'INVALID_TOKEN' });
    expect(dispatchApplicationFollowUpEmail).not.toHaveBeenCalled();
  });

  it('rejects a malformed reference with INVALID_TOKEN', async () => {
    const res = await post(payload({ reference: 'BE-26-0OIL' }));
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: 'INVALID_TOKEN' });
  });

  it('rejects an expired token with a clear message', async () => {
    const reference = createReference();
    const token = createFollowUpToken(reference, new Date(Date.now() - 15 * DAY));
    const res = await post(payload({ reference, token }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toMatchObject({ ok: false, code: 'INVALID_TOKEN' });
    expect(body.message).toContain('abgelaufen');
    expect(dispatchApplicationFollowUpEmail).not.toHaveBeenCalled();
  });

  it('rejects an empty follow-up', async () => {
    const res = await post(payload({ startDate: '', postalCode: ' ', message: undefined }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ ok: false, code: 'VALIDATION_FAILED' });
  });

  it('rejects unknown fields (strict schema)', async () => {
    const res = await post(payload({ name: 'Max' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: 'VALIDATION_FAILED' });
  });

  it('answers 503 when email is not configured', async () => {
    dispatchApplicationFollowUpEmail.mockResolvedValue({ success: false, error: 'not_configured' });
    const res = await post(payload());
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
  });

  it('rejects foreign origins', async () => {
    const res = await post(payload(), { origin: 'https://evil.example' });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: 'CSRF_FAILED' });
  });

  it('limits follow-ups per IP', async () => {
    const headers = { 'x-real-ip': '203.0.113.77' };
    for (let i = 0; i < 10; i++) expect((await post(payload(), headers)).status).toBe(200);
    const blocked = await post(payload(), headers);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBeTruthy();
  });
});
