import { describe, expect, it } from 'vitest';

import { APPLICATION_JOB_IDS } from '@/lib/applications/constants';
import { getFunnelOptions } from '@/lib/jobs/registry';
import { KEINE_STELLE } from '../params';
import { bewerbungZiel, variantenParams } from '../vorauswahl';

/** Was proxy.ts mit einer Adresse tut (Stichtag fest, damit Abläufe über validThrough reproduzierbar sind). */
const ziel = (url: string, now = new Date('2026-10-27T10:00:00Z')) => {
  const adresse = new URL(url, 'https://karriere.bad-energie.de');
  return bewerbungZiel(adresse.pathname, adresse.searchParams, now);
};

describe('bewerbungZiel: /bewerbung aus dem Cache (Schritt 2b)', () => {
  it.each([
    // Alles ohne Vorauswahl bekommt die statische Seite, auch mit Kampagnen- und Flow-Parametern.
    ['/bewerbung', null],
    ['/bewerbung?utm_source=indeed&utm_campaign=x&ref=koch&herkunft=qr&schritt=start', null],
    ['/bewerbung?stelle=gibt-es-nicht', null],
    ['/bewerbung?stelle=%25%25%25', null],
    ['/bewerbung?stelle=__proto__', null],
    ['/bewerbung?tab=quiz', null],
    ['/bewerbung?direct=false', null],
    ['/bewerbung?direct=0', null],
    // Vorauswahl über Slug, Job-ID oder „initiativ“ (auch gemischte Schreibweise und Leerzeichen, erster Wert zählt).
    ['/bewerbung?stelle=anlagenmechaniker-shk-wetzlar&utm_source=indeed', { art: 'umschreiben', pfad: '/bewerbung/variante/anlagenmechaniker-shk/ohne' }],
    ['/bewerbung?stelle=anlagenmechaniker-shk', { art: 'umschreiben', pfad: '/bewerbung/variante/anlagenmechaniker-shk/ohne' }],
    ['/bewerbung?stelle=%20INITIATIV%20', { art: 'umschreiben', pfad: '/bewerbung/variante/initiativ/ohne' }],
    ['/bewerbung?stelle=initiativ&stelle=anlagenmechaniker-shk', { art: 'umschreiben', pfad: '/bewerbung/variante/initiativ/ohne' }],
    // Unterlagen-Hinweis der Altlinks (E-BEW-027), mit und ohne Vorauswahl.
    ['/bewerbung?tab=vault', { art: 'umschreiben', pfad: `/bewerbung/variante/${KEINE_STELLE}/unterlagen` }],
    ['/bewerbung?tab=Direct', { art: 'umschreiben', pfad: `/bewerbung/variante/${KEINE_STELLE}/unterlagen` }],
    ['/bewerbung?direct=true&stelle=initiativ', { art: 'umschreiben', pfad: '/bewerbung/variante/initiativ/unterlagen' }],
    // ?tab=dossier war die A4-Mappe: Weiterleitung mit Query ohne die Altparameter.
    ['/bewerbung?tab=dossier&utm_source=indeed&stelle=initiativ', { art: 'weiterleiten', url: '/bewerbung/mappe?utm_source=indeed&stelle=initiativ' }],
    ['/bewerbung?tab=vault&tab=dossier', { art: 'umschreiben', pfad: `/bewerbung/variante/${KEINE_STELLE}/unterlagen` }],
    // Direkter Aufruf der internen Adresse: zurück auf die öffentliche.
    ['/bewerbung/variante/anlagenmechaniker-shk/ohne', { art: 'weiterleiten', url: '/bewerbung?stelle=anlagenmechaniker-shk' }],
    ['/bewerbung/variante/keine/unterlagen?utm_source=x', { art: 'weiterleiten', url: '/bewerbung?utm_source=x' }],
  ])('%s', (url, erwartet) => {
    expect(ziel(url)).toEqual(erwartet);
  });

  it('jedes Umschreibeziel ist vorgerendert (sonst 404 wegen dynamicParams = false)', () => {
    const varianten = new Set(variantenParams().map(({ stelle, hinweis }) => `/bewerbung/variante/${stelle}/${hinweis}`));
    const anfragen = [
      ...getFunnelOptions().flatMap((option) => [option.slug, option.id]),
      'initiativ',
      'INITIATIV',
    ].flatMap((stelle) => [`/bewerbung?stelle=${stelle}`, `/bewerbung?stelle=${stelle}&tab=vault`]);
    for (const url of [...anfragen, '/bewerbung?tab=vault', '/bewerbung?direct=true']) {
      const ergebnis = ziel(url);
      if (ergebnis?.art === 'umschreiben') expect(varianten.has(ergebnis.pfad), url).toBe(true);
    }
  });

  it('kennt jede Variante genau einmal, „keine“ nur mit Hinweis und nie als Job-ID', () => {
    const schluessel = variantenParams().map(({ stelle, hinweis }) => `${stelle}/${hinweis}`);
    expect(new Set(schluessel).size).toBe(schluessel.length);
    expect(schluessel).toContain(`${KEINE_STELLE}/unterlagen`);
    expect(schluessel).not.toContain(`${KEINE_STELLE}/ohne`);
    expect(APPLICATION_JOB_IDS as readonly string[]).not.toContain(KEINE_STELLE);
  });

  it('wählt eine abgelaufene Stelle nicht mehr vor (validThrough), eine laufende schon', () => {
    const abgelaufen = getFunnelOptions().find((option) => !getFunnelOptions(new Date('2100-01-01')).some((live) => live.id === option.id));
    if (abgelaufen?.slug) expect(ziel(`/bewerbung?stelle=${abgelaufen.slug}`, new Date('2100-01-01'))).toBeNull();
    const laeuft = getFunnelOptions(new Date('2026-10-27T10:00:00Z'))[0];
    expect(ziel(`/bewerbung?stelle=${laeuft.id}`)).not.toBeNull();
  });
});
