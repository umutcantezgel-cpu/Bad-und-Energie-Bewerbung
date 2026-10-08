import type { Attribution } from '@/lib/applications/schema';
import { ATTRIBUTION_LIMITS, sanitizeHost, sanitizePath, sanitizeToken } from './sanitize';

/**
 * Liest die Attribution aus der Einstiegs-URL und dem Referrer (rein, ohne Browser-APIs).
 * Gespeichert wird nur, was für die Kanal-Zuordnung nötig ist: utm_*, ref, der Host des
 * Referrers (nie die volle URL) und der Pfad der Einstiegsseite ohne Query.
 */

export interface CaptureInput {
  /** Volle URL der Einstiegsseite, z. B. `window.location.href`. */
  url: string;
  /** `document.referrer`; leer bei Direktaufruf. */
  referrer?: string | null;
}

const PARAMS = [
  ['utm_source', 'utmSource'],
  ['utm_medium', 'utmMedium'],
  ['utm_campaign', 'utmCampaign'],
  ['utm_content', 'utmContent'],
  ['utm_term', 'utmTerm'],
  ['ref', 'ref'],
] as const satisfies ReadonlyArray<readonly [string, keyof Attribution]>;

function parseUrl(value: string | null | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

/** Hosting-Domains, unter denen fremde Seiten nebeneinander liegen: dort zählt nur der exakte Host. */
const SHARED_HOSTING_SUFFIXES = ['vercel.app', 'netlify.app', 'github.io', 'pages.dev'];

/** Registrierbare Domain, vereinfacht als die letzten zwei Labels (reicht für .de/.com). */
function siteOf(host: string): string | null {
  const labels = host.split('.');
  if (labels.length < 2) return null;
  const site = labels.slice(-2).join('.');
  return SHARED_HOSTING_SUFFIXES.includes(site) ? null : site;
}

/**
 * Referrer derselben Website (Seitenwechsel, Reload, z. B. von bad-energie.de auf
 * karriere.bad-energie.de) zählen nicht als Quelle.
 */
function isSameSite(referrerHost: string, pageHost: string): boolean {
  const strip = (host: string) => host.toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
  const referrer = strip(referrerHost);
  const page = strip(pageHost);
  if (referrer === page) return true;
  const site = siteOf(page);
  return site !== null && (referrer === site || referrer.endsWith(`.${site}`));
}

export function attributionFromUrl({ url, referrer }: CaptureInput): Attribution {
  const page = parseUrl(url);
  if (!page) return {};

  const result: Attribution = {};
  for (const [param, key] of PARAMS) {
    const value = sanitizeToken(page.searchParams.get(param), ATTRIBUTION_LIMITS[key]);
    if (value) result[key] = value;
  }

  const referrerUrl = parseUrl(referrer);
  if (referrerUrl && !isSameSite(referrerUrl.hostname, page.hostname)) {
    const host = sanitizeHost(referrerUrl.hostname);
    if (host) result.referrerHost = host;
  }

  const landingPath = sanitizePath(page.pathname);
  if (landingPath) result.landingPath = landingPath;

  return result;
}
