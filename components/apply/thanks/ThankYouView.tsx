'use client';

import { useEffect, useReducer } from 'react';
import Link from 'next/link';
import { Check, Mail, MessageCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { formatBerlinDateTime, isWithinOpeningHours } from '@/lib/apply/office-hours';
import { MAPPE_PATH } from '@/lib/apply/params';
import { readSubmitted, removeLegacyDossier, type SubmittedApplication } from '@/lib/apply/storage';
import { buildVCard, vcardDataUri } from '@/lib/apply/vcard';
import { buildFollowUpMessage } from '@/lib/apply/whatsapp-message';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import { cn } from '@/lib/utils/cn';
import { CheckMark } from './CheckMark';
import { FollowUpForm } from './FollowUpForm';
import type { ThankYouCompany, ThankYouViewProps } from './types';

type ViewState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'ready'; record: SubmittedApplication; officeOpen: boolean };

const reduce = (_: ViewState, next: ViewState): ViewState => next;

interface TimelineItem {
  id: string;
  title: string;
  text?: string;
  note?: string;
  done?: boolean;
}

/**
 * Danke-Seite (ROADMAP §6): liest die abgeschickte Bewerbung aus sessionStorage (C7).
 * Ohne Eintrag (neuer Tab, direkt aufgerufen) zeigt sie eine neutrale Seite mit Links.
 */
export function ThankYouView({ jobs, processSteps, company, quickResponse, noCvNeeded, contactOptions }: ThankYouViewProps) {
  const [view, setView] = useReducer(reduce, { status: 'loading' });

  useEffect(() => {
    removeLegacyDossier();
    const record = readSubmitted();
    setView(
      record
        ? { status: 'ready', record, officeOpen: isWithinOpeningHours(new Date(), company.openingHoursSpec) }
        : { status: 'missing' },
    );
  }, [company.openingHoursSpec]);

  // Vor dem Lesen des Speichers (Server-HTML, erster Client-Render): Seite hat trotzdem eine h1.
  if (view.status === 'loading') {
    return (
      <div aria-busy="true" className="min-h-96">
        <h1 className="sr-only">Danke für deine Bewerbung</h1>
      </div>
    );
  }
  if (view.status === 'missing') return <NoApplication contactOptions={contactOptions} />;

  const { record, officeOpen } = view;
  const job = jobs[record.jobId];
  const steps = processSteps[job?.questionSet ?? 'fachkraft'] ?? processSteps.fachkraft;
  const timeline: TimelineItem[] = [
    { id: 'gesendet', title: 'Bewerbung gesendet', done: true },
    {
      id: 'rueckmeldung',
      title: 'Rückmeldung',
      text: quickResponse,
      note: officeOpen
        ? undefined
        : `Gerade ist unser Büro nicht besetzt. Wir melden uns zu den Öffnungszeiten: ${company.openingHoursShort}.`,
    },
    ...steps.filter((step) => step.id !== 'bewerben').map((step) => ({ id: step.id, title: step.title, text: step.text })),
  ];

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col items-start gap-4">
        <CheckMark />
        <h1 className="text-title-1 text-ink">{record.firstName ? `Danke, ${record.firstName}.` : 'Danke.'}</h1>
        <p className="text-lead text-ink-muted">Deine Bewerbung ist da.</p>
      </header>

      <dl className="grid gap-x-6 gap-y-3 rounded-lg bg-surface-2 p-6 sm:grid-cols-[auto_1fr]">
        <dt className="text-callout text-ink-muted">Bewerbungsnummer</dt>
        <dd className="text-body font-semibold tabular-nums text-ink">{record.reference}</dd>
        {job && (
          <>
            <dt className="text-callout text-ink-muted">Stelle</dt>
            <dd className="text-body text-ink">{job.label}</dd>
          </>
        )}
        <dt className="text-callout text-ink-muted">Eingegangen</dt>
        <dd className="text-body tabular-nums text-ink">{formatBerlinDateTime(new Date(record.submittedAt))}</dd>
      </dl>

      <section aria-labelledby="danke-ablauf" className="flex flex-col gap-6">
        <h2 id="danke-ablauf" className="text-title-3 text-ink">
          So geht es weiter
        </h2>
        <Timeline items={timeline} />
      </section>

      <section aria-labelledby="danke-nummer" className="flex flex-col items-start gap-4">
        <h2 id="danke-nummer" className="text-title-3 text-ink">
          Nummer speichern
        </h2>
        <p className="max-w-prose text-body text-ink-muted">
          Speichere unsere Nummer <span className="whitespace-nowrap tabular-nums text-ink">{company.phoneDisplay}</span>, damit
          du uns erkennst, wenn wir uns melden.
        </p>
        <Button asChild variant="outline">
          <a href={vcardDataUri(buildVCard(vcardFor(company)))} download="bad-und-energie.vcf">
            <UserPlus aria-hidden="true" strokeWidth={1.75} className="size-5" />
            Nummer speichern
          </a>
        </Button>
      </section>

      <section aria-labelledby="danke-ergaenzen" className="flex flex-col gap-6 rounded-lg bg-surface-2 p-6">
        <div className="flex flex-col gap-1">
          <h2 id="danke-ergaenzen" className="text-title-3 text-ink">
            Möchtest du noch etwas ergänzen?
          </h2>
          <p className="text-callout text-ink-muted">Alles freiwillig.</p>
        </div>
        <FollowUpForm reference={record.reference} followUpToken={record.followUpToken} phoneHref={company.phoneHref} />
        <TextLink href={MAPPE_PATH} standalone className="self-start">
          Bewerbungsmappe ergänzen (optional)
        </TextLink>
      </section>

      <section aria-labelledby="danke-unterlagen" className="flex flex-col items-start gap-4">
        <h2 id="danke-unterlagen" className="text-title-3 text-ink">
          Unterlagen schicken
        </h2>
        <p className="max-w-prose text-body text-ink-muted">
          {noCvNeeded} Wenn du Zeugnisse oder einen Lebenslauf zur Hand hast, kannst du sie per WhatsApp oder E-Mail nachreichen.
          Nenn dabei deine Bewerbungsnummer.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <a
              href={buildWhatsAppUrl(buildFollowUpMessage({ reference: record.reference }))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle aria-hidden="true" strokeWidth={1.75} className="size-5" />
              Per WhatsApp
              <span className="sr-only"> (öffnet WhatsApp)</span>
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={mailtoFor(company.email, record.reference)}>
              <Mail aria-hidden="true" strokeWidth={1.75} className="size-5" />
              Per E-Mail
            </a>
          </Button>
        </div>
      </section>

      {contactOptions && (
        <section aria-labelledby="danke-kontakt" className="flex flex-col gap-4">
          <h2 id="danke-kontakt" className="text-title-3 text-ink">
            Fragen?
          </h2>
          {contactOptions}
        </section>
      )}
    </div>
  );
}

