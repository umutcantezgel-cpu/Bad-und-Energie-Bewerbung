// SVG-Bausteine der Szene: Isothermen-Bänder (statischer Ersatz) und Strichzeichnung.
// Klassen statt Farben, damit Hell, Dunkel und Druck über Tokens laufen.
import { W, H, HAUS, PUMPE, HEIZKOERPER, WANNE, FBH, UHR, LEITUNG, ZONEN, dachAussen } from './szene.mjs';

const f = (v) => String(Math.round(v * 10) / 10);
const poly = (pts) => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L');

/** Bänder: kältestes zuerst; jedes Band ist die Region T ≥ Schwelle (gestapelt wie Isothermen). */
export function baenderSvg(baender) {
  return baender.map((d, k) => `<path class="wb-band wb-band--${k + 1}" data-band="${k + 1}" d="${d}"/>`).join('\n');
}

/** Hausumriss außen (Dach mit Überstand, Wände bis zum Boden), rechts angeschnitten. */
export function hausUmriss() {
  const h = HAUS;
  const ue = h.ueberstand;
  const yUe = dachAussen(h.links - ue);
  return {
    dach: `M${h.links - ue} ${yUe}L${h.firstX} ${h.firstY}L${h.rechts + ue} ${dachAussen(h.rechts + ue)}`,
    dachInnen: `M${h.links} ${h.traufeY + h.dach - 0}L${h.firstX} ${h.firstY + h.dach}L${h.rechts} ${h.traufeY + h.dach}`,
    waende: `M${h.links} ${h.traufeY + 4}V${h.boden}M${h.links + h.wand} ${h.traufeY + h.dach}V${h.estrichY}`,
  };
}

