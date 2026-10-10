'use client';

import { createContext, use, useId, type ReactNode } from 'react';
import { Icon } from '@/components/icons';
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

/**
 * Label (always visible), hint, control and error for one form field. The error never relies on
 * colour alone: icon, bold text and the danger contour of the control carry it (KERN K-011).
 */
export function Field({ label, hint, error, optional, required = false, id, className, children }: FieldProps) {
  const autoId = useId();
  const controlId = id ?? `${autoId}-control`;
  const hintId = `${autoId}-hint`;
  const errorId = `${autoId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={controlId} className="text-callout font-bold text-ink">
        {label}
        {optional && <span className="font-normal text-ink-2"> (optional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="-mt-1 text-footnote text-ink-2">
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
        <FieldError id={errorId}>{error}</FieldError>
      )}
    </div>
  );
}

/** Error line below a control: icon and bold text in the danger role (shared by Field and Checkbox). */
export function FieldError({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <p id={id} className={cn('flex items-start gap-2 text-callout font-bold text-danger', className)}>
      <Icon name="circle-alert" size="md" className="mt-0.5" />
      <span>{children}</span>
    </p>
  );
}
