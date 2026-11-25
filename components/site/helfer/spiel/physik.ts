/**
 * Kleine Starrkörper-Physik für den Helfer und den WhatsApp-Ball.
 *
 * Jeder Körper ist ein starrer Verbund aus Kreisen (ein Ball ist ein Kreis, die Figur vier: Kopf, Rumpf, zwei Füße).
 * Gerechnet wird in Bildpunkten und Sekunden, mit festem Zeitschritt und Impulsen an den Berührpunkten:
 * Schwerkraft, Aufprall mit Rückprall, Reibung mit Drall, Rollwiderstand, Luftwiderstand, Einschlafen in Ruhe.
 * Die Wände links, rechts und der Boden sind fest, nach oben ist die Welt offen.
 * Keine Abhängigkeiten, kein Zugriff auf das Dokument: die Datei läuft auch im Test ohne Browser.
 */

export interface Kreis {
  /** Mittelpunkt im Körper, gemessen vom Schwerpunkt, bei Winkel 0 */
  x: number;
  y: number;
  r: number;
  /** Dichte im Verhältnis zu den anderen Kreisen des Körpers, Standard 1 */
  d?: number;
}

/** Griff: eine gedämpfte Feder zwischen einem Punkt am Körper und dem Zeiger. Daran baumelt der Körper. */
export interface Griff {
  /** Angriffspunkt im Körper, vom Schwerpunkt aus, bei Winkel 0 */
  lx: number;
  ly: number;
  /** Ziel in Weltkoordinaten (der Zeiger) */
  zx: number;
  zy: number;
}

export interface Koerper {
  name: string;
  x: number;
  y: number;
  winkel: number;
  vx: number;
  vy: number;
  /** Drehgeschwindigkeit in rad/s */
  dreh: number;
  masse: number;
  invM: number;
  invI: number;
  kreise: Kreis[];
  /** Rückprall 0 bis 1 */
  prall: number;
  reibung: number;
  /** Rollwiderstand in rad/s², bremst das Rollen am Boden */
  rollen: number;
  /** Luftwiderstand je Sekunde */
  luft: number;
  /** nimmt an der Rechnung teil */
  aktiv: boolean;
  /** unbeweglich (unendlich schwer), stößt aber andere ab und meldet Treffer */
  starr: boolean;
  schlaeft: boolean;
  ruhe: number;
  beruehrt: boolean;
  griff: Griff | null;
  /** Körper mit gleicher Gruppe größer 0 stoßen sich gegenseitig nicht */
  gruppe: number;
}

export interface FesterKreis {
  x: number;
  y: number;
  r: number;
  prall: number;
}

export interface Stoss {
  a: Koerper;
  /** zweiter Körper, oder null für Wand, Boden und feste Kreise */
  b: Koerper | null;
  /** Stärke des Stoßes (Masse mal Geschwindigkeitsänderung) */
  impuls: number;
  /** Geschwindigkeit, mit der die beiden aufeinander zukamen, in Bildpunkten je Sekunde */
  tempo: number;
  x: number;
  y: number;
  /** Richtung des Stoßes auf a */
  nx: number;
  ny: number;
  /** 'boden' | 'wand' | 'fest' | 'koerper' */
  art: 'boden' | 'wand' | 'fest' | 'koerper';
}

export interface KoerperAngaben {
  name: string;
  x?: number;
  y?: number;
  winkel?: number;
  masse?: number;
  kreise: Kreis[];
  prall?: number;
  reibung?: number;
  rollen?: number;
  luft?: number;
  gruppe?: number;
}

const SCHRITT = 1 / 240;
const DURCHGAENGE = 5;
const SPIEL = 0.5; // erlaubte Eindringtiefe, verhindert Zittern
const PRALL_SCHWELLE = 70; // darunter kein Rückprall: der Körper bleibt liegen
const HOECHSTTEMPO = 6200;
const GRIFF_HZ = 8;
const GRIFF_DAEMPFUNG = 0.8;

