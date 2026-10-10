# Datenschutzerklärung und Impressum: Änderungen zur Prüfung

Stand: 2026-10-08, ergänzt 2026-10-10 (Schriftnamen, Druck, WhatsApp-Nummer, Bewerberdatenbank) · Schritt 1.3 der Roadmap (§5 „Datenschutz/Impressum“, §9.7) und Phase 2b (§8.1) · Fassungen `PRIVACY_NOTICE_VERSIONS = ['2026-10', '2026-10-10']`, aktuell `2026-10-10`

Beide Seiten sind jetzt ruhige Server-Komponenten (`app/datenschutz/page.tsx`, `app/impressum/page.tsx`, Bausteine in `components/legal/`). Diese Liste markiert **jede inhaltliche Änderung** der Datenschutzerklärung gegenüber der bisherigen Fassung, damit der oder die Datenschutzbeauftragte sie prüfen kann. Sie ist keine Rechtsberatung; die Texte sind Entwürfe nach bestem Wissen, abgeleitet aus dem, was der Code tatsächlich tut.

So antworten: je Punkt **ok** oder eine Korrektur. Änderungen danach in `app/datenschutz/page.tsx` bzw. `components/legal/legal-data.ts`. Ändert sich der Text nach dem Go-live, die neue Fassung an `PRIVACY_NOTICE_VERSIONS` in `lib/applications/constants.ts` anhängen und die alte mindestens 24 h stehen lassen (die Fassung wird mit jeder Bewerbung gespeichert und im Text genannt; der Server nimmt nur gelistete Fassungen an).

Legende: **NEU** = neuer Absatz · **GEÄNDERT** = Aussage geändert · **ENTFERNT** = Aussage gestrichen · **UNVERÄNDERT** = nur Formatierung.

## 1. Allgemein (Form, keine Rechtsaussage)

- **Anrede** von „Sie“ auf „du“ umgestellt, wie auf der ganzen Website. Inhaltlich nichts geändert.
- **Darstellung:** keine Suche, keine Akkordeons, kein Druck-Button, keine Kacheln. Inhaltsverzeichnis mit Ankern (auf großen Bildschirmen seitlich mitlaufend), Text in einer Spalte, druckbar über die Druckfunktion des Browsers.
- **Darstellung ab 2026-10-10 (R5-RECHT-01, E-RECHT-013):** Kopf im Design der Website (Etikett „Rechtliches“, Überschrift, Rohrklammer an der Stand-Zeile), nummerierte Kapitel und Verzeichnis. Neu ist ein Knopf „Drucken oder als PDF speichern“ (öffnet den Druckdialog des Browsers; erscheint nur mit JavaScript). Die Druckansicht zeigt den Text mit Seitenrand, ohne Kopf, Fuß und Verzeichnis (eigene Druckseite; die Bewerbungsmappe behält ihren randlosen Druck). Kein Wort des Rechtstexts geändert außer der Schriftnamen-Korrektur in 2.10.
- **Anker:** Die bisherigen Anker bleiben gültig (`#verantwortlicher`, `#rechtsgrundlagen`, `#datenerfassung`, `#bewerberdaten`, `#cookies-analyse`, `#betroffenenrechte`, `#aufsichtsbehoerde`). Neu: `#ueberblick`, `#entwurf`, `#herkunft`, `#google-maps` (verlinkt von der Karte), `#kontakt`.
- **ENTFERNT (Werbe- und Zierelemente ohne Rechtsinhalt, teils nicht belegbar):** Kopfleiste „DSGVO und § 26 BDSG Rechtsstand“, „Dokumentenversion 4.2.1“, „Auditierte Verschlüsselung (TLS 1.3)“, „Serverstandort Frankfurt am Main (Hessen)“; Kacheln „100% DSGVO & BDSG“, „100% Lokale Fonts“, „256 Bit SSL und TLS“, „§ 26 BDSG Diskretion – Garantierter Kündigungsschutz und Sperrvermerk“; Plakette „Verifiziert Sicher“, „Meisterbetrieb seit 1926“. „Garantierter Kündigungsschutz“ und „auditiert“ waren nicht belegbar.
- **Formatierung:** Bindestriche ergänzt (E-Mail, Datenschutz-Grundverordnung, Server-Logdateien, Gustav-Stresemann-Ring). HBDI-Telefon/-Fax nach DIN 5008 (`+49 611 1408-0`, `+49 611 1408-900`), gleiche Nummern.
- **Metadaten:** Titel „Datenschutzerklärung“ bzw. „Impressum“, neue Beschreibung (ohne „§ 26 BDSG“). Beide Seiten sind jetzt `noindex, follow` (`generatePageMetadata({ type: 'legal' })`); bisher waren sie indexierbar. Das JSON-LD (WebPage, BreadcrumbList) entfällt auf diesen `noindex`-Seiten.
- „Stand“ wird aus `PRIVACY_NOTICE_VERSION` abgeleitet: „Stand: Oktober 2026“ für `2026-10`, seit der Fassung `2026-10-10` „Stand: 10. Oktober 2026“. Bewerbungen mit der alten Fassung `2026-10` nimmt der Server weiter an (offene Tabs).

