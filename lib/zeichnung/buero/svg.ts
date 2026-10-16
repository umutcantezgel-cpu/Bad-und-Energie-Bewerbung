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

/** Die eine Markierfläche (Prüfrunde 2 A2-9): die Rolle --markierung, hell und dunkel (Prüfrunde 4 A4-6: keine Stufe der Wärmerampe). */
const MARKIERT = TOKENS.markierung.hell;
const MARKIERT_DUNKEL = TOKENS.markierung.dunkel;

/**
 * Feste Farben je Umgebung (app/styles/theme.css, Primitive): Papier (Marke Navy, Fläche Papier, Markierfläche hell) und
 * Nacht (Marke Creme, Fläche Nacht, Markierfläche dunkel); die Leitstelle wie die Kopfzeichnungen auf Navy.
 */
export const BUERO_SVG_FARBEN = Object.freeze({
  papier: {
    hell: { marke: '#111D6D', flaeche: '#FBF7F0', markiert: MARKIERT },
    dunkel: { marke: '#F6F0E4', flaeche: '#0A1033', markiert: MARKIERT_DUNKEL },
    druck: { marke: '#111D6D', flaeche: '#FFFFFF', markiert: MARKIERT },
  },
  navy: {
    hell: { marke: '#F6F0E4', flaeche: '#111D6D', markiert: MARKIERT },
    dunkel: { marke: '#F6F0E4', flaeche: '#16237A', markiert: MARKIERT_DUNKEL },
    druck: { marke: '#111D6D', flaeche: '#FFFFFF', markiert: MARKIERT },
  },
});

type Farben = { marke: string; flaeche: string; markiert: string };
type Umgebung = keyof typeof BUERO_SVG_FARBEN;

const L = TOKENS.linien;
const vars = (f: Farben) => `--b:${f.marke};--fl:${f.flaeche};--w:${f.markiert}`;

/**
 * Linienarten wie technik.module.css: non-scaling-stroke, stumpfe Enden (keine Leitung in diesen Zeichnungen), Kontur
 * mit runden Ecken, feine und Maßlinien spitz; Flächen Papier, Markierfläche oder Marke.
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
    '.w{fill:var(--w)}',
  ].join('');
}

/** Klassen der Datei je Linienart (Gegenstück der Klassen der Komponente). */
export const DATEI_KLASSE: Readonly<Record<Art, string>> = Object.freeze({
  kontur: 'k fl',
  konturOffen: 'k',
  fein: 'f',
  mass: 'm',
  voll: 'vo',
  markiert: 'k w',
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
