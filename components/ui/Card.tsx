import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  const variantClasses = {
    default: 'bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow',
    flat: 'bg-slate-50 border border-slate-200/60',
    elevated: 'bg-white border border-slate-100 shadow-md hover:shadow-xl transition-shadow',
    bordered: 'bg-white border-2 border-slate-200',
  }[variant];

  return (
    <div
      className={`rounded-2xl ${paddingClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
