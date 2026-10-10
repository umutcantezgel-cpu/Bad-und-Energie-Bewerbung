# Masterplan: karriere.bad-energie.de → Recruiting-Plattform

> Von der Karriere-Microsite zur Plattform, die aktiv Bewerber findet und das Bewerben so einfach wie möglich macht. Ruhiges, typografisches Apple-Design.
>
> **Status:** freigegeben am 2026-10-08 · Phase 1 abgeschlossen (PR nach `main`, Merge nach Freigabe) · Phase 2a in Produktion · Phase 2b (Bewerbungen zusätzlich in der Datenbank) gebaut, aktiv, sobald Supabase in Production konfiguriert ist (Stand 2026-10-10, siehe §8.1).

---

## 1. Kontext

**Ausgangslage (Analyse des Repos):**

**Nichts wird gespeichert**
- Bewerbungen landen ausschließlich als Resend-E-Mail.
- Dokumente verlassen nie den Browser. Der Status „verified“ ist hart codiert.
- Supabase-Clients und -Migrationen existieren, werden aber nirgends benutzt.

**Bewerbungen gehen still verloren**
- Ohne API-Key meldet der „Simulation-Mode“ (`lib/email/resend.ts`) trotzdem Erfolg.
- Hero-Funnel und Dossier senden ohne `await` und zeigen in jedem Fall Erfolg und Konfetti.

**Unsaubere Formulardaten**
- Fehlt eine E-Mail, werden Adressen erfunden (`VaultView` L172, `PrintA4View` L97, `HeroExpressFunnel` L141).
- Das Formular ist mit Demo-Daten vorbefüllt (`initialDossierState` = „Alexander Koch“, der gleichzeitig echter Mitarbeiter ist).
- Der PrintA4View erfindet Lebenslauf-Stationen (L141–180).

**Jobs stehen an 7 Stellen hart codiert und widersprechen sich**
- Fundorte: `app/layout.tsx`, `app/page.tsx`, `HeroExpressFunnel`, `QuizView`, `pricing.constants.ts`, `llms-full.txt`, dazu toter Code in `schema-generators.ts`.
- Obermonteur ist in keinem Funnel wählbar.
- Alle 4 JobPostings hängen auf **jeder** Seite. Google erlaubt sie nur auf der jeweiligen Stellenseite.
- Es gibt keine Stellenseiten und keine `url`.

**Drei parallele Funnels**
- Hero (4 Schritte), Quiz/Form/Vault/Mappe (4 Tabs) und Checkliste, jeweils mit anderen Datenformen.

**Keine aktive Reichweite**
- Keine Feeds, kein Tracking, kein Talent-Pool, kein Empfehlungsprogramm.
- Die Middleware blockt Feed-Crawler und Playwright (`HeadlessChrome`).

**Sicherheit**
- `.env.example:15` enthält einen echt aussehenden Resend-Key im **öffentlichen** Repo.
- Kein Rate-Limit. `validateCSRF()` wird nie aufgerufen.
- `/api/indexnow` ist ohne Authentifizierung aufrufbar.
- Die Supabase-Policies sind zu offen.

**Design**
- 143× `text-[10px]`, 193× `font-mono`, 18× pulse/ping.
- Glas, Glow und Blobs; 4 schwebende Widgets; 3+ CTAs pro Abschnitt.
- Kein `@theme` und kein Dark Mode.
- 18 UI-Primitives, die fast niemand importiert.

**Keine Qualitätssicherung**
- Keine Tests, keine CI. Zwei Lockfiles, Reste aus AI Studio und Gemini.

**Ziel:** eine Datenquelle, ein Bewerbungsflow, ehrliche Zustände, echte Persistenz (eigenes ATS), sechs oder mehr Reichweitenkanäle und ein ruhiges, schnelles, barrierefreies Design. Fakten bleiben unverändert, Texte dürfen gekürzt werden.

**Verbindliche Entscheidungen (User)**

| Thema | Entscheidung |
|---|---|
| Backend | Eigenes ATS auf Supabase (EU/Frankfurt) mit Recruiter-Cockpit |
| Kanäle | Google for Jobs + Stellenseiten · Jobbörsen-Feeds (BA, Indeed, Aggregatoren) · Social-Recruiting-Landingpages · Empfehlungen + Talent-Pool |
| KI | **Keine**. `@google/genai` und Gemini-Reste werden entfernt |
| Inhalte | Nur bestehende Fakten. Kürzen und Umstrukturieren erlaubt. Titles und Descriptions auf das höchste Suchvolumen optimieren |
| Bilder | Keine Fotos, kein Stock. Typografische Ästhetik |
| Gehalt | Spannen **sichtbar** auf Stellenseiten, im Schema und in den Feeds |
| Features erhalten | Google-Karte + Pendelrechner · Bewerbungsmappen-Generator · Bewertungs-Karussell (jeweils neu gestaltet). Der Gehaltsrechner geht in die Stellenseiten über |
| Ausbildung | „Ausbildung 2026: Einstieg noch möglich“ |
| Teamzitate | Alle 4 echt und freigegeben. Werden als typografische Testimonials genutzt |
| Ablauf | Roadmap committen, dann Phase 1 umsetzen. Weitere Phasen schrittweise |

---

## 2. „Faktor 10“: messbare Zielwerte

| Kennzahl | Heute | Ziel |
|---|---|---|
| Bewerbungs-Funnels | 3 parallele, mit Datenverlust | **1** Flow, überall eingebettet |
| Pflichtangaben | Name, Telefon, E-Mail (fake), mehrere Steps | **2 Taps + Name + Telefon**, E-Mail optional |
| Zeit bis „abgeschickt“ (Rolle vorgewählt) | mehrere Minuten | **≤ 60 s**, Ziel 30–45 s |
| Gespeicherte Bewerbungen | 0 % (nur E-Mail) | **100 %** in DB + Storage (Phase 2) |
| Fake-Erfolg / erfundene Daten | ja | **nie**. Ehrliche Fehler mit WhatsApp/Telefon-Fallback |
| Indexierbare Stellenseiten | 0 | 4 (+ Quereinstieg bei Bedarf) |
| Reichweitenkanäle | 1 (Website) | Google Jobs, Indeed, BA, Aggregatoren-Feed, Social-Landingpages, Empfehlungen, Talent-Pool |
| Quellen-Attribution | keine | jede Bewerbung mit Kanal und Kampagne |
| Kleinste Schrift / Schwebe-Widgets | 9–10 px / 4 | ≥ 13 px / 1 Sticky-Bar |
| Tests / CI | 0 / keine | Vitest + Playwright + axe + Lighthouse in GitHub Actions |
| Lighthouse mobil | – | Perf ≥ 95 (Flow ≥ 90), A11y/BP/SEO 100, CLS ≤ 0,02 |

---

## 3. Zielarchitektur

### 3.1 Routen

| Route | Zweck | Index | Phase |
|---|---|---|---|
| `/` | Startseite (ruhig, eine Primäraktion „Jetzt bewerben“) | ja | 1 |
| `/jobs` | Übersicht aller Stellen (Hub für SEO, **ohne** JobPosting-Markup) | ja | 1 |
| `/jobs/[slug]` | Stellenseite mit JobPosting + Breadcrumb JSON-LD, sichtbarer Gehaltsspanne, Teamzitat und **eingebettetem Flow** (`#bewerben`) | ja | 1 |
| `/bewerbung` (`?stelle=slug`, UTM, `ref`) | Der eine Bewerbungsflow im Fokus-Modus. Die URL bleibt erhalten, alte `?tab=`-Links werden gemappt | ja | 1 |
| `/bewerbung/danke` | Bestätigung, Timeline, optionale Ergänzungen, Kontakt als .vcf | noindex | 1 |
| `/bewerbung/mappe` | Bewerbungsmappen-Generator (A4, Druck/PDF), optionales Werkzeug | noindex | 1 |
| `/feeds/indeed.xml`, `/feeds/jobs.xml`, `/feeds/jobs.json` | Jobbörsen- und Aggregator-Feeds aus dem Registry | – | 1 |
| `/admin/**` | Recruiter-Cockpit (Magic Link, Allowlist) | noindex | 2 |
| `/lp/[slug]` | Social-Ads-Landingpages, erster Flow-Schritt above the fold | noindex | 3 |
| `/talentpool` (+ `/bestaetigen`, `/verwalten`) | Job-Alarm mit Double-Opt-in (24 Monate, wie im bestehenden Datenschutztext) | ja | 4 |
| `/empfehlen`, `/r/[code]` | Mitarbeiter-Empfehlungen mit Tracking-Links | ja / – | 4 |

