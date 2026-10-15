/**
 * Heizkreisverteiler in der Vorderansicht (Signatur des Themen-Hubs /arbeiten-bei-uns, E-031, KERN 1.3 K-003.2),
 * maßstäblich mit 1 Einheit = 1 mm (MASSSTAB.geraet). Ein allgemeiner Verteiler für Flächenheizung, kein bestimmtes
 * Modell: Welches Fabrikat der Betrieb verbaut, ist nicht belegt; alle Maße sind darum `geschaetzt` und begründet.
 *
 * Aufbau wie am Bau:
 * - oben der Vorlaufbalken, je Kreis ein Durchflussmesser (Schwebekörper, Symbol `durchflussmesser`) auf einer
 *   Sechskantmutter, darunter der Abgang mit Eurokonus-Mutter und dem Anfang der Kreisleitung (Vorlauf, nach unten);
 * - unten der Rücklaufbalken, je Kreis ein Ventilkopf (Ventileinsatz für einen Stellantrieb) auf der Vorderseite und
 *   der Abgang, in den die Kreisleitung zurückkommt (Rücklauf, nach oben in den Balken);
 * - links die Zuleitungen vom Wärmeerzeuger mit Überwurfmuttern, Vorlauf hinein, Rücklauf hinaus (Fließpfeile);
 * - rechts je Balken ein Endstück mit Entlüfter oben und KFE-Hahn (Kessel-Füll- und Entleerhahn) mit Schlauchtülle.
 *
 * Die Zahl der Kreise kommt vom Aufrufer (ein Kreis je Thema aus getThemen(), components/themen/Verteiler.tsx). Jeder
 * Leitungspfad ist in Fließrichtung gezeichnet (K-003.2). Geprüft in lib/zeichnung/__tests__/verteiler.test.ts.
 */
import { schaetzung, type Mass } from '../geraete/typen';
import { fliesspfeil, r1 } from '../norm';
import type { Lage } from '../symbole';

const GRUND = 'Heizkreisverteiler für Flächenheizung, kein bestimmtes Modell (nicht belegt)';

export const VERTEILER_MM = Object.freeze({
  /** Abstand der Abgänge (Kreise) auf dem Balken. */
  kreisAbstand: schaetzung(50, `${GRUND}: üblicher Abgangsabstand`),
  /** Achsabstand Vorlauf- zu Rücklaufbalken. */
  balkenAbstand: schaetzung(200, `${GRUND}: üblicher Achsabstand der Balken`),
  /** Höhe (Außenmaß) eines Balkens, 1 Zoll. */
  balken: schaetzung(34, `${GRUND}: Balken 1 Zoll`),
  /** Balkenende bis zur Mitte des ersten bzw. letzten Abgangs. */
  rand: schaetzung(45, GRUND),
  /** Sechskant der Abgänge (Eurokonus) und unter dem Durchflussmesser: Breite und Höhe in der Ansicht. */
  mutterBreite: schaetzung(24, `${GRUND}: Anschluss G 3/4 mit Eurokonus`),
  mutterHoehe: schaetzung(12, GRUND),
  /** Sichtbares Stück jeder Kreisleitung unter dem Abgang. */
  stutzen: schaetzung(30, 'Anfang der Kreisleitung, danach abgeschnitten (Darstellung)'),
  /** Messrohr des Durchflussmessers (Länge) und seine Kappe. */
  messrohr: schaetzung(56, `${GRUND}: Durchflussmesser mit Schwebekörper`),
  kappe: schaetzung(10, GRUND),
  /** Ventilkopf auf dem Rücklaufbalken (Anschluss für Stellantriebe M30 × 1,5). */
  ventilkopf: schaetzung(30, `${GRUND}: Ventileinsatz mit Anschluss M30 × 1,5`),
  /** Endstück am rechten Balkenende (Breite), Entlüfter und KFE-Hahn daran. */
  endstueck: schaetzung(24, GRUND),
  /** Sichtbare Zuleitung vom Wärmeerzeuger links. */
  zuleitung: schaetzung(56, 'Anfang der Zuleitung, davor abgeschnitten (Darstellung)'),
} satisfies Record<string, Mass>);

export interface Rechteck {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
}

