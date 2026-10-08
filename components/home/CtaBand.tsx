import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ContactOptions } from '@/components/site/ContactOptions';
import { Button } from '@/components/ui/Button';
import { CTA } from './content';

/** Closing inverse band: headline, white button (ink fill flips to white in the band), phone and WhatsApp. */
export function CtaBand() {
  return (
    <Section tone="inverse" aria-labelledby="cta-title">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <h2 id="cta-title" className="text-title-1 text-ink">
            {CTA.title}
          </h2>
          <p className="max-w-prose text-lead text-ink-muted">{CTA.lead}</p>
        </div>
        <div data-primary-cta className="self-start">
          <Button asChild variant="contrast" size="xl">
            <Link href="/bewerbung">Jetzt bewerben</Link>
          </Button>
        </div>
        <ContactOptions variant="inline" className="border-t border-line pt-6" />
      </Container>
    </Section>
  );
}
