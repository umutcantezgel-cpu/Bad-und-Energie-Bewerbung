# Fakten-Abgleich (Owner-Liste)

Stand: 2026-10-08 · Schritt 1.1 der Roadmap, ergänzt nach dem Text-Review (B22–B26, D)

Beim Zusammenführen von Stellen und Fakten in `lib/jobs/**` und `lib/content/**` sind abweichende Formulierungen aufgefallen. Regel: Es wird nichts erfunden. Bei Widersprüchen gilt die vorsichtigste bzw. neueste Formulierung (Fakten-Fixes: HRB 2449, 1926–2026, 5 Partner-Säulen, Siegmund-Hiepe-Str. 20, 15 Mitarbeiter).

Bitte jede Zeile mit **ok** oder einer Korrektur beantworten. Änderungen dann per PR in `lib/content/facts.ts` bzw. `lib/jobs/data/*.ts`.

## A. Offene Aussagen aus ROADMAP §13

Diese Fakten sind in `facts.ts` mit `pending` markiert. Der Test lässt sie nur bei den genannten Stellen zu.

| # | Aussage | Fundstellen | Verwendung bis zur Klärung | Frage |
|---|---|---|---|---|
| A1 | Übernahmegarantie nach der Gesellenprüfung | `app/page.tsx` (Karte 04), JSON-LD Azubi, `services.ts` („100 Prozent Übernahmegarantie“), `pricing.constants.ts`, Header, Footer | nur Ausbildung (`takeoverGuarantee`) | Gilt die Garantie ohne Einschränkung? |
| A2 | Firmenfahrzeug mit 1-%-Privatnutzung | `app/page.tsx` (Karte 03, Obermonteur) | nur Obermonteur (`privateCarOnePercent`) | Gilt das nur für Obermonteure oder für alle Fahrzeuge? |
| A3 | Gehalt am 1. Werktag | `pricing.constants.ts`, `SalaryCalculator.tsx` | nirgends (`payFirstWorkday`) | Bestätigen, dann auf allen Fachkraft-Stellen nutzbar. |
| A4 | Rückmeldung binnen 24 Stunden | Hero, HeroExpressFunnel, VaultView, PrintA4View, LeadQuickForm | „Wir melden uns schnellstmöglich“ (`quickResponse`) | Soll „24 Stunden“ wieder versprochen werden? |
| A5 | Titel Sabri Demir | `team.ts` „Geschäftsführer und Meister“, `site-config.ts`/Layout „Geschäftsführer und Diplomingenieur“, Hero „Inhaber und Werkstattleitung“, diverse „Meister Sabri Demir“ | „Geschäftsführer und Meister“ (aus `team.ts`): Ansprechpartner auf den Stellenseiten, `llms.txt`. Fakt `directLine`: „Geschäftsführer Sabri Demir“. Impressum: „Diplomingenieur Sabri Demir“ (Geschäftsführung, wie bisher). Das zusätzliche „Dipl.-Ing. Sabri Demir“ im Obermonteur-Intro ist entfallen (stand doppelt neben `directLine`). | Welcher Titel ist richtig, und soll er überall gleich lauten (auch im Impressum)? |

## B. Widersprüche zwischen Quellen

