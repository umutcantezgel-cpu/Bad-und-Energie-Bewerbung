import { HQ_LOCATION } from '../employer';
import { defineJob } from '../schema';

// Quellen (Stand 393df01): JobPosting SHK-AZ-2026-04 (app/layout.tsx), Stellenkarte 04 (app/page.tsx),
// servicesData 'ausbildung' (lib/data/services.ts), ROLE_CONFIGS.azubi (pricing.constants.ts).
// Owner-Entscheidung: „Ausbildung 2026 – Einstieg noch möglich“, Start nach Absprache.
// Titel ohne Jahr (Google: keine Daten im JobPosting-Titel); „2026“ steht in metaTitle, h1 und Texten,
// deshalb endet die Ausschreibung spätestens am 31.12.2026 (fakten-abgleich.md B5).
export const ausbildungAnlagenmechanikerShk = defineJob({
  id: 'ausbildung-anlagenmechaniker-shk',
  referenceCode: 'SHK-AZ-2026-04',
  slug: 'ausbildung-anlagenmechaniker-shk-wetzlar',
  status: 'published',
  category: 'ausbildung',
  title: 'Ausbildung zum Anlagenmechaniker SHK (m/w/d)',
  titleShy: 'Ausbildung zum Anlagen\u00ADmechaniker SHK (m/w/d)',
  shortTitle: 'Ausbildung Anlagenmechaniker',
  seo: {
    metaTitle: 'Ausbildung Anlagenmechaniker SHK Wetzlar (m/w/d) 2026',
    metaDescription:
      'Ausbildung Anlagenmechaniker SHK in Wetzlar – Einstieg 2026 noch möglich: eigenes Hilti-Werkzeugset, 1.050–1.400 € im Monat, Fahrtkostenzuschuss.',
    h1: 'Ausbildung Anlagenmechaniker SHK – Einstieg 2026 noch möglich',
    primaryKeyword: 'Ausbildung Anlagenmechaniker SHK Wetzlar',
    secondaryKeywords: [
      'Ausbildung Wetzlar 2026',
      'Ausbildung SHK Wetzlar',
      'Ausbildungsplatz Anlagenmechaniker Gießen',
      'Azubi Anlagenmechaniker Lahn-Dill',
    ],
  },
  summary: 'Ausbildung 2026: Einstieg noch möglich. In 3,5 Jahren wirst du Anlagenmechaniker SHK, mit eigenem Hilti-Werkzeugset ab Tag 1.',
  // „Einstieg 2026“ steht schon in der h1; „von Anfang an mit“ im Vorteil `mentoring` und in Ablauf-Schritt 3.
  intro:
    'In 3,5 Jahren wirst du bei uns Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik, an Wärmepumpen und modernen Bädern.',
  tasks: [
    'Montage und Inbetriebnahme von Wärmepumpen und Heizungen',
    'Installation moderner Bäder und Sanitärtechnik',
    'Mitarbeit auf der Baustelle ab dem ersten Monat',
    'Berufsschule und Gesellenprüfung, begleitet von deinen Meistern',
  ],
  requirements: ['Schulabschluss', 'Handwerkliches Geschick und Interesse an Technik', 'Zuverlässigkeit und Teamgeist'],
  benefitFactIds: ['takeoverGuarantee', 'mentoring', 'founded1926', 'vacation30', 'friday1330', 'noFarAssembly'],
  packageExtras: [
    { label: 'Werkzeug', text: 'Eigenes Hilti-Azubi-Werkzeugset, geschenkt ab Tag 1' },
    { label: 'Mobilität', text: 'Fahrtkostenzuschuss zur Berufsschule und Zuschuss zum Pkw-Führerschein' },
    { label: 'Vergütung', text: 'Ausbildungsvergütung über Tarif, plus Prämien' },
  ],
  employment: { kind: 'ausbildung', permanent: false, start: 'nach-absprache', durationMonths: 42 },
  salary: { min: 1050, max: 1400, unit: 'MONTH', currency: 'EUR' },
  location: HQ_LOCATION,
  education: { credentialCategory: 'high school', label: 'Schulabschluss' },
  experienceMonths: 0,
  datePosted: '2026-03-01',
  validThrough: '2026-12-31T23:59:59+01:00',
  updatedAt: '2026-10-08',
  apply: { questionSet: 'ausbildung' },
  channels: { googleJobs: true, indeedFeed: true, genericFeed: true, ba: true },
  teamQuoteId: 'weber',
});
