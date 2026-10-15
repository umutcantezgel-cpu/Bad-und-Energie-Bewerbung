# LCP gepaart: Stand vor E-031 (1417e0b) gegen Prüfrunde 1 (C1-6)

Messung am 15.10.2026, eine Sitzung, beide Stände als Produktions-Build (`next build`, `next start`) nebeneinander:
Basis 1417e0b auf Port 3510 (eigener Worktree), Prüfrunde 1 auf Port 3511. Lighthouse mobil (Standard: Moto-G-Power,
simulierte Drosselung Slow 4G, CPU 4×), nur Kategorie Leistung, je Lauf ein frisches Chromium, fremde Hosts gesperrt.
Je Seite 9 Paare, die Reihenfolge Basis/Prüfrunde wechselt mit jedem Paar. Werte in ms; „–“ = Lauf ohne Ergebnis.

| Seite | Basis Median | Prüfrunde Median | Median der Paardifferenzen | Spanne Basis | Spanne Prüfrunde | Dokument übertragen |
|---|---:|---:|---:|---|---|---|
| /arbeiten-bei-uns/waermepumpen | 2.876 | 2.944 | +69 (8 Paare) | 2.868–3.426 | 2.934–3.553 | 56,5 → 60,5 KB |
| /jobs | 2.647 | 2.650 | +2 | 2.491–3.267 | 2.637–3.270 | 33,7 → 35,3 KB |
| / | 3.092 | 3.105 | +9 | 3.087–3.404 | 3.093–3.500 | 64,8 → 72,7 KB |
| /jobs/buerofachkraft-wetzlar | 2.647 | 2.716 | +11 (8 Paare) | 2.638–3.347 | 2.644–3.399 | 36,9 → 40,3 KB |

Einzelwerte (Paar 1 bis 9):

- Wärmepumpen Basis: –, 2868, 2876, 2874, 3426, 3029, 2872, 2872, 2876; Prüfrunde: 3112, 3115, 2944, 2942, 3553, 2934, 2941, 3111, 2938
- /jobs Basis: 2689, 2645, 3267, 3267, 2647, 2491, 2643, 2647, 2648; Prüfrunde: 2641, 2650, 2637, 2650, 2798, 2648, 2642, 3270, 2650
- / Basis: 3095, 3092, 3089, 3092, 3404, 3093, 3090, 3089, 3087; Prüfrunde: 3098, 3118, 3243, 3096, 3105, 3103, 3500, 3093, 3106
- Bürofachkraft Basis: 2879, 2644, 2642, 2638, 2647, 3347, 2646, 3317, 2650; Prüfrunde: 2663, 3395, –, 2648, 2796, 2644, 2650, 2716, 3399

Streuung: Jede Seite hat einen schnellen und einen langsamen Zustand der Simulation (z. B. Wärmepumpen 2,87 s bzw.
3,4 s). /jobs liegt gleich auf (Median der Paardifferenzen +2 ms, 4 von 9 Paaren gleich oder besser).

## Was den Rest auf der Wärmepumpen-Seite macht

Das LCP-Element ist die Überschrift (h1, Schrift Bricolage). Die Vergleichsabbildung, die der Befund als Ursache nannte,
liegt nicht mehr im Dokument: Bänder und Zeichnung kommen als Dateien (`lib/zeichnung/waerme/dateien.ts`,
`lib/zeichnung/raumschnitt-svg.ts`). Das Dokument ist von 65,2 KB (Runde 1) auf 60,5 KB gesunken.

Um den Rest von rund 70 ms zuzuordnen, wurde die Basis über einen Zwischenspeicher-Proxy (alle Antworten vorab geholt
und gleich komprimiert) mit zusätzlichen, zufälligen Bytes ausgeliefert, je 5 Läufe, kleinster Wert:

| Variante | LCP (schnellster Zustand) |
|---|---:|
| Basis unverändert | 2.851 |
| Dokument +6,9 KB gzip | 2.856 |
| Layout-JavaScript +2,8 KB | 2.852 |
| render-blockierendes CSS +2,4 KB gzip | 2.931 |

Dokument und JavaScript verschieben den LCP nicht; render-blockierendes CSS verschiebt ihn. Das globale und das
gemeinsame Stylesheet sind mit E-031 um 1,65 KB gzip gewachsen (Wärmerampe und Wärmebereich, Cursor, Tonwechsel der
Abschnitte, Wärmefront ≤ 1.200 B, Wärmefeld ≤ 1.400 B, Rohrakzente). Das ist der Rest auf der Wärmepumpen-Seite und
die +9/+11 ms auf / und der Bürostelle.

Werkzeuge: `scratchpad/e031/lh-kopie/paar.mjs` (gepaarte Messung), `cproxy.mjs` (Proxy für die Varianten); nicht
versioniert.
