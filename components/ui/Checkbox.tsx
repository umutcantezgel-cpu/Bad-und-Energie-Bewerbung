import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { joinIds } from './helpers';

export interface CheckboxProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'children'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

/** Native checkbox (24px box) whose label row is the 44px hit area. */
export function Checkbox({
  label,
  hint,
  error,
  id,
  className,
  disabled,
  'aria-describedby': describedBy,
  ...props
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const hintId = `${autoId}-hint`;
  const errorId = `${autoId}-error`;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label
        htmlFor={inputId}
        className={cn('flex min-h-11 cursor-pointer items-start gap-3 py-2.5', disabled && 'cursor-not-allowed opacity-50')}
      >
        <input
          type="checkbox"
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={joinIds(hint && hintId, error && errorId, describedBy)}
          className="size-6 shrink-0 cursor-pointer accent-ink disabled:cursor-not-allowed"
          {...props}
        />
        <span className="text-body text-ink">{label}</span>
      </label>
      {hint && (
        <p id={hintId} className="pl-9 text-footnote text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 pl-9 text-footnote font-medium text-danger">
          <CircleAlert aria-hidden="true" strokeWidth={2} className="mt-px size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
