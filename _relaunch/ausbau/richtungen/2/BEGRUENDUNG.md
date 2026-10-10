# Richtung 2 · „Kühn“ – Dein Arbeitstag ist ein Kreislauf · Begründung (Runde 2)

Prototyp des ersten Bildschirms der Startseite mit Anschluss: `_relaunch/ausbau/richtungen/2/index.html` (eigenständig, ohne Build, Port 3802). Schriften in `fonts/`, Logo `logo.png` (byte-gleich), Lizenzen in `LIZENZEN.md`. Belege in `fotos/`, `erster-bildschirm/` und `aufzeichnung/` (Verzeichnis in §12). Alle Belege sind in Runde 2 neu erzeugt; die Belege aus Runde 1 sind gelöscht.

Grundlage: Folgeauftrag A2, Variante B („interpretiert die Leitidee kühn neu“), Grundrichtung B Runde 1 mit der Präzision von A (E-019), Farben nach E-016, Paket `A2-RICHT-2.md`.

## 0. Runde 2: Befunde der Gegenprüfung und Reparaturen

| Befund | Reparatur | Nachweis |
|---|---|---|
| **Hart · Fokus verdeckt (2.4.11):** Das Handy-Menü war ein nicht-modales Popover über der ganzen Seite; Tab lief in die verdeckte Seite. | Das Menü ist ein `<dialog>`, geöffnet modal: deklarativ über `command="show-modal"`, mit einem Skript-Rückfall für Browser ohne Invoker Commands (`showModal()`). Der Hintergrund ist inert, der Fokus startet auf „Schließen“, Esc schließt, der Fokus kehrt zum Menüknopf zurück. Ohne JavaScript entfällt der Menüknopf; die Navigation steht als eigene Zeile unter dem Kopf. | `fotos/ergaenzung.json` Lauf `menue-m390-tastatur`: Tab-Folge Stellen, Vorteile, Ablauf, FAQ, Jetzt bewerben, Telefon, (Browser), Schließen, Stellen. Kein Schritt landet auf der Seite. Nach Esc ist das Menü zu, der Fokus liegt auf „Menü“. Getestet mit und ohne Invoker Commands. Bilder `menue-m390-*`, `ohne-js-m390-light__01`. |
| **Hart · Text über Text, Reflow (320–430 px, Grundschrift 20/24 px):** Werte lagen in überlappenden Rasterflächen; 13:30 lief bei 24 px über. | Die Werte stehen in eigenen Zeilen: „Fr 07:00“ mit dem Haus über der Schleife, darunter `ul.w-fuss` als umbrechende Flex-Zeile (`flex-wrap`, Spaltenabstand `--a-5`). „Freitags Feierabend“ steht immer allein unter 13:30. Erst ab einer Behälterbreite von 44 em (Container-Abfrage auf `.bild`, em = Maßschrift) teilt sich die Zeile mit 35 km und 30 Tagen. Werte bleiben über geschützte Leerzeichen zusammen; Beschriftungen dürfen zwischen Wörtern umbrechen. 13:30 ist an die Behälterbreite gekoppelt: `min(var(--t-7), (100cqi − Einzug) × 0,44)`. Die H1 ist am längsten Wort („Wetzlar.“, 4,6 em) an die Spalte gekoppelt: `min(var(--t-6), Spalte × 0,21)`. | `ergaenzung.json` → `messungen.sweep`: 320 bis 430 px in 1-px-Schritten, 0 Überlappungen, 0 Überlauf. Kleinster Abstand zweier Werte in derselben Zeile: 24 px. Grundschrift 20 und 24 px bei 320, 375, 390, 430, 768 und 1440 px: 0 Überlappungen, kein Überlauf, „Fr 07:00“ einzeilig. Bilder `schrift-m320-*`, `schrift-m390-*`. |
| **Hart · Anschluss über zwei Bildschirmhöhen** (2,00–2,20). | Szene 160 → **140 svh**. Der Verteiler ist verdichtet: Innenabstand `--a-6`, Zeilen `min-height: --a-7`, Abstand `--a-2`. Die Stationen sammeln sich, statt einander zu ersetzen (siehe unten). | `messungen.anschluss`, gemessen als (scrollHeight − Ende des Einstiegs) / innerHeight. Volle Bewegung: m375 1,91 · m390 1,87 · m430 1,80 · t768 1,70 · d1440 1,91 · d1920 1,82. Reduziert: 1,34–1,55. |
| **Hart · Zustand „aktiv“ fehlt (S-06).** | Gemeinsame Druckregel für Telefon, Menüknopf, Logo, „Offene Stellen ansehen“, Menüpunkte und Navigation: Fläche `--c-wand`, bei Rahmenknöpfen Rand `--c-navy`, bei „Offene Stellen ansehen“ die Unterstreichung in Navy; Versatz `--a-1` nur bei voller Bewegung. Hover ergänzt für Logo und Menüpunkte. Im Register als `druck` geführt. | CDP `forcePseudoState(:active)` mit `hasTouch`, hell/dunkel, voll/reduziert: jedes Ziel ändert Fläche, Rand oder Unterstreichung. Bildpaare `druck-m390-light__ruhe-gegen-aktiv.webp`, `druck-m390-dark__…`. |
| Weich · Daumenzone in realen Safari-Höhen | Höhenstufe `@media (max-height: 46rem)`: 13:30 als `clamp(4.5rem, min(1rem + 29vw, 16svh), 15rem)`, engere Abstände (Lead `--a-3`, Bild `--a-4`, Aktion `--a-5`). | 390 × 664: Knopf 596–652 (über dem Falz). 375 × 553: Knopf 606–662, **noch 109 px unter dem Falz** (Risiko 9, OFFENE FRAGE 8). Bilder `kurz-m390s-*`, `kurz-m375se-*`; Bildfolgen `erster-bildschirm/m390s-*`, `m375se-*`. |
| Weich · Wendung zu kurz sichtbar, Bild-ab überspringt Stationen | Die drei Stationen stehen immer als Legende an der rot-blauen Schiene. Scroll-gebunden sind nur Plan, Uhr, Freitagsbalken und das Füllen der Stationspunkte. Text wird nie gedämpft oder ausgeblendet. | `bildab-m390-light-voll__0…3`: Beim ersten Bild-ab stehen alle drei Stationen mit Sätzen; beim zweiten der fertige Plan und der Knopf. |
| Weich · Wärme im Dunkeln violett und kaum sichtbar | `--p-nacht-warm` #3A2D55 (260°) → **#7A421F** (Farbton 23°, Helligkeit 30 %, Familie von #FADCC9), 2,24 : 1 gegen #0B1240, Creme darauf 7,04 : 1. | `szene-*-dark-voll__p100.webp`, Haus im Einstieg dunkel. |
| Weich · Druck im Dunkeln 2,27 : 1 | Im dunklen Thema bleibt die Fläche #D60000. Hover und Druck zeigen eine helle Innenkante (`--sch-kante`, 3 px in `--c-auf-aktion`), dazu den Versatz. | `druck-m390-dark__ruhe-gegen-aktiv.webp`. |
| Weich · Plan bedeutungstragend, aber verborgen | Jede Planfläche trägt `role="img"` und `aria-labelledby` auf einen Titel aus belegten Wörtern (radius35.short, Orte aus `locations.ts`). Die Beschriftungen sind `aria-hidden`. | axe 0 Verstöße. |
| Weich · „Wohnort“ berührt den Ring | Mobil nach innen gesetzt (x 9,9 %, Abstand zur Ringlinie ≥ 15 Planeinheiten), „Baustelle“ 79 %. Eine Grundfläche hinter den Beschriftungen erzeugte im Dunkeln Kantenreste und entfällt. | `szene-m390-light-voll__p100.webp`. |
| Weich · Wertedisziplin | Unterstreichung → `--m-strich`; Knotenstrich → `--m-strich`; die −1,5 px sind durch `translate` ersetzt. Radien als Tokens `--r-1`, `--r-2` (Linienenden), `--r-kreis`. Das ungenutzte `--t-7` (Stationswert) ist gestrichen, 13:30 heißt jetzt `--t-7`. §9 und die Budgets sind nachgemessen. | §9, §11. |
| Weich · Inhalte nur belegt | Station 07:00 heißt jetzt „Feste Arbeitszeiten“ (aus `workingHours.long`) und zeigt die Arbeitszeit als Maßketten. Der Fahrzeugsatz und „07:00“ am Wohnort im Plan sind entfernt. | §10; OFFENE FRAGE 2. |
| Weich · Richtungswunsch E-019 | Der Abgang beginnt an „Fr 07:00“ mit dem Giebelhaus aus dem Logo. Die obere Schleifenkante ist die Maßkette des Freitags (Strich je volle Stunde, maßstäblich bis 13:30). Der Auftakt läuft vom Haus aus, der rote Abgang mündet **zuletzt** in den Knopf. Mo–Do 07:00–16:45 steht als dünnere Kette im selben Maßstab in Station 1. | `erster-bildschirm/m390-light-voll__streifen.webp`, `d1440-…`. |

