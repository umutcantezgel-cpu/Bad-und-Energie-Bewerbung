import type { FactId } from '@/lib/content/facts';

/**
 * Kreise des Einsatzgebiets mit mindestens einem aufgenommenen Ort (docs/operations/orte-messung.md).
 * Namen wie in messung.json (`kreise`); Reihenfolge wie im Messprotokoll. Ob ein Kreis eine eigene
 * Hub-Seite bekommt, entscheidet registry.ts aus der Zahl der veröffentlichten Orte (KREIS_HUB_MIN_PLACES).
 */
export const KREIS_IDS = [
  'lahn-dill-kreis',
  'landkreis-giessen',
  'landkreis-marburg-biedenkopf',
  'landkreis-limburg-weilburg',
  'wetteraukreis',
  'hochtaunuskreis',
] as const;

export type KreisId = (typeof KREIS_IDS)[number];

export interface KreisDef {
  id: KreisId;
  /** Segment unter /einsatzgebiet; teilt sich den flachen Namensraum mit den Orten. */
  slug: string;
  /** Amtlicher Name wie in messung.json. */
  name: string;
  /** Name für Überschriften und Etiketten. */
  shortName: string;
  /** „im Lahn-Dill-Kreis“: alle Kreise sind maskulin, Dativ mit „im“. */
  dative: string;
  /** „des Lahn-Dill-Kreises“. */
  genitive: string;
  /** Belegte Fakten, die nur auf Seiten dieses Kreises stehen (Band der Ortsseite, Kreis-Hub). */
  factIds: readonly FactId[];
}

const kreis = (def: KreisDef): KreisDef => Object.freeze({ ...def, factIds: Object.freeze([...def.factIds]) });

export const KREIS_DEFS: Readonly<Record<KreisId, KreisDef>> = Object.freeze({
  'lahn-dill-kreis': kreis({
    id: 'lahn-dill-kreis',
    slug: 'lahn-dill-kreis',
    name: 'Lahn-Dill-Kreis',
    shortName: 'Lahn-Dill-Kreis',
    dative: 'im Lahn-Dill-Kreis',
    genitive: 'des Lahn-Dill-Kreises',
    // Fakt countyPartner: Fachbetrieb des Lahn-Dill-Kreises (öffentliche Liegenschaften).
    factIds: ['countyPartner'],
  }),
  'landkreis-giessen': kreis({
    id: 'landkreis-giessen',
    slug: 'landkreis-giessen',
    name: 'Landkreis Gießen',
    shortName: 'Landkreis Gießen',
    dative: 'im Landkreis Gießen',
    genitive: 'des Landkreises Gießen',
    factIds: [],
  }),
  'landkreis-marburg-biedenkopf': kreis({
    id: 'landkreis-marburg-biedenkopf',
    slug: 'landkreis-marburg-biedenkopf',
    name: 'Landkreis Marburg-Biedenkopf',
    shortName: 'Landkreis Marburg-Biedenkopf',
    dative: 'im Landkreis Marburg-Biedenkopf',
    genitive: 'des Landkreises Marburg-Biedenkopf',
    factIds: [],
  }),
  'landkreis-limburg-weilburg': kreis({
    id: 'landkreis-limburg-weilburg',
    slug: 'landkreis-limburg-weilburg',
    name: 'Landkreis Limburg-Weilburg',
    shortName: 'Landkreis Limburg-Weilburg',
    dative: 'im Landkreis Limburg-Weilburg',
    genitive: 'des Landkreises Limburg-Weilburg',
    factIds: [],
  }),
  wetteraukreis: kreis({
    id: 'wetteraukreis',
    slug: 'wetteraukreis',
    name: 'Wetteraukreis',
    shortName: 'Wetteraukreis',
    dative: 'im Wetteraukreis',
    genitive: 'des Wetteraukreises',
    factIds: [],
  }),
  hochtaunuskreis: kreis({
    id: 'hochtaunuskreis',
    slug: 'hochtaunuskreis',
    name: 'Hochtaunuskreis',
    shortName: 'Hochtaunuskreis',
    dative: 'im Hochtaunuskreis',
    genitive: 'des Hochtaunuskreises',
    factIds: [],
  }),
});

export function isKreisId(value: string): value is KreisId {
  return (KREIS_IDS as readonly string[]).includes(value);
}
