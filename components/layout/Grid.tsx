import React, { createElement, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { spacingTokens, SpacingToken } from '@/lib/tokens/spacing';

export interface GridProps {
  children: ReactNode;
  as?: ElementType;
  columns?: number;
  gap?: SpacingToken;
  rowGap?: SpacingToken;
  columnGap?: SpacingToken;
  minItemWidth?: string;
  className?: string;
}

export function Grid({
  children,
  as: Component = 'div',
  columns,
  gap = 6,
  rowGap,
  columnGap,
  minItemWidth,
  className,
}: GridProps) {
  const gridTemplateColumns = minItemWidth
    ? `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
    : columns
      ? `repeat(${columns}, minmax(0, 1fr))`
      : undefined;

  return createElement(
    Component,
    {
      className: cn('grid', className),
      style: {
        gap: gap ? spacingTokens[gap] : undefined,
        rowGap: rowGap ? spacingTokens[rowGap] : undefined,
        columnGap: columnGap ? spacingTokens[columnGap] : undefined,
        gridTemplateColumns,
      },
    },
    children
  );
}
