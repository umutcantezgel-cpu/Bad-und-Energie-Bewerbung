import { describe, expect, it, vi } from 'vitest';
import { applicationInputSchema, PRIVACY_NOTICE_VERSION } from '@/lib/applications/schema';
import { describeFailure } from '../failure';
import {
  buildApplicationPayload,
  createIdempotencyKey,
  fillDurationOf,
  firstNameOf,
  formatRetryAfter,
  interpretApplicationResponse,
  mapFieldErrors,
  mergeAttribution,
  submitApplication,
  submitFollowUp,
} from '../submit';

const KEY = '3b241101-e2bb-4255-8caf-4136c566a962';

const payload = buildApplicationPayload({
  jobId: 'anlagenmechaniker-shk',
  answers: { qualification: 'geselle-2-5', start: 'sofort' },
  name: ' Max Muster ',
  phone: '0151 2345678',
  email: '',
  contactChannel: 'whatsapp',
  attribution: { utmSource: 'indeed', funnel: 'bewerbung' },
  idempotencyKey: KEY,
  firstInteractionAt: 1_759_910_400_000,
  now: 1_759_910_442_500,
});

function baseInput() {
  return {
    jobId: 'initiativ' as const,
    answers: {},
    name: 'Max Muster',
    phone: '0151 2345678',
    contactChannel: 'whatsapp' as const,
    idempotencyKey: KEY,
  };
}

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

