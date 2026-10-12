import { Rohrklammer } from '@/components/zeichnung';
import { getReleasedQuote } from '@/lib/content/team';

/**
 * Zitat von Sabri Demir (ROADMAP §5.6): von der Rohrklammer gefasst wie die Zweitzeile im Einstieg
 * (Variante 1 `.klammer`: Vorlauf oben, Rücklauf unten). Bricolage spricht die Botschaft (K-003), die Klammer
 * folgt der Höhe des Zitats; dekorativ. Das bisherige Zitat nennt Feierabend und ist ausgeblendet, bis der
 * Inhaber ein neues freigibt (fakten-abgleich B30); bis dahin rendert der Block nichts.
 */
export function ChefZitat() {
  const zitat = getReleasedQuote('demir');
  if (!zitat) return null;
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
