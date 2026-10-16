# Lighthouse-Messung · e031-runde-4

- Datum: 16.10.2026, 00:39 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3500 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 93 | 100 | 100 | 100 | 3,09 | 0,000 | 50 | 1,36 | 492 | über Budget (LCP 3,09 s > 2,5 s) |
| /jobs | mobil | 96 | 100 | 100 | 100 | 2,79 | 0,000 | 47 | 1,21 | 438 | über Budget (LCP 2,79 s > 2,5 s) |
| /arbeiten-bei-uns/waermepumpen | mobil | 91 | 100 | 100 | 100 | 3,40 | 0,000 | 52 | 1,36 | 485 | über Budget (LCP 3,40 s > 2,5 s) |
| /jobs/buerofachkraft-wetzlar | mobil | 96 | 100 | 100 | 100 | 2,65 | 0,000 | 72 | 1,22 | 498 | über Budget (LCP 2,65 s > 2,5 s) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 89–94 | 3,09–3,70 | 41–73 | 1,36 | 3,78 | 29 | 0 | 0 | 2.310 | `div.einstieg-module__tfiXEq__kopf > h1#hero-title > span.einstieg-module__tfiXEq__titelHau` |
| /jobs | mobil | 5/5 | 93–97 | 2,64–3,23 | 38–58 | 1,21 | 3,39 | 27 | 0 | 0 | 2.331 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /arbeiten-bei-uns/waermepumpen | mobil | 5/5 | 91–95 | 2,87–3,40 | 47–66 | 1,36 | 3,71 | 31 | 0 | 0 | 2.338 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/buerofachkraft-wetzlar | mobil | 5/5 | 93–97 | 2,64–3,11 | 45–103 | 1,22 | 3,69 | 31 | 0 | 0 | 2.321 | `div.section-module__VYsziW__ton > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-` |

Rohberichte: `_relaunch/.roh/e031-runde-4/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/e031-runde-4/lighthouse.json`
