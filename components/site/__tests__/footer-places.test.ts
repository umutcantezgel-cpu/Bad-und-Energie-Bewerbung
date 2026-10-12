import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getPublishedPlaces } from '@/lib/places/registry';
import { REGION } from '@/lib/content/region';
import { FooterPlaces, footerPlaceHref, footerPlaces } from '../FooterPlaces';

describe('FooterPlaces (E-SHELL-021)', () => {
  const html = renderToStaticMarkup(createElement(FooterPlaces));

  it('names the nearby towns of the old footer list, Wetzlar first as the head office', () => {
    const places = footerPlaces();
    expect(places[0]).toBe(REGION.center.name);
    for (const name of ['Wetzlar', 'Gießen', 'Aßlar', 'Solms', 'Hüttenberg', 'Lahnau', 'Ehringshausen', 'Braunfels']) {
      expect(places).toContain(name);
      expect(html).toContain(name);
    }
    expect(html).toContain('(Firmensitz)');
  });

  it('lists Wetzlar and the towns under 20 km by road, from the published places, once each, without the districts', () => {
    const places = footerPlaces();
    expect(new Set(places).size).toBe(places.length);
    expect(places[0]).toBe('Wetzlar');
    const published = getPublishedPlaces();
    for (const name of places.slice(1)) {
      const place = published.find((p) => p.name === name)!;
      expect(place.kind, name).toBe('gemeinde');
      expect(place.commute.distanceKm, name).toBeLessThan(20);
    }
    for (const district of ['Hermannstein', 'Nauborn', 'Garbenheim', 'Steindorf', 'Dutenhofen', 'Münchholzhausen']) {
      expect(places).not.toContain(district);
    }
    // Dillenburg (38 km Straße, ohne Seite) stand bis 2026-10-12 als bloßer Text in der Liste
    expect(html).not.toContain('Dillenburg');
  });

  it('links to distance and drive time on the Einsatzgebiet page (E-028), with a named region', () => {
    expect(html).toContain('href="/einsatzgebiet"');
    expect(html).not.toContain('href="/#einsatzgebiet"');
    expect(html).toContain('aria-labelledby="footer-einsatzgebiet"');
    expect(html).toContain('id="footer-einsatzgebiet"');
  });

  it('links every place with its own page', () => {
    for (const name of footerPlaces()) {
      const href = footerPlaceHref(name);
      expect(href, name).toMatch(/^\/einsatzgebiet\/[a-z0-9-]+$/);
      expect(html).toContain(`href="${href}"`);
    }
    expect(footerPlaceHref('Heuchelheim')).toBe('/einsatzgebiet/heuchelheim-an-der-lahn');
  });

  it('repeats no radius figure (35 km stays in the hero and the section)', () => {
    expect(html).not.toMatch(/\d+\s?km/);
  });
});
