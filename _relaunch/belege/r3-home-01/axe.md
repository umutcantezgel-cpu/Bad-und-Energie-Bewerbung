# axe · r3-home-01

Erstellt 2026-10-09T22:47:28.127Z · Basis http://localhost:3450

## Messbedingungen
- @axe-core/playwright 4.13.0, axe-core 4.13.0 · Chromium 141.0.7390.37 (voller Modus)
- Tags: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa
- Ansichten: m390 390×844 · d1440 1440×900 · Schemata: hell, dunkel · reducedMotion: reduce
- Vorbereitung: goto networkidle → document.fonts.ready → scrollThrough → Zustand herstellen → Animationen beendet → axe (ganze Seite)
- Anfragesperre: lib/browser.mjs (G5): POST/PUT/PATCH/DELETE → Attrappe, Tracking → 204, Fremdhosts blockiert
- Zählweise: „Regeln“ = Anzahl verletzter Regeln im Lauf nach Wirkung (jede Regel einmal je Lauf); „Knoten“ = betroffene Elemente.

## Abdeckung
- Seiten der Grundmenge: 1 × 2 Ansichten × 2 Schemata = 4 Läufe
- Zustände: 0 () = 0 Läufe
- Gesamt: 4 Läufe, erfolgreich 4, fehlgeschlagen 0
- Anfragesperre insgesamt: attrappe POST ×1

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
| **Summe (4 Läufe)** | | | | **0** | **0** | **0** | **0** | 0 Regel-IDs |

## Regel-IDs und Fundstellen
Keine Verstöße gefunden.

## Unklar (axe „incomplete“, nicht als Verstoß gezählt)
| Regel | Läufe | Knoten | Seiten/Zustände | erstes Ziel (erster Lauf) |
|---|---:|---:|---|---|
| color-contrast | 4 | 206 | start | `.einstieg-module__tfiXEq__lead` (start__m390-light) |

## Nachweise der Zustände
