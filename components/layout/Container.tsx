import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

export type ContainerSize = 'prose' | 'content' | 'wide';

const SIZE: Record<ContainerSize, string> = {
  prose: 'max-w-prose',
  content: 'max-w-content',
  wide: 'max-w-wide',
};

export interface ContainerProps extends ComponentPropsWithRef<'div'> {
  /** prose 40rem · content 68rem · wide 80rem (content area, gutters excluded). */
  size?: ContainerSize;
  as?: 'div' | 'header' | 'footer' | 'main' | 'nav';
}

/** Centered column with the fluid side gutter. */
export function Container({ size = 'content', as: Component = 'div', className, ...props }: ContainerProps) {
  return <Component className={cn('mx-auto box-content px-gutter', SIZE[size], className)} {...props} />;
}
