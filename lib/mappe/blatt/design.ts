import { MAPPE_DESIGN } from '@/lib/applications/constants';

/**
 * Gestaltung der Bewerbungsmappe (Schritt L3): Design, Akzentfarbe und Schriftstil, dazu die Fotoform. Eine Quelle für
 * die Vorschau (components/mappe/MappePreview.tsx) und die PDF (lib/mappe/pdf/blatt.tsx). Design, Farbe und Schrift
 * reisen mit der Mappe (`mappe.design`), die Team-PDF folgt ihnen; die Fotoform bleibt im Browser wie das Foto.
 *
 * Farben (KERN K-006, Notiz in der KERN-Datei): Die sechs Akzente gibt es nur auf dem Blatt und in der Farbwahl, nie
 * in der Oberfläche. Jeder hat mindestens 4,5 : 1 auf Weiß und auf seiner Tönung (scripts/qa/check-contrast.mjs) und
 * bleibt im Graustufendruck dunkel genug für Überschriften; kein Rot (Rot ist auf der Seite der Bewerben-Knopf).
 * Client-sicher.
 */

/** Werte aus dem Vertrag (lib/applications/constants.ts, `mappe.design`). */
export const VORLAGEN = MAPPE_DESIGN.vorlagen;
export type Vorlage = (typeof VORLAGEN)[number];

export const AKZENTE = MAPPE_DESIGN.akzente;
export type Akzent = (typeof AKZENTE)[number];

export const SCHRIFTSTILE = MAPPE_DESIGN.schriften;
export type Schriftstil = (typeof SCHRIFTSTILE)[number];

export const FOTOFORMEN = ['eckig', 'abgerundet', 'rund'] as const;
export type Fotoform = (typeof FOTOFORMEN)[number];

/** Was mit der Mappe gesendet wird (Vertrag `mappe.design`). */
export interface MappeDesign {
  vorlage: Vorlage;
  akzent: Akzent;
  schrift: Schriftstil;
}

export const STANDARD_DESIGN: MappeDesign = Object.freeze({ vorlage: 'schlicht', akzent: 'navy', schrift: 'sachlich' });
/** Wie das Blatt vor L3: Foto mit leicht abgerundeten Ecken. */
export const STANDARD_FOTOFORM: Fotoform = 'abgerundet';

export const VORLAGE_TEXTE: Readonly<Record<Vorlage, { name: string; beschreibung: string }>> = Object.freeze({
  schlicht: { name: 'Schlicht', beschreibung: 'Klar wie ein Brief: Name oben, feine Linien.' },
  farbband: { name: 'Farbband', beschreibung: 'Dein Name auf einem Band in deiner Farbe.' },
  zweispaltig: { name: 'Zweispaltig', beschreibung: 'Lebenslauf mit Seitenspalte, sobald du Schwerpunkte gewählt hast.' },
});

/** Akzent (Name, Linien, Überschriften, Band) und seine Tönung (Seitenspalte), je als Hex für Vorschau und PDF. */
export const AKZENT_FARBEN: Readonly<Record<Akzent, { name: string; farbe: string; toenung: string }>> = Object.freeze({
  navy: { name: 'Navy', farbe: '#111D6D', toenung: '#ECEDF3' },
  koenigsblau: { name: 'Königsblau', farbe: '#1D4ED8', toenung: '#EDF1FC' },
  petrol: { name: 'Petrol', farbe: '#0F5C6E', toenung: '#ECF2F3' },
  tannengruen: { name: 'Tannengrün', farbe: '#1E5B3A', toenung: '#EDF2EF' },
  kupfer: { name: 'Kupfer', farbe: '#9A4A1C', toenung: '#F7F1ED' },
  graphit: { name: 'Graphit', farbe: '#3B4252', toenung: '#EFF0F1' },
});

export const SCHRIFT_TEXTE: Readonly<Record<Schriftstil, { name: string; beschreibung: string }>> = Object.freeze({
  sachlich: { name: 'Sachlich', beschreibung: 'Eine ruhige Schrift für alles.' },
  markant: { name: 'Markant', beschreibung: 'Name und Überschriften kräftiger.' },
});

export const FOTOFORM_TEXTE: Readonly<Record<Fotoform, string>> = Object.freeze({
  eckig: 'Eckig',
  abgerundet: 'Abgerundet',
  rund: 'Rund',
});

const istEiner = <T extends string>(liste: readonly T[], wert: unknown): wert is T => (liste as readonly unknown[]).includes(wert);

/** Gesendetes oder gespeichertes Design → gültiges Design; Unbekanntes fällt einzeln auf den Standard zurück. */
export function designAus(wert: unknown): MappeDesign {
  const roh = typeof wert === 'object' && wert !== null && !Array.isArray(wert) ? (wert as Record<string, unknown>) : {};
  return {
    vorlage: istEiner(VORLAGEN, roh.vorlage) ? roh.vorlage : STANDARD_DESIGN.vorlage,
    akzent: istEiner(AKZENTE, roh.akzent) ? roh.akzent : STANDARD_DESIGN.akzent,
    schrift: istEiner(SCHRIFTSTILE, roh.schrift) ? roh.schrift : STANDARD_DESIGN.schrift,
  };
}

export function fotoformAus(wert: unknown): Fotoform {
  return istEiner(FOTOFORMEN, wert) ? wert : STANDARD_FOTOFORM;
}

export function istStandard(design: MappeDesign): boolean {
  return design.vorlage === STANDARD_DESIGN.vorlage && design.akzent === STANDARD_DESIGN.akzent && design.schrift === STANDARD_DESIGN.schrift;
}
