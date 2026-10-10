# Schriftlizenzen – `app/fonts/`

Alle Schriften der Plattform stehen unter der **SIL Open Font License, Version 1.1 (OFL-1.1)**. Sie liegen selbst gehostet in diesem Ordner (woff2, Teilmengen latin und latin-ext, variable Achsen) und werden über `next/font/local` eingebunden (`app/fonts/index.ts`). Der Browser lädt keine Schrift von Dritthosts. Die OFL erlaubt Einbettung, Weitergabe und Verwendung auf Webseiten; sie verlangt, dass Copyright-Vermerk und Lizenztext mitgeführt werden, und verbietet den Verkauf der Schriften für sich allein. Reservierte Schriftnamen werden nicht verwendet. Die Dateien sind mit fontTools instanziert und teilgesetzt (R3-PERF-01, siehe unten); die OFL erlaubt veränderte Fassungen unter derselben Lizenz, die Copyright-Vermerke und der Lizenztext bleiben erhalten.

| Familie | Quelle (Paket, Version) | Copyright | Dateien (Byte) | Einsatz (KERN K-005) |
|---|---|---|---|---|
| Bricolage Grotesque (variabel: Gewicht 200–800, optische Größe 12–96) | `@fontsource-variable/bricolage-grotesque` 5.3.0 (Google Fonts) | Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage) | `bricolage-grotesque-latin-opsz-wght400-800.woff2` (66 392), `bricolage-grotesque-latin-ext-opsz-wght400-800.woff2` (26 484) | Display und Überschriften (`--font-display`, `text-display`, `text-title-*`) |
| Atkinson Hyperlegible Next (variabel: Gewicht 200–800) | `@fontsource-variable/atkinson-hyperlegible-next` 5.3.0 (Google Fonts) | Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next) | `atkinson-hyperlegible-next-latin-wght400-700.woff2` (18 584), `atkinson-hyperlegible-next-latin-ext-wght400-700.woff2` (10 064) | Text, Bedienelemente, Formulare (`--font-sans`) |
| Martian Mono (variabel: Breite 75–112,5 %, Gewicht 100–800) | `@fontsource-variable/martian-mono` 5.3.0 (Google Fonts) | Copyright 2020 The Martian Mono Project Authors (https://github.com/evilmartians/mono) | `martian-mono-latin-wdth75-wght400-800.woff2` (14 564), `martian-mono-latin-ext-wdth75-wght400-800.woff2` (9 852) | nur Maße und Planbeschriftung (`--font-mass`, `font-mass`, `text-etikett`, `text-numeral`) |

Summe: **145 940 Byte = 142,5 KiB** (Budget 250 KB, KERN K-013; vorher 223 864 Byte). Beim Aufruf lädt eine deutsche Seite nur die latin-Dateien; die latin-ext-Dateien greifen erst bei Zeichen außerhalb ihres Bereichs (`unicode-range`). Vorgeladen sind zwei Dateien: Bricolage latin und Atkinson latin.

Herkunft: Ausgangsdateien sind die des freigegebenen Prototyps (`_relaunch/ausbau/richtungen/1/fonts/`): Bricolage Grotesque und Atkinson Hyperlegible Next aus `_relaunch/ausbau/referenz/b-runde1/fonts/`, Martian Mono aus `_relaunch/richtungen/a/fonts/`. R3-PERF-01 hat sie reproduzierbar mit fontTools bearbeitet (`_relaunch/werkzeuge/schriften/bauen.py`): Achsen auf die genutzten Werte eingeengt (Bricolage Gewicht 400–800, Atkinson 400–700, Martian Mono Breite fest 75 %, Gewicht 400–800), dieselben unicode-range-Teilmengen, nur die nötigen Layout-Features, ohne Hinting. Copyright- und Lizenzangaben im name-Table bleiben erhalten.

SHA-256 der Dateien:

```
489e25149c28dc06a9056308a85a84979e31c6076a358435537b235b24216404  atkinson-hyperlegible-next-latin-ext-wght400-700.woff2
e934172be32983dbff96caf8183d09d1f27d933c6dc37fd3f18cbd5be457b24c  atkinson-hyperlegible-next-latin-wght400-700.woff2
ca87f43f38dd906e0780f72d110536605507886de100fb3166de5667f4d75557  bricolage-grotesque-latin-ext-opsz-wght400-800.woff2
9042ae0c14b8f1f72c2ecdfebe457bca9d978d0c386a3acd8aa568216f590868  bricolage-grotesque-latin-opsz-wght400-800.woff2
2227126ce23e10f7b5f9275478d1aa4d98b144d9a1cadd8d8b98a87852ec9a75  martian-mono-latin-ext-wdth75-wght400-800.woff2
d0a3c0de459677d29757b737b909e3b4654406f5ed95da17597c399bca40a70c  martian-mono-latin-wdth75-wght400-800.woff2
```

Ersatzschriften: `next/font` erzeugt für Bricolage Grotesque und Atkinson Hyperlegible Next (latin) je eine `@font-face`-Regel über die lokale Systemschrift Arial mit angeglichenen Metriken (`size-adjust`, `ascent-override`, `descent-override`). Für Martian Mono steht „Martian Ersatz“ in `app/globals.css` (lokale Arial-Familie, auf die Breite 75 % abgeglichen). Keine dieser Regeln enthält Schriftdaten.

Nicht mehr verwendet: Inter (`next/font/google`) entfällt mit KERN 1.0.

---

## Copyright-Vermerke

- Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage)
- Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next)
- Copyright 2020 The Martian Mono Project Authors (https://github.com/evilmartians/mono)

Alle drei Schriften: „This Font Software is licensed under the SIL Open Font License, Version 1.1.“ Der Lizenztext ist für alle drei gleich und folgt hier einmal wörtlich (aus `@fontsource-variable/bricolage-grotesque/LICENSE`, übernommen aus `_relaunch/ausbau/richtungen/1/LIZENZEN.md`).

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
