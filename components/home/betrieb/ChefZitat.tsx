import { Rohrklammer } from '@/components/zeichnung';
import { TEAM_QUOTES } from '@/lib/content/team';

/**
 * Zitat von Sabri Demir (ROADMAP §5.6, freigegeben): von der Rohrklammer gefasst wie die Zweitzeile im Einstieg
 * (Variante 1 `.klammer`: Vorlauf oben, Rücklauf unten). Bricolage spricht die Botschaft (K-003), die Klammer
 * folgt der Höhe des Zitats; dekorativ.
 */
export function ChefZitat() {
  const zitat = TEAM_QUOTES.demir;
  return (
    <figure className="flex flex-col gap-4 pl-8">
      <blockquote className="relative text-title-3 leading-snug text-ink">
        <span aria-hidden="true" className="pointer-events-none absolute top-[0.2em] bottom-[0.2em] -left-8">
          <Rohrklammer />
        </span>
        <p>„{zitat.quote}“</p>
      </blockquote>
      <figcaption className="text-callout">
        <span className="block font-bold text-brand">{zitat.name}</span>
        <span className="block text-ink-muted">{zitat.role}</span>
      </figcaption>
    </figure>
  );
}
