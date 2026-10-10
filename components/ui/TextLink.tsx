import type { ComponentPropsWithRef } from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { isExternalHref } from './helpers';

/**
 * Tertiärweg (Formsystem): Text mit Unterstrich. Hover nur mit Maus (Tailwind hover: = @media (hover: hover)):
 * der Strich wird kräftiger und Rücklaufblau, wie der Zweitweg des Einstiegs. Farbwechsel ohne Übergang
 * (das Register kennt nur transform, opacity und stroke-dashoffset). Fokus über den globalen 3-px-Ring.
 */
export const textLinkVariants = cva(
  'rounded-1 underline decoration-1 underline-offset-4 hover:decoration-2 hover:decoration-ruecklauf',
  {
    variants: {
      tone: {
        ink: 'text-ink',
        muted: 'text-ink-muted hover:text-ink',
        inherit: 'text-inherit',
      },
      /**
       * Standalone links (outside running text) wie der Zweitweg „Offene Stellen ansehen“: fett, Strich 3 px,
       * 44 px hohe Trefferfläche, Druck 1 px (Register „druck“).
       */
      standalone: {
        true: 'inline-flex min-h-11 items-center gap-2 font-bold decoration-(length:--m-strich) underline-offset-[0.25em] hover:decoration-(length:--m-strich)',
      },
    },
    defaultVariants: {
      tone: 'ink',
    },
  },
);

export interface TextLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'href'>, VariantProps<typeof textLinkVariants> {
  href: string;
}

/** Underlined link. Internal paths use next/link; tel:, mailto:, https: and #anchors a plain <a>. */
export function TextLink({ href, tone, standalone, className, ...props }: TextLinkProps) {
  const classes = cn(textLinkVariants({ tone, standalone }), className);
  const motion = standalone ? { 'data-motion': 'druck' } : undefined;
  if (isExternalHref(href)) return <a href={href} className={classes} {...motion} {...props} />;
  return <Link href={href} className={classes} {...motion} {...props} />;
}
