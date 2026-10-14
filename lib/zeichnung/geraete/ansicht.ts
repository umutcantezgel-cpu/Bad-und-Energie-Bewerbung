/**
 * Ansichten eines Außengeräts als Geometrie (KERN K-010, E-029): Vorderansicht und Seitenansicht (von rechts) in
 * Millimetern, abgeleitet allein aus dem Geräte-Modul (compress-aw-s.ts bzw. compress-aw-l.ts). Website
 * (components/zeichnung/technik/Aussengeraet.tsx), Hausschnitt (lib/zeichnung/szenen/hausschnitt.ts) und
 * Teilen-Bilder (lib/seo/og-render.tsx) zeichnen dieselben Pfade.
 *
 * Neutrale Fassung: Gehäuse mit gerundeter Oberkante, runde Ausblasöffnung mit konzentrischem Schutzgitter, dahinter
 * ein allgemeiner Axialrotor mit vier Sichelblättern, Verdampfer als verdeckte Linie, Bodenhalterungen, Anschlüsse,
 * Kondensatablauf. Kein Logo, kein Anker, kein gestufter Ring-Diffusor (lib/zeichnung/marke.ts).
 *
 * Koordinaten: 1 Einheit = 1 mm. Vorderansicht mit Ursprung oben links am Gehäuse; Seitenansicht mit der Front bei
 * x = 0 und der Rückseite bei x = Tiefe. y wächst nach unten; die Unterkante des Gehäuses liegt bei y = Höhe, der
 * Boden unter den Halterungen bei y = Höhe + Halterung.
 */
import { masslinie, r1, type Masslinie, type Punkt } from '../norm';
import type { Aussengeraet } from './typen';

export type AnsichtId = 'vorne' | 'seite';

/** Detailstufe: `voll` für Gerätezeichnungen, `einfach` für kleine Maßstäbe (Hausschnitt 1 Einheit = 10 mm). */
export type Detail = 'voll' | 'einfach';

/** Welche Maßketten: `haupt` (Außenmaße), `voll` (dazu Halterungen, Anschlüsse, Kondensat), keine. */
export type Massketten = 'haupt' | 'voll' | false;

export interface Rotor {
  cx: number;
  cy: number;
  /** Außenradius der Blätter. */
  r: number;
  nabe: number;
  /** Vier Sichelblätter als ein Pfad (um den Mittelpunkt des Rotors, lokal 0 | 0). */
  blaetter: string;
}

export interface Ansicht {
  ansicht: AnsichtId;
  /** Gehäusemaße der Ansicht (Breite bzw. Tiefe × Höhe). */
  breite: number;
  hoehe: number;
  /** Unterkante der Bodenhalterungen (Boden). */
  boden: number;
  kontur: string[];
  fein: string[];
  verdeckt: string[];
  mittellinie: string[];
  /** Kreise der Kontur (Ausblasöffnung, Nabe) und des Gitters. */
  kreise: Array<{ cx: number; cy: number; r: number; art: 'kontur' | 'fein' | 'verdeckt' }>;
  rotor: Rotor | null;
  masse: Masslinie[];
  /** Hinweise mit Hinweislinie (Etiketten in Versalien): Lage des Texts und Ziel am Gerät. */
  hinweise: Array<{ text: string; ziel: Punkt; schrift: Punkt; anker: 'start' | 'end' }>;
  /** Ausdehnung inklusive Maße und Hinweise (für die viewBox der Zeichnung). */
  rahmen: { x0: number; y0: number; x1: number; y1: number };
}

const SCHRIFT = { haupt: 48 } as const;

/** Punkt in Polarkoordinaten um den Ursprung (Grad, 0 = rechts, im Uhrzeigersinn). */
function polar(r: number, grad: number): Punkt {
  const w = (grad * Math.PI) / 180;
  return { x: r * Math.cos(w), y: r * Math.sin(w) };
}

const pt = (q: Punkt) => `${r1(q.x)} ${r1(q.y)}`;

/**
 * Allgemeiner Axialrotor (neutrale Fassung): vier Sichelblätter um die Nabe, die Spitze nachlaufend gegen die
 * Drehrichtung. Kein Abbild eines Herstellerrotors; nur die Zahl der Blätter und das Größenverhältnis sind gewählt.
 */
