# Lighthouse-Messung · v6a1-css-end-b1

- Datum: 10.10.2026, 13:50 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3461 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 89 | 100 | 100 | 100 | 3,04 | 0,000 | 224 | 1,69 | 458 | über Budget (Perf 89 < 90; LCP 3,04 s > 2,5 s; TBT 224 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 94 | 100 | 100 | 100 | 2,90 | 0,015 | 70 | 1,38 | 475 | über Budget (LCP 2,90 s > 2,5 s) |
| /bewerbung | mobil | 90 | 100 | 100 | 100 | 3,61 | 0,000 | 80 | 1,37 | 452 | über Budget (LCP 3,61 s > 2,5 s) |
| /bewerbung/mappe | mobil | 92 | 100 | 100 | 69 | 3,03 | 0,000 | 118 | 1,68 | 459 | über Budget (LCP 3,03 s > 2,5 s) |
| /datenschutz | mobil | 96 | 100 | 100 | 69 | 2,73 | 0,000 | 48 | 1,52 | 437 | über Budget (LCP 2,73 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 88–90 | 2,01–3,19 | 193–461 | 1,69 | 4,09 | 27 | 0 | 0 | 2.010 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 93–95 | 2,88–3,18 | 64–117 | 1,38 | 3,86 | 29 | 0 | 0 | 1.952 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 3/3 | 87–95 | 2,89–3,65 | 78–161 | 1,37 | 3,81 | 28 | 0 | 0 | 1.972 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |
| /bewerbung/mappe | mobil | 3/3 | 87–93 | 3,03–3,77 | 105–131 | 1,68 | 3,99 | 32 | 0 | 0 | 1.976 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__einlei` |
| /datenschutz | mobil | 3/3 | 92–96 | 2,72–3,30 | 44–52 | 1,52 | 3,42 | 29 | 0 | 0 | 2.051 | `div.recht-module___s8qoq__kopfzone > div.recht-module___s8qoq__vorspann > div.recht-module` |

Rohberichte: `_relaunch/.roh/v6a1-css-end-b1/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-end-b1/lighthouse.json`
