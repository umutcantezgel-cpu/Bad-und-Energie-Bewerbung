# Richtung B · „Haus & Kreislauf“ · Begründung (Runde 2)

Stilkachel: `_relaunch/richtungen/b/index.html` (eine Seite, eigenständig, ohne Build; Port 3702). Bildschirmfotos in `fotos/`, Schriftlizenzen in `LIZENZEN.md`. Dieser Text ersetzt die Fassung von Runde 1; jede Aussage ist gegen die Seite geprüft.

## 0. Was sich in Runde 2 geändert hat

| Befund Runde 1 | Maßnahme |
|---|---|
| Rot an Klammer, Vorlauf, Wärmewellen, Trenner, Ortspunkt, Kurve, Fehler-Icon (Regelverstoß) | Rückfall umgesetzt: Rot steht nur noch an der einen Hauptaktion (Knopf). Hinweg durchgezogen in Navy, Rückweg gestrichelt in Blau, Wärme als Fläche. Gemessen: außerhalb des Knopfes (und der Farbmuster der Dokumentation) kommt in keinem Element ein Rotwert vor (siehe §6, OFFENE FRAGE 1). |
| H2 „Keine Fernmontage.“ bei 320 px abgeschnitten, `overflow-x: clip` versteckte es | `overflow-x: clip` entfernt, kein `nowrap` mehr in den H2-Zeilen, weiche Trennstelle „Fern­montage“, `--t-6` ab 28 px, Zeilen der Unterzeile brechen unter 24 rem um. 320 × 568 gemessen: scrollWidth 320, 0 abgeschnittene Texte; 320 steht als Ansicht `m320` in `fotos/bericht.json`. |
| Logo-Link 36–40 px hoch | Link-Fläche statt Bild vergrößert (`min-height: var(--m-ziel)`, Bild unverändert): 219 × 48 px (1440), 197 × 44 px (375); dunkel 243 × 48 und 221 × 44 mit Plakette. |
| Leerzeichen zwischen Zahl und Einheit | Beim Bau werden alle Zahl-Einheit- und Zahl-Wort-Paare auf U+00A0 gesetzt (HTML, SVG-Beschreibungen, Skripte). Geprüft per Suche: 0 Treffer mit gewöhnlichem Leerzeichen. |
| S-05: Schriftgrößen, Maße, Dauern außerhalb der Tokens | 7 Schriftstufen, alle gemessenen Schriftgrößen liegen auf der Skala (kleinste 14 px). `.mono` nutzt `--t-1`, die `cqw`-Größen sind entfallen, 11 Maße als `--m-*`, Gaps in `--a-*`, Dauern nur aus 6 Tokens; die Sperrzeit des Knopfes und das Sicherheitsnetz liest das Skript aus den Tokens. |
| Quellenabweichungen | Erklärtext zur Wärmepumpe, „ruf kurz an“, Firmenname im Fuß und der Ortsbeschreibungstext (Tippfehler „Wohn und Gewerbegebiet“) sind entfallen; Quelle je Zeile in §10. Stellenliste und Telefonnummer stehen mit Quelle und als OFFENE FRAGE 3 da. |
| Austauschprobe des Signaturmoments nicht bestanden | Szene und Leitidee neu auf Arbeitsweg und Feierabend gebunden (§1 bis §3, §9). Wärmepumpenschema, Lüfter und Erklärtext sind gestrichen. |
| Startzustand: Aufblitzen mobil | `kl-bereit` wird im Kopf auf allen Breiten gesetzt (außer bei reduzierter Bewegung), der Lauf startet über einen Beobachter, sobald die Zeichnung zu 30 % im Bild ist. Gemessen auf 375 × 812, 390 × 844, 360 × 740 und 1440 × 900: Der erste Frame zeigt den Startzustand, kein Rücksetzen, kein Endzustand vor dem Lauf. |
| Mobil als eigene Komposition | Zeichnung läuft über die volle Breite, Haus, Uhr, 13:30 und der ganze Weg stehen im ersten Bildschirm (375 × 812); die übrigen drei Kennzahlen folgen als Strang. Kopfleiste zweizeilig mit Stellen, Einsatzgebiet und Telefon; eine Bewerben-Leiste läuft unten mit. |
| 13:30 so laut wie die H1 | Zahlen höchstens `--t-6` (48 px), 13:30 größte, die übrigen `--t-5`; H1 100 px. |
| Laufweite eng, Zeichen berühren sich | H1 −0,01 em, Zeilentitel und H2 −0,015 em, Zahlen −0,02 em; bei 100 px und 52 px geprüft. |
| `.leitsatz` erzwang opsz 96 | Entfernt; die optische Größe stellt überall der Browser (`font-optical-sizing: auto`). |
| Schriftmuster, Palette, Kontraste, Register mobil unlesbar | Stufen: Etikett und Muster in zwei Zeilen; Palette, Kontraste, Register und Schriftdateien als gestapelte Blöcke (Definitionslisten) unter 44 rem, Tabellen darüber; Kennungen brechen mit `overflow-wrap: anywhere` nur als letzte Stufe, die Kennungsspalte ist 12,5 rem breit. |
| Fotos decken die Kachel nur teilweise | Zusätzlich zu den Ausschnitten des Werkzeugs: Ansicht `m320` und gezielte Elementfotos je Abschnitt (siehe §14). |
| „Alle Orte als Tabelle“ wirkt wie Überschrift | Eigene Aufklapp-Zeile mit Rahmen, Pfeil (`tabelle-pfeil`) und Hover; auf Desktop offen. |
| Ortskacheln mit umbrechenden Zeilen | Zwei Spalten mit gleich hohen Zeilen, Entfernung und Fahrzeit als zwei nicht umbrechende Werte mit Abstand. |
| Dokumentation stimmte nicht überall | §2 bis §13 neu geschrieben: kein „Wegweiser nennt 35 km“, 9 Punkte statt 10, keine Prozentregel für die Tinten, `ort-marke` im Register korrigiert, CLS gemessen (§14). |
| Telefon nur als Textlink, Trefferradius klein | Telefon als eigene Zeile (44 px) und im Kopf; Treffer der Kartenpunkte 28 × 28 px; Beschriftungen im Text ab 14 px. |
| „System“ in der Kopfzeile | Aus der Kopfzeile in den Fuß; Kopf: Stellen, Einsatzgebiet, Telefon; „Jetzt bewerben“ läuft als Leiste mit. |

