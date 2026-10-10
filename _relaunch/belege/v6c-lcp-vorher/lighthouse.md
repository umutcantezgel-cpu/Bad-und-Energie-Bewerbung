# Lighthouse-Messung · v6c-lcp-vorher

- Datum: 10.10.2026, 20:28 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3481 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Drosselung Desktop: simulate, 40 ms RTT, 10.240 kbit/s, CPU ×1 · Bildschirm 1350×940 @1
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 91 | 100 | 100 | 100 | 3,21 | 0,000 | 133 | 1,47 | 465 | über Budget (LCP 3,21 s > 2,5 s) |
| / | Desktop | 100 | 100 | 100 | 100 | 0,68 | 0,000 | 0 | 0,49 | 469 | ok |
| /jobs | mobil | 92 | 100 | 100 | 100 | 3,25 | 0,000 | 78 | 1,22 | 419 | über Budget (LCP 3,25 s > 2,5 s) |
| /jobs | Desktop | 100 | 100 | 100 | 100 | 0,70 | 0,000 | 0 | 0,38 | 443 | ok |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 96 | 100 | 100 | 100 | 2,80 | 0,000 | 63 | 1,22 | 481 | über Budget (LCP 2,80 s > 2,5 s) |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 100 | 100 | 100 | 100 | 0,70 | 0,000 | 0 | 0,37 | 476 | ok |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 96 | 100 | 100 | 100 | 2,65 | 0,000 | 65 | 1,21 | 483 | über Budget (LCP 2,65 s > 2,5 s) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | Desktop | 100 | 100 | 100 | 100 | 0,70 | 0,000 | 0 | 0,37 | 478 | ok |
| /bewerbung | mobil | 89 | 100 | 100 | 100 | 3,63 | 0,000 | 146 | 1,21 | 453 | über Budget (Perf 89 < 90; LCP 3,63 s > 2,5 s) |
| /bewerbung | Desktop | 100 | 100 | 100 | 100 | 0,74 | 0,000 | 0 | 0,34 | 443 | ok |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 88–94 | 2,95–3,47 | 64–189 | 1,37 | 3,85 | 28 | 0 | 0 | 2.017 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| / | Desktop | 5/5 | 100 | 0,62–0,81 | 0 | 0,39 | 0,68 | 30 | 0 | 0 | 2.014 | `div.einstieg-module__tfiXEq__kopf > h1#hero-title > span.einstieg-module__tfiXEq__titelHau` |
| /jobs | mobil | 5/5 | 52–96 | 2,80–5,33 | 42–2.106 | 1,22 | 3,40 | 27 | 0 | 0 | 1.944 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs | Desktop | 5/5 | 100 | 0,69–0,73 | 0–5 | 0,34 | 0,72 | 32 | 0 | 0 | 1.986 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 91–97 | 2,65–3,28 | 52–137 | 1,22 | 3,80 | 31 | 0 | 0 | 1.944 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/anlagenmechaniker-shk-wetzlar | Desktop | 5/5 | 100 | 0,65–0,74 | 0–15 | 0,34 | 0,70 | 33 | 0 | 0 | 1.947 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 5/5 | 89–96 | 2,64–3,45 | 51–179 | 1,21 | 3,71 | 31 | 0 | 0 | 1.900 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | Desktop | 5/5 | 100 | 0,69–0,71 | 0 | 0,34 | 0,70 | 33 | 0 | 0 | 1.992 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 5/5 | 88–90 | 3,56–3,64 | 107–155 | 1,21 | 3,88 | 29 | 0 | 0 | 2.006 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |
| /bewerbung | Desktop | 5/5 | 100 | 0,73–0,75 | 0–4 | 0,34 | 0,74 | 29 | 0 | 0 | 2.039 | `div.transition-[opacity,translate] > div.flex > div.flex > h2#_R_2qnpfddb_-step` |

Rohberichte: `_relaunch/.roh/v6c-lcp-vorher/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6c-lcp-vorher/lighthouse.json`
