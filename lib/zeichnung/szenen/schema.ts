/**
 * Gemeinsame Bausteine der Fließschemata (Anlagenschema, Kältekreis): Symbole mit Lage und Leitungen in
 * Fließrichtung. Ein Schema ist kein Maßstab (Schriftfeld: „Fließschema · Symbole nach DIN EN ISO 10628-2“);
 * Symbole sind gleich groß (Vergrößerung `massstab`), Leitungen biegen mit Radius.
 */
import { anschlussPunkt, type Lage, type SymbolId } from '../symbole';
import { fliesspfeil, leitungsweg, type Medium, type Punkt } from '../norm';

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
}

export const SCHEMA_BOGEN = 12;

export function symbol(key: string, id: SymbolId, lage: Lage, text?: SchemaSymbol['text']): SchemaSymbol {
  return text ? { key, id, lage, text } : { key, id, lage };
}

export function leitung(key: string, medium: Medium, punkte: Punkt[], etikett?: SchemaLeitung['etikett']): SchemaLeitung {
  const out: SchemaLeitung = { key, medium, punkte, d: leitungsweg(punkte, SCHEMA_BOGEN) };
  return etikett ? { ...out, etikett } : out;
}

export function pfeil(medium: Medium, spitze: Punkt, nach: Punkt): SchemaPfeil {
  return { medium, d: fliesspfeil(spitze, nach, 16, 12) };
}

/** Anschluss eines Symbols aus der Liste (wirft, wenn es fehlt). */
export function an(symbole: readonly SchemaSymbol[], key: string, anschluss: string): Punkt {
  const s = symbole.find((x) => x.key === key);
  if (!s) throw new Error(`schema: Symbol ${key} fehlt`);
  return anschlussPunkt(s.id, anschluss, s.lage);
}
