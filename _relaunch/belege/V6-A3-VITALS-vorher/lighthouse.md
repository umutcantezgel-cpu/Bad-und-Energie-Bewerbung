# Lighthouse-Messung · V6-A3-VITALS-vorher

- Datum: 10.10.2026, 16:34 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3464 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 84 | 100 | 100 | 100 | 2,89 | 0,000 | 409 | 2,00 | 451 | über Budget (Perf 84 < 90; LCP 2,89 s > 2,5 s; TBT 409 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 91 | 100 | 100 | 100 | 2,90 | 0,015 | 218 | 1,39 | 437 | über Budget (LCP 2,90 s > 2,5 s; TBT 218 ms > 200 ms) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 89 | 100 | 100 | 100 | 2,73 | 0,000 | 303 | 1,49 | 439 | über Budget (Perf 89 < 90; LCP 2,73 s > 2,5 s; TBT 303 ms > 200 ms) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 75–94 | 2,16–3,03 | 111–1.054 | 1,68 | 4,12 | 27 | 0 | 0 | 1.800 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 88–93 | 2,72–3,37 | 82–259 | 1,39 | 3,65 | 28 | 0 | 0 | 1.681 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 5/5 | 79–95 | 2,59–2,93 | 103–733 | 1,38 | 3,74 | 28 | 0 | 0 | 1.461 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |

Rohberichte: `_relaunch/.roh/V6-A3-VITALS-vorher/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/V6-A3-VITALS-vorher/lighthouse.json`
