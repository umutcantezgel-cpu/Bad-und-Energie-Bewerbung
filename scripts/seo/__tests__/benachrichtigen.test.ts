import { createVerify, generateKeyPairSync } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  GOOGLE_PUBLISH_URL,
  GOOGLE_TOKEN_URI,
  INDEXING_SCOPE,
  INDEXNOW_PAKET,
  aktuellerStand,
  baueJwt,
  fortschreiben,
  googleMeldungen,
  gruppeVon,
  indexNowUrls,
  istStellenseite,
  jobsAusFeed,
  lauf,
  leseServiceAccount,
  meldeIndexNow,
  nichtMehrIndexierbar,
  nurStellen,
  ohneGesperrte,
  parseSitemap,
  pruefePlausibel,
  vergleiche,
} from '../benachrichtigen.mjs';

const B = 'https://karriere.bad-energie.de';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'indexierung-'));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

// Schlüssel nur für den Test, zur Laufzeit erzeugt (nie ein Schlüssel im Repo).
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const PRIVAT = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const SA = { client_email: 'indexierung@projekt.iam.gserviceaccount.com', private_key: PRIVAT, token_uri: GOOGLE_TOKEN_URI };

const sitemap = (eintraege: Array<[string, string?]>) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${eintraege
    .map(([loc, lastmod]) => `<url>\n<loc>${loc}</loc>${lastmod ? `\n<lastmod>${lastmod}</lastmod>` : ''}\n</url>`)
    .join('\n')}</urlset>`;

const job = (slug: string, extra: Record<string, unknown> = {}) => ({
  '@type': 'JobPosting',
  '@id': `${B}/jobs/${slug}#jobposting`,
  url: `${B}/jobs/${slug}?utm_source=jobs-json&utm_medium=jobboard&utm_campaign=${slug}`,
  title: slug,
  datePosted: '2026-10-01',
  validThrough: '2026-12-30T23:59:59+01:00',
  ...extra,
});

describe('Sitemap und Feed lesen', () => {
  it('urlset mit lastmod, Entitäten, Einträge ohne lastmod', () => {
    const { seiten, sitemaps } = parseSitemap(sitemap([[`${B}/`, '2026-10-12T08:00:00.000Z'], [`${B}/jobs?a=1&amp;b=2`], [`${B}/jobs/x`, '2026-10-10']]));
    expect([...seiten]).toEqual([
      [`${B}/`, '2026-10-12T08:00:00.000Z'],
      [`${B}/jobs?a=1&b=2`, ''],
      [`${B}/jobs/x`, '2026-10-10'],
    ]);
    expect(sitemaps).toEqual([]);
  });

  it('Sitemap-Index: nur die Adressen der Teil-Sitemaps', () => {
    const { seiten, sitemaps } = parseSitemap(
      `<sitemapindex><sitemap><loc>${B}/sitemap/kern.xml</loc></sitemap><sitemap><loc>${B}/sitemap/orte.xml</loc><lastmod>2026-10-01</lastmod></sitemap></sitemapindex>`,
    );
    expect(seiten.size).toBe(0);
    expect(sitemaps).toEqual([`${B}/sitemap/kern.xml`, `${B}/sitemap/orte.xml`]);
  });

  it('Feed: kanonische Stellen-URL ohne UTM, Fingerabdruck ändert sich mit dem Inhalt, nicht mit der UTM-Adresse', () => {
    const a = jobsAusFeed([job('anlagenmechaniker-shk-wetzlar')]);
    expect([...a.keys()]).toEqual([`${B}/jobs/anlagenmechaniker-shk-wetzlar`]);
    const andereUtm = jobsAusFeed([{ ...job('anlagenmechaniker-shk-wetzlar'), url: `${B}/jobs/anlagenmechaniker-shk-wetzlar?utm_source=x` }]);
    expect([...andereUtm.values()]).toEqual([...a.values()]);
    const andereReihenfolge = jobsAusFeed([Object.fromEntries(Object.entries(job('anlagenmechaniker-shk-wetzlar')).reverse())]);
    expect([...andereReihenfolge.values()]).toEqual([...a.values()]);
    const neuerInhalt = jobsAusFeed([job('anlagenmechaniker-shk-wetzlar', { validThrough: '2027-01-15T23:59:59+01:00' })]);
    expect([...neuerInhalt.values()]).not.toEqual([...a.values()]);
    expect(jobsAusFeed({ nicht: 'liste' }).size).toBe(0);
    expect(jobsAusFeed([{ title: 'ohne Adresse' }]).size).toBe(0);
  });

  it('aktueller Stand aus Sitemap und Feed: lastmod|Inhalt je URL', () => {
    const seiten = new Map([
      [`${B}/`, '2026-10-12'],
      [`${B}/jobs/a`, '2026-10-10'],
    ]);
    const jobs = new Map([
      [`${B}/jobs/a`, 'h1'],
      [`${B}/jobs/nur-im-feed`, 'h2'],
    ]);
    expect(aktuellerStand(seiten, jobs)).toEqual({ [`${B}/`]: '2026-10-12|', [`${B}/jobs/a`]: '2026-10-10|h1', [`${B}/jobs/nur-im-feed`]: '|h2' });
  });
});

