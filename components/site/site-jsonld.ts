import { COMPANY } from '@/lib/content/company';
import { REGION } from '@/lib/content/region';
import { EMPLOYER } from '@/lib/jobs/employer';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Global JSON-LD nodes (every page): Organization, Person (founder), WebSite and LocalBusiness only.
 * Each page puts them into its single @graph together with its own nodes (lib/seo/graph.ts):
 * WebPage everywhere, JobPosting on /jobs/[slug], FAQPage on /. `ORGANIZATION_ID` is the node that
 * JobPosting.hiringOrganization references.
 */
export const ORGANIZATION_ID = EMPLOYER.orgId;
export const LOCAL_BUSINESS_ID = `${SITE_CONFIG.consumerUrl}/#localbusiness`;
export const FOUNDER_ID = `${SITE_CONFIG.consumerUrl}/#founder`;

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

/**
 * Einsatzgebiet (E-SEO-009): die drei Kreise aus `SITE_CONFIG.serviceRegions` (dieselben wie
 * `REGION.areas` und /llms-full.txt) mit Radius, Namen und Orten. Der Mittelpunkt ist der
 * Firmensitz, wenn der Kreis die Postleitzahl des Sitzes trägt (Kernzone und 35-km-Kreis, Fakt
 * `radius35` misst vom Sitz), sonst der Ort der Ortstabelle mit dieser Postleitzahl (Gießen).
 */
function areaMidpoint(postalCode: string) {
  if (postalCode === COMPANY.address.postalCode) return geo;
  const place = REGION.locations.find((location) => location.postalCode === postalCode);
  return place ? { '@type': 'GeoCoordinates', latitude: place.latitude, longitude: place.longitude } : geo;
}

export function buildAreaServed() {
  return SITE_CONFIG.serviceRegions.map((area) => ({
    '@type': 'GeoCircle',
    name: area.name,
    geoMidpoint: areaMidpoint(area.postalCode),
    geoRadius: area.radiusKm * 1000,
    description: `Orte: ${area.cities.join(', ')}.`,
  }));
}

/**
 * The global nodes as a list, without @context: lib/seo/graph.ts puts them into each page's single
 * @graph (V6-B; the root layout renders no JSON-LD of its own).
 */
export function buildSiteNodes() {
  return [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: COMPANY.name,
      legalName: COMPANY.legalName,
      url: COMPANY.website,
      logo: EMPLOYER.logoUrl,
      sameAs: [COMPANY.website],
      foundingDate: String(COMPANY.foundingYear),
      // V6-B (statt E-SEO-006): der Gründer als eigener Personenknoten, hier nur die Referenz.
      founder: { '@id': FOUNDER_ID },
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
      // Titel nach lib/data/team.ts (A5 offen); dieselben Angaben wie bisher eingebettet, jetzt mit @id.
      '@type': 'Person',
      '@id': FOUNDER_ID,
      name: COMPANY.managingDirector.name,
      jobTitle: COMPANY.managingDirector.title,
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: careerBase,
      name: `${COMPANY.name} Karriere`,
      description: `Offizielles Karriereportal der ${COMPANY.name} in ${COMPANY.address.city}.`,
      inLanguage: 'de-DE',
      publisher: { '@id': ORGANIZATION_ID },
      // E-SEO-006: Die Karriereseite gehört zur Website für Kunden (eingebettet, ohne eigene @id).
      isPartOf: {
        '@type': 'WebSite',
        url: SITE_CONFIG.consumerUrl,
        name: COMPANY.legalName,
      },
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
      areaServed: buildAreaServed(),
      openingHoursSpecification: COMPANY.openingHours.spec.map((spec) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...spec.days],
        opens: spec.opens,
        closes: spec.closes,
      })),
    },
  ] as const;
}

export type SiteNode = ReturnType<typeof buildSiteNodes>[number];
