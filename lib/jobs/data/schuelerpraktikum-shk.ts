import { HQ_LOCATION } from '../employer';
import { defineJob } from '../schema';

// Inhaber 2026-10-14 (fakten-abgleich S4): Schülerpraktikum, Dauer nach Absprache mit der Schule, kein Wort zu Geld
// (`pay: 'keine-angabe'`, das Schema sperrt jedes Wort dazu). Offen sind Mindestalter und Ansprechperson (M-027):
// bis dahin ohne Abschnitt „Das bringst du mit“. Fragenset wie die Ausbildung (Schule).
export const schuelerpraktikumShk = defineJob({
  id: 'schuelerpraktikum-shk',
  referenceCode: 'SHK-PR-2026-07',
  slug: 'schuelerpraktikum-shk-wetzlar',
  status: 'published',
  category: 'praktikum',
  title: 'Schülerpraktikum Anlagenmechaniker SHK (m/w/d)',
  titleShy: 'Schüler­praktikum Anlagen­mechaniker SHK (m/w/d)',
  shortTitle: 'Schülerpraktikum SHK',
  seo: {
    metaTitle: 'Schülerpraktikum SHK in Wetzlar (m/w/d): Heizung und Bad',
    metaDescription:
      'Schülerpraktikum im SHK-Handwerk in Wetzlar: Wärmepumpen, Heizungen und Bäder kennenlernen, Dauer nach Absprache mit deiner Schule.',
    h1: 'Schülerpraktikum im SHK-Handwerk (m/w/d) in Wetzlar',
    primaryKeyword: 'Schülerpraktikum Wetzlar',
    secondaryKeywords: ['Praktikum Anlagenmechaniker Wetzlar', 'Schülerpraktikum Handwerk Wetzlar', 'Praktikum SHK Gießen'],
  },
  alsoKnownAs: ['Praktikum Anlagenmechaniker', 'Schnupperpraktikum'],
  summary: 'Im Schülerpraktikum lernst du das SHK-Handwerk kennen: Wärmepumpen, Heizungen und moderne Bäder in Wetzlar und Umgebung.',
  intro:
    'In deinem Schülerpraktikum lernst du den Beruf Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik kennen. Wie lange es dauert, stimmen wir mit dir und deiner Schule ab.',
  tasks: ['Einblick in die Arbeit an Wärmepumpen, Heizungen und Bädern', 'Kennenlernen der Ausbildung zum Anlagenmechaniker SHK'],
  requirements: [],
  requirementsOpen: 'M-027',
  benefitFactIds: ['founded1926', 'noFarAssembly', 'flexibleHours'],
  employment: { kind: 'praktikum', permanent: false, start: 'nach-absprache', durationNote: 'nach Absprache mit deiner Schule' },
  pay: 'keine-angabe',
  location: HQ_LOCATION,
  experienceMonths: 0,
  datePosted: '2026-10-14',
  validThrough: '2027-01-12T00:00:00',
  updatedAt: '2026-10-14',
  apply: { questionSet: 'ausbildung' },
  channels: { googleJobs: true, indeedFeed: true, genericFeed: true, ba: true },
  // Praktikanten zählen mit der Tätigkeit, die sie überwiegend ausüben (Schlüsselverzeichnis der BA): Helfer in der
  // Installation, KldB 34201, ISCO-08 9313 (lib/jobs/berufe.ts).
  beruf: { kldb: '34201', isco: '9313' },
});