## 2. Datenschutzerklärung je Abschnitt

### 2.1 Verantwortlicher (`#verantwortlicher`) · UNVERÄNDERT

- Betriebsdaten wie bisher (inkl. HRB 2449 und USt-IdNr. **DE 346 648 448**, siehe Owner-Frage O1). Zusatz „im Lahn Dill Kreis“ hinter der Postleitzahl entfällt.
- Absatz zum Datenschutzbeauftragten (§ 38 BDSG, weniger als 20 Personen, Anfragen an `datenschutz@bad-energie.de`) unverändert. **Prüfen:** siehe O2.

### 2.2 Kurz gesagt (`#ueberblick`) · NEU

- Fünf Sätze in einfacher Sprache: keine Cookies/Pixel/Analyse; Bewerbung lesen nur Menschen im Betrieb, keine automatisierte Entscheidung, keine KI; Formulareingaben bleiben bis zum Absenden im Browser; Google Maps erst nach Klick; Löschung spätestens 6 Monate nach Absage, länger nur mit Talentpool.
- Fasst nur zusammen, was in den Abschnitten unten steht.

### 2.3 Rechtsgrundlagen (`#rechtsgrundlagen`) · GEÄNDERT

- lit. a: Beispiel „optionale Analyse-Cookies“ **ENTFERNT** (gibt es nicht mehr), ersetzt durch „das Laden von Google Maps“. Talentpool bleibt als Beispiel.
- lit. b: Beispiel „deine Bewerbung“ **NEU**; Kundenbeispiele (Sanitärangebote, Heizungswartung, Aufmaß) unverändert.
- lit. c: unverändert (HGB, AO, bis zu 10 Jahre).
- lit. f: „Schutz vor Missbrauch“ und „Auswertung, über welche Kanäle Bewerbungen zu uns kommen“ **NEU**.
- **NEU:** Absatz zu § 25 TDDDG (Abs. 2 Nr. 2 ohne Einwilligung, wenn unbedingt erforderlich; sonst Abs. 1 Einwilligung).

### 2.4 Hosting, Server-Logdateien und Sicherheit (`#datenerfassung`, bisher „Datenerfassung und Hosting“)

- **NEU Hosting:** Vercel Inc. (USA) als Hoster und Auftragsverarbeiter; Serverfunktionen (z. B. Bewerbungsannahme) in Frankfurt am Main, Region `fra1` (`vercel.json`); Seiten über das weltweite Auslieferungsnetz von Vercel. Bisher war kein Hoster genannt, nur „Serverstandort Frankfurt am Main“ in der Kopfleiste.
- **UNVERÄNDERT Server-Logdateien:** Liste, Art. 6 Abs. 1 lit. f, Löschung nach 7 Tagen, „IP-Adresse in gekürzter und anonymisierter Form“. **Prüfen:** Stimmen „gekürzt/anonymisiert“ und „7 Tage“ mit den tatsächlichen Vercel-Logs (Tarif, Log-Aufbewahrung) überein? Sonst anpassen.
- **NEU Schutz vor Missbrauch:** Rate-Limit der Formulare (`lib/security`): IP wird mit täglich wechselndem geheimem Schlüssel gehasht (HMAC), gezählt nur im Arbeitsspeicher, Zähler läuft nach spätestens 24 Stunden ab; unsichtbares Honeypot-Feld. Art. 6 Abs. 1 lit. f.
  **UNVERÄNDERT 2026-10-10:** Auch mit der Bewerberdatenbank bleiben die Zähler im Arbeitsspeicher; die Zählertabelle in Supabase wird bewusst nicht genutzt (Roadmap §8.1). Der Absatz stimmt also weiter.
