// Tastatur- und Anpassungsprüfer (Ebene 5, Zugänglichkeit): Tab-Durchlauf mit Fokusprüfung, Reflow 320 px,
// Zoom 200 %, Textabstände (WCAG 1.4.12), erzwungene Farben, ohne JavaScript.
// Roh-JSON je Prüfung                       → _relaunch/.roh/<label>/tastatur/…            (lokal, nicht versioniert)
// Zusammenfassung                           → _relaunch/belege/<label>/tastatur.json und tastatur.md   (versioniert)
// Bildschirmfotos erzwungene Farben (WebP)  → _relaunch/belege/<label>/forced-colors/…
//
// Aufruf: node tastatur.mjs --base http://localhost:3500 --label <label>
//         [--only start,stellen,…] [--checks tab,reflow,zoom,text,forced,nojs] [--jobs 3]
//
// Messbedingungen (auch im Bericht): Chromium voll, reducedMotion „reduce“ (nur „ohne JavaScript“: „no-preference“, damit
// bewegungsabhängige Startzustände nicht verdeckt werden), Anfragesperre G5, Schemata hell (Tab, Reflow, Zoom, Text, Farben).
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { GRUNDMENGE, VIEWPORTS, collectErrors, launch, newContext, overflowReport, scrollThrough } from './lib/browser.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]]] : acc), []));
const base = args.base ?? 'http://localhost:3500';
const label = args.label ?? 'lauf';
const only = args.only ? args.only.split(',') : null;
const checks = new Set((args.checks ?? 'tab,reflow,zoom,text,forced,nojs').split(','));
const jobs = Math.max(1, Number(args.jobs ?? 3));
const MAX_TABS = 80;

const seiten = GRUNDMENGE.filter((p) => !only || only.includes(p.slug));
const hauptseiten = seiten.filter((p) => p.haupt);
const VP = Object.fromEntries(VIEWPORTS.map((v) => [v.name, v]));
const VP_320 = { name: 'm320', width: 320, height: 640, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const VP_ZOOM = { name: 'zoom200-720x450', width: 720, height: 450, isMobile: false, hasTouch: false, deviceScaleFactor: 2 };

const rawDir = path.join(ROOT, '.roh', label, 'tastatur');
const outDir = path.join(ROOT, 'belege', label);
const forcedDir = path.join(outDir, 'forced-colors');
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(forcedDir, { recursive: true });

const browser = await launch();
const chromiumVersion = browser.version();
const sperrLog = [];
const log = (s) => process.stdout.write(`${s}\n`);

/** Kontext + Seite + Laden. `js:false` schaltet JavaScript ab. */
async function oeffne(a, { vp, scheme = 'light', motion = 'reduce', forced = 'none', js = true, scroll = true }) {
  const { context, requestLog } = await newContext(browser, { origin: base, viewport: vp, colorScheme: scheme, reducedMotion: motion, forcedColors: forced, javaScriptEnabled: js });
  const page = await context.newPage();
  const errors = js ? collectErrors(page) : [];
  const res = await page.goto(base + a.path, { waitUntil: js ? 'networkidle' : 'load', timeout: 45_000 });
  if (js) {
    await page.evaluate(() => document.fonts?.ready);
    if (scroll) await scrollThrough(page);
    await page.waitForTimeout(150);
  }
  return { context, page, requestLog, errors, status: res?.status() ?? 0 };
}

async function mitSeite(a, opt, fn, versuch = 1) {
  let o;
  try {
    o = await oeffne(a, opt);
    const r = await fn(o.page, o);
    sperrLog.push(...o.requestLog);
    return { ...r, status: o.status };
  } catch (err) {
    if (versuch < 2) {
      await o?.context.close().catch(() => {});
      return mitSeite(a, opt, fn, versuch + 1);
    }
    return { fehlgeschlagen: String(err).split('\n')[0] };
  } finally {
    await o?.context.close().catch(() => {});
  }
}

async function pool(liste, fn) {
  const out = new Array(liste.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(jobs, liste.length) }, async () => {
      while (i < liste.length) {
        const k = i++;
        out[k] = await fn(liste[k], k);
      }
    }),
  );
  return out;
}

// ---- In der Seite ausgeführte Messfunktionen (selbständig, ohne Außenbezüge) ---------------------------------------

