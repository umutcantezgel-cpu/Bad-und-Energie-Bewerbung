# E0-KUNDSCHAFTER-02 · SEO-Bestand

Rolle Kundschafter · Arbeitsmodell · nur lesend · Bericht wie zurückgegeben (Fundstellen Datei:Zeile, Stand 0c9f103).

## BEFUNDE

### Seiten
- Indexierbar: / (app/page.tsx), /arbeiten-bei-uns und /arbeiten-bei-uns/[thema] (sechs Themen, lib/themen/registry.ts:17), /bewerbung (app/bewerbung/page.tsx:20-26), /einsatzgebiet und /einsatzgebiet/[slug] (Orte nach Gate, app/einsatzgebiet/seo.ts:46-54), /jobs (app/jobs/page.tsx:33-50), /jobs/[slug].
- noindex: /bewerbung/danke (app/bewerbung/danke/page.tsx:18), /bewerbung/mappe (app/bewerbung/mappe/page.tsx:17), /datenschutz (app/datenschutz/page.tsx:35), /impressum (app/impressum/page.tsx:28), Wirkung lib/seo/metadata.ts:55, 82-91; besetzte Stellen app/jobs/[slug]/page.tsx:115; Orte außerhalb des Gates noindex,follow (app/einsatzgebiet/seo.ts:47-54); 404 app/not-found.tsx:15.
- X-Robots-Tag noindex: /api/* (next.config.ts:76-79), Feeds (app/feeds/[feed]/route.ts:27), /api/status (app/api/status/route.ts:18).
- Sitemap-Gruppen: lib/seo/indexable-pages.ts:118-123; ausgeschlossen noindex-Seiten, Feeds, API, Weiterleitungen (:78-81).

### Startseite /
- Title „SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer“ (components/home/content.ts:23), absolut (app/page.tsx:31).
- Description aus den live Stellen (app/page.tsx:27-37, components/home/content.ts:38-57).
- Canonical https://karriere.bad-energie.de ohne Schrägstrich (lib/seo/canonical-links.ts:13-18, lib/seo/metadata.ts:64-66).
- Robots index, follow (lib/seo/metadata.ts:82-92, app/layout.tsx:55-65). Kein noindex.
- Header: kein X-Robots-Tag für / (next.config.ts:37-48, 73-79). proxy.ts sperrt nur benannte Scraper (:28-33). Keine middleware.ts, keine redirects().
- robots.ts: Googlebot, Bingbot, DuckDuckBot und * dürfen /; gesperrt nur /api/ und /admin/ (app/robots.ts:20-23, 51-55).
- Sitemap: / in Gruppe kern (lib/seo/indexable-pages.ts:86).
- hreflang: keiner; html lang="de" (app/layout.tsx:80).
- Analyse und Einwilligung: nur cookielose Attributionserfassung (components/analytics/AttributionCapture.tsx), Ereignis-Meta standardmäßig aus (EreignisSchalter.tsx), Google-Karte erst nach Zwei-Klick (lib/maps/consent.ts:8). Kein gtag, GTM oder Pixel.

### Footer (Ziel, target/rel je Link)
- FussVoll: Logo → / · „Zur Kunden-Website“ → https://bad-energie.de, _blank, noopener noreferrer · Telefon tel: · WhatsApp api.whatsapp.com, _blank, noopener noreferrer · E-Mail mailto: · je live Stelle /jobs/<slug>, „Alle Stellen“ /jobs · /impressum, /datenschutz, /datenschutz#bewerberdaten · sechs Themenlinks und /arbeiten-bei-uns (FooterThemen.tsx:27-38) · Kreis-Hubs und /einsatzgebiet (FooterPlaces.tsx:58-72) · „© OpenStreetMap-Mitwirkende, ODbL“ → openstreetmap.org/copyright, _blank, noopener noreferrer (OsmNennung.tsx:15-18).
- FussSchmal (Fokusmodus): Rechtslinks, Telefon und WhatsApp, OsmNennung.
- Kein nofollow, sponsored oder ugc im Code.

### Strukturdaten
- Global auf jeder Seite (lib/seo/graph.ts:133), components/site/site-jsonld.ts: Organization :69-89, Person :90-96, WebSite :97-111 (@id, url, name, description, inLanguage, publisher, isPartOf; kein creator), LocalBusiness :112-136.
- Seitenbezogen: WebPage/CollectionPage, BreadcrumbList, JobPosting, FAQPage (nur Startseite), Place, ItemList.

### Über uns, Kontakt, Impressum
- /impressum und /datenschutz vorhanden, noindex. /ueber-uns und /kontakt: keine Route, nur Anker auf der Startseite.

### Coday und Quellen (G6)
- codayweb.de: 0 Treffer. „coday-seo-toolkit“ nur als Ausschluss in tsconfig.json:42, .gitignore:9, eslint.config.mjs:13.
- Frühere Agenturen, Themes, Vorlagen, Fotos: nicht gefunden.
- Schriften OFL 1.1: app/fonts/LIZENZEN.md; lib/seo/og-fonts/LIZENZEN.md.
- OpenStreetMap, ODbL: lib/places/osm.ts:11-23; OsmNennung.tsx; app/llms.txt/content.ts:147-155; Einsatzgebiet-Seiten.
- Fahrplan gtfs.de, CC BY 4.0: lib/places/data/oepnv.json:7-12, 22; lib/places/text.ts:700.
- Google Maps nur nach Klick. Bosch: Markenfassung gesperrt (lib/zeichnung/marke.ts:11-16).

## PRÜFUNG UND ERGEBNIS
- Startseite nach Code indexierbar: kein noindex, robots erlaubt /, Canonical auf sich selbst, in der Sitemap. Live-Status und ausgelieferte Header nicht geprüft (kein Abruf).

## OFFENE FRAGEN
1. creator am WebSite-Knoten steht global auf jeder Seite (gewollt?). 2. Schreibweise und URL der Agentur. 3. Herkunft von Logos, Cursor, favicon, Icons, Berufsschul-Daten nicht belegt. 4. „Partnerurkunde 2026“ (lib/data/company.ts:69) nicht belegt. 5. IndexNow nennt / mit Schrägstrich. 6. founder.profileUrl „/#team“ ungenutzt. 7. Description-Länge zur Laufzeit ungeprüft. 8. README.md:41 nennt fünf Themen, der Code sechs. 9. USt-IdNr. im Impressum gegen site-config (bekannt als M-B1 in docs/inhaber/offene-angaben.md).

=== ENDE E0-KUNDSCHAFTER-02 · BEREIT ZUR RÜCKGABE ===
