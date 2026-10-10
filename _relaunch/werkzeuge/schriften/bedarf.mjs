// Schriftbedarf feststellen (R3-PERF-01, Aufgabe 1): welche Familie in welchem Gewicht, welcher Breite,
// welcher Schriftgröße (opsz) und mit welchen Zeichen und Merkmalen auf der Plattform wirklich gesetzt wird.
//
// Aufruf: node _relaunch/werkzeuge/schriften/bedarf.mjs --base http://localhost:3450 [--out <datei.json>]
//         [--vps m390,d1440] [--only start,bewerbung]
//
// Lesend: jede Seite der Grundmenge je Ansicht, Anfragesperre (G5) aus lib/browser.mjs, keine Formularsendung.
// Erfasst werden alle Textknoten (auch verborgene, z. B. das geschlossene Menü), Werte und Platzhalter von
// Eingabefeldern sowie SVG-Text. Je Textknoten zählt der berechnete Stil des Elternelements; die Familie ist die
// erste eigene Familie im font-family-Stapel (bricolage, atkinson, martian; Ext-Varianten zählen zur Familie).
import fs from 'node:fs/promises';
import path from 'node:path';
import { GRUNDMENGE, VIEWPORTS, launch, newContext, scrollThrough } from '../lib/browser.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]]] : acc), []));
const base = (args.base ?? 'http://localhost:3450').replace(/\/$/, '');
const vps = VIEWPORTS.filter((v) => (args.vps ?? 'm390,d1440').split(',').includes(v.name));
const only = args.only ? args.only.split(',') : null;
const out = args.out ? path.resolve(args.out) : null;

const browser = await launch();
const sum = {};
const seiten = [];

function add(rec, page) {
  const f = (sum[rec.familie] ??= { gewichte: {}, breiten: {}, groessen: { min: Infinity, max: 0 }, zeichen: new Set(), merkmale: {}, variation: {}, optisch: {}, stile: {}, versalien: 0, seiten: new Set(), beispiele: {} });
  const w = String(rec.gewicht);
  f.gewichte[w] = (f.gewichte[w] ?? 0) + rec.n;
  f.breiten[rec.breite] = (f.breiten[rec.breite] ?? 0) + rec.n;
  f.groessen.min = Math.min(f.groessen.min, rec.groesse);
  f.groessen.max = Math.max(f.groessen.max, rec.groesse);
  for (const ch of rec.text) f.zeichen.add(ch);
  for (const key of [rec.ziffern, rec.merkmale].filter((x) => x && x !== 'normal')) f.merkmale[key] = (f.merkmale[key] ?? 0) + rec.n;
  if (rec.variation !== 'normal') f.variation[rec.variation] = (f.variation[rec.variation] ?? 0) + rec.n;
  f.optisch[rec.optisch] = (f.optisch[rec.optisch] ?? 0) + rec.n;
  f.stile[rec.stil] = (f.stile[rec.stil] ?? 0) + rec.n;
  if (rec.versalien) f.versalien += rec.n;
  f.seiten.add(page);
  const bk = `${w}|${rec.breite}`;
  (f.beispiele[bk] ??= []).length < 4 && f.beispiele[bk].push(`${page}: ${rec.klasse} „${rec.text.slice(0, 40)}“ (${rec.groesse}px)`);
}

