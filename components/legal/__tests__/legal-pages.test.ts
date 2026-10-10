import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DatenschutzPage, { metadata as datenschutzMetadata } from '@/app/datenschutz/page';
import ImpressumPage, { metadata as impressumMetadata } from '@/app/impressum/page';
import { PRIVACY_NOTICE_VERSION } from '@/lib/applications/schema';
import { MAPS_CONSENT_KEY } from '@/lib/maps/consent';
import { LEGAL_ENTITY, displayUrl, formatNoticeDate, mailtoHref } from '../legal-data';

const ROOT = path.resolve(__dirname, '../../..');

const pages = {
  datenschutz: { html: renderToStaticMarkup(createElement(DatenschutzPage)), metadata: datenschutzMetadata },
  impressum: { html: renderToStaticMarkup(createElement(ImpressumPage)), metadata: impressumMetadata },
};

const ids = (html: string) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const anchors = (html: string) => [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);

describe.each(Object.entries(pages))('%s page', (name, { html, metadata }) => {
  it('has exactly one h1 and no own <main> (the root layout provides it)', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).not.toMatch(/<main\b/);
  });

  it('links every table-of-contents entry to an existing, unique id', () => {
    const all = ids(html);
    expect(new Set(all).size).toBe(all.length);
    const targets = anchors(html);
    expect(targets.length).toBeGreaterThanOrEqual(5);
    for (const target of targets) expect(all).toContain(target);
  });

  it('keeps legal text readable: no search box, no accordion, no client code', () => {
    expect(html).not.toMatch(/<input\b|<details\b|<button\b/);
    for (const file of [`app/${name}/page.tsx`, 'components/recht/RechtDokument.tsx', 'components/recht/RechtInhalt.tsx', 'components/recht/RechtAbschnitt.tsx']) {
      expect(readFileSync(path.join(ROOT, file), 'utf8')).not.toMatch(/['"]use client['"]/);
    }
  });

  it('is noindex but followable', () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it('shows the operator data from the shared source', () => {
    expect(html).toContain(LEGAL_ENTITY.name);
    expect(html).toContain(LEGAL_ENTITY.registerNumber);
    expect(html).toContain(LEGAL_ENTITY.vatId);
  });
});

describe('Datenschutz content', () => {
  const { html } = pages.datenschutz;

  it('keeps the anchors other pages link to', () => {
    const all = ids(html);
    for (const id of ['google-maps', 'bewerberdaten', 'entwurf', 'herkunft', 'betroffenenrechte', 'aufsichtsbehoerde']) {
      expect(all).toContain(id);
    }
  });

  it('names the stored consent key and the notice version shown with every application', () => {
    expect(html).toContain(MAPS_CONSENT_KEY);
    expect(html).toContain(PRIVACY_NOTICE_VERSION);
    expect(html).toContain(`Stand: ${formatNoticeDate(PRIVACY_NOTICE_VERSION)}`);
  });

  it('covers the processing of the new platform', () => {
    for (const phrase of ['Art. 6 Abs. 1 lit. b DSGVO', 'C-34/21', 'sessionStorage', '§ 25 Abs. 2 Nr. 2 TDDDG', 'Vercel', 'Resend', 'fra1', 'Interaktive Karte laden', 'Karte wieder ausblenden', 'Bricolage Grotesque', 'Atkinson Hyperlegible Next', 'Martian Mono']) {
      expect(html).toContain(phrase);
    }
  });
});

describe('legal-data helpers', () => {
  it('formats the notice version as a German month', () => {
    expect(formatNoticeDate('2026-10')).toBe('Oktober 2026');
    expect(formatNoticeDate('2027-03')).toBe('März 2027');
    expect(formatNoticeDate('2026-10-10')).toBe('10. Oktober 2026');
    expect(formatNoticeDate('2026-10-01')).toBe('1. Oktober 2026');
    expect(formatNoticeDate('2026-10-32')).toBe('2026-10-32');
    expect(formatNoticeDate('2026-13')).toBe('2026-13');
    expect(formatNoticeDate('v2')).toBe('v2');
  });

  it('builds mailto links and display URLs', () => {
    expect(mailtoHref('a@b.de')).toBe('mailto:a@b.de');
    expect(mailtoHref('a@b.de', 'Widerruf Einwilligung')).toBe('mailto:a@b.de?subject=Widerruf%20Einwilligung');
    expect(displayUrl('https://bad-energie.de/')).toBe('bad-energie.de');
  });

  it('splits the register entry into court and number', () => {
    expect(LEGAL_ENTITY.registerCourt).toBe('Amtsgericht Wetzlar');
    expect(LEGAL_ENTITY.registerNumber).toBe('HRB 2449');
  });
});
