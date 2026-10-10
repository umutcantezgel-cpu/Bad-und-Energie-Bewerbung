# P0-SLOP-01 · Rolle Slop-Jäger (Werkzeugbau, harte Befunde) · Stufe 2 · Kern-Version 0 (vorläufig)
Schreibrechte: `_relaunch/werkzeuge/slop-hart.mjs`, `_relaunch/werkzeuge/svg-pruefung.mjs`, `_relaunch/werkzeuge/meta.mjs`, `_relaunch/werkzeuge/svgo.static.config.mjs`, `_relaunch/werkzeuge/svgo.animiert.config.mjs`, `_relaunch/.roh/P0-SLOP-01/**`, `_relaunch/belege/P0-SLOP-01/**`
Umfang: drei Prüfskripte (Slop hart, SVG, Suche/Wege) und zwei SVGO-Konfigurationen bauen und die Ausgangswerte erzeugen.

## Rollenbriefing
Du prüfst Code und gerenderte Seiten gegen den Slop-Katalog. Häufige Fehler: Geschmack statt Katalog; Befund ohne Fundstelle; Begründungen aus der Leitidee übergehen.

## Aufgabe in einem Satz
Baue reproduzierbare Prüfskripte für die harten Slop-Befunde S-01 bis S-07, für SVG (Ebene 8) und für Suche und Wege (Ebene 7) und erzeuge damit die Ausgangszählung.

## Das Projekt in fünf Sätzen / Kern-Auszug / Grenzen / Ausgabeformular
Siehe `_relaunch/pakete/_gemeinsam-p0.md` – gilt wortgleich.

## Slop-Katalog (harte Befunde, wörtlich aus dem Auftrag)
- S-01 hart · Erfundenes oder Platzhalter: Lorem ipsum, Beispieltexte, Platzhalter-Logos, erfundene Zahlen, Stimmen oder Auszeichnungen.
- S-02 hart · Effektteppich: Scroll-Auftritte auf mehr als der Hälfte der Abschnitte einer Seite; Parametervarianten zählen als derselbe Effekt.
- S-03 hart · Unzugänglich: Text unter AA-Kontrast, fehlender sichtbarer Fokus, Information nur über Hover oder Farbe.
- S-04 hart · Gemischte Bildsprache: Icons aus mehreren Familien, Emojis als Gestaltungsmittel, uneinheitliche Strichstärken.
- S-05 hart · Ungeordnete Werte: Farben, Abstände, Radien, Schatten, Schriftgrößen oder Bewegungswerte außerhalb der Tokens – gemessen per Lint gegen freie Werte (auch Klassen wie p-[13px] und Zahlen in Dauern) und per getComputedStyle-Stichprobe; ausgenommen Unantastbares, Einbettungen und Bildinhalte.
- S-06 hart · Halbe Zustände: interaktive Elemente ohne Hover-, Fokus-, Lade-, Fehler- oder Leerzustand, wo er vorkommen kann.
- S-07 hart · Blockierender Auftakt: Vorlader, Intro oder Zähler, die Inhalt oder Scrollen zurückhalten.

## Maßstab
Vorhandener Design-Guard: `scripts/qa/check-design-tokens.mjs` (Regeln für freie Werte) und Tokens in `app/styles/theme.css` (nur lesen). Werkzeug-Muster: `_relaunch/werkzeuge/screens.mjs`.

## Schritte
1. `slop-hart.mjs` – Aufruf `node slop-hart.mjs --base http://localhost:3500 --label <label>`; zwei Teile:
   a) Code-Scan über `app/`, `components/`, `lib/` (ohne `__tests__`, ohne `*.test.ts`): S-01 Treffer für `lorem|ipsum|placeholder|platzhalter|beispiel@|max mustermann|alexander koch|dummy|todo:|xxx` (Fundstelle Datei:Zeile); S-04 Liste aller importierten Icon-Quellen (`lucide-react`-Importe mit Icon-Namen, eigene SVG-Komponenten) und alle `strokeWidth`/`stroke-width`-Werte; S-05 alle Tailwind-Klassen mit eckigen Klammern (`-[`), Inline-`style={{…}}` mit px/ms/Farbwerten, `duration-[`, `delay-[`, Hexwerte in TSX, `transition: … <zahl>ms` in CSS außerhalb von `app/styles/theme.css`; S-07 Treffer für `preloader|loader-screen|intro|splash|countUp|count-up|odometer`.
   b) Gerenderte Prüfung je `GRUNDMENGE`-Seite (d1440 und m375, hell, reducedMotion 'no-preference'): S-01 sichtbarer Text auf Platzhalter-Muster; S-02 Anzahl der `section`/Abschnitte mit beim Scrollen startender Animation (vor/nach `scrollThrough` per `document.getAnimations()` und Elemente mit `opacity < 1` oder `transform` ≠ none im Ruhezustand außerhalb des ersten Bildschirms) – Anteil an allen Abschnitten; S-03 axe-Regel `color-contrast` (nur diese, mit @axe-core/playwright) plus Prüfung `:focus-visible` an den ersten 15 fokussierbaren Elementen (sichtbare outline ≥ 2 px); S-04 Emojis im sichtbaren Text (Unicode-Property `\p{Extended_Pictographic}`), Anzahl unterschiedlicher `stroke-width`-Werte in inline-SVGs; S-05 `getComputedStyle`-Stichprobe von 60 Elementen je Seite (font-size, border-radius, box-shadow, color, background-color, transition-duration) gegen die Werte, die in `app/styles/theme.css` als Tokens definiert sind (Datei parsen; px aus rem mit 16 px); S-06 je Knopf/Link/Feld: existiert ein `:hover`- und `:focus-visible`-Stil (per CSSOM-Durchsuchung der Stylesheets nach Selektoren mit `:hover`/`:focus-visible` oder Tailwind-Klassen `hover:`/`focus-visible:` am Element bzw. Vorfahren mit `group-hover:`), Formularfelder mit `aria-invalid`-Fehlerdarstellung vorhanden?; S-07 ist 300 ms nach `domcontentloaded` Inhalt im ersten Bildschirm sichtbar (h1 mit opacity 1) und `document.body` scrollbar?
   Ausgabe: `_relaunch/belege/<label>/slop-hart.json` und `slop-hart.md` (Zählung je S-Kennung, je Seite, mit Fundstellen).
