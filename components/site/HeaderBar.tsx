'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/utils/cn';
import { MobileNav } from './MobileNav';
import { APPLY_PATH, NAV_ITEMS, focusModeExitLabel, isCurrentNavItem, isFocusMode } from './nav';

export interface HeaderBarProps {
  logo: ReactNode;
  phone: { display: string; href: string };
}

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

export function HeaderBar({ logo, phone }: HeaderBarProps) {
  const pathname = usePathname();
  const focusMode = isFocusMode(pathname);
  const { sentinelRef, scrolled } = useScrolled();

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px" />
      <header
        data-scrolled={scrolled || undefined}
        className={cn(
          'sticky top-0 z-30 border-b border-transparent bg-surface/80 backdrop-blur print-hidden',
          'transition-colors duration-fast ease-standard data-scrolled:border-line',
        )}
      >
        <Container size="wide" className="flex h-14 items-center justify-between gap-6 lg:h-16">
          <Link
            href="/"
            aria-label="Bad und Energie GmbH Lahn Dill, zur Startseite"
            className="-mx-1 inline-flex min-h-11 shrink-0 items-center rounded-xs px-1"
          >
            {logo}
          </Link>

          {focusMode ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/">{focusModeExitLabel(pathname)}</Link>
            </Button>
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
                          className={cn(
                            'inline-flex min-h-11 items-center rounded-xs px-3 text-callout font-medium transition-colors duration-fast',
                            current ? 'text-ink' : 'text-ink-muted hover:text-ink',
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="hidden items-center gap-5 lg:flex">
                <a
                  href={phone.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xs text-callout font-medium tabular-nums text-ink underline-offset-4 hover:underline"
                >
                  <Phone aria-hidden="true" strokeWidth={1.75} className="size-4 text-ink-muted" />
                  {phone.display}
                  <span className="sr-only"> anrufen</span>
                </a>
                <Button asChild variant="contrast" size="sm">
                  <Link href={APPLY_PATH}>Bewerben</Link>
                </Button>
              </div>

              <MobileNav phone={phone} className="lg:hidden" />
            </>
          )}
        </Container>
      </header>
    </>
  );
}
