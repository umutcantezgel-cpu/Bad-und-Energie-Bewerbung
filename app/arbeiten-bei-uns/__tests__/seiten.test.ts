import type { Metadata } from 'next';
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ArbeitenBeiUnsPage, { generateMetadata as hubMetadata, revalidate as hubRevalidate } from '@/app/arbeiten-bei-uns/page';
import ThemaPage, {
  dynamicParams,
  generateMetadata as themaMetadata,
  generateStaticParams,
  revalidate as themaRevalidate,
} from '@/app/arbeiten-bei-uns/[thema]/page';
import {
  generateStaticParams as imageParams,
  revalidate as imageRevalidate,
} from '@/app/arbeiten-bei-uns/[thema]/opengraph-image';
import { JsonLd } from '@/components/seo/JsonLd';
import { WHATSAPP_GREETING } from '@/lib/apply/whatsapp-message';
import { jobPath } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import type { PageGraph } from '@/lib/seo/graph';
import { DEFAULT_OG_IMAGE } from '@/lib/seo/og-image';
import { ARBEITEN_PATH, THEMA_IDS, getThemen, themaPath } from '@/lib/themen/registry';
import { claimsInHtml } from '../../../scripts/qa/check-claims.mjs';

/**
 * Routen unter /arbeiten-bei-uns (E-028): statisch (fünf Segmente, sonst 404), stündlich neu, Metadaten aus dem
 * Textmodell mit Canonical auf sich selbst, ein Graph je Seite (Hub: CollectionPage mit ItemList; Thema: WebPage), der
 * sichtbare Pfad = BreadcrumbList, und im gerenderten HTML keine feste Arbeitszeit (B28).
 */

type Node = Record<string, unknown>;
const jobs = getActiveJobs().filter((job) => isJobLive(job, new Date()));
const params = (thema: string) => ({ params: Promise.resolve({ thema }) });

function graphOf(element: ReactNode): PageGraph {
  if (!isValidElement<{ children?: ReactNode }>(element)) throw new Error('kein Element');
  const graphs = Children.toArray(element.props.children)
    .filter((child): child is ReactElement<{ data: PageGraph }> => isValidElement(child) && child.type === JsonLd)
    .map((child) => child.props.data);
  expect(graphs).toHaveLength(1);
  return graphs[0];
}

const ofType = (graph: PageGraph, type: string) => (graph['@graph'] as unknown as Node[]).filter((node) => node['@type'] === type);

function visibleCrumbs(html: string): string[] {
  const nav = [...html.matchAll(/<nav aria-label="Brotkrümelnavigation"[^>]*>(.*?)<\/nav>/g)].map((m) => m[1]).find((inner) => inner.includes('<ol')) ?? '';
  return [...nav.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
}

const canonicalOf = (meta: Metadata) => meta.alternates?.canonical;

async function digestOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return String((error as { digest?: string }).digest ?? error);
  }
  throw new Error('kein Fehler');
}

describe('Routen unter /arbeiten-bei-uns', () => {
  it('fünf statische Themen, unbekannte Segmente 404; stündlich neu wie /jobs', async () => {
    expect(generateStaticParams()).toEqual(THEMA_IDS.map((thema) => ({ thema })));
    expect(imageParams()).toEqual(THEMA_IDS.map((thema) => ({ thema })));
    expect(dynamicParams).toBe(false);
    expect([hubRevalidate, themaRevalidate, imageRevalidate]).toEqual([3600, 3600, 3600]);
    expect(await digestOf(ThemaPage(params('arbeitszeit')))).toMatch(/^NEXT_HTTP_ERROR_FALLBACK;404/);
    expect(await themaMetadata(params('arbeitszeit'))).toEqual({});
  });

  it('Hub: Canonical, Standardbild, CollectionPage mit ItemList und BreadcrumbList, eine h1', () => {
    const meta = hubMetadata();
    expect(canonicalOf(meta)).toBe(getCleanCanonicalUrl(ARBEITEN_PATH));
    expect(meta.openGraph?.images).toEqual([{ ...DEFAULT_OG_IMAGE }]);
    const element = ArbeitenBeiUnsPage();
    const graph = graphOf(element);
    expect(ofType(graph, 'CollectionPage')).toHaveLength(1);
    expect(ofType(graph, 'ItemList')).toHaveLength(1);
    expect(ofType(graph, 'BreadcrumbList')).toHaveLength(1);
    expect(ofType(graph, 'JobPosting')).toHaveLength(0);
    expect(ofType(graph, 'FAQPage')).toHaveLength(0);
    const html = renderToStaticMarkup(element);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(visibleCrumbs(html)).toEqual(['Startseite', 'Arbeiten bei uns']);
    for (const thema of getThemen()) expect(html).toContain(`href="${themaPath(thema)}"`);
    for (const job of jobs) expect(html).toContain(`href="${jobPath(job)}"`);
    expect(claimsInHtml(html)).toEqual([]);
  });

  it.each(THEMA_IDS)('Thema %s: Canonical, eigenes Teilen-Bild, WebPage und BreadcrumbList, Links, WhatsApp-Gruß', async (id) => {
    const thema = getThemen().find((t) => t.id === id)!;
    const meta = await themaMetadata(params(id));
    expect(canonicalOf(meta)).toBe(getCleanCanonicalUrl(themaPath(thema)));
    const images = meta.openGraph?.images as { url: string }[];
    expect(images[0].url).toMatch(new RegExp(`^${themaPath(thema)}/opengraph-image\\?v=\\d{4}-\\d{2}-\\d{2}$`));

    const element = await ThemaPage(params(id));
    const graph = graphOf(element);
    expect(ofType(graph, 'WebPage')).toHaveLength(1);
    expect(ofType(graph, 'BreadcrumbList')).toHaveLength(1);
    for (const type of ['CollectionPage', 'ItemList', 'JobPosting', 'FAQPage', 'Place']) expect(ofType(graph, type), type).toHaveLength(0);

    const html = renderToStaticMarkup(element);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(visibleCrumbs(html)).toEqual(['Startseite', 'Arbeiten bei uns', thema.name]);
    // Weitere Themen: die übrigen vier und der Hub
    for (const other of getThemen().filter((t) => t.id !== id)) expect(html).toContain(`href="${themaPath(other)}"`);
    expect(html).toContain(`href="${ARBEITEN_PATH}"`);
    expect(html).toContain(`text=${encodeURIComponent(WHATSAPP_GREETING)}`);
    expect(claimsInHtml(html)).toEqual([]);
    if (id === 'gehalt') for (const job of jobs) expect(html).toContain(`href="${jobPath(job)}"`);
  });
});
