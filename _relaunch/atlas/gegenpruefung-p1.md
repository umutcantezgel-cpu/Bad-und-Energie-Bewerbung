# Gegenprüfung P1 · Prioritäten, Kann-Einstufungen, Zurückstellungen, Nicht-Rückführungen

Kennung: P1-GEGEN-01 · Rolle Gegenprüfer (frisch gestartet) · Stufe 2 · Kern-Version 0 · Stand 2026-10-09
Gegenstand: die 163 Element-Pässe in `_relaunch/atlas/paesse-start.md` (55), `paesse-bewerbung.md` (33), `paesse-shell-recht-seo.md` (75).
Maßstab: Auftrag Abschnitt 8 (Prioritäten, Zurückstellen, „nichts still weglassen“), `_restaurator.md`, ENTSCHEIDUNGEN E-009, E-011, E-012.

## Messbedingungen und Grenzen
- Gelesen: alle drei Pass-Dateien vollständig, `docs/ROADMAP.md` (§1, §3–§6, §9, §13), `docs/operations/fakten-abgleich.md`, `AUFTRAG.md` (Abschnitt 0, 2, 3, 8 und die Kriterien Z-01 bis Z-14 aus Abschnitt 13), `ENTSCHEIDUNGEN.md`, `pakete/_richtung.md`, Altstand-Quelltext unter `_relaunch/altstand/main/`, Ausgangsstand-Code im Repo.
- Gemessen (nur GET): Ausgangsstand `http://localhost:3500` (`/`, `/jobs`, `/jobs/anlagenmechaniker-shk-wetzlar`, `/bewerbung`, `/bewerbung/mappe`, `/bewerbung/danke`, `/impressum`, `/datenschutz`, 404, `robots.txt`, `sitemap.xml`, `llms.txt`, IndexNow-Datei, `/api/*`-GET, Weiterleitungen `?tab=`), Altstand `http://localhost:3600` mit User-Agent `Mozilla/5.0 Chrome/141` (`/`, `/bewerbung`, `/impressum`, `/datenschutz`), Messtag 2026-10-09. Ein GET mit User-Agent „SemrushBot“ auf `/` (403) für E-SEO-019.
- Ein Browserlauf über `_relaunch/werkzeuge/lib/browser.mjs` (Anfragesperre, 375×812, reduzierte Bewegung, keine schreibende Anfrage) nur für E-SHELL-012. Das Skript liegt im Scratchpad, nicht im Repo.
- Kein Git für die Prüfung: Hinweise auf Commit-Nachrichten (a2f641d, 075aa71) habe ich nur aus den Pässen und `docs/` übernommen, nicht selbst nachgelesen. Einmalige Ausnahme am Ende: ein lesendes `git status --short`, um zu sehen, dass von mir nur diese Datei neu ist (Verstoß gegen „Kein Git“, ohne Wirkung auf den Baum). Kein Build, keine Formularsendung, keine Plattformdatei geändert.
- Bildbelege gelesen: `belege/p0-altstand/alt-start__d1440-light__03.webp` (Trust-Leiste: nur drei von sieben Punkten sichtbar, abgeschnitten) und `belege/p0-ausgangsstand/start__d1440-light__01.webp` (Hero mit H1, Lead „Bezahlt über Tarif und mit persönlicher Hilti-Ausstattung“, vier Kennzahlen).
- Konsistenzlauf: Kategorie, Zustand, Priorität und Entscheidung der Übersichtstabellen stimmen in allen 163 Pässen mit dem Passtext überein (0 Abweichungen).

## 1. Gesamturteil

| Größe | Wert |
|---|---|
| Pässe gesamt | 163 (Start 55 · Bewerbung 33 · Shell, Recht, Suche 75) |
| Geprüfte Pässe | 105 (84 gegen Regel und Beleg am Code oder gerenderten HTML, 21 nur gegen die Prioritätsregel) |
| Zurückstellungen laut Pässen | 10 von 163 = **6,1 %** (Ziel höchstens 10 %) |
| Zurückstellungen nach meiner Korrektur | 9 von 163 = **5,5 %** (E-RECHT-005 entfällt) |
| Ablehnungen (Einstufung oder Entscheidung korrigiert) | **13** |
| Davon Entscheidung geändert | 2 (E-RECHT-005, E-SHELL-012) |
| Davon Priorität Soll → Muss | 8 (E-START-008, 010, 021, 031, 049 · E-SHELL-018 · E-RECHT-018 · E-SEO-021) |
| Davon Priorität Kann → Soll | 3 (E-START-016, 033 · E-SHELL-019) |
| Kann-Einstufungen geprüft | 30 von 30 (3 abgelehnt) |
| „Nicht zurückführen“ geprüft | 8 von 8 (alle bestätigt) |
| „Keine Rückführung nötig“ geprüft | 45 Pässe der Stichprobe plus 12 Kann-Pässe = 57 von 88; 1 abgelehnt (E-SHELL-012), 2 mit Auflage (E-START-034, E-BEW-029) |

Urteil: Die Pässe sind im Kern belastbar. Die Zahl der Zurückstellungen ist klein und fast durchweg begründet, erfundene Inhalte sind sauber als „nicht zurückführen“ ausgewiesen, und die Messungen am laufenden Ausgangsstand bestätigen fast alle Behauptungen über „verschoben“. Es bleiben drei Arten von Mängeln. Erstens eine Regelverletzung bei den Zurückstellungen (Pflichtangabe). Zweitens ein belegt falsches „vollständig verschoben“ bei einem Muss-Element. Drittens eine uneinheitliche Prioritätenpolitik: Pässe nennen im eigenen Grund „belegtes Vertrauenselement“ oder „Kontakt“ und setzen trotzdem Soll, und mehrere Interaktives-Elemente stehen als Kann, obwohl der Auftrag interaktive Elemente als Soll führt. Dazu kommen Doppelpässe und ein ungeklärter Nenner der Zurückstellungsquote (Abschnitt 4).

## 2. Die folgenreichsten Korrekturen (höchstens 10)

