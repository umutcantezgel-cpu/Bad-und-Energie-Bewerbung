# Lighthouse-Messung · v6a1-css-end-a1

- Datum: 10.10.2026, 13:48 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3460 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 87 | 100 | 100 | 100 | 3,33 | 0,000 | 213 | 1,68 | 462 | über Budget (Perf 87 < 90; LCP 3,33 s > 2,5 s; TBT 213 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 93 | 100 | 100 | 100 | 3,03 | 0,015 | 79 | 1,53 | 480 | über Budget (LCP 3,03 s > 2,5 s) |
| /bewerbung | mobil | 87 | 100 | 100 | 100 | 3,79 | 0,000 | 115 | 1,52 | 456 | über Budget (Perf 87 < 90; LCP 3,79 s > 2,5 s) |
| /bewerbung/mappe | mobil | 88 | 100 | 100 | 69 | 3,78 | 0,000 | 110 | 1,52 | 456 | über Budget (Perf 88 < 90; LCP 3,78 s > 2,5 s) |
| /datenschutz | mobil | 91 | 100 | 100 | 69 | 3,35 | 0,000 | 65 | 1,37 | 437 | über Budget (LCP 3,35 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 86–89 | 3,16–3,63 | 187–272 | 1,68 | 4,19 | 27 | 0 | 0 | 1.870 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 92–93 | 3,02–3,18 | 66–106 | 1,53 | 4,09 | 29 | 0 | 0 | 1.756 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 3/3 | 87–92 | 3,17–3,80 | 111–121 | 1,52 | 4,00 | 28 | 0 | 0 | 1.877 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |
| /bewerbung/mappe | mobil | 3/3 | 87–88 | 3,76–3,84 | 78–132 | 1,52 | 4,06 | 30 | 0 | 0 | 1.919 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__einlei` |
| /datenschutz | mobil | 3/3 | 91–93 | 3,17–3,36 | 37–101 | 1,37 | 3,59 | 28 | 0 | 0 | 1.919 | `div.recht-module___s8qoq__kopfzone > div.recht-module___s8qoq__vorspann > div.recht-module` |

Rohberichte: `_relaunch/.roh/v6a1-css-end-a1/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-end-a1/lighthouse.json`