describe('Diff-Logik', () => {
  const alt = { [`${B}/`]: '1|', [`${B}/jobs/a`]: '1|x', [`${B}/jobs/b`]: '1|y', [`${B}/einsatzgebiet/asslar`]: '1|' };
  const neu = { [`${B}/`]: '2|', [`${B}/jobs/a`]: '1|x', [`${B}/jobs/c`]: '1|z', [`${B}/einsatzgebiet/asslar`]: '1|' };

  it('neu, geändert und entfernt, sortiert; ohne alten Stand ist alles neu', () => {
    expect(vergleiche(alt, neu)).toEqual({ neu: [`${B}/jobs/c`], geaendert: [`${B}/`], entfernt: [`${B}/jobs/b`] });
    expect(vergleiche(null, neu)).toEqual({ neu: Object.keys(neu).sort(), geaendert: [], entfernt: [] });
    expect(vergleiche(neu, neu)).toEqual({ neu: [], geaendert: [], entfernt: [] });
  });

  it('Google bekommt NUR Stellenseiten /jobs/<slug>: neu/geändert → URL_UPDATED, entfernt → URL_DELETED', () => {
    expect(istStellenseite(`${B}/jobs/anlagenmechaniker-shk-wetzlar`)).toBe(true);
    expect(istStellenseite(`${B}/jobs/anlagenmechaniker-shk-wetzlar/`)).toBe(true);
    for (const url of [`${B}/jobs`, `${B}/`, `${B}/bewerbung`, `${B}/einsatzgebiet/asslar`, 'https://example.org/jobs/x', `${B}/jobs/x/y`, 'kaputt']) {
      expect(istStellenseite(url), url).toBe(false);
    }
    const diff = vergleiche(nurStellen(alt), nurStellen(neu));
    expect(googleMeldungen(diff)).toEqual([
      { url: `${B}/jobs/c`, type: 'URL_UPDATED' },
      { url: `${B}/jobs/b`, type: 'URL_DELETED' },
    ]);
  });

  it('IndexNow bekommt alle geänderten URLs, auch entfernte', () => {
    expect(indexNowUrls(vergleiche(alt, neu))).toEqual([`${B}/jobs/c`, `${B}/`, `${B}/jobs/b`]);
  });

  it('Stand rückt nur für angenommene URLs vor', () => {
    expect(fortschreiben(alt, neu, [`${B}/jobs/c`, `${B}/jobs/b`])).toEqual({
      [`${B}/`]: '1|',
      [`${B}/jobs/a`]: '1|x',
      [`${B}/jobs/c`]: '1|z',
      [`${B}/einsatzgebiet/asslar`]: '1|',
    });
    expect(fortschreiben(null, neu, [])).toEqual({});
  });

  it('Schutz vor Fehlalarm je Gruppe: leere Seite → Abbruch; mehr als die Hälfte einer Gruppe weg → nur diese gesperrt', () => {
    expect(pruefePlausibel(alt, {}).abbruch).toMatch(/keine URLs/);
    expect(pruefePlausibel(null, neu)).toEqual({ abbruch: null, gesperrt: new Map() });
    expect(pruefePlausibel(alt, neu)).toEqual({ abbruch: null, gesperrt: new Map() });
    // Alle Stellen weg, Kern und Orte da: nur die Stellen gesperrt
    const nurKern = { [`${B}/`]: '1|', [`${B}/einsatzgebiet/asslar`]: '1|' };
    expect([...pruefePlausibel(alt, nurKern).gesperrt.entries()]).toEqual([['stellen', 'Stellen: 2 von 2 bekannten URLs fehlen auf einmal und sind weiter indexierbar.']]);
    // Erklärt (nicht mehr indexierbar): kein Verdacht
    expect(pruefePlausibel(alt, nurKern, new Set([`${B}/jobs/a`, `${B}/jobs/b`])).gesperrt.size).toBe(0);
  });

  it('Gruppen nach dem Pfad wie die Teil-Sitemaps; gesperrte Gruppen behalten den alten Stand', () => {
    expect(gruppeVon(`${B}/jobs`)).toBe('stellen');
    expect(gruppeVon(`${B}/jobs/anlagenmechaniker-shk-wetzlar`)).toBe('stellen');
    expect(gruppeVon(`${B}/einsatzgebiet/herborn`)).toBe('orte');
    expect(gruppeVon(`${B}/einsatzgebiet`)).toBe('orte');
    expect(gruppeVon(`${B}/arbeiten-bei-uns/gehalt`)).toBe('themen');
    expect(gruppeVon(`${B}/`)).toBe('kern');
    expect(gruppeVon(`${B}/jobsuche`)).toBe('kern');
    expect(ohneGesperrte(neu, alt, [])).toBe(neu);
    expect(ohneGesperrte({ [`${B}/`]: '2|' }, alt, ['orte', 'stellen'])).toEqual({
      [`${B}/`]: '2|',
      [`${B}/jobs/a`]: '1|x',
      [`${B}/jobs/b`]: '1|y',
      [`${B}/einsatzgebiet/asslar`]: '1|',
    });
  });

  it('nicht mehr indexierbar: 404, 410, Weiterleitung, noindex (Meta oder Kopfzeile); sonst nicht, auch nicht bei Fehlern', async () => {
    const seite = (status: number, body = '', headers: Record<string, string> = {}) => async () => new Response(status === 204 ? null : body, { status, headers });
    expect(await nichtMehrIndexierbar(`${B}/x`, seite(404))).toBe(true);
    expect(await nichtMehrIndexierbar(`${B}/x`, seite(410))).toBe(true);
    expect(await nichtMehrIndexierbar(`${B}/x`, seite(308, '', { location: `${B}/einsatzgebiet` }))).toBe(true);
    expect(await nichtMehrIndexierbar(`${B}/x`, seite(200, '<head><meta name="robots" content="noindex, follow"/></head>'))).toBe(true);
    expect(await nichtMehrIndexierbar(`${B}/x`, seite(200, '<meta content="noindex,follow" name="robots">'))).toBe(true);
    expect(await nichtMehrIndexierbar(`${B}/x`, seite(200, '<p>ok</p>', { 'x-robots-tag': 'noindex' }))).toBe(true);
    expect(await nichtMehrIndexierbar(`${B}/x`, seite(200, '<head><meta name="robots" content="index, follow"/></head>'))).toBe(false);
    expect(await nichtMehrIndexierbar(`${B}/x`, seite(500))).toBe(false);
    expect(await nichtMehrIndexierbar(`${B}/x`, async () => Promise.reject(new Error('Netz')))).toBe(false);
  });
});

