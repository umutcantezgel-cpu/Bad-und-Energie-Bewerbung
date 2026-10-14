#!/usr/bin/env node
import { createHash, createSign } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Meldet geänderte Seiten automatisch an Suchmaschinen (Plan §C1). Läuft in .github/workflows/indexierung.yml nach
 * jedem Production-Deploy, täglich und von Hand; lokal genauso:
 *
 *   node scripts/seo/benachrichtigen.mjs              # vergleichen und melden
 *   node scripts/seo/benachrichtigen.mjs --trocken    # nur zählen, nichts melden, Stand nicht schreiben
 *
 * Ablauf:
 * 1. Liest /sitemap.xml (auch als Sitemap-Index) und /feeds/jobs.json der Live-Seite. Je URL entsteht ein
 *    Fingerabdruck aus lastmod und, bei Stellen, dem Inhalt des JobPostings im Feed.
 * 2. Vergleicht mit dem letzten Stand (STAND_DATEI, im Workflow per actions/cache, lokal im Temp-Ordner): neu,
 *    geändert, entfernt.
 * 3. Google Indexing API: NUR Stellenseiten /jobs/<slug> (die API ist für JobPosting-Seiten gedacht). Neu und
 *    geändert → URL_UPDATED, entfernt (beendet, noindex oder weg) → URL_DELETED. Anmeldung als Service-Account per
 *    JWT (RS256, node:crypto) aus GOOGLE_INDEXING_SA_KEY, ohne zusätzliche Abhängigkeit.
 * 4. IndexNow: alle neuen, geänderten und entfernten URLs über das vorhandene POST /api/indexnow
 *    (INDEXNOW_SUBMIT_TOKEN), in Paketen zu höchstens 1000.
 *
 * Je Ziel zählt ein eigener Stand: Er rückt nur für URLs vor, die dieses Ziel angenommen hat. Fehlt ein Geheimnis,
 * wird das Ziel mit Hinweis übersprungen und sein Stand bleibt, wie er ist; ist es später da, holt der nächste Lauf
 * alles seitdem Geänderte nach. Die Ausgabe nennt nur Zählwerte, nie URLs, Token oder Antworttexte (M-032).
 *
 * Schutz vor Fehlalarm: Liefert die Seite keine URLs, bricht der Lauf ab. Sonst gilt die Prüfung je Gruppe wie in den
 * Teil-Sitemaps (Kern, Stellen, Orte, Themen): Verschwinden in einer Gruppe mehr als die Hälfte der bekannten URLs auf
 * einmal, holt der Lauf diese Seiten einzeln. Sind sie nicht mehr indexierbar (404 oder 410, Weiterleitung, noindex),
 * ist das eine echte Änderung und wird gemeldet (z. B. alle Ortsseiten am Fahrplanwechsel per Gate I5 auf noindex).
 * Sind sie weiter indexierbar, ist die Sitemap kaputt: Nur diese Gruppe wird nicht gemeldet und behält ihren Stand,
 * Exit 1; die übrigen Gruppen, vor allem die Stellen für Google, laufen weiter (Prüfung E-029). Rückweg, wenn eine
 * Gruppe zu Recht gesperrt bleibt: docs/operations/orte-oepnv.md, „Indexierung nach dem Fahrplanwechsel“.
 */

/**
 * @typedef {(url: string, init?: RequestInit) => Promise<Response>} Abruf  fetch oder eine Attrappe im Test
 * @typedef {Record<string, string | undefined>} Umgebung  wie process.env
 * @typedef {Record<string, string>} Stand  URL → Fingerabdruck
 * @typedef {{ neu: string[], geaendert: string[], entfernt: string[] }} Unterschied
 */

