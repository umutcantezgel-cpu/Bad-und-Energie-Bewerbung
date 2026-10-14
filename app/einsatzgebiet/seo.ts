import type { Metadata } from 'next';
import { pageTitle } from '@/components/jobs/text';
import { getActiveJobs, isJobLive, type Job } from '@/lib/jobs/registry';
import {
  buildEinsatzgebietItemListJsonLd,
  buildKreisItemListJsonLd,
  buildPlaceJsonLd,
  einsatzgebietPfad,
  kreisPfad,
  pfadJsonLd,
  placePfad,
} from '@/lib/places/jsonld';
import { istOrtIndexierbar } from '@/lib/places/indexierung';
import { placePath, type Kreis, type Place } from '@/lib/places/registry';
import type { EinsatzgebietPageText, KreisPageText, PageMeta, PlacePageText } from '@/lib/places/text';
import type { PageGraphInput } from '@/lib/seo/graph';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { placeOgImage, type OgImage } from '@/lib/seo/og-image';

/**
 * Metadaten und Graph-Eingaben der Seiten unter /einsatzgebiet (E-028): Title, Description und Keyword aus dem
 * Textmodell (lib/places/text.ts, Gate U8), Canonical auf sich selbst, Pfad = BreadcrumbList. Ortsseiten mit eigenem
 * Teilen-Bild, Kreis- und Gebietsseite mit dem Standardbild. Robots je Ort nach dem Indexierungs-Gate (E-029,
 * lib/places/indexierung.ts): Wer es nicht besteht, steht mit `noindex,follow` und bleibt erreichbar.
 */

/** Stellen, die gerade live sind: Die Seiten nennen sie, seit E-030 ohne Betrag (stündlich neu, wie /jobs). */
export function liveJobs(now = new Date()): Job[] {
  return getActiveJobs().filter((job) => isJobLive(job, now));
}

function metadataFor(meta: PageMeta, path: string, ogImage?: OgImage, noindex = false): Metadata {
  return {
    ...generatePageMetadata({
      title: meta.title,
      description: meta.description,
      path,
      keywords: [meta.primaryKeyword],
      noindex,
      ...(ogImage ? { ogImage } : {}),
    }),
    title: pageTitle(meta.title),
  };
}

/** Ortsseite: `noindex,follow`, wenn der Ort das Gate am Tag `now` nicht besteht (Lock-Datei, Fahrplanjahr). */
export function placeMetadata(place: Place, text: PlacePageText, now: Date = new Date()): Metadata {
  return metadataFor(
    text.meta,
    text.path,
    placeOgImage({ path: placePath(place), name: place.name, updatedAt: place.updatedAt, distanceKm: place.commute.distanceKm }),
    !istOrtIndexierbar(place, now),
  );
}

export function kreisMetadata(text: KreisPageText): Metadata {
  return metadataFor(text.meta, text.path);
}

export function einsatzgebietMetadata(text: EinsatzgebietPageText): Metadata {
  return metadataFor(text.meta, text.path);
}

/**
 * Graph der Ortsseite: WebPage mit dem Ort als spatialCoverage, BreadcrumbList des sichtbaren Pfads. Mit `noindex` nur
 * der WebPage-Knoten wie auf den anderen noindex-Seiten (V6-B): buildPageGraph lässt die BreadcrumbList weg, der Place
 * entfällt hier.
 */
export function placeGraphInput(place: Place, text: PlacePageText, now: Date = new Date()): PageGraphInput {
  const metadata = placeMetadata(place, text, now);
  const indexierbar = istOrtIndexierbar(place, now);
  return { metadata, breadcrumb: pfadJsonLd(placePfad(place)), ...(indexierbar ? { place: buildPlaceJsonLd(place) } : {}) };
}

/** Graph des Kreis-Hubs: CollectionPage mit der ItemList seiner indexierbaren Orte, BreadcrumbList. */
export function kreisGraphInput(kreis: Kreis, text: KreisPageText, now: Date = new Date()): PageGraphInput {
  return { metadata: kreisMetadata(text), breadcrumb: pfadJsonLd(kreisPfad(kreis)), itemList: buildKreisItemListJsonLd(kreis, now) };
}

/** Graph der Gebietsseite: CollectionPage mit Kreis-Hubs und allen indexierbaren Orten, BreadcrumbList. */
export function einsatzgebietGraphInput(text: EinsatzgebietPageText, now: Date = new Date()): PageGraphInput {
  return {
    metadata: einsatzgebietMetadata(text),
    breadcrumb: pfadJsonLd(einsatzgebietPfad()),
    itemList: buildEinsatzgebietItemListJsonLd(now),
  };
}
