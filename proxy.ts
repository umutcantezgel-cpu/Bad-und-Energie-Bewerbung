import { NextResponse, type NextRequest } from 'next/server';
import { BEWERBUNG_PFAD, VARIANTE_PFAD } from '@/lib/apply/params';
import { bewerbungZiel } from '@/lib/apply/vorauswahl';
import { isTrustedSiteRequest } from '@/lib/security/origin';
import { WARTUNG_BEWERBUNG_TEXT, WARTUNG_HTML, WARTUNG_RETRY_AFTER_SEC, wartungAktiv, wartungFuer } from '@/lib/wartung';

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

  if (wartungAktiv()) {
    const antwort = wartung(request.nextUrl.pathname);
    if (antwort) return antwort;
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

  const { pathname } = request.nextUrl;
  if (pathname === BEWERBUNG_PFAD || pathname.startsWith(`${VARIANTE_PFAD}/`)) return bewerbung(request);

  return NextResponse.next();
}

/**
 * /bewerbung kommt aus dem Cache (statisch, stündlich neu): Altlinks, Vorauswahl und Unterlagen-Hinweis entscheidet
 * der Proxy davor (lib/apply/vorauswahl.ts). Weiterleitung ausdrücklich mit 308 (ohne Angabe wäre es 307); das
 * Umschreibeziel ohne Query, damit jede Variante genau eine Cache-Zeile hat. Die Adresse im Browser (mit utm_*) bleibt.
 * Absprache: proxy.ts ist laut docs/ROADMAP.md §8.1 gemeinsamer Vertrag; dieser Zweig betrifft nur /bewerbung.
 */
function bewerbung(request: NextRequest): NextResponse {
  const ziel = bewerbungZiel(request.nextUrl.pathname, request.nextUrl.searchParams, new Date());
  if (ziel?.art === 'weiterleiten') return NextResponse.redirect(new URL(ziel.url, request.url), 308);
  if (ziel?.art === 'umschreiben') return NextResponse.rewrite(new URL(ziel.pfad, request.url));
  return NextResponse.next();
}

/**
 * Wartungsmodus (lib/wartung.ts): Seiten zeigen die Wartungsseite, neue Bewerbungen bekommen 503 im Vertrag C8 (der
 * Flow eines offenen Tabs zeigt den Text). Beides mit Retry-After und ohne Cache; null lässt den Pfad durch.
 */
function wartung(pathname: string): NextResponse | null {
  const art = wartungFuer(pathname);
  if (!art) return null;
  const headers = { 'Cache-Control': 'no-store', 'Retry-After': String(WARTUNG_RETRY_AFTER_SEC) };
  if (art === 'bewerbung') {
    return NextResponse.json(
      { ok: false, code: 'SERVICE_UNAVAILABLE', message: WARTUNG_BEWERBUNG_TEXT },
      { status: 503, headers }
    );
  }
  return new NextResponse(WARTUNG_HTML, {
    status: 503,
    headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export const config = {
  matcher: [
    // Ausgenommen: Next-Assets, Icons, Bilder, Feeds, Sitemap-Index und Sitemaps je Gruppe (/sitemap/<id>.xml),
    // robots.txt, llms*.txt und die IndexNow-Schlüsseldatei (/<key>.txt), damit Crawler und Aggregatoren nie
    // geblockt werden.
    '/((?!_next/static|_next/image|favicon\\.ico$|icon-[^/]*\\.png$|images/|feeds/|sitemap/|sitemap\\.xml$|robots\\.txt$|llms\\.txt$|llms-full\\.txt$|[^/]+\\.txt$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
};
