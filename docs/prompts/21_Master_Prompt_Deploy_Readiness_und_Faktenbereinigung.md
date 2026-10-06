# MASTER-PROMPT: DEPLOY READINESS & VOLLSTÄNDIGE FAKTENBEREINIGUNG
# Ziel-Repository: c:\Users\Umutcan.Tezgel\Downloads\Bad-und-Energie-Bewerbung-main (karriere.bad-energie.de)
# Stack: Next.js 16.3.8 · React 19 · TypeScript 5.9 · Tailwind CSS 4 · Vercel Edge Deployment
# Mission: 100 % fehlerfreie Faktenbasis (HRB 2449, 100 Jahre, Meilenstein 2026, 5 Partner-Säulen) & Zero-Error Deploy Readiness

---

Du bist Lead Auditor für Code-Qualität, rechtliche Compliance und Vercel Deployment-Sicherheit der **Bad & Energie GmbH**.

### DIE AKUTE AUDIT-DIAGNOSE:
Ein vollautomatischer Codebase-Scan hat aufgedeckt, dass in über 20 Dateien noch veraltete, falsche oder abmahngefährdete Angaben enthalten sind:
* **Falsches Handelsregister:** In 5 Dateien steht fälschlicherweise `HRB 8459`. Das amtliche Handelsregister lautet **HRB 2449 Amtsgericht Wetzlar**.
* **Veraltetes Fabrikat (Brötje):** In 15 Dateien (u.a. `app/page.tsx`, `HeroExpressFunnel.tsx`, `QuizView.tsx`, `Footer.tsx`, `Header.tsx`, `services.ts`) steht fälschlicherweise noch „Brötje“. Die Bad & Energie GmbH verbaut und zertifiziert kein Brötje und kein Samsung!
* **Die echten 5 Partner-Säulen:**
  1. **Buderus & Bosch Partnerbetrieb** (Partnerurkunde 2026, 14,8 km Werksnähe zum Buderus-Stammwerk Lollar).
  2. **NIBE Effizienzpartner** (Berechtigung zur Vergabe von 7 Jahren Herstellergarantie).
  3. **Alpha Innotec zertifizierter Inbetriebnahme-Partner**.
  4. **Viessmann Fachbetrieb**.
  5. **Fachbetriebspartner des Lahn-Dill-Kreises** für öffentliche Einrichtungen.
* **100 Jahre Firmenjubiläum:** Exakt 100 Jahre Meisterbetrieb (1926–2026).
* **Neuer Standort & Meilenstein 2026:** Siegmund-Hiepe-Str. 20, 35578 Wetzlar (15 Mitarbeiter, modernes Büro, größeres Lager).

Führe folgende Bereinigungs- und Härtungs-Module schlüsselfertig im Repository aus:

---

## MODUL 1: FAKTEN-BEREINIGUNG ÜBER ALLE DATEIEN

Ersetze systematisch und rückstandslos alle veralteten Einträge in folgenden identifizierten Dateien:

### 1.1 Handelsregister korrigieren (HRB 8459 -> HRB 2449)
Ersetze `HRB 8459` durch `HRB 2449 Amtsgericht Wetzlar` in:
* [`app/impressum/page.tsx`](app/impressum/page.tsx)
* [`app/datenschutz/page.tsx`](app/datenschutz/page.tsx)
* [`components/Footer.tsx`](components/Footer.tsx)
* [`lib/data/company.ts`](lib/data/company.ts)
* [`lib/seo/site-config.ts`](lib/seo/site-config.ts)