2. `svg-pruefung.mjs` – Aufruf `node svg-pruefung.mjs --base http://localhost:3500 --label <label>`: je `GRUNDMENGE`-Seite (d1440 hell) alle inline-`<svg>` im DOM: hat `viewBox`?, Breite/Höhe, `aria-hidden` oder `role="img"`+`title`/`aria-label(ledby)`?, Strichstärken, Füllungen (currentColor/Variable vs. fester Farbwert), Quelle (Klasse `lucide`/`lucide-*` = Bibliothek), alle `id`-Attribute in SVGs → Dubletten im DOM (Kollisionen). Dazu alle `.svg`-Dateien unter `public/` und `components/` (Datei, Größe roh/gzip, viewBox, eingebettete Bitmaps `<image`, Text als Pfad?). Fixpunkt-Prüfung: Jede Datei mit der passenden SVGO-Konfiguration optimieren und vergleichen (Datei unverändert = Fixpunkt). Ausgabe `_relaunch/belege/<label>/svg.json` und `svg.md`.
3. `svgo.static.config.mjs` und `svgo.animiert.config.mjs` nach Auftrag Abschnitt 7: Statisch = preset-default ohne `removeViewBox` und ohne `removeTitle`, `removeUnknownsAndDefaults` mit `keepRoleAttr: true`. Animiert = zusätzlich ohne `mergePaths`, `collapseGroups`, `convertShapeToPath`, und `cleanupIds` mit `preserve` (Liste per Export erweiterbar). SVGO 4 ist installiert (Achtung: in v4 ist `removeViewBox` nicht mehr Teil von preset-default – prüfe und dokumentiere).
4. `meta.mjs` – Aufruf `node meta.mjs --base http://localhost:3500 --label <label> [--alt-urls datei.json]`: je `GRUNDMENGE`-Seite: Statuscode, `<title>` (Länge), meta description (Länge), canonical, robots-meta, `og:*`, `twitter:*`, `hreflang`, JSON-LD (parsebar? `@type`-Liste), h1-Anzahl, alle Bilder mit fehlendem/leerem `alt` (dekorative mit `alt=""` gesondert), alle internen Links (`a[href^="/"]`, `a[href^="#"]` auf Zielexistenz geprüft, `/…`-Ziele per GET Status). Sitemap `/sitemap.xml` und `robots.txt` lesen; Abgleich Sitemap ↔ Grundmenge. Optional `--alt-urls`: JSON-Liste alter Pfade und Anker (z. B. `/#gehalt`), je Pfad Status ohne Weiterleitung folgen (`maxRedirects: 0`), Ziel bei 30x, und bei Ankern Existenz der ID auf der Zielseite. Ausgabe `_relaunch/belege/<label>/meta.json` und `meta.md`.
5. Ausgangswerte: alle drei Skripte mit `--label P0-SLOP-01` gegen http://localhost:3500 laufen lassen. Für `meta.mjs` die Datei `_relaunch/.roh/P0-SLOP-01/alt-urls.json` anlegen mit: `/`, `/bewerbung`, `/bewerbung?tab=quiz`, `/bewerbung?tab=vault`, `/bewerbung?tab=form`, `/bewerbung?tab=dossier`, `/bewerbung?direct=true`, `/datenschutz`, `/datenschutz#bewerberdaten`, `/impressum`, `/llms.txt`, `/llms-full.txt`, `/298d966b7e4f4a43981cb8e30da6b5b5.txt`, `/#express-funnel`, `/#stellen`, `/#gehalt`, `/#karriere-paket`, `/#benefits`, `/#ausstattung`, `/#wechsel-prozess`, `/#einsatzgebiet`, `/#bewertungen`, `/#kontakt`, `/#faq`.

## Selbstprüfung
- Jede Zählung hat Fundstellen (Datei:Zeile oder Seite + Selektor)?
- Keine Geschmacksurteile – nur Katalog-Regeln?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P0-SLOP-01 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
