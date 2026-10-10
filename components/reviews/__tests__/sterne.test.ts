import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Rating } from '@/components/ui/Rating';
import { googleCustomerReviews } from '@/lib/data/reviews.data';
import { ReviewCarousel } from '../ReviewCarousel';
import { STERNE_MAX, STERN_PFAD, SternVorrat, VolleSterne, istVolleWertung } from '../Sterne';

const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;
/** Attribute des äußeren <svg> (ohne Kinder). */
const svgKopf = (html: string) => html.match(/<svg role="img"[^>]*>/)![0];

describe('Sterne aus dem Vorrat (V6-A3-VITALS, DOM-Größe)', () => {
  it('zeichnet denselben Umriss wie <Rating> (components/ui/Rating.tsx)', () => {
    const rating = readFileSync(path.resolve(__dirname, '../../ui/Rating.tsx'), 'utf8');
    const original = rating.match(/const STAR_PATH =\s*'([^']+)'/)![1];
    expect(STERN_PFAD).toBe(original);
  });

  it('gleicht <Rating value={5} size="sm"> in Maßen, Strich und Ansage', () => {
    const vorrat = renderToStaticMarkup(createElement(VolleSterne, { vorrat: 'r' }));
    const rating = renderToStaticMarkup(createElement(Rating, { value: STERNE_MAX, size: 'sm' }));
    expect(svgKopf(vorrat)).toBe(svgKopf(rating));
    expect(vorrat).toContain('aria-label="5,0 von 5 Sternen"');
    expect(vorrat).toBe('<svg role="img" aria-label="5,0 von 5 Sternen" viewBox="0 0 132 24" width="88" height="16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><use href="#r-voll" class="fill-brand stroke-brand"></use></svg>');
    // Rating setzt fünf volle Sterne im Abstand von 27 Einheiten; der Vorrat genauso
    const xs = [...rating.matchAll(/<use href="[^"]+" x="(\d+)"/g)].map((m) => Number(m[1]));
    const vorratXs = [...renderToStaticMarkup(createElement(SternVorrat, { id: 'r' })).matchAll(/<use href="#r-stern" x="(\d+)"/g)].map((m) => Number(m[1]));
    expect(vorratXs).toEqual(xs);
  });

  it('der Vorrat steht außerhalb des Flusses und ist für Screenreader unsichtbar', () => {
    const html = renderToStaticMarkup(createElement(SternVorrat, { id: 'r' }));
    expect(html).toMatch(/^<svg width="0" height="0" aria-hidden="true" focusable="false" class="absolute"><defs><path id="r-stern"/);
    expect(count(html, /<path\b/g)).toBe(1);
  });

  it('nur die volle Wertung kommt aus dem Vorrat; Teilwertungen zeichnet weiter <Rating>', () => {
    expect(istVolleWertung(5)).toBe(true);
    expect(istVolleWertung(4.5)).toBe(false);
    expect(istVolleWertung(4)).toBe(false);
  });

  it('die Reihe trägt einen Vorrat und je Kundenstimme ein SVG mit einem <use>', () => {
    const html = renderToStaticMarkup(createElement(ReviewCarousel, { initialFilter: 'alle' }));
    const voll = googleCustomerReviews.filter((r) => r.rating === STERNE_MAX).length;
    expect(voll).toBe(googleCustomerReviews.length);
    expect(count(html, /<defs>/g)).toBe(1);
    expect(count(html, /aria-label="5,0 von 5 Sternen"/g)).toBe(voll);
    expect(count(html, /<use href="#[^"]+-voll" class="fill-brand stroke-brand">/g)).toBe(voll);
    // Umriss einmal statt je Karte
    expect(count(html, new RegExp(STERN_PFAD.slice(0, 20).replace(/[.]/g, '\\.'), 'g'))).toBe(1);
  });
});
