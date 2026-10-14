import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Attribution } from '@/lib/applications/schema';
import { bearbeiteHref, beobachteLinks, linkArt, type BeobachterDokument } from '@/lib/attribution/klick';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

const ORIGIN = 'https://karriere.bad-energie.de';
const INDEED: Attribution = { utmSource: 'indeed', utmMedium: 'jobboard', landingPath: '/jobs/anlagenmechaniker-shk-wetzlar' };
const WA = buildWhatsAppUrl('Guten Tag Herr Demir, ich möchte mich bei Bad und Energie bewerben.');
const textVon = (href: string) => new URL(href).searchParams.get('text');

describe('bearbeiteHref: was der Browser öffnet', () => {
  it('interner Bewerbungslink bekommt den Kanal, relative Form und Query bleiben', () => {
    expect(bearbeiteHref('/bewerbung?stelle=anlagenmechaniker-shk-wetzlar', INDEED, ORIGIN)).toBe(
      '/bewerbung?stelle=anlagenmechaniker-shk-wetzlar&herkunft=ind',
    );
    expect(bearbeiteHref('/bewerbung', { ref: 'koch' }, ORIGIN)).toBe('/bewerbung?ref=koch');
    expect(bearbeiteHref('/bewerbung', {}, ORIGIN)).toBe('/bewerbung');
    expect(bearbeiteHref('/jobs', INDEED, ORIGIN)).toBe('/jobs');
  });

  it('WhatsApp an unsere Nummer bekommt den sichtbaren Code als letzte Zeile, im selben Linkformat', () => {
    const neu = bearbeiteHref(WA, INDEED, ORIGIN);
    expect(neu).toMatch(/^https:\/\/api\.whatsapp\.com\/send\?phone=491608834290&text=/);
    expect(textVon(neu)).toBe('Guten Tag Herr Demir, ich möchte mich bei Bad und Energie bewerben.\n– W-IND');
    // Zweites Antippen: derselbe Link, kein zweiter Code
    expect(bearbeiteHref(neu, INDEED, ORIGIN)).toBe(neu);
    // Ohne Signal zählt die Website selbst: W-DIR
    expect(textVon(bearbeiteHref(WA, {}, ORIGIN))).toMatch(/\n– W-DIR$/);
    expect(textVon(bearbeiteHref(WA, { ref: 'koch' }, ORIGIN))).toMatch(/\n– W-EMPF$/);
  });

  it('fremde Nummern, WhatsApp ohne Text, Telefon, E-Mail und fremde Seiten bleiben unberührt', () => {
    for (const href of [
      buildWhatsAppUrl('Hallo', '+49 151 2345678'),
      'https://api.whatsapp.com/send?phone=491608834290',
      'https://wa.me/491608834290?text=Hallo',
      'tel:+49644142956',
      'mailto:info@bad-energie.de?subject=Bewerbungsunterlagen',
      'https://www.bad-energie.de/',
    ]) {
      expect(bearbeiteHref(href, INDEED, ORIGIN), href).toBe(href);
    }
  });

  it('linkArt erkennt Telefon und WhatsApp an unsere Nummer', () => {
    expect(linkArt('tel:+49644142956')).toBe('telefon');
    expect(linkArt(WA)).toBe('whatsapp');
    expect(linkArt(buildWhatsAppUrl('Hallo', '+49 151 2345678'))).toBe('sonst');
    expect(linkArt('/bewerbung')).toBe('sonst');
  });
});

