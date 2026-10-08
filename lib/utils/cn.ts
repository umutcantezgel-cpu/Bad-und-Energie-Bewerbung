import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Custom theme keys from app/styles/theme.css. Without them tailwind-merge reads
 * `text-display` as a color and drops `text-ink` next to it (or vice versa).
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'surface',
        'surface-2',
        'surface-3',
        'ink',
        'ink-muted',
        'line',
        'line-strong',
        'accent',
        'accent-hover',
        'on-accent',
        'focus',
        'success',
        'success-subtle',
        'danger',
        'danger-subtle',
      ],
      text: ['footnote', 'callout', 'body', 'lead', 'title-3', 'title-2', 'title-1', 'display', 'numeral'],
      spacing: ['gutter', 'section', 'section-sm'],
      container: ['prose', 'content', 'wide'],
      ease: ['standard', 'emphasized'],
    },
    classGroups: {
      duration: [{ duration: ['fast', 'step', 'sheet'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
