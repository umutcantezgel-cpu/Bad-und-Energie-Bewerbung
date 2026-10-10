# Lighthouse-Messung · v6a1-css-b4-prose2

- Datum: 10.10.2026, 13:37 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3461 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 79 | 100 | 100 | 100 | 3,02 | 0,000 | 475 | 1,70 | 459 | über Budget (Perf 79 < 90; LCP 3,02 s > 2,5 s; TBT 475 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 92 | 100 | 100 | 100 | 2,92 | 0,015 | 132 | 1,38 | 475 | über Budget (LCP 2,92 s > 2,5 s) |
| /bewerbung | mobil | 90 | 100 | 100 | 100 | 3,03 | 0,000 | 201 | 1,38 | 452 | über Budget (LCP 3,03 s > 2,5 s; TBT 201 ms > 200 ms) |
| /bewerbung/mappe | mobil | 92 | 100 | 100 | 69 | 3,02 | 0,000 | 158 | 1,67 | 460 | über Budget (LCP 3,02 s > 2,5 s) |
| /datenschutz | mobil | 92 | 100 | 100 | 69 | 3,25 | 0,000 | 122 | 1,53 | 437 | über Budget (LCP 3,25 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 72–93 | 2,90–3,46 | 123–1.060 | 1,67 | 4,35 | 27 | 0 | 0 | 1.710 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 92–94 | 2,90–3,18 | 85–172 | 1,38 | 3,98 | 29 | 0 | 0 | 1.683 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 3/3 | 90–93 | 2,89–3,18 | 150–232 | 1,38 | 3,96 | 28 | 0 | 0 | 1.589 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |
| /bewerbung/mappe | mobil | 3/3 | 89–92 | 3,02–3,18 | 112–240 | 1,67 | 4,02 | 32 | 0 | 0 | 1.690 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__einlei` |
| /datenschutz | mobil | 3/3 | 91–93 | 2,88–3,38 | 69–154 | 1,53 | 3,47 | 29 | 0 | 0 | 1.711 | `div.recht-module___s8qoq__kopfzone > div.recht-module___s8qoq__vorspann > div.recht-module` |

Rohberichte: `_relaunch/.roh/v6a1-css-b4-prose2/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-b4-prose2/lighthouse.json`
