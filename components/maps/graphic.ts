import { boxesOverlap, layoutLabels, type Box, type PlacedLabel } from '@/lib/maps/labels';
import { pointOnCircle, type SvgPoint } from '@/lib/maps/projection';
import type { RadiusView, RegionMapData, ViewRing } from './types';

/** viewBox edge; at 390 px viewport width the graphic renders at roughly 1:1. */
export const GRAPHIC_SIZE = 360;
/** Room around the chosen ring for the outermost labels. */
export const GRAPHIC_PADDING = 20;
/** Labels render at 15 units on phones and 13 units from sm; the layout reserves the larger size. */
const LABEL_FONT_SIZE = 15;
const LABEL_GAP = 7;
const DOT_CLEARANCE = 4;
/**
 * Centre house (Giebel 45°, see RadiusGraphic CENTER_HOUSE): ±8 units wide, −9…+7 high, plus half
 * of its 3 px stroke. Labels and the Pendel keep clear of this square.
 */
export const CENTER_DOT_RADIUS = 10;
const CENTER_DOT_EXTENT = CENTER_DOT_RADIUS + 1;
/** The centre label keeps 4 units of air from the house. */
const CENTER_LABEL_GAP = CENTER_DOT_EXTENT + 4;

export const CENTER_LABEL_ID = '__center';

/**
 * Landscape labels: 12 units; road numbers in Martian Mono, river names in Atkinson. Lives here, not in
 * landscape.ts, so the client graphic does not pull the landscape anchors into its bundle.
 */
export const LANDSCAPE_LABEL_FONT_SIZE = 12;

// --- Ortspunkte frei vom Haus ------------------------------------------------------------

/**
 * Drawn dots keep this distance (centre to centre) from the house in the middle: the house's farthest
 * corner (≈ 10.6 units plus half the stroke), the selected dot (5.5 + 1) and 1–2 units of air.
 */
export const HOUSE_CLEARANCE = 19;
/** Two drawn dots keep this distance (centre to centre): 2 × (4.5 + 1) and one unit of air. */
export const DOT_SPACING = 12;

/**
 * Where the dots are drawn: at their true position, except the few places that lie under or against the
 * house (Hermannstein at 35 and 25 km). Those move straight outwards just far enough to clear it, and
 * crowded neighbours step apart a little (E-START-036 „Ortspunkte bleiben lesbar“). Only the inner
 * cluster moves (by a few units, well under a kilometre's worth outside the zoom); every distance the
 * visitor reads comes from the place list.
 */
