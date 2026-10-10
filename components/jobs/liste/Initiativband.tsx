import Link from 'next/link';
import { Icon } from '@/components/icons';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ContactOptions } from '@/components/site/ContactOptions';
import { bindSeparators } from '@/components/jobs/text';
import { TextLink } from '@/components/ui/TextLink';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { applyPath } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { INITIATIV, KONTAKT } from './liste-text';
import styles from './liste.module.css';

export interface InitiativbandProps {
  /** Wege, die nur im Bewerbungsflow stehen (status funnel_only), z. B. Quereinstieg. */
  auchMoeglich: readonly Job[];
}

/**
 * Initiativband der Stellenliste (Navy, wie das Schlussband der Startseite): links „Initiativ bewerben“ mit
 * der roten Hauptaktion dieser Ansicht, in die Vorlauf und Rücklauf von oben münden; rechts der persönliche
 * Draht zu Sabri Demir mit Telefon, WhatsApp und E-Mail (feste Reihenfolge, WCAG 3.2.6).
 * Die Initiativbewerbung (INITIATIVE_APPLY_PATH) bleibt der Weg, wenn keine Stelle passt.
 */
export function Initiativband({ auchMoeglich }: InitiativbandProps) {
  return (
    <Section tone="inverse" aria-labelledby="initiativ" className={styles.band}>
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-7">
          <div className={styles.bandText}>
            <h2 id="initiativ" className="text-title-1 text-brand">
              {INITIATIV.titel}
            </h2>
            <p className="mt-4 max-w-prose text-lead text-ink-muted">{INITIATIV.text}</p>
            {auchMoeglich.length > 0 ? (
              <p className="mt-3 max-w-prose text-body text-ink-muted">
                {INITIATIV.auchMoeglich}{' '}
                {auchMoeglich.map((job, i) => (
                  <span key={job.id}>
                    {i > 0 && ', '}
                    <TextLink href={applyPath(job)} tone="ink">
                      {bindSeparators(job.shortTitle)}
                    </TextLink>
                  </span>
                ))}
                .
              </p>
            ) : null}
          </div>
          <div data-primary-cta="" className={cn(styles.anschluss, 'mt-8')}>
            <span className={cn(styles.leitung, styles.vorlauf)} aria-hidden="true" />
            <span className={cn(styles.leitung, styles.ruecklauf)} aria-hidden="true" />
            <Link href={INITIATIVE_APPLY_PATH} className={cn(styles.aktion, 'rounded-1')} data-motion="druck">
              {INITIATIV.knopf}
              <Icon name="arrow-right" size="md" />
            </Link>
          </div>
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
