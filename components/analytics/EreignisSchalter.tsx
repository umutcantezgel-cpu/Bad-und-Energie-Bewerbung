import type { ReactElement } from 'react';

import { EREIGNIS_META } from '@/lib/attribution/ereignisse';
import { funnelEventsEnabled } from '@/lib/env';

/**
 * Schalter FUNNEL_EVENTS (lib/env.ts, Standard aus bis zur Freigabe M-034) für den Browser: Nur mit diesem
 * Meta-Element sendet die Seite cookielose Ereignisse an /api/e (lib/attribution/ereignisse.ts).
 *
 * Steht im Root-Layout und nur dort, damit der eingebettete Flow auf den Stellenseiten und die Klicks auf WhatsApp
 * und Telefon auf jeder Seite zählen (Plan §D), nicht nur auf /bewerbung. Server-Komponente ohne JS; React hebt
 * das Meta-Element in den <head>.
 */
export function EreignisSchalter(): ReactElement | null {
  return funnelEventsEnabled() ? <meta name={EREIGNIS_META} content="an" /> : null;
}

export default EreignisSchalter;
