import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DatenschutzPage from '@/app/datenschutz/page';
import ImpressumPage from '@/app/impressum/page';
import { MOTION_IDS } from '@/lib/motion/register';
import { DRUCK_LABEL, DruckKnopf, RechtAbschnitt, RechtDokument, abschnittsNummer } from '..';

const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '..');
const css = readFileSync(path.join(DIR, 'recht.module.css'), 'utf8');
const plain = (markup: string) =>
  markup
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const seiten = {
  datenschutz: renderToStaticMarkup(createElement(DatenschutzPage)),
  impressum: renderToStaticMarkup(createElement(ImpressumPage)),
};

describe('Rechtsseiten im Seitenkopf ruhig (R5-RECHT-01)', () => {
  it.each(Object.entries(seiten))('%s: Seitenkopf ruhig mit Etikett, einer h1 und Rohrklammer, ohne Navy-Fläche', (_, html) => {
    expect(html).toContain('data-seitenkopf="ruhig"');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toMatch(/<p class="[^"]*text-etikett[^"]*">Rechtliches<\/p>/);
    expect(html).toContain('data-zeichnung="rohrklammer"');
    expect(html).not.toContain('data-tone="inverse"');
    expect(html).toContain('data-zeichnung="leitungstrenner"');
    for (const [, id] of html.matchAll(/data-motion="([^"]+)"/g)) expect(MOTION_IDS).toContain(id);
  });

  it.each(Object.entries(seiten))('%s: Verzeichnis und Kapitel tragen dieselben Nummern in derselben Reihenfolge', (_, html) => {
    const verzeichnis = [...html.matchAll(/<a href="#([^"]+)"[^>]*><span aria-hidden="true"[^>]*>(\d\d)<\/span>/g)].map((m) => [m[1], m[2]]);
    const kapitel = [...html.matchAll(/<section id="([^"]+)"[^>]*><h2 [^>]*><span aria-hidden="true"[^>]*>(\d\d)<\/span>/g)].map((m) => [m[1], m[2]]);
    expect(verzeichnis.length).toBeGreaterThanOrEqual(5);
    expect(kapitel).toEqual(verzeichnis);
    verzeichnis.forEach(([, nummer], i) => expect(nummer).toBe(abschnittsNummer(i)));
  });

  it('Datenschutz: Anker bewerberdaten für den Fuß-Link (E-RECHT-008), h1 mit weicher Trennstelle für 320 px', () => {
    expect(seiten.datenschutz).toMatch(/<section id="bewerberdaten"/);
    expect(plain(seiten.datenschutz.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)![1])).toBe('Datenschutz­erklärung');
  });

  it('Datenschutz: Faktenkorrektur M-019 – die selbst gehosteten Schriften statt „Inter“, sonst wortgleich', () => {
    const text = plain(seiten.datenschutz);
    expect(text).toContain(
      'Wir nutzen die Schriften Bricolage Grotesque, Atkinson Hyperlegible Next und Martian Mono. Sie werden beim Erstellen der Website eingebunden und von unserem Hoster zusammen mit den Seiten ausgeliefert. Dein Browser stellt dafür keine Verbindung zu Google Fonts oder anderen Dritten her.',
    );
    expect(text).not.toMatch(/Schrift Inter\b/);
    // Die genannten Familien sind genau die Dateien in app/fonts (next/font/local)
    const dateien = readdirSync(path.join(ROOT, 'app/fonts')).filter((name) => name.endsWith('.woff2'));
    for (const familie of ['bricolage-grotesque', 'atkinson-hyperlegible-next', 'martian-mono']) {
      expect(dateien.some((name) => name.startsWith(familie))).toBe(true);
    }
    expect(dateien.every((name) => /^(bricolage-grotesque|atkinson-hyperlegible-next|martian-mono)-/.test(name))).toBe(true);
    expect(readFileSync(path.join(ROOT, 'app/fonts/index.ts'), 'utf8')).not.toMatch(/next\/font\/google/);
  });

  it('Datenschutz: der Vermerk zur Schriftnamen-Korrektur steht in datenschutz-aenderungen.md', () => {
    const vermerk = readFileSync(path.join(ROOT, 'docs/operations/datenschutz-aenderungen.md'), 'utf8');
    expect(vermerk).toMatch(/M-019/);
    expect(vermerk).toMatch(/Bricolage Grotesque, Atkinson Hyperlegible Next und Martian Mono/);
    expect(vermerk).toMatch(/2026-10-10/);
  });
});

describe('Drucken (E-RECHT-013)', () => {
  it('Knopf ist eine Client-Insel mit window.print; auf dem Server rendert er nichts (ohne JS kein toter Knopf)', () => {
    expect(renderToStaticMarkup(createElement(DruckKnopf))).toBe('');
    const quelle = readFileSync(path.join(DIR, 'DruckKnopf.tsx'), 'utf8');
    expect(quelle).toMatch(/^'use client';/);
    expect(quelle).toMatch(/onClick=\{\(\) => window\.print\(\)\}/);
    expect(DRUCK_LABEL).toBe('Drucken oder als PDF speichern');
  });

  it('Platz für den Knopf ist im Kopf reserviert, der Platz und alles Bedienbare fehlen im Druck', () => {
    for (const html of Object.values(seiten)) {
      expect(html).toMatch(/<div class="[^"]*print-hidden[^"]*"><\/div>/);
      expect(html).toMatch(/<nav aria-labelledby="recht-inhalt-titel" class="[^"]*print-hidden/);
    }
    expect(css).toMatch(/\.druckzeile \{\s*min-height: var\(--m-ziel\);/);
  });

  it('eigene benannte Druckseite mit Seitenrand (globals setzt margin 0 für alle Seiten)', () => {
    expect(css).toMatch(/@page recht \{[^}]*margin: \d+mm/);
    expect(css).toMatch(/\.dokument \{[^}]*page: recht;/);
  });
});

describe('Bausteine', () => {
  it('abschnittsNummer zählt zweistellig ab 01', () => {
    expect(abschnittsNummer(0)).toBe('01');
    expect(abschnittsNummer(9)).toBe('10');
    expect(abschnittsNummer(11)).toBe('12');
  });

  it('RechtAbschnitt: benannter Bereich, die Nummer bleibt aus dem Namen der Überschrift heraus', () => {
    const html = renderToStaticMarkup(RechtAbschnitt({ id: 'probe', titel: 'Probe', nummer: '07', children: 'Text' }));
    expect(html).toMatch(/^<section id="probe" aria-labelledby="probe-titel"/);
    expect(html).toMatch(/<h2 id="probe-titel"><span aria-hidden="true"[^>]*>07<\/span>Probe<\/h2>/);
  });

  it('RechtDokument ohne Stand: die Rohrklammer fasst die h1', () => {
    const html = renderToStaticMarkup(
      RechtDokument({ titel: 'Impressum', pfad: 'Impressum', inhalt: [{ id: 'a', label: 'A' }], children: null }),
    );
    expect(html).toMatch(/<h1 [^>]*>(?:<span[^>]*>)<svg[^>]*data-zeichnung="rohrklammer"/);
    expect(html).toContain('aria-current="page"');
  });
});
