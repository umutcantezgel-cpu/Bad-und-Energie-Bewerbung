// Belege für den WebGL-Moment (Paket A2-RICHT-3, „Zusätzliche Belege“):
//  1 JS-Größen (gzip) · 2 Kontextverlust (WEBGL_lose_context) → Ersatz · 3 Pause außerhalb des Bildes und bei verborgenem Tab
//  4 Framezeiten mobil mit 4× CPU-Drosselung (Auftakt und Zeigen) · 5 Kontext-Freigabe und JS-Heap über 10 Zyklen
//  6 Kontrast der Schrift über der Szene (mobil, jeder Zeitpunkt des Auftakts und jede Zone verstärkt)
// Aufruf: node pruef/webgl.mjs [--url http://localhost:3803/]   → pruef/belege/webgl.json und Bilder
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const ordner = path.resolve(hier, '..');
const werkzeuge = path.resolve(ordner, '../../../werkzeuge');
const require = createRequire(path.join(werkzeuge, 'package.json'));
const sharp = require('sharp');
const { VIEWPORTS, launch, newContext, collectErrors } = await import(path.join(werkzeuge, 'lib/browser.mjs'));
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
const url = args.url ?? 'http://localhost:3803/';
const belege = path.join(hier, 'belege');
await fs.mkdir(belege, { recursive: true });
const m390 = VIEWPORTS.find((v) => v.name === 'm390');
const d1440 = VIEWPORTS.find((v) => v.name === 'd1440');
const ergebnis = { url, erstellt: new Date().toISOString(), umgebung: 'Chromium headless (Playwright 1.56, Chromium 141), WebGL über SwiftShader (Software), lokal ohne Netzdrosselung' };

// 1 Größen
{
  const html = await fs.readFile(path.join(ordner, 'index.html'), 'utf8');
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const modul = await fs.readFile(path.join(ordner, 'js/waermebild.js'));
  const gz = (b) => zlib.gzipSync(b, { level: 9 }).length;
  const feld = await fs.stat(path.join(ordner, 'js/feld.png'));
  const schriften = await fs.readdir(path.join(ordner, 'fonts'));
  let sb = 0; const latin = [];
  for (const f of schriften) { const st = await fs.stat(path.join(ordner, 'fonts', f)); sb += st.size; if (!f.includes('-ext-')) latin.push(st.size); }
  ergebnis.groessen = {
    inline_skripte_roh: inline.reduce((s, x) => s + Buffer.byteLength(x), 0),
    inline_skripte_gzip: inline.reduce((s, x) => s + gz(Buffer.from(x)), 0),
    modul_roh: modul.length,
    modul_gzip: gz(modul),
    js_gesamt_gzip: inline.reduce((s, x) => s + gz(Buffer.from(x)), 0) + gz(modul),
    feld_png: feld.size,
    html_roh: Buffer.byteLength(html),
    html_gzip: gz(Buffer.from(html)),
    schriften_dateien: schriften.length,
    schriften_bytes: sb,
    schriften_geladen_latin_bytes: latin.reduce((a, b) => a + b, 0),
  };
}

const browser = await launch();
async function seite(vp, opts = {}) {
  const { context, requestLog } = await newContext(browser, { origin: new URL(url).origin, viewport: vp, colorScheme: opts.scheme ?? 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const fehler = collectErrors(page);
  return { context, page, fehler, requestLog };
}
const zustand = (page) => page.evaluate(() => ({ klassen: document.documentElement.className, s: { ...window.__waermebild }, canvas: !!document.querySelector('.wb__canvas') }));
const warteAuf = async (page, fn, arg, ms = 4000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn, arg)) return Date.now() - t0; await page.waitForTimeout(20); } return -1; };

