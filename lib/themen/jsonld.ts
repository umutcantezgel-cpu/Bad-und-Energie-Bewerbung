import { BREADCRUMB_HOME } from '@/lib/content/breadcrumbs';
import { breadcrumbFromTrail, type BreadcrumbJsonLd, type PfadStufe } from '@/lib/seo/breadcrumbs-jsonld';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import type { ItemListJsonLd } from '@/lib/seo/graph';

import { ARBEITEN_NAME, ARBEITEN_PATH, getThemen, themaPath, type Thema } from './registry';

/**
 * Pfad und strukturierte Daten der Themenseiten (E-028). Der sichtbare Pfad (components/seitenkopf/Pfad) und die
 * BreadcrumbList kommen aus denselben Stufen. Hub: CollectionPage mit der ItemList der Themen; Thema: WebPage. Kein
 * JobPosting (nur auf /jobs/<slug>), keine FAQPage (nur auf /), kein Place, kein weiteres LocalBusiness.
 */

export interface SeitenPfad {
  trail: PfadStufe[];
  current: PfadStufe;
}

const HOME: PfadStufe = { label: BREADCRUMB_HOME.label, href: BREADCRUMB_HOME.href };
const HUB: PfadStufe = { label: ARBEITEN_NAME, href: ARBEITEN_PATH };

/** Startseite › Arbeiten bei uns */
export function arbeitenPfad(): SeitenPfad {
  return { trail: [HOME], current: HUB };
}

/** Startseite › Arbeiten bei uns › Thema */
export function themaPfad(thema: Pick<Thema, 'name' | 'slug'>): SeitenPfad {
  return { trail: [HOME, HUB], current: { label: thema.name, href: themaPath(thema) } };
}

export function pfadJsonLd(pfad: SeitenPfad): BreadcrumbJsonLd {
  return breadcrumbFromTrail(pfad.trail, pfad.current);
}

/** Sichtbare Stufen für components/ui/Breadcrumbs: die Seite selbst ohne Link. */
export function pfadItems(pfad: SeitenPfad): { label: string; href?: string }[] {
  return [...pfad.trail.map((step) => ({ label: step.label, href: step.href })), { label: pfad.current.label }];
}

/** Hub: die fünf Themen in Seitenreihenfolge, jede mit ihrer Canonical-URL (steht in der Sitemap). */
export function buildThemenItemListJsonLd(): ItemListJsonLd {
  const themen = getThemen();
  return {
    '@type': 'ItemList',
    '@id': `${getCleanCanonicalUrl(ARBEITEN_PATH)}#itemlist`,
    name: 'Themen: Arbeiten bei Bad und Energie',
    numberOfItems: themen.length,
    itemListElement: themen.map((thema, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: thema.name,
      url: getCleanCanonicalUrl(themaPath(thema)),
    })),
  };
}
