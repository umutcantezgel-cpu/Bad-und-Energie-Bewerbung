#!/usr/bin/env node
/**
 * WCAG 2.2 contrast check for the semantic color roles in app/styles/theme.css (KERN K-006).
 * Resolves the cascade (roles → var() → primitives) for light, dark, the inverse band in both
 * modes and print (also with a dark preference: print must stay light), then checks
 *   - text pairs ≥ 4.5 (1.4.3) and graphics/controls ≥ 3 (1.4.11),
 *   - the inverse band stands apart from the page surfaces (screen only),
 *   - raised cards are lighter than the surface-2 sections they sit on.
 * Prints a table and exits 1 if any pair is below its minimum.
 *
 * Usage: node scripts/qa/check-contrast.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const THEME_FILE = path.join(ROOT, 'app/styles/theme.css');

export const TEXT = 4.5; // 1.4.3 body text
export const UI = 3; // 1.4.11 non-text (focus ring, control borders, the Vorlauf/Rücklauf lines)
/**
 * Minimum luminance ratio between the inverse band's surface and the page surfaces it sits
 * between (surface, surface-2) in the same mode. Not a WCAG rule: it keeps the closing band
 * from merging with the FAQ and the footer.
 */
export const SEPARATION = 1.1;
const SEPARATED_FROM = ['surface', 'surface-2'];

const SURFACES = ['surface', 'surface-2', 'surface-3', 'surface-raised'];
// Text roles on every surface: body, secondary text, headings and measures (brand), states.
const TEXT_ROLES = ['ink', 'ink-muted', 'ink-2', 'brand', 'danger', 'success'];
// Focus ring and control borders sit on every surface (inputs inside cards, segmented tracks).
const UI_ROLES = ['focus', 'line-strong'];
// The pipe pair (Vorlauf red, Rücklauf blue) runs over paper, wall and the warm house.
const PIPE_GROUNDS = ['surface', 'surface-2', 'waerme'];
const PIPE_ROLES = ['vorlauf', 'ruecklauf'];

const ALL_MODES = ['light', 'dark', 'inverse light', 'inverse dark', 'print', 'print dark', 'print inverse'];

/**
 * [foreground, background, minimum, modes?]: every role × every surface, plus fills, the pipe pair
 * and tinted alerts. `modes` limits a pair to some modes (default: all).
 */
export const PAIRS = [
  ...TEXT_ROLES.flatMap((fg) => SURFACES.map((bg) => [fg, bg, TEXT])),
  ...UI_ROLES.flatMap((fg) => SURFACES.map((bg) => [fg, bg, UI])),
  ...PIPE_ROLES.flatMap((fg) => PIPE_GROUNDS.map((bg) => [fg, bg, UI])),
  // Text, headings, measures and the focus ring on the warm house.
  ['ink', 'waerme', TEXT],
  ['brand', 'waerme', TEXT],
  ['focus', 'waerme', UI],
  ['on-accent', 'accent', TEXT],
  ['on-accent', 'accent-hover', TEXT],
  ['on-accent', 'accent-press', TEXT],
  // The red button against the page (V1 measured 3.34 in dark). In the navy band the white label
  // identifies the button (1.4.11 needs no boundary for a text button), so the band is not listed.
  // Red on the band is only ~2.7:1, so the fill alone would not read as a surface there: the primary
  // action in the band stays a Papier/Creme button (as today) or gets an `ink` (Creme) border, which
  // the text pairs above already hold at ≥ 4.5 (note for R3/R4; test: check-contrast.test.ts).
  ['accent', 'surface', UI, ['light', 'dark', 'print', 'print dark']],
  ['danger', 'danger-subtle', TEXT],
  ['ink', 'danger-subtle', TEXT],
  ['success', 'success-subtle', TEXT],
  ['ink', 'success-subtle', TEXT],
];

const ROOT_SELECTOR = ':root';
const INVERSE_SELECTOR = '[data-tone=inverse]';

