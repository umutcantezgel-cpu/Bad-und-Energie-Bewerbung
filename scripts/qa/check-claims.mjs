#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Arbeitszeit-Aussagen im gebauten Ergebnis (fakten-abgleich B28, Inhaber 2026-10-12: flexible Arbeitszeiten,
 * keine 35-Stunden-Woche, kein „pünktlich Feierabend“). Läuft nach `next build`, wie check-graph:
 *
 *   node scripts/qa/check-claims.mjs
 *
 * (Ein package.json-Skript und der CI-Schritt kommen mit der Verdrahtung durch den Lead; bis dahin von Hand.)
 *
 * Durchsucht .next/server/app:
 * - jede vorgerenderte Seite (*.html): sichtbarer Text und die Attribute, die Suchmaschinen und Hilfsmittel lesen
 *   (content, alt, aria-label, title, placeholder); ohne <script> (JSON-LD und RSC-Nutzlast), <style>, <template>
 *   und Kommentare;
 * - die vorgerenderten Text-Routen (*.txt.body, *.xml.body, *.json.body): llms.txt, llms-full.txt und die Feeds.
 *
 * Verboten sind feste Uhrzeiten und Endzeiten der Arbeit (13:30, 16:45), „pünktlich zu Hause / Feierabend /
 * ins Wochenende“, „Feste Arbeitszeiten“ und jede Wochenstundenzahl („35 Std“, „35-Stunden“, „Wochenstunden“).
 *
 * Ausnahme: die Erreichbarkeit des Büros (Mo–Do 07:00–16:45, Fr 07:00–13:30). Sie ist keine Arbeitszeit und steht
 * nur in Elementen mit `data-claims="buerozeiten"` (components/site/OpeningHoursText.tsx: Fuß, ContactOptions,
 * Danke-Seite) und in Textzeilen, die mit „Büro erreichbar:“ beginnen (llms.txt, auch als Listenpunkt). Alles
 * darin bleibt ungeprüft.
 */

const APP_OUTPUT_DIR = path.resolve(process.cwd(), '.next/server/app');

/**
 * Verbotene Arbeitszeit-Aussagen (Plan PR1; dieselbe Liste prüft lib/content/__tests__/claims.test.ts an den
 * Quellen). Uhrzeiten nur als Angabe für Menschen: Maschinen-Zeitstempel der Feeds („2026-10-12T13:30:00Z“,
 * „13:30:07 GMT“) zählen nicht.
 */
export const FORBIDDEN_CLAIMS =
  /(?<![\dT:])(?:13:30|16:45)(?!:\d)|pünktlich\s+(?:zu\s+Hause|Feierabend|ins\s+Wochenende)|Feste\s+Arbeitszeiten|35[- ]?(?:Std|Stunden)|Wochenstunden/gi;

/** Markierung der Bürozeiten im HTML: `data-claims="buerozeiten"`. */
export const OFFICE_HOURS_MARK = 'buerozeiten';

/** Zeilen in Text-Routen, die die Bürozeiten nennen („Büro erreichbar: Mo–Do …“, auch als Listenpunkt „- …“). */
export const OFFICE_HOURS_LINE = /^\s*(?:[-*]\s+)?Büro erreichbar:/;

const TEXT_BODY = /\.(txt|xml|json)\.body$/;
const ATTRIBUTE_RE = /\s(content|alt|aria-label|title|placeholder)\s*=\s*("([^"]*)"|'([^']*)')/gi;

