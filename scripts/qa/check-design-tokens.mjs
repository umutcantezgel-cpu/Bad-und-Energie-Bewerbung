#!/usr/bin/env node
/**
 * Design guard (KERN 1.0, K-004/K-005/K-008/K-009): fails on classes that bypass the token system
 * and on motion ids that are missing from the register.
 *
 * - Scans .ts/.tsx under app/, components/ and lib/ (tests excluded) line by line.
 * - Checks every literal `data-motion` id in .ts/.tsx and .css files against MOTION_IDS in
 *   lib/motion/register.ts (KERN K-009: every animated element carries its id).
 * - Reports off-scale spacing and numeric durations as notes (not blocking yet; R3–R5 move the
 *   components onto the 11-step scale and the four durations).
 *
 * Usage: node scripts/qa/check-design-tokens.mjs [--notes]   (--notes lists every note)
 * A single line can opt out with a `// design-allow` or `/* design-allow *\/` comment and a reason.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Files due for deletion or rewrite. They are skipped and listed, so remove each
 * entry once its replacement lands. Empty since the Phase 1 legacy cleanup.
 * Entries are paths relative to the repo root; a trailing slash covers a folder.
 * @type {string[]}
 */
const LEGACY = [];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCAN_DIRS = ['app', 'components', 'lib'];
const SKIP_DIRS = new Set(['node_modules', '.next', '__tests__']);
export const REGISTER_FILE = 'lib/motion/register.ts';
/** The only file that may name the primitives (--p-*). */
const THEME_FILE = 'app/styles/theme.css';

// Every Tailwind v4 palette (including the 4.2 additions mauve, olive, mist, taupe).
const PALETTES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'mauve', 'olive', 'mist', 'taupe',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
  // former brand primitives (ROADMAP §4, replaced by KERN 1.0): use the semantic roles instead
  'navy', 'crimson', 'hydro', 'eco',
];

const COLOR_UTILITIES = 'bg|text|border(?:-[xytrblse])?|ring|ring-offset|outline|divide|fill|stroke|from|via|to|decoration|placeholder|caret|accent|shadow';

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const CLASS_NAME_LITERAL = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)\s*\})/g;