| # | Thema | Fundstellen (Wortlaut) | Im Registry | Frage |
|---|---|---|---|---|
| B1 | USt-IdNr. | `site-config.ts` `vatID: 'DE301642296'` (auch im E-Mail-Footer) · Impressum, Datenschutz, Footer: „DE 346 648 448“ | nicht übernommen | Welche Nummer stimmt? `site-config.ts` und E-Mail-Footer müssen angepasst werden (nicht Teil von 1.1). |
| B2 | Firmenname im JobPosting | alte JobPostings: „Bad & Energie GmbH“ · `company.ts`, Impressum: „Bad und Energie GmbH Lahn Dill“ | rechtlicher Name „Bad und Energie GmbH Lahn Dill“ | – |
| B3 | Partner-Säulen | TrustStrip: „5 Partner-Säulen: Buderus, Bosch, NIBE, Alpha Innotec, Viessmann“ (5 Marken) · `company.ts`: Buderus & Bosch als eine Säule + NIBE + Alpha Innotec + Viessmann + Lahn-Dill-Kreis | Zahl 5, Liste aus `company.ts` | Wie werden die 5 Säulen gezählt? |
| B4 | Bewerbungsdauer | „unter 60 Sekunden“ (Hero, ProcessSteps, QuickApply) · „120 Sekunden“ (HeroExpressFunnel) · „in zwei Minuten“ (FAQ) · „unter zwei Minuten“ (`/bewerbung`) · „unter 30 Sekunden“ (Upload) | „ca. 60 Sekunden“ (neuer Flow, ROADMAP §2); FAQ-Antwort ohne Zahl | – |
| B5 | Ausbildungsstart | „ab August 2026“ (JSON-LD, Karte 04, Header, Footer, Gehaltsrechner) | „Ausbildung 2026: Einstieg noch möglich“, Start nach Absprache (Owner-Entscheidung); `validThrough` 31.12.2026, weil Texte „2026“ nennen | Bis wann ist der Einstieg 2026 möglich (früheres Ende)? Wann startet die Ausschreibung für 2027? |
| B6 | Fahrtkosten Azubi | „Fahrtkostenzuschuss“ (Gehaltsrechner, JSON-LD, Karte 04) · „volle Fahrtkostenübernahme“ (`services.ts`) | Zuschuss | Zuschuss oder volle Übernahme? |
| B7 | Privatnutzung Fahrzeug | „Privatnutzung“ (JSON-LD Anlagenmechaniker, TrustStrip, `company.ts`) · „1:1 Privatnutzung ab Wohnort“ (Gehaltsrechner Kundendienst) · „Mitnahme nach Hause möglich“ (Gehaltsrechner Anlagenmechaniker) · FAQ: „je nach Aufgabenbereich und Absprache … direkte Anfahrt vom Wohnort“ | `vehicle`: Privatnutzung, Fahrt ab Wohnort je nach Aufgabenbereich und Absprache; „1:1“ entfällt | Gilt die Privatnutzung für jede Rolle? |
| B8 | Tankkarte | JSON-LD Kundendienst und Obermonteur · llms.txt, AIAnswerBox, Einsatzgebiet: allgemein | nur Kundendienst (Paket) und Obermonteur (`fuelCard`) | Tankkarte für alle Fahrzeuge? |
| B9 | iPad und Smartphone | Startseite allgemein („Dein Firmen Smartphone und Tablet“) · stellenbezogen nur Kundendienst | Anlagenmechaniker, Kundendienst; nicht Ausbildung/Quereinstieg | Bekommen Azubis und Helfer auch Geräte? |
| B10 | „bezahlt ins Wochenende“ | JSON-LD, Gehaltsrechner, Startseite · `company.ts`: „Freitags ab 13:30 Uhr Feierabend“ | ohne „bezahlt“ (mehrdeutig) | Ist die Zeit bis Freitag 16:45 Uhr bezahlt? |
| B11 | Zulagen und Prämien | Kundendienst: „Qualitätsprämien“ · Obermonteur: „Führungszulage“ (Karte) und „Erfolgsprämien“ (JSON-LD) · Gehaltsrechner-Extras: „Spezialisten-Zulage“ (Wärmepumpenschein), „Monatliche Sauberkeits- und Kundenzufriedenheitsprämie“ | rollenbezogene Prämien übernommen; die beiden bedingten Extras nicht | Gibt es Spezialisten-Zulage und Monatsprämie wirklich? |
| B12 | Wäscheservice | nur `llms-full.txt` („Berufsbekleidung inklusive Wäscheservice“) | nicht übernommen; nur „Arbeitskleidung gestellt“ | Gibt es einen Wäscheservice? |
| B13 | Ausgezeichneter Ausbildungsbetrieb | nur Footer („Ausgezeichneter Ausbildungsbetrieb im Handwerk“) | nicht übernommen | Welche Auszeichnung ist gemeint? |
| B14 | Führender Wärmepumpen-Spezialist | Meilenstein 2026 („zum führenden Spezialisten für Wärmepumpen in der Region“) | gekürzt auf „Wärmepumpen-Spezialist“ | „führend“ belegbar? |
| B15 | Bad-Partner | FAQ: „ELEMENTS, VIGOUR, Kermi und Geberit“ (Startseite zusätzlich „Fußbodenheizungen“) · Einsatzgebiet: „VIGOUR, Kermi & Keuco“ · `services.ts`: „Geberit und Vigour“ | FAQ-Wortlaut der Startseite | – |
| B16 | FAQ-Frage 5 | Startseite: „… Fernmontagen oder Notdienst Zwang?“ · JSON-LD: „… Fernmontagen oder Wochenendarbeit?“ | „Gibt es Fernmontagen oder Wochenendarbeit?“ (passt zur Antwort) | – |
| B17 | Ortsliste | Startseite nennt „Hohenahr“ · `locations.ts` und `site-config.ts` nicht | Orte nur aus `locations.ts` (mit km und Fahrzeit) | Hohenahr ergänzen (dann mit km/Minuten)? |
| B18 | Telefonformat | „(06441) 42956“ (`company.ts`, Header, Footer) · „06441 42956“ (`site-config.ts`, Impressum) | „06441 42956“ (DIN 5008) | – |
| B19 | Logo im Schema | Layout: `bad-energie-lahn-dill-logo.webp` · `lib/seo/schema.ts`: `…-transparent.webp` | wie Layout | – |
| B20 | Lehrjahr Jonas Weber | `lib/data/team.ts`: „Auszubildender 2. Lehrjahr“, „Seit August 2024 im Betrieb“ (ab August 2026 rechnerisch 3. Lehrjahr) | „Auszubildender“, „Seit August 2024 im Betrieb“ (`lib/content/team.ts`) | Aktuelles Lehrjahr? Bleibt es beim Zitat auf der Ausbildungsseite? |
| B21 | Betriebszugehörigkeit | `lib/data/team.ts`: Koch „6 Jahre im Betrieb“, Becker „4 Jahre im Betrieb“, ohne Stichtag | nicht angezeigt (`lib/content/team.ts`) | Seit wann sind beide im Betrieb (Monat/Jahr)? Dann als „Seit … im Betrieb“. |
| B22 | Weitere Teamstimmen | `lib/data/reviews.data.ts` `teamRecruitingReviews`: Michael S., Christian W., Tim K., Dennis M. („Mitarbeiter Stimme“). Aussagen u. a. „Das beste und menschlichste Arbeitsklima in ganz Mittelhessen“, „hält sein Wort bei Gehalt und Zulagen“, „wurde sofort unbefristet übernommen“ (Übernahme ist A1), Rolle „Quereinsteiger SHK Montage“ | **nicht angezeigt.** Der Filter „Team“ im Bewertungs-Karussell zeigt nur die freigegebenen Zitate von Koch, Becker und Weber (`components/reviews/data.ts`); das Zitat von Sabri Demir steht direkt darüber | Sind diese vier Personen echt, und sind ihre Zitate freigegeben? Dann `TEAM_REVIEW_IDS` bzw. die Datenquelle erweitern. |
| B23 | Wochenendarbeit | FAQ „Fernmontage“ (alte Startseite und FAQPage): „Du bist jeden Nachmittag pünktlich zu Hause. Wochenendarbeit ist ausgeschlossen.“ · `company.ts`/Fakt `noWeekendOnCall`: „Keine Notdienstpflicht am Wochenende“ · Einsatzgebiet: „jeden Abend pünktlich zu Hause“ | abgeschwächt auf den Fakt: „Du bist jeden Abend pünktlich zu Hause, und am Wochenende hast du frei.“ | Ist Wochenendarbeit wirklich ausgeschlossen (dann darf die FAQ das wieder sagen), oder gibt es Ausnahmen (z. B. Notfälle)? |
| B24 | Name der Innung | `lib/data/company.ts` und `site-config.ts`: „Innung Sanitär Heizung und Klimatechnik Lahn Dill“ · `README.md@393df01`: „Innung Sanitär-, Heizungs- und Klimatechnik Lahn-Dill“ | Schreibweise aus der README (Footer, E-Mail-Fußzeile, `llms-full.txt`) | Wie lautet der offizielle Name der Innung genau? |
| B25 | Google-Bewertungen | `reviews.data.ts` `googleOverviewStats`: 5,0 und 24 Bewertungen, ohne Datum und ohne Profil-Link (ROADMAP §13) | Bewertungszeile **ausgeblendet**, bis `asOf: 'JJJJ-MM'` gesetzt ist; dann erscheint sie mit „Stand: …“. Die 10 zitierten Google-Bewertungen bleiben im Karussell | Bitte aktuelle Zahlen, Monat der Abfrage und den Link zum Google-Profil nennen. |
| B26 | Team-Größe im Text | Meilenstein 2026: „Zurzeit sind 15 Mitarbeiter im Betrieb tätig“ · Startseite: „15 Leute“ | Fakt `employees15`, im Text „15 Leuten“ (ROADMAP §5.6 „15 Leute“); die Zahl kommt nur noch aus `facts.ts` | Stimmt die Zahl noch? Bei Änderung nur `employees15.value` anpassen. |

