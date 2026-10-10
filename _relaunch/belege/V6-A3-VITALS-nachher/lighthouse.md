# Lighthouse-Messung · V6-A3-VITALS-nachher

- Datum: 10.10.2026, 16:37 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3465 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 88 | 100 | 100 | 100 | 2,97 | 0,000 | 207 | 1,70 | 444 | über Budget (Perf 88 < 90; LCP 2,97 s > 2,5 s; TBT 207 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 94 | 100 | 100 | 100 | 2,80 | 0,000 | 145 | 1,22 | 431 | über Budget (LCP 2,80 s > 2,5 s) |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 87 | 100 | 100 | 100 | 2,50 | 0,000 | 409 | 1,42 | 433 | über Budget (Perf 87 < 90; LCP 2,50 s > 2,5 s; TBT 409 ms > 200 ms) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 71–91 | 2,94–3,47 | 176–1.164 | 1,37 | 3,96 | 27 | 0 | 0 | 1.772 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 65–95 | 2,12–2,87 | 116–9.821 | 1,22 | 3,37 | 28 | 0 | 0 | 1.633 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | mobil | 5/5 | 82–92 | 2,43–3,12 | 270–637 | 1,23 | 3,57 | 28 | 0 | 0 | 1.469 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |

Rohberichte: `_relaunch/.roh/V6-A3-VITALS-nachher/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/V6-A3-VITALS-nachher/lighthouse.json`
