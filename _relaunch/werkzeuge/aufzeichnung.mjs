// Aufzeichnung (Lauf 2 §10, nur als gekennzeichneter Rückfall und für die Bewertung): Video des Seitenaufrufs
// und optional eines Scrolls, je Ansicht, mit Anfragesperre (G5).
// Aufruf: node aufzeichnung.mjs --url http://localhost:3801/ --out <ordner> [--vps m390,d1440] [--sekunden 4] [--scroll 0|1] [--motion no-preference|reduce]
// Ausgabe: <out>/aufzeichnung-<ansicht>-<bewegung>.webm (Dateiname trägt „aufzeichnung“ als Kennzeichnung)
import fs from 'node:fs/promises';
import path from 'node:path';
import { VIEWPORTS, installRequestLock, launch } from './lib/browser.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
if (!args.url || !args.out) {
  console.error('Aufruf: node aufzeichnung.mjs --url <url> --out <ordner> [--vps m390,d1440] [--sekunden 4] [--scroll 0|1]');
  process.exit(1);
}
const url = new URL(args.url);
const out = path.resolve(args.out);
const vps = VIEWPORTS.filter((v) => (args.vps ?? 'm390,d1440').split(',').includes(v.name));
const sekunden = Number(args.sekunden ?? 4);
const scroll = args.scroll === '1';
const motion = args.motion ?? 'no-preference';
await fs.mkdir(out, { recursive: true });
const browser = await launch();
for (const vp of vps) {
  const tmp = path.join(out, `.video-${vp.name}`);
  // Video braucht recordVideo beim Anlegen; Anfragesperre wie in newContext
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: Math.min(vp.deviceScaleFactor, 2), isMobile: vp.isMobile, hasTouch: vp.hasTouch,
    reducedMotion: motion, locale: 'de-DE', timezoneId: 'Europe/Berlin', recordVideo: { dir: tmp, size: { width: vp.width, height: vp.height } },
  });
  await installRequestLock(ctx, { origin: url.origin });
  const page = await ctx.newPage();
  await page.goto(url.href, { waitUntil: 'commit' });
  await page.waitForTimeout(sekunden * 1000);
  if (scroll) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let y = 0; y <= h; y += Math.round(vp.height / 6)) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForTimeout(90);
    }
    await page.waitForTimeout(800);
  }
  const video = page.video();
  await ctx.close();
  const src = await video.path();
  const ziel = path.join(out, `aufzeichnung-${vp.name}-${motion === 'reduce' ? 'reduziert' : 'voll'}.webm`);
  await fs.rename(src, ziel);
  await fs.rm(tmp, { recursive: true, force: true });
  console.log(path.basename(ziel));
}
await browser.close();
