// V6-C Diagnose: Lighthouse-Lauf (gleiche Einstellungen wie lh.mjs) mit Trace-Auswertung,
// dazu ein Playwright-Lauf mit PerformanceObserver für die LCP-Kandidaten samt Element.
// Aufruf: node trace.mjs --base http://localhost:3481 --label a [--forms mobile,desktop] [--only start,bewerbung]
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';

const W = '/home/user/Bad-und-Energie-Bewerbung/_relaunch/werkzeuge';
const lhMod = await import(pathToFileURL(`${W}/node_modules/lighthouse/core/index.js`).href);
const lighthouse = lhMod.default;
const { desktopConfig } = lhMod;
const chromeLauncher = await import(pathToFileURL(`${W}/node_modules/chrome-launcher/dist/index.js`).href);
const { CHROME, GRUNDMENGE, launch } = await import(pathToFileURL(`${W}/lib/browser.mjs`).href);

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
const base = args.base.replace(/\/$/, '');
const label = args.label ?? 'x';
const forms = (args.forms ?? 'mobile').split(',');
const only = (args.only ?? 'start,stellen,stelle-anlagenmechaniker,stelle-kundendienst,bewerbung').split(',');
const outDir = path.join(import.meta.dirname, 'traces', label);
await fs.mkdir(outDir, { recursive: true });

function analyse(trace, lhr) {
  const ev = trace.traceEvents;
  const fcpEv = ev.find((e) => e.name === 'firstContentfulPaint');
  const frame = fcpEv?.args?.frame;
  const nav = ev.filter((e) => e.name === 'navigationStart' && e.args?.frame === frame && e.args?.data?.documentLoaderURL?.startsWith('http')).at(-1)
    ?? ev.filter((e) => e.name === 'navigationStart' && e.args?.frame === frame && e.ts <= fcpEv.ts).at(-1);
  const t0 = nav.ts;
  const rel = (ts) => Math.round((ts - t0) / 1000);
  const pid = fcpEv.pid;
  const tid = fcpEv.tid;
  const cands = ev.filter((e) => e.name === 'largestContentfulPaint::Candidate' && e.args?.frame === frame).map((e) => ({ t: rel(e.ts), idx: e.args.data.candidateIndex, nodeId: e.args.data.nodeId, size: e.args.data.size, type: e.args.data.type }));
  const invalid = ev.filter((e) => e.name === 'largestContentfulPaint::Invalidate' && e.args?.frame === frame).map((e) => rel(e.ts));
  const fcp = rel(fcpEv.ts);
  const lcpT = cands.length ? cands.at(-1).t : null;
  // Haupt-Thread: oberste Aufgaben bis LCP + 30 ms
  const main = ev.filter((e) => e.pid === pid && e.tid === tid && e.ph === 'X');
  const tops = main.filter((e) => (e.name === 'RunTask' || e.name === 'ThreadControllerImpl::RunTask') && e.dur > 2000 && rel(e.ts) <= (lcpT ?? fcp) + 30);
  const aufgaben = tops.map((t) => {
    const inner = main.filter((e) => e.ts >= t.ts && e.ts + (e.dur ?? 0) <= t.ts + t.dur && e !== t);
    const names = {};
    for (const e of inner) {
      if (['EvaluateScript', 'ParseHTML', 'Layout', 'UpdateLayoutTree', 'Paint', 'PrePaint', 'FunctionCall', 'TimerFire', 'FireAnimationFrame', 'v8.compile', 'v8.compileModule', 'RunMicrotasks', 'Commit', 'ParseAuthorStyleSheet', 'HitTest', 'v8.parseOnBackground'].includes(e.name)) {
        names[e.name] = (names[e.name] ?? 0) + e.dur / 1000;
      }
    }
    const urls = inner.filter((e) => e.name === 'EvaluateScript').map((e) => (e.args?.data?.url ?? '').split('/').pop()).filter(Boolean);
    return { start: rel(t.ts), ms: Math.round(t.dur / 1000), was: Object.entries(names).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', '), skripte: urls.join(' ') };
  });
  // Ressourcen
  const send = new Map();
  for (const e of ev) if (e.name === 'ResourceSendRequest') send.set(e.args.data.requestId, { url: e.args.data.url, start: rel(e.ts), prio: e.args.data.priority, rb: e.args.data.renderBlocking });
  const ress = [];
  for (const e of ev) if (e.name === 'ResourceFinish' && send.has(e.args.data.requestId)) { const s = send.get(e.args.data.requestId); ress.push({ ...s, ende: rel(e.ts), url: s.url.replace(base, '').slice(0, 70) }); }
  const m = lhr.audits.metrics.details.items[0];
  return {
    obsFCP: m.observedFirstContentfulPaint, obsLCP: m.observedLargestContentfulPaint, simFCP: Math.round(m.firstContentfulPaint), simLCP: Math.round(m.largestContentfulPaint),
    fcpTrace: fcp, kandidaten: cands, invalid, aufgaben, ressourcen: ress.sort((a, b) => a.ende - b.ende),
    lcpElement: lhr.audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.selector ?? null,
    lcpSnippet: (lhr.audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet ?? '').slice(0, 200),
    teile: (lhr.audits['lcp-breakdown-insight']?.details?.items ?? []).flatMap((t) => (t.items ?? []).filter((i) => i.subpart).map((i) => `${i.subpart} ${Math.round(i.duration)}`)).join(', '),
  };
}

