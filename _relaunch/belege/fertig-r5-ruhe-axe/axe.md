# axe · fertig-r5-ruhe-axe

Erstellt 2026-10-10T09:18:17.342Z · Basis http://localhost:3450

## Messbedingungen
- @axe-core/playwright 4.13.0, axe-core 4.13.0 · Chromium 141.0.7390.37 (voller Modus)
- Tags: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa
- Ansichten: m375 375×812 · d1440 1440×900 · Schemata: hell, dunkel · reducedMotion: reduce
- Vorbereitung: goto networkidle → document.fonts.ready → scrollThrough → Zustand herstellen → Animationen beendet → axe (ganze Seite)
- Anfragesperre: lib/browser.mjs (G5): POST/PUT/PATCH/DELETE → Attrappe, Tracking → 204, Fremdhosts blockiert
- Zählweise: „Regeln“ = Anzahl verletzter Regeln im Lauf nach Wirkung (jede Regel einmal je Lauf); „Knoten“ = betroffene Elemente.

## Abdeckung
- Seiten der Grundmenge: 3 × 2 Ansichten × 2 Schemata = 12 Läufe
- Zustände: 0 () = 0 Läufe
- Gesamt: 12 Läufe, erfolgreich 12, fehlgeschlagen 0
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
| datenschutz | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| datenschutz | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| datenschutz | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| datenschutz | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| impressum | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| impressum | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| impressum | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| impressum | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| fehler-404 | m375 | hell | 404 | 0 | 0 | 0 | 0 | – |
| fehler-404 | m375 | dunkel | 404 | 0 | 0 | 0 | 0 | – |
| fehler-404 | d1440 | hell | 404 | 0 | 0 | 0 | 0 | – |
| fehler-404 | d1440 | dunkel | 404 | 0 | 0 | 0 | 0 | – |
| **Summe (12 Läufe)** | | | | **0** | **0** | **0** | **0** | 0 Regel-IDs |

## Regel-IDs und Fundstellen
Keine Verstöße gefunden.

## Unklar (axe „incomplete“, nicht als Verstoß gezählt)
| Regel | Läufe | Knoten | Seiten/Zustände | erstes Ziel (erster Lauf) |
|---|---:|---:|---|---|
| color-contrast | 8 | 20 | datenschutz, impressum, fehler-404 | `.kopf-module__gMMShq__zaehler` (datenschutz__d1440-light) |
| aria-valid-attr-value | 6 | 6 | datenschutz, impressum, fehler-404 | `button[aria-haspopup="dialog"]` (datenschutz__m375-light) |

## Nachweise der Zustände