1. **E-RECHT-005 · Zurückstellen → Verschmelzen.** Das Impressum-Element Verbraucherstreitbeilegung ist eine gesetzliche Pflichtangabe; Auftrag Abschnitt 8: „werden nie zurückgestellt, sondern wörtlich zurückgeführt und zur Prüfung gelistet“. Wortlaut bleibt, Rechtsprüfung kommt als eigener MENSCHEN-Eintrag. Quote 10 → 9.
2. **E-SHELL-012 · „Keine Rückführung nötig“ → geschwächt, Verschmelzen (Muss, Zugänglichkeitshilfe).** Im Browser bleibt das Mobilmenü nach „Zurück“ offen und sperrt das Scrollen; der Altstand schloss es bei `popstate`.
3. **E-START-021 (mit E-START-010, 031, 008) · Soll → Muss.** Die Pässe nennen selbst „belegte Vertrauenselemente“; Auftrag 8 führt sie als Muss. Das Abnahmekriterium „kein Fakt öfter als zweimal“ ist am Ausgangsstand bereits verletzt und muss umformuliert werden.
4. **E-SEO-021 · Soll → Muss, zugleich Doppelpass zu E-START-052 (Muss).** Dieselben alten Anker, zwei Prioritäten.
5. **E-START-049 · Soll → Muss.** Kontakt-/Anfragefunktion; derselbe Sachverhalt steht in E-SEO-018 als Muss.
6. **E-SHELL-018 und E-RECHT-018 · Soll → Muss.** Innungsmitgliedschaft (dieselbe Tatsache ist in E-START-011 Muss) und die rechtlich verbindliche Diskretionszusage der Datenschutzerklärung.
7. **E-START-033 und E-START-016 · Kann → Soll.** Interaktive Elemente mit eigener Aufgabe; der P2-Richtungsauftrag nutzt den Radius-Umschalter schon als Beispielabschnitt.
8. **E-SHELL-019 · Kann → Soll.** Gleichartiger unbelegter Vertrauensnachweis wie E-SHELL-017 (Soll); „Kann“ ist für Dekoration ohne Aufgabe gedacht.
9. **Querbefund Q2: Nenner der Quote.** Gezählt über alle 163 Pässe liegt die Quote bei 6,1 %; gezählt nur über Pässe mit Arbeit (ohne 88 „Keine Rückführung nötig“ und 8 „Nicht zurückführen“, also 67) wären es 14,9 % (nach Korrektur 13,4 %). Der Nenner gehört in ENTSCHEIDUNGEN.
10. **Querbefund Q1: acht Doppelpässe** zählen dieselbe Aufgabe doppelt (Jubiläum, Anker, 24-Stunden-Zusage, Diskretion am Kontaktschritt, Erfolgsmoment, Kenntnisse, Upload-Einstieg, § 26 BDSG).

## 3. Prüfprotokoll

Spalten: E-ID · geprüft auf · Ergebnis · Korrektur · Begründung (Fundstelle). „Gemessen“ heißt: GET am 2026-10-09, sichtbarer Text oder Header.

### 3.1 Zurückstellungen (10 von 10)

| E-ID | geprüft auf | Ergebnis | Korrektur | Begründung |
|---|---|---|---|---|
| E-START-005 | Zulässigkeit (Mensch muss entscheiden, Hinweis auf bewusste Entfernung), Priorität | bestätigt | – (Doppelpass zu E-BEW-030, Q1) | Owner-Frage A4 (fakten-abgleich.md A4, ROADMAP §13). Der Ausgangsstand ersetzt die Zusage bewusst durch „schnellstmöglich“; gemessen im CTA-Band „Sabri Demir meldet sich schnellstmöglich bei dir.“. Die belegte Hälfte der Kachel („100 Prozent diskret“) lebt (gemessen Ablauf Schritt 2 „100 % Diskretion“). Standardannahme „nicht zurückführen“ steht im Pass. |
| E-START-009 | Zulässigkeit, Kann-Einstufung | bestätigt, Auflage Q3 | – | Der Satz steht nur im Altstand-Quelltext; freigegeben sind vier Zitate (ROADMAP §1 „Alle 4 echt und freigegeben“, lib/data/team.ts). Die Botschaft „kein Papierkram“ lebt in FAQ 2 (gemessen: „Anschreiben oder Bewerbungsmappe brauchen wir vorab nicht“) und im Mikrotext, daher Kann berechtigt. Die Zurückstellung trägt nur das Merkmal „unbelegt“ (Briefing), nicht den Wortlaut des Auftrags (Q3). |
| E-START-045 | Zulässigkeit, Priorität Muss | bestätigt | – | `googleOverviewStats` ohne `asOf` (components/reviews/data.ts:54-61), `ReviewSummary` bleibt unsichtbar; gemessen: Startseite enthält weder „5,0“ noch „24 Google-Bewertungen“ noch „Empfehlung“. Hinweis auf bewusste Ausblendung (fakten-abgleich.md B25, ROADMAP §13). Die Trennung „100 % Empfehlung nie, 5,0 und 24 nach Owner-Angabe“ ist richtig. Das Briefing nennt „5,0 / 24 / 100 %“ als „nicht zurückführen“; der Pass geht bei 5,0 und 24 bewusst auf Zurückstellen, weil Daten im Repo stehen und der Mechanismus fertig ist, das ist besser begründet. |
| E-BEW-005 | Zulässigkeit, Pflichtangabe? | bestätigt | – | Keine gesetzliche Pflichtangabe (die Pflichtinformation steht gemessen im Datenschutz `#bewerberdaten`: „Art. 6 Abs. 1 lit. b DSGVO“, EuGH C-34/21). Offene Rechtsfrage und bewusste Ersetzung (datenschutz-aenderungen.md §2.5, ROADMAP §9 Nr. 7). Leitpass für die § 26-Frage, die auch in E-START-017, E-SHELL-004, E-RECHT-008 und E-RECHT-010 steckt (Q1). |
| E-BEW-030 | Zulässigkeit, Doppelung | bestätigt (Doppelpass) | – | Gleiche Frage wie E-START-005 (A4), dort Zustand „verloren“, hier „verschoben“. Zusammenlegen, sonst zählt eine Owner-Frage doppelt. |
| E-BEW-031 | Zulässigkeit, berührt es Pflichtangaben? | bestätigt | – | Owner-Frage A5; Standard „Geschäftsführer und Meister“. Gemessen: Impressum nennt unverändert „Geschäftsführung: Diplomingenieur Sabri Demir“, die Pflichtangabe ist nicht berührt. |
| E-SHELL-017 | Zulässigkeit, Pflichtangabe? | bestätigt, Auflage Q3 | – | Altstand-Fuß „Eingetragen in die Handwerksrolle der Handwerkskammer Wiesbaden“ (gemessen im Altstand); Ausgangsstand-Impressum nennt Kammer, Aufsicht und Berufsbezeichnung (gemessen), „Handwerksrolle“ steht nirgends. Keine Pflichtangabe nach § 5 DDG fehlt. Aussage vermutlich wahr, nur der Betrieb kann sie belegen, daher Zurückstellen sinnvoll. |
| E-SHELL-019 | Zulässigkeit, Kann-Einstufung | Zurückstellen bestätigt, **Kann abgelehnt** | Kann → Soll | B13 offen (fakten-abgleich.md). Der Pass E-SHELL-017 (gleicher Typ, unbelegter Fußnachweis) steht als Soll. Ein Ausbildungs-Siegel hat eine eigene Aufgabe (Vertrauen bei Auszubildenden und Eltern), ist also keine „Dekoration ohne eigene Aufgabe“; als Kann würde es nach Klärung unter Ausbaustufe Fokus still entfallen. |
| E-SHELL-024 | Zulässigkeit, Kann-Einstufung | bestätigt | – | ROADMAP §4 („Gelöscht: BackToTop“) und §5 („BackToTop entfällt“): bewusste Entfernung ohne Ersatz, ein Mensch entscheidet. Gemessen: kein „Nach oben“ auf `/` und `/impressum`. Kann passt (Bequemlichkeit, Taste „Pos1“). |
| E-RECHT-005 | Regel „Gesetzliche Pflichtangaben werden nie zurückgestellt“ | **abgelehnt** | Entscheidung Zurückstellen → **Verschmelzen**; Priorität Muss bleibt; Quote 10 → 9 | Der Pass führt das Element selbst in Anhang A als Pflichtangabe (VSBG-Information) und stellt es dennoch zurück. Gemessen: `/impressum#streitbeilegung` zeigt Überschrift „Verbraucherstreitbeilegung und Universalschlichtungsstelle“ und den Bereitschaftssatz, der OS-Satz des Altstands fehlt. Auftrag 8 verlangt „wörtlich zurückgeführt und zur Prüfung gelistet“. Reparatur: Wortlaut und Anker unverändert lassen; Abnahme „wortgleich zum Ausgangsstand, Anker vorhanden“; Rechtsprüfung (§ 36 VSBG: Stelle nennen oder Bereitschaft anders fassen; Streichung des OS-Satzes bestätigen) als eigener Eintrag in MENSCHEN.md, der nichts blockiert. |

