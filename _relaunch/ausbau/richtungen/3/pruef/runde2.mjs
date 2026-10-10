// Nachweise zur Reparatur-Runde 2 (Befunde der Gegenprüfung), lesend gegen http://localhost:3803/
//  A Zoom 200 % (H1 in Gerätepixeln)        B Desktop: Aktion im Fluss, Abstand Einleitung–Knopf, Rohrbogen
//  C Mobil: Knopf und Zusage im ersten Bild  D Größere Grundschrift (125 / 150 %): Himmel über dem First
//  E Bewegung: jede Animation mit data-motion F Schriften: Martian Mono nur für Maße und Planbeschriftung
//  G Tablett: Abstand Titel–Dachlinie        H Zeigen: Knöpfe, Messfeld, Tastatur
// Aufruf: node pruef/runde2.mjs → pruef/belege/runde2.json
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const hier = path.dirname(fileURLToPath(import.meta.url));
const werkzeuge = path.resolve(hier, '../../../../werkzeuge');
const { launch, newContext, collectErrors } = await import(path.join(werkzeuge, 'lib/browser.mjs'));
const url = 'http://localhost:3803/';
const origin = new URL(url).origin;
const browser = await launch();
const erg = { url, erstellt: new Date().toISOString() };

async function seite(vp, { motion = 'reduce', scheme = 'light', schrift } = {}) {
  const mobile = vp.width < 960;
  const { context } = await newContext(browser, { origin, viewport: { name: 'p', isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, ...vp }, colorScheme: scheme, reducedMotion: motion });
  const page = await context.newPage();
  const fehler = collectErrors(page);
  if (schrift) await page.addInitScript((v) => { document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.fontSize = v; }); }, schrift);
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(motion === 'reduce' ? 300 : 2200);
  return { context, page, fehler };
}
const rect = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), left: +r.left.toFixed(1), right: +r.right.toFixed(1) }; }, sel);

// A Zoom 200 %: gleiche Fensterbreite in Gerätepixeln, halbe CSS-Breite bei doppelter Pixeldichte
erg.zoom200 = [];
for (const [w, h] of [[1440, 900], [1920, 1080], [1920, 950], [1280, 633]]) {
  const mess = async (cw, ch, dsf) => { const { context, page } = await seite({ width: cw, height: ch, deviceScaleFactor: dsf, isMobile: false, hasTouch: false }); const v = await page.evaluate(() => ({ h1: parseFloat(getComputedStyle(document.querySelector('.held__titel .t1')).fontSize), t2: parseFloat(getComputedStyle(document.querySelector('.held__titel .t2')).fontSize), ueberlauf: document.documentElement.scrollWidth > innerWidth })); await context.close(); return { h1_geraetepixel: +(v.h1 * dsf).toFixed(1), t2_geraetepixel: +(v.t2 * dsf).toFixed(1), ueberlauf: v.ueberlauf }; };
  const z100 = await mess(w, h, 1), z200 = await mess(Math.round(w / 2), Math.round(h / 2), 2);
  erg.zoom200.push({ fenster: `${w}×${h}`, z100, z200, h1_waechst: z200.h1_geraetepixel > z100.h1_geraetepixel, t2_waechst: z200.t2_geraetepixel > z100.t2_geraetepixel });
}

// B Desktop: Aktion im Fluss (S-15), Abstand ≥ --a-5, Rohrbogen trifft Knopf und Pumpenhöhe
erg.desktop = [];
for (const [w, h] of [[1920, 600], [1680, 650], [1440, 600], [1440, 900], [1920, 937], [1920, 1080], [2560, 1300], [1280, 720], [1366, 768], [1440, 780], [1536, 730], [1280, 800], [960, 1080], [1024, 640]]) {
  for (const motion of ['reduce', 'no-preference']) {
    const { context, page, fehler } = await seite({ width: w, height: h }, { motion });
    const m = await page.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const lead = r('.held__lead'), knopf = r('.aktion .knopf'), mikro = r('.mikro'), weg2 = r('.weg2'), lage = r('[data-wb-lage]'), wb = r('.wb'), held = r('.held');
      const a5 = parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.5;
      const pfad = document.querySelector('.aktion__rohr path');
      const d = pfad.getAttribute('d') || '';
      const zahlen = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      const start = zahlen.slice(0, 2), ende = [zahlen[zahlen.length - 1], null];
      const pumpeY = lage.top + lage.height * 676 / 800 - held.top;
      // Text, der vom Knopf, von der Zusage oder vom zweiten Weg überdeckt würde
      const ueberlappt = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      return {
        abstand_einleitung_knopf: +(knopf.top - lead.bottom).toFixed(1), mindestens_a5: knopf.top - lead.bottom >= a5 - 0.5,
        ueberdeckung: [mikro, weg2, knopf].some((x) => ueberlappt(x, lead)),
        weg2_unterkante: +weg2.bottom.toFixed(1), fensterhoehe: innerHeight, weg2_im_ersten_bild: weg2.bottom <= innerHeight,
        knopf_im_ersten_bild: knopf.bottom <= innerHeight,
        rohr_start_x_bildkante: Math.abs(start[0] - (wb.left - held.left)) < 1, rohr_start_y_pumpe: Math.abs(start[1] - pumpeY) < 1,
        rohr_ende_am_knopf: Math.abs(ende[0] - (knopf.right - held.left)) < 1, rohr_d: d.slice(0, 120),
        first_sichtbar: lage.top + lage.height * 344 / 800 >= wb.top - 0.5,
      };
    });
    erg.desktop.push({ fenster: `${w}×${h}`, bewegung: motion, ...m, fehler: fehler.length });
    await context.close();
  }
}

