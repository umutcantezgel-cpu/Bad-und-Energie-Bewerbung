#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { decodeEntities, normalize } from './check-claims.mjs';

/**
 * Einzigartigkeit der gebauten Ortsseiten (Gate U3 am ausgelieferten HTML, Review Phase 2 Punkt 15). Das Gate in
 * lib/places/__tests__/gate.test.ts misst das Textmodell; hier zählt, was im <main> der vorgerenderten Seiten steht,
 * also auch Stellenliste, Faktenband, Kontakt und Beschriftungen der Pläne. Läuft nach `next build`:
 *
 *   node scripts/qa/check-uniqueness.mjs
 *
 * Grenze wie im Gate: Jaccard über 5-Wort-Shingles je Paar von Ortsseiten ≤ 0,45. Gemeldet werden außerdem das
 * ähnlichste Paar und der Anteil der Shingles einer Seite, die auf mehr als der Hälfte der Ortsseiten stehen.
 * Kreis-Hubs (CollectionPage) und die Gebietsseite zählen nicht als Ortsseiten.
 */

const APP_OUTPUT_DIR = path.resolve(process.cwd(), '.next/server/app');
const PLACE_DIR = path.join(APP_OUTPUT_DIR, 'einsatzgebiet');

/** Gate U3 (lib/places/__tests__/gate.test.ts GATE.maxJaccardWhole). */
export const MAX_JACCARD = 0.45;
export const SHINGLE_SIZE = 5;

/** Text im <main> ohne Code (Skripte, Stile, Vorlagen, Kommentare), Tags als Leerraum. */
export function mainText(html) {
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1] ?? '';
  const text = main
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');
  return normalize(decodeEntities(text));
}

/** Wörter und Zahlen in Kleinschreibung, wie lib/places/__tests__/gate-metrics.ts tokens(). */
export function tokens(text) {
  return text.toLocaleLowerCase('de-DE').match(/[\p{L}\p{N}]+(?:[.,]\p{N}+)*/gu) ?? [];
}

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

/** Eine Ortsseite: WebPage mit Place im Graphen, kein Kreis-Hub (CollectionPage). */
export function isPlacePage(html) {
  return /"@type":"Place"/.test(html) && !/"@type":"CollectionPage"/.test(html);
}

/**
 * Paare über der Grenze, das ähnlichste Paar und je Seite der Anteil gemeinsamer Shingles (auf mehr als der Hälfte
 * der Seiten). `pages`: [{ name, text }].
 */
export function measure(pages, limit = MAX_JACCARD) {
  const sets = pages.map((page) => shingles(page.text));
  const tooSimilar = [];
  let worst = { a: '', b: '', value: 0 };
  for (let i = 0; i < pages.length; i += 1) {
    for (let j = i + 1; j < pages.length; j += 1) {
      const value = jaccard(sets[i], sets[j]);
      if (value > worst.value) worst = { a: pages[i].name, b: pages[j].name, value };
      if (value > limit) tooSimilar.push({ a: pages[i].name, b: pages[j].name, value });
    }
  }
  const counts = new Map();
  for (const set of sets) for (const shingle of set) counts.set(shingle, (counts.get(shingle) ?? 0) + 1);
  const common = sets.map((set) => {
    let n = 0;
    for (const shingle of set) if (counts.get(shingle) > pages.length / 2) n += 1;
    return set.size === 0 ? 0 : n / set.size;
  });
  const commonShare = common.length === 0 ? 0 : common.reduce((sum, v) => sum + v, 0) / common.length;
  return { tooSimilar, worst, commonShare, maxCommonShare: Math.max(0, ...common) };
}

function runUniquenessCheck() {
  console.log('🔍 Checking prerendered place pages for near-duplicates (gate U3 on the built HTML)...');
  if (!fs.existsSync(PLACE_DIR)) {
    console.log('ℹ️  No prerendered place pages found. Run "next build" first.');
    process.exit(0);
  }
  const pages = fs
    .readdirSync(PLACE_DIR)
    .filter((name) => name.endsWith('.html'))
    .map((name) => ({ name: name.replace(/\.html$/, ''), html: fs.readFileSync(path.join(PLACE_DIR, name), 'utf8') }))
    .filter((page) => isPlacePage(page.html))
    .map((page) => ({ name: page.name, text: mainText(page.html) }));
  if (pages.length < 2) {
    console.log(`ℹ️  ${pages.length} place page(s) found; nothing to compare.`);
    process.exit(0);
  }
  const { tooSimilar, worst, commonShare, maxCommonShare } = measure(pages);
  for (const pair of tooSimilar.sort((x, y) => y.value - x.value)) {
    console.error(`❌ ${pair.a} ↔ ${pair.b}: Jaccard ${pair.value.toFixed(3)} > ${MAX_JACCARD}`);
  }
  const summary =
    `${pages.length} place pages, most similar pair ${worst.a} ↔ ${worst.b} at ${worst.value.toFixed(3)} (limit ${MAX_JACCARD}), ` +
    `on average ${(commonShare * 100).toFixed(1)} % of a page's 5-word phrases appear on more than half of the pages (max ${(maxCommonShare * 100).toFixed(1)} %).`;
  if (tooSimilar.length > 0) {
    console.error(`\n🚨 ${tooSimilar.length} pair(s) above the limit. ${summary}`);
    process.exit(1);
  }
  console.log(`✅ ${summary}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runUniquenessCheck();
