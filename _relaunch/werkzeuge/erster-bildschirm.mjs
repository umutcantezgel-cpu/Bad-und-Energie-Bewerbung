// Bildfolge des ersten Bildschirms (Lauf 2, Wow-Probe und A-03): Erstbesuch ohne gespeicherten Zustand,
// Bilder bei 0, 250, 500, 750, 1000, 1250 und 1500 ms nach Navigationsbeginn, dazu ein Streifen mit allen Bildern.
// Aufnahme über CDP-Screencast (Zeitstempel je Bild), damit Schriftladen und Auftritte nicht abgewartet werden.
// Aufruf: node erster-bildschirm.mjs --url http://localhost:3500/ --out _relaunch/ausbau/belege/a0-wow/start
//         [--vps m390,d1440] [--schemes light] [--motion no-preference|reduce] [--userAgent alt]
// Ausgabe: <out>/<ansicht>-<schema>-<bewegung>__t0000.webp … __t1500.webp, …__streifen.webp, bericht.json
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { VIEWPORTS, collectErrors, launch, newContext } from './lib/browser.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
if (!args.url || !args.out) {
  console.error('Aufruf: node erster-bildschirm.mjs --url <url> --out <ordner> [--vps m390,d1440] [--schemes light,dark] [--motion no-preference|reduce]');
  process.exit(1);
}
const url = new URL(args.url);
const out = path.resolve(args.out);
const vps = VIEWPORTS.filter((v) => (args.vps ?? 'm390,d1440').split(',').includes(v.name));
const schemes = (args.schemes ?? 'light').split(',');
const motion = args.motion ?? 'no-preference';
// Nur für den Altstand (E-006): dessen middleware.ts weist HeadlessChrome ab.
const userAgent = args.userAgent === 'alt' ? 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' : undefined;
const ZEITEN = [0, 250, 500, 750, 1000, 1250, 1500];
await fs.mkdir(out, { recursive: true });

const browser = await launch();
const bericht = { url: url.href, motion, erstellt: new Date().toISOString(), zeiten_ms: ZEITEN, aufnahmen: [] };
for (const vp of vps) {
  for (const scheme of schemes) {
    const { context, requestLog } = await newContext(browser, { origin: url.origin, viewport: vp, colorScheme: scheme, reducedMotion: motion, userAgent });
    const page = await context.newPage();
    const errors = collectErrors(page);
    const cdp = await context.newCDPSession(page);
    const frames = [];
    cdp.on('Page.screencastFrame', async (f) => {
      frames.push({ t: f.metadata.timestamp * 1000, data: f.data });
      try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {}
    });
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: vp.width * vp.deviceScaleFactor, maxHeight: vp.height * vp.deviceScaleFactor });
    const t0 = Date.now();
    await page.goto(url.href, { waitUntil: 'commit' });
    await page.waitForTimeout(1900);
    await cdp.send('Page.stopScreencast');
    await page.waitForTimeout(100);
    const base = `${vp.name}-${scheme}-${motion === 'reduce' ? 'reduziert' : 'voll'}`;
    const files = [];
    const tiles = [];
    for (const ms of ZEITEN) {
      // letztes Bild, das zum Zeitpunkt t0 + ms schon gezeigt wurde (Screencast liefert nur bei Änderung)
      const due = frames.filter((f) => f.t <= t0 + ms);
      const pick = due.length ? due[due.length - 1] : null;
      const file = path.join(out, `${base}__t${String(ms).padStart(4, '0')}.webp`);
      const buf = pick
        ? await sharp(Buffer.from(pick.data, 'base64')).resize({ width: Math.min(vp.width * Math.min(vp.deviceScaleFactor, 2), 1440) }).webp({ quality: 72, effort: 5 }).toBuffer()
        : await sharp({ create: { width: vp.width, height: vp.height, channels: 3, background: '#ffffff' } }).webp().toBuffer();
      await fs.writeFile(file, buf);
      files.push({ ms, datei: path.basename(file), bild_ab_ms: pick ? Math.round(pick.t - t0) : null });
      tiles.push(buf);
    }
    // Streifen: alle Bilder nebeneinander, gleiche Höhe
    const metas = await Promise.all(tiles.map((b) => sharp(b).metadata()));
    const h = Math.min(...metas.map((m) => m.height));
    const scaled = await Promise.all(tiles.map((b) => sharp(b).resize({ height: h }).toBuffer({ resolveWithObject: true })));
    const gap = 12;
    const W = scaled.reduce((s, x) => s + x.info.width, 0) + gap * (scaled.length - 1);
    let x = 0;
    const comp = scaled.map((s) => { const c = { input: s.data, left: x, top: 0 }; x += s.info.width + gap; return c; });
    const streifen = path.join(out, `${base}__streifen.webp`);
    const roh = await sharp({ create: { width: W, height: h, channels: 3, background: '#888888' } }).composite(comp).png().toBuffer();
    await sharp(roh).resize({ width: Math.min(W, 2400) }).webp({ quality: 70, effort: 5 }).toFile(streifen);
    bericht.aufnahmen.push({ ansicht: vp.name, schema: scheme, bewegung: motion, bilder: files, streifen: path.basename(streifen), screencast_bilder: frames.length, fehler: errors, gesperrt: requestLog });
    console.log(`${base}: ${frames.length} Screencast-Bilder, ${errors.length} Fehler`);
    await context.close();
  }
}
await browser.close();
await fs.writeFile(path.join(out, 'bericht.json'), JSON.stringify(bericht, null, 2));
