# Richtung 1 · „Zugespitzt – Der Kreislauf läuft an“ · Begründung (Runde 2)

Paket A2-RICHT-1 · Prototyp des ersten Bildschirms der Startseite · `index.html` (eigenständig, ohne Build, Port 3801) · Grundrichtung B Runde 1 (E-019), mit der Präzision von A.

Belege (in Runde 2 vollständig neu erzeugt):
- `fotos/` (kachel-fotos.mjs, alle Ansichten, hell/dunkel, voll/reduziert; `bericht.json`: 0 Überlauf, 0 Fehler, 0 Fremdanfragen),
- `erster-bildschirm/` (erster-bildschirm.mjs, m390 und d1440, hell/dunkel, voll und reduziert; `bericht-voll.json`, `bericht-reduziert.json`),
- `erster-bildschirm/hoehen/` (eigenes Ergänzungsskript `pruefung/erster-bildschirm-plus.mjs`: gleiches Aufnahmeverfahren, aber sichtbare Browserflächen statt Gerätebildschirm und CPU-Drosselung 4×),
- `aufzeichnung/` (aufzeichnung.mjs, m390 und d1440, 4 s, mit Bildlauf),
- Schriftprobe `schriftprobe.webp`, Lizenzen in `LIZENZEN.md`.

Was sich gegenüber Runde 1 geändert hat, steht gesammelt in §14.

## 1. Leitidee (ein Satz)

> **Jede Zusage ist eingemessen: Das Haus aus dem Logo läuft als Anlage an, die Uhr im Giebel rastet auf 13:30 ein, und der rote Vorlauf endet in deiner Bewerbung.**

Zugespitzt aus B und A:

- **Aus B** stammen das Haus mit Wärmepumpe, Vorlauf rot und Rücklauf blau, das warme Papier, die Uhr im Giebel, die rot/blaue Rohrklammer an der Zweitzeile und der Leitungstrenner.
- **Aus A** stammen die Maße an der Zeichnung (Mono-Beschriftung, Maßketten, Hinweislinien), die Leitung, die im Bewerben-Knopf endet, und die Arbeitswoche als Bauteil.
- **Neu ist die Verbindung.** Die Zeichnung ist kein Bild neben dem Text, sondern eine Anlage, die einmal anläuft. Jede Zahl hängt als Maß daran, und ihr letzter Strang ist die Hauptaktion. Der Besucher sieht, dass das Angebot „angeschlossen“ ist: Die Wärme kommt im Haus an, und der Vorlauf kommt bei ihm an.

## 2. Austauschprobe (Leitidee, Einstieg, Hauptmoment)

| Teil | Passt unverändert zu einem Wettbewerber? | Was trägt |
|---|---|---|
| Haus mit Wärmepumpe, Vorlauf rot, Rücklauf blau | **Ja.** Das ist Gemeinsprache der Heizungstechnik (ehrlich, wie im Befund `pruefen-b`). | Nichts allein. Darum steht das Schema nie ohne die Maße. |
| Uhr im Giebel, die als letzter Takt von 13:00 auf 13:30 einrastet; Stundenzeiger dann im 45°-Winkel der Dachschräge | Nein, nur mit derselben Zusage (`friday1330`). | Der Kreislauf erzählt den Freitag bis zum Feierabend, nicht nur die Heizung. |
| Fundament mit Maßkette **1926 – 2026 · 100 Jahre Meisterbetrieb** | **Nein.** Gründungsjahr und Jubiläum hat nur dieser Betrieb, und nur 2026 (`founded1926`, `anniversary100`, gültig bis 31.12.2026). | Das Haus steht buchstäblich auf seiner Geschichte. |
| Radius-Maß **35 km** vom Dach bis an den Seitenrand | Nur mit derselben Zusage (`radius35`). | Die Linie läuft aus dem Bild: Das Einsatzgebiet reicht über den Bildschirm hinaus, aber nicht beliebig weit. |
| Sonne mit **30 Teilstrichen** = 30 Tage Urlaub | Nur mit derselben Zusage (`vacation30`). | Ein Motiv aus dem Logo (Sonne) wird zur Messskala. |
| Vorlauf, der unter der Erde in **„Jetzt bewerben“** mündet (Flansch am Knopf) | Die Mechanik schon (A), die Verbindung mit dieser Anlage nicht. | Die Hauptaktion ist der letzte Verbraucher im Kreislauf, nicht ein Knopf neben einem Bild. |
| Anschluss: die Woche als **Heizkreisverteiler**, Mo–Do 07:00–16:45, Fr 07:00–13:30, Sa/So ohne Kreis | **Nein.** Die Längen der Kreise sind die Arbeitszeiten dieses Betriebs (`workingHours`, `noWeekendOnCall`). | Fünf Heizkreise ab dem 07:00-Strich; der Freitag ist sichtbar der kürzeste. |
| Einstieg mobil: „SHK-Jobs in Wetzlar.“ in Bildgröße, Haus rechts angeschnitten, zwei Leitungen fallen in den Knopf | Ohne Uhr, Maße und Ort wäre es ein Allerweltsbild. | H1 (Ort), Uhr 13:30, 1926, 35 km auf einem Bildschirm. |

Ergebnis:

- Die **Leitidee** besteht die Probe nur zusammen mit den belegten Werten. Das Prinzip Kreislauf gehört niemandem; die eingemessenen Zusagen und das Jubiläum gehören diesem Betrieb.
- Der **Hauptmoment** besteht, weil zwei seiner Takte keine Heizungserklärung sind: Der Vorlauf läuft in die Bewerbung, und der Schlusstakt ist die Uhr, die auf 13:30 einrastet.
- **Restrisiko:** Wer nur den Lüfter und die zwei Leitungen ansieht, sieht ein SHK-Schema (siehe §12, Risiko 1).

## 3. Hauptmoment der Startseite: „Der Kreislauf läuft an“

- **Was:** Einmal beim Aufruf, ohne Inhalt zurückzuhalten. Letztes Ende 1.120 ms nach dem ersten Bild, danach Ruhe, keine Schleife. Eine Erzählung in Takten zu 80 ms, mit einer Drehung am Anfang und einer am Schluss, nie zwei zugleich:
  1. **Die Pumpe läuft an** (0–400 ms): Der Lüfter dreht eine halbe Umdrehung und steht. Die Luft zeichnet sich in die Pumpe (drei Linien, 0–320 ms, je ½ Takt versetzt).
  2. **Vorlauf** (160–560 ms): Der rote Vorlauf zeichnet sich zum Heizkörper.
  3. **Das Haus wird warm** (320–920 ms): Der Wärmepegel steigt vom Boden bis unter den First.
  4. **Rücklauf** (480–880 ms): Der blaue Rücklauf kehrt zur Pumpe zurück.
  5. **In die Bewerbung:** Unter der Bodenlinie verlängert sich der Vorlauf bis in „Jetzt bewerben“, danach kommt der Rücklauf vom Knopf zurück. Mobil fallen beide senkrecht in den Knopf (Vorlauf 400–640 ms, Rücklauf 640–880 ms). Am Desktop: Vorlauf Fall, Bogen, Lauf 320–800 ms; Rücklauf Lauf, Bogen, Fall 640–1.120 ms.
  6. **Fließpfeile** erscheinen (720–960 ms).
  7. **Schlusstakt: Die Uhr rastet ein** (880–1.120 ms). Erst wenn der Rücklauf im Haus angekommen ist, springt der Minutenzeiger eine halbe Umdrehung von 13:00 auf 13:30, der Stundenzeiger rückt 15° nach (k-aus: schnell an, weich ein).
