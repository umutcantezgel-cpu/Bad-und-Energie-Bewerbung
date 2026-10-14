import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { SubmitFailureKind } from '@/lib/apply/submit';
import {
  EREIGNIS_ENDPOINT,
  EREIGNIS_META,
  EREIGNIS_NAMEN,
  FEHLER_ARTEN,
  baueEreignis,
  ereignisseAktiv,
  sendeEreignis,
  stelleAusAdresse,
  type FehlerArt,
} from '@/lib/attribution/ereignisse';
import { captureAttribution, resetAttributionForTests } from '@/lib/attribution/store';

/** Jede Fehlerart des Absendens ist eine Fehlerart der Ereignisse und umgekehrt (prüft tsc). */
const ALLE_FEHLER: Record<SubmitFailureKind, true> = { offline: true, network: true, timeout: true, validation: true, rate_limited: true, server: true };
const FEHLER_ALS_ART: readonly FehlerArt[] = Object.keys(ALLE_FEHLER) as SubmitFailureKind[];

/** Ein Dokument mit oder ohne Schalter. */
function dokument(schalter: string | null) {
  return {
    querySelector: (selector: string) =>
      schalter !== null && selector === `meta[name="${EREIGNIS_META}"]` ? { getAttribute: (name: string) => (name === 'content' ? schalter : null) } : null,
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { origin: 'https://karriere.bad-energie.de', pathname: '/bewerbung', search: '' },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  resetAttributionForTests();
});

describe('Vertrag der Ereignisse', () => {
  it('genau die sechs Ereignisse aus dem Plan, Endpunkt /api/e', () => {
    expect(EREIGNIS_NAMEN).toEqual(['flow_start', 'schritt', 'abgesendet', 'fehler', 'whatsapp_klick', 'telefon_klick']);
    expect(EREIGNIS_ENDPOINT).toBe('/api/e');
  });

  it('jedes Ereignis hat genau eine Quelle: der Flow sendet vier, der Link-Beobachter zwei', () => {
    const quelle = (datei: string) => readFileSync(path.join(process.cwd(), datei), 'utf8');
    const flow = quelle('components/apply/ApplyFlowClient.tsx');
    const klick = quelle('lib/attribution/klick.ts');
    for (const name of ['flow_start', 'schritt', 'abgesendet', 'fehler']) {
      expect(flow.match(new RegExp(`sendeEreignis\\(\\{ ereignis: '${name}'`, 'g')), name).toHaveLength(1);
    }
    expect(klick).toContain("art === 'whatsapp' ? 'whatsapp_klick' : 'telefon_klick'");
    // Der Flow sendet nur Ereignisse, keine Rohdaten: kein sendBeacon und kein fetch auf /api/e am Ereignis vorbei.
    expect(flow).not.toMatch(/sendBeacon|\/api\/e\b/);
  });

  it('Fehlerarten wie SubmitFailureKind (lib/apply/submit.ts)', () => {
    expect([...FEHLER_ARTEN].sort()).toEqual([...FEHLER_ALS_ART].sort());
  });

  it('baueEreignis: Kanal dazu, Stelle getrimmt, leere oder zu lange Stelle fällt weg', () => {
    expect(baueEreignis({ ereignis: 'flow_start', stelle: ' anlagenmechaniker-shk ' }, 'indeed')).toEqual({
      ereignis: 'flow_start',
      stelle: 'anlagenmechaniker-shk',
      kanal: 'indeed',
    });
    expect(baueEreignis({ ereignis: 'schritt', stelle: null, schritt: 'kontakt' }, 'direct')).toEqual({ ereignis: 'schritt', schritt: 'kontakt', kanal: 'direct' });
    expect(baueEreignis({ ereignis: 'fehler', stelle: 'x'.repeat(81), fehler: 'timeout' }, 'hwk')).toEqual({ ereignis: 'fehler', fehler: 'timeout', kanal: 'hwk' });
  });

  it('stelleAusAdresse: Slug der Stellenseite oder ?stelle= im Flow, sonst nichts', () => {
    expect(stelleAusAdresse({ pathname: '/jobs/anlagenmechaniker-shk-wetzlar', search: '' })).toBe('anlagenmechaniker-shk-wetzlar');
    expect(stelleAusAdresse({ pathname: '/jobs/anlagenmechaniker-shk-wetzlar/', search: '?utm_source=indeed' })).toBe('anlagenmechaniker-shk-wetzlar');
    expect(stelleAusAdresse({ pathname: '/bewerbung', search: '?stelle=initiativ&schritt=kontakt' })).toBe('initiativ');
    expect(stelleAusAdresse({ pathname: '/bewerbung', search: '' })).toBeUndefined();
    expect(stelleAusAdresse({ pathname: '/jobs', search: '' })).toBeUndefined();
    expect(stelleAusAdresse({ pathname: '/einsatzgebiet/wetzlar', search: '?stelle=x' })).toBeUndefined();
    expect(stelleAusAdresse({ pathname: '/jobs/%E0%A4%A', search: '' })).toBe('%E0%A4%A');
  });
});