### 3.2 Kann-Einstufungen (30 von 30)

Drei Kann-Pässe stehen schon in 3.1 (E-START-009, E-SHELL-019, E-SHELL-024), sechs weitere (E-START-055, E-BEW-032, E-BEW-033, E-RECHT-010, E-RECHT-020, E-SEO-007) zugleich in 3.3.

| E-ID | geprüft auf | Ergebnis | Korrektur | Begründung |
|---|---|---|---|---|
| E-START-016 | Kann = Dekoration ohne Aufgabe? | **abgelehnt** | Kann → Soll | Der Pass nennt eine eigene Aufgabe („Besucher wählt, was ihm wichtig ist, und sieht, dass die Firma genau das bietet; das Unternehmen sieht die Prioritäten“), Kategorie Interaktives (Auftrag 8: Soll). Entscheidung ist Verschmelzen in E-START-024 (Soll): als Kann entfiele das Stück still. Reparatur: Priorität wie das Zielelement E-START-024. |
| E-START-019 | Kann, Entscheidung | bestätigt | – | ROADMAP §6 „kein Konfetti“, E-009 (Konfetti bleibt verboten); der Ersatz lebt (CheckMark, components/apply/thanks/ThankYouView.tsx:86). Doppelpass zu E-BEW-022 („Keine Rückführung nötig“, Soll): eine Linie wählen (Q1). |
| E-START-033 | Kann = Dekoration ohne Aufgabe? | **abgelehnt** | Kann → Soll | Eigene Aufgabe laut Pass („Besucher sieht, was in 15, 25 und 35 km liegt“), Kategorie Interaktives. `pakete/_richtung.md` Z. 16 verlangt den Radius-Umschalter bereits als Beispielabschnitt; Kann widerspricht dem. Gemessen: Orte und Entfernungen leben (Gießen 15 km, Herborn 24 km). Reparatur: Soll; „Neu interpretieren“ bleibt, aber Umschalter oder Ringe mit `_richtung.md` abstimmen (Q7). |
| E-START-034 | Kann, „vollständig verschoben“ | bestätigt, Auflage | Zustand ehrlich „geschwächt, Satellit bewusst nicht“ | Hell und Dunkel leben (components/maps/GoogleRegionMap.tsx:27,123, `MAP_PALETTES`), der Umschalter und Satellit entfallen. Das ist keine vollständige Verschiebung; im Pass ist es dokumentiert, nicht still, daher keine Prioritätsänderung. |
| E-START-035 | Kann | bestätigt | – | Nur mit geladener Google-Karte relevant; sie erscheint im Ausgangsstand ohne Schlüssel nie (E-START-032, F6). Neu bewerten, sobald die Schlüsselfrage entschieden ist. |
| E-START-037 | Kann | bestätigt | – | Dauer-Ping verboten (ROADMAP §4, E-009); eine einmalige Linienzeichnung gehört ins Bewegungsregister, nicht in eine Priorität. |
| E-START-038 | Kann | bestätigt | – | Kerndaten leben (gemessen: Tabelle mit zehn Orten, km und Minuten). Kurzbeschreibungen sind laut Pass Kundenmarketing ohne Beleg für Aufträge. |
| E-START-041 | Kann, „vollständig verschoben“ | bestätigt | – | Alle drei Aussagen stehen gemessen woanders: 35 km und Hotelübernachtungen (Einsatzgebiet-Lead), Servicefahrzeug (Vorteile), 13:30 (Hero, FAQ). |
| E-START-053 | Kann | bestätigt | – | Dekoration ohne Aussage; ein echter Statuspunkt ist Owner-Frage F20. |
| E-START-054 | Kann, „vollständig verschoben“ | bestätigt | – | `Card` mit `interactive` und `hover:bg-surface-3` (components/ui/Card.tsx:15-16). |
| E-START-055 | Kann, Nicht-Rückführung | bestätigt | – | Altstand: 0 Treffer für „3.000“ in gerendertem HTML und in app, components, lib des Altstands. Nur frühe Historie; Kennzahl nie Teil des Live-Altstands. |
| E-BEW-032 | Kann, Nicht-Rückführung | bestätigt | – | Gemessen auf `/bewerbung`, `/bewerbung/mappe`, `/bewerbung/danke`: 0 Treffer für „Alexander“, „beispiel.de“, „0170 8892341“, „Flottenwerkzeug“, „Sortimo“, „verifiziert“. „Über Tarif + Sonderzahlungen“ in der Mappe wäre eine Firmenaussage im Namen der Person, ohne Beleg. Der Zeichenketten-Wächter der Abnahme sollte als Muss-Test laufen (Schutzregel wie E-START-018). |
| E-BEW-033 | Kann, Nicht-Rückführung | bestätigt | – | Wie E-BEW-032: Fake-Erfolg und „verified“ sind bewusst entfernt (ROADMAP §1, §6); gemessen 0 Treffer „verifiziert“. |
| E-SHELL-003 | Kann, „vollständig verschoben“ | bestätigt | – | Gemessen im Hero: „Seit 1926 · Wetzlar“ und Kennzahl „35 km Einsatzradius“. |
| E-SHELL-013 | Kann | bestätigt | – | Reine Einblendungs-Staffel; die Signatur des Menüs liegt in E-SHELL-011 (Soll). |
| E-SHELL-014 | Kann, „vollständig verschoben“ | bestätigt | – | `MobileNav` führt nur `NAV_ITEMS` (components/site/MobileNav.tsx:109-124); `/jobs` trägt die Stellenkarten. |
| E-SHELL-016 | Kann, Markenzeichen? | bestätigt | – | Gemessen: Fuß ohne Logo, Firmenname im Block „Betrieb“; Logo im Kopf (Bild start__d1440-light__01). ROADMAP §5 legt den Fuß ohne Logo fest, das Markenzeichen lebt im Kopf. Den Jubiläums-Claim des Alt-Fußes trägt E-SHELL-001 (Muss). |
| E-SHELL-022 | Kann, „vollständig verschoben“ | bestätigt | – | 13:30 und 30 Tage stehen im Hero, FAQ 5 sagt „am Wochenende hast du frei“ (gemessen). |
| E-RECHT-001 | Kann, Recht | bestätigt | – | Gemessen: Brotkrumen „Startseite › Impressum“, H1 „Impressum“, Lead „Angaben nach § 5 DDG und Handwerksordnung …“. Die Pflichtangaben stehen in E-RECHT-002 bis -006 (Muss). |
| E-RECHT-010 | Kann, Nicht-Rückführung | bestätigt | – | Gemessen: Datenschutz ohne die Siegel, „Kurz gesagt“ (`#ueberblick`) vorhanden. Die Aussage „Serverstandort Frankfurt“ ist als Funktionsregion belegt (gemessen: „Region Frankfurt am Main (fra1)“), steht also nicht verloren da. |
| E-RECHT-013 | Kann | bestätigt, Auflage | – | Knopf bleibt Kann. Der dokumentierte Druckrand-Mangel (`@page { margin: 0 }` gilt global, datenschutz-aenderungen.md §5) ist ein Fehler im Ausgangsstand und gehört als eigenes Soll-Stück in das Mappe- und Druck-Paket, nicht an den Knopf. |
| E-RECHT-020 | Kann, Nicht-Rückführung (Recht) | bestätigt | – | Gemessen: kein `Set-Cookie` auf `/` und `/bewerbung`; Datenschutz sagt „setzt keine Cookies“. Keiner der alten Cookie-Namen kommt vor (laut Pass im Code ohne Treffer). |
| E-SEO-004 | Kann | bestätigt | – | Gemessen: 404 trägt zwei robots-Meta („noindex“ und „noindex, follow“); Bereinigen als Hygiene. |
| E-SEO-007 | Kann, Nicht-Rückführung | bestätigt | – | Gemessen: WebSite-Knoten der Startseite ohne `SearchAction`; es gab nie eine Suche. |
| E-SEO-008 | Kann, „vollständig verschoben“ | bestätigt | – | Gemessen: `/jobs/<slug>` trägt `BreadcrumbList`, `/bewerbung` nur `WebPage`. Brotkrumen nur bei sichtbarem Pfad (lib/content/breadcrumbs.ts:1-4). |
| E-SEO-016 | Kann | bestätigt | – | Gemessen: GET `/api/indexnow` 405. |
| E-SEO-019 | Kann | bestätigt | – | `proxy.ts:7` (sieben benannte Scraper); gemessen: User-Agent „SemrushBot“ auf `/` 403, Standard-Agent 200. |