export const RULES = [
  {
    id: 'arbitrary-text',
    find: (line) => indices(line, /text-\[/g),
    hint: 'Use a type token (text-body, text-title-2, text-etikett …) or a semantic color (text-ink …).',
  },
  {
    id: 'font-mono',
    find: (line) => indices(line, /\bfont-(?:mono|serif)\b/g),
    hint: 'Martian Mono only for measures: font-mass (values) or text-etikett (labels); text stays font-sans.',
  },
  {
    id: 'arbitrary-font',
    find: (line) => indices(line, /(?<![\w-])font-\[/g),
    hint: 'Families come from font-display, font-sans and font-mass; weights from font-normal … font-bold or the type tokens.',
  },
  {
    id: 'heavy-weight',
    find: (line) => indices(line, /\bfont-(?:black\b|extrabold\b|\[(?:number:)?\s*[89]\d\d\s*\])/g),
    hint: 'Weights 400–700 in classes; 800 only through the display tokens (text-display, text-title-1).',
  },
  {
    id: 'loud-animation',
    find: (line) => indices(line, /\banimate-(?:pulse|ping|bounce|marquee)\b/g),
    hint: 'Motion tells its story once (K-009); no attention-seeking loops.',
  },
  {
    id: 'arbitrary-motion',
    find: (line) => indices(line, /(?<![\w-])(?:duration|delay|ease)-\[/g),
    hint: 'Durations d1–d4, delays as multiples of --takt, curves ease-aus/-wechsel/-ein (K-009).',
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
    id: 'primitive-var',
    find: (line) => indices(line, /--p-[a-z]/g),
    hint: `Primitives (--p-*) live in ${THEME_FILE} only; use the roles (bg-wand, text-brand, stroke-vorlauf …).`,
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
    hint: 'One shadow only (shadow-lg, floating layers); no glows. Depth comes from surfaces (K-008).',
  },
  {
    id: 'extra-shadow',
    find: (line) => indices(line, /(?<![\w-])shadow-(?:2xs|xs|sm|md|xl|2xl)(?![\w-])/g),
    hint: 'One shadow only (shadow-lg, floating layers); depth comes from surfaces (K-008).',
  },
  {
    id: 'extra-radius',
    find: (line) => indices(line, /(?<![\w-])rounded(?:-[trblse]{1,2})?-(?:\[|2xl|3xl|4xl)/g),
    hint: 'Four radii only: rounded-1 (4), rounded-2 (12), rounded-3 (24), rounded-voll (K-008).',
  },
  {
    id: 'recolor-filter',
    find: (line) => indices(line, /(?<![\w-])(?:invert|brightness-\d+|grayscale|sepia|hue-rotate-\d+)(?![\w-])/g),
    hint: 'No recoloring filters: the logo stays the original on its plaque (G8, K-006); colors come from the roles.',
  },
  {
    id: 'uppercase',
    find: (line) => indices(line, /\buppercase\b/g),
    hint: 'Sentence case; caps only as the mono label text-etikett (K-005).',
  },
  {
    id: 'glass',
    find: (line) => indices(line, /(?<![\w-])backdrop-(?:blur|saturate|filter)/g),
    /** The sticky header is the only glass surface until R4 rebuilds it (K-008: no glass). */
    allowIn: ['components/site/HeaderBar.tsx'],
    hint: 'No glass or blur (K-008).',
  },
];

// --- motion register --------------------------------------------------------------

/** Reads the literal MOTION_IDS array from lib/motion/register.ts. */
export function parseMotionIds(source) {
  const m = source.match(/export const MOTION_IDS\s*=\s*\[([\s\S]*?)\]\s*as const/);
  if (!m) throw new Error(`check-design-tokens: MOTION_IDS not found in ${REGISTER_FILE}`);
  const ids = [...m[1].matchAll(/['"]([a-z][a-z0-9-]*)['"]/g)].map((x) => x[1]);
  if (ids.length === 0) throw new Error(`check-design-tokens: MOTION_IDS in ${REGISTER_FILE} is empty`);
  return ids;
}

/**
 * Literal data-motion ids in a line: JSX (data-motion="x", data-motion={'x'}), object keys
 * ('data-motion': 'x') and CSS attribute selectors ([data-motion="x"], [data-motion=x]).
 * Expressions (data-motion={id}) are left to TypeScript (type MotionId).
 */
export function motionIdsIn(line) {
  const out = [];
  const patterns = [
    /(?<!\[)data-motion\s*=\s*\{?\s*(["'`])([^"'`]*)\1/g,
    /['"]data-motion['"]\s*:\s*(["'`])([^"'`]*)\1/g,
    /\[data-motion\s*[~|^$*]?=\s*(["']?)([a-z0-9-]+)\1\s*\]/g,
  ];
  for (const re of patterns) {
    for (const m of line.matchAll(re)) out.push({ id: m[2], index: m.index });
  }
  return out;
}

// --- notes (not blocking) ------------------------------------------------------------

/** Tailwind spacing steps on the K-007 scale (×0.25rem): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 96 · 128 px. */
export const SPACING_STEPS = new Set(['0', '1', '2', '3', '4', '6', '8', '12', '16', '20', '24', '32']);
const SPACING_UTILITY =
  /(?<![\w-])-?(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|start|end|scroll-[mp][xytrblse]?)-(\d+(?:\.\d+)?)(?![\w.-])/g;

export function offScaleSpacing(line) {
  return [...line.matchAll(SPACING_UTILITY)].filter((m) => !SPACING_STEPS.has(m[1])).map((m) => ({ index: m.index, token: m[0] }));
}

export function numericMotion(line) {
  return [...line.matchAll(/(?<![\w-])(?:duration|delay)-\d+(?![\w-])/g)].map((m) => ({ index: m.index, token: m[0] }));
}

// --- scanning ---------------------------------------------------------------------

function indices(text, re) {
  return [...text.matchAll(re)].map((m) => m.index);
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function* sourceFiles(dir, pattern) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* sourceFiles(full, pattern);
    } else if (pattern.test(entry.name) && !/\.(?:test|spec)\.tsx?$/.test(entry.name)) {
      yield toPosix(path.relative(ROOT, full));
    }
  }
}

function isCommentOnly(line) {
  return /^\s*(?:\/\/|\/\*|\*)/.test(line);
}

function isAllowed(line) {
  return /\/[/*]\s*design-allow\b/.test(line);
}

/** The whitespace/quote-delimited class token around `index`. */
function tokenAt(line, index) {
  const start = line.slice(0, index).search(/[^\s"'`{}()]*$/);
  const end = index + line.slice(index).search(/[\s"'`{}()]|$/);
  return { start, text: line.slice(start, end) };
}

/** Rule findings for one line of a .ts/.tsx file. */
export function checkLine(line, file = '') {
  const findings = [];
  if (isCommentOnly(line) || isAllowed(line)) return findings;
  for (const rule of RULES) {
    if (rule.allowIn?.includes(file)) continue;
    const seen = new Set();
    for (const index of rule.find(line)) {
      const token = tokenAt(line, index);
      if (seen.has(token.start)) continue;
      seen.add(token.start);
      findings.push({ col: token.start + 1, rule, token: token.text });
    }
  }
  return findings;
}

const MOTION_RULE = {
  id: 'motion-register',
  hint: `Every data-motion id must be listed in ${REGISTER_FILE} (KERN K-009) with purpose and reduced form.`,
};

/** Unknown data-motion ids in one line (code or CSS). */
export function checkMotionLine(line, knownIds) {
  if (isAllowed(line)) return [];
  return motionIdsIn(line)
    .filter(({ id }) => !knownIds.has(id))
    .map(({ id, index }) => ({ col: index + 1, rule: MOTION_RULE, token: `data-motion="${id}"` }));
}

function stripCssComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
}

function main() {
  const showNotes = process.argv.includes('--notes');
  const knownIds = new Set(parseMotionIds(readFileSync(path.join(ROOT, REGISTER_FILE), 'utf8')));
  const dirs = SCAN_DIRS.filter((d) => existsSync(path.join(ROOT, d)));
  const files = dirs.flatMap((d) => [...sourceFiles(path.join(ROOT, d), /\.tsx?$/)]).sort();
  const cssFiles = dirs.flatMap((d) => [...sourceFiles(path.join(ROOT, d), /\.css$/)]).sort();
  const legacyOf = (file) => LEGACY.find((prefix) => file === prefix || (prefix.endsWith('/') && file.startsWith(prefix)));

  const problems = [];
  const legacy = [];
  const notes = { spacing: [], motion: [] };
  const usedIds = new Set();

  for (const file of files) {
    const lines = readFileSync(path.join(ROOT, file), 'utf8').split('\n');
    const findings = [];
    lines.forEach((line, i) => {
      for (const f of checkLine(line, file)) findings.push({ file, line: i + 1, ...f });
      if (isCommentOnly(line)) return;
      for (const f of checkMotionLine(line, knownIds)) findings.push({ file, line: i + 1, ...f });
      for (const { id } of motionIdsIn(line)) usedIds.add(id);
      for (const n of offScaleSpacing(line)) notes.spacing.push({ file, line: i + 1, token: n.token });
      for (const n of numericMotion(line)) notes.motion.push({ file, line: i + 1, token: n.token });
    });
    if (legacyOf(file)) legacy.push({ file, count: findings.length });
    else problems.push(...findings);
  }

  for (const file of cssFiles) {
    const lines = stripCssComments(readFileSync(path.join(ROOT, file), 'utf8')).split('\n');
    lines.forEach((line, i) => {
      for (const f of checkMotionLine(line, knownIds)) problems.push({ file, line: i + 1, ...f });
      for (const { id } of motionIdsIn(line)) usedIds.add(id);
      if (file !== THEME_FILE) {
        for (const index of indices(line, /--p-[a-z]/g)) {
          problems.push({ file, line: i + 1, col: index + 1, rule: RULES.find((r) => r.id === 'primitive-var'), token: tokenAt(line, index).text });
        }
      }
    });
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

  const noteFiles = (list) => new Set(list.map((n) => n.file)).size;
  console.log(
    `Notes (not blocking): ${notes.spacing.length} off-scale spacing classes in ${noteFiles(notes.spacing)} files (K-007), ` +
      `${notes.motion.length} numeric durations/delays (K-009); motion register ${knownIds.size} ids, ${usedIds.size} in use.` +
      (showNotes ? '' : ' Run with --notes for the list.'),
  );
  if (showNotes) {
    for (const n of [...notes.spacing, ...notes.motion]) console.log(`  ${n.file}:${n.line}  ${n.token}`);
  }

  const checked = files.length + cssFiles.length - legacy.length;
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
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
