import { formatRating } from '@/components/ui/helpers';
import { Rating } from '@/components/ui/Rating';
import { TextLink } from '@/components/ui/TextLink';
import { cn } from '@/lib/utils/cn';
import { REVIEW_STATS } from './data';

export interface ReviewSummaryProps {
  className?: string;
}

const count = new Intl.NumberFormat('de-DE');

/** Google rating line: stars, "5,0 · 24 Google-Bewertungen" (figures as stored in reviews.data.ts). */
export function ReviewSummary({ className }: ReviewSummaryProps) {
  const { averageRating, totalReviews, profileUrl } = REVIEW_STATS;
  const noun = totalReviews === 1 ? 'Google-Bewertung' : 'Google-Bewertungen';

  return (
    <p className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-callout text-ink', className)}>
      <span aria-hidden="true" className="inline-flex">
        <Rating value={averageRating} size="sm" />
      </span>
      <span className="tabular-nums">
        <span className="font-semibold">{formatRating(averageRating)}</span>
        <span className="sr-only"> von 5 Sternen</span>
        <span className="text-ink-muted">{` · ${count.format(totalReviews)} ${noun}`}</span>
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
