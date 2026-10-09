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
];

describe('parseMappeData mirrors mappeSchema', () => {
  it.each(samples.map((sample, index) => [index, sample]))('sample %i', (_index, sample) => {
    const schema = mappeSchema.safeParse(sample);
    const plain = parseMappeData(sample);
    expect(plain.ok).toBe(schema.success);
    if (plain.ok && schema.success) expect(plain.mappe).toEqual(schema.data);
    if (!plain.ok && !schema.success) expect(plain.path[0]).toBe(schema.error.issues[0]?.path[0]);
  });
});
