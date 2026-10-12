import type { Metadata } from 'next';
// Direkte Module statt Barrels: Die Barrels exportieren Client-Komponenten, die diese Seite nicht nutzt.
import { GebietSeite } from '@/components/einsatzgebiet/GebietSeite';
import { JsonLd } from '@/components/seo/JsonLd';
import { getEinsatzgebietPageText } from '@/lib/places/text';
import { buildPageGraph } from '@/lib/seo/graph';
import { einsatzgebietGraphInput, einsatzgebietMetadata, liveJobs } from './seo';

/** Stündlich wie /jobs: Die Description nennt die Gehaltsspanne der Stellen, die gerade live sind. */
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return einsatzgebietMetadata(getEinsatzgebietPageText({ jobs: liveJobs() }));
}

/**
 * Gebietsseite /einsatzgebiet (E-028): alle 55 Orte im 35-km-Gebiet mit gemessener Strecke und Fahrzeit, die
 * Kreis-Hubs, die Kreise ohne eigene Seite als Abschnitte und der Explorer aller Orte. Ein Graph (V6-B):
 * CollectionPage mit der ItemList der Unterseiten und die BreadcrumbList des sichtbaren Pfads.
 */
export default function EinsatzgebietPage() {
  const text = getEinsatzgebietPageText({ jobs: liveJobs() });
  return (
    <>
      <JsonLd data={buildPageGraph(einsatzgebietGraphInput(text))} />
      <GebietSeite text={text} />
    </>
  );
}
