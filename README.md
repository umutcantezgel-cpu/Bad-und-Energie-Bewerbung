# karriere.bad-energie.de

Karriereportal der **Bad und Energie GmbH Lahn Dill** (SHK, Wärmepumpen, Bad; Wetzlar). Die Seite hat zwei Aufgaben: Bewerberinnen und Bewerber sollen die offenen Stellen finden, und das Bewerben soll so einfach wie möglich sein – ein Flow, ein paar Fragen zum Antippen, Name und Telefon, kein Lebenslauf nötig.

- **Live:** [karriere.bad-energie.de](https://karriere.bad-energie.de) · Kunden-Website: [bad-energie.de](https://bad-energie.de)
- **Stack:** Next.js 16 (App Router, Server Components), React 19, TypeScript, Tailwind CSS 4, zod, Resend, Supabase (Bewerberdatenbank in Frankfurt). Paketmanager Bun, Tests mit Vitest und Playwright + axe. Hosting auf Vercel (Region `fra1`).
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
| `/bewerbung/danke` | Bestätigung mit Bewerbungsnummer, optionale Ergänzungen, „Nummern speichern“ als `.vcf` (Büro für Anrufe, Mobilnummer für WhatsApp) | noindex |
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
| `GET /api/status` | Betriebsstatus ohne Werte: Versand, Herkunft der Geheimnisse, Ziel der Bewerbungen, Datenbankprobe, Maps-Key. HTTP 200, wenn alles bereit ist, sonst 503, auch wenn nur die Datenbankprobe scheitert; ob Bewerbungen dann per Not-E-Mail weiter ankommen, steht in `accepting` ([`betrieb.md` 2.6](docs/operations/betrieb.md#26-deploy-und-funktionsprobe)) | – |

Vorgesehen, aber noch nicht gebaut: `/admin` (Phase 2d), `/lp/[slug]` (Phase 3), `/talentpool`, `/empfehlen`, `/r/[code]` (Phase 4).

### Module (`lib/`)

| Modul | Inhalt |
|---|---|
| `lib/jobs/` | Job-Domänenmodell mit zod (`schema.ts`), eine Datei je Stelle in `data/`, `registry.ts` (`getActiveJobs`, `getJobBySlug`, `getFunnelOptions` …), `jsonld.ts`, Feed-Builder in `feeds/`, Stellen-IDs in `ids.ts`, Slug-Sperre `slugs.lock.json` |
| `lib/content/` | Fakten-Registry `facts.ts` (jede Aussage mit ID und Quelle), dazu `faq`, `process`, `region`, `team`, `company`, `breadcrumbs` |
| `lib/data/` | Stammdaten (Firma, Kontakt, Orte, Bewertungen, Team), aus denen `lib/content` liest |
| `lib/applications/` | Bewerbungsvertrag: zod-Schema (`schema.ts`), Konstanten ohne zod für den Browser (`constants.ts`), Normalisierung, `sink.ts` (`ApplicationSink`, `EmailSink`, Auswahl des Ziels über `getApplicationSink`), Bewerbungsnummer (`reference.ts`), Ergänzungs-Token (`token.ts`), Idempotenz, Antwortformat (`http.ts`) |
| `lib/apply/` | Flow-Logik im Browser: Fragen je Fragenset, Schrittfolge, Entwurf in `sessionStorage`, Absenden, Fehlertexte, WhatsApp-Fallback, vCard, Bürozeiten, URL-Parameter |
| `lib/mappe/` | Mappe-Editor, Anschreiben-Vorlage, Stationen, Speicher, Nachreichen an eine Bewerbung |
| `lib/attribution/` | UTM, `ref` und Referrer-Host → Kanal (`channel.ts`), nur im Arbeitsspeicher (`store.ts`) |
| `lib/email/` | Versand über Resend (`resend.ts`) und Mail-Vorlagen (Team, Eingangsbestätigung, Ergänzung) |
| `lib/security/` | `guardJsonPost` (Herkunft → Rate-Limit → Content-Type und Body-Größe), Rate-Limit, IP-Hash, Herkunftsprüfung, CSP-Meldungen |
| `lib/env.ts` | zod-Prüfung der Umgebungsvariablen, abgeleitete HMAC-Geheimnisse, Standardabsender, Ziel der Bewerbungen (`resolveIntakeTarget`), Start-Check, Dev-Fallbacks |
| `lib/status.ts` | Betriebsstatus für `GET /api/status` (nur Zustände, keine Werte) |
| `lib/seo/` | Metadaten, Canonicals, OG-Bilder, IndexNow, `site-config.ts` |
| `lib/maps/` | 2-Klick-Einwilligung, Maps-Loader, Fahrzeiten, Projektion der Radius-Grafik |
| `lib/tokens/`, `lib/utils/` | Design-Tokens für JS, `cn()`, CSRF-Prüfung, WhatsApp-Links |
| `lib/supabase/` | Phase 2b: Service-Client mit Secret Key und Circuit Breaker (`service.ts`), Aufrufe der Intake-RPCs mit Zeitlimit und Fehlerklassen (`rpc.ts`), Abbildung der Bewerbung auf die RPC-Nutzlast (`payload.ts`), `SupabaseSink` (`sink.ts`). `client.ts` und `server.ts` (Publishable Key, für das Cockpit) sind noch ungenutzt |

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
3. **Absenden.** `POST /api/bewerbung` mit einem Idempotency-Key (UUID aus dem Entwurf, bleibt nach einem Reload gleich). Die Route prüft der Reihe nach: Herkunft (403), Rate-Limit (429; 503, wenn sich kein `IP_HASH_SALT` ermitteln lässt), Content-Type und Größe bis 64 KB (415/413), Schema (400), Token-Geheimnis (503, nur wenn es weder einen eigenen Wert noch einen Schlüssel zum Ableiten gibt, siehe §5). Danach normalisiert sie die Angaben: Stelle aus dem Registry, Antworten aus dem Fragenset, Telefon nach E.164, Kanal aus der Attribution, Spamsignale (Honeypot, Ausfülldauer unter 3 Sekunden). Spamverdacht führt nicht zur Ablehnung, sondern zu einer Markierung.
4. **Sink.** `getApplicationSink()` wählt das Ziel über `resolveIntakeTarget` (`lib/env.ts`, Schalter `APPLICATION_SINK`, siehe §7):
   - **`SupabaseSink`** (Phase 2b; Standard auf Vercel Production, sobald Supabase konfiguriert ist): Er speichert die Bewerbung über die RPC `rpc_submit_application`, mit der HMAC-Nummer aus dem Idempotency-Key und einem Hash der Angaben. Die Datenbank gibt die Nummer zurück; eine Wiederholung bekommt die gespeicherte Nummer. Danach gehen genau dieselben Mails raus wie beim `EmailSink`. Scheitert die Datenbank (nicht erreichbar, Zeitlimit 5 Sekunden, falscher Key, fehlende Funktion, abgelehnte Daten), geht die vollständige Bewerbung als Not-E-Mail über den `EmailSink` ans Team. Scheitert auch die, antwortet die API mit 503. Nach zwei Ausfällen in Folge überspringt eine Server-Instanz die Datenbank 30 Sekunden lang.
   - **`EmailSink`** (sonst und als Not-E-Mail): Er leitet die Bewerbungsnummer (`BE-26-XXXXXX`) per HMAC aus dem Idempotency-Key ab und schickt die Team-Mail an `CONTACT_NOTIFICATION_EMAIL` (Reply-To ist die E-Mail der Bewerberin bzw. des Bewerbers, falls angegeben). Erst wenn Resend die Team-Mail angenommen hat, folgt die Eingangsbestätigung, sofern eine E-Mail angegeben ist und kein Spamverdacht besteht.

   Resend-Idempotency-Keys (`bewerbung:<uuid>:…`) verhindern doppelten Versand, auch über Server-Instanzen hinweg. Jeder Resend-Aufruf hat 10 Sekunden Zeit. Vorübergehende Fehler von Resend (`rate_limit_exceeded`, `internal_server_error`, `service_unavailable`, `concurrent_idempotent_requests`, `application_error` mit HTTP 5xx) werden nach 800 ms einmal mit demselben Key wiederholt, aber nur, wenn der erste Versuch in weniger als 5 Sekunden scheiterte; Netzfehler und Zeitüberschreitungen nicht. So bleibt die Antwort unter den 25 Sekunden, nach denen der Browser aufgibt. Die Eingangsbestätigung geht erst nach der Antwort an den Browser raus (`after` aus `next/server`) und nur, wenn Resend die Team-Mail angenommen hat. **Erfolg gibt es nur, wenn Resend die Team-Mail angenommen hat**, auch mit Datenbank, solange es kein Cockpit gibt.
5. **Danke-Seite.** Die Antwort enthält Bewerbungsnummer und ein Ergänzungs-Token. Der Flow löscht den Entwurf und wechselt per `router.replace` auf `/bewerbung/danke`, damit ein Reload nicht erneut sendet. Dort lassen sich Startdatum, PLZ, eine Nachricht oder die Bewerbungsmappe nachreichen: `POST /api/bewerbung/ergaenzung` mit Nummer und Token (HMAC, 14 Tage gültig). Das Team bekommt dazu eine Mail „Ergänzung zu BE-…“. Mit Datenbank speichert `rpc_submit_follow_up` die Ergänzung vorher. Steht die Bewerbung nicht in der Datenbank (aus der E-Mail-Zeit oder per Not-E-Mail eingegangen) oder ist die Datenbank gestört, geht die Ergänzung nur per Mail. Die Datenbank nimmt je Bewerbung höchstens 20 Ergänzungen an, davon 5 in 24 Stunden; darüber antwortet die API mit 429 und dem Code `FOLLOW_UP_LIMIT` (ohne „Erneut senden“) und verweist auf WhatsApp oder E-Mail.
6. **Fehler.** Jede Ablehnung erscheint ehrlich als Meldung (`role="alert"`) mit „Erneut senden“, Anruf und WhatsApp mit vorausgefüllter Bewerbung. Ein simulierter Erfolg ist nur lokal und in E2E-Tests möglich, nie auf Vercel Production.

Wie das Team die Mails liest und Ergänzungen zuordnet: [`docs/operations/betrieb.md`](docs/operations/betrieb.md#4-bewerbungs-e-mails-lesen).

**Phase 2** baut das ATS auf Supabase (Frankfurt) in Scheiben ([ROADMAP §8](docs/ROADMAP.md#8-säule-e-ats-auf-supabase-phase-2)). **2a** (Schema, RLS, Intake-RPCs, Outbox; Migrationen in `supabase/migrations/`) ist in der Produktionsdatenbank eingespielt. **2b** ist der `SupabaseSink` aus Schritt 4. Noch offen sind Versand über die Outbox und automatische Löschfristen (2c), das Recruiter-Cockpit unter `/admin` (2d), Stellen aus der Datenbank (2e) und Uploads. Bis zum Cockpit bleibt das Postfach die Arbeitsablage.

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
- **Formular-APIs:** CSRF über `Sec-Fetch-Site` bzw. Origin-Allowlist (`APP_URL`, Produktions-Domain, Vercel-Deployment-URL), Rate-Limit je IP-Hash (Bewerbung 5 je 10 Minuten und 20 je Tag, Ergänzungen 10 je Stunde), 64 KB Body-Limit, Honeypot, Idempotenz. Die IP wird nur als HMAC-Hash mit täglich wechselndem Schlüssel verwendet. Das Rate-Limit liegt weiterhin im Speicher der jeweiligen Server-Instanz, auch mit Datenbank: Den Zähler in Supabase nutzt Phase 2b bewusst nicht (kein Aufräumjob, die Datenschutzerklärung verspricht Zähler im Arbeitsspeicher).
- **HMAC-Geheimnisse:** `IP_HASH_SALT` und `APPLICATION_TOKEN_SECRET` kommen bevorzugt aus eigenen Werten (mindestens 32 Zeichen). Fehlen sie oder sind sie ungültig, leitet `lib/env.ts` sie per HMAC-SHA256 aus `RESEND_API_KEY` ab, sonst aus dem Supabase-Server-Key, je Zweck ein eigener Wert. Sie sind auf allen Instanzen gleich. Ein neuer Hauptschlüssel ändert sie; offene Ergänzungs-Links der letzten 14 Tage werden dann ungültig. Den festen Dev-Wert gibt es nur lokal und in Tests.
- **Datenbank:** Der Server spricht Supabase nur mit dem Server-Key (Secret Key bzw. alter `service_role`-JWT) und nur über die Intake-RPCs an (keine Tabellenrechte, kein anon-Zugriff). Publishable- und anon-Keys lehnt `lib/env.ts` als Server-Key ab.
- **Ehrliche Fehler:** Fehlt Konfiguration oder meldet Resend einen Konfigurationsfehler, antworten die Formular-APIs mit 503; die Oberfläche bietet dann Anruf und WhatsApp an. Logs enthalten keine personenbezogenen Daten, nur Bewerbungsnummer, Stelle, Kanal und Fehlercodes; Adressen in Resend-Fehlertexten werden durch `[adresse]` ersetzt.
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

Mit `next dev` simuliert die Website den Mailversand (Log `[email] simuliert`), wenn kein Resend-Key gesetzt ist, und nutzt feste Dev-Werte für die HMAC-Geheimnisse. Echte Mails gibt es lokal nur mit eigenem Resend-Key und verifiziertem Absender. In die Datenbank schreibt die Website lokal nie, außer mit `APPLICATION_SINK=supabase`.

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

Vorlage: [`.env.example`](.env.example), Prüfung: [`lib/env.ts`](lib/env.ts). Leere Werte und Platzhalter wie `re_123456789` oder `your_…` gelten als nicht gesetzt. Bei den Variablen, die `lib/env.ts` prüft, wird ein umschließendes Paar Anführungszeichen (wie oft ins Vercel-Dashboard mitkopiert) entfernt. `APP_URL` und die Maps-Variablen trotzdem ohne Anführungszeichen eintragen: Metadaten, Sitemap, Feeds und Karte lesen sie zusätzlich ungeprüft.

| Variable | Pflicht | Zweck |
|---|---|---|
| `APP_URL` | nein | Öffentliche Basis-URL ohne Slash am Ende. Standard `https://karriere.bad-energie.de`. Canonicals, Sitemap, Feeds, CSRF-Allowlist |
| `RESEND_API_KEY` | Production | Resend-API-Key (`re_…`, nur druckbare ASCII-Zeichen). Ohne ihn nimmt Production keine Bewerbung an (503) |
| `RESEND_FROM_EMAIL` | nein | Absender auf einer in Resend verifizierten Domain. Standard `Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>`: Laut DNS (geprüft 2026-10-10) ist nur `karriere.bad-energie.de` für Resend eingerichtet, nicht `bad-energie.de`. Kein Ersatz auf fremden Domains wie `onboarding@resend.dev` |
| `CONTACT_NOTIFICATION_EMAIL` | nein | Empfänger der Team-Mails. Standard `info@bad-energie.de` (alter Name `RESEND_TO_EMAIL` wird noch gelesen) |
| `IP_HASH_SALT` | empfohlen | HMAC-Salt für IP-Hashes (Rate-Limit), mindestens 32 Zeichen. Ohne gültigen Wert aus `RESEND_API_KEY` abgeleitet, sonst aus dem Supabase-Server-Key (§5) |
| `APPLICATION_TOKEN_SECRET` | empfohlen | HMAC-Geheimnis für Bewerbungsnummer und Ergänzungs-Token, mindestens 32 Zeichen. Ohne gültigen Wert abgeleitet wie `IP_HASH_SALT`. Ein Wechsel macht offene Ergänzungs-Links ungültig; solange der Wert abgeleitet wird, auch ein neuer Hauptschlüssel |
| `SUPABASE_URL` | nein | Projekt-URL der Bewerberdatenbank (`https://<ref>.supabase.co`, Frankfurt). Alternativ wird `NEXT_PUBLIC_SUPABASE_URL` gelesen (Name der Vercel-Integration) |
| `SUPABASE_SECRET_KEY` | nein | Server-Key der Datenbank, Secret Key `sb_secret_…`. Alternativ wird `SUPABASE_SERVICE_ROLE_KEY` gelesen (alter JWT, nur mit Rolle `service_role`). Publishable- und anon-Keys gelten als ungültig |
| `APPLICATION_SINK` | nein | Ziel der Bewerbungen. `auto` (Standard): Datenbank und E-Mail nur auf Vercel Production und nur, wenn URL und Server-Key gesetzt sind; Preview, `next start`, lokal und Tests nur E-Mail. `supabase` erzwingt die Datenbank auch dort. `email` schaltet die Datenbank ab (Notschalter, wirkt nach einem neuen Deploy) |
| `INDEXNOW_KEY` | nein | Öffentlicher IndexNow-Schlüssel (8–128 Zeichen `A–Z a–z 0–9 -`). Es muss `public/<key>.txt` mit dem Key als Inhalt geben |
| `INDEXNOW_SUBMIT_TOKEN` | nein | Bearer-Token für `POST /api/indexnow`, mindestens 32 Zeichen. Ohne Key oder Token antwortet der Endpunkt mit 503 |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | nein | Browser-Key der Maps JavaScript API. Wird beim Build eingebettet und öffentlich ausgeliefert, deshalb auf die Domain beschränken |
| `GOOGLE_MAPS_API_KEY` | nein | Alternative ohne `NEXT_PUBLIC_`, ausgeliefert über `/api/maps/config` |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | nein | Map-ID für Cloud-Styling |
| `EMAIL_SIMULATION` | nein | `true` simuliert den Versand (lokal, E2E, Preview). Auf Vercel Production wirkungslos |
| `ALLOW_DEV_SECRETS` | nein | `true` erlaubt Dev-Werte für fehlende Geheimnisse, nur für lokale E2E-Läufe. Auf Vercel Production wirkungslos |

„Production“ heißt: Ohne `RESEND_API_KEY` nimmt die Bewerbungs-API auf Vercel Production nichts an (503). Die beiden HMAC-Geheimnisse fehlen nur dann, wenn es weder einen eigenen Wert noch einen Hauptschlüssel zum Ableiten gibt (`RESEND_API_KEY` oder Supabase-Server-Key); dann antworten die Formular-APIs auch auf Preview-Deployments und mit `next start` mit 503, denn den Dev-Wert gibt es dort nicht (Ausnahme: `ALLOW_DEV_SECRETS=true` für lokale E2E-Läufe). Die Website selbst bleibt online. `instrumentation.ts` schreibt beim Start eine `[env]`-Zeile mit dem Ziel der Bewerbungen und den aktiven Ersatzwerten und meldet fehlende oder ungültige Variablen (nur Namen, nie Werte). Ob alles passt, zeigt `GET /api/status` ([`betrieb.md` 2.6](docs/operations/betrieb.md#26-deploy-und-funktionsprobe)).

Für spätere Scheiben von Phase 2 (in `.env.example` auskommentiert): `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Cockpit), `ADMIN_EMAIL_ALLOWLIST` (2d), `CRON_SECRET` (Vercel-Cron aus dem ursprünglichen Plan; 2c setzt die Löschfristen laut ROADMAP §8.1 mit `pg_cron` um).

Von Vercel gesetzt und genutzt: `VERCEL_ENV` (erkennt Production; mit `APPLICATION_SINK=auto` entscheidet es über die Datenbank), `VERCEL_URL` und `VERCEL_BRANCH_URL` (CSRF-Allowlist für Preview-Deployments).

## 8. Deployment auf Vercel

- **Projekt:** Framework Next.js, Region `fra1` (aus `vercel.json`). Vercel erkennt `bun.lock` und installiert mit Bun. Build Command `bun run build`, damit die Guard-Skripte laufen. Node.js 22.x wie in der CI.
- **Domain:** `karriere.bad-energie.de` als Custom Domain, DNS-Eintrag nach Vorgabe im Vercel-Dashboard.
- **Umgebungsvariablen Production:** Pflicht ist nur `RESEND_API_KEY`. Empfohlen: eigene Werte für `IP_HASH_SALT` und `APPLICATION_TOKEN_SECRET` (sonst abgeleitet), `SUPABASE_URL` und `SUPABASE_SECRET_KEY` (Bewerberdatenbank), `APP_URL`, `CONTACT_NOTIFICATION_EMAIL`, `INDEXNOW_KEY`, `INDEXNOW_SUBMIT_TOKEN`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. `RESEND_FROM_EMAIL` nur, wenn ein anderer als der Standardabsender gelten soll; `APPLICATION_SINK` leer lassen. Geheimnisse als „Sensitive“ anlegen. Änderungen wirken erst nach einem neuen Deploy (Maps-Key und `APP_URL` werden beim Build eingebettet).
- **Nach jedem Deploy und jeder Änderung der Variablen:** `curl -s https://karriere.bad-energie.de/api/status` (Bedeutung der Felder in [`betrieb.md` 2.6](docs/operations/betrieb.md#26-deploy-und-funktionsprobe)).
- **Preview:** eigene Werte für `IP_HASH_SALT` und `APPLICATION_TOKEN_SECRET` (nicht die aus Production) und `EMAIL_SIMULATION=true`, damit Tests keine echten Mails an das Team schicken. In die Datenbank schreibt Preview mit `APPLICATION_SINK=auto` ohnehin nicht; `APPLICATION_SINK=email` ist dort nur als zusätzliche Sicherung sinnvoll, wenn die Supabase-Variablen auch für Preview gelten.
- **Resend:** Die Domain des Absenders muss in Resend verifiziert sein (DNS-Einträge aus dem Resend-Dashboard); für den Standardabsender ist das `karriere.bad-energie.de`. Ohne Verifizierung lehnt Resend den Versand ab (HTTP 403 `validation_error`), die Bewerbungs-API antwortet mit 503 und die Oberfläche bietet Anruf und WhatsApp an.
- **Supabase:** ein Projekt in Frankfurt (`eu-central-1`) mit den Migrationen aus `supabase/migrations/` (Phase 2a, eingespielt). Der Tarif Free pausiert ein Projekt nach 7 Tagen ohne Aktivität; die Not-E-Mail fängt das technisch ab, für den Betrieb ist Pro empfohlen ([ROADMAP §8.1](docs/ROADMAP.md#81-stand-und-aufteilung-abstimmung-vom-2026-10-08)).
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
| 2 – ATS | Supabase, Uploads, Recruiter-Cockpit, Löschfristen per Cron | 2a (Schema, RLS, Intake-RPCs) in Produktion. 2b (Bewerbungen und Ergänzungen zusätzlich in der Datenbank, Not-E-Mail) gebaut, aktiv, sobald Supabase in Production konfiguriert ist. 2c–2e geplant |
| 3 – Social & Beschleunigung | Landingpages, Einwilligung für Pixel, CSP scharf, Indexing API | geplant |
| 4 – Talent-Pool & Empfehlungen | Job-Alarm mit Double-Opt-in, Empfehlungslinks | geplant |
| 5 – Optional | Jobs-Editor, HR-BA-XML, Reporting | nach Bedarf |

## 11. Offene Owner-Punkte

Bis zur Klärung gilt jeweils der sichere Standard ([ROADMAP §13](docs/ROADMAP.md#13-offene-owner-punkte-blockieren-phase-1-nicht-bis-zur-klärung-gilt-jeweils-der-sichere-standard)).

- **Erledigt (2026-10-08):** Der im Git-Verlauf veröffentlichte Resend-Key ist widerrufen und ersetzt ([`betrieb.md`](docs/operations/betrieb.md#1-resend-key-rotiert-erledigt)).
- **Erledigt (2026-10-10):** WhatsApp läuft nur über die Mobilnummer 0160 8834290 (`lib/data/contact.ts` `WHATSAPP`); 06441 42956 bleibt die Nummer für Anrufe, Impressum und JSON-LD.
- **Befund vom 2026-10-10:** Production hat jede Bewerbung mit 503 abgelehnt, weil `IP_HASH_SALT` fehlte oder ungültig war. Mit diesem Stand werden fehlende Geheimnisse aus `RESEND_API_KEY` abgeleitet ([`betrieb.md` 3.2](docs/operations/betrieb.md#32-was-die-503-bedeutet)).
- **Nach Merge und Deploy:** `GET /api/status` prüfen; `ok` muss `true` sein ([`betrieb.md` 2.6](docs/operations/betrieb.md#26-deploy-und-funktionsprobe)).
- **Eigene Geheimnisse (empfohlen):** `IP_HASH_SALT` und `APPLICATION_TOKEN_SECRET` mit `openssl rand -hex 32` erzeugen und in Vercel setzen. Ohne sie läuft die Seite mit abgeleiteten Werten; dann macht aber jeder neue Resend-Key die offenen Ergänzungs-Links ungültig.
- **Google Maps:** Im Google-Cloud-Projekt des Keys ein aktives Rechnungskonto verknüpfen. Der Live-Test vom 2026-10-10 zeigte `BillingNotEnabledMapError`; bis dahin zeigt die Seite die Radius-Grafik ([`betrieb.md` 2.4](docs/operations/betrieb.md#24-google-maps-optional)).
- **Supabase:** Auftragsverarbeitungsvertrag (DPA) mit Supabase abschließen (Supabase-Dashboard, Bereich Legal/DPA) und die Datenschutz-Fassung `2026-10-10` (Bewerberdatenbank) durch die oder den DSB prüfen lassen ([`datenschutz-aenderungen.md`](docs/operations/datenschutz-aenderungen.md)). Für den Dauerbetrieb Supabase Pro.
- **Löschung in der Datenbank:** Die automatische Löschung (Phase 2c) ist noch nicht gebaut. Bis dahin löscht die Administration per SQL; das muss vor der ersten Frist geregelt sein, also frühestens etwa 6 Monate nach der ersten Absage ([`betrieb.md` 6](docs/operations/betrieb.md#6-löschfristen-in-postfach-und-datenbank)).
- **Fakten bestätigen:** [`docs/operations/fakten-abgleich.md`](docs/operations/fakten-abgleich.md) – offene Aussagen, Widersprüche zwischen Quellen, Stellentitel und Texte im Flow.
- **Datenschutz prüfen:** [`docs/operations/datenschutz-aenderungen.md`](docs/operations/datenschutz-aenderungen.md) – jede inhaltliche Änderung der Datenschutzerklärung und des Impressums zur Prüfung durch die oder den DSB.