export function rotorBlaetter(r: number, nabe: number, anzahl = 4): string {
  const teile: string[] = [];
  for (let k = 0; k < anzahl; k += 1) {
    const t = (360 / anzahl) * k;
    const wurzelVor = polar(nabe, t - 24);
    const wurzelNach = polar(nabe, t + 20);
    const spitzeVor = polar(r, t + 6);
    const spitzeNach = polar(r, t + 30);
    const vorder = polar(r * 0.62, t - 16);
    const hinter = polar(r * 0.6, t + 32);
    teile.push(
      `M${pt(wurzelVor)}Q${pt(vorder)} ${pt(spitzeVor)}A${r1(r)} ${r1(r)} 0 0 1 ${pt(spitzeNach)}Q${pt(hinter)} ${pt(wurzelNach)}A${r1(nabe)} ${r1(nabe)} 0 0 0 ${pt(wurzelVor)}Z`,
    );
  }
  return teile.join('');
}

function huelle(ansicht: Omit<Ansicht, 'rahmen'>, rand: number): Ansicht['rahmen'] {
  const xs: number[] = [0, ansicht.breite];
  const ys: number[] = [0, ansicht.boden];
  for (const m of ansicht.masse) {
    // Maßzahl: grob als Kasten um die Mitte (Breite je Ziffer 0,6 em, gedreht bei senkrechten Maßen)
    const breite = m.text.wert.length * SCHRIFT.haupt * 0.62;
    const senkrecht = Math.abs(m.text.winkel) === 90;
    const [bx, by] = senkrecht ? [SCHRIFT.haupt * 0.6, breite / 2] : [breite / 2, SCHRIFT.haupt * 0.6];
    xs.push(m.a.x, m.b.x, m.text.x - bx, m.text.x + bx);
    ys.push(m.a.y, m.b.y, m.text.y - by, m.text.y + by);
  }
  for (const h of ansicht.hinweise) {
    const breite = h.text.length * 30 * 0.62;
    xs.push(h.ziel.x, h.anker === 'start' ? h.schrift.x + breite : h.schrift.x - breite);
    ys.push(h.ziel.y, h.schrift.y - 24, h.schrift.y + 24);
  }
  return { x0: Math.min(...xs) - rand, y0: Math.min(...ys) - rand, x1: Math.max(...xs) + rand, y1: Math.max(...ys) + rand };
}

const rechteck = (x0: number, y0: number, x1: number, y1: number) => `M${r1(x0)} ${r1(y0)}H${r1(x1)}V${r1(y1)}H${r1(x0)}Z`;

