# KERN – Gestaltungssystem
Version: 1.1 (09.10.2026; 1.0 nach FREIGABE E-021, 1.1: K-004 CSP nach E-022). Maßgebliche Detailquelle für Tokens, Zeichnung und Bewegung ist der Prototyp `ausbau/richtungen/1/` (index.html, BEGRUENDUNG.md §8–§10); für `/jobs` und den Kopf der Stellenseiten `ausbau/richtungen/2/`, für das Wärmebild `ausbau/richtungen/3/` (statisch). Änderungen nur durch den Orchestrator, mit Versionsnummer und Grund.

## Das Projekt in fünf Sätzen
1. Bad & Energie in Wetzlar, SHK-Meisterbetrieb seit 1926, sucht Fachkräfte, Azubis und Quereinsteiger im Umkreis von 35 km; die Karriereseite muss in Sekunden sagen, was die Stelle bietet und wie man sich in 60 Sekunden bewirbt.
2. Beim Umbau zur Plattform gingen Elemente der alten Seite verloren; 55 Muss- und Soll-Elemente kommen im Wesen zurück, gebaut in der Sprache der Plattform und nur mit belegten Fakten.
3. Die Gestaltung macht die Marke greifbar: Das Haus aus dem Logo ist eine Heizungsanlage, der rote Vorlauf und der blaue Rücklauf sind die Farben des Logos, und jede Zusage hängt als Maß an dieser Anlage.
4. Der erste Eindruck auf dem Handy des Chefs ist eigens komponiert, ohne Fotos, aus Schrift, SVG und wenig, sinnvoller Bewegung, schnell und barrierefrei.
5. Das Ergebnis geht nach bestandenem Merge-Gate (E-021) auf `main` und ist damit live.

## K-001 Leitidee
**Jede Zusage ist eingemessen: Das Haus aus dem Logo läuft als Anlage an, die Uhr im Giebel rastet auf 13:30 ein, und der rote Vorlauf endet in deiner Bewerbung.**
Austauschprobe: Ein anderer Betrieb kann Uhr 13:30, Radius 35 km, Giebel des Logos und 1926–2026 nicht zeigen, ohne zu lügen; tragend sind die belegten Zusagen, nicht das Allerweltsbild Haus + Wärmepumpe.

## K-002 Marke, Zielgruppe, fünf Besucheraufgaben
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

## K-003 Gestaltungsprinzipien (Tun · Lassen)
1. **Eingemessen statt behauptet.** Tun: Zahlen als Maße an der Zeichnung (Martian Mono, Maßkette, Hinweislinie), Quelle `lib/content/facts.ts`. Lassen: Kennzahl-Kacheln, hochzählende Zahlen, Superlative.
2. **Ein Leitungspaar.** Tun: Rot = Vorlauf (hin, warm, Hauptaktion), Blau = Rücklauf (zurück, kühl, Fokus); das Paar führt durch die Seiten und endet im Bewerben-Knopf. Lassen: Rot als Hervorhebung, Text oder Fläche außer dem Knopf.
3. **Zwei Stimmen.** Tun: Bricolage Grotesque spricht die Botschaft, Martian Mono spricht die Maße, Atkinson Hyperlegible Next trägt das Lesen. Lassen: eine dritte Display-Stimme, Mono im Fließtext.
4. **Handy zuerst, eigens komponiert.** Tun: Schrift in Bildgröße, Haus angeschnitten, Hauptaktion in der Daumenzone, Höhenstufen in `svh`. Lassen: gestapelten Desktop.
5. **Bewegung erzählt einmal.** Tun: ein Auftakt ≤ 1,2 s, danach Ruhe; Rückmeldung bei Berührung. Lassen: Schleifen, Scroll-Auftritte auf jedem Abschnitt, Laufbänder, Konfetti.
6. **Erzählseite inszeniert, Arbeitsseite dient.** Tun: Signatur nur auf `/` und Stellenseiten; Formulare ruhig und dicht. Lassen: Effekte im Bewerbungsflow.

