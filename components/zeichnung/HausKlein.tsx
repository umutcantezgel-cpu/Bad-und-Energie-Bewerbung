import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface HausKleinProps {
  /** Bedeutungstragend: Titel als zugänglicher Name (role="img"). Ohne Titel dekorativ (aria-hidden). */
  titel?: string;
  className?: string;
}

/**
 * Kleines Haus aus der Szene des Einstiegs (für schmale Köpfe, Navy-Band, 240 × 200 Einheiten): Giebel 45°
 * aus dem Logo mit Wärmefüllung, Uhr im Giebel auf 13:30, Heizkörper, davor die Wärmepumpe; Vorlauf (oben)
 * und Rücklauf (unten) im Paarabstand 12 laufen ins Haus. Strich 3 px bei jeder Größe
 * (vector-effect: non-scaling-stroke), Breite setzt der Aufrufer (Standard 15rem). Ohne Bewegung.
 */
export function HausKlein({ titel, className }: HausKleinProps) {
  const z = cn(styles.strich, styles.linie, styles.fest);
  return (
    <svg
      className={cn(styles.svg, styles.hausKlein, className)}
      viewBox="0 0 240 200"
      focusable="false"
      data-zeichnung="haus-klein"
      {...(titel ? { role: 'img' } : { 'aria-hidden': true })}
    >
      {titel ? <title>{titel}</title> : null}
      {/* Haus: Wärmefüllung, Giebel 45° mit Traufe, Wände */}
      <path className={styles.waermeFlaeche} d="M88 192V112L152 48L216 112V192Z" />
      <path className={z} d="M72 128L152 48L232 128M88 112V192M216 112V192" />
      {/* Uhr im Giebel auf 13:30 */}
      <circle className={z} cx="152" cy="110" r="18" />
      <path className={z} d="M152 110V124M152 110L161 101" />
      <circle className={styles.voll} cx="152" cy="110" r="3" />
      {/* Heizkörper */}
      <rect className={z} x="164" y="146" width="36" height="28" rx="4" />
      <path className={z} d="M176 152V168M188 152V168" />
      {/* Wärmepumpe mit Lüfter */}
      <rect className={z} x="14" y="138" width="54" height="46" rx="8" />
      <circle className={z} cx="41" cy="161" r="13" />
      <path className={z} d="M41 161C41 154 45 149 51 149M41 161C47 165 48 171 45 175M41 161C35 165 30 164 27 159" />
      <path className={z} d="M22 184V192M60 184V192" />
      {/* Vorlauf und Rücklauf ins Haus (Paarabstand 12) */}
      <path className={cn(styles.strich, styles.vorlauf, styles.fest)} d="M68 154H164" />
      <path className={cn(styles.strich, styles.ruecklauf, styles.fest)} d="M164 166H68" />
      {/* Bodenlinie */}
      <path className={z} d="M4 192H236" />
    </svg>
  );
}
