# KERN – Gestaltungssystem
Version: 0.2 (Entwurf vor der Richtungswahl; K-011, K-012, K-015 richtungsunabhängig ergänzt; vollständig ab Version 1 am Ende von P2)

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

## K-011 Komponenten, Zustände, Seitenarten (richtungsunabhängig, Entwurf 0.2)
**Seitenarten.**
- Erzählseiten (`/`, `/jobs/[slug]`, 404): ein Blickfang je Bildschirmhöhe; benachbarte Abschnitte unterscheiden sich in Struktur und Dichte (S-12); Signaturmomente nur hier. Scroll-Auftritte auf höchstens der Hälfte der Abschnitte (S-02).
- Arbeitsseiten (`/jobs`, `/bewerbung*`, `/datenschutz`, `/impressum`): ruhig, dicht, schnell. Nur Rückmeldungs- und Zustandsbewegung, keine Auftritte beim Scrollen. Formular zuerst, Erklärung daneben oder darunter.

**Komponenten.** `components/ui/*` mit cva-Varianten statt Kopien. Neue Aufgaben werden zur Variante einer vorhandenen Komponente, wo eine passt (Auftrag 8: Verschmelzen). Abschnitte unter `components/home/*`, Stellen unter `components/jobs/*` usw. (K-004). Eine Komponente wird nur neu angelegt, wenn keine vorhandene die Aufgabe trägt; Beispiele sind `TrustLine`, `BenefitConfigurator`, `ProgressRing`, `UploadPanel` und `components/icons/*`.

**Zustände (Pflicht für jedes interaktive Element, wo der Zustand vorkommen kann):**

| Zustand | Regel |
|---|---|
| Ruhe | aus Rollen-Tokens, nie aus Rohwerten |
| Hover | nur bei `(hover: hover) and (pointer: fine)`; nie einzige Informationsquelle |
| Fokus | `:focus-visible` mit `outline` ≥ 2 px und Abstand; Kontrast ≥ 3:1 gegen Umgebung und Ruhezustand; `scroll-padding-top` in Höhe von Kopf und StickyApplyBar |
| Aktiv | Druck-Rückmeldung sofort (Dauerstufe „Rückmeldung“), Touch mit eigener Rückmeldung |
| Deaktiviert | sichtbar anders, mit Grund in Textform, wenn der Grund nicht offensichtlich ist (z. B. Upload bis Phase 2) |
| Lädt | Anzeige erst nach 300 ms, dann mindestens 500 ms sichtbar; Knopf behält seine Breite |
| Fehler | Text mit Ursache und nächstem Schritt, Icon und Farbe nur zusätzlich; Alternativweg Telefon/WhatsApp |
| Erfolg | Text zuerst; Bewegung bestätigt, blockiert nie |
| Leer | erklärt, warum leer, und bietet den nächsten Schritt an |

**Bedienmaße.** Touch-Ziele 44 × 44 px, Auswahlkarten ≥ 64 px Höhe, nie unter 24 × 24 px (WCAG 2.5.8). Eingabefelder ≥ 17 px Schrift (kein iOS-Zoom). Sichtbare Beschriftungen, `autocomplete`, Fehlermeldungen am Feld. Hilfe (Telefon, WhatsApp) steht immer an derselben Stelle (WCAG 3.2.6).

## K-012 Inhalte, Ton, Mikrotexte (richtungsunabhängig, Entwurf 0.2)
- **Wahrheit:** Jede Arbeitgeber-Aussage kommt aus `lib/content/facts.ts`. Dort markierte Fakten mit `pending` erscheinen nur, wo die Basis es erlaubt; `validUntil` wird beachtet (Jubiläum bis 31.12.2026). Was nicht im Register steht, wird nicht behauptet. Das gilt für Zahlen, Auszeichnungen, Zitate und Bewertungen; offene Belege stehen in MENSCHEN.md (M-003, M-007…M-015).
- **Ton:** du-Anrede, kurze Hauptsätze, Fakt vor Adjektiv („Freitags ab 13:30 Uhr Feierabend“ statt „attraktive Arbeitszeiten“). Handwerkersprache ohne Jargon-Überhöhung. Keine KI-Floskeln (S-13: „nahtlos“, „innovativ“, „ganzheitlich“, „maßgeschneidert“, „Entdecken Sie …“, „auf das nächste Level“), keine Superlative ohne Beleg.
- **Typografie im Text:** „…“ als Anführungszeichen, Gedankenstrich –, Halbgeviert für Bereiche (07:00–16:45 Uhr), geschütztes Leerzeichen vor Einheiten und in Zahl-Wort-Paaren (35 km, 13:30 Uhr, 30 Tage). `lang="de"` und `hyphens: auto` im Fließtext; weiche Trennstellen für lange Berufsnamen (`titleShy`).
- **Knöpfe sagen, was passiert:** „Jetzt in 60 Sekunden bewerben“, „Mappe als PDF speichern“, „Route in Google Maps öffnen“; nie „Absenden“, „Mehr“ oder „Klicken Sie hier“.
- **Fehlertexte:** was passiert ist, was jetzt zu tun ist, und der Direktweg (Telefon/WhatsApp mit Sabri Demir).
- **Mikrotexte** ändert der Lauf direkt (TEXTE = Mikrotexte direkt). Längere Texte gehen als Vorschlag nach `TEXTVORSCHLAEGE.md`. Rechtstexte bleiben wörtlich.

## K-015 Glossar (Entwurf 0.2, wird mit der Richtung ergänzt)
- **Altstand:** `main` @ f2e7eae, die Live-Seite vor dem Umbau.
- **Ausgangsstand:** a83269d, die Plattform zu Beginn dieses Laufs.
- **Element / Pass / Leitpass:** ein Teil des Altstands mit eigener Aufgabe; sein Eintrag in `atlas/paesse-*.md`; bei Doppelpässen der eine Pass, der die Arbeit trägt (die übrigen verweisen nur auf ihn).
- **Erzählseite / Arbeitsseite:** siehe K-011.
- **Signaturmoment:** Bewegung, die ein konkretes Merkmal der Marke erlebbar macht und die Austauschprobe besteht (K-009).
- **Register:** die Tabelle aller Bewegungen in K-009; jedes animierte Element trägt seine Kennung als `data-motion`.
- **Formsystem:** Grundgeometrie, Raster, Strich, Ecken und Enden aller SVGs (K-010).
- **Inverse-Band:** Abschnitt mit `data-tone="inverse"` (dunkle Fläche in hellem Thema).
- **Faktenregister:** `lib/content/facts.ts`.
- **Vorlauf / Rücklauf:** in der Heizungstechnik die warme Zuleitung (rot) und die abgekühlte Rückleitung (blau). Die Farben decken sich mit Rot und Navy des Logos.

## Weitere Abschnitte
K-001, K-003, K-005 … K-010 entstehen nach der Richtungswahl (P2).