export const STANDARD_BASIS = 'https://karriere.bad-energie.de';
/** Ohne STAND_DATEI (lokal) außerhalb des Repos; der Workflow setzt .indexierung/stand.json für actions/cache. */
export const STANDARD_STAND_DATEI = path.join(os.tmpdir(), 'bad-energie-indexierung', 'stand.json');
export const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';
export const GOOGLE_TOKEN_URI = 'https://oauth2.googleapis.com/token';
export const GOOGLE_PUBLISH_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
/** Obergrenze von POST /api/indexnow (app/api/indexnow/route.ts). */
export const INDEXNOW_PAKET = 1000;
/** Mehr als dieser Anteil bekannter URLs verschwindet auf einmal → Abbruch. */
export const MAX_ANTEIL_ENTFERNT = 0.5;
/** Sitemap-Index höchstens so tief verfolgen. */
const MAX_SITEMAP_TIEFE = 2;
const USER_AGENT = 'bad-energie-indexierung/1.0 (+https://karriere.bad-energie.de)';

// ---------------------------------------------------------------------------
// Lesen: Sitemap und Stellen-Feed
// ---------------------------------------------------------------------------

function entities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Liest eine Sitemap: `<urlset>` mit `<url><loc>` und optional `<lastmod>`, oder einen `<sitemapindex>` mit den
 * Adressen der Teil-Sitemaps. Ohne XML-Bibliothek, wie die Sitemap von Next.js sie schreibt.
 */
export function parseSitemap(xml) {
  const seiten = new Map();
  const sitemaps = [];
  for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([\s\S]*?)<\/loc>/.exec(block)?.[1];
    if (!loc) continue;
    seiten.set(entities(loc), entities(/<lastmod>([\s\S]*?)<\/lastmod>/.exec(block)?.[1] ?? ''));
  }
  for (const [, block] of xml.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g)) {
    const loc = /<loc>([\s\S]*?)<\/loc>/.exec(block)?.[1];
    if (loc) sitemaps.push(entities(loc));
  }
  return { seiten, sitemaps };
}

/** Kanonische Adresse ohne Query und Fragment (der Feed hängt UTM-Parameter an `url`). */
export function kanonisch(url) {
  const u = new URL(url);
  u.search = '';
  u.hash = '';
  return u.toString();
}