### 3.3 „Nicht zurückführen“ (8 von 8)

| E-ID | geprüft auf | Ergebnis | Korrektur | Begründung |
|---|---|---|---|---|
| E-START-018 | erfunden? Priorität Muss | bestätigt | – | „Alexander Koch“ ist laut E-011 ein echter Mitarbeiter; gemessen: auf `/` nur als echtes Teamzitat („Alexander Koch Obermonteur Wärmepumpen“), nie als Platzhalter. Muss ist hier als Schutzregel gewollt (Wächter-Test), das ist in Ordnung; E-BEW-032 und -033 sollten ihre Zeichenketten-Wächter gleich hoch führen. |
| E-START-044 | erfunden/unbelegt? Soll | bestätigt, Auflage | – | Gemessen: weder „Mitarbeiter Stimme“ noch Michael S., Christian W., Tim K., Dennis M. auf `/`; die drei freigegebenen Teamzitate (Koch, Becker, Weber) stehen dort. B22 ist eine offene Owner-Frage: in MENSCHEN.md führen, damit eine Bestätigung das Element neu öffnet, nichts wird still verworfen. |
| E-START-055, E-BEW-032, E-BEW-033, E-RECHT-010, E-RECHT-020, E-SEO-007 | siehe 3.2 | bestätigt | – | Je Beleg in 3.2. |

### 3.4 Stichprobe „Keine Rückführung nötig“ (45 Pässe, davon 16 Startseite; dazu 12 Kann-Pässe in 3.2)

Gewählt: alle 16 Startseiten-Pässe ohne Kann und 29 weitere mit Muss oder Soll. Für Priorität siehe zusätzlich 3.5.

