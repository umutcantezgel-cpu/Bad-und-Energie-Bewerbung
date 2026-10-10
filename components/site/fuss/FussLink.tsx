import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { NEUER_TAB } from './fuss-text';
import styles from './fuss.module.css';

export interface FussLinkProps {
  href: string;
  children: ReactNode;
  /** Icon der eigenen Familie vor dem Text (dekorativ). */
  icon?: IconName;
  /** Neuer Tab mit noopener/noreferrer und Hinweis für Screenreader. */
  extern?: boolean;
  /** Hervorgehobener Weg: fett und dauerhaft unterstrichen (wie der Zweitweg des Einstiegs). */
  stark?: boolean;
  /** Pfeil hinter dem Text. */
  pfeil?: boolean;
  /** Text nur für Screenreader vor dem sichtbaren Text, z. B. „Telefon“. */
  vorsatz?: string;
  className?: string;
}

/**
 * Link im Fuß: mindestens 44 px hoch, Fokus aus globals.css (3 px Rücklaufblau), Hover nur bei feinem Zeiger
 * mit dem Unterstrich aus Variante 1 (Register „unterstrich“), Druck 1 px (Register „druck“). Interne Pfade
 * über next/link, alles andere als einfacher Anker. Server-Komponente.
 */
export function FussLink({ href, children, icon, extern = false, stark = false, pfeil = false, vorsatz, className }: FussLinkProps) {
  const inhalt = (
    <>
      {icon ? <Icon name={icon} size="md" className={styles.ikon} /> : null}
      <span className={styles.text} data-motion="unterstrich">
        {vorsatz ? <span className="sr-only">{vorsatz} </span> : null}
        {children}
      </span>
      {pfeil ? <Icon name="arrow-right" size="sm" className={styles.pfeil} /> : null}
      {extern ? <span className="sr-only">{NEUER_TAB}</span> : null}
    </>
  );
  const klassen = cn(styles.link, stark && styles.stark, 'rounded-1', className);

  if (href.startsWith('/') && !extern) {
    return (
      <Link href={href} className={klassen} data-motion="druck">
        {inhalt}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={klassen}
      data-motion="druck"
      {...(extern ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {inhalt}
    </a>
  );
}
