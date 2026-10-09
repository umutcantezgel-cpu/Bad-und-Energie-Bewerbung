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
 * Vorgeladen sind genau zwei Dateien: Display-latin und Text-latin. Die Ersatzschrift (Arial mit
 * angeglichenen Metriken) hängt nur an den latin-Aufrufen; an latin-ext hinge sie sonst vor latin
 * und finge alle Zeichen ab. Display und Text nutzen adjustFontFallback, Martian Mono eine eigene.
 *
 * next/font verlangt wörtliche Werte in den Aufrufen; die Bereiche stehen darum ausgeschrieben.
 * Summe der sechs Dateien: 223 864 Byte (Budget 250 KB, K-013).
 */

const bricolage = localFont({
  src: './bricolage-grotesque-latin-opsz-normal.woff2',
  weight: '200 800',
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
  src: './bricolage-grotesque-latin-ext-opsz-normal.woff2',
  weight: '200 800',
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
  src: './atkinson-hyperlegible-next-latin-wght-normal.woff2',
  weight: '200 800',
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
  src: './atkinson-hyperlegible-next-latin-ext-wght-normal.woff2',
  weight: '200 800',
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

// Breitenachse 75–112,5 % (Standard 112,5): ohne font-stretch-Bereich in @font-face bliebe
// font-stretch: 75 % wirkungslos. Die automatische Ersatzschrift rechnete mit der Standardbreite
// (size-adjust 164 %) und wäre beim Tausch viel zu groß; „Martian Ersatz“ in app/globals.css ist
// auf die Breite 75 % abgeglichen (Ziffer 0,5 em).
const martian = localFont({
  src: './martian-mono-latin-wdth-normal.woff2',
  weight: '100 800',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: ['Martian Ersatz', 'ui-monospace', 'monospace'],
  variable: '--font-martian',
  declarations: [
    { prop: 'font-stretch', value: '75% 112.5%' },
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

const martianExt = localFont({
  src: './martian-mono-latin-ext-wdth-normal.woff2',
  weight: '100 800',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-martian-ext',
  declarations: [
    { prop: 'font-stretch', value: '75% 112.5%' },
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
