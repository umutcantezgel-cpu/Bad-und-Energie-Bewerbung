import { REGION } from '@/lib/content/region';
import { CENTER_MERGE_KM } from '@/lib/maps/google-maps-config';
import { isGoogleMapsConfigured } from '@/lib/maps/keys';
import { createRadiusProjection, haversineKm } from '@/lib/maps/projection';
import { GRAPHIC_PADDING, GRAPHIC_SIZE } from './graphic';
import { RegionExplorer } from './RegionExplorer';
import type { RegionMapData } from './types';

export interface RegionMapProps {
  className?: string;
}

const center = { lat: REGION.center.latitude, lng: REGION.center.longitude };
const projection = createRadiusProjection({
  center,
  radiusKm: REGION.radiusKm,
  size: GRAPHIC_SIZE,
  padding: GRAPHIC_PADDING,
});

/** Computed once on the server; the client gets plain numbers, not lib/content. */
const REGION_MAP_DATA: RegionMapData = {
  centerName: REGION.center.name,
  radiusKm: REGION.radiusKm,
  size: projection.size,
  origin: projection.origin,
  radius: projection.radius,
  places: REGION.locations.map((location) => {
    const point = { lat: location.latitude, lng: location.longitude };
    return {
      id: location.id,
      name: location.name,
      postalCode: location.postalCode,
      distanceKm: location.distanceKm,
      commuteMinutes: location.commuteMinutes,
      ...projection.project(point),
      atCenter: haversineKm(center, point) < CENTER_MERGE_KM,
    };
  }),
};

/**
 * Einsatzgebiet: typographic 35 km radius graphic plus the commute calculator ("Wo wohnst du?").
 * Google Maps loads only after an explicit click (2-click consent) and only if a key is configured.
 */
export function RegionMap({ className }: RegionMapProps) {
  return <RegionExplorer data={REGION_MAP_DATA} mapsAvailable={isGoogleMapsConfigured()} className={className} />;
}
