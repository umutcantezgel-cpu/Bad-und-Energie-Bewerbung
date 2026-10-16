# Referenz-Entwurf: Karriereseite für die Bad und Energie GmbH

ENTWURF, Stand 16.10.2026. Nur aus Belegen im Repository. Die Fundstellen stehen in Klammern, Pfade ab dem Projektordner. Nicht veröffentlichen, bevor die offenen Fragen in Abschnitt 9 geklärt sind.

## 1. Kurzfassung
- Kunde: Bad und Energie GmbH Lahn Dill, SHK-Meisterbetrieb in Wetzlar, seit 1926 (lib/content/facts.ts:90-91; README.md, Kopf).
- Projekt: Karriereseite karriere.bad-energie.de mit offenen Stellen, Einsatzgebiet und einem Bewerbungsablauf (README.md, Kopf und Abschnitt 1).
- Leistung: Webdesign & Entwicklung (Auftrag Abschnitt 0, Standardwert LEISTUNG). Das Repository nennt Coday Web nirgends (berichte/E0-KUNDSCHAFTER-01.md, Punkt 11). Die Angabe stammt aus dem Auftrag.
- Verhältnis: Coday Web arbeitet im Auftrag der Bad und Energie GmbH (_werkstatt/nennung/ENTSCHEIDUNGEN.md, N-02).

## 2. Technik
- Next.js 16 mit App Router und Server Components, React 19, TypeScript, Tailwind CSS 4 (package.json; README.md, Kopf).
- Hosting auf Vercel, Region fra1 (vercel.json; README.md, Kopf).
- Bewerbungsdaten: Supabase-Datenbank in Frankfurt, Versand über Resend (README.md, Kopf).
- Startseite und die meisten Seiten werden vorab erzeugt und stündlich neu erstellt (app/page.tsx:24, `revalidate = 3600`). Die Bewerbungsseite wird bei jedem Aufruf erzeugt (app/bewerbung/page.tsx:59-60, liest die Suchparameter).
- Automatische Prüfungen im Projekt: Vitest, Playwright mit axe (README.md, Kopf; package.json, Skripte test und e2e).

