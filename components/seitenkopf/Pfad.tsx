import Link from 'next/link';
import { Icon } from '@/components/icons';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import styles from './pfad.module.css';

export interface PfadProps {
  /**
   * Stufen von der Startseite bis zur Seite selbst (letzte Stufe ohne `href`). Dieselben Namen und Ziele wie die
   * BreadcrumbList im JSON-LD der Seite (lib/seo/breadcrumbs-jsonld.ts), weil Google beides gleich verlangt.
   */
  items: readonly BreadcrumbItem[];
}

/** Text des kurzen Pfads am Handy: „Zurück zu …“ für Screenreader, sichtbar nur der Name. */
export const PFAD_ZURUECK = 'Zurück zu';

/**
 * Pfad über dem Seitenkopf `erzaehl` (Stellenseiten, Orts-, Kreis- und Gebietsseite): bis 64em auf Navy (geht
 * nahtlos in den Navy-Block des Kopfs über), ab 64em auf Papier. Unter 40em nur der Weg eine Stufe zurück
 * („‹ Lahn-Dill-Kreis“): Vier, fünf Stufen brachen dort auf zwei Zeilen um. Ab 40em der ganze Pfad; das JSON-LD
 * nennt immer alle Stufen. Je nur eine Fassung im Barrierebaum (display: none).
 */
export function Pfad({ items }: PfadProps) {
  const eltern = [...items].reverse().find((item, i) => i > 0 && item.href);
  return (
    <div className={styles.pfad} data-tone="inverse">
      {eltern?.href ? (
        <nav aria-label="Brotkrümelnavigation" className={styles.kurz}>
          <Link href={eltern.href} className={styles.zurueck} data-motion="druck">
            <Icon name="chevron-left" size="sm" className="shrink-0" />
            <span className="sr-only">{`${PFAD_ZURUECK} `}</span>
            {eltern.label}
          </Link>
        </nav>
      ) : null}
      <Breadcrumbs items={[...items]} className={eltern?.href ? styles.lang : undefined} />
    </div>
  );
}
