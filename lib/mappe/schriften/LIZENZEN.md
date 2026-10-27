# Schriftlizenzen – `lib/mappe/schriften/`

Schrift der Bewerbungsmappe als PDF (Schritt 4a: PDF im Anhang der Team-Mail, `lib/mappe/pdf/`). Dieselbe Familie wie der Text der Website (`app/fonts/`, `--font-sans`), aber als **statische TrueType-Schnitte**: Eine PDF bettet nur feste Schnitte sauber ein (eine variable Schrift würde je nach Werkzeug als Type-3-Schrift oder gar nicht eingebettet). Beide Dateien decken latin und latin-ext in einer Datei ab (Umlaute, ß und ẞ, polnische, türkische, tschechische und französische Buchstaben, „“ ‚‘ – — … € ·); die PDF bettet nur die benutzten Zeichen ein.

Lizenz: **SIL Open Font License, Version 1.1 (OFL-1.1)**, https://openfontlicense.org. Die OFL erlaubt Einbettung (fsType 0) und Weitergabe; Copyright-Vermerk und Lizenzhinweis stehen im name-Table der Dateien und hier. Die Schrift wird nicht für sich allein verkauft.

| Familie | Quelle | Copyright | Dateien (Byte) |
|---|---|---|---|
| Atkinson Hyperlegible Next, Regular und Bold (Version 2.001) | Google Fonts (statische Schnitte, `fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;700`, unverändert) | Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next) | `atkinson-hyperlegible-next-400.ttf` (46 632), `atkinson-hyperlegible-next-700.ttf` (46 528) |
| Bricolage Grotesque, Bold (Schriftstil „Markant“: Name und Überschriften, Schritt L3) | Google Fonts (statischer Schnitt, `fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700`, unverändert; Einbettung erlaubt, fsType 0) | Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage) | `bricolage-grotesque-700.ttf` (82 204) |

SHA-256 der Dateien:

```
833b4e79c549e3f407fecf03b5c9e6dbfb94a80c86f35fe4f12d32b5936eccba  atkinson-hyperlegible-next-400.ttf
708c1182ee6d789bc9674e5eea52e9cfe814ad29bdfb55f3670a12e83dd0fb19  atkinson-hyperlegible-next-700.ttf
913ee3631949ee1b4fb2601269412fca5775eb994d4f87be2c366c94ac123dc5  bricolage-grotesque-700.ttf
```

Bricolage Grotesque deckt nicht jedes Zeichen von Atkinson (es fehlen etwa Ţ/ţ, Δ, Ω): Kann sie einen Namen nicht
zeichnen, setzt die PDF ihn sachlich (`titelschriftDeckt` in `lib/mappe/blatt/zeichen.ts`).
