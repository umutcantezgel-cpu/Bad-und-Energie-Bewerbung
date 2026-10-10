import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FACTS } from '@/lib/content/facts';
import { WeekSection } from '../WeekSection';
import { WOCHE_BILD_TEXT_ID, WOCHE_BILD_TITEL_ID, Wochenplan } from '../woche/Wochenplan';
import { bindeUhr, mitZiffern } from '../woche/satz';
import {
  ACHSE,
  ARBEITSTAGE,
  FEIERABEND_FREITAG,
  FREIE_TAGE,
  MASS,
  PLAN_HOEHE,
  WOCHE_TEXT,
  anteil,
  beschreibeWoche,
  parseArbeitszeiten,
  prozent,
} from '../woche/woche-daten';

const NBSP = ' ';
const plan = () => renderToStaticMarkup(createElement(Wochenplan));
const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

describe('Arbeitswoche: Zeiten nur aus dem Faktenregister', () => {
  it('liest workingHours als fünf Arbeitstage Mo–Fr', () => {
    expect(ARBEITSTAGE.map((t) => t.kuerzel)).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr']);
    for (const tag of ARBEITSTAGE.slice(0, 4)) expect([tag.von, tag.bis]).toEqual(['07:00', '16:45']);
    expect([FEIERABEND_FREITAG.von, FEIERABEND_FREITAG.bis]).toEqual(['07:00', '13:30']);
    expect(FEIERABEND_FREITAG.bisStunde).toBe(13.5);
  });

  it('der Freitag endet genau mit friday1330 und ist der kürzeste Kreis', () => {
    expect(FEIERABEND_FREITAG.bis).toBe(FACTS.friday1330.value);
    const kuerzester = [...ARBEITSTAGE].sort((a, b) => a.bisStunde - b.bisStunde)[0];
    expect(kuerzester.kuerzel).toBe('Fr');
  });

  it('Sa und So haben keinen Kreis, nur „Kein Wochenend-Notdienst“ (noWeekendOnCall)', () => {
    expect(FREIE_TAGE).toEqual(['Sa', 'So']);
    expect(WOCHE_TEXT.freieTage).toBe('Sa, So');
    expect(WOCHE_TEXT.wochenende).toBe(FACTS.noWeekendOnCall.short);
  });

  it('die Beschreibung aus den gelesenen Tagen deckt sich wörtlich mit workingHours.long', () => {
    const satz = beschreibeWoche(ARBEITSTAGE).replaceAll(NBSP, ' ');
    expect(FACTS.workingHours.long).toBe(`Feste Arbeitszeiten: ${satz}.`);
  });

  it('Kopf und Einleitung sind friday1330.short und workingHours.long (Variante 1)', () => {
    expect(WOCHE_TEXT.titel).toBe('Freitags ab 13:30 Uhr Feierabend');
    expect(WOCHE_TEXT.titel).toBe(FACTS.friday1330.short);
    expect(WOCHE_TEXT.einleitung).toBe(FACTS.workingHours.long);
  });

  it('faltet Tagesbereiche auf und lehnt Widersprüche ab', () => {
    expect(parseArbeitszeiten('Di–Mi 06:30–15:00 Uhr').map((t) => [t.kuerzel, t.vonStunde, t.bisStunde])).toEqual([
      ['Di', 6.5, 15],
      ['Mi', 6.5, 15],
    ]);
    expect(() => parseArbeitszeiten('Mo 07:00–16:00 Uhr, Mo 07:00–12:00 Uhr')).toThrow(/doppelt/);
    expect(() => parseArbeitszeiten('Do–Mo 07:00–16:00 Uhr')).toThrow(/rückwärts/);
    expect(() => parseArbeitszeiten('nach Absprache')).toThrow(/keine Angabe/);
  });
});

describe('Zeitachse und Maße', () => {
  it('06–18 Uhr wie Variante 1, Striche 07 · 10 · 13 · 16', () => {
    expect([ACHSE.von, ACHSE.bis]).toEqual([6, 18]);
    expect(ACHSE.striche).toEqual([7, 10, 13, 16]);
    expect(anteil(6)).toBe(0);
    expect(anteil(18)).toBe(1);
    expect(prozent(7)).toBe('8.3333%');
    expect(prozent(13.5)).toBe('62.5%');
    expect(prozent(16.75)).toBe('89.5833%');
  });

  it('Höhe: Zulauf, sechs Reihen (fünf Tage und Wochenende), Achse', () => {
    expect(PLAN_HOEHE).toBe(MASS.kopf + 6 * MASS.reihe + MASS.achse);
    // Konzentrische Bögen am Verteiler: außen = innen + Paarabstand (KERN K-007/K-008)
    expect(MASS.bogenAussen).toBe(MASS.bogenInnen + MASS.paar);
    expect(MASS.bruecke).toBe(3 * MASS.strich);
  });
});

