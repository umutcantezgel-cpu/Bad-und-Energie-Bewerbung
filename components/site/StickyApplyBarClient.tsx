'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icons';
import styles from './fuss/leiste.module.css';
import {
  FLOW_ANCHOR_ID,
  SHORT_APPLY_LABEL,
  SHORT_FLOW_LABEL,
  STICKY_BAR_HIDE_SELECTOR,
  getStickyApplyAction,
  isKeyboardOpen,
} from './nav';

export interface StickyApplyBarClientProps {
  /** Slug of each published job page → button label („Als … bewerben“). */
  jobLabels: Readonly<Record<string, string>>;
  /** WhatsApp link with the prefilled general message, built on the server. */
  whatsappHref: string;
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
 * Job pages only (the action jumps to the flow on the page): „Als … bewerben“ while it fits on one line,
 * otherwise „Hier bewerben“ (SHORT_FLOW_LABEL, not „Jetzt bewerben“, which leads to /bewerbung), so the pill
 * stays a single calm line on every phone width. Both labels share one grid cell and stay laid out, so
 * the job label is measured again when the width changes (rotation, web font swap). The one not
 * shown is `invisible`, which also keeps it out of the link's accessible name.
 *
 * Measured only inside the ResizeObserver callback, which runs after layout (also right after
 * observing), so reading the widths never forces a synchronous layout (V6-A3-VITALS). A web font swap
 * changes the label's scroll width but not its box: observing it again yields a fresh first callback.
 */
function ApplyLabel({ label }: { label: string }) {
  const fullRef = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState(true);

  useEffect(() => {
    const full = fullRef.current;
    if (!full) return;
    const measure = () => setFits(full.scrollWidth <= full.clientWidth);
    if (typeof ResizeObserver === 'undefined') {
      measure();
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(full);
    let active = true;
    document.fonts?.ready.then(
      () => {
        if (!active) return;
        observer.unobserve(full);
        observer.observe(full);
      },
      () => {},
    );
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [label]);

  return (
    <span className="grid min-w-0 grid-cols-1">
      <span ref={fullRef} className={`col-start-1 row-start-1 overflow-hidden whitespace-nowrap${fits ? '' : ' invisible'}`}>
        {label}
      </span>
      <span className={`col-start-1 row-start-1 whitespace-nowrap${fits ? ' invisible' : ''}`}>{SHORT_FLOW_LABEL}</span>
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
    // R4-SHELL-02 (E-023): Bodenlinie oben, Vorlauf und Rücklauf fallen in die Hauptaktion (wie das Erdreich des
    // Einstiegs auf dem Handy); daneben WhatsApp als Zweitweg (E-SHELL-005). Ein- und Ausgang über die
    // Registerkennung „menue-oeffnen“ (Eingang d-2/k-aus, Ausgang d-1/k-ein; reduziert: sofort).
    <aside
      aria-label="Schnell bewerben"
      inert={hidden}
      data-hidden={hidden || undefined}
      data-sticky-apply-bar=""
      data-motion="menue-oeffnen"
      className={`${styles.leiste} print-hidden`}
    >
      <div className={styles.innen}>
        <div className={styles.anschluss}>
          <span className={`${styles.leitung} ${styles.vorlauf}`} aria-hidden="true" />
          <span className={`${styles.leitung} ${styles.ruecklauf}`} aria-hidden="true" />
          {action.inPageFlow ? (
            <a href={action.href} className={styles.aktion} data-motion="druck">
              <span className={styles.beschriftung}>{label}</span>
              <Icon name="arrow-right" size="md" />
            </a>
          ) : (
            <Link href={action.href} className={styles.aktion} data-motion="druck">
              <span className={styles.beschriftung}>{label}</span>
              <Icon name="arrow-right" size="md" />
            </Link>
          )}
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Per WhatsApp schreiben (öffnet in neuem Tab)"
          className={styles.zweit}
          data-motion="druck"
        >
          <Icon name="message-circle" size="lg" />
        </a>
      </div>
    </aside>
  );
}
