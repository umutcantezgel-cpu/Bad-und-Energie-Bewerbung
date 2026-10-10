# Richtung 3 · „Grenze – Wärmebild“ · Begründung (A2-RICHT-3, Runde 2)

Prototyp des ersten Bildschirms der Startseite mit Anschluss: `index.html` (eigenständig, ohne Build, eigene `fonts/`, unverändertes `logo.png`), ausgeliefert mit `npx --yes http-server <ordner> -p 3803 -c-1 -s`. Der eine WebGL-Moment liegt nachgeladen in `js/waermebild.js` mit der Feldtextur `js/feld.png`. Die Szene wird in `bau/` gerechnet und gezeichnet (`node bau/feld.mjs && node bau/einsetzen.mjs`). Prüfskripte und Ergebnisse liegen in `pruef/` und `pruef/belege/`. Bildbelege: `fotos/`, `erster-bildschirm/`, `aufzeichnung/` (für Runde 2 vollständig gelöscht und neu erzeugt). Stand 09.10.2026.

Runde 2 repariert alle Befunde der Gegenprüfung. Übersicht in §0, Nachweise in den Abschnitten und in `pruef/belege/runde2.json`, `auftakt.json`, `webgl.json`, `pruefen.json`.

## 0. Runde 2: Befunde und Behebung

