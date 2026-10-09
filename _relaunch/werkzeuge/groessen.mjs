// Größenprüfer (Ebene 6, Leistung): JS-, CSS-, Schrift- und SVG-Größen je Seite gegen die Budgets (K-013).
// Je Seite der Grundmenge (Ansicht d1440, hell, kalter Zwischenspeicher): alle Antworten mitschneiden,
// nach Typ gruppieren, je Datei übertragene Größe, rohe (entpackte) Größe und gzip-Größe erfassen.
// Ausgabe: _relaunch/belege/<label>/groessen.json und groessen.md
//
// Aufruf: node groessen.mjs --base http://localhost:3500 --label <label> [--only start,stellen] [--motion no-preference|reduce]
//
// Messbedingungen (stehen auch im Kopf der Ausgaben):
// - Chromium über launch()/newContext() aus lib/browser.mjs (Anfragesperre G5), Ansicht d1440 (1440×900), helles Schema.
// - Je Seite ein neuer Kontext (kalter Zwischenspeicher). Laden bis `networkidle`, danach schrittweises Durchscrollen
//   (scrollThrough), damit nachgeladene Inhalte erfasst werden; Antworten danach sind als „nach Scrollen“ markiert.
// - „übertragen“ = Antwort-Body in Byte, wie er über die Leitung kam (komprimiert, ohne Kopfzeilen; Playwright `request.sizes()`).
//   „roh“ = entpackter Body. „gzip“ = `zlib.gzipSync(body, { level: 9 })`, selbst berechnet.
// - 1 KB = 1024 Byte.
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { GRUNDMENGE, VIEWPORTS, launch, newContext, scrollThrough } from './lib/browser.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]]] : acc), []));
const base = (args.base ?? 'http://localhost:3500').replace(/\/$/, '');
const label = args.label ?? 'lauf';
const only = args.only ? args.only.split(',').map((s) => s.trim()).filter(Boolean) : null;
const motion = args.motion ?? 'no-preference';
const vp = VIEWPORTS.find((v) => v.name === 'd1440');
const seiten = only ? GRUNDMENGE.filter((p) => only.includes(p.slug)) : GRUNDMENGE;
if (only) {
  const unbekannt = only.filter((s) => !GRUNDMENGE.some((p) => p.slug === s));
  if (unbekannt.length) throw new Error(`--only: unbekannte Kurznamen ${unbekannt.join(', ')} (bekannt: ${GRUNDMENGE.map((p) => p.slug).join(', ')})`);
}

const KB = 1024;
// Budgets (K-013, vorläufig)
const BUDGET = Object.freeze({ schriftenGesamtKB: 250, iconSvgKB: 1.5, illustrationSvgGzipKB: 40, bewegungsJsGzipKB: 60 });

const outDir = path.join(ROOT, 'belege', label);
await fs.mkdir(outDir, { recursive: true });

const ownHost = new URL(base).host;
const TYPEN = ['document', 'script', 'stylesheet', 'font', 'svg', 'image', 'rsc', 'andere'];
const TYPNAME = { document: 'Dokument (HTML)', script: 'JavaScript', stylesheet: 'CSS', font: 'Schriften', svg: 'SVG-Dateien', image: 'Bilder (ohne SVG)', rsc: 'Next-Prefetch (_rsc)', andere: 'Sonstiges (fetch, xhr, …)' };

const gzip = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
// Inline-SVG: React-useId-Anteile (_R_…_, :r1:) vereinheitlichen, damit gleiche Symbole gleich zählen
const normiere = (markup) => markup.replace(/_R_[A-Za-z0-9]+_/g, '_R_').replace(/:r[0-9a-z]+:/g, ':r:');
const strip = (u) => { const x = new URL(u); return x.origin + x.pathname; }; // ohne Query: gleiche Datei = gleiche Adresse
function typ(resourceType, contentType, url, istRsc) {
  const ct = (contentType ?? '').toLowerCase();
  if (istRsc) return 'rsc';
  if (ct.includes('image/svg') || /\.svg($|\?)/i.test(url)) return 'svg';
  if (resourceType === 'document') return 'document';
  if (resourceType === 'script') return 'script';
  if (resourceType === 'stylesheet') return 'stylesheet';
  if (resourceType === 'font') return 'font';
  if (resourceType === 'image') return 'image';
  return 'andere';
}

