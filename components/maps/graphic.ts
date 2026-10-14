import { boxesOverlap, labelBox, layoutLabels, type Box, type PlacedLabel } from '@/lib/maps/labels';
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
 * Landscape labels: 13 units (at 390 px the graphic renders at 0.96 : 1, so 12.5 px drawn; 12 units stayed at
 * 11.5 px, below the 12 px minimum, review E-029 finding 7); road numbers in Martian Mono, river names in
 * Atkinson. Lives here, not in landscape.ts, so the client graphic does not pull the landscape anchors into its
 * bundle.
 */
export const LANDSCAPE_LABEL_FONT_SIZE = 13;

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
  /**
   * Dots drawn small and hollow without a name (pages under /einsatzgebiet: the places not emphasized). They carry no
   * label, but no leader line may run through them (Review Phase 2, Kritik 2: Herborn's line ran through Breitscheid).
   */
  smallDots?: readonly SvgPoint[];
}

/** A placed label; labels set further out than usual carry a leader line from their dot. */
export interface GraphicLabel extends PlacedLabel {
  leader?: { x1: number; y1: number; x2: number; y2: number };
}

/** Distances tried for a must-label without room next to its dot (then it gets a leader line). */
const LEADER_GAPS = [14, 22, 32, 44, 58, 74, 92, 112] as const;
/**
 * Short leaders first: distances from the dot to the label (the near edge or corner of its box) tried in eight
 * directions before the long fallback above. Kept short so the reader still sees which dot a name belongs to.
 */
const SHORT_LEADER_GAPS = [10, 14, 18, 24, 30, 38, 46, 56, 68, 80] as const;
/** Directions tried for a leader: every 22,5°, the one pointing away from the centre first. */
const LEADER_DIRECTIONS = 16;
/**
 * A leader keeps the dot's radius plus 1.5 units from every other dot (and never runs through another name), so it
 * cannot read as that dot's line: 4.5 + 1.5 for a full dot, 3 + 1.5 for a small hollow one, the ring around the
 * selected dot plus 1.5.
 */
export const LEADER_DOT_CLEARANCE = 6;
export const SMALL_DOT_LEADER_CLEARANCE = 4.5;
/** Half the square a name avoids, if it can, around a small hollow dot without a name (dot 3, stroke, air). */
const SMALL_DOT_LABEL_CLEARANCE = 6;
export const SELECTED_LEADER_CLEARANCE = 11.5;
/** Half the square a name keeps free around a foreign dot when it hangs on a leader (it must not read as that dot's). */
const FOREIGN_DOT_CLEARANCE = 8;
const LABEL_CHAR_WIDTH = 0.6;

/** Box of a label whose near edge (or corner) sits at `at`, running away from its dot in direction `u`. */
function labelBoxToward(at: SvgPoint, u: SvgPoint, text: string): { box: Box; x: number; y: number; anchor: PlacedLabel['anchor'] } {
  const width = [...text].length * LABEL_CHAR_WIDTH * LABEL_FONT_SIZE;
  const height = LABEL_FONT_SIZE;
  const anchor: PlacedLabel['anchor'] = u.x > 0.38 ? 'start' : u.x < -0.38 ? 'end' : 'middle';
  const x0 = anchor === 'start' ? at.x : anchor === 'end' ? at.x - width : at.x - width / 2;
  // Straight up or down: the box sits beyond the point; sideways (also diagonal) it is centred on it, diagonal a little
  // further in the direction of u so the corner, not the middle, faces the dot.
  const cy = anchor === 'middle' ? at.y + Math.sign(u.y || -1) * (height / 2) : at.y + u.y * (height / 2);
  const box = { x0, y0: cy - height / 2, x1: x0 + width, y1: cy + height / 2 };
  return { box, x: anchor === 'start' ? x0 : anchor === 'end' ? x0 + width : at.x, y: cy, anchor };
}

/** Distance from a point to a box (0 inside). */
function boxDistance(box: Box, p: SvgPoint): number {
  return Math.hypot(Math.max(box.x0 - p.x, 0, p.x - box.x1), Math.max(box.y0 - p.y, 0, p.y - box.y1));
}

/** Whether the segment a–b comes closer than `clearance` to the point p. */
function segmentNear(a: SvgPoint, b: SvgPoint, p: SvgPoint, clearance: number): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(a.x + dx * t - p.x, a.y + dy * t - p.y) < clearance;
}

/** A dot a leader keeps clear of, with its own clearance (LEADER_DOT_CLEARANCE and its siblings). */
interface LeaderDot extends SvgPoint {
  id?: string;
  clearance: number;
}

/**
 * Every drawn dot of a frame as an obstacle for leader lines: the named places (the selected one with its ring) and
 * the small hollow dots without a name.
 */
