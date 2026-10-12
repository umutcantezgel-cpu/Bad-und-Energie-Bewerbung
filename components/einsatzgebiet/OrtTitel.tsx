import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './einsatzgebiet.module.css';
import { titelTeilen } from './titel';

export interface OrtTitelProps {
  /** Die ganze h1 (Metadaten, Gate U8). */
  h1: string;
  /** Der Teil in Bildgröße: Orts- oder Kreisname, „Unser Einsatzgebiet:“. */
  name: string;
}

/**
 * Inhalt der h1 im Seitenkopf: „SHK-Jobs für“ klein, „Herborn“ in Bildgröße. Die Größe des Namens folgt seinem
 * breitesten Stück (titel.ts), damit er bei 320 px in der Spalte bleibt und nie mitten im Wort bricht. Der Text der
 * h1 bleibt wörtlich (Leerzeichen zwischen den Teilen).
 */
export function OrtTitel({ h1, name }: OrtTitelProps) {
  const teile = titelTeilen(h1, name);
  return (
    <>
      {teile.vor ? (
        <>
          <span className={cn(styles.titelKlein, styles.titelVor)}>{teile.vor}</span>{' '}
        </>
      ) : null}
      <span className={styles.titelName} style={{ '--stueck': teile.stueckEm.toFixed(3) } as CSSProperties}>
        {teile.haupt}
      </span>
      {teile.nach ? (
        <>
          {' '}
          <span className={cn(styles.titelKlein, styles.titelNach)}>{teile.nach}</span>
        </>
      ) : null}
    </>
  );
}
