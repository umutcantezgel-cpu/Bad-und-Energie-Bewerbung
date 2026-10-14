import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HausKlein, Heizkreis, OffeneLeitung } from '@/components/zeichnung';
import { Aussengeraet } from '@/components/zeichnung/technik/Aussengeraet';
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
    panel: createElement(Aussengeraet, { ansicht: 'vorne', schriftfeld: false }),
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
    // React hebt den <link> aus dem Kopf heraus (in den <head>, hier an den Anfang); er hält das erste Bild an,
    // bis die Marke am Ende des Kopfs geparst ist (V6-A3-VITALS, CLS durch Teildokumente)
    expect(h).toMatch(new RegExp(`^<link rel="expect" href="#${id}-ende" blocking="render"/><header [^>]*aria-labelledby="${id}"`));
    expect(h).toMatch(new RegExp(`<span id="${id}-ende" hidden=""></span></header>$`));
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

  it('E-029: Zeichnung und Maße im DOM gleich nach dem Titel, vor Einleitung und Knopf (Tab-Folge wie am Handy, WCAG 2.4.3)', () => {
    const h = html.stelle;
    const titel = h.indexOf('</h1>');
    const panel = h.search(/<div class="[^"]*" data-tone="inverse"><div class=/);
    const leitung = h.indexOf('data-zeichnung="seitenkopf-leitung"');
    const einleitung = h.indexOf('Du baust Wärmepumpen');
    const knopf = h.indexOf('data-primary-cta');
    for (const stelle of [titel, panel, leitung, einleitung, knopf]) expect(stelle).toBeGreaterThan(0);
    expect(panel).toBeGreaterThan(titel);
    // Alles, was am Handy über dem Knopf liegt (Zeilen 1 bis 3), steht im DOM davor: kein Nachrutschen
    expect(leitung).toBeGreaterThan(panel);
    expect(leitung).toBeLessThan(knopf);
    expect(panel).toBeLessThan(einleitung);
    expect(einleitung).toBeLessThan(knopf);
    // Ein Bedienelement im Panel (Anhalten der Dauerbewegung) steht so in der Tab-Folge vor dem Knopf
    const mitSteuerung = render({ ...PROBE.waerme, panel: createElement('button', { type: 'button' }, 'Anhalten') });
    expect(mitSteuerung.indexOf('>Anhalten</button>')).toBeLessThan(mitSteuerung.indexOf('data-primary-cta'));
    // Lage: am Handy Zeile 2 (über dem Knopf in Zeile 4), am Desktop die Spalte rechts über alle Zeilen
    const regel = (block: string, name: string) => block.match(new RegExp(`\\n\\s*\\.${name} \\{([^}]*)\\}`))?.[1] ?? '';
    const desktop = css.slice(css.indexOf('@media (min-width: 64em)'));
    expect(regel(css, 'panel')).toMatch(/grid-row: 2;/);
    expect(regel(css, 'leitung')).toMatch(/grid-row: 3;/);
    expect(regel(css, 'aktionsblock')).toMatch(/grid-row: 4;/);
    expect(regel(desktop, 'panel')).toMatch(/grid-column: panel-start \/ voll-end;\s*grid-row: 1 \/ -1;/);
  });

  it('Maße: Wert und Name mit Leerzeichen im DOM, höchstens vier, als Liste', () => {
    expect(html.stelle).toMatch(/<ul class="[^"]*"><li/);
    expect(plain(html.stelle)).toContain('13:30 Freitags Feierabend');
    const viele = render({ ...PROBE.stelle, masse: Array.from({ length: 6 }, (_, i) => ({ wert: `${i}`, name: `Mass ${i}` })) });
    expect(viele.match(/data-zeichnung="masskette"/g)).toHaveLength(4);
  });

  it('E-029: erzaehl und arbeit ohne Rohrklammer (Etikett und h1 tragen den Kopf); ruhig behält sie an Unterzeile bzw. h1', () => {
    for (const name of ['stelle', 'waerme', 'fehler', 'bewerbung'] as const) {
      expect(html[name], name).not.toContain('data-zeichnung="rohrklammer"');
      expect(html[name], name).not.toMatch(/class="[^"]*mitKlammer/);
    }
    expect(plain(html.stelle)).toContain('Wärmepumpen, Heizung, Bad.');
    expect(html.recht.match(/data-zeichnung="rohrklammer"/g)).toHaveLength(1);
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

describe('Seitenkopf: Maße am Handy und zweispaltig (lokale Seiten, Review Phase 2 Punkt 29)', () => {
  const basis: SeitenkopfProps = {
    variante: 'erzaehl',
    etikett: '54 Orte · 6 Kreise',
    titel: 'Unser Einsatzgebiet',
    aktion: { href: '/bewerbung', label: 'Jetzt bewerben' },
    masse: [
      { wert: '2 km', name: 'Nächster Ort: Steindorf', nurBreit: true },
      { wert: '35 km', name: 'Weitester Ort: Bad Endbach', nurBreit: true },
      { wert: '23 min', name: 'Mittlere Fahrzeit' },
      { wert: '22 km', name: 'Mittlere Strecke' },
    ],
    masseZweispaltig: true,
  };

  it('Maße mit nurBreit stehen im DOM, am Handy ausgeblendet; zweispaltig ab Desktop', () => {
    const html = render(basis);
    expect(html.match(/massNurBreit/g)).toHaveLength(2);
    expect(html).toMatch(/class="[^"]*masseZweispaltig/);
    expect(plain(html)).toContain('Weitester Ort: Bad Endbach');
    expect(css).toMatch(/@media \(max-width: 37\.49em\) \{\s*\.massNurBreit \{\s*display: none;/);
    expect(css).toMatch(/\.masseZweispaltig \{\s*display: grid;\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  });

  it('bildBreit: am Tablet steht die Zeichnung über den Maßen (eine Spalte)', () => {
    expect(render({ ...basis, bildBreit: true })).toMatch(/<header class="[^"]*bildBreit/);
    expect(css).toMatch(/@media \(min-width: 37\.5em\) and \(max-width: 63\.99em\) \{\s*\.bildBreit \.panel \{\s*grid-template-columns: minmax\(0, 1fr\);/);
  });

  it('ohne die Optionen bleibt alles wie bisher', () => {
    const html = render({ ...basis, masse: basis.masse!.map(({ wert, name }) => ({ wert, name })), masseZweispaltig: false });
    expect(html).not.toMatch(/massNurBreit|masseZweispaltig|bildBreit/);
  });
});
