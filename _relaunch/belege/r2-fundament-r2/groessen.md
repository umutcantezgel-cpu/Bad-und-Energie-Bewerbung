# Größen je Seite · r2-fundament-r2

- Datum: 09.10.2026, 23:59 (Europe/Berlin) · Basis: http://localhost:3450 (Produktions-Build)
- Ansicht d1440 (1440×900), hell, Bewegung no-preference; je Seite neuer Kontext (kalter Zwischenspeicher); Laden bis networkidle, danach schrittweises Durchscrollen
- übertragen = Body-Bytes über die Leitung (ohne Kopfzeilen) · roh = entpackt · gzip = `zlib.gzipSync` Stufe 9 auf dem Body · 1 KB = 1024 Byte
- Next-Prefetch (`?_rsc=`, Seitenwechsel-Vorabrufe der Links) wird als eigener Typ geführt und gehört zur Summe (Spalte „ohne Prefetch“ lässt ihn weg, er schwankt von Lauf zu Lauf); „nach Scrollen“ = erst nach dem Durchscrollen geladen
- Nur Antworten des eigenen Hosts; Tracking-Attrappen und gesperrte Fremdanfragen zählen nicht zum Gewicht (Anzahl je Seite in der JSON: `gesperrteAnfragen`)
- Budgets (K-013): Schriften gesamt ≤ 250 KB · Icon-SVG ≤ 1,5 KB (auf die rohe Größe gerechnet) · Illustrations-SVG ≤ 40 KB gzip · Bewegungs-JS ≤ 60 KB gzip (nicht abgrenzbar, siehe unten)

## Global

### Schriften (eindeutige Dateien) · Summe 145,9 KB übertragen · Budget ≤ 250 KB · ok

| Datei | Typ | übertragen KB | roh KB | gzip KB | Seiten |
|---|---|---:|---:|---:|---:|
| `…/media/bricolage_grotesque_latin_opsz_normal-s.p.2ej1fmte5yjhi.woff2` | font/woff2 | 75,1 | 75,1 | 75,1 | 12 |
| `…/media/martian_mono_latin_wdth_normal.0l5dt97quxm6j.woff2` | font/woff2 | 37,6 | 37,6 | 37,6 | 1 |
| `a/atkinson_hyperlegible_next_latin_wght_normal-s.p.1o9o6__l__p-w.woff2` | font/woff2 | 33,2 | 33,2 | 33,2 | 12 |

### Größte JavaScript-Dateien (Top 10 von 19, nach gzip)

| Datei | übertragen KB | roh KB | gzip KB | Kodierung | Seiten |
|---|---:|---:|---:|---|---:|
| `…/chunks/0a37caasaw7-7.js` | 71,6 | 228,7 | 71,4 | gzip | 12 |
| `…/chunks/2gntgrcwrye4_.js` | 44,2 | 162,7 | 44,1 | gzip | 12 |
| `…/chunks/11wu3hljr9hj4.js` | 20,3 | 57,1 | 20,3 | gzip | 10 |
| `…/chunks/2ii7mwog_k9qo.js` | 13,3 | 37,0 | 13,3 | gzip | 1 |
| `…/chunks/25i8q8ks78nna.js` | 11,9 | 36,1 | 11,9 | gzip | 2 |
| `…/chunks/3dyab3pigmf1m.js` | 11,3 | 31,4 | 11,2 | gzip | 12 |
| `…/chunks/3snddn835qz2b.js` | 10,9 | 30,7 | 10,8 | gzip | 10 |
| `…/chunks/1--_3ulp8dgus.js` | 10,6 | 30,6 | 10,6 | gzip | 2 |
| `…/chunks/118nq7mu3xtd_.js` | 9,1 | 25,4 | 9,1 | gzip | 12 |
| `…/chunks/3sayrze_4co_y.js` | 8,8 | 28,4 | 8,8 | gzip | 12 |

JavaScript gesamt (eindeutig, alle Seiten): 19 Dateien · 238,8 KB übertragen · 237,5 KB gzip. Budget „Bewegungs-JS ≤ 60 KB gzip“: nicht prüfbar, die Dateien tragen keine Kennzeichnung, welcher Anteil Bewegung ist.

### CSS (eindeutige Dateien) · 2 Dateien · 14,5 KB übertragen · 14,4 KB gzip

| Datei | übertragen KB | roh KB | gzip KB | Seiten |
|---|---:|---:|---:|---:|
| `…/chunks/20cywqol1k2i0.css` | 13,7 | 74,1 | 13,7 | 12 |
| `…/chunks/376rzseq80lhj.css` | 0,7 | 1,8 | 0,7 | 2 |

