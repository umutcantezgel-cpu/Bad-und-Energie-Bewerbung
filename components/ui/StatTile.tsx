import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface StatTileProps {
  /** The figure, e.g. "13:30" or "30". */
  value: ReactNode;
  label: ReactNode;
  footnote?: ReactNode;
  /** `lg` uses the numeral scale (48–104px) for a single hero figure. */
  size?: 'md' | 'lg';
  className?: string;
}

/** Typographic key figure: value, label, optional footnote. */
export function StatTile({ value, label, footnote, size = 'md', className }: StatTileProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <p className={cn('tabular-nums text-ink', size === 'lg' ? 'text-numeral' : 'text-title-1')}>{value}</p>
      <p className="text-callout font-medium text-ink">{label}</p>
      {footnote && <p className="text-footnote text-ink-muted">{footnote}</p>}
    </div>
  );
}