function vcardFor(company: ThankYouCompany) {
  return {
    formattedName: company.shortName,
    organization: company.legalName,
    phone: company.phoneE164,
    email: company.email,
    street: company.street,
    postalCode: company.postalCode,
    city: company.city,
    region: company.region,
    country: company.countryName,
    url: company.website,
  };
}

function mailtoFor(email: string, reference: string): string {
  const subject = `Unterlagen zur Bewerbung ${reference}`;
  const body = `Guten Tag,\n\nanbei meine Unterlagen zur Bewerbung ${reference}.\n`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Timeline({ items }: { items: readonly TimelineItem[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
          {index < items.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-4 top-9 w-px bg-line" />}
          <span
            aria-hidden="true"
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full text-callout font-semibold tabular-nums',
              item.done ? 'bg-success-subtle text-success' : 'bg-surface-3 text-ink',
            )}
          >
            {item.done ? <Check strokeWidth={2.5} className="size-4" /> : index + 1}
          </span>
          <div className="flex min-w-0 flex-col gap-1 pt-1">
            <h3 className="text-body font-semibold text-ink">
              {item.title}
              {item.done && <span className="sr-only"> (erledigt)</span>}
            </h3>
            {item.text && <p className="max-w-prose text-callout text-ink-muted">{item.text}</p>}
            {item.note && <p className="max-w-prose text-callout text-ink">{item.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function NoApplication({ contactOptions }: { contactOptions?: ThankYouViewProps['contactOptions'] }) {
  return (
    <div className="flex flex-col items-start gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-title-1 text-ink">Deine Bewerbung</h1>
        <p className="max-w-prose text-body text-ink-muted">
          Hier siehst du nach dem Absenden deine Bewerbungsnummer und wie es weitergeht. In diesem Fenster ist gerade keine
          Bewerbung gespeichert, zum Beispiel weil die Seite in einem neuen Tab geöffnet wurde.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Button asChild size="lg">
          <Link href="/bewerbung">Jetzt bewerben</Link>
        </Button>
        <TextLink href="/jobs" standalone>
          Offene Stellen ansehen
        </TextLink>
      </div>
      {contactOptions}
    </div>
  );
}
