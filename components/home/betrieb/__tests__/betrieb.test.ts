import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContactOptions, contactChannels } from '@/components/site/ContactOptions';
import { APPLY_PATH, PRIMARY_CTA_ATTR } from '@/components/site/nav';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { REGION } from '@/lib/content/region';
import { TEAM_QUOTES } from '@/lib/content/team';
import { companyData } from '@/lib/data/company';
import { MOTION_IDS } from '@/lib/motion/register';
import { AboutSection } from '../../AboutSection';
import { CTA } from '../../content';
import { CtaBand } from '../../CtaBand';
import { KONTAKT, MEILENSTEIN, UNVERBINDLICH, partnerSaeulen, ueberUnsTitel, wachstumsgrund } from '../betrieb-text';

const NBSP = /\u00A0/g;
const unescape = (html: string) =>
  html
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
/** Sichtbarer Text wie im Browser: Tags weg, geschützte Leerzeichen als Leerzeichen. */
const plain = (html: string) => unescape(html.replace(/<[^>]+>/g, '')).replace(NBSP, ' ').replace(/\s+/g, ' ');

const about = renderToStaticMarkup(createElement(AboutSection));
const aboutText = plain(about);
const band = renderToStaticMarkup(createElement(CtaBand));
const bandText = plain(band);

const DIR = path.resolve(__dirname, '../..');
const quelle = (datei: string) => readFileSync(path.join(DIR, datei), 'utf8');

describe('Über uns (R3-HOME-04)', () => {
  it('Kopf wie ROADMAP §5.6 und direkter Draht zu Sabri Demir, genau eine h2, keine h1', () => {
    expect(about.match(/<h1\b/g)).toBeNull();
    expect(about.match(/<h2\b/g)).toHaveLength(1);
    const kopf = about.match(/^<section\b[^>]*>/)![0];
    expect(kopf).toContain('id="ueber-uns"');
    expect(kopf).toContain('aria-labelledby="ueber-uns-title"');
    expect(ueberUnsTitel().replace(NBSP, ' ')).toBe(`${FACTS.employees15.value} Leute. Ein Meisterbetrieb. Seit ${COMPANY.foundingYear}.`);
    expect(aboutText).toContain(ueberUnsTitel().replace(NBSP, ' '));
    expect(aboutText).toContain(FACTS.directLine.long);
  });

  it('zeigt das freigegebene Zitat von Sabri Demir wörtlich mit Name und Rolle', () => {
    const zitat = TEAM_QUOTES.demir;
    expect(aboutText).toContain(`„${zitat.quote}“`);
    expect(aboutText).toContain(zitat.name);
    expect(aboutText).toContain(zitat.role);
    expect(about).toContain('data-zeichnung="rohrklammer"');
  });

  it('E-START-031: „Meilenstein 2026“, „Siegmund-Hiepe-Str. 20“, „größeres Lager“, „15 Leuten“ mit Wachstumsgrund', () => {
    for (const teil of ['Meilenstein 2026', 'Siegmund-Hiepe-Str. 20', 'größeres Lager', '15 Leuten']) {
      expect(aboutText).toContain(teil);
    }
    expect(MEILENSTEIN.text).toBe(`${wachstumsgrund()} ${REGION.milestone.text}`);
    expect(aboutText).toContain(MEILENSTEIN.text);
    // Wachstumsgrund wörtlich aus dem Owner-Text, ohne „führend“ (B14 offen)
    expect(companyData.milestone2026).toContain(wachstumsgrund());
    expect(wachstumsgrund()).toBe(
      'Durch das stetige Wachstum unseres Betriebes war ein Umzug in eine neue und größere Betriebsstätte unausweichlich.',
    );
    expect(MEILENSTEIN.text).not.toMatch(/führend|Schöner Wohnen/);
    // Überschrift liest sich im DOM als „Meilenstein 2026“
    const h3 = about.match(/<h3 id="meilenstein-titel"[^>]*>([\s\S]*?)<\/h3>/)!;
    expect(plain(h3[1]).trim()).toBe('Meilenstein 2026');
  });

  it('nennt die fünf Partner-Säulen mit ihren belegten Zusätzen, ohne Kennzahl-Kachel', () => {
    const saeulen = partnerSaeulen();
    expect(saeulen).toHaveLength(5);
    for (const [i, eintrag] of (FACTS.partners5.list ?? []).entries()) {
      const s = saeulen[i];
      expect(s.zusatz ? `${s.name} (${s.zusatz})` : s.name).toBe(eintrag);
      expect(aboutText).toContain(s.name);
      if (s.zusatz) expect(aboutText).toContain(s.zusatz);
    }
    expect(aboutText).toContain(`${FACTS.partners5.value} ${FACTS.partners5.label}`);
    expect(quelle('AboutSection.tsx')).not.toContain('StatTile');
  });

  it('bindet die Stimmen ein: Google-Bewertungen mit Inhaber-Antwort, Teamstimmen nur freigegeben', () => {
    expect(aboutText).toContain('Stimmen von Kunden und Team');
    expect(about).toContain('<details');
    expect(about).not.toContain('Mitarbeiter Stimme');
  });
});

