/**
 * Isothermen aus dem Wärmefeld (E-031, KERN K-010): vom Knotenfeld des Lösers (lib/zeichnung/waerme/feld.ts) zum Pfad
 * eines Bands. Schritte: Feld normieren → Binomialglättung [1 4 6 4 1]/16 je Richtung → Spiegelrand von 4 Einheiten
 * in die Wände (die Konturen treffen die Wände rechtwinklig, die Wandflächen der Zeichnung decken den Rand) →
 * Marching Squares auf der Schwelle → Ramer-Douglas-Peucker (ε) → Catmull-Rom als kubische Bézier → 0,5-Raster.
 *
 * Nur +, −, ×, ÷, Math.sqrt, Math.round und Vergleiche (bitgleich in bun und V8, siehe feld.ts).
 */
import type { Gitter } from './feld';

export interface P {
  x: number;
  y: number;
}

/** Breite des Spiegelrands in Einheiten der Szene (E-031: 4 Einheiten). */
export const SPIEGELRAND = 4;

/** Binomialkern [1 4 6 4 1] / 16 in x und in y; am Rand gespiegelt (wie der Spiegelrand). */
export function glaetten(theta: Float64Array, g: Gitter): Float64Array {
  const kern = [1 / 16, 4 / 16, 6 / 16, 4 / 16, 1 / 16];
  const spiegel = (i: number, n: number) => (i < 0 ? -i : i > n - 1 ? 2 * (n - 1) - i : i);
  const zwischen = new Float64Array(theta.length);
  for (let j = 0; j < g.ny; j += 1) {
    for (let i = 0; i < g.nx; i += 1) {
      let w = 0;
      for (let m = -2; m <= 2; m += 1) w += kern[m + 2] * theta[j * g.nx + spiegel(i + m, g.nx)];
      zwischen[j * g.nx + i] = w;
    }
  }
  const aus = new Float64Array(theta.length);
  for (let j = 0; j < g.ny; j += 1) {
    for (let i = 0; i < g.nx; i += 1) {
      let w = 0;
      for (let m = -2; m <= 2; m += 1) w += kern[m + 2] * zwischen[spiegel(j + m, g.ny) * g.nx + i];
      aus[j * g.nx + i] = w;
    }
  }
  return aus;
}

/** θ̂ = (θ − unten) / (oben − unten). */
export function normieren(theta: Float64Array, unten: number, oben: number): Float64Array {
  const aus = new Float64Array(theta.length);
  for (let k = 0; k < theta.length; k += 1) aus[k] = (theta[k] - unten) / (oben - unten);
  return aus;
}

export function extrema(theta: Float64Array): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const t of theta) {
    if (t < min) min = t;
    if (t > max) max = t;
  }
  return { min, max };
}

/** Schwelle, oberhalb der der Anteil `anteil` aller Knoten liegt (Flächenquantil). */
export function quantil(theta: Float64Array, anteil: number): number {
  const sortiert = Float64Array.from(theta).sort();
  const k = sortiert.length - Math.round(anteil * sortiert.length);
  return sortiert[k];
}

/** Flächenanteil der Knoten mit θ ≥ schwelle. */
export function anteilUeber(theta: Float64Array, schwelle: number): number {
  let n = 0;
  for (const t of theta) if (t >= schwelle) n += 1;
  return n / theta.length;
}

/**
 * Geschlossene Konturen {θ = schwelle} um die Bereiche θ ≥ schwelle. Das Feld wird um den Spiegelrand erweitert und
 * außen mit einem Ring weit unter jeder Schwelle umgeben: Jede Kontur schließt sich, wo ein Bereich an den Rand stößt,
 * entlang der Kante des Spiegelrands. Ergebnis in Einheiten der Szene.
 */
