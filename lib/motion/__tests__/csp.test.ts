import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import nextConfig from '../../../next.config';
import { HEAD_SCRIPT, HEAD_SCRIPT_SHA256 } from '../head-script';

/**
 * CSP und Inline-Skripte (KERN K-004, R2-FUND-01 Runde 2).
 *
 * Regel: Führt script-src einen Hash oder eine Nonce, ignorieren Browser (CSP Level 2+) 'unsafe-inline'.
 * Dann muss JEDES Inline-Skript des Builds abgedeckt sein – auch die RSC-Flight-Daten von Next
 * (`self.__next_f.push(…)`), die sich je Seite ändern und darum nie per Hash abzudecken sind. Ohne Hash
 * und Nonce muss 'unsafe-inline' die Inline-Skripte abdecken.
 */

const ROOT = path.resolve(__dirname, '../../..');
const BUILD_APP = path.join(ROOT, '.next/server/app');

async function cspHeader(): Promise<string> {
  const groups = (await nextConfig.headers?.()) ?? [];
  for (const group of groups) {
    for (const header of group.headers) {
      if (/^content-security-policy(?:-report-only)?$/i.test(header.key)) return header.value;
    }
  }
  throw new Error('Keine CSP in next.config.ts');
}

function directive(csp: string, name: string): string[] {
  const entry = csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.split(/\s+/)[0] === name);
  return entry ? entry.split(/\s+/).slice(1) : [];
}

const isHash = (source: string) => /^'sha(?:256|384|512)-[A-Za-z0-9+/=]+'$/.test(source);
const isNonce = (source: string) => /^'nonce-[^']+'$/.test(source);

function* htmlFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* htmlFiles(full);
    else if (entry.endsWith('.html')) yield full;
  }
}

/** Inhalte aller Inline-Skripte (ohne src, ausführbarer Typ) eines Dokuments. */
function inlineScripts(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1];
    if (/\bsrc\s*=/.test(attrs)) continue;
    const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
    if (type && !['text/javascript', 'module', 'application/javascript'].includes(type)) continue; // JSON-LD, Daten
    out.push(m[2]);
  }
  return out;
}

const sha256 = (text: string) => `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;

const hasBuild = existsSync(BUILD_APP);

describe('CSP script-src und Inline-Skripte', () => {
  it('führt einen Hash oder eine Nonce nur, wenn jedes Inline-Skript abgedeckt ist – sonst deckt unsafe-inline alles ab', async () => {
    const scriptSrc = directive(await cspHeader(), 'script-src');
    expect(scriptSrc.length).toBeGreaterThan(0);
    const hashes = scriptSrc.filter(isHash);
    const nonces = scriptSrc.filter(isNonce);

    if (hashes.length === 0 && nonces.length === 0) {
      expect(scriptSrc).toContain("'unsafe-inline'");
      return;
    }
    // Eine Nonce gilt nur mit 'strict-dynamic' und einer Nonce je Antwort (proxy.ts); statische
    // Hashes müssen jedes Inline-Skript jeder vorgerenderten Seite abdecken.
    expect(nonces, 'Nonce-Strategie gehört in proxy.ts (eigenes Paket), nicht in eine feste CSP').toEqual([]);
    expect(hasBuild, 'Hash in script-src: Prüfung braucht den Build (.next/server/app)').toBe(true);
    const missing: string[] = [];
    for (const file of htmlFiles(BUILD_APP)) {
      for (const script of inlineScripts(readFileSync(file, 'utf8'))) {
        if (!hashes.includes(sha256(script))) missing.push(`${path.relative(ROOT, file)}: ${script.slice(0, 60)}…`);
      }
    }
    expect(missing, 'Inline-Skripte ohne Hash – der Hash schaltet unsafe-inline ab').toEqual([]);
  });

  it('erkennt Inline-Skripte, lässt JSON-LD und externe Skripte aus', () => {
    const html =
      '<script>self.__next_f.push([1,"a"])</script><script src="/x.js"></script>' +
      '<script type="application/ld+json">{"@type":"Organization"}</script><script async>!function(){}()</script>';
    expect(inlineScripts(html)).toEqual(['self.__next_f.push([1,"a"])', '!function(){}()']);
  });

  it.skipIf(!hasBuild)('Build: das Kopfskript steht wörtlich im <head> und hat den geführten Hash', () => {
    const file = path.join(BUILD_APP, 'index.html');
    if (!existsSync(file)) return;
    const html = readFileSync(file, 'utf8');
    const head = html.slice(0, html.indexOf('</head>'));
    const scripts = inlineScripts(head);
    expect(scripts).toContain(HEAD_SCRIPT);
    expect(sha256(HEAD_SCRIPT)).toBe(HEAD_SCRIPT_SHA256);
    // Next setzt eigene Inline-Skripte (Flight-Daten): genau die, die ein fester Hash nicht abdeckt.
    expect(inlineScripts(html).some((script) => script.includes('self.__next_f'))).toBe(true);
  });
});
