import { ApplyFlowClient } from './ApplyFlowClient';
import { flowClientProps } from './flow-props';
import type { ApplyFlowProps } from './types';

/**
 * Der eine Bewerbungsflow (ROADMAP §6, C1) für /bewerbung, Stellenseiten und später /lp.
 * Ohne 'use client': Auf dem Server liest er Registry und Stammdaten (flowClientProps) und reicht nur die
 * kleinen Auswahl- und Kontaktdaten an den Client-Teil weiter. Die Stellenseite lädt den Flow unter der
 * Falz stattdessen über <ApplyFlowLazy> (V6-A2) und importiert diese Datei nicht.
 */
export function ApplyFlow(props: ApplyFlowProps) {
  return <ApplyFlowClient {...flowClientProps(props)} />;
}
