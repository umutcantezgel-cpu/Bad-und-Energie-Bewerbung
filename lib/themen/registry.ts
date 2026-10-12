import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';

/**
 * Themenseiten (E-028, Plan „Seitenarchitektur“: Themen-Hub und Themen): der Hub /arbeiten-bei-uns und fünf Themen
 * flach darunter. Feste Liste ohne Datenbank: Jede Seite baut ihren Text aus lib/content/facts.ts (per ID), den
 * Stellen im Registry (Gehälter, Pakete, Aufgaben) und den freigegebenen Inhalten (Ablauf, FAQ, Team), siehe
 * lib/themen/text.ts. Ein veröffentlichter Slug bleibt (Test themen.test.ts sperrt die Liste).
 */

export const ARBEITEN_PATH = '/arbeiten-bei-uns';

/** Name des Hubs: Pfad, BreadcrumbList, Fuß und Links (ein Ankertext, ein Ziel). */
export const ARBEITEN_NAME = 'Arbeiten bei uns';

export const THEMA_IDS = ['gehalt', 'fahrzeug-und-werkzeug', 'waermepumpen', 'betrieb', 'diskret-wechseln'] as const;
export type ThemaId = (typeof THEMA_IDS)[number];

/** Zeichen des Themas (components/icons, eigene Familie); die Komponenten setzen es um. */
export type ThemaIcon = 'banknote' | 'werkzeug' | 'waermepumpe' | 'users' | 'shield-check';

export interface Thema {
  id: ThemaId;
  /** Segment unter /arbeiten-bei-uns, gleich der ID. */
  slug: ThemaId;
  /** Name in Pfad, BreadcrumbList, ItemList, Fuß und auf den Themenkarten. */
  name: string;
  icon: ThemaIcon;
  /** Stand der Texte (JJJJ-MM-TT). Seiten mit Stellen nehmen das jüngere Datum der live Stellen dazu (Sitemap). */
  updatedAt: string;
}

/** Stand aller Themenseiten: angelegt 2026-10-12 (fakten-abgleich B28–B31 eingearbeitet). */
export const THEMEN_STAND = '2026-10-12';

const THEMEN: readonly Thema[] = Object.freeze(
  (
    [
      { id: 'gehalt', name: 'Gehalt', icon: 'banknote' },
      { id: 'fahrzeug-und-werkzeug', name: 'Fahrzeug und Werkzeug', icon: 'werkzeug' },
      { id: 'waermepumpen', name: 'Wärmepumpen', icon: 'waermepumpe' },
      { id: 'betrieb', name: 'Der Betrieb', icon: 'users' },
      { id: 'diskret-wechseln', name: 'Diskret wechseln', icon: 'shield-check' },
    ] as const
  ).map((thema) => Object.freeze({ ...thema, slug: thema.id, updatedAt: THEMEN_STAND })),
);

/** Alle Themen in fester Reihenfolge (Hub, ItemList, Fuß, Sitemap). */
export function getThemen(): readonly Thema[] {
  return THEMEN;
}

export function getThema(id: ThemaId): Thema {
  const thema = THEMEN.find((t) => t.id === id);
  if (!thema) throw new Error(`Unbekanntes Thema: ${id}`);
  return thema;
}

export function getThemaBySlug(slug: string): Thema | undefined {
  return THEMEN.find((thema) => thema.slug === slug);
}

export function themaPath(thema: Pick<Thema, 'slug'>): string {
  return `${ARBEITEN_PATH}/${thema.slug}`;
}

export function themaUrl(thema: Pick<Thema, 'slug'>): string {
  return getCleanCanonicalUrl(themaPath(thema));
}

export function arbeitenUrl(): string {
  return getCleanCanonicalUrl(ARBEITEN_PATH);
}

/** Weg zum Hub von Startseite und /jobs (ein Ankertext, ein Ziel). */
export const ARBEITEN_LINK = Object.freeze({ href: ARBEITEN_PATH, label: 'Mehr zum Arbeiten bei uns' });

/** Weg von jeder Stellenseite zur Gehaltsseite (genau einmal je Stellenseite, unter „Auf einen Blick“). */
export const GEHALT_VERGLEICH_LINK = Object.freeze({ href: `${ARBEITEN_PATH}/gehalt`, label: 'Gehälter aller Stellen im Vergleich' });