## 1. Leitidee (ein Satz)

> Dein Arbeitstag ist ein geschlossener Heizkreis: Er beginnt um 07:00 am Giebelhaus, der rote Vorlauf bleibt im 35-km-Ring, der blaue Rücklauf bringt dich freitags um 13:30 heim – und die Leitung endet im Knopf „Jetzt bewerben“.

Zugespitzt aus B und A:

- **Aus B:** Haus, Kreislauf, Rot und Blau als Vorlauf und Rücklauf, warmes Papier, 45°-Giebel als Formsystem.
- **Aus A:** Maße statt Behauptungen. „Fr 07:00“ steht am Anfang, die obere Schleifenkante ist eine Maßkette bis 13:30. In der Szene stehen Mo–Do 07:00–16:45 und Fr 07:00–13:30 als Maßketten im selben Maßstab. Dazu die Mono-Planschrift, der lagetreue Plan und die Leitung, die im Bewerben-Knopf endet.
- **Die kühne Neudeutung:** Der Kreislauf ist nicht die Heizung, die erklärt wird, sondern der Tag des Bewerbers. Das Wärmepumpen-Schema als Erklärbild entfällt; die Wärmepumpe bleibt Station im Plan, an der gearbeitet wird.

Gegenüber Runde 1 ist der Satz an die Belege angepasst. „Bringt dich um 07:00 zur Baustelle“ behauptete eine Abfahrtszeit, die keine Quelle nennt. Belegt sind der Arbeitsbeginn 07:00 (`workingHours`), der Radius (`radius35`) und „jeden Abend pünktlich zu Hause“ (`noFarAssembly`).

## 2. Austauschprobe

| Prüfling | Passt es unverändert zu einem Wettbewerber? | Warum nicht (oder wo doch) |
|---|---|---|
| **Leitidee** | Nein, mit einer ehrlichen Grenze | Der Satz besteht aus belegten Werten dieses Betriebs: 07:00 und Freitag 13:30, 35 km, keine Fernmontage. Rot und Blau sind die zwei Farben des Logos, das Giebelhaus ist sein Piktogramm. Ein Betrieb mit Fernmontage oder anderen Zeiten müsste lügen. Grenze: Ein Betrieb mit denselben Zeiten und demselben Radius könnte das Prinzip „hin und zurück“ übernehmen. Deshalb steht das Prinzip nie ohne die Werte. |
| **Einstieg** (Haus an „Fr 07:00“, Maßkette bis 13:30, Schleife, Leitung in den Knopf) | Nein | Die Schrift in Bildgröße ist die Uhrzeit, die nur dieser Betrieb verspricht. Die obere Kante misst den Freitag maßstäblich (sieben Stundenstriche und das Ende 13:30). Das Haus ist das Giebelzeichen aus dem Logo. Übertragbar wäre das Muster „große Zahl im Rahmen“; eigen wird es durch Maßkette, Logo-Haus und das Leitungspaar mit 45°-Fasen. |
| **Hauptmoment** (Szene „Arbeitstag“) | Nein | Der Ring hat genau 35 km um Wetzlar (Firmensitz `company.ts`: 50,56499 / 8,49842). Herborn, Braunfels und Gießen liegen lagetreu nach `locations.ts`. Die Uhr rastet bei 13:30 ein; der Stundenzeiger steht dann bei 45°, so steil wie das Dach. Der Freitagsbalken (6,5 h) steht im Maßstab gegen Mo–Do (9,75 h). Andere Orte oder Zeiten ergeben ein anderes Bild. |

