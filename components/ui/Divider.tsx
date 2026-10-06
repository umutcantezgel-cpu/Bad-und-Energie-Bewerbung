import React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

const spacingClassesHorizontal = {
  none: 'my-0',
  sm: 'my-4',
  md: 'my-8',
  lg: 'my-12',
};

const spacingClassesVertical = {
  none: 'mx-0',
  sm: 'mx-4',
  md: 'mx-8',
  lg: 'mx-12',
};

export function Divider({
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
  color = 'bg-slate-200',
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('w-px h-full', color, spacingClassesVertical[spacing], className)}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return (
    <div
      className={cn('h-px w-full', color, spacingClassesHorizontal[spacing], className)}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
