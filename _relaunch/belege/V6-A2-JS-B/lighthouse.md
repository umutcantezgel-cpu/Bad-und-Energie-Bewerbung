# Lighthouse-Messung · V6-A2-JS-B

- Datum: 10.10.2026, 13:21 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3463 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 81 | 100 | 100 | 100 | 2,88 | 0,000 | 507 | 1,92 | 455 | über Budget (Perf 81 < 90; LCP 2,88 s > 2,5 s; TBT 507 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 89 | 100 | 100 | 100 | 2,74 | 0,015 | 330 | 1,39 | 436 | über Budget (Perf 89 < 90; LCP 2,74 s > 2,5 s; TBT 330 ms > 200 ms) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 91 | 100 | 100 | 100 | 3,16 | 0,000 | 188 | 1,38 | 438 | über Budget (LCP 3,16 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 72–82 | 2,88–3,47 | 496–780 | 1,69 | 4,47 | 27 | 0 | 0 | 1.915 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 75–95 | 2,72–3,60 | 92–596 | 1,39 | 3,52 | 28 | 0 | 0 | 1.624 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 3/3 | 89–92 | 2,73–3,39 | 133–258 | 1,36 | 3,50 | 28 | 0 | 0 | 1.885 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |

Rohberichte: `_relaunch/.roh/V6-A2-JS-B/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/V6-A2-JS-B/lighthouse.json`
