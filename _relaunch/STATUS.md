STATUS · E-031 WÄRME UND WEICHHEIT IN ARBEIT (15.10.2026) · Entscheidung E-031 · KERN 1.3 · W0 und W1–W4 (Wärmefeld, Weichheit und Rohrakzente, Büro und Verwaltung, Cursor/Klick-Wärme/Wärmefront) lokal auf `main` zusammengeführt, Prüfrunden 2 und 3 behoben (Prüfrunde 3: Wärmefeld mit Deckenstrahl und proportionaler Skala, Wärmefront ruhig und ohne Verblassen, Klick-Wärme je Ton, Büro-Ebenen, Wahrheit auf /jobs und „Fahrzeug und Werkzeug“, siehe ENTSCHEIDUNGEN), Prüfrunde 4 ohne Wärmefeld behoben (Wärmefront mit Seitenfarbe zuletzt, Wechsel bei erster Deckung und Vorlauf; Knopf der Dauerbewegung nach dem Auftakt; Gebietssatz, Teilen-Bilder Büro, Design; offen: einzelne Bilder 2–3,6 ms beim echten Laden durch die Hydration anderer Teile), volle lokale CI grün (3.831 Unit-Tests, e2e 587 bestanden), nicht gepusht · LCP der Wärmepumpen-Seite: in Runde 2 gemessen +230 ms (Median, 5 Läufe ungepaart) bzw. +69 ms gepaart, nach den CSS-Grenzen gepaart −1 ms (`_relaunch/belege/e031-pruefrunde-2/lcp-gepaart.md`) · offen: weitere Prüfrunden, Belege · Live: main 1417e0b (E-029/E-030) · Ausgangswerte in `_relaunch/belege/e031-vorher/`

Vorher: STATUS · BEWERBER-MASCHINE IN ARBEIT (Plan vom 14.10.2026) · Entscheidungen E-029 (Technische Zeichnung 2.0, Dauerbewegung, Bosch-Sperre, Indexierung per Gate) und E-030 (Lohn auf Anfrage) · KERN 1.2 · Bau in fünf Paketen W1–W5, zusammengeführt auf `claude/epic-curie-fkohsk` · Live: main 2f34ae9 (12.10.2026, 72 indexierbare URLs) · Menschen-Punkte M-020…M-040 (MENSCHEN.md, Kurzliste `docs/inhaber/offene-angaben.md`)

