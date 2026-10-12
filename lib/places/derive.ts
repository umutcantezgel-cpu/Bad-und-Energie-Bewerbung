import { haversineKm, type LatLng } from '@/lib/maps/projection';

import { MEASUREMENT } from './measurement';
import type { Place } from './schema';

/**
 * Abgeleitete Werte der Ortsseiten, rein aus den Messdaten gerechnet (keine Seiteneffekte, kein Registry-Zugriff:
 * Vergleichsorte kommen als Argument). Jede Zahl, die eine Ortsseite nennt, stammt aus den Ortsdaten oder von hier.
 */

/** Firmensitz Siegmund-Hiepe-Str. 20 (OSM), Mitte aller Richtungen und Ringe. */
export const HEADQUARTERS: Readonly<LatLng> = Object.freeze({
  lat: MEASUREMENT.headquarters.lat,
  lng: MEASUREMENT.headquarters.lng,
});

/**
 * Ringe des Radius-Schalters (SWITCH_RADII_KM in components/maps/views.ts, E-START-033). Gespiegelt statt
 * importiert, weil views.ts Karten- und Landschaftsdaten mitbringt; ein Test hält beide gleich.
 */
export const RING_RADII_KM: readonly number[] = Object.freeze([15, 25, 35]);

/** Acht Himmelsrichtungen im Uhrzeigersinn ab Norden. */
export const DIRECTIONS = [
  'Norden',
  'Nordosten',
  'Osten',
  'Südosten',
  'Süden',
  'Südwesten',
  'Westen',
  'Nordwesten',
] as const;
export type Direction = (typeof DIRECTIONS)[number];

/** „nördlich“ … „nordwestlich“, gleiche Reihenfolge wie DIRECTIONS. */
export const DIRECTION_ADVERBS: Readonly<Record<Direction, string>> = Object.freeze({
  Norden: 'nördlich',
  Nordosten: 'nordöstlich',
  Osten: 'östlich',
  Südosten: 'südöstlich',
  Süden: 'südlich',
  Südwesten: 'südwestlich',
  Westen: 'westlich',
  Nordwesten: 'nordwestlich',
});

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;
const round1 = (value: number) => Math.round(value * 10) / 10;

