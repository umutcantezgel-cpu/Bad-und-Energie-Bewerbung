'use client';

import { createContext, use, useId, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { joinIds } from './helpers';

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldControlProps {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
  'aria-required'?: boolean | 'true' | 'false';
}

/**
 * Wires a control to the surrounding <Field>: id, aria-describedby (hint and
 * error), aria-invalid and aria-required. Explicit props win. Used by Input
 * and Textarea; call it in custom controls too.
 */
export function useFieldControl<P extends FieldControlProps>(props: P): P {
  const field = use(FieldContext);
  if (!field) return props;
  return {
    ...props,
    id: props.id ?? field.id,
    'aria-describedby': joinIds(field.describedBy, props['aria-describedby']),
    'aria-invalid': props['aria-invalid'] ?? (field.invalid || undefined),
    'aria-required': props['aria-required'] ?? (field.required || undefined),
  };
}

export interface FieldProps {
  label: ReactNode;
  /** Help text below the label, linked via aria-describedby. */
  hint?: ReactNode;
  /** Error message below the control; also sets aria-invalid. */
  error?: ReactNode;
  /** Adds "(optional)" to the label. Mark the few optional fields, not the required ones. */
  optional?: boolean;
  /** Sets aria-required on the control (no native validation bubble). */
  required?: boolean;
  /** Control id; generated when omitted. */
  id?: string;
  className?: string;
  children: ReactNode;
}

/** Label (always visible), hint, control and error for one form field. */
export function Field({ label, hint, error, optional, required = false, id, className, children }: FieldProps) {
  const autoId = useId();
  const controlId = id ?? `${autoId}-control`;
  const hintId = `${autoId}-hint`;
  const errorId = `${autoId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={controlId} className="text-callout font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-ink-muted"> (optional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="-mt-1 text-footnote text-ink-muted">
          {hint}
        </p>
      )}
      <FieldContext
        value={{
          id: controlId,
          describedBy: joinIds(hint && hintId, hasError && errorId),
          invalid: hasError,
          required,
        }}
      >
        {children}
      </FieldContext>
      {hasError && (
        <p id={errorId} className="flex items-start gap-1.5 text-footnote font-medium text-danger">
          <CircleAlert aria-hidden="true" strokeWidth={2} className="mt-px size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
