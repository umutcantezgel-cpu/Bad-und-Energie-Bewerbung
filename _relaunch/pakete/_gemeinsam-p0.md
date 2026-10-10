# Gemeinsame Bausteine für P0-Pakete (Kern noch nicht geschrieben – Kern-Version 0, vorläufig)

## Das Projekt in fünf Sätzen (vorläufig bis KERN v1 in P2)
1. karriere.bad-energie.de ist das Karriere- und Bewerbungsportal der Bad & Energie GmbH, eines SHK-Meisterbetriebs aus Wetzlar (gegründet 1926, 15 Mitarbeitende).
2. Die Plattform (Next.js 16, React 19, Tailwind 4, Bun) wurde zu einer Recruiting-Plattform umgebaut; dabei gingen Elemente der früheren Seite verloren und die Oberfläche wirkt generisch.
3. Der Lauf „Rückführung und Veredelung“ holt die verlorenen Elemente im Wesen zurück und hebt Gestaltung, Bewegung und SVG auf Auszeichnungsniveau.
4. Alles wird gemessen – Slop, Jury, Barrierefreiheit, Leistung, Bewegung, SVG – und nichts Bestehendes darf brechen.
5. Inhalte sind echt: keine erfundenen Zahlen, Stimmen oder Siegel; keine Fotos, Charakter entsteht aus Schrift, Komposition, SVG und Bewegung.

## Kern-Auszug (vorläufig, K-013 Budgets aus dem Auftrag)
- K-013: Lighthouse mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms · INP ≤ 200 ms · Bewegungs-JS ≤ 60 KB gzip · Schriften ≤ 250 KB · Icon-SVG ≤ 1,5 KB · Illustrations-SVG ≤ 40 KB gzip.
- Ansichten: 375×812 · 768×1024 · 1440×900 · 1920×1080 (Konstante `VIEWPORTS` in `_relaunch/werkzeuge/lib/browser.mjs`).
- Grundmenge: Konstante `GRUNDMENGE` in derselben Datei; Hauptseiten = Einträge mit `haupt: true`.

## Grenzen für alle P0-Werkzeugpakete
- Schreibrechte ausschließlich auf die im Kopf genannten Dateien unter `_relaunch/werkzeuge/` und `_relaunch/.roh/<paketkennung>/`.
- Keine Änderung an Plattformdateien, an `lib/browser.mjs`, an `package.json` der Werkzeuge (fehlt eine Abhängigkeit: als OFFENE FRAGE melden). Installiert sind: playwright 1.56.1, @axe-core/playwright 4.13.0, lighthouse 13.5.0, pixelmatch 7.1.0, pngjs 7.0.0, sharp 0.34.4, svgo 4.0.0.
- Jeder Browserlauf über `launch()` / `newContext()` aus `_relaunch/werkzeuge/lib/browser.mjs` (Anfragesperre G5: keine echten POST/PUT/PATCH/DELETE, keine Tracking-Hosts, keine fremden Hosts). Chromium liegt unter `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- Die Plattform läuft als Produktions-Build auf http://localhost:3500 (nicht neu starten, nicht bauen). Den Server nicht beenden.
- Keine Commits, kein Git, kein `next build`, keine Netzwerkzugriffe außer localhost.
- Ausgaben in Deutsch; Skripte als ES-Module (.mjs), Node 22, ohne TypeScript-Build.
- Tests messen, sie sind nicht das Ziel; Zahlen berichten statt deuten; Messbedingungen notieren.

## Ausgabeformular (Antwort an den Orchestrator)
GEÄNDERTE DATEIEN · WAS UND WARUM · TESTS UND ERGEBNIS · BILDBELEGE · OFFENE FRAGEN · RISIKEN
Letzte Zeile: === ENDE [Kennung] · BEREIT ZUR RÜCKGABE ===
