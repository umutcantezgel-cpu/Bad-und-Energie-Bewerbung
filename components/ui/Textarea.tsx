'use client';

import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldControl } from './Field';
import { controlClasses, controlStyle } from './Input';

export type TextareaProps = ComponentPropsWithRef<'textarea'>;

/** Multi-line text input with the same styling and Field wiring as <Input>. */
export function Textarea({ className, style, rows = 4, ...props }: TextareaProps) {
  const controlProps = useFieldControl(props);
  return (
    <textarea
      rows={rows}
      className={cn(controlClasses, 'min-h-32 resize-y px-4 py-3 leading-normal', className)}
      style={controlStyle(style)}
      {...controlProps}
    />
  );
}
