import { getCleanCanonicalUrl } from './canonical-links';

/**
 * BreadcrumbList aller Seiten mit sichtbarem Pfad (Stellen, Orts-, Kreis- und Gebietsseite): dieselben Labels wie
 * die sichtbaren Breadcrumbs (components/ui/Breadcrumbs über components/seitenkopf/Pfad) und die Canonical-URLs;
 * die letzte Stufe ist die Seite selbst. Die Seite rendert sie nur im Graphen (lib/seo/graph.ts), dort ohne
 * eigenes @context und mit WebPage.breadcrumb als Verweis auf diese @id.
 */
export interface BreadcrumbJsonLd {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  '@id': string;
  itemListElement: { '@type': 'ListItem'; position: number; name: string; item: string }[];
}

export interface BreadcrumbStep {
  name: string;
  /** Canonical-URL der Stufe (absolut). */
  url: string;
}

export function breadcrumbList(trail: readonly BreadcrumbStep[]): BreadcrumbJsonLd {
  if (trail.length === 0) throw new RangeError('breadcrumbList: leerer Pfad');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${trail[trail.length - 1].url}#breadcrumb`,
    itemListElement: trail.map((step, i) => ({ '@type': 'ListItem', position: i + 1, name: step.name, item: step.url })),
  };
}

/** Eine sichtbare Stufe: Label und Ziel (Pfad); die letzte Stufe ist die Seite selbst (sichtbar ohne Link). */
export interface PfadStufe {
  label: string;
  href: string;
}

/**
 * Sichtbarer Pfad → BreadcrumbList: dieselben Stufen, die Pfade als Canonical-URL. `current` ist die Seite selbst
 * (sichtbar ohne Link).
 */
export function breadcrumbFromTrail(trail: readonly PfadStufe[], current: PfadStufe): BreadcrumbJsonLd {
  return breadcrumbList([...trail, current].map((step) => ({ name: step.label, url: getCleanCanonicalUrl(step.href) })));
}
