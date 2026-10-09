// Wärmefeld der Szene: stationäre Wärmeleitung mit Senke (Gauß-Seidel/SOR) je Wärmezone,
// Ankunftszeit (Dijkstra) für den Auftakt, Isothermen-Bänder (Marching Squares) für den statischen Ersatz.
// Aufruf: node bau/feld.mjs            → js/feld.png, bau/baender.json, bau/vorschau.png
// Dieselben Zahlen speisen Textur (WebGL) und SVG-Bänder: Endbild von Shader und Ersatz sind deckungsgleich.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { W, H, HAUS, PUMPE, HEIZKOERPER, FBH, LEITUNG, material } from './szene.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const ordner = path.resolve(hier, '..');
const require = createRequire(path.resolve(ordner, '../../../werkzeuge/package.json'));
const sharp = require('sharp');

// Raster: 4 Einheiten je Zelle → 200 × 200
export const NX = 200;
export const NY = 200;
const Z = W / NX;
const cx = (i) => (i + 0.5) * Z;
const cy = (j) => (j + 0.5) * Z;
const idx = (i, j) => j * NX + i;

// Isothermen-Schwellen (gemeinsam mit dem Shader; Reihenfolge kalt → heiß)
export const SCHWELLEN = [0.07, 0.19, 0.36, 0.62];

const K = { luft: 1.0, erde: 0.3, dach: 0.05, wand: 0.05, decke: 0.65, innenwand: 0.3, estrich: 0.7, raum: 0.9, dachboden: 1.0, pumpe: 0.35 };
const SENKE = { luft: 0.03, erde: 0.12, dach: 0, wand: 0, decke: 0, innenwand: 0, estrich: 0.004, raum: 0.0052, dachboden: 0.007, pumpe: 0.02 };
// Kosten für die Ankunftszeit je Zelle (Wärme läuft in Leitungen schnell, durch Dämmung langsam)
const KOSTEN = { luft: 1.15, erde: 1.4, dach: 3.2, wand: 3.2, decke: 2.4, innenwand: 2.0, estrich: 0.7, raum: 0.85, dachboden: 1.1, pumpe: 0.6 };

const mat = new Array(NX * NY);
for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) mat[idx(i, j)] = material(cx(i), cy(j));

// Feste Zellen (Quellen) mit Temperatur, Zone und Ankunftszeit
const fest = new Map(); // idx → { t, zone, tau }
function setze(i, j, t, zone, tau) {
  if (i < 0 || j < 0 || i >= NX || j >= NY) return;
  const k = idx(i, j);
  const alt = fest.get(k);
  if (!alt || alt.t < t) fest.set(k, { t, zone, tau: alt ? Math.min(alt.tau, tau) : tau });
}
const zelle = (x, y) => [Math.floor(x / Z), Math.floor(y / Z)];

/** Leitung rastern: Zellen entlang der Polylinie, tau wächst mit der Länge. */
function leitung(punkte, t, zone, tau0, tauJeEinheit) {
  let laenge = 0;
  for (let s = 0; s < punkte.length - 1; s++) {
    const [x0, y0] = punkte[s];
    const [x1, y1] = punkte[s + 1];
    const l = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(l / (Z / 3)));
    for (let k = 0; k <= n; k++) {
      const x = x0 + ((x1 - x0) * k) / n;
      const y = y0 + ((y1 - y0) * k) / n;
      const [i, j] = zelle(x, y);
      setze(i, j, t, zone, tau0 + (laenge + (l * k) / n) * tauJeEinheit);
    }
    laenge += l;
  }
  return tau0 + laenge * tauJeEinheit;
}

// Zonen: 0 Wärmepumpe, 1 Heizung, 2 Bad
const TV = 1.0; // Vorlauf
const TR = 0.5; // Rücklauf
const V = 0.00035; // tau je Einheit in der Leitung (schneller als jede Ausbreitung im Feld)

