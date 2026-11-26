/**
 * Die Figur des Helfers als Bildebenen im Dokument: Körper, Arme in mehreren Haltungen, fünf Gesichter,
 * Pupillen als kleine Vektorzeichnung, Lidschlag, zwei Lauf-Bilder. Der Ursprung des Elements ist der Schwerpunkt,
 * damit die Physik die ganze Figur als einen Körper drehen und bewegen kann.
 */
import { DATEN, type EbenenName } from './daten';

export type Mimik = 'lachen' | 'schmunzeln' | 'staunen' | 'zwinkern' | 'jubel';
export type ArmNah = 'unten' | 'zeigen' | 'polieren';
export type ArmFern = 'unten' | 'winken' | 'daumen';

const NS = 'http://www.w3.org/2000/svg';
/** Ebenen der Ruhehaltung: Nur sie lädt die Seite gleich, die übrigen erst, wenn der Helfer geweckt wird. */
const SOFORT: readonly string[] = ['koerper', 'arm-fern-unten', 'arm-nah-unten', 'kopf-lachen'];
const [KW, KH] = DATEN.kasten;
let zaehler = 0;

function el<K extends keyof HTMLElementTagNameMap>(name: K, klasse?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(name);
  if (klasse) e.className = klasse;
  return e;
}
function svg(name: string, attribute: Record<string, string | number> = {}): SVGElement {
  const e = document.createElementNS(NS, name);
  for (const k of Object.keys(attribute)) e.setAttribute(k, String(attribute[k]));
  return e;
}

export class Figur {
  /** Wurzel: Größe null, Ursprung im Schwerpunkt. Die Physik setzt hier Lage und Drehung. */
  readonly el: HTMLElement;
  /** innen: Ebenen im Kasten 620 × 660, verkleinert und so verschoben, dass der Schwerpunkt im Ursprung liegt */
  readonly innen: HTMLElement;
  private readonly stand: HTMLElement;
  private readonly lauf: HTMLElement;
  private readonly kopf: HTMLElement;
  private readonly koepfe = {} as Record<Mimik, HTMLImageElement>;
  private readonly armeNah = {} as Record<ArmNah, HTMLImageElement>;
  private readonly armeFern = {} as Record<ArmFern, HTMLImageElement>;
  private readonly lider: HTMLImageElement;
  private readonly schritte: HTMLElement[] = [];
  private readonly augen: { form: SVGElement; lid: SVGElement; pup: SVGElement; kreis: SVGElement; gruppe: SVGElement }[] = [];
  private readonly id = ++zaehler;
  private aktuell: Mimik = 'lachen';
  private readonly spaeter: [HTMLImageElement, string][] = [];
  private geladen = false;
  private blickStand = { px: 0, py: 0, rot: 0, tx: 0, ty: 0 };

  constructor(
    private readonly quelle: string,
    readonly k: number,
    readonly sp: { x: number; y: number },
    /** false: keine Bilder laden (am Handy ohne Figur) */
    private readonly laden = true,
  ) {
    const G = DATEN.gelenke;
    this.el = el('div', 'hf-figur');
    this.innen = el('div', 'hf-innen');
    this.innen.style.transform = `scale(${k}) translate(${-sp.x}px, ${-sp.y}px)`;
    this.stand = el('div', 'hf-stand');
    const o1 = el('div', 'hf-oben');
    this.armeFern.unten = this.bild('arm-fern-unten', 'hf-af-unten', G.schulterFern);
    this.armeFern.winken = this.bild('arm-fern-winken', 'hf-af-winken', G.ellbogenFern);
    this.armeFern.daumen = this.bild('arm-fern-daumen', 'hf-af-daumen', G.schulterFern);
    o1.append(this.armeFern.unten, this.armeFern.winken, this.armeFern.daumen);
    const koerper = this.bild('koerper', 'hf-rumpfbild', G.fuesse);
    const o2 = el('div', 'hf-oben hf-kopfhalter');
    o2.style.transformOrigin = `${G.hals[0]}px ${G.hals[1]}px`;
    this.kopf = el('div', 'hf-kopf');
    this.kopf.style.transformOrigin = `${G.hals[0]}px ${G.hals[1]}px`;
    for (const m of ['lachen', 'schmunzeln', 'staunen', 'zwinkern', 'jubel'] as Mimik[]) {
      this.koepfe[m] = this.bild(`kopf-${m}` as EbenenName, 'hf-kopfbild');
      this.kopf.append(this.koepfe[m]);
    }
    this.kopf.append(this.baueAugen());
    this.lider = this.bild('lider', 'hf-lider');
    this.lider.hidden = true;
    this.kopf.append(this.lider);
    o2.append(this.kopf);
    const o3 = el('div', 'hf-oben');
    this.armeNah.unten = this.bild('arm-nah-unten', 'hf-an-unten', G.schulterNah);
    this.armeNah.zeigen = this.bild('arm-nah-zeigen', 'hf-an-zeigen', G.schulterNah);
    this.armeNah.polieren = this.bild('arm-nah-polieren', 'hf-an-polieren', G.schulterNah);
    o3.append(this.armeNah.unten, this.armeNah.zeigen, this.armeNah.polieren);
    // eigene Hülle für kurze Bewegungen (wackeln), damit Spiegeln und Wackeln sich nicht überschreiben
    const wackel = el('div', 'hf-wackel');
    wackel.style.transformOrigin = `${G.fuesse[0]}px ${G.fuesse[1]}px`;
    wackel.append(o1, koerper, o2, o3);
    this.stand.append(wackel);

    this.lauf = el('div', 'hf-lauf');
    this.lauf.hidden = true;
    for (const name of ['lauf-a', 'lauf-b'] as EbenenName[]) {
      const halter = el('div', 'hf-laufbild');
      halter.append(this.bild(name, ''));
      this.schritte.push(halter);
      this.lauf.append(halter);
    }
    this.schritte[1].hidden = true;
    this.innen.append(this.stand, this.lauf);
    this.el.append(this.innen);
    this.arm('nah', 'unten');
    this.arm('fern', 'unten');
    this.mimik('lachen');
  }

