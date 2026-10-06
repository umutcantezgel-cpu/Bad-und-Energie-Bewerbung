export const spacingTokens = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '2rem',
  8: '2.5rem',
  9: '3rem',
  10: '4rem',
  11: '5rem',
  12: '6rem',
  13: '8rem',
  section: 'clamp(3rem, 6vw, 6rem)',
  container: 'clamp(1rem, 4vw, 3rem)',
  gap: 'clamp(1rem, 2vw, 1.5rem)',
} as const;

export type SpacingToken = keyof typeof spacingTokens;
