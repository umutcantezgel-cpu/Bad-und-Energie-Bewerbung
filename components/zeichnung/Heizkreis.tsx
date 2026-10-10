import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface HeizkreisProps {
  /** Die große Zahl im Kreis (Martian Mono), z. B. „13:30“ oder eine Gehaltsspanne „3.600–4.600 €“. */
  wert: ReactNode;
  /** Name unter der Zahl in Versalien, z. B. „Freitags Feierabend“, „Brutto im Monat“. */
  name?: ReactNode;
  /** `gross` für den Kopf einer Erzählseite, `mittel` für Abschnitte und schmale Flächen. */
  groesse?: 'mittel' | 'gross';
  className?: string;
}

/**
 * Heizkreis (Variante 2, „Schleife um 13:30“): Der Vorlauf läuft oben um die Zahl, der Rücklauf unten zurück;
 * rechts schließen sich beide, links liegen Zu- und Abgang im Paarabstand (--paar) nebeneinander. Die Zahl
 * ist echter Text; die Leitungen sind CSS-Rahmen (3 px, --radius-3) und wachsen mit dem Inhalt, auch wenn
 * eine Gehaltsspanne am Halbgeviertstrich umbricht. Ohne Bewegung, für hell, dunkel, Inverse-Band und Druck.
 */
export function Heizkreis({ wert, name, groesse = 'mittel', className }: HeizkreisProps) {
  return (
    <span className={cn(styles.heizkreis, groesse === 'gross' && styles.hkGross, className)} data-zeichnung="heizkreis">
      <span className={styles.hkVorlauf} aria-hidden="true" />
      <span className={styles.hkRuecklauf} aria-hidden="true" />
      <span className={cn(styles.hkWert, 'font-mass text-brand')}>{wert}</span>
      {name ? (
        <>
          {' '}
          <span className={cn(styles.hkName, 'text-etikett text-ink-2')}>{name}</span>
        </>
      ) : null}
    </span>
  );
}
