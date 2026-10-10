import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface MasskettenProps {
  /** Wert in Martian Mono (font-mass), z. B. „13:30“, „35 km“. Echter Text, liest der Screenreader. */
  wert: ReactNode;
  /** Name in Versalien (text-etikett) unter der Maßlinie, z. B. „Freitags Feierabend“. */
  name?: ReactNode;
  /** Bündigkeit von Wert und Name: links (Standard) oder rechts. */
  ausrichtung?: 'start' | 'end';
  /** Größe des Werts: `normal` (text-title-2) oder `gross` (text-numeral). */
  groesse?: 'normal' | 'gross';
  className?: string;
}

/**
 * Maßkette (KERN K-003 „eingemessen statt behauptet“, Einstieg `.kette`): Wert, darunter eine waagerechte
 * Maßlinie mit Endstrichen, darunter der Name. Die Linie ist dekorativ; Wert und Name stehen als Text mit
 * trennendem Leerzeichen im DOM. Farben über Rollen: auf Papier Navy, auf dem Inverse-Band Creme.
 */
export function Masskette({ wert, name, ausrichtung = 'start', groesse = 'normal', className }: MasskettenProps) {
  return (
    <span
      className={cn(styles.masskette, ausrichtung === 'end' && styles.mkEnde, className)}
      data-zeichnung="masskette"
    >
      <span className={cn(styles.mkWert, groesse === 'gross' && styles.mkGross, 'font-mass text-brand')}>{wert}</span>{' '}
      <span className={styles.mkLinie} aria-hidden="true" />
      {name ? (
        <>
          {' '}
          <span className={cn(styles.mkName, 'text-etikett text-ink-2')}>{name}</span>
        </>
      ) : null}
    </span>
  );
}
