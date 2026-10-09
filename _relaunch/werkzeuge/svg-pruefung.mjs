// SVG-Prüfung (Ebene 8 · Konsistenz, Z-10): inline-SVGs im DOM jeder Grundmengen-Seite und alle .svg-Dateien des Repositorys.
//
// Aufruf: node svg-pruefung.mjs --base http://localhost:3500 --label P0-SLOP-01 [--only start,stellen] [--dirs public,components]
//
// Teil 1 (Browser, d1440 hell, Bewegung 'no-preference', nach schrittweisem Durchscrollen) – je inline-<svg>:
//   viewBox? · Breite/Höhe (Attribut und gerendert) · Zugänglichkeit (aria-hidden | role="img"+Name | fehlt) · Strichstärken
//   (Attribut, berechnet, effektiv in px) · Füllungen und Striche (currentColor/Variable vs. fester Farbwert) · Quelle
//   (Klasse lucide/lucide-* = Bibliothek) · Größe roh/gzip (Icon-Budget ≤ 1,5 KB roh) · alle id-Attribute → Dubletten im DOM,
//   nicht auflösbare Verweise (url(#…), href="#…", aria-labelledby).
// Teil 2 (Dateien) – je .svg unter public/ und components/: Größe roh/gzip, viewBox, <image>, Bitmaps als data:-URI,
//   Text als <text> oder (Heuristik) als Pfad, Fixpunkt-Prüfung mit der passenden SVGO-Konfiguration.
// Ausgabe: _relaunch/belege/<label>/svg.json und svg.md · Rohdaten (Ausschnitte der Elemente): _relaunch/.roh/<label>/
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { optimize } from 'svgo';
import { GRUNDMENGE, VIEWPORTS, collectErrors, launch, newContext, scrollThrough } from './lib/browser.mjs';
import staticDefault, { staticConfig } from './svgo.static.config.mjs';
import { animiertConfig } from './svgo.animiert.config.mjs';