// C Mobil: Knopf und Zusage vollständig im ersten Bildschirm (kleiner Viewport), Leiste nur, wenn nötig
erg.mobil = [];
for (const [w, h] of [[390, 664], [375, 667], [360, 640], [390, 844], [375, 812], [430, 932], [320, 568], [414, 736]]) {
  for (const motion of ['reduce', 'no-preference']) {
    const { context, page } = await seite({ width: w, height: h, deviceScaleFactor: 2 }, { motion });
    const m = await page.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const knopf = r('.aktion .knopf'), mikro = r('.mikro'), weg2 = r('.weg2'), rahmen = r('.wb__rahmen'), lage = r('[data-wb-lage]');
      return { knopf: [Math.round(knopf.top), Math.round(knopf.bottom)], zusage_unten: Math.round(mikro.bottom), weg2_unten: Math.round(weg2.bottom), fenster: innerHeight,
        knopf_ganz: knopf.bottom <= innerHeight, zusage_ganz: mikro.bottom <= innerHeight, leiste: document.querySelector('.leiste').classList.contains('ist-sichtbar'),
        bild_h: Math.round(rahmen.height), haus_breite: Math.round(lage.width * 432 / 800), h1: parseFloat(getComputedStyle(document.querySelector('.held__titel .t1')).fontSize) };
    });
    m.leiste_richtig = m.leiste === !m.knopf_ganz;
    erg.mobil.push({ fenster: `${w}×${h}`, bewegung: motion, ...m });
    await context.close();
  }
}

// D Größere Grundschrift: Abstand jeder Textzeile zum Dach (First) und Lage des Knopfes
const himmelAbstand = (page) => page.evaluate(() => {
  const lage = document.querySelector('[data-wb-lage]').getBoundingClientRect(), s = lage.width / 800;
  let min = Infinity, wo = '';
  document.querySelectorAll('.held__kopf .ortsmarke, .held__titel .t1 > span, .held__titel .t2 > span').forEach((el) => {
    const r = document.createRange(); r.selectNodeContents(el);
    for (const q of r.getClientRects()) {
      const x0 = (q.left - lage.left) / s, x1 = (q.right - lage.left) / s, x = Math.min(Math.max(400, x0), x1);
      const dach = x >= 168 && x <= 632 ? 344 + Math.abs(x - 400) : 576;
      const abstand = lage.top + dach * s - q.bottom;
      if (abstand < min) { min = abstand; wo = el.textContent.trim(); }
    }
  });
  return { kleinster_abstand_zum_dach_px: +min.toFixed(1), zeile: wo };
});
erg.grundschrift = [];
for (const fs_ of ['100%', '125%', '150%']) {
  for (const [w, h] of [[390, 844], [390, 664], [768, 1024]]) {
    const { context, page } = await seite({ width: w, height: h, deviceScaleFactor: 2 }, { schrift: fs_ });
    const a = await himmelAbstand(page);
    const k = await rect(page, '.aktion .knopf');
    const z = await rect(page, '.mikro');
    const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    erg.grundschrift.push({ schrift: fs_, fenster: `${w}×${h}`, ...a, knopf_unten: k.bottom, zusage_unten: z.bottom, fenster_h: h, ueberlauf });
    await context.close();
  }
}

// E Bewegung: jede laufende Animation (Auftakt und Ruhe) hat data-motion am Element oder an einem Vorfahren
erg.bewegung = [];
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const mobile = w < 960;
  const { context } = await newContext(browser, { origin, viewport: { name: 'b', width: w, height: h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'commit' });
  const proben = [];
  for (const t of [250, 500, 800, 1100]) {
    await page.waitForTimeout(t === 250 ? 250 : t - [250, 500, 800, 1100][[250, 500, 800, 1100].indexOf(t) - 1]);
    proben.push(await page.evaluate(() => document.getAnimations().map((a) => {
      const el = a.effect.target; const mit = el && el.closest('[data-motion]');
      return { el: (el.getAttribute('class') || el.tagName) + (a.effect.pseudoElement || ''), motion: mit ? mit.getAttribute('data-motion') : null, im_anschluss: !!(el && el.closest('.anschluss')) };
    })));
  }
  const alle = proben.flat();
  erg.bewegung.push({ ansicht: `${w}×${h}`, animationen: alle.length, ohne_data_motion: alle.filter((x) => !x.motion), im_anschluss: alle.filter((x) => x.im_anschluss), kennungen: [...new Set(alle.map((x) => x.motion))] });
  await context.close();
}

