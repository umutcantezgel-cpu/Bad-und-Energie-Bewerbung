# Element-Pässe der Startseite `/` (P1-REST-01)

Paket P1-REST-01 (Runde 2: P1-REST-04-R2, Runde 3: P1-REST-04-R3) · Rolle Restaurator · Stufe 2 · Kern-Version 0 (vorläufig) · Stand 2026-10-09

**Grundlage:** Altatlas `_relaunch/atlas/alt-start.md` (388 Zeilen: ALT-START-001…360 plus die Nachträge 361–364 aus den Gegenproben P1-KUND-05 und P1-KUND-06, die Standortzeilen 365–374 aus Runde 1, die Kartenzeilen 375–377 aus Runde 2 (Google-Kartenstile und Radiuskreis), die Kartenzeilen 378–388 aus Runde 3 (Startansicht und Steuerelemente, Standortwahl, Marker, Platzhalter-Filter, Schlüsselreihenfolge, Karten-ID, Skript-URL, Fehlerwege, Ebenenwechsel, ungenutzte Exporte) und die Korrekturen zu 086, 090, 097, 255, 256, 361, 362 und 363 (Runde 2) sowie zu 247, 253, 257, 265, 266, 267, 271 und 274 (Runde 3)), Neuatlas `_relaunch/atlas/neu-plattform.md` (NEU-START, NEU-STELLEN, NEU-BEW, NEU-DANKE, NEU-MAPPE; im Ausgangsstand fehlt ein Bereich NEU-SHELL, Kopf und Fuß wurden im Code gelesen), Code des Ausgangsstands (`app/page.tsx`, `components/home/*`, `components/maps/*`, `components/reviews/*`, `components/apply/*`, `components/site/*`, `lib/content/*.ts`, `lib/data/*.ts`, `lib/jobs/data/*.ts`), `docs/ROADMAP.md` §1, §4, §5, §6, §9, §10, §13, `docs/operations/fakten-abgleich.md`, `docs/prompts/20_*.md` (Owner-Auftrag zu Jubiläum, Meilenstein und Partner-Säulen) und die Git-Historie des Altstands (`git show`, nur lesend).

**Messbedingungen:** Gerendertes HTML des Ausgangsstands per `curl` (nur GET) auf `http://localhost:3500/` am 2026-10-09 geprüft (Titel, Meta, Anker-IDs, JSON-LD, Textsuche; Runde 3: kein Knopf „Interaktive Karte laden“ und kein Verweis auf maps.googleapis.com im HTML, also kein Karten-Schlüssel im Build; `GET /api/maps/config` antwortet im Messkontext 403 mit `{"ok":false,"error":"FORBIDDEN"}`); `GET /api/contact` = 404, `GET /bewerbung?tab=vault` = 200, `GET /bewerbung?tab=dossier` = 308 auf `/bewerbung/mappe`. Der Altstand wurde nicht neu abgefragt; Bildschirmfotos und Quelltext reichten (Altstand-Quelltext unter `_relaunch/altstand/main/`). Kein Browserlauf, keine Formularsendung.

**Lesehinweise:** Bildpfade relativ zu `_relaunch/`. Altstand-Fotos `belege/p0-altstand/alt-start__d1440-light__NN.webp` (14 Ausschnitte; Zuordnung: 01 Hero · 02 Funnel Schritt 1 · 03 Trust-Leiste und Stellen · 04 Stellen 3–4 und Paket-Kopf · 05 Konfigurator · 06–07 Vorteile · 07–08 Ausstattung · 08–09 Wechselprozess · 09 Einsatzgebiet · 10–11 Karte · 11–12 Bewertungen · 13 Kurzantwort und Kontakt · 14 Kontaktformular und FAQ-Anfang; FAQ-Ende, Schluss-CTA und Fuß nur im Vollbild `.roh/p0-altstand/alt-start__d1440-light.png`). Die Bildspalte von `alt-start.md` ist nicht flächig zugeordnet (der Kopf des Altatlas verweist auf `belege/p0-altstand/`), obwohl die Fotos vorliegen. Ausgangsstand-Fotos `belege/p0-ausgangsstand/start__d1440-light__NN.webp` (01 Hero · 02 Stellen · 03–04 Vorteile · 04–05 Einsatzgebiet · 06 Ablauf · 07 Über uns und Stimmen · 08 Stimmen und FAQ · 09 FAQ und CTA-Band · 10 Fuß). „Gegenstück“ nennt Zeilen des Neuatlas (NEU-…) oder Dateien. Zustand: verloren, geschwächt oder verschoben; Entscheidung nach `_restaurator.md`.

## Übersicht

| E-ID | Name | Kategorie | Zustand | Priorität | Entscheidung |
|---|---|---|---|---|---|
| E-START-001 | Titel, Beschreibung und Teilen-Daten der Startseite | Suche und Technik | verschoben | Muss | Keine Rückführung nötig |
| E-START-002 | Jubiläum „100 Jahre Meisterbetrieb (1926–2026)“ | Vertrauen | geschwächt | Muss | Rückführen |
| E-START-003 | Hero-Kopf: Überschrift und Einleitung | Inhalt | verschoben | Muss | Keine Rückführung nötig |
| E-START-004 | Vorteils-Kacheln im Hero (Wochenendstart, Erholungsurlaub, Ausstattung) | Inhalt | verschoben | Soll | Keine Rückführung nötig |
| E-START-005 | Rückmeldezusage „Binnen 24 Stunden“ | Vertrauen | verloren | Soll | Zurückstellen |
| E-START-006 | Hero-Aktionen: Bewerben und Bewerberportal | Navigation | verschoben | Muss | Keine Rückführung nötig |
| E-START-007 | Direktweg „Lebenslauf direkt hochladen“ | Funktion | verloren | Soll | Verschmelzen |
| E-START-008 | Zitatkarte Sabri Demir: Person und „Direkte Betreuung“ | Vertrauen | verschoben | Muss | Keine Rückführung nötig |
| E-START-009 | Hero-Zitat „Wir suchen keine standardisierten Bewerbungsmappen …“ | Vertrauen | verloren | Kann | Zurückstellen |
| E-START-010 | Hero-Checkliste und Teamgröße (Vertrauenspunkte der Zitatkarte) | Vertrauen | geschwächt | Muss | Verschmelzen |
| E-START-011 | Innungs- und Kammer-Siegel (Innungsbetrieb, HWK Wiesbaden) | Vertrauen | geschwächt | Muss | Verschmelzen |
| E-START-012 | Express-Bewerbung im Einstieg (Funnel) | Funktion | verschoben | Muss | Keine Rückführung nötig |
| E-START-013 | Passungs-Rahmung „Finde heraus, ob Bad und Energie GmbH zu Dir passt“ | Inhalt | geschwächt | Soll | Neu interpretieren |
| E-START-014 | Fortschrittsanzeige des Funnels (Zähler, Balken, Schrittnamen) | Bewegung | verschoben | Soll | Keine Rückführung nötig |
| E-START-015 | Profilfragen im Funnel: Berufsstatus und Kenntnisse | Interaktives | geschwächt | Soll | Verschmelzen |
| E-START-016 | Wunsch-Vorteile im Funnel („Was ist Dir an Deinem neuen Arbeitgeber besonders wichtig?“) | Interaktives | verloren | Soll | Verschmelzen |
| E-START-017 | Diskretionszusage und Sperrvermerk am Kontaktschritt | Recht | geschwächt | Muss | Verschmelzen |
| E-START-018 | Vorbelegte Angaben und erfundene Daten im Funnel | Funktion | verloren | Muss | Nicht zurückführen |
| E-START-019 | Konfetti nach dem Absenden | Bewegung | verloren | Kann | Neu interpretieren |
| E-START-020 | Erfolgsansicht nach der Express-Bewerbung | Funktion | verschoben | Soll | Verschmelzen |
| E-START-021 | Trust-Leiste unter dem Hero (Laufband mit sieben Vertrauenspunkten) | Vertrauen | geschwächt | Muss | Neu interpretieren |
| E-START-022 | Stellenübersicht: Kopf | Inhalt | verschoben | Soll | Keine Rückführung nötig |
| E-START-023 | Vier Stellenkarten mit Bewerbungsknopf | Navigation | verschoben | Muss | Keine Rückführung nötig |
| E-START-024 | Vorteils-Konfigurator „Dein persönliches Mitarbeiter-Paket“ | Interaktives | geschwächt | Soll | Neu interpretieren |
| E-START-025 | Vorteilskarten „Warum Handwerker aus Wetzlar & Gießen gern zu uns wechseln“ | Inhalt | geschwächt | Soll | Verschmelzen |
| E-START-026 | Ausstattung „Werkzeug & Fuhrpark: Nur das Beste für Dein Handwerk“ | Inhalt | geschwächt | Soll | Verschmelzen |
| E-START-027 | Wechselprozess in drei Schritten mit Diskretion | Inhalt | verschoben | Muss | Keine Rückführung nötig |
| E-START-028 | Einsatzgebiet: Überschrift und Versprechen | Inhalt | verschoben | Muss | Keine Rückführung nötig |
| E-START-029 | Orts-Pillen („Wetzlar (Firmensitz)“, Gießen, Aßlar, Solms …) | Inhalt | geschwächt | Soll | Verschmelzen |
| E-START-030 | Zentrale-Werkstatt-Karte („Zentrale Werkstatt & Logistiklager“) | Inhalt | geschwächt | Soll | Verschmelzen |
| E-START-031 | Meilenstein 2026 und Standortverlagerung | Vertrauen | geschwächt | Muss | Verschmelzen |
| E-START-032 | Einsatzgebietskarte (Google-Karte mit Vektor-Rückfall) | Interaktives | geschwächt | Muss | Neu interpretieren |
| E-START-033 | Radius-Umschalter 15 / 25 / 35 km | Interaktives | verloren | Soll | Neu interpretieren |
| E-START-034 | Kartenstile „Porzellan · Satellit · Midnight“ | Interaktives | geschwächt | Kann | Keine Rückführung nötig (verschoben ohne Umschalter und Satellit, bewusst) |
| E-START-035 | Kartenfunktionen: Zentrieren, Details, Vollbild | Interaktives | verloren | Kann | Neu interpretieren |
| E-START-036 | Landschaftsgrafik Lahn, Dill, A45 und B49 (SVG) | Grafik und SVG | verloren | Soll | Neu interpretieren |
| E-START-037 | Radar-Ring um den Firmensitz | Bewegung | verloren | Kann | Neu interpretieren |
| E-START-038 | Standort-Pins und Standortdetails (Panel, Beschreibungen, Einstufung) | Interaktives | geschwächt | Soll | Verschmelzen |
| E-START-039 | Pendlerrechner (Entfernung und Fahrzeit zum Wohnort) | Interaktives | verschoben | Muss | Keine Rückführung nötig |
| E-START-040 | „Route in Google Maps öffnen“ | Einbindung Dritter | verloren | Soll | Rückführen |
| E-START-041 | Infokarten unter der Karte | Inhalt | verschoben | Kann | Keine Rückführung nötig |
| E-START-042 | Bewertungsband: Überschrift, Ansichten und Filter | Interaktives | verschoben | Soll | Keine Rückführung nötig |
| E-START-043 | Google-Kundenbewertungen mit Inhaber-Antwort | Vertrauen | geschwächt | Muss | Verschmelzen |
| E-START-044 | Teamstimmen „Mitarbeiter Stimme“ (vier nicht belegte Personen) | Vertrauen | verloren | Soll | Nicht zurückführen |
| E-START-045 | Google-Bewertungsabzeichen (5,0 · 24 Berichte) | Vertrauen | geschwächt | Muss | Zurückstellen |
| E-START-046 | Kinetisches Bewertungs-Karussell (Ziehen, Schleudern, Tempo) | Bewegung | geschwächt | Soll | Neu interpretieren |
| E-START-047 | Kurzantwort-Box „Warum lohnt sich ein Wechsel …?“ (AIAnswerBox) | Suche und Technik | verschoben | Soll | Keine Rückführung nötig |
| E-START-048 | Kontaktbereich „Sprich direkt mit Meister Sabri Demir“ (Direktkontakt-Karte) | Einbindung Dritter | geschwächt | Soll | Verschmelzen |
| E-START-049 | Schnellformular „Unverbindliche Schnellbewerbung oder Anfrage“ | Funktion | verschoben | Muss | Keine Rückführung nötig |
| E-START-050 | FAQ: fünf Fragen zum Bewerbungsprozess | Interaktives | verschoben | Muss | Keine Rückführung nötig |
| E-START-051 | Schluss-CTA „Bereit für ein faires Angebot …?“ | Navigation | geschwächt | Soll | Verschmelzen |
| E-START-052 | Anker und Sprungziele der Startseite | Navigation | geschwächt | Muss | Rückführen |
| E-START-053 | Pulsierende Live-Punkte (Ping) | Bewegung | verloren | Kann | Neu interpretieren |
| E-START-054 | Karten-Hover-Anhebung (Hover-Lifts) | Bewegung | verschoben | Kann | Keine Rückführung nötig |
| E-START-055 | Kennzahl „> 3.000 Projekte“ | Vertrauen | verloren | Kann | Nicht zurückführen |
| E-START-056 | Schlüssel, Ladeweg und Rückfall der Google-Karte | Einbindung Dritter | verschoben | Soll | Keine Rückführung nötig |

**Verteilung:** 56 Pässe · Zustand: verschoben 20, geschwächt 22, verloren 14 · Priorität: Muss 22, Soll 25, Kann 9 · Entscheidung: Keine Rückführung nötig 20, Rückführen 3, Zurückstellen 3, Verschmelzen 16, Neu interpretieren 11, Nicht zurückführen 3. Zurückgestellt: 3 von 56 (5.4 %, Ziel ≤ 10 %).

**Nachführung P1-GEGEN-02** (Delta-Gegenprüfung, ENTSCHEIDUNGEN E-017): Die Übersicht folgt jetzt exakt den Passtexten, die Verteilung oben ist daraus gezählt. In der Übersicht nachgezogen sind die E-014-Korrekturen, die im Passtext schon standen (korrigiert nach P1-GEGEN-02; vorher in der Übersicht): E-START-008, -010, -021, -031 und -049 Priorität Muss (vorher Soll); E-START-016 und -033 Priorität Soll (vorher Kann); E-START-030 Zustand geschwächt (vorher verloren). Neu aus P1-GEGEN-02, in Pass und Übersicht: E-START-034 Zustand geschwächt (vorher verschoben); E-START-038 Priorität Soll (vorher Kann). Die frühere Verteilung (Zustand verschoben 21, geschwächt 20, verloren 15 · Priorität Muss 17, Soll 27, Kann 12) entfällt. Weitere Korrekturen stehen in den Pässen E-START-024, -032, -033, -034, -035, -038, -047 und -056 (Wesenskern, Ziel, Entscheidung, Priorität oder Abnahme) und tragen dort den Vermerk „(korrigiert nach P1-GEGEN-02; vorher …)“.

## Element-Pässe

### E-START-001 · Titel, Beschreibung und Teilen-Daten der Startseite
- Kategorie: Suche und Technik
- Quelle: ALT-START-001–006 · app/page.tsx:59-72 · Bild: –
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: app/page.tsx:22-32 (generateMetadata), components/home/content.ts (HOME_TITLE, homeDescription), lib/seo/metadata.ts)
- Aufgabe: Suchmaschinen und Link-Vorschauen erfahren, wer wir sind und was gesucht wird; Besucher entscheiden im Suchergebnis, ob sie klicken.
- Wesenskern: Altstand: Titel „Jobs Wetzlar | Heizungsbauer & Monteure | Bad & Energie“; Beschreibung „SHK Handwerker Jobs in Wetzlar: Top Vergütung, 30 Tage Urlaub, freitags ab 13:30 Uhr frei & Firmenwagen. Jetzt in 60 Sek. bewerben bei Bad & Energie!“; Canonical `https://karriere.bad-energie.de`; og:title und og:description wie oben; og:url, og:siteName „Bad und Energie GmbH Lahn Dill“, og:locale `de_DE`, og:type `website`. Ausgangsstand (gerendert per `curl` geprüft): Titel „SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer“; Beschreibung „SHK-Jobs in Wetzlar: Anlagenmechaniker, Kundendienst, Obermonteur & Ausbildung. 30 Tage Urlaub, freitags ab 13:30 frei. In 60 Sek. bewerben.“; Canonical gleich; og:* und twitter:* vollständig, dazu og:image. Bleiben muss: Ortsbezug Wetzlar, Suchbegriffe „SHK Jobs“ und „Heizungsbauer“, „30 Tage Urlaub“, „freitags ab 13:30“, „60 Sek.“, Canonical ohne Schrägstrich. Nicht übernommen und nicht nötig: „Top Vergütung“ (die Gehaltsspannen stehen jetzt sichtbar in den Stellenkarten), „Firmenwagen“ (nur Platzgründe, 155 Zeichen).
- Freiraum: Wortlaut und Reihenfolge nach ROADMAP §10 (Titel ≤ 60, Beschreibung ≤ 155 Zeichen); die Beschreibung nennt automatisch die live geschalteten Stellenarten; Nachschärfen nach Search-Console-Daten.
- Bindungen: Canonical `https://karriere.bad-energie.de` (ohne Schrägstrich); `revalidate = 3600` (app/page.tsx:19); og:image aus app/opengraph-image.tsx; Schema, robots und llms.txt gehören zum Paket P1-REST-03.
- Priorität: Muss – Grund: Seite mit Suchwert, URL `/`.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/page.tsx (generateMetadata) und components/home/content.ts, unverändert.
- Gestaltung: folgt KERN (P2); keine Gestaltung, nur Textpflege.
- Abnahme: `curl -s http://localhost:3500/` liefert Titel ≤ 60 und Beschreibung ≤ 155 Zeichen, Canonical, og:title, og:description, og:url, og:site_name, og:locale · Bildpaar entfällt (kein sichtbarer Anteil).
- Status: offen
- Unsicherheit: keine

### E-START-002 · Jubiläum „100 Jahre Meisterbetrieb (1926–2026)“
- Kategorie: Vertrauen
- Quelle: ALT-START-008, 026 · app/page.tsx:164-167, 285-288 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-02 Eyebrow „Seit 1926 · Wetzlar“, NEU-START-13 Kennzahl „1926 Gegründet“, NEU-START-53 „… Seit 1926.“; der Fakt `anniversary100` (lib/content/facts.ts:80-86, `validUntil: 2026-12-31`) wird in keiner Komponente benutzt)
- Aufgabe: Besucher: ein Betrieb mit 100 Jahren Bestand ist ein sicherer Arbeitsplatz. Unternehmen: das Jubiläumsjahr 2026 als Markenzeichen nutzen. Das Argument ist ausdrücklicher Owner-Auftrag (docs/prompts/20_…:25-27: „Verankere dieses Jubiläum im Hero-Badge auf der Startseite … und in allen Trust-Elementen als Beweis für höchste Arbeitsplatzsicherheit“).
- Wesenskern: Wortlaut „100 Jahre Meisterbetrieb (1926–2026)“ als Badge, mit Zusatz „• Offene Stellenangebote in Wetzlar“, sowie Kennzahl „100 J.“ mit „1926–2026“. Belegt (lib/data/company.ts: `tagline`, `foundingYear` 1926; Fakten-Fix „1926–2026“ in docs/operations/fakten-abgleich.md). Gilt nur im Jubiläumsjahr: ab 2027 wieder „Seit 1926“ (ROADMAP §13). Dieselbe Aussage steht im Altstand zusätzlich in der Trust-Leiste (E-START-021), in der Stellenkarte Ausbildung („100 Jahre Ausbildungstradition mit Meisterbetreuung“, E-START-023) und im Vorteil „Familiäres Meisterteam“ (E-START-025).
- Freiraum: Form (Badge, Eyebrow-Zusatz, große Zahl „100“ mit Jahreslinie 1926–2026) und Ort im Hero; der pulsierende Punkt ist nicht nötig (E-START-053).
- Bindungen: `isFactActive('anniversary100', new Date())` blendet das Jubiläum am 01.01.2027 selbst aus; Test dazu in lib/content/__tests__/content.test.ts:78-79; die Aussage muss in Hero, Vertrauenszeile, Stellenkarte und Vorteil gleich lauten (jeder Fakt höchstens zweimal pro Seite, ROADMAP §3.2).
- Priorität: Muss – Grund: belegtes Vertrauenselement und Markenzeichen, Owner-Auftrag, zeitkritisch (gilt nur noch bis 31.12.2026; heute 09.10.2026).
- Entscheidung: Rückführen
- Ziel in der Plattform: components/home/Hero.tsx (Eyebrow oder StatTile-Variante), HERO und HERO_STATS in components/home/content.ts; Sichtbarkeit über `isFactActive`.
- Gestaltung: folgt KERN (P2); vorläufige Idee: die Zahl „100“ groß als erste Kennzahl, darunter „Jahre Meisterbetrieb · 1926–2026“.
- Abnahme: Bis 31.12.2026 zeigt `/` im ersten Bildschirm „100 Jahre Meisterbetrieb (1926–2026)“; mit gesetzter Zeit 2027-01-01 verschwindet es und die Seite zeigt „Seit 1926“ (Vitest) · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp.
- Status: offen
- Unsicherheit: Ja: War die Weglassung bewusst? ROADMAP §5.1 nennt kein Jubiläum im Hero, §13 sieht das „100 Jahre“-Badge aber bis Ende 2026 vor, und `anniversary100` existiert ungenutzt. Verloren oder bewusst auf „Seit 1926“ verschoben?

### E-START-003 · Hero-Kopf: Überschrift und Einleitung
- Kategorie: Inhalt
- Quelle: ALT-START-009–010 · app/page.tsx:169-178 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-03/04/05 (components/home/Hero.tsx, HERO in components/home/content.ts): H1 „SHK-Jobs in Wetzlar.“ + „Ehrliches Handwerk. Pünktlich Feierabend.“, Lead mit 17 Wörtern)
- Aufgabe: Erster Eindruck: sagen, was Handwerker hier bekommen (Arbeit mit Haltung, gute Bezahlung, pünktlicher Feierabend) und zum Losgehen einladen.
- Wesenskern: Altstand: H1 „Ehrliches Handwerk. Erstklassiger Lohn.“ mit Akzentzeile „Pünktlich Feierabend im Meisterteam.“; Einleitung „Attraktive Jobs in Wetzlar für erfahrene Heizungsbauer und engagierte Monteure: Ehrliches Handwerk, erstklassiger Lohn und pünktlich Feierabend im Meisterteam erlebe […]“ (41 Wörter, „60 Sekunden“ fett: „… ohne Anschreiben, ohne Lebenslauf, mit garantierter persönlicher Rückmeldung binnen 24 Stunden“; die Rückmeldezusage siehe E-START-005). Das Wesen sind drei Versprechen: Handwerk, Lohn, Feierabend. Ausgangsstand: zwei davon in der H1; der Lohn steht als „Bezahlt über Tarif“ im Lead und als Gehaltsspanne in den Stellenkarten.
- Freiraum: Die H1 ist durch ROADMAP §10 festgelegt (SEO); Reihenfolge und Gewicht der drei Versprechen, das Wort „Meisterteam“; der Verlaufstext (Rot → Navy → Blau) entfällt.
- Bindungen: Einzige h1 der Seite (`aria-labelledby=hero-title`); H1 und Titel (E-START-001) müssen zusammenpassen.
- Priorität: Muss – Grund: Kernaussage der Startseite.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/Hero.tsx, HERO in components/home/content.ts.
- Gestaltung: folgt KERN (P2); vorläufige Idee: die drei Versprechen als typografischer Dreiklang in der Zeilenfolge der H1.
- Abnahme: `/` enthält in der H1 „Ehrliches Handwerk“ und „Feierabend“ und im Lead „Tarif“ und „Hilti“ · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp.
- Status: offen
- Unsicherheit: keine

### E-START-004 · Vorteils-Kacheln im Hero (Wochenendstart, Erholungsurlaub, Ausstattung)
- Kategorie: Inhalt
- Quelle: ALT-START-011–013 · app/page.tsx:182-202 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-10 „13:30 Freitags Feierabend“, NEU-START-11 „30 Tage Urlaub“, NEU-START-26 (Urlaubs- und Weihnachtsgeld), NEU-START-29/30 (Hilti, Servicefahrzeug), NEU-START-05 (Lead))
- Aufgabe: Die härtesten Vorteile auf einen Blick, noch vor dem ersten Scrollen.
- Wesenskern: Drei der vier Kacheln: „Wochenendstart · Freitags ab 13:30 Uhr · Pünktlicher Feierabend“; „Erholungsurlaub · 30 Tage garantiert · Plus Urlaubsgeld“; „Ausstattung · Hilti & Firmenwagen · Ab Wohnort nutzbar“ (die vierte, „Rückmeldung“, siehe E-START-005). Ausgangsstand: vier StatTiles (13:30 · 30 · 35 km · 1926); die Ausstattung steht im Lead („persönlicher Hilti-Ausstattung“) und in den Vorteilskacheln, der Firmenwagen erst weiter unten.
- Freiraum: Zahlen groß und weniger Text; „garantiert“ nicht nötig; der Firmenwagen darf im Hero stehen.
- Bindungen: Fakten `friday1330`, `vacation30`, `hilti`, `vehicle` (lib/content/facts.ts); jeder Fakt höchstens zweimal pro Seite.
- Priorität: Soll – Grund: klarer Besuchernutzen, Inhalt vorhanden.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: HERO_STATS in components/home/content.ts.
- Gestaltung: folgt KERN (P2); vorläufige Idee: Kennzahlenzeile mit Tabellenziffern.
- Abnahme: Im ersten Bildschirm (1440×900) stehen „13:30“, „30“ und „Hilti“ · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp.
- Status: offen
- Unsicherheit: keine

### E-START-005 · Rückmeldezusage „Binnen 24 Stunden“
- Kategorie: Vertrauen
- Quelle: ALT-START-014 · app/page.tsx:203-209 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp
- Zustand: verloren (+ Gegenstück im Ausgangsstand: NEU-START-86 „Sabri Demir meldet sich schnellstmöglich bei dir.“, NEU-BEW-17, NEU-DANKE-08 (Fakt `quickResponse`))
- Aufgabe: Bewerber erfährt, wie schnell eine Antwort kommt; nimmt die Sorge, dass sich niemand meldet.
- Wesenskern: Altstand: Kachel „Rückmeldung · Binnen 24 Stunden · 100 Prozent diskret“; dieselbe Zusage in der Einleitung („mit garantierter persönlicher Rückmeldung binnen 24 Stunden“), im Funnel („… meldet sich werktags innerhalb von 24 Stunden diskret bei Dir.“, Knopf „Unverbindlich anfragen mit Rückmeldung unter 24 Stunden“), in der Erfolgsansicht und im Schnellformular. Die Zeitangabe ist nicht bestätigt (docs/operations/fakten-abgleich.md A4, ROADMAP §13; sicherer Standard „Wir melden uns schnellstmöglich“). „100 Prozent diskret“ bleibt belegt (Fakt `discretion`).
- Freiraum: Sobald der Owner die Zeitangabe bestätigt: als Kennzahl oder Kachel; bis dahin nur „schnellstmöglich“.
- Bindungen: Fakt `quickResponse` (eine Stelle); dieselbe Zusage in E-Mail-Bestätigung, Danke-Seite (NEU-DANKE-08), Flow und CTA-Band: eine Änderung muss überall gleichzeitig erfolgen.
- Priorität: Soll – Grund: vertrauensbildend, aber ohne Bestätigung nicht aussprechbar.
- Entscheidung: Zurückstellen (Owner-Frage A4: Soll „24 Stunden“ wieder versprochen werden?)
- Ziel in der Plattform: Nach Freigabe: `FACTS.quickResponse` ändern, kein neues Bauteil.
- Gestaltung: folgt KERN (P2).
- Abnahme: Nach Freigabe: dieselbe Zusage in Hero, CTA-Band, Danke-Seite und Bestätigungs-E-Mail · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__09.webp.
- Status: offen
- Unsicherheit: keine (offene Owner-Frage)