Vorher: STATUS · ABGESCHLOSSEN · Live seit 10.10.2026 10:17 UTC (main e2b3cb1, PR #9) · Alle 12 Seiten im Design Variante 3 (E-024) · Muss/Soll gebaut · CI grün · Playwright 182/182 · Lighthouse A11y/BP/SEO 100 · Folgearbeit: LCP < 2,5 s, Kann-Elemente, Showcase-Ausbau, Menschen-Punkte (MENSCHEN.md)

# Status · Rückführung und Veredelung

## Der Auftrag in drei eigenen Sätzen
1. Alles, was die Live-Karriereseite (Altstand `main` @ f2e7eae) für Bewerber und Betrieb leistete und beim Umbau zur Recruiting-Plattform (PR #1 + Supabase 2a) verloren ging oder schwächer wurde, kommt im Wesen zurück – neu gebaut in der Sprache der Plattform, ohne Alt-Code und ohne erfundene Inhalte.
2. Die gesamte Oberfläche wird aus einer einzigen Leitidee für Bad & Energie heraus neu gestaltet – Schrift, Raster, Farbe, Bewegung und SVG –, sodass sie unverwechselbar wird und den KI-Einheitslook messbar ablegt.
3. Jede Verbesserung wird gemessen (Slop, Jury, axe, Lighthouse, Bewegung, SVG), nichts Bestehendes darf brechen, und am Ende steht ein belegter Stand, der nach `main` und damit live geht.

## Einstellungen und Annahmen (leere Felder → Standard, plus Festlegungen des Auftraggebers)
| Einstellung | Wert | Herkunft |
|---|---|---|
| PROJEKTORDNER | /home/user/Bad-und-Energie-Bewerbung | Standard (aktueller Ordner) |
| Basis / Ausgangsstand | `claude/optimistic-turing-etjnl3` (264bf4e) + Merge 5f7f090 → Commit a83269d | Auftraggeber (Rückfrage 1) |
| ALTBESTAND | `main` @ f2e7eae (Git), lokal entpackt nach `_relaunch/altstand/main`; Git-Historie 9717265…f2e7eae | selbst gesucht |
| LIVE-ADRESSE | https://karriere.bad-energie.de (liefert derzeit den Altstand aus) | selbst gefunden |
| Archivkopien | Wayback/archive.ph/Common Crawl vom Proxy abgewiesen; Wayback-Verfügbarkeits-API: keine Kopien für karriere.bad-energie.de | geprüft 09.10.2026 |
| BEKANNTE VERLUSTE | keine angegeben – Lauf findet sie | Standard |
| MARKE | abgeleitet, als Annahme markiert (folgt in KERN K-002) | Standard |
| GESCHMACK | keine | Standard |
| WÜNSCHE | verbindliche Inhaberentscheidungen aus docs/ROADMAP.md §1 (keine KI, keine Fotos/Stock, nur belegte Fakten, Gehälter sichtbar, Karte+Pendelrechner, Mappe, Bewertungsband bleiben) | aus Basis abgeleitet |
| UNANTASTBAR | Logo (Form, Proportion, Farben), Inhalte von Rechts- und Fließtexten, Geschäftslogik (Bewerbungs-Intake, Sicherheit, Supabase) | Standard |
| UMFANG | ganze Plattform | Standard |
| AUSBAUSTUFE | ersetzt durch STEIGERUNG spektakulär (Lauf 2 §5) | E-018 |
| GESTALTUNGSMUT | ersetzt durch STEIGERUNG spektakulär: je Schwerpunktseite ein Hauptmoment, ein Leitfaden, höchstens ein WebGL-/Canvas-Moment auf der Startseite | E-018 |
| TEXTE | Mikrotexte direkt, alles andere als Vorschlag | Standard |
| FREIGABE | ja – **ein** Halt nach dem gemeinsamen P2/A2 | Standard, E-018 |
| PARALLELITÄT | 5 | Standard |
| BRANCH | `claude/kind-ride-n9duod` (Vorgabe der Umgebung) | Umgebung |
| PUSH UND VERÖFFENTLICHUNG | Sicherungs-Push nach jedem Schritt auf BRANCH, Vercel-Vorschau erlaubt; PR nach `main` erst nach ABSCHLUSS, Merge nur auf ausdrückliches Wort des Auftraggebers und bei erfüllten P7-Bedingungen | Auftraggeber (Rückfragen 09.10. 10:xx und 15:xx), E-001, E-020 |
| LAUF 2 (Ausbau) | Folgeauftrag wörtlich in `ausbau/AUFTRAG.md`, mit Lauf 1 zusammengelegt (gemeinsamer Lauf) | Auftraggeber 09.10. 15:01 UTC, E-018 |
| PUBLIKUM | der Chef: entscheidet, spricht kein Designvokabular, achtet auf ersten Eindruck, Hochwertigkeit und Klarheit, öffnet zuerst auf dem Handy | Standard Lauf 2 |
| VORFÜHRTERMIN | keiner | Standard Lauf 2 |
| SCHWERPUNKTSEITEN | `/` und `/jobs/anlagenmechaniker-shk-wetzlar` (einzige Erzählseiten unter den Hauptseiten) | Standard Lauf 2, ausgelegt in E-018 |
| STEIGERUNG | spektakulär | Standard Lauf 2 |
| BILDMATERIAL | nur Vorhandenes (keine Fotos); Frage echte Fotos → Freigabe (N-16) | Standard Lauf 2 |
| RICHTUNGSWUNSCH | B Runde 1 (Haus, Wärmepumpe, Rot/Blau-Kreislauf, warmes Papier) verschmolzen mit As Präzision | Auftraggeber („alle“), E-019 |
| MODELLE | ab 09.10. 15:xx nur Opus 5.5 und Haiku 5.5 (vorher: Opus/Sonnet/Haiku nach Lauf 1) | Auftraggeber, E-020 |
| ANSICHTEN (Ergänzung) | zusätzlich 390×844 und 430×932 | Standard Lauf 2 |
| BUDGETS (Ergänzung) | Erzählseiten bis 120 KB gzip JS für Bewegung/WebGL/Canvas, nur nachgeladen; TBT/INP unverändert | Standard Lauf 2 |
| _relaunch | wird mitcommittet; Bilder optimiert (WebP), Rohdaten lokal | Auftraggeber (Rückfrage 3) |
| ANSICHTEN | 375×812 · 768×1024 · 1440×900 · 1920×1080 | Standard |
| BUDGETS | wie Auftrag Abschnitt 0 | Standard |
| BERICHTE | Morgenbericht 07:00 Europe/Berlin | Standard, Zeitzone angenommen |

## Sicherung
- Altstand-Archiv: `_relaunch/sicherung/altstand-main-f2e7eae.tar.gz` (lokal)
- Ausgangsstand-Archiv: `_relaunch/sicherung/ausgangsstand-a83269d.tar.gz` (lokal)
- Ausgangsstand-Commit: a83269d (Merge von 5f7f090 auf 264bf4e); auf origin bereits vorhanden: 264bf4e, 5f7f090
- Kein vorgefundener, nicht committeter Stand (Arbeitsbaum war sauber).

## Protokoll (stündlich)
- 2026-10-09 09:14 CEST · P0 gestartet, Sicherung erstellt, Basis hergestellt (a83269d).
- 2026-10-09 09:54 CEST · P0-MESS-01/-02, P0-SLOP-02, P1-KUND-01…03 abgenommen; Jury Start 5,2 · Stellen 4,5 · Stellenseite 5,0; Slop weich 35 (E-010).
- 2026-10-09 12:09 CEST · Neustart des Workers nach Sitzungslimit; Server neu gestartet; Lighthouse-Basis (LCP mobil 2,63–3,08 s über Budget) und Gegenprobe 2 (280/282, 2 Kann-Nachträge) übernommen.
- 2026-10-09 14:55 CEST · P1-Phasentor bestanden: Z-01 erfüllt (Nachprüfung 3 Runden, Runde 3 ohne Muss/Soll-Lücke; Delta-Gegenprüfung 30 Korrekturen übernommen, E-017); 165 Pässe, 61 zu bauen (Muss 20 · Soll 35 · Kann 6), 9 zurückgestellt (5,5 %). Farben vom Auftraggeber bestätigt (E-016); Bilder ab jetzt immer im Chat (E-015). Stilkacheln A/B/C Runde 1: Jury 7,6–7,9.
- 2026-10-09 17:45 CEST · Folgeauftrag „Ausbau auf Showcase-Niveau“ eingegangen und nach Rückfrage mit Lauf 1 zusammengelegt (E-018); Richtungswunsch B Runde 1 + A-Präzision (E-019); ab jetzt nur Opus und Haiku, Merge nach main nur auf ausdrückliches Wort (E-020). Stilkachel-Jury Runde 2 und Überarbeitung C entfallen (Sitzungslimit, durch E-019 überholt). Server nach Container-Neustart neu gestartet.

- 2026-10-10 00:25 CEST · FREIGABE E-021 (volle Autonomie bis zum Merge); R1 Basis, R3-ORCH (Anker-Aliase) und R2 Fundament abgenommen (7f0c8fe, E-022: CSP ohne Hash, LCP-Rückschritt → R3-PERF-01). Welle R3 Startseite gestartet.

- 2026-10-10 11:50 CEST · Fertigstellung nach E-023/E-024: alle Seiten im Design der Bilder des Auftraggebers (Variante 3), Gesamtprüfung grün (E-025), Supabase lesend geprüft (2a bereits in Produktion). PR nach main folgt.

- 2026-10-10 12:20 CEST · PR #9 gemergt (e2b3cb1) und live; Live-GET aller Routen 200, 404 korrekt (E-026).

- 2026-10-12 · Arbeitszeit-Korrektur (B28, E-027: flexible Arbeitszeiten, Leitmotiv „35 km“), Ortsseiten und Themenseiten nach E-028 (Gebietsseite, 4 Kreis-Hubs, 54 Ortsseiten, 6 Themenseiten; 72 indexierbare URLs), Navigation mit Einsatzgebiet und „Arbeiten bei uns“ · main 2f34ae9.

- 2026-10-14 · Bestandsaufnahme in sieben Analysen (Grafiken, SEO/AEO/GEO, Funnel, Wettbewerb, Bosch-Bildrecht, Projektregeln, Design): Hero fachlich falsch, Wärmepumpe viermal verschieden, Ortsseiten mit Doorway-Muster, BA-Jobbörse ohne Treffer, keine Messung, Hauptdomain ohne Link zur Karriereseite. Antworten des Inhabers und Plan „Bewerber-Maschine“ (P0–P3); E-029, E-030, KERN 1.2, MENSCHEN M-020…M-040, Inhaber-Unterlagen in `docs/inhaber/` (Paket W5). Zeitkritisch: Die Ausbildungsstelle 2026 läuft am 31.12.2026 aus; `lib/jobs/__tests__/registry.test.ts` wird ab etwa 17.12.2026 rot, wenn sie nicht vorher archiviert und durch die Ausbildung 2027 ersetzt ist (Paket W3).

- 2026-10-15 · Auftrag des Inhabers „Wärme und Weichheit“, Büro und Verwaltung, Cursor, Klick und Seitenwechsel (E-031). W0 legt Regeln und Verträge fest: E-031, KERN 1.3, Bewegungsregister (Auslöser `nachlauf` und `sicht`, Kennungen `waerme-breitet-sich-aus`, `buero-ablauf`, `klick-waerme`, `seitenwechsel` als Wärmefront), Wärmerampe `--waerme-0…4` und Wärmebereich, Guards (Kontrast, Design, CSS-Ketten), `SichtStart`, Platzhalter des Wärmefelds und die Linienarten (Leitungen rund). Hero vor E-031: 5.128 B gzip.
- 2026-10-15 · Zusammenführung W4 → W2 → W1 → W3 auf `main` (lokal, `--no-ff`): Konflikte nur in `lib/zeichnung/kopf-svg.ts`, `lib/zeichnung/__tests__/kopf-svg.test.ts` und `e2e/README.md`, beide Absichten erhalten. Danach: Rohrakzent statt harter Oberkante über den Büro-Fragen (Weichheit-Wächter), Rohrklammer am ersten Abschnitt der Büro-Seite, Rohrakzent ohne `cn()` (tailwind-merge war über die Bewerbungsleiste in den sofort geladenen Teil jeder Seite gerutscht; Wächter `components/site/__tests__/schale-bundle.test.ts`), Wärmefront-Test für alle Themen. Volle lokale CI grün: lint, type-check, 3.740 Unit-Tests, design, contrast, client-imports, build mit CSS-Ketten, graph, claims, similarity, orte:gate, Wärmefeld-Lock, e2e 481 bestanden (471 nach Projekt übersprungen), Lighthouse CI ohne Fehler (Performance-Warnungen auf `/`, Anlagenmechaniker und `/einsatzgebiet` wie vor E-031). LCP mobil (`lh.mjs`, je 11 Läufe, gleiche Sitzung gegen 1417e0b): `/` 3,11 → 3,11 s, `/jobs` 2,65 → 2,66 s, Bürofachkraft 2,65 → 2,79 s (Mittel 2,78 → 2,76 s), Wärmepumpen 2,88 → 2,95 s (Dokument +10 KB gzip: Vergleichsfigur, Leitungstrenner, Rohrakzente).
- 2026-10-16 · Prüfrunde 4 zu E-031, Teil Wärmefront, Steuerung, Wahrheit und Design (A4-2 bis A4-6, C4-1 bis C4-3, D4-1 bis D4-3; Wärmefeld A4-1, B4-1 bis B4-4 im eigenen Paket): Wärmefront mit Vorlauf in Startgröße, Seitenfarbe als letzte Schicht und Wechsel bei erster Deckung (keine gerade Kante in über 30 Läufen eigener Bildfolgen, Klick bis Front zu am Desktop 810–930 ms statt 1.000–1.100 ms), Register der Klick-Wärme mit beiden Dauerstufen, Knopf der Dauerbewegung erst nach dem Auftakt, Gebietssatz auf Startseite und in llms-full.txt, Wörter der Leitstelle im Teilen-Bild (Stand 2026-10-16), Bildunterschrift der Büro-Szenen, Kennwert-Spalte im Hub, Rolle `--markierung`. Einzelheiten und Offenes in ENTSCHEIDUNGEN (E-031, Prüfrunde 4).