export interface Kreis {
  /** Mitte des Abgangs. */
  x: number;
  /** Durchflussmesser: Lage des Symbols (senkrecht, von unten durchströmt), Mutter darunter, Kappe darüber. */
  messer: Lage;
  messerMutter: Rechteck;
  messerKappe: Rechteck;
  /** Abgänge (Eurokonus-Muttern) unter dem Vorlauf- bzw. Rücklaufbalken. */
  vorlaufMutter: Rechteck;
  ruecklaufMutter: Rechteck;
  /** Sichtbare Flächen der Sechskante (feine Linien), für alle drei Muttern. */
  kanten: string;
  /** Kreisleitungen in Fließrichtung: Vorlauf aus dem Balken nach unten, Rücklauf von unten in den Balken. */
  vorlauf: string;
  ruecklauf: string;
  /** Ventilkopf auf der Vorderseite des Rücklaufbalkens: Gehäuse und Stift. */
  ventilkopf: { cx: number; cy: number; r: number; stift: number };
}

export interface Endstueck {
  koerper: Rechteck;
  /** Entlüfter oben: Schaft und Kappe. */
  entluefter: readonly Rechteck[];
  /** KFE-Hahn rechts: Gehäuse und Vierkant, Schlauchtülle als Pfad, Rillen fein. */
  kfe: readonly Rechteck[];
  tuelle: string;
  rillen: string;
}

export interface VerteilerZeichnung {
  viewBox: { x: number; y: number; breite: number; hoehe: number };
  balken: { vorlauf: Rechteck; ruecklauf: Rechteck };
  kreise: readonly Kreis[];
  zuleitung: { vorlauf: string; ruecklauf: string; pfeilVorlauf: string; pfeilRuecklauf: string; muttern: readonly Rechteck[]; kanten: string };
  endstuecke: readonly Endstueck[];
  /** Lage jedes Kreises als Anteil der Breite (0…1), für die Kreisschilder in HTML unter der Zeichnung. */
  schilder: readonly number[];
}

const M = VERTEILER_MM;
const HALB = M.balken.mm / 2;
const VOR = 0;
const RUECK = M.balkenAbstand.mm;
const RAND = 4;

const rechteck = (x0: number, y0: number, x1: number, y1: number, rx?: number): Rechteck => ({
  x: r1(x0),
  y: r1(y0),
  width: r1(x1 - x0),
  height: r1(y1 - y0),
  ...(rx !== undefined ? { rx } : {}),
});

/** Sechskant in der Ansicht über Eck: zwei senkrechte Kanten teilen die Breite in drei Flächen (Mitte halb so breit). */
const sechskant = (r: Rechteck) => {
  const viertel = r.width / 4;
  const mitte = r.x + r.width / 2;
  return `M${r1(mitte - viertel)} ${r.y}V${r1(r.y + r.height)}M${r1(mitte + viertel)} ${r.y}V${r1(r.y + r.height)}`;
};

/** Sechskant liegend (an der Zuleitung): zwei waagerechte Kanten. */
const sechskantLiegend = (r: Rechteck) => {
  const viertel = r.height / 4;
  const mitte = r.y + r.height / 2;
  return `M${r.x} ${r1(mitte - viertel)}H${r1(r.x + r.width)}M${r.x} ${r1(mitte + viertel)}H${r1(r.x + r.width)}`;
};

/** Ein Endstück am rechten Ende des Balkens mit der Achse `y`, Balkenende bei `x`. */
function endstueck(x: number, y: number): Endstueck {
  const b = M.endstueck.mm;
  const koerper = rechteck(x, y - 15, x + b, y + 15, 2);
  // Entlüfter: Schaft 8 breit, 8 hoch; Kappe 14 × 10
  const schaft = rechteck(x + b / 2 - 4, y - 23, x + b / 2 + 4, y - 15);
  const kappe = rechteck(x + b / 2 - 7, y - 33, x + b / 2 + 7, y - 23, 2);
  // KFE-Hahn: Gehäuse 14 × 14 rechts am Endstück, Vierkant oben, Schlauchtülle 16 lang (Ø 10 → 7)
  const gehaeuse = rechteck(x + b, y - 7, x + b + 14, y + 7, 2);
  const vierkant = rechteck(x + b + 4, y - 12, x + b + 10, y - 7);
  const t0 = x + b + 14;
  return {
    koerper,
    entluefter: [schaft, kappe],
    kfe: [gehaeuse, vierkant],
    tuelle: `M${t0} ${y - 5}L${t0 + 16} ${r1(y - 3.5)}V${r1(y + 3.5)}L${t0} ${y + 5}Z`,
    rillen: `M${t0 + 5} ${r1(y - 4.5)}V${r1(y + 4.5)}M${t0 + 10} ${y - 4}V${y + 4}`,
  };
}

