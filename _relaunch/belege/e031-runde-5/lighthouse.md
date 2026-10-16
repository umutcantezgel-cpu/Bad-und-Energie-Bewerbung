# Lighthouse-Messung · e031-runde-5

- Datum: 16.10.2026, 08:18 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3500 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 92 | 100 | 100 | 100 | 3,25 | 0,000 | 81 | 1,36 | 494 | über Budget (LCP 3,25 s > 2,5 s) |
| /jobs | mobil | 93 | 100 | 100 | 100 | 3,25 | 0,000 | 53 | 1,21 | 438 | über Budget (LCP 3,25 s > 2,5 s) |
| /arbeiten-bei-uns/waermepumpen | mobil | 95 | 100 | 100 | 100 | 2,87 | 0,000 | 51 | 1,37 | 487 | über Budget (LCP 2,87 s > 2,5 s) |
| /jobs/buerofachkraft-wetzlar | mobil | 96 | 100 | 100 | 100 | 2,65 | 0,000 | 50 | 1,21 | 499 | über Budget (LCP 2,65 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 89–94 | 3,08–3,72 | 48–114 | 1,36 | 3,81 | 29 | 0 | 0 | 2.323 | `div.einstieg-module__tfiXEq__kopf > h1#hero-title > span.einstieg-module__tfiXEq__titelHau` |
| /jobs | mobil | 5/5 | 93–96 | 2,64–3,26 | 50–67 | 1,21 | 3,41 | 27 | 0 | 0 | 2.438 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /arbeiten-bei-uns/waermepumpen | mobil | 5/5 | 91–95 | 2,87–3,41 | 46–68 | 1,37 | 3,70 | 31 | 0 | 0 | 2.314 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/buerofachkraft-wetzlar | mobil | 5/5 | 96–97 | 2,64–2,79 | 46–60 | 1,21 | 3,76 | 31 | 0 | 0 | 2.496 | `div.section-module__VYsziW__ton > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-` |

Rohberichte: `_relaunch/.roh/e031-runde-5/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/e031-runde-5/lighthouse.json`
