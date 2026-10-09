import { NextResponse, type NextRequest } from 'next/server';
import { isTrustedSiteRequest } from '@/lib/security/origin';

// Nur benannte SEO-Scraper aus der Sperrliste in app/robots.ts. Bewusst offen: Bytespider (dort nur
// per Disallow gebeten, hier nicht geblockt: TikTok-Anzeigenprüfung), generische HTTP-Clients
// (Jobbörsen-Aggregatoren, Feed-Reader) und HeadlessChrome (Ad-Review-Bots, Playwright-CI).
const BLOCKED_SEO_SCRAPERS = /\b(?:SemrushBot|MJ12bot|DotBot|BLEXBot|DataForSeoBot|PetalBot|MegaIndex)/i;

/** Kaputte Prozent-Kodierung (z. B. /jobs/%ZZ) ließe Next mit dynamicParams=false einen 500 werfen. */
function hasMalformedEncoding(pathname: string): boolean {
  try {
    decodeURIComponent(pathname);
    return false;
  } catch {
    return true;
  }
}

// Security-Header kommen ausschließlich aus next.config.ts.
export function proxy(request: NextRequest) {
  if (hasMalformedEncoding(request.nextUrl.pathname)) {
    return new NextResponse('Ungültige Adresse.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  if (BLOCKED_SEO_SCRAPERS.test(request.headers.get('user-agent') ?? '')) {
    return new NextResponse('Zugriff verweigert.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  // Maps-Konfiguration nur für Aufrufe von der eigenen Seite (Route-Handler prüft zusätzlich).
  if (
    request.nextUrl.pathname.startsWith('/api/maps/config') &&
    process.env.NODE_ENV === 'production' &&
    !isTrustedSiteRequest(request.headers)
  ) {
    return NextResponse.json(
      { ok: false, error: 'FORBIDDEN' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Ausgenommen: Next-Assets, Icons, Bilder, Feeds, Sitemap, robots.txt, llms*.txt und
    // die IndexNow-Schlüsseldatei (/<key>.txt), damit Crawler und Aggregatoren nie geblockt werden.
    '/((?!_next/static|_next/image|favicon\\.ico$|icon-[^/]*\\.png$|images/|feeds/|sitemap\\.xml$|robots\\.txt$|llms\\.txt$|llms-full\\.txt$|[^/]+\\.txt$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
};
