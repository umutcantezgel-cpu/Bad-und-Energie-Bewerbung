// Stellt je Hauptseite das Jury-Material zusammen (Auftrag Abschnitt 13, Jury-Rubrik):
// höchstens 30 Bildschirmhöhen-Ausschnitte aus allen Ansichten, hell und dunkel – nie Erklärungen.
// Aufruf: node jury-material.mjs --label p0-ausgangsstand [--out p0-jury]
// Ausgabe: _relaunch/belege/<out>/<slug>.txt (eine absolute Bildpfad-Zeile je Ausschnitt)
import fs from 'node:fs/promises';
import path from 'node:path';
import { GRUNDMENGE } from './lib/browser.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
const label = args.label ?? 'p0-ausgangsstand';
const out = args.out ?? 'p0-jury';
const dir = path.join(ROOT, 'belege', label);
const outDir = path.join(ROOT, 'belege', out);
await fs.mkdir(outDir, { recursive: true });

// Verteilung: zusammen 30
const QUOTE = [
  ['m375-light', 8],
  ['t768-light', 4],
  ['d1440-light', 8],
  ['d1920-light', 4],
  ['m375-dark', 3],
  ['d1440-dark', 3],
];

const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.webp')).sort();
for (const p of GRUNDMENGE.filter((g) => g.haupt)) {
  const picked = [];
  for (const [key, n] of QUOTE) {
    const mine = files.filter((f) => f.startsWith(`${p.slug}__${key}__`));
    // gleichmäßig über die Seite verteilen statt nur die ersten n
    const step = mine.length <= n ? 1 : mine.length / n;
    for (let i = 0; i < Math.min(n, mine.length); i++) picked.push(path.join(dir, mine[Math.floor(i * step)]));
  }
  await fs.writeFile(path.join(outDir, `${p.slug}.txt`), picked.join('\n') + '\n');
  console.log(`${p.slug}: ${picked.length} Ausschnitte`);
}
