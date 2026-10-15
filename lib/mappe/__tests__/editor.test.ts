import { describe, expect, it } from 'vitest';
import { createEmptyEditorState, mappeEditorReducer } from '../editor';
import { BUERO_SKILL_OPTIONS, SKILL_OPTIONS, skillsFuerStelle } from '../options';

/**
 * Stellenwechsel in der Mappe (Prüfung E-031, D1-7): Vorgegebene Schwerpunkte der anderen Stellenart fallen weg, eigene
 * Einträge bleiben. Sonst stünden Baustellen-Kenntnisse im Büro-Anschreiben oder Büro-Aufgaben unter den
 * Fachschwerpunkten.
 */
describe('mappeEditorReducer: Wechsel der Stelle', () => {
  const mitSkills = (skills: string[]) => ({ ...createEmptyEditorState(), skills });

  it('SHK → Büro: Baustellen-Vorgaben fallen weg, eigene bleiben', () => {
    const neu = mappeEditorReducer(mitSkills([SKILL_OPTIONS[0], 'DATEV', SKILL_OPTIONS[5]]), {
      type: 'job',
      jobId: 'buerofachkraft',
      category: 'buero',
    });
    expect(neu.jobId).toBe('buerofachkraft');
    expect(neu.skills).toEqual(['DATEV']);
  });

  it('Büro → SHK oder ohne Stelle: Büro-Vorgaben fallen weg, eigene bleiben', () => {
    for (const category of ['anlagenmechaniker', null] as const) {
      const neu = mappeEditorReducer(mitSkills([BUERO_SKILL_OPTIONS[1], 'Eigener Schwerpunkt']), { type: 'job', jobId: '', category });
      expect(neu.skills, String(category)).toEqual(['Eigener Schwerpunkt']);
    }
  });

  it('passende Vorgaben bleiben, die Liste bleibt dieselbe, wenn nichts wegfällt', () => {
    const vorher = mitSkills([SKILL_OPTIONS[1], SKILL_OPTIONS[2]]);
    const neu = mappeEditorReducer(vorher, { type: 'job', jobId: 'kundendiensttechniker-shk', category: 'kundendienst' });
    expect(neu.skills).toBe(vorher.skills);
    expect(skillsFuerStelle([BUERO_SKILL_OPTIONS[0]], 'buero')).toEqual([BUERO_SKILL_OPTIONS[0]]);
  });
});
