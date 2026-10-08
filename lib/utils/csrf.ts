// CSRF-Schutz für zustandsändernde Route-Handler. Liest nur Request-Header und die Umgebung
// (lib/env.ts), bleibt also ohne next/headers und lässt sich direkt testen.
import { DEFAULT_APP_URL, getAppUrl } from '@/lib/env';

const PRODUCTION_ORIGIN = new URL(DEFAULT_APP_URL).origin;
const LOCAL_DEV_ORIGIN = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d{1,5})?$/;

export interface CSRFOptions {
  /** Zusätzliche erlaubte Origins (z. B. `https://example.org`), werden normalisiert. */
  allowedOrigins?: string[];
}

function toOrigin(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function vercelOrigin(host: string | undefined): string | null {
  const raw = host?.trim();
  if (!raw) return null;
  return toOrigin(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
}

/** Erlaubte Origins: APP_URL, die Produktions-Domain und die Vercel-Deployment-/Branch-URL. */
export function getCSRFAllowedOrigins(extra: string[] = []): string[] {
  const origins = [
    toOrigin(getAppUrl()),
    PRODUCTION_ORIGIN,
    vercelOrigin(process.env.VERCEL_URL),
    vercelOrigin(process.env.VERCEL_BRANCH_URL),
    ...extra.map(toOrigin),
  ];
  return [...new Set(origins.filter((origin): origin is string => origin !== null))];
}

/**
 * true, wenn der Request von der eigenen Seite stammt: `Sec-Fetch-Site: same-origin` oder eine
 * Origin (ersatzweise der Referer) aus der Allowlist. Außerhalb von Production zusätzlich
 * http://localhost:* und http://127.0.0.1:*. Fehlen Origin und Referer, ist das Ergebnis false.
 */
export function validateCSRF(request: Request, opts: CSRFOptions = {}): boolean {
  const { headers } = request;
  if (headers.get('sec-fetch-site') === 'same-origin') return true;

  // Eine vorhandene Origin (auch "null") hat Vorrang; der Referer zählt nur, wenn sie fehlt.
  const origin = toOrigin(headers.get('origin') ?? headers.get('referer'));
  if (!origin) return false;

  if (getCSRFAllowedOrigins(opts.allowedOrigins).includes(origin)) return true;
  return process.env.NODE_ENV !== 'production' && LOCAL_DEV_ORIGIN.test(origin);
}
