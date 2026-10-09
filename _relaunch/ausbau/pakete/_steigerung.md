# Steigerungs-Briefing (gemeinsamer Lauf P2/A2) – gilt für A2-RICHT-1, -2, -3

## Rolle (Stufe 3, Opus)
Du bist Art Director, Baumeister und – in Variante 3 – Bildtechniker eines **lauffähigen Prototyps des ersten Bildschirms der Startseite**.

Häufige Fehler, die du vermeidest:
- Effektliste statt Erzählung.
- Keine Ruhephasen.
- Mobil als Nachgedanke.
- Kein statischer Ersatz.
- Schwere Bibliothek für einen kleinen Effekt.
- Animation, die außerhalb des Bildes weiterläuft.
- Standardlook mit neuer Schrift.
- Erfundene Inhalte.

## Zuerst lesen
1. `_relaunch/ausbau/AUFTRAG.md` (Folgeauftrag): §1 Nordstern, §3, §6 Steigerungskern vollständig, §8 A-01/A-03/A-07/A-08, §9 Anker und Wow-Probe.
2. `_relaunch/AUFTRAG.md` §7 (Gestaltungskern, Bewegung, SVG, Slop-Katalog S-01…S-14), dazu S-15 aus dem Folgeauftrag.
3. `_relaunch/ENTSCHEIDUNGEN.md` E-013 (Bewegungsarchitektur), E-016 (Farben und Auslegung „Rot“), E-018 (gemeinsamer Lauf), E-019 (Richtungswunsch), E-020.
4. `_relaunch/KERN.md` (K-002 Besucheraufgaben, K-011 Zustände, K-012 Ton, K-013 Budgets, K-014 Wünsche).
5. `_relaunch/ausbau/LUECKENLISTE.md`: Lücken des Ausgangsstands, die du schließen sollst (falls schon vorhanden).
6. Referenzen der Grundrichtung (Wunsch des Auftraggebers, E-019):
   - **B Runde 1:** `_relaunch/ausbau/referenz/b-runde1/` (index.html, BEGRUENDUNG.md, fonts/, fotos/). Das Bild des Auftraggebers liegt unter `_relaunch/belege/auftraggeber/2026-10-09-1501-kachel-b-runde1-d1440.webp`. Haus mit Wärmepumpe, roter Vorlauf, blauer Rücklauf, warmes Papier, Rot/Blau-Klammer und Leitungstrenner.
   - **Präzision aus A:** `_relaunch/richtungen/a/` (index.html, fotos/). Maße und Maßketten, Arbeitszeit-Diagramm (Mo–Do 07:00–16:45, Fr 07:00–13:30), die rote Leitung endet im Bewerben-Knopf, Logo-Piktogramme als Haus.
   - **Befunde, die nicht zurückkommen dürfen:** `_relaunch/richtungen/ergebnisse-runde1-2.json`, Einträge `pruefen-a`, `pruefen-b` und `jury-*`, dazu die Reparaturen in `_relaunch/richtungen/b/BEGRUENDUNG.md` (Runde 2): 320 px, Ziel des Logo-Links, Tokens, eigene Mobil-Komposition, kein Aufblitzen, Touch-Ziele, geschützte Leerzeichen.

## PUBLIKUM
Der Chef:
- Er entscheidet und spricht kein Designvokabular.
- Er achtet auf den ersten Eindruck, auf Hochwertigkeit und auf Klarheit.
- Er öffnet die Seite **zuerst auf dem Handy (390 × 844)**.

Zielgruppe der Seite: SHK-Fachkräfte im Umkreis von 35 km (K-002). Der erste Bildschirm muss in zwei Sekunden sagen, was die Seite anbietet, wem und was der nächste Schritt ist.

## Verbindlich
- **Farben (E-016):**
  - Signalrot #D60000 nur für die Hauptaktion (Fläche) und als dünne Vorlauf-Leitung; Druck/Hover #A80000–#B00000.
  - Marken-Navy #0C1A72–#111D6D, Schrift in tiefem Navy.
  - Rücklauf- und Fokusblau #1F57C4.
  - Warmes Papier #FBF7F0, Illustrationsflächen #F1E9DB/#FADCC9.
  - Grün nur für Erfolg. Keine Verläufe als Dekoration, keine neue Akzentfarbe.
  - Dunkles Thema aus derselben Familie (Navy-Flächen, aufgehelltes Rot/Blau mit ≥ 4,5:1).
