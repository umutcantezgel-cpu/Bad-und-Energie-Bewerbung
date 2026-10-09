import type { ComponentPropsWithRef, MouseEvent } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils/cn';
import { buttonVariants, type ButtonVariantProps } from './variants';

export { buttonVariants, type ButtonVariantProps } from './variants';

export interface ButtonProps extends ComponentPropsWithRef<'button'>, ButtonVariantProps {
  /** Renders the single child (e.g. next/link) with button styles instead of a <button>. */
  asChild?: boolean;
  /**
   * Busy state: keeps the width, shows a spinner and stays focusable. Clicks from pointer and
   * keyboard (Enter/Space, implicit form submit) are cancelled, so the action cannot run twice.
   * Busy state is client state: set it from a Client Component only.
   */
  loading?: boolean;
}

// Cancelling the click also cancels the submit it would trigger for type="submit".
function preventWhileLoading(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

export function Button({
  asChild = false,
  loading = false,
  variant,
  size,
  wrap,
  fullWidth,
  className,
  children,
  type,
  onClick,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, wrap, fullWidth }), className);

  if (asChild) {
    return (
      <Slot className={classes} onClick={onClick} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      {...props}
      type={type ?? 'button'}
      className={classes}
      onClick={loading ? preventWhileLoading : onClick}
      aria-busy={loading || undefined}
      aria-disabled={loading || props['aria-disabled']}
      data-loading={loading || undefined}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto size-5 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      <span className={cn('inline-flex items-center gap-2', loading && 'invisible')}>{children}</span>
    </button>
  );
}
