import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Section } from '@/components/layout/Section';
import { Breadcrumbs } from '../Breadcrumbs';
import { Card } from '../Card';
import { Disclosure, type DisclosureProps } from '../Disclosure';
import { PageHeader } from '../PageHeader';
import { ProgressRing, ringAnteil } from '../ProgressRing';
import { StatTile } from '../StatTile';
import { Tag } from '../Tag';
import { TextLink } from '../TextLink';

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const svgOf = (markup: string) => markup.match(/<svg[\s\S]*?<\/svg>/)?.[0] ?? '';
/** stroke-dashoffset des Vorlauf-Bogens (Register „fortschritt“). */
const offsetOf = (markup: string) => Number(markup.match(/data-motion="fortschritt"[^>]*stroke-dashoffset="([\d.]+)"/)?.[1]);

describe('ringAnteil', () => {
  it('rechnet den Anteil in ganzen Prozent und erreicht 100 erst beim vollen Stand', () => {
    expect(ringAnteil(0, 5)).toBe(0);
    expect(ringAnteil(3, 5)).toBe(60);
    expect(ringAnteil(4, 5)).toBe(80);
    expect(ringAnteil(5, 5)).toBe(100);
    expect(ringAnteil(99.6)).toBe(99);
    expect(ringAnteil(100)).toBe(100);
  });

  it('begrenzt ungültige Werte, ein leerer oder kaputter Stand ist nie erledigt', () => {
    expect(ringAnteil(-2, 5)).toBe(0);
    expect(ringAnteil(9, 5)).toBe(100);
    expect(ringAnteil(Number.NaN, 5)).toBe(0);
    expect(ringAnteil(3, 0)).toBe(0);
  });
});

describe('ProgressRing (E-BEW-007)', () => {
  it('ist ein Meter mit Zahl und Text für Screenreader', () => {
    const out = html(createElement(ProgressRing, { value: 3, max: 5, label: 'Stand deiner Mappe' }));
    expect(out).toContain('role="meter"');
    expect(out).toContain('aria-label="Stand deiner Mappe"');
    expect(out).toContain('aria-valuemin="0"');
    expect(out).toContain('aria-valuemax="5"');
    expect(out).toContain('aria-valuenow="3"');
    expect(out).toContain('aria-valuetext="3 von 5 erledigt"');
    expect(out).toContain('data-anteil="60"');
  });

  it('stroke-dashoffset entspricht dem Anteil (100 − Anteil bei pathLength 100)', () => {
    for (const [value, max, anteil] of [
      [0, 5, 0],
      [1, 5, 20],
      [3, 5, 60],
      [5, 5, 100],
      [42, 100, 42],
    ] as const) {
      const out = html(createElement(ProgressRing, { value, max, label: 'Stand' }));
      expect(out).toContain('pathLength="100"');
      expect(offsetOf(out)).toBe(100 - anteil);
    }
  });

  it('zeigt 0 % bei leerem Stand ohne Punkt am Start und ohne Rücklauf', () => {
    const out = html(createElement(ProgressRing, { value: 0, max: 5, label: 'Stand' }));
    expect(out).toMatch(/data-motion="fortschritt"[^>]*visibility="hidden"/);
    expect(out).not.toContain('kreis-schliessen');
    expect(out).toMatch(/>0<span[^>]*>\u202F%<\/span>/);
  });

  it('schließt bei 100 % den Kreis mit dem Rücklauf (Register „kreis-schliessen“)', () => {
    const fast = html(createElement(ProgressRing, { value: 4, max: 5, label: 'Stand' }));
    expect(fast).not.toContain('kreis-schliessen');
    const voll = html(createElement(ProgressRing, { value: 5, max: 5, label: 'Stand', caption: 'erledigt' }));
    expect(voll).toContain('data-motion="kreis-schliessen"');
    expect(voll).toContain('data-geschlossen=""');
    expect(voll).toMatch(/>100<span[^>]*>\u202F%<\/span>/);
    expect(voll).toContain('erledigt');
  });

  it('nimmt einen eigenen Wert-Text an und nennt Prozent, wenn max 100 ist', () => {
    expect(html(createElement(ProgressRing, { value: 25, label: 'Stand' }))).toContain('aria-valuetext="25 %"');
    expect(html(createElement(ProgressRing, { value: 2, max: 5, label: 'Stand', valueText: 'Zwei Abschnitte fertig' }))).toContain(
      'aria-valuetext="Zwei Abschnitte fertig"',
    );
  });

  it('bleibt im Icon-Budget: SVG ≤ 1,5 KB, auch geschlossen und groß', () => {
    const svg = svgOf(html(createElement(ProgressRing, { value: 5, max: 5, label: 'Stand', size: 'lg' })));
    expect(svg.length).toBeGreaterThan(0);
    expect(new TextEncoder().encode(svg).length).toBeLessThanOrEqual(1536);
    expect(svg).toContain('aria-hidden="true"');
  });
});