**Slugs:**
- `anlagenmechaniker-shk-wetzlar`
- `kundendiensttechniker-waermepumpe-wetzlar`
- `obermonteur-projektleiter-shk-wetzlar`
- `ausbildung-anlagenmechaniker-shk-wetzlar`
- Quereinstieg/Montagehelfer: zunächst `funnel_only`, also wählbar im Flow, aber ohne Seite, Schema und Feed.

**Keine Stadt-Duplikate** der Stellenseiten. Google bewertet sie als Doorway-Pages, und Indeed straft Location-Blasting ab.

### 3.2 Neue Module (Single Source of Truth)

**`lib/jobs/`** – Job-Domänenmodell (zod)
- `schema.ts`, `employer.ts` (aus `companyData`/`SITE_CONFIG`), `data/*.ts` (je Stelle eine Datei), `registry.ts` (`getActiveJobs`, `getJobBySlug`, `getFunnelOptions`), `format.ts`, `jsonld.ts`, `feeds/*`, `__tests__/*`.
- Felder:
  - `id`, `referenceCode` (z. B. `SHK-WP-2026-01`), `slug` (mit `redirectFrom`), `status` (`published|funnel_only|draft|archived`), `category`
  - `title`, `titleShy` (mit `&shy;` für 390 px), `shortTitle`, `seo{metaTitle, metaDescription, h1, keywords}`
  - `intro`, `tasks[]`, `requirements[]`, `benefitFactIds[]`
  - `employment{kind, permanent, start}`, `salary{min, max, unit}`, `location` (HQ, Radius 35 km), `education`, `experienceMonths`
  - `datePosted`, `validThrough`, `updatedAt`
  - `apply{questionSet}`, `channels{googleJobs, indeedFeed, genericFeed, ba}`, `teamQuoteId`
- Zuordnung `employmentType`: Ausbildung → `["FULL_TIME","OTHER"]` statt reinem FULL_TIME.
- **Jobs bleiben in Phase 1–4 typisiertes TypeScript im Git.** Bei 4–6 Stellen ist der Git-Review ein Vorteil, und die Seiten und Feeds sind statisch und immer verfügbar. Eine Migration in eine Supabase-Tabelle mit demselben zod-Schema ist in Phase 5 möglich, ohne dass sich die Aufrufer ändern.

**`lib/content/`** – Fakten-Registry und Texte
- `facts.ts`: jeder USP mit ID (`friday1330`, `vacation30`, `radius35`, `founded1926`, `employees15`, `hilti`, `vehicle`, `noWeekendOnCall`, `partners5`, …) und `short`/`long`/`source`.
- Daneben `faq.ts`, `process.ts`, `region.ts` (aus `locations.ts`) und später `landing-pages.ts`.
- Komponenten referenzieren nur Fakt-IDs. Damit kann kein Text Fakten erfinden, und jeder USP erscheint höchstens zweimal pro Seite.

**`lib/applications/`**
- `schema.ts`: ein zod-Vertrag für Client und Server.
- `sink.ts`: Interface `ApplicationSink`. Phase 1 nutzt `EmailSink`, Phase 2 `SupabaseSink`.
- `reference.ts`: Bewerbungsnummer `BE-26-XXXX`.

**`lib/attribution/`**
- `schema.ts`, `channel.ts` (UTM, `ref`, Referrer-Host → Kanal: `google_jobs`, `indeed`, `arbeitsagentur`, `meta_ads`, `tiktok_ads`, `referral`, `talentpool_alert`, `organic_search`, `direct`), `store.ts` (in-memory, ohne Persistenz).
- Dazu `components/analytics/AttributionCapture.tsx`.

**`lib/security/`**
- `rate-limit.ts` (im Speicher, auch in 2b; die Supabase-Tabelle frühestens mit 2c, siehe §8.1), `request.ts` (Body-Cap 64 KB, Content-Type), `ip.ts` (HMAC-Hash).

**`lib/env.ts`**
- zod-Validierung der Umgebungsvariablen.
- Fehlt in Production Pflicht-Konfiguration, protokolliert `instrumentation.ts` das beim Start. Pflicht ist seit 2026-10-10 nur `RESEND_API_KEY`: `RESEND_FROM_EMAIL` hat einen Standard (`bewerbung@karriere.bad-energie.de`), `IP_HASH_SALT` und `APPLICATION_TOKEN_SECRET` werden ohne eigenen Wert per HMAC aus `RESEND_API_KEY` bzw. dem Supabase-Server-Key abgeleitet. Die Seite bleibt online, die Formular-APIs antworten ehrlich mit 503.

---

## 4. Säule A: Design-System im Apple-Stil (typografisch)

> **Abgelöst durch KERN 1.0, siehe `_relaunch/KERN.md`** (K-004 bis K-010, Freigabe E-021, Farben E-016, Bewegung E-013). Die Werte unten sind die tatsächlich umgesetzten (Paket R2-FUND-01, Quelle `app/styles/theme.css`, Spiegel `lib/tokens/index.ts`). Wo dieser Abschnitt und KERN abweichen, gilt KERN.

**Farbe** (Primitive `--p-*` nur in `theme.css`, Rollen hell · dunkel · Inverse-Band · Druck)
- Fläche Papier `#FBF7F0` (dunkel Nacht `#0A1033`), Wand `#F1E9DB` (dunkel `#131B4A`), Wärme `#FADCC9` (dunkel Glut `#47445B`); `theme-color` hell/dunkel = Papier/Nacht.
- Schrift Tinte `#111A3B` (dunkel Creme `#F6F0E4`), Nebentext Tinte 2 `#454C78` (dunkel `#B9C0E8`), Marke Navy `#111D6D` für Überschriften und Maße (`brand`, dunkel Creme).
- Rot `#D60000` **nur** als Knopffläche der einen Hauptaktion (Hover `#B00000`, Druck `#A80000`, Weiß darauf 5,44:1) und als dünne Vorlauf-Linie (dunkel `#FF6B5F`). Blau `#1F57C4` für Rücklauf und Fokus (dunkel `#86AEFF`). Grün nur für Erfolg.
- Rollen: `surface`, `surface-2`, `surface-3`, `surface-raised`, `ink`, `ink-muted`, `ink-2`, `brand`, `line`, `line-strong`, `accent`, `accent-hover`, `accent-press`, `on-accent`, `focus`, `vorlauf`, `ruecklauf`, `waerme`, `wand`, `plakette`, `success*`, `danger*`.
- Inverse-Band `[data-tone="inverse"]`: Navy-Fläche `#111D6D` mit Creme-Schrift (dunkel `#16237A`). Druck immer hell, Papier weiß.
- Logo: Original ohne Filter; dunkel und im Band auf einer Papier-Plakette (G8, K-006).

**Typografie** (`next/font/local`, `app/fonts/`, OFL, 223 864 Byte, zwei Dateien vorgeladen)
- Bricolage Grotesque (Display 800, −0,01 em; `--font-display`), Atkinson Hyperlegible Next (Text; `--font-sans`), Martian Mono nur für Maße (Breite 75 %, tabellarisch; `--font-mass`). Inter entfällt.
- Skala (10 Stufen, `clamp` mit rem-Anteil): footnote 14 · callout 15–16 · body 17–20 · lead 19–24 · title-3 20–30 · title-2 24–36 · title-1 32–56 (= numeral) · display 52–120 mobil/Tablet (390 px: 60,6 px; unter 360 px 40–52), 64–168 ab 64 em, am längsten Wort „Feierabend.“ gemessen (`app/fonts/__tests__/display.test.ts`) · plakat (nur die Plakatzeile „SHK-Jobs / in Wetzlar.“, Werte aus Variante 1: 60–120 mobil, 390 px 76 px, Höhenstufen B–D, 64–192 ab 64 em). Überschriften h1–h3 trennen deutsch (`hyphens: auto`, ab 10 Zeichen).
- `font-mass` (Maße) und `text-etikett` (Mono-Versalien +0,06 em) sind die einzigen Wege zu Mono und Versalien; `ziffer` setzt Ziffern im Fließtext in Bricolage (Atkinson zeichnet die Null mit Schrägstrich); `font-mono`, `font-serif`, `uppercase`, `font-[…]` bleiben verboten. 800 nur über die Display-Stufen.
- Inputs ≥ 17 px. `text-wrap: balance`/`pretty`. Weiche Trennung (`titleShy`) für lange Berufsnamen.

