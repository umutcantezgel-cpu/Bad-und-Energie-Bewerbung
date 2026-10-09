# Messungen – vorher und nachher

## Zehnfach-Tafel
| Größe | Ausgangswert (P0) | Zielwert | Aktuell | Beleg |
|---|---|---|---|---|
| Slop hart (S-01…S-07) | S-01 0 · S-02 0 · S-03 0 · S-04 1 (4 Icon-Strichstärken 1,75/2/2,25/2,5) · S-05 4 Fundstellen (FlowShortcuts calc-Klasse, CheckMark delay/duration, Mappe-pt-Größen, select 17 px) · S-06 46 Elemente ohne Hover-Zustand (d1440) · S-07 0 | 0 | wie Ausgang | belege/P0-SLOP-01/slop-hart.md |
| Slop weich (Summe S-08…S-14, Grundmenge, Regeln E-010) | 35 (streng-wörtlich 17, mit allen Grenzfällen 46; 7 eindeutige Fundstellen) | ≤ 7, ≤ 2 je Hauptseite | 35 | belege/p0-slop-weich/slop-weich.md |
| Jury (gewichtet aus Medianen, je Hauptseite) | Start 5,2 · Stellen 4,5 · Stellenseite 5,0 · Bewerbung 4,8 (schwächste Kategorie: Kreativität 2,5–4,0) | ≥ 8,0, keine Kategorie < 7,5 | wie Ausgang | belege/p0-jury/zusammenfassung.md |
| Wow-Probe (Lauf 2, A-03): Median aus Überraschung und Begehrlichkeit · Vertrauen, je Schwerpunktseite und Ansicht | Start m390 5,5 · V 6 / d1440 5,0 · V 7; Stellenseite m390 4,0 · V 6 / d1440 4,0 · V 7 (5 Haiku-Erstbetrachter, erster Bildschirm 0–1,5 s, hell) | ≥ 8,5; Vertrauen ≥ Ausgang; ≥ 4/5 konkretes Merkmal | wie Ausgang | ausbau/belege/a0-wow/ergebnis.json |
| Blindvergleich (Siege Endstand) | – | ≥ 90 % | – | – |
| Bewegungsregister-Abdeckung (data-motion ↔ Register) | folgt P0 | 100 % | – | – |
| axe ernst/kritisch (Grundmenge × Ansichten × Schemata + Zustände) | 0 (110 Läufe; auch 0 mäßig/gering) | 0 | 0 | belege/P0-MESS-02/axe.md |
| Lighthouse mobil (Median aus 5, Hauptseiten) | Perf 94 · 96 · 94 · 94 – LCP 2,92 · 2,63 · 3,08 · 2,94 s (alle über 2,5 s) · CLS 0 · TBT 80–108 ms | Perf ≥ 90, LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms | wie Ausgang | belege/p0-lighthouse/lighthouse.md |
| Element-Abdeckung (integriert / Muss+Soll) | – | 100 % | – | VERLUSTLISTE.md |

## Ebene 1 Bestand (P0, 09.10.2026, Commit a83269d + Ausschluss-Konfiguration)
| Prüfung | Ergebnis | Dauer |
|---|---|---|
| `bun run lint` | grün | 15 s |
| `bun run type-check` | grün | 10 s |
| `bun run test` (Vitest) | 60 Dateien, 927 Tests grün | 9 s |
| `check:design` · `check:contrast` · `check:client-imports` | grün | < 1 s |
| `bun run build` | grün, 27 statische Seiten | 27 s |
| `bun run test:graph` | grün | < 1 s |
Log: `_relaunch/.roh/p0/ebene1.log` (lokal).

## Ebene 6 Leistung – Lighthouse (P0, 09.10.2026, Median aus 5 Läufen, Produktions-Build :3500, Chromium 141, Lighthouse 13.5)
| Seite | mobil Perf | mobil LCP | mobil TBT | Desktop Perf | Desktop LCP | Budget |
|---|---|---|---|---|---|---|
| / | 94 | 2,92 s | 108 ms | 100 | 0,64 s | LCP über Budget |
| /jobs | 96 | 2,63 s | 98 ms | 100 | 0,55 s | LCP über Budget |
| /jobs/anlagenmechaniker-shk-wetzlar | 94 | 3,08 s | 80 ms | 100 | 0,67 s | LCP über Budget |
| /bewerbung | 94 | 2,94 s | 93 ms | 100 | 0,60 s | LCP über Budget |
A11y, Best Practices, SEO überall 100; CLS 0,000; keine Drittanbieter-Bytes. LCP-Element ist jeweils die H1 bzw. ein Text im Kopf (Schrift-/Renderpfad). Z-12 verlangt: LCP ≤ 2,5 s auf allen Hauptseiten – der Ausgangsstand verfehlt das bereits; Ursache in P3 (Schriftladen, kritischer Pfad) klären.

