import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

export type TagProps = ComponentPropsWithRef<'span'>;

/** Small neutral label for meta facts (e.g. "Vollzeit"). Not interactive. */
export function Tag({ className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-3 py-1 text-footnote font-medium text-ink',
        className,
      )}
      {...props}
    />
  );
}
