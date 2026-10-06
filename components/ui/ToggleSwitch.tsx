'use client';

import React from 'react';
import { motion } from 'motion/react';

interface ToggleSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  badge?: string;
}

export function ToggleSwitch({
  id,
  checked,
  onChange,
  disabled = false,
  label,
  description,
  badge,
}: ToggleSwitchProps) {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex items-start justify-between gap-4 py-2">
      {(label || description) && (
        <div className="space-y-0.5 pr-2">
          {label && (
            <label
              htmlFor={switchId}
              className={`text-sm font-semibold flex items-center gap-2 ${
                disabled ? 'text-slate-400' : 'text-slate-900 cursor-pointer'
              }`}
            >
              <span>{label}</span>
              {badge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                  {badge}
                </span>
              )}
            </label>
          )}
          {description && (
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2 ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-200'
            : checked
            ? 'bg-[#0284C7]'
            : 'bg-slate-300 hover:bg-slate-400'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
