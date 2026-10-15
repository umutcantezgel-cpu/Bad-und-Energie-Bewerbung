/**
 * Szene „Material und Lieferungen“ (E-031, Paket W3): der Weg des Materials vom Großhandel (Halle mit Rolltor) über das
 * Lager (Europalette nach EN 13698-1 in der Seitenansicht, maßstäblich, 1 Einheit = 10 mm) zur Baustelle
 * (Giebelhaus). Über dem Lager der Lieferschein als Einzelheit (Blatt im Format A4, eigener Maßstab) mit Kästchen.
 * Keine Marke, kein Fahrzeug, keine Leitung; die Wege sind Hinweispfeile in der feinen Linie unter dem Gelände.
 *
 * Maßstäblich ist nur das Lager: Palette und Kartons stehen in einem eigenen Rahmen (Einzelheit) auf eigener Linie.
 * Halle und Haus sind Sinnbilder ohne Maßstab auf ihren eigenen Geländestücken, der Karton vor dem Haus im Maß des
 * Hauses (kleiner als die Tür); das Schriftfeld sagt es (Prüfrunde 1 A1-4, B1-3: vorher stand die maßstäbliche
 * Palette auf derselben Geländelinie wie eine 1,1 m hohe Halle).
 *
 * Ablauf beim Sichtbarwerden (Register `buero-ablauf`): zwei Pakete wandern vom Großhandel auf die Palette, eins vom
 * Lager zur Baustelle; zuletzt bekommt der Lieferschein sein Häkchen.
 */
import { fliesspfeil } from '../norm';
import { BUERO_MASSE } from './masse';
import { giebelhaus, haken, rechteck, rundRechteck, strecke, waagerecht, type BueroSzene } from './szene';

const MM = 10;
const e = (mm: number) => mm / MM;
const P = BUERO_MASSE.europalette;
const K = BUERO_MASSE.karton;

export const MATERIAL_RAHMEN = Object.freeze({ breite: 400, hoehe: 300 });

/** Gelände (Oberkante Boden). */
export const BODEN = 250;

/** Halle des Großhandels: Wände, Dachrand mit Überstand, Rolltor mit Lamellen. */
const HALLE = { x: 12, breite: 110, hoehe: 110 };
const TOR = { x: 38, breite: 58, hoehe: 64 };
const lamellen = Array.from({ length: 9 }, (_, i) => waagerecht(TOR.x, TOR.x + TOR.breite, BODEN - TOR.hoehe + 6.4 * (i + 1))).join('');

/** Europalette in der Seitenansicht (Länge 1200): Deckbrett und Querbrett, drei Klötze, Bodenbrett; Höhe 144. */
export const PALETTE = Object.freeze({ x: 148, laenge: e(P.laenge.mm), hoehe: e(P.hoehe.mm) });
function paletteSeite(): string {
  const brett = e(P.brett.mm);
  const oben = BODEN - PALETTE.hoehe;
  const klotz = e(P.klotzBreite.mm);
  const klotzOben = oben + 2 * brett;
  const lagen = [0, (PALETTE.laenge - klotz) / 2, PALETTE.laenge - klotz];
  return [
    rechteck(PALETTE.x, oben, PALETTE.laenge, 2 * brett),
    ...lagen.map((x) => rechteck(PALETTE.x + x, klotzOben, klotz, e(P.klotz.mm))),
    rechteck(PALETTE.x, BODEN - brett, PALETTE.laenge, brett),
  ].join('');
}

/** Karton von vorn (600 × 400) mit Klebeband; `x` links, steht auf `unten`; `teil` verkleinert (kleiner Karton). */
const KARTON = { breite: e(K.laenge.mm), hoehe: e(K.hoehe.mm) };
function karton(x: number, unten: number, teil = 1): string {
  const b = KARTON.breite * teil;
  const h = KARTON.hoehe * teil;
  return `${rechteck(x, unten - h, b, h)}${waagerecht(x, x + b, unten - h + 6 * teil)}`;
}
const AUF_PALETTE = BODEN - PALETTE.hoehe;

/** Rahmen der Einzelheit „Lager“: Palette mit zwei Kartons, 8 Einheiten Abstand, unten bis knapp unter ihre Linie. */
export const EINZELHEIT = Object.freeze({
  x: PALETTE.x - 8,
  y: AUF_PALETTE - KARTON.hoehe - 10,
  breite: PALETTE.laenge + 16,
  hoehe: KARTON.hoehe + PALETTE.hoehe + 16,
});
/** Geländestücke: unter der Halle, im Rahmen des Lagers (seine eigene Linie) und unter dem Haus. */
export const GELAENDE = Object.freeze([
  { von: 8, bis: 130 },
  { von: EINZELHEIT.x + 4, bis: EINZELHEIT.x + EINZELHEIT.breite - 4 },
  { von: 284, bis: 392 },
]);

/**
 * Lieferschein als Einzelheit über dem Lager: Blatt im Seitenverhältnis A4, drei Zeilen, ein Kästchen. Groß genug, dass
 * er den Raum über den Stationen füllt; die Mitte steht über dem zweiten Paket.
 */
const SCHEIN = { x: 216, y: 40, breite: 46, hoehe: (46 * BUERO_MASSE.a4.hoehe.mm) / BUERO_MASSE.a4.breite.mm };
const SCHEIN_KAESTCHEN = { x: SCHEIN.x + 7, y: SCHEIN.y + 38, k: 13 };

