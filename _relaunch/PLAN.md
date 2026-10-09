# Gesamtplan
Version 0.1 · Entwurf vor Richtungswahl und vor L0. Version 1.0 entsteht nach der Wahl (Richtungs-Denkprotokoll in ENTSCHEIDUNGEN) und der Plan-Schleife L0. Gebaut wird gegen KERN v1.

## Mengengerüst
| Größe | Menge | Quelle |
|---|---|---|
| Seiten der Grundmenge | 12: `/`, `/jobs`, 4 × `/jobs/[slug]`, `/bewerbung`, `/bewerbung/danke`, `/bewerbung/mappe`, `/datenschutz`, `/impressum`, 404 | P0, `werkzeuge/lib/browser.mjs` |
| Vorlagen | 8: Startseite · Stellenliste · Stellenseite (4 Seiten) · Bewerbungsflow · Danke · Mappe · Rechtstext (2 Seiten) · Fehlerseite | `app/**` |
| Erzählseiten / Arbeitsseiten | 3 Vorlagen (Start, Stellenseite, 404) / 5 Vorlagen | KERN K-002 |
| Element-Pässe | 163 (+ Z-01-Nachträge) · zu bauen 59: Muss 19 · Soll 33 · Kann 7 · zurückgestellt 9 (5,5 %) | VERLUSTLISTE.md |
| Doppelpässe (Leitpass → Querverweis) | E-START-002 ← E-SHELL-001 · E-START-052 ← E-SEO-021 · E-BEW-004 ← E-START-017 · E-START-019 ← E-BEW-022 · E-START-015 ← E-BEW-009 · E-BEW-012 ← E-START-007 (Upload-Teil), E-BEW-027 (`vault`) | gegenpruefung-p1.md Q1 |
| Komponenten im Umbau | 27 `components/ui/*`, 13 `components/site/*`, 10 `components/home/*`, 11 `components/jobs/*`, 15 `components/apply/**`, 12 `components/mappe/*`, 6 `components/maps/*`, 5 `components/reviews/*`, 5 `components/legal/*`, Logo (nur Darstellung, G8) | Bestand |
| SVG | Icon-Familie ≈ 30 Glyphen (ersetzt 26 lucide-Icons in 35 Dateien) · Illustrationen: Einstiegsmotiv, Einsatzgebiet (Radius, Lahn/Dill, A45/B49), Fehlerseite, Fortschrittsring, Siegel „1926–2026“, Ladeanzeige · Trenner/Muster aus dem Formsystem | Bestand, Pässe |
| Animationen (Register) | ≈ 18–24 Einträge, davon 2–3 Signaturmomente (Ausbaustufe Voll) | KERN K-009 |
| Sprachen | 1 (Deutsch) | Plattform |
| Tests | 927 Vitest (Bestand, bleibt grün) + je zurückgeführter Funktion ein Kernaufgaben-Test (Konfigurator, Radius/Pendel, Anker-Aliase, URL-Parameter, Upload-Adapter gegen Attrappe, Mappe-Stand, WhatsApp-Text, E-Mail-Fußzeile, JSON-LD) + E2E je Vorlage (4 Projekte) + Guards (Design, Kontrast, Client-Importe, Graph, neu: SVG) | K-004 |

## Wellen und Pakete
Regeln: höchstens 5 Pakete je Welle, nie dieselbe Datei in zwei gleichzeitigen Paketen, gemeinsame Dateien (Tokens, globale Stile, `components/home/content.ts`, `lib/content/*`, Konfiguration, `app/layout.tsx`, `package.json`, KERN) nur durch den Orchestrator. Muss vor Soll vor Kann. Nach jeder Welle L2: Ebene 1, betroffene Tests, Bildprüfung (betroffene Seiten, Hauptseiten, zwei Seiten je Vorlage), axe; ein Commit je Paket, dann Push.

