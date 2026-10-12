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
  zahlen: 'Fahrzeiten',
  orte: 'Orte',
  ringe: 'Plan',
  kreise: 'Kreise',
  verzeichnis: 'Verzeichnis',
});

/** Lesart des Plans, wie unter der Karte der Startseite (RegionExplorer). */
export const PLAN_LEGENDE = `Kreise in Luftlinie um ${REGION.center.name}. Lahn, Dill, A45 und B49 schematisch.`;

/** Zusatz der Legende, wenn die Stadtteile am Haus ohne Namen bleiben (Kreis-Hub Lahn-Dill-Kreis). */
export const PLAN_LEGENDE_STADTTEILE = `Die Punkte direkt um das Haus sind ${REGION.center.name} und seine Stadtteile; ihre Namen stehen in der Tabelle.`;

/** Spaltenköpfe der Ortstabelle. */
export const TABELLE = Object.freeze({ ort: 'Ort', plz: 'PLZ', km: 'Strecke', min: 'Fahrzeit' });

/** Überschrift des Verzeichnisses auf der Gebietsseite. */
export const VERZEICHNIS_TITEL = 'Alle Orte von A bis Z';

/** Ansprechpartner neben dem Kontakt (wie auf den Stellenseiten). */
export { ANSPRECHPARTNER } from '@/components/jobs/stelle/stelle-text';

/** Hinweis für Screenreader bei Links, die in einem neuen Tab öffnen. */
export const NEUER_TAB = ' (öffnet in einem neuen Tab)';

/**
 * Etikett über den Orten, die der Satz „Richtung Südwesten …“ im Abschnitt Nachbarorte nennt: Sie liegen in derselben
 * Richtung ab Firmensitz, aber nicht nebenan (darum abgesetzt von den Nachbarorten).
 */
export function inDerselbenRichtung(place: Pick<Place, 'lat' | 'lng'>): string {
  return `Ebenfalls Richtung ${directionFromHeadquarters(place)}`;
}

/** Beschreibung des Plans einer Ortsseite (<desc>): wer hervorgehoben ist und was das Leitungspaar zeigt. */
export function planBeschreibungOrt(ort: string, nachbarn: readonly string[]): string {
  const liste = nachbarn.length > 1 ? `${nachbarn.slice(0, -1).join(', ')} und ${nachbarn.at(-1)}` : (nachbarn[0] ?? '');
  return `${REGION.center.name} in der Mitte. Hervorgehoben: ${ort}${liste ? ` und die Nachbarorte ${liste}` : ''}. Vorlauf und Rücklauf verbinden ${ort} mit dem Firmensitz.`;
}

/** Beschreibung des Plans eines Kreis-Hubs (<desc>). */
export function planBeschreibungKreis(kreisDativ: string): string {
  return `${REGION.center.name} in der Mitte. Hervorgehoben sind die Orte ${kreisDativ}; die übrigen Orte des Einsatzgebiets sind kleine Punkte.`;
}
