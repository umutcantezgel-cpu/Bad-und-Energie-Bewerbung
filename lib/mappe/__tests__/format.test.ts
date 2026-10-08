import { describe, expect, it } from 'vitest';

import { dateLine, formatLetterDate, placeFromLocation } from '../format';

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
