# Lighthouse-Messung · v6a1-css-a

- Datum: 10.10.2026, 12:55 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3460 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 91 | 100 | 100 | 100 | 3,17 | 0,000 | 178 | 1,69 | 463 | über Budget (LCP 3,17 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 93 | 100 | 100 | 100 | 3,03 | 0,015 | 89 | 1,53 | 480 | über Budget (LCP 3,03 s > 2,5 s) |
| /bewerbung | mobil | 92 | 100 | 100 | 100 | 3,02 | 0,000 | 105 | 1,52 | 456 | über Budget (LCP 3,02 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 3/3 | 85–91 | 3,06–3,34 | 97–327 | 1,69 | 4,21 | 27 | 0 | 0 | 1.884 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 3/3 | 93 | 3,03–3,04 | 70–98 | 1,53 | 4,01 | 29 | 0 | 0 | 1.989 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 3/3 | 90–93 | 3,02–3,18 | 103–206 | 1,52 | 3,99 | 28 | 0 | 0 | 1.782 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |

Rohberichte: `_relaunch/.roh/v6a1-css-a/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-a/lighthouse.json`
