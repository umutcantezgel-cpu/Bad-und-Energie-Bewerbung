import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { isClientModule, valueImports } from '../../../scripts/qa/check-client-imports.mjs';

const ROOT = path.resolve(__dirname, '../../..');
const ENDUNGEN = ['', '.ts', '.tsx', '.js', '.mjs', '/index.ts', '/index.tsx'];

/**
 * Client-Teile der Seitenschale, die jede Seite lädt (components/site/index.ts: „their client parts … receive plain
 * props only, so SITE_CONFIG and tailwind-merge stay out of them“), dazu die Wärmefront-Insel aus app/layout.tsx (E-031)
 * und die Fehlergrenzen. Ein Import von cn() zöge tailwind-merge in das gemeinsame Bündel und verschöbe den LCP (die
 * Schrift der h1 teilt sich die Leitung mit jedem früh geladenen Skript).
 */
const SCHALE = [
  'components/site/HeaderBar.tsx',
  'components/site/MobileNav.tsx',
  'components/site/StickyApplyBarClient.tsx',
  'components/site/FooterSwitch.tsx',
  'components/site/waermefront/Waermefront.tsx',
  'app/error.tsx',
  'app/global-error.tsx',
];

const VERBOTEN = ['tailwind-merge', 'zod', 'lib/seo/site-config'];

function aufloesen(von: string, ziel: string): string | null {
  let basis: string;
  if (ziel.startsWith('@/')) basis = path.join(ROOT, ziel.slice(2));
  else if (ziel.startsWith('./') || ziel.startsWith('../')) basis = path.resolve(path.dirname(von), ziel);
  else return null;
  for (const endung of ENDUNGEN) {
    const datei = basis + endung;
    if (existsSync(datei) && statSync(datei).isFile() && /\.[cm]?[jt]sx?$/.test(datei)) return datei;
  }
  return null;
}

/** Kürzeste Importkette (auch dynamische Importe) von `start` zu einem verbotenen Paket oder Modul, sonst null. */
function verbotenerWeg(start: string): string[] | null {
  const anfang = path.join(ROOT, start);
  const gesehen = new Set([anfang]);
  const schlange: string[][] = [[anfang]];
  while (schlange.length > 0) {
    const kette = schlange.shift()!;
    const datei = kette.at(-1)!;
    for (const ziel of valueImports(readFileSync(datei, 'utf8')) as string[]) {
      const lokal = aufloesen(datei, ziel);
      const name = lokal ? path.relative(ROOT, lokal) : ziel;
      if (VERBOTEN.some((v) => name === v || name.startsWith(`${v}/`) || name.startsWith(`${v}.`))) {
        return [...kette.map((d) => path.relative(ROOT, d)), name];
      }
      if (lokal && !gesehen.has(lokal)) {
        gesehen.add(lokal);
        schlange.push([...kette, lokal]);
      }
    }
  }
  return null;
}

describe('Seitenschale: gemeinsames Client-Bündel ohne tailwind-merge (E-031, LCP)', () => {
  it('jeder Client-Teil der Schale ist ein Client-Modul und erreicht weder tailwind-merge noch zod noch SITE_CONFIG', () => {
    for (const datei of SCHALE) {
      expect(isClientModule(readFileSync(path.join(ROOT, datei), 'utf8')), datei).toBe(true);
      expect(verbotenerWeg(datei), datei).toBeNull();
    }
  });

  it('der Rohrakzent der Bewerbungsleiste kommt ohne cn() aus', () => {
    expect(readFileSync(path.join(ROOT, 'components/site/StickyApplyBarClient.tsx'), 'utf8')).toContain(
      "import { RohrAkzent } from '@/components/zeichnung/RohrAkzent';",
    );
    expect(valueImports(readFileSync(path.join(ROOT, 'components/zeichnung/RohrAkzent.tsx'), 'utf8'))).toEqual(['./zeichnung.module.css']);
  });

  it('der Wächter findet den Weg über cn(): die Prüfung greift', () => {
    expect(verbotenerWeg('components/ui/ToastCard.tsx')).toEqual([
      'components/ui/ToastCard.tsx',
      'components/ui/IconButton.tsx',
      'lib/utils/cn.ts',
      'tailwind-merge',
    ]);
  });
});