**Raum und Flächen**
- Abstandsskala 11 Stufen 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 96 · 128 px (`--a-1…--a-11`, Tailwind 1 · 2 · 3 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 32). Seitenrand `clamp(1.25rem, 4vw, 4rem)`, Bundsteg `clamp(1rem, 2.2vw, 1.5rem)`, Satzspiegel ≤ 84 rem (`max-w-satz`). Leitungspaar `--paar` 12 px, Strich `--m-strich` 3 px.
- Radien 4 · 12 · 24 · 999 px (`rounded-1/-2/-3/-voll`; die alten Namen zeigen darauf). Ein Schatten (`shadow-lg`, nur schwebende Ebenen).
- **Entfernt werden:** Glas, Double-Bezel, Glow, Shimmer, Blobs, Gradient-Body, Golden-Grid.

**Motion** (CSS zuerst, `lib/motion/`, keine Bibliothek)
- Dauern `--d-1` 120 · `--d-2` 240 · `--d-3` 400 · `--d-4` 600 ms, Takt 80 ms, Kurven `--k-aus` (.16,1,.3,1), `--k-wechsel` (.65,0,.35,1), `--k-ein` (.32,0,.67,0). Eingänge d-2/aus, Ausgänge d-1/ein.
- Register `lib/motion/register.ts` (19 Kennungen aus K-009); jedes animierte Element trägt `data-motion`, der Guard prüft die Kennung. Kopfskript setzt `auftakt` vor dem ersten Bild (2-s-Sicherheitsnetz). Sein sha256 steht als `HEAD_SCRIPT_SHA256` in `lib/motion/head-script.ts`, bewusst nicht in der CSP: ein Hash schaltet `'unsafe-inline'` ab und sperrte die Inline-Skripte von Next; bis zur Nonce-Strategie deckt `'unsafe-inline'` alle ab (`lib/motion/__tests__/csp.test.ts`).
- **Verboten:** Schleifen, Laufbänder, Zähler, Konfetti, Parallax, Scroll-Auftritte auf jedem Abschnitt.
- Bei `prefers-reduced-motion` steht alles sofort im Endzustand.

**Barrierefreiheit (WCAG 2.2 AA)**
- Globaler `:focus-visible`: 3 px Linie, 3 px Abstand, Fokusblau. `scroll-padding` für Kopf und StickyApplyBar (2.4.11).
- Touch-Ziele ≥ 44 px, Auswahlkarten ≥ 64 px. Eigene `:active`-Rückmeldung statt Tipp-Markierung; der 1-px-Druck gilt nur für `[data-motion~="druck"]` und nur ohne reduzierte Bewegung.
- Konsistente Hilfe: Telefon und WhatsApp immer an derselben Stelle (3.2.6).
- `autocomplete` an allen Feldern. Skip-Link.
- Das draggable WhatsApp-Widget fällt weg (verstößt gegen 2.5.7).

**Dateien**
- `app/styles/theme.css`: Primitive, Rollen (hell, dunkel, Band, Druck), `@theme inline`-Mapping, Schrift-Utilities. `app/globals.css`: Grundregeln (Fokus, Auswahl, reduzierte Bewegung). `app/fonts/`: Schriften und Lizenzen. `lib/tokens/index.ts`: Dauern, Kurven, Abstände für JS. `lib/motion/`: Register, Abfragen, Kopfskript. `components/icons/`: eigene Icon-Familie (ersetzt lucide).
- **Fallstrick:** `lib/utils/cn.ts` braucht `extendTailwindMerge` mit allen eigenen Namen. Sonst verschluckt `cn()` Klassen wie `text-ink` und `text-display`.

**Komponenten (`components/ui/`, cva + `@radix-ui/react-slot`, standardmäßig Server-Komponenten)**

| Status | Komponenten |
|---|---|
| Neu oder neu geschrieben | Button (primary/secondary/outline/ghost/link, 44/52/56 px, `asChild`, `loading`), IconButton, TextLink, Field, Input/Textarea, Checkbox, ChoiceCard/ChoiceGroup (Auto-Advance, `aria-pressed`), Chip, SegmentedControl (native Radios), StepHeader/Progress, Sheet (natives `<dialog>`), Toast, Disclosure (`<details name>`), StatTile, JobCard, StickyApplyBar, Logo (Inline-SVG, Text als Pfade, `currentColor`), PageHeader, Breadcrumbs, Prose, SkipLink |
| Gelöscht | Tabs, Tooltip, ToggleSwitch, ProgressGauge, Divider, AnimateIn, StaggerContainer, AnimatedNumber, GradientText, RotatingText, SpotlightCard, TiltCard, BackToTop, Modal (wird durch Sheet ersetzt), layout/Grid/Stack/Cluster/LayoutClientWidgets |

**Guard-Skripte**
- `scripts/qa/check-design-tokens.mjs` lässt den Build fehlschlagen bei `text-[`, `font-mono`/`font-serif`, `font-[`, `font-black`/`font-extrabold`, `animate-ping|pulse|bounce|marquee`, `duration-[`/`delay-[`/`ease-[`, Hex-Farben in `className`, Rohpaletten, `--p-*` außerhalb von `theme.css`, weiteren Schatten und Radien, Umfärbe-Filtern (`invert`, `brightness-*`) und `data-motion`-Kennungen, die im Register fehlen. Abstände außerhalb der Skala meldet er als Hinweis.
- `scripts/qa/check-contrast.mjs` prüft alle Text-, Linien- und Flächenpaare hell, dunkel, im Inverse-Band und im Druck.

---

## 5. Säule B: Informationsarchitektur und Seiten

**Header**
- Einzeilig und sticky (56/64 px), `surface/80` mit Blur. Die Hairline erscheint erst beim Scrollen.
- Desktop: Logo · Stellen · Vorteile · Ablauf · FAQ · Telefon · „Bewerben“.
- Mobil: Logo + Menü-Sheet.
- Auf `/bewerbung`: Fokus-Modus (nur Logo + „Abbrechen“).
- Die Top-Utility-Leiste entfällt.

**Footer**
- Hell (`surface-2`), 3 Spalten: Betrieb (Adresse, Zeiten, Telefon) · Stellen (interne Links) · Rechtliches.
- Fußzeile mit HRB 2449 und Innung.

**Schwebende Widgets**
- QuickApplySidebar, FloatingWhatsApp, BackToTop und der Cookie-Re-Open-Button entfallen.
- Ersatz: **eine** `StickyApplyBar` auf Mobil (Bewerben + WhatsApp). Sie ist auf `/bewerbung` ausgeblendet und auch, solange die Tastatur offen ist.

**Startseite (ruhige Abschnitte im Wechsel weiß/surface-2)**
1. **Hero:**
   - Eyebrow „Seit 1926 · Wetzlar“, zweiteilige H1, ein Lead-Satz (≤ 30 Wörter).
   - „Jetzt bewerben“ plus Textlink „Offene Stellen“.
   - Mikrocopy: „Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.“
   - 4 StatTiles: **13:30** Freitags Feierabend · **30** Tage Urlaub · **35 km** Radius · **1926**.
2. **Offene Stellen:** JobCards führen auf die Stellenseiten. Dazu ein Link zum Job-Alarm (ab Phase 4).
3. **Vorteile:** max. 8 typografische Kacheln. Fasst Benefits, Ausstattung und Gehaltsrechner-Fakten zusammen.
4. **Einsatzgebiet:**
   - „35 km um Wetzlar. Keine Fernmontage.“
   - Standardmäßig eine **typografische Radius-Grafik + Ortsliste mit km und Fahrzeit**. Der Pendelrechner funktioniert auf Basis von `locations.ts` ohne Google.
   - **Google Maps per 2-Klick** über den Button „Interaktive Karte laden“. Erst dann werden Skripte geladen, und die Wahl wird gespeichert. Dadurch ist kein Cookie-Banner nötig.
   - Meilenstein 2026 auf zwei Sätze gekürzt.
