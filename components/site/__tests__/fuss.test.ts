import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { COMPANY } from '@/lib/content/company';
import { jobPath } from '@/lib/jobs/format';
import { getActiveJobs } from '@/lib/jobs/registry';
import { MOTION_IDS } from '@/lib/motion/register';
import { DEFAULT_WHATSAPP_MESSAGE } from '@/lib/utils/whatsapp-utils';
import { ContactOptions } from '../ContactOptions';
import { BEWERBERDATEN_ANKER, FussSchmal, FussVoll, KUNDEN_WEBSITE, RECHTS_LINKS, fussKontakte, pflichtzeile } from '../fuss';
import { OpeningHoursText } from '../OpeningHoursText';
import { StickyApplyBarClient } from '../StickyApplyBarClient';

// next/image braucht die Bildmaße des statischen Imports; hier genügt das Logo als einfaches Bild.
vi.mock('@/components/brand/Logo', () => ({
  Logo: () => createElement('img', { alt: 'Bad und Energie GmbH Lahn Dill', 'data-logo': '' }),
}));

const ROOT = path.resolve(__dirname, '../../..');
const quelle = (datei: string) => readFileSync(path.join(ROOT, datei), 'utf8');
const unescape = (html: string) =>
  html.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const plain = (html: string) => unescape(html.replace(/<[^>]+>/g, '')).replace(/ /g, ' ').replace(/\s+/g, ' ');
const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => unescape(m[1]));
const motionIds = (html: string) => [...html.matchAll(/data-motion="([^"]+)"/g)].map((m) => m[1]);

const STICHTAG = new Date('2026-10-10T12:00:00+02:00');
const voll = renderToStaticMarkup(createElement(FussVoll, { year: 2026, now: STICHTAG }));
const vollText = plain(voll);
const schmal = renderToStaticMarkup(createElement(FussSchmal, { year: 2026 }));
const schmalText = plain(schmal);

describe('Fuß: Navy-Band im Design des Einstiegs (R4-SHELL-02, E-023)', () => {
  it('ist ein Inverse-Band mit dem Leitungspaar als oberem Abschluss, ohne h1 und ohne rote Fläche', () => {
    for (const html of [voll, schmal]) {
      expect(html).toMatch(/^<footer data-tone="inverse"/);
      expect(html).toContain('data-zeichnung="leitungstrenner"');
      expect(html).not.toMatch(/<h1\b/);
      expect(html).not.toMatch(/bg-accent|var\(--accent\)/);
      expect(html).toContain('print-hidden');
    }
  });

  it('zeigt das Logo als Weg zur Startseite und die Spaltenköpfe als Etikett (h2)', () => {
    expect(voll).toContain('data-logo=""');
    expect(hrefs(voll)).toContain('/');
    expect(vollText).toContain('zur Startseite');
    for (const titel of ['Betrieb', 'Kontakt', 'Stellen', 'Rechtliches', 'Einsatzgebiet']) {
      expect(voll).toMatch(new RegExp(`<h2 id="footer-[a-z]+" class="[^"]*text-etikett[^"]*">${titel}</h2>`));
    }
  });

  it('nennt Firma, Anschrift und Öffnungszeiten aus COMPANY, Ziffern in Bricolage', () => {
    expect(vollText).toContain(COMPANY.name);
    expect(vollText).toContain(COMPANY.address.street);
    expect(vollText).toContain(`${COMPANY.address.postalCode} ${COMPANY.address.city}`);
    expect(vollText).toContain(COMPANY.openingHours.short);
    expect(voll).toContain('<span class="ziffer">07:00–16:45</span>');
    expect(voll).toContain(`<span class="ziffer">${COMPANY.address.postalCode}</span>`);
  });
});

