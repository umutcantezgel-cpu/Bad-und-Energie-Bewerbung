import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContactOptions } from '@/components/site/ContactOptions';
import { OpeningHoursText } from '@/components/site/OpeningHoursText';
import { COMPANY } from '@/lib/content/company';
import {
  OFFICE_HOURS_LINE,
  claimsInHtml,
  claimsInTextBody,
  findClaims,
  payFieldsInJson,
  payFieldsInXml,
  premiumPartnerPending,
  stripMarked,
  visibleText,
} from '../check-claims.mjs';

const claimsOf = (html: string) => claimsInHtml(html).map((c: { claim: string }) => c.claim);

describe('check-claims: verbotene Arbeitszeit-Aussagen (fakten-abgleich B28)', () => {
  it('findet feste Zeiten, „pünktlich …“, „Feste Arbeitszeiten“ und Wochenstunden', () => {
    const verboten = [
      'Freitags ab 13:30 Uhr Feierabend',
      'Mo–Do bis 16:45 Uhr',
      'Du bist jeden Abend pünktlich zu Hause.',
      'Ehrliches Handwerk. Pünktlich Feierabend.',
      'Freitags pünktlich ins Wochenende',
      'Feste Arbeitszeiten: Montag bis Donnerstag',
      'Eine 35-Stunden-Woche',
      '35 Std. pro Woche',
      '35Stunden',
      '40 Wochenstunden',
    ];
    for (const text of verboten) expect(findClaims(text), text).toHaveLength(1);
  });

  it('lässt die neuen Aussagen stehen: flexibel, jeden Abend zu Hause, 35 km, Gehalt pünktlich am 1. Werktag', () => {
    const erlaubt = [
      'Ehrliches Handwerk. Flexible Arbeitszeiten.',
      'Keine Fernmontagen und keine Hotelübernachtungen: Du bist jeden Abend zu Hause.',
      'Alle Baustellen liegen im Umkreis von 35 km um Wetzlar.',
      'Keine unbezahlten Überstunden.',
      'Dein Gehalt kommt pünktlich am 1. Werktag des Monats.',
      'Wir treffen uns diskret nach deinem Feierabend.',
      '8. Oktober 2026, 14:32 Uhr',
    ];
    for (const text of erlaubt) expect(findClaims(text), text).toEqual([]);
  });

  it('Maschinen-Zeitstempel der Feeds sind keine Arbeitszeit (Build um 13:30 oder 16:45)', () => {
    expect(findClaims('<lastBuildDate>Mon, 12 Oct 2026 13:30:07 GMT</lastBuildDate>')).toEqual([]);
    expect(findClaims('"dateModified":"2026-10-12T16:45:00.000Z"')).toEqual([]);
    expect(findClaims('bis 16:45 Uhr')).toHaveLength(1);
    expect(findClaims('(13:30)')).toHaveLength(1);
  });

  it('meldet jeden Treffer mit Umgebung', () => {
    const [treffer] = findClaims('Bei uns ist freitags um 13:30 Uhr Schluss.');
    expect(treffer.claim).toBe('13:30');
    expect(treffer.context).toContain('freitags um 13:30 Uhr Schluss');
  });
});

