'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { isFocusMode } from './nav';

export interface FooterSwitchProps {
  /** Three-column footer; reserves the sticky apply bar's height below lg. */
  full: ReactNode;
  /** Legal links and copyright only, for the distraction-free flow (/bewerbung…). */
  slim: ReactNode;
}

/** Picks the footer for the current route. Both variants are rendered on the server. */
export function FooterSwitch({ full, slim }: FooterSwitchProps) {
  return isFocusMode(usePathname()) ? slim : full;
}
