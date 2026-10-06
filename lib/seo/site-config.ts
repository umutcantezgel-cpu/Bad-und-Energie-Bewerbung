/**
 * ==============================================================================
 * UNIVERSAL SITE & ENTITY CONFIGURATION
 * ==============================================================================
 * Single source of truth for structured data (JSON-LD), OpenGraph tags,
 * canonical URLs, and institutional entity data for Bad und Energie GmbH Lahn Dill.
 * ==============================================================================
 */

export const SITE_CONFIG = {
  baseUrl: process.env.APP_URL || 'https://karriere.bad-energie.de',
  consumerUrl: 'https://bad-energie.de',

  // Core Brand & Company Data
  companyName: 'Bad und Energie GmbH Lahn Dill',
  legalName: 'Bad und Energie GmbH Lahn Dill',
  alternateNames: ['Bad und Energie', 'Bad und Energie Wetzlar', 'Bad und Energie GmbH'],
  slogan: {
    de: 'Meisterbetrieb seit 1926 für SHK, Wärmepumpen und moderne Badarchitektur in Wetzlar',
  },
  description: {
    de: 'Offizielles Karriereportal der Bad und Energie GmbH Lahn Dill seit 1926. Offene Stellenangebote, übertarifliche Vergütung und erstklassige Arbeitsbedingungen für Anlagenmechaniker SHK, Heizungsbauer und Kundendienst in Wetzlar.',
  },

  // Founding & Business Attributes
  foundingDate: '1926',
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Überweisung, Rechnung',
  vatID: 'DE301642296',
  handelsregister: 'HRB 8459 Amtsgericht Wetzlar',
  hwk: 'Handwerkskammer Wiesbaden',
  innung: 'Innung Sanitär Heizung und Klimatechnik Lahn Dill',

  // Contact Channels
  contact: {
    email: 'info@bad-energie.de',
    telephone: '06441 42956',
    telephoneLink: '+49644142956',
    telefax: '06441 48781',
    whatsapp: '+49644142956',
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
    streetAddress: 'Siegmund Hiepe Str. 20',
    postalCode: '35578',
    addressLocality: 'Wetzlar',
    addressRegion: 'Hessen',
    addressCountry: 'DE',
    geo: {
      latitude: 50.56499,
      longitude: 8.49842,
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
    'Wärmepumpen von Bosch und Brötje',
    'Komplettbadsanierung',
    'Kundendienst Haustechnik',
    'Gas Brennwertmodernisierung',
    'Fußbodenheizung',
    'Rohrleitungsbau',
    'Handwerkerausbildung',
  ],

  // Regionale Einsatzgebiete (max. 35 km Radius, keine Fernmontagen)
  serviceRegions: [
    {
      name: 'Wetzlar Kernstadt und Stadtteile',
      postalCode: '35578',
      radiusKm: 15,
      cities: ['Wetzlar', 'Hermannstein', 'Nauborn', 'Garbenheim', 'Steindorf', 'Dutenhofen', 'Münchholzhausen'],
    },
    {
      name: 'Gießen und Umland',
      postalCode: '35390',
      radiusKm: 20,
      cities: ['Gießen', 'Wettenberg', 'Heuchelheim', 'Linden', 'Pohlheim', 'Biebertal'],
    },
    {
      name: 'Lahn Dill Kreis',
      postalCode: '35578',
      radiusKm: 35,
      cities: ['Aßlar', 'Solms', 'Braunfels', 'Ehringshausen', 'Hüttenberg', 'Lahnau', 'Herborn', 'Dillenburg', 'Schöffengrund'],
    },
  ],
};