/** Erzeugt einen Körper. Schwerpunkt und Trägheit ergeben sich aus den Kreisen (Masse nach Fläche verteilt). */
export function koerper(a: KoerperAngaben): Koerper {
  const masse = a.masse ?? 1;
  const anteil = (k: Kreis) => k.r * k.r * (k.d ?? 1);
  const gesamt = a.kreise.reduce((s, k) => s + anteil(k), 0);
  // Schwerpunkt in den Ursprung legen
  const { x: sx, y: sy } = schwerpunkt(a.kreise);
  const kreise = a.kreise.map((k) => ({ x: k.x - sx, y: k.y - sy, r: k.r, d: k.d }));
  let traegheit = 0;
  for (const k of kreise) {
    const m = (masse * anteil(k)) / gesamt;
    traegheit += m * (0.5 * k.r * k.r + k.x * k.x + k.y * k.y);
  }
  return {
    name: a.name,
    x: (a.x ?? 0) + sx,
    y: (a.y ?? 0) + sy,
    winkel: a.winkel ?? 0,
    vx: 0,
    vy: 0,
    dreh: 0,
    masse,
    invM: 1 / masse,
    invI: 1 / traegheit,
    kreise,
    prall: a.prall ?? 0.3,
    reibung: a.reibung ?? 0.6,
    rollen: a.rollen ?? 6,
    luft: a.luft ?? 0.08,
    aktiv: true,
    starr: false,
    schlaeft: false,
    ruhe: 0,
    beruehrt: false,
    griff: null,
    gruppe: a.gruppe ?? 0,
  };
}

/** Verschiebung des Schwerpunkts gegenüber dem Ursprung der Angaben (nützlich, um Bilder passend zu setzen) */
export function schwerpunkt(kreise: Kreis[]): { x: number; y: number } {
  const gesamt = kreise.reduce((s, k) => s + k.r * k.r * (k.d ?? 1), 0);
  let x = 0;
  let y = 0;
  for (const k of kreise) {
    x += (k.x * k.r * k.r * (k.d ?? 1)) / gesamt;
    y += (k.y * k.r * k.r * (k.d ?? 1)) / gesamt;
  }
  return { x, y };
}

export class Welt {
  schwerkraft = 2300;
  links = 0;
  rechts = 1000;
  boden = 800;
  koerper: Koerper[] = [];
  fest: FesterKreis[] = [];
  /** wird nach jedem Aufruf von schritt() für jeden spürbaren Stoß einmal gerufen (der stärkste je Paar) */
  beiStoss: ((s: Stoss) => void) | null = null;
  private rest = 0;
  private stoesse = new Map<string, Stoss>();

  dazu(k: Koerper): Koerper {
    this.koerper.push(k);
    return k;
  }
  weg(k: Koerper): void {
    const i = this.koerper.indexOf(k);
    if (i >= 0) this.koerper.splice(i, 1);
  }
  wecke(k: Koerper): void {
    k.schlaeft = false;
    k.ruhe = 0;
  }
  /** true, solange sich noch etwas bewegt */
  get wach(): boolean {
    return this.koerper.some((k) => k.aktiv && !k.starr && !k.schlaeft);
  }

  /** Impuls an einem Weltpunkt ansetzen (zum Beispiel ein Tritt oder ein Piekser) */
  impuls(k: Koerper, px: number, py: number, wx: number, wy: number): void {
    if (k.starr) return;
    this.wecke(k);
    const rx = wx - k.x;
    const ry = wy - k.y;
    k.vx += px * k.invM;
    k.vy += py * k.invM;
    k.dreh += (rx * py - ry * px) * k.invI;
  }

  /** Rechnet dt Sekunden weiter, in festen kleinen Schritten. */
  schritt(dt: number): void {
    this.rest = Math.min(this.rest + dt, 0.1);
    this.stoesse.clear();
    while (this.rest >= SCHRITT) {
      this.rest -= SCHRITT;
      this.teilschritt(SCHRITT);
    }
    if (this.beiStoss) for (const s of this.stoesse.values()) this.beiStoss(s);
  }

  private merke(schluessel: string, s: Stoss): void {
    const alt = this.stoesse.get(schluessel);
    if (!alt || alt.impuls < s.impuls) this.stoesse.set(schluessel, s);
  }