// Wärmepumpe: Gehäuse leicht warm, Lüfterkreis kühl (Außenluft wird abgekühlt)
for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
  const x = cx(i), y = cy(j);
  const p = PUMPE;
  if (x > p.x + 6 && x < p.x + p.w - 6 && y > p.y + 6 && y < p.y + p.h - 4) {
    const d = Math.hypot(x - p.lx, y - p.ly);
    if (d > p.lr + 4) setze(i, j, 0.4, 0, 0.0);
    else if (d < p.lr - 2) fest.set(idx(i, j), { t: 0, zone: -1, tau: 0 });
  }
}
const tPumpe = 0.02;
// Abgänge der Pumpe: zum Knopf (quer) und nach unten (Paar)
leitung(LEITUNG.knopfQuer, TV, 0, tPumpe, V * 1.2);
const tVlBadStart = tPumpe;
leitung(LEITUNG.vlUnten, TV, 0, tPumpe, V * 1.2);
// Heizkreis: Vorlauf → Heizkörper → Rücklauf
const tHkEin = leitung(LEITUNG.vlHeiz, TV, 1, tPumpe, V);
const hk = HEIZKOERPER;
for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
  const x = cx(i), y = cy(j);
  if (x >= hk.x && x <= hk.x + hk.w && y >= hk.y && y <= hk.y + hk.h) {
    // Heizkörper füllt sich von oben nach unten (heißes Wasser oben ein)
    const f = (y - hk.y) / hk.h;
    setze(i, j, 0.88 - 0.12 * f, 1, tHkEin + 0.05 + 0.1 * f + 0.03 * ((x - hk.x) / hk.w));
  }
}
const tHkAus = tHkEin + 0.2;
leitung(LEITUNG.rlHeiz, TR, 1, tHkAus, V * 1.5);
// Bad: Vorlauf unter der Erde → Fußbodenheizung → Rücklauf unter der Erde
const tFbh = leitung(LEITUNG.vlBad, TV, 2, tVlBadStart, V);
const tFbhStart = tFbh - (FBH.bis - 404) * V; // Ankunft am ersten Rohrschnitt
for (let x = FBH.von; x <= FBH.bis + 0.1; x += FBH.abstand) {
  const [i, j] = zelle(x, FBH.y);
  for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
    if (Math.abs(di) + Math.abs(dj) > 1) continue;
    setze(i + di, j + dj, 0.92, 2, tFbhStart + (x - FBH.von) * V * 1.6);
  }
}
const tRlBad = tFbh + 0.12;
leitung(LEITUNG.rlBad, TR, 2, tRlBad, V * 1.4);
leitung(LEITUNG.rlUnten, TR, 0, tRlBad + 0.4, V);

// Stationäre Lösung je Zone: Σ k_ij (T_j − T_i) − s_i T_i = 0, feste Zellen Dirichlet.
function loese(zone) {
  const T = new Float64Array(NX * NY);
  const istFest = new Uint8Array(NX * NY);
  for (const [k, q] of fest) { istFest[k] = 1; T[k] = q.zone === zone ? q.t : 0; }
  const kk = new Float64Array(NX * NY);
  const ss = new Float64Array(NX * NY);
  for (let k = 0; k < NX * NY; k++) { kk[k] = K[mat[k]]; ss[k] = SENKE[mat[k]]; }
  const omega = 1.9;
  for (let it = 0; it < 6000; it++) {
    let maxd = 0;
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const k = idx(i, j);
        if (istFest[k]) continue;
        let sumK = 0, sumKT = 0;
        const ki = kk[k];
        // links: Rand kalt (T=0), oben kalt, rechts und unten gespiegelt (Neumann)
        const nb = [
          i > 0 ? k - 1 : -1,
          i < NX - 1 ? k + 1 : -2,
          j > 0 ? k - NX : -1,
          j < NY - 1 ? k + NX : -2,
        ];
        for (let r = 0; r < 4; r++) {
          const n = nb[r];
          if (n === -2) continue; // Neumann
          if (n === -1) { const c = ki; sumK += c; continue; } // Dirichlet 0
          // Raumluft leitet senkrecht stärker (Warmluft steigt, Wärmepolster unter der Decke)
          const auf = r >= 2 && mat[k] === mat[n] ? (mat[k] === 'raum' ? 2.4 : mat[k] === 'dachboden' ? 1.5 : 1) : 1;
          const c = ((2 * ki * kk[n]) / (ki + kk[n])) * auf;
          sumK += c;
          sumKT += c * T[n];
        }
        const neu = sumKT / (sumK + ss[k]);
        const d = neu - T[k];
        T[k] += omega * d;
        if (Math.abs(d) > maxd) maxd = Math.abs(d);
      }
    }
    if (maxd < 1e-9 && it > 400) { console.log(`Zone ${zone}: ${it} Iterationen`); break; }
  }
  return T;
}

