import Link from 'next/link';
import { DISTANCE_BAND_KM } from '@/lib/places/derive';
import { EINSATZGEBIET_PATH, findPublishedPlaceByName, getPublishedPlaces, placePath, type Place } from '@/lib/places/registry';
import { cn } from '@/lib/utils/cn';
import { FussLink } from './fuss/FussLink';
import styles from './fuss/fuss.module.css';

/**
 * Orte der Ortsliste im Fuß (E-SHELL-021, seit E-028 aus den veröffentlichten Orten): Wetzlar zuerst (Firmensitz),
 * dann die Städte und Gemeinden unter 20 km Straße (Entfernungsbänder „nah“ und „mittel“, lib/places/derive.ts), nach
 * Strecke. Jeder Ort hat eine Ortsseite; Stadtteile stehen auf der Seite von Wetzlar. Bis 2026-10-12 kam die Liste aus
 * SITE_CONFIG.serviceRegions und nannte Dillenburg (38 km Straße, ohne Seite) als bloßen Text.
 */
export function footerPlaceList(): Place[] {
  const published = getPublishedPlaces();
  const sitz = published.filter((place) => place.kind === 'stadt');
  const nah = published.filter((place) => place.kind === 'gemeinde' && place.commute.distanceKm < DISTANCE_BAND_KM.weit);
  return [...sitz, ...nah];
}

export function footerPlaces(): string[] {
  return footerPlaceList().map((place) => place.name);
}

/** Ortsseite eines Orts der Fußliste (E-028). */
export function footerPlaceHref(name: string): string | undefined {
  const place = findPublishedPlaceByName(name);
  return place ? placePath(place) : undefined;
}

/** Weg zu Entfernung und Fahrzeit: seit E-028 die Gebietsseite mit allen gemessenen Orten (vorher /#einsatzgebiet). */
export const FOOTER_GEBIET_LINK = Object.freeze({ href: EINSATZGEBIET_PATH, label: 'Entfernung und Fahrzeit zu deinem Ort' });

/**
 * Einsatzgebiet-Ortsliste im Fuß (E-SHELL-021): Etikett wie die Spaltenköpfe, eine ruhige Zeile mit den Orten
 * (Trennpunkte nie am Zeilenanfang), jeder mit eigener Ortsseite als Link dorthin (E-028), und der Weg zu
 * Entfernung und Fahrzeit auf der Gebietsseite. Nennt bewusst keine Kilometerzahl (die steht im Einstieg und im
 * Abschnitt Einsatzgebiet). Kopf beschreibend (V6-B): die Liste nennt Orte.
 */
export function FooterPlaces({ className }: { className?: string }) {
  const places = footerPlaceList();
  return (
    <section aria-labelledby="footer-einsatzgebiet" className={cn(styles.orteRaster, className)}>
      <h2 id="footer-einsatzgebiet" className={cn(styles.kopf, 'text-etikett text-ink-2')}>
        Orte im Einsatzgebiet
      </h2>
      <div className={styles.orteInhalt}>
        <div className={styles.orteClip}>
          <ul className={styles.orteListe}>
            {places.map((place, i) => (
              <li key={place.id}>
                <Link href={placePath(place)} className={cn(styles.ortLink, 'rounded-1')} data-motion="druck">
                  {i === 0 ? (
                    <span className={styles.sitz}>
                      {place.name} <span className={styles.sitzZusatz}>(Firmensitz)</span>
                    </span>
                  ) : (
                    place.name
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <FussLink href={FOOTER_GEBIET_LINK.href} stark pfeil>
          {FOOTER_GEBIET_LINK.label}
        </FussLink>
      </div>
    </section>
  );
}