export function konturen(theta: Float64Array, g: Gitter, schwelle: number): P[][] {
  const rand = SPIEGELRAND / g.dx;
  if (g.dx !== g.dy || !Number.isInteger(rand)) throw new Error('waerme/kontur: Spiegelrand nicht auf dem Gitter');
  // Erweitertes Feld: Spiegelrand + ein Ring „kalt“
  const nx = g.nx + 2 * rand + 2;
  const ny = g.ny + 2 * rand + 2;
  const KALT = -1e9;
  const wert = (i: number, j: number): number => {
    if (i === 0 || j === 0 || i === nx - 1 || j === ny - 1) return KALT;
    const spiegel = (q: number, n: number) => (q < 0 ? -q : q > n - 1 ? 2 * (n - 1) - q : q);
    return theta[spiegel(j - 1 - rand, g.ny) * g.nx + spiegel(i - 1 - rand, g.nx)];
  };
  const xVon = (i: number) => g.x0 + (i - 1 - rand) * g.dx;
  const yVon = (j: number) => g.y0 + (j - 1 - rand) * g.dy;
  // Schnittpunkte je Kante: waagerecht h(i, j) zwischen (i, j) und (i+1, j), senkrecht v(i, j) zwischen (i, j) und (i, j+1)
  const punkt = new Map<number, P>();
  const id = (art: 0 | 1, i: number, j: number) => (j * nx + i) * 2 + art;
  const schnitt = (art: 0 | 1, i: number, j: number): number => {
    const key = id(art, i, j);
    if (!punkt.has(key)) {
      const a = wert(i, j);
      const b = art === 0 ? wert(i + 1, j) : wert(i, j + 1);
      const t = (schwelle - a) / (b - a);
      punkt.set(key, art === 0 ? { x: xVon(i) + t * g.dx, y: yVon(j) } : { x: xVon(i), y: yVon(j) + t * g.dy });
    }
    return key;
  };
  const nachbarn = new Map<number, number[]>();
  const verbinde = (a: number, b: number) => {
    (nachbarn.get(a) ?? nachbarn.set(a, []).get(a)!).push(b);
    (nachbarn.get(b) ?? nachbarn.set(b, []).get(b)!).push(a);
  };
  for (let j = 0; j < ny - 1; j += 1) {
    for (let i = 0; i < nx - 1; i += 1) {
      const a = wert(i, j) >= schwelle ? 1 : 0; // oben links
      const b = wert(i + 1, j) >= schwelle ? 1 : 0; // oben rechts
      const c = wert(i + 1, j + 1) >= schwelle ? 1 : 0; // unten rechts
      const d = wert(i, j + 1) >= schwelle ? 1 : 0; // unten links
      const fall = a * 8 + b * 4 + c * 2 + d;
      if (fall === 0 || fall === 15) continue;
      const oben = () => schnitt(0, i, j);
      const unten = () => schnitt(0, i, j + 1);
      const links = () => schnitt(1, i, j);
      const rechts = () => schnitt(1, i + 1, j);
      // Sattel: Mittelwert der Ecken entscheidet, ob die warmen Ecken verbunden sind
      const mitte = (wert(i, j) + wert(i + 1, j) + wert(i + 1, j + 1) + wert(i, j + 1)) / 4 >= schwelle;
      switch (fall) {
        case 1:
        case 14:
          verbinde(links(), unten());
          break;
        case 2:
        case 13:
          verbinde(unten(), rechts());
          break;
        case 3:
        case 12:
          verbinde(links(), rechts());
          break;
        case 4:
        case 11:
          verbinde(oben(), rechts());
          break;
        case 6:
        case 9:
          verbinde(oben(), unten());
          break;
        case 7:
        case 8:
          verbinde(links(), oben());
          break;
        case 5: // oben rechts und unten links warm
          if (mitte) {
            verbinde(links(), oben());
            verbinde(unten(), rechts());
          } else {
            verbinde(links(), unten());
            verbinde(oben(), rechts());
          }
          break;
        case 10: // oben links und unten rechts warm
          if (mitte) {
            verbinde(oben(), rechts());
            verbinde(links(), unten());
          } else {
            verbinde(links(), oben());
            verbinde(unten(), rechts());
          }
          break;
        default:
          break;
      }
    }
  }
  // Ketten zu Schleifen (jede Kante mit Schnitt hat genau zwei Nachbarn); fester Start: kleinster Schlüssel
  const besucht = new Set<number>();
  const schleifen: P[][] = [];
  for (const start of [...nachbarn.keys()].sort((x, y) => x - y)) {
    if (besucht.has(start)) continue;
    const schleife: P[] = [];
    let vorher = -1;
    let jetzt = start;
    for (;;) {
      besucht.add(jetzt);
      schleife.push(punkt.get(jetzt)!);
      const [n1, n2] = nachbarn.get(jetzt)!;
      const weiter = n1 !== vorher ? n1 : n2;
      vorher = jetzt;
      jetzt = weiter;
      if (jetzt === start) break;
    }
    schleifen.push(schleife);
  }
  return schleifen;
}

