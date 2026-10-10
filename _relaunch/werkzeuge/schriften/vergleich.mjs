// Schriftvergleich alt/neu ohne Seite (R3-PERF-01): setzt Probezeilen je Familie, Gewicht, Größe und Breite einmal
// mit den Originaldateien und einmal mit den Dateien aus app/fonts, misst die Breiten und vergleicht die Pixel.
// Deckt auch Schnitte ab, die eine Seite (noch) nicht zeigt, z. B. Martian Mono vor R3.
//
// Aufruf: node _relaunch/werkzeuge/schriften/vergleich.mjs [--out <bericht.json>] [--bild <bildpaar.png>]
// Lesend; die Schriften kommen als data:-URL in eine leere Seite (keine Anfrage an einen Server, G5).
import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { launch, newContext } from '../lib/browser.mjs';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const argv = process.argv.slice(2);
const opt = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : null);

const ALT = {
  bricolage: '_relaunch/ausbau/referenz/b-runde1/fonts/bricolage-grotesque-latin-opsz-normal.woff2',
  atkinson: '_relaunch/ausbau/referenz/b-runde1/fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2',
  martian: '_relaunch/richtungen/a/fonts/martian-mono-latin-wdth-normal.woff2',
};
const NEU = {
  bricolage: 'app/fonts/bricolage-grotesque-latin-opsz-wght400-800.woff2',
  atkinson: 'app/fonts/atkinson-hyperlegible-next-latin-wght400-700.woff2',
  martian: 'app/fonts/martian-mono-latin-wdth75-wght400-800.woff2',
};
// Deskriptoren wie in app/fonts/index.ts vorher bzw. nachher
const DESK_ALT = { bricolage: 'font-weight: 200 800;', atkinson: 'font-weight: 200 800;', martian: 'font-weight: 100 800; font-stretch: 75% 112.5%;' };
const DESK_NEU = { bricolage: 'font-weight: 400 800;', atkinson: 'font-weight: 400 700;', martian: 'font-weight: 400 800; font-stretch: 75%;' };

// Probefälle aus dem Bedarf (bedarf.mjs): Familie, Gewichte, Größen in px, Text, Merkmale
const TEXT = 'Ehrliches Handwerk. Pünktlich Feierabend – „Wärmepumpe“ für Größe, Qualität & Öl? ÄÖÜ äöü ß 0123456789 €';
const FAELLE = [
  { fam: 'bricolage', gewichte: [400, 500, 600, 700, 800], groessen: [14, 20, 32, 60, 128], text: TEXT, extra: '' },
  { fam: 'bricolage', gewichte: [400, 600, 700], groessen: [15, 20], text: '06441 42956 · 07:00–16:45 · 35578 Wetzlar', extra: 'font-variant-numeric: tabular-nums;' },
  { fam: 'atkinson', gewichte: [400, 500, 600, 700], groessen: [12, 15, 17, 20, 29], text: TEXT, extra: '' },
  { fam: 'atkinson', gewichte: [500], groessen: [15], text: '06441 42956', extra: 'font-variant-numeric: tabular-nums;' },
  { fam: 'martian', gewichte: [400, 500, 600, 700], groessen: [12, 14, 19, 32, 53], text: '13:30 · 35 km · 3.600–4.600 € · 1926–2026 · 100 JAHRE · KEIN WOCHENEND-NOTDIENST · $ ¢', extra: 'font-stretch: 75%; font-variant-numeric: tabular-nums;' },
  { fam: 'martian', gewichte: [500], groessen: [14], text: 'KEIN WOCHENEND-NOTDIENST', extra: 'font-stretch: 75%; letter-spacing: 0.06em;' },
];

const b64 = async (rel) => (await fs.readFile(path.join(ROOT, rel))).toString('base64');
let css = '';
for (const fam of Object.keys(ALT)) {
  css += `@font-face{font-family:"${fam}-alt";src:url(data:font/woff2;base64,${await b64(ALT[fam])}) format("woff2");${DESK_ALT[fam]}font-display:block}\n`;
  css += `@font-face{font-family:"${fam}-neu";src:url(data:font/woff2;base64,${await b64(NEU[fam])}) format("woff2");${DESK_NEU[fam]}font-display:block}\n`;
}

