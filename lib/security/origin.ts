// Herkunftsprüfung per URL-Parsing (nie per includes()). Ohne Node- oder Server-Abhängigkeiten,
// damit proxy.ts und Route-Handler dieselbe Logik nutzen.

const SITE_DOMAIN = 'bad-energie.de';

/** Hostnamen der aktuellen Vercel-Deployment- und Branch-URL (ohne Protokoll in der Env). */
export function getVercelHostnames(): string[] {
  const hosts: string[] = [];
  for (const value of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
    const raw = value?.trim();
    if (!raw) continue;
    const hostname = parseHostname(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (hostname) hosts.push(hostname);
  }
  return hosts;
}

function parseHostname(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const { protocol, hostname } = new URL(value);
    if (protocol !== 'https:' && protocol !== 'http:') return null;
    return hostname.toLowerCase().replace(/\.$/, '');
  } catch {
    return null;
  }
}

/** bad-energie.de, jede Subdomain davon oder exakt der Vercel-Host dieses Deployments. */
export function isTrustedSiteHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (host === SITE_DOMAIN || host.endsWith(`.${SITE_DOMAIN}`)) return true;
  return getVercelHostnames().includes(host);
}

/**
 * Browser-Aufruf von der eigenen Seite: `Sec-Fetch-Site: same-origin` oder eine vertrauenswürdige
 * Origin (bei fehlender Origin der Referer). Schützt nur vor Einbindung durch fremde Seiten,
 * nicht vor Nicht-Browser-Clients, die Header frei setzen können.
 */
export function isTrustedSiteRequest(headers: Headers): boolean {
  if (headers.get('sec-fetch-site') === 'same-origin') return true;
  const source = headers.get('origin') ?? headers.get('referer');
  const hostname = parseHostname(source);
  return hostname !== null && isTrustedSiteHostname(hostname);
}