## K-004 Plattformregeln
- **Technik:** Next.js 16 App Router (`proxy.ts` statt Middleware), React 19, Tailwind CSS 4.3 mit `@theme` in `app/styles/theme.css` (drei Ebenen: Primitive → semantische Rollen in `:root`/Dunkel/`[data-tone="inverse"]` → `@theme inline`-Utilities), Bun 1.4 als Paketmanager, Server-Komponenten als Standard.
- **Styling:** Komponenten nutzen nur semantische Utilities (`bg-surface`, `text-ink`, `border-line`, `text-title-2` …). Rohpaletten, Hexwerte in Klassen, `text-[…]`, freie Schatten sind per `scripts/qa/check-design-tokens.mjs` verboten (Ausnahme pro Zeile nur mit `// design-allow` und Grund). Kontraste werden per `scripts/qa/check-contrast.mjs` aus `theme.css` gerechnet – Rollenwerte bleiben reine Hexwerte. Neue Token-Namen müssen in `lib/utils/cn.ts` (`extendTailwindMerge`) eingetragen werden, sonst verschluckt `cn()` Klassen. JS-Spiegel der Bewegungswerte in `lib/tokens/index.ts`.
- **Komponenten:** `components/ui/*` (cva + `variants.ts`, `@radix-ui/react-slot` für `asChild`), Seitenrahmen `components/site/*`, Abschnitte `components/home/*`, Stellen `components/jobs/*`, Flow `components/apply/*`, Mappe `components/mappe/*`, Region `components/maps/*`, Stimmen `components/reviews/*`, Recht `components/legal/*`. Varianten statt Kopien.
- **Inhalte:** Fakten nur aus `lib/content/facts.ts` (mit Quelle, `pending` = nicht ausspielen außer wo die Basis es erlaubt), Stellen aus `lib/jobs/data/*`, Texte der Startseite aus `components/home/content.ts`. Sprache: nur Deutsch, Anrede „du“ in Recruiting-Texten.
- **Themen:** Hell/Dunkel über `prefers-color-scheme`, Druck immer hell; jedes neue Teil beherrscht hell, dunkel, Inverse-Band und Druck.
- **Tests:** Vitest (`bun run test`, 927 grün in P0), Playwright (`playwright.config.ts`: 4 Projekte mobil/Desktop × hell/dunkel, `reducedMotion: 'reduce'`, axe WCAG 2.2 AA), Guards (`check:design`, `check:contrast`, `check:client-imports`), `test:graph` (JSON-LD), Lighthouse CI (`lighthouserc.json`). Neue Funktionen bekommen Vitest- und E2E-Tests im bestehenden Muster.
- **Dateihoheit (E-012):** nie `supabase/**`, `lib/supabase/**`, `lib/uploads/**`, `app/admin/**`, `app/api/admin/**`; gemeinsame Verträge nur ergänzend mit Absprache-Eintrag.
- **Sicherheit:** CSP derzeit Report-Only in `next.config.ts` mit `'unsafe-inline'` für Skripte (ein Hash würde die Inline-Skripte von Next sperren, E-022); Hash des Kopfskripts dokumentiert in `lib/motion/head-script.ts`; Nonce-Strategie offen (M-018); keine neuen Drittanbieter.

## K-005 Typografie
- Familien (OFL, selbst gehostet über `next/font/local`, woff2 latin + latin-ext, ≤ 250 KB gesamt, zwei Schnitte vorgeladen, Ersatzschrift mit Metrik-Overrides): **Bricolage Grotesque** (Display, 800, −0,01 em), **Atkinson Hyperlegible Next** (Text 400/700), **Martian Mono** (nur Maße und Planbeschriftung; Werte Breite 75 %, Etiketten Versalien +0,06 em). Lizenzen in `app/fonts/LIZENZEN.md`. Kaufempfehlung: M-017.
- Skala: höchstens 10 Stufen, fließend per `clamp` mit rem-Anteil; Display mobil am längsten Wort („Anlagenmechaniker“) geprüft; Zeilenhöhe Display 0,92–1,05, Text 1,5–1,6; Zeilenlänge 60–75 Zeichen; `text-wrap: balance` für Überschriften, `pretty` für Absätze; `hyphens: auto`, `lang="de"`.
- Utilities: Mono und Versalien nur über semantische Klassen (`font-mass`, `text-etikett`), nie `font-mono`/`uppercase` direkt (Guard).

## K-006 Farbe (E-016)
| Rolle | hell | dunkel | Verwendung |
|---|---|---|---|
| Papier (Fläche) | #FBF7F0 | #0A1033 | Seitengrund, Dokumenthintergrund, `theme-color` |
| Wand (Fläche 2) | #F1E9DB | #131B4A | Abschnittsflächen, Hover-Flächen |
| Wärme | #FADCC9 | #47445B | Hausfüllung, warme Felder |
| Tinte | #111A3B (≈) | #F6F0E4 | Fließtext |
| Navy (Marke) | #111D6D | #F6F0E4 | Überschriften, Linien, Maße |
| Tinte 2 | #3E4885 / #454C78 | #B9C0E8 | Nebentext |
| Rot (Hauptaktion, Vorlauf) | #D60000 · Hover #B00000 · Druck #A80000 | Linie #FF6B5F, Knopf #D60000 | nur Knopffläche und Vorlauf-Linie |
| Blau (Rücklauf, Fokus) | #1F57C4 | #86AEFF | Rücklauf, Fokusring, Zweitweg-Hover |
| Erfolg | Grün nur für Erfolg | | |
Kontraste: alle Textpaare ≥ 4,5:1, Grafik/Bedienelemente ≥ 3:1 (Prüfung `scripts/qa/check-contrast.mjs`; Werte in `ausbau/richtungen/1/BEGRUENDUNG.md` §10). Inverse-Band: Navy-Fläche mit Creme-Schrift. Druck: immer helle Primitiven.

