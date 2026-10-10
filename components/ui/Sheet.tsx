'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { IconButton } from './IconButton';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** Keeps the title for screen readers only. */
  hideTitle?: boolean;
  description?: ReactNode;
  children?: ReactNode;
  /** Sticky area below the content, e.g. the primary action. */
  footer?: ReactNode;
  closeLabel?: string;
  className?: string;
}

/**
 * Modal sheet on a native <dialog>: bottom sheet on mobile, centered panel
 * from md. Focus trap, inert background and Esc come from showModal(); this
 * adds backdrop click, scroll lock and focus return. Formsystem: Radius 24 (äußerer Bogen eines
 * Leitungspaars), der eine Schatten der schwebenden Ebenen, Titel in Marken-Navy, Icon der eigenen Familie.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  hideTitle = false,
  description,
  children,
  footer,
  closeLabel = 'Schließen',
  className,
}: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const pressStartedOnBackdrop = useRef(false);
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = description ? `${id}-description` : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  // Fires for Esc, form[method=dialog] and our own close() alike.
  const handleClose = () => {
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target?.isConnected && document.activeElement !== target) target.focus();
    if (open) onOpenChange(false);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={handleClose}
      onPointerDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        // The panel fills the dialog box, so a click on the dialog itself hit the backdrop.
        if (pressStartedOnBackdrop.current && event.target === event.currentTarget) onOpenChange(false);
        pressStartedOnBackdrop.current = false;
      }}
      // Register „menue-oeffnen“: Eingang d-2 mit k-aus, Ausgang d-1 mit k-ein (opacity, transform)
      data-motion="menue-oeffnen"
      className={cn(
        // Preflight resets the UA `margin: auto` of <dialog>; mx-auto centres the md+ panel again.
        'mx-auto mt-auto mb-0 w-full max-w-full overscroll-contain rounded-t-3 bg-surface p-0 text-ink shadow-lg ring-1 ring-line',
        'md:my-auto md:max-w-lg md:rounded-3',
        'transition transition-discrete duration-d2 ease-aus not-open:duration-d1 not-open:ease-ein',
        'translate-y-full opacity-0 open:translate-y-0 open:opacity-100 starting:open:translate-y-full starting:open:opacity-0',
        'md:translate-y-4 md:open:translate-y-0 md:starting:open:translate-y-4',
        'backdrop:backdrop-brightness-50 backdrop:transition backdrop:transition-discrete backdrop:duration-d2',
        'backdrop:opacity-0 open:backdrop:opacity-100 starting:open:backdrop:opacity-0',
        className,
      )}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-surface px-6 pt-4 pb-2">
        <div className={cn('flex flex-col gap-1 pt-2.5', hideTitle && 'sr-only')}>
          <h2 id={titleId} className="text-title-3 text-brand">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="text-callout text-ink-muted">
              {description}
            </p>
          )}
        </div>
        <IconButton aria-label={closeLabel} onClick={() => onOpenChange(false)} className="-mr-2.5 ml-auto">
          <Icon name="x" size="lg" />
        </IconButton>
      </div>
      <div className="px-6 pb-6" style={footer ? undefined : { paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        {children}
      </div>
      {footer && (
        <div
          className="sticky bottom-0 border-t border-line bg-surface px-6 pt-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {footer}
        </div>
      )}
    </dialog>
  );
}
