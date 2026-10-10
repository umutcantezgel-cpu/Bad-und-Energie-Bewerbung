// Prüfskript R3-HOME-03 (Prüfer): nur lesend, über den Browser-Kern mit Anfragesperre (G5).
import fs from 'node:fs/promises';
import path from 'node:path';
import { launch, newContext, overflowReport, scrollThrough } from '/home/user/Bad-und-Energie-Bewerbung/_relaunch/werkzeuge/lib/browser.mjs';

const BASE = 'http://localhost:3450';
const OUT = '/home/user/Bad-und-Energie-Bewerbung/_relaunch/belege/r3-home-03-pruef/interaktion';
await fs.mkdir(OUT, { recursive: true });
const VPS = {
  m320: { name: 'm320', width: 320, height: 640, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  m390: { name: 'm390', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  m430: { name: 'm430', width: 430, height: 932, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  d1440: { name: 'd1440', width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
  d1920: { name: 'd1920', width: 1920, height: 1080, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
};
const browser = await launch();
const report = {};

async function open(vp, { scheme = 'light', js = true } = {}) {
  const { context, requestLog } = await newContext(browser, { origin: BASE, viewport: vp, colorScheme: scheme, reducedMotion: 'reduce', javaScriptEnabled: js });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE + '/', { waitUntil: js ? 'networkidle' : 'load', timeout: 60_000 });
  if (js) await page.evaluate(() => document.fonts?.ready);
  return { context, page, requestLog, errors };
}

const targets = (page, sel) =>
  page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return null;
    const out = [];
    for (const el of root.querySelectorAll('a,button,summary,input,select,[tabindex]')) {
      let box = el;
      if (el.tagName === 'INPUT' && el.closest('label')) box = el.closest('label');
      const r = box.getBoundingClientRect();
      const name = (box.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50);
      out.push({ tag: el.tagName.toLowerCase(), type: el.type || '', name, w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out;
  }, sel);

for (const vpName of ['m320', 'm390', 'm430', 'd1440', 'd1920']) {
  const { context, page, requestLog, errors } = await open(VPS[vpName]);
  await scrollThrough(page);
  const overflow = await overflowReport(page);
  const section = await page.evaluate(() => {
    const s = document.querySelector('#einsatzgebiet');
    const r = s.getBoundingClientRect();
    const wide = [...s.querySelectorAll('*')].filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1 && !el.closest('.sr-only')).map((el) => el.tagName + '.' + String(el.className).slice(0, 40));
    return { height: Math.round(r.height), width: Math.round(r.width), wide: wide.slice(0, 10), h1: document.querySelectorAll('h1').length };
  });
  const t = await targets(page, '#einsatzgebiet');
  const f = await targets(page, '[aria-labelledby="footer-einsatzgebiet"]');
  report[vpName] = { overflow, section, small: t.filter((x) => x.h < 44 || x.w < 44), footerSmall: f?.filter((x) => x.h < 44 || x.w < 24), requests: requestLog, errors };
  // Abschnitt als Ganzes
  const el = page.locator('#einsatzgebiet');
  await el.screenshot({ path: path.join(OUT, `gebiet__${vpName}-light.png`) });
  await context.close();
}

// Interaktion bei 390 hell
{
  const { context, page, requestLog } = await open(VPS.m390);
  const r = {};
  // Tastatur: vom Abschnittskopf per Tab zum Radius-Umschalter
  await page.locator('#einsatzgebiet-title').scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const h = document.querySelector('#einsatzgebiet-title');
    h.setAttribute('tabindex', '-1');
    h.focus();
  });
  const stops = [];
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Tab');
    stops.push(await page.evaluate(() => {
      const a = document.activeElement;
      const lab = a.closest('label');
      const cs = getComputedStyle(lab || a);
      return { tag: a.tagName, type: a.type, name: a.name, value: a.value, labelOutline: lab ? `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} off ${cs.outlineOffset}` : '' };
    }));
    if (stops.at(-1).type === 'radio') break;
  }
  r.tabStops = stops;
  const sw = page.locator('#einsatzgebiet fieldset').first();
  await sw.screenshot({ path: path.join(OUT, 'fokus-radius__m390-light.png') });
  // Clip mit Rand um den Umschalter, damit ein Fokusring außerhalb sichtbar wird
  const b = await sw.boundingBox();
  await page.screenshot({ path: path.join(OUT, 'fokus-radius-rand__m390-light.png'), clip: { x: 0, y: Math.max(0, b.y - 16), width: 390, height: b.height + 32 } });
  // Clipping-Prüfung: Hat ein Vorfahr des fokussierten Labels overflow hidden?
  r.clipAncestor = await page.evaluate(() => {
    const lab = document.activeElement.closest('label');
    for (let a = lab?.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflow !== 'visible') return { tag: a.tagName, cls: String(a.className).slice(0, 80), overflow: cs.overflow };
    }
    return null;
  });
  await page.keyboard.press('ArrowLeft');
  r.afterArrowLeft = await page.evaluate(() => ({ value: document.activeElement.value, checked: document.activeElement.checked, title: document.querySelector('#einsatzgebiet svg title')?.textContent }));
  await page.keyboard.press('ArrowLeft');
  r.afterArrowLeft2 = await page.evaluate(() => ({ value: document.activeElement.value, title: document.querySelector('#einsatzgebiet svg title')?.textContent }));
  await page.locator('#einsatzgebiet figure').screenshot({ path: path.join(OUT, 'plan-15km__m390-light.png') });

  // Ortswahl per Tastatur: Tab in die Ortsgruppe
  await page.keyboard.press('Tab');
  r.placeFocus = await page.evaluate(() => {
    const a = document.activeElement;
    const lab = a.closest('label');
    return { tag: a.tagName, type: a.type, value: a.value, label: lab?.textContent?.trim(), outline: lab ? getComputedStyle(lab).outlineStyle + ' ' + getComputedStyle(lab).outlineWidth : '' };
  });
  await page.keyboard.press('Space');
  r.afterSpace = await page.evaluate(() => document.querySelector('#einsatzgebiet [aria-live]')?.innerText);
  await page.locator('#einsatzgebiet fieldset').nth(1).screenshot({ path: path.join(OUT, 'fokus-orte__m390-light.png') });

  // Gießen wählen (bei 15 km)
  await page.locator('#einsatzgebiet fieldset').nth(1).locator('label', { hasText: 'Gießen' }).click();
  r.giessen15 = await page.evaluate(() => ({
    live: document.querySelector('#einsatzgebiet [aria-live]')?.innerText,
    row: document.querySelector('#einsatzgebiet tr[aria-current]')?.textContent,
    vorlauf: document.querySelectorAll('#einsatzgebiet svg .stroke-vorlauf').length,
    ruecklauf: document.querySelectorAll('#einsatzgebiet svg .stroke-ruecklauf').length,
    desc: document.querySelector('#einsatzgebiet svg desc')?.textContent,
  }));
  // 35 km wieder
  await page.locator('#einsatzgebiet fieldset').first().locator('label', { hasText: '35' }).click();
  r.giessen35 = await page.evaluate(() => ({
    live: document.querySelector('#einsatzgebiet [aria-live]')?.innerText,
    vorlauf: document.querySelectorAll('#einsatzgebiet svg .stroke-vorlauf').length,
  }));
  await page.locator('#einsatzgebiet figure').screenshot({ path: path.join(OUT, 'plan-giessen-35km__m390-light.png') });
  await page.locator('#einsatzgebiet [aria-live]').screenshot({ path: path.join(OUT, 'ergebnis-giessen__m390-light.png') });
  // Hermannstein (Lagebeschreibung)
  await page.locator('#einsatzgebiet fieldset').nth(1).locator('label', { hasText: 'Hermannstein' }).click();
  r.hermannstein = await page.evaluate(() => ({
    live: document.querySelector('#einsatzgebiet [aria-live]')?.innerText,
    vorlauf: document.querySelectorAll('#einsatzgebiet svg .stroke-vorlauf').length,
    selectedRing: document.querySelectorAll('#einsatzgebiet svg circle.fill-none.stroke-brand').length,
  }));
  await page.locator('#einsatzgebiet figure').screenshot({ path: path.join(OUT, 'plan-hermannstein-35km__m390-light.png') });
  // Herborn (außerhalb 15)
  await page.locator('#einsatzgebiet fieldset').nth(1).locator('label', { hasText: 'Herborn' }).click();
  await page.locator('#einsatzgebiet fieldset').first().locator('label', { hasText: '15' }).click();
  r.herborn15 = await page.evaluate(() => ({
    live: document.querySelector('#einsatzgebiet [aria-live]')?.innerText,
    vorlauf: document.querySelectorAll('#einsatzgebiet svg .stroke-vorlauf').length,
    desc: document.querySelector('#einsatzgebiet svg desc')?.textContent,
  }));
  await page.locator('#einsatzgebiet figure').screenshot({ path: path.join(OUT, 'plan-herborn-15km__m390-light.png') });
  // Tippen in der Grafik: Braunfels-Treffkreis
  await page.locator('#einsatzgebiet fieldset').first().locator('label', { hasText: '35' }).click();
  // Tabelle aufklappen und Markierung sehen
  await page.locator('#einsatzgebiet summary').click();
  await page.locator('#einsatzgebiet details').screenshot({ path: path.join(OUT, 'tabelle__m390-light.png') });
  // Routenlink
  r.route = await page.evaluate(() => {
    const a = [...document.querySelectorAll('#einsatzgebiet a')].find((x) => x.textContent.includes('Route'));
    return a ? { href: a.href, target: a.target, rel: a.rel, h: Math.round(a.getBoundingClientRect().height) } : null;
  });
  r.requests = requestLog;
  report.interaktion390 = r;
  await context.close();
}

