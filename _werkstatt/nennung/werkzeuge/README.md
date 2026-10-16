# Prüfwerkzeuge der Agenturnennung

Node-Skripte (.mjs) ohne eigene Abhängigkeiten. Playwright (`@playwright/test`) und axe (`@axe-core/playwright`)
kommen aus dem `node_modules` des Projekts, das Node beim Hochlaufen dieses Ordners findet. Nichts wird installiert.

## Vor dem Aufruf

- Im Projekt einmal `bun install` (bun 1.4.2). Browser liegt unter `PLAYWRIGHT_BROWSERS_PATH` (`/opt/pw-browsers`); `playwright install` nie ausführen.
- Produktions-Build, kein Entwicklungsserver: `bun run build`, dann `PORT=<frei> node .next/standalone/server.js`
  (mit `.next/static` und `public` wie in den e2e-Einstellungen). Nicht Port 3400; den nutzt die e2e-Suite.
- Alle Aufrufe aus der Projektwurzel. Ausgaben gehen nach `_werkstatt/nennung/protokolle/roh/…`; dieser Ordner
  bleibt aus jedem Commit heraus. Nur ausgewählte Bilder kommen nach `_werkstatt/nennung/bilder/auswahl/`.

Gemeinsame Angaben: `--basis <Adresse>` (nur Ursprung, z. B. `http://127.0.0.1:3511`) und `--aus <Ordner>`.
Jedes Werkzeug zeigt mit `--hilfe` seine Nutzung.

## Werkzeuge

### links.mjs · Linkprüfer

Seitenliste aus Sitemap (Host `https://karriere.bad-energie.de` wird auf `--basis` umgeschrieben), Routen aus `app/`,
Build-Ausgabe `.next/server/app` und den Zusatzseiten. Je Seite zwei Abrufe, Standard und Googlebot. Ausgewertet wird
das HTML ohne JavaScript.

```
node _werkstatt/nennung/werkzeuge/links.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0
```

Ausgabe: `links.tsv` (Spalten: url, status, lang, robots, canonical, coday_footer, coday_ausserhalb, ort, href, text, rel,
target, googlebot_gleich; je Link eine Zeile, Seiten ohne Link einmal) und `links-zusammenfassung.md`.
`ort` ist `footer` oder `ausserhalb`. Ein Link gilt als gefolgt, wenn `rel` kein nofollow, sponsored oder ugc enthält.

### bilder.mjs · Bildwerkzeug

Footer-Ausschnitt (letztes `footer`-Element) und ganze Seite, je 390 × 844 und 1440 × 900, je light und dark.
Ausgabe als WebP, höchstens 1440 Pixel breit. Playwright schreibt PNG; die Wandlung läuft im Browser über Canvas.

```
node _werkstatt/nennung/werkzeuge/bilder.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0 --seiten /,/jobs
```

Dateien: `<seite>__<breite>-<schema>__fuss.webp` und `<seite>__<breite>-<schema>__seite.webp`
(Startseite heißt `start`).

### zugang.mjs · Zugänglichkeit und Darstellung

Je Seite, Größe und Schema: axe nur auf `footer` (WCAG 2.2 AA, Tags wie in `e2e/support/site.ts`), berechnete Stile der
Nennung `[data-agentur-nennung] a` (Sichtbarkeit, Deckkraft, Schrift, Farben, Kontrast nach WCAG, Klickfläche), Fokus per
Tab (höchstens 400 Mal je Link) und Seitenüberlauf.

```
node _werkstatt/nennung/werkzeuge/zugang.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0 --seiten /,/jobs --schema light,dark
```

Ausgabe: `zugang.json` und `zugang.md`. Standard für `--schema` ist `light,dark`, weil Z-07 den Kontrast in jedem Thema verlangt.

### netz.mjs · Netzwerk und Layout

Startseite, drei Läufe bei 1440 × 900, je ein neuer Browserkontext ohne Cache und ohne Service Worker. Alle Anfragen
(Methode, URL, Typ, Status) und die komprimierte Transfergröße über CDP (`Network.loadingFinished`, `encodedDataLength`).
Layoutverschiebung ohne Nutzereingabe bis 5 s nach load.

```
node _werkstatt/nennung/werkzeuge/netz.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0
```

Ausgabe: `netz.json` und `netz.md` (je Lauf, Median, Spanne und Anfragen, die nicht in allen Läufen vorkommen).

### jsonld.mjs · Strukturdaten

Alle `application/ld+json`-Blöcke je Seite, Knoten des `@graph` nach `@type`, WebSite-Knoten vollständig (auf der Konsole
und im Feld `knoten` von `jsonld.json`). Syntaxfehler werden gemeldet, nicht übergangen. Ohne `--seiten` gilt die
ganze Seitenliste.

```
node _werkstatt/nennung/werkzeuge/jsonld.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0 --seiten /
```

Vergleich mit einem früheren Stand (vor dem Lauf kopieren, sonst überschreibt der neue Lauf die alte Datei):

```
node _werkstatt/nennung/werkzeuge/jsonld.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0-nach --vergleich _werkstatt/nennung/protokolle/roh/e0/jsonld.json
```

Ausgabe: `jsonld.json` und bei `--vergleich` `jsonld-vergleich.md` (geänderte, neue und entfernte Knoten und Felder je Seite).

## Gemeinsame Datei

`gemeinsam.mjs`: Argumente, Seitenliste, Abrufe mit Standard- und Googlebot-Kennung, HTML-Entitäten, Median und Spanne,
Warten bis zur Ruhe der Seite. Keine Tests; die Werkzeuge werden nur mit Produktions-Build gegen einen laufenden Server geprüft.