## 3. Hauptmoment der Startseite

**Was:** der Arbeitstag als Kreislauf, in zwei Teilen.

1. **Auftakt im ersten Bildschirm (1.460 ms, einmal, danach Ruhe):**
   - 0–700 ms (`--d-4`): Der rote Vorlauf zeichnet sich vom Haus an „Fr 07:00“ über die obere Kante bis zum Wendepunkt.
   - Ab 700 ms (`--d-2`): Wendepunkt und Stundenstriche blenden ein.
   - 700–1.100 ms (`--d-3`): Der blaue Rücklauf läuft unter der 13:30 zurück und in den Knopf.
   - 820–1.220 ms (`--d-3`, Verzögerung `--d-4` + `--d-1`): Der rote Abgang fällt vom Haus in den Knopf. Er kommt **zuletzt** an.
   - 1.220–1.460 ms (`--d-2`): Der Pfeil im Knopf stößt an.
   - Das Auge startet oben links am Haus (Leseanfang) und endet im Knopf. Text, Ziffern, Haus und Knopf stehen ab dem ersten Bild; bewegt werden nur die Linien.
2. **Sticky-Szene im Anschluss, scroll-gebunden, rückwärts gleich stimmig:**
   - **Aufbau (07:00):** Der Freitagsbalken beginnt sich zu füllen, die Uhr zeigt 07:00, Haus und Baustelle stehen im Ring.
   - **Wendung (35 km):** Der Vorlauf zeichnet sich zur Baustelle, der 35-km-Ring wird kräftig, die Wärmepumpe läuft an (zwei Umdrehungen), der zweite Stationspunkt füllt sich.
   - **Auflösung (13:30):** Der Rücklauf führt heim, die Uhr rastet auf 13:30 ein, der Freitagsbalken ist voll, das Haus wird warm, der dritte Punkt füllt sich.
   - Die drei Stationen (Wert, Marke, Satz) stehen die ganze Zeit. Sie sammeln sich an der Schiene, ersetzen sich nicht.

**Warum:** Für den Chef und für Fachkräfte zählt nicht, wie eine Wärmepumpe funktioniert, sondern wie der Tag aussieht. Die Zusagen, die ein vorsichtiger Wechsler prüft (Arbeitszeit, Radius, Feierabend), werden als ein zusammenhängender Weg erzählt statt als vier gleiche Kacheln.

**Markenmerkmal:** die zwei Logofarben als Leitungspaar; das Giebelhaus mit 45°-Dach (Haus am Abgang, Wohnort im Plan, Fasen aller Knicke); die belegten Werte 07:00, 35 km und Freitag 13:30.

**Dauer:**
- Auftakt: 1.460 ms (≤ 1,5 s).
- Szene: Abschnitt 140 svh, davon 40 svh klebend. Der Animationsbereich reicht von drei Vierteln des Eintritts bis zum Ende der klebenden Phase, also 65 svh. Das sind 549 px auf 390 × 844 und 585 px auf 1440 × 900; das Tempo bestimmt der Besucher.

## 4. Leitfaden: das Leitungspaar und wie es zur Stellenseite wandert

**Element:** zwei Linien, rot (Vorlauf) und blau (Rücklauf), je 3 px (`--m-strich`), Abstand 12 px (`--l-paar` = `--a-3`), Knicke als 45°-Fasen (`--l-fase` = `--a-4`), runde Enden.

| Ort | Gestalt des Paares | Status |
|---|---|---|
| Erster Bildschirm | Beginnt am Giebelhaus bei „Fr 07:00“. Die obere Kante ist die Maßkette des Freitags. Das Paar umläuft 13:30 und mündet in den Knopf. Mobil fällt es senkrecht und versetzt sich kurz vor dem Knopf um 45° nach innen (Leitungstrenner aus B); am Desktop läuft es waagrecht in die rechte Kante des Knopfs. | gebaut |
| Sticky-Szene | Schiene der drei Stationen (von Punkt zu Punkt, endet am letzten). Im Plan der Weg Wohnort → Baustelle → Wohnort im 35-km-Ring, geplant gestrichelt, verlegt farbig. | gebaut |
| Verteiler „Offene Stellen“ | Vorlauf links, Rücklauf rechts, jede Stelle ein Heizkreis dazwischen. Hier wird das Paar zum Inhalt: Titel und Gehaltsspanne. | gebaut |
| Handy-Menü | Paar als senkrechte Schiene, jeder Menüpunkt ein Abgang | gebaut |
| Ruhige Fassung | Dieselbe Stationsschiene, alle Punkte gefüllt | gebaut |
| **Stellenseite** (`/jobs/[slug]`) | Siehe die Stufen unter dieser Tabelle. | Konzept, nicht gebaut |

Die Stellenseite in drei Stufen:

1. **Seitenwechsel:** Der angetippte Heizkreis im Verteiler trägt `view-transition-name`. Auf der Stellenseite steht oben dasselbe waagrechte Paar, Übergang 250–450 ms.
2. **Auf der Stellenseite** verwandelt sich das Paar in die Schleife um die Gehaltsspanne dieser Stelle (z. B. „3.600–4.600 € / Monat“). Am Vorlauf stehen Arbeitsbeginn und Fahrzeug, am Rücklauf Feierabend und Urlaub, jeweils aus den `benefitFactIds` der Stelle.
3. **Weiter unten** wird das Paar zum Fortschritt des eingebetteten Bewerbungsablaufs. Der Vorlauf zeigt die erledigten Schritte, der Rücklauf schließt sich mit dem Absenden.

## 5. Mobil-Komposition und dominante Geste

**390 × 844, eigens komponiert:**

