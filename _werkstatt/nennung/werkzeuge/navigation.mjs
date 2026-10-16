// Navigationsprüfung der Agenturnennung (Auftrag E3, S4). Vergleicht rel und target des Coday-Links im ausgelieferten
// HTML mit den Werten im Browser: ohne JavaScript, mit JavaScript bei DOMContentLoaded, nach dem Laden (networkidle
// und zwei Sekunden) und nach einer internen Navigation in beide Richtungen (/ → /jobs → /). Zählt außerdem Änderungen
// von rel nach DOMContentLoaded und Anfragen an codayweb.de. Chromium kommt aus PLAYWRIGHT_BROWSERS_PATH der Umgebung.
import { chromium } from '@playwright/test';
import { abrufen, alsHauptprogramm, attribute, ausgabeOrdner, ausschreiben, basisAus } from './gemeinsam.mjs';

const NUTZUNG = `Navigationsprüfung der Agenturnennung (Auftrag E3, S4): rel und target des Coday-Links im ausgelieferten HTML
und im Browser, je Seite und Lauf, dazu die Navigation / → /jobs → /.

Aufruf (aus dem Projektordner, gegen den laufenden Produktions-Server):
  node _werkstatt/nennung/werkzeuge/navigation.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e3b

Läufe je Seite: (a) ausgeliefertes HTML, (b) Browser ohne JavaScript, (c1) mit JavaScript bei DOMContentLoaded,
(c2) mit JavaScript nach networkidle und zwei Sekunden. Dazu (d): Navigation im Browser / → /jobs → /.
Ausgabe: navigation.json und navigation.md im Ausgabeordner.`;

const URLS = ['/', '/jobs', '/arbeiten-bei-uns/waermepumpen'];
const SELEKTOR = 'footer a[href*="codayweb.de"]';
const GROESSE = { width: 1440, height: 900 };
const WARTEZEIT_MS = 2000;
const WARTEGRENZE_MS = 30_000;
const KEIN_WERT = '(kein Wert)';
const KEIN_LINK = '(kein Link)';

/** Im Browser vor allen Seitenskripten: zählt Änderungen von rel am Link und das Einfügen des Links ab DOMContentLoaded. */
const BEOBACHTER = `
  window.__relAenderungen = 0;
  window.__linkEingefuegt = 0;
  let aktiv = false;
  const auswahl = ${JSON.stringify(SELEKTOR)};
  document.addEventListener('DOMContentLoaded', () => { aktiv = true; });
  new MutationObserver((eintraege) => {
    if (!aktiv) return;
    for (const eintrag of eintraege) {
      if (eintrag.type === 'attributes' && eintrag.target instanceof Element && eintrag.target.matches(auswahl)) {
        window.__relAenderungen += 1;
      }
      if (eintrag.type === 'childList') {
        for (const knoten of eintrag.addedNodes) {
          if (knoten instanceof Element && (knoten.matches(auswahl) || knoten.querySelector(auswahl))) {
            window.__linkEingefuegt += 1;
          }
        }
      }
    }
  }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['rel'] });
`;

const normal = (text) => text.trim().replace(/\s+/g, ' ');

/** Anzeige eines Werts: leer und fehlend werden benannt, damit man sie nicht übersieht. */
const wertVon = (link) => (link ? (link.rel === null ? KEIN_WERT : normal(link.rel)) : KEIN_LINK);
const targetVon = (link) => (link ? (link.target === null ? KEIN_WERT : normal(link.target)) : KEIN_LINK);

/** rel, target und href des ersten Links auf codayweb.de im Footer des ausgelieferten HTML. */
function linkAusHtml(html) {
  for (const fuss of html.matchAll(/<footer\b[\s\S]*?<\/footer>/gi)) {
    for (const tag of fuss[0].matchAll(/<a\b([^>]*)>/gi)) {
      const werte = attribute(tag[1]);
      if ((werte.href ?? '').includes('codayweb.de')) {
        return { rel: werte.rel ?? null, target: werte.target ?? null, href: werte.href };
      }
    }
  }
  return null;
}

/** rel, target und href des Links im Browser. Lässt sich das DOM nicht lesen, wird der Seiteninhalt ausgewertet. */
async function linkImBrowser(seite) {
  try {
    const werte = await seite.evaluate((selektor) => {
      const element = document.querySelector(selektor);
      if (!element) return null;
      return {
        rel: element.getAttribute('rel'),
        target: element.getAttribute('target'),
        href: element.getAttribute('href'),
      };
    }, SELEKTOR);
    return { link: werte, methode: 'DOM' };
  } catch {
    return { link: linkAusHtml(await seite.content()), methode: 'Seiteninhalt' };
  }
}

