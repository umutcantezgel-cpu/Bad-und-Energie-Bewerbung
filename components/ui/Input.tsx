'use client';

import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldControl } from './Field';

/** 17px on every viewport: never below 16px (iOS zoom), slightly above body text. */
export const CONTROL_FONT_SIZE = '1.0625rem';

/**
 * Control of the form system (R4-UI-01): radius 4, 2 px contour on the raised surface (lighter than
 * a wall section), navy on hover and focus (plus the global 3 px focus ring), danger when invalid,
 * dashed and on the wall when disabled. Hover only with a fine pointer.
 */
export const controlClasses = cn(
  'w-full rounded-1 border-2 border-line-strong bg-surface-raised text-ink placeholder:text-ink-2',
  'transition-colors duration-d1 ease-ein pointer-fine:hover:duration-d2 pointer-fine:hover:ease-aus',
  'pointer-fine:hover:not-aria-invalid:border-brand focus-visible:not-aria-invalid:border-brand',
  'aria-invalid:border-danger',
  'disabled:cursor-not-allowed disabled:border-dashed disabled:bg-surface-2 disabled:text-ink-2',
);

export const controlStyle = (style?: CSSProperties): CSSProperties => ({ fontSize: CONTROL_FONT_SIZE, ...style });

export type InputProps = ComponentPropsWithRef<'input'>;

/** 56px text input (--m-knopf, level with the lg button). Inside a <Field> it picks up id, description and invalid state. */
export function Input({ className, style, type = 'text', ...props }: InputProps) {
  const controlProps = useFieldControl(props);
  return (
    <input
      type={type}
      className={cn(controlClasses, 'h-14 px-4 leading-normal', className)}
      style={controlStyle(style)}
      {...controlProps}
    />
  );
}
