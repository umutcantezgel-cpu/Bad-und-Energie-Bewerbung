STATUS · Phase P2/A2 (gemeinsam) · Welle 0/0 · Erfüllt 1/14 · Ausbau 0/11 · Ausnahmen 0 · Elemente 0/61 · Slop hart 51 · Jury 4,9 · Wow – · Lighthouse mobil 94 · axe 0 · Puffer 100 % · Nächster Schritt: Messbasis ergänzen (390/430, Wow-Ausgangswert), Steigerungsanalyse, drei Steigerungsvarianten B+A

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