function leaderDotsOf(data: Pick<LabelFrame, 'places' | 'smallDots'>, selectedId: string | null): LeaderDot[] {
  return [
    ...data.places
      .filter((place) => !place.atCenter)
      .map((place) => ({ id: place.id, x: place.x, y: place.y, clearance: place.id === selectedId ? SELECTED_LEADER_CLEARANCE : LEADER_DOT_CLEARANCE })),
    ...(data.smallDots ?? []).map((dot) => ({ x: dot.x, y: dot.y, clearance: SMALL_DOT_LEADER_CLEARANCE })),
  ];
}

/** Whether the leader a–b of the place `ownId` keeps clear of every other dot. */
function leaderClearOfDots(a: SvgPoint, b: SvgPoint, ownId: string, dots: readonly LeaderDot[]): boolean {
  return !dots.some((dot) => dot.id !== ownId && segmentNear(a, b, dot, dot.clearance));
}

/** Whether the segment a–b runs through the inside of the box (Liang–Barsky clipping). */
function segmentHitsBox(a: SvgPoint, b: SvgPoint, box: Box): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-dx, a.x - box.x0],
    [dx, box.x1 - a.x],
    [-dy, a.y - box.y0],
    [dy, box.y1 - a.y],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q <= 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 >= t1) return false;
  }
  return true;
}

/**
 * A short leader for a must-label without room next to its dot: sixteen directions, the one pointing away from the
 * centre first, at growing distances (radial callouts do not cross each other). The label keeps clear of names, obstacles and dots; its leader keeps clear of
 * other dots and names. Null when nothing within SHORT_LEADER_GAPS fits.
 */
function shortLeaderLabel(
  candidate: { id: string; text: string; x: number; y: number },
  origin: SvgPoint,
  size: number,
  blocked: readonly Box[],
  dots: readonly SvgPoint[],
  leaders: readonly NonNullable<GraphicLabel['leader']>[],
  {
    strict = true,
    lines = true,
    start = 6,
    leaderDots = [],
  }: { strict?: boolean; lines?: boolean; start?: number; leaderDots?: readonly LeaderDot[] } = {},
): GraphicLabel | null {
  const out = Math.atan2(candidate.y - origin.y, candidate.x - origin.x);
  const directions = Array.from({ length: LEADER_DIRECTIONS }, (_, i) => (i * 2 * Math.PI) / LEADER_DIRECTIONS)
    .map((angle) => ({ angle, off: Math.abs(Math.atan2(Math.sin(angle - out), Math.cos(angle - out))) }))
    .sort((a, b) => a.off - b.off)
    .map(({ angle }) => ({ x: Math.cos(angle), y: Math.sin(angle) }));
  // Strict: a foreign dot keeps more air from the name, so the name does not read as that dot's
  const dotBox = (p: SvgPoint): Box => squareAround(p, strict ? FOREIGN_DOT_CLEARANCE : DOT_CLEARANCE);
  const gaps = strict ? SHORT_LEADER_GAPS : [...SHORT_LEADER_GAPS, ...LEADER_GAPS.filter((g) => g > SHORT_LEADER_GAPS.at(-1)!)];
  for (const gap of gaps.filter((g) => g >= start + 4)) {
    for (const u of directions) {
      const at = { x: candidate.x + u.x * gap, y: candidate.y + u.y * gap };
      const { box, x, y, anchor } = labelBoxToward(at, u, candidate.text);
      if (box.x0 < 0 || box.y0 < 0 || box.x1 > size || box.y1 > size) continue;
      if (blocked.some((b) => boxesOverlap(b, box))) continue;
      if (dots.some((d) => boxesOverlap(dotBox(d), box))) continue;
      const leader = leaderLine(candidate, box, start)!;
      const from = { x: leader.x1, y: leader.y1 };
      const to = { x: leader.x2, y: leader.y2 };
      // A line never runs through a foreign dot, not even as the last resort (it would point at the wrong place)
      if (dots.some((d) => segmentNear(from, to, d, LEADER_DOT_CLEARANCE))) continue;
      if (!leaderClearOfDots(from, to, candidate.id, leaderDots)) continue;
      if (lines) {
        if (blocked.some((b) => segmentHitsBox(from, to, b))) continue;
        // Leaders do not cross each other, and the name does not cover an earlier leader
        if (leaders.some((l) => segmentsCross(from, to, { x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }))) continue;
        if (leaders.some((l) => segmentHitsBox({ x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }, box))) continue;
      }
      const label = { id: candidate.id, text: candidate.text, x: round1(x), y: round1(y), anchor, side: anchorSide(anchor, u), box };
      // Right next to the dot (or its ring) the name needs no line
      return Math.hypot(to.x - from.x, to.y - from.y) < 6 ? label : { ...label, leader };
    }
  }
  return null;
}

function anchorSide(anchor: PlacedLabel['anchor'], u: SvgPoint): PlacedLabel['side'] {
  if (anchor === 'start') return 'right';
  if (anchor === 'end') return 'left';
  return u.y < 0 ? 'above' : 'below';
}