## K-007 Raster und Abstände
12 Spalten, Bundsteg `clamp(1rem, 2.2vw, 1.5rem)`, Seitenrand `clamp(1.25rem, 4vw, 4rem)`, Satzspiegel ≤ 84 rem. Abstandsskala 11 Stufen: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 96 · 128 px. Paarabstand der Leitungen `--paar` = 12 px. Benachbarte Abschnitte wechseln Struktur und Dichte (S-12); mobil eigene Komposition.

## K-008 Formen, Flächen, Tiefe
Radien 4 Stufen: 4 · 12 · 24 · 999 px (24 = äußerer Bogen eines Leitungspaars). Ecken als 45°-Fasen (Giebel), Enden rund. Ein Schatten (nur technische Brückenlücke). Tiefe durch Flächen (Papier/Wand/Wärme) und angeschnittene Zeichnung, nie durch Glas, Glow oder Verläufe.

## K-009 Bewegung
- Architektur E-013: CSS-first, `lib/motion/` (reduzierte Bewegung, hover/pointer, IntersectionObserver), Kopfskript setzt die Klasse `auftakt` vor dem ersten Rendern, 2-s-Sicherheitsnetz, CSP-Hash. Keine Bibliothek, kein WebGL (E-021).
- Tokens: Dauern `--d-1` 120 · `--d-2` 240 · `--d-3` 400 · `--d-4` 600 ms; Takt 80 ms (Verzögerungen nur als Vielfache); Kurven aus `(.16,1,.3,1)`, wechselnd `(.65,0,.35,1)`, ein `(.32,0,.67,0)`, dazu linear. Eingänge d-2/aus, Ausgänge d-1/ein.
- Register: verbindlich ist die Tabelle in `ausbau/richtungen/1/BEGRUENDUNG.md` §9 (Kennungen `luft`, `luefter`, `vorlauf-haus`, `waerme`, `ruecklauf-haus`, `erdleitung`, `erdleitung-d`, `pfeile`, `uhr`, `menue-oeffnen`, `menue-leitung`, `menue-eintrag`, `unterstrich`, `flaeche`, `druck`), ergänzt um `kreislauf-zeigen` (Wiederholung auf Knopfdruck, B R1), `fortschritt` (Leitungsstrang im Bewerbungsflow, d-2), `kreis-schliessen` (Danke-Seite, einmal, d-3), `seitenwechsel` (View Transition 250–450 ms, nur Erzählseiten). Jedes animierte Element trägt `data-motion`.
- Signaturmomente (Erzählseiten): (1) Startseite „Der Kreislauf läuft an“ (≤ 1,12 s, einmal), (2) Stellenseite „Gehalt im Heizkreis“ (Leitung zeichnet sich zur Bewerbung, V2), (3) Danke-Seite „Der Kreis schließt sich“ (Erfolg, ruhig). Reduziert: Endzustand sofort.

## K-010 SVG-Formsystem
Giebel 45° und Kreis; Raster 24 × 24 (Rand 2); eine Strichstärke 3 px (`--m-strich`, `vector-effect: non-scaling-stroke`); runde Enden, Fasen; `currentColor` und Rollen-Variablen; Linienzeichnen über Masken/`stroke-dashoffset`. Icon-Familie in `components/icons/` (ersetzt lucide), Illustrationen: Haus mit Wärmepumpe (Start), Heizkreis (Stellen), Wärmebild statisch (Wärmepumpen-Stelle), offene Leitung + Wegweiser (404), Kreis schließt sich (Danke). Dekorativ `aria-hidden`, bedeutungstragend `role="img"` + `<title>`. SVGO-Konfigurationen statisch/animiert (`_relaunch/werkzeuge/svgo.*.mjs`), keine eingebetteten Pixelbilder.

## K-011 Komponenten, Zustände, Seitenarten 
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

