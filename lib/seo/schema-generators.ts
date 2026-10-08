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
 * Generate complete structured data graph for pages.
 * JobPosting nodes come only from lib/jobs/jsonld.ts on the job pages (ROADMAP §10).
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
      ...additionalNodes,
    ],
  };
}