const browser = await launch();
const t0 = Date.now();
const seitenErgebnis = [];

for (const p of seiten) {
  const { context, requestLog } = await newContext(browser, { origin: base, viewport: vp, colorScheme: 'light', reducedMotion: motion });
  const page = await context.newPage();
  const url = base + p.path;
  const aufgaben = [];
  let phase = 'laden';
  page.on('response', (res) => {
    const aktuellePhase = phase;
    aufgaben.push((async () => {
      const req = res.request();
      const resUrl = res.url();
      let host;
      try { host = new URL(resUrl).host; } catch { return null; }
      if (host !== ownHost) return null; // Attrappen für Tracking u. Ä. zählen nicht als Seitengewicht
      const status = res.status();
      const kopf = res.headers();
      const eintrag = {
        url: strip(resUrl), query: new URL(resUrl).search || undefined, status,
        typ: typ(req.resourceType(), kopf['content-type'], resUrl, new URL(resUrl).searchParams.has('_rsc') || req.headers()['rsc'] === '1'), resourceType: req.resourceType(),
        contentType: kopf['content-type']?.split(';')[0] ?? null, kodierung: kopf['content-encoding'] ?? 'keine',
        phase: aktuellePhase,
      };
      try {
        const sizes = await req.sizes();
        eintrag.uebertragen = sizes.responseBodySize;
        eintrag.kopfBytes = sizes.responseHeadersSize;
      } catch { eintrag.uebertragen = null; }
      try {
        const body = await res.body();
        eintrag.roh = body.length;
        eintrag.gzip = body.length ? gzip(body) : 0;
        eintrag.sha = sha(body.toString('latin1'));
      } catch { eintrag.roh = null; eintrag.gzip = null; eintrag.hinweis = 'Body nicht lesbar (Weiterleitung, 204 o. Ä.)'; }
      return eintrag;
    })());
  });
  let status = 0;
  let inlineSvgs = [];
  let fehler = null;
  try {
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
    status = res?.status() ?? 0;
    await page.evaluate(() => document.fonts?.ready);
    phase = 'scroll';
    await scrollThrough(page);
    await page.waitForTimeout(400);
    // Inline-<svg> im DOM (nach Scrollen), je Element Größe der Auszeichnung und gezeigte Größe
    inlineSvgs = await page.evaluate(() => [...document.querySelectorAll('svg')].map((el) => {
      const r = el.getBoundingClientRect();
      const markup = el.outerHTML;
      return {
        markup,
        breite: Math.round(r.width), hoehe: Math.round(r.height),
        versteckt: el.getAttribute('aria-hidden') === 'true',
        kennung: el.id || el.getAttribute('aria-label') || el.getAttribute('data-icon') || (typeof el.className?.baseVal === 'string' ? el.className.baseVal.split(/\s+/).slice(0, 3).join(' ') : '') || null,
        ort: (() => { let n = el; const path = []; while (n && n.nodeType === 1 && path.length < 3) { path.unshift(n.tagName.toLowerCase() + (n.id ? `#${n.id}` : '')); n = n.parentElement; } return path.join(' > '); })(),
      };
    }));
  } catch (err) {
    fehler = String(err?.message ?? err);
  }
  const dateien = (await Promise.all(aufgaben)).filter(Boolean);
  await context.close();

  // Inline-SVG: Größe der Auszeichnung in UTF-8-Byte und gzip
  const inline = inlineSvgs.map((s) => {
    const buf = Buffer.from(s.markup, 'utf8');
    return { hash: sha(normiere(s.markup)), bytes: buf.length, gzip: gzip(buf), breite: s.breite, hoehe: s.hoehe, versteckt: s.versteckt, kennung: s.kennung, ort: s.ort };
  });

  const summe = Object.fromEntries(TYPEN.map((t) => [t, { dateien: 0, uebertragen: 0, roh: 0, gzip: 0, nachScrollen: 0 }]));
  for (const d of dateien) {
    const z = summe[d.typ];
    z.dateien += 1;
    z.uebertragen += d.uebertragen ?? 0;
    z.roh += d.roh ?? 0;
    z.gzip += d.gzip ?? 0;
    if (d.phase === 'scroll') z.nachScrollen += d.uebertragen ?? 0;
  }
  const jeAdresse = new Map();
  for (const d of dateien) { const k = d.url + (d.query ?? ''); jeAdresse.set(k, (jeAdresse.get(k) ?? 0) + 1); }
  const mehrfach = [...jeAdresse.entries()].filter(([, n]) => n > 1).map(([adresse, anzahl]) => ({ adresse: adresse.replace(base, ''), anzahl }));
  const gesamt = { dateien: dateien.length, uebertragen: dateien.reduce((a, d) => a + (d.uebertragen ?? 0), 0), kopfBytes: dateien.reduce((a, d) => a + (d.kopfBytes ?? 0), 0), roh: dateien.reduce((a, d) => a + (d.roh ?? 0), 0), gzip: dateien.reduce((a, d) => a + (d.gzip ?? 0), 0) };
  seitenErgebnis.push({
    pfad: p.path, slug: p.slug, haupt: !!p.haupt, status, fehler,
    summe, gesamt, mehrfachGeladen: mehrfach,
    inlineSvg: { anzahl: inline.length, bytes: inline.reduce((a, s) => a + s.bytes, 0), gzip: inline.reduce((a, s) => a + s.gzip, 0), ueberIconBudget: inline.filter((s) => s.bytes > BUDGET.iconSvgKB * KB).length, elemente: inline },
    dateien,
    gesperrt: requestLog,
  });
  process.stdout.write(`${status || 'FEHLER'} ${p.slug}: ${dateien.length} Dateien · ${(gesamt.uebertragen / KB).toFixed(0)} KB übertragen · JS ${(summe.script.gzip / KB).toFixed(0)} KB gzip · Schriften ${(summe.font.uebertragen / KB).toFixed(0)} KB · inline-SVG ${inline.length}${fehler ? ` · ${fehler}` : ''}\n`);
}
await browser.close();

