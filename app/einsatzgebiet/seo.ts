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
import { placePath, type Kreis, type Place } from '@/lib/places/registry';
import type { EinsatzgebietPageText, KreisPageText, PageMeta, PlacePageText } from '@/lib/places/text';
import type { PageGraphInput } from '@/lib/seo/graph';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { placeOgImage, type OgImage } from '@/lib/seo/og-image';

/**
 * Metadaten und Graph-Eingaben der Seiten unter /einsatzgebiet (E-028): Title, Description und Keyword aus dem
 * Textmodell (lib/places/text.ts, Gate U8), Canonical auf sich selbst, Pfad = BreadcrumbList. Ortsseiten mit eigenem
 * Teilen-Bild, Kreis- und Gebietsseite mit dem Standardbild.
 */

/** Stellen, die gerade live sind: Die Seiten nennen sie mit Gehalt (stündlich neu, wie /jobs). */
export function liveJobs(now = new Date()): Job[] {
  return getActiveJobs().filter((job) => isJobLive(job, now));
}

function metadataFor(meta: PageMeta, path: string, ogImage?: OgImage): Metadata {
  return {
    ...generatePageMetadata({
      title: meta.title,
      description: meta.description,
      path,
      keywords: [meta.primaryKeyword],
      ...(ogImage ? { ogImage } : {}),
    }),
    title: pageTitle(meta.title),
  };
}

export function placeMetadata(place: Place, text: PlacePageText): Metadata {
  return metadataFor(
    text.meta,
    text.path,
    placeOgImage({ path: placePath(place), name: place.name, updatedAt: place.updatedAt, distanceKm: place.commute.distanceKm }),
  );
}

export function kreisMetadata(text: KreisPageText): Metadata {
  return metadataFor(text.meta, text.path);
}

export function einsatzgebietMetadata(text: EinsatzgebietPageText): Metadata {
  return metadataFor(text.meta, text.path);
}

/** Graph der Ortsseite: WebPage mit dem Ort als spatialCoverage, BreadcrumbList des sichtbaren Pfads. */
export function placeGraphInput(place: Place, text: PlacePageText): PageGraphInput {
  return { metadata: placeMetadata(place, text), breadcrumb: pfadJsonLd(placePfad(place)), place: buildPlaceJsonLd(place) };
}

/** Graph des Kreis-Hubs: CollectionPage mit der ItemList seiner Orte, BreadcrumbList. */
export function kreisGraphInput(kreis: Kreis, text: KreisPageText): PageGraphInput {
  return { metadata: kreisMetadata(text), breadcrumb: pfadJsonLd(kreisPfad(kreis)), itemList: buildKreisItemListJsonLd(kreis) };
}

/** Graph der Gebietsseite: CollectionPage mit Kreis-Hubs und allen Orten, BreadcrumbList. */
export function einsatzgebietGraphInput(text: EinsatzgebietPageText): PageGraphInput {
  return {
    metadata: einsatzgebietMetadata(text),
    breadcrumb: pfadJsonLd(einsatzgebietPfad()),
    itemList: buildEinsatzgebietItemListJsonLd(),
  };
}
