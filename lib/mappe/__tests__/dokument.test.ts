import { describe, expect, it } from 'vitest';
import type { Mappe } from '@/lib/applications/schema';
import { mappeDokument } from '@/lib/mappe/blatt/dokument';
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
      beruf: [{ zeit: '2019–2024', titel: 'Geselle', ort: 'Muster GmbH, Gießen', aufgaben: ['Heizungsbau'] }],
      ausbildung: [{ zeit: '2016–2019', titel: 'Ausbildung SHK', ort: 'Berufsschule Wetzlar' }],
      schwerpunkte: ['Wärmepumpen', 'Löten'],
    });
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