5. **Ablauf:** Timeline in 3 Schritten (Bewerben in 60 s → Kennenlernen in der Werkstatt → Start mit Werkzeug und Fahrzeug) plus Diskretionszusage.
6. **Über uns und Stimmen:**
   - „15 Leute. Ein Meisterbetrieb. Seit 1926.“
   - Zitat von Sabri Demir, die 5 Partner-Säulen als Text.
   - **Ruhiges Bewertungs-Karussell:** Scroll-Snap, Pfeile, kein Autoplay, Filter „Kunden / Team“ aus `reviews.data.ts`. Dazu die Google-Bewertungszeile.
7. **FAQ + Abschluss-CTA:**
   - Die 5 bestehenden Fragen als native `<details>`.
   - Inverse-Band mit weißem Button, Telefon und WhatsApp.

**Entfällt auf der Startseite:** eingebetteter Hero-Funnel, TrustStrip-Marquee, AIAnswerBox (dupliziert die FAQ) und LeadQuickForm (wäre ein vierter Funnel).

**Stellenseite `/jobs/[slug]`**
- Kopf: Breadcrumbs → H1 → Meta-Tags (Vollzeit · Wetzlar + 35 km · Unbefristet) → **Gehaltsspanne als StatTile**.
- Inhalt: „Das erwartet dich“ / „Das bringst du mit“ / „Das bekommst du“ (aus Fakt-IDs).
- **Passendes Teamzitat:**
  - Koch → Anlagenmechaniker/Obermonteur
  - Becker → Kundendienst
  - Weber → Ausbildung
- Gehaltsrechner-Extras als „Dein Paket“-Liste.
- Abschluss: Kompakt-Ablauf, **eingebetteter Flow** mit vorgewählter Rolle, Ansprechpartner, 3 FAQs, „Weitere Stellen“.
- Desktop: sticky rechte Spalte (Gehalt + CTA). Mobil: StickyApplyBar „Als … bewerben“.
- `opengraph-image.tsx` per `next/og` (typografisch, für WhatsApp-Shares).
- Besetzte Stelle: Hinweis „Besetzt“, `noindex`, kein Schema, Links auf ähnliche Stellen und den Talent-Pool.

**Datenschutz/Impressum**
- Werden zu Server-Komponenten mit `Prose` und behalten den Inhalt.
- Datenschutztext wird ergänzt: 2-Klick-Karte, Entwurfsspeicherung, Attribution, Auftragsverarbeiter.

**404 und Fehlerseiten**
- Große „404“-Ziffer, ruhiger Text, Links zu Stellen und Bewerbung.

---

## 6. Säule C: Ein Bewerbungsflow – „Bewerben in 60 Sekunden“

Ersetzt HeroExpressFunnel, QuizView, VaultView, FormView und BewerberCheckliste. Eine Frage pro Screen, auf Mobil optimiert. Die Komponente `components/apply/ApplyFlow` wird auf `/bewerbung`, auf `/jobs/[slug]` und später auf `/lp/[slug]` eingebettet.

| # | Fachkräfte (Anlagenmech., Kundendienst, Obermonteur) | Ausbildung | Quereinstieg |
|---|---|---|---|
| 0 | **Stelle** (entfällt bei `?stelle=`; als Tag „ändern“ sichtbar) | gleich | gleich |
| 1 | „Was trifft auf dich zu?“ Geselle < 2 J. · 2–5 J. · > 5 J. · Meister/Techniker · Andere Ausbildung | „Wo stehst du gerade?“ Schule läuft · Schule fertig · Etwas anderes | „Was machst du aktuell?“ + „Führerschein B?“ |
| 2 | „Ab wann?“ Sofort · 1–3 Monate · Später | entfällt | gleich |
| 3 | **Kontakt:** Name, Telefon, Kontaktweg (WhatsApp · Anruf · E-Mail, Standard WhatsApp). E-Mail optional, Pflicht nur bei Kontaktweg E-Mail. Absenden | gleich | gleich |
| danach | `/bewerbung/danke`: optionale Ergänzungen (Startdatum, PLZ, Nachricht, **Bewerbungsmappe**) | | |

**Verhalten**
- **Auto-Advance** nach einem Tap (180 ms Highlight).
- Jeder Schritt bekommt einen URL-Eintrag (`?schritt=`). Dadurch funktioniert die Zurück-Geste unter Android und iOS.
- **Entwurf in `sessionStorage`** (24 h, wird beim Absenden gelöscht, nach TDDDG §25(2) Nr. 2 zulässig). Der alte `localStorage`-Key `bad_energie_dossier` wird einmalig gelöscht.
- Validierung bei Blur, danach live. Der Absenden-Button ist nie deaktiviert, bei Fehlern springt der Fokus zum ersten fehlerhaften Feld.
- **Ehrliches Absenden:**
  - Es wird auf die Server-Antwort gewartet. Bei Fehlern erscheint ein `role="alert"` mit „Erneut senden · Anrufen · **WhatsApp mit vorausgefüllter Bewerbung**“.
  - Offline-Erkennung. Ein Idempotency-Key verhindert Doppel-Bewerbungen.
  - `router.replace` auf die Danke-Seite, damit ein Reload nicht erneut sendet.
- Auf jedem Schritt gibt es den alternativen Weg „Lieber direkt per WhatsApp?“ (über die bestehende `buildWhatsAppUrl`).
- **Datenschutz:**
  - Hinweis statt Checkbox: Die Verarbeitung von Bewerbungen beruht auf Art. 6(1)(b) DSGVO. Gespeichert wird die Version des angezeigten Datenschutzhinweises. **Die DSB-Bestätigung steht noch aus.**
  - Talent-Pool-Opt-in als separate, nicht vorausgewählte Checkbox (ab Phase 4).
- **Danke-Seite:**
  - „Danke, {Vorname}.“, ein einmal gezeichneter Haken, kein Konfetti. Zusammenfassung und Timeline („Sabri Demir meldet sich“; außerhalb der Bürozeiten mit Hinweis auf die Öffnungszeiten).
  - Ergänzungen werden in Phase 1 per E-Mail mit HMAC-Token an die Bewerbungsnummer gehängt.
  - Dokumente: in Phase 1 „per WhatsApp/E-Mail nachreichen“, ab Phase 2 als Upload.
  - „Nummern speichern“ als .vcf mit Büro (Anrufe) und WhatsApp-Mobilnummer (Handwerker nehmen unbekannte Nummern oft nicht an).

**Bewerbungsmappen-Generator `/bewerbung/mappe` (bleibt, neu gestaltet)**
- Optionales Werkzeug **außerhalb** des Pflichtpfads, verlinkt von der Danke-Seite und aus dem Flow („Lieber mit kompletter Mappe?“).
- Neu ist ein Editor für Berufs- und Ausbildungsstationen. Bisher gab es dafür keine UI, und die Stationen wurden erfunden.
- Die Anschreiben-Vorlage stammt aus der bestehenden Arbeitsstil-Logik (`QuizView` `handleStyleChange`).
- Foto optional, nur im Speicher, nie in `localStorage`.
- A4-Vorschau, Druck/PDF über `window.print()` mit neu gestaltetem Print-CSS.
- **Keine Demo- oder Fallback-Daten.**
- „Mit Bewerbung senden“ hängt die strukturierten Mappendaten an. Ab Phase 2 rendert das Cockpit dieselbe Mappe aus der DB, ganz ohne PDF-Bibliothek.

---

## 7. Säule D: Aktive Bewerbersuche (Reichweite)

