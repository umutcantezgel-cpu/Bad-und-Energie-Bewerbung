# Lighthouse-Messung · V6-A2-JS-B2

- Datum: 10.10.2026, 13:26 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3463 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 72 | 100 | 100 | 100 | 2,87 | 0,000 | 1.082 | 2,00 | 455 | über Budget (Perf 72 < 90; LCP 2,87 s > 2,5 s; TBT 1082 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 96 | 100 | 100 | 100 | 2,72 | 0,015 | 89 | 1,37 | 436 | über Budget (LCP 2,72 s > 2,5 s) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 94 | 100 | 100 | 100 | 2,88 | 0,000 | 98 | 1,38 | 438 | über Budget (LCP 2,88 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 68–85 | 2,74–3,01 | 408–1.475 | 1,68 | 4,72 | 27 | 0 | 0 | 1.549 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 94–96 | 2,57–2,75 | 46–104 | 1,37 | 3,48 | 28 | 0 | 0 | 1.451 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 3/3 | 93–96 | 2,72–2,89 | 76–163 | 1,38 | 3,44 | 28 | 0 | 0 | 1.605 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |

Rohberichte: `_relaunch/.roh/V6-A2-JS-B2/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/V6-A2-JS-B2/lighthouse.json`
