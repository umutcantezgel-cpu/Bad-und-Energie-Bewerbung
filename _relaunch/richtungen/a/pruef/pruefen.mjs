#!/usr/bin/env node
// Prüft die Stilkachel gegen die harten Regeln (Bewegung, Schriftgrößen, Satz, Zeichen, Bedienmaße, Plan, Register, axe).
// Aufruf: node pruef/pruefen.mjs [--url http://localhost:3701/] [--nur bewegung,schrift,satz,zeichen,ziele,plan,register,fokus,axe,breiten]
// Ergebnis: je Prüfung "ok" oder die Befunde; Exit 1 bei mindestens einem Befund.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, newContext, collectErrors, overflowReport } from '../../../werkzeuge/lib/browser.mjs';
import AxeBuilder from '../../../werkzeuge/node_modules/@axe-core/playwright/dist/index.mjs';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') ? [...a, [x.slice(2), arr[i + 1]]] : a), []));
const url = new URL(args.url || 'http://localhost:3701/');
const nur = args.nur ? args.nur.split(',') : null;
const soll = (n) => !nur || nur.includes(n);
const browser = await launch();
let befunde = 0;
const melde = (titel, liste) => {
  if (!liste.length) console.log(`ok     ${titel}`);
  else { befunde += liste.length; console.log(`BEFUND ${titel} (${liste.length})`); for (const l of liste.slice(0, 25)) console.log('       - ' + (typeof l === 'string' ? l : JSON.stringify(l))); }
};
const vp = (w, h = 900) => ({ name: 'x', width: w, height: h, isMobile: w < 700, hasTouch: w < 700, deviceScaleFactor: 1 });
async function oeffne(w, scheme = 'light', motion = 'reduce', h) {
  const { context, requestLog } = await newContext(browser, { origin: url.origin, viewport: vp(w, h), colorScheme: scheme, reducedMotion: motion });
  const page = await context.newPage();
  const errors = collectErrors(page);
  await page.goto(url.href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, errors, requestLog };
}
const BREITEN = [320, 375, 414, 600, 768, 1024, 1100, 1280, 1440, 1920];

/* 1 Breiten: kein Überlauf, keine Fehler, keine Fremdanfragen */
if (soll('breiten')) {
  const liste = [];
  for (const scheme of ['light', 'dark']) for (const w of BREITEN) {
    const { context, page, errors, requestLog } = await oeffne(w, scheme);
    const o = await overflowReport(page);
    if (o.horizontal) liste.push(`${w} ${scheme}: horizontaler Überlauf (${o.scrollWidth} > ${o.clientWidth})`);
    if (o.clipped.length) liste.push(`${w} ${scheme}: abgeschnitten ${JSON.stringify(o.clipped.slice(0, 3))}`);
    if (errors.length) liste.push(`${w} ${scheme}: Fehler ${JSON.stringify(errors)}`);
    const fremd = requestLog.filter((r) => r.kind !== 'attrappe');
    if (fremd.length) liste.push(`${w} ${scheme}: Fremdanfragen ${JSON.stringify(fremd)}`);
    await context.close();
  }
  melde('Breiten 320 bis 1920, hell und dunkel: Überlauf, Fehler, Fremdanfragen', liste);
}

