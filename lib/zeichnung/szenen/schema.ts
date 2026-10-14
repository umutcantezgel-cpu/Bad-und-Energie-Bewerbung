/**
 * Gemeinsame Bausteine der Fließschemata (Anlagenschema, Kältekreis): Symbole mit Lage und Leitungen in
 * Fließrichtung. Ein Schema ist kein Maßstab (Schriftfeld: „Fließschema · Symbole nach DIN EN ISO 10628-2“);
 * Symbole sind gleich groß (Vergrößerung `massstab`), Leitungen biegen mit Radius.
 */
import { anschlussPunkt, type Lage, type SymbolId } from '../symbole';
import { fliesspfeil, leitungsStrecken, leitungsweg, r1, type Medium, type Punkt, type Strecke } from '../norm';

export interface SchemaSymbol {
  /** Kennung im Schema (für Legende und Prüfung). */
  key: string;
  id: SymbolId;
  lage: Lage;
  /** Beschriftung neben dem Symbol (Versalien), nur auf breiten Flächen sichtbar. */
  text?: { wert: string; x: number; y: number; anker: 'start' | 'middle' | 'end' };
}

export interface SchemaLeitung {
  key: string;
  medium: Medium;
  punkte: readonly Punkt[];
  d: string;
  /** Etikett am Weg (Kältemittel: Heißgas, flüssig, Nassdampf, Sauggas). */
  etikett?: { wert: string; x: number; y: number; anker: 'start' | 'middle' | 'end' };
}

export interface SchemaPfeil {
  medium: Medium;
  d: string;
  /** Spitze des Pfeils: Um sie wächst er je Breite der Fläche (technik.module.css, --pfeil). */
  spitze: Punkt;
}

export const SCHEMA_BOGEN = 12;

export function symbol(key: string, id: SymbolId, lage: Lage, text?: SchemaSymbol['text']): SchemaSymbol {
  return text ? { key, id, lage, text } : { key, id, lage };
}

export function leitung(key: string, medium: Medium, punkte: Punkt[], etikett?: SchemaLeitung['etikett']): SchemaLeitung {
  const out: SchemaLeitung = { key, medium, punkte, d: leitungsweg(punkte, SCHEMA_BOGEN) };
  return etikett ? { ...out, etikett } : out;
}

/**
 * Fließpfeil der Schemata in Grundgröße (13 lang, 12 breit, Einheiten). Gezeichnet wächst er je Breite der Fläche um
 * seine Spitze (Faktor --pfeil in technik.module.css), damit er im Standbild auch am Handy mindestens 10 px lang und
 * 9 px breit ist, das Dreifache der Leitung (Prüfung E-029, Runde 2, Befund 6).
 */
export const PFEIL_GRUNDMASS = Object.freeze({ laenge: 13, breite: 12 });

export function pfeil(medium: Medium, spitze: Punkt, nach: Punkt): SchemaPfeil {
  return { medium, d: fliesspfeil(spitze, nach, PFEIL_GRUNDMASS.laenge, PFEIL_GRUNDMASS.breite), spitze };
}

/**
 * Strichmuster der Dauerbewegung (Register `wasser-fliesst`, `kaeltemittel-fliesst`) in Einheiten der Zeichnung,
 * abgeleitet aus ihrer Breite: bei rund 350 px Darstellungsbreite (Handy) ein Strich von 4 px Länge alle 16 px wie
 * vor der Prüfung E-029. `rand` ist die halbe Höhe des Ausschnitts je Stück (rund 2 px), Platz für den 1-px-Strich.
 */
export function flussMuster(breite: number): { periode: number; strich: number; rand: number } {
  const periode = r1((breite * 16) / 350);
  return { periode, strich: r1(periode / 4), rand: r1(breite / 175) };
}

/** Die geraden Stücke einer Leitung, über die das Strichmuster wandert (Bögen ohne Muster). */
export function flussStrecken(l: SchemaLeitung): Strecke[] {
  return leitungsStrecken(l.punkte, SCHEMA_BOGEN);
}

/**
 * Striche eines geraden Stücks in seinen eigenen Koordinaten (x in Fließrichtung ab dem Anfang des Stücks, y = 0 auf
 * der Leitung). Die Striche beginnen eine Periode vor dem Anfang und reichen bis zum Ende: Um eine Periode
 * verschoben, deckt das Muster das Stück immer ganz, und Anfang und Ende der Bewegung sehen gleich aus. Die Lage im
 * Muster richtet sich nach der Weglänge (`anfang`), so laufen die Striche über die Ecken im Takt weiter.
 */
export function flussStriche(s: Strecke, muster: { periode: number; strich: number }): string {
  const { periode, strich } = muster;
  const versatz = s.anfang % periode;
  let d = '';
  for (let x = -versatz - periode; x < s.laenge; x += periode) d += `M${r1(x)} 0h${strich}`;
  return d;
}

/** Anschluss eines Symbols aus der Liste (wirft, wenn es fehlt). */
export function an(symbole: readonly SchemaSymbol[], key: string, anschluss: string): Punkt {
  const s = symbole.find((x) => x.key === key);
  if (!s) throw new Error(`schema: Symbol ${key} fehlt`);
  return anschlussPunkt(s.id, anschluss, s.lage);
}
