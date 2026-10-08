import type { ComponentPropsWithRef } from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { isExternalHref } from './helpers';

export const textLinkVariants = cva(
  'rounded-xs underline decoration-1 underline-offset-4 transition-colors duration-fast ease-standard hover:decoration-2',
  {
    variants: {
      tone: {
        ink: 'text-ink',
        muted: 'text-ink-muted hover:text-ink',
        inherit: 'text-inherit',
      },
      /** Standalone links (outside running text) get a 44px tall hit area. */
      standalone: {
        true: 'inline-flex min-h-11 items-center gap-1.5 font-medium',
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
  if (isExternalHref(href)) return <a href={href} className={classes} {...props} />;
  return <Link href={href} className={classes} {...props} />;
}