export const MODES = [
  { name: 'light', selector: ROOT_SELECTOR, dark: false, print: false },
  { name: 'dark', selector: ROOT_SELECTOR, dark: true, print: false },
  { name: 'inverse light', selector: INVERSE_SELECTOR, dark: false, print: false },
  { name: 'inverse dark', selector: INVERSE_SELECTOR, dark: true, print: false },
  // Print is always light: dark mode and the band are screen-only.
  { name: 'print', selector: ROOT_SELECTOR, dark: false, print: true },
  { name: 'print dark', selector: ROOT_SELECTOR, dark: true, print: true },
  { name: 'print inverse', selector: INVERSE_SELECTOR, dark: true, print: true },
];

// --- minimal CSS walker -----------------------------------------------------

function matchingBrace(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return i;
  }
  throw new Error('check-contrast: unbalanced braces in theme.css');
}

function declarations(body) {
  const decls = new Map();
  for (const part of body.split(';')) {
    const m = part.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/);
    if (m) decls.set(m[1], m[2]);
  }
  return decls;
}

/** Collects style rules in source order with their media conditions; @theme decls go to `theme`. */
function walk(src, media, out) {
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf('{', i);
    if (open === -1) break;
    const close = matchingBrace(src, open);
    const prelude = src.slice(i, open).split(';').pop().trim();
    const body = src.slice(open + 1, close);
    i = close + 1;

    if (prelude.startsWith('@media')) {
      walk(body, [...media, prelude.slice('@media'.length).trim()], out);
    } else if (prelude.startsWith('@layer') || prelude.startsWith('@supports')) {
      walk(body, media, out);
    } else if (prelude.startsWith('@theme')) {
      for (const [k, v] of declarations(body)) out.theme.set(k, v);
    } else if (!prelude.startsWith('@')) {
      const selectors = prelude.split(',').map(normalizeSelector);
      out.rules.push({ selectors, media, decls: declarations(body) });
    }
  }
  return out;
}

function normalizeSelector(s) {
  return s.replace(/["'\s]/g, '');
}

/**
 * true/false for the color-relevant media features; null for anything else (widths, motion …),
 * which must not carry color roles.
 */
export function mediaMatches(conditions, env) {
  let result = true;
  for (const condition of conditions) {
    for (const raw of condition.split(/\s+and\s+/)) {
      const part = raw.trim().replace(/\s+/g, ' ');
      if (part === 'all') continue;
      if (part === 'screen') result &&= !env.print;
      else if (part === 'print') result &&= env.print;
      else if (part === '(prefers-color-scheme: dark)') result &&= env.dark;
      else if (part === '(prefers-color-scheme: light)') result &&= !env.dark;
      else return null;
    }
  }
  return result;
}

function resolveScope(rules, selector, env, colorKeys, inherited = new Map()) {
  const vars = new Map(inherited);
  for (const rule of rules) {
    if (!rule.selectors.includes(selector)) continue;
    const match = mediaMatches(rule.media, env);
    if (match === null) {
      const colored = [...rule.decls.keys()].filter((k) => colorKeys.has(k) || k.startsWith('--p-'));
      if (colored.length > 0) {
        throw new Error(`check-contrast: unsupported media condition "${rule.media.join(' and ')}" sets ${colored.join(', ')}`);
      }
      continue;
    }
    if (match) for (const [k, v] of rule.decls) vars.set(k, v);
  }
  return vars;
}

// --- color math ----------------------------------------------------------------

function resolveValue(value, vars, theme, depth = 0) {
  if (depth > 10) throw new Error(`check-contrast: var() cycle at "${value}"`);
  const m = value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (!m) return value;
  const next = vars.get(m[1]) ?? theme.get(m[1]) ?? m[2];
  if (next === undefined) throw new Error(`check-contrast: ${m[1]} is not defined`);
  return resolveValue(next.trim(), vars, theme, depth + 1);
}

export function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    return [0, 2, 4].map((o) => parseInt(h.slice(o, o + 2), 16));
  }
  const rgb = value.match(/^rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*\)$/i);
  if (rgb) return rgb.slice(1, 4).map(Number);
  throw new Error(`check-contrast: cannot parse opaque color "${value}"`);
}

export function luminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// --- check ---------------------------------------------------------------------

/**
 * Runs every check on a theme stylesheet. Returns the table rows, the failure count and a
 * resolver (`role(modeName, role)` → color value) for tests.
 */
