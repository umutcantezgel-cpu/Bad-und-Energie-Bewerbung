/**
 * Gerätedaten als Maße mit Herkunft (KERN K-010): Jeder Wert nennt seine Fundstelle in der Herstelleranleitung.
 * Was die Anleitung nicht bemaßt, ist `geschaetzt` und begründet; die Abnahme durch den Meister (M-037) sieht beides.
 * Übernommen werden nur Zahlen, nie Grafiken (lib/zeichnung/marke.ts).
 */
import { GESCHAETZT } from '../norm';

export interface Quelle {
  titel: string;
  /** Dokumentnummer der Anleitung. */
  dokument: string;
  /** Ausgabe (Jahr/Monat). */
  ausgabe: string;
  /**
   * Gegenprobe an einer zweiten Ausgabe derselben Anleitung (andere Sprache), gelesen am `geprueft`-Datum. Die
   * Fundstellen der Werte nennen dann beide Ausgaben.
   */
  gegenprobe?: { titel: string; dokument: string; ausgabe: string; sprache: string; geprueft: string };
}

export interface Mass {
  mm: number;
  /** Fundstelle (Bild, Tabelle, Seite); bei Schätzwerten der Grund. */
  stelle: string;
  /** Nur bei Werten ohne Bemaßung in der Anleitung. */
  geschaetzt?: typeof GESCHAETZT;
  /** Abweichungen und Lesarten. */
  hinweis?: string;
}

/** Wert aus der Anleitung. */
export const mass = (mm: number, stelle: string, hinweis?: string): Mass => (hinweis ? { mm, stelle, hinweis } : { mm, stelle });

/** Geschätzter Wert: in der Anleitung nicht bemaßt, aus den belegten Maßen abgeleitet oder gewählt. */
export const schaetzung = (mm: number, grund: string): Mass => ({ mm, stelle: grund, geschaetzt: GESCHAETZT });

export interface Aussengeraet {
  id: string;
  name: string;
  modelle: readonly string[];
  quelle: Quelle;
  /** Außenmaße des Gehäuses (B × H × T). */
  breite: Mass;
  hoehe: Mass;
  tiefe: Mass;
  tiefeMitKonsolen: Mass;
  oberkante: { radius: Mass };
  konsolen: {
    anzahl: number;
    /** Achsabstand der Bodenhalterungen in der Breite. */
    abstand: Mass;
    /** Abstand der linken Bodenhalterung vom linken Rand (Ansicht von vorn). */
    randabstand: Mass;
    /** Überstand der Bodenhalterungen vorn und hinten über das Gehäuse. */
    ueberstand: Mass;
    breite: Mass;
    hoehe: Mass;
  };
  hydraulik: {
    /** Lage der Anschlüsse in Worten. */
    lage: string;
    /** Höhe über Unterkante Gehäuse. */
    hoehe: Mass;
    /** Abstand des ersten Anschlusses vom Rand (Ansicht von hinten links). */
    abstandRand: Mass;
    /** Abstand zwischen den beiden Anschlüssen. */
    abstandZwischen: Mass;
    durchmesser: Mass;
    /** Überstand der Anschlussstutzen hinten. */
    laenge: Mass;
  };
  kondensat: {
    /** Ablauf an der Unterseite: Abstand von rechts (Ansicht von vorn) und von vorn. */
    vonRechts: Mass;
    vonVorn: Mass;
    durchmesser: Mass;
    laenge: Mass;
  };
  verdampfer: { lage: string; tiefe: Mass; rand: Mass };
  /** Runde Ausblasöffnung in der Front (Mitte von links und von oben). */
  ausblas: { mitteX: Mass; mitteY: Mass; durchmesser: Mass };
  /** Allgemeiner Axialrotor hinter dem Schutzgitter (neutrale Fassung, nicht die Form des Herstellers). */
  rotor: { durchmesser: Mass; nabe: Mass; blaetter: number };
  kaeltemittel: { name: string; fuellmengeKg: number; stelle: string };
  gewichtKg: { wert: number; stelle: string };
}

/** Alle Maße eines Geräts als Liste (für Prüfungen: jedes mit Fundstelle, Schätzwerte markiert). */
export function alleMasse(geraet: Aussengeraet): Array<[string, Mass]> {
  const out: Array<[string, Mass]> = [];
  const gehen = (wert: unknown, pfad: string) => {
    if (wert && typeof wert === 'object' && 'mm' in wert && 'stelle' in wert) out.push([pfad, wert as Mass]);
    else if (wert && typeof wert === 'object') for (const [k, v] of Object.entries(wert)) gehen(v, pfad ? `${pfad}.${k}` : k);
  };
  gehen(geraet, '');
  return out;
}
