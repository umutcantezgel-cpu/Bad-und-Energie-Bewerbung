import { unstable_getResponseFromNextConfig } from 'next/experimental/testing/server';
import { describe, expect, it } from 'vitest';
import nextConfig from '@/next.config';

async function headersFor(path: string): Promise<Headers> {
  const response = await unstable_getResponseFromNextConfig({
    url: `https://karriere.bad-energie.de${path}`,
    nextConfig,
  });
  return response.headers;
}

function parseCsp(value: string): Map<string, string[]> {
  return new Map(
    value
      .split(';')
      .map((part) => part.trim().split(/\s+/))
      .filter((tokens) => tokens[0])
      .map(([name, ...sources]) => [name, sources]),
  );
}

describe('next.config.ts headers', () => {
  it.each(['/', '/bewerbung', '/feeds/indeed.xml', '/api/bewerbung'])('setzt Security-Header für %s', async (path) => {
    const headers = await headersFor(path);
    expect(headers.get('strict-transport-security')).toBe('max-age=63072000; includeSubDomains; preload');
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('cross-origin-opener-policy')).toBe('same-origin');
    expect(headers.get('x-frame-options')).toBe('SAMEORIGIN');
    expect(headers.get('permissions-policy')).toContain('camera=()');
    expect(headers.get('permissions-policy')).toContain('geolocation=()');
    expect(headers.get('content-security-policy')).toBeNull();
  });

  it('liefert die CSP als Report-Only', async () => {
    const csp = (await headersFor('/')).get('content-security-policy-report-only') ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain('https://*.supabase.co');
  });

  it('sammelt Verstöße über /api/csp-report', async () => {
    const headers = await headersFor('/');
    const directives = parseCsp(headers.get('content-security-policy-report-only') ?? '');
    expect(directives.get('report-uri')).toEqual(['/api/csp-report']);
    expect(directives.get('report-to')).toEqual(['csp-endpoint']);
    expect(headers.get('reporting-endpoints')).toBe('csp-endpoint="/api/csp-report"');
  });

  it('erlaubt die Google-Maps-Hosts aus Googles Allowlist', async () => {
    const directives = parseCsp((await headersFor('/')).get('content-security-policy-report-only') ?? '');
    const expected: Record<string, string[]> = {
      'script-src': ['https://*.googleapis.com', 'https://*.gstatic.com', 'https://*.google.com', 'https://*.ggpht.com', 'https://*.googleusercontent.com', 'blob:'],
      'img-src': ['https://*.googleapis.com', 'https://*.gstatic.com', 'https://*.google.com', 'https://*.googleusercontent.com', 'data:'],
      'connect-src': ['https://*.googleapis.com', 'https://*.google.com', 'https://*.gstatic.com', 'data:', 'blob:'],
      'frame-src': ['https://*.google.com'],
      'font-src': ['https://fonts.gstatic.com'],
      'style-src': ["'unsafe-inline'", 'https://fonts.googleapis.com'],
      'worker-src': ['blob:'],
    };
    for (const [directive, sources] of Object.entries(expected)) {
      expect(directives.get(directive), directive).toEqual(expect.arrayContaining(sources));
    }
  });

  it('markiert nur /api als noindex', async () => {
    expect((await headersFor('/api/maps/config')).get('x-robots-tag')).toBe('noindex');
    expect((await headersFor('/')).get('x-robots-tag')).toBeNull();
    expect((await headersFor('/jobs')).get('x-robots-tag')).toBeNull();
  });

  it('cacht statische Bilder unveränderlich', async () => {
    expect((await headersFor('/images/bad-energie-lahn-dill-logo.svg')).get('cache-control')).toBe(
      'public, max-age=31536000, immutable'
    );
  });

  it('erlaubt keine fremden Bild-Hosts', () => {
    expect(nextConfig.images?.remotePatterns ?? []).toEqual([]);
  });
});
