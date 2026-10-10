import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '@/components/ui/Toast';
import { FACTS } from '@/lib/content/facts';
import { MappeBlatt } from '../MappeBlatt';
import { MAPPE_KOPF } from '../text';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/bewerbung/mappe',
}));

const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

async function seite() {
  const { default: BewerbungsmappePage, metadata } = await import('@/app/bewerbung/mappe/page');
  const html = renderToStaticMarkup(createElement(ToastProvider, null, BewerbungsmappePage() as ReactElement));
  return { html, metadata };
}

describe('Seite /bewerbung/mappe (R5-MAPPE-01, E-023)', () => {
  it('trägt den Seitenkopf `arbeit` mit genau einer h1 und ohne rote Fläche im Kopf', async () => {
    const { html } = await seite();
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<h1 id="mappe-titel"[^>]*>Bewerbungsmappe erstellen\.<\/h1>/);
    const kopf = /<header[^>]*data-seitenkopf="arbeit"[^>]*>/.exec(html)?.[0] ?? '';
    expect(kopf).toContain('print-hidden');
    expect(kopf).not.toContain('data-primary-cta');
    // Die eine rote Hauptaktion steht am Pult des Werkzeugs
    expect(html.match(/bg-accent /g)).toHaveLength(1);
  });

  it('nennt im Kopf nur Belegtes: freiwillig (noCvNeeded), zwei Blätter A4, fünf Abschnitte, Weg ohne Mappe', async () => {
    const { html } = await seite();
    const text = plain(html);
    expect(text).toContain(FACTS.noCvNeeded.long);
    expect(text).toContain('Anschreiben und Lebenslauf auf A4.');
    expect(text).toContain('5 Abschnitte');
    expect(text).toContain('2 Seiten A4');
    expect(html).toMatch(/<a[^>]*href="\/bewerbung"[^>]*>Ohne Mappe /);
    expect(MAPPE_KOPF.masse.map((mass) => mass.wert)).toEqual(['5', '2']);
  });

  it('bleibt außerhalb des Index (Metadaten unverändert)', async () => {
    const { metadata } = await seite();
    expect(metadata.title).toBeDefined();
    expect(JSON.stringify(metadata.robots)).toMatch(/"index":false/);
  });
});

describe('MappeBlatt: Zeichnung des Kopfs (K-010)', () => {
  const html = renderToStaticMarkup(createElement(MappeBlatt));

  it('ist dekorativ, ohne Bewegung, mit Vorlauf und Rücklauf ins Anschreiben und den Maßen 210 und 297', () => {
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('data-motion');
    expect(html).toContain('data-zeichnung="mappe-blatt"');
    expect(html).toContain('>210</text>');
    expect(html).toContain('>297</text>');
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('bleibt unter dem Budget für Illustrationen (K-013)', () => {
    expect(Buffer.byteLength(html)).toBeLessThan(4096);
  });
});

describe('Druck-Tokenskala der Blätter (E-011, S-05)', () => {
  const css = readFileSync(path.join(__dirname, '../mappe.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

  it('nennt pt und mm nur in den --blatt-Tokens; die Regeln verwenden nur Tokens', () => {
    for (const zeile of css.split('\n')) {
      if (/\d(?:pt|mm)\b/.test(zeile)) expect(zeile.trim()).toMatch(/^--blatt-[a-z-]+:\s*[\d.]+(?:pt|mm);$/);
    }
    for (const m of css.matchAll(/font-size:\s*([^;]+);/g)) expect(m[1]).toMatch(/^var\(--/);
  });

  it('hält das Blatt im Druck auf A4 und lässt nur die Blätter drucken', () => {
    const druck = css.slice(css.lastIndexOf('@media print'));
    expect(druck).toMatch(/\.page\s*\{[^}]*width:\s*var\(--blatt-breite\)/);
    expect(druck).toMatch(/\.page\s*\{[^}]*break-after:\s*page/);
    expect(druck).toMatch(/\.seite\s*\{[^}]*position:\s*static/);
  });
});