## 1. Leitidee (ein Satz)

> Jeder Arbeitstag schließt sich: Haus – Baustelle im 35-km-Ring – pünktlich zurück.

Der Arbeitstitel „Haus & Kreislauf“ bleibt: Das Haus ist das Giebelhaus des Logos, der Kreislauf ist das Leitungspaar von Hinweg und Rückweg.

## 2. Ableitung aus dem Markenaspekt „Energie fürs Zuhause“

1. Das Logo ist ein Haus mit Giebel, seine Farben sind die Leitungsfarben der Heizungstechnik. Daraus wird ein Leitungspaar für den Arbeitstag: Der Hinweg zur Baustelle läuft durchgezogen in Navy, der Rückweg nach Hause gestrichelt in Blau, beide beginnen im Haus und enden wieder darin. Warm und kalt tragen die Flächen (Wärmefläche im Haus, Kaltfläche draußen). Rot gehört allein dem Knopf.
2. Die Zusagen des Betriebs sind selbst ein geschlossener Kreis: höchstens 35 km, keine Fernmontage, freitags ab 13:30 Uhr Feierabend. Darum zeigt das Hero-Bild keine Heizanlage, sondern den Arbeitstag: Der Hinweg misst die 35 km, der Zeiger der Giebeluhr läuft auf 13:30 und rastet ein, wenn der Rückweg im Haus ankommt, und 1926 steht als Fundament unter dem Haus. Die Kennzahlen hängen als Messwerte an der Zeichnung statt in vier gleichen Kacheln.
3. Aus Giebel (45°) und Kreis wächst das Formsystem: Ecken sind 45°-Fasen, Enden sind rund, jede Linie ist gleich stark. Flamme, Tropfen, Sonne und Luft sind eigene Grundfiguren, den Themen des Logos nachempfunden, nicht seine Nachbildung; das Logo bleibt unverändert (Datei `logo.png` ist byte-gleich mit `public/images/bad-energie-lahn-dill-logo-transparent.png`, dunkel auf heller Plakette, kein Filter).

## 3. Austauschprobe: Warum passt das zu keinem Wettbewerber?

