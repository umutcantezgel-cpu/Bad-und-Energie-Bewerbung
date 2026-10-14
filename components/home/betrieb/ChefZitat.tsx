import { getReleasedQuote } from '@/lib/content/team';

/**
 * Zitat von Sabri Demir (ROADMAP §5.6): Bricolage spricht die Botschaft (K-003), eine Linie in der Markenrolle
 * (Linienart Kontur) steht links am Zitat; seit E-029 ohne Rohrklammer. Das bisherige Zitat nennt Feierabend und ist
 * ausgeblendet, bis der Inhaber ein neues freigibt (fakten-abgleich B30); bis dahin rendert der Block nichts.
 */
export function ChefZitat() {
  const zitat = getReleasedQuote('demir');
  if (!zitat) return null;
  return (
    <figure className="flex flex-col gap-4 border-l-(length:--m-kontur) border-brand pl-6">
      <blockquote className="text-title-3 leading-snug text-ink">
        <p>„{zitat.quote}“</p>
      </blockquote>
      <figcaption className="text-callout">
        <span className="block font-bold text-brand">{zitat.name}</span>
        <span className="block text-ink-muted">{zitat.role}</span>
      </figcaption>
    </figure>
  );
}
