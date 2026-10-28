import { describe, expect, it } from 'vitest';
import type { Mappe } from '@/lib/applications/schema';
import { fuehrerscheinText, lebenslaufAbschnitte, mappeDokument, spracheText } from '@/lib/mappe/blatt/dokument';
import { getMappeRecipient } from '@/lib/mappe/context';

const MAPPE: Mappe = {
  coverLetter: '  Sehr geehrter Herr Demir,\n\nich bewerbe mich.  ',
  skills: ['Wärmepumpen', '  ', 'Löten'],
  workStyle: 'Ruhig und genau',
  careerStations: [
    { period: '2019–2024', role: 'Geselle', company: 'Muster GmbH', location: 'Gießen', tasks: ['Heizungsbau', ' '] },
    { period: ' ', role: '', company: '', location: '', tasks: [] },
  ],
  educationStations: [{ period: '2016–2019', degree: 'Ausbildung SHK', institution: 'Berufsschule Wetzlar', location: '' }],
};

const EINGABEN = {
  name: ' Max Müller ',
  betreff: 'Bewerbung als Anlagenmechaniker SHK (m/w/d)',
  stelle: 'Anlagenmechaniker SHK',
  datum: '27. Oktober 2026',
  empfaenger: getMappeRecipient(),
  mappe: MAPPE,
};

describe('mappeDokument: was auf den Blättern der PDF steht', () => {
  it('Anschreiben mit Empfänger aus den Stammdaten, Lebenslauf ohne leere Angaben', () => {
    const dokument = mappeDokument(EINGABEN)!;
    expect(dokument.titel).toBe('Bewerbung Max Müller – Anlagenmechaniker SHK');
    expect(dokument.name).toBe('Max Müller');
    expect(dokument.anschreiben).toEqual({
      empfaenger: ['Bad und Energie GmbH Lahn Dill', 'Herrn Sabri Demir', 'Siegmund-Hiepe-Str. 20', '35578 Wetzlar'],
      text: 'Sehr geehrter Herr Demir,\n\nich bewerbe mich.',
    });
    expect(dokument.lebenslauf).toEqual({
      abschnitte: [
        {
          id: 'career',
          titel: 'Berufserfahrung',
          art: 'beruf',
          stationen: [{ zeit: '2019–2024', titel: 'Geselle', ort: 'Muster GmbH, Gießen', aufgaben: ['Heizungsbau'] }],
        },
        {
          id: 'education',
          titel: 'Schule und Ausbildung',
          art: 'ausbildung',
          stationen: [{ zeit: '2016–2019', titel: 'Ausbildung SHK', ort: 'Berufsschule Wetzlar' }],
        },
        { id: 'skills', titel: 'Schwerpunkte', art: 'punkte', punkte: ['Wärmepumpen', 'Löten'] },
      ],
    });
  });

  it('Mehr im Lebenslauf (L5): Kurzprofil oben, die neuen Abschnitte hinter den Schwerpunkten, leere fehlen', () => {
    const mappe: Mappe = {
      ...MAPPE,
      profile: '  Zwei Sätze über mich.  ',
      languages: [{ language: 'Deutsch', level: 'Muttersprache' }, { language: 'Englisch' }],
      drivingLicenses: ['B', 'BE'],
      interests: ' ',
      customText: 'Ersthelfer seit 2024',
    };
    expect(lebenslaufAbschnitte(mappe).map((a) => [a.id, a.titel])).toEqual([
      ['profile', 'Kurzprofil'],
      ['career', 'Berufserfahrung'],
      ['education', 'Schule und Ausbildung'],
      ['skills', 'Schwerpunkte'],
      ['languages', 'Sprachen'],
      ['drivingLicenses', 'Führerschein'],
      ['custom', 'Weiteres'],
    ]);
    const nach = new Map(lebenslaufAbschnitte(mappe).map((a) => [a.id, a]));
    expect(nach.get('profile')).toMatchObject({ art: 'text', text: 'Zwei Sätze über mich.' });
    expect(nach.get('languages')).toMatchObject({ art: 'punkte', punkte: ['Deutsch (Muttersprache)', 'Englisch'] });
    expect(nach.get('drivingLicenses')).toMatchObject({ art: 'text', text: 'Klassen B und BE' });
    // Nur ein Kurzprofil ist auch ein Lebenslauf
    const nurProfil = { coverLetter: '', skills: [], careerStations: [], educationStations: [], profile: 'Kurz.' };
    expect(mappeDokument({ ...EINGABEN, mappe: nurProfil })!.lebenslauf!.abschnitte).toHaveLength(1);
  });

  it('Reihenfolge und Titel aus sections; nicht gelistete mit Inhalt hinten in Standardreihenfolge', () => {
    const mappe: Mappe = {
      ...MAPPE,
      customText: 'Ersthelfer',
      sections: [{ id: 'skills' }, { id: 'custom', title: 'Weiterbildungen' }, { id: 'career', title: 'Praxis' }],
    };
    expect(lebenslaufAbschnitte(mappe).map((a) => [a.id, a.titel])).toEqual([
      ['skills', 'Schwerpunkte'],
      ['custom', 'Weiterbildungen'],
      ['career', 'Praxis'],
      ['education', 'Schule und Ausbildung'],
    ]);
  });

  it('spracheText und fuehrerscheinText', () => {
    expect(spracheText({ language: ' Türkisch ', level: ' gut ' })).toBe('Türkisch (gut)');
    expect(spracheText({ language: 'Polnisch', level: ' ' })).toBe('Polnisch');
    expect(fuehrerscheinText([])).toBe('');
    expect(fuehrerscheinText(['B'])).toBe('Klasse B');
    expect(fuehrerscheinText(['B', 'BE'])).toBe('Klassen B und BE');
    expect(fuehrerscheinText(['AM', 'B', 'C1E'])).toBe('Klassen AM, B und C1E');
  });

  it('ohne Brieftext kein Anschreiben, ohne Einträge kein Lebenslauf, ohne beides kein Dokument', () => {
    expect(mappeDokument({ ...EINGABEN, mappe: { ...MAPPE, coverLetter: ' ' } })!.anschreiben).toBeNull();
    const nurBrief = { ...MAPPE, skills: [], careerStations: [], educationStations: [] };
    expect(mappeDokument({ ...EINGABEN, mappe: nurBrief })!.lebenslauf).toBeNull();
    expect(mappeDokument({ ...EINGABEN, mappe: { ...nurBrief, coverLetter: '' } })).toBeNull();
  });

  it('nachgereicht (ohne Namen und Stelle): „Bewerbungsmappe …“ als Titel, kein Name', () => {
    const dokument = mappeDokument({ ...EINGABEN, name: undefined, stelle: undefined, betreff: 'Bewerbungsmappe zur Bewerbung BE-26-K7M4QX' })!;
    expect(dokument.name).toBeNull();
    expect(dokument.titel).toBe('Bewerbungsmappe zur Bewerbung BE-26-K7M4QX');
  });
});