  /** Bild einer Ebene, an seinem Platz im Kasten */
  bild(name: EbenenName, klasse: string, gelenk?: readonly number[]): HTMLImageElement {
    const e = DATEN.ebenen[name];
    const b = el('img', klasse ? `hf-e ${klasse}` : 'hf-e');
    b.alt = '';
    b.draggable = false;
    b.decoding = 'async';
    const adresse = `${this.quelle}${name}.webp`;
    if (this.laden && (this.geladen || SOFORT.includes(name))) b.src = adresse;
    else this.spaeter.push([b, adresse]);
    b.style.left = `${e.x}px`;
    b.style.top = `${e.y}px`;
    b.style.width = `${e.w}px`;
    b.style.height = `${e.h}px`;
    if (gelenk) b.style.transformOrigin = `${gelenk[0] - e.x}px ${gelenk[1] - e.y}px`;
    return b;
  }

  private baueAugen(): SVGElement {
    const s = svg('svg', { viewBox: `0 0 ${KW} ${KH}`, width: KW, height: KH, 'aria-hidden': 'true', class: 'hf-augen' });
    const g = svg('g', { transform: `translate(${DATEN.kopf.x} ${DATEN.kopf.y}) rotate(${DATEN.kopf.rot})` });
    const defs = svg('defs');
    s.append(defs);
    DATEN.augen.forEach((a, i) => {
      const idF = `hf${this.id}f${i}`;
      const idL = `hf${this.id}l${i}`;
      const cF = svg('clipPath', { id: idF });
      const form = svg('path');
      cF.append(form);
      const cL = svg('clipPath', { id: idL });
      const lid = svg('path');
      cL.append(lid);
      defs.append(cF, cL);
      const gruppe = svg('g', { 'clip-path': `url(#${idF})` });
      const innen = svg('g', { 'clip-path': `url(#${idL})` });
      const pup = svg('g');
      const kreis = svg('circle', { cx: a.cx + DATEN.pupille.dx, cy: a.cy + DATEN.pupille.dy, r: DATEN.pupille.r, fill: DATEN.farben.auge });
      pup.append(kreis, svg('circle', { cx: a.cx + 6.6, cy: a.cy - 2.6, r: 2.3, fill: 'white' }));
      innen.append(pup);
      gruppe.append(innen);
      g.append(gruppe);
      this.augen.push({ form, lid, pup, kreis, gruppe });
    });
    s.append(g);
    return s;
  }

  private augenForm(gross: boolean): void {
    DATEN.augen.forEach((a, i) => {
      const e = this.augen[i];
      const ry = gross ? a.ry + 4 : a.ry;
      const R = ry * 1.3;
      e.form.setAttribute(
        'd',
        `M${a.cx - a.rx},${a.cy} C${a.cx - a.rx},${a.cy - R} ${a.cx + a.rx},${a.cy - R} ${a.cx + a.rx},${a.cy} C${a.cx + a.rx},${a.cy + R} ${a.cx - a.rx},${a.cy + R} ${a.cx - a.rx},${a.cy} Z`,
      );
      // unteres Lid: beim Lachen schiebt es sich hoch und verdeckt den unteren Rand der Pupille
      const u = gross ? a.cy + 60 : a.cy + ry + 1;
      const m = gross ? a.cy + 60 : a.cy + ry - 6;
      e.lid.setAttribute('d', `M${a.cx - a.rx - 6},${a.cy - 60} L${a.cx + a.rx + 6},${a.cy - 60} L${a.cx + a.rx + 6},${u} Q${a.cx},${m} ${a.cx - a.rx - 6},${u} Z`);
      e.kreis.setAttribute('r', String(gross ? DATEN.pupille.rGross : DATEN.pupille.r));
    });
  }

