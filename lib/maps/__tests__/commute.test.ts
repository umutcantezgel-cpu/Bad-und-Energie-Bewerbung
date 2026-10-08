import { describe, expect, it } from 'vitest';
import { REGION, getCommute } from '@/lib/content/region';
import { findCommute, formatCommute, formatKm, formatMinutes, normalizePlaceName } from '../commute';

const places = REGION.locations;

describe('normalizePlaceName', () => {
  it.each([
    ['Gießen', 'giessen'],
    ['Giessen', 'giessen'],
    ['  AßLAR ', 'asslar'],
    ['Wetzlar-Kernstadt', 'wetzlar kernstadt'],
    ['Müller', 'mueller'],
  ])('%s → %s', (input, expected) => {
    expect(normalizePlaceName(input)).toBe(expected);
  });
});

describe('findCommute', () => {
  it('finds by id, postal code and name (umlaut-insensitive)', () => {
    expect(findCommute('loc-giessen', places)?.name).toBe('Gießen');
    expect(findCommute('35390', places)?.id).toBe('loc-giessen');
    expect(findCommute('giessen', places)?.id).toBe('loc-giessen');
    expect(findCommute('Asslar', places)?.id).toBe('loc-asslar');
    expect(findCommute('HERBORN', places)?.id).toBe('loc-herborn');
  });

  it('accepts an unambiguous prefix of the name or one of its words', () => {
    expect(findCommute('gies', places)?.id).toBe('loc-giessen');
    expect(findCommute('kern', places)?.id).toBe('loc-wetzlar-mitte');
    expect(findCommute('wetzlar', places)?.id).toBe('loc-wetzlar-mitte');
  });

  it('returns undefined for empty, unknown or ambiguous queries', () => {
    expect(findCommute('', places)).toBeUndefined();
    expect(findCommute('   ', places)).toBeUndefined();
    expect(findCommute('Frankfurt', places)).toBeUndefined();
    expect(findCommute('99999', places)).toBeUndefined();
    // "h" matches Hermannstein and Herborn
    expect(findCommute('h', places)).toBeUndefined();
  });

  it('agrees with getCommute for every REGION location', () => {
    for (const place of places) {
      expect(findCommute(place.id, places)).toBe(getCommute(place.id));
      expect(findCommute(place.name, places)).toBe(place);
      expect(findCommute(place.postalCode, places)?.postalCode).toBe(place.postalCode);
    }
  });
});

describe('formatCommute', () => {
  it('formats "ca. X km · Y Min. bis Wetzlar" from REGION data only', () => {
    const giessen = getCommute('loc-giessen')!;
    expect(formatCommute(giessen, REGION.center.name)).toBe(
      `ca. ${giessen.distanceKm} km · ${giessen.commuteMinutes} Min. bis Wetzlar`,
    );
  });

  it('uses German number formatting', () => {
    expect(formatKm(1234)).toBe('1.234 km');
    expect(formatMinutes(7)).toBe('7 Min.');
  });
});
