/**
 * Leitstelle (E-031, Paket W3): der Schreibtisch im Büro von oben, maßstäblich (1 Einheit = 10 mm wie der
 * Hausschnitt), mit Bildschirm, zwei Blättern A4, einem liegenden Ordner und dem Stuhl. Vier Bezugslinien in der
 * Linienart `mass` führen vom Tisch zu den Stellen, die das Büro verbindet (Aufgaben der Bürofachkraft): zu den
 * Monteuren (Glyphe Servicefahrzeug), zum Kundendienst (Glyphe Wärmepumpe), zu den Kunden (Giebelhaus) und zu
 * Großhandel und Lager (Europalette von oben, im selben Maßstab wie der Tisch). Keine Leitung, keine Rohrfarbe:
 * Hier fließt nichts. Die Wörter stehen als HTML an den Beschriftungen.
 *
 * Kopf der Themenseite (components/themen/buero/Leitstelle.tsx, auf Navy) und Kopfbild der Bürofachkraft
 * (lib/zeichnung/kopf-svg.ts, Datei); still, ohne Ablauf.
 */
import { GLYPH_SHAPES, type IconName } from '@/components/icons/glyphs';
import { BUERO_MASSE } from './masse';
import { giebelhaus, kreis, rechteck, rundRechteck, strecke, type BueroSzene, type Strich } from './szene';

const MM = 10;
const e = (mm: number) => mm / MM;
const M = BUERO_MASSE;

/** Pfade einer Glyphe im Raster 24 × 24 (Kreise und Rechtecke als Pfade), Linienart Kontur ohne Fläche. */
export function glyphPfade(name: IconName): Strich[] {
  return (GLYPH_SHAPES[name] as readonly Record<string, number | string>[]).map((form) => {
    if ('d' in form) return { d: String(form.d), art: 'konturOffen' };
    if ('cx' in form) return { d: kreis(Number(form.cx), Number(form.cy), Number(form.r)), art: 'konturOffen' };
    const r = Number(form.rx ?? 0);
    const [x, y, b, h] = [Number(form.x), Number(form.y), Number(form.width), Number(form.height)];
    return { d: r > 0 ? rundRechteck(x, y, b, h, r) : rechteck(x, y, b, h), art: 'konturOffen' };
  });
}

export const LEITSTELLE_RAHMEN = Object.freeze({ breite: 640, hoehe: 400 });

/** Der Tisch (Draufsicht, Vorderkante unten, dort der Stuhl). */
export const TISCH = Object.freeze({ x: 240, y: 150, breite: e(M.schreibtisch.breite.mm), tiefe: e(M.schreibtisch.tiefe.mm) });
/** Blätter A4 hochkant auf dem Tisch, das zweite leicht versetzt darüber. */
const A4 = { b: e(M.a4.breite.mm), h: e(M.a4.hoehe.mm) };
const BLATT = [
  { x: 256, y: 166 },
  { x: 262, y: 172 },
] as const;
/** Liegender Ordner von oben (Deckel 285 × 318). */
const ORDNER = { x: 354, y: 166, b: e(M.ordner.tiefe.mm), h: e(M.ordner.hoehe.mm) };
/** Europalette von oben, im Maßstab des Tischs; die Deckbretter laufen in der Länge. */
export const PALETTE = Object.freeze({ x: 490, y: 250, laenge: e(M.europalette.laenge.mm), breite: e(M.europalette.breite.mm) });

function deckbretter(): string {
  const p = M.europalette;
  const breiten = [p.deckbretter.mm, p.zwischenbretter.mm, p.deckbretter.mm, p.zwischenbretter.mm, p.deckbretter.mm].map(e);
  const luecke = (PALETTE.breite - breiten.reduce((s, b) => s + b, 0)) / (breiten.length - 1);
  let y = PALETTE.y;
  return breiten
    .map((b) => {
      const d = rechteck(PALETTE.x, y, PALETTE.laenge, b);
      y += b + luecke;
      return d;
    })
    .join('');
}

