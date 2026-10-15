/**
 * Szene „Telefon und Termine“ (E-031, Paket W3): die Plantafel der Woche, Montag bis Freitag in Spalten, zwei Bahnen
 * für die Monteure (Glyphe Servicefahrzeug) und den Kundendienst (Glyphe Wärmepumpe). Die Termine sind Blöcke auf der
 * Wärmerampe, ohne Uhrzeit, ohne Namen; beim Sichtbarwerden gleiten sie einmal von links in ihre Felder
 * (Register `buero-ablauf`). Ohne Maßstab (Schriftfeld sagt es).
 */
import { glyphPfade } from './leitstelle';
import { rundRechteck, rechteck, senkrecht, waagerecht, type Art, type BueroSzene, type Gruppe } from './szene';

export const WOCHENPLAN_RAHMEN = Object.freeze({ breite: 400, hoehe: 300 });

/** Tafel: links die Spalte der Bahnen, oben die Kopfzeile der Tage. */
export const TAFEL = Object.freeze({ x: 56, y: 40, breite: 336, hoehe: 236, kopf: 32 });
export const TAGE = 5;
const SPALTE = TAFEL.breite / TAGE;
const BAHN = (TAFEL.hoehe - TAFEL.kopf) / 2;
const RAND = 6;
const BLOCK_HOEHE = 38;

/** Ein Termin: Tag (0 = Montag), Länge in Tagen, Bahn (0 Monteure, 1 Kundendienst), Lage in der Bahn, Fläche, Start. */
interface Termin {
  tag: number;
  tage: number;
  bahn: 0 | 1;
  oben: boolean;
  art: Extract<Art, 'warm1' | 'warm2' | 'warm3'>;
  takte: number;
}

/** Sieben Termine, je ein Takt und ein halber versetzt; der letzte steht nach 9 Takten + d-3. */
export const TERMINE: readonly Termin[] = [
  { tag: 0, tage: 1, bahn: 0, oben: true, art: 'warm1', takte: 0 },
  { tag: 1, tage: 2, bahn: 0, oben: false, art: 'warm2', takte: 1.5 },
  { tag: 3, tage: 1, bahn: 0, oben: true, art: 'warm3', takte: 3 },
  { tag: 0, tage: 1, bahn: 1, oben: false, art: 'warm2', takte: 4.5 },
  { tag: 2, tage: 1, bahn: 1, oben: true, art: 'warm1', takte: 6 },
  { tag: 3, tage: 2, bahn: 1, oben: false, art: 'warm3', takte: 7.5 },
  { tag: 4, tage: 1, bahn: 0, oben: false, art: 'warm1', takte: 9 },
];

function termin(t: Termin, i: number): Gruppe {
  const x = TAFEL.x + t.tag * SPALTE + RAND;
  const bahnOben = TAFEL.y + TAFEL.kopf + t.bahn * BAHN;
  const y = t.oben ? bahnOben + 8 : bahnOben + BAHN - 8 - BLOCK_HOEHE;
  return {
    id: `termin-${i + 1}`,
    teile: [{ d: rundRechteck(x, y, t.tage * SPALTE - 2 * RAND, BLOCK_HOEHE, 4), art: t.art }],
    ablauf: { art: 'ein', takte: t.takte, dauer: 'd-3', x: -28 },
  };
}

/** Kopfzeile, Grenze der Bahnen, Mitte jeder Bahn (zwischen oberem und unterem Termin) und die Tage. */
const raster = [
  waagerecht(TAFEL.x, TAFEL.x + TAFEL.breite, TAFEL.y + TAFEL.kopf),
  waagerecht(TAFEL.x, TAFEL.x + TAFEL.breite, TAFEL.y + TAFEL.kopf + BAHN),
  waagerecht(TAFEL.x, TAFEL.x + TAFEL.breite, TAFEL.y + TAFEL.kopf + BAHN / 2),
  waagerecht(TAFEL.x, TAFEL.x + TAFEL.breite, TAFEL.y + TAFEL.kopf + BAHN * 1.5),
  ...Array.from({ length: TAGE - 1 }, (_, i) => senkrecht(TAFEL.x + (i + 1) * SPALTE, TAFEL.y, TAFEL.y + TAFEL.hoehe)),
].join('');

export const WOCHENPLAN: BueroSzene = Object.freeze<BueroSzene>({
  id: 'wochenplan',
  rahmen: WOCHENPLAN_RAHMEN,
  mmJeEinheit: null,
  gruppen: [
    {
      id: 'tafel',
      teile: [
        // Plantafel mit Rahmen (außen gerundet, innen die Tafel) und Ablageleiste unter der Tafel
        {
          d: `${rundRechteck(TAFEL.x - 4, TAFEL.y - 4, TAFEL.breite + 8, TAFEL.hoehe + 8, 6)}${rechteck(TAFEL.x, TAFEL.y, TAFEL.breite, TAFEL.hoehe)}${rechteck(TAFEL.x + 100, TAFEL.y + TAFEL.hoehe + 4, 136, 6)}`,
          art: 'kontur',
        },
        { d: raster, art: 'fein' },
      ],
    },
    { id: 'monteure', lage: { x: 4, y: TAFEL.y + TAFEL.kopf + BAHN / 2 - 26, s: 2 }, teile: glyphPfade('servicefahrzeug') },
    { id: 'kundendienst', lage: { x: 4, y: TAFEL.y + TAFEL.kopf + BAHN * 1.5 - 25, s: 2 }, teile: glyphPfade('waermepumpe') },
    ...TERMINE.map(termin),
  ],
  beschriftungen: ['mo', 'di', 'mi', 'do', 'fr'].map((id, i) => ({
    id,
    x: TAFEL.x + (i + 0.5) * SPALTE,
    y: TAFEL.y + TAFEL.kopf / 2,
    anker: 'middle' as const,
  })),
});
