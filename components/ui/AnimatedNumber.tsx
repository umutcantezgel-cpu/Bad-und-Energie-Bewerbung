'use client';

import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  duration = 1200,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  const [current, setCurrent] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    let start = 0;
    const stepTime = 20;
    const steps = Math.max(1, Math.floor(duration / stepTime));
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCurrent(value);
        clearInterval(timer);
      } else {
        setCurrent(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration, reducedMotion]);

  const displayValue = reducedMotion ? value : current;

  return (
    <span className={className} suppressHydrationWarning>
      {prefix}
      {displayValue.toLocaleString('de-DE')}
      {suffix}
    </span>
  );
}
