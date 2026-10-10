import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ErrorPage from '@/app/error';
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
// Gelesener Text ohne Skripte: seit V6-B steht der JSON-LD-Graph der Seite vor dem Inhalt (Screenreader lesen ihn nicht).
const text = plain(html.replace(/<script\b[\s\S]*?<\/script>/g, ''));

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
    const aktion = html.match(new RegExp(`<a ([^>]*href="${APPLY_PATH}"[^>]*)><span>([^<]+)</span>`));
    expect(aktion).not.toBeNull();
    expect(aktion![1]).toContain('data-motion="druck"');
    expect(aktion![2]).toBe('Jetzt bewerben');
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
    expect(url.searchParams.get('phone')).toBe('491608834290');
    expect(url.searchParams.get('phone')).toBe(COMPANY.whatsapp.e164.replace(/\D/g, ''));
    expect(whatsapp![2]).toMatch(/target="_blank"/);
    expect(whatsapp![2]).toMatch(/rel="noopener noreferrer"/);
    expect(FEHLER_WHATSAPP).toMatch(/^Guten Tag Herr Demir, /);
    expect(FEHLER_WHATSAPP).not.toMatch(/mechaniker|techniker|monteur|ausbildung|azubi/i);
    expect(text).toContain(COMPANY.managingDirector.name);
  });

  it('Texte nur aus Fakten: Mikrotext wortgleich mit dem Einstieg, Ort aus COMPANY, Rückmeldung aus quickResponse', () => {
    expect(FEHLER_MIKROTEXT).toBe(HERO.microcopy);
    expect(html).toContain(FEHLER_MIKROTEXT);
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

describe('Laufzeit-Fehlerseite app/error.tsx (E-SHELL-028, nur Darstellung)', () => {
  const fehler = Object.assign(new Error('Probe'), { digest: 'abc123' });
  const markup = renderToStaticMarkup(createElement(ErrorPage, { error: fehler, retry: () => {} }));
  const inhalt = plain(markup);

  it('Texte unverändert: h1, Hinweis, Fehlernummer, Wiederholung, Startseite, Telefon und WhatsApp', () => {
    expect(plain(markup.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)![1])).toBe('Da ist etwas schiefgelaufen.');
    expect(inhalt).toContain('Bitte versuch es noch einmal. Wenn es weiter hakt, erreichst du uns direkt per Telefon oder WhatsApp.');
    expect(inhalt).toContain('Fehlernummer: abc123');
    expect(markup).toMatch(/<button type="button"[^>]*>[\s\S]*?Erneut versuchen<\/button>/);
    expect(markup).toMatch(/<a [^>]*href="\/"[^>]*>Zur Startseite<\/a>/);
    expect(markup).toContain(`href="${COMPANY.phone.href}"`);
    expect(markup).toMatch(/href="https:\/\/api\.whatsapp\.com\/send\?[^"]+" target="_blank" rel="noopener noreferrer"/);
  });

  it('im System: Etikett, h1 in Bricolage und Marken-Navy, Icons der eigenen Familie', () => {
    expect(markup).toMatch(/<p class="text-etikett[^"]*">Technischer Fehler<\/p>/);
    expect(markup).toMatch(/<h1 class="[^"]*font-display[^"]*text-brand/);
    expect(markup.match(/data-icon="(rotate-ccw|phone|message-circle)"/g)).toHaveLength(3);
  });
});