// ---------- Global ----------
const proUrl = (typen) => {
  const m = new Map();
  for (const s of seitenErgebnis) for (const d of s.dateien) {
    if (!typen.includes(d.typ)) continue;
    const e = m.get(d.url) ?? { url: d.url, typ: d.typ, uebertragen: d.uebertragen, roh: d.roh, gzip: d.gzip, kodierung: d.kodierung, contentType: d.contentType, seiten: [] };
    if (!e.seiten.includes(s.slug)) e.seiten.push(s.slug);
    m.set(d.url, e);
  }
  return [...m.values()];
};
const schriften = proUrl(['font']).sort((a, b) => (b.uebertragen ?? 0) - (a.uebertragen ?? 0));
const schriftenSumme = { dateien: schriften.length, uebertragen: schriften.reduce((a, d) => a + (d.uebertragen ?? 0), 0), roh: schriften.reduce((a, d) => a + (d.roh ?? 0), 0), gzip: schriften.reduce((a, d) => a + (d.gzip ?? 0), 0) };
const js = proUrl(['script']).sort((a, b) => (b.gzip ?? 0) - (a.gzip ?? 0));
const css = proUrl(['stylesheet']).sort((a, b) => (b.gzip ?? 0) - (a.gzip ?? 0));
const svgDateien = proUrl(['svg']).sort((a, b) => (b.gzip ?? 0) - (a.gzip ?? 0)).map((d) => ({ ...d, budget: svgUrteil(d.roh, d.gzip) }));
// Inline-SVG global nach Auszeichnung (Hash) zusammenfassen
const inlineMap = new Map();
for (const s of seitenErgebnis) for (const e of s.inlineSvg.elemente) {
  const k = inlineMap.get(e.hash) ?? { hash: e.hash, bytes: e.bytes, gzip: e.gzip, breite: e.breite, hoehe: e.hoehe, kennung: e.kennung, ort: e.ort, vorkommen: 0, seiten: [] };
  k.vorkommen += 1;
  if (!k.seiten.includes(s.slug)) k.seiten.push(s.slug);
  inlineMap.set(e.hash, k);
}
const inlineGlobal = [...inlineMap.values()].sort((a, b) => b.bytes - a.bytes);