// Ankunftszeit: Dijkstra ab allen festen Zellen
function ankunft() {
  const tau = new Float64Array(NX * NY).fill(Infinity);
  const heap = [];
  const push = (d, k) => { heap.push([d, k]); let c = heap.length - 1; while (c > 0) { const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
  const pop = () => { const top = heap[0]; const last = heap.pop(); if (heap.length) { heap[0] = last; let c = 0; for (;;) { const l = 2 * c + 1, r = l + 1; let m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
  const istFest = new Uint8Array(NX * NY);
  for (const [k, q] of fest) { tau[k] = q.tau; istFest[k] = 1; push(q.tau, k); }
  const schritt = 0.0042; // Kosten je Zelle (Feld)
  while (heap.length) {
    const [d, k] = pop();
    if (d > tau[k]) continue;
    const i = k % NX, j = (k - i) / NX;
    for (const [di, dj, f] of [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]]) {
      const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= NX || nj >= NY) continue;
      const n = idx(ni, nj);
      const nd = d + schritt * f * 0.5 * (KOSTEN[mat[k]] + KOSTEN[mat[n]]);
      if (!istFest[n] && nd < tau[n]) { tau[n] = nd; push(nd, n); }
    }
  }
  return tau;
}

// Marching Squares für die Region T ≥ s; Rand: eine Zelle Wiederholung, dann 0 (schließt außerhalb der Szene).
export function konturen(T, s) {
  const PX = NX + 4, PY = NY + 4;
  const P = new Float64Array(PX * PY);
  for (let j = 0; j < PY; j++) for (let i = 0; i < PX; i++) {
    const ii = i - 2, jj = j - 2;
    if (ii < -1 || jj < -1 || ii > NX || jj > NY) { P[j * PX + i] = 0; continue; }
    const ci = Math.min(NX - 1, Math.max(0, ii)), cj = Math.min(NY - 1, Math.max(0, jj));
    P[j * PX + i] = (ii < -1 || ii > NX || jj < -1 || jj > NY) ? 0 : T[idx(ci, cj)];
  }
  const px = (i) => (i - 2 + 0.5) * Z;
  const py = (j) => (j - 2 + 0.5) * Z;
  // Kanten-Schnittpunkte; Segmente je Zelle
  const segs = new Map(); // Schlüssel Startpunkt → Liste
  const key = (p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
  const kante = (i0, j0, i1, j1) => {
    const a = P[j0 * PX + i0], b = P[j1 * PX + i1];
    const t = (s - a) / (b - a);
    return [px(i0) + (px(i1) - px(i0)) * t, py(j0) + (py(j1) - py(j0)) * t];
  };
  const liste = [];
  for (let j = 0; j < PY - 1; j++) for (let i = 0; i < PX - 1; i++) {
    const a = P[j * PX + i] >= s, b = P[j * PX + i + 1] >= s, c = P[(j + 1) * PX + i + 1] >= s, d = P[(j + 1) * PX + i] >= s;
    const code = (a ? 8 : 0) | (b ? 4 : 0) | (c ? 2 : 0) | (d ? 1 : 0);
    if (code === 0 || code === 15) continue;
    const top = () => kante(i, j, i + 1, j), right = () => kante(i + 1, j, i + 1, j + 1), bottom = () => kante(i, j + 1, i + 1, j + 1), left = () => kante(i, j, i, j + 1);
    const mitte = (P[j * PX + i] + P[j * PX + i + 1] + P[(j + 1) * PX + i + 1] + P[(j + 1) * PX + i]) / 4 >= s;
    // Segmente so orientiert, dass die Region rechts liegt (im Uhrzeigersinn um die Region)
    const add = (p, q) => liste.push([p, q]);
    switch (code) {
      case 1: add(left(), bottom()); break;
      case 2: add(bottom(), right()); break;
      case 3: add(left(), right()); break;
      case 4: add(right(), top()); break;
      case 5: if (mitte) { add(left(), top()); add(right(), bottom()); } else { add(left(), bottom()); add(right(), top()); } break;
      case 6: add(bottom(), top()); break;
      case 7: add(left(), top()); break;
      case 8: add(top(), left()); break;
      case 9: add(top(), bottom()); break;
      case 10: if (mitte) { add(top(), right()); add(bottom(), left()); } else { add(top(), left()); add(bottom(), right()); } break;
      case 11: add(top(), right()); break;
      case 12: add(right(), left()); break;
      case 13: add(right(), bottom()); break;
      case 14: add(bottom(), left()); break;
    }
  }
  for (const sg of liste) {
    const k = key(sg[0]);
    if (!segs.has(k)) segs.set(k, []);
    segs.get(k).push(sg);
  }
  const ringe = [];
  const benutzt = new Set();
  for (const sg of liste) {
    if (benutzt.has(sg)) continue;
    const ring = [sg[0]];
    let cur = sg;
    while (cur && !benutzt.has(cur)) {
      benutzt.add(cur);
      ring.push(cur[1]);
      const nxt = (segs.get(key(cur[1])) || []).find((x) => !benutzt.has(x));
      cur = nxt;
    }
    if (ring.length > 3) ringe.push(ring);
  }
  return ringe;
}

// Ramer-Douglas-Peucker für geschlossene Ringe
function rdp(pts, eps) {
  if (pts.length < 4) return pts;
  const d2 = (p, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l = dx * dx + dy * dy;
    if (l === 0) return (p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2;
    let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l;
    t = Math.max(0, Math.min(1, t));
    return (p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2;
  };
  const rec = (a, b) => {
    let m = -1, md = 0;
    for (let k = a + 1; k < b; k++) { const d = d2(pts[k], pts[a], pts[b]); if (d > md) { md = d; m = k; } }
    if (md > eps * eps) return [...rec(a, m).slice(0, -1), ...rec(m, b)];
    return [pts[a], pts[b]];
  };
  return rec(0, pts.length - 1);
}

export function pfad(ringe, eps = 0.3) {
  const f = (v) => String(Math.round(v * 10) / 10);
  return ringe.map((r) => 'M' + rdp(r, eps).slice(0, -1).map(([x, y]) => `${f(x)} ${f(y)}`).join(' ') + 'Z').join('');
}

// Gaußsche Glättung (trennbar), glättet Rasterstufen der Isothermen
function weich(T, sigma) {
  const r = Math.ceil(sigma * 3);
  const w = [];
  for (let k = -r; k <= r; k++) w.push(Math.exp(-(k * k) / (2 * sigma * sigma)));
  const sw = w.reduce((a, b) => a + b, 0);
  const A = new Float64Array(NX * NY), B = new Float64Array(NX * NY);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    let s = 0;
    for (let k = -r; k <= r; k++) s += w[k + r] * T[idx(Math.min(NX - 1, Math.max(0, i + k)), j)];
    A[idx(i, j)] = s / sw;
  }
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    let s = 0;
    for (let k = -r; k <= r; k++) s += w[k + r] * A[idx(i, Math.min(NY - 1, Math.max(0, j + k)))];
    B[idx(i, j)] = s / sw;
  }
  return B;
}

async function main() {
  const zonen = [0, 1, 2].map(loese).map((T) => weich(T, 0.9));
  const summe = new Float64Array(NX * NY);
  for (let k = 0; k < NX * NY; k++) summe[k] = zonen[0][k] + zonen[1][k] + zonen[2][k];
  let max = 0;
  for (const v of summe) max = Math.max(max, v);
  const skala = 1 / max;
  const tau = ankunft();
  // tau normieren auf den sichtbaren Bereich (erstes Band)
  let tmax = 0;
  for (let k = 0; k < NX * NY; k++) if (summe[k] * skala >= SCHWELLEN[0] && tau[k] < Infinity) tmax = Math.max(tmax, tau[k]);
  console.log('tau max sichtbar', tmax.toFixed(3));
  // Ausgleich der Ankunftszeiten (Rangfolge bleibt): Die Front wandert gleichmäßig durch das sichtbare Bild,
  // statt 90 % der Fläche im ersten Drittel zu wärmen. 75 % Rang, 25 % physikalischer Abstand.
  const sichtbar = [];
  for (let k = 0; k < NX * NY; k++) if (summe[k] * skala >= SCHWELLEN[0] && tau[k] < Infinity) sichtbar.push(tau[k]);
  sichtbar.sort((a, b) => a - b);
  const rang = (t) => { let lo = 0, hi = sichtbar.length; while (lo < hi) { const m = (lo + hi) >> 1; if (sichtbar[m] < t) lo = m + 1; else hi = m; } return lo / sichtbar.length; };
  for (let k = 0; k < NX * NY; k++) if (tau[k] < Infinity) tau[k] = (0.75 * rang(tau[k]) + 0.25 * Math.min(1, tau[k] / tmax)) * tmax;
  // Textur: links R = sqrt(T) (mehr Stufen bei den kalten Schwellen), G = Anteil Heizung, B = Anteil Bad;
  // rechts R = Ankunftszeit tau. Die GPU rechnet T = R², die Bänder unten nutzen denselben Wert.
  const roh = Buffer.alloc(NX * 2 * NY * 3);
  const q = new Float64Array(NX * NY);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const k = idx(i, j);
    const o = (j * NX * 2 + i) * 3;
    const t = Math.min(1, summe[k] * skala);
    const r = Math.round(Math.sqrt(t) * 255);
    const g = summe[k] > 0 ? Math.round((zonen[1][k] / summe[k]) * 255) : 0;
    const b = summe[k] > 0 ? Math.round((zonen[2][k] / summe[k]) * 255) : 0;
    roh[o] = r; roh[o + 1] = g; roh[o + 2] = b;
    q[k] = (r / 255) ** 2;
    const o2 = (j * NX * 2 + NX + i) * 3;
    const tn = Math.min(1, tau[k] / tmax);
    roh[o2] = Math.round(tn * 255); roh[o2 + 1] = 0; roh[o2 + 2] = 0;
  }
  await sharp(roh, { raw: { width: NX * 2, height: NY, channels: 3 } }).png({ compressionLevel: 9, palette: false, effort: 10 }).toFile(path.join(ordner, 'js/feld.png'));
  // Konturen im Wurzelraum: die GPU interpoliert R = sqrt(T) bilinear, die Bänder tun dasselbe
  const wurzel = new Float64Array(NX * NY);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) wurzel[idx(i, j)] = roh[(j * NX * 2 + i) * 3] / 255;
  const baender = SCHWELLEN.map((s) => pfad(konturen(wurzel, Math.sqrt(s))));
  await fs.writeFile(path.join(hier, 'baender.json'), JSON.stringify({ schwellen: SCHWELLEN, baender }, null, 1));
  const st = await fs.stat(path.join(ordner, 'js/feld.png'));
  console.log('feld.png', st.size, 'B; Bänder', baender.map((b) => b.length).join(' / '), 'Zeichen');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
