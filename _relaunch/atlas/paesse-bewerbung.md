# Element-Pässe Bewerbungsstrecke `/bewerbung` · P1-REST-02 (Runde 2: P1-REST-04-R2)

Rolle Restaurator, Stufe 2, Kern-Version 0 (Runden: P1-REST-02, P1-REST-04-R2, P1-REST-04-R3). Stand 2026-10-09. Grundlage: Altatlas `_relaunch/atlas/alt-bewerbung.md` (ALT-BEW-001 bis ALT-BEW-302; 298 ist ein Nachtrag der Gegenprobe P1-KUND-06, 299 bis 302 stammen aus Runde 1; Runde 2 und Runde 3 meldeten keine neuen Zeilen, Runde 3 berichtigte nur ALT-BEW-252), Neuatlas `_relaunch/atlas/neu-plattform.md` (Teile 3 bis 5: NEU-BEW, NEU-DANKE, NEU-MAPPE) und der Code des Ausgangsstands (Commit a83269d, Arbeitsbaum). Messbedingungen und gesammelte offene Fragen stehen am Ende der Datei.

## Übersicht

| E-ID | Name | Kategorie | Zustand | Priorität | Entscheidung |
| --- | --- | --- | --- | --- | --- |
| E-BEW-001 | Vier-Wege-Hub (Weg A/Weg B, Direktknöpfe, Gateway-Karten) | Navigation | geschwächt | Soll | Verschmelzen |
| E-BEW-002 | Schritt-Navigation im Unterkopf (Tabs, Seitentitel, Fortschritt) | Navigation | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-003 | Aktiver-Tab-Glow, Ansichtswechsel und Knopf-Stil (Bewegung) | Bewegung | verloren | Soll | Neu interpretieren |
| E-BEW-004 | Diskretionszusage am Ort der Dateneingabe | Vertrauen | geschwächt | Muss | Verschmelzen |
| E-BEW-005 | „§ 26 BDSG“-Siegel und Garantieformeln | Recht | verloren | Muss | Zurückstellen |
| E-BEW-006 | Bewerber-Checkliste mit Sprungmarken | Interaktives | geschwächt | Soll | Neu interpretieren |
| E-BEW-007 | Vollständigkeits-Gauge (Radial-SVG) | Grafik und SVG | verloren | Soll | Neu interpretieren |
| E-BEW-008 | Regionalband „Einsätze ohne Fernmontage“ | Inhalt | verschoben | Soll | Verschmelzen |
| E-BEW-009 | Profilfragebogen (Quiz): Fachposition und Kenntnisse | Interaktives | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-010 | Arbeitsstil und Anschreiben-Vorlage | Inhalt | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-011 | Quiz-Ergebnis „Dein Bewerbungsprofil“ und Übernahme | Funktion | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-012 | Dokumenten-Tresor: Unterlagen hochladen (Lebenslauf, Zeugnisse, Nachweise) | Funktion | geschwächt | Muss | Rückführen |
| E-BEW-013 | Bewerbungsfoto | Funktion | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-014 | Expressbewerbung mit Name und Telefon (Absenden) | Funktion | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-015 | Online-Bewerbungsformular (Felder) | Interaktives | verschoben | Muss | Verschmelzen |
| E-BEW-016 | A4-Anschreiben (Blatt 1 der Bewerbungsmappe) | Inhalt | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-017 | A4-Lebenslauf (Blatt 2 der Bewerbungsmappe) | Inhalt | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-018 | Berufs- und Ausbildungsstationen (Eingabeweg im Lebenslauf) | Funktion | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-019 | Mappe-Steuerleiste und Druck/PDF-Ausgabe | Funktion | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-020 | Mappe per WhatsApp teilen | Einbindung Dritter | geschwächt | Soll | Rückführen |
| E-BEW-021 | Mappe verbindlich einreichen (Absenden und Nachreichen) | Funktion | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-022 | Erfolgsmoment nach dem Absenden (Konfetti, Erfolgsbanner, Toast) | Bewegung | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-023 | Eingangsbestätigung per E-Mail an Bewerber | Vertrauen | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-024 | Team-Benachrichtigung per E-Mail | Funktion | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-025 | E-Mail-Fußzeile mit Pflichtangaben (Geschäftsführer) | Recht | geschwächt | Muss | Rückführen |
| E-BEW-026 | Bewerbungs-Schnittstelle POST /api/bewerbung (Prüfung, Honeypot, Antworten) | Funktion | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-027 | URL-Parameter ?tab= und ?direct= (eingehende Links) | Navigation | verschoben | Muss | Verschmelzen |
| E-BEW-028 | Entwurf im Browser-Speicher | Suche und Technik | verschoben | Soll | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-029 | Metadaten und JSON-LD der Bewerbungsseite | Suche und Technik | verschoben | Muss | Keine Rückführung nötig (vollständig verschoben) |
| E-BEW-030 | Rückmeldeversprechen „binnen 24 Stunden“ | Vertrauen | verschoben | Soll | Zurückstellen |
| E-BEW-031 | Titel und Anrede des Ansprechpartners | Vertrauen | verschoben | Soll | Zurückstellen |
| E-BEW-032 | Platzhalter-Standarddossier „Alexander Koch“ und erfundene Lebenslaufinhalte | Vertrauen | verloren | Kann | Nicht zurückführen (erfunden/unbelegt) |
| E-BEW-033 | Vorgetäuschte Erfolgs- und Sicherheitszustände | Vertrauen | verloren | Kann | Nicht zurückführen (erfunden/unbelegt) |
| E-BEW-034 | Lade-Platzhalter der Ansichten (Fragebogen, Dokumente, Formular, Mappe) | Interaktives | verschoben | Kann | Keine Rückführung nötig (vollständig verschoben) |

## Element-Pässe

### E-BEW-001 · Vier-Wege-Hub (Weg A/Weg B, Direktknöpfe, Gateway-Karten)
- Kategorie: Navigation
- Quelle: ALT-BEW-022–029, 069–072, 243 · Altstand: `app/bewerbung/page.tsx:243-316, 329-370`, `components/views/QuizView.tsx:134`, `app/globals.css:155-170, 177-205` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__01.webp` (Hero, Weg A/B, drei Knöpfe), `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__03.webp` (Gateway-Karten Schritt 1–4), `_relaunch/belege/p0-altstand/alt-bewerbung__m375-light__01.webp` (mobil)
- Zustand: geschwächt (+ Gegenstück: NEU-BEW-04 bis NEU-BEW-10 (Stellenwahl als erster Schritt), NEU-BEW-33 („Lieber direkt per WhatsApp?“), NEU-BEW-34 („Lieber mit kompletter Bewerbungsmappe?“), NEU-BEW-35 („Lieber direkt sprechen?“ mit Telefon, WhatsApp, E-Mail); `app/bewerbung/page.tsx`, `components/apply/FlowShortcuts.tsx`)
- Aufgabe: Besucher wählen zu Beginn ihren Weg nach dem, was sie zur Hand haben (Lebenslauf vorhanden oder nicht) und sehen alle Möglichkeiten auf einen Blick; das Unternehmen führt sie so zügig zu einer abschließbaren Bewerbung.
- Wesenskern: Zwei Ausgangslagen werden ausdrücklich angesprochen: Weg A „Weg A · Unter 30 Sekunden“ · „Bereits Lebenslauf vorhanden?“ · „Direkt PDF & Foto hochladen – kein Fragebogen nötig.“ und Weg B „Weg B · Interaktiv“ · „Kein Lebenslauf zur Hand?“ · „4 kurze Fragen – fertiges DINA4 Dossier wird automatisch erstellt.“; drei Direktknöpfe „Schnellbewerbung starten“, „Unterlagen direkt hochladen“, „DINA4 Bewerbungsmappe ansehen“; vier Gateway-Karten mit je einem Nutzensatz und Handlungsknopf: „Schritt 1“ „Schneller Profilfragebogen“ („Beantworte 4 kurze Fragen und erstelle direkt Dein Profil für Anlagenmechaniker SHK oder Kundendiensttechniker.“ · „Fragebogen öffnen“), „Schritt 2“ „Unterlagen und Zeugnisse“ („Lade vorhandene Zeugnisse, Gesellenbriefe oder Zertifikate ganz einfach und sicher hoch.“ · „Unterlagen hochladen“), „Schritt 3“ „Online Bewerbungsformular“ („Erfasse persönliche Daten, Praxisschwerpunkte, Wunschkonditionen und Wunschtermin ganz entspannt online.“ · „Formular bearbeiten“), „Schritt 4“ „DINA4 Bewerbungsmappe“ („Druckfertige Bewerbungsunterlagen mit allen Angaben für Bad und Energie GmbH Lahn Dill.“ · „Bewerbungsmappe öffnen“); Eyebrow „Bewerbung & Dokumenten-Upload · SHK Karriereportal“. Im Ausgangsstand lebt: ein Flow als Startansicht, WhatsApp-Abkürzung und Mappe-Link unter dem Flow (ohne Erklärzeile), Kontaktkanäle tiefer. Es fehlt: die ausdrückliche Wegwahl mit Erklärung je Weg und Weg A (Unterlagen hochladen, siehe E-BEW-012). Nicht zurückführen: H1 „Vier einfache Wege zu Deinem neuen SHK Arbeitsplatz“ (der Ausgangsstand hat einen Flow plus Nebenwege; die Zahl stimmt nicht mehr), „unter zwei Minuten“, „Unter 30 Sekunden“, „4 kurze Fragen“ (widersprüchlich, B4; belegt ist „ca. 60 Sekunden“, Fakt `apply60s`), „sicher hoch“ (kein Nachweis), Karten als `div` mit `onClick` ohne Tastaturbedienung.
- Freiraum: Zahl der Wege, Kartenform, Hero-Fläche, Reihenfolge, Ton („du“ statt „Dich“); Karten müssen echte Links oder Knöpfe sein.
- Bindungen: Ziele Flow (`/bewerbung`), Mappe (`/bewerbung/mappe`, `MAPPE_PATH`), WhatsApp (`buildWhatsAppUrl`), Upload (E-BEW-012, noch nicht vorhanden); eingehende Links auf `/bewerbung` (Altstand: Header, Footer, `ProcessSteps`, 404-Seite, Startseite; Ausgangsstand: Header, Startseite, Stellenseiten über `applyPath`) landen heute direkt im Flow; Parameter `?tab=` siehe E-BEW-027. Übersetzungen: keine (Plattform einsprachig Deutsch).
- Priorität: Soll – Grund: Orientierung mit klarem Besuchernutzen; der Geschäftswert (Bewerbung abschicken) liegt im Flow und ist vorhanden.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: `app/bewerbung/page.tsx` (Abschnitt „Lieber direkt sprechen?“) und `components/apply/FlowShortcuts.tsx`: die vorhandenen Abkürzungen bekommen eine Erklärzeile und stehen als gleichwertige Karten (Variante der vorhandenen Card-Komponente) für Direkt per WhatsApp, Mit Bewerbungsmappe, Unterlagen anhängen (erst mit E-BEW-012) und Anrufen; der Flow bleibt die Startansicht.
- Gestaltung: folgt KERN (P2) · Idee: eine ruhige Zeile „Andere Wege“ unter dem Flow mit zwei bis drei gleichrangigen Karten statt dunkler Hero-Fläche.
- Abnahme: Von `/bewerbung` aus sind WhatsApp, Mappe und (nach Phase 2b) Unterlagen-Upload je mit einem Klick und einer erklärenden Zeile erreichbar, alle Karten per Tastatur bedienbar, Zeitangabe nur aus dem Fakt `apply60s` · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung__d1440-light__01.webp` und `_relaunch/belege/p0-ausgangsstand/bewerbung__d1440-light__02.webp`
- Status: offen
- Unsicherheit: keine (Weg A fehlt bewusst in Phase 1, ROADMAP §6: „Dokumente: in Phase 1 ‚per WhatsApp/E-Mail nachreichen‘, ab Phase 2 als Upload“)

