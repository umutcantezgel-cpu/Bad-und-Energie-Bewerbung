# Lighthouse-Messung · v6a1-css-inl-b-desktop

- Datum: 10.10.2026, 15:41 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3461 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung Desktop: simulate, 40 ms RTT, 10.240 kbit/s, CPU ×1 · Bildschirm 1350×940 @1
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | Desktop | 100 | 100 | 100 | 100 | 0,74 | 0,000 | 7 | 0,67 | 532 | ok |
| /jobs | Desktop | 100 | 100 | 100 | 100 | 0,78 | 0,000 | 4 | 0,50 | 517 | ok |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 100 | 100 | 100 | 100 | 0,82 | 0,000 | 26 | 0,56 | 508 | ok |
| /bewerbung | Desktop | 100 | 100 | 100 | 100 | 0,73 | 0,000 | 26 | 0,47 | 516 | ok |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | Desktop | 5/5 | 99–100 | 0,69–0,86 | 0–36 | 0,43 | 0,86 | 26 | 0 | 0 | 1.458 | `div.einstieg-module__tfiXEq__kopf > h1#hero-title > span.einstieg-module__tfiXEq__titelHau` |
| /jobs | Desktop | 5/5 | 100 | 0,74–0,79 | 0–15 | 0,35 | 0,80 | 29 | 0 | 0 | 1.633 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 5/5 | 99–100 | 0,60–0,83 | 6–48 | 0,39 | 0,82 | 27 | 0 | 0 | 1.593 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | Desktop | 5/5 | 99–100 | 0,67–0,86 | 1–46 | 0,36 | 0,88 | 25 | 0 | 0 | 1.561 | `div.transition-[opacity,translate] > div.flex > div.flex > h2#_R_2qnpfddb_-step` |

Rohberichte: `_relaunch/.roh/v6a1-css-inl-b-desktop/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-inl-b-desktop/lighthouse.json`
