# Richtung B · „Haus & Kreislauf“ · Begründung (Runde 1)

Stilkachel: `_relaunch/richtungen/b/index.html` (eine Seite, eigenständig, ohne Build; Port 3702). Bildschirmfotos in `fotos/`, Schriftlizenzen in `LIZENZEN.md`.

## 1. Leitidee (ein Satz)

> Bei uns schließt sich jeder Kreis: Die Wärme geht ins Haus und kommt zurück, du fährst zur Baustelle und bist pünktlich wieder zu Hause.

## 2. Ableitung aus dem Markenaspekt „Energie fürs Zuhause“

1. Das Logo ist ein Haus mit Giebel, und seine zwei Farben sind die Leitungsfarben der Heizungstechnik: Rot ist der Vorlauf, der die Wärme ins Haus bringt, Blau ist der Rücklauf, der zurückkehrt. Darum bedeuten Rot und Blau auf jeder Seite „hinaus“ und „zurück“ (warm und kühl).
2. Die Zusagen des Betriebs sind selbst geschlossene Kreise: höchstens 35 km, keine Fernmontage, freitags ab 13:30 Uhr Feierabend. Deshalb zeigt die Uhr im Giebel 13:30, der Wegweiser nennt 35 km, und die Kennzahlen hängen wie Messwerte an der Anlage statt in vier gleichen Kacheln.
3. Aus Giebel (45°) und Kreis wächst das Formsystem: Ecken sind 45°-Fasen, Enden sind rund, jede Linie ist gleich stark, die vier Logo-Elemente Flamme, Tropfen, Sonne und Luft sind Grundfiguren aus genau diesen zwei Formen.

Eine Fügung trägt die Idee zusätzlich: Die Uhr auf 13:30 hat den Stundenzeiger bei 45°, also in der Richtung der Dachschräge. Der Zeiger der Giebeluhr verlängert sich im Hero zur Hinweislinie zur Kennzahl „13:30“.

## 3. Austauschprobe: Warum passt das zu keinem Wettbewerber?

Der geschlossene Kreis ist hier ein belegtes Versprechen (Quelle `lib/content/facts.ts`: radius35, noFarAssembly, friday1330, founded1926), keine Dekoration. Ein Betrieb mit Montage im ganzen Land, Wochenend-Notdienst oder offenem Einsatzgebiet könnte die Uhr im Giebel und den Wegweiser nicht zeigen, ohne zu lügen. Setzt man einen anderen Namen ein, bleibt nur ein Bild aus Haus und Wärmepumpe, und das wäre austauschbar: Es trägt erst durch 13:30, 35 km und das Haus aus dem Logo. Das ist die ehrliche Schwachstelle der Richtung (siehe Risiken).

## 4. Wie die Kachel die Besucheraufgaben unterstützt (KERN K-002)

| Aufgabe | Wo in der Kachel |
|---|---|
| 1 Stelle finden und verstehen | „SHK-Jobs in Wetzlar.“ mit den vier veröffentlichten Stellen aus `lib/jobs/data` samt Gehaltsspanne in Zeilen statt Karten; Arbeitszeit als Wochenbalken (Mo–Do 07:00–16:45, Fr 07:00–13:30). |
| 2 Arbeitsweg prüfen | Abschnitt „35 km um Wetzlar. Keine Fernmontage.“: Radius-Umschalter 15 / 25 / 35 km, Ortswahl mit Entfernung und Fahrzeit (10 echte Orte aus `lib/data/locations.ts`), Karte mit Vorlauf und Rücklauf zum gewählten Ort, Tabelle ohne JavaScript, Telefonnummer für fehlende Orte. |
| 3 In 60 Sekunden bewerben | Eine rote Hauptaktion „Jetzt bewerben“ im Hero, daneben „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“; sie ist auf Mobil ohne Scrollen sichtbar. |

## 5. Schriftwahl

- Display: Bricolage Grotesque (variabel, wght 200–800, opsz 12–96, OFL). Die optische Größenachse trägt bei 100 px die kräftigen, leicht eigenwilligen Formen einer Hausbeschriftung und öffnet sich bei kleinen Größen. H1 in Gewicht 800 mit negativer Laufweite, Kennzahlen als Zahlen in Display-Schrift.
- Text: Atkinson Hyperlegible Next (variabel, wght 200–800, OFL). Für Gehalt, Zeiten und Orte, oft am Telefon gelesen, zählt Eindeutigkeit der Zeichen (Il1, O0) mehr als Charakter; die Null trägt einen Schrägstrich.
- Monospace: IBM Plex Mono 400 nur für Kennungen, Hexwerte und Tokens der Dokumentation.
- Dateien: 6 woff2 (latin und latin-ext je Familie), zusammen 188.768 Byte (184,3 KB bei 1 KB = 1024 Byte, Budget 250 KB), zwei Dateien vorgeladen, Ersatzschriften mit gemessenem size-adjust, ascent-override und descent-override.
- Schriftstufen: 8 fließende Stufen (clamp mit rem-Anteil), größte Spanne 2,22 (große Zahl), die H1 liegt bei 2,0, nirgends über 2,5.

