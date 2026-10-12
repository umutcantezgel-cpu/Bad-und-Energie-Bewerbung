import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { COMPANY } from '@/lib/content/company';
import { REGION } from '@/lib/content/region';
import { ALLE_ORTE_LINK, ORT_FEHLT, ROUTE_LABEL, WERKSTATT, headlineSaetze, routeUrl, weitereOrte, weitereOrteMitSeite } from '../gebiet/gebiet-text';
import { WeitereOrte } from '../gebiet/WeitereOrte';
import { Werkstatt } from '../gebiet/Werkstatt';

describe('Werkstatt (E-START-030, E-START-040)', () => {
  const html = renderToStaticMarkup(createElement(Werkstatt));

  it('shows the workshop with address and „Material direkt am Lager einladen“', () => {
    // „Werkstatt“ ist nicht belegt (fakten-abgleich B31): der belegte Wortlaut
    expect(html).toContain('Firmensitz &amp; Lager');
    expect(html).not.toContain('Werkstatt');
    expect(html).toContain(COMPANY.address.street);
    expect(html).toContain(COMPANY.address.postalCode);
    expect(html).toContain('Material direkt am Lager einladen');
    expect(WERKSTATT.city).toBe(COMPANY.address.city);
  });

  it('names no unconfirmed brands or partners (B15) and no unbacked connection badge', () => {
    for (const name of ['ELEMENTS', 'VIGOUR', 'Kermi', 'Keuco', 'Geberit', 'Optimal angebunden']) expect(html).not.toContain(name);
  });

  it('links the route as a plain link: new tab, no referrer, target coordinates, no tracking', () => {
    const url = routeUrl();
    // Ortsseiten geben den Messpunkt als Start mit (E-028)
    expect(routeUrl(COMPANY.geo, { latitude: 50.68324, longitude: 8.30313 })).toBe(
      `https://www.google.com/maps/dir/?api=1&origin=50.68324,8.30313&destination=${COMPANY.geo.latitude},${COMPANY.geo.longitude}`,
    );
    expect(url).toBe(`https://www.google.com/maps/dir/?api=1&destination=${COMPANY.geo.latitude},${COMPANY.geo.longitude}`);
    expect(url).not.toMatch(/utm_|gclid|fbclid/);
    const link = html.match(/<a [^>]*href="https:\/\/www\.google\.com\/maps\/dir\/[^"]*"[^>]*>/)?.[0] ?? '';
    expect(link).toContain('target="_blank"');
    expect(link).toMatch(/rel="[^"]*noopener[^"]*"/);
    expect(link).toMatch(/rel="[^"]*noreferrer[^"]*"/);
    expect(html).toContain(ROUTE_LABEL);
    expect(ROUTE_LABEL).toBe('Route in Google Maps öffnen');
  });

  it('loads nothing from Google before the click (no script, iframe or image)', () => {
    expect(html).not.toMatch(/<(script|iframe|img)\b/);
  });
});

describe('Weitere Orte (E-START-029)', () => {
  const html = renderToStaticMarkup(createElement(WeitereOrte));

  it('names the places of the old pills that have no table row', () => {
    for (const name of ['Solms', 'Lahnau', 'Hüttenberg', 'Biebertal', 'Wettenberg', 'Ehringshausen']) expect(html).toContain(name);
  });

  it('does not name Hohenahr (not in REGION.areas; it has its own page under /einsatzgebiet)', () => {
    expect(html).not.toContain('Hohenahr');
  });

  it('takes only places from REGION.areas, without duplicates and without the table places', () => {
    const orte = weitereOrte();
    const areaCities = new Set(REGION.areas.flatMap((a) => a.cities));
    expect(new Set(orte).size).toBe(orte.length);
    for (const name of orte) expect(areaCities.has(name)).toBe(true);
    for (const location of REGION.locations) expect(orte).not.toContain(location.name);
    expect(orte).not.toContain('Wetzlar');
  });

  it('offers the phone line for places that are missing', () => {
    expect(html).toContain(ORT_FEHLT.question);
    expect(html).toContain(`href="${COMPANY.phone.href}"`);
  });

  it('gives the phone link a target of at least 44 px (K-011)', () => {
    const link = html.match(/<a [^>]*href="tel:[^"]*"[^>]*>/)?.[0] ?? '';
    expect(link).toMatch(/\bmin-h-11\b/);
    expect(link).toMatch(/\binline-flex\b/);
  });

  it('ends no wrapped line with a separator: each place carries its dot in front', () => {
    expect(html).not.toContain('·');
    expect(html.match(/rounded-full bg-brand/g)).toHaveLength(weitereOrte().length);
  });

  // E-028: Orte mit eigener Seite sind Links dorthin (Strecke und Fahrzeit stehen dort), dazu der Weg zur Gebietsseite.
  it('links every place to its own page (Dillenburg, 38 km by road, is gone since 2026-10-12)', () => {
    const orte = weitereOrteMitSeite();
    expect(orte.map((o) => o.name)).toEqual(weitereOrte());
    for (const ort of orte) {
      expect(ort.href, ort.name).toBeDefined();
      expect(html).toContain(`href="${ort.href}"`);
    }
    expect(weitereOrte()).not.toContain('Dillenburg');
    expect(orte.find((o) => o.name === 'Heuchelheim')?.href).toBe('/einsatzgebiet/heuchelheim-an-der-lahn');
  });

  it('links „Alle Orte im Einsatzgebiet“ to /einsatzgebiet, place links with a target of at least 44 px', () => {
    expect(ALLE_ORTE_LINK).toEqual({ href: '/einsatzgebiet', label: 'Alle Orte im Einsatzgebiet' });
    expect(html).toContain('href="/einsatzgebiet"');
    expect(html).toContain('Alle Orte im Einsatzgebiet');
    for (const link of html.match(/<a [^>]*href="\/einsatzgebiet\/[^"]+"[^>]*>/g) ?? []) expect(link).toMatch(/\bmin-h-11\b/);
  });
});

describe('Überschrift satzweise', () => {
  it('splits REGION.headline into its two sentences without changing the wording', () => {
    expect(headlineSaetze()).toEqual(['35 km um Wetzlar.', 'Keine Fernmontage.']);
    expect(headlineSaetze().join(' ')).toBe(REGION.headline);
  });
});
