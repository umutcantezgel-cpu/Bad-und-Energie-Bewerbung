'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { Icon } from '@/components/icons';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Rating } from '@/components/ui/Rating';
import { cn } from '@/lib/utils/cn';
import { REVIEW_FILTERS, filterReviewItems, replyTitle, type ReviewFilter, type ReviewItem } from './model';
import { SternVorrat, VolleSterne, istVolleWertung } from './Sterne';
import {
  ZIEH_SCHWELLE_PX,
  ansage,
  lageBei,
  naechsterIndex,
  rastpunkte,
  wurfGeschwindigkeit,
  wurfZiel,
  zaehlung,
  type Lage,
  type ReihenMass,
  type ZugProbe,
} from './ziehen';

export interface ReviewScrollerProps {
  items: readonly ReviewItem[];
  initialFilter: ReviewFilter;
  className?: string;
}

const START: Lage = { erste: 1, letzte: 1, atStart: true, atEnd: false };

interface Zug {
  id: number;
  startX: number;
  startScroll: number;
  aktiv: boolean;
  proben: ZugProbe[];
}

/** Längster Weg, bis die Reihe nach einem Wurf sicher steht (falls `scrollend` fehlt). */
const RAST_FALLBACK_MS = 900;

function ohneBewegung(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Stimmen-Reihe (E-START-043, E-START-046): natives Scroll-Snap, kein Autoplay, ohne Eingabe bewegt sich nichts.
 * - Touch und Trackpad wischen nativ.
 * - Maus: ziehen 1:1, beim Loslassen läuft die Reihe in Wurfrichtung aus und rastet auf einer Karte ein
 *   (Rechenkern ./ziehen.ts). Reduzierte Bewegung: kein Auslaufen, die nächste Karte steht sofort.
 * - Pfeile und Tastatur (←/→, Pos1/Ende auf der fokussierten Reihe) springen um eine Karte.
 * - Zählung „01 / 13“ als Maß; Ansage „Stimme n von m“ für Screenreader.
 * - Inhaber-Antworten als native <details> je Karte (ohne JavaScript bedienbar).
 * - Vermessen wird nur im ResizeObserver (nach dem Layout, ohne erzwungenes Layout); Scrollen, Pfeile und Ziehen
 *   rechnen mit dem letzten Maß und lesen nur scrollLeft (V6-A3-VITALS, Forced Reflow).
 */
export function ReviewScroller({ items, initialFilter, className }: ReviewScrollerProps) {
  const listId = useId();
  const sternVorrat = `${listId}-sterne`;
  const scrollerRef = useRef<HTMLUListElement>(null);
  const punkteRef = useRef<number[]>([0]);
  const massRef = useRef<ReihenMass>({ links: [], rechts: [], breite: 0, max: 0 });
  const zugRef = useRef<Zug | null>(null);
  const gezogenRef = useRef(false);
  const rastTimerRef = useRef<number | undefined>(undefined);
  const [filter, setFilter] = useState<ReviewFilter>(initialFilter);
  const [lage, setLage] = useState<Lage>(START);
  const visible = filterReviewItems(items, filter);

  /** Lage aus dem letzten Maß; liest nur scrollLeft. */
  const aktualisieren = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = lageBei(massRef.current, punkteRef.current, el.scrollLeft);
    setLage((prev) =>
      prev.erste === next.erste && prev.letzte === next.letzte && prev.atStart === next.atStart && prev.atEnd === next.atEnd
        ? prev
        : next,
    );
  }, []);

  /** Kanten der Karten und Rastpunkte; nur aus dem ResizeObserver aufgerufen, dort ist das Layout frisch. */
  const vermessen = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const rects = Array.from(el.children, (kind) => kind.getBoundingClientRect());
    const links = rects.map((r) => el.scrollLeft + r.left - box.left);
    const max = el.scrollWidth - el.clientWidth;
    massRef.current = { links, rechts: rects.map((r) => el.scrollLeft + r.right - box.left), breite: box.width, max };
    punkteRef.current = rastpunkte(
      links.map((kante) => kante - pad),
      max,
    );
    aktualisieren();
  }, [aktualisieren]);

  // Ein neuer Filter bringt neue Karten: Der Effekt beobachtet die Reihe neu, und die erste Meldung des
  // ResizeObservers kommt nach dem Layout der neuen Karten.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let timer: number | undefined;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(aktualisieren, 80);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    const resize = new ResizeObserver(vermessen);
    resize.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      resize.disconnect();
      window.clearTimeout(timer);
    };
  }, [filter, vermessen, aktualisieren]);

  useEffect(() => () => window.clearTimeout(rastTimerRef.current), []);

  /** Fährt zu Rastpunkt `index`; Snap bleibt aus, bis die Reihe steht, damit nichts dazwischen einrastet. */
  const einrasten = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const punkte = punkteRef.current;
      const ziel = punkte[Math.min(Math.max(index, 0), punkte.length - 1)];
      const sofort = ohneBewegung();
      el.dataset.frei = '';
      const fertig = () => {
        window.clearTimeout(rastTimerRef.current);
        el.removeEventListener('scrollend', fertig);
        delete el.dataset.frei;
        aktualisieren();
      };
      el.scrollTo({ left: ziel, behavior: sofort ? 'instant' : 'smooth' });
      if (sofort || Math.abs(el.scrollLeft - ziel) < 1) {
        fertig();
        return;
      }
      el.addEventListener('scrollend', fertig, { once: true });
      window.clearTimeout(rastTimerRef.current);
      rastTimerRef.current = window.setTimeout(fertig, RAST_FALLBACK_MS);
    },
    [aktualisieren],
  );

  const move = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el || (direction < 0 ? lage.atStart : lage.atEnd)) return;
    einrasten(naechsterIndex(punkteRef.current, el.scrollLeft) + direction);
  };

  const selectFilter = (value: ReviewFilter) => {
    if (value === filter) return;
    scrollerRef.current?.scrollTo({ left: 0, behavior: 'instant' });
    setFilter(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    // Nur auf der Reihe selbst: in einer Karte (Antwort aufklappen) bleiben die Tasten beim Element.
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowRight') move(1);
    else if (event.key === 'ArrowLeft') move(-1);
    else if (event.key === 'Home') einrasten(0);
    else if (event.key === 'End') einrasten(punkteRef.current.length - 1);
    else return;
    event.preventDefault();
  };

  // Maus: ziehen mit Auslaufen. Touch und Stift scrollen nativ (pointerType ≠ mouse).
  const onPointerDown = (event: PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const el = event.currentTarget;
    gezogenRef.current = false;
    zugRef.current = { id: event.pointerId, startX: event.clientX, startScroll: el.scrollLeft, aktiv: false, proben: [] };
  };

  const onPointerMove = (event: PointerEvent<HTMLUListElement>) => {
    const zug = zugRef.current;
    if (!zug || event.pointerId !== zug.id) return;
    const el = event.currentTarget;
    const dx = event.clientX - zug.startX;
    if (!zug.aktiv) {
      if (Math.abs(dx) < ZIEH_SCHWELLE_PX) return;
      zug.aktiv = true;
      window.clearTimeout(rastTimerRef.current);
      el.setPointerCapture(event.pointerId);
      el.dataset.ziehen = '';
      el.dataset.frei = '';
      window.getSelection()?.removeAllRanges();
    }
    el.scrollLeft = zug.startScroll - dx;
    zug.proben.push({ t: event.timeStamp, x: el.scrollLeft });
    if (zug.proben.length > 24) zug.proben.shift();
  };

  const loslassen = (event: PointerEvent<HTMLUListElement>, mitWurf: boolean) => {
    const zug = zugRef.current;
    if (!zug || event.pointerId !== zug.id) return;
    zugRef.current = null;
    if (!zug.aktiv) return;
    const el = event.currentTarget;
    gezogenRef.current = true;
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    delete el.dataset.ziehen;
    const tempo = mitWurf ? wurfGeschwindigkeit(zug.proben, undefined, event.timeStamp) : 0;
    einrasten(wurfZiel(punkteRef.current, el.scrollLeft, tempo, !ohneBewegung()));
  };

  // Nach einem Zug löst das Loslassen keinen Klick aus (z. B. auf „Antwort des Inhabers“).
  const onClickCapture = (event: MouseEvent<HTMLUListElement>) => {
    if (!gezogenRef.current) return;
    gezogenRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className={className}>
      <SternVorrat id={sternVorrat} />
      <div role="group" aria-label="Stimmen filtern" className="flex flex-wrap gap-2">
        {REVIEW_FILTERS.map(({ value, label }) => (
          <Chip key={value} pressed={filter === value} onClick={() => selectFilter(value)}>
            {label}
          </Chip>
        ))}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {ansage(lage.erste, lage.letzte, visible.length)}
      </p>

      <ul
        id={listId}
        ref={scrollerRef}
        role="list"
        tabIndex={0}
        aria-label="Stimmen von Kunden und Team"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => loslassen(event, true)}
        onPointerCancel={(event) => loslassen(event, false)}
        onClickCapture={onClickCapture}
        onDragStart={(event) => event.preventDefault()}
        className={cn(
          // Phones and tablets: the row bleeds to the viewport edge, so the next card peeks in.
          // From lg the container no longer spans the viewport, so exactly three cards fill it
          // instead of a sliver clipped in mid-page.
          '-mx-gutter mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-gutter pb-1 scroll-px-gutter',
          'lg:mx-0 lg:px-0 lg:scroll-px-0',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // Maus: Greifhand; beim Ziehen kein Snap und keine Textauswahl (data-ziehen/data-frei aus dem Zug).
          'pointer-fine:cursor-grab data-frei:snap-none data-ziehen:cursor-grabbing data-ziehen:select-none',
        )}
      >
        {visible.map((item) => (
          <li
            key={item.id}
            className="flex shrink-0 basis-5/6 snap-start sm:basis-[calc(50%-0.5rem)] lg:basis-[calc((100%-2rem)/3)]"
          >
            <div className="flex w-full flex-col gap-4 rounded-2 bg-surface-2 p-6">
              <figure className="flex flex-1 flex-col gap-4">
                {/* Same slot height in every card, so the quotes of a row start on one line. Team voices
                    have no stars; their source takes the slot instead of repeating in the caption. */}
                <div className="flex min-h-6 items-center">
                  {item.rating === undefined ? (
                    <p className="text-etikett text-ink-muted">{item.source}</p>
                  ) : istVolleWertung(item.rating) ? (
                    <VolleSterne vorrat={sternVorrat} />
                  ) : (
                    <Rating value={item.rating} size="sm" />
                  )}
                </div>
                <blockquote className="flex-1 text-body text-ink">
                  <p>„{item.quote}“</p>
                </blockquote>
                <figcaption className="text-callout">
                  <span className="block font-bold text-brand">{item.name}</span>
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
              {item.reply ? (
                <details className="group/antwort border-t border-line">
                  <summary className="flex min-h-11 list-none items-center justify-between gap-3 rounded-1 pt-1 text-callout font-bold text-ink underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
                    {replyTitle(item.reply.author)}
                    <Icon name="chevron-down" size="sm" className="text-ink-muted group-open/antwort:rotate-180" />
                  </summary>
                  <blockquote className="pb-1 text-callout text-ink">
                    <p>„{item.reply.text}“</p>
                  </blockquote>
                  <p className="mt-2 text-callout text-ink-muted">{item.reply.author}</p>
                </details>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p aria-hidden="true" className="font-mass text-callout font-medium text-ink-muted">
          {visible.length > 0 ? zaehlung(lage.erste, lage.letzte, visible.length) : null}
        </p>
        <div className="flex gap-2">
          <IconButton
            variant="outline"
            aria-label="Vorherige Stimme"
            aria-controls={listId}
            aria-disabled={lage.atStart || undefined}
            onClick={() => move(-1)}
            className="aria-disabled:opacity-40"
          >
            <Icon name="chevron-left" size="md" />
          </IconButton>
          <IconButton
            variant="outline"
            aria-label="Nächste Stimme"
            aria-controls={listId}
            aria-disabled={lage.atEnd || undefined}
            onClick={() => move(1)}
            className="aria-disabled:opacity-40"
          >
            <Icon name="chevron-right" size="md" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
