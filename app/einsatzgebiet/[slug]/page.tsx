import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
// Direkte Module statt Barrels: Die Barrels exportieren Client-Komponenten, die diese Seite nicht nutzt.
import { KreisSeite } from '@/components/einsatzgebiet/KreisSeite';
import { OrtSeite } from '@/components/einsatzgebiet/OrtSeite';
import { JsonLd } from '@/components/seo/JsonLd';
import type { Job } from '@/lib/jobs/registry';
import { getEinsatzgebietRouteSlugs, resolveEinsatzgebietSlug, type EinsatzgebietRoute } from '@/lib/places/registry';
import { getKreisPageText, getPlacePageText } from '@/lib/places/text';
import { buildPageGraph, type PageGraphInput } from '@/lib/seo/graph';
import { kreisGraphInput, kreisMetadata, liveJobs, placeGraphInput, placeMetadata } from '../seo';

type Params = Promise<{ slug: string }>;

/** Nur bekannte Segmente; alles andere ist ein 404 ohne Serverlauf. */
export const dynamicParams = false;

/**
 * Stündlich neu: Die Seiten nennen die live Stellen (wie /jobs, seit E-030 ohne Betrag), und eine Ortsseite fällt nach
 * dem Fahrplanjahr ihrer Daten ohne Deploy auf `noindex,follow` (Gate I5, E-029, app/einsatzgebiet/seo.ts).
 */
export const revalidate = 3600;

/**
 * Ortsseiten, Kreis-Hubs und jedes Segment, das per 308 weiterleitet (alte Slugs, zusammengelegte Orte, Kreise
 * ohne eigene Seite). Slug-Lock: Ein einmal veröffentlichter Slug liefert nie 404 (lib/places/slugs.lock.json).
 */
export function generateStaticParams(): { slug: string }[] {
  return getEinsatzgebietRouteSlugs().map((slug) => ({ slug }));
}

/** Seite oder Weiterleitung (permanentRedirect, 308); unbekannt: 404. */
function resolve(slug: string): Exclude<EinsatzgebietRoute, { type: 'redirect' }> {
  const route = resolveEinsatzgebietSlug(slug);
  if (!route) notFound();
  if (route.type === 'redirect') permanentRedirect(route.to);
  return route;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const route = resolveEinsatzgebietSlug(slug);
  if (!route || route.type === 'redirect') return {};
  const jobs = liveJobs();
  if (route.type === 'place') return placeMetadata(route.place, getPlacePageText(route.place, { jobs }));
  return kreisMetadata(getKreisPageText(route.kreis, { jobs }));
}

/** Der eine Graph der Seite (V6-B): Ortsseite mit Place, Kreis-Hub als CollectionPage mit ItemList. */
function graphInput(route: Exclude<EinsatzgebietRoute, { type: 'redirect' }>, jobs: readonly Job[]): PageGraphInput {
  if (route.type === 'place') return placeGraphInput(route.place, getPlacePageText(route.place, { jobs }));
  return kreisGraphInput(route.kreis, getKreisPageText(route.kreis, { jobs }));
}

/**
 * Ortsseite (Ort oder Stadtteil) bzw. Kreis-Hub unter /einsatzgebiet/<slug> (E-028). Kein JobPosting (nur auf
 * /jobs/<slug>), kein LocalBusiness je Ort, keine FAQPage (auch nicht für die Fragen zu Bus und Bahn, E-029).
 */
export default async function EinsatzgebietSlugPage({ params }: { params: Params }) {
  const { slug } = await params;
  const route = resolve(slug);
  const jobs = liveJobs();
  return (
    <>
      <JsonLd data={buildPageGraph(graphInput(route, jobs))} />
      {route.type === 'place' ? (
        <OrtSeite place={route.place} text={getPlacePageText(route.place, { jobs })} jobs={jobs} />
      ) : (
        <KreisSeite kreis={route.kreis} text={getKreisPageText(route.kreis, { jobs })} jobs={jobs} />
      )}
    </>
  );
}