| Befund | Behebung | Beleg |
|---|---|---|
| **HART Erster Augenblick ≤ 1,5 s** | Das Kopfskript steht jetzt hinter den Tokens und rechnet ab `performance.timeOrigin`. Ohne WebGL (saveData, kein Kontext) läuft der Ersatz-Auftakt **sofort**, kein Netz. Mit WebGL wartet das Netz bis `--d-netz` 650 ms nach Navigationsbeginn. Liegt der Start so spät, dass der Ablauf nicht mehr vor `--d-grenze` (1.500 ms) endet, gilt sofort das Endbild. Der Ablauf ist auf 3 Staffeln + `--d-3` = 580 ms gekürzt (Schacht `--d-3` statt `--d-4`, höchstens 3 × Staffel). Im Shader-Pfad passt sich die Front an: `D = min(--d-5, Grenze − jetzt − 3 Staffeln)`, nach dem Vorlauf nochmals `Grenze − jetzt − 2 Staffeln`; bleibt weniger als `--d-3`, gilt das Endbild. | `pruef/belege/auftakt.json`: Ende höchstens **1.440 ms** in allen Szenarien (CPU 4×, schnelles 4G, Slow 4G, saveData, Desktop), saveData endet nach 664 ms, sehr langsames Netz zeigt das Endbild ohne Auftakt (§3). |
| **HART Zoom 200 %** | `--t-8: min(clamp(…), calc(10svh + 2rem))`, `--t-5: min(clamp(…), calc(3svh + .75rem))`; Tablett `calc(8vw + .5rem)` statt `9.2vw`. | `runde2.json` `zoom200`: H1 in Gerätepixeln 1440 × 900: 122 → 131, 1920 × 1080: 140 → 172, 1920 × 950: 127 → 159, 1280 × 633: 95 → 118. Unterzeile wächst ebenfalls. |
| **HART S-15 Aktion verdeckt Text** | Die Aktion steht im Fluss unter der Einleitung (`margin-top: --a-8`, Höhen-Weiche `--a-5`). Die Querleitung folgt jetzt dem Knopf: ein **Rohrbogen** (SVG, Bögen mit Radius `--a-4`) läuft vom Bildrand auf Pumpenhöhe zum Knopf; das Skript misst Knopf und Pumpe (ResizeObserver, `document.fonts.ready`). Höhen-Weiche `@media (min-width:60em) and (max-height:44rem)`: engerer Satz, Unterzeile einzeilig, Zusage und zweiter Weg nebeneinander, Einblendung eine Stufe kleiner. | `runde2.json` `desktop`, 14 Fenster von 960 × 1080 bis 2560 × 1300 inkl. 1920 × 600, 1680 × 650, 1440 × 600: Abstand Einleitung–Knopf immer ≥ 24 px, nie Überdeckung, Rohrbogen beginnt am Bildrand auf Pumpenhöhe und endet am Knopf, „Offene Stellen ansehen“ in allen Fenstern im ersten Bildschirm (1280 × 720: 715 px, 1536 × 730: 728 px). |
| **HART Rot nur Hauptaktion (E-016)** | Die heißeste Isotherme ist kein Signalrot mehr. Palette Navy → Rücklaufblau → Wandton #F1E9DB → Wärme #FADCC9 → Papier #FBF7F0 („weiß glühend“). Rot zeigt im Bild nur der dünne Vorlauf. Striche auf hellen Isothermen in Navy. | `fotos/*-voll__01.webp`; im Bild gibt es keine rote Fläche, nur Leitungen mit 4 Einheiten Strich. |
| **HART Mobil: Knopf in der Daumenzone, svh** | Die Szene wird mobil an `svh` gekoppelt: Bildhöhe = Textblock + 446 · s, s so gewählt, dass Knopf und Zusage im kleinen Viewport bleiben (zwischen 88 vw und 130 vw). Knopf und Zusage stehen mobil direkt unter Bild und Messwerten, die Einleitung danach. Die Leiste erscheint, solange die Aktion nicht ganz im Bild ist (oben oder unten, IntersectionObserver mit Schwellen 0/0,5/1). | `runde2.json` `mobil`: 390 × 664 Zusage 658 px, 375 × 667 660 px, 360 × 640 633 px, 414 × 736 728 px, 390 × 844 717 px, in beiden Bewegungsfassungen. 320 × 568: Knopf unter der Kante, Leiste sichtbar (richtig). |
| **HART Bewegung mit Kennung** | Die Schacht-Spannen im Anschluss sind ruhend (kein Ladeauftakt außerhalb des ersten Bildschirms). Jede Animation trägt `data-motion` (auch Mantel, Puls, Messpunkt). | `runde2.json` `bewegung`: 118/119 Animationen in vier Zeitpunkten, 0 ohne Kennung, 0 im Anschluss. |
| **HART Martian Mono nur für Maße** | Ortsmarke in Atkinson Hyperlegible Next 600, Versalien mit 0,08 em Sperrung. Telefonnummer in Atkinson, Ziffern in `.ziffern` (Bricolage 500, Tabellenziffern). | `runde2.json` `martian`: nur Raumnamen und Ablesung im Bild, Gehaltsspannen, Wochenplan. |
| **HART S-05 freie Werte** | `--m-tag` = `--a-7` (40 px) statt 2,25 rem; Striche `--strich-haar` 1 px, `--strich-fein` 2 px, `--strich` 3 px; Fokus über `--fokus-b`/`--fokus-abstand`; Unterstreichung `--strich-fein` mit Abstand `--a-1`; Logo-, Satz- und Wochenmaß als Tokens. Skript-Zeiten aus Tokens (`--d-1`, `--d-3`, `--d-5`, `--staffel`, `--d-netz`, `--d-grenze`); Feder zeitbasiert `k = 1 − exp(−dt/τ)`, τ = `--d-3`/3. | `pruefen.json`: 0 freie Schriftgrößen in 12 Ansichten, Dauern {120, 240, 400}, 3 Kurven. Abstände außerhalb der Skala nur dort, wo sie an die Szene gekoppelt sind (Leitungsschacht 28 · s + `--a-4`, Einblendung in Szeneneinheiten). |
| **HART Austauschprobe** | Der Moment ist an Eigenes gebunden (§2): die Felder des Logos (Luft, Flamme, Tropfen als Zeichen an Pumpe, Heizung und Bad; Sonne an „30 Tage Urlaub“), die Front erreicht sie nacheinander und endet an der Giebeluhr, wo der Messpunkt einrastet und 13:30 abliest (mobil und Desktop). Die Messwerte stehen als Maßkette 30 · 35 km · 1926. | `erster-bildschirm/*-voll__streifen.webp` |
| weich WebGL-Modul immer laden | Das Modul wird nach `load` im Leerlauf immer geladen, sobald WebGL möglich ist (also nicht bei reduzierter Bewegung oder saveData); hat der Ersatz übernommen (oder war der Start zu spät), startet es ohne Auftakt und dient dem Zeigen. Kommentar korrigiert. | `auftakt.json`: „Modul ja“ auch bei CPU 4× + Slow 4G und sehr langsamem Netz |
| weich Kontrast der Leitungen auf Navy | Jedes Rohr im Bild hat einen **Mantel in der Seitenfarbe** (`--grund`, 2 Einheiten je Seite); Rohr und Mantel tragen die Leitfaden-Farben der Seite (`--vorlauf`, `--ruecklauf`). Dadurch gleiche Farbe im Bild, in der Messwertleiste und auf der Seite, in beiden Themen kein Knick. | 36 Kontrastpaare, alle bestanden (§11) |
| weich H1 robust gegen größere Grundschrift | Bildbeginn aus dem Textblock: CSS rechnet den Himmel aus den Display-Stufen, das Skript misst jede Textzeile gegen die Dachlinie und schiebt das Bild nur nach unten (`--oben-js`). | `runde2.json` `grundschrift`: kleinster Abstand Zeile–Dach 15,2 px bei 125 %, 18,3 px bei 150 % (vorher kreuzte das Dach „Feierabend.“) |
| weich Tablett und Desktop | Titelspalte 52 %, Dachabstand vom Skript gesichert (768: 36,6 px, 600: 12,5 px); Desktop-Loch zwischen Einleitung und Knopf 48 px (vorher 189–410 px). Szene am Desktop passt immer in die Höhe (der First wird nie angeschnitten). | `runde2.json` `tablett`, `desktop` |
| weich Ruhige Fassung | Mobil zeigt die ruhige Fassung die Planbeschriftung als Raumnamen (WÄRMEPUMPEN, HEIZUNGEN, BÄDER) und die Ablesung 13:30 am Fadenkreuz statisch. | `fotos/m3*-reduziert__01.webp` |
| weich Zeigen ohne Hover | Drei echte Knöpfe im Bild (Luft = Wärmepumpen, Flamme = Heizungen, Tropfen = Bäder), 44 × 44 px, `aria-pressed`, per Tastatur erreichbar, Messfeld (Eckwinkel) auch ohne WebGL. Mobil erscheint beim Antippen der Raumname. | `runde2.json` `zeigen` |
| weich E-019 | Rot/Blau-Klammer an der Unterzeile am Desktop; mobil bleibt die dunkle Plakat-Fassung, ausdrücklich als OFFENE FRAGE 2 mit Bildpaar. | `pruef/belege/bildpaar-e019-m390.webp` |
| weich Schreibweise | `aria-label="Bad und Energie GmbH Lahn Dill, zur Startseite"`, `alt="Bad und Energie GmbH Lahn Dill"`. | `index.html` |
| weich Touch-Ziele, sichere Bereiche | Fußlinks `inline-flex` mit `min-height: --ziel` (44 px); alle Abstände am Rand mit `max(…, env(safe-area-inset-left/right))`. | `pruefen.json` |

## 1. Leitidee (ein Satz)

> **Das Haus aus unserem Logo im Wärmebild: Die Wärme läuft von der Wärmepumpe durch die Felder unseres Zeichens – Luft, Flamme, Tropfen – bis an die Giebeluhr, wo der Messpunkt auf 13:30 einrastet, und der rote Vorlauf führt weiter bis in deinen Bewerben-Knopf.**

