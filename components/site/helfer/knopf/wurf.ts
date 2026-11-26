/**
 * Wurf des WhatsApp-Knopfs am Handy (Inhaber, 26.11.2026: „wie bei der Schlüsselschmiede“, dort lib/motion/wurf.ts).
 * Reine Rechnung ohne Dokument, damit sie im Test läuft. Einheiten: Bildpunkte und Sekunden. Der Körper ist die linke
 * obere Ecke des Knopfs im Fenster; der Rahmen begrenzt diese Ecke (links und rechts die Fensterwände, oben ein Rand,
 * unten der Boden auf Höhe des Ruheplatzes).
 */

export interface WurfKoerper {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface WurfRahmen {
  links: number;
  oben: number;
  rechts: number;
  unten: number;
}

export interface WurfWerte {
  /** Fallbeschleunigung nach unten (px/s²). */
  schwerkraft: number;
  /** Anteil der Geschwindigkeit, der beim Abprall bleibt (0 bis 1). */
  abprall: number;
  /** Luftwiderstand je Sekunde (exponentiell). */
  luft: number;
  /** Reibung am Boden je Sekunde (exponentiell, nur waagerecht). */
  bodenreibung: number;
  /** Höchstes Wurftempo (px/s). */
  hoechst: number;
}

export const WURF: WurfWerte = Object.freeze({ schwerkraft: 2400, abprall: 0.55, luft: 0.35, bodenreibung: 7, hoechst: 4200 });

/** Senkrechtes Resttempo, unter dem ein Sprung am Boden endet (kein endloses Zittern). */
const RUHE_SPRUNG = 90;
/** Waagerechtes Tempo, unter dem der Knopf am Boden als ruhend gilt. */
const RUHE_ROLLEN = 25;
/** Längster Teilschritt: Hohe Geschwindigkeiten überspringen keine Wand, lange Bildpausen sprengen nichts. */
const TEILSCHRITT = 1 / 120;
const LAENGSTER_SCHRITT = 0.1;

export type Wand = 'links' | 'rechts' | 'oben' | 'unten';

export interface Aufprall {
  wand: Wand;
  /** Tempo senkrecht zur Wand beim Aufprall (px/s). */
  tempo: number;
}

/**
 * Ein Zeitschritt: Schwerkraft, Luftwiderstand, Abprall an den vier Wänden, Reibung am Boden. Liefert den neuen
 * Körper und den stärksten Aufprall in diesem Schritt.
 */
export function schritt(k: WurfKoerper, dt: number, r: WurfRahmen, w: WurfWerte = WURF): { k: WurfKoerper; aufprall: Aufprall | null } {
  if (!(dt > 0) || !Number.isFinite(dt)) return { k: { ...k }, aufprall: null };
  const gesamt = Math.min(dt, LAENGSTER_SCHRITT);
  const teile = Math.max(1, Math.ceil(gesamt / TEILSCHRITT));
  const h = gesamt / teile;
  let { x, y, vx, vy } = k;
  let aufprall: Aufprall | null = null;
  const merke = (wand: Wand, tempo: number) => {
    if (!aufprall || tempo > aufprall.tempo) aufprall = { wand, tempo };
  };

  for (let i = 0; i < teile; i++) {
    vy += w.schwerkraft * h;
    const daempfung = Math.exp(-w.luft * h);
    vx *= daempfung;
    vy *= daempfung;
    x += vx * h;
    y += vy * h;

    if (x < r.links) {
      x = r.links;
      if (vx < 0) {
        merke('links', -vx);
        vx = -vx * w.abprall;
      }
    } else if (x > r.rechts) {
      x = r.rechts;
      if (vx > 0) {
        merke('rechts', vx);
        vx = -vx * w.abprall;
      }
    }
    if (y < r.oben) {
      y = r.oben;
      if (vy < 0) {
        merke('oben', -vy);
        vy = -vy * w.abprall;
      }
    } else if (y >= r.unten) {
      y = r.unten;
      if (vy > 0) {
        if (vy > RUHE_SPRUNG) merke('unten', vy);
        vy = -vy * w.abprall;
        if (Math.abs(vy) < RUHE_SPRUNG) vy = 0;
      }
      vx *= Math.exp(-w.bodenreibung * h);
    }
  }
  return { k: { x, y, vx, vy }, aufprall };
}

/** Liegt der Körper still am Boden? Dann rastet er am Ruheplatz ein. */
export function ruht(k: WurfKoerper, r: WurfRahmen): boolean {
  return k.y >= r.unten - 0.5 && Math.abs(k.vy) < 1 && Math.abs(k.vx) < RUHE_ROLLEN;
}

export interface Probe {
  x: number;
  y: number;
  /** Zeit in Millisekunden */
  t: number;
}

/** Wurftempo aus den letzten Zeigerproben (höchstens 100 ms vor der letzten), begrenzt auf das Höchsttempo. */
export function wurfTempo(proben: readonly Probe[], hoechst: number = WURF.hoechst): { vx: number; vy: number } {
  const letzte = proben[proben.length - 1];
  if (!letzte) return { vx: 0, vy: 0 };
  const fenster = proben.filter((p) => letzte.t - p.t <= 100);
  const erste = fenster[0];
  const dauer = (letzte.t - erste.t) / 1000;
  if (dauer <= 0) return { vx: 0, vy: 0 };
  let vx = (letzte.x - erste.x) / dauer;
  let vy = (letzte.y - erste.y) / dauer;
  const betrag = Math.hypot(vx, vy);
  if (betrag > hoechst) {
    vx = (vx / betrag) * hoechst;
    vy = (vy / betrag) * hoechst;
  }
  return { vx, vy };
}

/** Lage im Rahmen halten (beim Ziehen und nach einer Größenänderung des Fensters). */
export function imRahmen(x: number, y: number, r: WurfRahmen): { x: number; y: number } {
  return {
    x: Math.min(Math.max(x, r.links), Math.max(r.links, r.rechts)),
    y: Math.min(Math.max(y, r.oben), Math.max(r.oben, r.unten)),
  };
}
