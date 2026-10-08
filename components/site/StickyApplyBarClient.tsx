'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { buttonVariants, iconButtonVariants } from '@/components/ui/variants';
import { FLOW_ANCHOR_ID, SHORT_APPLY_LABEL, STICKY_BAR_HIDE_SELECTOR, getStickyApplyAction, isKeyboardOpen } from './nav';

export interface StickyApplyBarClientProps {
  /** Slug of each published job page → button label („Als … bewerben“). */
  jobLabels: Readonly<Record<string, string>>;
  /** WhatsApp link with the prefilled general message, built on the server. */
  whatsappHref: string;
}

// cva strings without tailwind-merge (shared client bundle); the extra classes do not conflict.
const APPLY_CLASS = `${buttonVariants({ size: 'lg', wrap: true })} min-w-0 flex-1`;
const WHATSAPP_CLASS = iconButtonVariants({ variant: 'secondary', size: 'lg' });

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

interface PageTargets {
  /** The embedded flow or a data-primary-cta element is on screen: the bar hides. */
  hideTargetVisible: boolean;
  /** The page contains the embedded flow (#bewerben); true until the page has been measured. */
  flowOnPage: boolean;
}

/**
 * Watches the page for the embedded flow (#bewerben) and elements marked with data-primary-cta.
 * `hideTargetVisible` starts as true, so the bar never flashes up over a hero CTA before the first
 * measurement; without targets it slides in after one frame. Re-scans when the page content
 * changes (client navigation, flow steps) and keeps the last value until the new page is measured.
 */
function usePageTargets(pathname: string, enabled: boolean): PageTargets {
  const [visible, setVisible] = useState(true);
  const [flow, setFlow] = useState<{ pathname: string; present: boolean } | null>(null);

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
      const present = document.getElementById(FLOW_ANCHOR_ID) !== null;
      setFlow((previous) =>
        previous?.pathname === pathname && previous.present === present ? previous : { pathname, present },
      );
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

  return {
    hideTargetVisible: enabled && visible,
    flowOnPage: flow?.pathname === pathname ? flow.present : true,
  };
}

/**
 * „Als … bewerben“ while it fits on one line, otherwise „Jetzt bewerben“, so the pill stays a
 * single calm line on every phone width. Both labels share one grid cell and stay laid out, so
 * the job label is measured again when the width changes (rotation, web font swap). The one not
 * shown is `invisible`, which also keeps it out of the link's accessible name.
 */
function ApplyLabel({ label }: { label: string }) {
  const fullRef = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState(true);

  useEffect(() => {
    const full = fullRef.current;
    if (!full) return;
    let active = true;
    const measure = () => {
      if (active) setFits(full.scrollWidth <= full.clientWidth);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(full);
    document.fonts?.ready.then(measure, () => {});
    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [label]);

  return (
    <span className="grid min-w-0 grid-cols-1">
      <span ref={fullRef} className={`col-start-1 row-start-1 overflow-hidden whitespace-nowrap${fits ? '' : ' invisible'}`}>
        {label}
      </span>
      <span className={`col-start-1 row-start-1 whitespace-nowrap${fits ? ' invisible' : ''}`}>{SHORT_APPLY_LABEL}</span>
    </span>
  );
}

export function StickyApplyBarClient({ jobLabels, whatsappHref }: StickyApplyBarClientProps) {
  const pathname = usePathname() ?? '/';
  const enabled = getStickyApplyAction(pathname, jobLabels) !== null;
  const keyboardOpen = useKeyboardOpen(enabled);
  const { hideTargetVisible, flowOnPage } = usePageTargets(pathname, enabled);
  const action = getStickyApplyAction(pathname, jobLabels, flowOnPage);

  if (!action) return null;
  const hidden = keyboardOpen || hideTargetVisible;
  const label = action.label === SHORT_APPLY_LABEL ? action.label : <ApplyLabel key={action.label} label={action.label} />;

  return (
    // Opaque on purpose: translucency and blur are reserved for the sticky header (roadmap §4).
    <aside
      aria-label="Schnell bewerben"
      inert={hidden}
      data-hidden={hidden || undefined}
      data-sticky-apply-bar=""
      className={
        'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface lg:hidden print-hidden ' +
        'transition duration-step ease-standard data-hidden:pointer-events-none data-hidden:translate-y-full data-hidden:opacity-0'
      }
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-content items-center gap-3 px-gutter pt-3">
        {action.inPageFlow ? (
          <a href={action.href} className={APPLY_CLASS}>
            {label}
          </a>
        ) : (
          <Link href={action.href} className={APPLY_CLASS}>
            {label}
          </Link>
        )}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Per WhatsApp schreiben (öffnet in neuem Tab)"
          className={WHATSAPP_CLASS}
        >
          <MessageCircle aria-hidden="true" strokeWidth={1.75} className="size-6" />
        </a>
      </div>
    </aside>
  );
}
