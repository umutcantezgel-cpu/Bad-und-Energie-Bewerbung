import Link from 'next/link';
import { ARBEITEN_PATH, getThemen, themaPath } from '@/lib/themen/registry';
import { cn } from '@/lib/utils/cn';
import { FussLink } from './fuss/FussLink';
import styles from './fuss/fuss.module.css';

/** Weg zum Themen-Hub: derselbe Ankertext wie unter „Weitere Themen“ der Themenseiten (ein Ankertext, ein Ziel). */
export const FOOTER_THEMEN_LINK = Object.freeze({ href: ARBEITEN_PATH, label: 'Alle Themen im Überblick' });

/**
 * Themenzeile im Fuß (E-028): Etikett wie die Spaltenköpfe, die fünf Themenseiten als ruhige Zeile mit Trennpunkten
 * (wie die Ortsliste darunter) und der Weg zum Hub /arbeiten-bei-uns. Jede Seite ist so höchstens zwei Klicks entfernt.
 */
export function FooterThemen({ className }: { className?: string }) {
  return (
    <section aria-labelledby="footer-themen" className={cn(styles.orteRaster, className)}>
      <h2 id="footer-themen" className={cn(styles.kopf, 'text-etikett text-ink-2')}>
        Arbeiten bei uns
      </h2>
      <div className={styles.orteInhalt}>
        <div className={styles.orteClip}>
          <ul className={styles.orteListe}>
            {getThemen().map((thema) => (
              <li key={thema.id}>
                <Link href={themaPath(thema)} className={cn(styles.ortLink, 'rounded-1')} data-motion="druck">
                  {thema.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <FussLink href={FOOTER_THEMEN_LINK.href} stark pfeil>
          {FOOTER_THEMEN_LINK.label}
        </FussLink>
      </div>
    </section>
  );
}