Der Kreis der Szene ist der Arbeitstag, kein Heizkreis. Setzt man den Namen eines anderen SHK-Betriebs ein, stimmt die Bewegung nicht mehr: Das Haus ist das Giebelhaus aus dem Logo, die Uhr rastet auf genau 13:30 ein, der Hinweg misst genau 35 km, das Fundament trägt 1926 (Quelle: `facts.ts` friday1330, radius35, founded1926). Ein Betrieb mit Montage im ganzen Land, Wochenend-Notdienst oder offenem Einsatzgebiet könnte weder Ring noch Uhr zeigen, ohne zu lügen. Dieselbe Schlaufe läuft im Pendelrechner weiter, dort mit den zehn echten Orten um Wetzlar, ihrer Entfernung und Fahrzeit (`locations.ts`); das trägt nur dieses Einsatzgebiet.

Ehrlich bleibt: Das bloße Prinzip „hin und zurück“ gehört niemandem, und ein Betrieb mit denselben Zusagen könnte den Satz übernehmen. Deshalb steht das Prinzip nie ohne die belegten Werte da, und die Form (Giebelhaus des Logos, 45°-Fasen, Strichfolge statt Farbe) bleibt die von Bad & Energie. Das Wärmepumpenschema, das jeder SHK-Betrieb zeigen könnte, kommt in der Szene nicht mehr vor.

## 4. Wie die Kachel die Besucheraufgaben unterstützt (KERN K-002)

| Aufgabe | Wo in der Kachel |
|---|---|
| 1 Stelle finden und verstehen | Abschnitt „Offene Stellen“: vier Zeilen mit Titel und Gehaltsspanne (Quelle §10), Arbeitszeit als Zeile und als Wochenbalken (Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr, der freie Rest des Freitags gestrichelt); Kopf-Link „Stellen“. |
| 2 Arbeitsweg prüfen | „35 km um Wetzlar. Keine Fernmontage.“ mit Radius-Umschalter 15 / 25 / 35 km, Ortswahl mit Entfernung und Fahrzeit (10 Orte), Karte mit Hinweg und Rückweg zum gewählten Ort, Tabelle ohne JavaScript; die Hero-Zeichnung zeigt dieselbe Schlaufe mit der Maßlinie 35 km; Kopf-Link „Einsatzgebiet“. |
| 3 In 60 Sekunden bewerben | Eine rote Hauptaktion „Jetzt bewerben“ mit „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“ im ersten Bildschirm auf allen Breiten; danach läuft dieselbe Aktion als Leiste mit (mobil unten, mit Telefon-Knopf). |
| 5 (Nebenaufgabe) Kontakt | Telefonnummer im Kopf, als eigene Zeile im Einsatzgebiet und in der mitlaufenden Leiste (mobil). |

## 5. Schriftwahl