  private teilschritt(h: number): void {
    const alle = this.koerper;
    for (const k of alle) {
      k.beruehrt = false;
      if (!k.aktiv || k.starr || k.schlaeft) continue;
      k.vy += this.schwerkraft * h;
      const d = Math.max(0, 1 - k.luft * h);
      k.vx *= d;
      k.vy *= d;
      k.dreh *= Math.max(0, 1 - 0.35 * h);
      if (k.griff) this.zieh(k, k.griff, h);
      const tempo = Math.hypot(k.vx, k.vy);
      if (tempo > HOECHSTTEMPO) {
        k.vx *= HOECHSTTEMPO / tempo;
        k.vy *= HOECHSTTEMPO / tempo;
      }
      if (Math.abs(k.dreh) > 60) k.dreh = Math.sign(k.dreh) * 60;
    }

    for (let durchgang = 0; durchgang < DURCHGAENGE; durchgang++) {
      const erster = durchgang === 0;
      for (let i = 0; i < alle.length; i++) {
        const a = alle[i];
        if (!a.aktiv) continue;
        if (!a.starr && !a.schlaeft) this.gegenWelt(a, erster);
        for (let j = i + 1; j < alle.length; j++) {
          const b = alle[j];
          if (!b.aktiv) continue;
          if (a.gruppe > 0 && a.gruppe === b.gruppe) continue;
          if ((a.starr || a.schlaeft) && (b.starr || b.schlaeft)) continue;
          this.gegenKoerper(a, b, erster);
        }
      }
    }

    for (const k of alle) {
      if (!k.aktiv || k.starr || k.schlaeft) continue;
      k.x += k.vx * h;
      k.y += k.vy * h;
      k.winkel += k.dreh * h;
      // Rollwiderstand und Einschlafen
      if (k.beruehrt) {
        const brems = k.rollen * h;
        k.dreh = Math.abs(k.dreh) <= brems ? 0 : k.dreh - Math.sign(k.dreh) * brems;
      }
      const still = k.beruehrt && !k.griff && Math.hypot(k.vx, k.vy) < 14 && Math.abs(k.dreh) < 0.35;
      k.ruhe = still ? k.ruhe + h : 0;
      if (k.ruhe > 0.45) {
        k.schlaeft = true;
        k.vx = 0;
        k.vy = 0;
        k.dreh = 0;
      }
    }
    for (const k of alle) if (k.aktiv && !k.starr && !k.schlaeft) this.herausschieben(k);
  }

  /**
   * Weiche Bindung zwischen Griffpunkt und Zeiger (gedämpfte Feder, als Impuls gerechnet und deshalb auch bei
   * harten Rucken stabil). Daran lässt sich der Körper tragen, schwingen und werfen; er baumelt wie am Finger.
   */
  private zieh(k: Koerper, g: Griff, h: number): void {
    const c = Math.cos(k.winkel);
    const s = Math.sin(k.winkel);
    const rx = g.lx * c - g.ly * s;
    const ry = g.lx * s + g.ly * c;
    const om = 2 * Math.PI * GRIFF_HZ;
    const steif = k.masse * om * om;
    const daempf = 2 * k.masse * GRIFF_DAEMPFUNG * om;
    const gamma = 1 / (h * (daempf + h * steif));
    const beta = h * steif * gamma;
    // wirksame Masse am Griffpunkt (2x2), um gamma weicher gemacht
    const k11 = k.invM + k.invI * ry * ry + gamma;
    const k12 = -k.invI * rx * ry;
    const k22 = k.invM + k.invI * rx * rx + gamma;
    const det = k11 * k22 - k12 * k12;
    const cx = k.x + rx - g.zx;
    const cy = k.y + ry - g.zy;
    const bx = -(k.vx - k.dreh * ry + beta * cx);
    const by = -(k.vy + k.dreh * rx + beta * cy);
    let px = (k22 * bx - k12 * by) / det;
    let py = (k11 * by - k12 * bx) / det;
    const max = k.masse * 90000 * h;
    const p = Math.hypot(px, py);
    if (p > max) {
      px *= max / p;
      py *= max / p;
    }
    k.vx += px * k.invM;
    k.vy += py * k.invM;
    k.dreh += (rx * py - ry * px) * k.invI;
    // die Hand bremst das Schwingen
    k.dreh *= Math.max(0, 1 - 4.5 * h);
  }

  private gegenWelt(a: Koerper, erster: boolean): void {
    const c = Math.cos(a.winkel);
    const s = Math.sin(a.winkel);
    for (const kr of a.kreise) {
      const rx = kr.x * c - kr.y * s;
      const ry = kr.x * s + kr.y * c;
      const px = a.x + rx;
      const py = a.y + ry;
      if (py + kr.r > this.boden) this.stossWelt(a, rx, ry + kr.r, 0, -1, 'boden', erster, 0.85);
      if (px - kr.r < this.links) this.stossWelt(a, rx - kr.r, ry, 1, 0, 'wand', erster, 0.9);
      if (px + kr.r > this.rechts) this.stossWelt(a, rx + kr.r, ry, -1, 0, 'wand', erster, 0.9);
      for (const f of this.fest) {
        const dx = px - f.x;
        const dy = py - f.y;
        const abstand = Math.hypot(dx, dy);
        if (abstand < kr.r + f.r && abstand > 0.0001) {
          const nx = dx / abstand;
          const ny = dy / abstand;
          this.stossWelt(a, rx - nx * kr.r, ry - ny * kr.r, nx, ny, 'fest', erster, f.prall);
        }
      }
    }
  }