/** Ein Dokument als Attrappe: sammelt die Beobachter und löst Ereignisse auf einem Link aus. */
function attrappe(pfad = '/jobs/anlagenmechaniker-shk-wetzlar', suche = '') {
  const beobachter = new Map<string, (event: Event) => void>();
  const optionen: unknown[] = [];
  const doc: BeobachterDokument = {
    addEventListener: (typ, fn, opt) => {
      beobachter.set(typ, fn);
      optionen.push(opt);
    },
    removeEventListener: (typ) => {
      beobachter.delete(typ);
    },
    location: { origin: ORIGIN, pathname: pfad, search: suche },
  };
  const link = (href: string) => {
    const attribute = new Map([['href', href]]);
    const anker = { getAttribute: (name: string) => attribute.get(name) ?? null, setAttribute: (name: string, wert: string) => attribute.set(name, wert) };
    // Der Klick trifft ein Kind des Links (Icon, Text), closest findet den Link.
    const ziel = { closest: (selector: string) => (selector === 'a[href]' ? anker : null) };
    return {
      href: () => attribute.get('href'),
      ausloesen: (typ: string, extra: Record<string, unknown> = {}) => beobachter.get(typ)?.({ type: typ, target: ziel, ...extra } as unknown as Event),
    };
  };
  return { doc, beobachter, optionen, link };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('beobachteLinks: ein Beobachter für die ganze Seite', () => {
  it('meldet sich in der Capture-Phase passiv für Klick, Mittelklick, Kontextmenü, Tippen und Ziehen an und wieder ab', () => {
    const { doc, beobachter, optionen } = attrappe();
    const abmelden = beobachteLinks(doc, () => INDEED);
    expect([...beobachter.keys()].sort()).toEqual(['auxclick', 'click', 'contextmenu', 'dragstart', 'touchstart']);
    for (const opt of optionen) expect(opt).toEqual({ capture: true, passive: true });
    abmelden();
    expect(beobachter.size).toBe(0);
  });

  it('ändert den benutzten Link, bevor der Browser ihn öffnet (neuer Tab per Kontextmenü)', () => {
    const { doc, link } = attrappe();
    beobachteLinks(doc, () => INDEED);
    const bewerben = link('/bewerbung?stelle=anlagenmechaniker-shk-wetzlar');
    bewerben.ausloesen('contextmenu');
    expect(bewerben.href()).toBe('/bewerbung?stelle=anlagenmechaniker-shk-wetzlar&herkunft=ind');
    const whatsapp = link(WA);
    whatsapp.ausloesen('touchstart');
    expect(textVon(whatsapp.href() ?? '')).toMatch(/\n– W-IND$/);
  });

  it('liest die Attribution erst beim Benutzen und lässt Links ohne Herkunft unverändert', () => {
    const { doc, link } = attrappe();
    let attribution: Attribution = {};
    beobachteLinks(doc, () => attribution);
    const bewerben = link('/bewerbung');
    bewerben.ausloesen('click');
    expect(bewerben.href()).toBe('/bewerbung');
    attribution = { referrerHost: 'www.google.de' };
    bewerben.ausloesen('click');
    expect(bewerben.href()).toBe('/bewerbung?herkunft=such');
  });

  it('zählt Klicks auf WhatsApp und Telefon als Ereignis mit Stelle aus der Adresse, wenn der Schalter an ist', () => {
    const sendBeacon = vi.fn((_url: string, _body?: unknown) => true);
    vi.stubGlobal('navigator', { sendBeacon });
    vi.stubGlobal('document', { querySelector: () => ({ getAttribute: () => 'an' }) });
    const { doc, link } = attrappe('/jobs/anlagenmechaniker-shk-wetzlar');
    beobachteLinks(doc, () => INDEED);

    link(WA).ausloesen('click');
    link('tel:+49644142956').ausloesen('auxclick', { button: 1 });
    // Kein Öffnen: Kontextmenü, Tippen, Rechtsklick, andere Links
    link(WA).ausloesen('contextmenu');
    link(WA).ausloesen('touchstart');
    link('tel:+49644142956').ausloesen('auxclick', { button: 2 });
    link('/bewerbung').ausloesen('click');
    link('mailto:info@bad-energie.de').ausloesen('click');

    expect(sendBeacon).toHaveBeenCalledTimes(2);
    const gesendet = sendBeacon.mock.calls.map((call) => JSON.parse(String(call[1])));
    expect(gesendet).toEqual([
      { ereignis: 'whatsapp_klick', stelle: 'anlagenmechaniker-shk-wetzlar', kanal: expect.any(String) },
      { ereignis: 'telefon_klick', stelle: 'anlagenmechaniker-shk-wetzlar', kanal: expect.any(String) },
    ]);
  });

  it('zählt nichts ohne Schalter', () => {
    const sendBeacon = vi.fn(() => true);
    vi.stubGlobal('navigator', { sendBeacon });
    vi.stubGlobal('document', { querySelector: () => null });
    const { doc, link } = attrappe();
    beobachteLinks(doc, () => INDEED);
    link(WA).ausloesen('click');
    link('tel:+49644142956').ausloesen('click');
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it('wirft nie, auch nicht ohne Link oder mit kaputter Attribution', () => {
    const { doc, beobachter } = attrappe();
    beobachteLinks(doc, () => {
      throw new Error('kaputt');
    });
    expect(() => beobachter.get('click')?.({ type: 'click', target: null } as unknown as Event)).not.toThrow();
    expect(() => beobachter.get('click')?.({ type: 'click', target: { closest: () => ({ getAttribute: () => '/bewerbung', setAttribute: () => {} }) } } as unknown as Event)).not.toThrow();
  });
});
