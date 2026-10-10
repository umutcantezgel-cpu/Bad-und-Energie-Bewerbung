# Lighthouse-Messung · v6a1-css-a2

- Datum: 10.10.2026, 13:34 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3460 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 92 | 100 | 100 | 100 | 3,17 | 0,000 | 112 | 1,68 | 463 | über Budget (LCP 3,17 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 93 | 100 | 100 | 100 | 3,04 | 0,015 | 94 | 1,54 | 480 | über Budget (LCP 3,04 s > 2,5 s) |
| /bewerbung | mobil | 88 | 100 | 100 | 100 | 3,76 | 0,000 | 85 | 1,52 | 456 | über Budget (Perf 88 < 90; LCP 3,76 s > 2,5 s) |
| /bewerbung/mappe | mobil | 88 | 100 | 100 | 69 | 3,75 | 0,000 | 112 | 1,53 | 456 | über Budget (Perf 88 < 90; LCP 3,75 s > 2,5 s) |
| /datenschutz | mobil | 92 | 100 | 100 | 69 | 3,30 | 0,000 | 40 | 1,37 | 437 | über Budget (LCP 3,30 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 91–92 | 3,17–3,18 | 91–153 | 1,68 | 4,08 | 27 | 0 | 0 | 2.037 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 92–93 | 3,03–3,07 | 68–130 | 1,54 | 4,10 | 29 | 0 | 0 | 2.054 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 3/3 | 88–92 | 3,17–3,79 | 74–94 | 1,52 | 3,96 | 28 | 0 | 0 | 2.068 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |
| /bewerbung/mappe | mobil | 3/3 | 87–92 | 3,03–3,81 | 83–163 | 1,53 | 4,05 | 30 | 0 | 0 | 1.980 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__einlei` |
| /datenschutz | mobil | 3/3 | 92–95 | 2,88–3,31 | 39–46 | 1,37 | 3,47 | 28 | 0 | 0 | 2.002 | `div.recht-module___s8qoq__kopfzone > div.recht-module___s8qoq__vorspann > div.recht-module` |

Rohberichte: `_relaunch/.roh/v6a1-css-a2/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-a2/lighthouse.json`
