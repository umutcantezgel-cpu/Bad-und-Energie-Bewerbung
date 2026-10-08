import { NextResponse } from 'next/server';

export const DEFAULT_MAX_BODY_BYTES = 64 * 1024;

export type ReadJsonFailure =
  | { ok: false; status: 413; code: 'PAYLOAD_TOO_LARGE' }
  | { ok: false; status: 415; code: 'UNSUPPORTED_MEDIA_TYPE' }
  | { ok: false; status: 400; code: 'INVALID_JSON' };

export type ReadJsonResult = { ok: true; data: unknown } | ReadJsonFailure;

const TOO_LARGE: ReadJsonFailure = { ok: false, status: 413, code: 'PAYLOAD_TOO_LARGE' };
const UNSUPPORTED: ReadJsonFailure = { ok: false, status: 415, code: 'UNSUPPORTED_MEDIA_TYPE' };
const INVALID: ReadJsonFailure = { ok: false, status: 400, code: 'INVALID_JSON' };

const JSON_CONTENT_TYPES: readonly string[] = ['application/json'];

function mediaType(value: string | null): string | undefined {
  return value?.split(';')[0].trim().toLowerCase();
}

export interface ReadJsonOptions {
  maxBytes?: number;
  /** Erlaubte Medientypen (ohne Parameter), Standard nur `application/json`. */
  contentTypes?: readonly string[];
}

/**
 * Liest einen JSON-Body mit Größenlimit: prüft Content-Type, Content-Length und zählt zusätzlich
 * die tatsächlich gestreamten Bytes (Content-Length kann fehlen oder falsch sein).
 */
export async function readJsonBody(
  request: Request,
  { maxBytes = DEFAULT_MAX_BODY_BYTES, contentTypes = JSON_CONTENT_TYPES }: ReadJsonOptions = {}
): Promise<ReadJsonResult> {
  const type = mediaType(request.headers.get('content-type'));
  if (!type || !contentTypes.includes(type)) return UNSUPPORTED;

  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return TOO_LARGE;

  if (!request.body || request.bodyUsed) return INVALID;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return TOO_LARGE;
      }
      chunks.push(value);
    }
  } catch {
    return INVALID;
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, data: JSON.parse(text) as unknown };
  } catch {
    return INVALID;
  }
}

/** JSON-Fehlerantwort `{ ok: false, error: code, ...extra }`, nie gecacht. */
export function jsonError(
  status: number,
  code: string,
  extra?: Record<string, unknown>,
  init?: { headers?: HeadersInit }
): NextResponse {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', 'no-store');
  return NextResponse.json({ ...extra, ok: false, error: code }, { status, headers });
}