/**
 * SVG-Urteil. Icon-Budget (≤ 1,5 KB) auf die rohe Größe, Illustrations-Budget (≤ 40 KB) auf die gzip-Größe gerechnet.
 * Ob eine Datei Icon oder Illustration ist, steht nicht in ihr (OFFENE FRAGE im Bericht), daher beide Urteile in einem Text.
 */
function svgUrteil(rohBytes, gzipBytes) {
  if (rohBytes == null || gzipBytes == null) return 'unbekannt';
  if (rohBytes <= BUDGET.iconSvgKB * KB) return 'Icon ok';
  if (gzipBytes <= BUDGET.illustrationSvgGzipKB * KB) return 'nur als Illustration im Budget (als Icon über 1,5 KB)';
  return 'über Budget (auch als Illustration > 40 KB gzip)';
}
const inlineUrteil = (bytes) => (bytes <= BUDGET.iconSvgKB * KB ? 'Icon ok' : 'über Icon-Budget (nur als Illustration zulässig)');

const global = {
  schriften: { ...schriftenSumme, budgetKB: BUDGET.schriftenGesamtKB, urteil: schriftenSumme.uebertragen <= BUDGET.schriftenGesamtKB * KB ? 'ok' : 'über Budget', dateienListe: schriften },
  jsTop10: js.slice(0, 10),
  jsGesamt: { dateien: js.length, uebertragen: js.reduce((a, d) => a + (d.uebertragen ?? 0), 0), roh: js.reduce((a, d) => a + (d.roh ?? 0), 0), gzip: js.reduce((a, d) => a + (d.gzip ?? 0), 0) },
  css: { dateien: css.length, uebertragen: css.reduce((a, d) => a + (d.uebertragen ?? 0), 0), roh: css.reduce((a, d) => a + (d.roh ?? 0), 0), gzip: css.reduce((a, d) => a + (d.gzip ?? 0), 0), liste: css },
  svgAntworten: svgDateien,
  inlineSvg: { eindeutig: inlineGlobal.length, summeAlleSeiten: seitenErgebnis.reduce((a, s) => a + s.inlineSvg.anzahl, 0), ueberIconBudgetEindeutig: inlineGlobal.filter((e) => e.bytes > BUDGET.iconSvgKB * KB).length, liste: inlineGlobal.map((e) => ({ ...e, budget: inlineUrteil(e.bytes) })) },
};

const erstellt = new Date();
const bericht = {
  label, base, erstellt: erstellt.toISOString(), dauerSekunden: Math.round((Date.now() - t0) / 1000), node: process.version,
  bedingungen: { ansicht: 'd1440 (1440×900)', schema: 'hell', bewegung: motion, zwischenspeicher: 'kalt, je Seite ein neuer Kontext', warten: 'networkidle, danach schrittweises Durchscrollen', uebertragen: 'Antwort-Body in Byte wie übertragen (ohne Kopfzeilen), Playwright request.sizes()', gzip: 'zlib.gzipSync Stufe 9 auf dem entpackten Body', kilobyte: '1 KB = 1024 Byte', nurEigenerHost: ownHost },
  budget: BUDGET,
  seiten: seitenErgebnis.map(({ gesperrt, ...rest }) => ({ ...rest, gesperrteAnfragen: gesperrt.length, gesperrtListe: gesperrt })),
  global,
};
await fs.writeFile(path.join(outDir, 'groessen.json'), JSON.stringify(bericht, null, 2));

