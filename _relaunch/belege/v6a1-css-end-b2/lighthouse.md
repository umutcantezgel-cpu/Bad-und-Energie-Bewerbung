# Lighthouse-Messung · v6a1-css-end-b2

- Datum: 10.10.2026, 13:52 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3461 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 90 | 100 | 100 | 100 | 3,03 | 0,000 | 212 | 1,69 | 459 | über Budget (LCP 3,03 s > 2,5 s; TBT 212 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 93 | 100 | 100 | 100 | 3,01 | 0,015 | 112 | 1,37 | 475 | über Budget (LCP 3,01 s > 2,5 s) |
| /bewerbung | mobil | 90 | 100 | 100 | 100 | 3,18 | 0,000 | 158 | 1,37 | 452 | über Budget (LCP 3,18 s > 2,5 s) |
| /bewerbung/mappe | mobil | 91 | 100 | 100 | 69 | 3,02 | 0,000 | 186 | 1,67 | 459 | über Budget (LCP 3,02 s > 2,5 s) |
| /datenschutz | mobil | 92 | 100 | 100 | 69 | 3,32 | 0,000 | 62 | 1,53 | 436 | über Budget (LCP 3,32 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 89–92 | 3,03–3,18 | 114–239 | 1,68 | 4,05 | 27 | 0 | 0 | 2.122 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 90–94 | 2,90–3,63 | 61–128 | 1,37 | 3,85 | 29 | 0 | 0 | 1.995 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 3/3 | 90–92 | 3,01–3,61 | 84–184 | 1,37 | 3,81 | 28 | 0 | 0 | 1.907 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |
| /bewerbung/mappe | mobil | 3/3 | 89–91 | 3,02–3,17 | 166–214 | 1,67 | 4,08 | 32 | 0 | 0 | 1.998 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__einlei` |
| /datenschutz | mobil | 3/3 | 92–95 | 2,73–3,34 | 53–98 | 1,53 | 3,48 | 29 | 0 | 0 | 2.035 | `div.recht-module___s8qoq__kopfzone > div.recht-module___s8qoq__vorspann > div.recht-module` |

Rohberichte: `_relaunch/.roh/v6a1-css-end-b2/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-end-b2/lighthouse.json`
