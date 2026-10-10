import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VORLAUF, beiAnnaeherung, erstelleTor, hashZeigtAuf, imLeerlauf, linkAufDieseSeite } from '../HydrateNear';

/**
 * HydrateNear (V6-A2): Die Insel hydriert erst in Reichweite, bei Hash, Sprung, Fokus, Pointer und Klick auf
 * einen Link zu derselben Seite sofort; ihr Code lädt im Leerlauf vorab.
 * Ohne DOM in der Testumgebung: Insel, Fenster und IntersectionObserver als kleine Attrappen.
 */

const ORT = {
  hash: '',
  href: 'https://karriere.bad-energie.de/',
  origin: 'https://karriere.bad-energie.de',
  pathname: '/',
  search: '',
};

/** Ereignis, dessen Ziel `ziel` ist (die Attrappen haben keinen DOM-Baum, der das Ziel setzen würde). */
function ereignis(typ: string, ziel: unknown): Event {
  const event = new Event(typ);
  Object.defineProperty(event, 'target', { value: ziel });
  return event;
}

/** Element, in dem ein Klick landet: `closest('a[href]')` liefert den Link mit `href` oder nichts. */
function klickZiel(href: string | null) {
  return { closest: (selector: string) => (selector === 'a[href]' && href !== null ? { href } : null) };
}

interface Knoten {
  id: string;
}

/** Insel in <section id={sectionId}> unter <main id="main">, mit Elementen `innen` darin. */
function insel(sectionId: string, innen: readonly string[] = []): HTMLElement {
  const section: Knoten = { id: sectionId };
  const kinder: Knoten[] = innen.map((id) => ({ id }));
  const alle: Knoten[] = [{ id: 'main' }, section, ...kinder];
  const element = Object.assign(new EventTarget(), {
    ownerDocument: { getElementById: (id: string) => alle.find((knoten) => knoten.id === id) ?? null },
    closest: (selector: string) => (selector === 'section' ? section : null),
    contains: (knoten: Knoten) => kinder.includes(knoten),
  });
  return element as unknown as HTMLElement;
}

class Beobachter {
  static zuletzt: Beobachter | null = null;
  beobachtet: unknown[] = [];
  getrennt = false;
  constructor(
    readonly melden: (eintraege: { isIntersecting: boolean }[]) => void,
    readonly optionen: { rootMargin?: string },
  ) {
    Beobachter.zuletzt = this;
  }
  observe(element: unknown) {
    this.beobachtet.push(element);
  }
  disconnect() {
    this.getrennt = true;
  }
}

let fenster: EventTarget & { location: typeof ORT };

