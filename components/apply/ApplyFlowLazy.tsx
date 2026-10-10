'use client';

import { lazy } from 'react';
import { HydrateNear } from '@/components/layout/HydrateNear';
import type { ApplyFlowClientProps } from './ApplyFlowClient';

const ladeFlow = () => import('./ApplyFlowClient');
const ApplyFlowClient = lazy(() => ladeFlow().then((mod) => ({ default: mod.ApplyFlowClient })));

/**
 * Eingebetteter Flow unter der Falz der Stellenseite (V6-A2): Flow und react-hook-form laden im Leerlauf nach
 * dem ersten Bild und hydrieren erst in Reichweite, bei #bewerben (Knopf im Kopf, Direktsprung) und bei Fokus
 * sofort. Props aus flowClientProps auf dem Server.
 */
export function ApplyFlowLazy(props: ApplyFlowClientProps) {
  return (
    <HydrateNear laden={ladeFlow}>
      <ApplyFlowClient {...props} />
    </HydrateNear>
  );
}