## Ebene 5 Zugänglichkeit (P0, P0-MESS-02)
| Prüfung | Ausgangswert |
|---|---|
| axe (110 Läufe) | 0 kritisch · 0 ernst · 0 mäßig · 0 gering; „unklar“ color-contrast: SVG-Text der Radiusgrafik (16 Läufe) → manuelle Messung nötig |
| Tastatur (4 Hauptseiten) | Sprunglink zuerst; 0 Schritte ohne sichtbaren Fokus; 0 verdeckt; 0 Fallen |
| Reflow 320 px | 0/12 Überlauf; abgeschnitten: `bewerbung-mappe` „Hinzufügen“ |
| Zoom 200 % (720×450 @2) | 0/12 Überlauf (CSS-zoom-Vergleich nur Hinweis) |
| Textabstände 1.4.12 | 1/24 neuer Überlauf: Start m375 +6 px durch Sticky-Bewerbungsleiste |
| Erzwungene Farben | Primärknopf ohne Rahmen (nur Text) → Befund; 142/175 Links ohne Unterstreichung/Rahmen (Hinweis) |
| Ohne JavaScript | alle Seiten mit h1 und Inhalt; `/bewerbung`: 6 SVG mit opacity 0 (dekorativ) |

## Ebene 6 Größen (P0, P0-MESS-01 – Probelauf, Endwerte folgen)
| Größe | Ausgangswert |
|---|---|
| Schriften gesamt | 47,3 KB (1 Datei, Inter) |
| JS je Seite (gzip) | 170–224 KB; eindeutig 19 Dateien, 237 KB gzip |
| CSS | 2 Dateien, 13,3 KB gzip |
| Inline-SVG | 215 Elemente, 35 eindeutig; 1 über 1,5 KB (Radiusgrafik 2.459 B) |

## Ebene 7/8 Suche und SVG (P0, P0-SLOP-01)
| Prüfung | Ausgangswert |
|---|---|
| Metadaten Grundmenge | 12/12 mit title, description, 1 h1, JSON-LD (19 Blöcke gültig); 228 interne Links, 0 kaputt |
| Alte URLs/Anker (24) | 15 ok · 1 Weiterleitung (`?tab=dossier` → 308 `/bewerbung/mappe`) · 8 Anker fehlen (`#express-funnel`, `#gehalt`, `#karriere-paket`, `#benefits`, `#ausstattung`, `#wechsel-prozess`, `#bewertungen`, `#kontakt`) |
| Canonical | `/bewerbung` nutzt Anfrage-Host (lokal localhost) – prüfen; 404 ohne canonical (richtig) |
| Inline-SVG | 215 (204 lucide, 11 eigene); 0 ID-Kollisionen; 0 Zugänglichkeitsfehler; Budgets eingehalten |
| SVG-Dateien | 3 KI-Nachzeichnungen des Logos in `public/images/*.svg` (ungenutzt, kein SVGO-Fixpunkt) |

## Jury-Durchgänge
### Durchgang P0 (09.10.2026, Ausgangsstand a83269d)
Siehe `belege/p0-jury/zusammenfassung.md` und `belege/p0-jury/urteile/*.json`. Gemeinsame Befunde aller 12 Urteile: keine Bildwelt/Leitidee, Logo-Farben nicht genutzt, gleichförmige Karten, Kernversprechen (Feierabend 13:30, 35 km, Vertraulichkeit) nur als Text, Desktop-Kompositionen mit leeren Hälften. Mehrfach vorgeschlagen: Rohrleitungs-/Heizkreis-Motiv mit Rot/Blau-Fluss als Signatur, Fortschritt als „fließende“ Leitung. Hinweis: Juroren schlagen Fotos vor – ausgeschlossen durch Inhaberentscheidung (keine Fotos); Lösung über SVG/Illustration.

## Wow-Probe – Ausgangswert (gemeinsamer Lauf, Folgeauftrag §9, 09.10.2026)
Fünf frische Haiku-Erstbetrachter in der Rolle des PUBLIKUMS (Chef). Briefing: `ausbau/pakete/_erstbetrachter.md`. Material: Streifen des ersten Bildschirms 0–1500 ms (`ausbau/belege/a0-erster-bildschirm/`, Werkzeug `werkzeuge/erster-bildschirm.mjs`), helles Schema, Reihenfolge je Betrachter variiert. Einwilligungsbanner: Im Ausgangsstand gibt es keins; die Karte nutzt eine Zwei-Klick-Einwilligung im Abschnitt.

| Seite · Ansicht | Überraschung | Begehrlichkeit | Vertrauen | Median Ü/B | Konkretes Merkmal (häufigste Nennung) |
|---|---|---|---|---|---|
| Start · m390 | 5 | 6 | 6 | 5,5 | „13:30 Freitags Feierabend“ groß unten |
| Start · d1440 | 4 | 6 | 7 | 5,0 | Zahlenreihe 13:30 · 30 · 35 km · 1926 |
| Stellenseite · m390 | 3 | 5 | 6 | 4,0 | Gehaltskasten 3.600–4.600 € |
| Stellenseite · d1440 | 3 | 5 | 7 | 4,0 | Gehalt und Kontaktkarte rechts |

Lesart: Die Erstbetrachter geben das Angebot überall richtig wieder (Klarheit ist eine Stärke, die bleiben muss). Überraschung ist der Engpass (3–5). Ziel A-03 ist ein Median ≥ 8,5, bei Vertrauen mindestens 6 (mobil) bzw. 7 (Desktop).

