# Messungen – vorher und nachher

## Zehnfach-Tafel
| Größe | Ausgangswert (P0) | Zielwert | Aktuell | Beleg |
|---|---|---|---|---|
| Slop hart (Summe S-01…S-07) | folgt P0 | 0 | – | belege/P0-SLOP-01/slop-hart.md |
| Slop weich (Summe S-08…S-14, Grundmenge) | folgt P0 | ≤ 20 % des Ausgangswerts, ≤ 2 je Hauptseite | – | belege/p0-slop-weich/ |
| Jury (gewichtet, Median, je Hauptseite) | folgt P0 | ≥ 8,0, keine Kategorie < 7,5 | – | belege/p0-jury/ |
| Blindvergleich (Siege Endstand) | – | ≥ 90 % | – | – |
| Bewegungsregister-Abdeckung (data-motion ↔ Register) | folgt P0 | 100 % | – | – |
| axe ernst/kritisch (Grundmenge × Ansichten × Schemata + Zustände) | folgt P0 | 0 | – | belege/P0-MESS-02/axe.md |
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

## Jury-Durchgänge
(folgt)