  /** Stoß gegen etwas Unbewegliches. (rx, ry): Berührpunkt vom Schwerpunkt aus. (nx, ny): Richtung weg vom Hindernis. */
  private stossWelt(a: Koerper, rx: number, ry: number, nx: number, ny: number, art: Stoss['art'], erster: boolean, prallWelt: number): void {
    a.beruehrt = true;
    const vx = a.vx - a.dreh * ry;
    const vy = a.vy + a.dreh * rx;
    const vn = vx * nx + vy * ny;
    if (vn >= 0) return;
    const rn = rx * ny - ry * nx;
    const kn = a.invM + rn * rn * a.invI;
    const e = erster && -vn > PRALL_SCHWELLE ? a.prall * prallWelt : 0;
    const j = (-(1 + e) * vn) / kn;
    a.vx += j * nx * a.invM;
    a.vy += j * ny * a.invM;
    a.dreh += rn * j * a.invI;
    // Reibung entlang der Fläche: bremst das Rutschen und versetzt den Körper in Drehung
    const tx = -ny;
    const ty = nx;
    const wx = a.vx - a.dreh * ry;
    const wy = a.vy + a.dreh * rx;
    const vt = wx * tx + wy * ty;
    const rt = rx * ty - ry * tx;
    const kt = a.invM + rt * rt * a.invI;
    const jt = Math.max(-a.reibung * j, Math.min(a.reibung * j, -vt / kt));
    a.vx += jt * tx * a.invM;
    a.vy += jt * ty * a.invM;
    a.dreh += rt * jt * a.invI;
    if (erster && -vn > PRALL_SCHWELLE) {
      this.merke(a.name + '|' + art, { a, b: null, impuls: j, tempo: -vn, x: a.x + rx, y: a.y + ry, nx, ny, art });
    }
  }

  private gegenKoerper(a: Koerper, b: Koerper, erster: boolean): void {
    const ca = Math.cos(a.winkel);
    const sa = Math.sin(a.winkel);
    const cb = Math.cos(b.winkel);
    const sb = Math.sin(b.winkel);
    for (const ka of a.kreise) {
      const ax = ka.x * ca - ka.y * sa;
      const ay = ka.x * sa + ka.y * ca;
      for (const kb of b.kreise) {
        const bx = kb.x * cb - kb.y * sb;
        const by = kb.x * sb + kb.y * cb;
        const dx = b.x + bx - (a.x + ax);
        const dy = b.y + by - (a.y + ay);
        const summe = ka.r + kb.r;
        const q = dx * dx + dy * dy;
        if (q >= summe * summe || q < 0.0001) continue;
        const abstand = Math.sqrt(q);
        const nx = dx / abstand;
        const ny = dy / abstand;
        // Berührpunkt, von beiden Schwerpunkten aus gesehen
        const rax = ax + nx * ka.r;
        const ray = ay + ny * ka.r;
        const rbx = bx - nx * kb.r;
        const rby = by - ny * kb.r;
        const vax = a.starr ? 0 : a.vx - a.dreh * ray;
        const vay = a.starr ? 0 : a.vy + a.dreh * rax;
        const vbx = b.starr ? 0 : b.vx - b.dreh * rby;
        const vby = b.starr ? 0 : b.vy + b.dreh * rbx;
        const vn = (vbx - vax) * nx + (vby - vay) * ny;
        a.beruehrt = true;
        b.beruehrt = true;
        if (vn >= 0) continue;
        // Ein Schläfer wird von einem kräftigen Treffer geweckt, und zwar bevor gerechnet wird:
        // Er nimmt den Stoß mit, statt ihn wie eine Wand zurückzugeben.
        if (-vn > 40) {
          if (a.schlaeft && !a.starr) this.wecke(a);
          if (b.schlaeft && !b.starr) this.wecke(b);
        }
        const ima = a.starr || a.schlaeft ? 0 : a.invM;
        const iia = a.starr || a.schlaeft ? 0 : a.invI;
        const imb = b.starr || b.schlaeft ? 0 : b.invM;
        const iib = b.starr || b.schlaeft ? 0 : b.invI;
        const ran = rax * ny - ray * nx;
        const rbn = rbx * ny - rby * nx;
        const kn = ima + imb + ran * ran * iia + rbn * rbn * iib;
        if (kn <= 0) continue;
        const e = erster && -vn > PRALL_SCHWELLE ? Math.max(a.prall, b.prall) * 0.9 : 0;
        const j = (-(1 + e) * vn) / kn;
        a.vx -= j * nx * ima;
        a.vy -= j * ny * ima;
        a.dreh -= ran * j * iia;
        b.vx += j * nx * imb;
        b.vy += j * ny * imb;
        b.dreh += rbn * j * iib;
        const tx = -ny;
        const ty = nx;
        const wax = a.starr ? 0 : a.vx - a.dreh * ray;
        const way = a.starr ? 0 : a.vy + a.dreh * rax;
        const wbx = b.starr ? 0 : b.vx - b.dreh * rby;
        const wby = b.starr ? 0 : b.vy + b.dreh * rbx;
        const vt = (wbx - wax) * tx + (wby - way) * ty;
        const rat = rax * ty - ray * tx;
        const rbt = rbx * ty - rby * tx;
        const kt = ima + imb + rat * rat * iia + rbt * rbt * iib;
        const mu = Math.sqrt(a.reibung * b.reibung);
        const jt = Math.max(-mu * j, Math.min(mu * j, -vt / kt));
        a.vx -= jt * tx * ima;
        a.vy -= jt * ty * ima;
        a.dreh -= rat * jt * iia;
        b.vx += jt * tx * imb;
        b.vy += jt * ty * imb;
        b.dreh += rbt * jt * iib;
        if (erster && -vn > PRALL_SCHWELLE) {
          this.merke(a.name + '|' + b.name, { a, b, impuls: j, tempo: -vn, x: a.x + rax, y: a.y + ray, nx: -nx, ny: -ny, art: 'koerper' });
        }
      }
    }
  }

