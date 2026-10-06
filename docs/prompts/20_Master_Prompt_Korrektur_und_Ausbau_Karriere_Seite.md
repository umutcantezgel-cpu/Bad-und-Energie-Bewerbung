# MASTER-PROMPT: KORREKTUR & STRATEGISCHER AUSBAU DES KARRIEREPORTALS
# Ziel-Repository: c:\Users\Umutcan.Tezgel\Downloads\Bad-und-Energie-Bewerbung-main (karriere.bad-energie.de)
# Stack: Next.js 16.3.8 · React 19 · TypeScript 5.9 · Tailwind CSS 4 · Vercel Edge Deployment
# Auftrag: Daten-Korrektur (HRB 2449, 100 Jahre, Meilenstein 2026, 5 Partner), Wärmepumpen-Offensive & Conversion-Ausbau

---

Du bist Senior Lead Developer und Conversion-Architekt für das Next.js 16 Karriereportal der **Bad & Energie GmbH**.

Dein Auftrag ist die vollständige redaktionelle und technische Korrektur sowie der gezielte Ausbau des Karriereportals zur Gewinnung qualifizierter Anlagenmechaniker SHK, Servicemonteure und Auszubildender im Lahn-Dill-Kreis.

Führe folgende 4 Kernmodule schlüsselfertig im Repository aus:

---

## MODUL 1: UNTERNEHMENSDATEN-KORREKTUR & RECHTLICHE HARMONISIERUNG

Beseitige alle Dateninkonsistenzen und verankere die aktuellen Firmenfakten:

1. **Amtliches Handelsregister korrigieren:**
   * In [`lib/data/company.ts`](lib/data/company.ts), [`lib/seo/site-config.ts`](lib/seo/site-config.ts) und [`app/impressum/page.tsx`](app/impressum/page.tsx) die falsche HRB-Nummer ersetzen durch:
     ```typescript
     handelsregister: 'HRB 2449 Amtsgericht Wetzlar',
     ```
2. **100-Jahre-Firmenjubiläum (1926–2026):**
   * Entferne Formulierungen wie „fast 100 Jahre“. Es gilt das klare Bekenntnis: **„100 Jahre Meisterbetrieb (1926–2026)“**.
   * Verankere dieses Jubiläum im Hero-Badge auf der Startseite, im `PrintA4View.tsx`-Briefkopf und in allen Trust-Elementen als Beweis für höchste Arbeitsplatzsicherheit.
3. **Neuer Meilenstein 2026 & Umzug zur Siegmund-Hiepe-Str. 20:**
   * Ergänze den offiziellen Meilenstein 2026 im Über-uns- und Story-Bereich:
     > *„Meilenstein 2026: Durch das stetige Wachstum unseres Betriebes war ein Umzug in eine neue und größere Betriebsstätte unausweichlich. Der Hauptstandort wurde in die Siegmund-Hiepe-Str. 20 in Wetzlar verlagert für ein moderneres Büro und ein größeres Lager. Die Bad & Energie GmbH hat sich zum führenden Spezialisten für Wärmepumpen in der Region etabliert. Zusätzlich besteht die Partnerschaft als Fachbetrieb für den Lahn-Dill-Kreis zur Betreuung und Instandhaltung öffentlicher Einrichtungen. Zurzeit sind 15 Mitarbeiter im Betrieb tätig und arbeiten stetig daran, die Heizungen und Bäder der Kunden zu modernisieren. Dabei gilt: ‚Schöner Wohnen mit Top-Qualität‘.“*
4. **Die 5 offiziellen Partner-Säulen verankern (Markenbereinigung):**
   * Lösche sämtliche veralteten Referenzen auf „Brötje“ (z. B. in `services.ts` und `site-config.ts`) und markenfremde Fabrikate wie Samsung.
   * Hinterlege die 5 echten Partner-Säulen:
     1. **Buderus & Bosch Partnerbetrieb** (Partnerurkunde 2026, 14,8 km Werksnähe zum Buderus-Stammwerk Lollar).
     2. **NIBE Effizienzpartner** (Berechtigung zur Vergabe von 7 Jahren Herstellergarantie).
     3. **Alpha Innotec zertifizierter Inbetriebnahme-Partner**.
     4. **Viessmann Fachbetrieb**.
     5. **Fachbetriebspartner des Lahn-Dill-Kreises** für öffentliche Liegenschaften.

---

## MODUL 2: WÄRMEPUMPEN-FOKUS & STELLENPROFIL-EXPANSION