- **Reihenfolge:** Kopf (Logo, Telefon, Menü), Ortsmarke, H1 in zwei Zeilen („SHK-Jobs“ / „in Wetzlar.“), zweite Zeile, Lead.
- **Darunter das Bild:** Giebelhaus mit „Fr 07:00“, die Schleife um 13:30 über die volle Breite (Ziffern 129 px), darunter „Freitags Feierabend“ und in einer Zeile „35 km Einsatzradius“ und „30 Tage Urlaub“.
- **Hauptaktion in der Daumenzone:** Der Knopf liegt bei y = 675–731 px von 844, volle Breite, 56 px hoch. Darunter folgen der Mikrotext und „Offene Stellen ansehen“ (776–820).
- **Kurze Fenster:**
  - 390 × 664 (Safari mit Leisten): Knopf bei 596–652, über dem Falz.
  - 375 × 553: Der Knopf liegt unter dem Falz (siehe Risiko 9).
- **Leerraum:** Freier Raum sammelt sich zwischen Lead und Bild (Rasterzeile `1fr`), damit Bild und Knopf unten zusammenbleiben.
- **Begründung der Geste:** „13:30“ ist die eine Zahl, die eine SHK-Fachkraft sofort als Vorteil liest. Als Schrift in Bildgröße ist sie LCP-Element, echter Text und Bild zugleich. Haus und Maßkette machen aus der Zahl einen Tag, die Leitung führt in die Handlung.
- **Sticky-Szene mobil:** in `svh`, ohne Hover. Oben die Stationslegende an der Schiene, in der Mitte der Plan (füllt die freie Höhe), unten „Jetzt bewerben“ und Telefon in der Daumenzone. Je Ansicht steht nur eine rote Aktion. Unter 36 rem Höhe klebt die Bühne nicht mehr, die Szene läuft als Plan-Ansicht mit.
- **Desktop (1440):** H1 oben links (132 px), Schleife mit 13:30 rechts (246 px), Haus und Maßkette oben an der Schleife. Das Paar läuft unter dem Lead waagrecht in den Knopf unten links.
- **Geprüft** von 320 bis 430 px in 1-px-Schritten, dazu 768, 1024, 1440 und 1920, mit Grundschrift 16, 20 und 24 px.

## 6. Ruhige Fassung (reduzierte Bewegung, ohne JavaScript)

Eigens gestaltet, nicht abgeschaltet:

- **Einstieg:** steht vollständig, Leitung gezeichnet, Stundenstriche und Wendepunkt sichtbar, kein Pfeilstoß.
- **Szene „Plan-Ansicht“:** nicht klebend, alle drei Stationen mit gefüllten Punkten. Im Plan steht der ganze Tag: Vorlauf und Rücklauf verlegt, Ring kräftig, Uhr auf 13:30, Freitagsbalken voll, Haus warm.
  - Desktop: Stationen links, Plan rechts.
  - Mobil: erst die Stationen, dann der Plan, dann die Aktion.
- **Menü** blendet nur über, ohne Versatz. Druckzustände ohne Versatz, mit Fläche, Rand oder Unterstreichung.
- **Ohne JavaScript:**
  - Die Schleife steht als Rahmen ohne Abgang zum Knopf; die Szene als Plan-Ansicht.
  - Statt des Menüknopfs steht die Navigation als Zeile unter dem Kopf.
  - Belege: `fotos/ohne-js-m390-light__01…03`.
- **Ohne scroll-driven animations** (Safari < 26, Firefox): drei Stufen über IntersectionObserver mit Übergängen, rückwärts gleich stimmig. In Chromium simuliert, Belege `fotos/stufen-*`.

## 7. Schrift und Austauschprobe der Display-Schrift

- **Display:** Bricolage Grotesque (variabel, Gewicht 800, optische Größe automatisch). H1 mit −0,01 em; Ziffern 13:30 mit −0,025 em und `text-box: trim-both cap alphabetic`, damit die Leitung genau auf Versalhöhe und Grundlinie sitzt.
- **Text:** Atkinson Hyperlegible Next. Ziffern im Fließtext („60“) in Bricolage, weil Atkinsons Null einen Schrägstrich trägt.
- **Maße:** Martian Mono (Breite 87,5 %, Versalien, +0,06 em), nur für Maße, Maßketten und Planbeschriftung.
- **Größe:** zwei Familien plus eine Mono, 223.864 Byte auf der Platte (218,6 KiB), geladen 149.376 Byte (145,9 KiB), zwei Schnitte vorgeladen, Ersatzschriften mit Metrik-Overrides.

**Austauschprobe der Display-Schrift (aus Runde 1, Probe im Scratchpad):** H1 und „13:30 in der Schleife“ in Bricolage 800, Gabarito 800, Archivo 800 (Breite 75 %), Familjen Grotesk 700 und Schibsted Grotesk 800.

- **Gabarito** ist rund und weicher; neben der 3-px-Leitung verliert die Zahl an Masse.
- **Familjen Grotesk** endet bei 700 und wirkt leichter; die Spannung zwischen schwerer Zahl und feiner Leitung fehlt.
- **Schibsted Grotesk** ist breit und neutral; „SHK-Jobs“ bricht mobil früher.
- **Archivo schmal** ist die stärkste Alternative (technischere, schmalere Ziffern), aber die Display-Schrift von Richtung A; ein Wechsel würde die Varianten angleichen.

**Was Bricolage hier eigen macht:** der Einsatz, nicht der Name. Die kompakten, schweren Ziffern bilden in 129 bis 246 px eine dunkle Masse, um die die 3-px-Leitung und die 1-px-Stundenstriche laufen.

**Entscheidung:** Bricolage bleibt. Bei einer Verschmelzung mit A ist Archivo schmal für die Ziffern der erste Kandidat (OFFENE FRAGE 6).

## 8. Bewegungsregister

Dauerstufen (5): `--d-1` 120 ms, `--d-2` 240 ms, `--d-3` 400 ms, `--d-4` 700 ms, `--d-5` 2.000 ms (nur Sicherheitsnetz des Kopfskripts).

Kurven (4): `--k-aus` (0.16, 1, 0.3, 1), `--k-wechsel` (0.65, 0, 0.35, 1), `--k-ein` (0.32, 0, 0.67, 0), `--k-linear` (scroll-gebunden).

Animiert werden nur `transform`, `opacity` und `stroke-dashoffset` (mit `pathLength="1"`). Jede animierte Stelle trägt ihre Kennung als `data-motion`; animiert ein Pseudo-Element, trägt sein Element die Kennung.

