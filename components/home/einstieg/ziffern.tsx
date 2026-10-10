import type { ReactNode } from 'react';

/**
 * Ziffern im Fließtext in der Display-Schrift (theme.css `ziffer`, Variante 1 `.ziffer`): Atkinson
 * Hyperlegible Next zeichnet die Null mit Schrägstrich. Der Text bleibt wörtlich, nur die Ziffernfolgen
 * (auch 13:30, 1.400) stehen in einem eigenen span.
 */
export function mitZiffern(text: string): ReactNode[] {
  return text.split(/(\d+(?:[:.,]\d+)*)/).map((teil, i) =>
    i % 2 === 1 ? (
      <span key={i} className="ziffer">
        {teil}
      </span>
    ) : (
      teil
    ),
  );
}
