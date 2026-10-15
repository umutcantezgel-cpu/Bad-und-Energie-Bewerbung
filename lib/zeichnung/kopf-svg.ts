/**
 * Zeichnungen des Stellenkopfs als eigene SVG-Dateien (Prüfung E-029, Runde 3, Leistung): Das Anlagenschema
 * (Anlagenmechaniker, Ausbildung) und der kleine Hausschnitt (übrige Stellen außer Kundendienst) stehen nur ab 64em
 * im Navy-Panel. Inline lagen sie trotzdem in jedem Dokument, zweimal (HTML und RSC-Nutzlast), und hoben es am Handy
 * über die Slow-Start-Grenze (LCP +225/+234 ms). Als Datei, per `<img loading="lazy">` eingebunden, lädt der Browser
 * sie nicht, solange ihr Behälter `display: none` hat.
 *
 * Dieselbe Geometrie wie die Komponenten (components/zeichnung/technik/Anlagenschema.tsx, Hausschnitt.tsx), aus
 * denselben Modulen, hier als Text mit festen Farben: Ein SVG im `<img>` erbt weder Rollen noch Schriften der Seite.
 * Die Farben sind die Rollen des Inverse-Bands (app/styles/theme.css), hell und dunkel per prefers-color-scheme, im
 * Druck die hellen. Die Beschriftung des Anlagenschemas steht als HTML über dem Bild (components/jobs/stelle/
 * Kopfbild.tsx), in der Schrift der Seite. Ausgeliefert über app/zeichnung/[datei]/route.ts (statisch beim Build);
 * der Dateiname trägt einen Hash des Inhalts, weil SVG-Dateien ein Jahr gecacht werden (next.config.ts).
 * Prüfung: lib/zeichnung/__tests__/kopf-svg.test.ts (gleiche Geometrie wie die Komponenten).
 */
import { createHash } from 'node:crypto';
import { TOKENS } from '@/lib/tokens';
import { COMPRESS_AW_S } from './geraete/compress-aw-s';
import { vorderansicht } from './geraete/ansicht';
import { r1, schraffurLinien, type Medium } from './norm';
import {
  ANLAGENSCHEMA_BEREICHE,
  ANLAGENSCHEMA_KAELTE,
  ANLAGENSCHEMA_LEITUNGEN,
  ANLAGENSCHEMA_PFEILE,
  ANLAGENSCHEMA_RAHMEN,
  ANLAGENSCHEMA_SYMBOLE,
} from './szenen/anlagenschema';
import {
  BAUTEILE,
  GERAET_LAGE,
  HAUSSCHNITT_RAHMEN,
  HEIZKOERPER_LAGE,
  INNENEINHEIT_LAGE,
  LEITUNGEN,
  PFEILE,
} from './szenen/hausschnitt';
import { SYMBOLE, type Lage, type SymbolForm, type SymbolId } from './symbole';

/**
 * Rollen des Inverse-Bands, in dem der Stellenkopf steht (app/styles/theme.css, Primitive): Marke und Kontur Creme,
 * Fläche Navy (dunkles Thema: das hellere Band-Navy), Schnittflächen eine Stufe heller, Schraffur in line-strong,
 * Leitungen in den hellen Linienfarben. Druck: die hellen Rollen des Papiers.
 */
export const KOPF_SVG_FARBEN = Object.freeze({
  hell: { marke: '#F6F0E4', flaeche: '#111D6D', schnitt: '#1A2878', schraffur: '#8E97D6', vorlauf: '#FF6B5F', ruecklauf: '#86AEFF' },
  dunkel: { marke: '#F6F0E4', flaeche: '#16237A', schnitt: '#1E2C86', schraffur: '#8E97D6', vorlauf: '#FF6B5F', ruecklauf: '#86AEFF' },
  druck: { marke: '#111D6D', flaeche: '#FFFFFF', schnitt: '#F1E9DB', schraffur: '#6B74A6', vorlauf: '#D60000', ruecklauf: '#1F57C4' },
});

