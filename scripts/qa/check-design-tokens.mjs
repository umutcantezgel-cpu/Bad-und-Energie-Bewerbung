#!/usr/bin/env node
/**
 * Design guard (KERN 1.0, K-004/K-005/K-008/K-009): fails on classes that bypass the token system
 * and on motion ids that are missing from the register.
 *
 * - Scans .ts/.tsx under app/, components/ and lib/ (tests excluded) line by line.
 * - Checks every literal `data-motion` id in .ts/.tsx and .css files against MOTION_IDS in
 *   lib/motion/register.ts (KERN K-009: every animated element carries its id).
 * - Rule `endlos` (E-029): endless loops only in ENDLOS_ERLAUBT, each with its reason; in
 *   components/zeichnung/bewegung/dauer.module.css only under [data-dauer="an"] and
 *   prefers-reduced-motion: no-preference.
 * - Rule `waerme-rollen` (E-031): the warmth ramp --waerme-0…4 only in WAERME_ROLLEN_ERLAUBT and in the Büro block
 *   appended to components/themen/themen.module.css (from BUERO_MARKE to the end of the file).
 * - Rule `cursor` (E-031): image cursors (url(), image-set(), files under /cursor/) only in app/globals.css.
 * - Rule `radius` (E-031, Prüfrunde 1 A1-15): border-*-radius in stylesheets only on the four steps of the scale.
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

// --- endless loops (E-029, KERN K-009) ------------------------------------------------

/** The stylesheet of the continuous motion (rotor, water, refrigerant): the only home of product loops. */
export const DAUER_CSS = 'components/zeichnung/bewegung/dauer.module.css';

/**
 * Files that may loop forever, each with its reason (rule `endlos`). Everything else fails: `infinite` in CSS or
 * inline styles, Tailwind's infinite utility `animate-spin` and WAAPI `iterations: Infinity`. A design-allow
 * comment does not lift this rule; a new exception needs an entry here and in KERN K-009.
 */
export const ENDLOS_ERLAUBT = Object.freeze({
  [DAUER_CSS]:
    'Dauerbewegung der Produkt- und Prozesszeichnungen (E-029): nur unter [data-dauer="an"] und prefers-reduced-motion: no-preference, mit Anhalten-Knopf',
  'components/ui/eingabe.module.css': 'Ladeanzeige (K-011 Zustand „Lädt“): läuft nur, solange gesendet wird',
  'components/apply/thanks/FollowUpForm.tsx':
    'Ladeanzeige (animate-spin) im Nachfrage-Formular, nur während des Sendens; Wechsel auf die Ladeanzeige der Eingabe ist offen',
});

const ENDLOS_RULE = {
  id: 'endlos',
  hint: `Loops only in ${DAUER_CSS} (under [data-dauer="an"] and prefers-reduced-motion: no-preference) or an exception in ENDLOS_ERLAUBT with its reason (E-029, K-009).`,
};

const ENDLOS = /\binfinite\b|\banimate-spin\b|\biterations\s*:\s*Infinity\b/g;

/** Positions of endless-loop tokens in a line. */
export function endlosIn(line) {
  return [...line.matchAll(ENDLOS)].map((m) => ({ index: m.index, token: m[0] }));
}

/**
 * Findings of rule `endlos` for one file (source with comments). Outside the allowed files every loop token is a
 * finding. In dauer.module.css each `infinite` must sit inside `@media (prefers-reduced-motion: no-preference)` and in
 * a rule whose selector contains `[data-dauer="an"]`.
 */