describe('JWT (RS256) für den Service-Account, ohne Netz', () => {
  it('Kopf, Inhalt und Signatur nach RFC 7523, eine Stunde gültig, nur der Indexing-Scope', () => {
    const jwt = baueJwt(SA, 1_760_000_000);
    const [kopf, inhalt, signatur] = jwt.split('.');
    expect(JSON.parse(Buffer.from(kopf, 'base64url').toString())).toEqual({ alg: 'RS256', typ: 'JWT' });
    expect(JSON.parse(Buffer.from(inhalt, 'base64url').toString())).toEqual({
      iss: SA.client_email,
      scope: INDEXING_SCOPE,
      aud: GOOGLE_TOKEN_URI,
      iat: 1_760_000_000,
      exp: 1_760_003_600,
    });
    expect(INDEXING_SCOPE).toBe('https://www.googleapis.com/auth/indexing');
    expect(createVerify('RSA-SHA256').update(`${kopf}.${inhalt}`).verify(publicKey, Buffer.from(signatur, 'base64url'))).toBe(true);
    expect(jwt).not.toMatch(/[+/=]/);
  });

  it('liest den Schlüssel als JSON oder Base64, repariert doppelt maskierte Zeilenumbrüche, lehnt Unvollständiges ab', () => {
    const json = JSON.stringify({ ...SA, type: 'service_account', project_id: 'p' });
    expect(leseServiceAccount(json)).toEqual(SA);
    expect(leseServiceAccount(Buffer.from(json).toString('base64'))).toEqual(SA);
    const doppelt = json.replace(/\\n/g, '\\\\n');
    expect(leseServiceAccount(doppelt)?.private_key).toBe(PRIVAT);
    expect(leseServiceAccount(JSON.stringify({ ...SA, token_uri: 'http://unsicher.example' }))?.token_uri).toBe(GOOGLE_TOKEN_URI);
    for (const wert of [undefined, '', '   ', '{kaputt', JSON.stringify({ client_email: 'x' }), JSON.stringify({ private_key: 'x' }), 'bm9jaCBrZWluIEpTT04=']) {
      expect(leseServiceAccount(wert), String(wert)).toBeNull();
    }
  });
});

