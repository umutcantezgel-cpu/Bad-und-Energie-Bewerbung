import type { ReactNode } from 'react';
import { isGoogleMapsConfigured } from '@/lib/maps/keys';
import { RegionExplorerLazy } from './RegionExplorerLazy';
import { buildRegionMapData } from './views';

export interface RegionMapProps {
  /** Section heading, placed by the explorer above the switch (mobile) or in the left column. */
  header?: ReactNode;
  className?: string;
}

/** Computed once on the server; the client gets plain numbers, not lib/content. */
const REGION_MAP_DATA = buildRegionMapData();

/**
 * Einsatzgebiet: radius graphic (15/25/35 km, Lahn, Dill, A45, B49 schematisch) and the place
 * choice („Wo wohnst du?“). Google Maps loads only after an explicit click (2-click consent) and
 * only if a key is configured (E-START-032, E-START-056: key and loading path unchanged). The explorer's
 * code loads and hydrates only near the viewport (RegionExplorerLazy, V6-A2); its server HTML is unchanged.
 */
export function RegionMap({ header, className }: RegionMapProps) {
  return <RegionExplorerLazy data={REGION_MAP_DATA} mapsAvailable={isGoogleMapsConfigured()} header={header} className={className} />;
}