for (const p of GRUNDMENGE) {
  if (only && !only.includes(p.slug)) continue;
  for (const vp of vps) {
    const { context, requestLog } = await newContext(browser, { origin: base, viewport: vp, colorScheme: 'light', reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(base + p.path, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.evaluate(() => document.fonts?.ready);
    await scrollThrough(page, { pauseMs: 60 });
    const recs = await page.evaluate(() => {
      const fam = (ff) => {
        for (const part of ff.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '').toLowerCase())) {
          if (part.startsWith('bricolage')) return 'bricolage';
          if (part.startsWith('atkinson')) return 'atkinson';
          if (part.startsWith('martian')) return 'martian';
          if (part) return `andere:${part}`;
        }
        return 'unbekannt';
      };
      const out = new Map();
      const push = (el, text) => {
        text = text.replace(/\s+/g, ' ').trim();
        if (!text) return;
        const cs = getComputedStyle(el);
        const tt = cs.textTransform;
        const shown = tt === 'uppercase' ? text.toLocaleUpperCase('de-DE') : tt === 'lowercase' ? text.toLocaleLowerCase('de-DE') : text;
        const rec = {
          familie: fam(cs.fontFamily),
          gewicht: Number(cs.fontWeight),
          breite: cs.fontStretch,
          groesse: Math.round(parseFloat(cs.fontSize) * 10) / 10,
          ziffern: cs.fontVariantNumeric,
          merkmale: cs.fontFeatureSettings,
          variation: cs.fontVariationSettings,
          optisch: cs.fontOpticalSizing,
          stil: cs.fontStyle,
          versalien: tt === 'uppercase',
          klasse: (el.getAttribute('class') || el.tagName.toLowerCase()).split(/\s+/).slice(0, 4).join(' '),
          text: shown,
        };
        const key = [rec.familie, rec.gewicht, rec.breite, rec.groesse, rec.ziffern, rec.merkmale, rec.variation, rec.optisch, rec.stil, rec.versalien].join('|');
        const prev = out.get(key);
        if (prev) {
          prev.n += 1;
          if (prev.text.length < 4000) prev.text += ' ' + shown;
        } else out.set(key, { ...rec, n: 1 });
      };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const el = node.parentElement;
        if (!el || el.closest('script,style,noscript,template')) continue;
        push(el, node.nodeValue || '');
      }
      for (const el of document.querySelectorAll('input,textarea,select')) {
        if (el.placeholder) push(el, el.placeholder);
        if (el.value && el.type !== 'hidden' && el.type !== 'file') push(el, el.value);
      }
      for (const el of document.querySelectorAll('*')) {
        for (const pseudo of ['::before', '::after', '::marker']) {
          const c = getComputedStyle(el, pseudo).content;
          if (c && c !== 'none' && c !== 'normal' && /^".+"$/.test(c)) {
            const cs = getComputedStyle(el, pseudo);
            out.set(`pseudo|${Math.random()}`, { familie: fam(cs.fontFamily), gewicht: Number(cs.fontWeight), breite: cs.fontStretch, groesse: Math.round(parseFloat(cs.fontSize) * 10) / 10, ziffern: cs.fontVariantNumeric, merkmale: cs.fontFeatureSettings, variation: cs.fontVariationSettings, optisch: cs.fontOpticalSizing, stil: cs.fontStyle, versalien: false, klasse: `${pseudo} ${el.tagName.toLowerCase()}`, text: c.slice(1, -1), n: 1 });
          }
        }
      }
      return [...out.values()];
    });
    for (const rec of recs) add(rec, `${p.slug}@${vp.name}`);
    seiten.push({ seite: p.slug, ansicht: vp.name, eintraege: recs.length, gesperrt: requestLog.length });
    await context.close();
    process.stdout.write(`${p.slug}@${vp.name}: ${recs.length} Stilgruppen\n`);
  }
}
await browser.close();

const ergebnis = {
  basis: base,
  erstellt: new Date().toISOString(),
  ansichten: vps.map((v) => v.name),
  seiten,
  familien: Object.fromEntries(
    Object.entries(sum).map(([k, f]) => [
      k,
      {
        gewichte: f.gewichte,
        breiten: f.breiten,
        groessenPx: f.groessen,
        stile: f.stile,
        optisch: f.optisch,
        merkmale: f.merkmale,
        variation: f.variation,
        versalienTextknoten: f.versalien,
        zeichen: [...f.zeichen].sort().join(''),
        zeichenCodes: [...f.zeichen].map((c) => c.codePointAt(0)).sort((a, b) => a - b).map((c) => 'U+' + c.toString(16).toUpperCase().padStart(4, '0')),
        seiten: f.seiten.size,
        beispiele: f.beispiele,
      },
    ]),
  ),
};
const json = JSON.stringify(ergebnis, null, 2);
if (out) {
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, json + '\n');
}
for (const [k, f] of Object.entries(ergebnis.familien)) {
  console.log(`\n== ${k}: Gewichte ${JSON.stringify(f.gewichte)} · Breiten ${JSON.stringify(f.breiten)} · Größe ${f.groessenPx.min}–${f.groessenPx.max} px · Stile ${JSON.stringify(f.stile)}`);
  console.log(`   Merkmale ${JSON.stringify(f.merkmale)} · Variation ${JSON.stringify(f.variation)} · optisch ${JSON.stringify(f.optisch)}`);
  console.log(`   Zeichen (${[...f.zeichen].length}): ${f.zeichen}`);
}
