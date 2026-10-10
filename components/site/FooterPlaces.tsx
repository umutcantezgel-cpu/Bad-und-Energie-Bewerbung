import { REGION } from '@/lib/content/region';
import { cn } from '@/lib/utils/cn';
import { FussLink } from './fuss/FussLink';
import styles from './fuss/fuss.module.css';

/**
 * Orte der Ortsliste im Fuß (E-SHELL-021): Wetzlar zuerst (Firmensitz), dann die Städte und Gemeinden
 * aus REGION.areas (SITE_CONFIG.serviceRegions) ohne die Stadtteile Wetzlars, ohne Doppelungen.
 * Nur Orte aus den Daten; „Hohenahr“ steht dort nicht (B17).
 */
export function footerPlaces(): string[] {
  const center = REGION.center.name;
  const names = REGION.areas.flatMap((area) =>
    area.name.startsWith(center) ? area.cities.filter((city) => city === center) : area.cities,
  );
  return [...new Set([center, ...names])];
}

/**
 * Einsatzgebiet-Ortsliste im Fuß (E-SHELL-021): Etikett wie die Spaltenköpfe, eine ruhige Zeile mit den Orten
 * (Trennpunkte nie am Zeilenanfang) und der Weg zu Entfernung und Fahrzeit auf der Startseite. Nennt bewusst
 * keine Kilometerzahl (die steht im Einstieg und im Abschnitt Einsatzgebiet). Kopf beschreibend (V6-B): die
 * Liste nennt Orte.
 */
export function FooterPlaces({ className }: { className?: string }) {
  const places = footerPlaces();
  return (
    <section aria-labelledby="footer-einsatzgebiet" className={cn(styles.orteRaster, className)}>
      <h2 id="footer-einsatzgebiet" className={cn(styles.kopf, 'text-etikett text-ink-2')}>
        Orte im Einsatzgebiet
      </h2>
      <div className={styles.orteInhalt}>
        <div className={styles.orteClip}>
          <ul className={styles.orteListe}>
            {places.map((name, i) => (
              <li key={name}>
                {i === 0 ? (
                  <span className={styles.sitz}>
                    {name} <span className={styles.sitzZusatz}>(Firmensitz)</span>
                  </span>
                ) : (
                  name
                )}
              </li>
            ))}
          </ul>
        </div>
        <FussLink href="/#einsatzgebiet" stark pfeil>
          Entfernung und Fahrzeit zu deinem Ort
        </FussLink>
      </div>
    </section>
  );
}