- **Warum:** Der erste Bildschirm sagt in zwei Sekunden drei Dinge: was (SHK-Jobs), wo (Wetzlar) und der nächste Schritt (die Leitung führt sichtbar in den roten Knopf). Die Bewegung lenkt den Blick in Leserichtung vom Bild zur Hauptaktion. Ihr letzter Takt ist die stärkste Zusage, 13:30. Sie endet, bevor man zu lesen beginnt.
- **Markenmerkmal:**
  - das Haus mit dem 45°-Giebel aus dem Logo, das Logo selbst bleibt unverändert;
  - zwei Logo-Motive als Funktionsteile (Sonne = Urlaubsskala, Luft = Ansaugung der Wärmepumpe);
  - die Leitungsfarben des Logos (Rot/Navy) als Vorlauf und Rücklauf (E-016);
  - die Zusagen 13:30, 30, 35 km, 1926 als Maße.
- **Technik:** nur SVG und CSS. Bewegt werden `stroke-dashoffset` (mit `pathLength="1"`), `transform` (Lüfter, Zeiger, Wärmepegel als Clip-Rechteck, Erdleitungen mobil) und `opacity` (Pfeile).
- **Gemessen** (`document.getAnimations()`, m390 und d1440, hell und dunkel): 15 bzw. 19 Abläufe, **alle mit eigenem `data-motion` am animierten Element**, spätestes Ende 1.120 ms. Bildfolge ab Aufruf:
  - `erster-bildschirm/bericht-voll.json`: letzte Bildänderung 1.291 ms (m390 hell), 1.234 ms (m390 dunkel), 1.284 ms (d1440 hell), 1.288 ms (d1440 dunkel). Runde 1 lag bei 1.491 ms.
  - Mit 4-facher CPU-Drosselung (`erster-bildschirm/hoehen/bericht-cpu4.json`): erstes Bild 218 / 345 ms, letzte Bildänderung 1.354 ms (m390) und 1.451 ms (d1440), also unter 1,5 s ab Aufruf; der Auftakt selbst dauert ab dem ersten Bild 1,14 bzw. 1,11 s.
- **Startzustände:**
  - Das Kopfskript (179 Byte, 146 Byte gzip) setzt vor dem ersten Rendern die Klasse `auftakt`, nur ohne `prefers-reduced-motion: reduce`.
  - Sicherheitsnetz (E-013): Nach 2 s setzt es `ruhe`; dann gilt `animation: none` im Einstieg, und was noch läuft, steht sofort im Endzustand. Geprüft: Mit künstlich verlängertem Wärmepegel (10 s) steht bei 2,3 s die Klasse `ruhe` und der Endzustand.
  - Füllart `backwards` statt `both`: Der Startzustand gilt während der Verzögerung, danach ist der Endwert der Grundwert, und keine beendete Animation hält noch einen Wert fest. Darum ändert `ruhe` bei 2 s kein Pixel mehr (Bildvergleich 1,6 s gegen 1,9 s: 0 abweichende Pixel, m390 und d1440). Mit `both` gab es bei 2 s ein Neuzeichnen mit Subpixel-Versatz, und in der Ganzseitenaufnahme fehlten die Erdleitungen am Desktop, solange `ruhe` noch nicht gesetzt war.
  - Ohne JavaScript gibt es keine Klasse: Der Endzustand steht sofort.
  - Die H1 und alle Maße sind ab dem ersten Bild sichtbar (Bildfolge `erster-bildschirm/*__t0250.webp`).

## 4. Leitfaden: wie das Leitungspaar zur Stellenseite wandert

Der Leitfaden ist das Paar Vorlauf (rot, dünn) und Rücklauf (blau). Es gilt ein Formsystem:

- **Strich:** immer 3 px (`--m-strich`).
- **Paarabstand:** `--paar` = 12 px (`--a-3`), überall außerhalb der Zeichnung. Das betrifft das Handy-Menü, die Anschlüsse der Pumpe nach unten, die Erdleitungen mobil und am Desktop, den Trenner und den Verteiler.
- **Bögen:** innen `--r-2` (12 px), außen `--r-3` = `--r-2` + `--paar` (24 px). Die Bögen eines Paars sind also konzentrisch.
- **Knicke** im Trenner liegen bei 45°.
- **Ausnahme Zeichnung:** Im Haus liegen Vorlauf und Rücklauf 28 Einheiten auseinander und skalieren mit dem Bild (`--s`). Mit festen 12 px würden sich die Fließpfeile bei großem Maßstab überlagern. Am Rand der Zeichnung wechselt das Paar auf `--paar`: Die Anschlüsse der Pumpe stehen bei 236 ∓ `--paar`/2 (CSS-Verschiebung in Einheiten: `--paar / --s / 2`).

Auf dieser Seite verwandelt sich das Paar fünfmal:

1. **Rohrklammer** an der Zweitzeile „Ehrliches Handwerk. Pünktlich Feierabend.“ (aus B Runde 1): oben Vorlauf, unten Rücklauf, Bögen `--r-2`, als Grafik ohne Text (`aria-hidden`).
2. **Einstieg:** im Haus als Heizkreis Pumpe – Heizkörper, unter der Bodenlinie als Zuleitung in die Hauptaktion (Flansch in Navy am Knopf).
3. **Handy-Menü:** Das Paar läuft vom Kopf senkrecht in „Jetzt bewerben“ am unteren Rand. Jeder Menüpunkt ist ein Abgang in Navy (rot bleibt der Vorlauf selbst).
4. **Leitungstrenner und Anschluss „Freitags ab 13:30 Uhr Feierabend“:**
   - Am Übergang vom Einstieg zur Woche läuft das Paar als Trenner quer durch die Seite, mit 45°-Versatz wie in B.
   - Im Verteiler kommt es vom linken Rand zurück und wird zum **Heizkreisverteiler**. Der Rücklauf-Verteiler steht **genau auf 07:00** (eigener Achsstrich „07“, Achse 07 · 10 · 13 · 16), der Vorlauf-Verteiler `--paar` davor.
   - Jeder Wochentag ist ein Heizkreis, der genau bei 07:00 beginnt und beim Feierabend im Bogen umkehrt: Mo–Do bei 16:45, Fr bei 13:30. Sa/So haben keinen Kreis („Kein Wochenend-Notdienst“).
   - Wo der Vorlauf den Rücklauf-Verteiler kreuzt, steht eine Brücke (Kreuzung ohne Verbindung, Schaltplan-Regel). Gemessen: Kreisbeginn = 07:00 auf allen Breiten (mobil vorher 38 bzw. 69 Minuten zu früh).
