import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { classifyRpcError, createIntakeRpc } from '@/lib/supabase/rpc';
import { createServiceClient } from '@/lib/supabase/service';
import type { SubmitApplicationPayload } from '@/lib/supabase/payload';

const fetchMock = vi.fn();
const URL_BASE = 'https://ymynacgwkqycjcervixg.supabase.co';
const KEY = 'sb_secret_' + 'Q'.repeat(32);

const payload = { reference: 'BE-26-K7M4QX' } as SubmitApplicationPayload;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function rpc(timeoutMs?: number) {
  return createIntakeRpc(createServiceClient({ url: URL_BASE, secretKey: KEY, keyKind: 'secret' }), timeoutMs);
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('classifyRpcError', () => {
  it.each([
    [{ code: 'P0001', message: 'reference_conflict' }, 400, 'reference_conflict'],
    [{ code: 'P0001', message: 'validation_failed' }, 400, 'validation_failed'],
    [{ code: 'P0001', message: 'not_found' }, 400, 'not_found'],
    [{ code: 'P0001', message: 'follow_up_limit' }, 400, 'follow_up_limit'],
    [{ code: 'P0001', message: 'something_else' }, 400, 'unexpected'],
    [{ code: '', message: 'TypeError: fetch failed' }, 0, 'unavailable'],
    [{ code: 'PGRST003' }, 504, 'unavailable'],
    [{ code: 'PGRST202' }, 404, 'misconfigured'],
    [{ code: '42501' }, 401, 'misconfigured'],
    [{ message: 'Invalid API key' }, 401, 'misconfigured'],
    [{ code: '22P02' }, 400, 'unexpected'],
  ] as const)('%j (HTTP %i) → %s', (error, status, kind) => {
    expect(classifyRpcError(error, status)).toBe(kind);
  });
});

describe('createIntakeRpc', () => {
  it('posts the payload to /rest/v1/rpc/rpc_submit_application with the secret key', async () => {
    fetchMock.mockResolvedValue(
      json(200, { application_id: '00000000-0000-4000-8000-000000000001', reference: 'BE-26-K7M4QX', duplicate: false, resubmitted: false }),
    );
    const result = await rpc().submitApplication(payload);

    expect(result).toEqual({
      ok: true,
      data: { application_id: '00000000-0000-4000-8000-000000000001', reference: 'BE-26-K7M4QX', duplicate: false, resubmitted: false },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${URL_BASE}/rest/v1/rpc/rpc_submit_application`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ payload });
    expect(new Headers(init.headers).get('apikey')).toBe(KEY);
    expect(init.cache).toBe('no-store');
  });

  it('maps a domain error from the function (P0001) to its kind', async () => {
    fetchMock.mockResolvedValue(json(400, { code: 'P0001', message: 'reference_conflict', details: null, hint: null }));
    expect(await rpc().submitApplication(payload)).toEqual({ ok: false, kind: 'reference_conflict', status: 400, code: 'P0001' });
  });

  it('does not retry a POST on 503 (no double counting) and reports unavailable', async () => {
    fetchMock.mockResolvedValue(json(503, { code: 'PGRST001', message: 'Could not connect' }));
    expect(await rpc().submitApplication(payload)).toMatchObject({ ok: false, kind: 'unavailable', status: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports a missing function as misconfigured', async () => {
    fetchMock.mockResolvedValue(json(404, { code: 'PGRST202', message: 'Could not find the function' }));
    expect(await rpc().submitApplication(payload)).toMatchObject({ ok: false, kind: 'misconfigured', code: 'PGRST202' });
  });

  it('reports network errors and timeouts as unavailable', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    expect(await rpc().submitApplication(payload)).toMatchObject({ ok: false, kind: 'unavailable', status: 0 });

    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => init.signal?.addEventListener('abort', () => reject(init.signal?.reason))),
    );
    expect(await rpc(20).submitApplication(payload)).toMatchObject({ ok: false, kind: 'unavailable', status: 0 });
  });

  it('treats an unexpected response body as unexpected', async () => {
    fetchMock.mockResolvedValue(json(200, { reference: 'kaputt' }));
    expect(await rpc().submitApplication(payload)).toMatchObject({ ok: false, kind: 'unexpected', status: 200 });
  });

  it('probes without writing: an empty follow-up payload must be rejected with validation_failed', async () => {
    fetchMock.mockResolvedValue(json(400, { code: 'P0001', message: 'validation_failed' }));
    expect(await rpc().probe()).toEqual({ ok: true, data: 'ok' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${URL_BASE}/rest/v1/rpc/rpc_submit_follow_up`);
    expect(JSON.parse(init.body)).toEqual({ payload: {} });

    fetchMock.mockResolvedValue(json(401, { message: 'Invalid API key' }));
    expect(await rpc().probe()).toMatchObject({ ok: false, kind: 'misconfigured' });
  });
});