/** Aktives Element: Tag, Rolle, Name, Fokusdarstellung, Lage. */
function messeAktiv() {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return { koerper: true, id: 0, tag: 'body' };
  window.__tkIds ??= new WeakMap();
  window.__tkN ??= 0;
  let id = window.__tkIds.get(el);
  if (!id) {
    id = ++window.__tkN;
    window.__tkIds.set(el, id);
  }
  const alpha = (c) => {
    if (!c) return 0;
    if (c === 'transparent') return 0;
    let m = c.match(/\/\s*([\d.]+)(%?)\s*\)/);
    if (m) return m[2] ? Number(m[1]) / 100 : Number(m[1]);
    m = c.match(/^rgba\(\s*[\d.]+[ ,]+[\d.]+[ ,]+[\d.]+[ ,]+([\d.]+)\s*\)/);
    if (m) return Number(m[1]);
    return 1;
  };
  const schattenSichtbar = (bs) => {
    if (!bs || bs === 'none') return false;
    const teile = [];
    let tiefe = 0;
    let cur = '';
    for (const ch of bs) {
      if (ch === '(') tiefe++;
      if (ch === ')') tiefe--;
      if (ch === ',' && tiefe === 0) {
        teile.push(cur);
        cur = '';
      } else cur += ch;
    }
    teile.push(cur);
    return teile.some((t) => {
      const farbe = t.match(/(rgba?\([^)]*\)|color\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|lab\([^)]*\)|lch\([^)]*\)|hsla?\([^)]*\)|#[0-9a-f]{3,8}|transparent)/i)?.[1] ?? '';
      const zahlen = (t.replace(farbe, '').match(/-?[\d.]+px/g) ?? []).map((n) => parseFloat(n));
      return alpha(farbe) > 0 && zahlen.some((n) => n !== 0);
    });
  };
  const name = (() => {
    const aria = el.getAttribute('aria-label');
    if (aria) return aria;
    const lb = el.getAttribute('aria-labelledby');
    if (lb) {
      const t = lb.split(/\s+/).map((i) => document.getElementById(i)?.textContent?.trim()).filter(Boolean).join(' ');
      if (t) return t;
    }
    if (el.labels?.length) return [...el.labels].map((l) => l.textContent.trim()).join(' ');
    if (el.tagName === 'INPUT' && ['button', 'submit', 'reset'].includes(el.type)) return el.value;
    const alt = el.getAttribute('alt');
    if (alt) return alt;
    const t = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (t) return t;
    return el.getAttribute('title') || el.getAttribute('placeholder') || '';
  })();
  const tag = el.tagName.toLowerCase();
  const typ = el.getAttribute('type');
  const rolle =
    el.getAttribute('role') ||
    ({ a: el.hasAttribute('href') ? 'link' : 'generic', button: 'button', select: 'combobox', textarea: 'textbox', summary: 'button (summary)', details: 'group', h1: 'heading', h2: 'heading', h3: 'heading' }[tag] ??
      (tag === 'input' ? ({ checkbox: 'checkbox', radio: 'radio', button: 'button', submit: 'button', range: 'slider', search: 'searchbox' }[typ ?? 'text'] ?? 'textbox') : 'generic'));
  const cs = getComputedStyle(el);
  const outlineW = parseFloat(cs.outlineWidth) || 0;
  const outlineSichtbar = cs.outlineStyle !== 'none' && outlineW >= 2 && alpha(cs.outlineColor) > 0;
  const shadowSichtbar = schattenSichtbar(cs.boxShadow);
  const r = el.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = innerHeight;
  // Fixierte Kopfleiste: erstes header-Element mit sticky/fixed.
  const kopf = [...document.querySelectorAll('header')].find((h) => ['sticky', 'fixed'].includes(getComputedStyle(h).position));
  const kopfH = kopf ? kopf.getBoundingClientRect().bottom : 0;
  const imKopf = kopf ? kopf.contains(el) : false;
  const schneidet = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
  const vollstaendig = r.width > 0 && r.height > 0 && r.top >= -1 && r.left >= -1 && r.bottom <= vh + 1 && r.right <= vw + 1;
  // Trefferprobe: liegt etwas anderes über dem Mittelpunkt des sichtbaren Teils?
  let verdecktDurch = null;
  if (schneidet && r.width >= 4 && r.height >= 4) {
    const x = (Math.max(r.left, 0) + Math.min(r.right, vw)) / 2;
    const y = (Math.max(r.top, 0) + Math.min(r.bottom, vh)) / 2;
    const hit = document.elementFromPoint(x, y);
    const gehoertDazu = hit && (hit === el || el.contains(hit) || hit.contains(el) || (el.labels && [...el.labels].some((l) => l.contains(hit))));
    if (hit && !gehoertDazu) verdecktDurch = `${hit.tagName.toLowerCase()}${hit.id ? '#' + hit.id : ''}${hit.className && typeof hit.className === 'string' ? '.' + hit.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
  }
  return {
    koerper: false,
    id,
    tag,
    rolle,
    name: name.replace(/\s+/g, ' ').trim().slice(0, 80),
    href: el.getAttribute('href')?.slice(0, 80) ?? null,
    focusVisible: el.matches(':focus-visible'),
    outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`,
    outlineOffset: cs.outlineOffset,
    boxShadow: cs.boxShadow === 'none' ? 'none' : cs.boxShadow.slice(0, 120),
    outlineSichtbar,
    schattenSichtbar: shadowSichtbar,
    fokusSichtbar: outlineSichtbar || shadowSichtbar,
    rect: { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) },
    imViewport: schneidet,
    vollstaendigImViewport: vollstaendig,
    kopfHoehe: Math.round(kopfH),
    abstandZurKopfleiste: imKopf ? null : Math.round(r.top - kopfH),
    verdecktVonKopfleiste: !imKopf && kopf && schneidet ? r.top < kopfH - 0.5 : false,
    verdecktDurch,
    imKopf,
    imFuss: Boolean(el.closest('footer')),
    scrollY: Math.round(scrollY),
  };
}

/** Elemente, die den rechten Rand überragen (mögliche Verursacher des Überlaufs). */
function messeBreite() {
  const doc = document.documentElement;
  const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''}`;
  const breit = [...document.body.querySelectorAll('*')]
    .filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.right > doc.clientWidth + 1 && e.checkVisibility?.();
    })
    .slice(0, 6)
    .map((e) => ({ ziel: sel(e), rechts: Math.round(e.getBoundingClientRect().right - doc.clientWidth) }));
  return {
    innerWidth,
    clientWidth: doc.clientWidth,
    scrollWidth: doc.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    visualViewportScale: window.visualViewport?.scale ?? null,
    ueberstehend: breit,
  };
}

/** Vertikal abgeschnittener Text (overflow hidden/clip, Inhalt höher als Box) – Ergänzung zu overflowReport für 1.4.12. */
function messeVertikalAbgeschnitten() {
  const gefunden = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (!(cs.overflowY === 'hidden' || cs.overflowY === 'clip')) continue;
    if (el.closest('[aria-hidden="true"],.sr-only,[hidden]')) continue;
    if (el.clientHeight === 0 || el.scrollHeight <= el.clientHeight + 1) continue;
    const text = (el.innerText || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    gefunden.push({ tag: el.tagName.toLowerCase(), klassen: typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 3).join('.') : '', text: text.slice(0, 50), ueberstand: el.scrollHeight - el.clientHeight });
    if (gefunden.length >= 25) break;
  }
  return gefunden;
}

/** Erzwungene Farben: Sichtbarkeit von Links, Knöpfen und Feldern über berechnete Styles. */
function messeErzwungeneFarben() {
  const ziele = document.querySelectorAll('a[href], button, [role="button"], summary, input:not([type="hidden"]), select, textarea');
  const seite = { aktiv: matchMedia('(forced-colors: active)').matches, links: [], knoepfe: [], felder: [] };
  const seiten = ['Top', 'Right', 'Bottom', 'Left'];
  let adjustNone = 0;
  for (const el of document.querySelectorAll('body *')) if (getComputedStyle(el).forcedColorAdjust === 'none') adjustNone++;
  for (const el of ziele) {
    if (!el.checkVisibility({ visibilityProperty: true })) continue;
    if (el.closest('.sr-only,[aria-hidden="true"],[inert]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    const rahmen = seiten.some((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== 'none');
    const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
    const unterstrichen = (cs.textDecorationLine || '').includes('underline');
    const tag = el.tagName.toLowerCase();
    const art = tag === 'a' ? 'link' : ['input', 'select', 'textarea'].includes(tag) && !['button', 'submit', 'reset'].includes(el.getAttribute('type') ?? '') ? 'feld' : 'knopf';
    // Link im Fließtext: nächster Block-Vorfahr enthält mehr Text als der Link selbst.
    let imFliesstext = false;
    if (art === 'link' && cs.display === 'inline') {
      let block = el.parentElement;
      while (block && getComputedStyle(block).display === 'inline') block = block.parentElement;
      imFliesstext = (block?.textContent?.trim().length ?? 0) > (el.textContent?.trim().length ?? 0) + 3;
    }
    const name = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('value') || el.getAttribute('name') || '').replace(/\s+/g, ' ').trim().slice(0, 50);
    const eintrag = { tag, name, rahmen, outline, unterstrichen, imFliesstext, imNav: Boolean(el.closest('nav,header,footer')), sichtbar: rahmen || outline || unterstrichen };
    seite[art === 'link' ? 'links' : art === 'knopf' ? 'knoepfe' : 'felder'].push(eintrag);
  }
  seite.forcedColorAdjustNone = adjustNone;
  return seite;
}

/** Ohne JavaScript: Struktur und Elemente mit opacity 0 im ersten Bildschirm. */
function messeOhneJs() {
  const main = document.querySelector('main');
  const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''}`;
  const unsichtbar = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.opacity !== '0') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.bottom <= 0 || r.top >= innerHeight) continue;
    unsichtbar.push({ ziel: sel(el), text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40), mitText: Boolean((el.innerText || '').trim()), inMain: Boolean(main?.contains(el)) });
    if (unsichtbar.length >= 25) break;
  }
  return {
    titel: document.title,
    h1: document.querySelectorAll('h1').length,
    h1Text: document.querySelector('h1')?.textContent?.trim().slice(0, 80) ?? null,
    mainVorhanden: Boolean(main),
    mainTextlaenge: (main?.innerText ?? '').trim().length,
    mainKinder: main?.children.length ?? 0,
    opacity0ImErstenBildschirm: unsichtbar,
    noscript: document.querySelectorAll('noscript').length,
  };
}

