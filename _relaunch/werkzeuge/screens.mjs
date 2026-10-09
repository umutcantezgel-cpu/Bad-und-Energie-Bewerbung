// Bildschirmfoto-Läufer (Ebene 3): jede Seite × Ansicht × Farbschema, nach schrittweisem Durchscrollen.
// Roh-PNG (ganze Seite) → _relaunch/.roh/<label>/…  (lokal, nicht versioniert)
// WebP-Ausschnitte in Bildschirmhöhe (≤ 1440 px breit) → _relaunch/belege/<label>/…  (versioniert)
// Bericht mit Überlauf, Konsolenfehlern und gesperrten Anfragen → _relaunch/belege/<label>/bericht.json
//
// Aufruf: node screens.mjs --base http://localhost:3500 --label p0-ausgangsstand [--set grundmenge|alt]
//         [--schemes light,dark] [--vps m375,t768,d1440,d1920] [--motion reduce|no-preference] [--only start,stellen]
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ALTSEITEN, GRUNDMENGE, VIEWPORTS, collectErrors, launch, newContext, overflowReport, scrollThrough } from './lib/browser.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]]] : acc), []));
const base = args.base ?? 'http://localhost:3500';
const label = args.label ?? 'lauf';
const set = args.set === 'alt' ? ALTSEITEN : GRUNDMENGE;
const schemes = (args.schemes ?? 'light,dark').split(',');
const vps = VIEWPORTS.filter((v) => (args.vps ?? 'm375,t768,d1440,d1920').split(',').includes(v.name));
const motion = args.motion ?? 'reduce';
const only = args.only ? args.only.split(',') : null;
const maxSlices = Number(args.slices ?? 14);
// Versionierte Belege (E-003): Hauptseiten immer; übrige Seiten nur m375/d1440 hell. Rest bleibt in .roh.
const belegePolicy = args.belege ?? 'haupt';
const versioniert = (p, vp, scheme) => belegePolicy === 'alle' || (belegePolicy === 'haupt' && (p.haupt || ((vp.name === 'm375' || vp.name === 'd1440') && scheme === 'light')));
// Nur für den Altstand (ENTSCHEIDUNGEN E-006): dessen middleware.ts weist HeadlessChrome mit 403 ab.
const userAgent = args.set === 'alt' ? 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' : undefined;

const rawDir = path.join(ROOT, '.roh', label);
const outDir = path.join(ROOT, 'belege', label);
const rawWebpDir = path.join(rawDir, 'webp');
await fs.mkdir(rawWebpDir, { recursive: true });
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(outDir, { recursive: true });

const browser = await launch();
const report = { label, base, motion, erstellt: new Date().toISOString(), seiten: [] };

for (const p of set) {
  if (only && !only.includes(p.slug)) continue;
  for (const vp of vps) {
    for (const scheme of schemes) {
      const { context, requestLog } = await newContext(browser, { origin: base, viewport: vp, colorScheme: scheme, reducedMotion: motion, userAgent });
      const page = await context.newPage();
      const errors = collectErrors(page);
      const t0 = Date.now();
      let status = 0;
      try {
        const res = await page.goto(base + p.path, { waitUntil: 'networkidle', timeout: 45_000 });
        status = res?.status() ?? 0;
        await page.evaluate(() => document.fonts?.ready);
        await scrollThrough(page);
        await page.waitForTimeout(motion === 'reduce' ? 150 : 1300);
        const overflow = await overflowReport(page);
        const name = `${p.slug}__${vp.name}-${scheme}`;
        const rawFile = path.join(rawDir, `${name}.png`);
        await page.screenshot({ path: rawFile, fullPage: true });
        // Bildschirmhöhen-Ausschnitte als WebP
        const img = sharp(rawFile);
        const meta = await img.metadata();
        const sliceH = Math.round(vp.height * vp.deviceScaleFactor);
        const n = Math.min(maxSlices, Math.ceil(meta.height / sliceH));
        const targetW = Math.min(1440, meta.width);
        const slices = [];
        for (let i = 0; i < n; i++) {
          const top = i * sliceH;
          const h = Math.min(sliceH, meta.height - top);
          if (h < 40) break;
          const file = path.join(versioniert(p, vp, scheme) ? outDir : rawWebpDir, `${name}__${String(i + 1).padStart(2, '0')}.webp`);
          await sharp(rawFile).extract({ left: 0, top, width: meta.width, height: h }).resize({ width: targetW }).webp({ quality: 66, effort: 6, smartSubsample: true }).toFile(file);
          slices.push(path.relative(ROOT, file));
        }
        report.seiten.push({ pfad: p.path, slug: p.slug, ansicht: vp.name, schema: scheme, status, ms: Date.now() - t0, seitenhoehe: Math.round(meta.height / vp.deviceScaleFactor), ueberlauf: overflow, fehler: errors, gesperrt: requestLog, ausschnitte: slices });
        process.stdout.write(`${status} ${name} ${slices.length} Ausschnitte${overflow.horizontal ? ' ÜBERLAUF' : ''}${errors.length ? ` ${errors.length} Fehler` : ''}\n`);
      } catch (err) {
        report.seiten.push({ pfad: p.path, slug: p.slug, ansicht: vp.name, schema: scheme, status, fehler: [...errors, { kind: 'lauf', text: String(err) }] });
        process.stdout.write(`FEHLER ${p.slug} ${vp.name}-${scheme}: ${err}\n`);
      }
      await context.close();
    }
  }
}
await browser.close();
await fs.writeFile(path.join(outDir, 'bericht.json'), JSON.stringify(report, null, 2));
const ueber = report.seiten.filter((s) => s.ueberlauf?.horizontal).length;
const fehler = report.seiten.reduce((n, s) => n + (s.fehler?.length ?? 0), 0);
console.log(`\nFERTIG ${report.seiten.length} Aufnahmen · Überlauf ${ueber} · Fehler ${fehler} → ${path.relative(ROOT, outDir)}`);
