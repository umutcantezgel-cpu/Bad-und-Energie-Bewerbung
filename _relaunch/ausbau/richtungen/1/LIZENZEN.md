# Lizenzen – Richtung 1 „Der Kreislauf läuft an“

Alle Schriften dieser Seite stehen unter der **SIL Open Font License, Version 1.1 (OFL-1.1)**. Sie liegen selbst gehostet in `fonts/` (woff2, Teilmengen latin und latin-ext, variable Achsen). Es werden keine Schriften, Skripte, Stile oder Bilder von Dritthosts geladen. Die OFL erlaubt Einbettung, Weitergabe und Verwendung auf Webseiten; sie verlangt, dass Copyright-Vermerk und Lizenztext mitgeführt werden, und verbietet den Verkauf der Schriften für sich allein.

| Familie | Quelle (Paket, Version) | Copyright | Dateien in `fonts/` (Byte) | Einsatz |
|---|---|---|---|---|
| Bricolage Grotesque (variabel: Gewicht 200–800, optische Größe 12–96) | `@fontsource-variable/bricolage-grotesque` 5.3.0 (Google Fonts) | Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage) | `bricolage-grotesque-latin-opsz-normal.woff2` (76 888), `bricolage-grotesque-latin-ext-opsz-normal.woff2` (30 736) | Display: H1, Zweitzeile, H2, Stellentitel, Menüeinträge |
| Atkinson Hyperlegible Next (variabel: Gewicht 200–800) | `@fontsource-variable/atkinson-hyperlegible-next` 5.3.0 (Google Fonts) | Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next) | `atkinson-hyperlegible-next-latin-wght-normal.woff2` (33 996), `atkinson-hyperlegible-next-latin-ext-wght-normal.woff2` (19 092) | Text: Einleitung, Mikrotext, Navigation, Knöpfe |
| Martian Mono (variabel: Breite 75–112,5 %, Gewicht 100–800) | `@fontsource-variable/martian-mono` 5.3.0 (Google Fonts) | Copyright 2020 The Martian Mono Project Authors (https://github.com/evilmartians/mono) | `martian-mono-latin-wdth-normal.woff2` (38 492), `martian-mono-latin-ext-wdth-normal.woff2` (24 660) | nur Maße und Planbeschriftung (13:30, 30, 35 km, 1926, Uhrzeiten, Gehälter, Ortsmarke) |

Summe der Schriftdateien: **223 864 Byte = 218,6 KiB** (Budget 250 KB, K-013). Beim Aufruf werden nur die drei latin-Dateien geladen (149 376 Byte = 145,9 KiB); die latin-ext-Dateien greifen erst bei Zeichen außerhalb von Latin-1 (unicode-range). Vorgeladen sind zwei Dateien (Bricolage latin, Atkinson latin).

Herkunft: Die Dateien sind byte-identisch mit den Fontsource-Dateien im lokalen Schriftpool (`_relaunch/richtungen/schriftpool`, geprüft mit `cmp`); Bricolage und Atkinson stammen über `_relaunch/ausbau/referenz/b-runde1/fonts/`, Martian Mono über `_relaunch/richtungen/a/fonts/`. Keine Teilmengenbildung oder Umwandlung durch diesen Lauf. Die Ersatzschriften „Bricolage Ersatz“, „Atkinson Ersatz“ und „Martian Ersatz“ in `index.html` sind eigene `@font-face`-Regeln über lokale Systemschriften (Arial, Liberation Sans, Helvetica, Courier New, Liberation Mono) mit angeglichenen Metriken; sie enthalten keine Schriftdaten. Reservierte Schriftnamen werden nicht verwendet.

Bibliotheken: keine. Das einzige Skript ist das Kopfskript in `index.html` (179 Byte, eigener Code).

Logo: `logo.png` ist die unveränderte Datei `public/images/bad-energie-lahn-dill-logo-transparent.png` der Plattform (SHA-256 `143b0fb459152bb985524c383e4f41dbe6ee291d364818870b3ac53d8686c3c6`, gleich mit dem Original) und gehört dem Auftraggeber. Keine Filter, keine Umfärbung; im dunklen Thema auf einer hellen Plakette.

Zeichnungen: Haus, Wärmepumpe, Sonne mit 30 Teilstrichen, Uhr, Heizkörper, Leitungen, Ikonen (Telefon, Pfeile) und das Favicon sind eigene SVG-Zeichnungen ohne Fremdvorlage. Sie greifen Motive des Logos auf (Giebel, Sonne, Luft), zeichnen das Logo aber nicht nach.

`schriftprobe.webp` ist eine eigene Aufnahme für die Schrift-Austauschprobe (BEGRUENDUNG.md §8) mit Schriften aus dem lokalen Schriftpool (alle OFL-1.1, Fontsource 5.3.0): Archivo, Schibsted Grotesk, Familjen Grotesk, Big Shoulders Display, Gabarito, Rethink Sans, Hanken Grotesk. Diese Schriften werden von der Seite nicht geladen.

Nicht verwendet: Inter, Space Grotesk, Playfair Display, IBM Plex Mono, Fotos, Stock- oder KI-Bilder.

---

## Copyright-Vermerke

- Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage)
- Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next)
- Copyright 2020 The Martian Mono Project Authors (https://github.com/evilmartians/mono)

Alle drei Schriften: „This Font Software is licensed under the SIL Open Font License, Version 1.1.“ Der Lizenztext ist für alle drei gleich und folgt hier einmal wörtlich (aus `@fontsource-variable/bricolage-grotesque/LICENSE`).

```
This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```