describe('Schalter im HTML (FUNNEL_EVENTS → <meta name="be-ereignisse" content="an">)', () => {
  it('nur mit dem Meta-Element und genau „an“', () => {
    expect(ereignisseAktiv(dokument('an'))).toBe(true);
    expect(ereignisseAktiv(dokument('aus'))).toBe(false);
    expect(ereignisseAktiv(dokument(null))).toBe(false);
    expect(ereignisseAktiv(undefined)).toBe(false);
    // Ohne DOM (Server, Node) nie an
    expect(ereignisseAktiv()).toBe(false);
  });
});

describe('sendeEreignis per sendBeacon', () => {
  it('sendet nichts ohne Schalter', () => {
    const sendBeacon = vi.fn(() => true);
    vi.stubGlobal('navigator', { sendBeacon });
    vi.stubGlobal('document', dokument(null));
    expect(sendeEreignis({ ereignis: 'flow_start' })).toBe(false);
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it('mit Schalter: ein Beacon an /api/e als Text mit Ereignis, Stelle und Kanal aus der Attribution, sonst nichts', () => {
    const sendBeacon = vi.fn((_url: string, _body?: unknown) => true);
    vi.stubGlobal('navigator', { sendBeacon });
    vi.stubGlobal('document', dokument('an'));
    captureAttribution({ url: 'https://karriere.bad-energie.de/jobs/x?utm_source=indeed&utm_medium=jobboard&utm_campaign=geheim', referrer: '' });

    expect(sendeEreignis({ ereignis: 'schritt', stelle: 'anlagenmechaniker-shk', schritt: 'start' })).toBe(true);
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, body] = sendBeacon.mock.calls[0];
    expect(url).toBe('/api/e');
    expect(typeof body).toBe('string');
    expect(JSON.parse(body as string)).toEqual({ ereignis: 'schritt', stelle: 'anlagenmechaniker-shk', schritt: 'start', kanal: 'indeed' });
    expect(body).not.toMatch(/geheim|utm|jobboard|\/jobs\/x/);
  });

  it('wirft nie: ohne sendBeacon, wenn sendBeacon wirft oder ablehnt', () => {
    vi.stubGlobal('document', dokument('an'));
    vi.stubGlobal('navigator', {});
    expect(sendeEreignis({ ereignis: 'abgesendet' })).toBe(false);
    vi.stubGlobal('navigator', {
      sendBeacon: () => {
        throw new TypeError('blockiert');
      },
    });
    expect(sendeEreignis({ ereignis: 'abgesendet' })).toBe(false);
    vi.stubGlobal('navigator', { sendBeacon: () => false });
    expect(sendeEreignis({ ereignis: 'abgesendet' })).toBe(false);
  });
});
