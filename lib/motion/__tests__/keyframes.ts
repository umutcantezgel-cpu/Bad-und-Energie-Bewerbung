/**
 * Hilfen für Prüfungen der Keyframes (E-031, KERN K-009): liest @keyframes aus CSS und prüft die Skalierregel
 * „Skalieren nur nach √t“ (DIFFUSION_STUETZ). Nur für Tests (lib/motion/__tests__/register.test.ts, die Prüfungen der
 * Pakete W1–W4); kein Laufzeitcode.
 */
import { DIFFUSION_STUETZ } from '../register';

export interface KeyframeStopp {
  /** Stelle in Prozent (from = 0, to = 100). */
  anteil: number;
  deklarationen: ReadonlyMap<string, string>;
}

export interface Keyframes {
  name: string;
  stopps: KeyframeStopp[];
}

const ohneKommentare = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

function schliessend(css: string, offen: number): number {
  let tiefe = 0;
  for (let i = offen; i < css.length; i += 1) {
    if (css[i] === '{') tiefe += 1;
    else if (css[i] === '}' && (tiefe -= 1) === 0) return i;
  }
  throw new Error('keyframes: Klammern unausgeglichen');
}

function anteilVon(selektor: string): number {
  const s = selektor.trim();
  if (s === 'from') return 0;
  if (s === 'to') return 100;
  const m = s.match(/^(\d+(?:\.\d+)?)%$/);
  if (!m) throw new Error(`keyframes: unbekannte Stelle „${s}“`);
  return Number(m[1]);
}

/** Alle @keyframes eines Stylesheets (Kommentare zählen nicht); Stellen aufsteigend. */
export function keyframesIn(css: string): Keyframes[] {
  const quelle = ohneKommentare(css);
  const out: Keyframes[] = [];
  for (const m of quelle.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    const offen = m.index + m[0].length - 1;
    const rumpf = quelle.slice(offen + 1, schliessend(quelle, offen));
    const stopps: KeyframeStopp[] = [];
    for (const [, selektoren, inhalt] of rumpf.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const deklarationen = new Map<string, string>();
      for (const teil of inhalt.split(';')) {
        const d = teil.match(/^\s*([a-z-]+)\s*:\s*([\s\S]+?)\s*$/);
        if (d) deklarationen.set(d[1], d[2]);
      }
      for (const s of selektoren.split(',')) stopps.push({ anteil: anteilVon(s), deklarationen });
    }
    stopps.sort((a, b) => a.anteil - b.anteil);
    out.push({ name: m[1], stopps });
  }
  return out;
}

const SKALIERUNG = /(?<![\w-])scale\(\s*([^)]*)\)/;

/** Gleichmäßiger Maßstab einer Stelle: aus `scale` oder `transform: … scale(…)`; null ohne Skalierung. */
export function massstabVon(stopp: KeyframeStopp): number | null | 'ungueltig' {
  const eigen = stopp.deklarationen.get('scale');
  const transform = stopp.deklarationen.get('transform');
  const roh = eigen ?? transform?.match(SKALIERUNG)?.[1];
  if (roh === undefined) return null;
  const werte = roh.trim().split(/[\s,]+/);
  if (werte.length > 2 || werte.some((w) => !/^-?\d*\.?\d+$/.test(w))) return 'ungueltig';
  const zahlen = werte.map(Number);
  if (zahlen.length === 2 && zahlen[0] !== zahlen[1]) return 'ungueltig';
  return zahlen[0];
}

/** Skaliert der Ablauf gleichmäßig (scale-Eigenschaft oder scale() in transform; scaleX/scaleY zählen nicht)? */
export function skaliert(k: Keyframes): boolean {
  return k.stopps.some((s) => s.deklarationen.has('scale') || SKALIERUNG.test(s.deklarationen.get('transform') ?? ''));
}

/**
 * Die Abläufe einer Kurzform `animation`: an den Kommas der obersten Ebene getrennt, nicht an Kommas in Klammern
 * (`var(--d, var(--d-2))`, `calc(…)`), sonst zerfiele ein Ablauf mit Grundwert in zwei Teile.
 */
export function listenteile(wert: string): string[] {
  const teile: string[] = [];
  let tiefe = 0;
  let teil = '';
  for (const c of wert) {
    if (c === '(') tiefe += 1;
    else if (c === ')') tiefe -= 1;
    if (c === ',' && tiefe === 0) {
      teile.push(teil);
      teil = '';
    } else teil += c;
  }
  return [...teile, teil];
}

