# Lighthouse-Messung · V6-A3-VITALS-b-logo

- Datum: 10.10.2026, 15:59 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3465 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 69 | 100 | 100 | 100 | 2,81 | 0,000 | 1.542 | 2,22 | 444 | über Budget (Perf 69 < 90; LCP 2,81 s > 2,5 s; TBT 1542 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 81 | 100 | 100 | 100 | 2,60 | 0,000 | 577 | 1,51 | 430 | über Budget (Perf 81 < 90; LCP 2,60 s > 2,5 s; TBT 577 ms > 200 ms) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 93 | 100 | 100 | 100 | 2,81 | 0,000 | 104 | 1,23 | 432 | über Budget (LCP 2,81 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 65–78 | 2,54–3,12 | 707–2.503 | 1,41 | 4,73 | 27 | 0 | 0 | 1.095 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 76–88 | 2,38–2,83 | 378–1.021 | 1,26 | 3,79 | 28 | 0 | 0 | 1.292 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 5/5 | 79–95 | 2,50–3,44 | 94–469 | 1,23 | 3,54 | 28 | 0 | 0 | 1.298 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |

Rohberichte: `_relaunch/.roh/V6-A3-VITALS-b-logo/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/V6-A3-VITALS-b-logo/lighthouse.json`
