# MASTER-FOLGEPROMPT: SCHUTZ DER HAUPTDOMAIN (bad-energie.de) ÜBER DIE SUBDOMAIN (karriere.bad-energie.de)
# Kontext-Referenz: Konversation "Professionalisierung Und Google Maps Integration" (Repo: Bad-und-Energie-Bewerbung-main)
# Ziel: Maximale Absicherung von bad-energie.de vor Bot-Schäden, DMARC-Fehlern, API-Kosten & Ranking-Verlusten OHNE etwas Bestehendes zu beschädigen

---

Du bist leitender Chefarchitekt für Next.js, Vercel Edge-Infrastruktur und Cybersicherheit.

### DIE AKUTE AUSGANGSLAGE ZWISCHEN HAUPTDOMAIN & SUBDOMAIN:
1. **Hauptdomain (`bad-energie.de`):** Wird aktuell von einer massiven Bot-Welle (691 Referring Domains, 88% Spam) attackiert, leidet unter 5XX-Serverfehlern und hat eine strikte DMARC-Richtlinie (`v=DMARC1; p=quarantine; sp=quarantine; ...`) aktiv.
2. **Subdomain (`karriere.bad-energie.de`):** Läuft separat auf Vercel (Next.js 16.3.8 / React 19), erzielt 100/100 Seobility und 100 PageSpeed.
3. **Dein Auftrag:** Nutze die überlegene Edge-Infrastruktur der Karriere-Subdomain als **aktives Schutzschild für die Hauptdomain**. Schütze die E-Mail-Reputation, das Google-Trust-Profil, die Google Maps API-Konten und die Serverressourcen von Bad & Energie GmbH, **ohne** eine einzige bestehende Funktion (PDF-Dossier-Druck, Foto-Upload, Direkt-Bewerbung, Google Maps) zu beschädigen!

Setze folgende 5 Schutzschilde schlüsselfertig im Repository um:

---

### SCHUTZSCHILD 1: Vercel Edge Middleware (`middleware.ts`) zur Bot-Abwehr
**Zweck:** Verhindert, dass Scraper, die `bad-energie.de` angreifen, über die Subdomain Schwachstellen finden, APIs fluten oder Vercel-Kosten in die Höhe treiben.

Erstelle eine neue Datei `middleware.ts` im Root-Verzeichnis:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Bekannte Bad-Bots & Scraper-Netzwerke (u.a. das enttarnte seoexpress-Syndikat)
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
    
    // Erlaube Aufrufe nur von bad-energie.de und karriere.bad-energie.de
    if (!isSameOrigin && process.env.NODE_ENV === 'production') {
      return new NextResponse('Ungültiger Aufruf-Kontext.', { status: 403 });
    }
  }

  // 3. Sicherheitsheader anreichern & Host-Only Cookie Policy erzwingen
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Subdomain-Role', 'Shield-Node-Bad-Energie');

  return response;
}

