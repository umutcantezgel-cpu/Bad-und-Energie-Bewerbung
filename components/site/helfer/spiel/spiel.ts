/**
 * Der Helfer als Spielzeug mit echter Physik: greifen, tragen, werfen, fangen, pieksen, fallen lassen.
 * Der WhatsApp-Knopf ist der Ball dazu. Mit Wucht zerspringt der Helfer in sechs Teile, baut sich wieder
 * zusammen und poliert sich die Knöchel. Er spielt Fußball und Basketball und lässt sich wegschicken.
 *
 * Aufbau: eine feste Schicht über der Seite, die selbst keine Zeiger fängt. Nur Figur, Ball und Sprechblase
 * reagieren. Solange sich nichts bewegt, läuft keine Bildschleife.
 */
import { DATEN, type EbenenName } from './daten';
import { Figur, type Mimik } from './figur';
import { Welt, koerper, schwerpunkt, wurf, type Koerper, type Kreis, type Stoss } from './physik';
import { LICHT_STIL } from './stil';

export interface SpielAngaben {
  /** Ordner mit den Bildebenen, mit Schrägstrich am Ende */
  quelle: string;
  /** Adresse, die der WhatsApp-Ball öffnet (fertig gebaut, mit vorausgefülltem Text) */
  whatsapp: string;
  /** „Bewegung reduzieren“: dann steht alles still, Menü und Link bleiben */
  ruhig: boolean;
  texte?: Partial<typeof TEXTE>;
  /** Höhe, die unten frei bleiben muss (zum Beispiel die Bewerbenleiste am Handy), in Bildpunkten */
  bodenAbstand?: () => number;
  /** Klassen für die Hülle des Balls im Dokument (zum Beispiel „print-hidden“) */
  klasse?: string;
}

export const TEXTE = {
  figur: 'Helfer: Auswahl öffnen',
  ball: 'WhatsApp-Ball: Nachricht schreiben (öffnet in neuem Tab)',
  tipp: 'Greif mich ruhig. Ich halte das aus.',
  frage: 'Was machen wir?',
  fussball: 'Fußball spielen',
  basketball: 'Basketball spielen',
  ende: 'Spiel beenden',
  platz: 'Zurück an den Platz',
  hoch: 'Hochwerfen',
  bewerfen: 'Mit dem Ball bewerfen',
  weg: 'Wegschicken',
  schliessen: 'Sprechblase schließen',
  zurueck: 'Helfer zurückholen',
  hey: 'Hey!',
  autsch: 'Autsch.',
  heil: 'Nichts passiert.',
  tor: 'Tor!',
  korb: 'Korb!',
  tschuess: 'Bis später.',
  wieder: 'Da bin ich wieder.',
  los: 'Los geht’s. Wirf mir den Ball zu.',
};

type Zustand = 'steht' | 'frei' | 'stehtAuf' | 'zerlegt' | 'baut' | 'putzt' | 'weg';
type Sport = 'fussball' | 'basketball' | null;
interface Aktion {
  text: string;
  tun: () => void;
}
interface Teil {
  name: EbenenName;
  el: HTMLElement;
  k: Koerper;
  /** Lage im Kasten, vom Schwerpunkt der Figur aus (Mitte des Teils) */
  heim: { x: number; y: number };
  von: { x: number; y: number; w: number };
  warte: number;
  da: boolean;
}

/** Kollisionsform der Figur in Kastenkoordinaten: Kopf, Rumpf, zwei Füße. Der Kopf ist leichter als er aussieht. */
const FIGUR_KREISE: Kreis[] = [
  { x: 322, y: 190, r: 116, d: 0.5 },
  { x: 320, y: 420, r: 70, d: 1.4 },
  { x: 266, y: 596, r: 24, d: 1.8 },
  { x: 374, y: 596, r: 24, d: 1.8 },
];
const FUSS_UNTEN = 620;
const SP = schwerpunkt(FIGUR_KREISE);
/** Hand des fernen Arms in der Haltung „winken“: dort hält er den Ball */
const HAND = { x: 486, y: 322 };
const TEILE: { name: EbenenName; warte: number }[] = [
  { name: 'arm-fern-unten', warte: 0.36 },
  { name: 'bein-fern', warte: 0 },
  { name: 'bein-nah', warte: 0.08 },
  { name: 'rumpf', warte: 0.22 },
  { name: 'kopf-jubel', warte: 0.6 },
  { name: 'arm-nah-unten', warte: 0.44 },
];

// Schwellen: Tempo, mit dem zwei Dinge aufeinandertreffen, in Bildpunkten je Sekunde
const KIPP_BALL = 1100;
const SPLITTER_BALL = 1900;
const STAUB_WELT = 650;
const SPLITTER_WELT = 1750;

const begrenze = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const weich = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const zufall = (a: number, b: number) => a + Math.random() * (b - a);

function el<K extends keyof HTMLElementTagNameMap>(name: K, klasse: string, attribute: Record<string, string> = {}): HTMLElementTagNameMap[K] {
  const e = document.createElement(name);
  e.className = klasse;
  for (const k of Object.keys(attribute)) e.setAttribute(k, attribute[k]);
  return e;
}

export class Spiel {
  private readonly T: typeof TEXTE;
  private readonly welt = new Welt();
  private readonly feld: HTMLElement;
  private readonly fig: Figur;
  private readonly knopf: HTMLButtonElement;
  private readonly ballEl: HTMLElement;
  private readonly ballLink: HTMLAnchorElement;
  private blatt: CSSStyleSheet | null = null;
  private readonly ballRegel: CSSStyleDeclaration;
  private wachBis = 0;
  private gezogen = false;
  private tippGezeigt = false;
  private letzterTipp = { x: 0, y: 0 };
  private readonly blase: HTMLElement;
  private readonly blaseText: HTMLElement;
  private readonly blaseAkt: HTMLElement;
  private readonly mini: HTMLButtonElement;
  private readonly schattenF: HTMLElement;
  private readonly schattenB: HTMLElement;
  private readonly kf: Koerper;
  private readonly kb: Koerper;
  private readonly k: number;
  private readonly rBall: number;
  private zustand: Zustand = 'steht';
  private sport: Sport = null;
  private teile: Teil[] = [];
  private torEl: HTMLElement | null = null;
  private korbEl: HTMLElement | null = null;
  private korb = { x: 0, y: 0, hw: 0 };
  private bildNr = 0;
  private letzte = 0;
  private uhr = 0;
  private aus = false;
  private zeiger: { x: number; y: number; zeit: number } | null = null;
  private ziel: { x: number; dann: () => void } | null = null;
  private tempo = 340;
  private traegt = false;
  private schrittUhr = 0;
  private schrittNr = 0;
  private taetig = false;
  private kiPause = 0;
  private phase = 0;
  private phaseUhr = 0;
  private aufVon = { x: 0, y: 0, w: 0 };
  private harterFall = false;
  private pieks: number[] = [];
  private blaseOffen = false;
  private menueOffen = false;
  private ballHeimUhr = 0;
  private figurHeimUhr = 0;
  private torDrin = false;
  private ballVorY = 0;
  private dribbel: { u: number; stufe: number } | null = null;
  private spiegel = false;
  private scrollNeigung = 0;
  private letztesY = 0;
  private readonly uhren = new Set<number>();
  private readonly ab: (() => void)[] = [];

