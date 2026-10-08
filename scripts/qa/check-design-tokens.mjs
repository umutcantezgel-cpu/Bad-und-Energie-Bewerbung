#!/usr/bin/env node
/**
 * Design guard (roadmap §4): fails on classes that bypass the token system.
 * Scans .ts/.tsx under app/, components/ and lib/ (tests excluded).
 *
 * Usage: node scripts/qa/check-design-tokens.mjs
 * A single line can opt out with a `// design-allow` or `/* design-allow *\/` comment.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Files due for deletion or rewrite in Phase 1. They are skipped and listed,
 * so remove each entry once its replacement lands.
 */
const LEGACY = [
  'components/HeroExpressFunnel.tsx',
  'components/BewerberCheckliste.tsx',
  'components/QuickApplySidebar.tsx',
  'components/Navigation.tsx',
  'components/Header.tsx',
  'components/Footer.tsx',
  'components/Logo.tsx',
  'components/CookieConsent.tsx',
  'components/views/',
  'components/navigation/',
  'components/trust/',
  'components/pricing/',
  'components/maps/',
  'components/reviews/',
  'components/contact/',
  'components/seo/',
  'components/analytics/',
  'components/layout/LayoutClientWidgets.tsx',
  'app/page.tsx',
  'app/bewerbung/',
  'app/datenschutz/',
  'app/impressum/',
  'app/not-found.tsx',
  'app/error.tsx',
  'app/global-error.tsx',
  'app/layout.tsx',
  'lib/email/templates/',
];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCAN_DIRS = ['app', 'components', 'lib'];
const SKIP_DIRS = new Set(['node_modules', '.next', '__tests__']);

// Every Tailwind v4 palette (including the 4.2 additions mauve, olive, mist, taupe).
const PALETTES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'mauve', 'olive', 'mist', 'taupe',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
  // brand primitives from app/styles/theme.css: use the semantic roles instead
  'navy', 'crimson', 'hydro', 'eco',
];

const COLOR_UTILITIES = 'bg|text|border(?:-[xytrblse])?|ring|ring-offset|outline|divide|fill|stroke|from|via|to|decoration|placeholder|caret|accent|shadow';

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const CLASS_NAME_LITERAL = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)\s*\})/g;

