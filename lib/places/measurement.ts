import messung from './data/messung.json';

/**
 * Ortsvermessung (docs/operations/orte-messung.md, erzeugt mit scripts/places/measure.mjs): einzige Quelle für
 * Strecken, Fahrzeiten, Postleitzahlen, Kreise und Koordinaten der Ortsseiten. Ohne zod, damit derive.ts auch
 * in einem Client-Modul laufen dürfte; die Form der Rohdaten prüft data.ts beim Laden.
 */

/** Commit, der Messung und Protokoll festhält. Neue Messung: neuer Commit, neuer Wert hier. */
export const MEASUREMENT_COMMIT = 'b0749f2';

/** Quelle jeder veröffentlichten Strecke (Muster im Schema: orte-messung.md@<sha>). */
export const MEASUREMENT_SOURCE = `docs/operations/orte-messung.md@${MEASUREMENT_COMMIT}`;

export type MeasuredKind = 'stadt' | 'stadtteil' | 'gemeinde';

/** Ein Kandidat der Messung, wie er in messung.json steht. */
export interface MeasuredPlace {
  id: string;
  name: string;
  kind: MeasuredKind;
  kreisId: string;
  lat: number;
  lng: number;
  postalCode: string;
  /** Messpunkt, wenn er anders heißt als der Ort (Verwaltungssitz der Gemeinde). */
  seat?: string;
  osm: string;
  /** Name des OSM-Objekts der Verortung (Gegenprobe: muss der amtliche Name sein, siehe osmSpelling). */
  osmName?: string;
  airKm: number;
  /** Fehlt, wenn der Kandidat schon an der Luftlinie scheitert. */
  distanceKm?: number | null;
  minutes?: number | null;
  included: boolean;
  reason?: string;
}

interface MessungFile {
  measuredOn: string;
  method: string;
  headquarters: { address: string; lat: number; lng: number };
  maxRoadKm: number;
  kreise: Record<string, string>;
  /** Abweichende Schreibweise in OSM: amtlicher Name → Name in OSM. */
  osmSpelling: Record<string, string>;
  places: MeasuredPlace[];
}

const RAW = messung as unknown as MessungFile;

export const MEASUREMENT = Object.freeze({
  measuredOn: RAW.measuredOn,
  method: RAW.method,
  source: MEASUREMENT_SOURCE,
  /** Gebietsregel (Fakt radius35): höchstens so viele Kilometer Straße bis zum Firmensitz. */
  maxRoadKm: RAW.maxRoadKm,
  /** Firmensitz Siegmund-Hiepe-Str. 20 laut OpenStreetMap: Ziel jeder Messung, Mitte jeder Richtung. */
  headquarters: Object.freeze({ ...RAW.headquarters }),
  /** Kreis-ID → amtlicher Name, wie OSM ihn liefert. */
  kreise: Object.freeze({ ...RAW.kreise }) as Readonly<Record<string, string>>,
  /** Amtlicher Name → Schreibweise in OSM (z. B. Münchholzhausen → „Müchholzhausen“). */
  osmSpelling: Object.freeze({ ...RAW.osmSpelling }) as Readonly<Record<string, string>>,
});

/** Alle Kandidaten, auch die nicht aufgenommenen (Spalte „aufgenommen: nein“ im Protokoll). */
export const MEASURED_PLACES: readonly MeasuredPlace[] = Object.freeze(RAW.places.map((place) => Object.freeze({ ...place })));
