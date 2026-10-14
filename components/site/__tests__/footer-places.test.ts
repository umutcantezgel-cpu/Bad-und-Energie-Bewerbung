import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EINSATZGEBIET_PATH, getHubKreise, getKreise, getPublishedPlaces, kreisPath, placePath } from '@/lib/places/registry';
import { EINSATZGEBIET_LINK_LABEL } from '@/lib/places/text';
import { FOOTER_GEBIET_LINK, FooterPlaces, footerGebietZeile, footerKreisHubs } from '../FooterPlaces';
import { kopfUntermenues } from '../kopf/kopf-daten';

const html = renderToStaticMarkup(createElement(FooterPlaces));
const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const count = (href: string) => hrefs.filter((h) => h === href).length;
/** Zahl und Wort mit geschütztem Leerzeichen (DIN 5008). */
const NBSP = '\u00a0';
/** Sichtbarer Text eines Links, wie ihn Screenreader als Namen lesen. */
const linkTexte = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({
  href: m[1],
  // Nur gewöhnliche Leerräume zusammenfassen: Das geschützte Leerzeichen in „26 Orte“ bleibt stehen
  text: m[2].replace(/<[^>]+>/g, '').replace(/[ \t\n]+/g, ' ').trim(),
}));

describe('FooterPlaces (E-SHELL-021, E-029): Kreis-Hubs und „Alle Orte im Einsatzgebiet“ statt 54 Ortslinks', () => {
  it('verlinkt keine einzelne Ortsseite mehr (Plan §B: kein Linkblock mit allen Orten in jedem Fuß)', () => {
    for (const place of getPublishedPlaces()) expect(count(placePath(place)), place.slug).toBe(0);
    // Nur Kreis-Hubs und die Gebietsseite, alles unter /einsatzgebiet
    for (const href of hrefs) expect(href.startsWith(EINSATZGEBIET_PATH), href).toBe(true);
  });

  it('verlinkt jeden Kreis-Hub genau einmal, in der Reihenfolge des Kopfs, mit der Zahl seiner Orte im Link', () => {
    const hubs = getHubKreise();
    expect(hubs.length).toBeGreaterThan(0);
    expect(footerKreisHubs().map((h) => h.kreis.id)).toEqual(hubs.map((k) => k.id));
    // Dieselben Wege wie das Untermenü „Einsatzgebiet“ im Kopf: ein Ankertext, ein Ziel
    const kopf = kopfUntermenues().find((menue) => menue.id === 'einsatzgebiet')!;
    expect(footerKreisHubs().map(({ href, kreis, mass }) => ({ href, label: kreis.shortName, mass }))).toEqual(kopf.wege);
    for (const { kreis, href, mass } of footerKreisHubs()) {
      expect(href).toBe(kreisPath(kreis));
      expect(count(href), kreis.name).toBe(1);
      expect(mass).toBe(`${kreis.placeCount}${NBSP}${kreis.placeCount === 1 ? 'Ort' : 'Orte'}`);
      const link = linkTexte.find((l) => l.href === href)!;
      expect(link.text, kreis.name).toBe(`${kreis.shortName} ${mass}`);
    }
    // Kreise ohne eigene Seite stehen nur auf der Gebietsseite (kein Sprung #kreis aus dem Fuß)
    for (const kreis of getKreise().filter((k) => !k.hasHub)) {
      expect(hrefs).not.toContain(kreisPath(kreis));
      expect(html).not.toContain(`>${kreis.shortName}<`);
    }
  });

  it('führt mit „Alle Orte im Einsatzgebiet“ zur Gebietsseite, derselbe Ankertext wie auf Startseite und Hubs', () => {
    expect(FOOTER_GEBIET_LINK).toEqual({ href: EINSATZGEBIET_PATH, label: EINSATZGEBIET_LINK_LABEL });
    expect(EINSATZGEBIET_LINK_LABEL).toBe('Alle Orte im Einsatzgebiet');
    expect(count(EINSATZGEBIET_PATH)).toBe(1);
    expect(linkTexte.find((l) => l.href === EINSATZGEBIET_PATH)?.text).toBe(EINSATZGEBIET_LINK_LABEL);
    expect(html).not.toContain('href="/#einsatzgebiet"');
    expect(html).toContain('aria-labelledby="footer-einsatzgebiet"');
    expect(html).toContain('id="footer-einsatzgebiet"');
    expect(footerGebietZeile()).toBe(
      `${getPublishedPlaces().length}${NBSP}Orte in ${getKreise().length}${NBSP}Kreisen, jeder Ort mit eigener Seite.`,
    );
  });

  it('hat genau einen Link je Kreis-Hub und den Weg zur Gebietsseite, keiner beim Erscheinen vorgeladen', () => {
    expect(hrefs.length).toBe(getHubKreise().length + 1);
    // next/link schreibt prefetch nicht ins HTML: Die Quelle sichert, dass die Hub-Links nicht beim Erscheinen des Fußes
    // vorladen (der Weg zur Gebietsseite ist ein FussLink wie „Alle Stellen“).
    const quelle = readFileSync(path.resolve(__dirname, '../FooterPlaces.tsx'), 'utf8');
    expect(quelle.match(/prefetch=\{false\}/g)).toHaveLength(1);
  });

  it('jeder Weg ist mindestens 44 × 44 px groß (Hub-Link und FussLink mit --m-ziel)', () => {
    const css = readFileSync(path.resolve(__dirname, '../fuss/fuss.module.css'), 'utf8');
    const regel = (name: string) => new RegExp(`\\n\\.${name} \\{([^}]*)\\}`).exec(css)?.[1] ?? '';
    expect(regel('kreisLink')).toContain('min-height: var(--m-ziel);');
    expect(regel('kreisLink')).toContain('min-width: var(--m-ziel);');
    expect(regel('link')).toContain('min-height: var(--m-ziel);');
    // Die ganze Fläche aus Name und Zahl ist der Link, nicht nur der Name
    const hubLinks = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].filter((m) => /class="[^"]*kreisLink/.test(m[1]));
    expect(hubLinks).toHaveLength(getHubKreise().length);
    for (const [, , inhalt] of hubLinks) expect(inhalt).toMatch(/kreisName[\s\S]*kreisMass/);
  });

  it('repeats no radius figure (35 km stays in the hero and the section)', () => {
    expect(html).not.toMatch(/\d+\s?km/);
  });
});
