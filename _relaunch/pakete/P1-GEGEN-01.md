# P1-GEGEN-01 · Rolle Gegenprüfer (frisch) · Stufe 2 · Kern-Version 0
Schreibrechte: `_relaunch/atlas/gegenpruefung-p1.md`
Umfang: Angriff auf Prioritäten, Kann-Einstufungen, Zurückstellungen und „Nicht zurückführen“/„Keine Rückführung nötig“ in allen 163 Element-Pässen.

## Rollenbriefing
Du greifst Pläne, Pässe, Prioritäten, Zurückstellungen und Ergebnisse an und suchst Lücken, Regelverstöße und Schönrechnen. Häufige Fehler: nur bestätigen; Nebensachen statt Folgenreichem; Kritik ohne Reparaturvorschlag.

## Regeln, gegen die du prüfst (Auftrag Abschnitt 8, wörtlich verbindlich)
- Muss: Recht, Funktionen mit Geschäftswert (Kontakt, Anfrage, Buchung, Rechner), Seiten und URLs mit Suchwert, belegte Vertrauenselemente, Markenzeichen, Zugänglichkeitshilfen. Soll: Inhalte mit klarem Besuchernutzen, prägende Grafiken, SVGs und Bewegungen, interaktive Elemente. Kann: Dekoration ohne eigene Aufgabe.
- Zurückstellen nur, wenn ein Mensch entscheiden muss – bei Hinweisen auf bewusste Entfernung (Commit-Nachricht, Ersatzfunktion), offenen Rechtsfragen oder nachweislich abgelaufenen Inhalten. Gesetzliche Pflichtangaben werden nie zurückgestellt. Höchstens 10 % aller Elemente zurückgestellt.
- Nichts wird still weggelassen; nichts wird erfunden (erfundene/unbelegte Inhalte des Altstands werden nicht zurückgeführt).
- „Keine Rückführung nötig“ ist nur zulässig, wenn die Aufgabe des Elements im Ausgangsstand vollständig lebt.

## Material
`_relaunch/atlas/paesse-start.md`, `_relaunch/atlas/paesse-bewerbung.md`, `_relaunch/atlas/paesse-shell-recht-seo.md`; zum Nachprüfen Altstand `_relaunch/altstand/main/`, Ausgangsstand (Repo), `docs/ROADMAP.md`, `docs/operations/fakten-abgleich.md`, Bildschirmfotos `_relaunch/belege/p0-altstand/` und `_relaunch/belege/p0-ausgangsstand/`.

## Schritte
1. Prüfe JEDE Zurückstellung (10), JEDE Kann-Einstufung, JEDES „Nicht zurückführen“ und eine Stichprobe von 20 „Keine Rückführung nötig“ (davon mindestens 8 aus der Startseite) gegen die Regeln und am Code.
2. Prüfe gezielt, ob Muss-Elemente zu niedrig eingestuft sind (Kontaktwege, Rechner, Vertrauenselemente, Markenzeichen, Zugänglichkeitshilfen, URLs/Anker mit Suchwert).
3. Ergebnis je geprüftem Pass: bestätigt | abgelehnt (+ korrigierte Einstufung, Begründung mit Fundstelle, Reparaturvorschlag).
4. Gesamturteil: Zurückstellungsquote, Zahl der Ablehnungen, Liste der folgenreichsten Korrekturen (höchstens 10).

## Ausgabe
`_relaunch/atlas/gegenpruefung-p1.md` mit Tabelle (E-ID · geprüft auf · Ergebnis · Korrektur · Begründung) und Gesamturteil. Ausgabeformular und Endzeile wie in `_relaunch/pakete/_gemeinsam-p0.md`; Kennung P1-GEGEN-01.
Kein Git, kein Build, keine Plattformdateien. Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
