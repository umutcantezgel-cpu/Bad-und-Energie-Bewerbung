import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  checkTheme,
  contrast,
  luminance,
  mediaMatches,
  MODES,
  NACHBAR,
  parseColor,
  RAMP,
  TEXT,
  THEME_FILE,
  UI,
  WARM_LINES,
  WARM_TEXT,
} from '../check-contrast.mjs';

const theme = readFileSync(THEME_FILE, 'utf8');

describe('check-contrast on app/styles/theme.css (KERN K-006)', () => {
  const result = checkTheme(theme);

  it('passes every pair in light, dark, inverse and print', () => {
    const failed = result.rows.filter((row: string[]) => row[5] !== 'ok');
    expect(failed).toEqual([]);
    const modes = new Set(result.rows.map((row: string[]) => row[0]));
    for (const mode of [
      'light',
      'dark',
      'inverse light',
      'inverse dark',
      'print',
      'print dark',
      'print inverse',
      'warm light',
      'warm dark',
      'inverse warm light',
      'inverse warm dark',
      'warm print',
      'warm print dark',
      'print inverse warm',
    ]) {
      expect(modes.has(mode), mode).toBe(true);
    }
  });

  it('checks the new roles: brand, ink-2, Vorlauf/Rücklauf on paper, wall and warmth, accent-press', () => {
    const pairs = new Set(result.rows.map((row: string[]) => row[1]));
    for (const pair of [
      'brand / surface',
      'ink-2 / surface-3',
      'vorlauf / waerme',
      'ruecklauf / surface-2',
      'focus / waerme',
      'on-accent / accent-press',
      'brand / waerme',
    ]) {
      expect(pairs.has(pair), pair).toBe(true);
    }
  });

  it('resolves the E-016 palette', () => {
    expect(result.role('light', 'surface')).toBe('#FBF7F0');
    expect(result.role('light', 'surface-2')).toBe('#F1E9DB');
    expect(result.role('light', 'waerme')).toBe('#FADCC9');
    expect(result.role('light', 'ink')).toBe('#111A3B');
    expect(result.role('light', 'brand')).toBe('#111D6D');
    expect(result.role('light', 'accent')).toBe('#D60000');
    expect(result.role('light', 'accent-hover')).toBe('#B00000');
    expect(result.role('light', 'accent-press')).toBe('#A80000');
    expect(result.role('light', 'focus')).toBe('#1F57C4');
    expect(result.role('light', 'ruecklauf')).toBe('#1F57C4');
    expect(result.role('dark', 'surface')).toBe('#0A1033');
    expect(result.role('dark', 'vorlauf')).toBe('#FF6B5F');
    expect(result.role('dark', 'accent')).toBe('#D60000');
    expect(result.role('dark', 'ruecklauf')).toBe('#86AEFF');
    expect(result.role('inverse light', 'surface')).toBe('#111D6D');
    expect(result.role('inverse light', 'ink')).toBe('#F6F0E4');
  });

  it('keeps print light even with a dark preference (paper white, Navy headings)', () => {
    expect(result.role('print dark', 'surface')).toBe('#FFFFFF');
    expect(result.role('print dark', 'ink')).toBe('#111A3B');
    expect(result.role('print dark', 'brand')).toBe('#111D6D');
    expect(result.role('print inverse', 'surface')).toBe('#FFFFFF');
    expect(result.role('print dark', 'plakette')).toBe('transparent');
  });

  it('keeps the red primary action off the band as a bare fill (below 3:1), a Creme border would hold', () => {
    for (const mode of ['inverse light', 'inverse dark']) {
      const red = parseColor(result.role(mode, 'accent'));
      const band = parseColor(result.role(mode, 'surface'));
      // Documented in check-contrast.mjs: no accent/surface pair for the band on purpose.
      expect(contrast(red, band), mode).toBeLessThan(UI);
      expect(contrast(parseColor(result.role(mode, 'ink')), red), mode).toBeGreaterThanOrEqual(UI);
      expect(contrast(parseColor(result.role(mode, 'ink')), band), mode).toBeGreaterThanOrEqual(TEXT);
    }
    expect(result.rows.some((row: string[]) => row[0].startsWith('inverse') && row[1] === 'accent / surface')).toBe(false);
  });

  it('puts the logo on a Papier plaque in dark mode and in the band (G8), never in light', () => {
    expect(result.role('light', 'plakette')).toBe('transparent');
    expect(result.role('dark', 'plakette')).toBe('#FBF7F0');
    expect(result.role('inverse light', 'plakette')).toBe('#FBF7F0');
    expect(result.role('inverse dark', 'plakette')).toBe('#FBF7F0');
  });
});

