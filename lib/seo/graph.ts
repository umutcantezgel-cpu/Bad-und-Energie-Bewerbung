import type { Metadata } from 'next';
import type { buildFaqPageJsonLd } from '@/components/home/content';
import { ORGANIZATION_ID, WEBSITE_ID, buildSiteNodes, type SiteNode } from '@/components/site/site-jsonld';
import type { BreadcrumbJsonLd, JobPostingJsonLd } from '@/lib/jobs/jsonld';
import { documentTitle } from './metadata';

/**
 * Ein JSON-LD-Graph je Route (V6-B): genau ein `<script type="application/ld+json">` mit `@graph`, den jede
 * Seite mit einem einzigen Aufruf von `buildPageGraph` rendert (das Root-Layout rendert keins). Darin stehen
 * die globalen Knoten (components/site/site-jsonld.ts) und der WebPage-Knoten der Seite; dazu, nur auf
 * indexierbaren Seiten, BreadcrumbList, JobPosting und FAQPage. Canonical, Titel, Beschreibung und robots
 * kommen aus den Metadaten der Seite selbst, nie von Hand: `url` ist exakt der Canonical-Tag, `name` der
 * Title-Tag. Geprüft in lib/seo/__tests__/graph.test.ts und im Build (scripts/qa/check-graph.mjs).
 */

export interface IdReference {
  '@id': string;
}

export type FaqPageJsonLd = ReturnType<typeof buildFaqPageJsonLd>;

/** Ein Knoten im @graph trägt kein eigenes @context, das steht einmal an der Wurzel. */
type InGraph<T> = Omit<T, '@context'>;

export interface WebPageNode {
  '@type': 'WebPage';
  '@id': string;
  url: string;
  name?: string;
  description?: string;
  isPartOf: IdReference;
  about: IdReference;
  inLanguage: 'de-DE';
  /** Nur, wenn der Graph die BreadcrumbList des sichtbaren Pfads enthält. */
  breadcrumb?: IdReference;
}

export type BreadcrumbNode = InGraph<BreadcrumbJsonLd>;
export type JobPostingNode = InGraph<JobPostingJsonLd> & { mainEntityOfPage: IdReference };
export type FaqPageNode = InGraph<FaqPageJsonLd> & { isPartOf: IdReference };
export type GraphNode = SiteNode | WebPageNode | BreadcrumbNode | JobPostingNode | FaqPageNode;

export interface PageGraph {
  '@context': 'https://schema.org';
  '@graph': GraphNode[];
}

export interface PageGraphInput {
  /** Die Metadaten, die die Seite an Next gibt (generatePageMetadata): Canonical, Titel, Beschreibung, robots. */
  metadata: Metadata;
  /** BreadcrumbList des sichtbaren Pfads (nur /jobs und Stellenseiten haben einen). */
  breadcrumb?: BreadcrumbJsonLd;
  /** JobPosting der offenen Stelle; null, wenn die Stelle keins trägt (buildJobPostingJsonLd). */
  jobPosting?: JobPostingJsonLd | null;
  /** FAQPage der Startseite (buildFaqPageJsonLd). */
  faq?: FaqPageJsonLd;
}

/**
 * Fragment-@id an einer URL in URL-Normalform: „https://…/jobs#webpage“, für die Startseite (Canonical ohne
 * Schrägstrich) „https://…/#webpage“ wie `/#website` und `/#faq`.
 */
export function fragmentId(url: string, fragment: string): string {
  return new URL(`#${fragment}`, url).href;
}

/** Canonical wie gerendert; generatePageMetadata setzt ihn immer als absolute Zeichenkette. */
function canonicalOf(metadata: Metadata): string | undefined {
  const canonical = metadata.alternates?.canonical;
  return typeof canonical === 'string' ? canonical : undefined;
}

/** Ohne eigene Angabe gilt das „index“ des Root-Layouts. */
function isIndexable(robots: Metadata['robots']): boolean {
  if (!robots) return true;
  if (typeof robots === 'string') return !/\bnoindex\b/i.test(robots);
  return robots.index !== false;
}

function inGraph<T extends { '@context': string }>({ '@context': _context, ...node }: T): InGraph<T> {
  return node;
}

/**
 * Der Graph einer Seite. Ohne Canonical (404) nur die globalen Knoten. Auf noindex-Seiten nur WebPage: nichts,
 * was ein Rich Result auslöst (BreadcrumbList, JobPosting, FAQPage), auch wenn es übergeben wird.
 */
export function buildPageGraph({ metadata, breadcrumb, jobPosting, faq }: PageGraphInput): PageGraph {
  const graph: GraphNode[] = [...buildSiteNodes()];
  const url = canonicalOf(metadata);
  if (url) {
    const rich = isIndexable(metadata.robots);
    const crumbs = rich && breadcrumb ? inGraph(breadcrumb) : undefined;
    const name = documentTitle(metadata.title);
    const description = metadata.description;
    const page: WebPageNode = {
      '@type': 'WebPage',
      '@id': fragmentId(url, 'webpage'),
      url,
      ...(name ? { name } : {}),
      ...(description ? { description } : {}),
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORGANIZATION_ID },
      inLanguage: 'de-DE',
      ...(crumbs ? { breadcrumb: { '@id': crumbs['@id'] } } : {}),
    };
    const pageRef: IdReference = { '@id': page['@id'] };
    graph.push(page);
    if (crumbs) graph.push(crumbs);
    if (rich && jobPosting) graph.push({ ...inGraph(jobPosting), mainEntityOfPage: pageRef });
    if (rich && faq) graph.push({ ...inGraph(faq), isPartOf: pageRef });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