// ---------- Markdown ----------
const fmt = (x, d = 0) => (x == null || !Number.isFinite(x) ? '–' : x.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }));
const kb = (b, d = 1) => fmt(b == null ? null : b / KB, d);
const kurz = (u) => new URL(u).pathname.replace(/^\/_next\/static\//, '…/').slice(-70);
const md = [];
const datum = erstellt.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });
md.push(`# Größen je Seite · ${label}`, '');
md.push(`- Datum: ${datum} (Europe/Berlin) · Basis: ${base} (Produktions-Build)`);
md.push(`- Ansicht d1440 (1440×900), hell, Bewegung ${motion}; je Seite neuer Kontext (kalter Zwischenspeicher); Laden bis networkidle, danach schrittweises Durchscrollen`);
md.push('- übertragen = Body-Bytes über die Leitung (ohne Kopfzeilen) · roh = entpackt · gzip = `zlib.gzipSync` Stufe 9 auf dem Body · 1 KB = 1024 Byte');
md.push('- Next-Prefetch (`?_rsc=`, Seitenwechsel-Vorabrufe der Links) wird als eigener Typ geführt und gehört zur Summe (Spalte „ohne Prefetch“ lässt ihn weg, er schwankt von Lauf zu Lauf); „nach Scrollen“ = erst nach dem Durchscrollen geladen');
md.push('- Nur Antworten des eigenen Hosts; Tracking-Attrappen und gesperrte Fremdanfragen zählen nicht zum Gewicht (Anzahl je Seite in der JSON: `gesperrteAnfragen`)');
md.push(`- Budgets (K-013): Schriften gesamt ≤ ${BUDGET.schriftenGesamtKB} KB · Icon-SVG ≤ ${fmt(BUDGET.iconSvgKB, 1)} KB (auf die rohe Größe gerechnet) · Illustrations-SVG ≤ ${BUDGET.illustrationSvgGzipKB} KB gzip · Bewegungs-JS ≤ ${BUDGET.bewegungsJsGzipKB} KB gzip (nicht abgrenzbar, siehe unten)`, '');

