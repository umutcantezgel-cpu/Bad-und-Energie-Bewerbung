import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface EtikettkastenProps {
  /** Beschriftung in Versalien (text-etikett), z. B. „Wärmepumpen“, „Heizungen“, „Bäder“. */
  children: ReactNode;
  /** Familien-Icon (components/icons FAMILIE: waermepumpe, flamme, tropfen …), ab md. */
  icon?: IconName;
  className?: string;
}

/**
 * Etiketten-Kästchen an der Zeichnung (Variante 3: „WÄRMEPUMPEN“, „HEIZUNGEN“, „BÄDER“): Rahmen 3 px in
 * der Markenrolle, Fläche der Umgebung, Icon der eigenen Familie davor. Lage setzt der Aufrufer
 * (z. B. absolut über einer Zeichnung). Das Icon ist dekorativ, die Beschriftung ist Text.
 */
export function Etikettkasten({ children, icon, className }: EtikettkastenProps) {
  return (
    <span className={cn(styles.kasten, 'text-etikett text-brand rounded-1', className)} data-zeichnung="etikettkasten">
      {icon ? <Icon name={icon} size="md" className={styles.kastenIkon} /> : null}
      <span>{children}</span>
    </span>
  );
}
