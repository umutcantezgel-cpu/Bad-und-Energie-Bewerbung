# Lighthouse-Messung · v6a1-css-inl-a-desktop

- Datum: 10.10.2026, 15:44 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3460 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung Desktop: simulate, 40 ms RTT, 10.240 kbit/s, CPU ×1 · Bildschirm 1350×940 @1
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | Desktop | 100 | 100 | 100 | 100 | 0,74 | 0,000 | 12 | 0,62 | 453 | ok |
| /jobs | Desktop | 100 | 100 | 100 | 100 | 0,67 | 0,000 | 3 | 0,42 | 438 | ok |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 100 | 100 | 100 | 100 | 0,62 | 0,000 | 0 | 0,44 | 432 | ok |
| /bewerbung | Desktop | 100 | 100 | 100 | 100 | 0,74 | 0,000 | 0 | 0,35 | 439 | ok |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | Desktop | 5/5 | 99–100 | 0,72–0,87 | 0–52 | 0,39 | 0,86 | 29 | 0 | 0 | 1.603 | `div.einstieg-module__tfiXEq__kopf > h1#hero-title > span.einstieg-module__tfiXEq__titelHau` |
| /jobs | Desktop | 5/5 | 100 | 0,60–0,70 | 0–11 | 0,35 | 0,74 | 32 | 0 | 0 | 1.808 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 5/5 | 100 | 0,58–0,70 | 0–3 | 0,34 | 0,69 | 30 | 0 | 0 | 1.708 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | Desktop | 5/5 | 100 | 0,66–0,81 | 0–11 | 0,34 | 0,75 | 28 | 0 | 0 | 1.648 | `div.transition-[opacity,translate] > div.flex > div.flex > h2#_R_2qnpfddb_-step` |

Rohberichte: `_relaunch/.roh/v6a1-css-inl-a-desktop/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-inl-a-desktop/lighthouse.json`