/** Stabile Zeichenkette eines Werts mit sortierten Schlüsseln (Fingerabdruck unabhängig von der Reihenfolge). */
function stabil(wert) {
  if (Array.isArray(wert)) return `[${wert.map(stabil).join(',')}]`;
  if (wert && typeof wert === 'object') {
    return `{${Object.keys(wert)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stabil(wert[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(wert);
}

export function hash(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

/** /feeds/jobs.json → Map(kanonische Stellen-URL → Fingerabdruck des JobPostings ohne die UTM-Adresse). */
export function jobsAusFeed(feed) {
  const jobs = new Map();
  if (!Array.isArray(feed)) return jobs;
  for (const eintrag of feed) {
    const adresse = typeof eintrag?.url === 'string' ? eintrag.url : typeof eintrag?.['@id'] === 'string' ? eintrag['@id'] : null;
    if (!adresse) continue;
    // Fingerabdruck ohne `url`: Sie trägt UTM-Parameter, die nichts am Inhalt der Stelle ändern.
    const inhalt = { ...eintrag };
    delete inhalt.url;
    jobs.set(kanonisch(adresse), hash(stabil(inhalt)));
  }
  return jobs;
}

/** Stand der Live-Seite: { url: fingerabdruck } aus Sitemap (lastmod) und Feed (Inhalt der Stelle). */
export function aktuellerStand(seiten, jobs) {
  const stand = {};
  for (const url of new Set([...seiten.keys(), ...jobs.keys()])) {
    stand[url] = [seiten.get(url) ?? '', jobs.get(url) ?? ''].join('|');
  }
  return stand;
}

// ---------------------------------------------------------------------------
// Vergleichen
// ---------------------------------------------------------------------------

/** Unterschied zweier Stände (alt null = noch nie gemeldet: alles ist neu). Listen sortiert. */
export function vergleiche(alt, neu) {
  const vorher = alt ?? {};
  const ergebnis = { neu: [], geaendert: [], entfernt: [] };
  for (const [url, fp] of Object.entries(neu)) {
    if (!(url in vorher)) ergebnis.neu.push(url);
    else if (vorher[url] !== fp) ergebnis.geaendert.push(url);
  }
  for (const url of Object.keys(vorher)) if (!(url in neu)) ergebnis.entfernt.push(url);
  for (const liste of Object.values(ergebnis)) liste.sort();
  return ergebnis;
}

/** Stellenseite /jobs/<slug> der eigenen Website (nicht die Liste /jobs). */
export function istStellenseite(url, basis = STANDARD_BASIS) {
  try {
    const u = new URL(url);
    return u.origin === new URL(basis).origin && /^\/jobs\/[^/]+\/?$/.test(u.pathname);
  } catch {
    return false;
  }
}

/** Nur die Stellenseiten eines Stands. */
export function nurStellen(stand, basis = STANDARD_BASIS) {
  return Object.fromEntries(Object.entries(stand).filter(([url]) => istStellenseite(url, basis)));
}

/** Meldungen an Google aus einem Vergleich der Stellen: neu und geändert → URL_UPDATED, entfernt → URL_DELETED. */
export function googleMeldungen(diff) {
  return [
    ...[...diff.neu, ...diff.geaendert].map((url) => ({ url, type: 'URL_UPDATED' })),
    ...diff.entfernt.map((url) => ({ url, type: 'URL_DELETED' })),
  ];
}

/** Alle URLs für IndexNow (Suchmaschinen holen entfernte Seiten neu und sehen 404, Weiterleitung oder noindex). */
export function indexNowUrls(diff) {
  return [...diff.neu, ...diff.geaendert, ...diff.entfernt];
}

/** Gruppen wie die Teil-Sitemaps (/sitemap/kern.xml, stellen.xml, orte.xml, themen.xml), nach dem Pfad. */
export const GRUPPEN = Object.freeze(['kern', 'stellen', 'orte', 'themen']);
const GRUPPEN_NAME = { kern: 'Kern', stellen: 'Stellen', orte: 'Orte', themen: 'Themen' };

/** Gruppe einer URL: /jobs… Stellen, /einsatzgebiet… Orte, /arbeiten-bei-uns… Themen, sonst Kern. */
export function gruppeVon(url) {
  let pfad;
  try {
    pfad = new URL(url).pathname;
  } catch {
    return 'kern';
  }
  if (/^\/jobs(?:\/|$)/.test(pfad)) return 'stellen';
  if (/^\/einsatzgebiet(?:\/|$)/.test(pfad)) return 'orte';
  if (/^\/arbeiten-bei-uns(?:\/|$)/.test(pfad)) return 'themen';
  return 'kern';
}

/**
 * Prüft, ob die Seite leer wirkt (Abbruch) und welche Gruppen verdächtig viel auf einmal verlieren. `erklaert`: URLs,
 * deren Verschwinden belegt ist (nicht mehr indexierbar, siehe nichtMehrIndexierbar); sie zählen nicht mit.
 * Ergebnis: `abbruch` (Text oder null) und `gesperrt` (Gruppe → Text, nur Zählwerte).
 * @param {Stand | null} alt
 * @param {Stand} neu
 * @param {Set<string>} [erklaert]
 * @returns {{ abbruch: string | null, gesperrt: Map<string, string> }}
 */
export function pruefePlausibel(alt, neu, erklaert = new Set()) {
  const gesperrt = new Map();
  if (Object.keys(neu).length === 0) return { abbruch: 'Die Seite liefert keine URLs (Sitemap leer oder nicht lesbar).', gesperrt };
  for (const gruppe of GRUPPEN) {
    const bekannt = Object.keys(alt ?? {}).filter((url) => gruppeVon(url) === gruppe);
    if (bekannt.length === 0) continue;
    const fehlen = bekannt.filter((url) => !(url in neu) && !erklaert.has(url)).length;
    if (fehlen / bekannt.length > MAX_ANTEIL_ENTFERNT) {
      gesperrt.set(gruppe, `${GRUPPEN_NAME[gruppe]}: ${fehlen} von ${bekannt.length} bekannten URLs fehlen auf einmal und sind weiter indexierbar.`);
    }
  }
  return { abbruch: null, gesperrt };
}

/** `<meta name="robots" content="…noindex…">` in beliebiger Attribut-Reihenfolge. */
const NOINDEX_META = [/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i, /<meta\b[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i];

/**
 * Ist eine Seite nicht mehr indexierbar? Ja bei 404 oder 410, bei einer Weiterleitung und bei noindex (Kopfzeile
 * X-Robots-Tag oder Meta-Element). Nein bei einer normalen Seite und wenn sie nicht lesbar ist (dann gilt die Vorsicht).
 * @param {string} url
 * @param {Abruf} [fetchFn]
 */
export async function nichtMehrIndexierbar(url, fetchFn = fetch) {
  try {
    const res = await fetchFn(url, { headers: { 'User-Agent': USER_AGENT }, redirect: 'manual' });
    if (res.status === 404 || res.status === 410 || (res.status >= 300 && res.status < 400)) return true;
    if (!res.ok) return false;
    if (/noindex/i.test(res.headers.get('x-robots-tag') ?? '')) return true;
    const html = await res.text();
    return NOINDEX_META.some((muster) => muster.test(html));
  } catch {
    return false;
  }
}

/**
 * Stand zum Melden: Für gesperrte Gruppen gilt der alte Stand (nichts gemeldet, nichts vorgerückt), sonst der neue.
 * @param {Stand} neu
 * @param {Stand | null} alt
 * @param {Iterable<string>} gesperrt
 */
export function ohneGesperrte(neu, alt, gesperrt) {
  const sperre = new Set(gesperrt);
  if (sperre.size === 0) return neu;
  const stand = Object.fromEntries(Object.entries(neu).filter(([url]) => !sperre.has(gruppeVon(url))));
  for (const [url, fp] of Object.entries(alt ?? {})) if (sperre.has(gruppeVon(url))) stand[url] = fp;
  return stand;
}

/** Neuer Stand eines Ziels: nur angenommene URLs rücken vor (gemeldet → neuer Fingerabdruck, entfernt → gelöscht). */
export function fortschreiben(alt, neu, angenommen) {
  const stand = { ...(alt ?? {}) };
  for (const url of angenommen) {
    if (url in neu) stand[url] = neu[url];
    else delete stand[url];
  }
  return stand;
}

// ---------------------------------------------------------------------------
// Google: Service-Account, JWT (RS256) und Indexing API
// ---------------------------------------------------------------------------

/**
 * Service-Account aus GOOGLE_INDEXING_SA_KEY: das JSON der Schlüsseldatei, wahlweise Base64-kodiert. Ein privater
 * Schlüssel mit „\n“ als Text (doppelt maskiert) wird repariert. Ohne client_email oder private_key: null.
 */
export function leseServiceAccount(wert) {
  const roh = (wert ?? '').trim();
  if (!roh) return null;
  let text = roh;
  if (!roh.startsWith('{')) {
    try {
      text = Buffer.from(roh, 'base64').toString('utf8');
    } catch {
      return null;
    }
  }
  try {
    const sa = JSON.parse(text);
    if (typeof sa?.client_email !== 'string' || typeof sa?.private_key !== 'string') return null;
    return {
      client_email: sa.client_email,
      private_key: sa.private_key.includes('\\n') ? sa.private_key.replace(/\\n/g, '\n') : sa.private_key,
      token_uri: typeof sa.token_uri === 'string' && sa.token_uri.startsWith('https://') ? sa.token_uri : GOOGLE_TOKEN_URI,
    };
  } catch {
    return null;
  }
}

const base64url = (wert) => Buffer.from(typeof wert === 'string' ? wert : JSON.stringify(wert)).toString('base64url');

/** Signiertes JWT für den Token-Tausch (RFC 7523): eine Stunde gültig, Scope nur Indexing. */
export function baueJwt(sa, jetztSek = Math.floor(Date.now() / 1000)) {
  const kopf = base64url({ alg: 'RS256', typ: 'JWT' });
  const inhalt = base64url({ iss: sa.client_email, scope: INDEXING_SCOPE, aud: sa.token_uri, iat: jetztSek, exp: jetztSek + 3600 });
  const signatur = createSign('RSA-SHA256').update(`${kopf}.${inhalt}`).sign(sa.private_key).toString('base64url');
  return `${kopf}.${inhalt}.${signatur}`;
}

/**
 * Zugriffstoken per JWT-Bearer-Tausch; wirft bei Ablehnung nur mit Statuscode.
 * @param {{ client_email: string, private_key: string, token_uri: string }} sa
 * @param {Abruf} [fetchFn]
 */
export async function googleToken(sa, fetchFn = fetch) {
  const res = await fetchFn(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: baueJwt(sa) }).toString(),
  });
  const daten = res.ok ? await res.json().catch(() => null) : null;
  if (!daten?.access_token) throw new Error(`Google-Anmeldung abgelehnt (HTTP ${res.status})`);
  return daten.access_token;
}

/**
 * Meldet einzeln an die Indexing API; Ergebnis: angenommene URLs und Statuscodes der Fehler (ohne Text).
 * @param {Array<{ url: string, type: 'URL_UPDATED' | 'URL_DELETED' }>} meldungen
 * @param {string} token
 * @param {Abruf} [fetchFn]
 */
export async function meldeGoogle(meldungen, token, fetchFn = fetch) {
  const angenommen = [];
  const fehler = [];
  for (const meldung of meldungen) {
    const res = await fetchFn(GOOGLE_PUBLISH_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(meldung),
    });
    if (res.ok) angenommen.push(meldung.url);
    else fehler.push(res.status);
    // Kontingent erschöpft: Die übrigen Meldungen holt der nächste Lauf nach.
    if (res.status === 429) break;
  }
  return { angenommen, fehler };
}

// ---------------------------------------------------------------------------
// IndexNow über POST /api/indexnow
// ---------------------------------------------------------------------------

/**
 * @param {string[]} urls
 * @param {string} basis
 * @param {string} token
 * @param {Abruf} [fetchFn]
 */
export async function meldeIndexNow(urls, basis, token, fetchFn = fetch) {
  const angenommen = [];
  const fehler = [];
  for (let i = 0; i < urls.length; i += INDEXNOW_PAKET) {
    const paket = urls.slice(i, i + INDEXNOW_PAKET);
    const res = await fetchFn(`${basis.replace(/\/+$/, '')}/api/indexnow`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
      body: JSON.stringify({ urls: paket }),
    });
    if (res.ok) angenommen.push(...paket);
    else fehler.push(res.status);
  }
  return { angenommen, fehler };
}

// ---------------------------------------------------------------------------
// Ablauf
// ---------------------------------------------------------------------------

async function holeText(url, fetchFn) {
  const res = await fetchFn(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} beim Lesen von ${new URL(url).pathname}`);
  return res.text();
}

