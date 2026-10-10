# Lighthouse-Messung · v6a1-css-prose-lh-nachher-mobil

- Datum: 10.10.2026, 16:27 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3460 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 64 | 100 | 100 | 100 | 2,95 | 0,000 | 4.223 | 2,75 | 451 | über Budget (Perf 64 < 90; LCP 2,95 s > 2,5 s; TBT 4223 ms > 200 ms) |
| /jobs | mobil | 69 | 100 | 100 | 100 | 2,58 | 0,001 | 2.528 | 2,42 | 416 | über Budget (Perf 69 < 90; LCP 2,58 s > 2,5 s; TBT 2528 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 70 | 100 | 100 | 100 | 2,58 | 0,000 | 1.889 | 2,12 | 437 | über Budget (Perf 70 < 90; LCP 2,58 s > 2,5 s; TBT 1889 ms > 200 ms) |
| /bewerbung | mobil | 67 | 100 | 100 | 100 | 3,09 | 0,000 | 1.674 | 1,73 | 449 | über Budget (Perf 67 < 90; LCP 3,09 s > 2,5 s; TBT 1674 ms > 200 ms) |
| /bewerbung/mappe | mobil | 75 | 100 | 100 | 69 | 3,37 | 0,000 | 650 | 1,82 | 452 | über Budget (Perf 75 < 90; LCP 3,37 s > 2,5 s; TBT 650 ms > 200 ms) |
| /datenschutz | mobil | 84 | 100 | 100 | 69 | 2,73 | 0,000 | 287 | 1,65 | 428 | über Budget (Perf 84 < 90; LCP 2,73 s > 2,5 s; TBT 287 ms > 200 ms) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 57–68 | 2,33–3,50 | 3.591–5.993 | 1,73 | 6,91 | 27 | 0 | 0 | 954 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs | mobil | 5/5 | 66–70 | 1,84–3,21 | 1.526–3.125 | 1,41 | 4,70 | 27 | 0 | 0 | 1.435 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 54–80 | 1,87–4,29 | 692–4.152 | 1,40 | 4,74 | 28 | 0 | 0 | 758 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 5/5 | 59–82 | 2,93–4,26 | 509–2.238 | 1,41 | 4,92 | 28 | 0 | 0 | 1.252 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |
| /bewerbung/mappe | mobil | 5/5 | 56–78 | 3,04–4,46 | 535–2.177 | 1,70 | 4,53 | 32 | 0 | 0 | 1.223 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__einlei` |
| /datenschutz | mobil | 5/5 | 70–95 | 2,33–3,50 | 97–1.953 | 1,53 | 3,75 | 29 | 0 | 0 | 1.549 | `div.recht-module___s8qoq__kopfzone > div.recht-module___s8qoq__vorspann > div.recht-module` |

Rohberichte: `_relaunch/.roh/v6a1-css-prose-lh-nachher-mobil/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-prose-lh-nachher-mobil/lighthouse.json`
