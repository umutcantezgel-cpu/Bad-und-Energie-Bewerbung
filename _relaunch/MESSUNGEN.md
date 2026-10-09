# Messungen – vorher und nachher

## Zehnfach-Tafel
| Größe | Ausgangswert (P0) | Zielwert | Aktuell | Beleg |
|---|---|---|---|---|
| Slop hart (Summe S-01…S-07) | folgt P0 | 0 | – | belege/P0-SLOP-01/slop-hart.md |
| Slop weich (Summe S-08…S-14, Grundmenge, Regeln E-010) | 35 (streng-wörtlich 17, mit allen Grenzfällen 46; 7 eindeutige Fundstellen) | ≤ 7, ≤ 2 je Hauptseite | 35 | belege/p0-slop-weich/slop-weich.md |
| Jury (gewichtet, Median, je Hauptseite) | folgt P0 | ≥ 8,0, keine Kategorie < 7,5 | – | belege/p0-jury/ |
| Blindvergleich (Siege Endstand) | – | ≥ 90 % | – | – |
| Bewegungsregister-Abdeckung (data-motion ↔ Register) | folgt P0 | 100 % | – | – |
| axe ernst/kritisch (Grundmenge × Ansichten × Schemata + Zustände) | 0 (110 Läufe; auch 0 mäßig/gering) | 0 | 0 | belege/P0-MESS-02/axe.md |
| Lighthouse mobil Perf (Median, Hauptseiten) | folgt P0 | ≥ 90 je Hauptseite | – | belege/p0-lighthouse/lighthouse.md |
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

## Jury-Durchgänge
(folgt)
