# Richtung A · „Werkplan“ – Begründung

Stilkachel: `index.html` (eine Seite, ohne Build, Port 3701), Runde 1. Markenaspekt: **handwerkliche Präzision – „sauber verlegt“**.

## 1. Leitidee (ein Satz)

„Sauber verlegt: Der Vorlauf führt in 60 Sekunden zu uns, der Rücklauf bringt dich pünktlich nach Hause – und jede Zahl steht als Maß an der Leitung.“

Gegenüber der Ausgangsidee im Paket ist sie in einem Punkt geschärft: Rot ist nicht allgemein „warm“, sondern **der Weg zur einen Handlung** (Vorlauf führt zu „Jetzt bewerben“), Blau ist **das, was zu dir zurückkommt** (Rücklauf: Feierabend 13:30, 30 Tage Urlaub, 35 km, seit 1926). Damit erklärt die Idee zugleich die Farbregel „Rot nur für die eine Hauptaktion je Ansicht“.

## 2. Ableitung aus dem Markenaspekt (drei Sätze)

1. Ein SHK-Betrieb verlegt Leitungen, und gute Arbeit erkennt man daran, dass sie maßhaltig, sichtbar geführt und ohne Umweg verläuft.
2. Darum ist die Seite ein Werkplan: Rot führt als Vorlauf in jedem Abschnitt zur einen Handlung, Blau trägt als Rücklauf, was zu dir zurückkommt, und jede Zahl steht als Maß an einer Leitung statt in einer Kachel.
3. Weil Rot und Blau zugleich die Farben des Logos und die Leitungsfarben der Heizungstechnik sind, braucht die Seite keine zweite Dekoration: Linie, Bogen und Knoten sind Gestaltung, Wegweiser und Beleg in einem.

## 3. Austauschprobe: Warum passt das zu keinem Wettbewerber?

| Was man tauschen müsste | Was dann zerbricht |
|---|---|
| Die Maße 13:30, 30, 35 km, 1926 | Ein Betrieb ohne diese belegten Zusagen hat nichts, woran er die Leitung bemaßen kann. Die Zahlen sind der Inhalt der Idee. |
| Die Farben Rot und Blau | Sie sind die Farben dieses Logos und zugleich die der Heizungsrohre. Mit anderem Logo wäre die Leitungsfarbe eine Behauptung, hier ist sie ein Beleg. |
| Das Versprechen „Rücklauf pünktlich nach Hause“ | Wer Fernmontage, Wochenenddienst oder lange Wege hat, kann keinen Rücklauf zeichnen, der stimmt. |

Ergebnis: Die Idee besteht nur mit den echten Zusagen dieses Betriebs; der Einstieg, der Radius-Plan und der Arbeitszeit-Streifen lassen sich nicht auf einen anderen Betrieb übertragen, ohne neu bemaßt zu werden. **Risiko** (siehe 8): Andere Betriebe mit rot-blauem Logo könnten die Rohrmetapher borgen; dann entscheidet die Bemaßung der eigenen Zusagen, nicht das Motiv.

## 4. Wie die Kachel die Besucheraufgaben 1–3 (KERN K-002) trägt

| Aufgabe | Wo in der Kachel | Wie |
|---|---|---|
| 1 Stelle finden und verstehen | Erster Bildschirm, Arbeitszeit-Streifen | H1 „SHK-Jobs in Wetzlar.“ + „Ehrliches Handwerk. Pünktlich Feierabend.“, Einleitung (`HERO.lead`), die vier Kernzahlen als Maßkette (13:30 · 30 · 35 km · 1926). Darunter „Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr“ als maßstäblicher Streifen mit Feierabend-Knoten bei 13:30 und schraffiertem Wochenende („Kein Wochenend-Notdienst“). |
| 2 Prüfen, ob der Arbeitsweg passt | Abschnitt „35 km um Wetzlar. Keine Fernmontage.“ | Zurückgeführt: Radius-Umschalter 15 / 25 / 35 km (E-START-033) und Ortswahl mit Entfernung und Fahrzeit (Pendelrechner) als Lageplan in der Gestaltungssprache: 5-km-Raster mit Maßstab, Hilfsringe, Außenfläche schraffiert („hier montieren wir nicht“), gewählter Wohnort wird als Leitung zum Betrieb gezeichnet; Plankopf unter dem Plan nennt Wohnort, Entfernung und Fahrzeit. Ohne JavaScript bleibt die Tabelle mit allen zehn Orten. |
| 3 In rund 60 Sekunden bewerben | Hauptaktion im ersten Bildschirm und am Ende des Einsatzgebiets | Der Vorlauf läuft in den Knopf; Mikrotext „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“ direkt darunter. Der Knopf ist die einzige rote Fläche je Ansicht. |