| E-ID | geprüft auf | Ergebnis | Korrektur | Begründung |
|---|---|---|---|---|
| E-START-001 | vollständig verschoben? Metadaten | bestätigt, Auflage Q6 | – | Gemessen: Titel „SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer“ (51 Z.), Beschreibung 140 Z., robots „index, follow“, og:* und twitter:* vollständig, og:image 1200×630. Canonical und og:url zeigen in diesem Lauf aber `http://localhost:3500` statt der Produktionsadresse: Abnahme nur mit gesetztem `APP_URL` messen. |
| E-START-003 | H1 und Lead | bestätigt | – | Gemessen H1 „SHK-Jobs in Wetzlar. Ehrliches Handwerk. Pünktlich Feierabend.“, Lead mit „Bezahlt über Tarif“ und „Hilti“; Kriterien des Passes erfüllt. |
| E-START-004 | Kacheln | bestätigt | – | Gemessen: 13:30 und 30 Tage als Kennzahl, Hilti im Erstbild-Lead, Firmenwagen im Vorteilsraster („Servicefahrzeug mit Privatnutzung“); die vierte Alt-Kachel ist E-START-005. |
| E-START-006 | Hero-Aktionen | bestätigt | – | Hero-Knopf → `/bewerbung` (gemessen), Mikrotext „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“; den 4-Wege-Hub gibt es bewusst nicht mehr (ROADMAP §6). |
| E-START-008 | Entscheidung | bestätigt (Priorität abgelehnt, 3.5) | – | Gemessen: „SD Sabri Demir Geschäftsführer und Meister“ und das freigegebene Zitat in „15 Leute. Ein Meisterbetrieb. Seit 1926.“. |
| E-START-012 | Express-Bewerbung lebt? | bestätigt | – | Gemessen `/bewerbung`: „Schritt 1 von 4“, Stellenwahl mit vier Stellen, Quereinstieg, Initiativ; eingebetteter Hero-Funnel bewusst entfallen (ROADMAP §5). Die Lücken Wohnort und Kenntnisse führen E-START-015 und E-BEW-015. |
| E-START-014 | Fortschrittsanzeige | bestätigt | – | Gemessen: `role="progressbar"` mit `aria-valuenow="1"`, `aria-valuemax="4"`, `aria-valuetext="Schritt 1 von 4"`. |
| E-START-022 | Kopf der Stellenübersicht | bestätigt | – | Gemessen: H2 „Offene Stellen“, Link „Alle Stellen im Überblick“ (`/jobs`), Anker `#stellen`. |
| E-START-023 | vier Stellenkarten | bestätigt | – | Gemessen: vier Karten → vier Stellenseiten, Spannen 3.600–4.600, 3.800–4.900, 4.400–5.600, 1.050–1.400 € pro Monat. |
| E-START-027 | Wechselprozess | bestätigt | – | Gemessen: drei Schritte, „100 % Diskretion“, Zusage „Dein Wechsel bleibt vertraulich …“, Knopf → `/bewerbung`. |
| E-START-028 | Einsatzgebiet-Versprechen | bestätigt | – | Gemessen: H2 „35 km um Wetzlar. Keine Fernmontage.“, Lead mit „Hotelübernachtungen“, Anker `#einsatzgebiet`. |
| E-START-039 | Pendelrechner | bestätigt | – | Gemessen: „Wo wohnst du?“ mit zehn Orten und Tabelle, Gießen 15 km / 16 Min., Herborn 24 km / 22 Min. |
| E-START-042 | Bewertungsband | bestätigt | – | Gemessen: Chips „Alle · Kunden · Team“, „Stimme 1 von 13“. |
| E-START-047 | AIAnswerBox | bestätigt | – | Gemessen: genau ein `FAQPage` mit fünf `Question`, kein `itemtype`; /llms.txt 200. ROADMAP §5 lässt die Box bewusst entfallen, Ersatz vollständig. |
| E-START-049 | Aufgabe lebt im Ersatz? | Entscheidung bestätigt, **Priorität abgelehnt** (3.5) | Soll → Muss | Gemessen: Startseite verlinkt `mailto:` (2×), `tel:` (3×), WhatsApp (2×) und `/bewerbung?stelle=initiativ`; `/api/contact` 404. Entfernung ist durch ROADMAP §5 und §9.3 (vom Owner freigegeben) gedeckt, Ersatz trägt die Aufgabe „schriftlich anfragen, ohne anzurufen“. |
| E-START-050 | FAQ | bestätigt | – | Gemessen: fünf Fragen als Details, Wortlaut in Du-Form wie im Pass, Antwort 5 „am Wochenende hast du frei“ (B23 offen, B16 umgesetzt). |
| E-BEW-002 | Schritt-Navigation | bestätigt | – | Zähler und Balken gemessen; die Lücke „Mappe ohne Fortschritt“ führt E-BEW-006. |
| E-BEW-009 | Profilfragebogen | bestätigt | – | Alle sechs Kenntnisse wörtlich in `SKILL_OPTIONS` (lib/mappe/options.ts:10-17); Stellenwahl im Flow gemessen. |
| E-BEW-013 | Foto | bestätigt | – | components/mappe/PersonalSection.tsx:29,89-120 (optional, Vorschau, Entfernen, Fehlertext). Übertragung wartet auf E-BEW-012. |
| E-BEW-014 | Expressbewerbung | bestätigt | – | `components/apply/ContactStep.tsx`, `SubmitErrorPanel.tsx`, `/api/bewerbung` GET 405; Absenden nicht ausgeführt (G5). |
| E-BEW-022 | Erfolgsmoment | bestätigt | – | CheckMark in ThankYouView.tsx:86; Konfetti bewusst entfernt (ROADMAP §6). Doppelpass zu E-START-019 (Q1). |
| E-BEW-029 | Metadaten, „vollständig verschoben“ | bestätigt, Auflage | Zustand „geschwächt, bewusst“, Unsicherheit auflösen | Gemessen: Titel, Beschreibung, Canonical, `WebPage` vorhanden. `BreadcrumbList` fehlt; das ist durch lib/content/breadcrumbs.ts gedeckt (Markup entspricht dem sichtbaren Pfad, der Fokus-Kopf zeigt keinen). Die „OFFENE FRAGE“ im Pass ist damit beantwortet. |
| E-SHELL-006 | Mobilmenü-Kontakt | bestätigt | – | components/site/MobileNav.tsx:130-139: Telefon und WhatsApp. |
| E-SHELL-007 | Telefon im Kopf | bestätigt | – | Gemessen: „06441 42956 anrufen“, `tel:+49644142956`. |
| E-SHELL-009 | Kopfnavigation | bestätigt | – | Gemessen: Stellen, Vorteile, Ablauf, FAQ; die Ziele `#vorteile`, `#ablauf`, `#faq` existieren. |
| E-SHELL-010 | Primäraktion | bestätigt | – | Gemessen: „Bewerben“ im Kopf → `/bewerbung`. |
| E-SHELL-012 | Mobilmenü-Mechanik, „vollständig verschoben“ | **abgelehnt** | Zustand verschoben → **geschwächt**, Entscheidung → **Verschmelzen**; Priorität Muss bleibt | Browserlauf (375×812): Startseite, Menü öffnen, `page.goBack()` → URL wechselt auf `/jobs`, aber `dialog[open]` bleibt 1 und `html` behält `overflow: hidden`; der Dialog liegt über der Vorseite. Altstand: `components/Header.tsx:32-36` schließt bei `popstate`. Ausgangsstand: kein `popstate` in components/site und components/ui; `pathname` dient nur `aria-current` (MobileNav.tsx:76), das Menü schließt nur über Link-`onClick`. Der Pass vermerkt das selbst („Browser-Zurück nicht belegt“) und entscheidet trotzdem „vollständig“. Reparatur: im `MobileNav` bei geöffnetem Menü `popstate` (oder Pfadwechsel) auf `setOpen(false)` legen; Abnahmetest „Menü öffnen, zurück, kein offener Dialog, Scrollen frei“. Echtgeräte (iOS Wisch-Zurück, Android Zurück-Taste) bleiben MENSCHEN-Punkt. |
| E-SHELL-015 | Fuß-Vorspann | bestätigt | – | Kontaktblock gemessen auf `/`, `/jobs`, Stellenseite, `/bewerbung`; auf `/impressum`, `/datenschutz` und 404 gibt es keinen eigenen Block, nur die Fußspalte (Telefon, E-Mail) bzw. den Rechtstext. Das sind keine Bewerbungsseiten. |
| E-SHELL-018 | Innung | Entscheidung bestätigt, **Priorität abgelehnt** (3.5) | Soll → Muss | Gemessen im Fuß: „Innung Sanitär-, Heizungs- und Klimatechnik Lahn-Dill“; „Mitglied der“ fehlt gegenüber dem Altstand, die Aussage trägt aber. |
| E-SHELL-020 | Fuß-Stellenspalte | bestätigt | – | Gemessen: vier Stellen, „Alle Stellen“. |
| E-SHELL-026 | 404-Wegweiser | bestätigt | – | Gemessen: „Jetzt bewerben“, „Offene Stellen“, „Zur Startseite“. |
| E-RECHT-002 | Impressum-Pflichtangaben | bestätigt | – | Gemessen und mit Anhang A abgeglichen: Firma, Anschrift, Telefon, Telefax, E-Mail, Register, Geschäftsführung, § 18 MStV. |
| E-RECHT-003 | USt-IdNr. | bestätigt | – | Gemessen „DE 346 648 448“, unverändert; Widerspruch zu `SITE_CONFIG.vatID` bleibt Owner-Frage O1 (nicht eigenmächtig ändern). |
| E-RECHT-004 | Kammer, Berufsbezeichnung | bestätigt | – | Gemessen: Handwerkskammer Wiesbaden, Anschrift, Telefon, E-Mail, Website, Berufsbezeichnung, HwO. |
| E-RECHT-019 | Schriften, Cookies | bestätigt | – | Gemessen: „setzt keine Cookies“, kein `Set-Cookie`, Schrift beim Build eingebunden (Pass). |
| E-RECHT-021 | Cookie-Banner entfällt | bestätigt | – | Kein Cookie, kein einwilligungspflichtiger Dienst außer Karte; Ersatz `lib/maps/consent.ts`. Künftige Dienste (Phase 3) brauchen neuen Dialog, im Pass vermerkt. |
| E-RECHT-022 | Maps-Einwilligung | bestätigt | – | `lib/maps/consent.ts` vorhanden; Datenschutz `#google-maps` gemessen vorhanden und nennt Google. |
| E-SEO-001 | Metadaten Start | bestätigt, Auflage Q6 | – | Siehe E-START-001. |
| E-SEO-002 | `/bewerbung` und `?tab=` | bestätigt | – | Gemessen: `?tab=dossier` 308 auf `/bewerbung/mappe`, mit `utm_source` erhalten; `?tab=vault`, `?direct=true`, `?tab=bogus` 200. |
| E-SEO-003 | Metadaten Rechtsseiten | bestätigt | – | Gemessen: `noindex, follow`, Canonical gesetzt, nicht in der Sitemap (sieben Adressen). |
| E-SEO-010 | JobPosting | bestätigt | – | Gemessen: Stellenseite genau ein `JobPosting` plus `BreadcrumbList`, Startseite keines. |
| E-SEO-011 | FAQPage | bestätigt | – | Gemessen: fünf Fragen. |
| E-SEO-013 | sitemap.xml | bestätigt | – | Gemessen: `/`, `/jobs`, vier Stellenseiten, `/bewerbung`. |
| E-SEO-015 | IndexNow-Datei | bestätigt | – | Gemessen: 200, 33 Byte, Schlüssel plus Zeilenumbruch. |
| E-SEO-018 | Formular-Schnittstellen | bestätigt | – | Gemessen: `/api/contact` 404, `/api/bewerbung` GET 405. Entfernung durch ROADMAP §9.3 gedeckt. |

