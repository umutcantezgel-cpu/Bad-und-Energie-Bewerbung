// Meta-, Such- und Wegeprüfung (Ebene 7 · Suche und Wege).
//
// Aufruf: node meta.mjs --base http://localhost:3500 --label P0-SLOP-01 [--alt-urls datei.json] [--only start,stellen]
//
// Je GRUNDMENGE-Seite (d1440 hell, networkidle): Statuscode · <title> (Länge) · meta description (Länge) · canonical · robots-Meta und
//   X-Robots-Tag · og:* · twitter:* · hreflang · JSON-LD (parsebar? @type-Liste) · Anzahl h1 · alle Bilder mit fehlendem oder leerem alt
//   (dekorative mit alt="" gesondert) · alle internen Links (a[href^="/"], a[href^="#"]): Anker auf Zielexistenz, Pfade per GET-Status.
// Dazu /sitemap.xml und /robots.txt (Abgleich Sitemap ↔ Grundmenge, Sperren für User-agent *).
// Optional --alt-urls: JSON-Liste alter Pfade und Anker (z. B. "/#gehalt"): je Pfad Status ohne Weiterleitung (maxRedirects: 0),
//   Ziel bei 30x, bei Ankern Existenz der ID auf der Zielseite.
// Ausgabe: _relaunch/belege/<label>/meta.json und meta.md · Rohdaten: _relaunch/.roh/<label>/meta-roh.json
// Nur GET gegen die Basisadresse; die Anfragesperre aus lib/browser.mjs gilt für alle Browserläufe.
import fs from 'node:fs/promises';
import path from 'node:path';
import { request } from 'playwright';
import { GRUNDMENGE, VIEWPORTS, collectErrors, launch, newContext, scrollThrough } from './lib/browser.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const REPO = path.resolve(ROOT, '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]]] : acc), []));
const base = (args.base ?? 'http://localhost:3500').replace(/\/+$/, '');
const label = args.label ?? 'lauf';
const only = args.only ? args.only.split(',') : null;
const altDatei = args['alt-urls'] && args['alt-urls'] !== 'true' ? path.resolve(process.cwd(), args['alt-urls']) : null;
const outDir = path.join(ROOT, 'belege', label);
const rawDir = path.join(ROOT, '.roh', label);
await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(rawDir, { recursive: true });
const baseHost = new URL(base).host;

// ─────────── HTTP (nur GET, nur Basisadresse) ───────────
const api = await request.newContext({ baseURL: base, extraHTTPHeaders: { 'accept-language': 'de-DE,de;q=0.9' } });
const cache = new Map();
async function holen(pfadOderUrl, { folgen = false, text = false } = {}) {
  const url = new URL(pfadOderUrl, base);
  if (url.host !== baseHost) throw new Error(`fremder Host nicht erlaubt: ${url.host}`);
  const key = `${folgen ? 'F' : 'N'}${text ? 'T' : ''} ${url.pathname}${url.search}`;
  if (cache.has(key)) return cache.get(key);
  const p = (async () => {
    try {
      const res = await api.get(url.pathname + url.search, { maxRedirects: folgen ? 10 : 0, failOnStatusCode: false, timeout: 30_000 });
      const h = res.headers();
      let body = null;
      if (text || (res.status() < 300 && /text|json|xml/.test(h['content-type'] ?? ''))) body = await res.text();
      return { status: res.status(), ort: h.location ?? null, inhaltstyp: h['content-type'] ?? null, bytes: body != null ? Buffer.byteLength(body) : Number(h['content-length'] ?? 0) || null, robotsHeader: h['x-robots-tag'] ?? null, text: body, url: res.url() };
    } catch (e) { return { status: 0, fehler: String(e?.message ?? e), ort: null, text: null }; }
  })();
  cache.set(key, p);
  return p;
}
const pfadSicher = (href) => { try { const u = new URL(href, base); return u.host === baseHost ? u : null; } catch { return null; } };

