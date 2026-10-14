import { HQ_LOCATION } from '../employer';
import { defineJob } from '../schema';

// Inhaber 2026-10-14 (fakten-abgleich S2): Ausbildung 2027, Start nach Absprache, Vergütung „über Tarif, plus Prämien“
// wie 2026 (Paketzeile Vergütung). Nachfolgerin der Ausbildung 2026 (`nachfolger` dort). Titel ohne Jahr (Google: keine
// Daten im JobPosting-Titel); „2027“ steht in metaTitle, h1 und Texten. Die Übernahmegarantie (A1) bleibt bis zur
// Bestätigung auf die Stelle 2026 beschränkt und steht hier nicht.
export const ausbildungAnlagenmechanikerShk2027 = defineJob({
  id: 'ausbildung-anlagenmechaniker-shk-2027',
  referenceCode: 'SHK-AZ-2027-06',
  slug: 'ausbildung-anlagenmechaniker-shk-2027-wetzlar',
  status: 'published',
  category: 'ausbildung',
  title: 'Ausbildung zum Anlagenmechaniker SHK (m/w/d)',
  titleShy: 'Ausbildung zum Anlagen­mechaniker SHK (m/w/d)',
  shortTitle: 'Ausbildung Anlagenmechaniker 2027',
  seo: {
    metaTitle: 'Ausbildung Anlagenmechaniker SHK Wetzlar (m/w/d) 2027',
    metaDescription:
      'Ausbildung Anlagenmechaniker SHK in Wetzlar, Start 2027 nach Absprache: eigenes Hilti-Werkzeugset, Vergütung über Tarif plus Prämien.',
    h1: 'Ausbildung Anlagenmechaniker SHK – Start 2027 nach Absprache',
    primaryKeyword: 'Ausbildung Anlagenmechaniker SHK Wetzlar 2027',
    secondaryKeywords: [
      'Ausbildung Wetzlar 2027',
      'Ausbildungsplatz 2027 SHK',
      'Ausbildung Heizungsbauer 2027',
      'Azubi Anlagenmechaniker Lahn-Dill',
    ],
  },
  alsoKnownAs: ['Ausbildung Heizungsbauer', 'Ausbildung Installateur', 'Ausbildung Sanitärinstallateur'],
  summary: 'Ausbildung 2027: Start nach Absprache. In 3,5 Jahren wirst du Anlagenmechaniker SHK, mit eigenem Hilti-Werkzeugset ab Tag 1.',
  intro:
    'In 3,5 Jahren wirst du bei uns Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik, an Wärmepumpen und modernen Bädern.',
  tasks: [
    'Montage und Inbetriebnahme von Wärmepumpen und Heizungen',
    'Installation moderner Bäder und Sanitärtechnik',
    'Mitarbeit auf der Baustelle ab dem ersten Monat',
    'Berufsschule und Gesellenprüfung, begleitet von deinen Meistern',
  ],
  requirements: ['Schulabschluss', 'Handwerkliches Geschick und Interesse an Technik', 'Zuverlässigkeit und Teamgeist'],
  benefitFactIds: ['mentoring', 'founded1926', 'vacation30', 'flexibleHours', 'noFarAssembly'],
  packageExtras: [
    { label: 'Werkzeug', text: 'Eigenes Hilti-Azubi-Werkzeugset, geschenkt ab Tag 1' },
    { label: 'Mobilität', text: 'Fahrtkostenzuschuss zur Berufsschule und Zuschuss zum Pkw-Führerschein' },
    { label: 'Vergütung', text: 'Ausbildungsvergütung über Tarif, plus Prämien' },
  ],
  employment: { kind: 'ausbildung', permanent: false, start: 'nach-absprache', durationMonths: 42 },
  pay: 'auf-anfrage',
  location: HQ_LOCATION,
  education: { credentialCategory: 'high school', label: 'Schulabschluss' },
  experienceMonths: 0,
  datePosted: '2026-10-14',
  validThrough: '2027-01-12T00:00:00',
  updatedAt: '2026-10-14',
  apply: { questionSet: 'ausbildung' },
  channels: { googleJobs: true, indeedFeed: true, genericFeed: true, ba: true },
  // Auszubildende zählen mit ihrem Zielberuf (Schlüsselverzeichnis der BA): KldB 34212, ISCO-08 7126.
  beruf: { kldb: '34212', isco: '7126' },
  teamQuoteId: 'weber',
});
