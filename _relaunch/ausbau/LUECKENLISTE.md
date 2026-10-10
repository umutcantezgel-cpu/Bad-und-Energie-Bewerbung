# Lückenliste A1 · Steigerungsanalyse der Schwerpunktseiten

Kennung A1-ANALYSE-01, überarbeitet als A1-ANALYSE-02 nach der Gegenprüfung A1-GEGEN-01 · Rolle O (Steigerungsanalyst, Stufe 3) · Stand 09.10.2026 · Bezugspunkt „Endstand 1“ = Ausgangsstand a83269d (E-018) · Schwerpunktseiten `/` und `/jobs/anlagenmechaniker-shk-wetzlar` · Phasentor A1: Die 12 Korrekturen von A1-GEGEN-01 sind eingearbeitet (§8); die Bestätigung durch einen frischen Gegenprüfer steht aus.

## 1 Methode

1. **Erster Bildschirm als Bildfolge.** Bilder bei 0 bis 1.500 ms im 250-ms-Takt in 390 × 844 und 1440 × 900, hell und dunkel, Bewegung „no-preference“, dazu der Bericht mit den Zeitpunkten des ersten Bildes. Geprüft wurden Komposition, dominante Geste, nächster Schritt, Daumenzone, Auftakt und Nachrutschen.
2. **Ganze Seiten in Bildschirmhöhen.** Neu aufgenommen in 390 und 430 (A0), aus P0 in 375, 768, 1440 und 1920. Je Abschnitt wurden Ort, Dichte und Rhythmus festgehalten.
3. **Austauschprobe für alles Vorhandene.** Die Frage lautet: Passt das Element unverändert zu einem anderen SHK-Betrieb, wenn man Logo und Namen tauscht? Geprüft wird getrennt nach **Inhalt** (belegter Fakt dieses Betriebs) und **Form** (Gestaltung, Komposition, Bewegung).
4. **Jury-Schwächen.**
   - P0: 12 Urteile, davon 6 zu den Schwerpunktseiten.
   - Stilkacheln Runde 1: 6 Urteile zu A, B und C, dazu die Prüfbefunde aus Runde 1 und 2.
   - Kachelbefunde zählen als Lehre für die Richtung nach E-019. Die Kacheln sind keine Plattform.
5. **Abstand zur Stufe 9.** Der Anker lautet: „man zeigt die Seite anderen, weil sie überrascht und mühelos wirkt“. Gemessen wird in Punkten gegen A-01, gegen A-03 mit dem gemessenen Wow-Ausgangswert (`_relaunch/MESSUNGEN.md`, „Wow-Probe – Ausgangswert“) und qualitativ in drei Merkmalen: Überraschung, Mühelosigkeit, Erinnerbarkeit.
6. **Lesend gegengeprüft.**
   - Seiten-HTML per GET von `http://localhost:3500` (`/`, Stellenseite, beide OG-Bilder).
   - Code in `components/`, `app/`, `lib/`.
   - Gemacht wurden nur lesende Anfragen. Es gab keinen Build, keine Git-Schreibvorgänge und keine POST-Anfrage.
7. **Priorität.**
   - **hoch:** prägt den ersten Bildschirm einer Schwerpunktseite sichtbar (in einer der Ansichten 375, 390, 430, 768, 1440 oder 1920, hell oder dunkel) oder bestimmt, wann er erscheint; oder ist Kandidat für einen Hauptmoment oder Leitfaden; oder ohne die Lösung ist A-01 oder A-03 nicht erreichbar.
   - **mittel:** Abschnitt mit belegter Jury-Schwäche, Voraussetzung für A-04 oder A-05, Rahmendetail des ersten Bildschirms, das die Komposition nicht trägt (Browserleiste, Höhe, sichere Bereiche), oder Anforderung an künftige Momente ohne heutigen sichtbaren Mangel (ruhige Fassung).
   - **niedrig:** Detail oder Feststellung.
   - Geschärft nach A1-GEGEN-01 (§8, Nr. 7). Vorher hieß es nur „liegt im ersten Bildschirm“; damit standen L-07, L-18, L-20 und L-39 im Widerspruch zur eigenen Regel.
8. **Richtung der Lösung nach E-019.**
   - Grundlage ist B in der Fassung der Runde 1: Haus mit Wärmepumpe, roter Vorlauf, blauer Rücklauf, warmes Papier, Farben nach E-016.
   - Dazu kommt die Präzision von A: Maße und Maßketten, das Arbeitszeit-Diagramm und eine Leitung, die im Bewerben-Knopf endet.
   - Die Reparaturen aus Runde 2 bleiben erhalten: 320 px, Tokens, Ziel des Logo-Links, eigene Mobil-Komposition.
   - C liefert nur Material.
   - Die Liste enthält keine fertigen Entwürfe. Sie nennt nur Fakten aus `lib/content/facts.ts`, `components/home/content.ts`, `lib/data/*` und `lib/jobs/data/*`.

**Abkürzungen der Bildpfade** (Koordinaten in Bildpixeln der Datei; „y 300–760“ heißt: senkrechter Bereich in der Datei):

| Kürzel | Pfad | Format |
|---|---|---|
| `EB/start/`, `EB/stelle/` | `_relaunch/ausbau/belege/a0-erster-bildschirm/start/` bzw. `…/stellenseite/` | m390 = 780 × 1688 (2×), d1440 = 1440 × 900 |
| `A0/` | `_relaunch/belege/a0-ausgangsstand-390-430/` | m390 = 1170 × 2532 (3×) je Bildschirmhöhe, m430 = 1290 × 2796 |
| `P0/` | `_relaunch/belege/p0-ausgangsstand/` | m375 = 750 × 1624, t768 = 1440 × 1920 (Maßstab 1,875), d1440 = 1440 × 900, d1920 = 1440 × 810 (Maßstab 0,75), je Bildschirmhöhe |
| `JU/` | `_relaunch/belege/p0-jury/urteile/` | JSON |
| `WOW` | `_relaunch/ausbau/belege/a0-wow/ergebnis.json` (S1 Start m390, S2 Start d1440, S3 Stelle m390, S4 Stelle d1440; „S4-2“ = zweites Einzelurteil in S4) | JSON |
| `RI/` | `_relaunch/richtungen/` (Kacheln, `ergebnisse-runde1-2.json`) | – |
| `AG` | `_relaunch/belege/auftraggeber/2026-10-09-1501-kachel-b-runde1-d1440.webp` (Wunschbild des Auftraggebers) | 1389 × 868 |

**Grenzen der Belege:**
- Der Erfolgszustand von `/bewerbung/danke` ist nicht aufgenommen, weil er eine POST-Anfrage bräuchte. Belegt ist nur der Leerzustand.
- Das geöffnete Handy-Menü ist nicht aufgenommen; Beleg ist der Code.
- Überziehen (Overscroll) und WebKit sind nicht gemessen.
- Der Wow-Ausgangswert ist gemessen, und zwar vor dieser Liste (Commit 151afaa, 15:51 UTC): Median aus Überraschung und Begehrlichkeit Start m390 5,5 · d1440 5,0, Stelle m390 4,0 · d1440 4,0; Vertrauen je 6 mobil und 7 Desktop (`_relaunch/MESSUNGEN.md`, „Wow-Probe – Ausgangswert“; `WOW`). Gemessen ist nur das helle Schema (L-18, §7). Veraltet ist nur die Statuszeile in `_relaunch/STATUS.md` („Wow –“).
- Die Vollbild-Aufnahmen d1440 aus P0 zeigen an Bildschirmgrenzen teils Nahtfehler des Aufnahmewerkzeugs (zum Beispiel `P0/stelle-anlagenmechaniker__d1440-light__02.webp`, untere Hälfte). Daraus ist kein Befund abgeleitet.

## 2 Quellen

- Aufträge und Regeln:
  - `_relaunch/ausbau/AUFTRAG.md`, §1, §3, §6, §8 A-01…A-05, §9
  - `_relaunch/ENTSCHEIDUNGEN.md` E-015…E-020
  - `_relaunch/KERN.md` K-002, K-011, K-012, K-014
  - `_relaunch/ABNAHME.md`, Z und A
- Erster Bildschirm: `EB/start/*`, `EB/stelle/*` samt `bericht.json` (erstellt 09.10.2026, 15:44–15:45 UTC).
- Ganze Seiten:
  - `A0/start__m390-{light,dark}__01…14`, `A0/start__m430-*__01…13`
  - `A0/stelle-anlagenmechaniker__m390-*__01…10`, `…__m430-*__01…09`
  - `A0/stellen__*`
  - `P0/*` (12 Seiten, 375/768/1440/1920)
- Jury P0:
  - `_relaunch/belege/p0-jury/zusammenfassung.md`
  - `JU/start-1…3.json`, `JU/stelle-anlagenmechaniker-1…3.json`
  - `JU/stellen-*.json`, `JU/bewerbung-*.json`
- Kacheln:
  - `RI/ergebnisse-runde1-2.json` (`jury-{a,b,c}-r1-{1,2}`, `pruefen-{a,b,c}`, `ueberarbeiten-{a,b}`, `bauen-b`)
  - `RI/b/BEGRUENDUNG.md`
  - `RI/a/fotos/d1440-light-voll__01.webp`, `RI/b/fotos/m375-light-voll__01.webp`
  - `AG`
  - B Runde 1 als Quelltext: `git show 2035339:_relaunch/richtungen/b/index.html`, nur gelesen
- Wow-Probe (Ausgangswert, 5 Haiku-Erstbetrachter, erster Bildschirm 0–1,5 s, hell):
  - `_relaunch/MESSUNGEN.md`, Abschnitt „Wow-Probe – Ausgangswert“
  - `_relaunch/ausbau/belege/a0-wow/ergebnis.json` (`WOW`)
- Gegenprüfung: `_relaunch/ausbau/belege/a1-gegenpruefung.json` (A1-GEGEN-01, 12 Korrekturen, eingearbeitet in §8)
- Messungen:
  - `_relaunch/MESSUNGEN.md` (Lighthouse, Slop, axe, Größen)
  - `_relaunch/belege/p0-slop-weich/slop-weich.md`
  - `_relaunch/VERLUSTLISTE.md`
- Code, nur gelesen:
  - `components/home/Hero.tsx`, `components/home/content.ts`, `components/site/{MobileNav,nav}.ts(x)`
  - `components/maps/RegionExplorer.tsx`, `components/brand/Logo.tsx`
  - `app/styles/theme.css`, `app/globals.css`, `app/layout.tsx` (`theme-color`, `min-h-dvh`)
  - `lib/content/facts.ts`, `lib/data/*`, `lib/jobs/data/*`

## 3 Lagebild je Schwerpunktseite

### 3.1 Startseite `/`

**Erster Bildschirm mobil (390 × 844)** · `EB/start/m390-light-voll__t1500.webp`

- **Erstes Bild und Auftakt:**
  - Das erste Bild kommt nach 226 ms. Von 250 bis 1.500 ms bleibt das Bild unverändert (alle Dateien 37.824 B).
  - Es gibt keinen Auftakt, keine Bewegung und kein `data-motion` im ausgelieferten HTML (0 Treffer).
- **Komposition:**
  - Oben ein weißer Kopf mit Logo und Menüsymbol (y 0–115).
  - Darunter eine kühlgraue Fläche #F5F6F8 mit kleiner Ortsmarke (y 215–245).
  - Die H1 läuft über 6 Zeilen bei etwa 40 px (y 290–770). Die Zeilen 3–6 „Ehrliches Handwerk. Pünktlich Feierabend.“ stehen in Grau #5F6878.
  - Es folgen der Einleitungstext (y 820–1010), die rote Pille „Jetzt bewerben“ (y 1065–1175, Daumenzone), der Textlink „Offene Stellen ansehen ↓“ (y 1215–1255) und die Mikrozeile „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“ in etwa 13 px Grau (y 1310–1340).
  - Nach einer Haarlinie stehen 13:30 und 30 am unteren Rand (y 1520–1635). 35 km und 1926 erscheinen erst im zweiten Bildschirm (`A0/start__m390-light__02.webp`, oberes Achtel).
  - Der Textlink steht damit **zwischen** Knopf und 60-Sekunden-Zusage. Bei 375 ist es genauso (`P0/start__m375-light__01.webp`, Knopf y 1062–1172, Textlink y 1215–1255, Zusage y 1305–1335). Bei 768 steht der Textlink neben dem Knopf und die Zusage direkt darunter (`P0/start__t768-light__01.webp` y ≈ 957). Die Trennung gibt es also nur mobil (L-04).
