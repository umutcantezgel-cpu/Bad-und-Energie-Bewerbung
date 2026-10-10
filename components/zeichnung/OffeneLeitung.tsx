import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface OffeneLeitungProps {
  /**
   * Zugänglicher Name (role="img"). Standard: der Satz unten. `null` macht die Zeichnung dekorativ, wenn der
   * Text daneben dasselbe sagt.
   */
  titel?: string | null;
  className?: string;
}

export const OFFENE_LEITUNG_TITEL = 'Eine Leitung endet offen, der Wegweiser zeigt ins Leere.';

/**
 * Offene Leitung mit Wegweiser (404, B Runde 1, 480 × 240 Einheiten): Vorlauf und Rücklauf kommen von links,
 * knicken um 45° (wie der Leitungstrenner) und enden an einem Flansch, an dem nichts hängt. Rechts steht der
 * Wegweiser aus dem Einstieg mit zwei leeren Schildern: eins zeigt ins Leere, eins zurück. Strich 3 px bei
 * jeder Größe (non-scaling-stroke), ohne Bewegung; Schilder in der Fläche der Umgebung, damit der Pfosten
 * dahinter verschwindet.
 */
export function OffeneLeitung({ titel = OFFENE_LEITUNG_TITEL, className }: OffeneLeitungProps) {
  const z = cn(styles.strich, styles.linie, styles.fest);
  return (
    <svg
      className={cn(styles.svg, styles.offen, className)}
      viewBox="0 0 480 240"
      focusable="false"
      data-zeichnung="offene-leitung"
      {...(titel ? { role: 'img' } : { 'aria-hidden': true })}
    >
      {titel ? <title>{titel}</title> : null}
      {/* Das Paar: von links, 45°-Versatz um --paar (12), Ende am Flansch bei x 228 */}
      <path className={cn(styles.strich, styles.vorlauf, styles.fest)} d="M4 100H120L132 112H222" />
      <path className={cn(styles.strich, styles.ruecklauf, styles.fest)} d="M4 112H115L127 124H222" />
      {/* Flansch ohne Gegenstück */}
      <path className={z} d="M228 92V132" />
      {/* Wegweiser: Pfosten, Schild nach rechts ins Leere, Schild zurück nach links */}
      <path className={z} d="M372 228V60" />
      <path className={cn(z, styles.schild)} d="M320 72H420L440 92L420 112H320Z" />
      <path className={cn(z, styles.schild)} d="M424 132H332L312 152L332 172H424Z" />
      <path className={cn(styles.strich, styles.linieLeise, styles.fest)} d="M344 92H392M352 152H404" />
      {/* Bodenlinie */}
      <path className={z} d="M4 228H476" />
    </svg>
  );
}
