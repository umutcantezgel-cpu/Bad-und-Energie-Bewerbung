import { notFound } from 'next/navigation';
import { COMPANY } from '@/lib/content';
import { getThemaBySlug, getThemen } from '@/lib/themen/registry';
import { ogThemaText } from '@/lib/themen/og';
import { getThemaPageText } from '@/lib/themen/text';
import { OG_IMAGE_SIZE, OG_IMAGE_TYPE } from '@/lib/seo/og-image';
import { renderJobImage } from '@/lib/seo/og-render';
import { liveJobs } from '../seo';

/**
 * Teilen-Bild einer Themenseite (E-028) im Rahmen der Stellenbilder: Etikett und h1 der Seite, zwei kurze
 * Zeilen als Unterzeile, über dem Hausschnitt der Kennwert der Seite als Maß (E-029). Die Seite verlinkt es mit
 * eigenem alt (themaOgImage); dieses alt gilt nur ohne. Der Hub nutzt das Standardbild.
 */
export const alt = `Arbeiten bei ${COMPANY.shortName} in ${COMPANY.address.city}`;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_TYPE;
export const dynamicParams = false;

/** Stündlich wie die Seite: Kennwerte im Bild, die von den live Stellen abhängen, folgen ihnen. */
export const revalidate = 3600;

export function generateStaticParams(): { thema: string }[] {
  return getThemen().map((thema) => ({ thema: thema.slug }));
}

export default async function Image({ params }: { params: Promise<{ thema: string }> }) {
  const { thema: slug } = await params;
  const thema = getThemaBySlug(slug);
  if (!thema) notFound();
  return renderJobImage(ogThemaText(getThemaPageText(thema.id, { jobs: liveJobs() })));
}
