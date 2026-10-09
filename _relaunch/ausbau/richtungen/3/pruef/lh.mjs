// Lighthouse für den Prototyp (wie werkzeuge/lh.mjs: Standardprofil mobil mit simulierter Drosselung „Slow 4G“
// und CPU-Faktor 4, Desktop mit desktopConfig; Anfragesperre über --host-resolver-rules). Schreibt nur in pruef/belege.
// Aufruf: node pruef/lh.mjs [--runs 3]
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const hier = path.dirname(fileURLToPath(import.meta.url));
const werkzeuge = path.resolve(hier, '../../../../werkzeuge');
const require = createRequire(path.join(werkzeuge, 'package.json'));
const { CHROME } = await import(path.join(werkzeuge, 'lib/browser.mjs'));
const lighthouse = (await import(path.join(werkzeuge, 'node_modules/lighthouse/core/index.js'))).default;
const { desktopConfig } = await import(path.join(werkzeuge, 'node_modules/lighthouse/core/index.js'));
const chromeLauncher = require('chrome-launcher');
const runs = Number(process.argv[process.argv.indexOf('--runs') + 1]) || 3;
const url = 'http://localhost:3803/';
const ergebnis = { url, bedingungen: 'Lighthouse 13.5, mobil Standard (Slow 4G simuliert, CPU ×4), Desktop desktopConfig; lokal ausgeliefert ohne Kompression (http-server -c-1)', laeufe: [] };
for (const form of ['mobile', 'desktop']) for (let n = 0; n < runs; n++) {
  const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost , EXCLUDE 127.0.0.1'] });
  try {
    const flags = { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], disableFullPageScreenshot: true };
    const r = await lighthouse(url, form === 'desktop' ? flags : { ...flags, formFactor: 'mobile' }, form === 'desktop' ? desktopConfig : undefined);
    const a = r.lhr.audits, c = r.lhr.categories;
    ergebnis.laeufe.push({ form, n, perf: Math.round(c.performance.score * 100), a11y: Math.round(c.accessibility.score * 100), bp: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100), lcp_ms: Math.round(a['largest-contentful-paint'].numericValue), fcp_ms: Math.round(a['first-contentful-paint'].numericValue), tbt_ms: Math.round(a['total-blocking-time'].numericValue), cls: +a['cumulative-layout-shift'].numericValue.toFixed(3), lcp_element: JSON.stringify(a['largest-contentful-paint-element']?.details ?? null).slice(0, 300), anfragen: a['network-requests'].details.items.length, bytes: a['total-byte-weight'].numericValue });
  } finally { await chrome.kill(); }
}
const median = (form, k) => { const v = ergebnis.laeufe.filter((l) => l.form === form).map((l) => l[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
ergebnis.median = Object.fromEntries(['mobile', 'desktop'].map((f) => [f, Object.fromEntries(['perf', 'a11y', 'bp', 'seo', 'lcp_ms', 'fcp_ms', 'tbt_ms', 'cls', 'anfragen', 'bytes'].map((k) => [k, median(f, k)]))]));
await fs.mkdir(path.join(hier, 'belege'), { recursive: true });
await fs.writeFile(path.join(hier, 'belege/lighthouse.json'), JSON.stringify(ergebnis, null, 2));
console.log(JSON.stringify(ergebnis.median, null, 1), ergebnis.laeufe[0].lcp_element);