- Display: Bricolage Grotesque (variabel, wght 200–800, opsz 12–96, OFL). Die optische Größenachse trägt bei 100 px die kräftigen, leicht eigenwilligen Formen einer Hausbeschriftung und öffnet sich bei kleinen Größen; keine Stelle erzwingt einen Achsenwert (Runde 1 setzte im Leitsatz fest opsz 96). H1 in Gewicht 800, −0,01 em.
- Text: Atkinson Hyperlegible Next (variabel, wght 200–800, OFL). Für Orte, Zeiten und Gehälter am Telefon zählt die Unterscheidbarkeit der Zeichen mehr als Charakter.
- **Zahlen im Satz in der Display-Ziffer.** Atkinson zeichnet die Null mit Schrägstrich (06441 liest sich „06441“ mit durchgestrichener Null). Geprüft: Die Fontsource-Dateien enthalten nur die GSUB-Merkmale ccmp, frac, locl, pnum und tnum, es gibt keine Variante ohne Strich. Deshalb setzt der Bau jede Zahl im Fließtext (Zeiten, Preise, Entfernungen, Jahr) in Bricolage 500; Atkinson bleibt für Wörter. Die Folge ist ein Systemmerkmal: Zahlen sind Messwerte. Zur Wirkung am Telefon steht ein Nutzertest als Vorschlag in OFFENE FRAGE 7.
- Monospace: IBM Plex Mono 400 nur für Kennungen, Hexwerte und Tokens der Dokumentation, in `--t-1` (14 px).
- **Alternativen getestet (Runde 2).** Aus dem Schriftpool wurden Gabarito, Rethink Sans, Familjen Grotesk, Schibsted Grotesk, Onest, Hanken Grotesk und Big Shoulders Display neben Bricolage gesetzt (H1 „SHK-Jobs in Wetzlar.“ in 76 px und die Zahlenzeile 13:30 · 35 km · 1926 · 07:00–16:45 Uhr · 3.600–4.600 €, Gewicht 700–800, Laufweite −0,01 em). Gabarito und Onest werden breit und weich; Rethink Sans, Schibsted und Hanken sind sauber, tragen aber keine eigene Handschrift; Familjen gibt es nur bis Gewicht 700 und die H1 wirkt leichter; Big Shoulders ist eine schmale Schildschrift, hat keine optische Größenachse und widerspricht dem freundlichen Ton der Richtung. Bricolage bleibt, weil Gewicht 800 bei −0,01 em die kräftigste und zugleich freundlichste Form ergibt und nur sie eine optische Größenachse mitbringt. Der Standardlook-Verdacht (S-08, S-14) wird nicht über die Schrift gelöst, sondern über das Bild (Haus des Logos, Uhr, Maßlinie, Baustelle mit Kran als Firstreihe im Hochformat) und die Zahlen als Messwerte.
- Dateien: 6 woff2 (latin und latin-ext je Familie), zusammen 188.768 Byte (184,3 KiB bei 1 KiB = 1024 Byte, Budget 250 KB), zwei Dateien vorgeladen, Ersatzschriften mit gemessenem size-adjust, ascent-override und descent-override. Unverändert gegenüber Runde 1.
- Schriftstufen: 7 fließende Stufen (clamp, Maximum höchstens 2,5 × Minimum; größte Spanne 2,0 bei der H1), gemessen auf 375 px: 14 · 16 · 17 · 20 · 24 · 28,2 · 52 px, auf 1440 px: 14 · 16 · 19 · 25,4 · 34,9 · 48 · 100,5 px. Es gibt keine Schriftgröße außerhalb der Skala (Messung über alle Elemente mit Text).
- Zeilenhöhen: Display 0,95–1,1, Fließtext 1,5–1,6 (Kern-Soll). Zeilenlänge der Einleitungen höchstens 62 Zeichen. Keine Abweichung vom Kern beantragt.

## 6. Palette und Kontrast

Vom Auftraggeber bestätigt (E-016) und unverändert: Marken-Navy #111D6D, Signalrot #D60000, Blau #1F57C4, Putz #FBF7F0, Wandton #F1E9DB, Wärmefläche #FADCC9. Hell: Putz, Navy, Rot nur am Knopf. Dunkel neu gemischt: Nachtblau #0A1033, Creme #F6F0E4, Koralle #FF5A4D (nur am Knopf), Himmelblau #7FAAFF; das Logo steht unverändert auf einer hellen Plakette.

**Regel: Rot nur für die eine Hauptaktion je Ansicht.** Umgesetzt ist die strenge Fassung („Rückfall“ aus Runde 1): Nirgends außer am Knopf steht Rot; die Zeichnungen tragen Hinweg und Rückweg über die Strichfolge (durchgezogen, gestrichelt), die Bedeutung warm und kalt über die Flächen. Gemessen mit `getComputedStyle` über alle Elemente (Farbe, Hintergrund, Rand, fill, stroke, Outline) in hell und dunkel auf 1440 und 375 px: 0 Treffer außerhalb von `.knopf` und den Farbmustern der Dokumentation. Die Zustandsmuster der Dokumentation zeigen sechs Zustände desselben Knopfes.

**Abstufung nach Kontrast, nicht nach Prozent.** Runde 1 behauptete „100/70/50/20 % Navy“; gerechnet war Tinte 2 etwa 81 %, der Rand etwa 60 %, die Linie ein warmes Beige. Jetzt gilt: Tinte 2 hat mindestens 6,5:1 auf allen Flächen (kleinster Wert 6,54:1), der Rand mindestens 3:1 (kleinster Wert 3,69:1), die Linie ist ein warmes Beige für Haarlinien ohne Aussage und bewusst unter 3:1.

**Kopfband (Entscheidung für den Auftraggeber).** Im Dunkelmodus ersetzen Creme und Koralle Navy und Rot; außer dem Logo wäre keine Markenfarbe sichtbar. Vorschlag in der Kachel: das Kopfband trägt dort das Marken-Navy #111D6D (Text Creme 13,03:1). Entfällt der Vorschlag, entfällt eine Zeile im Dunkelblock (`--kopf`).

