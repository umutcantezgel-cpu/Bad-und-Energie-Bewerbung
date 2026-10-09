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
/** Centre dot: r=6 plus half of its 2px surface-coloured stroke (see RadiusGraphic). */
export const CENTER_DOT_RADIUS = 6;
const CENTER_DOT_EXTENT = CENTER_DOT_RADIUS + 1;
/** The centre label keeps the same 4 units of air as the other labels, measured from the dot's edge. */
const CENTER_LABEL_GAP = CENTER_DOT_EXTENT + 4;
/** Half the width of the strip kept free along the dashed radius line. */
const RADIUS_LINE_CLEARANCE = 2;
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

/** Small boxes along the dashed radius line (outside the centre dot), so no label sits on it. */
export function radiusLineBoxes(data: Pick<RegionMapData, 'origin' | 'radius'>): Box[] {
  const end = pointOnCircle(data.origin, data.radius, RADIUS_LINE_ANGLE);
  const length = Math.hypot(end.x - data.origin.x, end.y - data.origin.y);
  const step = RADIUS_LINE_CLEARANCE * 2;
  const boxes: Box[] = [];
  for (let d = CENTER_DOT_EXTENT; d <= length; d += step) {
    const x = data.origin.x + ((end.x - data.origin.x) * d) / length;
    const y = data.origin.y + ((end.y - data.origin.y) * d) / length;
    boxes.push({
      x0: x - RADIUS_LINE_CLEARANCE,
      y0: y - RADIUS_LINE_CLEARANCE,
      x1: x + RADIUS_LINE_CLEARANCE,
      y1: y + RADIUS_LINE_CLEARANCE,
    });
  }
  return boxes;
}

function squareAround(point: SvgPoint, half: number): Box {
  return { x0: point.x - half, y0: point.y - half, x1: point.x + half, y1: point.y + half };
}

/** Places closer to the centre than this stay unlabeled unless selected; the table names them. */
export const MIN_LABEL_DISTANCE_KM = 8;
/** Extra distances tried for the selected and the centre label before they may cover another dot. */
const SELECTED_EXTRA_GAPS = [0, 6, 12] as const;

/**
 * Labels for the graphic: the selected place first (always shown), then the center, then the
 * outer places (≥ 8 km) from the outside in. The dense inner cluster keeps its dots only, and
 * so do places without room; the commute table names them all. No label covers the "35 km"
 * note, the dashed radius line or the centre dot. The selected label also keeps clear of the
 * other dots, moving a little further out if needed, and covers one only as a last resort.
 */
export function graphicLabels(data: RegionMapData, selectedId: string | null): PlacedLabel[] {
  const outer = data.places.filter((place) => !place.atCenter);
  const selected = outer.find((place) => place.id === selectedId);
  const distance = (p: SvgPoint) => Math.hypot(p.x - data.origin.x, p.y - data.origin.y);
  const minDistance = (data.radius * MIN_LABEL_DISTANCE_KM) / data.radiusKm;
  const unselected = outer.filter((place) => place !== selected);
  const rest = unselected.filter((place) => distance(place) >= minDistance).sort((a, b) => distance(b) - distance(a));

  const note = radiusNote(data).box;
  const centerDot = squareAround(data.origin, CENTER_DOT_EXTENT);
  const fixed = [note, centerDot];
  const line = radiusLineBoxes(data);
  const base = { size: data.size, fontSize: LABEL_FONT_SIZE, gap: LABEL_GAP, dotRadius: DOT_CLEARANCE };

  let selectedLabel: PlacedLabel | undefined;
  if (selected) {
    const candidate = { id: selected.id, text: selected.name, x: selected.x, y: selected.y };
    const ringGap = SELECTED_RING_RADIUS + 4;
    // First clear of every dot (a little further out if needed); then it may cover a dot; the
    // dashed line and the centre dot give way last.
    const tiers: { gap: number; ignoreDots: boolean; obstacles: Box[] }[] = [
      ...SELECTED_EXTRA_GAPS.map((extra) => ({ gap: ringGap + extra, ignoreDots: false, obstacles: [...fixed, ...line] })),
      { gap: ringGap, ignoreDots: true, obstacles: [...fixed, ...line] },
      { gap: ringGap, ignoreDots: true, obstacles: fixed },
      { gap: ringGap, ignoreDots: true, obstacles: [note] },
    ];
    for (const { gap, ignoreDots, obstacles } of tiers) {
      [selectedLabel] = layoutLabels([{ ...candidate, gap, ignoreDots }], {
        ...base,
        obstacles,
        extraDots: ignoreDots ? [] : unselected,
      });
      if (selectedLabel) break;
    }
  }

  const ringBox = selected ? [squareAround(selected, SELECTED_RING_RADIUS + 1)] : [];
  const reserved = [...fixed, ...line, ...ringBox, ...(selectedLabel ? [selectedLabel.box] : [])];
  const centerCandidate = { id: CENTER_LABEL_ID, text: data.centerName, x: data.origin.x, y: data.origin.y, gap: CENTER_LABEL_GAP };
  // The centre is always named: clear of the inner dots if possible (a little further out if
  // needed), otherwise its label may cover one.
  let centerLabel: PlacedLabel | undefined;
  for (const extra of SELECTED_EXTRA_GAPS) {
    const gap = CENTER_LABEL_GAP + extra;
    [centerLabel] = layoutLabels([{ ...centerCandidate, gap }], { ...base, extraDots: unselected, obstacles: reserved });
    if (centerLabel) break;
  }
  centerLabel ??= layoutLabels([{ ...centerCandidate, ignoreDots: true }], { ...base, obstacles: reserved })[0];

  const others = layoutLabels(
    rest.map((place) => ({ id: place.id, text: place.name, x: place.x, y: place.y })),
    {
      ...base,
      extraDots: [data.origin, ...unselected.filter((place) => !rest.includes(place))],
      obstacles: [...reserved, ...(centerLabel ? [centerLabel.box] : [])],
    },
  );

  return [...(selectedLabel ? [selectedLabel] : []), ...(centerLabel ? [centerLabel] : []), ...others];
}
