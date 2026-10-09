import { formatRating } from '@/components/ui/helpers';
import { Rating } from '@/components/ui/Rating';
import { TextLink } from '@/components/ui/TextLink';
import { cn } from '@/lib/utils/cn';
import { REVIEW_STATS } from './data';

export interface ReviewSummaryProps {
  className?: string;
}

const count = new Intl.NumberFormat('de-DE');

const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

/** '2026-10' → 'Oktober 2026'. */
export function formatAsOf(asOf: string): string {
  const [year, month] = asOf.split('-').map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

/**
 * Google rating line: stars, "5,0 · 24 Google-Bewertungen · Stand: Oktober 2026" (figures as
 * stored in reviews.data.ts). Renders nothing until the owner has dated the figures (`asOf`).
 */
export function ReviewSummary({ className }: ReviewSummaryProps) {
  const { averageRating, totalReviews, profileUrl, asOf } = REVIEW_STATS;
  if (!asOf) return null;
  const noun = totalReviews === 1 ? 'Google-Bewertung' : 'Google-Bewertungen';

  return (
    <p className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-callout text-ink', className)}>
      <span aria-hidden="true" className="inline-flex">
        <Rating value={averageRating} size="sm" />
      </span>
      {/* tabular-nums on the figures only: Inter's tnum would widen the hyphen in „Google-Bewertungen“. */}
      <span>
        <span className="font-semibold tabular-nums">{formatRating(averageRating)}</span>
        <span className="sr-only"> von 5 Sternen</span>
        <span className="text-ink-muted">
          {' · '}
          <span className="tabular-nums">{count.format(totalReviews)}</span> {noun}
          {' · '}Stand: {formatAsOf(asOf)}
        </span>
      </span>
      {profileUrl && (
        <TextLink href={profileUrl} tone="muted" target="_blank" rel="noopener noreferrer">
          Auf Google ansehen
          <span className="sr-only"> (neuer Tab)</span>
        </TextLink>
      )}
    </p>
  );
}
