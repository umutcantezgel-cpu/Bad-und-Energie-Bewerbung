# Lighthouse-Messung · v6a1-css-b2-graph

- Datum: 10.10.2026, 13:01 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3461 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 89 | 100 | 100 | 100 | 3,18 | 0,000 | 279 | 1,83 | 466 | über Budget (Perf 89 < 90; LCP 3,18 s > 2,5 s; TBT 279 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 90 | 100 | 100 | 100 | 3,18 | 0,015 | 152 | 1,83 | 486 | über Budget (LCP 3,18 s > 2,5 s) |
| /bewerbung | mobil | 89 | 100 | 100 | 100 | 3,33 | 0,000 | 208 | 1,67 | 462 | über Budget (Perf 89 < 90; LCP 3,33 s > 2,5 s; TBT 208 ms > 200 ms) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 86–90 | 2,75–3,34 | 179–290 | 1,83 | 4,20 | 30 | 0 | 0 | 1.884 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 90–91 | 3,17–3,19 | 137–179 | 1,83 | 3,84 | 33 | 0 | 0 | 1.937 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 3/3 | 84–90 | 3,03–3,81 | 167–229 | 1,67 | 3,94 | 32 | 0 | 0 | 1.877 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |

Rohberichte: `_relaunch/.roh/v6a1-css-b2-graph/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-b2-graph/lighthouse.json`
