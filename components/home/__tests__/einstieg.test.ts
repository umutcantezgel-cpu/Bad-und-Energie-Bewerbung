import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { APPLY_PATH, PRIMARY_CTA_ATTR } from '@/components/site/nav';
import { MOTION_IDS } from '@/lib/motion/register';
import { HERO, HERO_STATS } from '../content';
import { Hero } from '../Hero';
import { KREISLAUF_SATZ, vertrauenspunkte } from '../einstieg/einstieg-text';
import { WAERMEBAENDER } from '../einstieg/waermefeld';

const DIR = path.resolve(__dirname, '..');
const EINSTIEG = path.join(DIR, 'einstieg');
const quelle = (datei: string) => readFileSync(datei, 'utf8');
const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/­/g, '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ');

const render = (now: Date) => renderToStaticMarkup(createElement(Hero, { now }));
const html2026 = render(new Date('2026-10-09T09:00:00Z'));
const html2027 = render(new Date('2027-01-01T08:00:00Z'));
const text2026 = plain(html2026);

/** Auftakt-Kennungen des Einstiegs nach Variante 3 (R3-EINSTIEG-V3): Vorlauf vom Knopf ins Haus, Wärme, Rücklauf, Uhr. */
const AUFTAKT = ['luefter', 'erdleitung', 'erdleitung-d', 'vorlauf-haus', 'waerme', 'ruecklauf-haus', 'uhr'];

