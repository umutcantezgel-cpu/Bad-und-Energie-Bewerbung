import { BREADCRUMB_EINSATZGEBIET, BREADCRUMB_HOME } from '@/lib/content/breadcrumbs';
import { breadcrumbFromTrail, type BreadcrumbJsonLd, type PfadStufe } from '@/lib/seo/breadcrumbs-jsonld';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import type { ItemListJsonLd, PlaceJsonLd } from '@/lib/seo/graph';
import { SITE_CONFIG } from '@/lib/seo/site-config';

import { istOrtIndexierbar } from './indexierung';
import {
  EINSATZGEBIET_PATH,
  getHubKreise,
  getKreisPlaces,
  getPlaceById,
  getPlaceKreis,
  getPublishedPlaces,
  kreisPath,
  placePath,
  type Kreis,
  type Place,
} from './registry';

/**
 * Pfad und strukturierte Daten der lokalen Seiten (E-028). Der sichtbare Pfad (components/seitenkopf/Pfad) und die
 * BreadcrumbList kommen aus denselben Stufen; Ort und Liste der Unterseiten ergänzen den WebPage-Knoten im einen
 * Graphen der Seite (lib/seo/graph.ts). Kein LocalBusiness je Ort, kein JobPosting, keine FAQPage.
 */

export type { PfadStufe };

export interface SeitenPfad {
  /** Stufen über der Seite, jede mit Link. */
  trail: PfadStufe[];
  /** Die Seite selbst. */
  current: PfadStufe;
}

const HOME: PfadStufe = { label: BREADCRUMB_HOME.label, href: BREADCRUMB_HOME.href };
const GEBIET: PfadStufe = { label: BREADCRUMB_EINSATZGEBIET.label, href: BREADCRUMB_EINSATZGEBIET.href };

/** Startseite › Einsatzgebiet */
export function einsatzgebietPfad(): SeitenPfad {
  return { trail: [HOME], current: GEBIET };
}

/** Startseite › Einsatzgebiet › Kreis */
export function kreisPfad(kreis: Kreis): SeitenPfad {
  return { trail: [HOME, GEBIET], current: { label: kreis.shortName, href: kreisPath(kreis) } };
}

/**
 * Startseite › Einsatzgebiet › Kreis (nur mit eigener Seite) › Wetzlar (nur Stadtteile) › Ort. Kreise ohne Hub
 * fehlen im Pfad: Ihr Abschnitt auf der Gebietsseite ist keine eigene Seite.
 */
export function placePfad(place: Place): SeitenPfad {
  const kreis = getPlaceKreis(place);
  const trail: PfadStufe[] = [HOME, GEBIET];
  if (kreis.hasHub) trail.push({ label: kreis.shortName, href: kreisPath(kreis) });
  const parent = place.parentId ? getPlaceById(place.parentId) : undefined;
  if (parent?.status === 'published') trail.push({ label: parent.name, href: placePath(parent) });
  return { trail, current: { label: place.name, href: placePath(place) } };
}

/** BreadcrumbList zum sichtbaren Pfad. */
export function pfadJsonLd(pfad: SeitenPfad): BreadcrumbJsonLd {
  return breadcrumbFromTrail(pfad.trail, pfad.current);
}

/** Sichtbare Stufen für components/ui/Breadcrumbs: die Seite selbst ohne Link. */
export function pfadItems(pfad: SeitenPfad): { label: string; href?: string }[] {
  return [...pfad.trail.map((step) => ({ label: step.label, href: step.href })), { label: pfad.current.label }];
}

const HQ_CITY = SITE_CONFIG.headquarters.addressLocality;

/**
 * Ort einer Ortsseite als Place: Name, Postleitzahl, Ort (Stadtteile gehören postalisch zu Wetzlar), Land Hessen,
 * Kreis als AdministrativeArea. Ohne Straße und ohne Koordinaten: Der Betrieb sitzt nur in Wetzlar.
 */
export function buildPlaceJsonLd(place: Place): PlaceJsonLd {
  const kreis = getPlaceKreis(place);
  return {
    '@type': 'Place',
    '@id': `${getCleanCanonicalUrl(placePath(place))}#place`,
    name: place.name,
    address: {
      '@type': 'PostalAddress',
      postalCode: place.postalCode,
      addressLocality: place.kind === 'stadtteil' ? HQ_CITY : place.name,
      addressRegion: SITE_CONFIG.headquarters.addressRegion,
      addressCountry: SITE_CONFIG.headquarters.addressCountry,
    },
    containedInPlace: { '@type': 'AdministrativeArea', name: kreis.name },
  };
}

function itemList(path: string, name: string, entries: readonly { name: string; path: string }[]): ItemListJsonLd {
  return {
    '@type': 'ItemList',
    '@id': `${getCleanCanonicalUrl(path)}#itemlist`,
    name,
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: entry.name,
      url: getCleanCanonicalUrl(entry.path),
    })),
  };
}

/**
 * Kreis-Hub: seine Orte nach Strecke, wie die Tabelle der Seite, aber nur die indexierbaren (E-029): Jede URL der
 * ItemList steht in der Sitemap (scripts/qa/check-graph.mjs Regel 7). Die Tabelle der Seite verlinkt weiter alle Orte.
 */
export function buildKreisItemListJsonLd(kreis: Kreis, now: Date = new Date()): ItemListJsonLd {
  return itemList(
    kreisPath(kreis),
    `Orte ${kreis.dative}`,
    getKreisPlaces(kreis.id)
      .filter((place) => istOrtIndexierbar(place, now))
      .map((place) => ({ name: place.name, path: placePath(place) })),
  );
}

/** Gebietsseite: die Kreis-Hubs, dann alle indexierbaren Ortsseiten nach Strecke. */
export function buildEinsatzgebietItemListJsonLd(now: Date = new Date()): ItemListJsonLd {
  return itemList(EINSATZGEBIET_PATH, 'Kreise und Orte im Einsatzgebiet', [
    ...getHubKreise().map((kreis) => ({ name: kreis.shortName, path: kreisPath(kreis) })),
    ...getPublishedPlaces()
      .filter((place) => istOrtIndexierbar(place, now))
      .map((place) => ({ name: place.name, path: placePath(place) })),
  ]);
}
