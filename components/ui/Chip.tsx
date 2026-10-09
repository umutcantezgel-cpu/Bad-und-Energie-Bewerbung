import type { ComponentPropsWithRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ChipProps extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  pressed?: boolean;
}

/** Toggle chip (e.g. a filter). Pressed = ink fill with check. */
export function Chip({ pressed = false, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'group inline-flex min-h-11 shrink-0 select-none items-center gap-1.5 rounded-full border border-line-strong px-4',
        'text-callout font-medium text-ink transition duration-fast ease-standard hover:bg-surface-2 active:scale-98',
        'aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-surface',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <Check aria-hidden="true" strokeWidth={2.25} className="hidden size-4 shrink-0 group-aria-pressed:block" />
      {children}
    </button>
  );
}
