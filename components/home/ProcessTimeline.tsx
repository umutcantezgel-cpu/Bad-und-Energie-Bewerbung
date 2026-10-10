import Link from 'next/link';
import { Icon } from '@/components/icons';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { DISCRETION_PROMISE, PROCESS_INTRO, getProcessSteps } from '@/lib/content/process';
import { SectionHeader } from './SectionHeader';
import { ABLAUF_KOPF } from './woche/abschnitte-text';

/** Paarbreite: Vorlauf und Rücklauf im Abstand --paar, je ein Strich --m-strich. */
const PAAR_BREITE = 'w-[calc(var(--paar)+var(--m-strich))]';
const PAAR_HOEHE = 'h-[calc(var(--paar)+var(--m-strich))]';
const STRICH = 'border-(length:--m-strich)';

/**
 * Leitungsstrang des Ablaufs (E-START-027, Variante 1 Formsystem): das Paar Vorlauf/Rücklauf als
 * Fortschrittslinie, ein Heizkreis. Mobil kommt es vom linken Seitenrand (Rücklauf außen, Bogen --r-3;
 * Vorlauf innen, Bogen --r-2), läuft senkrecht an den drei Schritten entlang und kehrt unten im Bogen um.
 * Ab lg läuft es waagerecht über den drei Spalten und kehrt rechts um. Rein grafisch (aria-hidden); liegt
 * über den Abgängen der Schritte, damit sie sauber am Rücklauf ansetzen.
 */
function Leitungsstrang() {
  return (
    <>
      <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-0 lg:hidden ${PAAR_BREITE}`}>
        <span
          className={`absolute top-0 right-0 h-6 w-screen rounded-tr-3 border-t-(length:--m-strich) border-r-(length:--m-strich) border-ruecklauf`}
        />
        <span
          className={`absolute top-paar right-paar h-paar w-screen rounded-tr-2 border-t-(length:--m-strich) border-r-(length:--m-strich) border-vorlauf`}
        />
        <span
          className={`absolute inset-x-0 top-6 bottom-0 rounded-b-voll ${STRICH} border-t-0 border-r-ruecklauf border-b-vorlauf border-l-vorlauf`}
        />
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 right-0 hidden w-screen rounded-r-voll lg:block ${PAAR_HOEHE} ${STRICH} border-l-0 border-t-vorlauf border-r-vorlauf border-b-ruecklauf`}
      />
    </>
  );
}

/** #ablauf: drei Schritte am Leitungsstrang, die Diskretionszusage und die Hauptaktion. */
export function ProcessTimeline() {
  const steps = getProcessSteps('fachkraft');

  return (
    <Section id="ablauf" tone="subtle" aria-labelledby="ablauf-title" className="overflow-x-clip">
      <Container>
        <SectionHeader
          id="ablauf-title"
          eyebrow={ABLAUF_KOPF.etikett}
          title={PROCESS_INTRO.title}
          lead={PROCESS_INTRO.text}
        />

        <div className="relative mt-12">
          <ol className="grid gap-12 pt-12 pb-6 pl-12 lg:grid-cols-3 lg:gap-8 lg:pt-12 lg:pb-0 lg:pl-0">
            {steps.map((step) => (
              <li key={step.id} className="relative flex flex-col gap-3">
                {/* Abgang in Navy vom Rücklauf zur Schrittnummer: mobil waagerecht, ab lg senkrecht */}
                <span aria-hidden="true" className="relative self-start">
                  <span className="absolute top-1/2 right-full mr-2 h-(--m-strich) w-7 -translate-y-1/2 bg-brand lg:hidden" />
                  <span className="absolute bottom-full left-0 mb-2 hidden h-7 w-(--m-strich) bg-brand lg:block" />
                  <span className="font-mass text-lead font-semibold text-brand">{String(step.number).padStart(2, '0')}</span>
                </span>
                <h3 className="text-title-3 text-brand">
                  <span className="sr-only">Schritt {step.number}: </span>
                  {step.title}
                </h3>
                <p className="max-w-prose text-body text-ink-muted">{step.text}</p>
                <p className="mt-1 text-etikett text-ink">{step.highlight}</p>
              </li>
            ))}
          </ol>
          <Leitungsstrang />
        </div>

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
