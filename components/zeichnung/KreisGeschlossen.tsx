import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface KreisGeschlossenProps {
  /** Bedeutungstragend: Titel als zugänglicher Name (role="img"). Ohne Titel dekorativ (aria-hidden). */
  titel?: string;
  /** `klein` 64 px, `gross` 120 px (Standard). */
  groesse?: 'klein' | 'gross';
  className?: string;
}

/**
 * Der Kreis schließt sich (Danke-Seite, Register `kreis-schliessen`): Der Vorlauf läuft oben von links nach
 * rechts, der Rücklauf unten zurück, beide zeichnen sich einmal gleichzeitig (d-3, k-wechsel) und schließen
 * den Kreis um einen Haken. Feste Größen mit Strich 3 px (--s wie im Einstieg, kein non-scaling-stroke, das
 * die pathLength-Animation in Chromium bricht). Grundzustand ist der geschlossene Kreis: ohne Skript und bei
 * reduzierter Bewegung steht er sofort.
 */
export function KreisGeschlossen({ titel, groesse = 'gross', className }: KreisGeschlossenProps) {
  return (
    <svg
      className={cn(styles.svg, styles.kreis, groesse === 'klein' && styles.kreisKlein, className)}
      viewBox="0 0 120 120"
      focusable="false"
      data-zeichnung="kreis-geschlossen"
      {...(titel ? { role: 'img' } : { 'aria-hidden': true })}
    >
      {titel ? <title>{titel}</title> : null}
      <path className={cn(styles.kreisStrich, styles.vorlauf)} data-motion="kreis-schliessen" pathLength={1} d="M12 60A48 48 0 0 1 108 60" />
      <path className={cn(styles.kreisStrich, styles.ruecklauf)} data-motion="kreis-schliessen" pathLength={1} d="M108 60A48 48 0 0 1 12 60" />
      <path className={cn(styles.kreisStrich, styles.linie)} d="M40 61L53 74L81 46" />
    </svg>
  );
}
