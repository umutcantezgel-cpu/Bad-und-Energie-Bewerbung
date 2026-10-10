import styles from './kopf.module.css';

export interface MenueZeichenProps {
  /** zu: drei Striche (Menüknopf im Kopf) · offen: das X (Schließen im Menü, entsteht aus den Strichen). */
  zustand: 'zu' | 'offen';
}

/**
 * E-SHELL-011: Menüzeichen im Formsystem (Raster 24, Strich 3 px, runde Enden). Im offenen Menü
 * drehen sich die Striche zum X (Kennung `menue-oeffnen`, d-2); bei reduzierter Bewegung steht das X
 * sofort. Inline-SVG unter 1,5 KB, dekorativ (der Knopf trägt den Namen).
 */
export function MenueZeichen({ zustand }: MenueZeichenProps) {
  return (
    <svg
      className={styles.zeichen}
      data-zustand={zustand}
      viewBox="0 0 24 24"
      width={24}
      height={24}
      aria-hidden="true"
      focusable="false"
    >
      <line className={styles.strichOben} data-motion="menue-oeffnen" x1="4" y1="7" x2="20" y2="7" />
      <line className={styles.strichMitte} data-motion="menue-oeffnen" x1="4" y1="12" x2="20" y2="12" />
      <line className={styles.strichUnten} data-motion="menue-oeffnen" x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}
