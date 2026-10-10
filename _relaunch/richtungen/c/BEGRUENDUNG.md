# Begründung – Richtung C „Feierabend“ (Runde 1)

Stilkachel: `index.html` (eine Seite, ohne Build, ohne Fremdressourcen). Aufruf lokal: `npx http-server _relaunch/richtungen/c -p 3703`. Bildschirmfotos in `fotos/`, Bericht `fotos/bericht.json` (0 Überlauf, 0 Fehler, 0 Fremdanfragen in 12 Aufnahmen).

## Leitidee

„Dein Feierabend ist das Maß: Wir messen alles in Zeit – Tagesbogen bis 13:30 Uhr, Wege in Minuten, die Bewerbung in 60 Sekunden – und zeichnen es als Zifferblatt.“

## Ableitung aus dem Markenaspekt „Respekt vor der Zeit“

1. Bad & Energie verspricht keine Extras, sondern Zeit: freitags 13:30 Uhr, Montag bis Donnerstag 16:45 Uhr, nie weiter als 35 km, keine Fernmontage. Jede dieser Zusagen ist eine Uhrzeit oder eine Strecke in Minuten.
2. Darum ist das Zifferblatt die Grundfigur: ein Bogen für den Arbeitstag, ein Minutenbogen für jeden Arbeitsweg, eine Skala für hundert Jahre. Zahlen stehen tabellarisch wie in einem Fahrplan; die Serifenschrift mit optischer Größe trägt das Beständige, die Grotesk das Nüchterne.
3. Bewegung folgt demselben Gedanken: Der Bogen läuft genau einmal bis 13:30 Uhr und rastet ein. Alles andere steht still, weil Hast das Gegenteil des Versprechens wäre.

## Austauschprobe: Warum passt das zu keinem Wettbewerber?

Setzt man den Einstieg bei einem anderen SHK-Betrieb ein, endet der Bogen dort nicht freitags um 13:30 Uhr, enden die Ringe nicht bei 35 km und beginnt die Skala nicht 1926. Das Motiv wäre Dekoration ohne Beleg. Ein Betrieb mit Wochenend-Notdienst oder Fernmontage könnte „Dein Feierabend ist das Maß“ nicht ehrlich zeichnen. Ersetzt man 13:30 durch 17:00, bleibt ein hübscher Kreis ohne Aussage. Die Idee trägt nur, weil jede Zeitangabe eine belegte Zusage dieses Betriebs ist (Faktenregister: `friday1330`, `workingHours`, `radius35`, `noFarAssembly`, `founded1926`, `anniversary100`).

Der Ausgangspunkt dieser Richtung ist allein der Markenaspekt „Zeit“; den Vergleich mit den Richtungen A und B führt die Jury.

## Was die Kachel zeigt und warum

| Teil | Inhalt | Besucheraufgabe (K-002) |
|---|---|---|
| Erster Bildschirm | Eyebrow „Seit 1926 · Wetzlar“, H1 „SHK-Jobs in Wetzlar.“ mit „Ehrliches Handwerk. Pünktlich Feierabend.“, `HERO.lead`, Hauptaktion „Jetzt bewerben“ (einziges Rot), Mikrotext, Kennzahlen 13:30 · 30 · 35 km · 1926 | 1 (Arbeitszeiten, Lohn über Tarif, Ausstattung), 3 (Hauptaktion, 60 Sekunden, kein Lebenslauf) |
| Tagesbogen | 24-Stunden-Zifferblatt: Mo–Do 07:00–16:45 gepunktet, Fr 07:00–13:30 als durchgezogener Bogen mit Zeiger (Signaturmoment), danach „Uhr Feierabend“ und der Abendbogen | 1 |
| Kennzahlen | 13:30 als Blickfang in der Mitte des Zifferblatts; 30, 35 km, 1926 als ruhige Zeittafel (kein Kachelraster, keine Zählanimation) | 1, 4 |
| Jahresleiste | 101 Teilstriche 1926 → 2026, „100 Jahre Meisterbetrieb (1926–2026)“ (gültig bis 31.12.2026) | 4 |
| Offene Stellen | Vier Stellen mit Gehaltsspanne (aus `lib/jobs/data`) auf einer gemeinsamen Skala 0–6.000 €; Arbeitszeiten als Einleitung | 1 |
| Einsatzgebiet | Beispielabschnitt mit zurückgeführtem Element: Radius-Umschalter 15 / 25 / 35 km (E-START-033) und Pendelrechner mit Entfernung und Fahrzeit (E-START-039), zehn echte Orte aus `lib/data/locations.ts` | 2 |
| Ablauf und Bewerbung | Die drei echten Schritte (`lib/content/process.ts`), Diskretionszusage, Telefon, Erreichbarkeit, zweite Hauptaktion | 3, 5 |
| Gestaltungssystem | Leitidee, Schriften, Palette mit gerechneten Kontrasten, Raster, Formsystem mit acht Piktogrammen, Bewegungsregister, Zustände | – |