const haus = giebelhaus(296, BODEN, 92, 76);
/** Karton vor dem Haus im Maß des Sinnbilds: kleiner als die Tür (0,22 × 92 breit, 0,5 × 76 hoch). */
export const KARTON_HAUS = Object.freeze({ x: 342, teil: 0.3 });
/** Hinweispfeile der Wege unter dem Gelände; darunter die Namen der drei Stationen. */
const WEG_Y = 264;
const NAMEN_Y = 284;

export const MATERIAL: BueroSzene = Object.freeze<BueroSzene>({
  id: 'material',
  rahmen: MATERIAL_RAHMEN,
  mmJeEinheit: MM,
  gruppen: [
    {
      id: 'grosshandel',
      sinnbild: true,
      teile: [
        { d: `${rechteck(HALLE.x, BODEN - HALLE.hoehe, HALLE.breite, HALLE.hoehe)}${rechteck(HALLE.x - 6, BODEN - HALLE.hoehe - 6, HALLE.breite + 12, 6)}`, art: 'kontur' },
        { d: rechteck(TOR.x, BODEN - TOR.hoehe, TOR.breite, TOR.hoehe), art: 'kontur' },
        { d: lamellen, art: 'fein' },
      ],
    },
    {
      id: 'lager',
      teile: [
        { d: rundRechteck(EINZELHEIT.x, EINZELHEIT.y, EINZELHEIT.breite, EINZELHEIT.hoehe, 4), art: 'fein' },
        { d: paletteSeite(), art: 'kontur' },
      ],
    },
    {
      id: 'baustelle',
      sinnbild: true,
      teile: [
        { d: `${haus.waende}${haus.tuer}${rechteck(350, 194, 20, 20)}`, art: 'kontur' },
        { d: haus.dach, art: 'konturOffen' },
        { d: 'M360 194V214M350 204H370', art: 'fein' },
      ],
    },
    {
      id: 'wege',
      teile: [
        { d: GELAENDE.map((g) => waagerecht(g.von, g.bis, BODEN)).join(''), art: 'konturOffen' },
        { d: `${waagerecht(126, 140, WEG_Y)}${waagerecht(272, 280, WEG_Y)}`, art: 'fein' },
        { d: `${fliesspfeil({ x: 146, y: WEG_Y }, { x: 1, y: 0 }, 7, 5)}${fliesspfeil({ x: 286, y: WEG_Y }, { x: 1, y: 0 }, 7, 5)}`, art: 'voll' },
      ],
    },
    // Der Lieferschein über dem Lager, mit Bezugslinie auf die Palette
    {
      id: 'lieferschein',
      teile: [
        { d: strecke(SCHEIN.x + SCHEIN.breite / 2, SCHEIN.y + SCHEIN.hoehe, SCHEIN.x + SCHEIN.breite / 2, EINZELHEIT.y), art: 'mass' },
        { d: rechteck(SCHEIN.x, SCHEIN.y, SCHEIN.breite, SCHEIN.hoehe), art: 'kontur' },
        {
          d: [9, 16, 23].map((dy, i) => waagerecht(SCHEIN.x + 7, SCHEIN.x + (i === 2 ? 26 : 38), SCHEIN.y + dy)).join(''),
          art: 'fein',
        },
        { d: rechteck(SCHEIN_KAESTCHEN.x, SCHEIN_KAESTCHEN.y, SCHEIN_KAESTCHEN.k, SCHEIN_KAESTCHEN.k), art: 'kontur' },
      ],
    },
    // Pakete: zwei kommen vom Großhandel auf die Palette, eins geht vom Lager zur Baustelle
    { id: 'paket-1', teile: [{ d: karton(PALETTE.x, AUF_PALETTE), art: 'warm1' }], ablauf: { art: 'ein', takte: 0, dauer: 'd-4', x: -110 } },
    { id: 'paket-2', teile: [{ d: karton(PALETTE.x + KARTON.breite, AUF_PALETTE), art: 'warm2' }], ablauf: { art: 'ein', takte: 3, dauer: 'd-4', x: -170 } },
    // Kleiner Karton vor der Hauswand, rechts der Tür und unter dem Fenster
    { id: 'paket-3', teile: [{ d: karton(KARTON_HAUS.x, BODEN, KARTON_HAUS.teil), art: 'warm3' }], ablauf: { art: 'ein', takte: 7, dauer: 'd-4', x: -110 } },
    {
      id: 'haken',
      teile: [{ d: haken(SCHEIN_KAESTCHEN.x, SCHEIN_KAESTCHEN.y, SCHEIN_KAESTCHEN.k), art: 'konturOffen' }],
      ablauf: { art: 'ein', takte: 13, dauer: 'd-3' },
    },
  ],
  beschriftungen: [
    { id: 'grosshandel', x: HALLE.x + HALLE.breite / 2, y: NAMEN_Y, anker: 'middle' },
    { id: 'lager', x: PALETTE.x + PALETTE.laenge / 2, y: NAMEN_Y, anker: 'middle' },
    { id: 'baustelle', x: 342, y: NAMEN_Y, anker: 'middle' },
    { id: 'lieferschein', x: SCHEIN.x - 8, y: SCHEIN.y + 14, anker: 'end' },
  ],
});