describe('IndexNow über /api/indexnow', () => {
  it('Pakete zu höchstens 1000 URLs mit Bearer-Token; abgelehnte Pakete rücken nicht vor', async () => {
    const urls = Array.from({ length: INDEXNOW_PAKET + 5 }, (_, i) => `${B}/seite-${i}`);
    const aufrufe: Array<{ url: string; init: RequestInit }> = [];
    let n = 0;
    const fetchFn = async (url: string, init: RequestInit = {}) => {
      aufrufe.push({ url, init });
      n += 1;
      return new Response(null, { status: n === 1 ? 200 : 502 });
    };
    const { angenommen, fehler } = await meldeIndexNow(urls, `${B}/`, 'geheim-token-fuer-den-test-0123456789', fetchFn);
    expect(aufrufe.map((a) => a.url)).toEqual([`${B}/api/indexnow`, `${B}/api/indexnow`]);
    expect((aufrufe[0].init.headers as Record<string, string>).Authorization).toBe('Bearer geheim-token-fuer-den-test-0123456789');
    expect(JSON.parse(String(aufrufe[0].init.body)).urls).toHaveLength(INDEXNOW_PAKET);
    expect(JSON.parse(String(aufrufe[1].init.body)).urls).toHaveLength(5);
    expect(angenommen).toHaveLength(INDEXNOW_PAKET);
    expect(fehler).toEqual([502]);
  });
});

/**
 * Live-Seite und Dienste als Attrappe; protokolliert jeden Aufruf. `html` liefert einzelne Seiten (für die Prüfung
 * verschwundener URLs), alle anderen Adressen antworten mit 404.
 */
function welt({
  seiten,
  feed,
  google = 200,
  indexnow = 200,
  html = () => null,
}: {
  seiten: Array<[string, string?]>;
  feed: unknown[];
  google?: number;
  indexnow?: number;
  html?: (url: string) => string | null;
}) {
  const aufrufe: Array<{ url: string; body?: string }> = [];
  const fetchFn = async (url: string, init: RequestInit = {}) => {
    aufrufe.push({ url, body: init.body ? String(init.body) : undefined });
    if (url === `${B}/sitemap.xml`) return new Response(sitemap(seiten));
    if (url === `${B}/feeds/jobs.json`) return new Response(JSON.stringify(feed));
    if (url === GOOGLE_TOKEN_URI) return Response.json({ access_token: 'zugriff-nur-im-test', expires_in: 3599 });
    if (url === GOOGLE_PUBLISH_URL) return new Response('{}', { status: google });
    if (url === `${B}/api/indexnow`) return new Response('{}', { status: indexnow });
    const seite = html(url);
    if (seite !== null) return new Response(seite, { status: 200, headers: { 'content-type': 'text/html' } });
    return new Response(null, { status: 404 });
  };
  return { aufrufe, fetchFn };
}

