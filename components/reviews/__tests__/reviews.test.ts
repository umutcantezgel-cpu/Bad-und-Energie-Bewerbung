import { describe, expect, it } from 'vitest';
import { googleCustomerReviews, googleOverviewStats, teamRecruitingReviews } from '@/lib/data/reviews.data';
import { REVIEW_ITEMS, REVIEW_STATS } from '../data';
import { REVIEW_FILTERS, filterReviewItems, interleave } from '../model';

describe('review items', () => {
  it('contains every review and team voice exactly once, text unchanged', () => {
    const all = [...googleCustomerReviews, ...teamRecruitingReviews];
    expect(REVIEW_ITEMS).toHaveLength(all.length);
    for (const review of all) {
      const item = REVIEW_ITEMS.find((i) => i.id === review.id);
      expect(item?.quote).toBe(review.text);
      expect(item?.name).toBe(review.author);
    }
  });

  it('splits by source: Google reviews carry stars, team voices do not', () => {
    const kunden = filterReviewItems(REVIEW_ITEMS, 'kunden');
    const team = filterReviewItems(REVIEW_ITEMS, 'team');
    expect(kunden).toHaveLength(googleCustomerReviews.length);
    expect(team).toHaveLength(teamRecruitingReviews.length);
    expect(kunden.every((i) => i.rating === 5 && i.source === 'Google-Bewertung')).toBe(true);
    expect(team.every((i) => i.rating === undefined && i.source === 'Aus dem Team')).toBe(true);
    expect(filterReviewItems(REVIEW_ITEMS, 'alle')).toHaveLength(REVIEW_ITEMS.length);
  });

  it('starts "Alle" with both kinds', () => {
    expect(REVIEW_ITEMS.slice(0, 2).map((i) => i.kind)).toEqual(['kunde', 'team']);
  });

  it('offers the three filters in order', () => {
    expect(REVIEW_FILTERS.map((f) => f.label)).toEqual(['Alle', 'Kunden', 'Team']);
  });

  it('interleave keeps the remainder', () => {
    expect(interleave<number | string>([1, 2, 3, 4], ['a'])).toEqual([1, 'a', 2, 3, 4]);
  });
});

describe('REVIEW_STATS', () => {
  it('uses the stored figures unchanged and has no profile link yet', () => {
    expect(REVIEW_STATS.averageRating).toBe(googleOverviewStats.averageRating);
    expect(REVIEW_STATS.totalReviews).toBe(googleOverviewStats.totalReviews);
    expect(REVIEW_STATS.profileUrl).toBeUndefined();
  });
});