/** Zählt Anfragen an codayweb.de (auch Bilder, Skripte und Schriften der Agentur) über die gesamte Lebensdauer der Seite. */
function anfragenZaehlen(seite, zaehler) {
  seite.on('request', (anfrage) => {
    try {
      if (new URL(anfrage.url()).hostname.endsWith('codayweb.de')) zaehler.anzahl += 1;
    } catch {
      // Adressen ohne Host, etwa data:, zählen nicht.
    }
  });
}

/** Wartet bis zur Ruhe des Netzes; kommt sie nicht, bleibt die Prüfung dennoch aussagekräftig und meldet das. */
async function ruhigWarten(seite) {
  try {
    await seite.waitForLoadState('networkidle', { timeout: WARTEGRENZE_MS });
    return true;
  } catch {
    return false;
  }
}

/** Anzahl der rel-Änderungen und der Einfügungen des Links seit DOMContentLoaded. */
async function beobachtungLesen(seite) {
  return seite.evaluate(() => ({ rel: window.__relAenderungen, eingefuegt: window.__linkEingefuegt }));
}

/** Eine Zeile der Tabelle: erwartet ist der Wert aus dem ausgelieferten HTML derselben (Ziel-)URL. */
function zeile(url, fall, erwartet, gelesen, methode, mitVergleich = true) {
  const gleich = mitVergleich ? (erwartet !== KEIN_LINK && erwartet === gelesen ? 'ja' : 'nein') : 'Maßstab';
  return { url, fall, erwartet, gelesen, gleich, methode };
}

function markdown({ stand, basis, referenz, faelle, beobachtung, anfragen }) {
  const vergleiche = faelle.filter((fall) => fall.gleich !== 'Maßstab');
  const gleiche = vergleiche.filter((fall) => fall.gleich === 'ja').length;
  const zeilen = [
    '# Navigation und rel des Coday-Links (S4)',
    '',
    `- Stand: ${stand}`,
    `- Basis: ${basis}`,
    '- Maßstab: rel des Links `footer a[href*="codayweb.de"]` im ausgelieferten HTML derselben URL',
    `- Ergebnis: ${gleiche} von ${vergleiche.length} Vergleichen gleich`,
    '',
    '## Tabelle',
    '',
    '| URL | Fall | erwartet | gelesen | gleich ja/nein |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const fall of faelle) {
    const erwartet = fall.erwartet === '—' ? fall.erwartet : `\`${fall.erwartet}\``;
    zeilen.push(`| ${fall.url} | ${fall.fall} | ${erwartet} | \`${fall.gelesen}\` | ${fall.gleich} |`);
  }
  zeilen.push('', '## Änderungen nach DOMContentLoaded', '', '| Seite | Lauf | rel geändert | Link eingefügt |', '| --- | --- | --- | --- |');
  for (const eintrag of beobachtung) {
    zeilen.push(`| ${eintrag.seite} | ${eintrag.lauf} | ${eintrag.rel ?? 'nicht messbar'} | ${eintrag.eingefuegt ?? 'nicht messbar'} |`);
  }
  zeilen.push('', '## Anfragen an codayweb.de beim Laden', '', '| Seite | Lauf | Anfragen |', '| --- | --- | --- |');
  for (const eintrag of anfragen) zeilen.push(`| ${eintrag.seite} | ${eintrag.lauf} | ${eintrag.anzahl} |`);
  const targets = new Set([...faelle.map((fall) => fall.target), ...Object.values(referenz).map((eintrag) => targetVon(eintrag.link))]);
  const seiteninhalt = faelle.filter((fall) => fall.methode !== 'DOM').length;
  zeilen.push(
    '',
    '## Hinweise',
    '',
    `- HTTP-Status der Referenz: ${Object.entries(referenz).map(([url, eintrag]) => `${url} ${eintrag.status}`).join(', ')}`,
    `- target in allen Fällen: ${[...targets].join(', ')}`,
    `- Fälle, bei denen das DOM nicht lesbar war (Seiteninhalt statt DOM): ${seiteninhalt}`,
    '',
  );
  return zeilen.join('\n');
}

