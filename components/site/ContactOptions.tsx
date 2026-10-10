import { Icon, type IconName } from '@/components/icons';
import { Rohrklammer } from '@/components/zeichnung';
import { COMPANY } from '@/lib/content/company';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import { cn } from '@/lib/utils/cn';
import styles from './fuss/kontakt.module.css';
import { OpeningHoursText } from './OpeningHoursText';

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
 * Phone, WhatsApp and e-mail with the opening hours. Always the same order on every page (WCAG 3.2.6 Consistent
 * Help). Server-safe: no hooks, no client JS. In the form system of the home page entry (R4-SHELL-02, E-023):
 * icons of the own family in a box with a navy outline (3 px), channel names as mono labels (`text-etikett`),
 * underlines in stroke width, the phone number and times in Bricolage digits (`ziffer`), press feedback `druck`.
 */
export function ContactOptions({ variant = 'card', whatsappMessage, person, className }: ContactOptionsProps) {
  const items = contactChannels(whatsappMessage);
  const hours = (
    <p className="text-footnote text-ink-muted">
      <span className="font-bold text-ink">Öffnungszeiten:</span> <OpeningHoursText text={COMPANY.openingHours.short} />
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
                className={cn(styles.inline, 'inline-flex min-h-11 items-center gap-2 rounded-1 text-body font-bold text-ink')}
                data-motion="druck"
              >
                <Icon name={icon} size="md" className="text-brand" />
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
            className={cn(styles.reihe, 'group flex min-h-14 items-center gap-4 rounded-1 py-2')}
            data-motion="druck"
          >
            <span className={styles.kasten}>
              <Icon name={icon} size="lg" />
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-etikett text-ink-2">{label}</span>
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
        <div className="flex flex-col gap-2">
          <p className="text-etikett text-ink-2">Dein Ansprechpartner</p>
          <p className={cn(styles.person, 'flex flex-col')}>
            <Rohrklammer className={styles.klammer} />
            <span className="text-title-3 text-brand">{person.name}</span>
            <span className="text-callout text-ink-muted">{person.role}</span>
          </p>
        </div>
      )}
      {rows}
      {hours}
    </div>
  );
}
