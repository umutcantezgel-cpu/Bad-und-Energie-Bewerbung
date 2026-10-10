import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RegionExplorer } from '../RegionExplorer';
import { buildRegionMapData } from '../views';

/**
 * Das Server-HTML ist der Zustand ohne JavaScript (E-START-039, Befund R3-HOME-03 „ohne JS kein Widerspruch“):
 * Umschalter und Ortskärtchen sind gesperrt, das Ergebnis fordert nicht zu einer Wahl auf, die nichts bewirkt.
 */
describe('RegionExplorer ohne JavaScript', () => {
  const data = buildRegionMapData();
  const html = renderToStaticMarkup(createElement(RegionExplorer, { data, mapsAvailable: true }));

  it('disables the radius switch and the place cards until the page runs', () => {
    expect(html.match(/<fieldset[^>]*\bdisabled\b/g)).toHaveLength(2);
    expect(html).toMatch(/<button[^>]*\bdisabled\b[^>]*>[\s\S]*?Interaktive Karte laden/);
  });

  it('keeps the default radius checked, so switch and plan agree', () => {
    const checked = [...html.matchAll(/<input[^>]*type="radio"[^>]*>/g)].map((m) => m[0]).filter((tag) => /\bchecked\b/.test(tag));
    expect(checked).toHaveLength(1);
    expect(checked[0]).toContain(`value="${data.radiusKm}"`);
  });

  it('says where distance and drive time stand instead of asking for a choice', () => {
    expect(html).toContain('stehen bei jedem Ort');
    expect(html).not.toContain('Wähle deinen Ort');
  });

  it('names the radii in the caption only by their reading (E-023: no repeated „35 km“)', () => {
    const caption = html.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1] ?? '';
    expect(caption).toContain('Luftlinie');
    expect(caption).not.toMatch(/\d+\s?km/);
  });
});