describe('check-claims: sichtbarer Text des HTML', () => {
  it('liest Text und die Attribute für Suchmaschinen und Hilfsmittel, ohne Skripte, Stile und Kommentare', () => {
    const html =
      '<html><head><title>T</title><meta name="description" content="Freitags ab 13:30 frei"/>' +
      '<script type="application/ld+json">{"closes":"16:45"}</script><style>.a{content:"13:30"}</style></head>' +
      '<body><!-- 16:45 --><p>Hallo</p><img alt="Uhr auf 13:30"/><script>self.__next_f.push("16:45")</script></body></html>';
    expect(visibleText(html)).toContain('Hallo');
    expect(claimsOf(html)).toEqual(['13:30', '13:30']);
  });

  it('löst Entities, geschützte Leerzeichen, Wortverbinder und weiche Trennstellen auf', () => {
    expect(claimsOf('<p>p&uuml;nktlich zu Hause</p>')).toEqual([]);
    expect(claimsOf('<p>pünktlich&nbsp;zu Hause</p>')).toEqual(['pünktlich zu Hause']);
    expect(claimsOf('<p>pünktlich&#xA0;Feier­abend</p>')).toEqual(['pünktlich Feierabend']);
    expect(claimsOf('<p>13⁠:30</p>')).toEqual(['13:30']);
  });

  it('nimmt Elemente mit data-claims="buerozeiten" samt verschachteltem Inhalt aus', () => {
    const html =
      '<p><span data-claims="buerozeiten"><span>Mo–Do 07:00–16:45 Uhr</span>, <span>Fr 07:00–13:30 Uhr</span></span>' +
      ' und danach <span>Feste Arbeitszeiten</span></p>';
    expect(stripMarked(html)).not.toContain('16:45');
    expect(stripMarked(html)).toContain('Feste Arbeitszeiten');
    expect(claimsOf(html)).toEqual(['Feste Arbeitszeiten']);
    // Nur die eine Markierung zählt; andere Werte von data-claims nehmen nichts aus
    expect(claimsOf('<span data-claims="anderes">13:30</span>')).toEqual(['13:30']);
    // Ohne schließendes Tag fällt nur das öffnende weg, der Rest wird geprüft
    expect(claimsOf('<div><span data-claims="buerozeiten">13:30')).toEqual(['13:30']);
  });

  it('die Bürozeiten der Website sind markiert und beschriftet: OpeningHoursText und ContactOptions', () => {
    const zeiten = renderToStaticMarkup(createElement(OpeningHoursText, { text: COMPANY.openingHours.short }));
    expect(zeiten).toMatch(/^<span data-claims="buerozeiten">/);
    expect(zeiten).toContain('16:45');
    expect(claimsOf(zeiten)).toEqual([]);
    for (const variant of ['card', 'inline', 'list'] as const) {
      const html = renderToStaticMarkup(createElement(ContactOptions, { variant }));
      expect(html, variant).toContain('13:30');
      expect(visibleText(html), variant).toContain('Büro erreichbar:');
      expect(visibleText(html), variant).not.toContain('Öffnungszeiten');
      expect(claimsOf(html), variant).toEqual([]);
    }
  });
});

describe('check-claims: Text-Routen (llms.txt, Feeds)', () => {
  it('nimmt in Textdateien nur Zeilen „Büro erreichbar:“ aus, auch als Listenpunkt', () => {
    expect(OFFICE_HOURS_LINE.test('Büro erreichbar: Mo–Do 07:00–16:45 Uhr')).toBe(true);
    expect(OFFICE_HOURS_LINE.test('- Büro erreichbar: Mo–Do 07:00–16:45 Uhr')).toBe(true);
    expect(OFFICE_HOURS_LINE.test('- Arbeitszeit: Mo–Do 07:00–16:45 Uhr')).toBe(false);
    const text = '# Firma\n- Büro erreichbar: Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr\n- Freitags ab 13:30 Uhr Feierabend\n';
    expect(claimsInTextBody(text, 'txt').map((c: { claim: string }) => c.claim)).toEqual(['13:30']);
  });

  it('liest XML ohne Tags und JSON nur in seinen Zeichenketten (auch \\u-Escapes)', () => {
    const xml = '<source><job><description><![CDATA[<p>Freitags ab 13:30 Uhr frei</p>]]></description></job></source>';
    expect(claimsInTextBody(xml, 'xml')).toHaveLength(1);
    const json = JSON.stringify({ jobs: [{ description: 'Du bist jeden Abend pünktlich zu Hause.' }], updated: '2026-10-12T13:30:00Z' });
    expect(claimsInTextBody(json, 'json').map((c: { claim: string }) => c.claim)).toEqual(['pünktlich zu Hause']);
    expect(claimsInTextBody('{"jobs":[{"description":"Flexible Arbeitszeiten."}]}', 'json')).toEqual([]);
  });
});

