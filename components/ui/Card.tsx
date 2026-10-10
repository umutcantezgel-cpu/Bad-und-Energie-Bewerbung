import type { ComponentPropsWithRef, HTMLAttributes } from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { isExternalHref } from './helpers';

/**
 * Flächen des Formsystems (K-008): Tiefe nur über Flächen, Radius 12 (--r-2), kein Schatten.
 * - wand (Standard): Wand auf Papier
 * - papier: Papier, z. B. auf einem Wand-Abschnitt
 * - rahmen: Papier mit Navy-Kontur im Strich (wie das Paket der Startseite und die Etiketten an der Zeichnung)
 * - waerme: warme Fläche (Hausfüllung), für den einen hervorgehobenen Inhalt
 */
export const cardVariants = cva('rounded-2 text-ink', {
  variants: {
    tone: {
      wand: 'bg-surface-2',
      papier: 'bg-surface',
      rahmen: 'border-(length:--m-strich) border-brand bg-surface',
      waerme: 'bg-waerme',
    },
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-6 md:p-8',
    },
    /** Whole card is clickable through a <CardLink> inside it. */
    interactive: {
      true: 'relative',
    },
  },
  // Hover nur bei Maus (Tailwind hover: = @media (hover: hover)); Druck über data-motion="druck"
  compoundVariants: [
    { interactive: true, tone: 'wand', class: 'hover:bg-surface-3' },
    { interactive: true, tone: ['papier', 'rahmen', 'waerme'], class: 'hover:bg-surface-2' },
  ],
  defaultVariants: {
    tone: 'wand',
    padding: 'md',
  },
});

type CardElement = 'div' | 'article' | 'li' | 'section';

export interface CardProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof cardVariants> {
  as?: CardElement;
}

/**
 * Flat card. For a clickable card set `interactive` and put one <CardLink> (usually the title) inside;
 * its ::after stretches over the card. Interactive cards give the 1-px press feedback (Register „druck“).
 */
export function Card({ as: Component = 'div', tone, padding, interactive, className, ...props }: CardProps) {
  return (
    <Component
      data-motion={interactive ? 'druck' : undefined}
      className={cn(cardVariants({ tone, padding, interactive }), className)}
      {...props}
    />
  );
}

export interface CardLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'href'> {
  href: string;
}

/** The card's primary link. Focus ring (3 px, Rücklaufblau) and hit area cover the whole card. */
export function CardLink({ href, className, ...props }: CardLinkProps) {
  const classes = cn(
    'after:absolute after:inset-0 after:rounded-2 focus-visible:outline-hidden',
    'focus-visible:after:outline-3 focus-visible:after:outline-offset-3 focus-visible:after:outline-focus',
    className,
  );
  if (isExternalHref(href)) return <a href={href} className={classes} {...props} />;
  return <Link href={href} className={classes} {...props} />;
}