## 6. Palette und Kontrast

Zwei Markenfarben mit Bedeutung (Navy = Tinte; Rot = Vorlauf und Hauptaktion; Blau = Rücklauf und Radius) und drei Flächen: Putz (Wand), Kaltfläche (draußen), Wärmefläche (drinnen, innerhalb des Radius). Hell: Putz #FBF7F0, Navy #111D6D, Rot #D60000 (die Hauptseite nutzt #111D6D und #D60000), Blau #1F57C4. Dunkel neu gemischt: Nachtblau #0A1033, Creme #F6F0E4, Koralle #FF5A4D, Himmelblau #7FAAFF; das Logo steht unverändert auf einer hellen Plakette.

Alle Kontrastwerte werden beim Bau der Seite aus den Hexwerten berechnet und stehen in der Tabelle (19 Paare, hell und dunkel). Text: mindestens 5,44:1 (weiß auf Rot, hell) und 6,01:1 (dunkel); Grafiken und Bedienelemente: mindestens 3,69:1 hell (Rand gegen Kaltfläche) und 4,66:1 dunkel. axe-core 4.13 (WCAG 2 A, AA, 2.1, 2.2 AA, Best Practice): 0 Verstöße in vier Ansichten (1440 und 375, hell und dunkel).

## 7. Raster

12 Spalten, Bundsteg 16–24 px, Seitenrand 20–64 px, Satzspiegel höchstens 84 rem, Abstandsskala 10 Stufen (4–128 px). Die Abschnitte wechseln bewusst: Hero 6 | 6 mit Szene bis in den Rand, Stellen als Kopfband mit voller Liste, Gebiet 6 | 6 mit klebender Karte und einer Dachspitze, die die Oberkante durchbricht. Mobil (375 px) ist eine eigene Komposition: Szene angeschnitten, Kennzahlen als Strang mit Abgängen statt Beschriftungen im Bild.

## 8. SVG-Formsystem

Giebel 45° und Kreis, Raster 24 × 24 (Rand 2), eine Strichstärke (2 von 24 Einheiten; auf der Seite fest 3 px über non-scaling-stroke, auch in Szene, Karte, Trennern), runde Enden, Fasen statt harter Ecken, currentColor. Acht Icons in einer Familie (Wärmepumpe, Bad/Tropfen, Heizung/Flamme, Werkzeug, Servicefahrzeug, Uhr/Feierabend, Standort, Nachricht, je 113–352 Byte) plus vier Schnittstellenzeichen; Trenner „Giebel“ und „Heizkreis“, Muster „Firstreihe“. Die Hero-Szene ist 3,0 KB (1,2 KB gzip).

## 9. Bewegung (Register steht in der Kachel)

Signaturmoment im hero (nur Erzählseite): der Kreislauf läuft einmal durch (Luft, Lüfter, roter Vorlauf, Haus füllt sich mit Wärme, blauer Rücklauf), 1.360 ms, danach Ruhe. Auf dem Telefon steht die Szene unter dem Falz und läuft einmal, sobald sie zu 60 % im Bild ist. Erneut nur über den Knopf „Kreislauf zeigen“. Reduziert: kein Startzustand, Endzustand sofort; der Knopf blendet die Zeichnung in 240 ms über. Weitere Bewegung nur als Folge einer Nutzeraktion: Karte zoomt auf den Radius, Ring und Fläche blenden ein, die Schlaufe zum gewählten Ort zeichnet sich (Vorlauf hin, Rücklauf zurück), Druck-Rückmeldung. Tokens: 4 Dauern (120, 240, 400, 700 ms), 1 Staffelabstand (60 ms), 2 Kurven. Technik: nur transform und opacity sowie Strichzeichnen über Masken (stroke-dashoffset mit pathLength; mit non-scaling-stroke ist pathLength in Chromium unzuverlässig, deshalb Masken). Keine Schleife, kein Scroll-Auftritt, kein Zähler. Skripte: 0,2 KB (Kopf) + 0,8 KB (Kreislauf) + 4,9 KB (Pendelrechner), ohne Bibliothek.

## 10. Risiken

1. Austauschbarkeit des Bildes: Haus plus Wärmepumpe allein wäre ein Allerweltsmotiv; die Richtung steht und fällt damit, dass Uhr 13:30, Wegweiser 35 km und 1926 echte Fakten bleiben. Ändert sich eine Zusage, muss die Szene mitziehen.
2. Rot-Regel: Der Auftraggeber will Rot nur für die Hauptaktion; diese Richtung nutzt Rot zusätzlich als Linie (Vorlauf, Hinweg), nie als Fläche oder Textfarbe. Das ist die zentrale Auslegung und braucht eine Entscheidung (OFFENE FRAGE 1).
3. Schriftpaarung: Bricolage Grotesque ist 2024–2026 verbreitet. Der Charakter entsteht durch Gewicht 800, optische Größe, enge Laufweite und die Zahlen als Gestaltungsmittel, nicht durch den Namen der Schrift. Fällt das bei der Jury als „Standardlook mit neuer Schrift“ auf, bietet der Schriftpool Alternativen (z. B. Gabarito, Rethink Sans).
4. Karte: Die Kreise sind ungefähre Luftlinien-Radien; die Orte werden nach `distanceKm` (vermutlich Straßenentfernung) einsortiert (OFFENE FRAGE 2). Es gibt nur 10 Orte; fehlende Orte führen zum Telefon.
5. Mobil beschneidet die Szene (Sonne, Wegweiser entfallen); die Kennzahlen stehen dort als Liste. Das ist gewollt, aber die Szene wirkt kleiner.
6. Der Randkontrast von Bedienelementen auf der Kaltfläche liegt knapp über 3:1 (3,69:1).