describe('Hero / Einstieg (R3-HOME-01)', () => {
  it('genau eine h1 mit HERO.title und HERO.titleSecondLine im Wortlaut, Abschnitt zeigt darauf', () => {
    expect(html2026.match(/<h1\b/g)).toHaveLength(1);
    const h1 = html2026.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)!;
    expect(h1[0]).toContain('id="hero-title"');
    expect(plain(h1[1]).trim()).toBe(`${HERO.title} ${HERO.titleSecondLine}`);
    expect(html2026).toMatch(/^<section aria-labelledby="hero-title"/);
    expect(text2026).toContain(HERO.lead);
    expect(text2026).toContain(HERO.microcopy.replace(/ /g, ' '));
  });

  it('E-START-002: im Jubiläumsjahr „100 Jahre Meisterbetrieb (1926–2026)“ im Einstieg, ab 2027 „Seit 1926 · Wetzlar“', () => {
    expect(text2026).toContain('100 Jahre Meisterbetrieb (1926–2026)');
    expect(text2026).not.toContain(HERO.eyebrow);
    const text2027 = plain(html2027);
    expect(text2027).not.toContain('100 Jahre');
    expect(text2027).toContain(HERO.eyebrow);
    expect(html2027).not.toContain('data-bis=');
  });

  it('E-023: „100 Jahre“ steht im Einstieg genau einmal (Ortsmarke); die Jahres-Maßkette zeigt nur 1926 … 2026', () => {
    expect(text2026.match(/100 Jahre/g)).toHaveLength(1);
    const kette = html2026.match(/<span[^>]*data-bis="2026-12-31"[^>]*>([\s\S]*?)<\/span>/)!;
    expect(kette[0]).toContain('aria-hidden="true"');
    expect(plain(kette[1]).trim()).toBe('2026');
  });

  it('die Hauptaktion „Jetzt bewerben“ führt nach /bewerbung und liegt im Bereich der Hauptaktion (StickyApplyBar)', () => {
    const bereich = html2026.slice(html2026.indexOf(`${PRIMARY_CTA_ATTR}=""`));
    const aktion = bereich.match(/<a [^>]*>Jetzt bewerben/)![0];
    expect(aktion).toContain(`href="${APPLY_PATH}"`);
    expect(aktion).toContain('data-motion="druck"');
    expect(html2026.match(/href="\/bewerbung"/g)).toHaveLength(1);
    expect(html2026).toContain('href="#stellen"');
    expect(text2026).toContain('Offene Stellen ansehen');
  });

  it('zeigt die vier Maße aus HERO_STATS als echten Text (Liste), Wert und Name getrennt; die Zeichnung ist dekorativ', () => {
    for (const stat of HERO_STATS) {
      // Leerzeichen im DOM zwischen Wert und Name (Kopieren, Lesemodus): „13:30 Freitags Feierabend“
      expect(text2026).toContain(`${stat.value.replace(/\u00a0/g, ' ')} ${stat.label}`);
    }
    expect(html2026).toMatch(/<svg class="[^"]*" viewBox="0 0 800 800" aria-hidden="true" focusable="false" data-szene="einstieg">/);
    // Wärmebild (Variante 3): vier Isothermen, die Uhr im Giebel, Vorlauf und Rücklauf als Leitungen
    const szene = html2026.match(/<svg[^>]*data-szene="einstieg">([\s\S]*?)<\/svg>/)![1];
    expect(szene.match(/data-motion="waerme"/g)).toHaveLength(4);
    expect(szene.match(/data-motion="uhr"/g)!.length).toBeGreaterThanOrEqual(2);
    expect(szene).toContain('data-motion="vorlauf-haus"');
    expect(szene).toContain('data-motion="ruecklauf-haus"');
    // Etiketten-Kästchen der drei Gewerke und die Ablesung 13:30 sind Beiwerk der Zeichnung
    const marken = html2026.match(/<div class="[^"]*" aria-hidden="true">((?:(?!<\/div>)[\s\S])*Wärmepumpen[\s\S]*?)<\/div>/)!;
    for (const gewerk of ['Wärmepumpen', 'Heizungen', 'Bäder']) expect(plain(marken[1])).toContain(gewerk);
  });

  it('Bewegung: alle acht Auftakt-Kennungen an der Szene, nur Kennungen aus dem Register', () => {
    const ids = [...html2026.matchAll(/data-motion="([^"]+)"/g)].map((m) => m[1]);
    for (const id of AUFTAKT) expect(ids, id).toContain(id);
    for (const id of ids) expect(MOTION_IDS as readonly string[]).toContain(id);
    expect(ids).toContain('kreislauf-zeigen');
    expect(html2026).toContain('data-kreislauf="ruhe"');
  });

  it('„Kreislauf zeigen“ ist ein echter Knopf, bis zur Hydration unsichtbar (Platz bleibt), mit T-001 daneben', () => {
    const knopf = html2026.match(/<button[^>]*data-motion="kreislauf-zeigen"[^>]*>[\s\S]*?<\/button>/)![0];
    expect(knopf).toContain('type="button"');
    expect(plain(knopf)).toContain('Kreislauf zeigen');
    expect(knopf).not.toContain('aria-disabled');
    expect(knopf).toMatch(/class="[^"]*knopfWartet[^"]*"/);
    expect(text2026).toContain(KREISLAUF_SATZ);
  });

  it('ohne Skript bleibt keine leere Knopffläche: das CSS-Modul blendet den Knopf bei scripting: none aus', () => {
    const css = quelle(path.join(EINSTIEG, 'einstieg.module.css'));
    expect(css).toMatch(/@media \(scripting: none\) \{\s*\.knopf \{\s*display: none;/);
  });

  it('Vertrauenszeile: statische Liste mit allen Punkten, ohne Laufband und ohne Fernmontage (E-023)', () => {
    expect(text2026).not.toContain('Fernmontage');
    const liste = html2026.match(/<ul[^>]*data-vertrauenszeile=""[^>]*>([\s\S]*?)<\/ul>/)!;
    expect(liste[0]).toContain('aria-label="Betrieb und Partner"');
    const eintraege = [...liste[1].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => plain(m[1]));
    expect(eintraege).toEqual(vertrauenspunkte().map((p) => p.text.replace(/ /g, ' ')));
    expect(liste[0]).not.toMatch(/marquee|animate-/);
  });

  it('Rohrklammer an der Zweitzeile und alle Zeichnungen sind aria-hidden', () => {
    expect(html2026).toContain('data-zeichnung="rohrklammer"');
    // Innere SVGs (x/y = 100 %) liegen in einem aria-hidden-SVG; jedes äußere ist selbst dekorativ.
    const aeussere = html2026.match(/<svg\b(?![^>]* [xy]="100%")[^>]*>/g)!;
    expect(aeussere.length).toBeGreaterThanOrEqual(7);
    for (const svg of aeussere) expect(svg, svg).toMatch(/aria-hidden="true"/);
  });
});

describe('Einstieg: Quellregeln', () => {
  const dateien = [path.join(DIR, 'Hero.tsx'), ...readdirSync(EINSTIEG).filter((f) => /\.tsx?$/.test(f)).map((f) => path.join(EINSTIEG, f))];

  it('keine lucide-Importe, Icons aus components/icons; nur die Knopf-Insel ist Client-Komponente', () => {
    for (const datei of dateien) {
      const src = quelle(datei);
      expect(src, datei).not.toMatch(/lucide-react/);
      const client = /^['"]use client['"]/m.test(src);
      expect(client, datei).toBe(path.basename(datei) === 'KreislaufKnopf.tsx');
    }
  });

  it('die Client-Insel bleibt klein (≤ 3 KB Quelltext, nur React und das Kopfskript-Modul)', () => {
    const src = quelle(path.join(EINSTIEG, 'KreislaufKnopf.tsx'));
    expect(Buffer.byteLength(src)).toBeLessThanOrEqual(3 * 1024);
    const importe = [...src.matchAll(/from '([^']+)'/g)].map((m) => m[1]);
    expect(importe).toEqual(['react', '@/lib/motion/head-script']);
  });

  it('Desktop: der Vorlauf läuft per Ankerpositionierung vom Knopf zur Pumpe, ohne Anker entfällt er', () => {
    const css = quelle(path.join(EINSTIEG, 'einstieg.module.css')).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/\.bewerben \{[^}]*anchor-name: --einstieg-knopf;/);
    expect(css).toMatch(/\.bild \{[^}]*anchor-name: --einstieg-flaeche;/);
    const rohr = css.match(/\.rohrD \{[^}]*display: block;[^}]*\}/)![0];
    expect(rohr).toContain('left: calc(anchor(--einstieg-knopf right)');
    expect(rohr).toContain('top: calc(anchor(--einstieg-knopf center)');
    // Pumpenanschluss der Szene: y 676 von 800 = 124 Einheiten über der Falz der Fläche
    expect(rohr).toContain('bottom: calc(anchor(--einstieg-flaeche bottom) + 124 * var(--e)');
    expect(css).toMatch(/@supports not \(anchor-name: --a\) \{\s*\.rohrD \{\s*display: none !important;/);
  });

  it('Wärmebild: vier Bänder aus dem Wärmefeld, hell aus den Papier-Rollen, dunkel mit eigenen hellen Stufen', () => {
    expect(WAERMEBAENDER).toHaveLength(4);
    for (const band of WAERMEBAENDER) expect(band).toMatch(/^M[\d.\s-]+/);
    const css = quelle(path.join(EINSTIEG, 'einstieg.module.css')).replace(/\/\*[\s\S]*?\*\//g, '');
    const hell = css.match(/\.held \{([^}]*)\}/)![1];
    for (const rolle of ['--wb-1: var(--ruecklauf)', '--wb-2: var(--surface-2)', '--wb-3: var(--waerme)', '--wb-4: var(--surface)']) {
      expect(hell).toContain(rolle);
    }
    const dunkel = css.match(/@media screen and \(prefers-color-scheme: dark\) \{\s*\.held \{([^}]*)\}/)![1];
    for (const n of [1, 2, 3, 4]) expect(dunkel).toContain(`--wb-${n}:`);
    expect(dunkel).not.toMatch(/var\(--(?:surface-2|waerme)\)/);
  });

  it('CSS-Modul: keine Rohfarben, keine Primitiven, Bewegung nur über Tokens', () => {
    const css = quelle(path.join(EINSTIEG, 'einstieg.module.css')).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/--p-[a-z]/);
    expect(css).not.toMatch(/\b(?:rgb|hsl|oklch)a?\(/);
    expect(css).not.toMatch(/\d+ms\b/);
    expect(css).not.toMatch(/infinite/);
  });
});
