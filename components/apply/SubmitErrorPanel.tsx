import { Icon } from '@/components/icons';
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
 * Ehrlicher Fehlerzustand (ROADMAP §6, KERN K-011 „Fehler“): Icon, was passiert ist, warum, und der nächste
 * Schritt. Die Angaben bleiben erhalten; Auswege sind Anrufen und WhatsApp mit vorausgefülltem Text. Es steht
 * direkt unter dem Absenden-Knopf, damit der Knopf beim Fehler nicht verrutscht. Erneut senden ist dieser
 * Knopf (er heißt dann „Erneut senden“, wenn das helfen kann); hier gibt es keinen zweiten dafür. Nur wenn
 * erst ein Neuladen hilft (z. B. CSRF), steht hier „Seite neu laden“. Fläche der Fehlerrolle mit 3-px-Kante
 * links wie eine Leitung, Farbe nur zusätzlich zum Text. role="alert", damit Screenreader sofort vorlesen.
 */
export function SubmitErrorPanel({ failure, phoneHref, whatsappHref, overrides, className }: SubmitErrorPanelProps) {
  const { detail, action } = describeFailure(failure, overrides);
  return (
    <div
      role="alert"
      className={cn('flex flex-col gap-4 rounded-r-2 border-l-3 border-danger bg-danger-subtle p-4 text-ink', className)}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
        <Icon name="circle-alert" size="md" className="mt-0.5 text-danger" />
        <p className="text-body font-bold">Das hat nicht geklappt. Deine Angaben sind noch da.</p>
        <p className="col-start-2 text-callout">{detail}</p>
      </div>
      {action === 'reload' && (
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()} className="ml-8 gap-2 self-start">
          <Icon name="rotate-cw" size="sm" />
          Seite neu laden
        </Button>
      )}
      <div className="flex flex-col gap-2 pl-8">
        <p className="text-etikett text-ink-2">Oder direkt</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2 bg-surface">
            <a href={phoneHref}>
              <Icon name="phone" size="sm" className="text-brand" />
              Anrufen
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2 bg-surface">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Icon name="message-circle" size="sm" className="text-brand" />
              Per WhatsApp senden
              <span className="sr-only"> (öffnet WhatsApp)</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
