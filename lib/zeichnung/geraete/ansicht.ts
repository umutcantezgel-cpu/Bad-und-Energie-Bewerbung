/**
 * Ansichten eines Außengeräts als Geometrie (KERN K-010, E-029): Vorderansicht und Seitenansicht (von rechts) in
 * Millimetern, abgeleitet allein aus dem Geräte-Modul (compress-aw-s.ts bzw. compress-aw-l.ts). Website
 * (components/zeichnung/technik/Aussengeraet.tsx), Hausschnitt (lib/zeichnung/szenen/hausschnitt.ts) und
 * Teilen-Bilder (lib/seo/og-render.tsx) zeichnen dieselben Pfade.
 *
 * Neutrale Fassung: Gehäuse mit gerundeten oberen Längskanten (von vorn zwei runde Ecken, von der Seite eine
 * Deckellinie; Bild 4, 18, 28), runde Ausblasöffnung mit konzentrischem Schutzgitter, dahinter ein allgemeiner
 * Axialrotor mit vier Sichelblättern, Verdampfer als verdeckte Linie, Bodenhalterungen, Anschlüsse, Kondensatablauf.
 * Kein Logo, kein Anker, kein gestufter Ring-Diffusor (lib/zeichnung/marke.ts).
 *
 * Koordinaten: 1 Einheit = 1 mm. Vorderansicht mit Ursprung oben links am Gehäuse; Seitenansicht mit der Front bei
 * x = 0 und der Rückseite bei x = Tiefe. y wächst nach unten; die Aufstellfläche (Unterkante der Bodenhalterungen)
 * liegt bei y = Höhe, die Unterkante des Gehäuses bei y = Höhe − Halterung. Höhe und Anschlusshöhe zählen wie in
 * Bild 4 ab der Aufstellfläche.
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
  /** Maße der Ansicht (Breite bzw. Tiefe × Gesamthöhe ab Aufstellfläche). */
  breite: number;
  hoehe: number;
  /** Unterkante der Bodenhalterungen (Aufstellfläche), gleich `hoehe`. */
  boden: number;
  /** Unterkante des Gehäuses (Oberkante der Bodenhalterungen). */
  unterkante: number;
  kontur: string[];
  fein: string[];
  verdeckt: string[];
  mittellinie: string[];
  /** Kreise der Kontur (Ausblasöffnung, Nabe) und des Gitters. */
  kreise: Array<{ cx: number; cy: number; r: number; art: 'kontur' | 'fein' | 'verdeckt' }>;
  rotor: Rotor | null;
  masse: Masslinie[];
  /** Ausdehnung inklusive Maße (für die viewBox der Zeichnung). */
  rahmen: { x0: number; y0: number; x1: number; y1: number };
}

const SCHRIFT = { haupt: 48 } as const;
/** Abstand der Maßlinien vom Körper und voneinander (mm). */
const VERSATZ = 110;

/** Geschätzte Breite einer Maßzahl (Martian Mono mit 75 % Breite, mit Reserve) in Einheiten. */
const zahlBreite = (wert: string, schrift: number) => wert.length * schrift * 0.62;

/**
 * Maßzahl, die nicht zwischen die Maßhilfslinien passt (mit einer halben Schrifthöhe Luft), steht in Leserichtung vor
 * dem Maß (DIN 406-11). Sonst berührte sie die Hilfslinien, etwa 107 mm Randabstand bei Maßzahlen ab 56 Einheiten.
 */
function passend(m: Masslinie, schrift: number): Masslinie {
  const laenge = Math.hypot(m.b.x - m.a.x, m.b.y - m.a.y);
  const breite = zahlBreite(m.text.wert, schrift);
  if (breite + schrift * 0.5 <= laenge) return m;
  const u = { x: (m.b.x - m.a.x) / laenge, y: (m.b.y - m.a.y) / laenge };
  const weg = laenge / 2 + breite / 2 + schrift * 0.25;
  return { ...m, text: { ...m.text, x: r1(m.text.x - u.x * weg), y: r1(m.text.y - u.y * weg) } };
}

/**
 * Waagerechte Maßzahl zwischen `x0` und `x1` halten (mit einer viertel Schrifthöhe Luft), wenn eine Maßhilfslinie
 * einer anderen Kette durch ihre Zeile läuft: Die Zahl rückt so wenig wie nötig von der Mitte weg.
 */
function zwischen(m: Masslinie, schrift: number, x0: number, x1: number): Masslinie {
  const halb = zahlBreite(m.text.wert, schrift) / 2 + schrift * 0.25;
  const x = Math.min(Math.max(m.text.x, x0 + halb), x1 - halb);
  return { ...m, text: { ...m.text, x: r1(x) } };
}

