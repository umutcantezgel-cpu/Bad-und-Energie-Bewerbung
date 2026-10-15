import Link from 'next/link';
import { Icon } from '@/components/icons';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { ABLAUF_LISTE, AblaufNummer, AblaufStrang } from '@/components/jobs/AblaufStrang';
import { AblaufVarianten } from '@/components/jobs/AblaufVarianten';
import { DISCRETION_PROMISE, PROCESS_INTRO, sammelAblauf } from '@/lib/content/process';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { SectionHeader } from './SectionHeader';
import { ABLAUF_KOPF } from './woche/abschnitte-text';

/**
 * #ablauf auf der Wand (Tonfolge E-023): drei Schritte am Leitungsstrang (AblaufStrang, derselbe wie auf den
 * Stellenseiten), die Diskretionszusage und die Hauptaktion.
 * Die Startseite zeigt alle offenen Stellen (Sammelfläche): Schritt 3 trägt „Für Fachkräfte“, darunter steht, was bei
 * den anderen Stellen anders läuft (sammelAblauf; Prüfung E-029, Runde 3).
 */
export function ProcessTimeline({ now = new Date() }: { now?: Date }) {
  const { schritte: steps, varianten } = sammelAblauf(getActiveJobs().filter((job) => isJobLive(job, now)));

  return (
    <Section id="ablauf" tone="wand" aria-labelledby="ablauf-title">
      <Container>
        <SectionHeader
          id="ablauf-title"
          eyebrow={ABLAUF_KOPF.etikett}
          title={PROCESS_INTRO.title}
          lead={PROCESS_INTRO.text}
          klammer
        />

        <div className="relative mt-12">
          <ol className={ABLAUF_LISTE}>
            {steps.map((step) => (
              <li key={step.id} className="relative flex flex-col gap-3">
                <AblaufNummer nummer={step.number} />
                <h3 className="text-title-3 text-brand">
                  <span className="sr-only">Schritt {step.number}: </span>
                  {step.title}
                </h3>
                <p className="max-w-prose text-body text-ink-muted">{step.text}</p>
                <p className="mt-1 text-etikett text-ink">{step.highlight}</p>
              </li>
            ))}
          </ol>
          <AblaufStrang />
        </div>

        <AblaufVarianten varianten={varianten} className="mt-12" />

        <div className="mt-12 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <p className="flex max-w-prose items-start gap-3 text-lead text-ink">
            {/* Icon auf die Mitte der ersten Zeile */}
            <span className="flex h-[1lh] shrink-0 items-center">
              <Icon name="shield-check" size="lg" className="text-brand" />
            </span>
            {DISCRETION_PROMISE}
          </p>
          <div data-primary-cta className="shrink-0">
            <Button asChild size="lg">
              <Link href="/bewerbung">Jetzt bewerben</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