/** Anfangskurs (0° = Norden, im Uhrzeigersinn) von `from` nach `to`. */
export function bearingDeg(from: LatLng, to: LatLng): number {
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const dLng = toRadians(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

/** Kurs → Himmelsrichtung (Sektoren zu je 45°, Norden = 337,5°–22,5°). */
export function directionOf(deg: number): Direction {
  return DIRECTIONS[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

export function oppositeDirection(direction: Direction): Direction {
  return DIRECTIONS[(DIRECTIONS.indexOf(direction) + 4) % 8];
}

const coords = (place: Pick<Place, 'lat' | 'lng'>): LatLng => ({ lat: place.lat, lng: place.lng });

/** Luftlinie zum Firmensitz laut Messung (0,1 km). */
export function airKm(place: Pick<Place, 'commute'>): number {
  return place.commute.airKm;
}

/** Wo der Ort vom Firmensitz in Wetzlar aus gesehen liegt. */
export function directionFromHeadquarters(place: Pick<Place, 'lat' | 'lng'>): Direction {
  return directionOf(bearingDeg(HEADQUARTERS, coords(place)));
}

/** Wo der Firmensitz vom Ort aus gesehen liegt (Gegenrichtung). */
export function directionToHeadquarters(place: Pick<Place, 'lat' | 'lng'>): Direction {
  return oppositeDirection(directionFromHeadquarters(place));
}

/** Viertel des Gebiets für den Satzbau: Norden (N, NO, NW), Süden (S, SO, SW), Osten, Westen. */
export type Quadrant = 'nord' | 'sued' | 'ost' | 'west';

export function quadrantOf(direction: Direction): Quadrant {
  if (direction === 'Osten') return 'ost';
  if (direction === 'Westen') return 'west';
  return direction.startsWith('Nord') ? 'nord' : 'sued';
}

/**
 * Streckenstufe: die kleinste der Stufen 15, 25 und 35 km, die die Straßenstrecke fasst. Gemessen auf der Straße,
 * nicht in Luftlinie: Die Ringe der Pläne (Radius-Schalter, Gebietsplan) zeigen die Luftlinie und heißen darum allein
 * „Ring“; im Text heißt die Stufe „bis 15 km Strecke“, „16 bis 25 km“, „26 bis 35 km“ (roadBandLabel).
 */
export function roadBandKm(place: Pick<Place, 'commute'>): number {
  const band = RING_RADII_KM.find((radius) => place.commute.distanceKm <= radius);
  if (band === undefined) throw new RangeError(`Strecke ${place.commute.distanceKm} km liegt außerhalb aller Stufen`);
  return band;
}

/** Untergrenze einer Streckenstufe in ganzen km (Messwerte sind ganze km): 0, 16, 26. */
export function roadBandFloorKm(bandKm: number): number {
  const index = RING_RADII_KM.indexOf(bandKm);
  if (index < 0) throw new RangeError(`Keine Streckenstufe ${bandKm} km`);
  return index === 0 ? 0 : RING_RADII_KM[index - 1] + 1;
}

/** Zahl der Orte je Streckenstufe (15/25/35 km Straße). */
export function roadBandCounts(places: readonly Place[]): Record<number, number> {
  const counts: Record<number, number> = Object.fromEntries(RING_RADII_KM.map((radius) => [radius, 0]));
  for (const place of places) counts[roadBandKm(place)] += 1;
  return counts;
}

/** Luft um den äußersten Punkt eines Plans, damit sein Name noch in den Rahmen passt (km). */
export const PLAN_MARGIN_KM = 2;

/**
 * Ring des Plans, der alle Orte in Luftlinie fasst (mit Rand für die Namen): 15, 25 oder 35 km. Die Pläne zeigen die
 * Luftlinie; so liegen auf der Ortsseite der Ort und seine Nachbarn sicher im Ausschnitt.
 */
export function planRingKm(places: readonly Pick<Place, 'commute'>[]): number {
  const farthest = Math.max(0, ...places.map((place) => place.commute.airKm));
  return RING_RADII_KM.find((radius) => farthest + PLAN_MARGIN_KM <= radius) ?? RING_RADII_KM[RING_RADII_KM.length - 1];
}

export type DistanceBand = 'nah' | 'mittel' | 'weit';

/** Untergrenzen der Entfernungsbänder in km Straße: nah < 10, mittel 10–19, weit ab 20. */
export const DISTANCE_BAND_KM = Object.freeze({ mittel: 10, weit: 20 });

/** Entfernungsband der Straßenstrecke: < 10 km, 10–19 km, 20–35 km. */
export function distanceBand(place: Pick<Place, 'commute'>): DistanceBand {
  const { distanceKm } = place.commute;
  if (distanceKm < DISTANCE_BAND_KM.mittel) return 'nah';
  if (distanceKm < DISTANCE_BAND_KM.weit) return 'mittel';
  return 'weit';
}

/** Straßenstrecke ÷ Luftlinie (≥ 0,95 laut Schema). */
export function detourFactor(place: Pick<Place, 'commute'>): number {
  const { distanceKm, airKm: air } = place.commute;
  return air > 0 ? distanceKm / air : 1;
}

export type DetourCategory = 'direkt' | 'leicht' | 'normal' | 'umweg';

/** Bis 1,15 fast gerade („fast ohne Umweg“), bis 1,29 leicht, 1,3–1,49 üblich, ab 1,5 deutlicher Umweg der Straße. */
export function detourCategory(place: Pick<Place, 'commute'>): DetourCategory {
  const factor = detourFactor(place);
  if (factor <= 1.15) return 'direkt';
  if (factor < 1.3) return 'leicht';
  if (factor < 1.5) return 'normal';
  return 'umweg';
}

export interface Neighbor {
  place: Place;
  /** Luftlinie zwischen den beiden Orten, 0,1 km. */
  airKm: number;
  /** Straßenstrecke des Nachbarn zum Firmensitz. */
  distanceKm: number;
  /** Fahrzeit des Nachbarn zum Firmensitz. */
  minutes: number;
}

/** Luftlinie zwischen zwei Orten, 0,1 km. */
export function airKmBetween(a: Pick<Place, 'lat' | 'lng'>, b: Pick<Place, 'lat' | 'lng'>): number {
  return round1(haversineKm(coords(a), coords(b)));
}

/** Die `n` nächsten anderen Orte nach Luftlinie (bei Gleichstand nach Name). */
export function neighborsOf(place: Place, places: readonly Place[], n = 4): Neighbor[] {
  return places
    .filter((other) => other.id !== place.id)
    .map((other) => ({ place: other, exact: haversineKm(coords(place), coords(other)) }))
    .sort((a, b) => a.exact - b.exact || a.place.name.localeCompare(b.place.name, 'de'))
    .slice(0, n)
    .map(({ place: other, exact }) => ({
      place: other,
      airKm: round1(exact),
      distanceKm: other.commute.distanceKm,
      minutes: other.commute.minutes,
    }));
}

/** Median; bei gerader Anzahl der Mittelwert der beiden mittleren Werte. */
export function median(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError('median: keine Werte');
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface Rank {
  /** 1 + Zahl der Orte mit kürzerer Strecke (gleich weite Orte teilen sich den Rang). */
  rank: number;
  total: number;
  /** Orte der Gruppe mit kürzerer, gleicher und längerer Strecke (ohne den Ort selbst). */
  closer: number;
  same: number;
  farther: number;
  /** Gleich weite Orte der Gruppe, nach Name. */
  sameAs: Place[];
}

/** Rang nach Straßenstrecke innerhalb einer Gruppe, die den Ort enthält. */
export function rankByDistance(place: Place, group: readonly Place[]): Rank {
  const others = group.filter((other) => other.id !== place.id);
  const km = place.commute.distanceKm;
  const closer = others.filter((other) => other.commute.distanceKm < km).length;
  const sameAs = others
    .filter((other) => other.commute.distanceKm === km)
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  return {
    rank: closer + 1,
    total: others.length + 1,
    closer,
    same: sameAs.length,
    farther: others.length - closer - sameAs.length,
    sameAs,
  };
}

export interface GroupStats {
  count: number;
  /** Nach Strecke, Fahrzeit, Name. */
  places: Place[];
  /** Alle Orte mit der kürzesten bzw. längsten Strecke (Gleichstand möglich). */
  nearest: Place[];
  farthest: Place[];
  /** Median der Fahrzeiten, auf ganze Minuten gerundet wie die Messung. */
  medianMinutes: number;
  /** Median der Strecken, auf ganze km gerundet. */
  medianKm: number;
  /** Alle Orte mit der kürzesten bzw. längsten Fahrzeit. */
  fastest: Place[];
  slowest: Place[];
}

const byDistance = (a: Place, b: Place) =>
  a.commute.distanceKm - b.commute.distanceKm || a.commute.minutes - b.commute.minutes || a.name.localeCompare(b.name, 'de');

/** Kennzahlen einer Gruppe (Kreis, Stadtteile, ganzes Gebiet). */
export function groupStats(group: readonly Place[]): GroupStats {
  if (group.length === 0) throw new RangeError('groupStats: leere Gruppe');
  const places = [...group].sort(byDistance);
  const kms = places.map((place) => place.commute.distanceKm);
  const minutes = places.map((place) => place.commute.minutes);
  const minKm = Math.min(...kms);
  const maxKm = Math.max(...kms);
  const minMinutes = Math.min(...minutes);
  const maxMinutes = Math.max(...minutes);
  return {
    count: places.length,
    places,
    nearest: places.filter((place) => place.commute.distanceKm === minKm),
    farthest: places.filter((place) => place.commute.distanceKm === maxKm),
    medianMinutes: Math.round(median(minutes)),
    medianKm: Math.round(median(kms)),
    fastest: places.filter((place) => place.commute.minutes === minMinutes),
    slowest: places.filter((place) => place.commute.minutes === maxMinutes),
  };
}

/** Kennzahlen eines Kreises aus den übergebenen (veröffentlichten) Orten. */
export function kreisStats(kreisId: string, places: readonly Place[]): GroupStats {
  return groupStats(places.filter((place) => place.kreisId === kreisId));
}

export type MedianRelation = 'schneller' | 'gleich' | 'langsamer';

export interface MedianComparison {
  relation: MedianRelation;
  /** Betrag der Differenz in ganzen Minuten. */
  diffMinutes: number;
  medianMinutes: number;
}

/** Fahrzeit des Orts gegen den Median seiner Gruppe. */
export function compareToMedian(place: Pick<Place, 'commute'>, stats: Pick<GroupStats, 'medianMinutes'>): MedianComparison {
  const diff = place.commute.minutes - stats.medianMinutes;
  return {
    relation: diff < 0 ? 'schneller' : diff > 0 ? 'langsamer' : 'gleich',
    diffMinutes: Math.abs(diff),
    medianMinutes: stats.medianMinutes,
  };
}
