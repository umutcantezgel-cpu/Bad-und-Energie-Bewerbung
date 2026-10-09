# Größen je Seite · P0-MESS-01

- Datum: 09.10.2026, 09:33 (Europe/Berlin) · Basis: http://localhost:3500 (Produktions-Build)
- Ansicht d1440 (1440×900), hell, Bewegung no-preference; je Seite neuer Kontext (kalter Zwischenspeicher); Laden bis networkidle, danach schrittweises Durchscrollen
- übertragen = Body-Bytes über die Leitung (ohne Kopfzeilen) · roh = entpackt · gzip = `zlib.gzipSync` Stufe 9 auf dem Body · 1 KB = 1024 Byte
- Next-Prefetch (`?_rsc=`, Seitenwechsel-Vorabrufe der Links) wird als eigener Typ geführt und gehört zur Summe (Spalte „ohne Prefetch“ lässt ihn weg, er schwankt von Lauf zu Lauf); „nach Scrollen“ = erst nach dem Durchscrollen geladen
- Nur Antworten des eigenen Hosts; Tracking-Attrappen und gesperrte Fremdanfragen zählen nicht zum Gewicht (Anzahl je Seite in der JSON: `gesperrteAnfragen`)
- Budgets (K-013): Schriften gesamt ≤ 250 KB · Icon-SVG ≤ 1,5 KB (auf die rohe Größe gerechnet) · Illustrations-SVG ≤ 40 KB gzip · Bewegungs-JS ≤ 60 KB gzip (nicht abgrenzbar, siehe unten)

## Global

### Schriften (eindeutige Dateien) · Summe 47,3 KB übertragen · Budget ≤ 250 KB · ok

| Datei | Typ | übertragen KB | roh KB | gzip KB | Seiten |
|---|---|---:|---:|---:|---:|
| `…/media/83afe278b6a6bb3c-s.p.2bn3s6zvc0dyp.woff2` | font/woff2 | 47,3 | 47,3 | 47,3 | 12 |

### Größte JavaScript-Dateien (Top 10 von 19, nach gzip)

| Datei | übertragen KB | roh KB | gzip KB | Kodierung | Seiten |
|---|---:|---:|---:|---|---:|
| `…/chunks/0a37caasaw7-7.js` | 71,6 | 228,7 | 71,4 | gzip | 12 |
| `…/chunks/2gntgrcwrye4_.js` | 44,2 | 162,7 | 44,1 | gzip | 12 |
| `…/chunks/11wu3hljr9hj4.js` | 20,3 | 57,1 | 20,3 | gzip | 8 |
| `…/chunks/2ii7mwog_k9qo.js` | 13,3 | 37,0 | 13,3 | gzip | 1 |
| `…/chunks/25i8q8ks78nna.js` | 11,9 | 36,1 | 11,9 | gzip | 2 |
| `…/chunks/2o0b38gyj507j.js` | 11,1 | 31,0 | 11,1 | gzip | 12 |
| `…/chunks/3snddn835qz2b.js` | 10,9 | 30,7 | 10,8 | gzip | 8 |
| `…/chunks/1--_3ulp8dgus.js` | 10,6 | 30,6 | 10,6 | gzip | 2 |
| `…/chunks/118nq7mu3xtd_.js` | 9,1 | 25,4 | 9,1 | gzip | 12 |
| `…/chunks/0htzap2iir08t.js` | 8,7 | 28,2 | 8,7 | gzip | 12 |

JavaScript gesamt (eindeutig, alle Seiten): 19 Dateien · 238,5 KB übertragen · 237,3 KB gzip. Budget „Bewegungs-JS ≤ 60 KB gzip“: nicht prüfbar, die Dateien tragen keine Kennzeichnung, welcher Anteil Bewegung ist.

### CSS (eindeutige Dateien) · 2 Dateien · 13,4 KB übertragen · 13,3 KB gzip

