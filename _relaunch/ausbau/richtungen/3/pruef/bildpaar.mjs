// Gegenprobe zu E-019 (weicher Befund „Stimmung kippt“): Bildpaar m390 hell im ersten Bildschirm (390 × 664,
// kleiner Viewport im Safari mit Leisten) – links die gebaute dunkle Plakat-Fassung (H1 im kalten Himmel),
// rechts eine SKIZZE per eingespritztem CSS (H1 auf Papier mit Rot/Blau-Klammer, kürzeres, angeschnittenes Wärmebild).
// Die Skizze ist nicht gebaut und dient nur der Entscheidung am Freigabepunkt (OFFENE FRAGE 2).
// Aufruf: node pruef/bildpaar.mjs → pruef/belege/bildpaar-e019-m390.webp
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const hier = path.dirname(fileURLToPath(import.meta.url));
const werkzeuge = path.resolve(hier, '../../../../werkzeuge');
const require = createRequire(path.join(werkzeuge, 'package.json'));
const sharp = require('sharp');
const { launch, newContext } = await import(path.join(werkzeuge, 'lib/browser.mjs'));
const SKIZZE = `
@media (max-width:37.49em){
  :root{--oben:calc(-300 * var(--s)); --lage-b:clamp(88vw, calc((100svh - 22rem - var(--m-messwerte) - 9rem) * 800 / 490), 120vw)}
  .held{grid-template-areas:"kopf" "bild" "rest"}
  .held__kopf{grid-area:kopf;color:var(--titel);background:var(--grund);padding-bottom:var(--a-4)}
  .ortsmarke{color:var(--text)}
  .wb-marke__text{display:none !important}
  .held__titel .t2{position:relative;padding-left:var(--a-5)}
  .held__titel .t2::before,.held__titel .t2::after{content:"";position:absolute;left:var(--a-1);width:var(--a-2);height:calc(50% - var(--a-1));border:var(--strich) solid;border-right:0}
  .held__titel .t2::before{top:var(--a-1);border-color:var(--vorlauf);border-bottom:0}
  .held__titel .t2::after{bottom:var(--a-1);border-color:var(--ruecklauf);border-top:0}
}`;
const browser = await launch();
const bilder = [];
for (const skizze of [false, true]) {
  const { context } = await newContext(browser, { origin: 'http://localhost:3803', viewport: { name: 'm390', width: 390, height: 664, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('http://localhost:3803/', { waitUntil: 'load' });
  if (skizze) await page.addStyleTag({ content: SKIZZE });
  await page.waitForTimeout(600);
  bilder.push(await page.screenshot());
  await context.close();
}
await browser.close();
const [a, b] = await Promise.all(bilder.map((x) => sharp(x).resize({ width: 600 }).toBuffer()));
const m = await sharp(a).metadata();
const titel = (t, x) => ({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="56"><rect width="600" height="56" fill="#111A3B"/><text x="16" y="36" font-family="sans-serif" font-size="22" fill="#FBF7F0">${t}</text></svg>`), left: x, top: 0 });
await sharp({ create: { width: 1224, height: m.height + 56, channels: 3, background: '#888888' } })
  .composite([titel('Gebaut: dunkle Plakat-Fassung', 0), titel('Skizze (nicht gebaut): H1 auf Papier', 624), { input: a, left: 0, top: 56 }, { input: b, left: 624, top: 56 }])
  .webp({ quality: 82 }).toFile(path.join(hier, 'belege/bildpaar-e019-m390.webp'));
console.log('bildpaar-e019-m390.webp');