export const config = {
  matcher: [
    // Alle Pfade außer statische Next.js Assets und Bilder
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
};
```

---

### SCHUTZSCHILD 2: DMARC-Sicherheit & E-Mail-Reputationsschutz in `lib/email/resend.ts`
**Zweck:** Verhindert, dass Resend-Mails von `bewerbung@karriere.bad-energie.de` an DMARC (`sp=quarantine`) scheitern und den Spam-Score der Hauptdomain `bad-energie.de` zerstören.

Optimiere `lib/email/resend.ts`:
1. Wenn keine eigene Domain in Resend verifiziert ist, darf Resend niemals ungeprüfte `@bad-energie.de`-Absender fälschen.
2. Der Fallback-Absender muss auf die verifizierte Resend-Onboarding-Adresse (`onboarding@resend.dev`) oder die verifizierte Domain `resend.karriere.bad-energie.de` zurückgreifen, wenn `RESEND_FROM_EMAIL` nicht explizit gesetzt ist.
3. Wichtig: `replyTo` MUSS immer die E-Mail des Bewerbers (`data.email`) sein, und das Ziel für das Meister-Team MUSS `info@bad-energie.de` sein.
4. Dadurch kommen alle Bewerbungen garantiert bei Meister Demir an, ohne dass IONOS DNS oder DMARC-Fehlermeldungen ausgelöst werden!

---

### SCHUTZSCHILD 3: Google Maps API-Schutz in `app/api/maps/config/route.ts`
**Zweck:** Schützt den Google Maps API-Key vor Diebstahl, unbefugtem Scraping und Kostenfallen, die das Firmenkonto gefährden könnten.

Passe `app/api/maps/config/route.ts` an:
1. Ergänze Cache-Control und Referrer-Validierung:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const referer = request.headers.get('referer') || '';
  const isAllowedReferer = referer.includes('bad-energie.de') || process.env.NODE_ENV !== 'production';

  if (!isAllowedReferer) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
  }

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    '';

  const mapId =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() ||
    process.env.GOOGLE_MAPS_MAP_ID?.trim() ||
    '';

  const sanitizedKey =
    !apiKey || apiKey === 'MY_GOOGLE_MAPS_API_KEY' || apiKey.startsWith('AIzaSy_placeholder')
      ? ''
      : apiKey;

  return NextResponse.json(
    {
      apiKey: sanitizedKey,
      mapId,
      hasKey: Boolean(sanitizedKey),
    },
    {
      headers: {
        'Cache-Control': 'private, no-cache, no-store',
      },
    }
  );
}
```

---

### SCHUTZSCHILD 4: Entity Trust Transfer in `lib/seo/site-config.ts`
**Zweck:** Überträgt das perfekte 100/100 Seobility- und PageSpeed-Vertrauen der Subdomain an die Hauptdomain `bad-energie.de` und korrigiert Rechtsdaten.

Aktualisiere `lib/seo/site-config.ts`:
1. **Handelsregister vereinheitlichen:** Von `HRB 8459` auf die amtliche Nummer korrigieren:
   `handelsregister: 'HRB 2449 Amtsgericht Wetzlar'`
2. **Die 5 offiziellen Partner-Säulen verankern:** (Entfernung von „Brötje“):
   ```typescript
   knowsAbout: [
     'Wärmepumpensysteme von Buderus und Bosch (14,8 km Werksnähe Lollar)',
     'NIBE Effizienzpartner mit 7 Jahren Herstellergarantie',
     'Alpha Innotec zertifizierter Inbetriebnahme-Partner',
     'Viessmann Fachbetrieb',
     'Fachbetrieb für den Lahn-Dill-Kreis (öffentliche Liegenschaften)',
     'Komplettbadsanierung und barrierefreie Bäder',
     'Gebäudeenergieberatung durch Dipl.-Ing. Sabri Demir',
     'Ausbildung zum Anlagenmechaniker SHK seit 1926',
   ],
   ```
3. **Knowledge Graph Parent-Verknüpfung:**
   Stelle sicher, dass in den JSON-LD Generatoren (`lib/seo/schema-generators.ts`) die Entität `parentOrganization` und `isPartOf` explizit auf `https://bad-energie.de` mit der gemeinsamen Adresse `Siegmund-Hiepe-Str. 20, 35578 Wetzlar` verweist. Google verknüpft dadurch die Subdomain mit der Hauptdomain als gemeinsame starke Vertrauensentität.

---

### SCHUTZSCHILD 5: Zero-Breakage & Build-Verifikation
Prüfe vor dem Git-Commit:
1. `bun run build` bzw. `next build` mit Turbopack muss **fehlerfrei mit Exit-Code 0** durchlaufen (13/13 statische Routen generiert).
2. Der DINA4-PDF-Druck (`PrintA4View.tsx`), der Bewerbungs-Foto-Upload (`VaultView.tsx`) und der interaktive Express-Funnel müssen 100 % unverändert funktionieren.
3. Nach erfolgreichem Test: Commit und Push auf den `main`-Branch zur automatischen Vercel-Aktualisierung:
   ```bash
   git add .
   git commit -m "security(shield): Edge Bot-Protection, DMARC-safe Resend isolation, Maps-Key Referer lock and HRB 2449 entity trust alignment"
   git push origin main
   ```