| Kanal | Umsetzung | Phase |
|---|---|---|
| **Google for Jobs** | JobPosting nur auf `/jobs/[slug]`, mit `url`, `directApply: true` (Flow eingebettet), `identifier`, `baseSalary` (sichtbar), `validThrough`, vollständiger `jobLocation` und `hiringOrganization` per `@id`. Sitemap aus dem Registry, IndexNow mit Registry-URLs | 1 |
| **Google Indexing API** | GitHub Action nach dem Prod-Deploy (`URL_UPDATED/DELETED`, Service-Account in Search Console) | 3 |
| **Indeed + Aggregatoren** | `/feeds/indeed.xml` (Indeed-XML-Format), dazu `jobs.xml` und `jobs.json` für Jooble, Talent.com, Adzuna, Careerjet und Kimeta. URLs mit `utm_source=<feed>`. Bei Indeed realistisch: Career-Site-Indexierung über das Arbeitgeber-Dashboard anfragen. Eine Stelle = ein Standort | 1 (+ Anfrage durch User) |
| **Bundesagentur für Arbeit** | Realistisch: Stellen manuell im kostenlosen BA-Arbeitgeberportal einstellen und die Ausbildung zusätzlich in der HWK-Lehrstellenbörse, jeweils mit UTM-URLs (Anleitung in `docs/operations/stellenboersen.md`). Die HR-BA-XML-Schnittstelle braucht einen Kooperationsvertrag und ein Zertifikat, deshalb nur optional in Phase 5. `ba.berufenetId` ist im Modell bereits vorgesehen | 1 (Doku) / 5 |
| **Website des Kundenbetriebs** | `/feeds/jobs.json` mit CORS für bad-energie.de, für ein Widget „Wir stellen ein“ | 1 |
| **Social Recruiting** | `/lp/[slug]` mit Headline zum Ad-Hook, erster Flow-Schritt above the fold, Fakt-IDs, `100dvh`/Safe-Area, getestet in den In-App-Browsern von Instagram, Facebook und TikTok. Meta-, TikTok- und Google-Ads-Pixel **erst nach Marketing-Einwilligung** (vereinheitlichter `consentStore` + schlanker Banner mit gleichwertigem „Ablehnen“). Conversion-Event mit der Bewerbungsnummer als `eventID`, ohne personenbezogene Daten | 3 |
| **Talent-Pool + Job-Alarm** | Double-Opt-in per E-Mail (Resend, `List-Unsubscribe` One-Click), Interessen-Chips. Täglicher Cron verschickt Alerts für neue Stellen. Reaktivierung 30 Tage vor Ablauf. WhatsApp zunächst als öffentlicher Kanal „Jobs bei Bad und Energie“ ohne gespeicherte Daten. Die WhatsApp Cloud API kommt nur in Phase 5 | 4 |
| **Empfehlungen** | Code pro Mitarbeiter (wird im Cockpit erzeugt) → `/r/[code]` leitet per 302 auf die Stelle mit `ref=` weiter. Teilen per Web-Share/WhatsApp. **Keine Dritt-Kontaktdaten**, der Kandidat bewirbt sich selbst. Prämie nur, wenn der Owner eine festlegt | 4 |
| **Messung** | Hauptkennzahl „Bewerbungen pro Kanal × Stelle“ direkt aus dem ATS, ohne Tracking-Cookies. Optional `funnel_events` ohne Kennung für die Drop-off-Analyse | 2–3 |

**Middleware-Fix (`middleware.ts` → `proxy.ts`, Next 16)**
- Nur noch benannte SEO-Scraper werden geblockt. Generische HTTP-Clients und `HeadlessChrome` werden freigegeben.
- `/feeds/`, Sitemap, `robots.txt`, `llms*.txt` und die IndexNow-Datei sind vom Matcher ausgenommen.
- Den genauen Namen und das Format der Proxy-Konvention prüfe ich bei der Umsetzung gegen die installierte Next-Version.

---

## 8. Säule E: ATS auf Supabase (Phase 2)

### 8.1 Stand und Aufteilung (Abstimmung vom 2026-10-08)

Zwei Claude-Sessions arbeiten parallel am selben Repo. Mit dem Owner abgestimmt:

**Entscheidungen des Owners**
- Supabase **Free zum Testen**, **Pro vor dem Go-live**. Das Testprojekt existiert bereits: `karriere-bad-energie`, Ref `ymynacgwkqycjcervixg`, Frankfurt (`eu-central-1`).
- **Abweichung von der ursprünglichen Planung:** Die Stellen kommen schon in Phase 2 aus der Datenbank (Tabelle `job_postings` + Editor im Cockpit), nicht erst in Phase 5.
- **Abweichung:** E-Mails laufen über Supabase Edge Functions mit Outbox und Retry. Die Löschfristen setzt `pg_cron` um, nicht ein Vercel-Cron.
- Pflicht-MFA (TOTP) für das Cockpit gibt es schon in Phase 2.
- Am Ende bleibt nur `main` als Branch.

**Wer macht was**

| Bereich | Zuständig |
|---|---|
| Phase 1, öffentliche Seiten, Flow, Mappe, Design-System, `lib/jobs/**`, `lib/content/**`, `lib/attribution/**`, Feeds, SEO, Rechtstexte, `ci.yml`, Phase 3/4 | Session „Enterprise Recruiting Plattform Plan“ (Branch `claude/bold-pasteur-9gu316`) |
| Phase 2: `supabase/**`, `lib/supabase/**`, Supabase-Sink, Supabase-Rate-Limit, `lib/uploads/**`, `app/admin/**`, `app/api/admin/**`, Upload-API, `db.yml` | Session „Supabase-Vollintegration“ (Branch `claude/optimistic-turing-etjnl3`) |
| Schreibzugriff auf das Supabase-Projekt (nur aus Migrationsdateien im Repo) | ausschließlich Session „Supabase-Vollintegration“ |
| Gemeinsame Verträge `lib/applications/{sink,schema,types,constants}.ts`, `lib/jobs/schema.ts`, `lib/security/rate-limit.ts`, `lib/env.ts` (nur ergänzen), `proxy.ts` | Änderung nur nach Absprache |

**Phase 2 in Scheiben** (jeweils ein PR nach `main`, aufbauend auf dem Phase-1-PR)
- **2a Fundament:** Schema und RLS (kein anon-Zugriff, RPCs nur für `service_role`), Outbox, Rate-Limit-Zähler, pgTAP.
- **2b Intake:** `SupabaseSink`, umschaltbar über `APPLICATION_SINK=email|supabase` (Preview mit Supabase, Production bleibt bis zum Pro-Kauf beim E-Mail-Versand). Dazu der DB-Rate-Limiter und signierte Uploads.
- **2c Mail und Fristen:** Edge Functions für Versand und Webhook, `pg_cron` für die Löschfristen. Die Not-E-Mail bei DB-Ausfall bleibt.
- **2d Cockpit `/admin`:** E-Mail-OTP und TOTP, Realtime-Eingang, signierte Datei-URLs, Quellen-Report, DSGVO-Export und -Löschung.
- **2e Stellen aus der DB:** asynchrone Registry-Getter mit `cache()` und Tag-Revalidierung, Build-Snapshot als Fallback, Editor im Cockpit, Revalidate und IndexNow per Trigger.

**Stand 2b (2026-10-10): so umgesetzt** (`lib/supabase/{service,rpc,payload,sink}.ts`, `getApplicationSink` in `lib/applications/sink.ts`)
- **Schalter `APPLICATION_SINK=auto|email|supabase`**, Standard `auto`: Datenbank nur auf Vercel Production (`VERCEL_ENV=production`), weil es genau ein Supabase-Projekt gibt. Preview, `next start`, lokal und Tests schreiben nur mit `APPLICATION_SINK=supabase` hinein. `email` ist der Notschalter (wirkt nach einem neuen Deploy). **Abweichung** von der Planung oben („Preview mit Supabase, Production bleibt bis zum Pro-Kauf beim E-Mail-Versand“): Production nutzt die Datenbank, sobald URL und Server-Key gesetzt sind.
- **Variablen:** `SUPABASE_URL` oder `NEXT_PUBLIC_SUPABASE_URL`; `SUPABASE_SECRET_KEY` (`sb_secret_…`) oder `SUPABASE_SERVICE_ROLE_KEY` (alter JWT, nur Rolle `service_role`). Publishable- und anon-Keys werden abgelehnt und beim Start als „ungültig“ gemeldet.
- **Stufe A, Mails weiter aus Next:** `rpc_submit_application` (bestehende RPC aus 2a, keine neue Migration) mit HMAC-Nummer und Inhalts-Hash; die Datenbank gibt die Nummer zurück, Wiederholungen bekommen die gespeicherte. Danach verschickt Next genau dieselben Mails wie der `EmailSink` (gleiche Resend-Idempotency-Keys `bewerbung:<uuid>…`). Die Team-Mail bleibt das Erfolgskriterium, solange es kein Cockpit gibt. Die Edge Functions für den Versand kommen mit 2c.
- **Not-E-Mail:** Jeder Datenbankfehler (nicht erreichbar, Zeitlimit 5 s, falscher Key oder fehlende Funktion, `validation_failed`, unerwartet) führt zur vollständigen Bewerbung per E-Mail (`EmailSink`); scheitert auch die, 503. `reference_conflict` → ein zweiter Versuch mit Zufallsnummer. Circuit Breaker je Instanz: nach 2 Ausfällen in Folge 30 s ohne Datenbank.
- **Ergänzungen:** `rpc_submit_follow_up`, danach die Mail. `not_found` (Bewerbung aus der E-Mail-Zeit oder per Not-E-Mail) → nur Mail. `follow_up_limit` (20 je Bewerbung, 5 je 24 h) → 429 mit eigenem Code `FOLLOW_UP_LIMIT` (kein „Erneut senden“, Verweis auf WhatsApp/E-Mail).
- **Outbox:** Die Zeilen in `private.outbox` bleiben auf `pending`, weil Next selbst versendet. Bevor in 2c ein Outbox-Worker eingeschaltet wird, müssen diese Altzeilen abgeschlossen werden, z. B. `update private.outbox set status = 'dead', last_error_code = 'sent_by_next_2b' where status in ('pending', 'failed') and created_at < '<Go-live 2c>';`
- **Rate-Limit bleibt im Speicher.** Den DB-Limiter (`private.rate_limit_counters`) nutzt 2b bewusst nicht: Es gibt noch keinen Aufräumjob, und die Datenschutzerklärung verspricht Zähler im Arbeitsspeicher, die nach spätestens 24 Stunden ablaufen. Verschoben nach 2c, zusammen mit Aufräumjob und angepasstem Datenschutztext. Signierte Uploads sind ebenfalls noch nicht gebaut.
- **Löschfristen:** Die 6-Monats-Regel gilt jetzt auch für die Datenbank. Der Purge (2c) ist nicht gebaut; bis 2c bzw. zum Cockpit löscht die Administration per SQL. Das muss vor der ersten Frist stehen (frühestens etwa 6 Monate nach der ersten Absage).
- **Datenschutz:** Fassung `2026-10-10` (Bewerberdatenbank als Empfänger, Supabase als Auftragsverarbeiter, Frankfurt `eu-central-1`, Übermittlung in die USA, Speicherdauer auch für die Datenbank). DSB-Prüfung und AVV mit Supabase stehen aus (`docs/operations/datenschutz-aenderungen.md`).
- **Tarif:** Free pausiert nach 7 Tagen ohne Aktivität. Die Not-E-Mail fängt das technisch ab; Pro bleibt empfohlen.
- **Betrieb:** `GET /api/status` zeigt Ziel der Bewerbungen und Ergebnis einer Datenbankprobe ohne Schreibzugriff (`docs/operations/betrieb.md` 2.6).

