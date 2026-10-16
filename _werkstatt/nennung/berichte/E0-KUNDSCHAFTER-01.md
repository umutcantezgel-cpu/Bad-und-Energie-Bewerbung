# E0-KUNDSCHAFTER-01 · Technik des Footers

Rolle Kundschafter · Arbeitsmodell · nur lesend · Bericht wie zurückgegeben (Fundstellen Datei:Zeile, Stand 0c9f103).

## BEFUNDE

1. Stack
- package.json: next ^16.3.8, react ^19.3.0, tailwindcss 4.3.3, vitest ^5.0.3, @playwright/test 1.63.0, typescript 5.9.3, packageManager bun@1.4.2. Skripte: build (prebuild: check-design-tokens, check-contrast, check-client-imports; postbuild: check-css-chunks), test (vitest run), type-check, e2e.
- next.config.ts: output 'standalone' (:59), ignoreBuildErrors false (:53), CSP nur Report-Only (:46, Policy ab :19), Security-Header nur hier (:37).
- vercel.json: nur regions ["fra1"].
- .vercelignore (vollständig, 2 Zeilen): Kommentar „Arbeitsordner des Relaunch-Laufs …“ und `_relaunch`.

2. Routen (alle app/-Dateien)
- 12 page.tsx, 13 route.ts, 4 opengraph-image.tsx, dazu robots.ts, error.tsx, global-error.tsx, not-found.tsx; 3 Layouts (app/layout.tsx mit revalidate 3600 bei :22; app/bewerbung/layout.tsx und app/datenschutz/layout.tsx als Durchreiche).
- /: app/page.tsx, revalidate 3600 (:24), ohne dynamische APIs, vorab gerendert.
- /arbeiten-bei-uns (revalidate 3600); /arbeiten-bei-uns/[thema] (dynamicParams false, revalidate 3600, 6 Themen).
- /einsatzgebiet (revalidate 3600); /einsatzgebiet/[slug] (dynamicParams false, revalidate 3600, Slugs inkl. 308-Weiterleitungen).
- /jobs (revalidate 3600); /jobs/[slug] (dynamicParams false, revalidate 3600, Stellen plus redirectFrom).
- /bewerbung liest searchParams (app/bewerbung/page.tsx:59-60), wird also pro Anfrage gerendert.
- /bewerbung/danke, /bewerbung/mappe, /datenschutz, /impressum, not-found: ohne Angabe, statisch. /bewerbung/danke und /bewerbung/mappe stehen in keiner Navigation.
- Route-Handler: POST /api/bewerbung, /api/bewerbung/ergaenzung, /api/e; force-dynamic: /api/csp-report, /api/indexnow, /api/maps/config, /api/status; force-static: /feeds/[feed], /llms.txt, /llms-full.txt, /sitemap.xml, /sitemap/[datei] (revalidate 3600), /zeichnung/[datei].
- app/global-error.tsx rendert eigenes html (:54) und keinen Fuß.

