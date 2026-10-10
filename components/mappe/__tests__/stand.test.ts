import { describe, expect, it } from 'vitest';
import { createEmptyEditorState, isMappeEmpty, type MappeEditorState } from '@/lib/mappe/editor';
import { WORK_STYLE_IDS } from '@/lib/mappe/options';
import { emptyCareerStation, emptyEducationStation } from '@/lib/mappe/stations';
import { standAnsage } from '../MappeTool';
import { erstesFeld, MAPPE_ABSCHNITTE, mappeStand, standText } from '../stand';

function mit(patch: Partial<MappeEditorState>): MappeEditorState {
  return { ...createEmptyEditorState(), ...patch };
}

const erledigtIds = (state: MappeEditorState) =>
  mappeStand(state)
    .abschnitte.filter((abschnitt) => abschnitt.erledigt)
    .map((abschnitt) => abschnitt.id);

describe('mappeStand (E-BEW-006): „erledigt“ nur aus echten Eingaben', () => {
  it('leere Mappe: 0 von 5, alles offen, als Nächstes Persönliches', () => {
    const stand = mappeStand(createEmptyEditorState());
    expect(stand.erledigt).toBe(0);
    expect(stand.gesamt).toBe(5);
    expect(stand.abschnitte.map((abschnitt) => abschnitt.erledigt)).toEqual([false, false, false, false, false]);
    expect(stand.naechster?.id).toBe('mappe-persoenliches');
    expect(standText(stand.erledigt, stand.gesamt)).toBe('0 von 5 erledigt');
  });

  it('fünf Abschnitte in der Reihenfolge des Editors, mit Nummer', () => {
    const stand = mappeStand(createEmptyEditorState());
    expect(stand.abschnitte.map((abschnitt) => [abschnitt.nummer, abschnitt.id])).toEqual(
      MAPPE_ABSCHNITTE.map((abschnitt, index) => [index + 1, abschnitt.id]),
    );
  });

  it('Persönliches = Name eingetragen (Leerzeichen zählen nicht; Telefon allein auch nicht)', () => {
    expect(erledigtIds(mit({ person: { name: '   ', phone: '0151', email: '', location: '' } }))).toEqual([]);
    expect(erledigtIds(mit({ person: { name: 'Erika Muster', phone: '', email: '', location: '' } }))).toEqual(['mappe-persoenliches']);
  });

  it('Stelle = Stelle oder Initiativbewerbung gewählt', () => {
    expect(erledigtIds(mit({ jobId: 'initiativ' }))).toEqual(['mappe-stelle']);
  });

  it('Schwerpunkte = mindestens einer', () => {
    expect(erledigtIds(mit({ skills: ['Badsanierung und Vorwandinstallation'] }))).toEqual(['mappe-schwerpunkte']);
  });

  it('Anschreiben = Arbeitsstil oder eigener Text; die Vorlage und leerer Text zählen nicht', () => {
    expect(erledigtIds(mit({ customLetter: null }))).toEqual([]);
    expect(erledigtIds(mit({ customLetter: '  \n ' }))).toEqual([]);
    expect(erledigtIds(mit({ customLetter: 'Mein eigener Text' }))).toEqual(['mappe-anschreiben']);
    expect(erledigtIds(mit({ workStyleId: WORK_STYLE_IDS[0] }))).toEqual(['mappe-anschreiben']);
  });

  it('Berufserfahrung und Ausbildung = mindestens eine nicht leere Station; leere Karten zählen nicht', () => {
    expect(erledigtIds(mit({ careerStations: [emptyCareerStation()], educationStations: [emptyEducationStation()] }))).toEqual([]);
    expect(erledigtIds(mit({ careerStations: [{ ...emptyCareerStation(), role: 'Anlagenmechaniker' }] }))).toEqual(['mappe-lebenslauf']);
    expect(erledigtIds(mit({ educationStations: [{ ...emptyEducationStation(), degree: 'Gesellenprüfung' }] }))).toEqual(['mappe-lebenslauf']);
  });

  it('stimmt mit isMappeEmpty überein: eine leere Mappe hat außer Name und Stelle nichts erledigt', () => {
    const state = mit({ person: { name: 'Erika', phone: '', email: '', location: '' }, jobId: 'initiativ' });
    expect(isMappeEmpty(state)).toBe(true);
    expect(erledigtIds(state)).toEqual(['mappe-persoenliches', 'mappe-stelle']);
  });

  it('5 von 5 erst, wenn jeder Abschnitt gefüllt ist; dann gibt es kein „Als Nächstes“', () => {
    const voll = mit({
      person: { name: 'Erika Muster', phone: '', email: '', location: '' },
      jobId: 'initiativ',
      skills: ['Badsanierung und Vorwandinstallation'],
      customLetter: 'Text',
      careerStations: [{ ...emptyCareerStation(), role: 'Anlagenmechaniker' }],
    });
    const stand = mappeStand(voll);
    expect(stand.erledigt).toBe(5);
    expect(stand.naechster).toBeNull();
    expect(mappeStand({ ...voll, skills: [] }).erledigt).toBe(4);
    expect(mappeStand({ ...voll, skills: [] }).naechster?.id).toBe('mappe-schwerpunkte');
  });
});

describe('standAnsage: Haken ohne Neuladen, auch für Screenreader', () => {
  it('nennt den gewechselten Abschnitt und den neuen Stand', () => {
    const vorher = mappeStand(createEmptyEditorState());
    const jetzt = mappeStand(mit({ jobId: 'initiativ' }));
    expect(standAnsage(vorher, jetzt)).toBe('Stelle erledigt. 1 von 5 erledigt.');
    expect(standAnsage(jetzt, vorher)).toBe('Stelle wieder offen. 0 von 5 erledigt.');
    expect(standAnsage(jetzt, mappeStand(mit({ jobId: 'initiativ' })))).toBe('');
  });
});

describe('erstesFeld: der Sprung landet im ersten Feld, nicht in einer Bedienleiste', () => {
  /** Kleine Attrappe für querySelectorAll/closest (Vitest läuft ohne DOM). */
  function feld(name: string, inLeiste = false) {
    return { name, closest: (selector: string) => (inLeiste && selector === '[data-sprung-nein]' ? {} : null) } as unknown as HTMLElement;
  }
  function abschnitt(...felder: HTMLElement[]) {
    return { querySelectorAll: () => felder } as unknown as ParentNode;
  }

  it('überspringt Verschieben und Entfernen und nimmt das erste Eingabefeld', () => {
    const ziel = erstesFeld(abschnitt(feld('nach unten', true), feld('entfernen', true), feld('Tätigkeit')));
    expect((ziel as unknown as { name: string }).name).toBe('Tätigkeit');
  });

  it('gibt null zurück, wenn es kein Feld gibt', () => {
    expect(erstesFeld(abschnitt())).toBeNull();
    expect(erstesFeld(abschnitt(feld('nur Leiste', true)))).toBeNull();
  });
});