/** Gemeinsame Bausteine der Zeichnung und der bewegten Ebene. */
function teile() {
  const h = HAUS, p = PUMPE, hk = HEIZKOERPER, wa = WANNE, u = UHR;
  const u_ = hausUmriss();
  const rippen = [];
  for (let r = 1; r < hk.rippen; r++) {
    const x = hk.x + (hk.w * r) / hk.rippen;
    rippen.push(`M${f(x)} ${hk.y + 8}V${hk.y + hk.h - 8}`);
  }
  const fbh = [];
  for (let x = FBH.von; x <= FBH.bis + 0.1; x += FBH.abstand) fbh.push(`<circle cx="${f(x)}" cy="${FBH.y}" r="${FBH.r}"/>`);
  // Uhr 13:30: Stundenzeiger auf halb zwei (45°, Richtung Dachneigung), Minutenzeiger nach unten
  const stunde = (1.5 / 12) * 2 * Math.PI;
  const sx = u.x + Math.sin(stunde) * (u.r * 0.52), sy = u.y - Math.cos(stunde) * (u.r * 0.52);
  const striche = [0, 3, 6, 9].map((s) => {
    const a = (s / 12) * 2 * Math.PI;
    return `M${f(u.x + Math.sin(a) * (u.r - 4))} ${f(u.y - Math.cos(a) * (u.r - 4))}L${f(u.x + Math.sin(a) * (u.r - 10))} ${f(u.y - Math.cos(a) * (u.r - 10))}`;
  }).join('');
  // Leitungen: je Rohr ein Mantel in der Seitenfarbe (Kontrast auf Navy und auf hellen Isothermen) und das Rohr selbst
  const rohre = [
    ['rl', 'rlHeiz'], ['rl', 'rlBad'], ['rl', 'rlUnten'],
    ['vl', 'vlHeiz'], ['vl', 'vlBad'], ['vl', 'vlUnten'], ['vl', 'knopfQuer'],
  ];
  const zusatz = (k) => (k === 'knopfQuer' ? ' wb-nur-desktop' : '');
  const motion = (art) => (art === 'vl' ? 'vorlauf' : 'ruecklauf');
  // Mantel ruht (er ist zugleich das leere Rohr der Blaupause); nur das Rohr zeichnet sich
  const mantel = rohre.map(([art, k]) => ` <path class="wb-mantel wb-mantel--${art}${zusatz(k)}" d="${poly(LEITUNG[k])}"/>`).join('\n');
  // Messfelder (Zeigen): Eckwinkel um die drei Zonen, wie das Messfeld einer Wärmebildkamera
  const ecken = ({ x0, x1, y0, y1 }, e = 18) => `M${x0} ${y0 + e}V${y0}H${x0 + e}M${x1 - e} ${y0}H${x1}V${y0 + e}M${x1} ${y1 - e}V${y1}H${x1 - e}M${x0 + e} ${y1}H${x0}V${y1 - e}`;
  const messfelder = ZONEN.map((z, k) => ` <g class="wb-messfeld" data-zone="${k}"><path class="wb-messfeld__mantel" d="${ecken(z)}"/><path class="wb-messfeld__strich" d="${ecken(z)}"/></g>`).join('\n');
  const rohr = rohre.map(([art, k]) => ` <path class="wb-${art}${zusatz(k)}" pathLength="1" data-motion="${motion(art)}" d="${poly(LEITUNG[k])}"/>`).join('\n');
  const r1 = u.r + 12; // Fadenkreuz-Ring
  // Innenleben (Decke, Estrich, Innenwand, Pumpe, Heizkörper, Wanne): Navy auf den hellen Isothermen,
  // dieselben Linien in Creme als Blaupause im kalten Startbild
  const innen = (kl) => [
    `M${h.links + h.wand} ${h.traufeY + h.dach}H${h.rechts - h.wand}M${h.links + h.wand} ${h.estrichY}H${h.rechts - h.wand}M${h.innenwandX} ${h.traufeY + h.dach}V${h.estrichY}M${h.innenwandX + h.innenwandD} ${h.traufeY + h.dach}V${h.estrichY}`,
    `M${p.x + p.r} ${p.y}H${p.x + p.w - p.r}A${p.r} ${p.r} 0 0 1 ${p.x + p.w} ${p.y + p.r}V${p.y + p.h}H${p.x}V${p.y + p.r}A${p.r} ${p.r} 0 0 1 ${p.x + p.r} ${p.y}Z`,
    `M${hk.x + 6} ${hk.y}H${hk.x + hk.w - 6}A6 6 0 0 1 ${hk.x + hk.w} ${hk.y + 6}V${hk.y + hk.h - 6}A6 6 0 0 1 ${hk.x + hk.w - 6} ${hk.y + hk.h}H${hk.x + 6}A6 6 0 0 1 ${hk.x} ${hk.y + hk.h - 6}V${hk.y + 6}A6 6 0 0 1 ${hk.x + 6} ${hk.y}Z${rippen.join('')}`,
    `M${wa.x + wa.r} ${wa.y}H${wa.x + wa.w - wa.r}A${wa.r} ${wa.r} 0 0 1 ${wa.x + wa.w - wa.r} ${wa.y + wa.h}H${wa.x + wa.r}A${wa.r} ${wa.r} 0 0 1 ${wa.x + wa.r} ${wa.y}ZM${wa.x + 18} ${wa.y - 26}V${wa.y}M${wa.x + 10} ${wa.y - 26}H${wa.x + 26}`,
  ].map((d) => ` <path class="${kl}" d="${d}"/>`).join('\n');
  return { h, p, u, u_, fbh, striche, sx, sy, rohre, zusatz, mantel, rohr, messfelder, innen, r1 };
}

/** Ruhende Zeichnung (role="img"): Haus, Innenleben, Pumpe, Uhr, Messfelder. */
export function linienSvg() {
  const { h, p, u, u_, fbh, striche, sx, sy, messfelder, innen } = teile();
  return `
<g class="wb-kalt">
 <path class="wb-strich" d="${u_.dach}"/>
 <path class="wb-strich" d="M${h.links} ${dachAussen(h.links)}V${h.boden}M${h.rechts} ${dachAussen(h.rechts)}V${h.boden}"/>
 <path class="wb-strich" d="M0 ${h.boden}H${W + 1200}"/>
 <circle class="wb-strich" cx="${p.lx}" cy="${p.ly}" r="${p.lr}"/>
</g>
<g class="wb-innen">
${innen('wb-fein')}
 <g class="wb-fbh">${fbh.join('')}</g>
</g>
<g class="wb-heiss">
 <path class="wb-luefter" d="M${p.lx} ${p.ly}c-6-10-4-19 3-25M${p.lx} ${p.ly}c11 1 18 7 18 16M${p.lx} ${p.ly}c-6 9-15 12-22 8"/>
</g>
<g class="wb-uhr" data-fakt="friday1330">
 <circle class="wb-uhr__blatt" cx="${u.x}" cy="${u.y}" r="${u.r}"/>
 <path class="wb-uhr__striche" d="${striche}"/>
 <path class="wb-uhr__zeiger" d="M${u.x} ${u.y}L${f(sx)} ${f(sy)}M${u.x} ${u.y}V${u.y + u.r * 0.74}"/>
 <circle class="wb-uhr__achse" cx="${u.x}" cy="${u.y}" r="3"/>
</g>
<g class="wb-messfelder">
${messfelder}
</g>
`;
}