/** Vorderansicht eines Außengeräts. */
export function vorderansicht(g: Aussengeraet, { detail = 'voll', massketten = 'haupt' }: { detail?: Detail; massketten?: Massketten } = {}): Ansicht {
  const B = g.breite.mm;
  const H = g.hoehe.mm;
  const kh = g.konsolen.hoehe.mm;
  const kb = g.konsolen.breite.mm;
  const boden = H + kh;
  const kx = [g.konsolen.randabstand.mm, g.konsolen.randabstand.mm + g.konsolen.abstand.mm];
  const { mitteX: ax, mitteY: ay, durchmesser } = g.ausblas;
  const cx = ax.mm;
  const cy = ay.mm;
  const R = durchmesser.mm / 2;
  const rr = g.rotor.durchmesser.mm / 2;
  const nabe = g.rotor.nabe.mm / 2;
  const kond = { x: B - g.kondensat.vonRechts.mm, d: g.kondensat.durchmesser.mm, l: g.kondensat.laenge.mm };
  const rk = g.oberkante.radius.mm;

  const kontur = [
    // Gehäuse; die gerundete Oberkante zeigt sich von vorn als Übergangslinie (fein, unten)
    rechteck(0, 0, B, H),
    // Bodenhalterungen (die hinteren liegen dahinter)
    ...kx.map((x) => rechteck(x - kb / 2, H, x + kb / 2, boden)),
  ];
  const fein = [`M0 ${r1(rk)}H${r1(B)}`];
  const kreise: Ansicht['kreise'] = [{ cx, cy, r: R, art: 'kontur' }];
  if (detail === 'voll') {
    // Kondensatablauf an der Unterseite (330 mm von rechts), sichtbar unter dem Gehäuse
    kontur.push(rechteck(kond.x - kond.d / 2, H, kond.x + kond.d / 2, H + kond.l));
    // Schutzgitter: konzentrische Ringe und zwei Streben, vor dem Rotor
    const ringe = 6;
    for (let i = 1; i < ringe; i += 1) kreise.push({ cx, cy, r: r1((R * i) / ringe), art: 'fein' });
    fein.push(`M${r1(cx - R)} ${r1(cy)}H${r1(cx - nabe)}M${r1(cx + nabe)} ${r1(cy)}H${r1(cx + R)}`);
    fein.push(`M${r1(cx)} ${r1(cy - R)}V${r1(cy - nabe)}M${r1(cx)} ${r1(cy + nabe)}V${r1(cy + R)}`);
  } else {
    kreise.push({ cx, cy, r: r1(R * 0.5), art: 'fein' });
  }
  const verdeckt =
    detail === 'voll'
      ? [
          // Verdampfer auf der Rückseite, hinter der Front
          rechteck(g.verdampfer.rand.mm, rk + g.verdampfer.rand.mm, B - g.verdampfer.rand.mm, H - g.verdampfer.rand.mm),
        ]
      : [];
  if (detail === 'voll') {
    // Hydraulische Anschlüsse hinten (von vorn gesehen rechts hinten), verdeckt; Höhe über Unterkante Gehäuse
    const y = H - g.hydraulik.hoehe.mm;
    const r = g.hydraulik.durchmesser.mm / 2;
    for (const x of [B - g.hydraulik.abstandRand.mm, B - g.hydraulik.abstandRand.mm - g.hydraulik.abstandZwischen.mm]) {
      kreise.push({ cx: x, cy: y, r, art: 'verdeckt' });
    }
  }
  const ueber = 40;
  const mittellinie =
    detail === 'voll'
      ? [`M${r1(cx - R - ueber)} ${r1(cy)}H${r1(cx + R + ueber)}`, `M${r1(cx)} ${r1(cy - R - ueber)}V${r1(cy + R + ueber)}`]
      : [];
  const rotor: Rotor | null = { cx, cy, r: rr, nabe, blaetter: rotorBlaetter(rr, nabe, g.rotor.blaetter) };
  if (detail === 'voll') kreise.push({ cx, cy, r: nabe, art: 'kontur' });

  const masse: Masslinie[] = [];
  const hinweise: Ansicht['hinweise'] = [];
  if (massketten) {
    const versatz = 110;
    masse.push(masslinie({ von: { x: 0, y: boden }, bis: { x: B, y: boden }, abstand: versatz, wert: B, strich: 14, ueberstand: 16, schriftAbstand: 30 }));
    masse.push(masslinie({ von: { x: B, y: H }, bis: { x: B, y: 0 }, abstand: versatz, wert: H, strich: 14, ueberstand: 16, schriftAbstand: 30 }));
    if (massketten === 'voll') {
      // Zweite Kette unter der Breite: Bodenhalterungen (Achsen) und Kondensatablauf von rechts
      const y = boden + versatz * 2;
      masse.push(masslinie({ von: { x: 0, y: boden }, bis: { x: kx[0], y: boden }, abstand: versatz * 2, wert: g.konsolen.randabstand.mm, strich: 14, ueberstand: 16, schriftAbstand: 30 }));
      masse.push(masslinie({ von: { x: kx[0], y: boden }, bis: { x: kx[1], y: boden }, abstand: versatz * 2, wert: g.konsolen.abstand.mm, strich: 14, ueberstand: 16, schriftAbstand: 30 }));
      masse.push(masslinie({ von: { x: kond.x, y: H + kond.l }, bis: { x: B, y: H + kond.l }, abstand: y - (H + kond.l) + versatz, wert: g.kondensat.vonRechts.mm, strich: 14, ueberstand: 16, schriftAbstand: 30 }));
    }
  }
  const ohne = { ansicht: 'vorne' as const, breite: B, hoehe: H, boden, kontur, fein, verdeckt, mittellinie, kreise, rotor, masse, hinweise };
  return { ...ohne, rahmen: huelle(ohne, 24) };
}