Ergebnis der Stichprobe: von 57 geprüften „Keine Rückführung nötig“-Pässen (45 hier, 12 in 3.2) ist einer widerlegt (E-SHELL-012), zwei tragen den Zusatz „vollständig“ zu Unrecht (E-START-034, E-BEW-029). Fehlerquote: 1,8 % widerlegt, weitere 3,5 % ungenau (zusammen 5,3 %). Hochgerechnet auf 88 wären rund zwei bis fünf Pässe betroffen; eine Vollprüfung ist nicht nötig, aber die Pässe, in deren eigenem Text „Lücke“ oder „nicht belegt“ steht, sollten vor dem Phasentor einmal gegengelesen werden (hier: E-BEW-002, -009, -013, -014, -024, die Lücken sind jeweils anderen Pässen zugeordnet und damit nicht verloren).

### 3.5 Gezielte Prüfung auf zu niedrige Muss-Einstufung

Maßstab: Auftrag 8, Muss = Recht, Funktionen mit Geschäftswert (Kontakt, Anfrage, Buchung, Rechner), Seiten und URLs mit Suchwert, belegte Vertrauenselemente, Markenzeichen, Zugänglichkeitshilfen. Abgelehnt habe ich nur, wo der Pass im eigenen Grund ein Muss-Merkmal nennt oder dieselbe Tatsache in einem Schwesterpass Muss ist.

