'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';
import { buttonVariants } from '@/components/ui/variants';
import { MobileNav } from './MobileNav';
import { APPLY_PATH, NAV_ITEMS, focusModeExitLabel, isCurrentNavItem, isFocusMode } from './nav';

export interface HeaderBarProps {
  logo: ReactNode;
  phone: { display: string; href: string };
  /** WhatsApp link for the mobile menu, built on the server (keeps SITE_CONFIG out of the client). */
  whatsappHref: string;
}

/*
 * This bar ships on every page, so it uses plain class strings and the cva recipes from
 * components/ui/variants instead of cn()/<Button> (no tailwind-merge in the shared bundle).
 */
const NAV_LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-xs px-3 text-callout font-medium transition-colors duration-fast';
// -mr-4 lines the label up with the gutter edge; the hit area keeps its full size.
const EXIT_CLASS = `${buttonVariants({ variant: 'ghost', size: 'sm' })} -mr-4`;
// Secondary, not ink: in dark mode an ink pill turns near-white and outranks the page's one crimson
// primary („Jetzt bewerben“ in the hero, the job sidebar, the 404 page) right next to it.
const APPLY_CLASS = buttonVariants({ variant: 'secondary', size: 'sm' });

/** True once the page has scrolled; a 1px sentinel at the document top avoids scroll listeners. */
function useScrolled() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, scrolled };
}

export function HeaderBar({ logo, phone, whatsappHref }: HeaderBarProps) {
  const pathname = usePathname();
  const focusMode = isFocusMode(pathname);
  const { sentinelRef, scrolled } = useScrolled();

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px" />
      {/* The only translucent, blurred surface on the site (roadmap §4). */}
      <header
        data-scrolled={scrolled || undefined}
        className={
          'sticky top-0 z-30 border-b border-transparent bg-surface/80 backdrop-blur print-hidden ' +
          'transition-colors duration-fast ease-standard data-scrolled:border-line'
        }
      >
        <div
          className={`mx-auto box-content flex h-14 max-w-wide items-center justify-between px-gutter lg:h-16 ${
            focusMode ? 'gap-3' : 'gap-6'
          }`}
        >
          {/* The logo may shrink, so focus mode fits 320px next to its exit link. */}
          <Link
            href="/"
            aria-label="Bad und Energie GmbH Lahn Dill, zur Startseite"
            className="-mx-1 inline-flex min-h-11 min-w-0 shrink items-center rounded-xs px-1"
          >
            {logo}
          </Link>

          {focusMode ? (
            <Link href="/" className={EXIT_CLASS}>
              {focusModeExitLabel(pathname)}
            </Link>
          ) : (
            <>
              <nav aria-label="Hauptnavigation" className="hidden lg:block">
                <ul className="flex items-center gap-1">
                  {NAV_ITEMS.map((item) => {
                    const current = isCurrentNavItem(item, pathname);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={current ? 'page' : undefined}
                          className={`${NAV_LINK_CLASS} ${current ? 'text-ink' : 'text-ink-muted hover:text-ink'}`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="hidden shrink-0 items-center gap-5 lg:flex">
                <a
                  href={phone.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xs text-callout font-medium text-ink underline-offset-4 hover:underline"
                >
                  <Phone aria-hidden="true" strokeWidth={1.75} className="size-4 text-ink-muted" />
                  <span className="tabular-nums">{phone.display}</span>
                  <span className="sr-only"> anrufen</span>
                </a>
                <Link href={APPLY_PATH} className={APPLY_CLASS}>
                  Bewerben
                </Link>
              </div>

              <MobileNav phone={phone} whatsappHref={whatsappHref} className="shrink-0 lg:hidden" />
            </>
          )}
        </div>
      </header>
    </>
  );
}