5. **Zur Stellenseite** (`/jobs/anlagenmechaniker-shk-wetzlar`). Das ist ein Vorschlag für Drehbuch und A3/A4; im Prototyp zeigen die Stellenzeilen nur den Weg dorthin.
   - Das Paar ist ein dauerhaftes SVG außerhalb des wechselnden Inhalts: Desktop eine senkrechte Doppellinie am linken Satzspiegelrand, mobil unter dem Kopf.
   - Beim Klick auf eine Stellenzeile wandert es per View Transition an den Kopf der Stellenseite (gemeinsames Element `view-transition-name: leitung`, gleiches Seitenverhältnis, 400 ms `--d-3`). Der Abstand bleibt dabei `--paar`, die Bögen bleiben `--r-2`/`--r-3`.
   - Dort verwandelt es sich in drei Inhalte der Stelle:
     - (a) den **Tageskreis** dieser Stelle (07:00–16:45, freitags 13:30) als einzelner Heizkreis aus dem Verteiler;
     - (b) die **Gehaltsspanne als Maßkette** (3.600–4.600 € / Monat aus `lib/jobs/data/anlagenmechaniker-shk.ts`);
     - (c) die Zuleitung in den eingebetteten Bewerbungsablauf (`#bewerben`), deren Vorlauf im Knopf „Als Anlagenmechaniker SHK bewerben“ (`applyLabelFor`) endet.
   - Rückwärts läuft derselbe Weg. Ein Tippen beendet den Übergang sofort.

**Zeichnungswerte mit Abhängigkeit (S-05):**
- Die Erdleitungen am Desktop sind SVG-Linien. Ihre Lage und Breite rechnet CSS aus Tokens: Fallstelle = Pumpenanschluss, Höhe `--a-6` + `--m-knopf`.
- Die y-Werte im SVG sind daraus abgeleitet und im CSS-Kommentar vermerkt:
  - Vorlauf 54 = `--a-6` + `--m-knopf`/2 − `--paar`/2,
  - Rücklauf 66 = `--a-6` + `--m-knopf`/2 + `--paar`/2,
  - Bögen 12/24 = `--r-2`/`--r-3`,
  - Versatz 1,5 = `--m-strich`/2.
- Ändert sich eines dieser Tokens, sind die vier Zahlen nachzuziehen. Der Flansch des Knopfs (`--a-2` bis Knopfhöhe − `--a-2`) deckt beide Lagen ab.

## 5. Mobile Komposition und dominante Geste

Eigens komponiert, kein gestapelter Desktop. **Dominante Geste mobil:** die Schrift in Bildgröße. Darunter das Haus mit Wärmepumpe, an der Bodenlinie verankert, und zwei Leitungen, die in die Hauptaktion in der Daumenzone fallen.

- **Schrift in Bildgröße:** „SHK-Jobs / in Wetzlar.“ in Bricolage 800. Gestufte `clamp` mit rem-Anteil, Zoom 200 % vergrößert weiter. Gesetzt am längsten Wort „Wetzlar.“: 76 px auf 390 × 844, 73 px auf 375 × 812, 84 px auf 430 × 932. Auf 320 eigene Stufe (`clamp(3rem, .25rem + 17.5vw, 3.75rem)`), die Glyphen enden innerhalb der Satzkante.
- **Raster statt Stapel:** `.einstieg` ist ein Raster mit den Zeilen Text (auto), Bild (`minmax(--bild-min, 1fr)`) und Erdreich (auto), Mindesthöhe `100svh` − Kopf.
  - Die Zeichnung hängt an der Bodenlinie (`--dy` aus `100cqh` der Bildzeile).
  - Zusätzliche Höhe wird zu Luft über dem Haus. Das Erdreich mit der Hauptaktion sitzt unten in der Daumenzone.
  - `--bild-min` ist aus Tokens gerechnet: Haus bis zur Oberkante des Maßes „13:30“.
- **Angeschnittenes Haus (hoch, ab 760 px):** Die Uhr sitzt bei 90 % der Breite, die rechte Wand und die Dachhälfte laufen aus dem Bild. Fenster und Tür lägen im Schnitt; sie entfallen auf dem Handy, statt als 2–8 px breite Reste am Rand zu stehen.
- **Maße an der Zeichnung:** links die Sonne mit „30 Tage Urlaub“, darüber „13:30 Freitags Feierabend“ mit Hinweislinie zur Uhr. Im Erdreich stehen „35 km Einsatzradius“ mit Maßkette und „1926 Gegründet“ am Fundament.
- **Strang in die Daumenzone:** Aus dem Boden der Wärmepumpe fallen Vorlauf und Rücklauf im Abstand `--paar` senkrecht in „Jetzt bewerben“. Der Knopf ist so breit, dass beide Leitungen in ihm münden. Daneben steht „Offene Stellen ansehen ↓“, darunter der Mikrotext.
- **Höhenstufen** (Folgeauftrag §6). Geprüft auf der sichtbaren Browserfläche, nicht auf der Bildschirmgröße des Geräts:

| Stufe (Höhe) | Komposition | Ansicht | Hauptaktion | Mikrotext endet | sichtbar |
|---|---|---|---|---|---|
| hoch (ab 808 px) | Haus angeschnitten, `--s` .68/.74, Maße an der Zeichnung | 390 × 844 | 741–797 | 828 / 844 | ja |
| | | 375 × 812 | 709–765 | 796 / 812 | ja |
| | | 430 × 932 | 829–885 | 916 / 932 | ja |
| B (680–807 px) | ganzes Haus kleiner (`--s` .56, Uhr bei 79 %), Fenster und Tür sichtbar, H1 bis 68 px, alle vier Maße an der Zeichnung | 390 × 750 | 647–703 | 734 / 750 | ja |
| | | 430 × 740 (iPhone 14 Pro Max) | 648–704 | 735 / 740 | ja |
| C (600–679 px) | Haus `--s` .5, H1 60 px; 35 km und 1926 rücken unter den Mikrotext | 390 × 664 (iPhone 13/14) | 566–622 | 654 / 664 | ja |
| | | 393 × 659 (Pixel) | 566–622 | 654 / 659 | ja |
| | | 375 × 667 | 566–622 | 653 / 667 | ja |
| D (unter 600 px) | ganzes Haus klein (`--s` .4, auf 320 .34), Uhr auf 13:30 bleibt im Bild, H1 48 px; alle vier Maße als Schriftfeld unter dem Mikrotext | 375 × 553 (iPhone SE) | 461–517 | 548 / 553 | ja |
| | | 320 × 568 | 439–495 | 550 / 568 | ja |

  Bilder: `erster-bildschirm/hoehen/*__streifen.webp` und `*__ende.webp`, hell und dunkel; Werte in `erster-bildschirm/hoehen/bericht.json`.
- **Warum diese Geste:** Am Handy gewinnt die Schrift den ersten Blick (Ort und Angebot). Das Haus zeigt die Zusagen. Die zwei Leitungen führen den Daumen zum Knopf. Auf kleiner Fläche wird nicht beschnitten, sondern neu gesetzt: Das ganze Haus wird kleiner, und Maße, die nicht mehr an die Zeichnung passen, gehen als Schriftfeld unter die Hauptaktion. Die Uhr mit 13:30 bleibt in jeder Stufe im ersten Bildschirm.