/** Vorzeichenbehaftete Fläche (Gaußsche Trapezformel); in Bildschirmkoordinaten > 0 im Uhrzeigersinn. */
export function flaeche(poly: readonly P[]): number {
  let a = 0;
  for (let k = 0; k < poly.length; k += 1) {
    const p = poly[k];
    const q = poly[(k + 1) % poly.length];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

/** Schwerpunkt eines Polygons. */
export function schwerpunkt(poly: readonly P[]): P {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let k = 0; k < poly.length; k += 1) {
    const p = poly[k];
    const q = poly[(k + 1) % poly.length];
    const f = p.x * q.y - q.x * p.y;
    a += f;
    cx += (p.x + q.x) * f;
    cy += (p.y + q.y) * f;
  }
  return { x: cx / (3 * a), y: cy / (3 * a) };
}

/** Liegt q im Polygon (gerade/ungerade Regel)? */
export function imPolygon(q: P, poly: readonly P[]): boolean {
  let drin = false;
  for (let k = 0, m = poly.length - 1; k < poly.length; m = k, k += 1) {
    const a = poly[k];
    const b = poly[m];
    if (a.y > q.y !== b.y > q.y && q.x < ((b.x - a.x) * (q.y - a.y)) / (b.y - a.y) + a.x) drin = !drin;
  }
  return drin;
}

function abstandZurStrecke(p: P, a: P, b: P): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) {
    const ex = p.x - a.x;
    const ey = p.y - a.y;
    return Math.sqrt(ex * ex + ey * ey);
  }
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const ex = p.x - (a.x + t * dx);
  const ey = p.y - (a.y + t * dy);
  return Math.sqrt(ex * ex + ey * ey);
}

function rdpOffen(punkte: readonly P[], epsilon: number): P[] {
  if (punkte.length < 3) return [...punkte];
  let max = 0;
  let index = 0;
  const a = punkte[0];
  const b = punkte[punkte.length - 1];
  for (let k = 1; k < punkte.length - 1; k += 1) {
    const d = abstandZurStrecke(punkte[k], a, b);
    if (d > max) {
      max = d;
      index = k;
    }
  }
  if (max <= epsilon) return [a, b];
  const links = rdpOffen(punkte.slice(0, index + 1), epsilon);
  const rechts = rdpOffen(punkte.slice(index), epsilon);
  return [...links.slice(0, -1), ...rechts];
}

/** Ramer-Douglas-Peucker für eine geschlossene Schleife: geteilt am ersten Punkt und am Punkt am weitesten davon. */
export function rdp(schleife: readonly P[], epsilon: number): P[] {
  const a = schleife[0];
  let fern = 0;
  let max = -1;
  for (let k = 1; k < schleife.length; k += 1) {
    const dx = schleife[k].x - a.x;
    const dy = schleife[k].y - a.y;
    const d = dx * dx + dy * dy;
    if (d > max) {
      max = d;
      fern = k;
    }
  }
  const erste = rdpOffen(schleife.slice(0, fern + 1), epsilon);
  const zweite = rdpOffen([...schleife.slice(fern), a], epsilon);
  return [...erste.slice(0, -1), ...zweite.slice(0, -1)];
}

const abstand = (a: P, b: P) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/** Auf das 0,5-Raster (ohne −0). */
export const halb = (wert: number): number => {
  const r = Math.round(wert * 2) / 2;
  return r === 0 ? 0 : r;
};

const zahl = (wert: number) => String(halb(wert));

