// Setzt die erzeugten Teile in index.html ein (zwischen <!--@name--> und <!--/@name-->).
// Aufruf: node bau/feld.mjs && node bau/einsetzen.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { baenderSvg, linienSvg, rohreSvg } from './svg.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const datei = path.resolve(hier, '../index.html');
const { baender } = JSON.parse(await fs.readFile(path.join(hier, 'baender.json'), 'utf8'));

let html = await fs.readFile(datei, 'utf8');
const setze = (name, inhalt) => {
  const re = new RegExp(`<!--@${name}-->[\\s\\S]*?<!--/@${name}-->`);
  if (!re.test(html)) throw new Error(`Marke ${name} fehlt`);
  html = html.replace(re, `<!--@${name}-->\n${inhalt}\n<!--/@${name}-->`);
};
setze('baender', baenderSvg(baender));
setze('linien', linienSvg());
setze('rohre', rohreSvg());
await fs.writeFile(datei, html);
console.log('eingesetzt:', (Buffer.byteLength(html) / 1024).toFixed(1), 'KB');
