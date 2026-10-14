import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Gebietsplan, OrtPlan } from '@/components/einsatzgebiet/Plaene';
import {
  GRAPHIC_SIZE,
  KARTE_MIN_PX,
  KARTE_RANDLOS_REM,
  KARTE_SCHRIFT_SCHMAL,
  KARTE_STUFE_REM,
  LABEL_FONT_SIZE,
  LANDSCAPE_LABEL_FONT_SIZE,
  LANDSCAPE_LABEL_LAYOUT_SIZE,
  RING_LABEL_FONT_SIZE,
  RING_LABEL_LAYOUT_SIZE,
} from '../graphic';
import { RadiusGraphic } from '../RadiusGraphic';
import { radiusStatus, zoneLabel } from '../status';
import { GEBIET_MAP_DATA, gebietView } from '@/components/einsatzgebiet/karte';
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

describe('hohle Punkte: genau die Orte jenseits des gezeichneten Rings', () => {
  // Kritik 2, P1-1: Herborn (27 km Strecke, 18,9 km Luftlinie) lag hohl im 25-km-Kreis, Grävenwiesbach, Sinn, Butzbach
  // und Villmar ebenso. Hohl heißt jetzt: der Punkt liegt außerhalb des Kreises, den der Plan zeichnet.
  it.each([
    ['Startseite', data],
    ['Gebietsseite', GEBIET_MAP_DATA],
  ] as const)('%s: hohl ⇔ außerhalb des Kreises, und der Satz sagt dasselbe', (_name, mapData) => {
    for (const view of mapData.views) {
      const html = renderToStaticMarkup(createElement(RadiusGraphic, { data: mapData, view, selectedId: null, titleId: 't', descId: 'd' }));
      const hollow = new Set(
        [...html.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="4.5" class="fill-surface-raised stroke-brand"/g)].map((m) => `${m[1]},${m[2]}`),
      );
      const filled = new Set(
        [...html.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="4.5" class="fill-brand stroke-waerme"/g)].map((m) => `${m[1]},${m[2]}`),
      );
      mapData.places.forEach((place, i) => {
        const point = view.points[i];
        if (!point.inFrame || place.atCenter) return;
        const at = `${point.drawn.x},${point.drawn.y}`;
        const outsideCircle = Math.hypot(point.x - view.origin.x, point.y - view.origin.y) > view.radius;
        expect(hollow.has(at) || filled.has(at), `${view.radiusKm} km: ${place.name} gezeichnet`).toBe(true);
        expect(hollow.has(at), `${view.radiusKm} km: ${place.name}`).toBe(outsideCircle);
        expect(radiusStatus(place, view.radiusKm, mapData.radii).includes('außerhalb'), `${view.radiusKm} km: ${place.name}`).toBe(outsideCircle);
      });
    }
  });
});

describe('Ergebnis der Ortswahl', () => {
  const giessen = data.places.find((p) => p.id === 'loc-giessen')!;
  const herborn = data.places.find((p) => p.id === 'loc-herborn')!;

  it('says whether the place lies within the chosen ring, in straight-line distance like the rings', () => {
    expect(radiusStatus(giessen, 35, data.radii)).toBe('Gießen liegt in Luftlinie innerhalb von 35\u00A0km.');
    // Herborn: 24 km in der Ortsliste, rund 19 km Luftlinie, also im 25-km-Ring (Kritik 2: Karte und Satz widersprachen sich)
    expect(herborn.airKm).toBeGreaterThan(15);
    expect(herborn.airKm).toBeLessThan(25);
    expect(radiusStatus(herborn, 15, data.radii)).toBe('Herborn liegt in Luftlinie außerhalb von 15\u00A0km, aber innerhalb von 25\u00A0km.');
    expect(radiusStatus(herborn, 25, data.radii)).toBe('Herborn liegt in Luftlinie innerhalb von 25\u00A0km.');
  });

  it('names the rating from the data', () => {
    expect(zoneLabel(giessen)).toBe('Regionales Einsatzgebiet');
    expect(zoneLabel(data.places.find((p) => p.id === 'loc-nauborn')!)).toBe('Kerngebiet');
  });

  // Seit E-028 gemessen (docs/operations/orte-messung.md, OSRM): dieselben Werte wie auf der Ortsseite /einsatzgebiet/giessen.
  it('keeps the drive time and distance of Gießen as measured (19 km, 21 Min.)', () => {
    expect([giessen.distanceKm, giessen.commuteMinutes]).toEqual([19, 21]);
  });
});