## C. Stellentitel und Texte

| # | Stelle | Varianten | Im Registry |
|---|---|---|---|
| C1 | Anlagenmechaniker | JSON-LD „… für Wärmepumpen & Heizungstechnik (m/w/d)“ · Header/Footer „… für Sanitär Heizung und Klimatechnik“ · Funnel „Anlagenmechaniker SHK m w d“ | JSON-LD-Titel |
| C2 | Kundendienst | JSON-LD „Kundendiensttechniker SHK / Servicemonteur (m/w/d)“ · Funnel „Kundendiensttechniker Wärmepumpe“ · Quiz „Kundendienstmonteur SHK“ · Gehaltsrechner „Kundendienstmonteur und Servicetechniker“ | JSON-LD-Titel |
| C3 | Obermonteur | JSON-LD „Obermonteur / Projektleiter SHK & Badsanierung (m/w/d)“ · llms-full „Obermonteur und Bauleitender Handwerker für anspruchsvolle Bäder“ | JSON-LD-Titel |
| C4 | Ausbildung | JSON-LD „Auszubildender zum Anlagenmechaniker SHK 2026“ · Karte/Footer „Ausbildung zum Anlagenmechaniker SHK 2026“ | Titel (Schema, Feeds) „Ausbildung zum Anlagenmechaniker SHK (m/w/d)“ ohne Jahr; „2026“ in Meta-Title und H1 |
| C5 | Quereinstieg | „Quereinsteiger und Montagehelfer“ · „Montagehelfer und Quereinsteiger“ · Footer „Quereinsteiger Haustechnik und Montagehelfer“ | „Quereinsteiger und Montagehelfer SHK (m/w/d)“, `funnel_only`, ohne Gehalt |