/**
 * Alle Seiten der Sitemap, Sitemap-Indizes bis MAX_SITEMAP_TIEFE verfolgt (nur eigene Adressen).
 * @param {string} basis
 * @param {Abruf} [fetchFn]
 */
export async function leseSeiten(basis, fetchFn = fetch) {
  const seiten = new Map();
  const offen = [[`${basis.replace(/\/+$/, '')}/sitemap.xml`, 0]];
  const gesehen = new Set();
  while (offen.length > 0) {
    const [adresse, tiefe] = offen.shift();
    if (gesehen.has(adresse)) continue;
    gesehen.add(adresse);
    const teil = parseSitemap(await holeText(adresse, fetchFn));
    for (const [url, lastmod] of teil.seiten) seiten.set(url, lastmod);
    if (tiefe < MAX_SITEMAP_TIEFE) {
      for (const sitemap of teil.sitemaps) if (new URL(sitemap).origin === new URL(basis).origin) offen.push([sitemap, tiefe + 1]);
    }
  }
  return seiten;
}

export function leseStand(datei) {
  try {
    const daten = JSON.parse(fs.readFileSync(datei, 'utf8'));
    return { google: daten?.ziele?.google ?? null, indexnow: daten?.ziele?.indexnow ?? null };
  } catch {
    return { google: null, indexnow: null };
  }
}

