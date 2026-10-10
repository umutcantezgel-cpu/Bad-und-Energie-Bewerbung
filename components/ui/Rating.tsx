import { useId } from 'react';
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

/** Star outline (24-unit grid, round joins like the icon family), drawn once per rating and reused via <use>. */
const STAR_PATH =
  'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z';
const STAR = 24;
/** Space between stars in star units: 2px at 16px stars, 2.5px at 20px. */
const GAP = 3;
const STAR_PX = { sm: 16, md: 20 } as const;

/**
 * Static star rating, announced as e.g. "5,0 von 5 Sternen". One inline SVG per rating: the
 * star path sits in <defs> and every star is a <use>, so a page with many cards stays light.
 * Filled stars in Marken-Navy (like the measures), empty ones in the strong line color.
 */
export function Rating({ value, max = 5, size = 'md', showValue = false, className }: RatingProps) {
  const id = useId();
  const starId = `${id}-star`;
  const clipId = `${id}-clip`;
  const label = `${formatRating(value)} von ${max} Sternen`;
  const fills = starFills(value, max);
  const xOf = (i: number) => i * (STAR + GAP);
  const partial = fills.findIndex((fill) => fill > 0 && fill < 1);
  const width = max * STAR + (max - 1) * GAP;
  const px = STAR_PX[size];

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${width} ${STAR}`}
        width={(px * width) / STAR}
        height={px}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <defs>
          <path id={starId} d={STAR_PATH} />
          {partial >= 0 && (
            <clipPath id={clipId}>
              <rect x={xOf(partial)} y={0} width={fills[partial] * STAR} height={STAR} />
            </clipPath>
          )}
        </defs>
        <g className="fill-none stroke-line-strong">
          {fills.map((fill, i) => (fill < 1 ? <use key={i} href={`#${starId}`} x={xOf(i)} /> : null))}
        </g>
        <g className="fill-brand stroke-brand">
          {fills.map((fill, i) =>
            fill > 0 ? (
              <use key={i} href={`#${starId}`} x={xOf(i)} clipPath={fill < 1 ? `url(#${clipId})` : undefined} />
            ) : null,
          )}
        </g>
      </svg>
      {showValue && (
        <span aria-hidden="true" className="text-callout font-semibold tabular-nums text-ink">
          {formatRating(value)}
        </span>
      )}
    </span>
  );
}