### SVG-Antworten (als Datei geladen) · 0

Keine SVG-Dateien über das Netz geladen.

### Inline-`<svg>` im DOM · 215 Elemente auf allen Seiten, 35 eindeutige Auszeichnungen, davon 1 über 1,5 KB

Größe = UTF-8-Byte der serialisierten Auszeichnung im DOM nach dem Laden (kann vom Quelltext des Servers geringfügig abweichen).

| Kennung | Ort | gezeigt px | Bytes | gzip Bytes | Vorkommen | Seiten | Budget |
|---|---|---|---:|---:|---:|---:|---|
| `size-full select-none` | `div > div > svg` | 448×448 | 2.459 | 749 | 1 | 1 | über Icon-Budget (nur als Illustration zulässig) |
| `5,0 von 5 Sternen` | `div > span > svg` | 88×16 | 897 | 423 | 10 | 1 | Icon ok |
| `lucide lucide-truck size-6` | `ul > li > svg` | 24×24 | 534 | 318 | 1 | 1 | Icon ok |
| `lucide lucide-file-text mt-[calc((1lh_-_` | `a > span > svg` | 20×20 | 523 | 315 | 1 | 1 | Icon ok |
| `lucide lucide-calendar-off size-6` | `ul > li > svg` | 24×24 | 499 | 292 | 1 | 1 | Icon ok |
| `lucide lucide-shield-check mt-0.5` | `div > p > svg` | 20×20 | 493 | 330 | 2 | 2 | Icon ok |
| `lucide lucide-phone size-4` | `div > a > svg` | 16×16 | 490 | 307 | 9 | 9 | Icon ok |
| `lucide lucide-phone size-5` | `li > a > svg` | 20×20 | 490 | 307 | 6 | 6 | Icon ok |
| `lucide lucide-camera size-5` | `button > span > svg` | 20×20 | 480 | 312 | 1 | 1 | Icon ok |
| `lucide lucide-graduation-cap size-6` | `ul > li > svg` | 24×24 | 478 | 309 | 1 | 1 | Icon ok |
| `lucide lucide-phone size-5` | `a > span > svg` | 20×20 | 475 | 296 | 6 | 6 | Icon ok |
| `lucide lucide-wrench size-6` | `ul > li > svg` | 24×24 | 471 | 314 | 1 | 1 | Icon ok |
| `lucide lucide-file-check size-6` | `ul > li > svg` | 24×24 | 464 | 293 | 1 | 1 | Icon ok |
| `lucide lucide-printer size-5` | `button > span > svg` | 20×20 | 450 | 280 | 1 | 1 | Icon ok |
| `lucide lucide-users size-6` | `ul > li > svg` | 24×24 | 444 | 282 | 1 | 1 | Icon ok |
| … 20 weitere eindeutige (vollständig in der JSON) | | | | | | | |

## Je Seite

Übersicht (übertragen KB, Dateien in Klammern):

