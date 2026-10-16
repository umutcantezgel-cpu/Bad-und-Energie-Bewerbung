# Lighthouse-Messung · e031-runde-2

- Datum: 15.10.2026, 17:23 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3500 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 91 | 100 | 100 | 100 | 3,11 | 0,000 | 115 | 1,37 | 493 | über Budget (LCP 3,11 s > 2,5 s) |
| /jobs | mobil | 97 | 100 | 100 | 100 | 2,64 | 0,000 | 57 | 1,21 | 439 | über Budget (LCP 2,64 s > 2,5 s) |
| /arbeiten-bei-uns/waermepumpen | mobil | 93 | 100 | 100 | 100 | 3,11 | 0,000 | 68 | 1,37 | 486 | über Budget (LCP 3,11 s > 2,5 s) |
| /jobs/buerofachkraft-wetzlar | mobil | 96 | 100 | 100 | 100 | 2,65 | 0,000 | 102 | 1,21 | 499 | über Budget (LCP 2,65 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 89–93 | 3,10–3,73 | 63–211 | 1,37 | 4,01 | 29 | 0 | 0 | 2.207 | `div.einstieg-module__tfiXEq__kopf > h1#hero-title > span.einstieg-module__tfiXEq__titelHau` |
| /jobs | mobil | 5/5 | 96–97 | 2,64–2,66 | 53–74 | 1,21 | 3,42 | 27 | 0 | 0 | 2.272 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /arbeiten-bei-uns/waermepumpen | mobil | 5/5 | 90–95 | 2,94–3,60 | 59–122 | 1,37 | 3,83 | 31 | 0 | 0 | 2.124 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/buerofachkraft-wetzlar | mobil | 5/5 | 95–96 | 2,64–2,87 | 47–118 | 1,21 | 3,69 | 31 | 0 | 0 | 2.284 | `div.stelle-module__CTu8JG__kopf > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-` |

Rohberichte: `_relaunch/.roh/e031-runde-2/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/e031-runde-2/lighthouse.json`