describe('E-SHELL-005 · WhatsApp-Direktweg im Fuß', () => {
  it('Telefon, WhatsApp, E-Mail in fester Reihenfolge (WCAG 3.2.6)', () => {
    expect(fussKontakte().map((k) => k.id)).toEqual(['phone', 'whatsapp', 'email']);
    const wege = hrefs(voll).filter((h) => /^(tel:|mailto:|https:\/\/api\.whatsapp)/.test(h));
    expect(wege[0]).toBe(COMPANY.phone.href);
    expect(wege[1]).toContain('api.whatsapp.com');
    expect(wege[2]).toBe(COMPANY.emailHref);
  });

  it('öffnet im neuen Tab mit noopener, Text ohne Berufsangabe, mit Hinweis für Screenreader', () => {
    const wa = fussKontakte().find((k) => k.id === 'whatsapp');
    expect(wa?.extern).toBe(true);
    expect(decodeURIComponent(wa?.href ?? '')).toContain(DEFAULT_WHATSAPP_MESSAGE);
    expect(decodeURIComponent(wa?.href ?? '')).not.toMatch(/Anlagenmechaniker|Kundendienst|Monteur|Azubi|Ausbildung/);
    expect(voll).toMatch(/<a href="https:\/\/api\.whatsapp\.com[^"]*"[^>]*target="_blank" rel="noopener noreferrer"/);
    expect(vollText).toContain('WhatsApp Direktkontakt (öffnet in neuem Tab)');
  });

  it('auch im schmalen Fuß des Fokusmodus, dort mit dem Text zu den Bewerbungsschritten und ohne E-Mail', () => {
    const wege = fussKontakte({ fokus: true });
    expect(wege.map((k) => k.id)).toEqual(['phone', 'whatsapp']);
    expect(decodeURIComponent(wege[1].href)).toContain('Bewerbungsschritten');
    expect(schmal).toMatch(/<a href="https:\/\/api\.whatsapp\.com[^"]*"[^>]*target="_blank" rel="noopener noreferrer"/);
    expect(schmal).not.toContain('mailto:');
    expect(schmal).not.toContain('/jobs');
  });
});

describe('E-SHELL-008 · Zur Kunden-Website', () => {
  it('beschrifteter Link auf https://bad-energie.de im neuen Tab, Domain als Ziel-Hinweis', () => {
    expect(KUNDEN_WEBSITE.href).toBe('https://bad-energie.de');
    expect(voll).toMatch(/<a href="https:\/\/bad-energie\.de" class="[^"]*" data-motion="druck" target="_blank" rel="noopener noreferrer">/);
    expect(vollText).toContain('Zur Kunden-Website (öffnet in neuem Tab)');
    expect(vollText).toContain('bad-energie.de');
  });
});

describe('E-RECHT-008 · Datenschutz für Bewerbende', () => {
  it('Rechtslinks in beiden Füßen, der dritte springt zum Abschnitt #bewerberdaten', () => {
    expect(RECHTS_LINKS.map((l) => l.href)).toEqual(['/impressum', '/datenschutz', `/datenschutz#${BEWERBERDATEN_ANKER}`]);
    for (const html of [voll, schmal]) {
      for (const link of RECHTS_LINKS) expect(hrefs(html)).toContain(link.href);
      expect(plain(html)).toContain('Datenschutz für Bewerbende');
      expect(plain(html)).not.toMatch(/§\s?26|Paragraph 26/);
    }
  });

  it('die Sprungmarke existiert auf /datenschutz', () => {
    expect(quelle('app/datenschutz/page.tsx')).toMatch(new RegExp(`id="${BEWERBERDATEN_ANKER}"`));
  });
});

describe('Stellen, Ortsliste und Fußzeile', () => {
  it('verlinkt jede live Stelle und „Alle Stellen“', () => {
    for (const job of getActiveJobs()) expect(hrefs(voll)).toContain(jobPath(job));
    expect(hrefs(voll)).toContain('/jobs');
  });

  it('eine abgelaufene Stelle bekommt keinen Fußlink mehr', () => {
    const spaeter = renderToStaticMarkup(createElement(FussVoll, { year: 2027, now: new Date('2027-01-15T12:00:00+01:00') }));
    const ausbildung = getActiveJobs().find((job) => job.category === 'ausbildung');
    expect(ausbildung).toBeDefined();
    expect(hrefs(spaeter)).not.toContain(jobPath(ausbildung!));
    expect(hrefs(spaeter)).toContain('/jobs');
  });

  it('bindet die Ortsliste ein und nennt Register, Gericht und Innung (E-RECHT-007, E-SHELL-018)', () => {
    expect(voll).toContain('id="footer-einsatzgebiet"');
    expect(pflichtzeile(2026)).toBe(`© 2026 ${COMPANY.legalName} · ${COMPANY.register.full} · ${COMPANY.innung}`);
    expect(vollText).toContain(COMPANY.register.full);
    expect(schmalText).toContain(COMPANY.innung);
  });

  it('Bewegung nur über Registerkennungen, keine lucide-Icons in den Dateien des Pakets', () => {
    for (const id of [...motionIds(voll), ...motionIds(schmal)]) expect(MOTION_IDS).toContain(id);
    expect(motionIds(voll)).toEqual(expect.arrayContaining(['druck', 'unterstrich']));
    for (const datei of [
      'components/site/SiteFooter.tsx',
      'components/site/FooterPlaces.tsx',
      'components/site/StickyApplyBar.tsx',
      'components/site/StickyApplyBarClient.tsx',
      'components/site/ContactOptions.tsx',
      'components/site/fuss/FussVoll.tsx',
      'components/site/fuss/FussSchmal.tsx',
      'components/site/fuss/FussLink.tsx',
    ]) {
      expect(quelle(datei)).not.toContain('lucide-react');
    }
  });
});

