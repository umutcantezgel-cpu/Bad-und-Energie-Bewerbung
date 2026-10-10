import { layoutLabels, type Box } from '@/lib/maps/labels';
import type { LatLng, RadiusProjection, SvgPoint } from '@/lib/maps/projection';
import { LANDSCAPE_LABEL_FONT_SIZE, octilinearChain, pathData } from './graphic';
import type { LandscapeId, LandscapeLine } from './types';

/**
 * Landschaft der Radiusgrafik (E-START-036): Lahn, Dill, A45 und B49 als Schema, nicht als Karte.
 *
 * Jede Linie läuft durch wenige Stützpunkte (Orte, durch die Fluss oder Straße führen, auf rund
 * 0,01° gerundet) und wird zwischen ihnen nur unter 0°, 45° und 90° geführt (Formsystem K-010,
 * wie eine Leitung). So liest sich die Ebene als Plan und nicht als geokorrekte Handskizze; die
 * Bildunterschrift sagt „schematisch“. Keine fremden Geodaten, keine Lizenzfrage (Pass E-START-036,
 * Freiraum: geokorrekte Verläufe erst mit geklärter Quelle). Liegt unter den Ortspunkten, aria-hidden.
 */

export interface LandscapeSource {
  id: LandscapeId;
  kind: 'fluss' | 'strasse';
  /** Beschriftung an der Linie. */
  name: string;
  /** Stützpunkte von außen nach außen; die Enden liegen außerhalb des 35-km-Rahmens. */
  anchors: readonly LatLng[];
}

export const LANDSCAPE: readonly LandscapeSource[] = [
  {
    id: 'lahn',
    kind: 'fluss',
    name: 'Lahn',
    // von Norden über Lollar und Gießen nach Westen durch Wetzlar, Solms und Leun Richtung Weilburg
    anchors: [
      { lat: 50.85, lng: 8.75 },
      { lat: 50.65, lng: 8.7 },
      { lat: 50.58, lng: 8.67 },
      { lat: 50.56, lng: 8.6 },
      { lat: 50.55, lng: 8.5 },
      { lat: 50.54, lng: 8.42 },
      { lat: 50.54, lng: 8.36 },
      { lat: 50.48, lng: 8.26 },
      { lat: 50.42, lng: 8.05 },
    ],
  },
  {
    id: 'dill',
    kind: 'fluss',
    name: 'Dill',
    // von Dillenburg über Herborn, Sinn, Ehringshausen und Aßlar zur Mündung in Wetzlar
    anchors: [
      { lat: 50.85, lng: 8.24 },
      { lat: 50.74, lng: 8.29 },
      { lat: 50.68, lng: 8.31 },
      { lat: 50.64, lng: 8.34 },
      { lat: 50.6, lng: 8.39 },
      { lat: 50.59, lng: 8.46 },
      { lat: 50.555, lng: 8.495 },
    ],
  },
  {
    id: 'a45',
    kind: 'strasse',
    name: 'A45',
    // von Dillenburg östlich an Herborn und Ehringshausen vorbei, nördlich und östlich um Wetzlar,
    // über das Gießener Südkreuz nach Süden
    anchors: [
      { lat: 50.85, lng: 8.36 },
      { lat: 50.74, lng: 8.34 },
      { lat: 50.67, lng: 8.34 },
      { lat: 50.61, lng: 8.41 },
      { lat: 50.6, lng: 8.5 },
      { lat: 50.57, lng: 8.57 },
      { lat: 50.54, lng: 8.64 },
      { lat: 50.48, lng: 8.69 },
      { lat: 50.3, lng: 8.76 },
    ],
  },
  {
    id: 'b49',
    kind: 'strasse',
    name: 'B49',
    // aus Richtung Limburg und Weilburg nördlich der Lahn nach Wetzlar und weiter nach Gießen
    anchors: [
      { lat: 50.4, lng: 8.05 },
      { lat: 50.5, lng: 8.25 },
      { lat: 50.56, lng: 8.36 },
      { lat: 50.565, lng: 8.43 },
      { lat: 50.575, lng: 8.5 },
      { lat: 50.58, lng: 8.6 },
      { lat: 50.6, lng: 8.67 },
      { lat: 50.62, lng: 8.9 },
    ],
  },
];

const LABEL_CHAR_WIDTH = 0.72;
/** Labels sit in the outer part of the frame, away from the dense centre. */
const LABEL_MIN_FRACTION = 0.45;
const LABEL_MAX_FRACTION = 0.95;

function insideFrame(p: SvgPoint, size: number, margin: number): boolean {
  return p.x >= margin && p.y >= margin && p.x <= size - margin && p.y <= size - margin;
}

/**
 * Projects and routes every line for one view and places its label: on the outer part of the
 * line (45–95 % of the ring radius), clear of the place dots, the obstacles and the other labels.
 * Lines without room keep no label; the caption names all four.
 */
export function projectLandscape(
  projection: Pick<RadiusProjection, 'projectRaw' | 'origin' | 'radius' | 'size'>,
  options: { dots: readonly SvgPoint[]; obstacles: readonly Box[] },
): LandscapeLine[] {
  const placed: Box[] = [];
  const { origin, radius, size } = projection;
  const distance = (p: SvgPoint) => Math.hypot(p.x - origin.x, p.y - origin.y);

  return LANDSCAPE.map((line) => {
    const route = octilinearChain(line.anchors.map((a) => projection.projectRaw(a)));
    // Candidate label points: the corners and the middles of the legs, outermost first.
    const candidates = route
      .flatMap((p, i) => (i === 0 ? [p] : [{ x: (route[i - 1].x + p.x) / 2, y: (route[i - 1].y + p.y) / 2 }, p]))
      .filter((p) => insideFrame(p, size, 8))
      .filter((p) => distance(p) >= radius * LABEL_MIN_FRACTION && distance(p) <= radius * LABEL_MAX_FRACTION)
      .sort((a, b) => distance(b) - distance(a));

    let label: LandscapeLine['label'] = null;
    for (const at of candidates) {
      const [hit] = layoutLabels([{ id: line.id, text: line.name, x: at.x, y: at.y }], {
        size,
        fontSize: LANDSCAPE_LABEL_FONT_SIZE,
        charWidth: LABEL_CHAR_WIDTH,
        gap: 5,
        dotRadius: 7,
        extraDots: options.dots,
        obstacles: [...options.obstacles, ...placed],
      });
      if (hit) {
        placed.push(hit.box);
        label = { x: hit.x, y: hit.y, anchor: hit.anchor, box: hit.box };
        break;
      }
    }
    return { id: line.id, kind: line.kind, name: line.name, d: pathData(route), label };
  });
}
