'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Rating } from '@/components/ui/Rating';
import { cn } from '@/lib/utils/cn';
import { REVIEW_FILTERS, filterReviewItems, type ReviewFilter, type ReviewItem } from './model';

export interface ReviewScrollerProps {
  items: readonly ReviewItem[];
  initialFilter: ReviewFilter;
  className?: string;
}

interface ScrollPosition {
  index: number;
  atStart: boolean;
  atEnd: boolean;
}

const START: ScrollPosition = { index: 0, atStart: true, atEnd: false };

/**
 * Calm review row: native scroll-snap, arrows move one card, no autoplay. The list is focusable,
 * so arrow keys scroll it; an sr-only status reports "Stimme n von m".
 */
export function ReviewScroller({ items, initialFilter, className }: ReviewScrollerProps) {
  const listId = useId();
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [filter, setFilter] = useState<ReviewFilter>(initialFilter);
  const [position, setPosition] = useState<ScrollPosition>(START);
  const visible = filterReviewItems(items, filter);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth || el.clientWidth;
    const max = el.scrollWidth - el.clientWidth;
    const next: ScrollPosition = {
      index: Math.max(0, Math.min(el.children.length - 1, Math.round(el.scrollLeft / step))),
      atStart: el.scrollLeft <= 1,
      atEnd: el.scrollLeft >= max - 1,
    };
    setPosition((prev) =>
      prev.index === next.index && prev.atStart === next.atStart && prev.atEnd === next.atEnd ? prev : next,
    );
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let timer: number | undefined;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 80);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    const resize = new ResizeObserver(() => measure());
    resize.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      resize.disconnect();
      window.clearTimeout(timer);
    };
  }, [measure]);

  // New filter → new cards: re-measure after the list has rendered.
  useEffect(() => {
    const frame = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(frame);
  }, [filter, measure]);

  const selectFilter = (value: ReviewFilter) => {
    if (value === filter) return;
    scrollerRef.current?.scrollTo({ left: 0, behavior: 'instant' });
    setFilter(value);
  };

  const move = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el || (direction < 0 ? position.atStart : position.atEnd)) return;
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth || el.clientWidth;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * step, behavior: reduceMotion ? 'instant' : 'smooth' });
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Stimmen filtern" className="flex flex-wrap gap-2">
          {REVIEW_FILTERS.map(({ value, label }) => (
            <Chip key={value} pressed={filter === value} onClick={() => selectFilter(value)}>
              {label}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2">
          <IconButton
            variant="outline"
            aria-label="Vorherige Stimme"
            aria-controls={listId}
            aria-disabled={position.atStart || undefined}
            onClick={() => move(-1)}
            className="aria-disabled:opacity-40"
          >
            <ChevronLeft aria-hidden="true" strokeWidth={1.75} className="size-5" />
          </IconButton>
          <IconButton
            variant="outline"
            aria-label="Nächste Stimme"
            aria-controls={listId}
            aria-disabled={position.atEnd || undefined}
            onClick={() => move(1)}
            className="aria-disabled:opacity-40"
          >
            <ChevronRight aria-hidden="true" strokeWidth={1.75} className="size-5" />
          </IconButton>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {visible.length > 0 ? `Stimme ${position.index + 1} von ${visible.length}` : ''}
      </p>

      <ul
        id={listId}
        ref={scrollerRef}
        role="list"
        tabIndex={0}
        aria-label="Stimmen von Kunden und Team"
        className={cn(
          // Phones and tablets: the row bleeds to the viewport edge, so the next card peeks in.
          // From lg the container no longer spans the viewport, so exactly three cards fill it
          // instead of a sliver clipped in mid-page.
          '-mx-gutter mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-gutter pb-1 scroll-px-gutter',
          'lg:mx-0 lg:px-0 lg:scroll-px-0',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {visible.map((item) => (
          <li
            key={item.id}
            className="flex shrink-0 basis-5/6 snap-start sm:basis-[calc(50%-0.5rem)] lg:basis-[calc((100%-2rem)/3)]"
          >
            <figure className="flex w-full flex-col gap-5 rounded-lg bg-surface-2 p-6">
              {/* Same slot height in every card, so the quotes of a row start on one line. Team voices
                  have no stars; their source takes the slot instead of repeating in the caption. */}
              <div className="flex min-h-5 items-center">
                {item.rating !== undefined ? (
                  <Rating value={item.rating} size="sm" />
                ) : (
                  <p className="text-footnote text-ink-muted">{item.source}</p>
                )}
              </div>
              <blockquote className="flex-1 text-body text-ink">
                <p>„{item.quote}“</p>
              </blockquote>
              <figcaption className="text-callout">
                <span className="block font-semibold text-ink">{item.name}</span>
                <span className="block text-ink-muted">
                  {item.rating !== undefined ? (
                    <>
                      {item.role} · <span className="whitespace-nowrap">{item.source}</span>
                    </>
                  ) : (
                    item.role
                  )}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