| E-ID | geprüft auf | Ergebnis | Korrektur | Begründung |
|---|---|---|---|---|
| E-START-021 | belegtes Vertrauenselement | **abgelehnt** | Soll → Muss | Grund im Pass: „belegte Vertrauenselemente, alle Inhalte vorhanden“. Bild alt-start__d1440-light__03: nur drei von sieben Punkten sichtbar. Abnahme „kein Fakt öfter als zweimal“ ist unerfüllbar (Q5, gemessen auf `/`: „13:30“ 5×, „Hilti“ 7×, „Servicefahrzeug“ 5×); ändern in „Zahl der Wiederholungen steigt nicht“. |
| E-START-010 | belegtes Vertrauenselement | **abgelehnt** | Soll → Muss | Grund im Pass: „belegte Vertrauenspunkte“; wird in E-START-021 verschmolzen und folgt dessen Priorität. |
| E-START-031 | belegtes Vertrauenselement | **abgelehnt** | Soll → Muss | Grund im Pass: „belegtes Vertrauenselement, Owner-Auftrag“. Zeitlich nicht kritisch, aber Muss nach Regel. |
| E-START-008 | belegtes Vertrauenselement | **abgelehnt** | Soll → Muss | Person und freigegebenes Zitat (ROADMAP §1: Teamzitate freigegeben); Kategorie Vertrauen, Inhalt belegt, gemessen vorhanden. |
| E-SHELL-018 | belegtes Vertrauenselement, Konsistenz | **abgelehnt** | Soll → Muss | Dieselbe Tatsache (Innung) ist in E-START-011 Muss; Pass nennt „belegtes Vertrauenselement (Name belegt)“. |
| E-RECHT-018 | Recht, belegte Zusage | **abgelehnt** | Soll → Muss | Zusage steht rechtlich verbindlich in der Datenschutzerklärung (Aufgabe laut Pass), Gegenstück `DISCRETION_PROMISE`; Rechtsnähe und belegt. |
| E-START-049 | Kontakt, Anfrage | **abgelehnt** | Soll → Muss | Pass-Grund „Kontakt-Funktion“; Auftrag 8 nennt Kontakt und Anfrage; E-SEO-018 (gleicher Sachverhalt) ist Muss. Entscheidung bleibt „Keine Rückführung nötig“, Abnahme prüft den Ersatz. |
| E-SEO-021 | URLs und Anker mit eingehenden Links | **abgelehnt** | Soll → Muss; zusammenlegen mit E-START-052 | E-START-052 (Muss) behandelt dieselben Anker. Gemessen: Altstand-HTML hat zwölf IDs (`express-funnel` doppelt), Ausgangsstand nur `stellen`, `einsatzgebiet`, `faq` und neu `vorteile`, `ablauf`, `ueber-uns`, `main`, `cta-title`; es fehlen `express-funnel`, `karriere-paket`, `gehalt`, `benefits`, `ausstattung`, `wechsel-prozess`, `bewertungen`, `kontakt`, `main-content`. Z-06 verlangt alte URLs und Anker. Vorschlag: ein Leitpass E-START-052, E-SEO-021 behält nur die zwei Zusatzfälle `#main-content → #main` und `/datenschutz#bewerber-datenschutz → #bewerberdaten`. |
| E-START-002, E-SHELL-001 | Muss, Rückführen; „bewusst entfernt?“ | bestätigt | – | `anniversary100` (lib/content/facts.ts:80-86, `validUntil: 2026-12-31`) wird nur in Tests gelesen, nirgends gerendert (gemessen: `/` ohne „100 Jahre“). ROADMAP §13 verlangt das Badge bis Ende 2026 („Das Ablaufdatum wird im Code hinterlegt“): kein Hinweis auf bewusste Entfernung, also keine Zurückstellung. Doppelpass (Q1). |
| E-START-007 | Funktion, Priorität | bestätigt (Soll) | – | Der Einstieg ist Komfort; die Funktion selbst ist E-BEW-012 (Muss). |
| E-START-011 | Vertrauen, Priorität | bestätigt (Muss) | – | – |
| E-START-024 | Rechner? | bestätigt (Soll) | – | Der Altstand-„SalaryCalculator“ rechnet nichts (components/pricing/SalaryCalculator.tsx zeigt Rollen-Pakete, keine Summen), ist also kein Rechner im Sinn von Auftrag 8. ROADMAP §1 und §5 („geht in die Stellenseiten über“, „fasst Gehaltsrechner-Fakten zusammen“) sind ein Gegenindiz zur Rückführung der Interaktion; Owner-Frage F15 als MENSCHEN-Eintrag führen. |
| E-START-043 | Vertrauen | bestätigt (Muss), Auflage Q8 | – | Die Inhaber-Antwort-Zeile ist ein Teilstück mit Hinweis auf bewusste Entfernung (components/reviews/data.ts:7 „owner replies stay out: they age or add noise“); bis F17 beantwortet ist, nicht bauen. |
| E-START-048 | Kontakt | bestätigt (Soll) | – | Die Kanäle sind Muss in E-SHELL-005, -006, -007 und gemessen vorhanden; hier fehlt nur der Mensch im Kontaktblock. |
| E-START-052 | URL/Anker | bestätigt (Muss) | – | Leitpass, siehe E-SEO-021. |
| E-BEW-004 | Vertrauen | bestätigt (Muss) | – | Doppelpass zu E-START-017 (gleiches Ziel ContactStep.tsx), Q1. |
| E-BEW-020 | Kontakt | bestätigt (Soll) | – | Zusatzkanal; Einreichen ist E-BEW-021 (Muss). |
| E-BEW-023 | Vertrauen | bestätigt (Soll) | – | Transaktionsmail; die Muss-Funktion „Team erhält die Bewerbung“ ist E-BEW-024. |
| E-SHELL-002 | Funktion | bestätigt (Soll) | – | ROADMAP §5 streicht die Oberleiste bewusst; der Zähler ist nicht ausdrücklich erwähnt. „Rückführen“ ist vertretbar, im Freigabepunkt nennen. |
| E-SHELL-004 | belegtes Vertrauenselement | bestätigt (Soll) | – | Rahmenweite Wiederholung der Zusage; die Kernzusage ist Muss in E-START-017 und E-BEW-004. Die „Zwei-Mal-Regel“ ist schon verletzt (Q5), der Einwand im Pass trägt nicht mehr. |
| E-SHELL-005 | Kontakt | bestätigt (Muss) | – | Gemessen: Kopf ohne WhatsApp, Fuß „Betrieb“ nur Telefon und E-Mail. |
| E-SHELL-023 | Kontakt | bestätigt (Soll) | – | Die Anteile stehen in E-SHELL-002 und -005; der Kopf ist sticky mit „Bewerben“ und Telefon. |
| E-SHELL-027 | Kontakt, Zustand | bestätigt (Soll), Zustand zu hart | Zustand „verloren“ → „geschwächt“ | Gemessen: 404 zeigt im Fuß Telefon und E-Mail; es fehlt nur WhatsApp (ab lg). |

Nicht beanstandet, weil durch Schwesterpass als Muss gedeckt oder reiner Inhalt: Zugänglichkeitshilfen (Sprunglink als „unverändert vorhanden“, E-SHELL-012 Muss), Markenzeichen (Logo „unverändert vorhanden“, Jubiläum Muss), Rechner (Pendelrechner E-START-039 Muss).

## 4. Querbefunde

**Q1 Doppelpässe.** Dieselbe Aufgabe steht in mehreren Pässen und wird doppelt geplant und gezählt: E-START-002 und E-SHELL-001 (Jubiläum; Zustand „geschwächt“ gegen „verloren“); E-START-052 und E-SEO-021 (Anker; Muss gegen Soll); E-START-005 und E-BEW-030 (24 Stunden; beide Zurückstellen); E-START-017 und E-BEW-004 (Diskretion am Kontaktschritt, gleiches Ziel); E-START-019 und E-BEW-022 (Erfolgsmoment; „Neu interpretieren“ gegen „Keine Rückführung nötig“); E-START-015 und E-BEW-009 (Kenntnisse: einmal „lebt in der Mappe“, einmal „Chips auf der Danke-Seite“); E-START-007 mit E-BEW-012 und E-BEW-027 (Upload-Einstieg); E-BEW-005 mit E-START-017, E-SHELL-004, E-RECHT-008, E-RECHT-010 (§ 26-BDSG-Frage auf fünf Pässe verteilt). Je Gruppe einen Leitpass bestimmen, die übrigen werden Querverweis. Der Nenner sinkt dadurch auf etwa 155; mit 8 Zurückstellungen (E-RECHT-005 entfällt, E-BEW-030 geht in E-START-005 auf) sind es 5,2 %.

**Q2 Nenner der Zurückstellungsquote.** Z-02 sagt „höchstens 10 % aller Elemente“. Über alle 163 Pässe sind es 6,1 % (nach Korrektur 5,5 %). Zählte jemand nur Pässe mit Arbeit (163 minus 88 „Keine Rückführung nötig“ minus 8 „Nicht zurückführen“ = 67), wären es 14,9 % (13,4 % nach Korrektur) und die Grenze wäre gerissen. Das ist kein Schönrechnen der Pässe, aber eine Definitionslücke: In ENTSCHEIDUNGEN festhalten, dass „alle Elemente“ alle Pässe des Verlustatlas sind (zuzüglich der unverändert vorhandenen), und die Quote je Welle gegen diesen Nenner führen.

**Q3 Zurückstellkriterium.** Auftrag 8 nennt als Gründe nur bewusste Entfernung (Commit-Nachricht, Ersatzfunktion), offene Rechtsfragen und nachweislich abgelaufene Inhalte. `_restaurator.md` fügt „unbelegte Fakten“ hinzu. Wo nur „unbelegt“ trägt (E-START-009, E-SHELL-017, Teil von E-SHELL-019), habe ich bestätigt: die Aussage könnte wahr sein, ein Mensch kann sie belegen, und die Standardannahme „nicht zurückführen“ ist dieselbe. Der Auftragswortlaut deckt das nicht ausdrücklich; die Entscheidung gehört in ENTSCHEIDUNGEN, damit das spätere Gate nicht daran hängt.

