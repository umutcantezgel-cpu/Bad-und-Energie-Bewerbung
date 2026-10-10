import { readFileSync } from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../../..');
const PROSE_CSS = path.join(ROOT, 'components/ui/prose.css');
const lies = (datei: string) => readFileSync(path.join(ROOT, datei), 'utf8');
const ohneKommentare = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** prose.css wie im Build durch Tailwind (optimiert, nicht verkleinert), Klassen nur aus Prose.tsx. */
async function baue(): Promise<string> {
  const ergebnis = await postcss([tailwind({ optimize: { minify: false } })]).process(readFileSync(PROSE_CSS, 'utf8'), { from: PROSE_CSS });
  return ergebnis.css;
}

/** Inhalt eines Blocks auf oberster Ebene (die schließende Klammer steht in Spalte 0). */
const block = (css: string, kopf: string) => css.match(new RegExp(`^${kopf} \\{\\n([\\s\\S]*?)\\n\\}$`, 'm'))?.[1] ?? '';

describe('Prose-Stile im eigenen Blatt (V6-A1-CSS)', () => {
  it('das globale Blatt lädt weder das Typography-Plugin noch die prose-Farben', () => {
    const globals = ohneKommentare(lies('app/globals.css'));
    expect(globals).not.toMatch(/@plugin\s+"@tailwindcss\/typography"/);
    expect(globals).not.toMatch(/@utility\s+prose\b/);
  });

  it('nur Prose.tsx importiert prose.css', () => {
    expect(lies('components/ui/Prose.tsx')).toMatch(/^import '\.\/prose\.css';$/m);
  });

  it('erzeugt prose und alle prose-*-Varianten aus Prose.tsx in der Ebene components, mit den Farben der Rollen', async () => {
    const css = await baue();
    const components = block(css, '@layer components');
    expect(components).toMatch(/^\s*\.prose \{/m);
    expect(components).toMatch(/--tw-prose-body: var\(--ink\);/);
    expect(components).toMatch(/--tw-prose-headings: var\(--brand\);/);
    // jede prose-Variante der Komponente steht als Regel im Blatt (sonst fehlte sie still)
    const varianten = [...new Set(lies('components/ui/Prose.tsx').match(/\bprose-[a-z0-9]+:[\w:-]+/g) ?? [])];
    expect(varianten.length).toBeGreaterThan(10);
    for (const klasse of varianten) {
      expect(components, klasse).toContain(`.${klasse.replaceAll(':', '\\:')}`);
    }
    // ausserhalb von components keine Regeln: nur Ebenenfolge, @property und die properties-Ersatzwerte
    const rest = css.replace(components, '').replace(block(css, '@layer properties'), '');
    expect(rest).not.toMatch(/\.prose|\.max-w|\.text-/);
    expect(rest).not.toMatch(/@layer (theme|base|utilities) \{/);
  });

  it('legt die Ebenenfolge vorn fest, auch wenn das Blatt vor dem globalen lädt', async () => {
    const css = await baue();
    const folge = [...css.matchAll(/@layer ([\w, ]+)[;{]/g)].map((m) => m[1].trim());
    expect(folge).toEqual(['properties', 'theme, base', 'components', 'utilities']);
  });
});
