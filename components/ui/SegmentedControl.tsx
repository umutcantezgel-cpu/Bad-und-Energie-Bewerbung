'use client';

import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SegmentedOption<V extends string = string> {
  value: V;
  label: ReactNode;
}

export interface SegmentedControlProps<V extends string = string> {
  legend: ReactNode;
  /** Keeps the legend for screen readers only. */
  hideLegend?: boolean;
  name: string;
  options: readonly SegmentedOption<V>[];
  /** Controlled value; use `defaultValue` for an uncontrolled group. */
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  className?: string;
}

/**
 * Native radio group styled as segments: arrow keys, form submission and
 * screen reader semantics come from the browser. Selected = ink with check.
 */
export function SegmentedControl<V extends string = string>({
  legend,
  hideLegend = false,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  className,
}: SegmentedControlProps<V>) {
  const controlled = value !== undefined;
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className={cn('mb-2 text-callout font-medium text-ink', hideLegend && 'sr-only')}>{legend}</legend>
      <div className="flex gap-1 rounded-full bg-surface-3 p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'group flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-center',
              'text-callout font-medium text-ink-muted transition-colors duration-fast ease-standard hover:text-ink',
              'has-checked:bg-ink has-checked:text-surface',
              'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              className="sr-only"
              {...(controlled ? { checked: value === option.value } : { defaultChecked: defaultValue === option.value })}
              onChange={(event) => {
                if (event.target.checked) onValueChange?.(option.value);
              }}
            />
            <Check aria-hidden="true" strokeWidth={2.25} className="hidden size-4 shrink-0 group-has-checked:block" />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