export function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Geschützte und schmale Leerzeichen werden zu Leerzeichen, Wortverbinder und weiche Trennstellen entfallen. */
export function normalize(text) {
  return text
    .replace(/[­​⁠﻿]/g, '')
    .replace(/[   ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Entfernt jedes Element mit `data-claims="buerozeiten"` samt Inhalt (verschachtelte Elemente gleichen Namens
 * werden gezählt). Ohne schließendes Tag fällt nur das öffnende Tag weg, der Rest wird weiter geprüft.
 */
export function stripMarked(html, mark = OFFICE_HOURS_MARK) {
  const open = new RegExp(`<([a-zA-Z][\\w-]*)\\b[^>]*\\sdata-claims\\s*=\\s*["']${mark}["'][^>]*>`, 'g');
  let out = '';
  let pos = 0;
  let match;
  while ((match = open.exec(html))) {
    out += html.slice(pos, match.index);
    const start = match.index + match[0].length;
    const tags = new RegExp(`<(/?)${match[1]}\\b[^>]*?(/?)>`, 'gi');
    tags.lastIndex = start;
    let depth = 1;
    let end = start;
    let tag;
    while (depth > 0 && (tag = tags.exec(html))) {
      if (tag[1]) depth -= 1;
      else if (!tag[2]) depth += 1;
      if (depth === 0) end = tag.index + tag[0].length;
    }
    pos = end;
    open.lastIndex = end;
  }
  return out + html.slice(pos);
}

/** Text eines HTML-Dokuments, wie ihn Leser, Hilfsmittel und Suchmaschinen sehen (ohne die Bürozeiten). */
export function visibleText(html) {
  const ohneCode = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1\s*>/gi, ' ');
  const attributes = [];
  const text = stripMarked(ohneCode).replace(/<[^>]*>/g, (tag) => {
    for (const attr of tag.matchAll(ATTRIBUTE_RE)) attributes.push(attr[3] ?? attr[4] ?? '');
    return ' ';
  });
  return normalize(decodeEntities([text, ...attributes].join(' ')));
}

/** Fundstellen mit etwas Umgebung, je Treffer ein Eintrag. */
export function findClaims(text) {
  const found = [];
  for (const match of text.matchAll(FORBIDDEN_CLAIMS)) {
    const from = Math.max(0, match.index - 50);
    const to = Math.min(text.length, match.index + match[0].length + 50);
    found.push({ claim: match[0], context: text.slice(from, to) });
  }
  return found;
}

export function claimsInHtml(html) {
  return findClaims(visibleText(html));
}

/** Text-Routen: Zeilen mit „Büro erreichbar:“ bleiben außen vor; XML ohne Tags, JSON nur die Zeichenketten. */
export function claimsInTextBody(body, kind) {
  let text = body;
  if (kind === 'json') {
    const strings = [];
    const collect = (value) => {
      if (typeof value === 'string') strings.push(value);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    try {
      collect(JSON.parse(body));
      text = strings.join('\n');
    } catch {
      text = body;
    }
  }
  const lines = text.split('\n').filter((line) => !OFFICE_HOURS_LINE.test(line));
  const joined = lines.join('\n');
  return findClaims(kind === 'xml' ? visibleText(joined) : normalize(decodeEntities(joined)));
}

function findFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) findFiles(fullPath, files);
    else if (entry.name.endsWith('.html') || TEXT_BODY.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function runClaimsCheck() {
  console.log('🔍 Checking prerendered output for working-time claims (fakten-abgleich B28)...');
  const files = findFiles(APP_OUTPUT_DIR);
  if (files.length === 0) {
    console.log('ℹ️  No prerendered output found. Run "next build" first.');
    process.exit(0);
  }

  let errorCount = 0;
  let pages = 0;
  let bodies = 0;
  for (const file of files) {
    const relativePath = path.relative(APP_OUTPUT_DIR, file);
    const content = fs.readFileSync(file, 'utf8');
    const body = TEXT_BODY.exec(file);
    const found = body ? claimsInTextBody(content, body[1]) : claimsInHtml(content);
    if (body) bodies++;
    else pages++;
    for (const { claim, context } of found) {
      console.error(`❌ [${relativePath}] „${claim}“ … ${context}`);
      errorCount++;
    }
  }

  if (errorCount > 0) {
    console.error(
      `\n🚨 Found ${errorCount} working-time claim(s). Working hours are flexible: no fixed times, no „pünktlich …“,` +
        ' no weekly hours. Office hours only inside data-claims="buerozeiten".',
    );
    process.exit(1);
  }
  console.log(`✅ ${pages} HTML documents and ${bodies} text routes carry no fixed working times (office hours only where marked).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runClaimsCheck();
