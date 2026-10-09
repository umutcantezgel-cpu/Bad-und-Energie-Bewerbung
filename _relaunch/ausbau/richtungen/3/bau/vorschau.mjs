// Vorschau der Szene (Endbild und Blaupause) als PNG, nur zum Gestalten.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { vorschauSvg } from './svg.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(hier, '../../../../werkzeuge/package.json'));
const sharp = require('sharp');
const { baender } = JSON.parse(await fs.readFile(path.join(hier, 'baender.json'), 'utf8'));
const out = process.argv[2] ?? '/tmp';
const warm = await sharp(Buffer.from(vorschauSvg(baender))).png().toBuffer();
const kalt = await sharp(Buffer.from(vorschauSvg(baender, { kalt: true }))).png().toBuffer();
await sharp({ create: { width: 1624, height: 800, channels: 3, background: '#888' } })
  .composite([{ input: kalt, left: 0, top: 0 }, { input: warm, left: 824, top: 0 }])
  .png().toFile(path.join(out, 'vorschau.png'));
console.log(path.join(out, 'vorschau.png'));
