import type { Fotoform } from '@/lib/mappe/blatt/design';
import { fotoPixel } from '@/lib/mappe/blatt/schlicht';

/**
 * Foto für die PDF des Bewerbers (L4, nur im Browser): react-pdf kennt nur JPEG und PNG, das Formular nimmt auch WebP.
 * Darum immer über ein Canvas: auf das Format des Blatts zugeschnitten (Mitte, wie object-fit: cover in der Vorschau),
 * bei 300 dpi (35 × 45 mm → 413 × 531 px, „rund“ 413 × 413), weißer Grund unter Transparenz, als JPEG-data:-URL.
 * Gelesen wird die Datei selbst (createImageBitmap), nicht die blob:-URL über fetch: So braucht die CSP kein
 * `connect-src blob:`. createImageBitmap richtet Handyfotos nach ihrer EXIF-Ausrichtung auf.
 */

const JPEG_QUALITAET = 0.88;

export async function fotoFuerPdf(datei: Blob, form: Fotoform): Promise<string> {
  const bild = await createImageBitmap(datei);
  try {
    const { breite, hoehe } = fotoPixel(form);
    const canvas = document.createElement('canvas');
    canvas.width = breite;
    canvas.height = hoehe;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas nicht verfügbar');
    const skala = Math.max(breite / bild.width, hoehe / bild.height);
    const w = breite / skala;
    const h = hoehe / skala;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, breite, hoehe);
    ctx.drawImage(bild, (bild.width - w) / 2, (bild.height - h) / 2, w, h, 0, 0, breite, hoehe);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITAET);
  } finally {
    bild.close();
  }
}