describe('check-contrast mechanics', () => {
  it('computes WCAG ratios', () => {
    expect(contrast(parseColor('#FFFFFF'), parseColor('#D60000')).toFixed(2)).toBe('5.44');
    expect(contrast(parseColor('#111A3B'), parseColor('#FBF7F0')).toFixed(2)).toBe('15.93');
  });

  it('understands screen, print and color-scheme; other features are unknown', () => {
    expect(mediaMatches(['screen and (prefers-color-scheme: dark)'], { dark: true, print: false })).toBe(true);
    expect(mediaMatches(['screen and (prefers-color-scheme: dark)'], { dark: true, print: true })).toBe(false);
    expect(mediaMatches(['print'], { dark: false, print: true })).toBe(true);
    expect(mediaMatches(['(min-width: 64em)'], { dark: false, print: false })).toBeNull();
  });

  it('fails a pair below the minimum', () => {
    const css = theme.replace('--p-tinte-2: #454C78;', '--p-tinte-2: #B9B4AA;');
    const { failures, rows } = checkTheme(css);
    expect(failures).toBeGreaterThan(0);
    expect(rows.some((row: string[]) => row[0] === 'light' && row[1].startsWith('ink-muted') && row[5] === 'FAIL')).toBe(true);
  });

  it('refuses color roles hidden in width queries', () => {
    const css = `${theme}\n@layer base { @media (min-width: 40em) { :root { --surface: #000000; } } }`;
    expect(() => checkTheme(css)).toThrow(/unsupported media condition/);
  });
});