Zugespitzt aus B und A:
- **Aus B (Runde 1, Wunsch des Auftraggebers, E-019):** Giebelhaus des Logos, Wärmepumpe, roter Vorlauf und blauer Rücklauf, warmes Papier, die Uhr im Giebel auf 13:30 (Stundenzeiger im 45°-Winkel der Dachneigung), die Rot/Blau-Klammer an der Unterzeile.
- **Aus A (Präzision):** Messen statt Behaupten: Fadenkreuz am Messpunkt, Maßlinie zum Hauptmaß, Maßkette 30 · 35 km · 1926, Planbeschriftung als Raumnamen in Martian Mono, die Arbeitswoche als Maßstab. Die Leitung endet im Knopf.
- **Zuspitzung Runde 2:** Die Wärmebildkamera misst nicht irgendein Haus, sondern das Zeichen dieses Betriebs. Die Front besucht die Felder des Logos in der Reihenfolge des Gewerks (Wärmepumpe → Heizung → Bad) und endet an der Uhr: Wenn das Haus warm ist, ist Freitag 13:30.

## 2. Austauschprobe

Frage: Passt es unverändert zu einem anderen SHK-Betrieb oder zu einem Wärmepumpen-Hersteller, wenn man Logo und Namen tauscht?

| Prüfling | Ergebnis | Begründung |
|---|---|---|
| **Leitidee** | besteht | Austauschbar ist nur das Werkzeug „Thermografie“. Der Satz trägt drei Dinge, die nur Bad & Energie in Wetzlar belegen kann: die vier Felder des eigenen Logos (Flamme, Tropfen, Sonne, Luft), die Zusage „freitags 13:30 Feierabend“ als Messwert, und die Leitung in den Bewerben-Knopf. Ein Hersteller hat keinen Bewerben-Knopf und keine Freitagszusage; ein anderer Betrieb hat ein anderes Zeichen. |
| **Einstieg mobil** | besteht | Plakat: Wärmebild randlos, H1 als echter Text im kalten Himmel, darunter die Messwerte als Maßkette (13:30, ☀ 30 Tage Urlaub, 35 km Einsatzradius, 1926). Im Bild stehen die Zeichen des Logos an Pumpe, Heizkörper und Wanne, die Uhr trägt das Fadenkreuz und die Ablesung 13:30. Ohne Logo-Zeichen, Uhr und Maßkette trägt das Bild nicht mehr. |
| **Einstieg Desktop** | besteht | Doppelseite: links Papier mit H1 in Bildgröße und Rot/Blau-Klammer, rechts das Wärmebild bis in den Rand mit der Einblendung 30 · 35 km · 1926 und 13:30 groß, Maßlinie zum Fadenkreuz an der Uhr. Der Rohrbogen verbindet Knopf und Pumpe. Keine zentrierte Überschrift vor abstraktem Hintergrund (S-10). |
| **Hauptmoment** | besteht | „Messrundgang“: Blaupause → die Front erreicht Luft (Wärmepumpe), Flamme (Heizung), Tropfen (Bad), jedes Zeichen pulsiert, wenn die Wärme ankommt → zuletzt rastet der Messpunkt an der Giebeluhr ein (13:30). Gleichzeitig zeichnet sich der Vorlauf in den Knopf. Ein Wettbewerber müsste sein Zeichen, seine Zusage und seine Uhrzeit einsetzen; ein Hersteller-Motiv „Wärme breitet sich im Haus aus“ endet nicht in einer Feierabend-Uhrzeit und nicht in einer Bewerbung. Kein Partikel- oder Flüssigkeitsfeld (S-09): vier scharfe Isothermen. |

Rest: Das Motiv Thermografie bleibt Branchenallgemeingut (§13, Risiko 1). Die Eigenheit hängt an Zeichen, Uhr und Maßkette; ändert sich eine Zusage, ändert sich das Bild.

## 3. Hauptmoment der Startseite

- **Was:**
  1. Erstes Bild: die **Blaupause**. Navy-Fläche, Haus, Pumpe, Heizkörper, Wanne und leere Rohre (im hellen Thema der papierfarbene Mantel) in Creme. Die Zeichen des Logos und die Ablesung 13:30 stehen schon (kein Inhalt zurückgehalten).
  2. Nach `load` übernimmt im Leerlauf der Shader denselben kalten Zustand deckungsgleich. Die Front läuft entlang einer gerechneten Ankunftszeit: Leitungen, Heizkörper und Estrich, Räume, zuletzt die Höfe an Wand und Dach.
  3. Wenn die Front ein Zeichen erreicht, pulsiert es einmal (Luft bei 10 %, Flamme bei 35 %, Tropfen bei 50 % der Frontdauer, aus der Ankunftszeit der Feldtextur abgelesen).
  4. Zum Ende rastet das Fadenkreuz an der Giebeluhr ein (`einrasten`: Deckkraft und Maßstab 1,3 → 1). Am Desktop zieht sich die Maßlinie zur Einblendung 13:30.
  5. Gleichzeitig zeichnen sich Vorlauf und Rücklauf (`stroke-dashoffset`), mobil der Schacht bis in den Abzweig zum Knopf, am Desktop der Rohrbogen bis in den Knopf.
  6. Danach Ruhe. Die Leinwand stellt im Leerlauf ein scharfes Ruhebild (Pixeldichte bis 2) deckungsgleich mit den SVG-Bändern.
- **Dauer:** Die Front dauert höchstens `--d-5` (1.100 ms) und endet immer vor `--d-grenze` (1.500 ms nach Navigationsbeginn). Gemessen (`pruef/belege/auftakt.json`, je 3 Läufe):

