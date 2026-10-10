import { HausKlein } from '@/components/zeichnung';
import styles from './seite.module.css';

/** Das kleine Haus aus der Szene des Einstiegs für die Navy-Fläche des Kopfs (dekorativ), etwas schmaler. */
export function KopfHaus() {
  return <HausKlein className={styles.haus} />;
}
