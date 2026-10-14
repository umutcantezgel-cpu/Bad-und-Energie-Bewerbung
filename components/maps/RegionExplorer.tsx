'use client';

import dynamic from 'next/dynamic';
import { useId, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { Masskette } from '@/components/zeichnung/Masskette';
import { findCommute, formatKm, formatMinutes } from '@/lib/maps/commute';
import { mapsConsent } from '@/lib/maps/consent';
import { cn } from '@/lib/utils/cn';
import { RadiusGraphic } from './RadiusGraphic';
import { mapsStatusText, outsideRing, radiusStatus, zoneLabel } from './status';
import type { MapStatus, RegionMapData, RegionPlace } from './types';

// The Google chunk (component + loader) is fetched only once it renders, i.e. after consent.
const GoogleRegionMap = dynamic(() => import('./GoogleRegionMap'), { ssr: false });

export interface RegionExplorerProps {
  data: RegionMapData;
  /** False when no Maps key is configured: no consent button, the radius graphic only. */
  mapsAvailable: boolean;
  /** Section heading (server-rendered): first on phones, across both columns from lg. */
  header?: ReactNode;
  /** „Alle Orte als Tabelle“ under the choice (default). The Einsatzgebiet page lists the places itself. */
  table?: boolean;
  /** Places the plan names first (overview /einsatzgebiet: the larger towns); omitted: from the outside in. */
  labelPriority?: readonly string[];
  /**
   * The rating „Kerngebiet“ / „Regionales Einsatzgebiet“ in the result and the table (home map, ALT-START-362).
   * The overview /einsatzgebiet leaves it out: its places carry no such rating anywhere else (Kritik 2).
   */
  zones?: boolean;
  className?: string;
}

/** Up to this many places the choice is a grid of cards (home map: 10); more get a select (Einsatzgebiet: all). */
export const MAX_PLACE_CARDS = 12;

const serverConsent = () => false;
const NBSP = '\u00A0';
const noSubscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * True once the explorer runs in the browser. Before that (and without JavaScript) switch, place cards and
 * map button are disabled: nothing looks choosable that would not change plan and result (E-START-039).
 */
function useHydrated(): boolean {
  return useSyncExternalStore(noSubscribe, onClient, onServer);
}

/**
 * Einsatzgebiet (B Runde 1 „.gebiet“): radius switch 15/25/35 km, the plan, the result, the place choice
 * („Wo wohnst du?“) and all places as a table. Phones: heading, switch, plan, result, places, table (the
 * result sits right under the plan, as in B Runde 1). From lg: the plan stays in the right column (sticky).
 */
export function RegionExplorer({ data, mapsAvailable, header, table = true, labelPriority, zones = true, className }: RegionExplorerProps) {
  const id = useId();
  const [radiusKm, setRadiusKm] = useState(data.radiusKm);
  const [selectedId, setSelectedId] = useState('');
  const [mapStatus, setMapStatus] = useState<MapStatus>('loading');
  const [hiddenByUser, setHiddenByUser] = useState(false);
  const consent = useSyncExternalStore(mapsConsent.subscribe, mapsConsent.get, serverConsent);
  const hydrated = useHydrated();

  // A failure, also after ready (Google's error dialog, e.g. BillingNotEnabledMapError), brings the graphic back.
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

  const status = mapsStatusText({ mapsAvailable, consent, hiddenByUser, mapStatus });

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
          disabled={!hydrated}
          onChange={setRadiusKm}
        />

        <CommuteResult className="order-4" data={data} selected={selected} radiusKm={radiusKm} interactive={hydrated} zones={zones} />

        {data.places.length > MAX_PLACE_CARDS ? (
          <PlaceSelect
            className="order-5"
            id={`${id}-auswahl`}
            places={data.places}
            selectedId={selected?.id ?? ''}
            disabled={!hydrated}
            onSelect={setSelectedId}
          />
        ) : (
          <PlaceChoice
            className="order-5"
            name={`${id}-ort`}
            places={data.places}
            radiusKm={radiusKm}
            selectedId={selected?.id ?? ''}
            disabled={!hydrated}
            onSelect={setSelectedId}
          />
        )}

        {table && <PlaceTable className="order-6" data={data} selected={selected} zones={zones} />}
      </div>

      {/* Tablet: the plan keeps a readable size instead of filling 700 px (sm–lg). Under 22rem it runs edge to edge
          (graphic.ts KARTE_RANDLOS_REM): within the gutters it would draw its names below 12 px. The square is the content box
          then, so the borders above and below do not shrink the drawing. */}
      <figure className="order-3 m-0 flex w-full flex-col gap-3 sm:mx-auto sm:max-w-lg lg:sticky lg:top-24 lg:mx-0 lg:max-w-none">
        <div
          className="karte-rahmen relative aspect-square w-full overflow-hidden rounded-2 border-2 border-brand bg-surface-raised max-[22rem]:-mx-gutter max-[22rem]:box-content max-[22rem]:w-auto max-[22rem]:rounded-none max-[22rem]:border-x-0"
          data-karte-rahmen=""
        >
          <RadiusGraphic
            data={data}
            view={view}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            titleId={`${id}-title`}
            descId={`${id}-desc`}
            labelPriority={labelPriority}
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
        {/* E-023: die Radien stehen an den Ringen und am Umschalter, hier nur die Lesart */}
        <figcaption className="max-w-prose text-footnote text-ink-muted">
          {`Kreise in Luftlinie um ${data.centerName}. Lahn, Dill, A45 und B49 schematisch.`}
        </figcaption>

        {mapsAvailable && (
          <div className="flex flex-col items-start gap-2">
            <Button
              variant="outline"
              disabled={!hydrated}
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
                  {/* Eigener Wortlaut (V6-B): „Datenschutz“ im Fuß führt auf /datenschutz, dieser Link zum Abschnitt der Karte. */}
                  <TextLink href="/datenschutz#google-maps" tone="muted">
                    Datenschutzhinweise zur Karte
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
  /** Before hydration (and without JavaScript) the switch shows the default radius and cannot change. */
  disabled?: boolean;
  onChange: (km: number) => void;
  className?: string;
}

/**
 * E-START-033: a real radio group; the plan zooms to the chosen ring. Focus (K-011): the whole segment
 * frame gets the ring (3 px, 3 px away, on paper, so nothing clips it and it keeps ≥ 3:1), and the
 * focused segment underlines its value; in a radio group the focused segment is the chosen one.
 */
function RadiusSwitch({ name, radii, value, centerName, disabled, onChange, className }: RadiusSwitchProps) {
  return (
    <fieldset disabled={disabled} className={cn('m-0 min-w-0 border-0 p-0', className)}>
      <legend className="mb-3 p-0 text-etikett text-ink-2">{`Radius um ${centerName}`}</legend>
      <div
        className={cn(
          'flex max-w-sm overflow-hidden rounded-2 border-2 border-brand',
          'has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-focus',
        )}
      >
        {radii.map((km, i) => (
          <label
            key={km}
            data-motion="druck"
            className={cn(
              'relative flex min-h-12 flex-1 cursor-pointer items-center justify-center bg-surface-raised font-mass text-body font-semibold text-brand',
              'has-checked:bg-brand has-checked:text-surface',
              'has-focus-visible:underline has-focus-visible:decoration-2 has-focus-visible:underline-offset-4',
              'hover:bg-surface-2 has-checked:hover:bg-brand has-disabled:cursor-default has-disabled:hover:bg-surface-raised has-checked:has-disabled:hover:bg-brand',
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
  /** Before hydration (and without JavaScript) the cards are a plain list: name, km, minutes. */
  disabled?: boolean;
  onSelect: (id: string) => void;
  className?: string;
}

/** „Wo wohnst du?“ as a radio group of place cards (≥ 64 px): name, distance, drive time. */
function PlaceChoice({ name, places, radiusKm, selectedId, disabled, onSelect, className }: PlaceChoiceProps) {
  return (
    <fieldset disabled={disabled} className={cn('m-0 min-w-0 border-0 p-0', className)}>
      <legend className="mb-3 p-0 text-title-3 text-brand">Wo wohnst du?</legend>
      <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-2">
        {places.map((place) => {
          const outside = outsideRing(place, radiusKm);
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
                  'hover:border-brand has-disabled:cursor-default has-disabled:hover:border-line-strong',
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
                  {outside && <span className="sr-only">{` (in Luftlinie außerhalb von ${radiusKm}${NBSP}km)`}</span>}
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

interface PlaceSelectProps {
  id: string;
  places: readonly RegionPlace[];
  selectedId: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
  className?: string;
}

/**
 * „Wo wohnst du?“ for many places (Einsatzgebiet: all measured places): a native select in alphabetical order, each
 * option with distance and drive time. Before hydration (and without JavaScript) it is disabled like the cards.
 */
function PlaceSelect({ id, places, selectedId, disabled, onSelect, className }: PlaceSelectProps) {
  const sorted = [...places].sort((a, b) => a.name.localeCompare(b.name, 'de'));
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <label htmlFor={id} className="text-title-3 text-brand">
        Wo wohnst du?
      </label>
      <div className="relative max-w-md">
        <select
          id={id}
          value={selectedId}
          disabled={disabled}
          onChange={(event) => onSelect(event.target.value)}
          className={cn(
            'min-h-12 w-full cursor-pointer appearance-none rounded-2 border-2 border-brand bg-surface-raised py-3 pr-12 pl-4 text-body text-ink',
            'focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus disabled:cursor-default',
          )}
        >
          <option value="">Ort wählen</option>
          {sorted.map((place) => (
            <option key={place.id} value={place.id}>
              {`${place.name} (${formatKm(place.distanceKm)}, ${formatMinutes(place.commuteMinutes)})`}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size="md" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-brand" />
      </div>
    </div>
  );
}

interface CommuteResultProps {
  data: RegionMapData;
  selected: RegionPlace | undefined;
  radiusKm: number;
  /** False before hydration (and without JavaScript): no choice possible, so no request to choose. */
  interactive: boolean;
  /** Shows the rating „Kerngebiet“ / „Regionales Einsatzgebiet“ (home map). */
  zones: boolean;
  className?: string;
}

/**
 * Result of the choice (aria-live): distance and drive time as Maßketten (components/zeichnung, as at the
 * Einstieg), ring, rating, short description.
 */
function CommuteResult({ data, selected, radiusKm, interactive, zones, className }: CommuteResultProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={cn('min-h-22 rounded-2 border-2 border-brand bg-surface-raised px-6 py-6', className)}
    >
      {selected ? (
        <div className="flex flex-col gap-4">
          <p className="text-title-3 text-brand">{selected.name}</p>
          {/* Maßketten wie am Einstieg: Wert, Maßlinie, Name; im DOM „27 km Strecke ca.“ (wie auf den Ortsseiten) */}
          <p className="m-0 flex flex-wrap items-start gap-x-8 gap-y-6">
            <Masskette className="min-w-0 flex-1 basis-32" groesse="gross" wert={formatKm(selected.distanceKm)} name="Strecke ca." />
            <Masskette
              className="min-w-0 flex-1 basis-32"
              groesse="gross"
              wert={formatMinutes(selected.commuteMinutes)}
              name={`Fahrzeit bis ${data.centerName}${NBSP}ca.`}
            />
          </p>
          <p className="text-callout font-semibold text-ink">{radiusStatus(selected, radiusKm, data.radii)}</p>
          {(zones || selected.character) && (
            <p className="flex flex-col gap-1 text-callout text-ink-muted">
              {zones && <span className="text-etikett text-ink-2">{zoneLabel(selected)}</span>}
              {selected.character && <span>{selected.character}</span>}
            </p>
          )}
          {selected.href && (
            <TextLink href={selected.href} standalone className="self-start">
              {`Mehr zu ${selected.name}`}
              <Icon name="arrow-right" size="sm" className="shrink-0" />
            </TextLink>
          )}
        </div>
      ) : (
        <p className="text-callout text-ink-muted">
          {interactive
            ? `Wähle deinen Ort, dann siehst du Entfernung und Fahrzeit bis ${data.centerName}.`
            : `Entfernung und Fahrzeit bis ${data.centerName} stehen bei jedem Ort.`}
        </p>
      )}
    </div>
  );
}

interface PlaceTableProps {
  data: RegionMapData;
  selected: RegionPlace | undefined;
  zones: boolean;
  className?: string;
}

/** All places with postal code, rating, distance and drive time; the chosen row is marked. */
function PlaceTable({ data, selected, zones, className }: PlaceTableProps) {
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
                      {zones && ` · ${zoneLabel(place)}`}
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
