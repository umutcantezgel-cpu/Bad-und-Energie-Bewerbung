import { describe, expect, it } from 'vitest';
import { WITHHELD_CHARACTER_IDS, placeCharacter } from '@/components/maps/views';
import { regionalLocations } from '@/lib/data/locations';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import slugLock from '../slugs.lock.json';
import { CHARACTER_SOURCE } from '../data';
import { HOME_MAP_PLACES } from '../home-map';
import { KREIS_DEFS, KREIS_IDS } from '../kreise';
import { MEASUREMENT } from '../measurement';
import {
  EINSATZGEBIET_PATH,
  KREIS_HUB_MIN_PLACES,
  findPublishedPlaceByName,
  getAllPlaces,
  getEinsatzgebietPageSlugs,
  getEinsatzgebietRouteSlugs,
  getHubKreise,
  getKreisById,
  getKreisBySlug,
  getKreise,
  getKreisPlaces,
  getPlaceById,
  getPlaceByLegacySlug,
  getPlaceBySlug,
  getPlacePageSlugs,
  getPublishedPlaces,
  getStadtteile,
  kreisPath,
  kreisUrl,
  placePath,
  placeRedirectPath,
  placeUrl,
  resolveEinsatzgebietSlug,
} from '../registry';

const HOME_MAP_IDS = ['wetzlar', 'hermannstein', 'nauborn', 'garbenheim', 'dutenhofen', 'steindorf', 'asslar', 'braunfels', 'giessen', 'herborn'];
const base = SITE_CONFIG.baseUrl.replace(/\/+$/, '');

describe('Orts-Registry', () => {
  it('veröffentlicht alle 54 aufgenommenen Orte, sortiert nach Strecke', () => {
    const published = getPublishedPlaces();
    expect(published).toHaveLength(54);
    const kms = published.map((p) => p.commute.distanceKm);
    expect(kms).toEqual([...kms].sort((a, b) => a - b));
    expect(published[0].id).toBe('steindorf');
    expect(getAllPlaces().filter((p) => p.status !== 'published')).toEqual([]);
  });

  it('IDs und Slugs sind eindeutig, auch gegen die Kreis-Slugs (flacher Namensraum)', () => {
    const placeSlugs = getAllPlaces().flatMap((p) => [p.slug, ...p.redirectFrom]);
    const kreisSlugs = KREIS_IDS.map((id) => KREIS_DEFS[id].slug);
    const all = [...placeSlugs, ...kreisSlugs];
    expect(new Set(all).size).toBe(all.length);
    expect(new Set(getAllPlaces().map((p) => p.id)).size).toBe(getAllPlaces().length);
    for (const slug of kreisSlugs) expect(getPlaceBySlug(slug), slug).toBeUndefined();
  });

  it('Kreise: Namen wie in der Messung, Hub ab 3 Orten', () => {
    for (const id of KREIS_IDS) expect(KREIS_DEFS[id].name).toBe(MEASUREMENT.kreise[id]);
    expect(Object.fromEntries(getKreise().map((k) => [k.id, [k.placeCount, k.hasHub]]))).toEqual({
      'lahn-dill-kreis': [26, true],
      'landkreis-giessen': [12, true],
      'landkreis-marburg-biedenkopf': [2, false],
      'landkreis-limburg-weilburg': [9, true],
      wetteraukreis: [3, true],
      hochtaunuskreis: [2, false],
    });
    expect(KREIS_HUB_MIN_PLACES).toBe(3);
    expect(getHubKreise().map((k) => k.slug)).toEqual(['lahn-dill-kreis', 'landkreis-giessen', 'landkreis-limburg-weilburg', 'wetteraukreis']);
    for (const kreis of getKreise()) expect(getKreisPlaces(kreis.id)).toHaveLength(kreis.placeCount);
  });

  it('Lahn-Dill-Kreis führt den Fakt countyPartner, sonst kein Kreis', () => {
    expect(getKreisById('lahn-dill-kreis')?.factIds).toEqual(['countyPartner']);
    for (const kreis of getKreise().filter((k) => k.id !== 'lahn-dill-kreis')) expect(kreis.factIds).toEqual([]);
  });

  it('jeder Ort hat einen Kreis mit Namen für Überschriften und Fließtext', () => {
    for (const place of getAllPlaces()) {
      const kreis = getKreisById(place.kreisId)!;
      expect(kreis, place.id).toBeDefined();
      expect(kreis.dative).toMatch(/^im /);
      expect(kreis.genitive).toMatch(/^des .*[Kk]reises\b/);
    }
  });

  it('Stadtteile von Wetzlar', () => {
    expect(getStadtteile('wetzlar').map((p) => p.id)).toEqual([
      'steindorf',
      'garbenheim',
      'nauborn',
      'hermannstein',
      'naunheim',
      'muenchholzhausen',
      'blasbach',
      'dutenhofen',
    ]);
  });

  it('Pfade und URLs wie jobUrl: flach unter /einsatzgebiet', () => {
    const asslar = getPlaceBySlug('asslar')!;
    expect(placePath(asslar)).toBe('/einsatzgebiet/asslar');
    expect(placeUrl(asslar)).toBe(`${base}/einsatzgebiet/asslar`);
    const ldk = getKreisBySlug('lahn-dill-kreis')!;
    expect(kreisPath(ldk)).toBe('/einsatzgebiet/lahn-dill-kreis');
    expect(kreisUrl(ldk)).toBe(`${base}/einsatzgebiet/lahn-dill-kreis`);
    const hochtaunus = getKreisById('hochtaunuskreis')!;
    expect(kreisPath(hochtaunus)).toBe(`${EINSATZGEBIET_PATH}#hochtaunuskreis`);
  });

  it('Slug-Lock: jede Seite unter /einsatzgebiet steht im Lock, jeder gesperrte Slug lebt weiter oder leitet um', () => {
    const locked = new Set(slugLock.slugs);
    for (const slug of getEinsatzgebietPageSlugs()) expect(locked, `Slug fehlt in slugs.lock.json: ${slug}`).toContain(slug);
    for (const slug of locked) {
      expect(resolveEinsatzgebietSlug(slug), `Gesperrter Slug ohne Seite und ohne Weiterleitung: ${slug}`).toBeDefined();
    }
    expect(locked.size).toBe(slugLock.slugs.length);
  });

  it('löst Segmente auf: Ort, Kreis-Hub, Kreis ohne Hub, unbekannt', () => {
    expect(resolveEinsatzgebietSlug('herborn')).toMatchObject({ type: 'place', place: { id: 'herborn' } });
    expect(resolveEinsatzgebietSlug('landkreis-giessen')).toMatchObject({ type: 'kreis', kreis: { id: 'landkreis-giessen' } });
    expect(resolveEinsatzgebietSlug('hochtaunuskreis')).toEqual({ type: 'redirect', to: '/einsatzgebiet#hochtaunuskreis' });
    expect(resolveEinsatzgebietSlug('gibt-es-nicht')).toBeUndefined();
    expect(getPlaceByLegacySlug('gibt-es-nicht')).toBeUndefined();
    expect(getPlacePageSlugs()).toHaveLength(54);
    expect(placeRedirectPath(getPlaceById('herborn')!)).toBeUndefined();
  });

  it('Startseitenkarte: genau die 10 Orte aus lib/data/locations.ts', () => {
    const homeMap = getAllPlaces().filter((p) => p.homeMap);
    expect(homeMap.map((p) => p.id).sort()).toEqual([...HOME_MAP_IDS].sort());
    expect(homeMap.map((p) => p.legacyLocationId).sort()).toEqual(regionalLocations.map((l) => l.id).sort());
    for (const place of homeMap) {
      const legacy = regionalLocations.find((l) => l.id === place.legacyLocationId)!;
      expect(legacy.plz.length, place.id).toBe(5);
      // Name in locations.ts: „Wetzlar Kernstadt“, sonst gleich.
      expect(legacy.name.startsWith(place.name), place.id).toBe(true);
    }
  });

  it('Kurzbeschreibungen: nur die 7 freigegebenen, wörtlich; M-016 bleibt zurückgehalten', () => {
    const withCharacter = getAllPlaces().filter((p) => p.character);
    expect(withCharacter).toHaveLength(7);
    for (const place of withCharacter) {
      expect(place.character!.text, place.id).toBe(placeCharacter(place.legacyLocationId!));
      expect(place.character!.source).toBe(CHARACTER_SOURCE);
    }
    for (const withheld of WITHHELD_CHARACTER_IDS) {
      const place = getAllPlaces().find((p) => p.legacyLocationId === withheld)!;
      expect(place, withheld).toBeDefined();
      expect(place.character, withheld).toBeUndefined();
    }
    expect(CHARACTER_SOURCE).toMatch(/^lib\/data\/locations\.ts@[0-9a-f]{7,40}$/);
  });
});

