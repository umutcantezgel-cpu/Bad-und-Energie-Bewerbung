import { REGION } from '@/lib/content/region';
import { regionalLocations } from '@/lib/data/locations';
import { CENTER_MERGE_KM } from '@/lib/maps/google-maps-config';
import { createRadiusProjection, haversineKm } from '@/lib/maps/projection';
import { GRAPHIC_PADDING, GRAPHIC_SIZE, centerBox, clearOfHouse, ringLabels, ringsFor } from './graphic';
import { projectLandscape } from './landscape';
import type { RadiusView, RegionMapData, RegionPlace } from './types';

/**
 * Data of the Einsatzgebiet graphic, computed on the server (RegionMap). The client explorer gets
 * plain numbers and strings only, never lib/content or lib/data.
 */

/**
 * Radius switch (E-START-033): 15 and 25 km are a tool to make the distance tangible, not a
 * company statement; the promise stays REGION.radiusKm (35 km, fact radius35).
 */
export const SWITCH_RADII_KM: readonly number[] = Object.freeze([15, 25, REGION.radiusKm]);

/**
 * MENSCHEN M-016 (E-START-038): the descriptions of Nauborn, Braunfels and Gießen are business
 * claims („vielen Wärmepumpenmodernisierungen“, „anspruchsvollen Sanierungsobjekten“, „wichtiges
 * Kundendienstgebiet“), not locations. They stay out of the page, including the client payload,
 * until the owner confirms them. The other seven describe the location and are shown verbatim.
 */
export const WITHHELD_CHARACTER_IDS: readonly string[] = Object.freeze(['loc-nauborn', 'loc-braunfels', 'loc-giessen']);

/** Short description of a place (lib/data/locations.ts `character`), or null where M-016 withholds it. */
export function placeCharacter(id: string): string | null {
  if (WITHHELD_CHARACTER_IDS.includes(id)) return null;
  return regionalLocations.find((location) => location.id === id)?.character ?? null;
}

const center = { lat: REGION.center.latitude, lng: REGION.center.longitude };

/** Same spot as the headquarters (e.g. "Wetzlar Kernstadt"): drawn as the house in the middle. */
function isAtCenter(location: { latitude: number; longitude: number }): boolean {
  return haversineKm(center, { lat: location.latitude, lng: location.longitude }) < CENTER_MERGE_KM;
}

/** REGION.locations with what the explorer shows: rating (Kerngebiet) and short description. */
export function regionPlaces(): RegionPlace[] {
  return REGION.locations.map((location) => ({
    id: location.id,
    name: location.name,
    postalCode: location.postalCode,
    distanceKm: location.distanceKm,
    commuteMinutes: location.commuteMinutes,
    isCoreZone: location.isCoreZone,
    character: placeCharacter(location.id),
    atCenter: isAtCenter(location),
  }));
}

/** Margin around the viewBox inside which a place still counts as in the frame. */
const FRAME_MARGIN = 6;

/** One view: the chosen ring fills the frame (zoom), places at their true relative positions. */
export function radiusView(radiusKm: number, radii: readonly number[] = SWITCH_RADII_KM): RadiusView {
  const projection = createRadiusProjection({ center, radiusKm, size: GRAPHIC_SIZE, padding: GRAPHIC_PADDING });
  const raw = REGION.locations.map((location) => {
    const { x, y } = projection.projectRaw({ lat: location.latitude, lng: location.longitude });
    const inFrame = x >= FRAME_MARGIN && y >= FRAME_MARGIN && x <= projection.size - FRAME_MARGIN && y <= projection.size - FRAME_MARGIN;
    return { id: location.id, x, y, inFrame };
  });
  // The headquarters place is the house itself and places outside the frame are not drawn: both stay put.
  const fixed = raw.map((p, i) => !p.inFrame || isAtCenter(REGION.locations[i]));
  const drawn = clearOfHouse(raw, projection.origin, fixed);
  const points = raw.map((p, i) => ({ ...p, drawn: drawn[i] }));
  const rings = ringsFor(radii, radiusKm, projection.unitsPerKm);
  const base = { origin: projection.origin, rings };
  const landscape = projectLandscape(projection, {
    dots: points.filter((p) => p.inFrame).map((p) => p.drawn),
    obstacles: [centerBox(projection.origin), ...ringLabels(base).map((label) => label.box)],
  });
  return {
    radiusKm,
    size: projection.size,
    origin: projection.origin,
    radius: projection.radius,
    unitsPerKm: projection.unitsPerKm,
    rings,
    points,
    landscape,
  };
}

/** Everything the explorer needs; built once per server process. */
export function buildRegionMapData(): RegionMapData {
  return {
    centerName: REGION.center.name,
    radiusKm: REGION.radiusKm,
    radii: SWITCH_RADII_KM,
    places: regionPlaces(),
    views: SWITCH_RADII_KM.map((radiusKm) => radiusView(radiusKm)),
  };
}
