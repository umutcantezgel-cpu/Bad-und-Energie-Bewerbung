import { describe, expect, it } from 'vitest';
import { SWITCH_RADII_KM } from '@/components/maps/views';
import {
  DIRECTIONS,
  HEADQUARTERS,
  RING_RADII_KM,
  airKm,
  airKmBetween,
  bearingDeg,
  compareToMedian,
  detourCategory,
  directionFromHeadquarters,
  directionOf,
  directionToHeadquarters,
  distanceBand,
  groupStats,
  kreisStats,
  median,
  neighborsOf,
  oppositeDirection,
  quadrantOf,
  rankByDistance,
  planRingKm,
  roadBandCounts,
  roadBandFloorKm,
  roadBandKm,
} from '../derive';
import { getPlaceById, getPublishedPlaces } from '../registry';

const places = getPublishedPlaces();
const place = (id: string) => getPlaceById(id)!;

describe('derive: Richtung', () => {
  it('Kurs: Norden 0°, Osten 90°, Süden 180°, Westen 270°', () => {
    const { lat, lng } = HEADQUARTERS;
    expect(bearingDeg(HEADQUARTERS, { lat: lat + 0.1, lng })).toBeCloseTo(0, 5);
    expect(bearingDeg(HEADQUARTERS, { lat, lng: lng + 0.1 })).toBeCloseTo(90, 0);
    expect(bearingDeg(HEADQUARTERS, { lat: lat - 0.1, lng })).toBeCloseTo(180, 5);
    expect(bearingDeg(HEADQUARTERS, { lat, lng: lng - 0.1 })).toBeCloseTo(270, 0);
  });

  it('acht Sektoren zu je 45°', () => {
    expect(directionOf(0)).toBe('Norden');
    expect(directionOf(22.4)).toBe('Norden');
    expect(directionOf(22.6)).toBe('Nordosten');
    expect(directionOf(359)).toBe('Norden');
    expect(directionOf(200)).toBe('Süden');
    expect(DIRECTIONS.map(oppositeDirection)).toEqual(['Süden', 'Südwesten', 'Westen', 'Nordwesten', 'Norden', 'Nordosten', 'Osten', 'Südosten']);
  });

  it('vom Firmensitz aus gesehen: Aßlar im Norden, Gießen im Osten, Braunfels im Südwesten', () => {
    expect(directionFromHeadquarters(place('asslar'))).toBe('Norden');
    expect(directionToHeadquarters(place('asslar'))).toBe('Süden');
    expect(directionFromHeadquarters(place('giessen'))).toBe('Osten');
    expect(directionFromHeadquarters(place('braunfels'))).toBe('Südwesten');
    expect(directionFromHeadquarters(place('herborn'))).toBe('Nordwesten');
    expect(quadrantOf('Nordwesten')).toBe('nord');
    expect(quadrantOf('Südosten')).toBe('sued');
    expect(quadrantOf('Osten')).toBe('ost');
  });
});