Passe die Leistungs- und Stellendaten in [`lib/data/services.ts`](lib/data/services.ts) und den Stellenangeboten an:

1. **Wärmepumpen als Hero-Gewerk:**
   * Aktualisiere Service `srv-01` in `services.ts`:
     * Titel: *„Regenerative Wärmepumpensysteme“*
     * Kurzbeschreibung: *„Installation, hydraulischer Abgleich und Inbetriebnahme modernster Wärmepumpen von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann.“*
     * Features:
       * *„Buderus & Bosch Wärmepumpen mit 14,8 km Werksnähe Lollar“*
       * *„NIBE Premium-Systeme mit 7 Jahren Herstellergarantie“*
       * *„Alpha Innotec & Viessmann Inbetriebnahmen“*
       * *„Hilti Akku-Maschinenpark & digitale Messgeräte“*
       * *„Regionale Baustellen im 35 km Radius (Wetzlar, Gießen, Lahn-Dill)“*
     * Benefits für Bewerber:
       * *„Herstellerschulungen direkt bei Buderus, Bosch und NIBE“*
       * *„Arbeiten mit modernsten Hebehilfen (rückenschonende Montage)“*
       * *„Feste Arbeitszeiten: Freitags pünktlich ab 13:30 Uhr Feierabend“*
2. **Die 4 Zielstellen für 2026 schärfen:**
   * **Stelle 1:** Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d)
   * **Stelle 2:** Kundendiensttechniker SHK / Servicemonteur (m/w/d) – Fokus Wartung & Instandhaltung Liegenschaften Lahn-Dill-Kreis
   * **Stelle 3:** Obermonteur / Projektleiter SHK & Badsanierung (m/w/d)
   * **Stelle 4:** Auszubildender zum Anlagenmechaniker SHK 2026 (m/w/d) – 100 Jahre Ausbildungstradition, Meisterbetreuung durch Dipl.-Ing. Sabri Demir

---

## MODUL 3: BENCHMARK-BENEFITS & TRANSPARENZ FÜR HANDWERKER

Hebe die handfesten Vorteile im Bewerber-Funnel (`HeroExpressFunnel.tsx`), im Gehaltsrechner (`SalaryCalculator.tsx`) und auf den Stellenkarten hervor:
* **Geregelte Arbeitszeiten:** Montag bis Donnerstag 07:00–16:45 Uhr, **Freitag pünktlich ab 13:30 Uhr Feierabend** – kein Bereitschaftszwang am Wochenende.
* **Top-Ausstattung:** Persönlicher Hilti-Maschinenkoffer, Wiha-Werkzeuge, Arbeitskleidung von Engelbert Strauss / Mascot.
* **Fahrzeug & Mobilität:** Eigenes, voll ausgestattetes Firmenfahrzeug (auf Wunsch mit Privatnutzung nach 1%-Regelung).
* **Vergütung & Urlaub:** Überdurchschnittlicher Lohn deutlich über Handwerkstarif, Urlaubs- und Weihnachtsgeld, 30 Tage Urlaub, vermögenswirksame Leistungen & betriebliche Altersvorsorge.
* **Keine Montage-Reisen:** Ausschließlich regionaler Einsatz im Umkreis von maximal 35 km – jeden Abend pünktlich zu Hause bei der Familie.

---

## MODUL 4: GOOGLE FOR JOBS SCHEMA & TECHNISCHE VERIFIKATION

1. **Schema.org JSON-LD Aktualisierung:**
   * Stelle sicher, dass jede Stellenanzeige ein valides `JobPosting`-Schema ausliefert.
   * Arbeitgeber: `Bad & Energie GmbH`, Hauptsitz: `Siegmund-Hiepe-Str. 20, 35578 Wetzlar`.
   * Verknüpfung der Entitäten über `hiringOrganization.sameAs: ["https://bad-energie.de"]`.
2. **Zero-Breakage Build-Gate:**
   * Führe den vollständigen Build durch:
     ```bash
     bun run build   # bzw. npm run build
     ```
   * Verifiziere:
     * 0 TypeScript-Fehler.
     * 0 ESLint-Fehler.
     * Alle 13 statischen Routen fehlerfrei generiert.
     * DINA4-Dossier-Generierung (`PrintA4View.tsx`), Foto-Upload und Direkt-Upload funktionieren zu 100 % einwandfrei.
3. **Git Commit & Deployment:**
   ```bash
   git add .
   git commit -m "feat(expansion): HRB 2449, 100 years anniversary, milestone 2026, 5 partner pillars and heat pump focus"
   git push origin main
   ```
