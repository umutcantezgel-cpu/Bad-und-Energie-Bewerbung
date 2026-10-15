/**
 * Szene „Verwaltung und Ablage“ (E-031, Paket W3), von vorn und maßstäblich (1 Einheit = 3 mm): links das Regal mit
 * Ordnern für A4 (Rücken 80 mm, geschätzt), rechts zwei Ablagen (Sinnbilder ohne Maßstab). In die obere kommt die Post: ein Brief DIN lang
 * (220 × 110 nach DIN 678) mit Anschriftfenster; in die untere ein Blatt A4 für die Geschäftsführung. Ordner ohne
 * Beschriftung, Brief ohne Briefmarke: Formate, keine Marken.
 *
 * Ablauf beim Sichtbarwerden (Register `buero-ablauf`): zwei Ordner gleiten ins Regal, der Brief sinkt in die Ablage,
 * das Blatt wandert vom Regal in die Ablage der Geschäftsführung.
 */
import { BUERO_MASSE } from './masse';
import { kreis, rechteck, waagerecht, type BueroSzene, type Gruppe } from './szene';

const MM = 3;
const e = (mm: number) => mm / MM;
const O = BUERO_MASSE.ordner;
const L = BUERO_MASSE.dinLang;

export const ABLAGE_RAHMEN = Object.freeze({ breite: 400, hoehe: 300 });

/** Regal: Seiten und Böden 6 Einheiten (18 mm), zwei Fächer. */
export const REGAL = Object.freeze({ x: 14, breite: 184, oben: 20, mitte: 146, unten: 276, brett: 6 });
/** Ordner von vorn: Rücken 80 × 318 mm. */
export const ORDNER = Object.freeze({ breite: e(O.ruecken.mm), hoehe: e(O.hoehe.mm) });

/** Ordnerrücken: Umriss mit Rückenschild und Griffloch. */
function ordner(x: number, boden: number): { umriss: string; schild: string; loch: string } {
  const oben = boden - ORDNER.hoehe;
  const b = ORDNER.breite;
  return {
    umriss: rechteck(x, oben, b, ORDNER.hoehe),
    schild: rechteck(x + b * 0.2, oben + 10, b * 0.6, 32),
    loch: kreis(x + b / 2, oben + ORDNER.hoehe * 0.76, 4.5),
  };
}

const LINKS = REGAL.x + REGAL.brett + 2;
const stehend = (i: number) => LINKS + i * (ORDNER.breite + 0.5);

/** Oberes Fach: fünf Ordner stehen, der sechste gleitet ein; unteres Fach: drei stehen, der vierte gleitet ein. */
const OBEN = [0, 1, 2, 3, 4].map((i) => ordner(stehend(i), REGAL.mitte));
const UNTEN = [0, 1, 2].map((i) => ordner(stehend(i), REGAL.unten - REGAL.brett));

function ordnerGruppe(id: string, o: ReturnType<typeof ordner>, takte: number): Gruppe {
  return {
    id,
    teile: [
      { d: `${o.umriss}${o.loch}`, art: 'markiert' },
      { d: o.schild, art: 'fein' },
    ],
    ablauf: { art: 'ein', takte, dauer: 'd-3', y: -22 },
  };
}

/**
 * Ablage (Briefkorb) von vorn: Vorderkante und Boden; `oben` ist die Oberkante der Vorderkante. Die Mitte liegt so,
 * dass „Geschäftsführung“ (bei 280 px Bildbreite und 12 px Schrift gut 175 Einheiten) vor dem rechten Rand endet.
 * Die Ablagen sind Sinnbilder ohne Maßstab (Prüfrunde 3 B3-5): In einem echten Briefkorb läge das Papier flach, und
 * von vorn sähe man nur die Vorderkante. Maßstäblich bleiben Brief (DIN lang) und Blatt (A4), wie sie in die Ablage
 * gehören; das Schriftfeld sagt es.
 */
const KORB = { x: 248, breite: 104, hoehe: 20 };
const KORB_OBEN = 104;
const KORB_UNTEN = 258;
function korb(oben: number): string {
  return `${rechteck(KORB.x, oben, KORB.breite, KORB.hoehe)}${waagerecht(KORB.x + 6, KORB.x + KORB.breite - 6, oben + 6)}`;
}

/** Mitte der Beschriftungen: „Post“ über der oberen Ablage, „Geschäftsführung“ unter der unteren. */
export const BESCHRIFTUNG_Y = Object.freeze({ post: 44, gf: KORB_UNTEN + 16 });

