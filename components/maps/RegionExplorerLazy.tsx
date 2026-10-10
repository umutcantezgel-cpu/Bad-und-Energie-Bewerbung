'use client';

import { lazy } from 'react';
import { HydrateNear } from '@/components/layout/HydrateNear';
import type { RegionExplorerProps } from './RegionExplorer';

const RegionExplorer = lazy(() => import('./RegionExplorer').then((mod) => ({ default: mod.RegionExplorer })));

/**
 * Einsatzgebiet weit unten auf der Startseite (V6-A2): Server-HTML wie bisher (ohne JavaScript gesperrte
 * Wahl), Code und Hydrierung erst in Reichweite, bei #einsatzgebiet sofort.
 */
export function RegionExplorerLazy(props: RegionExplorerProps) {
  return (
    <HydrateNear>
      <RegionExplorer {...props} />
    </HydrateNear>
  );
}
