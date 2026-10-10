import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Custom theme keys from app/styles/theme.css (KERN 1.0). Without them tailwind-merge reads
 * `text-display` as a color and drops `text-ink` next to it (or vice versa), or keeps both
 * `font-mass` and `font-sans`. Every new token name belongs here.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'surface',
        'surface-2',
        'surface-3',
        'surface-raised',
        'ink',
        'ink-muted',
        'ink-2',
        'brand',
        'line',
        'line-strong',
        'accent',
        'accent-hover',
        'accent-press',
        'on-accent',
        'focus',
        'vorlauf',
        'ruecklauf',
        'waerme',
        'wand',
        'plakette',
        'success',
        'success-subtle',
        'danger',
        'danger-subtle',
      ],
      text: ['footnote', 'callout', 'body', 'lead', 'title-3', 'title-2', 'title-1', 'display', 'plakat', 'numeral', 'etikett'],
      font: ['display', 'sans', 'mass'],
      spacing: ['gutter', 'bundsteg', 'paar', 'section', 'section-sm'],
      container: ['prose', 'content', 'wide', 'satz'],
      radius: ['1', '2', '3', 'voll'],
      ease: ['standard', 'emphasized', 'aus', 'wechsel', 'ein'],
    },
    classGroups: {
      duration: [{ duration: ['fast', 'step', 'sheet', 'd1', 'd2', 'd3', 'd4'] }],
      // `ziffer` (theme.css @utility) setzt die Familie: Ziffern in Bricolage im Fließtext
      'font-family': ['ziffer'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