**Bitte prüfen:**
- **Anforderungen** („Das bringst du mit“): Die Quellen nennen nur Abschluss, Berufserfahrung in Monaten (12/24/36/0) und für Helfer den Führerschein Klasse B. Die übrigen Punkte sind aus Arbeitsstil-Texten (Quiz) und Zitaten abgeleitet.
- **Führerschein für Fachkräfte:** Ein Führerschein Klasse B ist für Fachkräfte nirgends als Pflicht genannt und steht deshalb nicht in den Anforderungen. Soll er dort stehen?
- **Gehaltsspannen** stammen aus den bisherigen JobPostings: 3.600–4.600 €, 3.800–4.900 €, 4.400–5.600 € und 1.050–1.400 € (Ausbildung, über alle Lehrjahre?). Sie sind jetzt sichtbar (Owner-Entscheidung). Bitte bestätigen, dass sie aktuell sind.
- **Startdatum:** Für Fachkräfte nennt keine Quelle einen Start. Im Registry steht deshalb „nach Absprache“. Soll dort „ab sofort“ stehen?
- **BERUFENET-ID:** `ba.berufenetId` ist leer. Die ID bitte bei der BA nachschlagen und nicht schätzen.

## D. Texte im Bewerbungsflow (bitte freigeben)

| # | Frage | Optionen (IDs bleiben gleich) | Anmerkung |
|---|---|---|---|
| D1 | Fachkräfte: „Was trifft auf dich zu?“ | „Geselle, unter 2 Jahren“ · „Geselle, 2–5 Jahre“ · „Geselle, über 5 Jahre“ · „Meister oder Techniker“ · „Andere Ausbildung“ | Wie ROADMAP §6. „oder Quereinstieg“ entfällt, Quereinstieg hat ein eigenes Fragenset. |
| D2 | Quereinstieg: „Was machst du aktuell?“ | „Im Handwerk (anderes Gewerk)“ · „In einer anderen Branche“ · „Gerade etwas anderes“ | Neu formuliert (Flow-Review); bitte bestätigen. |
| D3 | Datenschutz-Hinweis über „Bewerbung absenden“ | „Wir verarbeiten deine Angaben für deine Bewerbung (Art. 6 Abs. 1 lit. b DSGVO). Mehr dazu in den Datenschutzhinweisen.“ | ROADMAP §6: Hinweis statt Checkbox; DSB-Bestätigung steht aus (siehe `datenschutz-aenderungen.md` §5). |
