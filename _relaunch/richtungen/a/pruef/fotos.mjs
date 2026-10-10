#!/usr/bin/env node
// Bildschirmfotos der Kachel in allen Ansichten, hell und dunkel, voller und reduzierter Bewegung, ALLE Bildschirmhöhen-Ausschnitte.
// Wie _relaunch/werkzeuge/kachel-fotos.mjs, aber ohne die Kappung auf 12 Ausschnitte; schreibt bericht.json mit allen Dateien.
// Aufruf (Server auf :3701 läuft): node pruef/fotos.mjs --url http://localhost:3701/ --out fotos
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from '../../../werkzeuge/node_modules/sharp/lib/index.js';
import { VIEWPORTS, collectErrors, launch, newContext, overflowReport, scrollThrough } from '../../../werkzeuge/lib/browser.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
if (!args.url || !args.out) { console.error('Aufruf: node pruef/fotos.mjs --url <url> --out <ordner>'); process.exit(1); }
const url = new URL(args.url);
const out = path.resolve(args.out);
await fs.mkdir(out, { recursive: true });
const browser = await launch();
const bericht = { url: url.href, erstellt: new Date().toISOString(), werkzeug: 'pruef/fotos.mjs (ohne Kappung der Ausschnitte)', aufnahmen: [] };
for (const vp of VIEWPORTS) for (const scheme of ['light', 'dark']) for (const motion of ['no-preference', 'reduce']) {
  if (motion === 'reduce' && (vp.name === 't768' || vp.name === 'd1920')) continue;
  const { context, requestLog } = await newContext(browser, { origin: url.origin, viewport: vp, colorScheme: scheme, reducedMotion: motion });
  const page = await context.newPage();
  const errors = collectErrors(page);
  await page.goto(url.href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts?.ready);
  await scrollThrough(page);
  await page.waitForTimeout(motion === 'reduce' ? 200 : 2300);
  const overflow = await overflowReport(page);
  const raw = path.join(out, `.roh-${vp.name}-${scheme}-${motion}.png`);
  await page.screenshot({ path: raw, fullPage: true });
  const meta = await sharp(raw).metadata();
  const sliceH = Math.round(vp.height * vp.deviceScaleFactor);
  const n = Math.ceil(meta.height / sliceH);
  const files = [];
  for (let i = 0; i < n; i++) {
    const top = i * sliceH;
    const h = Math.min(sliceH, meta.height - top);
    if (h < 40) break;
    const f = path.join(out, `${vp.name}-${scheme}-${motion === 'reduce' ? 'reduziert' : 'voll'}__${String(i + 1).padStart(2, '0')}.webp`);
    await sharp(raw).extract({ left: 0, top, width: meta.width, height: h }).resize({ width: Math.min(1440, meta.width) }).webp({ quality: 70, effort: 6 }).toFile(f);
    files.push(path.basename(f));
  }
  await fs.rm(raw);
  bericht.aufnahmen.push({ ansicht: vp.name, schema: scheme, bewegung: motion, ueberlauf: overflow, fehler: errors, fremdanfragen: requestLog.filter((r) => r.kind !== 'attrappe'), ausschnitte: files.length, dateien: files });
  console.log(`${vp.name}-${scheme}-${motion}: ${files.length} Ausschnitte${overflow.horizontal ? ' ÜBERLAUF' : ''}${overflow.clipped.length ? ` ${overflow.clipped.length} abgeschnitten` : ''}${errors.length ? ` ${errors.length} Fehler` : ''}`);
  await context.close();
}
await browser.close();
await fs.writeFile(path.join(out, 'bericht.json'), JSON.stringify(bericht, null, 2));