Desktop (1440 × 900):

- H1 links oben, darunter die Zweitzeile mit Rohrklammer und die Einleitung.
- Das Haus rechts als große Geste, bis kurz unter den Kopf (330 Einheiten × 1,4 = 462 px Hausrumpf).
- Die Maße als Callouts am rechten Satzspiegelrand: 13:30 mit unterstrichener Hinweislinie vom Stundenzeiger, 35 km als Radiuslinie vom Dach bis an den Bildschirmrand. Die Sonne steht zwischen H1 und Dach.
- Eine Bodenlinie quer über die ganze Seite. Darunter liegt das Erdreich mit der Hauptaktion, in die beide Leitungen mit konzentrischen Bögen münden, und dem Fundament mit der Jubiläums-Maßkette.

Laptop-Höhen (neu geprüft, `erster-bildschirm/hoehen/`):

| Ansicht | Maßnahme | Hauptaktion | Mikrotext endet |
|---|---|---|---|
| 1024 × 768 | Haus um `--a-7` nach links (`--versatz`): „35 km“ steht frei neben der Dachschräge, „30 Tage Urlaub“ unter der Sonne mit Abstand zum Dach | 628–684 | 726 / 768 |
| 1280 × 720 | Stufe `--s` .8 schon ab 720 px Höhe, H1 nach Höhe begrenzt (`min(8.6vw, 14svh)`), engere Abstände | 580–636 | 678 / 720 |
| 1366 × 650 | wie 1280 × 720 | 533–589 | 631 / 650 |

Die Zeichnung skaliert in festen Stufen (`--s`, eine Einheit = `--s` px). Darum ist jeder Strich auf jeder Breite genau 3 px, ohne `non-scaling-stroke` (das in Chromium die `pathLength`-Animation bricht). Die Stufen sind:
- mobil und Tablet: 0,34 / 0,4 / 0,5 / 0,56 / 0,58 / 0,68 / 0,74 / 0,9, nach Breite und Höhe;
- Desktop: 0,8 / 1,0 / 1,2 / 1,4 / 1,55 / 1,7, nach Breite und Höhe.

## 6. Ruhige Fassung (reduzierte Bewegung)

- Kein Startzustand, keine Animation, keine Übergänge (`prefers-reduced-motion: reduce` setzt alle Dauern auf null, das Kopfskript setzt keine Klasse).
- Gestaltet ist ein stehendes Bild, keine angehaltene Animation:
  - Der Kreislauf steht vollständig. Das Haus ist warm (Pfirsichfläche).
  - Vorlauf und Rücklauf tragen **Fließpfeile**: zum Heizkörper rot, zurück blau. Die Richtung ist also ohne Bewegung lesbar, und die Farbe ist nicht die einzige Information (Pfeil plus Lage oben und unten).
  - Die Uhr zeigt 13:30. Ihre Hinweislinie und die Maßketten machen das Bild zur Bauzeichnung.
  - Die Leitungen münden in den Knopf.
- Licht und Komposition tragen den Eindruck: warmes Papier, eine Fläche (Wärme), Navy-Strich, Rot nur als dünne Linie und als Knopffläche.
- **Dunkles Thema:** ein Nachtplan aus Navy-Fläche, Cremestrich, aufgehelltem Rot und Blau.
  - Das warme Haus ist jetzt aus der Palette abgeleitet: **Glut #47445B = #FADCC9 zu 25 % auf Nacht**. Sie steht zur Fläche bei 1,95:1, in Runde 1 (Pflaumenton #3A2234) waren es 1,26:1.
  - Linien darauf: Creme 8,24:1, Vorlauf #FF6B5F 3,35:1, Rücklauf #86AEFF 4,24:1. „Das Haus wird warm“ bleibt im Dunkeln lesbar.
- Belege: `erster-bildschirm/*-reduziert__*` (alle Bilder gleich, ab dem ersten Bild vollständig) und `fotos/*-reduziert__*`.
- Das Handy-Menü öffnet sofort, ohne Einschub.

## 7. Wahrheit: Quelle je Zeile

| Stelle | Inhalt | Quelle |
|---|---|---|
| Ortsmarke | Seit 1926 · Wetzlar | `content.ts` HERO.eyebrow |
| H1 | SHK-Jobs in Wetzlar. / Ehrliches Handwerk. Pünktlich Feierabend. | `content.ts` HERO.title, HERO.titleSecondLine |
| Einleitung | Wir suchen Verstärkung für … Hilti-Ausstattung. | `content.ts` HERO.lead |
| Hauptaktion | Jetzt bewerben → `/bewerbung` | `nav.ts` SHORT_APPLY_LABEL, APPLY_PATH |
| Mikrotext | Dauert ca. 60 Sekunden. Kein Lebenslauf nötig. | `content.ts` HERO.microcopy |
| Zweiter Weg | Offene Stellen ansehen → `#stellen` | `components/home/Hero.tsx` (Plattform-Wortlaut) |
| Maße | 13:30 Freitags Feierabend · 30 Tage Urlaub · 35 km Einsatzradius · 1926 Gegründet | `content.ts` HERO_STATS (`facts.ts` friday1330, vacation30, radius35, founded1926; Etikett „Einsatzradius“ aus STAT_LABELS) |
| Fundament | 100 Jahre Meisterbetrieb (1926–2026), mit `data-bis="2026-12-31"` | `facts.ts` anniversary100 (validUntil 2026-12-31) |
| Navigation | Stellen, Vorteile, Ablauf, FAQ | `nav.ts` NAV_ITEMS |
| Telefon | 06441 42956, tel:+49644142956 | `lib/data/contact.ts` CONTACT_PHONE |
| Logo-Link | „Bad und Energie GmbH Lahn Dill, zur Startseite“ → `/` | Plattform `HeaderBar.tsx`, Alt-Text aus `Logo.tsx` |
| Bedienwörter | Menü, Schließen, Zum Inhalt springen, „ anrufen“ | Plattform `MobileNav.tsx`, `Sheet.tsx`, `SkipLink.tsx`, `HeaderBar.tsx` |
| H2 Anschluss | Freitags ab 13:30 Uhr Feierabend | `facts.ts` friday1330.short |
| Absatz | Feste Arbeitszeiten: Montag bis Donnerstag … 13:30 Uhr. | `facts.ts` workingHours.long |
| Verteiler | Mo–Do 07:00–16:45, Fr 07:00–13:30, Sa/So „Kein Wochenend-Notdienst“; Achse 07 · 10 · 13 · 16 (Stunden, Beschriftung) | `facts.ts` workingHours, noWeekendOnCall.short |
| H2 Offene Stellen | Offene Stellen | `components/home/JobList.tsx` (Plattform-Wortlaut) |
| Stellen | Anlagenmechaniker SHK 3.600–4.600 € / Monat; Kundendiensttechniker 3.800–4.900 €; Obermonteur / Projektleiter 4.400–5.600 €; Ausbildung Anlagenmechaniker 1.050–1.400 € | `lib/jobs/data/*.ts` (shortTitle, salary, slug, status published), Format wie `lib/jobs/format.ts`; die Quereinstiegsstelle (`funnel_only`) fehlt wie auf der Plattform |

