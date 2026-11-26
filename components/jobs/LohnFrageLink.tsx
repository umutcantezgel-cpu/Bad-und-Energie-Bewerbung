import { TextLink } from '@/components/ui/TextLink';
import type { Job } from '@/lib/jobs/registry';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import { LOHN_WHATSAPP_LINK, lohnWhatsAppNachricht } from './stelle/stelle-text';

export interface LohnFrageLinkProps {
  job: Pick<Job, 'pay' | 'category' | 'title' | 'shortTitle'>;
  className?: string;
}

/**
 * „Lohn per WhatsApp erfragen“ (Prüfung Sichtbarkeit, bewerbung5): Wo „Lohn auf Anfrage“ steht, führt ein Textlink
 * direkt zur Frage, an die Nummer der Seite (Sabri Demir, wie die Kontaktkarte), nicht an die des schwebenden Knopfs.
 * Neuer Tab wie die übrigen WhatsApp-Links (target, rel, Zusatz für Screenreader). Kein Betrag, keine neue Aussage;
 * das Schülerpraktikum sagt nichts zu Geld, dann kein Link. Nur Server: die Nummer bleibt aus Client-Inseln heraus.
 * Kopf und FAQ einer Stellenseite bauen dieselbe Adresse, so hat der Ankertext auf der Seite genau ein Ziel.
 */
export function LohnFrageLink({ job, className }: LohnFrageLinkProps) {
  if (job.pay !== 'auf-anfrage') return null;
  return (
    <TextLink
      href={buildWhatsAppUrl(lohnWhatsAppNachricht(job))}
      target="_blank"
      rel="noopener noreferrer"
      standalone
      className={className}
    >
      {LOHN_WHATSAPP_LINK}
      <span className="sr-only"> (öffnet in neuem Tab)</span>
    </TextLink>
  );
}