- **Dominante Geste:** keine. Es gibt kein Bild, kein SVG und keine Schrift in Bildgröße.
- **Nächster Schritt:** klar, eine rote Hauptaktion; die mitlaufende Leiste bleibt verborgen, solange der Knopf sichtbar ist (`components/site/nav.ts`, `PRIMARY_CTA_ATTR`).
- **430 × 932:** dieselbe Komposition, nur anders umgebrochen. Die H1 hat 5 Zeilen, alle vier Kennzahlen sind sichtbar (`A0/start__m430-light__01.webp`). Mobil ist abgeleitet, nicht eigens komponiert (§3.5).
- **Tablett 768 × 1024** (`P0/start__t768-light__01.webp`): Die Mobil-Komposition ist nur gestreckt. Die H1 steht in 3 Zeilen (Zeilenabstand ~54 px, also rund 7 vw), deutlich unter Bildgröße. Rechts neben H1 und Einleitung bleibt gut ein Viertel der Breite leer (x ≈ 1100–1440, y 270–760). Die Kennzahlen stehen 2 × 2 (y 1140–1460) (L-01).
- **Dunkel** (`EB/start/m390-dark-voll__t1500.webp`):
  - Generisches Schiefer-Dunkel #0B0F17.
  - Das Logo ist per CSS-Filter zur weißen Silhouette gemacht (`components/brand/Logo.tsx:35`).
  - Öffnet das PUBLIKUM die Seite zuerst auf dem eigenen Handy mit Dunkelmodus, ist dieses Bild der erste Eindruck (`EB/start/m390-dark-voll__streifen.webp`). Die Wow-Probe ist dafür nicht gemessen (L-18).

**Erster Bildschirm Desktop (1440 × 900)** · `EB/start/d1440-light-voll__t1500.webp`

- **Erstes Bild und Auftakt:**
  - Die Bilder bei 0 und 250 ms sind weiß (2.396 B). Inhalt erscheint ab 412–575 ms (lokal, ungedrosselt) und steht danach still.
  - Lighthouse mobil: LCP 2,92 s (über Budget 2,5 s). Das LCP-Element ist die H1 (`_relaunch/MESSUNGEN.md`, Ebene 6).
- **Komposition:**
  - Linke Spalte x 176–900: Ortsmarke (y 155), H1 in drei Zeilen zu etwa 70 px (y 185–405), Einleitung (y 425–510), Knopf und Textlink (y 540–595), Mikrozeile (y 616).
  - Darunter die Kennzahlenleiste mit vier gleichen Kacheln unter einer Haarlinie (y 705–815).
  - **Die rechte Hälfte x 900–1440 und y 100–700 ist leer.**
- **Kopf:**
  - Logo bei x 80, Navigation mittig (Stellen, Vorteile, Ablauf, FAQ).
  - Telefon und eine **graue** Pille „Bewerben“ bei x 1255–1360.
  - Weichzeichner `backdrop-blur` (S-09).
- **1920 × 1080** (`P0/start__d1920-light__01.webp`, Maßstab 0,75): Die Spalte bleibt schmal. Die H1 hat etwa 72 px, also rund 3,75 vw statt bis zu 20 vw (§6). Rechts neben der H1 ist es leer (x 860–1440, y 100–520 im Bild). Kopf (x 240–1200) und Inhalt (x 312–1130) haben auch hier verschiedene Kanten (L-05).

**Einwilligung:** **Im Ausgangsstand gibt es kein Einwilligungsbanner.**
- Die einzige Einwilligung ist die Zwei-Klick-Karte (Google Maps) im Abschnitt `#einsatzgebiet`.
- Ohne Maps-Schlüssel erscheint nicht einmal ihr Knopf; lokal gibt es 0 Treffer für „Interaktive Karte laden“ (`components/maps/RegionExplorer.tsx:23`). Sichtbar ist dann nur die Radiusgrafik.
- Der erste Bildschirm ist damit in allen Ansichten bannerfrei. Wow-Probe und Bildfolgen der A-03-Messung laufen deshalb ohne Banner.

**Austauschprobe Startseite** (17 Elemente)

| # | Element | Beleg | Inhalt eigen? | Form eigen? | Ergebnis |
|---|---|---|---|---|---|
| 1 | Kopfleiste: Logo, 4 Anker, Telefon, graue „Bewerben“-Pille, Glas | `EB/start/d1440-light-voll__t1500.webp` y 0–65 | nur Logo und Nummer | nein (Standardkopf, S-09) | fällt durch |
| 2 | Ortsmarke „Seit 1926 · Wetzlar“ | `EB/start/m390-light-voll__t1500.webp` y 215–245 | ja (founded1926) | nein (kleine graue Zeile) | Inhalt besteht, Form nicht |
| 3 | H1 Teil 1 „SHK-Jobs in Wetzlar.“ | ebd. y 290–440 | nur der Ort (Jury C R1: „austauschbar“) | nein (Inter fett) | fällt durch |
| 4 | H1 Teil 2 „Ehrliches Handwerk. Pünktlich Feierabend.“ | ebd. y 450–770 | „Pünktlich Feierabend“ belegt (friday1330), „Ehrliches Handwerk“ allgemein (Jury B R1) | nein (Grau wie deaktiviert) | halb |
| 5 | Einleitung (Wärmepumpen, Heizungen, Bäder, über Tarif, Hilti) | ebd. y 820–1010 | ja (aboveTariff, hilti) | nein | Inhalt besteht |
| 6 | Hauptaktion, Textlink, 60-Sekunden-Zeile | ebd. y 1065–1340 | ja, selten (apply60s, noCvNeeded) | nein (rote Pille, Fußnote) | Inhalt stark, Form generisch |
| 7 | Kennzahlenleiste 13:30 · 30 · 35 km · 1926 | `EB/start/d1440-light-voll__t1500.webp` y 705–815 | ja, alle belegt | nein (4 gleiche Kacheln, Vorlagenmuster) | Inhalt besteht, Form fällt durch |
| 8 | „Offene Stellen“: 4 graue Karten mit Gehaltsspanne | `A0/start__m390-light__02–03.webp` | Gehaltsspannen offen (selten) | nein (Kartenraster) | halb |
| 9 | „Das bekommst du“: 8 Icon-Karten | `A0/start__m390-light__04–06.webp`; `P0/start__d1440-light__03.webp` | ja | nein (S-11 gezählt) | fällt durch |
| 10 | „35 km um Wetzlar. Keine Fernmontage.“, Radiusgrafik, Ortswahl, Tabelle | `A0/start__m390-light__06–08.webp`; `P0/start__d1440-light__04.webp` | ja: 10 echte Orte mit km und Minuten | ansatzweise (grauer Kreis, 6 von 10 Punkten unbeschriftet, Kern überfüllt, klein; mobil brechen die Tabellenwerte um) | stärkster Kandidat, unterinszeniert |
| 11 | Meilenstein-Absatz (Umzug 2026, 15 Leute) | `A0/start__m390-light__08.webp` obere Hälfte | ja (companyData.milestone2026, employees15) | Fußnotengröße | Inhalt besteht, Form versteckt |
| 12 | „In 3 Schritten zu deinem neuen Job“ | `A0/start__m390-light__08–09.webp` | Diskretion belegt | nein (Nummernliste mit Chips) | fällt durch |
| 13 | „15 Leute. Ein Meisterbetrieb. Seit 1926.“, Zitat Sabri Demir, 5 Partner-Säulen | `A0/start__m390-light__10–11.webp` | ja, echtes Zitat | nein (Initialenkreis „SD“, blasse Liste) | halb |
| 14 | „Stimmen von Kunden und Team“ (Karussell, Filterchips, Sterne) | `A0/start__m390-light__11–12.webp` | echt (`lib/data/reviews.data.ts`, `team.ts`) | nein (Standardkarussell) | Inhalt besteht |
| 15 | Häufige Fragen | `A0/start__m390-light__12.webp` | ja | Akkordeon, als Werkzeug angemessen | neutral |
| 16 | Schlussband „Bewirb dich bei uns.“ | `A0/start__m390-light__13.webp` oben | quickResponse | nein (Navy-Band, weißer Knopf) | fällt durch |
| 17 | Fuß | `A0/start__m390-light__13–14.webp` | Pflichtangaben | Standard | neutral |

**Befund:** Der Inhalt besteht in 12 von 17 Elementen, die Form in keinem. Die Startseite hat eigene Fakten, aber keine eigene Gestalt.

**Jury-Schwächen P0 Startseite** (`JU/start-1…3`, Mediane: Design 4,5 · Bedienbarkeit 6,5 · Kreativität 4,0 · Inhalt 6,5 · gewichtet **5,2**)
- Kein Bildmaterial, „Hero rechts leer“, anonym (3/3).
- Vorlagenmuster: gleiche Karten, blasser Grautext, Logofarben fehlen (3/3).
- Die Leitidee „Pünktlich Feierabend“ ist nur Text; die Radiuskarte ist klein und steht weit unten (3/3).
- Fahrzeiten brechen mobil um (2/3: `JU/start-1` „Fahrzeit-Spalte bricht mobil um“, `JU/start-2` „Fahrzeiten brechen um“). Belegt bei 375: „10 Min.“, „18 Min.“, „16 Min.“ und „22 Min.“ stehen zweizeilig (`P0/start__m375-light__08.webp` y 455–940), die PLZ von „Wetzlar Kernstadt“ rutscht unter den Namen (`P0/start__m375-light__07.webp` y 1475–1550) (L-12).
- Mobil gleichförmig, Sekundärtext blass und klein, Karten im Dunkelmodus flach, „SD“-Initialen, Partner als blasse Textliste.

**Abstand zur Stufe 9 (Startseite)**

| Kategorie | P0 (Median) | A-01-Schwelle | Abstand |
|---|---|---|---|
| Design (40 %) | 4,5 | ≥ 9,0 | +4,5 |
| Bedienbarkeit (30 %) | 6,5 | ≥ 8,5 | +2,0 |
| Kreativität (20 %) | 4,0 | ≥ 9,0 | **+5,0** |
| Inhalt (10 %) | 6,5 | ≥ 8,5 | +2,0 |
| gewichtet | 5,2 | ≥ 9,0 (A-02-Zwischenziel ≥ 7,6) | +3,8 |

Qualitativ, gemessen an „überrascht und mühelos“:
- **Überraschung:** keine. Es gibt kein Bild, keinen Moment und kein konkretes Merkmal außer Zahlen im Text.
- **Mühelos:** teilweise. Die Seite ist schnell (CLS 0, TBT 80–108 ms) und hat eine klare Aktion. Sie *fühlt* sich aber nicht mühelos an: Der Seitenwechsel ist ein harter Schnitt, nichts reagiert körperlich.
- **Erinnerbar:** nur „13:30“ als Zahl. Die Erstbetrachter bestätigen das (siehe unten).

**Wow-Ausgangswert Startseite, gemessen** (`_relaunch/MESSUNGEN.md`, „Wow-Probe – Ausgangswert“; `WOW` S1, S2; 5 Erstbetrachter je Ansicht, erster Bildschirm 0–1,5 s, hell):

| Ansicht | Überraschung | Begehrlichkeit | Median Ü/B | A-03-Schwelle | Abstand | Vertrauen = Untergrenze nach A-03 |
|---|---|---|---|---|---|---|
| m390 | 5 | 6 | 5,5 | ≥ 8,5 | **+3,0** | 6 |
| d1440 | 4 | 6 | 5,0 | ≥ 8,5 | **+3,5** | 7 |

- **Konkretes Merkmal:**
  - m390: 3 von 5 nennen „13:30 Freitags Feierabend“; je einer nennt die 60-Sekunden-Zeile und „Pünktlich Feierabend.“ als graue H1-Zeile.
  - d1440: 5 von 5 nennen die Zahlenreihe 13:30 · 30 · 35 km · 1926 bzw. 13:30 darin.
  - S2-2: „wobei 35 km und 1926 auf dem Handy im ersten Bildschirm fehlen“.
- **Angebot in einem Satz:** in allen 10 Urteilen richtig wiedergegeben. Das ist eine Stärke, die bleiben muss (§6 Nr. 1).
- **Engpass:** Überraschung (4–5).
- **Einordnung:** Auf dem Wow-Anker entspricht das „5 – solide Firmenseite“, jetzt gemessen statt geschätzt.

### 3.2 Stellenseite `/jobs/anlagenmechaniker-shk-wetzlar`

**Erster Bildschirm mobil (390 × 844)** · `EB/stelle/m390-light-voll__t1500.webp`

