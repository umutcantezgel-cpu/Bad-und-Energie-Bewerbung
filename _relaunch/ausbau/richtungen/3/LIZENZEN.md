# Lizenzen · Richtung 3 „Grenze – Wärmebild“ (A2-RICHT-3)

## Schriften

Alle drei Familien stehen unter der SIL Open Font License, Version 1.1 (OFL). Sie dürfen eingebettet, selbst gehostet und weitergegeben werden. Die Dateien sind unverändert aus den Fontsource-Paketen kopiert (Teilmengen `latin` und `latin-ext`, Bezug über `_relaunch/ausbau/referenz/b-runde1/fonts/` und `_relaunch/richtungen/a/fonts/`, ursprünglich `_relaunch/richtungen/schriftpool`). Es gibt keinen eigenen Subsetting- oder Konvertierungsschritt. Reservierte Schriftnamen werden nicht verwendet; „Bricolage Ersatz“, „Atkinson Ersatz“ und „Martian Ersatz“ in `index.html` sind eigene `@font-face`-Regeln über Systemschriften (Arial, Liberation Sans, Courier New, Liberation Mono) mit angeglichenen Metriken und enthalten keine Schriftdaten.

| Familie | Paket | Verwendung | Dateien in `fonts/` | Byte | Lizenz |
|---|---|---|---|---|---|
| Bricolage Grotesque (variabel, wght 200–800, opsz 12–96) | `@fontsource-variable/bricolage-grotesque` 5.3.0 | Display: H1, H2, Messwerte, Knopf, Stellentitel; Ziffern im Fließtext und in der Telefonnummer (`.ziffern`, 500) | `bricolage-grotesque-latin-opsz-normal.woff2`, `bricolage-grotesque-latin-ext-opsz-normal.woff2` | 76.888 + 30.736 | OFL 1.1 |
| Atkinson Hyperlegible Next (variabel, wght 200–800) | `@fontsource-variable/atkinson-hyperlegible-next` 5.3.0 | Text: Ortsmarke (600, Versalien gesperrt), Einleitung, Beschriftungen, Navigation | `atkinson-hyperlegible-next-latin-wght-normal.woff2`, `atkinson-hyperlegible-next-latin-ext-wght-normal.woff2` | 33.996 + 19.092 | OFL 1.1 |
| Martian Mono (variabel, wght 100–800, wdth 75–112,5 %) | `@fontsource-variable/martian-mono` 5.3.0 | Nur Maße und Planbeschriftung: Gehaltsspannen, Wochenplan, Raumnamen und Ablesung 13:30 im Wärmebild | `martian-mono-latin-wdth-normal.woff2`, `martian-mono-latin-ext-wdth-normal.woff2` | 38.492 + 24.660 | OFL 1.1 |

Summe der Schriftdateien: 223.864 Byte (223,9 KB dezimal, 218,6 KiB), Budget 250 KB. Geladen werden in deutscher Sprache nur die drei `latin`-Dateien (149.376 Byte); die `latin-ext`-Dateien greifen erst bei Zeichen außerhalb von Latin-1 und allgemeiner Interpunktion (`unicode-range`). Vorgeladen sind zwei Schnitte: Bricolage `latin` (H1, LCP) und Atkinson `latin` (Einleitung).

### Urheberrechtsvermerke
- Bricolage Grotesque: Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage)
- Atkinson Hyperlegible Next: Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next)
- Martian Mono: Copyright 2020 The Martian Mono Project Authors (https://github.com/evilmartians/mono)

## Bibliotheken

Keine. Der WebGL-Moment (`js/waermebild.js`) ist eigener Code (WebGL 1, ein Vertex- und ein Fragment-Shader, 6,4 KB gzip). Es gibt kein CDN, keine nachgeladene Fremdbibliothek, keine Fremdanfrage.

## Logo, Bilder, Daten

- `logo.png` ist die unveränderte Datei `public/images/bad-energie-lahn-dill-logo-transparent.png` der Plattform (byte-gleich geprüft mit `cmp`) und gehört dem Auftraggeber. Keine Filter, keine Umfärbung; im dunklen Thema steht es auf einer hellen Plakette.
- Die vier Zeichen Flamme, Tropfen, Sonne und Luft sind Strichzeichnungen nach den vier Feldern des Logos; die Pfade stammen aus der Projekt-Richtung A (`_relaunch/richtungen/a/index.html`, eigene Zeichnung des Laufs, keine Icon-Bibliothek).
- Das Wärmebild ist eine eigene Zeichnung und eine eigene Rechnung, kein Foto und kein generiertes Bild (A-G4): `bau/szene.mjs` (Geometrie), `bau/feld.mjs` (stationäre Wärmeleitung, Ankunftszeiten, Isothermen), `bau/svg.mjs` (Strichzeichnung und bewegte Ebene der Rohre). Die Ergebnisse `js/feld.png` (Feldtextur, kein Bild im Sinne von Bildmaterial) und die Bänder in `index.html` sind daraus erzeugt.
- Alle Texte stammen aus `lib/content/facts.ts`, `components/home/content.ts`, `lib/data/*`, `lib/jobs/data/*` und `components/site/nav.ts` (Nachweis je Zeile in `BEGRUENDUNG.md`, Abschnitt „Quellen“).
- Die Skripte in `bau/` und `pruef/` laufen nur lokal (Node, Playwright und sharp aus `_relaunch/werkzeuge`) und werden nicht ausgeliefert.

Nicht verwendet: Inter, Space Grotesk, Playfair Display, IBM Plex Mono, Fotos, Stock- oder KI-Bilder, 3D-Engine, externe Skripte, Stile oder Dienste.

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
