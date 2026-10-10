# Lighthouse-Messung · v6a1-css-b1-inline

- Datum: 10.10.2026, 12:59 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3461 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 79 | 100 | 100 | 100 | 3,33 | 0,000 | 506 | 1,78 | 554 | über Budget (Perf 79 < 90; LCP 3,33 s > 2,5 s; TBT 506 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 89 | 100 | 100 | 100 | 3,32 | 0,015 | 199 | 1,44 | 568 | über Budget (Perf 89 < 90; LCP 3,32 s > 2,5 s) |
| /bewerbung | mobil | 84 | 100 | 100 | 100 | 3,48 | 0,000 | 268 | 1,37 | 545 | über Budget (Perf 84 < 90; LCP 3,48 s > 2,5 s; TBT 268 ms > 200 ms) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 77–82 | 3,19–3,46 | 364–577 | 1,63 | 4,26 | 24 | 0 | 0 | 1.942 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 88–90 | 3,17–3,46 | 190–207 | 1,44 | 4,19 | 26 | 0 | 0 | 1.957 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 3/3 | 83–87 | 3,31–3,77 | 266–320 | 1,37 | 4,23 | 25 | 0 | 0 | 1.974 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |

Rohberichte: `_relaunch/.roh/v6a1-css-b1-inline/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-b1-inline/lighthouse.json`
