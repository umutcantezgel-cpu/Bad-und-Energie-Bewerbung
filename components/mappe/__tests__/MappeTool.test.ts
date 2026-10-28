import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ToastProvider } from '@/components/ui/Toast';
import { getMappeJobOptions, getMappeRecipient } from '@/lib/mappe/context';
import { MappeTool } from '../MappeTool';
import styles from '../mappe.module.css';
import { MAPPE_ABSCHNITTE } from '../stand';
import { ZEICHEN_TEXT, ZeichenHinweis } from '../ZeichenHinweis';
import { zeichenText } from '../PdfHerunterladen';

function render(): string {
  return renderToStaticMarkup(
    createElement(
      ToastProvider,
      null,
      createElement(MappeTool, { jobs: getMappeJobOptions(), recipient: getMappeRecipient() }),
    ),
  );
}

/** Text ohne Tags, Leerraum (auch geschützt) zusammengefasst. */
const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

describe('MappeTool (server render)', () => {
  const html = render();

  it('renders the checklist, the five editor steps, the preview and all actions', () => {
    const headings = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
    expect(headings).toEqual([
      'Stand deiner Mappe',
      'Persönliches',
      'Stelle',
      'Schwerpunkte',
      'Arbeitsstil und Anschreiben',
      'Berufserfahrung und Ausbildung',
      'Mehr im Lebenslauf',
      'Aufbau des Lebenslaufs',
      'Design',
      'Vorschau',
    ]);
    // Mehr im Lebenslauf (L5): der Satz zu sensiblen Angaben neutral, acht Führerschein-Chips mit Namen „Klasse …“
    expect(html).toContain('Angaben zu Religion, Gesundheit, Partei oder Gewerkschaft brauchen wir für deine Bewerbung nicht.');
    for (const klasse of ['AM', 'A1', 'B', 'BE', 'C1', 'C1E', 'C', 'CE']) {
      expect(html).toContain(`<span class="sr-only">Klasse </span>${klasse}</button>`);
    }
    expect(html).toContain('Mit dieser Mappe bewerben');
    // Zweitwege (L4): PDF herunterladen (im Browser gesetzt), Drucken, WhatsApp
    expect(html).toContain('PDF herunterladen');
    expect(html).toContain('Fertiges A4-PDF. Es entsteht auf deinem Gerät.');
    expect(html).toContain('Drucken');
    expect(html).toContain('Öffnet den Druckdialog deines Browsers.');
    expect(html).not.toContain('Als PDF speichern');
    expect(html).toContain('Per WhatsApp schicken');
    expect(html.match(/<h1/g)).toBeNull();
  });

  it('starts without invented data', () => {
    expect(html).not.toMatch(/undefined|Alexander Koch|Mittelhessen|Gesellenbrief/);
    expect(html).toContain('Noch keine Berufserfahrung eingetragen.');
    expect(html).toContain('Noch kein Abschluss eingetragen.');
    expect(html).toContain('Sehr geehrter Herr Demir,');
  });

  it('offers every flow job plus the initiative option', () => {
    for (const job of getMappeJobOptions()) expect(html).toContain(`value="${job.id}"`);
    expect(html).toContain('value="initiativ"');
  });

  it('scrolls the rounded preview frame itself, with the heading outside the scroller', () => {
    const match = /<section[^>]*aria-labelledby="mappe-vorschau-title"[^>]*>/.exec(html);
    const section = match?.[0] ?? '';
    expect(section).toContain(styles.vorschauRahmen);
    expect(section).toMatch(/\brounded-2\b/);
    expect(section).toContain('tabindex="0"');
    // The frame scrolls inside the sticky column from 64em wide and 56em tall (mappe.module.css).
    const css = readFileSync(path.join(__dirname, '../mappe.module.css'), 'utf8');
    const desktop = css.slice(css.indexOf('@media (min-width: 64em)'));
    expect(desktop).toMatch(/\.vorschauRahmen\s*\{[^}]*overflow-y:\s*auto/);
    expect(desktop).toMatch(/\.seite\s*\{[^}]*position:\s*sticky/);
    // The heading comes before the scroll container, so it is never clipped or scrolled away.
    expect(html.indexOf('id="mappe-vorschau-title"')).toBeLessThan(match?.index ?? -1);
  });

  it('Betreff (L5): eigenes Feld vor dem Anschreiben, mit dem Vorschlag und ohne „Vorschlag nehmen“; kein Zeichen-Hinweis', () => {
    // Mehrzeilig (ganzer Vorschlag sichtbar), Inhalt als Text der textarea
    const treffer = /<textarea([^>]*name="betreff"[^>]*)>([^<]*)<\/textarea>/.exec(html);
    const feld = treffer?.[1] ?? '';
    expect(treffer?.[2]).toBe('Bewerbung');
    expect(feld).toMatch(/rows="3"/);
    expect(feld).toMatch(/maxlength="160"/i);
    expect(feld).toMatch(/autocomplete="off"/i);
    expect(html.indexOf('name="betreff"')).toBeLessThan(html.indexOf('name="anschreiben"'));
    expect(plain(html)).toContain('Aus der Stelle entsteht der Betreff, aus Stelle, Schwerpunkten und Arbeitsstil das Anschreiben.');
    expect(plain(html)).toContain('Bestimmt den Vorschlag für den Betreff und die Einleitung des Anschreibens.');
    expect(html).not.toContain('Vorschlag nehmen');
    expect(html).not.toContain('data-mappe-zeichen');
  });

  it('labels the reorder controls of entries only once entries exist; the Aufbau names each section', () => {
    expect(html).not.toContain('Eintrag 1 nach oben verschieben');
    expect(html).toContain('Berufserfahrung hinzufügen');
    expect(html).toContain('Sprache hinzufügen');
    // Aufbau (L5): acht Zeilen, je ein Paar Pfeile mit dem Namen des Abschnitts; oben und unten gesperrt
    for (const name of ['Kurzprofil', 'Berufserfahrung', 'Schule und Ausbildung', 'Schwerpunkte', 'Sprachen', 'Führerschein', 'Interessen', 'Eigener Abschnitt']) {
      expect(html).toContain(`aria-label="${name} nach oben verschieben"`);
      expect(html).toContain(`aria-label="${name} nach unten verschieben"`);
    }
    expect(html).toMatch(/<button[^>]*aria-label="Kurzprofil nach oben verschieben"[^>]*disabled=""/);
    expect(html).toMatch(/<button[^>]*aria-label="Eigener Abschnitt nach unten verschieben"[^>]*disabled=""/);
  });

  it('uses the own icon family only (no lucide)', () => {
    expect(html).not.toContain('lucide');
    for (const icon of ['camera', 'chevron-down', 'plus', 'download', 'printer', 'message-circle', 'arrow-right']) {
      expect(html).toContain(`data-icon="${icon}"`);
    }
  });
});