export function checkEndlos(source, file) {
  const findings = [];
  const css = file.endsWith('.css');
  const clean = css
    ? stripCssComments(source)
    : source.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  const allowed = Object.prototype.hasOwnProperty.call(ENDLOS_ERLAUBT, file);
  if (allowed && file !== DAUER_CSS) return findings;

  // Block structure for the context check: a stack of preludes (selectors and at-rules) at every position
  const stack = [];
  let prelude = '';
  let line = 1;
  let col = 1;
  for (let i = 0; i < clean.length; i += 1) {
    const ch = clean[i];
    if (ch === '{') {
      stack.push(prelude.trim());
      prelude = '';
    } else if (ch === '}') {
      stack.pop();
      prelude = '';
    } else if (ch === ';') {
      prelude = '';
    } else {
      prelude += ch;
    }
    const rest = clean.slice(i, i + 24);
    const hit = /^(?:infinite\b|animate-spin\b|iterations\s*:\s*Infinity\b)/.exec(rest);
    const boundary = i === 0 || !/[\w-]/.test(clean[i - 1]);
    if (hit && boundary) {
      const inMedia = stack.some((p) => /^@media\b[^{]*prefers-reduced-motion:\s*no-preference/.test(p));
      const inDauer = stack.some((p) => !p.startsWith('@') && /\[data-dauer="an"\]/.test(p));
      if (!allowed || !(css && inMedia && inDauer)) findings.push({ line, col, rule: ENDLOS_RULE, token: hit[0] });
    }
    if (ch === '\n') {
      line += 1;
      col = 1;
    } else {
      col += 1;
    }
  }
  return findings;
}

// --- warmth ramp (E-031, KERN K-006) ----------------------------------------------------

/**
 * Files that may name the warmth ramp (--waerme-0…4), each with its reason (rule `waerme-rollen`). Everything else
 * fails, comments excepted; a design-allow comment does not lift this rule. The Büro block counts as allowed too.
 */
export const WAERME_ROLLEN_ERLAUBT = Object.freeze({
  [THEME_FILE]: 'Primitive und Rollen der Wärmerampe (hell, dunkel, Inverse-Band, Wärmebereich, Druck)',
  'components/zeichnung/waerme/waerme.module.css': 'Bänder des Wärmefelds (E-031, Paket W1)',
  'components/site/waermefront/waermefront.module.css': 'Klick-Wärme und Wärmefront (E-031, Paket W4)',
});

/** The stylesheet that carries the Büro block (E-031, Paket W3): appended at its end. */
export const BUERO_DATEI = 'components/themen/themen.module.css';
/**
 * Start of the Büro block: a comment line beginning with this text; the block runs to the end of the file and all its
 * classes begin with `buero` (scripts/qa/check-css-chunks.mjs measures it in the build by that prefix).
 */
export const BUERO_MARKE = '/* ═══ Büro-Block (E-031)';

const WAERME_RULE = {
  id: 'waerme-rollen',
  hint: `The warmth ramp --waerme-0…4 only in ${Object.keys(WAERME_ROLLEN_ERLAUBT).join(', ')} and the Büro block of ${BUERO_DATEI} (E-031).`,
};

const WAERME_ROLLE = /--waerme-[0-4](?![\w-])/g;

/** Source without comments, positions kept (CSS: block comments; TS: block and line comments). */
function ohneKommentare(source, file) {
  const blank = (c) => c.replace(/[^\n]/g, ' ');
  const ohneBlock = source.replace(/\/\*[\s\S]*?\*\//g, blank);
  return file.endsWith('.css') ? ohneBlock : ohneBlock.replace(/(^|[^:'"`])(\/\/.*)$/gm, (_, vor, k) => vor + blank(k));
}

/** Line (1-based) where the Büro block of BUERO_DATEI begins, or Infinity without a block. */
export function bueroBlockAb(source) {
  const i = source.indexOf(BUERO_MARKE);
  return i < 0 ? Infinity : source.slice(0, i).split('\n').length;
}

/** Findings of rule `waerme-rollen` for one file. */
export function checkWaermeRollen(source, file) {
  if (Object.prototype.hasOwnProperty.call(WAERME_ROLLEN_ERLAUBT, file)) return [];
  const ab = file === BUERO_DATEI ? bueroBlockAb(source) : Infinity;
  const findings = [];
  ohneKommentare(source, file)
    .split('\n')
    .forEach((line, i) => {
      if (i + 1 >= ab) return;
      for (const m of line.matchAll(WAERME_ROLLE)) findings.push({ line: i + 1, col: m.index + 1, rule: WAERME_RULE, token: m[0] });
    });
  return findings;
}

// --- cursor (E-031) ------------------------------------------------------------------

/** The only stylesheet with image cursors (E-031, Paket W4): `url() 4 3, auto` behind (hover: hover) and (pointer: fine). */
export const CURSOR_DATEI = 'app/globals.css';

const CURSOR_RULE = {
  id: 'cursor',
  hint: `Image cursors (url(), image-set(), /cursor/ files) only in ${CURSOR_DATEI}, always with a keyword fallback (E-031).`,
};

/** Image-cursor tokens in a source without comments: cursor declarations with url()/image-set(), Tailwind cursor-[url(…)], files under /cursor/. */
const CURSOR_MUSTER = [
  /(?<![\w-])cursor\s*:\s*[^;{}]*?(?:url|image-set)\(/g,
  /(?<![\w-])cursor-\[[^\]]*?(?:url|image-set)\(/g,
  /["'`(\s]\/cursor\//g,
];

/** Findings of rule `cursor` for one file (one per line: the first image-cursor token). */
export function checkCursor(source, file) {
  if (file === CURSOR_DATEI) return [];
  const findings = [];
  ohneKommentare(source, file)
    .split('\n')
    .forEach((line, i) => {
      const treffer = CURSOR_MUSTER.flatMap((re) => [...line.matchAll(re)]).sort((a, b) => a.index - b.index)[0];
      if (treffer) findings.push({ line: i + 1, col: treffer.index + 1, rule: CURSOR_RULE, token: treffer[0].trim() });
    });
  return findings;
}

// --- radii in stylesheets (E-031, Prüfrunde 1 A1-15, KERN K-008) --------------------------

/**
 * Corner radii in CSS files (rule `radius`): only the four steps of the scale (var(--radius-1|2|3|voll), optionally
 * with a fallback), `0`, `inherit` and concentric pipe bends around a step (± half a stroke). `extra-radius` covers the Tailwind classes; this covers border-*-radius in the
 * stylesheets (CSS modules, globals), where `border-radius: 50%` slipped through. Exceptions are variables that are
 * geometry, not a corner, each with its reason. theme.css defines the steps and is skipped.
 */
export const RADIUS_AUSNAHMEN = Object.freeze({
  'components/home/einstieg/einstieg.module.css': { variable: '--bogen', grund: 'Rohrbogen der Leitung im Hero (Geometrie aus dem Paarabstand, kein Eckenradius)' },
  'components/mappe/mappe.module.css': { variable: '--blatt-foto-radius', grund: 'Foto auf dem Druckblatt der Mappe, Papiermaß in mm' },
});

const RADIUS_RULE = {
  id: 'radius',
  hint: 'Four radii only in stylesheets: var(--radius-1|2|3|voll), 0 or inherit (K-008, E-031); geometry variables need an entry in RADIUS_AUSNAHMEN.',
};

const RADIUS_DEKLARATION = /(?<![\w-])border(?:-[a-z]+)*-radius\s*:\s*([^;{}]*)/g;
/**
 * A step, 0, inherit – or a concentric bend: the outer edge of a pipe stroke drawn around a step's centre line,
 * calc(var(--radius-1|2|3) ± var(--m-strich|--m-leitung) / 2) (Leitungstrenner, Schlussband, Stellenliste).
 */
const RADIUS_STUFE =
  /^(?:0|inherit|var\(--radius-(?:1|2|3|voll)(?:\s*,\s*[^()]*)?\)|calc\(var\(--radius-[123]\)\s*[+-]\s*var\(--m-(?:strich|leitung)\)\s*\/\s*2\))$/;

/** Value tokens of a radius declaration, split at whitespace outside parentheses (`!important` dropped). */
export function radiusWerte(wert) {
  const out = [];
  let tiefe = 0;
  let teil = '';
  for (const ch of wert.replace(/!important\s*$/, '').trim()) {
    if (ch === '(') tiefe += 1;
    if (ch === ')') tiefe -= 1;
    if (/\s/.test(ch) && tiefe === 0) {
      if (teil) out.push(teil);
      teil = '';
    } else teil += ch;
  }
  if (teil) out.push(teil);
  return out;
}

/** Findings of rule `radius` for one stylesheet (one per offending value). */
export function checkRadius(source, file) {
  if (!file.endsWith('.css') || file === THEME_FILE) return [];
  const ausnahme = RADIUS_AUSNAHMEN[file];
  const findings = [];
  ohneKommentare(source, file)
    .split('\n')
    .forEach((line, i) => {
      for (const m of line.matchAll(RADIUS_DEKLARATION)) {
        for (const wert of radiusWerte(m[1])) {
          if (RADIUS_STUFE.test(wert) || (ausnahme && wert === `var(${ausnahme.variable})`)) continue;
          findings.push({ line: i + 1, col: m.index + 1, rule: RADIUS_RULE, token: `${m[0].split(':')[0].trim()}: ${wert}` });
        }
      }
    });
  return findings;
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

  for (const file of [...files, ...cssFiles]) {
    const source = readFileSync(path.join(ROOT, file), 'utf8');
    for (const f of checkEndlos(source, file)) problems.push({ file, ...f });
    for (const f of checkWaermeRollen(source, file)) problems.push({ file, ...f });
    for (const f of checkCursor(source, file)) problems.push({ file, ...f });
    for (const f of checkRadius(source, file)) problems.push({ file, ...f });
  }
  // An exception without its file is stale: remove it from RADIUS_AUSNAHMEN
  for (const file of Object.keys(RADIUS_AUSNAHMEN)) {
    if (!existsSync(path.join(ROOT, file))) problems.push({ file, line: 0, col: 0, rule: RADIUS_RULE, token: 'RADIUS_AUSNAHMEN (Datei fehlt)' });
  }
  // An exception without its file is stale: remove it from ENDLOS_ERLAUBT
  for (const file of Object.keys(ENDLOS_ERLAUBT)) {
    if (!existsSync(path.join(ROOT, file))) problems.push({ file, line: 0, col: 0, rule: ENDLOS_RULE, token: 'ENDLOS_ERLAUBT (Datei fehlt)' });
  }

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
