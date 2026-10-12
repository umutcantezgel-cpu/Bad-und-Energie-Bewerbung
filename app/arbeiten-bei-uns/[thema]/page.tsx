import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
// Direkte Module statt Barrels: Die Barrels exportieren Client-Komponenten, die diese Seite nicht nutzt.
import { JsonLd } from '@/components/seo/JsonLd';
import { ThemaSeite } from '@/components/themen/ThemaSeite';
import { getThemaBySlug, getThemen, type Thema } from '@/lib/themen/registry';
import { getThemaPageText } from '@/lib/themen/text';
import { buildPageGraph } from '@/lib/seo/graph';
import { liveJobs, themaGraphInput, themaMetadata } from '../seo';

type Params = Promise<{ thema: string }>;

/** Nur die fünf Themen; alles andere ist ein 404 ohne Serverlauf. */
export const dynamicParams = false;

/** Stündlich neu: Gehalt, Fahrzeug und Wärmepumpen nennen die live Stellen (wie /jobs und die Stellenseiten). */
export const revalidate = 3600;

export function generateStaticParams(): { thema: string }[] {
  return getThemen().map((thema) => ({ thema: thema.slug }));
}

function resolve(slug: string): Thema {
  const thema = getThemaBySlug(slug);
  if (!thema) notFound();
  return thema;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { thema: slug } = await params;
  const thema = getThemaBySlug(slug);
  if (!thema) return {};
  return themaMetadata(getThemaPageText(thema.id, { jobs: liveJobs() }));
}

/**
 * Themenseite unter /arbeiten-bei-uns/<thema> (E-028), Erzählseite mit eigener Signatur im Kopf. Ein Graph (V6-B):
 * WebPage und die BreadcrumbList des sichtbaren Pfads; kein JobPosting (nur auf /jobs/<slug>), keine FAQPage.
 */
export default async function ThemaPage({ params }: { params: Params }) {
  const { thema: slug } = await params;
  const thema = resolve(slug);
  const jobs = liveJobs();
  const text = getThemaPageText(thema.id, { jobs });
  return (
    <>
      <JsonLd data={buildPageGraph(themaGraphInput(thema.id, text))} />
      <ThemaSeite text={text} jobs={jobs} />
    </>
  );
}