Alle Kontrastwerte werden beim Bau aus den Hexwerten berechnet (24 Paare, hell und dunkel, abgerundet auf zwei Stellen). Text: hell mindestens 5,44:1 (weiß auf Rot), dunkel mindestens 6,01:1 (Knopf). Grafiken und Bedienelemente: hell mindestens 3,69:1 (Rand gegen Kaltfläche), dunkel mindestens 4,66:1. Rückweg (Blau) gegen Putz 6,11:1, gegen Kaltfläche 5,36:1, gegen Wärmefläche 5,02:1. axe-core 4.x (WCAG 2 A, AA, 2.1 A, AA, 2.2 AA, Best Practice): 0 Verstöße auf 320, 375, 768 und 1440 px, hell und dunkel, bei reduzierter Bewegung.

## 7. Raster

12 Spalten, Bundsteg 16–24 px, Seitenrand 20–64 px, Satzspiegel höchstens 84 rem, Abstandsskala 10 Stufen (4–128 px), dazu 11 Maße (`--m-ziel` 44 px, `--m-segment` 48, `--m-knopf` 56, `--m-karte` 64, `--m-zeile` 72, `--m-zeile-gross` 88, `--m-ikone` 36, `--m-ikone-s` 28, `--m-trenner` 28, `--m-logo` 40, `--m-dach` 48–120). Die Abschnitte wechseln bewusst: Hero 6 | 6 mit Zeichnung bis in den Rand, Stellen als Kopfband mit voller Liste, Gebiet 6 | 6 mit klebender Karte und einer Dachspitze, die die Oberkante durchbricht. Mobil (375 px) ist eine eigene Komposition: Kopf zweizeilig, Zeichnung über die volle Breite im ersten Bildschirm, 13:30 im Bild, übrige Kennzahlen als Strang, Bewerben-Leiste unten.

## 8. SVG-Formsystem

Giebel 45° und Kreis, Raster 24 × 24 (Rand 2), eine Strichstärke (2 von 24 Einheiten; auf der Seite fest 3 px über non-scaling-stroke, auch in Szene, Karte, Trennern), runde Enden, Fasen statt harter Ecken, currentColor. Strichfolge statt Farbe: durchgezogen = Hinweg, gestrichelt (6 8) = Rückweg, gepunktet (0,1 9) = Radien. Acht Icons in einer Familie (Wärmepumpe, Bad/Tropfen, Heizung/Flamme, Werkzeug, Servicefahrzeug, Uhr/Feierabend, Standort, Nachricht, je 113–352 Byte) plus fünf Schnittstellenzeichen (neu: Telefon); Trenner „Giebel“ und „Heizkreis“ (Rohrpaar mit Hinweg und Rückweg), Muster „Firstreihe“, die im Hochformat auch den Kran der Baustelle bildet. Die Hero-Szene ist 2,6 KB roh (1,0 KB gzip), die Karte 5,6 KB (1,0 KB gzip).

## 9. Bewegung (Register steht in der Kachel)

Signaturmoment im Hero (nur Erzählseite), der Arbeitstag in 1.320 ms: Der Hinweg zeichnet sich vom Haus zur Baustelle (0–400 ms), die Maßlinie „35 km“ begleitet ihn, nach einer Pause zeichnet sich der Rückweg zurück (660–1060 ms), der Zeiger der Giebeluhr läuft von 07:00 auf 13:30 und rastet mit 4° Überschwingen ein (0–1.100 ms), die Wärmefläche füllt das Haus, „35 km“ und „13:30“ erscheinen genau dann, wenn Maßlinie und Uhr ihr Ziel erreichen. Danach Ruhe. Erneut nur über „Kreislauf zeigen“. Reduziert: kein Startzustand, Endzustand sofort; der Knopf blendet Zeichnung und Kennzahlen in 240 ms über. Weitere Bewegung nur als Folge einer Nutzeraktion: Karte zoomt auf den Radius, Ring und Fläche blenden ein, die Schlaufe zum gewählten Ort zeichnet sich (Hinweg hin, Rückweg zurück), Druck-Rückmeldung, Pfeil der Tabellenzeile, die Bewerben-Leiste erscheint. Tokens: 4 Dauern (120, 240, 400, 700 ms), 1 Staffelabstand (60 ms), 1 Sicherheitsnetz (2.000 ms), 2 Kurven. Technik: nur transform und opacity sowie Strichzeichnen über Masken (stroke-dashoffset mit pathLength). Keine Schleife, kein Scroll-Auftritt, kein Zähler. Skripte: 0,3 KB (Kopf) + 1,7 KB (Szene und Leiste) + 4,9 KB (Pendelrechner), ohne Bibliothek.

