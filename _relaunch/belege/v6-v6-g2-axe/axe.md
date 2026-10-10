# axe · v6-v6-g2-axe

Erstellt 2026-10-10T11:25:18.891Z · Basis http://localhost:3450

## Messbedingungen
- @axe-core/playwright 4.13.0, axe-core 4.13.0 · Chromium 141.0.7390.37 (voller Modus)
- Tags: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa
- Ansichten: m390 390×844 · d1440 1440×900 · Schemata: hell, dunkel · reducedMotion: reduce
- Vorbereitung: goto networkidle → document.fonts.ready → scrollThrough → Zustand herstellen → Animationen beendet → axe (ganze Seite)
- Anfragesperre: lib/browser.mjs (G5): POST/PUT/PATCH/DELETE → Attrappe, Tracking → 204, Fremdhosts blockiert
- Zählweise: „Regeln“ = Anzahl verletzter Regeln im Lauf nach Wirkung (jede Regel einmal je Lauf); „Knoten“ = betroffene Elemente.

## Abdeckung
- Seiten der Grundmenge: 5 × 2 Ansichten × 2 Schemata = 20 Läufe
- Zustände: 0 () = 0 Läufe
- Gesamt: 20 Läufe, erfolgreich 20, fehlgeschlagen 0
- Anfragesperre insgesamt: keine gesperrten oder abgefangenen Anfragen

## Summe
| | kritisch | ernst | mäßig | gering |
|---|---:|---:|---:|---:|
| Regel-Treffer über alle Läufe | 0 | 0 | 0 | 0 |
| betroffene Knoten über alle Läufe | 0 | 0 | 0 | 0 |
| unterschiedliche Regeln | 0 | 0 | 0 | 0 |

## Läufe (Seite/Zustand × Ansicht × Schema)
Zellen: Anzahl verletzter Regeln je Wirkung.

| Seite/Zustand | Ansicht | Schema | Status | kritisch | ernst | mäßig | gering | Regeln |
|---|---|---|---:|---:|---:|---:|---:|---|
| start | m390 | hell | 200 | 0 | 0 | 0 | 0 | – |
| start | m390 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| start | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| start | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | m390 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | m390 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | m390 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | m390 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | m390 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | m390 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | m390 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | m390 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| **Summe (20 Läufe)** | | | | **0** | **0** | **0** | **0** | 0 Regel-IDs |

## Regel-IDs und Fundstellen
Keine Verstöße gefunden.

## Unklar (axe „incomplete“, nicht als Verstoß gezählt)
| Regel | Läufe | Knoten | Seiten/Zustände | erstes Ziel (erster Lauf) |
|---|---:|---:|---|---|
| color-contrast | 20 | 524 | start, stelle-anlagenmechaniker, stelle-kundendienst, stelle-obermonteur, stelle-ausbildung | `.fill-current[y="80"][x="-64"]` (start__m390-light) |
| aria-valid-attr-value | 10 | 10 | start, stelle-anlagenmechaniker, stelle-kundendienst, stelle-obermonteur, stelle-ausbildung | `button[aria-haspopup="dialog"]` (start__m390-light) |

## Nachweise der Zustände