/** Brief DIN lang von vorn mit Anschriftfenster (90 × 45 mm, 20 mm von links, 15 mm von unten). */
export const BRIEF = Object.freeze({ x: 263, y: 78, breite: e(L.breite.mm), hoehe: e(L.hoehe.mm) });
const FENSTER = {
  x: BRIEF.x + e(L.fensterLinks.mm),
  y: BRIEF.y + BRIEF.hoehe - e(L.fensterUnten.mm) - e(L.fensterHoehe.mm),
  breite: e(L.fensterBreite.mm),
  hoehe: e(L.fensterHoehe.mm),
};

/** Blatt A4 hochkant für die Geschäftsführung, unten in der zweiten Ablage. */
export const BLATT = Object.freeze({
  x: 265,
  y: 158,
  breite: e(BUERO_MASSE.a4.breite.mm),
  hoehe: e(BUERO_MASSE.a4.hoehe.mm),
});

export const ABLAGE: BueroSzene = Object.freeze<BueroSzene>({
  id: 'ablage',
  rahmen: ABLAGE_RAHMEN,
  mmJeEinheit: MM,
  gruppen: [
    {
      id: 'regal',
      teile: [
        {
          d: [
            rechteck(REGAL.x, REGAL.oben, REGAL.brett, REGAL.unten - REGAL.oben),
            rechteck(REGAL.x + REGAL.breite - REGAL.brett, REGAL.oben, REGAL.brett, REGAL.unten - REGAL.oben),
            rechteck(REGAL.x + REGAL.brett, REGAL.oben, REGAL.breite - 2 * REGAL.brett, REGAL.brett),
            rechteck(REGAL.x + REGAL.brett, REGAL.mitte, REGAL.breite - 2 * REGAL.brett, REGAL.brett),
            rechteck(REGAL.x + REGAL.brett, REGAL.unten - REGAL.brett, REGAL.breite - 2 * REGAL.brett, REGAL.brett),
          ].join(''),
          art: 'kontur',
        },
      ],
    },
    {
      id: 'ordner',
      teile: [
        { d: [...OBEN, ...UNTEN].map((o) => `${o.umriss}${o.loch}`).join(''), art: 'kontur' },
        { d: [...OBEN, ...UNTEN].map((o) => o.schild).join(''), art: 'fein' },
      ],
    },
    ordnerGruppe('ordner-oben', ordner(stehend(5), REGAL.mitte), 0),
    ordnerGruppe('ordner-unten', ordner(stehend(3), REGAL.unten - REGAL.brett), 2),
    // Post: Der Brief sinkt in die obere Ablage (hinter ihre Vorderkante)
    {
      id: 'brief',
      teile: [
        { d: rechteck(BRIEF.x, BRIEF.y, BRIEF.breite, BRIEF.hoehe), art: 'markiert' },
        { d: rechteck(FENSTER.x, FENSTER.y, FENSTER.breite, FENSTER.hoehe), art: 'fein' },
      ],
      ablauf: { art: 'ein', takte: 5, dauer: 'd-4', y: -56 },
    },
    { id: 'ablage-post', sinnbild: true, teile: [{ d: korb(KORB_OBEN), art: 'kontur' }] },
    // Das Blatt wandert vom Regal in die Ablage der Geschäftsführung
    {
      id: 'blatt',
      teile: [
        { d: rechteck(BLATT.x, BLATT.y, BLATT.breite, BLATT.hoehe), art: 'kontur' },
        { d: [8, 14, 20, 26].map((dy, i) => waagerecht(BLATT.x + 8, BLATT.x + (i === 3 ? 40 : 58), BLATT.y + dy)).join(''), art: 'fein' },
      ],
      ablauf: { art: 'ein', takte: 9, dauer: 'd-4', x: -82 },
    },
    { id: 'ablage-gf', sinnbild: true, teile: [{ d: korb(KORB_UNTEN - KORB.hoehe), art: 'kontur' }] },
  ],
  // „Post“ über ihrer Ablage, „Geschäftsführung“ unter ihrer: Jede steht nah an ihrem eigenen Fach, nicht zwischen den
  // beiden (Prüfrunde 3 A3-7; vorher las man „Geschäftsführung“ als Unterschrift der Post)
  beschriftungen: [
    { id: 'post', x: KORB.x + KORB.breite / 2, y: BESCHRIFTUNG_Y.post, anker: 'middle' },
    { id: 'gf', x: KORB.x + KORB.breite / 2, y: BESCHRIFTUNG_Y.gf, anker: 'middle' },
  ],
});
