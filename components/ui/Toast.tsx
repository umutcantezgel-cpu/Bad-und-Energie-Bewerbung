'use client';

import { Suspense, createContext, lazy, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ToastCardProps, ToastItem } from './ToastCard';

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

interface ToastApi {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const FALLBACK_DURATION = 5000;

/**
 * Plain card when the ToastCard chunk cannot load (offline, or a tab older than the last deploy).
 * Without it the rejected import would reach app/global-error.tsx, since the provider lives in
 * the root layout. Same behaviour, without icons.
 */
function FallbackToastCard({ toast, paused, onDismiss }: ToastCardProps) {
  const { id, title, description, tone, duration = FALLBACK_DURATION, action } = toast;
  const persistent = tone === 'error' || action !== undefined;

  useEffect(() => {
    if (persistent || paused) return;
    const timer = window.setTimeout(() => onDismiss(id), duration);
    return () => window.clearTimeout(timer);
  }, [id, duration, persistent, paused, onDismiss]);

  return (
    <div data-tone="inverse" className="pointer-events-auto flex w-full items-start gap-3 rounded-md py-3 pr-2 pl-4 shadow-lg">
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
            className="-mb-2.5 inline-flex min-h-11 items-center self-start rounded-xs text-callout font-semibold text-ink underline underline-offset-4"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-callout font-semibold text-ink"
      >
        Schließen
      </button>
    </div>
  );
}

// The card (icons, IconButton, cn) loads with the first toast, so the provider in the root
// layout adds next to nothing to the shared client bundle.
const ToastCard = lazy(() => import('./ToastCard').catch(() => ({ default: FallbackToastCard })));

/**
 * Hosts toasts for the app. Status toasts share one polite live region that is in the DOM from
 * the start; errors get role="alert". Errors and toasts with an action persist until dismissed.
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
        <Suspense fallback={null}>
          {errors.map((t) => (
            <div key={t.id} role="alert" className="w-full max-w-md">
              <ToastCard toast={t} paused={paused} onDismiss={dismiss} />
            </div>
          ))}
        </Suspense>
        <div role="status" aria-live="polite" className="flex w-full max-w-md flex-col gap-2">
          <Suspense fallback={null}>
            {status.map((t) => (
              <ToastCard key={t.id} toast={t} paused={paused} onDismiss={dismiss} />
            ))}
          </Suspense>
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