- **Erstes Bild:** nach 241 ms. Bei 250 ms fehlt die Bewerbenleiste noch; ab etwa 471 ms liegt sie über dem Text (`EB/stelle/m390-light-voll__t0250.webp` gegen `__t0500.webp`, y 1535–1688). Danach steht das Bild still.
- **Komposition:**
  - Brotkrume in einer Zeile (y 205–240), H1 in 2 Zeilen zu etwa 30 px (y 320–450): „Anlagenmechaniker / SHK (m/w/d) in Wetzlar“.
  - Drei graue Chips „Vollzeit · Wetzlar + 35 km · Unbefristet“ (y 495–545).
  - Graue Gehaltsbox „3.600–4.600 € Gehalt pro Monat“ (y 595–805).
  - Einleitung mit fünf Herstellern und 35 km (y 860–1275), danach „Das erwartet dich“.
  - Die Leiste unten trägt „Jetzt bewerben“ und ein Chat-Symbol ohne sichtbare Beschriftung.
- **Dominante Geste:** keine. Es ist das Muster einer Stellenbörse.
- **Stärke:** Die Gehaltsspanne steht im ersten Bildschirm.
- **430:** dieselbe Komposition (`A0/stelle-anlagenmechaniker__m430-light__01.webp`).
- **375** (`P0/stelle-anlagenmechaniker__m375-light__01.webp`):
  - Die Brotkrume bricht auf zwei Zeilen um: „Startseite › Stellen“ / „› Anlagenmechaniker SHK“ (y ≈ 195–310).
  - Die H1 hat 3 Zeilen (y ≈ 360–560), die Gehaltsbox rutscht nach y ≈ 700–915.
  - Die Einleitung füllt den Rest bis knapp über die Bewerbenleiste (Text bis y ≈ 1415, Leiste ab y ≈ 1470). „Das erwartet dich“ fällt aus dem ersten Bildschirm (L-40).
- **Tablett 768** (`P0/stelle-anlagenmechaniker__t768-light__01.webp`): dieselbe Komposition, nur gestreckt. Die graue Gehaltsbox zieht sich über die volle Breite (x 56–1383, y 590–810), ohne Kontakt; Sabri Demir fehlt im ersten Bildschirm. Die Leiste unten heißt „Als Anlagenmechaniker SHK bewerben“ (L-19).

**Erster Bildschirm Desktop (1440 × 900)** · `EB/stelle/d1440-light-voll__t1500.webp`

- **Erstes Bild:** Inhalt ab 489 ms, die Bilder bei 0 und 250 ms sind weiß. Lighthouse mobil: LCP 3,08 s.
- **Linke Spalte x 176–800:** Brotkrume, H1 in 2 Zeilen zu etwa 50 px (y 180–290), Chips, Einleitung, danach Listen.
- **Rechte Spalte x 935–1265:**
  - Gehaltskarte mit rotem „Jetzt bewerben“ (y 113–310).
  - Karte „Dein Ansprechpartner Sabri Demir“ mit Anrufen, WhatsApp, E-Mail und Öffnungszeiten (y 330–690).
  - **Darunter ist es leer.** Die Spalte läuft nicht mit.
- **Raster:** Kopf x 80–1360, Inhalt x 176–1265, also uneinheitlich (`JU/stelle-anlagenmechaniker-2`).
- **1920** (`P0/stelle-anlagenmechaniker__d1920-light__01.webp`, Maßstab 0,75): dieselbe Komposition in schmaler Mitte. Außen bleibt je etwa ein Fünftel der Breite leer. Die Seitenleiste (x 880–1128) endet bei y ≈ 520, darunter ist es leer. Die H1 hat 2 Zeilen zu etwa 50 px (L-21).

**Einwilligung:** keine. Es gibt kein Banner und keine Karte auf der Stellenseite (0 Treffer für „Fahrzeit“ und „einsatzgebiet“ im HTML).

**Austauschprobe Stellenseite** (16 Elemente)

| # | Element | Beleg | Inhalt eigen? | Form eigen? | Ergebnis |
|---|---|---|---|---|---|
| 1 | Kopfleiste (wie Start) | `EB/stelle/d1440-light-voll__t1500.webp` y 0–65 | – | nein | fällt durch |
| 2 | Brotkrume | `EB/stelle/m390-light-voll__t1500.webp` y 205–240 | – | Standard; bricht schon auf der Schwerpunkt-Stelle bei 375 auf zwei Zeilen um (`P0/stelle-anlagenmechaniker__m375-light__01.webp` y ≈ 195–310), nicht erst bei langen Titeln (ebenso `P0/stelle-obermonteur__m375-light__01.webp`, y 200–300) | neutral als Werkzeug, mobil mangelhaft (L-40) |
| 3 | H1 und Chips | ebd. y 320–545 | Titel und Ort | nein (Stellenbörsen-Muster) | fällt durch |
| 4 | Gehaltskarte 3.600–4.600 € | ebd. y 595–805; Desktop x 935–1265, y 113–310 | ja, offene Spanne (K-014) | nein (graue Box) | Inhalt stark, Form generisch |
| 5 | Einleitung (Buderus, Bosch, NIBE, Alpha Innotec, Viessmann, 35 km) | ebd. y 860–1275 | ja (heatPumpBrands, radius35) | Fließtext | Inhalt besteht |
| 6 | Drei Punktlisten in Folge | `A0/stelle-anlagenmechaniker__m390-light__01–03.webp` | ja | nein (S-12 gezählt, `components/jobs/JobSections.tsx:58–72`) | fällt durch |
| 7 | „Dein Paket“ (Fahrzeug, Werkzeug, Vergütung) | `A0/…__m390-light__03.webp` Mitte | sehr eigen (Sortimo, Hilti-22-V, Pressbacken Viega/Geberit) | blasse Tabelle | Inhalt stark, Form versteckt |
| 8 | „Auf einen Blick“ (Gehalt, Anstellung, Start, Einsatzort) | `A0/…__m390-light__03–04.webp` | Doppelung (Gehalt zum dritten Mal) | Tabelle | fällt durch |
| 9 | „Aus dem Team“: Zitat Alexander Koch | `A0/…__m390-light__04.webp` untere Hälfte | echt, nennt 13:30 und Hilti | nein (Initialenkreis „AK“, graue Box) | halb |
| 10 | „In 3 Schritten“ (gleiche Komponente wie auf der Startseite) | `A0/…__m390-light__05.webp` oben | – | Wiederholung | fällt durch |
| 11 | Eingebetteter Fluss (Schritt 1 von 3, Stelle vorgewählt) | `A0/…__m390-light__05–06.webp` | Funktion eigen | Standard-Radioliste, dünner Balken | Funktion stark, Form generisch |
| 12 | „Lieber direkt sprechen?“ | `A0/…__m390-light__06.webp` unten | ja (Sabri Demir) | Liste | Inhalt besteht |
| 13 | Häufige Fragen (3) | `A0/…__m390-light__07.webp` | ja | Akkordeon | neutral |
| 14 | „Weitere Stellen“ (3 Karten) | `A0/…__m390-light__07–08.webp` | Gehaltsspannen | Kartenraster | halb |
| 15 | Desktop-Seitenleiste | `EB/stelle/d1440-light-voll__t1500.webp` x 935–1265 | ja | zwei graue Karten, nicht mitlaufend | halb |
| 16 | Mobile Bewerbenleiste mit Chat-Symbol | `EB/stelle/m390-light-voll__t1500.webp` y 1535–1688 | – | Standard, rutscht nach | fällt durch |

**Befund:** Der Inhalt ist konkreter als auf der Startseite: Gehalt, Hersteller, Werkzeug und Fahrzeug. Die Form ist durchgehend die einer Stellenbörse. Der Fluss, das stärkste Werkzeug, kommt bei 390 erst im 5. von 10 Bildschirmen.

**Jury-Schwächen P0 Stellenseite** (`JU/stelle-anlagenmechaniker-1…3`, Mediane: Design 4,5 · Bedienbarkeit 6,5 · Kreativität 3,0 · Inhalt 6,5 · gewichtet **5,0**)
- Austauschbare Optik, keine Leitidee, Logofarben nicht fortgeführt. Alle drei schlagen ein SVG-Motiv vor: Rohrleitung oder Heizkreis mit Rot und Blau (3/3).
- Die Desktop-Seitenleiste läuft nicht mit, darunter ist die rechte Spalte leer; der Fluss kommt spät (3/3).
- Flache Hierarchie, Gehalt dreifach, blasse Tabellenwerte, „Dein Paket“ blass wie Fußnoten (3/3).
- Die Brotkrume bricht mobil um (3/3: „Brotkrume bricht mobil (um)“ bzw. „Brotkrume bricht“; belegt bei 375, L-40).
- Chat-Knopf ohne Beschriftung, doppelter WhatsApp-Link, uneinheitliches Raster.

**Abstand zur Stufe 9 (Stellenseite)**

| Kategorie | P0 (Median) | A-01-Schwelle | Abstand |
|---|---|---|---|
| Design (40 %) | 4,5 | ≥ 9,0 | +4,5 |
| Bedienbarkeit (30 %) | 6,5 | ≥ 8,5 | +2,0 |
| Kreativität (20 %) | 3,0 | ≥ 9,0 | **+6,0** |
| Inhalt (10 %) | 6,5 | ≥ 8,5 | +2,0 |
| gewichtet | 5,0 | ≥ 9,0 (A-02-Zwischenziel ≥ 7,5) | +4,0 |

Qualitativ: Die Stellenseite ist die schwächere Erzählseite. Sie wiederholt Bausteine der Startseite („In 3 Schritten“, Kartenraster), legt also beim Klick nichts drauf (§3.2). Sie hat weder Hauptmoment noch Leitfaden-Anschluss.

**Wow-Ausgangswert Stellenseite, gemessen** (`_relaunch/MESSUNGEN.md`, „Wow-Probe – Ausgangswert“; `WOW` S3, S4; hell):

| Ansicht | Überraschung | Begehrlichkeit | Median Ü/B | A-03-Schwelle | Abstand | Vertrauen = Untergrenze nach A-03 |
|---|---|---|---|---|---|---|
| m390 | 3 | 5 | 4,0 | ≥ 8,5 | **+4,5** | 6 |
| d1440 | 3 | 5 | 4,0 | ≥ 8,5 | **+4,5** | 7 |

- **Konkretes Merkmal:**
  - m390: 4 von 5 nennen den Gehaltskasten. 3 von 5 erwähnen die rote Leiste unten, zwei davon ausdrücklich ihr Nachrutschen („ab 500 ms sichtbar“, „ab dem zweiten Bild“) (L-20).
  - d1440: 3 von 5 nennen die Kontaktkarte mit Ansprechpartner als Vertrauensanker (S4-1: „da weiß ich, wen ich anrufe“), 2 von 5 das Gehalt mit dem Knopf. S4-2 bemerkt die Ladezeit: „nur kam es erst nach einer halben Sekunde“ (L-06).
- **Wow-Abstand:** Die Stellenseite hat den größeren Abstand (+4,5 gegen +3,0 und +3,5 auf der Startseite). Das stützt „hoch“ für L-19, L-21 und L-40.

### 3.3 Lehren aus den Stilkacheln (Runde 1 und 2)

Die Kacheln sind nur ein erster Bildschirm samt Stilblatt der Startseite. Ihre Werte sind deshalb nur bedingt mit der Plattform vergleichbar.

Werte Runde 1:
- A: 7,6 und 7,7
- B: 7,7 und 7,7
- C: 7,8 und 7,9
- Kreativität 8,0–8,6, Bedienbarkeit 7,3–7,6, Inhalt 6,7–7,5

**Auch die beste Kachel liegt 1,1–1,4 Punkte unter der Stufe 9, und keine erfüllt „keine Kategorie unter 8,5“.**

Wiederkehrende Schwächen aus `RI/ergebnisse-runde1-2.json`:
1. **Kein Bildmaterial, keine Menschen.** So in 6 von 6 Urteilen. Fotos sind durch die Inhaberentscheidung ausgeschlossen (K-014, A-G4); die Frage nach echten Fotos bleibt als N-16 offen.
2. **Mikrobeschriftungen 11–12 px und blass.** So in 6 von 6 Urteilen.
3. **Interne Navigation** („System“, „PLAN“, „Gestaltungssystem“). So in 6 von 6 Urteilen.
4. **Mobil liegt die Szene unter dem Falz** (B R1). In B R2 ist das behoben (`RI/b/fotos/m375-light-voll__01.webp`).
5. **Kartenmitte überfüllt, Leader-Linien kreuzen sich** (A, C).
6. **Logo im Dunkelmodus auf weißer Platte** (A) bzw. auf Plakette (B R2).
7. **B R1 nutzt Rot mehrfach** neben dem Knopf (Klammer, Wärmewellen, Trenner, Ortspunkt) – harter Befund in `pruefen-b`. Nach E-016 ist Rot als dünne Vorlauf-Leitung jetzt erlaubt, als Fläche aber nur am Knopf.
8. **Das Wärmepumpenschema von B R1 besteht die Austauschprobe nicht allein** (`ueberarbeiten-b`, BEGRUENDUNG §3). Es trägt erst durch 13:30, 35 km und 1926 an der Zeichnung.
9. **A animiert Farbe und Strichstärke** statt nur transform und opacity; die Verzögerungen liegen außerhalb der Tokens (`pruefen-a`).
10. **Bricolage mit zu enger Laufweite** (Bindestrich in „SHK-Jobs“); Atkinson setzt die Null mit Schrägstrich (B R1).

