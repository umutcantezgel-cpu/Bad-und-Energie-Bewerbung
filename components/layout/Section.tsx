import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

export type SectionTone = 'default' | 'subtle' | 'inverse';

export interface SectionProps extends ComponentPropsWithRef<'section'> {
  /** `subtle` = surface-2; `inverse` = navy band (data-tone="inverse", light and dark). */
  tone?: SectionTone;
  spacing?: 'default' | 'compact';
}

/**
 * Page band with vertical rhythm. Pair with <Container> and pass
 * `aria-labelledby` (the heading id) so the section becomes a named region.
 */
export function Section({ tone = 'default', spacing = 'default', className, ...props }: SectionProps) {
  return (
    <section
      data-tone={tone === 'inverse' ? 'inverse' : undefined}
      className={cn(
        spacing === 'compact' ? 'py-section-sm' : 'py-section',
        tone === 'subtle' && 'bg-surface-2',
        tone === 'inverse' && 'bg-surface text-ink',
        className,
      )}
      {...props}
    />
  );
}