/** Bewegte Ebene (eigenes SVG über der Zeichnung): Mantel der Rohre (ruhend), Blaupause, Messpunkt,
 *  Maßlinie und die Rohre selbst. Nur diese kleine Ebene wird während des Auftakts neu gezeichnet. */
export function rohreSvg() {
  const { u, mantel, rohr, innen, rohre, zusatz, r1 } = teile();
  return `
<g class="wb-mantel-gruppe">
${mantel}
</g>
<g class="wb-kalt-rohre" data-motion="blaupause">
 ${rohre.map(([, k]) => `<path class="wb-kalt-rohr${zusatz(k)}" d="${poly(LEITUNG[k])}"/>`).join('')}
${innen('wb-kalt-rohr')}
</g>
<g class="wb-messpunkt" data-fakt="friday1330" data-motion="messpunkt">
 <circle class="wb-fadenkreuz" cx="${u.x}" cy="${u.y}" r="${r1}"/>
 <path class="wb-fadenkreuz" d="M${u.x} ${u.y - u.r - 20}V${u.y - u.r - 6}M${u.x} ${u.y + u.r + 6}V${u.y + u.r + 20}M${u.x - u.r - 20} ${u.y}H${u.x - u.r - 6}M${u.x + u.r + 6} ${u.y}H${u.x + u.r + 20}"/>
</g>
<path class="wb-leiter" pathLength="1" data-motion="massline" d="M${f(u.x - r1 * Math.SQRT1_2)} ${f(u.y - r1 * Math.SQRT1_2)}L232 300"/>
<g class="wb-leitungen">
${rohr}
</g>`;
}

export const FARBEN = {
  kalt: '#111D6D',
  b1: '#1F57C4',
  b2: '#F1E9DB',
  b3: '#FADCC9',
  b4: '#FBF7F0',
  creme: '#FBF7F0',
};

/** Eigenständiges Vorschau-SVG (nur für bau/vorschau). */
export function vorschauSvg(baender, { bandFarben = [FARBEN.b1, FARBEN.b2, FARBEN.b3, FARBEN.b4], kalt = false } = {}) {
  const css = `
.wb-band{stroke:none}
${bandFarben.map((c, k) => `.wb-band--${k + 1}{fill:${c}}`).join('')}
.wb-strich{fill:none;stroke:${FARBEN.creme};stroke-width:3;stroke-linejoin:round;stroke-linecap:round}
.wb-fein{fill:none;stroke:${FARBEN.kalt};stroke-width:3;stroke-linejoin:round;stroke-linecap:round}
.wb-fbh circle{fill:none;stroke:${FARBEN.kalt};stroke-width:2}
.wb-rippen{fill:none;stroke:${FARBEN.creme};stroke-width:3;stroke-linecap:round}
.wb-luefter{fill:none;stroke:${FARBEN.creme};stroke-width:3;stroke-linecap:round}
.wb-uhr__blatt{fill:${FARBEN.creme};stroke:${FARBEN.kalt};stroke-width:3}
.wb-uhr__striche,.wb-uhr__zeiger{fill:none;stroke:${FARBEN.kalt};stroke-width:3;stroke-linecap:round}
.wb-uhr__achse{fill:${FARBEN.kalt}}
.wb-vl{fill:none;stroke:${FARBEN.b4};stroke-width:4;stroke-linejoin:round;stroke-linecap:round}
.wb-rl{fill:none;stroke:${FARBEN.b1};stroke-width:4;stroke-linejoin:round;stroke-linecap:round}
${kalt ? '.wb-band{display:none}.wb-vl,.wb-rl{display:none}' : ''}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${css}</style><rect width="${W}" height="${H}" fill="${FARBEN.kalt}"/>${baenderSvg(baender)}${linienSvg()}</svg>`;
}
