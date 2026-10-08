'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { buildWhatsAppUrl, whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';
import { cn } from '@/lib/utils/cn';
import { STICKY_BAR_HIDE_SELECTOR, getStickyApplyAction, isKeyboardOpen } from './nav';

export interface StickyApplyBarClientProps {
  /** Slug of each published job page → button label („Als … bewerben“). */
  jobLabels: Readonly<Record<string, string>>;
}

const NON_TEXT_INPUTS = new Set(['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit']);

function isTextEntry(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  if (element.isContentEditable || element instanceof HTMLTextAreaElement) return true;
  return element instanceof HTMLInputElement && !NON_TEXT_INPUTS.has(element.type);
}

/** On-screen keyboard open: a text field has focus and the visual viewport shrank. */
function useKeyboardOpen(enabled: boolean): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const viewport = window.visualViewport;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      // After focusout the next element is focused only in the following task.
      frame = requestAnimationFrame(() =>
        setOpen(
          isKeyboardOpen({
            editableFocused: isTextEntry(document.activeElement),
            layoutHeight: window.innerHeight,
            visualHeight: viewport ? viewport.height * viewport.scale : null,
          }),
        ),
      );
    };
    viewport?.addEventListener('resize', update);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', update);
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
    };
  }, [enabled]);

  return enabled && open;
}

/**
 * True while the embedded flow (#bewerben) or an element marked with data-primary-cta is on
 * screen. Starts as true, so the bar never flashes up over a hero CTA before the first
 * measurement; without targets it slides in after one frame. Re-scans when the page content
 * changes (client navigation, flow steps) and keeps the last value until the new page is measured.
 */
function useHideTargetVisible(pathname: string, enabled: boolean): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const onScreen = new Set<Element>();
    const observed = new Set<Element>();
    const publish = () => setVisible(onScreen.size > 0);

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) onScreen.add(entry.target);
              else onScreen.delete(entry.target);
            }
            publish();
          });

    // New targets report through the observer's initial callback; otherwise publish directly.
    const scan = () => {
      let added = false;
      for (const element of observed) {
        if (element.isConnected) continue;
        observer?.unobserve(element);
        observed.delete(element);
        onScreen.delete(element);
      }
      if (observer) {
        document.querySelectorAll(STICKY_BAR_HIDE_SELECTOR).forEach((element) => {
          if (observed.has(element)) return;
          observed.add(element);
          observer.observe(element);
          added = true;
        });
      }
      if (!added) publish();
    };

    let frame = requestAnimationFrame(scan);
    const scheduleScan = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    };
    const main = document.getElementById('main');
    const mutations = main ? new MutationObserver(scheduleScan) : null;
    if (main) mutations?.observe(main, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      mutations?.disconnect();
      observer?.disconnect();
    };
  }, [pathname, enabled]);

  return enabled && visible;
}

export function StickyApplyBarClient({ jobLabels }: StickyApplyBarClientProps) {
  const pathname = usePathname() ?? '/';
  const action = getStickyApplyAction(pathname, jobLabels);
  const keyboardOpen = useKeyboardOpen(action !== null);
  const targetVisible = useHideTargetVisible(pathname, action !== null);

  if (!action) return null;
  const hidden = keyboardOpen || targetVisible;

  return (
    <aside
      aria-label="Schnell bewerben"
      inert={hidden}
      data-hidden={hidden || undefined}
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 backdrop-blur lg:hidden print-hidden',
        'transition duration-step ease-standard data-hidden:pointer-events-none data-hidden:translate-y-full data-hidden:opacity-0',
      )}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-content items-center gap-3 px-gutter pt-3">
        <Button
          asChild
          size="lg"
          className="min-w-0 flex-1 whitespace-normal px-4 text-center leading-tight text-balance"
        >
          {action.inPageFlow ? <a href={action.href}>{action.label}</a> : <Link href={action.href}>{action.label}</Link>}
        </Button>
        <IconButton asChild variant="secondary" size="lg" aria-label="Per WhatsApp schreiben (öffnet in neuem Tab)">
          <a href={buildWhatsAppUrl(whatsAppMessageFor(pathname))} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden="true" strokeWidth={1.75} className="size-6" />
          </a>
        </IconButton>
      </div>
    </aside>
  );
}
