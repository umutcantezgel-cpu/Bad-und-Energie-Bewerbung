'use client';

import { lazy } from 'react';
import { HydrateNear } from '@/components/layout/HydrateNear';
import { nachDerFront } from '@/lib/motion/seitenwechsel';
import type { ApplyFlowClientProps } from './ApplyFlowClient';

const ladeFlow = () => import('./ApplyFlowClient');
// Nach einem Seitenwechsel mit Wärmefront setzt der Flow erst ein, wenn die Front zu ist (E-031, Prüfrunde 5 C5-2)
const ApplyFlowClient = lazy(() => Promise.all([ladeFlow(), nachDerFront()]).then(([mod]) => ({ default: mod.ApplyFlowClient })));

/**
 * Eingebetteter Flow unter der Falz der Stellenseite (V6-A2): Flow und react-hook-form laden im Leerlauf nach
 * dem ersten Bild und hydrieren erst in Reichweite, bei #bewerben (Knopf im Kopf, Direktsprung) und bei Fokus
 * sofort. Props aus flowClientProps auf dem Server. Kommt die Seite mit der Wärmefront, steht bis zu ihrem Ende der
 * Platzhalter (ApplyFallback); die Front wartet nicht auf den Flow, er wartet auf sie (lib/motion/seitenwechsel.ts
 * nachDerFront): So malt er weder unter der Deckung noch beim Aufdecken.
 */
export function ApplyFlowLazy(props: ApplyFlowClientProps) {
  return (
    <HydrateNear laden={ladeFlow}>
      <ApplyFlowClient {...props} />
    </HydrateNear>
  );
}
