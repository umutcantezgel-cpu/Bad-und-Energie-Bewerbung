import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/components/ui/Toast';
import { getMappeJobOptions, getMappeRecipient } from '@/lib/mappe/context';
import { MappeTool } from '../MappeTool';
import styles from '../mappe.module.css';
import { MAPPE_ABSCHNITTE } from '../stand';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
}));

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
      'Vorschau',
    ]);
    expect(html).toContain('Mit dieser Mappe bewerben');
    expect(html).toContain('Als PDF speichern');
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
    // The frame scrolls inside the sticky column from 64em on (mappe.module.css).
    const css = readFileSync(path.join(__dirname, '../mappe.module.css'), 'utf8');
    const desktop = css.slice(css.indexOf('@media (min-width: 64em)'));
    expect(desktop).toMatch(/\.vorschauRahmen\s*\{[^}]*overflow-y:\s*auto/);
    expect(desktop).toMatch(/\.seite\s*\{[^}]*position:\s*sticky/);
    // The heading comes before the scroll container, so it is never clipped or scrolled away.
    expect(html.indexOf('id="mappe-vorschau-title"')).toBeLessThan(match?.index ?? -1);
  });

  it('labels the reorder controls only once entries exist', () => {
    expect(html).not.toContain('nach oben verschieben');
    expect(html).toContain('Berufserfahrung hinzufügen');
  });

  it('uses the own icon family only (no lucide)', () => {
    expect(html).not.toContain('lucide');
    for (const icon of ['camera', 'chevron-down', 'plus', 'printer', 'message-circle', 'arrow-right']) {
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
    const liste = /<ol[^>]*aria-label="Abschnitte der Mappe"[^>]*>(.*?)<\/ol>/s.exec(html)?.[1] ?? '';
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
    const knopf = /<button[^>]*>(?:(?!<\/button>).)*Mit dieser Mappe bewerben/s.exec(html)?.[0] ?? '';
    expect(knopf).toContain('after:border-l-vorlauf');
    expect(knopf).toContain('bg-accent');
  });
});

describe('Mappe per WhatsApp (E-BEW-020)', () => {
  const html = render();
  const link = /<a[^>]*data-mappe-whatsapp=""[^>]*>/.exec(html)?.[0] ?? '';

  it('opens WhatsApp in a new tab with the company number and a prefilled text without placeholder data', () => {
    expect(link).toContain('target="_blank"');
    expect(link).toContain('rel="noopener noreferrer"');
    const href = (/href="([^"]+)"/.exec(link)?.[1] ?? '').replace(/&amp;/g, '&');
    expect(href).toMatch(/^https:\/\/api\.whatsapp\.com\/send\?phone=49644142956&text=/);
    const message = decodeURIComponent(href.split('text=')[1]);
    expect(message).toContain('Bewerbungsmappe (Anschreiben und Lebenslauf)');
    expect(message).toContain('Die Mappe als PDF hänge ich hier im Chat an.');
    expect(message).not.toMatch(/Name:|Stelle:|undefined|null|Muster/);
  });

  it('says how the PDF gets into the chat', () => {
    expect(plain(html)).toContain('Das PDF hängst du danach im Chat an.');
    expect(plain(html)).toContain('06441 42956');
  });
});