- Der Erklärsatz zur Wärmepumpe (T-001) ist **nicht** verwendet. Kein Text ist erfunden.
- Die Zeichnung, die Rohrklammer und der Trenner sind dekorativ (`aria-hidden`). Alle Fakten stehen als echter Text in einer Liste.
- **Telefon mobil:** Sichtbar ist nur der Hörer. Die Nummer ist visuell versteckt, aber nicht mit `display: none`, und bleibt im Namen. Gemessen per `ariaSnapshot` (m390): `link "06441 42956 anrufen"`. In Runde 1 hieß der Link dort nur „anrufen“. Der Überlaufbericht von kachel-fotos listet die versteckte Nummer deshalb als „clipped“; das ist gewollt und kein Überlauf.
- Deutsch:
  - geschützte Leerzeichen in allen Zahl-Einheit- und Zahl-Wort-Paaren (35 km, 60 Sekunden, 13:30 Uhr, 100 Jahre, 06441 42956, €), Halbgeviertstrich für Bereiche;
  - `lang="de"`;
  - Ziffern im Fließtext in der Display-Schrift (Atkinson zeichnet die Null mit Schrägstrich und hat keine Alternative; geprüft: Merkmale ccmp, frac, locl, pnum, tnum). Neu: **im Gewicht des umgebenden Texts** (`font-weight: inherit`), also 400 im Absatz und im Mikrotext, 700 nur in der fetten Telefonzeile. „60“, „07:00“ und „16:45“ sind nicht mehr fetter als der Satz.

## 8. Schrift und Schrift-Austauschprobe

- **Display:** Bricolage Grotesque 800, −0,01 em; die optische Größe stellt der Browser, kein erzwungener Achsenwert.
- **Text:** Atkinson Hyperlegible Next 400/700.
- **Maße:** Martian Mono (Breite 75 % für Werte, 75 % für Etiketten in Versalien +0,06 em, 87,5 % für die Planbeschriftung).
- Das sind zwei Familien und eine Mono.
- **Austauschprobe** (`schriftprobe.webp`, H1 und Hauptmaß in acht Schriften aus `_relaunch/richtungen/schriftpool`). Gemessen ist die Breite von „in Wetzlar.“ bei 100 px und −0,01 em, daraus die größte H1 auf 390 px:

| Schrift | Breite | H1 max. auf 390 | Eindruck |
|---|---|---|---|
| Bricolage Grotesque 800 | 449 px | 79 px | eigenwillige Details (K mit Tintenfalle, offenes a, kräftige Punkte), warm, Hausbeschriftung |
| Archivo 68 % 800 (A) | 367 px | 97 px | schmal, technisch, kalt; mit Martian Mono wird alles zum Plan |
| Big Shoulders Display 800 | 374 px | 95 px | Schildschrift, hart, widerspricht dem freundlichen Ton |
| Rethink Sans 800 | 426 px | 84 px | sauber, aber ohne Handschrift |
| Familjen Grotesk 700 | 460 px | 77 px | weich, leichter (nur bis 700) |
| Hanken Grotesk 800 | 469 px | 76 px | neutral |
| Gabarito 800 | 472 px | 75 px | breit, weich |
| Schibsted Grotesk 800 | 518 px | 69 px | breit, Zeitungsgrotesk |

- **Was Bricolage hier eigen macht:** Die Schrift ist nicht allein. Sie spricht die Botschaft, Martian Mono spricht die Maße. Erst dieses Zweistimmen-System (warme Botschaft, präziser Plan) trägt die Leitidee. Mit Archivo oder Big Shoulders würde auch die Botschaft zum Plan, mit Rethink oder Hanken würde sie anonym.
- **Stärkste Alternative:** Archivo 68 %. Sie gäbe mobil 20 % größere Schrift (97 statt 79 px). Gerade auf den flachen Handy-Höhen (Stufen B–D) wäre das ein Vorteil. Sie kostet aber den warmen Ton der Grundrichtung B, die der Auftraggeber gewählt hat (E-019).
- **Entscheidung:** Der Unterschied ist nicht deutlich genug, also kein Wechsel. Fällt Bricolage in der Jury als „Trendschrift“ auf, ist Archivo 68 % der vorbereitete Tausch (eine Variable).

## 9. Bewegungsregister

**Tokens:**
- Dauern: `--d-1` 120 ms, `--d-2` 240 ms, `--d-3` 400 ms, `--d-4` 600 ms (4 Stufen; `--d-5` entfällt).
- Takt `--takt` 80 ms; alle Verzögerungen sind Vielfache davon (½ Takt in der Luft und im Menü).
- Kurven: `--k-aus` (.16, 1, .3, 1), `--k-wechsel` (.65, 0, .35, 1), `--k-ein` (.32, 0, .67, 0), dazu `linear`.

**Auslöser:**
- „Aufruf“ heißt: Klasse `auftakt` aus dem Kopfskript, einmal, nur ohne reduzierte Bewegung.
- **Jedes animierte Element trägt seine Kennung selbst als `data-motion`** (Luftpfade, Zeiger, Linien und Bögen der Erdleitungen; in Runde 1 stand sie dort am Elternelement). Bei Übergängen an `::before`/`::after` trägt das Element des Pseudo-Elements die Kennung.

**Regel für Ein- und Ausgänge:** Eingänge (Hover, Menü öffnen) nehmen d-2 mit k-aus. Ausgänge (Hover verlassen, Menü schließen) nehmen die nächstkleinere Stufe d-1 mit der beschleunigenden Kurve k-ein.

