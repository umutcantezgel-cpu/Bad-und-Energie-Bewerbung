import { SITE_CONFIG } from './site-config';
import {
  BASE_URL,
  ORG_ID,
  FOUNDER_ID,
  WEBSITE_ID,
  LOCAL_BUSINESS_ID,
  PLACE_DE_ID,
  LOGO_URL,
  HQ_ADDRESS,
  HQ_GEO,
  getOrganizationNode,
  getFounderNode,
  getWebSiteNode,
  getLocalBusinessNode,
  getCountryNode,
  getReviewsSchema,
} from './schema';
import { getLocalDominancePyramidSchema } from './schemaPyramid';

/**
 * ==============================================================================
 * CENTRAL SCHEMA & JSON-LD GENERATORS (ENTITY TRUST SHIELD)
 * ==============================================================================
 * Ensures parentOrganization and isPartOf link explicitly to the main domain
 * https://bad-energie.de with shared HQ address: Siegmund-Hiepe-Str. 20, 35578 Wetzlar.
 * ==============================================================================
 */

export {
  BASE_URL,
  ORG_ID,
  FOUNDER_ID,
  WEBSITE_ID,
  LOCAL_BUSINESS_ID,
  PLACE_DE_ID,
  LOGO_URL,
  HQ_ADDRESS,
  HQ_GEO,
  getOrganizationNode,
  getFounderNode,
  getWebSiteNode,
  getLocalBusinessNode,
  getCountryNode,
  getReviewsSchema,
  getLocalDominancePyramidSchema,
};

/**
 * Generate complete structured data graph for pages
 */
export function generateEntityGraph(additionalNodes: Record<string, unknown>[] = []) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      getOrganizationNode(),
      getFounderNode(),
      getWebSiteNode(),
      getLocalBusinessNode(),
      getCountryNode(),
      ...getJobPostingNodes(),
      ...additionalNodes,
    ],
  };
}

/**
 * Validated 2026 JobPosting nodes for Google for Jobs
 */
export function getJobPostingNodes() {
  return [
    {
      '@type': 'JobPosting',
      '@id': `${BASE_URL}/#job-anlagenmechaniker`,
      title: 'Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d)',
      description:
        'Montage, Inbetriebnahme und hydraulischer Abgleich modernster Wärmepumpensysteme von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann. Regionaler Einsatz im 35 km Umkreis von Wetzlar, persönliche Hilti-Flotte, Firmenfahrzeug und 30 Tage Urlaub.',
      identifier: {
        '@type': 'PropertyValue',
        name: 'Bad & Energie GmbH',
        value: 'SHK-WP-2026-01',
      },
      datePosted: '2026-03-01',
      validThrough: '2027-10-06T00:00:00',
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Bad & Energie GmbH',
        sameAs: [SITE_CONFIG.consumerUrl],
        logo: LOGO_URL,
      },
      jobLocation: {
        '@type': 'Place',
        address: HQ_ADDRESS,
      },
    },
    {
      '@type': 'JobPosting',
      '@id': `${BASE_URL}/#job-kundendienst`,
      title: 'Kundendiensttechniker SHK / Servicemonteur (m/w/d)',
      description:
        'Wartung, Inbetriebnahme und Diagnose modernster Wärmepumpensysteme (Buderus, Bosch, NIBE, Viessmann) und Instandhaltung von Liegenschaften des Lahn-Dill-Kreises. Voll ausgestattetes Servicefahrzeug, iPad und Smartphone auch zur privaten Nutzung.',
      identifier: {
        '@type': 'PropertyValue',
        name: 'Bad & Energie GmbH',
        value: 'SHK-KD-2026-02',
      },
      datePosted: '2026-03-01',
      validThrough: '2027-10-06T00:00:00',
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Bad & Energie GmbH',
        sameAs: [SITE_CONFIG.consumerUrl],
        logo: LOGO_URL,
      },
      jobLocation: {
        '@type': 'Place',
        address: HQ_ADDRESS,
      },
    },
    {
      '@type': 'JobPosting',
      '@id': `${BASE_URL}/#job-obermonteur`,
      title: 'Obermonteur / Projektleiter SHK & Badsanierung (m/w/d)',
      description:
        'Projektleitung anspruchsvoller Badsanierungen und Heizungsmodernisierungen im 35 km Radius. Eigenverantwortliche Baustellenabwicklung, kollegiale Führung, modernstes Werkzeug und übertarifliche Spitzenvergütung.',
      identifier: {
        '@type': 'PropertyValue',
        name: 'Bad & Energie GmbH',
        value: 'SHK-PL-2026-03',
      },
      datePosted: '2026-03-01',
      validThrough: '2027-10-06T00:00:00',
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Bad & Energie GmbH',
        sameAs: [SITE_CONFIG.consumerUrl],
        logo: LOGO_URL,
      },
      jobLocation: {
        '@type': 'Place',
        address: HQ_ADDRESS,
      },
    },
    {
      '@type': 'JobPosting',
      '@id': `${BASE_URL}/#job-azubi`,
      title: 'Auszubildender zum Anlagenmechaniker SHK 2026 (m/w/d)',
      description:
        'Starte Deine handwerkliche Zukunft mit 100 Jahren Ausbildungstradition bei Bad & Energie GmbH in Wetzlar ab August 2026. Eigenes Hilti Azubi-Werkzeugset, Fahrtkostenzuschuss und Meisterbegleitung durch Dipl.-Ing. Sabri Demir mit garantierter Übernahme.',
      identifier: {
        '@type': 'PropertyValue',
        name: 'Bad & Energie GmbH',
        value: 'SHK-AZ-2026-04',
      },
      datePosted: '2026-03-01',
      validThrough: '2027-10-06T00:00:00',
      employmentType: 'FULL_TIME',
      educationRequirements: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Hauptschulabschluss oder Realschulabschluss',
      },
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Bad & Energie GmbH',
        sameAs: [SITE_CONFIG.consumerUrl],
        logo: LOGO_URL,
      },
      jobLocation: {
        '@type': 'Place',
        address: HQ_ADDRESS,
      },
    },
  ];
}

