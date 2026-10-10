# Lighthouse-Messung · v6a1-css-inl-b-mobil

- Datum: 10.10.2026, 15:38 (Europe/Berlin)
- Chromium: Chromium 141.0.7390.37 · Lighthouse 13.5.0 · Node v22.22.0
- Basis: http://localhost:3461 (Produktions-Build) · Läufe je Seite und Formfaktor: N = 5, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ja
- Drosselung mobil: simulate, 150 ms RTT, 1.638 kbit/s, CPU ×4 · Bildschirm 412×823 @1.75
- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)
- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil

| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 80 | 100 | 100 | 100 | 3,31 | 0,000 | 461 | 2,00 | 528 | über Budget (Perf 80 < 90; LCP 3,31 s > 2,5 s; TBT 461 ms > 200 ms) |
| /jobs | mobil | 89 | 100 | 100 | 100 | 3,14 | 0,001 | 230 | 1,46 | 495 | über Budget (Perf 89 < 90; LCP 3,14 s > 2,5 s; TBT 230 ms > 200 ms) |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 91 | 100 | 100 | 100 | 3,02 | 0,015 | 195 | 1,43 | 514 | über Budget (LCP 3,02 s > 2,5 s) |
| /bewerbung | mobil | 82 | 100 | 100 | 100 | 3,29 | 0,000 | 456 | 1,44 | 526 | über Budget (Perf 82 < 90; LCP 3,29 s > 2,5 s; TBT 456 ms > 200 ms) |

## Weitere Kennzahlen und Streuung

| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |
|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| / | mobil | 5/5 | 74–81 | 3,11–3,88 | 437–773 | 1,64 | 4,37 | 24 | 0 | 0 | 1.646 | `div.einstieg-module__tfiXEq__einstieg > div.einstieg-module__tfiXEq__rest > div.einstieg-m` |
| /jobs | mobil | 5/5 | 86–91 | 2,87–3,35 | 185–288 | 1,46 | 3,54 | 24 | 0 | 0 | 1.986 | `main#main > header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelb` |
| /jobs/anlagenmechaniker-shk-wetzlar | mobil | 5/5 | 88–93 | 3,00–3,16 | 120–269 | 1,43 | 3,71 | 25 | 0 | 0 | 1.633 | `header.seitenkopf-module__g14wBq__kopf > div.seitenkopf-module__g14wBq__titelblock > h1#se` |
| /bewerbung | mobil | 5/5 | 64–85 | 3,16–3,34 | 302–2.194 | 1,37 | 4,30 | 25 | 0 | 0 | 1.647 | `div.transition-[opacity,translate] > div.flex > div.flex > p.max-w-prose` |

Rohberichte: `_relaunch/.roh/v6a1-css-inl-b-mobil/lh/<slug>-<formfaktor>-<n>.json` · Zusammenfassung: `_relaunch/belege/v6a1-css-inl-b-mobil/lighthouse.json`