| Seite | Status | Dokument | JS | CSS | Schriften | SVG-Dateien | Bilder | Prefetch (_rsc) | Sonstiges | Summe KB | ohne Prefetch KB | JS gzip KB | davon nach Scrollen KB | inline-SVG | Schriften-Budget |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| / | 200 | 28,9 (1) | 203,0 (16) | 13,7 (1) | 108,3 (2) | 0,0 (0) | 4,8 (1) | 72,2 (17) | 0,0 (0) | 430,8 | 358,6 | 201,8 | 83,8 | 42 | ok |
| /jobs | 200 | 12,3 (1) | 203,0 (16) | 13,7 (1) | 108,3 (2) | 0,0 (0) | 4,8 (1) | 72,2 (17) | 0,0 (0) | 414,3 | 342,1 | 201,8 | 15,1 | 11 | ok |
| /jobs/anlagenmechaniker-shk-wetzlar | 200 | 22,9 (1) | 203,0 (16) | 13,7 (1) | 108,3 (2) | 0,0 (0) | 4,8 (1) | 72,8 (18) | 0,0 (0) | 425,4 | 352,7 | 201,8 | 52,1 | 31 | ok |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | 200 | 22,9 (1) | 203,0 (16) | 13,7 (1) | 108,3 (2) | 0,0 (0) | 4,8 (1) | 72,8 (18) | 0,0 (0) | 425,4 | 352,7 | 201,8 | 52,1 | 31 | ok |
| /jobs/obermonteur-projektleiter-shk-wetzlar | 200 | 22,8 (1) | 203,0 (16) | 13,7 (1) | 108,3 (2) | 0,0 (0) | 4,8 (1) | 74,2 (18) | 0,0 (0) | 426,8 | 352,6 | 201,8 | 52,1 | 32 | ok |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | 200 | 21,5 (1) | 203,0 (16) | 13,7 (1) | 108,3 (2) | 0,0 (0) | 4,8 (1) | 72,8 (18) | 0,0 (0) | 424,1 | 351,3 | 201,8 | 52,1 | 27 | ok |
| /bewerbung | 200 | 12,3 (1) | 224,5 (17) | 14,5 (2) | 108,3 (2) | 0,0 (0) | 4,8 (1) | 34,3 (9) | 0,0 (0) | 398,7 | 364,4 | 223,7 | 15,1 | 12 | ok |
| /bewerbung/danke | 200 | 9,1 (1) | 184,2 (14) | 13,7 (1) | 108,3 (2) | 0,0 (0) | 4,8 (1) | 35,6 (11) | 0,0 (0) | 355,8 | 320,1 | 183,4 | 0,0 | 3 | ok |
| /bewerbung/mappe | 200 | 13,2 (1) | 193,4 (15) | 14,5 (2) | 108,3 (2) | 0,0 (0) | 4,8 (1) | 30,8 (7) | 0,0 (0) | 365,0 | 334,2 | 192,6 | 15,1 | 15 | ok |
| /datenschutz | 200 | 26,4 (1) | 203,0 (16) | 13,7 (1) | 108,3 (2) | 0,0 (0) | 4,8 (1) | 72,9 (19) | 0,0 (0) | 429,1 | 356,2 | 201,8 | 84,6 | 4 | ok |
| /impressum | 200 | 12,0 (1) | 203,0 (16) | 13,7 (1) | 108,3 (2) | 0,0 (0) | 4,8 (1) | 72,9 (19) | 0,0 (0) | 414,7 | 341,7 | 201,8 | 84,6 | 4 | ok |
| /gibt-es-nicht-404 | 404 | 8,3 (1) | 203,0 (16) | 13,7 (1) | 254,2 (5) | 0,0 (0) | 4,8 (1) | 72,6 (18) | 0,0 (0) | 556,5 | 483,9 | 201,8 | 0,0 | 3 | über Budget |

### / (start)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 28,9 | 160,2 | 28,6 | – |
| JavaScript | 16 | 203,0 | 642,0 | 201,8 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 13,7 | 74,1 | 13,7 | – |
| Schriften | 2 | 108,3 | 108,3 | 108,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 17 | 72,2 | 353,6 | 71,8 | – |
| **Summe** | 38 | 430,8 | 1.343,0 | 429,0 | |

Inline-`<svg>` im DOM: 42 (zusammen 23.399 Byte, 13.134 Byte gzip einzeln gerechnet; 1 über 1,5 KB).

### /jobs (stellen)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 12,3 | 68,9 | 12,2 | – |
| JavaScript | 16 | 203,0 | 642,0 | 201,8 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 13,7 | 74,1 | 13,7 | – |
| Schriften | 2 | 108,3 | 108,3 | 108,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 17 | 72,2 | 353,6 | 71,8 | – |
| **Summe** | 38 | 414,3 | 1.251,6 | 412,6 | |

