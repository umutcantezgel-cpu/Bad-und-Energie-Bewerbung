import type { CommutePlace } from '@/lib/maps/commute';
import type { SvgPoint } from '@/lib/maps/projection';

/** A REGION location as the client explorer needs it (commute data, rating, short description). */
export interface RegionPlace extends CommutePlace {
  /** „Kerngebiet“ (true) or „Regionales Einsatzgebiet“ (false), from lib/data/locations.ts. */
  isCoreZone: boolean;
  /**
   * Short location description from lib/data/locations.ts, or null where it is withheld:
   * the three business claims wait for the owner (MENSCHEN M-016, E-START-038).
   */
  character: string | null;
  /** Same spot as the headquarters (e.g. "Wetzlar Kernstadt"): drawn as the center house. */
  atCenter: boolean;
}

/** Position of a place in one radius view. */
export interface ViewPoint {
  id: string;
  x: number;
  y: number;
  /** Inside the square viewBox (with a small margin); places outside are not drawn. */
  inFrame: boolean;
}

/** A ring of the radius graphic (15, 25 or 35 km, straight-line distance). */
export interface ViewRing {
  km: number;
  /** Radius in SVG units. */
  r: number;
}

export type LandscapeId = 'lahn' | 'dill' | 'a45' | 'b49';

/** One schematic line of the landscape layer (river or road), already projected and routed at 45°. */
export interface LandscapeLine {
  id: LandscapeId;
  kind: 'fluss' | 'strasse';
  name: string;
  /** SVG path data. */
  d: string;
  /** Label anchor (render with dominant-baseline="central"), or null when it has no room. */
  label: { x: number; y: number; anchor: 'start' | 'middle' | 'end'; box: { x0: number; y0: number; x1: number; y1: number } } | null;
}

/**
 * The graphic at one radius: the frame shows the chosen ring (15, 25 or 35 km) edge to edge, so a
 * smaller radius zooms in. Computed on the server for every radius; the client only switches.
 */
export interface RadiusView {
  radiusKm: number;
  /** Square viewBox edge length. */
  size: number;
  origin: SvgPoint;
  /** Radius of the chosen ring in SVG units. */
  radius: number;
  unitsPerKm: number;
  /** Rings up to the chosen one (the larger ones lie outside the frame). */
  rings: ViewRing[];
  /** One entry per place, in the order of RegionMapData.places. */
  points: ViewPoint[];
  landscape: LandscapeLine[];
}

/** Plain, serializable data the server hands to the client explorer. */
export interface RegionMapData {
  centerName: string;
  /** The promise (REGION.radiusKm, 35 km); the default view. */
  radiusKm: number;
  /** Radii of the switch, ascending (15, 25, 35). */
  radii: readonly number[];
  /** Sorted by distance (as in REGION.locations). */
  places: RegionPlace[];
  /** One view per radius, in the order of `radii`. */
  views: RadiusView[];
}
