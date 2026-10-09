# Lighthouse-Messung · P0-MESS-01

- Datum: 09.10.2026, 09:27 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3500 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 1, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Drosselung Desktop: simulate, 40 ms RTT, 10.240 kbit/s, CPU ×1 · Bildschirm 1350×940 @1
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 93 | 100 | 100 | 100 | 2,56 | 0,000 | 230 | 0,97 | 327 | über Budget (LCP 2,56 s > 2,5 s; TBT 230 ms > 200 ms) |
| / | Desktop | 100 | 100 | 100 | 100 | 0,69 | 0,000 | 2 | 0,32 | 324 | ok |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 1/1 | 93 | 2,56 | 230 | 0,97 | 3,34 | 23 | 0 | 0 | 1.976 | `div.mx-auto > header.flex > h1#hero-title > span.block` |
| / | Desktop | 1/1 | 100 | 0,69 | 2 | 0,28 | 0,70 | 25 | 0 | 0 | 1.171 | `div.mx-auto > header.flex > h1#hero-title > span.block` |

Rohberichte: `_relaunch/.roh/P0-MESS-01/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/P0-MESS-01/lighthouse.json`
