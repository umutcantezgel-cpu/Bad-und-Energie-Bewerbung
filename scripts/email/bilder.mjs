// Bilder der Bewerbungs-Mails für den Inhaber (Vorher-nachher). Nimmt die HTML-Dateien aus `bun run mail:vorschau` und
// fotografiert sie in Chromium: Desktop 680 px, Handy 375 px und klein 320 px, je normal, „ohne <style>“ (so zeigen
// GMX, WEB.DE und die Gmail-App mit fremden Konten die Mail) und in einer Dunkel-Simulation (helle Flächen dunkel,
// dunkle Schrift hell, wie die teilweise Umfärbung von Outlook.com und den Outlook-Apps). Die Word-Engine von Outlook
// für Windows kann Chromium nicht zeigen; dafür sind die .eml-Dateien da.
//
//   node scripts/email/bilder.mjs --ein _werkstatt/mails/vorschau/vorher --aus _werkstatt/mails/bilder/vorher
//   node scripts/email/bilder.mjs --vergleich _werkstatt/mails/bilder/vorher _werkstatt/mails/bilder/nachher \
//     --aus _werkstatt/mails/bilder/auswahl --nur team-mappe__handy__normal,bestaetigung__handy__dunkel
//
// Chromium kommt aus PLAYWRIGHT_BROWSERS_PATH; es wird nichts installiert.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

// `hoehe` begrenzt das Bild (CSS-px): Handy und klein zeigen den Anfang der Mail, wie er auf dem Bildschirm ankommt.
const ANSICHTEN = [
  { name: 'desktop', breite: 680, dpr: 1, hoehe: 8000 },
  { name: 'handy', breite: 375, dpr: 2, hoehe: 2400 },
  { name: 'klein', breite: 320, dpr: 2, hoehe: 1200 },
];
const FASSUNGEN = ['normal', 'ohne-style', 'dunkel'];

function wert(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

/** So entfernen GMX, WEB.DE und die Gmail-App (fremde Konten) den Kopf-Style: Inline-Stile bleiben, <style> fällt weg. */
function ohneStyle(html) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, '');
}

/**
 * Teilweise Umfärbung im Dunkelmodus nachstellen: helle Hintergründe werden dunkel, dunkle Schrift wird hell, dunkle
 * Flächen bleiben. Grob, aber nah an Outlook.com, den Outlook-Apps und der Gmail-App unter Android.
 */
async function dunkel(seite) {
  await seite.evaluate(() => {
    const rgb = (wert) => (wert.match(/\d+(\.\d+)?/g) ?? []).slice(0, 4).map(Number);
    const hell = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const spiegeln = ([r, g, b]) => `rgb(${255 - r * 0.85}, ${255 - g * 0.85}, ${255 - b * 0.85})`;
    for (const element of document.querySelectorAll('*')) {
      const stil = getComputedStyle(element);
      const grund = rgb(stil.backgroundColor);
      if (grund.length >= 3 && (grund[3] ?? 1) > 0 && hell(grund) > 0.6) element.style.backgroundColor = spiegeln(grund);
      const schrift = rgb(stil.color);
      if (schrift.length >= 3 && hell(schrift) < 0.4) element.style.color = spiegeln(schrift);
    }
    document.body.style.backgroundColor = 'rgb(30, 30, 30)';
  });
}

async function aufnehmen(ein, aus) {
  mkdirSync(aus, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const datei of readdirSync(ein).filter((name) => name.endsWith('.html')).sort()) {
      const html = readFileSync(path.join(ein, datei), 'utf8');
      const name = datei.replace(/\.html$/, '');
      for (const ansicht of ANSICHTEN) {
        const context = await browser.newContext({
          viewport: { width: ansicht.breite, height: 800 },
          deviceScaleFactor: ansicht.dpr,
          colorScheme: 'light',
        });
        for (const fassung of FASSUNGEN) {
          const seite = await context.newPage();
          await seite.setContent(fassung === 'ohne-style' ? ohneStyle(html) : html, { waitUntil: 'load' });
          if (fassung === 'dunkel') await dunkel(seite);
          const ziel = path.join(aus, `${name}__${ansicht.name}__${fassung}.png`);
          // Nur die Bildschirmbreite: Was breiter ist als das Gerät, ist auf dem Bild abgeschnitten wie beim Lesen.
          const hoehe = await seite.evaluate(() => document.documentElement.scrollHeight);
          await seite.screenshot({
            path: ziel,
            fullPage: true,
            clip: { x: 0, y: 0, width: ansicht.breite, height: Math.min(hoehe, ansicht.hoehe) },
            timeout: 120_000,
          });
          await seite.close();
        }
        await context.close();
      }
      console.log(`${name}: ${ANSICHTEN.length * FASSUNGEN.length} Bilder`);
    }
  } finally {
    await browser.close();
  }
}