| Kennung | Element | Zweck | Auslöser | Dauer · Kurve | Reduziert |
|---|---|---|---|---|---|
| `auftakt-vorlauf` | roter Vorlauf im Einstieg (Haus → Wendepunkt) | Blickweg vom Leseanfang über die Maßkette | Laden, Klasse `auftakt` | `--d-4` · `--k-wechsel` | steht gezeichnet |
| `auftakt-takt` | Stundenstriche der Maßkette | Maß erscheint, wenn die Linie liegt | Laden, Verzögerung `--d-4` | `--d-2` · `--k-aus` (Deckkraft) | stehen |
| `auftakt-knoten` | Wendepunkt | Umkehr Vorlauf → Rücklauf | Laden, Verzögerung `--d-4` | `--d-2` · `--k-aus` (Skalierung 0,4 → 1, Deckkraft) | steht |
| `auftakt-ruecklauf` | blauer Rücklauf (Wendepunkt → Knopf) | Rückweg, mündet im Knopf | Laden, Verzögerung `--d-4` | `--d-3` · `--k-wechsel` | steht gezeichnet |
| `auftakt-abgang` | roter Abgang (Haus → Knopf) | kommt zuletzt im Knopf an, lenkt auf die Handlung | Laden, Verzögerung `--d-4` + `--d-1` | `--d-3` · `--k-wechsel` | steht gezeichnet |
| `auftakt-ankunft` | Pfeil im Knopf des Einstiegs | Ankunft der Leitung | Laden, Verzögerung `--d-4` + `--d-1` + `--d-3` | `--d-2` · `--k-wechsel` (Versatz `--a-2`) | entfällt |
| `szene-vorlauf` | roter Weg im Plan | Aufbau: Weg zur Baustelle | Bereich 8–42 % | scroll-gebunden · `--k-linear` | steht gezeichnet |
| `szene-ring` | kräftiger 35-km-Ring | Wendung: Baustelle liegt im Radius | 36–44 % | scroll-gebunden | steht |
| `szene-luefter` | Lüfter der Wärmepumpe | Inbetriebnahme, die Arbeit des Tages | 42–58 % (2 Umdrehungen) | scroll-gebunden | steht still |
| `szene-ruecklauf` | blauer Weg im Plan | Auflösung: zurück nach Hause | 56–88 % | scroll-gebunden | steht gezeichnet |
| `szene-uhr` | Stunden- und Minutenzeiger | Zeit vergeht von 07:00 bis 13:30, rastet 45° ein | 8–90 % | scroll-gebunden | steht auf 13:30 |
| `szene-tag` | Füllung des Freitagsbalkens | derselbe Fortschritt wie die Uhr, als Maß | 8–90 % (`scaleX`) | scroll-gebunden | voll |
| `szene-waerme` | Wärmefläche im Haus | Ankunft zu Hause | 86–96 % | scroll-gebunden | steht |
| `szene-station` | Punkt der Station (Pseudo-Element) | Stationen sammeln sich: 07:00 sofort, 35 km bei 38–42 %, 13:30 bei 78–82 % | scroll-gebunden (`scale`) | – | alle gefüllt |
| `szene-plan` | Planbeschriftung „35 km“, „13:30“ | erscheint mit ihrer Station | 36–44 % und 74–82 % | scroll-gebunden | sichtbar |
| (Rückfall `stufen`) | dieselben Kennungen | ohne scroll-driven animations | IntersectionObserver, drei Stufen | `--d-4` · `--k-wechsel` (Wege, Zeiger, Balken), `--d-3`/`--d-2` · `--k-aus` (Deckkraft, Punkte) | Plan-Ansicht |
| `menue` | Handy-Menü (modaler Dialog) | Öffnen als eigener Moment | Tippen auf „Menü“ | öffnen `--d-2` · `--k-aus`, schließen `--d-1` · `--k-ein` (Deckkraft, Versatz `--a-3`) | nur Überblendung |
| `druck` | Hauptaktion, Telefon, Menüknöpfe, Logo, Menüpunkte, Navigation, „Offene Stellen ansehen“ | Rückmeldung beim Tippen und Drücken | `:active`; Hover bei feinem Zeiger | `--d-1` · `--k-aus` (Versatz `--a-1`; Hauptaktion: Deckschicht hell dunkler, dunkel helle Innenkante) | ohne Versatz, Fläche/Rand/Kante bleiben |
| `nav-linie` | Unterstrich der Navigation | Hover-Rückmeldung | Hover bei feinem Zeiger | `--d-2` · `--k-aus` (`scaleX`) | ohne Übergang |
| `pfeil` | Pfeile in Knöpfen, „Offene Stellen ansehen“, Stellenzeilen | Richtung der Handlung | Hover bei feinem Zeiger | `--d-2` · `--k-aus` (Versatz `--a-1`) | ohne Übergang |
| `zeile` | Stellenzeile im Verteiler | Hover- und Druck-Rückmeldung | Hover, `:active` | `--d-1` · `--k-aus` (Deckschicht) | gleich |

**Weitere Regeln:**
- Kein Endlosablauf, nichts läuft länger als 5 s ohne Zutun; kein Pause-Knopf nötig.
- Kein Scroll-Hijacking: natives Scrollen, `position: sticky`; Tastatur, Anker und Zurück bleiben unberührt.
- Startzustände hängen nur an den Klassen `bewegt` und `auftakt` aus dem Kopfskript; das Sicherheitsnetz liest `--d-5`.

**Framezeiten mobil (390, vierfache CPU-Drosselung, Chromium, Runde 2):** Auftakt 1 von 98 Bildern über 25 ms; Szene 0 von 100, Median 16,7 ms.

## 9. Tokens (Skalen, gemessen per `getComputedStyle`)

Messung Runde 2: alle Elemente und Pseudo-Elemente, 24 Läufe (m375, m390, m430, t768, d1440, d1920 × hell/dunkel × voll/reduziert).

