import { describe, expect, it } from 'vitest';

import { dateLine, formatIsoDate, formatLetterDate, placeFromLocation } from '../format';

describe('letter date line', () => {
  it('formats German long dates', () => {
    expect(formatLetterDate(new Date(2026, 9, 8))).toBe('8. Oktober 2026');
  });

  it('drops the postal code and handles missing parts', () => {
    expect(placeFromLocation(' 35578 Wetzlar ')).toBe('Wetzlar');
    expect(placeFromLocation('Gießen')).toBe('Gießen');
    expect(dateLine('35578 Wetzlar', '8. Oktober 2026')).toBe('Wetzlar, 8. Oktober 2026');
    expect(dateLine('', '8. Oktober 2026')).toBe('8. Oktober 2026');
    expect(dateLine('Wetzlar', '')).toBe('Wetzlar');
    expect(dateLine('', '')).toBe('');
  });
});

describe('date from a date field', () => {
  it('writes ISO dates out in German, independent of the time zone', () => {
    expect(formatIsoDate('2026-12-01')).toBe('1. Dezember 2026');
    expect(formatIsoDate(' 2027-01-31 ')).toBe('31. Januar 2027');
    expect(formatIsoDate('2028-02-29')).toBe('29. Februar 2028');
  });

  it('leaves everything else as typed', () => {
    expect(formatIsoDate('01.12.2026')).toBe('01.12.2026');
    expect(formatIsoDate('2026-02-30')).toBe('2026-02-30');
    expect(formatIsoDate('2026-13-01')).toBe('2026-13-01');
    expect(formatIsoDate('ab sofort')).toBe('ab sofort');
    expect(formatIsoDate('')).toBe('');
  });
});
