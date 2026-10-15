import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as llmsFull } from '@/app/llms-full.txt/route';
import { GET as llms } from '@/app/llms.txt/route';
import { COMPANY_FACT_IDS, EMPLOYER_FACT_IDS, funnelOnlyJobs, liveJobs } from '@/app/llms.txt/content';
import { COMPANY, FACTS, type FactId } from '@/lib/content';
import type { Job } from '@/lib/jobs/registry';

/** E-SEO-014: the short file carries the backed employer lines the old file had, all from fact ids. */

async function textAt(route: () => Response, iso: string): Promise<string> {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(iso));
  return route().text();
}

afterEach(() => {
  vi.useRealTimers();
});

describe('llms.txt (E-SEO-014)', () => {
  it('lists pay, contract, Hilti kit, workwear and chamber and guild from the registry', async () => {
    const text = await textAt(llms, '2026-10-10T12:00:00Z');
    expect(text).toContain('Vergütung deutlich über dem regionalen Handwerkstarif, dazu Urlaubs- und Weihnachtsgeld.');
    expect(text).toContain('Du bekommst einen unbefristeten Arbeitsvertrag.');
    expect(text).toContain(FACTS.hilti.long);
    expect(text).toContain(FACTS.workwear.long);
    expect(text).toContain(`${COMPANY.hwk}, ${COMPANY.innung}`);
  });

  it('job conditions only with the jobs whose own data carry them, never by naming the exceptions (Runde 3)', async () => {
    const jetzt = new Date('2026-10-20T12:00:00Z');
    const stellen = [...liveJobs(jetzt), ...funnelOnlyJobs()];
    expect(stellen.length).toBeGreaterThan(0);
    // Was die Stelle selbst sagt: ihre Vorteile, „Unbefristet“ und „Lohn auf Anfrage“ in der Meta-Zeile
    const fuehrt = (id: FactId, job: Job) =>
      job.benefitFactIds.includes(id) ||
      (id === 'permanentContract' && job.employment.permanent) ||
      (id === 'payOnRequest' && job.pay === 'auf-anfrage');
    const stellenbezogen = EMPLOYER_FACT_IDS.filter((id) => !COMPANY_FACT_IDS.includes(id));
    expect(stellenbezogen).toEqual(expect.arrayContaining(['payOnRequest', 'aboveTariff', 'permanentContract', 'flexibleHours', 'vacation30']));
    // Über den Betrieb selbst nur, was für jede Stelle gilt: kein Fakt mit offenFuer
    for (const id of COMPANY_FACT_IDS) expect(FACTS[id].offenFuer, id).toBeUndefined();
    for (const route of [llms, llmsFull]) {
      const text = await textAt(route, jetzt.toISOString());
      // llms.txt: „## Arbeitgeber“, llms-full.txt: „## 1. Arbeitgeber“
      const arbeitgeber = text.split(/^## (?:1\. )?Arbeitgeber$/m)[1]?.split('\n## ')[0] ?? '';
      const zeilen = arbeitgeber.split('\n');
      for (const id of COMPANY_FACT_IDS) expect(zeilen, id).toContain(`- ${FACTS[id].long}`);
      for (const id of stellenbezogen) {
        const zeile = zeilen.find((line) => line.startsWith(`- ${FACTS[id].long}`));
        const mit = stellen.filter((job) => fuehrt(id, job));
        if (mit.length === 0) expect(zeile, id).toBeUndefined();
        else if (mit.length === stellen.length) expect(zeile, id).toBe(`- ${FACTS[id].long}`);
        else expect(zeile, id).toBe(`- ${FACTS[id].long} Je nach Stelle; genannt bei: ${mit.map((job) => job.shortTitle).join(', ')}.`);
        // Genannt (ohne Zusatz: alle) ist eine Stelle genau dann, wenn ihre eigenen Daten den Fakt führen
        const genannt = zeile === undefined ? [] : (zeile.match(/; genannt bei: (.+)\.$/)?.[1].split(', ') ?? stellen.map((job) => job.shortTitle));
        for (const job of stellen) {
          expect(genannt.includes(job.shortTitle), `${id}: ${job.shortTitle}`).toBe(fuehrt(id, job));
          if (FACTS[id].offenFuer?.kategorien.includes(job.category)) expect(genannt, `${id}: ${job.shortTitle}`).not.toContain(job.shortTitle);
        }
      }
      // Ausnahmen werden nicht aufgezählt: Aus „offen bei: Bürofachkraft“ las sich der Rest als gültig
      expect(arbeitgeber).not.toContain('offen bei');
      // Beleg seo-gate-r3/llms-offen-bei.txt: Ausbildung und Schülerpraktikum ohne unbefristeten Vertrag und ohne Tarif,
      // das Praktikum ohne Urlaub und ohne Lohn, der Quereinstieg ohne Tarif
      const zeileVon = (id: FactId) => zeilen.find((line) => line.startsWith(`- ${FACTS[id].long}`)) ?? '';
      for (const titel of ['Ausbildung Anlagenmechaniker 2026', 'Ausbildung Anlagenmechaniker 2027', 'Schülerpraktikum SHK']) {
        expect(zeileVon('permanentContract'), titel).toContain('genannt bei: ');
        expect(zeileVon('permanentContract'), titel).not.toContain(titel);
        expect(zeileVon('aboveTariff'), titel).not.toContain(titel);
      }
      expect(zeileVon('aboveTariff')).toBe(
        `- ${FACTS.aboveTariff.long} Je nach Stelle; genannt bei: Anlagenmechaniker SHK, Kundendiensttechniker, Obermonteur / Projektleiter.`,
      );
      expect(zeileVon('vacation30')).not.toContain('Schülerpraktikum SHK');
      expect(zeileVon('payOnRequest')).toContain('genannt bei: ');
      expect(zeileVon('payOnRequest')).not.toContain('Schülerpraktikum SHK');
    }
    // Kopf von llms.txt: „Lohn auf Anfrage“ nicht pauschal, solange das Praktikum (ohne Wort zu Geld) offen ist
    const kopf = (await textAt(llms, jetzt.toISOString())).split('\n').find((line) => line.startsWith('> ')) ?? '';
    expect(stellen.some((job) => job.pay === 'keine-angabe')).toBe(true);
    expect(kopf).not.toContain(FACTS.payOnRequest.long);
  });

  it('llms-full.txt: the school internship block says nothing about working hours (S4, M-027, Runde 3)', async () => {
    const text = await textAt(llmsFull, '2026-10-20T12:00:00Z');
    const block = text.split('### Schülerpraktikum Anlagenmechaniker SHK (m/w/d)')[1]?.split('\n### ')[0] ?? '';
    expect(block).toContain('Das bekommst du');
    expect(block).not.toMatch(/Flexible Arbeitszeiten|Arbeitszeit/);
  });

  it('names the anniversary in the lead sentence until 31.12.2026, not after', async () => {
    const before = await textAt(llms, '2026-12-31T12:00:00Z');
    expect(before).toContain('100 Jahre Meisterbetrieb (1926–2026)');

    const after = await textAt(llms, '2027-01-01T12:00:00Z');
    expect(after).not.toContain('100 Jahre');
    expect(after).toContain(FACTS.founded1926.short);
  });

  it('keeps unbacked claims out of both files', async () => {
    for (const route of [llms, llmsFull]) {
      const text = await textAt(route, '2026-10-10T12:00:00Z');
      expect(text).not.toMatch(/Wäscheservice|bezahlt ins Wochenende|erstklassig|Spitzen/);
    }
  });

  it('lists the office phone and the WhatsApp mobile number on separate lines in both files', async () => {
    for (const route of [llms, llmsFull]) {
      const text = await textAt(route, '2026-10-10T12:00:00Z');
      expect(text).toContain('- Telefon: 06441 42956\n');
      expect(text).toContain('- WhatsApp: 0160 8834290\n');
      expect(text).not.toContain('Telefon und WhatsApp');
    }
  });

  it('answers as UTF-8 plain text', () => {
    for (const route of [llms, llmsFull]) {
      expect(route().headers.get('content-type')).toBe('text/plain; charset=utf-8');
    }
  });
});

describe('Einsatzgebiet in llms.txt und llms-full.txt (E-028)', () => {
  it('llms.txt: genau eine Zeile zur Gebietsseite', async () => {
    const { getPublishedPlaces } = await import('@/lib/places/registry');
    const text = await textAt(llms, '2026-10-12T12:00:00Z');
    const zeilen = text.split('\n').filter((line) => line.includes('/einsatzgebiet'));
    expect(zeilen).toHaveLength(1);
    expect(zeilen[0]).toContain(`[Einsatzgebiet: ${getPublishedPlaces().length} Orte mit Strecke und Fahrzeit]`);
  });

  it('llms-full.txt: je Kreis die Orte nach Strecke mit km, Minuten und Ortsseite', async () => {
    const { getKreise, getKreisPlaces, placeUrl } = await import('@/lib/places/registry');
    const text = await textAt(llmsFull, '2026-10-12T12:00:00Z');
    for (const kreis of getKreise()) {
      expect(text).toContain(`### ${kreis.name}`);
      for (const place of getKreisPlaces(kreis.id)) {
        expect(text).toContain(`- ${place.name} (${place.postalCode}): ${place.commute.distanceKm} km, ${place.commute.minutes} Minuten, ${placeUrl(place)}`);
      }
    }
    expect(text).toContain('Gemessen am 12. Oktober 2026 mit OpenStreetMap (OSRM)');
  });

  it('llms-full.txt: Bus und Bahn je Ort mit Namensnennung (CC BY 4.0), nur Ortsseiten, die das Gate bestehen (E-029)', async () => {
    const { getPlaceById, getPublishedPlaces, placeUrl } = await import('@/lib/places/registry');
    const text = await textAt(llmsFull, '2026-10-12T12:00:00Z');
    expect(text).toContain('Daten: © gtfs.de, CC BY 4.0, Datenbasis DELFI e.V. und OpenStreetMap-Mitwirkende (https://creativecommons.org/licenses/by/4.0/deed.de)');
    expect(text).toContain(`- Aßlar (35614): 8 km, 12 Minuten, ${placeUrl(getPlaceById('asslar')!)}, Bus und Bahn: los 6:25, an 7:16`);
    expect(text).toContain(`${placeUrl(getPlaceById('greifenstein')!)}, Bus und Bahn: keine Ankunft bis 7:30`);
    expect(text).not.toMatch(/\u00A0/);
    // Nach dem Fahrplanjahr der Daten (I5) steht keine Ortsseite mehr darin, Hub und Kreis-Hubs bleiben
    const spaeter = await textAt(llmsFull, '2026-12-20T12:00:00Z');
    for (const place of getPublishedPlaces()) expect(spaeter).not.toContain(`${placeUrl(place)},`);
    expect(spaeter).toContain('/einsatzgebiet/lahn-dill-kreis');
  });
});

describe('Themenseiten in llms.txt und llms-full.txt (E-028)', () => {
  it('llms.txt: genau eine Zeile zum Themen-Hub mit allen Themen', async () => {
    const { getThemen } = await import('@/lib/themen/registry');
    const text = await textAt(llms, '2026-10-12T12:00:00Z');
    const zeilen = text.split('\n').filter((line) => line.includes('/arbeiten-bei-uns'));
    expect(zeilen).toHaveLength(1);
    for (const thema of getThemen()) expect(zeilen[0]).toContain(thema.name);
  });

  it('llms-full.txt: Abschnitt „Arbeiten bei uns“ mit je einer Zeile und URL pro Thema, ohne feste Arbeitszeit', async () => {
    const { getThemen, themaUrl } = await import('@/lib/themen/registry');
    const text = await textAt(llmsFull, '2026-10-12T12:00:00Z');
    const abschnitt = text.slice(text.indexOf('## 6. Arbeiten bei uns'), text.indexOf('## 7. Daten und Feeds'));
    expect(abschnitt.length).toBeGreaterThan(100);
    for (const thema of getThemen()) {
      const zeile = abschnitt.split('\n').find((line) => line.startsWith(`- ${thema.name}`));
      expect(zeile, thema.name).toBeDefined();
      expect(zeile).toContain(themaUrl(thema));
    }
    expect(abschnitt).not.toMatch(/13:30|16:45|pünktlich| /);
  });
});