// F Schriften: Elemente mit eigenem Text in Martian Mono (sichtbar, alle Ansichten)
erg.martian = [];
for (const [w, h] of [[390, 844], [768, 1024], [1440, 900]]) {
  const { context, page } = await seite({ width: w, height: h }, { motion: 'reduce' });
  const liste = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && getComputedStyle(el).fontFamily.includes('Martian') && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden').map((el) => ({ klasse: el.getAttribute('class') || el.tagName.toLowerCase(), text: el.textContent.trim().slice(0, 40) })));
  erg.martian.push({ ansicht: `${w}×${h}`, elemente: liste });
  await context.close();
}

// G Tablett: Titel gegen die Dachlinie (Befund: 4 px)
erg.tablett = [];
for (const [w, h] of [[768, 1024], [600, 960], [820, 1180], [912, 1368]]) {
  const { context, page } = await seite({ width: w, height: h, deviceScaleFactor: 2 });
  erg.tablett.push({ fenster: `${w}×${h}`, ...(await himmelAbstand(page)) });
  await context.close();
}

// H Zeigen: Knöpfe erreichbar (Tastatur), Messfeld erscheint, Größe der Ziele
{
  const { context, page } = await seite({ width: 390, height: 844, deviceScaleFactor: 2 }, { motion: 'reduce' });
  const ziele = await page.evaluate(() => [...document.querySelectorAll('.wb-marke')].map((b) => { const r = b.getBoundingClientRect(); return { name: b.textContent.replace(/­/g, ''), b: Math.round(r.width), h: Math.round(r.height) }; }));
  await page.focus('.wb-marke[data-zone="1"]');
  await page.keyboard.press('Enter');
  const nach = await page.evaluate(() => ({ zone: document.querySelector('[data-wb-lage]').dataset.zone, gedrueckt: document.querySelector('.wb-marke[data-zone="1"]').getAttribute('aria-pressed'), messfeld: getComputedStyle(document.querySelector('.wb-messfeld[data-zone="1"]')).display }));
  await page.keyboard.press('Enter');
  const aus = await page.evaluate(() => ({ zone: document.querySelector('[data-wb-lage]').dataset.zone ?? null, gedrueckt: document.querySelector('.wb-marke[data-zone="1"]').getAttribute('aria-pressed') }));
  erg.zeigen = { ziele, tastatur_ein: nach, tastatur_aus: aus };
  await context.close();
}

await browser.close();
await fs.mkdir(path.join(hier, 'belege'), { recursive: true });
await fs.writeFile(path.join(hier, 'belege/runde2.json'), JSON.stringify(erg, null, 2));
const kurz = {
  zoom: erg.zoom200.map((z) => `${z.fenster}: ${z.z100.h1_geraetepixel}→${z.z200.h1_geraetepixel} ${z.h1_waechst ? 'ok' : 'FEHLT'}`),
  desktop: erg.desktop.filter((x) => x.bewegung === 'reduce').map((x) => `${x.fenster}: Abstand ${x.abstand_einleitung_knopf} ${x.mindestens_a5 ? 'ok' : 'ZU KLEIN'} ${x.ueberdeckung ? 'ÜBERDECKT' : ''} weg2 ${x.weg2_unterkante}/${x.fensterhoehe} rohr ${x.rohr_start_x_bildkante && x.rohr_start_y_pumpe && x.rohr_ende_am_knopf ? 'ok' : 'FEHLER'} first ${x.first_sichtbar ? 'ok' : 'ANGESCHNITTEN'}`),
  mobil: erg.mobil.map((x) => `${x.fenster} ${x.bewegung}: Knopf ${x.knopf.join('–')} Zusage ${x.zusage_unten}/${x.fenster} ${x.knopf_ganz && x.zusage_ganz ? 'ok' : 'UNTER DER KANTE'} Leiste ${x.leiste ? 'an' : 'aus'} ${x.leiste_richtig ? '' : 'FALSCH'} Bild ${x.bild_h} Haus ${x.haus_breite}`),
  grundschrift: erg.grundschrift.map((x) => `${x.schrift} ${x.fenster}: Dach ${x.kleinster_abstand_zum_dach_px} (${x.zeile}) Knopf ${x.knopf_unten} Zusage ${x.zusage_unten}/${x.fenster_h}`),
  bewegung: erg.bewegung.map((b) => `${b.ansicht}: ${b.animationen} Animationen, ohne Kennung ${b.ohne_data_motion.length}, im Anschluss ${b.im_anschluss.length}; ${b.kennungen.join(', ')}`),
  martian: erg.martian.map((m) => `${m.ansicht}: ${[...new Set(m.elemente.map((e) => e.klasse))].join(', ')}`),
  tablett: erg.tablett.map((t) => `${t.fenster}: ${t.kleinster_abstand_zum_dach_px} (${t.zeile})`),
  zeigen: erg.zeigen,
};
console.log(JSON.stringify(kurz, null, 1));
