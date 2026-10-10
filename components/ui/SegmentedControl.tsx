'use client';

import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
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
 * screen reader semantics come from the browser. Drawn like the radius switch of the start page
 * (components/maps): 2 px navy contour, radius 12 at the ends; selected = navy fill with a check
 * (dark/inverse: cream), so the state never rests on colour alone. Each segment carries its own
 * contour, so nothing clips the 3 px focus ring. The fill changes in d-2 (≤ 300 ms, E-BEW-003),
 * press 1 px down (Register `druck`), hover only with a fine pointer.
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
      <legend className={cn('mb-2 text-callout font-bold text-ink', hideLegend && 'sr-only')}>{legend}</legend>
      <div className="flex">
        {options.map((option) => (
          <label
            key={option.value}
            data-motion="druck"
            className={cn(
              'group relative flex min-h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 px-1.5 py-2 text-center',
              'border-2 border-brand bg-surface-raised not-first:-ml-0.5 first:rounded-l-2 last:rounded-r-2',
              'text-callout font-bold text-brand transition-colors duration-d1 ease-ein',
              'pointer-fine:hover:not-has-checked:bg-surface-3 pointer-fine:hover:duration-d2 pointer-fine:hover:ease-aus',
              'has-checked:bg-brand has-checked:text-surface has-checked:duration-d2 has-checked:ease-aus',
              'has-focus-visible:z-10 has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-focus',
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
            <Icon name="check" size="sm" className="hidden group-has-checked:block" />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