| Szenario (m390, falls nicht anders) | Pfad | Ende des Auftakts (höchstens) |
|---|---|---|
| lokal | Shader, Front 1.100 ms | 1.314 ms |
| CPU 4× | Shader, Front 911–960 ms | 1.428 ms |
| CPU 4× + schnelles 4G (60 ms, 9 Mbit/s) | Shader (1 Lauf, ab 638 ms) oder Ersatz (ab 667–677 ms) | 1.408 ms |
| CPU 4× + Slow 4G (150 ms, 1,6 Mbit/s) | Ersatz ab 657–660 ms | 1.349 ms |
| saveData (kein WebGL) | Ersatz ab dem ersten Bild | 664 ms |
| saveData + CPU 4× + Slow 4G | Ersatz ab dem ersten Bild | 1.326 ms |
| CPU 4× + sehr langsames Netz (400 ms, 0,4 Mbit/s, FCP 2,3 s) | Endbild sofort, kein Auftakt | – |
| d1440, CPU 4× + schnelles 4G | Shader (2 Läufe, ab 660–662 ms) oder Ersatz (ab 658 ms) | 1.440 ms |

- **Warum:** Das Gewerk wird sichtbar statt beschrieben, die Bewerbung ist das Ziel des Vorlaufs, und die Messung endet in der Zusage, die den Betrieb unterscheidet: pünktlich Feierabend.
- **Markenmerkmal:** Giebelhaus und Felder des Logos, Rot/Blau als Logo- und Leitungsfarben (K-015), Giebeluhr 13:30.
- **Zeigen (ohne Hover nutzbar):** Die drei Zeichen sind echte Knöpfe. Antippen, Klicken oder Enter setzt das Messfeld (Eckwinkel wie das „Box“-Werkzeug der Kamera) um den Raum, kehrt das Zeichen um und zeigt den Raumnamen. Läuft WebGL, verstärkt der Shader die Wärmezone (Faktor 1,55, Feder zeitbasiert). Ohne WebGL bleibt das Messfeld. Die Schrift im Himmel wird nie überdeckt: kleinster Kontrast der H1 über der Szene **13,84:1** in m320, m375, m390, m430 und t768, zu sieben Zeitpunkten und mit jeder verstärkten Zone (`webgl.json` `kontrast_schrift_ueber_szene`).

## 4. Leitfaden: das Leitungspaar Vorlauf/Rücklauf

1. **Im Bild:** Aus der Pumpe gehen der Vorlauf in den Heizkörper, unter der Erde in die Fußbodenheizung des Bades, ein Paar senkrecht aus dem Bild (Rücklauf außen x = 14, Vorlauf innen x = 28) und am Desktop waagerecht zum Knopf. Jedes Rohr trägt einen Mantel in der Seitenfarbe: auf Papier unsichtbar, auf Navy und hellen Isothermen eine klare Kante. Rohr und Seite haben dieselbe Farbe, in beiden Themen.
2. **Mobil – Leitungsschacht:** Das Paar läuft vom Bildrand durch die Maßkette den linken Rand hinunter; ein T-Abzweig führt in „Jetzt bewerben“. Im Anschluss hängt jede Stellenzeile mit einem roten Abgang am Vorlauf. Auch das Handy-Menü trägt das Paar und den Abzweig.
3. **Desktop – Rohrbogen:** Vom Bildrand auf Pumpenhöhe biegt das Rohr mit zwei Bögen zum Knopf. Es folgt der Lage des Knopfes, nicht umgekehrt. Im Anschluss fällt das Paar senkrecht in die rechte Spalte; die vier Stellen hängen daran.
4. **Auf der Stellenseite (nicht gebaut):** Die angeklickte Zeile behält ihren Abgang als gemeinsames Element (View Transition, Paar mit gleichem Seitenverhältnis). Oben wird das Paar zum Maßstab der Woche (Vorlauf = Mo–Do 07:00–16:45, Fr bis 13:30), daneben das Gehaltsmaß; der Vorlauf läuft weiter in den Bewerbungsfluss (Fortschritt als Leitungsabschnitte). Die Woche im Anschluss (`.woche`) ist die Vorstufe.

## 5. Mobil-Komposition und dominante Geste

- **Geste: angeschnittenes Bild als Plakat.** Das Wärmebild ist randlos, die H1 steht als echter Text im kalten Himmel. Bei 390 × 844 ist das Haus rechts angeschnitten (Lage 130 vw, Bild 469 px).
- **Kleiner Viewport zuerst:** Der Chef sieht im Safari mit Leisten etwa 390 × 664. Die Szene wird darum an `svh` gekoppelt: so groß wie möglich (höchstens 130 vw), aber so, dass Knopf und Zusage im ersten Bildschirm bleiben (bei 390 × 664 Lage 428 px, Haus 231 px breit, Zusage endet bei 658 px).
- **Himmel aus dem Textblock:** CSS rechnet den Abstand vom Bildbeginn zum First aus den Display-Stufen; das Skript misst die echten Zeilen (Ersatzschrift, große Grundschrift, Zoom) und schiebt das Bild nur nach unten.
- **Reihenfolge:** Kopf (Logo, Telefon, Menü, je 44 px) → Ortsmarke → H1 → Wärmebild mit Zeichen und Ablesung → Maßkette 13:30 · 30 · 35 km · 1926 → **Jetzt bewerben** mit Zusage (Daumenzone) → Einleitung → „Offene Stellen ansehen“. Ab 600 px steht die Einleitung wieder vor dem Knopf.
- **Warum:** Das leuchtende Haus ist der Grund zum Innehalten; die Schrift steht nur auf Kaltem; der nächste Schritt ist sichtbar, weil die Leitung zu ihm führt.
- **Tablett (600–959):** Haus links (Lage 72 vw), Titel rechts im Himmel (52 %), Raumnamen im Bild.
- **Desktop (ab 960):** wie in §2. Die Szene passt in die Höhe (mindestens 650 Einheiten breit sichtbar), steht unten bündig im Bild; der First wird nie angeschnitten.

