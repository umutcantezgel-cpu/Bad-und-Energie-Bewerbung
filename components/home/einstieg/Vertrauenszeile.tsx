import { cn } from '@/lib/utils/cn';
import { VERTRAUEN_LABEL, vertrauenspunkte } from './einstieg-text';
import styles from './einstieg.module.css';
import { mitZiffern } from './ziffern';

/**
 * Vertrauenszeile unter dem Einstieg (E-START-021 mit E-START-010 und E-START-011): eine ruhige, statische
 * Zeile Schrift, alle Punkte sichtbar, kein Laufband, keine Bewegung. Zwei Reihen: Betriebsaussagen fett,
 * darunter die Herstellerpartner in der abgestuften Fassung der Partner-Säulen (bei 1440 px je eine Zeile).
 * Auswahl und Quellen: einstieg-text.ts.
 */
export function Vertrauenszeile() {
  return (
    <ul className={styles.vertrauen} aria-label={VERTRAUEN_LABEL} data-vertrauenszeile="">
      {vertrauenspunkte().map((punkt) => (
        <li key={punkt.id} className={cn(styles.punkt, punkt.gruppe === 'betrieb' ? styles.betrieb : styles.partner)}>
          {mitZiffern(punkt.text)}
        </li>
      ))}
    </ul>
  );
}