Inline-`<svg>` im DOM: 11 (zusammen 3.948 Byte, 2.724 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /jobs/anlagenmechaniker-shk-wetzlar (stelle-anlagenmechaniker)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 22,9 | 134,9 | 22,7 | – |
| JavaScript | 16 | 203,0 | 642,0 | 201,8 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 13,7 | 74,1 | 13,7 | – |
| Schriften | 2 | 108,3 | 108,3 | 108,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 18 | 72,8 | 354,6 | 72,4 | – |
| **Summe** | 39 | 425,4 | 1.318,7 | 423,6 | |

Inline-`<svg>` im DOM: 31 (zusammen 10.714 Byte, 7.623 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /jobs/kundendiensttechniker-waermepumpe-wetzlar (stelle-kundendienst)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 22,9 | 135,4 | 22,7 | – |
| JavaScript | 16 | 203,0 | 642,0 | 201,8 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 13,7 | 74,1 | 13,7 | – |
| Schriften | 2 | 108,3 | 108,3 | 108,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 18 | 72,8 | 354,5 | 72,4 | – |
| **Summe** | 39 | 425,4 | 1.319,1 | 423,6 | |

Inline-`<svg>` im DOM: 31 (zusammen 10.714 Byte, 7.623 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /jobs/obermonteur-projektleiter-shk-wetzlar (stelle-obermonteur)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 22,8 | 136,0 | 22,6 | – |
| JavaScript | 16 | 203,0 | 642,0 | 201,8 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 13,7 | 74,1 | 13,7 | – |
| Schriften | 2 | 108,3 | 108,3 | 108,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 18 | 74,2 | 358,9 | 73,6 | – |
| **Summe** | 39 | 426,8 | 1.324,0 | 424,8 | |

Inline-`<svg>` im DOM: 32 (zusammen 11.011 Byte, 7.846 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /jobs/ausbildung-anlagenmechaniker-shk-wetzlar (stelle-ausbildung)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 21,5 | 127,8 | 21,3 | – |
| JavaScript | 16 | 203,0 | 642,0 | 201,8 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 13,7 | 74,1 | 13,7 | – |
| Schriften | 2 | 108,3 | 108,3 | 108,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 18 | 72,8 | 354,5 | 72,4 | – |
| **Summe** | 39 | 424,1 | 1.311,5 | 422,2 | |

Inline-`<svg>` im DOM: 27 (zusammen 9.486 Byte, 6.715 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /bewerbung (bewerbung)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 12,3 | 54,7 | 10,3 | – |
| JavaScript | 17 | 224,5 | 707,7 | 223,7 | Bewegungs-JS nicht abgrenzbar |
| CSS | 2 | 14,5 | 75,9 | 14,4 | – |
| Schriften | 2 | 108,3 | 108,3 | 108,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 9 | 34,3 | 141,0 | 34,2 | – |
| **Summe** | 32 | 398,7 | 1.092,5 | 395,7 | |

Inline-`<svg>` im DOM: 12 (zusammen 4.610 Byte, 3.195 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /bewerbung/danke (bewerbung-danke)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 9,1 | 41,5 | 9,1 | – |
| JavaScript | 14 | 184,2 | 590,3 | 183,4 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 13,7 | 74,1 | 13,7 | – |
| Schriften | 2 | 108,3 | 108,3 | 108,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 11 | 35,6 | 150,8 | 35,5 | – |
| **Summe** | 30 | 355,8 | 969,8 | 354,8 | |

Inline-`<svg>` im DOM: 3 (zusammen 1.224 Byte, 827 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /bewerbung/mappe (bewerbung-mappe)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 13,2 | 67,4 | 13,2 | – |
| JavaScript | 15 | 193,4 | 619,9 | 192,6 | Bewegungs-JS nicht abgrenzbar |
| CSS | 2 | 14,5 | 75,9 | 14,4 | – |
| Schriften | 2 | 108,3 | 108,3 | 108,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 7 | 30,8 | 129,7 | 30,7 | – |
| **Summe** | 28 | 365,0 | 1.006,1 | 363,9 | |

Inline-`<svg>` im DOM: 15 (zusammen 5.032 Byte, 3.573 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /datenschutz (datenschutz)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 26,4 | 106,7 | 26,3 | – |
| JavaScript | 16 | 203,0 | 642,0 | 201,8 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 13,7 | 74,1 | 13,7 | – |
| Schriften | 2 | 108,3 | 108,3 | 108,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 19 | 72,9 | 354,9 | 72,5 | – |
| **Summe** | 40 | 429,1 | 1.290,8 | 427,4 | |

Inline-`<svg>` im DOM: 4 (zusammen 1.496 Byte, 1.017 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /impressum (impressum)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 12,0 | 63,4 | 11,9 | – |
| JavaScript | 16 | 203,0 | 642,0 | 201,8 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 13,7 | 74,1 | 13,7 | – |
| Schriften | 2 | 108,3 | 108,3 | 108,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 19 | 72,9 | 354,9 | 72,5 | – |
| **Summe** | 40 | 414,7 | 1.247,4 | 413,0 | |

Inline-`<svg>` im DOM: 4 (zusammen 1.496 Byte, 1.017 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /gibt-es-nicht-404 (fehler-404)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 8,3 | 41,5 | 8,2 | – |
| JavaScript | 16 | 203,0 | 642,0 | 201,8 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 13,7 | 74,1 | 13,7 | – |
| Schriften | 5 | 254,2 | 254,2 | 254,3 | über Budget (> 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 18 | 72,6 | 354,3 | 72,2 | – |
| **Summe** | 42 | 556,5 | 1.370,8 | 554,9 | |

Inline-`<svg>` im DOM: 3 (zusammen 1.204 Byte, 799 Byte gzip einzeln gerechnet; 0 über 1,5 KB).
Mehrfach geladene Adressen: 2 (a/atkinson_hyperlegible_next_latin_wght_normal-s.p.1o9o6__l__p-w.woff2 ×2, …/media/bricolage_grotesque_latin_opsz_normal-s.p.2ej1fmte5yjhi.woff2 ×2).

Einzeldateien je Seite stehen in `_relaunch/belege/r2-fundament-r2/groessen.json` (Feld `seiten[].dateien`).
