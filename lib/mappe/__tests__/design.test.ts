import { describe, expect, it } from 'vitest';
import { MAPPE_DESIGN } from '@/lib/applications/constants';
import {
  AKZENTE,
  AKZENT_FARBEN,
  FOTOFORMEN,
  SCHRIFTSTILE,
  STANDARD_DESIGN,
  VORLAGEN,
  designAus,
  fotoformAus,
  istStandard,
} from '@/lib/mappe/blatt/design';

function luminanz(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
/** Farbton (HSL) in Grad. */
function farbton(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 180;
  const d = max - min;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

const kontrast = (a: string, b: string) => {
  const [hell, dunkel] = [luminanz(a), luminanz(b)].sort((x, y) => y - x);
  return (hell + 0.05) / (dunkel + 0.05);
};

describe('Design der Mappe (L3)', () => {
  it('die Werte sind die des Vertrags (lib/applications/constants.ts)', () => {
    expect(VORLAGEN).toEqual(MAPPE_DESIGN.vorlagen);
    expect(AKZENTE).toEqual(MAPPE_DESIGN.akzente);
    expect(SCHRIFTSTILE).toEqual(MAPPE_DESIGN.schriften);
    expect(FOTOFORMEN).toEqual(['eckig', 'abgerundet', 'rund']);
  });

  it('sechs Akzente, kein Rot, je ≥ 4,5 : 1 auf Weiß und auf der eigenen Tönung, Tinte ≥ 4,5 : 1 auf der Tönung', () => {
    expect(Object.keys(AKZENT_FARBEN)).toEqual([...AKZENTE]);
    for (const akzent of AKZENTE) {
      const { farbe, toenung } = AKZENT_FARBEN[akzent];
      expect(kontrast(farbe, '#FFFFFF'), akzent).toBeGreaterThanOrEqual(4.5);
      expect(kontrast(farbe, toenung), akzent).toBeGreaterThanOrEqual(4.5);
      expect(kontrast('#111A3B', toenung), akzent).toBeGreaterThanOrEqual(4.5);
      expect(kontrast('#454C78', toenung), akzent).toBeGreaterThanOrEqual(4.5);
      // Kein Rot: Rot ist auf der Seite der Bewerben-Knopf (K-006); Farbton nicht zwischen 345° und 15°
      const ton = farbton(farbe);
      expect(ton > 15 && ton < 345, `${akzent}: ${Math.round(ton)}°`).toBe(true);
    }
  });

  it('designAus: gültige Werte bleiben, Unbekanntes fällt je Feld auf den Standard', () => {
    expect(designAus({ vorlage: 'farbband', akzent: 'petrol', schrift: 'markant' })).toEqual({ vorlage: 'farbband', akzent: 'petrol', schrift: 'markant' });
    expect(designAus({ vorlage: 'bunt', akzent: 'petrol' })).toEqual({ ...STANDARD_DESIGN, akzent: 'petrol' });
    expect(designAus(undefined)).toEqual(STANDARD_DESIGN);
    expect(designAus('farbband')).toEqual(STANDARD_DESIGN);
    expect(fotoformAus('rund')).toBe('rund');
    expect(fotoformAus('oval')).toBe('abgerundet');
    expect(istStandard(STANDARD_DESIGN)).toBe(true);
    expect(istStandard({ ...STANDARD_DESIGN, akzent: 'kupfer' })).toBe(false);
  });
});
