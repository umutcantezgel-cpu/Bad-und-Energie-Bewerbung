import { describe, expect, it } from 'vitest';
import { zeichenFunde } from '../blatt/zeichen';
import { getMappeJobOptions, getMappeRecipient } from '../context';
import {
  betreffAlsVorschlag,
  createEmptyEditorState,
  describeIssue,
  fromMappe,
  letterSubject,
  mappeEditorReducer,
  mitStelle,
  resolveSubject,
  serializeMappe,
  templateLetter,
  toMappe,
  zeichenOrte,
} from '../editor';
import { BUERO_SKILL_OPTIONS, SKILL_OPTIONS, skillsFuerStelle } from '../options';
import { buildSubject } from '../template';

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
    // L5: nach dem Wiederherstellen folgt ein Betreff gleich dem Vorschlag wieder der Stelle
    expect(tool).toMatch(/const restored = betreffAlsVorschlag\(restoreState\(jobs, sent\), jobs\);/);
  });
});

describe('Betreff (L5): eigener Text oder Vorschlag der Stelle', () => {
  const jobs = getMappeJobOptions();
  const context = { jobs, recipient: getMappeRecipient() };
  const shk = jobs.find((job) => job.id === 'anlagenmechaniker-shk')!;
  const buero = jobs.find((job) => job.category === 'buero')!;
  const vorschlag = (job: (typeof jobs)[number]) => buildSubject({ title: job.title, category: job.category });

  it('subject setzt den eigenen Betreff, resetSubject nimmt wieder den Vorschlag', () => {
    const eigen = mappeEditorReducer(createEmptyEditorState(shk.id), { type: 'subject', text: 'Mein Betreff' });
    expect(eigen.customSubject).toBe('Mein Betreff');
    expect(resolveSubject(eigen, jobs)).toBe('Mein Betreff');
    // Auch ein geleertes Feld ist eigen (das Feld bleibt leer); in der Mappe steht dann der Vorschlag
    const leer = mappeEditorReducer(eigen, { type: 'subject', text: '' });
    expect(leer.customSubject).toBe('');
    expect(resolveSubject(leer, jobs)).toBe(vorschlag(shk));
    const zurueck = mappeEditorReducer(eigen, { type: 'resetSubject' });
    expect(zurueck.customSubject).toBeNull();
    expect(resolveSubject(zurueck, jobs)).toBe(vorschlag(shk));
  });

  it('ein eigener Betreff nur aus Emojis zählt nicht: Vorschau und Mappe nehmen den Vorschlag (im PDF bliebe die Zeile leer)', () => {
    const emojis = { ...createEmptyEditorState(shk.id), customSubject: '🔥🔥' };
    expect(resolveSubject(emojis, jobs)).toBe(vorschlag(shk));
    expect(toMappe(emojis, context)?.subject).toBe(vorschlag(shk));
    const mitText = { ...emojis, customSubject: 'Bewerbung 🔥' };
    expect(resolveSubject(mitText, jobs)).toBe('Bewerbung 🔥');
  });

  it('Stellenwechsel: ein eigener Betreff bleibt stehen, der Vorschlag folgt der Stelle', () => {
    const wechsel = { type: 'job', jobId: buero.id, category: buero.category } as const;
    const ohne = mappeEditorReducer(createEmptyEditorState(shk.id), wechsel);
    expect(letterSubject(ohne, jobs)).toBe(vorschlag(buero));
    expect(resolveSubject(ohne, jobs)).toBe(vorschlag(buero));
    const eigen = mappeEditorReducer({ ...createEmptyEditorState(shk.id), customSubject: 'Mein Betreff' }, wechsel);
    expect(eigen.customSubject).toBe('Mein Betreff');
    expect(resolveSubject(eigen, jobs)).toBe('Mein Betreff');
  });

  it('betreffAlsVorschlag: ein Betreff gleich dem Vorschlag (etwa aus der Übergabe) folgt wieder der Stelle, ein eigener bleibt', () => {
    const state = createEmptyEditorState(shk.id);
    expect(betreffAlsVorschlag({ ...state, customSubject: vorschlag(shk) }, jobs).customSubject).toBeNull();
    expect(betreffAlsVorschlag({ ...state, customSubject: ` ${vorschlag(shk)} ` }, jobs).customSubject).toBeNull();
    const eigen = { ...state, customSubject: 'Mein Betreff' };
    expect(betreffAlsVorschlag(eigen, jobs)).toBe(eigen);
    expect(betreffAlsVorschlag(state, jobs)).toBe(state);
    // Über die Übergabe an den Flow zurück: Der gesendete Vorschlag wird wieder einer
    const uebergeben = fromMappe(toMappe(state, context), shk.id);
    expect(uebergeben.customSubject).toBe(vorschlag(shk));
    expect(betreffAlsVorschlag(uebergeben, jobs).customSubject).toBeNull();
  });

  it('describeIssue nennt den Betreff; ein zu langer Betreff wird nicht gesendet', () => {
    expect(describeIssue(['subject'])).toBe('Der Betreff ist zu lang oder hat zu viele Einträge. Bitte kürze die Angabe.');
    expect(describeIssue(['coverLetter'])).toBe('Das Anschreiben ist zu lang oder hat zu viele Einträge. Bitte kürze die Angabe.');
    const result = serializeMappe({ ...createEmptyEditorState(shk.id), customSubject: 'x'.repeat(161) }, context);
    expect(result).toEqual({ ok: false, message: 'Der Betreff ist zu lang oder hat zu viele Einträge. Bitte kürze die Angabe.' });
  });
});