## 5. Schriftwahl

- **Archivo** (variabel, Breite 62–125 %, Gewicht 100–900, OFL): Display bei 68 % Breite und Gewicht 800 wirkt wie Planstempel und trägt lange deutsche Wörter in wenig Breite; in Normalbreite (100 %, 400) liest sie sich ruhig. Eine Datei, beide Rollen, dadurch nur zwei Netzwerkanfragen für die Hauptschrift (latin; latin-ext nur bei Bedarf über `unicode-range`).
- **Martian Mono** (variabel, Breite 75–112,5 %, Gewicht 100–800, OFL): für Maße und Planbeschriftung. Ziffern stehen auf festem Raster, Versalien sind gesperrt (+0,12 em); Zahlen sehen aus wie Maße, nicht wie Werbung.
- Gemessen: vier Dateien, **239,5 KB** (Budget 250 KB). Zwei Schnitte werden vorgeladen (`latin` je Familie, `crossorigin`). Die Ersatzschriften sind per `size-adjust` und Ascent-/Descent-Überschreibung gegen die echten Dateien angeglichen (Archivo 98,7 %, Martian Mono 116,6 %).
- Nicht verwendet: Inter, Space Grotesk, Playfair Display.

## 6. Farbe

Hell ist **Pauspapier**, dunkel ist **Blaupause**: beide sind gezeichnet, nicht invertiert. Im Dunkelmodus wird das Blau aufgehellt (Navy verschwindet auf Blaupause), das Rot bleibt #D60000 (3,35 : 1 gegen das Papier, genug für Leitung und Knopf; als Schrift gibt es eine hellere Stufe). Das Logo steht dunkel auf einer hellen Plakette, nie umgefärbt. Alle 17 Farbpaare sind in der Kachel berechnet und bestehen in beiden Modi (kleinster Textwert 5,32 : 1 hell und 4,81 : 1 dunkel; kleinster Grafikwert 3,73 : 1 hell und 3,03 : 1 dunkel).

## 7. Bewegung

Genau ein Signaturmoment: **„Leitung verlegen“** (`leitung-verlegen`), 1.200 ms, einmal beim Seitenaufruf, ohne Inhalt zu blockieren (der Text steht von Anfang an). Dazu fünf kleine Rückmeldungen: Wärmefluss durch den Vorlauf bei Hover/Fokus der Hauptaktion (900 ms, linear, nur Desktop), Knopf-Zustand, Zustandsfarbe, Radiuswahl, Orts-Route und Orts-Marke. Es bewegen sich nur `transform`, `opacity` und `stroke-dashoffset`. Nichts läuft endlos, nichts blinkt, kein Scroll-Auftritt (S-02 gleich null). Startzustände hängen an der per Inline-Skript gesetzten Klasse `anim`; ohne Skript oder bei reduzierter Bewegung steht alles im Endzustand, das Zeitlimit nimmt die Klasse nach 2 s zurück. Das vollständige Register mit Kennung, Zweck, Auslöser, Dauer · Kurve und Verhalten bei reduzierter Bewegung steht auf Blatt 7 der Kachel; Tokens: 6 Dauern (120, 180, 320, 560, 900, 1.200 ms), 4 Kurven.

## 8. Risiken

