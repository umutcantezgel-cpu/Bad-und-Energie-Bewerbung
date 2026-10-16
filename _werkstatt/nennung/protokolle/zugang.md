# Zugang und Darstellung der Nennung (Z-07)

Kennung E3-PRUEFER-02 · Stand 2026-10-16 · Produktions-Server http://127.0.0.1:3511 (Build b0ae185 laut Auftrag; Arbeitsbaum HEAD aa4931b, darüber nur Doku) · Werkzeug zugang.mjs, Einzelmessung je Kombination (Stile und Axe sind Zustandswerte, keine Zeitwerte; kein Median nötig)

## Ergebnis

| Prüfpunkt | Ergebnis | Schwelle | Befund |
| --- | --- | --- | --- |
| axe, nur Footer (WCAG 2.2 AA) | grün | keine neuen serious oder critical | 0 Befunde in 12 Kombinationen (critical 0, serious 0, moderate 0, minor 0). E0 ebenfalls 0 |
| Kontrast der Nennung | grün | 4,5:1 | hell 8,28:1, dunkel 7,57:1, auf allen drei Seiten gleich |
| Schrift und Farbe gegen OSM-Link | grün | gleich | beide 14 px, Farbe rgb(185, 192, 232), unterstrichen, Deckkraft 1 |
| display, visibility, opacity | grün | sichtbar | inline, visible, 1 |
| Trefferfläche | grün | 24 × 24 px | 71 × 26 px in allen 12 Kombinationen |
| Überlauf je Größe | grün | kein Überlauf | Dokumentbreite gleich Fensterbreite in allen 12 |
| Tastaturfokus | grün | Umriss sichtbar | solid 3 px, rgb(134, 174, 255), :focus-visible ja, 12 von 12 |
| Überlagerung (Zusatzmessung) | grün | keine | je drei Punkte in Mitte und unten: 12 von 12 frei |

## Zahlen je Seite und Größe

| Seite | Größe | Schema | Kontrast | Trefferfläche | Fokus (Tabs) | Überlauf |
| --- | --- | --- | --- | --- | --- | --- |
| / | 390 × 844 | hell / dunkel | 8,28 / 7,57 | 71 × 26 | 98 | nein |
| / | 1440 × 900 | hell / dunkel | 8,28 / 7,57 | 71 × 26 | 115 | nein |
| /jobs | 390 × 844 | hell / dunkel | 8,28 / 7,57 | 71 × 26 | 60 | nein |
| /jobs | 1440 × 900 | hell / dunkel | 8,28 / 7,57 | 71 × 26 | 77 | nein |
| /bewerbung | 390 × 844 | hell / dunkel | 8,28 / 7,57 | 71 × 26 | 39 | nein |
| /bewerbung | 1440 × 900 | hell / dunkel | 8,28 / 7,57 | 71 × 26 | 40 | nein |

Axe lieferte je Kombination 15 bestandene Regeln (/ und /jobs) bzw. 11 (/bewerbung) ohne Befund.

## Vergleich mit E0

E0 (roh/e0/zugang.md): axe 0 Befunde, 0 Nennungen, kein Überlauf. E3: axe weiterhin 0 Befunde, eine Nennung je Seite, kein Überlauf. Keine neuen serious oder critical.

## Anmerkungen

- Accessible Name: Der Link lautet für Hilfstechnik „Coday Web (öffnet in neuem Tab)“, weil der Zusatz als sr-only im Link steht. Der sichtbare Text ist exakt „Coday Web“. Der OSM-Link trägt denselben Zusatz. Siehe OFFENE FRAGE 1.
- Fixierte Leisten (Kopfleiste oben; bei 390 px die Leiste „Jetzt bewerben“) überdecken in den Footer-Bildern andere Fußzeilen, z. B. „Büro und Verwaltung“. Die Nennungszeile ist nicht betroffen. Kein Befund nach Auftrag.

## Belege

- roh/e3b/zugang.json und roh/e3b/zugang.md (Werkzeug)
- roh/e3b/leitplanken-beleg.txt (Überlagerung, OSM-Vergleich)
- bilder/e3/*__fuss.webp (12 Footer-Bilder, siehe E3-Bericht)

## OFFENE FRAGEN

1. Soll der Accessible Name exakt „Coday Web“ lauten (dann müsste der sr-only-Zusatz weg), oder gilt der Zusatz als gewollt? Der OSM-Link hat ihn ebenfalls. Entscheidung beim Inhaber.
