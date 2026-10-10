import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { FieldError } from './Field';
import { joinIds } from './helpers';

export interface CheckboxProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'children'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

/**
 * Native checkbox drawn in the form system: a 24px box with the 3 px navy contour (radius 4), filled
 * navy with a cream check when ticked; the label row is the 44px hit area. Focus ring from globals,
 * press 1 px down (Register `druck`), hover only with a fine pointer.
 */
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
        className={cn('flex min-h-11 cursor-pointer items-start gap-3 py-2.5', disabled && 'cursor-not-allowed')}
      >
        <span className="mt-px grid shrink-0 place-items-center">
          <input
            type="checkbox"
            id={inputId}
            disabled={disabled}
            data-motion="druck"
            aria-invalid={error ? true : undefined}
            aria-describedby={joinIds(hint && hintId, error && errorId, describedBy)}
            className={cn(
              'peer col-start-1 row-start-1 size-6 cursor-pointer appearance-none rounded-1 border-3 border-brand bg-surface-raised',
              'transition-colors duration-d1 ease-ein checked:bg-brand pointer-fine:hover:not-checked:bg-surface-3',
              'aria-invalid:border-danger',
              'disabled:cursor-not-allowed disabled:border-dashed disabled:border-line-strong disabled:checked:bg-line-strong',
            )}
            {...props}
          />
          <Icon
            name="check"
            size="sm"
            className="pointer-events-none col-start-1 row-start-1 text-surface opacity-0 peer-checked:opacity-100"
          />
        </span>
        <span className={cn('text-body', disabled ? 'text-ink-2' : 'text-ink')}>{label}</span>
      </label>
      {hint && (
        <p id={hintId} className="pl-9 text-footnote text-ink-2">
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId} className="pl-9">{error}</FieldError>}
    </div>
  );
}
