import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';
import './prose.css';

export type ProseProps = ComponentPropsWithRef<'div'>;

/**
 * Long-form text (Datenschutz, Impressum), ruhig: Lesebreite 66 ch (K-005: 60–75 Zeichen), Überschriften in
 * Bricolage und Marken-Navy, Text in Atkinson. Plugin und Farben (`prose` utility) stehen in prose.css, das nur
 * diese Komponente lädt; sizes and weights are mapped to the type scale here. Links wie TextLink (Hover: Strich
 * kräftiger, Rücklaufblau). Die Klassen unten erzeugt prose.css (es liest diese Datei), nicht das globale Blatt.
 */
export function Prose({ className, ...props }: ProseProps) {
  return (
    <div
      className={cn(
        'prose max-w-[66ch] text-body text-ink',
        'prose-headings:font-display prose-headings:text-brand',
        'prose-h1:text-title-1 prose-h2:text-title-2 prose-h3:text-title-3 prose-h4:text-body prose-h4:font-bold',
        'prose-strong:font-bold prose-th:font-bold',
        'prose-a:font-medium prose-a:decoration-1 prose-a:underline-offset-4 prose-a:hover:decoration-2 prose-a:hover:decoration-ruecklauf',
        'prose-li:marker:text-brand',
        'prose-code:font-sans prose-pre:font-sans',
        className,
      )}
      {...props}
    />
  );
}