describe('Ein Lauf (ohne Netz)', () => {
  const SEITEN: Array<[string, string?]> = [[`${B}/`, '2026-10-12'], [`${B}/jobs`, '2026-10-12'], [`${B}/jobs/a`, '2026-10-10'], [`${B}/jobs/b`, '2026-10-11']];
  const FEED = [job('a'), job('b')];
  const umgebung = (datei: string, extra: Record<string, string> = {}) => ({
    SITE_URL: B,
    STAND_DATEI: datei,
    GOOGLE_INDEXING_SA_KEY: JSON.stringify(SA),
    INDEXNOW_SUBMIT_TOKEN: 'geheim-token-fuer-den-test-0123456789',
    ...extra,
  });

  it('erster Lauf meldet alles, zweiter nichts; Ausgabe nur Zählwerte, nie URLs oder Geheimnisse', async () => {
    const datei = path.join(tmp, 'eins', 'stand.json');
    const log: string[] = [];
    const { aufrufe, fetchFn } = welt({ seiten: SEITEN, feed: FEED });
    expect(await lauf({ umgebung: umgebung(datei), argv: [], fetchFn, log: (z: string) => log.push(z) })).toBe(0);

    const google = aufrufe.filter((a) => a.url === GOOGLE_PUBLISH_URL).map((a) => JSON.parse(a.body ?? '{}'));
    expect(google).toEqual([
      { url: `${B}/jobs/a`, type: 'URL_UPDATED' },
      { url: `${B}/jobs/b`, type: 'URL_UPDATED' },
    ]);
    const indexnow = aufrufe.filter((a) => a.url === `${B}/api/indexnow`).map((a) => JSON.parse(a.body ?? '{}').urls);
    expect(indexnow).toEqual([[`${B}/`, `${B}/jobs`, `${B}/jobs/a`, `${B}/jobs/b`]]);
    expect(log.join('\n')).toContain('Google: 2 von 2 gemeldet (2 URL_UPDATED, 0 URL_DELETED)');
    expect(log.join('\n')).toContain('IndexNow: 4 von 4 URLs gemeldet');
    expect(log.join('\n')).not.toMatch(/https?:\/\/|geheim|zugriff-nur-im-test|BEGIN|PRIVATE/);

    const zweiter = welt({ seiten: SEITEN, feed: FEED });
    expect(await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: zweiter.fetchFn, log: () => {} })).toBe(0);
    expect(zweiter.aufrufe.map((a) => a.url)).toEqual([`${B}/sitemap.xml`, `${B}/feeds/jobs.json`]);
  });

  it('beendete Stelle → URL_DELETED an Google, alle Änderungen an IndexNow', async () => {
    const datei = path.join(tmp, 'zwei', 'stand.json');
    await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: welt({ seiten: SEITEN, feed: FEED }).fetchFn, log: () => {} });
    const danach = welt({ seiten: [[`${B}/`, '2026-10-14'], [`${B}/jobs`, '2026-10-14'], [`${B}/jobs/a`, '2026-10-10']], feed: [job('a')] });
    expect(await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: danach.fetchFn, log: () => {} })).toBe(0);
    expect(danach.aufrufe.filter((a) => a.url === GOOGLE_PUBLISH_URL).map((a) => JSON.parse(a.body ?? '{}'))).toEqual([
      { url: `${B}/jobs/b`, type: 'URL_DELETED' },
    ]);
    expect(danach.aufrufe.filter((a) => a.url === `${B}/api/indexnow`).map((a) => JSON.parse(a.body ?? '{}').urls)).toEqual([
      [`${B}/`, `${B}/jobs`, `${B}/jobs/b`],
    ]);
  });

  it('fehlen die Geheimnisse, werden beide Ziele mit Hinweis übersprungen; ihr Stand bleibt für später', async () => {
    const datei = path.join(tmp, 'drei', 'stand.json');
    const log: string[] = [];
    const ohne = welt({ seiten: SEITEN, feed: FEED });
    const code = await lauf({ umgebung: { SITE_URL: B, STAND_DATEI: datei }, argv: [], fetchFn: ohne.fetchFn, log: (z: string) => log.push(z) });
    expect(code).toBe(0);
    expect(ohne.aufrufe.map((a) => a.url)).toEqual([`${B}/sitemap.xml`, `${B}/feeds/jobs.json`]);
    expect(log.join('\n')).toContain('IndexNow übersprungen: INDEXNOW_SUBMIT_TOKEN fehlt');
    expect(log.join('\n')).toContain('Google übersprungen: GOOGLE_INDEXING_SA_KEY fehlt');
    // Später mit Geheimnissen: alles seitdem wird nachgeholt.
    const mit = welt({ seiten: SEITEN, feed: FEED });
    await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: mit.fetchFn, log: () => {} });
    expect(mit.aufrufe.filter((a) => a.url === GOOGLE_PUBLISH_URL)).toHaveLength(2);
  });

  it('Kontingent erschöpft (429): Rest beim nächsten Lauf, Exit 1, nur der Statuscode im Log', async () => {
    const datei = path.join(tmp, 'vier', 'stand.json');
    const log: string[] = [];
    const voll = welt({ seiten: SEITEN, feed: FEED, google: 429 });
    expect(await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: voll.fetchFn, log: (z: string) => log.push(z) })).toBe(1);
    expect(voll.aufrufe.filter((a) => a.url === GOOGLE_PUBLISH_URL)).toHaveLength(1);
    expect(log.join('\n')).toContain('Google: 0 von 2 gemeldet (0 URL_UPDATED, 0 URL_DELETED), abgelehnt mit HTTP 429');
    const spaeter = welt({ seiten: SEITEN, feed: FEED });
    await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: spaeter.fetchFn, log: () => {} });
    expect(spaeter.aufrufe.filter((a) => a.url === GOOGLE_PUBLISH_URL)).toHaveLength(2);
    // IndexNow hatte schon angenommen: nichts doppelt
    expect(spaeter.aufrufe.filter((a) => a.url === `${B}/api/indexnow`)).toHaveLength(0);
  });

  it('kaputte Sitemap und leerer Feed: Stellen gesperrt, nichts an Google, ihr Stand bleibt; ohne Antwort Abbruch', async () => {
    const datei = path.join(tmp, 'fuenf', 'stand.json');
    await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: welt({ seiten: SEITEN, feed: FEED }).fetchFn, log: () => {} });
    const vorher = fs.readFileSync(datei, 'utf8');
    const log: string[] = [];
    // Die Stellenseiten gibt es weiter (200, indexierbar): Nur Sitemap und Feed sind kaputt
    const leer = welt({ seiten: [[`${B}/`, '2026-10-14']], feed: [], html: (url) => (url.startsWith(`${B}/jobs`) ? '<html><head></head></html>' : null) });
    expect(await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: leer.fetchFn, log: (z: string) => log.push(z) })).toBe(1);
    // Sitemap und Feed, dann die drei verschwundenen Stellen-URLs einzeln, dann IndexNow nur für die geänderte Startseite
    expect(leer.aufrufe.map((a) => a.url)).toEqual([
      `${B}/sitemap.xml`,
      `${B}/feeds/jobs.json`,
      `${B}/jobs`,
      `${B}/jobs/a`,
      `${B}/jobs/b`,
      `${B}/api/indexnow`,
    ]);
    // Stellen und /jobs fehlen, sind aber nicht als beendet belegt (weiter 200 ohne noindex): gesperrt
    expect(log.join('\n')).toMatch(/Gesperrt: Stellen: 3 von 3 bekannten URLs fehlen auf einmal/);
    expect(leer.aufrufe.filter((a) => a.url === GOOGLE_PUBLISH_URL)).toEqual([]);
    expect(leer.aufrufe.filter((a) => a.url === `${B}/api/indexnow`).map((a) => JSON.parse(a.body ?? '{}').urls)).toEqual([[`${B}/`]]);
    const davor = JSON.parse(vorher);
    const danach = JSON.parse(fs.readFileSync(datei, 'utf8'));
    expect(danach.ziele.google).toEqual(davor.ziele.google);
    for (const url of [`${B}/jobs`, `${B}/jobs/a`, `${B}/jobs/b`]) expect(danach.ziele.indexnow[url]).toBe(davor.ziele.indexnow[url]);
    const kaputt = async () => new Response(null, { status: 500 });
    expect(await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: kaputt, log: () => {} })).toBe(1);
  });

  describe('Fahrplanwechsel (13.12.2026): alle Ortsseiten fallen per Gate I5 aus der Sitemap', () => {
    // Bekannter Stand wie am 14.10.: 76 URLs, davon 8 Stellen, 59 unter /einsatzgebiet (54 Orte, Gebiet, 4 Hubs)
    const ORTE = Array.from({ length: 54 }, (_, i) => `${B}/einsatzgebiet/ort-${String(i).padStart(2, '0')}`);
    const HUBS = [`${B}/einsatzgebiet`, ...['lahn-dill', 'giessen', 'limburg', 'wetterau'].map((k) => `${B}/einsatzgebiet/kreis-${k}`)];
    const STELLEN = Array.from({ length: 8 }, (_, i) => `stelle-${i}`);
    const KERN = [`${B}/`, `${B}/jobs`, `${B}/bewerbung`, `${B}/impressum`];
    const THEMEN = Array.from({ length: 5 }, (_, i) => `${B}/arbeiten-bei-uns/thema-${i}`);
    const vorher: Array<[string, string?]> = [...KERN, ...STELLEN.map((s) => `${B}/jobs/${s}`), ...HUBS, ...ORTE, ...THEMEN].map((u) => [u, '2026-10-14']);
    const nachher = (stellen: string[]): Array<[string, string?]> =>
      [...KERN, ...stellen.map((s) => `${B}/jobs/${s}`), ...HUBS.slice(0, 5), ...THEMEN].map((u) => [u, '2026-10-14']);
    const NOINDEX = '<html><head><meta name="robots" content="noindex, follow"/></head></html>';
    const INDEX = '<html><head><meta name="robots" content="index, follow"/></head></html>';

    it('Ortsseiten mit noindex: echte Änderung, IndexNow meldet sie; eine abgelaufene Stelle geht als URL_DELETED an Google', async () => {
      expect(vorher).toHaveLength(76);
      const datei = path.join(tmp, 'wechsel-noindex', 'stand.json');
      await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: welt({ seiten: vorher, feed: STELLEN.map((s) => job(s)) }).fetchFn, log: () => {} });
      const log: string[] = [];
      // Ausbildung 2026 läuft ab (404), die Ortsseiten sind noindex
      const ohneEine = STELLEN.slice(1);
      const w = welt({ seiten: nachher(ohneEine), feed: ohneEine.map((s) => job(s)), html: (url) => (url.includes('/einsatzgebiet/ort-') ? NOINDEX : null) });
      expect(await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: w.fetchFn, log: (z: string) => log.push(z) })).toBe(0);
      // 22 URLs am 13.12. (Befund), eine Stelle weniger: 21
      expect(log.join('\n')).toContain('Live-Seite: 21 URLs, davon 7 Stellenseiten.');
      expect(log.join('\n')).toContain('Orte: 54 URLs nicht mehr in der Sitemap, davon 54 nicht mehr indexierbar');
      expect(log.join('\n')).not.toMatch(/Abbruch|Gesperrt/);
      expect(w.aufrufe.filter((a) => a.url === GOOGLE_PUBLISH_URL).map((a) => JSON.parse(a.body ?? '{}'))).toEqual([
        { url: `${B}/jobs/${STELLEN[0]}`, type: 'URL_DELETED' },
      ]);
      const indexnow = w.aufrufe.filter((a) => a.url === `${B}/api/indexnow`).flatMap((a) => JSON.parse(a.body ?? '{}').urls);
      expect(indexnow).toHaveLength(55);
      // Am nächsten Tag: nichts mehr zu tun, kein Abbruch
      const tag2 = welt({ seiten: nachher(ohneEine), feed: ohneEine.map((s) => job(s)) });
      expect(await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: tag2.fetchFn, log: () => {} })).toBe(0);
      expect(tag2.aufrufe.map((a) => a.url)).toEqual([`${B}/sitemap.xml`, `${B}/feeds/jobs.json`]);
    });

    it('Ortsseiten fehlen, sind aber weiter indexierbar (kaputte Sitemap): nur die Orte gesperrt, Stellen laufen weiter, Exit 1', async () => {
      const datei = path.join(tmp, 'wechsel-kaputt', 'stand.json');
      await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: welt({ seiten: vorher, feed: STELLEN.map((s) => job(s)) }).fetchFn, log: () => {} });
      const vorherStand = JSON.parse(fs.readFileSync(datei, 'utf8'));
      const log: string[] = [];
      const ohneEine = STELLEN.slice(1);
      const w = welt({ seiten: nachher(ohneEine), feed: ohneEine.map((s) => job(s)), html: (url) => (url.includes('/einsatzgebiet/ort-') ? INDEX : null) });
      expect(await lauf({ umgebung: umgebung(datei), argv: [], fetchFn: w.fetchFn, log: (z: string) => log.push(z) })).toBe(1);
      expect(log.join('\n')).toContain('Gesperrt: Orte: 54 von 59 bekannten URLs fehlen auf einmal und sind weiter indexierbar.');
      expect(log.join('\n')).not.toMatch(/https?:\/\//);
      // Die Stelle geht trotzdem an Google, IndexNow meldet nur sie
      expect(w.aufrufe.filter((a) => a.url === GOOGLE_PUBLISH_URL).map((a) => JSON.parse(a.body ?? '{}'))).toEqual([
        { url: `${B}/jobs/${STELLEN[0]}`, type: 'URL_DELETED' },
      ]);
      expect(w.aufrufe.filter((a) => a.url === `${B}/api/indexnow`).flatMap((a) => JSON.parse(a.body ?? '{}').urls)).toEqual([`${B}/jobs/${STELLEN[0]}`]);
      // Der Stand der Orte bleibt, die Stelle ist aus dem Stand
      const danach = JSON.parse(fs.readFileSync(datei, 'utf8'));
      for (const ort of ORTE) expect(danach.ziele.indexnow[ort]).toBe(vorherStand.ziele.indexnow[ort]);
      expect(danach.ziele.google[`${B}/jobs/${STELLEN[0]}`]).toBeUndefined();
    });
  });

  it('Trockenlauf zählt nur', async () => {
    const datei = path.join(tmp, 'sechs', 'stand.json');
    const log: string[] = [];
    const trocken = welt({ seiten: SEITEN, feed: FEED });
    expect(await lauf({ umgebung: umgebung(datei, { INDEXIERUNG_TROCKEN: 'true' }), argv: [], fetchFn: trocken.fetchFn, log: (z: string) => log.push(z) })).toBe(0);
    expect(trocken.aufrufe.map((a) => a.url)).toEqual([`${B}/sitemap.xml`, `${B}/feeds/jobs.json`]);
    expect(fs.existsSync(datei)).toBe(false);
    expect(log.join('\n')).toContain('IndexNow: 4 neu, 0 geändert, 0 entfernt.');
  });
});

