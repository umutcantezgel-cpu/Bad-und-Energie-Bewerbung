import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getIndexNowKey, getIndexNowSubmitToken } from '@/lib/env';
import { getIndexNowPayload, submitToIndexNow } from '@/lib/seo/indexnow';

export const dynamic = 'force-dynamic';

const MAX_BODY_CHARS = 128 * 1024;

const bodySchema = z.object({
  urls: z.array(z.url({ protocol: /^https?$/ })).min(1).max(1000).optional(),
});

function sha256(value: string) {
  return createHash('sha256').update(value).digest();
}

// Gleich lange Digests machen den Vergleich unabhängig von der Token-Länge konstant.
function isAuthorized(header: string | null, expected: string): boolean {
  const token = header?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return false;
  return timingSafeEqual(sha256(token), sha256(expected));
}

/**
 * Reicht URLs bei IndexNow ein. Erfordert `Authorization: Bearer <INDEXNOW_SUBMIT_TOKEN>`.
 * Body optional: `{ "urls": [...] }`, ohne Body werden alle Portal-URLs eingereicht.
 * Ohne Token oder INDEXNOW_KEY ist der Endpunkt deaktiviert (503).
 */
export async function POST(request: Request) {
  const expected = getIndexNowSubmitToken();
  const key = getIndexNowKey();
  if (!expected || !key) {
    return NextResponse.json({ error: 'disabled' }, { status: 503 });
  }

  if (!isAuthorized(request.headers.get('authorization'), expected)) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
  }

  let urls: string[] | undefined;
  if (raw.trim()) {
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }
    urls = parsed.data.urls;
  }

  if (urls) {
    const { host } = getIndexNowPayload(key, urls);
    if (urls.some((url) => new URL(url).host !== host)) {
      return NextResponse.json({ error: 'foreign_host' }, { status: 400 });
    }
  }

  const result = await submitToIndexNow(key, urls);
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
