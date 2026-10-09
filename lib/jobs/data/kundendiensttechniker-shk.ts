import { HQ_LOCATION } from '../employer';
import { defineJob } from '../schema';

// Quellen (Stand 393df01): JobPosting SHK-KD-2026-02 (app/layout.tsx), Stellenkarte 02 (app/page.tsx),
// servicesData 'kundendienst' (lib/data/services.ts), ROLE_CONFIGS.kundendienst (pricing.constants.ts).
export const kundendiensttechnikerShk = defineJob({
  id: 'kundendiensttechniker-shk',
  referenceCode: 'SHK-KD-2026-02',
  slug: 'kundendiensttechniker-waermepumpe-wetzlar',
  status: 'published',
  category: 'kundendienst',
  title: 'Kundendiensttechniker SHK / Servicemonteur (m/w/d)',
  titleShy: 'Kunden\u00ADdienst\u00ADtechniker SHK / Service\u00ADmonteur (m/w/d)',
  shortTitle: 'Kundendiensttechniker',
  seo: {
    metaTitle: 'Kundendiensttechniker Heizung & Wärmepumpe – Wetzlar/Gießen',
    metaDescription:
      'Kundendiensttechniker SHK (m/w/d) in Wetzlar: Wärmepumpen-Service, 3.800–4.900 €, eigenes Servicefahrzeug, kein Wochenend-Notdienst. In 60 Sek. bewerben.',
    h1: 'Kundendiensttechniker SHK / Servicemonteur (m/w/d)',
    primaryKeyword: 'Kundendiensttechniker Wetzlar',
    secondaryKeywords: [
      'Kundendiensttechniker Wärmepumpe',
      'Servicemonteur Heizung Wetzlar',
      'Kundendienstmonteur SHK Gießen',
      'Servicetechniker Wärmepumpe',
    ],
  },
  summary: 'Du wartest Wärmepumpen und nimmst sie in Betrieb, mit eigenem Servicefahrzeug, iPad und Smartphone.',
  intro:
    'Als Kundendiensttechniker übernimmst du Wartung, Inbetriebnahme und Diagnose moderner Wärmepumpensysteme von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann. Außerdem betreust du öffentliche Liegenschaften des Lahn-Dill-Kreises. Deine Touren sind fair geplant, einen Wochenend-Notdienst gibt es nicht.',
  tasks: [
    'Inbetriebnahme, Wartung und hydraulischer Abgleich von Wärmepumpen',
    'Störungsdiagnose und Anlagenoptimierung',
    'Betreuung und Instandhaltung öffentlicher Liegenschaften im Lahn-Dill-Kreis',
    'Digitale Auftragsabwicklung per iPad, ohne Zettelwirtschaft',
  ],
  requirements: [
    'Abgeschlossene Ausbildung im SHK-Handwerk',
    'Mindestens zwei Jahre Berufserfahrung',
    'Spaß an Fehlersuche und moderner Heizungstechnik',
    'Freundlicher, respektvoller Umgang mit Kunden',
  ],
  benefitFactIds: [
    'aboveTariff',
    'vacation30',
    'friday1330',
    'noWeekendOnCall',
    'ipadSmartphone',
    'paidCertifications',
    'radius35',
    'permanentContract',
  ],
  packageExtras: [
    { label: 'Fahrzeug', text: 'Persönliches Servicefahrzeug mit Tankkarte und Privatnutzung ab Wohnort' },
    // Marken stehen schon im Intro und im Vorteil paidCertifications, das iPad in Aufgaben und Vorteilen.
    { label: 'Werkzeug', text: 'Digitale Messtechnik, Hilti-Koffer' },
    { label: 'Vergütung', text: 'Höchste Facharbeiter-Einstufung mit Qualitätsprämien' },
  ],
  employment: { kind: 'vollzeit', permanent: true, start: 'nach-absprache' },
  salary: { min: 3800, max: 4900, unit: 'MONTH', currency: 'EUR' },
  location: HQ_LOCATION,
  education: { credentialCategory: 'professional certificate', label: 'Abgeschlossene Ausbildung im SHK-Handwerk' },
  experienceMonths: 24,
  datePosted: '2026-03-01',
  validThrough: '2027-10-06T00:00:00',
  updatedAt: '2026-10-08',
  apply: { questionSet: 'fachkraft' },
  channels: { googleJobs: true, indeedFeed: true, genericFeed: true, ba: true },
  teamQuoteId: 'becker',
});
