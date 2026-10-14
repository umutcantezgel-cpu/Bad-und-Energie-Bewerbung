import type { OepnvVerbindung } from '@/lib/places/oepnv';
import { cn } from '@/lib/utils/cn';
import styles from './einsatzgebiet.module.css';
import { fahrplanLinien, fahrplanWerte } from './fahrplan-werte';

export interface FahrplanProps {
  verbindung: OepnvVerbindung;
  /** Bildtitel über den Werten, ohne Zahl (einsatzgebiet-text.ts). */
  titel: string;
}

/**
 * Späteste Verbindung als Maße (Plan §B, KERN K-003.1 „eingemessen statt behauptet“): Losgehen, Ankunft, Tür zu Tür und
 * Umstiege in Martian Mono, darunter die Fahrzeuge. Server-Komponente ohne Bewegung.
 */
export function Fahrplan({ verbindung, titel }: FahrplanProps) {
  return (
    <figure className={styles.fahrplan}>
      <figcaption className="text-etikett text-ink-2">{titel}</figcaption>
      <div className={styles.fahrplanKarte}>
        <ul className={styles.fahrplanWerte}>
          {fahrplanWerte(verbindung).map((wert) => (
            <li key={wert.name} className={styles.fahrplanWert}>
              <span className={cn(styles.fahrplanZahl, 'font-mass')}>{wert.wert}</span>
              <span className="text-etikett text-ink-2">{wert.name}</span>
            </li>
          ))}
        </ul>
        <p className={styles.fahrplanLinien}>{fahrplanLinien(verbindung)}</p>
      </div>
    </figure>
  );
}
