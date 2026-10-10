# Lighthouse-Messung · V6-A3-VITALS-a-schrift

- Datum: 10.10.2026, 15:41 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3465 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 83 | 100 | 100 | 100 | 3,03 | 0,000 | 431 | 1,86 | 451 | über Budget (Perf 83 < 90; LCP 3,03 s > 2,5 s; TBT 431 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 92 | 100 | 100 | 100 | 2,87 | 0,000 | 97 | 1,23 | 437 | über Budget (LCP 2,87 s > 2,5 s) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 91 | 100 | 100 | 100 | 2,74 | 0,000 | 142 | 1,36 | 439 | über Budget (LCP 2,74 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 71–90 | 2,85–3,49 | 265–838 | 1,38 | 4,10 | 27 | 0 | 0 | 1.612 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 89–96 | 2,57–3,38 | 61–284 | 1,23 | 3,56 | 28 | 0 | 0 | 1.661 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 5/5 | 85–96 | 2,56–3,42 | 79–319 | 1,22 | 3,70 | 28 | 0 | 0 | 1.808 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |

Rohberichte: `_relaunch/.roh/V6-A3-VITALS-a-schrift/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/V6-A3-VITALS-a-schrift/lighthouse.json`
