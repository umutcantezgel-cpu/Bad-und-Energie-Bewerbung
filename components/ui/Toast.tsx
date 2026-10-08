'use client';

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { IconButton } from './IconButton';

export type ToastTone = 'neutral' | 'success' | 'error';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /**
   * Milliseconds until it hides itself. Ignored for errors and toasts with an action: those stay
   * until dismissed, so keyboard and screen-reader users can reach the button (WCAG 2.2.1).
   */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastApi {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DEFAULT_DURATION = 5000;

/**
 * Hosts toasts for the app. Status toasts share one polite live region;
 * errors get role="alert". Errors and toasts with an action persist until dismissed.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [paused, setPaused] = useState(false);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { ...options, id }]);
    return id;
  }, []);

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  const status = toasts.filter((t) => t.tone !== 'error');
  const errors = toasts.filter((t) => t.tone === 'error');

  return (
    <ToastContext value={api}>
      {children}
      <section
        aria-label="Benachrichtigungen"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
        }}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-24 lg:pb-6 print-hidden"
      >
        {errors.map((t) => (
          <div key={t.id} role="alert" className="w-full max-w-md">
            <ToastCard toast={t} paused={paused} onDismiss={dismiss} />
          </div>
        ))}
        <div role="status" aria-live="polite" className="flex w-full max-w-md flex-col gap-2">
          {status.map((t) => (
            <ToastCard key={t.id} toast={t} paused={paused} onDismiss={dismiss} />
          ))}
        </div>
      </section>
    </ToastContext>
  );
}

/** `toast({ title, tone })` returns an id for `dismiss(id)`. Needs a <ToastProvider> above. */
export function useToast(): ToastApi {
  const api = use(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>.');
  return api;
}

const TONE_ICON = {
  success: <CircleCheck aria-hidden="true" strokeWidth={2} className="mt-0.5 size-5 shrink-0 text-success" />,
  error: <CircleAlert aria-hidden="true" strokeWidth={2} className="mt-0.5 size-5 shrink-0 text-danger" />,
  neutral: null,
} as const;

interface ToastCardProps {
  toast: ToastItem;
  paused: boolean;
  onDismiss: (id: number) => void;
}

function ToastCard({ toast, paused, onDismiss }: ToastCardProps) {
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
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-md py-3 pr-2 pl-4 shadow-lg',
        'transition duration-fast ease-standard starting:translate-y-2 starting:opacity-0',
      )}
    >
      {TONE_ICON[tone]}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-2.5">
        <p className="text-callout font-semibold text-ink">{title}</p>
        {description && <p className="text-callout text-ink-muted">{description}</p>}
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              onDismiss(id);
            }}
            className="-mb-2.5 inline-flex min-h-11 items-center self-start rounded-xs text-callout font-semibold text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {action.label}
          </button>
        )}
      </div>
      <IconButton aria-label="Hinweis schließen" onClick={() => onDismiss(id)} className="shrink-0">
        <X aria-hidden="true" strokeWidth={1.75} className="size-5" />
      </IconButton>
    </div>
  );
}
