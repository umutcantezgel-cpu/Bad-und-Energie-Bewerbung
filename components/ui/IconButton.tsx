import type { ComponentPropsWithRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

export const iconButtonVariants = cva(
  [
    'inline-flex shrink-0 select-none items-center justify-center rounded-full',
    'transition duration-fast ease-standard active:scale-98',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        ghost: 'text-ink hover:bg-surface-2',
        secondary: 'bg-surface-3 text-ink hover:bg-line',
        outline: 'border border-line-strong text-ink hover:bg-surface-2',
        primary: 'bg-accent text-on-accent hover:bg-accent-hover',
      },
      size: {
        md: 'size-11',
        lg: 'size-13',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  },
);

export interface IconButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'aria-label'>,
    VariantProps<typeof iconButtonVariants> {
  /** Required: icon-only controls have no visible text. */
  'aria-label': string;
  /** Renders the single child (e.g. a tel: link) with icon button styles. */
  asChild?: boolean;
}

/** 44px (md) or 52px (lg) round button for a single lucide icon (size-5 or size-6). */
export function IconButton({ asChild = false, variant, size, className, type, ...props }: IconButtonProps) {
  const classes = cn(iconButtonVariants({ variant, size }), className);
  if (asChild) return <Slot className={classes} {...props} />;
  return <button type={type ?? 'button'} className={classes} {...props} />;
}
