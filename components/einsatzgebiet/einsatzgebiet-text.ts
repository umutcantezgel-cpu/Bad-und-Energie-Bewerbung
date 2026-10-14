import { REGION } from '@/lib/content/region';
import { directionFromHeadquarters } from '@/lib/places/derive';
import type { Place } from '@/lib/places/schema';

/**
 * Beschriftungen der lokalen Seiten (E-028): nur Etiketten, Spaltenköpfe und Bildtitel, ohne Zahl und ohne Zusage
 * (wie components/jobs/liste/inhalt-text.ts). Jeder Satz mit Aussage steht in lib/places/text.ts und läuft durch
 * das Einzigartigkeits-Gate.
 */

/** Etiketten über den Abschnittsüberschriften (Planbeschriftung, Versalien über text-etikett). */
export const ETIKETT = Object.freeze({
  arbeitsweg: 'Arbeitsweg',
  stellen: 'Stellen',
  nachbarn: 'Nachbarorte',
  stadtteile: 'Stadtteile',
  kreis: 'Kreis',
  stadt: 'Stadt',
  band: 'Für jeden Ort',
  kontakt: 'Kontakt',
  oepnv: 'Nahverkehr',
  schule: 'Berufsschule',
  zahlen: 'Fahrzeiten',
  orte: 'Orte',
  ringe: 'Plan',
  kreise: 'Kreise',
  verzeichnis: 'Verzeichnis',
});

/** Name am Haus der Pläne, wenn der Ort Wetzlar selbst mit Namen auf dem Plan steht (wie am Pendelweg). */
export const HAUS_NAME = 'Firmensitz';

/** Lesart des Plans, wie unter der Karte der Startseite (RegionExplorer). */
export const PLAN_LEGENDE = `Kreise in Luftlinie um ${REGION.center.name}. Lahn, Dill, A45 und B49 schematisch.`;

/** Zusatz der Legende, wenn die Stadtteile am Haus ohne Namen bleiben (Kreis-Hub Lahn-Dill-Kreis). */
export const PLAN_LEGENDE_STADTTEILE = `Die Punkte direkt um das Haus sind ${REGION.center.name} und seine Stadtteile; ihre Namen stehen in der Tabelle.`;

/** Zusatz der Legende auf der Stadtseite: die Stadtteile als volle Punkte, nicht alle mit Namen. */
export const PLAN_LEGENDE_STADTTEILE_STADT = `Volle Punkte ohne Namen sind Stadtteile von ${REGION.center.name}; alle Stadtteile stehen weiter unten mit Strecke und Fahrzeit.`;

/** Legende unter der senkrechten Entfernungsleiste des Kreis-Hubs: die leisen Striche im Leitungspaar. */
export function leisteLegende(alleOrte: number): string {
  return `Striche im Paar: alle ${alleOrte} Orte`;
}

/** Bildtitel der Kennwerte zur spätesten Verbindung (components/einsatzgebiet/Fahrplan.tsx). */
export const FAHRPLAN = Object.freeze({ betrieb: 'Späteste Verbindung zum Firmensitz' });

/** Spaltenköpfe der Ortstabelle. */
export const TABELLE = Object.freeze({ ort: 'Ort', plz: 'PLZ', km: 'Strecke', min: 'Fahrzeit' });

/** Überschrift des Verzeichnisses auf der Gebietsseite. */
export const VERZEICHNIS_TITEL = 'Alle Orte von A bis Z';

/** Ansprechpartner neben dem Kontakt (wie auf den Stellenseiten). */
export { ANSPRECHPARTNER } from '@/components/jobs/stelle/stelle-text';

/** Hinweis für Screenreader bei Links, die in einem neuen Tab öffnen; Wortlaut wie im Fuß und in ContactOptions. */
export const NEUER_TAB = ' (öffnet in neuem Tab)';

/**
 * Etikett über den Orten, die der Satz „Richtung Südwesten …“ im Abschnitt Nachbarorte nennt: Sie liegen in derselben
 * Richtung ab Firmensitz, aber nicht nebenan (darum abgesetzt von den Nachbarorten).
 */
export function inDerselbenRichtung(place: Pick<Place, 'lat' | 'lng'>): string {
  return `Ebenfalls Richtung ${directionFromHeadquarters(place)}`;
}

const aufzaehlung = (namen: readonly string[]) =>
  namen.length > 1 ? `${namen.slice(0, -1).join(', ')} und ${namen.at(-1)}` : (namen[0] ?? '');

/**
 * Beschreibung des Plans einer Ortsseite (<desc>): wer hervorgehoben ist und was das Leitungspaar zeigt; auf der
 * Stadtseite dazu die Stadtteile.
 */
export function planBeschreibungOrt(ort: string, nachbarn: readonly string[], stadtteile: readonly string[] = []): string {
  const liste = aufzaehlung(nachbarn);
  const teile = stadtteile.length > 0 ? ` Ebenfalls hervorgehoben: die Stadtteile ${aufzaehlung(stadtteile)}.` : '';
  return `${REGION.center.name} in der Mitte. Hervorgehoben: ${ort}${liste ? ` und die Nachbarorte ${liste}` : ''}.${teile} Vorlauf und Rücklauf verbinden ${ort} mit dem Firmensitz.`;
}

/** Beschreibung des Plans eines Kreis-Hubs (<desc>). */
export function planBeschreibungKreis(kreisDativ: string): string {
  return `${REGION.center.name} in der Mitte. Hervorgehoben sind die Orte ${kreisDativ}; die übrigen Orte des Einsatzgebiets sind kleine Punkte.`;
}