## 10. Quellen je Zeile (Wahrheit)

Alle Inhalte stammen aus `components/home/content.ts` (HERO, HERO_STATS, importiert `COMPANY`), `lib/content/facts.ts` und `lib/data/locations.ts`. Zwei Zeilen stützen sich darüber hinaus auf Daten, die KERN K-004 bzw. `content.ts` nennen oder importieren; dafür gilt OFFENE FRAGE 3.

| Zeile in der Kachel | Inhalt | Quelle |
|---|---|---|
| Eyebrow | „Seit 1926 · Wetzlar“ | `content.ts` HERO.eyebrow (COMPANY.foundingYear, COMPANY.address.city) |
| H1 und Unterzeile | „SHK-Jobs in Wetzlar.“, „Ehrliches Handwerk. Pünktlich Feierabend.“ | `content.ts` HERO.title, HERO.titleSecondLine |
| Einleitung | „Wir suchen Verstärkung …“ | `content.ts` HERO.lead |
| Mikrotext | „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“ | `content.ts` HERO.microcopy (facts apply60s, noCvNeeded) |
| Kennzahlen | 13:30, 30, 35 km, 1926 mit Etiketten | `content.ts` HERO_STATS (facts friday1330, vacation30, radius35, founded1926; Etikett „Einsatzradius“ aus STAT_LABELS) |
| Arbeitszeit-Zeile, Wochenbalken | Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr | `facts.ts` workingHours.short |
| Stellenliste | 4 Titel (`shortTitle`), Pfade (`slug`), Gehaltsspannen (`salary`) | `lib/jobs/data/*.ts`; KERN K-004 nennt `lib/jobs/data/*` als Quelle der Stellen; nicht in den drei Quellen der Aufgabe (OFFENE FRAGE 3). Die Quereinsteiger-Stelle (`funnel_only`) steht dort ohne Spanne und fehlt hier. |
| H2 Einsatzgebiet | „35 km um Wetzlar. Keine Fernmontage.“ | Wortlaut des Beispielabschnitts im Briefing; `facts.ts` radius35, noFarAssembly |
| Einleitung Einsatzgebiet | Alle Baustellen … pünktlich zu Hause. | `facts.ts` radius35.long und noFarAssembly.long, wörtlich |
| Orte | Name, Entfernung, Fahrzeit, Lage auf der Karte | `lib/data/locations.ts` (name, distanceKm, commuteMinutes, latitude, longitude); das Feld `character` wird nicht angezeigt |
| Telefon | 06441 42956, Link +49 6441 42956 | `COMPANY.phone.display` und `e164` in `lib/content/company.ts` (von `content.ts` importiert; Wert aus `lib/data/contact.ts`); ob es die Nummer für Bewerber ist, ist offen (OFFENE FRAGE 3) |
| Knopf | „Jetzt bewerben“ | `components/home/Hero.tsx` |
| Legende | „Hinweg zur Baustelle“, „Rückweg nach Hause“ | eigene Funktionsbeschriftung (Mikrotext) zur Erklärung der Strichfolge; „nach Hause“ stützt sich auf `facts.ts` noFarAssembly.long („jeden Abend pünktlich zu Hause“) |
| Fuß | Hinweis auf die Kachel, Link „System“ | ohne Firmenname und Anschrift (Runde 1 zeigte eine abweichende Namensform) |
| Zustandsmuster | „Angekommen.“, „Telefonnummer prüfen.“ | Muster, keine Freigabetexte |

Jede dieser Stellen trägt im HTML ein `data-quelle`, wo sie nicht aus den drei Quellen stammt, sodass sie ohne Folgen für das Layout entfernt werden kann (Stellenliste: `.stellen__liste`; Telefon: `.kopf__tel`, `.gebiet__tel`, Telefon-Knopf der Leiste).

## 11. Risiken