## 6. Ruhige Fassung (reduzierte Bewegung, ohne WebGL, ohne JavaScript)

- **Wann:** Bei `prefers-reduced-motion: reduce` wird kein WebGL geladen; das Endbild steht sofort als SVG (dieselben Isothermen wie der Shader).
- **Eigens gestaltet:** Mobil trägt die Typografie mehr Information als in der bewegten Fassung: Die Räume sind beschriftet wie in einem Grundriss (WÄRMEPUMPEN über der Pumpe, HEIZUNGEN und BÄDER als Raumnamen unter der Decke), das Fadenkreuz steht an der Uhr, die Ablesung 13:30 darunter. Die bewegte Fassung zeigt mobil nur die Zeichen (der Raumname erscheint beim Antippen).
- **Licht und Komposition:** dasselbe Plakat, dieselbe Doppelseite.
- **Ersatz-Auftakt (bewegt, ohne WebGL):** Isothermen blenden heiß zuerst ein, Leitungen zeichnen sich, Messpunkt rastet ein; Ende nach 580 ms ab Start.
- **Belege:** `fotos/*-reduziert__*.webp`, `erster-bildschirm/*-reduziert__streifen.webp` (erstes Bild nach 97–131 ms, danach unverändert).

## 7. Schrift und Austauschprobe der Display-Schrift

- **Display: Bricolage Grotesque 800** (variabel, optische Größe automatisch): H1, H2, Messwerte, Knopf, Stellentitel; Ziffern im Fließtext und die Telefonnummer in `.ziffern` (500, Tabellenziffern).
- **Text: Atkinson Hyperlegible Next:** Einleitung, Navigation, Beschriftungen, **Ortsmarke** (600, Versalien, 0,08 em gesperrt).
- **Maße: Martian Mono 87,5 % Breite, nur für Maße und Planbeschriftung:** Gehaltsspannen, Wochenplan, Raumnamen und Ablesung 13:30 im Wärmebild.
- **Schriftgrößen:** zehn Stufen `--t-1…--t-10`; je Ansicht höchstens 9 verschiedene gemessene Größen, 0 freie Werte (`pruefen.json`). Display mit rem-Anteil: Zoom 200 % vergrößert in allen vier geprüften Fenstern (§0).
- **Austauschprobe** (`pruef/belege/schriftprobe.webp`, unverändert aus Runde 1): Bricolage ist verbreitet; eigen wird sie durch Gewicht 800 bei großer optischer Größe (eingeschnürte Rundungen, schwerer, kurzer Bindestrich wie eine gemalte Hausbeschriftung) im Paar mit der kühlen Messschrift Martian. Big Shoulders Display wäre für den Messgerät-Charakter die stärkste Alternative, nimmt der Szene aber die Wärme und liest sich mobil schlechter; Archivo 68 % rückt zu nah an A; Familjen, Gabarito und Schibsted sind gleichwertig neutral. **Entscheidung:** Bricolage bleibt.
- **Dateien:** sechs woff2, 223.864 Byte auf der Platte, geladen 149.376 Byte (drei `latin`-Teilmengen), zwei vorgeladen; Ersatzschriften mit Metrik-Overrides, CLS 0.

## 8. WebGL-Moment: Regeln und Belege

Alle Messungen in Chromium headless (Playwright), WebGL über **SwiftShader (Software)**; echte Geräte mit GPU sind schneller.

| Regel | Umsetzung | Beleg |
|---|---|---|
| Eigener Shader, keine 3D-Engine | WebGL 1, ein Dreieck, ein Fragment-Shader. Feld aus einer 400 × 200-Textur (links √T und Zonenanteile, rechts Ankunftszeit), Isothermen mit Kantenglättung über `fwidth`. | `js/waermebild.js` |
| JS ≤ 120 KB gzip, nachgeladen | Modul **6,4 KB** gzip + Inline-Skripte 3,3 KB = **9,7 KB** gzip. Modul per `import()` nach `load` im Leerlauf (`requestIdleCallback`, Zeitlimit `--d-1`, Rückfall `setTimeout 0`), ohne künstliche Verzögerung; immer geladen, wenn WebGL möglich ist (nicht bei reduzierter Bewegung und saveData). Feldtextur 59,8 KB. | `webgl.json` `groessen` |
| Statischer Ersatz = erstes Bild, ohne Sprung | Blaupause als erstes Bild; der Shader übernimmt denselben kalten Zustand; Endbild deckungsgleich mit den SVG-Bändern (gleiche Textur, gleiche Schwellen im Wurzelraum). Ohne WebGL läuft der Ersatz sofort. | `erster-bildschirm/*-voll__streifen.webp` |
| `webglcontextlost` → sofort Ersatz | Mitten im Auftakt: Ereignis nach 4 ms, Leinwand im selben Ereignis entfernt, Bänder mit Deckkraft 1, danach keine neuen Kontexte. | `webgl.json` `kontextverlust`, `pruef/belege/kontextverlust-m390-{vorher,nachher}.webp` |
| Pause außerhalb des Bildes, verborgener Tab | 0 Bilder in 1.000 ms außerhalb (IntersectionObserver), 0 Bilder in 1.000 ms bei verborgenem Tab; der Auftakt läuft danach an der Stelle weiter. | `webgl.json` `pause_ausserhalb`, `pause_verborgen` |
| Freigabe beim Verlassen | Rückgabe an das SVG; Textur, Puffer, Programm gelöscht, `loseContext()`; ebenso bei `pagehide`. 10 Zyklen Zeigen/Verlassen/Zurück: 12 Kontexte erzeugt, 11 freigegeben (einer aktiv), JS-Heap +5,9 % (Schwelle 10 %). Eine gewählte Zone wird beim Zurückkommen wieder gezeigt. | `webgl.json` `freigabe_heap` |
| Pixeldichte ≤ 2, ein Kontext | In Bewegung 1 Bildpunkt je CSS-Pixel, Ruhebild mit min(dpr, 2) **im Leerlauf** nach der Bewegung (Größe und Bild in einer Aufgabe, kein Aufblitzen). Leinwand nur über dem warmen Teil der Szene. Nie mehr als ein Kontext. | `js/waermebild.js` `groesse()`, `scharfStellen()` |
| Framezeiten mobil, 4× CPU, ≤ 5 % verworfen | m390, je 5 Läufe. **Auftakt:** 0 von 268 Bildern verworfen. **Zeigen:** 0 von 789. Keine Long Animation Frames. Maßnahmen Runde 2: bewegte Rohre in eigener kleiner SVG-Ebene, Mantel ruhend, scharfes Ruhebild erst im Leerlauf (vorher fiel das letzte Bild des Auftakts aus). | `webgl.json` `framezeiten_4x` |
| Kein Partikel- oder Flüssigkeitsfeld | Stationäre Wärmeleitung mit Senke, vier scharfe Isothermen aus der Palette. | `bau/feld.mjs` |

