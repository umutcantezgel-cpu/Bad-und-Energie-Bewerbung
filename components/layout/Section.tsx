import type { ComponentPropsWithRef } from 'react';
import { Leitungstrenner } from '@/components/zeichnung';
import { cn } from '@/lib/utils/cn';

/**
 * Ton des Abschnitts (Tonfolge E-023): Papier, Wand, Band. Die alten Namen bleiben gültig:
 * `default` = papier (surface), `subtle` = wand (surface-2), `inverse` = band (Navy, data-tone="inverse").
 */
export type SectionTone = 'default' | 'subtle' | 'inverse' | 'papier' | 'wand' | 'band';

const TON: Record<SectionTone, 'papier' | 'wand' | 'band'> = {
  default: 'papier',
  papier: 'papier',
  subtle: 'wand',
  wand: 'wand',
  inverse: 'band',
  band: 'band',
};

export interface SectionProps extends ComponentPropsWithRef<'section'> {
  /** `subtle`/`wand` = surface-2; `inverse`/`band` = navy band (data-tone="inverse", light and dark). */
  tone?: SectionTone;
  spacing?: 'default' | 'compact';
  /**
   * Leitungstrenner am Kopf (E-023, wie die Abschnitte der Startseite): Vorlauf und Rücklauf laufen randlos
   * quer über die Fläche und springen bei 18 % um 45°. `true` oder die Lage des Knicks (z. B. "62%").
   */
  trenner?: boolean | string;
}

/**
 * Page band with vertical rhythm (K-007: section steps only). Pair with <Container> and pass
 * `aria-labelledby` (the heading id) so the section becomes a named region.
 */
export function Section({ tone = 'default', spacing = 'default', trenner = false, className, children, ...props }: SectionProps) {
  const ton = TON[tone] ?? 'papier';
  const knick = typeof trenner === 'string' ? trenner : undefined;
  return (
    <section
      data-tone={ton === 'band' ? 'inverse' : undefined}
      className={cn(
        spacing === 'compact' ? 'py-section-sm' : 'py-section',
        ton === 'wand' && 'bg-surface-2',
        ton === 'band' && 'bg-surface text-ink',
        // Luft über dem Etikett, damit das Leitungspaar (2 · --paar + Strich) frei läuft
        trenner && 'relative pt-24 md:pt-section',
        className,
      )}
      {...props}
    >
      {trenner && <Leitungstrenner knick={knick} className="pointer-events-none absolute inset-x-0 top-6 md:top-8" />}
      {children}
    </section>
  );
}
