// Austauschprobe der Display-Schrift: dieselbe Einstiegszeile in sechs Kandidaten aus dem Schriftpool,
// im Kontext der Variante (Creme auf dem kalten Navy des Wärmebilds und Navy auf Papier).
// Aufruf: node pruef/schriftprobe.mjs → pruef/belege/schriftprobe.webp
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const hier = path.dirname(fileURLToPath(import.meta.url));
const werkzeuge = path.resolve(hier, '../../../../werkzeuge');
const pool = path.resolve(hier, '../../../../richtungen/schriftpool/node_modules/@fontsource-variable');
const require = createRequire(path.join(werkzeuge, 'package.json'));
const sharp = require('sharp');
const { launch } = await import(path.join(werkzeuge, 'lib/browser.mjs'));
const kandidaten = [
  ['Bricolage Grotesque (gewählt)', 'bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2', 800, ''],
  ['Big Shoulders Display', 'big-shoulders-display/files/big-shoulders-display-latin-wght-normal.woff2', 800, ''],
  ['Archivo (68 % Breite, wie A)', 'archivo/files/archivo-latin-wdth-normal.woff2', 800, 'font-stretch:68%;'],
  ['Familjen Grotesk', 'familjen-grotesk/files/familjen-grotesk-latin-wght-normal.woff2', 700, ''],
  ['Gabarito', 'gabarito/files/gabarito-latin-wght-normal.woff2', 800, ''],
  ['Schibsted Grotesk', 'schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2', 800, ''],
];
let css = '', zeilen = '';
for (const [name, datei, gewicht, extra] of kandidaten) {
  const b64 = (await fs.readFile(path.join(pool, datei))).toString('base64');
  const fam = name.split(' (')[0];
  css += `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${b64}) format("woff2");font-weight:100 900;font-stretch:50% 125%}`;
  zeilen += `<div class="z"><p class="n">${name}</p><div class="b"><span class="h" style="font-family:'${fam}';font-weight:${gewicht};${extra}">SHK-Jobs<br>in Wetzlar.</span><span class="w" style="font-family:'${fam}';font-weight:${gewicht};${extra}">13:30</span></div><div class="p"><span class="h2" style="font-family:'${fam}';font-weight:${gewicht};${extra}">SHK-Jobs in Wetzlar.</span></div></div>`;
}
const html = `<!doctype html><html lang="de"><meta charset="utf-8"><style>${css}
body{margin:0;background:#FBF7F0;font-family:sans-serif;width:1440px}
.z{display:grid;grid-template-columns:260px 1fr 1fr;align-items:stretch;border-bottom:1px solid #DDD3C2}
.n{margin:0;padding:24px;font:600 16px/1.3 sans-serif;color:#111A3B}
.b{background:#111D6D;color:#FBF7F0;padding:20px 28px;display:flex;align-items:center;justify-content:space-between}
.h{font-size:58px;line-height:.92;letter-spacing:-.02em}.w{font-size:44px;letter-spacing:-.01em}
.p{padding:20px 28px;display:flex;align-items:center;color:#111D6D}.h2{font-size:46px;letter-spacing:-.02em;white-space:nowrap}
</style><body>${zeilen}</body></html>`;
const b = await launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(300);
const png = await p.screenshot({ fullPage: true });
await b.close();
await fs.mkdir(path.join(hier, 'belege'), { recursive: true });
await sharp(png).webp({ quality: 80 }).toFile(path.join(hier, 'belege/schriftprobe.webp'));
console.log('pruef/belege/schriftprobe.webp');