**Leistung** (Lighthouse 13.5, lokal **ohne Kompression**, je 3 Läufe, `pruef/belege/lighthouse.json`): mobil Leistung 96–98, Barrierefreiheit 100, Best Practices 100, SEO 100, LCP 2,25 / 2,40 / 2,70 s (Median 2,40 s), TBT 18–42 ms, CLS 0; Desktop 100/100/100/100, LCP 0,54–0,57 s, TBT 0. HTML 74,3 KB roh, 21,3 KB gzip. 7 Anfragen.

## 9. Bewegungsregister

Dauer-Tokens: `--d-1` 120 ms, `--d-2` 240 ms, `--d-3` 400 ms, `--d-5` 1.100 ms (Obergrenze der Shader-Front, angepasst an den Start). Skript-Grenzen (keine Animationsdauern): `--d-netz` 650 ms, `--d-grenze` 1.500 ms. Staffel `--staffel` 60 ms. Kurven: `--k-aus` cubic-bezier(.16,1,.3,1), `--k-ein` (.32,0,.67,0), `--k-linear`. Gemessen an den berechneten Stilen: Dauern {120, 240, 400}, drei Kurven. Animiert werden nur `transform`, `opacity`, `stroke-dashoffset` (mit `pathLength="1"`) und die WebGL-Leinwand. Gemeinsamer Ablauf für Shader (`.wb-laeuft`) und Ersatz (`.wb-ersatz`): alle CSS-Teile enden nach 3 Staffeln + `--d-3` = 580 ms.

| Kennung (`data-motion`) | Zweck | Auslöser | Dauer · Kurve · Staffel | Reduziert |
|---|---|---|---|---|
| `waermebild` | Hauptmoment: Wärme ins Haus | `load` + Leerlauf, vor `--d-netz` | Front `min(--d-5, Grenze − Start − Reserve)`; Leinwand blendet in `--d-1` linear | entfällt, Endbild als SVG |
| `vorlauf` | Die Wärme fließt aus der Pumpe | `.wb-laeuft` / `.wb-ersatz` | `--d-3` · aus | gezogen |
| `ruecklauf` | Das Wasser kehrt zurück | wie oben | `--d-3` · aus · 2 × Staffel | gezogen |
| `blaupause` | Kalte Linien weichen der Wärme | wie oben | `--d-3` · linear · 3 × Staffel | nicht sichtbar |
| `baender-ersatz` | Ersatz-Auftakt ohne WebGL: heiß zuerst | sofort ohne WebGL, sonst Netz | `--d-3` · aus · 0/1/2/3 × Staffel | Endbild sofort |
| `feld-erreicht` | Die Front erreicht Luft, Flamme, Tropfen | wie oben | `--d-2` · aus, Beginn bei 10/35/50 % von `--wb-dauer` (`transform: scale`) | entfällt, Zeichen stehen |
| `messpunkt` | Der Messpunkt rastet an der Uhr ein (13:30) | wie oben | `--d-2` · aus, Ende = `--wb-dauer` | steht |
| `massline` | Maßlinie zur Einblendung 13:30 (Desktop) | wie oben | `--d-2` · aus, Ende = `--wb-dauer` | gezogen |
| `leitfaden-zeichnen` | Schacht und Leitungen der Maßkette unter dem Bild (nur erster Bildschirm) | wie oben | `--d-3` bzw. `--d-2` · aus · 1/2 bzw. 1/3 × Staffel (`scaleY`) | gezogen |
| `vorlauf-zum-knopf` | Die Leitung endet im Knopf | wie oben | mobil Abzweig `--d-2` · 3 × Staffel (`scaleX`); Desktop Rohrbogen `--d-3` · 1 × Staffel (`stroke-dashoffset`) | gezogen |
| `knopf-druck` | Druck mit Tiefe | `:active`, Hover (fein) | `--d-1` · aus | sofort |
| `druck` | Rückmeldung Kopfknöpfe | `:active`, Hover (fein) | `--d-1` · aus | sofort |
| `nav-strich` | Unterstrich der Navigation | Hover, Fokus | `--d-2` · aus (`scaleX`) | sofort |
| `zeile-druck` | Rückmeldung Stellenzeile | `:active`, Hover (fein) | `--d-1` · aus | sofort |
| `weg-pfeil` | Hinweis „nach unten“ | Hover (fein) | `--d-1` · aus | sofort |
| `menue` | Handy-Menü öffnet vollflächig | Tippen auf „Menü“ | `--d-2` · aus; Schließen sofort | sofort |
| `leiste` | Mitlaufender Knopf, solange die Hauptaktion nicht ganz im Bild ist | IntersectionObserver | hinein `--d-2` · aus, hinaus `--d-1` · ein | sofort |
| (Shader) Zeigen | Wo das Haus warm wird | Knopf im Bild (Tippen, Klick, Enter), Zeiger über dem Knopf | Feder zeitbasiert, τ = `--d-3`/3 (95 % nach `--d-3`, gleich auf 60 und 120 Hz) | entfällt; Messfeld und Raumname bleiben |

