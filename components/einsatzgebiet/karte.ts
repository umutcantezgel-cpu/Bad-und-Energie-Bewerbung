import { buildRegionMapData, type MapLocation } from '@/components/maps/views';
import type { RadiusView, RegionMapData } from '@/components/maps/types';
import { placeNeighbors, planRingKm } from '@/lib/places/derive';
import { getPublishedPlaces, getStadtteile, placePath, type Place } from '@/lib/places/registry';

/**
 * Plan der Seiten unter /einsatzgebiet (Server): alle veröffentlichten Orte mit gemessener Strecke und Fahrzeit,
 * Kurzbeschreibung (nur freigegebene, M-016) und Link zur Ortsseite. Dieselbe Projektion, dieselben Ringe und
 * dieselbe Landschaft wie die Karte der Startseite (components/maps/views.ts); die Startseite behält ihre 10 Orte.
 */

/** Kerngebiet wie auf der Startseite: Wetzlar und seine Stadtteile (lib/data/locations.ts isCoreZone). */
function isCoreZone(place: Pick<Place, 'kind'>): boolean {
  return place.kind !== 'gemeinde';
}

export function placeLocation(place: Place): MapLocation {
  return {
    id: place.id,
    name: place.name,
    postalCode: place.postalCode,
    distanceKm: place.commute.distanceKm,
    commuteMinutes: place.commute.minutes,
    latitude: place.lat,
    longitude: place.lng,
    isCoreZone: isCoreZone(place),
    character: place.character?.text ?? null,
    href: placePath(place),
    ...(planName(place.name) !== place.name ? { shortName: planName(place.name) } : {}),
  };
}

/**
 * Kurzer Name für die Beschriftung des Plans: ohne Klammerzusatz und ohne „an der Lahn“ („Waldbrunn“, „Heuchelheim“),
 * damit lange Namen am Rand Platz finden. Liste, Auswahl und Text nennen den amtlichen Namen.
 */
export function planName(name: string): string {
  return name.replace(/ \(.+\)$/, '').replace(/ an der Lahn$/, '');
}

/**
 * Namen, die der Plan der Gebietsseite zuerst setzt: die größeren Orte in jeder Richtung (Review Phase 2: Gießen,
 * Herborn und Butzbach blieben ohne Namen, während Lohra und Villmar einen hatten). Die übrigen folgen von außen nach
 * innen, so weit Platz ist.
 */
export const GEBIET_LABEL_PRIORITY: readonly string[] = Object.freeze(['giessen', 'herborn', 'weilburg', 'butzbach']);

/** Einmal je Serverprozess: alle Orte nach Strecke, drei Ansichten (15, 25, 35 km). */
export const GEBIET_MAP_DATA: RegionMapData = buildRegionMapData(getPublishedPlaces().map(placeLocation));

/** Ansicht eines Radius (15, 25 oder 35 km). */
export function gebietView(radiusKm: number): RadiusView {
  const view = GEBIET_MAP_DATA.views[GEBIET_MAP_DATA.radii.indexOf(radiusKm)];
  if (!view) throw new RangeError(`Keine Ansicht für ${radiusKm} km`);
  return view;
}

/**
 * Ansicht einer Ortsseite: der kleinste Ring (Luftlinie, wie der Plan), in dem der Ort und seine Nachbarn mit ihren
 * Namen Platz haben. Die Straßenstrecke entscheidet nichts: Der Plan zeigt Luftlinie.
 */
export function placeView(place: Place, nachbarn: readonly Place[] = []): RadiusView {
  return gebietView(planRingKm([place, ...nachbarn]));
}

/** Die Orte im Plan einer Ortsseite neben dem Ort selbst. */
export interface OrtPlanOrte {
  /** Die vier nächsten Orte (eine Stadt ohne ihre eigenen Stadtteile, lib/places/derive placeNeighbors). */
  nachbarn: Place[];
  /**
   * Nur Stadtseite: alle Stadtteile, als volle Punkte hervorgehoben (Kritik 2: Wetzlar zeigte nur vier, als
   * „Nachbarorte“). Um das Haus ist für acht Namen kein Platz: Sie tragen einen Namen, wo Platz ist; die Legende
   * verweist auf den Abschnitt „Die Stadtteile von …“.
   */
  stadtteile: Place[];
  /** Alle hervorgehobenen Orte: der Ort, die Nachbarn, die Stadtteile. */
  ids: string[];
  /** Hervorgehobene Orte ohne Pflicht zum Namen (die Stadtteile). */
  ohneNamen: string[];
}

export function ortPlanOrte(place: Place, published: readonly Place[] = getPublishedPlaces()): OrtPlanOrte {
  const nachbarn = placeNeighbors(place, published, 4).map((n) => n.place);
  const stadtteile = place.kind === 'stadt' ? getStadtteile(place.id) : [];
  return {
    nachbarn,
    stadtteile,
    ids: [place.id, ...nachbarn.map((p) => p.id), ...stadtteile.map((p) => p.id)],
    ohneNamen: stadtteile.map((p) => p.id),
  };
}
