# LCP gepaart: Stand vor E-031 (1417e0b) gegen Prüfrunde 2 (C2-1)

Messung am 15.10.2026 wie in Prüfrunde 1 (`_relaunch/belege/e031-pruefrunde-1/lcp-gepaart.md`): beide Stände als
Produktions-Build nebeneinander (Basis 1417e0b auf Port 3510 im eigenen Worktree, Prüfrunde 2 auf Port 3511),
Lighthouse 13.5.0 mobil (simulierte Drosselung Slow 4G, CPU 4×), nur Kategorie Leistung, je Lauf ein frisches
Chromium, fremde Hosts gesperrt, Reihenfolge Basis/Prüfrunde wechselt mit jedem Paar. Drei Messläufe: Lauf 1 und 2
auf dem Stand mit den CSS-Grenzen (Commit 23ddd90), Lauf 3 auf dem Endstand der Prüfrunde (alle Befunde, ffe88d2).
Werte in ms; „–“ = Lauf ohne Ergebnis.

## Ergebnis (alle Läufe zusammen)

| Seite | Paare | Basis Median | Prüfrunde 2 Median | Median der Paardifferenzen | Prüfrunde 2 gleich oder schneller | schnellster Lauf Basis / Prüfrunde 2 | Dokument übertragen |
|---|---:|---:|---:|---:|---:|---|---|
| Wärmepumpen | 30 | 2.882 | 2.880 | −1,0 | 16 von 30 | 2.790 / 2.799 | 55,1 → 59,2 KB |
| / | 17 | 3.092 | 3.092 | −1,3 | 10 von 17 | 2.722 / 3.085 | 63,3 → 70,0 KB |
| Bürofachkraft | 18 | 2.649 | 2.656 | +1,6 | 9 von 18 | 2.641 / 2.493 | 36,1 → 39,4 KB |
| /jobs | 19 | 2.649 | 2.663 | +4,0 | 8 von 19 | 2.637 / 2.638 | 32,9 → 34,5 KB |

Vorher (Prüfrunde 1, 9 Paare): Wärmepumpen +69, / +9, Bürofachkraft +11, /jobs +2. Die Messung des Prüfers in Runde 2
(`_relaunch/belege/e031-runde-2/lighthouse.md`, 5 Läufe ungepaart) ergab für die Wärmepumpen-Seite 2,88 → 3,11 s im
Median (+230 ms), der schnellste Lauf 2,88 → 2,94 s.

Jetzt liegen alle vier Seiten auf dem Stand vor E-031: Die schnellsten Läufe sind gleich (Wärmepumpen 2.790 gegen
2.799, /jobs 2.637 gegen 2.638), die Mediane der Paardifferenzen liegen zwischen −1,3 und +4 ms, und in rund der Hälfte
der Paare ist der neue Stand gleich schnell oder schneller. Was bleibt, ist die Streuung der Simulation: Jede Seite
springt zwischen einem schnellen und mehreren langsameren Zuständen (Wärmepumpen etwa 2,87, 3,03 und 3,4 s), je
nachdem, welche Anfragen im beobachteten Lauf vor dem LCP fertig waren.

## Ursache und Gegenmaßnahme

Lighthouse rechnet den LCP aus einem beobachteten Lauf nach (Lantern). Um die Ursache der +69 ms zu finden, wurden
aufgezeichnete Läufe der Wärmepumpen-Seite (`gatherMode`) mit veränderten Bytes einzelner Anfragen neu gerechnet
(`auditMode`), je Änderung derselbe Lauf:

| Änderung am aufgezeichneten Lauf (Stand vor den Grenzen) | LCP simuliert |
|---|---:|
| unverändert | 2.942 |
| Dokument −4.162 B (der ganze Zuwachs durch E-031) | 2.942 |
| JavaScript −2.642 B (Layout-Chunk, Zuwachs durch E-031) | 2.942 |
| globales Stylesheet −914 B | 2.942 |
| gemeinsames Stylesheet −350 B | 2.942 |
| gemeinsames Stylesheet −400 B | 2.875 |
| gemeinsames Stylesheet −914 B | 2.875 |

