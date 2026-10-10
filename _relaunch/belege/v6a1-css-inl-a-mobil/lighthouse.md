# Lighthouse-Messung · v6a1-css-inl-a-mobil

- Datum: 10.10.2026, 15:34 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3460 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 92 | 100 | 100 | 100 | 3,04 | 0,000 | 142 | 1,69 | 451 | über Budget (LCP 3,04 s > 2,5 s) |
| /jobs | mobil | 92 | 100 | 100 | 100 | 2,75 | 0,001 | 55 | 1,38 | 416 | über Budget (LCP 2,75 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 95 | 100 | 100 | 100 | 2,74 | 0,015 | 100 | 1,38 | 437 | über Budget (LCP 2,74 s > 2,5 s) |
| /bewerbung | mobil | 89 | 100 | 100 | 100 | 3,19 | 0,000 | 245 | 1,39 | 449 | über Budget (Perf 89 < 90; LCP 3,19 s > 2,5 s; TBT 245 ms > 200 ms) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 90–93 | 3,02–3,34 | 110–158 | 1,69 | 3,93 | 27 | 0 | 0 | 1.777 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs | mobil | 5/5 | 82–96 | 2,57–3,48 | 49–532 | 1,38 | 3,41 | 27 | 0 | 0 | 1.697 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 94–96 | 2,73–2,88 | 48–125 | 1,38 | 3,47 | 28 | 0 | 0 | 1.551 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 5/5 | 80–92 | 2,74–3,83 | 112–344 | 1,39 | 4,02 | 28 | 0 | 0 | 1.637 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |

Rohberichte: `_relaunch/.roh/v6a1-css-inl-a-mobil/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-inl-a-mobil/lighthouse.json`