describe('OpeningHoursText', () => {
  it('bricht nur zwischen den Tagesgruppen um und setzt die Zeiten in Bricolage-Ziffern', () => {
    const html = renderToStaticMarkup(createElement(OpeningHoursText, { text: COMPANY.openingHours.short }));
    expect(plain(html)).toBe(COMPANY.openingHours.short);
    expect(html.match(/<span class="whitespace-nowrap">/g)).toHaveLength(2);
    expect(html).toContain('<span class="ziffer">07:00–13:30</span>');
  });
});

describe('ContactOptions im Formsystem (rückwärtskompatibel)', () => {
  it('card mit Person: Etikett, Name in der Rohrklammer; Kanalnamen als Etikett; Druck-Rückmeldung', () => {
    const html = renderToStaticMarkup(
      createElement(ContactOptions, { variant: 'card', person: { name: 'Sabri Demir', role: 'Geschäftsführer und Meister' } }),
    );
    expect(html).toContain('data-zeichnung="rohrklammer"');
    expect(html).toContain('<span class="text-title-3 text-brand">Sabri Demir</span>');
    expect(html).toContain('<span class="text-etikett text-ink-2">Anrufen</span>');
    expect(motionIds(html)).toEqual(['druck', 'druck', 'druck']);
  });

  it('inline: fette Textlinks mit Icons in Markenfarbe, Druck-Rückmeldung', () => {
    const html = renderToStaticMarkup(createElement(ContactOptions, { variant: 'inline' }));
    expect(html.match(/data-motion="druck"/g)).toHaveLength(3);
    expect(html).toContain('font-bold');
    expect(html).toMatch(/data-icon="phone"[^>]*class="text-brand"|class="text-brand"[^>]*data-icon="phone"/);
  });
});

describe('StickyApplyBar (Fuß- und Mobil-Anteil)', () => {
  // Ohne Router-Kontext gilt der Pfad „/“; vor der ersten Messung ist die Leiste verborgen (kein Aufblitzen).
  const html = renderToStaticMarkup(createElement(StickyApplyBarClient, { jobLabels: {}, whatsappHref: 'https://api.whatsapp.com/send?phone=491608834290&text=Hallo' }));

  it('Hauptaktion rot nach /bewerbung, Vorlauf und Rücklauf fallen hinein, WhatsApp als Zweitweg im neuen Tab', () => {
    expect(html).toContain('aria-label="Schnell bewerben"');
    expect(html).toMatch(/<a [^>]*href="\/bewerbung"[^>]*data-motion="druck"|<a [^>]*data-motion="druck"[^>]*href="\/bewerbung"/);
    expect(plain(html)).toContain('Jetzt bewerben');
    expect(html.match(/aria-hidden="true"><\/span>/g)).toHaveLength(2);
    expect(html).toMatch(/target="_blank" rel="noopener noreferrer" aria-label="Per WhatsApp schreiben \(öffnet in neuem Tab\)"/);
    expect(html).toContain('data-icon="message-circle"');
  });

  it('startet verborgen und inert; Ein- und Ausgang tragen eine Registerkennung', () => {
    expect(html).toMatch(/<aside[^>]*inert=""[^>]*data-hidden="true"/);
    for (const id of motionIds(html)) expect(MOTION_IDS).toContain(id);
    expect(html).toMatch(/<aside[^>]*data-motion="menue-oeffnen"/);
  });
});
