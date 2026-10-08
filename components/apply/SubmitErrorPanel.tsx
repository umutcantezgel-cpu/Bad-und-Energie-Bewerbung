import { CircleAlert, MessageCircle, Phone, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatRetryAfter, type SubmitFailure } from '@/lib/apply/submit';
import { cn } from '@/lib/utils/cn';

/** Zweiter Satz unter „Das hat nicht geklappt.“, passend zur Fehlerart. */
export function failureDetail(failure: SubmitFailure): string {
  switch (failure.kind) {
    case 'offline':
      return 'Du bist gerade offline. Sobald du wieder Netz hast, kannst du erneut senden.';
    case 'timeout':
    case 'network':
      return 'Die Verbindung ist abgebrochen. Sende es noch einmal oder melde dich direkt bei uns.';
    case 'rate_limited': {
      const wait = formatRetryAfter(failure.retryAfterSec);
      return wait
        ? `Zu viele Versuche in kurzer Zeit. Bitte versuch es in ${wait} noch einmal oder melde dich direkt.`
        : 'Zu viele Versuche in kurzer Zeit. Bitte versuch es gleich noch einmal oder melde dich direkt.';
    }
    case 'validation':
      return failure.message ?? 'Bitte prüfe deine Angaben.';
    default:
      return 'Unser Server antwortet gerade nicht. Sende es später noch einmal oder melde dich direkt bei uns.';
  }
}

export interface SubmitErrorPanelProps {
  failure: SubmitFailure;
  onRetry: () => void;
  phoneHref: string;
  /** WhatsApp-Link mit dem kompletten Text der Bewerbung bzw. Ergänzung. */
  whatsappHref: string;
  className?: string;
}

/**
 * Ehrlicher Fehlerzustand (ROADMAP §6): Angaben bleiben erhalten, dazu drei Auswege.
 * role="alert", damit Screenreader den Fehler sofort vorlesen.
 */
export function SubmitErrorPanel({ failure, onRetry, phoneHref, whatsappHref, className }: SubmitErrorPanelProps) {
  return (
    <div role="alert" className={cn('flex flex-col gap-4 rounded-md bg-danger-subtle p-4 text-ink', className)}>
      <div className="flex gap-3">
        <CircleAlert aria-hidden="true" strokeWidth={2} className="mt-0.5 size-5 shrink-0 text-danger" />
        <div className="flex flex-col gap-1">
          <p className="text-body font-semibold">Das hat nicht geklappt. Deine Angaben sind noch da.</p>
          <p className="text-callout">{failureDetail(failure)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCw aria-hidden="true" strokeWidth={2} className="size-4" />
          Erneut senden
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={phoneHref}>
            <Phone aria-hidden="true" strokeWidth={2} className="size-4" />
            Anrufen
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden="true" strokeWidth={2} className="size-4" />
            Per WhatsApp senden
            <span className="sr-only"> (öffnet WhatsApp)</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