/** Maßlinie mit den Werten dieser Zeichnungen (45°-Striche 14, Überstand 16, Maßzahl über der Linie). */
const ketteMit = (schrift: number) => (von: Punkt, bis: Punkt, abstand: number, wert: number) =>
  passend(masslinie({ von, bis, abstand, wert, strich: 14, ueberstand: 16, schriftAbstand: schrift * 0.62 }), schrift);

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
  const mitte = (anteil: number) => nabe + (r - nabe) * anteil;
  for (let k = 0; k < anzahl; k += 1) {
    const t = (360 / anzahl) * k;
    // Sichel: schmale Wurzel an der Nabe, Vorderkante gewölbt, Spitze kurz auf dem Außenradius, Hinterkante hohl
    const wurzelVor = polar(nabe, t - 16);
    const wurzelNach = polar(nabe, t + 16);
    const spitzeVor = polar(r, t + 24);
    const spitzeNach = polar(r, t + 40);
    const vor1 = polar(mitte(0.45), t - 24);
    const vor2 = polar(r * 0.94, t + 2);
    const nach1 = polar(r * 0.8, t + 46);
    const nach2 = polar(mitte(0.3), t + 30);
    teile.push(
      `M${pt(wurzelVor)}C${pt(vor1)} ${pt(vor2)} ${pt(spitzeVor)}A${r1(r)} ${r1(r)} 0 0 1 ${pt(spitzeNach)}C${pt(nach1)} ${pt(nach2)} ${pt(wurzelNach)}A${r1(nabe)} ${r1(nabe)} 0 0 0 ${pt(wurzelVor)}Z`,
    );
  }
  return teile.join('');
}

function huelle(
  ansicht: Omit<Ansicht, 'rahmen'>,
  rand: number,
  schrift: number = SCHRIFT.haupt,
  koerper: { x0: number; x1: number } = { x0: 0, x1: ansicht.breite },
): Ansicht['rahmen'] {
  // Körper samt allem, was über das Gehäuse hinausragt (Halterungen und Anschlüsse der Seitenansicht)
  const xs: number[] = [koerper.x0, koerper.x1];
  const ys: number[] = [0, ansicht.boden];
  for (const m of ansicht.masse) {
    // Maßzahl: grob als Kasten um die Mitte (Breite je Ziffer 0,6 em, gedreht bei senkrechten Maßen)
    const breite = zahlBreite(m.text.wert, schrift);
    const senkrecht = Math.abs(m.text.winkel) === 90;
    const [bx, by] = senkrecht ? [schrift * 0.6, breite / 2] : [breite / 2, schrift * 0.6];
    xs.push(m.a.x, m.b.x, m.text.x - bx, m.text.x + bx);
    ys.push(m.a.y, m.b.y, m.text.y - by, m.text.y + by);
  }
  return { x0: Math.min(...xs) - rand, y0: Math.min(...ys) - rand, x1: Math.max(...xs) + rand, y1: Math.max(...ys) + rand };
}

const rechteck = (x0: number, y0: number, x1: number, y1: number) => `M${r1(x0)} ${r1(y0)}H${r1(x1)}V${r1(y1)}H${r1(x0)}Z`;

/** Vorderansicht eines Außengeräts. */
export interface AnsichtOptionen {
  detail?: Detail;
  massketten?: Massketten;
  /** Größe der Maßzahlen (mm); bestimmt Abstand der Zahl von der Linie und den Rahmen. */
  schrift?: number;
}

