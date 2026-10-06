import React from 'react';

export interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
}

export function GradientText({
  children,
  className = '',
  from = 'from-[#C51E1E]',
  via = 'via-[#B01A1A]',
  to = 'to-[#0284C7]',
}: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r ${from} ${via} ${to} bg-clip-text text-transparent font-extrabold ${className}`}
    >
      {children}
    </span>
  );
}