| Skala | Tokens | Gemessen |
|---|---|---|
| Schriftgrößen (7) | `--t-1` 13 px, `--t-2` 15 px, `--t-3` 17–20 px, `--t-4` 20–30 px, `--t-5` 26–44 px, `--t-6` (H1, Menü) 52 px mobil · 132 px bei 1440, `--t-7` (13:30) 129 px bei 390 · 246 px bei 1440. Gestufte `clamp` mit rem-Anteil. H1 und 13:30 sind zusätzlich an ihren Behälter gekoppelt (`min()` mit `cqi`); das greift erst bei großer Grundschrift oder sehr schmalen Spalten. | 7 Werte je Ansicht (m390: 13 · 15 · 17,2 · 20,3 · 26,2 · 52 · 129,1 px), alle aus diesen Tokens. Die nur für Screenreader sichtbaren Überschriften erben die Schrift, statt der Browser-Vorgabe 1,5 em. |
| Abstände (11) | `--a-1` 4 px bis `--a-10` 128 px (10 Stufen) und `--rand` (Seitenrand) | 9–11 Werte je Ansicht. Außerhalb der Skala nur: −1 px (`.sr-only`, Standardmuster) und `auto` (Logo, Beschriftung im Bild, Menüfuß). Der Einzug hinter dem Leitungspaar ist jetzt `--l-paar` + `--a-3` = 24 px, auf der Skala. Die −1,5 px aus Runde 1 sind durch `translate: 0 -50%` ersetzt. |
| Dauern (5) | siehe §8 | nach dem Laden 120 ms, 240 ms und `auto` (scroll-gebunden); der Auftakt nutzt zusätzlich 400 und 700 ms |
| Kurven (4) | siehe §8 | nach dem Laden `--k-aus` und linear; Auftakt und Rückfall `--k-wechsel`, Schließen des Menüs `--k-ein` |
| Radien (3) | `--r-1` 2 px (Ecken), `--r-2` = `--m-strich` 3 px (Linienenden), `--r-kreis` 50 % | 3 |
| Schatten (2) | `--sch-taste` (Tiefe der Hauptaktion), `--sch-kante` (helle Innenkante, Druck im dunklen Thema) | 2 |
| Maße | `--m-ziel` 44 px, `--m-knopf` 56/60 px, `--m-kopf`, `--m-logo`, `--m-strich` 3 px, `--m-haar` 1 px, `--m-fokus` 3 px, `--m-icon` 2 (Icon-Strich in Icon-Einheiten) | Unterstreichung und Knotenstrich jetzt `--m-strich`, keine freien 2 px oder 2,5 mehr |

**Lagen statt Abstände:** Planbeschriftungen (`--x`/`--y` je Klasse), Stationspunkte (`top`/`left`) und Strichstärken im Plan (`--pw`, `--pr`) sind Bildinhalt, keine Abstände. Die Anteile der Maßketten (`--anteil` 1 und 0,6667) sind Daten (9,75 h und 6,5 h).

**Palette:**

| | Hell | Dunkel |
|---|---|---|
| Papier | #FBF7F0 | #0B1240 (Navy-Fläche) |
| Wand | #F1E9DB | #141D55 |
| Wärme | #FADCC9 | **#7A421F** (Farbton 23°, Familie von #FADCC9) |
| Navy für Überschriften und Ziffern | #111D6D | Creme #F6F0E4 |
| Tinte | #111A3B | Creme #F6F0E4 |
| Tinte 2 | #454E80 | #B9C0E8 |
| Rand | #6B74A6 | #7F88C4 |
| Rot | #D60000, nur Fläche der Hauptaktion und dünner Vorlauf; Druck #A80000 als Deckschicht | Vorlauf #FF6B5E; Knopf bleibt #D60000, Druck als helle Innenkante |
| Blau | #1F57C4 (Rücklauf, Fokus) | #8DB0FF |

**Kontraste** (aus den Hexwerten berechnet):

| Paar | Hell | Dunkel |
|---|---|---|
| Tinte auf Papier | 15,93 | 15,75 |
| Navy auf Papier | 13,84 | – |
| Navy auf Wand (gedrückt) | 12,26 | – |
| Creme auf Wand (gedrückt) | – | 13,84 |
| Navy auf Wärme | 11,37 | – |
| Creme auf Wärme | – | 7,04 |
| Wärme gegen Grund | – | 2,24 |
| Tinte 2 auf Papier | 7,41 | – |
| Tinte 2 auf Nacht | – | 10,02 |
| Weiß auf Rot (auch Innenkante) | 5,44 | 5,44 |
| Weiß auf Druckrot | 7,88 | – |
| Rot-Linie auf Papier | 5,10 | – |
| Blau auf Papier | 6,11 | – |
| Rand auf Papier (Freitagsbalken vor dem Füllen) | 4,21 | – |
| Rand auf Nacht | – | 5,30 |
| Vorlauf-Linie auf Nacht | – | 6,40 |
| Rücklauf auf Nacht | – | 8,33 |
| Knopf gegen Nacht (Ruhe, Hover und Druck) | – | 3,29 |

Grün kommt nicht vor. Keine Verläufe. In keinem Text steht Rot.

## 10. Inhalte und Quellen (nichts erfunden)

