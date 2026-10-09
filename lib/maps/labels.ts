/**
 * Greedy label placement for the radius graphic. Places are handled in priority order; each label
 * tries the sides in turn and is dropped when every side would cover another label, a dot or an
 * obstacle, or would leave the viewBox. Dropped places keep their dot; the commute table names them.
 */

export type LabelSide = 'right' | 'left' | 'above' | 'below';

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface LabelCandidate {
  id: string;
  text: string;
  x: number;
  y: number;
  /** Overrides the layout gap, e.g. for a dot drawn with a ring. */
  gap?: number;
  /** Must show (the selected place): may cover other dots, still avoids labels and obstacles. */
  ignoreDots?: boolean;
}

export interface PlacedLabel {
  id: string;
  text: string;
  /** Text anchor point; render with dominant-baseline="central". */
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  side: LabelSide;
  box: Box;
}

export interface LabelLayoutOptions {
  /** Square viewBox edge length. */
  size: number;
  /** Largest font size the labels render at, in SVG units. */
  fontSize: number;
  /** Average glyph advance in em (Inter ≈ 0.55; a little extra keeps the estimate safe). */
  charWidth?: number;
  /** Space between dot and label. */
  gap?: number;
  /** Half the edge of the square kept free around every dot. */
  dotRadius?: number;
  /** Dots without a label candidate (e.g. the center), kept free as well. */
  extraDots?: readonly { x: number; y: number }[];
  /** Other reserved areas, e.g. the "35 km" note. */
  obstacles?: readonly Box[];
  sides?: readonly LabelSide[];
}

const DEFAULT_SIDES: readonly LabelSide[] = ['right', 'left', 'above', 'below'];

export function boxesOverlap(a: Box, b: Box): boolean {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
}

/** Estimated bounding box of a one-line label. */
export function labelBox(
  point: { x: number; y: number },
  text: string,
  side: LabelSide,
  { fontSize, charWidth = 0.6, gap = 6 }: Pick<LabelLayoutOptions, 'fontSize' | 'charWidth' | 'gap'>,
): { box: Box; x: number; y: number; anchor: PlacedLabel['anchor'] } {
  const width = [...text].length * charWidth * fontSize;
  const height = fontSize;
  switch (side) {
    case 'right': {
      const x = point.x + gap;
      return { x, y: point.y, anchor: 'start', box: { x0: x, y0: point.y - height / 2, x1: x + width, y1: point.y + height / 2 } };
    }
    case 'left': {
      const x = point.x - gap;
      return { x, y: point.y, anchor: 'end', box: { x0: x - width, y0: point.y - height / 2, x1: x, y1: point.y + height / 2 } };
    }
    case 'above': {
      const y = point.y - gap - height / 2;
      return { x: point.x, y, anchor: 'middle', box: { x0: point.x - width / 2, y0: y - height / 2, x1: point.x + width / 2, y1: y + height / 2 } };
    }
    case 'below': {
      const y = point.y + gap + height / 2;
      return { x: point.x, y, anchor: 'middle', box: { x0: point.x - width / 2, y0: y - height / 2, x1: point.x + width / 2, y1: y + height / 2 } };
    }
  }
}

export function layoutLabels(candidates: readonly LabelCandidate[], options: LabelLayoutOptions): PlacedLabel[] {
  const { size, dotRadius = 4, extraDots = [], obstacles = [], sides = DEFAULT_SIDES } = options;
  const dotBox = (p: { x: number; y: number }): Box => ({
    x0: p.x - dotRadius,
    y0: p.y - dotRadius,
    x1: p.x + dotRadius,
    y1: p.y + dotRadius,
  });

  const dots = [...candidates.map((c) => ({ id: c.id, box: dotBox(c) })), ...extraDots.map((p) => ({ id: null, box: dotBox(p) }))];
  const placed: PlacedLabel[] = [];

  for (const candidate of candidates) {
    const gap = candidate.gap ?? options.gap;
    for (const side of sides) {
      const { box, x, y, anchor } = labelBox(candidate, candidate.text, side, { ...options, gap });
      const inside = box.x0 >= 0 && box.y0 >= 0 && box.x1 <= size && box.y1 <= size;
      if (!inside) continue;
      const blocked =
        placed.some((label) => boxesOverlap(label.box, box)) ||
        (!candidate.ignoreDots && dots.some((dot) => dot.id !== candidate.id && boxesOverlap(dot.box, box))) ||
        obstacles.some((obstacle) => boxesOverlap(obstacle, box));
      if (blocked) continue;
      placed.push({ id: candidate.id, text: candidate.text, x, y, anchor, side, box });
      break;
    }
  }

  return placed;
}
