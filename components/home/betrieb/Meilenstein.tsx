import { Fragment } from 'react';
import { mitZiffern } from '../einstieg/ziffern';
import { MEILENSTEIN } from './betrieb-text';

/**
 * E-START-031: Meilenstein 2026 als Maß wie an der Zeichnung des Einstiegs (Variante 1 `.mass`): der Wert in
 * Martian Mono, darunter die Planbeschriftung. Die Überschrift liest sich im DOM als „Meilenstein 2026“
 * (Screenreader, Seitensuche), sichtbar steht das Jahr über dem Wort. Darunter Wachstumsgrund und die zwei
 * Sätze aus REGION.milestone (Siegmund-Hiepe-Str. 20, größeres Lager, 15 Leute).
 */
export function Meilenstein({ id = 'meilenstein-titel' }: { id?: string }) {
  return (
    <div className="rounded-2 bg-surface-2 p-6 sm:p-8">
      <h3 id={id} className="flex flex-col-reverse items-start gap-1">
        <span className="text-etikett text-ink-muted">{MEILENSTEIN.wort}</span>{' '}
        <span className="font-mass text-numeral text-brand">{MEILENSTEIN.jahr}</span>
      </h3>
      <p className="mt-4 max-w-prose text-body text-ink">
        {MEILENSTEIN.text.split(MEILENSTEIN.strasse).map((teil, i) => (
          <Fragment key={i}>
            {i > 0 ? <span className="whitespace-nowrap">{mitZiffern(MEILENSTEIN.strasse)}</span> : null}
            {mitZiffern(teil)}
          </Fragment>
        ))}
      </p>
    </div>
  );
}