## K-012 Inhalte, Ton, Mikrotexte 
- **Wahrheit:** Jede Arbeitgeber-Aussage kommt aus `lib/content/facts.ts`. Dort markierte Fakten mit `pending` erscheinen nur, wo die Basis es erlaubt; `validUntil` wird beachtet (Jubiläum bis 31.12.2026). Was nicht im Register steht, wird nicht behauptet. Das gilt für Zahlen, Auszeichnungen, Zitate und Bewertungen; offene Belege stehen in MENSCHEN.md (M-003, M-007…M-015).
- **Ton:** du-Anrede, kurze Hauptsätze, Fakt vor Adjektiv („Freitags ab 13:30 Uhr Feierabend“ statt „attraktive Arbeitszeiten“). Handwerkersprache ohne Jargon-Überhöhung. Keine KI-Floskeln (S-13: „nahtlos“, „innovativ“, „ganzheitlich“, „maßgeschneidert“, „Entdecken Sie …“, „auf das nächste Level“), keine Superlative ohne Beleg.
- **Typografie im Text:** „…“ als Anführungszeichen, Gedankenstrich –, Halbgeviert für Bereiche (07:00–16:45 Uhr), geschütztes Leerzeichen vor Einheiten und in Zahl-Wort-Paaren (35 km, 13:30 Uhr, 30 Tage). `lang="de"` und `hyphens: auto` im Fließtext; weiche Trennstellen für lange Berufsnamen (`titleShy`).
- **Knöpfe sagen, was passiert:** „Jetzt in 60 Sekunden bewerben“, „Mappe als PDF speichern“, „Route in Google Maps öffnen“; nie „Absenden“, „Mehr“ oder „Klicken Sie hier“.
- **Fehlertexte:** was passiert ist, was jetzt zu tun ist, und der Direktweg (Telefon/WhatsApp mit Sabri Demir).
- **Mikrotexte** ändert der Lauf direkt (TEXTE = Mikrotexte direkt). Längere Texte gehen als Vorschlag nach `TEXTVORSCHLAEGE.md`. Rechtstexte bleiben wörtlich.

## K-013 Budgets (aus dem Auftrag, gemessen mit `_relaunch/werkzeuge/lh.mjs` und `groessen.mjs`)
Lighthouse mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms · INP ≤ 200 ms · zusätzliches JS für Bewegung ≤ 60 KB gzip (Ziel ≤ 8 KB, E-013) · Schriften ≤ 250 KB gesamt · Icon-SVG ≤ 1,5 KB (roh) · Illustrations-SVG ≤ 40 KB gzip. Ausgangswerte (P0): Perf mobil 94–96, LCP mobil 2,63–3,08 s (über Budget!), CLS 0, TBT 80–108 ms, Schriften 47 KB (eine Inter-Datei), JS je Seite 170–224 KB gzip.

Ergänzung Lauf 2 (E-018): Erzählseiten dürfen bis 120 KB gzip JS für Bewegung nutzen, nur nachgeladen; gebaut wird ohne WebGL (E-021), Ziel bleibt ≤ 8 KB. Zielreserve LCP mobil ≤ 2,2 s.

## K-014 Wünsche (verbindliche Inhaberentscheidungen, ROADMAP §1, Rang 5)
Keine KI-Funktionen · nur bestehende, belegte Fakten (kürzen/umstellen erlaubt) · keine Fotos, kein Stock, typografische Ästhetik · Gehaltsspannen sichtbar · Google-Karte + Pendelrechner, Bewerbungsmappen-Generator und Bewertungsband bleiben (neu gestaltet) · Ausbildung 2026: „Einstieg noch möglich“ · die vier Teamzitate sind echt und freigegeben · Navy als Schriftfarbe, Rot nur für die eine Primäraktion · **Farben bestätigt (E-016):** Signalrot #D60000 (Hauptaktion, Vorlauf), Marken-Navy #0C1A72–#111D6D (Überschriften, Kennzahlen, Rücklauf), Schrift tiefes Navy, helles Papier (kühl #F3F5F9 oder warm #FBF7F0), Rücklauf-/Fokusblau #1F57C4 erlaubt · Barrierefreiheit WCAG 2.2 AA (44-px-Ziele, Auswahlkarten ≥ 64 px, Hilfe immer an derselben Stelle). · **Richtung (E-019, E-021):** Startseite Variante 1 mit Teilen aus B Runde 1, Stellen Variante 2, Stellenseiten V2 + V1, Wärmepumpen-Stelle Wärmebild (V3, statisch).

## K-015 Glossar 
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

## Markierte Annahmen
- Bedeutung von `distanceKm` (Straße statt Luftlinie) – Ringe werden als „Luftlinie“ beschriftet.
- Telefon 06441 42956 ist die Nummer für Bewerber (lib/data/company.ts).
- Bricolage Grotesque bleibt, Archivo 68 % ist der vorbereitete Tausch (eine Variable).