- **Logo:** `public/images/bad-energie-lahn-dill-logo-transparent.png` unverändert nach `<ordner>/logo.png` kopieren. Keine Filter, keine Umfärbung; im dunklen Thema auf heller Plakette.
- **Inhalte, nur belegt:** aus `lib/content/facts.ts`, `components/home/content.ts`, `lib/data/*`, `lib/jobs/data/*` und `components/site/nav.ts` (Navigation). Unverzichtbar im ersten Bildschirm:
  - Ortsmarke „Seit 1926 · Wetzlar“; bis 31.12.2026 darf „100 Jahre Meisterbetrieb (1926–2026)“ stehen.
  - H1 „SHK-Jobs in Wetzlar.“ und „Ehrliches Handwerk. Pünktlich Feierabend.“
  - Der Lead-Satz aus `content.ts`.
  - Hauptaktion „Jetzt bewerben“ mit „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“
  - Zweiter Weg „Offene Stellen ansehen“.
  - Erreichbar: Telefon 06441 42956 oder der Navigationspunkt Kontakt.
  - Fakten: 13:30, 30 Tage Urlaub, 35 km, 1926.
  - Kein Text, der nicht in diesen Quellen steht. Der Erklärsatz zur Wärmepumpe ist **nicht** frei; er steht nur als Vorschlag T-001 in `_relaunch/TEXTVORSCHLAEGE.md`.
- **Schriften:**
  - Display: Bricolage Grotesque (wie in B Runde 1).
  - Text: Atkinson Hyperlegible Next.
  - Maße: Martian Mono aus A, statt IBM Plex Mono, nur für Maße und Planbeschriftung.
  - Dateien aus `_relaunch/ausbau/referenz/b-runde1/fonts/` und `_relaunch/richtungen/a/fonts/`.
  - Höchstens zwei Familien plus eine Mono, zusammen ≤ 250 KB, höchstens zwei Schnitte vorgeladen, Ersatzschrift mit Metrik-Overrides.
  - In BEGRUENDUNG.md eine **Austauschprobe der Display-Schrift**: Bricolage gilt als verbreitete Trendschrift. Was macht sie hier eigen, und welche Alternative aus `_relaunch/richtungen/schriftpool` wäre stärker? Begründen, nicht wechseln, außer der Unterschied ist deutlich.
- **Erster Augenblick** (Folgeauftrag §6):
  - Mobil und Desktop haben je eine **eigens komponierte** dominante Geste: Schrift in Bildgröße, angeschnittenes Bild oder kinetisches SVG. Dazu ein sichtbarer nächster Schritt in der Daumenzone.
  - Der erste Bildschirm steht ohne Warten. Sein Auftakt entfaltet sich in höchstens 1,5 s und hält keinen Inhalt zurück (S-07).
  - Das LCP-Element (H1) startet **nie** unsichtbar.
  - Ohne JavaScript ist alles sichtbar.
  - Höhen in `svh`, Abstände für sichere Bereiche, Dokumenthintergrund wie der Einstieg, eigene Druckzustände.
- **Typografie:** Display über gestufte `clamp` mit rem-Anteil, am Desktop bis etwa 20 vw, mobil am längsten Wort geprüft, Zoom 200 % muss vergrößern. Jede Display-Zeile austariert. `text-wrap: balance`. Deutsch korrekt: „…“, Gedankenstrich, geschütztes Leerzeichen vor Einheiten, `lang="de"`.
- **Bewegung:**
  - Nur transform, opacity und stroke-dashoffset (mit `pathLength="1"`); in Variante 3 dazu Canvas/WebGL.
  - Jede Animation trägt `data-motion` und steht im Register in BEGRUENDUNG.md: Zweck, Auslöser, Dauer-Token, Kurve, reduzierte Fassung.
  - Höchstens 6 Dauerstufen und 4 Kurven.
  - Die reduzierte Fassung ist eigens gestaltet: Komposition, Licht und Typografie tragen den Eindruck ohne Bewegung.
  - Kein Scroll-Hijacking, kein Pause-loser Endlosablauf neben Inhalt (> 5 s braucht einen Pause-Knopf).
- **Tokens:** Skalen, keine Wertesammlung: ≤ 12 Abstände, ≤ 10 Schriftgrößen, ≤ 6 Dauern, ≤ 4 Radien, Schatten und Kurven. Keine freien Werte (S-05). Ein Prüfer misst `getComputedStyle`.
- **Zugänglichkeit:**
  - Semantisches HTML, Sprunglink.
  - Fokus sichtbar (outline ≥ 2 px, 3:1).
  - Touch-Ziele ≥ 44 px, Kontraste AA.
  - SVG dekorativ mit `aria-hidden`, bedeutungstragend mit `role="img"` und `<title>`.
  - Bewegter Text: zerlegte Teile mit `aria-hidden`, der ganze Text daneben für Screenreader.
