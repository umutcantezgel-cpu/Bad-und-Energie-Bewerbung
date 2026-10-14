#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeEntities, normalize } from './check-claims.mjs';

/**
 * Ähnlichkeit der gebauten Ortsseiten (Gate I4 am ausgelieferten HTML, E-029; vorher U3, Review Phase 2 Punkt 15). Das
 * Gate in lib/places/qualitaet.ts misst nur das Textmodell (lib/places/text.ts). Hier zählt, was im <main> der
 * vorgerenderten Seiten steht, also auch Stellenkarten, Faktenband, Kontakt, Knöpfe, Fragen, Quellenzeilen und
 * Beschriftungen.
 * Läuft nach `next build`:
 *
 *   bun run test:similarity                       # liest .next/server/app/einsatzgebiet
 *   node scripts/qa/check-local-similarity.mjs <ordner>
 *
 * - Sucht rekursiv alle *.html im Ordner. Ortsseite ist ein Dokument, dessen JSON-LD einen Place trägt und keine
 *   CollectionPage (die Kreis-Hubs); Weiterleitungen (zusammengelegte Orte, Kreise ohne Hub) haben keinen Place.
 * - Text: der Inhalt von <main> ohne Kommentare, <script>, <style>, <template>, <noscript> und <svg>; Tags werden
 *   zu Leerraum, Entitäten aufgelöst. Wörter wie im Gate (Kleinschreibung, „4,5“ und „3.600“ bleiben ein Wort).
 * - Verglichen werden nur indexierbare Ortsseiten (I4: „gegen indexierbare Geschwisterseiten“); eine Seite mit
 *   `<meta name="robots" content="noindex…">` hat das Gate nicht bestanden und zählt nicht mit.
 * - Jaccard über 5-Wort-Shingles für jedes Paar indexierbarer Ortsseiten. Über 0,40 (Gate I4) schlägt die Prüfung fehl.
 *   Ausgegeben werden die 5 ähnlichsten Paare und der Anteil der Wendungen, die auf mehr als der Hälfte der Seiten
 *   stehen (gemeinsamer Bestand: Stellen, Fakten, Kontakt).
 * - Ohne gebaute Seiten (Ordner fehlt, keine .html, weniger als zwei Ortsseiten) endet die Prüfung mit Exit 1:
 *   Eine leere Prüfung darf nicht grün sein. Sind es Ortsseiten, aber weniger als zwei indexierbare (alle haben das
 *   Gate nicht bestanden, etwa nach dem Fahrplanwechsel ohne neue Daten), kann keine ein Beinahe-Duplikat im Index sein:
 *   Die Prüfung nennt das und endet mit Exit 0.
 */

/** Gate I4 am gebauten HTML (lib/places/qualitaet.ts, GATE.maxJaccardHtml; qualitaet.test.ts hält beide gleich). */
export const MAX_JACCARD = 0.4;
export const SHINGLE_SIZE = 5;
/** So viele Paare nennt die Ausgabe, die ähnlichsten zuerst. */
export const REPORT_PAIRS = 5;
/** Ausgabeordner der vorgerenderten Seiten unter /einsatzgebiet (Next.js 16, `next build`). */
export const DEFAULT_DIR = path.join('.next', 'server', 'app', 'einsatzgebiet');

/** Alle .html-Dateien unter `dir`, rekursiv und sortiert; ein fehlender Ordner ergibt eine leere Liste. */
export function findHtmlFiles(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findHtmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out.sort();
}

/** Sichtbarer Text im ersten <main>: ohne Code und Zeichnungen, Tags als Leerraum, Entitäten aufgelöst. */
export function mainText(html) {
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1] ?? '';
  const text = main
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|template|noscript|svg)\b[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');
  return normalize(decodeEntities(text));
}

/** Alle @type-Werte der JSON-LD-Blöcke eines Dokuments (auch in @graph und verschachtelt). */
export function jsonLdTypes(html) {
  const types = new Set();
  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== 'object') return;
    const type = value['@type'];
    for (const t of Array.isArray(type) ? type : [type]) if (typeof t === 'string') types.add(t);
    Object.values(value).forEach(visit);
  };
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      visit(JSON.parse(match[1]));
    } catch {
      // Kaputtes JSON-LD meldet check-graph.mjs; hier zählt die Seite dann nicht als Ortsseite.
    }
  }
  return types;
}

/** Ortsseite: JSON-LD mit Place, ohne CollectionPage (Kreis-Hub, Gebietsseite). */
export function isPlacePage(html) {
  const types = jsonLdTypes(html);
  return types.has('Place') && !types.has('CollectionPage');
}

/** Robots-Meta mit noindex (wie scripts/qa/check-graph.mjs): Die Seite hat das Gate nicht bestanden. */
export function isNoindex(html) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const name = /\bname\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] ?? '';
    const content = /\bcontent\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] ?? '';
    if (/^(robots|googlebot)$/i.test(name) && /\bnoindex\b/i.test(content)) return true;
  }
  return false;
}

/**
 * Ortsseite im Sinn der Prüfung: eine Seite unter /einsatzgebiet, die kein Hub ist und keine Weiterleitung. Eine
 * Ortsseite mit noindex trägt keinen Place im Graphen (app/einsatzgebiet/seo.ts); sie zählt als Ortsseite, wird aber
 * nicht verglichen.
 */