describe('derive: Ringe und Stufen', () => {
  it('Ringe wie der Radius-Schalter der Karte (SWITCH_RADII_KM)', () => {
    expect([...RING_RADII_KM]).toEqual([...SWITCH_RADII_KM]);
  });

  it('Streckenstufe: kleinste Stufe, die die Straßenstrecke fasst (nicht die Luftlinie)', () => {
    expect(roadBandKm(place('steindorf'))).toBe(15);
    expect(roadBandKm(place('heuchelheim-an-der-lahn'))).toBe(15);
    expect(roadBandKm(place('biebertal'))).toBe(25);
    expect(roadBandKm(place('mittenaar'))).toBe(25);
    expect(roadBandKm(place('bad-endbach'))).toBe(35);
    // Herborn: Straße in der äußeren Stufe, Luftlinie im Ring bis 25 km
    expect(roadBandKm(place('herborn'))).toBe(35);
    expect(place('herborn').commute.airKm).toBeLessThan(25);
    expect(roadBandCounts(places)).toEqual({ 15: 17, 25: 14, 35: 23 });
    expect([0, 16, 26]).toEqual(RING_RADII_KM.map(roadBandFloorKm));
  });

  it('Ring des Plans: Luftlinie mit Rand für die Namen', () => {
    expect(planRingKm([place('steindorf')])).toBe(15);
    expect(planRingKm([place('herborn')])).toBe(25);
    expect(planRingKm([place('breitscheid')])).toBe(35);
    expect(planRingKm(places)).toBe(35);
  });

  it('Entfernungsband und Umweg aus den Messwerten', () => {
    expect(distanceBand(place('asslar'))).toBe('nah');
    expect(distanceBand(place('leun'))).toBe('mittel');
    expect(distanceBand(place('waldsolms'))).toBe('weit');
    expect(airKm(place('asslar'))).toBe(4.5);
    expect(detourCategory(place('braunfels'))).toBe('direkt');
    // Weilburg: 21 km Straße bei 16,6 km Luftlinie (Faktor 1,27) ist nicht „fast ohne Umweg“
    expect(detourCategory(place('weilburg'))).toBe('leicht');
    expect(detourCategory(place('solms'))).toBe('normal');
    expect(detourCategory(place('hermannstein'))).toBe('umweg');
  });
});

describe('derive: Nachbarn und Gruppen', () => {
  it('neighborsOf: die n nächsten anderen Orte nach Luftlinie, mit eigener Strecke', () => {
    const neighbors = neighborsOf(place('nauborn'), places);
    expect(neighbors).toHaveLength(4);
    expect(neighbors.map((n) => n.place.id)).not.toContain('nauborn');
    const kms = neighbors.map((n) => n.airKm);
    expect(kms).toEqual([...kms].sort((a, b) => a - b));
    expect(neighbors[0]).toMatchObject({ place: { id: 'wetzlar' }, distanceKm: 3, minutes: 6 });
    expect(neighbors[0].airKm).toBe(airKmBetween(place('nauborn'), place('wetzlar')));
    expect(neighborsOf(place('nauborn'), places, 2)).toHaveLength(2);
  });

  it('median: ungerade und gerade Anzahl', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(() => median([])).toThrow(RangeError);
  });

  it('Rang nach Strecke mit Gleichstand', () => {
    const ldk = kreisStats('lahn-dill-kreis', places);
    expect(ldk.count).toBe(26);
    expect(ldk.nearest.map((p) => p.id)).toEqual(['steindorf']);
    expect(ldk.farthest.map((p) => p.id)).toEqual(['breitscheid']);
    expect(ldk.medianMinutes).toBe(13);
    const garbenheim = rankByDistance(place('garbenheim'), ldk.places);
    expect(garbenheim).toMatchObject({ rank: 3, total: 26, closer: 2, same: 1, farther: 22 });
    expect(garbenheim.sameAs.map((p) => p.id)).toEqual(['nauborn']);
  });

  it('Kreis-Statistik mit Gleichstand an der Spitze (Limburg-Weilburg)', () => {
    const lm = kreisStats('landkreis-limburg-weilburg', places);
    expect(lm.nearest.map((p) => p.id).sort()).toEqual(['loehnberg', 'weilmuenster']);
    expect(lm.fastest.map((p) => p.id)).toEqual(['loehnberg']);
    expect(lm.farthest.map((p) => p.id)).toEqual(['villmar']);
  });

  it('Vergleich mit dem Median', () => {
    const stats = { medianMinutes: 13 };
    expect(compareToMedian(place('asslar'), stats)).toEqual({ relation: 'schneller', diffMinutes: 1, medianMinutes: 13 });
    expect(compareToMedian(place('leun'), stats)).toEqual({ relation: 'gleich', diffMinutes: 0, medianMinutes: 13 });
    expect(compareToMedian(place('herborn'), stats)).toEqual({ relation: 'langsamer', diffMinutes: 13, medianMinutes: 13 });
  });

  it('groupStats lehnt leere Gruppen ab', () => {
    expect(() => groupStats([])).toThrow(RangeError);
  });
});
