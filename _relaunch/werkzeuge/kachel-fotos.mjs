// Bildschirmfotos einer beliebigen Seite (z. B. Stilkachel in _relaunch/richtungen/<x>/index.html)
// in allen ANSICHTEN, hell und dunkel, mit voller und reduzierter Bewegung.
// Aufruf: node kachel-fotos.mjs --url http://localhost:3701/ --out _relaunch/richtungen/a/fotos [--motion both|reduce|no-preference]
// Ausgabe: <out>/<ansicht>-<schema>-<bewegung>__NN.webp (Bildschirmhöhen-Ausschnitte, ≤ 1440 px breit) + bericht.json
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { VIEWPORTS, collectErrors, launch, newContext, overflowReport, scrollThrough } from './lib/browser.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
if (!args.url || !args.out) {
  console.error('Aufruf: node kachel-fotos.mjs --url <url> --out <ordner> [--motion both|reduce|no-preference]');
  process.exit(1);
}
const url = new URL(args.url);
const out = path.resolve(args.out);
const motions = args.motion === 'reduce' ? ['reduce'] : args.motion === 'no-preference' ? ['no-preference'] : ['no-preference', 'reduce'];
await fs.mkdir(out, { recursive: true });
const browser = await launch();
const bericht = { url: url.href, erstellt: new Date().toISOString(), aufnahmen: [] };
for (const vp of VIEWPORTS) {
  for (const scheme of ['light', 'dark']) {
    for (const motion of motions) {
      if (motion === 'reduce' && (vp.name === 't768' || vp.name === 'd1920')) continue; // reduziert: nur m375/d1440
      const { context, requestLog } = await newContext(browser, { origin: url.origin, viewport: vp, colorScheme: scheme, reducedMotion: motion });
      const page = await context.newPage();
      const errors = collectErrors(page);
      await page.goto(url.href, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts?.ready);
      await scrollThrough(page);
      await page.waitForTimeout(motion === 'reduce' ? 200 : 1800);
      const overflow = await overflowReport(page);
      const raw = path.join(out, `.roh-${vp.name}-${scheme}-${motion}.png`);
      await page.screenshot({ path: raw, fullPage: true });
      const meta = await sharp(raw).metadata();
      const sliceH = Math.round(vp.height * vp.deviceScaleFactor);
      const n = Math.min(12, Math.ceil(meta.height / sliceH));
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
      bericht.aufnahmen.push({ ansicht: vp.name, schema: scheme, bewegung: motion, ueberlauf: overflow, fehler: errors, fremdanfragen: requestLog.filter((r) => r.kind !== 'attrappe'), dateien: files });
      console.log(`${vp.name}-${scheme}-${motion}: ${files.length} Ausschnitte${overflow.horizontal ? ' ÜBERLAUF' : ''}${errors.length ? ` ${errors.length} Fehler` : ''}`);
      await context.close();
    }
  }
}
await browser.close();
await fs.writeFile(path.join(out, 'bericht.json'), JSON.stringify(bericht, null, 2));