/** Rahmen, in dem ein Pfad bleibt: das Rauminnere samt Spiegelrand. */
export interface Rahmen {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Geschlossener Pfad durch die Punkte: Catmull-Rom als kubische Bézier, die Tangente nach den Längen der beiden
 * Nachbarstrecken gewichtet (Kontrollpunkt P_i + (P_{i+1} − P_{i−1}) · |P_i P_{i+1}| / (|P_{i−1} P_i| + |P_i P_{i+1}|) / 3,
 * bei gleichen Abständen genau der gleichmäßige Catmull-Rom mit 1/6): Wo eine lange Strecke am Spiegelrand auf eine kurze
 * trifft, schießt die Kurve nicht über. Die Kontrollpunkte bleiben im `rahmen` (eine Bézierkurve bleibt in der Hülle
 * ihrer Punkte, also im Rahmen); alle Zahlen auf dem 0,5-Raster. Fallen zwei Punkte nach dem Runden zusammen, bleibt
 * einer.
 */
export function bezierPfad(punkte: readonly P[], rahmen: Rahmen): string {
  const fx = (x: number) => (x < rahmen.x0 ? rahmen.x0 : x > rahmen.x1 ? rahmen.x1 : x);
  const fy = (y: number) => (y < rahmen.y0 ? rahmen.y0 : y > rahmen.y1 ? rahmen.y1 : y);
  const gerundet: P[] = [];
  for (const p of punkte) {
    const q = { x: halb(p.x), y: halb(p.y) };
    const letzter = gerundet[gerundet.length - 1];
    if (!letzter || letzter.x !== q.x || letzter.y !== q.y) gerundet.push(q);
  }
  while (gerundet.length > 1 && gerundet[0].x === gerundet[gerundet.length - 1].x && gerundet[0].y === gerundet[gerundet.length - 1].y) gerundet.pop();
  const n = gerundet.length;
  if (n < 3) throw new Error('waerme/kontur: Kontur mit weniger als drei Punkten');
  const p = (k: number) => gerundet[((k % n) + n) % n];
  const teile = [`M${zahl(p(0).x)} ${zahl(p(0).y)}`];
  for (let k = 0; k < n; k += 1) {
    const p0 = p(k - 1);
    const p1 = p(k);
    const p2 = p(k + 1);
    const p3 = p(k + 2);
    const d01 = abstand(p0, p1);
    const d12 = abstand(p1, p2);
    const d23 = abstand(p2, p3);
    const g1 = d12 / (d01 + d12) / 3;
    const g2 = d12 / (d12 + d23) / 3;
    const c1 = { x: fx(p1.x + (p2.x - p0.x) * g1), y: fy(p1.y + (p2.y - p0.y) * g1) };
    const c2 = { x: fx(p2.x - (p3.x - p1.x) * g2), y: fy(p2.y - (p3.y - p1.y) * g2) };
    teile.push(`C${zahl(c1.x)} ${zahl(c1.y)} ${zahl(c2.x)} ${zahl(c2.y)} ${zahl(p2.x)} ${zahl(p2.y)}`);
  }
  return `${teile.join('')}Z`;
}

/**
 * Punkte eines Pfads aus absoluten M, C, Z (wie bezierPfad schreibt), die Bézier-Abschnitte in `stufen` Teile
 * zerlegt: für Prüfungen (Punkt im Polygon, Fläche, Schwerpunkt).
 */
export function pfadPunkte(d: string, stufen = 8): P[] {
  const out: P[] = [];
  let aktuell: P = { x: 0, y: 0 };
  for (const [, befehl, rest] of d.matchAll(/([MCZ])([^MCZ]*)/g)) {
    const n = rest.trim() ? rest.trim().split(/[\s,]+/).map(Number) : [];
    if (befehl === 'M') {
      aktuell = { x: n[0], y: n[1] };
      out.push(aktuell);
    } else if (befehl === 'C') {
      for (let k = 0; k < n.length; k += 6) {
        const [x1, y1, x2, y2, x, y] = n.slice(k, k + 6);
        const a = aktuell;
        for (let s = 1; s <= stufen; s += 1) {
          const t = s / stufen;
          const u = 1 - t;
          out.push({
            x: u * u * u * a.x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
            y: u * u * u * a.y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y,
          });
        }
        aktuell = { x, y };
      }
    }
  }
  return out;
}