// 2 Kontextverlust mitten im Auftakt
{
  const { context, page, fehler } = await seite(m390);
  await page.goto(url, { waitUntil: 'commit' });
  const bisAuftakt = await warteAuf(page, () => window.__waermebild && window.__waermebild.zustand === 'auftakt');
  await page.waitForTimeout(150);
  const vorher = await zustand(page);
  await sharp(await page.screenshot()).resize({ width: 780 }).webp({ quality: 75 }).toFile(path.join(belege, 'kontextverlust-m390-vorher.webp'));
  const t = await page.evaluate(() => new Promise((ok) => {
    const c = document.querySelector('.wb__canvas');
    const gl = c.getContext('webgl');
    let tVerlust = 0;
    c.addEventListener('webglcontextlost', () => { tVerlust = performance.now(); queueMicrotask(() => ok({ ereignis_nach_ms: Math.round(tVerlust - t0), canvas_nach_ereignis_entfernt: !document.querySelector('.wb__canvas'), klassen_nach_ereignis: document.documentElement.className })); });
    const t0 = performance.now();
    gl.getExtension('WEBGL_lose_context').loseContext();
  }));
  await page.waitForTimeout(300);
  await sharp(await page.screenshot()).resize({ width: 780 }).webp({ quality: 75 }).toFile(path.join(belege, 'kontextverlust-m390-nachher.webp'));
  const nachher = await zustand(page);
  // Bänder des Ersatzes sichtbar?
  const baender = await page.evaluate(() => [...document.querySelectorAll('.wb__feld .wb-band')].map((b) => getComputedStyle(b).opacity));
  ergebnis.kontextverlust = { bis_auftakt_ms: bisAuftakt, vorher, sofort: t, nachher, band_deckkraft: baender, fehler };
  await context.close();
}

// 3 Pause außerhalb des Bildes (Scrollen) und bei verborgenem Tab
{
  const { context, page, fehler } = await seite(m390);
  await page.goto(url, { waitUntil: 'commit' });
  await warteAuf(page, () => window.__waermebild && window.__waermebild.zustand === 'auftakt');
  await page.waitForTimeout(120);
  const a0 = (await zustand(page)).s.bilder;
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(150);
  const a1 = (await zustand(page)).s.bilder;
  await page.waitForTimeout(1000);
  const a2 = (await zustand(page)).s.bilder;
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(1600);
  const a3 = await zustand(page);
  ergebnis.pause_ausserhalb = { bilder_beim_wegscrollen: a1 - a0, bilder_in_1000ms_ausserhalb: a2 - a1, nach_rueckkehr: a3, fehler };
  // Verborgener Tab: document.hidden über Eigenschaft simuliert (Headless hat keinen Tab-Wechsel), Ereignis ausgelöst
  await page.reload({ waitUntil: 'commit' });
  await warteAuf(page, () => window.__waermebild && window.__waermebild.zustand === 'auftakt');
  await page.waitForTimeout(120);
  const v0 = (await zustand(page)).s.bilder;
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(80);
  const v1 = (await zustand(page)).s.bilder;
  await page.waitForTimeout(1000);
  const v2 = (await zustand(page)).s.bilder;
  await page.evaluate(() => { delete document.hidden; delete document.visibilityState; Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(1600);
  const v3 = await zustand(page);
  ergebnis.pause_verborgen = { bilder_in_1000ms_verborgen: v2 - v1, nach_rueckkehr: v3 };
  await context.close();
}

// 4 Framezeiten mobil, 4× CPU-Drosselung: Auftakt und Tippen (Zeigen)
async function framezeiten(phase) {
  const { context, page, fehler } = await seite(m390);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.__rafZeiten = [];
    window.__loaf = [];
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ start: Math.round(e.startTime), dauer: Math.round(e.duration), blockiert: Math.round(e.blockingDuration || 0) }); }).observe({ type: 'long-animation-frame', buffered: true }); } catch (e) {}
    const f = (t) => { window.__rafZeiten.push(t); requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
  await page.goto(url, { waitUntil: 'commit' });
  let von, bis;
  if (phase === 'auftakt') {
    await warteAuf(page, () => window.__waermebild && window.__waermebild.zustand === 'auftakt', null, 8000);
    von = await page.evaluate(() => performance.now());
    await warteAuf(page, () => window.__waermebild && window.__waermebild.zustand !== 'auftakt', null, 8000);
    bis = await page.evaluate(() => performance.now());
  } else {
    await page.waitForTimeout(6000);
    const box = await page.locator('.wb-marke[data-zone="1"]').boundingBox();
    von = await page.evaluate(() => performance.now());
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(2600);
    bis = await page.evaluate(() => performance.now());
  }
  const { z, loaf, s } = await page.evaluate(({ von, bis }) => ({ z: window.__rafZeiten.filter((t) => t >= von && t <= bis), loaf: window.__loaf.filter((e) => e.start >= von - 50 && e.start <= bis), s: window.__waermebild }), { von, bis });
  const iv = z.slice(1).map((t, i) => t - z[i]);
  const budget = 1000 / 60;
  const verworfen = iv.reduce((a, d) => a + Math.max(0, Math.round(d / budget) - 1), 0);
  const erwartet = Math.round((z[z.length - 1] - z[0]) / budget);
  const sortiert = [...iv].sort((a, b) => a - b);
  await context.close();
  return { phase, dauer_ms: Math.round(bis - von), bilder: z.length, erwartet, verworfen, anteil_verworfen_prozent: +(100 * verworfen / Math.max(1, erwartet)).toFixed(2), median_ms: +(sortiert[Math.floor(sortiert.length / 2)] || 0).toFixed(2), p95_ms: +(sortiert[Math.floor(sortiert.length * 0.95)] || 0).toFixed(2), max_ms: +(sortiert[sortiert.length - 1] || 0).toFixed(2), long_animation_frames: loaf, zeichnungen: s.bilder, fehler };
}
// je Phase fünf Läufe (SwiftShader streut), Median und Höchstwert des Anteils verworfener Bilder
ergebnis.framezeiten_4x = [];
for (const phase of ['auftakt', 'zeigen']) {
  const laeufe = [];
  for (let i = 0; i < 5; i++) laeufe.push(await framezeiten(phase));
  const anteile = laeufe.map((l) => l.anteil_verworfen_prozent).sort((a, b) => a - b);
  ergebnis.framezeiten_4x.push({ phase, laeufe, anteil_median_prozent: anteile[2], anteil_max_prozent: anteile[4], verworfen_summe: laeufe.reduce((a, l) => a + l.verworfen, 0), erwartet_summe: laeufe.reduce((a, l) => a + l.erwartet, 0) });
}

