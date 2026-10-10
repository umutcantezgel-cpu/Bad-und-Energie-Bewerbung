# Lighthouse-Messung · v6a1-css-b4-prose

- Datum: 10.10.2026, 13:14 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3461 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 69 | 100 | 100 | 100 | 2,90 | 0,000 | 2.313 | 2,03 | 459 | über Budget (Perf 69 < 90; LCP 2,90 s > 2,5 s; TBT 2313 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 73 | 100 | 100 | 100 | 2,62 | 0,000 | 1.094 | 1,62 | 475 | über Budget (Perf 73 < 90; LCP 2,62 s > 2,5 s; TBT 1094 ms > 200 ms) |
| /bewerbung | mobil | 72 | 100 | 100 | 100 | 2,66 | 0,000 | 1.241 | 1,51 | 452 | über Budget (Perf 72 < 90; LCP 2,66 s > 2,5 s; TBT 1241 ms > 200 ms) |
| /bewerbung/mappe | mobil | 67 | 100 | 100 | 69 | 3,49 | 0,000 | 750 | 1,88 | 460 | über Budget (Perf 67 < 90; LCP 3,49 s > 2,5 s; TBT 750 ms > 200 ms) |
| /datenschutz | mobil | 82 | 100 | 100 | 69 | 2,72 | 0,000 | 528 | 1,52 | 437 | über Budget (Perf 82 < 90; LCP 2,72 s > 2,5 s; TBT 528 ms > 200 ms) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 65–90 | 2,39–3,06 | 193–2.740 | 1,71 | 5,40 | 27 | 0 | 0 | 1.280 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 68–79 | 2,08–2,74 | 841–2.036 | 1,33 | 4,64 | 29 | 0 | 0 | 1.165 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 3/3 | 62–89 | 2,65–3,96 | 329–1.321 | 1,27 | 4,90 | 27 | 0 | 0 | 1.430 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |
| /bewerbung/mappe | mobil | 3/3 | 64–83 | 2,07–4,20 | 603–1.671 | 1,49 | 4,97 | 32 | 0 | 0 | 1.087 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__einlei` |
| /datenschutz | mobil | 3/3 | 71–96 | 2,15–2,74 | 46–2.049 | 1,25 | 3,66 | 29 | 0 | 0 | 1.529 | `div.recht-module___s8qoq__kopfzone > div.recht-module___s8qoq__vorspann > div.recht-module` |

Rohberichte: `_relaunch/.roh/v6a1-css-b4-prose/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-b4-prose/lighthouse.json`
