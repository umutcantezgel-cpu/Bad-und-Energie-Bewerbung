import { OSM_FUSSZEILE, OSM_LINK } from '@/lib/places/osm';
import { NEUER_TAB } from './fuss-text';
import styles from './fuss.module.css';

/**
 * Namensnennung der OpenStreetMap-Daten im Fuß jeder Seite (ODbL 1.0 § 4.3; Prüfung E-029, Runde 3): Strecken und
 * Fahrzeiten stehen auch außerhalb von /einsatzgebiet (Startseite, /jobs, /bewerbung). Die Nennung führt auf
 * openstreetmap.org/copyright; Wortlaut aus lib/places/osm.ts.
 */
export function OsmNennung() {
  const at = OSM_FUSSZEILE.indexOf(OSM_LINK.label);
  return (
    <span className={styles.osm} data-osm-nennung="">
      {OSM_FUSSZEILE.slice(0, at)}
      <a href={OSM_LINK.href} target="_blank" rel="noopener noreferrer" className={styles.osmLink}>
        {OSM_LINK.label}
        <span className="sr-only">{NEUER_TAB}</span>
      </a>
      {OSM_FUSSZEILE.slice(at + OSM_LINK.label.length)}
    </span>
  );
}
