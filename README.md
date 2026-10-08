# karriere.bad-energie.de

Karriereportal der **Bad und Energie GmbH Lahn Dill** (SHK, Wärmepumpen, Bad; Wetzlar). Die Seite hat zwei Aufgaben: Bewerberinnen und Bewerber sollen die offenen Stellen finden, und das Bewerben soll so einfach wie möglich sein – ein Flow, ein paar Fragen zum Antippen, Name und Telefon, kein Lebenslauf nötig.

- **Live:** [karriere.bad-energie.de](https://karriere.bad-energie.de) · Kunden-Website: [bad-energie.de](https://bad-energie.de)
- **Stack:** Next.js 16 (App Router, Server Components), React 19, TypeScript, Tailwind CSS 4, zod, Resend. Paketmanager Bun, Tests mit Vitest und Playwright + axe. Hosting auf Vercel (Region `fra1`).
- **Verbindlicher Plan:** [`docs/ROADMAP.md`](docs/ROADMAP.md). Alle weiteren Dokumente: [`docs/README.md`](docs/README.md).

Die Website nutzt keine KI-Funktionen, keine Tracking-Cookies und keine Fotos.

## Inhalt

1. [Architektur](#1-architektur)
2. [Design-System](#2-design-system)
3. [Datenfluss einer Bewerbung](#3-datenfluss-einer-bewerbung)
4. [Reichweite](#4-reichweite)
5. [Sicherheit und Datenschutz](#5-sicherheit-und-datenschutz)
6. [Lokale Entwicklung](#6-lokale-entwicklung)
7. [Umgebungsvariablen](#7-umgebungsvariablen)
8. [Deployment auf Vercel](#8-deployment-auf-vercel)
9. [Stellen pflegen und Stellenbörsen](#9-stellen-pflegen-und-stellenbörsen)
10. [Roadmap und Stand](#10-roadmap-und-stand)
11. [Offene Owner-Punkte](#11-offene-owner-punkte)

---

## 1. Architektur

Alle Inhalte kommen aus zwei typisierten Quellen im Repo: dem **Stellen-Registry** (`lib/jobs`) und der **Fakten-Registry** (`lib/content`). Seiten, JSON-LD, Feeds, Sitemap und `llms.txt` werden daraus erzeugt. Komponenten referenzieren Fakten nur über IDs; kein Text erfindet eigene Aussagen.

### Routen

| Route | Zweck | Index |
|---|---|---|
| `/` | Startseite: Einstieg, offene Stellen, Vorteile, Einsatzgebiet mit Karte, Ablauf, Über uns und Stimmen, FAQ | ja |
| `/jobs` | Übersicht aller Stellen (ohne JobPosting-Markup) | ja |
| `/jobs/[slug]` | Stellenseite mit JobPosting- und Breadcrumb-JSON-LD, Gehaltsspanne, Teamzitat und eingebettetem Flow (`#bewerben`), eigenes OG-Bild. Besetzte oder abgelaufene Stellen zeigen „Besetzt“ (noindex, ohne JobPosting). Alte Slugs leiten dauerhaft um. | ja |
| `/bewerbung` | Der eine Bewerbungsflow. `?stelle=<slug>` bzw. `?stelle=initiativ` wählt vor, UTM-Parameter und `ref` werden erfasst. Alte `?tab=`-Links des Vorgängerportals werden umgeleitet. | ja |
| `/bewerbung/danke` | Bestätigung mit Bewerbungsnummer, optionale Ergänzungen, Kontakt als `.vcf` | noindex |
| `/bewerbung/mappe` | Bewerbungsmappen-Generator (A4-Vorschau, Druck/PDF), optional | noindex |
| `/datenschutz`, `/impressum` | Rechtstexte | noindex |
| `/feeds/indeed.xml`, `/feeds/jobs.xml`, `/feeds/jobs.json` | Feeds für Indeed, Aggregatoren und das Widget auf bad-energie.de, stündlich neu erzeugt | – |
| `/sitemap.xml`, `/llms.txt`, `/llms-full.txt` | Aus dem Registry erzeugt, stündlich neu | – |
| `/robots.txt` | Crawler-Regeln, sperrt `/api/` und `/admin/` | – |
| `POST /api/bewerbung` | Nimmt eine Bewerbung an | – |
| `POST /api/bewerbung/ergaenzung` | Ergänzungen und Mappe zu einer abgeschickten Bewerbung (Token) | – |
| `POST /api/indexnow` | Meldet URLs an IndexNow (Bearer-Token) | – |
| `POST /api/csp-report` | Sammelt CSP-Meldungen (Report-Only) | – |
| `GET /api/maps/config` | Maps-Key für die 2-Klick-Karte, nur für Aufrufe von der eigenen Seite | – |

Vorgesehen, aber noch nicht gebaut: `/admin` (Phase 2), `/lp/[slug]` (Phase 3), `/talentpool`, `/empfehlen`, `/r/[code]` (Phase 4).

### Module (`lib/`)

| Modul | Inhalt |
|---|---|
| `lib/jobs/` | Job-Domänenmodell mit zod (`schema.ts`), eine Datei je Stelle in `data/`, `registry.ts` (`getActiveJobs`, `getJobBySlug`, `getFunnelOptions` …), `jsonld.ts`, Feed-Builder in `feeds/`, Stellen-IDs in `ids.ts`, Slug-Sperre `slugs.lock.json` |
| `lib/content/` | Fakten-Registry `facts.ts` (jede Aussage mit ID und Quelle), dazu `faq`, `process`, `region`, `team`, `company`, `breadcrumbs` |
| `lib/data/` | Stammdaten (Firma, Kontakt, Orte, Bewertungen, Team), aus denen `lib/content` liest |
| `lib/applications/` | Bewerbungsvertrag: zod-Schema (`schema.ts`), Konstanten ohne zod für den Browser (`constants.ts`), Normalisierung, `sink.ts` (`ApplicationSink`, Phase 1 `EmailSink`), Bewerbungsnummer (`reference.ts`), Ergänzungs-Token (`token.ts`), Idempotenz, Antwortformat (`http.ts`) |
| `lib/apply/` | Flow-Logik im Browser: Fragen je Fragenset, Schrittfolge, Entwurf in `sessionStorage`, Absenden, Fehlertexte, WhatsApp-Fallback, vCard, Bürozeiten, URL-Parameter |
| `lib/mappe/` | Mappe-Editor, Anschreiben-Vorlage, Stationen, Speicher, Nachreichen an eine Bewerbung |
| `lib/attribution/` | UTM, `ref` und Referrer-Host → Kanal (`channel.ts`), nur im Arbeitsspeicher (`store.ts`) |
| `lib/email/` | Versand über Resend (`resend.ts`) und Mail-Vorlagen (Team, Eingangsbestätigung, Ergänzung) |
| `lib/security/` | `guardJsonPost` (Herkunft → Rate-Limit → Content-Type und Body-Größe), Rate-Limit, IP-Hash, Herkunftsprüfung, CSP-Meldungen |
| `lib/env.ts` | zod-Prüfung der Umgebungsvariablen, Start-Check, Dev-Fallbacks |
| `lib/seo/` | Metadaten, Canonicals, OG-Bilder, IndexNow, `site-config.ts` |
| `lib/maps/` | 2-Klick-Einwilligung, Maps-Loader, Fahrzeiten, Projektion der Radius-Grafik |
| `lib/tokens/`, `lib/utils/` | Design-Tokens für JS, `cn()`, CSRF-Prüfung, WhatsApp-Links |
| `lib/supabase/` | Clients für Phase 2, noch ungenutzt |

### Komponenten (`components/`)

| Ordner | Inhalt |
|---|---|
| `ui/` | Primitives (Button, Field, Input, ChoiceCard, SegmentedControl, Sheet, Disclosure, StatTile, StepHeader, Toast …) mit cva, standardmäßig Server-Komponenten. Import über `@/components/ui` |
| `site/` | Sticky Header, Menü-Sheet für Mobil, Footer, StickyApplyBar, Kontaktwege, globales JSON-LD |
| `home/` | Abschnitte der Startseite |
| `jobs/` | Bausteine der Stellenseite und JobCard |
| `apply/` | `ApplyFlow` (eingebettet auf `/bewerbung` und `/jobs/[slug]`), Schritte, Kontaktschritt, Fehlerpanel, Danke-Seite (`thanks/`) |
| `mappe/` | Mappe-Werkzeug und A4-Vorschau |
| `maps/` | Typografische Radius-Grafik mit Ortsliste, Google-Karte per 2-Klick |
| `reviews/` | Ruhiges Bewertungs-Karussell (Scroll-Snap, kein Autoplay) |
| `legal/` | Bausteine für Datenschutz und Impressum |
| `layout/`, `brand/`, `seo/`, `analytics/` | Section/Container, Logo, `JsonLd`, `AttributionCapture` |

Weitere Dateien im Wurzelverzeichnis: `proxy.ts` (Next-16-Nachfolger der Middleware), `next.config.ts` (Security-Header), `instrumentation.ts` (Start-Check der Umgebung), `vercel.json` (Region).

## 2. Design-System

Ruhig und typografisch, im Apple-Stil (Details: [ROADMAP §4](docs/ROADMAP.md#4-säule-a-design-system-im-apple-stil-typografisch)).

- **Tokens:** `app/styles/theme.css` definiert Primitive und semantische Rollen (`surface`, `surface-2`, `surface-3`, `ink`, `ink-muted`, `line`, `line-strong`, `accent`, `focus`, `success`, `danger`), hellen und dunklen Modus über `prefers-color-scheme` und den Inverse-Bereich `[data-tone="inverse"]`. Die Tailwind-Standardpaletten sind abgeschaltet (`--color-*: initial`). `app/globals.css` enthält die Basisstile, `lib/tokens/index.ts` die Werte für JavaScript.
- **Schrift:** Inter über `next/font`, selbst gehostet. Gewichte 400–700, Eingabefelder mindestens 17 px.
- **Regeln:** nur semantische Tokens; Crimson (`accent`) nur für die eine Primäraktion je Ansicht; Glas nur im Sticky Header; keine Fotos; Bewegung nur als Rückmeldung, bei `prefers-reduced-motion` nur Überblendungen. Ziel ist WCAG 2.2 AA.
- **Guard-Skripte** (laufen vor jedem Build über `prebuild` und in der CI):

| Skript | Prüft |
|---|---|
| `scripts/qa/check-design-tokens.mjs` | Verbotene Klassen in `app/`, `components/`, `lib/`: `text-[…]`, `font-mono`, schwere Gewichte, `animate-pulse/ping/bounce/marquee`, Hex-Farben, Rohpaletten, `uppercase`, Glas außerhalb des Headers u. a. Eine einzelne Zeile lässt sich mit einem `design-allow`-Kommentar ausnehmen. |
| `scripts/qa/check-contrast.mjs` | Kontrast aller Text- und Flächenpaare in hell, dunkel und im Inverse-Bereich |
| `scripts/qa/check-client-imports.mjs` | zod darf nicht im Browser-Bundle landen |
| `scripts/qa/check-graph.mjs` | Nach dem Build: JSON-LD gültig, JobPosting nur auf Stellenseiten (genau eins), Pflichtfelder, `url` = Canonical |

## 3. Datenfluss einer Bewerbung

1. **Einstieg.** `AttributionCapture` im Root-Layout merkt sich UTM-Parameter, `ref`, den Host der verweisenden Seite und den Einstiegspfad – nur im Arbeitsspeicher, ohne Cookie oder Browser-Speicher.
2. **Flow** (`components/apply`). Stelle wählen (entfällt bei `?stelle=`), ein bis zwei Fragen je Fragenset (Fachkraft, Ausbildung, Quereinstieg), dann Kontakt: Name, Telefon, Kontaktweg (WhatsApp, Anruf, E-Mail). Die E-Mail ist nur beim Kontaktweg E-Mail Pflicht. Jeder Schritt steht in `?schritt=`, damit die Zurück-Geste funktioniert. Der Entwurf liegt 24 Stunden in `sessionStorage`.
3. **Absenden.** `POST /api/bewerbung` mit einem Idempotency-Key (UUID aus dem Entwurf, bleibt nach einem Reload gleich). Die Route prüft der Reihe nach: Herkunft (403), Rate-Limit (429), Content-Type und Größe bis 64 KB (415/413), Schema (400), Token-Geheimnis (503). Danach normalisiert sie die Angaben: Stelle aus dem Registry, Antworten aus dem Fragenset, Telefon nach E.164, Kanal aus der Attribution, Spamsignale (Honeypot, Ausfülldauer unter 3 Sekunden). Spamverdacht führt nicht zur Ablehnung, sondern zu einer Markierung.
4. **Sink.** Phase 1 nutzt den `EmailSink`: Er leitet die Bewerbungsnummer (`BE-26-XXXXXX`) per HMAC aus dem Idempotency-Key ab, schickt die Team-Mail an `CONTACT_NOTIFICATION_EMAIL` (Reply-To ist die E-Mail der Bewerberin bzw. des Bewerbers, falls angegeben) und eine Eingangsbestätigung, wenn eine E-Mail angegeben ist und kein Spamverdacht besteht. Resend-Idempotency-Keys verhindern doppelten Versand, auch über Server-Instanzen hinweg. **Erfolg gibt es nur, wenn Resend die Team-Mail angenommen hat.**
5. **Danke-Seite.** Die Antwort enthält Bewerbungsnummer und ein Ergänzungs-Token. Der Flow löscht den Entwurf und wechselt per `router.replace` auf `/bewerbung/danke`, damit ein Reload nicht erneut sendet. Dort lassen sich Startdatum, PLZ, eine Nachricht oder die Bewerbungsmappe nachreichen: `POST /api/bewerbung/ergaenzung` mit Nummer und Token (HMAC, 14 Tage gültig). Das Team bekommt dazu eine Mail „Ergänzung zu BE-…“.
6. **Fehler.** Jede Ablehnung erscheint ehrlich als Meldung (`role="alert"`) mit „Erneut senden“, Anruf und WhatsApp mit vorausgefüllter Bewerbung. Ein simulierter Erfolg ist nur lokal und in E2E-Tests möglich, nie auf Vercel Production.

Wie das Team die Mails liest und Ergänzungen zuordnet: [`docs/operations/betrieb.md`](docs/operations/betrieb.md#4-bewerbungs-e-mails-lesen).

**Phase 2** ersetzt den `EmailSink` durch einen `SupabaseSink` mit demselben Vertrag: Bewerbungen und Dateien in Supabase (Frankfurt), Uploads, Recruiter-Cockpit unter `/admin`, Not-E-Mail bei einem Datenbankausfall und automatische Löschfristen ([ROADMAP §8](docs/ROADMAP.md#8-säule-e-ats-auf-supabase-phase-2)). Noch nicht aktiv; die Migrationen in `supabase/migrations/` sind Altbestand und werden in Phase 2 ersetzt.

## 4. Reichweite

- **Stellenseiten:** eine statische Seite je veröffentlichter Stelle, keine Stadt-Duplikate. Seiten, Sitemap, Feeds und `llms.txt` werden stündlich neu erzeugt, abgelaufene Stellen fallen ohne Deploy heraus.
- **JSON-LD:** JobPosting nur auf `/jobs/[slug]`, mit `url`, `directApply`, `baseSalary`, `validThrough` und `hiringOrganization`. Organization, WebSite und LocalBusiness global, FAQPage nur auf `/`. Prüfung: `bun run test:graph`.
- **Feeds:** `/feeds/indeed.xml` (Indeed), `/feeds/jobs.xml` (Jooble, Talent.com, Adzuna, Careerjet, Kimeta), `/feeds/jobs.json` (schema.org JobPosting, per CORS von bad-energie.de lesbar). Alle Links tragen `utm_source=<Feed>`.
- **Sitemap und robots:** nur indexierbare Seiten; `/api/` und `/admin/` sind gesperrt. `proxy.ts` blockt nur benannte SEO-Scraper; Feeds, Sitemap, `robots.txt`, `llms*.txt` und die IndexNow-Datei sind ausgenommen.
- **IndexNow:** `POST /api/indexnow` mit `Authorization: Bearer <INDEXNOW_SUBMIT_TOKEN>` meldet ohne Body Startseite, `/jobs`, alle Stellenseiten und `/bewerbung`.
- **`llms.txt` / `llms-full.txt`:** Kurz- und Langfassung für KI-Suchmaschinen, aus Registry und Fakten erzeugt.
- **Manuelle Kanäle:** Jobbörse der Bundesagentur für Arbeit und HWK-Lehrstellenbörse mit getrackten Links, siehe [`docs/operations/stellenboersen.md`](docs/operations/stellenboersen.md).

## 5. Sicherheit und Datenschutz

- **Proxy** (`proxy.ts`): blockt benannte SEO-Scraper (403) und lässt `/api/maps/config` in Production nur für Aufrufe von der eigenen Seite zu. Er setzt keine Header.
- **Header** kommen ausschließlich aus `next.config.ts`: HSTS, `nosniff`, Referrer-Policy, Permissions-Policy, COOP, `X-Frame-Options`. Die **Content-Security-Policy läuft als Report-Only**; Meldungen gehen an `/api/csp-report` und erscheinen als `[csp]`-Zeilen im Log. Scharf geschaltet wird sie in Phase 3.
- **Formular-APIs:** CSRF über `Sec-Fetch-Site` bzw. Origin-Allowlist (`APP_URL`, Produktions-Domain, Vercel-Deployment-URL), Rate-Limit je IP-Hash (Bewerbung 5 je 10 Minuten und 20 je Tag, Ergänzungen 10 je Stunde), 64 KB Body-Limit, Honeypot, Idempotenz. Die IP wird nur als HMAC-Hash mit täglich wechselndem Schlüssel verwendet. Das Rate-Limit liegt in Phase 1 im Speicher der jeweiligen Server-Instanz.
- **Ehrliche Fehler:** Fehlt Konfiguration, antworten die Formular-APIs mit 503; die Oberfläche bietet dann Anruf und WhatsApp an. Logs enthalten keine personenbezogenen Daten, nur Bewerbungsnummer, Stelle und Kanal.
- **Keine Cookies, kein Banner:** Die Website setzt keine Cookies und lädt ohne Klick keine Drittanbieter-Skripte. Die Schrift ist selbst gehostet.
- **Google Maps per 2-Klick:** Erst „Interaktive Karte laden“ lädt Skripte von Google; die Wahl wird in `localStorage` (`be:maps-consent:v1`) gemerkt und lässt sich mit „Karte wieder ausblenden“ widerrufen. Standard ist die typografische Radius-Grafik.
- **Browser-Speicher:** Entwurf, abgeschickte Bewerbung (Nummer und Token) und Mappe liegen nur in `sessionStorage` (Entwurf höchstens 24 Stunden); das Foto der Mappe wird nie gespeichert. Der alte `localStorage`-Eintrag `bad_energie_dossier` wird beim Öffnen gelöscht.
- **Secrets:** `.env.example` enthält nur Platzhalter. gitleaks prüft jeden Push (`.gitleaks.toml`), Dependabot hält Abhängigkeiten aktuell.

Die Datenschutzerklärung beschreibt diese Verarbeitung; die Änderungen zur Prüfung durch die oder den DSB stehen in [`docs/operations/datenschutz-aenderungen.md`](docs/operations/datenschutz-aenderungen.md).

## 6. Lokale Entwicklung

Voraussetzungen: [Bun](https://bun.sh) und Node.js 22 (wie in der CI; Next.js 16 braucht mindestens 20.9).

```bash
bun install                 # Abhängigkeiten (in der CI: --frozen-lockfile)
cp .env.example .env.local  # optional; ohne Werte wird lokal simuliert
bun run dev                 # http://localhost:3000
```

Mit `next dev` simuliert die Website den Mailversand (Log `[email] simuliert`), wenn kein Resend-Key gesetzt ist, und nutzt feste Dev-Werte für die HMAC-Geheimnisse. Echte Mails gibt es lokal nur mit eigenem Resend-Key und verifiziertem Absender.

| Befehl | Zweck |
|---|---|
| `bun run test` | Unit-Tests (Vitest); einzelne Bereiche mit `bunx vitest run lib/jobs` |
| `bun run lint` / `bun run type-check` | ESLint / TypeScript |
| `bun run check:design` / `check:contrast` / `check:client-imports` | Guard-Skripte einzeln |
| `bun run build` | Production-Build; führt vorher über `prebuild` die drei Guard-Skripte aus |
| `bun run test:graph` | JSON-LD-Prüfung auf dem Build |
| `bun run e2e` | Playwright + axe gegen den Build (mobil und Desktop, hell und dunkel); vorher `bun run build` und einmalig `bunx playwright install chromium` |
| `bun run lighthouse` | Lighthouse CI mobil gegen den Build (`lighthouserc.json`, eigener `next start` auf Port 3410); vorher `bun run build`. Barrierefreiheit, Best Practices und SEO müssen 100 erreichen, CLS höchstens 0,02; Performance unter dem Ziel (≥ 95, Flow ≥ 90) ergibt nur eine Warnung |
| `bun run audit` | Lint, Typen, Tests, Design-Guard, Kontrast, Build und Graph-Check in einem Lauf |

Die E2E-Tests starten `next start` auf Port 3400 mit `EMAIL_SIMULATION=true` und `ALLOW_DEV_SECRETS=true`. Die CI (`.github/workflows/ci.yml`) führt dieselben Schritte aus, dazu Lighthouse CI und gitleaks.

Stichprobe am laufenden Build: `curl -s localhost:3000/feeds/indeed.xml | xmllint --noout -`.

## 7. Umgebungsvariablen

Vorlage: [`.env.example`](.env.example), Prüfung: [`lib/env.ts`](lib/env.ts). Leere Werte und Platzhalter wie `re_123456789` oder `your_…` gelten als nicht gesetzt.

| Variable | Pflicht | Zweck |
|---|---|---|
| `APP_URL` | nein | Öffentliche Basis-URL ohne Slash am Ende. Standard `https://karriere.bad-energie.de`. Canonicals, Sitemap, Feeds, CSRF-Allowlist |
| `RESEND_API_KEY` | Production | Resend-API-Key (`re_…`) |
| `RESEND_FROM_EMAIL` | Production | Absender auf einer in Resend verifizierten Domain, z. B. `Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>`. Es gibt keinen Ersatzabsender |
| `CONTACT_NOTIFICATION_EMAIL` | nein | Empfänger der Team-Mails. Standard `info@bad-energie.de` (alter Name `RESEND_TO_EMAIL` wird noch gelesen) |
| `IP_HASH_SALT` | jeder Production-Build | HMAC-Salt für IP-Hashes (Rate-Limit), mindestens 32 Zeichen |
| `APPLICATION_TOKEN_SECRET` | jeder Production-Build | HMAC-Geheimnis für Bewerbungsnummer und Ergänzungs-Token, mindestens 32 Zeichen. Ein Wechsel macht offene Ergänzungs-Links ungültig |
| `INDEXNOW_KEY` | nein | Öffentlicher IndexNow-Schlüssel (8–128 Zeichen `A–Z a–z 0–9 -`). Es muss `public/<key>.txt` mit dem Key als Inhalt geben |
| `INDEXNOW_SUBMIT_TOKEN` | nein | Bearer-Token für `POST /api/indexnow`, mindestens 32 Zeichen. Ohne Key oder Token antwortet der Endpunkt mit 503 |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | nein | Browser-Key der Maps JavaScript API. Wird beim Build eingebettet und öffentlich ausgeliefert, deshalb auf die Domain beschränken |
| `GOOGLE_MAPS_API_KEY` | nein | Alternative ohne `NEXT_PUBLIC_`, ausgeliefert über `/api/maps/config` |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | nein | Map-ID für Cloud-Styling |
| `EMAIL_SIMULATION` | nein | `true` simuliert den Versand (lokal, E2E, Preview). Auf Vercel Production wirkungslos |
| `ALLOW_DEV_SECRETS` | nein | `true` erlaubt Dev-Werte für fehlende Geheimnisse, nur für lokale E2E-Läufe. Auf Vercel Production wirkungslos |

„Production“ heißt: Ohne diese Werte nimmt die Bewerbungs-API in einem Production-Build nichts an (503). Ohne `IP_HASH_SALT` und `APPLICATION_TOKEN_SECRET` gilt das auch für Preview-Deployments und `next start`. Die Website selbst bleibt online; `instrumentation.ts` meldet fehlende Variablen beim Start als `[env]`-Zeile im Log (nur Namen, nie Werte).

Phase 2 (noch nicht aktiv, in `.env.example` auskommentiert): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `ADMIN_EMAIL_ALLOWLIST`, `CRON_SECRET`.

Von Vercel gesetzt und genutzt: `VERCEL_ENV` (erkennt Production), `VERCEL_URL` und `VERCEL_BRANCH_URL` (CSRF-Allowlist für Preview-Deployments).

## 8. Deployment auf Vercel

- **Projekt:** Framework Next.js, Region `fra1` (aus `vercel.json`). Vercel erkennt `bun.lock` und installiert mit Bun. Build Command `bun run build`, damit die Guard-Skripte laufen. Node.js 22.x wie in der CI.
- **Domain:** `karriere.bad-energie.de` als Custom Domain, DNS-Eintrag nach Vorgabe im Vercel-Dashboard.
- **Umgebungsvariablen Production:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `IP_HASH_SALT`, `APPLICATION_TOKEN_SECRET`; empfohlen `APP_URL`, `CONTACT_NOTIFICATION_EMAIL`, `INDEXNOW_KEY`, `INDEXNOW_SUBMIT_TOKEN`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Geheimnisse als „Sensitive“ anlegen. Änderungen wirken erst nach einem neuen Deploy (Maps-Key und `APP_URL` werden beim Build eingebettet).
- **Preview:** eigene Werte für `IP_HASH_SALT` und `APPLICATION_TOKEN_SECRET` (nicht die aus Production) und `EMAIL_SIMULATION=true`, damit Tests keine echten Mails an das Team schicken.
- **Resend:** Die Domain des Absenders muss in Resend verifiziert sein (DNS-Einträge aus dem Resend-Dashboard). Ohne Verifizierung lehnt Resend den Versand ab, und die Bewerbungs-API antwortet mit einem Fehler.
- **IndexNow:** `INDEXNOW_KEY` setzen und die Prüfdatei `public/<key>.txt` im Repo haben. Im Repo liegt die Datei des bisher genutzten Keys (`public/298d966b7e4f4a43981cb8e30da6b5b5.txt`).

Die vollständige Go-live-Checkliste mit Befehlen zum Erzeugen der Geheimnisse, Search Console, Indeed, BA und Monitoring steht in [`docs/operations/betrieb.md`](docs/operations/betrieb.md).

## 9. Stellen pflegen und Stellenbörsen

- **Stellen anlegen, ändern, verlängern, schließen:** [`docs/operations/stellen-pflegen.md`](docs/operations/stellen-pflegen.md). Jede Stelle ist eine TypeScript-Datei in `lib/jobs/data/`; die Tests prüfen Schema, Slugs, Gehalt und Ablaufdatum vor dem Merge.
- **Stellenbörsen und Reichweite:** [`docs/operations/stellenboersen.md`](docs/operations/stellenboersen.md) mit getrackten Links für BA und HWK, Indeed-Aufnahme, Aggregatoren, Search Console und dem Widget für bad-energie.de.

## 10. Roadmap und Stand

Plan und Entscheidungen: [`docs/ROADMAP.md`](docs/ROADMAP.md).

| Phase | Inhalt | Stand |
|---|---|---|
| 1 – Fundament & Flow | Job-Registry, Design-System, neue Seiten, ein Flow, Mappe, Karte, Karussell, Intake per E-Mail, Attribution, Feeds, SEO, Tests und CI | in Umsetzung. Offen: das Performance-Ziel von Lighthouse mobil (≥ 95, Flow ≥ 90) wird noch nicht auf allen Seiten erreicht; die manuellen Prüfungen nach dem Deploy (§14.5) |
| 2 – ATS | Supabase, Uploads, Recruiter-Cockpit, Löschfristen per Cron | geplant |
| 3 – Social & Beschleunigung | Landingpages, Einwilligung für Pixel, CSP scharf, Indexing API | geplant |
| 4 – Talent-Pool & Empfehlungen | Job-Alarm mit Double-Opt-in, Empfehlungslinks | geplant |
| 5 – Optional | Jobs-Editor, HR-BA-XML, Reporting | nach Bedarf |

## 11. Offene Owner-Punkte

Bis zur Klärung gilt jeweils der sichere Standard ([ROADMAP §13](docs/ROADMAP.md#13-offene-owner-punkte-blockieren-phase-1-nicht-bis-zur-klärung-gilt-jeweils-der-sichere-standard)).

- **Erledigt (2026-10-08):** Der im Git-Verlauf veröffentlichte Resend-Key ist widerrufen und ersetzt ([`betrieb.md`](docs/operations/betrieb.md#1-resend-key-rotiert-erledigt)).
- **Fakten bestätigen:** [`docs/operations/fakten-abgleich.md`](docs/operations/fakten-abgleich.md) – offene Aussagen, Widersprüche zwischen Quellen, Stellentitel und Texte im Flow.
- **Datenschutz prüfen:** [`docs/operations/datenschutz-aenderungen.md`](docs/operations/datenschutz-aenderungen.md) – jede inhaltliche Änderung der Datenschutzerklärung und des Impressums zur Prüfung durch die oder den DSB.
