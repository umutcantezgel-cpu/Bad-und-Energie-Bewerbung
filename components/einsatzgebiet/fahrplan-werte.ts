import type { OepnvVerbindung } from '@/lib/places/oepnv';
import { fahrzeugName, formatMin, formatUhrzeit } from '@/lib/places/text';

/**
 * Kennwerte der spätesten Verbindung (Fahrplan.tsx): Losgehen, Ankunft, Tür zu Tür und Umstiege als Maße, darunter die
 * Fahrzeuge der Reihe nach. Bewusst ohne die Haltestellen der Umstiege: Ab dem ersten Umstieg fahren viele Orte einer
 * Richtung mit denselben Zügen und Bussen; die ganze Liste stünde auf all ihren Seiten gleich (Gate I4,
 * scripts/qa/check-local-similarity.mjs). Die erste Haltestelle nennt der Satz daneben (lib/places/text.ts).
 */

export interface FahrplanWert {
  /** Wert in Martian Mono: „6:08“, „56 min“, „2“. */
  wert: string;
  /** Name in Versalien (text-etikett). */
  name: string;
}

export function fahrplanWerte(v: OepnvVerbindung): FahrplanWert[] {
  return [
    { wert: formatUhrzeit(v.losgehen), name: 'Losgehen' },
    { wert: formatUhrzeit(v.ankunft), name: 'Ankunft' },
    { wert: formatMin(v.reisezeitMin), name: 'Tür zu Tür' },
    { wert: String(v.umstiege), name: v.umstiege === 1 ? 'Umstieg' : 'Umstiege' },
  ];
}

/** Fahrzeuge der Reihe nach, das erste mit seiner Haltestelle: „Bus 530 ab Sinn Firma Haas + Sohn · Zug RE99 · Bus 10“. */
export function fahrplanLinien(v: OepnvVerbindung): string {
  return v.teilstrecken.map((teil, i) => (i === 0 ? `${fahrzeugName(teil)} ab ${teil.ab}` : fahrzeugName(teil))).join(' · ');
}
