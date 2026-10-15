import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MOTION_IDS, MOTION_REGISTER } from '@/lib/motion/register';
import { SichtStart } from '../bewegung/SichtStart';
import { ABLAUF_BEREICH, DAUER_BEREICH, kennungenAusserhalb } from './bereich';

const ROOT = path.resolve(__dirname, '../../..');
/** Kennungen, die nur beim Sichtbarwerden laufen (kein anderer Auslöser): ihr Markup steht immer in SichtStart. */
const NUR_SICHT = MOTION_IDS.filter((id) => MOTION_REGISTER[id].ausloeser.join() === 'sicht');

describe('Sicht-Auftritte nur in einem Bereich mit data-ablauf (E-031)', () => {
  it('der Prüfer erkennt Kennungen außerhalb eines Bereichs, auch verschachtelt und mit mehreren Kennungen', () => {
    expect(kennungenAusserhalb('<div><svg data-motion="buero-ablauf"></svg></div>', ['buero-ablauf'], ABLAUF_BEREICH)).toEqual(['buero-ablauf']);
    expect(kennungenAusserhalb('<div data-ablauf="fertig"><p><svg data-motion="buero-ablauf"><path/></svg></p></div>', ['buero-ablauf'], ABLAUF_BEREICH)).toEqual([]);
    expect(kennungenAusserhalb('<div data-ablauf="fertig"></div><g data-motion="druck buero-ablauf"/>', ['buero-ablauf'], ABLAUF_BEREICH)).toEqual(['buero-ablauf']);
    expect(kennungenAusserhalb('<g data-ablauf="laeuft" data-motion="buero-ablauf"></g>', ['buero-ablauf'], ABLAUF_BEREICH)).toEqual([]);
    // Ein anderer Bereich zählt nicht
    expect(kennungenAusserhalb('<div data-dauer="aus"><i data-motion="buero-ablauf"></i></div>', ['buero-ablauf'], ABLAUF_BEREICH)).toEqual(['buero-ablauf']);
    expect(kennungenAusserhalb('<div data-dauer="aus"><i data-motion="rotor-dreht"></i></div>', ['rotor-dreht'], DAUER_BEREICH)).toEqual([]);
  });

  it('SichtStart ist ein solcher Bereich', () => {
    const m = renderToStaticMarkup(createElement(SichtStart, null, createElement('svg', { 'data-motion': 'buero-ablauf' })));
    expect(kennungenAusserhalb(m, ['buero-ablauf'], ABLAUF_BEREICH)).toEqual([]);
  });

  it('jede Datei mit einer reinen Sicht-Kennung setzt SichtStart ein (greift, sobald es eine gibt)', () => {
    expect(NUR_SICHT).toEqual(['buero-ablauf']);
    const treffer: string[] = [];
    const lauf = (dir: string) => {
      for (const name of readdirSync(dir)) {
        if (name === 'node_modules' || name === '__tests__' || name.startsWith('.')) continue;
        const p = path.join(dir, name);
        if (statSync(p).isDirectory()) lauf(p);
        else if (/\.tsx$/.test(name)) {
          const src = readFileSync(p, 'utf8');
          if (NUR_SICHT.some((id) => src.includes(`data-motion="${id}"`) || src.includes(`'${id}'`))) {
            treffer.push(path.relative(ROOT, p));
            expect(src, p).toMatch(/<SichtStart\b/);
          }
        }
      }
    };
    for (const dir of ['app', 'components']) lauf(path.join(ROOT, dir));
    // Jede gefundene Datei ist oben geprüft; vor Paket W3 setzt noch keine die Büro-Szenen ein
    for (const t of treffer) expect(readFileSync(path.join(ROOT, t), 'utf8'), t).toMatch(/SichtStart/);
  });
});