async function hauptlauf(args) {
  const basis = basisAus(args);
  const aus = await ausgabeOrdner(args);

  const referenz = {};
  for (const url of URLS) {
    const antwort = await abrufen(`${basis}${url}`);
    referenz[url] = { status: antwort.status, link: antwort.status === 200 ? linkAusHtml(antwort.text) : null };
  }

  const faelle = [];
  const beobachtung = [];
  const anfragen = [];
  const browser = await chromium.launch();
  try {
    for (const url of URLS) {
      const erwartet = wertVon(referenz[url].link);
      const target = targetVon(referenz[url].link);

      const ohneSkript = { anzahl: 0 };
      const kontextOhne = await browser.newContext({ viewport: GROESSE, serviceWorkers: 'block', javaScriptEnabled: false });
      try {
        const seite = await kontextOhne.newPage();
        anfragenZaehlen(seite, ohneSkript);
        await seite.goto(`${basis}${url}`, { waitUntil: 'load' });
        const gelesen = await linkImBrowser(seite);
        faelle.push({ ...zeile(url, '(b) Browser ohne JavaScript', erwartet, wertVon(gelesen.link), gelesen.methode), target: targetVon(gelesen.link) });
      } finally {
        await kontextOhne.close();
      }
      anfragen.push({ seite: url, lauf: '(b) ohne JavaScript', anzahl: ohneSkript.anzahl });

      const mitSkript = { anzahl: 0 };
      const kontextMit = await browser.newContext({ viewport: GROESSE, serviceWorkers: 'block' });
      try {
        await kontextMit.addInitScript(BEOBACHTER);
        const seite = await kontextMit.newPage();
        anfragenZaehlen(seite, mitSkript);
        await seite.goto(`${basis}${url}`, { waitUntil: 'domcontentloaded' });
        const beiLaden = await linkImBrowser(seite);
        faelle.push({ ...zeile(url, '(c1) mit JavaScript bei DOMContentLoaded', erwartet, wertVon(beiLaden.link), beiLaden.methode), target: targetVon(beiLaden.link) });
        const ruhe = await ruhigWarten(seite);
        await seite.waitForTimeout(WARTEZEIT_MS);
        const nachHydration = await linkImBrowser(seite);
        const bezeichnung = ruhe ? 'networkidle' : 'Ruhezeit ohne networkidle';
        faelle.push({ ...zeile(url, `(c2) mit JavaScript nach ${bezeichnung} und 2 s`, erwartet, wertVon(nachHydration.link), nachHydration.methode), target: targetVon(nachHydration.link) });
        beobachtung.push({ seite: url, lauf: '(c) mit JavaScript', ...(await beobachtungLesen(seite)) });
      } finally {
        await kontextMit.close();
      }
      anfragen.push({ seite: url, lauf: '(c) mit JavaScript', anzahl: mitSkript.anzahl });
    }

    const navigation = { anzahl: 0 };
    const kontextNav = await browser.newContext({ viewport: GROESSE, serviceWorkers: 'block' });
    try {
      await kontextNav.addInitScript(BEOBACHTER);
      const seite = await kontextNav.newPage();
      anfragenZaehlen(seite, navigation);
      await seite.goto(`${basis}/`, { waitUntil: 'load' });
      await ruhigWarten(seite);

      await seite.locator('a[href="/jobs"]:visible').first().click();
      await seite.waitForURL((adresse) => adresse.pathname === '/jobs', { timeout: WARTEGRENZE_MS });
      await seite.waitForTimeout(WARTEZEIT_MS);
      const aufJobs = await linkImBrowser(seite);
      faelle.push({ ...zeile('/jobs (von /)', '(d1) interne Navigation / → /jobs', wertVon(referenz['/jobs'].link), wertVon(aufJobs.link), aufJobs.methode), target: targetVon(aufJobs.link) });

      await seite.locator('a[href="/"]:visible').first().click();
      await seite.waitForURL((adresse) => adresse.pathname === '/', { timeout: WARTEGRENZE_MS });
      await seite.waitForTimeout(WARTEZEIT_MS);
      const aufStart = await linkImBrowser(seite);
      faelle.push({ ...zeile('/ (von /jobs)', '(d2) interne Navigation /jobs → /', wertVon(referenz['/'].link), wertVon(aufStart.link), aufStart.methode), target: targetVon(aufStart.link) });

      beobachtung.push({ seite: '/ → /jobs → /', lauf: '(d) Navigation', ...(await beobachtungLesen(seite)) });
    } finally {
      await kontextNav.close();
    }
    anfragen.push({ seite: '/ → /jobs → /', lauf: '(d) Navigation', anzahl: navigation.anzahl });
  } finally {
    await browser.close();
  }

  const stand = new Date().toISOString();
  const ergebnis = { stand, basis, referenz, faelle, beobachtung, anfragen };
  await ausschreiben(aus, 'navigation.json', `${JSON.stringify(ergebnis, null, 2)}\n`);
  await ausschreiben(aus, 'navigation.md', markdown(ergebnis));
}

alsHauptprogramm(import.meta.url, NUTZUNG, hauptlauf);
