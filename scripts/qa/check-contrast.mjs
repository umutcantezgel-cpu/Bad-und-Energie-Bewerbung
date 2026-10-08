#!/usr/bin/env node
/**
 * WCAG 2.2 contrast check for the semantic color roles in app/styles/theme.css.
 * Resolves the cascade for light, dark and the inverse band in both modes,
 * prints a table and exits 1 if any pair is below its minimum.
 *
 * Usage: node scripts/qa/check-contrast.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const THEME_FILE = path.join(ROOT, 'app/styles/theme.css');

const TEXT = 4.5; // 1.4.3 body text
const UI = 3; // 1.4.11 non-text (focus ring, control borders)

const SURFACES = ['surface', 'surface-2', 'surface-3'];
const TEXT_ROLES = ['ink', 'ink-muted', 'danger', 'success'];
// Focus ring and control borders sit on every surface (inputs inside cards, segmented tracks).
const UI_ROLES = ['focus', 'line-strong'];

/** [foreground, background, minimum]: every role × every surface, plus fills and tinted alerts. */
const PAIRS = [
  ...TEXT_ROLES.flatMap((fg) => SURFACES.map((bg) => [fg, bg, TEXT])),
  ...UI_ROLES.flatMap((fg) => SURFACES.map((bg) => [fg, bg, UI])),
  ['on-accent', 'accent', TEXT],
  ['on-accent', 'accent-hover', TEXT],
  ['danger', 'danger-subtle', TEXT],
  ['ink', 'danger-subtle', TEXT],
  ['success', 'success-subtle', TEXT],
  ['ink', 'success-subtle', TEXT],
];

const ROOT_SELECTOR = ':root';
const INVERSE_SELECTOR = '[data-tone=inverse]';

const MODES = [
  { name: 'light', selector: ROOT_SELECTOR, dark: false },
  { name: 'dark', selector: ROOT_SELECTOR, dark: true },
  { name: 'inverse light', selector: INVERSE_SELECTOR, dark: false },
  { name: 'inverse dark', selector: INVERSE_SELECTOR, dark: true },
];

// --- minimal CSS walker -----------------------------------------------------

function matchingBrace(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return i;
  }
  throw new Error(`Unbalanced braces in ${path.relative(ROOT, THEME_FILE)}`);
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

function mediaMatches(conditions, env) {
  return conditions.every((condition) =>
    condition.split(/\s+and\s+/).every((raw) => {
      const part = raw.trim().replace(/\s+/g, ' ');
      if (part === 'screen' || part === 'all') return true;
      if (part === 'print') return false;
      if (part === '(prefers-color-scheme: dark)') return env.dark;
      if (part === '(prefers-color-scheme: light)') return !env.dark;
      throw new Error(`check-contrast: unsupported media condition "${part}"`);
    }),
  );
}

function resolveScope(rules, selector, env, inherited = new Map()) {
  const vars = new Map(inherited);
  for (const rule of rules) {
    if (rule.selectors.includes(selector) && mediaMatches(rule.media, env)) {
      for (const [k, v] of rule.decls) vars.set(k, v);
    }
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

function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    return [0, 2, 4].map((o) => parseInt(h.slice(o, o + 2), 16));
  }
  const rgb = value.match(/^rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*\)$/i);
  if (rgb) return rgb.slice(1, 4).map(Number);
  throw new Error(`check-contrast: cannot parse opaque color "${value}"`);
}

function luminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// --- run -----------------------------------------------------------------------

const css = readFileSync(THEME_FILE, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const { rules, theme } = walk(css, [], { rules: [], theme: new Map() });

const rows = [];
let failures = 0;

for (const mode of MODES) {
  const env = { dark: mode.dark };
  const rootVars = resolveScope(rules, ROOT_SELECTOR, env);
  const vars = mode.selector === ROOT_SELECTOR ? rootVars : resolveScope(rules, mode.selector, env, rootVars);

  for (const [fg, bg, min] of PAIRS) {
    const fgValue = resolveValue(`var(--${fg})`, vars, theme);
    const bgValue = resolveValue(`var(--${bg})`, vars, theme);
    const ratio = contrast(parseColor(fgValue), parseColor(bgValue));
    const pass = ratio >= min;
    if (!pass) failures++;
    rows.push([mode.name, `${fg} / ${bg}`, `${fgValue} on ${bgValue}`, ratio.toFixed(2), `${min}`, pass ? 'ok' : 'FAIL']);
  }
}

const header = ['mode', 'pair', 'values', 'ratio', 'min', 'result'];
const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
const line = (cells) => cells.map((c, i) => (i === 3 || i === 4 ? c.padStart(widths[i]) : c.padEnd(widths[i]))).join('  ').trimEnd();

console.log(`Contrast check: ${path.relative(ROOT, THEME_FILE)}\n`);
console.log(line(header));
console.log(widths.map((w) => '-'.repeat(w)).join('  '));
for (const row of rows) console.log(line(row));
console.log('');

if (failures > 0) {
  console.error(`${failures} pair(s) below the WCAG minimum.`);
  process.exit(1);
}
console.log(`All ${rows.length} pairs pass (text ≥ ${TEXT}, UI ≥ ${UI}).`);