describe('payload', () => {
  it('matches the shared contract', () => {
    expect(applicationInputSchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({ name: 'Max Muster', privacyNoticeVersion: PRIVACY_NOTICE_VERSION, idempotencyKey: KEY });
    expect(payload).not.toHaveProperty('email');
    expect(payload).not.toHaveProperty('contactTimeHint');
    expect(payload).not.toHaveProperty('startedAt');
    expect(payload).not.toHaveProperty('mappe');
  });

  it('sends the fill duration measured on the client instead of a timestamp', () => {
    expect(payload.fillDurationMs).toBe(42_500);
    expect(fillDurationOf(1000, 400)).toBe(0); // Uhr zurückgestellt: nie negativ
    expect(fillDurationOf(null, 5000)).toBeUndefined();
    expect(fillDurationOf(0, 5000)).toBeUndefined();
    const withoutStart = buildApplicationPayload({ ...baseInput(), firstInteractionAt: null });
    expect(withoutStart).not.toHaveProperty('fillDurationMs');
  });

  it('passes a filled honeypot on under its own field name', () => {
    const hit = buildApplicationPayload({ ...baseInput(), honeypot: 'bot' });
    expect(hit.contactTimeHint).toBe('bot');
    expect(applicationInputSchema.parse(hit).contactTimeHint).toBe('bot');
  });

  it('merges the funnel into the attribution and drops empty values', () => {
    expect(mergeAttribution({ utmSource: 'meta', funnel: 'alt', ref: '' }, 'stellenseite')).toEqual({
      utmSource: 'meta',
      funnel: 'stellenseite',
    });
    expect(mergeAttribution({ funnel: 'lp' }, undefined)).toEqual({ funnel: 'lp' });
    expect(mergeAttribution(undefined, '  ')).toEqual({});
    // The schema is strict: unknown or invalid fields must not sink the whole application.
    expect(mergeAttribution({ utmSource: 'x', channel: 'indeed', ref: 'a'.repeat(40), utmTerm: 3 })).toEqual({ utmSource: 'x' });
  });

  it('creates RFC 4122 v4 keys, also without randomUUID', () => {
    const v4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(createIdempotencyKey()).toMatch(v4);
    const fallback = createIdempotencyKey({ getRandomValues: <T extends ArrayBufferView | null>(array: T) => array });
    expect(fallback).toMatch(v4);
  });

  it('derives a first name', () => {
    expect(firstNameOf('  Max  Muster ')).toBe('Max');
    expect(firstNameOf('')).toBe('');
  });
});

describe('response interpretation', () => {
  it('accepts only 200 with ok:true, reference and token', () => {
    const ok = { ok: true, reference: 'BE-26-0042', followUpToken: 'tok', firstName: 'Max' };
    expect(interpretApplicationResponse(200, ok)).toEqual(ok);
    expect(interpretApplicationResponse(201, ok).ok).toBe(false);
    expect(interpretApplicationResponse(200, { ok: true }).ok).toBe(false);
    expect(interpretApplicationResponse(200, { success: true }).ok).toBe(false);
    expect(interpretApplicationResponse(200, null).ok).toBe(false);
  });

  it('maps VALIDATION_FAILED field errors onto the contact fields', () => {
    const result = interpretApplicationResponse(400, {
      ok: false,
      code: 'VALIDATION_FAILED',
      message: 'Bitte prüf deine Angaben.',
      fieldErrors: { phone: ['Bitte gib eine gültige Telefonnummer an.'], jobId: ['Ungültig'], 'answers.start': ['x'] },
    });
    expect(result).toMatchObject({
      ok: false,
      kind: 'validation',
      fieldErrors: { phone: 'Bitte gib eine gültige Telefonnummer an.' },
      otherErrors: { jobId: 'Ungültig', answers: 'x' },
    });
  });

  it('reads retryAfter from the body or the Retry-After header', () => {
    expect(interpretApplicationResponse(429, { ok: false, code: 'RATE_LIMITED', message: 'x', retryAfterSec: 90 })).toMatchObject({
      kind: 'rate_limited',
      retryAfterSec: 90,
    });
    const headers = new Headers({ 'Retry-After': '120' });
    expect(interpretApplicationResponse(429, { success: false, code: 'RATE_LIMITED' }, headers)).toMatchObject({
      kind: 'rate_limited',
      retryAfterSec: 120,
    });
  });

  it('treats 503 and unknown shapes as server errors', () => {
    expect(interpretApplicationResponse(503, { ok: false, code: 'SERVICE_UNAVAILABLE', message: 'x' })).toMatchObject({
      kind: 'server',
      code: 'SERVICE_UNAVAILABLE',
      status: 503,
    });
    expect(interpretApplicationResponse(500, 'oops')).toMatchObject({ kind: 'server', fieldErrors: {}, otherErrors: {} });
  });

  it('splits field errors defensively', () => {
    expect(mapFieldErrors({ email: [], name: 'Zu kurz', website: ['x'] })).toEqual({
      fieldErrors: { name: 'Zu kurz' },
      otherErrors: { website: 'x' },
    });
    expect(mapFieldErrors(undefined)).toEqual({ fieldErrors: {}, otherErrors: {} });
  });

  it('formats the waiting time', () => {
    expect(formatRetryAfter(1)).toBe('1 Sekunde');
    expect(formatRetryAfter(45)).toBe('45 Sekunden');
    expect(formatRetryAfter(61)).toBe('2 Minuten');
    expect(formatRetryAfter(60)).toBe('1 Minute');
    expect(formatRetryAfter(7200)).toBe('2 Stunden');
    expect(formatRetryAfter(undefined)).toBeNull();
  });
});

describe('submitApplication (mocked fetch)', () => {
  it('posts same-origin JSON and returns the success', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(200, { ok: true, reference: 'BE-26-0042', followUpToken: 'tok', firstName: 'Max' }),
    );
    const result = await submitApplication(payload, { fetch: fetchMock as unknown as typeof fetch, online: true });
    expect(result).toEqual({ ok: true, reference: 'BE-26-0042', followUpToken: 'tok', firstName: 'Max' });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/bewerbung');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(init.credentials).toBe('same-origin');
    expect(JSON.parse(init.body as string).idempotencyKey).toBe(KEY);
  });

  it('does not call fetch while offline', async () => {
    const fetchMock = vi.fn();
    const result = await submitApplication(payload, { fetch: fetchMock as unknown as typeof fetch, online: false });
    expect(result).toMatchObject({ ok: false, kind: 'offline' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports network errors and non-JSON responses as failures', async () => {
    const network = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await submitApplication(payload, { fetch: network as unknown as typeof fetch, online: true })).toMatchObject({
      ok: false,
      kind: 'network',
    });
    const html = vi.fn(async () => new Response('<html>Bad gateway</html>', { status: 502 }));
    expect(await submitApplication(payload, { fetch: html as unknown as typeof fetch, online: true })).toMatchObject({
      ok: false,
      kind: 'server',
      status: 502,
    });
  });

  it('times out instead of waiting forever', async () => {
    const hanging = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
    );
    const result = await submitApplication(payload, { fetch: hanging as unknown as typeof fetch, online: true, timeoutMs: 10 });
    expect(result).toMatchObject({ ok: false, kind: 'timeout' });
  });

  it('follow-up: ok only with 200 + ok:true', async () => {
    const ok = vi.fn(async () => jsonResponse(200, { ok: true }));
    const body = { reference: 'BE-26-0042', token: 'tok', postalCode: '35578' };
    expect(await submitFollowUp(body, { fetch: ok as unknown as typeof fetch, online: true })).toEqual({ ok: true });
    expect((ok.mock.calls[0] as unknown as [string])[0]).toBe('/api/bewerbung/ergaenzung');
    const denied = vi.fn(async () => jsonResponse(403, { ok: false, code: 'INVALID_TOKEN', message: 'x' }));
    expect(await submitFollowUp(body, { fetch: denied as unknown as typeof fetch, online: true })).toMatchObject({
      ok: false,
      kind: 'server',
      code: 'INVALID_TOKEN',
    });
  });
});