| Datei | übertragen KB | roh KB | gzip KB | Seiten |
|---|---:|---:|---:|---:|
| `…/chunks/0kbnfew8ieia6.css` | 12,7 | 68,9 | 12,6 | 12 |
| `…/chunks/376rzseq80lhj.css` | 0,7 | 1,8 | 0,7 | 2 |

### SVG-Antworten (als Datei geladen) · 0

Keine SVG-Dateien über das Netz geladen.

### Inline-`<svg>` im DOM · 215 Elemente auf allen Seiten, 35 eindeutige Auszeichnungen, davon 1 über 1,5 KB

Größe = UTF-8-Byte der serialisierten Auszeichnung im DOM nach dem Laden (kann vom Quelltext des Servers geringfügig abweichen).

| Kennung | Ort | gezeigt px | Bytes | gzip Bytes | Vorkommen | Seiten | Budget |
|---|---|---|---:|---:|---:|---:|---|
| `size-full select-none` | `div > div > svg` | 448×448 | 2.459 | 750 | 1 | 1 | über Icon-Budget (nur als Illustration zulässig) |
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
| / | 200 | 27,9 (1) | 202,7 (16) | 12,7 (1) | 47,3 (1) | 0,0 (0) | 4,8 (1) | 56,4 (13) | 0,0 (0) | 351,8 | 295,4 | 201,6 | 68,6 | 42 | ok |
| /jobs | 200 | 12,0 (1) | 202,7 (16) | 12,7 (1) | 47,3 (1) | 0,0 (0) | 4,8 (1) | 72,3 (19) | 0,0 (0) | 351,7 | 279,5 | 201,6 | 15,0 | 11 | ok |
| /jobs/anlagenmechaniker-shk-wetzlar | 200 | 22,3 (1) | 202,7 (16) | 12,7 (1) | 47,3 (1) | 0,0 (0) | 4,8 (1) | 21,6 (7) | 0,0 (0) | 311,3 | 289,8 | 201,6 | 0,0 | 31 | ok |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | 200 | 22,3 (1) | 202,7 (16) | 12,7 (1) | 47,3 (1) | 0,0 (0) | 4,8 (1) | 19,9 (7) | 0,0 (0) | 309,7 | 289,8 | 201,6 | 0,0 | 31 | ok |
| /jobs/obermonteur-projektleiter-shk-wetzlar | 200 | 22,3 (1) | 202,7 (16) | 12,7 (1) | 47,3 (1) | 0,0 (0) | 4,8 (1) | 21,6 (7) | 0,0 (0) | 311,3 | 289,7 | 201,6 | 0,0 | 32 | ok |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | 200 | 21,0 (1) | 202,7 (16) | 12,7 (1) | 47,3 (1) | 0,0 (0) | 4,8 (1) | 20,1 (7) | 0,0 (0) | 308,5 | 288,4 | 201,6 | 0,0 | 27 | ok |
| /bewerbung | 200 | 11,8 (1) | 224,3 (17) | 13,4 (2) | 47,3 (1) | 0,0 (0) | 4,8 (1) | 33,6 (9) | 0,0 (0) | 335,2 | 301,6 | 223,4 | 15,0 | 12 | ok |
| /bewerbung/danke | 200 | 8,8 (1) | 183,9 (14) | 12,7 (1) | 47,3 (1) | 0,0 (0) | 4,8 (1) | 35,1 (11) | 0,0 (0) | 292,6 | 257,5 | 183,2 | 0,0 | 3 | ok |
| /bewerbung/mappe | 200 | 12,7 (1) | 193,1 (15) | 13,4 (2) | 47,3 (1) | 0,0 (0) | 4,8 (1) | 15,2 (3) | 0,0 (0) | 286,5 | 271,3 | 192,3 | 0,0 | 15 | ok |
| /datenschutz | 200 | 25,8 (1) | 170,6 (13) | 12,7 (1) | 47,3 (1) | 0,0 (0) | 4,8 (1) | 21,4 (7) | 0,0 (0) | 282,6 | 261,2 | 169,9 | 0,0 | 4 | ok |
| /impressum | 200 | 11,6 (1) | 170,6 (13) | 12,7 (1) | 47,3 (1) | 0,0 (0) | 4,8 (1) | 20,1 (7) | 0,0 (0) | 267,1 | 247,0 | 169,9 | 0,0 | 4 | ok |
| /gibt-es-nicht-404 | 404 | 8,0 (1) | 202,7 (16) | 12,7 (1) | 94,6 (2) | 0,0 (0) | 4,8 (1) | 73,6 (19) | 0,0 (0) | 396,3 | 322,7 | 201,6 | 0,0 | 3 | ok |

