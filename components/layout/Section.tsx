import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const paddingMap = {
  none: 'py-0',
  sm: 'py-8 sm:py-10',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-20',
  xl: 'py-20 sm:py-28',
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, as: Component = 'section', paddingY = 'md', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn('relative w-full', paddingMap[paddingY], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Section.displayName = 'Section';
