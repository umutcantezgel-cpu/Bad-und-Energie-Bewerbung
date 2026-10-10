# Lighthouse-Messung · v6-ende

- Datum: 10.10.2026, 20:04 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3471 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Drosselung Desktop: simulate, 40 ms RTT, 10.240 kbit/s, CPU ×1 · Bildschirm 1350×940 @1
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 94 | 100 | 100 | 100 | 2,96 | 0,000 | 67 | 1,48 | 465 | über Budget (LCP 2,96 s > 2,5 s) |
| / | Desktop | 100 | 100 | 100 | 100 | 0,80 | 0,000 | 0 | 0,50 | 469 | ok |
| /jobs | mobil | 93 | 100 | 100 | 100 | 3,24 | 0,000 | 54 | 1,22 | 419 | über Budget (LCP 3,24 s > 2,5 s) |
| /jobs | Desktop | 100 | 100 | 100 | 100 | 0,69 | 0,000 | 0 | 0,36 | 443 | ok |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 96 | 100 | 100 | 100 | 2,65 | 0,000 | 61 | 1,22 | 481 | über Budget (LCP 2,65 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 100 | 100 | 100 | 100 | 0,70 | 0,000 | 0 | 0,35 | 476 | ok |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 96 | 100 | 100 | 100 | 2,66 | 0,000 | 64 | 1,22 | 483 | über Budget (LCP 2,66 s > 2,5 s) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | Desktop | 100 | 100 | 100 | 100 | 0,69 | 0,000 | 1 | 0,34 | 478 | ok |
| /bewerbung | mobil | 88 | 100 | 100 | 100 | 3,62 | 0,000 | 144 | 1,22 | 453 | über Budget (Perf 88 < 90; LCP 3,62 s > 2,5 s) |
| /bewerbung | Desktop | 100 | 100 | 100 | 100 | 0,74 | 0,000 | 0 | 0,34 | 443 | ok |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 94 | 2,95–2,98 | 59–103 | 1,37 | 3,84 | 28 | 0 | 0 | 2.098 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| / | Desktop | 5/5 | 100 | 0,72–0,82 | 0–2 | 0,38 | 0,80 | 30 | 0 | 0 | 2.107 | `div.einstieg-module__tfiXEq__kopf > h1#hero-title > span.einstieg-module__tfiXEq__titelHau` |
| /jobs | mobil | 5/5 | 93–96 | 2,65–3,26 | 43–113 | 1,22 | 3,41 | 27 | 0 | 0 | 2.113 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs | Desktop | 5/5 | 100 | 0,67–0,71 | 0 | 0,34 | 0,70 | 32 | 0 | 0 | 2.162 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 95–96 | 2,64–2,82 | 41–108 | 1,22 | 3,78 | 31 | 0 | 0 | 2.049 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 5/5 | 100 | 0,57–0,73 | 0–2 | 0,35 | 0,70 | 33 | 0 | 0 | 2.001 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 5/5 | 92–96 | 2,65–3,27 | 51–79 | 1,22 | 3,79 | 31 | 0 | 0 | 1.964 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | Desktop | 5/5 | 100 | 0,56–0,71 | 0–3 | 0,34 | 0,69 | 33 | 0 | 0 | 2.103 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 5/5 | 87–93 | 2,94–3,67 | 103–187 | 1,22 | 3,88 | 28 | 0 | 0 | 1.993 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |
| /bewerbung | Desktop | 5/5 | 100 | 0,73–0,76 | 0 | 0,34 | 0,74 | 29 | 0 | 0 | 1.994 | `div.transition-[opacity,translate] > div.flex > div.flex > h2#_R_2qnpfddb_-step` |

Rohberichte: `_relaunch/.roh/v6-ende/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6-ende/lighthouse.json`
