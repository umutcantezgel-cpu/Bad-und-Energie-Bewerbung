import type { ComponentPropsWithRef } from 'react';
import { Leitungstrenner } from '@/components/zeichnung';
import { cn } from '@/lib/utils/cn';
import styles from './section.module.css';

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
   * Leitungstrenner am Kopf (E-023, seit E-031 mit S-Bogen): Vorlauf und Rücklauf laufen quer über die Fläche, enden
   * rund im Seitenrand und versetzen sich bei 18 % um einen Paarabstand. `true` oder die Lage des Bogens (z. B. "62%").
   */
  trenner?: boolean | string;
}

/**
 * Page band with vertical rhythm (K-007: section steps only). Pair with <Container> and pass
 * `aria-labelledby` (the heading id) so the section becomes a named region.
 *
 * Tonwechsel (E-031): Der Ton steht als `data-ton` am Abschnitt; folgt ein Abschnitt einem anderen Ton, hat er oben
 * runde Ecken (--radius-3), und die Ecken zeigen die Fläche des vorigen (section.module.css). Nur Form, kein Verlauf.
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
        styles.ton,
        className,
      )}
      data-ton={ton}
      {...props}
    >
      {trenner && <Leitungstrenner knick={knick} className="pointer-events-none absolute inset-x-0 top-6 md:top-8" />}
      {children}
    </section>
  );
}