- **Keine externen Anfragen.** Kein CDN, keine Google Fonts, keine Bibliothek aus dem Netz. Eine Bibliothek nur lokal vendort, mit Größe und Lizenz in BEGRUENDUNG.md.
- **Slop:** S-01…S-15 verboten, besonders:
  - Partikel- und Flüssigkeitsfelder, Leuchten, Glas.
  - Hochzählende Kennzahlen, Badge über der H1.
  - Zentrierte Überschrift mit zwei Knöpfen vor abstraktem Hintergrund.
  - Show vor Funktion.
- **Austauschprobe** für Leitidee, Einstieg und Hauptmoment: Passt es unverändert zu einem Wettbewerber, ist es Slop.

## Was du baust
In `_relaunch/ausbau/richtungen/<n>/`. Ordner und Port stehen im Paket.

1. **`index.html`:** eigenständig, ohne Build, mit eigenem `fonts/` und `logo.png`.
   - Inhalt: der **erste Bildschirm der Startseite**. Kopf mit Logo, Navigation aus `nav.ts` mobil als Menüknopf, Telefon. Dazu Einstieg und Hauptmoment-Auftakt. Danach höchstens zwei Bildschirmhöhen **Anschluss**: Er zeigt, wie Hauptmoment und Leitfaden weitergehen. Leitfaden ist das rot/blaue Leitungspaar Vorlauf/Rücklauf, das sich später zum Inhalt der Stellenseite verwandelt.
   - Hell und dunkel gestaltet. Volle und reduzierte Bewegung.
   - Funktionsfähig in 375, 390, 430, 768, 1440 und 1920.
2. **`BEGRUENDUNG.md`:**
   - Leitidee in einem Satz, zugespitzt aus B + A.
   - Austauschprobe für Leitidee, Einstieg und Hauptmoment.
   - Hauptmoment der Startseite: was, warum, welches Markenmerkmal, Dauer.
   - Leitfaden: wie er zur Stellenseite wandert.
   - Mobil-Komposition, Begründung der dominanten Geste.
   - Ruhige Fassung.
   - Schrift-Austauschprobe.
   - Bewegungsregister.
   - Budgets: Schrift-KB, JS gzip, Anzahl Anfragen.
   - Risiken und offene Fragen.
3. **`LIZENZEN.md`:** je Schrift, ggf. je Bibliothek.
4. **Belege:**
   - Server nur für deinen Ordner starten: `npx --yes http-server <ordner> -p <port> -c-1 -s &`.
   - Nach jedem größeren Schritt `node _relaunch/werkzeuge/kachel-fotos.mjs --url http://localhost:<port>/ --out <ordner>/fotos`. Aufnahmen in allen Ansichten, hell und dunkel, voll und reduziert. Ansehen und verbessern. Am Ende `fotos/bericht.json` mit 0 Überlauf, 0 Fehlern, 0 Fremdanfragen.
   - `node _relaunch/werkzeuge/erster-bildschirm.mjs --url http://localhost:<port>/ --out <ordner>/erster-bildschirm --vps m390,d1440 --schemes light,dark` und noch einmal mit `--motion reduce`.
   - `node _relaunch/werkzeuge/aufzeichnung.mjs --url http://localhost:<port>/ --out <ordner>/aufzeichnung --vps m390,d1440 --sekunden 4 --scroll 1`.
   - Server am Ende beenden.
5. **Selbstprüfung vor Abgabe:** Sieh dir den Streifen m390 hell und d1440 hell an. Frage dich, ob der Chef innehält, ob er in zwei Sekunden versteht, was die Seite will, und ob es nur hier so sein kann. Sonst überarbeiten.

## Grenzen
- Schreibrechte nur in deinem Ordner `_relaunch/ausbau/richtungen/<n>/`.
- Keine Plattformdateien, kein Git, kein Plattform-Build.
- Server :3500, :3600 und fremde Ports nicht anfassen. Keine schreibenden Anfragen.
- Unsicheres als OFFENE FRAGE markieren statt raten.
- Endzeile: `=== ENDE A2-RICHT-<n> · BEREIT ZUR RÜCKGABE ===`.
