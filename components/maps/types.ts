import type { CommutePlace } from '@/lib/maps/commute';
import type { SvgPoint } from '@/lib/maps/projection';

/** A REGION location with its position in the radius graphic. */
export interface RegionPlace extends CommutePlace {
  x: number;
  y: number;
  /** Same spot as the headquarters (e.g. "Wetzlar Kernstadt"): drawn as the center dot. */
  atCenter: boolean;
}

/** Plain, serializable data the server hands to the client explorer. */
export interface RegionMapData {
  centerName: string;
  radiusKm: number;
  /** Square viewBox edge length. */
  size: number;
  origin: SvgPoint;
  /** Radius circle in SVG units. */
  radius: number;
  /** Sorted by distance (as in REGION.locations). */
  places: RegionPlace[];
}