describe('Zeichen-Hinweis (L5): Orte im Editor', () => {
  const jobs = getMappeJobOptions();
  const context = { jobs, recipient: getMappeRecipient() };

  it('Name und Kontaktangaben nur im PDF zum Herunterladen; Schwerpunkte, Betreff, Anschreiben und Lebenslauf in beiden', () => {
    const orte = zeichenOrte({ ...createEmptyEditorState('anlagenmechaniker-shk'), skills: ['Löten'] }, context);
    expect(orte.map(({ ort, nurDownload }) => [ort, nurDownload])).toEqual([
      ['Name', true],
      ['Telefon', true],
      ['E-Mail', true],
      ['Wohnort', true],
      ['Schwerpunkte', false],
      ['Betreff', false],
      ['Anschreiben', false],
      ['Berufserfahrung', false],
      ['Schule und Ausbildung', false],
    ]);
  });

  it('findet je Ort, was im PDF fehlt; der Name steht auch im Anschreiben der Vorlage', () => {
    const state = {
      ...createEmptyEditorState('anlagenmechaniker-shk'),
      person: { name: 'Ян Müller', phone: '0171 2345678', email: 'jan@example.de', location: '35576 Wetzlar 🏠' },
      customSubject: 'Bewerbung → Wärmepumpen',
      careerStations: [{ id: 'c1', period: '2020', role: 'Monteur 👷', company: 'Betrieb', location: '', tasks: '' }],
    };
    const funde = zeichenFunde(zeichenOrte(state, context));
    expect(funde).toEqual([
      { ort: 'Name', nurDownload: true, fallenWeg: [], fehlen: ['Я', 'н'] },
      { ort: 'Wohnort', nurDownload: true, fallenWeg: ['🏠'], fehlen: [] },
      { ort: 'Betreff', nurDownload: false, fallenWeg: [], fehlen: ['→'] },
      { ort: 'Anschreiben', nurDownload: false, fallenWeg: [], fehlen: ['Я', 'н'] },
      { ort: 'Berufserfahrung', nurDownload: false, fallenWeg: ['👷'], fehlen: [] },
    ]);
    expect(zeichenFunde(zeichenOrte(createEmptyEditorState('anlagenmechaniker-shk'), context))).toEqual([]);
  });
});
