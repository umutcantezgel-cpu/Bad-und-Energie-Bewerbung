# Bericht · Rückführung, Veredelung und Fertigstellung (Stand 10.10.2026)

## Ergebnis in drei Sätzen
1. Alle 12 Seiten der Karriereseite tragen das Design aus den Bildern des Auftraggebers (Variante 3, E-024):
   - warmes Papier, Navy-Fläche mit Strichzeichnung bzw. Wärmebild-Haus;
   - roter Vorlauf, der in „Jetzt bewerben“ mündet;
   - Bricolage-Überschriften, Maße mit Maßlinie, Icon-Kästchen.
2. Die Muss- und Soll-Elemente der Verlustliste stehen an ihrem Ort. Dazu gehören zum Beispiel:
   - Jubiläum, Vertrauenszeile, Konfigurator, Einsatzgebiet mit Radius und Pendlerrechner, Meilenstein, Direktkontakt;
   - Mobilmenü als Dialog, WhatsApp-Wege, 404 mit Charakter, Diskretionszusage, Fortschrittsstrang;
   - Checkliste und Ring der Mappe, ehrlich deaktivierter Upload, Mail-Fuß, JSON-LD, llms.txt.
3. Lokal ist alles grün: Lint, Typen, 1556 Unit-Tests, Guards, Build, Graph-Check, 182 Playwright-Tests mit axe in 4 Projekten und Lighthouse ohne harten Befund. Danach geht der Stand per PR nach `main` (E-021, E-023).

## Ablauf
| Schritt | Ergebnis |
|---|---|
| P0/P1 | Sicherung, Messbasis, Verlustatlas mit 165 Pässen (Z-01) |
| P2/A2 | Richtung B Runde 1 + A, drei Steigerungsvarianten; Jury V1 7,9 · V2 7,5 · V3 7,4 |
| R2 | Fundament: Farben E-016, eigene Schriften, Raster, Guard, `lib/motion`, Icon-Familie, Logo auf Plakette (G8) |
| R3 | Startseite gebaut, von frischen Prüfern geprüft (4 Befundlisten), danach R3-FIX-A/B |
| E-023 | Auftraggeber: „endlich fertig machen“; Prüferrunden entfallen, alle Seiten im Design des Einstiegs |
| E-024 | Seine Bilder sind Variante 3: Einstieg neu nach V3 (statisch, ohne WebGL); gemeinsamer Seitenkopf für alle Unterseiten |
| R4/R5 | Kopf, Menü, Fuß, Bausteine, Stellenliste, 4 Stellenseiten, Bewerbung, Danke, Mappe, 404, Recht, SEO, Mail, Teilen-Bilder |
| Gesamtprüfung | 2 axe-Befunde behoben: Kopf im Fokusmodus, Paket-dl. Rückmeldeweg auf der Danke-Seite; lucide entfernt |

## Messwerte (Lighthouse mobil, Median aus 3, Produktions-Build, `belege/r6-lh/`)
| Seite | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | 92 | 100 | 100 | 100 | 3,18 s | 0,000 | 147 ms |
| `/jobs` | 92 | 100 | 100 | 100 | 3,34 s | 0,001 | 57 ms |
| Stellenseite Anlagenmechaniker | 93 | 100 | 100 | 100 | 3,04 s | 0,015 | 68 ms |
| `/bewerbung` | 92 | 100 | 100 | 100 | 3,18 s | 0,000 | 98 ms |

- Die harten Grenzen der CI sind erfüllt: A11y, BP und SEO je 100, CLS ≤ 0,02.
- Perf ≥ 95 ist dort nur eine Warnung.
- LCP liegt über dem Budget von 2,5 s, wie schon im Ausgangsstand (P0 `/` 2,92 s). Das ist Folgearbeit.

## Bildergalerie (die stärksten Ausschnitte)
- Einstieg, Vorlage gegen Ergebnis:
  - `belege/fertig-r3-einstieg-v3/vergleich__d1440-vorlage-ergebnis.webp`
  - `belege/fertig-r3-einstieg-v3/vergleich__m375-vorlage__m390-ergebnis.webp`
- Stellenseiten:
  - `belege/fertig-r5-jobs-02/stelle-anlagenmechaniker__d1440-light__01.webp`
  - `belege/fertig-r5-jobs-02/stelle-kundendienst__d1440-light__01.webp`
- Stellenliste: `belege/fertig-r5-jobs-01/stellen__d1440-light__01.webp`
- Bewerbung: `belege/fertig-r5-apply-01/bewerbung__m390-light__01.webp`
- 404: `belege/fertig-r5-ruhe/fehler-404__d1440-light__01.webp`
- Menü: `belege/fertig-shell01/menue__m390-light__offen.webp`
- Fuß: `belege/fertig-r4-shell-02/fuss__d1440-light.webp`
- Einsatzgebiet: `belege/fertig-r3-fix-b/abschnitt-gebiet-giessen__d1440-light.webp`
- Teilen-Bild: `belege/fertig-r5-klein/teilen-start.png`

## Datenbank
- Supabase lesend geprüft (10.10.2026): Die Produktion `karriere-bad-energie` hat alle sieben 2a-Migrationen bereits eingespielt. Es sind baseline_security, staff_auth, ats_core, rls_grants, intake_rpc, storage und triggers_realtime.
- Es gibt keine Supabase-Branches, also vermutlich keine automatische Migration beim Merge; die Einstellungen der GitHub-Integration sind über die lesenden Werkzeuge nicht einsehbar.
- Der Merge ändert die Datenbank nicht.

## Offen für Menschen (`MENSCHEN.md`)
- **M-019:** Der Datenschutzbeauftragte bestätigt die Faktenkorrektur der Schriftnamen in der Datenschutzerklärung.
- **E-RECHT-005:** Rechtsprüfung der Verbraucherstreitbeilegung im Impressum.
- **M-016:** drei Geschäftsaussagen der Ortsbeschreibungen; sie bleiben ausgeblendet.
- **M-017:** Schriftkauf entfällt, alle Schriften stehen unter der OFL.
- **M-018:** CSP-Nonce (CSP bleibt Report-Only).
- **Textvorschläge zur Freigabe:**
  - 404-h1 „Hier hat sich eine Rohrleitung verirrt.“;
  - Passungs-Rahmung „Finde in 60 Sekunden heraus, ob wir zu dir passen.“
- **Phase 2:** Unterlagen-Upload (Schnittstelle steht, ehrlich deaktiviert).

## Folgearbeit (nach dem Merge, E-021)
- LCP mobil unter 2,5 s.
- Kann-Elemente (6).
- Showcase-Ausbau (A-01 ≥ 9, A-03 Wow ≥ 8,5, Vorführpaket).
- Bewegungsregister um `leiste`/`meldung` ergänzen.
- `luft` und `sonne` als Icons in die Familie aufnehmen.
- Den Seitenkopf um `bewegung` und `zeichnungMobil` erweitern.

## Rückroll-Anleitung
- Der Merge nach `main` ist ein Merge-Commit. Rücknahme mit `git revert -m 1 <merge-commit>` auf `main` und Push; Vercel liefert dann wieder den vorigen Stand aus.
- Die Datenbank ist vom Merge nicht betroffen und muss nicht zurückgerollt werden.
