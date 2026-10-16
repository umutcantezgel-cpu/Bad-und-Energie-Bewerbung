// Netzwerk und Layout der Startseite (Auftrag E0). Drei Läufe, je ein neuer Browserkontext ohne Cache und ohne
// Service Worker, Anfragen und Transfergrößen über CDP (Network.*), Layoutverschiebung ohne Nutzereingabe
// bis 5 Sekunden nach load. Median und Spanne über die drei Läufe.
import { chromium } from '@playwright/test';
import { alsHauptprogramm, ausgabeOrdner, ausschreiben, basisAus, median, spanne } from './gemeinsam.mjs';

const NUTZUNG = `Netzwerk und Layout der Startseite (Auftrag E0): drei Läufe, 1440 × 900, neuer Browserkontext je Lauf.
Erfasst: alle Anfragen (Methode, URL, Typ, Status), komprimierte Transfergröße (CDP encodedDataLength),
Layoutverschiebung bis 5 s nach load.

Aufruf (aus dem Projektordner, gegen den laufenden Produktions-Server):
  node _werkstatt/nennung/werkzeuge/netz.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0

Ausgabe: netz.json und netz.md (je Lauf, Median, Spanne und Anfragen, die nicht in allen Läufen auftreten).`;

const LAEUFE = 3;
const GROESSE = { breite: 1440, hoehe: 900 };
const NACH_LOAD_MS = 5000;
const FELDER = ['anfragen', 'bytes', 'layoutverschiebung', 'ladezeitMs'];

/** Vor jedem Dokument: Layoutverschiebungen ohne letzte Nutzereingabe sammeln. */
const VERSCHIEBUNG_SKRIPT = `
  window.__verschiebungen = [];
  try {
    new PerformanceObserver((liste) => {
      for (const eintrag of liste.getEntries()) {
        if (!eintrag.hadRecentInput) window.__verschiebungen.push({ start: eintrag.startTime, wert: eintrag.value });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (fehler) {
    window.__verschiebungFehler = String(fehler);
  }
`;

/** Lange Adressen kürzen; data:-Adressen nur mit Länge, damit die Ausgabe lesbar bleibt. */
function kuerzen(url) {
  if (url.startsWith('data:')) return `data: (${url.length} Zeichen)`;
  return url.length > 300 ? `${url.slice(0, 300)}…` : url;
}

async function einLauf(browser, url) {
  const context = await browser.newContext({
    viewport: { width: GROESSE.breite, height: GROESSE.hoehe },
    serviceWorkers: 'block',
  });
  try {
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const anfragen = [];
    const nachId = new Map();
    let bytes = 0;

    cdp.on('Network.requestWillBeSent', (e) => {
      if (e.redirectResponse && nachId.has(e.requestId)) {
        nachId.get(e.requestId).status = e.redirectResponse.status;
      }
      const eintrag = {
        methode: e.request.method,
        url: kuerzen(e.request.url),
        typ: e.type ?? '',
        status: 'ausstehend',
        bytes: 0,
      };
      nachId.set(e.requestId, eintrag);
      anfragen.push(eintrag);
    });
    cdp.on('Network.responseReceived', (e) => {
      const eintrag = nachId.get(e.requestId);
      if (eintrag) eintrag.status = e.response.status;
    });
    cdp.on('Network.loadingFinished', (e) => {
      bytes += e.encodedDataLength;
      const eintrag = nachId.get(e.requestId);
      if (eintrag) eintrag.bytes += e.encodedDataLength;
    });
    cdp.on('Network.loadingFailed', (e) => {
      const eintrag = nachId.get(e.requestId);
      if (eintrag) eintrag.status = `Fehler: ${e.errorText}`;
    });
    await cdp.send('Network.enable');

    await page.addInitScript(VERSCHIEBUNG_SKRIPT);
    await page.goto(url, { waitUntil: 'load' });
    await new Promise((weiter) => setTimeout(weiter, NACH_LOAD_MS));

    const layout = await page.evaluate((nachLoadMs) => {
      const nav = performance.getEntriesByType('navigation')[0];
      const ende = nav ? nav.loadEventEnd : 0;
      const grenze = ende + nachLoadMs;
      const treffer = (window.__verschiebungen ?? []).filter((eintrag) => eintrag.start <= grenze);
      return {
        ladezeitMs: Math.round(ende),
        layoutverschiebung: treffer.reduce((summe, eintrag) => summe + eintrag.wert, 0),
        verschiebungen: treffer.length,
        unterstuetzt: PerformanceObserver.supportedEntryTypes?.includes('layout-shift') ?? false,
        fehler: window.__verschiebungFehler ?? null,
      };
    }, NACH_LOAD_MS);

    return {
      anfragenListe: anfragen,
      anfragen: anfragen.length,
      bytes,
      ...layout,
    };
  } finally {
    await context.close();
  }
}

const kb = (bytes) => (bytes / 1024).toFixed(1).replace('.', ',');
const zahl = (wert, stellen) => (wert === null ? 'n/a' : wert.toFixed(stellen).replace('.', ','));