Das zurückgeführte Element folgt dem Wesen, nicht der Form: Der Altstand zeigte eine Google-Karte mit Schaltern; die Kachel zeigt dieselbe Aufgabe („Was liegt in 15, 25, 35 km, und wie lange fahre ich?“) als Zifferblatt: Ringe statt Kartenkacheln, ein Zeiger zum gewählten Ort, ein Minutenbogen für die Fahrzeit. Orte werden äquirektangulär um Wetzlar (50,565 / 8,498) projiziert. Weil `distanceKm` Straßenkilometer sind, liegt jeder Ort innerhalb des Rings seiner Entfernung (Luftlinie ≤ Straße). Die Radien 15 und 25 sind nur Zoomstufen (Hinweis im Text); die Zusage bleibt 35 km. Ohne JavaScript bleibt die Tabelle samt statischer Karte lesbar.

## Schriftwahl

- **Newsreader** (Display, Ziffern): Serife mit echter optischer Größe (6–72). Große Ziffern bekommen feine Haarlinien, kleine Größen robuste Formen; das passt zu „Uhr“ und zu 100 Jahren Beständigkeit, ohne nach Verlag oder Luxus zu klingen. Ziffern sind von Haus aus tabellarisch (Breite 0,55 em), Doppelpunkt schmal: 13:30 und 07:00 stehen in Spalten wie in einem Fahrplan. Nicht Fraunces und nicht Playfair, weil beide zu ausgestellt wirken und im KI-Einheitslook häufig sind.
- **Hanken Grotesk** (Text, Bedienung): nüchtern, offene Formen, gute Lesbarkeit auf kleinen Schirmen, enger Kontrast zur Serife. Keine dritte Familie, keine Monospace (Code-Marken in der Dokumentation nutzen die Systemschrift für Festbreite).
- 222,5 KB gesamt (Budget 250 KB). Abweichung: Newsreader latin-ext ohne optische Größe (36,2 statt 86,6 KB), siehe `LIZENZEN.md`. Ersatzschriften mit `size-adjust` (107 % Times, 99 % Arial, gemessen am deutschen Beispieltext).
- Skala: 8 von 10 Schriftgrößen, alle `clamp` mit rem-Anteil, größtes Verhältnis Maximum/Minimum 2,4 (Ziffer) bzw. 2,1 (H1). Zeilenhöhe Display 0,95–1,1, Fließtext 1,5–1,6; `text-wrap: balance` und `pretty`, `hyphens: auto`, `lang="de"`.

## Palette (Rollen, Hexwerte, gerechnete Kontraste; Tag / Abend)

| Rolle | Tag | Abend | Einsatz |
|---|---|---|---|
| Papier | #F6F2E9 | #0B1230 | Fläche |
| Papier tief | #ECE6D8 | #131C46 | Zifferblatt, Band |
| Tinte | #0C1A72 | #F1ECE0 | Schrift, Bögen, Linien (Logo-Navy) |
| Tinte leise | #454E84 | #A9B0D2 | Zweitext |
| Skala | #6A73A8 | #7F89C0 | Teilstriche, Ringe |
| Abend | #8A5300 | #F0B650 | Feierabend: Bogen und Wort |
| Signal | #D60000 | #D60000 | nur die eine Hauptaktion |
| Haarlinie | #D4CDBB | #27316A | dekorativ |

Kontrast Tag / Abend: Tinte auf Papier 13,36 / 15,58 · Tinte auf Papier tief 12,00 / 13,89 · Tinte leise auf Papier 7,02 / 8,59 · auf Papier tief 6,31 / 7,66 · Abend-Schrift auf Papier 5,66 / 10,07 · auf Papier tief 5,09 / 8,98 · Signal-Text auf Signal 5,44 / 5,44 · Signal gegen Papier 4,87 / 3,38 · Skala auf Papier 4,06 / 5,46 · auf Papier tief 3,64 / 4,87. Alle Werte erzeugt der Generator beim Bauen; axe (WCAG 2.2 AA) meldet 0 Verstöße in Hell/Dunkel bei 375 und 1440 px.

Der Abend ist eine eigene Komposition: Nachtblau als Fläche, die Tinte wird Papier, das Ocker wird Bernstein; das Inverse-Band (Ablauf) wird im Abend zum hellen Papierband, am Tag zum Nachtblau-Band. Das Logo steht am Abend unverändert auf heller Plakette.

## Bewegung (Register in der Kachel, Kennung als `data-motion`)

`bogen-lauf` (Signatur, 1.100 ms, wechselnd), `bogen-rast` (Rückmeldung, Start nach 1.100 ms, Ende nach 1.580 ms), `jahre-auftritt` (640 ms, einmal beim Scrollen), `radius-wahl` und `ort-wahl` (je 320 ms), `taste` (160 ms), `bogen-probe` (Wiederholung im System-Teil). Nur `transform`, `opacity`, `stroke-dashoffset` (mit `pathLength="1"`) und ein `clip-path` für die Jahresleiste. Reduzierte Bewegung: Endzustand sofort (das Inline-Skript setzt die Startklasse dann gar nicht). Sicherheitsnetz 2 s, ohne JavaScript alles sichtbar. Ein einziger Scroll-Auftritt (Jahresleiste) bei sieben Abschnitten (S-02 eingehalten), kein Loop, kein Blinken, kein Scroll-Hijacking. Bewegungs-JS insgesamt 5,8 KB roh (inklusive Pendelrechner, Raster-Schalter, Wiederholknopf).