export function clearOfHouse(points: readonly SvgPoint[], origin: SvgPoint, skip: readonly boolean[] = []): SvgPoint[] {
  const out = points.map((p) => ({ x: p.x, y: p.y }));
  const free = (i: number) => !skip[i];
  const pushOut = (p: SvgPoint) => {
    const dx = p.x - origin.x;
    const dy = p.y - origin.y;
    const d = Math.hypot(dx, dy);
    if (d >= HOUSE_CLEARANCE) return;
    // A dot right on the centre goes north-east, where no place of the data lies.
    const ux = d > 0.01 ? dx / d : Math.SQRT1_2;
    const uy = d > 0.01 ? dy / d : -Math.SQRT1_2;
    p.x = origin.x + ux * HOUSE_CLEARANCE;
    p.y = origin.y + uy * HOUSE_CLEARANCE;
  };
  for (let round = 0; round < 24; round++) {
    let moved = false;
    out.forEach((p, i) => {
      if (!free(i)) return;
      const before = { ...p };
      pushOut(p);
      if (before.x !== p.x || before.y !== p.y) moved = true;
    });
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        if (!free(i) || !free(j)) continue;
        const a = out[i];
        const b = out[j];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        if (d >= DOT_SPACING - 0.01) continue;
        const ux = d > 0.01 ? (b.x - a.x) / d : 1;
        const uy = d > 0.01 ? (b.y - a.y) / d : 0;
        const step = (DOT_SPACING - d) / 2;
        a.x -= ux * step;
        a.y -= uy * step;
        b.x += ux * step;
        b.y += uy * step;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return out.map((p) => ({ x: round1(p.x), y: round1(p.y) }));
}

/** Ring labels sit just inside each ring, a little west of south, where no place and no line runs. */
const RING_LABEL_ANGLE = 100;
/**
 * Where a ring label may move when a dot lies under it (it read „15, km“ with a place between the words): along its
 * ring, nearest first. The home map keeps its labels at RING_LABEL_ANGLE, where none of its ten places lies.
 */
const RING_LABEL_FALLBACK_ANGLES = [90, 80, 110, 120, 70, 60, 130, 140, 50, 40, 150, 160, 30, 20, 170, 180, 190, 200, 350, 340, 210, 220, 330, 320, 230, 240, 310, 300] as const;
/** Half the square kept free around a dot for a ring label (dot 4.5 + stroke + air). */
const RING_LABEL_DOT_CLEARANCE = 7;
/** Ring labels: Martian Mono at 13 units (75 % width, tabular); 0.66 em per glyph keeps the estimate safe. */
export const RING_LABEL_FONT_SIZE = 13;
const RING_LABEL_CHAR_WIDTH = 0.66;

export interface RingLabel {
  km: number;
  text: string;
  x: number;
  y: number;
  box: Box;
}

/**
 * „15 km“, „25 km“, „35 km“ on their rings (straight-line distance, see the caption). With the view's points the
 * labels keep clear of every drawn dot: a label that would cover one moves along its ring (RING_LABEL_FALLBACK_ANGLES).
 */
export function ringLabels(view: Pick<RadiusView, 'origin' | 'rings'> & { size?: number; points?: RadiusView['points'] }): RingLabel[] {
  const dots = (view.points ?? []).filter((p) => p.inFrame).map((p) => squareAround(p.drawn, RING_LABEL_DOT_CLEARANCE));
  const fixed: Box[] = [centerBox(view.origin)];
  const inFrame = (box: Box) => view.size === undefined || (box.x0 >= 0 && box.y0 >= 0 && box.x1 <= view.size && box.y1 <= view.size);
  const placed: RingLabel[] = [];
  for (const ring of view.rings) {
    const text = `${ring.km}\u00A0km`;
    const width = [...text].length * RING_LABEL_CHAR_WIDTH * RING_LABEL_FONT_SIZE;
    const at = (angle: number, inset = 12): RingLabel => {
      // Default angle: as always (just inside the ring, starting a little east of the point). Other angles: the
      // label centred just inside the ring (or just outside, inset < 0).
      const point = angle === RING_LABEL_ANGLE && inset === 12 ? pointOnCircle(view.origin, ring.r, angle) : pointOnCircle(view.origin, ring.r - inset, angle);
      const x = angle === RING_LABEL_ANGLE && inset === 12 ? point.x + 4 : round1(point.x - width / 2);
      const y = angle === RING_LABEL_ANGLE && inset === 12 ? point.y - 11 : point.y;
      return {
        km: ring.km,
        text,
        x,
        y,
        box: { x0: x - 2, y0: y - RING_LABEL_FONT_SIZE / 2 - 1, x1: x + width + 2, y1: y + RING_LABEL_FONT_SIZE / 2 + 1 },
      };
    };
    const hits = (label: RingLabel) => dots.filter((box) => boxesOverlap(box, label.box)).length;
    const blocked = (label: RingLabel) =>
      !inFrame(label.box) || [...fixed, ...placed.map((l) => l.box)].some((box) => boxesOverlap(box, label.box));
    const candidates = [RING_LABEL_ANGLE, ...RING_LABEL_FALLBACK_ANGLES].flatMap((angle) => [at(angle), at(angle, -12), at(angle, 22)]);
    // Erst ohne Punkt darunter; sonst die Lage mit den wenigsten Punkten (dichte Mitte)
    const label =
      candidates.find((c) => !blocked(c) && hits(c) === 0) ??
      [...candidates].filter((c) => !blocked(c)).sort((a, b) => hits(a) - hits(b))[0] ??
      at(RING_LABEL_ANGLE);
    placed.push(label);
  }
  return placed;
}

/** Rings of a view: the switch radii up to the chosen one, in SVG units. */
export function ringsFor(radii: readonly number[], radiusKm: number, unitsPerKm: number): ViewRing[] {
  return radii.filter((km) => km <= radiusKm).map((km) => ({ km, r: Math.round(km * unitsPerKm * 10) / 10 }));
}

function squareAround(point: SvgPoint, half: number): Box {
  return { x0: point.x - half, y0: point.y - half, x1: point.x + half, y1: point.y + half };
}

/** The centre house as an obstacle for labels. */
export function centerBox(origin: SvgPoint): Box {
  return squareAround(origin, CENTER_DOT_EXTENT);
}

/** A place as the label layout sees it. */
export interface FramePlace {
  id: string;
  name: string;
  x: number;
  y: number;
  atCenter: boolean;
}

/** What the label layout needs from one view of the graphic. */
export interface LabelFrame {
  centerName: string;
  radiusKm: number;
  size: number;
  origin: SvgPoint;
  /** Radius of the chosen ring in SVG units. */
  radius: number;
  /** Places inside the frame only. */
  places: readonly FramePlace[];
  /** Reserved areas: ring labels and landscape labels. */
  obstacles?: readonly Box[];
  /**
   * Areas a label avoids if it can (the landscape lines): first every label tries to stay off
   * them, only a label without any other room may cross a line (its halo keeps it readable).
   */
  softObstacles?: readonly Box[];
  /** Named first after the selected place and the centre, in this order (overview: the larger towns). */
  priority?: readonly string[];
  /**
   * Must be named (pages under /einsatzgebiet: the emphasized places), also close to the centre; without room next
   * to the dot a little further out, with a leader line.
   */
  mustLabel?: readonly string[];
}

/** A placed label; labels set further out than usual carry a leader line from their dot. */
export interface GraphicLabel extends PlacedLabel {
  leader?: { x1: number; y1: number; x2: number; y2: number };
}

/** Distances tried for a must-label without room next to its dot (then it gets a leader line). */
const LEADER_GAPS = [14, 22, 32, 44, 58, 74, 92, 112] as const;

/** Leader from the edge of the dot to the nearest point of the label box. */
function leaderLine(dot: SvgPoint, box: Box): GraphicLabel['leader'] {
  const tx = Math.min(Math.max(dot.x, box.x0), box.x1);
  const ty = Math.min(Math.max(dot.y, box.y0), box.y1);
  const d = Math.hypot(tx - dot.x, ty - dot.y) || 1;
  const start = 6;
  return {
    x1: round1(dot.x + ((tx - dot.x) / d) * start),
    y1: round1(dot.y + ((ty - dot.y) / d) * start),
    x2: round1(tx),
    y2: round1(ty),
  };
}

/** Free disc around the house in which the landscape lines stop (SVG units; see RadiusGraphic). */
export const LANDSCAPE_CLEAR = 26;

/** Points of an "M x y L x y …" path. */
export function pathPoints(d: string): SvgPoint[] {
  return [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
}

/**
 * Small boxes along a polyline (every `step` units, half size `half`), inside the frame and
 * outside the free disc around the house: obstacles that keep labels off the lines.
 */
export function polylineBoxes(
  points: readonly SvgPoint[],
  frame: { size: number; origin: SvgPoint },
  { step = 4, half = 2, clear = 0 }: { step?: number; half?: number; clear?: number } = {},
): Box[] {
  const boxes: Box[] = [];
  points.slice(1).forEach((b, i) => {
    const a = points[i];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    for (let d = 0; d <= length; d += step) {
      const x = a.x + ((b.x - a.x) * d) / (length || 1);
      const y = a.y + ((b.y - a.y) * d) / (length || 1);
      if (x < -half || y < -half || x > frame.size + half || y > frame.size + half) continue;
      if (Math.hypot(x - frame.origin.x, y - frame.origin.y) < clear) continue;
      boxes.push({ x0: x - half, y0: y - half, x1: x + half, y1: y + half });
    }
  });
  return boxes;
}

/** The label frame of one view: places inside the frame (where their dots are drawn), ring and landscape labels as obstacles. */
export function labelFrame(data: Pick<RegionMapData, 'centerName' | 'places'>, view: RadiusView): LabelFrame {
  const places = view.points.flatMap((point, i) => {
    const place = data.places[i];
    return point.inFrame && place
      ? [{ id: place.id, name: place.shortName ?? place.name, x: point.drawn.x, y: point.drawn.y, atCenter: place.atCenter }]
      : [];
  });
  const obstacles = [
    ...ringLabels(view).map((label) => label.box),
    ...view.landscape.flatMap((line) => (line.label ? [line.label.box] : [])),
  ];
  const softObstacles = view.landscape.flatMap((line) =>
    polylineBoxes(pathPoints(line.d), view, { clear: LANDSCAPE_CLEAR }),
  );
  return {
    centerName: data.centerName,
    radiusKm: view.radiusKm,
    size: view.size,
    origin: view.origin,
    radius: view.radius,
    places,
    obstacles,
    softObstacles,
  };
}

/** Ring radius around the selected dot; its label keeps clear of it. */
export const SELECTED_RING_RADIUS = 10;

/**
 * Places closer to the centre than this share of the frame radius stay unlabeled unless selected
 * (8 km at 35 km, about 3.4 km at 15 km); the place list names them all.
 */
export const MIN_LABEL_FRACTION = 8 / 35;
/** Extra distances tried for the selected and the centre label before they may cover another dot. */
const SELECTED_EXTRA_GAPS = [0, 6, 12] as const;

/**
 * Labels for the graphic: the selected place first (always shown), then the center, then the
 * outer places from the outside in. The dense inner cluster keeps its dots only, and so do
 * places without room; the place list names them all. No label covers a ring label, a landscape
 * label or the centre house. The selected label also keeps clear of the other dots, moving a
 * little further out if needed, and covers one only as a last resort.
 */
export function graphicLabels(data: LabelFrame, selectedId: string | null): GraphicLabel[] {
  const outer = data.places.filter((place) => !place.atCenter);
  const selected = outer.find((place) => place.id === selectedId);
  const distance = (p: SvgPoint) => Math.hypot(p.x - data.origin.x, p.y - data.origin.y);
  const minDistance = data.radius * MIN_LABEL_FRACTION;
  const unselected = outer.filter((place) => place !== selected);
  const priority = data.priority ?? [];
  // Priority places are always named too (with a leader line if need be)
  const must = new Set([...(data.mustLabel ?? []), ...priority]);
  // Priority first (in its order), then the must-labels, then the rest from the outside in
  const rank = (place: FramePlace) => {
    const p = priority.indexOf(place.id);
    return p >= 0 ? p : must.has(place.id) ? priority.length : priority.length + 1;
  };
  const rest = unselected
    .filter((place) => must.has(place.id) || priority.includes(place.id) || distance(place) >= minDistance)
    .sort((a, b) => rank(a) - rank(b) || distance(b) - distance(a));

  const fixed = [centerBox(data.origin), ...(data.obstacles ?? [])];
  const base = { size: data.size, fontSize: LABEL_FONT_SIZE, gap: LABEL_GAP, dotRadius: DOT_CLEARANCE };
  // Lines to stay off if possible: the landscape and, with a choice, the Pendel to the place.
  const soft = [
    ...(data.softObstacles ?? []),
    ...(selected ? polylineBoxes(octilinear(data.origin, selected), data, { clear: CENTER_DOT_EXTENT }) : []),
  ];

  let selectedLabel: PlacedLabel | undefined;
  if (selected) {
    const candidate = { id: selected.id, text: selected.name, x: selected.x, y: selected.y };
    const ringGap = SELECTED_RING_RADIUS + 4;
    // First clear of every dot (a little further out if needed); then it may cover a dot; the
    // ring and landscape labels give way last.
    const tiers: { gap: number; ignoreDots: boolean; obstacles: Box[] }[] = [
      ...SELECTED_EXTRA_GAPS.map((extra) => ({ gap: ringGap + extra, ignoreDots: false, obstacles: [...fixed, ...soft] })),
      ...SELECTED_EXTRA_GAPS.map((extra) => ({ gap: ringGap + extra, ignoreDots: false, obstacles: fixed })),
      { gap: ringGap, ignoreDots: true, obstacles: fixed },
      { gap: ringGap, ignoreDots: true, obstacles: [centerBox(data.origin)] },
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
  const reserved = [...fixed, ...ringBox, ...(selectedLabel ? [selectedLabel.box] : [])];
  const centerCandidate = { id: CENTER_LABEL_ID, text: data.centerName, x: data.origin.x, y: data.origin.y, gap: CENTER_LABEL_GAP };
  // The centre is always named: clear of the inner dots if possible (a little further out if
  // needed), otherwise its label may cover one.
  let centerLabel: PlacedLabel | undefined;
  for (const obstacles of [[...reserved, ...soft], reserved]) {
    for (const extra of SELECTED_EXTRA_GAPS) {
      const gap = CENTER_LABEL_GAP + extra;
      [centerLabel] = layoutLabels([{ ...centerCandidate, gap }], { ...base, extraDots: unselected, obstacles });
      if (centerLabel) break;
    }
    if (centerLabel) break;
  }
  centerLabel ??= layoutLabels([{ ...centerCandidate, ignoreDots: true }], { ...base, obstacles: reserved })[0];

  const restOptions = {
    ...base,
    extraDots: [data.origin, ...unselected.filter((place) => !rest.includes(place))],
  };
  const taken = [...reserved, ...(centerLabel ? [centerLabel.box] : [])];
  const candidates = rest.map((place) => ({ id: place.id, text: place.name, x: place.x, y: place.y }));
  // Priority places first, both passes; then the rest. Each group: first off the lines; places without such room get
  // a second try that may cross a line.
  const placedSoFar: PlacedLabel[] = [];
  const isPriority = (c: { id: string }) => priority.includes(c.id);
  for (const group of [candidates.filter(isPriority), candidates.filter((c) => !isPriority(c))]) {
    if (group.length === 0) continue;
    const blockedBy = () => [...taken, ...placedSoFar.map((label) => label.box)];
    const clear = layoutLabels(group, { ...restOptions, extraDots: [...restOptions.extraDots, ...candidates.filter((c) => !group.includes(c))], obstacles: [...blockedBy(), ...soft] });
    placedSoFar.push(...clear);
    const crossing = layoutLabels(
      group.filter((c) => !clear.some((label) => label.id === c.id)),
      { ...restOptions, extraDots: [...restOptions.extraDots, ...candidates.filter((c) => !group.includes(c))], obstacles: blockedBy() },
    );
    placedSoFar.push(...crossing);
  }
  const others: GraphicLabel[] = [...placedSoFar].sort(
    (a, b) => candidates.findIndex((c) => c.id === a.id) - candidates.findIndex((c) => c.id === b.id),
  );

  // Must-labels still without a name: further out with a leader line, first clear of the dots, then over one
  const missing = candidates.filter((c) => must.has(c.id) && !others.some((label) => label.id === c.id));
  for (const candidate of missing) {
    const blocked = [...taken, ...others.map((label) => label.box)];
    const dotsAround = [data.origin, ...unselected.filter((place) => place.id !== candidate.id), ...(selected ? [selected] : [])];
    let placed: PlacedLabel | undefined;
    for (const ignoreDots of [false, true]) {
      for (const gap of LEADER_GAPS) {
        [placed] = layoutLabels([{ ...candidate, gap, ignoreDots }], { ...base, extraDots: dotsAround, obstacles: blocked });
        if (placed) break;
      }
      if (placed) break;
    }
    if (placed) others.push({ ...placed, leader: leaderLine(candidate, placed.box) });
  }

  return [...(selectedLabel ? [selectedLabel] : []), ...(centerLabel ? [centerLabel] : []), ...others];
}

// --- Leitungen: 45°-Führung, Paarversatz, Pendel ---------------------------------------

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Octilinear route from a to b (Formsystem K-010: only 0°, 45° and 90°): first the diagonal, then
 * the straight rest, like a pipe run. Points coincide when a and b share an axis or a diagonal.
 */
export function octilinear(a: SvgPoint, b: SvgPoint): SvgPoint[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.min(Math.abs(dx), Math.abs(dy));
  const mid = { x: round1(a.x + Math.sign(dx) * d), y: round1(a.y + Math.sign(dy) * d) };
  const route = [a, mid, b];
  return route.filter((p, i) => i === 0 || Math.hypot(p.x - route[i - 1].x, p.y - route[i - 1].y) > 0.05);
}

/** Routes a whole chain of anchors at 45° (each leg diagonal first). */
export function octilinearChain(points: readonly SvgPoint[]): SvgPoint[] {
  const out: SvgPoint[] = [];
  points.forEach((p, i) => {
    if (i === 0) {
      out.push(p);
      return;
    }
    out.push(...octilinear(points[i - 1], p).slice(1));
  });
  return out;
}

/** Parallel copy of a polyline at distance `d` (left of the direction of travel), mitred joints. */
export function offsetPolyline(points: readonly SvgPoint[], d: number): SvgPoint[] {
  if (points.length < 2) return [...points];
  const normals = points.slice(1).map((p, i) => {
    const q = points[i];
    const len = Math.hypot(p.x - q.x, p.y - q.y) || 1;
    return { x: -(p.y - q.y) / len, y: (p.x - q.x) / len };
  });
  return points.map((p, i) => {
    const before = normals[i - 1];
    const after = normals[i];
    if (!before || !after) {
      const n = (before ?? after)!;
      return { x: round1(p.x + n.x * d), y: round1(p.y + n.y * d) };
    }
    // Mitre: the bisector of both normals, lengthened so each offset line keeps distance d.
    const bx = before.x + after.x;
    const by = before.y + after.y;
    const dot = before.x * after.x + before.y * after.y;
    const scale = d / (1 + dot);
    return Math.abs(1 + dot) < 1e-6 ? { x: round1(p.x + after.x * d), y: round1(p.y + after.y * d) } : { x: round1(p.x + bx * scale), y: round1(p.y + by * scale) };
  });
}

/** Shortens a polyline at its start and end (to keep clear of the house and the dot). */
export function trimPolyline(points: readonly SvgPoint[], start: number, end: number): SvgPoint[] | null {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
  const total = lengths.reduce((sum, l) => sum + l, 0);
  if (total <= start + end + 4) return null;
  const at = (distance: number): { point: SvgPoint; index: number } => {
    let rest = distance;
    for (let i = 0; i < lengths.length; i++) {
      if (rest <= lengths[i] || i === lengths.length - 1) {
        const t = lengths[i] ? rest / lengths[i] : 0;
        const a = points[i];
        const b = points[i + 1];
        return { point: { x: round1(a.x + (b.x - a.x) * t), y: round1(a.y + (b.y - a.y) * t) }, index: i };
      }
      rest -= lengths[i];
    }
    return { point: points[points.length - 1], index: lengths.length - 1 };
  };
  const from = at(start);
  const to = at(total - end);
  return [from.point, ...points.slice(from.index + 1, to.index + 1), to.point];
}

export function pathData(points: readonly SvgPoint[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${round1(p.x)} ${round1(p.y)}`).join('');
}

/** Distance between Vorlauf and Rücklauf of the Pendel in the graphic (the --paar of the map scale). */
export const PENDEL_PAIR = 7;

export interface PendelPaths {
  /** Red: from Wetzlar to the place. */
  vorlauf: string;
  /** Blue: from the place back to Wetzlar. */
  ruecklauf: string;
}

/**
 * The daily commute as a pipe pair (B Runde 1 „Schlaufe“, static): Vorlauf from the workshop to
 * the place, Rücklauf back, routed at 45° and kept clear of the house and the dot. Null when the
 * place is too close to the centre for a visible pair.
 */
export function pendelPaths(origin: SvgPoint, target: SvgPoint): PendelPaths | null {
  const route = trimPolyline(octilinear(origin, target), CENTER_DOT_EXTENT + 2, 9);
  if (!route) return null;
  const out = offsetPolyline(route, -PENDEL_PAIR / 2);
  const back = offsetPolyline([...route].reverse(), -PENDEL_PAIR / 2);
  return { vorlauf: pathData(out), ruecklauf: pathData(back) };
}