/* 2 Bewegung: nur transform, opacity, stroke-dashoffset; Dauern aus den Tokens; Verzögerungen Vielfache von 80 ms */
if (soll('bewegung')) {
  const liste = [];
  for (const w of [375, 1440]) {
    const { context, page } = await oeffne(w, 'light', 'no-preference');
    await page.waitForTimeout(2300);
    const r = await page.evaluate(() => {
      const ERLAUBT = new Set(['transform', 'opacity', 'stroke-dashoffset']);
      const DAUER = new Set([0, 120, 180, 320, 560, 900, 1200]);
      const out = [];
      const kf = {};
      const scan = (rule) => {
        if (rule.type === CSSRule.KEYFRAMES_RULE) for (const k of rule.cssRules) for (let i = 0; i < k.style.length; i++) (kf[rule.name] ||= new Set()).add(k.style[i]);
        else if (rule.cssRules) for (const c of rule.cssRules) scan(c);
      };
      for (const sh of document.styleSheets) for (const rule of sh.cssRules) scan(rule);
      for (const [n, set] of Object.entries(kf)) for (const p of set) if (!ERLAUBT.has(p)) out.push(`@keyframes ${n}: ${p}`);
      const ms = (s) => s.split(',').map((x) => (x.trim().endsWith('ms') ? parseFloat(x) : parseFloat(x) * 1000));
      for (const el of document.querySelectorAll('*')) for (const ps of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, ps);
        const bez = (el.tagName.toLowerCase() + '.' + (el.getAttribute('class') || '').split(' ')[0] + (ps || '')).slice(0, 60);
        const tp = cs.transitionProperty.split(',').map((x) => x.trim());
        const td = ms(cs.transitionDuration), tl = ms(cs.transitionDelay);
        tp.forEach((p, i) => {
          const d = td[i % td.length];
          if (d > 0) {
            if (!ERLAUBT.has(p)) out.push(`Übergang ${bez}: ${p} (${d} ms)`);
            if (!DAUER.has(d)) out.push(`Übergang ${bez}: Dauer ${d} ms außerhalb der Tokens`);
            if (tl[i % tl.length] !== 0) out.push(`Übergang ${bez}: Verzögerung`);
            if (!el.hasAttribute('data-motion')) out.push(`Übergang ${bez}: ohne data-motion`);
          }
        });
        const an = cs.animationName.split(',').map((x) => x.trim());
        const ad = ms(cs.animationDuration), al = ms(cs.animationDelay);
        an.forEach((n, i) => {
          if (n === 'none') return;
          if (!DAUER.has(ad[i % ad.length])) out.push(`Animation ${bez}: Dauer ${ad[i % ad.length]} ms außerhalb der Tokens`);
          if (al[i % al.length] % 80 !== 0) out.push(`Animation ${bez}: Verzögerung ${al[i % al.length]} ms kein Vielfaches von 80`);
          if (!el.hasAttribute('data-motion')) out.push(`Animation ${bez}: ohne data-motion`);
        });
      }
      return [...new Set(out)];
    });
    liste.push(...r.map((x) => `${w}: ${x}`));
    await context.close();
  }
  // reduziert: keine Animation, kein Übergang
  for (const w of [375, 1440]) {
    const { context, page } = await oeffne(w, 'light', 'reduce');
    const r = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('*')) for (const ps of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, ps);
        if (cs.animationName !== 'none') out.push('Animation ' + el.tagName + (ps || ''));
        if (cs.transitionDuration.split(',').some((d) => parseFloat(d) > 0)) out.push('Übergang ' + el.tagName + '.' + el.className + (ps || ''));
      }
      return [...new Set(out)];
    });
    liste.push(...r.map((x) => `reduziert ${w}: ${x}`));
    await context.close();
  }
  melde('Bewegung: nur transform, opacity, stroke-dashoffset; Tokens; Staffel; Kennung; reduziert', liste);
}

/* 3 Schriftgrößen aus den Tokens */
if (soll('schrift')) {
  const liste = [];
  for (const w of [320, 375, 768, 1024, 1440, 1920]) for (const scheme of ['light']) {
    const { context, page } = await oeffne(w, scheme);
    const r = await page.evaluate(() => {
      const d = document.createElement('div');
      document.body.appendChild(d);
      const tok = [];
      for (let i = 1; i <= 10; i++) { d.style.fontSize = `var(--t-${i})`; tok.push(parseFloat(getComputedStyle(d).fontSize)); }
      d.remove();
      const out = {};
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        if (!n.textContent.trim()) continue;
        const el = n.parentElement;
        if (['SCRIPT', 'STYLE'].includes(el.tagName)) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (!tok.some((t) => Math.abs(t - fs) < 0.06)) (out[fs] ||= []).push(el.tagName.toLowerCase() + '.' + (el.className.baseVal ?? el.className) + ' „' + n.textContent.trim().slice(0, 24) + '“');
      }
      return { tok, frei: out };
    });
    for (const [fsz, l] of Object.entries(r.frei)) liste.push(`${w}: ${fsz} px außerhalb der Tokens (${r.tok.map((x) => Math.round(x * 10) / 10).join('/')}): ${l.slice(0, 3).join('; ')}`);
    const klein = await page.evaluate(() => {
      let min = 99;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) if (n.textContent.trim()) min = Math.min(min, parseFloat(getComputedStyle(n.parentElement).fontSize));
      return min;
    });
    if (klein < 13) liste.push(`${w}: kleinste Schrift ${klein} px < 13`);
    await context.close();
  }
  melde('Schriftgrößen: alle Textknoten auf Token-Größen, kleinste ≥ 13 px', liste);
}