  /** Schiebt einen Körper aus Wänden, Boden, festen Kreisen und anderen Körpern heraus. */
  private herausschieben(a: Koerper): void {
    const c = Math.cos(a.winkel);
    const s = Math.sin(a.winkel);
    for (const kr of a.kreise) {
      const px = a.x + kr.x * c - kr.y * s;
      const py = a.y + kr.x * s + kr.y * c;
      const tb = py + kr.r - this.boden;
      if (tb > SPIEL) a.y -= (tb - SPIEL) * 0.8;
      const tl = this.links - (px - kr.r);
      if (tl > SPIEL) a.x += (tl - SPIEL) * 0.8;
      const tr = px + kr.r - this.rechts;
      if (tr > SPIEL) a.x -= (tr - SPIEL) * 0.8;
      for (const f of this.fest) {
        const dx = px - f.x;
        const dy = py - f.y;
        const abstand = Math.hypot(dx, dy);
        const tief = kr.r + f.r - abstand;
        if (tief > SPIEL && abstand > 0.0001) {
          a.x += (dx / abstand) * (tief - SPIEL) * 0.8;
          a.y += (dy / abstand) * (tief - SPIEL) * 0.8;
        }
      }
    }
    for (const b of this.koerper) {
      if (b === a || !b.aktiv) continue;
      if (a.gruppe > 0 && a.gruppe === b.gruppe) continue;
      const cb = Math.cos(b.winkel);
      const sb = Math.sin(b.winkel);
      const bFest = b.starr || b.schlaeft;
      for (const ka of a.kreise) {
        const ax = a.x + ka.x * c - ka.y * s;
        const ay = a.y + ka.x * s + ka.y * c;
        for (const kb of b.kreise) {
          const dx = ax - (b.x + kb.x * cb - kb.y * sb);
          const dy = ay - (b.y + kb.x * sb + kb.y * cb);
          const abstand = Math.hypot(dx, dy);
          const tief = ka.r + kb.r - abstand;
          if (tief > SPIEL && abstand > 0.0001) {
            // gegen Unbewegliches ganz, gegen Bewegliches nach Massenanteil
            const anteil = bFest ? 1 : a.invM / (a.invM + b.invM);
            a.x += (dx / abstand) * (tief - SPIEL) * 0.6 * anteil;
            a.y += (dy / abstand) * (tief - SPIEL) * 0.6 * anteil;
          }
        }
      }
    }
  }
}

/** Anfangsgeschwindigkeit für einen Wurf von (x0, y0) nach (x1, y1) mit Flugzeit t unter Schwerkraft g. */
export function wurf(x0: number, y0: number, x1: number, y1: number, t: number, g: number): { vx: number; vy: number } {
  return { vx: (x1 - x0) / t, vy: (y1 - y0 - 0.5 * g * t * t) / t };
}