describe('describeFailure', () => {
  const failure = (status: number, body: unknown) => interpretApplicationResponse(status, body) as Exclude<
    ReturnType<typeof interpretApplicationResponse>,
    { ok: true }
  >;

  it('shows the German server message by code and offers retry only where it can help', () => {
    const expired = 'Der Link zum Ergänzen ist abgelaufen. Schick uns deine Angaben bitte per WhatsApp oder E-Mail und nenn deine Bewerbungsnummer.';
    expect(describeFailure(failure(403, { ok: false, code: 'INVALID_TOKEN', message: expired }))).toEqual({ detail: expired, action: 'none' });
    expect(describeFailure(failure(403, { ok: false, code: 'CSRF_FAILED', message: 'Bitte lade die Seite neu.' }))).toEqual({
      detail: 'Bitte lade die Seite neu.',
      action: 'reload',
    });
    expect(describeFailure(failure(413, { ok: false, code: 'PAYLOAD_TOO_LARGE', message: 'Zu lang.' }))).toEqual({ detail: 'Zu lang.', action: 'none' });
    expect(describeFailure(failure(415, { ok: false, code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Neu laden.' })).action).toBe('reload');
    expect(describeFailure(failure(400, { ok: false, code: 'INVALID_JSON', message: 'Neu laden.' })).action).toBe('reload');
    expect(describeFailure(failure(503, { ok: false, code: 'SERVICE_UNAVAILABLE', message: 'Ruf uns an.' }))).toEqual({
      detail: 'Ruf uns an.',
      action: 'retry',
    });
    expect(describeFailure(failure(500, { ok: false, code: 'INTERNAL', message: 'Noch einmal.' })).action).toBe('retry');
  });

  it('shows the follow-up limit as a final message without retry (429 is only the status code)', () => {
    const limit = 'Zu dieser Bewerbung sind schon viele Ergänzungen eingegangen. Schick weitere bitte per WhatsApp oder E-Mail und nenn deine Bewerbungsnummer.';
    const result = failure(429, { ok: false, code: 'FOLLOW_UP_LIMIT', message: limit });
    expect(result.kind).toBe('server');
    expect(describeFailure(result)).toEqual({ detail: limit, action: 'none' });
    expect(describeFailure(failure(429, { ok: false, code: 'FOLLOW_UP_LIMIT' })).detail).toMatch(/per WhatsApp oder E-Mail/);
    expect(failure(429, { ok: false, code: 'RATE_LIMITED', message: 'x' }).kind).toBe('rate_limited');
  });

  it('falls back to its own text when the server sends no message, and to the generic text without a code', () => {
    expect(describeFailure(failure(403, { ok: false, code: 'INVALID_TOKEN' })).detail).toMatch(/keiner Bewerbung zuordnen/);
    expect(describeFailure(failure(502, null))).toEqual({
      detail: 'Unser Server antwortet gerade nicht. Sende deine Angaben gleich noch einmal oder melde dich direkt bei uns.',
      action: 'retry',
    });
  });

  it('prefers context overrides (e.g. the Mappe) over the server text', () => {
    const tooLarge = failure(413, { ok: false, code: 'PAYLOAD_TOO_LARGE', message: 'Bitte kürze deine Nachricht.' });
    expect(describeFailure(tooLarge, { PAYLOAD_TOO_LARGE: 'Die Mappe ist zu groß.' }).detail).toBe('Die Mappe ist zu groß.');
  });

  it('keeps network, offline and rate-limit texts', () => {
    expect(describeFailure({ ok: false, kind: 'offline', fieldErrors: {}, otherErrors: {} })).toMatchObject({ action: 'retry' });
    expect(describeFailure({ ok: false, kind: 'timeout', fieldErrors: {}, otherErrors: {} }).detail).toMatch(/Verbindung ist abgebrochen/);
    expect(describeFailure(failure(429, { ok: false, code: 'RATE_LIMITED', message: 'x', retryAfterSec: 120 })).detail).toMatch(/in 2 Minuten/);
  });
});
