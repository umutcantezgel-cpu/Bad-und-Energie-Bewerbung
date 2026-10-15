import { describe, expect, it } from 'vitest';
import { getMappeJobOptions, getMappeRecipient } from '../context';
import { createEmptyEditorState, mappeEditorReducer, mitStelle, templateLetter } from '../editor';
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

describe('Wiederherstellen mit Stelle (Prüfung E-031, Prüfrunde 2 D2-2)', () => {
  it('Entwurf ohne Stelle mit Baustellen-Vorgaben, dann ?stelle=buerofachkraft-wetzlar: der Brief nennt keine Baustellen-Vorgabe', () => {
    const jobs = getMappeJobOptions();
    const buero = jobs.find((job) => job.slug === 'buerofachkraft-wetzlar')!;
    expect(buero.category).toBe('buero');
    const entwurf = { ...createEmptyEditorState(), skills: [...SKILL_OPTIONS.slice(0, 3), 'Eigener Schwerpunkt'] };
    // So stellt components/mappe/MappeTool.tsx (restoreState) die Stelle aus ?stelle= oder der gesendeten Bewerbung her
    const wieder = mitStelle(entwurf, buero.id, buero.category);
    expect(wieder.jobId).toBe(buero.id);
    expect(wieder.skills).toEqual(['Eigener Schwerpunkt']);
    const brief = templateLetter(wieder, { jobs, recipient: getMappeRecipient() });
    for (const vorgabe of SKILL_OPTIONS) expect(brief, vorgabe).not.toContain(vorgabe);
    expect(brief).toContain('Eigener Schwerpunkt');
  });

  it('die Insel stellt die Stelle über mitStelle her, mit der Kategorie der Stelle', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const tool = readFileSync(path.resolve(__dirname, '../../../components/mappe/MappeTool.tsx'), 'utf8');
    expect(tool).toMatch(/return mitStelle\(state, jobId, jobs\.find\(\(job\) => job\.id === jobId\)\?\.category \?\? null\);/);
  });
});
