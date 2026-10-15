import type { Metadata } from 'next';
// Direkte Module statt Barrels: Die Barrels exportieren Client-Komponenten, die diese Seite nicht nutzt.
import { ArbeitenSeite } from '@/components/themen/ArbeitenSeite';
import { JsonLd } from '@/components/seo/JsonLd';
import { getArbeitenPageText } from '@/lib/themen/text';
import { buildPageGraph } from '@/lib/seo/graph';
import { arbeitenGraphInput, arbeitenMetadata, liveJobs } from './seo';

/** Stündlich wie /jobs: Die Seite nennt die Stellen, die gerade live sind. */
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return arbeitenMetadata(getArbeitenPageText({ jobs: liveJobs() }));
}

/**
 * Themen-Hub /arbeiten-bei-uns (E-028): die sechs Themen (Bezahlung und Extras, Fahrzeug und Werkzeug, Wärmepumpen,
 * Betrieb, diskreter Wechsel, Büro und Verwaltung), die Zusagen und die offenen Stellen (Lohn auf Anfrage, E-030). Ein Graph (V6-B): CollectionPage mit der ItemList
 * der Themen und die BreadcrumbList des sichtbaren Pfads.
 */
export default function ArbeitenBeiUnsPage() {
  const jobs = liveJobs();
  const text = getArbeitenPageText({ jobs });
  return (
    <>
      <JsonLd data={buildPageGraph(arbeitenGraphInput(text))} />
      <ArbeitenSeite text={text} jobs={jobs} />
    </>
  );
}