type Farben = (typeof KOPF_SVG_FARBEN)['hell'];

const L = TOKENS.linien;
const vars = (f: Farben) =>
  `--b:${f.marke};--fl:${f.flaeche};--sn:${f.schnitt};--sr:${f.schraffur};--vl:${f.vorlauf};--rl:${f.ruecklauf}`;

/**
 * Linienarten wie technik.module.css (gleiche Reihenfolge, damit die Kaskade gleich wirkt): non-scaling-stroke, stumpfe
 * Enden, Konturen spitz, Leitungen rund; Stärken und Muster aus lib/tokens. `pfeil`: Faktoren der Fließpfeile je Breite
 * des Bilds wie `.anlagenBild` (im `<img>` gelten Medienabfragen für die Breite des Bilds).
 */
function stil(pfeil: boolean): string {
  const regeln = [
    `svg{${vars(KOPF_SVG_FARBEN.hell)}}`,
    `@media screen and (prefers-color-scheme:dark){svg{${vars(KOPF_SVG_FARBEN.dunkel)}}}`,
    `@media print{svg{${vars(KOPF_SVG_FARBEN.druck)}}}`,
    '.l,.k,.f,.v,.m,.s{fill:none;stroke-linecap:butt;vector-effect:non-scaling-stroke}',
    `.k{stroke:var(--b);stroke-width:${L.kontur}px;stroke-linejoin:miter}`,
    `.f{stroke:var(--b);stroke-width:${L.fein}px;stroke-linejoin:miter}`,
    `.v{stroke:var(--b);stroke-width:${L.verdeckt}px;stroke-dasharray:${L.verdecktMuster.join(' ')};stroke-linejoin:miter}`,
    `.m{stroke:var(--b);stroke-width:${L.mittellinie}px;stroke-dasharray:${L.mittellinieMuster.join(' ')};stroke-linejoin:miter}`,
    `.s{stroke:var(--sr);stroke-width:${L.fein}px}`,
    `.l{stroke-width:${L.leitung}px;stroke-linejoin:round}`,
    '.vl{stroke:var(--vl)}',
    '.rl{stroke:var(--rl)}',
    '.km{stroke:var(--b)}',
    '.fl{fill:var(--fl)}',
    '.sn{fill:var(--sn)}',
    '.vo{fill:var(--b);stroke:none}',
    '.pv{fill:var(--vl)}',
    '.pr{fill:var(--rl)}',
    '.pk{fill:var(--b)}',
  ];
  if (pfeil) {
    regeln.push(
      '.p{scale:var(--pfeil,1)}',
      'svg{--pfeil:1.6}',
      '@media (max-width:40rem){svg{--pfeil:2.45}}',
      '@media (max-width:26rem){svg{--pfeil:3.6}}',
    );
  }
  return regeln.join('');
}

const LEITUNG: Record<Medium, string> = { vorlauf: 'vl', ruecklauf: 'rl', kaeltemittel: 'km' };
const PFEIL: Record<Medium, string> = { vorlauf: 'pv', ruecklauf: 'pr', kaeltemittel: 'pk' };

const pfad = (d: string, klasse: string, extra = '') => `<path d="${d}" class="${klasse}"${extra}/>`;
const rechteck = (x: number, y: number, breite: number, hoehe: number, klasse: string, extra = '') =>
  `<rect x="${x}" y="${y}" width="${breite}" height="${hoehe}" class="${klasse}"${extra}/>`;

/** Normsymbol wie components/zeichnung/technik/Symbol.tsx: Kontur mit Fläche, Fein-Linien, gefüllte Teile. */
function symbol(id: SymbolId, { x, y, drehung = 0, massstab = 1 }: Lage): string {
  const transform = [`translate(${x} ${y})`, drehung ? `rotate(${drehung})` : '', massstab !== 1 ? `scale(${massstab})` : '']
    .filter(Boolean)
    .join(' ');
  const form = (f: SymbolForm) => {
    const klasse = 'fein' in f && f.fein ? 'f' : 'k fl';
    if ('d' in f) return pfad(f.d, f.voll ? 'k vo' : klasse);
    if ('cx' in f) return `<circle cx="${f.cx}" cy="${f.cy}" r="${f.r}" class="${klasse}"/>`;
    return rechteck(f.x, f.y, f.width, f.height, klasse, f.rx !== undefined ? ` rx="${f.rx}"` : '');
  };
  return `<g transform="${transform}">${SYMBOLE[id].formen.map(form).join('')}</g>`;
}

