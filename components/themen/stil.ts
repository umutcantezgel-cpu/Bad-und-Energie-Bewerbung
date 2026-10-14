/**
 * Die Klassen der Themenseiten (themen.module.css), nur über diese Datei: Unmittelbar davor steht die leere globale
 * Grenze themen-grenze.css, die das CSS der Themenseiten aus dem gemeinsamen Chunk aller Seiten heraushält (Prüfung
 * E-029, Runde 2, Befund 9; Begründung in themen-grenze.css). Die Reihenfolge der beiden Importe ist die Funktion.
 */
import './themen-grenze.css';
import styles from './themen.module.css';

export default styles;