## 4 Lückenliste

Format der Spalte „Lücke“: was fehlt oder stört, mit Beleg als Datei und Bereich.

| ID | Seite | Bereich | Lücke (konkret, mit Bildbeleg) | Priorität | Bezug | Richtung der Lösung (E-019) |
|---|---|---|---|---|---|---|
| L-01 | `/` | erster Bildschirm mobil und Tablett | Keine dominante Geste: nur Text auf kühlgrauer Fläche. Die H1 läuft über 6 Zeilen zu ~40 px, davon 4 in Grau #5F6878 (`EB/start/m390-light-voll__t1500.webp` y 290–770). Bei 430 dieselbe Komposition, nur umgebrochen (`A0/start__m430-light__01.webp`). Bei 768 ist die Mobil-Komposition nur gestreckt: H1 in 3 Zeilen deutlich unter Bildgröße, rechts gut ein Viertel leer, Kennzahlen 2 × 2 (`P0/start__t768-light__01.webp` x ≈ 1100–1440, y 270–760). Mobil ist abgeleitet, nicht inszeniert (§3.5, §6 „Erster Augenblick“). Wow m390: Median Ü/B 5,5, Abstand zu A-03 +3,0, Vertrauen 6 als Untergrenze (`WOW` S1). | hoch | A-03, A-01, A-02 | Eigene Mobil-Komposition aus B R1: Giebelhaus des Logos mit Uhr im Giebel und rot-blauem Leitungspaar auf warmem Papier. Haus, Uhr und 13:30 passen in den ersten Bildschirm; B R2 belegt das bei 375 × 812 (`RI/b/fotos/m375-light-voll__01.webp`). „SHK-Jobs in Wetzlar.“ als Display-Zeile in Bildgröße, geprüft am längsten Wort. 768 eigens komponiert, nicht als gestreckte Mobil-Fassung; geprüft je Ansicht für A-02. |
| L-02 | `/` | erster Bildschirm mobil und Desktop | Kein Auftakt: Die Bilder von 250 bzw. 500 bis 1.500 ms sind identisch (37.824 B mobil, 36.524 B Desktop, `EB/start/bericht.json`). Im HTML gibt es kein `data-motion`. | hoch | A-03, A-04, Z-09 | Auftakt in höchstens 1,5 s mit Inhalt ab dem ersten Bild (S-07): Die Vorlauf-Leitung wird bis in den Knopf verlegt (A), der Uhrzeiger rastet auf 13:30 ein (B R2). Die ruhige Fassung zeigt denselben Endzustand. |
| L-03 | `/` | erster Bildschirm mobil | Die Kernversprechen sind nur Zahlen am Rand: 13:30 und 30 bei y 1520–1635, 35 km und 1926 erst im zweiten Bildschirm (`A0/start__m390-light__02.webp`, oberes Achtel). Jury 3/3: „Leitidee ‚Pünktlich Feierabend' nur Text“. Die Erstbetrachter bestätigen das: 13:30 ist das tragende Merkmal (m390: 3 von 5; d1440: 5 von 5 nennen die Zahlenreihe bzw. 13:30). S2-2: „wobei 35 km und 1926 auf dem Handy im ersten Bildschirm fehlen“ (`WOW` S1, S2). | hoch | A-03, A-01 | Maßkette nach A, angebunden an die Zeichnung nach B: 13:30 · 30 Tage · 35 km · 1926 als Bemaßung am Haus (vgl. `AG`: Kennzahlen an Uhr, Wegweiser und Hauswand). Mobil gestaffelt statt im Viererraster. Werte nur aus friday1330, vacation30, radius35, founded1926. |
| L-04 | `/` | erster Bildschirm, Hauptaktion | Die Hauptaktion ist eine generische rote Pille in Crimson #C51E1E statt Signalrot #D60000 (E-016). Die stärkste Zusage „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“ steht als ~13-px-Fußnote da (`EB/start/m390-light-voll__t1500.webp` y 1310–1340; `EB/start/d1440-light-voll__t1500.webp` y 616). Mobil ist sie zudem vom Knopf getrennt: Zwischen Knopf (y 1065–1175) und Zusage steht der Textlink „Offene Stellen ansehen ↓“ (y 1215–1255; ebenso bei 375, `P0/start__m375-light__01.webp`). Bei 768 und 1440 steht der Textlink neben dem Knopf (`P0/start__t768-light__01.webp`). | hoch | A-03, A-01, Z-04 | Knopf in #D60000 als Endpunkt der Vorlauf-Leitung (A, „Leitung endet im Knopf“). Die 60-Sekunden-Zusage steht in Lesegröße direkt am Knopf (`AG` links unten), auch mobil; der Textlink steht nie zwischen Knopf und Zusage. |
| L-05 | `/` | erster Bildschirm Desktop (1440 und 1920) | Die rechte Hälfte ist leer (`EB/start/d1440-light-voll__t1500.webp` x 900–1440, y 100–700). Die H1 hat ~70 px, weit unter Bildgröße (§6: bis etwa 20 vw). Bei 1920 bleibt die Spalte schmal, die H1 hat ~72 px (rund 3,75 vw), rechts daneben ist es leer (`P0/start__d1920-light__01.webp` x 860–1440, y 100–520). Jury 3/3: „Hero rechts leer“. Wow d1440: Median Ü/B 5,0, Abstand zu A-03 +3,5, Überraschung 4, Vertrauen 7 als Untergrenze (`WOW` S2). | hoch | A-03, A-01, A-02 | Rechts die Szene aus B R1 wie in `AG`: Haus, Wärmepumpe, roter Vorlauf, blauer Rücklauf, Uhr 13:30, Wegweiser „Wetzlar“. Dazu die Präzision von A: Maßkette und Arbeitszeit-Diagramm Mo–Do 07:00–16:45 / Fr 07:00–13:30 aus workingHours (`RI/a/fotos/d1440-light-voll__01.webp` rechts). Links die H1 in Bildgröße. Bei 1920 wächst die Komposition mit, statt in einer festen Spalte zu stehen; geprüft je Ansicht für A-02. |
| L-06 | `/`, Stelle | erster Bildschirm Desktop, Leistung | Bis ~0,4 s weiße Bilder (`EB/*/d1440-light-voll__t0000/t0250.webp`, 2.396 B). LCP mobil 2,92 s auf Start und 3,08 s auf der Stelle, Element jeweils die H1 (über 2,5 s). Eine neue Display-Schrift in Bildgröße verschärft das Risiko. Der Erstbetrachter S4-2 bemerkt die Verzögerung: „nur kam es erst nach einer halben Sekunde“ (`WOW` S4). Für A-06 ist keine AUSNAHME zulässig (AUFTRAG §8). | hoch | A-03, A-06, Z-12 | **Voraussetzung jeder Lösung im ersten Bildschirm** (L-01…L-05, L-19…L-21, L-40): LCP-Reserve ≤ 2,2 s nach jeder Welle messen. Display-Schrift vorladen, Ersatzschrift mit gemessenen Metrik-Overrides (so in B: size-adjust, ascent-override). Szene als Inline-SVG im ersten HTML; nichts für den ersten Bildschirm nachladen (N-14). |
| L-07 | `/`, Stelle | Kopfleiste | Standardkopf mit Weichzeichner (S-09 auf 12 Seiten, `components/site/HeaderBar.tsx:55–61`) und grauer „Bewerben“-Pille. Im Dunkelmodus wird das Logo per CSS-Filter umgefärbt (`EB/start/d1440-dark-voll__t1500.webp` x 80–300, y 10–55; `components/brand/Logo.tsx:35`, S-14 als Grenzfall). Der Kopf rahmt jeden ersten Bildschirm beider Seiten in allen Ansichten und trägt das Logo als ersten Markenkontakt; nach §1 Nr. 7 ist das „hoch“. | hoch | A-01, A-03, Z-07 | Kopf auf Papier ohne Glas. Das Logo bleibt unverändert (UNANTASTBAR); dunkel steht es auf heller Plakette (B R2), oder das Kopfband trägt Marken-Navy #111D6D (B §6) – Entscheidung am Freigabepunkt. Die Kopfaktion bleibt textlich in Navy, damit Rot einzig bleibt (Jury A R1). |
| L-08 | alle | Farbe | Die Logofarben fehlen: Die Tokens sind Navy #0A1E3A und Crimson #C51E1E (`app/styles/theme.css:32–33, 146–151`), die Fläche ist kühles Grau #F5F6F8, das Dunkel ist Schiefer #0B0F17. Jury: „Logo-Farben fehlen“ (`JU/start-1`). | hoch | A-01, A-03 | Palette nach E-016 mit warmem Papier #FBF7F0 (B). Marken-Navy #111D6D für Tinte und Maße. Signalrot #D60000 nur für Knopf und Vorlauf-Leitung, Rücklauf #1F57C4. Das Dunkel aus derselben Familie (B: Nachtblau #0A1033). |
| L-09 | alle | Typografie | Inter ist die einzige Schrift (S-08-Grenzfall auf 12 Seiten, `app/layout.tsx:16–20`). Die zweite H1-Zeile in Grau liest sich wie deaktiviert (`EB/start/m390-light-voll__t1500.webp` y 450–770). | hoch | A-01, A-03, Z-07 | Display-Schrift mit Charakter (B: Bricolage Grotesque 800) und eine Maßschrift für Zahlen (A: Martian Mono). Laufweite je Zeile austariert (Lehre B R1: Bindestrich in „SHK-Jobs“ kollidiert). Zweite H1-Zeile in einer Navy-Stufe statt in Grau. |
| L-10 | `/` | Abschnitt „Offene Stellen“ | Vier gleich graue Karten; das Gehalt steht klein unter einer Metazeile (`A0/start__m390-light__02–03.webp`; `P0/start__d1440-light__02.webp` links). | mittel | A-01, Z-07 | Stellen als Zeilen mit der Gehaltsspanne als Messwert und einem Wochenbalken daneben (B R1: Arbeitszeit der Woche; A/C: Diagramm). Jede Zeile schließt an die Leitung an (Leitfaden) und ist Ausgangspunkt des Seitenwechsels (L-30). |
| L-11 | `/` | Abschnitt „Das bekommst du“ | 8 gleichförmige Icon-Karten (S-11 gezählt, `components/home/BenefitGrid.tsx:55–67`). Mobil füllen sie drei volle Bildschirmhöhen (`A0/start__m390-light__04–06.webp`). Jury: „Acht gleich gewichtete Vorteilskarten“. | hoch | A-01, Z-07 | Gewichten statt Raster: Werkzeug (hilti), Fahrzeug (vehicle) und iPad/Smartphone (ipadSmartphone) als eigene Zeichnungen im Formsystem (§6: Illustrationen statt Icons). Der Rest als dichte Liste, mobil in höchstens etwa 1,5 Bildschirmhöhen. |
| L-12 | `/` | Abschnitt „35 km um Wetzlar“ | Der stärkste eigene Inhalt ist unterinszeniert: ein grauer Kreis, 6 von 10 Punkten unbeschriftet (beschriftet sind nur Herborn, Wetzlar, Gießen und Braunfels), der Kern überfüllt, mobil im 6.–7. von 14 Bildschirmen (`A0/start__m390-light__06–07.webp`; `P0/start__d1440-light__04.webp` links unten). Mobil brechen die Tabellenwerte um: Fahrzeiten ab „10 Min.“ zweizeilig (`P0/start__m375-light__08.webp` y 455–940), die PLZ von „Wetzlar Kernstadt“ unter den Namen (`P0/start__m375-light__07.webp` y 1475–1550). Jury: „Radiuskarte klein/weit unten“; „Fahrzeit-Spalte bricht mobil um“ bzw. „Fahrzeiten brechen um“ (2/3, `JU/start-1`, `JU/start-2`). | hoch | A-01, A-04, Z-04 | Kandidat für den Hauptmoment der Startseite: die Pendelkarte aus B R1 mit Umschalter 15/25/35 km und Hin- und Rückweg zum gewählten Ort. Dazu die Präzision von A: Maßstab, Raster, entzerrte Ortslabels (Lehre A/C: Kern überfüllt). 10 Orte aus `lib/data/locations.ts`; die Tabelle ohne JavaScript bleibt. Tabelle und Ortsliste mobil ohne Umbruch der Werte, Zahlen in der Maßschrift, geprüft bei 320 und 375. |
| L-13 | `/` | Abschnitt „In 3 Schritten“ | Nummernliste mit Chips (`A0/start__m390-light__08–09.webp`), dieselbe Komponente wie auf der Stellenseite. | mittel | A-01, A-04 | Die Schritte als Abschnitte der Leitung, die im Knopf endet (A). Die Diskretionszusage (discretion) steht als eigene Zeile am Knopf. |
| L-14 | `/` | Abschnitt „15 Leute. Ein Meisterbetrieb. Seit 1926.“ | Zitatkarte mit Initialenkreis „SD“, der wie ein Platzhalter wirkt (`JU/start-3`). Die Partner stehen als blasse Liste da (`A0/start__m390-light__10–11.webp`). „100 Jahre Meisterbetrieb (1926–2026)“ fehlt auf allen Seiten (0 Treffer; Verlust E-START-002 und E-SHELL-001, beide Muss). | mittel | A-01, Z-02 | Zitat typografisch groß, ohne Ersatzgesicht. „1926–2026“ als Zeitleiste oder Maßkette (Material C: Jahresleiste) mit Ablauf: Nach dem 31.12.2026 bleibt „Gegründet 1926“ (anniversary100.validUntil). Partner-Säulen und Innung als Plakette im Formsystem (E-START-011). |
| L-15 | `/` | Abschnitt „Stimmen“ | Standardkarussell mit Filterchips und Sternen (`A0/start__m390-light__11–12.webp`). | niedrig | A-01 | Als Ruhephase nach dem Hauptmoment (§6 Rhythmus). Zitate unverändert, Form aus dem Formsystem. Keine Durchschnitts- oder Zählwerte (Bewertungsabzeichen zurückgestellt, E-START-045). |
| L-16 | `/` | Schlussband „Bewirb dich bei uns.“ | Generisches Navy-Band mit weißem Knopf (`A0/start__m390-light__13.webp` oben). Der Akt „Handlung“ (§6) ist kein gestalteter Moment. | mittel | A-04, A-01 | Die Vorlauf-Leitung endet hier im Knopf. Der Rücklauf ist die Antwort „Sabri Demir meldet sich schnellstmöglich bei dir.“ (quickResponse). |
| L-17 | `/` | ganze Seite mobil | 14 Bildschirmhöhen bei 390 im selben Takt aus Überschrift und grauen Karten. Es gibt keinen Hauptmoment und keine bewusste Ruhephase (`A0/start__m390-light__01–14.webp`). Jury: „mobil gleichförmig“ (`JU/start-3`). | hoch | A-01, A-04 | Drehbuch in vier Akten (§6): Einstieg (Haus und Uhr), Vertiefung (Stellen und Woche), Beweis (Pendelkarte, 1926–2026, Zitate), Handlung (Leitung im Knopf). Ein Hauptmoment, höchstens zwei Nebenmomente, dazwischen Ruhe. |
| L-18 | `/`, Stelle | Dunkelmodus, erster Bildschirm | Generisches Schiefer-Dunkel, die Karten flach (`JU/start-2`), das Logo als weiße Silhouette (`EB/start/m390-dark-voll__t1500.webp`; `EB/stelle/d1440-dark-voll__t1500.webp`). Das PUBLIKUM öffnet die Seite zuerst auf dem eigenen Handy. Ist dort der Dunkelmodus an, ist dieser erste Bildschirm der erste Eindruck (`EB/start/m390-dark-voll__streifen.webp`); die Generalprobe prüft ausdrücklich mit Dunkelmodus (AUFTRAG §10, CHECKLISTE). Der Wow-Ausgangswert ist aber nur hell gemessen (`_relaunch/MESSUNGEN.md`). | hoch | A-03, A-01, Z-07 | „Abend“ als eigene Komposition aus derselben Farbfamilie (B: Nachtblau, Creme-Tinte, warme Wärmefläche). Wird am Freigabepunkt gezeigt (E-016). Bildfolgen und Wow-Probe des ersten Bildschirms auch im dunklen Schema; den dunklen Ausgangswert vor der ersten Welle nachmessen (§7). |
| L-19 | Stelle | erster Bildschirm mobil und Tablett | Muster einer Stellenbörse: Brotkrume, H1 (2 Zeilen bei 390), drei graue Chips, graue Gehaltsbox, Fließtext (`EB/stelle/m390-light-voll__t1500.webp` y 200–1280). Keine Geste. Bei 768 dieselbe Komposition, gestreckt: Die graue Gehaltsbox läuft über die volle Breite, ohne Kontakt (`P0/stelle-anlagenmechaniker__t768-light__01.webp` y 590–810). Jury 3/3: „Austauschbare Optik, keine Leitidee“. Wow m390: Median Ü/B 4,0 (Überraschung 3), Abstand zu A-03 +4,5 (gleichauf mit d1440 der größte der vier Ansichten); Vertrauen 6 als Untergrenze; 4 von 5 nennen den Gehaltskasten (`WOW` S3). | hoch | A-03, A-01, A-02 | Die Gehaltsspanne als Hauptmaß in Bildgröße, bemaßt nach A (3.600–4.600 € aus `salary`). Daran die Woche Mo–Fr mit Freitag 13:30 (workingHours, friday1330) als Anschluss an das Haus der Startseite (Leitfaden). Die Werte kommen aus den Stellendaten, damit die Vorlage auch die anderen Stellen trägt (siehe §5). 768 eigens komponiert; geprüft je Ansicht für A-02. |
| L-20 | Stelle | erster Bildschirm mobil | Die Bewerbenleiste rutscht nach: Bei 250 ms fehlt sie, ab ~470 ms liegt sie über dem Text (`EB/stelle/m390-light-voll__t0250.webp` gegen `__t0500.webp`, y 1535–1688). Das Chat-Symbol hat keine sichtbare Beschriftung (`JU/stelle-anlagenmechaniker-2`). Zwei von fünf Erstbetrachtern bemerken das Nachrutschen („ab 500 ms sichtbar“, „ab dem zweiten Bild“, `WOW` S3). Bezug Vertrauen: Nach A-03 darf es nicht unter den Ausgangsstand fallen; auf der Stelle liegt es mobil bei 6 und am Desktop bei 7. Am Desktop tragen es die Kontaktkarte und Sabri Demir (3 von 5 nennen sie, `WOW` S4). Im ersten Bildschirm mobil gibt es keine benannte Person, nur das unbeschriftete Chat-Symbol. | hoch | A-03 (Vertrauen), Z-04 | Die Leiste gehört ab dem ersten Bild zur Komposition (serverseitig gerendert, Daumenzone, Abstand für sichere Bereiche). Die zweite Aktion trägt ein Wort und den Namen aus dem belegten Fakt directLine („Direkter Draht zu Sabri Demir“). Hilfe bleibt an derselben Stelle (WCAG 3.2.6). Die Leitung des Leitfadens endet im Knopf. |
| L-21 | Stelle | erster Bildschirm Desktop (1440 und 1920) | Rechts zwei graue Karten, darunter ab y ≈ 690 leer. Die Seitenleiste läuft nicht mit. Das Raster ist uneinheitlich: Kopf x 80–1360, Inhalt x 176–1265 (`EB/stelle/d1440-light-voll__t1500.webp`; `JU/stelle-anlagenmechaniker-2/-3`). Bei 1920 dasselbe in schmaler Mitte: außen je etwa ein Fünftel leer, unter der Seitenleiste ab y ≈ 520 leer (`P0/stelle-anlagenmechaniker__d1920-light__01.webp`). Wow d1440: Median Ü/B 4,0, Abstand zu A-03 +4,5. Das Vertrauen (7) trägt die Kontaktkarte mit Sabri Demir: 3 von 5 nennen sie als Merkmal (`WOW` S4). | hoch | A-01, A-03, A-02 | Eine mitlaufende Bauteil-Spalte mit Gehaltsmaß, Knopf und Sabri Demir, die bis zum Fluss mitgeht. Ein Raster für Kopf und Inhalt. Links das Hauptmaß in Bildgröße. Sabri Demir bleibt im ersten Bildschirm sichtbar (Vertrauen nicht unter 7). Bei 1920 wächst die Komposition mit; geprüft je Ansicht für A-02. |
| L-22 | Stelle | Aufgaben, Anforderungen, Vorteile | Drei Punktlisten hintereinander (S-12 gezählt, `components/jobs/JobSections.tsx:58–72`). Die Hierarchie ist flach (`A0/stelle-anlagenmechaniker__m390-light__01–03.webp`). | mittel | A-01, Z-07 | Struktur und Dichte wechseln (K-011): die drei Aufgaben als Zeichnungen im Formsystem (Wärmepumpe, Heizung, Bad aus `tasks`). Vorteile gewichtet, der Rest als Liste. |
| L-23 | Stelle | „Dein Paket“ | Die konkretesten Fakten der Seite (Sortimo-Transporter, Hilti-22-V-Flotte, Pressbacken für Viega und Geberit) stehen als blasse Tabelle da (`A0/stelle-anlagenmechaniker__m390-light__03.webp` Mitte). Jury: „blass wie Fußnoten“. | hoch | A-01, A-04 | Nebenmoment: die Ausstattung als Bauteilzeichnung mit Bemaßung nach A: Hilti-22-V-Akku-Flotte (Bohrhammer, Säbelsäge, Presszangen) und Pressbacken für Viega/Geberit; Transporter mit Sortimo-Regalsystem. Nur Gegenstände aus `packageExtras`, hilti und vehicle. Die Bemaßung trägt nur belegte Werte (22 V, Herstellernamen, „Mitnahme nach Hause möglich“), keine erfundenen Maße, Stückzahlen oder Gegenstände. |
| L-24 | Stelle | Gehalt, „Auf einen Blick“ | Das Gehalt steht dreifach: Gehaltskarte, „Vergütung“ in „Dein Paket“, „Gehalt“ in „Auf einen Blick“ (`A0/stelle-anlagenmechaniker__m390-light__03–04.webp`). Jury 2/3. | mittel | A-01 | Ein Gehaltsmaß, das mitläuft. „Auf einen Blick“ als Maßkette (Anstellung, Start, Einsatzort) statt als Tabelle. |
| L-25 | Stelle | Arbeitsweg | Auf der Stellenseite gibt es kein Werkzeug für den Arbeitsweg (0 Treffer für „Fahrzeit“), nur den Chip „Wetzlar + 35 km“. K-002 nennt für Aufgabe 2 ausdrücklich auch die Stellenseiten. | mittel | Z-04, A-01 | Kompakte Fassung der Pendelkarte mit denselben Daten (`locations.ts`) oder eine Brücke zur Karte der Startseite über den Leitfaden. Die Entscheidung fällt im Drehbuch. |
| L-26 | Stelle | Zitat Alexander Koch | Initialenkreis „AK“ in grauer Box (`A0/stelle-anlagenmechaniker__m390-light__04.webp` untere Hälfte). | niedrig | A-01 | Das echte Zitat nennt 13:30 und Hilti. Typografisch als Beleg an der Woche bzw. am Werkzeug verankern (Vorlage: `teamQuoteId`). |
| L-27 | Stelle | eingebetteter Fluss | Der Fluss beginnt bei 390 erst im 5. von 10 Bildschirmen (`A0/stelle-anlagenmechaniker__m390-light__05–06.webp`). Er besteht aus einer Standard-Radioliste und einem dünnen Fortschrittsbalken. Jury 3/3: „Flow spät“. | hoch | A-04, A-01, Z-04 | Kandidat für den Hauptmoment der Stellenseite (Akt „Handlung“): Die Leitung führt in den Fluss, der Fortschritt läuft als Leitungsabschnitte (so auch der Vorschlag in `JU/bewerbung-1/-3`). Den Weg zum Fluss verkürzen; der Anker `#bewerben` bleibt. |
| L-28 | Stelle | „In 3 Schritten“ | Wiederholt dieselbe Komponente wie die Startseite (`A0/stelle-anlagenmechaniker__m390-light__05.webp` oben). Der Klick legt nichts drauf (§3.2). | niedrig | A-04 | Auf der Stellenseite in den Fluss aufnehmen (Schritte als Abschnitte der Leitung); auf der Startseite bleibt der Überblick. |
| L-29 | alle | Leitfaden | Es gibt kein durchgehendes Element. 204 von 215 Inline-SVG sind lucide-Icons mit vier Strichstärken (S-04; `_relaunch/MESSUNGEN.md`). | hoch | A-04, A-01, A-05, Z-10 | Das Leitungspaar Vorlauf und Rücklauf als Leitfaden (B R1 mit A), der sich je Seite verwandelt: Start als Haus und Szene, Stelle als Woche und Gehaltsmaß, Bewerbung als Fortschritt, Danke als geschlossener Kreis. Eine Icon-Familie im Formsystem (45°-Giebel, runde Enden). |
| L-30 | `/` → Stelle | Seitenwechsel | Harter Schnitt ohne gemeinsames Element. Im Code gibt es keine View Transitions (0 Treffer). | hoch | A-04, A-02 | View Transition in 250–450 ms mit gemeinsamem Element, etwa Gehaltsmaß der Stellenzeile zum Hauptmaß der Stellenseite; die Leitung wandert als Paar mit gleichem Seitenverhältnis. Ein Tippen beendet den Übergang sofort. |
| L-31 | alle | Handy-Menü | Ein unteres Blatt „Menü“ mit Textliste, Telefon, WhatsApp und Knopf. Es wird beim ersten Öffnen nachgeladen (`components/site/MobileNav.tsx`: `lazy(loadSheet)`, Vorladen nur bei pointerenter/focus). Kein Bildbeleg, der Zustand ist nicht aufgenommen. §6 verlangt: vollflächig, typografisch, mit Leitfaden, offen in unter 300 ms. | mittel | A-03, A-05, A-10 | Vollflächiges Menü in Display-Schrift auf Papier; die Leitung zeichnet die Einträge an. Den Menücode im ersten Paket ausliefern oder im Leerlauf vorladen; Öffnungszeit mit 4× CPU-Drosselung messen. |
| L-32 | `/`, Stelle | ruhige Fassung | Heute ist die ruhige Fassung gleich der normalen, weil sich nichts bewegt. Jeder neue Moment braucht eine eigens gestaltete reduzierte Fassung. Hat das Handy des PUBLIKUMS „Bewegung reduzieren“ an (Teil der Generalprobe, AUFTRAG §10, CHECKLISTE), ist die ruhige Fassung sein erster Bildschirm. Heute ohne sichtbaren Mangel, daher mittel (§1 Nr. 7). | mittel | A-07, A-03, A-01, Z-09 | Der Endzustand ist eine vollwertige Komposition (Uhr auf 13:30, Leitung gezogen, Karte gesetzt), ohne Wechsel von Position oder Größe. |
| L-33 | `/`, Stelle | Mikrotypografie | Lehre aus 6/6 Kachel-Urteilen: Beschriftungen mit 11–12 px sind zu klein und zu blass. Heute haben Mikrozeile, Kartenmeta, Partnerliste, Öffnungszeiten und Fußnoten ~12–13 px in Grau (`EB/start/d1440-light-voll__t1500.webp` y 616; `A0/start__m390-light__11.webp` oben). | hoch | A-01 (Anker 8,5: „jedes Detail sitzt“) | Beschriftungen, die etwas aussagen, ab 14 px in einer Tinte-Stufe (B R2: Skala ab 14 px). Maße in der Maßschrift. |
| L-34 | `/`, Stelle | Echtheit ohne Fotos | Häufigste Kachel-Schwäche (6/6): kein Bildmaterial, keine Menschen. Fotos sind ausgeschlossen (K-014, A-G4). Heute stehen Initialenkreise („SD“, „AK“) als Ersatzgesicht da. | hoch | A-01, A-03 (Vertrauen) | Echtheit über benannte Personen, echte Zitate, echte Orte mit PLZ und belegte Zahlen; das Zitat wird zum typografischen Bild. Die Frage nach echten Fotos (N-16) gehört in die Freigabe-Übersicht. Nichts Generiertes. |
| L-35 | `/` | Austauschprobe der Szene | Das Wärmepumpenschema aus B R1 könnte jeder SHK-Betrieb zeigen (`RI/ergebnisse-runde1-2.json` `ueberarbeiten-b`, `RI/b/BEGRUENDUNG.md` §3). E-019 holt es dennoch zurück. | hoch | A-01 (Kreativität), A-03 (konkretes Merkmal) | Die Szene steht nur zusammen mit den belegten Werten (Uhr 13:30, 35-km-Maß, 1926 als Fundament nach B R2), und die Leitung endet im Knopf (A). Den Erklärtext „So arbeitet eine Wärmepumpe …“ setzt der Lauf nicht selbst ein; er gehört als Vorschlag nach `TEXTVORSCHLAEGE.md` (E-019). |
| L-36 | `/`, Stelle | Rot-Regel | B R1 setzt Rot an Klammer, Wärmewellen, Trenner und Ortspunkt; das war ein harter Befund (`pruefen-b`). Nach E-016 ist Rot als dünne Vorlauf-Leitung erlaubt, als Fläche oder Knopf nur für die eine Hauptaktion. | mittel | A-01, Z-11 | Rot nur als Leitung und am Knopf. Ortspunkte, Wellen und Trenner in Navy oder Blau. Kontraste aus `theme.css` gerechnet (`check-contrast.mjs`). |
| L-37 | `/`, Stelle | Teilen-Bilder | Die OG-Bilder wiederholen den Hero als Typo-Karte ohne Handschrift (`GET /opengraph-image`, `GET /jobs/anlagenmechaniker-shk-wetzlar/opengraph-image`, je 1200 × 630). Wer die Seite weitergibt, „zeigt sie anderen“ zuerst über dieses Bild (Anker 9). | niedrig | A-01, A-04 | Teilen-Bild je Seite im Formsystem (§6 Details): Haus und Leitung auf Papier, bei der Stelle das Gehaltsmaß. Nur Werte aus den Fakten. |
| L-38 | `/` | Einwilligung | Festgestellt: Es gibt kein Einwilligungsbanner. Einzige Einwilligung ist die Zwei-Klick-Karte in `#einsatzgebiet`; ohne Maps-Schlüssel erscheint sie nicht (`components/maps/RegionExplorer.tsx:23`, lokal 0 Treffer „Interaktive Karte laden“). | niedrig | A-03, A-06 | Wow-Probe und Bildfolgen laufen ohne Banner. Die Zwei-Klick-Schaltfläche wird in die gestaltete Pendelkarte eingebettet: gleichwertige Knöpfe, nie vorab zugestimmt. Kommt später ein Banner, wird A-03 neu gemessen. |
| L-39 | `/`, Stelle | Höhe, sichere Bereiche, Überziehen, Browserleiste | Der erste Bildschirm nutzt keine `svh`-Höhe (nur `body min-h-dvh`, `app/layout.tsx:79`). Der Dokumenthintergrund ist weiß, der Einstieg #F5F6F8. Die Browserleiste wird über `theme-color` gefärbt: hell #FFFFFF, dunkel #0B0F17 (`app/layout.tsx:27–31`, im ausgelieferten HTML von `GET /` bestätigt). Hell passt das heute nur zum weißen Kopf, nicht zur Einstiegsfläche #F5F6F8 und nicht zum künftigen Papier. Überziehen ist nicht gemessen. Rahmendetail des ersten Bildschirms, daher mittel (§1 Nr. 7). | mittel | A-03 | Erster Bildschirm in `svh`, Dokumenthintergrund in der Farbe des Einstiegs (Papier), eigene Druckzustände statt grauer Tipp-Markierung. `theme-color` hell und dunkel in der Farbe des Einstiegs (Papier bzw. Abend). Prüfung in Chromium und WebKit. |
| L-40 | Stelle | erster Bildschirm mobil (320, 375, 390): Brotkrume und Display-H1 | Bei 375 bricht die Brotkrume auf zwei Zeilen um: „Startseite › Stellen“ / „› Anlagenmechaniker SHK“ (`P0/stelle-anlagenmechaniker__m375-light__01.webp` y ≈ 195–310). Zusammen mit der dann dreizeiligen H1 (y ≈ 360–560) rutscht die Gehaltsbox nach y ≈ 700–915. Die Einleitung füllt den Rest bis knapp über die Bewerbenleiste, „Das erwartet dich“ fällt heraus. Bei 390 bleiben Brotkrume einzeilig und H1 zweizeilig (`EB/stelle/m390-light-voll__t1500.webp` y 205–240 bzw. 320–450). Jury 3/3: „Brotkrume bricht mobil (um)“ (`JU/stelle-anlagenmechaniker-1/-2/-3`). Bei 320 nicht als Bild belegt (§7). | hoch | A-03, A-01, Z-04 | Die Brotkrume mobil einzeilig kürzen, zum Beispiel nur „← Stellen“, oder in den Kopf ziehen. Jede Display-Zeile am längsten Wort „Anlagenmechaniker“ prüfen, bei 320, 375 und 390. Das Gehaltsmaß (L-19) bleibt in jeder dieser Ansichten im ersten Bildschirm. Dieselbe Regel gilt für die längeren Titel der übrigen Stellen (§5). |
| L-41 | alle Seiten der Grundmenge (A-05-Stichprobe), Schwerpunktseiten | Zustände und freie Werte (harte Slop-Befunde S-05, S-06) | A-05 verlangt neben Jury ≥ 8,0 auch **null harte Slop-Befunde**. Der Ausgangsstand verfehlt das auf jeder Seite: S-06 laut Zeigermessung `_relaunch/belege/P0-SLOP-01/slop-hart.md` (Abschnitt „S-06 Elemente ohne Hover-Regel“, d1440, „keine Änderung“) – /datenschutz 11, je 5 auf den vier Stellenseiten, /jobs 2, /bewerbung/mappe 2, je 1 auf /bewerbung, /bewerbung/danke, /impressum und 404, / 7 (u. a. Logo-Link, aktiver Navigationspunkt „Stellen“, FAQ-`summary`-Zeilen). S-05: Schriftgrößen außerhalb der Tokens auf /bewerbung/mappe (14/12/29,33/14,67 px) und das `select` der Ortswahl (17 px). Gesamt P0: 51 harte Befunde (MESSUNGEN.md, Zehnfach-Tafel). | mittel | A-05, A-01, Z-07 | Eigene Hover-, Druck- und Fokuszustände im Formsystem für Logo-Link, Navigationspunkte und `summary`-Zeilen (Folgeauftrag §6 „Körperliche Interaktion“, „Details“); Mappe auf die Druck-Tokenskala (E-011), `select` auf eine Tokenstufe; nach jeder Welle `werkzeuge/slop-hart.mjs` über die Stichprobe. |