### P3 Durchstich – Startseite als Referenz
| Welle | Paket | Rolle | Dateien (Schreibrecht) | Elemente | Kriterien |
|---|---|---|---|---|---|
| 3.0 | P3-ORCH-01 Tokens und Guard | Orchestrator | `app/styles/theme.css`, `app/globals.css`, `lib/tokens/index.ts`, `lib/utils/cn.ts`, `scripts/qa/check-design-tokens.mjs`, `scripts/qa/check-contrast.mjs`, `docs/ROADMAP.md` (§4) | – | Z-05, Z-07 (S-05, S-08), Z-11 |
| 3.0 | P3-ORCH-02 Schriften und LCP-Lichtung (N-14) | Orchestrator | `app/layout.tsx` (Schriften), `app/fonts/*` (woff2-Teilmengen, Lizenzen) | – | Z-12, Z-07 |
| 3.0 | P3-ORCH-03 Bewegungsmodul | Orchestrator | `lib/motion/*` (+ Tests), `app/layout.tsx` (Head-Skript), `next.config.ts` (CSP-Hash) | – | Z-09 |
| 3.0 | P3-ORCH-04 Icon-Schnittstelle und Startseiten-Texte | Orchestrator | `components/icons/Icon.tsx` (Namens-API), `components/home/content.ts` (alle Textfelder der Startseiten-Pässe) | Inhalte zu E-START-002/010/011/021/013/024/025/026/031/048/051 | Z-02, Z-10 |
| 3.0 | P3-ORCH-05 Logo nach G8 | Orchestrator | `components/brand/Logo.tsx` | (Logo unverändert; Dunkel/Inverse ohne Filter) | G8, Z-11 |
| 3.1 | P3-SVG-01 Formsystem und Icons der Startseite | Sonnet | `components/icons/**` (außer `Icon.tsx`-API) | – | Z-10 |
| 3.1 | P3-HOME-01 Einstieg, Vertrauenszeile, Signaturmoment 1 | Sonnet | `components/home/Hero.tsx`, `components/home/TrustLine.tsx` (neu), Tests | E-START-002 (Leit), E-START-010, E-START-011, E-START-021, E-START-013 (Startseite) | Z-02, Z-04, Z-08, Z-09 |
| 3.1 | P3-HOME-02 Stellen und Vorteile mit Konfigurator | Sonnet | `components/home/JobList.tsx`, `components/home/BenefitGrid.tsx`, `components/home/BenefitConfigurator.tsx` (neu), Tests | E-START-024 (Leit für 016), E-START-025, E-START-026 | Z-02, Z-03 |
| 3.1 | P3-HOME-03 Einsatzgebiet | Sonnet | `components/home/RegionSection.tsx`, `components/maps/**`, Tests | E-START-032 (Leit), 029, 030, 033, 036, 040, E-SHELL-021; Kann 035, 037, 038 | Z-02, Z-03, Z-09, Z-10 |
| 3.1 | P3-HOME-04 Stimmen, Betrieb, Kontakt | Sonnet | `components/reviews/**`, `components/home/AboutSection.tsx`, `components/home/CtaBand.tsx`, Tests | E-START-043, 046, 031, 048, 051 | Z-02, Z-09 |
| 3.2 | P3-HOME-05 Ablauf, FAQ, Abschnittsköpfe, Anker | Sonnet | `components/home/ProcessTimeline.tsx`, `FaqSection.tsx`, `SectionHeader.tsx`, `app/page.tsx` (Anker-Aliase) | E-START-052 (Leit für E-SEO-021) | Z-02, Z-06, Z-07 (S-12) |
| 3.2 | P3-SHELL-00 Kopf und Fuß, Darstellung | Sonnet | `components/site/HeaderBar.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`, `FooterSwitch.tsx`, `ContactOptions.tsx` | (nur Gestaltung; Mechanik P4) | Z-08 |
| 3.3 | P3-PRUEF Phasentor | Orchestrator + Prüfer | – | – | alle auf `/` anwendbaren |