**Infrastruktur**
- Supabase Frankfurt (Pro, sonst pausiert das Projekt nach 7 Tagen Inaktivität).
- `vercel.json` mit `regions: ["fra1"]`.
- Vercel Pro (Hobby ist nicht für kommerzielle Nutzung vorgesehen).

**Migrationen** (Supabase-CLI, Zeitstempel-Namen)
- Die alten Migrationen `01–03` mit zu offenen Policies werden ersetzt.
- `foundation`: `staff`, `is_staff()`, `audit_log`.
- `ats_core`:
  - `pipeline_stages`: neu, kontaktiert, gespräch, kennenlernen, angebot, eingestellt, abgesagt, zurückgezogen.
  - `candidates`: E-Mail oder Telefon (E.164 via `libphonenumber-js`), Dedupe.
  - `applications`: Referenz `BE-26-XXXX`, `job_id` mit Titel-Snapshot, `answers jsonb`, `mappe jsonb`, Stufe, Zuständigkeit, Bewertung, `idempotency_key`, `retention_until`.
  - `application_files`, `application_notes`, `application_events` (append-only), `application_attribution`.
- `consent_retention`: `consent_records` (inkl. angezeigtem Text und Policy-Version) und `application_stats_anon`.
- `intake_rpc`: `submit_application(payload)` nur für `service_role`, in einer Transaktion.
- `rate_limit_outbox`: `rate_limit_hit()`, `outbox` für E-Mail-Retries.
- `storage`: privater Bucket `application-files`, **ohne** Policies.
- `rls`: RLS überall, `anon` entzogen, Staff-Policies, Spalten-Grants.
- pgTAP-Tests für RLS.

**Uploads**
- Signierte Upload-URLs direkt in Supabase Storage. Das umgeht das Vercel-Body-Limit von 4,5 MB.
- PDF/JPG/PNG/HEIC/WEBP, max. 5 × 10 MB.
- Magic-Byte-Prüfung (`lib/uploads/sniff.ts`, ohne Abhängigkeit) und SHA-256.
- Verwaiste Uploads werden nach 24 h gelöscht.

**Intake**
- `SupabaseSink` statt `EmailSink`, gleicher API-Vertrag.
- Team-E-Mail enthält nur Referenz, Stelle, Vorname, Telefon und einen Cockpit-Link, keine Anhänge (erst mit dem Cockpit; in 2b bleibt die vollständige Team-Mail).
- Fällt die DB aus: vollständige Not-E-Mail ans Team. Wenn auch die scheitert, antwortet die API mit 503 statt einer Erfolgsmeldung.

**Cockpit `/admin`**
- Zugang:
  - Supabase Auth Magic Link/OTP, Registrierung aus, Allowlist (`staff` + `ADMIN_EMAIL_ALLOWLIST`).
  - Bestätigung per Button-Klick (gegen Link-Prefetch von Outlook).
  - Eigener SMTP über Resend.
  - `requireStaff()` in jedem Layout und jeder Server-Action.
- Funktionen:
  - Liste mit Filtern (Stelle, Stufe, Kanal, Zeitraum).
  - Detailansicht mit Antworten, Mappe, Dateien (signierte URL, 60 s, protokolliert), Stufenwechsel (Absagegrund), Notizen, Timeline.
  - Schnellaktionen: Telefon, WhatsApp, E-Mail.
  - DSGVO-Export (Art. 15) und Löschen (Art. 17).
  - `/admin/quellen` zeigt Bewerbungen pro Kanal und Monat.
- Später: Kanban, MFA, E-Mail-Vorlagen.

**Aufbewahrung**
- Nach Absage oder Rückzug 6 Monate, als Sicherheitsobergrenze 12 Monate.
- Mit Talent-Pool-Einwilligung 24 Monate (entspricht dem bestehenden Datenschutztext).
- Täglicher Cron (`/api/cron/daily`, `CRON_SECRET`) erledigt:
  - Purge (erst Storage, dann Zeilen, dann anonymisierte Statistik).
  - Outbox-Retry und Aufräumen der Rate-Limits.
  - Erinnerung „`validThrough` läuft ab“.

---

## 9. Sicherheit, DSGVO, Qualität

1. ~~**Sofort (User):** Resend-Key widerrufen und rotieren, Resend-Logs prüfen.~~ **Erledigt am 2026-10-08** (alter Key widerrufen, neuer Key in Vercel, Logs ohne Auffälligkeiten). Im Repo steht ein Platzhalter, dazu Secret-Scanning und gitleaks in der CI.
2. Kein simulierter Erfolg in Production, keine Empfänger-Adressen in Logs, `server-only` in `lib/email/*` und `lib/supabase/server.ts`.
3. `/api/bewerbung`:
   - `validateCSRF()` erweitern (Allowlist `APP_URL` + `VERCEL_URL`, testbar).
   - Rate-Limit 5 pro 10 min und 20 pro Tag je IP-Hash.
   - Body-Cap, Honeypot, Mindestdauer (nur als Spam-Flag), Idempotenz, typisierte Fehlercodes.
   - Die Kontakt-API entfällt mit dem LeadQuickForm.
4. `/api/indexnow`: `GET ?action=submit` entfällt, POST braucht ein Bearer-Token, der Key kommt nur aus der Umgebung. `/api/maps/config`: Referer per URL-Parsing prüfen statt `includes()`.
5. Security-Header nur noch in `next.config.ts`. CSP zuerst als Report-Only, scharf ab Phase 3. Strikte Nonce-CSP nur auf `/admin`.
6. Keine personenbezogenen Daten in `localStorage`, kein Base64-Foto. UTM nur in-memory. Click-IDs und sitzungsübergreifende Attribution nur mit Einwilligung.
7. AVVs mit Vercel, Supabase und Resend. Datenschutztext aktualisieren, auch den Verweis auf § 26 BDSG nach EuGH C-34/21. **Juristische Prüfung durch den User/DSB.**
8. Aufräumen:
   - `package-lock.json` löschen (Bun ist führend), `metadata.json` und den AI-Studio-HMR-Hack entfernen, `picsum` entfernen.
   - Paket umbenennen in `karriere-bad-energie`.
   - Dependabot einrichten.
   - Ungenutzte Pakete entfernen: `@google/genai`, `@radix-ui/react-tooltip`, `canvas-confetti`, `tw-animate-css`, später `motion`.

