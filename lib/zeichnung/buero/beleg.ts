/**
 * Szene „Angebote und Rechnungen“ (E-031, Paket W3): ein Blatt A4 (ISO 216) als Geschäftsbrief nach DIN 5008 Form B,
 * maßstäblich (1 Einheit = 1,5 mm): Anschriftfeld, Falz- und Lochmarken am linken Rand, Betreff, Positionen mit
 * rechter Spalte, Summe. Keine Ziffern, kein Betrag, kein Logo: Die Zeilen sind Striche. Rechts die drei Schritte
 * eines Auftrags im Büro (Angebot, Auftragsbestätigung, Rechnung) als Kästchen; die Wörter stehen als HTML daneben.
 *
 * Ablauf beim Sichtbarwerden (Register `buero-ablauf`): Die Zeilen schreiben sich von links (scaleX), dann wandert die
 * Markierung vom Angebot über die Auftragsbestätigung zur Rechnung, und die Kästchen bekommen nacheinander ihr Häkchen.
 */
import { BUERO_MASSE } from './masse';
import { haken, rechteck, rundRechteck, senkrecht, waagerecht, type BueroSzene, type Gruppe } from './szene';

const MM = 1.5;
const e = (mm: number) => mm / MM;
const B = BUERO_MASSE.brief5008;

export const BELEG_RAHMEN = Object.freeze({ breite: 400, hoehe: 300 });

/** Das Blatt A4 hochkant. */
export const BLATT = Object.freeze({ x: 20, y: 51, breite: e(BUERO_MASSE.a4.breite.mm), hoehe: e(BUERO_MASSE.a4.hoehe.mm) });
/** Rand rechts (DIN 5008: mindestens 20 mm). */
const RECHTS = BLATT.x + BLATT.breite - e(20);
/** Anschriftfeld nach DIN 5008, Form B. */
export const ANSCHRIFT = Object.freeze({
  x: BLATT.x + e(B.anschriftLinks.mm),
  y: BLATT.y + e(B.anschriftOben.mm),
  breite: e(B.anschriftBreite.mm),
  hoehe: e(B.anschriftHoehe.mm),
});
const MARKE = 5;

/** Die drei Schritte rechts neben dem Blatt (Mitte je Zeile) und das Kästchen davor. */
export const SCHRITTE = Object.freeze({ x: 184, y: [100, 150, 200] as const, kaestchen: 16 });

let takt = 0;
/** Eine geschriebene Zeile: ein Strich, der sich von links aufzieht; jede Zeile einen halben Takt später. */
function zeile(id: string, x1: number, x2: number, y: number): Gruppe {
  const g: Gruppe = { id, teile: [{ d: waagerecht(x1, x2, y), art: 'fein' }], ablauf: { art: 'schreiben', takte: takt, dauer: 'd-3' } };
  takt += 0.5;
  return g;
}

const ZEILEN: Gruppe[] = [
  // Anschrift: drei Zeilen im Anschriftfeld (Anschriftzone, unter der Zusatz- und Vermerkzone)
  zeile('anschrift-1', ANSCHRIFT.x, ANSCHRIFT.x + 34, ANSCHRIFT.y + 14),
  zeile('anschrift-2', ANSCHRIFT.x, ANSCHRIFT.x + 40, ANSCHRIFT.y + 19),
  zeile('anschrift-3', ANSCHRIFT.x, ANSCHRIFT.x + 28, ANSCHRIFT.y + 24),
  // Betreff
  zeile('betreff', ANSCHRIFT.x, ANSCHRIFT.x + 52, 140),
  // Positionen: Text links, Wert rechts
  ...[0, 1, 2].flatMap((i) => [
    zeile(`position-${i + 1}`, ANSCHRIFT.x, ANSCHRIFT.x + [60, 48, 54][i], 162 + i * 12),
    zeile(`wert-${i + 1}`, RECHTS - 18, RECHTS, 162 + i * 12),
  ]),
  zeile('summe', RECHTS - 24, RECHTS, 210),
];

const schritte = SCHRITTE.y.map((y, i) => ({
  kaestchen: rechteck(SCHRITTE.x, y - SCHRITTE.kaestchen / 2, SCHRITTE.kaestchen, SCHRITTE.kaestchen),
  haken: haken(SCHRITTE.x, y - SCHRITTE.kaestchen / 2, SCHRITTE.kaestchen),
  takte: 9 + i * 2.5,
}));

export const BELEG: BueroSzene = Object.freeze<BueroSzene>({
  id: 'beleg',
  rahmen: BELEG_RAHMEN,
  mmJeEinheit: MM,
  gruppen: [
    {
      id: 'blatt',
      teile: [
        { d: rechteck(BLATT.x, BLATT.y, BLATT.breite, BLATT.hoehe), art: 'kontur' },
        // Falzmarken und Lochmarke am linken Rand, Tabellenkopf und Summenstrich der Positionen
        {
          d: [
            waagerecht(BLATT.x, BLATT.x + MARKE, BLATT.y + e(B.falzmarke1.mm)),
            waagerecht(BLATT.x, BLATT.x + MARKE * 1.6, BLATT.y + e(B.lochmarke.mm)),
            waagerecht(BLATT.x, BLATT.x + MARKE, BLATT.y + e(B.falzmarke2.mm)),
            // Rücksendeangabe in der Zusatz- und Vermerkzone des Anschriftfelds; rechts daneben der Informationsblock
            waagerecht(ANSCHRIFT.x, ANSCHRIFT.x + 40, ANSCHRIFT.y + 5),
            waagerecht(RECHTS - 34, RECHTS, ANSCHRIFT.y + 5),
            waagerecht(RECHTS - 34, RECHTS, ANSCHRIFT.y + 11),
            waagerecht(RECHTS - 34, RECHTS - 12, ANSCHRIFT.y + 17),
            // Positionen: Kopf, Trennlinie vor der Wertspalte, Summenstrich
            waagerecht(ANSCHRIFT.x, RECHTS, 152),
            senkrecht(RECHTS - 22, 152, 196),
            waagerecht(RECHTS - 30, RECHTS, 202),
          ].join(''),
          art: 'fein',
        },
      ],
    },
    ...ZEILEN,
    // Markierung: wandert vom Angebot zur Rechnung (Endlage bei der Rechnung)
    {
      id: 'markierung',
      teile: [{ d: rundRechteck(SCHRITTE.x - 6, SCHRITTE.y[2] - 15, 216, 30, 4), art: 'warm2' }],
      ablauf: { art: 'ein', takte: 9, dauer: 'd-4', y: SCHRITTE.y[0] - SCHRITTE.y[2] },
    },
    { id: 'kaestchen', teile: [{ d: schritte.map((s) => s.kaestchen).join(''), art: 'kontur' }] },
    ...schritte.map(
      (s, i): Gruppe => ({ id: `haken-${i + 1}`, teile: [{ d: s.haken, art: 'konturOffen' }], ablauf: { art: 'ein', takte: s.takte, dauer: 'd-3' } }),
    ),
  ],
  beschriftungen: [
    { id: 'angebot', x: SCHRITTE.x + 26, y: SCHRITTE.y[0], anker: 'start' },
    { id: 'auftrag', x: SCHRITTE.x + 26, y: SCHRITTE.y[1], anker: 'start' },
    { id: 'rechnung', x: SCHRITTE.x + 26, y: SCHRITTE.y[2], anker: 'start' },
  ],
});
