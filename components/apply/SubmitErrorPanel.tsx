import { CircleAlert, MessageCircle, Phone, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { describeFailure, type FailureOverrides } from '@/lib/apply/failure';
import type { SubmitFailure } from '@/lib/apply/submit';
import { cn } from '@/lib/utils/cn';

export interface SubmitErrorPanelProps {
  failure: SubmitFailure;
  phoneHref: string;
  /** WhatsApp-Link mit dem kompletten Text der Bewerbung bzw. Ergänzung. */
  whatsappHref: string;
  /** Eigene Texte je Fehlercode (z. B. für die Mappe im Flow). */
  overrides?: FailureOverrides;
  className?: string;
}

/**
 * Ehrlicher Fehlerzustand (ROADMAP §6): Angaben bleiben erhalten, dazu die Auswege Anrufen und
 * WhatsApp mit vorausgefülltem Text. Es steht direkt unter dem Absenden-Button, damit der Button beim
 * Fehler nicht verrutscht. Erneut senden ist dieser Button (er heißt dann „Erneut senden“, wenn das
 * helfen kann); hier gibt es keinen zweiten Knopf dafür. Nur wenn erst
 * ein Neuladen hilft (z. B. CSRF), steht hier „Seite neu laden“. role="alert", damit
 * Screenreader den Fehler sofort vorlesen.
 */
export function SubmitErrorPanel({ failure, phoneHref, whatsappHref, overrides, className }: SubmitErrorPanelProps) {
  const { detail, action } = describeFailure(failure, overrides);
  return (
    <div role="alert" className={cn('flex flex-col gap-4 rounded-md bg-danger-subtle p-4 text-ink', className)}>
      <div className="flex gap-3">
        <CircleAlert aria-hidden="true" strokeWidth={2} className="mt-0.5 size-5 shrink-0 text-danger" />
        <div className="flex flex-col gap-1">
          <p className="text-body font-semibold">Das hat nicht geklappt. Deine Angaben sind noch da.</p>
          <p className="text-callout">{detail}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {action === 'reload' && (
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            <RotateCw aria-hidden="true" strokeWidth={2} className="size-4" />
            Seite neu laden
          </Button>
        )}
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
