import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EREIGNIS_META } from '@/lib/attribution/ereignisse';
import { EreignisSchalter } from '../EreignisSchalter';

const ROOT = path.resolve(__dirname, '../../..');
const render = () => renderToStaticMarkup(createElement(EreignisSchalter));

/** Quelldateien (.ts, .tsx) unter einem Ordner, ohne Tests, als Pfad relativ zum Repo. */
function quellen(ordner: string): string[] {
  return readdirSync(path.join(ROOT, ordner), { recursive: true, withFileTypes: true })
    .filter((eintrag) => eintrag.isFile() && /\.tsx?$/.test(eintrag.name) && !/\.test\.tsx?$/.test(eintrag.name))
    .map((eintrag) => path.relative(ROOT, path.join(eintrag.parentPath, eintrag.name)).split(path.sep).join('/'))
    .filter((datei) => !datei.includes('/__tests__/'));
}

const lies = (datei: string) => readFileSync(path.join(ROOT, datei), 'utf8');

describe('EreignisSchalter: FUNNEL_EVENTS als Meta-Element (Standard aus bis M-034)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('setzt das Meta-Element nur, wenn der Schalter an ist', () => {
    vi.stubEnv('FUNNEL_EVENTS', undefined);
    expect(render()).toBe('');
    vi.stubEnv('FUNNEL_EVENTS', 'false');
    expect(render()).toBe('');
    vi.stubEnv('FUNNEL_EVENTS', 'true');
    expect(render()).toBe(`<meta name="${EREIGNIS_META}" content="an"/>`);
  });

  it('steht genau einmal im Root-Layout, im <body> (der <head> gehört dem Kopfskript)', () => {
    const layout = lies('app/layout.tsx');
    expect(layout).toContain("from '@/components/analytics/EreignisSchalter'");
    expect(layout.match(/<EreignisSchalter \/>/g)).toHaveLength(1);
    expect(layout.indexOf('<EreignisSchalter />')).toBeGreaterThan(layout.indexOf('<body'));
  });

  it('ist die einzige Quelle des Meta-Elements: keine Seite setzt ein zweites', () => {
    const dateien = [...quellen('app'), ...quellen('components')];
    expect(dateien).toContain('app/layout.tsx');
    expect(dateien.filter((datei) => /EREIGNIS_META|be-ereignisse/.test(lies(datei)))).toEqual([
      'components/analytics/EreignisSchalter.tsx',
    ]);
    expect(dateien.filter((datei) => /<EreignisSchalter\b/.test(lies(datei)))).toEqual(['app/layout.tsx']);
  });
});
