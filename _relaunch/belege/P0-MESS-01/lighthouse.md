# Lighthouse-Messung · P0-MESS-01

- Datum: 09.10.2026, 09:33 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3500 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 1, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Drosselung Desktop: simulate, 40 ms RTT, 10.240 kbit/s, CPU ×1 · Bildschirm 1350×940 @1
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 94 | 100 | 100 | 100 | 2,80 | 0,000 | 148 | 1,13 | 327 | über Budget (LCP 2,80 s > 2,5 s) |
| / | Desktop | 100 | 100 | 100 | 100 | 0,77 | 0,000 | 35 | 0,42 | 324 | ok |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 1/1 | 94 | 2,80 | 148 | 1,13 | 3,03 | 23 | 0 | 0 | 2.235 | `div.mx-auto > header.flex > h1#hero-title > span.block` |
| / | Desktop | 1/1 | 100 | 0,77 | 35 | 0,32 | 0,82 | 25 | 0 | 0 | 1.912 | `div.mx-auto > header.flex > h1#hero-title > span.block` |

Rohberichte: `_relaunch/.roh/P0-MESS-01/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/P0-MESS-01/lighthouse.json`