## 11. Übertragbarkeit auf Arbeitsseiten und weitere Erzählseiten

- Bewerbungsflow (`/bewerbung`, Arbeitsseite, ruhig, keine Signaturmomente): der Fortschritt als Strang aus der mobilen Kennzahlenleiste (eine Linie, Knoten: erledigt gefüllt mit Haken, aktuell als Ring, offen hohl; Zustandswechsel in 240 ms ohne Szene). Felder mit sichtbarer Beschriftung, Rand 2 px, Fokus 3 px; Fehler und Erfolg mit Zeichen und Text (siehe Zustände in der Kachel). Hauptaktion je Schritt ist der Wegweiser-Knopf, einmal je Ansicht; „Zurück“ als Textknopf. Auswahlfelder wie die Orts-Chips, mit Haken im gewählten Zustand.
- Danke-Seite: dieselbe Zeichnung, aber als stehendes Bild im Endzustand (Vorlauf und Rücklauf verbunden), ohne Bewegung.
- Stellenliste (`/jobs`): die Zeilen aus der Kachel mit Titel, Gehalt und Pfeil; Filter als Chips; keine Szene.
- Stellenseite (`/jobs/[slug]`, Erzählseite): Szene als Kopfbild mit der jeweiligen Anlage (Kundendienst: Wärmepumpe; Bad: Tropfen), eingebetteter Pendelrechner, Wochenbalken, Gehalt sichtbar.
- Startseite: Vorlage ist die Kachel; das Dach über dem Einsatzgebiet bleibt der einzige Strukturbruch.
- 404 (kleiner Charaktermoment): der Wegweiser zeigt ins Leere, die Rohrleitung endet offen; der Kreis ist nicht geschlossen. Eine Zeile Text und der Rückweg zur Startseite.
- Rechtstexte: reine Typografie auf Putz, Tinte und Fokus, ohne Zeichnung.

## 12. Offene Fragen

1. Rot als Linie: Ist „Rot nur für die eine Hauptaktion“ auf Flächen und Text begrenzt, oder darf der Vorlauf als dünne rote Linie in Zeichnungen stehen? Rückfall: Vorlauf in Navy mit Strichmuster, Rot nur am Knopf (verliert die Bedeutung warm/kalt).
2. `distanceKm` in `lib/data/locations.ts`: Straßenkilometer oder Luftlinie? (Herborn 24 km gegenüber etwa 19 km Luftlinie spricht für Straße.) Bestimmt die Beschriftung der Radien.
3. Telefonnummer (06441) 42956 aus `lib/data/company.ts` für „Dein Ort steht nicht in der Liste?“: Ist das die Nummer für Bewerber (Sabri Demir)?
4. Stellenliste: Die Quereinstiegsstelle (`funnel_only`) steht ohne Gehaltsspanne nicht in der Liste; soll sie auf der Startseite erscheinen?
5. Links der Kachel zeigen auf Plattformrouten (`/bewerbung`, `/jobs/<slug>`) und lösen im statischen Server der Kachel nicht auf.
6. Fehler- und Erfolgstexte in den Zustandsmustern („Angekommen.“, „Telefonnummer prüfen.“) sind Muster, keine Freigabetexte; endgültige Texte gehören in TEXTVORSCHLAEGE.md.

## 13. Messwerte der Kachel (Stand Runde 1)

- `fotos/bericht.json` (Werkzeug `kachel-fotos.mjs`, 4 Ansichten, hell und dunkel, voll und reduziert): 12 Aufnahmen, 144 Ausschnitte, 0 Überlauf, 0 Fehler, 0 Fremdanfragen.
- axe-core: 0 Verstöße (1440 und 375, hell und dunkel). html-validate: 0 Befunde.
- Layoutverschiebung (CLS) 0, größtes Element der Ansicht ist die H1 (lokal ca. 0,2 s); Hero-Text wird nie unsichtbar gesetzt.
- Ohne JavaScript: Endzustand der Szene, Tabelle der Orte sichtbar, Umschalter und Knopf ausgeblendet. Mit reduzierter Bewegung: keine Animation, Endzustand sofort.
- Schriften 188.768 Byte (184,3 KB), HTML 116 KB roh (27 KB gzip), Szene 3,0 KB, Karte 5,6 KB, Skripte 5,9 KB.