- **NEU (Text-Review) Spamverdacht:** gemessen wird die Ausfülldauer (erste Eingabe bis Absenden, `fillDurationMs`). Honeypot ausgefüllt oder unter 3 Sekunden (`MIN_FILL_DURATION_MS`) → Bewerbung geht mit „[Spamverdacht]“ ans Team, **keine** Eingangsbestätigung an die angegebene Adresse (`lib/email/resend.ts`).
- **NEU (Text-Review) Sicherheitsmeldungen des Browsers:** CSP-Meldungen (Report-Only) an `/api/csp-report`; protokolliert werden nur Seite ohne Query, verletzte Regel, Herkunft (Origin) des Inhalts, als Zeile in den Server-Logs (`console.warn`), höchstens 60 Zeilen pro Minute. Art. 6 Abs. 1 lit. f.
- **GEÄNDERT SSL/TLS:** Beispiel „Bestellanfragen oder Expressbewerbungen“ → „deiner Bewerbung“. „Schlüssellänge von 256 Bit“ unverändert übernommen. **Prüfen:** Trifft 256 Bit für die TLS-Konfiguration von Vercel zu? Sonst die Zahl streichen.
- **NEU Übermittlung in die USA:** Vercel und Resend haben Sitz in den USA; Grundlage EU-US Data Privacy Framework (soweit zertifiziert), sonst EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). **Prüfen:** welcher Mechanismus je Anbieter gilt.
- **GEÄNDERT 2026-10-10 (Fassung `2026-10-10`):** Der Satz nennt jetzt auch Supabase: „Vercel, unser E-Mail-Dienstleister Resend und der Betreiber unserer Bewerberdatenbank Supabase sind Unternehmen mit Sitz in den USA.“ Grundlage unverändert (DPF, sonst Standardvertragsklauseln). **Prüfen:** Mechanismus für Supabase (O10).
- Der bisherige Unterpunkt „Kontaktformulare und direkte Anfragen“ steht jetzt unter 2.9.

### 2.5 Bewerbung über diese Website (`#bewerberdaten`, bisher „Bewerbung und Recruiting nach § 26 BDSG“)