### E-BEW-002 · Schritt-Navigation im Unterkopf (Tabs, Seitentitel, Fortschritt)
- Kategorie: Navigation
- Quelle: ALT-BEW-001, 004–011, 015–020, 082–084 · Altstand: `app/bewerbung/page.tsx:135-139, 145-146, 152-161, 166-196, 205-223`, `components/views/QuizView.tsx:25, 125, 141-156` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__01.webp` (Unterkopf mit Tab-Leiste), `_relaunch/belege/p0-altstand/alt-bewerbung-quiz__d1440-light__01.webp` (Fortschritt „Schritt 1 von 4“, 25 %), `_relaunch/belege/p0-altstand/alt-bewerbung__m375-light__01.webp` (mobile Tab-Leiste)
- Zustand: verschoben (+ Gegenstück: NEU-BEW-01 (sr-only h1, Fokus-Header mit Logo und „Abbrechen“), NEU-BEW-02 (`StepHeader`: „Schritt n von m“, Balken, Zurück), NEU-BEW-03 (Stellen-Tag mit „ändern“), NEU-BEW-40 (`?schritt=`); `components/ui/StepHeader.tsx`, `components/apply/ApplyFlowClient.tsx`)
- Aufgabe: Orientierung im Bewerbungsprozess: wo bin ich, wie viele Schritte gibt es, wie komme ich zurück oder woanders hin.
- Wesenskern: Sichtbarer Fortschritt („Schritt 1 von 4“ · „25%“ · Balken Schritt/4), Titel des aktuellen Schritts (Altstand: „Übersicht und Vollständigkeitsprüfung“ · „Schritt 1: Schneller Profilfragebogen“ · „Schritt 2: Dokumente und Zeugnisse hochladen“ · „Schritt 3: Strukturiertes Bewerbungsformular“ · „Schritt 4: DINA4 Bewerbungsmappe zum Ausdrucken“; Ausgangsstand: die Frage selbst ist die Überschrift), Rückweg. Tabs wörtlich: „Übersicht“, „1. Fragebogen“, „2. Dokumente“, „3. Formular“, „4. DINA4 Mappe“; Eyebrow „Bewerbung und Karriereportal Wetzlar“. Der freie Wechsel zwischen fünf Tabs entfällt mit dem Ein-Flow bewusst (ROADMAP §6); die Aufgabe lebt vollständig (Fortschrittsanzeige mit `role="progressbar"` und `aria-valuetext`, Zurück per Schaltfläche und Browser-Verlauf). Nicht zurückführen: mobile Leiste mit nicht definierter Klasse `no-scrollbar` (Vermutung: Scrollleiste sichtbar), Prozentwert „25%“ als Schrittzähler. Lücke: Das Mappe-Werkzeug hat fünf nummerierte Abschnitte, aber weder Fortschritt noch Abschnittssprung (siehe E-BEW-006).
- Freiraum: Form, Ort, Tabs oder Schrittanzeige, Wortlaut der Schritttitel.
- Bindungen: `?schritt=` (`erfahrung`, `start`, `schule`, `aktuell`, `fuehrerschein`, `stelle`, `kontakt`) und `?stelle=`; Browser-Verlauf per `pushState`; Altstand: Tab-Wechsel änderte die URL nicht, `?tab=` wurde nur beim ersten Laden gelesen (siehe E-BEW-027).
- Priorität: Soll – Grund: Orientierungshilfe mit klarem Besuchernutzen; Zugänglichkeit im Ausgangsstand vorhanden.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/ui/StepHeader.tsx`, `components/apply/ApplyFlowClient.tsx`
- Gestaltung: folgt KERN (P2) · Idee: Schrittanzeige als Signatur-Element mit gleitender Markierung (siehe E-BEW-003).
- Abnahme: Auf jedem Schritt steht „Schritt n von m“, die Zurück-Geste geht einen Schritt zurück, `?schritt=kontakt` ohne Antworten landet auf dem ersten offenen Schritt (bestehende Tests `lib/apply/__tests__/flow.test.ts`) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-quiz__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung__d1440-light__01.webp`
- Status: offen
- Unsicherheit: keine

### E-BEW-003 · Aktiver-Tab-Glow, Ansichtswechsel und Knopf-Stil (Bewegung)
- Kategorie: Bewegung
- Quelle: ALT-BEW-012, 116, 242, 244, 265 · Altstand: `app/bewerbung/page.tsx:4, 181-187, 229-241, 299, 432-499`, `components/views/QuizView.tsx:4, 161, 208, 266, 329`, `app/globals.css:155-170`, `components/views/PrintA4View.tsx:245`, `package.json:27`, `components/BewerberCheckliste.tsx:4` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__01.webp` (aktiver Tab), Bewegung selbst nicht fotografierbar
- Zustand: verloren (+ Gegenstück nur als Reste: NEU-BEW-02 (Balken-Füllung `transition-transform duration-step ease-standard`), NEU-BEW-41 (Schrittwechsel `starting:translate-y-2 starting:opacity-0`), Knopf-Basis `active:scale-98` in `components/ui/variants.ts`; die Bibliothek `motion` wurde in a2f641d entfernt)
- Aufgabe: Bewegung gibt Rückmeldung über Position und Wechsel (wohin bin ich gesprungen) und macht Knöpfe spürbar; sie trägt keine eigene Information.
- Wesenskern: (1) Eine weiße Markierung gleitet zwischen den Tabs (`layoutId` „activeGlowTab“, Feder stiffness 350, damping 30). (2) Ansichtswechsel: Übersicht Y 10 → 0 px, andere Tabs X 10 → 0, Ausgang −10, 0,2 s, Modus wait; Quiz-Schritte wechselten ohne Übergang. (3) Knopf-Stil `btn-crimson-glow`: dunklerer Verlauf bei Hover, −1 px, Aktiv 0,99, 0,25 s, `cubic-bezier(0.16, 1, 0.3, 1)`. Muss bleiben: Bewegung ist Rückmeldung, nie Pflicht; reduzierte Bewegung wird respektiert (Ausgangsstand `app/globals.css:90-98`: nur Überblendung). Die Bibliothek `motion` (^14.0.0) kommt nicht zurück (Budget Bewegungs-JS ≤ 60 KB gzip, K-013).
- Freiraum: komplett offen: Umsetzung in CSS (`@starting-style`, View Transitions, Anker-Positionierung), Dauern, Kurven, Federgefühl.
- Bindungen: Bewegungs-Tokens (`duration-step`, `ease-standard`), `prefers-reduced-motion`; keine URLs.
- Priorität: Soll – Grund: prägende Bewegung (Kategorie Bewegung); Messung in P3.
- Entscheidung: Neu interpretieren
- Ziel in der Plattform: `components/ui/StepHeader.tsx` (gleitende Markierung als Segment-Fortschritt), `components/apply/ApplyFlowClient.tsx` (Schrittwechsel), `components/ui/variants.ts` (Knopf)
- Gestaltung: folgt KERN (P2, K-009) · Idee: Fortschrittsbalken als gefederte, nur CSS-getriebene Markierung, die beim Schrittwechsel zum neuen Segment gleitet.
- Abnahme: Wechsel zwischen zwei Schritten zeigt eine Bewegung ≤ 300 ms, bei `prefers-reduced-motion` nur Überblendung, kein neues JS-Paket (Bundle-Prüfung `scripts/qa/check-client-imports.mjs`) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung__d1440-light__01.webp` (Balken)
- Status: offen
- Unsicherheit: keine (Konfetti siehe E-BEW-022)

### E-BEW-004 · Diskretionszusage am Ort der Dateneingabe
- Kategorie: Vertrauen
- Quelle: ALT-BEW-068, 179, 277 · Altstand: `components/BewerberCheckliste.tsx:838-849`, `components/views/FormView.tsx:343-351`, `lib/email/templates/application-lead-notification.ts:140` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-formular__d1440-light__02.webp` (Datenschutzbox im Formular), `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__03.webp` (Kriterium „Diskretionsschutz“)
- Zustand: geschwächt (+ Gegenstück: NEU-BEW-36 („Dein Wechsel bleibt vertraulich: Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber.“ im Abschnitt „Lieber direkt sprechen?“ unter dem Flow), NEU-START-51, FAQ-Frage 1, Datenschutz `#bewerberdaten` (Sperrvermerk); `lib/content/process.ts` (`DISCRETION_PROMISE`, `getDiscretionPromise`); die Team-Mail hat keine Diskretionszeile)
- Aufgabe: Wechselwillige Fachkräfte erfahren, bevor sie Name und Telefon preisgeben, dass ihr Arbeitgeber nie kontaktiert wird; das Team wird beim Rückruf daran erinnert.
- Wesenskern: Belegt ist nur die Aussage „Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber.“ (Fakt `discretion`). Altstand-Wortlaut: Formular-Box „100% vertrauliche Behandlung nach § 26 BDSG garantiert“ · „Keine Rückfragen beim bisherigen Arbeitgeber. Deine Daten verbleiben ausschließlich bei Sabri Demir und dem Werkstattleiter der Bad und Energie GmbH“ […] (22 Wörter); Kriterium „Diskretionsschutz nach § 26 BDSG“ · „Vertrauliche Bewerbung ohne Benachrichtigung des aktuellen Arbeitgebers“ · „100% vertrauliche Bearbeitung durch Geschäftsführung garantiert“; Team-Mail-Zeile „Diskretion: Streng vertraulich (Ja)“ (sonst „Standard“). Nicht zurückführen: „100%“, „garantiert“, „ausschließlich bei Sabri Demir und dem Werkstattleiter“ (unbelegt; die Verstärker sind auch im Datenschutztext bewusst entfallen, `docs/operations/datenschutz-aenderungen.md` §2.5), den festen Wert `discretionGuaranteed` = wahr, den Verweis „§ 26 BDSG“ (siehe E-BEW-005). Bei der Ausbildung entfällt die Zusage (`getDiscretionPromise('ausbildung')` liefert `null`). Lücke: Im Ausgangsstand steht die Zusage unter dem Flow, nicht am Kontaktschritt, wo die Person ihre Daten angibt.
- Freiraum: Platz, Icon (ShieldCheck), Größe; Wortlaut nur aus `DISCRETION_PROMISE`.
- Bindungen: `lib/content/process.ts`, Fakt `discretion`, Datenschutz `#bewerberdaten`, `lib/email/templates/application-lead-notification.ts` (Team-Mail).
- Priorität: Muss – Grund: belegtes Vertrauenselement (Fakt `discretion`), Kernversprechen gegenüber Fachkräften in Anstellung.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: `components/apply/ContactStep.tsx`: eine Zeile mit Schild-Icon und `DISCRETION_PROMISE` direkt über dem Datenschutzhinweis (nicht bei Ausbildung); Team-Mail: eine Zeile „Diskretion“ nur bei Fachkraft und Quereinstieg (Wortlaut Team-Entscheidung, siehe Unsicherheit).
- Gestaltung: folgt KERN (P2) · Idee: eine ruhige Zeile mit Schild-Icon unmittelbar über „Bewerbung absenden“.
- Abnahme: Auf dem Kontaktschritt (Fachkraft, Quereinstieg) steht die Zusage ohne Scrollen über dem Absenden-Knopf, bei Ausbildung nicht; Text identisch mit `DISCRETION_PROMISE` (Fakten-Test) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-formular__d1440-light__02.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung__d1440-light__02.webp`
- Status: offen
- Unsicherheit: Ob die Team-Mail eine Diskretionszeile braucht, ist eine Betriebsfrage (OFFENE FRAGE); der Kontaktschritt ist im Bestand nicht fotografiert.

### E-BEW-005 · „§ 26 BDSG“-Siegel und Garantieformeln
- Kategorie: Recht
- Quelle: ALT-BEW-014, 216 · Altstand: `app/bewerbung/page.tsx:198-201`, `components/views/PrintA4View.tsx:404-406` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__01.webp` (Pille „Paragraph 26 BDSG geschützt“), `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp` (Fußzeile Blatt 1)
- Zustand: verloren (+ Gegenstück: NEU-BEW-26 (Hinweis „(Art. 6 Abs. 1 lit. b DSGVO)“ im Kontaktschritt), Datenschutz `#bewerberdaten` (§ 26 BDSG nur ergänzend); `docs/operations/datenschutz-aenderungen.md` §2.5 und Checkliste §6)
- Aufgabe: Der Rechtsbezug soll als Vertrauenszeichen zeigen, dass Bewerberdaten nach Beschäftigtendatenschutz behandelt werden.
- Wesenskern: Altstand-Wortlaut: Pille „Paragraph 26 BDSG geschützt“ (ShieldCheck, ab sm sichtbar, ohne Funktion) und Fußzeile Blatt 1 „Seite 1 von 2 (Bewerbungsschreiben)“ · „Vertraulich nach § 26 BDSG“. Der Ausgangsstand hat den Verweis bewusst ersetzt: Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO, § 26 BDSG nur ergänzend nach EuGH C-34/21; „garantiert“, „uneingeschränkt“, „absolut“ waren nicht belegbar (`datenschutz-aenderungen.md` Z. 16 und §2.5). Die DSB-Bestätigung steht aus (ROADMAP §6, §9 Punkt 7).
- Freiraum: –
- Bindungen: Datenschutz `#bewerberdaten`, `PRIVACY_NOTICE_VERSION` (`lib/applications/constants.ts`), Hinweis im Kontaktschritt (`components/apply/ContactStep.tsx`).
- Priorität: Muss – Grund: Kategorie Recht (keine gesetzliche Pflichtangabe; die Pflichtinformation steht im Datenschutzhinweis und ist vorhanden)
- Entscheidung: Zurückstellen
- Ziel in der Plattform: – (nach Freigabe: Wortlaut als Konstante in `lib/content`, nicht in Komponenten). Standardannahme bis zur Antwort: nicht zurückführen. Eintrag für MENSCHEN.md: Rechtsfrage DSB.
- Gestaltung: folgt KERN (P2) · Idee: falls freigegeben, eine kleine Zeile mit Schild-Icon statt der Pille.
- Abnahme: Entscheidung liegt vor und ist in `docs/operations/datenschutz-aenderungen.md` eingetragen; erst danach: Zeile erscheint nur im freigegebenen Wortlaut · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung__d1440-light__01.webp` (ohne Pille)
- Status: offen
- Unsicherheit: keine (klar verloren; Rechtsfrage offen)

### E-BEW-006 · Bewerber-Checkliste mit Sprungmarken
- Kategorie: Interaktives
- Quelle: ALT-BEW-030–034, 037, 043–055, 057–067, 184, 259, 298 · Altstand: `app/bewerbung/page.tsx:70-83, 322-325`, `components/BewerberCheckliste.tsx:116-168, 220-331, 390-398, 499-502, 515-583, 591-665, 670-692, 709-741, 768-837, 856-886, 899-933, 966-968`, `lib/recruiting-types.ts:88-98`, `components/views/FormView.tsx:43-59` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__02.webp` (Kategorien, Module), `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__03.webp` (Kriterien)
- Zustand: geschwächt (+ Gegenstück: NEU-BEW-02 (Fortschritt), NEU-BEW-18 bis NEU-BEW-22 (Feldfehler mit Fokus auf das erste fehlerhafte Feld), NEU-BEW-39 (Entwurf), NEU-MAPPE-03, -09, -11, -15, -19 (fünf nummerierte Mappe-Abschnitte mit Ankern `mappe-persoenliches`, `mappe-stelle`, `mappe-schwerpunkte`, `mappe-anschreiben`, `mappe-lebenslauf`), NEU-MAPPE-14 (Zähler „0 von 12 gewählt“))
- Aufgabe: Bewerber sehen, was ihre Bewerbung noch braucht, und springen direkt dorthin; das Unternehmen erhält vollständige Angaben.
- Wesenskern: Titel „Bewerbungscheckliste und Vollständigkeit“ · „Automatische Prüfung aller Pflichtangaben mit direktem Sprung in die entsprechenden Module.“ · Eyebrow „Reifegrad der Bewerbung“ · Knöpfe „DINA4 Bewerbungsmappe anzeigen“ und „Onlineformular öffnen“. Drei Kategorien mit Balken und Zähler: „Kontaktdaten“ („Name, Telefon und Wohnort erfasst“ · 3/3), „Berufliche Qualifikation“ („Erfahrung und Kompetenzen verifiziert“), „Konditionen & Starttermin“ („Frühester Starttermin hinterlegt“), je mit „Ansehen“, „Ausfüllen“ oder „Öffnen“. Vier Module: „Modul 01 Profilfragebogen“ („Kompetenzen und Anschreiben“), „Modul 02 Dokumentenablage“ („Gesellenbrief und Zeugnisse“), „Modul 03 Onlineformular“ („Stammdaten und Konditionen“), „Modul 04 DINA4 Bewerbungsmappe“ („Ausdruck und Meistersiegel“), Abschnitt „Verknüpfung mit den Modulen“ · „Direkter Absprung in Modul 01 bis 04“. Sprungmarken „Sprungmarken in das Onlineformular“ · „Noch N Pflichtfeld(er) mit direktem Tastatur-Fokus anspringen:“ · „Klick springt direkt ins Feld“ auf fünf Pflichtfelder („Vollständiger Name *“, „Telefonnummer oder WhatsApp *“, „Wohnort und Postleitzahl *“, „Berufserfahrung *“, „Frühester Starttermin *“) mit Fokus und 2-s-Ring (`scrollIntoView` smooth, Auslösung nach 150 ms). Sechs Kriterien mit „Erledigt“: „Lebenslauf oder Gesellenbrief hochladen“, „Wunschkonditionen & Arbeitszeitmodell“, „Verfügbarkeit und Kündigungsfrist“, „Fachschwerpunkte und Kernkompetenzen“ (mindestens 3), „Kontaktdaten und Rückrufkanal“, „Diskretionsschutz nach § 26 BDSG“ (siehe E-BEW-004); Abschnittskopf „Detaillierte Übersicht aller Kriterien“ · „N von 6 Kriterien erfüllt“; Hinweistext auf offenen Kriterienkarten „Klicke hier zur Erfassung:“ (ALT-BEW-298, führt zur Erfassung des fehlenden Kriteriums; gehört zu den Sprungmarken). Das Wesen: ehrlicher Stand aus echten Eingaben plus Sprung zum Fehlenden. Nicht zurückführen: Standardwerte (Gesamtwert 100 % ohne Eingabe, Kriterium 2 fest „Erledigt“, Kriterium 1 „erledigt“ durch eine vorbelegte Datei, „verifiziert“), „Meistersiegel“ (kein Siegel im Bewerbungspfad, Wahrheitsregel), Kontaktweg in Großbuchstaben („WHATSAPP“) aus dem internen Schlüssel. Im Ausgangsstand lebt: Pflichtfeld-Fehler mit Fokus im Flow, Fortschritt „Schritt n von m“. Es fehlt: ein Stand mit Sprung für das Mappe-Werkzeug (fünf Abschnitte, kein Fortschritt).
- Freiraum: Zahl und Art der Kategorien (Vorschlag: ein Stand für die Mappe mit fünf Einträgen: Persönliches, Stelle, Schwerpunkte, Anschreiben, Berufserfahrung und Ausbildung), Karten, Listen, Icons; der Sprung darf ein Anker sein.
- Bindungen: Ankerids der Mappe-Abschnitte (`mappe-persoenliches` bis `mappe-lebenslauf`); Altstand-IDs `field-fullName` bis `field-notes` und der interne Feldparameter waren intern, nie in URLs (keine eingehenden Links).
- Priorität: Soll – Grund: interaktives Element mit klarem Besuchernutzen; der Geschäftswert (Bewerbung) hängt nicht daran.
- Entscheidung: Neu interpretieren
- Ziel in der Plattform: `components/mappe/MappeTool.tsx` (neue Komponente „Mappe-Stand“ mit Sprungankern neben den Aktionen); Daten ausschließlich aus dem Editor-Zustand (`lib/mappe/editor.ts`, `isMappeEmpty`, `serializeMappe`)
- Gestaltung: folgt KERN (P2) · Idee: Liste der fünf Abschnitte mit Haken oder „offen“ und Sprung, darüber der Ring aus E-BEW-007.
- Abnahme: Leere Mappe zeigt „0 von 5 erledigt“, jeder Eintrag springt zum Abschnitt und setzt den Fokus auf das erste Feld, Eingaben setzen Haken ohne Neuladen; keine Beispiel- oder Platzhalterdaten · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__02.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__01.webp`
- Status: offen
- Unsicherheit: verloren oder nur verschoben? Die Pflichtangaben-Prüfung lebt im Flow (Feldfehler, Fokus); die modulübergreifende Vollständigkeitsprüfung hat kein Gegenstück, weil es die Module nicht mehr gibt. Ob die optionale Mappe überhaupt einen Stand braucht, ist eine Produktentscheidung (OFFENE FRAGE).

### E-BEW-007 · Vollständigkeits-Gauge (Radial-SVG)
- Kategorie: Grafik und SVG
- Quelle: ALT-BEW-035–036, 038–042 · Altstand: `components/BewerberCheckliste.tsx:197, 340-370, 377-387, 407-493` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__02.webp` (Ring „100% Vollständig“, Abzeichen „Vollständig bereit“)
- Zustand: verloren (+ Gegenstück: keines; im Ausgangsstand gibt es nur den linearen Balken des `StepHeader`, keinen Ring)
- Aufgabe: Ein einziges Zeichen macht den Stand der Bewerbung auf einen Blick lesbar und belohnt Fortschritt.
- Wesenskern: Ring-SVG: `viewBox` 0 0 160 160, `aria-hidden`, Kreis r 64, Strichstärke 11, Umfang 402,12, um −90° gedreht (Start oben), Strich mit Verlauf in drei Stopps je Stand; Strichfarbe nach Stand (≥ 90 Grün, ≥ 65 Blau, ≥ 40 Amber, sonst Rot); Strichlänge animiert vom Vollkreis zum Zielwert, 1,0 s, easeOut; Mitte „[N]%“ über „Vollständig“; Abzeichen „Vollständig bereit“ (≥ 90) · „Hoher Reifegrad“ (≥ 65) · „Angaben unvollständig“ (≥ 40) · „Basisprofil“ (darunter); Weichzeichner-Kreis in Statusfarbe (Deckkraft 20 %) hinter dem Ring; Eyebrow „Vollständigkeitsprüfung“ mit Pulspunkt, Titel „Vollständigkeitsgrad des Bewerberdossiers“. Nicht zurückführen: feste Gradient-ID „gaugeGrad“ (Vermutung: Doppel-ID bei zwei Instanzen), Dauerpuls (`animate-pulse`) ohne Bedeutung, Hinweis „Echtzeitübertragung in DINA4 Bewerbungsmappe“ (es ist nur ein Browser-Speicher), Wert aus Platzhalterdaten, nur-optischer Wert ohne Textalternative.
- Freiraum: Größe, Strichstärke, Farben aus Tokens statt festen Hexwerten, Schwellen, Beschriftung; Animation als CSS (`stroke-dashoffset`) statt JS.
- Bindungen: Eingabewert = Anteil erledigter Abschnitte aus E-BEW-006; eindeutige IDs per `useId`; Budget Icon-SVG ≤ 1,5 KB, Illustrations-SVG ≤ 40 KB gzip (K-013).
- Priorität: Soll – Grund: prägende Grafik und Bewegung (SVG mit eigener Aufgabe: Stand lesbar machen).
- Entscheidung: Neu interpretieren
- Ziel in der Plattform: neue Komponente `components/ui/ProgressRing.tsx` (SVG, ohne JS-Animation), eingebunden im `MappeTool` neben `MappeActions`
- Gestaltung: folgt KERN (P2, K-010) · Idee: dünner Ring mit Ziffer in der Mitte, der Strich zeichnet sich einmal beim Erscheinen und bei jedem Fortschritt nach.
- Abnahme: Ring zeigt „0 %“ bei leerer Mappe und „100 %“ erst bei fünf gefüllten Abschnitten; `stroke-dashoffset` entspricht dem Anteil (DOM-Messung); Wert als Text für Screenreader (`role="meter"` oder `progressbar`); SVG ≤ 1,5 KB · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__02.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__01.webp` (Zielort rechts oben)
- Status: offen
- Unsicherheit: keine

### E-BEW-008 · Regionalband „Einsätze ohne Fernmontage“
- Kategorie: Inhalt
- Quelle: ALT-BEW-073–079 · Altstand: `app/bewerbung/page.tsx:395-425` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__04.webp`
- Zustand: verschoben (+ Gegenstück: NEU-START-34 bis NEU-START-45 (Einsatzgebiet, Radiusgrafik, Ortsliste), NEU-BEW-35 (Kontaktkanäle und Öffnungszeiten unter dem Flow); `lib/content/region.ts`, `lib/data/locations.ts`)
- Aufgabe: Vor der Entscheidung zeigt die Seite Ort, Einsatzgebiet, Arbeitszeiten und Partner, damit Bewerber die Machbarkeit (Anfahrt, Alltag) einschätzen.
- Wesenskern: „Regionale Festanstellung“ · „Einsätze ohne Fernmontage“ · „Unsere Monteure sind täglich im Raum Wetzlar, Gießen und dem Lahn Dill Kreis im Einsatz. Keine Hotelübernachtungen, kein unnötiger Fahrstress.“ […] (27 Wörter); sieben Orte „Wetzlar“, „Gießen“, „Aßlar“, „Solms“, „Hüttenberg“, „Lahnau“, „Ehringshausen“; Infoboxen „Betriebsstandort“ („Siegmund-Hiepe-Str. 20, 35578 Wetzlar nahe B49 und A45“), „Arbeitszeiten“ („Montag bis Donnerstag 07:00 bis 16:45 Uhr, freitags ab 13:30 Uhr Wochenende“), „Systempartner“ („Buderus, Bosch, NIBE, Alpha Innotec, Viessmann & ELEMENTS“). Belegt im Ausgangsstand: Radius und Region (NEU-START-34, -35), Arbeitszeiten (Fakt `workingHours`: „Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr“), Partner (Fakt `heatPumpBrands`). Nicht belegt oder abweichend: „nahe B49 und A45“ (Vermutung, kein Fakt), die vier Orte Solms, Hüttenberg, Lahnau und Ehringshausen (nur in `lib/seo/site-config.ts`, nicht in `lib/data/locations.ts`; `fakten-abgleich.md` B17), „& ELEMENTS“ als Systempartner (die FAQ führt ELEMENTS als Bad-Partner, B15). Lücke: Die Fokus-Seite `/bewerbung` (Header Logo und „Abbrechen“, schlanker Fuß) zeigt weder Standort noch Einsatzgebiet noch Partner.
- Freiraum: Form, Umfang (eine Faktenzeile genügt), Reihenfolge.
- Bindungen: Fakten `radius35`, `noFarAssembly`, `workingHours`, `heatPumpBrands` (`lib/content/facts.ts`); `COMPANY.address`; Anker `/#einsatzgebiet` auf der Startseite.
- Priorität: Soll – Grund: Inhalt mit Besuchernutzen; das Wesen lebt auf Startseite und Stellenseiten, auf der Fokus-Seite ist es Zusatzvertrauen.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: `app/bewerbung/page.tsx`, Abschnitt „Lieber direkt sprechen?“: eine Faktenzeile aus `FACTS` (Radius, Arbeitszeiten, Adresse) mit Link auf `/#einsatzgebiet`; die Ortsliste bleibt auf der Startseite.
- Gestaltung: folgt KERN (P2) · Idee: dreiteilige Faktenzeile (Standort · Arbeitszeiten · Einsatzgebiet) unter den Kontaktkanälen.
- Abnahme: Die drei Fakten stehen unterhalb des Flows, Texte stammen aus `facts.ts` (Fakten-Test), Link `/#einsatzgebiet` erreichbar · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__04.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung__d1440-light__02.webp`
- Status: offen
- Unsicherheit: Ob Solms, Hüttenberg, Lahnau und Ehringshausen zum Einsatzgebiet zählen, ist offen (`fakten-abgleich.md` B17; OFFENE FRAGE); „möglicherweise veraltet“ gilt für Öffnungszeiten und Adresse.

### E-BEW-009 · Profilfragebogen (Quiz): Fachposition und Kenntnisse
- Kategorie: Interaktives
- Quelle: ALT-BEW-080–081, 085–100, 296 · Altstand: `components/views/QuizView.tsx:29-62, 130-135, 142-145, 163-203, 211-261`, `lib/recruiting-types.ts:58`, `app/bewerbung/page.tsx:290, 334`, `app/bewerbung/layout.tsx:9` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-quiz__d1440-light__01.webp` (Schritt 1), `_relaunch/belege/p0-altstand/alt-bewerbung-quiz__m375-light__02.webp` (Positionskarten mobil); Schritt 2 im Bestand nicht fotografiert
- Zustand: verschoben (+ Gegenstück: Flow-Schritt „Stelle“ (NEU-BEW-04 bis NEU-BEW-10), Flow-Fragen (NEU-BEW-12 bis NEU-BEW-16), Mappe-Schritt 3 „Schwerpunkte“ (NEU-MAPPE-11 bis NEU-MAPPE-14); `components/apply/steps.tsx`, `lib/apply/questions.ts`, `components/mappe/SkillsSection.tsx`, `lib/mappe/options.ts` (`SKILL_OPTIONS`))
- Aufgabe: Mit wenigen Antworten sagen Bewerber, auf welche Position sie sich bewerben und was sie fachlich können; das Unternehmen erhält ein erstes fachliches Profil.
- Wesenskern: „Interaktiver Profilfragebogen“ · „Beantworte 3 kurze Fragen zu Deinem Handwerk. Unser System generiert automatisch Dein Profil und Dein Anschreiben.“ Frage 1 „Welche Position entspricht Deinem Werdegang?“ · „Wähle Deinen angestrebten Schwerpunkt bei der Bad und Energie GmbH Lahn Dill.“ mit vier Karten: „Anlagenmechaniker SHK m w d“ („Heizungsneubau, Wärmepumpen und Badsanierungen“), „Kundendienstmonteur SHK m w d“ („Wartung, Inbetriebnahme Buderus, Bosch, NIBE, Alpha Innotec, Viessmann“), „Auszubildender SHK Start 2026“ („Zukunftssicherer Ausbildungsplatz mit Meisterbegleitung“), „Quereinsteiger und Montagehelfer“ („Handwerkliches Geschick mit intensiver Einarbeitungsphase“). Frage 2 „Welche Praxiserfahrung bringst Du mit?“ · „Wähle alle Bereiche aus, in denen Du bereits selbstständig gearbeitet hast.“ mit sechs Kenntnissen, im Ausgangsstand wortgleich in `SKILL_OPTIONS`: „Wärmepumpen Luft/Wasser (Buderus, Bosch, NIBE, Alpha Innotec, Viessmann)“, „Badsanierung und Vorwandinstallation“, „Gasbrennwert und Heizungsmodernisierung“, „Trinkwasserhygiene und Filtertechnik CONEL“, „Störungssuche und elektrische Verdrahtung“, „Führerschein Klasse B PKW“. Knöpfe „Weiter zu Praxiserfahrung“, „Zurück“, „Weiter zu Arbeitsstil“. Das Wesen lebt: Position im Flow wählbar (jetzt sechs Optionen inkl. Obermonteur und Initiativbewerbung), Erfahrung im Flow („Was trifft auf dich zu?“), Kenntnisse in der Mappe (Mehrfachauswahl bis 12 plus „Eigener Schwerpunkt“). Nicht zurückführen: „3 kurze Fragen“ / „4 kurze Fragen“ / „4-Schritte-Fragebogen“ (widersprüchliche Zählung), „Start 2026“ als feste Jahreszahl (Zeitbezug, möglicherweise veraltet; Ausgangsstand: „Ausbildung 2026: Einstieg noch möglich“), „generiert automatisch“ (Textbausteine), Standardposition, die keiner Karte entspricht, Karten ohne Tastaturbedienung. Lücke: Die Positionsbeschreibungen stehen auf den Auswahlkarten des Flows nicht; ein geführter Ablauf „eine Frage je Screen“ fehlt im Mappe-Werkzeug (es ist ein langes Formular).
- Freiraum: Kartenform, Reihenfolge, ob Kenntnisse im Flow oder in der Mappe abgefragt werden, Beschreibungszeilen.
- Bindungen: Option-IDs in `lib/apply/questions.ts` („nie umbenennen, nur ergänzen“); `mappe.skills` (höchstens 12, je ≤ 120 Zeichen) im Payload; `?stelle=<slug>|initiativ`.
- Priorität: Soll – Grund: interaktives Element mit klarem Besuchernutzen.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/apply/steps.tsx`, `components/mappe/SkillsSection.tsx`
- Gestaltung: folgt KERN (P2) · Idee: je Stellenkarte eine Beschreibungszeile aus dem Registry-Kurztext, auf dem Handy die Mappe-Abschnitte als geführte Schritte.
- Abnahme: Alle sechs Kenntnisse lassen sich in der Mappe an- und abwählen und erscheinen in Vorschau und Payload (`e2e/mappe.spec.ts`, `lib/mappe/__tests__/serialize.test.ts`); alle sechs Stellenoptionen sind im Flow wählbar · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-quiz__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung__d1440-light__01.webp` und `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__02.webp`
- Status: offen
- Unsicherheit: keine

