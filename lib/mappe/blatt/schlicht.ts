/**
 * Design „Schlicht“ der Bewerbungsmappe in Papiermaßen (mm, pt), wie das Blatt der Vorschau: die Variablen --blatt-*
 * und die Farben von .paper in components/mappe/mappe.module.css (lib/mappe/__tests__/blatt.test.ts hält beide gleich).
 * Abstände der Vorschau sind Tailwind-Stufen auf dem 210-mm-Blatt bei 96 dpi: 1 Stufe = 4 px = 25,4 / 24 mm.
 * Client-sicher und ohne Abhängigkeiten; die PDF (lib/mappe/pdf) liest nur von hier.
 */

const STUFE_MM = 25.4 / 24;
const stufe = (n: number) => Math.round(n * STUFE_MM * 100) / 100;

export const SCHLICHT = Object.freeze({
  /** Satzspiegel nach DIN 5008, links breiter für die Lochung (mm). */
  rand: Object.freeze({ oben: 20, rechts: 20, unten: 18, links: 25 }),
  /** Lebenslauf: Spalte Zeitraum und Abstand zur Spalte Angaben (mm). */
  spalteZeit: 38,
  spalteAbstand: 6,
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