/**
 * Zeichnung für `anzahl` Kreise (mindestens einer). Alle Werte auf eine Nachkommastelle; der Rahmen umfasst die
 * Zeichnung mit RAND Einheiten Luft (Strichbreite).
 */
export function verteiler(anzahl: number): VerteilerZeichnung {
  if (!Number.isInteger(anzahl) || anzahl < 1) throw new Error(`verteiler: ${anzahl} Kreise`);
  const k = M.kreisAbstand.mm;
  const laenge = 2 * M.rand.mm + (anzahl - 1) * k;
  const mb = M.mutterBreite.mm / 2;
  const mh = M.mutterHoehe.mm;
  const messerMitte = VOR - HALB - mh - M.messrohr.mm / 2;
  const messerOben = VOR - HALB - mh - M.messrohr.mm;

  const kreise: Kreis[] = Array.from({ length: anzahl }, (_, i) => {
    const x = M.rand.mm + i * k;
    const messerMutter = rechteck(x - mb, VOR - HALB - mh, x + mb, VOR - HALB);
    const vorlaufMutter = rechteck(x - mb, VOR + HALB, x + mb, VOR + HALB + mh);
    const ruecklaufMutter = rechteck(x - mb, RUECK + HALB, x + mb, RUECK + HALB + mh);
    return {
      x,
      // Symbol durchflussmesser: 28 lang, Eintritt links; um −90° gedreht steht der Eintritt unten auf der Mutter
      messer: { x, y: messerMitte, drehung: -90, massstab: M.messrohr.mm / 28 },
      messerMutter,
      messerKappe: rechteck(x - 13, messerOben - M.kappe.mm, x + 13, messerOben, 3),
      vorlaufMutter,
      ruecklaufMutter,
      kanten: [messerMutter, vorlaufMutter, ruecklaufMutter].map(sechskant).join(''),
      vorlauf: `M${x} ${VOR + HALB + mh}V${VOR + HALB + mh + M.stutzen.mm}`,
      ruecklauf: `M${x} ${RUECK + HALB + mh + M.stutzen.mm}V${RUECK + HALB + mh}`,
      ventilkopf: { cx: x, cy: RUECK, r: M.ventilkopf.mm / 2, stift: 5 },
    };
  });

  // Zuleitungen links: Überwurfmutter am Balkenende (14 breit, 42 hoch), davor die Leitung
  const muttern = [rechteck(-14, VOR - 21, 0, VOR + 21), rechteck(-14, RUECK - 21, 0, RUECK + 21)];
  const anfang = -14 - M.zuleitung.mm;
  const zuleitung = {
    vorlauf: `M${anfang} ${VOR}H-14`,
    ruecklauf: `M-14 ${RUECK}H${anfang}`,
    pfeilVorlauf: fliesspfeil({ x: r1(anfang + M.zuleitung.mm / 2 + 7), y: VOR }, { x: 1, y: 0 }, 14, 10),
    pfeilRuecklauf: fliesspfeil({ x: r1(anfang + M.zuleitung.mm / 2 - 7), y: RUECK }, { x: -1, y: 0 }, 14, 10),
    muttern,
    kanten: muttern.map(sechskantLiegend).join(''),
  };

  const endstuecke = [endstueck(laenge, VOR), endstueck(laenge, RUECK)];

  // Rahmen: links die Zuleitung, rechts die Schlauchtülle, oben die Kappen, unten das Ende der Rücklaufstutzen
  const x0 = anfang - RAND;
  const x1 = laenge + M.endstueck.mm + 14 + 16 + RAND;
  const y0 = messerOben - M.kappe.mm - RAND;
  const y1 = RUECK + HALB + mh + M.stutzen.mm + RAND;
  const breite = r1(x1 - x0);

  return {
    viewBox: { x: r1(x0), y: r1(y0), breite, hoehe: r1(y1 - y0) },
    balken: {
      vorlauf: rechteck(0, VOR - HALB, laenge, VOR + HALB, 3),
      ruecklauf: rechteck(0, RUECK - HALB, laenge, RUECK + HALB, 3),
    },
    kreise,
    zuleitung,
    endstuecke,
    schilder: kreise.map((kreis) => Math.round(((kreis.x - x0) / breite) * 10000) / 10000),
  };
}
