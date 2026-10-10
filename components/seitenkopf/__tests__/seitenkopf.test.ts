import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HausKlein, Heizkreis, OffeneLeitung, Waermebild } from '@/components/zeichnung';
import { MOTION_IDS } from '@/lib/motion/register';
import { Seitenkopf, type SeitenkopfProps } from '..';

const DIR = path.resolve(__dirname, '..');
const css = readFileSync(path.join(DIR, 'seitenkopf.module.css'), 'utf8');
const quelle = readFileSync(path.join(DIR, 'Seitenkopf.tsx'), 'utf8');
const render = (props: SeitenkopfProps) => renderToStaticMarkup(createElement(Seitenkopf, props));
const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** Probeseite: jede Variante so, wie die Seitenpakete sie einsetzen (Stellenseite, 404, Bewerbung, Recht). */
const PROBE: Record<string, SeitenkopfProps> = {
  stelle: {
    variante: 'erzaehl',
    etikett: 'Vollzeit · Wetzlar',
    titel: 'Anlagen­mechaniker SHK',
    titelId: 'stelle-titel',
    unterzeile: 'Wärmepumpen, Heizung, Bad.',
    einleitung: 'Du baust Wärmepumpen, Heizungen und Bäder.',
    aktion: { href: '/bewerbung?stelle=anlagenmechaniker', label: 'Jetzt bewerben' },
    mikrotext: 'Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.',
    zweitweg: { href: '#aufgaben', label: 'Aufgaben ansehen' },
    masse: [
      { wert: '13:30', name: 'Freitags Feierabend' },
      { wert: '30', name: 'Tage Urlaub' },
    ],
    panel: createElement(Heizkreis, { wert: '3.600–4.600 €', name: 'Brutto im Monat', groesse: 'gross' }),
  },
  waerme: {
    variante: 'erzaehl',
    etikett: 'Vollzeit · Wetzlar',
    titel: 'Kundendiensttechniker Wärmepumpe',
    aktion: { href: '/bewerbung', label: 'Jetzt bewerben' },
    zweitweg: { href: '/jobs', label: 'Alle Stellen ansehen' },
    panel: createElement(Waermebild),
  },
  fehler: {
    variante: 'erzaehl',
    etikett: 'Fehler 404',
    titel: 'Hier hat sich eine Rohrleitung verirrt.',
    zweitweg: { href: '/', label: 'Zur Startseite' },
    panel: createElement(OffeneLeitung),
  },
  bewerbung: {
    variante: 'arbeit',
    etikett: 'Bewerbung · 60 Sekunden',
    titel: 'Jetzt bewerben.',
    unterzeile: 'Ohne Lebenslauf. Diskret.',
    panel: createElement(HausKlein),
    masse: [{ wert: '60 s', name: 'Dauer' }],
  },
  recht: {
    variante: 'ruhig',
    etikett: 'Rechtliches',
    titel: 'Datenschutz',
    unterzeile: 'Stand: Oktober 2026',
    einleitung: 'Wie wir mit deinen Daten umgehen.',
    panel: createElement(HausKlein),
    masse: [{ wert: '35 km', name: 'Einsatzradius' }],
  },
};
const html = Object.fromEntries(Object.entries(PROBE).map(([k, p]) => [k, render(p)])) as Record<keyof typeof PROBE, string>;