  /**
   * @param wurzel Schattenwurzel für Figur, Sprechblase, Staub und Spielgerät. Stiländerungen darin sieht kein
   *               Beobachter der Seite, und die Stilregeln der Seite greifen dort nicht.
   * @param licht  Element im Dokument für den WhatsApp-Ball: Er bleibt ein gewöhnlicher Link der Seite.
   */
  constructor(
    wurzel: ShadowRoot | HTMLElement,
    licht: HTMLElement,
    private readonly a: SpielAngaben,
  ) {
    this.T = { ...TEXTE, ...(a.texte ?? {}) };
    const schmal = window.innerWidth < 520;
    this.k = (schmal ? 140 : 190) / DATEN.kasten[1];
    this.rBall = schmal ? 25 : 28;
    const k = this.k;

    this.feld = el('div', 'hf-feld');
    this.schattenF = el('div', 'hf-schatten');
    this.schattenB = el('div', 'hf-schatten');
    this.feld.append(this.schattenF, this.schattenB);

    // Ball: ein gewöhnlicher Link der Seite. Antippen folgt dem Link. Beim Ziehen nimmt die Hülle keine Zeiger mehr an,
    // darum löst Loslassen keinen Klick auf dem Link aus. Die Lage setzt eine Stilregel, kein style-Attribut.
    this.ballEl = el('div', `hf-ball-halter ${a.klasse ?? ''}`.trim());
    this.ballLink = el('a', 'hf-ball', { href: a.whatsapp, target: '_blank', rel: 'noopener noreferrer', 'aria-label': this.T.ball, draggable: 'false' });
    this.ballLink.innerHTML =
      '<svg viewBox="0 0 24 24" width="56%" height="56%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 1 1-4.6 16.7L3 21l1.3-4.4A9 9 0 0 1 12 3Z"/></svg>';
    this.ballEl.append(this.ballLink);
    let regel: CSSStyleDeclaration | null = null;
    try {
      const blatt = new CSSStyleSheet();
      blatt.replaceSync(LICHT_STIL);
      const nr = blatt.insertRule(
        `.hf-ball-halter{width:${this.rBall * 2}px;height:${this.rBall * 2}px;margin:${-this.rBall}px 0 0 ${-this.rBall}px;transform:translate3d(-200px,-200px,0)}`,
        blatt.cssRules.length,
      );
      regel = (blatt.cssRules[nr] as CSSStyleRule).style;
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, blatt];
      this.blatt = blatt;
    } catch {
      /* ältere Browser: Lage direkt am Element */
    }
    if (!regel) {
      const st = this.ballEl.style;
      st.position = 'fixed';
      st.left = st.top = '0';
      st.zIndex = '41';
      st.width = st.height = `${this.rBall * 2}px`;
      st.margin = `${-this.rBall}px 0 0 ${-this.rBall}px`;
      regel = st;
    }
    this.ballRegel = regel;

    // Figur
    this.fig = new Figur(a.quelle, k, SP);
    this.fig.el.classList.add('hf-koerper', 'hf-ruht');
    this.knopf = el('button', 'hf-knopf', { type: 'button', 'aria-label': this.T.figur, 'aria-expanded': 'false' });
    this.knopf.style.left = `${(196 - SP.x) * k}px`;
    this.knopf.style.top = `${(48 - SP.y) * k}px`;
    this.knopf.style.width = `${254 * k}px`;
    this.knopf.style.height = `${578 * k}px`;
    this.fig.el.append(this.knopf);

    // Sprechblase
    this.blase = el('div', 'hf-blase', { role: 'group', 'aria-label': this.T.figur });
    this.blase.hidden = true;
    this.blaseText = el('p', 'hf-text', { role: 'status', 'aria-live': 'polite' });
    this.blaseAkt = el('div', 'hf-aktionen');
    const zu = el('button', 'hf-zu', { type: 'button', 'aria-label': this.T.schliessen });
    zu.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M3 3 13 13M13 3 3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
    zu.addEventListener('click', () => {
      this.schliesse();
      this.knopf.focus();
    });
    this.blase.append(this.blaseText, zu, this.blaseAkt);

    // Knopf zum Zurückholen
    this.mini = el('button', 'hf-mini', { type: 'button', 'aria-label': this.T.zurueck });
    this.mini.hidden = true;
    const mb = el('img', '');
    mb.alt = '';
    mb.width = mb.height = 56;
    mb.loading = 'lazy';
    mb.src = `${a.quelle}mini.webp`;
    this.mini.append(mb);
    this.mini.addEventListener('click', () => this.holeZurueck());

    this.feld.append(this.fig.el, this.blase, this.mini);
    wurzel.append(this.feld);
    licht.append(this.ballEl);

    // Körper
    this.kf = this.welt.dazu(
      koerper({ name: 'figur', masse: 1, prall: 0.24, reibung: 0.72, rollen: 16, luft: 0.07, kreise: FIGUR_KREISE.map((c) => ({ x: c.x * k, y: c.y * k, r: c.r * k, d: c.d })) }),
    );
    this.kb = this.welt.dazu(koerper({ name: 'ball', masse: 0.14, prall: 0.76, reibung: 0.5, rollen: 5, luft: 0.1, kreise: [{ x: 0, y: 0, r: this.rBall }] }));
    this.welt.beiStoss = (s) => this.stoss(s);
    this.masse();
    this.stell(this.heimFigur());
    this.kb.x = this.heimBall();
    this.kb.y = this.welt.boden - this.rBall;
    this.kb.schlaeft = true;

