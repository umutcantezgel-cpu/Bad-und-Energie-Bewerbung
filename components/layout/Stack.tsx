import React, { createElement, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { spacingTokens, SpacingToken } from '@/lib/tokens/spacing';

export interface StackProps {
  children: ReactNode;
  gap?: SpacingToken;
  as?: ElementType;
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

export function Stack({
  children,
  gap = 4,
  as: Component = 'div',
  align = 'stretch',
  className,
}: StackProps) {
  const alignmentClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align];

  return createElement(
    Component,
    {
      className: cn('flex flex-col', alignmentClass, className),
      style: { gap: spacingTokens[gap] },
    },
    children
  );
}
