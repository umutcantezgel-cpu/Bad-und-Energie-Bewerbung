# Gesamtplan
Version 1.0 · 09.10.2026 · nach FREIGABE E-021, gebaut gegen KERN 1.0. Ersetzt 0.1; der Paketzuschnitt aus 0.1 bleibt im Kern erhalten, verteilt auf die Wellen R2–R7.

## Mengengerüst
- **Seiten:** 12 (Grundmenge) in 8 Vorlagen. Erzählseiten sind `/`, `/jobs/[slug]` und 404, alle übrigen sind Arbeitsseiten.
- **Elemente bis zum Merge:** 55 (Muss 20 · Soll 35). Kann (6) und die Showcase-Kriterien kommen danach (E-021).
- **SVG:**
  - Icon-Familie mit ≈ 34 Glyphen (die 8 Familien-Icons plus 26 Ersatz für lucide).
  - Zeichnungen: Haus mit Wärmepumpe (`/`), Heizkreis um Zahl (`/jobs`, Stellenkopf), Maßketten (Stellenseite), Wärmebild statisch (Wärmepumpen-Stelle), Fortschrittsstrang (Bewerbung), geschlossener Kreis (Danke), offene Leitung + Wegweiser (404), Leitungstrenner, Rohrklammer.
- **Bewegung:** Register in KERN K-009 mit 15 Kennungen aus V1 und 4 neuen; 3 Signaturmomente.
- **Sprachen:** 1.
- **Tests:** Bestand mindestens 927 Vitest und E2E in 4 Projekten. Neu:
  - Vitest für `lib/motion`, `components/icons`, Konfigurator, Anker-Aliase, URL-Parameter, Upload-Adapter, Mappe-Stand, WhatsApp-Text, E-Mail-Fußzeile, JSON-LD, `llms.txt`.
  - E2E und axe je Vorlage.

## Wellen (Schreibrechte exakt je Paket, keine Datei in zwei gleichzeitigen Paketen)
| Welle | Pakete | Elemente / Inhalt |
|---|---|---|
| R2 Fundament (exklusiv) | R2-FUND-01 | `theme.css`, Schriften, Skalen, Guard, `lib/motion`, `components/icons`, Logo (G8) |
| R3 Startseite | R3-ORCH (Orchestrator: `components/home/content.ts` und `app/page.tsx` vorab) · R3-HOME-01 Einstieg · R3-HOME-02 Stellen und Vorteile · R3-HOME-03 Einsatzgebiet · R3-HOME-04 Stimmen, Betrieb, Kontakt · R3-HOME-05 Ablauf, FAQ, Abschnittsköpfe | E-START-002/010/011/021/013 · 024/025/026/016 · 032/029/030/033/036/038/040, E-SHELL-021 · 043/046/031/048/051 · 052, E-SEO-021 |
| R4 Rahmen | R4-SHELL-01 Kopf und Mobilmenü · R4-SHELL-02 Fuß und Direktwege · R4-UI-01 Eingabe-Bausteine · R4-UI-02 Anzeige-Bausteine · R4-404 | E-SHELL-012/011/002/004/023 · 005/008, E-RECHT-008 · Zustände S-06 · E-BEW-003/007 · E-SHELL-025/027 |
| R5a Unterseiten | R5-JOBS-01 Stellenliste (V2) · R5-JOBS-02 Stellenseite (V2 + V1, V3 statisch; E-SEO-010) · R5-APPLY-01 Bewerbungsflow · R5-BEW-01 Bewerbungsseite und Parameter · R5-SEO-01 JSON-LD und `llms.txt` | E-BEW-004/001, E-START-013 · E-BEW-027/008, E-BEW-029 · E-SEO-006/009/014 |
| R5b Unterseiten | R5-THANKS-01 Danke · R5-MAPPE-01 Mappe · R5-UPLOAD-01 Unterlagen-Schnittstelle · R5-RECHT-01 Rechtsseiten · R5-MAIL-01 E-Mail-Fußzeile · R5-ICON-01 lucide-Rest, OG-Schrift | E-START-020/015, E-BEW-015 · E-BEW-006/020 · E-BEW-012, E-START-007 · E-RECHT-005/013 · E-BEW-025 |
| R6 Abschluss | Volltest, Lighthouse, axe, Slop, Jury mit Lockvogel, eine Reparaturrunde, Gegenprüfer, BERICHT, MENSCHEN | Z-02, Z-03, Z-05…Z-13 nach Merge-Gate E-021 |
| R7 Merge | PR → `main`, CI, Supabase lesend prüfen, Merge, GET-Prüfung live | – |

**Nach jeder Welle:**
- Ebene 1: lint, type-check, test, Guards, Build, test:graph.
- Betroffene Playwright-Specs mit axe.
- Bildschirmfotos in 6 Ansichten, Bilder in den Chat.
- Ein Commit je Paket, Push, CI beobachten.

## Kritischer Pfad
R2 → R3-ORCH → R3-HOME-01 → R4-UI-01 → R5-APPLY-01 → R5-THANKS-01 → R6 → R7.

## Kapazität
31 Pakete. Workflows laufen mit 2 parallel; bei 2 gleichzeitigen Workflows sind es effektiv 3–4.

| Schritt | Dauer |
|---|---|
| Je Paket (Opus mit Prüfung) | ≈ 1–1,5 h |
| Wellen | 6 |
| Formel 31 ÷ (4 × 3 Wellen/Tag) × 1,2 | ≈ 3,1 Tage |
| Realistisch mit Sitzungslimits | 1,5–3 Tage |
