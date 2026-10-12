/**
 * ==============================================================================
 * UNIVERSAL SITE & ENTITY CONFIGURATION
 * ==============================================================================
 * Single source of truth for structured data (JSON-LD), OpenGraph tags,
 * canonical URLs, and institutional entity data for Bad und Energie GmbH Lahn Dill.
 * ==============================================================================
 */

import { CONTACT_PHONE, WHATSAPP, WHATSAPP_NUMBER } from '@/lib/data/contact';

export const SITE_CONFIG = {
  baseUrl: process.env.APP_URL || 'https://karriere.bad-energie.de',
  consumerUrl: 'https://bad-energie.de',

  // Core Brand & Company Data
  companyName: 'Bad und Energie GmbH Lahn Dill',
  legalName: 'Bad und Energie GmbH Lahn Dill',
  alternateNames: ['Bad und Energie', 'Bad und Energie Wetzlar', 'Bad und Energie GmbH'],
  slogan: {
    de: '100 Jahre Meisterbetrieb (1926–2026) für SHK, Wärmepumpen und moderne Badarchitektur in Wetzlar',
  },
  description: {
    de: 'Offizielles Karriereportal der Bad und Energie GmbH Lahn Dill – 100 Jahre Meisterbetrieb (1926–2026). Offene Stellenangebote, übertarifliche Vergütung und erstklassige Arbeitsbedingungen für Anlagenmechaniker SHK, Heizungsbauer und Kundendienst in Wetzlar.',
  },

  // Founding & Business Attributes
  foundingDate: '1926',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Überweisung, Rechnung',
  vatID: 'DE301642296',
  handelsregister: 'HRB 2449 Amtsgericht Wetzlar',
  hwk: 'Handwerkskammer Wiesbaden',
  innung: 'Innung Sanitär-, Heizungs- und Klimatechnik Lahn-Dill',

  // Contact Channels
  contact: {
    email: 'info@bad-energie.de',
    telephone: CONTACT_PHONE.display,
    telephoneLink: CONTACT_PHONE.e164,
    telefax: '06441 48781',
    // WhatsApp läuft über das Mobiltelefon, nicht über das Büro (lib/data/contact.ts).
    whatsapp: WHATSAPP_NUMBER,
    whatsappDisplay: WHATSAPP.display,
    openingHours: {
      days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag'],
      opens: '07:00',
      closes: '16:45',
      fridayOpens: '07:00',
      fridayCloses: '13:30',
    },
    googleMapsUrl: 'https://maps.google.com/?q=Bad+und+Energie+GmbH+Lahn+Dill+Wetzlar',
  },

  // Echte physische Unternehmens-Adresse (HQ)
  headquarters: {
    streetAddress: 'Siegmund-Hiepe-Str. 20',
    postalCode: '35578',
    addressLocality: 'Wetzlar',
    addressRegion: 'Hessen',
    addressCountry: 'DE',
    // Wie lib/data/company.ts: OpenStreetMap, docs/operations/orte-messung.md@b0749f2
    geo: {
      latitude: 50.5525,
      longitude: 8.47465,
    },
  },

  // Inhaber & Geschäftsführer (Person-Entität im Knowledge Graph)
  founder: {
    name: 'Diplomingenieur Sabri Demir',
    givenName: 'Sabri',
    familyName: 'Demir',
    jobTitle: 'Geschäftsführer und Diplomingenieur',
    profileUrl: '/#team',
    knowsAbout: [
      'Wärmepumpentechnik',
      'Sanitärtechnik',
      'Heizungsmodernisierung',
      'Badarchitektur',
      'Klimatechnik',
      'Gebäudeenergieberatung',
    ],
  },

  // Wissens- und Leistungsspektrum der Organisation
  knowsAbout: [
    'Wärmepumpensysteme von Buderus und Bosch (14,8 km Werksnähe Lollar)',
    'NIBE Effizienzpartner mit 7 Jahren Herstellergarantie',
    'Alpha Innotec zertifizierter Inbetriebnahme-Partner',
    'Viessmann Fachbetrieb',
    'Fachbetrieb für den Lahn-Dill-Kreis (öffentliche Liegenschaften)',
    'Komplettbadsanierung und barrierefreie Bäder',
    'Gebäudeenergieberatung durch Dipl.-Ing. Sabri Demir',
    'Ausbildung zum Anlagenmechaniker SHK seit 1926',
  ],

  // Einsatzgebiet: ein Kreis von 35 km um den Firmensitz (Fakt radius35, fakten-abgleich B29). Bis 2026-10-12 standen
  // hier drei Kreise („Gießen und Umland“ 20 km, „Lahn Dill Kreis“ mit Dillenburg, 38 km Straße). Jeder Ort hat eine
  // Ortsseite unter /einsatzgebiet (lib/places, Test in components/site/__tests__/site-jsonld.test.ts).
  serviceRegions: [
    {
      name: 'Umkreis von 35 km um Wetzlar',
      postalCode: '35578',
      radiusKm: 35,
      cities: [
        'Wetzlar',
        'Gießen',
        'Herborn',
        'Weilburg',
        'Butzbach',
        'Aßlar',
        'Solms',
        'Braunfels',
        'Lahnau',
        'Hüttenberg',
        'Ehringshausen',
        'Schöffengrund',
        'Wettenberg',
        'Heuchelheim',
        'Linden',
        'Pohlheim',
        'Biebertal',
      ],
    },
  ],
};