describe('Schrift der Pläne gezeichnet ≥ 12 px (Prüfung E-029, Runde 2, Befund 7)', () => {
  const root = path.resolve(__dirname, '../../..');
  const lies = (datei: string) => readFileSync(path.join(root, datei), 'utf8');
  /** Gezeichnete Größe in px: Einheiten mal Breite des Plans durch die Kante des viewBox. */
  const px = (einheiten: number, breitePx: number) => (einheiten * breitePx) / GRAPHIC_SIZE;
  const REM = 16;
  // Schmalste gezeichnete Breiten bei 320 px: der Gebietsplan im Seitenkopf 280 px, der Plan randlos 320 px; ab der
  // Randlos-Stufe im Seitenrand mindestens 22rem − 2 × 20 px − 2 × 2 px Rahmen
  const GEBIETSPLAN_MIN = 280;
  const PLAN_MIN = Math.min(320, KARTE_RANDLOS_REM * REM - 2 * 20 - 2 * 2);

  it('rechnet die Größen so, dass jede Stufe auf ihrer schmalsten Breite 12 px erreicht', () => {
    expect(px(KARTE_SCHRIFT_SCHMAL, GEBIETSPLAN_MIN)).toBeGreaterThanOrEqual(KARTE_MIN_PX);
    expect(px(RING_LABEL_FONT_SIZE, KARTE_STUFE_REM * REM)).toBeGreaterThanOrEqual(KARTE_MIN_PX);
    expect(px(LANDSCAPE_LABEL_FONT_SIZE, KARTE_STUFE_REM * REM)).toBeGreaterThanOrEqual(KARTE_MIN_PX);
    // Ortsnamen: text-callout (mindestens 15 px = 15 Einheiten) auf dem schmalsten Plan
    expect(px(LABEL_FONT_SIZE, PLAN_MIN)).toBeGreaterThanOrEqual(KARTE_MIN_PX);
    // Die Anordnung rechnet mit der größeren Schrift
    expect(RING_LABEL_LAYOUT_SIZE).toBe(Math.max(RING_LABEL_FONT_SIZE, KARTE_SCHRIFT_SCHMAL));
    expect(LANDSCAPE_LABEL_LAYOUT_SIZE).toBe(Math.max(LANDSCAPE_LABEL_FONT_SIZE, KARTE_SCHRIFT_SCHMAL));
    // Vorher (13 Einheiten bei 276 px) wäre die Prüfung gescheitert
    expect(px(13, 276)).toBeLessThan(KARTE_MIN_PX);
  });

  it('die Stufen im CSS sind die aus graphic.ts', () => {
    const css = lies('app/globals.css');
    expect(css).toMatch(/@utility karte-rahmen \{\s*container: karte \/ inline-size;\s*\}/);
    const fein = css.match(/@utility karte-fein \{([\s\S]*?)\n\}/)![1];
    expect(fein).toContain(`@container karte (min-width: ${KARTE_STUFE_REM}rem)`);
    expect(fein).toContain(`font-size: ${RING_LABEL_FONT_SIZE}px;`);
    expect(RING_LABEL_FONT_SIZE).toBe(LANDSCAPE_LABEL_FONT_SIZE);
    // Randlos unter 22rem: Startseite und Gebietsseite (RegionExplorer), Ortsseiten und Kreis-Hubs (OrtPlan)
    const explorer = lies('components/maps/RegionExplorer.tsx');
    for (const klasse of ['-mx-gutter', 'box-content', 'w-auto', 'border-x-0']) expect(explorer).toContain(`max-[${KARTE_RANDLOS_REM}rem]:${klasse}`);
    const modul = lies('components/einsatzgebiet/einsatzgebiet.module.css');
    const randlos = modul.match(new RegExp(`@media \\(max-width: ${KARTE_RANDLOS_REM - 0.01}em\\) \\{\\s*\\.planRahmen \\{([^}]*)\\}`))![1];
    expect(randlos).toContain('margin-inline: calc(-1 * var(--spacing-gutter));');
    expect(randlos).toContain('box-sizing: content-box;');
    expect(randlos).toContain('border-inline-width: 0;');
  });

  it('Ring- und Landschaftsnamen tragen 16 Einheiten und die Stufe, die Ortsnamen die Textstufen', () => {
    const html = render(35, 'loc-herborn');
    const texte = [...html.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)];
    expect(texte.length).toBeGreaterThan(8);
    for (const [, attribute, inhalt] of texte) {
      if (/km$/.test(inhalt) || ['Lahn', 'Dill', 'A45', 'B49'].includes(inhalt)) {
        expect(attribute, inhalt).toContain(`font-size="${KARTE_SCHRIFT_SCHMAL}"`);
        expect(attribute, inhalt).toMatch(/class="karte-fein /);
      } else {
        expect(attribute, inhalt).toMatch(/class="[^"]*text-callout sm:text-footnote/);
        expect(attribute, inhalt).not.toContain('font-size=');
      }
    }
  });

  it('OrtPlan und Gebietsplan sind Container `karte`, die Ringwerte des Gebietsplans in 16 Einheiten', () => {
    const view = gebietView(GEBIET_MAP_DATA.radiusKm);
    const ort = renderToStaticMarkup(createElement(OrtPlan, { view, emphasizeIds: [], id: 'o', beschreibung: 'Plan' }));
    expect(ort).toMatch(/<div class="[^"]*karte-rahmen" data-karte-rahmen="">/);
    const kopf = renderToStaticMarkup(createElement(Gebietsplan, { titel: 'Gebietsplan' }));
    expect(kopf).toMatch(/^<div class="[^"]*karte-rahmen" data-karte-rahmen=""><svg /);
    const werte = [...kopf.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)];
    expect(werte.map(([, , text]) => text)).toEqual(['15\u00A0km', '25\u00A0km', '35\u00A0km']);
    for (const [, attribute] of werte) {
      expect(attribute).toContain(`font-size="${KARTE_SCHRIFT_SCHMAL}"`);
      expect(attribute).toMatch(/class="[^"]* karte-fein"/);
    }
  });
});
