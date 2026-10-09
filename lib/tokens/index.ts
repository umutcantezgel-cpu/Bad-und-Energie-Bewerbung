/**
 * Design tokens for JS (timers, matchMedia, inline styles). The CSS source of
 * truth is app/styles/theme.css; keep both in sync.
 */
export const TOKENS = {
  /** Milliseconds; CSS: --transition-duration-{fast,step,sheet} / duration-* */
  duration: {
    fast: 150,
    step: 220,
    sheet: 280,
  },
  /** CSS: --ease-{standard,emphasized} / ease-* */
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  },
  /** Press feedback (scale on :active) */
  pressScale: 0.98,
  zIndex: {
    header: 30,
    sticky: 30,
    toast: 50,
  },
  /** Min-widths in px, matching Tailwind's default breakpoints */
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;

export type Breakpoint = keyof typeof TOKENS.breakpoints;

/** Media query for `window.matchMedia`, e.g. `minWidth('lg')`. */
export function minWidth(breakpoint: Breakpoint): string {
  return `(min-width: ${TOKENS.breakpoints[breakpoint]}px)`;
}
