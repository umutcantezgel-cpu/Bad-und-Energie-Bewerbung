import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { DISCRETION_PROMISE, PROCESS_INTRO, getProcessSteps } from '@/lib/content/process';
import { SectionHeader } from './SectionHeader';

/** #ablauf: three steps as an ordered list with large numerals, the discretion promise and the primary action. */
export function ProcessTimeline() {
  const steps = getProcessSteps('fachkraft');

  return (
    <Section id="ablauf" tone="subtle" aria-labelledby="ablauf-title">
      <Container>
        <SectionHeader id="ablauf-title" title={PROCESS_INTRO.title} lead={PROCESS_INTRO.text} />

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <li key={step.id} className="flex flex-col gap-3 border-t border-line-strong pt-6">
              <span aria-hidden="true" className="text-title-1 tabular-nums text-ink">
                {step.number}
              </span>
              <h3 className="text-title-3 text-ink">
                <span className="sr-only">Schritt {step.number}: </span>
                {step.title}
              </h3>
              <p className="max-w-prose text-body text-ink-muted">{step.text}</p>
              <Tag className="mt-1 self-start">{step.highlight}</Tag>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <p className="flex max-w-prose items-start gap-3 text-body text-ink">
            <ShieldCheck aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-ink-muted" />
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