describe('Seitenkopf (SEITENKOPF-01): Probeseite rendert jede Variante', () => {
  it.each(Object.keys(PROBE))('%s: genau eine h1 mit Titel, Kopf zeigt per aria-labelledby darauf', (name) => {
    const h = html[name as keyof typeof PROBE];
    const props = PROBE[name];
    const id = props.titelId ?? 'seitenkopf-titel';
    expect(h.match(/<h1\b/g)).toHaveLength(1);
    expect(h).toMatch(new RegExp(`^<header [^>]*aria-labelledby="${id}"`));
    expect(h).toMatch(new RegExp(`<h1 id="${id}"`));
    expect(h).toContain(`data-seitenkopf="${props.variante}"`);
    expect(plain(h.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)![1])).toBe(String(props.titel));
  });

  it('Etikett in Versalien über text-etikett (kein uppercase direkt), Titelstufe nach Variante', () => {
    expect(html.stelle).toMatch(/<p class="[^"]*text-etikett[^"]*">Vollzeit · Wetzlar<\/p>/);
    expect(html.stelle).toMatch(/<h1 [^>]*class="[^"]*text-display[^"]*text-brand/);
    expect(html.bewerbung).toMatch(/<h1 [^>]*class="[^"]*text-title-1/);
    expect(html.recht).toMatch(/<h1 [^>]*class="[^"]*text-title-1/);
    expect(quelle).not.toMatch(/\buppercase\b|font-mono/);
  });

  it('erzaehl und arbeit tragen die Navy-Fläche als Inverse-Band; ruhig bleibt Papier ohne Panel und Maße', () => {
    for (const name of ['stelle', 'waerme', 'fehler', 'bewerbung'] as const) {
      expect(html[name]).toMatch(/<div [^>]*data-tone="inverse" aria-hidden="true"><\/div>/);
    }
    expect(html.recht).not.toContain('data-tone="inverse"');
    expect(html.recht).not.toContain('data-zeichnung="haus-klein"');
    expect(html.recht).not.toContain('data-zeichnung="masskette"');
    // Titelblock steht mobil auf Navy (Inverse), am Desktop holt das CSS die Papier-Rollen zurück
    expect(html.stelle).toMatch(/<div class="[^"]*" data-tone="inverse"><p class="[^"]*text-etikett/);
    expect(css).toMatch(/\.titelblock\[data-tone\] \{[\s\S]*?--brand: inherit;[\s\S]*?--vorlauf: inherit;/);
  });

  it('Hauptaktion: ein roter Knopf mit Ziel, Mikrotext, Zweitweg mit Pfeil; das Leitungspaar mündet nur mit Knopf', () => {
    expect(html.stelle).toContain('href="/bewerbung?stelle=anlagenmechaniker"');
    expect(html.stelle).toMatch(/data-primary-cta=""/);
    expect(html.stelle).toMatch(/<a [^>]*data-motion="druck"[^>]*><span>Jetzt bewerben<\/span><svg/);
    expect(plain(html.stelle)).toContain('Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.');
    expect(plain(html.stelle)).toContain('Aufgaben ansehen');
    expect(html.stelle).toContain('data-zeichnung="seitenkopf-leitung"');
    // Anker: Pfeil nach unten; Seitenziel: Pfeil nach rechts (Icon-Pfade aus components/icons)
    expect(html.stelle).toContain('M12 5v14');
    expect(html.waerme).toMatch(/Alle Stellen <span[^>]*>ansehen<svg[\s\S]*?M5 12h14/);
    expect(html.fehler).not.toContain('data-zeichnung="seitenkopf-leitung"');
    expect(html.fehler).not.toContain('data-primary-cta');
    expect(html.bewerbung).not.toContain('data-zeichnung="seitenkopf-leitung"');
    // Rot nur als Knopffläche und Vorlauf: im CSS steht --accent nur an der Aktion
    const accent = [...css.matchAll(/^\s*background-color: var\(--accent[\w-]*\);/gm)].length;
    expect(accent).toBe(3);
  });

  it('Maße: Wert und Name mit Leerzeichen im DOM, höchstens vier, als Liste', () => {
    expect(html.stelle).toMatch(/<ul class="[^"]*"><li/);
    expect(plain(html.stelle)).toContain('13:30 Freitags Feierabend');
    const viele = render({ ...PROBE.stelle, masse: Array.from({ length: 6 }, (_, i) => ({ wert: `${i}`, name: `Mass ${i}` })) });
    expect(viele.match(/data-zeichnung="masskette"/g)).toHaveLength(4);
  });

  it('Unterzeile mit Rohrklammer; ruhig ohne Unterzeile fasst die h1', () => {
    expect(html.stelle).toContain('data-zeichnung="rohrklammer"');
    const ohne = render({ variante: 'ruhig', etikett: 'Rechtliches', titel: 'Impressum' });
    expect(ohne).toMatch(/<h1 [^>]*>(?:<span[^>]*>)<svg[^>]*data-zeichnung="rohrklammer"/);
  });

  it('fremde Ziele als <a>, interne über next/link; Bewegung nur mit Registerkennungen', () => {
    const tel = render({ ...PROBE.fehler, zweitweg: { href: 'tel:+49644142956', label: '06441 42956 anrufen' } });
    expect(tel).toContain('href="tel:+49644142956"');
    for (const h of Object.values(html)) {
      for (const [, id] of h.matchAll(/data-motion="([^"]+)"/g)) expect(MOTION_IDS).toContain(id);
    }
  });
});
