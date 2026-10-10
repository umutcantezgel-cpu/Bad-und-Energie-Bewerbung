// V6-C: Lantern-LCP aus gespeicherten Artefakten nachrechnen; Knoten des LCP-Graphen auflisten und
// „was wäre, wenn“ der beobachtete LCP-Zeitpunkt früher läge.
// Aufruf: node lantern.mjs <artefakte.json.gz> [cutoff-ms ...]
import fs from 'node:fs';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';

const W = '/home/user/Bad-und-Energie-Bewerbung/_relaunch/werkzeuge/node_modules/lighthouse/core';
const { LanternLargestContentfulPaint } = await import(pathToFileURL(`${W}/computed/metrics/lantern-largest-contentful-paint.js`).href);
const { LanternFirstContentfulPaint } = await import(pathToFileURL(`${W}/computed/metrics/lantern-first-contentful-paint.js`).href);
const Lantern = await import(pathToFileURL(`${W}/lib/lantern/lantern.js`).href);
const { getComputationDataParams } = await import(pathToFileURL(`${W}/computed/metrics/lantern-metric.js`).href);

const datei = process.argv[2];
const art = JSON.parse(zlib.gunzipSync(fs.readFileSync(datei)));
const data = { trace: art.Trace, devtoolsLog: art.DevtoolsLog, gatherContext: art.GatherContext, settings: art.settings, simulator: null, URL: art.URL, SourceMaps: art.SourceMaps, HostDPR: art.HostDPR };
const context = { computedCache: new Map(), settings: art.settings };
const fcp = await LanternFirstContentfulPaint.request(data, context);
const lcp = await LanternLargestContentfulPaint.request(data, context);
const params = await getComputationDataParams(data, context);
const ts0 = params.processedNavigation.timestamps.timeOrigin;
const rel = (t) => Math.round((t - ts0) / 1000);
console.log(`FCP sim ${Math.round(fcp.timing)} (opt ${Math.round(fcp.optimisticEstimate.timeInMs)} / pes ${Math.round(fcp.pessimisticEstimate.timeInMs)}) | LCP sim ${Math.round(lcp.timing)} (opt ${Math.round(lcp.optimisticEstimate.timeInMs)} / pes ${Math.round(lcp.pessimisticEstimate.timeInMs)})`);
console.log(`beob. FCP ${rel(params.processedNavigation.timestamps.firstContentfulPaint)} beob. LCP ${rel(params.processedNavigation.timestamps.largestContentfulPaint)}`);

function liste(name, est) {
  const rows = [...est.nodeTimings.entries()].map(([n, t]) => ({ n, t })).sort((a, b) => a.t.endTime - b.t.endTime);
  let netz = 0;
  let cpu = 0;
  for (const { n, t } of rows) {
    if (n.type === 'network') netz += n.request.transferSize ?? 0;
    else cpu += t.duration;
  }
  console.log(`-- ${name}: ${rows.length} Knoten, Netz ${Math.round(netz / 1024)} KB, CPU sim ${Math.round(cpu)} ms`);
  for (const { n, t } of rows) {
    if (n.type === 'network') console.log(`   N ${Math.round(t.startTime)}→${Math.round(t.endTime)} ${n.request.resourceType} ${n.request.priority} ${Math.round((n.request.transferSize ?? 0) / 1024)}KB ${n.request.url.replace(/^https?:\/\/[^/]+/, '').slice(0, 60)} (beob. ${rel(n.startTime)}→${rel(n.endTime)})`);
    else if (t.duration > 15) console.log(`   C ${Math.round(t.startTime)}→${Math.round(t.endTime)} (${Math.round(t.duration)} ms sim, beob. @${rel(n.startTime)} ${Math.round((n.endTime - n.startTime) / 1000)} ms) ${n.getEvaluateScriptURLs ? [...n.getEvaluateScriptURLs()].map((u) => u.split('/').pop()).join(' ') : ''}${n.didPerformLayout() ? ' [Layout]' : ''}`);
  }
}
if (process.env.LISTE) {
  liste('LCP optimistisch', lcp.optimisticEstimate);
  liste('LCP pessimistisch', lcp.pessimisticEstimate);
  if (process.env.LISTE === 'fcp') liste('FCP pessimistisch', fcp.pessimisticEstimate);
}

// Was wäre, wenn der beobachtete LCP früher läge (gleicher Graph, gleiche Messung)?
for (const ms of process.argv.slice(3).map(Number)) {
  const pn = structuredClone(params.processedNavigation);
  pn.timestamps.largestContentfulPaint = ts0 + ms * 1000;
  const r = Lantern.Metrics.LargestContentfulPaint.compute({ simulator: params.simulator, graph: params.graph, processedNavigation: pn }, { fcpResult: fcp });
  console.log(`wenn beob. LCP = ${ms} ms → LCP sim ${Math.round(r.timing)} (opt ${Math.round(r.optimisticEstimate.timeInMs)} / pes ${Math.round(r.pessimisticEstimate.timeInMs)})`);
  if (process.env.WENN_LISTE) liste(`opt bei ${ms}`, r.optimisticEstimate);
}
// Was wäre, wenn bestimmte Anfragen nicht vor dem ersten Bild fertig wären (gleicher beobachteter LCP)?
// OHNE="woff2|bricolage" (Regex auf die URL), mehrere Varianten mit ";" getrennt.
for (const muster of (process.env.OHNE ?? '').split(';').filter(Boolean)) {
  const re = new RegExp(muster);
  const g = params.graph.cloneWithRelationships((n) => !(n.type === 'network' && !n.isMainDocument() && re.test(n.request.url)));
  const r = Lantern.Metrics.LargestContentfulPaint.compute({ simulator: params.simulator, graph: g, processedNavigation: params.processedNavigation }, { fcpResult: fcp });
  console.log(`ohne /${muster}/ → LCP sim ${Math.round(r.timing)} (opt ${Math.round(r.optimisticEstimate.timeInMs)} / pes ${Math.round(r.pessimisticEstimate.timeInMs)})`);
}
if (process.env.SKRIPTE) {
  // früheste EvaluateScript-Aufgabe je URL im Graphen
  const erst = new Map();
  params.graph.traverse((n) => {
    if (n.type !== 'cpu') return;
    for (const u of n.getEvaluateScriptURLs()) if (!erst.has(u) || erst.get(u) > n.startTime) erst.set(u, n.startTime);
  });
  for (const [u, t] of [...erst.entries()].sort((a, b) => a[1] - b[1])) console.log(`   Eval @${rel(t)} ${u.split('/').pop()}`);
}