describe('Startseitenkarte aus der Messung (E-028, Plan „Übergang“)', () => {
  it('lib/places/home-map.ts (zod-frei) und die Registry nennen dieselben Orte mit denselben Werten', () => {
    const fromRegistry = getAllPlaces().filter((p) => p.homeMap);
    expect(HOME_MAP_PLACES.map((p) => p.id)).toEqual(fromRegistry.map((p) => p.id));
    for (const place of fromRegistry) {
      const home = HOME_MAP_PLACES.find((p) => p.id === place.id)!;
      expect(home).toMatchObject({
        legacyLocationId: place.legacyLocationId,
        name: place.name,
        postalCode: place.postalCode,
        distanceKm: place.commute.distanceKm,
        minutes: place.commute.minutes,
        lat: place.lat,
        lng: place.lng,
        path: placePath(place),
      });
    }
  });

  it('lib/data/locations.ts zeigt dieselben km und Minuten wie die Ortsseiten', () => {
    for (const location of regionalLocations) {
      const place = getAllPlaces().find((p) => p.legacyLocationId === location.id)!;
      expect([location.distanceKm, location.commuteMinutes, location.plz], location.id).toEqual([
        place.commute.distanceKm,
        place.commute.minutes,
        place.postalCode,
      ]);
      expect([location.latitude, location.longitude]).toEqual([place.lat, place.lng]);
      expect(location.placePath).toBe(placePath(place));
    }
  });

  it('findPublishedPlaceByName: gleicher oder eindeutig verlängerter Name, sonst nichts', () => {
    expect(findPublishedPlaceByName('Herborn')?.id).toBe('herborn');
    expect(findPublishedPlaceByName('Heuchelheim')?.id).toBe('heuchelheim-an-der-lahn');
    expect(findPublishedPlaceByName('Dillenburg')).toBeUndefined();
    expect(findPublishedPlaceByName('Wetzlar')?.id).toBe('wetzlar');
  });

  it('getEinsatzgebietRouteSlugs: Seiten und Weiterleitungen, jeder Slug einmal, jeder lösbar', () => {
    const slugs = getEinsatzgebietRouteSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(resolveEinsatzgebietSlug(slug), slug).toBeDefined();
    for (const slug of getEinsatzgebietPageSlugs()) expect(slugs).toContain(slug);
  });
});
