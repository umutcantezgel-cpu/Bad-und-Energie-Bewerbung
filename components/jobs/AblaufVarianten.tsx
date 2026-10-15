import { ANDERE_ABLAEUFE_TITEL, type AblaufVariante } from '@/lib/content';
import { cn } from '@/lib/utils/cn';

/**
 * Was bei den anderen Stellen anders läuft (lib/content/process.ts sammelAblauf), unter dem Ablauf der Fachkräfte auf
 * einer Sammelfläche: je Stellenart unter den gezeigten Stellen die abweichenden Schritte im Wortlaut. Ohne Variante
 * nichts (dann gibt es nur Fachkräfte und Schritt 3 trägt keinen Bezug).
 */
export function AblaufVarianten({
  varianten,
  ebene = 'h3',
  className,
}: {
  varianten: readonly AblaufVariante[];
  /** Überschriftenebene unter der des Ablaufs. */
  ebene?: 'h3' | 'h4';
  className?: string;
}) {
  if (varianten.length === 0) return null;
  const Ueberschrift = ebene;
  return (
    <div className={cn('flex flex-col gap-4 border-t border-line pt-8', className)} data-ablauf-varianten="">
      <Ueberschrift className="text-title-3 text-brand">{ANDERE_ABLAEUFE_TITEL}</Ueberschrift>
      <dl className="grid gap-6 md:grid-cols-2 md:gap-x-12">
        {varianten.map((variante) => (
          <div key={variante.audience} className="flex flex-col gap-2">
            <dt className="text-etikett text-ink-muted">{variante.name}</dt>
            <dd className="max-w-prose text-body text-ink">{variante.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
