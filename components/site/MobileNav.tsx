'use client';

import { Suspense, lazy, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, MessageCircle, Phone, X } from 'lucide-react';
import type { SheetProps } from '@/components/ui/Sheet';
import { buttonVariants, iconButtonVariants } from '@/components/ui/variants';
import { APPLY_PATH, NAV_ITEMS, isCurrentNavItem } from './nav';

export interface MobileNavProps {
  phone: { display: string; href: string };
  /** WhatsApp link with the prefilled message, built on the server. */
  whatsappHref: string;
  className?: string;
}

const contactLinkClass =
  'flex min-h-12 items-center gap-3 rounded-xs text-body font-medium text-ink underline-offset-4 hover:underline';
const MENU_BUTTON_CLASS = `${iconButtonVariants()} -mr-2.5`;
const APPLY_CLASS = buttonVariants({ size: 'lg', fullWidth: true });

/**
 * Stand-in when the sheet chunk cannot load (offline, or a tab older than the last deploy):
 * the same links in a plain native dialog. Without it the rejected import would reach
 * app/global-error.tsx, since this menu lives in the root layout.
 */
function FallbackSheet({ open, onOpenChange, title, children, footer, closeLabel = 'Schließen' }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => onOpenChange(false)}
      className="mx-auto mt-auto mb-0 w-full max-w-full rounded-t-xl bg-surface px-6 pt-4 pb-6 text-ink backdrop:backdrop-brightness-50 md:my-auto md:max-w-lg md:rounded-xl"
    >
      <div className="flex items-start justify-between gap-4 pb-2">
        <h2 id={titleId} className="pt-2.5 text-title-3 text-ink">
          {title}
        </h2>
        <button type="button" aria-label={closeLabel} onClick={() => onOpenChange(false)} className={MENU_BUTTON_CLASS}>
          <X aria-hidden="true" strokeWidth={1.75} className="size-6" />
        </button>
      </div>
      {children}
      {footer && <div className="mt-6 border-t border-line pt-4">{footer}</div>}
    </dialog>
  );
}

// The sheet (dialog logic, close icon, cn) loads on first use; the menu button warms it up.
const loadSheet = () => import('@/components/ui/Sheet');
const prefetchSheet = () => {
  loadSheet().catch(() => {});
};
const Sheet = lazy(() =>
  loadSheet().then(
    (module) => ({ default: module.Sheet }),
    () => ({ default: FallbackSheet }),
  ),
);

/** Menu button below lg; opens a sheet with the page links, phone, WhatsApp and the primary action. */
export function MobileNav({ phone, whatsappHref, className }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <div className={className}>
      <button
        type="button"
        aria-label="Menü"
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={prefetchSheet}
        onFocus={prefetchSheet}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        className={MENU_BUTTON_CLASS}
      >
        <Menu aria-hidden="true" strokeWidth={1.75} className="size-6" />
      </button>

      {mounted && (
        <Suspense fallback={null}>
          <Sheet
            open={open}
            onOpenChange={setOpen}
            title="Menü"
            footer={
              <Link href={APPLY_PATH} onClick={close} className={APPLY_CLASS}>
                Jetzt bewerben
              </Link>
            }
          >
            <nav aria-label="Hauptnavigation">
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item) => {
                  const current = isCurrentNavItem(item, pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={current ? 'page' : undefined}
                        className="flex min-h-14 items-center rounded-xs text-title-2 text-ink"
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-6 flex flex-col border-t border-line pt-4">
              <a href={phone.href} className={contactLinkClass}>
                <Phone aria-hidden="true" strokeWidth={1.75} className="size-5 text-ink-muted" />
                <span className="tabular-nums">{phone.display}</span>
                <span className="sr-only"> anrufen</span>
              </a>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={contactLinkClass}>
                <MessageCircle aria-hidden="true" strokeWidth={1.75} className="size-5 text-ink-muted" />
                WhatsApp
                <span className="sr-only"> (öffnet in neuem Tab)</span>
              </a>
            </div>
          </Sheet>
        </Suspense>
      )}
    </div>
  );
}
