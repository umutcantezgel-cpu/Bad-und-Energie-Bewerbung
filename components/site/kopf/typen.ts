/*
 * Typen und reine Helfer des Seitenkopfs, ohne Importe: Kopf und Menü (Client) nutzen sie, ohne
 * Registry, Fakten oder zod ins Bündel zu ziehen. Die Werte baut SiteHeader auf dem Server
 * (components/site/kopf/kopf-daten.ts).
 */

/** E-SHELL-002: Zähler am Eintrag „Stellen“. */
export interface OffeneStellen {
  anzahl: number;
  /** Zugänglicher Zusatz, z. B. „aktuell 4 offene Stellen“. */
  text: string;
}

/** E-SHELL-001: Jubiläumsmarke; null ab 2027-01-01. */
export interface KopfMarke {
  lang: string;
  zahl: string;
  spanne: string;
}

/** Ein Weg im Untermenü: Thema oder Kreis-Hub, mit optionalem Maß („26 Orte“). */
export interface KopfUnterweg {
  href: string;
  label: string;
  /** Mono-Etikett rechts, z. B. „26 Orte“. */
  mass?: string;
}

/**
 * Untermenü eines Eintrags der Hauptnavigation (E-028): „Arbeiten bei uns“ mit den Themen, „Einsatzgebiet“ mit den
 * Kreis-Hubs und dem Verzeichnis aller Orte. Auf dem Server gebaut (kopf-daten.ts), damit Kopf und Menü weder
 * lib/themen noch lib/places ins Client-Bündel ziehen.
 */
export interface KopfUntermenue {
  /** href des Eintrags in NAV_ITEMS, unter dem das Untermenü hängt. */
  href: string;
  /** Kennung für ids (kopf-unter-…). */
  id: string;
  /** Mono-Etikett über der Liste („Themen“, „Kreise“). */
  etikett: string;
  wege: readonly KopfUnterweg[];
  /**
   * Abschluss des Untermenüs: Hub („Alle Themen im Überblick“) oder Verzeichnis („Alle 54 Orte von A bis Z“). Im Menü
   * (Handy) entfällt er, wenn er dasselbe Ziel hat wie der Eintrag selbst.
   */
  alle: KopfUnterweg;
}

/** E-SHELL-004: Vertraulichkeitszusage im Menü und die Pfade, auf denen sie nicht passt (Ausbildung). */
export interface KopfVertraulich {
  text: string;
  ohne: readonly string[];
}

function pfad(pathname: string | null | undefined): string {
  const path = (pathname ?? '/').split(/[?#]/)[0] || '/';
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

/** Die Startseite trägt die Jubiläumsmarke im Einstieg (Ortsmarke); der Kopf wiederholt sie dort nicht. */
export function zeigeMarkeImKopf(pathname: string | null | undefined): boolean {
  return pfad(pathname) !== '/';
}

/** Die Zusage gilt für Fachkräfte im Wechsel, nicht auf den Seiten der Ausbildung. */
export function zeigeVertraulich(vertraulich: KopfVertraulich | null | undefined, pathname: string | null | undefined): boolean {
  if (!vertraulich) return false;
  return !vertraulich.ohne.includes(pfad(pathname));
}
