// Bildwerkzeug (Auftrag E0). Nimmt je Seite den Footer-Ausschnitt und die ganze Seite auf, je Gerätegröße
// (390 × 844 und 1440 × 900) und Farbschema (light, dark). Ausgabe als WebP, höchstens 1440 Pixel breit.
// Chromium kommt aus PLAYWRIGHT_BROWSERS_PATH der Umgebung; es wird nichts installiert.
import { chromium } from '@playwright/test';
import {
  alsHauptprogramm,
  ausgabeOrdner,
  ausschreiben,
  basisAus,
  beruhigen,
  dateiSlug,
  durchscrollen,
  listeAus,
} from './gemeinsam.mjs';

const NUTZUNG = `Bildwerkzeug (Auftrag E0): Footer-Ausschnitt und ganze Seite, je Gerätegröße und Farbschema, als WebP.

Aufruf (aus dem Projektordner, gegen den laufenden Produktions-Server):
  node _werkstatt/nennung/werkzeuge/bilder.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0

Optional: --seiten /,/jobs (Standard). Gerätegrößen: 390 × 844 und 1440 × 900; Schema: light und dark.
Dateien: <seite>__<breite>-<schema>__fuss.webp und <seite>__<breite>-<schema>__seite.webp`;

const GROESSEN = [
  { breite: 390, hoehe: 844 },
  { breite: 1440, hoehe: 900 },
];
const SCHEMATA = ['light', 'dark'];
const HOECHSTBREITE = 1440;
const WEBP_QUALITAET = 0.85;
const SEITEN_STANDARD = '/,/jobs';

/**
 * Wandelt ein PNG im Browser in WebP um. Playwright selbst kann nur PNG und JPEG; die Wandlung über Canvas
 * ist die einzige WebP-Quelle ohne neue Bibliothek. Breiter als 1440 Pixel wird auf 1440 verkleinert.
 */
async function alsWebp(context, png) {
  const hilfe = await context.newPage();
  try {
    await hilfe.setContent('<!doctype html><html><body></body></html>');
    const ergebnis = await hilfe.evaluate(
      async ({ quelle, maxBreite, qualitaet }) => {
        const bild = new Image();
        bild.src = quelle;
        await bild.decode();
        // WebP erlaubt höchstens 16.383 px je Seite; lange Vollbilder werden darauf verkleinert (sonst liefert toDataURL PNG)
        const faktor = Math.min(1, maxBreite / bild.naturalWidth, 16383 / bild.naturalHeight);
        const leinwand = document.createElement('canvas');
        leinwand.width = Math.round(bild.naturalWidth * faktor);
        leinwand.height = Math.round(bild.naturalHeight * faktor);
        const kontext = leinwand.getContext('2d');
        kontext.drawImage(bild, 0, 0, leinwand.width, leinwand.height);
        return {
          url: leinwand.toDataURL('image/webp', qualitaet),
          breite: leinwand.width,
          original: bild.naturalWidth,
        };
      },
      { quelle: `data:image/png;base64,${png.toString('base64')}`, maxBreite: HOECHSTBREITE, qualitaet: WEBP_QUALITAET },
    );
    if (!ergebnis.url.startsWith('data:image/webp')) throw new Error('Der Browser liefert kein WebP.');
    return {
      bytes: Buffer.from(ergebnis.url.split(',')[1], 'base64'),
      breite: ergebnis.breite,
      original: ergebnis.original,
    };
  } finally {
    await hilfe.close();
  }
}

async function speichern(context, aus, datei, png, hinweise) {
  const { bytes, breite, original } = await alsWebp(context, png);
  const grund = breite < original ? ` (auf ${breite} px verkleinert, Original ${original} px)` : '';
  await ausschreiben(aus, datei, bytes);
  hinweise.push(`${datei}: ${Math.round(bytes.length / 1024)} KB${grund}`);
}

async function aufnehmen(browser, aus, basis, seite, groesse, schema, hinweise) {
  const context = await browser.newContext({
    viewport: { width: groesse.breite, height: groesse.hoehe },
    colorScheme: schema,
    serviceWorkers: 'block',
  });
  const kennung = `${dateiSlug(seite)}__${groesse.breite}-${schema}`;
  try {
    const page = await context.newPage();
    await page.goto(`${basis}${seite}`, { waitUntil: 'load' });
    await durchscrollen(page);
    await beruhigen(page);

    const fuss = page.locator('footer');
    if ((await fuss.count()) > 0) {
      const png = await fuss.last().screenshot({ type: 'png', animations: 'disabled', caret: 'hide', scale: 'css' });
      await speichern(context, aus, `${kennung}__fuss.webp`, png, hinweise);
    } else {
      hinweise.push(`${kennung}: kein footer-Element auf der Seite`);
    }

    const seitePng = await page.screenshot({ fullPage: true, type: 'png', animations: 'disabled', caret: 'hide', scale: 'css' });
    await speichern(context, aus, `${kennung}__seite.webp`, seitePng, hinweise);
  } finally {
    await context.close();
  }
}

async function hauptlauf(args) {
  const basis = basisAus(args);
  const aus = await ausgabeOrdner(args);
  const seiten = listeAus(args.seiten, SEITEN_STANDARD);
  for (const seite of seiten) {
    if (!seite.startsWith('/')) throw new Error(`--seiten braucht Pfade mit führendem /: ${seite}`);
  }
  const hinweise = [];
  const browser = await chromium.launch();
  try {
    for (const seite of seiten) {
      for (const groesse of GROESSEN) {
        for (const schema of SCHEMATA) {
          console.log(`${seite} · ${groesse.breite} px · ${schema}`);
          await aufnehmen(browser, aus, basis, seite, groesse, schema, hinweise);
        }
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`Bilder: ${hinweise.length}`);
  for (const hinweis of hinweise) console.log(`  ${hinweis}`);
}

alsHauptprogramm(import.meta.url, NUTZUNG, hauptlauf);
