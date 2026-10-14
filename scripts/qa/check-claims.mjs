#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Gesperrte Aussagen im gebauten Ergebnis. Läuft nach `next build`, wie check-graph:
 * - Arbeitszeit (fakten-abgleich B28, Inhaber 2026-10-12: flexible Arbeitszeiten, keine 35-Stunden-Woche, kein
 *   „pünktlich Feierabend“);
 * - Beträge zu Lohn und Gehalt (E-030, Inhaber 2026-10-14: „Lohn auf Anfrage“ bei allen Stellen): kein Euro-Betrag im
 *   Text, kein Gehaltsfeld mit Zahl in Feeds und JSON. Ausnahmen: keine. Die Website nennt sonst keine Euro-Beträge;
 *   käme eine belegte hinzu (etwa ein Preis), bekäme sie wie die Bürozeiten eine eigene Markierung mit Grund;
 * - „Premium Partner“ (fakten-abgleich S6), solange der Fakt boschPremiumPartner in lib/content/facts.ts `pending`
 *   trägt (Urkunde fehlt, M-020).
 *
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

/**
 * Euro-Beträge (E-030): „3.600 €“, „1.050–1.400 €“, „3.600 € - 4.600 €“, „€ 12,50“, „15 Euro“, „4600 EUR“. Zahlen ohne
 * Währung (km, Minuten, Jahre) und „EUR“ ohne Zahl zählen nicht.
 */
export const FORBIDDEN_PAY =
  /\d[\d.,]*\s*(?:[–-]\s*\d[\d.,]*\s*)?(?:€|Euro\b|EUR\b)|(?:€|\bEUR)\s*\d[\d.,]*/gi;

/** „Premium Partner“ in jeder Schreibweise (Bindestrich, Leerzeichen, Groß/Klein). */
export const PREMIUM_PARTNER = /Premium[\s-]*Partner/gi;

/** Gehaltsfelder in Feeds und JSON (Indeed <salary>, Aggregatoren <salarymin>, JobPosting baseSalary …). */
const PAY_FIELD = /^(?:salary\w*|baseSalary|estimatedSalary|minValue|maxValue)$/i;

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

/**
 * Ist der Fakt boschPremiumPartner noch offen? Gelesen aus dem Quelltext von lib/content/facts.ts (das Skript läuft ohne
 * TypeScript): `pending` im Eintrag oder kein Eintrag (dann gibt es keinen Beleg) sperrt den Wortlaut.
 */
export function premiumPartnerPending(factsSource) {
  const start = factsSource.indexOf('boschPremiumPartner:');
  if (start === -1) return true;
  const end = factsSource.indexOf('source:', start);
  return /\bpending:/.test(factsSource.slice(start, end === -1 ? undefined : end));
}

const FACTS_FILE = path.resolve(process.cwd(), 'lib/content/facts.ts');
const PREMIUM_PENDING = fs.existsSync(FACTS_FILE) ? premiumPartnerPending(fs.readFileSync(FACTS_FILE, 'utf8')) : true;

function collect(text, pattern, found) {
  for (const match of text.matchAll(pattern)) {
    const from = Math.max(0, match.index - 50);
    const to = Math.min(text.length, match.index + match[0].length + 50);
    found.push({ at: match.index, claim: match[0], context: text.slice(from, to) });
  }
}

/**
 * Fundstellen mit etwas Umgebung, je Treffer ein Eintrag: Arbeitszeit, Euro-Beträge und, solange der Fakt offen ist,
 * „Premium Partner“. `premiumPending` nur für Tests; sonst gilt der Stand von lib/content/facts.ts.
 */
export function findClaims(text, { premiumPending = PREMIUM_PENDING } = {}) {
  const found = [];
  collect(text, FORBIDDEN_CLAIMS, found);
  collect(text, FORBIDDEN_PAY, found);
  if (premiumPending) collect(text, PREMIUM_PARTNER, found);
  // In Textreihenfolge, wie bisher
  return found.sort((a, b) => a.at - b.at).map(({ claim, context }) => ({ claim, context }));
}

/** Gehaltsfelder mit Zahl in einem JSON-Wert (Feeds): `{ baseSalary: { value: { minValue: 3600 } } }`. */
export function payFieldsInJson(value, found = []) {
  if (Array.isArray(value)) {
    for (const item of value) payFieldsInJson(item, found);
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (PAY_FIELD.test(key) && /\d/.test(JSON.stringify(child))) found.push({ claim: key, context: JSON.stringify(child).slice(0, 100) });
      else payFieldsInJson(child, found);
    }
  }
  return found;
}

/** Gehaltselemente mit Zahl in XML-Feeds: `<salary>…</salary>`, `<salarymin>3600</salarymin>`. */
export function payFieldsInXml(xml) {
  const found = [];
  for (const match of xml.matchAll(/<(salary\w*)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    if (/\d/.test(match[2])) found.push({ claim: `<${match[1]}>`, context: match[0].slice(0, 100) });
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
  const found = findClaims(kind === 'xml' ? visibleText(joined) : normalize(decodeEntities(joined)));
  if (kind === 'xml') found.push(...payFieldsInXml(body));
  if (kind === 'json') {
    try {
      found.push(...payFieldsInJson(JSON.parse(body)));
    } catch {
      // kein gültiges JSON: der Text oben ist schon geprüft
    }
  }
  return found;
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
  console.log('🔍 Checking prerendered output for working-time claims (B28), pay amounts (E-030) and pending awards (S6)...');
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
      `\n🚨 Found ${errorCount} blocked claim(s). Working hours are flexible: no fixed times, no „pünktlich …“, no weekly` +
        ' hours (office hours only inside data-claims="buerozeiten"). No pay amounts: Lohn auf Anfrage (E-030).' +
        (PREMIUM_PENDING ? ' No „Premium Partner“ while the fact boschPremiumPartner is pending (M-020).' : ''),
    );
    process.exit(1);
  }
  console.log(
    `✅ ${pages} HTML documents and ${bodies} text routes carry no fixed working times (office hours only where marked), no pay amounts` +
      `${PREMIUM_PENDING ? ' and no „Premium Partner“ (pending)' : ''}.`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runClaimsCheck();