describe('Mappe-Stand (E-BEW-006/007) on an empty mappe', () => {
  const html = render();
  const text = plain(html);

  it('shows „0 von 5 erledigt“ and every section as open', () => {
    expect(text).toContain('0 von 5 erledigt');
    expect(html.match(/data-erledigt/g)).toBeNull();
    expect(text.match(/Abschnitt \d von 5 · offen/g)).toHaveLength(5);
  });

  it('links each checklist entry to an existing section anchor, in editor order', () => {
    const liste = /<ol[^>]*aria-label="Abschnitte der Mappe"[^>]*>([\s\S]*?)<\/ol>/.exec(html)?.[1] ?? '';
    const ziele = [...liste.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    expect(ziele).toEqual(MAPPE_ABSCHNITTE.map((abschnitt) => abschnitt.id));
    for (const id of ziele) expect(html).toContain(`<section id="${id}"`);
  });

  it('draws one ring at 0 %, readable as text for screen readers', () => {
    const ringe = html.match(/role="meter"/g) ?? [];
    expect(ringe).toHaveLength(1);
    const ring = /<div role="meter"[^>]*>/.exec(html)?.[0] ?? '';
    expect(ring).toContain('aria-label="Stand deiner Mappe"');
    expect(ring).toContain('aria-valuenow="0"');
    expect(ring).toContain('aria-valuemax="5"');
    expect(ring).toContain('aria-valuetext="0 von 5 erledigt"');
    expect(ring).toContain('data-anteil="0"');
    expect(ring).not.toContain('data-geschlossen');
  });

  it('points „Als Nächstes“ to the first open section and lets the pair run into the main action', () => {
    expect(text).toContain('Als Nächstes Persönliches');
    const knopf = /<button[^>]*>(?:(?!<\/button>)[\s\S])*Mit dieser Mappe bewerben/.exec(html)?.[0] ?? '';
    expect(knopf).toContain('after:border-l-vorlauf');
    expect(knopf).toContain('bg-accent');
  });
});

describe('Zeichen-Hinweis (L5)', () => {
  type Fund = Parameters<typeof ZeichenHinweis>[0]['funde'][number];
  const zeige = (funde: Fund[]) => renderToStaticMarkup(createElement(ZeichenHinweis, { funde }));

  it('erscheint nur mit Funden, als Notiz mit Titel', () => {
    expect(zeige([])).toBe('');
    const html = zeige([{ ort: 'Anschreiben', nurDownload: false, fehlen: [], fallenWeg: ['😊'] }]);
    expect(html).toMatch(/^<div role="note" aria-labelledby="mappe-zeichen-titel"/);
    expect(html).toContain('data-mappe-zeichen=""');
    expect(html).not.toContain('aria-live');
    expect(plain(html)).toBe(`${ZEICHEN_TEXT.titel} ${ZEICHEN_TEXT.fallenWeg} Anschreiben: 😊`);
  });

  it('Inhalte ohne Glyphe: kein PDF, mit dem Satz übers Team; Name und Kontakt nur für das PDF zum Herunterladen', () => {
    const text = plain(
      zeige([
        { ort: 'Name', nurDownload: true, fehlen: ['Я', 'н'], fallenWeg: [] },
        { ort: 'Telefon', nurDownload: true, fehlen: [], fallenWeg: ['📞'] },
        { ort: 'Anschreiben', nurDownload: false, fehlen: ['Ж'], fallenWeg: ['😊'] },
      ]),
    );
    expect(text).toBe(
      [
        'Diese Zeichen fehlen im PDF',
        'Damit entsteht kein PDF: Anschreiben: Ж',
        'Damit entsteht dein PDF zum Herunterladen nicht: Name: Я н',
        'Fallen weg, der übrige Text bleibt: Anschreiben: 😊',
        'Fehlen in deinem PDF zum Herunterladen, der übrige Text bleibt: Telefon: 📞',
        'Ersetze diese Zeichen oder nimm „Drucken“. Das Team bekommt deine Mappe auch ohne PDF, als Text in der E-Mail.',
      ].join(' '),
    );
  });

  it('nur Name oder Kontakt ohne Glyphe: kein Satz übers Team; höchstens 8 Zeichen je Ort', () => {
    const text = plain(zeige([{ ort: 'Name', nurDownload: true, fehlen: [...'Олександра'], fallenWeg: [] }]));
    expect(text).toContain('Name: О л е к с а н д …');
    expect(text).toContain(ZEICHEN_TEXT.ersetzen);
    expect(text).not.toContain('Das Team bekommt');
  });
});

describe('Mappe per WhatsApp (E-BEW-020)', () => {
  const html = render();
  const link = /<a[^>]*data-mappe-whatsapp=""[^>]*>/.exec(html)?.[0] ?? '';

  it('opens WhatsApp in a new tab with the company number and a prefilled text without placeholder data', () => {
    expect(link).toContain('target="_blank"');
    expect(link).toContain('rel="noopener noreferrer"');
    const href = (/href="([^"]+)"/.exec(link)?.[1] ?? '').replace(/&amp;/g, '&');
    expect(href).toMatch(/^https:\/\/api\.whatsapp\.com\/send\?phone=491608834290&text=/);
    const message = decodeURIComponent(href.split('text=')[1]);
    expect(message).toContain('Bewerbungsmappe (Anschreiben und Lebenslauf)');
    expect(message).toContain('Die Mappe als PDF hänge ich hier im Chat an.');
    expect(message).not.toMatch(/Name:|Stelle:|undefined|null|Muster/);
  });

  it('says how the PDF gets into the chat', () => {
    expect(plain(html)).toContain('Das PDF hängst du danach im Chat an.');
    expect(plain(html)).toContain('Vorausgefüllter Text an 0160 8834290');
    expect(plain(html)).not.toContain('Text an 06441 42956');
  });
});

describe('zeichenText (PDF herunterladen, L5)', () => {
  it('verweist auf den Zeichen-Hinweis, statt die Zeichen ein zweites Mal zu nennen; ohne Hinweis zählt er sie auf', () => {
    expect(zeichenText(['Д'], true)).toBe(
      'Mit einigen Zeichen deiner Mappe entsteht kein PDF. Welche das sind, steht im Hinweis unter „Per WhatsApp schicken“.',
    );
    expect(zeichenText(['Д', 'я'])).toBe(
      'Deine Mappe enthält Zeichen, die unsere Schrift nicht hat: Д я. Nimm „Drucken“ (dort auch als PDF speichern) oder ersetze sie.',
    );
    // Mehr als zehn: „…“ ohne Punkt dahinter
    expect(zeichenText([...'ДякуюПривіт'])).toContain(': Д я к у ю П р и в і … Nimm „Drucken“');
  });
});
