# Lighthouse-Messung · V6-A2-JS-A

- Datum: 10.10.2026, 13:19 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3462 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 83 | 100 | 100 | 100 | 3,63 | 0,000 | 290 | 1,73 | 463 | über Budget (Perf 83 < 90; LCP 3,63 s > 2,5 s; TBT 290 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 90 | 100 | 100 | 100 | 3,10 | 0,015 | 213 | 1,60 | 480 | über Budget (LCP 3,10 s > 2,5 s; TBT 213 ms > 200 ms) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 75 | 100 | 100 | 100 | 2,90 | 0,000 | 819 | 1,53 | 481 | über Budget (Perf 75 < 90; LCP 2,90 s > 2,5 s; TBT 819 ms > 200 ms) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 78–86 | 3,04–3,64 | 215–607 | 1,69 | 4,39 | 27 | 0 | 0 | 1.832 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 87–94 | 2,89–3,22 | 113–257 | 1,57 | 4,30 | 29 | 0 | 0 | 1.598 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 3/3 | 68–94 | 2,89–3,88 | 93–830 | 1,53 | 4,38 | 29 | 0 | 0 | 1.760 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |

Rohberichte: `_relaunch/.roh/V6-A2-JS-A/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/V6-A2-JS-A/lighthouse.json`
