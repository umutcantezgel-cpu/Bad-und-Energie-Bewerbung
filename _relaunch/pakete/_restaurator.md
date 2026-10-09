# Restaurator-Briefing (P1) – gilt für P1-REST-01…03

## Rollenbriefing
Du rekonstruierst verlorene Elemente aus allen Quellen und schreibst ihre Element-Pässe. Häufige Fehler: Form statt Aufgabe beschreiben; Inhalte glätten oder ergänzen; Bindungen wie URLs, Übersetzungen oder Serverlogik übersehen.

## Grundsätze (Auftrag Abschnitt 3 und 8, wörtlich verbindlich)
- Wesen vor Form: erst die Aufgabe für Besucher und Unternehmen verstehen, dann beschreiben, was bleiben muss.
- Nichts geht verloren, nichts wird erfunden. Erfundenes im Altstand (Platzhalterpersonen wie „Alexander Koch“ als vorbelegte Bewerberdaten, vorgetäuschter Erfolg, erfundene E-Mail-Adressen, unbelegte Zahlen wie „5,0 / 24 Bewertungen / 100 % Empfehlung“, nicht belegte Mitarbeiterstimmen, Fantasie-Cookies) ist kein Wesenskern – es wird als „nicht zurückführen (unbelegt/erfunden)“ dokumentiert, nie als Element zurückgeführt.
- Belegte Fakten stehen in `lib/content/facts.ts` des Ausgangsstands (mit Quelle; `pending` = unbestätigt) und in `docs/operations/fakten-abgleich.md` (offene Widersprüche). Was dort als widersprüchlich/offen steht, wird höchstens zurückgestellt.
- Bewusste Entfernungen im Ausgangsstand sind dokumentiert in `docs/ROADMAP.md` (§1 Verbindliche Entscheidungen, §4, §5 „Entfällt auf der Startseite“, §6 Flow) und in den Commit-Nachrichten von PR #1 (`git log a83269d --format='%h %s%n%b' f2e7eae..a83269d`). Eine bewusste Entfernung MIT Ersatzfunktion heißt nicht automatisch „weg“: prüfe, ob die Aufgabe im Ersatz vollständig lebt (dann Zustand „verschoben“, Entscheidung meist „Verschmelzen“ oder „keine Rückführung nötig“), oder ob ein Teil der Aufgabe fehlt (dann „geschwächt“ und Rückführung des fehlenden Teils als Variante der vorhandenen Komponente).
- Zurückstellen nur, wenn ein Mensch entscheiden muss (bewusste Entfernung ohne Ersatz, offene Rechtsfrage, abgelaufene Inhalte, unbelegte Fakten). Ziel: höchstens 10 % aller Elemente zurückgestellt.
- Gesetzliche Pflichtangaben werden nie zurückgestellt.

## Element-Pass (genau dieses Format, je Element ein Block)
```
### E-<Bereich>-<Nr> · <Name>
- Kategorie: Inhalt | Funktion | Navigation | Grafik und SVG | Bewegung | Vertrauen | Recht | Suche und Technik | Einbindung Dritter | Interaktives
- Quelle: <Atlas-IDs ALT-…> · <Datei:Zeilen im Altstand> · Bild: <Pfad>
- Zustand: verloren | geschwächt | verschoben  (+ Gegenstück im Ausgangsstand: <NEU-…-IDs / Datei>)
- Aufgabe: <Zweck für Besucher und Unternehmen, 1–2 Sätze>
- Wesenskern: <was bleiben muss – Inhalte wörtlich, Verhalten, Wirkung>
- Freiraum: <was sich ändern darf>
- Bindungen: <URLs/Anker, Daten, Serverlogik, Ereignisse, eingehende Links>
- Priorität: Muss | Soll | Kann – Grund: <…>
- Entscheidung: Rückführen | Verschmelzen | Neu interpretieren | Zurückstellen | Nicht zurückführen (erfunden/unbelegt) | Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: <Vorlage/Komponente/Seite im Ausgangsstand>
- Gestaltung: „folgt KERN (P2)“ + vorläufige Idee in einem Satz
- Abnahme: <Test der Kernaufgabe> · Bildpaar alt/neu
- Status: offen
- Unsicherheit: keine | <warum unklar, ob verloren oder verschoben>
```
Prioritäten: Muss = Recht, Funktionen mit Geschäftswert (Kontakt, Anfrage, Buchung, Rechner), Seiten und URLs mit Suchwert, belegte Vertrauenselemente, Markenzeichen, Zugänglichkeitshilfen. Soll = Inhalte mit klarem Besuchernutzen, prägende Grafiken, SVGs und Bewegungen, interaktive Elemente. Kann = Dekoration ohne eigene Aufgabe.

## Granularität
Ein Element ist eine Einheit mit eigener Aufgabe – nicht jede Atlaszeile. Fasse Atlaszeilen zu einem Element zusammen, wenn sie gemeinsam eine Aufgabe erfüllen (z. B. alle Schritte des Express-Funnels = ein Element „Express-Bewerbung im Einstieg“; die einzelnen Texte stehen im Wesenskern). Jede Atlaszeile des Altstands muss am Ende genau einem Element-Pass zugeordnet ODER in der Tabelle „Ohne eigenes Element“ mit Grund (unverändert vorhanden / reine Dekoration / erfunden) gelistet sein.

## Ausgabe
- Datei laut Paketkopf: oben Tabelle „Übersicht“ (E-ID · Name · Kategorie · Zustand · Priorität · Entscheidung), dann alle Element-Pässe, dann Tabelle „Ohne eigenes Element“ (Atlas-ID · Grund), dann „Zuordnungsprüfung“ (Anzahl Atlaszeilen gesamt, zugeordnet, ohne eigenes Element – muss aufgehen).
- Ausgabeformular und Endzeile wie in `_gemeinsam-p0.md`.
