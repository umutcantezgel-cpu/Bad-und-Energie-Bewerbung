import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Container } from '@/components/layout/Container';
import { Leitungstrenner } from '@/components/zeichnung';
import { COMPANY } from '@/lib/content/company';
import { jobPath } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { FooterPlaces } from '../FooterPlaces';
import { OpeningHoursText } from '../OpeningHoursText';
import { ALLE_STELLEN, FUSS_SPALTEN, KUNDEN_WEBSITE, RECHTS_LINKS, fussKontakte, pflichtzeile } from './fuss-text';
import { FussLink } from './FussLink';
import { Ziffern } from './Ziffern';
import styles from './fuss.module.css';

function Spalte({ id, titel, className, children }: { id: string; titel: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn(styles.spalte, className)}>
      <h2 id={id} className={cn(styles.kopf, 'text-etikett text-ink-2')}>
        {titel}
      </h2>
      {children}
    </div>
  );
}

export interface FussVollProps {
  year: number;
  /** Stichtag für die live Stellen (Tests); Standard: jetzt. */
  now?: Date;
}

/**
 * Voller Fuß (R4-SHELL-02, E-023): Navy-Band mit dem Leitungspaar als oberem Abschluss, Logo auf der Plakette
 * und dem Weg zur Kunden-Website (E-SHELL-008); vier Spalten Betrieb (Anschrift, Öffnungszeiten) · Kontakt
 * (Telefon, WhatsApp, E-Mail; E-SHELL-005) · Stellen (E-SHELL-020) · Rechtliches (mit „Datenschutz für
 * Bewerbende“, E-RECHT-008); darunter die Ortsliste (E-SHELL-021) und die Fußzeile mit Register und Innung
 * (E-RECHT-007, E-SHELL-018). Keine rote Fläche: die Hauptaktion steht auf der Seite selbst.
 */
export function FussVoll({ year, now = new Date() }: FussVollProps) {
  // Wie Stellenseiten und Sitemap: eine Stelle nach validThrough bekommt keinen Fußlink mehr.
  const jobs = getActiveJobs().filter((job) => isJobLive(job, now));

  return (
    <footer data-tone="inverse" className={cn(styles.fuss, styles.reserve, 'bg-surface text-ink print-hidden')}>
      <Leitungstrenner className={styles.trenner} />
      <Container size="wide" className={styles.inhalt}>
        <div className={styles.marke}>
          <Link href="/" className={styles.logoLink} data-motion="druck">
            <Logo size="md" />
            <span className="sr-only"> – zur Startseite</span>
          </Link>
          <p className={styles.kunde}>
            <FussLink href={KUNDEN_WEBSITE.href} extern stark pfeil>
              {KUNDEN_WEBSITE.label}
            </FussLink>
            <span className={styles.unterzeile}>{KUNDEN_WEBSITE.domain}</span>
          </p>
        </div>

        <div className={styles.spalten}>
          <Spalte {...spalte('betrieb')} className={styles.betrieb}>
            <address className={styles.adresse}>
              <span className={styles.firma}>{COMPANY.name}</span>
              <Ziffern text={COMPANY.address.street} />
              <br />
              <Ziffern text={`${COMPANY.address.postalCode} ${COMPANY.address.city}`} />
            </address>
            <p className={styles.zeiten}>
              <span className={cn(styles.zeitenName, 'text-etikett')}>Öffnungszeiten</span>
              <OpeningHoursText text={COMPANY.openingHours.short} />
            </p>
          </Spalte>

          <Spalte {...spalte('kontakt')} className={styles.kontakt}>
            <ul className={styles.liste}>
              {fussKontakte().map((k) => (
                <li key={k.id}>
                  <FussLink href={k.href} icon={k.icon} extern={k.extern} vorsatz={k.vorsatz}>
                    {k.id === 'phone' ? <span className="ziffer">{k.text}</span> : k.text}
                  </FussLink>
                </li>
              ))}
            </ul>
          </Spalte>

          <Spalte {...spalte('stellen')} className={styles.stellen}>
            <nav aria-labelledby={FUSS_SPALTEN.stellen.id}>
              <ul className={styles.liste}>
                {jobs.map((job) => (
                  <li key={job.id}>
                    <FussLink href={jobPath(job)}>{job.shortTitle}</FussLink>
                  </li>
                ))}
                <li>
                  <FussLink href={ALLE_STELLEN.href} stark pfeil>
                    {ALLE_STELLEN.label}
                  </FussLink>
                </li>
              </ul>
            </nav>
          </Spalte>

          <Spalte {...spalte('rechtliches')} className={styles.rechtliches}>
            <nav aria-labelledby={FUSS_SPALTEN.rechtliches.id}>
              <ul className={styles.liste}>
                {RECHTS_LINKS.map((link) => (
                  <li key={link.href}>
                    <FussLink href={link.href}>{link.label}</FussLink>
                  </li>
                ))}
              </ul>
            </nav>
          </Spalte>
        </div>

        <FooterPlaces className={styles.orte} />

        <p className={styles.zeile}>
          <Ziffern text={pflichtzeile(year)} />
        </p>
      </Container>
    </footer>
  );
}

function spalte(key: keyof typeof FUSS_SPALTEN) {
  return FUSS_SPALTEN[key];
}