**Verteilung:** 41 Lücken, davon 24 hoch, 12 mittel und 5 niedrig (mit L-41 nach A1-GEGEN-02). Vor der Gegenprüfung waren es 39 Lücken (19 hoch, 14 mittel, 6 niedrig). Geändert wurden:
- L-06, L-07, L-18 und L-20 von mittel auf hoch;
- L-39 von niedrig auf mittel;
- L-40 ist neu und hoch (§8).

Erster Bildschirm (L-01…L-09, L-18…L-21, L-39, L-40):
- Startseite 11: L-01…L-09, L-18, L-39.
- Stellenseite 10: L-06…L-09, L-18…L-21, L-39, L-40.
- Davon 6 gemeinsam: L-06…L-09, L-18, L-39.
- Bis zur Gegenprüfung stand hier „Stellenseite 6“; richtig waren schon damals 7.
- L-32, L-33 und L-34 wirken als Querschnittsthemen ebenfalls in den ersten Bildschirm.

Voraussetzung jeder Lösung im ersten Bildschirm: L-06 (LCP-Reserve ≤ 2,2 s nach jeder Welle).

Kandidaten für Hauptmomente:
- Start: L-12, die Pendelkarte, oder der erste Bildschirm mit Leitung im Knopf (L-01/L-02/L-05).
- Stelle: L-27, der Fluss als Leitung, oder L-19, das Hauptmaß Gehalt mit der Woche.

