import { googleCustomerReviews, googleOverviewStats, teamRecruitingReviews, type GoogleReview } from '@/lib/data/reviews.data';
import { interleave, type ReviewItem } from './model';

/**
 * Normalizes lib/data/reviews.data.ts for the carousel: quote, name, role and source only.
 * Relative dates ("Vor einem Jahr"), badges and owner replies stay out: they age or add noise.
 */
function toItem(review: GoogleReview): ReviewItem {
  const isTeam = review.verifiedSource === 'Mitarbeiter Stimme';
  return {
    id: review.id,
    kind: isTeam ? 'team' : 'kunde',
    quote: review.text,
    name: review.author,
    role: review.role,
    source: isTeam ? 'Aus dem Team' : 'Google-Bewertung',
    rating: isTeam ? undefined : review.rating,
  };
}

/** "Alle" alternates customer reviews and team voices so both appear in the first cards. */
export const REVIEW_ITEMS: readonly ReviewItem[] = Object.freeze(
  interleave(googleCustomerReviews.map(toItem), teamRecruitingReviews.map(toItem)),
);

function profileUrlOf(stats: object): string | undefined {
  const url = 'profileUrl' in stats ? stats.profileUrl : undefined;
  return typeof url === 'string' && /^https:\/\//.test(url) ? url : undefined;
}

/**
 * Google rating line, exactly as stored in reviews.data.ts. The link appears once a `profileUrl`
 * is added to googleOverviewStats (there is none yet).
 */
export const REVIEW_STATS = Object.freeze({
  averageRating: googleOverviewStats.averageRating,
  totalReviews: googleOverviewStats.totalReviews,
  profileUrl: profileUrlOf(googleOverviewStats),
});
