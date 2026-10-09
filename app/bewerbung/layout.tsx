import type { ReactNode } from 'react';

/**
 * Segment /bewerbung (Flow, Danke-Seite, Mappe). Metadaten und JSON-LD setzt jede Seite selbst:
 * Was hier stünde, erbten /bewerbung/danke und /bewerbung/mappe (Titel, Canonical, WebPage-Knoten).
 * Den Fokus-Modus (Header nur mit Logo und „Abbrechen“, keine Sticky-Bar) steuert die Site-Shell
 * über den Pfad (isFocusMode).
 */
export default function BewerbungLayout({ children }: { children: ReactNode }) {
  return children;
}
