import type { Metadata } from 'next';
import { pageTitle } from '@/components/jobs/text';
import { getActiveJobs, isJobLive, type Job } from '@/lib/jobs/registry';
import { arbeitenPfad, buildThemenItemListJsonLd, pfadJsonLd, themaPfad } from '@/lib/themen/jsonld';
import { themaOgImage } from '@/lib/themen/og';
import { getThema, type ThemaId } from '@/lib/themen/registry';
import type { ArbeitenPageText, SeitenBasis } from '@/lib/themen/text';
import type { PageGraphInput } from '@/lib/seo/graph';
import { generatePageMetadata } from '@/lib/seo/metadata';
import type { OgImage } from '@/lib/seo/og-image';

/**
 * Metadaten und Graph-Eingaben der Themenseiten (E-028): Title, Description, h1 und Keyword aus dem Textmodell
 * (lib/themen/text.ts), Canonical auf sich selbst, Pfad = BreadcrumbList. Hub mit dem Standardbild und als
 * CollectionPage mit der ItemList der Themen; Themen mit eigenem Teilen-Bild und als WebPage. Kein JobPosting, keine
 * FAQPage.
 */

/** Stellen, die gerade live sind: Die Seiten nennen sie mit „Lohn auf Anfrage“ (stündlich neu, wie /jobs). */
export function liveJobs(now = new Date()): Job[] {
  return getActiveJobs().filter((job) => isJobLive(job, now));
}

function metadataFor(text: Pick<SeitenBasis, 'meta' | 'path'>, ogImage?: OgImage): Metadata {
  return {
    ...generatePageMetadata({
      title: text.meta.title,
      description: text.meta.description,
      path: text.path,
      keywords: [text.meta.primaryKeyword],
      ...(ogImage ? { ogImage } : {}),
    }),
    title: pageTitle(text.meta.title),
  };
}

export function arbeitenMetadata(text: ArbeitenPageText): Metadata {
  return metadataFor(text);
}

export function themaMetadata(text: SeitenBasis): Metadata {
  return metadataFor(text, themaOgImage(text));
}

/** Graph des Hubs: CollectionPage mit der ItemList der fünf Themen, BreadcrumbList. */
export function arbeitenGraphInput(text: ArbeitenPageText): PageGraphInput {
  return { metadata: arbeitenMetadata(text), breadcrumb: pfadJsonLd(arbeitenPfad()), itemList: buildThemenItemListJsonLd() };
}

/** Graph einer Themenseite: WebPage und BreadcrumbList des sichtbaren Pfads. */
export function themaGraphInput(id: ThemaId, text: SeitenBasis): PageGraphInput {
  return { metadata: themaMetadata(text), breadcrumb: pfadJsonLd(themaPfad(getThema(id))) };
}
