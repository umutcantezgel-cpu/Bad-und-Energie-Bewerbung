import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { MOTION_IDS } from '../../../lib/motion/register';
import {
  BUERO_DATEI,
  BUERO_MARKE,
  CURSOR_DATEI,
  DAUER_CSS,
  ENDLOS_ERLAUBT,
  WAERME_ROLLEN_ERLAUBT,
  bueroBlockAb,
  checkCursor,
  checkEndlos,
  checkWaermeRollen,
  checkLine,
  checkMotionLine,
  endlosIn,
  motionIdsIn,
  numericMotion,
  offScaleSpacing,
  parseMotionIds,
  REGISTER_FILE,
} from '../check-design-tokens.mjs';

const ROOT = path.resolve(__dirname, '../../..');
const ids = (line: string, file = 'components/x.tsx') => checkLine(line, file).map((f: { rule: { id: string } }) => f.rule.id);

describe('check-design-tokens: rules (strict, G7)', () => {
  it('keeps the existing bans', () => {
    expect(ids('<p className="text-[13px]">')).toEqual(['arbitrary-text']);
    expect(ids('<span className="font-mono">')).toEqual(['font-mono']);
    expect(ids('<span className="uppercase">')).toEqual(['uppercase']);
    expect(ids('<b className="font-extrabold">')).toEqual(['heavy-weight']);
    expect(ids('<i className="animate-pulse">')).toEqual(['loud-animation']);
    expect(ids('<div className="bg-[#fff]">')).toContain('hex-in-class');
    expect(ids('<div className="bg-slate-100">')).toEqual(['raw-palette']);
    expect(ids('<div className="text-navy-900">')).toEqual(['raw-palette']);
    expect(ids('<div className="bg-white">')).toEqual(['raw-white-black']);
    expect(ids('<div className="shadow-[0_0_8px_red]">')).toEqual(['arbitrary-shadow']);
    expect(ids('<div className="backdrop-blur">')).toEqual(['glass']);
    // Seit R4-SHELL-01 hat auch der Kopf kein Glas mehr: keine Ausnahme.
    expect(ids('<div className="backdrop-blur">', 'components/site/HeaderBar.tsx')).toEqual(['glass']);
  });

  it('adds the KERN 1.0 bans', () => {
    expect(ids('<span className="font-serif">')).toEqual(['font-mono']);
    expect(ids('<span className="font-[Arial]">')).toEqual(['arbitrary-font']);
    expect(ids('<div className="duration-[350ms] ease-[cubic-bezier(0,0,1,1)] delay-[90ms]">')).toEqual([
      'arbitrary-motion',
      'arbitrary-motion',
      'arbitrary-motion',
    ]);
    expect(ids("style={{ color: 'var(--p-rot)' }}")).toEqual(['primitive-var']);
    expect(ids('<div className="bg-(--p-wand)">')).toEqual(['primitive-var']);
    expect(ids('<div className="shadow-sm">')).toEqual(['extra-shadow']);
    expect(ids('<div className="rounded-2xl">')).toEqual(['extra-radius']);
    expect(ids('<div className="rounded-t-[7px]">')).toEqual(['extra-radius']);
    expect(ids('<img className="dark:invert dark:brightness-0">')).toEqual(['recolor-filter', 'recolor-filter']);
  });

  it('knows the new semantic utilities', () => {
    const allowed = [
      '<span className="font-mass text-title-2 text-brand">',
      '<span className="text-etikett text-ink-2">',
      '<h1 className="text-display text-brand">',
      '<p className="text-numeral">',
      '<path className="stroke-vorlauf" />',
      '<path className="stroke-ruecklauf" />',
      '<div className="bg-waerme bg-wand rounded-1 rounded-2 rounded-3 rounded-voll shadow-lg">',
      '<a className="bg-accent hover:bg-accent-hover active:bg-accent-press">',
      '<div className="transition duration-d2 ease-aus">',
      '<div className="backdrop:backdrop-brightness-50">',
      '<span className="bg-plakette">',
      '<h1 className="text-plakat text-brand">',
      '<a className="ziffer font-bold">06441 12345</a>',
      '<time className="ziffer">13:30</time>',
      '<button data-motion="druck" className="bg-accent active:bg-accent-press">',
    ];
    for (const line of allowed) expect(ids(line), line).toEqual([]);
  });

  it('honours design-allow and comment-only lines', () => {
    expect(ids('<span className="uppercase"> // design-allow: Kürzel in Versalien')).toEqual([]);
    expect(ids('  // font-mono is banned')).toEqual([]);
  });
});

