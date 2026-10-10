import type { ComponentPropsWithRef, MouseEvent } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils/cn';
import { buttonVariants, type ButtonVariantProps } from './variants';
import styles from './eingabe.module.css';

export { buttonVariants, type ButtonVariantProps } from './variants';

export interface ButtonProps extends ComponentPropsWithRef<'button'>, ButtonVariantProps {
  /** Renders the single child (e.g. next/link) with button styles instead of a <button>. */
  asChild?: boolean;
  /**
   * Busy state: keeps the width, shows a running line (Register `fortschritt`, after 320 ms) and
   * stays focusable. Clicks from pointer and keyboard (Enter/Space, implicit form submit) are
   * cancelled, so the action cannot run twice. Busy state is client state: set it from a Client
   * Component only.
   */
  loading?: boolean;
}

// Cancelling the click also cancels the submit it would trigger for type="submit".
function preventWhileLoading(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

/**
 * Button of the form system (R4-UI-01). `primary` is the red „Jetzt bewerben“ of the Einstieg;
 * `secondary` the navy contour; `link` the underlined tertiary action. Every state carries the
 * motion id `druck` (overlay on hover and press, 1 px down); pass `data-motion` to override.
 */
export function Button({
  asChild = false,
  loading = false,
  variant,
  size,
  wrap,
  fullWidth,
  leitung,
  className,
  children,
  type,
  onClick,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, wrap, fullWidth, leitung }), className);

  if (asChild) {
    return (
      <Slot data-motion="druck" className={classes} onClick={onClick} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      data-motion="druck"
      {...props}
      type={type ?? 'button'}
      className={classes}
      onClick={loading ? preventWhileLoading : onClick}
      aria-busy={loading || props['aria-busy'] || undefined}
      aria-disabled={loading || props['aria-disabled']}
      data-loading={loading || undefined}
    >
      {loading && (
        <span aria-hidden="true" className={styles.laden}>
          <span className={styles.strich} data-motion="fortschritt" />
        </span>
      )}
      <span className={cn('inline-flex items-center gap-3', loading && 'invisible')}>{children}</span>
    </button>
  );
}