function schluesselMenge(lauf) {
  return new Set(lauf.anfragenListe.map((a) => `${a.typ} ${a.methode} ${a.url} ${a.status}`));
}

function netzMd(laeufe, zusammen, meta) {
  const nichtInAllen = [...new Set(laeufe.flatMap((l) => [...schluesselMenge(l)]))].filter(
    (schluessel) => !laeufe.every((l) => schluesselMenge(l).has(schluessel)),
  );
  const zeilen = [
    '# Netzwerk und Layout · Startseite',
    '',
    `- Stand: ${meta.stand}`,
    `- Adresse: ${meta.url} · ${GROESSE.breite} × ${GROESSE.hoehe}`,
    `- Je Lauf: neuer Browserkontext, Service Worker blockiert, kein Cache; Messung bis ${NACH_LOAD_MS / 1000} s nach load`,
    '- Transfer: komprimierte Größe je Anfrage (CDP encodedDataLength, bis zum Ende der Messung)',
    '',
    '## Läufe',
    '| Lauf | Anfragen | Transfer komprimiert (KB) | Layoutverschiebung | Verschiebungen | load (ms) |',
    '| --- | --- | --- | --- | --- | --- |',
    ...laeufe.map(
      (l) => `| ${l.nr} | ${l.anfragen} | ${kb(l.bytes)} | ${zahl(l.layoutverschiebung, 4)} | ${l.verschiebungen} | ${l.ladezeitMs} |`,
    ),
    `| Median | ${zahl(zusammen.median.anfragen, 0)} | ${kb(zusammen.median.bytes)} | ${zahl(zusammen.median.layoutverschiebung, 4)} | | ${zahl(zusammen.median.ladezeitMs, 0)} |`,
    `| Spanne | ${zusammen.spanne.anfragen.join(' bis ')} | ${zusammen.spanne.bytes.map((b) => kb(b)).join(' bis ')} | ${zusammen.spanne.layoutverschiebung.map((v) => zahl(v, 4)).join(' bis ')} | | ${zusammen.spanne.ladezeitMs.join(' bis ')} |`,
  ];
  if (laeufe.some((l) => !l.unterstuetzt)) {
    zeilen.push('', 'Achtung: layout-shift wird in diesem Browser nicht unterstützt; die Layoutwerte sind dann nicht belastbar.');
  }
  if (laeufe.some((l) => l.fehler)) {
    zeilen.push('', `Achtung: Fehler beim Beobachten: ${laeufe.map((l) => l.fehler).filter(Boolean).join('; ')}`);
  }
  zeilen.push('', `## Anfragen von Lauf 1 (${laeufe[0].anfragen})`, '| Methode | Typ | Status | KB | URL |', '| --- | --- | --- | --- | --- |');
  for (const a of laeufe[0].anfragenListe) {
    zeilen.push(`| ${a.methode} | ${a.typ} | ${a.status} | ${kb(a.bytes)} | ${a.url.replace(/\|/g, '%7C')} |`);
  }
  zeilen.push('', '## Anfragen, die nicht in allen Läufen auftreten');
  zeilen.push(...(nichtInAllen.length ? nichtInAllen.map((s) => `- ${s}`) : ['- keine']));
  zeilen.push('');
  return zeilen.join('\n');
}

async function hauptlauf(args) {
  const basis = basisAus(args);
  const aus = await ausgabeOrdner(args);
  const url = `${basis}/`;
  const browser = await chromium.launch();
  const laeufe = [];
  try {
    for (let nr = 1; nr <= LAEUFE; nr += 1) {
      console.log(`Lauf ${nr} von ${LAEUFE}: ${url}`);
      const ergebnis = await einLauf(browser, url);
      laeufe.push({ nr, ...ergebnis });
      console.log(
        `  Anfragen ${ergebnis.anfragen} · komprimiert ${kb(ergebnis.bytes)} KB · Layoutverschiebung ${zahl(ergebnis.layoutverschiebung, 4)} · load ${ergebnis.ladezeitMs} ms`,
      );
    }
  } finally {
    await browser.close();
  }

  const medianWerte = Object.fromEntries(FELDER.map((feld) => [feld, median(laeufe.map((l) => l[feld]))]));
  const spannenWerte = Object.fromEntries(FELDER.map((feld) => [feld, spanne(laeufe.map((l) => l[feld]))]));
  const stand = new Date().toISOString();
  const zusammen = { median: medianWerte, spanne: spannenWerte };

  await ausschreiben(
    aus,
    'netz.json',
    `${JSON.stringify(
      {
        erstellt: stand,
        url,
        groesse: GROESSE,
        messdauerNachLoadMs: NACH_LOAD_MS,
        laeufe,
        median: medianWerte,
        spanne: spannenWerte,
      },
      null,
      2,
    )}\n`,
  );
  await ausschreiben(aus, 'netz.md', netzMd(laeufe, zusammen, { stand, url }));
}

alsHauptprogramm(import.meta.url, NUTZUNG, hauptlauf);