1. Austauschbarkeit: Das Prinzip „hin und zurück“ gehört niemandem. Die Richtung steht und fällt damit, dass Uhr 13:30, Maßlinie 35 km und 1926 echte Fakten bleiben. Ändert sich eine Zusage, muss die Szene mitziehen.
2. Strenge Rot-Regel: Rot als Linie entfällt. Hinweg (Navy durchgezogen) und Rückweg (Blau gestrichelt) unterscheiden sich vor allem durch die Strichfolge; wer Blau und Navy nicht trennt, erkennt sie am Muster. Die Zeichnung verliert die Leitungsfarbe „rot = warm“; die Wärme steht in der Fläche.
3. Schriftpaarung: Bricolage Grotesque ist 2024–2026 verbreitet; getestet gegen sieben Alternativen (§5), behalten. Restrisiko „Standardlook“ liegt in der Haus-Sonne-Strichgrafik; die Szene bindet sie jetzt an 13:30, 35 km, 1926 und das Haus des Logos.
4. Karte: Die Kreise sind ungefähre Luftlinien-Radien; die Orte werden nach `distanceKm` (vermutlich Straßenentfernung) einsortiert (OFFENE FRAGE 2). Es gibt nur 10 Orte.
5. Mobil ist die Seite sehr lang (rund 37.700 px bei 375 px, 19.700 px bei 1440 px), weil Palette, Kontraste und Register als gestapelte Blöcke stehen. Der Produktteil (bis zum System) ist mobil rund 4.100 px, auf 1440 px rund 3.600 px lang.
6. Randkontrast von Bedienelementen auf der Kaltfläche knapp über 3:1 (3,69:1).
7. Kein Gesicht des Betriebs: Die Jury wünscht Fotos von Monteuren und Team. Das widerspricht der Inhaberentscheidung „keine Fotos, kein Stock, keine KI-Bilder“ und ist nicht umgesetzt (OFFENE FRAGE 4).
8. Die mitlaufende Bewerben-Leiste liegt auf Desktop unten rechts über dem Inhalt und mobil als Band über dem Seitenende (Fuß hält Abstand).

## 12. Übertragbarkeit auf Arbeitsseiten und weitere Erzählseiten

- Bewerbungsflow (`/bewerbung`, Arbeitsseite, ruhig, keine Signaturmomente): Der Fortschritt als Strang aus der mobilen Kennzahlenleiste (eine Linie, Knoten: erledigt gefüllt mit Haken, aktuell als Ring, offen hohl; Zustandswechsel in 240 ms ohne Szene). Felder mit sichtbarer Beschriftung, Rand 2 px, Fokus 3 px; Fehler und Erfolg mit Zeichen, Text und Strichfolge am Rand, nie mit Rot. Hauptaktion je Schritt ist der Wegweiser-Knopf, einmal je Ansicht; „Zurück“ als Textknopf. Auswahlfelder wie die Orts-Chips.
- Danke-Seite: dieselbe Zeichnung als stehendes Bild im Endzustand (Hinweg und Rückweg verbunden, Uhr auf 13:30), ohne Bewegung.
- Stellenliste (`/jobs`): die Zeilen aus der Kachel mit Titel, Gehalt und Pfeil; Filter als Chips; keine Szene.
- Stellenseite (`/jobs/[slug]`, Erzählseite): Zeichnung als Kopfbild mit dem Weg zur Baustelle der jeweiligen Stelle, eingebetteter Pendelrechner, Wochenbalken, Gehalt sichtbar.
- Startseite: Vorlage ist die Kachel; das Dach über dem Einsatzgebiet bleibt der einzige Strukturbruch.
- 404 (kleiner Charaktermoment): Der Hinweg endet offen, kein Rückweg; die Uhr steht auf 07:00. Eine Zeile Text und der Rückweg zur Startseite.
- Rechtstexte: reine Typografie auf Putz, Tinte und Fokus, ohne Zeichnung.

## 13. Offene Fragen