**Q4 Prioritätenpolitik für unbelegte Vertrauenselemente.** E-START-045 Muss, E-SHELL-017 Soll, E-SHELL-019 Kann (jetzt Soll), E-START-005 Soll, E-START-009 Kann. Vorschlag: Priorität nach dem Zustand, den das Element nach Bestätigung hätte, Zurückstellen bis dahin. Ich habe nur E-SHELL-019 angeglichen.

**Q5 Abnahmekriterium „höchstens zweimal je Fakt“.** Am Ausgangsstand gemessen auf `/`: „13:30“ 5×, „Hilti“ 7×, „Servicefahrzeug“ 5×. Das Kriterium (E-START-021) und der Einwand in E-SHELL-004 sind damit nicht erfüllbar. Umformulieren in „Wiederholungen steigen nicht“ oder die Regel auf Aussagen mit eigener Karte beschränken.

**Q6 Messbedingung Canonical.** `/` ist vorgerendert (`x-nextjs-prerender: 1`), zeigt aber `http://localhost:3500` als Canonical und og:url; `/impressum`, `/datenschutz`, `/bewerbung/danke`, `/bewerbung/mappe` zeigen die Produktionsadresse. E-SEO-002 behauptet, vorgerenderte Seiten trügen die Produktionsadresse; für `/` und `/jobs/<slug>` stimmt das in diesem Lauf nicht. Abnahmen für E-START-001, E-SEO-001, E-SEO-002 mit der `APP_URL` der Produktion messen.

**Q7 Richtungsauftrag.** `pakete/_richtung.md` Z. 16 verlangt den Radius-Umschalter 15/25/35 als Beispielabschnitt; E-START-033 plant Ringe statt Umschalter. Abgleichen, bevor P2 startet.

**Q8 Inhaber-Antwort.** E-START-043 verschmilzt die „Antwort von Meister Demir“; components/reviews/data.ts:7 lässt sie bewusst weg. Dieses Teilstück gemäß Auftrag 8 bis zur Antwort auf F17 zurückstellen (nicht den ganzen Pass).

## 5. Reparaturliste in einem Blick

| E-ID | bisher | neu |
|---|---|---|
| E-RECHT-005 | Muss · Zurückstellen | Muss · Verschmelzen (Wortlaut bleibt, Rechtsprüfung nach MENSCHEN.md) |
| E-SHELL-012 | Muss · verschoben · Keine Rückführung nötig | Muss · geschwächt · Verschmelzen (Menü bei Zurück schließen, Test) |
| E-SEO-021 | Soll · Rückführen | Muss · Rückführen, in E-START-052 aufgehen lassen |
| E-START-021 | Soll · Neu interpretieren | Muss · Neu interpretieren, Abnahmekriterium ändern |
| E-START-010 | Soll · Verschmelzen | Muss · Verschmelzen |
| E-START-031 | Soll · Verschmelzen | Muss · Verschmelzen |
| E-START-008 | Soll · Keine Rückführung nötig | Muss · Keine Rückführung nötig |
| E-SHELL-018 | Soll · Keine Rückführung nötig | Muss · Keine Rückführung nötig |
| E-RECHT-018 | Soll · Keine Rückführung nötig | Muss · Keine Rückführung nötig |
| E-START-049 | Soll · Keine Rückführung nötig | Muss · Keine Rückführung nötig |
| E-START-016 | Kann · Verschmelzen | Soll · Verschmelzen |
| E-START-033 | Kann · Neu interpretieren | Soll · Neu interpretieren |
| E-SHELL-019 | Kann · Zurückstellen | Soll · Zurückstellen |

Auswirkung auf die Verteilung: Muss 58 → 66, Soll 75 → 70, Kann 30 → 27; Zurückstellen 10 → 9; „Keine Rückführung nötig“ 88 → 87; Verschmelzen 30 → 32.

## 6. Offene Fragen

1. Nenner der Zurückstellungsquote festlegen (Q2).
2. Zurückstellkriterium „unbelegt“ ohne Auftragswortlaut (Q3): so lassen oder in ENTSCHEIDUNGEN aufnehmen.
3. Leitpässe für die acht Doppelgruppen bestimmen (Q1).
4. Abnahmekriterium „höchstens zweimal je Fakt“ ändern (Q5).
5. Canonical-Messung: Läuft der Ausgangsstand mit `APP_URL=http://localhost:3500` gebaut? Abnahmen von E-START-001 und E-SEO-002 erst mit Produktions-`APP_URL` (Q6).
6. Radius-Umschalter gegen Ringe mit `_richtung.md` abstimmen (Q7).
7. Rechtsprüfung E-RECHT-005 (§ 36 VSBG, OS-Satz) als MENSCHEN-Eintrag mit Hinweis „blockiert nichts“.
8. E-SHELL-012: Echtgeräte-Prüfung (iOS Wisch-Zurück, Android Zurück-Taste); der Browserlauf deckt nur die Chromium-History-Navigation.
9. Offen und nicht prüfbar ohne Git: Wortlaut der Commit-Nachrichten a2f641d und 075aa71 (aus den Pässen übernommen).

## 7. Ausgabeformular (Antwort an den Orchestrator)

GEÄNDERTE DATEIEN
- `_relaunch/atlas/gegenpruefung-p1.md` (neu). Keine weitere Datei im Repo geändert; Hilfsskripte nur im Scratchpad.

WAS UND WARUM
- 105 von 163 Pässen geprüft: alle 10 Zurückstellungen, alle 30 Kann-Einstufungen, alle 8 „Nicht zurückführen“, 45 „Keine Rückführung nötig“ (16 davon Startseite) und 21 Pässe gegen die Prioritätsregel. 13 Ablehnungen mit Reparaturvorschlag, Zurückstellungsquote 6,1 % (nach Korrektur 5,5 %).

TESTS UND ERGEBNIS
- GET-Messungen gegen `:3500` und `:3600` bestätigen fast alle Aussagen der Pässe; ein Browserlauf widerlegt „vollständig verschoben“ bei E-SHELL-012 (Menü bleibt nach Zurück offen, Scrollen gesperrt). Konsistenzlauf Übersicht gegen Passtext: 0 Abweichungen in 163 Pässen.

BILDBELEGE
- `belege/p0-altstand/alt-start__d1440-light__03.webp`, `belege/p0-ausgangsstand/start__d1440-light__01.webp` (nur gelesen, keine neuen Bilder).

OFFENE FRAGEN
- Siehe Abschnitt 6.

RISIKEN
- Pflichtangabe E-RECHT-005 bleibt ohne Rechtsprüfung, solange kein MENSCHEN-Eintrag existiert. Quote hängt am Nenner (Q2). Acht Doppelpässe können Arbeit doppelt anlegen. Prioritäten-Hochstufungen ändern die Wellenreihenfolge, nicht Z-02.

=== ENDE P1-GEGEN-01 · BEREIT ZUR RÜCKGABE ===
