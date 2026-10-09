import { COMPANY } from '@/lib/content/company';
import { EMPLOYER, HQ_LOCATION } from '@/lib/jobs/employer';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Global JSON-LD graph (every page): Organization, WebSite and LocalBusiness only.
 * JobPosting lives on /jobs/[slug], FAQPage on /. `ORGANIZATION_ID` is the node that
 * JobPosting.hiringOrganization references.
 */
export const ORGANIZATION_ID = EMPLOYER.orgId;
export const LOCAL_BUSINESS_ID = `${SITE_CONFIG.consumerUrl}/#localbusiness`;

const careerBase = SITE_CONFIG.baseUrl.replace(/\/+$/, '');
export const WEBSITE_ID = `${careerBase}/#website`;

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: COMPANY.address.street,
  postalCode: COMPANY.address.postalCode,
  addressLocality: COMPANY.address.city,
  addressRegion: COMPANY.address.region,
  addressCountry: COMPANY.address.country,
} as const;

const geo = {
  '@type': 'GeoCoordinates',
  latitude: COMPANY.geo.latitude,
  longitude: COMPANY.geo.longitude,
} as const;

export function buildSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: COMPANY.name,
        legalName: COMPANY.legalName,
        url: COMPANY.website,
        logo: EMPLOYER.logoUrl,
        sameAs: [COMPANY.website],
        foundingDate: String(COMPANY.foundingYear),
        address: postalAddress,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: COMPANY.phone.e164,
          email: COMPANY.email,
          contactType: 'recruiting',
          areaServed: 'DE',
          availableLanguage: ['German'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: careerBase,
        name: `${COMPANY.name} Karriere`,
        description: `Offizielles Karriereportal der ${COMPANY.name} in ${COMPANY.address.city}.`,
        inLanguage: 'de-DE',
        publisher: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'LocalBusiness',
        '@id': LOCAL_BUSINESS_ID,
        name: COMPANY.name,
        legalName: COMPANY.legalName,
        alternateName: [...SITE_CONFIG.alternateNames],
        parentOrganization: { '@id': ORGANIZATION_ID },
        description: `Innungs-Meisterbetrieb seit ${COMPANY.foundingYear} für Heiztechnik, Wärmepumpen, moderne Bäder und Haustechnik im Lahn-Dill-Kreis.`,
        url: COMPANY.website,
        telephone: COMPANY.phone.e164,
        email: COMPANY.email,
        logo: EMPLOYER.logoUrl,
        image: EMPLOYER.logoUrl,
        hasMap: SITE_CONFIG.contact.googleMapsUrl,
        address: postalAddress,
        geo,
        foundingDate: String(COMPANY.foundingYear),
        areaServed: {
          '@type': 'GeoCircle',
          geoMidpoint: geo,
          geoRadius: HQ_LOCATION.radiusKm * 1000,
        },
        openingHoursSpecification: COMPANY.openingHours.spec.map((spec) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [...spec.days],
          opens: spec.opens,
          closes: spec.closes,
        })),
      },
    ],
  };
}
