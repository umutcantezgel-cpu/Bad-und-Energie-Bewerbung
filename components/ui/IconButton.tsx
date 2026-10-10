import type { ComponentPropsWithRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils/cn';
import { iconButtonVariants, type IconButtonVariantProps } from './variants';

export { iconButtonVariants, type IconButtonVariantProps } from './variants';

export interface IconButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'aria-label'>,
    IconButtonVariantProps {
  /** Required: icon-only controls have no visible text. */
  'aria-label': string;
  /** Renders the single child (e.g. a tel: link) with icon button styles. */
  asChild?: boolean;
}

/**
 * 44px (md) or 56px (lg) square button (radius 4) for a single icon from components/icons
 * (size md or lg). Hover and press as an overlay, 1 px down (Register `druck`).
 */
export function IconButton({ asChild = false, variant, size, className, type, ...props }: IconButtonProps) {
  const classes = cn(iconButtonVariants({ variant, size }), className);
  if (asChild) return <Slot data-motion="druck" className={classes} {...props} />;
  return <button data-motion="druck" type={type ?? 'button'} className={classes} {...props} />;
}