const haus = giebelhaus(64, 334, 52, 36);

/** Startpunkt jeder Bezugslinie auf dem Tisch (Punkt) und Ende am Ziel. */
export const BEZUG = Object.freeze({
  monteure: { von: { x: 247, y: 157 }, bis: { x: 116, y: 86 } },
  kundendienst: { von: { x: 393, y: 157 }, bis: { x: 524, y: 86 } },
  kunden: { von: { x: 247, y: 223 }, bis: { x: 126, y: 290 } },
  lager: { von: { x: 393, y: 223 }, bis: { x: 486, y: 246 } },
});

export const LEITSTELLE: BueroSzene = Object.freeze<BueroSzene>({
  id: 'leitstelle',
  rahmen: LEITSTELLE_RAHMEN,
  mmJeEinheit: MM,
  gruppen: [
    {
      id: 'tisch',
      teile: [
        // Tischplatte mit Stuhl: Sitz und Lehne vor der Vorderkante
        { d: rechteck(TISCH.x, TISCH.y, TISCH.breite, TISCH.tiefe), art: 'kontur' },
        { d: `${rundRechteck(298, 238, 44, 40, 8)}${rundRechteck(300, 282, 40, 7, 3.5)}`, art: 'kontur' },
        // Bildschirm an der Hinterkante: Gehäuse und Fuß
        { d: `${rechteck(292, 155, 56, 4)}${rechteck(311, 159, 18, 9)}`, art: 'kontur' },
        { d: BLATT.map((b) => rechteck(b.x, b.y, A4.b, A4.h)).join(''), art: 'kontur' },
        { d: [0, 1, 2, 3].map((i) => `M${BLATT[1].x + 4} ${BLATT[1].y + 6 + i * 4}H${BLATT[1].x + (i === 3 ? 11 : 17)}`).join(''), art: 'fein' },
        { d: rechteck(ORDNER.x, ORDNER.y, ORDNER.b, ORDNER.h), art: 'kontur' },
        { d: `M${ORDNER.x + 3} ${ORDNER.y}V${ORDNER.y + ORDNER.h}${rechteck(ORDNER.x + 9, ORDNER.y + 6, 13, 8)}`, art: 'fein' },
      ],
    },
    // Bezugslinien vom Tisch zu den Zielen: der Punkt sitzt auf der Tischplatte (Hinweislinie nach DIN 406)
    {
      id: 'bezug',
      teile: [
        { d: Object.values(BEZUG).map((b) => strecke(b.von.x, b.von.y, b.bis.x, b.bis.y)).join(''), art: 'mass' },
        { d: Object.values(BEZUG).map((b) => kreis(b.von.x, b.von.y, 3)).join(''), art: 'voll' },
      ],
    },
    { id: 'monteure', lage: { x: 54, y: 42, s: 2.6 }, teile: glyphPfade('servicefahrzeug') },
    { id: 'kundendienst', lage: { x: 524, y: 38, s: 2.6 }, teile: glyphPfade('waermepumpe') },
    {
      id: 'kunden',
      teile: [
        { d: `${haus.waende}${haus.tuer}`, art: 'kontur' },
        { d: haus.dach, art: 'konturOffen' },
      ],
    },
    {
      id: 'lager',
      teile: [
        { d: deckbretter(), art: 'kontur' },
        { d: rechteck(504, 256, 44, 34), art: 'kontur' },
        { d: 'M526 256V290', art: 'fein' },
      ],
    },
  ],
  beschriftungen: [
    // Über den Glyphen bzw. unter Haus und Palette, frei von den Bezugslinien
    { id: 'monteure', x: 54, y: 24, anker: 'start' },
    { id: 'kundendienst', x: 586, y: 24, anker: 'end' },
    { id: 'kunden', x: 54, y: 360, anker: 'start' },
    { id: 'lager', x: 610, y: 354, anker: 'end' },
  ],
});