Das bestätigt Prüfrunde 1 und grenzt weiter ein: Es zählt das gemeinsame Stylesheet, das jede Seite render-blockierend
lädt; die Simulation springt, sobald es etwa 400 B kleiner ist. Darin standen Regeln einzelner Seiten, die keine andere
Seite braucht. Sie stehen jetzt in eigenen Chunks (Grenzen im Quelltext, geprüft von `check-css-chunks`):

| Modul | vorher | jetzt | gzip (Grenzanteil im gemeinsamen Chunk) |
|---|---|---|---:|
| `danke.module.css` | gemeinsamer Chunk | nur /bewerbung/danke (leere Grenze davor) | rund 800 B |
| `recht.module.css` | gemeinsamer Chunk | mit dem Satzblatt nur auf /datenschutz und /impressum | rund 670 B |
| `mappe.module.css` | eigener Chunk hinter dem Satzblatt | nur /bewerbung/mappe (leere Grenze davor) | – |
| `prose.css` (Satzblatt) | Rechtsseiten und Mappe | nur Rechtsseiten | – |

Gemeinsames Stylesheet: vor E-031 15.776 B gzip, mit E-031 vor der Prüfrunde 16.186 B, jetzt 15.524 B. Globales
Stylesheet 14.702 B (vor E-031 14.127 B). Die Mappe lädt drei statt vier Stylesheets. Verworfen: dieselbe
leere Grenze vor `seite.module.css` (Bewerbungsseite); Turbopack legte dann das Wärmefeld-CSS in einen eigenen Chunk auf
jeder Seite (vier Stylesheets auf der Startseite, drei auf den Stellenseiten).

## Einzelwerte

- Lauf 1, Wärmepumpen: Basis 3025, 2882, 2876, 2884, 2874, 3444, 2882, 2869, 3428; Prüfrunde 2 2877, 2880, 3047, 2885, 2874, 3433, –, 2871, 2877
- Lauf 1, /: Basis 3253, 3090, 3092, 3087, 3092, –, 3090, 3677, 2722; Prüfrunde 2 3271, 3089, 3088, 3419, 3094, 3086, 3085, 3090, 3096
- Lauf 1, Bürofachkraft: Basis 2718, 2647, 2803, 2645, 2657, 2722, 2648, 3320, –; Prüfrunde 2 3331, 2652, 3311, 2798, 2653, 2660, 2646, 2493, 3339
- Lauf 1, /jobs: Basis 2649, 3100, 3099, 2641, 2640, 2637, 2655, 2639, 2657; Prüfrunde 2 2653, 3289, 2646, 2649, 2797, 2670, 2714, 2803, 2646
- Lauf 2, /jobs: Basis 2643, 2683, 2646, –, 3271, 2793, 2642, 2645, 2648, 2802, 2798; Prüfrunde 2 2638, 2655, 3356, 2789, 2647, 2641, 2644, 3248, 2647, 3272, 2738
- Lauf 2, Wärmepumpen: Basis 2879, 2887, 2873, 3422, 3022, 2870, 3040, 2876, 2881, 3041, 2891; Prüfrunde 2 2885, 2880, 2879, 3048, 2875, 3535, 3033, 2873, 3471, 3403, 3031
- Lauf 3, Wärmepumpen: Basis 2862, 3447, 2872, 3424, 2871, 2869, 2874, 2880, 3426, 2790, 3382; Prüfrunde 2 2799, 3432, 3042, 2876, 2878, 3037, 2874, 2874, 2879, 2873, 2879
- Lauf 3, Bürofachkraft: Basis 2641, 2644, 2648, 2642, 2649, 3327, 2650, 2718, 2648, 2647, –; Prüfrunde 2 2822, 2721, 2720, 3286, 2647, 2651, 2643, 3337, 2644, 2645, 2647
- Lauf 3, /: Basis 3258, 3097, –, 3092, 3089, 3095, 3092, 3093, 3089, 3091, 3247; Prüfrunde 2 3098, 3094, 3092, 3091, –, 3095, 3088, 3095, 3094, 3092, 3090

Werkzeuge: `scratchpad/e031/lh-kopie/paar.mjs` (gepaarte Messung), `sammeln.mjs` und `simulieren.mjs` (Aufzeichnung und
Nachrechnung mit veränderten Bytes); nicht versioniert.
