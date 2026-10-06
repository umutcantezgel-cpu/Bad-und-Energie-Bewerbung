'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface AnimateInProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  distance?: number;
}

export function AnimateIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  once = true,
  className = '',
  distance = 20,
}: AnimateInProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.15 });

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const initialY = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
  const initialX = direction === 'left' ? distance : direction === 'right' ? -distance : 0;

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: initialY,
        x: initialX,
      }}
      animate={
        isInView
          ? { opacity: 1, y: 0, x: 0 }
          : { opacity: 0, y: initialY, x: initialX }
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
