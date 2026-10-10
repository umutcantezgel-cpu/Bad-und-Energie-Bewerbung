# Lighthouse-Messung · V6-A3-VITALS-vorher

- Datum: 10.10.2026, 13:46 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3464 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 82 | 100 | 100 | 100 | 3,19 | 0,000 | 429 | 1,75 | 463 | über Budget (Perf 82 < 90; LCP 3,19 s > 2,5 s; TBT 429 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 92 | 100 | 100 | 100 | 3,05 | 0,015 | 128 | 1,55 | 480 | über Budget (LCP 3,05 s > 2,5 s) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 92 | 100 | 100 | 100 | 3,04 | 0,000 | 143 | 1,54 | 481 | über Budget (LCP 3,04 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 74–89 | 3,14–3,51 | 212–649 | 1,69 | 4,10 | 27 | 0 | 0 | 1.912 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 89–93 | 2,88–3,18 | 122–287 | 1,55 | 4,11 | 29 | 0 | 0 | 1.963 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 3/3 | 85–93 | 3,04–3,18 | 76–329 | 1,54 | 4,06 | 29 | 0 | 0 | 1.954 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |

Rohberichte: `_relaunch/.roh/V6-A3-VITALS-vorher/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/V6-A3-VITALS-vorher/lighthouse.json`
