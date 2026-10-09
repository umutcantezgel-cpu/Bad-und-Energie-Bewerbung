// Lighthouse-Messläufer (Ebene 6, Leistung): je Seite × Formfaktor N Läufe nacheinander, Median je Kennzahl.
// Rohberichte (volles Lighthouse-JSON) → _relaunch/.roh/<label>/lh/<slug>-<form>-<n>.json   (lokal, nicht versioniert)
// Zusammenfassung → _relaunch/belege/<label>/lighthouse.json und lighthouse.md
//
// Aufruf: node lh.mjs --base http://localhost:3500 --label <label> [--runs 5] [--forms mobile,desktop] [--only start,stellen]
//         [--warmup true|false]
//
// Messbedingungen (stehen auch im Kopf der Ausgaben):
// - Mobil = Lighthouse-Standardkonfiguration (Moto-G-Power-Profil, simulierte Drosselung „Slow 4G“, CPU-Faktor 4).
// - Desktop = `desktopConfig` aus lighthouse (1350×940, simulierte Drosselung desktopDense4G).
// - Läufe strikt nacheinander, nie parallel; je Lauf ein frisch gestartetes Chromium (eigenes Profil, kein Cache).
// - Vor jedem Block (Seite × Formfaktor) ein unprotokollierter Aufwärm-Abruf (Server-Zwischenspeicher), abschaltbar.
// - Anfragesperre (G5): Chromium bekommt `--host-resolver-rules`, alle Hosts außer localhost lassen sich nicht auflösen.
//   Fremde Anfragen schlagen damit fehl und werden als „fremde Anfragen“ gezählt; ihre Bytes bleiben 0.
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import lighthouse, { desktopConfig } from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { CHROME, GRUNDMENGE } from './lib/browser.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]]] : acc), []));
const base = (args.base ?? 'http://localhost:3500').replace(/\/$/, '');
const label = args.label ?? 'lauf';
const runs = Math.max(1, Number.parseInt(args.runs ?? '5', 10) || 5);
const warmup = (args.warmup ?? 'true') !== 'false';
const only = args.only ? args.only.split(',').map((s) => s.trim()).filter(Boolean) : null;
const FORMEN = { mobile: 'mobile', mobil: 'mobile', desktop: 'desktop' };
const forms = [...new Set((args.forms ?? 'mobile,desktop').split(',').map((f) => FORMEN[f.trim()]).filter(Boolean))];
if (!forms.length) throw new Error('--forms: erlaubt sind mobile und desktop');

// Standard-URLs: Hauptseiten der Grundmenge; mit --only beliebige Einträge der Grundmenge per Kurzname.
let seiten = only ? GRUNDMENGE.filter((p) => only.includes(p.slug)) : GRUNDMENGE.filter((p) => p.haupt);
if (only) {
  const unbekannt = only.filter((s) => !GRUNDMENGE.some((p) => p.slug === s));
  if (unbekannt.length) throw new Error(`--only: unbekannte Kurznamen ${unbekannt.join(', ')} (bekannt: ${GRUNDMENGE.map((p) => p.slug).join(', ')})`);
}

// Budgets (K-013, vorläufig): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms.
const BUDGET = Object.freeze({ perfMobilMin: 90, lcpMsMax: 2500, clsMax: 0.1, tbtMsMax: 200 });
const KAT = ['performance', 'accessibility', 'best-practices', 'seo'];
const KB = 1024;

const rawDir = path.join(ROOT, '.roh', label, 'lh');
const outDir = path.join(ROOT, 'belege', label);
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(outDir, { recursive: true });

const chromiumVersion = execFileSync(CHROME, ['--version'], { encoding: 'utf8' }).trim();
const ownHost = new URL(base).hostname;
const isOwn = (host) => host === ownHost || host === 'localhost' || host === '127.0.0.1' || host === '[::1]';