const ZAHL_INTERAKTIV = () =>
  [...document.querySelectorAll('a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')].filter((e) => e.checkVisibility?.({ visibilityProperty: true }) || e.closest('.sr-only')).length;

// ---- 1. Tab-Durchlauf -----------------------------------------------------------------------------------------------
async function tabDurchlauf(p) {
  return mitSeite(p, { vp: VP.d1440, scroll: false }, async (page) => {
    await page.waitForTimeout(300);
    const interaktiv = await page.evaluate(ZAHL_INTERAKTIV);
    const schritte = [];
    const gesehen = new Map(); // id → erster Schritt
    let folge = 1;
    let letzteId = null;
    let dreiInFolge = null;
    let zyklus = null;
    let stopp = 'limit';
    for (let n = 1; n <= MAX_TABS; n++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(90);
      const s = await page.evaluate(messeAktiv);
      s.schritt = n;
      schritte.push(s);
      if (s.id === letzteId) folge++;
      else folge = 1;
      letzteId = s.id;
      if (folge >= 3) {
        dreiInFolge = { schritt: n, element: `${s.tag} „${s.name ?? ''}“` };
        stopp = 'dreiInFolge';
        break;
      }
      if (s.id !== 0 && gesehen.has(s.id) && s.id !== schritte[n - 2]?.id) {
        zyklus = { schritt: n, laenge: n - gesehen.get(s.id), wiederholtSchritt: gesehen.get(s.id) };
        stopp = 'zyklus';
        break;
      }
      if (s.id !== 0 && !gesehen.has(s.id)) gesehen.set(s.id, n);
    }
    const echte = schritte.filter((s) => !s.koerper);
    const erstes = schritte[0];
    const sprunglink = Boolean(erstes && !erstes.koerper && erstes.tag === 'a' && /^#/.test(erstes.href ?? '') && /(springen|skip|inhalt|content)/i.test(erstes.name ?? ''));
    const fussErreicht = echte.some((s) => s.imFuss);
    const ohneFokus = echte.filter((s) => !s.fokusSichtbar);
    const verdeckt = echte.filter((s) => s.verdecktVonKopfleiste);
    const ausserhalb = echte.filter((s) => !s.imViewport);
    const verdecktSonst = echte.filter((s) => s.verdecktDurch);
    return {
      pfad: p.path,
      slug: p.slug,
      interaktivSichtbar: interaktiv,
      schritteGesamt: schritte.length,
      stopp,
      sprunglinkErstesZiel: sprunglink,
      ersteSchritte: schritte.slice(0, 3).map((s) => (s.koerper ? 'body' : `${s.tag} „${s.name}“`)),
      sprunglinkSichtbarBeiFokus: sprunglink ? Boolean(erstes.fokusSichtbar && erstes.imViewport) : null,
      fokusOhneFokusdarstellung: ohneFokus.length,
      fokusVerdecktVonKopfleiste: verdeckt.length,
      fokusAusserhalbViewport: ausserhalb.length,
      fokusVonAnderemElementUeberdeckt: verdecktSonst.length,
      koerperSchritte: schritte.filter((s) => s.koerper).length,
      dreiInFolge,
      zyklus,
      fussbereichErreicht: fussErreicht,
      fokusfalle: Boolean(dreiInFolge || (zyklus && !fussErreicht)),
      ohneAbschlussIn80: stopp === 'limit',
      auffaellig: schritte
        .filter((s) => !s.koerper && (!s.fokusSichtbar || s.verdecktVonKopfleiste || !s.imViewport || s.verdecktDurch))
        .map((s) => ({ schritt: s.schritt, element: `${s.tag} „${s.name}“`, rolle: s.rolle, fokusSichtbar: s.fokusSichtbar, outline: s.outline, boxShadow: s.boxShadow, imViewport: s.imViewport, verdecktVonKopfleiste: s.verdecktVonKopfleiste, abstandZurKopfleiste: s.abstandZurKopfleiste, verdecktDurch: s.verdecktDurch })),
      schritte,
    };
  });
}

// ---- 2. Reflow 320 px, Zoom 200 %, Textabstände ---------------------------------------------------------------------
const kurz = (o) => ({ horizontal: o.horizontal, scrollWidth: o.scrollWidth, clientWidth: o.clientWidth, abgeschnitten: o.clipped.length, clipped: o.clipped });

async function reflow320(p) {
  return mitSeite(p, { vp: VP_320 }, async (page) => {
    const o = await overflowReport(page);
    const b = await page.evaluate(messeBreite);
    return { pfad: p.path, slug: p.slug, ansicht: '320×640 (isMobile, dsf 2)', ...kurz(o), breite: b, ueberlauf320: b.scrollWidth > 320 || b.bodyScrollWidth > 320 };
  });
}

async function zoom200(p) {
  const viewport = await mitSeite(p, { vp: VP_ZOOM }, async (page) => {
    const o = await overflowReport(page);
    const b = await page.evaluate(messeBreite);
    return { ...kurz(o), breite: b, kopfHoehe: await page.evaluate(() => [...document.querySelectorAll('header')].find((h) => ['sticky', 'fixed'].includes(getComputedStyle(h).position))?.getBoundingClientRect().height ?? 0) };
  });
  const cssZoom = await mitSeite(p, { vp: VP.d1440 }, async (page) => {
    await page.evaluate(() => {
      document.documentElement.style.zoom = '2';
    });
    await page.waitForTimeout(250);
    const o = await overflowReport(page);
    const b = await page.evaluate(messeBreite);
    return { ...kurz(o), breite: b };
  });
  return { pfad: p.path, slug: p.slug, viewport720x450: viewport, cssZoomAufD1440: cssZoom };
}

const TEXTABSTAND_CSS = '* { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important } p { margin-bottom:2em !important }';

async function textabstand(p, vpName) {
  return mitSeite(p, { vp: VP[vpName] }, async (page) => {
    const basis = await overflowReport(page);
    const basisV = await page.evaluate(messeVertikalAbgeschnitten);
    await page.addStyleTag({ content: TEXTABSTAND_CSS });
    await page.waitForTimeout(250);
    const mit = await overflowReport(page);
    const mitV = await page.evaluate(messeVertikalAbgeschnitten);
    const key = (c) => `${c.tag}|${c.text}`;
    const basisKeys = new Set(basis.clipped.map(key));
    const basisVKeys = new Set(basisV.map((c) => `${c.tag}|${c.text}`));
    return {
      pfad: p.path,
      slug: p.slug,
      ansicht: vpName,
      basis: { ...kurz(basis), vertikalAbgeschnitten: basisV.length },
      mitTextabstand: { ...kurz(mit), vertikalAbgeschnitten: mitV.length, vertikal: mitV },
      neuHorizontalAbgeschnitten: mit.clipped.filter((c) => !basisKeys.has(key(c))).length,
      neuVertikalAbgeschnitten: mitV.filter((c) => !basisVKeys.has(`${c.tag}|${c.text}`)).length,
      neuerUeberlauf: mit.horizontal && !basis.horizontal,
    };
  });
}

// ---- 3. Erzwungene Farben -------------------------------------------------------------------------------------------
async function erzwungeneFarben(p, vpName) {
  return mitSeite(p, { vp: VP[vpName], forced: 'active' }, async (page) => {
    const datei = path.join(forcedDir, `${p.slug}__${vpName}-light.webp`);
    const png = await page.screenshot({ fullPage: false });
    const meta = await sharp(png).metadata();
    await sharp(png)
      .resize({ width: Math.min(1440, meta.width) })
      .webp({ quality: 70, effort: 6 })
      .toFile(datei);
    const m = await page.evaluate(messeErzwungeneFarben);
    const z = (l) => ({ gesamt: l.length, sichtbar: l.filter((e) => e.sichtbar).length, ohne: l.filter((e) => !e.sichtbar).length });
    return {
      pfad: p.path,
      slug: p.slug,
      ansicht: vpName,
      forcedColorsAktiv: m.aktiv,
      foto: path.relative(ROOT, datei),
      links: z(m.links),
      linksImFliesstextOhne: m.links.filter((e) => !e.sichtbar && e.imFliesstext).length,
      knoepfe: z(m.knoepfe),
      felder: z(m.felder),
      forcedColorAdjustNone: m.forcedColorAdjustNone,
      ohneUmrandungOderUnterstreichung: [...m.links, ...m.knoepfe].filter((e) => !e.sichtbar).slice(0, 25).map((e) => ({ art: e.tag === 'a' ? 'link' : 'knopf', tag: e.tag, name: e.name, imFliesstext: e.imFliesstext, imNav: e.imNav })),
    };
  });
}

// ---- 4. Ohne JavaScript ---------------------------------------------------------------------------------------------
async function ohneJs(p, vpName) {
  return mitSeite(p, { vp: VP[vpName], js: false, motion: 'no-preference' }, async (page) => {
    await page.waitForTimeout(1500); // CSS-Animationen auslaufen lassen
    const m = await page.evaluate(messeOhneJs);
    return {
      pfad: p.path,
      slug: p.slug,
      ansicht: vpName,
      ...m,
      mainNichtLeer: m.mainTextlaenge > 0,
      opacity0Anzahl: m.opacity0ImErstenBildschirm.length,
      opacity0MitText: m.opacity0ImErstenBildschirm.filter((e) => e.mitText).length,
    };
  });
}

// ---- Ausführung -----------------------------------------------------------------------------------------------------
const erg = { tab: [], reflow320: [], zoom200: [], textabstand: [], erzwungeneFarben: [], ohneJs: [] };

if (checks.has('tab')) {
  for (const p of hauptseiten) {
    const r = await tabDurchlauf(p);
    erg.tab.push(r);
    if (r.fehlgeschlagen) log(`FEHLER tab ${p.slug}: ${r.fehlgeschlagen}`);
    else log(`tab ${p.slug}: ${r.schritteGesamt} Schritte (${r.stopp}) · Sprunglink ${r.sprunglinkErstesZiel ? 'ja' : 'nein'} · ohne Fokus ${r.fokusOhneFokusdarstellung} · verdeckt ${r.fokusVerdecktVonKopfleiste} · außerhalb ${r.fokusAusserhalbViewport} · Falle ${r.fokusfalle ? 'JA' : 'nein'} · Fuß ${r.fussbereichErreicht ? 'ja' : 'nein'}`);
    await fs.writeFile(path.join(rawDir, `tab__${p.slug}.json`), JSON.stringify(r, null, 2));
  }
}
if (checks.has('reflow')) {
  erg.reflow320 = await pool(seiten, async (p) => {
    const r = await reflow320(p);
    log(r.fehlgeschlagen ? `FEHLER reflow ${p.slug}: ${r.fehlgeschlagen}` : `reflow320 ${p.slug}: Überlauf ${r.horizontal ? 'JA' : 'nein'} (${r.scrollWidth}/${r.clientWidth}) · abgeschnitten ${r.abgeschnitten}`);
    return r;
  });
  await fs.writeFile(path.join(rawDir, 'reflow320.json'), JSON.stringify(erg.reflow320, null, 2));
}
if (checks.has('zoom')) {
  erg.zoom200 = await pool(seiten, async (p) => {
    const r = await zoom200(p);
    const v = r.viewport720x450;
    const c = r.cssZoomAufD1440;
    log(`zoom200 ${p.slug}: 720×450 Überlauf ${v.horizontal ? 'JA' : 'nein'} (${v.scrollWidth}/${v.clientWidth}) abgeschnitten ${v.abgeschnitten} · css-zoom Überlauf ${c.horizontal ? 'JA' : 'nein'} (${c.scrollWidth}/${c.clientWidth})`);
    return r;
  });
  await fs.writeFile(path.join(rawDir, 'zoom200.json'), JSON.stringify(erg.zoom200, null, 2));
}
if (checks.has('text')) {
  const liste = seiten.flatMap((p) => ['m375', 'd1440'].map((v) => ({ p, v })));
  erg.textabstand = await pool(liste, async ({ p, v }) => {
    const r = await textabstand(p, v);
    log(r.fehlgeschlagen ? `FEHLER text ${p.slug} ${v}: ${r.fehlgeschlagen}` : `text ${p.slug} ${v}: neuer Überlauf ${r.neuerUeberlauf ? 'JA' : 'nein'} · neu abgeschnitten h${r.neuHorizontalAbgeschnitten}/v${r.neuVertikalAbgeschnitten}`);
    return r;
  });
  await fs.writeFile(path.join(rawDir, 'textabstand.json'), JSON.stringify(erg.textabstand, null, 2));
}
if (checks.has('forced')) {
  const liste = hauptseiten.flatMap((p) => ['m375', 'd1440'].map((v) => ({ p, v })));
  erg.erzwungeneFarben = await pool(liste, async ({ p, v }) => {
    const r = await erzwungeneFarben(p, v);
    log(r.fehlgeschlagen ? `FEHLER forced ${p.slug} ${v}: ${r.fehlgeschlagen}` : `forced ${p.slug} ${v}: aktiv ${r.forcedColorsAktiv} · Links ohne ${r.links.ohne}/${r.links.gesamt} · Knöpfe ohne ${r.knoepfe.ohne}/${r.knoepfe.gesamt}`);
    return r;
  });
  await fs.writeFile(path.join(rawDir, 'erzwungene-farben.json'), JSON.stringify(erg.erzwungeneFarben, null, 2));
}
if (checks.has('nojs')) {
  const liste = seiten.flatMap((p) => ['m375', 'd1440'].map((v) => ({ p, v })));
  erg.ohneJs = await pool(liste, async ({ p, v }) => {
    const r = await ohneJs(p, v);
    log(r.fehlgeschlagen ? `FEHLER nojs ${p.slug} ${v}: ${r.fehlgeschlagen}` : `nojs ${p.slug} ${v}: ${r.status} h1 ${r.h1} · main ${r.mainTextlaenge} Zeichen · opacity0 ${r.opacity0Anzahl}`);
    return r;
  });
  await fs.writeFile(path.join(rawDir, 'ohne-js.json'), JSON.stringify(erg.ohneJs, null, 2));
}
await browser.close();

// ---- Zusammenfassung ------------------------------------------------------------------------------------------------
const gut = (l) => l.filter((x) => !x.fehlgeschlagen);
const fehlerListe = Object.entries(erg).flatMap(([k, l]) => l.filter((x) => x.fehlgeschlagen).map((x) => `${k}:${x.slug ?? ''}:${x.ansicht ?? ''}`));
const anfragen = {};
for (const r of sperrLog) anfragen[`${r.kind} ${r.method}`] = (anfragen[`${r.kind} ${r.method}`] ?? 0) + 1;

const tab = gut(erg.tab);
const summen = {
  tab: {
    hauptseiten: tab.length,
    ohneSprunglinkAlsErstesZiel: tab.filter((t) => !t.sprunglinkErstesZiel).map((t) => t.slug),
    schritteOhneFokusdarstellung: tab.reduce((n, t) => n + t.fokusOhneFokusdarstellung, 0),
    schritteVerdecktVonKopfleiste: tab.reduce((n, t) => n + t.fokusVerdecktVonKopfleiste, 0),
    schritteAusserhalbViewport: tab.reduce((n, t) => n + t.fokusAusserhalbViewport, 0),
    schritteVonAnderemElementUeberdeckt: tab.reduce((n, t) => n + t.fokusVonAnderemElementUeberdeckt, 0),
    fokusfallen: tab.filter((t) => t.fokusfalle).map((t) => t.slug),
    ohneAbschlussIn80: tab.filter((t) => t.ohneAbschlussIn80).map((t) => t.slug),
  },
  reflow320: { seiten: gut(erg.reflow320).length, mitHorizontalemUeberlauf: gut(erg.reflow320).filter((r) => r.horizontal).map((r) => r.slug), mitUeberlauf320: gut(erg.reflow320).filter((r) => r.ueberlauf320).map((r) => r.slug), seitenMitAbgeschnittenemText: gut(erg.reflow320).filter((r) => r.abgeschnitten > 0).map((r) => r.slug) },
  zoom200: {
    seiten: gut(erg.zoom200).length,
    viewport720x450MitUeberlauf: gut(erg.zoom200).filter((r) => r.viewport720x450.horizontal).map((r) => r.slug),
    viewport720x450MitAbgeschnittenemText: gut(erg.zoom200).filter((r) => r.viewport720x450.abgeschnitten > 0).map((r) => r.slug),
    cssZoomMitUeberlauf: gut(erg.zoom200).filter((r) => r.cssZoomAufD1440.horizontal).map((r) => r.slug),
  },
  textabstand: {
    laeufe: gut(erg.textabstand).length,
    mitNeuemUeberlauf: gut(erg.textabstand).filter((r) => r.neuerUeberlauf).map((r) => `${r.slug}/${r.ansicht}`),
    mitNeuAbgeschnittenemText: gut(erg.textabstand).filter((r) => r.neuHorizontalAbgeschnitten + r.neuVertikalAbgeschnitten > 0).map((r) => `${r.slug}/${r.ansicht}`),
  },
  erzwungeneFarben: {
    laeufe: gut(erg.erzwungeneFarben).length,
    linksOhneUmrandungOderUnterstreichung: gut(erg.erzwungeneFarben).reduce((n, r) => n + r.links.ohne, 0),
    linksGesamt: gut(erg.erzwungeneFarben).reduce((n, r) => n + r.links.gesamt, 0),
    knoepfeOhneUmrandungOderUnterstreichung: gut(erg.erzwungeneFarben).reduce((n, r) => n + r.knoepfe.ohne, 0),
    knoepfeGesamt: gut(erg.erzwungeneFarben).reduce((n, r) => n + r.knoepfe.gesamt, 0),
  },
  ohneJs: {
    laeufe: gut(erg.ohneJs).length,
    ohneH1: gut(erg.ohneJs).filter((r) => r.h1 !== 1).map((r) => `${r.slug}/${r.ansicht} (h1 ×${r.h1})`),
    mainLeer: gut(erg.ohneJs).filter((r) => !r.mainNichtLeer).map((r) => `${r.slug}/${r.ansicht}`),
    mitOpacity0ImErstenBildschirm: gut(erg.ohneJs).filter((r) => r.opacity0Anzahl > 0).map((r) => `${r.slug}/${r.ansicht} (${r.opacity0Anzahl}, mit Text ${r.opacity0MitText})`),
  },
};

const summary = {
  label,
  base,
  erstellt: new Date().toISOString(),
  bedingungen: {
    chromium: chromiumVersion,
    reducedMotion: "reduce (nur 'ohne JavaScript': no-preference)",
    farbschema: 'hell',
    tab: `d1440 hell, bis zu ${MAX_TABS} × Tab je Hauptseite (${hauptseiten.map((p) => p.slug).join(', ')}), 90 ms Wartezeit je Schritt, ohne vorheriges Durchscrollen; Fokus sichtbar = berechnete outline-width ≥ 2 px (Stil ≠ none, Farbe nicht transparent) oder box-shadow mit sichtbarer Farbe und Maß ≠ 0, nur am fokussierten Element selbst gemessen; verdeckt = Elementoberkante < Unterkante der ersten sticky/fixed header; Fokusfalle = gleiches Element 3× in Folge oder Zyklus ohne Fußbereich`,
    reflow: `${VP_320.width}×${VP_320.height} isMobile, dsf 2, jede Seite der Grundmenge (${seiten.length}), overflowReport() nach Durchscrollen`,
    zoom: 'Primär: Viewport 720×450, dsf 2, ohne isMobile (entspricht Browser-Zoom 200 % bei 1440 px); Vergleich: d1440 mit document.documentElement.style.zoom = 2',
    textabstand: `m375 und d1440, hell; Stylesheet „${TEXTABSTAND_CSS}“; overflowReport() vorher und nachher, ergänzend vertikal abgeschnittener Text (overflow hidden/clip, Inhalt höher als Box)`,
    erzwungeneFarben: 'forcedColors „active“, Farbschema hell, m375 und d1440, Hauptseiten; Bildschirmfoto der ersten Bildschirmhöhe (WebP, Qualität 70); sichtbar = Rahmen (eine Seite, Stil ≠ none) oder Outline oder Unterstreichung laut berechneten Styles',
    ohneJavaScript: 'javaScriptEnabled false, m375 und d1440, alle Seiten der Grundmenge, Wartezeit 1,5 s nach load; opacity 0 = berechnete opacity exakt 0 bei Element im ersten Bildschirm',
    anfragesperre: 'lib/browser.mjs (G5)',
    parallel: jobs,
  },
  abdeckung: {
    seitenGrundmenge: seiten.length,
    hauptseiten: hauptseiten.length,
    fehlgeschlagen: fehlerListe,
    anfragesperre: anfragen,
  },
  summen,
  ...erg,
};
await fs.writeFile(path.join(outDir, 'tastatur.json'), JSON.stringify(summary, null, 2));

// ---- Markdown -------------------------------------------------------------------------------------------------------
const md = [];
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const jn = (b) => (b ? 'ja' : 'nein');
md.push(`# Tastatur und Anpassung · ${label}`, '', `Erstellt ${summary.erstellt} · Basis ${base} · Chromium ${chromiumVersion}`, '');
md.push('## Messbedingungen');
for (const [k, v] of Object.entries(summary.bedingungen)) if (k !== 'chromium') md.push(`- **${k}**: ${v}`);
md.push('');
md.push('## Abdeckung');
md.push(`- Seiten der Grundmenge: ${seiten.length} · Hauptseiten: ${hauptseiten.length}`);
md.push(`- Läufe: Tab ${erg.tab.length} · Reflow 320 ${erg.reflow320.length} · Zoom 200 % ${erg.zoom200.length} (je 2 Verfahren) · Textabstände ${erg.textabstand.length} · erzwungene Farben ${erg.erzwungeneFarben.length} · ohne JavaScript ${erg.ohneJs.length}`);
md.push(`- Fehlgeschlagen: ${fehlerListe.length ? fehlerListe.join(', ') : 'keine'}`);
md.push(`- Anfragesperre insgesamt: ${Object.keys(anfragen).length ? Object.entries(anfragen).map(([k, n]) => `${k} ×${n}`).join(', ') : 'keine gesperrten oder abgefangenen Anfragen'}`);
md.push('');
md.push('## Summenzeile');
md.push(`- Tab: ohne Sprunglink als erstes Ziel ${summen.tab.ohneSprunglinkAlsErstesZiel.length}/${summen.tab.hauptseiten} Hauptseiten (${summen.tab.ohneSprunglinkAlsErstesZiel.join(', ') || '–'}) · Schritte ohne Fokusdarstellung ${summen.tab.schritteOhneFokusdarstellung} · verdeckt von Kopfleiste ${summen.tab.schritteVerdecktVonKopfleiste} · außerhalb Viewport ${summen.tab.schritteAusserhalbViewport} · von anderem Element überdeckt ${summen.tab.schritteVonAnderemElementUeberdeckt} · Fokusfallen ${summen.tab.fokusfallen.length} (${summen.tab.fokusfallen.join(', ') || '–'})`);
md.push(`- Reflow 320: horizontaler Überlauf ${summen.reflow320.mitHorizontalemUeberlauf.length}/${summen.reflow320.seiten} (${summen.reflow320.mitHorizontalemUeberlauf.join(', ') || '–'}) · Seiten mit abgeschnittenem/überstehendem Text ${summen.reflow320.seitenMitAbgeschnittenemText.length}`);
md.push(`- Zoom 200 % (Viewport 720×450): Überlauf ${summen.zoom200.viewport720x450MitUeberlauf.length}/${summen.zoom200.seiten} · abgeschnittener Text ${summen.zoom200.viewport720x450MitAbgeschnittenemText.length} · Vergleichsverfahren CSS-Zoom: Überlauf ${summen.zoom200.cssZoomMitUeberlauf.length}/${summen.zoom200.seiten}`);
md.push(`- Textabstände: neuer Überlauf ${summen.textabstand.mitNeuemUeberlauf.length}/${summen.textabstand.laeufe} Läufe · neu abgeschnittener Text ${summen.textabstand.mitNeuAbgeschnittenemText.length}/${summen.textabstand.laeufe}`);
md.push(`- Erzwungene Farben: Links ohne Umrandung/Unterstreichung ${summen.erzwungeneFarben.linksOhneUmrandungOderUnterstreichung}/${summen.erzwungeneFarben.linksGesamt} · Knöpfe ohne ${summen.erzwungeneFarben.knoepfeOhneUmrandungOderUnterstreichung}/${summen.erzwungeneFarben.knoepfeGesamt} (Läufe: ${summen.erzwungeneFarben.laeufe})`);
md.push(`- Ohne JavaScript: Läufe ${summen.ohneJs.laeufe} · h1 ≠ 1: ${summen.ohneJs.ohneH1.length} · main leer: ${summen.ohneJs.mainLeer.length} · opacity 0 im ersten Bildschirm: ${summen.ohneJs.mitOpacity0ImErstenBildschirm.length}`);
md.push('');

if (erg.tab.length) {
  md.push('## 1 · Tab-Durchlauf (d1440, hell)');
  md.push('| Seite | Schritte | Ende | Sprunglink erstes Ziel | Fokus ohne Darstellung | verdeckt (Kopfleiste) | außerhalb Viewport | überdeckt (anderes Element) | Fokusfalle | Fußbereich erreicht | Zyklus | sichtbar interaktiv |');
  md.push('|---|---:|---|---|---:|---:|---:|---:|---|---|---|---:|');
  for (const t of erg.tab) {
    if (t.fehlgeschlagen) {
      md.push(`| ${t.slug ?? ''} | FEHLER: ${esc(t.fehlgeschlagen)} |||||||||||`);
      continue;
    }
    md.push(`| ${t.slug} | ${t.schritteGesamt} | ${t.stopp} | ${jn(t.sprunglinkErstesZiel)} | ${t.fokusOhneFokusdarstellung} | ${t.fokusVerdecktVonKopfleiste} | ${t.fokusAusserhalbViewport} | ${t.fokusVonAnderemElementUeberdeckt} | ${jn(t.fokusfalle)} | ${jn(t.fussbereichErreicht)} | ${t.zyklus ? `Schritt ${t.zyklus.schritt}, Länge ${t.zyklus.laenge}` : '–'} | ${t.interaktivSichtbar} |`);
  }
  md.push('');
  for (const t of erg.tab.filter((x) => !x.fehlgeschlagen)) {
    md.push(`### ${t.slug} · ${t.pfad}`);
    md.push(`Erste Ziele: ${t.ersteSchritte.map(esc).join(' → ')}${t.sprunglinkErstesZiel ? ` · Sprunglink bei Fokus sichtbar: ${jn(t.sprunglinkSichtbarBeiFokus)}` : ''}`);
    if (t.auffaellig.length) {
      md.push('', 'Auffällige Schritte:', '', '| # | Element | Rolle | Fokus sichtbar | outline | box-shadow | im Viewport | verdeckt (Kopf) | überdeckt durch |', '|---:|---|---|---|---|---|---|---|---|');
      for (const a of t.auffaellig) md.push(`| ${a.schritt} | ${esc(a.element)} | ${esc(a.rolle)} | ${jn(a.fokusSichtbar)} | ${esc(a.outline)} | ${esc((a.boxShadow ?? '').slice(0, 60))} | ${jn(a.imViewport)} | ${a.verdecktVonKopfleiste ? `ja (${a.abstandZurKopfleiste} px)` : 'nein'} | ${esc(a.verdecktDurch ?? '–')} |`);
    } else md.push('', 'Keine auffälligen Schritte.');
    md.push('', '<details><summary>Alle Schritte</summary>', '', '| # | Element | Rolle | Name | Fokus | Kopfabstand | Fuß |', '|---:|---|---|---|---|---:|---|');
    for (const s of t.schritte) md.push(s.koerper ? `| ${s.schritt} | body | | | | | |` : `| ${s.schritt} | ${s.tag} | ${esc(s.rolle)} | ${esc((s.name ?? '').slice(0, 50))} | ${s.fokusSichtbar ? (s.outlineSichtbar ? 'outline' : 'shadow') : '**keiner**'} | ${s.abstandZurKopfleiste ?? 'Kopf'} | ${s.imFuss ? 'ja' : ''} |`);
    md.push('', '</details>', '');
  }
}

if (erg.reflow320.length) {
  md.push('## 2 · Reflow 320 × 640');
  md.push('| Seite | Status | horizontaler Überlauf | scrollWidth / clientWidth | innerWidth | abgeschnitten/überstehend | erste Verursacher |', '|---|---:|---|---|---:|---:|---|');
  for (const r of erg.reflow320) {
    if (r.fehlgeschlagen) {
      md.push(`| ${r.slug ?? ''} | FEHLER: ${esc(r.fehlgeschlagen)} ||||||`);
      continue;
    }
    md.push(`| ${r.slug} | ${r.status} | ${jn(r.horizontal)} | ${r.scrollWidth} / ${r.clientWidth} | ${r.breite.innerWidth} | ${r.abgeschnitten} | ${esc(r.breite.ueberstehend.slice(0, 3).map((u) => `${u.ziel} (+${u.rechts})`).join('; ') || '–')} |`);
  }
  md.push('');
}
if (erg.zoom200.length) {
  md.push('## 3 · Zoom 200 %');
  md.push('| Seite | 720×450: Überlauf | scrollWidth / clientWidth | abgeschnitten | Kopfleiste (px) | CSS-Zoom: Überlauf | scrollWidth / clientWidth | abgeschnitten |', '|---|---|---|---:|---:|---|---|---:|');
  for (const r of erg.zoom200) {
    const v = r.viewport720x450;
    const c = r.cssZoomAufD1440;
    md.push(`| ${r.slug} | ${v.fehlgeschlagen ? 'FEHLER' : jn(v.horizontal)} | ${v.fehlgeschlagen ? '' : `${v.scrollWidth} / ${v.clientWidth}`} | ${v.abgeschnitten ?? ''} | ${v.kopfHoehe ?? ''} | ${c.fehlgeschlagen ? 'FEHLER' : jn(c.horizontal)} | ${c.fehlgeschlagen ? '' : `${c.scrollWidth} / ${c.clientWidth}`} | ${c.abgeschnitten ?? ''} |`);
  }
  md.push('');
}
if (erg.textabstand.length) {
  md.push('## 4 · Textabstände (WCAG 1.4.12)');
  md.push('| Seite | Ansicht | Überlauf vorher → nachher | abgeschnitten h vorher → nachher | vertikal abgeschnitten vorher → nachher | neu h / neu v |', '|---|---|---|---|---|---|');
  for (const r of erg.textabstand) {
    if (r.fehlgeschlagen) {
      md.push(`| ${r.slug ?? ''} | ${r.ansicht ?? ''} | FEHLER: ${esc(r.fehlgeschlagen)} |||| |`);
      continue;
    }
    md.push(`| ${r.slug} | ${r.ansicht} | ${jn(r.basis.horizontal)} → ${jn(r.mitTextabstand.horizontal)} | ${r.basis.abgeschnitten} → ${r.mitTextabstand.abgeschnitten} | ${r.basis.vertikalAbgeschnitten} → ${r.mitTextabstand.vertikalAbgeschnitten} | ${r.neuHorizontalAbgeschnitten} / ${r.neuVertikalAbgeschnitten} |`);
  }
  const mitBefund = erg.textabstand.filter((r) => !r.fehlgeschlagen && (r.neuHorizontalAbgeschnitten || r.neuVertikalAbgeschnitten));
  if (mitBefund.length) {
    md.push('', 'Neu abgeschnittener Text (Auszug):', '');
    for (const r of mitBefund) {
      const h = r.mitTextabstand.clipped.slice(0, 3).map((c) => `${c.tag} „${c.text}“`);
      const v = r.mitTextabstand.vertikal.slice(0, 3).map((c) => `${c.tag}.${c.klassen} „${c.text}“ (+${c.ueberstand} px)`);
      md.push(`- ${r.slug} ${r.ansicht}: ${esc([...h, ...v].join('; '))}`);
    }
  }
  md.push('');
}
if (erg.erzwungeneFarben.length) {
  md.push('## 5 · Erzwungene Farben (forced-colors: active, hell)');
  md.push('| Seite | Ansicht | aktiv | Links ohne / gesamt | davon im Fließtext | Knöpfe ohne / gesamt | Felder ohne / gesamt | forced-color-adjust: none | Foto |', '|---|---|---|---|---:|---|---|---:|---|');
  for (const r of erg.erzwungeneFarben) {
    if (r.fehlgeschlagen) {
      md.push(`| ${r.slug ?? ''} | ${r.ansicht ?? ''} | FEHLER: ${esc(r.fehlgeschlagen)} ||||||| |`);
      continue;
    }
    md.push(`| ${r.slug} | ${r.ansicht} | ${jn(r.forcedColorsAktiv)} | ${r.links.ohne} / ${r.links.gesamt} | ${r.linksImFliesstextOhne} | ${r.knoepfe.ohne} / ${r.knoepfe.gesamt} | ${r.felder.ohne} / ${r.felder.gesamt} | ${r.forcedColorAdjustNone} | ${esc(r.foto)} |`);
  }
  md.push('', 'Beispiele ohne Umrandung/Unterstreichung (je Lauf bis 6):', '');
  for (const r of erg.erzwungeneFarben.filter((x) => !x.fehlgeschlagen && x.ohneUmrandungOderUnterstreichung.length)) {
    md.push(`- ${r.slug} ${r.ansicht}: ${esc(r.ohneUmrandungOderUnterstreichung.slice(0, 6).map((e) => `${e.art} „${e.name}“${e.imFliesstext ? ' (Fließtext)' : e.imNav ? ' (Nav/Kopf/Fuß)' : ''}`).join('; '))}`);
  }
  md.push('');
}
if (erg.ohneJs.length) {
  md.push('## 6 · Ohne JavaScript');
  md.push('| Seite | Ansicht | Status | Titel vorhanden | h1 | main-Textlänge | opacity 0 im ersten Bildschirm (davon mit Text) | noscript |', '|---|---|---:|---|---:|---:|---|---:|');
  for (const r of erg.ohneJs) {
    if (r.fehlgeschlagen) {
      md.push(`| ${r.slug ?? ''} | ${r.ansicht ?? ''} | FEHLER: ${esc(r.fehlgeschlagen)} |||||| |`);
      continue;
    }
    md.push(`| ${r.slug} | ${r.ansicht} | ${r.status} | ${jn(Boolean(r.titel))} | ${r.h1} | ${r.mainTextlaenge} | ${r.opacity0Anzahl} (${r.opacity0MitText}) | ${r.noscript} |`);
  }
  const mitO = erg.ohneJs.filter((r) => !r.fehlgeschlagen && r.opacity0Anzahl);
  if (mitO.length) {
    md.push('', 'Elemente mit opacity 0 im ersten Bildschirm:', '');
    for (const r of mitO) md.push(`- ${r.slug} ${r.ansicht}: ${esc(r.opacity0ImErstenBildschirm.slice(0, 5).map((e) => `${e.ziel}${e.text ? ` „${e.text}“` : ''}`).join('; '))}`);
  }
  md.push('');
}
await fs.writeFile(path.join(outDir, 'tastatur.md'), md.join('\n'));

console.log(`\nFERTIG Tab ${erg.tab.length} · Reflow ${erg.reflow320.length} · Zoom ${erg.zoom200.length} · Text ${erg.textabstand.length} · Farben ${erg.erzwungeneFarben.length} · ohne JS ${erg.ohneJs.length} · Fehler ${fehlerListe.length} · Sperre ${JSON.stringify(anfragen)} → ${path.relative(ROOT, outDir)}`);
console.log(JSON.stringify(summen, null, 1));
