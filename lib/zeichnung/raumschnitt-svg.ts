/**
 * Raumschnitt als SVG-Datei (Prüfrunde 1 C1-6, wie lib/zeichnung/kopf-svg.ts): Die Abbildung „So verteilt sich die
 * Wärme im Raum“ steht weit unter dem ersten Bildschirm der Wärmepumpen-Seite. Inline lagen ihre Wände, der
 * Fußbodenaufbau und die Rohre zweimal im Dokument (HTML und RSC-Nutzlast) und machten es schwerer als vor E-031
 * (LCP schlechter, K-013). Als Datei per `<img loading="lazy">` lädt der Browser sie erst, wenn die Abbildung
 * näherkommt; die Bänder des Wärmefelds liegen als eigene Dateien darunter (lib/zeichnung/waerme/dateien.ts).
 *
 * Dieselbe Geometrie wie bisher die Komponente (lib/zeichnung/szenen/raumschnitt.ts), mit festen Farben: Ein SVG im
 * `<img>` erbt keine Rollen. Die Abbildung steht auf Papier (Wärmepumpen-Seite, Abschnitt Technik): Farben = Rollen
 * brand, surface, surface-2, vorlauf, ruecklauf hell, dunkel (prefers-color-scheme) und im Druck; der Wärmebereich um
 * den Heizkörper hat auf Papier dieselben Rollen. Linienarten wie technik.module.css. Prüfung:
 * components/zeichnung/waerme/__tests__/waerme.test.ts (Geometrie, Farben gegen app/styles/theme.css).
 */
import { createHash } from 'node:crypto';
import { TOKENS } from '@/lib/tokens';
import { FUSSBODEN_ROHRE, RAUM_BAUTEILE, RAUM_HEIZKOERPER, RAUMSCHNITT_RAHMEN } from './szenen/raumschnitt';
import { WAERMEFELD_AN } from './waerme/schalter';

export type RaumschnittArt = 'heizkoerper' | 'fussboden';
export const RAUMSCHNITT_ARTEN: readonly RaumschnittArt[] = Object.freeze(['heizkoerper', 'fussboden']);

/** Rollen des Papiers (app/styles/theme.css): Marke, Fläche, Schnittfläche (surface-2), Vorlauf, Rücklauf. */
export const RAUMSCHNITT_SVG_FARBEN = Object.freeze({
  hell: { marke: '#111D6D', flaeche: '#FBF7F0', schnitt: '#F1E9DB', vorlauf: '#D60000', ruecklauf: '#1F57C4' },
  dunkel: { marke: '#F6F0E4', flaeche: '#0A1033', schnitt: '#131B4A', vorlauf: '#FF6B5F', ruecklauf: '#86AEFF' },
  druck: { marke: '#111D6D', flaeche: '#FFFFFF', schnitt: '#F1E9DB', vorlauf: '#D60000', ruecklauf: '#1F57C4' },
});

/**
 * Rand um den Rahmen (Einheiten): Ein Bild schneidet am viewBox ab; die Konturen der äußeren Wände ragen um den halben
 * Strich darüber (inline lag die Zeichnung mit overflow: visible). Die Komponente setzt das Bild um diesen Rand größer.
 */
export const RAUMSCHNITT_RAND = 2;

/** Lage des Bilds im Rahmen der Abbildung (Prozent): um RAUMSCHNITT_RAND nach außen erweitert. */
export function raumschnittBildLage(): { left: string; top: string; width: string; height: string } {
  const R = RAUMSCHNITT_RAHMEN;
  const m = RAUMSCHNITT_RAND;
  const pct = (wert: number) => `${Math.round(wert * 100_000) / 1000}%`;
  return { left: pct(-m / R.breite), top: pct(-m / R.hoehe), width: pct((R.breite + 2 * m) / R.breite), height: pct((R.hoehe + 2 * m) / R.hoehe) };
}

type Farben = (typeof RAUMSCHNITT_SVG_FARBEN)['hell'];
const vars = (f: Farben) => `--b:${f.marke};--fl:${f.flaeche};--sn:${f.schnitt};--vl:${f.vorlauf};--rl:${f.ruecklauf}`;
const L = TOKENS.linien;

