# Schriftlizenzen – `app/fonts/`

Alle Schriften der Plattform stehen unter der **SIL Open Font License, Version 1.1 (OFL-1.1)**. Sie liegen selbst gehostet in diesem Ordner (woff2, Teilmengen latin und latin-ext, variable Achsen) und werden über `next/font/local` eingebunden (`app/fonts/index.ts`). Der Browser lädt keine Schrift von Dritthosts. Die OFL erlaubt Einbettung, Weitergabe und Verwendung auf Webseiten; sie verlangt, dass Copyright-Vermerk und Lizenztext mitgeführt werden, und verbietet den Verkauf der Schriften für sich allein. Reservierte Schriftnamen werden nicht verwendet; die Dateien sind unverändert.

| Familie | Quelle (Paket, Version) | Copyright | Dateien (Byte) | Einsatz (KERN K-005) |
|---|---|---|---|---|
| Bricolage Grotesque (variabel: Gewicht 200–800, optische Größe 12–96) | `@fontsource-variable/bricolage-grotesque` 5.3.0 (Google Fonts) | Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage) | `bricolage-grotesque-latin-opsz-normal.woff2` (76 888), `bricolage-grotesque-latin-ext-opsz-normal.woff2` (30 736) | Display und Überschriften (`--font-display`, `text-display`, `text-title-*`) |
| Atkinson Hyperlegible Next (variabel: Gewicht 200–800) | `@fontsource-variable/atkinson-hyperlegible-next` 5.3.0 (Google Fonts) | Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next) | `atkinson-hyperlegible-next-latin-wght-normal.woff2` (33 996), `atkinson-hyperlegible-next-latin-ext-wght-normal.woff2` (19 092) | Text, Bedienelemente, Formulare (`--font-sans`) |
| Martian Mono (variabel: Breite 75–112,5 %, Gewicht 100–800) | `@fontsource-variable/martian-mono` 5.3.0 (Google Fonts) | Copyright 2020 The Martian Mono Project Authors (https://github.com/evilmartians/mono) | `martian-mono-latin-wdth-normal.woff2` (38 492), `martian-mono-latin-ext-wdth-normal.woff2` (24 660) | nur Maße und Planbeschriftung (`--font-mass`, `font-mass`, `text-etikett`, `text-numeral`) |

Summe: **223 864 Byte = 218,6 KiB** (Budget 250 KB, KERN K-013). Beim Aufruf lädt eine deutsche Seite nur die latin-Dateien (149 376 Byte); die latin-ext-Dateien greifen erst bei Zeichen außerhalb ihres Bereichs (`unicode-range`). Vorgeladen sind zwei Dateien: Bricolage latin und Atkinson latin.

Herkunft: Die Dateien sind byte-identisch mit denen des freigegebenen Prototyps (`_relaunch/ausbau/richtungen/1/fonts/`, geprüft mit `cmp`). Bricolage Grotesque und Atkinson Hyperlegible Next stammen aus `_relaunch/ausbau/referenz/b-runde1/fonts/`, Martian Mono aus `_relaunch/richtungen/a/fonts/`; beide Ordner führen dieselben Quellen in ihren `LIZENZEN.md`. Keine Teilmengenbildung oder Umwandlung.

SHA-256 der Dateien:

```
a79fdb52d4a5c76552452f69202add96e287401fff03d3e8c0e38b4dcb5a99cd  bricolage-grotesque-latin-opsz-normal.woff2
776f6dcaf03636cd69a5802c94808cc8896c0a66c8e9ce0fe147231b6ee01957  bricolage-grotesque-latin-ext-opsz-normal.woff2
18b2a1a39a2fa298b0ba5390aca68462669826c90925656f1c1f6796e0e1bbaf  atkinson-hyperlegible-next-latin-wght-normal.woff2
7dae0c6c66af1aec82e096186aeb1f0e6fa36ab8061ed65422f2b7daf4dd93f3  atkinson-hyperlegible-next-latin-ext-wght-normal.woff2
f9c1655c2c9d1ed5bb8b301a57d1169a1123ffef1a588dc50a7a487810f7d732  martian-mono-latin-wdth-normal.woff2
21fce7e290a2395b70fb1569e1b2ef65b3a2c0a121f28203e23dd9b17d120ed4  martian-mono-latin-ext-wdth-normal.woff2
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
