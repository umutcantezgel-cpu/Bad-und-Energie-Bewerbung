import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './anzeige.module.css';

export interface StatTileProps {
  /** The figure, e.g. "13:30" or "30". */
  value: ReactNode;
  label: ReactNode;
  footnote?: ReactNode;
  /** `lg` uses the numeral scale (32–56px) for a single hero figure. */
  size?: 'md' | 'lg';
  /** Maßkette unter dem Wert (Endstriche und Maßlinie wie im Einstieg); Standard an. */
  kette?: boolean;
  className?: string;
}

/**
 * Maß statt Kachel (KERN K-003 „Eingemessen statt behauptet“): der Wert in Martian Mono und Marken-Navy,
 * darunter die Maßkette in Wertbreite, dann der Name als Etikett in Versalien. Wert und Name bleiben
 * eigene Absätze, damit Screenreader „13:30“ und „Freitags Feierabend“ getrennt lesen.
 */
export function StatTile({ value, label, footnote, size = 'md', kette = true, className }: StatTileProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex w-fit max-w-full flex-col gap-1">
        <p className={cn('font-mass font-semibold text-brand', size === 'lg' ? 'text-numeral' : styles.wertMd)}>{value}</p>
        {kette && <span aria-hidden="true" className={styles.kette} />}
      </div>
      <p className="text-etikett text-ink-2">{label}</p>
      {footnote && <p className="text-footnote text-ink-muted">{footnote}</p>}
    </div>
  );
}
