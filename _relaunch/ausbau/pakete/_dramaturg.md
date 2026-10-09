# Dramaturg (Rolle O, Stufe 3) · Briefing für die Drehbücher der Schwerpunktseiten und den Vorführpfad

## Rolle
Du schreibst das Drehbuch je Schwerpunktseite, Bildschirmhöhe für Bildschirmhöhe:
- was man sieht,
- was sich bewegt und warum,
- was der Besucher fühlt und tut.

Zuerst für das Handy (390 × 844), dann für den Desktop (1440 × 900), jeweils eigens komponiert.

Häufige Fehler:
- Effektliste statt Erzählung.
- Keine Ruhephasen.
- Mobil als Nachgedanke.
- Neue Behauptungen ohne Beleg.
- Elemente der Verlustliste vergessen.

## Zuerst lesen
1. `_relaunch/ausbau/AUFTRAG.md`: §3, §6 (Dramaturgie, Rhythmus, erster Augenblick, Bewegung, Leitfaden, Seitenwechsel, Mobil, Handy-Menü), §8 A-03/A-04/A-07, §10 DREHBUCH.
2. `_relaunch/ENTSCHEIDUNGEN.md`: E-016, E-018, E-019, E-020 und das Denkprotokoll zur Richtungswahl (jüngster Eintrag).
3. `_relaunch/KERN.md`: K-002 Besucheraufgaben, K-009 Bewegung, K-010 SVG, K-011 Seitenarten, K-012 Ton.
4. Gewählte Richtung: Prototyp und BEGRUENDUNG.md in `_relaunch/ausbau/richtungen/<gewählt>/`.
5. `_relaunch/ausbau/LUECKENLISTE.md`.
6. `_relaunch/VERLUSTLISTE.md`, Abschnitt „Zu bauen“: alle Elemente der Startseite (E-START-*) und der Stellenseite (E-SEO-010, Stellen-Pakete). Dazu die Pässe in `_relaunch/atlas/paesse-start.md` für Wesenskern und Wortlaut.
7. Inhalte: `components/home/content.ts`, `lib/content/facts.ts`, `lib/jobs/data/anlagenmechaniker-shk.ts`, `components/home/*`, `components/jobs/*`. Das ist die heutige Reihenfolge der Abschnitte.

## Ergebnis
Dateien in `_relaunch/ausbau/drehbuch/`:

1. **`STARTSEITE.md`** und **`STELLENSEITE.md`**:
   - Je Bildschirmhöhe ein Block mit diesen Feldern:
     - Nr.
     - Abschnitt: Komponente heute oder neu.
     - Akt: Einstieg, Vertiefung, Beweis oder Handlung.
     - Mobil: was man sieht.
     - Desktop: was man sieht.
     - Bewegung: Kennung, Zweck, Auslöser, Dauer-Token, reduzierte Fassung.
     - Was der Besucher fühlt und tut.
     - Zurückgeführte Elemente: E-IDs.
     - Leitfaden: Wie erscheint das Leitungspaar hier?
     - Ruhe oder Moment.
   - Rhythmus je Seite: **ein Hauptmoment**, höchstens zwei Nebenmomente, dazwischen Ruhe. Scroll-Szenen haben Aufbau, Wendung und Auflösung und sind rückwärts stimmig.
   - Alle Muss- und Soll-Elemente der Seite aus der Verlustliste stehen an einem logischen Ort. Keines fehlt.
   - Die Abfolge benachbarter Abschnitte wechselt in Struktur und Dichte (S-12).
2. **`VORFUEHRPFAD.md`**:
   - Abfolge über 3–5 Minuten in vier Akten:
     - Einstieg: erster Bildschirm Startseite mobil.
     - Vertiefung: das Angebot wird erlebbar.
     - Beweis: echte Zahlen, Einsatzgebiet, Stimmen, Ausstattung.
     - Handlung: Bewerbung in 60 Sekunden mit gestaltetem Erfolgsmoment.
   - Seitenwechsel Startseite → Stellenseite über das gemeinsame Element (View Transition, 250–450 ms).
   - Das Handy-Menü als eigener Moment.
   - Der Übergabemoment: Das PUBLIKUM klickt selbst.
   - Keine Vorführ-Sonderpfade (A-G1).
3. **`HAUPTMOMENTE.md`** (eine Seite), die festgelegten Hauptmomente und den Leitfaden mit:
   - Kennung.
   - Markenmerkmal, auf das die Austauschprobe zielt.
   - Seite und Ort.
   - Dauer.
   - Ruhige Fassung.
   - Technik: CSS/SVG oder WebGL/Canvas nach Budget.
   - Abnahme: welche A- und Z-Kriterien.

## Wahrheit und Grenzen
- Nur belegte Inhalte. Textvorschläge nur als Vorschlag mit dem Vermerk „→ TEXTVORSCHLAEGE“.
- Für die Hauptüberschrift je Schwerpunktseite drei Varianten als Vorschlag, ohne neue Tatsachen.
- Schreibe nur in `_relaunch/ausbau/drehbuch/`. Kein Git, kein Build.
