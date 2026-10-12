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

/** Gebietsseite (E-028): alle gemessenen Orte, darum eine Auswahlliste statt Kärtchen; die Startseite bleibt bei 10. */
describe('RegionExplorer mit allen Orten', () => {
  it('shows a select (alphabetical, with distance and drive time) above MAX_PLACE_CARDS places, no table when asked', async () => {
    const { GEBIET_MAP_DATA } = await import('@/components/einsatzgebiet/karte');
    const { MAX_PLACE_CARDS } = await import('../RegionExplorer');
    expect(GEBIET_MAP_DATA.places.length).toBeGreaterThan(MAX_PLACE_CARDS);
    const html = renderToStaticMarkup(createElement(RegionExplorer, { data: GEBIET_MAP_DATA, mapsAvailable: false, table: false }));
    expect(html).toMatch(/<select[^>]*\bdisabled\b/);
    expect(html.match(/<option /g)).toHaveLength(GEBIET_MAP_DATA.places.length + 1);
    expect(html).not.toContain('Alle Orte als Tabelle');
    expect(html).not.toContain('Interaktive Karte laden');
    for (const place of GEBIET_MAP_DATA.places) expect(place.href).toMatch(/^\/einsatzgebiet\/[a-z0-9-]+$/);
  });

  it('keeps the home map at 10 places with cards, each with its place page', () => {
    const home = buildRegionMapData();
    expect(home.places).toHaveLength(10);
    const html = renderToStaticMarkup(createElement(RegionExplorer, { data: home, mapsAvailable: true }));
    expect(html).not.toContain('<select');
    for (const place of home.places) expect(place.href).toMatch(/^\/einsatzgebiet\/[a-z0-9-]+$/);
  });
});
