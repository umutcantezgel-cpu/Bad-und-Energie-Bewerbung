# Lighthouse-Messung · r3-perf-01-a

- Datum: 10.10.2026, 01:07 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3460 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 91 | 100 | 100 | 100 | 3,36 | 0,000 | 101 | 0,92 | 392 | über Budget (LCP 3,36 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 90 | 100 | 100 | 100 | 3,52 | 0,000 | 96 | 0,96 | 426 | über Budget (LCP 3,52 s > 2,5 s) |
| /bewerbung | mobil | 93 | 100 | 100 | 100 | 3,19 | 0,000 | 47 | 0,91 | 440 | über Budget (LCP 3,19 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 91–96 | 2,58–3,39 | 58–297 | 0,92 | 3,45 | 24 | 0 | 0 | 2.557 | `div.mx-auto > header.flex > h1#hero-title > span.block` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 87–91 | 3,50–3,58 | 29–194 | 0,91 | 3,68 | 27 | 0 | 0 | 2.540 | `div.lg:grid > div.flex > header.flex > p.max-w-prose` |
| /bewerbung | mobil | 5/5 | 92–97 | 2,56–3,26 | 34–89 | 0,91 | 3,62 | 30 | 0 | 0 | 2.511 | `div.flex > div.transition > div.flex > h2#_R_qnpfddb_-step` |

Rohberichte: `_relaunch/.roh/r3-perf-01-a/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/r3-perf-01-a/lighthouse.json`
