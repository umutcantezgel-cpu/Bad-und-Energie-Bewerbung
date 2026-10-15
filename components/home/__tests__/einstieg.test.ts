import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { APPLY_PATH, PRIMARY_CTA_ATTR } from '@/components/site/nav';
import { DAUER_IDS, MOTION_IDS } from '@/lib/motion/register';
import { COMPRESS_AW_S } from '@/lib/zeichnung/geraete/compress-aw-s';
import { HAUSSCHNITT_RAHMEN, HEIZKOERPER_LAGE, KNOPF_LEITUNG, LEITUNGEN } from '@/lib/zeichnung/szenen/hausschnitt';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { HERO, HERO_STATS, heroLead, heroStats, heroZweitzeile } from '../content';
import { Hero } from '../Hero';
import { EINZELHEIT_TITEL, KREISLAUF_SATZ, RADIUS_ETIKETT, vertrauenspunkte } from '../einstieg/einstieg-text';

const DIR = path.resolve(__dirname, '..');
const EINSTIEG = path.join(DIR, 'einstieg');
const quelle = (datei: string) => readFileSync(datei, 'utf8');
const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/­/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ');

const render = (now: Date) => renderToStaticMarkup(createElement(Hero, { now }));
const html2026 = render(new Date('2026-10-09T09:00:00Z'));
const live2026 = getActiveJobs().filter((job) => isJobLive(job, new Date('2026-10-09T09:00:00Z')));
const html2027 = render(new Date('2027-01-01T08:00:00Z'));
const text2026 = plain(html2026);
const szene = html2026.match(/<svg[^>]*data-szene="einstieg">([\s\S]*?)<\/svg>(?=<span)/)![1];

/** Auftakt-Kennungen des Einstiegs (E-029): Vorlauf aus der Anlage, Rücklauf, Leitung in den Knopf, Pfeile, 35 km. */
const AUFTAKT = ['vorlauf-haus', 'ruecklauf-haus', 'erdleitung', 'erdleitung-d', 'pfeile', 'radius-einrasten'];

