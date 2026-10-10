# Lighthouse-Messung · r6-lh

- Datum: 10.10.2026, 11:41 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3410 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 92 | 100 | 100 | 100 | 3,18 | 0,000 | 147 | 1,69 | 463 | über Budget (LCP 3,18 s > 2,5 s) |
| /jobs | mobil | 92 | 100 | 100 | 100 | 3,34 | 0,001 | 57 | 1,38 | 422 | über Budget (LCP 3,34 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 93 | 100 | 100 | 100 | 3,04 | 0,015 | 68 | 1,53 | 480 | über Budget (LCP 3,04 s > 2,5 s) |
| /bewerbung | mobil | 92 | 100 | 100 | 100 | 3,18 | 0,000 | 98 | 1,53 | 456 | über Budget (LCP 3,18 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 90–92 | 3,04–3,18 | 91–173 | 1,69 | 4,10 | 27 | 0 | 0 | 1.971 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs | mobil | 3/3 | 92 | 3,33–3,34 | 49–58 | 1,38 | 3,50 | 27 | 0 | 0 | 2.127 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 92–93 | 3,03–3,18 | 66–108 | 1,53 | 3,99 | 29 | 0 | 0 | 2.186 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 3/3 | 92–93 | 3,02–3,18 | 94–101 | 1,53 | 3,96 | 28 | 0 | 0 | 2.022 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |

Rohberichte: `_relaunch/.roh/r6-lh/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/r6-lh/lighthouse.json`
