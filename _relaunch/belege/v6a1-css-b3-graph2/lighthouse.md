# Lighthouse-Messung · v6a1-css-b3-graph2

- Datum: 10.10.2026, 13:04 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3461 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 92 | 100 | 100 | 100 | 3,05 | 0,000 | 158 | 1,62 | 461 | über Budget (LCP 3,05 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 92 | 100 | 100 | 100 | 3,18 | 0,015 | 166 | 1,39 | 477 | über Budget (LCP 3,18 s > 2,5 s) |
| /bewerbung | mobil | 92 | 100 | 100 | 100 | 3,18 | 0,000 | 159 | 1,38 | 454 | über Budget (LCP 3,18 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 89–93 | 3,04–3,05 | 135–247 | 1,55 | 4,14 | 26 | 0 | 0 | 1.943 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 91–92 | 3,03–3,19 | 123–168 | 1,39 | 3,92 | 28 | 0 | 0 | 1.542 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 3/3 | 86–92 | 3,02–3,71 | 135–215 | 1,38 | 4,06 | 27 | 0 | 0 | 1.720 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |

Rohberichte: `_relaunch/.roh/v6a1-css-b3-graph2/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-b3-graph2/lighthouse.json`