**Tests und CI**
- **Vitest:** Job-Schema und Registry-Invarianten (eindeutige IDs/Slugs, Slug-Lock, `validThrough` ≥ 14 Tage), JSON-LD-Pflichtfelder, Wohlgeformtheit der Feeds, Applications-Schema, Kanal-Ableitung, Rate-Limit, CSRF, Route-Handler mit gemocktem Sink.
- **Playwright + axe:**
  - Projekte für Mobil (390×844) und Desktop (1440×900), jeweils hell und dunkel.
  - Flow-Szenarien: Happy Path in ≤ 3 Taps + Tippen, nur Tastatur, Browser-Zurück, Reload stellt den Entwurf wieder her, bei 503 erscheint der WhatsApp-Fallback, kein Doppel-Submit, keine personenbezogenen Daten in der URL.
  - Layout: kein horizontaler Scroll bei 320 px, Schrift ≥ 12 px, Touch-Ziele ≥ 44 px.
  - Screenshots aller Seiten.
  - axe meldet 0 Verstöße (WCAG 2.2 AA).
- **Lighthouse CI** gemäß den Zielwerten in Abschnitt 2.
- **`scripts/qa/check-graph.mjs` erweitert:** JobPosting nur auf `/jobs/*`, genau eins pro Seite, Pflichtfelder vorhanden, `url` = canonical.
- **`.github/workflows/ci.yml`:** Bun, `install --frozen-lockfile`, lint, type-check, test, build, Graph-Check, Design-Guard, Playwright, gitleaks. Ab Phase 2 zusätzlich ein Job mit `supabase start`, `db reset` und pgTAP.

---

## 10. SEO: Titles, Descriptions, H1

Muster (Title ≤ 60 Zeichen, Description ≤ 155 Zeichen):
- Keyword vorne, dazu Ort und (m/w/d).
- Nur Fakten aus `facts.ts` und den Job-Daten.
- Das Suchvolumen lässt sich hier nicht messen. Nach dem Launch mit dem Keyword-Planer und der Search Console prüfen und nachschärfen.

| Seite | Title | H1 |
|---|---|---|
| Startseite | SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer | SHK-Jobs in Wetzlar. Ehrliches Handwerk. Pünktlich Feierabend. |
| /jobs | Stellenangebote SHK Wetzlar & Gießen – alle offenen Jobs | Offene Stellen in Wetzlar und Umgebung |
| Anlagenmechaniker | Anlagenmechaniker SHK (m/w/d) Job Wetzlar – Wärmepumpe | Anlagenmechaniker SHK (m/w/d) in Wetzlar |
| Kundendienst | Kundendiensttechniker Heizung & Wärmepumpe – Wetzlar/Gießen | Kundendiensttechniker SHK / Servicemonteur (m/w/d) |
| Obermonteur | Obermonteur / Projektleiter SHK Job Wetzlar (m/w/d) | Obermonteur / Projektleiter SHK (m/w/d) in Wetzlar |
| Ausbildung | Ausbildung Anlagenmechaniker SHK Wetzlar (m/w/d) 2026 | Ausbildung Anlagenmechaniker SHK – Einstieg 2026 noch möglich |
| /bewerbung | Bewerben in 60 Sekunden – ohne Lebenslauf \| Bad & Energie | (sr-only) Bewerbung bei Bad und Energie |

Beispiel-Description für Anlagenmechaniker:
> Anlagenmechaniker SHK in Wetzlar: Wärmepumpen & Bäder im 35-km-Umkreis, 3.600–4.600 €, 30 Tage Urlaub, freitags ab 13:30 frei. In 60 Sek. bewerben.

**Strukturierte Daten**
- Organization, WebSite und LocalBusiness bleiben global.
- JobPosting nur auf den Stellenseiten. FAQPage nur auf `/`.
- Die doppelte AIAnswerBox-Microdata entfällt.
- Sitemap, `llms.txt` und `llms-full.txt` werden aus dem Registry erzeugt.

---

## 11. Phasenplan

| Phase | Inhalt | Abhängigkeiten vom User | Fertig, wenn … |
|---|---|---|---|
| **1 – Fundament & Flow** (jetzt) | Hotfixes, Job-Registry, Design-System, neue Seiten, ein Flow, Mappe, Karte, Karussell, Intake v2 (E-Mail-Sink), Attribution, Feeds, SEO, Tests und CI | Resend-Key rotieren; Env-Vars in Vercel prüfen | Jede Stelle hat eine statische Seite mit validem JobPosting, die Feeds validieren, alle Einstiege nutzen den einen Flow, es gibt keinen Fake-Erfolg, die CI ist grün |
| **2 – ATS** | Supabase-Schema + RLS, SupabaseSink, Uploads, Cockpit, Cron (Purge/Outbox), Datenschutz-Update | Supabase-Projekt (Frankfurt, Pro), Vercel Pro, Cockpit-E-Mails, AVVs | Jede Bewerbung samt Dateien liegt in der DB, das Team arbeitet im Cockpit, die Löschfristen laufen automatisch |
| **3 – Social & Beschleunigung** | `/lp/[slug]`, Consent-Vereinheitlichung + Banner, Pixel nach Einwilligung, CSP scharf, Indexing API, Funnel-Events, Kanban, MFA | Pixel-IDs, Ad-Budget, Search-Console-Service-Account | Kampagnen-Bewerbungen sind pro Anzeige messbar |
| **4 – Talent-Pool & Empfehlungen** | Job-Alarm mit DOI, Alert- und Reaktivierungs-Cron, `/empfehlen`, `/r/[code]`, Cockpit-Screens | Prämienregel (falls gewünscht), WhatsApp-Kanal | Neue Stellen erreichen automatisch Abonnenten, Empfehlungen sind zuordenbar |
| **5 – Optional nach Bedarf** | Jobs-Tabelle + Editor, HR-BA-XML, serverseitige Conversions, WhatsApp Cloud API, Reporting (Time-to-Hire, Kanal-ROI) | BA-Kooperation, Meta-Verifizierung | – |

---

## 12. Phase 1: Umsetzungsreihenfolge (je Schritt ein Commit auf `claude/bold-pasteur-9gu316`) – abgeschlossen

**1.0 Roadmap und Hotfixes**
- `docs/ROADMAP.md` (dieser Plan).
- `.env.example` mit Platzhaltern; Gemini, `metadata.json`, HMR-Hack, `picsum` und `package-lock.json` entfernen.
- `lib/env.ts`.
- `lib/email/resend.ts`: kein Simulationserfolg in Production, keine personenbezogenen Daten in Logs, kein Fallback auf `resend.dev`.
- `lib/recruiting-types.ts`: Demo-Daten raus.
- Erfundene E-Mail-Adressen raus.
- `/api/indexnow` absichern.

**1.1 Domänenmodell**
- `lib/jobs/**` (4 Stellen + Quereinstieg als `funnel_only`) und `lib/content/{facts,faq,process,region}.ts`.
- Konsolidiert aus `app/layout.tsx`, `app/page.tsx`, `HeroExpressFunnel`, `QuizView`, `pricing.constants.ts`, `llms-full.txt`, `lib/data/*`.
- `schema-generators.ts` wird bereinigt.
- Abweichende Formulierungen landen in einer Owner-Liste, nichts wird erfunden.
- Vitest-Setup mit Tests.

**1.2 Design-Fundament**
- `app/styles/theme.css`, `app/globals.css`.
- Inter in `app/layout.tsx` (plus `viewport.themeColor` für hell/dunkel; JobPostings und FAQ aus dem globalen JSON-LD entfernen).
- `lib/utils/cn.ts` (`extendTailwindMerge`), `lib/tokens/index.ts`.
- `components/ui/*` (Primitives), `components/layout/{Section,Container}`, `components/brand/Logo`.
- Guard-Skripte.

**1.3 Shell und Seiten**
- `SiteHeader`, `MobileNav` (Sheet), `SiteFooter`, `StickyApplyBar`.
- `app/page.tsx` (ca. 150 Zeilen aus `components/home/*`), `app/jobs/page.tsx`, `app/jobs/[slug]/page.tsx` + `opengraph-image.tsx`.
- `components/maps/*` neu gestaltet: 2-Klick und typografischer Standard. Wiederverwendet werden `lib/maps/google-maps-loader.ts`, `MAP_POIS` und der bestehende SVG-Fallback.
- `components/reviews/ReviewCarousel` (ruhig, Scroll-Snap).
- Datenschutz und Impressum als Server-Komponenten; `not-found`, `error`, `global-error`.

