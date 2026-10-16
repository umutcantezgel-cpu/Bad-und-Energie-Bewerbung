import { AGENTUR, AGENTUR_HINWEIS_ID } from './agentur';
import { AgenturLink } from './AgenturLink';
import { NEUER_TAB } from './fuss-text';
import styles from './fuss.module.css';

/**
 * Agenturnennung als letzte Zeile der Fußzeile, unter der OSM-Nennung und in deren Gestalt: Kleintext, Unterstrich,
 * Fokus (_werkstatt/nennung N-06). Nur Text, kein Bild und kein Skript vom Agenturserver. Der Linktext ist genau die
 * Marke; der verborgene Hinweis auf den neuen Tab steht daneben und wird mit dem Link vorgelesen (N-12).
 */
export function AgenturNennung() {
  return (
    <span className={styles.nennung} data-agentur-nennung="">
      {`${AGENTUR.leistung}: `}
      <AgenturLink className={styles.nennungLink} hinweis={AGENTUR_HINWEIS_ID}>
        {AGENTUR.marke}
      </AgenturLink>
      <span id={AGENTUR_HINWEIS_ID} className="sr-only">
        {NEUER_TAB}
      </span>
    </span>
  );
}