const dokument = (viewBox: string, breite: number, hoehe: number, pfeil: boolean, inhalt: string[]) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${breite}" height="${hoehe}"><style>${stil(pfeil)}</style>${inhalt.join('')}</svg>`;

/**
 * Anlagenschema statisch, ohne Beschriftung (die steht als HTML darüber) und ohne Legende: Erdreich, Gelände, Wand mit
 * Wanddurchführung, Außen- und Inneneinheit, Leitungen in Fließrichtung, feste Fließpfeile, Symbole.
 */
export function anlagenschemaSvg(): string {
  const { breite, hoehe } = ANLAGENSCHEMA_RAHMEN;
  const b = ANLAGENSCHEMA_BEREICHE;
  return dokument(`0 0 ${breite} ${hoehe}`, breite, hoehe, true, [
    pfad(schraffurLinien(0, b.gok, b.wand.x, hoehe, 14), 's'),
    pfad(`M0 ${b.gok}H${b.wand.x}`, 'k'),
    rechteck(b.wand.x, b.wand.y, b.wand.breite, b.wand.hoehe, 'k sn'),
    rechteck(b.durchfuehrung.x, b.durchfuehrung.y, b.durchfuehrung.breite, b.durchfuehrung.hoehe, 'k fl'),
    rechteck(b.aussen.x, b.aussen.y, b.aussen.breite, b.aussen.hoehe, 'k'),
    rechteck(b.innen.x, b.innen.y, b.innen.breite, b.innen.hoehe, 'm'),
    ...[...ANLAGENSCHEMA_KAELTE, ...ANLAGENSCHEMA_LEITUNGEN].map((w) => pfad(w.d, `l ${LEITUNG[w.medium]}`)),
    ...ANLAGENSCHEMA_PFEILE.map((p) => pfad(p.d, `${PFEIL[p.medium]} p`, ` style="transform-origin:${p.spitze.x}px ${p.spitze.y}px"`)),
    ...ANLAGENSCHEMA_SYMBOLE.map((s) => symbol(s.id, s.lage)),
  ]);
}

/** Ausschnitt des kleinen Hausschnitts wie HausschnittKlein: ohne Himmel und ohne linken Rand. */
export const KOPF_HAUS_VIEWBOX = Object.freeze({ x: 60, y: 0, breite: HAUSSCHNITT_RAHMEN.breite - 40, hoehe: HAUSSCHNITT_RAHMEN.hoehe });

/**
 * Kleiner Hausschnitt wie HausschnittKlein (ohne Leitungen zur Bewerbung, ohne Bewegung): Erdreich, Rohrgraben,
 * Schotter, Kiesbett, Haus im Schnitt, Außeneinheit (einfache Detailstufe, 1 : 10 eingesetzt), Sockel, Kondensatrohr,
 * Wanddurchführung, Inneneinheit mit Pumpe, Flachheizkörper, Leitungen (verdeckt und sichtbar) und feste Pfeile.
 */