Leitfaden: L-29.

## 5 Abfallende Seiten (Kandidaten für A-05)

Grundmenge: 12 Seiten (`_relaunch/PLAN.md`). Neben den 2 Schwerpunktseiten sind das 10 Seiten, davon 2 übrige Hauptseiten mit A-01 ≥ 8,5 und 8 weitere Seiten mit A-05 ≥ 8,0. **A-05 verlangt 20 %, mindestens 8.** Bei 8 (bzw. 10) übrigen Seiten ist die Stichprobe praktisch eine Vollerhebung. Jede Seite unten zählt.

| Seite | Kriterium | Was beim Weiterklicken sichtbar abfällt (Beleg) | Risiko | Anschluss an die Richtung |
|---|---|---|---|---|
| `/jobs` (Hauptseite, P0 4,5) | A-01 ≥ 8,5 und 0 harte Slop-Befunde | 2×2 gleich graue Karten; das Gehalt steht klein in der Metazeile. Rechts neben der Überschrift ist es leer (`P0/stellen__d1440-light__01.webp` x 820–1265, y 120–360). „35 km um Wetzlar“ steht nur als Text auf grauem Band. Kleiner Link „Zur Stelle“, blasse Metazeilen (`JU/stellen-1…3`: „links schwer, rechts leer“). Es ist der erste Klick aus der Navigation „Stellen“. | **hoch** | Stellenzeilen mit Gehaltsmaß und Woche wie L-10. Der Leitfaden läuft vom Haus zu den Stellen. Seitenwechsel zur Stellenseite nach L-30. Als Arbeitsseite bleibt sie ruhig und dicht. |
| `/bewerbung` (Hauptseite, P0 4,8, Akt „Handlung“) | A-01 ≥ 8,5 und 0 harte Slop-Befunde | Bei 1440 eine schmale Mittelspalte in viel Leere (`P0/bewerbung__d1440-light__01.webp`). Standard-Radioliste, dünner Fortschrittsbalken. Alternativwege und Vertraulichkeit leise, Auswahlrückmeldung unklar (`JU/bewerbung-1…3`). | **hoch** | Der Fortschritt läuft als Leitungsabschnitte (Vorschlag aus 3/3 Jury-Urteilen). Daneben steht der Ansprechpartner. Rückmeldungen sind körperlich (Druckzustand). Nur Rückmeldebewegung, keine Auftritte (K-011). |
| `/bewerbung/danke` (Erfolgsmoment im Vorführpfad, E-018) | A-05 ≥ 8,0 und 0 harte Slop-Befunde (S-06 je Seite: L-41) | Belegt ist nur der Leerzustand: ein textlastiger Erklärsatz („In diesem Fenster ist gerade keine Bewerbung gespeichert …“), Knopf und Kontaktkarte, darunter Leere (`P0/bewerbung-danke__d1440-light__01.webp`, `__m375-light__01.webp`). Der Erfolgszustand ist nicht aufgenommen (bräuchte POST). | **hoch** | Der Kreis schließt sich: Vorlauf und Rücklauf treffen sich, „Sabri Demir meldet sich schnellstmöglich“ (quickResponse). Erfolg erst nach Serverbestätigung (§6). Messung später mit Attrappe in der Vorführ-Umgebung. |
| `/jobs/ausbildung-anlagenmechaniker-shk-wetzlar` | A-05 ≥ 8,0 und 0 harte Slop-Befunde (S-06 je Seite: L-41) | Gleiche Vorlage, andere Daten: Die H1 „Ausbildung Anlagenmechaniker SHK – Einstieg 2026 noch möglich“ läuft über 4 Zeilen, die Brotkrume bricht um (`P0/stelle-ausbildung__m375-light__01.webp` y 200–630). Der Betrag heißt hier „Vergütung“, die Dauer 42 Monate; takeoverGuarantee ist nur hier freigegeben. | **hoch** | Der Hauptmoment der Stellenvorlage muss datengetrieben sein (`salary`, `employment.kind`, `durationMonths`, `packageExtras`, `teamQuoteId` sind bei allen veröffentlichten Stellen gefüllt). Die Display-H1 wird am längsten Titel geprüft. |
| `/jobs/kundendiensttechniker-waermepumpe-wetzlar` | A-05 ≥ 8,0 und 0 harte Slop-Befunde (S-06 je Seite: L-41) | Die H1 „Kundendienst-techniker SHK / Servicemonteur (m/w/d)“ läuft über 4 Zeilen mit Trennung (`P0/stelle-kundendienst__m375-light__01.webp` y 300–600). Sonst wie die Schwerpunkt-Stelle. | mittel | Wie oben. Weiche Trennstellen (`titleShy`), jede Display-Zeile einzeln austariert. |
| `/jobs/obermonteur-projektleiter-shk-wetzlar` | A-05 ≥ 8,0 und 0 harte Slop-Befunde (S-06 je Seite: L-41) | Die Brotkrume bricht auf 2 Zeilen (`P0/stelle-obermonteur__m375-light__01.webp` y 200–300), die H1 läuft über 3 Zeilen. Das liegt nicht am langen Titel allein: Auch die Schwerpunkt-Stelle bricht bei 375 so um (L-40). privateCarOnePercent ist nur hier freigegeben. | mittel | Wie oben. Brotkrume kürzen oder in den Kopf ziehen (Lösung aus L-40 für die ganze Stellenvorlage). |
| 404 (Erzählseite nach K-011, „kleiner Charaktermoment“) | A-05 ≥ 8,0 und 0 harte Slop-Befunde (S-06 je Seite: L-41) | Graues „404“, „Diese Seite gibt es nicht.“ und zwei Knöpfe (`P0/fehler-404__d1440-light__01.webp`, `__m375-light__01.webp`); S-10 als Grenzfall. Kein Charaktermoment. | mittel | Kleiner Moment mit dem Leitfaden, etwa eine Leitung, die ins Leere läuft und zu „Stellen“ und „Bewerben“ zurückführt. Geringer Aufwand, hoher Abstand zum Ist. |
| `/bewerbung/mappe` (Arbeitsseite) | A-05 ≥ 8,0 und 0 harte Slop-Befunde (S-06 je Seite: L-41) | Formular und A4-Vorschau, funktional, aber im generischen Formularstil (`P0/bewerbung-mappe__d1440-light__01.webp`). Bei 320 ist „Hinzufügen“ abgeschnitten (`_relaunch/MESSUNGEN.md`, Reflow). | mittel | Gesteigertes Fundament (Schrift, Raster, Zustände). Die A4-Vorschau bekommt die eigene Druck-Tokenskala (E-011). Der Leitfaden steht nur im Fortschritt. |
| `/datenschutz` (Arbeitsseite) | A-05 ≥ 8,0 und 0 harte Slop-Befunde (S-06 je Seite: L-41) | Langer Rechtstext mit Inhaltskarte, Inter, graue Fläche (`P0/datenschutz__m375-light__01.webp`). Der Text ist unantastbar. | niedrig | Gesteigertes Fundament: Satzspiegel, Lesegröße, Inhaltsnavigation, Druckansicht. Rechtstext wörtlich. |
| `/impressum` (Arbeitsseite) | A-05 ≥ 8,0 und 0 harte Slop-Befunde (S-06 je Seite: L-41) | Wie Datenschutz (`P0/impressum__d1440-light__01.webp`: Inhaltsliste links, Angaben rechts). | niedrig | Wie Datenschutz. |