- **GEÄNDERT Rechtsgrundlage:** bisher „Art. 6 Abs. 1 lit. b DSGVO in Verbindung mit § 26 Abs. 1 BDSG“. Neu: Art. 6 Abs. 1 lit. b DSGVO (Anbahnung eines Beschäftigungsverhältnisses); Hinweis, dass sich die Verarbeitung nach EuGH C-34/21 vorrangig nach Art. 6 und Art. 88 DSGVO richtet und § 26 BDSG nur ergänzend herangezogen wird, soweit er anwendbar bleibt. **Prüfen:** Formulierung; ob für die Aufbewahrung zur Abwehr von AGG-Ansprüchen zusätzlich lit. c/f genannt werden soll.
- **NEU Was wir erfassen** (60-Sekunden-Bewerbung, `lib/applications/schema.ts`): Stelle oder Initiativbewerbung; Antworten (Qualifikation, Stand in der Schule, aktuelle Tätigkeit, Führerschein B, frühester Start); Name; Telefon; E-Mail optional (Pflicht nur bei Kontaktweg E-Mail); bevorzugter Kontaktweg (WhatsApp, Anruf, E-Mail); optional Inhalte der Bewerbungsmappe (Anschreiben, Kenntnisse, Arbeitsstil, Berufs- und Ausbildungsstationen); Herkunft (Quelle/Kampagne); technische Angaben (Zeitpunkt, Bewerbungsnummer, **Ausfülldauer, Spamverdacht-Markierung** (Text-Review), angezeigte Fassung des Datenschutzhinweises).
- **NEU Pflichtangaben** und Folge der Nichtbereitstellung (Art. 13 Abs. 2 lit. e DSGVO): Pflicht sind Stelle, Antworten auf die kurzen Fragen (ohne sie geht der Flow nicht weiter), Name, Telefon; E-Mail nur bei Kontaktweg E-Mail.
- **NEU Ergänzungen** auf der Danke-Seite (Starttermin, PLZ, Nachricht, Bewerbungsmappe), zugeordnet über die Bewerbungsnummer.
- **UNVERÄNDERT Datenkategorien** (Stammdaten, Qualifikationen, Führerscheinklassen, Konditionswünsche/Eintrittstermin/Kündigungsfrist), jetzt unter „Weitere Angaben im Bewerbungsverfahren“ für Bewerbungen auf anderem Weg und das weitere Verfahren.
- **GEÄNDERT Sperrvermerk:** Inhalt gleich (wir kontaktieren nie den aktuellen Arbeitgeber; Kontakt nur über die privaten Kanäle, die die Person nennt, z. B. private Mobilnummer oder WhatsApp nach Feierabend). Neu formuliert mit der Diskretionszusage aus `lib/content` (`DISCRETION_PROMISE`); Verstärker „garantiert“, „uneingeschränkt“, „absolut“ und der nicht mehr existierende „digitale Expressbereich“ entfallen.
- **NEU Empfänger:** Bewerbung geht per E-Mail an das Team in Wetzlar; lesen nur an der Auswahl Beteiligte; Eingangsbestätigung an die Bewerberin oder den Bewerber, wenn eine E-Mail-Adresse angegeben ist (außer bei Spamverdacht); kein Verkauf, keine Weitergabe an Dritte.
- **GEÄNDERT 2026-10-10 (Fassung `2026-10-10`), Bewerberdatenbank:** neuer Satz nach der E-Mail an das Team: „Außerdem speichern wir sie mit deinen Ergänzungen in unserer Bewerberdatenbank, damit keine Bewerbung in einem Postfach verloren geht und wir sie geordnet bearbeiten können.“ Grund: Phase 2b (`lib/supabase/sink.ts`) speichert jede Bewerbung und jede Ergänzung zu einer dort gespeicherten Bewerbung zusätzlich in Supabase, sobald die Datenbank in Production konfiguriert ist; die Mails bleiben gleich. **Prüfen:** Der Satz steht auch dann, wenn eine Bewerbung nur per E-Mail ankommt (Datenbank abgeschaltet mit `APPLICATION_SINK=email`, gestört und deshalb Not-E-Mail, oder nicht konfiguriert). Reicht das so?
- **NEU Auftragsverarbeiter:** Vercel Inc. (Hosting, Serverfunktion in `fra1`), Resend (E-Mail-Versand an Team und Eingangsbestätigung), je nach Art. 28 DSGVO. **Prüfen:** AVVs abgeschlossen (O3)? Vollständige Firmennamen und Anschriften aus den AVVs ergänzen.
- **NEU 2026-10-10 (Fassung `2026-10-10`), Supabase:** dritter Eintrag „Supabase Inc. (USA): Betrieb unserer Bewerberdatenbank. Die Datenbank liegt in einem Rechenzentrum in Frankfurt am Main (Region eu-central-1).“ Der Folgesatz lautet jetzt „Alle drei verarbeiten die Daten nur in unserem Auftrag …“ statt „Beide …“. **Prüfen:** AVV mit Supabase (O10); vollständiger Firmenname und Anschrift aus dem AVV.
- **UNVERÄNDERT Speicherdauer:** spätestens 6 Monate nach Bekanntgabe der Absage (Art. 17 DSGVO i. V. m. § 15 Abs. 4 AGG); Talentpool höchstens 24 Monate nur mit ausdrücklicher Einwilligung (Art. 6 Abs. 1 lit. a), jederzeit widerrufbar. **NEU:** „Kommt es zu einer Einstellung, übernehmen wir die erforderlichen Daten in deine Personalakte.“
- **GEÄNDERT 2026-10-10 (Fassung `2026-10-10`), Speicherdauer:** Zusatz nach der 6-Monats-Frist: „Das gilt für die E-Mails und die Bewerberdatenbank gleichermaßen.“ Die automatische Löschung in der Datenbank (Phase 2c) ist noch nicht gebaut; bis dahin löscht die Administration per SQL (`betrieb.md` §6). Das muss vor der ersten Frist geregelt sein (frühestens etwa 6 Monate nach der ersten Absage).
- **NEU Keine automatisierte Entscheidung, keine KI:** keine Entscheidungen einschließlich Profiling nach Art. 22 DSGVO; keine KI zur Bewertung oder Bearbeitung von Bewerbungen. **Prüfen:** O7.
- **Hinweis Phase 2:** Mit dem ATS (Supabase, Frankfurt) ändern sich Speicherort, Empfänger (Cockpit), Auftragsverarbeiter (Supabase) und die automatische Löschung. Für Phase 2b sind Speicherort, Auftragsverarbeiter und Speicherdauer mit der Fassung `2026-10-10` angepasst (siehe oben). Mit Cockpit (2d), Uploads und automatischer Löschung (2c) muss der Abschnitt **vor** deren Go-live erneut angepasst werden.

### 2.6 Entwurf und Bewerbungsmappe im Browser (`#entwurf`) · NEU

- Entwurf des Bewerbungsformulars im `sessionStorage` (nur dieser Tab), bleibt auf dem Gerät, wird beim Absenden gelöscht, verfällt nach spätestens 24 Stunden (`lib/apply/draft.ts`).
- Bewerbungsmappe ebenfalls im `sessionStorage` (inkl. Kontaktdaten für den Briefkopf); Foto nur im Arbeitsspeicher; Telefon, E-Mail, Wohnort und Foto aus der Mappe werden nicht mitgesendet; Druck/PDF erzeugt der Browser.
- Nach dem Absenden: Bewerbungsnummer, Vorname, Stelle und Prüfschlüssel (Token für Ergänzungen) im `sessionStorage` desselben Tabs.
- Schließen des Tabs löscht den `sessionStorage`.
- Rechtsgrundlage § 25 Abs. 2 Nr. 2 TDDDG (unbedingt erforderlich für den gewünschten Dienst); danach Art. 6 Abs. 1 lit. b DSGVO.
- Alte `localStorage`-Einträge früherer Versionen (`bad_energie_dossier`) werden beim Öffnen von Formular oder Mappe automatisch gelöscht.