/**
 * PNG im Browser in WebP umwandeln (Playwright kann nur PNG und JPEG; wie _werkstatt/nennung/werkzeuge/bilder.mjs).
 * WebP erlaubt höchstens 16 383 px je Seite; längere Bilder werden darauf verkleinert.
 */
async function alsWebp(seite, png) {
  const url = await seite.evaluate(async (quelle) => {
    const bild = new Image();
    bild.src = quelle;
    await bild.decode();
    const faktor = Math.min(1, 16383 / bild.naturalHeight);
    const leinwand = document.createElement('canvas');
    leinwand.width = Math.round(bild.naturalWidth * faktor);
    leinwand.height = Math.round(bild.naturalHeight * faktor);
    leinwand.getContext('2d').drawImage(bild, 0, 0, leinwand.width, leinwand.height);
    return leinwand.toDataURL('image/webp', 0.8);
  }, `data:image/png;base64,${png.toString('base64')}`);
  if (!url.startsWith('data:image/webp')) throw new Error('Der Browser liefert kein WebP.');
  return Buffer.from(url.split(',')[1], 'base64');
}

/** Vorher und Nachher nebeneinander auf einer Seite, beschriftet, als WebP (q 80). */
async function vergleichen(vorher, nachher, aus, nur) {
  mkdirSync(aus, { recursive: true });
  const namen = nur
    ? nur.split(',').map((name) => `${name.trim()}.png`)
    : readdirSync(nachher).filter((name) => name.endsWith('.png'));
  const browser = await chromium.launch();
  try {
    const seite = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    for (const datei of namen) {
      const bild = (ordner) => `data:image/png;base64,${readFileSync(path.join(ordner, datei)).toString('base64')}`;
      await seite.setContent(`<!doctype html><html><body style="margin:0;padding:24px;background:#e9e6df;font:600 22px system-ui,sans-serif;color:#111a3b">
        <div style="display:flex;gap:24px;align-items:flex-start">
          <figure style="margin:0;flex:1"><figcaption style="margin-bottom:12px">Vorher</figcaption><img src="${bild(vorher)}" style="width:100%;border:1px solid #c9c2b4"></figure>
          <figure style="margin:0;flex:1"><figcaption style="margin-bottom:12px">Nachher</figcaption><img src="${bild(nachher)}" style="width:100%;border:1px solid #c9c2b4"></figure>
        </div></body></html>`);
      await seite.waitForLoadState('load');
      const ziel = path.join(aus, datei.replace(/\.png$/, '.webp'));
      writeFileSync(ziel, await alsWebp(seite, await seite.screenshot({ fullPage: true })));
      console.log(`Vergleich: ${path.basename(ziel)}`);
    }
  } finally {
    await browser.close();
  }
}

const vergleich = process.argv.indexOf('--vergleich');
if (vergleich >= 0) {
  await vergleichen(process.argv[vergleich + 1], process.argv[vergleich + 2], wert('--aus') ?? '_werkstatt/mails/bilder/auswahl', wert('--nur'));
} else {
  const ein = wert('--ein');
  const aus = wert('--aus');
  if (!ein || !aus) {
    console.error('Aufruf: node scripts/email/bilder.mjs --ein <ordner mit .html> --aus <ordner>');
    process.exit(2);
  }
  await aufnehmen(ein, aus);
}
