import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatRating, starFills } from './helpers';

export interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
  /** Shows the number ("5,0") next to the stars. */
  showValue?: boolean;
  className?: string;
}

const STAR_SIZE = { sm: 'size-4', md: 'size-5' } as const;

/** Static star rating, announced as e.g. "5,0 von 5 Sternen". */
export function Rating({ value, max = 5, size = 'md', showValue = false, className }: RatingProps) {
  const label = `${formatRating(value)} von ${max} Sternen`;
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span role="img" aria-label={label} className="inline-flex items-center gap-0.5">
        {starFills(value, max).map((fill, i) => (
          <span key={i} className="relative">
            <Star aria-hidden="true" strokeWidth={1.5} className={cn(STAR_SIZE[size], 'text-line-strong')} />
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star aria-hidden="true" strokeWidth={1.5} className={cn(STAR_SIZE[size], 'fill-current text-ink')} />
              </span>
            )}
          </span>
        ))}
      </span>
      {showValue && (
        <span aria-hidden="true" className="text-callout font-semibold tabular-nums text-ink">
          {formatRating(value)}
        </span>
      )}
    </span>
  );
}
