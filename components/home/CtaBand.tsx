import Link from 'next/link';
import { Fragment } from 'react';
import { Icon } from '@/components/icons';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ContactOptions } from '@/components/site/ContactOptions';
import { APPLY_PATH, SHORT_APPLY_LABEL } from '@/components/site/nav';
import { cn } from '@/lib/utils/cn';
import { KONTAKT, UNVERBINDLICH, schuetzeNamen } from './betrieb/betrieb-text';
import { CTA } from './content';
import styles from './betrieb/schlussband.module.css';

const NBSP = '\u00A0';

/**
 * Schlussband (E-START-051, E-START-048), das zweite und letzte Navy-Band der Startseite.
 * - Links der Rückruf auf die Leitidee: „Bewirb dich bei uns.“, die Antwortzusage (Fakt quickResponse) und
 *   „Jetzt bewerben“ als die eine rote Fläche; Vorlauf und Rücklauf kommen von oben und enden im Knopf.
 *   Darunter „Unverbindlich …“ (Wesenskern des Altstands, ohne Druck).
 * - Rechts bzw. darunter der persönliche Draht: „Sprich direkt mit Sabri Demir“, Rolle, dann Telefon,
 *   WhatsApp, E-Mail in fester Reihenfolge (WCAG 3.2.6) mit den Öffnungszeiten.
 */
export function CtaBand() {
  return (
    <Section tone="inverse" aria-labelledby="cta-title" className={styles.band}>
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-7">
          <div className={styles.text}>
            <h2 id="cta-title" className="text-title-1 text-brand">
              {CTA.title}
            </h2>
            <p className="mt-4 max-w-prose text-lead text-ink-muted">{schuetzeNamen(CTA.lead)}</p>
          </div>
          <div data-primary-cta className={cn(styles.anschluss, 'mt-8')}>
            <span className={cn(styles.leitung, styles.vorlauf)} aria-hidden="true" />
            <span className={cn(styles.leitung, styles.ruecklauf)} aria-hidden="true" />
            <Link href={APPLY_PATH} className={cn(styles.aktion, 'rounded-1')} data-motion="druck">
              {SHORT_APPLY_LABEL}
              <Icon name="arrow-right" size="md" />
            </Link>
          </div>
          {/* Umbruch nur vor einem Trennpunkt: der Punkt wandert an den Zeilenanfang, nie hängt er am Ende */}
          <p className="mt-4 text-etikett text-ink-2">
            {UNVERBINDLICH.split(' · ').map((teil, i) => (
              <Fragment key={teil}>
                {i > 0 && ' '}
                <span className="whitespace-nowrap">{i > 0 ? `·${NBSP}${teil}` : teil}</span>
              </Fragment>
            ))}
          </p>
        </div>

        <div className="border-t border-line pt-8 lg:col-span-5 lg:border-t-0 lg:pt-0">
          <p className="text-etikett text-ink-muted">{KONTAKT.etikett}</p>
          <h3 className="mt-3 text-title-3 text-brand">{KONTAKT.titel}</h3>
          <p className="mt-1 text-callout text-ink-muted">{KONTAKT.rolle}</p>
          <ContactOptions variant="list" className="mt-4" />
        </div>
      </Container>
    </Section>
  );
}