### E-BEW-010 · Arbeitsstil und Anschreiben-Vorlage
- Kategorie: Inhalt
- Quelle: ALT-BEW-101–106, 111, 115 · Altstand: `components/views/QuizView.tsx:66-83, 103-123, 269-324, 359-366` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp` (Anschreiben-Text im Dossier); Quiz-Schritt 3 im Bestand nicht fotografiert
- Zustand: verschoben (+ Gegenstück: NEU-MAPPE-15 bis NEU-MAPPE-18; `components/mappe/LetterSection.tsx`, `lib/mappe/template.ts` (`buildCoverLetter`), `lib/mappe/options.ts` (`WORK_STYLES`), `lib/mappe/editor.ts` (`resolveCoverLetter`))
- Aufgabe: Aus einer Stilwahl entsteht ein passendes, änderbares Anschreiben; Bewerber ohne Schreibroutine sparen Aufwand, das Unternehmen erhält ein vollständiges Anschreiben.
- Wesenskern: Frage „Was zeichnet Deinen Arbeitsstil aus?“ · „Hieraus formuliert der Generator Dein passgenaues Anschreiben für Sabri Demir.“ mit drei Karten: „Höchste Ausführungsqualität und Sauberkeit“ („Ich lege Wert auf saubere Trassen, akkurate Isolierung und respektvollen Kundenkontakt.“), „Technologie und Energiewende“ („Ich brenne für regenerative Systeme, Hydraulikabgleich und digitale Heizungssteuerungen.“), „Teamgeist und Zuverlässigkeit“ („Gute Stimmung auf Montage, klare Kommunikation mit dem Meister und verlässliche Absprachen.“), je mit Textbaustein („Qualitätsorientiert und sauber: Baustellen verlassen wie vorgefunden, exakte Rohrisolierung, zufriedene Kunden.“ usw.); Knöpfe „Zurück“, „Profil jetzt erstellen“. Briefvorlage (61 Wörter): „Sehr geehrter Herr Demir, mit großem Interesse bewerbe ich mich als POSITION bei der Bad und Energie GmbH Lahn Dill“ […] mit Platzhaltern POSITION, STIL, SKILLS, NAME; Feld „Generiertes Anschreiben“. Im Ausgangsstand wortgleich bis auf den Kartentitel „Ausführungsqualität und Sauberkeit“ (ohne „Höchste“), den Anschreibensatz (Position als Titel statt langer Quiz-ID, keine leere Aufzählung „Fachschwerpunkte: .“, kein Rückfall „Alexander Koch“) und neu: das Anschreiben passt sich an, bis die Person es selbst ändert; „Text neu aus der Vorlage erstellen“ mit „Rückgängig“. Nicht zurückführen: „Generator“ und „System generiert automatisch“ (es sind Textbausteine, kein Generator), Grußformel „Mit handwerklichen Grüßen“ im Standardtext (Quiz-Vorlage nutzt „Mit freundlichen Grüßen“), Fallback-Name.
- Freiraum: weitere Stile, Ton, Kartengestaltung, Reihenfolge der Absätze.
- Bindungen: `mappe.workStyle` (≤ 300 Zeichen) und `mappe.coverLetter` (≤ 6000 Zeichen) im Payload; Stil-IDs `qualitaet`, `technik`, `team` (`WORK_STYLE_IDS`); Anrede „Sehr geehrter Herr Demir,“ aus `getMappeRecipient()` (Titel offen, E-BEW-031).
- Priorität: Soll – Grund: Inhalt und interaktives Element mit klarem Besuchernutzen.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/mappe/LetterSection.tsx`, `lib/mappe/template.ts`
- Gestaltung: folgt KERN (P2) · Idee: Stilkarten mit eigener Typografie-Anmutung, Anschreiben als Papierblatt mit ruhiger Serifenschrift.
- Abnahme: Die Wahl eines Stils ändert das Anschreiben sofort; eigene Änderung stoppt die Automatik; „Text neu aus der Vorlage erstellen“ stellt die Vorlage her, „Rückgängig“ den eigenen Text (`lib/mappe/__tests__/template.test.ts`, `e2e/mappe.spec.ts`) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__03.webp`
- Status: offen
- Unsicherheit: keine

### E-BEW-011 · Quiz-Ergebnis „Dein Bewerbungsprofil“ und Übernahme
- Kategorie: Funktion
- Quelle: ALT-BEW-108–110, 112–114 · Altstand: `components/views/QuizView.tsx:337-357, 368-402`, `lib/recruiting-types.ts:58` · Bild: – (Ergebnisschritt im Bestand nicht fotografiert)
- Zustand: verschoben (+ Gegenstück: NEU-MAPPE-29 bis NEU-MAPPE-31 (Live-Vorschau mit Anschreiben und Lebenslauf), NEU-MAPPE-25 („Mit dieser Mappe bewerben“, Übergabe an den Flow); `components/mappe/MappePreview.tsx`, `components/mappe/MappeActions.tsx`)
- Aufgabe: Am Ende sehen Bewerber ihr zusammengefasstes Profil und gehen mit einem Klick weiter (Kontaktdaten ergänzen oder Mappe).
- Wesenskern: „Dein Bewerbungsprofil für Bad und Energie GmbH“; Felder „Angestrebte Position“, „Generiertes Anschreiben“, „Extrahierte Kernkompetenzen (n)“ mit Chips; Textlink „Neu konfigurieren“; Knöpfe „Kontaktdaten im Formular ergänzen“ und „Direkt in die DINA4 Bewerbungsmappe übernehmen“. Im Ausgangsstand lebt die Aufgabe über die Live-Vorschau (Betreff = Position, Anschreiben, Schwerpunkte-Liste) und die Übergabe: „Mit dieser Mappe bewerben“ legt die Mappe in `be:mappe:v1` und führt mit der gewählten Stelle in den Flow. Nicht zurückführen: „Extrahierte“ (es gibt keine Extraktion, nur die gespeicherte Auswahl), „übernehmen“ als reiner Ansichtswechsel (nichts wurde übernommen), Standardwerte.
- Freiraum: Form der Zusammenfassung (Seitenvorschau genügt), Wortlaut der Knöpfe.
- Bindungen: sessionStorage-Schlüssel `be:mappe:v1` (`STORAGE_KEYS.mappe`) und `be:mappe-editor:v1`; `?stelle=` beim Wechsel in den Flow.
- Priorität: Soll – Grund: Funktion mit klarem Besuchernutzen.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/mappe/MappeTool.tsx`
- Gestaltung: folgt KERN (P2) · Idee: Vorschau und Aktionen bleiben nebeneinander, die Übergabe-Taste wird zum eindeutigen Hauptknopf.
- Abnahme: Nach der Wahl von Stelle, Schwerpunkten und Stil zeigt die Vorschau Betreff, Anschreiben und Schwerpunkte; „Mit dieser Mappe bewerben“ führt mit vorgewählter Stelle in den Flow (`e2e/mappe.spec.ts`) · Bildpaar alt – (nicht fotografiert) / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__01.webp`
- Status: offen
- Unsicherheit: keine

### E-BEW-012 · Dokumenten-Tresor: Unterlagen hochladen (Lebenslauf, Zeugnisse, Nachweise)
- Kategorie: Funktion
- Quelle: ALT-BEW-117–121, 130–138, 150, 153–159, 161–164, 238, 246, 295 · Altstand: `components/views/VaultView.tsx:45-74, 102, 156-160, 203-233, 337-368, 373-401, 517-538, 548-565, 570-610, 625-681`, `lib/recruiting-types.ts:88-98`, `components/views/PrintA4View.tsx:573-588`, `package.json:50` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-tresor__d1440-light__01.webp` (Kopf, Foto, Lebenslauf-Zone), `_relaunch/belege/p0-altstand/alt-bewerbung-tresor__d1440-light__02.webp` (Nachweise, Dokumentenliste), `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__03.webp` (Anlagenverzeichnis)
- Zustand: geschwächt (+ Gegenstück: NEU-DANKE-26 bis NEU-DANKE-28 („Unterlagen schicken“ per WhatsApp und per E-Mail, mit Bewerbungsnummer), NEU-DANKE-25 („Bewerbungsmappe ergänzen (optional)“), NEU-BEW-24 (Mappe wird mitgeschickt). Vorbereitung in der Datenbank, aber ohne Schnittstelle: `supabase/migrations/20261008132741_ats_core.sql` (Tabelle `application_files`: Kategorie cv, certificate, photo, other; MIME PDF, JPEG, PNG, HEIC, HEIF, WebP; ≤ 10 MiB; SHA-256; Status pending, verified, rejected), `20261008132748_storage.sql` (privater Bucket `application-files`, bewusst ohne Upload-Policies), `supabase/config.toml`. Es gibt weder `lib/uploads/**` noch eine Upload-Route noch eine Oberfläche.)
- Aufgabe: Bewerber reichen Unterlagen (Lebenslauf, Gesellenbrief oder Zeugnis, Führerschein, Zertifikate) ein, ohne selbst E-Mails zu schreiben; das Unternehmen erhält sie der Bewerbung zugeordnet.
- Wesenskern: Im Altstand war der Upload nur vorgetäuscht: Dateien wurden nie übertragen (nur Name, Größe, Typ, Kategorie, Zeitpunkt und der feste Status „verified“ im localStorage; ALT-BEW-151, -152). Das Wesen ist „Unterlagen einreichen können“. Wortlaut: Badge „Alternative zum Fragebogen · Sofortiger Direkt-Upload“, Überschrift „Lebenslauf, Foto & Dokumente direkt hochladen“, Lebenslauf-Zone „Lebenslauf hier ablegen oder Durchsuchen“ · „Lebenslauf Datei auswählen (PDF)“ · „Maximal 25 MB“, Abschnitt „Weitere Dokumente (Gesellenbrief, Führerschein, Zertifikate)“ mit Dropzone „Weitere Nachweise hier hineinziehen oder Durchsuchen“ · „Dateien vom Gerät wählen“, drei Hinweiskarten „Gesellenbrief oder Zeugnis“ („Abschlussprüfung SHK oder Facharbeiterzertifikat“ · „Optional (auch ohne Nachweis möglich)“), „Führerschein B oder BE“ („Für Kundendienst und Werkstatttransporter“ · „Wichtig für Montagefahrzeuge“), „Zertifikate Bosch und Partner“ („Wärmepumpenschein, Kälteschein, DGUV“), Dokumentenliste mit „Datei entfernen“, Leerzustand „Noch keine Dokumente hochgeladen. Ziehe Dateien oben in das Feld.“, Fehlertexte („Ungültiges Dateiformat bei „[Name]“. Bitte nur PDF, JPG oder PNG hochladen.“ · „„[Name]“ ist zu groß ([Größe]). Maximal 25 MB erlaubt.“), Links „DINA4 Mappe öffnen“, „Zum Profilfragebogen wechseln“, „In DINA4 Bewerbungsmappe zusammenstellen“. Nicht zurückführen: „PDF, DOCX oder JPG“ (DOCX wurde nie akzeptiert; WebP wurde akzeptiert, aber nicht genannt), „in unter 30 Sekunden“, „Alle Dokumente werden verschlüsselt gespeichert“, „Fließt in Einstufung & Boni ein“ (keine Logik, unbelegt), „Status: Verifiziert“ und „Bereit“ (E-BEW-033), Kategorie-Raten per Dateiname (Teilstring „cv“ und andere; Vermutung: Fehlzuordnungen), Dropzone ohne Tastaturzugang, die Fehlerbox-Einblendung (`animate-in fade-in`, Vermutung: wirkungslos), das Anlagenverzeichnis „[n] Nachweise beigefügt“ · „✓ verifiziert“ im Lebenslauf (nur mit echter Übertragung und echtem Status). Ehrliche Grenzen laut Architektur (ROADMAP §8.1): signierte Upload-URLs direkt zu Supabase Storage (umgeht das 4,5-MB-Limit), PDF/JPG/PNG/HEIC/WEBP, höchstens 5 × 10 MB, Magic-Byte-Prüfung (`lib/uploads/sniff.ts`) und SHA-256, verwaiste Uploads nach 24 h löschen.
- Freiraum: Dropzone oder Auswahlknopf, Reihenfolge, Hinweiskarten, Fehlertexte; Größen und Formate nach Architektur (10 MB, HEIC), nicht nach Altstand (25 MB).
- Bindungen: Bewerbungsnummer `BE-26-…` und Prüfschlüssel (HMAC, 14 Tage) aus der Antwort von `/api/bewerbung`, wie bei `/api/bewerbung/ergaenzung`; Tabelle `application_files`, Bucket `application-files`; Datenschutz: der Abschnitt `#bewerberdaten` muss vor dem Go-live von Phase 2 angepasst werden (`datenschutz-aenderungen.md` §2.5 „Hinweis Phase 2“); sessionStorage `be:application:v1`; eingehender Link `/bewerbung?tab=vault` (E-BEW-027). Zuständigkeit: `lib/uploads/**` und die Upload-API gehören der Session „Supabase-Vollintegration“ (ROADMAP §8.1); gemeinsame Verträge in `lib/applications/*` nur nach Absprache.
- Priorität: Muss – Grund: Funktion mit Geschäftswert (Bewerbung); Meta-Titel „Bewerbung & Dokumenten-Upload“ und die Startseiten-Schaltfläche des Altstands versprachen sie; ROADMAP §6: „ab Phase 2 als Upload“.
- Entscheidung: Rückführen
- Ziel in der Plattform: (1) Schnittstelle: ein Vertrag `UploadAdapter` (Sitzung für Bewerbungsnummer und Prüfschlüssel anlegen, signierte URLs je Datei, Abschluss melden) in der Architektur von Phase 2 (Ort nach Absprache mit der Phase-2-Session). (2) Oberfläche als Variante von `components/apply/thanks/ThankYouView.tsx` (Abschnitt `danke-unterlagen`) mit Dropzone, Dateiliste, Entfernen und den Fehlertexten oben; optional später im Kontaktschritt „Lebenslauf anhängen“ (Weg A). (3) Prüfung gegen Attrappe (Browser-Anfragesperre G5): Das Test-Double beantwortet die schreibenden Anfragen; im Betrieb bleibt die Funktion ehrlich abgeschaltet („Hochladen ist noch nicht verfügbar. Schick uns die Unterlagen per WhatsApp oder E-Mail.“), bis die echte Anbindung (Supabase-Projekt, Secret-Key, Magic-Byte-Prüfung, Datenschutztext, Aufbewahrung) steht. Der Rest gehört in MENSCHEN.md.
- Gestaltung: folgt KERN (P2) · Idee: ruhige Dropzone im Stil der Auswahlkarten mit Dateiliste, Größenangabe und einem klaren „Per WhatsApp stattdessen“-Ausweg.
- Abnahme: Mit Attrappe: Dateien wählen zeigt Liste und Fortschritt, falscher Typ und Größe über 10 MB zeigen die Fehlertexte; im Betrieb ohne Anbindung steht der ehrliche Hinweis und es erscheint kein Erfolgs- oder Verifiziert-Status (DOM enthält weder „verifiziert“ noch „beigefügt“). Nach Phase 2b: Datei erscheint im Cockpit mit signierter URL · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-tresor__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-danke__d1440-light__01.webp` (Zustand ohne Bewerbung; Abschnitt „Unterlagen schicken“ im Bestand nicht fotografiert)
- Status: offen
- Unsicherheit: keine zum Zustand (der Upload existiert im Ausgangsstand nicht, nur die Datenbank-Vorbereitung); offen: ob HEIC-Dateien und das Bewerbungsfoto (E-BEW-013) in Phase 2 angenommen werden (OFFENE FRAGE).

### E-BEW-013 · Bewerbungsfoto
- Kategorie: Funktion
- Quelle: ALT-BEW-123–129, 172, 190, 222–223, 294 · Altstand: `components/views/VaultView.tsx:97-115, 268-289, 301-322, 327-330`, `components/views/FormView.tsx:199-240`, `components/views/PrintA4View.tsx:45-51, 213-221, 448-482` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-tresor__d1440-light__01.webp` (Foto-Karte), `_relaunch/belege/p0-altstand/alt-bewerbung-formular__d1440-light__01.webp` (Foto im Formular), `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp` (Foto-Feld im Lebenslauf)
- Zustand: verschoben (+ Gegenstück: NEU-MAPPE-08 („Foto (optional)“, „Foto hinzufügen“, „Foto ändern“, „Foto entfernen“, lokale Vorschau), Foto im Lebenslauf der Vorschau (`components/mappe/MappePreview.tsx`, `mappe.module.css` `.photo`); `components/mappe/PersonalSection.tsx`)
- Aufgabe: Bewerber können optional ein Foto in den tabellarischen Lebenslauf einbetten.
- Wesenskern: Karte „Bewerbungsfoto“ · „Format 3:4“, Platzhalter „Kein Foto gewählt“, Hinweis „Wird automatisch in Deinen tabellarischen DINA4 Lebenslauf eingebettet.“, Knöpfe „Foto auswählen“ / „Foto ändern“ / „Entfernen“, Fuß „Optional · Handyschnappschuss genügt“; Formular-Variante „Bewerbungsfoto für tabellarischen Lebenslauf“ · „Optional · Format 3:4“ · „Foto geladen und im DINA4 Dossier aktiv“; Lebenslauf-Feld „Foto hinzufügen“ · „(Optional)“; Formate JPG, PNG, WebP; Fehlertext „Bitte wähle eine gültige Bilddatei (JPG, PNG oder WebP).“ (Altstand als nativer `alert()`). Im Ausgangsstand lebt: optionales Foto, Vorschau im Lebenslauf, Entfernen, Formate JPG/PNG/WebP, Fehlertext als `role="alert"` („Bitte wähl ein Foto im Format JPG, PNG oder WebP.“), Hinweis „Das Foto bleibt auf deinem Gerät. Es wird weder gespeichert noch gesendet und ist nach dem Neuladen weg.“ Nicht zurückführen: Foto als Base64 im localStorage (Speichergrenze, Datenschutz), Entfernen-Knopf nur bei Hover sichtbar (Tastatur und Touch), Foto-Platzhalter im Druck, Foto ohne Größenprüfung. Lücke: Das Foto wird nie übertragen; die Tabelle `application_files` kennt die Kategorie `photo` bereits (siehe E-BEW-012).
- Freiraum: Platz im Lebenslauf, Zuschnitt, Vorschaugröße; ob die Beruhigung „Handyschnappschuss genügt“ zurückkommt.
- Bindungen: Foto nur im Arbeitsspeicher (`URL.createObjectURL`), Datenschutz `#entwurf` („Foto nur im Arbeitsspeicher“); AGG: Foto bleibt freiwillig.
- Priorität: Soll – Grund: interaktives Element mit klarem Besuchernutzen; das Wesen lebt.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/mappe/PersonalSection.tsx`, `components/mappe/MappePreview.tsx`
- Gestaltung: folgt KERN (P2) · Idee: Fotofeld im Lebenslauf als ruhiger Rahmen mit Hinweis „optional“.
- Abnahme: Foto wählen zeigt Vorschau im Lebenslauf, Entfernen löscht sie, ein PDF-Datei-Versuch zeigt die Fehlermeldung (`role="alert"`), nach Neuladen ist das Foto weg · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__01.webp`
- Status: offen
- Unsicherheit: Ob ein Foto in Phase 2 übermittelt werden soll, ist eine Owner-Entscheidung (OFFENE FRAGE).