export function placePageKind(html) {
  if (isPlacePage(html)) return isNoindex(html) ? 'noindex' : 'indexierbar';
  const types = jsonLdTypes(html);
  return isNoindex(html) && types.has('WebPage') && !types.has('CollectionPage') ? 'noindex' : null;
}

/** Wörter und Zahlen in Kleinschreibung, wie lib/places/metriken.ts tokens(). */
export function tokens(text) {
  return text.toLocaleLowerCase('de-DE').match(/[\p{L}\p{N}]+(?:[.,]\p{N}+)*/gu) ?? [];
}

/** Menge der n-Wort-Shingles; kürzere Texte ergeben ein einziges Shingle (wie im Gate). */
export function shingles(text, size = SHINGLE_SIZE) {
  const words = tokens(text);
  const out = new Set();
  if (words.length === 0) return out;
  if (words.length < size) {
    out.add(words.join(' '));
    return out;
  }
  for (let i = 0; i + size <= words.length; i += 1) out.add(words.slice(i, i + size).join(' '));
  return out;
}

export function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 0;
  let shared = 0;
  for (const item of a) if (b.has(item)) shared += 1;
  return shared / (a.size + b.size - shared);
}

/**
 * Alle Paare von `pages` ([{ name, text }]) nach Jaccard, das ähnlichste zuerst; dazu die Paare über `limit` und je
 * Seite der Anteil ihrer Shingles, die auf mehr als der Hälfte der Seiten stehen (Mittel und Maximum).
 */
export function comparePages(pages, limit = MAX_JACCARD) {
  const sets = pages.map((page) => shingles(page.text));
  const pairs = [];
  for (let i = 0; i < pages.length; i += 1) {
    for (let j = i + 1; j < pages.length; j += 1) {
      pairs.push({ a: pages[i].name, b: pages[j].name, value: jaccard(sets[i], sets[j]) });
    }
  }
  pairs.sort((x, y) => y.value - x.value || x.a.localeCompare(y.a) || x.b.localeCompare(y.b));
  const counts = new Map();
  for (const set of sets) for (const shingle of set) counts.set(shingle, (counts.get(shingle) ?? 0) + 1);
  const shares = sets.map((set) => {
    if (set.size === 0) return 0;
    let common = 0;
    for (const shingle of set) if (counts.get(shingle) > pages.length / 2) common += 1;
    return common / set.size;
  });
  return {
    pairs,
    tooSimilar: pairs.filter((pair) => pair.value > limit),
    commonShare: shares.length === 0 ? 0 : shares.reduce((sum, v) => sum + v, 0) / shares.length,
    maxCommonShare: Math.max(0, ...shares),
  };
}

const fmt = (value) => value.toFixed(3);

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function run() {
  const dir = path.resolve(process.cwd(), process.argv[2] ?? DEFAULT_DIR);
  console.log(`🔍 Checking prerendered place pages for near-duplicates (gate I4 on the built HTML) in ${path.relative(process.cwd(), dir) || '.'} ...`);
  const files = findHtmlFiles(dir);
  if (files.length === 0) {
    fail(`No prerendered .html found under ${dir}. Run "bun run build" first (Next.js writes the pages to .next/server/app/einsatzgebiet/<slug>.html).`);
  }
  const pages = [];
  const noindex = [];
  let skipped = 0;
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const kind = placePageKind(html);
    if (kind === null) {
      skipped += 1;
      continue;
    }
    const name = path.relative(dir, file).replace(/\.html$/, '');
    if (kind === 'noindex') {
      noindex.push(name);
      continue;
    }
    const text = mainText(html);
    if (tokens(text).length === 0) fail(`${name}: no text in <main>; the page or this check's extraction is broken.`);
    pages.push({ name, text });
  }
  if (pages.length + noindex.length < 2) {
    fail(`Found ${files.length} .html file(s) but only ${pages.length + noindex.length} place page(s) (JSON-LD Place without CollectionPage, or a noindex place page); nothing to compare.`);
  }
  if (noindex.length > 0) console.log(`ℹ️  ${noindex.length} place page(s) with noindex (gate not passed) are not compared: ${noindex.join(', ')}`);
  if (pages.length < 2) {
    console.log(`✅ Only ${pages.length} indexable place page(s); no near-duplicates can be in the index.`);
    return;
  }

  const { pairs, tooSimilar, commonShare, maxCommonShare } = comparePages(pages);
  console.log(`\nMost similar pairs (limit ${MAX_JACCARD}):`);
  for (const pair of pairs.slice(0, REPORT_PAIRS)) {
    console.log(`  ${pair.value > MAX_JACCARD ? '❌' : '  '} ${fmt(pair.value)}  ${pair.a} ↔ ${pair.b}`);
  }
  const summary =
    `${pages.length} indexable place pages (${noindex.length} noindex, ${skipped} other document(s) skipped), ${pairs.length} pairs, most similar ${fmt(pairs[0].value)}; ` +
    `on average ${(commonShare * 100).toFixed(1)} % of a page's 5-word phrases appear on more than half of the pages (max ${(maxCommonShare * 100).toFixed(1)} %).`;
  if (tooSimilar.length > 0) {
    console.error(`\n🚨 ${tooSimilar.length} pair(s) above ${MAX_JACCARD.toFixed(2)}. ${summary}`);
    console.error('   Shorten the shared text (lib/places/text.ts, components/einsatzgebiet) or merge a place (docs/operations/orte-pflegen.md).');
    process.exit(1);
  }
  console.log(`\n✅ ${summary}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