### 1.2 Brötje & veraltete Marken entfernen & durch die 5 Partner-Säulen ersetzen
Ersetze alle Erwähnungen von „Brötje“ durch die offiziellen Partner **Buderus, Bosch, NIBE (7 Jahre Garantie), Alpha Innotec und Viessmann** in:
* [`app/page.tsx`](app/page.tsx) (Hero, Feature-Badges, FAQ-Antworten, Marken-Leiste)
* [`app/layout.tsx`](app/layout.tsx) (Metadata, Schema.org Beschreibungen)
* [`app/bewerbung/page.tsx`](app/bewerbung/page.tsx)
* [`components/HeroExpressFunnel.tsx`](components/HeroExpressFunnel.tsx) (Quiz-Schritte, Untertitel)
* [`components/Header.tsx`](components/Header.tsx) (Zertifizierungs-Ticker)
* [`components/Footer.tsx`](components/Footer.tsx) (Leistungs-Links)
* [`components/views/QuizView.tsx`](components/views/QuizView.tsx)
* [`components/pricing/pricing.constants.ts`](components/pricing/pricing.constants.ts)
* [`lib/data/services.ts`](lib/data/services.ts)
* [`lib/seo/site-config.ts`](lib/seo/site-config.ts)
* [`lib/recruiting-types.ts`](lib/recruiting-types.ts)

### 1.3 100 Jahre Firmenjubiläum & Meilenstein 2026 schärfen
* Formulierungen wie „fast 100 Jahre“ oder „über 90 Jahre“ strikt durch **„100 Jahre Meisterbetrieb (1926–2026)“** ersetzen.
* Den Standort **Siegmund-Hiepe-Str. 20, 35578 Wetzlar** und das 15-köpfige Meisterteam als Meilenstein 2026 im Story-Bereich und Briefkopf abbilden.

---

## MODUL 2: SECURITY-, DMARC- & API-DEPLOY-READINESS

1. **Edge Middleware (`middleware.ts`):**
   * Stelle sicher, dass die Next.js Edge Middleware aktiv ist:
     * Weist bekannte Scraper (SemrushBot, PetalBot, Scrapy etc.) mit HTTP 403 ab.
     * Schützt `/api/maps/config` vor unbefugtem Aufruf von Drittseiten.
     * Setzt strikte Security-Header (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).
2. **DMARC-Sicherheit in `lib/email/resend.ts`:**
   * Stelle sicher, dass Resend einen sicheren Fallback nutzt (`onboarding@resend.dev` oder die bei Resend verifizierte Subdomain), damit die E-Mail-Reputation von `bad-energie.de` (DMARC `sp=quarantine`) nicht durch SPF-Fehler gefährdet wird.
   * `toEmail` muss verlässlich `info@bad-energie.de` ansteuern, `replyTo` ist die Bewerber-E-Mail.
3. **Google Maps API-Schutz in `app/api/maps/config/route.ts`:**
   * Origin- und Referrer-Prüfung (`bad-energie.de`) aktiv, `Cache-Control: private, no-cache, no-store`.

---

## MODUL 3: ZERO-ERROR BUILD GATE & AUDIT-VERIFIKATION

Führe eine lückenlose Qualitätskontrolle durch:

1. **Fakten-Scan (Muss leer sein):**
   ```bash
   # Prüfe, dass kein HRB 8459 und kein Brötje mehr im Quelltext existiert
   git grep "HRB 8459"
   git grep -i "brötje"
   git grep -i "samsung"
   ```
   *Ergebnis muss 0 Treffer liefern!*

2. **TypeScript & ESLint Check:**
   ```bash
   npm run lint   # bzw. bun run lint -> 0 Fehler, 0 Warnungen
   ```

3. **Production Build mit Turbopack:**
   ```bash
   bun run build  # bzw. npm run build
   ```
   *Bedingungen für Freigabe:*
   * Exit-Code 0.
   * 13/13 statische Routen erfolgreich kompiliert.
   * Keine unhandled Promise Rejections.
   * DINA4-Dossier-Generierung (`PrintA4View.tsx`), Foto-Upload und Direkt-Bewerbung bleiben zu 100 % intakt.

---

## MODUL 4: DEPLOYMENT & VERCEL PUSH

Nach bestandenem Build-Gate:
```bash
git add .
git commit -m "fix(facts): HRB 2449, 100 years anniversary, 5 partner pillars (Buderus, Bosch, NIBE, Alpha Innotec, Viessmann), removal of Brötje and zero-error deploy readiness"
git push origin main
```
Verifiziere im Vercel-Dashboard, dass das automatische Redeployment den Status `Ready (Production)` erreicht.
