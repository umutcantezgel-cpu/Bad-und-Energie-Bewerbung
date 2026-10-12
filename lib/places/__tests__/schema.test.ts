import { describe, expect, it } from 'vitest';
import { FACTS } from '@/lib/content/facts';
import { REGION } from '@/lib/content/region';
import { haversineKm } from '@/lib/maps/projection';
import { ALL_PLACES } from '../data';
import { MEASURED_PLACES, MEASUREMENT, MEASUREMENT_SOURCE } from '../measurement';
import { MAX_ROAD_KM, PlaceSchema, definePlace, slugifyPlaceName, type PlaceInput } from '../schema';

const HQ = { lat: MEASUREMENT.headquarters.lat, lng: MEASUREMENT.headquarters.lng };
const base = ALL_PLACES.find((place) => place.id === 'asslar')! as unknown as PlaceInput;
const withCommute = (commute: Partial<PlaceInput['commute']>): PlaceInput => ({ ...base, commute: { ...base.commute, ...commute } });

describe('Orts-Schema', () => {
  it.each(ALL_PLACES.map((place) => [place.id, place] as const))('%s erfüllt das Schema', (_id, place) => {
    const result = PlaceSchema.safeParse(place);
    expect(result.success, result.success ? '' : JSON.stringify(result.error.issues, null, 2)).toBe(true);
  });

  it('Gebietsregel: 35 km wie REGION.radiusKm und Fakt radius35', () => {
    expect(MAX_ROAD_KM).toBe(35);
    expect(MAX_ROAD_KM).toBe(REGION.radiusKm);
    expect(FACTS.radius35.value).toBe(`${MAX_ROAD_KM} km`);
  });

  it('Messung: Firmensitz Siegmund-Hiepe-Str. 20, Quelle auf Commit gepinnt', () => {
    expect(MEASUREMENT.headquarters.address).toBe('Siegmund-Hiepe-Str. 20, 35578 Wetzlar');
    expect(MEASUREMENT_SOURCE).toMatch(/^docs\/operations\/orte-messung\.md@[0-9a-f]{7,40}$/);
    expect(MEASUREMENT.measuredOn).toBe('2026-10-12');
  });

  it('übernimmt genau die aufgenommenen Kandidaten der Messung', () => {
    const included = MEASURED_PLACES.filter((m) => m.included);
    expect(ALL_PLACES.map((p) => p.id)).toEqual(included.map((m) => m.id));
    expect(ALL_PLACES).toHaveLength(55);
    for (const place of ALL_PLACES) {
      const measured = included.find((m) => m.id === place.id)!;
      expect(place.commute.distanceKm, place.id).toBe(measured.distanceKm);
      expect(place.commute.minutes, place.id).toBe(measured.minutes);
      expect(place.commute.airKm, place.id).toBe(measured.airKm);
      expect(place.postalCode, place.id).toBe(measured.postalCode);
      expect(place.seat, place.id).toBe(measured.seat);
      expect(place.commute.source).toBe(MEASUREMENT_SOURCE);
      expect(place.updatedAt).toBe('2026-10-12');
    }
  });

  it('Gegenprobe jeder veröffentlichten Strecke: ≤ 35 km und ≥ 0,95 × Luftlinie', () => {
    for (const place of ALL_PLACES.filter((p) => p.status === 'published')) {
      const air = haversineKm(HQ, place);
      expect(place.commute.distanceKm, place.id).toBeLessThanOrEqual(MAX_ROAD_KM);
      expect(place.commute.distanceKm, place.id).toBeGreaterThanOrEqual(0.95 * air);
      expect(Math.abs(place.commute.airKm - air), place.id).toBeLessThan(0.15);
    }
  });

  it('Slugs: ASCII aus dem Namen, gleich der Mess-ID', () => {
    expect(slugifyPlaceName('Allendorf (Lumda)')).toBe('allendorf-lumda');
    expect(slugifyPlaceName('Heuchelheim an der Lahn')).toBe('heuchelheim-an-der-lahn');
    expect(slugifyPlaceName('Weimar (Lahn)')).toBe('weimar-lahn');
    expect(slugifyPlaceName('Aßlar')).toBe('asslar');
    expect(slugifyPlaceName('Münchholzhausen')).toBe('muenchholzhausen');
    expect(slugifyPlaceName('Löhnberg')).toBe('loehnberg');
    expect(slugifyPlaceName('Gießen')).toBe('giessen');
    for (const place of ALL_PLACES) {
      expect(place.slug, place.name).toBe(place.id);
      expect(place.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('Stadtteile hängen an Wetzlar, nur sie haben parentId', () => {
    for (const place of ALL_PLACES) {
      if (place.kind === 'stadtteil') expect(place.parentId, place.id).toBe('wetzlar');
      else expect(place.parentId, place.id).toBeUndefined();
    }
    expect(ALL_PLACES.filter((p) => p.kind === 'stadt').map((p) => p.id)).toEqual(['wetzlar']);
  });

  it('Objekte sind eingefroren', () => {
    expect(Object.isFrozen(ALL_PLACES[0])).toBe(true);
    expect(Object.isFrozen(ALL_PLACES[0].commute)).toBe(true);
  });
});

describe('definePlace', () => {
  it('nimmt einen gültigen Ort an', () => {
    expect(() => definePlace(base)).not.toThrow();
  });

  it('lehnt veröffentlichte Orte über 35 km Straße ab', () => {
    expect(() => definePlace(withCommute({ distanceKm: 36 }))).toThrow(/radius35/);
    const pending = { status: 'pending', statusNote: 'Außerhalb des Gebiets', homeMap: false, legacyLocationId: undefined } as const;
    expect(() => definePlace({ ...withCommute({ distanceKm: 36 }), ...pending })).not.toThrow();
  });

  it('lehnt Strecken unter 0,95 × Luftlinie ab', () => {
    expect(() => definePlace(withCommute({ distanceKm: 4 }))).toThrow(/Luftlinie/);
  });

  it('lehnt eine Luftlinie ab, die nicht zu den Koordinaten passt', () => {
    expect(() => definePlace(withCommute({ airKm: 6 }))).toThrow(/airKm/);
  });

  it('verlangt die Messquelle orte-messung.md@<sha> für veröffentlichte Orte', () => {
    expect(() => definePlace(withCommute({ source: 'lib/data/locations.ts@075aa71' }))).toThrow(/orte-messung/);
    expect(() => definePlace(withCommute({ source: 'docs/operations/orte-messung.md' }))).toThrow(/pfad@commit/);
  });

  it('verlangt eine fünfstellige PLZ und einen ASCII-Slug', () => {
    expect(() => definePlace({ ...base, postalCode: '3561' })).toThrow(/PLZ/);
    expect(() => definePlace({ ...base, slug: 'aßlar' })).toThrow(/Slug/);
    expect(() => definePlace({ ...base, slug: 'Asslar' })).toThrow(/Slug/);
  });

  it('Stadtteile brauchen Wetzlar als Elternort', () => {
    expect(() => definePlace({ ...base, kind: 'stadtteil' })).toThrow(/parentId/);
    expect(() => definePlace({ ...base, parentId: 'wetzlar' })).toThrow(/parentId/);
  });

  it('merged und archived brauchen einen Grund', () => {
    expect(() => definePlace({ ...base, homeMap: false, legacyLocationId: undefined, status: 'merged' })).toThrow(/Grund/);
    expect(() =>
      definePlace({ ...base, homeMap: false, legacyLocationId: undefined, status: 'merged', statusNote: 'Besteht U3 nicht' }),
    ).not.toThrow();
  });

  it('Startseitenkarte nur mit veröffentlichtem Ort und bisheriger ID', () => {
    expect(() => definePlace({ ...base, legacyLocationId: undefined })).toThrow(/bisherige ID/);
    expect(() => definePlace({ ...base, status: 'pending', statusNote: 'Freigabe offen' })).toThrow(/veröffentlichte/);
  });

  it('lehnt unbekannte Kreise und redirectFrom mit dem eigenen Slug ab', () => {
    expect(() => definePlace({ ...base, kreisId: 'vogelsbergkreis' as never })).toThrow(/kreisId/);
    expect(() => definePlace({ ...base, redirectFrom: ['asslar'] })).toThrow(/redirectFrom/);
  });
});
