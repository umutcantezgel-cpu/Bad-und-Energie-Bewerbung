'use client';

import React from 'react';
import { motion } from 'motion/react';

interface ProgressGaugeProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
  variant?: 'bar' | 'ring';
}

export function ProgressGauge({
  currentStep,
  totalSteps,
  label,
  variant = 'bar',
}: ProgressGaugeProps) {
  const percentage = Math.min(Math.round((currentStep / totalSteps) * 100), 100);

  if (variant === 'ring') {
    const size = 52;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#C51E1E"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute font-mono text-[11px] font-bold text-[#0A1E3A] tabular-nums">
          {percentage}%
        </span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-slate-600">
          {label || `Schritt ${currentStep} von ${totalSteps}`}
        </span>
        <span className="font-mono font-semibold text-[#0284C7] tabular-nums">
          {percentage}%
        </span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#C51E1E] to-[#0284C7] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
