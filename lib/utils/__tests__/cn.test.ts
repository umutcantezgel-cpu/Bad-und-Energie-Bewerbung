import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils/cn';

describe('cn', () => {
  it('keeps a semantic text color next to a custom font size', () => {
    expect(cn('text-ink', 'text-display')).toBe('text-ink text-display');
    expect(cn('text-title-2', 'text-ink-muted')).toBe('text-title-2 text-ink-muted');
  });

  it('lets the last custom font size win', () => {
    expect(cn('text-body', 'text-lead')).toBe('text-lead');
    expect(cn('text-footnote', 'text-sm', 'text-numeral')).toBe('text-numeral');
  });

  it('lets the last semantic color win', () => {
    expect(cn('text-ink', 'text-ink-muted')).toBe('text-ink-muted');
    expect(cn('bg-surface', 'bg-surface-2')).toBe('bg-surface-2');
    expect(cn('bg-surface-2 hover:bg-surface-3', 'bg-surface-raised hover:bg-line')).toBe('bg-surface-raised hover:bg-line');
    expect(cn('bg-accent', 'hover:bg-accent-hover', 'bg-surface')).toBe('hover:bg-accent-hover bg-surface');
    expect(cn('border-line', 'border-line-strong')).toBe('border-line-strong');
  });

  it('merges custom spacing, containers, easing and durations', () => {
    expect(cn('px-4', 'px-gutter')).toBe('px-gutter');
    expect(cn('py-section', 'py-section-sm')).toBe('py-section-sm');
    expect(cn('max-w-content', 'max-w-prose')).toBe('max-w-prose');
    expect(cn('ease-in', 'ease-standard')).toBe('ease-standard');
    expect(cn('duration-150', 'duration-step')).toBe('duration-step');
  });

  it('still handles conditional inputs', () => {
    expect(cn('text-ink', false && 'hidden', undefined, { 'text-display': true })).toBe('text-ink text-display');
  });
});