export function checkTheme(cssText) {
  const css = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  const { rules, theme } = walk(css, [], { rules: [], theme: new Map() });
  // Role names come from the utilities (--color-x: var(--x)); they must never hide in width queries.
  const colorKeys = new Set(
    [...theme.entries()]
      .filter(([k]) => k.startsWith('--color-'))
      .map(([, v]) => v.match(/^var\(\s*(--[\w-]+)/)?.[1])
      .filter(Boolean),
  );

  const scope = (mode) => {
    const env = { dark: mode.dark, print: mode.print };
    const rootVars = resolveScope(rules, ROOT_SELECTOR, env, colorKeys);
    return mode.selector === ROOT_SELECTOR ? rootVars : resolveScope(rules, mode.selector, env, colorKeys, rootVars);
  };
  const role = (modeName, name) => {
    const mode = MODES.find((m) => m.name === modeName);
    if (!mode) throw new Error(`check-contrast: unknown mode ${modeName}`);
    return resolveValue(`var(--${name})`, scope(mode), theme);
  };

  const rows = [];
  let failures = 0;

  for (const mode of MODES) {
    const vars = scope(mode);
    for (const [fg, bg, min, modes] of PAIRS) {
      if (modes && !modes.includes(mode.name)) continue;
      const fgValue = resolveValue(`var(--${fg})`, vars, theme);
      const bgValue = resolveValue(`var(--${bg})`, vars, theme);
      const ratio = contrast(parseColor(fgValue), parseColor(bgValue));
      const pass = ratio >= min;
      if (!pass) failures++;
      rows.push([mode.name, `${fg} / ${bg}`, `${fgValue} on ${bgValue}`, ratio.toFixed(2), `${min}`, pass ? 'ok' : 'FAIL']);
    }
  }

  for (const dark of [false, true]) {
    const page = scope(MODES.find((m) => m.selector === ROOT_SELECTOR && m.dark === dark && !m.print));
    const inverse = scope(MODES.find((m) => m.selector === INVERSE_SELECTOR && m.dark === dark && !m.print));
    const band = resolveValue('var(--surface)', inverse, theme);
    for (const name of SEPARATED_FROM) {
      const pageValue = resolveValue(`var(--${name})`, page, theme);
      const ratio = contrast(parseColor(band), parseColor(pageValue));
      const pass = ratio >= SEPARATION;
      if (!pass) failures++;
      rows.push([
        `separation ${dark ? 'dark' : 'light'}`,
        `inverse surface / ${name}`,
        `${band} vs ${pageValue}`,
        ratio.toFixed(2),
        `${SEPARATION}`,
        pass ? 'ok' : 'FAIL',
      ]);
    }
  }

  // Elevation: cards on a surface-2 section use surface-raised and must be lighter than the section
  // in every mode (in dark mode `surface` is darker than surface-2 and made cards look cut out).
  for (const mode of MODES) {
    const vars = scope(mode);
    const raised = resolveValue('var(--surface-raised)', vars, theme);
    const section = resolveValue('var(--surface-2)', vars, theme);
    const pass = luminance(parseColor(raised)) > luminance(parseColor(section));
    if (!pass) failures++;
    rows.push([
      `elevation ${mode.name}`,
      'surface-raised / surface-2',
      `${raised} vs ${section}`,
      contrast(parseColor(raised), parseColor(section)).toFixed(2),
      'lighter',
      pass ? 'ok' : 'FAIL',
    ]);
  }

  return { rows, failures, role };
}

function main() {
  const { rows, failures } = checkTheme(readFileSync(THEME_FILE, 'utf8'));
  const header = ['mode', 'pair', 'values', 'ratio', 'min', 'result'];
  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
  const line = (cells) => cells.map((c, i) => (i === 3 || i === 4 ? c.padStart(widths[i]) : c.padEnd(widths[i]))).join('  ').trimEnd();

  console.log(`Contrast check: ${path.relative(ROOT, THEME_FILE)} (${ALL_MODES.join(', ')})\n`);
  console.log(line(header));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) console.log(line(row));
  console.log('');

  if (failures > 0) {
    console.error(`${failures} pair(s) below the WCAG minimum.`);
    process.exit(1);
  }
  console.log(
    `All ${rows.length} pairs pass (text ≥ ${TEXT}, UI and lines ≥ ${UI}, band separation ≥ ${SEPARATION}, raised cards lighter than surface-2).`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