/** Linienarten wie technik.module.css (Reihenfolge wie dort: Flächen nach den Strichen). */
const STIL = [
  `svg{${vars(RAUMSCHNITT_SVG_FARBEN.hell)}}`,
  `@media screen and (prefers-color-scheme:dark){svg{${vars(RAUMSCHNITT_SVG_FARBEN.dunkel)}}}`,
  `@media print{svg{${vars(RAUMSCHNITT_SVG_FARBEN.druck)}}}`,
  '.k,.f,.l{fill:none;stroke-linecap:butt;vector-effect:non-scaling-stroke}',
  `.k{stroke:var(--b);stroke-width:${L.kontur}px;stroke-linejoin:round}`,
  `.f{stroke:var(--b);stroke-width:${L.fein}px;stroke-linejoin:miter}`,
  `.l{stroke-width:${L.leitung}px;stroke-linecap:round;stroke-linejoin:round}`,
  '.vl{stroke:var(--vl)}',
  '.rl{stroke:var(--rl)}',
  '.fl{fill:var(--fl)}',
  '.sn{fill:var(--sn)}',
].join('');

/**
 * SVG des Raums: Wände und Decke geschnitten, Fußbodenaufbau (Estrich, Dämmung, Rohdecke angeschnitten); mit
 * Heizkörper von der Seite (ohne Fläche, die Bänder darunter zeigen seine Temperatur; ohne Wärmefeld mit Fläche) oder
 * mit den Rohren der Fußbodenheizung im Estrich, Vorlauf und Rücklauf im Wechsel.
 */
export function raumschnittSvg(art: RaumschnittArt): string {
  const R = RAUMSCHNITT_RAHMEN;
  const m = RAUMSCHNITT_RAND;
  const hk = RAUM_HEIZKOERPER;
  const teile = [
    ...RAUM_BAUTEILE.waende.map((d) => `<path d="${d}" class="k sn"/>`),
    `<path d="${RAUM_BAUTEILE.decke}" class="k sn"/>`,
    `<path d="${RAUM_BAUTEILE.rohdecke}" class="k sn"/>`,
    `<path d="${RAUM_BAUTEILE.daemmung}" class="f fl"/>`,
    `<path d="${RAUM_BAUTEILE.estrich}" class="k fl"/>`,
    ...(art === 'heizkoerper'
      ? [`<rect x="${hk.x}" y="${hk.y}" width="${hk.breite}" height="${hk.hoehe}" class="${WAERMEFELD_AN ? 'k' : 'k fl'}"/>`]
      : FUSSBODEN_ROHRE.map((r) => `<circle cx="${r.x}" cy="${r.y}" r="${r.r}" class="l ${r.medium === 'vorlauf' ? 'vl' : 'rl'}"/>`)),
  ];
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${R.x - m} ${R.y - m} ${R.breite + 2 * m} ${R.hoehe + 2 * m}" ` +
    `width="${R.breite + 2 * m}" height="${R.hoehe + 2 * m}">` +
    `<style>${STIL}</style>${teile.join('')}</svg>\n`
  );
}

const inhalte = new Map<RaumschnittArt, string>();
const inhalt = (art: RaumschnittArt) => {
  if (!inhalte.has(art)) inhalte.set(art, raumschnittSvg(art));
  return inhalte.get(art)!;
};

/** Dateiname mit den ersten 10 Zeichen des SHA-256 über den Inhalt. */
export function raumschnittDatei(art: RaumschnittArt): string {
  return `raumschnitt-${art}-${createHash('sha256').update(inhalt(art)).digest('hex').slice(0, 10)}.svg`;
}

/** Pfad der Datei auf der Website. */
export function raumschnittPfad(art: RaumschnittArt): string {
  return `/zeichnung/${raumschnittDatei(art)}`;
}

/** Beide Dateien mit Inhalt, für generateStaticParams und den Route-Handler. */
export function raumschnittDateien(): Array<{ datei: string; svg: string }> {
  return RAUMSCHNITT_ARTEN.map((art) => ({ datei: raumschnittDatei(art), svg: inhalt(art) }));
}
