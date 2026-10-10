import type { ReactNode } from 'react';

const NBSP = ' ';
const UHRZEIT = /(\d{1,2}:\d{2})/;

/**
 * Satzregeln für Zeiten im Fließtext (KERN K-005/K-012, Variante 1): geschütztes Leerzeichen vor „Uhr“,
 * Uhrzeiten in Bricolage-Ziffern (`ziffer`), weil Atkinson die Null mit Schrägstrich zeichnet.
 * Der Wortlaut bleibt unverändert.
 */
export function bindeUhr(text: string): string {
  return text.replace(/ Uhr\b/g, `${NBSP}Uhr`);
}

export function mitZiffern(text: string): ReactNode[] {
  return bindeUhr(text)
    .split(UHRZEIT)
    .map((teil, i) =>
      i % 2 === 1 ? (
        <span key={i} className="ziffer">
          {teil}
        </span>
      ) : (
        teil
      ),
    )
    .filter((teil) => teil !== '');
}