export function vorderansicht(g: Aussengeraet, { detail = 'voll', massketten = 'haupt', schrift = SCHRIFT.haupt }: AnsichtOptionen = {}): Ansicht {
  const kette = ketteMit(schrift);
  const B = g.breite.mm;
  const H = g.hoehe.mm;
  const kh = g.konsolen.hoehe.mm;
  const kb = g.konsolen.breite.mm;
  // Höhe ab Aufstellfläche (Tabelle und Bild 4): der Boden liegt bei H, das Gehäuse endet über den Halterungen
  const boden = H;
  const unterkante = H - kh;
  const kx = [g.konsolen.randabstand.mm, g.konsolen.randabstand.mm + g.konsolen.abstand.mm];
  const { mitteX: ax, mitteY: ay, durchmesser } = g.ausblas;
  const cx = ax.mm;
  const cy = ay.mm;
  const R = durchmesser.mm / 2;
  const rr = g.rotor.durchmesser.mm / 2;
  const nabe = g.rotor.nabe.mm / 2;
  const kond = { x: g.kondensat.vonLinks.mm, d: g.kondensat.durchmesser.mm, l: g.kondensat.laenge.mm };
  const rk = g.oberkante.radius.mm;

  const kontur = [
    // Gehäuse: die gerundeten oberen Längskanten zeigen sich von vorn als zwei runde Ecken (Bild 4, 18, 28)
    `M0 ${r1(unterkante)}V${r1(rk)}A${r1(rk)} ${r1(rk)} 0 0 1 ${r1(rk)} 0H${r1(B - rk)}A${r1(rk)} ${r1(rk)} 0 0 1 ${r1(B)} ${r1(rk)}V${r1(unterkante)}Z`,
    // Bodenhalterungen (die hinteren liegen dahinter)
    ...kx.map((x) => rechteck(x - kb / 2, unterkante, x + kb / 2, boden)),
  ];
  const fein: string[] = [];
  const kreise: Ansicht['kreise'] = [{ cx, cy, r: R, art: 'kontur' }];
  // Kondensatablauf an der Unterseite (330 mm vom linken Rand), sichtbar zwischen den Halterungen; auch in der einfachen
  // Detailstufe, denn der Hausschnitt führt von ihm das Kondensatrohr ins Kiesbett (Prüfung E-029, Runde 2)
  kontur.push(rechteck(kond.x - kond.d / 2, unterkante, kond.x + kond.d / 2, unterkante + kond.l));
  if (detail === 'voll') {
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
          // Verdampfer auf der Rückseite, hinter der Front: nur über seine Breite (von vorn links), rechts davon liegt der
          // Anschlussbereich mit den hydraulischen Anschlüssen (Bild 3/4)
          rechteck(
            g.verdampfer.vonLinks.mm,
            rk + g.verdampfer.rand.mm,
            g.verdampfer.vonLinks.mm + g.verdampfer.breite.mm,
            unterkante - g.verdampfer.rand.mm,
          ),
        ]
      : [];
  if (detail === 'voll') {
    // Hydraulische Anschlüsse hinten (von vorn gesehen rechts hinten), verdeckt; Höhe über der Aufstellfläche
    const y = boden - g.hydraulik.hoehe.mm;
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

  const masse: Masslinie[] = [];
  if (massketten) {
    // DIN 406: kleine Maße innen, das Gesamtmaß außen
    const zeilen = massketten === 'voll' ? 3 : 1;
    if (massketten === 'voll') {
      // Die Hilfslinie der Halterung (Randabstand) läuft durch die Zeile des Kondensatmaßes: Zahl rechts davon
      masse.push(zwischen(kette({ x: 0, y: boden }, { x: kond.x, y: boden }, VERSATZ, g.kondensat.vonLinks.mm), schrift, kx[0], kond.x));
      masse.push(kette({ x: 0, y: boden }, { x: kx[0], y: boden }, VERSATZ * 2, g.konsolen.randabstand.mm));
      masse.push(kette({ x: kx[0], y: boden }, { x: kx[1], y: boden }, VERSATZ * 2, g.konsolen.abstand.mm));
    }
    masse.push(kette({ x: 0, y: boden }, { x: B, y: boden }, VERSATZ * zeilen, B));
    // Höhe ab Aufstellfläche wie in Bild 4
    masse.push(kette({ x: B, y: boden }, { x: B, y: 0 }, VERSATZ, H));
  }
  const ohne = { ansicht: 'vorne' as const, breite: B, hoehe: H, boden, unterkante, kontur, fein, verdeckt, mittellinie, kreise, rotor, masse };
  return { ...ohne, rahmen: huelle(ohne, 24, schrift) };
}

/** Seitenansicht von rechts: Front links (x = 0), Rückseite rechts (x = Tiefe). */
export function seitenansicht(g: Aussengeraet, { detail = 'voll', massketten = 'haupt', schrift = SCHRIFT.haupt }: AnsichtOptionen = {}): Ansicht {
  const kette = ketteMit(schrift);
  const T = g.tiefe.mm;
  const H = g.hoehe.mm;
  const kh = g.konsolen.hoehe.mm;
  const boden = H;
  const unterkante = H - kh;
  const ue = g.konsolen.ueberstand.mm;
  const kl = g.konsolen.laenge.mm;
  const lr = g.konsolen.lochRand.mm;
  // Bohrungen der Halterungen vorn und hinten, je `lochRand` vor der Gehäusekante: 580 mm auseinander (Bild 5)
  const loecher = [-lr, T + lr];
  const rk = g.oberkante.radius.mm;
  const cy = g.ausblas.mitteY.mm;
  const rr = g.rotor.durchmesser.mm / 2;
  const hy = boden - g.hydraulik.hoehe.mm;
  const hr = g.hydraulik.durchmesser.mm / 2;
  const hl = g.hydraulik.laenge.mm;
  // Kondensatablauf von der Rückseite gemessen (Bild 6)
  const kond = { x: T - g.kondensat.vonHinten.mm, d: g.kondensat.durchmesser.mm, l: g.kondensat.laenge.mm };

  const kontur = [
    // Gehäuse: von der Seite ein Rechteck (Bild 14, 17, 20); die Rundung der oberen Längskante steht als Deckellinie
    rechteck(0, 0, T, unterkante),
    // Bodenhalterungen: je Seite zwei getrennte, vorn und hinten, mit der Lücke dazwischen (Bild 5, Draufsicht); die
    // Halterungen der linken Seite liegen genau dahinter. 580 ist der Abstand ihrer Bohrungen, keine Schienenlänge
    rechteck(-ue, unterkante, -ue + kl, boden),
    rechteck(T + ue - kl, unterkante, T + ue, boden),
    // Hydraulische Anschlüsse hinten (beide auf 202 mm über der Aufstellfläche, hintereinander)
    rechteck(T, hy - hr, T + hl, hy + hr),
  ];
  const fein: string[] = [`M0 ${r1(rk)}H${r1(T)}`];
  const kreise: Ansicht['kreise'] = [];
  const verdeckt: string[] = [];
  const mittellinie: string[] = [];
  if (detail === 'voll') {
    // Kondensatablauf: von der Seite liegt er hinter der hinteren Bodenhalterung (verdeckt, nicht länger als sie hoch ist)
    verdeckt.push(rechteck(kond.x - kond.d / 2, unterkante, kond.x + kond.d / 2, unterkante + kond.l));
    // Verdampfer hinten, Rotor hinter der Front: verdeckt; Lüfterachse als Mittellinie
    verdeckt.push(rechteck(T - g.verdampfer.tiefe.mm, rk, T, unterkante - g.verdampfer.rand.mm));
    verdeckt.push(rechteck(60, cy - rr, 120, cy + rr));
    mittellinie.push(`M-40 ${r1(cy)}H${r1(T * 0.62)}`);
    // Achsen der Bohrungen durch die Halterungen; die Maßhilfslinien der 580 setzen sie unter der Aufstellfläche fort
    for (const x of loecher) mittellinie.push(`M${r1(x)} ${r1(unterkante - 12)}V${r1(boden)}`);
  }

  const masse: Masslinie[] = [];
  if (massketten) {
    const zeilen = massketten === 'voll' ? 2 : 1;
    masse.push(kette({ x: 0, y: 0 }, { x: T, y: 0 }, -VERSATZ, T));
    if (massketten === 'voll') {
      masse.push(kette({ x: kond.x, y: boden }, { x: T, y: boden }, VERSATZ, g.kondensat.vonHinten.mm));
      // 20 von der Gehäusekante (vorn) bis zur Bohrung: die Hilfslinien setzen an der Unterkante des Gehäuses an, an
      // seiner Ecke und an der Achse der Bohrung; die Maßlinie liegt in der Zeile des Kondensatmaßes
      masse.push(kette({ x: -lr, y: unterkante }, { x: 0, y: unterkante }, boden - unterkante + VERSATZ, g.konsolen.lochRand.mm));
    }
    // 580 von Bohrung zu Bohrung (Bild 5: Maßhilfslinien an den Bohrungen)
    masse.push(kette({ x: loecher[0], y: boden }, { x: loecher[1], y: boden }, VERSATZ * zeilen, g.konsolen.lochabstandTiefe.mm));
    // 202 und die Höhe zählen ab der Aufstellfläche (Bild 4: Maßhilfslinie an der Unterkante der Halterungen)
    masse.push(kette({ x: T, y: boden }, { x: T, y: hy }, hl + VERSATZ, g.hydraulik.hoehe.mm));
    // Die Anschlüsse benennt das Schriftfeld (HTML): Ein Hinweis mit Hinweislinie im Bild hätte am Handy nie die
    // Mindestgröße der Schrift erreicht (5,3 px, Prüfung E-029, Befund 7)
    if (massketten === 'voll') masse.push(kette({ x: 0, y: boden }, { x: 0, y: 0 }, -VERSATZ, H));
  }
  const ohne = { ansicht: 'seite' as const, breite: T, hoehe: H, boden, unterkante, kontur, fein, verdeckt, mittellinie, kreise, rotor: null, masse };
  return { ...ohne, rahmen: huelle(ohne, 24, schrift, { x0: -ue, x1: Math.max(T + ue, T + hl) }) };
}

export function ansichtVon(g: Aussengeraet, ansicht: AnsichtId, optionen?: AnsichtOptionen): Ansicht {
  return ansicht === 'vorne' ? vorderansicht(g, optionen) : seitenansicht(g, optionen);
}

export { SCHRIFT as ANSICHT_SCHRIFT };