### E-START-006 · Hero-Aktionen: Bewerben und Bewerberportal
- Kategorie: Navigation
- Quelle: ALT-START-015, 017 · app/page.tsx:214-222, 230-236 · Bild: belege/p0-altstand/alt-start__d1440-light__02.webp (Knöpfe am oberen Rand)
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-06 Knopf „Jetzt bewerben“ (→ /bewerbung), NEU-START-07 Link „Offene Stellen ansehen“ (→ #stellen), NEU-START-08 Mikrotext)
- Aufgabe: Die Hauptaktion: in einem Tipp zur Bewerbung.
- Wesenskern: Altstand: roter Knopf „Jetzt in 60 Sekunden bewerben“ (Anker `#express-funnel`, Pfeil im Kreis) und Link „Bewerberportal“ (→ /bewerbung, der 4-Wege-Hub). Ausgangsstand: ein Hauptknopf „Jetzt bewerben“ mit Mikrotext „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“, Ziel direkt der eine Flow; den 4-Wege-Hub „Bewerberportal“ gibt es nicht mehr, deshalb auch kein Ziel dafür.
- Freiraum: Knopftext darf „in 60 Sekunden“ wieder enthalten; Pfeil und Bewegung.
- Bindungen: Link `/bewerbung` (mit `?stelle=`); `data-primary-cta` blendet die Sticky-Leiste aus; Anker `#express-funnel` siehe E-START-052.
- Priorität: Muss – Grund: Bewerbungs-Hauptaktion mit Geschäftswert.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/Hero.tsx.
- Gestaltung: folgt KERN (P2); vorläufige Idee: Knopftext „Jetzt in 60 Sekunden bewerben“, ein Pfeil, der beim Hover einen Schritt geht.
- Abnahme: Klick auf den Hauptknopf führt mit einer Navigation zum ersten Schritt des Flows (Playwright, ohne Absenden) · Bildpaar belege/p0-altstand/alt-start__d1440-light__02.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp.
- Status: offen
- Unsicherheit: keine

### E-START-007 · Direktweg „Lebenslauf direkt hochladen“
- Kategorie: Funktion
- Quelle: ALT-START-016 · app/page.tsx:223-229 · Bild: belege/p0-altstand/alt-start__d1440-light__02.webp
- Zustand: verloren (+ Gegenstück im Ausgangsstand: nur indirekt: NEU-DANKE-26/27/28 „Unterlagen schicken“ per WhatsApp oder E-Mail, NEU-BEW-34 „Lieber mit kompletter Bewerbungsmappe?“, NEU-MAPPE-01…; Upload-Bucket `application-files` in supabase/ (Phase 2, nicht angeschlossen))
- Aufgabe: Bewerber mit fertigem Lebenslauf geben ihre Unterlagen direkt ab, statt Fragen zu beantworten.
- Wesenskern: Link „Lebenslauf direkt hochladen“ (→ `/bewerbung?tab=vault`) mit Upload-Symbol. Im Altstand wurde nichts hochgeladen: die Dokumente blieben im Browser (ROADMAP §1). Das Wesen ist „Unterlagen einreichen können“; ehrlich möglich erst mit Phase 2 (signierte Upload-URLs in Supabase Storage, ROADMAP §8).
- Freiraum: Form frei; bis Phase 2 nur ein Verweis auf „Unterlagen nachreichen“ oder die Mappe, kein Versprechen eines Uploads.
- Bindungen: Eingehende Links `/bewerbung?tab=vault` landen im Ausgangsstand im Flow (HTTP 200, per `curl` geprüft; nur `?tab=dossier` wird zu /bewerbung/mappe umgeleitet); Upload-Schnittstelle liegt bei der Session „Supabase-Vollintegration“ (ROADMAP §8.1).
- Priorität: Soll – Grund: Komfort mit Geschäftswert, aber an Phase 2 gebunden.
- Entscheidung: Verschmelzen (Textlink „Lieber mit Unterlagen bewerben?“ → Mappe, später Upload im Flow; kein zweiter Hero-Knopf, ROADMAP §5: eine Primäraktion)
- Ziel in der Plattform: components/apply/FlowShortcuts.tsx und Danke-Seite; Startseite höchstens ein Textlink unter dem Hauptknopf.
- Gestaltung: folgt KERN (P2).
- Abnahme: Von `/` aus ist „Unterlagen einreichen“ in höchstens zwei Klicks erreichbar; vor Phase 2 steht kein Wort „Upload“ ohne Funktion · Bildpaar belege/p0-altstand/alt-start__d1440-light__02.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp.
- Status: offen
- Unsicherheit: Ja: Ob die Startseite überhaupt einen zweiten Einstieg zeigen soll, ist eine Produktentscheidung (OFFENE FRAGE); Voraussetzung Upload (Phase 2).

### E-START-008 · Zitatkarte Sabri Demir: Person und „Direkte Betreuung“
- Kategorie: Vertrauen
- Quelle: ALT-START-019–020 · app/page.tsx:245-256 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-54 Lead „Kurze Wege: Du stimmst dich direkt mit Geschäftsführer Sabri Demir ab.“, NEU-START-55/56 Zitat mit Kreis „SD“, „Sabri Demir“, „Geschäftsführer und Meister“, NEU-START-86)
- Aufgabe: Ein Gesicht zum Chef: Handwerker wollen wissen, mit wem sie reden und dass sie direkt betreut werden.
- Wesenskern: Kopfzeile mit Initialen „SD“, „Diplomingenieur Sabri Demir“, „Inhaber und Werkstattleitung“ und Badge „Direkte Betreuung“. Der Titel ist in den Quellen uneinheitlich (A5): „Inhaber und Werkstattleitung“ (Altstand-Hero), „Geschäftsführer und Meister“ (lib/data/team.ts, Standard bis zur Klärung), „Geschäftsführer und Diplomingenieur“ (Layout, Config). Die Doppelrahmen-Karte selbst (ALT-START-018) ist reine Dekoration.
- Freiraum: Ort (Hero oder Über uns), Monogramm als Schrift, Badge-Form.
- Bindungen: `COMPANY.managingDirector`, `TEAM_QUOTES.demir`; docs/operations/fakten-abgleich.md A5.
- Priorität: Muss (korrigiert nach E-014; vorher Soll) – Grund: Vertrauen durch Person; Inhalt vorhanden.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/AboutSection.tsx (bestehend).
- Gestaltung: folgt KERN (P2); vorläufige Idee: Name und Satz zur direkten Betreuung als ruhige Signatur unter dem Zitat.
- Abnahme: Name, Rolle und der Satz zum direkten Draht stehen auf `/` · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__07.webp.
- Status: offen
- Unsicherheit: keine

### E-START-009 · Hero-Zitat „Wir suchen keine standardisierten Bewerbungsmappen …“
- Kategorie: Vertrauen
- Quelle: ALT-START-021 · app/page.tsx:259-261 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp
- Zustand: verloren (+ Gegenstück im Ausgangsstand: keines; anderes Zitat NEU-START-55 („Ein guter Chef sitzt nicht im Elfenbeinturm …“), Botschaft „kein Papierkram“ in NEU-START-80 (FAQ 2) und NEU-START-08)
- Aufgabe: Die Stimme des Chefs senkt die Hemmschwelle: gesucht sind echte Handwerker, keine perfekten Mappen.
- Wesenskern: „Wir suchen keine standardisierten Bewerbungsmappen mit perfekten Zeugnissen, sondern echte Handwerker und Macher, die ihr Handwerk schätzen und in einem verlässlichen, kollegialen Team ohne Hektik arbeiten wollen.“ (kursiv, in Anführungszeichen, Sabri Demir zugeschrieben). Freigegeben sind im Repo nur die vier Zitate in lib/data/team.ts (ROADMAP §1); dieser Satz steht nur im alten page.tsx.
- Freiraum: –
- Bindungen: Zitate nur aus freigegebener Quelle (lib/data/team.ts, lib/content/team.ts); Anzeige in AboutSection.
- Priorität: Kann – Grund: Botschaft anderweitig vorhanden, Zitat nicht belegt.
- Entscheidung: Zurückstellen (Freigabe durch Sabri Demir offen)
- Ziel in der Plattform: Nach Freigabe: lib/data/team.ts als zweites Demir-Zitat, Anzeige in components/home/AboutSection.tsx.
- Gestaltung: folgt KERN (P2).
- Abnahme: Nur nach Freigabe: Zitat wörtlich, mit Name · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__07.webp.
- Status: offen
- Unsicherheit: keine (offene Owner-Frage)

### E-START-010 · Hero-Checkliste und Teamgröße (Vertrauenspunkte der Zitatkarte)
- Kategorie: Vertrauen
- Quelle: ALT-START-022–025, 027 · app/page.tsx:265-281, 289-292 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: zerlegt: 022 → NEU-START-51 und -79 (Diskretion, ab dem Abschnitt Ablauf); 023 → NEU-START-34/35 und -12; 024 → NEU-START-57/58 (Partner-Säulen); 025 → NEU-START-44; 027 → NEU-START-53 „15 Leute“)
- Aufgabe: Vier Beweispunkte und die Teamgröße im Erstblick.
- Wesenskern: „100 Prozent diskrete Kontaktaufnahme ohne Risiko“ · „Feste Baustellen im Lahn Dill Kreis (keine Montagen)“ · „Zertifizierter Fachpartner für Buderus, Bosch, NIBE, Alpha Innotec & Viessmann“ · „Meilenstein 2026: Neuer Hauptstandort Siegmund-Hiepe-Str. 20 (Wetzlar) mit modernem Büro, großem Lager & 15 Mitarbeitern. Führender Wärmepumpen-Spezialist & Fachbetrieb des Lahn-Dill-Kreises.“ · Kennzahl „15 Mitarbeiter“. Befund: „Zertifizierter Fachpartner“ für alle fünf Marken ist im Code nicht belegt; belegt ist die abgestufte Fassung der Partner-Säulen (lib/data/company.ts, NEU-START-58), nur diese gilt; „Führender“ ist offen (B14). Die Inhalte leben, verloren ist die Bündelung im Erstblick; vor allem die Diskretion steht im Ausgangsstand erstmals im Abschnitt Ablauf, im Hero fehlt sie.
- Freiraum: Als Liste im Hero oder verteilt; die Zahl „15“ nur aus `employees15`.
- Bindungen: Fakten `employees15`, `partners5`, `radius35`, `discretion`; fakten-abgleich B3 (Zählung der Partner-Säulen), B14 („führend“).
- Priorität: Muss (korrigiert nach E-014; vorher Soll) – Grund: belegte Vertrauenspunkte, bis auf die Platzierung vorhanden.
- Entscheidung: Verschmelzen (Diskretion, Partner und 1926 in die Vertrauenszeile E-START-021)
- Ziel in der Plattform: Vertrauenszeile unter dem Hero (E-START-021); AboutSection, RegionSection und ProcessTimeline bleiben Fundorte.
- Gestaltung: folgt KERN (P2).
- Abnahme: Jede der fünf Aussagen ist auf `/` per Textsuche auffindbar, „Diskretion“ oder „vertraulich“ schon oberhalb von #ablauf; „Zertifizierter Fachpartner für … Alpha Innotec & Viessmann“ steht nicht in dieser Pauschalform · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__05.webp, belege/p0-ausgangsstand/start__d1440-light__07.webp.
- Status: offen
- Unsicherheit: keine

### E-START-011 · Innungs- und Kammer-Siegel (Innungsbetrieb, HWK Wiesbaden)
- Kategorie: Vertrauen
- Quelle: ALT-START-028 · app/page.tsx:293-296 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: Innung nur im Fuß (components/site/SiteFooter.tsx: „© 2026 Bad und Energie GmbH Lahn Dill · HRB 2449 Amtsgericht Wetzlar · Innung Sanitär-, Heizungs- und Klimatechnik Lahn-Dill“, siehe belege/p0-ausgangsstand/start__d1440-light__10.webp); Handwerkskammer nur im Impressum (components/legal/legal-data.ts); auf der Startseite im Text nirgends)
- Aufgabe: Besucher: der Betrieb ist ordentlich eingetragen und Innungsmitglied, ein Zeichen für Seriosität und Handwerksqualität.
- Wesenskern: Altstand Kennzahl „100% · Innungsbetrieb“: die „100%“ sind sinnlos (Mitgliedschaft hat keine Prozent); die Aussage „Innungsbetrieb“ ist belegt (companyData.innung; Schreibweise des Innungsnamens offen, B24). „Eingetragen in die Handwerksrolle der Handwerkskammer Wiesbaden“ steht im Altstand nur im Fuß (ALT-SHELL-48, Paket P1-REST-03) und ist im Repo nicht nachgewiesen; das Impressum nennt die zuständige Kammer. Die Pflicht-Kandidatenliste nennt „Trust-Leiste (HWK Wiesbaden, Innung, 1926)“: im Altstand steht HWK nicht in der Trust-Leiste der Startseite (diese hat sieben andere Einträge, E-START-021).
- Freiraum: „Innungsbetrieb“ als Wort statt Prozentkachel; Reihenfolge; Kammer nur, wenn die Aussage belegt ist.
- Bindungen: `COMPANY.innung`, `COMPANY.hwk`; Impressum (Pflichtangaben, nie zurückstellen, P1-REST-03).
- Priorität: Muss – Grund: belegtes Vertrauenselement.
- Entscheidung: Verschmelzen (Innungszugehörigkeit als Zeile in die Vertrauenszeile E-START-021; Kammer nur nach Beleg)
- Ziel in der Plattform: Vertrauenszeile unter dem Hero (E-START-021) oder AboutSection.
- Gestaltung: folgt KERN (P2); vorläufige Idee: Siegelzeile aus Schrift „Innungsbetrieb · Seit 1926“.
- Abnahme: `/` nennt „Innung“ oberhalb des Footers; vor „Innungsbetrieb“ steht keine Prozentzahl · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__10.webp.
- Status: offen
- Unsicherheit: Ja: Ob „Eingetragen in die Handwerksrolle der Handwerkskammer Wiesbaden“ belegt ist (nur das Impressum nennt die Kammer).

### E-START-012 · Express-Bewerbung im Einstieg (Funnel)
- Kategorie: Funktion
- Quelle: ALT-START-030–031, 040–044, 050, 059–064, 070–075, 077–084, 086, 088 · components/HeroExpressFunnel.tsx:55, 112-168, 187, 254-320, 353-360, 418-460, 534-575, 595-677, 698-704, 722-730; app/page.tsx:23-44 · Bild: belege/p0-altstand/alt-start__d1440-light__02.webp (nur Schritt 1 sichtbar; Schritte 2–4 nicht fotografiert)
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: ApplyFlow auf /bewerbung (NEU-BEW-01…44), eingebettet auf jeder Stellenseite (NEU-STELLEN-T13), Erfolg NEU-DANKE; die Startseite verlinkt nur: NEU-START-06/52/87)
- Aufgabe: Besucher bewerben sich ohne Anschreiben in 60 bis 120 Sekunden; das Unternehmen erhält Stelle, Erfahrung, Starttermin und Kontakt.
- Wesenskern: Vier Schritte mit Auswahlkarten und Vorwahl (Vorwahlen kommen nicht zurück, E-START-018). Schritt 1 „Welche Fachrichtung spricht Dich am meisten an?“ / „Wähle Deine angestrebte Rolle bei der Bad und Energie GmbH in Wetzlar.“ mit „Anlagenmechaniker SHK m w d“, „Kundendiensttechniker Wärmepumpe“, „Auszubildender SHK Start 2026“, „Quereinsteiger und Montagehelfer“; Erfahrung „Unter 2 Jahren Berufseinstieg“ · „2 bis 5 Jahre“ · „Über 5 Jahre Praxiserfahrung“; Starttermin „Sofort oder flexibel“ · „In 1 bis 2 Monaten Kündigungsfrist“ · „Nach Absprache“; Kontakt „Wie dürfen wir Dich unverbindlich kontaktieren?“ mit „Dein Vorname und Nachname *“, „Telefonnummer oder WhatsApp *“, „Wohnort oder PLZ“, „E Mail Adresse (für Eingangsbestätigung)“ und „Bevorzugter Kontaktweg“ (WhatsApp kurz und unkompliziert · Telefonat nach Feierabend · Per E Mail); Pflichtfehler „Bitte Name und Telefonnummer angeben für die diskrete Rückmeldung.“; Weiter-Knöpfe „Weiter zu Kenntnissen und Lizenzen“, „Weiter zu Wünschen und Arbeitszeiten“, „Letzter Schritt: Schneller Kontakt“, Absenden „Unverbindlich anfragen mit Rückmeldung unter 24 Stunden“ (Knopf `btn-crimson-glow` mit Hover-Hebung, Schatten und Aktivzustand, app/globals.css:155-170, siehe E-START-054). Ausgangsstand deckt: Stelle wählen (alle vier Stellen, Quereinstieg, „Initiativ bewerben“), Erfahrung in fünf Stufen, Start in drei Stufen („In 1–3 Monaten (Kündigungsfrist)“), Name, Telefon (Pflicht), Kontaktweg (WhatsApp · Anruf · E-Mail), E-Mail optional, ehrliches Absenden mit Fehlerpanel und WhatsApp-Rückfall. Nicht im Flow: Wohnort oder PLZ (kommt als Ergänzung auf der Danke-Seite, NEU-DANKE-19); Starttermin „Nach Absprache“ heißt dort „Später / weiß ich noch nicht“. Die Platzhalter und erfundenen Daten dieses Funnels: E-START-018.
- Freiraum: Zahl der Schritte, Auto-Weiter, Reihenfolge; die erste Frage („Für welche Stelle interessierst du dich?“) darf wieder im Hero stehen (ApplyFlow kennt die Variante `embedded`; der eingebettete Hero-Funnel entfiel bewusst, ROADMAP §5, „eine Primäraktion pro Bildschirm“).
- Bindungen: POST `/api/bewerbung` (neuer Vertrag, lib/applications/schema.ts; der Funnel-Vertrag von früher gilt nicht mehr); Anker `#express-funnel` (E-START-052); Altlinks `?tab=…` (E-START-007); der alte localStorage-Schlüssel `bad_energie_dossier` wird einmalig gelöscht (lib/apply/storage.ts `removeLegacyDossier`).
- Priorität: Muss – Grund: der Bewerbungsweg selbst (Geschäftswert).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/apply/ApplyFlow.tsx (/bewerbung, /jobs/[slug]); auf der Startseite Hero-, Ablauf- und CTA-Knöpfe.
- Gestaltung: folgt KERN (P2); vorläufige Idee: die erste Frage als Auswahlkarten im Hero, Weiter ohne Seitenwechsel.
- Abnahme: Von `/` bis zum Absenden-Knopf in höchstens drei Taps plus Name und Telefon (Playwright, Absenden gesperrt); bei 503 erscheint der WhatsApp-Rückfall statt Erfolg · Bildpaar belege/p0-altstand/alt-start__d1440-light__02.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp.
- Status: offen
- Unsicherheit: keine

### E-START-013 · Passungs-Rahmung „Finde heraus, ob Bad und Energie GmbH zu Dir passt“
- Kategorie: Inhalt
- Quelle: ALT-START-032–033 · components/HeroExpressFunnel.tsx:192-198 · Bild: belege/p0-altstand/alt-start__d1440-light__02.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-08 Mikrotext „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“, NEU-BEW-04 „Für welche Stelle interessierst du dich?“; die Haltung „herausfinden, ob es passt“ fehlt)
- Aufgabe: Statt „Bewerbung“ ein unverbindlicher Passungs-Check: senkt die Hemmschwelle für Wechselwillige, die nur schauen wollen.
- Wesenskern: Pille „120 Sekunden Expressbewerbung ohne Anschreiben“ (roter Punkt) und H2 „Finde heraus, ob Bad und Energie GmbH zu Dir passt“; dieselbe Haltung im Schluss: „… lass uns ganz ungezwungen herausfinden, ob wir zueinander passen.“ (ALT-START-358). Die „120 Sekunden“ sind überholt (B4: ca. 60 Sekunden).
- Freiraum: Wortlaut in Du-Form („Finde heraus, ob wir zu dir passen“), Zeitangabe „ca. 60 Sekunden“, kein roter Punkt.
- Bindungen: Fakt `apply60s` für die Zeitangabe; keine Zusage „120 Sekunden“.
- Priorität: Soll – Grund: prägender Ton des Altstands; Wirkung auf die Konversion nicht gemessen (Vermutung).
- Entscheidung: Neu interpretieren
- Ziel in der Plattform: HERO.microcopy (components/home/content.ts) und Überschrift über dem ersten Flowschritt.
- Gestaltung: folgt KERN (P2); vorläufige Idee: der Mikrotext unter dem Hauptknopf spricht vom Herausfinden statt vom Bewerben.
- Abnahme: Auf `/` oder über dem ersten Flowschritt steht eine Passungs-Formulierung, die Zeitangabe lautet 60 Sekunden · Bildpaar belege/p0-altstand/alt-start__d1440-light__02.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp.
- Status: offen
- Unsicherheit: keine

### E-START-014 · Fortschrittsanzeige des Funnels (Zähler, Balken, Schrittnamen)
- Kategorie: Bewegung
- Quelle: ALT-START-034–039 · components/HeroExpressFunnel.tsx:200-237 · Bild: belege/p0-altstand/alt-start__d1440-light__02.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-BEW-02 „Schritt n von m“ mit Balken (components/ui/StepHeader.tsx: `scaleX`, 220 ms, `role=progressbar`))
- Aufgabe: Zeigt, wie viel noch kommt; senkt den Abbruch mitten im Ablauf.
- Wesenskern: „Fortschritt · Schritt 1 von 4“; Balken 25/50/75/100 % mit Verlauf Rot → Blau (0,35 s, Easing [0.16, 1, 0.3, 1]); Schrittnamen „1. Position · 2. Kenntnisse · 3. Konditionen · 4. Kontakt“ (aktiv hervorgehoben, erledigt grün, nicht klickbar). Ausgangsstand: Zähler und Balken, keine Schrittnamen (bei drei bis vier Schritten nicht nötig).
- Freiraum: Bewegung des Balkens (Federung), Schrittnamen optional.
- Bindungen: ARIA `progressbar`; `prefers-reduced-motion`.
- Priorität: Soll – Grund: Bewegung mit Funktion.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/ui/StepHeader.tsx.
- Gestaltung: folgt KERN (P2); vorläufige Idee: Balken wächst mit leichter Trägheit (Veredelung P3).
- Abnahme: Im Flow zeigt der Kopf „Schritt n von m“, der Balken wächst je Schritt, bei reduzierter Bewegung ohne Übergang · Bildpaar belege/p0-altstand/alt-start__d1440-light__02.webp / belege/p0-ausgangsstand/bewerbung__d1440-light__01.webp.
- Status: offen
- Unsicherheit: keine