## Formsystem

Grundgeometrie Kreis und Bogen, Raster 24, eine Strichstärke (1,5 von 24 Einheiten = 2 px bei 32 px; große Zeichnungen 2 px per `vector-effect`), alle Enden und Ecken rund, `currentColor`, ein Sprite (`symbol` + `use`). Acht Piktogramme: Wärmepumpe, Bad, Heizung, Werkzeug, Servicefahrzeug, Uhr, Standort, Nachricht (je unter 0,5 KB). Trenner: Jahresleiste; derselbe Strichrhythmus rahmt Zifferblatt (96 Viertelstunden) und Karte (24 Stunden).

## Risiken

- Die Uhr-Metapher kippt leicht ins Uhrmacherhafte. Gegenmittel: echter Inhalt auf jeder Skala, Logo und Handwerkstexte im Vordergrund, kein Chrom, keine Schatten.
- Das 24-Stunden-Zifferblatt ist ungewohnt. Eine Fußzeile erklärt es („oben 12 Uhr, unten Mitternacht“); Zahlen stehen zusätzlich im Klartext und in der Legende.
- Rot ist auf eine Fläche je Ansicht begrenzt, die Seite wirkt dadurch ruhig. Der Ocker/Bernstein-Ton ist eine dritte Farbe außerhalb von Navy und Rot (er erinnert an die Sonne im Logo); Entscheidung des Inhabers offen.
- Schriftlast: Newsreader mit optischer Größe ist 132 KB. Mit Preload und metrikgleicher Ersatzschrift unkritisch, bei LCP auf schwachen Verbindungen zu messen (die H1 ist das LCP-Element und startet nie unsichtbar).
- Das Inline-Skript im Kopf (Startklasse, Sicherheitsnetz) braucht in der Plattform einen CSP-Hash (K-004).
- Die Hauptaktion verlinkt auf die Plattformroute `/bewerbung`; in der Kachel ohne Seite dahinter.
- Kartenfläche: Orte liegen eng am Firmensitz, bei 35 km bleibt der Kern dicht (nur freistehende Orte tragen eine Beschriftung, die Tabelle nennt alle). Dafür der Radius-Umschalter als Zoom.
- Lange Seite mobil (ca. 21.000 px); die Dokumentation ist im Betrieb nicht Teil der Seite.

## Übertragbarkeit auf Arbeitsseiten (Bewerbungsflow, Stellenliste)

Arbeitsseiten sind ruhig, dicht, schnell: kein Signaturmoment, keine Auftritte beim Scrollen. Übertragen wird die Sprache, nicht die Inszenierung:
- **Bewerbungsflow:** Fortschritt als Minutenbogen (Ring wie in der Fahrzeitanzeige, Füllung per Zustandswechsel 320 ms), Auswahlkarten als Segmentschalter mit 44-px-Zielen, tabellarische Ziffern für Telefon und Zeiten, Fehlertext mit Ursache, nächstem Schritt und Direktweg (Telefon). Rot nur für „Weiter“/„Bewerbung senden“.
- **Stellenliste (/jobs):** die Gehaltsspannen-Zeilen aus dem Start (gemeinsame Skala, Titel, Spanne, Arbeitszeit), mit Zuständen für Hover, Fokus und Aktiv.
- **Danke-Seite:** der einzige Bogen, der einrastet (bestätigt, blockiert nie), danach Ruhe.
- Hell/Abend, Inverse-Band und Druck (immer hell) sind schon in den Rollen angelegt.

## OFFENE FRAGEN

1. Soll der Ton Ocker/Bernstein („freie Zeit“) als dritte Akzentfarbe zugelassen werden, oder genügt Navy plus Rot mit einer Tintenabstufung?
2. Was bedeutet `isCoreZone` fachlich („Kernzone“)? Die Kachel nennt es nur als Datenbezeichnung neben dem Ort.
3. Nur vier der fünf Stellen zeigen eine Spanne (für Quereinsteiger und Montagehelfer enthält `lib/jobs/data` keinen Wert). Soll die Liste die fünfte Stelle ohne Spanne führen?
4. Brutto oder netto? Die Plattform nennt „€ / Monat“; die Kachel übernimmt das unverändert.
5. Soll die Überschrift „Was du verdienst. Wann du Feierabend hast.“ als Mikrotext direkt gelten oder als Vorschlag nach `TEXTVORSCHLAEGE.md` (sie ist eine Umformulierung der Fakten Gehaltsspannen und `workingHours`, keine neue Aussage)? Neu formuliert sind außerdem „Arbeitsweg prüfen“ und der Hinweis zu den Zoomstufen.
6. Newsreader latin-ext ohne optische Größe (Budget): akzeptabel, oder lieber Budget auf 275 KB anheben?