## 3. Seiten
- Startseite, Stellenübersicht /jobs, 8 Stellenseiten. Alle 8 haben den Status „published“ (lib/jobs/data/*.ts). Titel wörtlich: „Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d)“; „Ausbildung zum Anlagenmechaniker SHK (m/w/d)“ (zweimal, eine Datei für 2027); „Bürofachkraft (m/w/d) in Voll- oder Teilzeit“; „Kundendiensttechniker SHK / Servicemonteur (m/w/d)“; „Obermonteur / Projektleiter SHK & Badsanierung (m/w/d)“; „Quereinsteiger und Montagehelfer SHK (m/w/d)“; „Schülerpraktikum Anlagenmechaniker SHK (m/w/d)“.
- Einsatzgebiet: 54 Orte im 35-km-Gebiet und 4 Kreisseiten (README.md, Routentabelle).
- Themenseiten „Arbeiten bei uns“: 6 Themen (lib/themen/registry.ts:43-48). Die README nennt fünf; gültig ist der Code.
- Bewerbungsablauf /bewerbung, Bestätigung /bewerbung/danke, Bewerbungsmappe /bewerbung/mappe, Impressum, Datenschutz (README.md, Routentabelle; app/bewerbung/mappe/page.tsx).
- Prüflauf: 84 Seiten geprüft, davon 81 mit Status 200, 2 Weiterleitungen, 1 Fehlerseite (protokolle/links.md; Messart: Linkprüfer mit Standard- und Googlebot-Abruf, Stand b0ae185).

## 4. Sprachen
- Eine Sprachfassung: Deutsch (app/layout.tsx:80, `lang="de"`). Keine weiteren Sprachfassungen, keine Übersetzung.

## 5. Funktionen
- Bewerbung in einem Ablauf: ein paar Fragen zum Antippen, Name und Telefon, kein Lebenslauf nötig (README.md, Kopf).
- Die Seite nennt die Bewerbung „ca. 60 Sekunden“ (lib/content/facts.ts:211-216). Nicht gemessen, siehe Abschnitt 9.
- Stellen-Feeds für Jobbörsen: indeed.xml, jobs.xml und jobs.json, stündlich neu (README.md, Routentabelle).
- Suchmaschinen: Sitemap, llms.txt, Strukturdaten je Seite (JSON-LD), Meldung von Adressen an IndexNow (README.md, Routentabelle; components/site/site-jsonld.ts).
- Google-Karte erst nach dem Klick des Besuchers (lib/maps/consent.ts:1-8).
- Bestätigungsseite mit Bewerbungsnummer und Kontaktdatei zum Speichern (.vcf) (README.md, Routentabelle; components/apply/thanks/DankeErfolg.tsx:121).
- Bewerbungsmappe als A4-Vorschau zum Speichern als PDF oder Drucken, freiwillig (app/bewerbung/mappe/page.tsx:15).
- Keine KI-Funktionen, keine Tracking-Cookies, keine Fotos (README.md, Kopf). Auf der Bewerbungsseite werden UTM-Parameter und ref erfasst, ohne Cookie (README.md, Routentabelle /bewerbung; components/analytics/AttributionCapture.tsx).

## 6. Bildmotive (Vorschläge)
Es gibt keine Fotos. Die Motive sind die technischen Zeichnungen aus dem Code.
- Vorschlag 1: Hausschnitt mit Wärmepumpe. Außeneinheit, Erdleitung und Heizkörper im Schnitt durch das Haus, 1 Einheit = 10 mm. Das Innengerät ist nur ein Symbol, das Modell ist offen. Das ist der Einstieg der Startseite (components/home/einstieg/Szene.tsx:20; lib/zeichnung/szenen/hausschnitt.ts, Kopf).
- Vorschlag 2: Wärmefeld in Ebenen (components/zeichnung/waerme/Waermefeld.tsx).
- Vorschlag 3: Kältekreis (lib/zeichnung/szenen/kaeltekreis.ts).
- Vorschlag 4: Servicefahrzeug (lib/zeichnung/szenen/fahrzeug.ts). Es ist ein allgemeiner Kastenwagen mit geschätzten Maßen, kein Fahrzeug des Betriebs (Kopf der Datei). Vor einer Verwendung als Bild für den Kunden klären.
- Nicht als Motiv verwenden, bis die Herkunft geklärt ist: Logos, Cursor, Icons (_werkstatt/nennung/MENSCHEN.md, Abschnitt 3).

## 7. Messwerte
Messungen am lokalen Produktions-Build, nicht an der Live-Seite. Vor einer Veröffentlichung an der Live-Seite prüfen.
- Startseite, 1440 × 900: 38 Anfragen, wie vor der Nennung. 540,5 KB komprimiert übertragen. Messart: Browser-Protokoll (Chrome DevTools), Median aus 3 Läufen (_werkstatt/nennung/protokolle/leistung.md).
- Startseite: Layoutverschiebung 0,0000 in 3 Läufen. Messart: Layout-Shift-Messung 5 Sekunden nach dem Laden (protokolle/leistung.md).
- Barrierefreiheit im Fuß: 0 Befunde in 12 Prüfungen. Messart: axe, WCAG 2.2 AA (protokolle/zugang.md).
- Nicht als Stärke verwenden: Lighthouse-Leistung der Startseite 0,93 gegen Mindestwert 0,95, Stand a4491d5, Warnung in allen 3 Läufen (berichte/E0-PRUEFER-02.md, Punkt 4).

## 8. Was wir nicht behaupten
- Keine Auszeichnungen. Die „Partnerurkunde 2026“ in lib/data/company.ts:69 ist im Repository nicht belegt (MENSCHEN.md, Abschnitt 3).
- Keine Zahlen zu Bewerbungen oder Besetzungen. Im Repository ist dazu nichts belegt.
- Keine Superlative.

## 9. OFFENE FRAGEN
1. Zustimmung der Bad und Energie GmbH, dass sie mit Namen, Bildern und Beschreibung als Referenz auf codayweb.de steht. Liegt nicht vor. MENSCHEN.md deckt nur die Nennung im Fuß ab.
2. Kundenstimme: Im Repository gibt es kein Zitat über Coday. Die „Stimmen von Kunden und Team“ auf der Kundenseite (components/home/betrieb/betrieb-text.ts:78) gehören zum Betrieb und sind keine Aussage über Coday.
3. Geschäftsergebnisse: Im Repository sind keine Zahlen belegt. Zahlen nur mit Messart und Zustimmung des Kunden, sonst weglassen.
4. „ca. 60 Sekunden“ für eine Bewerbung ist eine Angabe im Code (lib/content/facts.ts:211-216, Quelle laut Eintrag app/page.tsx@393df01) und nicht gemessen.
5. Lighthouse-Warnung (0,93 gegen 0,95, Stand a4491d5): Ob sie inzwischen behoben ist, ist nicht gemessen.
6. Die Leistung „Webdesign & Entwicklung“ und die Aussage „gebaut von Coday Web“ stammen nur aus dem Auftrag. Bestätigung durch den Inhaber nötig.
7. Bildrechte: Herkunft von Logos, Cursor, favicon und Icons ist im Repository nicht belegt (MENSCHEN.md, Abschnitt 3).
8. Linkziel: LINKZIEL ist nicht gesetzt, es gilt die Startseite codayweb.de/de. Gibt es eine eigene Referenzseite, die als Linkziel dienen soll? Dann ändert sich der Auftrag, Abschnitt 0.
9. Die README nennt fünf Themen, der Code sechs (lib/themen/registry.ts:43-48). Diese Abweichung betrifft nur die Dokumentation des Kunden.