1. **Metapher kopierbar:** Rot-Blau-Rohrlogik könnten andere Heizungsbauer borgen (siehe Austauschprobe). Gegenmittel ist die Bemaßung der eigenen Zusagen; ohne echte Zahlen trägt die Gestaltung nicht.
2. **Fachbegriffe:** „Vorlauf“ und „Rücklauf“ kennen SHK-Fachkräfte sofort, Quereinsteiger und Azubis womöglich nicht. In der Kachel stehen sie nur als kleine Planbeschriftung, nie als tragender Text.
3. **Kleine Mono-Beschriftungen** (12–13 px, Versalien gesperrt): Kontrast ist ausreichend (mindestens 6,6 : 1), die Größe ist die Schwachstelle. Alle entscheidenden Aussagen stehen groß.
4. **Bühne in Planeinheiten** (ab 64 rem): die Leitungen sind auf Koordinaten gezeichnet; wächst die Zahl der Kernzahlen oder ändert sich ihre Länge, muss die Bühne neu gezeichnet werden. Bei Zoom und kleinen Fenstern greift die mobile Komposition (Reflow bleibt erhalten).
5. **Lageplan schematisch:** Positionen kommen aus Breiten- und Längengrad (äquirektangulär um Wetzlar), Entfernung und Fahrzeit aus der Ortsliste (Straße). Die Ringe sind Luftlinie auf dem Plan; die Orte liegen alle innerhalb von 24 km, der 35-km-Ring wirkt dadurch großzügig. 15 und 25 km sind nur Hilfsringe (Werkzeug, keine Firmenaussage); der Hinweistext sagt: „Die Zusage bleibt: höchstens 35 km um Wetzlar.“
6. **Dunkelmodus:** Das Logo bleibt auf einer weißen Plakette sichtbar eine eigene Fläche; das ist Vorgabe (Logo unantastbar), kein Formfehler.
7. **Schriftbudget** ist mit 239,5 von 250 KB nahezu ausgeschöpft; eine dritte Familie oder weitere Teilmengen passen nicht hinein.

## 9. Übertragbarkeit auf Arbeitsseiten (z. B. Bewerbungsflow)

Arbeitsseiten bleiben ruhig, dicht und schnell, ohne Signaturmoment; vom Werkplan übernehmen sie die **Struktur**, nicht die Inszenierung:

- **Fortschritt:** eine Leitung mit Knoten je Schritt; erledigte Strecken blau, der nächste Knoten offen. Die Leitung steht, sie wird nicht gezeichnet; Zustandswechsel höchstens 180–320 ms.
- **Hauptaktion:** „Bewerbung abschicken“ ist der einzige rote Knopf je Schritt; Rot steht nur dort. Knopf sagt, was passiert.
- **Felder:** Beschriftung oben in Mono-Versalien, Eingabe mit Haarlinie als Maßlinie statt Kasten, Fehler als Rot-Text mit Kappe (Leitung endet), Erfolg als geschlossener Knoten, leer als gestrichelte Leitung ohne Knoten, Laden als linear durchlaufende Wärme.
- **Stellenliste:** Zeilen als Maßkette; Gehalt, Arbeitszeit und Ort stehen als Mono-Maße rechtsbündig, getrennt durch Haarlinien, keine Karten.
- **Stellenseite (Erzählseite):** der Vorlauf führt einmal durch die Abschnitte bis zur Bewerbung; der Arbeitszeit-Streifen und der Pendelrechner ziehen mit.
- **Danke- und 404-Seite:** Knoten schließt bzw. die Leitung endet in einer Kappe als kleiner Charaktermoment.
- **Mappe (A4):** Plankopf als Schriftfeld; eigene Druck-Tokenskala in pt.

## 10. Messwerte dieser Runde

- Schriften 239,5 KB; Bewegungs-JS 3,3 KB (1,2 KB gzip, Budget 60 KB); Icons je 239–441 Byte (Budget 1,5 KB); Plan-SVG 6,4 KB (1,6 KB gzip); Bühnen-SVG 1,9 KB.
- axe (WCAG 2.2 AA und Best Practice): 0 Verstöße in hell und dunkel, 375 und 1440 px. Kein horizontaler Überlauf in 13 Breiten von 320 bis 1920 px.
- Keine Anfrage an fremde Hosts; keine Konsolenfehler.

## 11. OFFENE FRAGEN

1. Gilt „Fahrzeit bis Wetzlar“ in `locations.ts` für Hin- und Rückfahrt? Der Plan nennt sie nur als Fahrzeit bis Wetzlar.
2. Sollen die zehn Orte um weitere Orte des Lahn-Dill-Kreises ergänzt werden? Mit nur zehn Orten bis 24 km bleibt der Ring zwischen 24 und 35 km leer.
3. Dürfen „Vorlauf“ und „Rücklauf“ als sichtbare Planbeschriftung stehen (jetzt: ja, klein), oder genügt die Farbe?
4. Ziel der Hauptaktion in der Kachel ist ein Platzhalter (`#bewerbung`, im Plankopf erklärt); in der Plattform führt er nach `/bewerbung`.
5. Textabstands-Test (WCAG 1.4.12) und Zoom 400 % wurden in dieser Runde nur über das Reflow-Verhalten (320 px Breite) geprüft, nicht per Werkzeug.
6. Echte Bewegungsmessung (Frame-Drosselung nach Z-09) steht aus; in der Kachel sind alle Animationen `transform`, `opacity` oder Strichverlauf.
