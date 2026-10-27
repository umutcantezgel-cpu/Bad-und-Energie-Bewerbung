/**
 * Design „Schlicht“ der Bewerbungsmappe in Papiermaßen (mm, pt), wie das Blatt der Vorschau: die Variablen --blatt-*
 * und die Farben von .paper in components/mappe/mappe.module.css (lib/mappe/__tests__/blatt.test.ts hält beide gleich).
 * Abstände der Vorschau sind Tailwind-Stufen auf dem 210-mm-Blatt bei 96 dpi: 1 Stufe = 4 px = 25,4 / 24 mm.
 * Client-sicher und ohne Abhängigkeiten; die PDF (lib/mappe/pdf) liest nur von hier.
 */
import type { Fotoform } from './design';

const STUFE_MM = 25.4 / 24;
const stufe = (n: number) => Math.round(n * STUFE_MM * 100) / 100;

export const SCHLICHT = Object.freeze({
  /** Satzspiegel nach DIN 5008, links breiter für die Lochung (mm). */
  rand: Object.freeze({ oben: 20, rechts: 20, unten: 18, links: 25 }),
  /** Lebenslauf: Spalte Zeitraum und Abstand zur Spalte Angaben (mm). */
  spalteZeit: 38,
  spalteAbstand: 6,
  /** Designs (L3): Farbband mit Abstand zum Papierrand (Drucker ohne Randlosdruck), Seitenspalte von „Zweispaltig“ (mm). */
  bandRand: 10,
  seitenspalte: 52,
  /** Foto rechts im Kopf des Lebenslaufs (mm, wie .photo): Passbild 35 × 45, Ecken 1,5; Abstand zum Text gap-8. */
  foto: Object.freeze({ breite: 35, hoehe: 45, radius: 1.5, abstand: stufe(8) }),
  /** Schriftstufen (pt) und Zeilenhöhen (Faktor): Name · Betreff groß · Überschrift · Text · klein. */
  schrift: Object.freeze({ name: 22, gross: 12, kopf: 11, text: 10.5, klein: 9 }),
  zeile: Object.freeze({ name: 1.15, kopf: 1.35, text: 1.5, klein: 1.45 }),
  /** Helle Rollen aus KERN K-006, fest auf dem Blatt (wie .paper). */
  farbe: Object.freeze({
    papier: '#FFFFFF',
    tinte: '#111A3B',
    tinteLeise: '#454C78',
    marke: '#111D6D',
    linie: '#DDD3C2',
    linieStark: '#6B74A6',
  }),
  /** Abstände der Vorschau in mm (pb-5, mt-10, mt-8, mt-6, mt-8, gap-4, pb-1.5, mt-1.5, pl-5, pt-16, min-w-48). */
  abstand: Object.freeze({
    kopfUnten: stufe(5),
    empfaengerOben: stufe(10),
    datumOben: stufe(8),
    betreffOben: stufe(6),
    briefOben: stufe(6),
    abschnittOben: stufe(8),
    abschnittInnen: stufe(4),
    ueberschriftUnten: stufe(1.5),
    aufgabenOben: stufe(1.5),
    einzug: stufe(5),
    fussOben: stufe(16),
    unterschriftBreite: stufe(48),
  }),
  /** Linien: Haarlinie unter Kopf und Überschriften, Unterschriftslinie (pt). */
  strich: Object.freeze({ fein: 0.75 }),
});

/**
 * Maße des Fotos auf dem Blatt je Form (mm), wie .photo in components/mappe/mappe.module.css: Passbild 35 × 45 mm,
 * „rund“ quadratisch 35 × 35 mit vollem Radius, „abgerundet“ 1,5 mm, „eckig“ ohne Radius. Nur die PDF des Bewerbers
 * (lib/mappe/pdf/satz.tsx, Browser) setzt ein Foto; die Team-PDF hat keins.
 */
export function fotoMasse(form: Fotoform): { breite: number; hoehe: number; radius: number } {
  const { breite, hoehe, radius } = SCHLICHT.foto;
  if (form === 'rund') return { breite, hoehe: breite, radius: breite / 2 };
  return { breite, hoehe, radius: form === 'eckig' ? 0 : radius };
}

/** Pixel des Fotos in der PDF: die Maße bei 300 dpi (35 × 45 mm → 413 × 531, rund 413 × 413). */
export function fotoPixel(form: Fotoform): { breite: number; hoehe: number } {
  const px = (mm: number) => Math.round((mm / 25.4) * 300);
  const { breite, hoehe } = fotoMasse(form);
  return { breite: px(breite), hoehe: px(hoehe) };
}