function segmentsCross(a: SvgPoint, b: SvgPoint, c: SvgPoint, d: SvgPoint): boolean {
  const cross = (p: SvgPoint, q: SvgPoint, r: SvgPoint) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

/** Leader from the edge of the dot to the nearest point of the label box. */
function leaderLine(dot: SvgPoint, box: Box, start = 6): GraphicLabel['leader'] {
  const tx = Math.min(Math.max(dot.x, box.x0), box.x1);
  const ty = Math.min(Math.max(dot.y, box.y0), box.y1);
  const d = Math.hypot(tx - dot.x, ty - dot.y) || 1;
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
export function labelFrame(
  data: Pick<RegionMapData, 'centerName' | 'places'>,
  view: RadiusView,
  { landscapeLabels = 'hard' }: { landscapeLabels?: 'hard' | 'soft' } = {},
): LabelFrame {
  const places = view.points.flatMap((point, i) => {
    const place = data.places[i];
    return point.inFrame && place
      ? [{ id: place.id, name: place.shortName ?? place.name, x: point.drawn.x, y: point.drawn.y, atCenter: place.atCenter }]
      : [];
  });
  const landscapeBoxes = view.landscape.flatMap((line) => (line.label ? [line.label.box] : []));
  // Hard: no name covers a river or road name (home map). Soft: names avoid them if they can; a covered one is left out
  // (pages under /einsatzgebiet: place names come first, see planLabels)
  const obstacles = [...ringLabels(view).map((label) => label.box), ...(landscapeLabels === 'hard' ? landscapeBoxes : [])];
  const softObstacles = [
    ...view.landscape.flatMap((line) => polylineBoxes(pathPoints(line.d), view, { clear: LANDSCAPE_CLEAR })),
    ...(landscapeLabels === 'soft' ? landscapeBoxes : []),
  ];
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

export interface PlanLabelOptions {
  selectedId: string | null;
  /** Places drawn in full and named (pages under /einsatzgebiet); omitted: every place as on the home map. */
  emphasizeIds?: readonly string[];
  /** Emphasized places that need not carry a name. */
  unnamedIds?: readonly string[];
  labelPriority?: readonly string[];
  /** Name at the house instead of the centre's name. */
  centerLabel?: string;
}

export interface PlanLabels {
  labels: GraphicLabel[];
  /** Ids of landscape lines whose name gives way to a place name (pages under /einsatzgebiet). */
  hiddenLandscape: string[];
}

/**
 * All names of a plan, as RadiusGraphic draws them. With emphasized places (pages under /einsatzgebiet) every one of
 * them is named, with a leader line if need be, and river and road names give way to place names: a landscape name
 * under a place name or a leader is left out.
 */
export function planLabels(data: Pick<RegionMapData, 'centerName' | 'places'>, view: RadiusView, options: PlanLabelOptions): PlanLabels {
  const { selectedId, emphasizeIds, unnamedIds = [], labelPriority, centerLabel } = options;
  const emphasized = (id: string) => !emphasizeIds || emphasizeIds.includes(id) || id === selectedId;
  const full = labelFrame(data, view, { landscapeLabels: emphasizeIds ? 'soft' : 'hard' });
  const named = { ...full, ...(centerLabel ? { centerName: centerLabel } : {}) };
  // Dimmed places get no name; their dots may lie under a name (small and hollow)
  const smallDots = named.places.filter((place) => !emphasized(place.id) && !place.atCenter);
  const frame: LabelFrame = emphasizeIds
    ? {
        ...named,
        places: named.places.filter((place) => emphasized(place.id)),
        smallDots,
        // Namen meiden die kleinen hohlen Punkte, wo sie können (Kritik 2: ein hohler Punkt direkt vor „Butzbach“)
        softObstacles: [...(named.softObstacles ?? []), ...smallDots.map((dot) => squareAround(dot, SMALL_DOT_LABEL_CLEARANCE))],
        mustLabel: named.places.filter((place) => emphasized(place.id) && !unnamedIds.includes(place.id)).map((place) => place.id),
        priority: labelPriority,
      }
    : { ...named, priority: labelPriority };
  const labels = graphicLabels(frame, selectedId);
  if (!emphasizeIds) return { labels, hiddenLandscape: [] };
  const hiddenLandscape = view.landscape
    .filter(
      (line) =>
        line.label &&
        labels.some(
          (label) =>
            boxesOverlap(label.box, line.label!.box) ||
            (label.leader && segmentHitsBox({ x: label.leader.x1, y: label.leader.y1 }, { x: label.leader.x2, y: label.leader.y2 }, line.label!.box)),
        ),
    )
    .map((line) => line.id);
  return { labels, hiddenLandscape };
}

/** Neighbourhood for the crowding of a must-label (SVG units, about the width of a name). */
const CROWD_RADIUS = 36;

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
  // Two orders (crowded must-labels first, or all from the outside in), each with a repair: a name whose leader had to
  // cross another name or leader is placed earlier in the next round (it then gets the free room first). The layout
  // with the fewest crossings and the shortest leaders wins; on a tie the first one.
  let best: { labels: GraphicLabel[]; score: number } | null = null;
  // With small hollow dots (pages under /einsatzgebiet): first every order with the selected name also clear of them,
  // then without (when that leaves no clean room for the others)
  const variants = data.smallDots?.length ? [...LAYOUT_VARIANTS.map((v) => ({ ...v, selectedOffSmall: true })), ...LAYOUT_VARIANTS] : LAYOUT_VARIANTS;
  for (const variant of variants) {
    let first: string[] = variant.oneByOne ? [...(data.mustLabel ?? [])] : [];
    for (let round = 0; round < (variant.oneByOne ? 1 : LABEL_REPAIR_ROUNDS); round++) {
      const labels = layoutGraphicLabels(data, selectedId, first, variant);
      const crossings = leaderCrossings(labels);
      const missing = (data.mustLabel ?? []).filter((id) => !labels.some((label) => label.id === id)).length;
      const score = labelScore(labels, crossings.length) + missing * MISSING_LABEL_PENALTY;
      if (!best || score < best.score) best = { labels, score };
      // Good enough: nothing crosses and no leader is long
      if (best.score < LONG_LEADER_PENALTY && leaderCrossings(best.labels).length === 0) return best.labels;
      if (crossings.length === 0) break;
      const next = [...new Set([...first, ...crossings])];
      if (next.length === first.length) break;
      first = next;
    }
  }
  // Pages under /einsatzgebiet (every emphasized place named): a second look at the whole plan at once
  return data.mustLabel ? refineLabels(data, selectedId, best!.labels) : best!.labels;
}

// --- Feinschliff: alle Pflichtnamen zugleich (simuliertes Abkühlen) ---------------------------

/** Distances tried by the refinement (SVG units from the dot to the name); 0 = right next to it, on one of four sides. */
const REFINE_GAPS = [10, 14, 18, 24, 30, 38, 46, 56, 68, 80, 96] as const;
const REFINE_STEPS = 6000;
const REFINE_COST = Object.freeze({
  /** Two names over each other. */
  overlap: 5000,
  /** A name over a dot (half square DOT_CLEARANCE). */
  dot: 800,
  /** A name close to a foreign dot (half square FOREIGN_DOT_CLEARANCE): it may read as that dot's name. */
  foreignDot: 60,
  /**
   * A name without a leader that lies closer to a foreign dot than to its own: it reads as that dot's name (Kritik 2:
   * „Merenberg“ stood between its dot and Beselich's). Small hollow dots count less.
   */
  closerForeign: 600,
  closerSmall: 150,
  /** A line through a name, or two lines crossing. */
  line: 900,
  /** A line through a foreign dot (only the greedy start can have one; every other choice is free of them). */
  lineDot: 5000,
  /** A name over a landscape line or name (soft obstacle box). */
  soft: 4,
  /** Each unit of leader. */
  leader: 1,
  /** A leader longer than LONG_LEADER. */
  longLeader: 120,
  /** A name on the Pendel, or a line across it. */
  pendel: 500,
});

/** Small deterministic generator (mulberry32): the same plan always gets the same names. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashText(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

interface RefineOption {
  label: GraphicLabel;
  unary: number;
}

/**
 * Second look for plans with must-labels: each name may sit on one of four sides or on a short leader in sixteen
 * directions; simulated annealing (seeded, so every render is the same) looks for the assignment with the fewest
 * overlaps, lines through names, crossing lines and the shortest leaders. Keeps the greedy layout when nothing better
 * turns up.
 */
function refineLabels(data: LabelFrame, selectedId: string | null, greedy: GraphicLabel[]): GraphicLabel[] {
  const must = new Set(data.mustLabel ?? []);
  const movable = greedy.filter((label) => must.has(label.id) && label.id !== selectedId && label.id !== CENTER_LABEL_ID);
  if (movable.length < 2) return greedy;
  const fixedLabels = greedy.filter((label) => !movable.includes(label));
  const outer = data.places.filter((place) => !place.atCenter);
  const selected = outer.find((place) => place.id === selectedId);
  const hard = [
    centerBox(data.origin),
    ...(data.obstacles ?? []),
    ...(selected ? [squareAround(selected, SELECTED_RING_RADIUS + 1)] : []),
    ...fixedLabels.map((label) => label.box),
  ];
  const soft = data.softObstacles ?? [];
  // The Pendel (Vorlauf and Rücklauf to the selected place): names and lines stay off it
  const pendel = selected ? octilinear(data.origin, selected) : [];
  const pendelBoxes = selected ? polylineBoxes(pendel, data, { clear: CENTER_DOT_EXTENT, half: PENDEL_HALF_WIDTH }) : [];
  const fixedLeaders = fixedLabels.flatMap((label) => (label.leader ? [label.leader] : []));
  const dots = [data.origin, ...outer];
  const leaderDots = leaderDotsOf(data, selectedId);
  const segment = (l: NonNullable<GraphicLabel['leader']>) => [{ x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }] as const;

  const optionsFor = (current: GraphicLabel): RefineOption[] => {
    const place = outer.find((p) => p.id === current.id)!;
    const candidate = { id: place.id, text: current.text, x: place.x, y: place.y };
    const raw: GraphicLabel[] = [current];
    for (const side of ['right', 'left', 'above', 'below'] as const) {
      const { box, x, y, anchor } = labelBox(candidate, candidate.text, side, { fontSize: LABEL_FONT_SIZE, gap: LABEL_GAP });
      raw.push({ id: candidate.id, text: candidate.text, x, y, anchor, side, box });
    }
    for (const gap of REFINE_GAPS) {
      for (let i = 0; i < LEADER_DIRECTIONS; i++) {
        const angle = (i * 2 * Math.PI) / LEADER_DIRECTIONS;
        const u = { x: Math.cos(angle), y: Math.sin(angle) };
        const { box, x, y, anchor } = labelBoxToward({ x: candidate.x + u.x * gap, y: candidate.y + u.y * gap }, u, candidate.text);
        const leader = leaderLine(candidate, box)!;
        const short = Math.hypot(leader.x2 - leader.x1, leader.y2 - leader.y1) < 6;
        raw.push({ id: candidate.id, text: candidate.text, x: round1(x), y: round1(y), anchor, side: anchorSide(anchor, u), box, ...(short ? {} : { leader }) });
      }
    }
    return raw
      // A line through a foreign dot or a fixed name is never a choice (the current place stays: the greedy start)
      .filter(
        (label) =>
          label === current ||
          !label.leader ||
          (leaderClearOfDots(...segment(label.leader), place.id, leaderDots) && !hard.some((box) => segmentHitsBox(...segment(label.leader!), box))),
      )
      .filter(({ box }) => box.x0 >= 0 && box.y0 >= 0 && box.x1 <= data.size && box.y1 <= data.size)
      .filter(({ box }) => !hard.some((h) => boxesOverlap(h, box)))
      .map((label) => {
        let unary = 0;
        const own = label.leader ? 0 : boxDistance(label.box, place);
        for (const dot of dots) {
          if (dot === place) continue;
          if (boxesOverlap(squareAround(dot, DOT_CLEARANCE), label.box)) unary += REFINE_COST.dot;
          else if (boxesOverlap(squareAround(dot, FOREIGN_DOT_CLEARANCE), label.box)) unary += REFINE_COST.foreignDot;
          if (!label.leader && dot !== data.origin && boxDistance(label.box, dot) < own) unary += REFINE_COST.closerForeign;
        }
        if (!label.leader) for (const dot of data.smallDots ?? []) if (boxDistance(label.box, dot) < own) unary += REFINE_COST.closerSmall;
        unary += soft.filter((box) => boxesOverlap(box, label.box)).length * REFINE_COST.soft;
        if (pendelBoxes.some((box) => boxesOverlap(box, label.box))) unary += REFINE_COST.pendel;
        if (label.leader) {
          const [a, b] = segment(label.leader);
          if (pendel.slice(1).some((q, i) => segmentsCross(a, b, pendel[i], q))) unary += REFINE_COST.pendel;
          const length = Math.hypot(b.x - a.x, b.y - a.y);
          unary += length * REFINE_COST.leader + (length > LONG_LEADER ? REFINE_COST.longLeader : 0);
          if (!leaderClearOfDots(a, b, place.id, leaderDots)) unary += REFINE_COST.lineDot;
          for (const box of hard) if (segmentHitsBox(a, b, box)) unary += REFINE_COST.line;
          for (const l of fixedLeaders) if (segmentsCross(a, b, ...segment(l))) unary += REFINE_COST.line;
        }
        for (const l of fixedLeaders) if (segmentHitsBox(...segment(l), label.box)) unary += REFINE_COST.line;
        return { label, unary };
      });
  };

  const options = movable.map(optionsFor);
  if (options.some((list) => list.length === 0 || list[0].label !== movable[options.indexOf(list)])) return greedy;
  const pair = (a: GraphicLabel, b: GraphicLabel): number => {
    let cost = boxesOverlap(a.box, b.box) ? REFINE_COST.overlap : 0;
    if (a.leader && segmentHitsBox(...segment(a.leader), b.box)) cost += REFINE_COST.line;
    if (b.leader && segmentHitsBox(...segment(b.leader), a.box)) cost += REFINE_COST.line;
    if (a.leader && b.leader && segmentsCross(...segment(a.leader), ...segment(b.leader))) cost += REFINE_COST.line;
    return cost;
  };
  const choice = movable.map(() => 0);
  const costOf = (i: number, k: number) => options[i][k].unary + choice.reduce((sum, kj, j) => (j === i ? sum : sum + pair(options[i][k].label, options[j][kj].label)), 0);
  const total = () => choice.reduce((sum, k, i) => sum + options[i][k].unary, 0) + choice.reduce((sum, k, i) => sum + choice.slice(i + 1).reduce((s2, kj, dj) => s2 + pair(options[i][k].label, options[i + 1 + dj][kj].label), 0), 0);

  const random = seeded(hashText(movable.map((label) => label.id).join('|')));
  let current = total();
  const greedyCost = current;
  let best = { cost: current, choice: [...choice] };
  for (let step = 0; step < REFINE_STEPS; step++) {
    const temperature = 400 * Math.pow(0.002 / 1, step / REFINE_STEPS);
    const i = Math.floor(random() * movable.length);
    const k = Math.floor(random() * options[i].length);
    if (k === choice[i]) continue;
    const delta = costOf(i, k) - costOf(i, choice[i]);
    if (delta <= 0 || random() < Math.exp(-delta / temperature)) {
      choice[i] = k;
      current += delta;
      if (current < best.cost - 1e-6) best = { cost: current, choice: [...choice] };
    }
  }
  if (best.cost >= greedyCost - 1e-6) return greedy;
  const placed = new Map(best.choice.map((k, i) => [movable[i].id, options[i][k].label]));
  return greedy.map((label) => placed.get(label.id) ?? label);
}

/** Rounds of the repair in graphicLabels. */
const LABEL_REPAIR_ROUNDS = 4;
/** Orders tried: crowded must-labels first or all from the outside in; with or without the second look (swap). */
const LAYOUT_VARIANTS: readonly LayoutVariant[] = [
  { crowdFirst: true, secondLook: true },
  { crowdFirst: true, secondLook: false },
  { crowdFirst: false, secondLook: true },
  { crowdFirst: false, secondLook: false },
  { crowdFirst: true, secondLook: true, oneByOne: true },
  { crowdFirst: false, secondLook: true, oneByOne: true },
];
interface LayoutVariant {
  crowdFirst: boolean;
  secondLook: boolean;
  /** The selected name first keeps clear of the small hollow dots as well. */
  selectedOffSmall?: boolean;
  /** Each must-label in turn gets its place at once, next to the dot or on a leader (instead of all adjacent first). */
  oneByOne?: boolean;
}
/** Extra cost of one leader longer than LONG_LEADER. */
const LONG_LEADER_PENALTY = 120;
/** Leaders longer than this (SVG units) count extra: the reader loses the dot. */
const LONG_LEADER = 70;

/** Extra cost of a must-label left without a name: more than any crossing (every emphasized place is named). */
const MISSING_LABEL_PENALTY = 10_000;

/** Cost of a layout: crossings weigh most, then long leaders, then the total length of all leaders. */
function labelScore(labels: readonly GraphicLabel[], crossings: number): number {
  const lengths = labels.flatMap((label) => (label.leader ? [Math.hypot(label.leader.x2 - label.leader.x1, label.leader.y2 - label.leader.y1)] : []));
  return crossings * 2000 + lengths.filter((length) => length > LONG_LEADER).length * LONG_LEADER_PENALTY + lengths.reduce((sum, length) => sum + length, 0);
}

/** Ids of labels whose leader runs through another name or crosses another leader. */
export function leaderCrossings(labels: readonly GraphicLabel[]): string[] {
  const out = new Set<string>();
  for (const label of labels) {
    if (!label.leader) continue;
    const from = { x: label.leader.x1, y: label.leader.y1 };
    const to = { x: label.leader.x2, y: label.leader.y2 };
    for (const other of labels) {
      if (other === label) continue;
      const hitsName = segmentHitsBox(from, to, other.box);
      const crosses = other.leader ? segmentsCross(from, to, { x: other.leader.x1, y: other.leader.y1 }, { x: other.leader.x2, y: other.leader.y2 }) : false;
      if (hitsName || crosses) out.add(label.id);
    }
  }
  return [...out];
}

function layoutGraphicLabels(
  data: LabelFrame,
  selectedId: string | null,
  first: readonly string[],
  { crowdFirst, secondLook, selectedOffSmall = false }: LayoutVariant,
): GraphicLabel[] {
  const outer = data.places.filter((place) => !place.atCenter);
  const selected = outer.find((place) => place.id === selectedId);
  const leaderDots = leaderDotsOf(data, selectedId);
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
  // Must-labels in a crowd go first (they have the fewest free sides); the others from the outside in
  const crowd = (place: FramePlace) => outer.filter((other) => other !== place && Math.hypot(other.x - place.x, other.y - place.y) < CROWD_RADIUS).length;
  // Repair round: names that had to cross go first (after the priority places)
  const early = (place: FramePlace) => (first.includes(place.id) ? 0 : 1);
  const rest = unselected
    .filter((place) => must.has(place.id) || priority.includes(place.id) || distance(place) >= minDistance)
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        early(a) - early(b) ||
        (crowdFirst && must.has(a.id) && must.has(b.id) ? crowd(b) - crowd(a) : 0) ||
        distance(b) - distance(a),
    );

  const fixed = [centerBox(data.origin), ...(data.obstacles ?? [])];
  const base = { size: data.size, fontSize: LABEL_FONT_SIZE, gap: LABEL_GAP, dotRadius: DOT_CLEARANCE };
  // Lines to stay off if possible: the landscape and, with a choice, the Pendel to the place.
  const soft = [
    ...(data.softObstacles ?? []),
    // The pair runs PENDEL_PAIR / 2 either side of the route, plus half a stroke
    ...(selected ? polylineBoxes(octilinear(data.origin, selected), data, { clear: CENTER_DOT_EXTENT, half: PENDEL_HALF_WIDTH }) : []),
  ];

  let selectedLabel: GraphicLabel | undefined;
  if (selected) {
    const candidate = { id: selected.id, text: selected.name, x: selected.x, y: selected.y };
    const ringGap = SELECTED_RING_RADIUS + 4;
    // First clear of every dot (a little further out if needed); then it may cover a dot; the
    // ring and landscape labels give way last.
    // With emphasized neighbours (pages under /einsatzgebiet) the name first keeps wider air from their dots, so it
    // does not read as a neighbour's name
    const wide = data.mustLabel ? [FOREIGN_DOT_CLEARANCE] : [];
    type Tier = { gap: number; ignoreDots: boolean; obstacles: Box[]; dotRadius?: number; small?: boolean };
    const offDots: Tier[] = [
      // Off the lines (landscape, Pendel) comes first, then the wider air from the neighbours' dots
      ...wide.flatMap((dotRadius) => SELECTED_EXTRA_GAPS.map((extra) => ({ gap: ringGap + extra, ignoreDots: false, obstacles: [...fixed, ...soft], dotRadius }))),
      ...SELECTED_EXTRA_GAPS.map((extra) => ({ gap: ringGap + extra, ignoreDots: false, obstacles: [...fixed, ...soft] })),
      ...wide.flatMap((dotRadius) => SELECTED_EXTRA_GAPS.map((extra) => ({ gap: ringGap + extra, ignoreDots: false, obstacles: fixed, dotRadius }))),
      ...SELECTED_EXTRA_GAPS.map((extra) => ({ gap: ringGap + extra, ignoreDots: false, obstacles: fixed })),
    ];
    const tiers: Tier[] = [
      // Pages under /einsatzgebiet: first also clear of the small hollow dots (Kritik 2: one sat right before „Butzbach“)
      ...(selectedOffSmall && data.smallDots?.length ? offDots.map((tier) => ({ ...tier, small: true })) : []),
      ...offDots,
      { gap: ringGap, ignoreDots: true, obstacles: fixed },
      { gap: ringGap, ignoreDots: true, obstacles: [centerBox(data.origin)] },
    ];
    for (const { gap, ignoreDots, obstacles, dotRadius, small } of tiers) {
      // Before the name may cover a dot: a short leader from the ring, clear of every dot
      if (ignoreDots && data.mustLabel) {
        // Off the lines first (landscape, Pendel), then over them
        for (const [strict, blocked] of [[true, [...fixed, ...soft]], [false, [...fixed, ...soft]], [true, fixed], [false, fixed]] as const) {
          selectedLabel ??=
            shortLeaderLabel(candidate, data.origin, data.size, blocked, [data.origin, ...unselected], [], {
              strict,
              start: SELECTED_RING_RADIUS + 1,
              leaderDots,
            }) ??
            undefined;
        }
        if (selectedLabel) break;
      }
      [selectedLabel] = layoutLabels([{ ...candidate, gap, ignoreDots }], {
        ...base,
        ...(dotRadius ? { dotRadius } : {}),
        obstacles,
        extraDots: ignoreDots ? [] : [...unselected, ...(small ? (data.smallDots ?? []) : [])],
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
  type Candidate = (typeof candidates)[number];
  const others: GraphicLabel[] = [];
  const leadersSoFar = () => others.flatMap((label) => (label.leader ? [label.leader] : []));
  // Leaders as obstacles: a later name never covers an earlier line
  const leaderBoxes = () =>
    leadersSoFar().flatMap((l) => polylineBoxes([{ x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }], data, { step: 3, half: 1.5 }));

  /**
   * A must-label without room next to its dot: a short leader in one of sixteen directions (outward preferred), then
   * further out, then long leaders straight out; the line runs through no name and crosses no other line where any
   * choice allows it.
   */
  const placeWithLeader = (candidate: Candidate, cleanOnly = false) => {
    const blocked = [...taken, ...others.map((label) => label.box)];
    const dotsAround = [data.origin, ...unselected.filter((place) => place.id !== candidate.id), ...(selected ? [selected] : [])];
    const leaders = leadersSoFar();
    for (const strict of [true, false]) {
      const short = shortLeaderLabel(candidate, data.origin, data.size, blocked, dotsAround, leaders, { strict, leaderDots });
      if (short) {
        others.push(short);
        return;
      }
    }
    // Long leaders straight out (four sides): first one that runs through no name and crosses no other leader
    const offDots = (label: PlacedLabel) => {
      const leader = leaderLine(candidate, label.box)!;
      return leaderClearOfDots({ x: leader.x1, y: leader.y1 }, { x: leader.x2, y: leader.y2 }, candidate.id, leaderDots);
    };
    const clean = (label: PlacedLabel) => {
      const leader = leaderLine(candidate, label.box)!;
      const from = { x: leader.x1, y: leader.y1 };
      const to = { x: leader.x2, y: leader.y2 };
      return (
        offDots(label) &&
        !blocked.some((box) => segmentHitsBox(from, to, box)) &&
        !leaders.some((l) => segmentsCross(from, to, { x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }) || segmentHitsBox({ x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }, label.box))
      );
    };
    let fallback: PlacedLabel | undefined;
    for (const ignoreDots of [false, true]) {
      for (const gap of LEADER_GAPS) {
        for (const side of ['right', 'left', 'above', 'below'] as const) {
          const [label] = layoutLabels([{ ...candidate, gap, ignoreDots }], { ...base, sides: [side], extraDots: dotsAround, obstacles: blocked });
          if (!label || !offDots(label)) continue;
          fallback ??= label;
          if (clean(label)) {
            others.push({ ...label, leader: leaderLine(candidate, label.box) });
            return;
          }
        }
      }
    }
    if (cleanOnly) return;
    // Last resort (very dense centre): any free room for the name, the line may cross (graphicLabels repairs)
    const last = shortLeaderLabel(candidate, data.origin, data.size, blocked, dotsAround, leaders, { strict: false, lines: false, leaderDots });
    if (last) others.push(last);
    else if (fallback) others.push({ ...fallback, leader: leaderLine(candidate, fallback.box) });
  };

  // Repair round: names whose line had to cross in the round before get their place first, next to the dot or on a
  // leader
  const isFirst = (c: Candidate) => first.includes(c.id) && must.has(c.id);
  for (const candidate of candidates.filter(isFirst)) {
    const [adjacent] = layoutLabels([candidate], {
      ...restOptions,
      extraDots: [...restOptions.extraDots, ...candidates.filter((c) => c !== candidate)],
      obstacles: [...taken, ...others.map((label) => label.box), ...leaderBoxes()],
    });
    if (adjacent) others.push(adjacent);
    else placeWithLeader(candidate);
  }

  // Priority places first, both passes; then the rest. Each group: first off the lines; places without such room get
  // a second try that may cross a line.
  const isPriority = (c: { id: string }) => priority.includes(c.id);
  const remaining = candidates.filter((c) => !isFirst(c));
  for (const group of [remaining.filter(isPriority), remaining.filter((c) => !isPriority(c))]) {
    if (group.length === 0) continue;
    const blockedBy = () => [...taken, ...others.map((label) => label.box), ...leaderBoxes()];
    const extraDots = [...restOptions.extraDots, ...candidates.filter((c) => !group.includes(c))];
    const clear = layoutLabels(group, { ...restOptions, extraDots, obstacles: [...blockedBy(), ...soft] });
    others.push(...clear);
    const crossing = layoutLabels(
      group.filter((c) => !clear.some((label) => label.id === c.id)),
      { ...restOptions, extraDots, obstacles: blockedBy() },
    );
    others.push(...crossing);
  }

  // Must-labels still without a name: with a leader line
  for (const candidate of candidates.filter((c) => must.has(c.id) && !others.some((label) => label.id === c.id))) placeWithLeader(candidate);

  // Second look with every name in place: a name whose line still crosses gets a new place where none crosses, if any
  const fixedLabels = [...(selectedLabel ? [selectedLabel] : []), ...(centerLabel ? [centerLabel] : [])];
  for (const id of secondLook ? leaderCrossings([...fixedLabels, ...others]) : []) {
    const at = others.findIndex((label) => label.id === id);
    const candidate = candidates.find((c) => c.id === id);
    if (at < 0 || !candidate) continue;
    const [removed] = others.splice(at, 1);
    const count = others.length;
    placeWithLeader(candidate, true);
    if (others.length > count) continue;
    // Still no clean place: move the names in its way as well (it first, then they), keep it if fewer lines cross
    const leader = removed.leader;
    const inWay = leader
      ? others.filter(
          (other) =>
            segmentHitsBox({ x: leader.x1, y: leader.y1 }, { x: leader.x2, y: leader.y2 }, other.box) ||
            (other.leader && segmentsCross({ x: leader.x1, y: leader.y1 }, { x: leader.x2, y: leader.y2 }, { x: other.leader.x1, y: other.leader.y1 }, { x: other.leader.x2, y: other.leader.y2 })),
        )
      : [];
    const before = [...others, removed];
    const crossingsBefore = leaderCrossings([...fixedLabels, ...before]).length;
    const kept = others.filter((other) => !inWay.includes(other));
    others.length = 0;
    others.push(...kept);
    for (const c of [candidate, ...inWay.flatMap((other) => candidates.filter((x) => x.id === other.id))]) placeWithLeader(c);
    const complete = others.length === before.length;
    if (!complete || leaderCrossings([...fixedLabels, ...others]).length >= crossingsBefore) {
      others.length = 0;
      others.push(...before);
    }
  }

  others.sort((a, b) => candidates.findIndex((c) => c.id === a.id) - candidates.findIndex((c) => c.id === b.id));
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
/** Half the width the Pendel takes (pair offset plus half the 3-unit stroke, plus one unit of air). */
const PENDEL_HALF_WIDTH = PENDEL_PAIR / 2 + 1.5 + 1;

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
