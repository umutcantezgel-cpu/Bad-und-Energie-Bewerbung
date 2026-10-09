#!/usr/bin/env node
// Sucht die Beschriftungsrichtung je Ort für den Lageplan (Wert RICHTUNG in erzeugen.mjs).
// Gemessen wird bei 320 px Viewport (Plan 286 px breit, der engste Fall); bei größeren Plänen wachsen die Abstände,
// die Beschriftungen behalten ihre Token-Größe, daher gilt eine Lösung für den engsten Fall auch für alle breiteren.
// Szenarien: jeder Ausschnitt (15, 25, 35) × jeder gewählte Ort. Sichtbar sind: Betrieb, ferne Orte, der gewählte Ort, Ringmarken, Maßstab, Nord.
// Aufruf: node pruef/richtungen.mjs [--url http://localhost:3701/]
import { launch, newContext } from '../../../werkzeuge/lib/browser.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') ? [...a, [x.slice(2), arr[i + 1]]] : a), []));
const url = new URL(args.url || 'http://localhost:3701/');
const browser = await launch();
const { context } = await newContext(browser, { origin: url.origin, viewport: { name: 'x', width: 320, height: 900, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }, colorScheme: 'light', reducedMotion: 'reduce' });
const page = await context.newPage();
await page.goto(url.href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const mess = await page.evaluate(() => {
  const wrap = document.querySelector('.pl-wrap');
  const W = wrap.clientWidth;
  const labels = {};
  const ul = document.querySelector('.pl-t35');
  for (const li of ul.querySelectorAll('li')) {
    const key = li.getAttribute('data-ort') || li.textContent.trim();
    li.classList.add('is-sel'); // fett: breitester Fall
    const b = li.getBoundingClientRect();
    labels[key] = { w: b.width, h: b.height };
    if (li.getAttribute('data-ort') !== 'giessen') li.classList.remove('is-sel');
  }
  const g = parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.5;
  return { W, labels, g };
});
await browser.close();

const { labels } = mess;
const BREITEN = [286, 343, 414, 500, 600, 672]; // Planbreiten von 320 px Viewport bis zum Höchstmaß von 42 rem
const HALB = { 15: 21, 25: 28, 35: 37.5 };
const ORTE = [
  ['wetzlar-kernstadt', 0.03, 0.0, 'fest'], ['garbenheim', 3.7, 0.2, 'kern'], ['hermannstein', -0.4, 2.0, 'kern'], ['steindorf', -1.0, -3.5, 'kern'],
  ['nauborn', 1.3, -3.5, 'kern'], ['asslar', -2.6, 3.0, 'kern'], ['dutenhofen', 7.2, 0.2, 'kern'], ['braunfels', -8.1, -5.4, 'fern'],
  ['giessen', 12.6, 2.5, 'fern'], ['herborn', -14.0, 13.2, 'fern'],
];
const DIR = ['e', 'w', 'ne', 'nw', 'se', 'sw', 'n', 's', 'ne2', 'nw2', 'se2', 'sw2'];
const KOSTEN = { e: 0, w: 0, ne: 1, nw: 1, se: 1, sw: 1, n: 2, s: 2, ne2: 3, nw2: 3, se2: 3, sw2: 3 };
function box(dir, x, y, w, h, g) {
  const k = g * 0.6;
  switch (dir) {
    case 'e': return [x + g, y - h / 2, w, h];
    case 'w': return [x - g - w, y - h / 2, w, h];
    case 'n': return [x - w / 2, y - g - h, w, h];
    case 's': return [x - w / 2, y + g, w, h];
    case 'ne': return [x + k, y - h - k, w, h];
    case 'nw': return [x - w - k, y - h - k, w, h];
    case 'se': return [x + k, y + k, w, h];
    case 'sw': return [x - w - k, y + k, w, h];
    case 'ne2': return [x + 1.6 * g, y - h - 1.6 * g, w, h];
    case 'nw2': return [x - w - 1.6 * g, y - h - 1.6 * g, w, h];
    case 'se2': return [x + 1.6 * g, y + 1.6 * g, w, h];
    case 'sw2': return [x - w - 1.6 * g, y + 1.6 * g, w, h];
  }
}
const hit = (a, b) => a[0] + 1 < b[0] + b[2] && a[0] + a[2] - 1 > b[0] && a[1] + 1 < b[1] + b[3] && a[1] + a[3] - 1 > b[1];
const szenarien = [];
for (const W of BREITEN) {
  const c = W / 2;
  const g = Math.max(8, (W * 14) / 640); // Abstand Punkt zu Beschriftung: --g in der Seite
  const half = (7 * W) / 640;
  for (const r of [15, 25, 35]) {
    const px = c / HALB[r];
    const pos = Object.fromEntries(ORTE.map(([id, e, n]) => [id, [c + e * px, c - n * px]]));
    const innen = (id) => { const o = ORTE.find((x) => x[0] === id); return Math.abs(o[1]) <= HALB[r] - 1.5 && Math.abs(o[2]) <= HALB[r] - 1.5; };
    const fest = [];
    for (const rr of [15, 25, 35]) {
      if (rr <= HALB[r] - 1.5) {
        const l = labels[`${rr} km`] ?? labels[`${rr} km`];
        if (l) fest.push([c - l.w / 2, c - rr * px - l.h / 2, l.w, l.h]);
      }
    }
    const sk = Object.entries(labels).find(([k]) => k.startsWith('1') && k.includes('Feld'));
    if (sk) fest.push([(36 + 5 * (320 / HALB[r]) + 10) * (W / 640), 604 * (W / 640) - sk[1].h / 2, sk[1].w, sk[1].h]);
    const nl = labels['N'];
    if (nl) fest.push([604 * (W / 640) - nl.w / 2, 76 * (W / 640), nl.w, nl.h]);
    const punkte = ORTE.map(([id]) => { const hh = id === 'wetzlar-kernstadt' ? (11 * W) / 640 : half; return { id, b: [pos[id][0] - hh, pos[id][1] - hh, 2 * hh, 2 * hh] }; });
    for (const [sel] of ORTE) {
      const sichtbar = ORTE.filter(([id, , , art]) => (art !== 'kern' && innen(id)) || id === sel).map(([id]) => id).filter(innen);
      szenarien.push({ W, g, r, sel, sichtbar, pos, fest, punkte });
    }
  }
}
const ids = ORTE.map((o) => o[0]);
const erg = {};
let ok = true;
for (const r of [15, 25, 35]) {
  const sz = szenarien.filter((x) => x.r === r);
  const einz = (id, dir) => {
    for (const s of sz) {
      if (!s.sichtbar.includes(id)) continue;
      const l = labels[id];
      const b = box(dir, ...s.pos[id], l.w, l.h, s.g);
      const d = process.env.DBG === id && process.env.R == r;
      if (b[0] < 1 || b[1] < 1 || b[0] + b[2] > s.W - 1 || b[1] + b[3] > s.W - 1) { if (d) console.log(dir, 'Rand', s.W, s.sel); return false; }
      for (const f of s.fest) if (hit(b, f)) { if (d) console.log(dir, 'fest', s.W, s.sel, b.map(Math.round), f.map(Math.round)); return false; }
      for (const p of s.punkte) if (p.id !== id && hit(b, p.b)) { if (d) console.log(dir, 'Punkt', p.id, s.W, s.sel, b.map(Math.round), p.b.map(Math.round)); return false; }
    }
    return true;
  };
  const par = (i, di, j, dj) => {
    for (const s of sz) {
      if (!s.sichtbar.includes(i) || !s.sichtbar.includes(j)) continue;
      if (hit(box(di, ...s.pos[i], labels[i].w, labels[i].h, s.g), box(dj, ...s.pos[j], labels[j].w, labels[j].h, s.g))) return false;
    }
    return true;
  };
  const zul = Object.fromEntries(ids.map((id) => [id, DIR.filter((d) => einz(id, d)).sort((a, b) => KOSTEN[a] - KOSTEN[b])]));
  let bestes = null, besteKosten = Infinity;
  const wahl = {};
  (function dfs(k, kosten) {
    if (kosten >= besteKosten) return;
    if (k === ids.length) { bestes = { ...wahl }; besteKosten = kosten; return; }
    const id = ids[k];
    for (const d of zul[id]) if (ids.slice(0, k).every((j) => par(id, d, j, wahl[j]))) { wahl[id] = d; dfs(k + 1, kosten + KOSTEN[d]); }
    delete wahl[id];
  })(0, 0);
  if (!bestes) {
    ok = false;
    console.log(`Ausschnitt ${r}: keine Lösung. Zulässig: ${JSON.stringify(zul)}`);
    for (let x = 0; x < ids.length; x++) for (let y = x + 1; y < ids.length; y++) if (!zul[ids[x]].some((di) => zul[ids[y]].some((dj) => par(ids[x], di, ids[y], dj)))) console.log('  unvereinbar:', ids[x], ids[y]);
  } else erg[r] = bestes;
}
if (!ok) process.exit(1);
console.log(`Planbreiten ${BREITEN.join(', ')} px`);
console.log(JSON.stringify(erg, null, 2));