### / (start)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 27,9 | 157,4 | 27,7 | – |
| JavaScript | 16 | 202,7 | 641,3 | 201,6 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 12,7 | 68,9 | 12,6 | – |
| Schriften | 1 | 47,3 | 47,3 | 47,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 13 | 56,4 | 291,9 | 56,1 | – |
| **Summe** | 33 | 351,8 | 1.211,5 | 350,0 | |

Inline-`<svg>` im DOM: 42 (zusammen 23.399 Byte, 13.135 Byte gzip einzeln gerechnet; 1 über 1,5 KB).

### /jobs (stellen)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 12,0 | 67,7 | 11,9 | – |
| JavaScript | 16 | 202,7 | 641,3 | 201,6 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 12,7 | 68,9 | 12,6 | – |
| Schriften | 1 | 47,3 | 47,3 | 47,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 19 | 72,3 | 353,1 | 71,9 | – |
| **Summe** | 39 | 351,7 | 1.183,2 | 350,0 | |

Inline-`<svg>` im DOM: 11 (zusammen 3.948 Byte, 2.724 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /jobs/anlagenmechaniker-shk-wetzlar (stelle-anlagenmechaniker)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 22,3 | 133,9 | 22,1 | – |
| JavaScript | 16 | 202,7 | 641,3 | 201,6 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 12,7 | 68,9 | 12,6 | – |
| Schriften | 1 | 47,3 | 47,3 | 47,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 7 | 21,6 | 93,5 | 21,3 | – |
| **Summe** | 27 | 311,3 | 989,7 | 309,6 | |

Inline-`<svg>` im DOM: 31 (zusammen 10.714 Byte, 7.623 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /jobs/kundendiensttechniker-waermepumpe-wetzlar (stelle-kundendienst)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 22,3 | 134,3 | 22,1 | – |
| JavaScript | 16 | 202,7 | 641,3 | 201,6 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 12,7 | 68,9 | 12,6 | – |
| Schriften | 1 | 47,3 | 47,3 | 47,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 7 | 19,9 | 88,9 | 19,9 | – |
| **Summe** | 27 | 309,7 | 985,5 | 308,2 | |

Inline-`<svg>` im DOM: 31 (zusammen 10.714 Byte, 7.623 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /jobs/obermonteur-projektleiter-shk-wetzlar (stelle-obermonteur)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 22,3 | 134,9 | 22,1 | – |
| JavaScript | 16 | 202,7 | 641,3 | 201,6 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 12,7 | 68,9 | 12,6 | – |
| Schriften | 1 | 47,3 | 47,3 | 47,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 7 | 21,6 | 93,5 | 21,3 | – |
| **Summe** | 27 | 311,3 | 990,7 | 309,6 | |

Inline-`<svg>` im DOM: 32 (zusammen 11.011 Byte, 7.846 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /jobs/ausbildung-anlagenmechaniker-shk-wetzlar (stelle-ausbildung)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 21,0 | 126,7 | 20,8 | – |
| JavaScript | 16 | 202,7 | 641,3 | 201,6 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 12,7 | 68,9 | 12,6 | – |
| Schriften | 1 | 47,3 | 47,3 | 47,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 7 | 20,1 | 89,2 | 20,0 | – |
| **Summe** | 27 | 308,5 | 978,2 | 307,0 | |

Inline-`<svg>` im DOM: 27 (zusammen 9.486 Byte, 6.715 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /bewerbung (bewerbung)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 11,8 | 53,5 | 9,9 | – |
| JavaScript | 17 | 224,3 | 707,1 | 223,4 | Bewegungs-JS nicht abgrenzbar |
| CSS | 2 | 13,4 | 70,7 | 13,3 | – |
| Schriften | 1 | 47,3 | 47,3 | 47,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 9 | 33,6 | 139,0 | 33,5 | – |
| **Summe** | 31 | 335,2 | 1.022,4 | 332,3 | |

Inline-`<svg>` im DOM: 12 (zusammen 4.610 Byte, 3.195 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /bewerbung/danke (bewerbung-danke)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 8,8 | 40,3 | 8,7 | – |
| JavaScript | 14 | 183,9 | 589,6 | 183,2 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 12,7 | 68,9 | 12,6 | – |
| Schriften | 1 | 47,3 | 47,3 | 47,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 11 | 35,1 | 149,1 | 35,0 | – |
| **Summe** | 29 | 292,6 | 900,0 | 291,5 | |

Inline-`<svg>` im DOM: 3 (zusammen 1.224 Byte, 827 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /bewerbung/mappe (bewerbung-mappe)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 12,7 | 66,2 | 12,6 | – |
| JavaScript | 15 | 193,1 | 619,3 | 192,3 | Bewegungs-JS nicht abgrenzbar |
| CSS | 2 | 13,4 | 70,7 | 13,3 | – |
| Schriften | 1 | 47,3 | 47,3 | 47,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 3 | 15,2 | 68,0 | 15,1 | – |
| **Summe** | 23 | 286,5 | 876,2 | 285,5 | |

Inline-`<svg>` im DOM: 15 (zusammen 5.032 Byte, 3.573 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /datenschutz (datenschutz)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 25,8 | 105,5 | 25,7 | – |
| JavaScript | 13 | 170,6 | 552,6 | 169,9 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 12,7 | 68,9 | 12,6 | – |
| Schriften | 1 | 47,3 | 47,3 | 47,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 7 | 21,4 | 93,2 | 21,1 | – |
| **Summe** | 24 | 282,6 | 872,3 | 281,4 | |

Inline-`<svg>` im DOM: 4 (zusammen 1.496 Byte, 1.017 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /impressum (impressum)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 11,6 | 62,2 | 11,5 | – |
| JavaScript | 13 | 170,6 | 552,6 | 169,9 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 12,7 | 68,9 | 12,6 | – |
| Schriften | 1 | 47,3 | 47,3 | 47,3 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 7 | 20,1 | 89,2 | 20,0 | – |
| **Summe** | 24 | 267,1 | 824,9 | 266,1 | |

Inline-`<svg>` im DOM: 4 (zusammen 1.496 Byte, 1.017 Byte gzip einzeln gerechnet; 0 über 1,5 KB).

### /gibt-es-nicht-404 (fehler-404)

| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |
|---|---:|---:|---:|---:|---|
| Dokument (HTML) | 1 | 8,0 | 40,6 | 7,9 | – |
| JavaScript | 16 | 202,7 | 641,3 | 201,6 | Bewegungs-JS nicht abgrenzbar |
| CSS | 1 | 12,7 | 68,9 | 12,6 | – |
| Schriften | 2 | 94,6 | 94,6 | 94,6 | ok (≤ 250 KB) |
| Bilder (ohne SVG) | 1 | 4,8 | 4,8 | 4,7 | – |
| Next-Prefetch (_rsc) | 19 | 73,6 | 357,2 | 73,0 | – |
| **Summe** | 40 | 396,3 | 1.207,4 | 394,4 | |

Inline-`<svg>` im DOM: 3 (zusammen 1.204 Byte, 799 Byte gzip einzeln gerechnet; 0 über 1,5 KB).
Mehrfach geladene Adressen: 1 (…/media/83afe278b6a6bb3c-s.p.2bn3s6zvc0dyp.woff2 ×2).

Einzeldateien je Seite stehen in `_relaunch/belege/P0-MESS-01/groessen.json` (Feld `seiten[].dateien`).
