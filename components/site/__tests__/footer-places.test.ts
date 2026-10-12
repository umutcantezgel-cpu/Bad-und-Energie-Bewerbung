import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { REGION } from '@/lib/content/region';
import { EINSATZGEBIET_PATH, getHubKreise, getKreise, getPublishedPlaces, kreisPath, placePath } from '@/lib/places/registry';
import { FooterPlaces, footerGebietZeile, footerKreisGruppen, footerPlaceHref, footerPlaceList, footerPlaces } from '../FooterPlaces';

const html = renderToStaticMarkup(createElement(FooterPlaces));
const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const count = (href: string) => hrefs.filter((h) => h === href).length;
/** Zahl und Wort mit geschütztem Leerzeichen (DIN 5008). */
const NBSP = '\u00a0';

describe('FooterPlaces (E-SHELL-021, E-028): alle Orte nach Kreis', () => {
  it('lists every published place exactly once, with its own page', () => {
    const published = getPublishedPlaces();
    const list = footerPlaceList();
    expect(list).toHaveLength(published.length);
    expect(new Set(list.map((place) => place.id)).size).toBe(published.length);
    for (const place of published) {
      expect(count(placePath(place)), place.name).toBe(1);
    }
    // Nur Orte und Kreise unter /einsatzgebiet, dazu der Weg zur Gebietsseite
    for (const href of hrefs) expect(href.startsWith(EINSATZGEBIET_PATH), href).toBe(true);
  });

  it('groups the places by Kreis: hubs first, every Kreis with its link and the number of places', () => {
    const gruppen = footerKreisGruppen();
    const kreise = getKreise();
    expect(gruppen.map((g) => g.kreis.id).sort()).toEqual(kreise.map((k) => k.id).sort());
    const hubs = getHubKreise().map((k) => k.id);
    expect(gruppen.slice(0, hubs.length).map((g) => g.kreis.id)).toEqual(hubs);
    for (const { kreis, href, gruppen: orte, breit } of gruppen) {
      expect(href).toBe(kreisPath(kreis));
      expect(breit).toBe(kreis.hasHub);
      expect(orte.flatMap((g) => g.places).length, kreis.name).toBe(kreis.placeCount);
      expect(count(href), kreis.name).toBe(1);
      expect(html).toContain(`>${kreis.shortName}</span>`);
      expect(html).toContain(`${kreis.placeCount}${NBSP}${kreis.placeCount === 1 ? 'Ort' : 'Orte'}`);
    }
    // Kreise ohne eigene Seite verweisen auf ihren Abschnitt der Gebietsseite
    for (const kreis of kreise.filter((k) => !k.hasHub)) expect(hrefs).toContain(`${EINSATZGEBIET_PATH}#${kreis.slug}`);
    for (const kreis of getHubKreise()) expect(hrefs).toContain(`${EINSATZGEBIET_PATH}/${kreis.slug}`);
  });

  it('puts the head office first, then the towns A–Z, the districts of Wetzlar as their own group', () => {
    const places = footerPlaces();
    expect(places[0]).toBe(REGION.center.name);
    expect(html).toContain('(Firmensitz)');
    const ldk = footerKreisGruppen()[0];
    const [orte, stadtteile] = ldk.gruppen;
    expect(orte.etikett).toBeNull();
    expect(orte.places.slice(1).map((p) => p.name)).toEqual(
      orte.places
        .slice(1)
        .map((p) => p.name)
        .sort((a, b) => a.localeCompare(b, 'de')),
    );
    expect(stadtteile.etikett).toBe('Stadtteile von Wetzlar');
    for (const name of ['Hermannstein', 'Nauborn', 'Garbenheim', 'Steindorf', 'Dutenhofen', 'Münchholzhausen']) {
      expect(stadtteile.places.map((p) => p.name)).toContain(name);
    }
    for (const place of stadtteile.places) expect(place.kind).toBe('stadtteil');
  });

  it('names the nearby towns of the old footer list and links them', () => {
    for (const name of ['Wetzlar', 'Gießen', 'Aßlar', 'Solms', 'Hüttenberg', 'Lahnau', 'Ehringshausen', 'Braunfels']) {
      expect(footerPlaces()).toContain(name);
      expect(html).toContain(`href="${footerPlaceHref(name)}"`);
    }
    expect(footerPlaceHref('Heuchelheim')).toBe('/einsatzgebiet/heuchelheim-an-der-lahn');
    // Dillenburg (38 km Straße) hat keine Seite
    expect(html).not.toContain('Dillenburg');
  });

  it('links to distance and drive time on the Einsatzgebiet page, with a named region and counts from the registry', () => {
    expect(count(EINSATZGEBIET_PATH)).toBe(1);
    expect(html).not.toContain('href="/#einsatzgebiet"');
    expect(html).toContain('aria-labelledby="footer-einsatzgebiet"');
    expect(html).toContain('id="footer-einsatzgebiet"');
    expect(footerGebietZeile()).toBe(
      `${getPublishedPlaces().length}${NBSP}Orte in ${getKreise().length}${NBSP}Kreisen, jeder Ort mit eigener Seite.`,
    );
  });

  it('has one link per place and Kreis plus the way to the Einsatzgebiet page, none of them prefetched on sight', () => {
    expect(hrefs.length).toBe(getPublishedPlaces().length + getKreise().length + 1);
    // next/link schreibt prefetch nicht ins HTML: Die Quelle sichert, dass rund 60 Links beim Erscheinen des Fußes
    // nicht je eine Seite vorladen.
    const quelle = readFileSync(path.resolve(__dirname, '../FooterPlaces.tsx'), 'utf8');
    expect(quelle.match(/prefetch=\{false\}/g)).toHaveLength(2);
  });

  it('repeats no radius figure (35 km stays in the hero and the section)', () => {
    expect(html).not.toMatch(/\d+\s?km/);
  });
});
