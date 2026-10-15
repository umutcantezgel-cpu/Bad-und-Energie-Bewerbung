import styles from './zeichnung.module.css';

export interface RohrAkzentProps {
  /** Zusätzliche Klassen (z. B. Lage im Behälter); Grundlage ist die linke Oberkante des nächsten positionierten Vorfahren. */
  className?: string;
}

/**
 * Rohrakzent (E-031, KERN 1.3 K-003.2): ein kurzes Rohrstück in der Linienart leitung (3 px, --m-leitung) mit runden
 * Enden, in der Markenrolle. Es ersetzt die harten 3-px-Oberkanten über Listen und Karten: Statt einer Linie von Rand
 * zu Rand steht oben links ein Stück von --a-8 (64 px), das die Ränder der Karte nicht berührt. Der Behälter trägt
 * `position: relative` und behält seinen Innenabstand; das Stück liegt absolut auf seiner Oberkante und nimmt keinen
 * Platz im Raster. Dekorativ (`aria-hidden`), ohne Bewegung; hell, dunkel, Inverse-Band und Druck über die Rolle --brand.
 */
export function RohrAkzent({ className }: RohrAkzentProps) {
  // Ohne cn(): Die Bewerbungsleiste im Layout (StickyApplyBarClient) zeichnet den Akzent; tailwind-merge bliebe sonst
  // im gemeinsamen Client-Bündel jeder Seite (components/site/index.ts). Die Modulklasse widerspricht keiner Utility.
  return <span aria-hidden="true" data-zeichnung="rohrakzent" className={className ? `${styles.rohrakzent} ${className}` : styles.rohrakzent} />;
}