// ─────────── Seitenanalyse im Browser ───────────
function analysiere() {
  const pfad = (el) => {
    const teile = [];
    let n = el;
    while (n && n.nodeType === 1 && teile.length < 4 && n !== document.body) {
      let t = n.tagName.toLowerCase();
      if (n.id && !/^[:_]/.test(n.id)) { teile.unshift(`${t}#${n.id}`); break; }
      const cls = typeof n.className === 'string' ? n.className : '';
      const erste = cls.split(/\s+/).filter((c) => c && !/[:[\]/%()]/.test(c)).slice(0, 2).join('.');
      if (erste) t += `.${erste}`;
      const sib = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n.tagName) : [];
      if (sib.length > 1) t += `:nth-of-type(${sib.indexOf(n) + 1})`;
      teile.unshift(t);
      n = n.parentElement;
    }
    return teile.join(' > ');
  };
  const meta = (sel) => [...document.querySelectorAll(sel)].map((m) => ({ key: m.getAttribute('property') || m.getAttribute('name'), content: m.getAttribute('content') }));
  const alsMap = (liste, praefix) => { const m = {}; for (const { key, content } of liste) if (key?.startsWith(praefix)) (m[key] ??= []).push(content); return m; };
  const titel = document.title;
  const beschr = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null;
  const canon = [...document.querySelectorAll('link[rel="canonical"]')].map((l) => l.getAttribute('href'));
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null;
  const googlebot = document.querySelector('meta[name="googlebot"]')?.getAttribute('content') ?? null;
  const hreflang = [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => ({ hreflang: l.getAttribute('hreflang'), href: l.getAttribute('href') }));
  const alternates = [...document.querySelectorAll('link[rel="alternate"]:not([hreflang])')].map((l) => ({ type: l.getAttribute('type'), href: l.getAttribute('href'), title: l.getAttribute('title') }));
  const sprache = document.documentElement.getAttribute('lang');
  // JSON-LD
  const typenRekursiv = (o, set) => { if (Array.isArray(o)) o.forEach((x) => typenRekursiv(x, set)); else if (o && typeof o === 'object') { if (o['@type']) [].concat(o['@type']).forEach((t) => set.add(t)); Object.values(o).forEach((v) => typenRekursiv(v, set)); } };
  const jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s, i) => {
    const roh = s.textContent || '';
    try {
      const o = JSON.parse(roh);
      const knoten = Array.isArray(o) ? o : o['@graph'] ? o['@graph'] : [o];
      const oben = knoten.flatMap((k) => [].concat(k?.['@type'] ?? []));
      const alle = new Set(); typenRekursiv(o, alle);
      return { nr: i + 1, gueltig: true, context: o['@context'] ?? null, typen: oben, typenVerschachtelt: [...alle], bytes: roh.length };
    } catch (e) { return { nr: i + 1, gueltig: false, fehler: String(e.message).slice(0, 120), bytes: roh.length, anfang: roh.trim().slice(0, 80) }; }
  });
  // Überschriften
  const h1 = [...document.querySelectorAll('h1')].map((h) => ({ text: (h.textContent || '').trim().slice(0, 80), sichtbar: h.checkVisibility?.({ checkVisibilityCSS: true }) ?? true }));
  const ueberschriften = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1]));
  let sprung = 0; for (let i = 1; i < ueberschriften.length; i++) if (ueberschriften[i] - ueberschriften[i - 1] > 1) sprung += 1;
  // Bilder
  const bilder = [...document.querySelectorAll('img')].map((img) => {
    const hat = img.hasAttribute('alt');
    const alt = img.getAttribute('alt');
    return { fundstelle: pfad(img), src: (img.currentSrc || img.getAttribute('src') || '').slice(0, 140), alt: hat ? alt : null, art: !hat ? 'fehlt' : alt.trim() === '' ? (alt === '' ? 'dekorativ' : 'leer(Leerraum)') : 'mit-alt', ariaHidden: img.getAttribute('aria-hidden') === 'true' || img.getAttribute('role') === 'presentation' || img.getAttribute('role') === 'none', breite: img.getAttribute('width'), hoehe: img.getAttribute('height'), loading: img.getAttribute('loading') };
  });
  const svgImg = [...document.querySelectorAll('svg[role="img"]')].map((s) => ({ fundstelle: pfad(s), name: s.getAttribute('aria-label') || s.querySelector('title')?.textContent || null }));
  // Links
  const ids = new Set([...document.querySelectorAll('[id]')].map((e) => e.id));
  const namen = new Set([...document.querySelectorAll('a[name]')].map((e) => e.getAttribute('name')));
  const links = [];
  for (const a of document.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    const text = (a.getAttribute('aria-label') || a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50);
    let art = 'extern';
    if (href.startsWith('#')) art = 'anker';
    else if (href.startsWith('/') && !href.startsWith('//')) art = 'intern';
    else if (/^(?:mailto|tel|sms|whatsapp):/i.test(href)) art = href.split(':')[0].toLowerCase();
    else if (/^https?:\/\//i.test(href)) art = 'absolut';
    const l = { art, href, text, fundstelle: pfad(a), neuerTab: a.getAttribute('target') === '_blank', rel: a.getAttribute('rel') };
    if (art === 'anker') { const id = decodeURIComponent(href.slice(1)); l.id = id; l.ankerVorhanden = id === '' || id === 'top' || ids.has(id) || namen.has(id); }
    links.push(l);
  }
  return {
    titel, beschr, canon, robots, googlebot, hreflang, alternates, sprache, jsonld, h1, ueberschriftenSprung: sprung, ueberschriftenGesamt: ueberschriften.length,
    og: alsMap(meta('meta[property^="og:"], meta[name^="og:"]'), 'og:'), twitter: alsMap(meta('meta[name^="twitter:"], meta[property^="twitter:"]'), 'twitter:'),
    bilder, svgImg, links, ids: [...ids],
    sonstigeMeta: meta('meta[name],meta[property]').map((m) => m.key).filter((k) => k && !/^(og:|twitter:|description$|robots$|googlebot$|viewport$)/.test(k)),
  };
}

