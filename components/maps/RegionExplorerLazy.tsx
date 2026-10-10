'use client';

import { lazy } from 'react';
import { HydrateNear } from '@/components/layout/HydrateNear';
import type { RegionExplorerProps } from './RegionExplorer';

const ladeExplorer = () => import('./RegionExplorer');
const RegionExplorer = lazy(() => ladeExplorer().then((mod) => ({ default: mod.RegionExplorer })));

/**
 * Einsatzgebiet weit unten auf der Startseite (V6-A2): Server-HTML wie bisher (ohne JavaScript gesperrte
 * Wahl), Code im Leerlauf nach dem ersten Bild, Hydrierung erst in Reichweite, bei #einsatzgebiet sofort.
 */
export function RegionExplorerLazy(props: RegionExplorerProps) {
  return (
    <HydrateNear laden={ladeExplorer}>
      <RegionExplorer {...props} />
    </HydrateNear>
  );
}