describe('Schlussband (E-START-051, E-START-048)', () => {
  it('Navy-Band mit Titel und Antwortzusage aus content.ts, im Wortlaut', () => {
    expect(band).toMatch(/^<section data-tone="inverse"[^>]*aria-labelledby="cta-title"/);
    expect(band.match(/<h2\b/g)).toHaveLength(1);
    expect(bandText).toContain(CTA.title);
    expect(bandText).toContain(CTA.lead);
  });

  it('genau eine Hauptaktion „Jetzt bewerben“ nach /bewerbung, markiert für die StickyApplyBar, mit Druck-Rückmeldung', () => {
    expect(band.match(new RegExp(`${PRIMARY_CTA_ATTR}=`, 'g'))).toHaveLength(1);
    const links = [...band.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
    const bewerben = links.filter(([, href]) => href === APPLY_PATH);
    expect(bewerben).toHaveLength(1);
    expect(plain(bewerben[0][2]).trim()).toBe('Jetzt bewerben');
    expect(bewerben[0][0]).toContain('data-motion="druck"');
  });

  it('enthält „unverbindlich“ (ohne „100 %“) und keinen dritten „Lebenslauf“', () => {
    expect(bandText.toLowerCase()).toContain('unverbindlich');
    expect(UNVERBINDLICH.replace(NBSP, ' ')).toBe('Unverbindlich · Kein Risiko · Keine Verpflichtung');
    expect(bandText).not.toMatch(/100\s?%/);
    expect(bandText).not.toContain('Lebenslauf');
  });

  it('Kontakt „Sprich direkt mit Sabri Demir“, Kanäle Telefon, WhatsApp, E-Mail in dieser Reihenfolge', () => {
    expect(KONTAKT.titel).toBe(`Sprich direkt mit ${COMPANY.managingDirector.name}`);
    expect(bandText).toContain('Sprich direkt mit Sabri Demir');
    expect(bandText).toContain(COMPANY.managingDirector.title);
    const hrefs = [...band.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => h !== APPLY_PATH);
    const ziele = hrefs.map((h) => (h.startsWith('tel:') ? 'tel' : h.includes('whatsapp') ? 'whatsapp' : h.startsWith('mailto:') ? 'mail' : h));
    expect(ziele).toEqual(['tel', 'whatsapp', 'mail']);
    // Name einmal beim Kontakt: keine zweite Personenkarte „Dein Ansprechpartner“
    expect(bandText).not.toContain('Dein Ansprechpartner');
  });

  it('Leitungen im Band sind Zeichnung (aria-hidden), Bewegungskennungen nur aus dem Register', () => {
    expect(band.match(/<span class="[^"]*leitung[^"]*" aria-hidden="true"><\/span>/g)).toHaveLength(2);
    for (const [, id] of band.matchAll(/data-motion="([^"]+)"/g)) expect(MOTION_IDS).toContain(id);
  });
});

describe('ContactOptions (rückwärtskompatibel, R3-HOME-04)', () => {
  const ORDER = ['phone', 'whatsapp', 'email'];

  it('Reihenfolge Telefon, WhatsApp, E-Mail in jeder Variante (WCAG 3.2.6)', () => {
    expect(contactChannels().map((c) => c.id)).toEqual(ORDER);
    for (const variant of ['card', 'inline', 'list'] as const) {
      const html = renderToStaticMarkup(createElement(ContactOptions, { variant }));
      const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs[0]).toBe(COMPANY.phone.href);
      expect(hrefs[1]).toContain('whatsapp');
      expect(hrefs[2]).toBe(COMPANY.emailHref);
      expect(plain(html)).toContain(`Öffnungszeiten: ${COMPANY.openingHours.short}`);
    }
  });

  it('card zeigt die Person wie bisher; list hat keine eigene Fläche; Standard bleibt card', () => {
    const person = { name: 'Sabri Demir', role: 'Geschäftsführer und Meister' };
    const card = renderToStaticMarkup(createElement(ContactOptions, { variant: 'card', person }));
    expect(plain(card)).toContain('Dein Ansprechpartner');
    expect(card).toContain('bg-surface-2');
    const standard = renderToStaticMarkup(createElement(ContactOptions));
    expect(standard).toContain('bg-surface-2');
    const list = renderToStaticMarkup(createElement(ContactOptions, { variant: 'list' }));
    expect(list).not.toContain('bg-surface-2');
  });

  it('WhatsApp öffnet im neuen Tab ohne Referrer und mit Hinweis; eigener Text wird übernommen', () => {
    const html = renderToStaticMarkup(createElement(ContactOptions, { variant: 'inline', whatsappMessage: 'Hallo Test' }));
    expect(html).toMatch(/<a href="[^"]*whatsapp[^"]*Hallo(%20|\+)Test[^"]*" target="_blank" rel="noopener noreferrer"/);
    expect(plain(html)).toContain('(öffnet in neuem Tab)');
  });

  it('Ziffern der Telefonnummer und der Zeiten in Bricolage (ziffer), Icons aus der eigenen Familie', () => {
    const html = renderToStaticMarkup(createElement(ContactOptions, { variant: 'list' }));
    expect(html).toContain(`<span class="truncate text-body font-medium text-ink underline-offset-4 group-hover:underline ziffer">${COMPANY.phone.display}</span>`);
    expect(html).toContain('<span class="ziffer">07:00–16:45</span>');
    expect(html).toContain('data-icon="phone"');
    expect(readFileSync(path.resolve(DIR, '../site/ContactOptions.tsx'), 'utf8')).not.toContain('lucide-react');
  });
});

describe('Dateien des Pakets', () => {
  it('nutzen keine lucide-Icons und keine Rohfarben', () => {
    const dateien = [
      'AboutSection.tsx',
      'CtaBand.tsx',
      ...readdirSync(path.join(DIR, 'betrieb'))
        .filter((f) => /\.(tsx?|css)$/.test(f))
        .map((f) => `betrieb/${f}`),
    ];
    for (const datei of dateien) {
      const text = quelle(datei);
      expect(text, datei).not.toContain('lucide-react');
      expect(text, datei).not.toMatch(/#[0-9a-fA-F]{3,8}\b|--p-[a-z]/);
    }
  });
});