let zeilen = '';
let n = 0;
const meta = [];
for (const f of FAELLE) {
  for (const w of f.gewichte) {
    for (const s of f.groessen) {
      for (const v of ['alt', 'neu']) {
        zeilen += `<div class="z" id="${v}-${n}" style="font-family:'${f.fam}-${v}';font-weight:${w};font-size:${s}px;${f.extra}">${f.text}</div>\n`;
      }
      meta.push({ n, fam: f.fam, gewicht: w, groesse: s, merkmale: f.extra.trim() });
      n++;
    }
  }
}
const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>${css}
body{margin:0;background:#FBF7F0;color:#111A3B;-webkit-font-smoothing:antialiased}
.z{white-space:nowrap;line-height:1.2;padding:2px 8px;display:block;width:max-content}
</style></head><body>${zeilen}</body></html>`;

const browser = await launch();
const { context } = await newContext(browser, { origin: 'http://localhost', viewport: { name: 'probe', width: 2400, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 } });
const page = await context.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.fonts].map((f) => f.load()));
});
const ergebnisse = [];
let bildpaar = null;
for (const m of meta) {
  const breiten = await page.evaluate((i) => ['alt', 'neu'].map((v) => document.getElementById(`${v}-${i}`).getBoundingClientRect().width), m.n);
  const [ba, bb] = await Promise.all(['alt', 'neu'].map((v) => page.locator(`#${v}-${m.n}`).screenshot()));
  const pa = PNG.sync.read(ba);
  const pb = PNG.sync.read(bb);
  let px = null;
  let pxAA = null;
  if (pa.width === pb.width && pa.height === pb.height) {
    px = pixelmatch(pa.data, pb.data, null, pa.width, pa.height, { threshold: 0.1, includeAA: false });
    pxAA = pixelmatch(pa.data, pb.data, null, pa.width, pa.height, { threshold: 0.1, includeAA: true });
  }
  ergebnisse.push({ ...m, breiteAlt: Math.round(breiten[0] * 100) / 100, breiteNeu: Math.round(breiten[1] * 100) / 100, deltaPx: Math.round((breiten[1] - breiten[0]) * 100) / 100, pixelUngleich: px, pixelUngleichMitKantenglaettung: pxAA, pixelGesamt: pa.width * pa.height });
}
const schriften = await page.evaluate(() => [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.stretch} ${f.status}`));
if (opt('--bild')) {
  // Bildpaar: je Familie eine Probe alt über neu (Martian 600 32 px, Bricolage 800 60 px, Atkinson 400 17 px, Bricolage 400 20 px)
  const wahl = [
    meta.find((m) => m.fam === 'bricolage' && m.gewicht === 800 && m.groesse === 60),
    meta.find((m) => m.fam === 'bricolage' && m.gewicht === 500 && m.groesse === 32),
    meta.find((m) => m.fam === 'atkinson' && m.gewicht === 400 && m.groesse === 17),
    meta.find((m) => m.fam === 'atkinson' && m.gewicht === 600 && m.groesse === 15),
    meta.find((m) => m.fam === 'martian' && m.gewicht === 600 && m.groesse === 32),
    meta.find((m) => m.fam === 'martian' && m.gewicht === 500 && m.groesse === 14 && m.merkmale.includes('letter-spacing')),
  ];
  await page.evaluate((ids) => {
    for (const el of document.querySelectorAll('.z')) el.style.display = 'none';
    const box = document.createElement('div');
    box.id = 'bildpaar';
    box.style.cssText = 'padding:16px;display:grid;gap:4px;width:max-content;background:#FBF7F0';
    for (const i of ids) {
      for (const v of ['alt', 'neu']) {
        const el = document.getElementById(`${v}-${i}`).cloneNode(true);
        el.style.display = 'block';
        el.removeAttribute('id');
        const tag = document.createElement('div');
        tag.textContent = v === 'alt' ? 'vorher (Original, variabel)' : 'nachher (instanziert, teilgesetzt)';
        tag.style.cssText = `font:12px/1.2 sans-serif;color:${v === 'alt' ? '#454C78' : '#1F57C4'};padding:6px 8px 0`;
        box.append(tag, el);
      }
    }
    document.body.append(box);
  }, wahl.map((m) => m.n));
  bildpaar = opt('--bild');
  await page.locator('#bildpaar').screenshot({ path: bildpaar });
}
await browser.close();

const zus = {
  faelle: ergebnisse.length,
  maxDeltaPx: Math.max(...ergebnisse.map((e) => Math.abs(e.deltaPx))),
  pixelUngleichSumme: ergebnisse.reduce((s, e) => s + (e.pixelUngleich ?? 0), 0),
  pixelGesamtSumme: ergebnisse.reduce((s, e) => s + e.pixelGesamt, 0),
  groesseUngleich: ergebnisse.filter((e) => e.pixelUngleich === null).length,
};
for (const fam of ['bricolage', 'atkinson', 'martian']) {
  const e = ergebnisse.filter((x) => x.fam === fam);
  zus[fam] = { faelle: e.length, maxDeltaPx: Math.max(...e.map((x) => Math.abs(x.deltaPx))), pixelUngleich: e.reduce((s, x) => s + (x.pixelUngleich ?? 0), 0), pixelGesamt: e.reduce((s, x) => s + x.pixelGesamt, 0) };
}
console.log(JSON.stringify(zus, null, 1));
console.log(schriften.join('\n'));
for (const e of ergebnisse.filter((x) => Math.abs(x.deltaPx) >= 0.25 || (x.pixelUngleich ?? 1) > 50)) console.log('Auffällig', JSON.stringify(e));
if (opt('--out')) await fs.writeFile(path.resolve(opt('--out')), JSON.stringify({ erstellt: new Date().toISOString(), zusammenfassung: zus, schriften, faelle: ergebnisse }, null, 1) + '\n');
