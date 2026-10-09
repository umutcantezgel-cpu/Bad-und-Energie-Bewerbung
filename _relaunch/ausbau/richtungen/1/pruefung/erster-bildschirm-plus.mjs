// Ergänzung zu _relaunch/werkzeuge/erster-bildschirm.mjs (gleiches Aufnahmeverfahren: CDP-Screencast, Bilder bei 0 … 1500 ms),
// aber mit frei wählbaren Ansichten (sichtbare Browserfläche statt Gerätebildschirm) und optionaler CPU-Drosselung.
// Zusätzlich: Lage von Hauptaktion und Mikrotext im Endzustand, letzte Bildänderung ab Aufruf und ab erstem Bild.
// Aufruf: node erster-bildschirm-plus.mjs --url http://localhost:3801/ --out <ordner>
//         [--vps i13=390x664:m,px7=393x659:m,pm14=430x740:m,se=375x553:m] [--schemes light] [--motion no-preference|reduce] [--cpu 4]
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const WERKZEUGE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../../werkzeuge');
const { collectErrors, launch, newContext } = await import(path.join(WERKZEUGE, 'lib/browser.mjs'));
const sharp = createRequire(path.join(WERKZEUGE, 'package.json'))('sharp');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
const url = new URL(args.url);
const out = path.resolve(args.out);
const vps = (args.vps ?? 'i13=390x664:m,px7=393x659:m,pm14=430x740:m,se=375x553:m').split(',').map((s) => {
  const [name, dim] = s.split('='); const [wh, k] = dim.split(':'); const [width, height] = wh.split('x').map(Number);
  const m = k === 'm';
  return { name, width, height, isMobile: m, hasTouch: m, deviceScaleFactor: m ? 2 : 1 };
});
const schemes = (args.schemes ?? 'light').split(',');
const motion = args.motion ?? 'no-preference';
const cpu = Number(args.cpu ?? 1);
const ZEITEN = [0, 250, 500, 750, 1000, 1250, 1500];
await fs.mkdir(out, { recursive: true });
const browser = await launch();
const bericht = { url: url.href, motion, cpu_drosselung: cpu, erstellt: new Date().toISOString(), zeiten_ms: ZEITEN, aufnahmen: [] };
for (const vp of vps) {
  for (const scheme of schemes) {
    const { context, requestLog } = await newContext(browser, { origin: url.origin, viewport: vp, colorScheme: scheme, reducedMotion: motion });
    const page = await context.newPage();
    const errors = collectErrors(page);
    const cdp = await context.newCDPSession(page);
    if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    const frames = [];
    cdp.on('Page.screencastFrame', async (f) => {
      frames.push({ t: f.metadata.timestamp * 1000, data: f.data });
      try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {}
    });
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: vp.width * vp.deviceScaleFactor, maxHeight: vp.height * vp.deviceScaleFactor });
    const t0 = Date.now();
    await page.goto(url.href, { waitUntil: 'commit' });
    await page.waitForTimeout(2600);
    await cdp.send('Page.stopScreencast');
    const lage = await page.evaluate(() => {
      const r = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; };
      return { hoehe: innerHeight, aktion: r('.boden .aktion'), mikro: r('.boden .mikro'), h1: r('.titel-haupt') };
    });
    const base = `${vp.name}-${vp.width}x${vp.height}-${scheme}-${motion === 'reduce' ? 'reduziert' : 'voll'}${cpu > 1 ? `-cpu${cpu}` : ''}`;
    const tiles = []; const bilder = [];
    for (const ms of ZEITEN) {
      const due = frames.filter((f) => f.t <= t0 + ms);
      const pick = due.length ? due[due.length - 1] : null;
      const buf = pick ? await sharp(Buffer.from(pick.data, 'base64')).resize({ width: vp.width * 2 }).webp({ quality: 72 }).toBuffer()
        : await sharp({ create: { width: vp.width, height: vp.height, channels: 3, background: '#ffffff' } }).webp().toBuffer();
      tiles.push(buf); bilder.push({ ms, bild_ab_ms: pick ? Math.round(pick.t - t0) : null });
    }
    const metas = await Promise.all(tiles.map((b) => sharp(b).metadata()));
    const h = Math.min(...metas.map((m) => m.height));
    const scaled = await Promise.all(tiles.map((b) => sharp(b).resize({ height: h }).toBuffer({ resolveWithObject: true })));
    const gap = 12; const W = scaled.reduce((s, x) => s + x.info.width, 0) + gap * (scaled.length - 1);
    let x = 0; const comp = scaled.map((s) => { const c = { input: s.data, left: x, top: 0 }; x += s.info.width + gap; return c; });
    const roh = await sharp({ create: { width: W, height: h, channels: 3, background: '#888888' } }).composite(comp).png().toBuffer();
    await sharp(roh).resize({ width: Math.min(W, 2400) }).webp({ quality: 70 }).toFile(path.join(out, `${base}__streifen.webp`));
    if (frames.length) await sharp(Buffer.from(frames[frames.length - 1].data, 'base64')).webp({ quality: 75 }).toFile(path.join(out, `${base}__ende.webp`));
    // erstes Bild = erstes nicht einfarbiges Bild; letzte Bildänderung = letztes Bild, das sich sichtbar vom vorigen unterscheidet
    const klein = await Promise.all(frames.map((f) => sharp(Buffer.from(f.data, 'base64')).resize({ width: 160 }).removeAlpha().raw().toBuffer()));
    const iErst = klein.findIndex((b) => { let mn = 255, mx = 0; for (const v of b) { if (v < mn) mn = v; if (v > mx) mx = v; } return mx - mn > 40; });
    let iLetzt = iErst;
    for (let i = Math.max(iErst, 0) + 1; i < klein.length; i++) {
      const a = klein[i - 1], b = klein[i]; if (a.length !== b.length) { iLetzt = i; continue; }
      let n = 0; for (let k = 0; k < a.length; k++) if (Math.abs(a[k] - b[k]) > 8) n++;
      if (n > 2) iLetzt = i;
    }
    const erstes = iErst >= 0 ? Math.round(frames[iErst].t - t0) : null;
    const letztes = iLetzt >= 0 ? Math.round(frames[iLetzt].t - t0) : null;
    const sichtbar = lage.aktion[1] <= lage.hoehe && lage.mikro[1] <= lage.hoehe;
    bericht.aufnahmen.push({ ansicht: `${vp.name} ${vp.width}×${vp.height}`, schema: scheme, bewegung: motion, erstes_bild_ms: erstes, letzte_bildaenderung_ms: letztes, auftakt_ab_erstem_bild_ms: erstes == null ? null : letztes - erstes, lage, hauptaktion_und_mikrotext_sichtbar: sichtbar, bilder, screencast_bilder: frames.length, fehler: errors, fremdanfragen: requestLog.filter((r) => r.kind !== 'attrappe') });
    console.log(`${base}: erstes Bild ${erstes} ms, letzte Änderung ${letztes} ms, Aktion ${lage.aktion.join('–')} Mikro –${lage.mikro[1]} / ${lage.hoehe} ${sichtbar ? 'SICHTBAR' : 'UNTER FALZ'}`);
    await context.close();
  }
}
await browser.close();
await fs.writeFile(path.join(out, `bericht${cpu > 1 ? `-cpu${cpu}` : ''}${motion === 'reduce' ? '-reduziert' : ''}.json`), JSON.stringify(bericht, null, 2));
