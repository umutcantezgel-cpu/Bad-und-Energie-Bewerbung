import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToReadableStream, renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import EinsatzgebietPage, { generateMetadata as gebietMetadata, revalidate as gebietRevalidate } from '@/app/einsatzgebiet/page';
import EinsatzgebietSlugPage, {
  dynamicParams,
  generateMetadata as slugMetadata,
  generateStaticParams,
  revalidate as slugRevalidate,
} from '@/app/einsatzgebiet/[slug]/page';
import { generateStaticParams as imageParams } from '@/app/einsatzgebiet/[slug]/opengraph-image';
import { GebietSeite } from '@/components/einsatzgebiet/GebietSeite';
import { KreisSeite } from '@/components/einsatzgebiet/KreisSeite';
import { OrtSeite } from '@/components/einsatzgebiet/OrtSeite';
import { JsonLd } from '@/components/seo/JsonLd';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import {
  EINSATZGEBIET_PATH,
  getAllPlaces,
  getEinsatzgebietPageSlugs,
  getHubKreise,
  getKreise,
  getPlaceBySlug,
  getPublishedPlaces,
  kreisPath,
  placePath,
  type Place,
} from '@/lib/places/registry';
import {
  EINSATZGEBIET_LINK_LABEL,
  getEinsatzgebietPageText,
  getKreisPageText,
  getPlacePageText,
  type PlacePageText,
} from '@/lib/places/text';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import type { PageGraph } from '@/lib/seo/graph';
import { DEFAULT_OG_IMAGE } from '@/lib/seo/og-image';

/**
 * Routen unter /einsatzgebiet (E-028): Metadaten aus dem Textmodell, Canonical auf sich selbst, sichtbarer Pfad =
 * BreadcrumbList, Weiterleitungen per 308, 404 für Unbekanntes, und jede Ortsseite zeigt ihre Ortsblöcke und Links.
 */

type Node = Record<string, unknown>;
const ROOT = path.resolve(__dirname, '../../..');
const jobs = getActiveJobs().filter((job) => isJobLive(job, new Date()));
const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

/** Der eine Graph unter den direkten Kindern des Seitenelements. */
function graphOf(element: ReactNode): PageGraph {
  if (!isValidElement<{ children?: ReactNode }>(element)) throw new Error('kein Element');
  const graphs = Children.toArray(element.props.children)
    .filter((child): child is ReactElement<{ data: PageGraph }> => isValidElement(child) && child.type === JsonLd)
    .map((child) => child.props.data);
  expect(graphs).toHaveLength(1);
  return graphs[0];
}

const ofType = (graph: PageGraph, type: string) => (graph['@graph'] as unknown as Node[]).filter((node) => node['@type'] === type);

/** Text der Stufen im ersten Pfad (Brotkrümelnavigation). */
function visibleCrumbs(html: string): string[] {
  // Der ganze Pfad (mit <ol>); am Handy steht davor nur der Weg eine Stufe zurück (components/seitenkopf/Pfad.tsx)
  const nav = [...html.matchAll(/<nav aria-label="Brotkrümelnavigation"[^>]*>(.*?)<\/nav>/g)].map((m) => m[1]).find((inner) => inner.includes('<ol')) ?? '';
  return [...nav.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
}

/** Sichtbarer Text ohne Tags, Entities aufgelöst, Leerraum normalisiert (geschützte Leerzeichen als Leerzeichen). */
function plain(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[\s ]+/g, ' ')
    .trim();
}

const norm = (text: string) => text.replace(/[\s ]+/g, ' ').trim();

function canonical(meta: Metadata): string {
  return String(meta.alternates?.canonical);
}

/** Erwarteter Fehler von permanentRedirect bzw. notFound (Next legt Ziel und Status in den digest). */
async function digestOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return String((error as { digest?: string }).digest ?? error);
  }
  throw new Error('kein Abbruch');
}

