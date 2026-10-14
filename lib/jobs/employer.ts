import { COMPANY } from '@/lib/content/company';
import { PROFILE } from '@/lib/content/profile';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import type { JobLocation } from './schema';

const baseUrl = SITE_CONFIG.baseUrl.replace(/\/+$/, '');

/**
 * Wer der Betrieb im Netz ist (Plan §C4): die Website für Kunden und jedes geprüfte Profil aus lib/content/profile.ts,
 * ohne Dopplungen. Dieselbe Liste tragen Organization (components/site/site-jsonld.ts) und JobPosting.hiringOrganization.
 */
export const SAME_AS: readonly string[] = Object.freeze([...new Set([SITE_CONFIG.consumerUrl, ...PROFILE.map((profil) => profil.url)])]);

/** Arbeitgeber für JobPosting und Feeds. `orgId` entspricht dem globalen Organization-Knoten. */
export const EMPLOYER = Object.freeze({
  name: COMPANY.legalName,
  legalName: COMPANY.legalName,
  sameAs: SAME_AS,
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

/** Büro am Firmensitz: dieselbe Adresse, ohne Baustellen im Umkreis (Bürofachkraft). */
export const HQ_OFFICE: JobLocation = Object.freeze({
  street: COMPANY.address.street,
  postalCode: COMPANY.address.postalCode,
  city: COMPANY.address.city,
  region: COMPANY.address.region,
  country: 'DE',
});
