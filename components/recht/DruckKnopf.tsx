'use client';

import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/icons';
import styles from './recht.module.css';

export const DRUCK_LABEL = 'Drucken oder als PDF speichern';

const keinAbo = () => () => {};
const imBrowser = () => typeof window.print === 'function';
const aufDemServer = () => false;

/**
 * „Drucken oder als PDF speichern“ (E-RECHT-013): ruft den Druckdialog des Browsers, in dem man auch als PDF
 * sichert. Client-Insel ohne Zustand. Ohne JavaScript kann der Knopf nichts tun und erscheint darum erst im
 * Browser (Server-Fassung: nichts); der Platz ist im Kopf reserviert, nichts verschiebt sich. Zweitrangig:
 * Navy-Kontur, kein Rot (E-016). Im Druck ausgeblendet.
 */
export function DruckKnopf({ label = DRUCK_LABEL }: { label?: string }) {
  const kannDrucken = useSyncExternalStore(keinAbo, imBrowser, aufDemServer);
  if (!kannDrucken) return null;
  return (
    <button type="button" className={`${styles.druck} rounded-1 print-hidden`} data-motion="druck" onClick={() => window.print()}>
      <Icon name="printer" size="md" />
      <span>{label}</span>
    </button>
  );
}