const browser = await launch();
const vp = VIEWPORTS.find((v) => v.name === 'd1440');
const seiten = [];
for (const p of GRUNDMENGE) {
  if (only && !only.includes(p.slug)) continue;
  const { context, requestLog } = await newContext(browser, { origin: base, viewport: vp, colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const fehler = collectErrors(page);
  const eintrag = { pfad: p.path, slug: p.slug };
  try {
    const res = await page.goto(base + p.path, { waitUntil: 'networkidle', timeout: 45_000 });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    await scrollThrough(page);
    await page.waitForTimeout(300);
    const h = res?.headers() ?? {};
    eintrag.status = res?.status() ?? 0;
    eintrag.endUrl = page.url().replace(base, '') || '/';
    eintrag.weitergeleitet = !!res?.request().redirectedFrom();
    eintrag.urlGeaendertNachLaden = !eintrag.weitergeleitet && eintrag.endUrl !== p.path;
    eintrag.robotsHeader = h['x-robots-tag'] ?? null;
    eintrag.inhaltstyp = h['content-type'] ?? null;
    const a = await page.evaluate(analysiere);
    eintrag.sprache = a.sprache;
    eintrag.titel = { text: a.titel, laenge: [...a.titel].length };
    eintrag.beschreibung = { text: a.beschr, laenge: a.beschr == null ? null : [...a.beschr].length };
    const canonical = a.canon[0] ?? null;
    let canonPfad = null;
    try { const u = new URL(canonical, base); canonPfad = (u.pathname.replace(/\/+$/, '') || '/') + u.search; } catch { /* kein canonical */ }
    const istPfad = (p.path.replace(/\/+$/, '') || '/');
    eintrag.canonical = { anzahl: a.canon.length, href: canonical, absolut: canonical ? /^https?:\/\//.test(canonical) : null, host: canonical && /^https?:\/\//.test(canonical) ? new URL(canonical).host : null, pfad: canonPfad, pfadGleichSeite: canonPfad != null ? canonPfad === istPfad : null };
    eintrag.robots = { meta: a.robots, googlebot: a.googlebot, header: eintrag.robotsHeader, noindex: /noindex/i.test(`${a.robots ?? ''} ${a.googlebot ?? ''} ${eintrag.robotsHeader ?? ''}`) };
    const erwartetOg = ['og:title', 'og:description', 'og:url', 'og:image', 'og:type', 'og:site_name', 'og:locale'];
    const erwartetTw = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
    eintrag.og = { werte: a.og, anzahlKeys: Object.keys(a.og).length, fehlend: erwartetOg.filter((k) => !a.og[k]) };
    eintrag.twitter = { werte: a.twitter, anzahlKeys: Object.keys(a.twitter).length, fehlend: erwartetTw.filter((k) => !a.twitter[k]) };
    eintrag.hreflang = a.hreflang;
    eintrag.alternates = a.alternates;
    eintrag.jsonld = { anzahl: a.jsonld.length, ungueltig: a.jsonld.filter((j) => !j.gueltig).length, typen: [...new Set(a.jsonld.flatMap((j) => j.typen ?? []))], bloecke: a.jsonld };
    eintrag.ueberschriften = { h1Anzahl: a.h1.length, h1: a.h1, gesamt: a.ueberschriftenGesamt, ebenenspruenge: a.ueberschriftenSprung };
    eintrag.bilder = { gesamt: a.bilder.length, mitAlt: a.bilder.filter((b) => b.art === 'mit-alt').length, dekorativ: a.bilder.filter((b) => b.art === 'dekorativ').length, altFehlt: a.bilder.filter((b) => b.art === 'fehlt').length, altLeerMitLeerraum: a.bilder.filter((b) => b.art === 'leer(Leerraum)').length, fehlend: a.bilder.filter((b) => b.art === 'fehlt' || b.art === 'leer(Leerraum)'), dekorativListe: a.bilder.filter((b) => b.art === 'dekorativ'), liste: a.bilder, svgMitRoleImg: a.svgImg };
    eintrag.ids = a.ids;
    eintrag.sonstigeMeta = a.sonstigeMeta;
    eintrag.links = a.links;
    eintrag.fehler = fehler;
    eintrag.gesperrt = requestLog.length;
  } catch (err) {
    eintrag.status = eintrag.status ?? 0;
    eintrag.fehlerLauf = String(err?.stack ?? err);
  }
  seiten.push(eintrag);
  process.stdout.write(`${eintrag.status} ${p.slug}: title ${eintrag.titel?.laenge ?? '?'} · desc ${eintrag.beschreibung?.laenge ?? '–'} · h1 ${eintrag.ueberschriften?.h1Anzahl ?? '?'} · JSON-LD ${eintrag.jsonld?.anzahl ?? '?'} · Bilder ohne alt ${eintrag.bilder?.altFehlt ?? '?'} · Links ${eintrag.links?.length ?? '?'}\n`);
  await context.close();
}
await browser.close();

// ─────────── Linkprüfung ───────────
const ziele = new Map(); // pfad+query → { status, ort, ... }
const seitenIds = new Map(seiten.filter((s) => s.ids).map((s) => [(new URL(s.pfad, base).pathname.replace(/\/+$/, '') || '/'), new Set(s.ids)]));
const linkBefunde = [];
const zuPruefen = new Map();
for (const s of seiten) for (const l of s.links ?? []) {
  if (l.art === 'intern') { const u = pfadSicher(l.href); if (u) zuPruefen.set(u.pathname + u.search, null); }
}
const schlangen = [...zuPruefen.keys()];
async function arbeite() { while (schlangen.length) { const k = schlangen.shift(); zuPruefen.set(k, await holen(k)); } }
await Promise.all(Array.from({ length: 6 }, arbeite));
for (const [k, v] of zuPruefen) ziele.set(k, { status: v.status, ort: v.ort, inhaltstyp: v.inhaltstyp, fehler: v.fehler ?? null });
// Anker auf anderen Seiten (/pfad#id)
async function idsVon(pfadName) {
  const key = pfadName.replace(/\/+$/, '') || '/';
  if (seitenIds.has(key)) return seitenIds.get(key);
  const r = await holen(pfadName, { folgen: true, text: true });
  const set = new Set();
  if (r.text) for (const m of r.text.matchAll(/\sid=["']([^"']+)["']/g)) set.add(m[1]);
  seitenIds.set(key, set);
  return set;
}
for (const s of seiten) {
  for (const l of s.links ?? []) {
    if (l.art === 'anker') linkBefunde.push({ seite: s.pfad, art: 'anker', href: l.href, text: l.text, fundstelle: l.fundstelle, ok: l.ankerVorhanden, grund: l.ankerVorhanden ? null : `Ziel-ID „${l.id}“ fehlt auf der Seite` });
    else if (l.art === 'intern') {
      const u = pfadSicher(l.href);
      if (!u) continue;
      const z = ziele.get(u.pathname + u.search);
      const b = { seite: s.pfad, art: 'intern', href: l.href, text: l.text, fundstelle: l.fundstelle, status: z?.status ?? 0, ort: z?.ort ?? null, ok: z ? z.status >= 200 && z.status < 300 : false, weiterleitung: z ? z.status >= 300 && z.status < 400 : false, grund: z && !(z.status >= 200 && z.status < 300) ? `Status ${z.status}${z.ort ? ` → ${z.ort}` : ''}` : null };
      if (u.hash && b.ok) { const set = await idsVon(u.pathname + u.search); const id = decodeURIComponent(u.hash.slice(1)); b.ankerVorhanden = set.has(id); if (!b.ankerVorhanden) { b.ok = false; b.grund = `Ziel-ID „${id}“ fehlt auf ${u.pathname}`; } }
      linkBefunde.push(b);
    }
  }
}

// ─────────── Sitemap und robots.txt ───────────
const sm = await holen('/sitemap.xml', { text: true });
const smLocs = sm.text ? [...sm.text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]) : [];
const normPfad = (u) => { try { const x = new URL(u); return (x.pathname.replace(/\/+$/, '') || '/') + x.search; } catch { return u; } };
const smPfade = smLocs.map(normPfad);
const smHosts = [...new Set(smLocs.map((u) => { try { return new URL(u).host; } catch { return '?'; } }))];
const smStatus = [];
for (const u of smLocs) {
  const pf = normPfad(u);
  const r = await holen(pf);
  const s = seiten.find((x) => (x.pfad.replace(/\/+$/, '') || '/') === pf.replace(/\?.*$/, ''));
  smStatus.push({ loc: u, pfad: pf, status: r.status, inGrundmenge: !!GRUNDMENGE.find((g) => (g.path.replace(/\/+$/, '') || '/') === pf), noindexAufSeite: s?.robots?.noindex ?? null, canonicalPfadGleich: s?.canonical?.pfadGleichSeite ?? null });
}
const rb = await holen('/robots.txt', { text: true });
const rbGruppen = [];
if (rb.text) {
  let aktuell = null; let vorherRegel = false;
  for (const roh of rb.text.split(/\r?\n/)) {
    const z = roh.replace(/#.*/, '').trim();
    if (!z) continue;
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(z);
    if (!m) continue;
    const k = m[1].toLowerCase(); const v = m[2].trim();
    if (k === 'user-agent') { if (!aktuell || vorherRegel) { aktuell = { agenten: [], allow: [], disallow: [] }; rbGruppen.push(aktuell); } aktuell.agenten.push(v); vorherRegel = false; }
    else if (k === 'allow' && aktuell) { aktuell.allow.push(v); vorherRegel = true; }
    else if (k === 'disallow' && aktuell) { aktuell.disallow.push(v); vorherRegel = true; }
  }
}
const sitemapZeilen = rb.text ? [...rb.text.matchAll(/^\s*sitemap\s*:\s*(\S+)/gim)].map((m) => m[1]) : [];
const sternGruppe = rbGruppen.find((g) => g.agenten.includes('*'));
const blockiert = (pfadName, gruppe) => { if (!gruppe) return false; const dis = gruppe.disallow.filter(Boolean).filter((d) => pfadName.startsWith(d)).sort((a, b) => b.length - a.length)[0]; if (!dis) return false; const al = gruppe.allow.filter(Boolean).filter((d) => pfadName.startsWith(d)).sort((a, b) => b.length - a.length)[0]; return !al || al.length < dis.length; };
const abgleich = GRUNDMENGE.filter((g) => !only || only.includes(g.slug)).map((g) => {
  const pf = g.path.replace(/\/+$/, '') || '/';
  const s = seiten.find((x) => x.slug === g.slug);
  return { pfad: g.path, inSitemap: smPfade.includes(pf), noindex: s?.robots?.noindex ?? null, status: s?.status ?? null, blockiertFuerStern: blockiert(g.path, sternGruppe), widerspruch: (smPfade.includes(pf) && s?.robots?.noindex) ? 'in Sitemap, aber noindex' : (smPfade.includes(pf) && s && s.status >= 400) ? 'in Sitemap, aber Status ≥ 400' : (!smPfade.includes(pf) && s && s.status === 200 && s.robots && !s.robots.noindex ? 'indexierbar, aber nicht in Sitemap' : null) };
});
const sitemapBericht = { status: sm.status, inhaltstyp: sm.inhaltstyp, eintraege: smLocs.length, hosts: smHosts, ohneGrundmenge: smStatus.filter((x) => !x.inGrundmenge).map((x) => x.pfad), grundmengeOhneSitemap: abgleich.filter((x) => !x.inSitemap).map((x) => x.pfad), urls: smStatus };
const robotsBericht = { status: rb.status, inhaltstyp: rb.inhaltstyp, bytes: rb.bytes, gruppen: rbGruppen.length, sitemapZeilen, sitemapZeilenMitBasis: sitemapZeilen.map((u) => normPfad(u)), sternGruppe: sternGruppe ?? null, gruppenAuszug: rbGruppen.map((g) => ({ agenten: g.agenten, allow: g.allow, disallow: g.disallow })), blockiertGrundmenge: abgleich.filter((x) => x.blockiertFuerStern).map((x) => x.pfad) };

// ─────────── alte Pfade und Anker ───────────
let altBericht = null;
if (altDatei) {
  const liste = JSON.parse(await fs.readFile(altDatei, 'utf8'));
  const eintraege = Array.isArray(liste) ? liste : liste.pfade ?? [];
  const browser2 = await launch();
  const seitenDom = new Map();
  async function domIds(urlPfad) {
    const u = new URL(urlPfad, base);
    const key = u.pathname + u.search;
    if (seitenDom.has(key)) return seitenDom.get(key);
    const { context } = await newContext(browser2, { origin: base, viewport: vp });
    const page = await context.newPage();
    let ids = null; let status = 0;
    try { const r = await page.goto(base + key, { waitUntil: 'networkidle', timeout: 45_000 }); status = r?.status() ?? 0; ids = await page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id)); } catch { /* ignorieren */ }
    await context.close();
    const v = { status, ids: new Set(ids ?? []), endUrl: null };
    seitenDom.set(key, v);
    return v;
  }
  altBericht = [];
  for (const roh of eintraege) {
    const eintrag = typeof roh === 'string' ? roh : roh.pfad ?? roh.path ?? roh.url;
    const [pfadTeil, ...rest] = eintrag.split('#');
    const anker = rest.length ? rest.join('#') : null;
    const ziel = pfadTeil === '' ? '/' : pfadTeil;
    const r = await holen(ziel);
    const kette = [{ url: ziel, status: r.status, ort: r.ort }];
    let endpfad = ziel; let letzter = r;
    for (let i = 0; i < 5 && letzter.status >= 300 && letzter.status < 400 && letzter.ort; i++) {
      const naechster = pfadSicher(letzter.ort);
      if (!naechster) { break; }
      endpfad = naechster.pathname + naechster.search;
      letzter = await holen(endpfad);
      kette.push({ url: endpfad, status: letzter.status, ort: letzter.ort });
    }
    const b = { eintrag, pfad: ziel, anker, status: r.status, ort: r.ort, inhaltstyp: r.inhaltstyp, bytes: r.bytes, kette, endstatus: letzter.status, endpfad, weiterleitung: r.status >= 300 && r.status < 400 };
    if (anker != null) {
      const istSeite = /text\/html/.test(letzter.inhaltstyp ?? '') || letzter.status === 200;
      if (istSeite && letzter.status === 200) { const d = await domIds(endpfad); b.ankerVorhanden = anker === '' || anker === 'top' || d.ids.has(decodeURIComponent(anker)); b.ankerPruefungAuf = endpfad; } else { b.ankerVorhanden = false; b.ankerPruefungAuf = endpfad; b.ankerGrund = `Zielseite Status ${letzter.status}`; }
    }
    b.ergebnis = anker != null ? (b.ankerVorhanden ? (b.weiterleitung ? 'Weiterleitung, Anker vorhanden' : 'ok') : 'Anker fehlt') : r.status >= 200 && r.status < 300 ? 'ok' : r.status >= 300 && r.status < 400 ? (letzter.status === 200 ? `Weiterleitung ${r.status} → ${endpfad}` : `Weiterleitung ${r.status}, Endstatus ${letzter.status}`) : `Status ${r.status}`;
    altBericht.push(b);
  }
  await browser2.close();
}
await api.dispose();

// ─────────── Zusammenfassung ───────────
const ok = seiten.filter((s) => s.titel);
const zaehle = (liste, f) => liste.filter(f).length;
const zusammenfassung = {
  seiten: seiten.length,
  status: Object.fromEntries(Object.entries(seiten.reduce((m, s) => ({ ...m, [s.status]: (m[s.status] || 0) + 1 }), {}))),
  ohneTitle: zaehle(ok, (s) => !s.titel.text),
  ohneDescription: zaehle(ok, (s) => !s.beschreibung.text),
  titelLaengen: Object.fromEntries(ok.map((s) => [s.pfad, s.titel.laenge])),
  beschreibungLaengen: Object.fromEntries(ok.map((s) => [s.pfad, s.beschreibung.laenge])),
  ohneCanonical: zaehle(ok, (s) => s.canonical.anzahl === 0),
  canonicalPfadAbweichend: zaehle(ok, (s) => s.canonical.pfadGleichSeite === false),
  canonicalHosts: [...new Set(ok.map((s) => s.canonical.host).filter(Boolean))],
  noindexSeiten: ok.filter((s) => s.robots.noindex).map((s) => s.pfad),
  ogUnvollstaendig: zaehle(ok, (s) => s.og.fehlend.length > 0),
  twitterUnvollstaendig: zaehle(ok, (s) => s.twitter.fehlend.length > 0),
  mitHreflang: zaehle(ok, (s) => s.hreflang.length > 0),
  jsonldBloecke: ok.reduce((n, s) => n + s.jsonld.anzahl, 0),
  jsonldUngueltig: ok.reduce((n, s) => n + s.jsonld.ungueltig, 0),
  jsonldTypen: [...new Set(ok.flatMap((s) => s.jsonld.typen))],
  seitenOhneJsonld: ok.filter((s) => s.jsonld.anzahl === 0).map((s) => s.pfad),
  h1Nicht1: ok.filter((s) => s.ueberschriften.h1Anzahl !== 1).map((s) => `${s.pfad} (${s.ueberschriften.h1Anzahl})`),
  bilderGesamt: ok.reduce((n, s) => n + s.bilder.gesamt, 0),
  bilderAltFehlt: ok.reduce((n, s) => n + s.bilder.altFehlt, 0),
  bilderAltLeerMitLeerraum: ok.reduce((n, s) => n + s.bilder.altLeerMitLeerraum, 0),
  bilderDekorativ: ok.reduce((n, s) => n + s.bilder.dekorativ, 0),
  linksGeprueft: linkBefunde.length,
  linksAnker: linkBefunde.filter((l) => l.art === 'anker').length,
  linksIntern: linkBefunde.filter((l) => l.art === 'intern').length,
  linksNichtOk: linkBefunde.filter((l) => !l.ok).length,
  linksWeiterleitung: linkBefunde.filter((l) => l.weiterleitung).length,
  einzigartigeLinkziele: ziele.size,
  sitemapEintraege: sitemapBericht.eintraege,
  sitemapStatus: sitemapBericht.status,
  grundmengeOhneSitemap: sitemapBericht.grundmengeOhneSitemap.length,
  sitemapOhneGrundmenge: sitemapBericht.ohneGrundmenge.length,
  robotsStatus: robotsBericht.status,
  robotsBlockiertGrundmenge: robotsBericht.blockiertGrundmenge.length,
  altUrls: altBericht ? { gesamt: altBericht.length, ok: altBericht.filter((a) => a.ergebnis === 'ok').length, weiterleitung: altBericht.filter((a) => a.weiterleitung).length, ankerFehlen: altBericht.filter((a) => a.ankerVorhanden === false).length, nichtErreichbar: altBericht.filter((a) => a.endstatus >= 400 || a.endstatus === 0).length } : null,
};
const bericht = { label, base, erstellt: new Date().toISOString(), bedingungen: { ansicht: 'd1440 hell', warten: 'networkidle + scrollThrough (scroll-behavior: auto) + 300 ms', http: 'GET über Playwright APIRequestContext, maxRedirects 0 (Linkziele, alte Pfade), nur Basisadresse', altUrls: altDatei ? path.relative(REPO, altDatei) : null }, zusammenfassung, sitemap: sitemapBericht, robots: robotsBericht, abgleichSitemapGrundmenge: abgleich, linkBefunde, altUrls: altBericht, seiten };
await fs.writeFile(path.join(rawDir, 'meta-roh.json'), JSON.stringify(bericht));
// Beleg-JSON: Links der Seiten sind in linkBefunde enthalten; Rohlisten (Links, Bilderliste, IDs) bleiben nur in .roh
const beleg = JSON.parse(JSON.stringify(bericht));
for (const s of beleg.seiten) { if (s.links) s.links = { gesamt: s.links.length, nachArt: s.links.reduce((m, l) => ({ ...m, [l.art]: (m[l.art] || 0) + 1 }), {}), extern: s.links.filter((l) => l.art === 'absolut').map((l) => l.href) }; if (s.ids) { s.idsAnzahl = s.ids.length; delete s.ids; } if (s.bilder?.liste) delete s.bilder.liste; }
await fs.writeFile(path.join(outDir, 'meta.json'), JSON.stringify(beleg, null, 2));

// ─────────── Markdown ───────────
const L = [];
const tab = (kopf, zeilen) => [`| ${kopf.join(' | ')} |`, `| ${kopf.map(() => '---').join(' | ')} |`, ...zeilen.map((r) => `| ${r.map((x) => String(x ?? '–').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`)];
const z = zusammenfassung;
L.push(`# Meta-, Such- und Wegeprüfung · ${label}`, '', `Erstellt ${bericht.erstellt} · Basis ${base}`, `Messbedingungen: ${bericht.bedingungen.ansicht} · ${bericht.bedingungen.warten} · ${bericht.bedingungen.http}`, '');
L.push('## Zählung', '');
L.push(...tab(['Messgröße', 'Wert'], [
  ['Seiten (Grundmenge)', z.seiten], ['Statuscodes', Object.entries(z.status).map(([k, v]) => `${k}: ${v}`).join(' · ')],
  ['ohne title / ohne description', `${z.ohneTitle} / ${z.ohneDescription}`],
  ['ohne canonical · Pfad weicht von Seite ab · Hosts', `${z.ohneCanonical} · ${z.canonicalPfadAbweichend} · ${z.canonicalHosts.join(', ') || '–'}`],
  ['noindex-Seiten', z.noindexSeiten.join(', ') || '–'],
  ['og unvollständig · twitter unvollständig', `${z.ogUnvollstaendig} · ${z.twitterUnvollstaendig}`],
  ['Seiten mit hreflang', z.mitHreflang],
  ['JSON-LD-Blöcke · ungültig · Typen', `${z.jsonldBloecke} · ${z.jsonldUngueltig} · ${z.jsonldTypen.join(', ') || '–'}`],
  ['Seiten ohne JSON-LD', z.seitenOhneJsonld.join(', ') || '–'],
  ['Seiten mit h1-Anzahl ≠ 1', z.h1Nicht1.join(', ') || '–'],
  ['Bilder gesamt · alt fehlt · alt nur Leerraum · dekorativ (alt="")', `${z.bilderGesamt} · ${z.bilderAltFehlt} · ${z.bilderAltLeerMitLeerraum} · ${z.bilderDekorativ}`],
  ['interne Links geprüft (Anker · Pfade) · nicht in Ordnung · Weiterleitungen', `${z.linksGeprueft} (${z.linksAnker} · ${z.linksIntern}) · ${z.linksNichtOk} · ${z.linksWeiterleitung}`],
  ['einzigartige Linkziele (GET)', z.einzigartigeLinkziele],
  ['Sitemap: Status · Einträge · Grundmenge ohne Sitemap · Sitemap ohne Grundmenge', `${z.sitemapStatus} · ${z.sitemapEintraege} · ${z.grundmengeOhneSitemap} · ${z.sitemapOhneGrundmenge}`],
  ['robots.txt: Status · für * gesperrte Grundmengen-Seiten', `${z.robotsStatus} · ${z.robotsBlockiertGrundmenge}`],
  ...(z.altUrls ? [['alte Pfade/Anker: gesamt · ok · Weiterleitung · Anker fehlt · nicht erreichbar', `${z.altUrls.gesamt} · ${z.altUrls.ok} · ${z.altUrls.weiterleitung} · ${z.altUrls.ankerFehlen} · ${z.altUrls.nichtErreichbar}`]] : []),
]));
L.push('', '## Seiten', '');
L.push(...tab(['Seite', 'Status', 'title (Zeichen)', 'description (Zeichen)', 'canonical', 'robots', 'og fehlend', 'twitter fehlend', 'hreflang', 'JSON-LD (@type)', 'h1', 'Bilder (ohne alt / dekorativ)', 'Links'], seiten.map((s) => s.titel ? [s.pfad + (s.weitergeleitet ? ` → (HTTP) ${s.endUrl}` : s.urlGeaendertNachLaden ? ` → (Skript, nach dem Laden) ${s.endUrl}` : ''), s.status, s.titel.laenge, s.beschreibung.laenge ?? 'fehlt', s.canonical.href ? `${s.canonical.href.replace(/^https?:\/\//, '')}${s.canonical.pfadGleichSeite === false ? ' (Pfad weicht ab)' : ''}` : 'fehlt', s.robots.meta ?? '–', s.og.fehlend.join(', ') || '–', s.twitter.fehlend.join(', ') || '–', s.hreflang.length || '–', s.jsonld.anzahl ? `${s.jsonld.anzahl}: ${s.jsonld.typen.join(', ')}${s.jsonld.ungueltig ? ` (${s.jsonld.ungueltig} ungültig)` : ''}` : 'keins', s.ueberschriften.h1Anzahl, `${s.bilder.altFehlt + s.bilder.altLeerMitLeerraum} / ${s.bilder.dekorativ} von ${s.bilder.gesamt}`, s.links.length] : [s.pfad, s.status, 'FEHLER', ...Array(10).fill('–')])));
L.push('', '### title und description im Wortlaut', '');
L.push(...tab(['Seite', 'title', 'description'], seiten.filter((s) => s.titel).map((s) => [s.pfad, s.titel.text, s.beschreibung.text ?? 'fehlt'])));
const bilderMit = seiten.filter((s) => s.bilder && (s.bilder.fehlend.length));
L.push('', `### Bilder mit fehlendem oder leerem alt (${bilderMit.reduce((n, s) => n + s.bilder.fehlend.length, 0)})`, '');
if (!bilderMit.length) L.push('Keine.'); else L.push(...tab(['Seite', 'Fundstelle', 'src', 'alt'], bilderMit.flatMap((s) => s.bilder.fehlend.map((b) => [s.pfad, `\`${b.fundstelle.slice(-70)}\``, b.src.slice(0, 80), b.alt === null ? 'fehlt' : 'nur Leerraum']))));
const dek = seiten.filter((s) => s.bilder?.dekorativListe?.length);
L.push('', `### Dekorative Bilder (alt="")  (${dek.reduce((n, s) => n + s.bilder.dekorativListe.length, 0)})`, '');
if (!dek.length) L.push('Keine.'); else L.push(...tab(['Seite', 'Fundstelle', 'src'], dek.flatMap((s) => s.bilder.dekorativListe.slice(0, 10).map((b) => [s.pfad, `\`${b.fundstelle.slice(-70)}\``, b.src.slice(0, 80)]))));
const og = seiten.filter((s) => s.og && (s.og.fehlend.length || s.twitter.fehlend.length));
L.push('', '### og- und twitter-Werte (erste Seite je Art, Wortlaut)', '');
const s0 = seiten.find((s) => s.og);
if (s0) L.push(...tab(['Schlüssel', 'Wert (' + s0.pfad + ')'], [...Object.entries(s0.og.werte), ...Object.entries(s0.twitter.werte)].map(([k, v]) => [k, v.join(' | ').slice(0, 140)])));
void og;
const lb = linkBefunde.filter((l) => !l.ok);
L.push('', `### Links, die nicht in Ordnung sind (${lb.length})`, '');
if (!lb.length) L.push('Keine.'); else L.push(...tab(['Seite', 'Art', 'href', 'Text', 'Befund', 'Fundstelle'], lb.slice(0, 80).map((l) => [l.seite, l.art, `\`${l.href}\``, l.text, l.grund, `\`${l.fundstelle.slice(-60)}\``])));
const wl = linkBefunde.filter((l) => l.weiterleitung);
if (wl.length) { L.push('', `### Weiterleitende interne Links (${wl.length})`, ''); L.push(...tab(['Seite', 'href', 'Status', 'Ziel'], wl.slice(0, 40).map((l) => [l.seite, `\`${l.href}\``, l.status, l.ort]))); }
L.push('', '### Linkziele (einzigartig, GET ohne Weiterleitung)', '');
L.push(...tab(['Ziel', 'Status', 'Inhaltstyp', 'Weiterleitung nach'], [...ziele.entries()].sort().map(([k, v]) => [`\`${k}\``, v.status, v.inhaltstyp ?? '–', v.ort ?? '–'])));
L.push('', '## Sitemap und robots.txt', '');
L.push(`Sitemap: Status ${sitemapBericht.status} · ${sitemapBericht.inhaltstyp} · ${sitemapBericht.eintraege} Einträge · Host(s) in den URLs: ${sitemapBericht.hosts.join(', ')} (Pfade werden gegen ${baseHost} geprüft)`, '');
L.push(...tab(['Sitemap-URL', 'Status lokal', 'in Grundmenge', 'noindex auf Seite', 'canonical-Pfad gleich'], smStatus.map((x) => [x.loc, x.status, x.inGrundmenge ? 'ja' : 'nein', x.noindexAufSeite ?? '–', x.canonicalPfadGleich ?? '–'])));
L.push('', 'Abgleich Grundmenge ↔ Sitemap:', '');
L.push(...tab(['Seite', 'in Sitemap', 'noindex', 'Status', 'für * gesperrt', 'Auffälligkeit'], abgleich.map((a) => [a.pfad, a.inSitemap ? 'ja' : 'nein', a.noindex ?? '–', a.status ?? '–', a.blockiertFuerStern ? 'ja' : 'nein', a.widerspruch ?? '–'])));
L.push('', `robots.txt: Status ${robotsBericht.status} · ${robotsBericht.gruppen} Gruppen · Sitemap-Zeilen: ${robotsBericht.sitemapZeilen.join(', ') || 'keine'}`, '');
L.push(...tab(['User-agent', 'Allow', 'Disallow'], robotsBericht.gruppenAuszug.map((g) => [g.agenten.join(', '), g.allow.join(' ') || '–', g.disallow.join(' ') || '–'])));
if (altBericht) {
  L.push('', `## Alte Pfade und Anker (${altBericht.length}) aus ${bericht.bedingungen.altUrls}`, '');
  L.push(...tab(['Eintrag', 'Status (ohne Weiterleitung)', 'Ziel bei 30x', 'Endstatus', 'Anker vorhanden', 'Ergebnis'], altBericht.map((a) => [`\`${a.eintrag}\``, a.status, a.ort ?? '–', a.endstatus, a.anker == null ? '–' : a.ankerVorhanden ? `ja (${a.ankerPruefungAuf})` : 'NEIN', a.ergebnis])));
}
L.push('', '## Hinweise zur Methode', '',
  '- Kopfdaten und Links stammen aus dem DOM nach networkidle (nicht aus dem Rohquelltext); die Plattform liefert sie serverseitig, so dass beides übereinstimmen sollte, ohne dass dieses Skript es einzeln prüft.',
  '- Linkziele: je einzigartigem Pfad inklusive Query ein GET ohne Weiterleitung; 2xx = in Ordnung, 3xx = Weiterleitung (mit Ziel ausgewiesen), sonst Befund. Ziele mit #Anker werden zusätzlich auf Existenz der ID im DOM bzw. im Quelltext der Zielseite geprüft.',
  '- canonical, og:url und Sitemap-URLs nennen die Produktionsadresse; es wird der Pfad mit der lokalen Seite verglichen, der Host wird nur ausgewiesen.',
  '- „alt nur Leerraum“ = alt-Attribut mit Leerzeichen statt leer; `alt=""` gilt als dekorativ und wird gesondert gezählt.',
  '- Alte Pfade: Status ohne Weiterleitung folgen (maxRedirects 0), bei 30x Kette bis fünf Schritte; Anker werden im DOM der Endseite gesucht (networkidle).');
await fs.writeFile(path.join(outDir, 'meta.md'), L.join('\n') + '\n');
console.log(`\nFERTIG ${seiten.length} Seiten · Linkziele ${ziele.size} · Links nicht ok ${z.linksNichtOk} · Sitemap ${z.sitemapEintraege} Einträge${altBericht ? ` · alte Pfade ${altBericht.length}` : ''} → ${path.relative(REPO, outDir)}`);
