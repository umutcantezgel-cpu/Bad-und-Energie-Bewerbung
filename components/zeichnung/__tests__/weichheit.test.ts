import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FaqSection } from '@/components/home/FaqSection';
import { PartnerSaeulen } from '@/components/home/betrieb/PartnerSaeulen';
import { Ausstattung } from '@/components/home/vorteile/Ausstattung';
import { Zusagen } from '@/components/home/vorteile/Zusagen';
import { PackageList } from '@/components/jobs/PackageList';
import { RohrAkzent } from '..';

/**
 * Weichheit (E-031, KERN 1.3 K-003.2, K-008): harte Stellen glatt geschliffen, nur mit den vorhandenen Tokens (Radien
 * 4 · 12 · 24 · 999, ein Schatten, kein Glas, kein Glow, kein Verlauf). Die Rohrakzente kehren zurück, aber nur an
 * freigegebenen Stellen, normgerecht und still.
 */

const ROOT = path.resolve(__dirname, '../../..');
const quelle = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const ohneKommentare = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const html = (element: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(element);

/** Rumpf der ersten Regel mit genau diesem Selektor (ohne @media). */
function regel(css: string, selektor: string): string {
  const esc = selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = ohneKommentare(css).match(new RegExp(`(?:^|\\n)${esc} \\{([^}]*)\\}`));
  expect(m, selektor).not.toBeNull();
  return m![1];
}

/** Deklarationen eines Regelrumpfs als Tabelle. */
const deklarationen = (rumpf: string) =>
  Object.fromEntries(
    rumpf
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]),
  );

function dateien(dir: string, endung: RegExp, out: string[] = []): string[] {
  for (const e of readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (['node_modules', '.next', '__tests__'].includes(e.name) || e.name.startsWith('.')) continue;
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) dateien(rel, endung, out);
    else if (endung.test(e.name)) out.push(rel);
  }
  return out;
}

const ZEICHNUNG_CSS = 'components/zeichnung/zeichnung.module.css';

describe('Rohrakzent statt harter 3-px-Oberkanten (E-031)', () => {
  const akzent = deklarationen(regel(quelle(ZEICHNUNG_CSS), '.rohrakzent'));

  it('ein Rohrstück in der Linienart leitung: 3 px, runde Enden, Markenrolle, kürzer als die Karte, liegt auf der Oberkante', () => {
    expect(akzent).toEqual({
      position: 'absolute',
      top: '0',
      left: '0',
      width: 'min(var(--a-8), 100%)',
      height: 'var(--m-leitung)',
      'border-radius': 'var(--radius-voll)',
      'background-color': 'var(--brand)',
      'pointer-events': 'none',
    });
    const span = html(createElement(RohrAkzent));
    expect(span).toMatch(/^<span aria-hidden="true" data-zeichnung="rohrakzent" class="[^"]*rohrakzent[^"]*"><\/span>$/);
    expect(html(createElement(RohrAkzent, { className: 'lg:hidden' }))).toMatch(/class="[^"]*rohrakzent[^"]* lg:hidden"/);
  });

  it('wo eine Liste kein <span> trägt, zeichnet ein Pseudoelement dieselbe Form (Wärmepumpen: Partnerstufen)', () => {
    const themen = quelle('components/themen/themen.module.css');
    expect(deklarationen(regel(themen, '.partner::before'))).toEqual({ content: '""', ...akzent });
    expect(regel(themen, '.partner')).toMatch(/position: relative;/);
  });

  it('kein Behälter trägt mehr eine harte 3-px-Oberkante in der Markenrolle (TSX und CSS)', () => {
    const treffer: string[] = [];
    for (const datei of [...dateien('app', /\.(tsx|css)$/), ...dateien('components', /\.(tsx|css)$/)]) {
      const text = datei.endsWith('.css') ? ohneKommentare(quelle(datei)) : quelle(datei);
      for (const zeile of text.split('\n')) {
        const tsx = /border-t-(?:\(length:--m-(?:strich|leitung)\)|\[length:var\(--m-(?:strich|leitung)\)\]|3\b)/.test(zeile) && /(?<![\w-])border-brand\b/.test(zeile);
        const css = /border-top:\s*var\(--m-(?:strich|leitung)\)\s+solid\s+var\(--brand\)/.test(zeile);
        if (tsx || css) treffer.push(`${datei}: ${zeile.trim()}`);
      }
    }
    // Die Skala der Entfernungsleiste ist ein Maßstab (Zeichnung), keine Kante eines Behälters
    expect(treffer).toEqual([`${ZEICHNUNG_CSS}: border-top: var(--m-strich) solid var(--brand);`]);
    expect(regel(quelle(ZEICHNUNG_CSS), '.lwSkala')).toMatch(/border-top: var\(--m-strich\) solid var\(--brand\);/);
    // Die Fehlerseite (auf jeder Seite geladen, ohne CSS-Modul) zeichnet dieselbe Form mit Utilities
    expect(quelle('app/error.tsx')).toContain(
      'relative flex flex-wrap gap-x-8 gap-y-1 pt-4 before:pointer-events-none before:absolute before:top-0 before:left-0 before:h-(--m-leitung) before:w-16 before:rounded-voll before:bg-brand',
    );
  });

  it('der Behälter ist positioniert und behält seinen Innenabstand; das Stück steht als erstes Kind', () => {
    const faelle = [
      html(createElement(FaqSection)),
      html(createElement(Zusagen)),
      html(createElement(Ausstattung)),
      html(createElement(PartnerSaeulen)),
      html(createElement(PackageList, { items: [{ label: 'Ort', text: 'Wetzlar' }] })),
    ];
    for (const h of faelle) {
      const stuecke = [...h.matchAll(/<(\w+)( class="([^"]*)")?[^>]*><span aria-hidden="true" data-zeichnung="rohrakzent"/g)];
      expect(stuecke.length, h.slice(0, 80)).toBe(1);
      expect(stuecke[0][3] ?? '', h.slice(0, 80)).toMatch(/(?:^|\s)relative(?:\s|$)/);
    }
    // In den CSS-Modulen: die Listeneinträge mit Rohrakzent sind positioniert
    const themen = quelle('components/themen/themen.module.css');
    for (const k of ['.kasten', '.kaestchen', '.position', '.saeule']) expect(regel(themen, k), k).toMatch(/position: relative;/);
    expect(regel(quelle('components/einsatzgebiet/einsatzgebiet.module.css'), '.fakt')).toMatch(/position: relative;/);
    expect(regel(quelle('components/site/fuss/leiste.module.css'), '.innen')).toMatch(/position: relative;/);
  });

  it('Bewerbungsleiste: Haarlinie statt 3-px-Kante, die Leitungen beginnen rund unter der Oberkante', () => {
    const leiste = quelle('components/site/fuss/leiste.module.css');
    expect(regel(leiste, '.leiste')).toMatch(/border-top: 1px solid var\(--line\);/);
    expect(regel(leiste, '.leitung')).toMatch(/border-radius: var\(--radius-voll\) var\(--radius-voll\) 0 0;/);
    expect(quelle('components/site/StickyApplyBarClient.tsx')).toContain('<RohrAkzent className={styles.akzent} />');
    // Kopf beim Scrollen: dieselbe Form, im Seitenrand statt von Kante zu Kante
    const kopf = regel(quelle('components/site/kopf/kopf.module.css'), '.kopf[data-scrolled]::after');
    expect(kopf).toMatch(/inset-inline: var\(--rand\);/);
    expect(kopf).toMatch(/border-radius: var\(--radius-voll\);/);
  });
});