| Text | Quelle |
|---|---|
| „Seit 1926 · Wetzlar“, H1, zweite Zeile, Lead, Mikrotext | `components/home/content.ts` (HERO) |
| „100 Jahre Meisterbetrieb (1926–2026)“ | `facts.ts` `anniversary100.short`; nach `validUntil` 2026-12-31 per Skript ausgeblendet (`data-bis`) |
| „13:30“, „Freitags Feierabend“ | `friday1330.value`, `.label` |
| „35 km“, „Einsatzradius“ | `radius35.value`, `STAT_LABELS` in `content.ts` |
| „30 Tage Urlaub“ | `vacation30.short` |
| „Fr 07:00“; Szenenüberschrift (nur für Screenreader) „Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr“; Maßketten Mo–Do 07:00–16:45 und Fr 07:00–13:30 | `workingHours.short` |
| Station 07:00: „Feste Arbeitszeiten“ | `workingHours.long` („Feste Arbeitszeiten: …“) |
| Station 35 km: „Alle Baustellen liegen in Wetzlar, Gießen und dem Lahn-Dill-Kreis, maximal 35 km vom Firmensitz entfernt.“ | `radius35.long` |
| Station 13:30: „Keine Fernmontagen und keine Hotelübernachtungen: Du bist jeden Abend pünktlich zu Hause.“ | `noFarAssembly.long` |
| Plan-Titel (Screenreader): „Plan: Einsatzgebiet maximal 35 km um Wetzlar, mit Herborn, Braunfels und Gießen. Schema: Wohnort und Baustelle.“ | `radius35.short`, Orte aus `lib/data/locations.ts`, „Wohnort“/„Baustelle“ aus `vehicle.long`/`radius35.long` |
| „Jetzt bewerben“ | `SHORT_APPLY_LABEL` in `nav.ts` |
| „Offene Stellen ansehen“, „Offene Stellen“ | Briefing; `components/home/Hero.tsx`, `JobList.tsx` |
| Navigation Stellen, Vorteile, Ablauf, FAQ | `components/site/nav.ts` |
| Telefon 06441 42956 | `lib/data/contact.ts` |
| Aria-Namen („… zur Startseite“, „Hauptnavigation“, „Menü“, „Schließen“, „anrufen“) | wie `HeaderBar.tsx` und `MobileNav.tsx` |
| Stellen und Gehaltsspannen | `lib/jobs/data/*` (`shortTitle`, `salary`; Format wie `formatSalaryRange`) |
| Plan: Wetzlar, Herborn, Braunfels, Gießen und ihre Lage | `lib/data/locations.ts`, `company.ts` |

**Entfernt in Runde 2:** der Fahrzeugsatz (`vehicle.long`, zweiter Satz) an Station 07:00 und die Beschriftung „07:00“ am Wohnort im Plan. Zusammen legten sie „Abfahrt zu Hause um 07:00 als Regelfall“ nahe; die Quelle schränkt ein („Je nach Aufgabenbereich und Absprache“). Das Haus im Einstieg ist das Giebelzeichen des Logos am Anfang des Arbeitstags, nicht als „Wohnort“ beschriftet (OFFENE FRAGE 2).

Der Erklärsatz zur Wärmepumpe (T-001) wird nicht verwendet.

## 11. Budgets

| Posten | Wert | Grenze |
|---|---|---|
| Schriften auf der Platte | 223.864 B (218,6 KiB) | ≤ 250 KB |
| Schriften geladen | 149.376 B (145,9 KiB; drei `latin`-Dateien) | – |
| JavaScript | 6.009 B roh, **2.435 B gzip** (beide Skripte zusammen; einzeln Kopf 354 B, Seite 2.206 B), inline, ohne Bibliothek | ≤ 8 KB |
| CSS (inline) | 38.767 B roh, 10.189 B gzip | – |
| HTML gesamt | 61.968 B roh, 16.550 B gzip | – |
| Anfragen | **5** (HTML, Logo, 3 Schriften) | 0 Fremdanfragen |

Weitere Messwerte (lokal, Chromium): LCP-Element ist die 13:30 (`span.zeit`) nach 108–116 ms; sie startet nie unsichtbar, die H1 ebenso. CLS 0 (390) bzw. 0,002 (1440).

## 12. Belege und Prüfungen

**`fotos/bericht.json`** (Werkzeug `kachel-fotos.mjs`): 20 Aufnahmen, 60 Ausschnitte (m375, m390, m430, t768, d1440, d1920; hell und dunkel; voll und reduziert). **0 Überlauf, 0 abgeschnittene Texte, 0 Fehler, 0 Fremdanfragen.** Die Ganzseitenaufnahme zeigt die klebende Bühne im Startzustand; der freie Streifen darunter (40 svh) ist ihr Scrollweg, kein Leerraum der Seite.

**`fotos/ergaenzung.json`** (eigene Ergänzung mit derselben Anfragesperre und demselben Überlaufbericht): 27 Läufe, 0 Überlauf, 0 Fehler, 0 Fremdanfragen. Unter `messungen` stehen Anschluss, 1-px-Lauf, Grundschrift und Daumenzone.
- Szene als Bildfolge: `szene-<m390|d1440>-<light|dark>-voll__p000…p100`, dazu `p045-rueckwaerts`.
- Bild-ab mit der Tastatur: `bildab-m390-light-voll__0…3`.
- Rückfall: `stufen-*__stufe1…3`.
- Menü: `menue-m390-light`, `menue-m390-dark`, `menue-m390-tastatur__1-offen`, `__2-esc`.
- 320 × 568: `m320-light-<voll|reduziert>__start|szene|stellen`.
- Ohne JavaScript: `ohne-js-m390-light__01…03`.
- Kurze Fenster: `kurz-m390s-*` (390 × 664), `kurz-m375se-*` (375 × 553).
- Druckzustände: `druck-m390-<light|dark>__ruhe-gegen-aktiv`.
- Grundschrift: `schrift-<m320|m390>-<20|24>px`.

**`erster-bildschirm/`:**
- Bildfolgen 0–1.500 ms für m390 und d1440, hell und dunkel, voll (`bericht.json`) und reduziert (`bericht-reduziert.json`), je mit Streifen. 0 Fehler, 0 gesperrte Anfragen.
- Das Bild bei 0 ms ist leer, weil vor dem ersten Screencast-Bild noch nichts gemalt ist (Werkzeugverhalten, `bild_ab_ms: null`). Das erste Bild zeigt nach 102–250 ms den ganzen Inhalt; voll und reduziert sind Text, Haus, 13:30 und Knopf dann gleich, nur die Linien entfalten sich.
- Kurze Fenster 390 × 664 und 375 × 553, voll und reduziert (`bericht-kurz.json`, `m390s-*`, `m375se-*`).

**`aufzeichnung/`:** `aufzeichnung-m390-voll.webm` und `aufzeichnung-d1440-voll.webm`, je 4 s Laden und Scroll durch die ganze Seite. Nur als gekennzeichnete Aufzeichnung.

**axe-core** (WCAG 2 A/AA, 2.1, 2.2 AA, Best Practice; m390, t768, d1440; hell und dunkel; voll und reduziert; dazu Menü offen hell und dunkel): **0 Verstöße in 14 Läufen.** Als „unvollständig“ meldet axe Kontraste über der absolut liegenden Leitungsgrafik; diese Paare sind in §9 aus den Tokens gerechnet.