Seitenübergreifend fällt jede dieser Seiten ab, solange das gemeinsame Fundament (L-07, L-08, L-09, L-29, L-31, L-33) fehlt. Ohne neues Fundament reißt der Abstand zu den Schwerpunktseiten auf, sobald diese gesteigert sind. Dieses Risiko steht als Vorab-Scheitern „Glanzpfad, schwache Ränder“ in der Nebelkarte des Auftrags (§11). Empfehlung: A-05 vor den neuen Hauptmomenten messen und das Fundament in A3 mitbauen.

## 6 Was bleiben muss

Diese Stärken des Ausgangsstands dürfen bei der Steigerung nicht verloren gehen (A-G3, Z-04, K-012, K-014):

1. **Klarheit des Angebots im ersten Bildschirm.**
   - „SHK-Jobs in Wetzlar.“ und die Einleitung nennen Ort, Gewerk (Wärmepumpen, Heizungen, Bäder), Vergütung und Werkzeug (`EB/start/m390-light-voll__t1500.webp` y 290–1010).
   - Die Stellenseite nennt Beruf, Ort und Gehalt im ersten Bildschirm.
   - Ein Erstbetrachter muss das Angebot weiter in einem Satz wiedergeben können (A-03, Z-04).
2. **Die 60-Sekunden-Zusage.** „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“ steht im ersten Bildschirm, mobil aber vom Knopf getrennt: Bei 375 und 390 steht der Textlink „Offene Stellen ansehen ↓“ dazwischen (L-04). Sie muss direkt an den Knopf rücken und darf nicht wegfallen; größer werden darf sie.
3. **Genau eine rote Hauptaktion je Ansicht.** Die mitlaufende Leiste blendet sich aus, solange eine Hauptaktion im Bild ist (`PRIMARY_CTA_ATTR`, `STICKY_BAR_HIDE_SELECTOR`). Mobil liegt der Knopf in der Daumenzone.
4. **Sichtbare Gehaltsspannen** auf Start, `/jobs` und Stellenseite (K-014); auf der Stellenseite im ersten Bildschirm.
5. **Konkrete, belegte Zahlen statt Adjektive.** 13:30, 30 Tage, 35 km, 1926, 15 Leute und die Arbeitszeiten stammen aus `facts.ts`. Der Ton „Fakt vor Adjektiv“ in der Du-Anrede bleibt (K-012).
6. **Direkter Draht.**
   - Sabri Demir mit Telefon, WhatsApp, E-Mail und Öffnungszeiten steht im ersten Desktop-Bildschirm der Stellenseite (`EB/stelle/d1440-light-voll__t1500.webp` x 935–1265, y 330–690). Diese Kontaktkarte trägt dort das Vertrauen: 3 von 5 Erstbetrachtern nennen sie als Merkmal, Vertrauen 7 ist die Untergrenze nach A-03 (`WOW` S4).
   - „Lieber direkt per WhatsApp?“ steht im Fluss.
   - Hilfe steht immer an derselben Stelle (WCAG 3.2.6).
7. **Eingebetteter Bewerbungsfluss auf der Stellenseite,** mit vorgewählter Stelle („Anlagenmechaniker SHK · ändern“) und Diskretionszusage.
8. **Der Pendelrechner mit 10 echten Orten,** Entfernung und Fahrzeit. Die Tabelle funktioniert ohne JavaScript; Google Maps lädt nur nach zwei Klicks und nie vorab.
9. **Echte Stimmen.** Die vier freigegebenen Teamzitate und die Kundenstimmen werden nie umgeschrieben (K-014, E-010 S-13).
10. **Tempo und Ruhe der Technik.**
    - CLS 0, TBT 80–108 ms, keine Drittanbieter-Bytes.
    - Lighthouse A11y, Best Practices und SEO je 100; axe 0 in 110 Läufen; Tastatur ohne Falle.
    - Alle Seiten zeigen ohne JavaScript H1 und Inhalt.
    - Der erste Bildschirm steht ohne Ladebildschirm.
    - Die Steigerung darf das nicht verschlechtern. Der LCP muss sogar unter 2,5 s sinken (Z-12).
11. **Kein Einwilligungsbanner im ersten Bildschirm.** Datensparsam ohne Tracking; die Einwilligung gibt es nur dort, wo sie nötig ist (Zwei-Klick-Karte).
12. **Klare Kopfnavigation für Bewerber:** Stellen, Vorteile, Ablauf, FAQ, Telefon, Bewerben (`components/site/nav.ts`). Interne Ziele aus den Kacheln („System“, „PLAN“) werden nicht übernommen.
13. **Struktur für Suche und Feeds:** 12/12 Seiten mit Metadaten und gültigem JSON-LD, 0 kaputte Links, alte Anker (E-START-052).

## 7 Hinweise für den Gegenprüfer und offene Messlücken

- **Prüfbar mit den Belegen:** jede L-Zeile über Datei und Bereich, jede Zahl über `bericht.json`, MESSUNGEN.md und die Jury-JSON.
- **Nicht belegt, als Lücke markiert:**
  - Handy-Menü offen (L-31).
  - Erfolgszustand `/bewerbung/danke`.
  - Überziehen und WebKit (L-39).
  - Wow-Probe und Bildfolgen im dunklen Schema (L-18). Der helle Ausgangswert ist gemessen (§1, §3.1, §3.2). Der dunkle fehlt und gehört vor die erste Welle.
  - Stellenseite bei 320: Brotkrume und H1 sind nicht als Bild belegt (L-40). Belegt sind nur 375 und 390.
  - Diese Messungen gehören in die ergänzte Messbasis (STATUS, nächster Schritt).
- **Wahrheit:**
  - Die Richtungsspalte nennt nur Werte aus friday1330, workingHours, vacation30, radius35, noFarAssembly, founded1926, anniversary100 (mit `validUntil` 31.12.2026), employees15, aboveTariff, hilti, vehicle, ipadSmartphone, discretion, noCvNeeded, apply60s, quickResponse und directLine (L-20).
  - Dazu kommen `companyData` (Partner-Säulen, Meilenstein), `locations.ts` (10 Orte), `team.ts` (vier Zitate), `reviews.data.ts` und die Stellendaten (`salary`, `tasks`, `packageExtras`, `employment`, `teamQuoteId`).
  - Nicht verwendet werden der zurückgestellte Bewertungsdurchschnitt (E-START-045), die nicht freigegebenen Fakten außerhalb ihrer Stelle (takeoverGuarantee, privateCarOnePercent) und payFirstWorkday.

