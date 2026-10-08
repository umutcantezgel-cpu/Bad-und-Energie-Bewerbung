import { describe, expect, it } from 'vitest';
import { googleCustomerReviews, googleOverviewStats, teamRecruitingReviews } from '@/lib/data/reviews.data';
import { TEAM_QUOTES } from '@/lib/content/team';
import { REVIEW_ITEMS, REVIEW_STATS, TEAM_REVIEW_IDS } from '../data';
import { REVIEW_FILTERS, filterReviewItems, interleave } from '../model';
import { formatAsOf } from '../ReviewSummary';

describe('review items', () => {
  it('contains every Google review exactly once, text unchanged', () => {
    for (const review of googleCustomerReviews) {
      const matches = REVIEW_ITEMS.filter((i) => i.id === review.id);
      expect(matches).toHaveLength(1);
      expect(matches[0].quote).toBe(review.text);
      expect(matches[0].name).toBe(review.author);
    }
  });

  it('team voices come only from the approved quotes, without the section quote of Sabri Demir', () => {
    const team = filterReviewItems(REVIEW_ITEMS, 'team');
    expect(TEAM_REVIEW_IDS).toEqual(['koch', 'becker', 'weber']);
    expect(team.map((i) => i.quote)).toEqual(TEAM_REVIEW_IDS.map((id) => TEAM_QUOTES[id].quote));
    expect(team.map((i) => i.name)).toEqual(['Alexander Koch', 'Marc Becker', 'Jonas Weber']);
    // Unconfirmed „Mitarbeiter Stimme“ entries (fakten-abgleich.md B22) never reach the page.
    for (const unconfirmed of teamRecruitingReviews) {
      expect(REVIEW_ITEMS.some((i) => i.id === unconfirmed.id || i.quote === unconfirmed.text)).toBe(false);
    }
    expect(REVIEW_ITEMS).toHaveLength(googleCustomerReviews.length + TEAM_REVIEW_IDS.length);
  });

  it('splits by source: Google reviews carry stars, team voices do not', () => {
    const kunden = filterReviewItems(REVIEW_ITEMS, 'kunden');
    const team = filterReviewItems(REVIEW_ITEMS, 'team');
    expect(kunden).toHaveLength(googleCustomerReviews.length);
    expect(team).toHaveLength(TEAM_REVIEW_IDS.length);
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
  it('uses the stored figures unchanged; no profile link and no date yet, so the line stays hidden', () => {
    expect(REVIEW_STATS.averageRating).toBe(googleOverviewStats.averageRating);
    expect(REVIEW_STATS.totalReviews).toBe(googleOverviewStats.totalReviews);
    expect(REVIEW_STATS.profileUrl).toBeUndefined();
    expect(REVIEW_STATS.asOf).toBeUndefined();
  });

  it('formats the date of the figures', () => {
    expect(formatAsOf('2026-10')).toBe('Oktober 2026');
    expect(formatAsOf('2027-01')).toBe('Januar 2027');
  });
});
