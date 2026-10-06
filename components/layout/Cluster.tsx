import React, { createElement, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { spacingTokens, SpacingToken } from '@/lib/tokens/spacing';

export interface ClusterProps {
  children: ReactNode;
  gap?: SpacingToken;
  rowGap?: SpacingToken;
  columnGap?: SpacingToken;
  as?: ElementType;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  className?: string;
}

export function Cluster({
  children,
  gap = 4,
  rowGap,
  columnGap,
  as: Component = 'div',
  align = 'center',
  justify = 'start',
  wrap = 'wrap',
  className,
}: ClusterProps) {
  const alignmentClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  }[align];

  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }[justify];

  const wrapClass = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse',
  }[wrap];

  return createElement(
    Component,
    {
      className: cn('flex', alignmentClass, justifyClass, wrapClass, className),
      style: {
        gap: gap ? spacingTokens[gap] : undefined,
        rowGap: rowGap ? spacingTokens[rowGap] : undefined,
        columnGap: columnGap ? spacingTokens[columnGap] : undefined,
      },
    },
    children
  );
}
