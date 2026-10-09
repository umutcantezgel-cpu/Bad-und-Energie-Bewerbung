# Element-Pässe · Seitenrahmen, Rechtsseiten, Such- und Technikschicht

Kennung: P1-REST-03 (Runde 2: P1-REST-04-R2, Runde 3: P1-REST-04-R3) · Rolle Restaurator · Stufe 2 · Kern-Version 0
Stand: 2026-10-09 · Altstand = Git-Stand `main` @ f2e7eae (Pfade relativ zu `_relaunch/altstand/main/`) · Ausgangsstand = Arbeitsbaum a83269d (Pfade relativ zum Repo) · Bild-Pfade relativ zu `_relaunch/`.
Eingaben: `_relaunch/atlas/alt-shell-recht-seo.md` (306 Zeilen: ALT-SHELL 125, ALT-RECHT 75, ALT-SEO 106; Runde 1 ergänzte ALT-SEO-60 bis -74, den Wortlaut der JSON-LD-Beschreibungen, Benefit-Listen, Einsatzkreise und FAQ-Abweichungen; Runde 2 ergänzte ALT-SEO-75 bis -99, nämlich die JobPosting-Pflichtfelder, weitere JSON-LD-Felder, die @id-Adressen und den Wortlaut von llms.txt und llms-full.txt, und korrigierte ALT-SEO-12, -14, -16, -17, -18 bis -21, -43 und -44; Runde 3 ergänzte ALT-SEO-100 bis -106, nämlich @id, url, Verweise und Brotkrumen-Einträge der sechs Unterseiten-Knoten von /bewerbung, /datenschutz und /impressum samt Querverweisen und der Abhängigkeit von APP_URL, und berichtigte ALT-SEO-28 bis -33 und -86) und `_relaunch/atlas/neu-plattform.md` (NEU-SHELL-01 bis -24, NEU-RECHT-01 bis -25, NEU-SEO-01 bis -32; Neuatlas vollständig, maßgeblich blieb der Code).
Methode: Code des Ausgangsstands gelesen (components/site/*, components/brand/Logo.tsx, components/legal/*, app/datenschutz, app/impressum, app/not-found.tsx, app/error.tsx, app/global-error.tsx, app/layout.tsx, app/robots.ts, app/sitemap.ts, app/llms*, next.config.ts, proxy.ts, lib/seo/*, lib/content/*, docs/ROADMAP.md §1, §5, §9, §10, §13, docs/operations/datenschutz-aenderungen.md, docs/operations/fakten-abgleich.md, Commit-Nachrichten f2e7eae..a83269d). Gerendertes HTML beider Stände per `curl` (nur GET, ohne Weiterleitungen) abgeglichen: Altstand http://localhost:3600 (User-Agent Chrome/141), Ausgangsstand http://localhost:3500, Messtag 2026-10-09. Keine POST-Anfragen, keine Formularsendungen, `/api/indexnow?action=submit` nicht aufgerufen. Bildschirmfotos nur gelesen.
Zustände: unverändert vorhandene Zeilen stehen in der Tabelle „Ohne eigenes Element“; „verschoben“ heißt: Aufgabe lebt im Ausgangsstand an anderer Stelle oder in neuer Form; „geschwächt“: ein Teil der Aufgabe fehlt; „verloren“: nichts davon lebt.
Zählung der Pässe: siehe „Zuordnungsprüfung“. Die Impressum-Pflichtangaben sind in Anhang A wörtlich verglichen, alte URLs und Anker (Z-06) in Anhang B.

Wichtigste Befunde (Kurzfassung)
- Impressum: Keine Pflichtangabe des Altstands fehlt (Anhang A). Offen: USt-IdNr. (zwei Werte im Repo), Verbraucherschlichtung (§ 36 VSBG), Bestätigung der Streichung des OS-Satzes.
- Verloren oder geschwächt, belegt und zurückzuführen: „100 Jahre Meisterbetrieb (1926–2026)“ (Fakt vorhanden, nirgends gerendert, läuft 2026-12-31 ab), Zähler offener Stellen, WhatsApp-Zugang auf Desktop und Fuß, 404-Charakter „Rohrleitung verirrt“ mit Direktkontakt, Anker-Aliase der Startseite, fünf Einsatzorte (Solms, Hüttenberg, Lahnau, Ehringshausen, Wettenberg).
- Nicht zurückgeführt (erfunden oder unbelegt): Cookie-Tabellen und Analyse-Anbieter, Datenschutz-Siegel („Auditierte Verschlüsselung“, „100% …“-Karten, „Verifiziert Sicher“), `SearchAction`, „Ungelesen“-Punkt am WhatsApp-Kreis.
- Gebunden: IndexNow-Schlüsseldatei `/298d966b7e4f4a43981cb8e30da6b5b5.txt` lebt (statische Datei, 200); `INDEXNOW_KEY` muss gleich dem Dateiinhalt sein.
- Runde 3 (ALT-SEO-100 bis -106, 7 Zeilen, alle in E-SEO-008, am Ausgangsstand per GET auf `/bewerbung`, `/datenschutz` und `/impressum` am 2026-10-09 und im Code geprüft): Die WebPage von `/bewerbung` lebt mit `@id`, `url`, `isPartOf` und `inLanguage` (`app/bewerbung/page.tsx:57-69`; `@id` ohne Schrägstrich vor dem Anker, `isPartOf` löst jetzt immer auf den WebSite-Knoten des Wurzelgraphen auf); es fehlen der Verweis `breadcrumb` und die BreadcrumbList der Bewerbungsseite (kein sichtbarer Pfad im Fokus-Header, Entscheidung offen in E-BEW-029). Die Seitenknoten von Datenschutz und Impressum sind mit der Umstellung auf noindex ausdrücklich entfallen (`docs/operations/datenschutz-aenderungen.md` §1). Der Pass bleibt „Keine Rückführung nötig“, Kann; die Abweichung vom Vorschlag Soll ist im Pass begründet. Kein neuer Pass.
- Runde 2 (ALT-SEO-75 bis -99, 25 Zeilen, alle in bestehenden Pässen, am Ausgangsstand per GET und im Code geprüft): Die JobPosting-Pflichtfelder (hiringOrganization, jobLocation, educationRequirements, identifier, employmentType, datePosted, validThrough) leben vollständig aus der Stellen-Registry (E-SEO-010; Firmenname und Azubi-validThrough bewusst anders, fakten-abgleich B2 und B5). Der WebSite-Zusatz `isPartOf`, die Gründer-Person, Brand-Felder und die @id-Adressen gehören zu E-SEO-006, die Suchaktion bleibt draußen (E-SEO-007). Die Wortlaute der Textrouten (ALT-SEO-87 bis -99) leben weitgehend; in der Kurzfassung `llms.txt` fehlen belegte Aussagen (Vergütung über Tarif, unbefristeter Vertrag, Hilti-Ausstattung, Arbeitskleidung, Jubiläum, Kammer und Innung). Deshalb wechselt E-SEO-014 von „verschoben“ zu „geschwächt“ (Verschmelzen). Der Altstand-Befund „ohne Beleg“ zu Vergütung und Hilti-Werkzeug ist berichtigt, beide Aussagen stehen sichtbar in ALT-START-192, -318 und -321.
- Runde 1 (ALT-SEO-60 bis -74, alle in bestehenden Pässen): Die JobPosting-Beschreibungen und alle 23 Benefit-Einträge leben aus der Stellen-Registry (E-SEO-010, nur Belegtes); die drei benannten Einsatzkreise des LocalBusiness fehlen im JSON-LD und kehren zurück (E-SEO-009); die zwei Abweichungen zwischen FAQPage-Markup und sichtbarer FAQ sind im Ausgangsstand aufgehoben (E-SEO-011).

## Übersicht

| E-ID | Name | Kategorie | Zustand | Priorität | Entscheidung |
|---|---|---|---|---|---|
| E-SHELL-001 | 100-Jahre-Siegel „100 Jahre Meisterbetrieb (1926–2026)“ | Vertrauen | verloren | Muss | Rückführen |
| E-SHELL-002 | Live-Hinweis „Aktuell offene Stellen“ mit Zähler | Funktion | verloren | Soll | Rückführen |
| E-SHELL-003 | Ortsangabe und Einzugsgebiet-Kurzhinweis (Oberleiste) | Inhalt | verschoben | Kann | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-004 | Vertraulichkeitshinweis im Seitenrahmen | Vertrauen | geschwächt | Soll | Verschmelzen |
| E-SHELL-005 | WhatsApp-Direktweg im Seitenrahmen (Kopf, Fuß, schwebender Zugang) | Einbindung Dritter | geschwächt | Muss | Verschmelzen |
| E-SHELL-006 | Mobilmenü: „Direkter Kontakt zum Meister“ mit vorbefüllter Nachricht | Einbindung Dritter | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-007 | Telefon im Kopf mit Erreichbarkeits-Hinweis | Einbindung Dritter | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-008 | Link „Zur Kunden-Website“ | Einbindung Dritter | geschwächt | Soll | Verschmelzen |
| E-SHELL-009 | Kopfnavigation mit Ankerzielen (Desktop und Mobil) | Navigation | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-010 | Primäraktion „Expressbewerbung“ und „Bewerberportal“ im Kopf und Menü | Navigation | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-011 | Hamburger-Morph (Menüknopf Strich zu X) | Grafik und SVG | geschwächt | Soll | Neu interpretieren |
| E-SHELL-012 | Mobilmenü-Mechanik (Dialog, Hintergrund, Scroll-Sperre, Escape) | Funktion | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-013 | Mobilmenü-Einblendung mit Staffel | Bewegung | geschwächt | Kann | Neu interpretieren |
| E-SHELL-014 | Stellenkarten im Mobilmenü | Inhalt | verschoben | Kann | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-015 | Fuß-Vorspann „Lieber erst einmal unverbindlich sprechen?“ | Inhalt | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-016 | Fuß-Markenblock (Logo, Firmenname, Claim) | Grafik und SVG | verschoben | Kann | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-017 | Nachweis „Eingetragen in die Handwerksrolle der Handwerkskammer Wiesbaden“ | Vertrauen | verloren | Soll | Zurückstellen |
| E-SHELL-018 | Innungsmitgliedschaft | Vertrauen | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-019 | „Ausgezeichneter Ausbildungsbetrieb im Handwerk“ | Vertrauen | verloren | Kann | Zurückstellen |
| E-SHELL-020 | Fuß-Spalte „Stellenangebote & Einstieg“ | Navigation | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-021 | Einsatzgebiet-Ortsliste im Fuß | Inhalt | geschwächt | Soll | Verschmelzen |
| E-SHELL-022 | Arbeitszeit-Kasten im Fuß „Freitags ab 13:30 Uhr ins Wochenende“ | Inhalt | verschoben | Kann | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-023 | Schnellbewerbungs-Seitenleiste (Desktop) | Interaktives | geschwächt | Soll | Verschmelzen |
| E-SHELL-024 | Nach-oben-Knopf | Interaktives | verloren | Kann | Zurückstellen |
| E-SHELL-025 | 404: Charaktertext „Hier hat sich wohl eine Rohrleitung verirrt“ mit Werkzeug-Grafik | Inhalt | geschwächt | Soll | Rückführen |
| E-SHELL-026 | 404: Wegweiser-Knöpfe | Navigation | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-027 | 404: „Schneller Direktkontakt“ | Einbindung Dritter | verloren | Soll | Rückführen |
| E-SHELL-028 | Laufzeit-Fehlerseite (`app/error.tsx`) | Funktion | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-SHELL-029 | Globale Fehlerseite (`app/global-error.tsx`) | Funktion | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-001 | Impressum: Seitenkopf (Brotkrumen, Kicker, Überschrift, Untertitel, Zurück-Link) | Recht | verschoben | Kann | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-002 | Impressum: Anbieter, Kontakt, Register, Geschäftsführung, Inhaltsverantwortlicher | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-003 | Impressum: Umsatzsteuer-Identifikationsnummer | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-004 | Impressum: Handwerkskammer, Kammerportal, Berufsbezeichnung | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-005 | Impressum: Verbraucherstreitbeilegung und Universalschlichtungsstelle | Recht | geschwächt | Muss | Zurückstellen |
| E-RECHT-006 | Impressum: Haftung für Inhalte und Links | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-007 | Fuß: Registerzeile (Register, USt-IdNr., Geschäftsführer) | Recht | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-008 | Fuß: Link „Bewerber Datenschutz nach Paragraph 26 BDSG“ | Recht | geschwächt | Soll | Verschmelzen |
| E-RECHT-009 | Datenschutz: Kopf (Stand, Brotkrumen, Überschrift, Einleitung) | Recht | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-010 | Datenschutz: unbelegte Siegel und Kennzahlenkarten | Vertrauen | verloren | Kann | Nicht zurückführen (erfunden/unbelegt) |
| E-RECHT-011 | Datenschutz: Inhaltsverzeichnis mit Sprungliste und Stichwortfilter | Navigation | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-012 | Datenschutz: Karte „Datenschutzauskunft“ | Recht | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-013 | Datenschutz: Knopf „PDF drucken oder exportieren“ | Interaktives | geschwächt | Kann | Verschmelzen |
| E-RECHT-014 | Datenschutz § 01: Verantwortliche Stelle und Datenschutzbeauftragter | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-015 | Datenschutz § 02: Rechtsgrundlagen der Verarbeitung | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-016 | Datenschutz § 03: Hosting, Server-Logdateien, SSL und TLS, Kontaktformulare | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-017 | Datenschutz § 04: Bewerberdaten, Löschfristen, Talentpool | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-018 | Datenschutz: Sperrvermerk für ungekündigte Fachkräfte | Vertrauen | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-019 | Datenschutz § 05: Schriften und Aussage zu Cookies | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-020 | Webanalyse-Abschnitt, Analyse-Anbieter und Cookie-Tabellen (Fantasie-Cookies) | Recht | verloren | Kann | Nicht zurückführen (erfunden/unbelegt) |
| E-RECHT-021 | Cookie-Banner und Einwilligungs-Dialog (Mechanik) | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-022 | Einwilligung für Google Maps (Zwei-Klick statt Cookie-Modal) | Einbindung Dritter | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-023 | Datenschutz § 06: Betroffenenrechte und Widerruf | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-024 | Datenschutz § 07: Aufsichtsbehörde (HBDI) | Recht | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-RECHT-025 | Datenschutz: WhatsApp als Kontaktweg und Datenweitergabe | Einbindung Dritter | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-001 | Metadaten Startseite und Wurzel (Titel, Beschreibung, Schlüsselwörter, Autor, Symbole, Canonical, Geo, Robots) | Suche und Technik | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-002 | Metadaten /bewerbung und alte Query-Varianten (`?tab=`) | Suche und Technik | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-003 | Metadaten Impressum und Datenschutz (jetzt noindex) | Suche und Technik | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-004 | Metadaten der 404-Seite | Suche und Technik | verschoben | Kann | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-005 | OpenGraph- und Twitter-Karten (Standard) | Suche und Technik | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-006 | JSON-LD Organization, Gründer (Person) und Marke (Brand) | Suche und Technik | geschwächt | Soll | Verschmelzen |
| E-SEO-007 | JSON-LD WebSite mit SearchAction und die fehlende Suchfunktion | Funktion | verloren | Kann | Nicht zurückführen (erfunden/unbelegt) |
| E-SEO-008 | JSON-LD je Unterseite (BreadcrumbList, WebPage) | Suche und Technik | verschoben | Kann | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-009 | JSON-LD LocalBusiness (Einsatzgebiet und Öffnungszeiten) | Suche und Technik | geschwächt | Soll | Verschmelzen |
| E-SEO-010 | JSON-LD JobPosting (vier Stellen) | Suche und Technik | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-011 | JSON-LD FAQPage und die fünf FAQ-Texte | Inhalt | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-012 | robots.txt | Suche und Technik | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-013 | sitemap.xml | Suche und Technik | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-014 | llms.txt und llms-full.txt | Suche und Technik | geschwächt | Soll | Verschmelzen |
| E-SEO-015 | IndexNow-Schlüsseldatei `/298d966b7e4f4a43981cb8e30da6b5b5.txt` | Suche und Technik | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-016 | `/api/indexnow` (Auskunft und Einreichung) | Suche und Technik | verschoben | Kann | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-017 | `/api/maps/config` (Kartenschlüssel nur für die eigene Seite) | Einbindung Dritter | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-018 | Formular-Schnittstellen `/api/contact` und `/api/bewerbung` | Funktion | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-019 | Bot-Filter (Abweisung bekannter Scraper) | Suche und Technik | verschoben | Kann | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-020 | Sicherheitsheader und Cache-Regeln | Suche und Technik | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-SEO-021 | Alte Startseiten-Anker (Anker-Aliase) | Navigation | verloren | Soll | Rückführen |

## Element-Pässe · Seitenrahmen (E-SHELL)

### E-SHELL-001 · 100-Jahre-Siegel „100 Jahre Meisterbetrieb (1926–2026)“
- Kategorie: Vertrauen
- Quelle: ALT-SHELL-02, ALT-RECHT-05 · components/Header.tsx:138-143; app/impressum/page.tsx:114-120 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp (Oberleiste links „100 J. Meisterbetrieb“), belege/p0-altstand/alt-impressum__d1440-light__01.webp (Plakette im Impressum), belege/p0-altstand/alt-start__m375-light__01.webp
- Zustand: verloren (+ Gegenstück im Ausgangsstand: Der Fakt `anniversary100` in lib/content/facts.ts:80-86 besteht und ist getestet (lib/content/__tests__/content.test.ts:77-81), wird aber von keiner Komponente gerendert (Grep über app, components, lib). Sichtbar bleibt nur „Seit 1926 · Wetzlar“ (components/home/content.ts:62) und die Kennzahl „1926 Gegründet“; NEU-SHELL-15 nennt kein Jubiläum.)
- Aufgabe: Das Jubiläum belegt Beständigkeit auf einen Blick; für Bewerber ein Vertrauensanker („100 Jahre“ = sicherer Arbeitgeber), für das Unternehmen ein Markenzeichen des Jahres 2026.
- Wesenskern: „100 Jahre Meisterbetrieb (1926–2026)“, mobil gekürzt „100 J. Meisterbetrieb“; im Impressum als Plakette „100 JAHRE MEISTERBETRIEB (1926–2026)“ (nur ab sm). Belegt (facts.ts, Quelle lib/data/company.ts@393df01). Anzeigefrist laut Fakt: bis 31.12.2026 (`isFactActive`), danach „Seit 1926“ (ROADMAP §13).
- Freiraum: Ort und Form (Hero-Eyebrow, Kennzahl oder Zeile im Fuß statt Oberleiste), Gestaltung, Länge der Kurzform; die Oberleiste muss nicht zurückkehren.
- Bindungen: Fakt `anniversary100` mit `validUntil: '2026-12-31'` und Test; Regel „jeder Fakt höchstens zweimal pro Seite“ (ROADMAP §3.2); Startseiten-Vorkommen (Hero-Plakette „100 Jahre Meisterbetrieb (1926–2026) • Offene Stellenangebote in Wetzlar“) liegt im Startseiten-Paket und muss damit abgestimmt werden.
- Priorität: Muss – Grund: belegtes Vertrauenselement und Markenzeichen mit Ablaufdatum 2026-12-31 (Stand heute 2026-10-09: rund 12 Wochen Sichtbarkeit verbleiben).
- Entscheidung: Rückführen
- Ziel in der Plattform: components/home/Hero.tsx bzw. components/home/content.ts (Eyebrow oder Kennzahl aus `FACTS.anniversary100` mit `isFactActive`); optional Registerzeile in components/site/SiteFooter.tsx.
- Gestaltung: folgt KERN (P2); vorläufige Idee: typografische Jubiläumsmarke „100 Jahre · 1926–2026“ als Eyebrow-Variante, ohne Siegelgrafik.
- Abnahme: Marke sichtbar bis 2026-12-31, danach ausgeblendet (Test mit Datum 2027-01-01) · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp
- Status: offen
- Unsicherheit: Ob das Jubiläum im Startseiten-Paket bereits als eigenes Element geführt wird (Doppelrückführung vermeiden); Neuatlas führt es nicht.

### E-SHELL-002 · Live-Hinweis „Aktuell offene Stellen“ mit Zähler
- Kategorie: Funktion
- Quelle: ALT-SHELL-04, ALT-SHELL-11, ALT-SHELL-28, ALT-SHELL-33 · components/Header.tsx:65-72, 96-114, 151-159, 244-271; components/navigation/MobileMenuDrawer.tsx:218-226, 263-305 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp (Oberleiste Mitte, Badge „3“ am Nav-Eintrag)
- Zustand: verloren (+ Gegenstück: NEU-SHELL-04 Link „Stellen“ ohne Zahl; NEU-SHELL-13 Fuß listet die live Stellen; Zähler fehlt im Rahmen)
- Aufgabe: Zeigt auf jeder Seite, dass es offene Stellen gibt und wie viele, und führt zur Stellenübersicht; Unternehmen lenkt so Besucher in /jobs.
- Wesenskern: „Aktuell 3 offene Stellenangebote“ (grüner Live-Punkt), Badge „3“ am Nav-Eintrag „Offene Stellen“, Mobil „3 Stellenangebote“ und „Aktuell offene Meisterstellen (3)“. Die „3“ stand im Altstand fest im Kopf-Array (nicht aus Daten); das Wesen ist eine Zahl, die immer der Zahl der live Stellen entspricht (heute 4 Stellenseiten; Quereinstieg `funnel_only` zählt nicht). Die Pille „● Sofortiger Einstieg“ nicht übernehmen: Start laut Registry „nach Absprache“ (fakten-abgleich.md Abschnitt C, offen).
- Freiraum: Ort (Zahl am Nav-Eintrag „Stellen“ und in der Menüzeile), Form, kein Ping-Punkt nötig.
- Bindungen: `getActiveJobs()` und `isJobLive()` (lib/jobs/registry); `revalidate = 3600` im Layout (Ablauf `validThrough` ohne Deployment); Ziel `/jobs`; Kopf ist Client-Komponente, Zahl daher im Server-Wrapper SiteHeader als String übergeben.
- Priorität: Soll – Grund: klarer Besuchernutzen, kein Recht und keine Geschäftsfunktion.
- Entscheidung: Rückführen
- Ziel in der Plattform: components/site/SiteHeader.tsx (Zahl berechnen) mit components/site/HeaderBar.tsx und components/site/MobileNav.tsx (Anzeige).
- Gestaltung: folgt KERN (P2); vorläufige Idee: kleine tabellarische Ziffer hinter „Stellen“, kein Pulsieren.
- Abnahme: Zahl gleich Anzahl der live Stellenseiten (heute 4), ändert sich nach Ablauf einer Stelle · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp
- Status: offen
- Unsicherheit: ROADMAP §5 lässt die Oberleiste bewusst entfallen und nennt für den Zähler keinen Ersatz; ob der Verzicht auf die Zahl gewollt ist, ist nicht dokumentiert.

### E-SHELL-003 · Ortsangabe und Einzugsgebiet-Kurzhinweis (Oberleiste)
- Kategorie: Inhalt
- Quelle: ALT-SHELL-03, ALT-SHELL-05 · components/Header.tsx:145-147, 160-162 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp
- Zustand: verschoben (+ Gegenstück: components/home/content.ts:62 „Seit 1926 · Wetzlar“, Kennzahl „35 km Einsatzradius“ (content.ts:86), Abschnitt `#einsatzgebiet` „35 km um Wetzlar. Keine Fernmontage.“; NEU-START-Hero, NEU-SHELL-12)
- Aufgabe: Ort und Radius auf einen Blick, damit Besucher aus der Ferne sofort sehen, ob sich ein Bewerben lohnt.
- Wesenskern: „Wetzlar & Mittelhessen“ · „(Wetzlar & Lahn-Dill-Kreis • Max. 35 km)“. Radius 35 km, Wetzlar und Lahn-Dill-Kreis.
- Freiraum: Ort (Hero genügt), Wortlaut.
- Bindungen: Fakt `radius35`.
- Priorität: Kann – Grund: Hero-Kennzahl und Einsatzgebiet-Abschnitt tragen die Aufgabe vollständig.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/Hero.tsx, components/home/RegionSection.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert aus dem Hero.
- Abnahme: Ort und „35 km“ im ersten Bildschirm der Startseite lesbar · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp
- Status: offen
- Unsicherheit: keine

### E-SHELL-004 · Vertraulichkeitshinweis im Seitenrahmen
- Kategorie: Vertrauen
- Quelle: ALT-SHELL-06, ALT-SHELL-38, ALT-SHELL-42 · components/Header.tsx:167-173; components/navigation/MobileMenuDrawer.tsx:309-322; components/Footer.tsx:59-70 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp (Oberleiste rechts), belege/p0-altstand/alt-impressum__d1440-light__02.webp (Fuß-Vorspann mit Kicker „100 Prozent Diskretion garantiert nach Paragraph 26 Bundesdatenschutzgesetz“)
- Zustand: geschwächt (+ Gegenstück: lib/content/process.ts:92 `DISCRETION_PROMISE`, `FACTS.discretion`; sichtbar im Ablauf der Startseite, in der FAQ, auf /bewerbung (`getDiscretionPromise`) und in der Datenschutzerklärung „Sperrvermerk für ungekündigte Fachkräfte“ (NEU-RECHT-16); als rahmenweiter Hinweis in Kopf, Menü und Fuß fehlt er)
- Aufgabe: Wer noch angestellt ist, braucht vor dem ersten Kontakt die Gewissheit, dass der Arbeitgeber nichts erfährt; das Unternehmen gewinnt so wechselwillige Fachkräfte.
- Wesenskern: Zusage „Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber.“ (belegt als `FACTS.discretion`). Altwortlaut: „100% vertrauliche Kontaktaufnahme ohne Arbeitgeber-Rückfrage“ · „100% Vertraulichkeits-Garantie“ · „Bewerbung in unter 60 Sekunden ohne Anschreiben. Streng vertrauliche Behandlung nach § 26 BDSG – garantiert keine Kontaktaufnahme mit Ihrem […]“ (22 Wörter) · „100 Prozent Diskretion garantiert nach Paragraph 26 Bundesdatenschutzgesetz“. Nicht übernehmen: „garantiert“ und „nach § 26 BDSG“ (Rechtsformel; das Repo hat sie in datenschutz-aenderungen.md bewusst entfernt).
- Freiraum: Ort (Mobilmenü-Fuß, Fuß „Betrieb“), Länge, Anrede „du“; Zusage entfällt für Ausbildung (`getDiscretionPromise('ausbildung')` liefert null).
- Bindungen: `FACTS.discretion`, `getDiscretionPromise()`, Regel „höchstens zweimal pro Seite“; Datenschutz `#bewerberdaten` (Sperrvermerk).
- Priorität: Soll – Grund: belegtes Vertrauenselement für die Hauptzielgruppe, aber auf Startseite und Flow bereits sichtbar.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: components/site/MobileNav.tsx (Zeile im Menü) und/oder components/site/SiteFooter.tsx (Spalte „Betrieb“), als Variante der vorhandenen Komponenten.
- Gestaltung: folgt KERN (P2); vorläufige Idee: eine ruhige Textzeile mit Haken unter den Kontaktzeilen.
- Abnahme: Wortlaut gleich `DISCRETION_PROMISE`, kein „garantiert“ und kein „§ 26“ im Rahmen · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp
- Status: offen
- Unsicherheit: Die Startseite zeigt die Zusage bereits mehrfach; eine Wiederholung im Rahmen kann die Zwei-Mal-Regel reißen. Ob der Rahmenhinweis gewollt ist, ist offen.

### E-SHELL-005 · WhatsApp-Direktweg im Seitenrahmen (Kopf, Fuß, schwebender Zugang)
- Kategorie: Einbindung Dritter
- Quelle: ALT-SHELL-07, ALT-SHELL-44, ALT-SHELL-79, ALT-SHELL-81 · components/Header.tsx:179-190; components/Footer.tsx:83-93; components/contact/FloatingWhatsAppWidget.tsx:11-18, 38-53, 99-106, 108-132, 249-301; lib/utils/whatsapp-utils.ts:3-8 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp (Pille Oberleiste rechts, grüner Kreis rechts unten), belege/p0-altstand/alt-start__m375-light__01.webp (Kreis mobil), belege/p0-altstand/alt-impressum__d1440-light__03.webp (Fuß)
- Zustand: geschwächt (+ Gegenstück: NEU-SHELL-11 Sticky-Leiste (nur unter lg), NEU-SHELL-08 Mobilmenü, components/site/ContactOptions.tsx (Startseite-Band, Stellenseiten, /jobs, /bewerbung, Danke, Mappe), app/error.tsx; es fehlt der rahmenweite Zugang ab lg: Kopf nur Telefon und „Bewerben“, Fuß „Betrieb“ nur Telefon und E-Mail, 404 ohne Kontakt)
- Aufgabe: Wer diskret oder niedrigschwellig schreiben will, erreicht Sabri Demir von jeder Seite per WhatsApp; das Unternehmen gewinnt Erstkontakte ohne Hürde (Geschäftswert).
- Wesenskern: Direktweg per WhatsApp zu Sabri Demir mit vorbefüllter Nachricht, neuer Tab, `noopener`. Texte: „WhatsApp:“ · „Direkt mit Sabri Demir schreiben“ · Titel „Direkter WhatsApp Chat mit Dipl.-Ing. Sabri Demir“ · Fuß „WhatsApp Direktkontakt“ (Nachricht „Hallo Herr Demir, ich habe eine Frage zu den offenen Stellen bei Bad und Energie.“) · Kreis: aria „WhatsApp Direktkontakt zu Meister Sabri Demir öffnen (verschiebbar)“ · Hinweis „Frage an Meister Sabri Demir?“ / „Schreibe uns vertraulich per WhatsApp. Du kannst diesen Button jederzeit verschieben.“ (nur als dauerhafte Zeile, nicht als Timer nach 12 s). Nummer im Altstand 49644142956; neu `WHATSAPP_NUMBER` +49644142956 (Festnetz, ROADMAP §13: WhatsApp Business offen). Nicht zurückführen: Ziehen und Einrasten sowie der „Ungelesen“-Punkt (siehe Tabelle „Ohne eigenes Element“).
- Freiraum: Ort und Form: eine WhatsApp-Zeile im Fuß „Betrieb“ (wie Telefon und E-Mail), optional Textlink im Desktop-Kopf; kein schwebendes Widget (ROADMAP §5).
- Bindungen: `buildWhatsAppUrl()` und `whatsAppMessageFor()` (lib/utils/whatsapp-utils.ts); Datenschutz `#kontakt` (WhatsApp Ireland, Meta); ROADMAP §13 (Nummer, WhatsApp Business); Sticky-Leiste unter lg bleibt.
- Priorität: Muss – Grund: Kontaktkanal mit Geschäftswert, im Auftrag als Wesen genannt.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: components/site/SiteFooter.tsx (FullFooter, Spalte „Betrieb“) mit `buildWhatsAppUrl`; optional components/site/HeaderBar.tsx.
- Gestaltung: folgt KERN (P2); vorläufige Idee: WhatsApp als dritte Zeile unter Telefon und E-Mail im Fuß, gleiche Link-Form.
- Abnahme: WhatsApp-Link auf jeder Seite ab 1024 px ohne Scrollen zu einer Kontaktsektion erreichbar, Text ohne Berufsangabe, neuer Tab · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__03.webp / belege/p0-ausgangsstand/impressum__d1440-light__03.webp
- Status: offen
- Unsicherheit: ROADMAP §5 streicht FloatingWhatsApp und nennt als Ersatz nur die mobile Sticky-Leiste; ob Desktop bewusst ohne rahmenweiten WhatsApp-Zugang bleibt, ist nicht dokumentiert.

### E-SHELL-006 · Mobilmenü: „Direkter Kontakt zum Meister“ mit vorbefüllter Nachricht
- Kategorie: Einbindung Dritter
- Quelle: ALT-SHELL-24, ALT-SHELL-25, ALT-SHELL-26, ALT-SHELL-83 · components/navigation/MobileMenuDrawer.tsx:141-191; lib/utils/whatsapp-utils.ts:11-16; components/contact/FloatingWhatsAppWidget.tsx:223-228 · Bild: – (Menü im Belegsatz nicht geöffnet)
- Zustand: verschoben (+ Gegenstück: NEU-SHELL-08 mit Telefon- und WhatsApp-Link, components/site/MobileNav.tsx:129-140; `whatsAppMessageFor` in lib/utils/whatsapp-utils.ts:19-24)
- Aufgabe: Im geöffneten Menü direkt anrufen oder per WhatsApp schreiben.
- Wesenskern: Überschrift „Direkter Kontakt zum Meister“; Kachel „WhatsApp Chat“ · „Direkt mit Sabri Demir“; Kachel „(06441) 42956“ · „Büro & Werkstatt Wetzlar“; Nachricht je Seite: unter /bewerbung „Guten Tag Herr Demir, ich habe eine kurze Frage zu den Bewerbungsschritten bei Bad und Energie in Wetzlar.“ (unverändert), sonst im Altstand „…ich bin Anlagenmechaniker bzw. Kundendienstmonteur und möchte mich diskret über offene Stellen in Wetzlar informieren.“, neu neutral „Guten Tag Herr Demir, ich interessiere mich für eine Stelle bei Bad und Energie.“ (bewusst, damit Ausbildung passt; Kommentar in whatsapp-utils.ts).
- Freiraum: Überschrift und Kachelform entfallen (Textlinks genügen).
- Bindungen: `buildWhatsAppUrl`, `whatsAppMessageFor`, `COMPANY.phone`.
- Priorität: Muss – Grund: Kontaktfunktion mit Geschäftswert; lebt im Ausgangsstand.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/site/MobileNav.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Menü zeigt Telefon (tel:+49644142956) und WhatsApp mit Text · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SHELL-007 · Telefon im Kopf mit Erreichbarkeits-Hinweis
- Kategorie: Einbindung Dritter
- Quelle: ALT-SHELL-16 · components/Header.tsx:277-299 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp
- Zustand: verschoben (+ Gegenstück: NEU-SHELL-05, components/site/HeaderBar.tsx:101-109, Telefon „06441 42956“ mit tel:+49644142956; Zeiten im Fuß „Betrieb“ (NEU-SHELL-12) und in ContactOptions „Öffnungszeiten: Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr“)
- Aufgabe: Anruf mit einem Klick und Hinweis, wann jemand erreichbar ist.
- Wesenskern: „(06441) 42956“ (jetzt DIN 5008 „06441 42956“, fakten-abgleich B18); Hover-Hinweis „Montag bis Donnerstag von 07:00 bis 16:45 Uhr, Freitag bis 13:30 Uhr“ · „Direkter persönlicher Draht zur Werkstattleitung Wetzlar“. Der Hover-Tooltip war per Tastatur nicht erreichbar; die Zeiten stehen jetzt sichtbar im Fuß und an den Kontaktblöcken.
- Freiraum: Tooltip entfällt.
- Bindungen: `COMPANY.phone`, `COMPANY.openingHours`.
- Priorität: Muss – Grund: Kontaktfunktion mit Geschäftswert.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/site/HeaderBar.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Telefonlink im Kopf ab lg, Zeiten im Fuß lesbar · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp
- Status: offen
- Unsicherheit: keine

### E-SHELL-008 · Link „Zur Kunden-Website“
- Kategorie: Einbindung Dritter
- Quelle: ALT-SHELL-08, ALT-SHELL-40, ALT-SHELL-64 · components/Header.tsx:195-206; components/navigation/MobileMenuDrawer.tsx:327-335; components/Footer.tsx:305-319 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp (Oberleiste), belege/p0-altstand/alt-impressum__d1440-light__03.webp (Fuß)
- Zustand: geschwächt (+ Gegenstück: NEU-SHELL-14, Fußlink „bad-energie.de“ in der Spalte „Rechtliches“, ohne Beschriftung und ohne Hinweis „Kunden“; im Kopf und im Menü kein Link)
- Aufgabe: Kunden, die auf der Karriere-Subdomain landen, und Bewerber, die den Betrieb sehen wollen, finden die Kunden-Website; die Zielgruppen bleiben getrennt.
- Wesenskern: Link auf https://bad-energie.de, neuer Tab, Beschriftung „Zur Kunden-Website“ (Kopf), „Kunden-Website“ (Menü), „Zur Kunden Website für Bad und Heizung“ (Fuß); Pfeil-Icon.
- Freiraum: Ein Ort genügt (Fuß „Betrieb“); eine einheitliche Beschriftung; Menü-Fuß optional.
- Bindungen: `SITE_CONFIG.consumerUrl`, `COMPANY.website`; Impressum-Zeile „Website“; JSON-LD `Organization.url`.
- Priorität: Soll – Grund: klarer Besuchernutzen für Fehlläufer, kein Recht.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: components/site/SiteFooter.tsx (Link beschriften und in „Betrieb“ stellen; Ziel-Kennzeichnung „öffnet extern“)
- Gestaltung: folgt KERN (P2); vorläufige Idee: Textlink „Zur Kunden-Website“ mit kleinem Pfeil unter den Kontaktzeilen.
- Abnahme: Link mit Beschriftung im Fuß, Ziel https://bad-energie.de · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__03.webp / belege/p0-ausgangsstand/impressum__d1440-light__03.webp
- Status: offen
- Unsicherheit: Ob Kundenbesuch auf der Karriere-Subdomain nennenswert vorkommt, ist nicht belegt (keine Messdaten).

### E-SHELL-009 · Kopfnavigation mit Ankerzielen (Desktop und Mobil)
- Kategorie: Navigation
- Quelle: ALT-SHELL-12, ALT-SHELL-13, ALT-SHELL-14, ALT-SHELL-32, ALT-SHELL-34, ALT-SHELL-35, ALT-SHELL-36 · components/Header.tsx:73-87; components/navigation/MobileMenuDrawer.tsx:258-305 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp
- Zustand: verschoben (+ Gegenstück: NEU-SHELL-04 mit `NAV_ITEMS` in components/site/nav.ts:11-16: „Stellen“ (/jobs) · „Vorteile“ (/#vorteile) · „Ablauf“ (/#ablauf) · „FAQ“ (/#faq); NEU-SHELL-08 Menü)
- Aufgabe: Besucher springen zu Vorteilen, Ausstattung und Ablauf; das Unternehmen führt sie durch den Verkaufsweg der Startseite.
- Wesenskern: „Werkzeug und Fuhrpark“ (/#ausstattung), „Vorteile & Benefits“ (/#benefits), „Wechselprozess“ (/#wechsel-prozess); Mobil-Unterzeilen „Hilti und Sortimo“ · „30 Tage Urlaub • Freitag ab 13:30 Uhr frei“ · „100 Prozent diskret“; Zonenüberschrift „Einblicke & Informationen“. Die Inhalte leben in „Vorteile“ (Hilti, Fahrzeug, Urlaub, Feierabend) und „Ablauf“ (Wechsel, Diskretion). Aktiver Eintrag: Seitenlinks mit `aria-current`.
- Freiraum: Beschriftungen, Reihenfolge, Unterzeilen entfallen (Ruhe).
- Bindungen: Ankerziele der Startseite; die alten Anker-IDs leben nicht mehr (siehe E-SEO-021); `isCurrentNavItem`.
- Priorität: Soll – Grund: Orientierung; die Anker-Fortführung ist als E-SEO-021 getrennt erfasst.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/site/nav.ts, components/site/HeaderBar.tsx, components/site/MobileNav.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Alle vier Einträge springen zu vorhandenen IDs (`#vorteile`, `#ablauf`, `#faq`, `/jobs`) · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp
- Status: offen
- Unsicherheit: keine

### E-SHELL-010 · Primäraktion „Expressbewerbung“ und „Bewerberportal“ im Kopf und Menü
- Kategorie: Navigation
- Quelle: ALT-SHELL-15, ALT-SHELL-17, ALT-SHELL-27, ALT-SHELL-37 · components/Header.tsx:88-93, 250-268, 302-311; components/navigation/MobileMenuDrawer.tsx:193-213, 263-305 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp, belege/p0-altstand/alt-start__m375-light__01.webp („Express“)
- Zustand: verschoben (+ Gegenstück: NEU-SHELL-06 „Bewerben“ (Sekundär-Stil), NEU-SHELL-08 Fußknopf „Jetzt bewerben“, NEU-SHELL-10 Sticky-Leiste, Hero „Jetzt bewerben“ als einzige Crimson-Primäraktion; Kommentar components/site/HeaderBar.tsx:26-28)
- Aufgabe: Die Bewerbung ist von jeder Seite mit einem Tipp erreichbar.
- Wesenskern: „Expressbewerbung“ (ab sm) / „Express“ (mobil) → /#express-funnel; „Bewerberportal“ · „Vier Wege ohne Lebenslauf“ → /bewerbung; Menü-Kachel „Expressbewerbung“ · „In 60 Sekunden ohne Lebenslauf“. Neu ist es ein Flow (ROADMAP §6): „Vier Wege“ entfallen bewusst; die Mikrocopy „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“ steht im Hero.
- Freiraum: Beschriftung („Bewerben“), Stil (sekundär, damit nur eine Crimson-Primäraktion pro Ansicht steht).
- Bindungen: `APPLY_PATH` (/bewerbung); Anker `#express-funnel` existiert nicht mehr (siehe E-SEO-021).
- Priorität: Muss – Grund: Funktion mit Geschäftswert (Bewerbung).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/site/HeaderBar.tsx, components/site/MobileNav.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: „Bewerben“ im Kopf führt zu /bewerbung, im Menü „Jetzt bewerben“ · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp
- Status: offen
- Unsicherheit: keine

### E-SHELL-011 · Hamburger-Morph (Menüknopf Strich zu X)
- Kategorie: Grafik und SVG
- Quelle: ALT-SHELL-18, ALT-SHELL-19 · components/Header.tsx:314-323; components/navigation/MotionHamburgerIcon.tsx:12-62 · Bild: belege/p0-altstand/alt-start__m375-light__01.webp (Knopf rechts im Kopf)
- Zustand: geschwächt (+ Gegenstück: NEU-SHELL-07, components/site/MobileNav.tsx:81-95, Schaltfläche „Menü“ mit Lucide-Icon `Menu`, `aria-expanded`; das Sheet bringt ein eigenes Schließen-X (components/ui/Sheet.tsx); Morph und Bewegung fehlen)
- Aufgabe: Der Knopf zeigt den Zustand des Menüs (zu oder offen) und die Schließen-Handlung.
- Wesenskern: drei Striche werden zum X: offen oben „M 5 19 L 19 5“, Mitte „M 12 12 L 12 12“ (Deckkraft 0), unten „M 5 5 L 19 19“; geschlossen „M 3.5 6.5 L 20.5 6.5“, „M 3.5 12 L 20.5 12“, „M 3.5 17.5 L 20.5 17.5“; viewBox 0 0 24 24, Strichstärke 2.2, runde Enden, `aria-hidden`; Feder (stiffness 300, damping 22), Mitte 0,16 s easeInOut. Altstand-Befund: Der Code-Kommentar vertauscht die Diagonale; kein Wesen.
- Freiraum: Pfadform und Strichstärke (Plattform nutzt 1,75), Timing; Technik ohne Bewegungsbibliothek (Paket `motion` ist entfernt, Commit a2f641d): CSS-Übergang auf Linien.
- Bindungen: Icon-SVG ≤ 1,5 KB (K-013); `prefers-reduced-motion` (app/globals.css:90-95); `aria-label="Menü"`, `aria-expanded`; Auslöser trägt `iconButtonVariants`.
- Priorität: Soll – Grund: prägende Bewegung und Grafik des Kopfes.
- Entscheidung: Neu interpretieren
- Ziel in der Plattform: components/site/MobileNav.tsx (eigenes Inline-SVG statt `Menu`); optional components/ui/Sheet.tsx (Schließen-Icon)
- Gestaltung: folgt KERN (P2); vorläufige Idee: drei Linien, die sich mit CSS-Übergang zum X drehen, 200 ms, ohne Feder.
- Abnahme: Übergang sichtbar, bei reduzierter Bewegung ohne Übergang, SVG ≤ 1,5 KB · Bildpaar belege/p0-altstand/alt-start__m375-light__01.webp / belege/p0-ausgangsstand/start__m375-light__01.webp
- Status: offen
- Unsicherheit: Bei geöffnetem Sheet liegt der Knopf unter dem abgedunkelten Hintergrund; ob der Morph dort noch sichtbar ist oder besser im Schließen-Knopf des Sheets steckt, hängt von der Sheet-Gestaltung (KERN) ab.

### E-SHELL-012 · Mobilmenü-Mechanik (Dialog, Hintergrund, Scroll-Sperre, Escape)
- Kategorie: Funktion
- Quelle: ALT-SHELL-21, ALT-SHELL-22, ALT-SHELL-23 · components/navigation/MobileMenuDrawer.tsx:53-81, 107-133; components/Header.tsx:32-36 · Bild: –
- Zustand: geschwächt (korrigiert nach E-014; vorher verschoben) (+ Gegenstück: NEU-SHELL-08, components/ui/Sheet.tsx (natives `<dialog>` mit `showModal()`: Fokusfalle, Escape, Hintergrund-Klick, Scroll-Sperre, Fokus-Rückgabe) und Notfall-Dialog `FallbackSheet` in components/site/MobileNav.tsx:28-58)
- Aufgabe: Das Menü lässt sich ohne Fokus- und Scrollprobleme öffnen und schließen.
- Wesenskern: `role="dialog"`, `aria-modal`, Hintergrund schließt, Body-Scroll gesperrt, Escape schließt, Browser-Zurück schließt das Menü (Popstate). Im Ausgangsstand ist kein Popstate-Handler zu finden (Grep in components/site und components/ui): „Zurück“ verlässt die Seite, statt das Menü zu schließen.
- Freiraum: Einblendung von unten statt von oben (Sheet).
- Bindungen: components/ui/Sheet.tsx; `aria-controls`/`aria-expanded` am Knopf.
- Priorität: Muss – Grund: Zugänglichkeitshilfe (Tastatur, Fokus).
- Entscheidung: Verschmelzen (korrigiert nach E-014; vorher Keine Rückführung nötig (vollständig verschoben))
- Ziel in der Plattform: components/ui/Sheet.tsx, components/site/MobileNav.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Escape, Hintergrund-Klick und Schließen-Knopf schließen; Fokus kehrt zum Knopf zurück; Seite dahinter scrollt nicht · Bildpaar –
- Status: offen
- Unsicherheit: Browser-Zurück bei geöffnetem Menü ist im Ausgangsstand nicht belegt (Verhalten nicht im Browser geprüft).

### E-SHELL-013 · Mobilmenü-Einblendung mit Staffel
- Kategorie: Bewegung
- Quelle: Bewegungsanteil der Zeile SHELL-21 (dort zugeordnet) · components/navigation/MobileMenuDrawer.tsx:84-100, 124-140 · Bild: –
- Zustand: geschwächt (+ Gegenstück: NEU-SHELL-08; das Sheet gleitet von unten ein (`translate-y`, components/ui/Sheet.tsx:92-96), die Einträge erscheinen ohne Staffel)
- Aufgabe: Die gestaffelte Einblendung macht den Menüaufbau lesbar und gibt dem Kopf Charakter.
- Wesenskern: Feder-Einblendung (stiffness 320, damping 28, y −10 → 0), Hintergrund 0,2 s, Kinder gestaffelt (`staggerChildren` 0,05 s, `delayChildren` 0,03 s, je 0,22 s easeOut).
- Freiraum: Technik (CSS `transition-delay` und `@starting-style` statt Bewegungsbibliothek), Dauer, Richtung; Staffel höchstens 40 ms je Eintrag.
- Bindungen: Bewegungs-JS ≤ 60 KB gzip (K-013, hier 0 KB bei CSS); `prefers-reduced-motion` (app/globals.css:90-95).
- Priorität: Kann – Grund: Dekoration ohne eigene Aufgabe, trägt aber den Charakter.
- Entscheidung: Neu interpretieren
- Ziel in der Plattform: components/site/MobileNav.tsx (Einträge mit gestaffeltem `transition-delay`), components/ui/Sheet.tsx
- Gestaltung: folgt KERN (P2); vorläufige Idee: Einträge fahren nacheinander 8 px hoch und blenden ein.
- Abnahme: Staffel sichtbar bei normaler Bewegung, keine bei reduzierter · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SHELL-014 · Stellenkarten im Mobilmenü
- Kategorie: Inhalt
- Quelle: ALT-SHELL-29, ALT-SHELL-30, ALT-SHELL-31 · components/Header.tsx:96-114; components/navigation/MobileMenuDrawer.tsx:228-254 · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-SHELL-04 „Stellen“ (/jobs), NEU-SHELL-13 Fuß-Stellenliste mit Tiefenlinks, Stellenliste der Startseite)
- Aufgabe: Stellen direkt aus dem Menü öffnen.
- Wesenskern: drei Karten mit Titel, Konditionszeile und Ort, alle mit Ziel /bewerbung: „Anlagenmechaniker für Sanitär Heizung und Klimatechnik (m/w/d)“ · „Vollzeitbeschäftigung • Attraktive & übertarifliche Vergütung“ · „Wetzlar & Lahn-Dill-Kreis“; „Kundendiensttechniker für Wärmepumpen (m/w/d)“ · „Buderus, Bosch, NIBE (7 Jahre Garantie), Alpha Innotec & Viessmann • Eigenes Servicefahrzeug“ · „Regionale Einsätze vor Ort“; „Ausbildung zum Anlagenmechaniker SHK 2026“ · „Ausbildungsstart August 2026 • Überdurchschnittliche Vergütung“ · „Feste Übernahmegarantie“. Die Texte waren hart codiert und weichen von der Registry ab (fakten-abgleich C1–C4, B5; „Übernahmegarantie“ pending A1) und werden nicht übernommen.
- Freiraum: Der Menüpunkt „Stellen“ führt zur Übersicht mit aktuellen Karten.
- Bindungen: Registry statt Kopf-Array.
- Priorität: Kann – Grund: ein Tipp Umweg, Daten stehen unveraltet auf /jobs.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: /jobs, components/site/SiteFooter.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: entfällt.
- Abnahme: Menüeintrag „Stellen“ führt zu /jobs mit allen live Stellen · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SHELL-015 · Fuß-Vorspann „Lieber erst einmal unverbindlich sprechen?“
- Kategorie: Inhalt
- Quelle: ALT-SHELL-43, ALT-SHELL-45 · components/Footer.tsx:60-78, 95-103 · Bild: belege/p0-altstand/alt-impressum__d1440-light__02.webp (Fuß-Vorspann)
- Zustand: verschoben (+ Gegenstück: components/home/CtaBand.tsx (H2 „Bewirb dich bei uns.“ mit Telefon, WhatsApp, E-Mail) und `ContactOptions` auf Stellenseiten, /jobs, /bewerbung, Danke, Mappe; nicht mehr auf jeder Seite)
- Aufgabe: Zögernde Besucher werden vor dem Seitenende zu einem unverbindlichen Erstkontakt eingeladen.
- Wesenskern: H2 „Lieber erst einmal unverbindlich sprechen?“ · Text „Kein Lebenslauf nötig. Schreib Geschäftsführer Diplomingenieur Sabri Demir direkt über WhatsApp oder ruf unkompliziert in der Werkstatt an. Absolute Diskretion […]“ (26 Wörter) · Knopf „(06441) 42956“ mit Titel „Direkt in der Werkstatt anrufen“.
- Freiraum: Wortlaut und Ort; die Zusage „Absolute Diskretion“ folgt E-SHELL-004.
- Bindungen: `ContactOptions`, Fakt `quickResponse` („Sabri Demir meldet sich schnellstmöglich bei dir.“).
- Priorität: Soll – Grund: Besuchernutzen, Geschäftswert (Erstkontakt).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/CtaBand.tsx, components/site/ContactOptions.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Startseite zeigt den Schlussbereich mit drei Kontaktwegen · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__02.webp / belege/p0-ausgangsstand/start__d1440-light__09.webp
- Status: offen
- Unsicherheit: keine

### E-SHELL-016 · Fuß-Markenblock (Logo, Firmenname, Claim)
- Kategorie: Grafik und SVG
- Quelle: ALT-SHELL-46, ALT-SHELL-47 · components/Footer.tsx:116-131; components/Logo.tsx:129-137 · Bild: belege/p0-altstand/alt-impressum__d1440-light__03.webp
- Zustand: verschoben (+ Gegenstück: Logo im Kopf (NEU-SHELL-03), Firmenname im Block „Betrieb“ (NEU-SHELL-12), Leistungsfelder im Hero-Lead „Wärmepumpen, Heizungen und moderne Bäder“, Jubiläum siehe E-SHELL-001)
- Aufgabe: Marke und Positionierung am Seitenende.
- Wesenskern: Logo (Link auf `/`, aria „Bad und Energie GmbH Lahn Dill Zur Startseite des Karriereportals Wetzlar“) · „Bad & Energie GmbH Lahn Dill“ · „100 Jahre Meisterbetrieb (1926–2026) für Badarchitektur, Wärmepumpen & Haustechnik.“
- Freiraum: Logo im Fuß entfällt (Marke steht im Kopf).
- Bindungen: `COMPANY.name`.
- Priorität: Kann – Grund: Wiederholung der Marke ohne eigene Aufgabe.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/site/SiteFooter.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Firmenname im Fuß lesbar · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__03.webp / belege/p0-ausgangsstand/impressum__d1440-light__03.webp
- Status: offen
- Unsicherheit: keine

### E-SHELL-017 · Nachweis „Eingetragen in die Handwerksrolle der Handwerkskammer Wiesbaden“
- Kategorie: Vertrauen
- Quelle: ALT-SHELL-48 · components/Footer.tsx:136-139 · Bild: belege/p0-altstand/alt-impressum__d1440-light__03.webp
- Zustand: verloren (+ Gegenstück: Das Impressum nennt die Kammer und die „Berufsbezeichnung: Meisterbetrieb des SHK-Handwerks … verliehen in der Bundesrepublik Deutschland“ (NEU-RECHT-07); die Eintragung in die Handwerksrolle steht nirgends)
- Aufgabe: Nachweis der handwerksrechtlichen Berechtigung als Vertrauensanker.
- Wesenskern: „Eingetragen in die Handwerksrolle der Handwerkskammer Wiesbaden“. Im Repo ist die Eintragung nicht belegt (keine Nummer, keine Quelle, nicht in facts.ts oder fakten-abgleich.md).
- Freiraum: Ort und Form.
- Bindungen: Impressum `#kammer`; Handwerkskammer-Daten (HWK Wiesbaden).
- Priorität: Soll – Grund: mögliches belegtes Vertrauenselement, derzeit unbelegt.
- Entscheidung: Zurückstellen
- Ziel in der Plattform: –
- Gestaltung: folgt KERN (P2); vorläufige Idee: Textzeile im Fuß, sobald belegt.
- Abnahme: Beleg (Handwerkskarte oder Auszug) liegt vor, dann Zeile im Fuß · Bildpaar –
- Status: offen
- Unsicherheit: Der Betrieb muss die Eintragung bestätigen; ohne Beleg wird nichts gezeigt.

### E-SHELL-018 · Innungsmitgliedschaft
- Kategorie: Vertrauen
- Quelle: ALT-SHELL-49 · components/Footer.tsx:140-146 · Bild: belege/p0-altstand/alt-impressum__d1440-light__03.webp
- Zustand: verschoben (+ Gegenstück: NEU-SHELL-15, Fußzeile „© 2026 Bad und Energie GmbH Lahn Dill · HRB 2449 Amtsgericht Wetzlar · Innung Sanitär-, Heizungs- und Klimatechnik Lahn-Dill“; `FACTS.founded1926` „Innungs-Meisterbetrieb in Wetzlar seit 1926“)
- Aufgabe: Mitgliedschaft in der Innung als Qualitätssignal.
- Wesenskern: „Mitglied der Innung Sanitär Heizung und Klimatechnik Lahn Dill“; neu steht der Innungsname in der Fußzeile ohne „Mitglied der“.
- Freiraum: Form, Ort; Schreibweise nach Klärung.
- Bindungen: `COMPANY.innung` (components/site/SiteFooter.tsx:141, lib/email/templates/layout.ts:270, app/llms-full.txt/route.ts:70); fakten-abgleich B24 (offizielle Schreibweise offen).
- Priorität: Muss (korrigiert nach E-014; vorher Soll) – Grund: belegtes Vertrauenselement (Name belegt, Schreibweise offen).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/site/SiteFooter.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Innungsname in der Fußzeile jeder Seite · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__03.webp / belege/p0-ausgangsstand/impressum__d1440-light__03.webp
- Status: offen
- Unsicherheit: Offizielle Schreibweise der Innung (fakten-abgleich B24).

### E-SHELL-019 · „Ausgezeichneter Ausbildungsbetrieb im Handwerk“
- Kategorie: Vertrauen
- Quelle: ALT-SHELL-50 · components/Footer.tsx:147-153 · Bild: belege/p0-altstand/alt-impressum__d1440-light__03.webp
- Zustand: verloren (+ Gegenstück: keines; fakten-abgleich B13 „nicht übernommen“)
- Aufgabe: Auszeichnung als Vertrauenssignal für Auszubildende und Eltern.
- Wesenskern: „Ausgezeichneter Ausbildungsbetrieb im Handwerk“. Welche Auszeichnung gemeint ist, steht nirgends im Repo (fakten-abgleich B13 offen).
- Freiraum: –
- Bindungen: fakten-abgleich B13.
- Priorität: Soll (korrigiert nach E-014; vorher Kann) – Grund: unbelegt, bis der Betrieb die Auszeichnung nennt.
- Entscheidung: Zurückstellen
- Ziel in der Plattform: –
- Gestaltung: folgt KERN (P2); vorläufige Idee: Textzeile mit Name und Jahr der Auszeichnung, sobald belegt.
- Abnahme: Beleg der Auszeichnung (Urkunde, Jahr, Aussteller) liegt vor · Bildpaar –
- Status: offen
- Unsicherheit: Welche Auszeichnung gemeint ist.

### E-SHELL-020 · Fuß-Spalte „Stellenangebote & Einstieg“
- Kategorie: Navigation
- Quelle: ALT-SHELL-51–56 · components/Footer.tsx:157-225 · Bild: belege/p0-altstand/alt-impressum__d1440-light__03.webp
- Zustand: verschoben (+ Gegenstück: NEU-SHELL-13, components/site/SiteFooter.tsx:100-117: die live Stellen mit Tiefenlink (`jobPath(job)`) und „Alle Stellen“)
- Aufgabe: Stellen und Einstieg vom Seitenende aus erreichen.
- Wesenskern: Überschrift „Stellenangebote & Einstieg“; Links „Anlagenmechaniker für Sanitär Heizung und Klimatechnik m w d“, „Kundendiensttechniker für Wärmepumpensysteme m w d“, „Ausbildung zum Anlagenmechaniker SHK 2026“ (Unterzeile „Start August 2026 · Feste Übernahmegarantie“), „Quereinsteiger Haustechnik und Montagehelfer“ (alle /#stellen), „Bewerberportal (Fragebogen, Upload, DINA4 Formular)“ (/bewerbung, mit Außen-Symbol trotz internem Ziel). Neu: vier Stellen direkt, Quereinstieg über /jobs (Initiativ, `funnel_only`); „Bewerberportal“ ersetzt der Kopf-Knopf.
- Freiraum: Beschriftung, Unterzeilen (mit pending-Aussagen) entfallen.
- Bindungen: `getActiveJobs()` und `isJobLive()`; `jobPath()`.
- Priorität: Soll – Grund: Navigation mit Suchwert (interne Tiefenlinks).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/site/SiteFooter.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Fußlinks führen zu vier Stellenseiten und /jobs · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__03.webp / belege/p0-ausgangsstand/impressum__d1440-light__03.webp
- Status: offen
- Unsicherheit: keine

### E-SHELL-021 · Einsatzgebiet-Ortsliste im Fuß
- Kategorie: Inhalt
- Quelle: ALT-SHELL-57, ALT-SHELL-58 · components/Footer.tsx:37-47, 228-251 · Bild: belege/p0-altstand/alt-impressum__d1440-light__03.webp
- Zustand: geschwächt (+ Gegenstück: Abschnitt `#einsatzgebiet` der Startseite (RegionExplorer, zehn Orte mit Entfernung und Fahrzeit aus lib/data/locations.ts); es fehlen Solms, Hüttenberg, Lahnau, Ehringshausen und Wettenberg; sie stehen nur in `SITE_CONFIG.serviceRegions` und `REGION.areas` und erscheinen sichtbar nur in /llms-full.txt)
- Aufgabe: Besucher prüfen, ob ihr Wohnort im Einsatzgebiet liegt.
- Wesenskern: „Einsatzgebiet Mittelhessen (max. 35 km)“ · „Keine bundesweiten Montagen. Feste Baustellen und Kundendienst im Umkreis von:“ · neun Orte: „Wetzlar (Zentrale)“ (hervorgehoben) · „Gießen“ · „Aßlar“ · „Solms“ · „Hüttenberg“ · „Lahnau“ · „Ehringshausen“ · „Wettenberg“ · „Braunfels“.
- Freiraum: Ort (Startseite statt Fuß), Form; Entfernung und Fahrzeit nur, wo `locations.ts` sie belegt, keine erfundenen Werte.
- Bindungen: `REGION.areas` (lib/content/region.ts), `SITE_CONFIG.serviceRegions`, lib/data/locations.ts; fakten-abgleich B17 (Hohenahr offen).
- Priorität: Soll – Grund: klarer Besuchernutzen („Dein Ort fehlt?“) und lokaler Suchwert.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: components/home/RegionSection.tsx (Zeile „Weitere Orte im Einsatzgebiet“ aus `REGION.areas`) oder components/maps/RegionExplorer.tsx
- Gestaltung: folgt KERN (P2); vorläufige Idee: eine ruhige Textzeile unter der Ortstabelle.
- Abnahme: Alle neun Altstand-Orte sind auf der Startseite genannt · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__03.webp / belege/p0-ausgangsstand/start__d1440-light__05.webp
- Status: offen
- Unsicherheit: Ob Orte ohne Entfernungsangabe in der Tabelle stehen dürfen und ob `SITE_CONFIG.serviceRegions` vollständig und aktuell ist; Abstimmung mit dem Startseiten-Paket nötig.

### E-SHELL-022 · Arbeitszeit-Kasten im Fuß „Freitags ab 13:30 Uhr ins Wochenende“
- Kategorie: Inhalt
- Quelle: ALT-SHELL-59 · components/Footer.tsx:253-264 · Bild: belege/p0-altstand/alt-impressum__d1440-light__03.webp
- Zustand: verschoben (+ Gegenstück: Kennzahlen „13:30 Freitags Feierabend“ und „30 Tage Urlaub“ im Hero (components/home/content.ts:86), FAQ „Gibt es Fernmontagen oder Wochenendarbeit?“, `FACTS.noWeekendOnCall`)
- Aufgabe: Arbeitszeit, Urlaub und freie Wochenenden als Entscheidungsgründe wiederholen.
- Wesenskern: „Freitags ab 13:30 Uhr ins Wochenende“ · „30 Tage garantierter Erholungsurlaub • Keine Notdienst Pflicht am Wochenende“. Die Zusage „garantiert“ ersetzt der belegte Fakt „30 Arbeitstage bezahlter Erholungsurlaub pro Kalenderjahr“.
- Freiraum: Ort und Form.
- Bindungen: `FACTS.friday1330`, `FACTS.vacation30`, `FACTS.noWeekendOnCall`.
- Priorität: Kann – Grund: Wiederholung belegter Fakten.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/Hero.tsx, components/home/FaqSection.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Fakten stehen im Hero und in der FAQ · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__03.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp
- Status: offen
- Unsicherheit: keine

### E-SHELL-023 · Schnellbewerbungs-Seitenleiste (Desktop)
- Kategorie: Interaktives
- Quelle: ALT-SHELL-71–78 · components/QuickApplySidebar.tsx:19-171 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp (Reiter rechts, eingeklappt)
- Zustand: geschwächt (+ Gegenstück: NEU-SHELL-06 und NEU-SHELL-05 im sticky Kopf („Bewerben“, Telefon); die Sticky-Leiste NEU-SHELL-10/-11 gilt nur unter lg; ab lg fehlt WhatsApp im Rahmen)
- Aufgabe: Am Desktop jederzeit schnell bewerben, anrufen oder per WhatsApp schreiben, ohne zu scrollen.
- Wesenskern: Reiter „Schnellbewerbung • WhatsApp“ (aria „Schnellbewerbung • WhatsApp öffnen“, Titel „Expressbewerbung und WhatsApp öffnen“), Karte „Schnellbewerbung“ · „In 60 Sekunden ohne Lebenslauf & Anschreiben.“ · Aktion „Expressbewerbung“ · „In 60 Sekunden ohne Lebenslauf“ · „WhatsApp Chat“ · „Direkt mit Sabri Demir“ · „(06441) 42956“ · „Montag bis Freitag“ (ungenau: freitags nur bis 13:30 Uhr) · Statuszeile „3 Stellen offen · Wetzlar“ (siehe E-SHELL-002) · „100% diskret nach Paragraph 26 BDSG“ (nicht übernehmen, siehe E-SHELL-004). Startzustand eingeklappt, kein Speichern. Bewegung (ALT-SHELL-71, -72, -74; Fundstellen QuickApplySidebar.tsx:19-30, 35-38, 63-68): Der Wechsel zwischen Reiter und Karte läuft über `AnimatePresence` im Modus „wait“ (der eine blendet aus, bevor der andere einblendet); der Reiter blendet mit Deckkraft 0 → 1 und x 20 → 0 ein (0,2 s, beim Verlassen Deckkraft 0 und x 20), die Karte mit Deckkraft 0 → 1 und x 40 → 0 (0,25 s easeOut, beim Verlassen umgekehrt); der `aside` selbst ist nicht animiert. Nicht zurückführen: der grüne Punkt am Reiter mit `animate-pulse` (Pulsieren verboten, E-009; Live-Zustand nur belegt, siehe E-SHELL-002).
- Freiraum: Form (kein Seitenreiter nötig); die Anteile verteilen sich auf Kopf und Fuß; die Einblendung ist Gestaltung (Bewegungsregister K-009), eine seitliche Einblendung ist nicht Pflicht.
- Bindungen: ROADMAP §5 (Leiste entfällt bewusst); Anteil WhatsApp siehe E-SHELL-005, Anteil Zähler siehe E-SHELL-002.
- Priorität: Soll – Grund: Geschäftsfunktion (Kontakt), im Wesen bereits zu großen Teilen im Kopf vorhanden.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: components/site/SiteFooter.tsx und components/site/HeaderBar.tsx (Anteile aus E-SHELL-002 und -005)
- Gestaltung: folgt KERN (P2); vorläufige Idee: kein eigenes Element, die Anteile stehen in Kopf und Fuß.
- Abnahme: Ab 1024 px sind Bewerben, Telefon und WhatsApp ohne Scrollen zu einer Seitensektion erreichbar · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp
- Status: offen
- Unsicherheit: ROADMAP §5 nennt als Ersatz nur die Sticky-Leiste unter lg; der Desktop-Verzicht ist nicht begründet.

### E-SHELL-024 · Nach-oben-Knopf
- Kategorie: Interaktives
- Quelle: ALT-SHELL-84 · components/ui/BackToTop.tsx:8-38 · Bild: –
- Zustand: verloren (+ Gegenstück: keines; Grep nach `BackToTop`, „Zurück an den Anfang“, `ArrowUp` im Rahmen ohne Treffer)
- Aufgabe: Auf langen Seiten (Datenschutz, Stellenseiten) schnell zum Anfang zurückkehren.
- Wesenskern: aria „Zurück an den Anfang“; erscheint erst ab 450 px Scrolltiefe; scrollt sanft nach oben; Pfeil nach oben im dunklen Kreis (44 px); Fokusring; Einblendung 0,3 s.
- Freiraum: Form (auch als ruhiger Textlink am Ende langer Seiten).
- Bindungen: ROADMAP §5 (BackToTop entfällt bewusst); Sticky-Leiste und Fuß-Abstand (`pb-28`).
- Priorität: Kann – Grund: Bequemlichkeit, Browser-Funktion (Taste „Pos1“) vorhanden.
- Entscheidung: Zurückstellen
- Ziel in der Plattform: –
- Gestaltung: folgt KERN (P2); vorläufige Idee: Textlink „Nach oben“ am Ende von Datenschutz und Impressum.
- Abnahme: Entscheidung des Eigentümers liegt vor · Bildpaar –
- Status: offen
- Unsicherheit: Bewusste Entfernung ohne Ersatz; ein Mensch entscheidet, ob ein ruhiger Ersatz zurückkehrt.

### E-SHELL-025 · 404: Charaktertext „Hier hat sich wohl eine Rohrleitung verirrt“ mit Werkzeug-Grafik
- Kategorie: Inhalt
- Quelle: ALT-SHELL-105–108 · app/not-found.tsx:24-47 · Bild: belege/p0-altstand/alt-fehler-404__d1440-light__01.webp
- Zustand: geschwächt (+ Gegenstück: NEU-SHELL-20, app/not-found.tsx:14-41: „404“ · „Diese Seite gibt es nicht.“ · „Vielleicht hat sich die Adresse geändert. Die offenen Stellen und die Bewerbung findest du hier.“; Aufgabe lebt, Handwerker-Charakter und Grafik fehlen)
- Aufgabe: Der Fehler wird mit Handwerker-Ton entschärft, und der Besucher bleibt im Portal.
- Wesenskern: H1 „Hier hat sich wohl eine Rohrleitung verirrt“ · Kennzeile „Fehlercode 404 • Nicht Gefunden“ · Text „Die aufgerufene Unterseite existiert nicht oder wurde umgezogen. Unsere offenen Stellen in Wetzlar und das Bewerberportal stehen Dir jedoch weiterhin […]“ (21 Wörter; „Dir“ wird „dir“, Anrede des neuen Rahmens) · Werkzeug-Kachel (Schraubenschlüssel, um −12° gedreht) mit rotem Ping-Punkt.
- Freiraum: Wortlaut an den Ton von app/error.tsx angleichen; Grafik als ruhige Linien-SVG ohne Ping; „Fehler 404“ bleibt für Screenreader.
- Bindungen: HTTP-Status 404 mit noindex (NEU-SEO-16: doppeltes robots-Meta zu bereinigen); `data-primary-cta` am Knopfblock (blendet die Sticky-Leiste aus); Titel „Seite nicht gefunden“.
- Priorität: Soll – Grund: Markencharakter, im Auftrag ausdrücklich genannt.
- Entscheidung: Rückführen
- Ziel in der Plattform: app/not-found.tsx
- Gestaltung: folgt KERN (P2); vorläufige Idee: gezeichnetes Rohrstück mit Abzweig, das ins Leere läuft, einfarbig (`currentColor`), Illustrations-SVG ≤ 40 KB gzip.
- Abnahme: H1 enthält „Rohrleitung verirrt“, Status 404, vier Ansichten ohne horizontalen Scroll · Bildpaar belege/p0-altstand/alt-fehler-404__d1440-light__01.webp / belege/p0-ausgangsstand/fehler-404__d1440-light__01.webp
- Status: offen
- Unsicherheit: Ton („wohl“ klingt unsicher) gegen die neue Seitenstimme „Diese Seite gibt es nicht.“; Entscheidung bei KERN.

### E-SHELL-026 · 404: Wegweiser-Knöpfe
- Kategorie: Navigation
- Quelle: ALT-SHELL-109–111 · app/not-found.tsx:50-73 · Bild: belege/p0-altstand/alt-fehler-404__d1440-light__01.webp
- Zustand: verschoben (+ Gegenstück: NEU-SHELL-20: „Jetzt bewerben“ (/bewerbung), „Offene Stellen“ (/jobs), „Zur Startseite“)
- Aufgabe: Nach dem Fehler zu den drei wichtigsten Zielen führen.
- Wesenskern: „Zurück zur Startseite“ · „4 Wege Bewerberportal“ (→ /bewerbung) · „Offene Stellen ansehen“ (→ /#stellen, neu /jobs). „4 Wege“ entfällt mit dem Ein-Flow-Modell.
- Freiraum: Beschriftung, Reihenfolge, Stil.
- Bindungen: `data-primary-cta`.
- Priorität: Soll – Grund: Navigation aus dem Fehlerfall zu Bewerbung und Stellen.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/not-found.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Drei Wege auf der 404-Seite, alle antworten 200 · Bildpaar belege/p0-altstand/alt-fehler-404__d1440-light__01.webp / belege/p0-ausgangsstand/fehler-404__d1440-light__01.webp
- Status: offen
- Unsicherheit: keine

### E-SHELL-027 · 404: „Schneller Direktkontakt“
- Kategorie: Einbindung Dritter
- Quelle: ALT-SHELL-112–114 · app/not-found.tsx:20-22, 77-98 · Bild: belege/p0-altstand/alt-fehler-404__d1440-light__01.webp (Karte unten)
- Zustand: verloren (+ Gegenstück: keines auf der 404-Seite; app/error.tsx führt Telefon und WhatsApp (NEU-SHELL-21); `ContactOptions variant="inline"` ist vorhanden)
- Aufgabe: Wer über einen toten Link (z. B. alte Anzeige) kommt, erreicht trotzdem direkt eine Person; kein Bewerber geht verloren.
- Wesenskern: Kicker „Schneller Direktkontakt“; Knopf „WhatsApp an Sabri Demir“ mit Nachricht „Hallo Herr Demir, ich hatte einen Fehler auf der Karriereseite und melde mich direkt bei Ihnen.“ (Sie-Anrede, im neuen Ton „Guten Tag Herr Demir, …“); „06441 42956“ (tel:+49644142956).
- Freiraum: Form (`ContactOptions` inline), Nachrichtentext neutral („…ich habe eine Seite nicht gefunden“).
- Bindungen: `buildWhatsAppUrl`, `COMPANY.phone`; alte URLs und Anker laufen hier auf (E-SEO-021).
- Priorität: Soll – Grund: Kontakt aus dem Fehlerfall, Geschäftswert.
- Entscheidung: Rückführen
- Ziel in der Plattform: app/not-found.tsx (`ContactOptions` inline)
- Gestaltung: folgt KERN (P2); vorläufige Idee: eine Zeile mit Telefon und WhatsApp unter den Wegweiser-Knöpfen.
- Abnahme: 404-Seite zeigt Telefon und WhatsApp mit Text · Bildpaar belege/p0-altstand/alt-fehler-404__d1440-light__01.webp / belege/p0-ausgangsstand/fehler-404__d1440-light__01.webp
- Status: offen
- Unsicherheit: Text der WhatsApp-Nachricht für die 404-Seite ist festzulegen.

### E-SHELL-028 · Laufzeit-Fehlerseite (`app/error.tsx`)
- Kategorie: Funktion
- Quelle: ALT-SHELL-115–120 · app/error.tsx:15-72 · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-SHELL-21, app/error.tsx:19-63)
- Aufgabe: Fehler abfangen, Wiederholung anbieten, Direktkontakt zeigen.
- Wesenskern: H1 „Ein unerwarteter Fehler ist aufgetreten“ (neu „Da ist etwas schiefgelaufen.“) · „Bitte entschuldige die Unannehmlichkeit. Du kannst versuchen, die Seite erneut zu laden, oder direkt mit uns Kontakt aufnehmen.“ (neu „Bitte versuch es noch einmal. Wenn es weiter hakt, erreichst du uns direkt per Telefon oder WhatsApp.“) · „Referenz-ID: {digest}“ (neu „Fehlernummer: …“) · „Erneut versuchen“ · „Zur Startseite“ · „Technisches Problem direkt via WhatsApp melden“ (neu: Telefon und WhatsApp mit vorbefülltem Text).
- Freiraum: Wortlaut.
- Bindungen: Next-Fehlergrenze (`retry`), `buildWhatsAppUrl`, `CONTACT_PHONE`.
- Priorität: Soll – Grund: Fehlerfall mit Kontaktweg.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/error.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Fehlerzustand zeigt Wiederholung, Startseite, Telefon, WhatsApp (nur im Test auslösbar) · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SHELL-029 · Globale Fehlerseite (`app/global-error.tsx`)
- Kategorie: Funktion
- Quelle: ALT-SHELL-121–123 · app/global-error.tsx:16-35 · Bild: –
- Zustand: verschoben (+ Gegenstück: app/global-error.tsx:48-77)
- Aufgabe: Fallback, wenn das Root-Layout selbst ausfällt, mit Kontaktweg.
- Wesenskern: „Systemfehler | Bad & Energie Lahn Dill“ (neu Titel „Fehler | Bad & Energie Karriere“, H1 „Da ist etwas schiefgelaufen.“) · „Ein kritischer Systemfehler ist aufgetreten. Bitte lade die Seite neu oder rufe uns direkt an (06441 42956).“ (Telefonnummer im Altstand nur Text; neu als tel-Link plus WhatsApp) · Knopf „Seite neu laden“ (neu „Erneut versuchen“).
- Freiraum: Wortlaut, System-Schrift.
- Bindungen: Systemfarben (`Canvas`), kein CSS aus dem Layout.
- Priorität: Soll – Grund: Ausfallsicherheit mit Kontakt.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/global-error.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Seite zeigt Telefon und WhatsApp als Links · Bildpaar –
- Status: offen
- Unsicherheit: keine

## Element-Pässe · Recht (E-RECHT)

### E-RECHT-001 · Impressum: Seitenkopf (Brotkrumen, Kicker, Überschrift, Untertitel, Zurück-Link)
- Kategorie: Recht
- Quelle: ALT-RECHT-01–04, ALT-RECHT-17 · app/impressum/page.tsx:92-110, 256-263 · Bild: belege/p0-altstand/alt-impressum__d1440-light__01.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-01, app/impressum/page.tsx:144-151 mit components/legal/LegalDocument.tsx: Brotkrumen „Startseite › Impressum“, Eyebrow „Rechtliches“, H1 „Impressum“, Lead „Angaben nach § 5 DDG und Handwerksordnung für die Bad und Energie GmbH Lahn Dill.“)
- Aufgabe: Die Seite ist als Anbieterkennzeichnung erkennbar und von jeder Stelle aus erreichbar.
- Wesenskern: „Startseite / Impressum“ · „Gesetzliche Offenlegung nach Paragraph 5 DDG und Handwerksordnung“ · „Impressum & Rechtliche Angaben • Bad & Energie GmbH“ · „Angaben und rechtliche Unternehmensinformationen der Bad und Energie GmbH Lahn Dill.“ · „Zurück zur Startseite“ (neu über die Brotkrumen und den Kopf-Link).
- Freiraum: Wortlaut, Großschreibung, Zurück-Link am Seitenende.
- Bindungen: Verweis „§ 5 DDG“ bleibt im Lead; Metadaten siehe E-SEO-003.
- Priorität: Kann – Grund: Seitenkopf ohne eigene Rechtsaufgabe; die Pflichtangaben tragen die Seite.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/impressum/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: H1 „Impressum“, Brotkrumen zur Startseite vorhanden · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__01.webp / belege/p0-ausgangsstand/impressum__d1440-light__01.webp
- Status: offen
- Unsicherheit: keine

### E-RECHT-002 · Impressum: Anbieter, Kontakt, Register, Geschäftsführung, Inhaltsverantwortlicher
- Kategorie: Recht
- Quelle: ALT-RECHT-06–08, ALT-RECHT-10, ALT-RECHT-11 · app/impressum/page.tsx:122-190; lib/seo/site-config.ts:30 · Bild: belege/p0-altstand/alt-impressum__d1440-light__01.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-03 bis -06, app/impressum/page.tsx:53-102, 162-167; Wort-für-Wort-Abgleich in Anhang A)
- Aufgabe: Anbieterkennzeichnung nach § 5 DDG: Name, Anschrift, Kontaktwege, Register, Vertretung; Inhaltsverantwortlicher nach § 18 Abs. 2 MStV.
- Wesenskern: „Bad und Energie GmbH Lahn Dill“ · „Siegmund-Hiepe-Str. 20 / 35578 Wetzlar / Deutschland“ · „Telefon: 06441 42956“ · „Telefax: 06441 48781“ · „E Mail: info@bad-energie.de“ (mailto) · „Website: https://bad-energie.de“ · „Registergericht: Amtsgericht Wetzlar“ · „Registernummer: HRB 2449“ · „Geschäftsführung: Diplomingenieur Sabri Demir“ · „Verantwortlicher für den Inhalt nach § 18 Abs. 2 MStV: Sabri Demir, Siegmund-Hiepe-Str. 20, 35578 Wetzlar“. Alle Angaben stehen im Ausgangsstand wortgleich (nur „E Mail“ → „E-Mail“, „Verantwortlicher“ → „Verantwortlich“, Website ohne „https://“ angezeigt, Link bleibt https://bad-energie.de).
- Freiraum: Gliederung als Definitionsliste, Reihenfolge der Abschnitte.
- Bindungen: `COMPANY` (lib/content/company.ts), `LEGAL_ENTITY` (components/legal/legal-data.ts); Test components/legal/__tests__/legal-pages.test.ts:47; Anker `#anbieter`, `#kontakt`, `#register`, `#verantwortlich`.
- Priorität: Muss – Grund: gesetzliche Pflichtangaben.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/impressum/page.tsx, components/legal/legal-data.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Alle genannten Angaben stehen auf /impressum (HTML-Prüfung, Anhang A) · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__01.webp / belege/p0-ausgangsstand/impressum__d1440-light__01.webp
- Status: offen
- Unsicherheit: Titel „Diplomingenieur Sabri Demir“ gegen „Geschäftsführer und Meister“ (fakten-abgleich A5, offen); eine Änderung in lib/data/team.ts ändert das Impressum mit.

### E-RECHT-003 · Impressum: Umsatzsteuer-Identifikationsnummer
- Kategorie: Recht
- Quelle: ALT-RECHT-09 · app/impressum/page.tsx:174-177 · Bild: belege/p0-altstand/alt-impressum__d1440-light__01.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-05, components/legal/legal-data.ts:28 `vatId: 'DE 346 648 448'`; ebenso im Datenschutz § Verantwortlicher)
- Aufgabe: Pflichtangabe der USt-IdNr. nach § 27 a UStG (Anbieterkennzeichnung § 5 DDG).
- Wesenskern: „Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: DE 346 648 448“ (neu Beschriftung „USt-IdNr. gemäß § 27 a UStG“). Der Wert ist unverändert aus dem Altstand erhalten. Widerspruch im Repo: `SITE_CONFIG.vatID` lautet „DE301642296“ (lib/seo/site-config.ts:31, derzeit nirgends ausgegeben).
- Freiraum: Beschriftung; Wert nur nach Klärung.
- Bindungen: Owner-Frage O1 (datenschutz-aenderungen.md) und fakten-abgleich B1; Impressum, Datenschutz § Verantwortlicher; E-Mail-Fuß laut Dokumentation.
- Priorität: Muss – Grund: gesetzliche Pflichtangabe.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/legal/legal-data.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Impressum und Datenschutz zeigen dieselbe, vom Eigentümer bestätigte Nummer · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__01.webp / belege/p0-ausgangsstand/impressum__d1440-light__02.webp
- Status: offen
- Unsicherheit: Welche der beiden Nummern stimmt, ist ungeklärt; bis zur Klärung bleibt der Altstand-Wert stehen. Nicht eigenmächtig ändern.

### E-RECHT-004 · Impressum: Handwerkskammer, Kammerportal, Berufsbezeichnung
- Kategorie: Recht
- Quelle: ALT-RECHT-12–14 · app/impressum/page.tsx:195-222 · Bild: belege/p0-altstand/alt-impressum__d1440-light__02.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-07, app/impressum/page.tsx:104-140, 169-174; `CHAMBER` in components/legal/legal-data.ts:34-44)
- Aufgabe: Pflichtangaben zur zuständigen Kammer, Aufsichtsbehörde, Berufsbezeichnung und zum verleihenden Staat.
- Wesenskern: „Zuständige Handwerkskammer und Aufsichtsbehörde“ · „Handwerkskammer Wiesbaden“ · „Bierstadter Straße 45, 65189 Wiesbaden“ · „Telefon: 0611 1360“ · „E Mail: info@hwk-wiesbaden.de“ · Knopf „Kammerportal öffnen“ (https://www.hwk-wiesbaden.de, neuer Tab) · „Berufsbezeichnung: Meisterbetrieb des SHK Handwerks, Installateur und Heizungsbauer, verliehen in der Bundesrepublik Deutschland. Berufsrechtliche Regelungen: Handwerksordnung HwO.“ Neu identisch bis auf „SHK-Handwerks“ und „Handwerksordnung (HwO)“; der Knopf ist die Zeile „Website: www.hwk-wiesbaden.de“ als Link.
- Freiraum: Knopf als Textlink.
- Bindungen: `CHAMBER`; offen, ob die Kammerdaten aktuell sind (datenschutz-aenderungen.md Abschnitt 3: „bitte aktuell halten“).
- Priorität: Muss – Grund: gesetzliche Pflichtangaben (Aufsichtsbehörde, Berufsbezeichnung, Staat).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/impressum/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Kammer, Anschrift, Telefon, E-Mail, Website und Berufsbezeichnung stehen auf /impressum · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__02.webp / belege/p0-ausgangsstand/impressum__d1440-light__02.webp
- Status: offen
- Unsicherheit: Kammerdaten sind weder im Altstand noch im Ausgangsstand gegen die Kammer-Website geprüft.

### E-RECHT-005 · Impressum: Verbraucherstreitbeilegung und Universalschlichtungsstelle
- Kategorie: Recht
- Quelle: ALT-RECHT-15 · app/impressum/page.tsx:225-244 · Bild: belege/p0-altstand/alt-impressum__d1440-light__02.webp
- Zustand: geschwächt (+ Gegenstück: NEU-RECHT-08, app/impressum/page.tsx:176-182: nur noch „Wir sind grundsätzlich bereit, an Streitbeilegungsverfahren vor einer anerkannten Verbraucherschlichtungsstelle teilzunehmen.“; der Satz „Die Europäische Kommission stellt eine Plattform zur Online Streitbeilegung OS bereit, die Sie unter https://consumer-redress.ec.europa.eu/site-relocation_en finden.“ ist bewusst entfernt (Plattform im Juli 2025 eingestellt, datenschutz-aenderungen.md Abschnitt 3))
- Aufgabe: Verbraucherinformation zur Streitbeilegung nach VSBG.
- Wesenskern: Überschrift „Verbraucherstreitbeilegung und Universalschlichtungsstelle“ (Abschnitt „Rechtliche Hinweise und Streitbeilegung“) und die Bereitschaftserklärung im Wortlaut. Offen: Wer „grundsätzlich bereit“ erklärt, muss nach § 36 VSBG die zuständige Verbraucherschlichtungsstelle mit Anschrift und Website nennen; die Überschrift nennt „Universalschlichtungsstelle“, der Text keine Stelle. Das gilt für Alt- und Ausgangsstand gleichermaßen.
- Freiraum: Wortlaut nach Rechtsprüfung.
- Bindungen: datenschutz-aenderungen.md Abschnitt 3 („Bewusst nicht geändert, bitte prüfen“); Test legal-pages.test.ts.
- Priorität: Muss – Grund: gesetzliche Verbraucherinformation.
- Entscheidung: Verschmelzen (korrigiert nach E-014; vorher Zurückstellen)
- Ziel in der Plattform: –
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert; Stelle nur nach Rechtsprüfung ergänzen.
- Abnahme: Rechtliche Prüfung liegt vor; der vorhandene Wortlaut bleibt bis dahin stehen · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__02.webp / belege/p0-ausgangsstand/impressum__d1440-light__02.webp
- Status: offen
- Unsicherheit: Offene Rechtsfrage (§ 36 und § 37 VSBG: Bereitschaft, Name der Schlichtungsstelle) und Bestätigung, dass der OS-Satz entfallen darf. Keine Pflichtangabe der alten Seite fehlt; der Wortlaut bleibt erhalten.

### E-RECHT-006 · Impressum: Haftung für Inhalte und Links
- Kategorie: Recht
- Quelle: ALT-RECHT-16 · app/impressum/page.tsx:246-251 · Bild: belege/p0-altstand/alt-impressum__d1440-light__02.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-09, app/impressum/page.tsx:184-191: „§ 7 Abs. 1 DDG“ und „§§ 8 bis 10 DDG“ statt TMG)
- Aufgabe: Haftungsausschluss für eigene Inhalte und fremde Informationen.
- Wesenskern: „Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. […]“ (49 Wörter), jetzt mit DDG, weil das TMG seit Mai 2024 nicht mehr gilt.
- Freiraum: Paragrafenverweise nach Rechtsprüfung.
- Bindungen: datenschutz-aenderungen.md Abschnitt 3 (Verweise prüfen; Überschrift „Haftung für Inhalte und Links“, Text nur zu Inhalten).
- Priorität: Muss – Grund: Rechtstext der Anbieterkennzeichnung.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/impressum/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Abschnitt `#haftung` vorhanden, Wortlaut mit DDG · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__02.webp / belege/p0-ausgangsstand/impressum__d1440-light__03.webp
- Status: offen
- Unsicherheit: Ob die DDG-Paragrafen so zutreffen (Repo: „prüfen“).

### E-RECHT-007 · Fuß: Registerzeile (Register, USt-IdNr., Geschäftsführer)
- Kategorie: Recht
- Quelle: ALT-SHELL-66 · components/Footer.tsx:328-330 · Bild: belege/p0-altstand/alt-impressum__d1440-light__03.webp
- Zustand: verschoben (+ Gegenstück: NEU-SHELL-15, components/site/SiteFooter.tsx:139-143: „© 2026 Bad und Energie GmbH Lahn Dill · HRB 2449 Amtsgericht Wetzlar · Innung Sanitär-, Heizungs- und Klimatechnik Lahn-Dill“; USt-IdNr. und Geschäftsführer stehen nicht mehr im Fuß, aber vollständig im Impressum)
- Aufgabe: Rechtsform und Register auf jeder Seite sichtbar.
- Wesenskern: „Amtsgericht Wetzlar HRB 2449 • USt ID DE 346 648 448 • Geschäftsführer: Diplomingenieur Sabri Demir“. Der Fuß ist keine Pflichtstelle; die Angaben nach § 5 DDG stehen im Impressum (E-RECHT-002, -003).
- Freiraum: Fußzeile ohne USt-IdNr. genügt, solange das Impressum jederzeit erreichbar ist (Link in jedem Fuß, auch im verkürzten Fuß der Bewerbung, NEU-SHELL-16).
- Bindungen: USt-Widerspruch (E-RECHT-003) bleibt so an einer Stelle statt an drei.
- Priorität: Soll – Grund: Vertrauenssignal, keine Pflicht.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/site/SiteFooter.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Fußzeile nennt Register, Gericht, Innung; Impressum-Link auf jeder Seite · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__03.webp / belege/p0-ausgangsstand/impressum__d1440-light__03.webp
- Status: offen
- Unsicherheit: keine

### E-RECHT-008 · Fuß: Link „Bewerber Datenschutz nach Paragraph 26 BDSG“
- Kategorie: Recht
- Quelle: ALT-SHELL-69 · components/Footer.tsx:341-347 · Bild: belege/p0-altstand/alt-impressum__d1440-light__03.webp
- Zustand: geschwächt (+ Gegenstück: Der Fuß hat nur „Datenschutz“ (NEU-SHELL-14); der Abschnitt `#bewerberdaten` besteht in /datenschutz (NEU-RECHT-16), aber kein Fußlink führt dorthin; der Altstand-Link `/datenschutz#bewerber-datenschutz` zeigte auf eine ID, die es nie gab)
- Aufgabe: Bewerbende gelangen vom Seitenende direkt zu den Bewerberdaten-Informationen.
- Wesenskern: Link „Bewerber Datenschutz nach Paragraph 26 BDSG“ mit Schloss-Symbol. Der Link war im Altstand defekt (Sprung nach oben). Die Formel „nach Paragraph 26 BDSG“ passt nach EuGH C-34/21 nicht mehr (Datenschutzerklärung: § 26 BDSG nur ergänzend).
- Freiraum: Beschriftung („Datenschutz für Bewerbende“), Ziel `/datenschutz#bewerberdaten`.
- Bindungen: Anker `#bewerberdaten` (besteht); Hinweis im Flow „Mehr dazu in den Datenschutzhinweisen“ verlinkt bereits dorthin (datenschutz-aenderungen.md Abschnitt 5).
- Priorität: Soll – Grund: Zugang zur Bewerber-Information, Besuchernutzen.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: components/site/SiteFooter.tsx (Spalte „Rechtliches“: zusätzlicher Link auf `/datenschutz#bewerberdaten`)
- Gestaltung: folgt KERN (P2); vorläufige Idee: dritter Eintrag „Datenschutz für Bewerbende“ in „Rechtliches“.
- Abnahme: Link führt zum Abschnitt „Bewerbung über diese Website“ (ID `bewerberdaten` im HTML) · Bildpaar belege/p0-altstand/alt-impressum__d1440-light__03.webp / belege/p0-ausgangsstand/impressum__d1440-light__03.webp
- Status: offen
- Unsicherheit: Ob ein zweiter Datenschutz-Link im Fuß gewollt ist (ROADMAP §5: „Rechtliches“ mit zwei Links).

### E-RECHT-009 · Datenschutz: Kopf (Stand, Brotkrumen, Überschrift, Einleitung)
- Kategorie: Recht
- Quelle: ALT-RECHT-18, ALT-RECHT-21–23 · app/datenschutz/page.tsx:52-61, 82-99 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__01.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-10, app/datenschutz/page.tsx:146-154: Brotkrumen „Startseite › Datenschutz“, Eyebrow „Rechtliches“, H1 „Datenschutzerklärung“, Lead „Welche Daten wir verarbeiten, wenn du diese Website nutzt oder dich bei uns bewirbst, wofür und wie lange.“, Zeile „Stand: Oktober 2026“ aus `PRIVACY_NOTICE_VERSION`)
- Aufgabe: Der Besucher erkennt Dokument, Stand und Geltungsbereich.
- Wesenskern: „DSGVO und § 26 BDSG RECHTSSTAND“ · „Dokumentenversion 4.2.1 • Letzte Revision: Oktober 2026“ · „Startseite / Rechtliches und Compliance / Datenschutzerklärung“ · „Datenschutzerklärung und Information zur Verarbeitung personenbezogener Daten“ · „Transparenz, Datensicherheit und kompromissloser Schutz Ihrer Privatsphäre nach der DSGVO […]“ (30 Wörter). Der Stand lebt (ehrlich aus der Fassung 2026-10); „Dokumentenversion 4.2.1“ war nicht belegt, die Zwischenstufe „Rechtliches und Compliance“ hatte kein Ziel.
- Freiraum: Wortlaut in Du-Form; Stand-Format.
- Bindungen: `PRIVACY_NOTICE_VERSION` (lib/applications/schema) wird mit jeder Bewerbung gespeichert (datenschutz-aenderungen.md Kopf).
- Priorität: Soll – Grund: Rechtsdokument-Rahmen, Stand-Angabe.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/datenschutz/page.tsx, components/legal/LegalDocument.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Stand „Oktober 2026“ aus der Fassung, H1 vorhanden · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__01.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__01.webp
- Status: offen
- Unsicherheit: keine

### E-RECHT-010 · Datenschutz: unbelegte Siegel und Kennzahlenkarten
- Kategorie: Vertrauen
- Quelle: ALT-RECHT-19, ALT-RECHT-20, ALT-RECHT-24–27, ALT-RECHT-51 · app/datenschutz/page.tsx:64-73, 103-154, 474-493 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__01.webp (Kopfstreifen, vier Karten), belege/p0-altstand/alt-datenschutz__d1440-light__03.webp (Plakette „Verifiziert Sicher“)
- Zustand: verloren (+ Gegenstück: Abschnitt „Kurz gesagt“ `#ueberblick` (NEU-RECHT-13) übernimmt die Überblicksaufgabe belegt; die Siegel selbst sind entfernt (datenschutz-aenderungen.md Abschnitt 1, „ENTFERNT“))
- Aufgabe: Vertrauen und Überblick am Seitenanfang.
- Wesenskern: „Auditierte Verschlüsselung (TLS 1.3)“ · „Serverstandort Frankfurt am Main (Hessen)“ · Karten „100% DSGVO & BDSG“ · „100% Lokale Fonts“ („Kein Verbindungsaufbau zu Drittanbietern oder US Servern“, im Altstand falsch: Google Maps lud ohne Einwilligung) · „256 Bit SSL und TLS“ · „§ 26 BDSG Diskretion“ („Garantierter Kündigungsschutz und Sperrvermerk“, keine datenschutzrechtliche Zusage) · Plakette „Verifiziert Sicher“. Keine dieser Aussagen ist im Repo belegt (kein Audit, kein Prüfnachweis). Belegt und weiter vorhanden: Hosting Vercel mit Serverfunktionen in Region fra1 (Datenschutz § Hosting), TLS-Hinweis, Schriften Inter ohne Google-Verbindung.
- Freiraum: –
- Bindungen: Datenschutz-Prüfliste (datenschutz-aenderungen.md Abschnitt 6).
- Priorität: Kann – Grund: unbelegte oder falsche Zusagen ohne eigene Aufgabe.
- Entscheidung: Nicht zurückführen (erfunden/unbelegt)
- Ziel in der Plattform: –
- Gestaltung: folgt KERN (P2); vorläufige Idee: entfällt; Überblick liefert „Kurz gesagt“.
- Abnahme: Seite enthält keines der genannten Siegel; „Kurz gesagt“ nennt nur belegte Aussagen · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__01.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__01.webp
- Status: offen
- Unsicherheit: keine

### E-RECHT-011 · Datenschutz: Inhaltsverzeichnis mit Sprungliste und Stichwortfilter
- Kategorie: Navigation
- Quelle: ALT-RECHT-28, ALT-RECHT-29, ALT-RECHT-30–36 · app/datenschutz/page.tsx:34-47, 161-202 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__01.webp (Karte links)
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-11, components/legal/LegalToc.tsx: Liste „Inhalt“ mit zwölf Abschnitten, auf lg mitlaufend; Test components/legal/__tests__/legal-pages.test.ts:36 „keine Suche, kein Akkordeon, kein Client-Code“)
- Aufgabe: Besucher finden einen Abschnitt der langen Erklärung schnell.
- Wesenskern: Karte „Inhaltsverzeichnis & Index“ mit Badge „7 Abschnitte“; Filterfeld „Stichwort filtern (z.B. Löschung)...“ (filterte nur Titel und Kürzel, ohne Hinweis bei null Treffern); Sprünge „§ 01 Verantwortliche Stelle & Kontakt“ (`#verantwortlicher`), „§ 02 Rechtsgrundlagen (Art. 6 DSGVO)“ (`#rechtsgrundlagen`), „§ 03 Datenerfassung & Hosting“ (`#datenerfassung`), „§ 04 Bewerbung und Recruiting nach § 26 BDSG“ (`#bewerberdaten`, rot hervorgehoben), „§ 05 Cookies, Analyse und Lokale Schriften“ (`#cookies-analyse`), „§ 06 Ihre Betroffenenrechte Art. 15 bis 21“ (`#betroffenenrechte`), „§ 07 Aufsichtsbehörde (HBDI Hessen)“ (`#aufsichtsbehoerde`). Neu: zwölf Einträge, alle sieben alten Anker bleiben gültig (HTML geprüft); Auffinden per Browser-Suche ersetzt den Filter, dessen Aufgabe das Verzeichnis vollständig trägt.
- Freiraum: Beschriftungen ohne „§“-Nummern; Filter entfällt.
- Bindungen: Anker (eingehende Links, Fuß-Link, Formular-Hinweis); Anker-Prüfung in Anhang B.
- Priorität: Soll – Grund: Orientierung in einem langen Rechtstext, Anker haben eingehende Links.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/legal/LegalToc.tsx, components/legal/LegalDocument.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Jeder Eintrag springt zu einer vorhandenen ID; die sieben alten IDs sind im HTML vorhanden · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__01.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__01.webp
- Status: offen
- Unsicherheit: keine

### E-RECHT-012 · Datenschutz: Karte „Datenschutzauskunft“
- Kategorie: Recht
- Quelle: ALT-RECHT-37 · app/datenschutz/page.tsx:205-228 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__02.webp (Karte links unten)
- Zustand: verschoben (+ Gegenstück: Kontaktzeile am Ende von `#betroffenenrechte` („Fragen zu deinen Daten, zum Beispiel aus deiner Bewerbung? Schreib an datenschutz@bad-energie.de oder ruf uns an: 06441 42956.“) und Absatz zum Datenschutzbeauftragten in `#verantwortlicher`; NEU-RECHT-12, -22)
- Aufgabe: Direkter Weg zu Datenschutzfragen und zum Widerruf einer Einwilligung.
- Wesenskern: „Datenschutzauskunft“ · „Sie haben Fragen zur Datenspeicherung im Bewerbungsverfahren oder möchten Ihre Einwilligung widerrufen?“ · „datenschutz@bad-energie.de“ (mailto) · „06441 42956 Zentrale Wetzlar“ (im Altstand ohne Link; neu verlinkt).
- Freiraum: Form (Textabsatz statt Karte).
- Bindungen: `LEGAL_ENTITY.privacyEmail`.
- Priorität: Soll – Grund: Kontaktweg für Betroffenenrechte.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/datenschutz/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Mailto auf datenschutz@bad-energie.de und tel-Link stehen im Abschnitt „Deine Rechte“ · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__02.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__12.webp
- Status: offen
- Unsicherheit: keine

### E-RECHT-013 · Datenschutz: Knopf „PDF drucken oder exportieren“
- Kategorie: Interaktives
- Quelle: ALT-RECHT-38 · app/datenschutz/page.tsx:229-236; app/globals.css:72-88 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__02.webp
- Zustand: geschwächt (+ Gegenstück: Druck über die Browserfunktion; `print-hidden` blendet Kopf, Fuß und Verzeichnis aus (components/legal/LegalDocument.tsx:45); der Knopf fehlt; dokumentierter Mangel: `@page { margin: 0 }` gilt für alle Seiten, dadurch fehlen die Seitenränder beim Drucken (datenschutz-aenderungen.md Abschnitt 5))
- Aufgabe: Bewerbende können die Datenschutzerklärung als Kopie drucken oder als PDF speichern.
- Wesenskern: Knopf „PDF drucken oder exportieren“ ruft `window.print()`; Druck-Stylesheet blendet Navigation und Fuß aus.
- Freiraum: Knopf als Textlink „Drucken“; Ränder über benannte Seite (nur die Bewerbungsmappe braucht `margin: 0`).
- Bindungen: app/globals.css (`@page`), Bewerbungsmappe (benannte Druckseite).
- Priorität: Kann – Grund: Bequemlichkeit, Browser-Druck vorhanden.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: app/globals.css (Seitenrand für Rechtsseiten), optional components/legal/LegalDocument.tsx (Druck-Link)
- Gestaltung: folgt KERN (P2); vorläufige Idee: kleiner Textlink „Seite drucken“ unter dem Stand.
- Abnahme: Druckvorschau von /datenschutz zeigt Text mit Seitenrand, ohne Kopf und Fuß · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__02.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__01.webp
- Status: offen
- Unsicherheit: Ob ein Druck-Link gewünscht ist; der Seitenrand-Mangel gilt unabhängig davon.

### E-RECHT-014 · Datenschutz § 01: Verantwortliche Stelle und Datenschutzbeauftragter
- Kategorie: Recht
- Quelle: ALT-RECHT-39–42 · app/datenschutz/page.tsx:243-302 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__02.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-12, app/datenschutz/page.tsx:77-109, 155-170, Abschnitt `#verantwortlicher`)
- Aufgabe: Pflichtangabe des Verantwortlichen nach Art. 13 Abs. 1 lit. a DSGVO mit Kontakt; Stand zur Benennung eines Datenschutzbeauftragten.
- Wesenskern: „Verantwortlicher im Sinne der Datenschutz Grundverordnung DSGVO, […]“ (23 Wörter) · „Bad und Energie GmbH Lahn Dill“ · „Siegmund-Hiepe-Str. 20 / 35578 Wetzlar im Lahn Dill Kreis“ (Zusatz „im Lahn Dill Kreis“ entfällt) · „Handelsregister: Amtsgericht Wetzlar / Registernummer: HRB 2449 / USt-IdNr.: DE 346 648 448“ · „Geschäftsführer: Diplomingenieur Sabri Demir“ · Telefon, Telefax, E-Mail · „Gesetzlicher Status zum Datenschutzbeauftragten gem. § 38 BDSG: Da in unserem Handwerksbetrieb in der Regel weniger als 20 Personen ständig mit der automatisierten Verarbeitung personenbezogener Daten beschäftigt sind […]“ (52 Wörter). Badge „Meisterbetrieb seit 1926“ und Logo entfallen.
- Freiraum: Definitionsliste statt Karte.
- Bindungen: Owner-Fragen O1 (USt-IdNr.), O2 (benannter Datenschutzbeauftragter).
- Priorität: Muss – Grund: gesetzliche Pflichtangabe.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/datenschutz/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Abschnitt `#verantwortlicher` mit allen acht Angaben und Absatz zum Datenschutzbeauftragten · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__02.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__01.webp
- Status: offen
- Unsicherheit: Ob ein Datenschutzbeauftragter benannt ist (O2).

### E-RECHT-015 · Datenschutz § 02: Rechtsgrundlagen der Verarbeitung
- Kategorie: Recht
- Quelle: ALT-RECHT-43–47 · app/datenschutz/page.tsx:306-376 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__02.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-14, app/datenschutz/page.tsx:188-220, Abschnitt `#rechtsgrundlagen`)
- Aufgabe: Art.-13-Pflichtangaben zu den Rechtsgrundlagen.
- Wesenskern: Art. 6 Abs. 1 lit. a (Einwilligung, „Jederzeit frei widerruflich“), lit. b (Vertragserfüllung und Anfragen), lit. c (Aufbewahrung nach HGB und AO, bis zu 10 Jahre), lit. f (berechtigte Interessen) im Wortlaut als Liste; Kartentags „Kerngeschäft Handwerk“, „Gesetzliche Aufbewahrung“, „Systemintegrität“ entfallen. Beispiel „optionale Analyse-Cookies“ ist durch „Google Maps“ ersetzt; neu ein Absatz zu § 25 TDDDG.
- Freiraum: Liste statt Kartenraster.
- Bindungen: datenschutz-aenderungen.md Abschnitt 2.3 (DSB-Prüfung).
- Priorität: Muss – Grund: Pflichtangaben nach Art. 13 DSGVO.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/datenschutz/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Alle vier Rechtsgrundlagen stehen im Abschnitt · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__02.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__03.webp
- Status: offen
- Unsicherheit: keine

### E-RECHT-016 · Datenschutz § 03: Hosting, Server-Logdateien, SSL und TLS, Kontaktformulare
- Kategorie: Recht
- Quelle: ALT-RECHT-48–50 · app/datenschutz/page.tsx:389-469 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__03.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-15, app/datenschutz/page.tsx:222-278, Abschnitt `#datenerfassung`; Kontaktformulare jetzt unter `#kontakt`, NEU-RECHT-20)
- Aufgabe: Information zu Logdateien, Verschlüsselung und Kontaktaufnahme (Art. 13 DSGVO).
- Wesenskern: Server-Logdateien mit sechs Merkmalen, „Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO“, „Löschfrist: Automatisch nach 7 Tagen“; „SSL und TLS Verschlüsselung mit 256 Bit“ (70 Wörter); „Kontaktformulare und direkte Anfragen“ (39 Wörter, lit. b). Neu ergänzt: Hoster Vercel (Region fra1), Missbrauchsschutz, Sicherheitsmeldungen, Übermittlung in die USA.
- Freiraum: Akkordeons entfallen (Test legal-pages.test.ts).
- Bindungen: Owner-Frage O4 (Aufbewahrung der Vercel-Logs, IP-Kürzung); „256 Bit“ ohne Nachweis (datenschutz-aenderungen.md 2.4).
- Priorität: Muss – Grund: Pflichtangaben nach Art. 13 DSGVO.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/datenschutz/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Abschnitte Logdateien (7 Tage), TLS und Kontakt vorhanden · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__03.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__03.webp
- Status: offen
- Unsicherheit: „7 Tage“, „gekürzte IP“ und „256 Bit“ sind nicht gegen die tatsächliche Hosting-Konfiguration geprüft (O4).

### E-RECHT-017 · Datenschutz § 04: Bewerberdaten, Löschfristen, Talentpool
- Kategorie: Recht
- Quelle: ALT-RECHT-52, ALT-RECHT-54–56 · app/datenschutz/page.tsx:495-497, 512-558 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__04.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-16, app/datenschutz/page.tsx:280-383, Abschnitt `#bewerberdaten`)
- Aufgabe: Information zur Verarbeitung von Bewerberdaten, Aufbewahrung und Talentpool.
- Wesenskern: Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO (neu mit Hinweis EuGH C-34/21, § 26 BDSG nur ergänzend); Datenkategorien: „Stammdaten wie Name, Vorname, Wohnort, Telefon, E Mail“, „Berufliche Qualifikationen wie Gesellenbrief, Meistertitel, Fachzertifikate“, „Führerscheinklassen wie Klasse B oder BE für Kundendienstfahrzeuge“, „Freiwillige Konditionswünsche sowie möglicher Eintrittstermin oder Kündigungsfrist“; „Löschfristen: spätestens 6 Monate nach Bekanntgabe der Absageentscheidung“ (Art. 17 DSGVO, § 15 Abs. 4 AGG); „Talentpool der Bad und Energie GmbH“: höchstens 24 Monate, ausdrücklich eingewilligt, widerruflich. Neu: Erfassung im 60-Sekunden-Flow, Pflichtangaben, Empfänger, Auftragsverarbeiter Vercel und Resend, keine automatisierte Entscheidung, keine KI.
- Freiraum: Gliederung in Unterüberschriften statt rotem Kasten.
- Bindungen: Hinweis im Flow verlinkt `/datenschutz#bewerberdaten` (ContactStep); Phase 2 (Supabase) erfordert Anpassung vor Go-live (datenschutz-aenderungen.md 2.5); Owner-Fragen O3 (AVV), O7 (KI-Werkzeuge).
- Priorität: Muss – Grund: Pflichtangaben nach Art. 13 DSGVO.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/datenschutz/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Alle vier Datenkategorien, die 6-Monats-Frist und der Talentpool (24 Monate) stehen im Abschnitt · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__04.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__07.webp
- Status: offen
- Unsicherheit: AVVs mit Vercel und Resend (O3) und KI-Aussage (O7) sind offen.

### E-RECHT-018 · Datenschutz: Sperrvermerk für ungekündigte Fachkräfte
- Kategorie: Vertrauen
- Quelle: ALT-RECHT-53 · app/datenschutz/page.tsx:499-510 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__04.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-16, Unterabschnitt „Sperrvermerk für ungekündigte Fachkräfte“ in app/datenschutz/page.tsx:335-340 mit `DISCRETION_PROMISE`)
- Aufgabe: Wer noch angestellt ist, erfährt rechtlich verbindlich, wie mit seiner Bewerbung umgegangen wird.
- Wesenskern: „Garantierter Sperrvermerk für ungekündigte Fachkräfte“ · „Sofern Sie sich in einem bestehenden, ungekündigten Arbeitsverhältnis befinden und unseren digitalen Expressbereich nutzen, greift unsere uneingeschränkte Diskretionsgarantie. Wir kontaktieren […]“ (49 Wörter). Neu: „Bist du noch ungekündigt angestellt, gilt unsere Diskretionszusage. Dein Wechsel bleibt vertraulich: Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber. Unsere Geschäftsleitung meldet sich vertraulich und nur über die privaten Kanäle, die du uns nennst, zum Beispiel über deine private Mobilnummer oder per WhatsApp nach Feierabend.“ Verstärker „garantiert“, „uneingeschränkt“, „absolut“ und „digitaler Expressbereich“ entfallen (datenschutz-aenderungen.md 2.5).
- Freiraum: Wortlaut nach DSB-Prüfung.
- Bindungen: `DISCRETION_PROMISE` (lib/content/process.ts:92), Fakt `discretion`.
- Priorität: Muss (korrigiert nach E-014; vorher Soll) – Grund: belegte Zusage, Vertrauen der Hauptzielgruppe.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/datenschutz/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Unterabschnitt vorhanden, Wortlaut gleich `DISCRETION_PROMISE` · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__04.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__07.webp
- Status: offen
- Unsicherheit: Formulierung wartet auf DSB-Bestätigung (Checkliste Abschnitt 6).

### E-RECHT-019 · Datenschutz § 05: Schriften und Aussage zu Cookies
- Kategorie: Recht
- Quelle: ALT-RECHT-57, ALT-RECHT-75 · app/datenschutz/page.tsx:563-587; app/layout.tsx:2-15 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__04.webp (Abschnitt § 05)
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-21, app/datenschutz/page.tsx:492-504; NEU-SHELL-22: Inter über `next/font/google`, beim Build eingebunden, im HTML kein Verweis auf fonts.googleapis.com oder fonts.gstatic.com)
- Aufgabe: Information, dass der Browser für Schriften keine Verbindung zu Dritten aufbaut, und dass keine Cookies gesetzt werden.
- Wesenskern: „Lokales Hosting von Schriftarten ohne US Transfer“ · „Kein US Transfer“ · „Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten lokale Schriftdateien. […]“ (66 Wörter). Neu belegt: „Wir nutzen die Schrift Inter. Sie wird beim Erstellen der Website eingebunden und von unserem Hoster zusammen mit den Seiten ausgeliefert. Dein Browser stellt dafür keine Verbindung zu Google Fonts oder anderen Dritten her.“ plus „Diese Website setzt keine Cookies und nutzt keine Tracking-Pixel und keine Analyse- oder Statistik-Tools. Deshalb gibt es auch kein Cookie-Banner.“ Im Altstand ließ sich die Schriftquelle nicht abschließend belegen (`next/font/google`).
- Freiraum: Wortlaut.
- Bindungen: app/layout.tsx:15-20 (`Inter` mit `display: 'swap'`); die Aussage ist an die Schriftquelle gebunden.
- Priorität: Muss – Grund: Recht (TDDDG, DSGVO-Information).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/datenschutz/page.tsx, app/layout.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: HTML der Startseite enthält keinen Verweis auf Google Fonts; Aussage stimmt mit der Schriftquelle überein · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__04.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__11.webp
- Status: offen
- Unsicherheit: Wenn KERN (P2) eine andere Schrift einführt, muss der Abschnitt nachgezogen werden.

### E-RECHT-020 · Webanalyse-Abschnitt, Analyse-Anbieter und Cookie-Tabellen (Fantasie-Cookies)
- Kategorie: Recht
- Quelle: ALT-RECHT-58, ALT-RECHT-72, ALT-RECHT-73, ALT-SHELL-95–98, ALT-SHELL-102 · app/datenschutz/page.tsx:589-604; components/CookieConsent.tsx:80-88, 287-438, 547-552 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__04.webp (Karte „Webanalyse“)
- Zustand: verloren (+ Gegenstück: keines; die Datenschutzerklärung sagt: „Diese Website setzt keine Cookies und nutzt keine Tracking-Pixel und keine Analyse- oder Statistik-Tools.“; NEU-RECHT-21; Herkunftsmessung ohne Cookies unter `#herkunft`, NEU-RECHT-18)
- Aufgabe: Der Altstand beschrieb Cookie-Kategorien und Analyse-Dienste.
- Wesenskern: Kategorien „Technisch notwendige Dienste“ (mit „CSRF Schutz“) und „Analyse und Performancemessung“ (Schalter, Startwert aus); Tabellen mit Cookie-Namen `be_session_id`, `cookie_consent_status`, `csrf_token_auth`, `_pk_id` („Matomo / PostHog (EU-Hosting)“), `perf_load_metrics`; Karte „Webanalyse und Cookiesteuerung nach TDDDG Paragraph 25“ (Einwilligung erforderlich); Modal-Fuß „ID: CONSENT-WETZLAR-2449-2026“ · „2026-10-01 04:10:50 UTC“. Keiner dieser Cookie-Namen kommt im Quelltext vor (Grep über app, components, lib, Middleware); kein `document.cookie`, kein `Set-Cookie`, kein Matomo- oder PostHog-Skript; die Consent-ID ist ein fester Platzhalter. Gesetzt wurde nur ein localStorage-Schlüssel.
- Freiraum: –
- Bindungen: Falls Phase 3 Werbe-Pixel einführt (ROADMAP §7), braucht die Seite einen neuen, wahrheitsgemäßen Einwilligungsdialog (datenschutz-aenderungen.md 2.10, „Hinweis Phase 3“).
- Priorität: Kann – Grund: erfundene Angaben ohne Aufgabe.
- Entscheidung: Nicht zurückführen (erfunden/unbelegt)
- Ziel in der Plattform: –
- Gestaltung: folgt KERN (P2); vorläufige Idee: entfällt.
- Abnahme: Kein Cookie-Name aus der Altstand-Tabelle erscheint im Ausgangsstand; Antwortheader ohne `Set-Cookie` (GET auf `/` geprüft) · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__04.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__11.webp
- Status: offen
- Unsicherheit: Ob die Umsetzung außerhalb des Repos (etwa ein Analyse-Skript im Hosting) je existierte, ist nicht prüfbar.

### E-RECHT-021 · Cookie-Banner und Einwilligungs-Dialog (Mechanik)
- Kategorie: Recht
- Quelle: ALT-SHELL-70, ALT-SHELL-85–94, ALT-SHELL-101, ALT-SHELL-103, ALT-SHELL-104, ALT-RECHT-71 · components/CookieConsent.tsx:16-33, 53-57, 90-110, 124-277, 522-568; components/Footer.tsx:30-35, 348-354; lib/store/consentStore.ts:21-85; lib/store/storageGate.ts:7-23 · Bild: belege/p0-altstand/alt-start__d1440-light__01.webp (Knopf „Cookie Einstellungen“ unten links), belege/p0-altstand/alt-start__m375-light__01.webp (mobil „Cookies“)
- Zustand: verschoben (+ Gegenstück: kein Banner und kein Knopf; die Aufgabe „Einwilligung zu optionalen Drittdiensten einholen und widerrufbar machen“ lebt für den einzigen optionalen Dienst, Google Maps, als Zwei-Klick-Lösung (E-RECHT-022); Datenschutz § „Cookies, Analyse und Schriften“: „Deshalb gibt es auch kein Cookie-Banner.“; ROADMAP §5 lässt den „Cookie-Re-Open-Button“ bewusst entfallen)
- Aufgabe: Besucher entscheiden über optionale Dienste; das Unternehmen belegt die Einwilligung (TDDDG § 25).
- Wesenskern: Banner „Privatsphäre und Präferenzen“ (Badge „TDDDG § 25“) mit „Nur essenzielle Cookies“ · „Alle akzeptieren“ · „Einstellungen anpassen“ · Links „Datenschutz“ und „Impressum“; Modal „Datenschutz- & Cookie-Präferenzen“ (Badge „TDDDG / DSGVO“) mit „Alle ablehnen“ · „Auswahl speichern“ · „Alle akzeptieren“; Speicher `bad_energie_cookie_consent_v2` (localStorage) und Ereignis `bad_energie_consent_change`; Fuß-Knopf „Cookie Einstellungen“ und fester Knopf „Cookies“. Befunde: Der Banner wurde von nichts ausgewertet (kein Gate für Dritte); der zweite Speicher `bad_energie_consent_v1` samt `canAccessStorage` ist ungenutzt; der Schlüssel der WhatsApp-Position fehlte in allen Tabellen. Laut Datenschutzerklärung des Ausgangsstands (Prüfung durch den Datenschutzbeauftragten offen) gibt es keinen einwilligungspflichtigen Dienst außer Maps; Entwurf und Mappe stützen sich auf § 25 Abs. 2 Nr. 2 TDDDG.
- Freiraum: Mechanik entfällt, solange es nur den Zwei-Klick-Dienst gibt.
- Bindungen: Phase 3 (Werbe-Pixel, ROADMAP §7) und Phase 4 (Talentpool) können wieder einen Dialog nötig machen; Speicher `be:maps-consent:v1` (lib/maps/consent.ts).
- Priorität: Muss – Grund: Recht (Einwilligung und Widerruf), Wesen bleibt für künftige Dienste gültig.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/maps/RegionExplorer.tsx, lib/maps/consent.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Antwort ohne `Set-Cookie`; vor dem Klick auf „Interaktive Karte laden“ keine Anfrage an Google-Hosts (Browserlauf mit Anfragesperre) · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__01.webp
- Status: offen
- Unsicherheit: Wenn Phase 3 oder 4 weitere Dienste bringt, entsteht ein neuer Einwilligungsbedarf; die alte Mechanik ist dafür keine Vorlage (nicht wirksam, siehe Befunde).

### E-RECHT-022 · Einwilligung für Google Maps (Zwei-Klick statt Cookie-Modal)
- Kategorie: Einbindung Dritter
- Quelle: ALT-SHELL-99, ALT-SHELL-100, ALT-RECHT-70 · components/CookieConsent.tsx:441-517; components/maps/InteractiveMapClientWrapper.tsx:8-19; components/maps/InteractiveMap.tsx:129-134; lib/maps/google-maps-loader.ts:76-82 · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-19, Datenschutz `#google-maps`; components/maps/RegionExplorer.tsx:35-110 mit Knopf „Interaktive Karte laden (Google Maps)“ und „Karte wieder ausblenden“, lib/maps/consent.ts (`be:maps-consent:v1`), Standard: typografische Radius-Grafik ohne Google-Verbindung)
- Aufgabe: Die interaktive Karte lädt Google-Skripte erst nach ausdrücklicher Einwilligung.
- Wesenskern: Kategorie „Funktionale Erweiterungen & Drittmedien“ („Ermöglicht interaktive Inhalte wie die Anfahrtskarte zu unserem Meisterbetrieb in der Siegmund-Hiepe-Str. 20 (Google Maps) und Videotouren der Sanierungsausstellung.“, 19 Wörter) mit Tabelle `maps_view_coord`, `video_embed_state`. Altstand-Befund: Die Startseite lud das Google-Maps-Skript ohne Prüfung des Schalters (Widerspruch zur Aussage „keine Verbindung zu Servern der Google LLC“). Videotouren und die zwei Cookie-Namen sind nicht belegt.
- Freiraum: Zwei-Klick-Form; kein Cookie-Modal.
- Bindungen: Datenschutz-Abschnitt `#google-maps`; CSP Report-Only (next.config.ts) mit Google-Hosts; `/api/maps/config` (E-SEO-017).
- Priorität: Muss – Grund: Recht (Einwilligung vor Datenübermittlung an Google).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/maps/RegionExplorer.tsx, lib/maps/consent.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Ohne Klick keine Anfrage an `*.google*`; nach Klick lädt die Karte; „Karte wieder ausblenden“ löscht die Einwilligung · Bildpaar belege/p0-altstand/alt-start__d1440-light__01.webp / belege/p0-ausgangsstand/start__d1440-light__05.webp
- Status: offen
- Unsicherheit: Ob ein Google-Maps-Schlüssel in der Produktion gesetzt ist (ohne Schlüssel erscheint nur die Grafik, `mapsAvailable`); nicht geprüft.

### E-RECHT-023 · Datenschutz § 06: Betroffenenrechte und Widerruf
- Kategorie: Recht
- Quelle: ALT-RECHT-59–66 · app/datenschutz/page.tsx:607-677 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__05.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-22, app/datenschutz/page.tsx:506-547, Abschnitt `#betroffenenrechte`)
- Aufgabe: Pflichtinformation zu den Betroffenenrechten nach Art. 15 bis 21 DSGVO und zum Widerruf.
- Wesenskern: „Art. 15 DSGVO – Recht auf Auskunft“, „Art. 16 – Recht auf Berichtigung“, „Art. 17 – Recht auf Löschung und Vergessenwerden“, „Art. 18 – Recht auf Einschränkung“, „Art. 20 – Recht auf Datenübertragbarkeit“, „Art. 21 – Widerspruchsrecht“ (Texte im Wortlaut als Liste in Du-Form); „Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)“ mit Knopf „Widerruf absenden“ → `mailto:datenschutz@bad-energie.de?subject=Widerruf%20Einwilligung%20Datenschutz` (jetzt Link „E-Mail an datenschutz@bad-energie.de“ mit demselben Betreff). Neu: Widerruf für Google Maps über „Karte wieder ausblenden“.
- Freiraum: Liste statt Kartenraster, Link statt Knopf.
- Bindungen: Betreff des Mailtos; `LEGAL_ENTITY.privacyEmail`.
- Priorität: Muss – Grund: Pflichtangaben nach Art. 13 DSGVO.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/datenschutz/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Alle sechs Rechte und der Widerruf mit Betreff stehen im Abschnitt · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__05.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__12.webp
- Status: offen
- Unsicherheit: keine

### E-RECHT-024 · Datenschutz § 07: Aufsichtsbehörde (HBDI)
- Kategorie: Recht
- Quelle: ALT-RECHT-67–69 · app/datenschutz/page.tsx:681-724 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__06.webp
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-23, app/datenschutz/page.tsx:111-140, 549-556, Abschnitt `#aufsichtsbehoerde`; `SUPERVISORY_AUTHORITY` in components/legal/legal-data.ts:47-55)
- Aufgabe: Hinweis auf das Beschwerderecht und die zuständige Behörde.
- Wesenskern: „Gemäß Art. 77 DSGVO haben Sie […]“ (38 Wörter) · „Der Hessische Beauftragte für Datenschutz und Informationsfreiheit (HBDI)“ · „Hausanschrift: Gustav Stresemann Ring 1, 65189 Wiesbaden“ · „Postanschrift: Postfach 3163, 65021 Wiesbaden“ · „Telefon: +49 611 1408 0“ · „Telefax: +49 611 1408 900“ · „E Mail: poststelle@datenschutz.hessen.de“ (im Altstand ohne Link, neu verlinkt) · Knopf „Offizielles HBDI Portal“ („Zuständig für Hessen und Lahn Dill“) → https://datenschutz.hessen.de (neu Zeile „Website“ als Link).
- Freiraum: Form (Definitionsliste), Schreibweise nach DIN 5008.
- Bindungen: `SUPERVISORY_AUTHORITY`; Anker `#aufsichtsbehoerde`.
- Priorität: Muss – Grund: Pflichtangabe (Beschwerderecht, Art. 13 Abs. 2 lit. d DSGVO).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/datenschutz/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Behörde, beide Anschriften, Telefon, Fax, E-Mail und Website stehen im Abschnitt · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__06.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__13.webp
- Status: offen
- Unsicherheit: Behördendaten sind nicht gegen die HBDI-Website geprüft.

### E-RECHT-025 · Datenschutz: WhatsApp als Kontaktweg und Datenweitergabe
- Kategorie: Einbindung Dritter
- Quelle: ALT-RECHT-74 · components/Header.tsx:179-190; components/navigation/MobileMenuDrawer.tsx:147-151; components/Footer.tsx:84-93; components/QuickApplySidebar.tsx:129-133; components/contact/FloatingWhatsAppWidget.tsx:223-227; app/not-found.tsx:82-90; app/error.tsx:63-72 · Bild: belege/p0-altstand/alt-datenschutz__d1440-light__04.webp (Sperrvermerk nennt „diskrete WhatsApp-Terminierung“)
- Zustand: verschoben (+ Gegenstück: NEU-RECHT-20, Unterabschnitt „WhatsApp“ in `#kontakt` (app/datenschutz/page.tsx:478-489): WhatsApp Ireland Limited (Irland), mögliche Übermittlung an Meta Platforms, Inc. (USA), Links öffnen WhatsApp erst nach dem Tippen, der Text ist Teil der Link-Adresse; Alternative Telefon oder E-Mail)
- Aufgabe: Wer den WhatsApp-Weg nutzt, erfährt, welcher Dienst Daten erhält. Im Altstand nannte die Datenschutzerklärung WhatsApp nirgends als Empfänger.
- Wesenskern: Ziel `api.whatsapp.com/send` mit der Nummer und vorbefüllter Nachricht an sieben Fundstellen des Altstands.
- Freiraum: Wortlaut.
- Bindungen: Owner-Frage O6 (WhatsApp Business aktiv?); `buildWhatsAppUrl` in allen Fundstellen.
- Priorität: Muss – Grund: Recht (Information über Dienst mit Drittlandübermittlung).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/datenschutz/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Abschnitt „Telefon, E-Mail, WhatsApp“ nennt WhatsApp Ireland und Meta · Bildpaar belege/p0-altstand/alt-datenschutz__d1440-light__04.webp / belege/p0-ausgangsstand/datenschutz__d1440-light__11.webp
- Status: offen
- Unsicherheit: Anschrift von WhatsApp Ireland und die Rechtsgrundlage für eingehende WhatsApp-Nachrichten fehlen (datenschutz-aenderungen.md 2.9, O6).

## Element-Pässe · Suche und Technik (E-SEO)

Hinweis zu „Bild“: Metadaten, Textrouten und Schnittstellen haben keinen Bildschirmfoto-Beleg; die Abnahme erfolgt per `curl` (nur GET) gegen http://localhost:3500. Bildpaar daher „–“.

### E-SEO-001 · Metadaten Startseite und Wurzel (Titel, Beschreibung, Schlüsselwörter, Autor, Symbole, Canonical, Geo, Robots)
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-01, ALT-SEO-06, ALT-SEO-07, ALT-SEO-10, ALT-SEO-11, ALT-SEO-59 · app/page.tsx:58-74; app/layout.tsx:17-44, 70-86 · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-SEO-01, -04, -05, -06, -07, -08, -09; components/home/content.ts; app/layout.tsx:35-74)
- Aufgabe: Die Startseite wird für „Jobs Wetzlar“, „SHK Jobs“ und verwandte Suchen gefunden und sauber dargestellt.
- Wesenskern: Alt-Titel „Jobs Wetzlar | Heizungsbauer & Monteure | Bad & Energie“ · Alt-Beschreibung „SHK Handwerker Jobs in Wetzlar: Top Vergütung, 30 Tage Urlaub, freitags ab 13:30 Uhr frei & Firmenwagen. Jetzt in 60 Sek. bewerben bei Bad & Energie!“ · acht Schlüsselwörter („Jobs Wetzlar“ … „Kundendiensttechniker Wetzlar“) · canonical `https://karriere.bad-energie.de` · Geo DE-HE, Wetzlar, 50.56499;8.49842 · Robots index, follow (max-snippet −1). Neu nach ROADMAP §10: Titel „SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer“ (51 Zeichen), Beschreibung „SHK-Jobs in Wetzlar: Anlagenmechaniker, Kundendienst, Obermonteur & Ausbildung. 30 Tage Urlaub, freitags ab 13:30 frei. In 60 Sek. bewerben.“, sechs Schlüsselwörter, Titelvorlage „%s | Bad & Energie Karriere“. „Top Vergütung“ und „Firmenwagen“ entfallen (nicht belegt, fakten-abgleich B7); das Meta-Feld „creator“ entfällt.
- Freiraum: Wortlaut nach Suchdaten; Länge ≤ 60 und ≤ 155 Zeichen.
- Bindungen: `metadataBase` aus `APP_URL` (Standard https://karriere.bad-energie.de); canonical aller Seiten über `getCleanCanonicalUrl`; ROADMAP §10.
- Priorität: Muss – Grund: Seite mit Suchwert.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/layout.tsx, app/page.tsx, lib/seo/metadata.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: `curl` der Startseite liefert Titel, Beschreibung, canonical, robots „index, follow“ · Bildpaar –
- Status: offen
- Unsicherheit: Suchvolumen der neuen Titel ist nicht messbar (ROADMAP §10: nach dem Start mit Keyword-Planer und Search Console prüfen).

### E-SEO-002 · Metadaten /bewerbung und alte Query-Varianten (`?tab=`)
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-02 · app/bewerbung/layout.tsx:6-38 · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-SEO-11, app/bewerbung/page.tsx:19-32, 55-67; `legacyRedirectTarget` in lib/apply/params.ts:63-67)
- Aufgabe: Die Bewerbungsseite ist unter ihrer bisherigen Adresse auffindbar, alte Tab-Links führen weiter.
- Wesenskern: Alt-Titel „Bewerbung & Dokumenten-Upload | SHK Karriereportal“ · Beschreibung „SHK Bewerbungsportal: 4-Schritte-Fragebogen, Express-Upload für Lebenslauf & PDF-Dossier. […]“; canonical `…/bewerbung`. Neu: „Bewerben in 60 Sekunden – ohne Lebenslauf | Bad & Energie“ (57 Zeichen). HTTP geprüft (GET, ohne Weiterleitungen): `/bewerbung` 200; `?tab=quiz`, `?tab=vault`, `?tab=form`, `?tab=direct`, `?direct=true` 200 (Flow, Parameter ohne Wirkung); `?tab=dossier` 308 auf `/bewerbung/mappe`.
- Freiraum: Wortlaut.
- Bindungen: Tab-Zuordnung (dossier → Mappe), UTM und `ref` bleiben bei Weiterleitung erhalten (`carryOverQuery`).
- Priorität: Muss – Grund: URL mit Suchwert und eingehenden Links.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/bewerbung/page.tsx, lib/apply/params.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: `curl -s -o /dev/null -w '%{http_code} %{redirect_url}'` auf die genannten Varianten · Bildpaar –
- Status: offen
- Unsicherheit: Messbedingung: Im lokalen Lauf zeigen canonical und og:url dieser Seite auf http://localhost:3500, weil die dynamische Seite `APP_URL` der Laufzeit liest (NEU-SEO-11); auf den vorgerenderten Seiten steht die Produktionsadresse.

### E-SEO-003 · Metadaten Impressum und Datenschutz (jetzt noindex)
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-03, ALT-SEO-04 · app/datenschutz/layout.tsx:6-37; app/impressum/page.tsx:10-42 · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-SEO-14, NEU-SEO-32; lib/seo/metadata.ts:39 `indexable = type !== 'legal'`; Impressum und Datenschutz mit `robots: noindex, follow`, nicht in der Sitemap, ohne JSON-LD-Knoten)
- Aufgabe: Die Rechtsseiten tragen korrekte Titel und Beschreibungen und sind für Besucher auffindbar.
- Wesenskern: Alt-Titel „Datenschutz & Bewerberdaten DSGVO | Bad & Energie Wetzlar“ und „Impressum & Kontakt | Bad & Energie GmbH Lahn Dill Wetzlar“, Beschreibungen mit „§ 26 BDSG“ und „Leitung: Dipl.-Ing. Sabri Demir“; beide Seiten waren indexierbar und in der Sitemap. Neu: „Datenschutzerklärung | Bad & Energie Karriere“ und „Impressum | Bad & Energie Karriere“ mit neuen Beschreibungen. Die Erreichbarkeit nach § 5 DDG hängt an den Links im Fuß jeder Seite (Impressum und Datenschutz), nicht an der Indexierung.
- Freiraum: Indexierung nach Eigentümerentscheidung.
- Bindungen: datenschutz-aenderungen.md Abschnitt 1 („Beide Seiten sind jetzt noindex, follow; bisher indexierbar“); app/sitemap.ts-Kommentar; Test legal-pages.test.ts:43.
- Priorität: Soll – Grund: Suchwert gering (eigener Markenname + „Impressum“), Rechtserreichbarkeit unberührt.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: lib/seo/metadata.ts (`type: 'legal'`), app/impressum/page.tsx, app/datenschutz/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: `curl` beider Seiten: Meta-Robots „noindex, follow“, canonical gesetzt, nicht in der Sitemap · Bildpaar –
- Status: offen
- Unsicherheit: Ob der Eigentümer die Rechtsseiten bewusst aus dem Index nehmen wollte, ist nicht ausdrücklich bestätigt (Text-Review-Punkt).

### E-SEO-004 · Metadaten der 404-Seite
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-05 · app/not-found.tsx:14-17 · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-SEO-16, app/not-found.tsx:8-12: Titel „Seite nicht gefunden | Bad & Energie Karriere“, noindex, kein canonical; HTTP 404 bestätigt)
- Aufgabe: Fehlerseiten liefern Status 404 und bleiben aus dem Index.
- Wesenskern: Alt-Titel „Seite nicht gefunden (404) | Bad und Energie GmbH Lahn Dill“, Beschreibung „Die gewünschte Karriereseite konnte leider nicht gefunden werden. Nutzen Sie unsere Direktnavigation zu offenen Stellen oder der Bewerbung in Wetzlar.“; im Altstand erbte die Seite den Wurzel-Canonical und die Wurzel-OG-Angaben. Neu: kein Canonical. Befund im Ausgangsstand: Das HTML enthält zwei robots-Meta-Angaben („noindex“ und „noindex, follow“); die Wirkung ist gleich, die Doppelung ist zu bereinigen.
- Freiraum: Wortlaut.
- Bindungen: Status 404 darf nicht auf 200 wechseln.
- Priorität: Kann – Grund: reine Hygiene.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/not-found.tsx, app/layout.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: `/gibt-es-nicht-404` antwortet 404 mit noindex · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SEO-005 · OpenGraph- und Twitter-Karten (Standard)
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-08, ALT-SEO-09 · app/layout.tsx:45-69; public/images/bad-energie-lahn-dill-logo.webp · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-SEO-03, -09, -28, -29; app/opengraph-image.tsx, lib/seo/og-image.ts, lib/seo/metadata.ts)
- Aufgabe: Geteilte Links (WhatsApp, Social Media) zeigen eine sinnvolle Vorschau.
- Wesenskern: Altstand: Bild `…/images/bad-energie-lahn-dill-logo.webp`, deklariert 1200 × 630, tatsächlich 662 × 121 px; Karte `summary_large_image`; siteName „Bad und Energie GmbH Lahn Dill“, Locale de_DE. Neu: typografisches PNG 1200 × 630 je Seite (`/opengraph-image`, eigenes Bild je Stelle), alt-Texte gesetzt; die Abweichung des Altstands ist behoben.
- Freiraum: Gestaltung des Bildes (KERN).
- Bindungen: `metadataBase`; Bild-URL mit Versionsanhang.
- Priorität: Muss – Grund: Auffindbarkeit und Wirkung geteilter Links.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/opengraph-image.tsx, lib/seo/og-image.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: `/opengraph-image` antwortet 200 image/png, og:image-Maße 1200 × 630 · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SEO-006 · JSON-LD Organization, Gründer (Person) und Marke (Brand)
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-12, ALT-SEO-13, ALT-SEO-17, ALT-SEO-80, ALT-SEO-82, ALT-SEO-84, ALT-SEO-85, ALT-SEO-86 · app/layout.tsx:90-133 (Organization 90-124, Person 125-133), 134-158 (WebSite; url 137, publisher und isPartOf 141-148), 239-242 (founder im LocalBusiness), 259-266 (Brand); Logo-Konstante 18, 99; @id 95, 127, 136, 161, 173, 261, 269, 327, 385, 443, 500 · Bild: –
- Zustand: geschwächt (+ Gegenstück: NEU-SEO-20, components/site/site-jsonld.ts:36-53: Organization mit name, legalName, url, logo, sameAs, foundingDate, address, contactPoint; es fehlen die Geo-Koordinaten, der Gründer-Knoten (Person) und der Marken-Slogan; Test components/site/__tests__/site-jsonld.test.ts) [Runde 2: Der WebSite-Knoten (components/site/site-jsonld.ts:54-62) trägt url und publisher, kein `isPartOf`; ein Brand-Knoten besteht nicht, denn der Test schließt `Brand` und `SearchAction` aus (Commit 41e1c6c „trimmed global JSON-LD“); logo und url der Organisation bestehen (HTML der Startseite am 2026-10-09 geprüft)]
- Aufgabe: Suchmaschinen verknüpfen Unternehmen, Gründer und Marke zu einer Entität (Wissensgraph).
- Wesenskern: Organization „Bad und Energie GmbH Lahn Dill“ mit Adresse Siegmund-Hiepe-Str. 20, 35578 Wetzlar, Geo 50.56499 / 8.49842, `founder` → Person „Diplomingenieur Sabri Demir“ (jobTitle „Geschäftsführer und Diplomingenieur“, worksFor), Kontaktpunkt „+49-6441-42956“ (recruiting, German); Brand mit Slogan „100 Jahre Meisterbetrieb (1926–2026) für SHK, Wärmepumpen und moderne Badarchitektur in Wetzlar“. Alle Angaben außer Gründer und Slogan stehen weiter im Knoten. Runde 2 (ALT-SEO-80, -82, -84, -85, -86), am Ausgangsstand per GET auf `/` und im Code geprüft: (a) WebSite `#website`: url und publisher (Verweis auf die @id der Organisation) leben; `isPartOf` {@type WebSite · url „https://bad-energie.de“ · name „Bad und Energie GmbH Lahn Dill“} fehlt und kehrt als eingebettetes Objekt zurück (die Beziehung zur Kunden-Website ist belegt, `SITE_CONFIG.consumerUrl`; im Altstand ohne eigene @id). (b) Organization.logo „{APP_URL}/images/bad-energie-lahn-dill-logo.webp“ (ALT-SEO-82) lebt unverändert (`EMPLOYER.logoUrl`; dieselbe Datei im LocalBusiness, E-SEO-009, und im JobPosting, E-SEO-010; fakten-abgleich B19). (c) Gründer-Person: Der Altstand führte sie doppelt, als Knoten `#founder` (ALT-SEO-13, von der Organisation per @id referenziert) und als eingebettetes Objekt im LocalBusiness ohne @id und ohne jobTitle (ALT-SEO-84, nur name „Diplomingenieur Sabri Demir“). Zurück kommt eine einzige Person, eingebettet im Organization-Knoten (`founder`, name „Sabri Demir“ bzw. „Diplomingenieur Sabri Demir“, jobTitle aus `COMPANY.managingDirector`, Titel offen A5); die zweite Person im LocalBusiness ist eine Doppelung und kommt nicht zurück (das LocalBusiness verweist per `parentOrganization` auf die Organisation). (d) Brand `#brand` (ALT-SEO-85): logo „{APP_URL}/images/bad-energie-lahn-dill-logo.webp“ und url „https://bad-energie.de“ sind dieselben Werte wie im Organization-Knoten und leben dort; ein eigener Brand-Knoten kommt nicht zurück (der globale Graph ist bewusst auf Organization, WebSite und LocalBusiness gekürzt, Commit 41e1c6c, der Test schließt `Brand` aus); der Slogan trägt nur bis 2026-12-31 und folgt E-SHELL-001. (e) @id-Adressen der elf Altstand-Knoten (ALT-SEO-86) gegen den Ausgangsstand: Organization „https://bad-energie.de/#organization“ und LocalBusiness „https://bad-energie.de/#localbusiness“ unverändert (Host der Kundenseite; `ORGANIZATION_ID` wird vom JobPosting referenziert); WebSite „…/#website“ unverändert (folgt jetzt APP_URL statt einer festen Adresse); BreadcrumbList „https://karriere.bad-energie.de/#breadcrumb“ → „{Seitenadresse}#breadcrumb“ (E-SEO-008); FAQPage „…/#faq-schema“ → „{APP_URL}/#faq“ (E-SEO-011); die vier Stellen „…/#job-anlagenmechaniker“, „…/#job-kundendienst“, „…/#job-obermonteur“, „…/#job-azubi“ → „{Stellenadresse}#jobposting“ (E-SEO-010); Person „…/#founder“ → eingebettet ohne @id; Brand „…/#brand“ entfällt. Kein Knoten des Graphen verweist auf die geänderten Adressen (Test „resolves every internal @id reference“); bindend sind die Adressen von Organization und LocalBusiness. Runde 3: Die sechs @id der Unterseiten-Knoten (WebPage und BreadcrumbList von /bewerbung, /datenschutz und /impressum, ALT-SEO-100 bis -105) gehören nicht zu diesem Pass; sie stehen in E-SEO-008. Im Altstand folgten sie APP_URL, die feste WebSite-@id dieses Passes nicht (ALT-SEO-106); der Ausgangsstand bildet beide aus derselben Konstante `WEBSITE_ID`.
- Freiraum: Gründer als Verweis im Organization-Knoten (kein eigener Knoten nötig); der Slogan mit Jubiläum läuft Ende 2026 aus (E-SHELL-001). `founder` eingebettet oder als eigener Knoten mit @id (dann ist der Test „nur Organization, WebSite, LocalBusiness“ anzupassen); `isPartOf` darf auch als Verweis auf einen WebSite-Knoten der Kundenseite geschrieben werden.
- Bindungen: Titel des Geschäftsführers offen (fakten-abgleich A5: „Geschäftsführer und Meister“ aus `team.ts` als Standard); `ORGANIZATION_ID` wird von JobPosting referenziert (hiringOrganization). Test components/site/__tests__/site-jsonld.test.ts (nur Organization, WebSite und LocalBusiness im Graph; kein `Brand`, kein `SearchAction`; alle internen @id-Verweise lösen auf); fakten-abgleich B2 (Firmenname) und B19 (Logo-Datei).
- Priorität: Soll – Grund: Ergänzung des Wissensgraphen, kein Rankingfaktor.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: components/site/site-jsonld.ts (Organization um `founder` (eingebettet) und `geo` ergänzen, WebSite um `isPartOf` ergänzen)
- Gestaltung: folgt KERN (P2); vorläufige Idee: entfällt (kein sichtbares Element).
- Abnahme: Test site-jsonld.test.ts um `founder` und `isPartOf` ergänzt und grün (weiter nur drei Knotentypen, kein `Brand`, kein `SearchAction`); JSON-LD der Startseite parsebar; `isPartOf.url` ist „https://bad-energie.de“ · Bildpaar –
- Status: offen
- Unsicherheit: Titel des Gründers (fakten-abgleich A5) und ob die Marke als eigener Knoten gewünscht ist. Ob Suchmaschinen die alten @id der Stellen und der FAQ gespeichert haben, ist nicht prüfbar (@id sind interne Bezeichner, kein Abruf).

### E-SEO-007 · JSON-LD WebSite mit SearchAction und die fehlende Suchfunktion
- Kategorie: Funktion
- Quelle: ALT-SEO-14, ALT-SEO-58, ALT-SEO-81 · app/layout.tsx:134-158 (SearchAction 150-157); app/datenschutz/page.tsx:172-182 · Bild: –
- Zustand: verloren (+ Gegenstück: NEU-SEO-20, WebSite-Knoten ohne `potentialAction`; keine Suche auf der Plattform) [Runde 2: HTML der Startseite am 2026-10-09 geprüft, kein `SearchAction`; der Test site-jsonld.test.ts schließt ihn aus]
- Aufgabe: Der Altstand kündigte Suchmaschinen eine Seitensuche an („Sitelinks-Suchfeld“).
- Wesenskern: WebSite „Bad und Energie GmbH Lahn Dill Karriere“ mit `SearchAction`, `urlTemplate` `…/#stellen?q={search_term_string}`. Es gab nie eine Suche; die Vorlage zeigte auf einen Anker ohne Suchfunktion. (Vermutung) Google hat das Sitelinks-Suchfeld nach eigener Ankündigung 2024 abgeschafft; nicht geprüft. Runde 2 (ALT-SEO-81): Die Aktion bestand aus `target` {@type EntryPoint · urlTemplate „{appUrl}/#stellen?q={search_term_string}“} und dem Eingabefeld „query-input“ „required name=search_term_string“; beides bleibt draußen. Die übrigen Felder des WebSite-Knotens (ALT-SEO-14: url, publisher, isPartOf) sind keine Suchankündigung: url und publisher leben im Ausgangsstand, `isPartOf` kehrt mit E-SEO-006 zurück (ALT-SEO-80).
- Freiraum: –
- Bindungen: keine.
- Priorität: Kann – Grund: Ankündigung einer nicht vorhandenen Funktion.
- Entscheidung: Nicht zurückführen (erfunden/unbelegt)
- Ziel in der Plattform: –
- Gestaltung: folgt KERN (P2); vorläufige Idee: entfällt.
- Abnahme: WebSite-Knoten ohne `SearchAction` · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SEO-008 · JSON-LD je Unterseite (BreadcrumbList, WebPage)
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-15, ALT-SEO-28–33, ALT-SEO-100–106 · app/layout.tsx:159-170; app/datenschutz/layout.tsx:3, 40-75; app/impressum/page.tsx:7, 44-79; app/bewerbung/layout.tsx:3, 40-75 · Bild: –
- Zustand: verschoben, in zwei Teilen entfallen (+ Gegenstück: NEU-SEO-11 (WebPage auf /bewerbung, app/bewerbung/page.tsx:57-69), NEU-SEO-19 (BreadcrumbList auf /jobs und /jobs/<slug>), NEU-SEO-20 (Wurzelgraph mit dem WebSite-Knoten, auf den `isPartOf` zeigt); die noindex-Rechtsseiten tragen keine Seitenknoten mehr; HTML geprüft) [Runde 3: per GET am 2026-10-09 auf http://localhost:3500 und im Code geprüft. `/bewerbung` liefert vor dem Wurzelgraphen (Organization, WebSite, LocalBusiness) einen Seitenblock mit genau einem Knoten WebPage: `@id` „http://localhost:3500/bewerbung#webpage“, `url` „http://localhost:3500/bewerbung“, `isPartOf` {`@id` „http://localhost:3500/#website“}, `inLanguage` „de-DE“, kein `breadcrumb`; keine BreadcrumbList. `/datenschutz` und `/impressum` liefern nur den Wurzelgraphen (drei Knoten), keinen Seitenblock. Der Host ist der APP_URL der Messumgebung]
- Aufgabe: Seitenknoten und Brotkrumen für Suchergebnisse: die Seite benennen, in die Website einordnen und den Pfad zeigen.
- Wesenskern: Altstand (sechs Knoten in drei Seitenblöcken, ALT-SEO-28 bis -33 und -100 bis -105; alle Adressen aus `appUrl` = APP_URL, sonst „https://karriere.bad-energie.de“): Je Seite eine WebPage mit `@id` `${appUrl}/<Seite>/#webpage`, `url` `${appUrl}/<Seite>`, `isPartOf` {`@id` `${appUrl}/#website`}, `breadcrumb` {`@id` `${appUrl}/<Seite>/#breadcrumb`} und `inLanguage` „de-DE“ sowie eine BreadcrumbList mit `@id` `${appUrl}/<Seite>/#breadcrumb` und zwei Einträgen: Position 1 „Karriereportal Wetzlar“ (Bewerbung) bzw. „Karriereportal“ (Datenschutz, Impressum) mit `item` `appUrl`, Position 2 „Bewerbung“, „Datenschutz“ bzw. „Impressum“ mit `item` `${appUrl}/<Seite>`. Namen der WebPage-Knoten: „Bewerbung Handwerk Wetzlar | In 60 Sekunden ohne Lebenslauf bei Bad und Energie“, „Datenschutzerklärung und Bewerberdaten | Bad und Energie Wetzlar“, „Impressum und Kontakt | Bad und Energie GmbH Lahn Dill in Wetzlar“ (Beschreibungen ALT-SEO-28, -30, -32). Hinzu kam im Wurzelgraphen eine BreadcrumbList „Karriereportal“ mit einem Eintrag (ALT-SEO-15); jede Unterseite trug damit zwei BreadcrumbList-Knoten (ALT-SEO-106). Neu: Markup nur dort, wo der Pfad sichtbar ist und die Seite im Index steht (lib/content/breadcrumbs.ts; Commit eecb8fb „one breadcrumb label for the visible trail and BreadcrumbList JSON-LD“): BreadcrumbList „Startseite › Stellen › Kurzname“ auf /jobs/<slug>, „Startseite › Stellen“ auf /jobs, auf /bewerbung die WebPage allein (Titel und Beschreibung neu, E-BEW-029). Runde 3, je Teil gegen den Ausgangsstand: (a) WebPage /bewerbung (ALT-SEO-32, -100) lebt: `@id` `${url}#webpage` (ohne Schrägstrich vor dem Anker; der Altstand schrieb `…/bewerbung/#webpage`, `@id` sind interne Bezeichner, keine Datei und kein Knoten verweist auf die alte Schreibweise), `url` = Canonical (`getCleanCanonicalUrl`), `isPartOf` {`@id` `WEBSITE_ID`}, `inLanguage` „de-DE“; der Verweis `breadcrumb` fehlt, weil es die Liste nicht gibt. (b) BreadcrumbList /bewerbung (ALT-SEO-33, -101) fehlt: Der Fokus-Header (Logo und „Abbrechen“, E-BEW-002) zeigt keinen Pfad, und Markup ohne sichtbaren Pfad widerspricht der Regel des Ausgangsstands; ROADMAP und Commit-Nachrichten nennen für /bewerbung keine Einzelentscheidung (E-BEW-029). (c) Datenschutz und Impressum (ALT-SEO-28 bis -31, -102 bis -105): WebPage und BreadcrumbList sind samt aller sechs Felder entfallen, ausdrücklich zusammen mit der Indexierung (docs/operations/datenschutz-aenderungen.md §1: „Das JSON-LD (WebPage, BreadcrumbList) entfällt auf diesen `noindex`-Seiten.“); auf einer Seite außerhalb des Index hat Markup für Suchergebnisse keine Aufgabe, die Auffindbarkeit nach § 5 DDG hängt an den Fußlinks (E-SEO-003). (d) Querverweise und APP_URL (ALT-SEO-106): Im Altstand traf `isPartOf` den WebSite-Knoten des Wurzelgraphen nur bei gleichem APP_URL (dessen `@id` fest „https://karriere.bad-energie.de/#website“, die Unterseiten-`@id` aus APP_URL). Im Ausgangsstand teilen Wurzelgraph und /bewerbung die Konstante `WEBSITE_ID` (aus `SITE_CONFIG.baseUrl`); der Verweis löst immer auf (gemessen: beide „http://localhost:3500/#website“). Der zweite BreadcrumbList-Knoten im Wurzelgraphen und die uneinheitlichen Namen „Karriereportal“ und „Karriereportal Wetzlar“ entfallen mit den Listen (der Test schließt BreadcrumbList im Wurzelgraphen aus).
- Freiraum: Wortlaut der Namen; Schreibweise der `@id`, solange `isPartOf` auflöst; auf /bewerbung ein sichtbarer Pfad samt Knoten nur, wenn die Gestaltung ihn im Fokus-Header zulässt (offene Frage in E-BEW-029). Eröffnet der Eigentümer die Indexierung der Rechtsseiten wieder (E-SEO-003), kehren WebPage und BreadcrumbList dort mit sichtbarer Brotkrumenleiste und gleichen Labels zurück.
- Bindungen: Regel „Markup entspricht dem sichtbaren Pfad“ (lib/content/breadcrumbs.ts); `WEBSITE_ID` (components/site/site-jsonld.ts:14, 56; app/bewerbung/page.tsx:7, 65); Canonical `getCleanCanonicalUrl('/bewerbung')`; APP_URL (lib/seo/site-config.ts:13; .env.example:9-11); Test components/site/__tests__/site-jsonld.test.ts (Wurzelgraph ohne BreadcrumbList, alle `@id`-Verweise lösen auf); Querverweis E-SEO-006 (WebSite-Knoten) und E-BEW-029 (Metadaten der Bewerbungsseite).
- Priorität: Kann – Grund: Seiten ohne Suchwert (noindex) oder ohne sichtbare Brotkrumen. Der Atlas schlägt für ALT-SEO-100 bis -106 Soll vor; der Pass bleibt Kann, weil die einzige indexierte Unterseite (/bewerbung) ihre WebPage behält, die Brotkrumenliste dort ohne sichtbaren Pfad nicht regelkonform wäre und die Rechtsseiten bewusst aus dem Index genommen sind.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: lib/jobs/jsonld.ts, app/bewerbung/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: /jobs und Stellenseiten enthalten BreadcrumbList; /bewerbung genau einen Seitenknoten WebPage (`@id` mit `#webpage`, `url` = Canonical, `inLanguage` „de-DE“), dessen `isPartOf` auf die `@id` des WebSite-Knotens im Wurzelgraphen zeigt (Test zu ergänzen: beide aus `WEBSITE_ID`); /datenschutz und /impressum tragen nur den Wurzelgraphen (curl) · Bildpaar –
- Status: offen
- Unsicherheit: Ob die BreadcrumbList von /bewerbung bewusst entfallen ist, ist nicht belegt (offene Frage an die SEO-Rolle in E-BEW-029: sichtbarer Pfad im Fokus-Header samt Knoten oder weglassen). Ob die Rechtsseiten dauerhaft aus dem Index bleiben, bestätigt der Eigentümer (E-SEO-003); mit Index kehrten ihre Seitenknoten zurück.

### E-SEO-009 · JSON-LD LocalBusiness (Einsatzgebiet und Öffnungszeiten)
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-16, ALT-SEO-60, ALT-SEO-69, ALT-SEO-70, ALT-SEO-71, ALT-SEO-83 · app/layout.tsx:171-258 (Beschreibung 180-181, Einsatzkreise 202-237; legalName 176, url, logo und image 184-186; Logo-Konstante 18) · Bild: –
- Zustand: geschwächt (+ Gegenstück: NEU-SEO-20, components/site/site-jsonld.ts:63-91: name, legalName, alternateName, parentOrganization, Beschreibung neu („Innungs-Meisterbetrieb seit 1926 für Heiztechnik, Wärmepumpen, moderne Bäder und Haustechnik im Lahn-Dill-Kreis.“, HTML geprüft), url, telephone, email, logo, image, hasMap, address, geo, foundingDate, ein `GeoCircle` (35 000 m) und Öffnungszeiten; es fehlen die drei benannten Einsatzkreise; ihre Ortslisten stehen nur in `SITE_CONFIG.serviceRegions` / `REGION.areas` und erscheinen im Ausgangsstand ausschließlich in `/llms-full.txt` (app/llms-full.txt/route.ts:98))
- Aufgabe: Lokale Suche: Wo arbeitet der Betrieb, wann ist er erreichbar.
- Wesenskern: `areaServed` mit drei `GeoCircle` (Wortlaut ALT-SEO-69 bis -71): (1) „Einsatzgebiet Wetzlar (Firmensitz und Kernzone)“, 15 000 m, Orte Wetzlar, Hermannstein, Nauborn, Garbenheim, Steindorf, Dutenhofen, Münchholzhausen; (2) „Einsatzgebiet Gießen und Umland“, 20 000 m, Orte Gießen, Wettenberg, Heuchelheim, Linden, Pohlheim, Biebertal; (3) „Servicegebiet Lahn Dill Kreis“, 35 000 m, Orte Aßlar, Solms, Braunfels, Ehringshausen, Hüttenberg, Lahnau, Herborn, Dillenburg, Schöffengrund, Beschreibung endet „Maximal 35 km Einsatzradius, keine Montage Fernreisen.“ (zusammen 22 Ortsnamen, alle belegt in `SITE_CONFIG.serviceRegions`). „Hohenahr“ (sichtbare Ortsliste des Altstands) kommt in keinem Kreis vor und kommt auch nicht dazu (B17 offen). LocalBusiness-Beschreibung (ALT-SEO-60, 18 Wörter): „Zertifizierter Fachbetrieb und Innungsmeisterbetrieb seit 1926 für Heiztechnik, regenerative Wärmepumpen, moderne Bäder und Haustechnik im Lahn Dill Kreis.“ Sie lebt gekürzt weiter (ohne „Zertifizierter Fachbetrieb“, ohne „regenerative“); das bleibt so, denn belegt ist nur „Zertifizierter Fachpartner für Wärmepumpen von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann“ (Fakt `heatPumpBrands`). Mittelpunkte des Altstands: Kreis 1 50.5583 / 8.5011, Kreis 2 50.5872 / 8.6755 (gleich Gießen in lib/data/locations.ts), Kreis 3 50.65 / 8.4. Nicht zurückführen: die Mittelpunkte von Kreis 1 und 3 (weder Firmensitz noch Ort der Ortstabelle; Kreis 3 verschiebt den 35-km-Kreis um rund 12 km und widerspricht dem Fakt `radius35`, der vom Firmensitz misst); stattdessen Firmensitz (`COMPANY.geo` 50.56499 / 8.49842) für Kreis 1 und 3, Gießen (`loc-giessen`) für Kreis 2. `openingHoursSpecification` Mo–Do 07:00–16:45, Fr 07:00–13:30; `hasMap` maps.google.com; Alternativnamen „Bad und Energie“, „Bad und Energie Wetzlar“, „Bad und Energie GmbH“. Im Altstand gab es weder `priceRange` noch `knowsAbout` im ausgelieferten JSON-LD (Grep und HTML), `SITE_CONFIG.knowsAbout` liegt ungenutzt; ein `priceRange` wäre erfunden. Runde 2 (ALT-SEO-83): legalName „Bad und Energie GmbH Lahn Dill“, url „https://bad-energie.de“ (Adresse der Kundenseite, nicht der Karriereseite), logo und image (beide „{APP_URL}/images/bad-energie-lahn-dill-logo.webp“, dieselbe Datei) leben unverändert im Knoten (components/site/site-jsonld.ts:63-91; HTML der Startseite am 2026-10-09 geprüft). Die eingebettete Gründer-Person des Altstands im LocalBusiness (ALT-SEO-84) gehört zu E-SEO-006.
- Freiraum: Namen der Kreise nach `SITE_CONFIG.serviceRegions` („Wetzlar Kernstadt und Stadtteile“, „Gießen und Umland“, „Lahn Dill Kreis“); Radien und Ortsnamen aus `REGION.areas`; die Beschreibungstexte der Kreise dürfen kürzer sein, solange alle Orte aus den Daten stammen.
- Bindungen: `SITE_CONFIG.serviceRegions` (15, 20 und 35 km), `REGION.areas` (dieselben Kreise stehen in `/llms-full.txt`: Konsistenz halten); Fakt `radius35`; B17; Öffnungszeiten aus `COMPANY.openingHours`.
- Priorität: Soll – Grund: lokaler Suchwert, belegte Daten vorhanden.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: components/site/site-jsonld.ts (`areaServed` als Liste aus `REGION.areas`)
- Gestaltung: folgt KERN (P2); vorläufige Idee: entfällt (kein sichtbares Element).
- Abnahme: `areaServed` enthält drei Kreise mit Radius, Namen und Ortsnamen aus den Daten, den Radius 35 000 m um den Firmensitz und kein „Hohenahr“; Test site-jsonld.test.ts angepasst · Bildpaar –
- Status: offen
- Unsicherheit: Ob die drei Radien zur heutigen Aussage „35 km um Wetzlar“ passen (15 und 20 km sind Teilkreise; im Altstand bewusst gestaffelt), und ob Orte ohne Eintrag in der sichtbaren Ortstabelle (Münchholzhausen, Heuchelheim, Linden, Pohlheim, Dillenburg, Schöffengrund) im Markup stehen sollen; sie stehen belegt in site-config.ts und llms-full.txt, aber nirgends auf der Seite.

### E-SEO-010 · JSON-LD JobPosting (vier Stellen)
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-18–21, 61–68, 75–79 · app/layout.tsx:267-497 (Beschreibungen 271-272, 329-330, 387-388, 445-446; Benefits 299-306, 357-364, 415-422, 473-479; identifier 273-277, 331-335, 389-393, 447-451; datePosted, validThrough, employmentType 278-280, 336-338, 394-396, 452-454; educationRequirements 291-294, 349-352, 407-410; hiringOrganization 307-312, 365-370, 423-428, 480-485; jobLocation 313-323, 371-381, 429-439, 486-496) · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-SEO-18, NEU-SEO-31; lib/jobs/jsonld.ts, app/jobs/[slug]/page.tsx:116-123; HTML geprüft: Stellenseiten tragen `JobPosting` und `BreadcrumbList`, die Startseite kein `JobPosting`) [Runde 2: Pflichtfelder in lib/jobs/jsonld.ts:78-98, 102, 115-120 und lib/jobs/data/*.ts; alle vier Stellenseiten am 2026-10-09 per GET auf die Felder geprüft]
- Aufgabe: Google for Jobs findet die Stellen mit Gehalt und Gültigkeit.
- Wesenskern: Im Altstand hingen alle vier JobPostings auf jeder Seite (Google erlaubt sie nur auf der Stellenseite): „Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d)“ (EUR 3 600–4 600), „Kundendiensttechniker SHK / Servicemonteur (m/w/d)“ (3 800–4 900), „Obermonteur / Projektleiter SHK & Badsanierung (m/w/d)“ (4 400–5 600), „Auszubildender zum Anlagenmechaniker SHK 2026 (m/w/d)“ (1 050–1 400). Neu: je ein JobPosting auf der eigenen Stellenseite mit `url` = canonical, Gehaltsspanne sichtbar; die Gehaltsspannen stehen jetzt auch auf der Seite (Eigentümer-Entscheidung). Beschreibung und Benefits (Wortlaut ALT-SEO-61 bis -68; 23 Einträge: 6 + 6 + 6 + 5): Im Altstand waren sie in app/layout.tsx von Hand geschrieben; im Ausgangsstand entstehen sie aus der Stellen-Registry: `description` = die sichtbaren Abschnitte der Stellenseite als HTML (Einleitung, „Das erwartet dich“, „Das bringst du mit“, „Das bekommst du“, „Dein Paket“, „Auf einen Blick“; lib/jobs/format.ts:`toHtmlDescription`), `jobBenefits` = Kurzform der Vorteils-Fakten plus Paketzeilen, mit „; “ verbunden (lib/jobs/jsonld.ts:127-128); HTML der vier Stellenseiten (Anlagenmechaniker, Kundendienst, Obermonteur, Ausbildung) am 2026-10-09 geprüft. Alle 23 Altstand-Einträge haben dort eine Entsprechung; bewusst anders gefasst oder nicht übernommen (nur Belegtes): „bezahlt“ in „Freitags ab 13:30 Uhr bezahlt ins Wochenende“ (B10 offen; neu „Freitags ab 13:30 Uhr Feierabend“); „100%“ vor „persönliche Hilti 22V Akku-Flotte“ (Fakt `hilti` ohne Prozentzahl); Anlagenmechaniker „Fester Firmenwagen … & Privatnutzung“ (B7; neu „Fester Transporter mit Sortimo-Regalsystem, Mitnahme nach Hause möglich“); Obermonteur „Eigenes Projektleitungs-Fahrzeug mit Tankkarte“ (neu „Firmenfahrzeug mit 1-%-Privatnutzung“, A2 offen, plus „Tankkarte“); Kundendienst „Firmen-iPad & Smartphone zur freien privaten Nutzung“ (B9; neu „iPad und Smartphone, auch privat“); Ausbildung „ab August 2026“ (B5; neu „nach Absprache“), „100 Jahren Ausbildungstradition“ (belegt ist nur „Meisterbetrieb seit 1926“, nicht eine Ausbildungstradition), „Meisterbegleitung durch Dipl.-Ing. Sabri Demir“ (Titel offen, A5; neu „Lernen von Meistern und Gesellen“) und „garantierter Übernahme“ (lebt als Fakt `takeoverGuarantee`, bis zur Bestätigung nur bei der Ausbildung, A1); Superlative „exklusive Bäder“, „modernstes Werkzeug“, „Spitzenvergütung“ (belegt ist „über Tarif“, Fakt `aboveTariff`). Pflichtfelder (Runde 2, ALT-SEO-75 bis -79), Altstand gegen Ausgangsstand: hiringOrganization (-75) war je Stelle ein eingebettetes Objekt ohne @id {@type Organization · name „Bad & Energie GmbH“ · sameAs [„https://bad-energie.de“] · logo „{appUrl}/images/bad-energie-lahn-dill-logo.webp“}; neu {@type Organization · @id „https://bad-energie.de/#organization“ (Verweis auf den globalen Knoten) · name „Bad und Energie GmbH Lahn Dill“ · sameAs „https://bad-energie.de“ · logo gleiche Datei}; der Firmenname folgt dem rechtlichen Namen (fakten-abgleich B2), der Altstand nannte in JobPosting und Organisation zwei verschiedene Namen. jobLocation (-76): {@type Place · address PostalAddress · „Siegmund-Hiepe-Str. 20“ · „Wetzlar“ · „35578“ · „Hessen“ · „DE“} in allen vier Stellen unverändert, neu aus `job.location` (= `HQ_LOCATION`, lib/jobs/employer.ts). educationRequirements (-77): „professional certificate“ bei Anlagenmechaniker, Kundendienst und Obermonteur, „high school“ bei der Ausbildung, unverändert (zusätzlich die sichtbaren Beschriftungen „Abgeschlossene Ausbildung im SHK-Handwerk“ und „Schulabschluss“ in der Registry). identifier (-78): PropertyValue mit den Werten „SHK-WP-2026-01“, „SHK-KD-2026-02“, „SHK-PL-2026-03“, „SHK-AZ-2026-04“ unverändert; der Name der Kennung war „Bad & Energie GmbH“, ist neu „Bad und Energie GmbH Lahn Dill“ (B2). datePosted „2026-03-01“ und employmentType „FULL_TIME“ (-79) unverändert; validThrough „2027-10-06T00:00:00“ unverändert bei Anlagenmechaniker, Kundendienst und Obermonteur, bei der Ausbildung neu „2026-12-31T23:59:59+01:00“ (bewusst: die Texte nennen „2026“, fakten-abgleich B5, Test registry.test.ts:176), und `employmentType` der Ausbildung neu [„FULL_TIME“, „OTHER“] (ROADMAP §3.2). Für die Stellen 2 bis 4 galten im Altstand dieselben Werte wie für Stelle 1, `unitText` „MONTH“ bleibt. Die Stelle „Quereinsteiger“ (`funnel_only`, SHK-QE-2026-05) trägt kein JobPosting, im Altstand gab es dafür auch keines.
- Freiraum: Texte der Stellen (Paket Stellen); `jobBenefits` darf als Liste statt als „; “-getrennte Zeichenkette ausgegeben werden.
- Bindungen: Registry; e2e/seo.spec.ts (genau ein JobPosting, `url` = canonical); fakten-abgleich Abschnitt C (Gehaltsspannen bestätigen). Tests lib/jobs/__tests__/jsonld.test.ts:21-62 (hiringOrganization, validThrough, educationRequirements) und registry.test.ts:111-113, 176 (Ablauf-Erinnerung 14 Tage vorher, Azubi-validThrough).
- Priorität: Muss – Grund: Seiten und URLs mit Suchwert (Google for Jobs).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: lib/jobs/jsonld.ts, app/jobs/[slug]/page.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Je Stellenseite genau ein JobPosting, Startseite keines; `description` und `jobBenefits` jeder Stelle nennen nur Aussagen aus Registry und Fakten, und jede belegte Aussage der Altstand-Listen (ALT-SEO-61 bis -68) hat eine Entsprechung (Textvergleich im Test) · Bildpaar – Jede der vier Stellenseiten trägt hiringOrganization (@id, name, sameAs, logo), jobLocation (vollständige Anschrift), educationRequirements, identifier (name und value), employmentType, datePosted und validThrough (GET und Test).
- Status: offen
- Unsicherheit: Gehaltsspannen sind aus den Altstand-JobPostings übernommen und vom Eigentümer noch zu bestätigen (fakten-abgleich Abschnitt C). OFFENE FRAGE an das Stellenpaket: „ohne Bereitschaftszwang“ (ALT-SEO-61, Anlagenmechaniker) hat in der Registry dieser Stelle keine Entsprechung; der Fakt `noWeekendOnCall` ist belegt, aber nur beim Kundendienst eingetragen. Der JobPosting der Ausbildung läuft am 2026-12-31 ab (B5); ohne Verlängerung verschwindet er dann aus Seite, Sitemap und Feeds (der Test registry.test.ts meldet den Ablauf 14 Tage vorher).

### E-SEO-011 · JSON-LD FAQPage und die fünf FAQ-Texte
- Kategorie: Inhalt
- Quelle: ALT-SEO-22–27, 72–74 · app/layout.tsx:498-546 (Beschreibung 502-503) · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-SEO-10, components/home/FaqSection.tsx:24; lib/content/faq.ts:19-56; HTML geprüft: FAQPage nur auf `/`)
- Aufgabe: Rich Result mit den häufigsten Fragen; sichtbare FAQ und Markup stimmen überein.
- Wesenskern: Fünf Fragen: „Wie läuft der diskrete Wechsel ab, wenn ich noch bei einem anderen Betrieb angestellt bin?“ · „Brauche ich ein Anschreiben oder einen Lebenslauf für den ersten Kontakt?“ (neu ohne „für den ersten Kontakt“) · „Welche Heizsysteme und Sanitäranlagen montieren wir hauptsächlich?“ (neu „montiert ihr“) · „Darf das Firmenfahrzeug mit nach Hause genommen werden?“ (neu „Darf ich …“) · „Gibt es bei Bad und Energie Fernmontagen oder Wochenendarbeit?“ (neu ohne „bei Bad und Energie“). Antworten in Du-Form; dokumentierte Änderungen: „Absolute Diskretion“ → „Diskretion“; Express-Fragebogen „in zwei Minuten“ → „ein paar kurze Fragen“ (B4); Antwort 5 „jeden Nachmittag“ → „jeden Abend … am Wochenende hast du frei“ (B23); Partner „ELEMENTS, VIGOUR, Kermi und Geberit“ unverändert, „Fußbodenheizungen“ ergänzt (B15). Zwei Abweichungen des Altstands zwischen FAQPage-Markup und sichtbarer FAQ (ALT-SEO-72: Antwort 3 im Markup ohne „Fußbodenheizungen“; ALT-SEO-73: Frage 5 im Markup „… oder Wochenendarbeit?“, sichtbar „… oder Notdienst Zwang?“) sind im Ausgangsstand aufgehoben: Markup und sichtbare FAQ lesen dieselben `FAQ_ITEMS` (`buildFaqPageJsonLd(items)`, components/home/content.ts:118-132; FaqSection.tsx:24); im HTML steht Antwort 3 mit „Fußbodenheizungen“ und Frage 5 als „Gibt es Fernmontagen oder Wochenendarbeit?“ (B16). Der FAQPage-Knoten trug im Altstand außerdem `name` („Häufige Fragen zum Bewerbungsprozess bei Bad und Energie GmbH Lahn Dill“) und `description` (ALT-SEO-74: „Antworten auf die wichtigsten Fragen von Anlagenmechanikern, Kundendienstmonteuren und Auszubildenden zu Diskretion, Bewerbungsprozess, Werkzeug und Arbeitszeiten.“, 16 Wörter); beide fehlen im Ausgangsstand (nur `@id`, `inLanguage`, `mainEntity`). Für das Rich Result sind sie nicht nötig, und „Werkzeug“ trägt keine der fünf Fragen; der Wortlaut kommt nicht zurück.
- Freiraum: Wortlaut, solange sichtbarer Text und Markup übereinstimmen; eine neue `description` des FAQPage-Knotens, abgeleitet aus den sichtbaren Fragen, ist erlaubt.
- Bindungen: Fakten-IDs je Antwort; Regel „FAQPage nur auf `/`“ (ROADMAP §10).
- Priorität: Muss – Grund: Seite mit Suchwert und sichtbarer Inhalt.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: components/home/FaqSection.tsx, lib/content/faq.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: FAQPage enthält fünf Fragen, Wortlaut gleich der sichtbaren FAQ · Bildpaar –
- Status: offen
- Unsicherheit: Aussagen „Smartphone und Tablet … private Nutzung“ (B9) und „Wochenende frei“ (B23) warten auf die Bestätigung des Eigentümers. Die Abweichungen ALT-SEO-72 und -73 sind keine Verluste, sondern Altstand-Fehler (Markup ≠ sichtbarer Text); die Regel „Markup = sichtbarer Text“ gilt weiter.

### E-SEO-012 · robots.txt
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-34–38 · app/robots.ts:9-54 · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-SEO-21, app/robots.ts:11-59; GET: 200 text/plain)
- Aufgabe: Crawler dürfen Seiten lesen, APIs und Scraper bleiben draußen, KI-Dienste dürfen zitieren.
- Wesenskern: Vier Gruppen: Googlebot, Bingbot, DuckDuckBot (Allow `/`, Disallow `/api/`); zwölf KI-Crawler (GPTBot, ChatGPT-User, OAI-SearchBot, Google-Extended, anthropic-ai, ClaudeBot, PerplexityBot, CCBot, Applebot-Extended, Amazonbot, Cohere-ai, YouBot) mit Allow `/`; acht SEO-Scraper (SemrushBot, PetalBot, DotBot, MJ12bot, BLEXBot, DataForSeoBot, MegaIndex, Bytespider) Disallow `/`; Standardgruppe `*`; „Host“ und „Sitemap“. Neu: `Disallow: /admin/` in allen erlaubenden Gruppen; `/danke/` entfällt (existierte nie; die Danke-Seite `/bewerbung/danke` ist noindex), `crawlDelay: 0` entfällt (ohne Wirkung).
- Freiraum: Liste der KI-Crawler nach Eigentümerwunsch.
- Bindungen: noindex-Seiten dürfen nicht gesperrt werden (Crawler müssten das noindex sehen); Sitemap-URL.
- Priorität: Muss – Grund: Suchwert und Zugriffsregeln.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/robots.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: `curl /robots.txt` zeigt vier Gruppen und die Sitemap-Zeile · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SEO-013 · sitemap.xml
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-39–42 · app/sitemap.ts:9-33 · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-SEO-22, app/sitemap.ts:15-32; GET: 200 application/xml, sieben Adressen)
- Aufgabe: Suchmaschinen finden alle indexierbaren Seiten.
- Wesenskern: Alt vier Adressen mit festem Datum (Startseite, `/bewerbung`, `/datenschutz`, `/impressum`). Neu sieben: `/`, `/jobs`, vier Stellenseiten (`lastmod` = `updatedAt`, 2026-10-08), `/bewerbung`; Datenschutz und Impressum entfallen wegen noindex (E-SEO-003); Priorität und Änderungshäufigkeit entfallen (ohne Wirkung).
- Freiraum: –
- Bindungen: Registry (abgelaufene Stellen verlassen die Sitemap nach Revalidierung); e2e/seo.spec.ts:81.
- Priorität: Muss – Grund: Suchwert.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/sitemap.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Sitemap listet alle Stellenseiten und `/bewerbung` · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SEO-014 · llms.txt und llms-full.txt
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-43, ALT-SEO-44, ALT-SEO-87–99 · app/llms.txt/route.ts:4-46; app/llms-full.txt/route.ts:5-64; lib/seo/site-config.ts:21-23; lib/data/services.ts:16-17, 36-37, 55-56, 75-76 · Bild: –
- Zustand: geschwächt (+ Gegenstück: NEU-SEO-23, NEU-SEO-24; app/llms.txt/route.ts, app/llms.txt/content.ts, app/llms-full.txt/route.ts; GET beider Dateien am 2026-10-09: 200 text/plain. Aus Registry und Fakten erzeugt, die Langfassung vollständig; in der Kurzfassung fehlen belegte Aussagen, siehe Wesenskern. Vor Runde 2 stand der Pass auf „verschoben“; die Befunde „ohne Beleg“ zu Vergütung und Hilti-Werkzeug waren falsch)
- Aufgabe: KI-Antwortsysteme erhalten eine kurze und eine ausführliche, belegte Beschreibung des Arbeitgebers; die Kurzfassung ersetzt auch die entfernte Kurzantwort-Box (E-START-047).
- Wesenskern: Alt (ALT-SEO-43, -44): Leitsatz als Blockzitat (-87, 28 Wörter: „Offizielles Karriereportal der Bad und Energie GmbH Lahn Dill – 100 Jahre Meisterbetrieb (1926–2026). Offene Stellenangebote, übertarifliche Vergütung und erstklassige Arbeitsbedingungen für Anlagenmechaniker SHK, Heizungsbauer und Kundendienst in Wetzlar.“), Überblickssatz (-88), Stammdaten (-89 acht Punkte, -93 zwölf Punkte), Arbeitskonditionen (-90 sieben Punkte, -96 acht Punkte), Kernkompetenzen (-94), Stellenbezeichnungen (-95), Wichtigste URLs (-91, -97), Bewerbungsprozess (-98), Zitationshinweise (-92, -99). Neu: aus Registry und Fakten erzeugt: offene Stellen mit Gehaltsspanne, Arbeitgeber (sieben belegte Fakten), Bewerbung und Kontakt, Daten (Feeds, Sitemap), Optional (Impressum, Datenschutz, Kunden-Website), Zitationshinweis; der Wäscheservice entfällt. Abgleich je Zeile am Ausgangsstand: Lebt: -88 (Überblickssatz im Leitsatz „Meisterbetrieb seit 1926 in Wetzlar für Wärmepumpen, Heizung und Bad“); -91 und -97 (Bewerbung, Stellen, Sitemap, Feed, Kunden-Website; Impressum und Datenschutz nur in der Kurzfassung); -92 und -99 (Zitationshinweis, neu mit dem Zusatz, Gehälter und Vorteile nur wie auf der Stellenseite wiederzugeben); -93 (Stammdaten, zusätzlich Handelsregister; Region und Einsatzradius im Abschnitt „Einsatzgebiet“); -95 (Stellen aus der Registry, die Titel stimmen jetzt mit den JobPosting-Titeln überein, anders als im Altstand; Quereinsteiger als „Weitere Einstiegsmöglichkeit“); -96 (Vergütung, unbefristeter Vertrag, Urlaub, Freitag, Fahrzeug, Hilti, Arbeitskleidung und Fernmontage stehen in den Stellentexten der Langfassung); -98 (Abschnitt „Bewerbung und Ablauf“ mit Kennenlernen und Diskretionszusage; die „Schnellabstimmung“ lebt als „Ein kurzes Telefonat auf Augenhöhe“ in der FAQ); -94 (die vier Fachbereiche leben als Inhalt: Wärmepumpen-Marken `heatPumpBrands`, Wartung und öffentliche Liegenschaften `countyPartner`, Ausbildung von 3,5 Jahren in der Stelle, Bäder in der FAQ-Antwort; der Abschnitt „Kernkompetenzen“ als solcher fehlt, die Marketingsätze „Traumbäder“ und „modernster Wärmepumpen“ kommen nicht zurück). Fehlt in der Kurzfassung, belegt und zurückzuführen (-87, -89, -90): „100 Jahre Meisterbetrieb (1926–2026)“ im Leitsatz (nur bis 2026-12-31, Fakt `anniversary100`, abgestimmt mit E-SHELL-001 und E-START-002); „Vergütung deutlich über dem regionalen Handwerkstarif, dazu Urlaubs- und Weihnachtsgeld.“ (`aboveTariff`); „Du bekommst einen unbefristeten Arbeitsvertrag.“ (`permanentContract`); die persönliche Hilti-Ausstattung (`hilti`); die Arbeitskleidung (`workwear`); die Zeile Handwerkskammer und Innung (`COMPANY.hwk`, `COMPANY.innung`; die Langfassung nennt beides). Alle sechs Aussagen sind belegt (facts.ts, nicht `pending`; sichtbar im Altstand in ALT-START-192, -193, -219, -318, -321). Bleibt draußen (unbelegt oder offen): „Wäscheservice“ (B12); „bezahlt“ in „Freitags ab 13:30 Uhr bezahlt ins Wochenende“ (B10); „Eigenes Servicefahrzeug mit Tankkarte zur privaten Nutzung“ als Aussage für alle (B7, B8: Fahrzeug und Tankkarte nur rollenbezogen, sie stehen in den Stellentexten); „ohne Eigenbeteiligung“ beim Hilti-Werkzeug (belegt ist „Kein Leihen, kein Warten“); „erstklassige Arbeitsbedingungen“ und „Spitzen…“ (Superlative ohne Beleg). Titel des Geschäftsführers: „Geschäftsführer und Meister“ als Standard, Altstand „Geschäftsführer und Diplomingenieur“ (A5 offen).
- Freiraum: Gliederung nach llmstxt.org; Reihenfolge; ein Abschnitt „Fachbereiche“ aus den Fakten ist möglich, die Inhalte stehen schon in „Arbeitgeber“ und in den Stellen.
- Bindungen: `FACTS` (pending-Fakten werden übersprungen, `isFactActive` für `anniversary100` mit `validUntil` 2026-12-31), `EMPLOYER_FACT_IDS` (app/llms.txt/content.ts:21-29; beide Dateien lesen `employerFacts`, die Ergänzung erscheint in beiden), Registry, `revalidate = 3600`; fakten-abgleich A5, B7, B8, B10, B12, B24 (Name der Innung).
- Priorität: Soll – Grund: Auffindbarkeit in KI-Antworten, belegte Inhalte; die Lücke ist klein.
- Entscheidung: Verschmelzen (kleine Ergänzung der Kurzfassung aus vorhandenen Fakten)
- Ziel in der Plattform: app/llms.txt/content.ts (`EMPLOYER_FACT_IDS` um `aboveTariff`, `permanentContract`, `hilti`, `workwear` ergänzen); app/llms.txt/route.ts (Leitsatz mit `anniversary100`, solange `isFactActive`; Zeile `COMPANY.hwk`, `COMPANY.innung`); app/llms-full.txt/route.ts unverändert (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert (Textdatei ohne Gestaltung).
- Abnahme: `GET /llms.txt` enthält „Vergütung deutlich über dem regionalen Handwerkstarif, dazu Urlaubs- und Weihnachtsgeld.“, „Du bekommst einen unbefristeten Arbeitsvertrag.“, die Hilti-Zeile und die Zeile Handwerkskammer und Innung, bis 2026-12-31 auch „100 Jahre Meisterbetrieb (1926–2026)“ (Test mit Datum 2027-01-01: nicht mehr); jede Zeile stammt aus einer Fakt-ID; nicht enthalten sind „Wäscheservice“, „bezahlt ins Wochenende“ und „erstklassig“; beide Dateien antworten 200 text/plain und nennen alle live Stellen · Bildpaar –
- Status: offen
- Unsicherheit: Der Innungsname (B24) und der Titel des Geschäftsführers (A5) sind offen. Ob die Kurzfassung bewusst kurz gehalten wurde, ist nicht dokumentiert. Die Langfassung gibt die Ergänzungen in den Stellentexten bereits einmal je Stelle wieder; im Abschnitt „Arbeitgeber“ stehen sie dann zusätzlich.

### E-SEO-015 · IndexNow-Schlüsseldatei `/298d966b7e4f4a43981cb8e30da6b5b5.txt`
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-45 · app/298d966b7e4f4a43981cb8e30da6b5b5.txt/route.ts:5-13; public/298d966b7e4f4a43981cb8e30da6b5b5.txt; lib/seo/indexnow.ts:3 · Bild: –
- Zustand: verschoben (+ Gegenstück: public/298d966b7e4f4a43981cb8e30da6b5b5.txt (im Neuatlas nicht geführt; 33 Byte, Inhalt „298d966b7e4f4a43981cb8e30da6b5b5“ plus Zeilenumbruch); die Route `app/298d….txt/route.ts` ist entfallen; GET: 200 text/plain; `proxy.ts` nimmt `[^/]+\.txt` aus dem Matcher)
- Aufgabe: Bing und andere Suchmaschinen prüfen mit der Datei, dass der Betreiber den Schlüssel besitzt (IndexNow); ohne sie scheitern Einreichungen.
- Wesenskern: Datei unter genau diesem Pfad, Inhalt nur der Schlüssel. Der Altstand trug den Schlüssel als Standardwert im Code; neu kommt er aus der Umgebung (`INDEXNOW_KEY`, lib/env.ts:44).
- Freiraum: Statische Datei statt Route.
- Bindungen: Pfad ist durch bisherige Einreichungen bei Suchmaschinen gebunden; `INDEXNOW_KEY` muss in der Produktion gleich dem Dateiinhalt sein (docs/operations/betrieb.md:92: `INDEXNOW_KEY=298d966b7e4f4a43981cb8e30da6b5b5`).
- Priorität: Muss – Grund: gebundene URL, Voraussetzung für Indexierungsmeldungen.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: public/298d966b7e4f4a43981cb8e30da6b5b5.txt (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: `curl -s http://localhost:3500/298d966b7e4f4a43981cb8e30da6b5b5.txt` liefert 200 und genau den Schlüssel · Bildpaar –
- Status: offen
- Unsicherheit: Ob `INDEXNOW_KEY` und `INDEXNOW_SUBMIT_TOKEN` in der Produktionsumgebung gesetzt sind, ist aus dem Repo nicht ersichtlich (ohne beide antwortet `/api/indexnow` mit 503).

### E-SEO-016 · `/api/indexnow` (Auskunft und Einreichung)
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-46, ALT-SEO-47 · app/api/indexnow/route.ts:6-52 · Bild: –
- Zustand: verschoben (+ Gegenstück: app/api/indexnow/route.ts:31-75; GET antwortet 405 (Altstand: 200 mit Auskunft und `?action=submit`), POST nur mit `Authorization: Bearer <INDEXNOW_SUBMIT_TOKEN>`; Test app/api/indexnow/__tests__/route.test.ts)
- Aufgabe: Neue und geänderte Seiten sofort an IndexNow melden.
- Wesenskern: Einreichung aller Portal-URLs oder einer Liste, Antwort 200 / 502 / 400. Der Altstand erlaubte `GET ?action=submit` ohne Anmeldung (Missbrauchsrisiko) und POST ohne Begrenzung; neu: Token-Pflicht, Host-Prüfung, Größenbegrenzung (ROADMAP §9.4). Die Auskunfts-GET-Antwort (JSON mit Schlüssel und Adressen) entfällt bewusst.
- Freiraum: –
- Bindungen: `INDEXNOW_KEY`, `INDEXNOW_SUBMIT_TOKEN`; Betriebsanleitung docs/operations/betrieb.md.
- Priorität: Kann – Grund: Betriebsfunktion, nicht für Besucher.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/api/indexnow/route.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: GET 405; POST ohne Token 401 oder 503 (nicht aufgerufen, Anfragesperre; Prüfung über die Tests) · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SEO-017 · `/api/maps/config` (Kartenschlüssel nur für die eigene Seite)
- Kategorie: Einbindung Dritter
- Quelle: ALT-SEO-48 · app/api/maps/config/route.ts:3-41; middleware.ts:19-29 · Bild: –
- Zustand: verschoben (+ Gegenstück: app/api/maps/config/route.ts:7-41 und proxy.ts:35-45, `isTrustedSiteRequest` (lib/security/origin.ts); GET ohne Referer: 403 JSON)
- Aufgabe: Der Browser erhält Google-Maps-Schlüssel und Karten-ID erst nach Einwilligung und nur von der eigenen Seite.
- Wesenskern: JSON `apiKey`, `mapId`, `hasKey`; Fehler 403. Der Altstand prüfte den Referer mit `includes('bad-energie.de')` (fälschbar); neu per URL-Parsing in Proxy und Route (ROADMAP §9.4). Der Schlüssel steht systembedingt im Browser; seine Einschränkung in der Google-Cloud ist aus dem Repo nicht prüfbar.
- Freiraum: –
- Bindungen: `GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, Map-ID; Einwilligung E-RECHT-022.
- Priorität: Soll – Grund: Absicherung der Karte, Voraussetzung der Zwei-Klick-Lösung.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/api/maps/config/route.ts, proxy.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: GET ohne Referer 403 (geprüft) · Bildpaar –
- Status: offen
- Unsicherheit: Beschränkung des Schlüssels in der Google-Cloud (HTTP-Referrer, API-Einschränkung) ist nicht prüfbar.

### E-SEO-018 · Formular-Schnittstellen `/api/contact` und `/api/bewerbung`
- Kategorie: Funktion
- Quelle: ALT-SEO-49, ALT-SEO-50 · app/api/contact/route.ts:6-25; app/api/bewerbung/route.ts:34 · Bild: –
- Zustand: verschoben (+ Gegenstück: `/api/contact` bewusst entfernt, Ersatz sind Telefon, WhatsApp, E-Mail und der Bewerbungsflow (GET 404; ROADMAP §9.3, O5 „erledigt“, Kontaktformular LeadQuickForm entfällt); `/api/bewerbung` besteht neu (GET 405, nur POST; app/api/bewerbung/route.ts:1-63) und gehört zum Bewerbungsflow)
- Aufgabe: Anfragen und Bewerbungen serverseitig entgegennehmen.
- Wesenskern: Kontakt-Schnittstelle mit Pflichtfeldern name, email und Einwilligung (`consent`), Honeypot `websiteUrl`; die Bewerbungs-Schnittstelle gehört zum Formularpaket. Das Kontaktformular entfällt bewusst, die Kontaktwege Telefon, WhatsApp und E-Mail bleiben (E-SHELL-005, -006, -007). Formulare wurden nicht abgeschickt (keine POST-Anfragen).
- Freiraum: –
- Bindungen: Beurteilung des Bewerbungsflows im Formularpaket; Datenschutz `#kontakt` nennt kein Kontaktformular mehr.
- Priorität: Muss – Grund: Funktion mit Geschäftswert (Bewerbung); Kontaktformular bewusst entfallen.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: app/api/bewerbung/route.ts, components/site/ContactOptions.tsx (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: `/api/bewerbung` GET 405, `/api/contact` GET 404 (bewusst) · Bildpaar –
- Status: offen
- Unsicherheit: Ob ein allgemeines Kontaktformular (außerhalb der Bewerbung) fehlt, entscheidet der Eigentümer; ROADMAP §5 und §9.3 haben es gestrichen.

### E-SEO-019 · Bot-Filter (Abweisung bekannter Scraper)
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-53 · middleware.ts:4-17, 44-49 · Bild: –
- Zustand: verschoben (+ Gegenstück: proxy.ts:7-33; sieben benannte SEO-Scraper werden mit 403 „Zugriff verweigert.“ abgewiesen; zusätzlich 400 bei kaputter Prozent-Kodierung)
- Aufgabe: Datenschürfer draußen halten, ohne Feeds, Aggregatoren und Prüfbots zu blockieren.
- Wesenskern: Alt 14 Muster inklusive Scrapy, python-requests, aiohttp, Go-http-client, node-fetch, Bytespider und HeadlessChrome; neu nur noch SemrushBot, MJ12bot, DotBot, BLEXBot, DataForSeoBot, PetalBot, MegaIndex; Bytespider, generische HTTP-Clients und HeadlessChrome bewusst offen (Feed-Crawler, Anzeigenprüfung, Playwright, ROADMAP §1).
- Freiraum: Musterliste.
- Bindungen: Messläufe nutzen im Ausgangsstand den Standard-User-Agent; der Altstand (Port 3600) weist HeadlessChrome weiter ab (siehe _gemeinsam-p1.md).
- Priorität: Kann – Grund: Betriebsschutz ohne Besucheraufgabe.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: proxy.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: GET mit User-Agent „SemrushBot“ antwortet 403, normaler User-Agent 200 (nicht aufgerufen) · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SEO-020 · Sicherheitsheader und Cache-Regeln
- Kategorie: Suche und Technik
- Quelle: ALT-SEO-54, ALT-SEO-55 · middleware.ts:31-39; next.config.ts:37-82 · Bild: –
- Zustand: verschoben (+ Gegenstück: next.config.ts:36-82, einzige Quelle; GET `/`: HSTS 63 072 000 s, nosniff, Referrer-Policy, Permissions-Policy `geolocation=()`, COOP, X-Frame-Options, X-DNS-Prefetch-Control, `Content-Security-Policy-Report-Only`, `Reporting-Endpoints`; ohne `X-Subdomain-Role`)
- Aufgabe: Browser-Schutz und schnelle, unveränderliche Auslieferung statischer Dateien.
- Wesenskern: HSTS (alt 31 536 000 s), `Cross-Origin-Opener-Policy: same-origin`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, Permissions-Policy; Cache `public, max-age=31536000, immutable` für Bilder und Schriften. Der Altstand hatte keine CSP und legte mit `X-Subdomain-Role: Shield-Node-Bad-Energie` eine interne Rolle offen; neu: CSP im Report-Only-Modus (scharf ab Phase 3), Meldungen an `/api/csp-report`.
- Freiraum: CSP-Umschaltung (ROADMAP §9.5).
- Bindungen: Datenschutz § „Sicherheitsmeldungen des Browsers“; Google-Maps-Hosts in der CSP.
- Priorität: Soll – Grund: Sicherheit, kein Besucherinhalt.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: next.config.ts (vorhanden)
- Gestaltung: folgt KERN (P2); vorläufige Idee: unverändert.
- Abnahme: Antwortheader von `/` enthalten die genannten Header (geprüft) · Bildpaar –
- Status: offen
- Unsicherheit: keine

### E-SEO-021 · Alte Startseiten-Anker (Anker-Aliase)
- Kategorie: Navigation
- Quelle: Querschnitt ohne eigene Atlaszeile (Bezüge: Anker aus den Altstand-Zeilen SHELL-12 bis -14, -17, -27 und -52 bis -56) · app/page.tsx:306, 316, 548-549, 566, 600, 687, 721, 863, 888, 913 · Bild: –
- Zustand: verloren (+ Gegenstück: Von zwölf alten Startseiten-IDs bestehen drei (`stellen`, `einsatzgebiet`, `faq`); neun fehlen (HTML-Abgleich, Anhang B))
- Aufgabe: Lesezeichen, Verweise aus Anzeigen, Stellenbörsen, Social-Posts und der Kunden-Website, die auf `/#benefits` und Co. zeigen, springen weiter zur passenden Stelle statt nach oben.
- Wesenskern: Zuordnung alt → neu: `#ausstattung` → `#vorteile`; `#benefits` → `#vorteile`; `#wechsel-prozess` → `#ablauf`; `#bewertungen` → `#ueber-uns`; `#gehalt` und `#karriere-paket` → `#stellen` (Gehaltsspannen stehen jetzt in den Stellenkarten und Stellenseiten); `#express-funnel` → `/bewerbung` (Hero-Funnel entfällt); `#kontakt` → Schlussband (`#cta-title`; Abschnitt ohne ID); `#main-content` → `#main`. Deckt auch `/datenschutz#bewerber-datenschutz` → `#bewerberdaten` ab (E-RECHT-008).
- Freiraum: Technik (zusätzliche `id`-Anker an den neuen Abschnitten oder ein kleiner Hash-Abgleich im Client); keine sichtbare Änderung.
- Bindungen: Server kann Hash nicht umleiten (kein 301); alle Anker-IDs müssen eindeutig bleiben; `scroll-behavior: smooth` (app/globals.css:36).
- Priorität: Muss (korrigiert nach E-014; vorher Soll) – Grund: eingehende Links, Fortführung alter URLs (Z-06).
- Entscheidung: Rückführen
- Ziel in der Plattform: components/home/BenefitGrid.tsx, ProcessTimeline.tsx, JobList.tsx, AboutSection.tsx, CtaBand.tsx (zusätzliche `id` oder Alias-Container); alternativ ein kleiner Hash-Abgleich in components/analytics oder im Rahmen
- Gestaltung: folgt KERN (P2); vorläufige Idee: unsichtbare Anker-Aliase, keine Gestaltung.
- Abnahme: Jeder alte Anker aus Anhang B springt zum genannten Ziel (Browserlauf); Eindeutigkeit der IDs · Bildpaar –
- Status: offen
- Unsicherheit: Ob alte Anker-Links extern bekannt sind (Google-Sitelinks, Anzeigen), ist nicht belegt; die Zuordnung `#gehalt` → `#stellen` ist eine Setzung.

## Ohne eigenes Element

Zeilen des Altatlas, die keinen eigenen Pass brauchen. Gründe: „unverändert vorhanden“ (Aufgabe und Inhalt leben im Ausgangsstand ohne Lücke), „reine Dekoration“ (keine eigene Aufgabe), „erfunden“ (vorgetäuscht oder unbelegt, nie zurückführen), „Dublette“, „Vorlagenrest“, „toter Code“ und „keine Aufgabe im Betrieb“ (Technik der entfernten Teile).

| Atlas-ID | Grund |
|---|---|
| ALT-SHELL-01 | unverändert vorhanden: Sprunglink (NEU-SHELL-01, components/ui/SkipLink.tsx); Beschriftung „Zum Inhalt springen“, Ziel `#main` statt `#main-content` |
| ALT-SHELL-09 | reine Dekoration: Einklappen der entfernten Oberleiste beim Scrollen; der Kopf bleibt sticky und zeigt erst beim Scrollen eine Haarlinie (NEU-SHELL-02) |
| ALT-SHELL-10 | unverändert vorhanden: Logo mit Link auf `/`, Raster-WebP, Alt „Bad und Energie GmbH Lahn Dill“ (NEU-SHELL-03); Vektorlogo offen (ROADMAP §13) |
| ALT-SHELL-20 | unverändert vorhanden: Sticky-Kopf, 56 px mobil und 64 px ab lg (NEU-SHELL-02) |
| ALT-SHELL-39 | unverändert vorhanden an anderer Stelle: Adresse steht im Fuß „Betrieb“ (NEU-SHELL-12) und im Impressum |
| ALT-SHELL-41 | reine Dekoration: dunkler Fuß-Hintergrund mit zwei Lichtflecken; heller Fuß ist Entscheidung (ROADMAP §5) |
| ALT-SHELL-60 | unverändert vorhanden: Standort „Siegmund-Hiepe-Str. 20 / 35578 Wetzlar“ im Fuß (NEU-SHELL-12) |
| ALT-SHELL-61 | unverändert vorhanden: Telefon „06441 42956“ im Fuß (NEU-SHELL-12) |
| ALT-SHELL-62 | unverändert vorhanden: Öffnungszeiten im Fuß „Montag bis Donnerstag 07:00–16:45 Uhr / Freitag 07:00–13:30 Uhr“ (NEU-SHELL-12) |
| ALT-SHELL-63 | unverändert vorhanden: E-Mail „info@bad-energie.de“ im Fuß (NEU-SHELL-12) |
| ALT-SHELL-65 | unverändert vorhanden: „© 2026 Bad und Energie GmbH Lahn Dill“ (NEU-SHELL-15); „Alle Rechte vorbehalten.“ entfällt ohne Rechtsfolge |
| ALT-SHELL-67 | unverändert vorhanden: Link „Impressum“ in jedem Fuß, auch im verkürzten (NEU-SHELL-14, -16) |
| ALT-SHELL-68 | unverändert vorhanden: Link „Datenschutz“ (früher „Datenschutzerklärung“) in jedem Fuß (NEU-SHELL-14, -16) |
| ALT-SHELL-80 | reine Dekoration: Ziehen und Einrasten des WhatsApp-Kreises (Haptik, sessionStorage-Schlüssel `bad_energie_whatsapp_pos_v2`, in keiner Tabelle genannt); das Widget entfällt (ROADMAP §5) |
| ALT-SHELL-82 | erfunden: grüner „Ungelesen“-Punkt nach 12 s täuscht eine Nachricht vor |
| ALT-SHELL-124 | keine Aufgabe im Betrieb: verzögertes Laden (`next/dynamic`, `ssr: false`) der entfernten Widgets |
| ALT-SHELL-125 | unverändert vorhanden: `html lang="de"`, Hauptbereich als Sprungziel (`main#main`), sanftes Scrollen (app/globals.css:36); Schrift Plus Jakarta Sans gegen Inter ist Gestaltung (KERN) (NEU-SHELL-22) |
| ALT-SEO-51 | keine Aufgabe im Betrieb: Web-Vitals-Reporter schrieb nur in der Entwicklung in die Konsole, keine Übertragung |
| ALT-SEO-52 | Dublette: Mikrodaten im Logo wiederholten das JSON-LD; bewusst entfernt (ROADMAP §10 „doppelte Microdata entfällt“) |
| ALT-SEO-56 | Vorlagenrest: externe Bildhosts picsum.photos, bad-energie.de, lh3.googleusercontent.com ohne Verwendung; entfernt (ROADMAP §9.8) |
| ALT-SEO-57 | toter Code: ungenutzte SEO-Module; die heutigen Module unter lib/seo/* sind im Einsatz |

## Zuordnungsprüfung

Automatisch geprüft (Skript im Arbeitsverzeichnis, nicht Teil der Lieferung; Stand Runde 3): Jede der 306 Atlaszeilen steht genau einmal in der Spalte „Quelle“ eines Passes oder in der Tabelle „Ohne eigenes Element“; keine Zeile doppelt, keine unbekannte ID.

| Größe | Anzahl |
|---|---|
| Atlaszeilen gesamt (ALT-SHELL 125 · ALT-RECHT 75 · ALT-SEO 106) | 306 |
| zugeordnet zu einem Element-Pass | 285 |
| ohne eigenes Element (Tabelle) | 21 |
| Summe | 306 (muss 306 sein) |
| Element-Pässe | 75 (E-SHELL 29 · E-RECHT 25 · E-SEO 21) |

Je Bereich der Atlaszeilen: ALT-SHELL: 108 in Pässen, 17 ohne eigenes Element · ALT-RECHT: 75 in Pässen, 0 ohne eigenes Element · ALT-SEO: 102 in Pässen, 4 ohne eigenes Element. Runde 1 (ALT-SEO-60 bis -74, 15 Zeilen) steht in E-SEO-009 (60, 69, 70, 71), E-SEO-010 (61 bis 68) und E-SEO-011 (72, 73, 74); es entstand kein neuer Pass. Runde 2 (ALT-SEO-75 bis -99, 25 Zeilen) steht in E-SEO-010 (75 bis 79), E-SEO-006 (80, 82, 84, 85, 86), E-SEO-007 (81), E-SEO-009 (83) und E-SEO-014 (87 bis 99); es entstand kein neuer Pass. Die korrigierten Zeilen ALT-SEO-12, -14, -16, -17, -18 bis -21, -43 und -44 behalten ihren Pass. Runde 3 (ALT-SEO-100 bis -106, 7 Zeilen) steht vollständig in E-SEO-008, zusammen mit den dort schon geführten ALT-SEO-28 bis -33; es entstand kein neuer Pass. Die berichtigten Zeilen ALT-SEO-28 bis -33 (E-SEO-008) und ALT-SEO-86 (E-SEO-006, Querverweis auf E-SEO-008) behalten ihren Pass; Zustand, Priorität und Entscheidung der Pässe sind unverändert.

Verteilung der Pässe: Zustand verloren 10 · geschwächt 14 · verschoben 51 (Runde 2: E-SEO-014 von verschoben auf geschwächt). Priorität Muss 30 · Soll 29 · Kann 16.

Entscheidungen: Rückführen 5 · Verschmelzen 10 · Neu interpretieren 2 · Zurückstellen 4 · Nicht zurückführen (erfunden/unbelegt) 3 · Keine Rückführung nötig (vollständig verschoben) 51.

Zurückgestellt: 4 von 75 Pässen (5.3 %), betrifft 4 von 306 Atlaszeilen (1.3 %). Ziel höchstens 10 %: eingehalten.

Zurückgestellt sind: E-SHELL-017 (Nachweis „Eingetragen in die Handwerksrolle der Handwerkskammer Wiesbaden“); E-SHELL-019 („Ausgezeichneter Ausbildungsbetrieb im Handwerk“); E-SHELL-024 (Nach-oben-Knopf); E-RECHT-005 (Impressum: Verbraucherstreitbeilegung und Universalschlichtungsstelle). Keine gesetzliche Pflichtangabe des Impressums fehlt (Anhang A); die zurückgestellte Verbraucherstreitbeilegung ist eine offene Rechtsfrage, deren vorhandener Wortlaut stehen bleibt.

## Anhang A · Impressum: Pflichtangaben Wort für Wort

Vergleich `app/impressum/page.tsx` (Altstand, wörtlich) gegen das gerenderte HTML von http://localhost:3500/impressum (Ausgangsstand, 2026-10-09). Ergebnis: Keine Pflichtangabe fehlt; Abweichungen sind Schreibweise, Gliederung oder bewusste Rechtsanpassung.

| Pflichtangabe | Altstand wörtlich | Ausgangsstand wörtlich | Befund |
|---|---|---|---|
| Firma und Rechtsform | „Bad und Energie GmbH Lahn Dill“ | „Unternehmen: Bad und Energie GmbH Lahn Dill“ | gleich |
| Anschrift | „Siegmund-Hiepe-Str. 20 / 35578 Wetzlar / Deutschland“ | „Anschrift: Siegmund-Hiepe-Str. 20 / 35578 Wetzlar / Deutschland“ | gleich |
| Vertretung | „Geschäftsführung: Diplomingenieur Sabri Demir“ | „Geschäftsführung: Diplomingenieur Sabri Demir“ | gleich; Titel offen (fakten-abgleich A5) |
| Telefon | „Telefon: 06441 42956“ | „Telefon: 06441 42956“ (tel-Link) | gleich, neu verlinkt |
| Telefax | „Telefax: 06441 48781“ | „Telefax: 06441 48781“ | gleich |
| E-Mail | „E Mail: info@bad-energie.de“ | „E-Mail: info@bad-energie.de“ | Bindestrich ergänzt |
| Website | „Website: https://bad-energie.de“ | „Website: bad-energie.de“ (Link auf https://bad-energie.de) | Anzeige ohne Protokoll |
| Registergericht | „Registergericht: Amtsgericht Wetzlar“ | „Registergericht: Amtsgericht Wetzlar“ | gleich |
| Registernummer | „Registernummer: HRB 2449“ | „Registernummer: HRB 2449“ | gleich |
| USt-IdNr. | „Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: DE 346 648 448“ | „USt-IdNr. gemäß § 27 a UStG: DE 346 648 448“ | Wert gleich; im Repo steht zusätzlich `SITE_CONFIG.vatID` „DE301642296“ (OFFENE FRAGE O1) |
| Inhaltsverantwortlicher | „Verantwortlicher für den Inhalt nach § 18 Abs. 2 MStV: Sabri Demir, Siegmund-Hiepe-Str. 20, 35578 Wetzlar“ | „Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: Sabri Demir, Siegmund-Hiepe-Str. 20, 35578 Wetzlar“ | „Verantwortlicher“ → „Verantwortlich“ |
| Kammer und Aufsichtsbehörde | „Zuständige Handwerkskammer und Aufsichtsbehörde“ · „Handwerkskammer Wiesbaden“ · „Bierstadter Straße 45, 65189 Wiesbaden“ · „Telefon: 0611 1360 • E Mail: info@hwk-wiesbaden.de“ · „Kammerportal öffnen“ (https://www.hwk-wiesbaden.de) | „Zuständige Handwerkskammer und Aufsichtsbehörde“ · „Kammer: Handwerkskammer Wiesbaden“ · „Anschrift: Bierstadter Straße 45, 65189 Wiesbaden“ · „Telefon: 0611 1360“ · „E-Mail: info@hwk-wiesbaden.de“ · „Website: www.hwk-wiesbaden.de“ | gleich; Knopf wurde Link |
| Berufsbezeichnung und verleihender Staat | „Berufsbezeichnung: Meisterbetrieb des SHK Handwerks, Installateur und Heizungsbauer, verliehen in der Bundesrepublik Deutschland. Berufsrechtliche Regelungen: Handwerksordnung HwO.“ | „Berufsbezeichnung: Meisterbetrieb des SHK-Handwerks, Installateur und Heizungsbauer, verliehen in der Bundesrepublik Deutschland. Berufsrechtliche Regelungen: Handwerksordnung (HwO).“ | gleich bis auf Bindestrich und Klammern |
| Streitbeilegung | „Die Europäische Kommission stellt eine Plattform zur Online Streitbeilegung OS bereit, die Sie unter https://consumer-redress.ec.europa.eu/site-relocation_en finden. Wir sind grundsätzlich bereit, an Streitbeilegungsverfahren vor einer anerkannten Verbraucherschlichtungsstelle teilzunehmen.“ | „Wir sind grundsätzlich bereit, an Streitbeilegungsverfahren vor einer anerkannten Verbraucherschlichtungsstelle teilzunehmen.“ | OS-Satz bewusst entfernt (Plattform seit Juli 2025 eingestellt, laut Repo-Dokumentation); Bestätigung und § 36 VSBG offen (E-RECHT-005) |
| Haftung | „… gemäß § 7 Abs.1 TMG … Nach §§ 8 bis 10 TMG …“ | „… gemäß § 7 Abs. 1 DDG … Nach §§ 8 bis 10 DDG …“ | TMG → DDG (Rechtsprüfung offen) |
| Kicker | „Gesetzliche Offenlegung nach Paragraph 5 DDG und Handwerksordnung“ | Lead „Angaben nach § 5 DDG und Handwerksordnung für die Bad und Energie GmbH Lahn Dill.“ | sinngleich |

## Anhang B · Alte URLs und Anker (Z-06)

Messung: `curl -s -o /dev/null -w '%{http_code} %{redirect_url}'` (GET, ohne Weiterleitungen zu folgen) gegen http://localhost:3500 am 2026-10-09; Anker über das Vorhandensein der `id` im gerenderten HTML (Startseite und Datenschutz, beide Stände). Status „fehlt“ bedeutet: Das Ziel antwortet nicht mit 200 oder 3xx auf diese Adresse oder der Anker besteht nicht.

### B1 · URLs

| Alte URL (Altstand, Status dort) | Ziel im Ausgangsstand | Status | Befund und Maßnahme |
|---|---|---|---|
| `/` (200) | `/` | 200 | unverändert |
| `/bewerbung` (200) | `/bewerbung` | 200 | unverändert; Titel neu (E-SEO-002) |
| `/bewerbung?tab=quiz` (200) | `/bewerbung` (Flow) | 200 | Parameter ohne Wirkung, kein Redirect (Absicht, `lib/apply/params.ts`) |
| `/bewerbung?tab=vault` (200) | `/bewerbung` (Flow) | 200 | wie oben |
| `/bewerbung?tab=form` (200) | `/bewerbung` (Flow) | 200 | wie oben |
| `/bewerbung?tab=direct` und `?direct=true` (200) | `/bewerbung` (Flow) | 200 | wie oben |
| `/bewerbung?tab=dossier` (200) | `/bewerbung/mappe` | 308 | Weiterleitung auf die Bewerbungsmappe, UTM und `ref` bleiben erhalten |
| `/datenschutz` (200, indexierbar) | `/datenschutz` | 200 | jetzt noindex (E-SEO-003) |
| `/impressum` (200, indexierbar) | `/impressum` | 200 | jetzt noindex (E-SEO-003) |
| `/robots.txt` (200) | `/robots.txt` | 200 | Regeln gleich bis auf `/admin/`, `/danke/` (E-SEO-012) |
| `/sitemap.xml` (200) | `/sitemap.xml` | 200 | sieben statt vier Adressen (E-SEO-013) |
| `/llms.txt` (200) | `/llms.txt` | 200 | Inhalt neu aus Registry (E-SEO-014) |
| `/llms-full.txt` (200) | `/llms-full.txt` | 200 | Inhalt neu aus Registry (E-SEO-014) |
| `/298d966b7e4f4a43981cb8e30da6b5b5.txt` (200) | `/298d966b7e4f4a43981cb8e30da6b5b5.txt` | 200 | statische Datei, Inhalt Schlüssel, 33 Byte (E-SEO-015) |
| `/api/indexnow` GET (200, Auskunft; `?action=submit` reichte ein, nicht aufgerufen) | `/api/indexnow` | fehlt (405 für GET) | GET entfernt, POST nur mit Bearer-Token (E-SEO-016); die Einreichung per GET gibt es nicht mehr |
| `/api/maps/config` GET ohne Referer (403) | `/api/maps/config` | 403 | gleiche Wirkung, JSON-Antwort (E-SEO-017) |
| `/api/contact` POST (405 bei GET) | – | fehlt (404) | Kontaktformular entfällt bewusst (E-SEO-018) |
| `/api/bewerbung` POST (405 bei GET) | `/api/bewerbung` | 405 | nur POST, besteht (E-SEO-018) |
| `/danke` (404) | `/bewerbung/danke` (neue Danke-Seite, 200, noindex) | fehlt (404, wie im Altstand) | die Altadresse existierte nie als Seite; robots-Sperre `/danke/` entfällt |
| `/admin/` (308 auf `/admin`, dort 404) | `/admin` (404) | 308, dann 404 | wie im Altstand; Cockpit erst Phase 2 |
| `/favicon.ico` | `/favicon.ico` | 200 | unverändert |
| `/icon-192.png` | `/icon-192.png` | 200 | unverändert |
| `/images/bad-energie-lahn-dill-logo.webp`, `…@2x.webp`, `….svg` | gleiche Pfade | 200 | unverändert vorhanden |
| `/images/bad-energie-lahn-dill-logo-transparent.{webp,png,svg}` | gleiche Pfade | 200 | unverändert vorhanden |
| `/images/bad-energie-lahn-dill-logo-white-transparent.{webp,png,svg}` | gleiche Pfade | 200 | unverändert vorhanden |
| `/gibt-es-nicht-404` (404) | 404-Seite | 404 | gleicher Status, neue Seite (E-SHELL-025 bis -027) |
| Adressen mit Schrägstrich am Ende: `/impressum/`, `/datenschutz/`, `/bewerbung/` | ohne Schrägstrich | 308 | Next.js-Standard |
| Neu im Ausgangsstand ohne Altentsprechung: `/jobs`, `/jobs/<slug>` (vier), `/bewerbung/mappe`, `/bewerbung/danke`, `/feeds/*.{xml,json}`, `/opengraph-image` | – | 200 | nicht Teil von Z-06 |

### B2 · Anker auf der Startseite `/`

| Alter Anker (Altstand) | Besteht im Ausgangsstand | Vorgeschlagenes Ziel | Status |
|---|---|---|---|
| `#stellen` | ja | `#stellen` | 200 (Anker vorhanden) |
| `#einsatzgebiet` | ja | `#einsatzgebiet` | 200 (Anker vorhanden) |
| `#faq` | ja | `#faq` | 200 (Anker vorhanden) |
| `#ausstattung` | nein | `#vorteile` | fehlt |
| `#benefits` | nein | `#vorteile` | fehlt |
| `#wechsel-prozess` | nein | `#ablauf` | fehlt |
| `#express-funnel` | nein | `/bewerbung` (Hero-Funnel entfällt) | fehlt |
| `#gehalt` | nein | `#stellen` (Gehaltsspannen stehen in Stellenkarten) | fehlt |
| `#karriere-paket` | nein | `#stellen` | fehlt |
| `#bewertungen` | nein | `#ueber-uns` (Stimmen) | fehlt |
| `#kontakt` | nein | Schlussband (`#cta-title`, Abschnitt ohne ID) | fehlt |
| `#main-content` (Sprungziel auf allen Seiten) | nein | `#main` | fehlt (nur interner Sprunglink) |

Maßnahme: E-SEO-021 (Rückführen).

### B3 · Anker auf `/datenschutz`

| Alter Anker (Altstand) | Besteht im Ausgangsstand | Ziel | Status |
|---|---|---|---|
| `#verantwortlicher` | ja | `#verantwortlicher` | 200 (Anker vorhanden) |
| `#rechtsgrundlagen` | ja | `#rechtsgrundlagen` | 200 (Anker vorhanden) |
| `#datenerfassung` | ja | `#datenerfassung` | 200 (Anker vorhanden) |
| `#bewerberdaten` | ja | `#bewerberdaten` | 200 (Anker vorhanden) |
| `#cookies-analyse` | ja | `#cookies-analyse` | 200 (Anker vorhanden) |
| `#betroffenenrechte` | ja | `#betroffenenrechte` | 200 (Anker vorhanden) |
| `#aufsichtsbehoerde` | ja | `#aufsichtsbehoerde` | 200 (Anker vorhanden) |
| `#bewerber-datenschutz` (Link im Altstand-Fuß, ID existierte nie) | nein | `#bewerberdaten` | fehlt (auch im Altstand); Maßnahme E-RECHT-008 und E-SEO-021 |

### B4 · Anker auf `/impressum`, `/bewerbung`, 404

Der Altstand setzt dort keine eigenen Anker außer `#main-content`. Neu bestehen auf `/impressum` die Anker `#anbieter`, `#kontakt`, `#register`, `#verantwortlich`, `#kammer`, `#streitbeilegung`, `#haftung` und auf `/bewerbung` `#bewerbung-kontakt`; sie sind Zugewinn, keine Fortführung.