md.push('## Global', '');
md.push(`### Schriften (eindeutige Dateien) · Summe ${kb(global.schriften.uebertragen)} KB übertragen · Budget ≤ ${BUDGET.schriftenGesamtKB} KB · ${global.schriften.urteil}`, '');
md.push('| Datei | Typ | übertragen KB | roh KB | gzip KB | Seiten |', '|---|---|---:|---:|---:|---:|');
for (const f of schriften) md.push(`| \`${kurz(f.url)}\` | ${f.contentType ?? '–'} | ${kb(f.uebertragen)} | ${kb(f.roh)} | ${kb(f.gzip)} | ${f.seiten.length} |`);
if (!schriften.length) md.push('| (keine Schriftdateien) | | | | | |');
md.push('', `### Größte JavaScript-Dateien (Top 10 von ${js.length}, nach gzip)`, '');
md.push('| Datei | übertragen KB | roh KB | gzip KB | Kodierung | Seiten |', '|---|---:|---:|---:|---|---:|');
for (const f of global.jsTop10) md.push(`| \`${kurz(f.url)}\` | ${kb(f.uebertragen)} | ${kb(f.roh)} | ${kb(f.gzip)} | ${f.kodierung} | ${f.seiten.length} |`);
md.push('', `JavaScript gesamt (eindeutig, alle Seiten): ${js.length} Dateien · ${kb(global.jsGesamt.uebertragen)} KB übertragen · ${kb(global.jsGesamt.gzip)} KB gzip. Budget „Bewegungs-JS ≤ ${BUDGET.bewegungsJsGzipKB} KB gzip“: nicht prüfbar, die Dateien tragen keine Kennzeichnung, welcher Anteil Bewegung ist.`);
md.push('', `### CSS (eindeutige Dateien) · ${css.length} Dateien · ${kb(global.css.uebertragen)} KB übertragen · ${kb(global.css.gzip)} KB gzip`, '');
if (css.length) {
  md.push('| Datei | übertragen KB | roh KB | gzip KB | Seiten |', '|---|---:|---:|---:|---:|');
  for (const f of css) md.push(`| \`${kurz(f.url)}\` | ${kb(f.uebertragen)} | ${kb(f.roh)} | ${kb(f.gzip)} | ${f.seiten.length} |`);
}
md.push('', `### SVG-Antworten (als Datei geladen) · ${svgDateien.length}`, '');
if (svgDateien.length) {
  md.push('| Datei | roh KB | gzip KB | Seiten | Budget (Icon auf roh, Illustration auf gzip) |', '|---|---:|---:|---:|---|');
  for (const f of svgDateien) md.push(`| \`${kurz(f.url)}\` | ${kb(f.roh, 2)} | ${kb(f.gzip, 2)} | ${f.seiten.length} | ${f.budget} |`);
} else md.push('Keine SVG-Dateien über das Netz geladen.');
md.push('', `### Inline-\`<svg>\` im DOM · ${global.inlineSvg.summeAlleSeiten} Elemente auf allen Seiten, ${global.inlineSvg.eindeutig} eindeutige Auszeichnungen, davon ${global.inlineSvg.ueberIconBudgetEindeutig} über 1,5 KB`, '');
md.push('Größe = UTF-8-Byte der serialisierten Auszeichnung im DOM nach dem Laden (kann vom Quelltext des Servers geringfügig abweichen).', '');
if (inlineGlobal.length) {
  md.push('| Kennung | Ort | gezeigt px | Bytes | gzip Bytes | Vorkommen | Seiten | Budget |', '|---|---|---|---:|---:|---:|---:|---|');
  for (const e of inlineGlobal.slice(0, 15)) md.push(`| ${e.kennung ? `\`${String(e.kennung).replace(/\|/g, '\\|').slice(0, 40)}\`` : '–'} | \`${e.ort}\` | ${e.breite}×${e.hoehe} | ${fmt(e.bytes)} | ${fmt(e.gzip)} | ${e.vorkommen} | ${e.seiten.length} | ${inlineUrteil(e.bytes)} |`);
  if (inlineGlobal.length > 15) md.push(`| … ${inlineGlobal.length - 15} weitere eindeutige (vollständig in der JSON) | | | | | | | |`);
}

