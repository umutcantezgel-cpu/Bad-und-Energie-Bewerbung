import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

export type ProseProps = ComponentPropsWithRef<'div'>;

/**
 * Long-form text (Datenschutz, Impressum). Colors come from the `prose`
 * utility in globals.css; sizes and weights are mapped to the type scale here.
 */
export function Prose({ className, ...props }: ProseProps) {
  return (
    <div
      className={cn(
        'prose max-w-prose text-body text-ink',
        'prose-headings:font-semibold',
        'prose-h1:text-title-1 prose-h2:text-title-2 prose-h3:text-title-3 prose-h4:text-body',
        'prose-strong:font-semibold prose-th:font-semibold',
        'prose-a:font-medium prose-a:decoration-1 prose-a:underline-offset-4 prose-a:hover:decoration-2',
        'prose-code:font-sans prose-pre:font-sans',
        className,
      )}
      {...props}
    />
  );
}