### P4 Fundament
| Welle | Paket | Rolle | Dateien | Elemente | Kriterien |
|---|---|---|---|---|---|
| 4.1 | P4-SHELL-01 Kopf und Mobilmenü | Sonnet | `components/site/MobileNav.tsx`, `HeaderBar.tsx`, `SiteHeader.tsx`, `StickyApplyBar*.tsx`, `components/ui/Sheet.tsx` | E-SHELL-012 (Muss), 011, 002, 004 (Menü), 023 (Leit), Kann 013, E-START-053 | Z-02, Z-09, Z-11 |
| 4.1 | P4-SHELL-02 Fuß und Direktwege | Sonnet | `components/site/SiteFooter.tsx`, `FooterSwitch.tsx`, `ContactOptions.tsx`, `OpeningHoursText.tsx` | E-SHELL-005 (Muss), 008, 004 (Fuß), E-RECHT-008 | Z-02 |
| 4.1 | P4-UI-01 Eingabe-Bausteine mit allen Zuständen | Sonnet | `components/ui/{Button,IconButton,Input,Field,Textarea,Checkbox,ChoiceCard,Chip,SegmentedControl,variants}.tsx`, Tests | – | Z-07 (S-06), Z-11 |
| 4.1 | P4-UI-02 Anzeige-Bausteine, Fortschritt | Sonnet | `components/ui/{Card,Tag,StatTile,Disclosure,Toast,ToastCard,Breadcrumbs,PageHeader,Prose,Rating,StepHeader,TextLink,SkipLink}.tsx`, `components/ui/ProgressRing.tsx` (neu), Tests | E-BEW-003, E-BEW-007 | Z-02, Z-07, Z-10 |
| 4.1 | P4-404-01 Fehlerseiten mit Charakter | Sonnet | `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx` | E-SHELL-025, E-SHELL-027 | Z-02, Z-08 |
| 4.2 | P4-ORCH-06 Seitenübergänge, Fokus, Auswahl | Orchestrator | `app/globals.css`, `app/layout.tsx`, `next.config.ts` | – | Z-09, Z-11 |
| 4.3 | P4-PRUEF Phasentor (Z-05, Z-11, Z-13 auf Hauptseiten, Pixelvergleich) | Orchestrator | – | – | Z-05, Z-11, Z-13 |

### P5 Ausrollen
| Welle | Paket | Rolle | Dateien | Elemente | Kriterien |
|---|---|---|---|---|---|
| 5.1 | P5-APPLY-01 Bewerbungsflow (nur Darstellung, Logik nach G9) | Sonnet | `components/apply/{ApplyFlow,ApplyFlowClient,ContactStep,FlowShortcuts,SubmitErrorPanel,steps,options}.tsx`, Tests | E-BEW-004 (Leit für E-START-017), E-BEW-001, E-START-013 (Flow) | Z-02, Z-04 |
| 5.1 | P5-BEW-01 Bewerbungsseite und Parameter | Sonnet | `app/bewerbung/page.tsx`, `app/bewerbung/layout.tsx`, `lib/apply/params.ts`, Tests | E-BEW-027, E-BEW-008, Z-01-Nachträge (Ladezustände) | Z-02, Z-03, Z-06 |
| 5.1 | P5-SEO-01 Strukturierte Daten | Sonnet | `components/site/site-jsonld.ts`, `lib/jobs/jsonld.ts`, `lib/seo/*` (außer `og-*`), Tests | E-SEO-006, E-SEO-009, Z-01-Nachträge (LocalBusiness-Beschreibung, JobPosting-Beschreibungen und -Benefits, areaServed, FAQPage) | Z-02, Z-06 |
| 5.1 | P5-RECHT-01 Rechtsseiten (Darstellung; Inhalt unantastbar) | Sonnet | `components/legal/**`, `app/impressum/page.tsx`, `app/datenschutz/{page,layout}.tsx` | E-RECHT-005 (Wortlaut bleibt, M-015), E-RECHT-013 | Z-02, Z-11 |
| 5.1 | P5-MAIL-01 E-Mail-Fußzeile | Haiku | `lib/email/templates/layout.ts`, Test | E-BEW-025 | Z-02, Z-03 |
| 5.2 | P5-JOBS-01 Stellenliste | Sonnet | `app/jobs/page.tsx`, `components/jobs/JobCard.tsx` | – | Z-07, Z-08 |
| 5.2 | P5-JOBS-02 Stellenseite (Erzählseite) | Sonnet | `app/jobs/[slug]/page.tsx`, `components/jobs/*` außer `JobCard.tsx` | (Signaturmoment 3, falls gewählt) | Z-07, Z-08, Z-09 |
| 5.2 | P5-UPLOAD-01 Unterlagen-Schnittstelle (eigener Adapter, ehrlich deaktiviert, E-012) | Sonnet | `lib/apply/upload/*` (neu), `components/apply/UploadPanel.tsx` (neu), Tests | E-BEW-012 (Leit; mit E-START-007, E-BEW-027 `vault`) | Z-02, Z-03 |
| 5.2 | P5-THANKS-01 Danke-Seite und Erfolgsmoment | Sonnet | `app/bewerbung/danke/page.tsx`, `components/apply/thanks/**` | E-START-020, E-START-015 (Leit), E-BEW-015, Kann E-START-019 (Leit) | Z-02, Z-09 |
| 5.2 | P5-MAPPE-01 Mappe | Sonnet | `app/bewerbung/mappe/page.tsx`, `components/mappe/**` | E-BEW-006, E-BEW-020 (+ Einbindung E-BEW-007) | Z-02, Z-03 |
| 5.3 | P5-ICON-01 Icon-Umstellung Restdateien, lucide entfernen | Sonnet + Orchestrator (`package.json`, `bun.lock`) | alle Dateien mit lucide-Import ohne offenes Paket | – | Z-10, Z-07 (S-04) |
| 5.3 | P5-PRUEF Mutationsprobe, Phasentor | Orchestrator + Gegenprüfer | – | – | Z-02…Z-07, Z-09…Z-13 |

