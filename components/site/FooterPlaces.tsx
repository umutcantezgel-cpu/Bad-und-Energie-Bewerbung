import Link from 'next/link';
import {
  EINSATZGEBIET_PATH,
  findPublishedPlaceByName,
  getKreise,
  getKreisPlaces,
  getPublishedPlaces,
  kreisPath,
  placePath,
  type Kreis,
  type Place,
} from '@/lib/places/registry';
import { cn } from '@/lib/utils/cn';
import { FussLink } from './fuss/FussLink';
import styles from './fuss/fuss.module.css';
import { orteMass } from './kopf/kopf-daten';

/** Geschütztes Leerzeichen zwischen Zahl und Wort (DIN 5008). */
const NBSP = '\u00a0';

export interface FooterOrtsgruppe {
  /** Stadtteile eines Orts: „Stadtteile von Wetzlar“; null für die Orte des Kreises selbst. */
  etikett: string | null;
  places: Place[];
}

export interface FooterKreisGruppe {
  kreis: Kreis;
  /** Kreis-Hub oder, ohne Hub, sein Abschnitt auf der Gebietsseite (kreisPath). */
  href: string;
  gruppen: FooterOrtsgruppe[];
  /** Kreise mit eigener Seite stehen am Desktop über die ganze Breite, die übrigen nebeneinander. */
  breit: boolean;
}

const byName = (a: Place, b: Place) => a.name.localeCompare(b.name, 'de');

/**
 * Alle veröffentlichten Orte nach Kreis (E-028): zuerst die Kreise mit eigener Seite, dann die übrigen, je in der
 * Reihenfolge des Messprotokolls. Im Kreis steht der Firmensitz (Art „stadt“) vorn, dann die Gemeinden von A bis Z;
 * Stadtteile folgen als eigene Gruppe unter ihrem Ort („Stadtteile von Wetzlar“). Jeder Ort genau einmal.
 */
export function footerKreisGruppen(): FooterKreisGruppe[] {
  const kreise = getKreise();
  const reihenfolge = [...kreise.filter((k) => k.hasHub), ...kreise.filter((k) => !k.hasHub)];
  return reihenfolge.map((kreis) => {
    const places = getKreisPlaces(kreis.id);
    const ids = new Set(places.map((place) => place.id));
    // Stadtteile nur dann unter ihrem Ort, wenn der Ort im selben Kreis steht; sonst bleiben sie Orte des Kreises.
    const eigene = places.filter((place) => !place.parentId || !ids.has(place.parentId));
    const kopf = [...eigene.filter((p) => p.kind === 'stadt').sort(byName), ...eigene.filter((p) => p.kind !== 'stadt').sort(byName)];
    const gruppen: FooterOrtsgruppe[] = [{ etikett: null, places: kopf }];
    for (const parent of kopf) {
      const teile = places.filter((place) => place.parentId === parent.id).sort(byName);
      if (teile.length > 0) gruppen.push({ etikett: `Stadtteile von ${parent.name}`, places: teile });
    }
    return { kreis, href: kreisPath(kreis), gruppen, breit: kreis.hasHub };
  });
}

/** Alle Orte der Fußliste in der Reihenfolge des Fußes (Firmensitz zuerst). */
export function footerPlaceList(): Place[] {
  return footerKreisGruppen().flatMap((gruppe) => gruppe.gruppen.flatMap((g) => g.places));
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

/** Zeile unter dem Etikett: „54 Orte in 6 Kreisen, jeder mit eigener Seite.“ */
export function footerGebietZeile(anzahlOrte = getPublishedPlaces().length, anzahlKreise = getKreise().length): string {
  return `${anzahlOrte}${NBSP}Orte in ${anzahlKreise}${NBSP}Kreisen, jeder Ort mit eigener Seite.`;
}

function Ortsliste({ places, etikett }: FooterOrtsgruppe) {
  return (
    <div className={styles.ortsgruppe}>
      {etikett ? <p className={cn(styles.ortsgruppeEtikett, 'text-etikett')}>{etikett}</p> : null}
      <div className={styles.orteClip}>
        <ul className={styles.orteListe}>
          {places.map((place) => (
            <li key={place.id}>
              {/* 54 Orte: kein Vorladen beim Erscheinen des Fußes, die Seite lädt beim Tippen */}
              <Link href={placePath(place)} prefetch={false} className={cn(styles.ortLink, 'rounded-1')} data-motion="druck">
                {place.kind === 'stadt' ? (
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
    </div>
  );
}

/**
 * Einsatzgebiet im Fuß (E-SHELL-021, seit E-028 vollständig): Etikett wie die Spaltenköpfe, darunter Zahl der Orte und
 * Kreise; rechts alle veröffentlichten Orte nach Kreis und der Weg zu Entfernung und Fahrzeit auf der Gebietsseite. Der
 * Kreisname führt zum Kreis-Hub (ohne Hub zum Abschnitt der Gebietsseite), daneben die Zahl der Orte als Mono-Etikett;
 * die Orte stehen als ruhige Zeile mit Trennpunkten (nie am Zeilenanfang). So ist jede Orts- und Kreisseite von jeder
 * Seite aus mit einem Klick erreichbar. Nennt bewusst keine Kilometerzahl (die steht im Einstieg und im Abschnitt
 * Einsatzgebiet). Kopf beschreibend (V6-B): die Liste nennt Orte.
 */
export function FooterPlaces({ className }: { className?: string }) {
  const kreise = footerKreisGruppen();
  return (
    <nav aria-labelledby="footer-einsatzgebiet" className={cn(styles.orteRaster, className)}>
      <div className={styles.orteSeite}>
        <h2 id="footer-einsatzgebiet" className={cn(styles.kopf, 'text-etikett text-ink-2')}>
          Orte im Einsatzgebiet
        </h2>
        <p className={styles.orteZeile}>{footerGebietZeile()}</p>
      </div>
      <div className={styles.orteInhalt}>
        <div className={styles.kreise}>
          {kreise.map(({ kreis, href, gruppen, breit }) => (
            <div key={kreis.id} className={cn(styles.kreis, breit && styles.kreisBreit)}>
              <h3 className={styles.kreisKopf}>
                <Link
                  href={href}
                  prefetch={false}
                  className={cn(styles.kreisLink, 'font-display rounded-1')}
                  data-motion="druck"
                >
                  <span className={styles.kreisName} data-motion="unterstrich">
                    {kreis.shortName}
                  </span>
                </Link>
                <span className={cn(styles.kreisMass, 'text-etikett')}>{orteMass(kreis.placeCount)}</span>
              </h3>
              {gruppen.map((gruppe) => (
                <Ortsliste key={gruppe.etikett ?? 'orte'} {...gruppe} />
              ))}
            </div>
          ))}
        </div>
        <FussLink href={FOOTER_GEBIET_LINK.href} stark pfeil>
          {FOOTER_GEBIET_LINK.label}
        </FussLink>
      </div>
    </nav>
  );
}
