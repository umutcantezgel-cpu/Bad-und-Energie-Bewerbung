import { describe, expect, it } from 'vitest';

import { MAPPE_SCHEMA_LIMITS as L } from '../constants';
import { parseMappeData } from '../mappe-data';
import { mappeSchema } from '../schema';

const career = (patch: object = {}) => ({ period: '2020', role: 'Geselle', company: 'Betrieb', tasks: ['Montage'], ...patch });
const education = (patch: object = {}) => ({ period: '2017', degree: 'Gesellenbrief', institution: 'Berufsschule', ...patch });
const x = (n: number) => 'x'.repeat(n);

/** Browser-Prüfung ohne zod und Server-Schema müssen gleich entscheiden und gleich normalisieren. */
const samples: unknown[] = [
  {},
  { coverLetter: '  Hallo  ', skills: [' Löten '], workStyle: ' ruhig ', careerStations: [career({ location: ' Wetzlar ' })] },
  { educationStations: [education(), education({ location: 'Gießen' })], unknown: 'fällt weg' },
  { careerStations: [{ period: 'p', role: 'r', company: 'c' }] },
  { coverLetter: x(L.coverLetter) },
  { coverLetter: x(L.coverLetter + 1) },
  { coverLetter: ` ${x(L.coverLetter)} ` },
  { skills: Array.from({ length: L.skills }, (_, i) => `s${i}`) },
  { skills: Array.from({ length: L.skills + 1 }, (_, i) => `s${i}`) },
  { skills: [x(L.skill + 1)] },
  { skills: 'kaputt' },
  { skills: [1] },
  { workStyle: x(L.workStyle + 1) },
  { workStyle: null },
  { careerStations: Array.from({ length: L.careerStations + 1 }, () => career()) },
  { careerStations: [career({ tasks: Array.from({ length: L.tasks + 1 }, () => 't') })] },
  { careerStations: [career({ tasks: [x(L.task + 1)] })] },
  { careerStations: [career({ role: x(L.role + 1) })] },
  { careerStations: [career({ location: null })] },
  { careerStations: [career({ company: undefined })] },
  { careerStations: ['station'] },
  { educationStations: Array.from({ length: L.educationStations + 1 }, () => education()) },
  { educationStations: [education({ institution: x(L.institution + 1) })] },
  { educationStations: [education({ degree: 3 })] },
  null,
  [],
  'mappe',
  // Gestaltung (L3): nur vollständig bekannte Werte; sonst fällt sie weg, die Mappe bleibt gültig
  { coverLetter: 'Hallo', design: { vorlage: 'farbband', akzent: 'petrol', schrift: 'markant' } },
  { coverLetter: 'Hallo', design: { vorlage: 'bunt', akzent: 'petrol', schrift: 'markant' } },
  { coverLetter: 'Hallo', design: { vorlage: 'schlicht', akzent: 'navy' } },
  { coverLetter: 'Hallo', design: 'farbband' },
  { coverLetter: 'Hallo', design: null },
  { coverLetter: 'Hallo', design: { vorlage: 'zweispaltig', akzent: 'graphit', schrift: 'sachlich', mehr: 1 } },
  // Sonderfälle (Prüfrunde L3): Typen, Großschreibung, Namen aus Object.prototype, geerbte Werte, Fotoform bleibt im Browser
  { coverLetter: 'Hallo', design: [] },
  { coverLetter: 'Hallo', design: true },
  { coverLetter: 'Hallo', design: 0 },
  { coverLetter: 'Hallo', design: { vorlage: 'Schlicht', akzent: 'navy', schrift: 'sachlich' } },
  { coverLetter: 'Hallo', design: { vorlage: 'toString', akzent: 'navy', schrift: 'sachlich' } },
  { coverLetter: 'Hallo', design: { vorlage: 'schlicht', akzent: 'constructor', schrift: 'sachlich' } },
  { coverLetter: 'Hallo', design: Object.create({ vorlage: 'farbband', akzent: 'petrol', schrift: 'markant' }) },
  { coverLetter: 'Hallo', design: { vorlage: 'farbband', akzent: ['petrol'], schrift: 'markant' } },
  { coverLetter: 'Hallo', design: { vorlage: 'farbband', akzent: 'petrol', schrift: 'markant', fotoform: 'rund' } },
  { coverLetter: x(L.coverLetter + 1), design: { vorlage: 'farbband', akzent: 'petrol', schrift: 'markant' } },
  // Betreff (L5): optional ohne Default, getrimmt, höchstens 160 Zeichen; sonst Fehler am Pfad `subject`
  { coverLetter: 'Hallo', subject: '  Bewerbung als X  ' },
  { coverLetter: 'Hallo', subject: x(L.subject) },
  { coverLetter: 'Hallo', subject: ` ${x(L.subject)} ` },
  { coverLetter: 'Hallo', subject: x(L.subject + 1) },
  { coverLetter: 'Hallo', subject: '' },
  { coverLetter: 'Hallo', subject: null },
  { coverLetter: 'Hallo', subject: 3 },
  { coverLetter: 'Hallo', subject: ['Bewerbung'] },
  { coverLetter: 'Hallo', design: { vorlage: 'farbband', akzent: 'petrol', schrift: 'markant' }, subject: 'Bewerbung als X' },
  // Erster Fehlerpfad: der Betreff steht im Schema hinten
  { coverLetter: x(L.coverLetter + 1), subject: x(L.subject + 1) },
  { workStyle: x(L.workStyle + 1), subject: 3 },
  { careerStations: [career({ role: x(L.role + 1) })], subject: null },
];

describe('parseMappeData mirrors mappeSchema', () => {
  it.each(samples.map((sample, index) => [index, sample]))('sample %i', (_index, sample) => {
    const schema = mappeSchema.safeParse(sample);
    const plain = parseMappeData(sample);
    expect(plain.ok).toBe(schema.success);
    if (plain.ok && schema.success) expect(plain.mappe).toEqual(schema.data);
    if (!plain.ok && !schema.success) expect(plain.path[0]).toBe(schema.error.issues[0]?.path[0]);
  });

  it('subject (L5): ohne Betreff kein Schlüssel `subject` (dieselbe Mappe wie vor L5), mit ihm hinten in Schema-Reihenfolge', () => {
    const ohne = parseMappeData({ coverLetter: 'Hallo', design: { vorlage: 'farbband', akzent: 'petrol', schrift: 'markant' } });
    expect(ohne.ok && Object.keys(ohne.mappe)).toEqual(['coverLetter', 'skills', 'careerStations', 'educationStations', 'design']);
    const mit = parseMappeData({ subject: ' Bewerbung als X ', coverLetter: 'Hallo', design: { vorlage: 'farbband', akzent: 'petrol', schrift: 'markant' } });
    expect(mit.ok && Object.keys(mit.mappe)).toEqual(['coverLetter', 'skills', 'careerStations', 'educationStations', 'design', 'subject']);
    expect(mit.ok && mit.mappe.subject).toBe('Bewerbung als X');
    const schema = mappeSchema.parse({ subject: ' Bewerbung als X ', coverLetter: 'Hallo' });
    expect(Object.keys(schema)).toEqual(['coverLetter', 'skills', 'careerStations', 'educationStations', 'subject']);
  });
});