1. **Rot am Hinweg (Palettenfreigabe E-016 gegen Inhaberregel).** E-016 nennt Signalrot „für die eine Hauptaktion je Ansicht und den Vorlauf“, die Inhaberregel („Rot nur für die eine Hauptaktion je Ansicht“) schließt Linien aus. Umgesetzt ist die strenge Fassung. Wird Rot am Hinweg freigegeben, ändert sich eine Zeile (`--hinweg: var(--rot)`); die Dokumentation (Palettenzeile, §2, §6) wäre dann anzupassen.
2. `distanceKm` in `lib/data/locations.ts`: Straßenkilometer oder Luftlinie? (Herborn 24 km gegenüber etwa 19 km Luftlinie spricht für Straße.) Bestimmt die Beschriftung der Radien.
3. Quellenstatus von `lib/jobs/data/*` (Stellenliste, Gehälter) und der Telefonnummer 06441 42956 (`COMPANY.phone`): Beide liegen außerhalb der drei in der Aufgabe genannten Quellen; KERN K-004 nennt `lib/jobs/data/*` ausdrücklich. Förmliche Entscheidung nötig; ohne sie bleiben beide mit `data-quelle` stehen. Ist die Hauptnummer die Nummer für Bewerber (Sabri Demir)?
4. Gesicht des Betriebs: Foto-Wünsche der Jury widersprechen der Inhaberentscheidung. Ein Weg ohne Fotos wären die vier freigegebenen Teamzitate (K-014) typografisch als Band; ihre Quelle (`lib/content/team.ts`) liegt außerhalb der drei Quellen.
5. Dunkelmodus: Marken-Navy als Kopfband (Vorschlag, §6) ja oder nein?
6. In `lib/data/locations.ts` steht für Hermannstein „Wohn und Gewerbegebiet“ (fehlender Bindestrich). Die Kachel zeigt die Beschreibungstexte nicht und tippt den Fehler nicht ab; Meldung für MENSCHEN.md liegt beim Orchestrator (Schreibrecht nur im Ordner der Kachel).
7. Nutzertest am Telefon für Zeiten und Preise in der Display-Ziffer (statt Atkinson mit Schrägstrich-Null): für MENSCHEN.md.
8. Links der Kachel zeigen auf Plattformrouten (`/bewerbung`, `/jobs/<slug>`) und lösen im statischen Server der Kachel nicht auf.
9. Neue Mikrotexte dieser Runde (Legende der Zeichnung, „Telefon“, „Kreislauf zeigen“) und die Fehler- und Erfolgstexte der Zustandsmuster sind Muster; endgültige Texte gehören nach `TEXTVORSCHLAEGE.md`.

## 14. Messwerte der Kachel (Stand Runde 2)

- `fotos/bericht.json` (Werkzeug `kachel-fotos.mjs`, 4 Ansichten, hell und dunkel, voll und reduziert) plus Ergänzung (Ansicht `m320` und Elementfotos, siehe unten): 0 Überlauf, 0 Fehler, 0 Fremdanfragen.
- Ergänzung: Ansicht `m320` (320 × 568, hell und dunkel, voll und reduziert) mit demselben Überlaufbericht wie das Werkzeug; zusätzlich Elementfotos `el-<Ansicht>-<Schema>-<Abschnitt>__NN.webp` für Hero, Stellen, Einsatzgebiet, Leitidee, Schriften, Palette, Raster, Formen, Bewegung, Zustände und Fuß auf 375 und 1440 px, hell und dunkel. Das Werkzeug schneidet höchstens 12 Ausschnitte je Ansicht; die Elementfotos decken den Rest.
- axe-core: 0 Verstöße (320, 375, 768, 1440, hell und dunkel, reduziert). html-validate (Regelsatz recommended, ohne no-inline-style): 0 Befunde.
- Layoutverschiebung (CLS): 0 auf 375 und 1440 ohne Drosselung; auf 1440 mit 1,6 Mbit/s, 150 ms Latenz und vierfach gebremster CPU 0,002 (Schriftwechsel in Kopfleiste und Mikrotext), auf 375 gedrosselt 0. Größtes Element der Ansicht ist die H1 (LCP lokal 0,22 s auf 1440, 0,29 s auf 375, gedrosselt 0,69–0,72 s); Hero-Text wird nie unsichtbar gesetzt.
- Ohne JavaScript: Endzustand der Szene, Tabelle der Orte sichtbar, Umschalter, Ortsliste und Knöpfe mit JavaScript ausgeblendet, Leiste fehlt. Mit reduzierter Bewegung: keine Animation, Endzustand sofort.
- Schriften 188.768 Byte (184,3 KiB), HTML 180 KB roh (34 KB gzip), CSS 47 KB roh (10 KB gzip), Szene 2,6 KB, Karte 5,6 KB, Skripte 7,0 KB (3,1 KB gzip).
- Touch-Ziele im Produktteil mindestens 44 px (Logo-Link 44–48 px, Kartenpunkte 28 × 28 px); Tastatur: 41 Tab-Stopps ohne fehlenden Fokusring, Reihenfolge entspricht der Darstellung.