### P6 Feinschliff und Signatur
| Welle | Paket | Rolle | Dateien | Kriterien |
|---|---|---|---|---|
| 6.1 | P6-SIG-01…03 Signaturmomente auf Zielniveau | Sonnet | Dateien des Ursprungspakets | Z-08, Z-09 |
| 6.1 | P6-ZUST-01 Zustände Arbeitsseiten (Lade, Leer, Fehler, Formular-Rückmeldung) | Sonnet | `components/apply/**`, `components/mappe/**` | Z-07 (S-06) |
| 6.1 | P6-META-01 Favicon, Teilen-Bilder (lokale Schriften statt Google-Abruf), Auswahlfarbe | Sonnet | `app/opengraph-image.tsx`, `app/jobs/[slug]/opengraph-image.tsx`, `lib/seo/og-*`, `app/icon*` | Z-06, Z-12 |
| 6.2 | P6-ZUST-02 Zustände Erzählseiten und Rahmen | Sonnet | `components/home/**`, `components/jobs/**`, `components/site/**` | Z-07 |
| 6.2 | P6-JURY Jury und Blindvergleich bis Z-08 | Jury | – | Z-08 |

### P7 Abnahme und Übergabe
P7-VOLL Volltest aller Ebenen · P7-BERICHT BERICHT.md mit Galerie (HTML in `belege/`) und Anleitung Zusammenführen/Zurückrollen · P7-GEGEN frischer Gegenprüfer bestätigt jedes Häkchen · P7-MERGE PR `claude/kind-ride-n9duod → main` nach Bedingungen (CI grün, Supabase-Migrationen lesend geprüft, Vercel-Variablen bestätigt M-001).

## Abhängigkeiten und kritischer Pfad
P3-ORCH-01 → P3-ORCH-02 → P3-ORCH-03 → P3-ORCH-04 → P3-HOME-01 (Signaturmoment 1) → P3-PRUEF (Jury Start ≥ 8,0) → P4-UI-01 → P5-APPLY-01 → P5-THANKS-01 → P6-JURY → P7-GEGEN → P7-MERGE (wartet auf M-001).
Weitere Kanten: P3-SVG-01 vor P5-ICON-01 · P4-UI-02 (ProgressRing) vor P5-MAPPE-01 · P5-UPLOAD-01 vor Feinschliff von P5-BEW-01 (`vault`) · P5-SEO-01 nach Z-01-Nachträgen.

## Kapazität
Pakete: 39 (P3 12 · P4 6 · P5 11 · P6 6 · P7 4). Wellen pro Tag: 3 (Bau ≈ 1,5 h, Wellenprüfung ≈ 45 min nacheinander).
Formel: Tage = 39 ÷ (5 × 3) × 1,2 = **3,1 Tage**. Mit der real tragfähigen Parallelität 3 (4 CPU, Build und Tests nacheinander) = 39 ÷ (3 × 3) × 1,2 = **5,2 Tage**. Planwert: 4–5 Arbeitstage nach FREIGABE.
