'use client';

import { useEffect } from 'react';
import { Icon } from '@/components/icons';
import { IconButton } from './IconButton';
import type { ToastOptions } from './Toast';

export interface ToastItem extends ToastOptions {
  id: number;
}

const DEFAULT_DURATION = 5000;

const TONE_ICON = {
  success: <Icon name="circle-check" size="md" className="mt-3 shrink-0 text-success" />,
  error: <Icon name="circle-alert" size="md" className="mt-3 shrink-0 text-danger" />,
  neutral: null,
} as const;

export interface ToastCardProps {
  toast: ToastItem;
  paused: boolean;
  onDismiss: (id: number) => void;
}

export default function ToastCard({ toast, paused, onDismiss }: ToastCardProps) {
  const { id, title, description, tone = 'neutral', duration = DEFAULT_DURATION, action } = toast;
  const persistent = tone === 'error' || action !== undefined;

  // Restarts with the full duration after a pause (hover or focus).
  useEffect(() => {
    if (persistent || paused) return;
    const timer = window.setTimeout(() => onDismiss(id), duration);
    return () => window.clearTimeout(timer);
  }, [id, duration, persistent, paused, onDismiss]);

  return (
    <div
      data-tone="inverse"
      className="pointer-events-auto flex w-full items-start gap-3 rounded-2 py-3 pr-2 pl-4 shadow-lg"
    >
      {TONE_ICON[tone]}
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-2.5">
        <p className="text-callout font-bold text-ink">{title}</p>
        {description && <p className="text-callout text-ink-muted">{description}</p>}
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              onDismiss(id);
            }}
            data-motion="druck"
            className="-mb-2.5 inline-flex min-h-11 items-center self-start rounded-1 text-callout font-bold text-ink underline decoration-1 underline-offset-4 hover:decoration-2 hover:decoration-ruecklauf"
          >
            {action.label}
          </button>
        )}
      </div>
      <IconButton aria-label="Hinweis schließen" onClick={() => onDismiss(id)} className="shrink-0">
        <Icon name="x" size="md" />
      </IconButton>
    </div>
  );
}
