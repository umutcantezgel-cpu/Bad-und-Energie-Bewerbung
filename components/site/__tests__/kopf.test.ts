import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DISCRETION_PROMISE } from '@/lib/content/process';
import { jobPath } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { MOTION_IDS } from '@/lib/motion/register';
import { buildWhatsAppUrl, whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';
import { HeaderBar, type HeaderBarProps } from '../HeaderBar';
import { jubilaeumsMarke, kopfVertraulich, offeneStellen, offeneStellenText, stellenZaehler } from '../kopf/kopf-daten';
import { MenueZeichen } from '../kopf/MenueZeichen';
import { zeigeMarkeImKopf, zeigeVertraulich } from '../kopf/typen';
import { MENU_ID } from '../MobileNav';
import { NAV_ITEMS } from '../nav';

let pfad = '/jobs';
vi.mock('next/navigation', () => ({ usePathname: () => pfad }));

const STICHTAG = new Date('2026-10-10T09:00:00Z');
const NACH_JUBILAEUM = new Date('2027-01-01T08:00:00Z');

const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ');

function props(now: Date = STICHTAG): HeaderBarProps {
  return {
    logo: createElement('img', { alt: 'Logo' }),
    phone: { display: '06441 42956', href: 'tel:+49644142956' },
    whatsappHref: buildWhatsAppUrl(whatsAppMessageFor('/')),
    whatsappFlowHref: buildWhatsAppUrl(whatsAppMessageFor('/bewerbung')),
    offeneStellen: stellenZaehler(now),
    marke: jubilaeumsMarke(now),
    vertraulich: kopfVertraulich(),
  };
}

const render = (p: HeaderBarProps = props()) => renderToStaticMarkup(createElement(HeaderBar, p));

describe('E-SHELL-002 · Zähler „Aktuell offene Stellen“', () => {
  it('zählt die live Stellen am Stichtag (heute 4)', () => {
    const live = getActiveJobs().filter((job) => isJobLive(job, STICHTAG)).length;
    expect(offeneStellen(STICHTAG)).toBe(live);
    expect(offeneStellen(STICHTAG)).toBe(4);
  });

  it('sinkt, sobald eine Stelle abläuft (Ausbildung 2026 endet am 31.12.2026)', () => {
    expect(offeneStellen(new Date('2027-01-02T12:00:00Z'))).toBe(3);
  });

  it('zeigt ohne live Stelle keinen Zähler und spricht Ein- und Mehrzahl richtig', () => {
    expect(stellenZaehler(STICHTAG, [])).toBeNull();
    expect(stellenZaehler(STICHTAG)).toEqual({ anzahl: 4, text: 'aktuell 4 offene Stellen' });
    expect(offeneStellenText(1)).toBe('aktuell 1 offene Stelle');
  });

  it('steht am Eintrag „Stellen“ in Kopf und Menü, sichtbar als Zahl und für Screenreader als Satz', () => {
    const html = render();
    expect(html.match(/aktuell 4 offene Stellen/g)).toHaveLength(2);
    expect(html).toContain('4 offen');
  });
});

describe('E-SHELL-001 · Jubiläumsmarke im Rahmen', () => {
  it('zeigt „100 Jahre Meisterbetrieb (1926–2026)“ bis zum 31.12.2026', () => {
    expect(jubilaeumsMarke(new Date('2026-12-31T22:00:00Z'))).toEqual({
      lang: '100 Jahre Meisterbetrieb (1926–2026)',
      zahl: '100 Jahre',
      spanne: '1926–2026',
    });
    const text = plain(render());
    expect(text).toContain('100 Jahre Meisterbetrieb (1926–2026)');
    expect(text).toContain('1926–2026');
  });

  it('ist ab 2027-01-01 ausgeblendet', () => {
    expect(jubilaeumsMarke(NACH_JUBILAEUM)).toBeNull();
    expect(plain(render(props(NACH_JUBILAEUM)))).not.toContain('100 Jahre');
  });

  it('steht auf der Startseite nicht im Kopf (der Einstieg trägt sie), wohl aber im Menü', () => {
    expect(zeigeMarkeImKopf('/')).toBe(false);
    expect(zeigeMarkeImKopf('/jobs')).toBe(true);
    pfad = '/';
    const html = render();
    pfad = '/jobs';
    expect(html.match(/100 Jahre Meisterbetrieb \(1926–2026\)/g)).toHaveLength(1);
    expect(html).not.toContain('1926–2026</span>');
  });
});

describe('E-SHELL-004 · Vertraulichkeitszusage im Menü', () => {
  it('ist wörtlich DISCRETION_PROMISE, ohne „garantiert“ und ohne „§ 26“', () => {
    const { text } = kopfVertraulich();
    expect(text).toBe(DISCRETION_PROMISE);
    expect(text).not.toMatch(/garantiert|§\s*26/);
    expect(plain(render())).toContain(DISCRETION_PROMISE);
  });

  it('entfällt auf den Seiten der Ausbildung', () => {
    const vertraulich = kopfVertraulich();
    const ausbildung = getActiveJobs().find((job) => job.category === 'ausbildung')!;
    expect(vertraulich.ohne).toContain(jobPath(ausbildung));
    expect(zeigeVertraulich(vertraulich, jobPath(ausbildung))).toBe(false);
    expect(zeigeVertraulich(vertraulich, `${jobPath(ausbildung)}/`)).toBe(false);
    expect(zeigeVertraulich(vertraulich, '/')).toBe(true);
    expect(zeigeVertraulich(null, '/')).toBe(false);
    pfad = jobPath(ausbildung);
    const html = render();
    pfad = '/jobs';
    expect(plain(html)).not.toContain(DISCRETION_PROMISE);
  });
});

describe('Kopf (R4-SHELL-01)', () => {
  beforeEach(() => {
    pfad = '/jobs';
  });

  it('Navigation Stellen · Vorteile · Ablauf · FAQ in Kopf und Menü, aktuelle Seite markiert', () => {
    const html = render();
    expect(html.match(/aria-label="Hauptnavigation"/g)).toHaveLength(2);
    for (const item of NAV_ITEMS) {
      expect(html.match(new RegExp(`href="${item.href}"`, 'g'))!.length).toBeGreaterThanOrEqual(2);
    }
    expect(html.match(/aria-current="page"/g)).toHaveLength(2);
  });

  it('E-SHELL-023/005: Telefon, WhatsApp (neuer Tab, noopener, ohne Berufsangabe) und Bewerben im Kopf', () => {
    const html = render();
    expect(html).toContain('href="tel:+49644142956"');
    expect(plain(html)).toContain('06441 42956 anrufen');
    const whatsapp = [...html.matchAll(/<a [^>]*href="https:\/\/api\.whatsapp\.com[^"]*"[^>]*>/g)].map((m) => m[0]);
    expect(whatsapp.length).toBeGreaterThanOrEqual(2);
    for (const link of whatsapp) {
      expect(link).toContain('target="_blank"');
      expect(link).toMatch(/rel="[^"]*noopener/);
      expect(decodeURIComponent(link)).not.toMatch(/Anlagenmechaniker|Kundendienst|Obermonteur|Ausbildung/);
    }
    expect(html).toMatch(/<a [^>]*href="\/bewerbung"[^>]*>Bewerben<\/a>/);
  });

  it('E-SHELL-012/011: Menüknopf steuert einen Dialog, Strich-zu-X-Zeichen dekorativ', () => {
    const html = render();
    expect(html).toMatch(new RegExp(`<button[^>]*aria-label="Menü"[^>]*aria-haspopup="dialog"[^>]*aria-expanded="false"[^>]*aria-controls="${MENU_ID}"`));
    expect(html).toMatch(new RegExp(`<dialog[^>]*id="${MENU_ID}"[^>]*aria-label="Menü"[^>]*data-tone="inverse"`));
    expect(html).toContain('aria-label="Menü schließen"');
    // ohne Skript öffnen moderne Browser den Dialog über Invoker Commands
    expect(html).toContain(`commandfor="${MENU_ID}"`);
    expect(html).toContain('command="show-modal"');
  });

  it('im Bewerbungsflow nur Logo, Telefon, WhatsApp zum Flow und der Ausgang', () => {
    pfad = '/bewerbung';
    const html = render();
    expect(html).not.toContain('Hauptnavigation');
    expect(html).not.toContain('<dialog');
    expect(plain(html)).toContain('Abbrechen');
    expect(decodeURIComponent(html)).toContain('Bewerbungsschritten');
    pfad = '/bewerbung/danke';
    expect(plain(render())).toContain('Zur Startseite');
  });

  it('Bewegung nur über Register-Kennungen; das Menü staffelt vier Einträge', () => {
    const html = render();
    const ids = new Set([...html.matchAll(/data-motion="([^"]+)"/g)].map((m) => m[1]));
    for (const id of ids) expect(MOTION_IDS).toContain(id);
    for (const id of ['menue-oeffnen', 'menue-leitung', 'menue-eintrag', 'unterstrich', 'flaeche', 'druck']) {
      expect(ids).toContain(id);
    }
    expect(html.match(/data-motion="menue-eintrag"/g)).toHaveLength(NAV_ITEMS.length);
  });
});

describe('E-SHELL-011 · Menüzeichen', () => {
  it('drei Striche, dekorativ, unter 1,5 KB', () => {
    for (const zustand of ['zu', 'offen'] as const) {
      const svg = renderToStaticMarkup(createElement(MenueZeichen, { zustand }));
      expect(svg.match(/<line\b/g)).toHaveLength(3);
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain(`data-zustand="${zustand}"`);
      expect(new TextEncoder().encode(svg).length).toBeLessThanOrEqual(1536);
    }
  });
});

describe('Quellen des Kopfs', () => {
  const DIR = path.resolve(__dirname, '..');
  const dateien = [
    'SiteHeader.tsx',
    'HeaderBar.tsx',
    'MobileNav.tsx',
    ...readdirSync(path.join(DIR, 'kopf')).map((name) => path.join('kopf', name)),
  ];

  it('keine lucide-Importe, kein „garantiert“, kein „§ 26“', () => {
    for (const datei of dateien) {
      const quelle = readFileSync(path.join(DIR, datei), 'utf8');
      expect(quelle, datei).not.toContain('lucide-react');
      expect(quelle, datei).not.toMatch(/garantiert|§\s*26/);
    }
  });

  it('Kopf und Menü (Client) ziehen weder Registry noch Fakten ins Bündel', () => {
    for (const datei of ['HeaderBar.tsx', 'MobileNav.tsx', path.join('kopf', 'typen.ts'), path.join('kopf', 'MenueZeichen.tsx')]) {
      const quelle = readFileSync(path.join(DIR, datei), 'utf8');
      expect(quelle, datei).not.toMatch(/from '@\/lib\/(jobs|content)\//);
      expect(quelle, datei).not.toContain("kopf-daten'");
    }
  });
});
