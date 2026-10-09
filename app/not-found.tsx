import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';

export const metadata: Metadata = {
  title: 'Seite nicht gefunden',
  description: 'Diese Seite gibt es nicht. Hier geht es zu den offenen Stellen und zur Bewerbung.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Section aria-labelledby="not-found-title">
      <Container className="flex flex-col items-start gap-6">
        <p className="text-numeral text-ink-muted">
          <span className="sr-only">Fehler </span>404
        </p>
        <h1 id="not-found-title" className="text-title-1 text-ink">
          Diese Seite gibt es nicht.
        </h1>
        <p className="max-w-prose text-lead text-ink-muted">
          Vielleicht hat sich die Adresse geändert. Die offenen Stellen und die Bewerbung findest du hier.
        </p>
        <div data-primary-cta className="mt-2 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/bewerbung">Jetzt bewerben</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/jobs">Offene Stellen</Link>
          </Button>
        </div>
        <TextLink href="/" standalone tone="muted">
          Zur Startseite
        </TextLink>
      </Container>
    </Section>
  );
}
