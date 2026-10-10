'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { isFocusMode } from './nav';

export interface FooterSwitchProps {
  /** Full navy footer (fuss/FussVoll); reserves the sticky apply bar's height below lg. */
  full: ReactNode;
  /** Slim navy footer (fuss/FussSchmal): legal links, phone, WhatsApp, register line, for the flow (/bewerbung…). */
  slim: ReactNode;
}

/** Picks the footer for the current route. Both variants are rendered on the server. */
export function FooterSwitch({ full, slim }: FooterSwitchProps) {
  return isFocusMode(usePathname()) ? slim : full;
}
