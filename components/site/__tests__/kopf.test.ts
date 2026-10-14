import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DISCRETION_PROMISE } from '@/lib/content/process';
import { jobPath } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { MOTION_IDS } from '@/lib/motion/register';
import { BEWERBUNG_WHATSAPP_MESSAGE, buildWhatsAppUrl, whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';
import { HeaderBar, type HeaderBarProps } from '../HeaderBar';
import { EINSATZGEBIET_PATH, getHubKreise, getPublishedPlaces, kreisPath } from '@/lib/places/registry';
import { ARBEITEN_PATH, THEMEN_UEBERSICHT_LINK, getThemen, themaPath } from '@/lib/themen/registry';
import {
  jubilaeumsMarke,
  kopfUntermenues,
  kopfVertraulich,
  offeneStellen,
  offeneStellenText,
  orteMass,
  stellenZaehler,
} from '../kopf/kopf-daten';
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
    untermenues: kopfUntermenues(),
  };
}

const render = (p: HeaderBarProps = props()) => renderToStaticMarkup(createElement(HeaderBar, p));

describe('E-SHELL-002 · Zähler „Aktuell offene Stellen“', () => {
  it('zählt die live Stellen am Stichtag (seit 2026-10-14: 8, fakten-abgleich S2–S5)', () => {
    const live = getActiveJobs().filter((job) => isJobLive(job, STICHTAG)).length;
    expect(offeneStellen(STICHTAG)).toBe(live);
    expect(offeneStellen(STICHTAG)).toBe(8);
  });

  it('sinkt, sobald eine Stelle abläuft (Ausbildung 2026 endet am 31.12.2026)', () => {
    expect(offeneStellen(new Date('2027-01-02T12:00:00Z'))).toBe(7);
  });

  it('zeigt ohne live Stelle keinen Zähler und spricht Ein- und Mehrzahl richtig', () => {
    expect(stellenZaehler(STICHTAG, [])).toBeNull();
    expect(stellenZaehler(STICHTAG)).toEqual({ anzahl: 8, text: 'aktuell 8 offene Stellen' });
    expect(offeneStellenText(1)).toBe('aktuell 1 offene Stelle');
  });

  it('steht am Eintrag „Stellen“ in Kopf und Menü, sichtbar als Zahl und für Screenreader als Satz', () => {
    const html = render();
    expect(html.match(/aktuell 8 offene Stellen/g)).toHaveLength(2);
    expect(html).toContain('8 offen');
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

  it('Navigation Stellen · Arbeiten bei uns · Einsatzgebiet · FAQ in Kopf und Menü, aktuelle Seite markiert', () => {
    const html = render();
    expect(html.match(/aria-label="Hauptnavigation"/g)).toHaveLength(2);
    for (const item of NAV_ITEMS) {
      expect(html.match(new RegExp(`href="${item.href}"`, 'g'))!.length).toBeGreaterThanOrEqual(2);
    }
    expect(html.match(/aria-current="page"/g)).toHaveLength(2);
    expect(html).not.toContain('aria-current="true"');
    // Die Anker „Vorteile“ und „Ablauf“ der Startseite stehen seit E-028 nicht mehr in der Navigation
    expect(html).not.toContain('href="/#vorteile"');
    expect(html).not.toContain('href="/#ablauf"');
  });

  it('E-028: Untermenüs mit allen Themen, den Kreis-Hubs und dem Verzeichnis A–Z in Kopf und Menü', () => {
    const html = render();
    const anzahl = (href: string) => html.match(new RegExp(`href="${href}"`, 'g'))?.length ?? 0;
    for (const thema of getThemen()) expect(anzahl(themaPath(thema)), thema.slug).toBe(2);
    for (const kreis of getHubKreise()) {
      expect(anzahl(kreisPath(kreis)), kreis.slug).toBe(2);
      expect(html).toContain(orteMass(kreis.placeCount));
    }
    expect(anzahl(`${EINSATZGEBIET_PATH}#orte`)).toBe(2);
    expect(plain(html)).toContain(`Alle ${getPublishedPlaces().length} Orte von A bis Z`);
    // „Alle Themen im Überblick“ nur im Kopf; im Menü führt der Eintrag selbst zum Hub
    expect(plain(html).match(new RegExp(THEMEN_UEBERSICHT_LINK.label, 'g'))).toHaveLength(1);
    expect(anzahl(ARBEITEN_PATH)).toBe(3);
    expect(html.match(/data-unter=""/g)).toHaveLength(2);
    expect(html).toContain('id="kopf-unter-arbeiten"');
    expect(html).toContain('id="kopf-unter-einsatzgebiet"');
  });

  it('E-028: aria-current markiert den Bereich auf jeder Unterseite und den Unterweg auf seiner Seite', () => {
    /** href der Links mit aria-current="page" bzw. "true", in der Reihenfolge des HTML (Kopf, dann Menü). */
    const markiert = (html: string, wert: 'page' | 'true') =>
      [...html.matchAll(/<a ([^>]*)>/g)]
        .map((m) => m[1])
        .filter((attrs) => attrs.includes(`aria-current="${wert}"`))
        .map((attrs) => /href="([^"]+)"/.exec(attrs)![1]);

    pfad = '/einsatzgebiet/herborn';
    let html = render();
    expect(markiert(html, 'true')).toEqual([EINSATZGEBIET_PATH, EINSATZGEBIET_PATH]);
    expect(markiert(html, 'page')).toEqual([]);

    const kreis = getHubKreise()[0];
    pfad = kreisPath(kreis);
    html = render();
    expect(markiert(html, 'true')).toEqual([EINSATZGEBIET_PATH, EINSATZGEBIET_PATH]);
    expect(markiert(html, 'page')).toEqual([kreisPath(kreis), kreisPath(kreis)]);

    const thema = getThemen()[0];
    pfad = themaPath(thema);
    html = render();
    expect(markiert(html, 'true')).toEqual([ARBEITEN_PATH, ARBEITEN_PATH]);
    expect(markiert(html, 'page')).toEqual([themaPath(thema), themaPath(thema)]);

    pfad = ARBEITEN_PATH;
    html = render();
    expect(markiert(html, 'page')).toEqual([ARBEITEN_PATH, ARBEITEN_PATH]);
    expect(markiert(html, 'true')).toEqual([]);

    // Das Verzeichnis A–Z ist ein Anker und nie „aktuell“
    pfad = EINSATZGEBIET_PATH;
    html = render();
    expect(markiert(html, 'page')).toEqual([EINSATZGEBIET_PATH, EINSATZGEBIET_PATH]);
  });

  it('E-028: Untermenü-Daten kommen aus den Registries (keine feste Zahl)', () => {
    const [arbeiten, gebiet] = kopfUntermenues();
    expect(arbeiten.href).toBe(ARBEITEN_PATH);
    expect(arbeiten.wege.map((weg) => weg.href)).toEqual(getThemen().map(themaPath));
    expect(arbeiten.alle).toEqual({ ...THEMEN_UEBERSICHT_LINK });
    expect(gebiet.href).toBe(EINSATZGEBIET_PATH);
    expect(gebiet.wege.map((weg) => weg.href)).toEqual(getHubKreise().map(kreisPath));
    expect(gebiet.wege.map((weg) => weg.mass)).toEqual(getHubKreise().map((k) => orteMass(k.placeCount)));
    expect(gebiet.alle.href).toBe(`${EINSATZGEBIET_PATH}#orte`);
    expect(orteMass(1)).toBe('1\u00a0Ort');
    expect(orteMass(26)).toBe('26\u00a0Orte');
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
    expect(decodeURIComponent(html)).toContain(BEWERBUNG_WHATSAPP_MESSAGE);
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
      expect(quelle, datei).not.toMatch(/from '@\/lib\/(jobs|content|places|themen)\//);
      expect(quelle, datei).not.toContain("kopf-daten'");
    }
  });
});