// 5 Freigabe und Heap über 10 Zeigen-Zyklen (je: Kontext erzeugen, zeigen, zurück an SVG, Kontext frei)
{
  const { context, page } = await seite(m390);
  const cdp = await context.newCDPSession(page);
  await page.goto(url);
  await page.waitForTimeout(3000); // Auftakt fertig
  const heap = async () => { await cdp.send('HeapProfiler.collectGarbage'); await page.waitForTimeout(100); await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
  // Zyklus: Zone zeigen (Kontext entsteht bei Bedarf), Bild verlassen (Rückgabe an das SVG, Kontext frei), zurück
  let welche = 1;
  const zyklus = async () => {
    welche = welche === 1 ? 2 : 1; // abwechselnd Flamme und Tropfen: jede Wahl verstärkt eine Zone (Knopf im Bild)
    const box = await page.locator(`.wb-marke[data-zone="${welche}"]`).boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(300);
  };
  await zyklus(); // Aufwärmen
  const h0 = await heap();
  const s0 = await zustand(page);
  for (let i = 0; i < 10; i++) await zyklus();
  const h1 = await heap();
  const s1 = await zustand(page);
  ergebnis.freigabe_heap = { heap_nach_aufwaermen: h0, heap_nach_10_zyklen: h1, zuwachs_prozent: +(100 * (h1 - h0) / h0).toFixed(2), status_vorher: s0, status_nachher: s1, canvas_nach_ruhe: s1.canvas };
  await context.close();
}

// 6 Kontrast: Schrift im Bild (mobil) über jedem Bildpunkt der Szene, Auftakt 0–1500 ms und jede Zone verstärkt
{
  const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const kontrast = (a, b) => { const [h, d] = a > b ? [a, b] : [b, a]; return (h + 0.05) / (d + 0.05); };
  const creme = lum(0xFB, 0xF7, 0xF0);
  const proben = [];
  for (const vp of [m390, VIEWPORTS.find((v) => v.name === 'm375'), VIEWPORTS.find((v) => v.name === 'm430'), { name: 'm320', width: 320, height: 568, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, VIEWPORTS.find((v) => v.name === 't768')]) {
    const { context, page } = await seite(vp);
    await page.addInitScript(() => { const st = document.createElement('style'); st.textContent = '.held__kopf,.held__kopf *{color:transparent !important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st)); });
    const t0 = Date.now();
    await page.goto(url, { waitUntil: 'commit' });
    const zeitpunkte = [250, 500, 750, 1000, 1250, 1500, 2500];
    const aufnahmen = [];
    for (const t of zeitpunkte) { const w = t - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); aufnahmen.push({ t, bild: await page.screenshot() }); }
    // Zonen verstärken (Tippen), Höchstwert der Verstärkung abwarten
    for (const k of [0, 1, 2]) {
      const box = await page.locator(`.wb-marke[data-zone="${k}"]`).boundingBox();
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(650);
      aufnahmen.push({ t: `zone-${k}`, bild: await page.screenshot() });
      await page.waitForTimeout(2200);
    }
    // Glyphenbereiche über Range (nicht die Blockbreite der Zeile)
    const rects = await page.evaluate(() => [...document.querySelectorAll('.held__kopf .ortsmarke, .held__titel .t1 > span, .held__titel .t2 > span')].flatMap((e) => { const r = document.createRange(); r.selectNodeContents(e); return [...r.getClientRects()].map((q) => ({ text: e.textContent.trim(), x: q.x, y: q.y, b: q.width, h: q.height })); }));
    const dpr = Math.min(vp.deviceScaleFactor, 3);
    let minimum = 99, wo = null;
    for (const a of aufnahmen) {
      const { data, info } = await sharp(a.bild).raw().toBuffer({ resolveWithObject: true });
      for (const r of rects) {
        for (let y = Math.floor(r.y * dpr); y < Math.ceil((r.y + r.h) * dpr); y += 2) for (let x = Math.floor(r.x * dpr); x < Math.ceil((r.x + r.b) * dpr); x += 2) {
          if (x < 0 || y < 0 || x >= info.width || y >= info.height) continue;
          const o = (y * info.width + x) * info.channels;
          const k = kontrast(creme, lum(data[o], data[o + 1], data[o + 2]));
          if (k < minimum) { minimum = k; wo = { t: a.t, text: r.text, x: Math.round(x / dpr), y: Math.round(y / dpr), farbe: [data[o], data[o + 1], data[o + 2]] }; }
        }
      }
    }
    proben.push({ ansicht: vp.name, textfelder: rects.length, aufnahmen: aufnahmen.map((a) => a.t), kleinster_kontrast: +minimum.toFixed(2), wo });
    await context.close();
  }
  ergebnis.kontrast_schrift_ueber_szene = proben;
}

await browser.close();
await fs.writeFile(path.join(belege, 'webgl.json'), JSON.stringify(ergebnis, null, 2));
console.log(JSON.stringify({ groessen: ergebnis.groessen, kontextverlust: { sofort: ergebnis.kontextverlust.sofort, band: ergebnis.kontextverlust.band_deckkraft, nachher: ergebnis.kontextverlust.nachher }, pause: ergebnis.pause_ausserhalb, verborgen: ergebnis.pause_verborgen, frames: ergebnis.framezeiten_4x.map((f) => ({ p: f.phase, median: f.anteil_median_prozent, max: f.anteil_max_prozent, summe: `${f.verworfen_summe}/${f.erwartet_summe}` })), heap: ergebnis.freigabe_heap, kontrast: ergebnis.kontrast_schrift_ueber_szene }, null, 1));