// Dunkel 390 mit Auswahl, und 1440 hell/dunkel mit Auswahl
for (const [vpName, scheme] of [['m390', 'dark'], ['d1440', 'light'], ['d1440', 'dark']]) {
  const { context, page } = await open(VPS[vpName], { scheme });
  await page.locator('#einsatzgebiet fieldset').nth(1).locator('label', { hasText: 'Gießen' }).click();
  await page.locator('#einsatzgebiet').screenshot({ path: path.join(OUT, `gebiet-giessen__${vpName}-${scheme}.png`) });
  await page.locator('#einsatzgebiet figure').screenshot({ path: path.join(OUT, `plan-giessen__${vpName}-${scheme}.png`) });
  if (vpName === 'd1440') {
    // Tastaturfokus auf dem Umschalter bei 1440
    await page.evaluate(() => {
      const h = document.querySelector('#einsatzgebiet-title');
      h.setAttribute('tabindex', '-1');
      h.focus();
    });
    await page.keyboard.press('Tab');
    const sw = page.locator('#einsatzgebiet fieldset').first();
    const b = await sw.boundingBox();
    await page.screenshot({ path: path.join(OUT, `fokus-radius-rand__${vpName}-${scheme}.png`), clip: { x: Math.max(0, b.x - 16), y: Math.max(0, b.y - 16), width: b.width + 32, height: b.height + 32 } });
  }
  await context.close();
}

// Ohne JavaScript (390)
{
  const { context, page } = await open(VPS.m390, { js: false });
  report.nojs = await page.evaluate(() => {
    const s = document.querySelector('#einsatzgebiet');
    return {
      cards: s.querySelectorAll('fieldset')[1]?.querySelectorAll('label').length,
      radios: s.querySelectorAll('input[type=radio]').length,
      svg: !!s.querySelector('svg'),
      table: s.querySelectorAll('tbody tr').length,
      hint: s.querySelector('[aria-live]')?.textContent,
      werkstatt: !!s.querySelector('address'),
    };
  });
  await page.locator('#einsatzgebiet fieldset').nth(1).locator('label', { hasText: 'Gießen' }).click();
  report.nojs.afterClick = await page.evaluate(() => document.querySelector('#einsatzgebiet [aria-live]')?.textContent);
  await page.locator('#einsatzgebiet').screenshot({ path: path.join(OUT, 'gebiet-ohne-js__m390-light.png') });
  await context.close();
}

await browser.close();
await fs.writeFile(path.join(OUT, 'pruef.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
