import { describe, expect, it } from 'vitest';
import { ISCO, ISCO_CODES, KLDB, KLDB_CODES, KLDB_ZU_ISCO, berufKategorie } from '../berufe';
import { ALL_JOBS } from '../registry';

/**
 * Amtliche Berufsschlüssel (Plan §C2): nachgeschlagen, nie geschätzt. Die Tabellen sind klein und fest; jede Stelle
 * nutzt einen Eintrag, und jeder Eintrag wird von einer Stelle genutzt (keine toten Codes).
 */

describe('Berufsschlüssel (lib/jobs/berufe.ts)', () => {
  it('KldB 2010 fünfstellig, ISCO-08 vierstellig, Namen nicht leer', () => {
    for (const code of KLDB_CODES) {
      expect(code).toMatch(/^\d{5}$/);
      expect(KLDB[code].trim(), code).not.toBe('');
    }
    for (const code of ISCO_CODES) {
      expect(code).toMatch(/^\d{4}$/);
      expect(ISCO[code].trim(), code).not.toBe('');
    }
  });

  it('Umsteigeschlüssel: jede Berufsgattung hat einen Eintrag, ISCO nur aus der Tabelle; 25132 ohne eindeutigen Code', () => {
    expect(Object.keys(KLDB_ZU_ISCO).sort()).toEqual([...KLDB_CODES].sort());
    for (const isco of Object.values(KLDB_ZU_ISCO)) if (isco !== null) expect(ISCO_CODES).toContain(isco);
    expect(KLDB_ZU_ISCO['25132']).toBeNull();
    expect(KLDB_ZU_ISCO['34212']).toBe('7126');
  });

  it('jede Stelle nutzt die Tabellen, und jeder Code wird genutzt', () => {
    const kldb = new Set(ALL_JOBS.map((job) => job.beruf.kldb));
    const isco = new Set(ALL_JOBS.flatMap((job) => (job.beruf.isco ? [job.beruf.isco] : [])));
    expect([...kldb].sort()).toEqual([...KLDB_CODES].sort());
    expect([...isco].sort()).toEqual([...ISCO_CODES].sort());
    for (const job of ALL_JOBS) expect(job.beruf.isco ?? null, job.id).toBe(KLDB_ZU_ISCO[job.beruf.kldb]);
  });

  it('Zuordnung der Stellen wie im Schlüsselverzeichnis der BA (Auszubildende mit Zielberuf)', () => {
    const beruf = Object.fromEntries(ALL_JOBS.map((job) => [job.id, job.beruf.kldb]));
    expect(beruf).toEqual({
      'anlagenmechaniker-shk': '34212',
      'kundendiensttechniker-shk': '25132',
      'obermonteur-projektleiter-shk': '34293',
      'ausbildung-anlagenmechaniker-shk': '34212',
      'ausbildung-anlagenmechaniker-shk-2027': '34212',
      'quereinsteiger-montagehelfer': '34201',
      buerofachkraft: '71402',
      'schuelerpraktikum-shk': '34201',
    });
  });

  it('berufKategorie: ISCO-08, wenn eindeutig, sonst die KldB-Berufsgattung', () => {
    expect(berufKategorie({ kldb: '34212', isco: '7126' })).toBe('ISCO-08 7126: Bauspengler und Sanitär- und Heizungsinstallateure');
    expect(berufKategorie({ kldb: '25132' })).toBe(
      'KldB 2010 25132: Technische Servicekräfte in Wartung und Instandhaltung – fachlich ausgerichtete Tätigkeiten',
    );
    expect(berufKategorie({ kldb: '71402', isco: '4120' })).toBe('ISCO-08 4120: Sekretariatskräfte (allgemein)');
  });
});
