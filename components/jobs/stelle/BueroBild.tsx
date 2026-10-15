import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { beschriftungsLage, type BueroSzene } from '@/lib/zeichnung/buero/szene';
import styles from '@/components/zeichnung/zeichnung.module.css';

export interface BueroBildProps {
  szene: BueroSzene;
  /** Wörter an den Beschriftungen der Szene (lib/themen/text.ts), je id; ohne Eintrag bleibt die Stelle leer. */
  woerter: Readonly<Record<string, string>>;
  /** Das Bild (Datei der Zeichnung). */
  children: ReactNode;
  className?: string;
}

/**
 * Büro-Zeichnung als Datei mit den Wörtern darüber (Prüfrunde 1 A1-6): an denselben Stellen wie auf der Themenseite
 * (lib/zeichnung/buero, `beschriftungen`), in der Schrift der Seite, für Hilfsmittel verborgen (den Inhalt sagen Titel
 * und Text daneben). Für das Kopfbild der Bürofachkraft und die Szenen im Einblick der Stellenseite.
 */
export function BueroBild({ szene, woerter, children, className }: BueroBildProps) {
  return (
    <div className={cn(styles.bildRahmen, className)}>
      {children}
      {szene.beschriftungen.map((b) =>
        woerter[b.id] ? (
          <span key={b.id} className={cn(styles.bildText, 'text-etikett')} style={beschriftungsLage(szene, b)} aria-hidden="true">
            {woerter[b.id]}
          </span>
        ) : null,
      )}
    </div>
  );
}
