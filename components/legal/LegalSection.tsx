import type { ReactNode } from 'react';

export interface LegalSectionProps {
  /** Anchor id; the table of contents links to it. */
  id: string;
  title: string;
  children: ReactNode;
}

/**
 * One chapter of a legal page: a named region with its h2. Lives inside the <Prose> of
 * LegalDocument, which removes the h2 top margin; the section itself carries the spacing.
 */
export function LegalSection({ id, title, children }: LegalSectionProps) {
  const headingId = `${id}-titel`;
  return (
    <section id={id} aria-labelledby={headingId} className="mt-14 first:mt-0">
      <h2 id={headingId}>{title}</h2>
      {children}
    </section>
  );
}
