# P0-SLOP-02 · Rolle Slop-Jäger (weiche Befunde) · Stufe 2 · Kern-Version 0
Schreibrechte: `_relaunch/belege/p0-slop-weich/slop-weich.md`, `_relaunch/belege/p0-slop-weich/slop-weich.json`
Umfang: Ausgangszählung der weichen Slop-Befunde S-08 bis S-14 über die ganze Grundmenge (12 Seiten) in allen Ansichten.

## Rollenbriefing
Du prüfst Code und Bildschirmfotos gegen den Slop-Katalog. Häufige Fehler: Geschmack statt Katalog; Befund ohne Fundstelle; Begründungen aus der Leitidee übergehen.

## Aufgabe in einem Satz
Zähle je Seite der Grundmenge die weichen Slop-Befunde S-08 bis S-14 mit Fundstelle (Bildausschnitt und/oder Datei:Zeile), damit Z-07 einen belastbaren Ausgangswert hat.

## Das Projekt in fünf Sätzen / Kern-Auszug / Grenzen / Ausgabeformular
Siehe `_relaunch/pakete/_gemeinsam-p0.md` – gilt wortgleich. Es gibt noch keine Leitidee (KERN v0); daher gilt im Ausgangsstand keine Begründung als anerkannt.

## Slop-Katalog (weich, wörtlich aus dem Auftrag)
- S-08 weich · Standard-Look eines Frameworks oder einer Komponentenbibliothek: Standardschrift als einzige Schrift, Standardradien und -schatten überall.
- S-09 weich · Klischees ohne Grund: generische Verläufe (besonders Violett-Blau), Verlaufstext, Glaseffekte, Leuchtkugeln, Aurora-Hintergründe, Partikel, Funkeln, Leuchtrand-Karten, Nachlaufcursor, Logo-Laufband, hochzählende Kennzahlen, Badge über der Einstiegsüberschrift, Corporate-Memphis-Figuren, Klangeffekte.
- S-10 weich · Austauschbarer Einstieg: zentrierte Überschrift, Unterzeile und zwei Knöpfe vor abstraktem Hintergrund.
- S-11 weich · Karten-Einerlei: gleichförmige Karten mit Icon, Überschrift und zwei Zeilen als vorherrschendes Muster; Bento-Raster ohne inhaltliche Logik.
- S-12 weich · Gleichtakt auf Erzählseiten: drei oder mehr aufeinanderfolgende Abschnitte mit gleicher Struktur und Dichte, kein klarer Blickfang.
- S-13 weich · KI-Floskeln wie „nahtlos“, „innovativ“, „ganzheitlich“, „maßgeschneidert“, „Entdecken Sie …“, „auf das nächste Level“.
- S-14 weich · Generische Bildanmutung: Stock- oder KI-Ästhetik, Bildfehler, uneinheitliche Bildbearbeitung.

## Quellen
- Bildschirmfotos: `_relaunch/belege/p0-ausgangsstand/*.webp` (Hauptseiten in allen Ansichten hell+dunkel, übrige Seiten m375/d1440 hell) und `_relaunch/.roh/p0-ausgangsstand/webp/*.webp` (übrige Ansichten). Dateiname: `<seite>__<ansicht>-<schema>__<nr>.webp`.
- Code: `app/`, `components/`, `lib/content/`, `lib/jobs/data/`, `app/styles/theme.css`, `app/globals.css`, `app/layout.tsx` (Schriften).

## Schritte
1. Lies `app/styles/theme.css`, `app/globals.css`, `app/layout.tsx` (Schriftwahl) und die Komponentenbibliothek `components/ui/*` – Grundlage für S-08 (einzige Schrift? Standardradien/-schatten überall?).
2. Für jede der 12 Seiten (start, stellen, stelle-anlagenmechaniker, stelle-kundendienst, stelle-obermonteur, stelle-ausbildung, bewerbung, bewerbung-danke, bewerbung-mappe, datenschutz, impressum, fehler-404): sieh dir alle Ausschnitte in d1440-light und m375-light an (Read-Werkzeug), bei Hauptseiten zusätzlich t768-light und d1440-dark.
3. Zähle je Seite jede Instanz von S-08 bis S-14. Eine Instanz = ein konkretes Vorkommen mit Ort (Ausschnitt-Datei + Bildbereich und, wo möglich, Komponente Datei:Zeile). S-08 höchstens einmal je Seite; S-12 je Folge von ≥ 3 gleichförmigen Abschnitten einmal; S-11 je Kartenraster einmal; S-13 je Floskel-Vorkommen (zusätzlich Code-Suche in `components/`, `lib/content/`, `lib/jobs/data/`, `app/` nach: nahtlos, innovativ, ganzheitlich, maßgeschneidert, „Entdecken Sie“, „nächste Level“, „Mehrwert“, „Synergie“, „State of the Art“, „modernste“, „erstklassig“, „rundum“, „Rundum-sorglos“).
4. Schreibe `slop-weich.json` (`{ seiten: { <slug>: [ { id: "S-11", ort: "…", komponente: "…", beschreibung: "…" } ] }, summe_je_id: {…}, summe: n, je_hauptseite: {…} }`) und `slop-weich.md` (Tabelle Seite × S-08…S-14 mit Summen; darunter alle Befunde mit Ort).
5. Kein Geschmack: Nur zählen, was eine Katalog-Definition erfüllt; Grenzfälle als OFFENE FRAGE mit Ort.

## Selbstprüfung
- Alle 12 Seiten bewertet? Jeder Befund mit Ort?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P0-SLOP-02 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
