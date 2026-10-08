import { describe, expect, it } from 'vitest';
import { formatRating, isExternalHref, joinIds, starFills, stepProgress } from '../helpers';
import { buttonVariants } from '../Button';
import { cn } from '@/lib/utils/cn';

describe('isExternalHref', () => {
  it.each([
    ['https://wa.me/49644142956', true],
    ['tel:+49644142956', true],
    ['mailto:info@example.de', true],
    ['//cdn.example.de/x', true],
    ['#faq', true],
    ['/jobs/anlagenmechaniker-shk', false],
    ['/bewerbung?stelle=x#kontakt', false],
    ['jobs', false],
  ])('%s → %s', (href, expected) => {
    expect(isExternalHref(href)).toBe(expected);
  });
});

describe('formatRating', () => {
  it('uses a German decimal comma with one digit', () => {
    expect(formatRating(5)).toBe('5,0');
    expect(formatRating(4.86)).toBe('4,9');
  });
});

describe('starFills', () => {
  it('fills whole and partial stars', () => {
    expect(starFills(5)).toEqual([1, 1, 1, 1, 1]);
    expect(starFills(3.5)).toEqual([1, 1, 1, 0.5, 0]);
    expect(starFills(0, 3)).toEqual([0, 0, 0]);
  });

  it('clamps out-of-range and invalid values', () => {
    expect(starFills(7)).toEqual([1, 1, 1, 1, 1]);
    expect(starFills(-1, 2)).toEqual([0, 0]);
    expect(starFills(Number.NaN, 2)).toEqual([0, 0]);
  });
});

describe('stepProgress', () => {
  it('returns the completed share, clamped to 0–1', () => {
    expect(stepProgress(1, 4)).toBe(0.25);
    expect(stepProgress(4, 4)).toBe(1);
    expect(stepProgress(6, 4)).toBe(1);
    expect(stepProgress(1, 0)).toBe(0);
  });
});

describe('joinIds', () => {
  it('drops empty and non-string entries', () => {
    expect(joinIds('a-hint', false, undefined, '', 'a-error')).toBe('a-hint a-error');
    expect(joinIds(undefined, null)).toBeUndefined();
  });
});

describe('buttonVariants', () => {
  it('keeps the pill shape and accent fill for primary', () => {
    const classes = buttonVariants().split(' ');
    expect(classes).toEqual(expect.arrayContaining(['rounded-full', 'bg-accent', 'text-on-accent', 'h-11']));
  });

  it('lets cn() resolve conflicting type and color utilities', () => {
    const merged = cn(buttonVariants({ variant: 'link', size: 'lg' }), 'text-callout').split(' ');
    expect(merged).toEqual(expect.arrayContaining(['text-ink', 'text-callout', 'px-0']));
    expect(merged).not.toContain('text-body');
    expect(merged).not.toContain('px-6');
  });
});
