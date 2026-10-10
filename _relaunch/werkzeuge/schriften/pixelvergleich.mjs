// Pixelvergleich zweier Bildschirmfotos gleicher Größe (R3-PERF-01): zählt abweichende Pixel mit pixelmatch
// (Schwelle 0,1, Kantenglättung ausgenommen und eingeschlossen) und schreibt optional ein Differenzbild.
// Aufruf: node _relaunch/werkzeuge/schriften/pixelvergleich.mjs <a.png> <b.png> [--diff <diff.png>]
import fs from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [aPfad, bPfad] = process.argv.slice(2).filter((x) => !x.startsWith('--'));
const diffPfad = process.argv.includes('--diff') ? process.argv[process.argv.indexOf('--diff') + 1] : null;
const a = PNG.sync.read(fs.readFileSync(aPfad));
const b = PNG.sync.read(fs.readFileSync(bPfad));
if (a.width !== b.width || a.height !== b.height) {
  console.log(JSON.stringify({ a: aPfad, b: bPfad, groesseGleich: false, a_wh: [a.width, a.height], b_wh: [b.width, b.height] }));
  process.exit(0);
}
const diff = new PNG({ width: a.width, height: a.height });
const ohneAA = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1, includeAA: false });
const mitAA = pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0.1, includeAA: true });
let roh = 0;
for (let i = 0; i < a.data.length; i += 4) if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) roh++;
if (diffPfad) fs.writeFileSync(diffPfad, PNG.sync.write(diff));
const n = a.width * a.height;
console.log(JSON.stringify({ a: aPfad.split('/').pop(), groesse: [a.width, a.height], pixel: n, ungleichRoh: roh, ungleichOhneKantenglaettung: ohneAA, ungleichMitKantenglaettung: mitAA, anteilRohPromille: Math.round((roh / n) * 1e6) / 1e3 }));
