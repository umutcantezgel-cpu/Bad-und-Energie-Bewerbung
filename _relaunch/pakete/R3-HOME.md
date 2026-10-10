# Welle R3 · Pakete der Startseite (Rolle Baumeister, Opus) · KERN 1.1
Gemeinsame Regeln, Leseliste und Prüfung: `_relaunch/pakete/_welle-r3.md`. Hier stehen je Paket die Schreibrechte, die Elemente und der Auftrag.

## Für alle Pakete
- **Grundlage ist R2** (Commit 7f0c8fe):
  - Rollen-Utilities aus `app/styles/theme.css`, `font-display`, `font-mass`, `text-etikett`.
  - Icon-Komponente `components/icons` (`<Icon name="…" />`).
  - Bewegungsregister `lib/motion/register.ts` (19 Kennungen) und die Kopfskript-Klasse `auftakt` auf `<html>`.
- **Seitenaufbau** (gehört dem Orchestrator, `app/page.tsx`):
  Hero → WeekSection → JobList → BenefitGrid → RegionSection → ProcessTimeline → AboutSection → FaqSection → CtaBand.
  - Zwischen die Abschnitte setzt der Orchestrator nach der Welle den Leitungstrenner (aus R3-HOME-01).
  - Dein Abschnitt endet bündig, ohne eigenen Trenner davor oder danach.
- **Ton der Abschnitte:** warmes Papier (`bg-surface`) und Wand (`bg-surface-2`) im Wechsel, so wie heute.
  - Das dunkle Navy-Band (`band-inverse` bzw. die Inverse-Rollen) gibt es auf der Startseite höchstens zweimal: im Einstieg (falls V1 es so zeigt) und im Schlussband (CtaBand).
- **Rot** ist nur Vorlauf-Linie und Hauptaktion (E-016 Auslegung). Je Bildschirm gibt es eine rote Fläche, und die ist „Jetzt bewerben“. **Blau** ist nur Rücklauf.
- **Typografie:**
  - Überschriften `font-display` in `text-brand`.
  - Maße (Zahlen mit Einheit: 13:30, 30 Tage, 35 km, Gehälter, Jahreszahlen) in `font-mass`.
  - Kleine Etiketten in `text-etikett`.
  - Fließtext in Atkinson (Standard).
- **Fakten nur einmal bis zweimal je Seite** (ROADMAP §3.2).
  - Prüfe vor dem Einsatz eines Fakts per Textsuche über alle Startseiten-Dateien (`components/home/**`, `components/maps/**`, `components/reviews/**`), wo er schon steht.
  - Der Einstieg hat Vorrang bei 13:30, 30 Tage, 35 km, 1926–2026.
- **Bestehende Texte bleiben im Wortlaut.** Sie stammen aus `content.ts`, `lib/content/*`, Stellendaten oder Fakten. Neue Texte nur, wenn ein Pass sie verlangt (Wesenskern), und dann nur aus belegten Fakten.
- **Fortschritt sichtbar machen:** Schreibe nach jedem größeren Schritt eine Zeile nach `_relaunch/pakete/fortschritt/<Kennung>.log` (Uhrzeit · was fertig ist).

## R3-HOME-01 · Einstieg (Hauptmoment der Seite)
- **Schreibrechte:**
  - `components/home/Hero.tsx`.
  - Neu `components/home/einstieg/**` (Szene, Client-Insel „Kreislauf zeigen“, Vertrauenszeile, `einstieg-text.ts`).
  - Neu `components/zeichnung/**`: `Leitungstrenner.tsx` und `Rohrklammer.tsx`, später auf allen Seiten genutzt.
  - Tests unter `components/home/__tests__/einstieg*.test.ts(x)` und `components/zeichnung/__tests__/`.
- **Vorbild:**
  - Einstieg aus Variante 1 (`_relaunch/ausbau/richtungen/1/index.html`, Abschnitt `.einstieg`; dazu BEGRUENDUNG.md und die Bildfolgen unter `richtungen/1/erster-bildschirm/`).
  - Aus B Runde 1 (`_relaunch/ausbau/referenz/b-runde1/index.html`, Abschnitt `.held`):
    - der Wegweiser „Wetzlar“ an der Szene,
    - der Textknopf „Kreislauf zeigen“ (Kennung `kreislauf-zeigen`; spielt die Anlaufsequenz erneut ab, `aria-disabled` während des Laufs, nur mit JS sichtbar),
    - der Erklärsatz T-001 wörtlich: „So arbeitet eine Wärmepumpe: Luft liefert die Wärme, der rote Vorlauf bringt sie ins Haus, der blaue Rücklauf kehrt zurück.“ (vom Auftraggeber freigegeben, TEXTVORSCHLAEGE T-001),
    - die Rohrklammer.
- **Inhalt:**
  - h1 aus `HERO.title` / `HERO.titleSecondLine` (Wortlaut bleibt), Einleitung `HERO.lead`, Mikrotext `HERO.microcopy`.
  - Aktionen: „Jetzt bewerben“ (rot, endet am Vorlauf) und der bestehende Zweitweg.
  - Die Maße 13:30 · 30 Tage · 35 km · 1926–2026 aus `HERO_STATS` am Haus bzw. als Maßkette.
  - Die Uhr im Giebel rastet auf 13:30 ein.