/* 4 Satz: geschütztes Leerzeichen vor Einheiten, Anführungszeichen */
if (soll('satz')) {
  const { context, page } = await oeffne(1440);
  const r = await page.evaluate(() => {
    const out = [];
    const re = /\d[ ](?:Uhr|km|Min\.|Sekunden|Tage|px|%|KB|ms|rem|em|su|Kilometer|Jahre)\b/;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const t = n.textContent;
      if (['SCRIPT', 'STYLE'].includes(n.parentElement.tagName)) continue;
      if (re.test(t)) out.push('Leerzeichen vor Einheit: „' + t.trim().slice(0, 50) + '“');
      if (t.includes('"') && !n.parentElement.closest('.mono')) out.push('gerades Anführungszeichen: „' + t.trim().slice(0, 50) + '“');
    }
    return out;
  });
  melde('Satz: geschütztes Leerzeichen vor Einheiten, typografische Anführungszeichen', r);
  await context.close();
}

/* 5 Zeichen innerhalb der Schnitte (unicode-range) */
if (soll('zeichen')) {
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const ranges = [];
  for (const m of html.matchAll(/unicode-range:([^}]+)\}/g)) for (const part of m[1].split(',')) {
    const [a, b] = part.trim().replace('U+', '').split('-');
    ranges.push([parseInt(a, 16), parseInt(b || a, 16)]);
  }
  const { context, page } = await oeffne(1440);
  const text = await page.evaluate(() => {
    const s = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (['SCRIPT', 'STYLE'].includes(n.parentElement.tagName)) continue;
      for (const c of n.textContent) s.add(c);
    }
    for (const el of document.querySelectorAll('title,desc')) for (const c of el.textContent) s.add(c);
    return [...s];
  });
  const fehl = text.filter((c) => { const cp = c.codePointAt(0); return cp > 32 && !ranges.some(([a, b]) => cp >= a && cp <= b); });
  melde('Zeichen: alle Zeichen liegen in den unicode-range-Teilmengen', fehl.map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase()} „${c}“`));
  await context.close();
}

/* 6 Bedienziele */
if (soll('ziele')) {
  const liste = [];
  for (const w of [375, 1440]) {
    const { context, page } = await oeffne(w);
    const r = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('a[href],button,summary,input,[tabindex="0"]')) {
        if (el.closest('.sr-only,[aria-hidden="true"]') || el.classList.contains('sprung')) continue;
        const b = el.getBoundingClientRect();
        if (!b.width || !b.height) continue;
        if (b.height < 43.5 || b.width < 43.5) out.push(`${el.tagName.toLowerCase()} „${(el.textContent || el.name || '').trim().slice(0, 22)}“ ${Math.round(b.width)}×${Math.round(b.height)}`);
      }
      return out;
    });
    liste.push(...r.map((x) => `${w}: ${x}`));
    await context.close();
  }
  melde('Bedienziele mindestens 44 px', liste);
}

/* 7 Lageplan: keine Überlappungen der Beschriftungen, alle Radien und Orte */
if (soll('plan')) {
  const liste = [];
  for (const w of [320, 375, 414, 768, 1024, 1440]) {
    const { context, page } = await oeffne(w);
    await page.locator('#einsatzgebiet').scrollIntoViewIfNeeded();
    for (const radius of [15, 25, 35]) {
      await page.locator(`input[name=radius][value="${radius}"]`).evaluate((i) => i.click());
      const orte = await page.$$eval('#einsatzgebiet .orte tbody tr', (rs) => rs.map((r) => r.getAttribute('data-ort')));
      for (const id of orte) {
        await page.locator(`#einsatzgebiet .orte tr[data-ort="${id}"] .ort-btn`).evaluate((b) => b.click());
        const r = await page.evaluate(({ radius, id }) => {
          const wrap = document.querySelector('.pl-wrap').getBoundingClientRect();
          const lab = [];
          const ul = document.querySelector(`.pl-t${radius}`);
          for (const li of ul.querySelectorAll('li')) {
            const cs = getComputedStyle(li);
            if (parseFloat(cs.opacity) < 0.5) continue;
            const b = li.getBoundingClientRect();
            lab.push({ t: li.textContent.trim(), ort: li.getAttribute('data-ort'), l: b.left + 1, r: b.right - 1, t0: b.top + 1, b: b.bottom - 1 });
          }
          const dots = [...document.querySelectorAll(`.pl-f${radius} .pl-punkt, .pl-f${radius} .pl-betrieb-ring`)].map((c) => { const b = c.getBoundingClientRect(); const o = c.closest('.pl-ort').getAttribute('data-ort'); return { ort: o, l: b.left - 1, r: b.right + 1, t0: b.top - 1, b: b.bottom + 1 }; });
          const hit = (a, b) => a.l < b.r && a.r > b.l && a.t0 < b.b && a.b > b.t0;
          const out = [];
          for (let i = 0; i < lab.length; i++) {
            const a = lab[i];
            if (a.l < wrap.left || a.r > wrap.right || a.t0 < wrap.top || a.b > wrap.bottom) out.push(`„${a.t}“ ragt aus dem Plan`);
            for (let j = i + 1; j < lab.length; j++) if (hit(a, lab[j])) out.push(`„${a.t}“ überlappt „${lab[j].t}“`);
            for (const d of dots) if (d.ort !== a.ort && hit(a, d)) out.push(`„${a.t}“ überlappt Punkt ${d.ort}`);
          }
          return out;
        }, { radius, id });
        for (const x of r) liste.push(`${w} Radius ${radius} gewählt ${id}: ${x}`);
      }
    }
    await context.close();
  }
  melde('Lageplan: Beschriftungen überlappen weder einander noch fremde Punkte, bleiben im Plan', [...new Set(liste)]);
}

