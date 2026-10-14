import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import type { Attribution } from '@/lib/applications/schema';
import { attributionFromUrl } from '@/lib/attribution/capture';
import { ACQUISITION_CHANNELS, HERKUNFT_CODES, channelFromHerkunftCode, deriveChannel, type AcquisitionChannel } from '@/lib/attribution/channel';
import {
  HERKUNFT_PARAM,
  HERKUNFT_PARAM_CODES,
  HERKUNFT_ZIELE,
  attributionAusHerkunft,
  herkunftParameter,
  mitHerkunft,
} from '@/lib/attribution/link';
import { getAttribution, resetAttributionForTests } from '@/lib/attribution/store';

const ORIGIN = 'https://karriere.bad-energie.de';

/** Je Kanal eine echte Einstiegs-Attribution (wie aus utm_*, ref oder dem Referrer). */
const EINSTIEG: Record<AcquisitionChannel, Attribution> = {
  google_jobs: { utmSource: 'google_jobs_apply', utmMedium: 'organic', utmCampaign: 'google_jobs_apply' },
  indeed: { utmSource: 'indeed', utmMedium: 'jobboard', utmCampaign: 'anlagenmechaniker-shk' },
  arbeitsagentur: { referrerHost: 'www.arbeitsagentur.de' },
  hwk: { utmSource: 'hwk', utmMedium: 'jobboard' },
  meta_ads: { utmSource: 'instagram', utmMedium: 'cpc' },
  tiktok_ads: { utmSource: 'tiktok', utmMedium: 'paid' },
  google_ads: { utmSource: 'google', utmMedium: 'cpc' },
  referral: { ref: 'koch-2026', referrerHost: 'l.facebook.com' },
  talentpool_alert: { utmSource: 'newsletter', utmMedium: 'job_alert' },
  jobboard: { utmSource: 'jobs-xml', utmMedium: 'jobboard' },
  organic_search: { referrerHost: 'www.ecosia.org' },
  social: { referrerHost: 'www.linkedin.com' },
  direct: { landingPath: '/' },
  other: { utmSource: 'flyer', utmMedium: 'print', utmCampaign: 'fahrzeug' },
};

afterEach(() => resetAttributionForTests());

describe('Kanalcodes (HERKUNFT_CODES)', () => {
  it('ein Code je Kanal, 2–4 Großbuchstaben, alle verschieden, Rückweg über channelFromHerkunftCode', () => {
    expect(Object.keys(HERKUNFT_CODES).sort()).toEqual([...ACQUISITION_CHANNELS].sort());
    const codes = Object.values(HERKUNFT_CODES);
    expect(new Set(codes).size).toBe(codes.length);
    for (const channel of ACQUISITION_CHANNELS) {
      expect(HERKUNFT_CODES[channel]).toMatch(/^[A-Z]{2,4}$/);
      expect(channelFromHerkunftCode(HERKUNFT_CODES[channel])).toBe(channel);
      expect(channelFromHerkunftCode(HERKUNFT_CODES[channel].toLowerCase())).toBe(channel);
    }
    expect(channelFromHerkunftCode('XYZ')).toBeUndefined();
    expect(channelFromHerkunftCode(42)).toBeUndefined();
  });

  it('die Doku-Tabelle im Kommentar von channel.ts nennt jeden Code mit seinem Kanal', () => {
    const quelle = readFileSync(path.join(process.cwd(), 'lib/attribution/channel.ts'), 'utf8');
    for (const channel of ACQUISITION_CHANNELS) {
      expect(quelle).toMatch(new RegExp(`^ \\* \\| ${HERKUNFT_CODES[channel]} +\\| ${channel} +\\|`, 'm'));
    }
  });
});

