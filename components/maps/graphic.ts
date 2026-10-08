import { layoutLabels, type Box, type PlacedLabel } from '@/lib/maps/labels';
import { pointOnCircle, type SvgPoint } from '@/lib/maps/projection';
import type { RegionMapData } from './types';

/** viewBox edge; at 390 px viewport width the graphic renders at roughly 1:1. */
export const GRAPHIC_SIZE = 360;
/** Room around the circle for the outermost labels. */
export const GRAPHIC_PADDING = 20;
/** Labels render at 15 units on phones and 13 units from sm; the layout reserves the larger size. */
const LABEL_FONT_SIZE = 15;
const LABEL_GAP = 7;
const DOT_CLEARANCE = 4;
/** The radius line points south-east, where the region has no places. */
const RADIUS_LINE_ANGLE = 45;

export const CENTER_LABEL_ID = '__center';

export interface RadiusNote {
  lineEnd: SvgPoint;
  text: string;
  x: number;
  y: number;
  box: Box;
}

export function radiusNote(data: Pick<RegionMapData, 'origin' | 'radius' | 'radiusKm'>): RadiusNote {
  const lineEnd = pointOnCircle(data.origin, data.radius, RADIUS_LINE_ANGLE);
  const at = pointOnCircle(data.origin, data.radius * 0.62, RADIUS_LINE_ANGLE);
  const text = `${data.radiusKm} km`;
  const x = at.x + 6;
  const y = at.y - 8;
  const width = text.length * 0.6 * LABEL_FONT_SIZE;
  return {
    lineEnd,
    text,
    x,
    y,
    box: { x0: x, y0: y - LABEL_FONT_SIZE / 2, x1: x + width, y1: y + LABEL_FONT_SIZE / 2 },
  };
}

/** Ring radius around the selected dot; its label keeps clear of it. */
export const SELECTED_RING_RADIUS = 10;

/**
 * Labels for the graphic: the selected place first (always shown), then the center, then the
 * others from the outside in. Places without room keep their dot only.
 */
export function graphicLabels(data: RegionMapData, selectedId: string | null): PlacedLabel[] {
  const outer = data.places.filter((place) => !place.atCenter);
  const selected = outer.find((place) => place.id === selectedId);
  const distance = (p: SvgPoint) => Math.hypot(p.x - data.origin.x, p.y - data.origin.y);
  const rest = outer.filter((place) => place !== selected).sort((a, b) => distance(b) - distance(a));

  return layoutLabels(
    [
      ...(selected
        ? [{ id: selected.id, text: selected.name, x: selected.x, y: selected.y, gap: SELECTED_RING_RADIUS + 4, ignoreDots: true }]
        : []),
      { id: CENTER_LABEL_ID, text: data.centerName, x: data.origin.x, y: data.origin.y },
      ...rest.map((place) => ({ id: place.id, text: place.name, x: place.x, y: place.y })),
    ],
    {
      size: data.size,
      fontSize: LABEL_FONT_SIZE,
      gap: LABEL_GAP,
      dotRadius: DOT_CLEARANCE,
      obstacles: [radiusNote(data).box],
    },
  );
}
