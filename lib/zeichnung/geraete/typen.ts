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
  /**
   * Außenmaße wie in der Tabelle der Anleitung (B × H × T). Die Höhe zählt ab der Aufstellfläche, also mit den
   * Bodenhalterungen; das Gehäuse allein ist `hoehe − konsolen.hoehe` hoch (Bild 4 bemaßt ab der Unterkante der
   * Halterungen).
   */
  breite: Mass;
  hoehe: Mass;
  tiefe: Mass;
  tiefeMitKonsolen: Mass;
  /** Obere Längskanten links und rechts gerundet: von vorn und hinten runde Ecken, von der Seite eine Deckellinie. */
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
    /** Höhe von der Aufstellfläche bis zur Unterkante des Gehäuses. */
    hoehe: Mass;
  };
  hydraulik: {
    /** Lage der Anschlüsse in Worten. */
    lage: string;
    /** Höhe der Anschlussmitte über der Aufstellfläche (Unterkante der Bodenhalterungen). */
    hoehe: Mass;
    /** Abstand des ersten Anschlusses vom Rand (Ansicht von hinten links). */
    abstandRand: Mass;
    /** Abstand zwischen den beiden Anschlüssen. */
    abstandZwischen: Mass;
    durchmesser: Mass;
    /** Überstand der Anschlussstutzen hinten. */
    laenge: Mass;
    /**
     * Welcher Stutzen der Vorlauf (Heizwasser zur Inneneinheit) ist: `aussen` am Rand (`abstandRand`), `innen` den
     * Abstand weiter; der andere ist der Rücklauf. Mit Fundstelle.
     */
    vorlauf: { lage: 'aussen' | 'innen'; stelle: string };
  };
  kondensat: {
    /**
     * Ablauf an der Unterseite: Abstand vom linken Rand (Ansicht von vorn) und von der Rückseite. Bild 6 zeigt das
     * Gerät von unten mit der Front oben; links im Bild ist dort links von vorn, unten im Bild die Rückseite.
     */
    vonLinks: Mass;
    vonHinten: Mass;
    durchmesser: Mass;
    /** Überstand unter dem Gehäuse; höchstens so lang wie die Bodenhalterung hoch ist (der Stutzen steht nicht auf). */
    laenge: Mass;
    /**
     * Frostfreie Ableitung des Kondensats in ein Kiesbett (Fundamentplan der Anleitung): Rohr senkrecht unter dem
     * Ablauf, seine Tiefe bis zum Kiesbett und die Schotterschicht unter den Betonsockeln.
     */
    ableitung: { rohr: Mass; tiefe: Mass; schotter: Mass };
  };
  /**
   * Lamellenblock auf der Rückseite: Tiefe, Abstand zum Gehäuserand (oben und unten) und seine Lage in der Breite,
   * von vorn gesehen ab dem linken Rand (`vonLinks`, `breite`). Rechts davon (von vorn) liegt der Anschlussbereich mit
   * den hydraulischen Anschlüssen; der Verdampfer reicht nicht über die ganze Breite (Prüfung E-029, Runde 2).
   */
  verdampfer: { lage: string; tiefe: Mass; rand: Mass; vonLinks: Mass; breite: Mass };
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