/**
 * Verstöße gegen „Skalieren nur nach √t“ in einem Stylesheet: Jeder skalierende Keyframe-Ablauf steht genau auf den
 * Stellen von DIFFUSION_STUETZ, nennt an jeder einen Zahlenwert, wächst streng, folgt dem Fortschritt (Wert_i = Start +
 * Fortschritt_i × (Ende − Start)) und wird nur über die Kurzform `animation` mit `linear` benutzt. Leere Liste = in Ordnung.
 */
export function diffusionsFehler(css: string, toleranz = 0.002): string[] {
  const fehler: string[] = [];
  const quelle = ohneKommentare(css);
  const soll = DIFFUSION_STUETZ.map(([t]) => t * 100);
  for (const k of keyframesIn(quelle)) {
    if (!skaliert(k)) continue;
    const stellen = k.stopps.map((s) => s.anteil);
    if (stellen.join() !== soll.join()) {
      fehler.push(`${k.name}: Stellen ${stellen.join(', ')} statt ${soll.join(', ')}`);
      continue;
    }
    const werte = k.stopps.map(massstabVon);
    if (werte.some((w) => typeof w !== 'number')) {
      fehler.push(`${k.name}: an jeder Stelle ein gleichmäßiger Maßstab als Zahl`);
      continue;
    }
    const v = werte as number[];
    const [start, ende] = [v[0], v[v.length - 1]];
    if (!(ende > start)) fehler.push(`${k.name}: wächst nicht (${start} → ${ende})`);
    for (let i = 1; i < v.length; i += 1) if (!(v[i] > v[i - 1])) fehler.push(`${k.name}: nicht monoton an ${stellen[i]} %`);
    DIFFUSION_STUETZ.forEach(([, fortschritt], i) => {
      const ist = ende === start ? 0 : (v[i] - start) / (ende - start);
      if (Math.abs(ist - fortschritt) > toleranz) fehler.push(`${k.name}: an ${stellen[i]} % Fortschritt ${ist.toFixed(3)} statt ${fortschritt}`);
    });
    for (const s of k.stopps) {
      const kurve = s.deklarationen.get('animation-timing-function');
      if (kurve !== undefined && kurve !== 'linear') fehler.push(`${k.name}: Kurve ${kurve} an ${s.anteil} %`);
    }
    const name = k.name.replace(/[-]/g, '\\-');
    for (const m of quelle.matchAll(new RegExp(`animation(-name)?\\s*:\\s*([^;}]*\\b${name}\\b[^;}]*)`, 'g'))) {
      if (m[1]) fehler.push(`${k.name}: nur über die Kurzform animation mit linear benutzen`);
      else if (!listenteile(m[2]).filter((teil) => new RegExp(`\\b${name}\\b`).test(teil)).every((teil) => /(?:^|\s)linear(?:\s|$)/.test(teil.trim()))) {
        fehler.push(`${k.name}: Kurve linear fehlt (${m[2].trim()})`);
      }
    }
  }
  return fehler;
}

/**
 * Wert einer Kurve cubic-bezier(x1, y1, x2, y2) zum Zeitanteil t (0…1), wie der Browser sie rechnet (Bisektion auf x).
 * Für Prüfungen der Wärmefront (Owner-Feedback 16.10.2026): ruhig an, ruhig aus, kein Antritt.
 */
export function bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const b = (a: number, c: number, s: number) => 3 * (1 - s) * (1 - s) * s * a + 3 * (1 - s) * s * s * c + s * s * s;
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 60; i += 1) {
      const mitte = (lo + hi) / 2;
      if (b(x1, x2, mitte) < t) lo = mitte;
      else hi = mitte;
    }
    return b(y1, y2, (lo + hi) / 2);
  };
}

/** Die Kurve eines Tokens aus app/styles/theme.css (--k-aus, --k-wechsel, --k-ein). */
export function kurveAus(theme: string, token: 'k-aus' | 'k-wechsel' | 'k-ein'): (t: number) => number {
  const m = theme.match(new RegExp(`--${token}: cubic-bezier\\(([^)]+)\\);`));
  if (!m) throw new Error(`Kurve --${token} fehlt`);
  const [x1, y1, x2, y2] = m[1].split(',').map(Number);
  return bezier(x1, y1, x2, y2);
}
