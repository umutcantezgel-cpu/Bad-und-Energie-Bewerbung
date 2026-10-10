import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { googleCustomerReviews, googleOverviewStats, teamRecruitingReviews } from '@/lib/data/reviews.data';
import { TEAM_QUOTES } from '@/lib/content/team';
import { REVIEW_ITEMS, REVIEW_STATS, TEAM_REVIEW_IDS } from '../data';
import { REVIEW_FILTERS, filterReviewItems, interleave, replyTitle } from '../model';
import { ReviewCarousel } from '../ReviewCarousel';
import { formatAsOf } from '../ReviewSummary';

const unescape = (html: string) =>
  html
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
const plain = (html: string) => unescape(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');

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

describe('owner replies (E-START-043)', () => {
  const withReply = googleCustomerReviews.filter((review) => review.ownerResponse);

  it('carries every Google owner reply word for word, author included, and nothing else', () => {
    expect(withReply.length).toBeGreaterThan(0);
    for (const review of googleCustomerReviews) {
      const item = REVIEW_ITEMS.find((i) => i.id === review.id)!;
      if (review.ownerResponse) {
        expect(item.reply).toEqual({ author: review.ownerResponse.author, text: review.ownerResponse.text });
      } else {
        expect(item.reply).toBeUndefined();
      }
    }
    expect(filterReviewItems(REVIEW_ITEMS, 'team').every((i) => i.reply === undefined)).toBe(true);
  });

  it('keeps relative dates out („Vor einem Jahr“ ages)', () => {
    expect(JSON.stringify(REVIEW_ITEMS)).not.toMatch(/Vor (einem|\d+) (Jahr|Monat|Woche|Tag)/);
  });

  it('labels the toggle without repeating the owner name on every card', () => {
    expect(replyTitle('Sabri Demir (Inhaber)')).toBe('Antwort des Inhabers');
    expect(replyTitle('Jemand anderes')).toBe('Antwort von Jemand anderes');
  });
});

describe('ReviewCarousel markup (E-START-043, -044, -046)', () => {
  const html = renderToStaticMarkup(createElement(ReviewCarousel, { initialFilter: 'alle' }));
  const text = plain(html);

  it('renders all ten customer quotes word for word and the three approved team voices', () => {
    expect(html.match(/<li\b/g)).toHaveLength(googleCustomerReviews.length + TEAM_REVIEW_IDS.length);
    for (const review of googleCustomerReviews) expect(text).toContain(`„${review.text}“`);
    for (const id of TEAM_REVIEW_IDS) expect(text).toContain(TEAM_QUOTES[id].name);
    expect(html).not.toContain('Mitarbeiter Stimme');
    for (const unconfirmed of teamRecruitingReviews) expect(text).not.toContain(unconfirmed.author);
  });

  it('shows each owner reply in a native <details> (works without JavaScript)', () => {
    const replies = googleCustomerReviews.filter((r) => r.ownerResponse);
    expect(html.match(/<details\b/g)).toHaveLength(replies.length);
    expect(html.match(/<summary\b/g)).toHaveLength(replies.length);
    for (const review of replies) expect(text).toContain(`„${review.ownerResponse!.text}“`);
    expect(html).not.toMatch(/<details[^>]*\sopen/);
  });

  it('has a focusable, labelled row with arrows, a visible count and a polite live status', () => {
    expect(html).toMatch(/<ul[^>]*role="list"[^>]*tabindex="0"[^>]*aria-label="Stimmen von Kunden und Team"/);
    expect(html).toContain('aria-label="Vorherige Stimme"');
    expect(html).toContain('aria-label="Nächste Stimme"');
    expect(html).toContain('aria-live="polite"');
    expect(text).toContain(`01 / ${REVIEW_ITEMS.length}`);
  });

  it('never moves on its own and uses the own icon family (no autoplay, no timers that scroll, no lucide)', () => {
    const source = readFileSync(path.resolve(__dirname, '../ReviewScroller.tsx'), 'utf8');
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/setInterval|autoplay|requestAnimationFrame\(\s*(?:tick|loop|step)/i);
    expect(source).not.toContain('lucide-react');
    // Reduced motion: no glide after a throw, the next card stands at once.
    expect(source).toContain("prefers-reduced-motion: reduce");
    expect(source).toMatch(/behavior: sofort \? 'instant' : 'smooth'/);
    // Keyboard: arrows, Home and End on the focused row.
    for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) expect(source).toContain(`'${key}'`);
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
