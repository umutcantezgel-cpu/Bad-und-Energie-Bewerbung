'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Sheet } from '@/components/ui/Sheet';
import { buildWhatsAppUrl, whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';
import { APPLY_PATH, NAV_ITEMS, isCurrentNavItem } from './nav';

export interface MobileNavProps {
  phone: { display: string; href: string };
  className?: string;
}

const contactLinkClass =
  'flex min-h-12 items-center gap-3 rounded-xs text-body font-medium text-ink underline-offset-4 hover:underline';

/** Menu button below lg; opens a sheet with the page links, phone, WhatsApp and the primary action. */
export function MobileNav({ phone, className }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <div className={className}>
      <IconButton
        aria-label="Menü"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="-mr-2.5"
      >
        <Menu aria-hidden="true" strokeWidth={1.75} className="size-6" />
      </IconButton>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Menü"
        footer={
          <Button asChild size="lg" fullWidth>
            <Link href={APPLY_PATH} onClick={close}>
              Jetzt bewerben
            </Link>
          </Button>
        }
      >
        <nav aria-label="Hauptnavigation">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const current = isCurrentNavItem(item, pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={current ? 'page' : undefined}
                    className="flex min-h-14 items-center rounded-xs text-title-2 text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-6 flex flex-col border-t border-line pt-4">
          <a href={phone.href} className={contactLinkClass}>
            <Phone aria-hidden="true" strokeWidth={1.75} className="size-5 text-ink-muted" />
            <span className="tabular-nums">{phone.display}</span>
            <span className="sr-only"> anrufen</span>
          </a>
          <a
            href={buildWhatsAppUrl(whatsAppMessageFor(pathname ?? '/'))}
            target="_blank"
            rel="noopener noreferrer"
            className={contactLinkClass}
          >
            <MessageCircle aria-hidden="true" strokeWidth={1.75} className="size-5 text-ink-muted" />
            WhatsApp
            <span className="sr-only"> (öffnet in neuem Tab)</span>
          </a>
        </div>
      </Sheet>
    </div>
  );
}
