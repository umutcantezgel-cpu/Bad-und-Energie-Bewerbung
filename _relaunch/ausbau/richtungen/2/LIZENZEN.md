# Lizenzen – Richtung 2 „Kühn“ · Dein Arbeitstag ist ein Kreislauf

Alle drei Schriften stehen unter der SIL Open Font License, Version 1.1 (OFL). Sie dürfen eingebettet, selbst gehostet und weitergegeben werden. Die Dateien sind byte-gleich mit den Fontsource-Paketen im Schriftpool (`_relaunch/richtungen/schriftpool`, per `cmp` geprüft) und wurden über die Referenzen kopiert: Bricolage Grotesque und Atkinson Hyperlegible Next aus `_relaunch/ausbau/referenz/b-runde1/fonts/`, Martian Mono aus `_relaunch/richtungen/a/fonts/`. Kein Subsetting und keine Konvertierung durch den Lauf; die Teilmengen `latin` und `latin-ext` liefert Fontsource. Die Schriften werden nicht einzeln verkauft, reservierte Schriftnamen werden nicht verwendet.

| Familie | Paket | Verwendung | Dateien in `fonts/` | Byte | Lizenz |
|---|---|---|---|---|---|
| Bricolage Grotesque (variabel: Gewicht 200–800, optische Größe 12–96) | `@fontsource-variable/bricolage-grotesque` 5.3.0 | Display: H1, 13:30, Stationswerte, Stellentitel, Ziffern im Fließtext | `bricolage-grotesque-latin-opsz-normal.woff2`, `bricolage-grotesque-latin-ext-opsz-normal.woff2` | 76.888 + 30.736 | OFL 1.1 |
| Atkinson Hyperlegible Next (variabel: Gewicht 200–800) | `@fontsource-variable/atkinson-hyperlegible-next` 5.3.0 | Text: Lead, Sätze der Stationen, Knöpfe, Navigation | `atkinson-hyperlegible-next-latin-wght-normal.woff2`, `atkinson-hyperlegible-next-latin-ext-wght-normal.woff2` | 33.996 + 19.092 | OFL 1.1 |
| Martian Mono (variabel: Breite 75–112,5 %, Gewicht 100–800) | `@fontsource-variable/martian-mono` 5.3.0 | nur Maße und Planbeschriftung (Fr 07:00, 35 km, Freitags Feierabend, Plan, Fahrplan-Überschrift) | `martian-mono-latin-wdth-normal.woff2`, `martian-mono-latin-ext-wdth-normal.woff2` | 38.492 + 24.660 | OFL 1.1 |

Summe auf der Platte: 223.864 Byte (218,6 KiB), Budget 250 KB. Geladen werden auf der Seite nur die drei `latin`-Dateien (149.376 Byte, 145,9 KiB); `latin-ext` wird über `unicode-range` erst bei Bedarf angefordert (kein Zeichen der Seite braucht es). Vorgeladen: Bricolage `latin` und Atkinson `latin` (zwei Schnitte, mit `crossorigin`).

Die Ersatzschriften „Bricolage Ersatz“, „Atkinson Ersatz“ und „Martian Ersatz“ in `index.html` sind eigene `@font-face`-Regeln über Systemschriften (Arial, Liberation Sans, Helvetica, Courier New, Liberation Mono) mit Metrik-Overrides (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`; Werte aus B Runde 1 und A übernommen). Sie enthalten keine Schriftdaten.

Bibliotheken: keine. Kopf- und Seitenskript sind eigener Code, inline: 6.009 Byte roh, 2.435 Byte gzip (beide zusammen komprimiert; einzeln 354 und 2.206 Byte). Gemessen in Runde 2, gleiche Zahl wie BEGRUENDUNG.md §11.

Logo: `logo.png` ist byte-gleich mit `public/images/bad-energie-lahn-dill-logo-transparent.png` (SHA-256 `143b0fb459152bb985524c383e4f41dbe6ee291d364818870b3ac53d8686c3c6`), Eigentum der Bad und Energie GmbH Lahn Dill, unverändert, ohne Filter; im dunklen Thema auf heller Plakette.

## Urheberrechtsvermerke

### Bricolage Grotesque
Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage)

### Atkinson Hyperlegible Next
Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next)

### Martian Mono
Copyright 2020 The Martian Mono Project Authors (https://github.com/evilmartians/mono)

## Lizenztext (gilt für alle drei Schriften)

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