    this.verdrahte();
    this.zeichne();
  }

  /* ------------------------------------------------------------ Grundlagen */
  private nach(ms: number, tun: () => void): number {
    const id = window.setTimeout(() => {
      this.uhren.delete(id);
      if (!this.aus) tun();
    }, ms);
    this.uhren.add(id);
    return id;
  }
  /**
   * Weckt den Helfer für eine halbe Minute: Er schaut dem Zeiger nach und blinzelt. Vorher und danach steht er
   * völlig still, damit auf der Seite nichts von selbst zappelt.
   */
  private weckeAuf(): void {
    const schlief = performance.now() > this.wachBis;
    this.wachBis = performance.now() + 30000;
    if (!schlief || this.a.ruhig) return;
    this.fig.ladeRest();
    this.nach(1800, () => this.blinzeln());
    this.laeufe();
  }
  private get wach(): boolean {
    return performance.now() < this.wachBis;
  }
  /** Fenster oder feste Leisten haben sich geändert: Wände und Boden neu setzen. */
  vermesse(): void {
    const w = this.welt;
    const alt = { links: w.links, rechts: w.rechts, boden: w.boden };
    this.masse();
    // Nichts hat sich geändert: nichts anfassen. Die Seite ruft das bei jedem Seitenwechsel und jedem Ein- und
    // Ausblenden der Bewerbenleiste, auch mitten in ihren eigenen Bewegungen.
    if (alt.links === w.links && alt.rechts === w.rechts && alt.boden === w.boden) return;
    if (this.zustand === 'steht' && !this.ziel) this.stell(begrenze(this.kf.x, w.links + 40, this.heimFigur()));
    const b = this.kb;
    const ruht =
      !this.bildNr && b.aktiv && b.schlaeft && this.teile.length === 0 && (this.zustand === 'steht' || this.zustand === 'weg') && Math.abs(b.y - (alt.boden - this.rBall)) < 2;
    if (ruht) {
      // Alles ruht: Der Ball kommt ohne Rechnung auf den neuen Boden. Einmal zeichnen, keine Bildschleife.
      b.x = begrenze(b.x, w.links + this.rBall, w.rechts - this.rBall);
      b.y = w.boden - this.rBall;
      this.zeichne();
      return;
    }
    w.wecke(b);
    for (const t of this.teile) w.wecke(t.k);
    this.laeufe();
    this.zeichne();
  }
  private masse(): void {
    const unten = this.a.bodenAbstand ? this.a.bodenAbstand() : 0;
    this.welt.links = 4;
    this.welt.rechts = window.innerWidth - 4;
    this.welt.boden = window.innerHeight - 10 - unten;
  }
  private get yStand(): number {
    return this.welt.boden - (FUSS_UNTEN - SP.y) * this.k;
  }
  private heimFigur(): number {
    // so weit links, dass auch der winkende Arm ganz im Bild bleibt
    return this.welt.rechts - 232 * this.k - 6;
  }
  private heimBall(): number {
    return this.heimFigur() - 150 * this.k - this.rBall - 14;
  }
  /** Figur aufrecht an eine Stelle stellen */
  private stell(x: number): void {
    const f = this.kf;
    f.x = x;
    f.y = this.yStand;
    f.winkel = 0;
    f.vx = f.vy = f.dreh = 0;
    f.starr = true;
    f.schlaeft = false;
    f.griff = null;
  }
  private laeufe(): void {
    if (!this.bildNr && !this.aus) this.bildNr = requestAnimationFrame(this.bild);
  }

  private verdrahte(): void {
    const an = <K extends keyof WindowEventMap>(name: K, tun: (e: WindowEventMap[K]) => void, opt?: AddEventListenerOptions) => {
      window.addEventListener(name, tun, opt);
      this.ab.push(() => window.removeEventListener(name, tun, opt));
    };
    an('pointermove', (e) => {
      this.zeiger = { x: e.clientX, y: e.clientY, zeit: performance.now() };
      if (this.wach && this.zustand === 'steht') this.laeufe();
    }, { passive: true });
    an('resize', () => this.vermesse(), { passive: true });
    this.letztesY = window.scrollY;
    an('scroll', () => {
      const y = window.scrollY;
      if (this.wach) this.scrollNeigung = begrenze(this.scrollNeigung - (y - this.letztesY) * 0.12, -6, 6);
      this.letztesY = y;
      if (this.wach && this.zustand === 'steht') this.laeufe();
    }, { passive: true });
    an('keydown', (e) => {
      if (e.key === 'Escape' && this.blaseOffen) {
        this.schliesse();
        this.knopf.focus();
      }
    });
    an('pointerdown', (e) => {
      if (this.menueOffen && !e.composedPath().includes(this.blase) && !e.composedPath().includes(this.fig.el)) this.schliesse();
    }, { passive: true });

    // Figur: antippen piekst und öffnet die Auswahl, ziehen hebt sie hoch. Mit der Tastatur öffnet Enter die Auswahl.
    this.knopf.addEventListener('click', (e) => {
      if (this.gezogen) {
        this.gezogen = false;
        return;
      }
      this.weckeAuf();
      if (e.detail === 0 || this.a.ruhig) {
        if (this.blaseOffen && this.menueOffen) this.schliesse();
        else this.oeffne();
      } else {
        this.piekse(this.letzterTipp.x, this.letzterTipp.y);
      }
    });
    this.greifbar(this.knopf, null, () => (this.zustand === 'steht' || this.zustand === 'frei' ? this.kf : null), {
      start: () => this.hebAuf(),
      los: () => {
        if (this.zustand === 'frei') this.fig.mimik('staunen');
      },
    });
    this.knopf.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || this.a.ruhig) return;
      this.weckeAuf();
      if (this.zustand === 'steht' && !this.taetig && !this.ziel && !this.blaseOffen) {
        this.winke();
        if (!this.tippGezeigt && !this.sport) {
          this.tippGezeigt = true;
          this.sag(this.T.tipp, 4200);
        }
      }
    });

    // Ball: antippen folgt dem Link, ziehen wirft
    this.ballLink.addEventListener('dragstart', (e) => e.preventDefault());
    this.greifbar(this.ballLink, this.ballEl, () => this.kb, {
      start: () => {
        if (this.traegt) {
          this.ziel = null;
          this.fig.haltung('stand', this.spiegel);
          this.taetig = false;
        }
        this.dribbel = null;
        this.traegt = false;
        this.kb.aktiv = true;
        this.ballHeimUhr = 0;
      },
      los: () => undefined,
    });
  }

  /**
   * Macht ein Element greifbar: ziehen setzt den Griff der Physik, loslassen wirft.
   * Solange gezogen wird, nimmt `huelle` keine Zeiger an. Darum endet das Ziehen nie mit einem Klick auf dem Element.
   */
  private greifbar(e: HTMLElement, huelle: HTMLElement | null, hol: () => Koerper | null, beim: { start: () => void; los: () => void }): void {
    e.addEventListener('pointerdown', (d) => {
      this.letzterTipp = { x: d.clientX, y: d.clientY };
      if (this.a.ruhig || (d.pointerType === 'mouse' && d.button !== 0)) return;
      if (!hol()) return;
      this.weckeAuf();
      const sx = d.clientX;
      const sy = d.clientY;
      const zeiger = d.pointerId;
      let zieht = false;
      const bewegt = (m: PointerEvent) => {
        if (m.pointerId !== zeiger) return;
        const k = hol();
        if (!k) return;
        if (!zieht && Math.hypot(m.clientX - sx, m.clientY - sy) > 6) {
          zieht = true;
          this.gezogen = true;
          beim.start();
          const c = Math.cos(-k.winkel);
          const s = Math.sin(-k.winkel);
          const dx = sx - k.x;
          const dy = sy - k.y;
          k.griff = { lx: dx * c - dy * s, ly: dx * s + dy * c, zx: m.clientX, zy: m.clientY };
          huelle?.classList.add('hf-zieht');
        }
        if (zieht && k.griff) {
          k.griff.zx = m.clientX;
          k.griff.zy = m.clientY;
          this.welt.wecke(k);
          this.laeufe();
        }
      };
      const ende = (u: PointerEvent) => {
        if (u.pointerId !== zeiger) return;
        window.removeEventListener('pointermove', bewegt);
        window.removeEventListener('pointerup', ende);
        window.removeEventListener('pointercancel', ende);
        const k = hol();
        if (k) k.griff = null;
        if (zieht) {
          beim.los();
          // erst nach dem Klick-Ereignis des Browsers wieder Zeiger annehmen
          this.nach(0, () => {
            huelle?.classList.remove('hf-zieht');
            this.gezogen = false;
          });
        }
        this.laeufe();
      };
      window.addEventListener('pointermove', bewegt);
      window.addEventListener('pointerup', ende);
      window.addEventListener('pointercancel', ende);
    });
  }

  /* ------------------------------------------------------------- Bildschleife */
  private bild = (jetzt: number): void => {
    this.bildNr = 0;
    if (this.aus) return;
    let dt = (jetzt - this.letzte) / 1000;
    if (!(dt > 0) || dt > 0.2) dt = 1 / 60;
    dt = Math.min(dt, 0.05);
    this.letzte = jetzt;
    this.uhr += dt;
    try {
      if (this.welt.wach) this.welt.schritt(dt);
      const weiter = this.steuere(dt);
      this.zeichne();
      if (weiter || this.welt.wach) this.laeufe();
    } catch {
      // Ein Fehler im Spielzeug darf die Seite nie stören: still abbauen.
      this.zerstoere();
    }
  };

  /** Zustände weiterführen. Gibt true zurück, solange noch etwas zu tun ist. */
  private steuere(dt: number): boolean {
    let weiter = false;
    switch (this.zustand) {
      case 'steht':
        weiter = this.stehen(dt);
        break;
      case 'frei':
        weiter = this.freiSein();
        break;
      case 'stehtAuf':
        weiter = this.aufstehen(dt);
        break;
      case 'zerlegt':
        weiter = this.liegenInTeilen(dt);
        break;
      case 'baut':
        weiter = this.bauen(dt);
        break;
      case 'putzt':
        weiter = true;
        break;
      case 'weg':
        break;
    }
    if (this.dribbeln(dt)) weiter = true;
    if (this.tore()) weiter = true;
    if (this.aufraeumen(dt)) weiter = true;
    return weiter;
  }

  /* -------------------------------------------------------------------- Stehen */
  private stehen(dt: number): boolean {
    const f = this.kf;
    if (this.ziel) {
      // laufen
      const dx = this.ziel.x - f.x;
      const schritt = this.tempo * dt;
      this.schrittUhr += dt;
      if (this.schrittUhr > 0.13) {
        this.schrittUhr = 0;
        this.fig.laufbild(++this.schrittNr);
      }
      if (Math.abs(dx) <= schritt) {
        f.x = this.ziel.x;
        f.y = this.yStand;
        const dann = this.ziel.dann;
        this.ziel = null;
        this.fig.haltung('stand', this.spiegel);
        this.fig.el.classList.add('hf-ruht');
        dann();
      } else {
        f.x += Math.sign(dx) * schritt;
        f.y = this.yStand - Math.abs(Math.sin(this.uhr * 24)) * 7 * this.k * 3;
      }
      return true;
    }
    // Blick: Zeiger, sonst der Ball, wenn er sich bewegt
    let zx: number | null = null;
    let zy = 0;
    if (!this.kb.schlaeft && this.kb.aktiv) {
      zx = this.kb.x;
      zy = this.kb.y;
    } else if (this.wach && this.zeiger && performance.now() - this.zeiger.zeit < 5000) {
      zx = this.zeiger.x;
      zy = this.zeiger.y;
    }
    let nx = 0;
    let ny = 0;
    if (zx !== null) {
      const m = this.fig.kopfmitte();
      nx = begrenze((zx - m.x) / 260, -1, 1) * (this.spiegel ? -1 : 1);
      ny = begrenze((zy - m.y) / 260, -1, 1);
    }
    const rest = this.fig.blick(nx, ny, this.scrollNeigung);
    this.scrollNeigung *= 0.9;
    this.ki(dt);
    return rest > 0.05 || Math.abs(this.scrollNeigung) > 0.05 || zx !== null || this.taetig || this.sport !== null;
  }

  private laufeZu(x: number, dann: () => void, tempo = 340): void {
    const f = this.kf;
    this.tempo = tempo;
    const zx = begrenze(x, this.welt.links - 400, this.welt.rechts + 400);
    this.schliesse();
    if (Math.abs(zx - f.x) < 4 || this.a.ruhig) {
      f.x = zx;
      dann();
      return;
    }
    this.ziel = { x: zx, dann };
    this.fig.el.classList.remove('hf-ruht');
    this.fig.haltung('lauf', zx < f.x);
    this.laeufe();
  }

  private blinzeln(): void {
    if (!this.wach || this.a.ruhig) return;
    if (this.zustand === 'steht' && !this.ziel) {
      this.fig.blinzle(true);
      this.nach(130, () => this.fig.blinzle(false));
    }
    this.nach(2600 + Math.random() * 3200, () => this.blinzeln());
  }
  private winke(): void {
    if (this.zustand !== 'steht' || this.ziel || this.a.ruhig) return;
    this.fig.arm('fern', 'winken');
    this.fig.bewege('hf-winkt', 1500);
    this.nach(1500, () => {
      if (this.zustand === 'steht' && !this.dribbel) this.fig.arm('fern', 'unten');
    });
  }
  private gesicht(m: Mimik, ms: number): void {
    this.fig.mimik(m);
    this.nach(ms, () => {
      if (this.zustand === 'steht' || this.zustand === 'frei') this.fig.mimik(this.zustand === 'frei' ? 'staunen' : 'lachen');
    });
  }

  /* ------------------------------------------------------- Greifen und Pieksen */
  private hebAuf(): void {
    const f = this.kf;
    this.schliesse();
    this.ziel = null;
    this.taetig = false;
    this.dribbelEnde();
    f.starr = false;
    this.welt.wecke(f);
    this.zustand = 'frei';
    this.harterFall = false;
    this.fig.haltung('stand', false);
    this.spiegel = false;
    this.fig.el.classList.remove('hf-ruht', 'hf-spiegel');
    this.fig.mimik('staunen');
    this.fig.arm('fern', 'winken');
    this.fig.arm('nah', 'unten');
  }

  private piekse(x: number, y: number): void {
    const jetzt = performance.now();
    this.pieks = this.pieks.filter((t) => jetzt - t < 1700);
    this.pieks.push(jetzt);
    if (this.zustand === 'frei') {
      // liegt oder fliegt: der Piekser schubst
      const f = this.kf;
      const d = Math.hypot(f.x - x, f.y - y) || 1;
      this.welt.impuls(f, ((f.x - x) / d) * 260, ((f.y - y) / d) * 260 - 120, x, y);
      this.laeufe();
      return;
    }
    if (this.zustand !== 'steht') return;
    if (this.pieks.length >= 5) {
      // zu oft gepiekst: er kippt um
      this.pieks = [];
      this.sag(this.T.hey, 1600);
      this.hebAuf();
      const links = x > this.kf.x;
      this.welt.impuls(this.kf, links ? -380 : 380, -260, x, this.kf.y - 80 * this.k);
      this.laeufe();
      return;
    }
    this.fig.bewege(x > this.kf.x ? 'hf-wackelt-l' : 'hf-wackelt-r', 620);
    if (this.pieks.length >= 3) {
      this.gesicht('staunen', 900);
      this.sag(this.T.hey, 1400);
    } else {
      this.gesicht('zwinkern', 700);
      if (this.blaseOffen && this.menueOffen) this.schliesse();
      else this.oeffne();
    }
  }

  /* ---------------------------------------------------------------- Frei fallen */
  private freiSein(): boolean {
    const f = this.kf;
    if (f.griff) return true;
    if (f.schlaeft) {
      // liegt still: aufstehen
      this.aufVon = { x: f.x, y: f.y, w: f.winkel };
      this.phaseUhr = 0;
      this.zustand = 'stehtAuf';
      f.starr = true;
      f.schlaeft = false;
      this.fig.mimik('schmunzeln');
      this.fig.arm('fern', 'unten');
    }
    return true;
  }

  private aufstehen(dt: number): boolean {
    const f = this.kf;
    this.phaseUhr += dt;
    const u = begrenze(this.phaseUhr / 0.5, 0, 1);
    const e = weich(u);
    const wZiel = Math.round(this.aufVon.w / (2 * Math.PI)) * 2 * Math.PI;
    const xZiel = begrenze(this.aufVon.x, this.welt.links + 130 * this.k, this.welt.rechts - 130 * this.k);
    f.x = this.aufVon.x + (xZiel - this.aufVon.x) * e;
    f.y = this.aufVon.y + (this.yStand - this.aufVon.y) * e - Math.sin(Math.PI * u) * 46 * this.k * 3;
    f.winkel = this.aufVon.w + (wZiel - this.aufVon.w) * e;
    if (u >= 1) {
      this.stell(xZiel);
      this.zustand = 'steht';
      this.fig.el.classList.add('hf-ruht');
      this.staub(f.x, this.welt.boden, 5);
      if (this.harterFall) this.putze(false);
      else this.fig.mimik('lachen');
    }
    return true;
  }

  /* ------------------------------------------------------------------- Stöße */
  private stoss(s: Stoss): void {
    const f = this.kf;
    const b = this.kb;
    const figur = s.a === f || s.b === f;
    const ball = s.a === b || s.b === b;
    if (figur && ball) {
      if (this.zustand === 'steht') {
        if (s.tempo > SPLITTER_BALL) {
          this.zerspringe(s.x, s.y, s.tempo);
        } else if (s.tempo > KIPP_BALL) {
          // umgeworfen: der Ball gibt ihm seinen Schwung mit
          this.hebAuf();
          const nx = s.a === f ? s.nx : -s.nx;
          const ny = s.a === f ? s.ny : -s.ny;
          this.welt.impuls(f, nx * s.impuls * 0.9, ny * s.impuls * 0.9 - 120, s.x, s.y);
          this.harterFall = true;
          this.sag(this.T.autsch, 1400);
        } else if (s.tempo > 160) {
          const kopf = s.y < f.y - 20 * this.k;
          if (kopf && this.sport) {
            // Kopfball
            this.welt.impuls(b, zufall(-60, 60) * b.masse, -520 * b.masse, b.x, b.y);
            this.gesicht('jubel', 600);
          } else {
            this.fig.bewege(s.x > f.x ? 'hf-wackelt-l' : 'hf-wackelt-r', 620);
            this.gesicht('staunen', 700);
          }
        }
      } else if (this.zustand === 'frei' && s.tempo > SPLITTER_BALL) {
        this.zerspringe(s.x, s.y, s.tempo);
      }
      return;
    }
    if (figur && !s.b && this.zustand === 'frei') {
      if (s.tempo > SPLITTER_WELT) this.zerspringe(s.x, s.y, s.tempo);
      else if (s.tempo > STAUB_WELT) {
        this.harterFall = true;
        this.staub(s.x, s.y, 6);
      }
      return;
    }
    if (ball && !s.b && s.tempo > 900) this.staub(s.x, s.y, 3);
  }

  /* -------------------------------------------------- Zerspringen und Zusammenbau */
  private zerspringe(px: number, py: number, tempo: number): void {
    if (this.zustand === 'zerlegt' || this.zustand === 'baut') return;
    const f = this.kf;
    const k = this.k;
    this.schliesse();
    this.ziel = null;
    this.taetig = false;
    this.dribbelEnde();
    this.zustand = 'zerlegt';
    this.phaseUhr = 0;
    this.fig.el.hidden = true;
    f.aktiv = false;
    f.griff = null;
    const c = Math.cos(f.winkel);
    const s = Math.sin(f.winkel);
    this.staub(px, py, 12);
    for (const t of TEILE) {
      const e = DATEN.ebenen[t.name];
      const hx = (e.x + e.w / 2 - SP.x) * k;
      const hy = (e.y + e.h / 2 - SP.y) * k;
      const lang = Math.max(e.w, e.h) * k;
      const kurz = Math.min(e.w, e.h) * k;
      let kreise: Kreis[];
      if (lang / kurz > 1.45) {
        const r = kurz * 0.4;
        const d = (lang / 2 - r) * 0.85;
        kreise = e.h > e.w ? [{ x: 0, y: -d, r }, { x: 0, y: d, r }] : [{ x: -d, y: 0, r }, { x: d, y: 0, r }];
      } else {
        kreise = [{ x: 0, y: 0, r: ((e.w + e.h) / 4) * k * 0.8 }];
      }
      const teilK = this.welt.dazu(koerper({ name: `teil-${t.name}`, masse: 0.05 + (e.w * e.h * k * k) / 60000, prall: 0.36, reibung: 0.62, rollen: 10, luft: 0.09, kreise }));
      teilK.x = f.x + hx * c - hy * s;
      teilK.y = f.y + hx * s + hy * c;
      teilK.winkel = f.winkel;
      const ax = teilK.x - px;
      const ay = teilK.y - py;
      const al = Math.hypot(ax, ay) || 1;
      const wucht = (260 + tempo * 0.34) * zufall(0.6, 1.2);
      teilK.vx = f.vx * 0.5 - f.dreh * (teilK.y - f.y) * 0.5 + (ax / al) * wucht;
      teilK.vy = f.vy * 0.5 + f.dreh * (teilK.x - f.x) * 0.5 + (ay / al) * wucht - zufall(180, 420);
      teilK.dreh = f.dreh + zufall(-11, 11);
      const te = el('div', 'hf-teil hf-koerper');
      const b = this.fig.bild(t.name, '');
      b.style.left = `${(-e.w / 2) * k}px`;
      b.style.top = `${(-e.h / 2) * k}px`;
      b.style.width = `${e.w * k}px`;
      b.style.height = `${e.h * k}px`;
      te.append(b);
      this.feld.insertBefore(te, this.blase);
      this.teile.push({ name: t.name, el: te, k: teilK, heim: { x: hx, y: hy }, von: { x: 0, y: 0, w: 0 }, warte: t.warte, da: false });
    }
    f.vx = f.vy = f.dreh = 0;
    this.laeufe();
  }

  private liegenInTeilen(dt: number): boolean {
    this.phaseUhr += dt;
    const ruhig = this.teile.every((t) => t.k.schlaeft);
    if ((this.phaseUhr > 1.3 && ruhig) || this.phaseUhr > 2.6) {
      // Sammelpunkt: dort, wo die Beine liegen
      const beine = this.teile.filter((t) => t.name.startsWith('bein'));
      const mitte = beine.reduce((s, t) => s + t.k.x, 0) / beine.length;
      const xa = begrenze(mitte, this.welt.links + 130 * this.k, this.welt.rechts - 130 * this.k);
      for (const t of this.teile) {
        t.k.aktiv = false;
        t.von = { x: t.k.x, y: t.k.y, w: t.k.winkel };
        t.da = false;
      }
      this.stell(xa);
      this.kf.aktiv = false;
      this.zustand = 'baut';
      this.phaseUhr = 0;
    }
    return true;
  }

  private bauen(dt: number): boolean {
    const f = this.kf;
    this.phaseUhr += dt;
    const ruettel = 0.45;
    const dauer = 0.42;
    let alle = true;
    for (const t of this.teile) {
      const u = begrenze((this.phaseUhr - ruettel - t.warte) / dauer, 0, 1);
      if (this.phaseUhr < ruettel) {
        // die Teile klappern kurz, bevor sie sich aufmachen
        t.k.x = t.von.x + zufall(-1.6, 1.6);
        t.k.y = t.von.y + zufall(-1.6, 0.4);
        t.k.winkel = t.von.w + zufall(-0.05, 0.05);
        alle = false;
        continue;
      }
      const e = weich(u);
      const wZiel = Math.round(t.von.w / (2 * Math.PI)) * 2 * Math.PI;
      t.k.x = t.von.x + (f.x + t.heim.x - t.von.x) * e;
      t.k.y = t.von.y + (f.y + t.heim.y - t.von.y) * e - Math.sin(Math.PI * u) * 70;
      t.k.winkel = t.von.w + (wZiel - t.von.w) * e + (t.name.startsWith('kopf') ? (1 - e) * Math.PI * 2 : 0);
      if (u >= 1 && !t.da) {
        t.da = true;
        this.staub(t.k.x, t.k.y + 10, 2);
      }
      if (u < 1) alle = false;
    }
    if (alle && this.phaseUhr > ruettel + 0.6 + dauer + 0.12) {
      for (const t of this.teile) {
        this.welt.weg(t.k);
        t.el.remove();
      }
      this.teile = [];
      f.aktiv = true;
      this.fig.el.hidden = false;
      this.fig.haltung('stand', false);
      this.fig.arm('fern', 'unten');
      this.fig.arm('nah', 'unten');
      this.putze(true);
    }
    return true;
  }

  /** Nach dem Zusammenbau: Kopf schütteln, Knöchel an der Brust polieren, zwinkern. */
  private putze(ganz: boolean): void {
    this.zustand = 'putzt';
    this.harterFall = false;
    this.fig.mimik('schmunzeln');
    this.fig.el.classList.add('hf-ruht');
    if (this.a.ruhig) {
      this.zustand = 'steht';
      return;
    }
    const start = ganz ? 620 : 120;
    if (ganz) this.fig.bewege('hf-schuettelt', 560);
    this.nach(start, () => {
      this.fig.arm('nah', 'polieren');
      this.fig.bewege('hf-poliert', 1000);
      for (let i = 0; i < 4; i++) {
        this.nach(120 + i * 220, () => {
          const f = this.kf;
          this.staub(f.x + (304 - SP.x) * this.k, f.y + (392 - SP.y) * this.k, 2);
        });
      }
    });
    this.nach(start + 1050, () => {
      this.fig.mimik('zwinkern');
      if (ganz) this.sag(this.T.heil, 2200);
    });
    this.nach(start + 1900, () => {
      this.fig.arm('nah', 'unten');
      this.fig.mimik('lachen');
      this.zustand = 'steht';
      this.kiPause = 1;
      this.laeufe();
    });
    this.laeufe();
  }

  private staub(x: number, y: number, anzahl: number): void {
    if (this.a.ruhig) return;
    for (let i = 0; i < anzahl; i++) {
      const p = el('div', 'hf-staub');
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.setProperty('--hf-dx', `${zufall(-34, 34)}px`);
      p.style.setProperty('--hf-dy', `${zufall(-38, -6)}px`);
      p.style.setProperty('--hf-gr', `${zufall(6, 14)}px`);
      this.feld.append(p);
      this.nach(650, () => p.remove());
    }
  }

  /* --------------------------------------------------------------------- Spiel */
  private spiele(sport: Sport): void {
    this.schliesse();
    // laufende Aktion des vorigen Spiels abbrechen
    if (this.ziel && this.zustand === 'steht') {
      this.ziel = null;
      this.kf.y = this.yStand;
      this.fig.haltung('stand', false);
      this.fig.el.classList.add('hf-ruht');
    }
    this.taetig = false;
    this.fig.arm('fern', 'unten');
    this.sport = sport;
    this.torEl?.remove();
    this.korbEl?.remove();
    this.torEl = this.korbEl = null;
    this.welt.fest = [];
    this.torDrin = false;
    this.dribbelEnde();
    const w = this.welt;
    if (sport === 'fussball') {
      this.torEl = el('div', 'hf-tor', { 'aria-hidden': 'true' });
      this.torEl.style.left = `${w.links}px`;
      this.torEl.style.top = `${w.boden - 150}px`;
      this.feld.insertBefore(this.torEl, this.feld.firstChild);
    } else if (sport === 'basketball') {
      const hw = this.rBall + 14;
      const x = w.links + 22 + hw;
      const y = w.boden - Math.min(330, window.innerHeight * 0.46);
      this.korb = { x, y, hw };
      // Ring: zwei kleine feste Kreise, Brett: eine Reihe fester Kreise
      w.fest.push({ x: x - hw, y, r: 4, prall: 0.5 }, { x: x + hw, y, r: 4, prall: 0.5 });
      for (let yy = y - 84; yy <= y + 4; yy += 11) w.fest.push({ x: w.links + 4, y: yy, r: 8, prall: 0.6 });
      this.korbEl = el('div', 'hf-korb', { 'aria-hidden': 'true' });
      this.korbEl.style.left = `${w.links - 2}px`;
      this.korbEl.style.top = `${y - 92}px`;
      this.korbEl.style.setProperty('--hf-ring', `${hw * 2}px`);
      this.korbEl.style.setProperty('--hf-ring-x', `${x - hw - (w.links - 2)}px`);
      this.feld.insertBefore(this.korbEl, this.feld.firstChild);
    }
    this.spiegel = sport !== null;
    this.fig.el.classList.toggle('hf-spiegel', this.spiegel);
    if (sport) {
      this.sag(this.T.los, 2600);
      this.kiPause = 1.2;
      // Platz nehmen: rechts von der Mitte
      this.laufeZu(begrenze(window.innerWidth * 0.62, this.welt.links + 200, this.heimFigur()), () => undefined);
    }
    this.laeufe();
  }

  private handpunkt(): { x: number; y: number } {
    const f = this.kf;
    const dx = (HAND.x - SP.x) * this.k * (this.spiegel ? -1 : 1);
    return { x: f.x + dx - (this.spiegel ? this.rBall * 0.4 : -this.rBall * 0.4), y: f.y + (HAND.y - SP.y) * this.k - this.rBall * 0.7 };
  }

  private ki(dt: number): void {
    if (!this.sport || this.taetig || this.ziel || this.menueOffen) return;
    this.kiPause -= dt;
    if (this.kiPause > 0) return;
    const b = this.kb;
    if (b.griff || !b.aktiv) return;
    const amBoden = b.y > this.welt.boden - this.rBall - 8;
    const langsam = Math.hypot(b.vx, b.vy) < 150;
    if (!(amBoden && langsam)) return;
    const f = this.kf;
    const reich = this.rBall + 52 * this.k;
    // er stellt sich rechts neben den Ball, wenn dort Platz ist
    let seite = 1;
    if (b.x + reich + 130 * this.k > this.welt.rechts) seite = -1;
    this.taetig = true;
    this.laufeZu(b.x + seite * reich, () => {
      const nah = Math.abs(b.x + seite * reich - f.x) < 30 && !b.griff && b.y > this.welt.boden - this.rBall - 30;
      if (!nah) {
        this.taetig = false;
        this.kiPause = 0.3;
        return;
      }
      if (this.sport === 'basketball') this.nimmBall();
      else if (b.x < this.welt.links + 120) this.holeAusDemTor();
      else this.schiesse(seite);
    });
  }

  private schiesse(seite: number): void {
    const b = this.kb;
    this.fig.el.classList.remove('hf-ruht');
    this.fig.haltung('lauf', seite > 0);
    this.fig.laufbild(1);
    this.welt.wecke(b);
    const m = b.masse;
    // unterhalb der Mitte getroffen: der Ball steigt und bekommt Rückwärtsdrall
    this.welt.impuls(b, -seite * m * zufall(780, 1080), -m * zufall(520, 840), b.x, b.y + this.rBall * 0.45);
    this.staub(b.x, this.welt.boden, 3);
    this.nach(240, () => {
      if (this.zustand === 'steht' && !this.ziel) {
        this.fig.haltung('stand', this.spiegel);
        this.fig.el.classList.add('hf-ruht');
      }
      this.taetig = false;
      this.kiPause = 1.5;
    });
  }

  /** Fußball: Der Ball liegt im Tor. Er hebt ihn auf, trägt ihn zur Mitte und legt ihn ab. */
  private holeAusDemTor(): void {
    const b = this.kb;
    b.aktiv = false;
    b.vx = b.vy = b.dreh = 0;
    this.fig.arm('fern', 'winken');
    this.traegt = true;
    this.laufeZu(begrenze(window.innerWidth * 0.55, this.welt.links + 260, this.heimFigur()), () => {
      this.traegt = false;
      b.aktiv = true;
      this.welt.wecke(b);
      this.fig.arm('fern', 'unten');
      this.taetig = false;
      this.kiPause = 0.9;
    });
    this.laeufe();
  }

  private nimmBall(): void {
    const b = this.kb;
    b.aktiv = false;
    b.vx = b.vy = b.dreh = 0;
    this.fig.arm('fern', 'winken');
    this.traegt = true;
    // zum Wurfpunkt tragen: ein gutes Stück vom Korb weg
    const wurfpunkt = begrenze(this.korb.x + begrenze(window.innerWidth * 0.36, 230, 520), this.welt.links + 200 * this.k, this.heimFigur());
    this.laufeZu(wurfpunkt, () => {
      this.traegt = false;
      this.dribbel = { u: 0, stufe: 1 };
      this.laeufe();
    });
    this.laeufe();
  }
  private dribbelEnde(): void {
    if (this.dribbel || this.traegt) {
      this.dribbel = null;
      this.traegt = false;
      this.kb.aktiv = true;
      this.welt.wecke(this.kb);
    }
  }
  /** Basketball: aufheben, zweimal prellen, auf den Korb werfen. */
  private dribbeln(dt: number): boolean {
    const d = this.dribbel;
    const b = this.kb;
    if (this.traegt) {
      // der Ball liegt in der Hand, solange er läuft
      const hp = this.handpunkt();
      b.x += (hp.x - b.x) * 0.5;
      b.y += (hp.y - b.y) * 0.5;
      return true;
    }
    if (!d) return false;
    const h = this.handpunkt();
    const unten = this.welt.boden - this.rBall;
    d.u += dt;
    if (d.stufe === 0) {
      // aufheben
      const u = begrenze(d.u / 0.24, 0, 1);
      b.x += (h.x - b.x) * 0.3;
      b.y = unten + (h.y - unten) * weich(u);
      if (u >= 1) {
        d.stufe = 1;
        d.u = 0;
      }
    } else if (d.stufe <= 2) {
      // prellen: von der Hand zum Boden und zurück, beschleunigt wie im freien Fall
      const u = begrenze(d.u / 0.46, 0, 1);
      const weg = u < 0.5 ? (u * 2) ** 2 : (2 - u * 2) ** 2;
      b.x = h.x;
      b.y = h.y + (unten - h.y) * weg;
      b.winkel += dt * 5;
      if (u >= 1) {
        d.stufe += 1;
        d.u = 0;
      }
    } else {
      // Wurf: Bogen durch den Ring, mit etwas Streuung
      this.dribbel = null;
      b.aktiv = true;
      b.x = h.x;
      b.y = h.y;
      this.welt.wecke(b);
      const zx = this.korb.x + zufall(-9, 9);
      const zy = this.korb.y - this.rBall * 0.5;
      const t = begrenze(Math.hypot(zx - b.x, zy - b.y) / 640, 0.78, 1.2);
      const v = wurf(b.x, b.y, zx, zy, t, this.welt.schwerkraft);
      b.vx = v.vx * zufall(0.97, 1.03);
      b.vy = v.vy * zufall(0.97, 1.03);
      b.dreh = -7;
      this.fig.arm('fern', 'daumen');
      this.fig.bewege('hf-daumt', 400);
      this.nach(900, () => {
        if (this.zustand === 'steht') this.fig.arm('fern', 'unten');
      });
      this.taetig = false;
      this.kiPause = 2.4;
    }
    return true;
  }

  /** Tor und Korb erkennen. */
  private tore(): boolean {
    if (!this.sport) return false;
    const b = this.kb;
    const w = this.welt;
    if (this.sport === 'fussball') {
      const drin = b.aktiv && b.x < w.links + 78 && b.y > w.boden - 140;
      if (drin && !this.torDrin && b.vx < -60) this.jubel(this.T.tor);
      this.torDrin = drin;
    } else {
      const durch = b.aktiv && this.ballVorY < this.korb.y && b.y >= this.korb.y && b.vy > 0 && Math.abs(b.x - this.korb.x) < this.korb.hw - 4;
      if (durch) this.jubel(this.T.korb);
      this.ballVorY = b.y;
    }
    return true;
  }
  private jubel(text: string): void {
    if (this.zustand !== 'steht') return;
    this.sag(text, 1800);
    this.fig.mimik('jubel');
    this.fig.arm('fern', 'daumen');
    this.fig.bewege('hf-daumt', 400);
    this.nach(1700, () => {
      if (this.zustand === 'steht') {
        this.fig.mimik('lachen');
        if (!this.dribbel) this.fig.arm('fern', 'unten');
      }
    });
  }

  /** Ohne Spiel räumt sich alles nach einer Weile selbst auf: der Ball rollt an seinen Platz, der Helfer geht heim. */
  private aufraeumen(dt: number): boolean {
    if (this.sport || this.a.ruhig) return false;
    const b = this.kb;
    let weiter = false;
    if (b.aktiv && b.schlaeft && Math.abs(b.x - this.heimBall()) > 6) {
      this.ballHeimUhr += dt;
      weiter = true;
      if (this.ballHeimUhr > 7) {
        const dx = this.heimBall() - b.x;
        const schritt = Math.sign(dx) * Math.min(Math.abs(dx), 260 * dt);
        b.x += schritt;
        b.y = this.welt.boden - this.rBall;
        b.winkel += schritt / this.rBall;
      }
    } else {
      this.ballHeimUhr = 0;
    }
    if (this.zustand === 'steht' && !this.ziel && !this.taetig && !this.blaseOffen && Math.abs(this.kf.x - this.heimFigur()) > 6) {
      this.figurHeimUhr += dt;
      weiter = true;
      if (this.figurHeimUhr > 12) {
        this.figurHeimUhr = 0;
        this.laufeZu(this.heimFigur(), () => undefined);
      }
    } else {
      this.figurHeimUhr = 0;
    }
    return weiter;
  }

  /* ------------------------------------------------------- Menü und Sprechblase */
  private zeigeBlase(text: string, aktionen: Aktion[]): void {
    this.blaseText.textContent = text;
    this.blaseAkt.textContent = '';
    for (const a of aktionen) {
      const k = el('button', 'hf-akt', { type: 'button' });
      k.textContent = a.text;
      k.addEventListener('click', () => a.tun());
      this.blaseAkt.append(k);
    }
    this.blase.hidden = false;
    this.blaseOffen = true;
    this.zeichne();
  }
  private sag(text: string, ms: number): void {
    this.menueOffen = false;
    this.knopf.setAttribute('aria-expanded', 'false');
    this.zeigeBlase(text, []);
    const merk = text;
    this.nach(ms, () => {
      if (!this.menueOffen && this.blaseText.textContent === merk) this.schliesse();
    });
  }
  private oeffne(): void {
    if (this.zustand !== 'steht') return;
    const a: Aktion[] = [];
    if (!this.a.ruhig) {
      if (this.sport) a.push({ text: this.T.ende, tun: () => this.spiele(null) });
      else {
        a.push({ text: this.T.fussball, tun: () => this.spiele('fussball') });
        a.push({ text: this.T.basketball, tun: () => this.spiele('basketball') });
      }
      // Was sich durch Ziehen erreichen lässt, geht auch mit einem Knopf (WCAG 2.5.7)
      a.push({ text: this.T.hoch, tun: () => this.wirfHoch() });
      a.push({ text: this.T.bewerfen, tun: () => this.bewirf() });
      if (Math.abs(this.kf.x - this.heimFigur()) > 40) a.push({ text: this.T.platz, tun: () => this.heim() });
    }
    a.push({ text: this.T.weg, tun: () => this.schickeWeg() });
    this.menueOffen = true;
    this.knopf.setAttribute('aria-expanded', 'true');
    this.zeigeBlase(this.T.frage, a);
  }
  /** Menü: wirft den Helfer in die Luft, so als hätte man ihn gegriffen und geworfen. */
  private wirfHoch(): void {
    if (this.zustand !== 'steht') return;
    this.spiele(null);
    this.hebAuf();
    const f = this.kf;
    f.vx = zufall(-260, 260);
    f.vy = -zufall(1250, 1500);
    f.dreh = zufall(-7, 7);
    this.laeufe();
  }
  /** Menü: der Ball trifft ihn mit Wucht, er zerspringt und baut sich wieder zusammen. */
  private bewirf(): void {
    if (this.zustand !== 'steht') return;
    this.spiele(null);
    const b = this.kb;
    const f = this.kf;
    const vonLinks = f.x > window.innerWidth / 2;
    this.dribbel = null;
    this.traegt = false;
    b.aktiv = true;
    b.x = begrenze(f.x + (vonLinks ? -420 : 420), this.welt.links + this.rBall, this.welt.rechts - this.rBall);
    b.y = f.y - 20 * this.k;
    b.vx = vonLinks ? 3200 : -3200;
    b.vy = -120;
    b.dreh = vonLinks ? 30 : -30;
    this.welt.wecke(b);
    this.laeufe();
  }

  private schliesse(): void {
    this.blase.hidden = true;
    this.blaseOffen = false;
    this.menueOffen = false;
    this.knopf.setAttribute('aria-expanded', 'false');
  }
  private heim(): void {
    this.spiele(null);
    this.laufeZu(this.heimFigur(), () => undefined);
  }

  private schickeWeg(): void {
    this.spiele(null);
    if (this.a.ruhig) {
      this.verschwinde();
      return;
    }
    this.sag(this.T.tschuess, 1100);
    this.winke();
    this.taetig = true;
    this.nach(950, () => {
      if (this.zustand !== 'steht') return;
      this.laufeZu(this.welt.rechts + 200 * this.k + 40, () => this.verschwinde(), 620);
    });
  }
  private verschwinde(): void {
    this.schliesse();
    this.zustand = 'weg';
    this.taetig = false;
    this.kf.aktiv = false;
    this.fig.el.hidden = true;
    this.mini.hidden = false;
    this.zeichne();
  }
  private holeZurueck(): void {
    this.mini.hidden = true;
    this.fig.el.hidden = false;
    this.kf.aktiv = true;
    this.zustand = 'steht';
    this.fig.haltung('stand', false);
    this.fig.mimik('lachen');
    this.stell(this.a.ruhig ? this.heimFigur() : this.welt.rechts + 200 * this.k);
    this.laufeZu(this.heimFigur(), () => {
      this.winke();
      this.sag(this.T.wieder, 1800);
      this.knopf.focus({ preventScroll: true });
    });
    this.zeichne();
    this.laeufe();
  }

  /* -------------------------------------------------------------------- Zeichnen */
  private zeichne(): void {
    const f = this.kf;
    const b = this.kb;
    const w = this.welt;
    // Zustand zum Ablesen (Tests, Fehlersuche). Er steht in der Schattenwurzel: Beobachter der Seite sehen ihn nicht.
    if (this.feld.dataset.zustand !== this.zustand) this.feld.dataset.zustand = this.zustand;
    this.fig.el.style.transform = `translate3d(${f.x.toFixed(2)}px, ${f.y.toFixed(2)}px, 0) rotate(${f.winkel.toFixed(4)}rad)`;
    this.ballRegel.transform = `translate3d(${b.x.toFixed(2)}px, ${b.y.toFixed(2)}px, 0) rotate(${b.winkel.toFixed(4)}rad)`;
    for (const t of this.teile) t.el.style.transform = `translate3d(${t.k.x.toFixed(2)}px, ${t.k.y.toFixed(2)}px, 0) rotate(${t.k.winkel.toFixed(4)}rad)`;
    // Schatten am Boden: je höher, desto kleiner und blasser
    const schatten = (e: HTMLElement, x: number, tief: number, breit: number, sichtbar: boolean) => {
      const h = begrenze((w.boden - tief) / 420, 0, 1);
      e.style.transform = `translate3d(${x.toFixed(1)}px, ${w.boden.toFixed(1)}px, 0) scale(${(1 - h * 0.55).toFixed(3)})`;
      e.style.width = `${breit}px`;
      e.style.marginLeft = `${-breit / 2}px`;
      e.style.opacity = sichtbar ? (0.2 * (1 - h * 0.8)).toFixed(3) : '0';
    };
    schatten(this.schattenF, f.x, f.y + (FUSS_UNTEN - SP.y) * this.k * Math.abs(Math.cos(f.winkel)), 250 * this.k, this.zustand !== 'weg' && this.zustand !== 'zerlegt' && this.zustand !== 'baut');
    schatten(this.schattenB, b.x, b.y + this.rBall, this.rBall * 2.1, true);
    if (this.blaseOffen) {
      const breit = this.blase.offsetWidth || 240;
      const x = begrenze(f.x - breit / 2, 8, window.innerWidth - breit - 8);
      const oben = f.y - (SP.y - 40) * this.k - 14;
      this.blase.style.transform = `translate3d(${x.toFixed(1)}px, ${Math.max(8 + this.blase.offsetHeight, oben).toFixed(1)}px, 0) translateY(-100%)`;
      this.blase.style.setProperty('--hf-spitze', `${begrenze(f.x - x, 24, breit - 24).toFixed(1)}px`);
    }
  }

  /** Alles abbauen (beim Verlassen der Seite oder im Test). */
  zerstoere(): void {
    this.aus = true;
    if (this.bildNr) cancelAnimationFrame(this.bildNr);
    for (const id of this.uhren) window.clearTimeout(id);
    this.uhren.clear();
    for (const tun of this.ab) tun();
    this.feld.remove();
    this.ballEl.remove();
    if (this.blatt) document.adoptedStyleSheets = document.adoptedStyleSheets.filter((b) => b !== this.blatt);
  }
}
