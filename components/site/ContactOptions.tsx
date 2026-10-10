import { Fragment } from 'react';
import { Icon, type IconName } from '@/components/icons';
import { COMPANY } from '@/lib/content/company';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import { cn } from '@/lib/utils/cn';

/**
 * Opening hours such as „Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr“: line breaks only between the day groups
 * (as OpeningHoursText), the times in Bricolage digits (`ziffer`, Variante 1), because Atkinson draws the zero
 * with a slash („Ø“). Text unchanged.
 */
function HoursText({ text }: { text: string }) {
  return text.split(', ').map((group, i) => (
    <Fragment key={i}>
      {i > 0 && ', '}
      <span className="whitespace-nowrap">
        {group.split(/(\d{2}:\d{2}–\d{2}:\d{2})/).map((part, j) =>
          j % 2 === 1 ? (
            <span key={j} className="ziffer">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </span>
    </Fragment>
  ));
}

export interface ContactOptionsProps {
  /**
   * `card`: stacked rows on surface-2 (sidebars, thank-you page). `inline`: one row of links (error pages, flow).
   * `list`: the stacked rows of `card` without the card surface, for a block that already has its own surface,
   * e.g. the closing band of the home page (R3-HOME-04, E-START-048).
   */
  variant?: 'card' | 'inline' | 'list';
  /** Prefilled WhatsApp text; defaults to the general message from buildWhatsAppUrl(). */
  whatsappMessage?: string;
  /** `card` only: names the contact person above the channels, e.g. on job pages (ROADMAP §5). */
  person?: { name: string; role: string };
  className?: string;
}

export interface ContactChannel {
  id: 'phone' | 'whatsapp' | 'email';
  href: string;
  label: string;
  value: string;
  icon: IconName;
  external?: boolean;
}

/** Phone, WhatsApp, e-mail: always this order on every page (WCAG 3.2.6 Consistent Help, E-START-048). */
export function contactChannels(whatsappMessage?: string): ContactChannel[] {
  return [
    { id: 'phone', href: COMPANY.phone.href, label: 'Anrufen', value: COMPANY.phone.display, icon: 'phone' },
    {
      id: 'whatsapp',
      href: buildWhatsAppUrl(whatsappMessage),
      label: 'WhatsApp',
      value: 'Nachricht schreiben',
      icon: 'message-circle',
      external: true,
    },
    { id: 'email', href: COMPANY.emailHref, label: 'E-Mail', value: COMPANY.email, icon: 'mail' },
  ];
}

const NEW_TAB_HINT = ' (öffnet in neuem Tab)';

/**
 * Phone, WhatsApp and e-mail with the opening hours. Always the same order on every page
 * (WCAG 3.2.6 Consistent Help). Server-safe: no hooks, no client JS. Icons from components/icons
 * (3 px stroke, KERN K-010); the phone number in Bricolage digits (`ziffer`).
 */
export function ContactOptions({ variant = 'card', whatsappMessage, person, className }: ContactOptionsProps) {
  const items = contactChannels(whatsappMessage);
  const hours = (
    <p className="text-footnote text-ink-muted">
      Öffnungszeiten: <HoursText text={COMPANY.openingHours.short} />
    </p>
  );

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          {items.map(({ id, href, label, value, icon, external }) => (
            <li key={id}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="inline-flex min-h-11 items-center gap-2 rounded-1 text-body font-medium text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                <Icon name={icon} size="md" className="text-ink-muted" />
                <span className={cn(id === 'phone' && 'ziffer')}>{id === 'whatsapp' ? label : value}</span>
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

  const rows = (
    <ul className="flex flex-col divide-y divide-line">
      {items.map(({ id, href, label, value, icon, external }) => (
        <li key={id}>
          <a
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="group flex min-h-14 items-center gap-4 rounded-1 py-2"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-voll bg-surface-3 text-brand">
              <Icon name={icon} size="md" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-footnote text-ink-muted">{label}</span>
              <span
                className={cn(
                  'truncate text-body font-medium text-ink underline-offset-4 group-hover:underline',
                  id === 'phone' && 'ziffer',
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
  );

  if (variant === 'list') {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        {rows}
        {hours}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4 rounded-2 bg-surface-2 p-6', className)}>
      {person && (
        <p className="flex flex-col">
          <span className="text-footnote text-ink-muted">Dein Ansprechpartner</span>
          <span className="text-body font-semibold text-ink">{person.name}</span>
          <span className="text-callout text-ink-muted">{person.role}</span>
        </p>
      )}
      {rows}
      {hours}
    </div>
  );
}
