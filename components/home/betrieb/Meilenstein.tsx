import { Fragment } from 'react';
import { mitZiffern } from '../einstieg/ziffern';
import { MEILENSTEIN } from './betrieb-text';

/**
 * E-START-031: Meilenstein 2026 als Maß wie an der Zeichnung des Einstiegs (Variante 1 `.mass`, Maßkette): der Wert
 * in Martian Mono, darunter Maßlinie und Planbeschriftung. Die Überschrift liest sich im DOM als „Meilenstein 2026“
 * (Screenreader, Seitensuche), sichtbar steht das Jahr über dem Wort. Darunter Wachstumsgrund und die zwei
 * Sätze aus REGION.milestone (Siegmund-Hiepe-Str. 20, größeres Lager, 15 Leute).
 */
export function Meilenstein({ id = 'meilenstein-titel' }: { id?: string }) {
  return (
    <div className="rounded-2 bg-surface-2 p-6 sm:p-8">
      {/* Maßkette wie am Einstieg (Wert, Maßlinie, Name), gespiegelt gesetzt: im DOM „Meilenstein 2026“. */}
      <h3 id={id} className="inline-flex flex-col-reverse items-start gap-1">
        <span className="text-etikett text-ink-2">{MEILENSTEIN.wort}</span>{' '}
        <span
          aria-hidden="true"
          className="relative block h-3 self-stretch border-x-(length:--m-strich) border-brand before:absolute before:inset-x-0 before:top-1/2 before:h-(--m-strich) before:-translate-y-1/2 before:bg-brand"
        />
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
