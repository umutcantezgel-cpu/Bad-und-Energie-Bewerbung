import React, { createElement, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ContainerSize = 'narrow' | 'default' | 'wide' | 'full';

export interface ContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  as?: ElementType;
  className?: string;
  padding?: boolean;
}

export function Container({
  children,
  size = 'default',
  as: Component = 'div',
  className,
  padding = true,
}: ContainerProps) {
  const sizeClass = {
    narrow: 'max-w-3xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
    full: 'w-full',
  }[size];

  return createElement(
    Component,
    {
      className: cn(
        'mx-auto w-full',
        sizeClass,
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      ),
    },
    children
  );
}