| data-motion | Zweck | Auslöser | Eigenschaft | Dauer · Verzögerung | Kurve | Reduziert |
|---|---|---|---|---|---|---|
| `luft` (je Pfad) | Die Pumpe zieht Luft (Logo-Motiv Luft) | Aufruf | stroke-dashoffset | d-2 · 0 / ½ / 1 Takt | k-aus | Endzustand |
| `luefter` | Die Anlage läuft an | Aufruf | transform (rotate, ½ Umdrehung) | d-3 · 0 | k-wechsel | steht |
| `vorlauf-haus` | Wärme geht ins Haus | Aufruf | stroke-dashoffset | d-3 · 2 Takte | k-wechsel | Endzustand mit Pfeil |
| `waerme` | Das Haus wird warm (Pegel steigt) | Aufruf | transform (translateY des Clip-Rechtecks) | d-4 · 4 Takte | k-aus | Haus warm |
| `ruecklauf-haus` | Rücklauf kehrt zurück | Aufruf | stroke-dashoffset | d-3 · 6 Takte | k-wechsel | Endzustand mit Pfeil |
| `erdleitung` (mobil, je Leitung) | Die Leitungen fallen in den Knopf (Daumenzone) | Aufruf | transform (scaleY; Vorlauf von oben, Rücklauf von unten) | d-2 · 5 bzw. 8 Takte | k-wechsel | stehen |
| `erdleitung-d` (Desktop, je Linie und Bogen) | Der Vorlauf verlängert sich in die Hauptaktion, der Rücklauf kommt zurück | Aufruf | stroke-dashoffset | Vorlauf: Fall d-1, Bogen d-1, Lauf d-2 ab 4 Takten; Rücklauf: Lauf d-2, Bogen d-1, Fall d-1 ab 8 Takten | linear (Fall, Bogen), k-aus / k-ein (Lauf) | Leitungen stehen |
| `pfeile` | Fließrichtung bestätigen | Aufruf | opacity | d-2 · 9 Takte | k-aus | sichtbar |
| `uhr` (je Zeiger) | Schlusstakt: Der Freitag rastet auf 13:30 ein (Bindung an die Zusage) | Aufruf | transform (Minutenzeiger 180°, Stundenzeiger 15°) | d-2 · 11 Takte | k-aus | 13:30 |
| `menue-oeffnen` | Menü als eigener Moment | Tippen auf „Menü“ / „Schließen“ | opacity, transform (Übergang, `@starting-style`) | öffnen d-2, schließen d-1 | k-aus / k-ein | sofort |
| `menue-leitung` | Das Leitungspaar fällt in den Knopf | Menü offen | transform (scaleY) | d-2 | k-aus | steht |
| `menue-eintrag` | Einträge zweigen ab | Menü offen | opacity, transform (translateX) | d-1 · Staffel ½ Takt (40 ms), 4 Einträge, fertig nach 240 ms | k-aus | sofort |
| `unterstrich` | Hover-Rückmeldung Navigation, Telefon (Kopf und Menü), Logo; Strich in Navy (dunkel Creme), am Logo in Navy auf der Plakette | Hover (nur `hover: hover` und `pointer: fine`) | transform (scaleX) | ein d-2, aus d-1 | k-aus / k-ein | sofort |
| `flaeche` | Hover-Rückmeldung „Menü“ und „Schließen“ (sichtbar bis 1023 px, also auch mit Maus) | Hover (wie oben) | opacity (Fläche `--flaeche-2`) | ein d-2, aus d-1 | k-aus / k-ein | sofort |
| `druck` | Hover- und Druck-Rückmeldung der Hauptaktion | Hover, `:active` | opacity der Deckschicht: Hover #B00000 (`--p-rot-hover`, volle Deckkraft), `:active` #A80000 (`--p-rot-druck`) sofort, dazu translateY 1 px | ein d-2, aus d-1 | k-aus / k-ein | sofort |

Ohne Animation: Der Zweitweg wechselt beim Hover nur die Unterstrichfarbe auf Rücklaufblau, ohne Übergang.

Es gibt keine Schleife, keinen Scroll-Auftritt, kein Scroll-Hijacking und keinen Zähler. Nichts läuft länger als 1,12 s, darum ist kein Pause-Knopf nötig.

Gemessen: Ende aller Abläufe ≤ 1.120 ms; Keyframe-Eigenschaften nur `stroke-dashoffset`, `opacity`, `transform`; 0 Abläufe ohne eigenes `data-motion` (m390 15, d1440 19, hell und dunkel). Menü: öffnen 240 ms, schließen 120 ms.

## 10. Tokens, Farben, Zugänglichkeit, Budgets

- **Tokens** (gemessen per `getComputedStyle` über alle Elemente und Pseudo-Elemente, je Ansicht m320, m375, m390, 390 × 664, 375 × 553, m430, t768, 1024 × 768, 1366 × 650, d1440, d1920, hell und dunkel):
  - **Schriftgrößen:** 7 Stufen je Ansicht (m390: 14 / 15 / 17,2 / 20,1 / 24 / 32 / 76,2 px; d1440: 14 / 16 / 20 / 29 / 34,4 / 52,8 / 127,8 px). Die kleinste Schrift ist 14 px. Die H1 erbt jetzt die Textgröße statt der Browser-Vorgabe 2em.
  - **Abstände:** 11 Stufen (4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128 px). Abweichungen gibt es nur bei `margin: auto` (Logo, zentrierte Abschnitte).  Die Einrückung der Zweitzeile (Rohrklammer) ist `--a-6`.
  - **Radien:** 4 Stufen (4, 12, 24, 999 px); 24 = `--r-3` = `--r-2` + `--paar`, der äußere Bogen eines Paars.
  - **Paarabstand:** `--paar` = `--a-3` = 12 px.
  - **Dauern:** 4. **Kurven:** 3 plus linear. **Schatten:** einer, nur als Brückenlücke im Verteiler.
  - **Farben:** nur Palette-Tokens nach E-016, keine Mischfarbe ohne Token. Hover des Knopfs ist eigener Token `--p-rot-hover` #B00000 (Runde 1: #A80000 zu 75 % = #B40000, außerhalb des Bereichs).
