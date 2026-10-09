import type { ComponentType, SVGProps } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { COMPANY } from '@/lib/content/company';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import { cn } from '@/lib/utils/cn';
import { OpeningHoursText } from './OpeningHoursText';

export interface ContactOptionsProps {
  /** `card`: stacked rows on surface-2 (sidebars, thank-you page). `inline`: one row of links (CTA band, error pages). */
  variant?: 'card' | 'inline';
  /** Prefilled WhatsApp text; defaults to the general message from buildWhatsAppUrl(). */
  whatsappMessage?: string;
  /** `card` only: names the contact person above the channels, e.g. on job pages (ROADMAP §5). */
  person?: { name: string; role: string };
  className?: string;
}

interface ContactChannel {
  id: 'phone' | 'whatsapp' | 'email';
  href: string;
  label: string;
  value: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  external?: boolean;
}

function channels(whatsappMessage?: string): ContactChannel[] {
  return [
    { id: 'phone', href: COMPANY.phone.href, label: 'Anrufen', value: COMPANY.phone.display, Icon: Phone },
    {
      id: 'whatsapp',
      href: buildWhatsAppUrl(whatsappMessage),
      label: 'WhatsApp',
      value: 'Nachricht schreiben',
      Icon: MessageCircle,
      external: true,
    },
    { id: 'email', href: COMPANY.emailHref, label: 'E-Mail', value: COMPANY.email, Icon: Mail },
  ];
}

const NEW_TAB_HINT = ' (öffnet in neuem Tab)';

/**
 * Phone, WhatsApp and e-mail with the opening hours. Always the same order on every page
 * (WCAG 3.2.6 Consistent Help). Server-safe: no hooks, no client JS.
 */
export function ContactOptions({ variant = 'card', whatsappMessage, person, className }: ContactOptionsProps) {
  const items = channels(whatsappMessage);
  const hours = (
    <p className="text-footnote text-ink-muted">
      Öffnungszeiten: <OpeningHoursText text={COMPANY.openingHours.short} />
    </p>
  );

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          {items.map(({ id, href, label, value, Icon, external }) => (
            <li key={id}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="inline-flex min-h-11 items-center gap-2 rounded-xs text-body font-medium text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                <Icon aria-hidden="true" strokeWidth={1.75} className="size-5 text-ink-muted" />
                <span className={cn(id === 'phone' && 'tabular-nums')}>{id === 'whatsapp' ? label : value}</span>
                {id === 'phone' && <span className="sr-only"> anrufen</span>}
                {external && <span className="sr-only">{NEW_TAB_HINT}</span>}
              </a>
            </li>
          ))}
        </ul>
        {hours}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4 rounded-lg bg-surface-2 p-6', className)}>
      {person && (
        <p className="flex flex-col">
          <span className="text-footnote text-ink-muted">Dein Ansprechpartner</span>
          <span className="text-body font-semibold text-ink">{person.name}</span>
          <span className="text-callout text-ink-muted">{person.role}</span>
        </p>
      )}
      <ul className="flex flex-col divide-y divide-line">
        {items.map(({ id, href, label, value, Icon, external }) => (
          <li key={id}>
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="group flex min-h-14 items-center gap-4 rounded-xs py-2"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink">
                <Icon aria-hidden="true" strokeWidth={1.75} className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-footnote text-ink-muted">{label}</span>
                <span
                  className={cn(
                    'truncate text-body font-medium text-ink underline-offset-4 group-hover:underline',
                    id === 'phone' && 'tabular-nums',
                  )}
                >
                  {value}
                </span>
              </span>
              {external && <span className="sr-only">{NEW_TAB_HINT}</span>}
            </a>
          </li>
        ))}
      </ul>
      {hours}
    </div>
  );
}