describe('check-design-tokens: motion register (K-009)', () => {
  const known = new Set<string>(MOTION_IDS);

  it('reads the ids from lib/motion/register.ts', () => {
    const source = readFileSync(path.join(ROOT, REGISTER_FILE), 'utf8');
    expect(parseMotionIds(source)).toEqual([...MOTION_IDS]);
    expect(() => parseMotionIds('export const X = 1;')).toThrow(/MOTION_IDS not found/);
  });

  it('finds literal ids in JSX, objects and CSS selectors', () => {
    expect(motionIdsIn('<path data-motion="radius-einrasten" />').map((m: { id: string }) => m.id)).toEqual(['radius-einrasten']);
    expect(motionIdsIn("<g data-motion={'luft'}>").map((m: { id: string }) => m.id)).toEqual(['luft']);
    expect(motionIdsIn("{ 'data-motion': 'druck' }").map((m: { id: string }) => m.id)).toEqual(['druck']);
    expect(motionIdsIn('.auftakt [data-motion="waerme"], [data-motion=pfeile] {').map((m: { id: string }) => m.id)).toEqual([
      'waerme',
      'pfeile',
    ]);
    expect(motionIdsIn('<g data-motion={id}>')).toEqual([]);
  });

  it('flags ids that are missing from the register', () => {
    expect(checkMotionLine('<path data-motion="radius-einrasten" />', known)).toEqual([]);
    // E-027: die Uhr auf 13:30 ist aus dem Register gestrichen
    expect(checkMotionLine('<path data-motion="uhr" />', known)).toHaveLength(1);
    const findings = checkMotionLine('<div data-motion="konfetti" />', known);
    expect(findings).toHaveLength(1);
    expect(findings[0].rule.id).toBe('motion-register');
    expect(findings[0].token).toBe('data-motion="konfetti"');
    expect(checkMotionLine('[data-motion="laufband"] { animation: x }', known)).toHaveLength(1);
    expect(checkMotionLine('<div data-motion="konfetti" /> {/* design-allow: Testseite */}', known)).toEqual([]);
  });
});

