# Lighthouse-Messung · v6a1-css-prose-lh-vorher-mobil

- Datum: 10.10.2026, 16:19 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3461 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 63 | 100 | 100 | 100 | 3,06 | 0,000 | 3.125 | 2,83 | 455 | über Budget (Perf 63 < 90; LCP 3,06 s > 2,5 s; TBT 3125 ms > 200 ms) |
| /jobs | mobil | 79 | 100 | 100 | 100 | 2,73 | 0,001 | 649 | 1,48 | 420 | über Budget (Perf 79 < 90; LCP 2,73 s > 2,5 s; TBT 649 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 85 | 100 | 100 | 100 | 2,74 | 0,015 | 478 | 1,43 | 441 | über Budget (Perf 85 < 90; LCP 2,74 s > 2,5 s; TBT 478 ms > 200 ms) |
| /bewerbung | mobil | 85 | 100 | 100 | 100 | 2,92 | 0,000 | 317 | 1,39 | 454 | über Budget (Perf 85 < 90; LCP 2,92 s > 2,5 s; TBT 317 ms > 200 ms) |
| /bewerbung/mappe | mobil | 80 | 100 | 100 | 69 | 2,71 | 0,000 | 490 | 1,38 | 448 | über Budget (Perf 80 < 90; LCP 2,71 s > 2,5 s; TBT 490 ms > 200 ms) |
| /datenschutz | mobil | 74 | 100 | 100 | 69 | 3,52 | 0,000 | 849 | 1,65 | 428 | über Budget (Perf 74 < 90; LCP 3,52 s > 2,5 s; TBT 849 ms > 200 ms) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 58–72 | 2,16–3,70 | 1.587–3.899 | 1,44 | 5,73 | 27 | 0 | 0 | 933 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs | mobil | 5/5 | 73–90 | 2,00–2,91 | 291–1.508 | 1,38 | 3,71 | 27 | 0 | 0 | 1.247 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 70–93 | 2,58–3,04 | 189–1.633 | 1,39 | 3,65 | 28 | 0 | 0 | 1.355 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 5/5 | 82–91 | 2,03–3,65 | 234–710 | 1,39 | 4,09 | 28 | 0 | 0 | 1.427 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |
| /bewerbung/mappe | mobil | 5/5 | 79–85 | 2,60–3,76 | 366–688 | 1,38 | 4,10 | 30 | 0 | 0 | 1.353 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__einlei` |
| /datenschutz | mobil | 5/5 | 67–79 | 2,16–4,01 | 574–1.098 | 1,42 | 3,96 | 28 | 0 | 0 | 1.126 | `div.recht-module___s8qoq__kopfzone > div.recht-module___s8qoq__vorspann > div.recht-module` |

Rohberichte: `_relaunch/.roh/v6a1-css-prose-lh-vorher-mobil/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-prose-lh-vorher-mobil/lighthouse.json`