describe('check-claims: Beträge zu Lohn und Gehalt (E-030, Lohn auf Anfrage)', () => {
  const pay = (text: string) => findClaims(text, { premiumPending: false }).map((c: { claim: string }) => c.claim);

  it('findet Euro-Beträge in jeder Schreibweise, auch als Spanne', () => {
    expect(pay('Gehalt 3.600–4.600 € im Monat')).toEqual(['3.600–4.600 €']);
    expect(pay('Vergütung 1.050 - 1.400 €')).toEqual(['1.050 - 1.400 €']);
    expect(pay('ab 3600€ brutto')).toEqual(['3600€']);
    expect(pay('Stundenlohn € 15,50')).toEqual(['€ 15,50']);
    expect(pay('rund 4.000 Euro')).toEqual(['4.000 Euro']);
    expect(pay('Gehalt: 4600 EUR')).toEqual(['4600 EUR']);
    expect(pay('3.600 € - 4.600 € pro Monat')).toEqual(['3.600 €', '4.600 €']);
  });

  it('lässt Zahlen ohne Währung, „EUR“ ohne Zahl und „Lohn auf Anfrage“ stehen', () => {
    for (const text of [
      'Lohn auf Anfrage',
      'Alle Baustellen liegen im Umkreis von 35 km um Wetzlar.',
      '30 Tage Urlaub',
      'Seit 1926 in Wetzlar',
      'Hilti-22-V-Akku-Flotte',
      'Währung EUR',
      '0160 8834290',
    ]) {
      expect(pay(text), text).toEqual([]);
    }
  });

  it('findet Gehaltsfelder mit Zahl in Feeds (XML und JSON), auch ohne Währung im Text', () => {
    const xml = '<job><salarymin>3600</salarymin><salary><![CDATA[auf Anfrage]]></salary></job>';
    expect(payFieldsInXml(xml).map((c: { claim: string }) => c.claim)).toEqual(['<salarymin>']);
    expect(payFieldsInXml('<job><title>Monteur</title></job>')).toEqual([]);
    const ld = { '@type': 'JobPosting', baseSalary: { '@type': 'MonetaryAmount', value: { minValue: 3600 } } };
    expect(payFieldsInJson([ld]).map((c: { claim: string }) => c.claim)).toEqual(['baseSalary']);
    expect(payFieldsInJson({ title: 'Lohn auf Anfrage', industry: 'Sanitär-, Heizungs- und Klimatechnik' })).toEqual([]);
    expect(claimsInTextBody(JSON.stringify([ld]), 'json').map((c: { claim: string }) => c.claim)).toEqual(['baseSalary']);
    expect(
      claimsInTextBody('<source><job><salary>3.600 € pro Monat</salary></job></source>', 'xml').map((c: { claim: string }) => c.claim),
    ).toEqual(['3.600 €', '<salary>']);
  });

  it('im HTML: sichtbarer Text und Attribute; das JSON-LD prüft check-graph (Regel 9)', () => {
    expect(claimsOf('<p>Gehalt: 3.600–4.600&nbsp;€</p>')).toEqual(['3.600–4.600 €']);
    expect(claimsOf('<meta name="description" content="SHK-Job, 4.000 € im Monat"/>')).toEqual(['4.000 €']);
    expect(claimsOf('<script type="application/ld+json">{"salaryCurrency":"EUR","minValue":3600}</script><p>Lohn auf Anfrage</p>')).toEqual(
      [],
    );
  });
});

describe('check-claims: „Premium Partner“ bleibt gesperrt, solange der Fakt offen ist (fakten-abgleich S6, M-020)', () => {
  it('liest den Stand aus lib/content/facts.ts: offen oder fehlend sperrt, belegt gibt frei', () => {
    const offen = "boschPremiumPartner: {\n    short: 'x',\n    pending: { onlyForJobIds: [] },\n    source: 'a@b',\n  },";
    const belegt = "boschPremiumPartner: {\n    short: 'x',\n    source: 'docs/urkunde.md@abc1234',\n  },\n  andererFakt: { pending: {} },";
    expect(premiumPartnerPending(offen)).toBe(true);
    expect(premiumPartnerPending(belegt)).toBe(false);
    expect(premiumPartnerPending("vacation30: { short: '30 Tage Urlaub' }")).toBe(true);
    expect(premiumPartnerPending(readFileSync(path.resolve(process.cwd(), 'lib/content/facts.ts'), 'utf8'))).toBe(true);
  });

  it('findet jede Schreibweise, solange gesperrt; mit Beleg ist der Wortlaut frei', () => {
    for (const text of ['Bosch Premium Partner', 'Premium-Partner von Bosch', 'BOSCH PREMIUMPARTNER']) {
      expect(findClaims(text, { premiumPending: true }), text).toHaveLength(1);
      expect(findClaims(text, { premiumPending: false }), text).toEqual([]);
    }
    // Ohne Angabe gilt der Stand von facts.ts (offen): gesperrt, auch in Attributen
    expect(findClaims('Wir sind Bosch Premium Partner.')).toHaveLength(1);
    expect(claimsOf('<img alt="Bosch Premium Partner"/>')).toEqual(['Premium Partner']);
  });
});