### E-BEW-014 · Expressbewerbung mit Name und Telefon (Absenden)
- Kategorie: Funktion
- Quelle: ALT-BEW-140–149, 292 · Altstand: `components/views/VaultView.tsx:151-162, 169-181, 189-192, 414-511`, `lib/recruiting-types.ts:142-143`, `components/BewerberCheckliste.tsx:756-757`, `app/api/bewerbung/route.ts:8-17` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-tresor__d1440-light__02.webp` (Name, Telefon, E-Mail, Status, Knopf)
- Zustand: verschoben (+ Gegenstück: NEU-BEW-17 bis NEU-BEW-32 (Kontaktschritt „Wie erreichen wir dich?“: Name und Telefon als Pflicht, Kontaktweg, E-Mail optional, Honeypot, Datenschutzhinweis, „Bewerbung absenden“, Fehlerpanel), NEU-DANKE-01 bis -16; `components/apply/ContactStep.tsx`, `lib/apply/contact-schema.ts`, `lib/apply/submit.ts`, `app/api/bewerbung/route.ts`)
- Aufgabe: Bewerber schicken mit Name und Telefonnummer sofort eine Bewerbung ab; das Unternehmen meldet sich vertraulich zurück.
- Wesenskern: „Expressbewerbung mit Lebenslauf direkt absenden“ · „Gib nur kurz Deinen Namen und Deine Nummer an – wir melden uns vertraulich bei Dir.“ (15 Wörter); Felder „Dein Name *“, „Telefon oder WhatsApp *“, „E-Mail (optional)“; Statuszeile „Status Deiner Bewerbungsunterlagen:“ · „✓ [n] Datei(en) angehängt“ bzw. „Noch keine Datei angehängt (Du kannst auch ohne Datei absenden)“; Knopf „Jetzt mit Lebenslauf bewerben“ / „Wird übermittelt...“; Fehlermeldung „Die Bewerbung konnte gerade nicht online übermittelt werden. Bitte rufe Herrn Demir direkt an unter 06441 42956 oder nutze WhatsApp.“ Im Ausgangsstand lebt die Aufgabe vollständig und ehrlicher: Pflicht nur Name und Telefon, Kontaktweg WhatsApp/Anruf/E-Mail, E-Mail nur bei Kontaktweg E-Mail Pflicht, Absenden wartet auf Serverantwort 200 mit `ok: true`, Fehlerpanel mit „Anrufen“ und „Per WhatsApp senden“ (vorausgefüllte Bewerbung), Idempotenz-Schlüssel, Honeypot als Spamverdacht. Nicht zurückführen: Vorbelegung „Alexander Koch“, „0170 8892341“, „alexander.koch@beispiel.de“ (Platzhalter, zugleich echter Mitarbeiter), die erfundene Ersatzadresse „bewerber-direkt@karriere.bad-energie.de“ bei leerer E-Mail, die Statuszeile „angehängt“ ohne Übertragung (Ausgangsstand: Hinweis „Deine Bewerbungsmappe wird mitgeschickt.“ nur bei vorhandener Mappe), „Herrn Demir“ im Fehlertext (E-BEW-031), Versand ohne Dateien und Kompetenzen. Mindestlängen (Name 2/3, Telefon 5/6, Server 2/5) sind im Ausgangsstand vereinheitlicht (`CONTACT_LIMITS`, `isPlausiblePhone`: 6 bis 15 Ziffern). Lücke: kein Dateianhang (E-BEW-012).
- Freiraum: Wortlaut, Anordnung, Zahl der Felder; E-Mail optional bleibt.
- Bindungen: `POST /api/bewerbung` (JSON, CSRF-Prüfung, Rate-Limit, Idempotency-Key, Body-Cap 64 KB); Firmennummer 06441 42956; sessionStorage `be:application:v1` für die Danke-Seite.
- Priorität: Muss – Grund: Funktion mit Geschäftswert (Bewerbung).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/apply/ContactStep.tsx`
- Gestaltung: folgt KERN (P2) · Idee: unverändert ruhiges Formular, Gestaltung der Felder und des Absenden-Moments in P2.
- Abnahme: Name und Telefon eingeben, absenden, Serverantwort 200, Danke-Seite mit Nummer; bei 503 oder Offline zeigt das Fehlerpanel „Anrufen“ und „Per WhatsApp senden“; keine vorbelegten Werte (`e2e/apply.spec.ts`, `app/api/bewerbung/__tests__/route.test.ts`) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-tresor__d1440-light__02.webp` / neu `_relaunch/belege/p0-ausgangsstand/stelle-anlagenmechaniker__d1440-light__04.webp` (eingebetteter Flow; der Kontaktschritt ist im Bestand nicht fotografiert)
- Status: offen
- Unsicherheit: keine

### E-BEW-015 · Online-Bewerbungsformular (Felder)
- Kategorie: Interaktives
- Quelle: ALT-BEW-165–171, 173–178, 180–181, 183, 291 · Altstand: `components/views/FormView.tsx:26-41, 73-99, 107-197, 245-317, 322-341, 356-369`, `lib/recruiting-types.ts:60-62, 79-80, 142-152` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-formular__d1440-light__01.webp` (Abschnitte 1 und 2), `_relaunch/belege/p0-altstand/alt-bewerbung-formular__d1440-light__02.webp` (Notizen, Datenschutzbox, Absenden)
- Zustand: verschoben (+ Gegenstück: Kontaktschritt NEU-BEW-18 bis -22, Flow-Fragen NEU-BEW-12 bis -16, Danke-Ergänzung NEU-DANKE-17 bis -24, Mappe NEU-MAPPE-04 bis -07; `components/apply/thanks/FollowUpForm.tsx`)
- Aufgabe: Bewerber erfassen Stammdaten, Erfahrung, Starttermin, Konditionswünsche und Notizen strukturiert; das Unternehmen erhält vergleichbare Angaben.
- Wesenskern: Überschrift „Online Bewerbungsformular“ · „Erfasse Stammdaten, Rahmenbedingungen und Wunschtermin. Alle Eingaben synchronisieren sich in Echtzeit mit dem DINA4 Dossier.“; drei Abschnitte „1 Persönliche Angaben und Erreichbarkeit“, „2 Berufserfahrung und Rahmenbedingungen“, „3 Zusätzliche Notizen an den Meister“. Feld-für-Feld im Ausgangsstand: „Vollständiger Name *“ → Kontakt „Name“ (Pflicht); „Telefonnummer oder WhatsApp *“ → „Telefonnummer“ („Für WhatsApp oder Rückruf“); „E Mail Adresse optional“ → „E-Mail“ (optional, Pflicht bei Kontaktweg E-Mail); „Wohnort und Postleitzahl *“ → nur „Postleitzahl“ (optional, fünf Ziffern, nach dem Absenden in der Ergänzung); „Berufserfahrung *“ (vier Optionen) → Frage „Was trifft auf dich zu?“ (fünf Optionen); „Frühester Starttermin *“ („In 1 Monat Kündigungsfrist“, „Sofort verfügbar“, „In 2 Monaten“, „Nach Absprache“) → Frage „Ab wann könntest du anfangen?“ („Sofort“, „In 1–3 Monaten (Kündigungsfrist)“, „Später / weiß ich noch nicht“) und Ergänzung „Frühester Starttermin“ (Datum); „Wunschkonditionen & Arbeitsmodell (optional)“ („z.B. Vollzeit (Freitag 13:30 Uhr frei), eigener Transporter“) → kein Feld; Textfeld „Notizen“ („Besondere Werkzeugerfahrung, Kälteschein, bevorzugte Arbeitsbereiche...“) → Ergänzung „Nachricht“ (≤ 3000 Zeichen); Foto → E-BEW-013; Knöpfe „Zurück zum Profilfragebogen“, „Dossier aktualisieren und anzeigen“. Fehlertexte des Altstands („Bitte vollständigen Namen eingeben“ usw.) sind durch `CONTACT_MESSAGES` ersetzt („Bitte gib deinen Namen an.“). Nicht zurückführen: Vorbelegung (Name, Telefon, E-Mail, „35578 Wetzlar“, „Vollzeit • Freitags ab 13:30 Uhr Wochenende • Unbefristet“ als angebliche Wunschkondition der Person, Notiz „Erfahrung im Einbau von Bosch Compress Wärmepumpen und modernen Komplettbädern. […]“), das unsichtbare Pflichtfeld `position` (Fehler des Altstands: Schema verlangte es, das Formular zeigte es nicht), den Starttermin-Standardwert „In 1 Monat (Kündigungsfrist)“, der keine Option war, Fehlermeldungen, die nie sichtbar wurden, „Echtzeit“ (nur Browser-Speicher). Lücke: „Wunschkonditionen“ und die Gehaltsvorstellung sind kein Feld mehr (die alte Team-Mail führte „Gehaltswunsch“ mit Rückfall „Nach Haustarif / Verhandlung“); der Wohnort fehlt ganz, nur die PLZ ist optional.
- Freiraum: Form, Reihenfolge, Zahl der Abschnitte; Wohnort darf als „PLZ und Ort“ zurückkehren.
- Bindungen: Option-IDs in `lib/apply/questions.ts`; Payload `answers`; `POST /api/bewerbung/ergaenzung` (`startDate`, `postalCode`, `message`, `mappe`, mit Prüfschlüssel); die Altstand-IDs `field-fullName` bis `field-notes` waren intern (keine eingehenden Links).
- Priorität: Muss – Grund: Funktion mit Geschäftswert (Angaben für das Team).
- Entscheidung: Verschmelzen
- Ziel in der Plattform: `components/apply/thanks/FollowUpForm.tsx`: das Feld „Nachricht“ erhält eine Hinweiszeile („Zum Beispiel Wunschkonditionen, Arbeitsmodell, besondere Erfahrung“); das Schema `applicationFollowUpSchema` bleibt unverändert (gemeinsamer Vertrag nur nach Absprache). Alles Übrige bleibt wie im Ausgangsstand.
- Gestaltung: folgt KERN (P2) · Idee: Ergänzungskarte mit drei ruhigen Feldern und klarer Beschriftung „freiwillig“.
- Abnahme: Alle Angaben des Altstand-Formulars sind im Ausgangsstand erfassbar oder bewusst abgelöst (Zuordnung oben); das Feld „Nachricht“ nennt Wunschkonditionen; Ergänzung erscheint als Block in der Team-Mail (`lib/email/__tests__/templates.test.ts`) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-formular__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung__d1440-light__01.webp`
- Status: offen
- Unsicherheit: Ob die Gehaltsvorstellung ein eigenes Feld oder eine Zeile in der Team-Mail braucht, ist offen (OFFENE FRAGE; berührt den gemeinsamen Vertrag).

### E-BEW-016 · A4-Anschreiben (Blatt 1 der Bewerbungsmappe)
- Kategorie: Inhalt
- Quelle: ALT-BEW-199–206, 208–215 · Altstand: `components/views/PrintA4View.tsx:259-285, 291-330, 346-352, 357-401`, `app/globals.css:172-174`, `components/Logo.tsx:44-47`, `lib/recruiting-types.ts:63-78, 83-87` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp` (Briefkopf, Absenderbox, Betreff), `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp` (Text, Schwerpunkte, Grußblock)
- Zustand: verschoben (+ Gegenstück: NEU-MAPPE-30 (Blatt 1 mit Absender, Empfänger, Datum, Betreff, Anschreiben), NEU-MAPPE-17; `components/mappe/MappePreview.tsx` (`CoverLetterPage`), `components/mappe/mappe.module.css`, `lib/mappe/format.ts`)
- Aufgabe: Ein druckfertiges Anschreiben auf A4, das Bewerber ohne Layout-Aufwand versenden können.
- Wesenskern: Briefkopf mit Adresse „Bad und Energie GmbH Lahn Dill • Siegmund-Hiepe-Str. 20 • 35578 Wetzlar“, Absender („Bewerber“, „Direktkontakt“, „Praxis & Status“, „Konditionen“), Betreff „Bewerbung um die Fachposition:“ + Position, „Persönliches Motivationsschreiben“ · „An: Herrn Dipl.-Ing. Sabri Demir“, Anschreiben-Text (71 Wörter Standard), Block „Praktische Fachschwerpunkte“ (Chips), „Persönliche Rahmenbedingungen“ (Notiz), Gruß „Mit handwerklichen Grüßen,“ · Name · „Wetzlar, den [Datum]“; A4 (210 × 297 mm, Papierschatten). Im Ausgangsstand lebt: Absender (Name, Wohnort · Telefon · E-Mail), Empfänger („Bad und Energie GmbH Lahn Dill“, „Herrn Sabri Demir“, „Siegmund-Hiepe-Str. 20“, „35578 Wetzlar“), Datum „Ort, Datum“ aus der Eingabe, Betreff „Bewerbung als <Titel>“ bzw. „Bewerbung um die <Ausbildung>“ bzw. „Initiativbewerbung“, Anschreiben-Text, Platzhalter „Dein Name“ statt Beispielname. Nicht zurückführen: Firmenlogo im Briefkopf (ALT-BEW-200: ein Bewerberdokument mit Firmenbriefkopf; Entscheidung offen, siehe Unsicherheit), Badge „Teil 1: Anschreiben“ (Dekoration), „Datum: [createdAt]“ mit festem Rückfall „01.10.2026“, „100 Jahre Meisterbetrieb (1926–2026)“ (Zeitbezug, möglicherweise veraltet; ROADMAP §13: ab 2027 „Seit 1926“), Box „Konditionen“ mit „Über Tarif + Sonderzahlungen“ (Herkunft nicht belegt, E-BEW-032), Box „Praxis & Status“ (Angaben des Formulars), doppelte Grußformel, Titel „Dipl.-Ing.“ (E-BEW-031).
- Freiraum: Layout, Schriften (Papierformat in pt), Seitenaufbau, Reihenfolge der Blöcke.
- Bindungen: Druck-CSS (`@page { size: A4; margin: 0 }` in `app/globals.css`, `print-hidden`); Empfänger aus `getMappeRecipient()` (`COMPANY`); Name, Telefon, E-Mail, Wohnort und Foto werden nicht an den Server gesendet.
- Priorität: Soll – Grund: Inhalt mit klarem Besuchernutzen; Mappe ist laut ROADMAP §6 optional.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/mappe/MappePreview.tsx`
- Gestaltung: folgt KERN (P2) · Idee: Briefbogen mit ruhiger Typografie, Absender oben, Empfängerfeld nach DIN 5008.
- Abnahme: Die Druckvorschau zeigt Seite 1 mit Absender, Empfänger, Datum, Betreff und Text auf A4, ohne Editor und Kopfleiste (`e2e/mappe.spec.ts`, `lib/mappe/__tests__/format.test.ts`) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__01.webp`
- Status: offen
- Unsicherheit: Ob das Firmenlogo auf der Mappe zurückkehren soll (Markenzeichen gegen Firmenbriefkopf auf einem Bewerberdokument), ist offen (OFFENE FRAGE).