**Tastatur:**
- Seite: Sprunglink, Logo, Navigation (Desktop) bzw. Telefon und Menü (mobil), Hauptaktion, „Offene Stellen ansehen“, Szene (Knopf, Telefon), vier Stellen.
- Menü offen: Der Fokus bleibt im Dialog; der einzige Schritt hinaus führt in die Bedienleiste des Browsers (Verhalten nativer modaler Dialoge). Esc schließt, der Fokus kehrt zu „Menü“ zurück.
- Jeder Stopp hat einen 3-px-Fokusring in Blau (6,11 : 1 auf Papier) mit 3 px Abstand. Alle Ziele ≥ 44 × 44 px.

**html-validate** 9.4.1 (recommended): ein bewusster Befund, `role="list"` an der Werteliste (VoiceOver behält so die Listensemantik trotz `list-style: none`). Keine Inline-Stile mehr (Lagen als Klassen).

**Befunde aus Runde 1/2 (pruefen-a/-b, jury-*), die nicht zurückkommen:**
- 320 px ohne Überlauf, nichts per `overflow-x: clip` versteckt; jetzt auch mit 24 px Grundschrift.
- Logo-Link mit Ziel `/` und Namen wie auf der Plattform; das Logo schrumpft bei großer Grundschrift, statt überzulaufen. Dunkel auf Plakette, byte-gleich.
- Werte nur aus Tokens, Dauern aus Tokens.
- Eigene Mobil-Komposition.
- Kein Aufblitzen: Linien starten gezeichnet-leer, Text nie.
- Touch-Ziele ≥ 44 px, geschützte Leerzeichen bei km, Uhr, Sekunden, Tage, €.
- Kein Rot als Text; keine Farb- oder Strichstärken-Transitions.

## 13. Risiken

1. **Freitag als Hauptbild.** 13:30 gilt nur freitags. „Fr 07:00“ steht am Haus, „Freitags Feierabend“ direkt unter der Zahl, die Mo–Do-Kette in der Szene. Restrisiko: Wer nur die Zahl sieht, liest „jeden Tag 13:30“. Eine Mo–Do-Kette im Einstieg im selben Maßstab wäre 1,5-mal so breit wie die Schleife; in einem anderen Maßstab wäre sie ungenau. Deshalb steht sie in der Szene.
2. **LCP ist die 13:30, nicht die H1.** Beide stehen ab dem ersten Bild. Auf der Plattform gilt das LCP-Budget (≤ 2,5 s) für dieses Element.
3. **Schematischer Plan.** Wohnort und Baustelle sind Platzhalterlagen ohne Ortsnamen, die Wege sind keine Straßen; der Ring ist Luftlinie.
4. **Scrollweg.** Die Grenze von zwei Bildschirmhöhen lässt der Szene 40 svh Klebephase und 65 svh Animationsbereich. Wer schnell wischt, sieht die Zeichnung kurz. Die Inhalte stehen aber als Legende immer (siehe `bildab-*`).
5. **Browserbreite.** Scroll-driven animations nur in Chromium (und Safari ab 26), sonst Stufen-Rückfall (nur in Chromium simuliert). `text-box` fehlt in Firefox. Invoker Commands fehlen in älteren Browsern; dort öffnet der Skript-Rückfall den Dialog.
6. **Trendschrift** (siehe §7).
7. **Erwartung an Fotos.** Diese Richtung bleibt typografisch (K-014: keine Fotos); N-16 bleibt beim Auftraggeber.
8. **Haus im Einstieg.** Es ist das Logo-Giebelzeichen am Anfang des Arbeitstags. Wer es als „Zuhause“ liest, liest eine Abfahrt um 07:00 hinein; belegt ist nur der Arbeitsbeginn (OFFENE FRAGE 2).
9. **Sehr kurze Fenster.** Bei 375 × 553 (iPhone SE mit Safari-Leisten) liegt der Knopf trotz Höhenstufe bei 606–662, also unter dem Falz; Ortsmarke, H1, Lead und 13:30 brauchen die Höhe. Abhilfe ohne Inhaltsverlust wäre die klebende Bewerben-Leiste der Plattform (`nav.ts`, `PRIMARY_CTA_ATTR`), die nur erscheint, solange keine Hauptaktion sichtbar ist (OFFENE FRAGE 8). Der Anschluss misst dort 2,09 (voll) bzw. 2,28 (reduziert) Bildschirmhöhen, weil die Inhalte in px fest sind.

## 14. Offene Fragen

1. Navigationspunkt „Kontakt“: `nav.ts` kennt nur Stellen, Vorteile, Ablauf und FAQ. Erreichbarkeit läuft über das Telefon im Kopf, in der Szene und im Menü. Soll „Kontakt“ in die Navigation?
2. Darf der Arbeitstag im Bild am Haus beginnen (Giebelzeichen bei „Fr 07:00“), oder soll er ohne Haus beginnen? Soll das Fahrzeug (`vehicle.long`, beide Sätze, ohne Uhrzeit) in der Szene stehen? In Runde 2 ist es entfernt.
3. Ist die schematische Lage von „Wohnort“ und „Baustelle“ im lagetreuen Plan als Illustration in Ordnung, auch wenn der Wohnort nicht im 35-km-Ring liegen muss?
4. `distanceKm` in `locations.ts`: Straße oder Luftlinie? Der Ring zeigt Luftlinie.
5. Ist 06441 42956 die Nummer für Bewerber?
6. Bei einer Verschmelzung mit A: Archivo schmal für die Ziffern? Bei einer Verschmelzung mit B: das große Haus mit Wärmepumpe als Station im Einstieg statt des kleinen Giebelzeichens?
7. Die Links zeigen auf Plattformrouten (`/bewerbung`, `/jobs`, `/jobs/<slug>`, `/#vorteile` …) und lösen im statischen Server nicht auf.
8. Soll die klebende Bewerben-Leiste der Plattform auf der Startseite bei sehr kurzen Fenstern (≤ 36 rem Höhe) schon im ersten Bildschirm erscheinen?

=== ENDE A2-RICHT-2 · BEREIT ZUR RÜCKGABE ===