describe('check-design-tokens: endlos (E-029, K-009)', () => {
  const regel = (source: string, file: string) => checkEndlos(source, file).map((f: { token: string; line: number }) => `${f.line}:${f.token}`);

  it('erlaubt Schleifen nur in den Dateien der Ausnahmeliste, jede mit Grund', () => {
    expect(Object.keys(ENDLOS_ERLAUBT).sort()).toEqual(
      [DAUER_CSS, 'components/ui/eingabe.module.css', 'components/apply/thanks/FollowUpForm.tsx'].sort(),
    );
    for (const [datei, grund] of Object.entries(ENDLOS_ERLAUBT)) {
      expect(String(grund).length, datei).toBeGreaterThan(30);
      expect(existsSync(path.join(ROOT, datei)), datei).toBe(true);
    }
    expect(DAUER_CSS).toBe('components/zeichnung/bewegung/dauer.module.css');
  });

  it('findet infinite in CSS, inline styles, animate-spin und WAAPI Infinity überall sonst, auch mit design-allow', () => {
    expect(regel('.a { animation: x 1s linear infinite; }', 'components/home/x.module.css')).toEqual(['1:infinite']);
    expect(regel('.a {\n  animation-iteration-count: infinite;\n}', 'app/x.css')).toEqual(['2:infinite']);
    expect(regel("<div style={{ animation: 'x 1s infinite' }} />", 'components/x.tsx')).toEqual(['1:infinite']);
    expect(regel('<span className="animate-spin" /> // design-allow: Lader', 'components/x.tsx')).toEqual(['1:animate-spin']);
    expect(regel('el.animate(frames, { iterations: Infinity });', 'lib/x.ts')).toEqual(['1:iterations: Infinity']);
    // Kommentare zählen nicht, Wortteile auch nicht
    expect(regel('/* kein infinite hier */ .a { color: red }', 'components/x.module.css')).toEqual([]);
    expect(regel('// infinite\nconst infiniteScroll = 1;', 'components/x.tsx')).toEqual([]);
    expect(regel('.a { animation: laufen 1s infinite; }', 'components/ui/eingabe.module.css')).toEqual([]);
    expect(regel('<span className="size-4 animate-spin" />', 'components/apply/thanks/FollowUpForm.tsx')).toEqual([]);
  });

  it('dauer.module.css: infinite nur unter prefers-reduced-motion: no-preference und [data-dauer="an"]', () => {
    const gut = '@media (prefers-reduced-motion: no-preference) {\n  .bereich[data-dauer="an"] .rotor {\n    animation: r 1s linear infinite;\n  }\n}';
    expect(regel(gut, DAUER_CSS)).toEqual([]);
    const ohneMedia = '.bereich[data-dauer="an"] .rotor { animation: r 1s linear infinite; }';
    expect(regel(ohneMedia, DAUER_CSS)).toEqual(['1:infinite']);
    const ohneSchalter = '@media (prefers-reduced-motion: no-preference) {\n  .rotor { animation: r 1s linear infinite; }\n}';
    expect(regel(ohneSchalter, DAUER_CSS)).toEqual(['2:infinite']);
    const falscherWert = '@media (prefers-reduced-motion: no-preference) {\n  .bereich[data-dauer="aus"] .rotor { animation: r 1s infinite; }\n}';
    expect(regel(falscherWert, DAUER_CSS)).toEqual(['2:infinite']);
    const reduziert = '@media (prefers-reduced-motion: reduce) {\n  .bereich[data-dauer="an"] .rotor { animation: r 1s infinite; }\n}';
    expect(regel(reduziert, DAUER_CSS)).toEqual(['2:infinite']);
  });

  it('die echten Dateien bestehen: dauer.module.css hält die Regel, der Einstieg bleibt ohne Schleife', () => {
    const dauer = readFileSync(path.join(ROOT, DAUER_CSS), 'utf8');
    expect(dauer).toMatch(/\binfinite\b/);
    expect(checkEndlos(dauer, DAUER_CSS)).toEqual([]);
    const einstieg = readFileSync(path.join(ROOT, 'components/home/einstieg/einstieg.module.css'), 'utf8');
    expect(endlosIn(einstieg.replace(/\/\*[\s\S]*?\*\//g, ''))).toEqual([]);
  });
});

/** Alle Quelltexte, die der Guard prüft (app, components, lib; ohne Tests). */
function quellen(): string[] {
  const out: string[] = [];
  const lauf = (dir: string) => {
    for (const name of readdirSync(path.join(ROOT, dir))) {
      if (name === 'node_modules' || name === '.next' || name === '__tests__' || name.startsWith('.')) continue;
      const rel = `${dir}/${name}`;
      if (statSync(path.join(ROOT, rel)).isDirectory()) lauf(rel);
      else if (/\.(?:tsx?|css)$/.test(name) && !/\.(?:test|spec)\.tsx?$/.test(name)) out.push(rel);
    }
  };
  for (const dir of ['app', 'components', 'lib']) lauf(dir);
  return out;
}

describe('check-design-tokens: waerme-rollen (E-031, K-006)', () => {
  const regel = (source: string, file: string) => checkWaermeRollen(source, file).map((f: { line: number; token: string; rule: { id: string } }) => `${f.line}:${f.token}:${f.rule.id}`);

  it('erlaubt die Wärmerampe nur in theme.css, waerme.module.css, waermefront.module.css und im Büro-Block, jede mit Grund', () => {
    expect(Object.keys(WAERME_ROLLEN_ERLAUBT).sort()).toEqual(
      ['app/styles/theme.css', 'components/zeichnung/waerme/waerme.module.css', 'components/site/waermefront/waermefront.module.css'].sort(),
    );
    for (const grund of Object.values(WAERME_ROLLEN_ERLAUBT)) expect(String(grund).length).toBeGreaterThan(20);
    for (const datei of Object.keys(WAERME_ROLLEN_ERLAUBT)) expect(regel('.a { fill: var(--waerme-2); }', datei)).toEqual([]);
    expect(BUERO_DATEI).toBe('components/themen/themen.module.css');
    expect(BUERO_MARKE).toBe('/* ═══ Büro-Block (E-031)');
  });

  it('findet --waerme-0…4 überall sonst, in CSS und Code, auch mit design-allow; Kommentare und andere Namen zählen nicht', () => {
    expect(regel('.a { fill: var(--waerme-4); }', 'components/home/x.module.css')).toEqual(['1:--waerme-4:waerme-rollen']);
    expect(regel("<g style={{ fill: 'var(--waerme-0)' }} /> // design-allow: Test", 'components/x.tsx')).toEqual(['1:--waerme-0:waerme-rollen']);
    expect(regel(".a {\n  --b: var(--waerme-1);\n}", 'app/globals.css')).toEqual(['2:--waerme-1:waerme-rollen']);
    expect(regel('/* --waerme-2 */ .a { fill: var(--waerme); }', 'components/x.module.css')).toEqual([]);
    expect(regel('// --waerme-3 nur im Kommentar\nconst a = 1;', 'lib/x.ts')).toEqual([]);
    expect(regel('.a { --waerme-10: 1; --p-waerme-0: 2; }', 'components/x.module.css')).toEqual([]);
  });

  it('im Büro-Block von themen.module.css erlaubt, davor nicht', () => {
    const quelle = `.kasten { fill: var(--waerme-1); }\n${BUERO_MARKE}: Leitstelle ═══ */\n.bueroPlan { fill: var(--waerme-2); }\n`;
    expect(bueroBlockAb(quelle)).toBe(2);
    expect(regel(quelle, BUERO_DATEI)).toEqual(['1:--waerme-1:waerme-rollen']);
    // Ohne Marke kein Block; dieselbe Marke in einer anderen Datei hilft nicht
    expect(regel(quelle.replace(BUERO_MARKE, '/* ═══ Büro'), BUERO_DATEI)).toHaveLength(2);
    expect(regel(quelle, 'components/jobs/x.module.css')).toHaveLength(2);
    expect(bueroBlockAb('.a {}')).toBe(Infinity);
  });

  it('die echten Dateien bestehen; theme.css führt die Rampe', () => {
    const dateien = quellen();
    expect(dateien.length).toBeGreaterThan(300);
    for (const datei of dateien) expect(checkWaermeRollen(readFileSync(path.join(ROOT, datei), 'utf8'), datei), datei).toEqual([]);
    expect(readFileSync(path.join(ROOT, 'app/styles/theme.css'), 'utf8')).toMatch(/--waerme-4: var\(--p-waerme-4\);/);
  });
});

describe('check-design-tokens: cursor (E-031)', () => {
  const regel = (source: string, file: string) => checkCursor(source, file).map((f: { line: number; rule: { id: string } }) => `${f.line}:${f.rule.id}`);

  it('Bild-Cursor nur in app/globals.css', () => {
    expect(CURSOR_DATEI).toBe('app/globals.css');
    const gut = '@media (hover: hover) and (pointer: fine) {\n  :root { cursor: url(/cursor/zeiger.svg) 4 3, auto; }\n}';
    expect(regel(gut, CURSOR_DATEI)).toEqual([]);
    expect(regel(gut, 'components/site/kopf/kopf.module.css')).toEqual(['2:cursor']);
    expect(regel('.a { cursor: image-set("/x.svg" 1x, "/x2.svg" 2x) 4 3, auto; }', 'app/styles/theme.css')).toEqual(['1:cursor']);
    expect(regel("<a style={{ cursor: 'url(/hand.svg) 4 3, pointer' }} />", 'components/x.tsx')).toEqual(['1:cursor']);
    expect(regel('<a className="cursor-[url(/hand.svg),pointer]" />', 'components/x.tsx')).toEqual(['1:cursor']);
    // Auch der Umweg über eine Variable mit einer Datei aus /cursor/
    expect(regel('.a { --zeiger: url(/cursor/hand.svg); }', 'components/x.module.css')).toEqual(['1:cursor']);
    expect(regel("const bild = '/cursor/hand-2x.svg';", 'lib/x.ts')).toEqual(['1:cursor']);
  });

  it('Schlüsselwort-Cursor bleiben überall erlaubt; Kommentare zählen nicht', () => {
    for (const ok of ['.a { cursor: pointer; }', '.b { cursor: not-allowed; }', '<button className="cursor-pointer" />', '/* cursor: url(/x.svg) */ .c { color: red; }']) {
      expect(regel(ok, 'components/x.module.css'), ok).toEqual([]);
    }
  });

  it('die echten Dateien bestehen', () => {
    for (const datei of quellen()) expect(checkCursor(readFileSync(path.join(ROOT, datei), 'utf8'), datei), datei).toEqual([]);
  });
});

describe('check-design-tokens: notes (not blocking)', () => {
  it('lists spacing off the 11-step scale', () => {
    expect(offScaleSpacing('<div className="p-4 gap-6 mt-12 px-32 -mx-2 lg:py-20">')).toEqual([]);
    expect(offScaleSpacing('<div className="p-5 gap-1.5 mt-10 -ml-0.5">').map((n: { token: string }) => n.token)).toEqual([
      'p-5',
      'gap-1.5',
      'mt-10',
      '-ml-0.5',
    ]);
    expect(offScaleSpacing('<div className="size-5 w-10 h-14">')).toEqual([]);
  });

  it('lists numeric durations and delays', () => {
    expect(numericMotion('<div className="duration-500 delay-150 duration-d2">').map((n: { token: string }) => n.token)).toEqual([
      'duration-500',
      'delay-150',
    ]);
  });
});
