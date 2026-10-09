import { REVIEW_ITEMS } from './data';
import type { ReviewFilter } from './model';
import { ReviewScroller } from './ReviewScroller';

export interface ReviewCarouselProps {
  initialFilter?: ReviewFilter;
  className?: string;
}

/**
 * Customer reviews and team voices from lib/data/reviews.data.ts as a calm scroll-snap row with
 * filter chips (Alle · Kunden · Team). Server wrapper: the client only receives the normalized
 * cards. Place it inside a <Container>; below lg the row bleeds into the container's side gutter.
 */
export function ReviewCarousel({ initialFilter = 'alle', className }: ReviewCarouselProps) {
  return <ReviewScroller items={REVIEW_ITEMS} initialFilter={initialFilter} className={className} />;
}
