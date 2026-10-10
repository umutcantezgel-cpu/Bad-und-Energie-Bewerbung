// Laufweite messen und vergleichen (R3-PERF-01, Sichtprüfung in Zahlen): misst je Seite und Ansicht die Breite,
// Höhe und Zeilenzahl jedes Textknotens, nachdem alle Schriften geladen sind. Zwei Läufe (vorher/nachher) werden
// Knoten für Knoten verglichen: gleiche Schrift heißt gleiche Breiten (± Rundung) und gleiche Umbrüche.
//
// Aufruf:
//   node _relaunch/werkzeuge/schriften/laufweite.mjs --base http://localhost:3460 --out <a.json> [--vps m390,d1440] [--only start,…]
//   node _relaunch/werkzeuge/schriften/laufweite.mjs --vergleich <a.json> <b.json> [--out <vergleich.json>]
//
// Lesend, Anfragesperre (G5) aus lib/browser.mjs, reduzierte Bewegung (Endzustand), keine Formularsendung.
import fs from 'node:fs/promises';
import path from 'node:path';
import { GRUNDMENGE, VIEWPORTS, launch, newContext, scrollThrough } from '../lib/browser.mjs';

const argv = process.argv.slice(2);
const args = Object.fromEntries(argv.reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]]] : acc), []));

async function messen() {
  const base = (args.base ?? 'http://localhost:3460').replace(/\/$/, '');
  const vps = VIEWPORTS.filter((v) => (args.vps ?? 'm390,d1440').split(',').includes(v.name));
  const only = args.only ? args.only.split(',') : null;
  const browser = await launch();
  const ergebnis = { basis: base, erstellt: new Date().toISOString(), seiten: {} };
  for (const p of GRUNDMENGE) {
    if (only && !only.includes(p.slug)) continue;
    for (const vp of vps) {
      const { context } = await newContext(browser, { origin: base, viewport: vp, colorScheme: 'light', reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(base + p.path, { waitUntil: 'networkidle', timeout: 60_000 });
      await scrollThrough(page, { pauseMs: 60 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(200);
      const daten = await page.evaluate(() => {
        const schriften = [...document.fonts].map((f) => `${f.family}|${f.weight}|${f.stretch}|${f.status}`).sort();
        const knoten = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        let i = 0;
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const el = n.parentElement;
          if (!el || el.closest('script,style,noscript,template')) continue;
          const text = (n.nodeValue || '').replace(/\s+/g, ' ').trim();
          if (!text) continue;
          range.selectNodeContents(n);
          const rects = [...range.getClientRects()].filter((r) => r.width > 0);
          const box = range.getBoundingClientRect();
          const ff = getComputedStyle(el).fontFamily.toLowerCase();
          const fam = ff.includes('bricolage') ? 'bricolage' : ff.includes('atkinson') ? 'atkinson' : ff.includes('martian') ? 'martian' : 'andere';
          knoten.push({ i: i++, fam, text: text.slice(0, 48), b: Math.round(box.width * 100) / 100, h: Math.round(box.height * 100) / 100, zeilen: rects.length, x: Math.round(box.left * 100) / 100, y: Math.round((box.top + scrollY) * 100) / 100 });
        }
        // Ziffernbreite von Martian Mono (Breite 75 %) und der Ersatzschrift, je in em
        const probe = (family) => {
          const s = document.createElement('span');
          s.textContent = '0000000000';
          s.style.cssText = `position:absolute;visibility:hidden;font-family:${family};font-size:100px;font-stretch:75%;font-weight:600;white-space:nowrap`;
          document.body.append(s);
          const w = s.getBoundingClientRect().width / 1000;
          s.remove();
          return Math.round(w * 1000) / 1000;
        };
        const mass = getComputedStyle(document.documentElement).getPropertyValue('--font-mass') || 'var(--font-mass)';
        return { schriften, knoten, hoehe: document.documentElement.scrollHeight, zifferEm: { martian: probe('var(--font-mass)'), ersatz: probe('"Martian Ersatz"'), massStapel: mass.trim().slice(0, 80) } };
      });
      ergebnis.seiten[`${p.slug}@${vp.name}`] = daten;
      process.stdout.write(`${p.slug}@${vp.name}: ${daten.knoten.length} Textknoten, Höhe ${daten.hoehe}\n`);
      await context.close();
    }
  }
  await browser.close();
  return ergebnis;
}

async function vergleichen(aDatei, bDatei) {
  const a = JSON.parse(await fs.readFile(aDatei, 'utf8'));
  const b = JSON.parse(await fs.readFile(bDatei, 'utf8'));
  const zusammenfassung = { a: aDatei, b: bDatei, seiten: {} };
  let gesamt = { knoten: 0, breiteMax: 0, ueber05: 0, zeilenAnders: 0, textAnders: 0, hoeheAnders: 0 };
  for (const [key, sa] of Object.entries(a.seiten)) {
    const sb = b.seiten[key];
    if (!sb) continue;
    const s = { knoten: Math.min(sa.knoten.length, sb.knoten.length), knotenA: sa.knoten.length, knotenB: sb.knoten.length, breiteMax: 0, ueber05: [], zeilenAnders: [], textAnders: 0, seitenhoehe: [sa.hoehe, sb.hoehe], ziffernEm: [sa.zifferEm, sb.zifferEm], schriftenB: sb.schriften.filter((f) => f.endsWith('loaded')) };
    for (let i = 0; i < s.knoten; i++) {
      const ka = sa.knoten[i];
      const kb = sb.knoten[i];
      if (ka.text !== kb.text) {
        s.textAnders++;
        continue;
      }
      const d = Math.abs(ka.b - kb.b);
      s.breiteMax = Math.max(s.breiteMax, d);
      if (d > 0.5) s.ueber05.push({ text: ka.text, fam: ka.fam, a: ka.b, b: kb.b });
      if (ka.zeilen !== kb.zeilen) s.zeilenAnders.push({ text: ka.text, fam: ka.fam, a: ka.zeilen, b: kb.zeilen });
    }
    gesamt.knoten += s.knoten;
    gesamt.breiteMax = Math.max(gesamt.breiteMax, s.breiteMax);
    gesamt.ueber05 += s.ueber05.length;
    gesamt.zeilenAnders += s.zeilenAnders.length;
    gesamt.textAnders += s.textAnders;
    gesamt.hoeheAnders += sa.hoehe !== sb.hoehe ? 1 : 0;
    s.breiteMax = Math.round(s.breiteMax * 100) / 100;
    zusammenfassung.seiten[key] = s;
    console.log(`${key.padEnd(36)} Knoten ${s.knoten} · Breite max Δ ${s.breiteMax} px · >0,5 px ${s.ueber05.length} · Umbruch anders ${s.zeilenAnders.length} · Seitenhöhe ${sa.hoehe}/${sb.hoehe}`);
  }
  gesamt.breiteMax = Math.round(gesamt.breiteMax * 100) / 100;
  zusammenfassung.gesamt = gesamt;
  console.log('Gesamt', JSON.stringify(gesamt));
  return zusammenfassung;
}

const ergebnis = args.vergleich ? await vergleichen(args.vergleich, argv[argv.indexOf('--vergleich') + 2]) : await messen();
if (args.out) {
  await fs.mkdir(path.dirname(path.resolve(args.out)), { recursive: true });
  await fs.writeFile(path.resolve(args.out), JSON.stringify(ergebnis, null, 1) + '\n');
}