describe('Anzeige-Bausteine im Formsystem', () => {
  it('PageHeader: Etikett in Versalien, eine h1 in Marken-Navy, Rohrklammer an der Einleitung', () => {
    const out = html(createElement(PageHeader, { eyebrow: 'Rechtliches', title: 'Impressum', lead: 'Angaben nach § 5 DDG.' }));
    expect(out.match(/<h1/g)).toHaveLength(1);
    expect(out).toMatch(/<p class="[^"]*text-etikett[^"]*">Rechtliches<\/p>/);
    expect(out).toMatch(/<h1 class="[^"]*text-brand/);
    expect(out).toContain('data-zeichnung="rohrklammer"');
  });

  it('PageHeader: Unterzeile trägt die Klammer; zentriert und mit klammer={false} ohne', () => {
    const mitZweit = html(createElement(PageHeader, { title: 'Danke', unterzeile: 'Wir melden uns.', lead: 'Text' }));
    expect(mitZweit.match(/data-zeichnung="rohrklammer"/g)).toHaveLength(1);
    expect(mitZweit).toMatch(/text-title-3[^"]*"><span aria-hidden="true"/);
    expect(html(createElement(PageHeader, { title: 'T', lead: 'L', align: 'center' }))).not.toContain('rohrklammer');
    expect(html(createElement(PageHeader, { title: 'T', lead: 'L', klammer: false }))).not.toContain('rohrklammer');
  });

  it('StatTile: Maß in Martian Mono mit Maßkette, Name als Etikett', () => {
    const out = html(createElement(StatTile, { value: '13:30', label: 'Freitags Feierabend' }));
    expect(out).toMatch(/<p class="font-mass[^"]*text-brand[^"]*">13:30<\/p><span aria-hidden="true" class="[^"]*kette/);
    expect(out).toMatch(/text-etikett[^"]*">Freitags Feierabend</);
    expect(html(createElement(StatTile, { value: '30', label: 'Tage', kette: false }))).not.toContain('kette');
  });

  it('Tag ist ein Etikett-Kästchen (Strich, Radius 4, Versalien über text-etikett)', () => {
    const out = html(createElement(Tag, null, 'Vollzeit'));
    expect(out).toContain('text-etikett');
    expect(out).toContain('border-(length:--m-strich)');
    expect(out).toContain('rounded-1');
    expect(out).not.toMatch(/\buppercase\b/);
  });

  it('TextLink: freistehend mit 3-px-Strich und Druck; im Fließtext ohne Druckbewegung', () => {
    const frei = html(createElement(TextLink, { href: '/jobs', standalone: true }, 'Offene Stellen ansehen'));
    expect(frei).toContain('data-motion="druck"');
    expect(frei).toContain('decoration-(length:--m-strich)');
    expect(frei).toContain('min-h-11');
    const satz = html(createElement(TextLink, { href: '/jobs' }, 'Stellen'));
    expect(satz).not.toContain('data-motion');
    expect(satz).toContain('hover:decoration-ruecklauf');
  });

  it('Card: Ton wand als Standard, interaktiv mit Druck', () => {
    expect(html(createElement(Card, null, 'x'))).toContain('bg-surface-2');
    expect(html(createElement(Card, { tone: 'rahmen' }, 'x'))).toContain('border-brand');
    const klickbar = html(createElement(Card, { interactive: true }, 'x'));
    expect(klickbar).toContain('data-motion="druck"');
    expect(klickbar).toContain('hover:bg-surface-3');
  });

  it('Disclosure und Breadcrumbs zeichnen mit der eigenen Icon-Familie (Strich 3)', () => {
    const d = html(createElement(Disclosure, { summary: 'Frage' } as DisclosureProps, 'Antwort'));
    expect(d).toContain('data-motion="flaeche"');
    expect(d).toContain('stroke-width="3"');
    const b = html(createElement(Breadcrumbs, { items: [{ label: 'Startseite', href: '/' }, { label: 'Datenschutz' }] }));
    expect(b).toContain('stroke-width="3"');
    expect(b).toContain('aria-current="page"');
  });

  it('Section: Tonnamen der Tonfolge und Leitungstrenner am Kopf', () => {
    expect(html(createElement(Section, { tone: 'wand' }, 'x'))).toContain('bg-surface-2');
    expect(html(createElement(Section, { tone: 'band' }, 'x'))).toContain('data-tone="inverse"');
    expect(html(createElement(Section, { tone: 'inverse' }, 'x'))).toContain('data-tone="inverse"');
    const mit = html(createElement(Section, { trenner: true }, 'x'));
    expect(mit).toContain('data-zeichnung="leitungstrenner"');
    expect(mit).toContain('pt-24');
    expect(html(createElement(Section, null, 'x'))).not.toContain('leitungstrenner');
  });
});
