// V6-C: Wird der Schrittbehälter im ApplyFlow nach der Hydrierung neu eingesetzt? Und welche LCP-Kandidaten
// gibt es unter echter Drosselung (CPU ×4, 150 ms RTT, 1,6 Mbit/s), also aus Sicht echter Nutzer?
// Aufruf: node remount.mjs --base http://localhost:3481 [--pfade /bewerbung,/]
import { pathToFileURL } from 'node:url';

const W = '/home/user/Bad-und-Energie-Bewerbung/_relaunch/werkzeuge';
const { launch } = await import(pathToFileURL(`${W}/lib/browser.mjs`).href);
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
const base = args.base.replace(/\/$/, '');
const pfade = (args.pfade ?? '/bewerbung').split(',');
const drossel = args.drossel !== 'nein';

const browser = await launch();
for (const pfad of pfade) {
  const context = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36' });
  await context.addInitScript(() => {
    window.__log = [];
    const t = () => Math.round(performance.now());
    new MutationObserver((ms) => {
      for (const m of ms) for (const n of m.removedNodes) {
        if (n.nodeType === 1 && (n.matches?.('[data-motion="fortschritt"]') || n.querySelector?.('[data-motion="fortschritt"]'))) window.__log.push({ t: t(), entfernt: n.getAttribute('data-motion') ?? n.tagName });
      }
      for (const m of ms) for (const n of m.addedNodes) {
        if (n.nodeType === 1 && n.matches?.('[data-motion="fortschritt"]')) window.__log.push({ t: t(), eingesetzt: n.className });
      }
    }).observe(document, { subtree: true, childList: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const el = e.element;
        const cls = el ? `${el.tagName.toLowerCase()}.${(el.getAttribute('class') ?? '').split(/\s+/).slice(0, 2).join('.')}` : '(entfernt)';
        window.__log.push({ t: Math.round(e.startTime), lcp: e.size, el: cls, text: (el?.textContent ?? '').trim().slice(0, 40) });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__log.push({ t: Math.round(e.startTime), paint: e.name }); }).observe({ type: 'paint', buffered: true });
    document.addEventListener('DOMContentLoaded', () => window.__log.push({ t: t(), dcl: true }));
  });
  const page = await context.newPage();
  if (drossel) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6384 * 1024 * 1024) / 8 * 0.9, uploadThroughput: (750 * 1024) / 8 * 0.9 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  }
  await page.goto(base + pfad, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForTimeout(4000);
  const log = await page.evaluate(() => window.__log);
  console.log(`== ${pfad}${drossel ? ' (gedrosselt)' : ''}`);
  for (const l of log) console.log('  ', JSON.stringify(l));
  await context.close();
}
await browser.close();