// ---------- Hilfsfunktionen ----------
const nums = (xs) => xs.filter((x) => typeof x === 'number' && Number.isFinite(x));
function median(xs) {
  const v = nums(xs).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = v.length >> 1;
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; // gerade Anzahl: Mittel der beiden mittleren Werte
}
const lo = (xs) => (nums(xs).length ? Math.min(...nums(xs)) : null);
const hi = (xs) => (nums(xs).length ? Math.max(...nums(xs)) : null);
function mode(xs) {
  const c = new Map();
  for (const x of xs.filter(Boolean)) c.set(x, (c.get(x) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}
const score = (lhr, id) => (lhr.categories?.[id]?.score == null ? null : Math.round(lhr.categories[id].score * 100));
const val = (lhr, id) => lhr.audits?.[id]?.numericValue ?? null;

/**
 * LCP-Element: Selektor bzw. Ausschnitt des ersten Knotens. Lighthouse 13 liefert ihn im Insight-Audit
 * `lcp-breakdown-insight`; ältere Versionen im Audit `largest-contentful-paint-element` (beides wird versucht).
 */
function lcpElement(lhr) {
  const details = lhr.audits?.['lcp-breakdown-insight']?.details ?? lhr.audits?.['largest-contentful-paint-element']?.details;
  const queue = [details];
  while (queue.length) {
    const d = queue.shift();
    if (!d || typeof d !== 'object') continue;
    if (d.node && typeof d.node === 'object') return { selector: d.node.selector ?? null, snippet: (d.node.snippet ?? '').slice(0, 160), bezeichnung: d.node.nodeLabel ?? null };
    if (d.selector || d.snippet) return { selector: d.selector ?? null, snippet: (d.snippet ?? '').slice(0, 160), bezeichnung: d.nodeLabel ?? null };
    queue.push(...(d.items ?? []));
  }
  return null;
}

/** Teilzeiten des LCP (Zeit bis zum ersten Byte, Darstellungsverzögerung usw.) in ms, nur im Einzellauf. */
function lcpTeile(lhr) {
  const teile = {};
  for (const t of lhr.audits?.['lcp-breakdown-insight']?.details?.items ?? []) {
    for (const i of t.items ?? []) if (i.subpart && typeof i.duration === 'number') teile[i.subpart] = Math.round(i.duration);
  }
  return Object.keys(teile).length ? teile : null;
}

/** Anfragen, Gesamtübertragung, Drittanbieter-Bytes aus dem Netzwerkprotokoll des Laufs. */
function netzwerk(lhr) {
  const items = lhr.audits?.['network-requests']?.details?.items ?? [];
  const echte = items.filter((i) => /^https?:/i.test(i.url));
  let dritt = 0;
  let drittAnfragen = 0;
  for (const i of echte) {
    let host = '';
    try { host = new URL(i.url).hostname; } catch { /* ungültige URL zählt als fremd */ }
    if (!isOwn(host)) { dritt += i.transferSize ?? 0; drittAnfragen += 1; }
  }
  return { anfragen: echte.length, drittanbieterBytes: dritt, fremdeAnfragen: drittAnfragen };
}

const KENN = ['leistung', 'barrierefreiheit', 'bestPractices', 'seo', 'fcpMs', 'lcpMs', 'cls', 'tbtMs', 'siMs', 'ttiMs', 'bytes', 'anfragen', 'drittanbieterBytes', 'fremdeAnfragen'];
function kennzahlen(lhr) {
  const nw = netzwerk(lhr);
  return {
    leistung: score(lhr, 'performance'),
    barrierefreiheit: score(lhr, 'accessibility'),
    bestPractices: score(lhr, 'best-practices'),
    seo: score(lhr, 'seo'),
    fcpMs: val(lhr, 'first-contentful-paint'),
    lcpMs: val(lhr, 'largest-contentful-paint'),
    cls: val(lhr, 'cumulative-layout-shift'),
    tbtMs: val(lhr, 'total-blocking-time'),
    siMs: val(lhr, 'speed-index'),
    ttiMs: val(lhr, 'interactive'),
    bytes: val(lhr, 'total-byte-weight'),
    ...nw,
  };
}

async function einLauf(url, form, slug, n) {
  const chrome = await chromeLauncher.launch({
    chromePath: CHROME,
    logLevel: 'silent',
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost , EXCLUDE 127.0.0.1'],
  });
  try {
    const flags = { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: KAT, disableFullPageScreenshot: true };
    const r = await lighthouse(url, form === 'desktop' ? flags : { ...flags, formFactor: 'mobile' }, form === 'desktop' ? desktopConfig : undefined);
    if (!r?.lhr) throw new Error('Lighthouse lieferte kein Ergebnis');
    const { lhr } = r;
    const rohdatei = path.join(rawDir, `${slug}-${form}-${n}.json`);
    await fs.writeFile(rohdatei, r.report);
    const fehler = lhr.runtimeError?.code && lhr.runtimeError.code !== 'NO_ERROR' ? `${lhr.runtimeError.code}: ${lhr.runtimeError.message}` : null;
    return { lhr, rohdatei: path.relative(ROOT, rohdatei), fehler };
  } finally {
    await chrome.kill();
  }
}

// ---------- Messen (strikt nacheinander) ----------
const ergebnisse = [];
const bedingungen = {};
let lhVersion = null;
let fehlerGesamt = 0;
const t0 = Date.now();

for (const p of seiten) {
  const url = base + p.path;
  for (const form of forms) {
    if (warmup) {
      try { await (await fetch(url, { redirect: 'follow' })).arrayBuffer(); } catch (err) { process.stdout.write(`Aufwärmen fehlgeschlagen ${url}: ${err}\n`); }
    }
    const einzel = [];
    const benchmark = [];
    for (let n = 1; n <= runs; n++) {
      try {
        const { lhr, rohdatei, fehler } = await einLauf(url, form, p.slug, n);
        lhVersion ??= lhr.lighthouseVersion;
        bedingungen[form] ??= {
          formFactor: lhr.configSettings?.formFactor,
          drosselungsmethode: lhr.configSettings?.throttlingMethod,
          drosselung: lhr.configSettings?.throttling,
          bildschirm: lhr.configSettings?.screenEmulation,
          userAgent: lhr.configSettings?.emulatedUserAgent,
        };
        if (lhr.environment?.benchmarkIndex) benchmark.push(lhr.environment.benchmarkIndex);
        if (fehler) {
          fehlerGesamt++;
          einzel.push({ n, fehler, rohdatei });
          process.stdout.write(`FEHLER ${p.slug} ${form} #${n}: ${fehler}\n`);
          continue;
        }
        const k = kennzahlen(lhr);
        einzel.push({ n, ...k, lcpElement: lcpElement(lhr), lcpTeileMs: lcpTeile(lhr), rohdatei });
        process.stdout.write(`${p.slug} ${form} #${n}/${runs}: Perf ${k.leistung} · LCP ${(k.lcpMs / 1000).toFixed(2)} s · CLS ${k.cls?.toFixed(3)} · TBT ${Math.round(k.tbtMs)} ms · ${Math.round(k.bytes / KB)} KB\n`);
      } catch (err) {
        fehlerGesamt++;
        einzel.push({ n, fehler: String(err?.message ?? err) });
        process.stdout.write(`FEHLER ${p.slug} ${form} #${n}: ${err?.message ?? err}\n`);
      }
    }
    const gueltig = einzel.filter((e) => !e.fehler);
    const median_ = {};
    const min_ = {};
    const max_ = {};
    for (const key of KENN) {
      const werte = gueltig.map((e) => e[key]);
      median_[key] = median(werte);
      min_[key] = lo(werte);
      max_[key] = hi(werte);
    }
    const budget = bewerten(form, median_, gueltig.length);
    ergebnisse.push({
      pfad: p.path, slug: p.slug, haupt: !!p.haupt, url, formfaktor: form,
      laeufe: runs, gueltigeLaeufe: gueltig.length,
      median: median_, min: min_, max: max_,
      lcpElement: mode(gueltig.map((e) => e.lcpElement?.selector ?? e.lcpElement?.snippet ?? null)),
      cpuBenchmarkMedian: median(benchmark),
      budget, einzel,
    });
  }
}

/** Budgetvergleich auf dem Median (Perf-Budget nur mobil). */
function bewerten(form, m, gueltig) {
  if (!gueltig) return { urteil: 'keine gültigen Läufe', verletzt: [] };
  const verletzt = [];
  if (form === 'mobile' && m.leistung < BUDGET.perfMobilMin) verletzt.push(`Perf ${m.leistung} < ${BUDGET.perfMobilMin}`);
  if (m.lcpMs > BUDGET.lcpMsMax) verletzt.push(`LCP ${fmt(m.lcpMs / 1000, 2)} s > 2,5 s`);
  if (m.cls > BUDGET.clsMax) verletzt.push(`CLS ${fmt(m.cls, 3)} > 0,1`);
  if (m.tbtMs > BUDGET.tbtMsMax) verletzt.push(`TBT ${Math.round(m.tbtMs)} ms > 200 ms`);
  return { urteil: verletzt.length ? 'über Budget' : 'ok', verletzt };
}

// ---------- Ausgabe ----------
function fmt(x, d = 0) {
  if (x == null || !Number.isFinite(x)) return '–';
  return x.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
}
const s = (ms, d = 2) => fmt(ms == null ? null : ms / 1000, d);
const kb = (b) => fmt(b == null ? null : b / KB, 0);
const range = (a, b, f) => (a == null ? '–' : a === b ? f(a) : `${f(a)}–${f(b)}`);
const kopfMs = (d) => (d ? `${fmt(d.rttMs)} ms RTT, ${fmt(d.throughputKbps, 0)} kbit/s, CPU ×${d.cpuSlowdownMultiplier}` : '–');

const erstellt = new Date();
const zusammenfassung = {
  label, base, erstellt: erstellt.toISOString(), dauerSekunden: Math.round((Date.now() - t0) / 1000),
  chromium: chromiumVersion, lighthouse: lhVersion, node: process.version,
  laeufeJeKombination: runs, formfaktoren: forms, aufwaermen: warmup,
  statistik: 'Median (bei gerader Anzahl: Mittel der beiden mittleren Werte), min, max über die gültigen Läufe',
  kilobyte: '1 KB = 1024 Byte',
  bedingungen,
  einstellungen: { onlyCategories: KAT, disableFullPageScreenshot: true, strikt_nacheinander: true, chromiumProLauf: 'neu gestartet', fremdhostSperre: 'host-resolver-rules: nur localhost auflösbar' },
  budget: { perfMobilMin: BUDGET.perfMobilMin, lcpSMax: 2.5, clsMax: BUDGET.clsMax, tbtMsMax: BUDGET.tbtMsMax },
  ergebnisse,
};
await fs.writeFile(path.join(outDir, 'lighthouse.json'), JSON.stringify(zusammenfassung, null, 2));

const datum = erstellt.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });
const md = [];
md.push(`# Lighthouse-Messung · ${label}`, '');
md.push(`- Datum: ${datum} (Europe/Berlin)`);
md.push(`- Chromium: ${chromiumVersion} · Lighthouse ${lhVersion} · Node ${process.version}`);
md.push(`- Basis: ${base} (Produktions-Build) · Läufe je Seite und Formfaktor: N = ${runs}, nacheinander, je Lauf frisches Chromium · Aufwärm-Abruf: ${warmup ? 'ja' : 'nein'}`);
for (const f of forms) {
  const b = bedingungen[f];
  if (b) md.push(`- Drosselung ${f === 'mobile' ? 'mobil' : 'Desktop'}: ${b.drosselungsmethode}, ${kopfMs(b.drosselung)} · Bildschirm ${b.bildschirm?.width}×${b.bildschirm?.height} @${b.bildschirm?.deviceScaleFactor}`);
}
md.push('- Zahlen sind Mediane über die gültigen Läufe; 1 KB = 1024 Byte; Fremdhosts per Sperre nicht erreichbar (Bytes dort 0)');
md.push('- Budgets (K-013): Perf mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms; geprüft auf dem Median, Perf-Budget nur mobil', '');
md.push('| Seite | Formfaktor | Perf | A11y | BP | SEO | LCP s | CLS | TBT ms | SI s | Bytes KB | Budget |');
md.push('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|');
for (const e of ergebnisse) {
  const m = e.median;
  const bud = e.budget.verletzt.length ? `über Budget (${e.budget.verletzt.join('; ')})` : e.budget.urteil;
  md.push(`| ${e.pfad} | ${e.formfaktor === 'mobile' ? 'mobil' : 'Desktop'} | ${fmt(m.leistung)} | ${fmt(m.barrierefreiheit)} | ${fmt(m.bestPractices)} | ${fmt(m.seo)} | ${s(m.lcpMs)} | ${fmt(m.cls, 3)} | ${fmt(m.tbtMs)} | ${s(m.siMs)} | ${kb(m.bytes)} | ${bud} |`);
}
md.push('', '## Weitere Kennzahlen und Streuung', '');
md.push('| Seite | Formfaktor | gültige Läufe | Perf min–max | LCP s min–max | TBT ms min–max | FCP s | TTI s | Anfragen | Dritt-KB | fremde Anfragen | CPU-Benchmark | LCP-Element |');
md.push('|---|---|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|');
for (const e of ergebnisse) {
  const m = e.median;
  const el = e.lcpElement ? `\`${String(e.lcpElement).replace(/\|/g, '\\|').slice(0, 90)}\`` : '–';
  md.push(`| ${e.pfad} | ${e.formfaktor === 'mobile' ? 'mobil' : 'Desktop'} | ${e.gueltigeLaeufe}/${e.laeufe} | ${range(e.min.leistung, e.max.leistung, (x) => fmt(x))} | ${range(e.min.lcpMs, e.max.lcpMs, (x) => s(x))} | ${range(e.min.tbtMs, e.max.tbtMs, (x) => fmt(x))} | ${s(m.fcpMs)} | ${s(m.ttiMs)} | ${fmt(m.anfragen)} | ${kb(m.drittanbieterBytes)} | ${fmt(m.fremdeAnfragen)} | ${fmt(e.cpuBenchmarkMedian)} | ${el} |`);
}
const fehlerLaeufe = ergebnisse.flatMap((e) => e.einzel.filter((x) => x.fehler).map((x) => `- ${e.pfad} ${e.formfaktor} Lauf ${x.n}: ${x.fehler}`));
if (fehlerLaeufe.length) md.push('', '## Fehlgeschlagene Läufe (nicht in den Medianen)', '', ...fehlerLaeufe);
md.push('', `Rohberichte: \`_relaunch/.roh/${label}/lh/<slug>-<formfaktor>-<n>.json\` · Zusammenfassung: \`_relaunch/belege/${label}/lighthouse.json\``, '');
await fs.writeFile(path.join(outDir, 'lighthouse.md'), md.join('\n'));

const ueber = ergebnisse.filter((e) => e.budget.urteil !== 'ok').length;
console.log(`\nFERTIG ${ergebnisse.length} Kombinationen × ${runs} Läufe in ${zusammenfassung.dauerSekunden} s · über Budget ${ueber} · fehlgeschlagene Läufe ${fehlerGesamt} → ${path.relative(ROOT, outDir)}/lighthouse.{json,md}`);
if (fehlerGesamt) process.exitCode = 1;