md.push('', '## Je Seite', '');
md.push('Übersicht (übertragen KB, Dateien in Klammern):', '');
md.push(`| Seite | Status | Dokument | JS | CSS | Schriften | SVG-Dateien | Bilder | Prefetch (_rsc) | Sonstiges | Summe KB | ohne Prefetch KB | JS gzip KB | davon nach Scrollen KB | inline-SVG | Schriften-Budget |`);
md.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|');
for (const s of seitenErgebnis) {
  const z = s.summe;
  const c = (t) => `${kb(z[t].uebertragen)} (${z[t].dateien})`;
  const nach = TYPEN.reduce((a, t) => a + z[t].nachScrollen, 0);
  const fontUrteil = z.font.uebertragen <= BUDGET.schriftenGesamtKB * KB ? 'ok' : 'über Budget';
  md.push(`| ${s.pfad} | ${s.status || 'Fehler'} | ${c('document')} | ${c('script')} | ${c('stylesheet')} | ${c('font')} | ${c('svg')} | ${c('image')} | ${c('rsc')} | ${c('andere')} | ${kb(s.gesamt.uebertragen)} | ${kb(s.gesamt.uebertragen - z.rsc.uebertragen)} | ${kb(z.script.gzip)} | ${kb(nach)} | ${s.inlineSvg.anzahl} | ${fontUrteil} |`);
}
for (const s of seitenErgebnis) {
  md.push('', `### ${s.pfad} (${s.slug})${s.fehler ? ` · FEHLER: ${s.fehler}` : ''}`, '');
  md.push('| Typ | Dateien | übertragen KB | roh KB | gzip KB | Budget |', '|---|---:|---:|---:|---:|---|');
  for (const t of TYPEN) {
    const z = s.summe[t];
    if (!z.dateien) continue;
    let bud = '–';
    if (t === 'font') bud = z.uebertragen <= BUDGET.schriftenGesamtKB * KB ? `ok (≤ ${BUDGET.schriftenGesamtKB} KB)` : `über Budget (> ${BUDGET.schriftenGesamtKB} KB)`;
    if (t === 'svg') {
      const grosse = s.dateien.filter((d) => d.typ === 'svg' && (d.gzip ?? 0) > BUDGET.illustrationSvgGzipKB * KB).length;
      const ueberIcon = s.dateien.filter((d) => d.typ === 'svg' && (d.roh ?? 0) > BUDGET.iconSvgKB * KB).length;
      bud = grosse ? `${grosse} Datei(en) über 40 KB gzip` : ueberIcon ? `${ueberIcon} Datei(en) über Icon-Budget 1,5 KB roh` : 'alle ≤ 1,5 KB roh';
    }
    if (t === 'script') bud = `Bewegungs-JS nicht abgrenzbar`;
    md.push(`| ${TYPNAME[t]} | ${z.dateien} | ${kb(z.uebertragen)} | ${kb(z.roh)} | ${kb(z.gzip)} | ${bud} |`);
  }
  md.push(`| **Summe** | ${s.gesamt.dateien} | ${kb(s.gesamt.uebertragen)} | ${kb(s.gesamt.roh)} | ${kb(s.gesamt.gzip)} | |`);
  md.push('', `Inline-\`<svg>\` im DOM: ${s.inlineSvg.anzahl} (zusammen ${fmt(s.inlineSvg.bytes)} Byte, ${fmt(s.inlineSvg.gzip)} Byte gzip einzeln gerechnet; ${s.inlineSvg.ueberIconBudget} über 1,5 KB).`);
  if (s.mehrfachGeladen?.length) md.push(`Mehrfach geladene Adressen: ${s.mehrfachGeladen.length} (${s.mehrfachGeladen.slice(0, 4).map((m) => `${kurz(base + m.adresse.split('?')[0])}${m.adresse.includes('?') ? '?…' : ''} ×${m.anzahl}`).join(', ')}${s.mehrfachGeladen.length > 4 ? ', …' : ''}).`);
  if (s.gesperrt?.length) md.push(`Gesperrte oder umgeleitete Anfragen: ${s.gesperrt.length}.`);
}
md.push('', `Einzeldateien je Seite stehen in \`_relaunch/belege/${label}/groessen.json\` (Feld \`seiten[].dateien\`).`, '');
await fs.writeFile(path.join(outDir, 'groessen.md'), md.join('\n'));

const fehlerSeiten = seitenErgebnis.filter((s) => s.fehler).length;
console.log(`\nFERTIG ${seitenErgebnis.length} Seiten in ${bericht.dauerSekunden} s · Schriften gesamt ${kb(schriftenSumme.uebertragen)} KB (${global.schriften.urteil}) · SVG-Dateien ${svgDateien.length} · inline-SVG eindeutig ${inlineGlobal.length} · Fehler ${fehlerSeiten} → ${path.relative(ROOT, outDir)}/groessen.{json,md}`);
if (fehlerSeiten) process.exitCode = 1;
