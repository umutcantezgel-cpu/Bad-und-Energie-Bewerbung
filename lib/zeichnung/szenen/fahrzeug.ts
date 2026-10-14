/**
 * Servicefahrzeug in der Seitenansicht von rechts (Seite „Fahrzeug und Werkzeug“, KERN K-010, E-029), 1 Einheit = 10 mm
 * wie im Hausschnitt. Ein allgemeiner Kastenwagen mit Hochdach und mittlerem Radstand, kein bestimmtes Modell: Welches
 * Fahrzeug der Betrieb fährt, ist nicht belegt (FACTS.vehicle nennt nur „Servicefahrzeug mit Sortimo-Ausbau“). Darum
 * sind alle Maße `geschaetzt`, gewählt aus der üblichen Klasse (Länge rund 5,9 m, Höhe 2,6 m, Radstand 3,7 m) und
 * bewusst ohne Gestaltungsmerkmale eines Herstellers (kein Kühlergrill, keine Lichtsignatur, kein Logo).
 *
 * Ansicht von rechts: Front rechts, Heck links; die Schiebetür auf der rechten Seite steht offen und ist nach hinten
 * über die Seitenwand geschoben, in der Öffnung steht der Regalausbau. Auf dem Dach liegt nichts (E-029: Rohr nur, wo
 * Wasser fließt), keine Wärmefläche. Gezeichnet in components/themen/Servicefahrzeug.tsx, geprüft in
 * lib/zeichnung/__tests__/fahrzeug.test.ts.
 */
import { GESCHAETZT, MASSSTAB, r1 } from '../norm';
import { schaetzung, type Mass } from '../geraete/typen';

/** mm → Einheiten der Zeichnung. */
const e = (mm: number) => r1(mm / MASSSTAB.haus);

const GRUND = 'Allgemeiner Kastenwagen (Hochdach, mittlerer Radstand), Modell nicht belegt';

export const FAHRZEUG_MM = Object.freeze({
  laenge: schaetzung(5930, GRUND),
  hoehe: schaetzung(2600, GRUND),
  radstand: schaetzung(3665, GRUND),
  ueberhangVorn: schaetzung(1000, GRUND),
  raddurchmesser: schaetzung(710, `${GRUND}; Reifen 235/65 R16`),
  /** Unterkante der Seitenwand (Schweller) über der Fahrbahn. */
  schweller: schaetzung(400, GRUND),
  /** Laderaumboden über der Fahrbahn (Unterkante der Türöffnung). */
  ladeboden: schaetzung(570, GRUND),
  /** Lichte Breite und Höhe der Schiebetür. */
  schiebetuerBreite: schaetzung(1300, GRUND),
  schiebetuerHoehe: schaetzung(1810, GRUND),
  /** Gürtellinie (Unterkante der Seitenscheibe). */
  guertel: schaetzung(1270, GRUND),
} satisfies Record<string, Mass>);

export const FAHRZEUG_RAHMEN = Object.freeze({ breite: 640, hoehe: 300 });

/** Fahrbahn (Unterkante der Räder). */
const BODEN = 282;
const M = FAHRZEUG_MM;
const HECK = 22;
const FRONT = HECK + e(M.laenge.mm);
const ACHSE_VORN = FRONT - e(M.ueberhangVorn.mm);
const ACHSE_HINTEN = r1(ACHSE_VORN - e(M.radstand.mm));
const RAD = r1(e(M.raddurchmesser.mm) / 2);
const RAD_Y = r1(BODEN - RAD);
/** Radlauf: 60 mm Luft um das Rad. */
const RADLAUF = r1(RAD + 6);
const DACH = r1(BODEN - e(M.hoehe.mm));
const SCHWELLER = r1(BODEN - e(M.schweller.mm));
const LADEBODEN = r1(BODEN - e(M.ladeboden.mm));
const GUERTEL = r1(BODEN - e(M.guertel.mm));

/** Halbe Sehne des Radlaufs auf Höhe des Schwellers (der Radlauf schneidet die Unterkante). */
const sehne = r1(Math.sqrt(RADLAUF ** 2 - (RAD_Y - SCHWELLER) ** 2));