describe('Routen und Segmentkonfiguration', () => {
  it('statisch, stündlich neu, nur bekannte Segmente', () => {
    expect(dynamicParams).toBe(false);
    expect(slugRevalidate).toBe(3600);
    expect(gebietRevalidate).toBe(3600);
  });

  it('generateStaticParams: jede Seite und jede Weiterleitung, jeder Slug einmal', () => {
    const slugs = generateStaticParams().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of getEinsatzgebietPageSlugs()) expect(slugs).toContain(slug);
    for (const kreis of getKreise()) expect(slugs).toContain(kreis.slug);
    for (const slug of getAllPlaces().flatMap((place) => place.redirectFrom)) expect(slugs).toContain(slug);
    // 55 Orte, 4 Kreis-Hubs, 2 Kreise ohne Hub (308)
    expect(slugs).toHaveLength(getPublishedPlaces().length + getKreise().length);
  });

  it('Teilen-Bilder nur für veröffentlichte Orte', () => {
    expect(imageParams().map((p) => p.slug)).toEqual(getPublishedPlaces().map((place) => place.slug));
  });

  it('Kreis ohne Hub: 308 auf seinen Abschnitt der Gebietsseite', async () => {
    for (const kreis of getKreise().filter((k) => !k.hasHub)) {
      const digest = await digestOf(EinsatzgebietSlugPage(params(kreis.slug)));
      expect(digest).toBe(`NEXT_REDIRECT;replace;${EINSATZGEBIET_PATH}#${kreis.slug};308;`);
      expect(await slugMetadata(params(kreis.slug))).toEqual({});
    }
  });

  it('unbekanntes Segment: 404', async () => {
    expect(await digestOf(EinsatzgebietSlugPage(params('gibt-es-nicht')))).toMatch(/^NEXT_HTTP_ERROR_FALLBACK;404/);
    expect(await slugMetadata(params('gibt-es-nicht'))).toEqual({});
  });

  it('jede Datei der Route ruft buildPageGraph genau einmal und rendert genau ein <JsonLd>', () => {
    for (const datei of ['app/einsatzgebiet/page.tsx', 'app/einsatzgebiet/[slug]/page.tsx']) {
      const text = readFileSync(path.join(ROOT, datei), 'utf8');
      expect(text.match(/buildPageGraph\(/g), datei).toHaveLength(1);
      expect(text.match(/<JsonLd\b/g), datei).toHaveLength(1);
    }
  });
});

describe('Gebietsseite /einsatzgebiet', () => {
  const text = getEinsatzgebietPageText({ jobs });
  const meta = gebietMetadata();

  it('Metadaten aus dem Textmodell, Canonical auf sich selbst, Standardbild', () => {
    expect(canonical(meta)).toBe(getCleanCanonicalUrl(EINSATZGEBIET_PATH));
    expect(meta.description).toBe(text.meta.description);
    expect(meta.keywords).toEqual([text.meta.primaryKeyword]);
    expect(meta.openGraph?.images).toEqual([DEFAULT_OG_IMAGE]);
    expect(meta.robots).toMatchObject({ index: true });
  });

  it('Graph: CollectionPage mit ItemList aller Unterseiten und BreadcrumbList des sichtbaren Pfads', () => {
    const graph = graphOf(EinsatzgebietPage());
    const [page] = ofType(graph, 'CollectionPage');
    expect(page.url).toBe(canonical(meta));
    const [list] = ofType(graph, 'ItemList');
    expect(page.mainEntity).toEqual({ '@id': list['@id'] });
    const urls = (list.itemListElement as { url: string }[]).map((item) => item.url);
    expect(urls).toEqual([...getHubKreise().map(kreisPath), ...getPublishedPlaces().map(placePath)].map(getCleanCanonicalUrl));
    const [crumbs] = ofType(graph, 'BreadcrumbList');
    expect((crumbs.itemListElement as { name: string }[]).map((item) => item.name)).toEqual(['Startseite', 'Einsatzgebiet']);
    for (const type of ['WebPage', 'Place', 'JobPosting', 'FAQPage']) expect(ofType(graph, type)).toHaveLength(0);
  });

  it('zeigt die Kreise ohne Hub als Abschnitte mit Anker und verlinkt jeden Ort und jeden Kreis-Hub', async () => {
    // Der Explorer lädt verzögert (RegionExplorerLazy): Der Stream wartet, bis auch er gerendert ist.
    const stream = await renderToReadableStream(GebietSeite({ text }));
    await stream.allReady;
    const html = await new Response(stream).text();
    expect(html).toContain('Wo wohnst du?');
    expect(visibleCrumbs(html)).toEqual(['Startseite', 'Einsatzgebiet']);
    for (const kreis of getKreise().filter((k) => !k.hasHub)) expect(html).toContain(`id="${kreis.slug}"`);
    for (const kreis of getHubKreise()) expect(html).toContain(`href="${kreisPath(kreis)}"`);
    for (const place of getPublishedPlaces()) expect(html).toContain(`href="${placePath(place)}"`);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    const sichtbar = plain(html);
    for (const section of text.sections) for (const block of section.blocks) expect(sichtbar).toContain(norm(block.text));
  });
});

