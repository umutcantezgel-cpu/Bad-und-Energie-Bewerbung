import type { ComponentPropsWithRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils/cn';

export interface VisuallyHiddenProps extends ComponentPropsWithRef<'span'> {
  /** Hide the single child element (e.g. an <h1>) instead of wrapping it in a <span>. */
  asChild?: boolean;
}

/** Text for screen readers only. */
export function VisuallyHidden({ asChild = false, className, ...props }: VisuallyHiddenProps) {
  const Component = asChild ? Slot : 'span';
  return <Component className={cn('sr-only', className)} {...props} />;
}
