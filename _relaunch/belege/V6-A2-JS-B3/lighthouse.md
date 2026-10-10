# Lighthouse-Messung · V6-A2-JS-B3

- Datum: 10.10.2026, 13:29 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3463 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 92 | 100 | 100 | 100 | 3,04 | 0,000 | 112 | 1,69 | 455 | über Budget (LCP 3,04 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 93 | 100 | 100 | 100 | 3,17 | 0,015 | 66 | 1,37 | 436 | über Budget (LCP 3,17 s > 2,5 s) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 96 | 100 | 100 | 100 | 2,72 | 0,000 | 76 | 1,37 | 438 | über Budget (LCP 2,72 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 89–93 | 3,03–3,17 | 64–235 | 1,68 | 3,95 | 27 | 0 | 0 | 1.815 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 91–93 | 3,02–3,36 | 55–123 | 1,37 | 3,39 | 28 | 0 | 0 | 1.871 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 3/3 | 95–96 | 2,71–2,72 | 63–104 | 1,37 | 3,46 | 28 | 0 | 0 | 1.941 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |

Rohberichte: `_relaunch/.roh/V6-A2-JS-B3/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/V6-A2-JS-B3/lighthouse.json`