describe.each(getHubKreise().map((kreis) => [kreis.id, kreis] as const))('Kreis-Hub %s', (_id, kreis) => {
  const text = getKreisPageText(kreis, { jobs });

  it('Metadaten, Canonical, Graph mit ItemList seiner Orte, Pfad = BreadcrumbList', async () => {
    const meta = await slugMetadata(params(kreis.slug));
    expect(canonical(meta)).toBe(getCleanCanonicalUrl(kreisPath(kreis)));
    expect(meta.description).toBe(text.meta.description);
    const graph = graphOf(await EinsatzgebietSlugPage(params(kreis.slug)));
    expect(ofType(graph, 'CollectionPage')).toHaveLength(1);
    const [list] = ofType(graph, 'ItemList');
    expect((list.itemListElement as { url: string }[]).map((item) => item.url)).toEqual(
      text.rows.map((row) => getCleanCanonicalUrl(row.href)),
    );
    const html = renderToStaticMarkup(KreisSeite({ kreis, text, jobs }));
    const [crumbs] = ofType(graph, 'BreadcrumbList');
    expect((crumbs.itemListElement as { name: string }[]).map((item) => item.name)).toEqual(visibleCrumbs(html));
    expect(visibleCrumbs(html)).toEqual(['Startseite', 'Einsatzgebiet', kreis.shortName]);
  });

  it('zeigt alle Orte mit Link, PLZ, Strecke und Fahrzeit und seine Fakten', () => {
    const html = renderToStaticMarkup(KreisSeite({ kreis, text, jobs }));
    const sichtbar = plain(html);
    for (const row of text.rows) {
      expect(html).toContain(`href="${row.href}"`);
      expect(sichtbar).toContain(row.postalCode);
    }
    for (const id of ['lead', 'zahlen', 'stellen', 'kontakt'] as const) {
      for (const block of text.sections.find((s) => s.id === id)!.blocks) expect(sichtbar).toContain(norm(block.text));
    }
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).not.toContain('application/ld+json');
  });
});

const placeCases = getPublishedPlaces().map((place) => [place.id, place] as const);