- **Elemente:**
  - E-START-002: Jubiläum „100 Jahre Meisterbetrieb (1926–2026)“ im ersten Bildschirm; ab 2027 „Seit 1926“ über `isFactActive('anniversary100', now)`, mit Vitest.
  - E-START-010: Vertrauenspunkte (Diskretion schon oberhalb von #ablauf, feste Baustellen, Partner ohne Pauschalform, Meilenstein/15 Mitarbeiter in der Vertrauenszeile oder knapp).
  - E-START-011: „Innungsbetrieb“ ohne Prozentzahl.
  - E-START-021: ruhige, statische Vertrauenszeile unter dem Einstieg, alle Punkte sichtbar, höchstens 2 Zeilen bei 1440, kein Laufband.
- **Mobil zuerst:**
  - Bei 390 × 844 sind h1, Szene (verkleinert oder angeschnitten) und „Jetzt bewerben“ im ersten Bildschirm.
  - Display-Größe nach K-005 (≈ 76 px bei 390, wenn V1 das so zeigt; sonst die V1-Größe).
  - Kein Layoutsprung (CLS 0): die Szene hat feste Seitenverhältnisse.
- **LCP:** Das LCP-Element ist die h1 bzw. Text, nicht die Szene. Die Szene ist Inline-SVG ohne Bilddatei.
- **Bewegung:**
  - Anlaufsequenz nur unter `.auftakt` bzw. per CSS-Animation mit den Kennungen `luft`, `luefter`, `vorlauf-haus`, `waerme`, `ruecklauf-haus`, `erdleitung`, `uhr`, `pfeile`; Gesamtdauer ≤ 1,5 s.
  - Reduzierte Bewegung zeigt sofort den Endzustand.
  - Die Client-Insel ist klein (≤ 3 KB) und nur für den Knopf da.
- **Opengraph:** `app/opengraph-image.tsx` liest `HERO`/`HERO_STATS`. Diese Exporte bleiben unverändert.

## R3-HOME-02 · Stellen und Vorteile
- **Schreibrechte:**
  - `components/home/JobList.tsx`, `components/home/BenefitGrid.tsx`.
  - `components/jobs/JobCard.tsx`. Wird auch auf `/jobs` und in `MoreJobs` der Stellenseite genutzt. Die Props bleiben rückwärtskompatibel, die anderen Seiten müssen weiter funktionieren. Die eigentliche V2-Gestaltung von `/jobs` folgt in R5.
  - Neu `components/home/vorteile/**` (Konfigurator als Client-Insel, Vorteilskarten, Ausstattung, `vorteile-text.ts`).
  - Tests unter `components/home/__tests__/vorteile*.test.ts(x)` und `components/jobs/__tests__/` (nur JobCard).
- **Vorbild:** `.stellen` aus Variante 1 (Stellen als Leitungsabgänge, Gehalt sichtbar in `font-mass`) und `.stellen` aus B Runde 1.
- **Elemente:**
  - E-START-024: Vorteils-Konfigurator „Dein persönliches Mitarbeiter-Paket“, neu interpretiert. Rollenwahl ändert die Paketzeilen ohne Seitenwechsel, Daten aus `lib/jobs/data/*` (`packageExtras`) und Fakten. pending-Fakten nur bei `onlyForJobIds`, `payFirstWorkday` nirgends (Test). Anker `#karriere-paket`/`#gehalt` bleiben davor (Orchestrator).
  - E-START-016: Wunsch-Vorteile als Auswahl im Konfigurator („Was ist Dir … besonders wichtig?“). Die Auswahl gibt der Bewerben-Knopf als URL-Parameter weiter, nur wenn `lib/apply/params` einen passenden Parameter kennt. Sonst die Auswahl rein clientseitig und als OFFENE FRAGE melden (R5-BEW-01 übernimmt die Parameter).
  - E-START-025: Vorteilskarten „Warum Handwerker aus Wetzlar & Gießen gern zu uns wechseln“ (Überschrift sinngemäß nur, wenn belegt), Familien-Icons aus `components/icons`.
  - E-START-026: Ausstattung „Werkzeug & Fuhrpark“ (Hilti, Fahrzeug, iPad/Smartphone) aus Fakten.
- **Zugänglichkeit des Konfigurators:** echte Radiogruppen bzw. Checkboxen, Ergebnis per `aria-live="polite"`, ohne JS sinnvoller Endzustand (Standardrolle sichtbar).

## R3-HOME-03 · Einsatzgebiet
- **Schreibrechte:**
  - `components/home/RegionSection.tsx`.
  - `components/maps/**` mit Tests.
  - Neu `components/home/gebiet/**` (`gebiet-text.ts`).
  - `components/site/SiteFooter.tsx` nur für die Ortsliste E-SHELL-021 (eigene kleine Komponente in `components/site/FooterPlaces.tsx`, im Fuß eingebunden; die Gestaltung des Fußes macht R4).
- **Vorbild:** `.gebiet` aus B Runde 1 (Radius um Wetzlar mit 15/25/35 km, Pendel, Haus in der Mitte).
- **Elemente:**
  - E-START-032: Karte neu interpretiert. Die Vektor-Radiusgrafik im Formsystem ist die Hauptdarstellung; die Google-Karte bleibt der bestehende optionale Ladeweg (Einwilligung, E-START-056), nichts an Schlüssel oder Ladeweg ändern.
  - E-START-029: Orts-Pillen.
  - E-START-030: Werkstatt-Karte mit Adresse und „Material direkt am Lager einladen“, keine ungeklärten Markennamen.
  - E-START-033: Radius-Umschalter 15/25/35 km als echte Radiogruppe.
  - E-START-036: Landschaftsgrafik Lahn, Dill, A45, B49 schematisch, vier Pfade, ≤ 40 KB gzip, hell/dunkel kontrastreich.
  - E-START-038: Standort-Pins mit Details. M-016: die drei Geschäftsaussagen der Ortsbeschreibungen **nicht** zeigen (siehe `_relaunch/MENSCHEN.md` M-016).
  - E-START-040: „Route in Google Maps öffnen“ als normaler Link, `target="_blank"` mit `rel="noopener"`, ohne Tracking.
  - E-SHELL-021: Ortsliste im Fuß.
- **Pendlerrechner** (E-START-039, `RegionExplorer`) funktioniert weiter wie heute.

## R3-HOME-04 · Stimmen, Betrieb, Kontakt, Schlussband
- **Schreibrechte:**
  - `components/home/AboutSection.tsx`, `components/home/CtaBand.tsx`.
  - `components/reviews/**` mit Tests.
  - `components/site/ContactOptions.tsx`. Wird auch auf `/bewerbung`, Danke, Mappe und den Stellenseiten genutzt; die Props bleiben rückwärtskompatibel.
  - Neu `components/home/betrieb/**` (`betrieb-text.ts`).
- **Elemente:**
  - E-START-043: Google-Bewertungen mit Inhaber-Antwort, nur echte Daten aus `components/reviews/data.ts`.
  - E-START-046: Bewertungs-Karussell neu interpretiert. Wischen bzw. Scroll-Snap, Tastatur, kein Autoplay; reduzierte Bewegung ohne Schwung.
  - E-START-031: Meilenstein 2026 mit „Meilenstein 2026“, „Siegmund-Hiepe-Str. 20“, „größeres Lager“, „15 Leuten“ (aus `REGION.milestone`/Fakten).
  - E-START-048: Kontakt „Sprich direkt mit …“ mit dem Namen Sabri Demir aus `COMPANY.managingDirector`, Kanäle in der Reihenfolge Telefon, WhatsApp, E-Mail.
  - E-START-051: Schlussband mit Rückruf auf die Leitidee. Der rote Vorlauf endet in „Jetzt bewerben“ (Navy-Band, Logo auf Plakette, falls es dort steht).
- **Grenzen:** E-START-044 (erfundene Teamstimmen) bleibt draußen. `TEAM_QUOTES` nur zeigen, wenn belegt (heute: wie bisher).

## R3-HOME-05 · Arbeitswoche, Ablauf, FAQ, Abschnittsköpfe
- **Schreibrechte:**
  - `components/home/WeekSection.tsx` (heute Platzhalter des Orchestrators).
  - `components/home/ProcessTimeline.tsx`, `components/home/FaqSection.tsx`.
  - `components/home/SectionHeader.tsx`. Wird von allen Abschnitten genutzt; Props nur ergänzen, nie umbenennen oder entfernen, damit die parallelen Pakete nicht brechen.
  - Neu `components/home/woche/**`.
  - Tests unter `components/home/__tests__/woche*.test.ts(x)`.
- **Vorbild:**
  - `.woche` aus Variante 1: „Freitags ab 13:30 Uhr Feierabend“.
  - Das Arbeitszeit-Diagramm aus B Runde 1 (`figure.woche`, viewBox 320 × 172, `role="img"` mit Titel und Beschreibung): fünf Tage, Freitag endet um 13:30, Maße in `font-mass`.
  - Arbeitszeiten nur aus Fakten (`friday1330` und ggf. belegte Wochenarbeitszeit). Was nicht belegt ist, nicht zeigen.
- **Abschnittsköpfe** (SectionHeader): Etikett (`text-etikett`), h2 in `font-display text-brand`, Einleitung; optional das Rohrklammer-Motiv als Marke. Ohne `components/zeichnung` vorauszusetzen: R3-HOME-01 baut die Datei parallel; nutze sie nur, wenn sie schon existiert, sonst ein eigenes kleines Inline-Zeichen.
- **Ablauf** (E-START-027, Wechselprozess mit Diskretion): drei Schritte als Leitungsstrang (Paar Vorlauf/Rücklauf als Fortschrittslinie), Diskretionszusage sichtbar.
- **FAQ** (E-START-050): fünf Fragen, `Disclosure` bleibt; JSON-LD unverändert.
