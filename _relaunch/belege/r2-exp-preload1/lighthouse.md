# Lighthouse-Messung · r2-exp-preload1

- Datum: 09.10.2026, 23:58 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3450 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 95 | 100 | 100 | 100 | 2,87 | 0,000 | 47 | 1,22 | 392 | über Budget (LCP 2,87 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 93 | 100 | 100 | 100 | 3,25 | 0,012 | 46 | 1,22 | 426 | über Budget (LCP 3,25 s > 2,5 s) |
| /bewerbung | mobil | 93 | 100 | 100 | 100 | 3,22 | 0,001 | 68 | 1,22 | 440 | über Budget (LCP 3,22 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 92–96 | 2,72–3,34 | 37–61 | 1,22 | 3,52 | 24 | 0 | 0 | 2.736 | `div.mx-auto > header.flex > h1#hero-title > span.block` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 92–94 | 3,02–3,36 | 41–56 | 1,22 | 3,69 | 27 | 0 | 0 | 2.582 | `div.lg:grid > div.flex > header.flex > p.max-w-prose` |
| /bewerbung | mobil | 5/5 | 92–95 | 2,86–3,28 | 49–81 | 1,22 | 3,76 | 30 | 0 | 0 | 2.412 | `div.flex > div.transition > div.flex > h2#_R_qnpfddb_-step` |

Rohberichte: `_relaunch/.roh/r2-exp-preload1/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/r2-exp-preload1/lighthouse.json`
