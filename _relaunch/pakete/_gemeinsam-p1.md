# Gemeinsame Bausteine für P1-Pakete (Verlustatlas) · Kern-Version 0 (vorläufig)

Das Projekt in fünf Sätzen, Kern-Auszug und Ausgabeformular: wortgleich aus `_relaunch/pakete/_gemeinsam-p0.md`.

## Quellen
- Altstand (Website vor dem Umbau) = Git-Stand `main` @ f2e7eae, entpackt unter `/home/user/Bad-und-Energie-Bewerbung/_relaunch/altstand/main/` (nur lesen). Läuft als Produktions-Build auf http://localhost:3600 (Achtung: dessen `middleware.ts` weist den User-Agent „HeadlessChrome“ mit 403 ab – für den Altstand `newContext(…, { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' })` verwenden; für curl `-A 'Mozilla/5.0 Chrome/141'`).
- Git-Historie des Altstands: Commits 9717265 … f2e7eae (`git -C /home/user/Bad-und-Energie-Bewerbung log main`, `git show <rev>:<pfad>` – nur lesen, nie auschecken).
- Ausgangsstand (neue Plattform) = Arbeitsbaum `/home/user/Bad-und-Energie-Bewerbung` (Commit a83269d), läuft auf http://localhost:3500.
- Bildschirmfotos: Ausgangsstand unter `_relaunch/belege/p0-ausgangsstand/` und `_relaunch/.roh/p0-ausgangsstand/webp/`; Altstand unter `_relaunch/belege/p0-altstand/` und `_relaunch/.roh/p0-altstand/webp/` (sobald vorhanden).
- Die Live-Seite https://karriere.bad-energie.de liefert derzeit den Altstand aus – NICHT abrufen (lokaler Build ist gleichwertig).

## Atlas-Format (verbindlich, eine Zeile je Element)
| A-ID | Seite | Abschnitt (Anker/Ort) | Kategorie | Element | Inhalt wörtlich | Verhalten / Funktion | Grafik / SVG | Bewegung | Fundstelle | Bild |
- A-ID: `ALT-<Bereich>-<Nr>` bzw. `NEU-<Bereich>-<Nr>` (Bereich: START, BEW, SHELL, RECHT, SEO, STELLEN, MAPPE, DANKE, FEHLER).
- Kategorie genau eine aus: Inhalt · Funktion · Navigation · Grafik und SVG · Bewegung · Vertrauen · Recht · Suche und Technik · Einbindung Dritter · Interaktives.
- Inhalt wörtlich: Überschriften, Knopf- und Linktexte, Kennzahlen, Kernsätze in Anführungszeichen (lange Fließtexte: erste 20 Wörter + „[…]“ + Wortzahl).
- Fundstelle: `pfad:zeile-zeile` (Altstand relativ zu `_relaunch/altstand/main/`, Ausgangsstand relativ zum Repo).
- Bild: Pfad zu einem passenden Bildschirmfoto-Ausschnitt, falls vorhanden; sonst „–“.
- Ein Element = ein Teil mit eigener Aufgabe (z. B. „Gehaltsrechner“, „Trust-Leiste“, „Hamburger-Morph“, „Meta-Description Startseite“). Nicht zusammenfassen, sondern auflisten. Vermutungen als „(Vermutung)“ kennzeichnen.

## Grenzen
- Schreibrechte nur auf die im Paketkopf genannten Dateien. Kein Git außer lesenden Befehlen (`log`, `show`, `diff`, `ls-tree`). Kein Build, keine Server starten/stoppen, keine Plattformdateien ändern.
- Browserläufe nur über `_relaunch/werkzeuge/lib/browser.mjs` (Anfragesperre). Keine Formularsendungen.