  /** Lädt alle übrigen Ebenen (Gesichter, Armhaltungen, Lauf-Bilder, Einzelteile). */
  ladeRest(): void {
    if (this.geladen || !this.laden) return;
    this.geladen = true;
    for (const [bild, adresse] of this.spaeter) bild.src = adresse;
    this.spaeter.length = 0;
    for (const name of ['rumpf', 'bein-nah', 'bein-fern', 'kopf-jubel'] as EbenenName[]) new Image().src = `${this.quelle}${name}.webp`;
  }

  get gesicht(): Mimik {
    return this.aktuell;
  }

  mimik(name: Mimik): void {
    this.aktuell = name;
    for (const n of Object.keys(this.koepfe) as Mimik[]) this.koepfe[n].hidden = n !== name;
    this.augenForm(name === 'staunen');
    // Bei Jubel und Schmunzeln sind beide Augen zu (gemalt), beim Zwinkern das linke im Bild (augen[1])
    const zu = name === 'jubel' || name === 'schmunzeln';
    this.augen[0].gruppe.style.visibility = zu ? 'hidden' : 'visible';
    this.augen[1].gruppe.style.visibility = zu || name === 'zwinkern' ? 'hidden' : 'visible';
  }

  arm(seite: 'nah', variante: ArmNah): void;
  arm(seite: 'fern', variante: ArmFern): void;
  arm(seite: 'nah' | 'fern', variante: string): void {
    const satz = (seite === 'nah' ? this.armeNah : this.armeFern) as Record<string, HTMLImageElement>;
    for (const n of Object.keys(satz)) satz[n].hidden = n !== variante;
  }

  /** Lider kurz schließen */
  blinzle(zu: boolean): void {
    if (this.aktuell === 'jubel' || this.aktuell === 'staunen' || this.aktuell === 'schmunzeln') return;
    this.lider.hidden = !zu;
    if (zu) for (const a of this.augen) a.gruppe.style.visibility = 'hidden';
    else this.mimik(this.aktuell);
  }

  /**
   * Blick und Kopf weich auf ein Ziel richten. nx, ny zwischen -1 und 1 (Richtung vom Kopf zum Ziel),
   * neigung in Grad kommt obendrauf. Gibt zurück, wie weit der Blick noch vom Ziel entfernt ist.
   */
  blick(nx: number, ny: number, neigung = 0, nick = 0): number {
    const B = this.blickStand;
    const soll = { px: nx * 6, py: ny * 4, rot: nx * 3.2 + neigung, tx: nx * 5, ty: ny * 3 + nick };
    let rest = 0;
    for (const n of Object.keys(soll) as (keyof typeof soll)[]) {
      B[n] += (soll[n] - B[n]) * 0.18;
      rest += Math.abs(soll[n] - B[n]);
    }
    this.kopf.style.transform = `translate(${B.tx.toFixed(2)}px, ${B.ty.toFixed(2)}px) rotate(${B.rot.toFixed(2)}deg)`;
    for (const a of this.augen) a.pup.setAttribute('transform', `translate(${B.px.toFixed(2)} ${B.py.toFixed(2)})`);
    return rest;
  }

  /** Stehen oder Laufen. Beim Laufen wechseln zwei Bilder, links = Blickrichtung nach links. */
  haltung(art: 'stand' | 'lauf', links = false): void {
    this.stand.hidden = art !== 'stand';
    this.lauf.hidden = art !== 'lauf';
    this.el.classList.toggle('hf-links', links);
  }
  laufbild(i: number): void {
    this.schritte[0].hidden = i % 2 === 1;
    this.schritte[1].hidden = i % 2 === 0;
  }

  /** Klasse für eine kurze Bewegung setzen (winken, wackeln, polieren …), sie fällt nach ms wieder ab */
  bewege(klasse: string, ms: number): void {
    const e = this.el;
    e.classList.remove(klasse);
    void e.offsetWidth;
    e.classList.add(klasse);
    window.setTimeout(() => e.classList.remove(klasse), ms);
  }

  /** Mittelpunkt des Kopfes im Fenster (für den Blick) */
  kopfmitte(): { x: number; y: number } {
    const r = this.el.getBoundingClientRect();
    return { x: r.left + (DATEN.kopf.x - this.sp.x) * this.k, y: r.top + (DATEN.kopf.y - this.sp.y) * this.k };
  }
}
