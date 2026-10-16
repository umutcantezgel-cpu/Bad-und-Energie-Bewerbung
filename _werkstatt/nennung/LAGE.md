# Lage · Agenturnennung Coday Web

Stand E0, 16.10.2026, Basis-Commit `a4491d5` (main, live; N-09). Quellen: `berichte/E0-KUNDSCHAFTER-01.md` (Technik), `berichte/E0-KUNDSCHAFTER-02.md` (SEO-Bestand), Ausgangswerte in `berichte/E0-PRUEFER-02.md`.

## Das Projekt in drei Sätzen
Karriereseite karriere.bad-energie.de der Bad und Energie GmbH, eines SHK-Meisterbetriebs in Wetzlar, gebaut von Coday Web. Next.js 16 (App Router, TypeScript, Tailwind und CSS-Module) mit Bun und Vitest, ausgeliefert über Vercel, eine Sprachfassung (Deutsch), Seiten werden vorab gerendert. Der Footer sitzt im Layout (app/layout.tsx → components/site/SiteFooter.tsx → FooterSwitch → components/site/fuss/FussVoll.tsx bzw. FussSchmal.tsx).

## Stack
- next ^16.3.8, react ^19.3.0, tailwindcss 4.3.3, vitest ^5.0.3, @playwright/test 1.63.0, typescript 5.9.3, bun 1.4.2; `output: 'standalone'`; Vercel Region fra1.
- Prüfskripte: lint, type-check, test, check:design, check:contrast, check:client-imports, build (mit check-css-chunks), test:graph, test:claims, test:similarity, orte:gate, e2e (Playwright, Port 3400), lighthouse.

## Fundstelle des Footers
- Kette: app/layout.tsx:93 → SiteFooter.tsx:11-13 (Server) → FooterSwitch.tsx:16 (Client, `isFocusMode(usePathname())`).
- Voller Fuß auf allen Seiten außer `/bewerbung…`, schmaler Fuß im Fokusmodus (components/site/nav.ts:42-51).
- Pflichtzeile mit OSM-Nennung: FussVoll.tsx:124-127, FussSchmal.tsx:38-41; Text fuss-text.ts:76-80; Stil fuss.module.css:422-449 (`.zeile`, `.osm`, `.osmLink`).
- Inhalte nur aus Code, kein CMS und keine Datenbank. Kein Sprachsystem; Texte sind deutsche Konstanten.

## Sprachfassungen
- Eine: Deutsch (`lang="de"`), keine hreflang-Angaben.

## Quellseite
- `/`: indexierbar nach Code. Status 200, kein noindex, robots.txt erlaubt `/`, Canonical `https://karriere.bad-energie.de` auf sich selbst, in `sitemap/kern.xml`. Ausgeliefert geprüft in E0-PRUEFER-02.
- Über uns und Kontakt gibt es nur als Anker der Startseite. Impressum und Datenschutz sind `noindex` und als Ersatz ungeeignet; nötig sind sie nicht.

## Vorhandene Nennungen und Links
- Keine Nennung von Coday, kein Link auf codayweb.de.
- Fremde Nennungen und Lizenzen (G6), bleiben unverändert:
  - OpenStreetMap/ODbL im Fuß (OsmNennung.tsx) und auf den Einsatzgebiet-Seiten;
  - gtfs.de/CC BY 4.0 (lib/places/data/oepnv.json);
  - Schriften OFL 1.1 (app/fonts/LIZENZEN.md, lib/seo/og-fonts/LIZENZEN.md).
- Externe Links im Repo tragen `rel="noopener noreferrer"`; kein nofollow, sponsored oder ugc.

## Strukturdaten
- WebSite-Knoten in components/site/site-jsonld.ts:97-111, auf jeder Seite über lib/seo/graph.ts:133. Kein creator.
- Prüfungen: site-jsonld.test.ts, graph.test.ts, scripts/qa/check-graph.mjs (ein Top-Level-Knoten je Typ).

## Auslieferung
- `.vercelignore` schließt bisher nur `_relaunch` aus. `_werkstatt` kommt dazu (N-07).

## Erkannte Sonderfälle
- Fuß im Root-Layout ohne Pfad: Die Entscheidung über die Quellseite fällt in einer kleinen Client-Komponente mit `usePathname` (N-05). Sie wird beim Vorrendern auf dem Server ausgewertet.
- `/bewerbung` wird pro Anfrage gerendert (searchParams); es gilt dieselbe Komponente.
- Wörtlich geprüfte Fußtests (fuss.test.ts, weichheit.test.ts, schale-bundle.test.ts) werden um die Nennung erweitert, nicht gelockert.