/** Front: Stoßfänger, Frontfläche, Motorhaube, Windschutzscheibe (geneigt), gerundete Dachkanten. */
const HAUBE = { vorn: { x: FRONT - 6, y: r1(BODEN - 106) }, hinten: { x: FRONT - 88, y: r1(BODEN - 124) } };
const SCHEIBE_OBEN = { x: FRONT - 168, y: r1(DACH + 12) };

/** Fahrertür bzw. Beifahrertür (rechts) und B-Säule; Schiebetür dahinter. */
const B_SAEULE = FRONT - 215;
const TUER_VORN = FRONT - 110;
const OEFFNUNG = { x0: r1(B_SAEULE - 5 - e(M.schiebetuerBreite.mm)), x1: B_SAEULE - 5, y0: r1(LADEBODEN - e(M.schiebetuerHoehe.mm)), y1: LADEBODEN };
/** Die offene Schiebetür liegt außen auf der Seitenwand, um ihre Breite nach hinten geschoben. */
const SCHIEBETUER = { x0: r1(OEFFNUNG.x0 - e(M.schiebetuerBreite.mm) - 2), x1: OEFFNUNG.x0 - 2, y0: OEFFNUNG.y0 - 2, y1: r1(LADEBODEN + 3) };

const M_ = (x: number, y: number) => `M${r1(x)} ${r1(y)}`;
const L_ = (x: number, y: number) => `L${r1(x)} ${r1(y)}`;
const rechteck = (x0: number, y0: number, x1: number, y1: number) => `${M_(x0, y0)}H${r1(x1)}V${r1(y1)}H${r1(x0)}Z`;
const bogen = (bis: number) => `A${RADLAUF} ${RADLAUF} 0 0 0 ${r1(bis)} ${SCHWELLER}`;

