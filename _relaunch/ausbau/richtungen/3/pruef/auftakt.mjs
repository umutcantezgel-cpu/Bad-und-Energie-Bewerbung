// Auftakt ≤ 1,5 s ab Navigationsbeginn (performance.timeOrigin) unter realistischen Bedingungen (A-10):
// CPU-Drosselung 4×, Netz „schnelles 4G“ (60 ms RTT, 9 Mbit/s) und „Slow 4G“ (150 ms RTT, 1,6 Mbit/s),
// saveData (kein WebGL), sehr langsames Netz (spät: Endbild sofort). Gemessen: Klassenwechsel am Wurzelelement,
// Ende jeder Animation (document.getAnimations, inklusive der Shader-Front über window.__waermebild).
// Aufruf: node pruef/auftakt.mjs [--runs 3] → pruef/belege/auftakt.json
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const hier = path.dirname(fileURLToPath(import.meta.url));
const werkzeuge = path.resolve(hier, '../../../../werkzeuge');
const { launch, newContext, collectErrors } = await import(path.join(werkzeuge, 'lib/browser.mjs'));
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
const RUNS = Number(args.runs ?? 3);
const url = 'http://localhost:3803/';
const NETZ = {
  fast4g: { latency: 60, downloadThroughput: 9e6 / 8, uploadThroughput: 9e6 / 8 },
  slow4g: { latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 },
  sehrlangsam: { latency: 400, downloadThroughput: 400e3 / 8, uploadThroughput: 400e3 / 8 },
};
const SZENARIEN = [
  { name: 'lokal', vp: 'm390' },
  { name: 'cpu4', vp: 'm390', cpu: 4 },
  { name: 'cpu4-fast4g', vp: 'm390', cpu: 4, netz: 'fast4g' },
  { name: 'cpu4-slow4g', vp: 'm390', cpu: 4, netz: 'slow4g' },
  { name: 'savedata', vp: 'm390', save: true },
  { name: 'savedata-cpu4-slow4g', vp: 'm390', cpu: 4, netz: 'slow4g', save: true },
  { name: 'cpu4-sehrlangsam', vp: 'm390', cpu: 4, netz: 'sehrlangsam' },
  { name: 'd1440-cpu4-fast4g', vp: 'd1440', cpu: 4, netz: 'fast4g' },
];
const VPS = { m390: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, d1440: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false } };

const browser = await launch();
const ergebnis = { url, erstellt: new Date().toISOString(), grenze_ms: 1500, umgebung: 'Chromium headless (Playwright), WebGL über SwiftShader; Drosselung über CDP', szenarien: [] };
for (const sz of SZENARIEN) {
  const laeufe = [];
  for (let i = 0; i < RUNS; i++) {
    const { context } = await newContext(browser, { origin: new URL(url).origin, viewport: { name: sz.vp, ...VPS[sz.vp] }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const fehler = collectErrors(page);
    const cdp = await context.newCDPSession(page);
    if (sz.cpu) await cdp.send('Emulation.setCPUThrottlingRate', { rate: sz.cpu });
    if (sz.netz) { await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }); await cdp.send('Network.emulateNetworkConditions', { offline: false, ...NETZ[sz.netz] }); }
    if (sz.save) await page.addInitScript(() => { Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }); });
    // Klassenwechsel am Wurzelelement mit Zeitstempel (MutationObserver, sobald das Element existiert)
    await page.addInitScript(() => {
      window.__klassen = [];
      const an = () => { const d = document.documentElement; if (!d) return setTimeout(an, 0); window.__klassen.push([Math.round(performance.now()), d.className]); new MutationObserver(() => window.__klassen.push([Math.round(performance.now()), d.className])).observe(d, { attributes: true, attributeFilter: ['class'] }); };
      an();
    });
    await page.goto(url, { waitUntil: 'commit' });
    await page.waitForTimeout(sz.netz === 'sehrlangsam' ? 9000 : 6000);
    const r = await page.evaluate(() => {
      const anis = document.getAnimations().map((a) => { const t = a.effect.getComputedTiming(); return { start: a.startTime, ende: (a.startTime ?? 0) + t.endTime }; }).filter((a) => a.start !== null);
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      const nav = performance.getEntriesByType('navigation')[0];
      return { klassen: window.__klassen, css_ende: anis.length ? Math.round(Math.max(...anis.map((a) => a.ende))) : 0, css_anzahl: anis.length, wb: window.__waermebild ? { ...window.__waermebild } : null, fcp: fcp ? Math.round(fcp.startTime) : null, load: nav ? Math.round(nav.loadEventEnd) : null };
    });
    const auftaktAn = r.klassen.find((k) => k[1].includes('wb-auftakt'));
    const ersatz = r.klassen.find((k) => k[1].includes('wb-ersatz'));
    const shader = r.klassen.find((k) => k[1].includes('wb-laeuft'));
    const ende = Math.max(r.css_ende, r.wb && r.wb.ende ? r.wb.ende : 0);
    laeufe.push({
      fcp: r.fcp, load: r.load, auftakt: auftaktAn ? auftaktAn[0] : null, pfad: shader ? 'shader' : ersatz ? 'ersatz' : 'endbild',
      ersatz_ab: ersatz ? ersatz[0] : null, shader_ab: r.wb && r.wb.start ? r.wb.start : null, front_ms: r.wb && r.wb.dauer ? r.wb.dauer : null,
      css_ende: r.css_ende, shader_ende: r.wb && r.wb.ende ? r.wb.ende : null, ende, modul_geladen: !!r.wb, fehler: fehler.length,
      kalt_ohne_ersatz_ms: ersatz && auftaktAn && r.fcp ? Math.max(0, ersatz[0] - Math.max(r.fcp, auftaktAn[0])) : 0,
    });
    await context.close();
  }
  const enden = laeufe.map((l) => l.ende).sort((a, b) => a - b);
  ergebnis.szenarien.push({ ...sz, laeufe, ende_median: enden[Math.floor(enden.length / 2)], ende_max: enden[enden.length - 1], innerhalb_grenze: enden[enden.length - 1] <= 1500 });
  console.log(sz.name.padEnd(22), laeufe.map((l) => `${l.pfad} ab ${l.shader_ab ?? l.ersatz_ab ?? '-'} Ende ${l.ende} (fcp ${l.fcp}, load ${l.load}, Front ${l.front_ms ?? '-'}, Modul ${l.modul_geladen ? 'ja' : 'nein'})`).join(' | '));
}
await browser.close();
await fs.mkdir(path.join(hier, 'belege'), { recursive: true });
await fs.writeFile(path.join(hier, 'belege/auftakt.json'), JSON.stringify(ergebnis, null, 2));
console.log('Höchstwerte', ergebnis.szenarien.map((s) => `${s.name}: ${s.ende_max} ${s.innerhalb_grenze ? 'ok' : 'ÜBER 1500'}`).join(' · '));
