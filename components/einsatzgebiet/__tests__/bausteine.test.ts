import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FACTS } from '@/lib/content/facts';
import { getHubKreise, getPublishedPlaces } from '@/lib/places/registry';
import { getEinsatzgebietPageText, getKreisPageText, getPlacePageText } from '@/lib/places/text';
import { FAKT_BEGLEITER, Faktenband, faktSatz } from '../Bausteine';

/** Review Phase 2, Punkt 8: Im Band „Was überall gilt“ trägt jeder Fakt einen Satz, oder das Band steht nur mit Kästchen. */
describe('Faktenband', () => {
  const baender = [
    ...getPublishedPlaces().map((place) => getPlacePageText(place).bandFactIds),
    ...getHubKreise().map((kreis) => getKreisPageText(kreis).bandFactIds),
    getEinsatzgebietPageText().sections.find((s) => s.id === 'band')!.blocks.flatMap((b) => b.factIds ?? []),
  ];

  it('jeder Fakt im Band hat einen belegten Satz (eigener langer Text oder der Begleitfakt der Startseite)', () => {
    for (const ids of baender) for (const id of ids) expect(faktSatz(id), id).not.toBeNull();
    // Flexible Arbeitszeiten: wie die Zusage der Startseite mit „Keine unbezahlten Überstunden.“
    expect(FAKT_BEGLEITER.flexibleHours).toBe('noUnpaidOvertime');
    expect(faktSatz('flexibleHours')).toBe(FACTS.noUnpaidOvertime.long);
    // Kein Satz wiederholt nur das Etikett
    for (const ids of baender) for (const id of ids) expect(faktSatz(id), id).not.toBe(`${FACTS[id].short}.`);
  });

  it('jeder Fakt zeigt Kästchen und Satz; ohne belegten Satz steht das ganze Band nur mit Kästchen', () => {
    const section = { id: 'band', heading: 'Was überall gilt', blocks: [] };
    const mit = renderToStaticMarkup(createElement(Faktenband, { section, factIds: ['noFarAssembly', 'vacation30', 'flexibleHours'] }));
    expect(mit.match(/<li/g)).toHaveLength(3);
    expect(mit.match(/<p class="[^"]*faktText/g)).toHaveLength(3);
    expect(mit).toContain('Keine unbezahlten Überstunden.');
    // Ein Fakt ohne Satz und ohne Begleiter (Kurzform = Langform ohne Punkt): nur Kästchen, kein leerer Platz
    const ohne = Object.entries(FACTS).find(([id, fact]) => fact.long === `${fact.short}.` && !(id in FAKT_BEGLEITER))?.[0];
    if (ohne) {
      const kurz = renderToStaticMarkup(createElement(Faktenband, { section, factIds: ['vacation30', ohne as keyof typeof FACTS] }));
      expect(kurz).not.toMatch(/faktText/);
      expect(kurz).toMatch(/faktenKurz/);
    }
  });
});