/** Seitenansicht von rechts: Front links (x = 0), Rückseite rechts (x = Tiefe). */
export function seitenansicht(g: Aussengeraet, { detail = 'voll', massketten = 'haupt' }: { detail?: Detail; massketten?: Massketten } = {}): Ansicht {
  const T = g.tiefe.mm;
  const H = g.hoehe.mm;
  const kh = g.konsolen.hoehe.mm;
  const boden = H + kh;
  const ue = g.konsolen.ueberstand.mm;
  const rk = g.oberkante.radius.mm;
  const cy = g.ausblas.mitteY.mm;
  const rr = g.rotor.durchmesser.mm / 2;
  const hy = H - g.hydraulik.hoehe.mm;
  const hr = g.hydraulik.durchmesser.mm / 2;
  const hl = g.hydraulik.laenge.mm;
  const kond = { x: g.kondensat.vonVorn.mm, d: g.kondensat.durchmesser.mm, l: g.kondensat.laenge.mm };

  const kontur = [
    // Gehäuse mit gerundeter Oberkante vorn
    `M0 ${r1(H)}V${r1(rk)}A${r1(rk)} ${r1(rk)} 0 0 1 ${r1(rk)} 0H${r1(T)}V${r1(H)}Z`,
    // Bodenhalterungen: 580 mm, je 20 mm Überstand vorn und hinten (beide Halterungen liegen hintereinander)
    rechteck(-ue, H, T + ue, boden),
    // Hydraulische Anschlüsse hinten (beide auf 202 mm, hintereinander)
    rechteck(T, hy - hr, T + hl, hy + hr),
  ];
  const fein: string[] = [];
  const kreise: Ansicht['kreise'] = [];
  const verdeckt: string[] = [];
  const mittellinie: string[] = [];
  if (detail === 'voll') {
    kontur.push(rechteck(kond.x - kond.d / 2, H, kond.x + kond.d / 2, H + kond.l));
    // Verdampfer hinten, Rotor hinter der Front: verdeckt; Lüfterachse als Mittellinie
    verdeckt.push(rechteck(T - g.verdampfer.tiefe.mm, rk, T, H - g.verdampfer.rand.mm));
    verdeckt.push(rechteck(60, cy - rr, 120, cy + rr));
    mittellinie.push(`M-40 ${r1(cy)}H${r1(T * 0.62)}`);
  }

  const masse: Masslinie[] = [];
  const hinweise: Ansicht['hinweise'] = [];
  if (massketten) {
    const versatz = 110;
    masse.push(masslinie({ von: { x: 0, y: 0 }, bis: { x: T, y: 0 }, abstand: -versatz, wert: T, strich: 14, ueberstand: 16, schriftAbstand: 30 }));
    masse.push(masslinie({ von: { x: -ue, y: boden }, bis: { x: T + ue, y: boden }, abstand: versatz, wert: g.tiefeMitKonsolen.mm, strich: 14, ueberstand: 16, schriftAbstand: 30 }));
    masse.push(masslinie({ von: { x: T, y: H }, bis: { x: T, y: hy }, abstand: hl + versatz, wert: g.hydraulik.hoehe.mm, strich: 14, ueberstand: 16, schriftAbstand: 30 }));
    if (massketten === 'voll') {
      masse.push(masslinie({ von: { x: 0, y: H + kond.l }, bis: { x: kond.x, y: H + kond.l }, abstand: boden - (H + kond.l) + versatz * 2, wert: kond.x, strich: 14, ueberstand: 16, schriftAbstand: 30 }));
      masse.push(masslinie({ von: { x: 0, y: H }, bis: { x: 0, y: 0 }, abstand: -versatz, wert: H, strich: 14, ueberstand: 16, schriftAbstand: 30 }));
      hinweise.push({ text: 'Anschlüsse Heizwasser', ziel: { x: T + hl * 0.5, y: hy - hr }, schrift: { x: T + hl * 0.5 + 60, y: hy - 260 }, anker: 'start' });
    }
  }
  const ohne = { ansicht: 'seite' as const, breite: T, hoehe: H, boden, kontur, fein, verdeckt, mittellinie, kreise, rotor: null, masse, hinweise };
  return { ...ohne, rahmen: huelle(ohne, 24) };
}

export function ansichtVon(g: Aussengeraet, ansicht: AnsichtId, optionen?: { detail?: Detail; massketten?: Massketten }): Ansicht {
  return ansicht === 'vorne' ? vorderansicht(g, optionen) : seitenansicht(g, optionen);
}

export { SCHRIFT as ANSICHT_SCHRIFT };
