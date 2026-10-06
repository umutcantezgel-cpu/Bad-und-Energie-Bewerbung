import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Bekannte Bad-Bots & Scraper-Netzwerke (u.a. das enttarnte seoexpress-Syndikat & Aggressive SEO Crawler)
const BLOCKED_BOT_REGEX = /(SemrushBot|MJ12bot|DotBot|BLEXBot|DataForSeoBot|PetalBot|MegaIndex|Bytespider|Scrapy|python-requests|aiohttp|Go-http-client|node-fetch|HeadlessChrome)/i;

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;

  // 1. Bad-Bots sofort am Edge abweisen (HTTP 403)
  if (BLOCKED_BOT_REGEX.test(userAgent)) {
    return new NextResponse('Zugriff verweigert (Automatisierter Scraper erkannt).', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // 2. Schutz des Google Maps Config Endpunkts vor externem Auslesen
  if (pathname.startsWith('/api/maps/config')) {
    const secFetchSite = request.headers.get('sec-fetch-site');
    const referer = request.headers.get('referer') || '';
    const isSameOrigin = secFetchSite === 'same-origin' || referer.includes('bad-energie.de');

    // Erlaube Aufrufe nur von bad-energie.de und karriere.bad-energie.de im Produktivbetrieb
    if (!isSameOrigin && process.env.NODE_ENV === 'production') {
      return new NextResponse('Ungültiger Aufruf-Kontext.', { status: 403 });
    }
  }

  // 3. Sicherheitsheader anreichern & Host-Only Shield Policy
  const response = NextResponse.next();
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Subdomain-Role', 'Shield-Node-Bad-Energie');

  return response;
}

export const config = {
  matcher: [
    // Alle Pfade außer statische Next.js Assets und Bildformate
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
};