## 8 Gegenprüfung A1-GEGEN-01 eingearbeitet

Quelle: `_relaunch/ausbau/belege/a1-gegenpruefung.json` (Gegenprüfer A1-GEGEN-01, nicht bestätigt, 12 Korrekturen). Eingearbeitet von A1-ANALYSE-02. Jede neue Fundstelle wurde selbst nachgeprüft: Bilder in `EB/` und `P0/`, Fakten in `lib/content/facts.ts`, `lib/jobs/data/*` und `lib/data/*`, Werte in `WOW` und `_relaunch/MESSUNGEN.md`. Wo die eigene Prüfung vom Gegenprüfer abweicht, steht das in der letzten Spalte.

| Nr. | Fundstelle (Art) | Umsetzung in dieser Liste | Eigene Nachprüfung |
|---|---|---|---|
| 1 | §1 · §3.1 · §7 Wow-Ausgangswert (falsch) | Übernommen in §1 (Grenzen, Nr. 5), §2, §3.1 und §3.2. Neu sind dort die Wow-Tabellen mit Abstand zu A-03 (Start +3,0 mobil und +3,5 Desktop, Stelle je +4,5) und der Untergrenze für Vertrauen (6 mobil, 7 Desktop). Erstbetrachter-Belege stehen in L-03, L-06, L-19, L-20 und L-21. Der Punkt in §7 ist gestrichen. | `WOW` und MESSUNGEN.md (Zeile 9 und Abschnitt „Wow-Probe – Ausgangswert“) gelesen; Commit 151afaa, 15:51:38 UTC. **Abweichung:** Auf Start m390 ist 13:30 nicht das einzige Merkmal. 3 von 5 nennen es, je einer die 60-Sekunden-Zeile und „Pünktlich Feierabend.“; so eingetragen. Start d1440 5 von 5 und das Zitat S2-2 sind bestätigt. |
| 2 | §3.2 / L-19, H1 bei 390 (falsch) | §3.2 berichtigt auf „H1 in 2 Zeilen zu etwa 30 px (y 320–450)“. Der Stand bei 375 steht getrennt in §3.2 und L-40. | `EB/stelle/m390-light-voll__t1500.webp`: 2 Zeilen bestätigt. `P0/stelle-anlagenmechaniker__m375-light__01.webp`: 3 Zeilen, y ≈ 360–560, bestätigt. |
| 3 | neu: Stelle mobil 375, Brotkrume und H1 (fehlt) | Neue Zeile **L-40**, Priorität hoch nach §1 Nr. 7; Bezug A-03, A-01, Z-04. Ergänzt in §3.2 (375), Austauschprobe Stelle #2 berichtigt, Jury-Schwäche 3/3 benannt, §5 Obermonteur verweist auf L-40. | Umbruch y ≈ 195–310 und Gehaltsbox y ≈ 700–915 bestätigt; die Zitate stehen in allen drei Urteilen `JU/stelle-anlagenmechaniker-1/-2/-3`. **Abweichung:** Im P0-Bild läuft die Einleitung nicht unter die Leiste. Sie endet knapp darüber (Text bis y ≈ 1415, Leiste ab y ≈ 1470); „Das erwartet dich“ fällt aus dem ersten Bildschirm. Eingetragen ist der Befund wie gesehen. |
| 4 | §6 Nr. 2 / L-04, 60-Sekunden-Zusage (falsch) | §6 Nr. 2 umformuliert („im ersten Bildschirm, mobil aber vom Knopf getrennt; muss direkt an den Knopf rücken, darf nicht wegfallen“). L-04 nennt die Trennung durch den Textlink mit Beleg, die Lösung ergänzt „auch mobil“. Hinweis in §3.1. | Bei 390 (`EB/start/m390-light-voll__t1500.webp`: Knopf y 1065–1175, Textlink y 1215–1255, Zusage y 1310–1340) und 375 (`P0/start__m375-light__01.webp`) bestätigt. **Abweichung:** Bei 768 (`P0/start__t768-light__01.webp`) steht der Textlink neben dem Knopf und die Zusage direkt darunter (y ≈ 957). Der Beleg t768 trägt die Trennung also nicht; ersetzt durch m375. |
| 5 | L-23, „Werkzeugkoffer“ (erfunden) | In der Lösung ersetzt durch „Hilti-22-V-Akku-Flotte (Bohrhammer, Säbelsäge, Presszangen) und Pressbacken für Viega/Geberit; Transporter mit Sortimo-Regalsystem“. Dazu der Zusatz, dass die Bemaßung nur belegte Werte trägt (22 V, Herstellernamen, „Mitnahme nach Hause möglich“), keine erfundenen Maße, Stückzahlen oder Gegenstände. | `facts.ts:107` (hilti.long), `facts.ts:112` (vehicle.long) und `lib/jobs/data/anlagenmechaniker-shk.ts:53–57` (packageExtras) bestätigt. **Ergänzung:** „Werkzeugkoffer“ steht in `lib/data/company.ts:75` (companyData.benefits: „Hilti Vollausstattung im persönlichen Werkzeugkoffer“), wird in `app/` und `components/` aber nicht verwendet. Erfunden war das Wort also nicht. Es verletzte aber die Quellregel der eigenen Zeile, deshalb wie vorgeschlagen ersetzt. |
| 6 | L-06 (Priorität) | Auf **hoch** gesetzt. Gekennzeichnet als Voraussetzung jeder Lösung im ersten Bildschirm: LCP-Reserve ≤ 2,2 s nach jeder Welle messen. Mit S4-2 als Beleg und dem Hinweis, dass für A-06 keine AUSNAHME zulässig ist. Hinweis auch unter der Verteilung in §4. | Bilder `d1440-light-voll__t0000/t0250` beider Seiten je 2.396 B; LCP 2,92 s und 3,08 s (MESSUNGEN.md, Lighthouse-Tabelle). AUFTRAG §8: „nie für A-06 und A-10“. S4-2-Zitat bestätigt. Im dunklen Schema zeigt die Stelle schon bei 250 ms Inhalt; der Befund gilt für hell. |
| 7 | L-18 und Prioritätsregel §1 Nr. 7 (Priorität) | L-18 auf **hoch**; die Lösung verlangt Bildfolgen und Wow-Probe auch dunkel, neue Messlücke in §7. Die Regel §1 Nr. 7 ist geschärft („prägt den ersten Bildschirm sichtbar … oder bestimmt, wann er erscheint“, dazu Rahmendetails und ruhige Fassung als mittel). Danach gilt: L-07 und L-20 **hoch**. L-39 steigt von niedrig auf **mittel**, als Rahmendetail, das die Komposition nicht trägt. L-32 bleibt mittel, weil es heute keinen sichtbaren Mangel hat. | `EB/start/m390-dark-voll__t1500.webp` und `__streifen.webp` geprüft (Schiefer, Logo als weiße Silhouette). MESSUNGEN.md: Wow nur „helles Schema“. AUFTRAG §10, CHECKLISTE: Die Generalprobe prüft auch mit Dunkelmodus und „Bewegung reduzieren“. |
| 8 | L-32 (Bezug) | Bezug geändert auf „A-07, A-03, A-01, Z-09“. Die Lücke nennt die ruhige Fassung als ersten Bildschirm bei „Bewegung reduzieren“. | AUFTRAG §10, CHECKLISTE: Generalprobe „auch mit ‚Bewegung reduzieren‘“ bestätigt. |
| 9 | L-20 (Bezug) | Bezug „A-03 (Vertrauen), Z-04“ mit Beleg aus `WOW`. Die Lösung sieht für die zweite Aktion ein Wort und den Namen aus directLine („Direkter Draht zu Sabri Demir“) vor; Hilfe bleibt an derselben Stelle (WCAG 3.2.6). Die Priorität ist nach Nr. 7 jetzt hoch. directLine steht in §7 bei den verwendeten Fakten. | S4: 3 von 5 nennen die Kontaktkarte, Vertrauen 7 (7/7/7/7/8). S3: Vertrauen 6. `facts.ts:150–151` (directLine.short) bestätigt. **Ergänzung:** In S3 bemerken 2 von 5 das Nachrutschen der Leiste („ab 500 ms sichtbar“, „ab dem zweiten Bild“); das ist in L-20 und §3.2 aufgenommen. |
| 10 | L-01 / L-05 / L-19 / L-21, Ansichten 768 und 1920 (Bezug) | Belege für 768 stehen in L-01 und L-19, für 1920 in L-05 und L-21. A-02 ist bei L-21 ergänzt; L-01, L-05 und L-19 hatten ihn schon. Neu sind außerdem Absätze 768 und 1920 in §3.1 und §3.2 und die Bildmaßstäbe im Kürzelverzeichnis. Eine eigene Zeile gibt es nicht, um nicht doppelt zu zählen. | Alle vier Bilder geprüft. Die Dateien sind skaliert (t768 1440 × 1920 = Maßstab 1,875; d1920 1440 × 810 = 0,75); das ist im Kürzelverzeichnis ergänzt. **Präzisierung:** Bei 768 hat die H1 einen Zeilenabstand von ~54 px (rund 7 vw); rechts ist gut ein Viertel der Breite leer, nicht genau ein Drittel. Die 1920-H1 mit ~72 px (≈ 3,75 vw) ist bestätigt. |
| 11 | L-12, Jury-Schwäche Fahrzeiten (fehlt) | Ergänzt in den Jury-Schwächen §3.1, in der Austauschprobe Start #10 („6 von 10 Punkten unbeschriftet, Kern überfüllt“) und in L-12, dort mit Lösung: ohne Umbruch der Werte, Maßschrift, geprüft bei 320 und 375. | `JU/start-1` „Fahrzeit-Spalte bricht mobil um“ und `JU/start-2` „Fahrzeiten brechen um“ bestätigt. `P0/start__m375-light__07.webp`: PLZ 35578 unter „Wetzlar Kernstadt“. `P0/start__d1440-light__04.webp`: 4 Orte beschriftet, 6 Punkte unbeschriftet; `lib/data/locations.ts` hat 10 Orte. **Ergänzung:** Der stärkere Beleg ist `P0/start__m375-light__08.webp` (y 455–940). Dort stehen „10/18/16/22 Min.“ zweizeilig, und das ist der eigentliche Jury-Befund. |
| 12 | L-39, `theme-color` (Beleg) | `theme-color` hell und dunkel mit Beleg in L-39 aufgenommen. Lösung: die Farbe des Einstiegs (Papier bzw. Abend), geprüft in Chromium und WebKit. Priorität jetzt mittel (Nr. 7). | `app/layout.tsx:27–31` und GET `http://localhost:3500/` liefern beide Meta-Tags (#FFFFFF hell, #0B0F17 dunkel). **Präzisierung:** Hell passt #FFFFFF heute zum weißen Kopf, aber nicht zur Einstiegsfläche #F5F6F8 und nicht zum künftigen Papier. |

**Zählung nach der Einarbeitung:** 40 Lücken (vorher 39), davon **24 hoch** (vorher 19), 11 mittel (vorher 14) und 5 niedrig (vorher 6).

**Eigene Nebenkorrektur:** Die Zählung „Stellenseite 6“ für den ersten Bildschirm in §4 war schon vorher falsch, richtig waren 7. Sie ist neu gezählt.

**Hinweis an den Orchestrator:** Die Statuszeile in `_relaunch/STATUS.md` („Wow –“) ist veraltet. Die Ausgangswerte stehen in MESSUNGEN.md. Diese Datei wurde hier nicht geändert.

## 9 Gegenprüfung A1-GEGEN-02 (Bestätigung) eingearbeitet
- A1-GEGEN-02 bestätigt alle 12 Korrekturen von A1-GEGEN-01 als sachlich richtig umgesetzt. Ein offener Punkt der Art „fehlt“: die zweite Schwelle von A-05 (null harte Slop-Befunde). Vom Orchestrator eingearbeitet: neue Zeile L-41 (S-05/S-06 je Seite mit Beleg), Kriterienspalte in §5 ergänzt. Zählung jetzt 41 Lücken, davon 24 hoch, 12 mittel, 5 niedrig.
- Phasentor A1 (Folgeauftrag): Lückenliste mit Priorität und Bezug zu A-01…A-05, von frischen Gegenprüfern bestätigt; der letzte offene Punkt ist mit L-41 geschlossen.
