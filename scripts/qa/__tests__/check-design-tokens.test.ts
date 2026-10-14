import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { MOTION_IDS } from '../../../lib/motion/register';
import {
  DAUER_CSS,
  ENDLOS_ERLAUBT,
  checkEndlos,
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