### 2.7 Herkunftsmessung ohne Cookies (`#herkunft`) · NEU

- Gelesen werden `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `ref`, nur der Host der verweisenden Website, die Einstiegsseite (ohne Parameter) und der Einstieg des Formulars (`lib/attribution/*`).
- Nur im Arbeitsspeicher der geöffneten Seite, nicht auf dem Gerät gespeichert; nur mit einer Bewerbung übermittelt; Zweck: Bewerbungen pro Kanal zählen.
- Art. 6 Abs. 1 lit. f DSGVO, Hinweis auf Widerspruch (Art. 21). Keine Cookies, keine Pixel, keine Analyse-Tools.
- **Prüfen:** Interessenabwägung; ob das Auslesen von Adresse und Referrer ein Zugriff im Sinne von § 25 TDDDG ist (es wird nichts auf dem Gerät gespeichert).

### 2.8 Google Maps, 2-Klick-Lösung (`#google-maps`) · NEU

- Standard ist eine eigene Grafik mit Ortsliste ohne Verbindung zu Google. Vor dem Klick auf „Interaktive Karte laden“ keine Verbindung zu Google.
- Nach dem Klick: Google Ireland Limited (Gordon House, Barrow Street, Dublin 4, Irland) erhält insbesondere IP-Adresse, Browser- und Geräteangaben, Seitenadresse; mögliche Übermittlung an Google LLC (USA), gestützt auf das EU-US Data Privacy Framework.
- Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG durch den Klick; Wahl im `localStorage` unter `be:maps-consent:v1` mit Zeitpunkt (`lib/maps/consent.ts`); Widerruf über „Karte wieder ausblenden“ (Eintrag wird gelöscht).
- Link auf die Datenschutzerklärung von Google.
- **Prüfen:** Reicht der Hinweis direkt am Button („Erst nach dem Klick lädt Google Maps; dabei gehen Daten wie deine IP-Adresse an Google.“ mit Link hierher, `components/maps/RegionExplorer.tsx`) als Information vor der Einwilligung?

### 2.9 Kontakt per Telefon, E-Mail und WhatsApp (`#kontakt`)

- **GEÄNDERT:** bisher „Kontaktformular oder E-Mail“. Neu „Telefon, E-Mail oder WhatsApp“; das Kontaktformular (LeadQuickForm) entfällt laut Roadmap §5/§9.3. Rest unverändert (Speicherung zur Bearbeitung und für Anschlussfragen, keine Weitergabe ohne Einwilligung, Art. 6 Abs. 1 lit. b).
- **NEU WhatsApp:** Click-to-Chat-Links, teils mit vorausgefülltem Text (z. B. Bewerbungsangaben, wenn das Absenden scheitert); WhatsApp öffnet sich erst beim Antippen; der Text ist Teil der Link-Adresse; die Person sendet selbst. Anbieter WhatsApp Ireland Limited; mögliche Übermittlung an Meta Platforms, Inc. (USA); Alternative Telefon/E-Mail.
- **Prüfen:** Anschrift von WhatsApp Ireland ergänzen; Rechtsgrundlage für Nachrichten, die über WhatsApp eingehen (Mobilnummer 0160 8834290); siehe O6 und O9.

### 2.10 Cookies, Analyse und Schriften (`#cookies-analyse`, bisher „Cookies, Analyse und Lokale Schriften“)

- **ENTFERNT Webanalyse und Cookiesteuerung:** bisher „Technologien, um das Nutzerverhalten aggregiert zu verstehen … gekürzte IP … Tracking-Cookies erst nach Einwilligung im Einwilligungsdialog“. Die Website hat keine Analyse und kein Cookie-Banner mehr (`CookieConsent` ist entfernt).
- **NEU:** „Diese Website setzt keine Cookies und nutzt keine Tracking-Pixel und keine Analyse- oder Statistik-Tools. Deshalb gibt es auch kein Cookie-Banner.“ Verweis auf die zwei Speicherungen (Entwurf, Google Maps).
- **GEÄNDERT Schriften:** bisher „lokal auf unseren eigenen Servern in der Bundesrepublik Deutschland … Übertragung der IP-Adresse an externe Server vollständig ausgeschlossen“. Neu: Inter wird beim Erstellen eingebunden (`next/font`) und vom Hoster mit den Seiten ausgeliefert; keine Verbindung zu Google Fonts oder anderen Dritten. (Die Seiten liegen bei Vercel, nicht auf eigenen Servern.)
- **GEÄNDERT 2026-10-10, Faktenkorrektur der Schriftnamen (M-019, E-022, R5-RECHT-01):** Die Website nutzt nicht mehr Inter, sondern **Bricolage Grotesque, Atkinson Hyperlegible Next und Martian Mono**, selbst gehostet über `next/font/local` (Dateien in `app/fonts`, Lizenzen in `app/fonts/LIZENZEN.md`). Der Absatz lautet jetzt: „Wir nutzen die Schriften Bricolage Grotesque, Atkinson Hyperlegible Next und Martian Mono. Sie werden beim Erstellen der Website eingebunden und von unserem Hoster zusammen mit den Seiten ausgeliefert. Dein Browser stellt dafür keine Verbindung zu Google Fonts oder anderen Dritten her.“ Geändert sind nur die Schriftnamen und die Zahl („Schrift … wird“ → „Schriften … werden“); die Aussage (selbst gehostet, keine Übermittlung an Dritte) bleibt. Die Fassung bleibt `2026-10` (Stand „Oktober 2026“), die Korrektur liegt im selben Monat. **Bitte durch den Datenschutzbeauftragten bestätigen.**
- **Hinweis Phase 3:** Werbe-Pixel nach Einwilligung (Roadmap §7) machen diesen Abschnitt und ein Einwilligungs-Banner nötig.

### 2.11 Deine Rechte (`#betroffenenrechte`) · UNVERÄNDERT

- Art. 15, 16, 17, 18, 20, 21 DSGVO und Widerruf nach Art. 7 Abs. 3 wie bisher; der Button „Widerruf absenden“ ist jetzt ein E-Mail-Link mit demselben Betreff.
- **NEU:** Widerruf der Google-Maps-Einwilligung über „Karte wieder ausblenden“; Kontaktzeile (E-Mail `datenschutz@bad-energie.de`, Telefon 06441 42956) aus der bisherigen Seitenleiste „Datenschutzauskunft“.

### 2.12 Beschwerde bei der Aufsichtsbehörde (`#aufsichtsbehoerde`) · UNVERÄNDERT

- HBDI mit Haus- und Postanschrift, Telefon, Fax, E-Mail, Website wie bisher (nur Formatierung).

## 3. Impressum

Inhalt bis auf zwei Punkte **unverändert**, nur neu gegliedert (Anbieter, Kontakt, Register und Umsatzsteuer, Verantwortlich nach § 18 Abs. 2 MStV, Handwerkskammer, Streitbeilegung, Haftung). Entfernt: Logo, Plakette „100 Jahre Meisterbetrieb (1926–2026)“, Zurück-Link, JSON-LD. Die Betriebsdaten kommen aus `lib/content` (`COMPANY`), die übrigen Angaben aus `components/legal/legal-data.ts`.

**GEÄNDERT (Text-Review), bitte bestätigen:**

- **TMG → DDG:** „§ 7 Abs. 1 TMG“ und „§§ 8 bis 10 TMG“ jetzt „§ 7 Abs. 1 DDG“ und „§§ 8 bis 10 DDG“. Das TMG gilt seit Mai 2024 nicht mehr; die Überschrift nannte bereits § 5 DDG. Übernommen ist die verbreitete Musterformulierung; **prüfen**, ob die Paragrafen so passen oder der Absatz ohne Paragrafen auskommen soll.
- **ENTFERNT OS-Plattform:** Satz und Link zur EU-Plattform zur Online-Streitbeilegung (im Juli 2025 eingestellt, der Link führte auf eine Umzugsseite). Der Satz zur Teilnahme an Verbraucherschlichtung bleibt.

Bewusst **nicht** geändert, bitte prüfen:

- **Verbraucherschlichtung:** „Wir sind grundsätzlich bereit, an Streitbeilegungsverfahren … teilzunehmen.“ Ist das gewollt? Wenn ja, verlangt § 36 VSBG die Angabe der zuständigen Verbraucherschlichtungsstelle mit Anschrift und Website (die Überschrift nennt „Universalschlichtungsstelle“, der Text keine Stelle).
- **Geschäftsführer:** „Diplomingenieur Sabri Demir“ (wie bisher) kommt jetzt aus `lib/data/team.ts`. Roadmap §13 fragt nach einem einheitlichen Titel; eine Änderung dort ändert auch das Impressum.
- **Handwerkskammer-Daten** (Bierstadter Straße 45, 0611 1360, info@hwk-wiesbaden.de) unverändert aus dem alten Impressum übernommen. Bitte aktuell halten. Die Innung (`COMPANY.innung`) steht im Footer, nicht im Impressum; ihre Schreibweise ist offen (`fakten-abgleich.md` B24).
- Überschrift „Haftung für Inhalte und Links“, der Text behandelt aber nur Inhalte.

## 4. Owner-Fragen

| # | Frage | Bis zur Klärung |
|---|---|---|
| O1 | **USt-IdNr. widersprüchlich:** `lib/seo/site-config.ts` `vatID: 'DE301642296'` (auch JSON-LD und E-Mail-Footer) · Impressum und Datenschutz: „DE 346 648 448“ (siehe auch `fakten-abgleich.md` B1). Welche Nummer stimmt? | Angezeigt wird unverändert **DE 346 648 448** (`LEGAL_ENTITY.vatId`). Korrektur dort und in `site-config.ts`. |
| O2 | Gibt es einen benannten (externen) Datenschutzbeauftragten? Der bisherige Text sagt: keine Pflicht nach § 38 BDSG. | § 38-Absatz bleibt. Falls benannt: Name und Kontakt in Abschnitt 1 (Art. 13 Abs. 1 lit. b DSGVO). |
| O3 | Sind die AVVs mit Vercel und Resend abgeschlossen (Roadmap §9.7)? Welche Resend-Region und welcher Vertragspartner (Firmenname, Anschrift)? | Text nennt beide als Auftragsverarbeiter nach Art. 28. Erst veröffentlichen, wenn die AVVs vorliegen. |
| O4 | Vercel-Logs: Aufbewahrungsdauer und ob IP-Adressen gekürzt werden. | Bisherige Angaben (7 Tage, gekürzt) bleiben. |
| O5 | Bleibt `/api/contact` nach dem Löschen des LeadQuickForm in Betrieb? Kein Formular der neuen Website ruft die API noch auf; ROADMAP §9.3 sieht ihren Wegfall vor. | Erledigt: `/api/contact` samt Kontakt-Mailvorlagen ist mit dem Aufräumen der Altkomponenten entfernt. Der Text nennt kein Kontaktformular mehr. |
| O6 | ~~Ist WhatsApp Business auf 06441 42956 aktiv (Roadmap §13)?~~ **Beantwortet 2026-10-10:** WhatsApp läuft nur über die Mobilnummer 0160 8834290 (`lib/data/contact.ts` `WHATSAPP`); 06441 42956 bleibt Telefon, Impressum und JSON-LD. | Text unverändert: Er beschreibt nur die Click-to-Chat-Links und nennt keine WhatsApp-Nummer. Die Fassung `2026-10-10` hat einen anderen Grund (Bewerberdatenbank). |
| O7 | Nutzt das Team für Bewerbungen KI-Werkzeuge (z. B. zum Zusammenfassen von E-Mails)? | Text sagt: keine KI. Bei „ja“ Abschnitt 2.5 anpassen. |
| O8 | Talentpool gibt es erst ab Phase 4 (Opt-in mit Double-Opt-in). | Der bisherige Satz (24 Monate nur mit Einwilligung) bleibt. |
| O9 | Ist 0160 8834290 ein WhatsApp-Business-Konto oder ein privates Konto? Auf welcher Rechtsgrundlage werden dort eingehende Bewerbungsnachrichten verarbeitet, und wie werden die Verläufe auf dem Gerät gelöscht? | Text beschreibt nur die Click-to-Chat-Links; Löschung der Verläufe nach `betrieb.md` §5 und §6. |
| O10 | Ist der Auftragsverarbeitungsvertrag (DPA) mit Supabase abgeschlossen (Supabase-Dashboard, Bereich Legal/DPA)? Welcher Vertragspartner (Firmenname, Anschrift) und welcher Mechanismus für die Übermittlung in die USA? | Text der Fassung `2026-10-10` nennt Supabase Inc. (USA) als Auftragsverarbeiter mit Datenbank in Frankfurt (`eu-central-1`). Der AVV sollte vorliegen, bevor Bewerbungen in die Datenbank gehen; bis dahin lässt sich die Datenbank mit `APPLICATION_SINK=email` abschalten. |

## 5. Hinweise an andere Teile der Website

- `components/apply/ContactStep.tsx`: „Mit dem Absenden gelten unsere Datenschutzhinweise.“ klang nach Einwilligung oder Vertragsbestandteil. **Umgesetzt:** „Wir verarbeiten deine Angaben für deine Bewerbung (Art. 6 Abs. 1 lit. b DSGVO). Mehr dazu in den Datenschutzhinweisen.“ mit Link auf `#bewerberdaten` (Roadmap §6: Hinweis mit Rechtsgrundlage statt Checkbox, DSB-Bestätigung ausstehend).
- `app/globals.css` setzt `@page { margin: 0 }` für alle Seiten. Beim Drucken von Datenschutz und Impressum fehlt dadurch der Seitenrand oben und unten. Vorschlag: Standardrand für alle Seiten und `margin: 0` nur für die Bewerbungsmappe (benannte Seite).
  **Umgesetzt 2026-10-10 (R5-RECHT-01):** Datenschutz und Impressum drucken auf der benannten Seite `recht` mit Rand (`components/recht/recht.module.css`); `app/globals.css` bleibt unverändert.

## 6. Checkliste „Bitte durch DSB prüfen“

- [ ] 2.3 Rechtsgrundlagen: neue Beispiele bei lit. a, b, f und der Absatz zu § 25 TDDDG
- [ ] 2.4 Hosting bei Vercel, Region `fra1`, weltweites Auslieferungsnetz
- [ ] 2.4 Server-Logdateien: 7 Tage und gekürzte IP bei Vercel zutreffend (O4)
- [ ] 2.4 Schutz vor Missbrauch (IP-Hash, 24 Stunden, Honeypot, Ausfülldauer, Spamverdacht ohne Eingangsbestätigung), Art. 6 Abs. 1 lit. f
- [ ] 2.4 Sicherheitsmeldungen des Browsers (CSP-Berichte in den Server-Logs), Art. 6 Abs. 1 lit. f
- [ ] 2.4 TLS „256 Bit“ zutreffend oder streichen
- [ ] 2.4 Übermittlung in die USA: Mechanismus je Anbieter (DPF oder Standardvertragsklauseln)
- [ ] 2.4 Übermittlung in die USA nennt seit der Fassung `2026-10-10` auch Supabase (O10)
- [ ] 2.5 Rechtsgrundlage Bewerbung: Art. 6 Abs. 1 lit. b, Hinweis EuGH C-34/21, Art. 88, § 26 BDSG nur ergänzend
- [ ] 2.5 Liste der erfassten Daten im 60-Sekunden-Flow vollständig
- [ ] 2.5 Pflichtangaben und Folgen der Nichtbereitstellung
- [ ] 2.5 Empfänger, Eingangsbestätigung, Auftragsverarbeiter Vercel und Resend (O3)
- [ ] 2.5 Fassung `2026-10-10`: Speicherung in der Bewerberdatenbank, Supabase Inc. (USA) als Auftragsverarbeiter, Datenbank in Frankfurt (`eu-central-1`), „Alle drei“ (O10)
- [ ] 2.5 Speicherdauer: 6 Monate, Personalakte bei Einstellung, Talentpool 24 Monate
- [ ] 2.5 Fassung `2026-10-10`: Speicherdauer gilt für E-Mails und Datenbank gleichermaßen; Löschung in der Datenbank bis Phase 2c per SQL
- [ ] 2.5 Keine automatisierte Entscheidung, kein Profiling, keine KI (O7)
- [ ] 2.5 Sperrvermerk in neuer Formulierung
- [ ] 2.6 Entwurf und Mappe im `sessionStorage`, § 25 Abs. 2 Nr. 2 TDDDG, Löschung alter `localStorage`-Daten
- [ ] 2.7 Herkunftsmessung: Art. 6 Abs. 1 lit. f, Interessenabwägung, Verhältnis zu § 25 TDDDG
- [ ] 2.8 Google Maps: Einwilligung per Klick, Speicherung `be:maps-consent:v1`, Widerruf, Angaben zu Google und DPF
- [ ] 2.9 Kontakt ohne Kontaktformular (O5) und WhatsApp-Absatz (O6 beantwortet, O9 offen)
- [ ] 2.10 „Keine Cookies, keine Pixel, keine Analyse“ und Schriften-Absatz
- [ ] 2.10 Schriftnamen-Korrektur vom 2026-10-10 (Bricolage Grotesque, Atkinson Hyperlegible Next, Martian Mono statt Inter; M-019)
- [ ] 2.11 Ergänzungen bei den Rechten (Google-Maps-Widerruf, Kontaktzeile)
- [ ] 1 Anrede „du“ in Datenschutzerklärung und Impressum
- [ ] 3 Impressum: DDG-Verweise (geändert), OS-Satz entfernt, § 36 VSBG (Prüfpunkt)
- [ ] 5 Hinweistext im Bewerbungsformular mit Art. 6 Abs. 1 lit. b DSGVO
