import { COMPANY } from '@/lib/content/company';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import type { JobLocation } from './schema';

const baseUrl = SITE_CONFIG.baseUrl.replace(/\/+$/, '');

/** Arbeitgeber für JobPosting und Feeds. `orgId` entspricht dem globalen Organization-Knoten. */
export const EMPLOYER = Object.freeze({
  name: COMPANY.legalName,
  legalName: COMPANY.legalName,
  sameAs: SITE_CONFIG.consumerUrl,
  orgId: `${SITE_CONFIG.consumerUrl}/#organization`,
  logoUrl: `${baseUrl}/images/bad-energie-lahn-dill-logo.webp`,
  careerBaseUrl: baseUrl,
  phone: COMPANY.phone,
  email: COMPANY.email,
});

/** Firmensitz, von dem aus im Radius von 35 km gearbeitet wird. */
export const HQ_LOCATION: JobLocation = Object.freeze({
  street: COMPANY.address.street,
  postalCode: COMPANY.address.postalCode,
  city: COMPANY.address.city,
  region: COMPANY.address.region,
  country: 'DE',
  radiusKm: 35,
});