function schreibeStand(datei, stand) {
  fs.mkdirSync(path.dirname(datei), { recursive: true });
  fs.writeFileSync(datei, `${JSON.stringify({ version: 1, ziele: stand }, null, 2)}\n`);
}

const zahlen = (diff) => `${diff.neu.length} neu, ${diff.geaendert.length} geändert, ${diff.entfernt.length} entfernt`;

/**
 * Ein Lauf. `umgebung` wie process.env, `log` für Zeilen mit Zählwerten. Liefert den Exit-Code: 0 gemeldet oder
 * übersprungen, 1 Fehler (Seite nicht lesbar, unplausibel, ein Ziel hat abgelehnt).
 * @param {{ umgebung?: Umgebung, argv?: string[], fetchFn?: Abruf, log?: (zeile: string) => void }} [optionen]
 * @returns {Promise<number>}
 */
export async function lauf({ umgebung = process.env, argv = process.argv.slice(2), fetchFn = fetch, log = console.log } = {}) {
  const basis = (umgebung.SITE_URL || STANDARD_BASIS).replace(/\/+$/, '');
  const datei = umgebung.STAND_DATEI || STANDARD_STAND_DATEI;
  const trocken = argv.includes('--trocken') || umgebung.INDEXIERUNG_TROCKEN === 'true';

  let neu;
  try {
    const seiten = await leseSeiten(basis, fetchFn);
    const feed = JSON.parse(await holeText(`${basis}/feeds/jobs.json`, fetchFn));
    neu = aktuellerStand(seiten, jobsAusFeed(feed));
  } catch (err) {
    log(`Abbruch: Live-Seite nicht lesbar (${err instanceof Error ? err.message : 'unbekannt'}).`);
    return 1;
  }

  const alt = leseStand(datei);
  const neuStellen = nurStellen(neu, basis);
  log(`Live-Seite: ${Object.keys(neu).length} URLs, davon ${Object.keys(neuStellen).length} Stellenseiten.`);

  // Geprüft wird je Gruppe gegen alles Bekannte. Fehlt in einer Gruppe mehr als die Hälfte auf einmal, entscheidet die
  // Seite selbst: nicht mehr indexierbar (beendete Stellen, Gate der Ortsseiten) = echte Änderung, sonst kaputt.
  const bekannt = { ...(alt.google ?? {}), ...(alt.indexnow ?? {}) };
  const vorab = pruefePlausibel(bekannt, neu);
  if (vorab.abbruch) {
    log(`Abbruch: ${vorab.abbruch} Nichts gemeldet, Stand unverändert. Erst die Live-Seite prüfen.`);
    return 1;
  }
  const erklaert = new Set();
  for (const gruppe of vorab.gesperrt.keys()) {
    const fehlen = Object.keys(bekannt)
      .filter((url) => gruppeVon(url) === gruppe && !(url in neu))
      .sort();
    for (const url of fehlen) if (await nichtMehrIndexierbar(url, fetchFn)) erklaert.add(url);
    log(`${GRUPPEN_NAME[gruppe]}: ${fehlen.length} URLs nicht mehr in der Sitemap, davon ${fehlen.filter((u) => erklaert.has(u)).length} nicht mehr indexierbar (noindex, 404/410 oder Weiterleitung).`);
  }
  const { gesperrt } = pruefePlausibel(bekannt, neu, erklaert);
  for (const text of gesperrt.values()) log(`Gesperrt: ${text} Diese Gruppe wird nicht gemeldet, ihr Stand bleibt; die übrigen laufen weiter.`);

  const neuIndexNow = ohneGesperrte(neu, alt.indexnow, gesperrt.keys());
  const neuGoogle = nurStellen(ohneGesperrte(neu, alt.google, gesperrt.keys()), basis);
  const diffIndexNow = vergleiche(alt.indexnow, neuIndexNow);
  const diffGoogle = vergleiche(alt.google, neuGoogle);
  log(`IndexNow: ${zahlen(diffIndexNow)}.`);
  log(`Google (nur /jobs/*): ${zahlen(diffGoogle)}.`);
  if (trocken) {
    log('Trockenlauf: nichts gemeldet, Stand nicht geschrieben.');
    return gesperrt.size > 0 ? 1 : 0;
  }

  const stand = { indexnow: alt.indexnow, google: alt.google };
  // Eine gesperrte Gruppe bleibt ein Fehler (der Lauf wird rot), auch wenn alles andere gemeldet ist.
  let fehlgeschlagen = gesperrt.size > 0;

  const urls = indexNowUrls(diffIndexNow);
  const indexNowToken = (umgebung.INDEXNOW_SUBMIT_TOKEN ?? '').trim();
  if (urls.length === 0) {
    stand.indexnow = neuIndexNow;
    log('IndexNow: nichts zu melden.');
  } else if (!indexNowToken) {
    log('IndexNow übersprungen: INDEXNOW_SUBMIT_TOKEN fehlt (Environment-Secret „indexierung“).');
  } else {
    const { angenommen, fehler } = await meldeIndexNow(urls, basis, indexNowToken, fetchFn);
    stand.indexnow = fortschreiben(alt.indexnow, neuIndexNow, angenommen);
    log(`IndexNow: ${angenommen.length} von ${urls.length} URLs gemeldet${fehler.length ? `, abgelehnt mit HTTP ${fehler.join(', ')}` : ''}.`);
    if (fehler.length) fehlgeschlagen = true;
  }

  const meldungen = googleMeldungen(diffGoogle);
  const sa = leseServiceAccount(umgebung.GOOGLE_INDEXING_SA_KEY);
  if (meldungen.length === 0) {
    stand.google = neuGoogle;
    log('Google: nichts zu melden.');
  } else if (!sa) {
    log(
      umgebung.GOOGLE_INDEXING_SA_KEY?.trim()
        ? 'Google übersprungen: GOOGLE_INDEXING_SA_KEY ist kein Service-Account-Schlüssel (JSON mit client_email und private_key).'
        : 'Google übersprungen: GOOGLE_INDEXING_SA_KEY fehlt (Environment-Secret „indexierung“).',
    );
  } else {
    try {
      const token = await googleToken(sa, fetchFn);
      const { angenommen, fehler } = await meldeGoogle(meldungen, token, fetchFn);
      stand.google = fortschreiben(alt.google, neuGoogle, angenommen);
      const aktualisiert = meldungen.filter((m) => m.type === 'URL_UPDATED' && angenommen.includes(m.url)).length;
      log(
        `Google: ${angenommen.length} von ${meldungen.length} gemeldet (${aktualisiert} URL_UPDATED, ${angenommen.length - aktualisiert} URL_DELETED)${fehler.length ? `, abgelehnt mit HTTP ${fehler.join(', ')}` : ''}.`,
      );
      if (fehler.length) fehlgeschlagen = true;
    } catch (err) {
      log(`Google: ${err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen'}.`);
      fehlgeschlagen = true;
    }
  }

  schreibeStand(datei, stand);
  return fehlgeschlagen ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  lauf().then((code) => {
    process.exitCode = code;
  });
}
