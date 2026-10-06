'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface MotionHamburgerIconProps {
  isOpen: boolean;
  className?: string;
  strokeWidth?: number;
}

export function MotionHamburgerIcon({
  isOpen,
  className = 'w-6 h-6',
  strokeWidth = 2.2,
}: MotionHamburgerIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Top Bar -> Diagonal 1 (\) */}
      <motion.path
        variants={{
          closed: { d: 'M 3.5 6.5 L 20.5 6.5' },
          open: { d: 'M 5 19 L 19 5' },
        }}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      />

      {/* Middle Bar -> Shrinks & Fades Out */}
      <motion.path
        variants={{
          closed: { opacity: 1, d: 'M 3.5 12 L 20.5 12' },
          open: { opacity: 0, d: 'M 12 12 L 12 12' },
        }}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.16, ease: 'easeInOut' }}
      />

      {/* Bottom Bar -> Diagonal 2 (/) */}
      <motion.path
        variants={{
          closed: { d: 'M 3.5 17.5 L 20.5 17.5' },
          open: { d: 'M 5 5 L 19 19' },
        }}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      />
    </svg>
  );
}
