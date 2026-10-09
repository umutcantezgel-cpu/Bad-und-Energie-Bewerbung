# KERN – Gestaltungssystem
Version: 0.1 (Entwurf vor der Richtungswahl; vollständig ab Version 1 am Ende von P2)

## K-002 Marke, Zielgruppe, fünf Besucheraufgaben (Entwurf, als Annahme markiert)
**Marke (Annahme, abgeleitet aus Inhalten):** Bad & Energie GmbH Lahn-Dill – SHK-Meisterbetrieb in Wetzlar, gegründet 1926, 15 Leute; Schwerpunkt Wärmepumpen, Heizung und moderne Bäder; Fachbetrieb des Lahn-Dill-Kreises; Partner Buderus, Bosch, NIBE, Alpha Innotec und Viessmann. Gefühl: ehrliches Handwerk, Verlässlichkeit, Stolz auf gutes Werkzeug, Nähe (höchstens 35 km), Respekt vor der Zeit der Leute (Freitag 13:30 Feierabend), Diskretion beim Wechsel.

**Zielgruppe:** SHK-Fachkräfte (Anlagenmechaniker, Kundendiensttechniker, Obermonteure/Projektleiter), Auszubildende und Quereinsteiger im Umkreis von 35 km um Wetzlar (Lahn-Dill-Kreis, Gießen); meist in fester Anstellung und vorsichtig beim Wechsel; überwiegend am Telefon unterwegs, oft nach Feierabend; schätzen klare Fakten (Gehalt, Arbeitszeit, Fahrzeug, Werkzeug) mehr als Werbesprache.

