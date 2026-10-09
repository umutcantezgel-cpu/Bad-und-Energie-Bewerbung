#!/usr/bin/env node
/**
 * Client-bundle guard: zod (and the zod resolver of react-hook-form) must stay on the server.
 * Collects every module the routes under app/ import, takes the 'use client' modules among them
 * (the client boundaries) and fails if a forbidden package is reachable from one of them through
 * value imports. Client modules that no route imports (legacy files due for deletion) are not in
 * any bundle; they are only counted.
 *
 * Type-only imports are skipped, as the compiler drops them: `import type …`, `export type … from`
 * and imports whose specifiers are all inline `type` (`import { type A } from …`).
 * Dynamic `import()` and `require()` count as edges (they still end up in a browser chunk).
 *
 * Usage: node scripts/qa/check-client-imports.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ROUTE_DIR = 'app';
const SCAN_DIRS = ['app', 'components', 'lib', 'hooks'];
const SKIP_DIRS = new Set(['node_modules', '.next', '__tests__']);
const CODE_EXT = /\.(?:[cm]?[jt]sx?)$/;
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$/;
const RESOLVE_SUFFIXES = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '/index.ts', '/index.tsx', '/index.js', '/index.mjs'];

/** Packages that must never reach the browser bundle (package name or subpath). */
const FORBIDDEN = ['zod', '@hookform/resolvers'];

function isForbidden(specifier) {
  return FORBIDDEN.some((name) => specifier === name || specifier.startsWith(`${name}/`));
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), out);
    } else if (CODE_EXT.test(entry.name) && !TEST_FILE.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

/** Removes comments while keeping strings and template literals intact (good enough for import scanning). */
export function stripComments(source) {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];
    if (quote) {
      out += ch;
      if (ch === '\\') {
        out += next ?? '';
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? source.length : end + 2;
      out += ' ';
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    out += ch;
    i += 1;
  }
  return out;
}

/** True when the file starts with the 'use client' directive (after comments). */
export function isClientModule(source) {
  return /^\s*(?:['"]use client['"])/.test(stripComments(source));
}

function onlyTypeSpecifiers(clause) {
  const braces = /^\{([\s\S]*)\}$/.exec(clause.trim());
  if (!braces) return false;
  const specifiers = braces[1]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return specifiers.length > 0 && specifiers.every((part) => /^type\s+/.test(part));
}

/** Value-level module specifiers of a source file. */
export function valueImports(source) {
  const code = stripComments(source);
  const specifiers = [];
  // Only characters that can appear in an import/export clause, so a match never spans other code.
  const fromClause = /\b(import|export)\s+(?!type\s*[{*\w])([\w$\s{},*]*?)\s*from\s*(['"])([^'"]+)\3/g;
  for (const match of code.matchAll(fromClause)) {
    const [, keyword, clause, , specifier] = match;
    if (keyword === 'export' && !/^(?:\*|\{)/.test(clause.trim())) continue;
    if (onlyTypeSpecifiers(clause)) continue;
    specifiers.push(specifier);
  }
  for (const match of code.matchAll(/\bimport\s*(['"])([^'"]+)\1/g)) specifiers.push(match[2]);
  for (const match of code.matchAll(/\b(?:import|require)\s*\(\s*(['"])([^'"]+)\1\s*\)/g)) specifiers.push(match[2]);
  return specifiers;
}

function resolveLocal(fromFile, specifier) {
  let base;
  if (specifier.startsWith('@/')) base = path.join(ROOT, specifier.slice(2));
  else if (specifier.startsWith('./') || specifier.startsWith('../')) base = path.resolve(path.dirname(fromFile), specifier);
  else return null;
  for (const suffix of RESOLVE_SUFFIXES) {
    const candidate = base + suffix;
    if (existsSync(candidate) && statSync(candidate).isFile()) return CODE_EXT.test(candidate) ? candidate : null;
  }
  return null;
}

const importCache = new Map();
function importsOf(file) {
  if (!importCache.has(file)) importCache.set(file, valueImports(readFileSync(file, 'utf8')));
  return importCache.get(file);
}

/** Shortest import chain from `entry` to a forbidden package, or null. */
function findForbiddenChain(entry) {
  const queue = [[entry]];
  const seen = new Set([entry]);
  while (queue.length > 0) {
    const chain = queue.shift();
    const file = chain.at(-1);
    for (const specifier of importsOf(file)) {
      if (isForbidden(specifier)) return [...chain, specifier];
      const target = resolveLocal(file, specifier);
      if (!target || seen.has(target)) continue;
      seen.add(target);
      queue.push([...chain, target]);
    }
  }
  return null;
}

/** Every local module reachable from the given roots through value imports. */
function reachableFrom(roots) {
  const seen = new Set(roots);
  const queue = [...roots];
  while (queue.length > 0) {
    const file = queue.shift();
    for (const specifier of importsOf(file)) {
      const target = resolveLocal(file, specifier);
      if (target && !seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  return seen;
}

function main() {
  const files = SCAN_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));
  const isClient = (file) => isClientModule(readFileSync(file, 'utf8'));
  const reachable = reachableFrom(walk(path.join(ROOT, ROUTE_DIR)));
  const clientFiles = [...reachable].filter(isClient);
  const unused = files.filter((file) => !reachable.has(file) && isClient(file)).length;
  const failures = [];
  for (const file of clientFiles) {
    const chain = findForbiddenChain(file);
    if (chain) failures.push(chain);
  }

  const rel = (file) => (path.isAbsolute(file) ? path.relative(ROOT, file) : file);
  if (failures.length > 0) {
    console.error(`check-client-imports: ${failures.length} client module(s) reach a server-only package (${FORBIDDEN.join(', ')}):`);
    for (const chain of failures) console.error(`  ${chain.map(rel).join('\n    → ')}`);
    console.error('Use `import type` for schema types and zod-free validators in client code.');
    process.exit(1);
  }
  console.log(
    `check-client-imports: ${clientFiles.length} client modules checked, no ${FORBIDDEN.join('/')} in the browser graph` +
      (unused > 0 ? ` (${unused} unused client module(s) skipped).` : '.'),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
