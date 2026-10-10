# Schriften der Teilen-Bilder – `lib/seo/og-fonts/`

Die Teilen-Bilder (`app/opengraph-image.tsx`, `app/jobs/[slug]/opengraph-image.tsx`, gerendert in `lib/seo/og-render.tsx`) nutzen dieselben drei Schriften wie die Website. `next/og` liest nur TTF, OTF und WOFF, keine WOFF2-Dateien und keine variablen Achsen. Deshalb liegen hier feste Schnitte, abgeleitet aus den Dateien in `app/fonts/` (latin-Teilmenge, gleiche Zeichen). Sie werden nur auf dem Server gelesen und nie an Browser ausgeliefert; kein Abruf bei Google oder anderen Dritthosts.

| Datei | Quelle in `app/fonts/` | Achsen | Byte | Einsatz |
|---|---|---|---|---|
| `bricolage-grotesque-800.ttf` | `bricolage-grotesque-latin-opsz-wght400-800.woff2` | opsz 96, wght 800 | 41 108 | h1, Werte der Maße |
| `bricolage-grotesque-700.ttf` | dieselbe | opsz 32, wght 700 | 41 144 | Unterzeile an der Rohrklammer |
| `atkinson-hyperlegible-next-400.ttf` | `atkinson-hyperlegible-next-latin-wght400-700.woff2` | wght 400 | 29 376 | Mikrotext |
| `atkinson-hyperlegible-next-700.ttf` | dieselbe | wght 700 | 29 388 | Knopf, Namen der Maße |
| `martian-mono-600.ttf` | `martian-mono-latin-wdth75-wght400-800.woff2` | wdth 75, wght 600 | 19 012 | Etiketten, Gehaltsspanne |

Summe 160 028 Byte. Erzeugt mit fontTools 4.66 (`fontTools.varLib.instancer.instantiateVariableFont` mit den Achsenwerten oben, danach ohne `STAT`, `MVAR`, `HVAR`, `avar`, `fvar`, `gvar`, gespeichert als TTF):

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

font = TTFont('app/fonts/bricolage-grotesque-latin-opsz-wght400-800.woff2')
static = instantiateVariableFont(font, {'opsz': 96, 'wght': 800}, updateFontNames=False)
static.flavor = None
for tag in ('STAT', 'MVAR', 'HVAR', 'avar', 'fvar', 'gvar'):
    if tag in static:
        del static[tag]
static.save('lib/seo/og-fonts/bricolage-grotesque-800.ttf')
```

SHA-256:

```
85b12a5708251dac69095f013fa40990f4715d63497cf0107c22219a5c1aa725  atkinson-hyperlegible-next-400.ttf
9372b770edfdf8b98578816498d8bda6cd5e6fd87a51a85677f8b78f3b265f82  atkinson-hyperlegible-next-700.ttf
b4060f6343c50604923b19acf01fe64766d563ac211fc676072b4b11f2bba0fa  bricolage-grotesque-700.ttf
046380abe32bc88521c975fcfd168bcea22e1bffd0ccfcf8c100ce6dfef0ef24  bricolage-grotesque-800.ttf
13362c44ae004476276e3e4bae42fa42c9f39783384d516a388e43f696340881  martian-mono-600.ttf
```

**Lizenz:** SIL Open Font License 1.1, wie die Ausgangsdateien. Copyright-Vermerke und Lizenzangaben im name-Table bleiben erhalten; reservierte Schriftnamen werden nicht neu vergeben. Copyright-Vermerke und der vollständige Lizenztext stehen in `app/fonts/LIZENZEN.md`:

- Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage)
- Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next)
- Copyright 2020 The Martian Mono Project Authors (https://github.com/evilmartians/mono)
