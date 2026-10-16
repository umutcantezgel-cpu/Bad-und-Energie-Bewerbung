import { AGENTUR } from './agentur';
import { AgenturLink } from './AgenturLink';
import { NEUER_TAB } from './fuss-text';
import styles from './fuss.module.css';

/**
 * Agenturnennung als letzte Zeile der Fußzeile, unter der OSM-Nennung und in deren Gestalt: Kleintext, Unterstrich,
 * Fokus (_werkstatt/nennung N-06). Nur Text, kein Bild und kein Skript vom Agenturserver.
 */
export function AgenturNennung() {
  return (
    <span className={styles.nennung} data-agentur-nennung="">
      {`${AGENTUR.leistung}: `}
      <AgenturLink className={styles.nennungLink}>
        {AGENTUR.marke}
        <span className="sr-only">{NEUER_TAB}</span>
      </AgenturLink>
    </span>
  );
}
