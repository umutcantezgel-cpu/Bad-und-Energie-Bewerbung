import { describe, expect, it } from 'vitest';
import { jsonError, readJsonBody } from '@/lib/security/request';

const URL = 'https://karriere.bad-energie.de/api/bewerbung';

function jsonRequest(body: BodyInit, headers: Record<string, string> = {}): Request {
  return new Request(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });
}

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

function streamedRequest(chunks: string[]): Request {
  return new Request(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: streamOf(chunks),
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });
}

describe('readJsonBody', () => {
  it('liest gültiges JSON (auch mit charset)', async () => {
    const result = await readJsonBody(
      jsonRequest('{"name":"Müller","n":1}', { 'content-type': 'application/json; charset=utf-8' })
    );
    expect(result).toEqual({ ok: true, data: { name: 'Müller', n: 1 } });
  });

  it.each([undefined, 'text/plain', 'application/x-www-form-urlencoded', 'application/jsonp'])(
    'lehnt Content-Type %s mit 415 ab',
    async (contentType) => {
      const headers = new Headers();
      if (contentType) headers.set('content-type', contentType);
      const request = new Request(URL, { method: 'POST', headers, body: '{}' });
      if (!contentType) request.headers.delete('content-type');
      expect(await readJsonBody(request)).toEqual({ ok: false, status: 415, code: 'UNSUPPORTED_MEDIA_TYPE' });
    }
  );

  it('lehnt zu große Content-Length mit 413 ab, ohne den Body zu lesen', async () => {
    const request = jsonRequest('{}', { 'content-length': String(64 * 1024 + 1) });
    expect(await readJsonBody(request)).toEqual({ ok: false, status: 413, code: 'PAYLOAD_TOO_LARGE' });
  });

  it('zählt gestreamte Bytes, wenn keine Content-Length vorliegt', async () => {
    const chunks = ['{"a":"', 'x'.repeat(40), '"}'];
    expect(await readJsonBody(streamedRequest(chunks), { maxBytes: 32 })).toEqual({
      ok: false,
      status: 413,
      code: 'PAYLOAD_TOO_LARGE',
    });
    expect(await readJsonBody(streamedRequest(chunks), { maxBytes: 64 })).toEqual({
      ok: true,
      data: { a: 'x'.repeat(40) },
    });
  });

  it('wendet das Standardlimit von 64 KB an', async () => {
    const big = JSON.stringify({ a: 'x'.repeat(64 * 1024) });
    expect(await readJsonBody(jsonRequest(big))).toMatchObject({ ok: false, status: 413 });
  });

  it.each(['', '{"a":', 'undefined', "{'a':1}"])('lehnt ungültiges JSON %j mit 400 ab', async (body) => {
    expect(await readJsonBody(jsonRequest(body))).toEqual({ ok: false, status: 400, code: 'INVALID_JSON' });
  });

  it('lehnt ungültiges UTF-8 mit 400 ab', async () => {
    const bytes = new Uint8Array([0x22, 0xff, 0xfe, 0x22]);
    expect(await readJsonBody(jsonRequest(bytes))).toEqual({ ok: false, status: 400, code: 'INVALID_JSON' });
  });
});

describe('jsonError', () => {
  it('liefert JSON mit Status, Code, Extras und Cache-Control: no-store', async () => {
    const response = jsonError(429, 'RATE_LIMITED', { retryAfterSec: 60 }, { headers: { 'Retry-After': '60' } });
    expect(response.status).toBe(429);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('retry-after')).toBe('60');
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({ ok: false, error: 'RATE_LIMITED', retryAfterSec: 60 });
  });

  it('lässt sich nicht über extra überschreiben', async () => {
    const response = jsonError(400, 'INVALID_JSON', { ok: true, error: 'x' });
    expect(await response.json()).toEqual({ ok: false, error: 'INVALID_JSON' });
  });
});
