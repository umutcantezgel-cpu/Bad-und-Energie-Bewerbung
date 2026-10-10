// V6-C: Was kostet das erste Bild (UpdateLayoutTree, Layout)? Feiner Trace mit Blink-Kategorien.
// Aufruf: node stil.mjs --base http://localhost:3481 --pfad /bewerbung [--out datei.json]
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const W = '/home/user/Bad-und-Energie-Bewerbung/_relaunch/werkzeuge';
const { launch } = await import(pathToFileURL(`${W}/lib/browser.mjs`).href);
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
const base = args.base.replace(/\/$/, '');
const browser = await launch();
const context = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
const page = await context.newPage();
await page.goto('about:blank');
await browser.startTracing(page, { categories: ['blink', 'blink_style', 'blink.debug', 'devtools.timeline', 'disabled-by-default-devtools.timeline', 'fonts', 'loading', 'disabled-by-default-blink.debug.layout', 'toplevel', 'v8'] });
await page.goto(base + args.pfad, { waitUntil: 'load' });
await page.waitForTimeout(800);
const buf = await browser.stopTracing();
await browser.close();
const t = JSON.parse(buf.toString());
const ev = t.traceEvents;
if (args.out) await fs.writeFile(args.out, buf);
const fcp = ev.find((e) => e.name === 'firstContentfulPaint');
const main = ev.filter((e) => e.pid === fcp.pid && e.tid === fcp.tid && e.ph === 'X');
// erste große UpdateLayoutTree und Layout vor dem FCP
const ult = main.filter((e) => e.name === 'UpdateLayoutTree' && e.ts < fcp.ts).sort((a, b) => b.dur - a.dur)[0];
const lay = main.filter((e) => e.name === 'Layout' && e.ts < fcp.ts).sort((a, b) => b.dur - a.dur)[0];
for (const [name, top] of [['UpdateLayoutTree', ult], ['Layout', lay]]) {
  console.log(`== ${name} ${(top.dur / 1000).toFixed(1)} ms`);
  const inner = main.filter((e) => e.ts >= top.ts && e.ts + e.dur <= top.ts + top.dur && e !== top);
  const sum = new Map();
  for (const e of inner) {
    const k = e.name;
    const s = sum.get(k) ?? { n: 0, ms: 0 };
    s.n++;
    s.ms += e.dur / 1000;
    sum.set(k, s);
  }
  for (const [k, s] of [...sum.entries()].sort((a, b) => b[1].ms - a[1].ms).slice(0, 25)) console.log(`   ${s.ms.toFixed(1).padStart(6)} ms  ${String(s.n).padStart(5)}×  ${k}`);
}