### E-START-015 · Profilfragen im Funnel: Berufsstatus und Kenntnisse
- Kategorie: Interaktives
- Quelle: ALT-START-045–049, 051–057 · components/HeroExpressFunnel.tsx:326-347, 376-415 · Bild: belege/p0-altstand/alt-start__d1440-light__02.webp (nur der Berufsstatus sichtbar)
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: Erfahrung → NEU-BEW-12 „Was trifft auf dich zu?“; Kenntnisse nur als „Schwerpunkte“ in der Mappe (NEU-MAPPE-11/12); „in fester Anstellung?“ nirgends)
- Aufgabe: Das Unternehmen erfährt das Qualifikationsprofil und ob jemand noch angestellt ist (Diskretion); der Besucher fühlt sich gesehen.
- Wesenskern: Frage „Wie ist Dein aktueller Berufsstatus?“ mit „In fester Anstellung“ · „Ausgelernter Geselle“ · „Meister oder Techniker“ · „Schüler oder Azubi“; Frage „Welche Praxiserfahrung bringst Du mit?“ / „Wähle alle Bereiche aus, in denen Du bereits selbstständig oder mit Kollegen gearbeitet hast.“ mit sechs Mehrfachauswahlen: „Wärmepumpen (Buderus, Bosch, NIBE, Alpha Innotec, Viessmann)“ · „Moderne Badsanierung und Vorwandtechnik“ · „Gasbrennwert und Heizungsmodernisierung“ · „Führerschein Klasse B oder BE Transporter“ · „Trinkwasserhygiene und CONEL Filtertechnik“ · „Fehlerdiagnose und elektrische Anbindung“. Die Vorwahl zweier Kenntnisse kommt nicht zurück (E-START-018).
- Freiraum: Der Pflichtpfad bleibt kurz (ROADMAP §2: zwei Taps plus Name und Telefon): die Kenntnisse gehören als freiwillige Ergänzung nach dem Absenden, nicht in den Pflichtweg.
- Bindungen: Option-IDs der Antworten nie umbenennen, nur ergänzen (lib/apply/questions.ts, lib/applications/schema.ts); Mappe-Daten `skills` (lib/mappe/*); Ergänzungs-API `/api/bewerbung/ergaenzung` kennt bisher Start, PLZ, Nachricht und Mappe; Erweiterung des Vertrags nur nach Absprache (ROADMAP §8.1).
- Priorität: Soll – Grund: Vorqualifizierung und Besuchernutzen, nicht kritisch.
- Entscheidung: Verschmelzen (freiwillige Kenntnis-Chips unter „Möchtest du noch etwas ergänzen?“ auf der Danke-Seite)
- Ziel in der Plattform: components/apply/thanks/FollowUpForm.tsx, Daten aus lib/mappe.
- Gestaltung: folgt KERN (P2).
- Abnahme: Nach dem Absenden lassen sich Kenntnisse antippen, die Bewerbung ist auch ohne sie vollständig · Bildpaar belege/p0-altstand/alt-start__d1440-light__02.webp / belege/p0-ausgangsstand/bewerbung-danke__d1440-light__01.webp.
- Status: offen
- Unsicherheit: keine

### E-START-016 · Wunsch-Vorteile im Funnel („Was ist Dir an Deinem neuen Arbeitgeber besonders wichtig?“)
- Kategorie: Interaktives
- Quelle: ALT-START-065–069 · components/HeroExpressFunnel.tsx:476-481, 486-529 · Bild: –
- Zustand: verloren (+ Gegenstück im Ausgangsstand: NEU-START-26…33 zeigt die Vorteile nur statisch)
- Aufgabe: Besucher wählt, was ihm wichtig ist, und sieht, dass die Firma genau das bietet; das Unternehmen sieht die Prioritäten.
- Wesenskern: Frage „Was ist Dir an Deinem neuen Arbeitgeber besonders wichtig?“ / „Wähle die Punkte, die für Deine Arbeitszufriedenheit den Ausschlag geben.“; vier Karten mit Unterzeile: „Geregelte Arbeitszeiten freitags ab 13:30 Uhr ins Wochenende“ · „Überdurchschnittlicher Lohn und Wertschätzung“ · „Eigener Firmenwagen und Hilti Werkzeug“ · „Feste Baustellen im Raum Wetzlar und Gießen“. Die Auswahl ging als Notiz „Ausgewählte Vorteile: …“ in die Team-E-Mail (zwei Karten vorgewählt).
- Freiraum: Als Auswahl im Konfigurator (E-START-024) statt im Funnel; nicht im Pflichtpfad.
- Bindungen: Fakten `friday1330`, `aboveTariff`, `hilti`, `vehicle`, `noFarAssembly`; Notizfeld der Bewerbung (E-Mail-Vorlage).
- Priorität: Soll (korrigiert nach E-014; vorher Kann) – Grund: Zusatzinteraktion; die Angaben sind kein Muss für das Team.
- Entscheidung: Verschmelzen (mit E-START-024: „Was ist dir wichtig?“ hebt die passenden Paketzeilen hervor)
- Ziel in der Plattform: Vorteils-Konfigurator (E-START-024).
- Gestaltung: folgt KERN (P2).
- Abnahme: Siehe E-START-024.
- Status: offen
- Unsicherheit: keine

### E-START-017 · Diskretionszusage und Sperrvermerk am Kontaktschritt
- Kategorie: Recht
- Quelle: ALT-START-076, 085, 087 · components/HeroExpressFunnel.tsx:592-594, 681-695, 706-719 · Bild: –
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-51 „Dein Wechsel bleibt vertraulich: Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber.“, NEU-BEW-36 (unter dem Flow), NEU-START-79 (FAQ 1), Fakt `discretion`, Datenschutz „Sperrvermerk für ungekündigte Fachkräfte“ (app/datenschutz/page.tsx:335-340); im Kontaktschritt selbst steht die Zusage nicht)
- Aufgabe: Wer noch angestellt ist, gibt seine Daten nur, wenn sicher ist, dass der Arbeitgeber nichts erfährt.
- Wesenskern: Eyebrow „Schnelle Diskretionsgarantie“; vorangehaktes Kästchen „Garantierter Sperrvermerk für ungekündigte Fachkräfte“ mit „Deine Bewerbung wird streng vertraulich nach § 26 BDSG behandelt. Dein aktueller Arbeitgeber erfährt zu keinem Zeitpunkt von dieser Interessensbekundung.“; Vertrauenszeile „100% kostenlos · Kein Anschreiben erforderlich · DSGVO und § 26 BDSG geschützt“. Wesen ist die Zusage. Der Bezug auf § 26 BDSG ist rechtlich offen (ROADMAP §9.7: EuGH C-34/21, Prüfung durch den Datenschutzbeauftragten) und kommt nicht zurück; „streng vertraulich“ ohne Rechtsbezug ist unkritisch. Ein Kästchen ist nicht mehr nötig: die Zusage gilt für alle.
- Freiraum: Wortlaut und Platz (eine Zeile am Kontaktschritt); das Kästchen entfällt.
- Bindungen: `DISCRETION_PROMISE` (lib/content/process.ts:92-93) und `getDiscretionPromise` (nicht bei Ausbildung); Datenschutztext; Rechtsformulierung beim Datenschutzbeauftragten.
- Priorität: Muss – Grund: Kernversprechen gegenüber Wechselwilligen, Rechtsnähe.
- Entscheidung: Verschmelzen (Zusage als Zeile im Kontaktschritt des Flows, nur Fachkraft und Quereinstieg, ohne § 26 BDSG)
- Ziel in der Plattform: components/apply/ContactStep.tsx (Zeile unter dem Absenden-Knopf), `DISCRETION_PROMISE`.
- Gestaltung: folgt KERN (P2).
- Abnahme: Kontaktschritt einer Fachkraftstelle zeigt die Zusage, der der Ausbildung nicht; kein „§ 26 BDSG“ im sichtbaren Text · Bildpaar Altstand nicht fotografiert / belege/p0-ausgangsstand/bewerbung__d1440-light__02.webp.
- Status: offen
- Unsicherheit: keine (Rechtsformulierung offen, siehe OFFENE FRAGEN)

### E-START-018 · Vorbelegte Angaben und erfundene Daten im Funnel
- Kategorie: Funktion
- Quelle: ALT-START-058 · components/HeroExpressFunnel.tsx:41-45, 156 (betrifft auch 55, 140-141, 610-662) · Bild: –
- Zustand: verloren (+ Gegenstück im Ausgangsstand: bewusst entfernt (ROADMAP §1): Ausgangsstand ohne Vorwahlen, E-Mail optional und nie erfunden, Erfolg nur nach HTTP 200 (NEU-BEW-31))
- Aufgabe: Keine: Fehlverhalten. Daten, die der Besucher nie gewählt hatte, gingen als seine Angaben ins Team-Postfach.
- Wesenskern: Nicht Wesen, sondern Gegenbeispiel: Startdatensatz mit Vorwahlen (Rolle Anlagenmechaniker, Status „In fester Anstellung“, Kenntnisse „Wärmepumpen …“ und „Moderne Badsanierung …“, „Führerschein Klasse B PKW“ (unsichtbar, aber mitgesendet, ALT-START-058), „2 bis 5 Jahre“, zwei Vorteile, „In 1 bis 2 Monaten Kündigungsfrist“, Wohnort „Wetzlar und Umgebung“, Kontaktweg WhatsApp, Sperrvermerk angehakt); Platzhalter „z.B. Alexander Koch“ (Name eines echten Mitarbeiters), „z.B. alexander.koch@beispiel.de“, „z.B. 0170 8892341“; bei leerer E-Mail die erfundene Adresse `bewerber.<Ziffern>@karriere.bad-energie.de`; Erfolgsmeldung „sicher und verschlüsselt“ unabhängig vom Serverergebnis.
- Freiraum: –
- Bindungen: Der alte Schlüssel `bad_energie_dossier` (localStorage) wird gelöscht; Regel für alle künftigen Varianten: keine Vorwahl von Angaben, keine Beispielperson, keine erfundene E-Mail, Erfolg nur nach echter Bestätigung.
- Priorität: Muss – Grund: Schutzregel gegen den Rückfall in erfundene Daten (Grundsatz des Auftrags).
- Entscheidung: Nicht zurückführen (erfunden/unbelegt)
- Ziel in der Plattform: –
- Gestaltung: –
- Abnahme: Test: Kontaktfelder des Flows leer, keine Vorauswahl, Platzhalter ohne Personennamen (`grep -rn "Alexander Koch" components app` liefert nur lib/data/team.ts).
- Status: offen
- Unsicherheit: keine

### E-START-019 · Konfetti nach dem Absenden
- Kategorie: Bewegung
- Quelle: ALT-START-089 · components/HeroExpressFunnel.tsx:169-181 · Bild: –
- Zustand: verloren (+ Gegenstück im Ausgangsstand: NEU-DANKE-01 gezeichneter Haken in grünem Kreis (components/apply/thanks/CheckMark.tsx, `@starting-style`, einmal); Paket `canvas-confetti` entfernt (a2f641d), ROADMAP §4 verbietet Konfetti)
- Aufgabe: Erfolgsmoment: „Geschafft“, Freude und Bestätigung nach dem Absenden.
- Wesenskern: Einmalige Partikel-Animation (120 Partikel, Streuung 70, Ursprung y 0,6; Farben #0369a1, #047857, #C51E1E, #0A1E3A) über dynamischen Import. Wesen ist ein einmaliger, spürbarer Belohnungsmoment, kein Dauereffekt; im Altstand kam es auch ohne Serverantwort (Fake-Erfolg). Die Erfolgsansicht selbst skaliert zusätzlich von 0,95 auf 1 (0,3 s, Korrektur zu ALT-START-090).
- Freiraum: Form frei (Schrift, SVG, Linie); nur nach echter Bestätigung; nicht bei reduzierter Bewegung.
- Bindungen: Nur nach HTTP 200 mit `ok: true`; `prefers-reduced-motion`; Bewegungs-JS ≤ 60 KB gzip (K-013).
- Priorität: Kann – Grund: Dekoration mit emotionaler Wirkung.
- Entscheidung: Neu interpretieren (ruhiger Höhepunkt aus Haken und Bewerbungsnummer, kein Konfetti)
- Ziel in der Plattform: components/apply/thanks/CheckMark.tsx und ThankYouView.tsx (Veredelung P3).
- Gestaltung: folgt KERN (P2); vorläufige Idee: der Haken zeichnet sich, die Bewerbungsnummer erscheint danach Zeichen für Zeichen.
- Abnahme: Danke-Seite zeigt den Haken einmal gezeichnet; bei reduzierter Bewegung sofort · Bildpaar Altstand nicht fotografiert / belege/p0-ausgangsstand/bewerbung-danke__d1440-light__01.webp (Zustand ohne Bewerbung).
- Status: offen
- Unsicherheit: keine

### E-START-020 · Erfolgsansicht nach der Express-Bewerbung
- Kategorie: Funktion
- Quelle: ALT-START-090–096 · components/HeroExpressFunnel.tsx:744, 752-798 · Bild: –
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-DANKE-02…11 (Danke mit Vorname, Bewerbungsnummer, „So geht es weiter“), NEU-DANKE-16 (Nummer speichern), NEU-DANKE-25 (Mappe); Zusammenfassung der Antworten fehlt: der Sitzungsdatensatz (lib/apply/storage.ts `SubmittedApplication`) hält nur Nummer, Token, Vorname, Stelle und Zeit)
- Aufgabe: Bestätigung und Orientierung: es hat geklappt, so geht es weiter.
- Wesenskern: Logo-Karte; „Vielen Dank, {Name}!“; „Deine Anfrage für die Stelle als {Rolle} ist sicher und verschlüsselt bei Geschäftsführer Sabri Demir eingegangen.“; „Wir melden uns innerhalb von 24 Stunden diskret über Deinen Wunschkanal (WhatsApp oder Telefon).“ (bei „Per E Mail“ trotzdem „Telefon“: Fehler); Profil-Box „Erfasstes Profil“ mit Position, Erfahrung, Starttermin; Knöpfe „Vollständiges DINA4 Dossier anzeigen“ (→ /bewerbung) und „Neues Profil starten“. Bewegung: die Karte skaliert beim Erscheinen von 0,95 auf 1 (0,3 s). Nicht zurück: „sicher und verschlüsselt“ (nicht belegt), „24 Stunden“ (E-START-005).
- Freiraum: Zusammenfassung „Deine Angaben“ in der Angaben-Karte der Danke-Seite; Satz zum Rückmeldeweg passend zur Wahl (WhatsApp, Anruf, E-Mail).
- Bindungen: sessionStorage `be:application:v1` (nur Browser-Sitzung); Danke-Seite ist `noindex`; Mappe unter /bewerbung/mappe.
- Priorität: Soll – Grund: Rückmeldung nach der Bewerbung stärkt das Vertrauen.
- Entscheidung: Verschmelzen (kleine Zusammenfassung der eigenen Angaben und des Rückmeldewegs in die Angaben-Karte)
- Ziel in der Plattform: components/apply/thanks/ThankYouView.tsx, lib/apply/storage.ts.
- Gestaltung: folgt KERN (P2).
- Abnahme: Nach dem Absenden zeigt die Danke-Seite Nummer, Stelle, Eingangszeit und den Rückmeldeweg der Auswahl · Bildpaar Altstand nicht fotografiert / belege/p0-ausgangsstand/bewerbung-danke__d1440-light__01.webp.
- Status: offen
- Unsicherheit: keine

### E-START-021 · Trust-Leiste unter dem Hero (Laufband mit sieben Vertrauenspunkten)
- Kategorie: Vertrauen
- Quelle: ALT-START-097–104 · components/trust/TrustStrip.tsx:8-25; app/page.tsx:311-313 · Bild: belege/p0-altstand/alt-start__d1440-light__03.webp (nur drei der sieben Einträge im Bild)
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: Inhalte leben: 1 → E-START-002; 2, 3 → NEU-START-57/58 (Partner-Säulen); 4 → NEU-START-10; 5 → NEU-START-29; 6 → NEU-START-30; 7 → NEU-START-11; verloren ist die Bündelung unter dem Hero (ROADMAP §5: „Entfällt auf der Startseite: TrustStrip-Marquee“); im Altstand waren ohnehin nur drei von sieben Punkten sichtbar)
- Aufgabe: Sofortiges Vertrauen direkt unter dem Hero: Meisterbetrieb, Herstellerpartner und Konditionen in einer Zeile (im Altstand wegen der stehenden Leiste nur zur Hälfte erfüllt).
- Wesenskern: Sieben Einträge wörtlich: „100 Jahre Meisterbetrieb (1926–2026)“ · „5 Partner-Säulen: Buderus, Bosch, NIBE, Alpha Innotec, Viessmann“ · „Fachbetriebspartner des Lahn-Dill-Kreises“ · „Freitags ab 13:30 Uhr ins Wochenende“ · „Persönliche Hilti Werkzeugausstattung“ · „Servicefahrzeug mit Privatnutzung“ · „30 Tage garantierter Urlaub“. Im Code ein Laufband (Klasse `animate-marquee`, Hover pausiert, Einträge doppelt im DOM ohne `aria-hidden`), im Altstand aber nicht definiert: die Leiste stand still, bei 1440 px waren nur drei der sieben Einträge sichtbar, die übrigen vier abgeschnitten (Korrektur zu ALT-START-097, Bild A03). Beschriftung „Garantierte Vorteile und Zertifizierungen“. Die Zählung „5 Partner-Säulen“ ist uneinheitlich (B3). Die Handwerkskammer steht nicht darin (E-START-011).
- Freiraum: Statische Zeile oder Raster statt Laufband; Reihenfolge; Reduktion auf belegte Kernaussagen; Innung und Diskretion dürfen dazukommen (E-START-010, E-START-011).
- Bindungen: Fakten `founded1926`/`anniversary100`, `partners5`, `countyPartner`, `friday1330`, `hilti`, `vehicle`, `vacation30`; jeder Fakt höchstens zweimal pro Seite; Marquee ist verboten (ROADMAP §4, Guard `check-design-tokens.mjs`).
- Priorität: Muss (korrigiert nach E-014; vorher Soll) – Grund: belegte Vertrauenselemente, alle Inhalte vorhanden; es fehlt nur die Bündelung im Erstblick.
- Entscheidung: Neu interpretieren (ruhige statische Vertrauenszeile, in der alle belegten Punkte sichtbar sind, kein Marquee)
- Ziel in der Plattform: neues Bauteil unter components/home (Zeile direkt unter Hero.tsx).
- Gestaltung: folgt KERN (P2); vorläufige Idee: eine Zeile Schrift mit Mittelpunkten, Partnernamen in Ziffernschrift, einmaliges Einblenden.
- Abnahme: Unter dem Hero stehen alle gewählten Aussagen sichtbar (nichts abgeschnitten) in höchstens zwei Zeilen (1440 px), kein Laufband, kein Fakt öfter als zweimal auf der Seite · Bildpaar belege/p0-altstand/alt-start__d1440-light__03.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp, belege/p0-ausgangsstand/start__d1440-light__02.webp.
- Status: offen
- Unsicherheit: keine

### E-START-022 · Stellenübersicht: Kopf
- Kategorie: Inhalt
- Quelle: ALT-START-106–109 · app/page.tsx:320-340 · Bild: belege/p0-altstand/alt-start__d1440-light__03.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-14 H2 „Offene Stellen“, NEU-START-15 „Jede Stelle mit Gehaltsspanne und allen Eckdaten.“, NEU-START-16 Link „Alle Stellen im Überblick“ (→ /jobs))
- Aufgabe: Der Kopf des Stellenmarkts lenkt die Auswahl.
- Wesenskern: Eyebrow „Aktuelle Stellen • Wetzlar und Lahn Dill Kreis“ (grüner Punkt pulsiert); H2 „Offene Stellen im Meisterteam“; „Wähle Deinen persönlichen Schwerpunkt. Alle Stellen bieten geregelte Arbeitszeiten (freitags ab 13:30 Uhr ins verdiente Wochenende), 30 Tage garantierten Erholungsurlaub […]“ (24 Wörter); Link „Zum 4 Wege Bewerberportal“ (→ /bewerbung). Ausgangsstand: kürzerer Kopf, dafür sichtbare Gehaltsspannen (Owner-Entscheidung).
- Freiraum: Eyebrow und Punkt entfallen; „im Meisterteam“ darf zurückkehren; der Link heißt nicht mehr „4 Wege“.
- Bindungen: Anker `#stellen` bleibt gleich; Link `/jobs`.
- Priorität: Soll – Grund: Orientierung; Inhalt vorhanden.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/JobList.tsx.
- Gestaltung: folgt KERN (P2).
- Abnahme: `/#stellen` zeigt die H2 „Offene Stellen“ und den Link zu /jobs · Bildpaar belege/p0-altstand/alt-start__d1440-light__03.webp / belege/p0-ausgangsstand/start__d1440-light__02.webp.
- Status: offen
- Unsicherheit: keine

### E-START-023 · Vier Stellenkarten mit Bewerbungsknopf
- Kategorie: Navigation
- Quelle: ALT-START-110–145 · app/page.tsx:347-541 · Bild: belege/p0-altstand/alt-start__d1440-light__03.webp, belege/p0-altstand/alt-start__d1440-light__04.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-17…21 (JobCards mit Gehaltsspanne, Link auf /jobs/<slug>); Stichpunkte auf den Stellenseiten NEU-STELLEN-A05/A06, B05/B06, C05/C06 und Ausbildung)
- Aufgabe: Teaser je Stelle mit direktem Weg zur Bewerbung.
- Wesenskern: Vier Karten, je mit Typ-Pille, Tarifzeile, Titel, Untertitel, Beschreibung, drei Stichpunkten und Knopf: „Stelle 01 · Vollzeit“ / „Über Tarif · Nach Qualifikation“ / „Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik m w d“ / Knopf „Als Anlagenmechaniker in 60 Sekunden bewerben“; „Stelle 02 · Spezialist“ / „Über Tarif · Top Facharbeiterlohn“ / „Kundendiensttechniker SHK / Servicemonteur m w d“ / „Als Kundendiensttechniker direkt bewerben“; „Stelle 03 · Führungskraft“ / „Über Tarif · Führungszulage“ / „Obermonteur / Projektleiter SHK & Badsanierung m w d“ / „Als Obermonteur / Projektleiter bewerben“; „Stelle 04 · Start August 2026“ / „Attraktive Vergütung · Übernahme“ / „Ausbildung zum Anlagenmechaniker SHK 2026 m w d“ / „Bewerbung als Auszubildender starten“. Ausgangsstand: Kurzname mit „(m/w/d)“, Zusammenfassung, „Vollzeit · Wetzlar + 35 km“, Gehaltsspanne 3.600–4.600 €, 3.800–4.900 €, 4.400–5.600 €, 1.050–1.400 € pro Monat, „Zur Stelle“. Alt-Aussagen mit Befund, die nicht mitkommen: „NIBE mit 7 Jahren Garantie“ bei den Werkszertifizierungen, „1%-Privatnutzung“ außerhalb der Obermonteur-Stelle (A2), „Start August 2026“ (B5), „Garantierte Festübernahme“ (A1, nur Ausbildung).
- Freiraum: Karte ohne Stichpunkte; Typ-Pille („Spezialist“, „Führungskraft“) kann als Meta zurückkehren; Knopf je Stelle darf „Als … bewerben“ lauten.
- Bindungen: `/jobs/<slug>` für vier Slugs, `/bewerbung?stelle=<slug>`; Registry (`isJobLive`, validThrough); pending-Fakten nur an den erlaubten Stellen (lib/content/facts.ts).
- Priorität: Muss – Grund: Stellen und URLs mit Suchwert, Bewerbungsweg.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/JobList.tsx, components/jobs/JobCard.tsx.
- Gestaltung: folgt KERN (P2).
- Abnahme: Vier Karten, jede verlinkt auf ihre Stellenseite, Gehaltsspanne gleich `job.salary` (Playwright) · Bildpaar belege/p0-altstand/alt-start__d1440-light__03.webp, belege/p0-altstand/alt-start__d1440-light__04.webp / belege/p0-ausgangsstand/start__d1440-light__02.webp.
- Status: offen
- Unsicherheit: keine

### E-START-024 · Vorteils-Konfigurator „Dein persönliches Mitarbeiter-Paket“
- Kategorie: Interaktives
- Quelle: ALT-START-147–185, 363 · app/page.tsx:551-558; components/pricing/SalaryCalculatorClientWrapper.tsx:5-12; components/pricing/SalaryCalculator.tsx:54-294; components/pricing/pricing.constants.ts:13-89 · Bild: belege/p0-altstand/alt-start__d1440-light__04.webp, belege/p0-altstand/alt-start__d1440-light__05.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-STELLEN-T09 „Dein Paket“ je Stelle (A06, B06, C…, D…), NEU-START-26…33; die Interaktion fehlt)
- Aufgabe: Besucher wählt Rolle, Erfahrung und Zusatzqualifikation und sieht sofort sein persönliches Paket; das Unternehmen zeigt Konditionen persönlich statt als Liste. ROADMAP §1: „Der Gehaltsrechner geht in die Stellenseiten über.“
- Wesenskern: Kopf „Dein Karriere-Paket & Ausstattungs-Check“, H2 „Welche Vorteile schaltest Du bei Bad & Energie frei?“, Einleitung „Wähle Deine Fachrichtung und Praxiserfahrung – entdecke sofort Dein persönliches Mitarbeiter-Paket mit Hilti Vollausstattung, Firmenwagen und Urlaubsanspruch.“; Rechner „Stelle Dein persönliches Mitarbeiter-Paket zusammen“: 1. Position (Anlagenmechaniker SHK · Kundendienstmonteur · Montagehelfer · Ausbildung SHK 2026), 2. Praxiserfahrung (Junggeselle / Aufsteiger 1–2 Jahre · Erfahrene Fachkraft 3–5 · Senior Monteur / Vorarbeiter > 5 · Meisterebene / Werkstattleitung) mit Hinweis je Stufe („Gezielte Vertiefung in Wärmepumpentechnik mit persönlichem Meistermentor“ · „Selbstständige Baustellenabwicklung ohne Mikromanagement & eigener Firmenwagen“ · „Höchste Tarifstufe, freie Projektgestaltung und Führungsverantwortung im Team“ · „Mitgestaltung der Betriebsplanung, direkte Zusammenarbeit mit Sabri Demir“), 3. Zusatzqualifikationen; Ergebnis „Dein Mitarbeiter-Paket“ („Unbefristeter Festvertrag“) mit „Freigeschaltete Arbeitsplatz-Vorteile“ (Mobilität, Werkzeug, Wochenendstart, Erholung, Digital), Knopf „Dieses Vorteils-Paket sichern (In 60 Sek.)“, Fußzeile „100% vertraulich · Ohne Anschreiben · Ohne Lebenslauf“. Rollenpakete (ALT-START-182…185) leben in den Stellen, z. B. „Fester Transporter mit Sortimo-Regalsystem, Mitnahme nach Hause möglich“, „Persönliche Hilti-22-V-Akku-Flotte und Pressbacken für Viega und Geberit“, „Fahrtkostenzuschuss zur Berufsschule und Zuschuss zum Pkw-Führerschein“. Die Rollenbeschreibungen (ALT-START-363, `ROLE_CONFIGS.label/description`: „Anlagenmechaniker SHK und Heizungsbauer“ – „Neubau, Modernisierung und Wärmepumpenmontage im Lahn-Dill-Kreis“; „Kundendienstmonteur und Servicetechniker“ – „Wartung, Inbetriebnahme und Diagnose mit eigenem Servicefahrzeug“; „Montagehelfer und Quereinsteiger“ – „Unterstützung auf der Baustelle mit Führerschein Klasse B“; „Auszubildender SHK ab August 2026“ – „3,5-jährige fundierte Ausbildung zum zukunftssicheren Anlagenmechaniker“) wurden im Konfigurator nicht gerendert (geprüft an SalaryCalculator.tsx:43-44, 111, 143, 159, 226-249: je Rolle liest er nur `tier`, `compensationTier`, `vehicle`, `tools`; die Rollenknöpfe tragen feste Beschriftungen); ihre Inhalte stehen in `summary` und `tasks` der Stellen. Ebenso nicht gerendert: die Stufenbezeichnungen `EXPERIENCE_MODIFIERS.label` („1 bis 2 Jahre Gesellenerfahrung“ · „3 bis 5 Jahre Fachpraxis“ · „Über 5 Jahre Fachpraxis“ · „Meister- oder Technikerabschluss“); je Stufe liest er nur `badge` und `levelDescription`, die Stufenknöpfe tragen feste Kurzangaben („1-2 Jahre“, „3-5 Jahre“, „> 5 Jahre“, „Meister/Tech.“). Nicht Teil des Wesenskerns, solange offen: die Zusatz-Perks „Zusätzliche Spezialisten-Zulage“ und „Monatliche Sauberkeits- und Kundenzufriedenheitsprämie“ (B11), „Gehaltszahlung am 1. Werktag“ (A3), „Garantiertes Urlaubs- und Weihnachtsgeld als feste Jahressonderzahlung“; die Badges „… freigeschaltet“ mit Haken sind eine Vorwahl-Anzeige, kein Beleg. „1:1 Privatnutzung“ (B7) und „7 Jahre Garantie“ entfallen. Stufenhinweise und Ladezustand (korrigiert nach P1-GEGEN-02; vorher: Hinweise ohne Beleg-Vermerk, Ladezustand nicht genannt): Die vier Stufenhinweise sind Altstand-Wortlaut, nicht Beleg (Altstand components/pricing/pricing.constants.ts:52-71, angezeigt in components/pricing/SalaryCalculator.tsx:158-160). Ohne Fakt oder Stellendaten sind „persönlicher Meistermentor“, „eigener Firmenwagen“ (Fahrzeug nur rollenbezogen, B7) und „Höchste Tarifstufe“ nicht belegt; sie kommen nicht als Aussage zurück. Belegte Entsprechungen gibt es im Ausgangsstand nur in zwei Obermonteur-Paketzeilen („Freie Baustellenorganisation ohne Mikromanagement“, „Mit Meister- oder Technikerabschluss gestaltest du die Betriebsplanung mit“; lib/jobs/data/obermonteur-projektleiter-shk.ts:57-58) und, für „Gezielte Vertiefung“, in der Anforderungszeile „Noch wenig Erfahrung mit Wärmepumpen? Das vertiefen wir gezielt mit dir.“ (lib/jobs/data/anlagenmechaniker-shk.ts:41), nicht für den Meistermentor. Ladezustand: „Vorteils-Paket wird vorbereitet...“ (ALT-START-150, Altstand components/pricing/SalaryCalculatorClientWrapper.tsx:10-14) kommt nicht zurück (Serverrendering, KERN K-011).
- Freiraum: Umschalter „Dein Paket nach Rolle“ (Anlagenmechaniker, Kundendienst, Obermonteur; korrigiert nach P1-GEGEN-02; vorher: Fachkraft, Kundendienst, Obermonteur, Ausbildung mit Erfahrungsfilter); die Ausbildung bleibt ein Verweis auf ihre Seite (befristet, ohne iPad, B9); ein Erfahrungsfilter entfällt, weil es dafür außer zwei Obermonteur-Zeilen keine belegten Stufendaten gibt; Daten nur aus `packageExtras` und Fakten; kein Rechnen mit Geld; „Was ist dir wichtig?“ (E-START-016) kann Zeilen hervorheben.
- Bindungen: Anker `#karriere-paket` und `#gehalt` (E-START-052); Daten lib/jobs/data/*.ts (`packageExtras`) und lib/content/facts.ts; Knopf → `/bewerbung?stelle=…`; die Haptik (`navigator.vibrate`) ist entfallen.
- Priorität: Soll – Grund: interaktives Element, zeigt Passung; Inhalt vorhanden.
- Entscheidung: Neu interpretieren
- Ziel in der Plattform: components/home/BenefitGrid.tsx; Rollen Anlagenmechaniker, Kundendienst, Obermonteur, weil `BenefitLead` „Für Fachkräfte“ sagt (components/home/BenefitGrid.tsx:34-47) und die Ausbildung nur verlinkt (befristet, ohne iPad, B9) – oder `BenefitLead` wird mit angepasst; Datenquelle ist `job.packageExtras` aus der Registry (lib/jobs/data/anlagenmechaniker-shk.ts:53-57, obermonteur-projektleiter-shk.ts:55-59; `PackageList` stellt nur dar, components/jobs/PackageList.tsx:13-26), als reine Daten vom Server an die Client-Insel (Client-Bundle-Regel scripts/qa/check-client-imports.mjs; lib/jobs/schema.ts bleibt unberührt, E-012) (korrigiert nach P1-GEGEN-02; vorher: components/home/BenefitGrid.tsx (Umschalter), Datenquelle components/jobs/PackageList.tsx und lib/jobs/data).
- Gestaltung: folgt KERN (P2); vorläufige Idee: Segmentsteuerung mit drei Rollen (korrigiert nach P1-GEGEN-02; vorher vier Rollen), darunter die Paketzeilen der gewählten Stelle und ein Knopf „Als … bewerben“.
- Abnahme: Rollenwechsel ändert die Paketzeilen ohne Seitenwechsel; jeder Satz stammt aus Stellendaten oder Fakten (Textvergleich im Test); pending-Fakten (`takeoverGuarantee`, `privateCarOnePercent`, `payFirstWorkday`) erscheinen nur bei den Stellen aus `onlyForJobIds`, `payFirstWorkday` nirgends (Test; eine neue Komponente außerhalb der Registry-Seiten würde den Registry-Test lib/jobs/__tests__/registry.test.ts:142, 146 sonst umgehen; lib/content/facts.ts:222-248, fakten-abgleich A1 bis A3) (korrigiert nach P1-GEGEN-02; vorher ohne Prüfung der pending-Fakten) · Bildpaar belege/p0-altstand/alt-start__d1440-light__05.webp / belege/p0-ausgangsstand/start__d1440-light__03.webp.
- Status: offen
- Unsicherheit: Ja: Ersetzt „Dein Paket“ je Stelle den Konfigurator vollständig, oder ist die Interaktion bewusst entfallen? ROADMAP §1 („Der Gehaltsrechner geht in die Stellenseiten über“) und §5.3 („Fasst Benefits, Ausstattung und Gehaltsrechner-Fakten zusammen“) sagen nichts über die Auswahl-Interaktion.

### E-START-025 · Vorteilskarten „Warum Handwerker aus Wetzlar & Gießen gern zu uns wechseln“
- Kategorie: Inhalt
- Quelle: ALT-START-188–196 · app/page.tsx:78-113, 569-594 · Bild: belege/p0-altstand/alt-start__d1440-light__06.webp, belege/p0-altstand/alt-start__d1440-light__07.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-23…33 „Das bekommst du“ mit acht Kacheln; Lücke: das Arbeitszeitfenster „Montag bis Donnerstag von 07:00 bis 16:45 Uhr“ und „Keine unbezahlten Überstunden“ (Fakten `workingHours` und `noUnpaidOvertime` existieren; die Zeiten stehen auf der Startseite nur als Öffnungszeiten im CTA-Band und im Fuß, nicht als Arbeitszeit), „Wiha“, die Wechselrahmung der Überschrift)
- Aufgabe: Sechs Gründe, warum Handwerker wechseln, in Karten.
- Wesenskern: Eyebrow „Warum Bad & Energie GmbH“; H2 „Warum Handwerker aus Wetzlar & Gießen gern zu uns wechseln“; „Wir wissen, dass Spitzenleistung nur mit besten Rahmenbedingungen, Respekt und verlässlichen Zusagen funktioniert.“; Karten: „Früher Feierabend am Freitag“ („Montag bis Donnerstag von 07:00 bis 16:45 Uhr und freitags bereits ab 13:30 Uhr direkt ins verdiente Wochenende. Keine unbezahlten Überstunden.“) · „30 Tage Urlaub und Top Vergütung“ · „Hilti Werkzeug und eigener Firmenwagen“ (mit „Hilti und Wiha“, „Vollständige Arbeitskleidung und Schutzausrüstung werden gestellt“) · „Eigenes iPad und Smartphone“ · „Zukunftssicher mit modernen Wärmepumpen“ · „Familiäres Meisterteam auf Augenhöhe“. Nicht mit: „pünktlichste Auszahlung“ (A3 unbestätigt), „Top Vergütung“ als Wort ohne Zahl. Die acht Neu-Kacheln decken Vergütung, Vertrag, Notdienst, Hilti, Fahrzeug, iPad, Schulungen und Team.
- Freiraum: Acht statt sechs Kacheln; die Wechselrahmung („…gern zu uns wechseln“) darf zurückkehren; die H2 „Das bekommst du“ ist Entscheidung der ROADMAP §5.3.
- Bindungen: Anker `#benefits` (alt) → `#vorteile` (E-START-052); Fakt-IDs in `BENEFIT_FACT_IDS`; jede Aussage höchstens zweimal.
- Priorität: Soll – Grund: Besuchernutzen; „pünktlich Feierabend“ ist das Markenversprechen.
- Entscheidung: Verschmelzen (Arbeitszeitfenster und „keine unbezahlten Überstunden“ in eine bestehende Kachel oder als neunte Zeile, ohne die Grenze von acht Kacheln zu sprengen)
- Ziel in der Plattform: BENEFIT_FACT_IDS in components/home/content.ts, components/home/BenefitGrid.tsx.
- Gestaltung: folgt KERN (P2).
- Abnahme: `/#vorteile` enthält „07:00“ und „unbezahlten Überstunden“, höchstens acht Kacheln · Bildpaar belege/p0-altstand/alt-start__d1440-light__06.webp, belege/p0-altstand/alt-start__d1440-light__07.webp / belege/p0-ausgangsstand/start__d1440-light__03.webp, belege/p0-ausgangsstand/start__d1440-light__04.webp.
- Status: offen
- Unsicherheit: keine

### E-START-026 · Ausstattung „Werkzeug & Fuhrpark: Nur das Beste für Dein Handwerk“
- Kategorie: Inhalt
- Quelle: ALT-START-198–204 · app/page.tsx:603-681 · Bild: belege/p0-altstand/alt-start__d1440-light__07.webp, belege/p0-altstand/alt-start__d1440-light__08.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: Hilti → NEU-START-29, Fahrzeug → NEU-START-30, iPad → NEU-START-31; Messtechnik fehlt (Fakt `measurementTools` existiert ungenutzt); der eigene Abschnitt, der Anker `#ausstattung` und der Navigationspunkt „Werkzeug und Fuhrpark“ (Shell, P1-REST-03) entfallen)
- Aufgabe: Handwerker entscheiden stark nach Werkzeug und Fahrzeug: ein eigener Abschnitt mit konkreten Geräten.
- Wesenskern: Eyebrow „Keine Kompromisse beim Equipment“; H2 „Werkzeug & Fuhrpark: Nur das Beste für Dein Handwerk“; „Schlechtes Werkzeug kostet Nerven und Zeit. Bei Bad & Energie GmbH arbeitest Du mit neuwertiger Profi Ausrüstung namhafter Hersteller.“; vier Karten: „Hilti 22V Akku Flotte“ („Persönlicher Akku Bohrhammer, Säbelsäge und elektrohydraulische Presszangen (Viega & Geberit). Kein Leihen, kein Warten.“) · „Sortimo Servicefahrzeug“ („Moderner Transporter mit ergonomischer Sortimo Fahrzeugeinrichtung. Nach Absprache feste Mitnahme nach Hause für direkte Baustellenanfahrt.“) · „Bosch Messtechnik“ („Digitale Abgasmessgeräte, Spülkompressoren und Kältemittel Füllstationen für moderne Wärmepumpen (Buderus Logatherm, Bosch Compress, NIBE, Alpha Innotec & Viessmann).“) · „iPad & Smartphone“ („… inklusive Datenflat“). Nicht belegt, kommen nicht mit: die Fußzeilen „100% Hilti Flottenmanagement“ und „Regelmäßige Werkskalibrierung“.
- Freiraum: Eigener Abschnitt oder Unterblock in `#vorteile` mit vier Zeilen; keine Herstellerlogos.
- Bindungen: Fakten `hilti`, `vehicle`, `measurementTools`, `ipadSmartphone`, `workwear`; Anker `#ausstattung` (E-START-052); Navigation „Werkzeug und Fuhrpark“ liegt bei P1-REST-03.
- Priorität: Soll – Grund: Besuchernutzen, konkreter als die Sammelkachel.
- Entscheidung: Verschmelzen (Unterblock „Werkzeug & Fuhrpark“ im Vorteilsraster, mit Messtechnik)
- Ziel in der Plattform: components/home/BenefitGrid.tsx und content.ts.
- Gestaltung: folgt KERN (P2); vorläufige Idee: vier Gerätezeilen mit großer Typografie und einem SVG-Piktogramm je Gerät.
- Abnahme: `/` nennt „Messtechnik“; `/#ausstattung` springt zum Unterblock · Bildpaar belege/p0-altstand/alt-start__d1440-light__07.webp, belege/p0-altstand/alt-start__d1440-light__08.webp / belege/p0-ausgangsstand/start__d1440-light__04.webp.
- Status: offen
- Unsicherheit: keine

### E-START-027 · Wechselprozess in drei Schritten mit Diskretion
- Kategorie: Inhalt
- Quelle: ALT-START-206–221, 223–225 · components/trust/ProcessSteps.tsx:11-95; app/page.tsx:698-714 · Bild: belege/p0-altstand/alt-start__d1440-light__08.webp, belege/p0-altstand/alt-start__d1440-light__09.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-46…52 (gleiche drei Schritte, gekürzt, Tags, Diskretionszusage, Knopf „Jetzt bewerben“))
- Aufgabe: Die Angst vor dem Wechsel nehmen: drei Schritte, diskret, ohne Papierkram.
- Wesenskern: Eyebrow „Einfach und ohne Bürokratie“; „In 3 Schritten zu Deinem neuen Handwerker Job“; „Wir respektieren Deine Zeit und Deine aktuelle Anstellung. Dein Wechsel zu Bad und Energie bleibt absolut vertraulich.“; 01 „Kurzer Kontakt in 60 Sekunden“ (Ohne Papierkram), 02 „Kaffee trinken auf Augenhöhe“ (100% Diskretion), 03 „Fester Vertrag und pünktlich Feierabend“ (Sicherer Start), je mit „Garantierter Schritt“; Link „Jetzt Schritt 1 starten (Bewerbung in 60 Sekunden)“; CTA-Leiste „Bereit für den diskreten ersten Schritt?“ / „Nutze jetzt die Expressbewerbung in 60 Sekunden ohne Anschreiben und ohne Lebenslauf.“ / „Jetzt Expressbewerbung starten“. Ausgangsstand: „Bewerben in 60 Sekunden“ · „Kennenlernen in der Werkstatt“ · „Start mit Werkzeug und Fahrzeug“, gleiche Tags, Zusage unter den Schritten. Der Ton der Alt-Titel („Kaffee trinken auf Augenhöhe“) ist schwächer, die Symbole je Schritt (Sprechblase, Tasse, Haken) fehlen, „Garantierter Schritt“ ist Garantiesprache ohne Beleg.
- Freiraum: Titel mit mehr Ton, Zeichnung je Schritt als SVG, Verbindungslinie zwischen den Schritten.
- Bindungen: Anker `#wechsel-prozess` → `#ablauf` (E-START-052); `getProcessSteps(audience)` (lib/content/process.ts); dieselbe Fachkraft-Variante auf den Stellenseiten.
- Priorität: Muss – Grund: Kernversprechen Diskretion gegenüber Wechselwilligen.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/ProcessTimeline.tsx.
- Gestaltung: folgt KERN (P2); vorläufige Idee: eine gezeichnete Linie verbindet die drei Ziffern.
- Abnahme: Drei Schritte, Diskretionszusage und ein Knopf zu /bewerbung stehen im Abschnitt `#ablauf` · Bildpaar belege/p0-altstand/alt-start__d1440-light__08.webp, belege/p0-altstand/alt-start__d1440-light__09.webp / belege/p0-ausgangsstand/start__d1440-light__06.webp.
- Status: offen
- Unsicherheit: keine

### E-START-028 · Einsatzgebiet: Überschrift und Versprechen
- Kategorie: Inhalt
- Quelle: ALT-START-227–229 · app/page.tsx:724-732 · Bild: belege/p0-altstand/alt-start__d1440-light__09.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-34 H2 „35 km um Wetzlar. Keine Fernmontage.“, NEU-START-35 Lead)
- Aufgabe: Zusage: kurze Wege, keine Fernmontage, abends zu Hause.
- Wesenskern: Eyebrow „Lokale Einsätze ohne Fernmontage“; H2 „Dein Einsatzgebiet im Herzen Mittelhessens“; „Keine kilometerlangen Fahrten oder Hotelübernachtungen. Du arbeitest direkt vor der Haustür in Wetzlar, Gießen und dem Lahn Dill Kreis und bist jeden Abend pünktlich zu Hause.“ Ausgangsstand: H2 „35 km um Wetzlar. Keine Fernmontage.“ und „Du arbeitest in Wetzlar, Gießen und dem Lahn-Dill-Kreis, ohne Hotelübernachtungen, und bist jeden Abend pünktlich zu Hause.“
- Freiraum: Wortlaut; „Herz Mittelhessens“ darf als Ton zurückkehren.
- Bindungen: Anker `#einsatzgebiet` bleibt gleich; Fakten `radius35`, `noFarAssembly`.
- Priorität: Muss – Grund: Kernversprechen (Fernmontage) und Ortsbezug.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/RegionSection.tsx, lib/content/region.ts.
- Gestaltung: folgt KERN (P2).
- Abnahme: `/#einsatzgebiet` zeigt die H2 und den Lead mit „Hotelübernachtungen“ · Bildpaar belege/p0-altstand/alt-start__d1440-light__09.webp / belege/p0-ausgangsstand/start__d1440-light__04.webp.
- Status: offen
- Unsicherheit: keine

### E-START-029 · Orts-Pillen („Wetzlar (Firmensitz)“, Gießen, Aßlar, Solms …)
- Kategorie: Inhalt
- Quelle: ALT-START-230–239 · app/page.tsx:117-126, 735-747 · Bild: belege/p0-altstand/alt-start__d1440-light__09.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-39/41/42 (zehn Orte als Auswahl und Tabelle mit km und Minuten); sieben Altnamen fehlen: Solms, Hüttenberg, Lahnau, Ehringshausen, Wettenberg, Biebertal, Hohenahr)
- Aufgabe: Besucher erkennt seinen Ort wieder („da arbeiten die auch“); Ortsnamen sind Suchbegriffe.
- Wesenskern: Zehn Pillen, nicht klickbar: „Wetzlar (Firmensitz)“ (hervorgehoben), „Gießen“, „Aßlar“, „Solms“, „Hüttenberg“, „Lahnau“, „Ehringshausen“, „Wettenberg“, „Biebertal“, „Hohenahr“. Belegt in lib/seo/site-config.ts (`serviceRegions`): Wetzlar, Hermannstein, Nauborn, Garbenheim, Steindorf, Dutenhofen, Münchholzhausen, Gießen, Wettenberg, Heuchelheim, Linden, Pohlheim, Biebertal, Aßlar, Solms, Braunfels, Ehringshausen, Hüttenberg, Lahnau, Herborn, Dillenburg, Schöffengrund. „Hohenahr“ steht nirgends sonst (B17) und kommt nicht zurück, bis der Owner antwortet. Orte ohne Eintrag in lib/data/locations.ts erhalten keine Entfernung und keine Fahrzeit.
- Freiraum: Eine Textzeile „Auch bei uns im Einsatz: …“ unter der Ortstabelle statt Pillen.
- Bindungen: `REGION.areas` (lib/content/region.ts), `areaServed` im Schema, docs/operations/fakten-abgleich.md B17.
- Priorität: Soll – Grund: Suchwert der Ortsnamen und Besuchernutzen.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: components/home/RegionSection.tsx (Textzeile), Daten aus `REGION.areas`.
- Gestaltung: folgt KERN (P2).
- Abnahme: `/` nennt „Solms“, „Lahnau“, „Hüttenberg“, „Biebertal“, „Wettenberg“ und „Ehringshausen“; „Hohenahr“ nicht · Bildpaar belege/p0-altstand/alt-start__d1440-light__09.webp / belege/p0-ausgangsstand/start__d1440-light__04.webp.
- Status: offen
- Unsicherheit: keine (Hohenahr: offene Owner-Frage B17)

### E-START-030 · Zentrale-Werkstatt-Karte („Zentrale Werkstatt & Logistiklager“)
- Kategorie: Inhalt
- Quelle: ALT-START-240–245 · app/page.tsx:753-785 · Bild: belege/p0-altstand/alt-start__d1440-light__09.webp
- Zustand: geschwächt (korrigiert nach E-014; vorher verloren) (+ Gegenstück im Ausgangsstand: Adresse im Fuß (components/site/SiteFooter.tsx); „größeres Lager“ im Meilenstein-Text NEU-START-44; sonst nichts)
- Aufgabe: Zeigt, wo man morgens startet und wie professionell der Betrieb aufgestellt ist (Werkstatt, Lager, Ausstellungspartner).
- Wesenskern: „Zentrale Werkstatt & Logistiklager“ · „Siegmund-Hiepe-Str. 20, 35578 Wetzlar“ · Badge „Optimal angebunden via B49 & A45“; „Kurze Rüstzeiten – Morgens Material direkt am Lager einladen oder direkte Anfahrt zur Baustelle bei Großprojekten.“; „Feste Partner Ausstellungen – Enge Kooperation mit ELEMENTS Wetzlar & Gießen für exklusive Bäder & Armaturen.“; „Qualitätsprodukte – Buderus, Bosch Home Comfort, NIBE, Alpha Innotec, Viessmann, VIGOUR, Kermi & Keuco.“ Offen: Bad-Partner uneinheitlich (B15: FAQ „ELEMENTS, VIGOUR, Kermi und Geberit“ gegen „VIGOUR, Kermi & Keuco“); „B49 & A45“ ist nur indirekt gestützt (lib/data/locations.ts nennt „Verbindung nach Gießen über die B49“ bei Dutenhofen und „an der A45“ bei Herborn).
- Freiraum: Kern sind Adresse und „Kurze Rüstzeiten“; die Partner- und Markenzeile erst nach Klärung von B15.
- Bindungen: `COMPANY.address`; B15; FAQ 3 (NEU-START-81).
- Priorität: Soll – Grund: Besuchernutzen: Werkstatt und Lager als Arbeitsplatz.
- Entscheidung: Verschmelzen (Karte „Werkstatt Wetzlar“ neben der Radiusgrafik mit Adresse und „Kurze Rüstzeiten“; Partner nach B15)
- Ziel in der Plattform: components/home/RegionSection.tsx; Routenlink E-START-040.
- Gestaltung: folgt KERN (P2).
- Abnahme: `/` zeigt „Werkstatt“ mit Adresse und „Material direkt am Lager einladen“, keine ungeklärten Markennamen · Bildpaar belege/p0-altstand/alt-start__d1440-light__09.webp / belege/p0-ausgangsstand/start__d1440-light__05.webp.
- Status: offen
- Unsicherheit: Ja: „B49 & A45“ und die Partner-Ausstellungen (B15) sind nicht vom Owner bestätigt.

### E-START-031 · Meilenstein 2026 und Standortverlagerung
- Kategorie: Vertrauen
- Quelle: ALT-START-246–247 · app/page.tsx:789-796 · Bild: belege/p0-altstand/alt-start__d1440-light__10.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-44 (zwei Sätze, `text-callout`, ganz unten im Einsatzgebiet); das Wort „Meilenstein“ und der Wachstumsgrund fehlen; die Kurzfassung in der Zitatkarte (ALT-START-025) siehe E-START-010)
- Aufgabe: Der Betrieb wächst und investiert (Umzug, größeres Lager): ein sicherer Arbeitgeber.
- Wesenskern: Kopf „Offizieller Meilenstein 2026 & Standortverlagerung Wetzlar“; Text „Meilenstein 2026: Durch das stetige Wachstum unseres Betriebes war ein Umzug in eine neue und größere Betriebsstätte unausweichlich. Der Hauptstandort […]“ (91 Wörter; lib/data/company.ts `milestone2026`, Owner-Auftrag docs/prompts/20 §1.3) mit „Siegmund-Hiepe-Str. 20“, „15 Mitarbeiter“ und dem Slogan ‚Schöner Wohnen mit Top-Qualität‘. Kürzen ist erlaubt (ROADMAP §5.4), die Fakten bleiben. Runde 3 (ALT-START-247, korrigiert): Die Box nennt die Standortverlagerung 2026 in die Siegmund-Hiepe-Str. 20 (Umzug in eine neue und größere Betriebsstätte) und widerspricht damit dem Panel-Badge „Firmensitz seit 1926“ der Karte darunter (ALT-START-267, E-START-038); beide Texte standen im selben Bildschirmfoto. Die Meilenstein-Box ist belegt (`milestone2026`, Owner-Auftrag), das Badge nicht; es kommt nicht zurück. Es fehlen der Wachstumsgrund und das Wort „Meilenstein 2026“; „zum führenden Spezialisten für Wärmepumpen“ wurde zu „Wärmepumpen-Spezialist“ (B14 offen: ist „führend“ belegbar?).
- Freiraum: Eigener Block (Zeitstrahl 1926 → 2026) statt Fußnote; der Slogan nur nach Freigabe.
- Bindungen: `REGION.milestone` (lib/content/region.ts), `companyData.milestone2026`; Kennzahl 15 aus `employees15`.
- Priorität: Muss (korrigiert nach E-014; vorher Soll) – Grund: belegtes Vertrauenselement, Owner-Auftrag.
- Entscheidung: Verschmelzen (Absatz mit Überschrift „Meilenstein 2026“ und Wachstumsgrund; „führend“ nur nach B14)
- Ziel in der Plattform: components/home/RegionSection.tsx oder AboutSection.tsx, `REGION.milestone`.
- Gestaltung: folgt KERN (P2); vorläufige Idee: ein Zeitstrahl mit 1926, Umzug und 2026.
- Abnahme: `/` enthält „Meilenstein 2026“, „Siegmund-Hiepe-Str. 20“, „größeres Lager“ und „15 Leuten“ · Bildpaar belege/p0-altstand/alt-start__d1440-light__10.webp / belege/p0-ausgangsstand/start__d1440-light__05.webp.
- Status: offen
- Unsicherheit: keine (der Widerspruch zum Karten-Badge „Firmensitz seit 1926“ ist in E-START-038 aufgelöst: Badge nicht zurückführen)

### E-START-032 · Einsatzgebietskarte (Google-Karte mit Vektor-Rückfall)
- Kategorie: Interaktives
- Quelle: ALT-START-248–254, 266, 361, 378 · app/page.tsx:804-819; components/maps/InteractiveMap.tsx:129-214, 237-247, 262-292; components/maps/InteractiveMapClientWrapper.tsx:8-19; lib/maps/google-maps-loader.ts; lib/maps/google-maps-config.ts:9-14, 20, 29 · Bild: belege/p0-altstand/alt-start__d1440-light__10.webp, belege/p0-altstand/alt-start__d1440-light__11.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-36…45: typografische Radiusgrafik (SVG ohne Straßen und Flüsse) mit Ortstabelle, dazu Google Maps nach Zwei-Klick-Einwilligung, aber nur wenn ein Schlüssel gesetzt ist; im Ausgangsstand ist keiner gesetzt: kein Knopf, keine Google-Karte (NEU-START-45)) [Runde 3: Gegenstück der Startansicht ist `createMap` in components/maps/GoogleRegionMap.tsx:120-148 (Vorwahl-Zoom 9, danach `fitBounds` auf den 35-km-Kreis mit Rand 8, `disableDefaultUI`, Zoom-Regler an, `gestureHandling: cooperative`, Hintergrund aus der Palette); am Ausgangsstand ist kein Schlüssel gesetzt (GET `/`: kein Knopf, kein Google-Verweis im HTML)]
- Aufgabe: Das Einsatzgebiet geografisch erleben statt nur lesen.
- Wesenskern: Eyebrow „Mittelhessen · Maximal 35 km Radius · Garantiert keine Fernmontage“; Titel „Interaktive Standort- & Einsatzgebietskarte“; „Erkunde unser Einsatzgebiet im Lahn-Dill-Kreis und berechne Deine persönliche Fahrzeit zur Werkstatt in Wetzlar. Bei uns bist Du jeden Tag pünktlich zum Feierabend zu Hause.“; Statuspille „35578 Wetzlar Firmensitz“; Kartenkopf „Einsatzgebiet & Standorte Mittelhessen“ mit Modus-Pille in drei Zuständen (ALT-START-253): „Vektor-Modus aktiv“ (Standard: ohne Schlüssel, solange Google lädt und nach dem Timeout; im Bildschirmfoto alt-start__d1440-light__10.webp belegt), „Google Maps Live“ (nur mit Schlüssel, bereiter Google-Karte und ohne Auth-Fehler) und „Lokale Vorschau (Vektor)“ mit Tooltip „Domain-/Referrer-Schutz aktiv. Lokale Vorschau nutzt den interaktiven Vektor-Modus.“ (nur nach einem Auth-Fehler); die Zustände „Live“ und „Lokale Vorschau“ sind nur aus dem Quelltext belegt (im Altstand-Build ist kein Schlüssel gesetzt), Untertitel „Siegmund-Hiepe-Str. 20 · 35578 Wetzlar · Max. 35 km Aktionsradius“; Ladezustand „Standortkarte & Einsatzgebiet werden geladen...“ (ALT-START-361: Platzhalterfläche 640 px hoch, slate-100/80, Radius 3xl, darin ein Spinner von 32 px mit sky-500-Rand über dem Text in 12 px slate-400; Fläche `animate-pulse`, Spinner `animate-spin`). Der Wortlaut kommt nicht zurück: Die Radiusgrafik ist serverseitig fertig, nur die Google-Ebene lädt nach, und dafür steht im Ausgangsstand ein Statustext „Google Maps wird geladen …“ (components/maps/RegionExplorer.tsx:54). `animate-pulse` ist verboten (E-009); ein Ladehinweis richtet sich nach KERN K-011 („Lädt“: Anzeige erst nach 300 ms, dann mindestens 500 ms sichtbar). Funktion: Google-Maps-Ebene, bei Authentifizierungsfehler oder nach 8 s Rückfall auf die Vektoransicht. Im Ausgangsstand ist die Grafik serverseitig fertig (kein Ladeblock), Google lädt erst nach ausdrücklichem Klick, die Wahl ist widerrufbar, dafür braucht es kein Cookie-Banner (ROADMAP §5.4). Die Attribution-ID `gmp_git_agentskills_v1` stammt aus unklarer Quelle. Runde 3: Die Pille kommt nicht zurück; ihre Aufgabe (ehrlich anzeigen, welche Ebene steht) übernimmt der Statustext unter dem Kartenknopf. Schlüsselauflösung, Platzhalter-Filter, Skript, Fehlerwege und Ebenenwechsel (ALT-START-381 bis -388) stehen in E-START-056. Startansicht und Steuerelemente der Google-Ebene (ALT-START-378): Mitte Firmensitz 50.56499 / 8.49842, Zoom 11, Zoom-Regler an; Streetview-Männchen, Kartentyp-Schalter und Google-Vollbildknopf aus (Kartentyp und Vollbild liefen über die eigenen Knöpfe, E-START-034 und E-START-035); Kartenhintergrund #f8fafc; keine Karten-ID; Attribution-ID wie oben. Der Ausgangsstand passt stattdessen den 35-km-Kreis ein (Vorwahl-Zoom 9, `fitBounds`, Rand 8), schaltet alle Steuerelemente außer dem Zoom-Regler ab und nutzt `gestureHandling: cooperative` (die Seite bleibt scrollbar); damit steht das ganze Einsatzgebiet im Bild. Der Altstand baute die Karte bei jedem Wechsel von Kartenmodus oder Radius neu auf und setzte die Ansicht auf Zoom 11 und Firmensitz zurück (Technik, kommt nicht zurück); `DEFAULT_MAP_ZOOM` 12 blieb ungenutzt. Die elf Marker und die Standortwahl (ALT-START-379, -380) stehen in E-START-038.
- Freiraum: Die Karte darf typografisch bleiben; die geografische Anmutung kann über eine eigene SVG (E-START-036) entstehen statt über Fremdkacheln.
- Bindungen: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` oder `GOOGLE_MAPS_API_KEY` (docs/operations/betrieb.md 2.4: „ohne Key beim Build erscheint kein Button“); `/api/maps/config` mit Referer-Prüfung; Einwilligung `be:maps-consent:v1` (localStorage); Datenschutz `/datenschutz#google-maps`; Schlüssel, Karten-ID, Skript und Fehlerwege: E-START-056.
- Priorität: Muss – Grund: ROADMAP §1: „Features erhalten: Google-Karte + Pendelrechner“.
- Entscheidung: Neu interpretieren (Standard bleibt die Radiusgrafik ohne Fremdanfrage; Flusslinien und Straßen nur, wenn Geodatenquelle und Lizenz geklärt sind (F7, E-START-036), sonst keine geokorrekt wirkende Handskizze; Google per Zwei-Klick bleibt Option) (korrigiert nach P1-GEGEN-02; vorher: Neu interpretieren (Standard ist eine geografisch lesbare SVG-Karte ohne Fremdanfrage, Google per Zwei-Klick bleibt Option))
- Ziel in der Plattform: components/maps/RegionExplorer.tsx, RadiusGraphic.tsx, GoogleRegionMap.tsx.
- Gestaltung: folgt KERN (P2); vorläufige Idee: die Radiusgrafik trägt Flusslinien und Straßen nur, wenn Geodatenquelle und Lizenz geklärt sind (F7, E-START-036), sonst bleibt sie typografisch ohne geokorrekt wirkende Handskizze; der Knopf „Interaktive Karte laden“ bleibt darunter (korrigiert nach P1-GEGEN-02; vorher: die Radiusgrafik trägt Flusslinien und Straßen).
- Abnahme: Ohne Einwilligung keine Anfrage an Google-Hosts (Playwright-Anfrageprotokoll); mit Schlüssel und Klick lädt die Karte (Schlüsselattrappe über den Testweg von E-START-056; korrigiert nach P1-GEGEN-02; vorher ohne Testweg), ohne Schlüssel bleibt die Grafik · Bildpaar belege/p0-altstand/alt-start__d1440-light__10.webp, belege/p0-altstand/alt-start__d1440-light__11.webp / belege/p0-ausgangsstand/start__d1440-light__04.webp, belege/p0-ausgangsstand/start__d1440-light__05.webp.
- Status: offen
- Unsicherheit: Ja: Hat die Produktion einen Maps-Schlüssel oder soll sie einen bekommen? Der Ausgangsstand zeigt die Google-Karte nie.

### E-START-033 · Radius-Umschalter 15 / 25 / 35 km
- Kategorie: Interaktives
- Quelle: ALT-START-256, ALT-START-377 · components/maps/InteractiveMap.tsx:96-112, 129-214, 336-352; lib/maps/google-maps-config.ts:8-11 · Bild: belege/p0-altstand/alt-start__d1440-light__10.webp
- Zustand: verloren (+ Gegenstück im Ausgangsstand: NEU-START-36/37 fester Kreis „35 km“ mit gestrichelter Linie (`REGION.radiusKm = 35`); Google-Ebene: ein fester Kreis von 35 000 m um den Firmensitz, ohne Füllung, Linie in `lineStrong` (1 px), Farbwechsel bei Hell und Dunkel per `setOptions` ohne Neuaufbau (components/maps/GoogleRegionMap.tsx:137-146, 182))
- Aufgabe: Besucher sieht, was in 15, 25 und 35 km liegt; die Nähe wird greifbarer.
- Wesenskern: Gruppe „Radius:“ mit „15 km · 25 km · 35 km“ (Vorwahl 35); der Kreisradius ändert sich mit Übergang, der Kartenuntertitel nennt den gewählten Radius. Orte nach Entfernung (lib/data/locations.ts): Wetzlar 1, Garbenheim 4, Hermannstein 4, Steindorf 4, Nauborn 5, Aßlar 6, Dutenhofen 7, Braunfels 14, Gießen 15, Herborn 24 km. Die Radien 15 und 25 sind keine Firmenaussage, nur ein Werkzeug; die Zusage bleibt 35 km. Runde 2 (ALT-START-377, Google-Ebene): Kreis um 50.56499 / 8.49842 (`HEADQUARTERS_COORDINATES`) mit Radius = Wert des Umschalters × 1000 m (15 000, 25 000 oder 35 000 m; Vorwahl 35 km); „Porzellan“ und „Satellit“: Füllung #0ea5e9 mit Deckkraft 0,08, Linie #0284c7; „Midnight“: Füllung #0284c7 mit Deckkraft 0,12, Linie #38bdf8; Linien-Deckkraft 0,7 und Linienstärke 1,5 in allen Modi. Der Altstand zeichnete den Kreis bei jedem Wechsel von Kartenmodus oder Radius neu und baute dabei Karte und Marker neu auf; das ist Technik und kommt nicht zurück. Im Ausgangsstand besteht nur der 35-km-Kreis (Linie ohne Füllung); die Hilfskreise für 15 und 25 km kommen dort wie in der Radiusgrafik als feine Linien ohne Füllung dazu. Farbwerte und Deckkraft sind Gestaltung (E-016, KERN).
- Freiraum: Zwei feine Hilfsringe (15 und 25 km) in der Radiusgrafik statt eines Umschalters, oder ein Umschalter ohne Bewegung.
- Bindungen: `REGION.radiusKm`; Projektion in components/maps/graphic.ts und lib/maps/projection.ts; Fakt `radius35`. `HEADQUARTERS_COORDINATES` und `MAX_SERVICE_RADIUS_KM` (lib/maps/google-maps-config.ts:19); Google-Ebene nur nach Einwilligung und mit Schlüssel (E-START-032).
- Priorität: Soll (korrigiert nach E-014; vorher Kann) – Grund: interaktives Element mit eigener Besucheraufgabe (Nähe greifbar machen), Beispielabschnitt im Richtungsauftrag (pakete/_richtung.md, Punkt 2, Zeile 17) (korrigiert nach P1-GEGEN-02; vorher Grund: Zusatzwerkzeug ohne Geschäftswert).
- Entscheidung: Neu interpretieren (Ringe 15 und 25 km als feine Linien)
- Ziel in der Plattform: components/maps/RadiusGraphic.tsx; Google-Ebene: components/maps/GoogleRegionMap.tsx (zwei zusätzliche Kreise für 15 und 25 km, nur Linie).
- Gestaltung: folgt KERN (P2).
- Abnahme: Die Grafik enthält Ringe für 15, 25 und 35 km um den Firmensitz im Maßstab der Grafik (Luftlinie, die Beschriftung nennt „Luftlinie“); Gießen liegt innerhalb des 15-km-Rings (Luftlinie 12,8 km; die Tabelle nennt 15 km, Owner-Daten `distanceKm`), Herborn zwischen dem 15- und dem 25-km-Ring (19,2 km Luftlinie; Tabelle 24 km); in der Google-Ebene liegen Kreise für 15, 25 und 35 km um den Firmensitz (Test mit gestubbtem `window.google`, siehe E-START-056) (korrigiert nach P1-GEGEN-02; vorher: „… Gießen (15 km) liegt auf dem inneren Ring; in der Google-Karte (mit Schlüsselattrappe) …“; die Grafik projiziert die Orte nach Koordinaten maßstabsgetreu, lib/maps/projection.ts:47-71, components/maps/RegionMap.tsx:28-39, Größe 360 mit Rand 20 in components/maps/graphic.ts:6-8, 15-km-Ring = 68,6 Einheiten, Gießen = 58,3 Einheiten) · Bildpaar belege/p0-altstand/alt-start__d1440-light__10.webp / belege/p0-ausgangsstand/start__d1440-light__04.webp.
- Status: offen
- Unsicherheit: keine

### E-START-034 · Kartenstile „Porzellan · Satellit · Midnight“
- Kategorie: Interaktives
- Quelle: ALT-START-255, ALT-START-375, ALT-START-376 · components/maps/InteractiveMap.tsx:114-126, 146, 297-331; lib/maps/google-maps-config.ts:59-188 · Bild: belege/p0-altstand/alt-start__d1440-light__10.webp
- Zustand: geschwächt (Stilregeln und Hell/Dunkel nach Systemmodus leben; Umschalter und Satellit entfallen, als Kann bewusst; korrigiert nach P1-GEGEN-02; vorher verschoben) (+ Gegenstück im Ausgangsstand: `MAP_PALETTES` hell und dunkel nach `prefers-color-scheme` (components/maps/GoogleRegionMap.tsx, lib/maps/google-maps-config.ts); Satellit entfällt; die Stilregeln stehen in `buildMapStyle`, lib/maps/google-maps-config.ts:99-116, die Paletten in `MAP_PALETTES`, ebd. 71-96)
- Aufgabe: Die Kartenansicht anpassen (hell, dunkel, Satellit).
- Wesenskern: Umschalter „Porzellan“ (Vorwahl, Silberstil) · „Satellit“ (Hybrid) · „Midnight“ (Marinestil). Im Ausgangsstand folgt die Karte dem Systemmodus (hell oder dunkel) live ohne Umschalter (components/maps/GoogleRegionMap.tsx:122-135, 177-184, 193: `matchMedia`-Hörer, `disableDefaultUI`); Satellit hat für die Bewerbungsaufgabe keinen Nutzen. Runde 2 (ALT-START-375, -376): Der Umschalter setzt je Modus einen Google-Stil: „Porzellan“ = APPLE_SILVER_MAP_STYLE (Kartentyp ROADMAP, Kartenhintergrund #f8fafc), „Midnight“ = MIDNIGHT_MEISTER_MAP_STYLE (Kartentyp ROADMAP), „Satellit“ = Kartentyp HYBRID mit leerer Stilliste; alle wirken nur bei geladener Google-Karte. Regeln, die bleiben (im Ausgangsstand alle in `buildMapStyle` vorhanden): ruhige Karte ohne Symbole der Beschriftung, ohne Parzellen- und Nachbarschaftsnamen, ohne Geschäfts-POIs, ohne Nahverkehr; Straßen heller als das Land, Autobahnen in einem zweiten Ton, Wasser in eigener Farbe; Ortsnamen in stärkerer Farbe (im Altstand nur in „Midnight“). Werte des Altstands: „Porzellan“ Geometrie #f8fafc · Beschriftung #475569 mit Kontur #ffffff · Parks #e2f5ea · Straßen #ffffff mit Kontur #e2e8f0 · Hauptstraßen #f1f5f9 · Autobahnen #fed7aa mit Kontur #fdba74 (Code-Kommentar „Soft warm accent for Autobahn A45 / B49“) · Wasser #e0f2fe (Kommentar „Lahn river soft blue“) mit Wasserbeschriftung #0284c7; „Midnight“ Geometrie #0A1E3A · Beschriftung #94a3b8 mit Kontur #050f1e · Ortsnamen #ffffff · Straßen #132B50 · Autobahnen #0284C7 · Wasser #061324 (Kommentar „Deep navy tones matching Bad und Energie corporate colors (#0A1E3A)“). Die Farbwerte sind Gestaltung: sie folgen den Rollen der Marke (E-016: Navy #0C1A72–#111D6D, helles Papier) und nicht mehr dem alten Navy #0A1E3A. Nicht übernommen sind die Parkfläche (der Ausgangsstand blendet alle POIs aus), der warme Autobahn-Akzent (neutraler Ton `roadMajor`; A45 und B49 kehren als Linien in der Landschaftsgrafik E-START-036 zurück) und die Wasserbeschriftung.
- Freiraum: Satellit nur bei Bedarf. Farbwerte frei nach KERN (P2) und E-016.
- Bindungen: `prefers-color-scheme`; Google Maps lädt nur nach Einwilligung. `MAP_PALETTES` und `buildMapStyle` (lib/maps/google-maps-config.ts:71-116).
- Priorität: Kann – Grund: Dekoration ohne eigene Aufgabe. Der Atlas schlägt für ALT-START-375 und -376 Soll vor; der Pass bleibt Kann, weil die Werte Gestaltung sind (E-016) und die Google-Karte nur mit Schlüssel und Einwilligung erscheint; die Stilregeln leben.
- Entscheidung: Keine Rückführung nötig (verschoben ohne Umschalter und Satellit, bewusst; korrigiert nach P1-GEGEN-02; vorher: vollständig verschoben bis auf Satellit, der als Kann entfällt)
- Ziel in der Plattform: components/maps/GoogleRegionMap.tsx (bestehend).
- Gestaltung: folgt KERN (P2).
- Abnahme: Bei dunklem Systemmodus ist die Google-Karte dunkel (Playwright `colorScheme: 'dark'`, Schlüssel nötig; Schlüsselattrappe über den Testweg von E-START-056; korrigiert nach P1-GEGEN-02; vorher ohne Testweg); `buildMapStyle(MAP_PALETTES.light)` und `(…dark)` blenden Beschriftungssymbole, Parzellen- und Nachbarschaftsnamen, POIs und Nahverkehr aus (Test zu ergänzen, derzeit keiner) · Bildpaar belege/p0-altstand/alt-start__d1440-light__10.webp / –.
- Status: offen
- Unsicherheit: keine

### E-START-035 · Kartenfunktionen: Zentrieren, Details, Vollbild
- Kategorie: Interaktives
- Quelle: ALT-START-257–259 · components/maps/InteractiveMap.tsx:354-385 · Bild: belege/p0-altstand/alt-start__d1440-light__10.webp
- Zustand: verloren (+ Gegenstück im Ausgangsstand: Google-Karte im Ausgangsstand mit `disableDefaultUI` und nur Zoom (components/maps/GoogleRegionMap.tsx); Panel entfällt (E-START-038))
- Aufgabe: Orientierung in der Karte: zurück zum Firmensitz, Details ein und aus, Vollbild (vor allem mobil).
- Wesenskern: Knopf „Zentrieren“ (Titel „Auf Firmensitz Wetzlar zentrieren“), „Panel verbergen“ bzw. „Details“ (Titel „Details ausblenden“/„Details einblenden“), Vollbild-Knopf (Titel „Vollbild umschalten“, 100vh). Runde 3 (ALT-START-257, korrigiert): „Zentrieren“ wählt den Firmensitz (Panel-Inhalt) und setzt bei aktiver Google-Karte zuerst `setZoom(11)`, dann `panTo` auf den Firmensitz (50.56499 / 8.49842); es öffnet ein geschlossenes Panel nicht und setzt Kartenmodus und Radius nicht zurück; im Vektor-Modus ändert sich nur der Panel-Inhalt. Wesen ist die Rückkehr zur Startansicht der Karte (Zoom 11 ist zugleich der Startzoom, ALT-START-378). Kartenrahmen und Vollbild-Zustand des Altstands (korrigiert nach P1-GEGEN-02; vorher nicht festgehalten): Die Maße des Rahmens (Höhe 640 px, mindestens 580 px, Radius 3xl, Rahmen, Schatten; Altstand components/maps/InteractiveMap.tsx:48-52 und :250-255) sind Gestaltung (Freiraum von E-START-032; Ausgangsstand: quadratische Grafik, components/maps/RegionExplorer.tsx:64). Der Esc-Defekt des Altstands kommt nicht zurück: `toggleFullscreen` setzt `isFullscreen` ohne `fullscreenchange`-Hörer (InteractiveMap.tsx:238-247), nach Esc bleibt der Rahmen als `fixed inset-0 z-50` stehen. Beides ist kein eigenes Element.
- Freiraum: Nur Vollbild und „Zum Firmensitz“ der Google-Karte, wenn sie geladen ist; das Details-Panel entfällt. Die Zielansicht von „Zum Firmensitz“ ist die Startansicht der Karte (im Ausgangsstand der eingepasste 35-km-Kreis, `fitBounds`), kein fester Zoom.
- Bindungen: Google Maps JS API (`fullscreenControl`); Fullscreen-API; Tastaturbedienung.
- Priorität: Kann – Grund: Komfort, nur mit geladener Google-Karte relevant.
- Entscheidung: Neu interpretieren (Karten-Controls der Google-Karte: Vollbild und „Zum Firmensitz“)
- Ziel in der Plattform: components/maps/GoogleRegionMap.tsx.
- Gestaltung: folgt KERN (P2).
- Abnahme: Mit geladener Karte sind Vollbild und Zentrieren per Tastatur erreichbar; Vollbild endet per Esc und per Knopf, der Knopfzustand folgt dem tatsächlichen Zustand (`fullscreenchange`), es bleibt kein hängender Vollflächenzustand; wo die Fullscreen-API fehlt (Annahme: iPhone-Safari, nicht geprüft), gilt eine CSS-Vollfläche mit Schließen-Knopf, Esc und Fokusrückgabe; Test mit gestubbtem `window.google` (Testweg E-START-056) (korrigiert nach P1-GEGEN-02; vorher: nur „Mit geladener Karte sind Vollbild und Zentrieren per Tastatur erreichbar“; Kein-Tastaturfalle-Regel WCAG 2.1.2) · Bildpaar belege/p0-altstand/alt-start__d1440-light__10.webp / –.
- Status: offen
- Unsicherheit: keine

### E-START-036 · Landschaftsgrafik Lahn, Dill, A45 und B49 (SVG)
- Kategorie: Grafik und SVG
- Quelle: ALT-START-261–263 · components/maps/InteractiveMap.tsx:423-459 · Bild: belege/p0-altstand/alt-start__d1440-light__10.webp, belege/p0-altstand/alt-start__d1440-light__11.webp
- Zustand: verloren (+ Gegenstück im Ausgangsstand: NEU-START-36…38 (Radiusgrafik: Kreis, Punkte, Namen), keine Gewässer oder Straßen)
- Aufgabe: Landschaftsidentität: „Lahn und Dill, A45 und B49“ verortet den Betrieb, ohne Fremdkarte.
- Wesenskern: Inline-SVG (viewBox 0 0 1000 600): Lahn (Pfad „M 960 170 Q 750 230, 500 300 T 240 440 T 40 540“, Strich 16, hellblau), Dill (Pfad „M 310 20 Q 370 140, 480 290“, Strich 10), die Straßen A45 und B49 gestrichelt (Pfade „M 100 30 L 480 300 L 900 560“ und „M 180 500 L 500 300 L 990 190“, Strich 6, Sand). (Vermutung) Pfade schematisch, nicht geokorrekt. Im Midnight-Modus dunkelblau und grau.
- Freiraum: Geokorrekte Verläufe aus einer freien Quelle (z. B. OpenStreetMap, ODbL mit Namensnennung) statt der Handskizze; nur Lahn, Dill, A45 und B49.
- Bindungen: Projektion der Radiusgrafik (lib/maps/projection.ts `createRadiusProjection`); Lizenz und Quelle der Geodaten; Illustrations-SVG ≤ 40 KB gzip (K-013).
- Priorität: Soll – Grund: prägende Grafik (SVG auf Auszeichnungsniveau).
- Entscheidung: Neu interpretieren
- Ziel in der Plattform: components/maps/RadiusGraphic.tsx (zusätzliche Pfadebene, `aria-hidden`).
- Gestaltung: folgt KERN (P2); vorläufige Idee: Lahn und Dill als feine Linien unter den Ortspunkten, die Straßen gestrichelt und beschriftet.
- Abnahme: SVG enthält vier Pfade, ≤ 40 KB gzip, Linien in Hell und Dunkel kontrastreich, Ortspunkte bleiben lesbar · Bildpaar belege/p0-altstand/alt-start__d1440-light__10.webp / belege/p0-ausgangsstand/start__d1440-light__04.webp.
- Status: offen
- Unsicherheit: keine (Datenquelle und Lizenz: OFFENE FRAGE)

### E-START-037 · Radar-Ring um den Firmensitz
- Kategorie: Bewegung
- Quelle: ALT-START-264 · components/maps/InteractiveMap.tsx:462-489 · Bild: belege/p0-altstand/alt-start__d1440-light__10.webp (statisch sichtbar: hellblaue Kreise)
- Zustand: verloren (+ Gegenstück im Ausgangsstand: keines (ROADMAP §4 verbietet ping und pulse))
- Aufgabe: Der Radius wird spürbar: das Einzugsgebiet geht vom Firmensitz aus.
- Wesenskern: Ein Ring (Größe min(r × 18, 560) px) pulst mit `animate-ping` 4 s in Endlosschleife, ein Kreis (min(r × 16, 520) px) wechselt mit 500 ms Übergang beim Radiuswechsel, beide auf Wetzlar zentriert. Wesen ist die Ausbreitung vom Firmensitz.
- Freiraum: Eine einmalige Ausbreitung beim Einblenden; die Endlosschleife entfällt; bei reduzierter Bewegung statisch.
- Bindungen: `prefers-reduced-motion`; Radius aus `REGION`.
- Priorität: Kann – Grund: Dekoration mit atmosphärischer Wirkung.
- Entscheidung: Neu interpretieren
- Ziel in der Plattform: components/maps/RadiusGraphic.tsx (CSS oder SVG-Animation, einmalig).
- Gestaltung: folgt KERN (P2); vorläufige Idee: der 35-km-Ring zeichnet sich einmal vom Firmensitz aus.
- Abnahme: Der Ring bewegt sich genau einmal beim Erscheinen, bei `prefers-reduced-motion` gar nicht · Bildpaar belege/p0-altstand/alt-start__d1440-light__10.webp / belege/p0-ausgangsstand/start__d1440-light__04.webp.
- Status: offen
- Unsicherheit: keine

### E-START-038 · Standort-Pins und Standortdetails (Panel, Beschreibungen, Einstufung)
- Kategorie: Interaktives
- Quelle: ALT-START-265, 267–271, 275, 277, 362, 365–374, 379, 380 · components/maps/InteractiveMap.tsx:155-191, 201-205, 216, 227-235, 404-405, 492-547, 556-585, 614-631, 637-639, 657-669; lib/data/locations.ts:14-134; lib/maps/google-maps-config.ts:34-57 · Bild: belege/p0-altstand/alt-start__d1440-light__10.webp, belege/p0-altstand/alt-start__d1440-light__11.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: Auswahl über „Wo wohnst du?“ NEU-START-39/40, Tabelle NEU-START-41/42, Markierung in der Grafik NEU-START-36/38, Google-Marker nur mit Schlüssel (zehn: der Firmensitz und neun Orte; „Wetzlar Kernstadt“ teilt den Marker des Firmensitzes, `CENTER_MERGE_KM`; ein Klick auf einen Ortsmarker wählt den Ort und schwenkt die Karte mit `panTo`, der gewählte Marker ist größer und invertiert, der Firmensitz-Marker ist nicht klickbar; components/maps/GoogleRegionMap.tsx:151-194, lib/maps/google-maps-config.ts:19-57); verloren: Klick auf Pin in der Grafik, Kurzbeschreibung je Ort und die Einstufung „Kerngebiet“ / „Regionales Einsatzgebiet“ (`isCoreZone` liegt in `REGION.locations`, wird nicht angezeigt; `character` (Kurzbeschreibung) steht in `regionalLocations` (lib/data/locations.ts), wird aber von `REGION.locations` nicht durchgereicht, lib/content/region.ts:6-15, 23-38))
- Aufgabe: Einen Ort wählen und Details sehen: Entfernung, Fahrzeit, Charakter und ob er im Kerngebiet liegt.
- Wesenskern: Elf Pins („Firmensitz“ (rot), Wetzlar 3 Min., Hermannstein 7, Nauborn 8, Garbenheim 6, Dutenhofen 10, Steindorf 7, Aßlar 9, Braunfels 18, Gießen 16, Herborn 22; stimmt mit lib/data/locations.ts und der Neu-Tabelle überein). Panel: Badge „Firmensitz seit 1926“ (nicht zurückführen, siehe Runde 3 (c)), Name „Firmensitz & Meisterbüro Wetzlar“, „Siegmund-Hiepe-Str. 20, 35578 Wetzlar“, „Zentrale Verwaltung, Werkstatt, Schulungsräume und Startpunkt aller Kundendienstfahrzeuge.“ (teilweise unbelegt, siehe Runde 3 (d)), Vertrauenszeile „Garantiert keine Fernmontage · Pünktlicher Feierabend“, Auslöser „Standortdetails & Pendlerrechner“. Standortbeschreibungen (ALT-START-362 ist die Sammelzeile, aufgeteilt in ALT-START-365 bis -374; wörtlich in lib/data/locations.ts, dort im Ausgangsstand unverändert) mit Badge „Kerngebiet“ (Wetzlar Kernstadt, Hermannstein, Nauborn, Garbenheim, Dutenhofen, Steindorf) oder „Regionales Einsatzgebiet“ (Aßlar, Braunfels, Gießen, Herborn; Badge per CSS in Großbuchstaben). Je Ort zeigte das Panel Badge, Name, Adresse „📍 PLZ Ort“, Beschreibung, „Entfernung Werkstatt:“ und „Fahrzeit ab Wetzlar:“: Wetzlar Kernstadt, 35578, „Firmensitz Siegmund-Hiepe-Str. 20 und historische Altstadt“, 1 km, ca. 3 Min. · Hermannstein, 35586, „Wohn und Gewerbegebiet an der B277 und A480“, 4 km, 7 Min. · Nauborn, 35580, „Einfamilienhausgebiete mit vielen Wärmepumpenmodernisierungen“, 5 km, 8 Min. · Garbenheim, 35583, „Lahnauen und ruhige Wohnsiedlungen“, 4 km, 6 Min. · Dutenhofen, 35582, „Verbindung nach Gießen über die B49“, 7 km, 10 Min. · Steindorf, 35581, „Traditionelle Wohnsiedlungen und Neubauviertel“, 4 km, 7 Min. · Aßlar, 35614, „Industrie und Wohnstandort im Dilltal“, 6 km, 9 Min. · Braunfels, 35619, „Schlossstadt mit anspruchsvollen Sanierungsobjekten“, 14 km, 18 Min. · Gießen, 35390, „Universitätsstadt und wichtiges Kundendienstgebiet“, 15 km, 16 Min. · Herborn, 35745, „Historische Fachwerkstadt an der A45“, 24 km, 22 Min. (Zahlen stimmen mit lib/data/locations.ts und der Ortstabelle des Ausgangsstands überein.) Befund: Die Koordinaten von „Wetzlar Kernstadt“ sind gleich dem Firmensitz (50.56499 / 8.49842); der Pin lag im Altstand auf dem Firmensitz-Pin, und die Grafik des Ausgangsstands legt ihn mit dem Mittelpunkt zusammen (`atCenter`, components/maps/RegionMap.tsx:37). Die Einstufung steuerte im Altstand keine Darstellung außer dem Badge-Text (nur `headquarters` wurde unterschieden, InteractiveMap.tsx:160, 495). Die Beschreibungen sind Kundenmarketing und kein Beleg für Aufträge („viele Wärmepumpenmodernisierungen“, „wichtiges Kundendienstgebiet“ nicht als Tatsachenbehauptung ausbauen); ausgespielt werden deshalb nur die sieben Lagebeschreibungen, die drei Geschäftsaussagen (Nauborn, Braunfels, Gießen) erst nach Bestätigung des Inhabers (siehe Abnahme). Das Einblenden des Panels (`animate-in`, InteractiveMap.tsx:556) war im Altstand wirkungslos (`tw-animate-css` steht im Altstand in package.json:50, ist aber in app/globals.css nicht eingebunden (Zeile 1: nur `@import "tailwindcss"`); die gebaute CSS enthält kein `animate-in`) (korrigiert nach P1-GEGEN-02; vorher: „kein tw-animate-css“). Pin-Lage der Vektoransicht (Altstand InteractiveMap.tsx:497-510, korrigiert nach P1-GEGEN-02; vorher nicht festgehalten): lineare Näherung (lat × 110 × 3,5 und lng × 70 × 4,2 um den Firmensitz) mit Klemmung auf 12–88 % und 10–90 %, also nicht maßstäblich; Gießen (links 102 % auf 90 %) und Herborn (oben 4,5 % auf 12 %, links −8,3 % auf 10 %) sitzen am Rand. Das kommt nicht zurück: Die Grafik des Ausgangsstands projiziert maßstabsgetreu (lib/maps/projection.ts:47-71, Test lib/maps/__tests__/projection.test.ts); die Projektion der Vektor-Pins ist ein Technikdetail ohne Besucheraufgabe und kein eigenes Element, die Interaktion „Pin anklicken“ führt dieser Pass. Runde 3, am Quelltext und am Ausgangsstand geprüft: (a) Standortwahl (ALT-START-379, -265, -274): Die Auswahl im Pendlerrechner und der Klick auf einen Vektor-Pin laufen über `handleSelectPoi`; das Panel öffnet sich in jedem Fall, bei aktiver Google-Karte folgen `panTo` und `setZoom(12)` (fester Zoom, ein vom Besucher eingestellter Zoom wird überschrieben). Der Schwenk-Zweig ist nur über den Pendlerrechner erreichbar, denn die Vektor-Pins gibt es nur ohne aktive Google-Karte; der Pin-Klick ändert nur Panel und Pin-Hervorhebung. Der Ausgangsstand wählt den Ort in Ergebnisfeld, Tabellenzeile und Grafik und schwenkt die Google-Karte (`panTo`) ohne Zoomänderung; die feste Stufe 12 ist Gestaltung (die Karte soll das Einsatzgebiet im Bild behalten), kein Wesenskern. (b) Marker der Google-Ebene (ALT-START-380): elf Marker (je Eintrag der Standortliste), Titel = Standortname; Firmensitz als Kreis scale 10 in #C51E1E (Deckkraft 1, weiße Kontur 3), die übrigen zehn scale 6 in #0A1E3A (Deckkraft 0,9, weiße Kontur 2); Klick wählt den Ort (`setSelectedPoi`), schwenkt (`panTo`, ohne Zoomänderung) und öffnet das Panel; der gewählte Marker änderte sein Aussehen nicht (klassische `google.maps.Marker`). Wesen: Der Firmensitz ist hervorgehoben, jeder Ort trägt seinen Namen, ein Klick wählt ihn; das lebt im Ausgangsstand (zehn Marker, Auswahl sichtbar), die Farbwerte folgen E-016 und nicht den alten Tokens. (c) Badge „Firmensitz seit 1926“ (ALT-START-267): Das Panel stand beim Laden auf dem Firmensitz, das Badge sagte also sofort „Firmensitz seit 1926“, während die Meilenstein-Box derselben Seite die Verlagerung des Hauptstandorts 2026 in die Siegmund-Hiepe-Str. 20 nennt (E-START-031); beide Texte standen im selben Bildschirmfoto. Belegt ist nur „Meisterbetrieb in Wetzlar seit 1926“ (`FACTS.founded1926`, geführt in E-START-002 und E-START-011), nicht „Firmensitz an dieser Adresse seit 1926“. Das Badge kommt nicht zurück (Widerspruch bzw. unbelegte Formulierung). (d) Beschreibung des Firmensitzes (ALT-START-271): „Schulungsräume“ und „Startpunkt aller Kundendienstfahrzeuge“ kommen im gesamten Altstand-Quelltext sonst nirgends vor (Volltextsuche; im Ausgangsstand ebenso nicht) und sind unbelegt; sie kommen nicht zurück. Belegt sind Werkstatt, Büro und Lager (Meilenstein-Box „moderneres Büro und ein größeres Lager“, „Zentrale Werkstatt & Logistiklager“, E-START-030); Schulungen nennt der Altstand bei den Herstellern („Herstellerschulungen direkt bei Buderus, Bosch und NIBE“, lib/data/services.ts:27; im Ausgangsstand `FACTS.paidCertifications`). Name und Adresse des Firmensitzes sind belegt.
- Freiraum: Zoom bei der Auswahl sowie Symbole und Farben der Marker frei nach KERN (P2) und E-016. Klick auf einen Punkt der Grafik wählt den Ort; die Einstufung als Markierung in der Tabelle; die Kurzbeschreibung des gewählten Ortes im Ergebnisfeld; das Panel entfällt.
- Bindungen: `RegionPlace` (components/maps/types.ts); `aria-live`-Ergebnisfeld; Daten lib/data/locations.ts (Owner-Daten, `character` ist Kundenmarketing und kein Beleg für Aufträge); `RegionLocation` in lib/content/region.ts muss `character` führen, damit die Kurzbeschreibung erreichbar wird (nur für die sieben Lagebeschreibungen ausspielen; die drei Geschäftsaussagen warten auf die Bestätigung des Inhabers, MENSCHEN M-016).
- Priorität: Soll (korrigiert nach P1-GEGEN-02; vorher Kann) – Grund: Inhalte mit klarem Besuchernutzen (zehn Ortsbeschreibungen ALT-START-365 bis -374, Einstufung Kerngebiet/Regionales Einsatzgebiet) und interaktives Element (Pin-Klick, Standortwahl ALT-START-265, -379). Als Element wird nichts zurückgestellt; nur die drei unbelegten Geschäftsaussagen (Nauborn, Braunfels, Gießen) warten auf Bestätigung (MENSCHEN M-016), es gibt keinen Beleg für eine bewusste Entfernung (docs/ROADMAP.md:236 nennt „Ortsliste mit km und Fahrzeit“ und streicht die Beschreibungen nicht ausdrücklich). Am Ausgangsstand fehlen sie ganz: `character` wird in app, components und lib nirgends gelesen (lib/data/locations.ts:25-133 hält die Beschreibungen), lib/content/region.ts:6-15 und :23-38 reicht `character` nicht durch, components/maps/types.ts:5-10 und components/maps/RegionMap.tsx:28-39 tragen weder `character` noch `isCoreZone` ins Client-Objekt, und GET `/` enthält weder „Kerngebiet“ noch „Regionales Einsatzgebiet“ noch „Schlossstadt“ oder „Kundendienstgebiet“ (gemessen 2026-10-09). (Vorher: Kann – Grund: Zusatzinformation; der Atlas schlug für ALT-START-365 bis -374 Soll vor, der Pass blieb Kann, die Einstufung und die Kurzbeschreibung wurden „trotzdem gebaut“.)
- Entscheidung: Verschmelzen (Einstufung und Kurzbeschreibung des gewählten Ortes ins Ergebnisfeld und in die Tabelle)
- Ziel in der Plattform: components/maps/RegionExplorer.tsx, components/maps/types.ts, lib/content/region.ts (`character` durchreichen). Die drei Geschäftsaussagen bleiben bis zur Bestätigung des Inhabers (MENSCHEN M-016) gesperrt.
- Gestaltung: folgt KERN (P2).
- Abnahme: Wahl eines Ortes markiert Grafik und Tabellenzeile und nennt Entfernung, Fahrzeit, Einstufung und die Kurzbeschreibung des Ortes (sieben Lagebeschreibungen wörtlich aus den Daten: Wetzlar Kernstadt, Hermannstein, Garbenheim, Dutenhofen, Steindorf, Aßlar, Herborn); die drei Geschäftsaussagen – Nauborn „Einfamilienhausgebiete mit vielen Wärmepumpenmodernisierungen“, Braunfels „Schlossstadt mit anspruchsvollen Sanierungsobjekten“, Gießen „Universitätsstadt und wichtiges Kundendienstgebiet“ (lib/data/locations.ts:49, 109, 121) – erscheinen erst nach Bestätigung des Inhabers (Querverweis MENSCHEN M-016; ein eigener Eintrag in MENSCHEN.md und fakten-abgleich ist anzulegen, Regel „Es wird nichts erfunden“, docs/operations/fakten-abgleich.md:5); bis dahin steht ihr Wortlaut (Prüfstrings „vielen Wärmepumpenmodernisierungen“, „anspruchsvollen Sanierungsobjekten“, „wichtiges Kundendienstgebiet“) in keinem gerenderten HTML (Test) (korrigiert nach P1-GEGEN-02; vorher: „alle zehn Beschreibungen wörtlich aus den Daten“); mit Schlüsselattrappe (Testweg E-START-056) wählt ein Klick auf einen Ortsmarker Tabellenzeile und Ergebnisfeld, schwenkt die Karte und macht den gewählten Marker erkennbar; „Schulungsräume“, „Startpunkt aller Kundendienstfahrzeuge“ und „Firmensitz seit 1926“ kommen in keinem gerenderten HTML vor · Bildpaar belege/p0-altstand/alt-start__d1440-light__10.webp, belege/p0-altstand/alt-start__d1440-light__11.webp / belege/p0-ausgangsstand/start__d1440-light__04.webp, belege/p0-ausgangsstand/start__d1440-light__05.webp.
- Status: offen
- Unsicherheit: keine

### E-START-039 · Pendlerrechner (Entfernung und Fahrzeit zum Wohnort)
- Kategorie: Interaktives
- Quelle: ALT-START-272–274 · components/maps/InteractiveMap.tsx:590-631; lib/data/locations.ts:14-134 · Bild: belege/p0-altstand/alt-start__d1440-light__11.webp (Auswahlfeld „Gießen (16 Min. Fahrzeit)“)
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-39…42: „Wo wohnst du?“, Ergebnisfeld, Tabelle, mit Postleitzahlen (components/maps/RegionExplorer.tsx, lib/maps/commute.ts))
- Aufgabe: Die Pendelzeit zum Betrieb erfahren.
- Wesenskern: „Pendlerrechner: Dein Wohnort“ mit zehn Orten und „(n Min. Fahrzeit)“; Anzeige „Entfernung Werkstatt: n km“ und „Fahrzeit ab Wetzlar: ca. n Minuten“. Es wird nicht gerechnet, es sind Tabellenwerte ohne Routing. Alt-Fehler: Vorwahl „Gießen“, obwohl das Panel auf dem Firmensitz stand. Runde 3 (ALT-START-274, korrigiert): Die Auswahl läuft über `handleSelectPoi` (E-START-038): Das Panel öffnet sich und zeigt den Ort, bei aktiver Google-Karte folgen `panTo` und `setZoom(12)`. Der Firmensitz steht nicht in der Liste (`MAP_POIS` ohne ersten Eintrag), sie hat zehn Orte; im Ausgangsstand steht „Wetzlar Kernstadt“ (1 km, ca. 3 Min.) in der Auswahl, die Wahl schwenkt die Google-Karte ohne Zoomänderung.
- Freiraum: Suche per Eingabe (`findCommute` kennt PLZ und Namensanfang) zusätzlich zur Auswahl.
- Bindungen: lib/data/locations.ts; lib/maps/commute.ts (`findCommute`, `formatCommute`); weitere Orte nur mit belegten Zeiten (B17).
- Priorität: Muss – Grund: Funktion mit Geschäftswert (ROADMAP §1 „Pendelrechner“).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/maps/RegionExplorer.tsx (bestehend).
- Gestaltung: folgt KERN (P2).
- Abnahme: Auswahl „Gießen“ nennt 15 km und 16 Min.; ohne Auswahl steht der Hinweistext (Playwright) · Bildpaar belege/p0-altstand/alt-start__d1440-light__11.webp / belege/p0-ausgangsstand/start__d1440-light__04.webp.
- Status: offen
- Unsicherheit: keine

### E-START-040 · „Route in Google Maps öffnen“
- Kategorie: Einbindung Dritter
- Quelle: ALT-START-276 · components/maps/InteractiveMap.tsx:641-650 · Bild: belege/p0-altstand/alt-start__d1440-light__11.webp (unten im Panel)
- Zustand: verloren (+ Gegenstück im Ausgangsstand: kein Routenlink auf der Seite; `googleMapsUrl` steht nur im JSON-LD (`hasMap`, components/site/site-jsonld.ts:76))
- Aufgabe: Bewerber finden die Werkstatt (Schritt 2 des Ablaufs ist „Kennenlernen in der Werkstatt“).
- Wesenskern: Knopf „Route in Google Maps öffnen“ → `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` (Firmensitz oder gewählter Ort), neuer Tab, `rel="noopener noreferrer"`; lädt nichts vor dem Klick.
- Freiraum: Ein Textlink „Route zur Werkstatt planen (öffnet Google Maps)“ in der Werkstatt-Karte (E-START-030).
- Bindungen: `COMPANY.geo` (50.56499, 8.49842); Datenschutztext auf externen Link prüfen (P1-REST-03); `target="_blank"`.
- Priorität: Soll – Grund: Besuchernutzen vor dem Vorstellungstermin.
- Entscheidung: Rückführen
- Ziel in der Plattform: components/home/RegionSection.tsx (Werkstatt-Karte).
- Gestaltung: folgt KERN (P2).
- Abnahme: Der Link ist vorhanden, öffnet in neuem Tab, enthält die Zielkoordinaten, und beim Laden der Seite geht keine Anfrage an Google · Bildpaar belege/p0-altstand/alt-start__d1440-light__11.webp / belege/p0-ausgangsstand/start__d1440-light__05.webp.
- Status: offen
- Unsicherheit: keine

### E-START-041 · Infokarten unter der Karte
- Kategorie: Inhalt
- Quelle: ALT-START-278–280 · app/page.tsx:827-856 · Bild: belege/p0-altstand/alt-start__d1440-light__11.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-34/35 (Region), NEU-START-30 (Fahrzeug), NEU-START-10 (13:30))
- Aufgabe: Drei Kernzusagen unter der Karte wiederholen.
- Wesenskern: „35 km Einsatzgrenze – Keine Hotelübernachtungen, keine Fernbaustellen. Alle Kunden und Projekte befinden sich in Wetzlar, Gießen und direktem Umland.“ · „Fahrtzeit & Fuhrpark – Moderner Werkstattwagen mit Tankkarte. Nach Absprache feste Mitnahme für den direkten Arbeitsweg.“ · „Pünktlicher Feierabend – Feste Arbeitszeiten unter der Woche und freitags ab 13:30 Uhr bezahlter Übergang ins freie Wochenende.“ Reine Wiederholung; „Tankkarte“ gilt nur für Kundendienst und Obermonteur (B8), „bezahlter Übergang“ ist offen (B10).
- Freiraum: Entfallen darf, was an anderer Stelle steht.
- Bindungen: Fakten `radius35`, `vehicle`, `friday1330`.
- Priorität: Kann – Grund: Wiederholung bereits genannter Fakten.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: –
- Gestaltung: folgt KERN (P2).
- Abnahme: Die drei Aussagen stehen an anderer Stelle der Seite (E-START-025, 026, 028) · Bildpaar belege/p0-altstand/alt-start__d1440-light__11.webp / belege/p0-ausgangsstand/start__d1440-light__04.webp.
- Status: offen
- Unsicherheit: keine

### E-START-042 · Bewertungsband: Überschrift, Ansichten und Filter
- Kategorie: Interaktives
- Quelle: ALT-START-282–283, 287–288, 364 · app/page.tsx:867-872; components/reviews/KineticReviewCarousel.tsx:66-71, 433-506; components/reviews/ReviewCarousel.tsx:6-16; lib/data/reviews.data.ts:27-36 · Bild: belege/p0-altstand/alt-start__d1440-light__11.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-59 H3 „Stimmen von Kunden und Team“, NEU-START-61 Chips „Alle · Kunden · Team“, NEU-START-62/63 Pfeile)
- Aufgabe: Stimmen nach Art filtern und durchblättern.
- Wesenskern: Eyebrow „Authentische Einblicke“; H2 „Was Kolleginnen und Kunden sagen“; Ansichtsumschalter „Doppelspur (Kunden & Team)“ · „Google Kundenstimmen (5,0)“ · „Team & Meisterstimmen“; Themen „Alle 14 · Wärmepumpe 4 · Zufrieden 4 · Meister 2 · Planung 2 · Installation 2 · Arbeit 2 · Team 4“. Fünf dieser Zähler sind falsch (ausgezählt: Wärmepumpe 3, Zufrieden 1, Planung 1, Arbeit 3, Team 2), die Themenfilter kommen deshalb nicht zurück. „Google Kundenstimmen (5,0)“ nennt eine unbelegte Zahl (E-START-045). Ladezustand des Altstands (ALT-START-364, Platzhalter des dynamisch geladenen Karussells): „Mitarbeiterbewertungen werden geladen...“; er entfällt, denn der Ausgangsstand rendert das Band serverseitig mit fertigen Karten (ReviewCarousel → ReviewScroller, kein dynamischer Import, im HTML kein Ladetext). Der Wortlaut kommt nicht zurück: „Mitarbeiterbewertungen“ trifft das Band nicht, es zeigt Kunden- und Teamstimmen.
- Freiraum: Ein Themenfilter nur, wenn die Kategorien belegt vergeben werden; ein Ladezustand nur, falls das Band je nachlädt (KERN K-011).
- Bindungen: `ReviewFilter` (components/reviews/model.ts).
- Priorität: Soll – Grund: Besuchernutzen, Kernfunktion vorhanden.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/reviews/ReviewScroller.tsx.
- Gestaltung: folgt KERN (P2).
- Abnahme: Die Chips filtern 13 Stimmen auf 10 Kunden und 3 Team; die Pfeile tragen `aria-disabled` an den Enden · Bildpaar belege/p0-altstand/alt-start__d1440-light__11.webp / belege/p0-ausgangsstand/start__d1440-light__07.webp.
- Status: offen
- Unsicherheit: keine

### E-START-043 · Google-Kundenbewertungen mit Inhaber-Antwort
- Kategorie: Vertrauen
- Quelle: ALT-START-289–291, 301–310 · components/reviews/KineticReviewCarousel.tsx:515-517; lib/data/reviews.data.ts:41-208; components/reviews/ReviewCard.tsx:12-138 · Bild: belege/p0-altstand/alt-start__d1440-light__11.webp, belege/p0-altstand/alt-start__d1440-light__12.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-65, 67, 69, 71–77: alle zehn Zitate wörtlich mit Name, Rolle, Quelle und fünf Sternen; ohne Ort, Zeitangabe, Badge, Kategorie, Rezensionszahl des Autors und Inhaber-Antwort)
- Aufgabe: Fremdstimmen: Kunden bestätigen die Qualität; Antworten des Inhabers zeigen, dass er sich kümmert.
- Wesenskern: Zehn Google-Rezensionen: Herr Klober (Wärmepumpenanlage), Hans Jochen Kraft (Heizungstausch), J F (Badsanierung & Heizung), Rolf Dörr (Haustechnik Komplettservice), Burim Loshaj (Marktleiter Poco Wetzlar), Feld Salat (Local Guide), Peter Koehler (Schulhausmeister & Local Guide), Matthias Grützner (Gebäudetechnik), Rainer Debus (Wärmepumpeninstallation), Thomas Krausgrill (Heizungsmodernisierung). Die Zitate stehen im Ausgangsstand wörtlich (auch Schreibweisen wie „Alphainotec“ und „Koehler“ bleiben wie auf Google, nicht glätten). Es fehlen die Antworten „Antwort von Meister Demir“ (z. B. „Vielen Dank für das positive Feedback. Kundenzufriedenheit und Top Qualität ist unsere Mission.“); components/reviews/data.ts lässt sie bewusst weg („they age or add noise“). Spur-Kopf „Verifizierte Google Bewertungen“, „Echte Kundenstimmen aus Mittelhessen“, Untertitel „5,0 von 5 Sternen bei 24 Rezensionen mit persönlicher Inhaber Antwort von Meister Demir“: die Spur zeigt 10 Datensätze, der Untertitel nennt 24 (Zahlenstand siehe E-START-045).
- Freiraum: Inhaber-Antwort als aufklappbare Zeile je Karte; Ort und Badge nach Bedarf; keine relativen Zeitangaben („Vor einem Jahr“).
- Bindungen: lib/data/reviews.data.ts (Quelle der Zitate); Profil-Link und Stand der Zahlen fehlen (B25).
- Priorität: Muss – Grund: belegte Vertrauenselemente.
- Entscheidung: Verschmelzen (Inhaber-Antwort als optionale Zeile je Karte)
- Ziel in der Plattform: components/reviews/ReviewScroller.tsx und components/reviews/data.ts.
- Gestaltung: folgt KERN (P2).
- Abnahme: Zehn Kundenzitate wörtlich; Karten mit Antwort zeigen sie auf Klick · Bildpaar belege/p0-altstand/alt-start__d1440-light__12.webp / belege/p0-ausgangsstand/start__d1440-light__07.webp, belege/p0-ausgangsstand/start__d1440-light__08.webp.
- Status: offen
- Unsicherheit: keine

### E-START-044 · Teamstimmen „Mitarbeiter Stimme“ (vier nicht belegte Personen)
- Kategorie: Vertrauen
- Quelle: ALT-START-292–294, 311–314 · components/reviews/KineticReviewCarousel.tsx:528-530; lib/data/reviews.data.ts:213-260; components/reviews/ReviewCard.tsx:12-138 · Bild: belege/p0-altstand/alt-start__d1440-light__12.webp
- Zustand: verloren (+ Gegenstück im Ausgangsstand: bewusst entfernt (docs/operations/fakten-abgleich.md B22); die echten Teamzitate Koch, Becker und Weber stehen im Ausgangsstand (NEU-START-66, 68, 70))
- Aufgabe: Mitarbeiter bestätigen das Arbeitsklima; für Bewerber das stärkste Argument.
- Wesenskern: Nicht zurückzuführen sind: „Michael S.“ (Anlagenmechaniker SHK, Badge „Früher Großkonzern Fernmontage“), „Christian W.“ (Kundendienstmonteur), „Tim K.“ (Geselle nach Übernahme; „wurde sofort unbefristet übernommen“, berührt die offene Übernahmegarantie A1), „Dennis M.“ (Quereinsteiger SHK Montage), Quelle „Mitarbeiter Stimme“, Aussagen wie „Das beste und menschlichste Arbeitsklima in ganz Mittelhessen“. Herkunft im Repo nicht belegt, Personen nicht bestätigt. Spur-Kopf „Bewerber & Montage Praxis“ / „Warum unser Meisterteam gerne hier arbeitet“ / „Keine Fernmontage, pünktlich Feierabend um 13:30 Uhr freitags und echte Hilti Ausrüstung“: die Aussagen sind anderweitig belegt, der Kopf kann den echten Teamzitaten dienen.
- Freiraum: Die Kopfzeile der Team-Spur für die freigegebenen Zitate nutzen.
- Bindungen: `TEAM_QUOTES` (lib/content/team.ts), `TEAM_REVIEW_IDS` (components/reviews/data.ts); B22.
- Priorität: Soll – Grund: Mitarbeiterstimmen sind für Bewerber Hauptargument, echte sind vorhanden.
- Entscheidung: Nicht zurückführen (erfunden/unbelegt)
- Ziel in der Plattform: –
- Gestaltung: –
- Abnahme: Das Karussell zeigt als Team nur Koch, Becker und Weber (Test); „Mitarbeiter Stimme“ steht nicht im HTML · Bildpaar belege/p0-altstand/alt-start__d1440-light__12.webp / belege/p0-ausgangsstand/start__d1440-light__07.webp.
- Status: offen
- Unsicherheit: keine (Owner-Frage B22: Sind die vier Personen echt und die Zitate freigegeben?)

### E-START-045 · Google-Bewertungsabzeichen (5,0 · 24 Berichte)
- Kategorie: Vertrauen
- Quelle: ALT-START-284–286 · components/reviews/GoogleReviewsBadge.tsx:16-61; app/page.tsx:874 · Bild: belege/p0-altstand/alt-start__d1440-light__11.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-60: `components/reviews/ReviewSummary.tsx` ist fertig, rendert aber nichts, solange `asOf` in `googleOverviewStats` fehlt)
- Aufgabe: Gesamtnote und Anzahl der Google-Bewertungen als schnelles Vertrauenszeichen.
- Wesenskern: Pille mit Google-G (vier Pfade), „5.0“, fünf Sterne, „Exzellent“, „24 Berichte auf Google“, „100% Empfehlung“ (grüner Punkt pulsiert). Die Zahlen sind undatiert und ohne Profil-Link (ROADMAP §13, B25: „reviews.data.ts nennt 24 Bewertungen und zitiert 10“); „100% Empfehlung“ (`recommendationRate`) hat keine Quelle, „Exzellent“ ist ein Eigenlabel. Der Ausgangsstand zeigt „5,0 · 24 Google-Bewertungen · Stand: Monat Jahr“ mit Link „Auf Google ansehen“, sobald `asOf` und `profileUrl` gesetzt sind.
- Freiraum: Form; das Google-G nur nach Markenrichtlinie.
- Bindungen: `googleOverviewStats.asOf` und `profileUrl` (lib/data/reviews.data.ts); die Kennzahl muss zum Google-Profil passen.
- Priorität: Muss – Grund: belegtes Vertrauenselement nach Bestätigung.
- Entscheidung: Zurückstellen (Owner: aktuelle Zahlen, Monat und Profil-Link; „100 % Empfehlung“ entfällt)
- Ziel in der Plattform: components/reviews/ReviewSummary.tsx (fertig, wartet auf `asOf`).
- Gestaltung: folgt KERN (P2); vorläufige Idee: eine Zeile aus Sternen, Note und Zahl mit „Stand: …“.
- Abnahme: Nach Eintrag von `asOf` erscheint die Zeile mit Stand; „100 %“ erscheint nie · Bildpaar belege/p0-altstand/alt-start__d1440-light__11.webp / belege/p0-ausgangsstand/start__d1440-light__07.webp.
- Status: offen
- Unsicherheit: keine (offene Owner-Frage B25)

### E-START-046 · Kinetisches Bewertungs-Karussell (Ziehen, Schleudern, Tempo)
- Kategorie: Bewegung
- Quelle: ALT-START-295–300 · components/reviews/KineticReviewCarousel.tsx:91-225, 245-253, 275-280, 295-416 · Bild: belege/p0-altstand/alt-start__d1440-light__11.webp, belege/p0-altstand/alt-start__d1440-light__12.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-62…64: Scroll-Snap, Pfeile, Tastatur, kein Autoplay; Wischen per Touch und Trackpad nativ, kein Maus-Ziehen mit Trägheit)
- Aufgabe: Bewegung als Charakter: Karten laufen, man packt und wirft sie; wirkt lebendig und greifbar.
- Wesenskern: Karten laufen in Endlosschleife (Spur 1 von rechts nach links, Spur 2 umgekehrt), Hover pausiert; Ziehen 1:1 per Zeiger; Schleudern mit Trägheit (Impuls-Faktor 1,5, Deckel ±32, Reibung 0,965, Angleichung 0,05 bzw. 0,12 bei Hover oder Pause); Randmaske 4 %; Steuerung „Schnelldurchlauf“, „Von rechts nach links“ bzw. „Von links nach rechts“, „1x Tempo“ → „1.6x Tempo“ → „2.4x Tempo“, Pause und Start (Titel „Karussell anhalten“, „Karussell starten“); Tipp „Greife die Karten mit der Maus oder dem Finger und schleudere sie nach links oder rechts!“. Dauerbewegung widerspricht der ruhigen Gestaltung (ROADMAP §5.6) und WCAG 2.2.2; das Wesen ist die greifbare, physische Bewegung.
- Freiraum: Autoplay entfällt; Ziehen mit der Maus mit Auslaufen, Scroll-Snap bleibt; die Steuerknöpfe für Tempo und Richtung entfallen.
- Bindungen: `prefers-reduced-motion`; Tastaturbedienung; Bewegungs-JS ≤ 60 KB gzip (K-013); WCAG 2.2.2.
- Priorität: Soll – Grund: prägende Bewegung.
- Entscheidung: Neu interpretieren
- Ziel in der Plattform: components/reviews/ReviewScroller.tsx.
- Gestaltung: folgt KERN (P2); vorläufige Idee: Maus-Ziehen mit Auslaufen, danach rastet die nächste Karte ein.
- Abnahme: Maus-Ziehen scrollt die Reihe mit Auslaufen; Pfeile und Tastatur bleiben; ohne Eingabe bewegt sich nichts; bei reduzierter Bewegung springt sie · Bildpaar belege/p0-altstand/alt-start__d1440-light__11.webp, belege/p0-altstand/alt-start__d1440-light__12.webp / belege/p0-ausgangsstand/start__d1440-light__07.webp.
- Status: offen
- Unsicherheit: keine

### E-START-047 · Kurzantwort-Box „Warum lohnt sich ein Wechsel …?“ (AIAnswerBox)
- Kategorie: Suche und Technik
- Quelle: ALT-START-315–323 · components/seo/AIAnswerBox.tsx:7-51 · Bild: belege/p0-altstand/alt-start__d1440-light__13.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: FAQPage-JSON-LD in components/home/FaqSection.tsx, /llms.txt und /llms-full.txt aus Registry und Fakten, Inhalte in `#vorteile`; ROADMAP §5 und §10: „AIAnswerBox (dupliziert die FAQ)“, „die doppelte AIAnswerBox-Microdata entfällt“)
- Aufgabe: Eine kompakte, zitierfähige Antwort auf „Warum lohnt sich ein Wechsel …?“ für Suchmaschinen und KI sowie für Menschen.
- Wesenskern: Frage „Kurzantwort: Warum lohnt sich ein Wechsel zur Bad und Energie GmbH Lahn Dill?“; Absatz „Die Bad und Energie GmbH Lahn Dill ist ein etablierter Innungs Meisterbetrieb seit 1926 in Wetzlar (Siegmund-Hiepe-Str. 20), geführt von […]“ (38 Wörter); sechs Punkte (Vergütung plus Urlaubs- und Weihnachtsgeld, 30 Tage, Freitags ab 13:30 Uhr, Hilti ohne Eigenbeteiligung, Firmenwagen mit Tankkarte, 35 km ohne Fernmontagen). Die Microdata (`FAQPage`, `Question`, `Answer`) war ein zweites FAQPage neben dem JSON-LD.
- Freiraum: Ein sichtbarer Abschnitt „Auf einen Blick“ ist möglich, aber ohne Schema-Auszeichnung.
- Bindungen: FAQPage genau einmal (`scripts/qa/check-graph.mjs`); /llms.txt.
- Priorität: Soll – Grund: Auffindbarkeit; die Aufgabe ist an anderer Stelle erfüllt.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/FaqSection.tsx (JSON-LD), app/llms.txt.
- Gestaltung: folgt KERN (P2).
- Abnahme: `/` enthält genau ein FAQPage-JSON-LD und kein `itemtype` FAQPage; /llms.txt nennt „seit 1926“, „15 Mitarbeiter“, „30 Arbeitstage bezahlter Erholungsurlaub“ (`FACTS.vacation30.long`, lib/content/facts.ts:54-60) und „maximal 35 km“; die Prüfstrings werden aus den Fakten abgeleitet, nicht als Freitext „30 Tage“ (GET `/llms.txt` enthält „30 Tage“ nicht) (korrigiert nach P1-GEGEN-02; vorher: „/llms.txt nennt 1926, 15 Mitarbeiter, 30 Tage und 35 km“) · Bildpaar belege/p0-altstand/alt-start__d1440-light__13.webp / –.
- Status: offen
- Unsicherheit: Runde 2: Die Punkte Vergütung (über Tarif plus Urlaubs- und Weihnachtsgeld) und Hilti-Ausstattung fehlen derzeit in /llms.txt (Kurzfassung); sie kehren mit E-SEO-014 zurück, damit die Aufgabe dieses Elements vollständig im Ersatz lebt. Sonst keine.

### E-START-048 · Kontaktbereich „Sprich direkt mit Meister Sabri Demir“ (Direktkontakt-Karte)
- Kategorie: Einbindung Dritter
- Quelle: ALT-START-325–335 · app/page.tsx:891-899; components/contact/DirectContactCard.tsx:8-87; lib/seo/site-config.ts:36-38 · Bild: belege/p0-altstand/alt-start__d1440-light__13.webp, belege/p0-altstand/alt-start__d1440-light__14.webp
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-88: Kontaktzeile im CTA-Band (06441 42956 · WhatsApp · info@bad-energie.de · Öffnungszeiten); die Karte mit Ansprechpartner steht nur auf den Stellenseiten (NEU-STELLEN-T18); Adresse im Fuß)
- Aufgabe: Ein direkter, persönlicher Draht zum Chef: anrufen, WhatsApp schreiben oder mailen, ohne Hürde.
- Wesenskern: Eyebrow „Persönlicher Austausch“; H2 „Sprich direkt mit Meister Sabri Demir“; „Ob Fragen zu den Stellen, Konditionen oder eine unverbindliche Anfrage: Wir stehen Dir ohne bürokratische Hürden zur Verfügung.“; Karte „Direkter Ansprechpartner · Meisterkontakt in Wetzlar“ („Spreche direkt mit Geschäftsführer Diplomingenieur Sabri Demir ohne Warteschleifen.“) mit „Telefon Direkt 06441 42956“ (`tel:+49644142956`), „WhatsApp Direkt 06441 42956“ (api.whatsapp.com/send?phone=49644142956, Vortext „Guten Tag Herr Demir, ich interessiere mich für eine Stelle bei Bad und Energie.“), „E Mail info@bad-energie.de“, Arbeitszeiten „Montag bis Donnerstag von 07:00 bis 16:45 Uhr, Freitag von 07:00 bis 13:30 Uhr“, „Werkstatt und Büro – Siegmund-Hiepe-Str. 20, 35578 Wetzlar“. Ausgangsstand: dieselben drei Kanäle in fester Reihenfolge (WCAG 3.2.6), WhatsApp mit Standardtext. Verloren: der Mensch im Kontaktblock, „ohne Warteschleifen“, die Adresse beim Kontakt. Der Titel ist offen (A5).
- Freiraum: Ansprechpartner-Karte (`ContactOptions` als `card` mit `person`) im CTA-Band; keine doppelten Namensangaben.
- Bindungen: `tel:+49644142956`; WhatsApp-Nummer gleich der Festnetznummer (ROADMAP §13: WhatsApp Business offen); `COMPANY.managingDirector`.
- Priorität: Soll – Grund: die Kanäle sind vollständig vorhanden, es fehlt die Persönlichkeit.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: components/home/CtaBand.tsx (`ContactOptions` mit Name und Rolle).
- Gestaltung: folgt KERN (P2).
- Abnahme: `/` zeigt bei den Kontaktkanälen den Namen „Sabri Demir“ und die Kanäle in der Reihenfolge Telefon, WhatsApp, E-Mail · Bildpaar belege/p0-altstand/alt-start__d1440-light__13.webp, belege/p0-altstand/alt-start__d1440-light__14.webp / belege/p0-ausgangsstand/start__d1440-light__09.webp.
- Status: offen
- Unsicherheit: keine

### E-START-049 · Schnellformular „Unverbindliche Schnellbewerbung oder Anfrage“
- Kategorie: Funktion
- Quelle: ALT-START-336–345 · components/contact/LeadQuickForm.tsx:19-237 · Bild: belege/p0-altstand/alt-start__d1440-light__13.webp, belege/p0-altstand/alt-start__d1440-light__14.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: bewusst entfernt (ROADMAP §5: „LeadQuickForm (wäre ein vierter Funnel)“, §9.3 „Die Kontakt-API entfällt“; Commit a2f641d löschte Formular und `/api/contact`, GET darauf liefert 404); Ersatz: Initiativbewerbung (NEU-STELLEN-13, NEU-BEW-10), Kontaktkanäle (E-START-048), Feld „Nachricht“ auf der Danke-Seite (NEU-DANKE-20))
- Aufgabe: Eine unverbindliche schriftliche Anfrage oder Kurzbewerbung für Menschen, die nicht anrufen wollen.
- Wesenskern: Kopf „Unverbindliche Schnellbewerbung oder Anfrage“ / „In 60 Sekunden ausgefüllt. Meister Sabri Demir meldet sich verlässlich bei Ihnen.“ (Sie-Anrede, sonst Du: Befund); Felder „Vollständiger Name *“, „E Mail Adresse *“, „Telefonnummer“, „Ihre Nachricht oder Qualifikation“; Einwilligung „Ich willige in die Verarbeitung meiner Angaben gemäß der Datenschutzerklärung ein. Diese Einwilligung kann ich jederzeit widerrufen.“ (ohne Link); Honeypot; „Anfrage jetzt absenden“ → POST `/api/contact`; Fehler „Es gab ein Problem bei der Übermittlung. Bitte rufen Sie uns direkt an oder schreiben Sie per WhatsApp.“; Erfolg „Vielen Dank für Ihre Nachricht! … Eine Bestätigung ist unterwegs an Ihre E Mail Adresse.“ (Versand im Altstand nicht geprüft). Das Wesen ist die niedrige Schwelle für eine Frage ohne Bewerbung; im Ausgangsstand geht das per Telefon, WhatsApp, E-Mail oder „Initiativ bewerben“.
- Freiraum: Falls ein Formular gewünscht ist: ein Freitextfeld in der Initiativbewerbung statt eines vierten Formulars.
- Bindungen: `/api/contact` existiert nicht mehr (404), es gibt keinen eingehenden Link; Einwilligungstext und Datenschutz müssten neu gefasst werden.
- Priorität: Muss (korrigiert nach E-014; vorher Soll) – Grund: Kontakt-Funktion, die Kanäle sind vorhanden.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: –
- Gestaltung: folgt KERN (P2).
- Abnahme: `/` bietet ohne Formular drei Kontaktwege und die Initiativbewerbung mit einem Klick · Bildpaar belege/p0-altstand/alt-start__d1440-light__13.webp, belege/p0-altstand/alt-start__d1440-light__14.webp / belege/p0-ausgangsstand/start__d1440-light__09.webp.
- Status: offen
- Unsicherheit: keine (Produktfrage, siehe OFFENE FRAGEN: Wird ein schriftliches Anfrageformular vermisst?)

### E-START-050 · FAQ: fünf Fragen zum Bewerbungsprozess
- Kategorie: Interaktives
- Quelle: ALT-START-347–354 · app/page.tsx:134-149, 916-942 · Bild: belege/p0-altstand/alt-start__d1440-light__14.webp (nur Frage 1 sichtbar), unterer Teil im Vollbild `.roh/p0-altstand/alt-start__d1440-light.png` (Vollbild, unterer Teil; nicht in den Ausschnitten 01–14)
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: NEU-START-78…83: fünf Fragen als exklusive `<details>` mit FAQPage-JSON-LD (components/home/FaqSection.tsx, lib/content/faq.ts))
- Aufgabe: Einwände vor der Bewerbung klären.
- Wesenskern: Eyebrow „Häufige Fragen“; H2 „Alles Wichtige zum Bewerbungsprozess“; „Offene Antworten auf Fragen, die Monteuren und Gesellen wichtig sind.“; fünf Fragen: „Wie läuft der diskrete Wechsel ab, wenn ich noch bei einem anderen Betrieb angestellt bin?“ · „Brauche ich ein Anschreiben oder einen Lebenslauf für den ersten Kontakt?“ · „Welche Heizsysteme und Sanitäranlagen montieren wir hauptsächlich?“ · „Darf das Firmenfahrzeug mit nach Hause genommen werden?“ · „Gibt es bei Bad und Energie Fernmontagen oder Notdienst Zwang?“. Ausgangsstand: Du-Form und gekürzt; Frage 2 ohne „für den ersten Kontakt“ und ohne „in zwei Minuten“ (B4); Frage 3 „montiert ihr“; Frage 5 „Gibt es Fernmontagen oder Wochenendarbeit?“ (B16) mit Antwort ohne „Wochenendarbeit ist ausgeschlossen“ (B23 offen); Frage 3 nennt weiter „ELEMENTS, VIGOUR, Kermi und Geberit“ (B15 offen).
- Freiraum: Reihenfolge und Zahl; die Einleitung „Offene Antworten …“ darf zurückkehren.
- Bindungen: Anker `#faq` bleibt gleich; das FAQPage-JSON-LD muss genau diese fünf Fragen tragen (`buildFaqPageJsonLd`); die Stellenseiten nutzen Teilmengen (`JOB_FAQ_IDS`).
- Priorität: Muss – Grund: Suchwert (Rich Results) und Einwandbehandlung.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/FaqSection.tsx, lib/content/faq.ts.
- Gestaltung: folgt KERN (P2).
- Abnahme: Fünf Fragen, immer nur eine offen, JSON-LD stimmt mit dem sichtbaren Text überein · Bildpaar belege/p0-altstand/alt-start__d1440-light__14.webp / belege/p0-ausgangsstand/start__d1440-light__08.webp, belege/p0-ausgangsstand/start__d1440-light__09.webp.
- Status: offen
- Unsicherheit: keine

### E-START-051 · Schluss-CTA „Bereit für ein faires Angebot …?“
- Kategorie: Navigation
- Quelle: ALT-START-356–360 · app/page.tsx:949-974 · Bild: `.roh/p0-altstand/alt-start__d1440-light.png` (Vollbild, unterer Teil; nicht in den Ausschnitten 01–14)
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: NEU-START-84…88 CTA-Band „Bewirb dich bei uns.“ mit „Jetzt bewerben“ und Kontaktzeile; die Unverbindlichkeits-Zeile und der Passungston fehlen)
- Aufgabe: Die letzte Gelegenheit zu handeln, ohne Druck.
- Wesenskern: Pille „100% Unverbindlich · Kein Risiko · Keine Verpflichtung“; „Bereit für ein faires Angebot mit echter handwerklicher Wertschätzung?“; „Nutze jetzt unsere Expressbewerbung in unter 60 Sekunden oder das 4 Wege Bewerberportal und lass uns ganz ungezwungen herausfinden, ob wir zueinander passen.“; Knopf „Expressbewerbung starten“ (→ `#express-funnel`) und Link „Zum 4 Wege Bewerberportal“. Ausgangsstand: „Bewirb dich bei uns.“, „Sabri Demir meldet sich schnellstmöglich bei dir.“, ein Knopf, Telefon, WhatsApp, E-Mail. Die Rahmung des Doppelrahmens (ALT-START-355) ist reine Dekoration.
- Freiraum: Eine Zeile „Unverbindlich. Kein Lebenslauf.“ unter dem Knopf; der Ton „fair“ und „Wertschätzung“.
- Bindungen: `data-primary-cta`; Ziel `/bewerbung`.
- Priorität: Soll – Grund: senkt die Schwelle am Ende der Seite.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: components/home/CtaBand.tsx, `CTA` in components/home/content.ts.
- Gestaltung: folgt KERN (P2).
- Abnahme: Das CTA-Band enthält „unverbindlich“ und genau einen primären Knopf plus die Kontaktzeile · Bildpaar `.roh/p0-altstand/alt-start__d1440-light.png` (Vollbild, unterer Teil; nicht in den Ausschnitten 01–14) / belege/p0-ausgangsstand/start__d1440-light__09.webp.
- Status: offen
- Unsicherheit: keine

### E-START-052 · Anker und Sprungziele der Startseite
- Kategorie: Navigation
- Quelle: ALT-START-029, 105, 146, 187, 197, 205, 226, 281, 324, 346 · app/page.tsx:305-308, 316, 548-549, 566-569, 600-602, 687-689, 721-723, 863-865, 888-890, 913-915 · Bild: –
- Zustand: geschwächt (+ Gegenstück im Ausgangsstand: Befund aus dem gerenderten HTML (`curl`): vorhanden `#stellen`, `#einsatzgebiet`, `#faq` (gleich geblieben), neu `#vorteile`, `#ablauf`, `#ueber-uns`; es fehlen `#express-funnel`, `#karriere-paket`, `#gehalt`, `#benefits`, `#ausstattung`, `#wechsel-prozess`, `#bewertungen`, `#kontakt`)
- Aufgabe: Alte Links (Shares, Anzeigen, frühere Navigation) springen an die richtige Stelle.
- Wesenskern: Zuordnung Alt → Ziel im Ausgangsstand: `#express-funnel` → `/bewerbung` (Hauptaktion); `#stellen` → gleich; `#karriere-paket` und `#gehalt` → `#stellen` (Gehaltsspannen) bzw. der Konfigurator (E-START-024); `#benefits` → `#vorteile`; `#ausstattung` → `#vorteile` (Unterblock, E-START-026); `#wechsel-prozess` → `#ablauf`; `#einsatzgebiet` → gleich; `#bewertungen` → `#ueber-uns` (Stimmen); `#kontakt` → CTA-Band (id ergänzen); `#faq` → gleich. Im Altstand stand `express-funnel` doppelt im DOM (Befund).
- Freiraum: Aliase als zusätzliche IDs an den neuen Abschnitten oder ein kleines Hash-Mapping im Client mit Weiterleitung auf `/bewerbung`.
- Bindungen: Eingehende Links `https://karriere.bad-energie.de/#…`; das Paket P1-REST-03 sammelt alte URLs und Anker (Z-06); `scroll-padding` für den Sticky-Header.
- Priorität: Muss – Grund: eingehende Links und Seiten mit Suchwert.
- Entscheidung: Rückführen (Alias-Anker)
- Ziel in der Plattform: app/page.tsx und components/home/* (id-Attribute), kleiner Client-Teil für `#express-funnel`.
- Gestaltung: folgt KERN (P2); keine sichtbare Gestaltung.
- Abnahme: Playwright: `goto('/#benefits')` scrollt zu `#vorteile` (Überschrift sichtbar), `#express-funnel` landet auf `/bewerbung`, kein doppeltes `id` im DOM · Bildpaar entfällt.
- Status: offen
- Unsicherheit: keine

### E-START-053 · Pulsierende Live-Punkte (Ping)
- Kategorie: Bewegung
- Quelle: keine ALT-Zeile · Bewegungsspalte der Zeilen ALT-START-008, 032, 106, 251, 253, 265, 284, 299 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp, belege/p0-altstand/alt-start__d1440-light__09.webp, belege/p0-altstand/alt-start__d1440-light__11.webp
- Zustand: verloren (+ Gegenstück im Ausgangsstand: keines (ROADMAP §4 verbietet pulse und ping; `scripts/qa/check-design-tokens.mjs` bricht den Build))
- Aufgabe: Live-Anmutung („hier ist etwas aktiv“): grüner Punkt am Badge, roter Punkt an der Funnel-Pille, Punkt am Stellen-Eyebrow, Statuspille Firmensitz, Pin des Firmensitzes, Punkt am Google-Zeichen, Punkt der Tipp-Zeile.
- Wesenskern: `animate-pulse` und `animate-ping` in Dauerschleife, ohne Aussage hinter dem Punkt (keiner zeigt einen echten Zustand). Das Wesen wäre, einen echten Zustand zu zeigen (z. B. „Stellen offen“, „Büro jetzt besetzt“).
- Freiraum: Nur dort, wo ein echter Zustand besteht, einmalig oder als ruhiger Atem; bei reduzierter Bewegung statisch.
- Bindungen: `isWithinOpeningHours` (lib/apply/office-hours.ts) für ein „Büro jetzt besetzt“; Guard gegen `animate-ping|pulse`.
- Priorität: Kann – Grund: Dekoration.
- Entscheidung: Neu interpretieren (nur Statuspunkte mit Bedeutung)
- Ziel in der Plattform: ein Statuspunkt-Bauteil (P3), z. B. am Telefon im Kopf oder an „Offene Stellen“.
- Gestaltung: folgt KERN (P2).
- Abnahme: Keine Dauerpulsation (Guard grün); ein Statuspunkt zeigt nur einen belegbaren Wert · Bildpaar siehe Quelle.
- Status: offen
- Unsicherheit: keine

### E-START-054 · Karten-Hover-Anhebung (Hover-Lifts)
- Kategorie: Bewegung
- Quelle: keine ALT-Zeile · Bewegungsspalte der Zeilen ALT-START-086, 112, 121, 130, 139 (Stellenkarten), 191–196 (Vorteile), 201–204 (Ausstattung), 301–314 (Bewertungen); app/globals.css:155-170 (`btn-crimson-glow`) · Bild: belege/p0-altstand/alt-start__d1440-light__03.webp, belege/p0-altstand/alt-start__d1440-light__06.webp
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: `Card` mit `interactive`: `transition-colors duration-fast hover:bg-surface-3` (components/ui/Card.tsx:14-16); Vorteilskacheln statisch)
- Aufgabe: Rückmeldung „ich kann klicken“ bei Karten und Knöpfen.
- Wesenskern: Anheben um 4 px mit Schatten und 300 ms Übergang bei Karten, beim Absenden-Knopf Hebung um 1 px mit stärkerem Schatten und Aktivzustand (0,25 s). Im Altstand hoben sich auch nicht klickbare Karten (Vorteile, Ausstattung, Bewertungen), das Signal war dort falsch.
- Freiraum: Farbwechsel oder Anhebung nur bei klickbaren Karten; `:focus-visible` gleichwertig.
- Bindungen: `Card` (components/ui/Card.tsx), Tastaturfokus, `prefers-reduced-motion`.
- Priorität: Kann – Grund: Feedback ohne eigene Aufgabe.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/ui/Card.tsx.
- Gestaltung: folgt KERN (P2).
- Abnahme: Die JobCard reagiert bei Hover und bei Fokus sichtbar; nicht klickbare Kacheln reagieren nicht · Bildpaar belege/p0-altstand/alt-start__d1440-light__03.webp / belege/p0-ausgangsstand/start__d1440-light__02.webp.
- Status: offen
- Unsicherheit: keine

### E-START-055 · Kennzahl „> 3.000 Projekte“
- Kategorie: Vertrauen
- Quelle: keine ALT-Zeile · keine ALT-Zeile; nur Historie: `git show 9717265:app/page.tsx` Zeilen 254-257 („&gt; 3.000“ / „Projekte“), entfernt in Commit 075aa71 (2026-10-06) · Bild: –
- Zustand: verloren (+ Gegenstück im Ausgangsstand: keines; im Altstand f2e7eae steht an der Stelle „15 · Mitarbeiter“ (E-START-010))
- Aufgabe: Erfahrung durch eine Projektzahl belegen.
- Wesenskern: „> 3.000 · Projekte“ als dritte Kachel im Hero der frühen Fassung. Im Altstand `main` @ f2e7eae kommt die Zahl nirgends vor; Commit 075aa71 („Faktenbereinigung“) ersetzte sie durch „15 Mitarbeiter“. Im Repo gibt es keine Quelle für die Zahl, `lib/content/facts.ts` kennt sie nicht.
- Freiraum: –
- Bindungen: –
- Priorität: Kann – Grund: unbelegte Zahl.
- Entscheidung: Nicht zurückführen (erfunden/unbelegt)
- Ziel in der Plattform: –
- Gestaltung: –
- Abnahme: `/` enthält keine Projektzahl ohne Eintrag in `lib/content/facts.ts` (Textsuche) · Bildpaar entfällt.
- Status: offen
- Unsicherheit: keine

### E-START-056 · Schlüssel, Ladeweg und Rückfall der Google-Karte
- Kategorie: Einbindung Dritter
- Quelle: ALT-START-381–388 · lib/maps/google-maps-loader.ts:18-195; lib/maps/google-maps-config.ts:14-15; components/maps/InteractiveMap.tsx:29, 51, 59-94, 134-148, 194-198, 277-288, 392-412; app/api/maps/config/route.ts:5-40; middleware.ts:19-29; .env.example:28-40 · Bild: belege/p0-altstand/alt-start__d1440-light__10.webp (nur der Zustand „Vektor-Modus aktiv“)
- Zustand: verschoben (+ Gegenstück im Ausgangsstand: lib/maps/keys.ts (Platzhalter-Filter `isUsableMapsApiKey`, Serverprüfung `isGoogleMapsConfigured` beim Rendern von components/maps/RegionMap.tsx:47), lib/maps/google-maps-loader.ts (Schlüsselauflösung, Skript, `gm_authFailure`, `script.onerror`, Zeitgrenze 10 s), components/maps/GoogleRegionMap.tsx (Ebene, `try/catch` beim Erzeugen, Zeitgrenze 15 s bis zu den Kacheln, Wechsel), components/maps/RegionExplorer.tsx (Statustext, Entfernen der Ebene), app/api/maps/config/route.ts. Am Ausgangsstand gemessen (GET `/` am 2026-10-09): kein Knopf „Interaktive Karte laden“, kein Verweis auf maps.googleapis.com im HTML, weil im Build kein Schlüssel gesetzt ist; `GET /api/maps/config` antwortet im Messkontext 403 mit `{"ok":false,"error":"FORBIDDEN"}`)
- Aufgabe: Die Google-Karte erscheint nur mit einem gültigen Schlüssel, und die Seite bleibt bei jedem Fehler benutzbar: Die Übersicht mit allen Orten bleibt stehen. Für das Unternehmen heißt das: kein kaputter Kartenkasten und keine Fehlermeldung von Google auf der Karriereseite.
- Wesenskern: (1) Schlüssel (ALT-START-381, -382): „MY_GOOGLE_MAPS_API_KEY“, das Präfix „AIzaSy_placeholder“ und eine leere Zeichenfolge (nach trim) gelten als kein Schlüssel, im Loader und in der Route. Reihenfolge: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (zur Bauzeit eingesetzt), dann GET /api/maps/config (serverseitig NEXT_PUBLIC… dann GOOGLE_MAPS_API_KEY; Antwort {apiKey, mapId, hasKey}, Cache-Control „private, no-cache, no-store“; Referer- und Herkunftsregeln: E-SEO-017); ohne Schlüssel bleibt die Grafik. Altstand: Pille „Vektor-Modus aktiv“, die Google-Ebene wurde gar nicht eingehängt; live im Altstand-Build lieferte die Route {"apiKey":"","mapId":"","hasKey":false}. (2) Karten-ID (ALT-START-383): Die Route liefert `mapId` (NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID, dann GOOGLE_MAPS_MAP_ID), die Karte bekam sie nie (`getGoogleMapsMapId` wurde nirgends aufgerufen); die Optik kam allein aus den eingebauten Stilregeln. Im Ausgangsstand gleich (`buildMapStyle`, E-START-034); kein Cloud-Kartenstil, nicht zurückführen. (3) Skript (ALT-START-384): https://maps.googleapis.com/maps/api/js?key=…&libraries=geometry,marker&v=weekly&callback=__googleMapsLoadedCallback, async und defer, ein geteiltes Versprechen je Seite, Start erst nach aufgelöstem Schlüssel. Ausgangsstand: key, v=weekly, language=de, region=DE, callback=__beGoogleMapsLoaded, async, Start erst nach der Zwei-Klick-Einwilligung (E-START-032); die Bibliotheken geometry und marker fehlen und kommen nicht zurück (im Altstand nie angesprochen: klassische Marker, keine Geometrie-Aufrufe). Die Version „weekly“ bleibt rollierend. (4) Fehlerweg Auth-Fehler (ALT-START-385): Drei Auslöser, nämlich `window.gm_authFailure` (ungültiger Schlüssel, Referrer-Sperre, Kontingent), `script.onerror` und eine Ausnahme beim Erzeugen der Karte. Altstand: Pille „Lokale Vorschau (Vektor)“ mit Tooltip „Domain-/Referrer-Schutz aktiv. Lokale Vorschau nutzt den interaktiven Vektor-Modus.“, Google-Ebene aus dem DOM genommen, Vektor bleibt bis zum Neuladen (`resetGoogleMapsAuthError` wurde nie aufgerufen). Ausgangsstand: dieselben drei Auslöser (`hookAuthFailure`, `script.onerror` → `notifyAuthError`, `try/catch` um `createMap`), Folge: Status „failed“, die Google-Ebene wird entfernt, die Grafik bleibt, Statustext „Google Maps ist gerade nicht verfügbar. Die Übersicht zeigt alle Orte.“ (`role="status"`). Der Tooltip kommt nicht zurück: Er nannte immer „Domain-/Referrer-Schutz“, auch wenn nur das Skript nicht lud (Altstand-Befund). (5) Fehlerweg Timeout (ALT-START-386): Altstand 8 s, danach Ende des Ladens ohne Auth-Fehler; die Pille blieb „Vektor-Modus aktiv“, die Google-Ebene blieb mit opacity-0 und pointer-events-none unsichtbar eingehängt (nur beim Laden und beim Timeout; nach einem Auth-Fehler wurde sie entfernt). Ausgangsstand: 10 s im Loader, dazu 15 s bis zu den Kacheln; danach Status „failed“, Ebene entfernt, derselbe Statustext. Die Sekundenwerte sind Technik. (6) Ebenenwechsel (ALT-START-387): Altstand: Die Vektorfläche wurde sofort entfernt (kein Ausblenden), nur die Google-Ebene blendete mit transition-opacity 300 ms ein. Ausgangsstand: Die Grafik bleibt sichtbar, bis die Kacheln geladen sind (`tilesloaded`); bis dahin ist die Google-Ebene unsichtbar und `inert`, dann blendet sie über `duration-step` ein und die Grafik wird `invisible`; Zeit und Kurve folgen dem Bewegungsregister (KERN K-009). (7) Ungenutzte Exporte (ALT-START-388): `resetGoogleMapsAuthError`, `getGoogleMapsMapId`, `DEFAULT_MAP_ZOOM` 12 und `MAX_SERVICE_RADIUS_KM` (im Altstand importiert, nicht benutzt) hatten keine Wirkung. Im Ausgangsstand sind die ersten beiden weiter ungenutzt, `MAX_SERVICE_RADIUS_KM` zeichnet den Radiuskreis, `DEFAULT_MAP_ZOOM` besteht nicht mehr. Kein Wesenskern, nur Einordnung. Alle Zustände mit Schlüssel sind im Altstand nicht im Browser beobachtet (kein Schlüssel im Build).
- Freiraum: Sekundenwerte der Zeitgrenzen, Wortlaut des Statustexts, Ladetechnik (z. B. `importLibrary` statt Skript-Rückruf), festgelegte Skript-Version statt „weekly“; eine Karten-ID nur bei Wunsch nach Cloud-Kartenstil (Vermutung: Die Stilregeln kämen dann aus der Cloud-Konsole statt aus `styles`; nicht geprüft).
- Bindungen: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_API_KEY, NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID und GOOGLE_MAPS_MAP_ID (.env.example; docs/operations/betrieb.md 2.4); `/api/maps/config` (E-SEO-017: Referer- und Herkunftsprüfung, proxy.ts); Einwilligung `be:maps-consent:v1` und `/datenschutz#google-maps` (E-RECHT-022); Test lib/maps/__tests__/labels.test.ts (`isUsableMapsApiKey`, `isGoogleMapsConfigured`); für Loader, Fehlerwege und Ebenenwechsel besteht kein Test.
- Priorität: Soll – Grund: Absicherung einer Muss-Funktion (Karte, ROADMAP §1), im Ausgangsstand erfüllt. Der Atlas schlägt für ALT-START-381 bis -387 Soll und für -383 und -388 Kann vor; der Pass bleibt Soll, weil eine Karte ohne Rückfall die Übersicht der Orte verdrängen könnte.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: lib/maps/keys.ts, lib/maps/google-maps-loader.ts, components/maps/GoogleRegionMap.tsx, components/maps/RegionExplorer.tsx, app/api/maps/config/route.ts
- Gestaltung: folgt KERN (P2); vorläufige Idee: kein eigenes Element, der Statustext bleibt eine ruhige Fußnote unter dem Kartenknopf und die Grafik bleibt stehen.
- Abnahme: Ohne Schlüssel kein Knopf und keine Anfrage an Google (curl und Anfrageprotokoll); `isUsableMapsApiKey` mit den Platzhaltern (vorhanden); mit Schlüsselattrappe und gesperrtem Google-Host zeigt Playwright nach Einwilligung bei Skriptfehler, `window.gm_authFailure()` und Zeitgrenze den Statustext und die sichtbare Grafik, die Seite bleibt bedienbar. Testweg (korrigiert nach P1-GEGEN-02; vorher: „(Test zu ergänzen)“): eine eigene Build-Variante mit `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`-Attrappe für einen zweiten E2E-Webserver (der vorhandene Aufbau startet nur einen Build ohne Schlüssel: playwright.config.ts:54-57, ein Webserver `next start`, `reuseExistingServer: false`; der Knopf „Interaktive Karte laden“ wird beim Rendern der statischen Startseite entschieden, components/maps/RegionMap.tsx:47 und lib/maps/keys.ts:11-13) oder ein Komponententest mit gestubbtem `window.google.maps` (dafür eine DOM-Umgebung in Vitest ergänzen, vitest.config.ts:12 steht auf `environment: 'node'`). Dieser Testweg gilt ebenso für die Abnahmen „mit Schlüsselattrappe“ von E-START-032, -033, -034, -035 und -038 · Bildpaar belege/p0-altstand/alt-start__d1440-light__10.webp / belege/p0-ausgangsstand/start__d1440-light__04.webp
- Status: offen
- Unsicherheit: Die Zustände „Google Maps Live“ und „Lokale Vorschau (Vektor)“ des Altstands sind nur aus dem Quelltext belegt; der Ausgangsstand zeigt die Google-Karte nie (kein Schlüssel), die Fehlerwege sind ungetestet. Ob die Produktion einen Schlüssel bekommt, steht in F6.

## Ohne eigenes Element

| Atlas-ID | Grund |
|---|---|
| ALT-START-007 | reine Dekoration. Hintergrundverlauf Weiß → #F8FAFC → #F1F5F9 mit zwei unscharfen Lichthöfen (Blau, Rot) im Hero (app/page.tsx:155-158); der Ausgangsstand nutzt flache Flächen (ROADMAP §4: Blobs und Gradient-Body entfernt). |
| ALT-START-018 | reine Dekoration. Doppelrahmen-Karte „double-bezel“ um die Zitatkarte (app/page.tsx:240-243); ROADMAP §4 entfernt Double-Bezel. Inhalt der Karte: E-START-008, 009, 010. |
| ALT-START-186 | unverändert vorhanden (nie gerendert). `COMPENSATION_GUARANTEES` (pricing.constants.ts:92-99) und `ROLE_CONFIGS.label/description` waren exportiert, aber nirgends gezeigt. Belegte Teile stehen als Fakten in lib/content/facts.ts (`permanentContract`, `vacation30`, `friday1330`, `radius35`); „Pünktlichste Gehaltszahlung am 1. Werktag“ ist offen (A3, `payFirstWorkday` pending), „Garantiertes Urlaubs- und Weihnachtsgeld als feste Jahressonderzahlung“ ist unbelegt. |
| ALT-START-222 | reine Dekoration. Icon-Kachel mit ShieldCheck (emerald-100) vor „Bereit für den diskreten ersten Schritt?“ (app/page.tsx:692-696). Inhalt der Leiste: E-START-027. |
| ALT-START-260 | reine Dekoration. Punktraster (28 px) und Grundfarbe der Vektorfläche der Karte (InteractiveMap.tsx:404-421). Karteninhalt: E-START-032, 036. |
| ALT-START-355 | reine Dekoration. Doppelrahmen-Karte um die Schlussbox (app/page.tsx:947-948). Inhalt: E-START-051. |

## Zuordnungsprüfung

| Größe | Anzahl |
|---|---|
| Atlaszeilen gesamt (ALT-START-001…388) | 388 |
| zugeordnet an Element-Pässe | 382 |
| ohne eigenes Element (Tabelle oben) | 6 |
| Summe | 388 (geht auf, jede Zeile genau einmal) |
| Pässe gesamt | 56 (davon 53 mit Atlaszeilen, 3 Querschnitts- oder Historienpässe ohne eigene Zeile: E-START-053, 054, 055) |

Zeilen je Pass: E-START-001: 6 · E-START-002: 2 · E-START-003: 2 · E-START-004: 3 · E-START-005: 1 · E-START-006: 2 · E-START-007: 1 · E-START-008: 2 · E-START-009: 1 · E-START-010: 5 · E-START-011: 1 · E-START-012: 30 · E-START-013: 2 · E-START-014: 6 · E-START-015: 12 · E-START-016: 5 · E-START-017: 3 · E-START-018: 1 · E-START-019: 1 · E-START-020: 7 · E-START-021: 8 · E-START-022: 4 · E-START-023: 36 · E-START-024: 40 · E-START-025: 9 · E-START-026: 7 · E-START-027: 19 · E-START-028: 3 · E-START-029: 10 · E-START-030: 6 · E-START-031: 2 · E-START-032: 10 · E-START-033: 2 · E-START-034: 3 · E-START-035: 3 · E-START-036: 3 · E-START-037: 1 · E-START-038: 21 · E-START-039: 3 · E-START-040: 1 · E-START-041: 3 · E-START-042: 5 · E-START-043: 13 · E-START-044: 7 · E-START-045: 3 · E-START-046: 6 · E-START-047: 9 · E-START-048: 11 · E-START-049: 10 · E-START-050: 8 · E-START-051: 5 · E-START-052: 10 · E-START-056: 8.

Die Nachträge der Gegenproben sind eingeordnet: ALT-START-361 (Ladezustand der Karte) in E-START-032, ALT-START-362 (Sammelzeile der Standortbeschreibungen und Einstufung der zehn Orte) in E-START-038, ALT-START-363 (Rollen- und Stufenbezeichnungen des Konfigurators, nicht gerendert) in E-START-024, ALT-START-364 (Ladezustand des Bewertungsbands, in der Liste der Runde 1 nicht enthalten und bis dahin keinem Pass zugeordnet) in E-START-042. Runde 1 ergänzte ALT-START-365 bis -374 (je Standort eine Zeile); alle zehn stehen in E-START-038, es entstand kein neuer Pass. Runde 2 ergänzte ALT-START-375 bis -377 (Google-Kartenstile „Porzellan“ und „Midnight“, Radiuskreis der Google-Ebene): 375 und 376 stehen in E-START-034, 377 in E-START-033; es entstand kein neuer Pass. Die Korrekturen zu ALT-START-255 (Stilnamen mit Verweis auf 375 und 376, Kartentyp je Modus, Fundstellen 114-126 und 59-188) und ALT-START-256 (Radius in Metern, Verweis auf 377, Fundstellen 96-112 und 206-214) sind in E-START-034 und E-START-033 übernommen. Die Korrekturen sind übernommen: 097 (die Trust-Leiste stand still, `animate-marquee` ist nicht definiert) in E-START-021, 086 (Hover-Hebung des Absenden-Knopfs) in E-START-012 und E-START-054, 090 (Skalierung 0,95 → 1 in 0,3 s) in E-START-019 und E-START-020, `animate-in` ohne Wirkung (InteractiveMap.tsx:556) in E-START-038.

Runde 3 (P1-REST-04-R3) ergänzte ALT-START-378 bis -388 (11 Zeilen, Kartenschicht des Altstands), maschinell geprüft: 378 steht in E-START-032 (Startansicht und Steuerelemente der Google-Ebene), 379 und 380 in E-START-038 (Standortwahl und Marker), 381 bis 388 (Platzhalter-Filter, Schlüsselreihenfolge, Karten-ID, Skript-URL, Fehlerweg Auth-Fehler, Fehlerweg Timeout, Ebenenwechsel, ungenutzte Exporte) im neuen Pass E-START-056, der genau diese 8 Zeilen führt. Zeilenzahlen: E-START-032 wuchs von 9 auf 10, E-START-038 von 19 auf 21, E-START-056 entstand mit 8. Die berichtigten Zeilen ALT-START-253 und -266 (E-START-032), -257 (E-START-035), -265, -267 und -271 (E-START-038), -247 (E-START-031) und -274 (E-START-039) behalten ihren Pass; ihre Berichtigungen stehen im Wesenskern dieser Pässe. Zustand, Priorität und Entscheidung der bestehenden Pässe sind unverändert; zu E-START-056 siehe die Verteilung oben. Die berichtigte Pillen-Beschreibung (ALT-START-253) und die Widersprüche zu „Firmensitz seit 1926“ (ALT-START-267) und „Schulungsräume“ (ALT-START-271) bleiben als „nicht zurückführen (unbelegt)“ dokumentiert, in E-START-032 und E-START-038.

Delta-Gegenprüfung P1-GEGEN-02 (korrigiert nach P1-GEGEN-02): keine neue Atlaszeile, keine Umordnung, kein neuer Pass; die Zuordnung bleibt 388 = 382 + 6 mit 56 Pässen und unveränderten Zeilenzahlen je Pass. Die Atlas-Nachträge „kein eigenes Element“ (Pin-Projektion der Vektoransicht, Kartenrahmen und Vollbild-Zustand des Altstands) stehen als Wesenskern von E-START-038 und E-START-035. Zustand und Priorität folgen jetzt den Passtexten (siehe Nachführung unter der Übersicht): E-START-034 geschwächt, E-START-038 Soll; Entscheidung unverändert.

## Anhang A · Abgleich der Pflicht-Kandidaten aus dem Auftrag

| Kandidat | Befund | Pässe |
|---|---|---|
| Express-Funnel im Einstieg und Quiz „Finde heraus, ob … passt“ | Bewerbungsweg vollständig im Flow (verschoben); der Passungston, Kenntnis- und Wunschfragen, Diskretionszeile am Kontaktschritt und die Fortschrittsanzeige einzeln bewertet; Vorbelegungen und Platzhalter bleiben draußen | E-START-012, 013, 014, 015, 016, 017, 018 |
| Trust-Leiste (HWK Wiesbaden, Innung, 1926) | Die Leiste hat sieben andere Einträge, HWK steht im Altstand nur im Fuß (ALT-SHELL-48); Innung nur als „100% Innungsbetrieb“; 1926 und das Jubiläum fehlen im Ausgangsstand-Hero (Fakt ungenutzt); die Leiste stand im Altstand still | E-START-021, 011, 002 |
| Zitatkarte Sabri Demir mit Checkliste | Person und Direktdraht leben im Über-uns-Block; das Hero-Zitat ist nicht freigegeben; die Checkliste ist zerlegt und bis auf die Platzierung vorhanden; „Zertifizierter Fachpartner“ nur in der belegten Fassung | E-START-008, 009, 010 |
| Meilenstein 2026 | gekürzt und ganz unten; Wachstumsgrund und Etikett fehlen | E-START-031 |
| Kennzahlen „> 3.000 Projekte“ (Beleg?) | Im Altstand f2e7eae nicht vorhanden; nur in der frühen Historie (9717265), am 2026-10-06 durch „15 Mitarbeiter“ ersetzt; kein Beleg im Repo | E-START-055 |
| Vorteils-/Ausstattungs-Konfigurator | Inhalte leben auf den Stellenseiten („Dein Paket“); die Auswahl-Interaktion fehlt; Zusatz-Perks offen (B11, A3) | E-START-024, 016 |
| Ausstattungs-Abschnitt „Werkzeug & Fuhrpark“ | drei von vier Karten leben als Kacheln; Messtechnik, eigener Abschnitt und Anker fehlen | E-START-026 |
| Wechselprozess mit Diskretion | vollständig verschoben (Ablauf); Diskretion im Erstblick und am Kontaktschritt schwach | E-START-027, 017 |
| Orts-Pillen | sieben Ortsnamen fehlen, „Hohenahr“ unbelegt (B17) | E-START-029 |
| Zentrale-Werkstatt-Karte | verloren; B15 und „B49 & A45“ offen | E-START-030 |
| Karte mit Radius-Umschalter 15/25/35, Kartenstilen, Radar, Flüssen/Straßen-SVG, Vollbild | Radiusgrafik und Pendelrechner leben; Radius-Umschalter, Landschafts-SVG, Radar, Vollbild, Routenlink verloren; Kartenstile durch Hell/Dunkel ersetzt; Google-Karte im Ausgangsstand ohne Schlüssel nie sichtbar; Schlüsselauflösung, Skript, Fehlerwege und Ebenenwechsel der Google-Ebene leben (Runde 3) | E-START-032, 033, 034, 035, 036, 037, 038, 039, 040, 056 |
| Pendelrechner | vollständig verschoben („Wo wohnst du?“ mit Tabelle) | E-START-039 |
| Bewertungsband (kinetisch, Filter) und Google-Badge | Filter Kunden/Team lebt; kinetische Bewegung verloren; Google-Badge ausgeblendet bis `asOf` (B25); vier Teamstimmen unbelegt | E-START-042, 043, 044, 045, 046 |
| AIAnswerBox | bewusst entfernt, Aufgabe über FAQPage und llms.txt erfüllt | E-START-047 |
| Kontaktbereich „Sprich direkt mit Meister Sabri Demir“ und Kontaktformular | Kanäle leben im CTA-Band, der Mensch im Kontaktblock fehlt; Formular und `/api/contact` bewusst entfernt. Die im Auftrag genannte Überschrift „Lieber erst einmal unverbindlich sprechen?“ steht im Altstand im Fuß (ALT-SHELL-43, Paket P1-REST-03), nicht im Formular der Startseite | E-START-048, 049 |
| FAQ-Fragen | alle fünf vorhanden, gekürzt und in Du-Form; B16, B23, B15 offen | E-START-050 |
| Schluss-CTA | geschwächt: Unverbindlichkeits-Zeile und Passungston fehlen | E-START-051 |
| Anker `#gehalt`, `#karriere-paket`, `#benefits`, `#ausstattung`, `#wechsel-prozess`, `#bewertungen`, `#kontakt`, `#express-funnel` | Alle acht im gerenderten HTML des Ausgangsstands nicht vorhanden; Zielzuordnung in E-START-052 | E-START-052 |
| Bewegungen (Konfetti, Fortschrittsbalken, Radar, Ping-Punkte, Hover-Lifts) | Konfetti → Haken; Fortschrittsbalken lebt; Radar, Ping verloren; Hover-Lifts durch Farbwechsel ersetzt; Laufband der Trust-Leiste stand im Altstand still | E-START-019, 014, 037, 053, 054, 021 |

## Anhang B · Offene Fragen (für den Owner oder die Urteilsrunde)

| Nr. | Frage | Pass |
|---|---|---|
| F1 | Wurde das „100 Jahre“-Badge im Hero bewusst weggelassen oder vergessen? Es gilt nur noch bis 31.12.2026. | E-START-002 |
| F2 | Soll „Rückmeldung binnen 24 Stunden“ wieder versprochen werden (A4)? | E-START-005 |
| F3 | Ist das Hero-Zitat „Wir suchen keine standardisierten Bewerbungsmappen …“ von Sabri Demir freigegeben? | E-START-009 |
| F4 | Welcher Titel gilt für Sabri Demir (A5)? | E-START-008, 048 |
| F5 | Ist „Eingetragen in die Handwerksrolle der Handwerkskammer Wiesbaden“ belegt, und wie lautet der Innungsname genau (B24)? | E-START-011 |
| F6 | Hat die Produktion einen Google-Maps-Schlüssel, oder soll sie einen bekommen? Ohne Schlüssel gibt es keine Google-Karte und keinen Knopf. | E-START-032, 056 |
| F7 | Welche Geodatenquelle und Lizenz gilt für Lahn, Dill, A45 und B49 in der SVG (z. B. OpenStreetMap mit Namensnennung)? | E-START-036 |
| F8 | Gehört „Hohenahr“ zum Einsatzgebiet (B17), und mit welchen Entfernungen und Fahrzeiten? | E-START-029 |
| F9 | Stimmen „B49 & A45“ und die Partner-Ausstellungen (ELEMENTS, VIGOUR, Kermi, Keuco, Geberit; B15)? | E-START-030, 050 |
| F10 | Ist „führender Spezialist für Wärmepumpen“ belegbar (B14)? | E-START-031 |
| F11 | Aktuelle Google-Zahlen, Abfragemonat und Profil-Link (B25)? | E-START-045 |
| F12 | Sind Michael S., Christian W., Tim K. und Dennis M. echte Personen mit freigegebenen Zitaten (B22)? | E-START-044 |
| F13 | Gibt es Spezialisten-Zulage, Monatsprämie und Gehalt am 1. Werktag wirklich (B11, A3)? | E-START-024 |
| F14 | Soll die Startseite einen zweiten Einstieg „Unterlagen einreichen“ zeigen, und wann kommt der Upload (Phase 2)? | E-START-007 |
| F15 | Ist die Auswahl-Interaktion des Konfigurators bewusst entfallen, oder soll „Dein Paket“ pro Rolle auf der Startseite wählbar sein? | E-START-024 |
| F16 | Wortlaut der Diskretionszusage am Kontaktschritt ohne § 26 BDSG: Prüfung durch den Datenschutzbeauftragten (ROADMAP §9.7). | E-START-017 |
| F17 | Sollen die Inhaber-Antworten auf die Google-Rezensionen wieder erscheinen? | E-START-043 |
| F18 | Wird ein schriftliches Anfrageformular vermisst, oder genügen Telefon, WhatsApp, E-Mail und die Initiativbewerbung? | E-START-049 |
| F19 | Ist Wochenendarbeit wirklich ausgeschlossen (B23), oder gibt es Ausnahmen? | E-START-050 |
| F20 | Soll der Statuspunkt („Büro jetzt besetzt“, „Stellen offen“) als belegbarer Live-Zustand zurückkehren? | E-START-053 |
| F21 | Dürfen die drei Geschäftsaussagen der Ortsbeschreibungen auf die Seite (Nauborn „… mit vielen Wärmepumpenmodernisierungen“, Braunfels „… mit anspruchsvollen Sanierungsobjekten“, Gießen „… wichtiges Kundendienstgebiet“)? Bis zur Bestätigung durch den Inhaber bleiben sie draußen (MENSCHEN M-016; korrigiert nach P1-GEGEN-02). | E-START-038 |