Die Schacht-Spannen im Anschluss (`.anschluss .schacht`) sind ruhend; außerhalb des ersten Bildschirms läuft beim Laden keine Bewegung.

## 10. Budgets

| Posten | Wert | Budget |
|---|---|---|
| Schriften auf der Platte | 223.864 B (223,9 KB) | ≤ 250 KB |
| Schriften geladen (latin) | 149.376 B, davon 2 vorgeladen | höchstens 2 vorgeladen |
| JS gzip gesamt | 9,7 KB (Modul 6,4 + inline 3,3), Modul nachgeladen | ≤ 120 KB, nachgeladen |
| HTML | 74,3 KB roh, 21,3 KB gzip (Bänder, Zeichnung und Stile inline) | – |
| Anfragen | vor `load`: HTML, 3 Schriften, Logo; danach im Leerlauf `waermebild.js`, `feld.png`. 7, keine fremde, keine Favicon-Anfrage | keine externen |
| Illustration | Bänder 6,8 KB roh; Zeichnung und bewegte Ebene als SVG, keine Pixelbilder außer der Feldtextur | ≤ 40 KB gzip |

## 11. Zugänglichkeit und Prüfungen

- **axe-core** (WCAG 2 A/AA, 2.1, 2.2 AA, Best Practice): 0 Verstöße in m320, m390, t768, d1440, je hell und dunkel (`pruefen.json`). Die mitlaufende Leiste liegt in `<main>`.
- **Überlauf:** 0 in m320 bis d1920; `fotos/bericht.json`: 20 Aufnahmen, 52 Ausschnitte, **0 Überlauf, 0 Fehler, 0 Fremdanfragen**.
- **Touch-Ziele:** alle ≥ 44 px, auch die Knöpfe im Bild (44 × 44) und die Fußlinks (44 px hoch).
- **Fokus:** 3 px in `--fokus`, Abstand 3 px; Knöpfe im Bild mit Creme-Rahmen und Navy-Hof.
- **Zeigen:** `<button aria-pressed>` mit sichtbarem und gleichlautendem Namen, Gruppe „Zeigen, wo das Haus warm wird“; Enter schaltet ein und aus (`runde2.json` `zeigen`).
- **Bild:** `svg role="img"` mit `title` und `desc`; bewegte Ebene, Zeichen, Ablesung und Leitungen `aria-hidden` bzw. als Knöpfe benannt. Messwerte als `dl`.
- **Kontraste:** 36 Paare aus den Hexwerten, alle bestanden (`pruefen.json` `kontraste`). Neu: Vorlauf/Rücklauf gegen den Papier-Mantel 5,09 und 6,10; Mantel gegen Bild-Navy 13,84; dunkel Koralle/Hellblau auf Bild-Navy 4,80 und 6,40; Nachtblau-Mantel gegen Wandton 15,34. Hinweis: Die erste Isotherme (#1F57C4) hat gegen das kalte Navy 2,27:1; die Information „warm“ tragen die hellen Isothermen (≥ 5,4:1 gegen Blau) und die Bildbeschreibung.
- **Deutsch:** „…“, Halbgeviert, geschütztes Leerzeichen vor Einheiten (0 Treffer ohne), weiche Trennstellen (`Einsatz&shy;radius`, `Wärme&shy;pumpen`, `Anlagen&shy;mechaniker`).
- **Druck:** hell, Kopf weiß, Knopf mit Rahmen, ohne Leinwand, Schacht, Rohrbogen und Knöpfe im Bild.

## 12. Quellen je Zeile (nichts erfunden)

| Text auf der Seite | Quelle |
|---|---|
| „Seit 1926 · Wetzlar“ | `components/home/content.ts` `HERO.eyebrow` |
| „SHK-Jobs in Wetzlar.“ · „Ehrliches Handwerk. Pünktlich Feierabend.“ | `HERO.title`, `HERO.titleSecondLine` |
| Einleitung „Wir suchen Verstärkung …“ | `HERO.lead` |
| „Jetzt bewerben“ · „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“ | `nav.ts` `SHORT_APPLY_LABEL`, `HERO.microcopy` |
| „Offene Stellen ansehen“, H2 „Offene Stellen“ | Vorgabe des Pakets (zweiter Weg) |
| 13:30 · Freitags Feierabend; 30 · Tage Urlaub; 35 km · Einsatzradius; 1926 · Gegründet; Ablesung 13:30 an der Uhr | `facts.ts` `friday1330`, `vacation30`, `radius35` (`STAT_LABELS`), `founded1926` |
| Raumnamen „Wärmepumpen“, „Heizungen“, „Bäder“ (Knöpfe im Bild) | Wörter aus `HERO.lead` |
| Zeichen Flamme, Tropfen, Sonne, Luft | die vier Felder des Logos (`logo.png`), Zeichnung nach Richtung A |
| Navigation Stellen, Vorteile, Ablauf, FAQ | `components/site/nav.ts` `NAV_ITEMS` |
| 06441 42956 | `lib/data/contact.ts` `CONTACT_PHONE` |
| Stellen und Gehaltsspannen | `lib/jobs/data/*` (`shortTitle`, `salary`, nur `status: published`) |
| Wochenplan und Bildunterschrift | `facts.ts` `workingHours.long`, `noWeekendOnCall.long` |
| Fuß: Name, Anschrift, E-Mail; Name im Logo-Link und Alternativtext | `lib/data/company.ts` („Bad und Energie GmbH Lahn Dill“), Muster „…, zur Startseite“ aus `components/site/HeaderBar.tsx` |
| Bildbeschreibung (`desc`) | Beschreibung der eigenen Zeichnung, keine Betriebsaussage |
| UI-Mikrotexte „Menü“, „Zum Inhalt springen“, „Anrufen: …“, „Zeigen, wo das Haus warm wird“ | Mikrotexte nach K-012 |

Nicht verwendet: der Erklärsatz zur Wärmepumpe (T-001, nur Vorschlag). „100 Jahre Meisterbetrieb (1926–2026)“ steht nicht im ersten Bildschirm (OFFENE FRAGE 3).

## 13. Risiken

1. **Austauschbarkeit des Motivs:** Thermografie allein ist Branchenallgemeingut. Die Variante trägt, solange Logo-Zeichen, Giebeluhr und belegte Messwerte im Bild bleiben.
2. **Weniger „Hitze“ ohne Rot:** Mit Papier als heißester Isotherme liest sich das Bild als „weiß glühend“ statt „rot glühend“. Das hält E-016 ein; die Wucht des Rot fehlt. Eine rote Fläche gäbe es nur mit ausdrücklicher Ausnahme des Auftraggebers (OFFENE FRAGE 1).
3. **Hell wirkt mobil dunkel:** Oben steht im hellen Thema das Navy-Plakat; warmes Papier beginnt unter der Maßkette (OFFENE FRAGE 2, Bildpaar).
4. **Shader auf langsamen Geräten:** Mit CPU 4× und schnellem 4G übernimmt in etwa der Hälfte der Läufe der Ersatz (Netz 650 ms), damit der Auftakt unter 1,5 s bleibt. Das Bild ist dann gleich, nur ohne Front. Auf dem Telefon des Chefs (schnelle CPU, GPU) ist der Shader-Pfad zu erwarten; geprüft ist das nur in SwiftShader.
5. **Mobile LCP:** Median 2,40 s, ein Lauf 2,70 s, gemessen ohne Kompression (HTML 74 KB roh). In der Plattform mit gzip/Brotli (21 KB) und Szene als eigene Datei entsprechend kürzer; zu prüfen in der Generalprobe.
6. **Kleinste Telefone:** Bei 320 × 568 passt der Knopf nicht in den ersten Bildschirm (die Leiste übernimmt); das Haus ist dort 152 px breit, die Ablesung entfällt.
7. **Prüfumgebung:** WebKit nicht geprüft; `svh` und die Höhen-Weiche verhalten sich im Safari nur nach Spezifikation geprüft. Geräteprobe gehört in die Generalprobe.

## 14. Offene Fragen

1. **Rot im Wärmebild:** Gilt E-016 auch für die heißeste Isotherme? Gebaut ist die E-016-treue Fassung (Papier als heißeste Isotherme, Rot nur als Vorlauf). Eine rote Kernzone wäre eine ausdrückliche Ausnahme des Auftraggebers und müsste in ENTSCHEIDUNGEN festgehalten werden.
2. **Mobil als dunkle Plakat-Variante:** Gefällt dem Auftraggeber das Navy-Plakat oben im hellen Thema? Gegenprobe als Bildpaar: `pruef/belege/bildpaar-e019-m390.webp` (links gebaut, rechts Skizze „H1 auf Papier mit Rot/Blau-Klammer, kürzeres Bild“, nicht gebaut). Die Skizze nähert sich B Runde 1, das Haus wird dort kleiner.
3. **„100 Jahre Meisterbetrieb (1926–2026)“** (`anniversary100`, gültig bis 31.12.2026) als Bezeichnung am Messwert 1926 statt „Gegründet“?
4. **Raumnamen im Bild:** „Wärmepumpen“, „Heizungen“, „Bäder“ stammen aus der Einleitung. Dürfen sie als Beschriftung der Zeichnung stehen?
5. **Echte Fotos (N-16):** Ein freigegebenes Foto aus dem Betrieb, per Maske mit dem Wärmebild überblendet, wäre der stärkste Echtheitsbeweis. Nicht gebaut.

## 15. Dateien

- `index.html`: Seite.
- `js/waermebild.js`, `js/feld.png`: WebGL-Moment.
- `bau/szene.mjs`, `bau/feld.mjs`, `bau/svg.mjs` (Zeichnung `linienSvg`, bewegte Ebene `rohreSvg`), `bau/einsetzen.mjs`, `bau/vorschau.mjs`.
- `pruef/pruefen.mjs` (Tokens, Kontraste, axe, Überlauf), `pruef/runde2.mjs` (Zoom, Desktop-Fluss, mobil, Grundschrift, Bewegung, Schriften, Tablett, Zeigen), `pruef/auftakt.mjs` (Auftakt unter Drosselung), `pruef/webgl.mjs`, `pruef/lh.mjs`, `pruef/bildpaar.mjs`, `pruef/schriftprobe.mjs`, `pruef/blick.mjs`. Ergebnisse in `pruef/belege/`.
- `fotos/` (`bericht.json`), `erster-bildschirm/` (`bericht.json` = beide Läufe, Einzelberichte `bericht-voll.json`, `bericht-reduziert.json`), `aufzeichnung/`.
- `LIZENZEN.md`: Schriften, Logo, Zeichen, eigene Zeichnung.

=== ENDE A2-RICHT-3 · BEREIT ZUR RÜCKGABE ===