describe.each(placeCases)('Ortsseite %s', (_id, place: Place) => {
  const text: PlacePageText = getPlacePageText(place, { jobs });
  const html = renderToStaticMarkup(OrtSeite({ place, text, jobs }));
  const sichtbar = plain(html);

  it('rendert jeden Ortsblock und jeden gemeinsamen Block wörtlich, eine h1 mit der h1 des Modells', () => {
    for (const section of text.sections) {
      for (const block of section.blocks) expect(sichtbar, `${section.id}: ${block.text}`).toContain(norm(block.text));
    }
    const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(html)![1];
    expect(norm(plain(h1))).toBe(norm(text.meta.h1));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });

  it('verlinkt jeden Ort, den der Text nennt, den Kreis und die Gebietsseite', () => {
    for (const link of text.links) expect(html, link.href).toContain(`href="${link.href}"`);
    expect(sichtbar).toContain(EINSATZGEBIET_LINK_LABEL);
  });

  it('zeigt die Werte des Gates (U1) sichtbar', () => {
    for (const value of text.values) expect(sichtbar, value.label).toContain(norm(value.value));
  });

  it('Route ab dem Ort in Google Maps, WhatsApp mit dem Ort in der Nachricht', () => {
    expect(html).toContain(`origin=${place.lat},${place.lng}`);
    expect(html).toContain(encodeURIComponent(`ich komme aus ${place.name}`).replace(/%20/g, '%20'));
  });
});

describe('Ortsseite: Metadaten, Canonical und Graph (Stichproben und alle Orte)', () => {
  it.each(placeCases)('%s: Canonical auf sich selbst, eigenes Teilen-Bild, Place ohne Straße, Pfad = BreadcrumbList', async (_id, place) => {
    const text = getPlacePageText(place, { jobs });
    const meta = await slugMetadata(params(place.slug));
    expect(canonical(meta)).toBe(getCleanCanonicalUrl(placePath(place)));
    expect(meta.description).toBe(text.meta.description);
    const og = meta.openGraph?.images as { url: string }[];
    expect(og[0].url).toBe(`${placePath(place)}/opengraph-image?v=${place.updatedAt}`);

    const graph = graphOf(await EinsatzgebietSlugPage(params(place.slug)));
    const [page] = ofType(graph, 'WebPage');
    const [ort] = ofType(graph, 'Place');
    expect(page.spatialCoverage).toEqual({ '@id': ort['@id'] });
    expect(ort.address).toMatchObject({ postalCode: place.postalCode, addressRegion: 'Hessen', addressCountry: 'DE' });
    expect((ort.address as Node).streetAddress).toBeUndefined();
    expect(ort.geo).toBeUndefined();
    for (const type of ['ItemList', 'JobPosting', 'FAQPage', 'CollectionPage']) expect(ofType(graph, type)).toHaveLength(0);
    expect(ofType(graph, 'LocalBusiness')).toHaveLength(1);

    const html = renderToStaticMarkup(OrtSeite({ place, text, jobs }));
    const [crumbs] = ofType(graph, 'BreadcrumbList');
    const items = crumbs.itemListElement as { name: string; item: string }[];
    expect(items.map((item) => item.name)).toEqual(visibleCrumbs(html));
    expect(items.at(-1)!.item).toBe(canonical(meta));
  });

  it('Stadtteil-Pfad: Startseite › Einsatzgebiet › Lahn-Dill-Kreis › Wetzlar › Hermannstein', () => {
    const place = getPlaceBySlug('hermannstein')!;
    const html = renderToStaticMarkup(OrtSeite({ place, text: getPlacePageText(place, { jobs }), jobs }));
    expect(visibleCrumbs(html)).toEqual(['Startseite', 'Einsatzgebiet', 'Lahn-Dill-Kreis', 'Wetzlar', 'Hermannstein']);
  });

  it('Ort in einem Kreis ohne Hub: der Kreis fehlt im Pfad (sein Abschnitt ist keine eigene Seite)', () => {
    const place = getPlaceBySlug('weilrod')!;
    const html = renderToStaticMarkup(OrtSeite({ place, text: getPlacePageText(place, { jobs }), jobs }));
    expect(visibleCrumbs(html)).toEqual(['Startseite', 'Einsatzgebiet', 'Weilrod']);
    expect(html).toContain(`href="${EINSATZGEBIET_PATH}#hochtaunuskreis"`);
  });
});
