# Lighthouse-Messung · V6-A3-VITALS-vorher-desktop

- Datum: 10.10.2026, 13:47 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3464 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 3, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung Desktop: simulate, 40 ms RTT, 10.240 kbit/s, CPU ×1 · Bildschirm 1350×940 @1
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | Desktop | 100 | 100 | 100 | 100 | 0,76 | 0,013 | 0 | 0,45 | 476 | ok |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | Desktop | 3/3 | 99–100 | 0,75–0,83 | 0–11 | 0,37 | 0,76 | 31 | 0 | 0 | 1.688 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |

Rohberichte: `_relaunch/.roh/V6-A3-VITALS-vorher-desktop/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/V6-A3-VITALS-vorher-desktop/lighthouse.json`