- **Rot (E-016, Auslegung):** Rot ist Fläche nur am Knopf (#D60000, Hover #B00000, Druck #A80000). Als dünne Linie erscheint es nur als Vorlauf: in der Zeichnung, im Erdreich, in der Rohrklammer, im Trenner, im Menü (nur die senkrechte Leitung) und im Verteiler.
  - Keine Hervorhebung ist rot. Die Hover-Unterstriche von Navigation, Telefon und Logo sind Navy (dunkel Creme), der Zweitweg wird Rücklaufblau, die Menü-Abgänge sind Navy.
  - Gemessen (d1440): Hover-Strich Navigation `rgb(17, 29, 109)`, dunkel `rgb(246, 240, 228)`; Zweitweg `rgb(31, 87, 196)`, dunkel `rgb(134, 174, 255)`; Knopf-Hover `rgb(176, 0, 0)` bei Deckkraft 1.
- **Strich:** eine Stärke, 3 px (`--m-strich`) für Zeichnung, Ikonen, Rahmen, Fokus, Leitungen und jetzt auch den Unterstrich des Zweitwegs und der Stellentitel (Runde 1: 2 px). Haarlinien 1 px nur als Raster (Verteiler, Achsstriche, Stellenliste).
- **Kontraste** (WCAG 2.2, aus den Hexwerten gerechnet):

| Paar (hell) | Wert |
|---|---|
| Tinte / Papier | 15,93 |
| H1 Navy / Papier | 13,84 |
| Tinte 2 / Papier | 7,69 |
| Tinte 2 / Wand | 6,81 |
| Weiß / Rot (Knopf) | 5,44 |
| Weiß / Rot Hover #B00000 | 7,38 |
| Weiß / Rot gedrückt #A80000 | 7,88 |
| Vorlauf Rot / Papier | 5,10 |
| Vorlauf Rot / Wärme | 4,18 |
| Rücklauf Blau / Papier (auch Fokus) | 6,11 |
| Rücklauf Blau / Wärme | 5,02 |
| Navy / Wärme | 11,37 |

| Paar (dunkel) | Wert |
|---|---|
| Creme / Nacht | 16,03 |
| Creme 2 / Nacht | 10,36 |
| Weiß / Rot | 5,44 |
| Vorlauf #FF6B5F / Nacht | 6,52 |
| Rücklauf und Fokus #86AEFF / Nacht | 8,24 |
| Glut #47445B / Nacht (Fläche) | 1,95 |
| Linien Creme / Glut | 8,24 |
| Vorlauf / Glut | 3,35 |
| Rücklauf / Glut | 4,24 |
| Knopf / Nacht | 3,34 |

- **Zugänglichkeit:** axe-core (WCAG 2 A/AA, 2.1, 2.2 AA, Best Practice) meldet **0 Verstöße** in m320 (320 × 568), m375, m390, 390 × 664, 375 × 553, m430, t768, 1024 × 768, 1366 × 650, d1440 und d1920, hell und dunkel. Weiter gilt:
  - Fokus 3 px `outline` mit 3 px Abstand (`:focus-visible`, unverändert seit Runde 1);
  - 0 Bedienelemente unter 44 × 44 px; Sprunglink vorhanden;
  - jedes Bedienelement hat einen Hover-Zustand, wo Hover vorkommen kann. Neu sind „Menü“, „Schließen“ (Fläche) und das Logo (Unterstrich). Gemessen bei 900 × 700 mit Maus: Fläche `rgb(241, 233, 219)` bei Deckkraft 1;
  - das Menü ist ein natives Popover: ohne Skript bedienbar, Escape schließt, Leicht-Schließen;
  - die Zeichnung ist `aria-hidden`, Fakten und Arbeitszeiten stehen als Text (je Tag „07:00–16:45 Uhr“ für Screenreader).
- **Ohne JavaScript:** alles sichtbar, Endzustand der Zeichnung, Menü funktioniert (Popover).
- **Druck:** Alle Rollen-Tokens gehen auf die hellen Primitiven zurück: Papier `--p-weiss`, Tinte `--p-tinte`, Zweitzeile `--p-tinte-2`, Wärme `--p-waerme`, Vor- und Rücklauf `--p-rot`/`--p-blau`, Plakette transparent; Navigation und Menü sind ausgeblendet. Geprüft mit Druck-Emulation **und dunklem Schema**: Fläche weiß, Zweitzeile und Mikrotext #454C78, Haus #FADCC9, Vorlauf #D60000, Rücklauf #1F57C4. In Runde 1 blieben dort #BDC2E0 auf Weiß (1,8:1) und das dunkle Haus.
- **Druckzustände:** eigene `:active`-Zustände statt grauer Tipp-Markierung (`-webkit-tap-highlight-color: transparent`).
- **Raum:** Höhen in `svh`, Abstände für sichere Bereiche über `env(safe-area-inset-*)`, Dokumenthintergrund gleich dem Einstieg (kein weißer Rand beim Überziehen). Kein horizontaler Überlauf von 320 bis 1920 px.
- **Budgets:**

| Posten | Wert |
|---|---|
| Schriften | 6 Dateien, 223.864 Byte = 218,6 KiB (Budget 250 KB) |
| davon geladen | 3 Dateien (latin), 145,9 KiB; zwei vorgeladen |
| JavaScript | 179 Byte roh, **146 Byte gzip** (nur Kopfskript, keine Bibliothek) |
| `index.html` | 53,1 KB roh / 13,9 KB gzip |
| davon CSS | 37,6 / 10,0 KB gzip |
| Zeichnung | 4,1 / 1,4 KB gzip |
| Anfragen | **5** (HTML, Logo, drei Schriften); Favicon inline, keine Fremdanfrage (`fotos/bericht.json`: 0) |

## 11. Prüfskript

`pruefung/erster-bildschirm-plus.mjs` ergänzt `_relaunch/werkzeuge/erster-bildschirm.mjs` (das nur die festen Ansichten kennt und keine CPU-Drosselung hat):

- **Aufnahme:** dasselbe Verfahren (CDP-Screencast, Bilder bei 0 … 1.500 ms, Streifen). Dazu frei wählbare Ansichten als sichtbare Browserfläche und `--cpu 4`.
- **Bericht:** Lage von Hauptaktion und Mikrotext im Endzustand und das Ergebnis „sichtbar“. Außerdem das erste nicht leere Bild und die letzte echte Bildänderung (Pixelvergleich).
- **Aufruf:** `node _relaunch/ausbau/richtungen/1/pruefung/erster-bildschirm-plus.mjs --url http://localhost:3801/ --out _relaunch/ausbau/richtungen/1/erster-bildschirm/hoehen [--vps …] [--cpu 4]`.

## 12. Risiken

1. **Austauschbares Grundmotiv:** Haus und Wärmepumpe sind ein Allerweltsbild. Die Richtung trägt nur mit Uhr, Jubiläums-Fundament, 35-km-Linie und Verteiler. Ändert sich eine Zusage, muss die Zeichnung mitziehen.
2. **Safari nicht geprüft:** Nur Chromium 141 war verfügbar. Kritisch sind:
   - die CSS-Animation des Clip-Rechtecks (Wärmepegel), `calc()` in Längen;
   - Container-Einheiten: `cqw` am Einstieg, neu `cqh` an der Bildzeile mit `container-type: size`;
   - Popover mit `@starting-style` (Safari ≥ 17.5), `text-wrap: balance`.

   Wo es scheitert, greift der Endzustand. Eine Geräteprobe gehört in MENSCHEN.md.
3. **Stufen statt Fluss:** Mobil gibt es jetzt vier Höhen- und vier Breitenstufen. Jede Stufe ist eigens gesetzt und gemessen (§5). Zwischen den Stufen wächst die Zeichnung nicht stufenlos mit. Das ist der Preis für exakt 3 px Strich und die Strichanimation.
4. **Flache Handys (Stufen C/D):** Unter 680 px Höhe stehen 35 km und 1926 (unter 600 px auch 13:30 und 30 als Text) unter dem Mikrotext, also knapp unter dem Falz. Die Uhr mit 13:30 und die Ortsmarke „Seit 1926“ bleiben oben. Der Chef sieht auf 390 × 844 alle vier Maße an der Zeichnung.
5. **Telefon quer und geteilte Tablet-Fenster:** Unter 450 px Höhe (Telefon quer) passen H1, Einleitung und Hauptaktion nicht auf eine Fläche; die Hauptaktion folgt nach einem Bildlauf. Tablet-Fenster unter 64em Breite und unter 808 px Höhe sind eigens gesetzt (768 × 700, 1023 × 700: Hauptaktion und Mikrotext sichtbar), aber nur per Augenschein geprüft.
6. **Rot-Menge:** Rot ist Fläche nur am Knopf. Als dünne Linie läuft es im Haus, im Erdreich, in Klammer und Trenner, im Menü und fünfmal im Verteiler. Das ist durch E-016 gedeckt; die Jury könnte den Verteiler trotzdem als „viel Rot“ lesen. Rückfall: Vorlauf im Verteiler in Navy, nur der Freitag rot.
7. **Jubiläum:** Das Fundament zeigt „100 Jahre Meisterbetrieb (1926–2026)“ bis 31.12.2026 (`data-bis`). Der Prototyp blendet es nicht automatisch aus; die Plattform muss `validUntil` lesen.
8. **Kein Foto, kein Gesicht:** Das ist so gewollt (K-014), die Jury hat es in Runde 1 bemängelt (offen, siehe Fragen).
9. **Zeichnungswerte der Erdleitungen** hängen an vier Tokens (§4). Die Abhängigkeit ist dokumentiert, aber nicht automatisch gerechnet.

## 13. Offene Fragen

1. **Leitfaden auf der Stellenseite** (§4, Punkt 5): Tageskreis, Gehalts-Maßkette und Zuleitung in den eingebetteten Ablauf sind ein Vorschlag. Das entscheidet der Dramaturg.
2. **Logo-Motive als Funktionsteile** (Sonne als Urlaubsskala, Luft an der Wärmepumpe): Sie greifen das Logo auf, zeichnen es nicht nach. Freigabe durch den Auftraggeber?
3. **Telefonnummer 06441 42956:** Ist das die Nummer für Bewerber (Sabri Demir)? Offen wie in B Runde 2.
4. **Bricolage oder Archivo 68 %** (§8): Bleibt die Display-Schrift, wenn die Jury „Trendschrift“ meldet?
5. **Gesicht des Betriebs:** Echte Fotos widersprechen K-014. Soll es eine Ausnahme für ein echtes Betriebsfoto geben?
6. **Navigationsziel „Kontakt“:** Es fehlt in `nav.ts` (Stellen, Vorteile, Ablauf, FAQ). Erreichbarkeit läuft hier über das Telefon im Kopf und im Menü.
7. **Wegweiser „Wetzlar“ und Pfeil-Knopf aus B Runde 1:** nicht übernommen. Der Ort steht in H1 und Ortsmarke, und der Knopf trägt den Flansch der Leitung. Soll eines davon zurückkommen?

## 14. Befunde und ihre Reparatur

### Runde 2 (Gegenprüfung)

| Befund | Gewicht | Reparatur | Nachweis |
|---|---|---|---|
| Hauptaktion mobil unter dem Falz (390 × 664, 430 × 740, 375 × 553 …) | hart | Raster mit Bodenverankerung, vier Höhenstufen mit eigener Komposition (§5) | `erster-bildschirm/hoehen/`: in allen geprüften Ansichten sichtbar |
| Rote Hover-Unterstriche (Navigation, Telefon, Zweitweg) | hart | Navy/Creme bzw. Rücklaufblau | Hover gemessen (§10) |
| Knopf-Hover #B40000 ohne Token | hart | `--p-rot-hover` #B00000 bei voller Deckkraft | `rgb(176, 0, 0)` gemessen |
| Kein Hover an „Menü“, „Schließen“, Logo | hart | Fläche (`flaeche`) bzw. Unterstrich (`unterstrich`), im Register | §9, §10 |
| `data-motion` am Elternelement statt am animierten Element | hart | Kennung an jedem Pfad, Zeiger, jeder Linie | 0 Abläufe ohne `data-motion` |
| Laptop-Höhen (1024 × 768, 1280 × 720, 1366 × 650) | weich | `--versatz`, Stufe .8 ab 720 px Höhe, H1 nach Höhe | §5, `hoehen/l*` |
| Telefon mobil nur „anrufen“ | weich | Nummer visuell versteckt statt `display: none` | `link "06441 42956 anrufen"` |
| Verteiler beginnt mobil vor 07:00 | weich | Rücklauf-Verteiler genau auf 07:00, Achse 07 · 10 · 13 · 16 | §4 |
| Paarabstand uneinheitlich | weich | `--paar`, konzentrische Bögen `--r-2`/`--r-3`, Ausnahme Zeichnung benannt | §4 |
| Fünf Bewegungen zugleich, zwei 540°-Drehungen | weich | Lüfter ½ Umdrehung am Anfang, Uhr als Schlusstakt 880–1.120 ms, ½ Umdrehung | §3, §9 |
| Auftakt endet knapp an 1,5 s | weich | Ende 1.120 ms nach erstem Bild; ab Aufruf 1,23–1,29 s, mit 4× CPU-Drosselung 1,35 s (m390) und 1,45 s (d1440) | §3 |
| Ausgänge wie Eingänge | weich | Ausgang d-1 mit k-ein | §9 |
| Dunkles Haus kaum warm (1,26:1, Pflaumenton) | weich | Glut aus #FADCC9 zu 25 % auf Nacht (1,95:1) | §6, §10 |
| Klammer und Trenner aus B fehlen | weich | Rohrklammer an der Zweitzeile, Leitungstrenner am Übergang zur Woche | §4 |
| Ziffern fett im Fließtext | weich | `font-weight: inherit` | §7 |
| Reste von Fenster und Tür am rechten Rand | weich | auf dem Handy-Anschnitt ausgeblendet, in den Stufen mit ganzem Haus sichtbar | `fotos/m375-light-voll__01.webp` |
| H1 bei 320 im Rand | weich | eigene Stufe unter 360 px | §5 |
| Druck im dunklen Schema | weich | alle Rollen auf helle Primitive | §10 |
| H2 „Offene Stellen“ ohne Quelle | weich | Zeile in §7 | §7 |
| Erdleitungen am Desktop mit festen Pixeln | weich | Lage aus Tokens, SVG-Werte als abgeleitete Zeichnungswerte dokumentiert | §4 |
| Rote Menü-Abzweige, 2-px-Unterstrich | weich | Abgänge in Navy, Unterstrich 3 px | §10 |

### Runde 1 und Lauf 1 (bleiben behoben)

| Befund | Stand hier |
|---|---|
| 320 px abgeschnitten | 320 × 568 gemessen: kein Überlauf, Logo auf 24 px Höhe, Menü passt, Hauptaktion und Mikrotext sichtbar |
| Logo-Link zu klein, falsches Ziel | 44 px hoch, Ziel `/`, Name wie Plattform |
| Freie Werte (S-05) | Tokens, gemessen (§10); Zeichnung in Einheiten × `--s` |
| Mobil als gestapelter Desktop | eigene Komposition mit Höhenstufen (§5) |
| Aufblitzen des Startzustands | Klasse vor dem ersten Rendern, erstes Bild zeigt den Startzustand; kein Rücksetzen nach dem Malen, kein Neuzeichnen bei 2 s (Füllart `backwards`, Bildvergleich) |
| Touch-Ziele | 0 unter 44 px |
| Geschützte Leerzeichen | alle Zahl-Einheit- und Zahl-Wort-Paare |
| Laufweite zu eng, erzwungene opsz | −0,01 em, keine Achse erzwungen |
| Etiketten 11–12 px | ab 14 px |
| Navigation „System“ / „Plan“ | `nav.ts`, Knopf „Menü“ |
| Schrägstrich-Null im Fließtext | Ziffern in Bricolage, im Gewicht des Satzes |
| Erklärtext Wärmepumpe | nicht verwendet (T-001 bleibt Vorschlag) |
| Signaturmoment nur Heizungsschema | an 13:30 (Schlusstakt) und an die Hauptaktion gebunden (§2, §3) |

=== ENDE A2-RICHT-1 · BEREIT ZUR RÜCKGABE ===
