// Gemeinsame Helfer der Prüfwerkzeuge der Agenturnennung (Auftrag E0).
// Nur Node-Bordmittel; Playwright und axe kommen aus dem node_modules des Projekts.
import { realpathSync } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Produktionsadresse. Sitemap-Einträge mit diesem Host werden auf die --basis umgeschrieben. */
export const PRODUKTIONSHOST = 'https://karriere.bad-energie.de';

/** Standard-Kennung eines gewöhnlichen Browsers. */
export const STANDARD_KENNUNG =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

/** Googlebot-Kennung für den Vergleich. */
export const GOOGLEBOT_KENNUNG = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

/** Seiten, die nicht in der Sitemap stehen, aber in jede Prüfung gehören. */
export const ZUSATZ_PFADE = ['/impressum', '/datenschutz', '/bewerbung/danke', '/bewerbung/mappe', '/gibt-es-nicht'];

/** Erwarteter HTTP-Status je Pfad; alle übrigen Pfade erwarten 200. */
export const ERWARTET = { '/gibt-es-nicht': 404 };

/** Projektwurzel. Die Werkzeuge liegen in <Wurzel>/_werkstatt/nennung/werkzeuge. */
export const PROJEKT_STANDARD = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const ZEITGRENZE_MS = 30_000;

const BENANNTE_ENTITAETEN = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß',
  ndash: '–', mdash: '—', hellip: '…', bdquo: '„', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  middot: '·', copy: '©', euro: '€',
};

/** Liest --name wert, --name=wert und Schalter ohne Wert (true). */
export function argumente(argv) {
  const werte = {};
  for (let i = 0; i < argv.length; i += 1) {
    const eintrag = argv[i];
    if (!eintrag.startsWith('--')) throw new Error(`Unbekanntes Argument: ${eintrag}`);
    const gleich = eintrag.indexOf('=');
    if (gleich > 2) {
      werte[eintrag.slice(2, gleich)] = eintrag.slice(gleich + 1);
      continue;
    }
    const name = eintrag.slice(2);
    const folgt = argv[i + 1];
    if (folgt === undefined || folgt.startsWith('--')) {
      werte[name] = true;
    } else {
      werte[name] = folgt;
      i += 1;
    }
  }
  return werte;
}

/** Liefert einen Pflichtwert als Text oder bricht mit einer Zeile ab. */
export function pflicht(args, name) {
  const wert = args[name];
  if (typeof wert !== 'string' || wert.trim() === '') throw new Error(`Angabe fehlt: --${name}`);
  return wert.trim();
}

/** Prüft --basis als Adresse mit http oder https und gibt den Ursprung ohne Pfad zurück. */
export function basisAus(args) {
  const roh = pflicht(args, 'basis');
  let adresse;
  try {
    adresse = new URL(roh);
  } catch {
    throw new Error(`--basis ist keine Adresse: ${roh}`);
  }
  if (adresse.protocol !== 'http:' && adresse.protocol !== 'https:') {
    throw new Error(`--basis braucht http oder https: ${roh}`);
  }
  return adresse.origin;
}

/** Legt den Ausgabeordner aus --aus an und gibt seinen absoluten Pfad zurück. */
export async function ausgabeOrdner(args) {
  const ordner = path.resolve(pflicht(args, 'aus'));
  await mkdir(ordner, { recursive: true });
  return ordner;
}

/** Projektwurzel aus --projekt oder der Standard für Routen und Build-Ausgabe. */
export function projektAus(args) {
  if (args.projekt === undefined) return PROJEKT_STANDARD;
  return path.resolve(pflicht(args, 'projekt'));
}

/** Kommaliste aus einem Argument, mit Standard, wenn das Argument fehlt. */
export function listeAus(wert, standard) {
  const text = typeof wert === 'string' ? wert : standard;
  return text
    .split(',')
    .map((teil) => teil.trim())
    .filter(Boolean);
}

async function abbruch(fehler) {
  console.error(`Abbruch: ${fehler.message}`);
  process.exitCode = 1;
}

/** Ist diese Datei das gestartete Programm? Verglichen werden Realpfade, damit Symlinks nicht stören. */
function istHauptdatei(meineAdresse) {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(meineAdresse));
  } catch {
    return false;
  }
}

/**
 * Startet ein Werkzeug nur beim direkten Aufruf (nicht beim Import). --hilfe zeigt die Nutzung.
 * Fehler enden mit einer Zeile und Exit-Code 1.
 */
export function alsHauptprogramm(meineAdresse, nutzung, hauptlauf) {
  if (!istHauptdatei(meineAdresse)) return;
  try {
    const args = argumente(process.argv.slice(2));
    if (args.hilfe) {
      console.log(nutzung);
      return;
    }
    hauptlauf(args).catch(abbruch);
  } catch (fehler) {
    abbruch(fehler);
  }
}

