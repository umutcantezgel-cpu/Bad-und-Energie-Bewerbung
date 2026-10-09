// Selbstprüfung (lesend): Token-Treue per getComputedStyle, Bewegungsregister, Deutsch-Satz, Touch-Ziele,
// Überlauf inkl. 320 px, axe-core, Kontraste der Rollen-Paare (hell/dunkel) und der Wärmebild-Farben.
// Aufruf: node pruef/pruefen.mjs → pruef/belege/pruefen.json
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const hier = path.dirname(fileURLToPath(import.meta.url));
const ordner = path.resolve(hier, '..');
const werkzeuge = path.resolve(ordner, '../../../werkzeuge');
const require = createRequire(path.join(werkzeuge, 'package.json'));
const { AxeBuilder } = require('@axe-core/playwright');
const { VIEWPORTS, launch, newContext, collectErrors, overflowReport } = await import(path.join(werkzeuge, 'lib/browser.mjs'));
const url = 'http://localhost:3803/';
const vps = [{ name: 'm320', width: 320, height: 568, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, ...VIEWPORTS];
const ergebnis = { url, erstellt: new Date().toISOString(), ansichten: [] };

// Kontraste (WCAG 2.2) aus den Hexwerten
const lum = (hex) => { const n = hex.replace('#', ''); const c = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const k = (a, b) => { const [h, d] = [lum(a), lum(b)].sort((x, y) => y - x); return Math.floor(((h + 0.05) / (d + 0.05)) * 100) / 100; };
const paare = [
  ['hell', 'Text tinte auf Papier', '#111A3B', '#FBF7F0', 4.5], ['hell', 'Text 2 auf Papier', '#3D4373', '#FBF7F0', 4.5], ['hell', 'Titel navy auf Papier', '#111D6D', '#FBF7F0', 4.5],
  ['hell', 'Weiß auf Knopf rot', '#FFFFFF', '#D60000', 4.5], ['hell', 'Weiß auf Knopf gedrückt', '#FFFFFF', '#A80000', 4.5], ['hell', 'Knopf gegen Papier (Bedienelement)', '#D60000', '#FBF7F0', 3],
  ['hell', 'Fokus blau auf Papier', '#1F57C4', '#FBF7F0', 3], ['hell', 'Rand (Bedienelement) auf Papier', '#7F84A3', '#FBF7F0', 3], ['hell', 'Tinte auf Wärmefläche (Zeile Hover)', '#111A3B', '#FADCC9', 4.5],
  ['dunkel', 'Text creme auf Nachtblau', '#F6F0E4', '#0A1033', 4.5], ['dunkel', 'Text 2 auf Nachtblau', '#C6C8DF', '#0A1033', 4.5], ['dunkel', 'Knopf rot gegen Nachtblau (Bedienelement)', '#D60000', '#0A1033', 3],
  ['dunkel', 'Weiß auf Knopf rot', '#FFFFFF', '#D60000', 4.5], ['dunkel', 'Fokus hellblau auf Nachtblau', '#7FAAFF', '#0A1033', 3], ['dunkel', 'Vorlauf koralle auf Nachtblau', '#FF5A4D', '#0A1033', 4.5],
  ['dunkel', 'Rücklauf hellblau auf Nachtblau', '#7FAAFF', '#0A1033', 4.5], ['dunkel', 'Rand auf Nachtblau', '#8E94C2', '#0A1033', 3], ['dunkel', 'Tinte auf Wärmefläche (Zeile Hover, dunkel)', '#111A3B', '#FADCC9', 4.5],
  ['bild', 'Creme auf kaltem Navy (H1 mobil, Messwerte)', '#FBF7F0', '#111D6D', 4.5], ['bild', 'Creme auf Blau-Isotherme', '#FBF7F0', '#1F57C4', 4.5], ['bild', 'Navy-Planbeschriftung auf Creme-Etikett', '#111D6D', '#FBF7F0', 4.5],
  ['bild', 'Navy-Strich auf Wandton', '#111D6D', '#F1E9DB', 3], ['bild', 'Navy-Strich auf Wärmefläche', '#111D6D', '#FADCC9', 3], ['bild', 'Navy-Strich auf heißester Isotherme (Papier)', '#111D6D', '#FBF7F0', 3],
  ['bild', 'Creme-Strich auf Navy (Blaupause)', '#FBF7F0', '#111D6D', 3], ['bild', 'Vorlauf rot auf Wärmefläche (Hof der Leitung)', '#D60000', '#FADCC9', 3], ['bild', 'Rücklauf blau auf Wandton', '#1F57C4', '#F1E9DB', 3],
  ['bild hell', 'Vorlauf rot gegen Papier-Mantel', '#D60000', '#FBF7F0', 3], ['bild hell', 'Rücklauf blau gegen Papier-Mantel', '#1F57C4', '#FBF7F0', 3], ['bild hell', 'Papier-Mantel gegen Bild-Navy', '#FBF7F0', '#111D6D', 3],
  ['bild dunkel', 'Vorlauf koralle auf Bild-Navy', '#FF5A4D', '#111D6D', 3], ['bild dunkel', 'Rücklauf hellblau auf Bild-Navy', '#7FAAFF', '#111D6D', 3], ['bild dunkel', 'Nachtblau-Mantel gegen Wandton', '#0A1033', '#F1E9DB', 3],
  ['bild dunkel', 'Vorlauf koralle gegen Nachtblau-Mantel', '#FF5A4D', '#0A1033', 3], ['bild', 'Marke: Navy-Ring gegen Wandton', '#111D6D', '#F1E9DB', 3], ['bild', 'Marke: Creme-Platte gegen Bild-Navy', '#FBF7F0', '#111D6D', 3],
];
ergebnis.kontraste = paare.map(([t, n, a, b, soll]) => ({ thema: t, paar: n, vorder: a, hinter: b, verhaeltnis: k(a, b), soll, ok: k(a, b) >= soll }));

// Deutsch: Zahl + Einheit ohne geschütztes Leerzeichen?
{
  const html = await fs.readFile(path.join(ordner, 'index.html'), 'utf8');
  const text = html.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<path[^>]*>/g, '').replace(/<[^>]+>/g, ' ');
  ergebnis.leerzeichen_vor_einheit = [...text.matchAll(/\d [ ]?(km|Uhr|Min\.|Sekunden|Tage|€|%)/g)].map((m) => m[0]);
}

const browser = await launch();
for (const vp of vps) for (const scheme of ['light', 'dark']) {
  if (!['m320', 'm390', 'd1440', 't768', 'd1920'].includes(vp.name) && scheme === 'dark') continue;
  // volle Bewegung, nach dem Auftakt gemessen (Dauern und Kurven sind dann die echten Token-Werte)
  const { context, requestLog } = await newContext(browser, { origin: new URL(url).origin, viewport: vp, colorScheme: scheme, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const fehler = collectErrors(page);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  await page.evaluate(() => document.fonts.ready);
  const messung = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const px = (v) => parseFloat(v);
    const tok = {};
    const probe = document.createElement('div');
    document.body.appendChild(probe);
    for (let i = 1; i <= 10; i++) { probe.style.setProperty('font-size', `var(--t-${i})`); tok[`t-${i}`] = px(getComputedStyle(probe).fontSize); }
    probe.remove();
    const erlaubt = Object.values(tok).map((v) => Math.round(v * 100) / 100);
    const frei = [];
    const gesehen = new Set();
    for (const el of document.querySelectorAll('body *')) {
      if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
      const f = Math.round(px(cs.fontSize) * 100) / 100;
      gesehen.add(f);
      if (!erlaubt.some((e) => Math.abs(e - f) < 0.05)) frei.push({ el: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''), f, text: el.textContent.trim().slice(0, 30) });
    }
    // Dauern aus Übergängen und Animationen
    const dauern = new Set(); const kurven = new Set();
    for (const el of document.querySelectorAll('*')) {
      for (const sel of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, sel);
        const tD = cs.transitionDuration.split(','), tK = cs.transitionTimingFunction.split(/,(?![^(]*\))/);
        const aD = cs.animationName === 'none' ? [] : cs.animationDuration.split(','), aK = cs.animationName === 'none' ? [] : cs.animationTimingFunction.split(/,(?![^(]*\))/);
        tD.forEach((d, i) => { const v = parseFloat(d) * (d.includes('ms') ? 1 : 1000); if (v > 0) { dauern.add(Math.round(v)); kurven.add((tK[i] || tK[0]).trim()); } });
        aD.forEach((d, i) => { const v = parseFloat(d) * (d.includes('ms') ? 1 : 1000); if (v > 0) { dauern.add(Math.round(v)); kurven.add((aK[i] || aK[0]).trim()); } });
      }
    }
    // Touch-Ziele
    const ziele = [...document.querySelectorAll('a, button, summary')].filter((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 && !e.closest('.sprung'); })
      .map((e) => { const r = e.getBoundingClientRect(); return { el: e.className || e.tagName, text: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24), b: Math.round(r.width), h: Math.round(r.height), imText: !!e.closest('p, figcaption, .fuss') }; });
    const motion = [...new Set([...document.querySelectorAll('[data-motion]')].map((e) => e.getAttribute('data-motion')))];
    return { tokens: tok, ansicht_breite: innerWidth, schriftgroessen: [...gesehen].sort((a, b) => a - b), freie_schriftgroessen: frei.slice(0, 20), dauern_ms: [...dauern].sort((a, b) => a - b), kurven: [...kurven], zu_klein: ziele.filter((z) => !z.imText && (z.h < 44 || z.b < 44)), data_motion: motion, h1_px: px(getComputedStyle(document.querySelector('.held__titel .t1')).fontSize) };
  });
  const ueberlauf = await overflowReport(page);
  let axe = null;
  if (['m320', 'm390', 'd1440', 't768'].includes(vp.name)) {
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    axe = { verstoesse: r.violations.map((v) => ({ id: v.id, impact: v.impact, knoten: v.nodes.length, ziel: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) })) };
  }
  ergebnis.ansichten.push({ ansicht: vp.name, schema: scheme, ...messung, ueberlauf, axe, fehler, fremdanfragen: requestLog.filter((x) => x.kind !== 'attrappe') });
  await context.close();
}
// Zoom 200 %: H1 bei 1440 → 720 CSS-Pixel muss in Gerätepixeln größer werden
{
  const h1 = async (w, h, dsf) => { const { context } = await newContext(browser, { origin: new URL(url).origin, viewport: { width: w, height: h, deviceScaleFactor: dsf, isMobile: false, hasTouch: false, name: 'z' }, reducedMotion: 'reduce' }); const p = await context.newPage(); await p.goto(url); const v = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.held__titel .t1')).fontSize)); await context.close(); return v * dsf; };
  const z100 = await h1(1440, 900, 1), z200 = await h1(720, 450, 2);
  ergebnis.zoom200 = { h1_geraetepixel_100: z100, h1_geraetepixel_200: z200, vergroessert: z200 > z100 };
}
await browser.close();
await fs.mkdir(path.join(hier, 'belege'), { recursive: true });
await fs.writeFile(path.join(hier, 'belege/pruefen.json'), JSON.stringify(ergebnis, null, 2));
const kurz = ergebnis.ansichten.map((a) => `${a.ansicht}-${a.schema}: frei ${a.freie_schriftgroessen.length}, klein ${a.zu_klein.length}, ueberlauf ${a.ueberlauf.horizontal}/${a.ueberlauf.clipped.length}, axe ${a.axe ? a.axe.verstoesse.length : '-'}, fehler ${a.fehler.length}, fremd ${a.fremdanfragen.length}, h1 ${a.h1_px}`);
console.log(kurz.join('\n'));
console.log('Tokens m320', JSON.stringify(ergebnis.ansichten[0].tokens));
console.log('Dauern', JSON.stringify([...new Set(ergebnis.ansichten.flatMap((a) => a.dauern_ms))].sort((a, b) => a - b)), 'Kurven', JSON.stringify([...new Set(ergebnis.ansichten.flatMap((a) => a.kurven))]));
console.log('Kontraste nicht ok', ergebnis.kontraste.filter((x) => !x.ok));
console.log('Leerzeichen', ergebnis.leerzeichen_vor_einheit, 'Zoom', JSON.stringify(ergebnis.zoom200));
console.log('motion', JSON.stringify(ergebnis.ansichten[0].data_motion));
for (const a of ergebnis.ansichten) { if (a.freie_schriftgroessen.length) console.log(a.ansicht, JSON.stringify(a.freie_schriftgroessen.slice(0, 5))); if (a.zu_klein.length) console.log(a.ansicht, 'klein', JSON.stringify(a.zu_klein)); if (a.axe && a.axe.verstoesse.length) console.log(a.ansicht, a.schema, 'axe', JSON.stringify(a.axe.verstoesse)); if (a.ueberlauf.clipped.length) console.log(a.ansicht, JSON.stringify(a.ueberlauf.clipped.slice(0, 3))); }
