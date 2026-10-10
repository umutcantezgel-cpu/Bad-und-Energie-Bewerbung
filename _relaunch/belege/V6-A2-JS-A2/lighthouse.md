# Lighthouse-Messung · V6-A2-JS-A2

- Datum: 10.10.2026, 13:24 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3462 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 78 | 100 | 100 | 100 | 3,03 | 0,000 | 646 | 1,85 | 463 | über Budget (Perf 78 < 90; LCP 3,03 s > 2,5 s; TBT 646 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 93 | 100 | 100 | 100 | 3,05 | 0,015 | 120 | 1,52 | 480 | über Budget (LCP 3,05 s > 2,5 s) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 80 | 100 | 100 | 100 | 2,95 | 0,000 | 494 | 1,57 | 481 | über Budget (Perf 80 < 90; LCP 2,95 s > 2,5 s; TBT 494 ms > 200 ms) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 77–89 | 2,88–3,18 | 197–682 | 1,69 | 4,36 | 27 | 0 | 0 | 1.659 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 71–93 | 3,02–3,29 | 110–970 | 1,52 | 4,17 | 29 | 0 | 0 | 1.664 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 3/3 | 74–87 | 2,49–3,22 | 431–857 | 1,27 | 4,58 | 29 | 0 | 0 | 1.494 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |

Rohberichte: `_relaunch/.roh/V6-A2-JS-A2/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/V6-A2-JS-A2/lighthouse.json`
