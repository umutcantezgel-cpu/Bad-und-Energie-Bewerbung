import type { ComponentPropsWithRef } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

export interface ChipProps extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  pressed?: boolean;
}

/**
 * Toggle chip (e.g. a filter), radius 4 with a 2 px contour. Pressed = navy fill with a check, so the
 * state never rests on colour alone; hover (fine pointer) turns the contour navy; press 1 px down
 * (Register `druck`). The change of fill runs in d-2 (≤ 300 ms).
 */
export function Chip({ pressed = false, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      data-motion="druck"
      className={cn(
        'group inline-flex min-h-11 shrink-0 select-none items-center gap-2 rounded-1 border-2 border-line-strong bg-surface-raised px-4',
        'text-callout font-bold text-ink transition-colors duration-d1 ease-ein',
        'pointer-fine:hover:border-brand pointer-fine:hover:duration-d2 pointer-fine:hover:ease-aus',
        'aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-surface',
        'disabled:pointer-events-none disabled:border-dashed disabled:text-ink-2',
        className,
      )}
      {...props}
    >
      <Icon name="check" size="sm" className="hidden group-aria-pressed:block" />
      {children}
    </button>
  );
}
