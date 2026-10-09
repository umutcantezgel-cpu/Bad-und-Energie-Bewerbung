'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Phone, RotateCcw } from 'lucide-react';
import { buttonVariants } from '@/components/ui/variants';
import { CONTACT_PHONE as PHONE } from '@/lib/data/contact';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

// Loaded on every page: class recipes instead of <Button>/<Container> (no tailwind-merge) and the
// small contact module instead of SITE_CONFIG keep this out of the shared client bundle.
const WHATSAPP_HREF = buildWhatsAppUrl(
  'Guten Tag Herr Demir, auf der Karriereseite ist ein technischer Fehler aufgetreten. Ich melde mich deshalb direkt.',
);

const contactLinkClass =
  'inline-flex min-h-11 items-center gap-2 rounded-xs text-body font-medium text-ink underline decoration-1 underline-offset-4 hover:decoration-2';

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // Container classes written out: <Container> goes through cn() and would pull in tailwind-merge.
    <div className="mx-auto box-content flex max-w-content flex-col items-start gap-6 px-gutter py-section">
      <h1 className="text-title-1 text-ink">Da ist etwas schiefgelaufen.</h1>
      <p className="max-w-prose text-lead text-ink-muted">
        Bitte versuch es noch einmal. Wenn es weiter hakt, erreichst du uns direkt per Telefon oder WhatsApp.
      </p>
      {error.digest && (
        <p className="text-footnote text-ink-muted">
          Fehlernummer: <span className="tabular-nums">{error.digest}</span>
        </p>
      )}
      <div data-primary-cta className="mt-2 flex flex-wrap items-center gap-3">
        <button type="button" className={buttonVariants({ size: 'lg' })} onClick={() => retry()}>
          <RotateCcw aria-hidden="true" strokeWidth={1.75} className="size-5" />
          Erneut versuchen
        </button>
        <Link href="/" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
          Zur Startseite
        </Link>
      </div>
      <ul className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4">
        <li>
          <a href={PHONE.href} className={contactLinkClass}>
            <Phone aria-hidden="true" strokeWidth={1.75} className="size-5 text-ink-muted" />
            <span className="tabular-nums">{PHONE.display}</span>
            <span className="sr-only"> anrufen</span>
          </a>
        </li>
        <li>
          <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className={contactLinkClass}>
            <MessageCircle aria-hidden="true" strokeWidth={1.75} className="size-5 text-ink-muted" />
            WhatsApp
            <span className="sr-only"> (öffnet in neuem Tab)</span>
          </a>
        </li>
      </ul>
    </div>
  );
}
