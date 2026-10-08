import type { ComponentPropsWithRef, MouseEvent } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

export const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold',
    'transition duration-fast ease-standard active:scale-98',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-on-accent hover:bg-accent-hover',
        secondary: 'bg-surface-3 text-ink hover:bg-line',
        outline: 'border border-line-strong text-ink hover:bg-surface-2',
        ghost: 'text-ink hover:bg-surface-2',
        /** Ink fill: navy on light surfaces, white inside the inverse band. */
        contrast: 'bg-ink text-surface hover:bg-ink/90',
        link: 'rounded-xs text-ink underline decoration-1 underline-offset-4 hover:decoration-2',
      },
      size: {
        // 40px visual height; the pseudo element extends the hit area to 44px.
        sm: 'h-10 px-4 text-callout after:absolute after:inset-x-0 after:-inset-y-0.5',
        md: 'h-11 px-5 text-body',
        lg: 'h-13 px-6 text-body',
        xl: 'h-14 px-8 text-body',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'px-0' }],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

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
  fullWidth,
  className,
  children,
  type,
  onClick,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

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