beforeEach(() => {
  Beobachter.zuletzt = null;
  fenster = Object.assign(new EventTarget(), { location: { ...ORT } });
  vi.stubGlobal('window', fenster);
  vi.stubGlobal('IntersectionObserver', Beobachter);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('hashZeigtAuf', () => {
  const element = insel('bewerben', ['feld']);

  it('trifft die umgebende Section und Elemente in der Insel', () => {
    expect(hashZeigtAuf(element, '#bewerben')).toBe(true);
    expect(hashZeigtAuf(element, '#feld')).toBe(true);
  });

  it('trifft keine weiter außen liegenden Ziele (Sprunglink #main) und keine fremden', () => {
    expect(hashZeigtAuf(element, '#main')).toBe(false);
    expect(hashZeigtAuf(element, '#aufgaben')).toBe(false);
  });

  it('übersteht leere und kaputte Hashes', () => {
    expect(hashZeigtAuf(element, '')).toBe(false);
    expect(hashZeigtAuf(element, '#')).toBe(false);
    expect(hashZeigtAuf(element, '#%E0%A4%A')).toBe(false);
  });
});

describe('beiAnnaeherung', () => {
  it('lädt sofort, wenn die Adresse beim Laden auf die Insel zeigt (Direktsprung)', () => {
    fenster.location.hash = '#bewerben';
    const nah = vi.fn();
    beiAnnaeherung(insel('bewerben'), nah);
    expect(nah).toHaveBeenCalledTimes(1);
    expect(Beobachter.zuletzt).toBeNull();
  });

  it('beobachtet mit Vorlauf und lädt erst, wenn die Insel in Reichweite kommt', () => {
    const element = insel('einsatzgebiet');
    const nah = vi.fn();
    beiAnnaeherung(element, nah);
    const beobachter = Beobachter.zuletzt;
    expect(beobachter?.optionen.rootMargin).toBe(VORLAUF);
    expect(beobachter?.beobachtet).toEqual([element]);

    beobachter?.melden([{ isIntersecting: false }]);
    expect(nah).not.toHaveBeenCalled();
    beobachter?.melden([{ isIntersecting: true }]);
    expect(nah).toHaveBeenCalledTimes(1);
    expect(beobachter?.getrennt).toBe(true);
  });

  it.each(['focusin', 'pointerover'])('lädt bei %s in der Insel (gehört am Fenster), nur einmal', (typ) => {
    const element = insel('bewerben', ['feld']);
    const feld = element.ownerDocument.getElementById('feld');
    const nah = vi.fn();
    beiAnnaeherung(element, nah);
    fenster.dispatchEvent(ereignis(typ, { id: 'anderswo' }));
    expect(nah).not.toHaveBeenCalled();
    fenster.dispatchEvent(ereignis(typ, feld));
    fenster.dispatchEvent(ereignis('focusin', feld));
    fenster.dispatchEvent(ereignis('pointerover', feld));
    expect(nah).toHaveBeenCalledTimes(1);
  });

  it('lädt beim Klick auf einen Link zu derselben Seite (Kopf: /#ablauf, Logo: /), nicht bei anderen Zielen', () => {
    const nah = vi.fn();
    beiAnnaeherung(insel('einsatzgebiet'), nah);
    fenster.dispatchEvent(ereignis('click', klickZiel('https://karriere.bad-energie.de/jobs')));
    fenster.dispatchEvent(ereignis('click', klickZiel(null)));
    expect(nah).not.toHaveBeenCalled();
    fenster.dispatchEvent(ereignis('click', klickZiel('https://karriere.bad-energie.de/#ablauf')));
    expect(nah).toHaveBeenCalledTimes(1);
  });

  it('lädt beim Sprung per Anker auf die Insel, nicht bei anderen Ankern', () => {
    const nah = vi.fn();
    beiAnnaeherung(insel('bewerben'), nah);
    fenster.location.hash = '#aufgaben';
    fenster.dispatchEvent(new Event('hashchange'));
    expect(nah).not.toHaveBeenCalled();
    fenster.location.hash = '#bewerben';
    fenster.dispatchEvent(new Event('hashchange'));
    expect(nah).toHaveBeenCalledTimes(1);
  });

  it('räumt beim Abbau Beobachter und Zuhörer ab', () => {
    const element = insel('bewerben');
    const nah = vi.fn();
    const aufraeumen = beiAnnaeherung(element, nah);
    aufraeumen();
    fenster.dispatchEvent(ereignis('focusin', element));
    fenster.dispatchEvent(ereignis('click', klickZiel('https://karriere.bad-energie.de/#bewerben')));
    fenster.location.hash = '#bewerben';
    fenster.dispatchEvent(new Event('hashchange'));
    expect(nah).not.toHaveBeenCalled();
    expect(Beobachter.zuletzt?.getrennt).toBe(true);
  });

  it('lädt sofort, wo es keinen IntersectionObserver gibt', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const nah = vi.fn();
    beiAnnaeherung(insel('bewerben'), nah);
    expect(nah).toHaveBeenCalledTimes(1);
  });
});

describe('linkAufDieseSeite', () => {
  const ziel = (href: string) => klickZiel(href) as unknown as EventTarget;

  it('erkennt Links auf dieselbe Seite, mit und ohne Hash, auch relativ', () => {
    expect(linkAufDieseSeite(ziel('https://karriere.bad-energie.de/#faq'), ORT)).toBe(true);
    expect(linkAufDieseSeite(ziel('https://karriere.bad-energie.de/'), ORT)).toBe(true);
    expect(linkAufDieseSeite(ziel('/#vorteile'), ORT)).toBe(true);
  });

  it('nicht für andere Pfade, Suchen, Ursprünge und Klicks außerhalb von Links', () => {
    expect(linkAufDieseSeite(ziel('/jobs#faq'), ORT)).toBe(false);
    expect(linkAufDieseSeite(ziel('/?stelle=1'), ORT)).toBe(false);
    expect(linkAufDieseSeite(ziel('https://bad-energie.de/'), ORT)).toBe(false);
    expect(linkAufDieseSeite(klickZiel(null) as unknown as EventTarget, ORT)).toBe(false);
    expect(linkAufDieseSeite(new EventTarget(), ORT)).toBe(false);
    expect(linkAufDieseSeite(null, ORT)).toBe(false);
  });
});

describe('imLeerlauf', () => {
  it('lädt im Leerlauf vor und lässt sich vorher abbrechen', () => {
    const rueckrufe: (() => void)[] = [];
    const abgebrochen: number[] = [];
    vi.stubGlobal('window', {
      requestIdleCallback: (rueckruf: () => void) => rueckrufe.push(rueckruf),
      cancelIdleCallback: (id: number) => abgebrochen.push(id),
    });
    const laden = vi.fn(() => Promise.resolve());
    const abbrechen = imLeerlauf(laden);
    expect(laden).not.toHaveBeenCalled();
    rueckrufe[0]();
    expect(laden).toHaveBeenCalledTimes(1);
    abbrechen();
    expect(abgebrochen).toEqual([1]);
  });

  it('ohne requestIdleCallback nach kurzer Pause; ein Ladefehler bleibt still', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('window', { setTimeout, clearTimeout });
    const laden = vi.fn(() => Promise.reject(new Error('offline')));
    imLeerlauf(laden);
    expect(laden).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2000);
    expect(laden).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('erstelleTor', () => {
  it('bleibt zu, bis es geöffnet wird', async () => {
    const tor = erstelleTor();
    let offen = false;
    void tor.offen.then(() => {
      offen = true;
    });
    await Promise.resolve();
    expect(offen).toBe(false);
    tor.oeffnen();
    await tor.offen;
    expect(offen).toBe(true);
  });
});
