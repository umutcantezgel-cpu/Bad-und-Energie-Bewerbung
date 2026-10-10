# P0-MESS-01 · Rolle Messprüfer (Werkzeugbau) · Stufe 2 · Kern-Version 0 (vorläufig)
Schreibrechte: `_relaunch/werkzeuge/lh.mjs`, `_relaunch/werkzeuge/groessen.mjs`, `_relaunch/.roh/P0-MESS-01/**`
Umfang: zwei Messskripte für Ebene 6 (Leistung) bauen und je einmal probelaufen lassen.

## Rollenbriefing
Du misst Leistung und Größen und berichtest Zahlen mit Messbedingungen. Häufige Fehler: Einzelmessung statt Median aus fünf; Bedingungen nicht notieren; Zahlen deuten statt berichten.

## Aufgabe in einem Satz
Baue `lh.mjs` (Lighthouse mobil und Desktop, Median aus N Läufen je URL) und `groessen.mjs` (JS-, CSS-, Schrift- und SVG-Größen je Seite gegen die Budgets) als wiederverwendbare Prüfwerkzeuge.

## Das Projekt in fünf Sätzen / Kern-Auszug / Grenzen / Ausgabeformular
Siehe `_relaunch/pakete/_gemeinsam-p0.md` – gilt wortgleich.

## Maßstab
Vorhandene Konfiguration der Plattform: `lighthouserc.json` (Kategorien, `--no-sandbox`). Vorhandenes Werkzeug-Muster: `_relaunch/werkzeuge/screens.mjs` (Argumente `--base`, `--label`, Ausgabe nach `_relaunch/.roh/<label>` und Zusammenfassung nach `_relaunch/belege/<label>/…json`).

## Schritte
1. `lh.mjs`: Aufruf `node lh.mjs --base http://localhost:3500 --label <label> [--runs 5] [--forms mobile,desktop] [--only start,stellen]`. Nutzt die Node-API von `lighthouse` (programmatisch) mit `chrome-launcher`-freiem Weg: Chromium über `CHROME` aus `lib/browser.mjs` per `--remote-debugging-port` starten oder `lighthouse`’ eigenen Launcher mit `chromePath` = `CHROME` und Flags `--headless=new --no-sandbox --disable-dev-shm-usage`. Standard-URLs: alle `GRUNDMENGE`-Einträge mit `haupt: true`.
2. Mobil = Lighthouse-Standard (simulierte Drosselung, Moto-G-Profil); Desktop = `formFactor: 'desktop'`, `screenEmulation` 1350×940, desktop-throttling (Werte aus lighthouse `constants.throttling.desktopDense4G` bzw. dem Desktop-Preset).
3. Je URL × Formfaktor N Läufe (Standard 5) **nacheinander**, nie parallel. Erfasse je Lauf: Performance-, Accessibility-, Best-Practices-, SEO-Score (0–100), FCP, LCP, CLS, TBT, Speed Index, TTI, Gesamtübertragung (Bytes), Anzahl Requests, Drittanbieter-Bytes (Hosts ≠ localhost), LCP-Element (Selektor/Snippet).
4. Median je Kennzahl über die N Läufe; zusätzlich min/max. Rohberichte (JSON) nach `_relaunch/.roh/<label>/lh/<slug>-<form>-<n>.json`; Zusammenfassung nach `_relaunch/belege/<label>/lighthouse.json` und als Markdown-Tabelle nach `_relaunch/belege/<label>/lighthouse.md` (Spalten: Seite, Formfaktor, Perf, A11y, BP, SEO, LCP s, CLS, TBT ms, SI s, Bytes KB; Kopf mit Datum, Chromium-Version, N, Drosselung).
5. Budgetvergleich in der Markdown-Zusammenfassung: Perf mobil ≥ 90, LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms → je Zeile „ok“/„über Budget“.
6. `groessen.mjs`: Aufruf `node groessen.mjs --base http://localhost:3500 --label <label>`. Für jede `GRUNDMENGE`-Seite (Ansicht d1440, hell) per Playwright alle Antworten mitschneiden (`page.on('response')`), nach Typ gruppieren (script, stylesheet, font, image/svg, document) und je Datei die übertragene Größe sowie die gzip-Größe (selbst per `zlib.gzipSync` auf den Body berechnet) erfassen. Pro Seite Summen je Typ; global: Summe aller eindeutigen Schriftdateien (Budget ≤ 250 KB), größte JS-Dateien (Top 10), alle SVG-Antworten mit Größe (Icon-Budget 1,5 KB / Illustration 40 KB gzip) und Anzahl inline-`<svg>` im DOM.
7. Ausgabe `groessen.mjs`: `_relaunch/belege/<label>/groessen.json` und `groessen.md` (Tabellen je Seite und global, Budgetspalte).
8. Probelauf: `node lh.mjs --base http://localhost:3500 --label P0-MESS-01 --runs 1 --only start` und `node groessen.mjs --base http://localhost:3500 --label P0-MESS-01`. Ausgaben dürfen in `_relaunch/belege/P0-MESS-01/` landen; nenne die Pfade.

## Muster (nicht zum Abschreiben)
```js
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher'; // Teil der lighthouse-Abhängigkeiten
const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ['--headless=new','--no-sandbox'] });
const r = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: [...] }, config);
```

## Selbstprüfung
- Läuft `lh.mjs` ohne Fehler und schreibt JSON + MD? Sind Mediane korrekt (bei N=1 gleich dem Wert)?
- Läuft nichts parallel? Sind Messbedingungen (Chromium-Version, Drosselung, N, Datum) im Kopf?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P0-MESS-01 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