describe('Hero / Einstieg (R3-HOME-01, Technische Zeichnung 2.0)', () => {
  it('genau eine h1 mit HERO.title und der Zweitzeile für die live Stellen im Wortlaut, Abschnitt zeigt darauf', () => {
    expect(html2026.match(/<h1\b/g)).toHaveLength(1);
    const h1 = html2026.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)!;
    expect(h1[0]).toContain('id="hero-title"');
    // Sammelfläche (Runde 3): Büro und Schülerpraktikum sind live, die Arbeitszeit steht mit Stellenbezug
    expect(live2026.some((job) => job.category === 'buero')).toBe(true);
    expect(plain(h1[1]).trim()).toBe(`${HERO.title} ${heroZweitzeile(live2026)}`);
    expect(plain(h1[1]).trim()).toBe('SHK-Jobs in Wetzlar. Ehrliches Handwerk. Je nach Stelle flexible Arbeitszeiten.');
    expect(html2026).toMatch(/^<section aria-labelledby="hero-title"/);
    expect(text2026).toContain(heroLead(live2026));
    expect(text2026).toContain('Je nach Stelle bezahlt über Tarif');
    expect(text2026).toContain(HERO.microcopy.replace(/\u00a0/g, ' '));
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

  it('zeigt die drei Maße aus HERO_STATS als echten Text (Liste), Wert und Name getrennt; der Hausschnitt ist dekorativ', () => {
    const masse = html2026.match(/<ul class="[^"]*">([\s\S]*?)<\/ul>/)![1];
    const eintraege = [...masse.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => plain(m[1]).trim());
    const stats = heroStats(live2026);
    expect(eintraege).toEqual([
      `${stats[0].value.replace(/\u00a0/g, ' ')} ${RADIUS_ETIKETT}`,
      `${stats[1].value} ${stats[1].label}`,
      expect.stringMatching(new RegExp(`^${stats[2].value} ${stats[2].label}`)),
    ]);
    // 30 Tage Urlaub sind fürs Büro offen (S5): mit Stellenbezug am Namen
    expect(eintraege[1]).toBe('30 Tage Urlaub je nach Stelle');
    expect(stats.map((s) => s.factId)).toEqual(HERO_STATS.map((s) => s.factId));
    expect(eintraege[0]).toBe('35 km Einsatzgebiet rund um Wetzlar');
    const { breite, hoehe } = HAUSSCHNITT_RAHMEN;
    expect(html2026).toMatch(new RegExp(`<svg class="[^"]*" viewBox="0 0 ${breite} ${hoehe}" aria-hidden="true" focusable="false" data-szene="einstieg">`));
  });

  it('Hausschnitt (E-029): Gerät maßstäblich 110 × 80, Flachheizkörper 100 × 60, Erdreich geschnitten, keine Wanne, kein Wärmebild', () => {
    // Die Außeneinheit ist eine verschachtelte Zeichnung mit der viewBox der Gerätemaße (mm) in 110 × 80 Einheiten
    expect(szene).toMatch(
      new RegExp(`<svg x="[\\d.]+" y="[\\d.]+" width="110" height="80" viewBox="0 0 ${COMPRESS_AW_S.breite.mm} ${COMPRESS_AW_S.hoehe.mm}"[^>]*data-geraet-im-schnitt=""`),
    );
    expect(szene).toMatch(new RegExp(`width="${HEIZKOERPER_LAGE.breite}" height="${HEIZKOERPER_LAGE.hoehe}"[^>]*data-heizkoerper=""`));
    expect([HEIZKOERPER_LAGE.breite, HEIZKOERPER_LAGE.hoehe]).toEqual([100, 60]);
    expect(szene).toContain('data-wanddurchfuehrung=""');
    expect(szene).toContain('data-inneneinheit=""');
    expect(szene).toContain('data-symbol="pumpe"');
    // Keine Isothermen, keine Wanne, kein Zirkel, keine Verläufe
    expect(szene).not.toMatch(/data-motion="waerme"|Gradient|<image|data-motion="luefter"/i);
    expect(html2026).not.toMatch(/Wärmepumpen<\/span>|Heizungen<\/span>|Bäder<\/span>/);
  });

  it('Fließrichtung (K-001, K-003.2): der Vorlauf beginnt an der Außeneinheit und endet links bzw. unten in der Leitung zur Bewerbung', () => {
    const wege = [...szene.matchAll(/<path d="([^"]+)" class="[^"]*" data-medium="(vorlauf|ruecklauf)" data-weg="([^"]+)"/g)].map((m) => ({
      d: m[1],
      medium: m[2],
      id: m[3],
    }));
    expect(wege.map((w) => w.id).sort()).toEqual(LEITUNGEN.map((l) => l.id).sort());
    for (const w of wege) {
      const leitung = LEITUNGEN.find((l) => l.id === w.id)!;
      expect(w.d, w.id).toBe(leitung.d);
      expect(w.medium, w.id).toBe(leitung.medium);
    }
    // Der Vorlauf zur Bewerbung verlässt das Bild am Desktop nach links (x 0), mobil nach unten bei x 28
    expect(LEITUNGEN.find((l) => l.id === 'vorlauf-knopf-desktop')!.d).toMatch(new RegExp(`L0 ${KNOPF_LEITUNG.desktopY}$`));
    expect(LEITUNGEN.find((l) => l.id === 'vorlauf-knopf')!.d).toMatch(new RegExp(`L${KNOPF_LEITUNG.vorlaufX} ${HAUSSCHNITT_RAHMEN.hoehe}$`));
  });

  it('Leitmotiv „35 km“ (E-027, E-029): das Maß in Schrift im Giebel, kein Zirkel, keine Uhr', () => {
    expect(html2026).toMatch(/<span class="[^"]*" aria-hidden="true" data-motion="radius-einrasten">35 km<\/span>/);
    expect(szene).not.toMatch(/data-motion="radius-einrasten"/);
    expect(text2026).not.toMatch(/13:30|16:45|Feierabend|pünktlich/i);
  });

  it('Bewegung: alle Auftakt-Kennungen an der Szene, nur Kennungen aus dem Register, kein „Kreislauf zeigen“', () => {
    const ids = [...html2026.matchAll(/data-motion="([^"]+)"/g)].map((m) => m[1]);
    for (const id of AUFTAKT) expect(ids, id).toContain(id);
    for (const id of ids) expect(MOTION_IDS as readonly string[]).toContain(id);
    expect(ids).not.toContain('kreislauf-zeigen');
    expect(html2026).not.toContain('data-kreislauf');
    expect(text2026).not.toContain('Kreislauf zeigen');
  });

  it('DOM-Reihenfolge wie am Handy: Knopf, Mikrotext, Zweitweg und Erklärsatz vor der Einzelheit mit „Anhalten“ (WCAG 2.4.3, CLS)', () => {
    const knopf = html2026.indexOf(`${PRIMARY_CTA_ATTR}=""`);
    const zweitweg = html2026.indexOf('href="#stellen"');
    const satz = html2026.indexOf(KREISLAUF_SATZ);
    // Der Block der Einzelheit (die Szene trägt am Kreis „X“ dasselbe Attribut an einem <g>)
    const einzelheit = html2026.search(/<div [^>]*data-einzelheit="X"/);
    const anhalten = html2026.indexOf('data-dauer-knopf=""');
    for (const [name, stelle] of Object.entries({ knopf, zweitweg, satz, einzelheit, anhalten })) expect(stelle, name).toBeGreaterThan(0);
    expect(knopf).toBeLessThan(zweitweg);
    expect(zweitweg).toBeLessThan(satz);
    expect(satz).toBeLessThan(einzelheit);
    expect(einzelheit).toBeLessThan(anhalten);
    // Mobil Zeile 5 (nach dem Rest in Zeile 4), am Desktop in der Zelle der Navy-Fläche
    const css = quelle(path.join(EINSTIEG, 'einstieg.module.css')).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/\.einzelheit \{\s*grid-row: 5;/);
    expect(css).toMatch(/\.rest \{\s*grid-row: 4;/);
    expect(css).toMatch(/\.einzelheit \{\s*grid-column: 4;\s*grid-row: 1 \/ 3;/);
    expect(css).toMatch(/\.bild \{\s*grid-column: 4;\s*grid-row: 1 \/ 3;/);
  });

  it('Einzelheit X (E-029): Außeneinheit von vorn mit Maßketten, der Rotor dreht nur im Bereich mit DauerSteuerung', () => {
    const einzelheit = html2026.match(/<div class="[^"]*" data-einzelheit="X" data-tone="inverse">([\s\S]*?)<\/button><\/div><\/div><\/div>/)![0];
    expect(einzelheit).toMatch(/<div class="[^"]*" data-dauer="aus">/);
    expect(einzelheit).toContain(`role="img" aria-label="${EINZELHEIT_TITEL}"`);
    expect(einzelheit).toContain(`viewBox="0 0 ${COMPRESS_AW_S.breite.mm} ${COMPRESS_AW_S.hoehe.mm}"`);
    expect(einzelheit).toContain('data-motion="rotor-dreht"');
    expect(einzelheit).toContain('data-massketten=""');
    // Knopf „Anhalten“ bis zur Hydration unsichtbar (Platz bleibt), der Server liefert das Standbild
    expect(einzelheit).toMatch(/<button type="button" class="[^"]*wartet[^"]*" data-dauer-knopf="">[\s\S]*Anhalten<\/button>/);
    // Jede Dauer-Kennung des Einstiegs steht in diesem Bereich
    const dauer = [...html2026.matchAll(/data-motion="([^"]+)"/g)].map((m) => m[1]).filter((id) => (DAUER_IDS as readonly string[]).includes(id));
    expect(dauer).toEqual(['rotor-dreht']);
    expect(plain(einzelheit)).toContain('Einzelheit X · Maße in mm');
    expect(text2026).toContain(KREISLAUF_SATZ);
  });

  it('Vertrauenszeile: statische Liste mit allen Punkten, ohne Laufband und ohne Fernmontage (E-023)', () => {
    expect(text2026).not.toContain('Fernmontage');
    const liste = html2026.match(/<ul[^>]*data-vertrauenszeile=""[^>]*>([\s\S]*?)<\/ul>/)!;
    expect(liste[0]).toContain('aria-label="Betrieb und Partner"');
    const eintraege = [...liste[1].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => plain(m[1]));
    expect(eintraege).toEqual(vertrauenspunkte().map((p) => p.text.replace(/\u00a0/g, ' ')));
    expect(liste[0]).not.toMatch(/marquee|animate-/);
  });

  it('keine Rohr-Metapher als Schmuck (E-029): keine Rohrklammer, kein Leitungstrenner; alle Zeichnungen aria-hidden', () => {
    expect(html2026).not.toContain('data-zeichnung="rohrklammer"');
    expect(html2026).not.toContain('data-zeichnung="leitungstrenner"');
    // Innere SVGs (x/y = 100 %) und verschachtelte Zeichnungen liegen in einem aria-hidden-SVG; jedes äußere ist dekorativ
    const aeussere = html2026.match(/<svg\b(?![^>]* [xy]="(?:100%|[\d.]+)")[^>]*>/g)!;
    expect(aeussere.length).toBeGreaterThanOrEqual(6);
    for (const svg of aeussere) expect(svg, svg).toMatch(/aria-hidden="true"/);
  });
});

describe('Einstieg: Quellregeln', () => {
  const dateien = [path.join(DIR, 'Hero.tsx'), ...readdirSync(EINSTIEG).filter((f) => /\.tsx?$/.test(f)).map((f) => path.join(EINSTIEG, f))];

  it('keine lucide-Importe, Icons aus components/icons; der Einstieg hat keine eigene Client-Komponente', () => {
    for (const datei of dateien) {
      const src = quelle(datei);
      expect(src, datei).not.toMatch(/lucide-react/);
      expect(/^['"]use client['"]/m.test(src), datei).toBe(false);
    }
    expect(readdirSync(EINSTIEG)).not.toContain('KreislaufKnopf.tsx');
    expect(readdirSync(EINSTIEG)).not.toContain('waermefeld.ts');
  });

  it('Desktop: der Vorlauf läuft per Ankerpositionierung von der Fläche zum Knopf, ohne Anker entfällt er', () => {
    const css = quelle(path.join(EINSTIEG, 'einstieg.module.css')).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/\.bewerben \{[^}]*anchor-name: --einstieg-knopf;/);
    expect(css).toMatch(/\.bild \{[^}]*anchor-name: --einstieg-flaeche;/);
    const rohr = css.match(/\.rohrD \{[^}]*display: block;[^}]*\}/)![0];
    expect(rohr).toContain('left: calc(anchor(--einstieg-knopf right)');
    expect(rohr).toContain('top: calc(anchor(--einstieg-knopf center)');
    // Leitung zur Bewerbung im Hausschnitt: y 655 von 692 = 37 Einheiten über der Falz der Fläche (zwischen Frosttiefe
    // und Kiesbett, Prüfung E-029, Runde 3)
    expect(HAUSSCHNITT_RAHMEN.hoehe - KNOPF_LEITUNG.desktopY).toBe(37);
    expect(rohr).toContain(`bottom: calc(anchor(--einstieg-flaeche bottom) + ${HAUSSCHNITT_RAHMEN.hoehe - KNOPF_LEITUNG.desktopY} * var(--e)`);
    expect(css).toMatch(/@supports not \(anchor-name: --a\) \{\s*\.rohrD \{\s*display: none !important;/);
    // Die Pfade laufen in Fließrichtung: der erste beginnt am Rand der Fläche (x = 100 %), der letzte endet im Knopf (x 0)
    const src = quelle(path.join(EINSTIEG, 'Einstieg.tsx'));
    expect(src).toMatch(/rohrD1[^>]*d="M0 -3H-20/);
    expect(src).toMatch(/rohrD4[^>]*x2="44" y2="3" transform="translate\(-44 0\)"/);
  });

  it('CSS-Modul: keine Rohfarben, keine Primitiven, keine Verläufe, Bewegung nur über Tokens, keine Schleife', () => {
    const css = quelle(path.join(EINSTIEG, 'einstieg.module.css')).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/--p-[a-z]/);
    expect(css).not.toMatch(/\b(?:rgb|hsl|oklch)a?\(|color-mix|gradient/);
    expect(css).not.toMatch(/--wb-/);
    expect(css).not.toMatch(/\d+ms\b/);
    expect(css).not.toMatch(/infinite/);
  });
});
