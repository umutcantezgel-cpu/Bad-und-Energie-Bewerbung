import { googleCustomerReviews, googleOverviewStats, type GoogleReview } from '@/lib/data/reviews.data';
import { TEAM_QUOTES, TEAM_QUOTE_IDS, type TeamQuote } from '@/lib/content/team';
import { interleave, type ReviewItem } from './model';

/**
 * Normalizes lib/data/reviews.data.ts for the carousel: quote, name, role and source only.
 * Relative dates ("Vor einem Jahr"), badges and owner replies stay out: they age or add noise.
 */
function fromGoogle(review: GoogleReview): ReviewItem {
  return {
    id: review.id,
    kind: 'kunde',
    quote: review.text,
    name: review.author,
    role: review.role,
    source: 'Google-Bewertung',
    rating: review.rating,
  };
}

function fromTeam(quote: TeamQuote): ReviewItem {
  return { id: `team-${quote.id}`, kind: 'team', quote: quote.quote, name: quote.name, role: quote.role, source: 'Aus dem Team' };
}

/**
 * Team voices: only the four approved quotes from lib/content/team (ROADMAP §1). The
 * „Mitarbeiter Stimme“ entries in reviews.data.ts are not confirmed and stay out
 * (fakten-abgleich.md B22). Sabri Demir's quote leads the „Über uns“ section right above the
 * carousel, so it is not repeated here.
 */
export const TEAM_REVIEW_IDS = TEAM_QUOTE_IDS.filter((id) => id !== 'demir');

/** "Alle" alternates customer reviews and team voices so both appear in the first cards. */
export const REVIEW_ITEMS: readonly ReviewItem[] = Object.freeze(
  interleave(
    googleCustomerReviews.map(fromGoogle),
    TEAM_REVIEW_IDS.map((id) => fromTeam(TEAM_QUOTES[id])),
  ),
);

function httpsUrlOf(stats: object, key: string): string | undefined {
  const url = key in stats ? (stats as Record<string, unknown>)[key] : undefined;
  return typeof url === 'string' && /^https:\/\//.test(url) ? url : undefined;
}

/** `asOf` as „YYYY-MM“ (month the figures were read on the Google profile), otherwise undefined. */
function asOfOf(stats: object): string | undefined {
  const value = 'asOf' in stats ? (stats as Record<string, unknown>).asOf : undefined;
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : undefined;
}

/**
 * Google rating line, exactly as stored in reviews.data.ts. It is shown only once the owner has
 * confirmed the figures by adding `asOf: 'YYYY-MM'` to googleOverviewStats (ROADMAP §13 „Stand der
 * Google-Bewertungen“); the link appears once a `profileUrl` is added. Neither exists yet.
 */
export const REVIEW_STATS = Object.freeze({
  averageRating: googleOverviewStats.averageRating,
  totalReviews: googleOverviewStats.totalReviews,
  profileUrl: httpsUrlOf(googleOverviewStats, 'profileUrl'),
  asOf: asOfOf(googleOverviewStats),
});
