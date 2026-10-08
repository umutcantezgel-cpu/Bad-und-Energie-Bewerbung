import { HQ_LOCATION } from '../employer';
import { defineJob } from '../schema';

// Quellen (Stand 393df01): JobPosting SHK-WP-2026-01 (app/layout.tsx), Stellenkarte 01 (app/page.tsx),
// ROLE_CONFIGS.anlagenmechaniker (components/pricing/pricing.constants.ts).
export const anlagenmechanikerShk = defineJob({
  id: 'anlagenmechaniker-shk',
  referenceCode: 'SHK-WP-2026-01',
  slug: 'anlagenmechaniker-shk-wetzlar',
  status: 'published',
  category: 'anlagenmechaniker',
  title: 'Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d)',
  titleShy: 'Anlagen\u00ADmechaniker SHK für Wärme\u00ADpumpen & Heizungs\u00ADtechnik (m/w/d)',
  shortTitle: 'Anlagenmechaniker SHK',
  seo: {
    metaTitle: 'Anlagenmechaniker SHK (m/w/d) Job Wetzlar – Wärmepumpe',
    metaDescription:
      'Anlagenmechaniker SHK in Wetzlar: Wärmepumpen & Bäder im 35-km-Umkreis, 3.600–4.600 €, 30 Tage Urlaub, freitags ab 13:30 frei. In 60 Sek. bewerben.',
    h1: 'Anlagenmechaniker SHK (m/w/d) in Wetzlar',
    primaryKeyword: 'Anlagenmechaniker SHK Wetzlar',
    secondaryKeywords: [
      'Anlagenmechaniker Job Wetzlar',
      'Heizungsbauer Jobs Wetzlar',
      'SHK Jobs Wetzlar',
      'Anlagenmechaniker Wärmepumpe',
      'Anlagenmechaniker Gießen',
    ],
  },
  summary: 'Du montierst Wärmepumpen und moderne Bäder in Wetzlar und Umgebung, ganz ohne Fernmontage.',
  intro:
    'Als Anlagenmechaniker SHK montierst und modernisierst du Wärmepumpensysteme von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann sowie hochwertige Bäder. Deine Baustellen liegen in Wetzlar, Gießen und dem Lahn-Dill-Kreis, maximal 35 km vom Firmensitz entfernt.',
  tasks: [
    'Montage, Inbetriebnahme und hydraulischer Abgleich von Wärmepumpen',
    'Heizungsmodernisierung im Neubau und im Bestand',
    'Montage hochwertiger Bäder, von der Vorwandinstallation bis zur Armatur',
  ],
  requirements: [
    'Abgeschlossene Ausbildung im SHK-Handwerk',
    'Mindestens ein Jahr Berufserfahrung als Geselle',
    'Freude an sauberer Arbeit und respektvollem Umgang mit Kunden',
    'Noch wenig Erfahrung mit Wärmepumpen? Das vertiefen wir gezielt mit dir.',
  ],
  benefitFactIds: [
    'aboveTariff',
    'vacation30',
    'friday1330',
    'noFarAssembly',
    'ipadSmartphone',
    'paidCertifications',
    'workwear',
    'permanentContract',
  ],
  packageExtras: [
    { label: 'Fahrzeug', text: 'Fester Transporter mit Sortimo-Regalsystem, Mitnahme nach Hause möglich' },
    { label: 'Werkzeug', text: 'Persönliche Hilti-22-V-Akku-Flotte und Pressbacken für Viega und Geberit' },
    { label: 'Vergütung', text: 'Facharbeitervergütung deutlich über Handwerkstarif' },
  ],
  employment: { kind: 'vollzeit', permanent: true, start: 'nach-absprache' },
  salary: { min: 3600, max: 4600, unit: 'MONTH', currency: 'EUR' },
  location: HQ_LOCATION,
  education: { credentialCategory: 'professional certificate', label: 'Abgeschlossene Ausbildung im SHK-Handwerk' },
  experienceMonths: 12,
  datePosted: '2026-03-01',
  validThrough: '2027-10-06T00:00:00',
  updatedAt: '2026-10-08',
  apply: { questionSet: 'fachkraft' },
  channels: { googleJobs: true, indeedFeed: true, genericFeed: true, ba: true },
  teamQuoteId: 'koch',
});
