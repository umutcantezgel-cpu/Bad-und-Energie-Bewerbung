import localFont from 'next/font/local';

/**
 * Schriften (KERN K-005): selbst gehostet über next/font/local, Lizenzen in ./LIZENZEN.md.
 *
 * - Bricolage Grotesque spricht die Botschaft (Display 800, −0,01 em),
 * - Atkinson Hyperlegible Next trägt das Lesen (400/700),
 * - Martian Mono spricht nur die Maße (Breite 75 %, tabellarische Ziffern).
 *
 * Je Familie zwei Teilmengen mit unicode-range: latin (deutscher Text, „…“, –, €) und latin-ext
 * (lädt nur, wenn eine Seite solche Zeichen enthält). next/font/local kennt keine unicode-range je
 * Datei, darum ist jede Teilmenge ein eigener Aufruf; theme.css setzt sie zu --font-display,
 * --font-sans und --font-mass zusammen (latin-ext zuerst, sie greift nur in ihrem Bereich).
 *
 * Instanziert und teilgesetzt (R3-PERF-01, Skript _relaunch/werkzeuge/schriften/bauen.py): Achsen auf
 * den genutzten Bereich gelegt, gleiche Zeichen wie die Originale, nur kern/liga/calt/tnum/lnum/case/rvrn,
 * ohne Hinting. Genutzt (bedarf.mjs, alle Seiten): Bricolage 400–800 (ziffer im Text 400–700, Zitat 500,
 * h2 600, Titel 700, Display 800) bei optischer Größe 12–96 nach Schriftgröße; Atkinson 400–700;
 * Martian 400–600 bei Breite 75 %. Die weight-Angaben unten sind genau diese Bereiche: ein Gewicht
 * außerhalb (z. B. font-extrabold in Atkinson) würde auf den Rand gezogen statt neu gezeichnet.
 *
 * Vorgeladen sind genau zwei Dateien: Display-latin und Text-latin (65 KiB + 18 KiB). Die Ersatzschrift
 * (Arial mit angeglichenen Metriken) hängt nur an den latin-Aufrufen; an latin-ext hinge sie sonst vor
 * latin und finge alle Zeichen ab. Display und Text nutzen adjustFontFallback, Martian Mono eine eigene.
 *
 * font-display bleibt überall swap. Display und Text sind vorgeladen und kommen auf den gemessenen Wegen
 * vor dem ersten Bild an; optional hieße bei langsamem Erstbesuch Arial für die ganze Sitzung, gerade
 * im Plakat. Martian Mono wird nicht vorgeladen (14 KiB, nur Seiten mit Maßen); optional bliebe dort
 * beim Erstbesuch mobil fast immer bei der Ersatzschrift, die Maße verlören ihre Schrift. swap tauscht
 * kurze, feste Maßfelder, der Versatz ist klein (CLS gemessen in _relaunch/belege/r3-perf-01).
 *
 * next/font verlangt wörtliche Werte in den Aufrufen; die Bereiche stehen darum ausgeschrieben.
 * Summe der sechs Dateien: 145 940 Byte = 142,5 KiB (vorher 223 864; Budget 250 KB, K-013).
 * Eine deutsche Seite lädt nur latin: 84 976 Byte, mit Maßen 99 540 Byte.
 */

const bricolage = localFont({
  src: './bricolage-grotesque-latin-opsz-wght400-800.woff2',
  weight: '400 800',
  style: 'normal',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
  fallback: ['system-ui', 'sans-serif'],
  variable: '--font-bricolage',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

const bricolageExt = localFont({
  src: './bricolage-grotesque-latin-ext-opsz-wght400-800.woff2',
  weight: '400 800',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-bricolage-ext',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
    },
  ],
});

const atkinson = localFont({
  src: './atkinson-hyperlegible-next-latin-wght400-700.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
  fallback: ['system-ui', 'sans-serif'],
  variable: '--font-atkinson',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

const atkinsonExt = localFont({
  src: './atkinson-hyperlegible-next-latin-ext-wght400-700.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-atkinson-ext',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
    },
  ],
});

// Breite fest auf 75 % instanziert (die Datei hat keine Breitenachse mehr): font-stretch: 75% im
// @font-face sagt dem Browser, dass die Datei genau die Breite ist, die font-mass und text-etikett
// verlangen. Gewicht bleibt variabel 400–800 (genutzt 400–600). Die automatische Ersatzschrift rechnete
// mit der Standardbreite und wäre beim Tausch viel zu groß; „Martian Ersatz“ steht in app/globals.css.
const martian = localFont({
  src: './martian-mono-latin-wdth75-wght400-800.woff2',
  weight: '400 800',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: ['Martian Ersatz', 'ui-monospace', 'monospace'],
  variable: '--font-martian',
  declarations: [
    { prop: 'font-stretch', value: '75%' },
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

const martianExt = localFont({
  src: './martian-mono-latin-ext-wdth75-wght400-800.woff2',
  weight: '400 800',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-martian-ext',
  declarations: [
    { prop: 'font-stretch', value: '75%' },
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
    },
  ],
});

/** Klassen für <html>: definieren die Schriftvariablen, die theme.css zusammensetzt. */
export const fontVariables = [bricolage, bricolageExt, atkinson, atkinsonExt, martian, martianExt]
  .map((font) => font.variable)
  .join(' ');
