# Lighthouse-Messung · d0-basis

- Datum: 10.10.2026, 12:49 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3410 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Drosselung Desktop: simulate, 40 ms RTT, 10.240 kbit/s, CPU ×1 · Bildschirm 1350×940 @1
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 90 | 100 | 100 | 100 | 3,17 | 0,000 | 173 | 1,69 | 462 | über Budget (LCP 3,17 s > 2,5 s) |
| / | Desktop | 100 | 100 | 100 | 100 | 0,72 | 0,000 | 0 | 0,51 | 462 | ok |
| /jobs | mobil | 92 | 100 | 100 | 100 | 3,31 | 0,001 | 67 | 1,38 | 422 | über Budget (LCP 3,31 s > 2,5 s) |
| /jobs | Desktop | 100 | 100 | 100 | 100 | 0,69 | 0,000 | 0 | 0,37 | 474 | ok |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 93 | 100 | 100 | 100 | 3,03 | 0,015 | 70 | 1,53 | 480 | über Budget (LCP 3,03 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 100 | 100 | 100 | 100 | 0,74 | 0,000 | 0 | 0,40 | 474 | ok |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 92 | 100 | 100 | 100 | 3,17 | 0,000 | 75 | 1,52 | 481 | über Budget (LCP 3,17 s > 2,5 s) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | Desktop | 100 | 100 | 100 | 100 | 0,76 | 0,013 | 0 | 0,38 | 475 | ok |
| /bewerbung | mobil | 88 | 100 | 100 | 100 | 3,77 | 0,000 | 81 | 1,52 | 456 | über Budget (Perf 88 < 90; LCP 3,77 s > 2,5 s) |
| /bewerbung | Desktop | 100 | 100 | 100 | 100 | 0,76 | 0,000 | 0 | 0,35 | 446 | ok |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 74–92 | 2,89–3,17 | 85–787 | 1,69 | 4,11 | 27 | 0 | 0 | 2.017 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| / | Desktop | 5/5 | 100 | 0,66–0,81 | 0 | 0,40 | 0,72 | 29 | 0 | 0 | 2.049 | `div.einstieg-module__tfiXEq__kopf > h1#hero-title > span.einstieg-module__tfiXEq__titelHau` |
| /jobs | mobil | 5/5 | 91–96 | 2,72–3,37 | 41–91 | 1,38 | 3,51 | 27 | 0 | 0 | 1.923 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs | Desktop | 5/5 | 100 | 0,68–0,72 | 0 | 0,34 | 0,69 | 33 | 0 | 0 | 2.004 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 91–94 | 3,02–3,18 | 64–166 | 1,53 | 4,01 | 29 | 0 | 0 | 2.044 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 5/5 | 100 | 0,64–0,76 | 0–1 | 0,35 | 0,76 | 31 | 0 | 0 | 2.019 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 5/5 | 86–92 | 3,17–3,78 | 71–297 | 1,52 | 4,01 | 29 | 0 | 0 | 2.115 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | Desktop | 5/5 | 100 | 0,64–0,78 | 0 | 0,35 | 0,76 | 31 | 0 | 0 | 2.019 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 5/5 | 88–93 | 3,02–3,78 | 74–104 | 1,52 | 3,94 | 28 | 0 | 0 | 2.014 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |
| /bewerbung | Desktop | 5/5 | 99–100 | 0,74–0,79 | 0–69 | 0,35 | 0,76 | 28 | 0 | 0 | 2.031 | `div.transition-[opacity,translate] > div.flex > div.flex > h2#_R_2qnpfddb_-step` |

Rohberichte: `_relaunch/.roh/d0-basis/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/d0-basis/lighthouse.json`