**Fünf Besucheraufgaben (Grundlage für Z-04):**
1. **Passende Stelle finden und verstehen** – Aufgaben, Gehaltsspanne, Arbeitszeiten, Ausstattung (/, /jobs, /jobs/[slug]).
2. **Prüfen, ob der Arbeitsweg passt** – Einsatzgebiet und Fahrzeit vom eigenen Wohnort (/#einsatzgebiet, Stellenseiten).
3. **Sich in rund 60 Sekunden bewerben** – am Telefon, ohne Lebenslauf, diskret (/bewerbung, eingebetteter Flow auf Stellenseiten).
4. **Den Betrieb einschätzen** – seit 1926, Team, Werkzeug und Fahrzeug, Vorteile, Stimmen, Partner (/, Stellenseiten).
5. **Direkt und unverbindlich Kontakt aufnehmen** – Telefon, WhatsApp, E-Mail, Ansprechpartner Sabri Demir (überall, Danke-Seite).

**Seitenarten (Auftrag Abschnitt 7):**
- Erzählseiten (dürfen inszenieren, Signaturmomente erlaubt): `/` (Startseite), `/jobs/[slug]` (Stellenseiten), 404 (kleiner Charaktermoment).
- Arbeitsseiten (ruhig, dicht, schnell, ohne Signaturmomente): `/jobs` (Liste), `/bewerbung` (Flow), `/bewerbung/danke`, `/bewerbung/mappe`, `/datenschutz`, `/impressum`.

## K-004 Plattformregeln (vor Richtungswahl festgelegt)
- **Technik:** Next.js 16 App Router (`proxy.ts` statt Middleware), React 19, Tailwind CSS 4.3 mit `@theme` in `app/styles/theme.css` (drei Ebenen: Primitive → semantische Rollen in `:root`/Dunkel/`[data-tone="inverse"]` → `@theme inline`-Utilities), Bun 1.4 als Paketmanager, Server-Komponenten als Standard.
- **Styling:** Komponenten nutzen nur semantische Utilities (`bg-surface`, `text-ink`, `border-line`, `text-title-2` …). Rohpaletten, Hexwerte in Klassen, `text-[…]`, freie Schatten sind per `scripts/qa/check-design-tokens.mjs` verboten (Ausnahme pro Zeile nur mit `// design-allow` und Grund). Kontraste werden per `scripts/qa/check-contrast.mjs` aus `theme.css` gerechnet – Rollenwerte bleiben reine Hexwerte. Neue Token-Namen müssen in `lib/utils/cn.ts` (`extendTailwindMerge`) eingetragen werden, sonst verschluckt `cn()` Klassen. JS-Spiegel der Bewegungswerte in `lib/tokens/index.ts`.
- **Komponenten:** `components/ui/*` (cva + `variants.ts`, `@radix-ui/react-slot` für `asChild`), Seitenrahmen `components/site/*`, Abschnitte `components/home/*`, Stellen `components/jobs/*`, Flow `components/apply/*`, Mappe `components/mappe/*`, Region `components/maps/*`, Stimmen `components/reviews/*`, Recht `components/legal/*`. Varianten statt Kopien.
- **Inhalte:** Fakten nur aus `lib/content/facts.ts` (mit Quelle, `pending` = nicht ausspielen außer wo die Basis es erlaubt), Stellen aus `lib/jobs/data/*`, Texte der Startseite aus `components/home/content.ts`. Sprache: nur Deutsch, Anrede „du“ in Recruiting-Texten.
- **Themen:** Hell/Dunkel über `prefers-color-scheme`, Druck immer hell; jedes neue Teil beherrscht hell, dunkel, Inverse-Band und Druck.
- **Tests:** Vitest (`bun run test`, 927 grün in P0), Playwright (`playwright.config.ts`: 4 Projekte mobil/Desktop × hell/dunkel, `reducedMotion: 'reduce'`, axe WCAG 2.2 AA), Guards (`check:design`, `check:contrast`, `check:client-imports`), `test:graph` (JSON-LD), Lighthouse CI (`lighthouserc.json`). Neue Funktionen bekommen Vitest- und E2E-Tests im bestehenden Muster.
- **Dateihoheit (E-012):** nie `supabase/**`, `lib/supabase/**`, `lib/uploads/**`, `app/admin/**`, `app/api/admin/**`; gemeinsame Verträge nur ergänzend mit Absprache-Eintrag.
- **Sicherheit:** CSP derzeit Report-Only in `next.config.ts` – jedes Inline-Skript braucht dort einen Hash; keine neuen Drittanbieter.

## K-013 Budgets (aus dem Auftrag, gemessen mit `_relaunch/werkzeuge/lh.mjs` und `groessen.mjs`)
Lighthouse mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms · INP ≤ 200 ms · zusätzliches JS für Bewegung ≤ 60 KB gzip (Ziel ≤ 8 KB, E-013) · Schriften ≤ 250 KB gesamt · Icon-SVG ≤ 1,5 KB (roh) · Illustrations-SVG ≤ 40 KB gzip. Ausgangswerte (P0): Perf mobil 94–96, LCP mobil 2,63–3,08 s (über Budget!), CLS 0, TBT 80–108 ms, Schriften 47 KB (eine Inter-Datei), JS je Seite 170–224 KB gzip.

## K-014 Wünsche (verbindliche Inhaberentscheidungen, ROADMAP §1, Rang 5)
Keine KI-Funktionen · nur bestehende, belegte Fakten (kürzen/umstellen erlaubt) · keine Fotos, kein Stock, typografische Ästhetik · Gehaltsspannen sichtbar · Google-Karte + Pendelrechner, Bewerbungsmappen-Generator und Bewertungsband bleiben (neu gestaltet) · Ausbildung 2026: „Einstieg noch möglich“ · die vier Teamzitate sind echt und freigegeben · Navy als Schriftfarbe, Rot nur für die eine Primäraktion · Barrierefreiheit WCAG 2.2 AA (44-px-Ziele, Auswahlkarten ≥ 64 px, Hilfe immer an derselben Stelle).

## Weitere Abschnitte
K-001, K-003, K-005 … K-012, K-015 entstehen nach der Richtungswahl (P2).
