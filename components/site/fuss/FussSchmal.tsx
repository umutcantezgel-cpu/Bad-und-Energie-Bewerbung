import { Container } from '@/components/layout/Container';
import { Leitungstrenner } from '@/components/zeichnung';
import { cn } from '@/lib/utils/cn';
import { RECHTS_LINKS, fussKontakte, pflichtzeile } from './fuss-text';
import { FussLink } from './FussLink';
import { Ziffern } from './Ziffern';
import styles from './fuss.module.css';

/**
 * Schmaler Fuß im Fokusmodus (/bewerbung, Danke, Mappe): dasselbe Navy-Band mit dem Leitungspaar, aber ohne
 * Spalten, damit nichts vom Formular ablenkt. Rechtslinks samt „Datenschutz für Bewerbende“ (E-RECHT-008),
 * Telefon und WhatsApp mit dem Text zu den Bewerbungsschritten (E-SHELL-005), Fußzeile mit Register und Innung.
 */
export function FussSchmal({ year }: { year: number }) {
  return (
    <footer data-tone="inverse" className={cn(styles.fuss, 'bg-surface text-ink print-hidden')}>
      <Leitungstrenner className={styles.trenner} />
      <Container size="wide" className={styles.schmal}>
        <nav aria-label="Rechtliches">
          <ul className={styles.schmalWege}>
            {RECHTS_LINKS.map((link) => (
              <li key={link.href}>
                <FussLink href={link.href}>{link.label}</FussLink>
              </li>
            ))}
          </ul>
        </nav>
        <ul className={styles.schmalWege} aria-label="Direkter Kontakt">
          {fussKontakte({ fokus: true }).map((k) => (
            <li key={k.id}>
              <FussLink href={k.href} icon={k.icon} extern={k.extern} vorsatz={k.vorsatz}>
                {k.id === 'phone' ? <span className="ziffer">{k.text}</span> : k.text}
              </FussLink>
            </li>
          ))}
        </ul>
        <p className={cn(styles.zeile, 'w-full')}>
          <Ziffern text={pflichtzeile(year)} />
        </p>
      </Container>
    </footer>
  );
}
