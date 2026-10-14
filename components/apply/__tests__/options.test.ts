import { describe, expect, it } from 'vitest';
import { FACTS } from '@/lib/content/facts';
import { getActiveJobs, getJobById, isJobLive } from '@/lib/jobs/registry';
import { INITIATIVE_OPTION, getFlowJobOptions, zusatzZeile } from '../options';

/**
 * Auswahl der Stelle im Flow: statt einer Gehaltsspanne die belegten Zusatzleistungen der Stelle (E-030, Plan §D),
 * nur aus ihren Daten. Kein Betrag, beim Schülerpraktikum gar nichts zu Geld (fakten-abgleich S4).
 */

const STICHTAG = new Date('2026-10-14T12:00:00Z');
const job = (id: Parameters<typeof getJobById>[0]) => getJobById(id)!;

describe('zusatzZeile', () => {
  it('Fachkräfte: Fakt aboveTariff und 30 Tage Urlaub', () => {
    for (const id of ['anlagenmechaniker-shk', 'kundendiensttechniker-shk', 'obermonteur-projektleiter-shk'] as const) {
      expect(job(id).benefitFactIds).toEqual(expect.arrayContaining(['aboveTariff', 'vacation30']));
      expect(zusatzZeile(job(id)), id).toBe(`Über Tarif · ${FACTS.vacation30.short}`);
    }
  });

  it('Ausbildung und Quereinstieg: „über Tarif“ aus der Paketzeile Vergütung', () => {
    for (const id of ['ausbildung-anlagenmechaniker-shk', 'ausbildung-anlagenmechaniker-shk-2027', 'quereinsteiger-montagehelfer'] as const) {
      const verguetung = job(id).packageExtras.find((extra) => extra.label === 'Vergütung')!.text;
      expect(verguetung, id).toMatch(/über Tarif|übertariflich/i);
      expect(zusatzZeile(job(id)), id).toMatch(/^Über Tarif/);
    }
  });

  it('Büro: kein Tarif belegt (S5), nur der betriebsweite Urlaub; Praktikum: nichts', () => {
    expect(zusatzZeile(job('buerofachkraft'))).toBe(FACTS.vacation30.short);
    expect(zusatzZeile(job('schuelerpraktikum-shk'))).toBeUndefined();
    // Ohne belegte Angabe keine Zeile
    expect(zusatzZeile({ pay: 'auf-anfrage', benefitFactIds: [], packageExtras: [] })).toBeUndefined();
    expect(zusatzZeile({ pay: 'keine-angabe', benefitFactIds: ['aboveTariff', 'vacation30'], packageExtras: [] })).toBeUndefined();
  });
});

describe('getFlowJobOptions', () => {
  it('jede live Stelle in Registry-Reihenfolge, dann „Initiativ bewerben“; Beschreibung = zusatzZeile, nie ein Betrag', () => {
    const options = getFlowJobOptions(STICHTAG);
    const live = getActiveJobs().filter((j) => isJobLive(j, STICHTAG));
    expect(options.map((option) => option.id)).toEqual([...live.map((j) => j.id), INITIATIVE_OPTION.id]);
    for (const option of options.slice(0, -1)) {
      expect(option.description, option.id).toBe(zusatzZeile(job(option.id as Parameters<typeof getJobById>[0])));
      expect(option.description ?? '', option.id).not.toMatch(/€|\d{3}/);
    }
    expect(options.find((option) => option.id === 'schuelerpraktikum-shk')).not.toHaveProperty('description');
  });
});
