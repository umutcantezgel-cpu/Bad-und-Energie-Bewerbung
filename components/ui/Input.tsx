'use client';

import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldControl } from './Field';

/** 17px on every viewport: never below 16px (iOS zoom), slightly above body text. */
export const CONTROL_FONT_SIZE = '1.0625rem';

export const controlClasses = cn(
  'w-full rounded-sm border border-line-strong bg-surface text-ink placeholder:text-ink-muted',
  'transition-colors duration-fast ease-standard hover:border-ink',
  'aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-50',
);

export const controlStyle = (style?: CSSProperties): CSSProperties => ({ fontSize: CONTROL_FONT_SIZE, ...style });

export type InputProps = ComponentPropsWithRef<'input'>;

/** 52px text input. Inside a <Field> it picks up id, description and invalid state. */
export function Input({ className, style, type = 'text', ...props }: InputProps) {
  const controlProps = useFieldControl(props);
  return (
    <input
      type={type}
      className={cn(controlClasses, 'h-13 px-4 leading-normal', className)}
      style={controlStyle(style)}
      {...controlProps}
    />
  );
}
