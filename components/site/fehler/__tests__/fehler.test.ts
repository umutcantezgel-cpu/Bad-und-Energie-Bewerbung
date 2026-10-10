import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import NotFound, { metadata } from '@/app/not-found';
import { HERO } from '@/components/home/content';
import { APPLY_PATH } from '@/components/site/nav';
import { OFFENE_LEITUNG_TITEL } from '@/components/zeichnung';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { MOTION_IDS } from '@/lib/motion/register';
import {
  FEHLER_EINLEITUNG,
  FEHLER_MIKROTEXT,
  FEHLER_TITEL,
  FEHLER_WEGE,
  FEHLER_WHATSAPP,
  FEHLER_ZWEITWEG,
} from '../fehler-text';

const ROOT = path.resolve(__dirname, '../../../..');
const html = renderToStaticMarkup(createElement(NotFound));
const plain = (markup: string) =>
  markup
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
const text = plain(html);

describe('404-Seite (R4-404 in R5-RUHE)', () => {
  it('E-SHELL-025: genau eine h1 mit „Rohrleitung verirrt“, sicherer Satz ohne „wohl“, keine eigene <main>', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    const h1 = plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)![1]);
    expect(h1).toBe(FEHLER_TITEL);
    expect(h1).toContain('Rohrleitung verirrt');
    expect(h1).not.toMatch(/\bwohl\b/);
    expect(html).not.toMatch(/<main\b/);
  });

  it('„Fehler 404“ ist der erste Satz für Screenreader; der Code steht als Maß an der Zeichnung', () => {
    expect(text.startsWith('Fehler 404: Seite nicht gefunden')).toBe(true);
    expect(html).toMatch(/<span class="sr-only">Fehler 404: <\/span>Seite nicht gefunden/);
    expect(text).toContain('404 Fehlercode');
  });

  it('Kopf in der Variante erzaehl mit der offenen Leitung als Bild mit Titel', () => {
    expect(html).toContain('data-seitenkopf="erzaehl"');
    expect(html).toMatch(/<svg [^>]*data-zeichnung="offene-leitung"[^>]*role="img"/);
    expect(html).toContain(`<title>${OFFENE_LEITUNG_TITEL}</title>`);
  });

  it('E-SHELL-026: drei Wege – Bewerbung (rot, mit Vorlauf), Stellen und Startseite', () => {
    expect(html).toMatch(new RegExp(`<a [^>]*href="${APPLY_PATH}"[^>]*data-motion="druck"[^>]*><span>Jetzt bewerben</span>`));
    expect(html).toContain('data-zeichnung="seitenkopf-leitung"');
    expect(html).toContain('data-primary-cta=""');
    expect(html).toContain(`href="${FEHLER_ZWEITWEG.href}"`);
    expect(FEHLER_ZWEITWEG.href).toBe('/jobs');
    expect(FEHLER_WEGE.map((weg) => weg.href)).toEqual(['/', '/#ablauf', '/#faq']);
    for (const weg of FEHLER_WEGE) expect(html).toContain(`href="${weg.href}"`);
  });

  it('E-SHELL-027: Schneller Direktkontakt mit Telefon und WhatsApp mit Text (neuer Tab, ohne Berufsangabe)', () => {
    expect(text).toContain('Schneller Direktkontakt');
    expect(html).toContain(`href="${COMPANY.phone.href}"`);
    expect(text).toContain(COMPANY.phone.display);
    const whatsapp = html.match(/<a href="(https:\/\/api\.whatsapp\.com\/send\?[^"]+)"([^>]*)>/);
    expect(whatsapp).not.toBeNull();
    const url = new URL(whatsapp![1].replace(/&amp;/g, '&'));
    expect(url.searchParams.get('text')).toBe(FEHLER_WHATSAPP);
    expect(url.searchParams.get('phone')).toBe(COMPANY.phone.e164.replace(/\D/g, ''));
    expect(whatsapp![2]).toMatch(/target="_blank"/);
    expect(whatsapp![2]).toMatch(/rel="noopener noreferrer"/);
    expect(FEHLER_WHATSAPP).toMatch(/^Guten Tag Herr Demir, /);
    expect(FEHLER_WHATSAPP).not.toMatch(/mechaniker|techniker|monteur|ausbildung|azubi/i);
    expect(text).toContain(COMPANY.managingDirector.name);
  });

  it('Texte nur aus Fakten: Mikrotext wortgleich mit dem Einstieg, Ort aus COMPANY, Rückmeldung aus quickResponse', () => {
    expect(FEHLER_MIKROTEXT).toBe(HERO.microcopy);
    expect(text).toContain(plain(FEHLER_MIKROTEXT.replace(/ /g, ' ')).replace(/ /g, ' '));
    expect(FEHLER_EINLEITUNG).toContain(COMPANY.address.city);
    expect(text).toContain(FACTS.quickResponse.long);
  });

  it('Metadaten: Titel bleibt, robots nur das 404-noindex von Next (kein doppeltes robots-Meta)', () => {
    expect(metadata.title).toBe('Seite nicht gefunden');
    expect(metadata.robots).toBeNull();
  });

  it('Bewegung nur mit Registerkennungen, keine lucide-Importe, Server-Komponenten', () => {
    for (const [, id] of html.matchAll(/data-motion="([^"]+)"/g)) expect(MOTION_IDS).toContain(id);
    for (const datei of ['app/not-found.tsx', 'app/error.tsx', 'components/site/fehler/FehlerSeite.tsx', 'components/site/fehler/fehler-text.ts']) {
      const quelle = readFileSync(path.join(ROOT, datei), 'utf8');
      expect(quelle).not.toMatch(/lucide-react/);
      if (datei !== 'app/error.tsx') expect(quelle).not.toMatch(/['"]use client['"]/);
    }
  });
});
