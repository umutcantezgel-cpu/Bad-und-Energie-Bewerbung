import type { ComponentPropsWithRef, HTMLAttributes } from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { isExternalHref } from './helpers';

export const cardVariants = cva('rounded-lg bg-surface-2 text-ink', {
  variants: {
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-6 md:p-8',
    },
    /** Whole card is clickable through a <CardLink> inside it. */
    interactive: {
      true: 'relative transition-colors duration-fast ease-standard hover:bg-surface-3',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

type CardElement = 'div' | 'article' | 'li' | 'section';

export interface CardProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof cardVariants> {
  as?: CardElement;
}

/**
 * Flat card on surface-2. For a clickable card set `interactive` and put one
 * <CardLink> (usually the title) inside; its ::after stretches over the card.
 */
export function Card({ as: Component = 'div', padding, interactive, className, ...props }: CardProps) {
  return <Component className={cn(cardVariants({ padding, interactive }), className)} {...props} />;
}

export interface CardLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'href'> {
  href: string;
}

/** The card's primary link. Focus ring and hit area cover the whole card. */
export function CardLink({ href, className, ...props }: CardLinkProps) {
  const classes = cn(
    'after:absolute after:inset-0 after:rounded-lg focus-visible:outline-hidden',
    'focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus',
    className,
  );
  if (isExternalHref(href)) return <a href={href} className={classes} {...props} />;
  return <Link href={href} className={classes} {...props} />;
}
