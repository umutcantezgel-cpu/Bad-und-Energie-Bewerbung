/**
 * Büro-Zeichnungen als eigene SVG-Dateien (E-031, Paket W3), wie die Kopfzeichnungen (lib/zeichnung/kopf-svg.ts):
 * Die Stellenseite der Bürofachkraft zeigt die Leitstelle im Kopf und die vier Szenen im Einblick nur als Datei per
 * `<img loading="lazy">`, still im Endzustand; inline und bewegt stehen sie nur auf der Themenseite (Plan E-031 §0.6).
 * Dieselbe Geometrie wie die Komponenten (components/themen/buero), aus denselben Modulen; feste Farben, weil ein
 * SVG im `<img>` keine Rollen erbt: die Szenen in den Papier-Rollen (Einblick auf der Wand), die Leitstelle in den
 * Rollen des Inverse-Bands (Navy-Fläche des Stellenkopfs), je hell und dunkel per prefers-color-scheme, im Druck hell.
 * Ausgeliefert über app/zeichnung/[datei]/route.ts; der Dateiname trägt einen Hash des Inhalts.
 * Prüfung: lib/zeichnung/buero/__tests__/buero.test.ts.
 */
import { createHash } from 'node:crypto';
import { TOKENS } from '@/lib/tokens';
import { LEITSTELLE } from './leitstelle';
import type { Art, BueroSzene } from './szene';
import { BUERO_SZENEN, BUERO_SZENEN_ARTEN, type BueroSzenenArt } from './szenen';

const [, W1, W2, W3] = [0, 1, 2, 3].map((i): string => TOKENS.waerme.hell[i]);
const [, D1, D2, D3] = [0, 1, 2, 3].map((i): string => TOKENS.waerme.dunkel[i]);

/**
 * Feste Farben je Umgebung (app/styles/theme.css, Primitive): Papier (Marke Navy, Fläche Papier, Wärmerampe hell) und
 * Nacht (Marke Creme, Fläche Nacht, Rampe Nacht-Blau → Rotbraun); die Leitstelle wie die Kopfzeichnungen auf Navy.
 */
export const BUERO_SVG_FARBEN = Object.freeze({
  papier: {
    hell: { marke: '#111D6D', flaeche: '#FBF7F0', w1: W1, w2: W2, w3: W3 },
    dunkel: { marke: '#F6F0E4', flaeche: '#0A1033', w1: D1, w2: D2, w3: D3 },
    druck: { marke: '#111D6D', flaeche: '#FFFFFF', w1: W1, w2: W2, w3: W3 },
  },
  navy: {
    hell: { marke: '#F6F0E4', flaeche: '#111D6D', w1: W1, w2: W2, w3: W3 },
    dunkel: { marke: '#F6F0E4', flaeche: '#16237A', w1: D1, w2: D2, w3: D3 },
    druck: { marke: '#111D6D', flaeche: '#FFFFFF', w1: W1, w2: W2, w3: W3 },
  },
});

type Farben = { marke: string; flaeche: string; w1: string; w2: string; w3: string };
type Umgebung = keyof typeof BUERO_SVG_FARBEN;

const L = TOKENS.linien;
const vars = (f: Farben) => `--b:${f.marke};--fl:${f.flaeche};--w1:${f.w1};--w2:${f.w2};--w3:${f.w3}`;

/**
 * Linienarten wie technik.module.css: non-scaling-stroke, stumpfe Enden (keine Leitung in diesen Zeichnungen), Kontur
 * mit runden Ecken, feine und Maßlinien spitz; Flächen Papier, Wärmerampe oder Marke.
 */
function stil(umgebung: Umgebung): string {
  const f = BUERO_SVG_FARBEN[umgebung];
  return [
    `svg{${vars(f.hell)}}`,
    `@media screen and (prefers-color-scheme:dark){svg{${vars(f.dunkel)}}}`,
    `@media print{svg{${vars(f.druck)}}}`,
    '.k,.f,.m{fill:none;stroke-linecap:butt;vector-effect:non-scaling-stroke}',
    `.k{stroke:var(--b);stroke-width:${L.kontur}px;stroke-linejoin:round}`,
    `.f{stroke:var(--b);stroke-width:${L.fein}px;stroke-linejoin:miter}`,
    `.m{stroke:var(--b);stroke-width:${L.mass}px;stroke-linejoin:miter}`,
    '.fl{fill:var(--fl)}',
    '.vo{fill:var(--b);stroke:none}',
    '.w1{fill:var(--w1)}',
    '.w2{fill:var(--w2)}',
    '.w3{fill:var(--w3)}',
  ].join('');
}

/** Klassen der Datei je Linienart (Gegenstück der Klassen der Komponente). */
export const DATEI_KLASSE: Readonly<Record<Art, string>> = Object.freeze({
  kontur: 'k fl',
  konturOffen: 'k',
  fein: 'f',
  mass: 'm',
  voll: 'vo',
  warm1: 'k w1',
  warm2: 'k w2',
  warm3: 'k w3',
});

/** Eine Szene als eigenständige SVG-Datei, im Endzustand (ohne Ablauf), ohne Schrift. */
export function szeneSvg(szene: BueroSzene, umgebung: Umgebung): string {
  const { breite, hoehe } = szene.rahmen;
  const inhalt = szene.gruppen.map((g) => {
    const pfade = g.teile.map((t) => `<path d="${t.d}" class="${DATEI_KLASSE[t.art]}"/>`).join('');
    return g.lage ? `<g transform="translate(${g.lage.x} ${g.lage.y}) scale(${g.lage.s})">${pfade}</g>` : pfade;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${breite} ${hoehe}" width="${breite}" height="${hoehe}"><style>${stil(umgebung)}</style>${inhalt.join('')}</svg>`;
}

/** Kopfbild der Bürofachkraft: die Leitstelle auf Navy (Typ `buero` in lib/zeichnung/kopf-svg.ts). */
export function leitstelleSvg(): string {
  return szeneSvg(LEITSTELLE, 'navy');
}

const inhalte = new Map<BueroSzenenArt, string>();
const inhalt = (art: BueroSzenenArt) => {
  if (!inhalte.has(art)) inhalte.set(art, szeneSvg(BUERO_SZENEN[art], 'papier'));
  return inhalte.get(art)!;
};

/** Dateiname mit den ersten 10 Zeichen des SHA-256 über den Inhalt (`buero-wochenplan-<hash>.svg`). */
export function bueroSzeneDatei(art: BueroSzenenArt): string {
  return `buero-${art}-${createHash('sha256').update(inhalt(art)).digest('hex').slice(0, 10)}.svg`;
}

/** Pfad der Datei auf der Website (app/zeichnung/[datei]/route.ts). */
export function bueroSzenePfad(art: BueroSzenenArt): string {
  return `/zeichnung/${bueroSzeneDatei(art)}`;
}

/** Alle Szenen-Dateien mit Inhalt, für generateStaticParams und den Route-Handler. */
export function bueroSzenenDateien(): Array<{ datei: string; art: BueroSzenenArt; svg: string }> {
  return BUERO_SZENEN_ARTEN.map((art) => ({ datei: bueroSzeneDatei(art), art, svg: inhalt(art) }));
}
