import { notFound } from 'next/navigation';
import { COMPANY } from '@/lib/content';
import { getPlaceBySlug, getPublishedPlaces } from '@/lib/places/registry';
import { getPlacePageText } from '@/lib/places/text';
import { OG_IMAGE_SIZE, OG_IMAGE_TYPE, ogPlaceText } from '@/lib/seo/og-image';
import { renderPlaceImage } from '@/lib/seo/og-render';
import { liveJobs } from '../seo';

/**
 * Teilen-Bild einer Ortsseite (E-028) im Rahmen der Stellenbilder: h1 der Seite, als Kennwert über dem Hausschnitt
 * die Straßenstrecke „27 km bis zum Firmensitz“ (E-029). Die Seite verlinkt es mit eigenem alt (placeOgImage); dieses alt gilt nur ohne.
 * Kreis- und Gebietsseite nutzen das Standardbild; ihre Segmente haben hier keine Route.
 */
export const alt = `SHK-Jobs im Einsatzgebiet von ${COMPANY.shortName} in ${COMPANY.address.city}`;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_TYPE;
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getPublishedPlaces().map((place) => ({ slug: place.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);
  if (!place || place.status !== 'published') notFound();
  const text = getPlacePageText(place, { jobs: liveJobs() });
  return renderPlaceImage(
    ogPlaceText({ etikett: text.etikett, h1: text.meta.h1, distanceKm: place.commute.distanceKm, minutes: place.commute.minutes }),
  );
}
