import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RadiusGraphic } from '../RadiusGraphic';
import { radiusStatus, zoneLabel } from '../status';
import { buildRegionMapData } from '../views';

const data = buildRegionMapData();
const render = (radiusKm: number, selectedId: string | null) =>
  renderToStaticMarkup(
    createElement(RadiusGraphic, {
      data,
      view: data.views[data.radii.indexOf(radiusKm)],
      selectedId,
      titleId: 't',
      descId: 'd',
    }),
  );

describe('RadiusGraphic', () => {
  it('is one labelled image that says „Luftlinie“ and „schematisch“', () => {
    const html = render(35, null);
    expect(html.match(/<svg/g)).toHaveLength(1);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-labelledby="t d"');
    expect(html).toMatch(/<title id="t">[^<]*Luftlinie/);
    expect(html).toMatch(/<desc id="d">[^<]*schematisch/);
  });

  it('draws the rings 15, 25 and 35 km and the four landscape lines without external requests', () => {
    const html = render(35, null);
    for (const km of [15, 25, 35]) expect(html).toContain(`${km} km`);
    for (const name of ['Lahn', 'Dill', 'A45', 'B49']) expect(html).toContain(name);
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).not.toMatch(/<image\b/);
  });

  it('shows the Pendel (red Vorlauf, blue Rücklauf) only for a chosen place, and red only as a line', () => {
    expect(render(35, null)).not.toContain('stroke-vorlauf');
    const html = render(35, 'loc-giessen');
    expect(html).toContain('stroke-vorlauf');
    expect(html).toContain('stroke-ruecklauf');
    expect(html).not.toMatch(/fill-(vorlauf|accent)/);
  });

  it('does not repeat the promise in title and description (E-023: 35 km stands in the heading and at the ring)', () => {
    const html = render(35, null);
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? '';
    const desc = html.match(/<desc[^>]*>([^<]*)<\/desc>/)?.[1] ?? '';
    expect(`${title} ${desc}`).not.toMatch(/35\s?km/);
    // A zoomed view says which section it shows, without calling 15 km the service area.
    expect(render(15, null)).toMatch(/<desc[^>]*>[^<]*Ausschnitt: 15 km um Wetzlar/);
    expect(render(15, null)).not.toMatch(/<title[^>]*>[^<]*15 km/);
  });

  it('draws the landscape names below the Pendel, so their halo never cuts Vorlauf or Rücklauf', () => {
    const html = render(15, 'loc-herborn');
    expect(html.indexOf('>A45<')).toBeGreaterThan(-1);
    expect(html.indexOf('>A45<')).toBeLessThan(html.indexOf('stroke-vorlauf'));
  });

  it('carries no motion of its own (switching changes the view at once)', () => {
    expect(render(15, 'loc-giessen')).not.toMatch(/data-motion|animate-|transition/);
  });
});

describe('Ergebnis der Ortswahl', () => {
  const giessen = data.places.find((p) => p.id === 'loc-giessen')!;
  const herborn = data.places.find((p) => p.id === 'loc-herborn')!;

  it('says whether the place lies within the chosen radius', () => {
    expect(radiusStatus(giessen, 35, data.radii)).toBe('Gießen liegt innerhalb von 35 km.');
    expect(radiusStatus(herborn, 15, data.radii)).toBe('Herborn liegt außerhalb von 15 km, aber innerhalb von 25 km.');
  });

  it('names the rating from the data', () => {
    expect(zoneLabel(giessen)).toBe('Regionales Einsatzgebiet');
    expect(zoneLabel(data.places.find((p) => p.id === 'loc-nauborn')!)).toBe('Kerngebiet');
  });

  it('keeps the drive time and distance of Gießen as in the table (15 km, 16 Min.)', () => {
    expect([giessen.distanceKm, giessen.commuteMinutes]).toEqual([15, 16]);
  });
});
