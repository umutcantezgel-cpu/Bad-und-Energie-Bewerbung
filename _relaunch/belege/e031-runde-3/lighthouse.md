# Lighthouse-Messung · e031-runde-3

- Datum: 15.10.2026, 20:47 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3500 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 93 | 100 | 100 | 100 | 3,09 | 0,000 | 70 | 1,37 | 490 | über Budget (LCP 3,09 s > 2,5 s) |
| /jobs | mobil | 96 | 100 | 100 | 100 | 2,64 | 0,000 | 59 | 1,21 | 437 | über Budget (LCP 2,64 s > 2,5 s) |
| /arbeiten-bei-uns/waermepumpen | mobil | 95 | 100 | 100 | 100 | 2,87 | 0,000 | 65 | 1,36 | 506 | über Budget (LCP 2,87 s > 2,5 s) |
| /jobs/buerofachkraft-wetzlar | mobil | 96 | 100 | 100 | 100 | 2,64 | 0,000 | 68 | 1,21 | 497 | über Budget (LCP 2,64 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 91–93 | 3,09–3,26 | 44–135 | 1,37 | 3,85 | 29 | 0 | 0 | 2.225 | `div.einstieg-module__tfiXEq__kopf > h1#hero-title > span.einstieg-module__tfiXEq__titelHau` |
| /jobs | mobil | 5/5 | 96–97 | 2,64–2,79 | 58–87 | 1,21 | 3,42 | 27 | 0 | 0 | 2.266 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /arbeiten-bei-uns/waermepumpen | mobil | 5/5 | 94–95 | 2,87–3,02 | 59–107 | 1,36 | 3,97 | 39 | 0 | 0 | 2.241 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/buerofachkraft-wetzlar | mobil | 5/5 | 95–97 | 2,49–2,80 | 59–139 | 1,21 | 3,72 | 31 | 0 | 0 | 2.252 | `div.section-module__VYsziW__ton > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-` |

Rohberichte: `_relaunch/.roh/e031-runde-3/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/e031-runde-3/lighthouse.json`
