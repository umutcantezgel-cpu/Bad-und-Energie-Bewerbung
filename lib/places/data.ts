import { MEASURED_PLACES, MEASUREMENT, type MeasuredPlace } from './measurement';
import { STADTTEIL_PARENT_ID, definePlace, slugifyPlaceName, type Place } from './schema';

/**
 * Alle Orte der lokalen Seiten, gebaut aus den aufgenommenen Kandidaten der Messung
 * (lib/places/data/messung.json, Protokoll docs/operations/orte-messung.md). Hier steht nichts, was nicht
 * aus der Messung oder aus freigegebenen Texten stammt: keine Einwohnerzahlen, keine Sehenswürdigkeiten.
 */

/** Stand der Ortsdaten (Tag der Messung und der Freigabe der Liste). */
export const PLACES_UPDATED_AT = '2026-10-12';

/**
 * Die 10 Punkte der Startseitenkarte (lib/data/locations.ts) mit ihrer bisherigen ID. lib/places liest die
 * Datei bewusst nicht: Sie soll später aus `homeMap` abgeleitet werden (Plan „Übergang“).
 */
const HOME_MAP_LOCATION_IDS: Readonly<Record<string, string>> = Object.freeze({
  wetzlar: 'loc-wetzlar-mitte',
  hermannstein: 'loc-hermannstein',
  nauborn: 'loc-nauborn',
  garbenheim: 'loc-garbenheim',
  dutenhofen: 'loc-dutenhofen',
  steindorf: 'loc-steindorf',
  asslar: 'loc-asslar',
  braunfels: 'loc-braunfels',
  giessen: 'loc-giessen',
  herborn: 'loc-herborn',
});

/** Commit der Kurzbeschreibungen in lib/data/locations.ts (`git log -1 --format=%h -- lib/data/locations.ts`). */
export const CHARACTER_SOURCE = 'lib/data/locations.ts@075aa71';

/**
 * Freigegebene Kurzbeschreibungen, wörtlich aus lib/data/locations.ts. Nauborn, Braunfels und Gießen fehlen
 * absichtlich: Ihre Texte sind Betriebsaussagen und bleiben bis zur Bestätigung des Inhabers zurückgehalten
 * (MENSCHEN M-016, WITHHELD_CHARACTER_IDS in components/maps/views.ts).
 */
const APPROVED_CHARACTERS: Readonly<Record<string, string>> = Object.freeze({
  wetzlar: 'Firmensitz Siegmund-Hiepe-Str. 20 und historische Altstadt',
  hermannstein: 'Wohn und Gewerbegebiet an der B277 und A480',
  garbenheim: 'Lahnauen und ruhige Wohnsiedlungen',
  dutenhofen: 'Verbindung nach Gießen über die B49',
  steindorf: 'Traditionelle Wohnsiedlungen und Neubauviertel',
  asslar: 'Industrie und Wohnstandort im Dilltal',
  herborn: 'Historische Fachwerkstadt an der A45',
});

function toPlace(measured: MeasuredPlace): Place {
  if (measured.distanceKm == null || measured.minutes == null) {
    throw new Error(`Ort „${measured.id}“ ist aufgenommen, hat aber keine Strecke`);
  }
  const slug = slugifyPlaceName(measured.name);
  const character = APPROVED_CHARACTERS[measured.id];
  const legacyLocationId = HOME_MAP_LOCATION_IDS[measured.id];
  return definePlace({
    id: measured.id,
    slug,
    name: measured.name,
    kind: measured.kind,
    kreisId: measured.kreisId as Place['kreisId'],
    parentId: measured.kind === 'stadtteil' ? STADTTEIL_PARENT_ID : undefined,
    postalCode: measured.postalCode,
    lat: measured.lat,
    lng: measured.lng,
    seat: measured.seat,
    osm: measured.osm,
    commute: {
      distanceKm: measured.distanceKm,
      minutes: measured.minutes,
      airKm: measured.airKm,
      measuredOn: MEASUREMENT.measuredOn,
      method: MEASUREMENT.method,
      source: MEASUREMENT.source,
    },
    character: character ? { text: character, source: CHARACTER_SOURCE } : undefined,
    legacyLocationId,
    status: 'published',
    homeMap: legacyLocationId !== undefined,
    updatedAt: PLACES_UPDATED_AT,
  });
}

/** Reihenfolge wie im Messprotokoll (Kreis für Kreis, Wetzlar und Stadtteile zuerst). */
export const ALL_PLACES: readonly Place[] = Object.freeze(MEASURED_PLACES.filter((m) => m.included).map(toPlace));