describe('Parameter ?herkunft= (link.ts)', () => {
  it('jeder Code im Parameter führt auf der Bewerbungsseite zu genau dem Kanal, für den er steht', () => {
    expect([...HERKUNFT_PARAM_CODES].sort()).toEqual(
      ACQUISITION_CHANNELS.filter((channel) => channel !== 'referral' && channel !== 'direct')
        .map((channel) => HERKUNFT_CODES[channel].toLowerCase())
        .sort(),
    );
    for (const code of HERKUNFT_PARAM_CODES) {
      expect(deriveChannel(attributionAusHerkunft(code)), code).toBe(channelFromHerkunftCode(code));
    }
  });

  it('unbekannte, leere und fremde Werte ergeben nichts; Groß- und Kleinschreibung und Leerraum egal', () => {
    expect(attributionAusHerkunft('IND ')).toEqual({ utmSource: 'indeed' });
    for (const wert of [null, undefined, '', ' ', 'dir', 'empf', 'xyz', '__proto__', 'constructor', 'ind;drop']) {
      expect(attributionAusHerkunft(wert), String(wert)).toBeNull();
    }
  });

  it('herkunftParameter: Code klein, Empfehlung trägt ihren ref-Code, direkt trägt nichts', () => {
    const fuer = (channel: AcquisitionChannel) => herkunftParameter(channel, HERKUNFT_CODES[channel], EINSTIEG[channel]);
    expect(fuer('indeed')).toEqual([HERKUNFT_PARAM, 'ind']);
    expect(fuer('organic_search')).toEqual(['herkunft', 'such']);
    expect(fuer('referral')).toEqual(['ref', 'koch-2026']);
    expect(herkunftParameter('referral', 'EMPF', {})).toBeNull();
    expect(fuer('direct')).toBeNull();
  });

  it('nur interne Links auf /bewerbung und die Mappe, relative bleiben relativ, Anker und Query bleiben', () => {
    const p = ['herkunft', 'ind'] as const;
    expect(HERKUNFT_ZIELE).toEqual(['/bewerbung', '/bewerbung/mappe']);
    expect(mitHerkunft('/bewerbung', p, ORIGIN)).toBe('/bewerbung?herkunft=ind');
    expect(mitHerkunft('/bewerbung/', p, ORIGIN)).toBe('/bewerbung/?herkunft=ind');
    expect(mitHerkunft('/bewerbung?stelle=initiativ#flow', p, ORIGIN)).toBe('/bewerbung?stelle=initiativ&herkunft=ind#flow');
    expect(mitHerkunft('/bewerbung/mappe', p, ORIGIN)).toBe('/bewerbung/mappe?herkunft=ind');
    expect(mitHerkunft(`${ORIGIN}/bewerbung?stelle=x`, p, ORIGIN)).toBe(`${ORIGIN}/bewerbung?stelle=x&herkunft=ind`);
    for (const href of [
      '/bewerbung/danke',
      '/jobs/anlagenmechaniker-shk-wetzlar',
      '/',
      '#unterlagen',
      'https://www.bad-energie.de/bewerbung',
      'https://example.org/bewerbung',
      'tel:+49644142956',
      'mailto:info@bad-energie.de',
      'https://api.whatsapp.com/send?phone=491608834290&text=Hallo',
    ]) {
      expect(mitHerkunft(href, p, ORIGIN), href).toBe(href);
    }
  });

  it('ein Link mit eigener Herkunft (utm_*, ref, herkunft) bleibt, wie er ist; ohne Parameter auch', () => {
    const p = ['herkunft', 'ind'] as const;
    for (const href of ['/bewerbung?utm_source=qr', '/bewerbung?ref=koch', '/bewerbung?herkunft=ba', '/bewerbung?utm_campaign=x']) {
      expect(mitHerkunft(href, p, ORIGIN)).toBe(href);
    }
    expect(mitHerkunft('/bewerbung', null, ORIGIN)).toBe('/bewerbung');
    expect(mitHerkunft('http://[kaputt', p, ORIGIN)).toBe('http://[kaputt');
  });
});

describe('capture.ts liest ?herkunft= nur ohne eigenes Signal', () => {
  it('Rundweg: Kanal der Einstiegsseite → Link mit Herkunft → neuer Tab → derselbe Kanal (außer direkt)', () => {
    for (const channel of ACQUISITION_CHANNELS) {
      const einstieg = EINSTIEG[channel];
      expect(deriveChannel(einstieg), channel).toBe(channel);
      const link = mitHerkunft('/bewerbung?stelle=initiativ', herkunftParameter(channel, HERKUNFT_CODES[channel], einstieg), ORIGIN);
      // Neuer Tab: Referrer ist die eigene Seite (zählt nicht), es gilt nur die Adresse.
      const neu = attributionFromUrl({ url: `${ORIGIN}${link}`, referrer: `${ORIGIN}/jobs/anlagenmechaniker-shk-wetzlar` });
      expect(deriveChannel(neu), channel).toBe(channel);
      expect(neu.landingPath).toBe('/bewerbung');
    }
  });

  it('trägt nur den Kanal: keine Kampagne, kein Referrer, keine Einstiegsseite der ersten Seite', () => {
    const link = mitHerkunft('/bewerbung', herkunftParameter('indeed', 'IND', EINSTIEG.indeed), ORIGIN);
    expect(link).toBe('/bewerbung?herkunft=ind');
    expect(attributionFromUrl({ url: `${ORIGIN}${link}` })).toEqual({ utmSource: 'indeed', landingPath: '/bewerbung' });
  });

  it('UTM, ref oder ein fremder Referrer gehen vor: Wer den Link weitergeschickt bekommt, kommt über seinen Weg', () => {
    expect(attributionFromUrl({ url: `${ORIGIN}/bewerbung?herkunft=ind&utm_source=qr`, referrer: '' })).toEqual({
      utmSource: 'qr',
      landingPath: '/bewerbung',
    });
    expect(attributionFromUrl({ url: `${ORIGIN}/bewerbung?herkunft=ind&ref=koch` })).toEqual({ ref: 'koch', landingPath: '/bewerbung' });
    expect(attributionFromUrl({ url: `${ORIGIN}/bewerbung?herkunft=ind`, referrer: 'https://l.facebook.com/' })).toEqual({
      referrerHost: 'l.facebook.com',
      landingPath: '/bewerbung',
    });
    expect(attributionFromUrl({ url: `${ORIGIN}/bewerbung?herkunft=quatsch` })).toEqual({ landingPath: '/bewerbung' });
  });

  it('der Speicher bleibt der Arbeitsspeicher: getAttribution ohne Fenster leer, kein Cookie, kein Storage', () => {
    expect(getAttribution()).toEqual({});
    // Code ohne Kommentare (die Kommentare erklären gerade, warum es keinen Cookie und keinen Storage gibt).
    const quellen = ['link.ts', 'capture.ts', 'store.ts', 'klick.ts', 'ereignisse.ts'].map((datei) =>
      readFileSync(path.join(process.cwd(), 'lib/attribution', datei), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, ''),
    );
    expect(quellen.join('\n')).toContain('captureAttribution');
    for (const quelle of quellen) expect(quelle).not.toMatch(/document\.cookie|localStorage|sessionStorage|indexedDB/);
  });
});
