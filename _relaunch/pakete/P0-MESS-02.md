# P0-MESS-02 · Rolle Messprüfer (Werkzeugbau) · Stufe 2 · Kern-Version 0 (vorläufig)
Schreibrechte: `_relaunch/werkzeuge/axe.mjs`, `_relaunch/werkzeuge/tastatur.mjs`, `_relaunch/.roh/P0-MESS-02/**`, `_relaunch/belege/P0-MESS-02/**`
Umfang: zwei Prüfskripte für Ebene 5 (Zugänglichkeit) bauen und auf der ganzen Grundmenge laufen lassen.

## Rollenbriefing
Du misst Zugänglichkeit und berichtest Zahlen mit Messbedingungen. Häufige Fehler: Einzelmessung statt vollständiger Abdeckung; Bedingungen nicht notieren; Zahlen deuten statt berichten.

## Aufgabe in einem Satz
Baue `axe.mjs` (axe-core über Grundmenge × 4 Ansichten × hell/dunkel plus Zustände) und `tastatur.mjs` (Tastaturdurchlauf mit Fokusprüfung, Reflow 320 px, Zoom 200 %, Textabstände WCAG 1.4.12, erzwungene Farben, ohne JavaScript) und erzeuge damit die Ausgangswerte.

## Das Projekt in fünf Sätzen / Kern-Auszug / Grenzen / Ausgabeformular
Siehe `_relaunch/pakete/_gemeinsam-p0.md` – gilt wortgleich.

## Maßstab
Vorhandene E2E-Tests der Plattform zeigen Selektoren und Zustände: `e2e/pages.spec.ts`, `e2e/apply.spec.ts`, `e2e/support/site.ts`, `e2e/support/flow.ts` (nur lesen). Werkzeug-Muster: `_relaunch/werkzeuge/screens.mjs`.

## Schritte
1. `axe.mjs`: Aufruf `node axe.mjs --base http://localhost:3500 --label <label> [--vps …] [--schemes light,dark] [--only …]`. `AxeBuilder` aus `@axe-core/playwright` mit Tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`. Kontext über `newContext()` aus `lib/browser.mjs` (reducedMotion 'reduce').
2. Je Seite der `GRUNDMENGE` × alle 4 `VIEWPORTS` × hell/dunkel: Seite laden, `document.fonts.ready`, durchscrollen (`scrollThrough`), axe ausführen.
3. Zusätzliche Zustände (je in m375 und d1440, hell und dunkel): (a) mobiles Menü geöffnet (Startseite, m375: Menü-Knopf im Kopf – Selektor aus `components/site/MobileNav.tsx`/`HeaderBar.tsx` ermitteln), (b) Bewerbungsflow `/bewerbung` mit ausgelöstem Pflichtfeldfehler im Kontaktschritt (Weg zum Kontaktschritt aus `e2e/support/flow.ts` übernehmen; POST wird durch die Anfragesperre mit Attrappe beantwortet – keine echte Sendung), (c) Startseite mit geöffnetem FAQ-Eintrag, (d) Region: Pendelrechner mit gewähltem Ort.
4. Ergebnis je Lauf: Verstöße mit `id`, `impact`, Anzahl Knoten, erstes Ziel-Selektor, Hilfe-URL. Ausgabe roh nach `_relaunch/.roh/<label>/axe/…json`; Zusammenfassung `_relaunch/belege/<label>/axe.json` und `axe.md` (Tabelle: Seite/Zustand × Ansicht × Schema → kritisch/ernst/mäßig/gering; Summenzeile; Liste aller unterschiedlichen Regel-IDs mit Fundstellen).
5. `tastatur.mjs`: Aufruf `node tastatur.mjs --base http://localhost:3500 --label <label>`. Je Hauptseite (`haupt: true`) in d1440 hell: bis zu 80× `Tab` drücken; je Schritt aktives Element (Tag, Text/Label, Rolle), sichtbarer Fokus (berechnete `outline-width` ≥ 2 px oder `box-shadow` sichtbar, Element im Viewport, nicht unter fixierter Kopfleiste verdeckt – prüfe `getBoundingClientRect().top` gegen die Höhe von `header`), Fokusfalle (gleiches Element 3× in Folge oder Zyklus ohne Erreichen des Fußbereichs). Sprunglink als erstes Ziel? (ja/nein).
6. Reflow: jede Seite der `GRUNDMENGE` bei 320×640 (isMobile) → `overflowReport()`; Zoom 200 %: d1440 mit `document.documentElement.style.zoom='2'` bzw. Viewport 720×450 bei deviceScaleFactor 2 → `overflowReport()`; Textabstände: Stylesheet `* { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important } p { margin-bottom:2em !important }` injizieren → `overflowReport()`; erzwungene Farben: `forcedColors:'active'` → Bildschirmfoto der ersten Bildschirmhöhe je Hauptseite (WebP nach `_relaunch/belege/<label>/forced-colors/`) und Prüfung, ob Knöpfe und Links eine sichtbare Umrandung/Unterstreichung haben (berechnete Styles); ohne JavaScript: `javaScriptEnabled:false` → Seite lädt, h1 vorhanden, Hauptinhalt (main) nicht leer, keine Elemente mit `opacity:0` im ersten Bildschirm.
7. Ausgabe `tastatur.mjs`: `_relaunch/belege/<label>/tastatur.json` und `tastatur.md`.
8. Ausgangswerte erzeugen: `node axe.mjs --base http://localhost:3500 --label P0-MESS-02` und `node tastatur.mjs --base http://localhost:3500 --label P0-MESS-02`. Nenne Summen (kritisch/ernst) im Ausgabeformular.

## Selbstprüfung
- Sind alle 12 Seiten × 4 Ansichten × 2 Schemata plus Zustände abgedeckt (zähle sie)?
- Keine echte Formularsendung (Anfragesperre-Log prüfen: nur „attrappe“)?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P0-MESS-02 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