describe('Workflow .github/workflows/indexierung.yml', () => {
  const yml = fs.readFileSync(path.join(process.cwd(), '.github/workflows/indexierung.yml'), 'utf8');

  it('Auslöser: Production-Deploy, täglich 05:17 UTC, von Hand', () => {
    expect(yml).toMatch(/^on:\n {2}deployment_status:\n {2}schedule:\n {4}- cron: "17 5 \* \* \*"\n {2}workflow_dispatch:/m);
    expect(yml).toContain("github.event.deployment_status.state == 'success'");
    expect(yml).toContain("startsWith(github.event.deployment.environment, 'Production')");
  });

  it('minimale Rechte, Geheimnisse nur als Umgebung des Skripts, Stand per actions/cache', () => {
    expect(yml).toMatch(/^permissions:\n {2}contents: read\n {2}deployments: read\n\n/m);
    expect(yml).toContain('environment: indexierung');
    expect(yml).toContain('GOOGLE_INDEXING_SA_KEY: ${{ secrets.GOOGLE_INDEXING_SA_KEY }}');
    expect(yml).toContain('INDEXNOW_SUBMIT_TOKEN: ${{ secrets.INDEXNOW_SUBMIT_TOKEN }}');
    // Kein Geheimnis in einer Befehlszeile (landet sonst im Protokoll des Schritts)
    expect(yml).not.toMatch(/run:.*secrets\./);
    expect(yml).toContain('uses: actions/cache/restore@v6');
    expect(yml).toContain('uses: actions/cache/save@v6');
    expect(yml).toContain('run: node scripts/seo/benachrichtigen.mjs');
    expect(yml).toMatch(/concurrency:\n {2}group: indexierung\n {2}cancel-in-progress: false/);
  });
});