### E-BEW-017 · A4-Lebenslauf (Blatt 2 der Bewerbungsmappe)
- Kategorie: Inhalt
- Quelle: ALT-BEW-217–221, 232–233, 239–240 · Altstand: `components/views/PrintA4View.tsx:414-444, 535-547, 592-603`, `app/globals.css:273-276` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp` (Kopf, Foto, Werdegang), `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__03.webp` (Ausbildung, Kompetenzen, Fuß)
- Zustand: verschoben (+ Gegenstück: NEU-MAPPE-31 (Lebenslauf mit Kopf, Berufserfahrung, Schule und Ausbildung, Schwerpunkte); `components/mappe/MappePreview.tsx` (`CvPage`))
- Aufgabe: Ein tabellarischer Lebenslauf auf A4 mit Foto, Werdegang, Ausbildung und Kompetenzen.
- Wesenskern: Kopf mit Name (im Altstand H1 der Mappe, abgeschnitten bei Länge), Position als Untertitel, Kontaktraster (Telefon, Wohnort, „@ E-Mail“), Foto rechts oben; Abschnitte „Beruflicher Werdegang & Praxiserfahrung“, „Ausbildung & Abschlüsse“, „Fachkompetenzen & Systeme“ (Chips); Fuß „[Ort], den [Datum]“ · „Unterschrift [Name]“ · „Seite 2 von 2 (Lebenslauf)“ · „Bad & Energie GmbH Lahn Dill“. Im Ausgangsstand lebt: Kopf mit Name und Kontakt, Betreff-Zeile, Berufserfahrung, „Schule und Ausbildung“, „Schwerpunkte“ als Liste, Fuß mit Datum und Namenszeile; leere Abschnitte zeigen auf dem Bildschirm einen Hinweis und fehlen im Druck. Nicht zurückführen: Badge „Teil 2: Lebenslauf (Curriculum Vitae)“ (Dekoration), Firmenname im Fuß eines Bewerberdokuments, feste Seitenzahl-Texte (der Ausgangsstand hat keine; „Kann“), der Block „Anlagenverzeichnis“ ohne echte Dateien (E-BEW-012).
- Freiraum: Layout, Zeitachse mit Punkten und Linie (Altstand) darf als Gestaltung zurückkehren.
- Bindungen: Druck-CSS wie E-BEW-016; Stationen aus E-BEW-018.
- Priorität: Soll – Grund: Inhalt mit klarem Besuchernutzen.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/mappe/MappePreview.tsx`
- Gestaltung: folgt KERN (P2) · Idee: zweispaltiger Lebenslauf mit Zeitspalte links und ruhiger Linie.
- Abnahme: Vorschau und Druck zeigen Seite 2 mit Kopf, Foto (falls gewählt), gefüllten Abschnitten und Namenszeile; leere Abschnitte fehlen im Druck · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__04.webp`
- Status: offen
- Unsicherheit: keine

### E-BEW-018 · Berufs- und Ausbildungsstationen (Eingabeweg im Lebenslauf)
- Kategorie: Funktion
- Quelle: ALT-BEW-224, 228, 262 · Altstand: `components/views/PrintA4View.tsx:488-492, 515-519`, `lib/recruiting-types.ts:29-51, 83-137` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp` (Werdegang mit Zeitachse), `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__03.webp` (Ausbildung)
- Zustand: verschoben (+ Gegenstück: NEU-MAPPE-19 bis NEU-MAPPE-24 (Editor „Berufserfahrung und Ausbildung“); `components/mappe/StationsSection.tsx`, `components/mappe/StationsEditor.tsx`, `lib/mappe/stations.ts`)
- Aufgabe: Bewerber tragen ihren Werdegang selbst ein; der Lebenslauf zeigt nur echte Angaben.
- Wesenskern: Abschnittsüberschriften „Beruflicher Werdegang & Praxiserfahrung“ und „Ausbildung & Abschlüsse“ mit Stationen aus Zeitraum, Tätigkeit oder Abschluss, Betrieb oder Schule, Ort und Aufgaben (Punkte), neueste zuerst. Im Altstand gab es keinen Eingabeweg (ALT-BEW-262: `careerStations` und `educationStations` nur aus Standard oder Speicher, ebenso `currentStatus`, `hasUploadedResume`, `createdAt`); ROADMAP §1: „Der PrintA4View erfindet Lebenslauf-Stationen“. Im Ausgangsstand gibt es einen Editor: Hinzufügen, Entfernen (mit „Rückgängig“), Verschieben, bis 12 Berufsstationen und 8 Abschlüsse, höchstens 8 Aufgaben je Station; „Neueste Station zuerst. Was du leer lässt, erscheint nicht im Lebenslauf.“ Die erfundenen Inhalte sind in E-BEW-032 dokumentiert.
- Freiraum: Zeitachse mit Punkten (#0284C7 Beruf, #047857 Ausbildung im Altstand), Reihenfolge, Eingabeform.
- Bindungen: `mappe.careerStations` und `mappe.educationStations` im Schema (`lib/applications/schema.ts`, Grenzen `MAPPE_SCHEMA_LIMITS`); sessionStorage-Entwurf.
- Priorität: Soll – Grund: interaktives Element mit klarem Besuchernutzen (ROADMAP §6: „Neu ist ein Editor für Berufs- und Ausbildungsstationen“).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/mappe/StationsEditor.tsx`
- Gestaltung: folgt KERN (P2) · Idee: Stationen als ruhige Karten mit Zeitraum links und Sortier-Knöpfen.
- Abnahme: Eine Station anlegen, verschieben und entfernen (mit „Rückgängig“); Lebenslauf zeigt nur ausgefüllte Stationen (`lib/mappe/__tests__/stations.test.ts`) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__04.webp`
- Status: offen
- Unsicherheit: keine

### E-BEW-019 · Mappe-Steuerleiste und Druck/PDF-Ausgabe
- Kategorie: Funktion
- Quelle: ALT-BEW-185, 187–189, 191, 241 · Altstand: `components/views/PrintA4View.tsx:39-43, 187-188, 193-211, 223-231`, `app/globals.css:223-279` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp` (Steuerleiste)
- Zustand: verschoben (+ Gegenstück: NEU-MAPPE-01 (Kopf und Einleitung), NEU-MAPPE-26 („Als PDF speichern / drucken“ mit Hinweis), NEU-MAPPE-29 („Vorschau“), NEU-MAPPE-36 (Druckstil); `components/mappe/MappeActions.tsx`, `app/globals.css` (`@page`, `print-hidden`), `components/mappe/mappe.module.css`)
- Aufgabe: Bewerber erzeugen aus der Mappe ein PDF oder einen Ausdruck.
- Wesenskern: Überschrift „Offizielle Bewerbungsunterlagen: Anschreiben & Lebenslauf“ · „Druckfertig formatiertes DIN-A4 Dokument (Blatt 1: Anschreiben • Blatt 2: Tabellarischer Lebenslauf mit Foto)“ (13 Wörter); Knopf „Als PDF herunterladen / Drucken (A4)“ (`window.print()`, kein Dateidownload); Knopf „Dokumente verwalten“ (Wechsel zum Tresor, E-BEW-012); Druck: nur das Blatt sichtbar, Kopf, Navigation, Fuß, Dialoge, Cookie-Banner ausgeblendet, A4-Rand 10/12 mm. Im Ausgangsstand lebt: „Als PDF speichern / drucken“ mit Hinweis „Für ein PDF wählst du im Druckdialog „Als PDF speichern“.“ (ehrlich: der Browser erzeugt das PDF), Editor und Aktionen `print-hidden`, `@page { size: A4; margin: 0 }` mit Seitenpolster im Blatt. Nicht zurückführen: „Offizielle“ (selbst erstellte Unterlagen), die Statuszeile „Bewerbungsmappe vollständig als 2-seitiges PDF kompiliert“ (keine Kompilierung, E-BEW-033), „Dokumente verwalten“ solange es keinen Tresor gibt, „Foto hochladen“ in der Leiste (liegt bei den persönlichen Angaben, E-BEW-013). Hinweis aus `datenschutz-aenderungen.md` §5: `@page { margin: 0 }` gilt global und nimmt Datenschutz und Impressum den Druckrand.
- Freiraum: Platz und Form der Aktionen, Wortlaut, Hinweis zum PDF.
- Bindungen: Browser-Druckdialog; `print-hidden`-Utility; Seitenformat A4.
- Priorität: Soll – Grund: interaktives Element mit klarem Besuchernutzen.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/mappe/MappeActions.tsx`
- Gestaltung: folgt KERN (P2) · Idee: eine Aktionskarte mit drei gleichrangigen Wegen (Drucken, WhatsApp, Bewerben) und je einer Erklärzeile.
- Abnahme: Der Druckdialog zeigt nur die zwei A4-Seiten, ohne Editor und Kopfleiste (manuelle Druckvorschau, `e2e/mappe.spec.ts`) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__01.webp`
- Status: offen
- Unsicherheit: keine

### E-BEW-020 · Mappe per WhatsApp teilen
- Kategorie: Einbindung Dritter
- Quelle: ALT-BEW-192–193, 263 · Altstand: `components/views/PrintA4View.tsx:79-92, 233-240` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp` (Knopf „Per WhatsApp senden“)
- Zustand: geschwächt (+ Gegenstück: NEU-DANKE-27 („Per WhatsApp“ mit Bewerbungsnummer), NEU-BEW-33 („Lieber direkt per WhatsApp?“ mit den bisherigen Antworten), NEU-MAPPE-33 (Kontaktzeile nur im Fehlerfall); `lib/apply/whatsapp-message.ts` (`buildFollowUpMessage`), `lib/mappe/context.ts` (`getMappeWhatsAppMessage`). Im Mappe-Werkzeug selbst gibt es keinen WhatsApp-Knopf.)
- Aufgabe: Handwerker nutzen WhatsApp als Hauptkanal; Bewerber geben ihre Mappe mit einem Klick an die Firmennummer weiter.
- Wesenskern: Knopf „Per WhatsApp senden“ öffnet WhatsApp (`api.whatsapp.com/send`, Firmennummer 49644142956, neuer Tab) mit dem Text: „Guten Tag Herr Demir, hier ist mein digitales Bewerberdossier (Bewerbung & Lebenslauf) für Bad und Energie GmbH Lahn Dill: Name … Position … Telefon … Wohnort … Praxiserfahrung … Frühester Start … Konditionen … Ich freue mich über ein unverbindliches Kennenlernen in Wetzlar!“ (43 Wörter; ohne Anhang). Nicht zurückführen: Standardwerte im Text („Vollzeit (Freitags ab 13:30 Uhr frei)“ als Konditionen), die Behauptung „digitales Bewerberdossier“ ohne Datei. Wesen: die Mappe per WhatsApp weitergeben, ehrlich benannt (Text und Hinweis, das PDF im Chat anzuhängen).
- Freiraum: Text, Hinweis „PDF danach im Chat anhängen“, Platz des Knopfs.
- Bindungen: WhatsApp-Link über `buildWhatsAppUrl` (`lib/utils/whatsapp-utils.ts`) mit der Firmennummer aus `COMPANY.whatsapp`; Bewerbungsnummer aus `be:application:v1`, falls vorhanden; Link öffnet nur nach Klick (keine Einbettung, keine Einwilligung nötig); `rel="noopener noreferrer"`.
- Priorität: Soll – Grund: Handwerker-Kanal mit klarem Besuchernutzen; Einbindung eines Dritten ohne Geschäftswert für sich.
- Entscheidung: Rückführen
- Ziel in der Plattform: `components/mappe/MappeActions.tsx`: dritte Aktion „Per WhatsApp schicken“ als Variante des vorhandenen Outline-Knopfs; Text aus `buildFollowUpMessage` (mit Bewerbungsnummer, falls vorhanden) um den Hinweis „Mappe als PDF anhängen“ ergänzt.
- Gestaltung: folgt KERN (P2) · Idee: Outline-Knopf mit WhatsApp-Symbol unter „Als PDF speichern / drucken“ und der Zeile „PDF danach im Chat anhängen“.
- Abnahme: Klick öffnet einen neuen Tab mit WhatsApp und vorausgefülltem Text, keine Platzhalterdaten, Firmennummer 06441 42956 (`lib/apply/__tests__/whatsapp-message.test.ts`) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__01.webp`
- Status: offen
- Unsicherheit: Ob WhatsApp Business auf 06441 42956 aktiv ist, ist offen (ROADMAP §13, `datenschutz-aenderungen.md` O6; OFFENE FRAGE). Ein echter Dateianhang ist ohne PDF-Erzeugung nicht möglich.

### E-BEW-021 · Mappe verbindlich einreichen (Absenden und Nachreichen)
- Kategorie: Funktion
- Quelle: ALT-BEW-194–195 · Altstand: `components/views/PrintA4View.tsx:94-139, 242-249` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp` (Knopf „Verbindlich einreichen“)
- Zustand: verschoben (+ Gegenstück: NEU-MAPPE-25 („Mit dieser Mappe bewerben“ / „Mappe nachreichen“), NEU-MAPPE-28 (Rückmeldungen), NEU-BEW-24 (Mappe wird mitgeschickt oder „Entfernen“); `components/mappe/MappeTool.tsx`, `lib/mappe/follow-up.ts`, `lib/applications/mappe-data.ts`, `app/api/bewerbung/ergaenzung/route.ts`)
- Aufgabe: Bewerber senden die fertige Mappe an das Unternehmen.
- Wesenskern: Knopf „Verbindlich einreichen“ sendet Name, E-Mail (Ersatz „bewerber.[Ziffern des Telefons]@karriere.bad-energie.de“), Telefon, Ort, Position, Erfahrung, Start, Konditionen, Fähigkeiten, Notiz oder Anschreiben, Kontaktweg und `discretionGuaranteed` an `/api/bewerbung`; ohne Warten auf die Antwort, ohne Anhänge und ohne Foto. Im Ausgangsstand lebt die Aufgabe ehrlicher: Die strukturierte Mappe (Anschreiben, Arbeitsstil, Fähigkeiten, Berufs- und Ausbildungsstationen) wird entweder im Flow mitgeschickt (Übergabe `be:mappe:v1`, „Deine Bewerbungsmappe wird mitgeschickt.“) oder nach dem Absenden angehängt („Mappe nachreichen“ · „Wird an deine Bewerbung <Nummer> angehängt.“ · „Deine Mappe ist angekommen und gehört jetzt zu deiner Bewerbung <Nummer>.“); Telefon, E-Mail, Wohnort und Foto gehen nicht mit. Nicht zurückführen: Versand ohne Antwort, die erfundene Ersatzadresse, Sofort-Erfolg.
- Freiraum: Wortlaut der Knöpfe, ob Mappe vor oder nach der Bewerbung gesendet wird.
- Bindungen: sessionStorage `be:mappe:v1` und `be:application:v1`; `POST /api/bewerbung` (Feld `mappe`) und `POST /api/bewerbung/ergaenzung` (Nummer und Prüfschlüssel, 14 Tage); Grenzen `MAPPE_SCHEMA_LIMITS`.
- Priorität: Muss – Grund: Funktion mit Geschäftswert (Bewerbung mit Mappe).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/mappe/MappeTool.tsx`
- Gestaltung: folgt KERN (P2) · Idee: ein Hauptknopf mit zwei Zuständen („Mit dieser Mappe bewerben“, „Mappe nachreichen“) und der Bewerbungsnummer in der Erklärzeile.
- Abnahme: Mappe füllen, „Mit dieser Mappe bewerben“, Flow mit gewählter Stelle, Absenden: die Team-Mail enthält den Block „Bewerbungsmappe“; danach „Mappe nachreichen“ meldet „Deine Mappe ist angekommen …“ (`e2e/mappe.spec.ts`, `lib/mappe/__tests__/serialize.test.ts`) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__01.webp`
- Status: offen
- Unsicherheit: keine

### E-BEW-022 · Erfolgsmoment nach dem Absenden (Konfetti, Erfolgsbanner, Toast)
- Kategorie: Bewegung
- Quelle: ALT-BEW-122, 196–198, 264 · Altstand: `components/views/VaultView.tsx:184-188, 236-261`, `components/views/PrintA4View.tsx:27, 125-138, 609-633`, `package.json:23` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp` (Knopf „Verbindlich einreichen“); der Erfolgszustand selbst ist im Bestand nicht fotografiert (keine Formularsendung)
- Zustand: verschoben (+ Gegenstück: NEU-DANKE-01 bis NEU-DANKE-11 (Haken zeichnet sich einmal, „Danke, <Vorname>.“, „Deine Bewerbung ist da.“, Bewerbungsnummer, Stelle, Eingegangen, Zeitleiste „So geht es weiter“), NEU-BEW-31 (Erfolg ohne Danke-Seite), NEU-BEW-32 (Weiterleitung); `app/bewerbung/danke/page.tsx`, `components/apply/thanks/*`, `components/apply/steps.tsx` (`InlineSuccess`))
- Aufgabe: Nach dem Absenden bestätigt die Seite ehrlich den Eingang und sagt, wie es weitergeht; das schafft Entlastung und Vertrauen.
- Wesenskern: Bestätigung mit Name, klare Aussage „Bewerbung ist da“, nächster Schritt, Nachweis (Nummer). Altstand-Wortlaut: Tresor-Banner „Bewerbung erfolgreich eingereicht!“ · „Deine Unterlagen liegen Dipl.-Ing. Sabri Demir vor. Wir melden uns verlässlich binnen 24 Stunden bei Dir.“ (16 Wörter) · Knopf „Kompiliertes DINA4 Dossier ansehen & drucken“; Mappe-Toast „Bewerberdossier erfolgreich an Bad und Energie GmbH übermittelt!“ · „Sabri Demir wird Deine Unterlagen diskret prüfen und sich innerhalb von 24 Stunden bei Dir melden.“ (16 Wörter) · „Schließen“; Konfetti (100 Partikel, Streuung 70, Ursprung y 0,6, Farben #0284C7, #059669, #C51E1E, #0A1E3A, Paket `canvas-confetti` ^1.9.4) und sanftes Scrollen ans Seitenende nach 100 ms. Das Wesen (Rückmeldung und Bestätigung) lebt vollständig: Erfolg nur nach HTTP 200 mit `ok: true`, gezeichneter Haken (einmal, bei reduzierter Bewegung sofort sichtbar), Zeitleiste mit Öffnungszeiten-Hinweis, „Nummer speichern“, Ergänzungen. Konfetti ist bewusst entfernt (ROADMAP §6: „ein einmal gezeichneter Haken, kein Konfetti“; Paket in a2f641d entfernt). Nicht zurückführen: Erfolg vor der Antwort (Toast sofort, Fehler unsichtbar), „binnen“ und „innerhalb von 24 Stunden“ (E-BEW-030), „Kompiliertes DINA4 Dossier“ (keine Kompilierung), Titel „Dipl.-Ing.“ (E-BEW-031).
- Freiraum: Die Bewegung des Hakens darf veredelt werden (P3: Strichführung, kurzer Nachklang), eine leise Mikro-Interaktion ist möglich; kein Konfetti, kein Scroll-Zwang.
- Bindungen: sessionStorage `be:application:v1` (Nummer, Prüfschlüssel, Vorname, Stelle, Zeitpunkt); `router.replace('/bewerbung/danke')` auf der Seite, `router.push` eingebettet; Rückfall `InlineSuccess` ohne sessionStorage; `/bewerbung/danke` ist `noindex`.
- Priorität: Soll – Grund: Wirkung mit klarem Besuchernutzen; das Wesen ist vorhanden.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `components/apply/thanks/ThankYouView.tsx`, `components/apply/thanks/CheckMark.tsx`
- Gestaltung: folgt KERN (P2, K-009) · Idee: der Haken zeichnet sich in zwei Strichen mit leichtem Nachfedern, danach erscheint die Bewerbungsnummer.
- Abnahme: Erst nach Server-Erfolg erscheint die Danke-Seite mit Nummer; bei Fehler kein Erfolgszustand (`e2e/apply.spec.ts`); der Haken zeichnet sich einmal, bei `prefers-reduced-motion` ohne Bewegung · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-danke__d1440-light__01.webp` (Zustand ohne Bewerbung)
- Status: offen
- Unsicherheit: Der Zustand „mit Bewerbung“ der Danke-Seite ist im Bestand nicht fotografiert (`neu-plattform.md` Teil 4); die Abnahme stützt sich dort auf den Code.

### E-BEW-023 · Eingangsbestätigung per E-Mail an Bewerber
- Kategorie: Vertrauen
- Quelle: ALT-BEW-284–290 · Altstand: `lib/email/templates/application-user-confirmation.ts:14-15, 21, 26-34, 40-85, 95-98, 103-110, 118`, `lib/email/resend.ts:210-215`, `lib/seo/site-config.ts:66` · Bild: – (E-Mail, kein Bildschirmfoto)
- Zustand: verschoben (+ Gegenstück: `lib/email/templates/application-user-confirmation.ts`: Betreff „Deine Bewerbung bei Bad und Energie: BE-26-…“, Titel „Danke, <Vorname>.“, Zeilen „Stelle“ und „Bewerbungsnummer“, „So geht es weiter“ aus `lib/content/process.ts`, Diskretionszusage (nicht bei Ausbildung), Kontakt; nur wenn eine E-Mail-Adresse angegeben ist und kein Spamverdacht vorliegt)
- Aufgabe: Bewerber erhalten eine Bestätigung zum Aufheben mit nächsten Schritten und Kontakt.
- Wesenskern: Altstand-Wortlaut: Betreff „Bewerbungseingang bestätigt: Willkommen bei Bad und Energie GmbH Lahn Dill“; Badge „Bewerbungseingang · Wetzlar“, Pille „Bewerbung erfolgreich eingegangen“, „Hallo [Name],“; Absatz 1 „wir freuen uns sehr über Ihr Interesse an einer handwerklichen Zukunft bei der Bad und Energie GmbH Lahn Dill als“ […] (21 Wörter); Absatz 2 „Ihr digitales Bewerbungsdossier ist sicher in unserem Meisterbüro in Wetzlar eingegangen. Bei uns gibt es keine langwierigen Personalabteilungen: Geschäftsführer Diplomingenieur“ […] (26 Wörter); Box „Wie geht es jetzt weiter? Unser fairer 3 Schritte Prozess“ mit „Persönliche Sichtung binnen 24 Stunden“, „10 Minuten Telefonat auf Augenhöhe“, „Werkstattkaffee & Kennenlernen in Wetzlar“; Box „Das erwartet Sie bei uns:“ („Keine Fernmontagen (maximal 35 km Radius um Wetzlar), freitags ab 13:30 Uhr pünktlich ins Wochenende, vollausgestattete Premium Servicefahrzeuge und echtes“ […], 23 Wörter); Signatur „Herzliche Grüße aus Wetzlar,“ · „Diplomingenieur Sabri Demir“ · „Geschäftsführer · Bad und Energie GmbH Lahn Dill“. Im Ausgangsstand lebt: Dank, Bewerbungsnummer, „Wir melden uns schnellstmöglich <per WhatsApp | telefonisch | per E-Mail>“, nächste Schritte aus `process.ts`, Diskretionszusage, Telefon/WhatsApp/E-Mail/Erreichbarkeit; kein Echo freier Eingaben an ungeprüfte Adressen. Nicht zurückführen: „binnen 24 Stunden“ (E-BEW-030), „10 Minuten Telefonat“ und „Premium Servicefahrzeuge“ (unbelegt), die Vorteile-Box als Werbung (Ausgangsstand-Regel: „Keine Werbung, keine Versprechen über Fristen“), „sicher in unserem Meisterbüro“ (kein Nachweis), Anrede in der Sie-Form und der Titel-Mix.
- Freiraum: Gestaltung, Reihenfolge, Ton („du“).
- Bindungen: `lib/email/resend.ts` (Absender `RESEND_FROM_EMAIL`, kein Ersatzabsender), `lib/content/process.ts`, Fakt `quickResponse`; Versand nur mit E-Mail-Adresse.
- Priorität: Soll – Grund: Vertrauenselement mit klarem Besuchernutzen; Inhalte aus belegten Fakten.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `lib/email/templates/application-user-confirmation.ts`
- Gestaltung: folgt KERN (P2, K-012) · Idee: Ton und Typografie der Mail an die Website angleichen.
- Abnahme: Test der Vorlage: Bewerbungsnummer, Schritte, Diskretionszusage (nicht bei Ausbildung), keine Fristzusage (`lib/email/__tests__/templates.test.ts`) · Bildpaar alt – / neu –
- Status: offen
- Unsicherheit: keine

### E-BEW-024 · Team-Benachrichtigung per E-Mail
- Kategorie: Funktion
- Quelle: ALT-BEW-273–276, 278–282 · Altstand: `lib/email/resend.ts:47-55, 203-208`, `lib/seo/site-config.ts:36`, `lib/email/templates/application-lead-notification.ts:35-40, 51, 57, 62-65, 72-140, 148, 159, 176, 183, 189-190` · Bild: – (E-Mail, kein Bildschirmfoto)
- Zustand: verschoben (+ Gegenstück: `lib/email/templates/application-lead-notification.ts`, `application-parts.ts`: Betreff „Neue Bewerbung BE-26-…: <Kurztitel> – <Vorname>“ (Präfix „[Spamverdacht]“), Blöcke Kontakt, Stelle, Angaben, Bewerbungsmappe, Quelle, Eingang; eine Primäraktion je Kontaktweg und ein WhatsApp-Chat-Link in der Telefonzeile; Empfänger aus `CONTACT_NOTIFICATION_EMAIL`, Standard `info@bad-energie.de`; Reply-To ist die Adresse der Person)
- Aufgabe: Das Team erhält jede Bewerbung vollständig, lesbar und mit Antwortknöpfen.
- Wesenskern: Altstand-Wortlaut: Betreff „Neue Expressbewerbung: [Name] für [Position]“ · Vorschautext „Bewerbung von [Name] ([Position]) für den Standort Wetzlar.“; Kopf (Feuer-Emoji) „Neue Bewerbung · Hohe Priorität“ · „Bewerberdossier eingegangen“ · „Ein neuer Fachhandwerker hat sich über das Karriereportal für das Team in Wetzlar beworben:“; Tabelle „Kandidat“, „Angestrebte Stelle“, „Telefonnummer“, „E Mail Adresse“, „Wohnort“, „Berufserfahrung“, „Frühester Starttermin“, „Gehaltswunsch“, „Wunsch Kontaktweg“; Box „Erfasste Kompetenzen und Schwerpunkte“ (bei Tresor-Versand leer); Box „Zusätzliche Notizen des Bewerbers“; Knöpfe „Bewerber anrufen“ (`tel:`), „Per WhatsApp kontaktieren“ (`wa.me`, führende 0 → 49), „E Mail schreiben“ (`mailto:` mit Betreff „Ihre Bewerbung als [Position] bei Bad und Energie GmbH Lahn Dill“). Im Ausgangsstand lebt: Name, Telefon mit `tel:` und WhatsApp-Chat-Link, E-Mail, Kontaktweg, Stelle mit Referenz, Antworten, Mappe, Quelle (Kanal, UTM), Eingang, Ausfülldauer, Datenschutz-Version, Spamverdacht-Hinweis; kein Testabsender. Nicht zurückführen: „Hohe Priorität“ als fester Wert mit Emoji, Rückfalltexte als Angaben („Nicht spezifiziert“, „Flexibel nach Absprache“, „Nach Haustarif / Verhandlung“, „Wetzlar und Umgebung“), Standardabsender „onboarding@resend.dev“. Lücke: „Gehaltswunsch“ und „Wohnort“ (keine Felder mehr, E-BEW-015).
- Freiraum: Gestaltung, Blockfolge, Zahl der Knöpfe.
- Bindungen: `lib/email/resend.ts` (Resend, Idempotenz je Schlüssel), `lib/env.ts` (`CONTACT_NOTIFICATION_EMAIL`, Rückfall `RESEND_TO_EMAIL`, Standard `info@bad-energie.de`); ohne Konfiguration ehrliches 503.
- Priorität: Muss – Grund: Funktion mit Geschäftswert (das Team erhält die Bewerbung).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `lib/email/templates/application-lead-notification.ts`
- Gestaltung: folgt KERN (P2) · Idee: keine Änderung am Aufbau, Typografie wie die Website.
- Abnahme: Vorlagentest mit Fachkraft, Ausbildung, Quereinstieg, Mappe, Spamverdacht (`lib/email/__tests__/templates.test.ts`); Absenden im Test erzeugt genau eine Team-Mail (`app/api/bewerbung/__tests__/route.test.ts`) · Bildpaar alt – / neu –
- Status: offen
- Unsicherheit: keine

### E-BEW-025 · E-Mail-Fußzeile mit Pflichtangaben (Geschäftsführer)
- Kategorie: Recht
- Quelle: ALT-BEW-283 · Altstand: `lib/email/templates/layout.ts:18, 180, 186, 195`, `lib/seo/site-config.ts:30, 66` · Bild: – (E-Mail, kein Bildschirmfoto)
- Zustand: geschwächt (+ Gegenstück: `lib/email/templates/layout.ts` (`footerLines()`, Zeilen 264-271): Firma, Anschrift, „Telefon … · E-Mail“, „HRB 2449 Amtsgericht Wetzlar · Innung …“; ohne Geschäftsführer, ohne Handwerkskammer, ohne USt-IdNr.)
- Aufgabe: Geschäftliche E-Mails tragen die Pflichtangaben des Unternehmens (Firma, Rechtsform, Sitz, Register, Geschäftsführer).
- Wesenskern: Altstand-Fuß aller Mails: „Bad und Energie GmbH Lahn Dill“ · „Geschäftsführer: Diplomingenieur Sabri Demir · HRB 2449 Amtsgericht Wetzlar“ · „© [Jahr] Bad und Energie GmbH Lahn Dill. Alle Rechte vorbehalten.“; Badge-Standard „Innungsmeisterbetrieb seit 1926 · Wetzlar“ (in den Bewerbungsvorlagen überschrieben). Der Altstand-Quelltext (`lib/email/templates/layout.ts:176-197`) enthielt zusätzlich „Handwerkskammer Wiesbaden“, „USt IdNr. DE301642296“ und einen Web-Link; der Altatlas (ALT-BEW-283) erfasst diese drei nicht. Im Ausgangsstand fehlt die Zeile „Geschäftsführer: …“. Sie ist eine Angabe, die Geschäftsbriefe einer GmbH tragen müssen (Vermutung: § 35a GmbHG; juristisch zu bestätigen) und wird deshalb nicht zurückgestellt. Der Wortlaut kommt aus derselben Quelle wie das Impressum („Diplomingenieur Sabri Demir“, `datenschutz-aenderungen.md` §3), nicht neu formuliert. Die USt-IdNr. bleibt draußen: der Altstand-Wert „DE301642296“ widerspricht dem Impressum („DE 346 648 448“, `fakten-abgleich.md` B1). Die Handwerkskammer ist keine Pflichtangabe der Mail (Impressum nennt sie). „Alle Rechte vorbehalten“ ist keine Pflichtangabe.
- Freiraum: Zeilenumbruch, Gestaltung; Copyright-Satz entbehrlich.
- Bindungen: `lib/email/templates/layout.ts` (alle Vorlagen, HTML und Text), Impressum `app/impressum`, Quelle `COMPANY.managingDirector` bzw. Impressum-Stammdaten; Titel offen (E-BEW-031).
- Priorität: Muss – Grund: Recht (gesetzliche Pflichtangabe auf Geschäftsbriefen, Vermutung).
- Entscheidung: Rückführen
- Ziel in der Plattform: `lib/email/templates/layout.ts` (`footerLines()`): Zeile „Geschäftsführer: …“ aus der Impressum-Quelle in HTML- und Textfassung.
- Gestaltung: folgt KERN (P2) · Idee: eine zusätzliche, gleich formatierte Zeile im Fuß.
- Abnahme: Vorlagentest: Fuß jeder Bewerbungs-Mail enthält Firma, Anschrift, Register und „Geschäftsführer: …“, wortgleich zum Impressum (`lib/email/__tests__/templates.test.ts`) · Bildpaar alt – / neu –
- Status: offen
- Unsicherheit: Ob die Eingangsbestätigung als Geschäftsbrief mit Pflichtangaben gilt, ist juristisch zu bestätigen (zur Prüfung gelistet, nicht zurückgestellt); der Titel hängt an A5 (E-BEW-031).

### E-BEW-026 · Bewerbungs-Schnittstelle POST /api/bewerbung (Prüfung, Honeypot, Antworten)
- Kategorie: Funktion
- Quelle: ALT-BEW-267–271 · Altstand: `app/api/bewerbung/route.ts:6-32, 38-60, 97-125` · Bild: – (Server)
- Zustand: verschoben (+ Gegenstück: `app/api/bewerbung/route.ts`, `lib/applications/schema.ts`, `lib/applications/http.ts`, `lib/applications/sink.ts` (`EmailSink`), `lib/applications/token.ts`; Ergänzungen `app/api/bewerbung/ergaenzung/route.ts`)
- Aufgabe: Der Server nimmt Bewerbungen an, prüft sie, stellt sie dem Team zu und meldet ehrlich Erfolg oder Fehler.
- Wesenskern: Altstand: Prüfung mit deutschen Meldungen („Der Name muss mindestens 2 Zeichen lang sein.“ · „Bitte geben Sie eine gültige E Mail Adresse an.“ · „Bitte geben Sie eine gültige Telefonnummer an.“ · „Bitte wählen Sie eine angestrebte Stelle aus.“); verstecktes Feld `websiteUrl` (bei Füllung Erfolgsantwort ohne Versand); Erfolgstext „Vielen Dank! Ihre Bewerbung ist erfolgreich bei uns eingegangen. Wir melden uns verlässlich binnen 24 Stunden bei Ihnen.“ (18 Wörter, mit `simulated`-Kennzeichen); Fehler „Die Bewerbung konnte serverseitig nicht übermittelt werden. Bitte rufen Sie uns direkt an unter 06441 42956 oder schreiben Sie uns via WhatsApp.“ und „Ein Systemfehler ist aufgetreten. Bitte wenden Sie sich direkt an Meister Demir unter 06441 42956.“ (in der Oberfläche nicht sichtbar). Im Ausgangsstand lebt: JSON-Vertrag mit CSRF-Prüfung, Rate-Limit, Body-Cap, Idempotenz, Antwort `{ ok, reference, followUpToken, firstName }`, Fehlercodes mit deutschen Texten (`lib/applications/http.ts`), Honeypot `contactTimeHint` (Treffer wird zugestellt und als „[Spamverdacht]“ markiert), ehrliches 503 ohne Konfiguration; Fehlerpanel mit „Anrufen“ und „Per WhatsApp senden“. Nicht zurückführen: Antwort mit `simulated` und Erfolg ohne Zustellung (E-BEW-033), „binnen 24 Stunden“ (E-BEW-030), „Meister Demir“ (E-BEW-031), stilles Verwerfen des Honeypot-Treffers.
- Freiraum: Technik, Texte, Fehlercodes.
- Bindungen: `POST /api/bewerbung` und `POST /api/bewerbung/ergaenzung` (JSON, `Content-Type`, Body-Cap 64 KB); Umgebungsvariablen `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `IP_HASH_SALT`, `APPLICATION_TOKEN_SECRET` (MENSCHEN.md M-001); Sink-Vertrag für Phase 2 (`SupabaseSink`, gemeinsamer Vertrag nur nach Absprache).
- Priorität: Muss – Grund: Funktion mit Geschäftswert (Bewerbung).
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `app/api/bewerbung/route.ts`
- Gestaltung: folgt KERN (P2) · Idee: keine (Server).
- Abnahme: bestehende Tests (`app/api/bewerbung/__tests__/route.test.ts`, `lib/applications/__tests__`); Fehlerfall ohne `RESEND_API_KEY` in Production liefert 503 (ROADMAP §14 Punkt 4); keine echten Sendungen in diesem Lauf (G5) · Bildpaar alt – / neu –
- Status: offen
- Unsicherheit: keine

### E-BEW-027 · URL-Parameter ?tab= und ?direct= (eingehende Links)
- Kategorie: Navigation
- Quelle: ALT-BEW-257–258 · Altstand: `app/bewerbung/page.tsx:97-107` · Bild: –
- Zustand: verschoben (+ Gegenstück: `app/bewerbung/page.tsx` (`legacyRedirectTarget`), `lib/apply/params.ts`, Test `lib/apply/__tests__/helpers.test.ts`. Gemessen (GET auf http://localhost:3500): `?tab=dossier` → 308 auf `/bewerbung/mappe`, `?tab=dossier&utm_source=indeed` → 308 auf `/bewerbung/mappe?utm_source=indeed`; `?tab=vault`, `?tab=quiz`, `?tab=form`, `?tab=direct`, `?tab=bogus`, `?direct=true` → 200 auf `/bewerbung` (Flow, erster Schritt „Stelle“).)
- Aufgabe: Alte Links, Lesezeichen, Anzeigen und die Startseite des Altstands führen zum passenden Ziel.
- Wesenskern: Altstand: `?tab=vault` und `?tab=direct` öffnen den Tresor, `?tab=quiz`, `?tab=form` und `?tab=dossier` den jeweiligen Tab, alles andere die Übersicht (`hub` wird nicht ausgewertet); `?direct=true` öffnet den Tresor; nur beim ersten Laden gelesen, Tab-Wechsel ändert die URL nicht. Eingehende Links im Altstand: die Startseite „Lebenslauf direkt hochladen“ → `/bewerbung?tab=vault` (`app/page.tsx:224-230`), sonst `/bewerbung` (Header, Footer, `ProcessSteps`, 404-Seite). Lücke: Wer `?tab=vault` folgt (Absicht: Unterlagen hochladen), landet im Flow ohne Upload; `?tab=quiz` und `?tab=form` landen sinnvoll im Flow. Externe Links (Anzeigen, Social-Beiträge, Lesezeichen): unbekannt (OFFENE FRAGE).
- Freiraum: Zielgestaltung, ob `vault` und `direct` später einen Hinweis zeigen.
- Bindungen: `?stelle=<slug>|initiativ`, `?schritt=…`, UTM und `ref` bleiben erhalten (`carryOverQuery`); 308 per `permanentRedirect`; `MAPPE_PATH`.
- Priorität: Muss – Grund: URLs mit eingehenden Links (Bindung) und Suchwert.
- Entscheidung: Verschmelzen
- Ziel in der Plattform: `lib/apply/params.ts` und `app/bewerbung/page.tsx`: Abbildung bleibt; bis der Upload (E-BEW-012) lebt, landen `vault` und `direct` im Flow, danach in einem Flow mit sichtbarer Option „Unterlagen anhängen“; Testfall in `lib/apply/__tests__/helpers.test.ts` ergänzen.
- Gestaltung: folgt KERN (P2) · Idee: keine (Technik).
- Abnahme: GET `?tab=dossier` → 308 mit Query, GET `?tab=vault` → 200, kein 404 oder 500 bei unbekannten Werten (gemessen am Ausgangsstand) · Bildpaar alt – / neu –
- Status: offen
- Unsicherheit: keine

### E-BEW-028 · Entwurf im Browser-Speicher
- Kategorie: Suche und Technik
- Quelle: ALT-BEW-182, 256, 261 · Altstand: `components/views/FormView.tsx:128-131`, `app/bewerbung/page.tsx:86-95, 115-125` · Bild: –
- Zustand: verschoben (+ Gegenstück: NEU-BEW-39 (Entwurf `be:apply-draft:v1`, 24 h), NEU-MAPPE-34 (Entwurf `be:mappe-editor:v1`, Übergabe `be:mappe:v1`); `lib/apply/draft.ts`, `lib/apply/storage.ts` (`removeLegacyDossier`, `be:application:v1`), `lib/mappe/storage.ts`)
- Aufgabe: Eingaben gehen beim Neuladen, Zurückgehen oder Wechsel zur Mappe nicht verloren.
- Wesenskern: Altstand: Speichern bei jeder Eingabe im localStorage unter `bad_energie_dossier` (gesamtes Dossier einschließlich Foto als Base64, Dateimetadaten und Vorbelegungen), Lesen beim Laden, Fehler still ignoriert (try/catch). Im Ausgangsstand lebt die Aufgabe datensparsamer: sessionStorage nur dieses Tabs, 24 Stunden, nach erfolgreichem Absenden gelöscht, Foto nie gespeichert; der alte localStorage-Schlüssel wird beim Öffnen von Flow, Mappe und Danke-Seite gelöscht; ohne Speicher läuft alles weiter („Speichern im Browser ist nicht möglich. Lass diesen Tab offen, bis du fertig bist.“). Nicht zurückführen: localStorage mit Personendaten, Foto im Speicher, Vorbelegungen, „Echtzeit“-Behauptung.
- Freiraum: Technik, Schlüsselnamen, Laufzeit (rechtlich: nur unbedingt Erforderliches).
- Bindungen: sessionStorage-Schlüssel `be:apply-draft:v1`, `be:application:v1`, `be:mappe-editor:v1`, `be:mappe:v1`; Löschen von `bad_energie_dossier`; Datenschutz `#entwurf` (TDDDG § 25 Abs. 2 Nr. 2).
- Priorität: Soll – Grund: klarer Besuchernutzen (kein Datenverlust); Datenschutz erfüllt.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `lib/apply/draft.ts`, `lib/mappe/storage.ts`
- Gestaltung: folgt KERN (P2) · Idee: keine (Technik).
- Abnahme: Seite neu laden mitten im Flow stellt Antworten und Eingaben wieder her; nach dem Absenden ist der Entwurf weg (`lib/apply/__tests__/draft.test.ts`, `e2e/apply.spec.ts`) · Bildpaar alt – / neu –
- Status: offen
- Unsicherheit: keine

### E-BEW-029 · Metadaten und JSON-LD der Bewerbungsseite
- Kategorie: Suche und Technik
- Quelle: ALT-BEW-247–255 · Altstand: `app/bewerbung/layout.tsx:3-37, 43-85` · Bild: –
- Zustand: verschoben (+ Gegenstück: `app/bewerbung/page.tsx` mit `generatePageMetadata` (`lib/seo/metadata.ts`). Gemessen (GET auf http://localhost:3500/bewerbung): Titel „Bewerben in 60 Sekunden – ohne Lebenslauf | Bad & Energie“, Beschreibung „Bewirb dich in ca. 60 Sekunden bei Bad und Energie in Wetzlar: ein paar kurze Fragen, Name und Telefon. Kein Lebenslauf nötig, 100 % diskret.“, Canonical, `og:title`, `og:description`, `og:url`, `og:locale` de_DE, `og:type` website, `og:image` `/opengraph-image` (1200 × 630, mit `alt`), Twitter-Karte `summary_large_image`, `robots` „index, follow“, JSON-LD `WebPage` (`#webpage`, `inLanguage` de-DE, `isPartOf` `#website`)); teilweise verloren: `BreadcrumbList`. Runde 3, am Ausgangsstand per GET auf `/bewerbung` am 2026-10-09 gemessen: Seitenblock mit genau einem Knoten `WebPage` (`@id` „http://localhost:3500/bewerbung#webpage“, `url` „http://localhost:3500/bewerbung“, `isPartOf` {`@id` „http://localhost:3500/#website“}, `inLanguage` „de-DE“, kein `breadcrumb`), danach der Wurzelgraph; keine `BreadcrumbList`.
- Aufgabe: Suchmaschinen und Link-Vorschauen stellen die Bewerbungsseite zutreffend dar.
- Wesenskern: Altstand: Titel „Bewerbung & Dokumenten-Upload [Strich] SHK Karriereportal“; Beschreibung „SHK Bewerbungsportal: 4-Schritte-Fragebogen, Express-Upload für Lebenslauf & PDF-Dossier. Schnell, diskret & unkompliziert bei Bad & Energie.“ (16 Wörter); Canonical `https://karriere.bad-energie.de/bewerbung`; Open Graph (Titel, Beschreibung, URL, `siteName` „Bad und Energie GmbH Lahn Dill“, `de_DE`, `website`, Bild = Logo, 1200 × 630 deklariert, `alt` „Bewerbung im SHK Karriereportal“); Twitter-Karte `summary_large_image`; JSON-LD `@graph`: `WebPage` („Bewerbung Handwerk Wetzlar [Strich] In 60 Sekunden ohne Lebenslauf bei Bad und Energie“, Beschreibung „Bewerbung ohne Lebenslauf in 60 Sekunden bei Bad und Energie GmbH Lahn Dill in Wetzlar für Anlagenmechaniker SHK und Kundendiensttechniker.“ (20 Wörter)) und `BreadcrumbList` (Position 1 „Karriereportal Wetzlar“, Position 2 „Bewerbung“). Runde 3 (ALT-BEW-252, Werte aus dem Quelltext app/bewerbung/layout.tsx:43-75): Die `WebPage` trägt `@id` `${appUrl}/bewerbung/#webpage`, `url` `${appUrl}/bewerbung`, `isPartOf` {`@id` `${appUrl}/#website`}, `breadcrumb` {`@id` `${appUrl}/bewerbung/#breadcrumb`} und `inLanguage` „de-DE“ (appUrl = APP_URL, sonst „https://karriere.bad-energie.de“); die `BreadcrumbList` trägt `@id` `${appUrl}/bewerbung/#breadcrumb`, Position 1 mit `item` `appUrl`, Position 2 mit `item` `${appUrl}/bewerbung`. Im Ausgangsstand leben `@id` (`${url}#webpage`, ohne Schrägstrich vor dem Anker; `@id` sind interne Bezeichner), `url` (= Canonical), `isPartOf` (auf `WEBSITE_ID`, löst immer auf den WebSite-Knoten des Wurzelgraphen auf) und `inLanguage`; der Verweis `breadcrumb` entfällt mit der Liste. Alle Felder der beiden Knoten, die Querverweise und die Abhängigkeit von APP_URL sind in E-SEO-008 (ALT-SEO-100, -101, -106 in alt-shell-recht-seo.md) geführt; dort steht auch die Bewertung der Rechtsseiten. Der Ausgangsstand ersetzt Titel, Beschreibung und `WebPage` bewusst nach ROADMAP §10 (belegtes 60-Sekunden-Versprechen, Fakten `apply60s`, `noCvNeeded`); Canonical, Open Graph, Twitter und `WebPage` leben. Nicht zurückführen: „4-Schritte-Fragebogen“ und „Express-Upload“ (kein Upload), das Logo als Vorschaubild. Verloren: die `BreadcrumbList` (ALT-BEW-254); ROADMAP und Commit-Nachrichten nennen für `/bewerbung` keine Entscheidung dazu (Breadcrumb-JSON-LD ist dort nur für `/jobs/[slug]` vorgesehen).
- Freiraum: Titel und Beschreibung nach SEO-Prüfung (Länge ≤ 65 Zeichen, `validateTitleLength`), OG-Bild.
- Bindungen: Canonical `getCleanCanonicalUrl('/bewerbung')`; `WEBSITE_ID` (gemeinsame Konstante von Wurzelgraph und Seitenknoten, components/site/site-jsonld.ts:14); `@id` der `WebPage` `${url}#webpage`; Sitemap-Eintrag (`app/sitemap.ts`); `robots`; die Fokus-Seite hat keinen sichtbaren Brotkrumenpfad (Strukturierte Daten müssen zum sichtbaren Inhalt passen).
- Priorität: Muss – Grund: Seite mit Suchwert.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: vorhanden: `app/bewerbung/page.tsx`
- Gestaltung: folgt KERN (P2) · Idee: keine (Technik).
- Abnahme: `e2e/seo.spec.ts` und die Messung oben: Titel, Beschreibung, Canonical, Open Graph, `WebPage`; ein JSON-LD-Knoten `WebPage`, kein JobPosting · Bildpaar alt – / neu –
- Status: offen
- Unsicherheit: Die `BreadcrumbList` ist verloren oder bewusst entfallen? Kein Beleg in ROADMAP oder Commits; ohne sichtbaren Pfad im Fokus-Header wäre sie nicht regelkonform. OFFENE FRAGE an die SEO-Rolle: sichtbarer Pfad (z. B. „Zur Stelle“ im Fokus-Header) samt Knoten oder weglassen. Die Frage steht gleichlautend in E-SEO-008; beide Pässe führen dieselbe Entscheidung („Keine Rückführung nötig“, Brotkrumenliste nur mit sichtbarem Pfad).

### E-BEW-030 · Rückmeldeversprechen „binnen 24 Stunden“
- Kategorie: Vertrauen
- Quelle: ALT-BEW-297 · Altstand: `app/bewerbung/page.tsx:250-251, 263`, `components/views/VaultView.tsx:211`, `app/bewerbung/layout.tsx:47-49` · Bild: –
- Zustand: verschoben (+ Gegenstück: Fakt `quickResponse` „Sabri Demir meldet sich schnellstmöglich bei dir.“ (`lib/content/facts.ts`) im Kontaktschritt, auf der Danke-Seite, im CTA-Band und in der Eingangsbestätigung; Fakt `apply60s` für die Dauer der Bewerbung)
- Aufgabe: Bewerber erfahren, wie schnell sie eine Antwort erwarten dürfen; die Zusage schafft Vertrauen und bindet das Team.
- Wesenskern: Altstand-Zusagen: Antwortzeit „binnen 24 Stunden“ / „innerhalb von 24 Stunden“ (Tresor-Banner, Mappe-Toast, API-Erfolgstext, Bestätigungs-Mail „Persönliche Sichtung binnen 24 Stunden“ und Vorschautext „Wir melden uns binnen 24 Stunden.“); Dauer der Bewerbung „unter zwei Minuten“ (Übersicht), „unter 30 Sekunden“ (Tresor, Weg A), „in 60 Sekunden“ (Meta, JSON-LD). Die Dauer ist entschieden (`fakten-abgleich.md` B4: „ca. 60 Sekunden“, Fakt `apply60s`). Die Antwortzeit ist offen: A4 und ROADMAP §13 („Versprechen ‚Rückmeldung in 24 h‘? Standard: ‚Wir melden uns schnellstmöglich‘“); der Fakt ist nicht freigegeben, der Ausgangsstand nutzt „schnellstmöglich“.
- Freiraum: –
- Bindungen: Fakt `quickResponse` (`lib/content/facts.ts`); alle Texte folgen aus dem Fakt (Flow, Danke, Mails, CTA-Band).
- Priorität: Soll – Grund: Vertrauenselement, Belegbarkeit offen (kein belegtes Vertrauenselement).
- Entscheidung: Zurückstellen
- Ziel in der Plattform: – (nach Freigabe: Fakt `quickResponse` anpassen; die Texte folgen). Standardannahme bis zur Antwort: nicht zurückführen. Eintrag für MENSCHEN.md: Owner-Frage A4.
- Gestaltung: folgt KERN (P2) · Idee: keine; falls freigegeben, steht die Zusage nur dort, wo der Fakt sie trägt.
- Abnahme: Owner-Entscheidung liegt vor; danach Fakten-Test: die Zusage erscheint ausschließlich aus dem Fakt · Bildpaar alt – / neu –
- Status: offen
- Unsicherheit: keine (Mensch entscheidet)

### E-BEW-031 · Titel und Anrede des Ansprechpartners
- Kategorie: Vertrauen
- Quelle: ALT-BEW-293 · Altstand: `components/BewerberCheckliste.tsx:700, 844`, `components/views/VaultView.tsx:247, 388`, `components/views/PrintA4View.tsx:359`, `lib/seo/site-config.ts:66`, `app/api/bewerbung/route.ts:121`, `components/views/FormView.tsx:349` · Bild: –
- Zustand: verschoben (+ Gegenstück: Fakt `directLine` „Geschäftsführer Sabri Demir“, `COMPANY.managingDirector` (`lib/content/company.ts`), `lib/data/team.ts` „Geschäftsführer und Meister“, Impressum „Diplomingenieur Sabri Demir“; Anrede im Mappe-Anschreiben „Sehr geehrter Herr Demir,“, Adressat „Herrn Sabri Demir“)
- Aufgabe: Bewerber wissen, wer sich meldet und wie die Person angesprochen wird („Kurze Wege“).
- Wesenskern: Altstand-Varianten im Bewerbungspfad: „Geschäftsführer Sabri Demir“ (Checkliste), „Dipl.-Ing. Sabri Demir“ (Tresor-Banner), „Herrn Dipl.-Ing. Sabri Demir“ (Mappe-Adressat), „Diplomingenieur Sabri Demir“ (Site-Konfiguration, Mails), „Meister Demir“ (Tresor-Eintrag, API), „Werkstattleiter der Bad und Energie GmbH Lahn Dill“ (Formular), „Geschäftsführung“ (Checkliste). Im Ausgangsstand gilt „Geschäftsführer und Meister“ als Standard bis zur Klärung (ROADMAP §13, `fakten-abgleich.md` A5); das Impressum nennt „Diplomingenieur Sabri Demir“ unverändert.
- Freiraum: –
- Bindungen: `lib/data/team.ts`, `lib/content/company.ts`, Impressum (`LEGAL_ENTITY`), `getMappeRecipient()`, Fakt `directLine`; die Entscheidung berührt Impressum, Mails (E-BEW-025) und Mappe (E-BEW-016).
- Priorität: Soll – Grund: Vertrauenselement; Titel offen.
- Entscheidung: Zurückstellen
- Ziel in der Plattform: – (nach Klärung: eine Quelle für alle Orte). Standardannahme bis zur Antwort: „Geschäftsführer und Meister“ im Bewerbungspfad, Impressum unverändert. Eintrag für MENSCHEN.md: Owner-Frage A5.
- Gestaltung: folgt KERN (P2) · Idee: keine.
- Abnahme: Nach der Entscheidung zeigt eine Suche in `app`, `components`, `lib` genau eine Titelvariante pro Kontext · Bildpaar alt – / neu –
- Status: offen
- Unsicherheit: keine (Mensch entscheidet)

### E-BEW-032 · Platzhalter-Standarddossier „Alexander Koch“ und erfundene Lebenslaufinhalte
- Kategorie: Vertrauen
- Quelle: ALT-BEW-207, 225–227, 229–231, 234–237, 260 · Altstand: `components/views/PrintA4View.tsx:141-173, 332-342, 494-510, 521-531, 550-567`, `lib/recruiting-types.ts:53-139`, `app/bewerbung/page.tsx:68` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp`, `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp`, `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__03.webp`
- Zustand: verloren (+ Gegenstück: bewusst entfernt, ROADMAP §1 („Das Formular ist mit Demo-Daten vorbefüllt“, „Der PrintA4View erfindet Lebenslauf-Stationen (L141–180)“) und §6 („Keine Demo- oder Fallback-Daten“); der Ausgangsstand zeigt eine leere Mappe mit „Dein Name“)
- Aufgabe: Der Altstand zeigte eine fertige Beispielmappe schon vor jeder Eingabe; die Aufgabe für Besucher war keine.
- Wesenskern: nichts; dokumentiert als erfunden oder unbelegt (nicht zurückführen): Platzhalterperson „Alexander Koch“ (zugleich echter Mitarbeiter, Teamstimme im Ausgangsstand), „0170 8892341“, „alexander.koch@beispiel.de“, „35578 Wetzlar“, Position „Anlagenmechaniker für Sanitär Heizung und Klimatechnik m w d“, Status „4 Jahre Praxis“ · „In 1 Monat (Kündigungsfrist)“; Station „Geselle Anlagenmechaniker SHK“ · „2022 – heute“ · „SHK Meisterbetrieb Mittelhessen • Wetzlar & Gießen“ mit drei Aufgaben („Montage und Modernisierung von Wärmepumpen (Buderus & Bosch)“, „Selbstständige Badsanierung und Vorwandinstallation (Geberit/Viega)“, „Kundenbetreuung und Inbetriebnahme vor Ort“); Station „Ausbildung zum Anlagenmechaniker SHK“ · „2019 – 2022“ · „Ausbildungsbetrieb Lahn-Dill • Wetzlar“ mit „Abschluss der Gesellenprüfung mit Auszeichnung“; Abschlüsse „Gesellenbrief Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik“ („Handwerkskammer Wiesbaden / Theodor-Heuss-Schule Wetzlar“) und „Realschulabschluss (Mittlere Reife)“ („2013 – 2019“, „Gesamtschule Wetzlar“); Rückfälle im Quelltext (`PrintA4View.tsx:141-173`: „Fachbetrieb im Lahn-Dill-Kreis“, „Innungsbetrieb Mittelhessen“); Box „Konditionen“ mit „Über Tarif + Sonderzahlungen“ (fest im Quelltext, Herkunft nicht belegt); Box „Equipment & Mobilität“ mit „Führerschein Klasse B / BE vorhanden“, „Erfahrung mit Hilti Flottenwerkzeug & Sortimo“, „Bereitschaft für regionale Baustellen im Lahn-Dill-Kreis“ (Behauptungen im Namen der Person ohne Eingabe); Datums-Rückfall „01.10.2026“; Standardnotiz „Erfahrung im Einbau von Bosch Compress Wärmepumpen und modernen Komplettbädern. […]“. Gemessen (GET auf http://localhost:3500: `/bewerbung`, `/bewerbung/mappe`, `/bewerbung/danke`, `/bewerbung?tab=vault`): keine Treffer für „Alexander“, „beispiel.de“, „Flottenwerkzeug“, „Sortimo“, „verifiziert“, „0170 8892341“.
- Freiraum: –
- Bindungen: keine; die Struktur der Abschnitte lebt in E-BEW-017 und E-BEW-018.
- Priorität: Kann – Grund: Erfundenes ohne eigene Aufgabe; wird dokumentiert, nicht zurückgeführt.
- Entscheidung: Nicht zurückführen (erfunden/unbelegt)
- Ziel in der Plattform: –
- Gestaltung: folgt KERN (P2) · Idee: nichts zurückführen; leere Zustände mit Platzhalter „Dein Name“ bleiben.
- Abnahme: Der gerenderte Ausgangsstand enthält keine der genannten Zeichenketten auf `/bewerbung*` (Messung oben, wiederholbar per GET) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__02.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-mappe__d1440-light__01.webp`
- Status: offen
- Unsicherheit: Die Herkunft von „Über Tarif + Sonderzahlungen“ ist nicht belegt (Altatlas ALT-BEW-207); als Firmenaussage deckt der Fakt „Über Tarif plus Urlaubs- und Weihnachtsgeld“ nur die Startseite. Die Kann-Einstufung prüft ein frischer Gegenprüfer.

### E-BEW-033 · Vorgetäuschte Erfolgs- und Sicherheitszustände
- Kategorie: Vertrauen
- Quelle: ALT-BEW-056, 107, 151–152, 160, 186, 272 · Altstand: `components/BewerberCheckliste.tsx:695-707`, `components/views/QuizView.tsx:333-336`, `components/views/VaultView.tsx:76-84, 614-623, 643, 650`, `lib/recruiting-types.ts:18-27`, `components/views/PrintA4View.tsx:189-192`, `lib/email/resend.ts:57-66, 87-96`, `app/api/bewerbung/route.ts:97-114` · Bild: `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__02.webp` (Erfolgsbox), `_relaunch/belege/p0-altstand/alt-bewerbung-tresor__d1440-light__02.webp` (Liste „Verifiziert“, „TLS 256 Bit“), `_relaunch/belege/p0-altstand/alt-bewerbung-mappe__d1440-light__01.webp` (Statuszeile)
- Zustand: verloren (+ Gegenstück: bewusst entfernt, ROADMAP §1 („Der Status ‚verified‘ ist hart codiert“, „Der ‚Simulation-Mode‘ meldet trotzdem Erfolg“) und §6 („Ehrliches Absenden“); der Ausgangsstand liefert ohne Konfiguration 503 und zeigt Anrufen und WhatsApp)
- Aufgabe: Der Altstand erzeugte den Eindruck von Prüfung, Verschlüsselung und erfolgreichem Versand; die Aufgabe für Besucher war keine, es war ein Vertrauensversprechen ohne Deckung.
- Wesenskern: nichts; dokumentiert als vorgetäuscht (nicht zurückführen): Erfolgsbox „Alle Pflichtangaben für Geschäftsführer Sabri Demir liegen vollständig vor.“ · „Deine Kontaktdaten, Rahmenbedingungen und Verfügbarkeit sind verifiziert und übertragen sich automatisch auf das offizielle DINA4 Bewerberdossier.“ (im Standardzustand sichtbar, obwohl Platzhalterdaten); Statuszeile „Profil erfolgreich generiert“ (immer, ohne Dienstaufruf); Dateilisten mit „Status: Verifiziert“ und Badge „Bereit“ (fest gesetzt, nur Metadaten gespeichert, kein Dateiinhalt übertragen); „TLS 256 Bit verschlüsselt“ (die Dokumente wurden nicht übertragen); „Bewerbungsmappe vollständig als 2-seitiges PDF kompiliert“ (keine PDF-Erzeugung); Simulationsmodus ohne `RESEND_API_KEY` mit Ergebnis „success“ (Erfolgsmeldung ohne Zustellung).
- Freiraum: –
- Bindungen: keine (der Ausgangsstand hat ehrliche Zustände).
- Priorität: Kann – Grund: Erfundenes ohne eigene Aufgabe; wird dokumentiert, nicht zurückgeführt.
- Entscheidung: Nicht zurückführen (erfunden/unbelegt)
- Ziel in der Plattform: –
- Gestaltung: folgt KERN (P2) · Idee: nichts zurückführen; Erfolg nur nach echter Serverantwort.
- Abnahme: Der gerenderte Ausgangsstand enthält keine der genannten Zeichenketten (Messung wie in E-BEW-032); ohne Konfiguration antwortet die API mit 503 (`app/api/bewerbung/__tests__/route.test.ts`) · Bildpaar alt `_relaunch/belege/p0-altstand/alt-bewerbung__d1440-light__02.webp` / neu `_relaunch/belege/p0-ausgangsstand/bewerbung-danke__d1440-light__01.webp`
- Status: offen
- Unsicherheit: keine. Die Kann-Einstufung prüft ein frischer Gegenprüfer.


### E-BEW-034 · Lade-Platzhalter der Ansichten (Fragebogen, Dokumente, Formular, Mappe)
- Kategorie: Interaktives
- Quelle: ALT-BEW-299–302 · Altstand: `app/bewerbung/page.tsx:20-59` (vier dynamische Importe mit `loading`; sichtbar nur im jeweiligen Tab, Zeilen 441, 458, 475, 493) · Bild: – (Zwischenzustand, nicht fotografiert)
- Zustand: verschoben (+ Gegenstück: kein Platzhalter nötig. `ApplyFlow` ist eine Serverkomponente und liefert den ersten Schritt im HTML (`components/apply/ApplyFlow.tsx`, `ApplyFlowClient` hydratisiert; im HTML von `/bewerbung` stehen „Schritt 1 von 4“ und die Stellenauswahl, kein Ladetext); die Mappe ist statisch und rendert den Editor serverseitig (`components/mappe/MappeTool.tsx:95-96`, `app/bewerbung/mappe/page.tsx`); auf Stellenseiten steht beim Nachladen der Link „Bewerbung als … öffnen“ (`ApplyFallback`, `app/jobs/[slug]/page.tsx:144, 183-191`); den Dokumenten-Tresor gibt es nicht (E-BEW-012). HTML von `/bewerbung` und `/bewerbung/mappe` am 2026-10-09 geprüft: „wird vorbereitet“ kommt nicht vor.)
- Aufgabe: Während eine Ansicht nachlädt, steht keine leere Fläche; Besucher sehen, dass etwas passiert.
- Wesenskern: Vier Platzhaltertexte, je nur im zugehörigen Tab sichtbar, zentriert, 12 px, slate-500, Innenabstand p-12, ohne Spinner: „Profilfragebogen wird vorbereitet...“ (Quiz) · „Dokumentenablage wird vorbereitet...“ (Tresor) · „Bewerbungsassistent wird vorbereitet...“ (Formular) · „DINA4 Dossier wird vorbereitet...“ (Mappe). Das Wesen (nie eine leere Fläche) lebt über Serverrendering. Die Wortlaute kommen nicht zurück: Die Module „Profilfragebogen“, „Dokumentenablage“, „Bewerbungsassistent“ und „DINA4 Dossier“ gibt es im Ausgangsstand nicht mehr. Lädt künftig eine Ansicht nach (z. B. die Oberfläche des Uploads, E-BEW-012), gilt KERN K-011 „Lädt“: Anzeige erst nach 300 ms, dann mindestens 500 ms sichtbar.
- Freiraum: Wortlaut, Form und Ort eines künftigen Ladehinweises; kein Spinner und kein Pulsieren nötig (E-009).
- Bindungen: keine URLs; `role="status"` oder `aria-live`, falls ein Ladehinweis nötig wird.
- Priorität: Kann – Grund: Übergangszustand ohne eigene Information; die Aufgabe ist im Ausgangsstand durch Serverrendering erfüllt. Der Atlas schlägt Soll vor (Kategorie Interaktives); das gilt nur für einen echten Nachladezustand, den es hier nicht mehr gibt.
- Entscheidung: Keine Rückführung nötig (vollständig verschoben)
- Ziel in der Plattform: – (vorhanden: `components/apply/ApplyFlow.tsx`, `ApplyFallback` in `app/jobs/[slug]/page.tsx`)
- Gestaltung: folgt KERN (P2) · Idee: kein eigener Platzhalter; erster Schritt und Editor kommen fertig im HTML.
- Abnahme: Das gelieferte HTML von `/bewerbung` enthält den ersten Schritt, das von `/bewerbung/mappe` den Editor (curl, ohne JavaScript); die vier Platzhaltertexte kommen in keinem gerenderten HTML vor · Bildpaar –
- Status: offen
- Unsicherheit: keine

## Ohne eigenes Element

| Atlas-ID | Element | Grund | Begründung |
| --- | --- | --- | --- |
| ALT-BEW-002 | Logo | unverändert vorhanden | Das Logo steht im Fokus-Header von `/bewerbung` (NEU-DANKE-31, `components/site/HeaderBar.tsx`, Bild `_relaunch/belege/p0-ausgangsstand/bewerbung__d1440-light__01.webp`); die zweite Logo-Instanz im Unterkopf entfällt mit dem Unterkopf. |
| ALT-BEW-003 | Trennstrich (senkrecht) | reine Dekoration | Senkrechter Trennstrich zwischen Logo und Titel im Unterkopf, ohne Aufgabe. |
| ALT-BEW-013 | Roter Punkt „4. DINA4 Mappe“ | reine Dekoration | Roter Punkt an „4. DINA4 Mappe“, ohne eigene Aufgabe. |
| ALT-BEW-021 | Hero-Fläche | reine Dekoration | Dunkelblaue Hero-Fläche der Übersicht (Hintergrund, Rundung, Schatten); die Gestaltung folgt KERN (P2). |
| ALT-BEW-139 | Symbol Expressbewerbung | reine Dekoration | Unicode-Zeichen „➔“ im Quadrat vor der Überschrift der Expressbewerbung, dekorativ. |
| ALT-BEW-245 | Reduzierte Bewegung | unverändert vorhanden | Reduzierte Bewegung gilt im Ausgangsstand global (`app/globals.css:90-98`); die JS-Bibliothek `motion` ist entfernt, die im Altstand ungedeckten JS-Animationen entfallen. |
| ALT-BEW-266 | Formular- und Prüfpakete | unverändert vorhanden | `react-hook-form` ^7.89.0 und `zod` ^4.6.5 stehen im Ausgangsstand in `package.json` und sind im Einsatz (`@hookform/resolvers` ist entfernt, der Flow nutzt einen eigenen Resolver). |

## Zuordnungsprüfung

- Atlaszeilen des Altstands gesamt (`alt-bewerbung.md`): 302
- einem Element-Pass zugeordnet: 295 (in 34 Pässen)
- ohne eigenes Element (Tabelle oben): 7
- Summe: 295 + 7 = 302; Doppelzuordnungen: 0; nicht zugeordnet: 0 (maschinell geprüft: jede ID von ALT-BEW-001 bis ALT-BEW-302 genau einmal)
- Runde 1: ALT-BEW-299 bis -302 (Lade-Platzhalter) bilden den neuen Pass E-BEW-034; ALT-BEW-298 (Nachtrag der Gegenprobe P1-KUND-06, in der Liste der Runde 1 nicht enthalten und bis dahin keinem Pass zugeordnet) steht in E-BEW-006.
- Runde 2 (P1-REST-04-R2): Der Altatlas meldet keine neuen Zeilen, die höchste ID bleibt ALT-BEW-302. Zuordnung unverändert und maschinell erneut geprüft (302 = 295 + 7, keine Doppelzuordnung, keine unbekannte ID); kein neuer Pass, keine Änderung an Zustand, Priorität oder Entscheidung. Berichtigt wurden im Altatlas nur die Hinweise zu den Bildschirmfotos (51 WebP-Dateien zu /bewerbung liegen unter `_relaunch/belege/p0-altstand/`, die Spalte Bild bleibt je Zeile „–“); die Pässe nennen die Bilddateien selbst.
- Runde 3 (P1-REST-04-R3): Der Altatlas meldet erneut keine neuen Zeilen, die höchste ID bleibt ALT-BEW-302. Berichtigt wurde ALT-BEW-252 (WebPage: `@id`, `url`, `isPartOf`, `breadcrumb`, `inLanguage` mit den wörtlichen `${appUrl}`-Werten); die Zeile bleibt in E-BEW-029 (verschoben). Die zugehörigen neuen Zeilen ALT-SEO-100 und ALT-SEO-101 stehen in `paesse-shell-recht-seo.md` (E-SEO-008) und sind hier nicht mitgezählt. Zuordnung unverändert und maschinell erneut geprüft (302 = 295 + 7, keine Doppelzuordnung, keine unbekannte ID); kein neuer Pass, keine Änderung an Zustand, Priorität oder Entscheidung.

| E-ID | Atlaszeilen |
| --- | --- |
| E-BEW-001 | 13 |
| E-BEW-002 | 18 |
| E-BEW-003 | 5 |
| E-BEW-004 | 3 |
| E-BEW-005 | 2 |
| E-BEW-006 | 33 |
| E-BEW-007 | 7 |
| E-BEW-008 | 7 |
| E-BEW-009 | 19 |
| E-BEW-010 | 8 |
| E-BEW-011 | 6 |
| E-BEW-012 | 29 |
| E-BEW-013 | 12 |
| E-BEW-014 | 11 |
| E-BEW-015 | 17 |
| E-BEW-016 | 16 |
| E-BEW-017 | 9 |
| E-BEW-018 | 3 |
| E-BEW-019 | 6 |
| E-BEW-020 | 3 |
| E-BEW-021 | 2 |
| E-BEW-022 | 5 |
| E-BEW-023 | 7 |
| E-BEW-024 | 9 |
| E-BEW-025 | 1 |
| E-BEW-026 | 5 |
| E-BEW-027 | 2 |
| E-BEW-028 | 3 |
| E-BEW-029 | 9 |
| E-BEW-030 | 1 |
| E-BEW-031 | 1 |
| E-BEW-032 | 12 |
| E-BEW-033 | 7 |
| E-BEW-034 | 4 |
| ohne eigenes Element | 7 |
| Summe | 302 |

Verteilung der Pässe:

- Zustand: verschoben 23 · geschwächt 6 · verloren 5
- Priorität: Muss 11 · Soll 20 · Kann 3
- Entscheidung: Rückführen 3 · Verschmelzen 5 · Neu interpretieren 3 · Zurückstellen 3 · Nicht zurückführen (erfunden/unbelegt) 2 · Keine Rückführung nötig (vollständig verschoben) 18
- Zurückgestellt: 3 von 34 Pässen = 8.8 % (Ziel ≤ 10 %)

### Abgleich je Atlaszeile

Abgleichstatus je Zeile = Zustand des Elements (verschoben · geschwächt · verloren); „unverändert“ und „Dekoration“ für Zeilen ohne eigenes Element; „erfunden“ für Zeilen in Pässen mit der Entscheidung „Nicht zurückführen“. Das Gegenstück („wohin“) steht im Feld „Zustand“ des Passes.

| Atlas-ID | Element | Abgleich |
| --- | --- | --- |
| ALT-BEW-001 | E-BEW-002 | verschoben |
| ALT-BEW-002 | – | unverändert |
| ALT-BEW-003 | – | Dekoration |
| ALT-BEW-004 | E-BEW-002 | verschoben |
| ALT-BEW-005 | E-BEW-002 | verschoben |
| ALT-BEW-006 | E-BEW-002 | verschoben |
| ALT-BEW-007 | E-BEW-002 | verschoben |
| ALT-BEW-008 | E-BEW-002 | verschoben |
| ALT-BEW-009 | E-BEW-002 | verschoben |
| ALT-BEW-010 | E-BEW-002 | verschoben |
| ALT-BEW-011 | E-BEW-002 | verschoben |
| ALT-BEW-012 | E-BEW-003 | verloren |
| ALT-BEW-013 | – | Dekoration |
| ALT-BEW-014 | E-BEW-005 | verloren |
| ALT-BEW-015 | E-BEW-002 | verschoben |
| ALT-BEW-016 | E-BEW-002 | verschoben |
| ALT-BEW-017 | E-BEW-002 | verschoben |
| ALT-BEW-018 | E-BEW-002 | verschoben |
| ALT-BEW-019 | E-BEW-002 | verschoben |
| ALT-BEW-020 | E-BEW-002 | verschoben |
| ALT-BEW-021 | – | Dekoration |
| ALT-BEW-022 | E-BEW-001 | geschwächt |
| ALT-BEW-023 | E-BEW-001 | geschwächt |
| ALT-BEW-024 | E-BEW-001 | geschwächt |
| ALT-BEW-025 | E-BEW-001 | geschwächt |
| ALT-BEW-026 | E-BEW-001 | geschwächt |
| ALT-BEW-027 | E-BEW-001 | geschwächt |
| ALT-BEW-028 | E-BEW-001 | geschwächt |
| ALT-BEW-029 | E-BEW-001 | geschwächt |
| ALT-BEW-030 | E-BEW-006 | geschwächt |
| ALT-BEW-031 | E-BEW-006 | geschwächt |
| ALT-BEW-032 | E-BEW-006 | geschwächt |
| ALT-BEW-033 | E-BEW-006 | geschwächt |
| ALT-BEW-034 | E-BEW-006 | geschwächt |
| ALT-BEW-035 | E-BEW-007 | verloren |
| ALT-BEW-036 | E-BEW-007 | verloren |
| ALT-BEW-037 | E-BEW-006 | geschwächt |
| ALT-BEW-038 | E-BEW-007 | verloren |
| ALT-BEW-039 | E-BEW-007 | verloren |
| ALT-BEW-040 | E-BEW-007 | verloren |
| ALT-BEW-041 | E-BEW-007 | verloren |
| ALT-BEW-042 | E-BEW-007 | verloren |
| ALT-BEW-043 | E-BEW-006 | geschwächt |
| ALT-BEW-044 | E-BEW-006 | geschwächt |
| ALT-BEW-045 | E-BEW-006 | geschwächt |
| ALT-BEW-046 | E-BEW-006 | geschwächt |
| ALT-BEW-047 | E-BEW-006 | geschwächt |
| ALT-BEW-048 | E-BEW-006 | geschwächt |
| ALT-BEW-049 | E-BEW-006 | geschwächt |
| ALT-BEW-050 | E-BEW-006 | geschwächt |
| ALT-BEW-051 | E-BEW-006 | geschwächt |
| ALT-BEW-052 | E-BEW-006 | geschwächt |
| ALT-BEW-053 | E-BEW-006 | geschwächt |
| ALT-BEW-054 | E-BEW-006 | geschwächt |
| ALT-BEW-055 | E-BEW-006 | geschwächt |
| ALT-BEW-056 | E-BEW-033 | verloren (erfunden) |
| ALT-BEW-057 | E-BEW-006 | geschwächt |
| ALT-BEW-058 | E-BEW-006 | geschwächt |
| ALT-BEW-059 | E-BEW-006 | geschwächt |
| ALT-BEW-060 | E-BEW-006 | geschwächt |
| ALT-BEW-061 | E-BEW-006 | geschwächt |
| ALT-BEW-062 | E-BEW-006 | geschwächt |
| ALT-BEW-063 | E-BEW-006 | geschwächt |
| ALT-BEW-064 | E-BEW-006 | geschwächt |
| ALT-BEW-065 | E-BEW-006 | geschwächt |
| ALT-BEW-066 | E-BEW-006 | geschwächt |
| ALT-BEW-067 | E-BEW-006 | geschwächt |
| ALT-BEW-068 | E-BEW-004 | geschwächt |
| ALT-BEW-069 | E-BEW-001 | geschwächt |
| ALT-BEW-070 | E-BEW-001 | geschwächt |
| ALT-BEW-071 | E-BEW-001 | geschwächt |
| ALT-BEW-072 | E-BEW-001 | geschwächt |
| ALT-BEW-073 | E-BEW-008 | verschoben |
| ALT-BEW-074 | E-BEW-008 | verschoben |
| ALT-BEW-075 | E-BEW-008 | verschoben |
| ALT-BEW-076 | E-BEW-008 | verschoben |
| ALT-BEW-077 | E-BEW-008 | verschoben |
| ALT-BEW-078 | E-BEW-008 | verschoben |
| ALT-BEW-079 | E-BEW-008 | verschoben |
| ALT-BEW-080 | E-BEW-009 | verschoben |
| ALT-BEW-081 | E-BEW-009 | verschoben |
| ALT-BEW-082 | E-BEW-002 | verschoben |
| ALT-BEW-083 | E-BEW-002 | verschoben |
| ALT-BEW-084 | E-BEW-002 | verschoben |
| ALT-BEW-085 | E-BEW-009 | verschoben |
| ALT-BEW-086 | E-BEW-009 | verschoben |
| ALT-BEW-087 | E-BEW-009 | verschoben |
| ALT-BEW-088 | E-BEW-009 | verschoben |
| ALT-BEW-089 | E-BEW-009 | verschoben |
| ALT-BEW-090 | E-BEW-009 | verschoben |
| ALT-BEW-091 | E-BEW-009 | verschoben |
| ALT-BEW-092 | E-BEW-009 | verschoben |
| ALT-BEW-093 | E-BEW-009 | verschoben |
| ALT-BEW-094 | E-BEW-009 | verschoben |
| ALT-BEW-095 | E-BEW-009 | verschoben |
| ALT-BEW-096 | E-BEW-009 | verschoben |
| ALT-BEW-097 | E-BEW-009 | verschoben |
| ALT-BEW-098 | E-BEW-009 | verschoben |
| ALT-BEW-099 | E-BEW-009 | verschoben |
| ALT-BEW-100 | E-BEW-009 | verschoben |
| ALT-BEW-101 | E-BEW-010 | verschoben |
| ALT-BEW-102 | E-BEW-010 | verschoben |
| ALT-BEW-103 | E-BEW-010 | verschoben |
| ALT-BEW-104 | E-BEW-010 | verschoben |
| ALT-BEW-105 | E-BEW-010 | verschoben |
| ALT-BEW-106 | E-BEW-010 | verschoben |
| ALT-BEW-107 | E-BEW-033 | verloren (erfunden) |
| ALT-BEW-108 | E-BEW-011 | verschoben |
| ALT-BEW-109 | E-BEW-011 | verschoben |
| ALT-BEW-110 | E-BEW-011 | verschoben |
| ALT-BEW-111 | E-BEW-010 | verschoben |
| ALT-BEW-112 | E-BEW-011 | verschoben |
| ALT-BEW-113 | E-BEW-011 | verschoben |
| ALT-BEW-114 | E-BEW-011 | verschoben |
| ALT-BEW-115 | E-BEW-010 | verschoben |
| ALT-BEW-116 | E-BEW-003 | verloren |
| ALT-BEW-117 | E-BEW-012 | geschwächt |
| ALT-BEW-118 | E-BEW-012 | geschwächt |
| ALT-BEW-119 | E-BEW-012 | geschwächt |
| ALT-BEW-120 | E-BEW-012 | geschwächt |
| ALT-BEW-121 | E-BEW-012 | geschwächt |
| ALT-BEW-122 | E-BEW-022 | verschoben |
| ALT-BEW-123 | E-BEW-013 | verschoben |
| ALT-BEW-124 | E-BEW-013 | verschoben |
| ALT-BEW-125 | E-BEW-013 | verschoben |
| ALT-BEW-126 | E-BEW-013 | verschoben |
| ALT-BEW-127 | E-BEW-013 | verschoben |
| ALT-BEW-128 | E-BEW-013 | verschoben |
| ALT-BEW-129 | E-BEW-013 | verschoben |
| ALT-BEW-130 | E-BEW-012 | geschwächt |
| ALT-BEW-131 | E-BEW-012 | geschwächt |
| ALT-BEW-132 | E-BEW-012 | geschwächt |
| ALT-BEW-133 | E-BEW-012 | geschwächt |
| ALT-BEW-134 | E-BEW-012 | geschwächt |
| ALT-BEW-135 | E-BEW-012 | geschwächt |
| ALT-BEW-136 | E-BEW-012 | geschwächt |
| ALT-BEW-137 | E-BEW-012 | geschwächt |
| ALT-BEW-138 | E-BEW-012 | geschwächt |
| ALT-BEW-139 | – | Dekoration |
| ALT-BEW-140 | E-BEW-014 | verschoben |
| ALT-BEW-141 | E-BEW-014 | verschoben |
| ALT-BEW-142 | E-BEW-014 | verschoben |
| ALT-BEW-143 | E-BEW-014 | verschoben |
| ALT-BEW-144 | E-BEW-014 | verschoben |
| ALT-BEW-145 | E-BEW-014 | verschoben |
| ALT-BEW-146 | E-BEW-014 | verschoben |
| ALT-BEW-147 | E-BEW-014 | verschoben |
| ALT-BEW-148 | E-BEW-014 | verschoben |
| ALT-BEW-149 | E-BEW-014 | verschoben |
| ALT-BEW-150 | E-BEW-012 | geschwächt |
| ALT-BEW-151 | E-BEW-033 | verloren (erfunden) |
| ALT-BEW-152 | E-BEW-033 | verloren (erfunden) |
| ALT-BEW-153 | E-BEW-012 | geschwächt |
| ALT-BEW-154 | E-BEW-012 | geschwächt |
| ALT-BEW-155 | E-BEW-012 | geschwächt |
| ALT-BEW-156 | E-BEW-012 | geschwächt |
| ALT-BEW-157 | E-BEW-012 | geschwächt |
| ALT-BEW-158 | E-BEW-012 | geschwächt |
| ALT-BEW-159 | E-BEW-012 | geschwächt |
| ALT-BEW-160 | E-BEW-033 | verloren (erfunden) |
| ALT-BEW-161 | E-BEW-012 | geschwächt |
| ALT-BEW-162 | E-BEW-012 | geschwächt |
| ALT-BEW-163 | E-BEW-012 | geschwächt |
| ALT-BEW-164 | E-BEW-012 | geschwächt |
| ALT-BEW-165 | E-BEW-015 | verschoben |
| ALT-BEW-166 | E-BEW-015 | verschoben |
| ALT-BEW-167 | E-BEW-015 | verschoben |
| ALT-BEW-168 | E-BEW-015 | verschoben |
| ALT-BEW-169 | E-BEW-015 | verschoben |
| ALT-BEW-170 | E-BEW-015 | verschoben |
| ALT-BEW-171 | E-BEW-015 | verschoben |
| ALT-BEW-172 | E-BEW-013 | verschoben |
| ALT-BEW-173 | E-BEW-015 | verschoben |
| ALT-BEW-174 | E-BEW-015 | verschoben |
| ALT-BEW-175 | E-BEW-015 | verschoben |
| ALT-BEW-176 | E-BEW-015 | verschoben |
| ALT-BEW-177 | E-BEW-015 | verschoben |
| ALT-BEW-178 | E-BEW-015 | verschoben |
| ALT-BEW-179 | E-BEW-004 | geschwächt |
| ALT-BEW-180 | E-BEW-015 | verschoben |
| ALT-BEW-181 | E-BEW-015 | verschoben |
| ALT-BEW-182 | E-BEW-028 | verschoben |
| ALT-BEW-183 | E-BEW-015 | verschoben |
| ALT-BEW-184 | E-BEW-006 | geschwächt |
| ALT-BEW-185 | E-BEW-019 | verschoben |
| ALT-BEW-186 | E-BEW-033 | verloren (erfunden) |
| ALT-BEW-187 | E-BEW-019 | verschoben |
| ALT-BEW-188 | E-BEW-019 | verschoben |
| ALT-BEW-189 | E-BEW-019 | verschoben |
| ALT-BEW-190 | E-BEW-013 | verschoben |
| ALT-BEW-191 | E-BEW-019 | verschoben |
| ALT-BEW-192 | E-BEW-020 | geschwächt |
| ALT-BEW-193 | E-BEW-020 | geschwächt |
| ALT-BEW-194 | E-BEW-021 | verschoben |
| ALT-BEW-195 | E-BEW-021 | verschoben |
| ALT-BEW-196 | E-BEW-022 | verschoben |
| ALT-BEW-197 | E-BEW-022 | verschoben |
| ALT-BEW-198 | E-BEW-022 | verschoben |
| ALT-BEW-199 | E-BEW-016 | verschoben |
| ALT-BEW-200 | E-BEW-016 | verschoben |
| ALT-BEW-201 | E-BEW-016 | verschoben |
| ALT-BEW-202 | E-BEW-016 | verschoben |
| ALT-BEW-203 | E-BEW-016 | verschoben |
| ALT-BEW-204 | E-BEW-016 | verschoben |
| ALT-BEW-205 | E-BEW-016 | verschoben |
| ALT-BEW-206 | E-BEW-016 | verschoben |
| ALT-BEW-207 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-208 | E-BEW-016 | verschoben |
| ALT-BEW-209 | E-BEW-016 | verschoben |
| ALT-BEW-210 | E-BEW-016 | verschoben |
| ALT-BEW-211 | E-BEW-016 | verschoben |
| ALT-BEW-212 | E-BEW-016 | verschoben |
| ALT-BEW-213 | E-BEW-016 | verschoben |
| ALT-BEW-214 | E-BEW-016 | verschoben |
| ALT-BEW-215 | E-BEW-016 | verschoben |
| ALT-BEW-216 | E-BEW-005 | verloren |
| ALT-BEW-217 | E-BEW-017 | verschoben |
| ALT-BEW-218 | E-BEW-017 | verschoben |
| ALT-BEW-219 | E-BEW-017 | verschoben |
| ALT-BEW-220 | E-BEW-017 | verschoben |
| ALT-BEW-221 | E-BEW-017 | verschoben |
| ALT-BEW-222 | E-BEW-013 | verschoben |
| ALT-BEW-223 | E-BEW-013 | verschoben |
| ALT-BEW-224 | E-BEW-018 | verschoben |
| ALT-BEW-225 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-226 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-227 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-228 | E-BEW-018 | verschoben |
| ALT-BEW-229 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-230 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-231 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-232 | E-BEW-017 | verschoben |
| ALT-BEW-233 | E-BEW-017 | verschoben |
| ALT-BEW-234 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-235 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-236 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-237 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-238 | E-BEW-012 | geschwächt |
| ALT-BEW-239 | E-BEW-017 | verschoben |
| ALT-BEW-240 | E-BEW-017 | verschoben |
| ALT-BEW-241 | E-BEW-019 | verschoben |
| ALT-BEW-242 | E-BEW-003 | verloren |
| ALT-BEW-243 | E-BEW-001 | geschwächt |
| ALT-BEW-244 | E-BEW-003 | verloren |
| ALT-BEW-245 | – | unverändert |
| ALT-BEW-246 | E-BEW-012 | geschwächt |
| ALT-BEW-247 | E-BEW-029 | verschoben |
| ALT-BEW-248 | E-BEW-029 | verschoben |
| ALT-BEW-249 | E-BEW-029 | verschoben |
| ALT-BEW-250 | E-BEW-029 | verschoben |
| ALT-BEW-251 | E-BEW-029 | verschoben |
| ALT-BEW-252 | E-BEW-029 | verschoben |
| ALT-BEW-253 | E-BEW-029 | verschoben |
| ALT-BEW-254 | E-BEW-029 | verschoben |
| ALT-BEW-255 | E-BEW-029 | verschoben |
| ALT-BEW-256 | E-BEW-028 | verschoben |
| ALT-BEW-257 | E-BEW-027 | verschoben |
| ALT-BEW-258 | E-BEW-027 | verschoben |
| ALT-BEW-259 | E-BEW-006 | geschwächt |
| ALT-BEW-260 | E-BEW-032 | verloren (erfunden) |
| ALT-BEW-261 | E-BEW-028 | verschoben |
| ALT-BEW-262 | E-BEW-018 | verschoben |
| ALT-BEW-263 | E-BEW-020 | geschwächt |
| ALT-BEW-264 | E-BEW-022 | verschoben |
| ALT-BEW-265 | E-BEW-003 | verloren |
| ALT-BEW-266 | – | unverändert |
| ALT-BEW-267 | E-BEW-026 | verschoben |
| ALT-BEW-268 | E-BEW-026 | verschoben |
| ALT-BEW-269 | E-BEW-026 | verschoben |
| ALT-BEW-270 | E-BEW-026 | verschoben |
| ALT-BEW-271 | E-BEW-026 | verschoben |
| ALT-BEW-272 | E-BEW-033 | verloren (erfunden) |
| ALT-BEW-273 | E-BEW-024 | verschoben |
| ALT-BEW-274 | E-BEW-024 | verschoben |
| ALT-BEW-275 | E-BEW-024 | verschoben |
| ALT-BEW-276 | E-BEW-024 | verschoben |
| ALT-BEW-277 | E-BEW-004 | geschwächt |
| ALT-BEW-278 | E-BEW-024 | verschoben |
| ALT-BEW-279 | E-BEW-024 | verschoben |
| ALT-BEW-280 | E-BEW-024 | verschoben |
| ALT-BEW-281 | E-BEW-024 | verschoben |
| ALT-BEW-282 | E-BEW-024 | verschoben |
| ALT-BEW-283 | E-BEW-025 | geschwächt |
| ALT-BEW-284 | E-BEW-023 | verschoben |
| ALT-BEW-285 | E-BEW-023 | verschoben |
| ALT-BEW-286 | E-BEW-023 | verschoben |
| ALT-BEW-287 | E-BEW-023 | verschoben |
| ALT-BEW-288 | E-BEW-023 | verschoben |
| ALT-BEW-289 | E-BEW-023 | verschoben |
| ALT-BEW-290 | E-BEW-023 | verschoben |
| ALT-BEW-291 | E-BEW-015 | verschoben |
| ALT-BEW-292 | E-BEW-014 | verschoben |
| ALT-BEW-293 | E-BEW-031 | verschoben |
| ALT-BEW-294 | E-BEW-013 | verschoben |
| ALT-BEW-295 | E-BEW-012 | geschwächt |
| ALT-BEW-296 | E-BEW-009 | verschoben |
| ALT-BEW-297 | E-BEW-030 | verschoben |
| ALT-BEW-298 | E-BEW-006 | geschwächt |
| ALT-BEW-299 | E-BEW-034 | verschoben |
| ALT-BEW-300 | E-BEW-034 | verschoben |
| ALT-BEW-301 | E-BEW-034 | verschoben |
| ALT-BEW-302 | E-BEW-034 | verschoben |

## Messbedingungen und Quellen

- Gelesen: `app/bewerbung/**`, `components/apply/**`, `components/mappe/**`, `lib/apply/*`, `lib/applications/*`, `lib/mappe/*`, `app/api/bewerbung/**`, `lib/email/templates/*`, `lib/content/*`, `docs/ROADMAP.md` (§1, §3.1, §5, §6, §7, §8.1, §9, §13, §14), `docs/operations/fakten-abgleich.md`, `docs/operations/datenschutz-aenderungen.md`, `supabase/migrations/*_ats_core.sql`, `*_storage.sql`, `supabase/config.toml`, Commit-Nachrichten `f2e7eae..a83269d`.
- Gemessen wurde nur lesend: GET-Anfragen auf http://localhost:3500 (Weiterleitungen und Statuscodes der `?tab=`-Parameter, Meta-Tags, JSON-LD, Suche nach Platzhalter-Zeichenketten im gerenderten HTML). Kein Browserlauf, keine Formularsendung, keine POST-Anfrage, kein Zugriff auf http://localhost:3600 und keine Anfrage an die Live-Seite. Der Altstand wurde aus dem Quelltext (`_relaunch/altstand/main/`) und den Bildschirmfotos unter `_relaunch/belege/p0-altstand/` gelesen.
- Bildbelege: Der Altatlas verweist inzwischen selbst auf die Bildschirmfotos unter `_relaunch/belege/p0-altstand/` (früher „keine vorhanden“); sie liegen als `_relaunch/belege/p0-altstand/alt-bewerbung*.webp` vor. Pfade in den Pässen beziehen sich auf diese Dateien (Sichtprüfung). Nicht fotografiert: Quiz-Schritte 2 bis 4, Erfolgszustände des Altstands (keine Formularsendung), Kontaktschritt und Danke-Seite mit Bewerbung im Ausgangsstand, Abschnitt „Unterlagen schicken“.
- Fundstellen in den Quelle-Zeilen: Zeilenbereiche aus dem Altatlas übernommen, benachbarte Bereiche (Lücke ≤ 4 Zeilen) je Datei zusammengefasst; Altstand-Pfade relativ zu `_relaunch/altstand/main/`, Ausgangsstand-Pfade relativ zum Repo, Bildpfade relativ zum Repo.
- Neuatlas: Teile 3 bis 5 lagen vollständig vor und wurden gegen den Code geprüft; maßgeblich ist der Code. Sprache der Plattform: nur Deutsch (keine Übersetzungsstruktur gefunden), daher keine Übersetzungs-Bindungen.
- Zeitbezüge, möglicherweise veraltet: „Start 2026“ (E-BEW-009), „100 Jahre Meisterbetrieb (1926–2026)“ und Datum-Rückfall „01.10.2026“ (E-BEW-016, E-BEW-032), Öffnungszeiten und Adresse (E-BEW-008).

## Gesammelte offene Fragen

| Nr. | Element | Frage | Standardannahme bis zur Antwort |
| --- | --- | --- | --- |
| F-01 | E-BEW-012 | Upload: Wer legt den Vertrag `UploadAdapter` ab (gemeinsame Verträge in `lib/applications/*` nur nach Absprache; `lib/uploads/**` und die Upload-API gehören der Session „Supabase-Vollintegration“)? Wann steht die echte Anbindung (Supabase-Projekt, Secret-Key, Magic-Byte-Prüfung, Datenschutztext, Aufbewahrung)? | Schnittstelle und Oberfläche mit Attrappe; im Betrieb ehrlich abgeschaltet; Rest in MENSCHEN.md. |
| F-02 | E-BEW-012, E-BEW-013 | Werden HEIC-Dateien und das Bewerbungsfoto in Phase 2 angenommen und gespeichert (Owner, AGG, Datenschutz)? | Nein; Foto bleibt lokal. |
| F-03 | E-BEW-005 | Darf „§ 26 BDSG“ als Vertrauenszeichen zurückkehren (DSB, EuGH C-34/21)? | Nicht zurückführen. |
| F-04 | E-BEW-030 | Soll die Antwortzeit „binnen 24 Stunden“ wieder versprochen werden (A4)? | Nicht zurückführen; „schnellstmöglich“. |
| F-05 | E-BEW-031 | Welcher Titel für Sabri Demir gilt überall (A5)? | „Geschäftsführer und Meister“; Impressum unverändert. |
| F-06 | E-BEW-015 | Braucht die Bewerbung ein Feld „Gehaltsvorstellung“ oder eine Zeile in der Team-Mail (berührt den gemeinsamen Vertrag)? | Nein; Hinweis im Feld „Nachricht“. |
| F-07 | E-BEW-004 | Braucht die Team-Mail eine Diskretionszeile? | Ja, für Fachkraft und Quereinstieg. |
| F-08 | E-BEW-008 | Zählen Solms, Hüttenberg, Lahnau und Ehringshausen zum Einsatzgebiet (`fakten-abgleich.md` B17)? | Nicht zeigen, bis geklärt. |
| F-09 | E-BEW-029 | `BreadcrumbList` für `/bewerbung`: sichtbarer Pfad im Fokus-Header oder weglassen? | Weglassen. |
| F-10 | E-BEW-016 | Soll das Firmenlogo auf der Bewerbungsmappe zurückkehren? | Nein (Bewerberdokument). |
| F-11 | E-BEW-020 | Ist WhatsApp Business auf 06441 42956 aktiv (O6)? | Ja, wie bisher als Click-to-Chat. |
| F-12 | E-BEW-027 | Welche externen Links (Anzeigen, Social, Lesezeichen) zeigen auf `?tab=…`? | Alle landen im Flow bzw. in der Mappe (`?tab=dossier`). |
| F-13 | E-BEW-025 | Ist die Eingangsbestätigung ein Geschäftsbrief mit Pflichtangaben (Vermutung § 35a GmbHG)? | Zeile „Geschäftsführer“ zurückführen, juristisch prüfen. |
| F-14 | E-BEW-006 | Braucht die optionale Mappe einen Stand mit Sprung? | Ja, als kleiner Stand mit fünf Abschnitten. |