describe('Wochenplan (Inline-SVG)', () => {
  it('ist ein Bild mit Titel und Beschreibung (B Runde 1)', () => {
    const html = plan();
    expect(html).toContain('role="img"');
    expect(html).toContain(`aria-labelledby="${WOCHE_BILD_TITEL_ID}"`);
    expect(html).toContain(`aria-describedby="${WOCHE_BILD_TEXT_ID}"`);
    expect(html).toContain(`<title id="${WOCHE_BILD_TITEL_ID}">Arbeitszeit der Woche</title>`);
    const desc = html.match(new RegExp(`<desc id="${WOCHE_BILD_TEXT_ID}">([^<]*)</desc>`))?.[1] ?? '';
    expect(desc).toBe(
      `Montag bis Donnerstag von 07:00 bis 16:45${NBSP}Uhr, Freitag von 07:00 bis 13:30${NBSP}Uhr. Samstag und Sonntag: Kein Wochenend-Notdienst.`,
    );
  });

  it('zeichnet fünf Heizkreise ab 07:00; Mo–Do kehren bei 16:45 um, der Freitag bei 13:30', () => {
    const html = plan();
    const kreise = [...html.matchAll(/<line[^>]*x1="8\.3333%"[^>]*x2="([\d.]+%)"/g)]
      .map((m) => m[1])
      .filter((x2) => x2 !== '8.3333%'); // ohne den Achsstrich bei 07
    // je Tag Vorlauf und Rücklauf
    expect(kreise).toEqual([
      ...Array(8).fill('89.5833%'),
      '62.5%',
      '62.5%',
    ]);
    // Bogen beim Feierabend: je Tag ein eingebettetes SVG an der Uhrzeit
    expect(count(html, /<svg x="89\.5833%" y="\d+" overflow="visible">/g)).toBe(4);
    expect(count(html, /<svg x="62\.5%" y="\d+" overflow="visible">/g)).toBe(1);
  });

  it('zeigt die Maße als Text: viermal 16:45, einmal 13:30 als Hauptmaß, Achse 07 · 10 · 13 · 16', () => {
    const html = plan();
    expect(count(html, />16:45</g)).toBe(4);
    expect(count(html, />13:30</g)).toBe(1);
    for (const h of ['07', '10', '13', '16']) expect(html).toContain(`>${h}</text>`);
    for (const k of ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa, So']) expect(html).toContain(`>${k}</text>`);
    expect(html).toContain('>Kein Wochenend-Notdienst</text>');
  });

  it('der Rücklauf-Verteiler hat je Tag eine Brücke, wo der Vorlauf kreuzt', () => {
    const html = plan();
    const paths = [...html.matchAll(/<path[^>]* d="([^"]+)"/g)].map((m) => m[1]);
    const verteilerRuecklauf = paths.find((d) => d.startsWith(`M${-MASS.zulauf} ${MASS.strich / 2}H`));
    expect(verteilerRuecklauf).toBeDefined();
    // Eine Lücke = ein Neuansatz „M0 y“ unterhalb der Kreuzung
    expect(count(verteilerRuecklauf!, /M0 /g)).toBe(ARBEITSTAGE.length);
  });

  it('nutzt nur Rollen, keine Hexwerte und keine Bewegung (statischer Abschnitt)', () => {
    const html = plan();
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(html).not.toContain('data-motion');
    expect(html).not.toContain('viewBox');
  });
});

describe('WeekSection', () => {
  const html = renderToStaticMarkup(createElement(WeekSection));

  it('ist eine benannte Region mit genau einer h2 und keiner h1', () => {
    expect(html).toMatch(/<section[^>]*id="woche"[^>]*aria-labelledby="woche-title"/);
    expect(count(html, /<h2\b/g)).toBe(1);
    expect(html).not.toContain('<h1');
    expect(html).toContain(`id="woche-title"`);
    expect(html).toContain(`Freitags ab 13:30${NBSP}Uhr Feierabend`);
  });

  it('setzt Uhrzeiten im Fließtext in Bricolage-Ziffern und bindet „Uhr“', () => {
    expect(html).toContain('<span class="ziffer">07:00</span>');
    expect(html).toContain(`<span class="ziffer">13:30</span>${NBSP}Uhr.`);
  });

  it('schneidet den Zulauf am Seitenrand ab und hält Tagesspalte und Endmaße frei', () => {
    expect(html).toMatch(/<section[^>]*class="[^"]*overflow-x-clip/);
    expect(html).toMatch(/<figure class="[^"]*px-16/);
    // px-16 = 4rem = 64 px = MASS.spalte = MASS.rechts
    expect([MASS.spalte, MASS.rechts]).toEqual([64, 64]);
  });
});

describe('Satz für Zeiten', () => {
  it('bindet „Uhr“ mit geschütztem Leerzeichen, ohne den Wortlaut zu ändern', () => {
    expect(bindeUhr('ab 13:30 Uhr Feierabend')).toBe(`ab 13:30${NBSP}Uhr Feierabend`);
    expect(bindeUhr('Uhrzeit')).toBe('Uhrzeit');
  });

  it('teilt Uhrzeiten in eigene Ziffern-Spannen', () => {
    const html = renderToStaticMarkup(createElement('p', null, mitZiffern('von 07:00 bis 16:45 Uhr.')));
    expect(html).toBe(`<p>von <span class="ziffer">07:00</span> bis <span class="ziffer">16:45</span>${NBSP}Uhr.</p>`);
  });
});
