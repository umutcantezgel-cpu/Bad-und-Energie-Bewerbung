'use client';

import dynamic from 'next/dynamic';
import { useId, useState, useSyncExternalStore, type ChangeEvent } from 'react';
import { Check, ChevronDown, EyeOff, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, useFieldControl } from '@/components/ui/Field';
import { controlClasses, controlStyle } from '@/components/ui/Input';
import { TextLink } from '@/components/ui/TextLink';
import { findCommute, formatCommute, formatKm, formatMinutes } from '@/lib/maps/commute';
import { mapsConsent } from '@/lib/maps/consent';
import { cn } from '@/lib/utils/cn';
import { RadiusGraphic } from './RadiusGraphic';
import type { RegionMapData, RegionPlace } from './types';

// The Google chunk (component + loader) is fetched only once it renders, i.e. after consent.
const GoogleRegionMap = dynamic(() => import('./GoogleRegionMap'), { ssr: false });

type MapStatus = 'loading' | 'ready' | 'failed';

export interface RegionExplorerProps {
  data: RegionMapData;
  /** False when no Maps key is configured: no consent button, the radius graphic only. */
  mapsAvailable: boolean;
  className?: string;
}

const serverConsent = () => false;

export function RegionExplorer({ data, mapsAvailable, className }: RegionExplorerProps) {
  const id = useId();
  const [selectedId, setSelectedId] = useState('');
  const [mapStatus, setMapStatus] = useState<MapStatus>('loading');
  const [hiddenByUser, setHiddenByUser] = useState(false);
  const consent = useSyncExternalStore(mapsConsent.subscribe, mapsConsent.get, serverConsent);

  const showGoogle = mapsAvailable && consent && mapStatus !== 'failed';
  const mapReady = showGoogle && mapStatus === 'ready';
  const selected = selectedId ? findCommute(selectedId, data.places) : undefined;

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
    <div className={cn('grid items-start gap-10 lg:grid-cols-2 lg:gap-16', className)}>
      <div className="flex flex-col gap-5">
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <RadiusGraphic
            data={data}
            selectedId={selected?.id ?? null}
            titleId={`${id}-title`}
            descId={`${id}-desc`}
            className={cn(mapReady && 'invisible')}
          />
          {showGoogle && (
            <GoogleRegionMap
              selectedId={selected?.id ?? null}
              hidden={!mapReady}
              className="absolute inset-0"
              onReady={() => setMapStatus('ready')}
              onFail={() => setMapStatus('failed')}
              onSelect={setSelectedId}
            />
          )}
        </div>

        {mapsAvailable && (
          <div className="flex flex-col items-start gap-2">
            <Button
              variant="outline"
              onClick={consent ? hideMap : loadMap}
              aria-describedby={`${id}-maps-note`}
              className="h-auto min-h-11 whitespace-normal py-2.5 text-left"
            >
              {consent ? (
                <>
                  <EyeOff aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0" />
                  Karte wieder ausblenden
                </>
              ) : (
                <>
                  <MapIcon aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0" />
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
      </div>

      <CommuteCalculator data={data} selected={selected} onSelect={setSelectedId} />
    </div>
  );
}

interface CommuteCalculatorProps {
  data: RegionMapData;
  selected: RegionPlace | undefined;
  onSelect: (id: string) => void;
}

/** "Wo wohnst du?" plus the place list: Ort · Entfernung · Fahrzeit (from REGION only). */
function CommuteCalculator({ data, selected, onSelect }: CommuteCalculatorProps) {
  const options = [...data.places].sort((a, b) => a.name.localeCompare(b.name, 'de'));

  return (
    <div className="flex flex-col gap-6">
      <Field
        label="Wo wohnst du?"
        hint={`Dein Ort fehlt? Wir arbeiten im Umkreis von ${data.radiusKm} km um ${data.centerName}.`}
      >
        <PlaceSelect places={options} value={selected?.id ?? ''} onChange={onSelect} />
      </Field>

      <div aria-live="polite" aria-atomic="true" className="min-h-22 rounded-lg bg-surface-2 px-5 py-4">
        {selected ? (
          <>
            <p className="text-callout text-ink-muted">{selected.name}</p>
            <p className="text-lead font-semibold tabular-nums text-ink">{formatCommute(selected, data.centerName)}</p>
          </>
        ) : (
          <p className="text-callout text-ink-muted">
            Wähle deinen Ort, dann siehst du Entfernung und Fahrzeit bis {data.centerName}.
          </p>
        )}
      </div>

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
                  <span className={cn('inline-flex items-center gap-2', isSelected ? 'font-semibold text-ink' : 'text-ink')}>
                    {isSelected && <Check aria-hidden="true" strokeWidth={2.25} className="size-4 shrink-0" />}
                    {place.name}
                  </span>
                  <span className="ml-2 text-footnote tabular-nums text-ink-muted">{place.postalCode}</span>
                </th>
                <td className="py-3 pr-4 text-right tabular-nums text-ink">{formatKm(place.distanceKm)}</td>
                <td className="py-3 pr-2 text-right tabular-nums text-ink">{formatMinutes(place.commuteMinutes)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface PlaceSelectProps {
  places: readonly RegionPlace[];
  value: string;
  onChange: (id: string) => void;
}

function PlaceSelect({ places, value, onChange }: PlaceSelectProps) {
  const controlProps = useFieldControl({});
  return (
    <div className="relative">
      <select
        {...controlProps}
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
        className={cn(controlClasses, 'h-13 appearance-none pr-12 pl-4')}
        style={controlStyle()}
      >
        <option value="">Ort auswählen</option>
        {places.map((place) => (
          <option key={place.id} value={place.id}>
            {`${place.name} (${place.postalCode})`}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-muted"
      />
    </div>
  );
}
