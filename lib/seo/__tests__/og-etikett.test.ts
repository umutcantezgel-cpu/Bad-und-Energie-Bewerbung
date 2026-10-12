import { describe, expect, it } from 'vitest';
import { getPublishedPlaces } from '@/lib/places/registry';
import { getPlacePageText } from '@/lib/places/text';
import { ogPlaceText } from '@/lib/seo/og-image';
import { OG_ETIKETT_MAX, ogEtikett } from '@/lib/seo/og-render';

/** Review Phase 2, Punkt 24: Das Etikett des Teilen-Bilds einer Ortsseite steht in einer Zeile. */
describe('Teilen-Bild der Ortsseiten: Etikett in einer Zeile', () => {
  it('kurze Etiketten bleiben, sonst erst ohne „Landkreis“, dann nur Postleitzahl und Ort', () => {
    expect(ogEtikett('35745 HERBORN · LAHN-DILL-KREIS')).toBe('35745 HERBORN · LAHN-DILL-KREIS');
    expect(ogEtikett('35799 MERENBERG · LANDKREIS LIMBURG-WEILBURG')).toBe('35799 MERENBERG · LIMBURG-WEILBURG');
    expect(ogEtikett('35080 BAD ENDBACH · LANDKREIS MARBURG-BIEDENKOPF')).toBe('35080 BAD ENDBACH');
    expect(ogEtikett('35581 WETZLAR-MÜNCHHOLZHAUSEN · STADTTEIL')).toBe('35581 WETZLAR-MÜNCHHOLZHAUSEN');
  });

  it.each(getPublishedPlaces().map((place) => [place.id, place] as const))('%s: höchstens OG_ETIKETT_MAX Zeichen, beginnt mit der Postleitzahl', (_id, place) => {
    const page = getPlacePageText(place);
    const { etikett } = ogPlaceText({ etikett: page.etikett, h1: page.meta.h1, distanceKm: place.commute.distanceKm, minutes: place.commute.minutes });
    const kurz = ogEtikett(etikett);
    expect(kurz.length).toBeLessThanOrEqual(OG_ETIKETT_MAX);
    expect(kurz.startsWith(place.postalCode)).toBe(true);
  });
});
