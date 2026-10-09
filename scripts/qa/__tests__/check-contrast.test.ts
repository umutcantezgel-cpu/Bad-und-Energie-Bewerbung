import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { checkTheme, contrast, mediaMatches, parseColor, TEXT, THEME_FILE, UI } from '../check-contrast.mjs';

const theme = readFileSync(THEME_FILE, 'utf8');

describe('check-contrast on app/styles/theme.css (KERN K-006)', () => {
  const result = checkTheme(theme);

  it('passes every pair in light, dark, inverse and print', () => {
    const failed = result.rows.filter((row: string[]) => row[5] !== 'ok');
    expect(failed).toEqual([]);
    const modes = new Set(result.rows.map((row: string[]) => row[0]));
    for (const mode of ['light', 'dark', 'inverse light', 'inverse dark', 'print', 'print dark', 'print inverse']) {
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
