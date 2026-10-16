'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AGENTUR, agenturRel } from './agentur';

/**
 * Link der Agenturnennung (_werkstatt/nennung N-05). Der Fuß sitzt im Root-Layout und kennt den Pfad nicht; die Insel
 * liest ihn wie FooterSwitch. Next.js rendert sie beim Vorrendern bzw. beim Rendern der Anfrage auf dem Server mit
 * dem Pfad der Seite, darum steht rel schon im ausgelieferten HTML jeder Seite richtig.
 */
export function AgenturLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a href={AGENTUR.url} target="_blank" rel={agenturRel(usePathname())} className={className}>
      {children}
    </a>
  );
}