export function hausschnittSvg(): string {
  const v = KOPF_HAUS_VIEWBOX;
  const g = GERAET_LAGE;
  const ie = INNENEINHEIT_LAGE;
  const hk = HEIZKOERPER_LAGE;
  const a = vorderansicht(COMPRESS_AW_S, { detail: 'einfach', massketten: false });
  const lamellen = Array.from({ length: hk.lamellen }, (_, i) => r1(hk.x + ((i + 1) * hk.breite) / (hk.lamellen + 1)));
  const leitungen = LEITUNGEN.filter((l) => !l.nur);
  return dokument(`${v.x} ${v.y} ${v.breite} ${v.hoehe}`, v.breite, v.hoehe, false, [
    pfad(BAUTEILE.schraffur, 's'),
    pfad(BAUTEILE.graben, 'f fl'),
    pfad(BAUTEILE.schotter, 'f fl'),
    pfad(BAUTEILE.schotterSchraffur, 's'),
    pfad(BAUTEILE.kiesbett, 'f fl'),
    pfad(BAUTEILE.kiesbettSchraffur, 's'),
    pfad(BAUTEILE.dach, 'k sn'),
    pfad(BAUTEILE.decke, 'k sn'),
    pfad(BAUTEILE.bodenplatte, 'k sn'),
    ...BAUTEILE.waende.map((d) => pfad(d, 'k sn')),
    pfad(BAUTEILE.gelaende, 'k'),
    `<svg x="${g.x}" y="${g.y}" width="${g.breite}" height="${g.hoehe}" viewBox="0 0 ${a.breite} ${a.hoehe}" overflow="visible">`,
    ...a.kontur.map((d) => pfad(d, 'k fl')),
    ...a.fein.map((d) => pfad(d, 'f')),
    ...a.kreise.map((k) => `<circle cx="${k.cx}" cy="${k.cy}" r="${k.r}" class="${k.art === 'fein' ? 'f' : 'k'}"/>`),
    a.rotor ? pfad(a.rotor.blaetter, 'f', ` transform="translate(${a.rotor.cx} ${a.rotor.cy})"`) : '',
    '</svg>',
    ...BAUTEILE.sockel.map((d) => pfad(d, 'k sn')),
    pfad(BAUTEILE.kondensat, 'f fl'),
    pfad(BAUTEILE.durchfuehrung, 'k fl'),
    rechteck(ie.x, ie.y, ie.breite, ie.hoehe, 'm fl'),
    symbol('pumpe', { x: ie.pumpe.x, y: ie.pumpe.y, massstab: 1.4 }),
    rechteck(hk.x, hk.y, hk.breite, hk.hoehe, 'k fl'),
    pfad(lamellen.map((x) => `M${x} ${hk.y}V${hk.y + hk.hoehe}`).join(''), 'f'),
    ...leitungen.filter((l) => l.verdeckt).map((l) => pfad(l.d, `v ${LEITUNG[l.medium]}`)),
    ...leitungen.filter((l) => !l.verdeckt).map((l) => pfad(l.d, `l ${LEITUNG[l.medium]}`)),
    ...PFEILE.filter((p) => !p.nur).map((p) => pfad(p.d, PFEIL[p.medium])),
  ]);
}

export type KopfSvgArt = 'anlagenschema' | 'hausschnitt';

const ERZEUGT: Record<KopfSvgArt, () => string> = { anlagenschema: anlagenschemaSvg, hausschnitt: hausschnittSvg };
const inhalte = new Map<KopfSvgArt, string>();
const inhalt = (art: KopfSvgArt) => {
  if (!inhalte.has(art)) inhalte.set(art, ERZEUGT[art]());
  return inhalte.get(art)!;
};

/** Dateiname mit den ersten 10 Zeichen des SHA-256 über den Inhalt: Ändert sich die Zeichnung, ändert sich der Name. */
export function kopfSvgDatei(art: KopfSvgArt): string {
  return `${art}-${createHash('sha256').update(inhalt(art)).digest('hex').slice(0, 10)}.svg`;
}

/** Pfad der Datei auf der Website (app/zeichnung/[datei]/route.ts). */
export function kopfSvgPfad(art: KopfSvgArt): string {
  return `/zeichnung/${kopfSvgDatei(art)}`;
}

/** Alle Dateien mit Inhalt, für generateStaticParams und den Route-Handler. */
export function kopfSvgDateien(): Array<{ datei: string; art: KopfSvgArt; svg: string }> {
  return (Object.keys(ERZEUGT) as KopfSvgArt[]).map((art) => ({ datei: kopfSvgDatei(art), art, svg: inhalt(art) }));
}
