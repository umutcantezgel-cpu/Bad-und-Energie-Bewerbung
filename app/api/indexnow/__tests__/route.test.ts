import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as indexnow from '@/app/api/indexnow/route';

const TOKEN = 'b'.repeat(64);
const KEY = '298d966b7e4f4a43981cb8e30da6b5b5';
const fetchMock = vi.fn();

function post(init: { token?: string; authorization?: string; body?: string } = {}) {
  const headers = new Headers({ 'content-type': 'application/json' });
  const authorization = init.authorization ?? (init.token ? `Bearer ${init.token}` : undefined);
  if (authorization) headers.set('authorization', authorization);
  return indexnow.POST(
    new Request('https://karriere.bad-energie.de/api/indexnow', { method: 'POST', headers, body: init.body })
  );
}

beforeEach(() => {
  vi.stubEnv('INDEXNOW_SUBMIT_TOKEN', TOKEN);
  vi.stubEnv('INDEXNOW_KEY', KEY);
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response(null, { status: 202 }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('/api/indexnow', () => {
  it('no longer exposes a GET submit endpoint', () => {
    expect('GET' in indexnow).toBe(false);
  });

  it('is disabled when no submit token is configured', async () => {
    vi.stubEnv('INDEXNOW_SUBMIT_TOKEN', undefined);
    const res = await post({ token: TOKEN });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'disabled' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('is disabled without INDEXNOW_KEY (no hardcoded fallback)', async () => {
    vi.stubEnv('INDEXNOW_KEY', undefined);
    const res = await post({ token: TOKEN });
    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats a placeholder token as unset', async () => {
    vi.stubEnv('INDEXNOW_SUBMIT_TOKEN', 'your_indexnow_submit_token_value_here');
    const res = await post({ token: 'your_indexnow_submit_token_value_here' });
    expect(res.status).toBe(503);
  });

  it.each([
    ['missing header', {}],
    ['wrong token', { token: 'c'.repeat(64) }],
    ['token prefix', { token: TOKEN.slice(0, 10) }],
    ['wrong scheme', { authorization: `Basic ${TOKEN}` }],
  ])('rejects %s with 401', async (_label, init) => {
    const res = await post(init);
    expect(res.status).toBe(401);
    expect(res.headers.get('www-authenticate')).toBe('Bearer');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits all portal URLs for an authorized empty body', async () => {
    const res = await post({ token: TOKEN });
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.key).toBe(KEY);
    expect(body.keyLocation).toBe(`https://karriere.bad-energie.de/${KEY}.txt`);
    expect(body.urlList.length).toBeGreaterThan(0);
    for (const url of body.urlList) expect(new URL(url).host).toBe(body.host);
  });

  it('submits the given URLs', async () => {
    const url = 'https://karriere.bad-energie.de/bewerbung';
    const res = await post({ token: TOKEN, body: JSON.stringify({ urls: [url] }) });
    expect(res.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).urlList).toEqual([url]);
  });

  it('rejects invalid bodies and foreign hosts', async () => {
    expect((await post({ token: TOKEN, body: '{' })).status).toBe(400);
    expect((await post({ token: TOKEN, body: JSON.stringify({ urls: ['nope'] }) })).status).toBe(400);
    const foreign = await post({ token: TOKEN, body: JSON.stringify({ urls: ['https://example.org/'] }) });
    expect(foreign.status).toBe(400);
    expect(await foreign.json()).toEqual({ error: 'foreign_host' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports upstream failures as 502', async () => {
    fetchMock.mockResolvedValue(new Response('bad key', { status: 403 }));
    const res = await post({ token: TOKEN });
    expect(res.status).toBe(502);
  });
});
