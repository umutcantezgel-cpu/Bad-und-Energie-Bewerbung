'use client';

import { useId, useState, useSyncExternalStore, type ReactNode } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/variants';
import { paketStatus, sichtbareZeilen, wunschUmschalten, type PaketRolle, type WunschId, type WunschOption } from './paket';

export interface PaketKonfiguratorTexte {
  rolleLegende: string;
  wunschLegende: string;
  wunschHinweis: string;
  paketEtikett: string;
  passtHinweis: string;
  stelleLink: string;
  /** „Als {titel} bewerben“ je Rolle, vom Server vorbereitet. */
  bewerben: Readonly<Record<string, string>>;
}

export interface PaketKonfiguratorProps {
  rollen: readonly PaketRolle[];
  wuensche: readonly WunschOption[];
  texte: PaketKonfiguratorTexte;
  /** Vom Server gerenderte Icons, damit die Glyphen nicht ins Client-Bundle wandern. */
  icons: { haken: ReactNode; pfeil: ReactNode; hoch: ReactNode; runter: ReactNode };
}

const leer = () => () => {};

/** Verweis-Link im Paket (wie der Zweitweg des Einstiegs): unterstrichen, 3 px, Hover im Rücklaufblau. */
const VERWEIS =
  'inline-flex min-h-11 items-center gap-2 rounded-1 font-bold text-ink underline decoration-(length:--m-strich) underline-offset-4 [@media(hover:hover)_and_(pointer:fine)]:hover:decoration-ruecklauf';

/**
 * Vorteils-Konfigurator (E-START-024 mit E-START-016): Die Rollenwahl (echte Radiogruppe) tauscht
 * die Paketzeilen ohne Seitenwechsel, die Wünsche (Checkboxen) markieren passende Zeilen und
 * blenden die passenden Fakten der Stelle oder einen Verweis auf den Block ein, der die Antwort trägt
 * (E-023). Das Ergebnis meldet eine Live-Region. Keine Bewegung: Zustände wechseln sofort.
 *
 * Ohne JavaScript steht das Paket der ersten Rolle da; Rollen und Wünsche sind bis zur Hydration
 * gesperrt, damit Auswahl und Paket nie auseinanderlaufen. Mobil folgt das Paket direkt auf die Rollenwahl
 * (Rolle → Paket → Wünsche), ab lg stehen Rolle und Wünsche links, das Paket rechts.
 */
export function PaketKonfigurator({ rollen, wuensche, texte, icons }: PaketKonfiguratorProps) {
  const name = useId();
  const bereit = useSyncExternalStore(leer, () => true, () => false);
  const [rolleId, setRolleId] = useState(rollen[0]?.id ?? '');
  const [auswahl, setAuswahl] = useState<WunschId[]>([]);
  const rolle = rollen.find((r) => r.id === rolleId) ?? rollen[0];
  if (!rolle) return null;

  const zeilen = sichtbareZeilen(rolle, auswahl);
  const status = paketStatus(rolle, zeilen, auswahl);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-x-8">
      <fieldset className="flex min-w-0 flex-col gap-3 lg:col-span-5 lg:row-start-1" disabled={!bereit}>
        <legend className="mb-3 text-body font-bold text-ink">{texte.rolleLegende}</legend>
        {rollen.map((r) => (
          <label
            key={r.id}
            className={[
              'group flex min-h-16 cursor-pointer items-center gap-4 rounded-2 px-4 py-3 has-disabled:cursor-default',
              'border-[length:var(--m-strich)] border-line bg-surface has-checked:border-brand',
              'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
            ].join(' ')}
          >
            <input
              type="radio"
              name={`${name}-rolle`}
              value={r.id}
              checked={r.id === rolle.id}
              onChange={() => setRolleId(r.id)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-voll border-[length:var(--m-strich)] border-brand"
            >
              <span className="size-2.5 rounded-voll bg-brand opacity-0 group-has-checked:opacity-100" />
            </span>
            <span className="min-w-0 text-title-3 text-balance text-brand">{r.anzeige}</span>
          </label>
        ))}
      </fieldset>

      <div className="flex min-w-0 flex-col rounded-2 border-[length:var(--m-strich)] border-brand bg-surface lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
        <div className="flex flex-col gap-1 border-b border-line px-4 py-4 sm:px-6">
          <p className="text-etikett text-ink-muted">{texte.paketEtikett}</p>
          <p className="text-title-2 text-brand">{rolle.anzeige}</p>
        </div>
        <dl className="divide-y divide-line">
          {zeilen.map((zeile) => (
            <div
              key={zeile.key}
              className={[
                'grid gap-1 px-4 py-4 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:gap-6 sm:px-6',
                zeile.passt ? 'bg-waerme' : '',
              ].join(' ')}
            >
              <dt className="flex items-center gap-2 text-etikett text-ink-muted sm:pt-1">
                {zeile.passt && <span className="text-brand">{icons.haken}</span>}
                {zeile.etikett}
              </dt>
              <dd className="text-body text-ink">
                {zeile.href ? (
                  <a href={zeile.href} className={VERWEIS}>
                    {zeile.text}
                    {zeile.richtung === 'hoch' ? icons.hoch : icons.runter}
                  </a>
                ) : (
                  zeile.text
                )}
                {zeile.passt && <span className="sr-only"> ({texte.passtHinweis})</span>}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-4 border-t border-line px-4 py-6 sm:px-6">
          <p role="status" aria-live="polite" className="text-callout text-ink-muted">
            {status}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={rolle.bewerbenHref}
              className={`${buttonVariants({ variant: 'contrast', size: 'lg', wrap: true })} w-full sm:w-auto`}
            >
              {texte.bewerben[rolle.id] ?? rolle.titel}
              {icons.pfeil}
            </Link>
            <Link
              href={rolle.stelleHref}
              className="inline-flex min-h-11 items-center rounded-1 text-callout font-bold text-ink underline decoration-1 underline-offset-4"
            >
              {texte.stelleLink}
              <span className="sr-only">: {rolle.titel}</span>
            </Link>
          </div>
        </div>
      </div>

      <fieldset
        className="flex min-w-0 flex-col gap-3 lg:col-span-5 lg:row-start-2"
        aria-describedby={`${name}-hinweis`}
        disabled={!bereit}
      >
        <legend className="mb-1 text-body font-bold text-ink">{texte.wunschLegende}</legend>
        <p id={`${name}-hinweis`} className="text-callout text-ink-muted">
          {texte.wunschHinweis}
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {wuensche.map((w) => (
            <label
              key={w.id}
              className={[
                'group flex min-h-12 cursor-pointer items-center gap-3 rounded-2 px-4 py-2 has-disabled:cursor-default',
                'border-[length:var(--m-strich)] border-line bg-surface text-body font-bold text-ink',
                'has-checked:border-brand has-checked:bg-waerme',
                'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
              ].join(' ')}
            >
              <input
                type="checkbox"
                value={w.id}
                checked={auswahl.includes(w.id)}
                onChange={(event) => setAuswahl((alt) => wunschUmschalten(alt, w.id, event.target.checked))}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={[
                  'grid size-6 shrink-0 place-items-center rounded-1 border-[length:var(--m-strich)] border-brand',
                  'text-surface group-has-checked:bg-brand',
                ].join(' ')}
              >
                <span className="opacity-0 group-has-checked:opacity-100">{icons.haken}</span>
              </span>
              {w.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
