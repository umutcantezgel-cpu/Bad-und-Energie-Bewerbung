import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { REGION } from '@/lib/content/region';
import { FooterPlaces, footerPlaces } from '../FooterPlaces';

describe('FooterPlaces (E-SHELL-021)', () => {
  const html = renderToStaticMarkup(createElement(FooterPlaces));

  it('names all nine places of the old footer list, Wetzlar first as the head office', () => {
    const places = footerPlaces();
    expect(places[0]).toBe(REGION.center.name);
    for (const name of ['Wetzlar', 'Gießen', 'Aßlar', 'Solms', 'Hüttenberg', 'Lahnau', 'Ehringshausen', 'Wettenberg', 'Braunfels']) {
      expect(places).toContain(name);
      expect(html).toContain(name);
    }
    expect(html).toContain('(Firmensitz)');
  });

  it('lists only places from REGION.areas, once each, without the Wetzlar districts and without Hohenahr', () => {
    const places = footerPlaces();
    expect(new Set(places).size).toBe(places.length);
    const areaCities = new Set(REGION.areas.flatMap((a) => a.cities));
    for (const name of places) expect(areaCities.has(name)).toBe(true);
    for (const district of ['Hermannstein', 'Nauborn', 'Garbenheim', 'Steindorf', 'Dutenhofen', 'Münchholzhausen']) {
      expect(places).not.toContain(district);
    }
    expect(html).not.toContain('Hohenahr');
  });

  it('links to distance and drive time on the home page, with a named region', () => {
    expect(html).toContain('href="/#einsatzgebiet"');
    expect(html).toContain('aria-labelledby="footer-einsatzgebiet"');
    expect(html).toContain('id="footer-einsatzgebiet"');
  });

  it('repeats no radius figure (35 km stays in the hero and the section)', () => {
    expect(html).not.toMatch(/\d+\s?km/);
  });
});