const WERKZEUGE = import.meta.dirname;
const ROOT = path.resolve(WERKZEUGE, '..');
const REPO = path.resolve(ROOT, '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]]] : acc), []));
const base = args.base ?? 'http://localhost:3500';
const label = args.label ?? 'lauf';
const only = args.only ? args.only.split(',') : null;
const dirs = (args.dirs ?? 'public,components').split(',');
const ICON_BUDGET_BYTES = 1536; // K-013: Icon-SVG ≤ 1,5 KB (roh)
const ILLU_BUDGET_GZIP = 40 * 1024; // K-013: Illustrations-SVG ≤ 40 KB gzip
const gz = (s) => zlib.gzipSync(Buffer.from(s), { level: 9 }).length;

const outDir = path.join(ROOT, 'belege', label);
const rawDir = path.join(ROOT, '.roh', label);
await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(rawDir, { recursive: true });

// ───────────────────────────── Teil 1: DOM ─────────────────────────────
/** Läuft im Browser. */
function inspiziereSvgs() {
  const FEST = (v) => {
    const s = (v || '').trim().toLowerCase();
    if (!s) return null;
    if (['none', 'currentcolor', 'inherit', 'transparent', 'context-fill', 'context-stroke', 'initial', 'unset'].includes(s)) return null;
    if (s.startsWith('var(') || s.startsWith('url(')) return null;
    return v.trim();
  };
  const klasse = (v) => {
    const s = (v || '').trim().toLowerCase();
    if (!s) return 'ohne';
    if (s === 'none') return 'none';
    if (s === 'currentcolor') return 'currentColor';
    if (s.startsWith('var(')) return 'variable';
    if (s.startsWith('url(')) return 'verweis';
    if (['inherit', 'transparent', 'context-fill', 'context-stroke', 'initial', 'unset'].includes(s)) return s;
    return 'fest';
  };
  const pfad = (el) => {
    const teile = [];
    let n = el;
    while (n && n.nodeType === 1 && teile.length < 5 && n !== document.body) {
      let t = n.tagName.toLowerCase();
      if (n.id && !/^[:_]/.test(n.id)) { teile.unshift(`${t}#${n.id}`); break; }
      const cls = typeof n.className === 'string' ? n.className : n.className?.baseVal || '';
      const erste = cls.split(/\s+/).filter((c) => c && !/[:[\]/]/.test(c)).slice(0, 2).join('.');
      if (erste) t += `.${erste}`;
      const sib = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n.tagName) : [];
      if (sib.length > 1) t += `:nth-of-type(${sib.indexOf(n) + 1})`;
      teile.unshift(t);
      n = n.parentElement;
    }
    return teile.join(' > ');
  };
  const idZaehler = new Map();
  for (const el of document.querySelectorAll('[id]')) idZaehler.set(el.id, (idZaehler.get(el.id) || 0) + 1);
  const svgs = [...document.querySelectorAll('svg')];
  const referenzRe = /url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/g;
  const out = [];
  svgs.forEach((svg, index) => {
    const klassen = (svg.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    const alle = [svg, ...svg.querySelectorAll('*')];
    const rect = svg.getBoundingClientRect();
    const vb = svg.getAttribute('viewBox');
    const vbTeile = vb ? vb.trim().split(/[\s,]+/).map(Number) : null;
    const attrSW = new Set();
    const berSW = new Set();
    const effSW = new Set();
    const striche = {};
    const fuell = {};
    const festeFarben = new Set();
    const berFarben = new Set();
    const ids = [];
    const verweise = [];
    let formen = 0;
    const vbBreite = vbTeile && vbTeile[2] > 0 ? vbTeile[2] : null;
    const skala = vbBreite && rect.width > 0 ? rect.width / vbBreite : null;
    for (const el of alle) {
      const tag = el.tagName.toLowerCase();
      if (el.id) ids.push({ id: el.id, element: tag, imDokument: idZaehler.get(el.id) || 0 });
      for (const attr of el.attributes) {
        const wert = attr.value;
        if (/^(?:xlink:)?href$/.test(attr.name) && wert.startsWith('#')) verweise.push({ art: 'href', id: wert.slice(1) });
        if (attr.name === 'aria-labelledby' || attr.name === 'aria-describedby') wert.split(/\s+/).filter(Boolean).forEach((i) => verweise.push({ art: attr.name, id: i }));
        for (const m of wert.matchAll(referenzRe)) verweise.push({ art: `${attr.name}:url`, id: m[1] });
      }
      if (['title', 'desc', 'defs', 'style', 'script', 'metadata', 'symbol', 'g', 'svg', 'use', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask', 'filter'].includes(tag)) {
        if (tag === 'style') { /* eigene Regeln werden nicht ausgewertet */ }
      } else formen += 1;
      const swAttr = el.getAttribute('stroke-width');
      if (swAttr != null) attrSW.add(swAttr.trim());
      const st = el.getAttribute('style') || '';
      const swStil = /stroke-width\s*:\s*([^;]+)/.exec(st);
      if (swStil) attrSW.add(`${swStil[1].trim()} (style)`);
      const cs = getComputedStyle(el);
      const zeichnet = !['title', 'desc', 'defs', 'style', 'script', 'metadata', 'symbol', 'g', 'svg', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask', 'filter', 'use'].includes(tag);
      if (zeichnet && cs.stroke && cs.stroke !== 'none') {
        const w = parseFloat(cs.strokeWidth);
        if (!Number.isNaN(w)) {
          berSW.add(w);
          const nonScaling = cs.vectorEffect === 'non-scaling-stroke';
          effSW.add(Math.round((nonScaling ? w : skala ? w * skala : w) * 100) / 100);
        }
        berFarben.add(cs.stroke);
      }
      if (zeichnet && cs.fill && cs.fill !== 'none') berFarben.add(cs.fill);
      for (const [name, wert] of [['stroke', el.getAttribute('stroke') || (/(?:^|;)\s*stroke\s*:\s*([^;]+)/.exec(st) || [])[1]], ['fill', el.getAttribute('fill') || (/(?:^|;)\s*fill\s*:\s*([^;]+)/.exec(st) || [])[1]]]) {
        if (wert == null) continue;
        const k = klasse(wert);
        (name === 'stroke' ? striche : fuell)[k] = ((name === 'stroke' ? striche : fuell)[k] || 0) + 1;
        const f = FEST(wert);
        if (f) festeFarben.add(f);
      }
    }
    const titel = svg.querySelector(':scope > title');
    const aria = {
      hidden: svg.getAttribute('aria-hidden'),
      role: svg.getAttribute('role'),
      label: svg.getAttribute('aria-label'),
      labelledby: svg.getAttribute('aria-labelledby'),
      title: titel ? (titel.textContent || '').trim() : null,
      desc: svg.querySelector(':scope > desc')?.textContent?.trim() || null,
      focusable: svg.getAttribute('focusable'),
    };
    let nameAufgeloest = null;
    if (aria.labelledby) nameAufgeloest = aria.labelledby.split(/\s+/).map((i) => document.getElementById(i)?.textContent?.trim() || '').filter(Boolean).join(' ') || null;
    const versteckt = svg.closest('[aria-hidden="true"]') !== null;
    let a11y;
    let a11yGrund = '';
    if (aria.hidden === 'true') a11y = 'dekorativ';
    else if (versteckt) { a11y = 'dekorativ'; a11yGrund = 'über aria-hidden-Vorfahr'; }
    else if (aria.role === 'img') {
      const name = aria.label || nameAufgeloest || aria.title;
      if (name) a11y = 'bedeutungstragend'; else { a11y = 'fehlerhaft'; a11yGrund = 'role="img" ohne Namen'; }
      if (aria.labelledby && !nameAufgeloest) { a11y = 'fehlerhaft'; a11yGrund = 'aria-labelledby ohne auflösbaren Text'; }
    } else if (aria.label || aria.title) { a11y = 'fehlerhaft'; a11yGrund = 'Name ohne role="img"'; }
    else { a11y = 'fehlt'; a11yGrund = 'weder aria-hidden noch role="img"+Name'; }
    const html = svg.outerHTML;
    const istSprite = svg.querySelector('symbol') !== null;
    const imLink = svg.closest('a,button') ? svg.closest('a,button').tagName.toLowerCase() : null;
    const aufgeloest = verweise.map((v) => ({ ...v, vorhanden: idZaehler.get(v.id) || 0 }));
    out.push({
      index,
      fundstelle: pfad(svg),
      quelle: klassen.some((c) => c === 'lucide' || c.startsWith('lucide-')) ? 'lucide' : 'eigen',
      klassen: klassen.slice(0, 8),
      viewBox: vb,
      hatViewBox: !!vb,
      viewBoxMasse: vbTeile && vbTeile.length === 4 ? [vbTeile[2], vbTeile[3]] : null,
      attrBreite: svg.getAttribute('width'),
      attrHoehe: svg.getAttribute('height'),
      gerendert: { breite: Math.round(rect.width * 10) / 10, hoehe: Math.round(rect.height * 10) / 10 },
      sichtbar: rect.width > 0 && rect.height > 0 && getComputedStyle(svg).display !== 'none',
      aria,
      namenAufgeloest: nameAufgeloest,
      a11y,
      a11yGrund,
      imInteraktiven: imLink,
      strichAttribute: [...attrSW],
      strichBerechnet: [...berSW].sort((a, b) => a - b),
      strichEffektivPx: [...effSW].sort((a, b) => a - b),
      strichFarbe: striche,
      fuellFarbe: fuell,
      festeFarben: [...festeFarben],
      berechneteFarben: [...berFarben].slice(0, 6),
      formen,
      ids,
      verweise: aufgeloest,
      istSprite,
      bytesRoh: new TextEncoder().encode(html).length,
      html,
    });
  });
  const uses = [...document.querySelectorAll('use')].map((u) => u.getAttribute('href') || u.getAttribute('xlink:href') || '');
  const imgSvg = [...document.querySelectorAll('img')].filter((i) => /\.svg(\?|$)|image\/svg/.test(i.currentSrc || i.src)).map((i) => ({ fundstelle: pfad(i), src: i.currentSrc || i.src, alt: i.getAttribute('alt') }));
  const cssSvg = [];
  for (const el of document.querySelectorAll('*')) {
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && /url\(.*svg/i.test(bg)) cssSvg.push({ fundstelle: pfad(el), bild: bg.slice(0, 120) });
    if (cssSvg.length >= 20) break;
  }
  const alleIds = [...idZaehler.entries()].filter(([, n]) => n > 1).map(([id, n]) => ({ id, anzahl: n }));
  return { svgs: out, uses, imgSvg, cssSvg, doppelteIdsImDokument: alleIds };
}

const browser = await launch();
const vp = VIEWPORTS.find((v) => v.name === 'd1440');
const seiten = [];
const rohProbe = [];
for (const p of GRUNDMENGE) {
  if (only && !only.includes(p.slug)) continue;
  const { context, requestLog } = await newContext(browser, { origin: base, viewport: vp, colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const fehler = collectErrors(page);
  try {
    const res = await page.goto(base + p.path, { waitUntil: 'networkidle', timeout: 45_000 });
    await page.evaluate(() => document.fonts?.ready);
    await scrollThrough(page);
    await page.waitForTimeout(400);
    const r = await page.evaluate(inspiziereSvgs);
    for (const s of r.svgs) {
      s.bytesGzip = gz(s.html);
      s.istIcon = s.quelle === 'lucide' || (s.viewBoxMasse ? Math.max(...s.viewBoxMasse) <= 32 : false);
      s.budgetIcon = s.istIcon ? s.bytesRoh <= ICON_BUDGET_BYTES : null;
      s.budgetIllustration = s.istIcon ? null : s.bytesGzip <= ILLU_BUDGET_GZIP;
      rohProbe.push({ seite: p.slug, fundstelle: s.fundstelle, html: s.html.slice(0, 1500) });
      delete s.html;
    }
    seiten.push({ pfad: p.path, slug: p.slug, status: res?.status() ?? 0, svgs: r.svgs, uses: r.uses, imgSvg: r.imgSvg, cssSvg: r.cssSvg, doppelteIdsImDokument: r.doppelteIdsImDokument, fehler, gesperrt: requestLog.length });
    process.stdout.write(`${res?.status()} ${p.slug}: ${r.svgs.length} inline-SVG${r.doppelteIdsImDokument.length ? `, ${r.doppelteIdsImDokument.length} doppelte IDs` : ''}\n`);
  } catch (err) {
    seiten.push({ pfad: p.path, slug: p.slug, status: 0, fehler: [...fehler, { kind: 'lauf', text: String(err) }], svgs: [] });
    process.stdout.write(`FEHLER ${p.slug}: ${err}\n`);
  }
  await context.close();
}
await browser.close();

// ───────────────────────────── Teil 2: Dateien ─────────────────────────────
async function* svgDateien(dir) {
  let eintraege = [];
  try { eintraege = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of eintraege) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '__tests__') continue;
    const voll = path.join(dir, e.name);
    if (e.isDirectory()) yield* svgDateien(voll);
    else if (/\.svg$/i.test(e.name)) yield voll;
  }
}
const ANIMIERT_RE = /<animate|<set\b|<style|<script|@keyframes|data-motion|<animateTransform|<animateMotion|pathLength/i;
const dateien = [];
for (const d of dirs) for await (const f of svgDateien(path.join(REPO, d))) {
  const text = await fs.readFile(f, 'utf8');
  const rel = path.relative(REPO, f);
  const roh = Buffer.byteLength(text);
  const vb = /viewBox\s*=\s*["']([^"']+)["']/.exec(text)?.[1] ?? null;
  const bitmapsImage = (text.match(/<image\b/gi) || []).length;
  const bitmapsData = (text.match(/data:image\/(?:png|jpe?g|webp|gif|avif)/gi) || []).length;
  const textElemente = (text.match(/<text\b/gi) || []).length;
  const pfade = (text.match(/<path\b/gi) || []).length;
  const hinweisTextPfad = textElemente === 0 && pfade >= 6 && /logo|wort|marke|schrift|typo|text|claim|headline/i.test(path.basename(f));
  const animiert = ANIMIERT_RE.test(text);
  const festeFarben = [...new Set((text.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g) || []).map((c) => c.toLowerCase()))];
  const schriftfamilien = [...new Set([...text.matchAll(/font-family\s*[=:]\s*["']?([^"';]+)/g)].map((m) => m[1].trim()))];
  const cfg = animiert ? animiertConfig({ svg: text }) : staticConfig({}, { svg: text });
  const cfgStandard = animiert ? animiertConfig() : staticDefault;
  let ergebnis = null;
  let fehlerText = null;
  try {
    const norm = (s) => s.replace(/\s+$/, '');
    const o1 = optimize(text, { path: f, ...cfg });
    const o2 = optimize(o1.data, { path: f, ...cfg });
    const oStd = optimize(text, { path: f, ...cfgStandard });
    ergebnis = {
      fixpunkt: norm(o1.data) === norm(text),
      fixpunktStandardkonfiguration: norm(oStd.data) === norm(text),
      idempotent: norm(o2.data) === norm(o1.data),
      bytesNachSvgo: Buffer.byteLength(o1.data),
      ersparnisBytes: roh - Buffer.byteLength(o1.data),
      ersparnisProzent: Math.round((1 - Buffer.byteLength(o1.data) / roh) * 1000) / 10,
    };
    await fs.writeFile(path.join(rawDir, `svgo-${rel.replace(/[\\/]/g, '__')}`), o1.data);
  } catch (e) { fehlerText = String(e?.message ?? e); }
  const istIcon = vb ? Math.max(...vb.trim().split(/[\s,]+/).map(Number).slice(2)) <= 32 : false;
  dateien.push({
    datei: rel,
    bytesRoh: roh,
    bytesGzip: gz(text),
    viewBox: vb,
    hatViewBox: !!vb,
    istIcon,
    budgetOk: istIcon ? roh <= ICON_BUDGET_BYTES : gz(text) <= ILLU_BUDGET_GZIP,
    eingebetteteBitmaps: { imageElemente: bitmapsImage, dataUri: bitmapsData },
    textElemente,
    pfadElemente: pfade,
    textAlsPfadVermutet: hinweisTextPfad,
    festeFarben,
    schriftfamilien,
    animiert,
    konfiguration: animiert ? 'animiert' : 'statisch',
    svgo: ergebnis,
    svgoFehler: fehlerText,
  });
}

// ───────────────────────────── Auswertung ─────────────────────────────
const alleSvgs = seiten.flatMap((s) => s.svgs.map((v) => ({ seite: s.slug, ...v })));
const icons = alleSvgs.filter((s) => s.istIcon);
const zaehle = (liste, f) => liste.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const verteilung = (liste, f) => Object.fromEntries(Object.entries(zaehle(liste, f)).sort((a, b) => b[1] - a[1]));
const einzigartig = (liste, f) => [...new Set(liste.flatMap(f))];
const idKollisionen = [];
for (const s of seiten) {
  for (const v of s.svgs) for (const i of v.ids) if (i.imDokument > 1) idKollisionen.push({ seite: s.slug, fundstelle: v.fundstelle, id: i.id, anzahlImDokument: i.imDokument });
}
const verweiseKaputt = [];
for (const s of seiten) for (const v of s.svgs) for (const r of v.verweise) if (r.vorhanden !== 1) verweiseKaputt.push({ seite: s.slug, fundstelle: v.fundstelle, art: r.art, id: r.id, vorhanden: r.vorhanden });
const zusammenfassung = {
  seiten: seiten.length,
  inlineSvgGesamt: alleSvgs.length,
  inlineSvgSichtbar: alleSvgs.filter((s) => s.sichtbar).length,
  proSeite: Object.fromEntries(seiten.map((s) => [s.slug, s.svgs.length])),
  quelle: verteilung(alleSvgs, (s) => s.quelle),
  ohneViewBox: alleSvgs.filter((s) => !s.hatViewBox).length,
  zugaenglichkeit: verteilung(alleSvgs, (s) => s.a11y),
  zugaenglichkeitNichtOk: alleSvgs.filter((s) => ['fehlt', 'fehlerhaft'].includes(s.a11y)).length,
  viewBoxMasseIcons: verteilung(icons, (s) => (s.viewBoxMasse ? s.viewBoxMasse.join('x') : 'ohne')),
  strichAttributeAlle: verteilung(alleSvgs.flatMap((s) => s.strichAttribute), (x) => x),
  strichBerechnetIcons: verteilung(icons.flatMap((s) => s.strichBerechnet), (x) => x),
  strichEffektivPxIcons: verteilung(icons.flatMap((s) => s.strichEffektivPx), (x) => x),
  anzahlStrichstaerkenBerechnetIcons: einzigartig(icons, (s) => s.strichBerechnet).length,
  anzahlStrichstaerkenEffektivPxIcons: einzigartig(icons, (s) => s.strichEffektivPx).length,
  festeFarben: einzigartig(alleSvgs, (s) => s.festeFarben),
  svgMitFestenFarben: alleSvgs.filter((s) => s.festeFarben.length).length,
  iconBudgetUeberschritten: icons.filter((s) => s.budgetIcon === false).length,
  illustrationBudgetUeberschritten: alleSvgs.filter((s) => s.budgetIllustration === false).length,
  idKollisionenImDom: idKollisionen.length,
  verweiseNichtEindeutigAufloesbar: verweiseKaputt.length,
  doppelteIdsImDokumentGesamt: seiten.reduce((n, s) => n + (s.doppelteIdsImDokument?.length ?? 0), 0),
  useVerweise: seiten.reduce((n, s) => n + (s.uses?.length ?? 0), 0),
  svgAlsImg: seiten.reduce((n, s) => n + (s.imgSvg?.length ?? 0), 0),
  svgAlsCssHintergrund: seiten.reduce((n, s) => n + (s.cssSvg?.length ?? 0), 0),
  dateien: {
    anzahl: dateien.length,
    fixpunkt: dateien.filter((d) => d.svgo?.fixpunkt).length,
    keinFixpunkt: dateien.filter((d) => d.svgo && !d.svgo.fixpunkt).length,
    keinFixpunktStandardkonfiguration: dateien.filter((d) => d.svgo && !d.svgo.fixpunktStandardkonfiguration).length,
    ohneViewBox: dateien.filter((d) => !d.hatViewBox).length,
    mitEingebettetemBitmap: dateien.filter((d) => d.eingebetteteBitmaps.imageElemente + d.eingebetteteBitmaps.dataUri > 0).length,
    textAlsPfadVermutet: dateien.filter((d) => d.textAlsPfadVermutet).length,
    budgetUeberschritten: dateien.filter((d) => !d.budgetOk).length,
  },
};
const bericht = {
  label, base, erstellt: new Date().toISOString(),
  bedingungen: { ansicht: 'd1440 hell', bewegung: 'no-preference', gewartet: 'networkidle + scrollThrough + 400 ms', svgo: 'svgo 4.0.0, multipass', budgets: { iconRohBytes: ICON_BUDGET_BYTES, illustrationGzipBytes: ILLU_BUDGET_GZIP } },
  zusammenfassung, idKollisionen, verweiseKaputt, seiten, dateien,
};
await fs.writeFile(path.join(outDir, 'svg.json'), JSON.stringify(bericht, null, 2));
await fs.writeFile(path.join(rawDir, 'svg-inline-roh.json'), JSON.stringify(rohProbe, null, 2));

// ───────────────────────────── Markdown ─────────────────────────────
const L = [];
const z = zusammenfassung;
const tab = (kopf, zeilen) => [`| ${kopf.join(' | ')} |`, `| ${kopf.map(() => '---').join(' | ')} |`, ...zeilen.map((r) => `| ${r.join(' | ')} |`)];
const kv = (o) => Object.entries(o).map(([k, v]) => `${k}: ${v}`).join(' · ') || '–';
L.push(`# SVG-Prüfung · ${label}`, '', `Erstellt ${bericht.erstellt} · Basis ${base}`, `Messbedingungen: ${Object.values({ a: bericht.bedingungen.ansicht, b: `Bewegung ${bericht.bedingungen.bewegung}`, c: bericht.bedingungen.gewartet, d: bericht.bedingungen.svgo }).join(' · ')}`, '');
L.push('## Zählung', '');
L.push(...tab(['Messgröße', 'Wert'], [
  ['Inline-SVG gesamt (sichtbar)', `${z.inlineSvgGesamt} (${z.inlineSvgSichtbar})`],
  ['je Seite', kv(z.proSeite)],
  ['Quelle', kv(z.quelle)],
  ['ohne viewBox', z.ohneViewBox],
  ['Zugänglichkeit', kv(z.zugaenglichkeit)],
  ['Zugänglichkeit nicht in Ordnung (fehlt/fehlerhaft)', z.zugaenglichkeitNichtOk],
  ['viewBox-Maße der Icons', kv(z.viewBoxMasseIcons)],
  ['stroke-width-Attribute (alle SVG)', kv(z.strichAttributeAlle)],
  ['stroke-width berechnet (Icons, Einheiten der viewBox)', kv(z.strichBerechnetIcons)],
  ['stroke-width effektiv in px (Icons)', kv(z.strichEffektivPxIcons)],
  ['verschiedene Strichstärken berechnet / effektiv (Icons)', `${z.anzahlStrichstaerkenBerechnetIcons} / ${z.anzahlStrichstaerkenEffektivPxIcons}`],
  ['SVG mit festen Farbwerten', `${z.svgMitFestenFarben}${z.festeFarben.length ? ` (${z.festeFarben.join(', ')})` : ''}`],
  ['Icon-Budget (≤ 1,5 KB roh) überschritten', z.iconBudgetUeberschritten],
  ['Illustrations-Budget (≤ 40 KB gzip) überschritten', z.illustrationBudgetUeberschritten],
  ['ID-Kollisionen im DOM (SVG-IDs mit Dublette)', z.idKollisionenImDom],
  ['Verweise ohne genau ein Ziel (url(#…), href, aria-*)', z.verweiseNichtEindeutigAufloesbar],
  ['doppelte IDs im Dokument insgesamt (alle Elemente)', z.doppelteIdsImDokumentGesamt],
  ['<use>-Verweise · SVG als <img> · SVG als CSS-Hintergrund', `${z.useVerweise} · ${z.svgAlsImg} · ${z.svgAlsCssHintergrund}`],
]));
L.push('', '## Seiten', '');
L.push(...tab(['Seite', 'Status', 'inline-SVG', 'lucide', 'eigen', 'ohne viewBox', 'a11y nicht ok', 'doppelte IDs'], seiten.map((s) => [s.pfad, s.status, s.svgs.length, s.svgs.filter((v) => v.quelle === 'lucide').length, s.svgs.filter((v) => v.quelle !== 'lucide').length, s.svgs.filter((v) => !v.hatViewBox).length, s.svgs.filter((v) => ['fehlt', 'fehlerhaft'].includes(v.a11y)).length, s.doppelteIdsImDokument?.length ?? '–'])));
const bef = (titel, liste, spalten, zeile) => {
  L.push('', `## ${titel} (${liste.length})`, '');
  if (!liste.length) { L.push('Keine.'); return; }
  L.push(...tab(spalten, liste.slice(0, 60).map(zeile)));
  if (liste.length > 60) L.push('', `… ${liste.length - 60} weitere in svg.json`);
};
bef('Zugänglichkeit: fehlt oder fehlerhaft', alleSvgs.filter((s) => ['fehlt', 'fehlerhaft'].includes(s.a11y)), ['Seite', 'Fundstelle', 'Befund', 'Quelle'], (s) => [s.seite, `\`${s.fundstelle}\``, s.a11yGrund, s.quelle]);
bef('SVG ohne viewBox', alleSvgs.filter((s) => !s.hatViewBox), ['Seite', 'Fundstelle', 'Quelle'], (s) => [s.seite, `\`${s.fundstelle}\``, s.quelle]);
bef('SVG mit festen Farbwerten', alleSvgs.filter((s) => s.festeFarben.length), ['Seite', 'Fundstelle', 'Farben'], (s) => [s.seite, `\`${s.fundstelle}\``, s.festeFarben.join(', ')]);
bef('ID-Kollisionen', idKollisionen, ['Seite', 'Fundstelle', 'id', 'Anzahl im Dokument'], (k) => [k.seite, `\`${k.fundstelle}\``, `\`${k.id}\``, k.anzahlImDokument]);
bef('Verweise ohne genau ein Ziel', verweiseKaputt, ['Seite', 'Fundstelle', 'Art', 'id', 'Treffer'], (k) => [k.seite, `\`${k.fundstelle}\``, k.art, `\`${k.id}\``, k.vorhanden]);
bef('Budgetüberschreitung Icon', icons.filter((s) => s.budgetIcon === false), ['Seite', 'Fundstelle', 'Bytes roh'], (s) => [s.seite, `\`${s.fundstelle}\``, s.bytesRoh]);
const nichtIconGross = alleSvgs.filter((s) => !s.istIcon);
bef('Nicht-Icon-SVG (Illustrationen u. a.)', nichtIconGross, ['Seite', 'Fundstelle', 'viewBox', 'Bytes roh', 'gzip', 'a11y'], (s) => [s.seite, `\`${s.fundstelle}\``, s.viewBox ?? '–', s.bytesRoh, s.bytesGzip, s.a11y]);
// Icon-Inventar
const inventar = new Map();
for (const s of icons) {
  const k = `${s.quelle}|${s.klassen.filter((c) => c.startsWith('lucide-')).join(',') || s.klassen.join('.') || s.fundstelle}`;
  const e = inventar.get(k) || { quelle: s.quelle, name: s.klassen.filter((c) => c.startsWith('lucide-')).join(',') || s.klassen.join('.') || '(ohne Klasse)', anzahl: 0, seiten: new Set(), strich: new Set(), vb: new Set() };
  e.anzahl += 1; e.seiten.add(s.seite); s.strichAttribute.forEach((x) => e.strich.add(x)); e.vb.add(s.viewBox);
  inventar.set(k, e);
}
L.push('', `## Icon-Inventar im DOM (${inventar.size} verschiedene)`, '');
L.push(...tab(['Quelle', 'Icon', 'Anzahl', 'Seiten', 'stroke-width', 'viewBox'], [...inventar.values()].sort((a, b) => b.anzahl - a.anzahl).map((e) => [e.quelle, `\`${e.name}\``, e.anzahl, e.seiten.size, [...e.strich].join(' / ') || '–', [...e.vb].join(' / ')])));
L.push('', `## SVG-Dateien (${dateien.length})`, '');
L.push(...tab(['Datei', 'roh', 'gzip', 'viewBox', '<image>/data:', '<text> / <path>', 'Konfiguration', 'Fixpunkt', 'Ersparnis SVGO', 'Budget'], dateien.map((d) => [`\`${d.datei}\``, d.bytesRoh, d.bytesGzip, d.viewBox ?? 'FEHLT', `${d.eingebetteteBitmaps.imageElemente}/${d.eingebetteteBitmaps.dataUri}`, `${d.textElemente} / ${d.pfadElemente}${d.textAlsPfadVermutet ? ' (Text als Pfad vermutet)' : ''}`, d.konfiguration, d.svgo ? (d.svgo.fixpunkt ? 'ja' : 'NEIN') : `Fehler: ${d.svgoFehler}`, d.svgo ? `${d.svgo.ersparnisBytes} B (${d.svgo.ersparnisProzent} %)` : '–', d.budgetOk ? 'ok' : 'ÜBER'])));
L.push('', '### Farben und Schriften in den Dateien', '');
L.push(...tab(['Datei', 'feste Farbwerte', 'font-family'], dateien.map((d) => [`\`${d.datei}\``, `${d.festeFarben.length}: ${d.festeFarben.join(', ') || '–'}`, d.schriftfamilien.map((f) => `\`${f.slice(0, 70)}\``).join('; ') || '–'])));
L.push('', '## Hinweise zur Methode', '',
  '- Fixpunkt: Datei wird mit der passenden SVGO-Konfiguration (multipass) optimiert; gleich bis auf Leerraum am Ende = Fixpunkt. Konfiguration „animiert“, wenn die Datei `<animate*>`, `<set>`, `<style>`, `<script>`, `@keyframes`, `data-motion` oder `pathLength` enthält, sonst „statisch“. Die Konfiguration schützt IDs aus aria-labelledby, CSS und Skripten (`idsAusQuelltext`); die Spalte `fixpunktStandardkonfiguration` in svg.json nennt das Ergebnis mit der unveränderten Standardkonfiguration.',
  '- „Text als Pfad vermutet“ ist eine Heuristik (kein `<text>`, ab 6 Pfaden, Dateiname mit logo/wort/marke/schrift/text). Sie ist ein Hinweis, kein Befund.',
  '- Strichstärke effektiv = berechnetes stroke-width × (gerenderte Breite ÷ viewBox-Breite); bei `vector-effect: non-scaling-stroke` unskaliert.',
  '- Icon = Bibliotheks-Icon (Klasse lucide) oder viewBox höchstens 32 Einheiten; alle übrigen inline-SVG zählen als Illustration.',
  '- Zugänglichkeit: dekorativ = `aria-hidden="true"` (auch über Vorfahr); bedeutungstragend = `role="img"` mit Namen aus aria-label, aria-labelledby (auflösbar) oder `<title>`.');
await fs.writeFile(path.join(outDir, 'svg.md'), L.join('\n') + '\n');
console.log(`\nFERTIG ${alleSvgs.length} inline-SVG · ${dateien.length} Dateien · ID-Kollisionen ${idKollisionen.length} · a11y nicht ok ${z.zugaenglichkeitNichtOk} → ${path.relative(REPO, outDir)}`);