const RULES = [
  {
    id: 'arbitrary-text',
    find: (line) => indices(line, /text-\[/g),
    hint: 'Use a type token (text-body, text-title-2 …) or a semantic color (text-ink …).',
  },
  {
    id: 'font-mono',
    find: (line) => indices(line, /\bfont-mono\b/g),
    hint: 'No monospace in the UI; use font-sans with tabular-nums for figures.',
  },
  {
    id: 'heavy-weight',
    find: (line) => indices(line, /\bfont-(?:black\b|extrabold\b|\[(?:number:)?\s*[89]\d\d\s*\])/g),
    hint: 'Weights 400–700 only (font-normal, font-medium, font-semibold, font-bold).',
  },
  {
    id: 'loud-animation',
    find: (line) => indices(line, /\banimate-(?:pulse|ping|bounce|marquee)\b/g),
    hint: 'Motion is feedback only; no attention-seeking loops.',
  },
  {
    id: 'hex-in-class',
    find: (line) => {
      const hits = new Set(indices(line, /\[[^\]\s]*#[0-9a-fA-F]{3,8}\b[^\]\s]*\]/g));
      for (const m of line.matchAll(CLASS_NAME_LITERAL)) {
        const value = m.slice(1).find((v) => v !== undefined) ?? '';
        const offset = m.index + m[0].indexOf(value);
        for (const i of indices(value, HEX)) hits.add(offset + i);
      }
      return [...hits].sort((a, b) => a - b);
    },
    hint: 'Use a semantic color utility (bg-surface, text-ink, border-line …).',
  },
  {
    id: 'raw-palette',
    find: (line) => indices(line, new RegExp(`-(?:${PALETTES.join('|')})-\\d`, 'g')),
    hint: 'Use a semantic color utility (bg-surface-2, text-ink-muted, bg-accent …).',
  },
  {
    id: 'raw-white-black',
    find: (line) => indices(line, new RegExp(`(?<![\\w-])(?:${COLOR_UTILITIES})-(?:white|black)(?![\\w-])`, 'g')),
    hint: 'Use a semantic role: bg-surface / text-ink, or text-on-accent on the primary fill.',
  },
  {
    id: 'arbitrary-color',
    find: (line) => indices(line, /-\[[^\]\s]*?(?<![a-z])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g),
    hint: 'No raw color values in classes; use a semantic color utility.',
  },
  {
    id: 'arbitrary-shadow',
    find: (line) => indices(line, /(?<![\w-])(?:drop-)?shadow-\[/g),
    hint: 'Three shadows only (shadow-xs, shadow-sm, shadow-lg); no glows. Cards sit on surface-2.',
  },
  {
    id: 'uppercase',
    find: (line) => indices(line, /\buppercase\b/g),
    hint: 'Sentence case only; no all-caps eyebrows.',
  },
];

function indices(text, re) {
  return [...text.matchAll(re)].map((m) => m.index);
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function* sourceFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* sourceFiles(full);
    } else if (/\.tsx?$/.test(entry.name) && !/\.(?:test|spec)\.tsx?$/.test(entry.name)) {
      yield toPosix(path.relative(ROOT, full));
    }
  }
}

function isCommentOnly(line) {
  return /^\s*(?:\/\/|\/\*|\*)/.test(line);
}

/** The whitespace/quote-delimited class token around `index`. */
function tokenAt(line, index) {
  const start = line.slice(0, index).search(/[^\s"'`{}()]*$/);
  const end = index + line.slice(index).search(/[\s"'`{}()]|$/);
  return { start, text: line.slice(start, end) };
}

function check(file) {
  const findings = [];
  const lines = readFileSync(path.join(ROOT, file), 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (isCommentOnly(line) || /\/[/*]\s*design-allow\b/.test(line)) return;
    for (const rule of RULES) {
      const seen = new Set();
      for (const index of rule.find(line)) {
        const token = tokenAt(line, index);
        if (seen.has(token.start)) continue;
        seen.add(token.start);
        findings.push({ file, line: i + 1, col: token.start + 1, rule, token: token.text });
      }
    }
  });
  return findings;
}

const files = SCAN_DIRS.filter((d) => existsSync(path.join(ROOT, d))).flatMap((d) => [...sourceFiles(path.join(ROOT, d))]);
const legacyOf = (file) => LEGACY.find((prefix) => file === prefix || (prefix.endsWith('/') && file.startsWith(prefix)));

const problems = [];
const legacy = [];
for (const file of files.sort()) {
  const findings = check(file);
  if (legacyOf(file)) legacy.push({ file, count: findings.length });
  else problems.push(...findings);
}

if (legacy.length > 0) {
  console.log(`Legacy, skipped (${legacy.length} files):`);
  for (const { file, count } of legacy) console.log(`  ${file}${count ? `  (${count} findings)` : ''}`);
  console.log('');
}

const stale = LEGACY.filter((prefix) => !files.some((f) => legacyOf(f) === prefix));
if (stale.length > 0) {
  console.log(`LEGACY entries without files (remove them from ${toPosix(path.relative(ROOT, fileURLToPath(import.meta.url)))}):`);
  for (const prefix of stale) console.log(`  ${prefix}`);
  console.log('');
}

const checked = files.length - legacy.length;
if (problems.length === 0) {
  console.log(`Design guard passed: ${checked} files checked.`);
  process.exit(0);
}

console.error(`Design guard failed: ${problems.length} problem(s) in ${new Set(problems.map((p) => p.file)).size} of ${checked} files.\n`);
for (const p of problems) {
  console.error(`  ${p.file}:${p.line}:${p.col}  ${p.rule.id}  ${p.token}`);
  console.error(`    ${p.rule.hint}`);
}
process.exit(1);