**1.4 Bewerbungsflow**
- `components/apply/*`, `lib/applications/schema.ts`, `lib/apply/{questions,draft,whatsapp-message}.ts`.
- `app/bewerbung/{page,danke/page,mappe/page}.tsx`. Alte `?tab=`-Parameter werden gemappt.
- **Löschen:**
  - Komponenten: `HeroExpressFunnel`, `BewerberCheckliste`, `QuickApplySidebar`, `Navigation`, `CookieConsent` (nicht mehr nötig: keine Drittskripte ohne Klick).
  - Ordner/Einzeldateien: `components/views/*` (nachdem der PrintA4-Inhalt in die Mappe übernommen ist), `navigation/*`, `trust/*`, `pricing/*` (Fakten werden vorher übernommen), `contact/{FloatingWhatsAppWidget,LeadQuickForm}`, `seo/AIAnswerBox`, `KineticReviewCarousel`.
  - Ungenutzte Primitives, `lib/utils/haptics.ts`, `lib/tokens/spacing.ts`.

**1.5 Intake v2 und Plattform-Sicherheit**
- `app/api/bewerbung/route.ts`: neuer Vertrag mit `jobId`-Enum, optionaler E-Mail, `answers`, `mappe`, `attribution`, Idempotenz. Die Route nutzt CSRF, Rate-Limit, Body-Cap und die `ApplicationSink`.
- `app/api/bewerbung/ergaenzung/route.ts` (HMAC-Token).
- E-Mail-Templates mit Bewerbungsnummer und Kanal.
- `lib/attribution/*` + `AttributionCapture`.
- `proxy.ts` (UA-Fix), `next.config.ts` (einzige Quelle für Header, CSP Report-Only), `vercel.json` (`fra1`).

**1.6 Reichweite**
- `app/feeds/[feed]/route.ts`.
- `app/sitemap.ts`, `app/robots.ts`, `llms*.txt` und `lib/seo/indexnow.ts` aus dem Registry.
- Metadaten aller Seiten nach Abschnitt 10.
- `docs/operations/{stellen-pflegen,stellenboersen}.md`.

**1.7 Qualität**
- `vitest.config.ts`, `playwright.config.ts` + `e2e/*` (mit axe), `scripts/qa/check-graph.mjs` erweitert.
- `.github/workflows/ci.yml`, `.github/dependabot.yml`.
- `package.json`-Skripte `test`, `e2e`, `audit`.
- README aktualisieren: KI- und Gemini-Abschnitte entfernen, neue Architektur beschreiben.
- Am Ende `--color-*: initial` aktivieren, damit keine Rohfarben mehr durchrutschen.
- Push auf den Branch. Einen PR gibt es nur auf Wunsch.

### Wiederverwendung statt Neubau
- `lib/utils/cn.ts` (erweitern), `lib/utils/csrf.ts` → `validateCSRF` (erweitern), `lib/utils/sanitize.ts`, `lib/utils/whatsapp-utils.ts` → `buildWhatsAppUrl`/`whatsAppMessageFor`
- `lib/email/resend.ts` → `dispatchApplicationRequest` + `lib/email/templates/*` (Layout neu auf Tokens)
- `lib/seo/metadata.ts` → `generatePageMetadata`, `lib/seo/site-config.ts` → `SITE_CONFIG`, `lib/data/{company,locations,reviews.data,team,services}.ts` (Inhaltsquellen für die Fakten-Registry)
- `lib/maps/google-maps-loader.ts`, `lib/maps/google-maps-config.ts` (`MAP_POIS`), SVG-Fallback aus `InteractiveMap`
- `lib/store/consentStore.ts` (wird in Phase 3 vereinheitlicht), `lib/supabase/server.ts` → `createAdminClient` (Phase 2)
- `scripts/qa/check-graph.mjs` (erweitern)

---

## 13. Offene Owner-Punkte (blockieren Phase 1 nicht; bis zur Klärung gilt jeweils der sichere Standard)

- ~~**Sofort:** Resend-Key rotieren.~~ **Erledigt am 2026-10-08.**
- Versprechen „Rückmeldung in 24 h“? Standard: „Wir melden uns schnellstmöglich“.
- Stand der Google-Bewertungen. `reviews.data.ts` nennt 24 Bewertungen und zitiert 10.
- Quereinsteiger/Montagehelfer als echte Stelle (mit Gehalt)? Standard: `funnel_only`.
- Einheitlicher Titel für Sabri Demir. Standard: „Geschäftsführer und Meister“ (laut `team.ts`).
- Einzelaussagen bestätigen: „Übernahmegarantie“, „1 %-Privatnutzung“, „Gehalt am 1. Werktag“. Bis dahin nur dort verwenden, wo sie bereits sichtbar stehen.
- ~~Ist WhatsApp Business auf 06441 42956 aktiv?~~ Geklärt 2026-10-10: WhatsApp läuft nur über die Mobilnummer 0160 8834290 (`lib/data/contact.ts` `WHATSAPP`); 06441 42956 bleibt die Nummer für Anrufe, Impressum und JSON-LD. Offen: Business- oder privates Konto (`datenschutz-aenderungen.md` O9). Wer bekommt Cockpit-Zugänge (Phase 2)? Gibt es eine Empfehlungsprämie (Phase 4)? Soll eine BA-Kooperation beantragt werden (Phase 5)?
- Google Maps: im Google-Cloud-Projekt des Keys ein aktives Rechnungskonto verknüpfen (Live-Test 2026-10-10: `BillingNotEnabledMapError`). Bis dahin zeigt die Seite die Radius-Grafik (`docs/operations/betrieb.md` 2.4).
- Phase 2b: AVV mit Supabase abschließen (Supabase-Dashboard, Bereich Legal/DPA) und die Datenschutz-Fassung `2026-10-10` durch die oder den DSB prüfen lassen. Löschung in der Datenbank bis 2c per SQL durch die Administration, geregelt vor der ersten Frist.
- Eigene Werte für `IP_HASH_SALT` und `APPLICATION_TOKEN_SECRET` setzen (empfohlen, `openssl rand -hex 32`). Ohne sie werden sie aus `RESEND_API_KEY` abgeleitet. Nach jedem Deploy `GET /api/status` prüfen.
- „100 Jahre“-Badge ab 2027 → „Seit 1926“. Das Ablaufdatum wird im Code hinterlegt.
- Logo als Vektordatei (Text in Pfaden) und eine helle Variante für dunkle Flächen. Die SVGs in `public/images` zeigen ein anderes Signet mit Systemschrift. Standard: Raster-WebP, in Dark Mode und Inverse-Band als weiße Silhouette per CSS-Filter (`components/brand/Logo.tsx`).
- Teamangaben mit Stichtag (Lehrjahr Weber, Betriebszugehörigkeit Koch/Becker, siehe `docs/operations/fakten-abgleich.md` B20/B21). Standard: nur zeitlose Angaben.
- Kosten: Supabase Pro ca. 25 $/Monat, Vercel Pro, optional Ad-Budget.

---

## 14. Verifikation (Phase 1)

1. `bun install --frozen-lockfile && bun run lint && bun run type-check && bun run test && bun run build`, dazu `bun run test:graph` und den Design-Guard.
2. `bun run e2e`: Playwright mit axe, 4 Projekte (mobil/desktop × hell/dunkel), Flow-Szenarien aus Abschnitt 9, Screenshots.
3. Stichprobe am Build: `curl localhost:3000/feeds/indeed.xml | xmllint --noout -`. Danach JSON-LD je Stellenseite prüfen (genau 1 JobPosting, `url` = canonical) und zeigen, dass die Startseite **kein** JobPosting enthält.
4. Gegenprobe Fehlerfall: ohne `RESEND_API_KEY` mit `NODE_ENV=production` gibt die API 503 zurück, und die UI zeigt den WhatsApp-Fallback (kein Fake-Erfolg).
5. Manuell bzw. nach dem Deploy (User):
   - Google Rich Results Test für jede Stellenseite.
   - Lighthouse mobil.
   - iPhone Safari, Android Chrome und die In-App-Browser von Instagram, Facebook und TikTok.
   - VoiceOver- und TalkBack-Durchlauf durch den Flow.