describe('check-contrast: Wärmebereich und Wärmerampe (E-031)', () => {
  const result = checkTheme(theme);
  const warm = (MODES as ReadonlyArray<{ name: string; warm?: boolean }>).filter((m) => m.warm).map((m) => m.name);

  it('prüft in jedem Wärmemodus Linien ≥ 3 und Text ≥ 4,5 auf jedem Band sowie die Nachbarbänder', () => {
    expect(warm.sort()).toEqual(
      ['inverse warm dark', 'inverse warm light', 'print inverse warm', 'warm dark', 'warm light', 'warm print', 'warm print dark'].sort(),
    );
    expect(RAMP).toEqual(['waerme-0', 'waerme-1', 'waerme-2', 'waerme-3', 'waerme-4']);
    expect(WARM_LINES).toEqual(['brand', 'vorlauf', 'ruecklauf', 'line-strong']);
    expect(WARM_TEXT).toEqual(['ink', 'ink-2', 'brand']);
    expect(NACHBAR).toEqual({ min: 1.04, max: 1.35 });
    const zeile = (mode: string, pair: string) => result.rows.find((row: string[]) => row[0] === mode && row[1] === pair);
    for (const mode of warm) {
      for (const band of RAMP) {
        for (const fg of WARM_LINES) expect(zeile(mode, `${fg} / ${band}`)?.[4], `${mode} ${fg} / ${band}`).toBe(String(UI));
        for (const fg of WARM_TEXT) expect(result.rows.some((row: string[]) => row[0] === mode && row[1] === `${fg} / ${band}` && row[4] === String(TEXT)), `${mode} ${fg} / ${band}`).toBe(true);
      }
      for (let i = 0; i < RAMP.length - 1; i += 1) {
        const r = zeile(mode, `${RAMP[i]} / ${RAMP[i + 1]}`);
        expect(r?.[5], `${mode} ${RAMP[i]}`).toBe('ok');
        expect(Number(r![3])).toBeGreaterThanOrEqual(NACHBAR.min);
        expect(Number(r![3])).toBeLessThanOrEqual(NACHBAR.max);
      }
    }
    // Die Rampe ist nur im Wärmebereich gegen Linien geprüft: Linien über den Bändern stehen immer dort
    expect(result.rows.some((row: string[]) => !warm.includes(row[0]) && /waerme-\d/.test(row[1]))).toBe(false);
  });

  it('Wärmebereich hell = Rollen des Papiers (auch im Navy-Band), dunkel = Creme auf der Rampe Nacht-Blau → Rotbraun, Druck = Papier weiß', () => {
    for (const mode of ['warm light', 'inverse warm light']) {
      expect(result.role(mode, 'brand'), mode).toBe('#111D6D');
      expect(result.role(mode, 'vorlauf'), mode).toBe('#D60000');
      expect(result.role(mode, 'ruecklauf'), mode).toBe('#1F57C4');
      expect(result.role(mode, 'ink'), mode).toBe('#111A3B');
      expect(result.role(mode, 'surface'), mode).toBe('#FBF7F0');
      // line-strong eine Stufe kräftiger als auf dem Papier (#6B74A6 hielte 3:1 auf den heißen Bändern nicht)
      expect(result.role(mode, 'line-strong'), mode).toBe('#454C78');
    }
    expect(result.role('light', 'line-strong')).toBe('#6B74A6');
    for (const mode of ['warm dark', 'inverse warm dark']) {
      expect(result.role(mode, 'brand'), mode).toBe('#F6F0E4');
      expect(result.role(mode, 'vorlauf'), mode).toBe('#FF6B5F');
      expect(result.role(mode, 'ruecklauf'), mode).toBe('#86AEFF');
      expect(result.role(mode, 'line-strong'), mode).toBe('#B9C0E8');
      expect(result.role(mode, 'waerme-0'), mode).toBe('#1B2150');
    }
    for (const mode of ['warm print', 'warm print dark', 'print inverse warm']) {
      expect(result.role(mode, 'surface'), mode).toBe('#FFFFFF');
      expect(result.role(mode, 'brand'), mode).toBe('#111D6D');
      expect(result.role(mode, 'waerme-4'), mode).toBe('#F2BB9C');
    }
  });

  it('heißeste Stufe: hell Luminanz ≥ 0,535 (Vorlauf #D60000 ≥ 3:1), dunkel ≤ 0,075 (Vorlauf #FF6B5F ≥ 3:1)', () => {
    expect(luminance(parseColor(result.role('warm light', 'waerme-4')))).toBeGreaterThanOrEqual(0.535);
    expect(luminance(parseColor(result.role('warm dark', 'waerme-4')))).toBeLessThanOrEqual(0.075);
    // kühl → heiß: hell wird es dunkler, dunkel heller
    const l = (mode: string) => RAMP.map((band) => luminance(parseColor(result.role(mode, band))));
    const hell = l('warm light');
    const dunkel = l('warm dark');
    for (let i = 1; i < RAMP.length; i += 1) {
      expect(hell[i]).toBeLessThan(hell[i - 1]);
      expect(dunkel[i]).toBeGreaterThan(dunkel[i - 1]);
    }
  });

  it('dunkel wird die Wärme warm (Prüfrunde 1 A1-13): Stufe 0 Nacht-Blau, die heißen Stufen 3 und 4 rotbraun (Farbton 0–30°)', () => {
    const farbton = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
      const max = Math.max(r, g, b);
      const d = max - Math.min(r, g, b);
      const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return (h * 60 + 360) % 360;
    };
    for (const mode of ['warm dark', 'inverse warm dark', 'dark']) {
      const ton = RAMP.map((band) => farbton(result.role(mode, band)));
      expect(ton[0], mode).toBeGreaterThan(200);
      expect(ton[0], mode).toBeLessThan(250);
      for (const i of [3, 4]) expect(ton[i], `${mode} waerme-${i}`).toBeLessThanOrEqual(30);
    }
  });

  it('dunkel ist jede Stufe bunt, kein grauer Rauch (Prüfrunde 2 A2-5): OKLCH-Chroma ≥ 0,06, Stufe 1 violett, ab Stufe 2 rötlich', () => {
    // OKLab nach Björn Ottosson (sRGB → linear → LMS → Lab), Chroma = Abstand von der Grauachse
    const oklch = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
      const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
      const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
      const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
      const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
      return { chroma: Math.hypot(a, bb), ton: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 };
    };
    for (const mode of ['warm dark', 'inverse warm dark', 'dark']) {
      const stufen = RAMP.map((band) => oklch(result.role(mode, band)));
      for (const [i, { chroma }] of stufen.entries()) expect(chroma, `${mode} waerme-${i}`).toBeGreaterThanOrEqual(0.06);
      // Stufe 1 zwischen Nacht-Blau und Rot (violett), Stufe 2 schon rötlich (Magenta bis Rot)
      expect(stufen[1].ton, mode).toBeGreaterThan(285);
      expect(stufen[1].ton, mode).toBeLessThan(330);
      expect(stufen[2].ton >= 330 || stufen[2].ton <= 30, `${mode} waerme-2 ${stufen[2].ton}`).toBe(true);
    }
    // Die Rampe vor Prüfrunde 2 fiele durch (Stufe 2 #3F3035: Chroma 0,02)
    expect(oklch('#3F3035').chroma).toBeLessThan(0.06);
    expect(oklch('#2C2843').chroma).toBeLessThan(0.06);
  });

  it('fällt durch: zu dunkle heiße Stufe, zu ähnliche oder zu verschiedene Nachbarn, schwache Linie im Wärmebereich', () => {
    const fails = (css: string, pair: RegExp, mode = 'warm light') =>
      checkTheme(css).rows.some((row: string[]) => row[0] === mode && pair.test(row[1]) && row[5] === 'FAIL');
    expect(fails(theme.replace('--p-waerme-4: #F2BB9C;', '--p-waerme-4: #E8A27C;'), /^vorlauf \/ waerme-4$/)).toBe(true);
    expect(fails(theme.replace('--p-waerme-1: #F3DFCC;', '--p-waerme-1: #F3EADC;'), /^waerme-0 \/ waerme-1$/)).toBe(true);
    expect(fails(theme.replace('--p-waerme-1: #F3DFCC;', '--p-waerme-1: #E0B090;'), /^waerme-0 \/ waerme-1$/)).toBe(true);
    expect(fails(theme.replace('--line-strong: var(--p-tinte-2);', '--line-strong: var(--p-rand);'), /^line-strong \/ waerme-4$/)).toBe(true);
    expect(fails(theme.replace('--p-glimm-4: #6E3226;', '--p-glimm-4: #7A4470;'), /^vorlauf \/ waerme-4$/, 'warm dark')).toBe(true);
  });

  it('lässt die Rampe nicht in Breitenabfragen verstecken', () => {
    const css = `${theme}\n@layer base { @media (min-width: 40em) { :root { --waerme-2: #000000; } } }`;
    expect(() => checkTheme(css)).toThrow(/unsupported media condition/);
  });
});
