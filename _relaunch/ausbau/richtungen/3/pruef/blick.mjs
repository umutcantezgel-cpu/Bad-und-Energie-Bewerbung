// Schneller Arbeitsblick: Bildschirmfotos einer Ansicht zu festen Zeiten (nur zum Gestalten, kein Beleg).
// Aufruf: node pruef/blick.mjs --out <ordner> [--vps m390,d1440] [--schemes light] [--motion no-preference] [--zeiten 2000] [--voll 0|1] [--url …]
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const hier = path.dirname(fileURLToPath(import.meta.url));
const { VIEWPORTS, launch, newContext, collectErrors } = await import(path.resolve(hier, '../../../../werkzeuge/lib/browser.mjs'));
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
const url = args.url ?? 'http://localhost:3803/';
const out = path.resolve(args.out ?? '/tmp');
await fs.mkdir(out, { recursive: true });
const extra = [...(VIEWPORTS), { name: 'm320', width: 320, height: 568, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, { name: 'd1280', width: 1280, height: 720, isMobile: false, hasTouch: false, deviceScaleFactor: 1 }];
const vps = extra.filter((v) => (args.vps ?? 'm390,d1440').split(',').includes(v.name));
const zeiten = (args.zeiten ?? '2000').split(',').map(Number);
const browser = await launch();
for (const vp of vps) for (const scheme of (args.schemes ?? 'light').split(',')) {
  const { context } = await newContext(browser, { origin: new URL(url).origin, viewport: vp, colorScheme: scheme, reducedMotion: args.motion ?? 'no-preference' });
  const page = await context.newPage();
  const errors = collectErrors(page);
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'commit' });
  for (const t of zeiten) {
    const warte = t - (Date.now() - t0);
    if (warte > 0) await page.waitForTimeout(warte);
    const f = path.join(out, `${vp.name}-${scheme}-${t}.png`);
    await page.screenshot({ path: f, fullPage: args.voll === '1' });
  }
  const info = await page.evaluate(() => ({ status: window.__waermebild, klassen: document.documentElement.className, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  console.log(vp.name, scheme, JSON.stringify(info), errors.length ? JSON.stringify(errors) : '');
  await context.close();
}
await browser.close();