/* 8 Register gegen Code */
if (soll('register')) {
  const liste = [];
  const { context, page } = await oeffne(1440, 'light', 'no-preference');
  const reg = await page.$$eval('table.register tbody th', (t) => t.map((x) => x.textContent.trim()));
  const dom = await page.$$eval('[data-motion]', (e) => [...new Set(e.map((x) => x.getAttribute('data-motion')))]);
  for (const id of dom) if (!reg.includes(id)) liste.push(`data-motion „${id}“ fehlt im Register`);
  for (const id of reg) if (!dom.includes(id)) liste.push(`Registereintrag „${id}“ ohne Element`);
  await context.close();
  melde(`Register: ${reg.length} Einträge, ${dom.length} Kennungen im Dokument`, liste);
}

/* 9 Fokus sichtbar auf allen Tab-Stopps */
if (soll('fokus')) {
  const liste = [];
  for (const [w, scheme] of [[375, 'light'], [1440, 'light'], [1440, 'dark']]) {
    const { context, page } = await oeffne(w, scheme);
    let stopps = 0;
    for (let i = 0; i < 90; i++) {
      await page.keyboard.press('Tab');
      const r = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        let t = el;
        if (el.matches('input[type=radio]')) t = el.nextElementSibling;
        const cs = getComputedStyle(t);
        const b = el.getBoundingClientRect();
        return { n: el.tagName.toLowerCase() + ' ' + (el.textContent || el.value || '').trim().slice(0, 20), w: parseFloat(cs.outlineWidth), s: cs.outlineStyle, vis: b.width > 0 };
      });
      if (!r) continue;
      stopps++;
      if (r.vis && (r.s === 'none' || r.w < 2)) liste.push(`${w} ${scheme}: ${r.n} ohne sichtbaren Fokus`);
    }
    if (stopps < 20) liste.push(`${w}: nur ${stopps} Tab-Stopps erreicht`);
    await context.close();
  }
  melde('Fokus: Ring von mindestens 2 px an allen Tab-Stopps', liste);
}

/* 10 axe */
if (soll('axe')) {
  const liste = [];
  for (const [w, scheme] of [[375, 'light'], [375, 'dark'], [1440, 'light'], [1440, 'dark']]) {
    const { context, page } = await oeffne(w, scheme);
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    for (const v of res.violations) liste.push(`${w} ${scheme}: ${v.id} (${v.impact}) ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
    await context.close();
  }
  melde('axe: WCAG 2.2 AA und Best Practice', liste);
}

await browser.close();
console.log(befunde ? `\n${befunde} Befund(e)` : '\nalle Prüfungen ohne Befund');
process.exit(befunde ? 1 : 0);
