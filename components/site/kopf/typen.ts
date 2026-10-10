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
