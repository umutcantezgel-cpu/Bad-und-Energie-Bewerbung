# Lighthouse-Messung · r3-perf-01-b

- Datum: 10.10.2026, 01:12 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3461 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 93 | 100 | 100 | 100 | 3,21 | 0,000 | 54 | 0,92 | 367 | über Budget (LCP 3,21 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 92 | 100 | 100 | 100 | 3,35 | 0,000 | 49 | 0,98 | 401 | über Budget (LCP 3,35 s > 2,5 s) |
| /bewerbung | mobil | 92 | 100 | 100 | 100 | 3,21 | 0,000 | 109 | 0,91 | 415 | über Budget (LCP 3,21 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 91–97 | 2,57–3,29 | 43–145 | 0,92 | 3,35 | 24 | 0 | 0 | 3.048 | `div.mx-auto > header.flex > h1#hero-title > span.block` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 89–92 | 2,71–3,38 | 20–334 | 0,91 | 3,51 | 27 | 0 | 0 | 2.666 | `div.lg:grid > div.flex > header.flex > p.max-w-prose` |
| /bewerbung | mobil | 5/5 | 92–96 | 2,57–3,24 | 92–148 | 0,91 | 3,46 | 30 | 0 | 0 | 2.564 | `div.flex > div.transition > div.flex > h2#_R_qnpfddb_-step` |

Rohberichte: `_relaunch/.roh/r3-perf-01-b/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/r3-perf-01-b/lighthouse.json`
