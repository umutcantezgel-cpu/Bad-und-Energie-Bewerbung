'use client';

import dynamic from 'next/dynamic';
import { useId, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { findCommute, formatKm, formatMinutes } from '@/lib/maps/commute';
import { mapsConsent } from '@/lib/maps/consent';
import { cn } from '@/lib/utils/cn';
import { RadiusGraphic } from './RadiusGraphic';
import { radiusStatus, zoneLabel } from './status';
import type { RegionMapData, RegionPlace } from './types';

// The Google chunk (component + loader) is fetched only once it renders, i.e. after consent.
const GoogleRegionMap = dynamic(() => import('./GoogleRegionMap'), { ssr: false });

type MapStatus = 'loading' | 'ready' | 'failed';

export interface RegionExplorerProps {
  data: RegionMapData;
  /** False when no Maps key is configured: no consent button, the radius graphic only. */
  mapsAvailable: boolean;
  /** Section heading (server-rendered): first on phones, across both columns from lg. */
  header?: ReactNode;
  className?: string;
}

const serverConsent = () => false;
const NBSP = '\u00A0';

/**
 * Einsatzgebiet (B Runde 1 „.gebiet“): radius switch 15/25/35 km, the plan, the place choice
 * („Wo wohnst du?“) with result, and all places as a table. Phones: heading, switch, plan, places,
 * result, table. From lg: the plan stays in the right column (sticky).
 */
export function RegionExplorer({ data, mapsAvailable, header, className }: RegionExplorerProps) {
  const id = useId();
  const [radiusKm, setRadiusKm] = useState(data.radiusKm);
  const [selectedId, setSelectedId] = useState('');
  const [mapStatus, setMapStatus] = useState<MapStatus>('loading');
  const [hiddenByUser, setHiddenByUser] = useState(false);
  const consent = useSyncExternalStore(mapsConsent.subscribe, mapsConsent.get, serverConsent);

  const showGoogle = mapsAvailable && consent && mapStatus !== 'failed';
  const mapReady = showGoogle && mapStatus === 'ready';
  const selected = selectedId ? findCommute(selectedId, data.places) : undefined;
  const view = data.views[data.radii.indexOf(radiusKm)] ?? data.views[data.views.length - 1];

  const loadMap = () => {
    setMapStatus('loading');
    setHiddenByUser(false);
    mapsConsent.grant();
  };
  const hideMap = () => {
    mapsConsent.revoke();
    setMapStatus('loading');
    setHiddenByUser(true);
  };

  let status = '';
  if (mapsAvailable && consent) {
    if (mapStatus === 'loading') status = 'Google Maps wird geladen …';
    if (mapStatus === 'ready') status = 'Google Maps ist geladen.';
    if (mapStatus === 'failed') status = 'Google Maps ist gerade nicht verfügbar. Die Übersicht zeigt alle Orte.';
  } else if (hiddenByUser) {
    status = 'Google Maps ist ausgeblendet.';
  }

  return (
    <div className={cn('flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-16 lg:gap-y-12', className)}>
      {/* Heading across both columns from lg, so it keeps its two lines. */}
      {header && <div className="order-1 lg:col-span-2">{header}</div>}

      {/* Phones: the children of this column join the outer flex column and are ordered there. */}
      <div className="contents lg:order-2 lg:flex lg:flex-col lg:gap-8">
        <RadiusSwitch
          className="order-2"
          name={`${id}-radius`}
          radii={data.radii}
          value={radiusKm}
          centerName={data.centerName}
          onChange={setRadiusKm}
        />

        <PlaceChoice
          className="order-4"
          name={`${id}-ort`}
          places={data.places}
          radiusKm={radiusKm}
          selectedId={selected?.id ?? ''}
          onSelect={setSelectedId}
        />

        <CommuteResult className="order-5" data={data} selected={selected} radiusKm={radiusKm} />

        <PlaceTable className="order-6" data={data} selected={selected} />
      </div>

      <figure className="order-3 m-0 flex flex-col gap-3 lg:sticky lg:top-24">
        <div className="relative aspect-square w-full overflow-hidden rounded-2 border-2 border-brand bg-surface-raised">
          <RadiusGraphic
            data={data}
            view={view}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            titleId={`${id}-title`}
            descId={`${id}-desc`}
            className={cn(mapReady && 'invisible')}
          />
          {showGoogle && (
            <GoogleRegionMap
              selectedId={selected?.id ?? null}
              radiusKm={radiusKm}
              radii={data.radii}
              hidden={!mapReady}
              className="absolute inset-0"
              onReady={() => setMapStatus('ready')}
              onFail={() => setMapStatus('failed')}
              onSelect={setSelectedId}
            />
          )}
        </div>
        <figcaption className="max-w-prose text-footnote text-ink-muted">
          {`Kreise: ${data.radii.map((km) => `${km}${NBSP}km`).join(', ')} Luftlinie um ${data.centerName}. Lahn, Dill, A45 und B49 schematisch.`}
        </figcaption>

        {mapsAvailable && (
          <div className="flex flex-col items-start gap-2">
            <Button
              variant="outline"
              onClick={consent ? hideMap : loadMap}
              aria-describedby={`${id}-maps-note`}
              className="h-auto min-h-11 whitespace-normal py-3 text-left"
            >
              {consent ? (
                <>
                  <Icon name="eye-off" size="md" className="shrink-0" />
                  Karte wieder ausblenden
                </>
              ) : (
                <>
                  <Icon name="map" size="md" className="shrink-0" />
                  Interaktive Karte laden (Google Maps)
                </>
              )}
            </Button>
            <p id={`${id}-maps-note`} className="max-w-prose text-footnote text-ink-muted">
              {consent ? (
                'Deine Wahl gilt auf diesem Gerät, bis du die Karte wieder ausblendest.'
              ) : (
                <>
                  Erst nach dem Klick lädt Google Maps und erhält dabei Daten wie deine IP-Adresse, siehe{' '}
                  <TextLink href="/datenschutz#google-maps" tone="muted">
                    Datenschutz
                  </TextLink>
                  .
                </>
              )}
            </p>
            <p role="status" className="text-footnote text-ink-muted">
              {status}
            </p>
          </div>
        )}
      </figure>
    </div>
  );
}

interface RadiusSwitchProps {
  name: string;
  radii: readonly number[];
  value: number;
  centerName: string;
  onChange: (km: number) => void;
  className?: string;
}

/** E-START-033: a real radio group; the plan zooms to the chosen ring. */
function RadiusSwitch({ name, radii, value, centerName, onChange, className }: RadiusSwitchProps) {
  return (
    <fieldset className={cn('m-0 min-w-0 border-0 p-0', className)}>
      <legend className="mb-3 p-0 text-etikett text-ink-muted">{`Radius um ${centerName}`}</legend>
      <div className="flex max-w-sm overflow-hidden rounded-2 border-2 border-brand">
        {radii.map((km, i) => (
          <label
            key={km}
            data-motion="druck"
            className={cn(
              'relative flex min-h-12 flex-1 cursor-pointer items-center justify-center bg-surface-raised font-mass text-body font-semibold text-brand',
              'has-checked:bg-brand has-checked:text-surface',
              'has-focus-visible:z-10 has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-focus',
              'hover:bg-surface-2 has-checked:hover:bg-brand',
              i > 0 && 'border-l-2 border-brand',
            )}
          >
            <input
              type="radio"
              name={name}
              value={km}
              checked={value === km}
              onChange={() => onChange(km)}
              className="sr-only"
            />
            {`${km}${NBSP}km`}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface PlaceChoiceProps {
  name: string;
  places: readonly RegionPlace[];
  radiusKm: number;
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

/** „Wo wohnst du?“ as a radio group of place cards (≥ 64 px): name, distance, drive time. */
function PlaceChoice({ name, places, radiusKm, selectedId, onSelect, className }: PlaceChoiceProps) {
  return (
    <fieldset className={cn('m-0 min-w-0 border-0 p-0', className)}>
      <legend className="mb-3 p-0 text-title-3 text-brand">Wo wohnst du?</legend>
      <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-2">
        {places.map((place) => {
          const outside = place.distanceKm > radiusKm;
          const checked = place.id === selectedId;
          return (
            <li key={place.id} className="grid">
              <label
                data-motion="druck"
                className={cn(
                  'relative grid min-h-16 cursor-pointer content-center gap-1 rounded-2 border-2 py-2 pr-8 pl-3',
                  'border-line-strong bg-surface-raised text-ink',
                  outside && 'border-dashed',
                  'has-checked:border-brand has-checked:bg-brand has-checked:text-surface',
                  'has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-focus',
                  'hover:border-brand',
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={place.id}
                  checked={checked}
                  onChange={() => onSelect(place.id)}
                  className="sr-only"
                />
                <span className="text-callout font-bold leading-tight">
                  {place.name}
                  {outside && <span className="sr-only">{` (außerhalb von ${radiusKm}${NBSP}km)`}</span>}
                </span>
                <span
                  className={cn('flex flex-wrap gap-x-3 font-mass text-footnote', checked ? 'text-surface' : 'text-ink-muted')}
                >
                  <span className="whitespace-nowrap">{formatKm(place.distanceKm)}</span>
                  <span className="sr-only">, </span>
                  <span className="whitespace-nowrap">{formatMinutes(place.commuteMinutes)}</span>
                </span>
                {checked && <Icon name="check" size="sm" className="absolute top-2 right-2" />}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

interface CommuteResultProps {
  data: RegionMapData;
  selected: RegionPlace | undefined;
  radiusKm: number;
  className?: string;
}

/** Result of the choice (aria-live): distance and drive time as measures, ring, rating, short description. */
function CommuteResult({ data, selected, radiusKm, className }: CommuteResultProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={cn('min-h-22 rounded-2 border-2 border-brand bg-surface-raised px-6 py-4', className)}
    >
      {selected ? (
        <div className="flex flex-col gap-3">
          <p className="text-title-3 text-brand">{selected.name}</p>
          <dl className="m-0 flex flex-wrap gap-x-8 gap-y-2">
            <div className="flex flex-col-reverse">
              <dt className="text-footnote text-ink-muted">Entfernung ca.</dt>
              <dd className="m-0 text-numeral text-brand">{formatKm(selected.distanceKm)}</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-footnote text-ink-muted">{`Fahrzeit bis ${data.centerName} ca.`}</dt>
              <dd className="m-0 text-numeral text-brand">{formatMinutes(selected.commuteMinutes)}</dd>
            </div>
          </dl>
          <p className="text-callout font-semibold text-ink">{radiusStatus(selected, radiusKm, data.radii)}</p>
          <p className="flex flex-col gap-1 text-callout text-ink-muted">
            <span className="text-etikett">{zoneLabel(selected)}</span>
            {selected.character && <span>{selected.character}</span>}
          </p>
        </div>
      ) : (
        <p className="text-callout text-ink-muted">
          Wähle deinen Ort, dann siehst du Entfernung und Fahrzeit bis {data.centerName}.
        </p>
      )}
    </div>
  );
}

interface PlaceTableProps {
  data: RegionMapData;
  selected: RegionPlace | undefined;
  className?: string;
}

/** All places with postal code, rating, distance and drive time; the chosen row is marked. */
function PlaceTable({ data, selected, className }: PlaceTableProps) {
  return (
    <details className={cn('group', className)}>
      <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-1 font-semibold text-ink">
        <Icon name="chevron-down" size="sm" className="group-open:rotate-180" />
        Alle Orte als Tabelle
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-callout">
          <caption className="sr-only">{`Orte im Einsatzgebiet mit Entfernung und Fahrzeit bis ${data.centerName}`}</caption>
          <thead>
            <tr className="border-b border-line text-footnote text-ink-muted">
              <th scope="col" className="py-2 pr-4 pl-2 text-left font-medium">
                Ort
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                Entfernung
              </th>
              <th scope="col" className="py-2 pr-2 text-right font-medium">
                Fahrzeit
              </th>
            </tr>
          </thead>
          <tbody>
            {data.places.map((place) => {
              const isSelected = place.id === selected?.id;
              return (
                <tr
                  key={place.id}
                  aria-current={isSelected || undefined}
                  className={cn('border-b border-line', isSelected && 'bg-surface-2')}
                >
                  <th scope="row" className="py-3 pr-4 pl-2 text-left font-normal">
                    <span className={cn('inline-flex items-center gap-2 text-ink', isSelected && 'font-semibold')}>
                      {isSelected && <Icon name="check" size="sm" className="shrink-0" />}
                      {place.name}
                    </span>
                    <span className="block text-footnote text-ink-muted">
                      <span className="ziffer">{place.postalCode}</span>
                      {` · ${zoneLabel(place)}`}
                    </span>
                  </th>
                  <td className="py-3 pr-4 text-right font-mass text-ink">{formatKm(place.distanceKm)}</td>
                  <td className="py-3 pr-2 text-right font-mass text-ink">{formatMinutes(place.commuteMinutes)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
