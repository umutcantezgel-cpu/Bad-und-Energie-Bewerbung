# Lighthouse-Messung · p0-lighthouse

- Datum: 09.10.2026, 10:24 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3500 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Drosselung Desktop: simulate, 40 ms RTT, 10.240 kbit/s, CPU ×1 · Bildschirm 1350×940 @1
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 94 | 100 | 100 | 100 | 2,92 | 0,000 | 108 | 0,92 | 325 | über Budget (LCP 2,92 s > 2,5 s) |
| / | Desktop | 100 | 100 | 100 | 100 | 0,64 | 0,000 | 0 | 0,27 | 323 | ok |
| /jobs | mobil | 96 | 100 | 100 | 100 | 2,63 | 0,000 | 98 | 0,77 | 385 | über Budget (LCP 2,63 s > 2,5 s) |
| /jobs | Desktop | 100 | 100 | 100 | 100 | 0,55 | 0,000 | 0 | 0,23 | 393 | ok |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 94 | 100 | 100 | 100 | 3,08 | 0,000 | 80 | 0,95 | 361 | über Budget (LCP 3,08 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 100 | 100 | 100 | 100 | 0,67 | 0,000 | 0 | 0,27 | 355 | ok |
| /bewerbung | mobil | 94 | 100 | 100 | 100 | 2,94 | 0,000 | 93 | 0,76 | 375 | über Budget (LCP 2,94 s > 2,5 s) |
| /bewerbung | Desktop | 100 | 100 | 100 | 100 | 0,60 | 0,000 | 0 | 0,22 | 365 | ok |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 93–95 | 2,90–2,97 | 90–161 | 0,92 | 3,10 | 22 | 0 | 0 | 2.552 | `div.mx-auto > header.flex > h1#hero-title > span.block` |
| / | Desktop | 5/5 | 100 | 0,60–0,65 | 0 | 0,27 | 0,64 | 24 | 0 | 0 | 2.329 | `div.mx-auto > header.flex > h1#hero-title > span.block` |
| /jobs | mobil | 5/5 | 95–97 | 2,49–2,72 | 40–144 | 0,77 | 2,97 | 32 | 0 | 0 | 2.250 | `main#main > div.mx-auto > header.flex > h1.max-w-4xl` |
| /jobs | Desktop | 5/5 | 100 | 0,50–0,58 | 0 | 0,22 | 0,55 | 35 | 0 | 0 | 2.201 | `main#main > div.mx-auto > header.flex > h1.max-w-4xl` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 93–97 | 2,51–3,11 | 65–123 | 0,91 | 3,43 | 26 | 0 | 0 | 2.385 | `div.lg:grid > div.flex > header.flex > p.max-w-prose` |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 5/5 | 100 | 0,65–0,68 | 0 | 0,26 | 0,67 | 28 | 0 | 0 | 2.328 | `div.lg:grid > div.flex > header.flex > p.max-w-prose` |
| /bewerbung | mobil | 5/5 | 91–95 | 2,90–3,05 | 53–218 | 0,76 | 3,33 | 29 | 0 | 0 | 2.420 | `div.flex > div.transition > div.flex > h2#_R_6lubrbb_-step` |
| /bewerbung | Desktop | 5/5 | 100 | 0,59–0,61 | 0 | 0,22 | 0,60 | 29 | 0 | 0 | 2.387 | `div.flex > div.transition > div.flex > h2#_R_6lubrbb_-step` |

Rohberichte: `_relaunch/.roh/p0-lighthouse/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/p0-lighthouse/lighthouse.json`