/** Ersetzt benannte und numerische HTML-Entitäten durch Zeichen. */
export function entschluesseln(text) {
  return text.replace(/&(#[xX][0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g, (ganz, kode) => {
    if (kode.startsWith('#')) {
      const zahl = /^#[xX]/.test(kode) ? parseInt(kode.slice(2), 16) : parseInt(kode.slice(1), 10);
      return zahl > 0 && zahl <= 0x10ffff ? String.fromCodePoint(zahl) : ganz;
    }
    return BENANNTE_ENTITAETEN[kode] ?? ganz;
  });
}

/** Liest die Attribute eines Tags (ab dem Attributteil, ohne Tag-Namen) in ein Objekt mit kleingeschriebenen Namen. */
export function attribute(text) {
  const werte = {};
  for (const m of text.matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>=`]+)))?/g)) {
    werte[m[1].toLowerCase()] = entschluesseln(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return werte;
}

/**
 * Ruft eine Adresse ohne Weiterleitung ab, damit die Antwort des Servers sichtbar bleibt.
 * Fehler kommen als Status 0 mit Text in `fehler` zurück, der Lauf geht weiter.
 */
export async function abrufen(url, kennung = STANDARD_KENNUNG) {
  try {
    const antwort = await fetch(url, {
      redirect: 'manual',
      headers: {
        'user-agent': kennung,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(ZEITGRENZE_MS),
    });
    return {
      status: antwort.status,
      text: await antwort.text(),
      location: antwort.headers.get('location') ?? '',
      fehler: '',
    };
  } catch (fehler) {
    return { status: 0, text: '', location: '', fehler: fehler.cause?.message ?? fehler.message };
  }
}

/** Schreibt eine Adresse aus der Sitemap auf die Basis um; fremde Hosts werden übersprungen und gemeldet. */
function aufBasis(ort, basis, hinweise) {
  try {
    const adresse = new URL(ort);
    if (adresse.origin === PRODUKTIONSHOST) return `${basis}${adresse.pathname}${adresse.search}`;
    if (adresse.origin === basis) return ort;
    hinweise.push(`Sitemap-Eintrag übersprungen (fremder Host): ${ort}`);
    return null;
  } catch {
    hinweise.push(`Sitemap-Eintrag ist keine Adresse: ${ort}`);
    return null;
  }
}

/** Pfad in Normalform: mit führendem /, ohne abschließenden /, außer der Startseite. */
function normalisieren(pfad) {
  let sauber = pfad.startsWith('/') ? pfad : `/${pfad}`;
  if (sauber.length > 1 && sauber.endsWith('/')) sauber = sauber.slice(0, -1);
  return sauber;
}

async function sitemapPfade(url, basis, hinweise, tiefe, besucht) {
  if (tiefe > 3 || besucht.has(url)) return [];
  besucht.add(url);
  const antwort = await abrufen(url);
  if (antwort.status !== 200) {
    hinweise.push(`Sitemap nicht lesbar: ${url} (Status ${antwort.status || antwort.fehler})`);
    return [];
  }
  const ziele = [...antwort.text.matchAll(/<loc>([\s\S]*?)<\/loc>/g)]
    .map((m) => aufBasis(entschluesseln(m[1].trim()), basis, hinweise))
    .filter(Boolean);
  if (/<sitemapindex\b/i.test(antwort.text)) {
    const pfade = [];
    for (const ziel of ziele) pfade.push(...(await sitemapPfade(ziel, basis, hinweise, tiefe + 1, besucht)));
    return pfade;
  }
  return ziele.map((ziel) => {
    const adresse = new URL(ziel);
    return adresse.pathname + adresse.search;
  });
}

async function dateienIn(ordner) {
  const eintraege = await readdir(ordner, { withFileTypes: true });
  const ergebnis = [];
  for (const eintrag of eintraege) {
    const voll = path.join(ordner, eintrag.name);
    if (eintrag.isDirectory()) ergebnis.push(...(await dateienIn(voll)));
    else ergebnis.push(voll);
  }
  return ergebnis;
}

/** Statische Routen aus dem Code: app/**\/page.* ohne dynamische, parallele und private Ordner. */
async function routenAusCode(projekt, hinweise) {
  const app = path.join(projekt, 'app');
  let dateien;
  try {
    dateien = await dateienIn(app);
  } catch {
    hinweise.push(`Ordner app nicht gefunden: ${app}`);
    return [];
  }
  const pfade = [];
  for (const datei of dateien) {
    if (!/^page\.(tsx|ts|jsx|js)$/.test(path.basename(datei))) continue;
    const segmente = path
      .relative(app, path.dirname(datei))
      .split(path.sep)
      .filter((segment) => segment && !/^\(.*\)$/.test(segment));
    if (segmente.some((segment) => /^[[@_]/.test(segment))) continue;
    pfade.push(`/${segmente.join('/')}`);
  }
  return pfade;
}

/** Vorgerenderte Seiten aus der Build-Ausgabe .next/server/app (nur *.html; Sonderseiten ausgenommen). */
async function routenAusBuild(projekt, hinweise) {
  const wurzel = path.join(projekt, '.next', 'server', 'app');
  let dateien;
  try {
    dateien = (await dateienIn(wurzel)).filter((datei) => datei.endsWith('.html'));
  } catch {
    hinweise.push(`Build-Ausgabe fehlt: ${wurzel} (erst den Produktions-Build erzeugen; Quelle entfällt)`);
    return [];
  }
  const pfade = [];
  for (const datei of dateien) {
    const teile = path.relative(wurzel, datei).slice(0, -'.html'.length).split(path.sep);
    const letzter = teile.pop();
    const segmente = letzter === 'index' ? teile : [...teile, letzter];
    if (segmente.some((segment) => segment.startsWith('_')) || ['404', '500'].includes(segmente[0])) continue;
    pfade.push(`/${segmente.join('/')}`);
  }
  return pfade;
}

/**
 * Seitenliste aus Sitemap (mit Umschreibung auf die Basis), Routen im Code, Build-Ausgabe und Zusatzseiten.
 * Jeder Pfad trägt die Quellen, aus denen er stammt. `hinweise` nennt, was nicht gelesen werden konnte.
 */
export async function seitenliste({ basis, projekt }) {
  const hinweise = [];
  const quellen = new Map();
  const hinzu = (pfad, quelle) => {
    const sauber = normalisieren(pfad);
    if (!quellen.has(sauber)) quellen.set(sauber, new Set());
    quellen.get(sauber).add(quelle);
  };
  for (const pfad of await sitemapPfade(`${basis}/sitemap.xml`, basis, hinweise, 0, new Set())) hinzu(pfad, 'sitemap');
  for (const pfad of await routenAusCode(projekt, hinweise)) hinzu(pfad, 'route');
  for (const pfad of await routenAusBuild(projekt, hinweise)) hinzu(pfad, 'build');
  for (const pfad of ZUSATZ_PFADE) hinzu(pfad, 'zusatz');
  return {
    seiten: [...quellen].map(([pfad, menge]) => ({ pfad, quellen: [...menge] })),
    hinweise,
  };
}

/** Median einer Zahlenliste; bei gerader Anzahl der Mittelwert der beiden Mitten. */
export function median(zahlen) {
  if (zahlen.length === 0) return null;
  const sortiert = [...zahlen].sort((a, b) => a - b);
  const mitte = Math.floor(sortiert.length / 2);
  return sortiert.length % 2 ? sortiert[mitte] : (sortiert[mitte - 1] + sortiert[mitte]) / 2;
}

/** Kleinster und größter Wert einer Zahlenliste. */
export function spanne(zahlen) {
  if (zahlen.length === 0) return null;
  return [Math.min(...zahlen), Math.max(...zahlen)];
}

/** Dateinamensteil aus einem Pfad; die Startseite heißt „start“. */
export function dateiSlug(pfad) {
  const teil = pfad
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return teil || 'start';
}

/** Wartet, bis Schriften geladen und laufende Übergänge und Animationen beendet sind. */
export async function beruhigen(page) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForFunction(
    () =>
      document
        .getAnimations()
        .every((animation) => animation.playState !== 'running' || animation.effect?.getTiming().iterations === Infinity),
    undefined,
    { timeout: 15_000 },
  );
}

/** Scrollt einmal durch die Seite, damit Inhalte mit Einblendung (und verzögerte Bilder) geladen sind. */
export async function durchscrollen(page) {
  await page.evaluate(async () => {
    const hoehe = document.documentElement.scrollHeight;
    for (let y = 0; y < hoehe; y += 300) {
      window.scrollTo(0, y);
      await new Promise((weiter) => setTimeout(weiter, 40));
    }
    window.scrollTo(0, 0);
  });
}

/** Schreibt eine Datei in den Ausgabeordner und meldet den vollen Pfad. */
export async function ausschreiben(ordner, datei, inhalt) {
  const ziel = path.join(ordner, datei);
  await writeFile(ziel, inhalt, 'utf8');
  console.log(`geschrieben: ${ziel}`);
}