3. Footer-Kette
- app/layout.tsx:93 `<SiteFooter />` → components/site/SiteFooter.tsx:11-13 (Server-Komponente, year = new Date().getFullYear()) → components/site/FooterSwitch.tsx:1 'use client', :16 `isFocusMode(usePathname()) ? slim : full`.
- components/site/nav.ts:42-51: Pfad normalisieren; isFocusMode = /bewerbung oder /bewerbung/…. Voller Fuß: alle übrigen Seiten. Schmaler Fuß: /bewerbung, /bewerbung/danke, /bewerbung/mappe.
- Footer-Dateien in components/site/fuss/: FussVoll.tsx, FussSchmal.tsx, FussLink.tsx, OsmNennung.tsx, Ziffern.tsx, fuss-text.ts, fuss.module.css, index.ts. kontakt.module.css gehört zu ContactOptions, leiste.module.css zur StickyApplyBar.
- Pflichtzeile: FussVoll.tsx:124-127 und FussSchmal.tsx:38-41; Text fuss-text.ts:76-78 (`© {Jahr} {legalName} · {register.full} · {innung}`).
- OSM-Nennung: OsmNennung.tsx:10-21; Link :15 mit target _blank und rel="noopener noreferrer"; sr-only NEUER_TAB :17. Wortlaut lib/places/osm.ts:11, :14, :23.
- Rechtslinks: fuss-text.ts:33-37 (Impressum, Datenschutz, Datenschutz für Bewerbende mit #bewerberdaten); gerendert in FussVoll.tsx:108-118 und FussSchmal.tsx:20-28.
- Kunden-Website: FussVoll.tsx:57-62, fuss-text.ts:40-44; Ziel lib/seo/site-config.ts:14 = https://bad-energie.de.
- Weitere Blöcke im vollen Fuß: components/site/FooterThemen.tsx:18-42 und components/site/FooterPlaces.tsx:47-74; FussVoll.tsx:121-122.

4. Herkunft der Inhalte
- Kein CMS, keine Datenbank, keine API im Fuß; Quellen sind Konstanten und Registries (lib/content/company.ts, lib/jobs/registry.ts, lib/themen/registry.ts, lib/places/*).

5. Sprachsystem
- Kein i18n: keine Abhängigkeit, keine Treffer für i18n, next-intl, locales oder messages. Einzige Sprachangabe `lang="de"` in app/layout.tsx:80.
- Footer-Texte sind deutsche Konstanten in fuss-text.ts (FUSS_SPALTEN :14-19, KUNDEN_WEBSITE :40-44, fussKontakte :64-73, pflichtzeile :76-78, NEUER_TAB :80).

6. Designwerte (components/site/fuss/fuss.module.css)
- .zeile :422-428: Schrift --text-footnote (0,875 rem), line-height 1,5, Farbe --ink-2, border-top 1 px --line.
- .osm :431-434; .osmLink :436-443: color inherit, Unterstrich 1 px, Versatz 0,25 em, kein Hover, keine Mindesthöhe. Fokus :445-449 (3 px --focus, Versatz 2 px).
- .link :152-163: min-height --m-ziel (44 px), Schrift --text-callout, Farbe --ink.
- Globaler Fokus: app/globals.css:43-46 (:focus-visible 3 px --focus).
- Themen: [data-tone="inverse"] (globals.css:62-66; theme.css:420-462: --surface #111D6D, --ink #F6F0E4, --ink-2 #B9C0E8, --focus #86AEFF); Dunkelmodus theme.css:464-472 (--surface #16237A).
- Klickflächen: FussLink ab 44 px; der OSM-Link hat keine Mindesthöhe.

7. sr-only
- Tailwind-Klasse `sr-only`. Muster: FussLink.tsx:34, :38 (NEUER_TAB bei extern), OsmNennung.tsx:17, components/home/gebiet/Werkstatt.tsx:47-53.

8. Testaufbau
- vitest.config.ts:4-15: environment node; include **/__tests__/**/*.test.ts und **/*.test.ts; exclude node_modules, .next, e2e, _relaunch.
- Muster renderToStaticMarkup: components/site/__tests__/fuss.test.ts und footer-places.test.ts.
- Footer-bezogene Tests: fuss.test.ts; footer-places.test.ts; schale-bundle.test.ts:20 (FooterSwitch in der Client-Schale; verboten: tailwind-merge, zod, lib/seo/site-config); weichheit.test.ts:228-233; e2e/navigation.spec.ts:202-212.

9. Strukturdaten
- components/site/site-jsonld.ts: buildSiteNodes() :66-138 mit Organization :68-89, Person :91-96, WebSite :97-111, LocalBusiness :112-136.
- WebSite: @id, url, name `${COMPANY.name} Karriere`, description, inLanguage de-DE, publisher {@id Organization}, isPartOf {WebSite bad-energie.de}. Kein creator.
- Einbindung: lib/seo/graph.ts buildPageGraph ruft buildSiteNodes auf jeder Seite auf. Prüfungen: site-jsonld.test.ts, graph.test.ts, scripts/qa/check-graph.mjs.

10. Auslieferung
- .vercelignore nennt nur _relaunch. Ein Ordner _werkstatt existiert nicht. Würde er angelegt: tsconfig include (**/*.ts, **/*.tsx), vitest.config.ts und eslint.config.mjs erfassen ihn.

11. Coday-Suche
- Keine Treffer für „codayweb“ und „Coday Web“. „Coday“ nur als coday-seo-toolkit in eslint.config.mjs:13, .gitignore:9, tsconfig.json:42 (Ordner fehlt).

## PRÜFUNG UND ERGEBNIS (Konflikte)
- K1 rel: Auftrag „noopener, nie noreferrer“; im Repo tragen externe Links „noopener noreferrer“, Tests prüfen das wörtlich.
- K2 Quellseite: Layouts rendern bei Navigation nicht neu; Server-Komponenten kennen den Pfad nicht; headers() würde Seiten dynamisch machen. Einzige Pfadumschaltung: FooterSwitch.tsx:16 (Client, usePathname).
- K3 Klickfläche: Textlink in .zeile hätte keine Mindesthöhe wie .osmLink.
- K4 Tests: Pflichtzeile, Spaltenköpfe, Kunden-Website-Markup und Fußöffnung sind wörtlich geprüft.

## OFFENE FRAGEN
1. rel „noopener“ allein oder Repo-Wortlaut? 2. Startseitenlogik per Client-Komponente mit usePathname? 3. Nennung auch im schmalen Fuß? 4. creator: Typ, name, url? 5. Ausschluss von _werkstatt in .vercelignore, tsconfig, vitest, eslint?

=== ENDE E0-KUNDSCHAFTER-01 · BEREIT ZUR RÜCKGABE ===
