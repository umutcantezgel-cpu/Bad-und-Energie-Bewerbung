// Konsolenwerkzeug (Auftrag E0). Sammelt je Seite und Gerätegröße die Konsolenmeldungen vom Typ error und die
// nicht gefangenen Fehler der Seite (pageerror). Nach load wartet es drei Sekunden, damit verzögerte Skripte noch
// Meldungen schreiben können. Chromium kommt aus PLAYWRIGHT_BROWSERS_PATH der Umgebung; es wird nichts installiert.
import { chromium } from '@playwright/test';
import { alsHauptprogramm, ausgabeOrdner, ausschreiben, basisAus, listeAus } from './gemeinsam.mjs';

const NUTZUNG = `Konsolenwerkzeug (Auftrag E0): Konsolenfehler und nicht gefangene Seitenfehler je Seite und Gerätegröße.

Aufruf (aus dem Projektordner, gegen den laufenden Produktions-Server):
  node _werkstatt/nennung/werkzeuge/konsole.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0

Optional: --seiten /,/jobs (Standard). Gerätegrößen: 390 × 844 und 1440 × 900. Nach load wird drei Sekunden gewartet.
Ausgabe: konsole.json und konsole.md.`;

const GROESSEN = [
  { breite: 390, hoehe: 844 },
  { breite: 1440, hoehe: 900 },
];
const SEITEN_STANDARD = '/,/jobs';
const WARTEZEIT_MS = 3000;

const einzeilig = (text) => text.replace(/\s+/g, ' ').trim();

/** Lädt eine Seite in einem neuen Kontext und sammelt die Fehler bis drei Sekunden nach load. */
async function seiteAufnehmen(browser, basis, seite, groesse) {
  const context = await browser.newContext({
    viewport: { width: groesse.breite, height: groesse.hoehe },
    serviceWorkers: 'block',
  });
  const konsolenfehler = [];
  const seitenfehler = [];
  try {
    const page = await context.newPage();
    page.on('console', (meldung) => {
      if (meldung.type() !== 'error') return;
      konsolenfehler.push({ text: einzeilig(meldung.text()), quelle: meldung.location().url ?? '' });
    });
    page.on('pageerror', (fehler) => {
      seitenfehler.push(einzeilig(fehler.message));
    });
    let status = 0;
    let ladefehler = '';
    try {
      const antwort = await page.goto(`${basis}${seite}`, { waitUntil: 'load' });
      status = antwort?.status() ?? 0;
    } catch (fehler) {
      ladefehler = einzeilig(fehler.message.split('\n')[0]);
    }
    await new Promise((weiter) => setTimeout(weiter, WARTEZEIT_MS));
    return {
      seite,
      groesse: `${groesse.breite}x${groesse.hoehe}`,
      status,
      konsolenfehler,
      seitenfehler,
      ladefehler,
    };
  } finally {
    await context.close();
  }
}

/** Markdown-Bericht: Übersicht je Seite und Gerätegröße, danach die Einzelfunde. */
function markdown({ stand, basis, laeufe, gesamt }) {
  const zeilen = [
    '# Konsolenfehler · Seiten je Gerätegröße',
    '',
    `- Stand: ${stand}`,
    `- Basis: ${basis}`,
    `- Wartezeit nach load: ${WARTEZEIT_MS / 1000} s`,
    '- Erfasst: Konsolenmeldungen vom Typ error und nicht gefangene Seitenfehler (pageerror)',
    `- Läufe: ${gesamt.laeufe}, Konsolenfehler gesamt: ${gesamt.konsolenfehler}, Seitenfehler gesamt: ${gesamt.seitenfehler}`,
    '',
    '## Übersicht',
    '',
    '| Seite | Größe | Status | Konsolenfehler | Seitenfehler |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const lauf of laeufe) {
    zeilen.push(`| ${lauf.seite} | ${lauf.groesse} | ${lauf.status} | ${lauf.konsolenfehler.length} | ${lauf.seitenfehler.length} |`);
  }
  zeilen.push('', '## Einzelfunde', '');
  const funde = laeufe.filter((lauf) => lauf.konsolenfehler.length > 0 || lauf.seitenfehler.length > 0 || lauf.ladefehler);
  if (funde.length === 0) zeilen.push('keine');
  for (const lauf of funde) {
    zeilen.push(`### ${lauf.seite} · ${lauf.groesse}`, '');
    if (lauf.ladefehler) zeilen.push(`- Ladefehler: ${lauf.ladefehler}`);
    for (const text of lauf.seitenfehler) zeilen.push(`- Seitenfehler: ${text}`);
    for (const meldung of lauf.konsolenfehler) {
      zeilen.push(`- Konsole: ${meldung.text}${meldung.quelle ? ` (${meldung.quelle})` : ''}`);
    }
    zeilen.push('');
  }
  return `${zeilen.join('\n')}\n`;
}

async function hauptlauf(args) {
  const basis = basisAus(args);
  const aus = await ausgabeOrdner(args);
  const seiten = listeAus(args.seiten, SEITEN_STANDARD);
  for (const seite of seiten) {
    if (!seite.startsWith('/')) throw new Error(`--seiten braucht Pfade mit führendem /: ${seite}`);
  }
  const laeufe = [];
  const browser = await chromium.launch();
  try {
    for (const seite of seiten) {
      for (const groesse of GROESSEN) {
        console.log(`${seite} · ${groesse.breite} px`);
        const lauf = await seiteAufnehmen(browser, basis, seite, groesse);
        laeufe.push(lauf);
        const ladehinweis = lauf.ladefehler ? ` · Ladefehler: ${lauf.ladefehler}` : '';
        console.log(
          `  Status ${lauf.status} · Konsolenfehler ${lauf.konsolenfehler.length} · Seitenfehler ${lauf.seitenfehler.length}${ladehinweis}`,
        );
      }
    }
  } finally {
    await browser.close();
  }
  const gesamt = {
    laeufe: laeufe.length,
    konsolenfehler: laeufe.reduce((summe, lauf) => summe + lauf.konsolenfehler.length, 0),
    seitenfehler: laeufe.reduce((summe, lauf) => summe + lauf.seitenfehler.length, 0),
  };
  const stand = new Date().toISOString();
  await ausschreiben(aus, 'konsole.json', `${JSON.stringify({ stand, basis, wartezeit_ms: WARTEZEIT_MS, gesamt, laeufe }, null, 2)}\n`);
  await ausschreiben(aus, 'konsole.md', markdown({ stand, basis, laeufe, gesamt }));
}

alsHauptprogramm(import.meta.url, NUTZUNG, hauptlauf);
