import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { AUFTAKT_KLASSE, HEAD_SCRIPT, HEAD_SCRIPT_SHA256, REDUZIERT_ABFRAGE, SICHERHEITSNETZ_MS } from '../head-script';
import { MEDIA } from '../prefers';

const ROOT = path.resolve(__dirname, '../../..');

/** Führt das Kopfskript mit einem nachgebauten <html> und matchMedia aus. */
function run(reduced: boolean | 'throws') {
  const classes = new Set<string>();
  const documentElement = {
    classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c) },
  };
  const timers: Array<{ fn: () => void; ms: number }> = [];
  const matchMedia = vi.fn((query: string) => {
    if (reduced === 'throws') throw new Error('kein matchMedia');
    return { matches: query === REDUZIERT_ABFRAGE && reduced };
  });
  const setTimeout = (fn: () => void, ms: number) => timers.push({ fn, ms });
  new Function('document', 'matchMedia', 'setTimeout', HEAD_SCRIPT)({ documentElement }, matchMedia, setTimeout);
  return { classes, timers, matchMedia };
}

describe('Kopfskript', () => {
  it('bleibt unter 1 KB und kommt ohne Abhängigkeiten aus', () => {
    expect(Buffer.byteLength(HEAD_SCRIPT, 'utf8')).toBeLessThanOrEqual(1024);
    expect(HEAD_SCRIPT).not.toMatch(/\bimport\b|\brequire\b|=>|\bconst\b|\blet\b/);
    expect(REDUZIERT_ABFRAGE).toBe(MEDIA.reduzierteBewegung);
  });

  it('setzt „auftakt“ ohne reduzierte Bewegung und entfernt die Klasse nach 2 s', () => {
    const { classes, timers, matchMedia } = run(false);
    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(classes.has(AUFTAKT_KLASSE)).toBe(true);
    expect(timers).toHaveLength(1);
    expect(timers[0].ms).toBe(SICHERHEITSNETZ_MS);
    expect(SICHERHEITSNETZ_MS).toBe(2000);
    timers[0].fn();
    expect(classes.has(AUFTAKT_KLASSE)).toBe(false);
  });

  it('lässt die Klasse bei reduzierter Bewegung weg (Endzustand sofort)', () => {
    const { classes, timers } = run(true);
    expect(classes.size).toBe(0);
    expect(timers).toHaveLength(0);
  });

  it('wirft nicht, wenn matchMedia fehlt oder wirft', () => {
    const { classes } = run('throws');
    expect(classes.size).toBe(0);
  });

  it('führt seinen sha256-Hash als Konstante (CSP-Quelle für die Nonce-/Hash-Strategie)', () => {
    const hash = createHash('sha256').update(HEAD_SCRIPT, 'utf8').digest('base64');
    expect(HEAD_SCRIPT_SHA256).toBe(`'sha256-${hash}'`);
  });

  it('steht bis zur Nonce-Strategie nicht in der CSP: script-src deckt Inline-Skripte über unsafe-inline ab', () => {
    const config = readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
    const scriptSrc = config.split('\n').find((line) => line.includes('`script-src'));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).toContain("'unsafe-inline'");
    expect(scriptSrc!.split('//')[0]).not.toContain(HEAD_SCRIPT_SHA256);
  });

  it('ist in app/layout.tsx im <head> eingebunden, <html> duldet die zusätzliche Klasse', () => {
    const layout = readFileSync(path.join(ROOT, 'app/layout.tsx'), 'utf8');
    expect(layout).toMatch(/<head>\s*(?:\{\/\*[\s\S]*?\*\/\}\s*)?<script dangerouslySetInnerHTML=\{\{ __html: HEAD_SCRIPT \}\} \/>\s*<\/head>/);
    expect(layout).toMatch(/<html[^>]*suppressHydrationWarning/);
  });
});