export const FAHRZEUG = Object.freeze({
  boden: BODEN,
  achsen: [ACHSE_HINTEN, ACHSE_VORN] as const,
  rad: { r: RAD, y: RAD_Y, felge: r1(RAD * 0.6), nabe: r1(RAD * 0.18) },
  /** Aufbau als ein geschlossener Umriss (Kontur), Radläufe ausgespart. */
  aufbau:
    `${M_(HECK, SCHWELLER - 8)}V${DACH + 10}Q${HECK} ${DACH} ${HECK + 10} ${DACH}H${SCHEIBE_OBEN.x - 14}` +
    `Q${SCHEIBE_OBEN.x - 2} ${DACH} ${SCHEIBE_OBEN.x} ${SCHEIBE_OBEN.y}${L_(HAUBE.hinten.x, HAUBE.hinten.y)}${L_(HAUBE.vorn.x, HAUBE.vorn.y)}` +
    `${L_(FRONT - 2, BODEN - 62)}V${SCHWELLER - 2}${L_(FRONT - 10, SCHWELLER)}H${r1(ACHSE_VORN + sehne)}${bogen(ACHSE_VORN - sehne)}` +
    `H${r1(ACHSE_HINTEN + sehne)}${bogen(ACHSE_HINTEN - sehne)}H${HECK + 8}Z`,
  /** Stoßfänger vorn und hinten (eigene Teile, stehen über den Aufbau hinaus). */
  stossfaenger: [rechteck(FRONT - 18, BODEN - 64, FRONT + 3, BODEN - 32), rechteck(HECK - 3, BODEN - 58, HECK + 16, BODEN - 32)],
  /** Scheinwerfer an der Frontkante, Rückleuchte senkrecht in der Heckkante (Seitenansicht). */
  leuchten: [
    `${M_(FRONT - 7, BODEN - 104)}${L_(FRONT - 30, BODEN - 108)}${L_(FRONT - 30, BODEN - 98)}${L_(FRONT - 5, BODEN - 92)}Z`,
    rechteck(HECK, BODEN - 132, HECK + 6, BODEN - 74),
  ],
  /** Tür vorn rechts mit Scheibe, Griff und Außenspiegel; B-Säule. */
  tuer: `${M_(TUER_VORN, SCHWELLER)}V${HAUBE.hinten.y - 6}${L_(SCHEIBE_OBEN.x + 12, DACH + 24)}H${B_SAEULE}V${SCHWELLER}`,
  scheibe: `${M_(TUER_VORN - 4, GUERTEL)}${L_(SCHEIBE_OBEN.x + 16, DACH + 30)}H${B_SAEULE + 8}V${GUERTEL}Z`,
  griff: `${M_(B_SAEULE + 16, GUERTEL + 14)}H${B_SAEULE + 32}`,
  spiegel: `${M_(TUER_VORN + 2, GUERTEL)}H${TUER_VORN + 18}V${GUERTEL - 22}H${TUER_VORN + 8}Z`,
  /** Türöffnung der Schiebetür (Fläche dahinter: Laderaum mit Regal). */
  oeffnung: OEFFNUNG,
  /** Offene Schiebetür (außen auf der Seitenwand) mit Griff; Führungsschiene in Gürtelhöhe dahinter. */
  schiebetuer: rechteck(SCHIEBETUER.x0, SCHIEBETUER.y0, SCHIEBETUER.x1, SCHIEBETUER.y1),
  schiebetuerGriff: `${M_(SCHIEBETUER.x1 - 20, GUERTEL + 6)}H${SCHIEBETUER.x1 - 6}`,
  schiene: `${M_(HECK + 6, GUERTEL)}H${SCHIEBETUER.x0}`,
  /** Regalausbau in der Öffnung: drei Böden, Koffer, Kleinteilekästen, unten der Werkzeugkoffer. */
  regal: (() => {
    const { x0, x1, y0, y1 } = OEFFNUNG;
    const h = y1 - y0;
    const boeden = [0.27, 0.52, 0.76].map((t) => r1(y0 + h * t));
    const innen = { x0: x0 + 6, x1: x1 - 6 };
    const breite = innen.x1 - innen.x0;
    const bx = (t: number) => r1(innen.x0 + breite * t);
    return {
      boeden: boeden.map((y) => `${M_(x0, y)}H${r1(x1)}`).join(''),
      /** Koffer: Rechtecke, die auf einem Boden stehen (Höhe in Einheiten). */
      koffer: [
        rechteck(bx(0.02), boeden[0] - 24, bx(0.42), boeden[0]),
        rechteck(bx(0.48), boeden[0] - 18, bx(0.98), boeden[0]),
        rechteck(bx(0.02), boeden[1] - 22, bx(0.5), boeden[1]),
        rechteck(bx(0.56), boeden[1] - 18, bx(0.98), boeden[1]),
        // Werkzeugkoffer auf dem Ladeboden
        rechteck(bx(0.04), y1 - 16, bx(0.62), y1),
      ],
      griffe: [`${M_(bx(0.16), boeden[1] - 22)}V${boeden[1] - 27}H${bx(0.36)}V${boeden[1] - 22}`, `${M_(bx(0.22), y1 - 16)}V${y1 - 20}H${bx(0.44)}V${y1 - 16}`].join(''),
      /** Kleinteilekästen: eine Reihe Fächer auf dem dritten Boden. */
      kaesten: `${rechteck(bx(0.02), boeden[2] - 20, bx(0.98), boeden[2])}${[0.26, 0.5, 0.74].map((t) => `${M_(bx(t), boeden[2] - 20)}V${boeden[2]}`).join('')}`,
      /** Lage der Etiketten (Mitte oben der Öffnung, Ladeboden), in Einheiten. */
      etiketten: { ausbau: { x: r1((x0 + x1) / 2), y: y0 }, koffer: { x: bx(0.33), y: y1 } },
    };
  })(),
  /** Fahrbahn. */
  fahrbahn: `M4 ${BODEN}H${FAHRZEUG_RAHMEN.breite - 4}`,
  front: FRONT,
  heck: HECK,
});

export { GESCHAETZT as FAHRZEUG_GESCHAETZT };
