'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/icons';
import { buttonVariants } from '@/components/ui/variants';
import { CONTACT_PHONE as PHONE } from '@/lib/data/contact';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

// Loaded on every page: class recipes instead of <Button>/<Container> (no tailwind-merge), the own icon family
// (components/icons, no cn) and the small contact module instead of SITE_CONFIG keep this out of the shared
// client bundle.
const WHATSAPP_HREF = buildWhatsAppUrl(
  'Guten Tag Herr Demir, auf der Karriereseite ist ein technischer Fehler aufgetreten. Ich melde mich deshalb direkt.',
);

const contactLinkClass =
  'inline-flex min-h-11 items-center gap-2 rounded-1 text-body font-bold text-ink underline decoration-brand decoration-3 underline-offset-4 pointer-fine:hover:decoration-ruecklauf';

/*
 * Laufzeit-Fehlerseite (E-SHELL-028; Darstellung R5-RUHE): ruhig wie der Seitenkopf `ruhig` – Etikett in
 * Versalien, h1 in Bricolage und Marken-Navy, Text, die Fehlernummer als Maß in Martian Mono, roter Knopf
 * „Erneut versuchen“ als einzige Hauptaktion, Telefon und WhatsApp mit Icons der eigenen Familie.
 * Fehlerbehandlung (retry, console.error) und Texte unverändert.
 */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // Container classes written out: <Container> goes through cn() and would pull in tailwind-merge.
    <div className="mx-auto box-content flex max-w-content flex-col items-start gap-6 px-gutter py-section">
      <p className="text-etikett text-ink-2">Technischer Fehler</p>
      <h1 className="-mt-2 font-display text-title-1 text-brand">Da ist etwas schiefgelaufen.</h1>
      <p className="max-w-prose text-lead text-ink-2">
        Bitte versuch es noch einmal. Wenn es weiter hakt, erreichst du uns direkt per Telefon oder WhatsApp.
      </p>
      {error.digest && (
        <p className="text-footnote text-ink-2">
          Fehlernummer: <span className="font-mass text-callout text-brand">{error.digest}</span>
        </p>
      )}
      <div data-primary-cta className="mt-2 flex flex-wrap items-center gap-3">
        <button type="button" className={buttonVariants({ size: 'lg' })} data-motion="druck" onClick={() => retry()}>
          <Icon name="rotate-ccw" size="md" />
          Erneut versuchen
        </button>
        <Link href="/" className={buttonVariants({ size: 'lg', variant: 'outline' })} data-motion="druck">
          Zur Startseite
        </Link>
      </div>
      <ul className="flex flex-wrap gap-x-8 gap-y-1 border-t-3 border-brand pt-4">
        <li>
          <a href={PHONE.href} className={contactLinkClass} data-motion="druck">
            <Icon name="phone" size="md" className="text-brand" />
            <span className="ziffer">{PHONE.display}</span>
            <span className="sr-only"> anrufen</span>
          </a>
        </li>
        <li>
          <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className={contactLinkClass} data-motion="druck">
            <Icon name="message-circle" size="md" className="text-brand" />
            WhatsApp
            <span className="sr-only"> (öffnet in neuem Tab)</span>
          </a>
        </li>
      </ul>
    </div>
  );
}