async function lhLauf(url, form) {
  const chrome = await chromeLauncher.launch({ chromePath: CHROME, logLevel: 'silent', chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost , EXCLUDE 127.0.0.1'] });
  try {
    const flags = { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance'], disableFullPageScreenshot: true };
    const r = await lighthouse(url, form === 'desktop' ? flags : { ...flags, formFactor: 'mobile' }, form === 'desktop' ? desktopConfig : undefined);
    return r;
  } finally {
    await chrome.kill();
  }
}

// Playwright: LCP-Kandidaten mit Element (unthrottled, wie der beobachtete Lighthouse-Lauf)
async function kandidaten(url, form) {
  const browser = await launch();
  try {
    const mobile = form !== 'desktop';
    const context = await browser.newContext(mobile
      ? { viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36' }
      : { viewport: { width: 1350, height: 940 }, deviceScaleFactor: 1 });
    await context.addInitScript(() => {
      window.__lcp = [];
      const beschreibe = (el) => {
        if (!el) return '(entfernt)';
        const kette = [];
        for (let n = el; n && n.nodeType === 1 && kette.length < 4; n = n.parentElement) {
          const cls = (n.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).slice(0, 3).join('.');
          kette.unshift(`${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}${cls ? '.' + cls : ''}`);
        }
        return kette.join(' > ');
      };
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          const el = e.element;
          let op = null;
          if (el) { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); op = o; }
          window.__lcp.push({ t: Math.round(e.startTime), render: Math.round(e.renderTime), size: e.size, el: beschreibe(el), text: (el?.textContent ?? '').trim().slice(0, 50), opJetzt: op });
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp.push({ paint: e.name, t: Math.round(e.startTime) }); }).observe({ type: 'paint', buffered: true });
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    return await page.evaluate(() => window.__lcp);
  } finally {
    await browser.close();
  }
}

const gesamt = {};
for (const p of GRUNDMENGE.filter((g) => only.includes(g.slug))) {
  for (const form of forms) {
    const url = base + p.path;
    try { await (await fetch(url)).arrayBuffer(); } catch {}
    const r = await lhLauf(url, form);
    const trace = r.artifacts.Trace ?? r.artifacts.traces?.defaultPass;
    await fs.writeFile(path.join(outDir, `${p.slug}-${form}.trace.json.gz`), zlib.gzipSync(JSON.stringify(trace)));
    const art = { Trace: trace, DevtoolsLog: r.artifacts.DevtoolsLog, GatherContext: r.artifacts.GatherContext, URL: r.artifacts.URL, SourceMaps: r.artifacts.SourceMaps ?? [], HostDPR: r.artifacts.HostDPR, settings: r.lhr.configSettings };
    await fs.writeFile(path.join(outDir, `${p.slug}-${form}.artefakte.json.gz`), zlib.gzipSync(JSON.stringify(art)));
    const a = analyse(trace, r.lhr);
    a.pw = await kandidaten(url, form);
    gesamt[`${p.slug}-${form}`] = a;
    process.stdout.write(`\n##### ${p.slug} ${form}: obsFCP ${a.obsFCP} obsLCP ${a.obsLCP} simFCP ${a.simFCP} simLCP ${a.simLCP} | LCP-Element ${a.lcpElement}\n  Teile: ${a.teile}\n  Trace-Kandidaten: ${JSON.stringify(a.kandidaten)} invalid ${JSON.stringify(a.invalid)}\n`);
    for (const k of a.pw) process.stdout.write(`  PW ${JSON.stringify(k)}\n`);
    for (const t of a.aufgaben) process.stdout.write(`  Aufgabe @${t.start} ${t.ms} ms: ${t.was}${t.skripte ? ' | ' + t.skripte : ''}\n`);
    for (const x of a.ressourcen.filter((x) => x.ende <= (a.obsLCP ?? 0) + 20)) process.stdout.write(`  Res ${x.start}->${x.ende} ${x.prio}${x.rb && x.rb !== 'non_blocking' ? ' ' + x.rb : ''} ${x.url}\n`);
  }
}
await fs.writeFile(path.join(outDir, 'auswertung.json'), JSON.stringify(gesamt, null, 1));
