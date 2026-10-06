import { SITE_CONFIG } from './site-config';

export const BASE_URL = SITE_CONFIG.baseUrl;
export const ORG_ID = `${SITE_CONFIG.consumerUrl}/#organization`;
export const FOUNDER_ID = `${BASE_URL}/#founder`;
export const WEBSITE_ID = `${BASE_URL}/#website`;
export const LOCAL_BUSINESS_ID = `${SITE_CONFIG.consumerUrl}/#localbusiness`;
export const PLACE_DE_ID = `${BASE_URL}/#place-deutschland`;
export const LOGO_URL = `${BASE_URL}/images/bad-energie-lahn-dill-logo-transparent.webp`;

export const HQ_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: SITE_CONFIG.headquarters.streetAddress,
  postalCode: SITE_CONFIG.headquarters.postalCode,
  addressLocality: SITE_CONFIG.headquarters.addressLocality,
  addressRegion: SITE_CONFIG.headquarters.addressRegion,
  addressCountry: SITE_CONFIG.headquarters.addressCountry,
} as const;

export const HQ_GEO = {
  '@type': 'GeoCoordinates',
  latitude: SITE_CONFIG.headquarters.geo.latitude,
  longitude: SITE_CONFIG.headquarters.geo.longitude,
} as const;

export function getCountryNode() {
  return {
    '@type': 'Country',
    '@id': PLACE_DE_ID,
    name: 'Deutschland',
    alternateName: 'Germany',
    sameAs: 'https://www.wikidata.org/wiki/Q183',
  };
}

export type ReviewItem = {
  authorName: string;
  rating: number;
  datePublished: string;
  reviewBody: string;
};

export function getReviewsSchema(reviews: ReviewItem[]) {
  if (!reviews || reviews.length === 0) return {};

  const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avg = (total / reviews.length).toFixed(1);

  return {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg,
      reviewCount: reviews.length.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
      author: {
        '@type': 'Person',
        name: r.authorName,
      },
      datePublished: r.datePublished,
      reviewBody: r.reviewBody,
    })),
  };
}

export function getOrganizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_CONFIG.companyName,
    legalName: SITE_CONFIG.legalName,
    url: SITE_CONFIG.consumerUrl,
    logo: LOGO_URL,
    sameAs: [SITE_CONFIG.consumerUrl],
    address: HQ_ADDRESS,
    geo: HQ_GEO,
    founder: {
      '@id': FOUNDER_ID,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.contact.telephoneLink,
      contactType: 'recruiting',
      areaServed: 'DE',
      availableLanguage: ['German'],
    },
  };
}

export function getFounderNode() {
  return {
    '@type': 'Person',
    '@id': FOUNDER_ID,
    name: SITE_CONFIG.founder.name,
    jobTitle: SITE_CONFIG.founder.jobTitle,
    worksFor: {
      '@id': ORG_ID,
    },
  };
}

export function getWebSiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: BASE_URL,
    name: `${SITE_CONFIG.companyName} Karriere`,
    description: `Offizielles Karriereportal der ${SITE_CONFIG.companyName} in Wetzlar.`,
    publisher: {
      '@id': ORG_ID,
    },
    isPartOf: {
      '@type': 'WebSite',
      url: SITE_CONFIG.consumerUrl,
      name: SITE_CONFIG.companyName,
    },
    inLanguage: 'de-DE',
  };
}

export function getLocalBusinessNode() {
  return {
    '@type': 'LocalBusiness',
    '@id': LOCAL_BUSINESS_ID,
    name: SITE_CONFIG.companyName,
    alternateName: SITE_CONFIG.alternateNames,
    legalName: SITE_CONFIG.legalName,
    parentOrganization: {
      '@id': ORG_ID,
    },
    description: SITE_CONFIG.description.de,
    telephone: SITE_CONFIG.contact.telephoneLink,
    email: SITE_CONFIG.contact.email,
    url: SITE_CONFIG.consumerUrl,
    logo: LOGO_URL,
    image: LOGO_URL,
    hasMap: SITE_CONFIG.contact.googleMapsUrl,
    address: HQ_ADDRESS,
    geo: HQ_GEO,
    foundingDate: SITE_CONFIG.foundingDate,
  };
}
