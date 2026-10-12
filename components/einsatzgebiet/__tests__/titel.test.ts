import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getHubKreise, getPublishedPlaces } from '@/lib/places/registry';
import { getEinsatzgebietPageText, getKreisPageText, getPlacePageText } from '@/lib/places/text';
import { OrtTitel } from '../OrtTitel';
import { SPALTEN_ANTEIL, breiteEm, breitestesStueckEm, titelTeilen } from '../titel';

/**
 * Größe des Namens in der h1 (KERN K-005, Z-13): Das breiteste Stück passt bei jeder Breite in die Spalte, ohne
 * im Wort zu brechen. Gemessen wie app/fonts/__tests__/display.test.ts (Chromium 141, Bricolage 800, −0,01 em,
 * opsz auto, 40 px): ganze Wörter, gegen die Summe der Zeichenbreiten aus titel.ts.
 */
const GEMESSEN_EM: Record<string, number> = {
  'Feierabend.': 5.548,
  Münchholzhausen: 8.707,
  Grävenwiesbach: 7.8898,
  Mengerskirchen: 7.723,
  Schöffengrund: 7.148,
  Ehringshausen: 7.0703,
  'Lahn-Dill-Kreis': 6.8113,
  Wetteraukreis: 6.7469,
  'Einsatzgebiet:': 6.668,
  '(Westerwald)': 6.3094,
  Heuchelheim: 6.1797,
};

const css = readFileSync(path.resolve(__dirname, '../einsatzgebiet.module.css'), 'utf8');

describe('Zeichenbreiten (titel.ts)', () => {
  it.each(Object.entries(GEMESSEN_EM))('%s: Summe liegt auf der sicheren Seite (≥ gemessen, ≤ 3 % darüber)', (wort, em) => {
    expect(breiteEm(wort)).toBeGreaterThanOrEqual(em * 0.99);
    expect(breiteEm(wort)).toBeLessThanOrEqual(em * 1.03);
  });

  it('Bindestrich-Namen brechen nach dem Strich, Wörter an Leerzeichen', () => {
    expect(breitestesStueckEm('Limburg-Weilburg')).toBeCloseTo(Math.max(breiteEm('Limburg-'), breiteEm('Weilburg')), 5);
    expect(breitestesStueckEm('Heuchelheim an der Lahn')).toBeCloseTo(breiteEm('Heuchelheim'), 5);
  });
});

describe('h1 der lokalen Seiten', () => {
  const h1s = [
    ...getPublishedPlaces().map((place) => ({ h1: getPlacePageText(place).meta.h1, name: place.name })),
    ...getHubKreise().map((kreis) => ({ h1: getKreisPageText(kreis).meta.h1, name: kreis.name })),
    { h1: getEinsatzgebietPageText().meta.h1, name: 'Unser Einsatzgebiet:' },
  ];

  it.each(h1s.map((t) => [t.h1, t] as const))('%s: die Teile ergeben wieder die h1', (_h1, { h1, name }) => {
    const teile = titelTeilen(h1, name);
    expect([teile.vor, teile.haupt, teile.nach].filter(Boolean).join(' ')).toBe(h1);
    const html = renderToStaticMarkup(createElement(OrtTitel, { h1, name }));
    expect(html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).toBe(h1);
  });

  // Spalte des Titelblocks bei 320 px: 320 − 2 × 20 px Rand. Die Bildgröße folgt min(display, 14cqi, 96cqi / Stück).
  it.each(h1s.map((t) => [t.name, t] as const))('%s passt bei 320 px in die Spalte, ohne im Wort zu brechen', (_name, { h1, name }) => {
    const spalte = 280;
    const groesse = Math.min(0.14 * spalte, (SPALTEN_ANTEIL * spalte) / titelTeilen(h1, name).stueckEm);
    expect(titelTeilen(h1, name).stueckEm * groesse).toBeLessThanOrEqual(spalte);
  });

  it('das CSS nutzt dieselbe Rechnung (96cqi / Stück) und bricht nicht im Wort', () => {
    expect(css).toMatch(/font-size: min\(var\(--text-display\), 14cqi, calc\(96cqi \/ var\(--stueck\)\)\)/);
    expect(SPALTEN_ANTEIL).toBe(0.96);
    expect(css).toMatch(/\.titelName \{[^}]*overflow-wrap: normal/);
  });
});
