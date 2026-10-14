import Link from 'next/link';
import { EINSATZGEBIET_PATH, getHubKreise, getKreise, getPublishedPlaces, kreisPath, type Kreis } from '@/lib/places/registry';
import { EINSATZGEBIET_LINK_LABEL } from '@/lib/places/text';
import { cn } from '@/lib/utils/cn';
import { FussLink } from './fuss/FussLink';
import styles from './fuss/fuss.module.css';
import { orteMass } from './kopf/kopf-daten';

/** Geschütztes Leerzeichen zwischen Zahl und Wort (DIN 5008). */
const NBSP = '\u00a0';

export interface FooterKreisHub {
  kreis: Kreis;
  /** Kreis-Hub (kreisPath). */
  href: string;
  /** Zahl der Orte als Mono-Etikett: „26 Orte“. */
  mass: string;
}

/**
 * Die Kreise mit eigener Seite in der Reihenfolge des Messprotokolls, wie im Untermenü des Kopfs, je mit der Zahl
 * seiner Orte. Kreise ohne Hub und die einzelnen Orte stehen auf der Gebietsseite.
 */
export function footerKreisHubs(): FooterKreisHub[] {
  return getHubKreise().map((kreis) => ({ kreis, href: kreisPath(kreis), mass: orteMass(kreis.placeCount) }));
}

/**
 * Weg zu allen Orten: die Gebietsseite mit Verzeichnis, Strecke und Fahrzeit. Derselbe Ankertext wie auf der Startseite,
 * den Kreis-Hubs und den Themenseiten (EINSATZGEBIET_LINK_LABEL; ein Ankertext, ein Ziel).
 */
export const FOOTER_GEBIET_LINK = Object.freeze({ href: EINSATZGEBIET_PATH, label: EINSATZGEBIET_LINK_LABEL });

/** Zeile unter dem Etikett: „54 Orte in 6 Kreisen, jeder Ort mit eigener Seite.“ */
export function footerGebietZeile(anzahlOrte = getPublishedPlaces().length, anzahlKreise = getKreise().length): string {
  return `${anzahlOrte}${NBSP}Orte in ${anzahlKreise}${NBSP}Kreisen, jeder Ort mit eigener Seite.`;
}

/**
 * Einsatzgebiet im Fuß (E-SHELL-021; seit E-029 nur noch die Wege, Plan §B): Etikett wie die Spaltenköpfe, darunter
 * Zahl der Orte und Kreise; rechts die Kreis-Hubs mit der Zahl ihrer Orte und der Weg „Alle Orte im Einsatzgebiet“.
 * Vorher standen hier alle 54 Orte als Links auf jeder Seite, ein Muster, das Suchmaschinen als Brückenseiten
 * (Doorway) werten können. Die Orte erreicht man jetzt über die Gebietsseite (ein Klick aus dem Kopf) und die Kreis-Hubs
 * (ein Klick von hier); so misst auch das Gate die Klicktiefe. Jeder Weg ist mindestens 44 × 44 px groß.
 * Nennt bewusst keine Kilometerzahl (die steht im Einstieg und im Abschnitt Einsatzgebiet). Kopf beschreibend (V6-B).
 */
export function FooterPlaces({ className }: { className?: string }) {
  return (
    <nav aria-labelledby="footer-einsatzgebiet" className={cn(styles.orteRaster, className)}>
      <div className={styles.orteSeite}>
        <h2 id="footer-einsatzgebiet" className={cn(styles.kopf, 'text-etikett text-ink-2')}>
          Orte im Einsatzgebiet
        </h2>
        <p className={styles.orteZeile}>{footerGebietZeile()}</p>
      </div>
      <div className={styles.orteInhalt}>
        <ul className={styles.hubs}>
          {footerKreisHubs().map(({ kreis, href, mass }) => (
            <li key={kreis.id}>
              {/* Kein Vorladen beim Erscheinen des Fußes: Die Seite lädt beim Tippen */}
              <Link href={href} prefetch={false} className={cn(styles.kreisLink, 'rounded-1')} data-motion="druck">
                <span className={cn(styles.kreisName, 'font-display')} data-motion="unterstrich">
                  {kreis.shortName}
                </span>{' '}
                <span className={cn(styles.kreisMass, 'text-etikett')}>{mass}</span>
              </Link>
            </li>
          ))}
        </ul>
        <FussLink href={FOOTER_GEBIET_LINK.href} stark pfeil>
          {FOOTER_GEBIET_LINK.label}
        </FussLink>
      </div>
    </nav>
  );
}
